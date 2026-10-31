// Server-only layer for the live drakor source.
//
// Source: the public gist the user linked (drakor.mjs) is NOT an HTML scraper.
// It is a client for a private JSON API (the backend of a DrakorKu-style app).
// This file re-implements that client, with fixes the gist lacks:
//  - paginated episode fetching for detail (the gist's getDetail used the
//    unpaginated series endpoint and truncated long series)
//  - slug <-> numeric id mapping (the API is numeric, ZerDrakor routes are slugs)
//  - timeout + one retry + in-memory caching, so a slow upstream does not
//    blank every page and every Workers request does not re-hit the upstream
//  - the `days` field the gist dropped from categories, which is what makes
//    a real /jadwal possible, and the `suggested` field from post_detail,
//    which is what makes real "related" titles possible
//
// API KEY POLICY: the upstream key is public by the owner's decision, so a
// default is baked in below — deploys (incl. Cloudflare Workers rebuilds)
// work out of the box without setting any variable. Setting the
// DRAKOR_API_KEY env var still overrides it if the key ever rotates.
// Client components only ever call our /api/* routes, never this file.

import type { Drakor, Episode, Genre, RankingEntry, ScheduleEntry, VideoSource } from '@/types/donghua';

const BASE_URL = process.env.DRAKOR_API_BASE || 'https://kampretloh.top/v3';
const UA = 'Dalvik/7.1.12.1.0 (com.drakorku.dramakoreasubindo U; Android ; 20175 Build/NMF260)';
const ACCEPT = 'application/vnd.yourapi.v1.full+json';
const PAGE_SIZE = 20;

// Key publik milik upstream (bukan rahasia) — fallback bawaan supaya
// rebuild Workers tidak perlu set env var ulang; env override tetap menang.
const DEFAULT_API_KEY = 'cda11y63tfI7rwln8BLeiKTvjsD5g2Mox01RzkhQCEXSGWbqYO';

// ---------------------------------------------------------------- helpers

function apiKey(): string {
  return process.env.DRAKOR_API_KEY || DEFAULT_API_KEY;
}

async function upstream(path: string, params: Record<string, string | number | undefined> = {}): Promise<any> {
  const query = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') query.set(k, String(v));
  }
  query.set('api_key', apiKey());
  const url = `${BASE_URL}/${path}?${query}`;
  let lastErr: unknown = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': UA, Accept: ACCEPT, 'Cache-Control': 'max-age=0' },
        signal: AbortSignal.timeout(15000),
        cache: 'no-store',
      });
      if (!res.ok) throw new Error(`${path} failed (${res.status})`);
      return await res.json();
    } catch (e) {
      lastErr = e;
      if (attempt === 0) await new Promise((r) => setTimeout(r, 400));
    }
  }
  throw lastErr;
}

function pickItems(payload: any): any[] {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== 'object') return [];
  for (const k of ['latest_anime', 'posts', 'videos', 'tv']) {
    if (Array.isArray(payload[k])) return payload[k];
  }
  if (payload.post) return [payload.post];
  if (payload.tv) return [payload.tv];
  return [];
}

function parseEpisode(title: string | null | undefined): number | null {
  if (!title) return null;
  const m = title.match(/Eps(?:isode)?[.\s-]*(\d+)/i) || title.match(/\bEp[.\s-]*(\d+)/i);
  return m ? Number(m[1]) : null;
}

function stripHtml(html: string | null | undefined): string {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\\r\\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function nativeTitle(desc: string | null | undefined): string {
  if (!desc) return '';
  const m = desc.match(/Native Title:\s*([^\r\n<]+)/i);
  return m ? m[1].trim() : '';
}

function cleanSynopsis(desc: string | null | undefined): string {
  const text = stripHtml(desc);
  // desc_anime starts with an "Alternative Titles" block; drop it, keep the story.
  const idx = text.search(/Native Title:/i);
  if (idx >= 0) {
    const rest = text.slice(idx).split('\n').slice(1).join('\n').trim();
    if (rest) return rest;
  }
  return text;
}

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
    .replace(/^-|-$/g, '') || 'drakor';
}

/** Slug format for live titles: `<slugified-title>-<catId>`, e.g. `queen-of-tears-1234`. */
export function slugFor(catId: number | string, title: string): string {
  return `${slugify(title)}-${catId}`;
}

