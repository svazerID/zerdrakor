// Client-side fetchers for our own /api/* routes. The browser never talks
// to the upstream API directly and never sees its key.
import type { Drakor, Genre, RankingEntry, ScheduleEntry } from '@/types/donghua';

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as any).error || `Request failed (${res.status})`);
  return data as T;
}

export interface HomeData {
  featured: Drakor[];
  editorPicks: Drakor[];
  latest: Drakor[];
  movies: Drakor[];
  genres: Genre[];
  schedule: ScheduleEntry[];
}

export function fetchHome(): Promise<HomeData> {
  return getJson<HomeData>('/api/home');
}

export interface CatalogData {
  items: Drakor[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  genres: Genre[];
}

export function fetchCatalog(params: Record<string, string | number>): Promise<CatalogData> {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) qs.set(k, String(v));
  return getJson<CatalogData>(`/api/catalog?${qs}`);
}

export function fetchSearch(q: string): Promise<{ items: Drakor[] }> {
  return getJson<{ items: Drakor[] }>(`/api/search?q=${encodeURIComponent(q)}`);
}

export function fetchSchedule(): Promise<{ items: ScheduleEntry[] }> {
  return getJson<{ items: ScheduleEntry[] }>('/api/schedule');
}

export function fetchRankings(period: string): Promise<{ items: RankingEntry[] }> {
  return getJson<{ items: RankingEntry[] }>(`/api/rankings?period=${encodeURIComponent(period)}`);
}

export interface DetailData extends Drakor {
  related: Drakor[];
}

export function fetchDetail(slug: string): Promise<DetailData> {
  return getJson<DetailData>(`/api/drakor/${encodeURIComponent(slug)}`);
}