/** Extract a numeric series id from a slug (`title-1234`), a `cat-1234` id, or a bare id. */
export function parseCatId(slugOrId: string | null | undefined): number | null {
  if (!slugOrId) return null;
  const s = decodeURIComponent(String(slugOrId));
  const cat = s.match(/^cat-(\d+)$/);
  if (cat) return Number(cat[1]);
  if (/^\d+$/.test(s)) return Number(s);
  const tail = s.match(/-(\d+)$/);
  return tail ? Number(tail[1]) : null;
}

function mapStatus(raw: string | null | undefined): Drakor['status'] {
  const s = String(raw || '').toLowerCase();
  if (s.includes('ongoing') || s.includes('on-going')) return 'ongoing';
  if (s.includes('complete') || s.includes('completed') || s.includes('tamat')) return 'completed';
  return 'ongoing';
}

function splitGenres(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return String(raw)
    .split(',')
    .map((g) => g.trim())
    .filter(Boolean);
}

function num(v: unknown, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

const DAY_MAP: Record<string, ScheduleEntry['dayOfWeek']> = {
  Senin: 'Senin',
  Selasa: 'Selasa',
  Rabu: 'Rabu',
  Kamis: 'Kamis',
  Jumat: 'Jumat',
  Jumaat: 'Jumat',
  Sabtu: 'Sabtu',
  Minggu: 'Minggu',
  Sunday: 'Minggu',
  Monday: 'Senin',
  Tuesday: 'Selasa',
  Wednesday: 'Rabu',
  Thursday: 'Kamis',
  Friday: 'Jumat',
  Saturday: 'Sabtu',
};

export function normalizeDay(raw: unknown): ScheduleEntry['dayOfWeek'] | null {
  if (typeof raw !== 'string') return null;
  const d = DAY_MAP[raw.trim()];
  return d || null;
}

// ---------------------------------------------------------------- mapping

/** Map one raw category (series) object to the app's Drakor shape. */
export function mapCategory(c: any): Drakor {
  const catId = Number(c.cid ?? c.cat_id ?? c.id);
  const title = String(c.category_name || c.title || 'Tanpa Judul');
  const genres = splitGenres(c.genre);
  const total = num(c.video_count, 0);
  return {
    id: `cat-${catId}`,
    slug: slugFor(catId, title),
    title,
    hangulTitle: nativeTitle(c.desc_anime),
    alternativeTitles: [],
    synopsis: cleanSynopsis(c.desc_anime),
    posterUrl: c.category_image || c.image_landscape || '',
    bannerUrl: c.image_landscape || c.category_image || '',
    type: total === 1 ? 'movie' : 'series',
    status: mapStatus(c.status_video),
    genres,
    releaseYear: num(c.year, 0) || new Date().getFullYear(),
    network: '',
    director: undefined,
    cast: [],
    rating: num(c.rating, 0),
    views: 0,
    totalEpisodes: total,
    latestEpisode: total,
    subtitleLanguages: ['Sub Indo'],
    broadcastSchedule: normalizeDay(c.days) ? `${normalizeDay(c.days)}` : undefined,
    featured: false,
    isEditorPick: false,
    createdAt: String(c.new_date_time || c.date_time || ''),
    updatedAt: String(c.update_date_time || c.new_date_time || ''),
    episodes: [],
  };
}

/** Map one raw episode/video object to a series-level Drakor (used for latest/search). */
export function mapVideoToSeries(v: any): Drakor {
  const catId = Number(v.cat_id ?? v.cid);
  const title = String(v.category_name || v.video_title || 'Tanpa Judul');
  const ep = parseEpisode(v.video_title);
  const total = num(v.video_count, 0);
  const base: Drakor = {
    id: `cat-${catId}`,
    slug: slugFor(catId, title),
    title,
    hangulTitle: nativeTitle(v.desc_anime),
    alternativeTitles: [],
    synopsis: cleanSynopsis(v.desc_anime),
    posterUrl: v.category_image || v.video_thumbnail || v.image_landscape || '',
    bannerUrl: v.image_landscape || v.category_image || v.video_thumbnail || '',
    type: total === 1 ? 'movie' : 'series',
    status: mapStatus(v.status_video),
    genres: splitGenres(v.genre),
    releaseYear: num(v.year, 0) || new Date().getFullYear(),
    network: '',
    cast: [],
    rating: num(v.rating, 0),
    views: num(v.total_views, 0),
    totalEpisodes: total,
    latestEpisode: ep ?? total,
    subtitleLanguages: ['Sub Indo'],
    broadcastSchedule: normalizeDay(v.days) ? `${normalizeDay(v.days)}` : undefined,
    featured: false,
    isEditorPick: false,
    createdAt: String(v.date_time || ''),
    updatedAt: String(v.update_date_time || v.date_time || ''),
    episodes: [],
  };
  return base;
}

function videoSourcesFor(ep: any): VideoSource[] {
  const sources: VideoSource[] = [];
  if (ep.video_url_hd) {
    sources.push({ id: 'hd', name: 'Server HD', quality: 'HD' as any, url: ep.video_url_hd, type: 'mp4', serverName: 'HD' });
  }
  if (ep.video_url) {
    sources.push({ id: 'sd', name: 'Server SD', quality: 'SD' as any, url: ep.video_url, type: 'mp4', serverName: 'SD' });
  }
  if (ep.video_url_eng) {
    sources.push({ id: 'eng', name: 'Server ENG', quality: 'ENG' as any, url: ep.video_url_eng, type: 'mp4', serverName: 'ENG' });
  }
  return sources;
}

// ---------------------------------------------------------------- caching

const cache = new Map<string, { at: number; data: any }>();
function cached<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < ttlMs) return Promise.resolve(hit.data as T);
  return fn().then((data) => {
    cache.set(key, { at: Date.now(), data });
    return data;
  });
}

// ---------------------------------------------------------------- upstream calls

export async function getVideosPage(page: number, count = PAGE_SIZE) {
  const data = await upstream('api/get_videos', { page, count });
  const items = pickItems(data);
  // NOTE: the API's `pages` field echoes the requested page, it is NOT the
  // total page count. Compute totals from count_total instead.
  const total = num(data.count_total, items.length);
  return { items, total, pages: Math.max(1, Math.ceil(total / count)) };
}

export async function getCategoriesRaw(): Promise<any[]> {
  return cached('categories', 10 * 60 * 1000, async () => {
    const data = await upstream('api/get_category_genre', { search: '', sort: 'c.cid DESC' });
    return Array.isArray(data.categories) ? data.categories : pickItems(data);
  });
}

export async function getCategoriesMapped(): Promise<Drakor[]> {
  const raw = await getCategoriesRaw();
  return raw.map(mapCategory);
}

export async function searchSeries(query: string): Promise<Drakor[]> {
  // Search has NO pagination in the upstream API (sending `page` returns 0
  // results, verified live). Count is capped at 20.
  const data = await upstream('api/get_search_results', { search: query.trim(), count: PAGE_SIZE });
  const items = pickItems(data);
  const byCat = new Map<number, Drakor>();
  for (const v of items) {
    const catId = Number(v.cat_id ?? v.cid);
    if (!catId) continue;
    const ep = parseEpisode(v.video_title);
    const prev = byCat.get(catId);
    const cur = mapVideoToSeries(v);
    if (!prev || (ep !== null && ep > (prev.latestEpisode || 0))) {
      // Keep the highest episode seen, but preserve the best poster/views.
      byCat.set(catId, { ...cur, latestEpisode: Math.max(prev?.latestEpisode || 0, ep ?? cur.latestEpisode ?? 0) });
    }
  }
  return [...byCat.values()];
}

/** Latest episode updates, de-duplicated to series, newest first. */
export async function getLatestSeries(pages = 2): Promise<Drakor[]> {
  const out: Drakor[] = [];
  const seen = new Set<number>();
  for (let p = 1; p <= pages; p++) {
    const { items } = await getVideosPage(p);
    for (const v of items) {
      const catId = Number(v.cat_id ?? v.cid);
      if (!catId || seen.has(catId)) continue;
      seen.add(catId);
      out.push(mapVideoToSeries(v));
    }
  }
  return out;
}

export interface SeriesDetail extends Drakor {
  related: Drakor[];
}

export async function getSeriesDetail(catId: number): Promise<SeriesDetail> {
  const first = await upstream('api/get_category_videos', {
    id: catId,
    page: 1,
    count: PAGE_SIZE,
    sort: 'n.id DESC',
  });
  const total = num(first.count_total, 0);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  let rawDesc: any[] = pickItems(first);
  if (totalPages > 1) {
    const rest = await Promise.all(
      Array.from({ length: Math.min(totalPages, 50) - 1 }, (_, i) =>
        upstream('api/get_category_videos', { id: catId, page: i + 2, count: PAGE_SIZE, sort: 'n.id DESC' })
          .then(pickItems)
          .catch(() => [] as any[]),
      ),
    );
    rawDesc = rawDesc.concat(...rest);
  }
  // Upstream returns newest first; reverse so episode numbers ascend, and
  // fall back to position when a title carries no parseable episode number.
  const rawAsc = [...rawDesc].reverse();
  const episodes: Episode[] = rawAsc.map((e: any, i: number) => {
    const epNum = parseEpisode(e.video_title) ?? i + 1;
    return {
      id: `${catId}-ep-${epNum}`,
      drakorId: `cat-${catId}`,
      title: String(e.video_title || `Episode ${epNum}`),
      episodeNumber: epNum,
      thumbnailUrl: e.video_thumbnail || undefined,
      releasedAt: String(e.date_time || e.update_date_time || ''),
      duration: '',
      videoSources: videoSourcesFor(e),
      subtitleSources: [{ id: 'sub-id', language: 'id', label: 'Bahasa Indonesia', isDefault: true }],
    };
  });
  episodes.sort((a, b) => a.episodeNumber - b.episodeNumber);

  let series: Drakor | null = null;
  if (first.category) {
    series = mapCategory({ ...first.category, cid: first.category.cid ?? catId });
  } else {
    const cats = await getCategoriesRaw().catch(() => [] as any[]);
    const found = cats.find((c: any) => Number(c.cid) === catId);
    if (found) series = mapCategory(found);
  }
  if (!series && rawDesc[0]) series = mapVideoToSeries(rawDesc[0]);
  if (!series) throw new Error(`Series ${catId} not found`);

  // Related: suggested titles from the latest episode's detail, else genre overlap.
  let related: Drakor[] = [];
  try {
    const latest = episodes[episodes.length - 1];
    const vid = rawDesc[0]?.vid;
    if (vid) {
      const detail = await upstream('api/get_post_detail', { id: vid, cat_id: catId, search: '' });
      const sug = Array.isArray(detail.suggested) ? detail.suggested : [];
      related = sug
        .map((s: any) => {
          if (s.cid || s.cat_id) return mapCategory({ ...s, cid: s.cid ?? s.cat_id });
          if (s.catId) return null;
          return null;
        })
        .filter((d: any): d is Drakor => Boolean(d) && d.id !== series!.id)
        .slice(0, 4);
    }
  } catch {
    related = [];
  }
  if (related.length === 0) {
    const all = await getCategoriesMapped().catch(() => [] as Drakor[]);
    related = all
      .filter((d) => d.id !== series!.id && d.genres.some((g) => series!.genres.includes(g)))
      .slice(0, 4);
  }

  return {
    ...series,
    totalEpisodes: episodes.length || series.totalEpisodes,
    latestEpisode: episodes.length ? Math.max(...episodes.map((e) => e.episodeNumber)) : series.latestEpisode,
    episodes,
    related,
  };
}

export async function getSchedule(): Promise<ScheduleEntry[]> {
  const cats = await getCategoriesRaw();
  const entries: ScheduleEntry[] = [];
  for (const c of cats) {
    const day = normalizeDay(c.days);
    if (!day) continue;
    const d = mapCategory(c);
    entries.push({
      id: `sch-${c.cid}`,
      drakorId: d.id,
      drakor: d,
      donghuaId: d.id,
      donghua: d,
      dayOfWeek: day,
      // The source only gives a weekday, never a time. Do not invent one.
      airTime: 'Jadwal hari',
      episodeNumber: d.totalEpisodes || 1,
      network: '',
      status: 'aired',
    });
  }
  return entries;
}

export async function getGenres(): Promise<Genre[]> {
  const cats = await getCategoriesRaw();
  const counts = new Map<string, number>();
  for (const c of cats) {
    for (const g of splitGenres(c.genre)) counts.set(g, (counts.get(g) || 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([name, count]) => ({
      id: slugify(name),
      name,
      slug: slugify(name),
      description: `${count} judul`,
      count,
    }));
}

/** Rankings are derived live: no daily/weekly/monthly split exists upstream. */
export async function getRankings(period: string): Promise<RankingEntry[]> {
  // Sample recent catalog pages for view counts, plus top-rated categories.
  const latest = await getLatestSeries(5);
  let pool = [...latest];
  if (period === 'monthly') {
    pool.sort((a, b) => b.rating - a.rating);
  } else if (period === 'daily') {
    pool.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  } else {
    pool.sort((a, b) => b.views - a.views || b.rating - a.rating);
  }
  const today = new Date().toISOString().slice(0, 10);
  return pool.slice(0, 20).map((d, i) => ({
    id: `rk-${period}-${i + 1}`,
    drakorId: d.id,
    drakor: d,
    donghuaId: d.id,
    donghua: d,
    period: period as RankingEntry['period'],
    rank: i + 1,
    viewCount: d.views,
    score: d.rating,
    snapshotAt: today,
  }));
}
