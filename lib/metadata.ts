import type { Metadata } from 'next';
import { getCategoriesMapped, parseCatId } from '@/lib/server/drakor-api';
import type { Drakor } from '@/types/donghua';

// Helper metadata untuk link preview (Open Graph + Twitter Cards).
// Dipakai layout server di app/*/layout.tsx — layout client tetap tak tersentuh.
// Data judul diambil dari kategori upstream (1 panggilan list), bukan
// getSeriesDetail yang bisa memicu puluhan request episode.

const APP_URL = process.env.APP_URL || 'http://localhost:3000';
const SITE_NAME = 'ZerDrakor';
const FALLBACK_IMAGE = `${APP_URL}/zerdrakor_og_preview.jpg`;

function cleanText(raw: string | undefined | null, max: number): string {
  const t = String(raw || '')
    .replace(/\s+/g, ' ')
    .trim();
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}

async function findDrama(slug: string): Promise<Drakor | null> {
  const catId = parseCatId(slug);
  if (!catId) return null;
  try {
    const all = await getCategoriesMapped();
    return all.find((d) => d.id === `cat-${catId}`) ?? null;
  } catch {
    return null;
  }
}

/** Metadata untuk seluruh situs pada halaman statis (katalog, jadwal, dll). */
export function pageMetadata(opts: { path: string; title: string; description: string }): Metadata {
  const url = `${APP_URL}${opts.path}`;
  return {
    title: { absolute: `${opts.title} | ZerDrakor` },
    description: opts.description,
    alternates: { canonical: url },
    openGraph: {
      title: `${opts.title} | ZerDrakor`,
      description: opts.description,
      url,
      siteName: SITE_NAME,
      locale: 'id_ID',
      type: 'website',
      images: [{ url: FALLBACK_IMAGE, width: 1200, height: 630, alt: SITE_NAME }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${opts.title} | ZerDrakor`,
      description: opts.description,
      images: [FALLBACK_IMAGE],
    },
  };
}

/** Metadata per-judul untuk halaman detail drama. */
export async function dramaMetadata(slug: string, canonicalPath: string): Promise<Metadata> {
  const drama = await findDrama(slug);
  const url = `${APP_URL}${canonicalPath}`;

  if (!drama) {
    return {
      title: { absolute: 'Drama Korea Tidak Ditemukan | ZerDrakor' },
      description: 'Judul drama Korea yang Anda cari tidak tersedia di katalog ZerDrakor.',
      alternates: { canonical: url },
    };
  }

  const kind = drama.type === 'movie' ? 'Film Korea' : 'Drama Korea';
  const year = drama.releaseYear && drama.releaseYear > 1900 ? ` (${drama.releaseYear})` : '';
  const title = `${drama.title}${year} — Nonton ${kind} Sub Indo`;
  const description =
    cleanText(drama.synopsis, 197) ||
    `Nonton ${drama.title} sub Indo gratis di ZerDrakor. Server cepat HD, subtitle Indonesia resmi, update tiap hari.`;
  const image = drama.bannerUrl || drama.posterUrl || FALLBACK_IMAGE;

  return {
    title: { absolute: `${title} | ZerDrakor` },
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      locale: 'id_ID',
      type: 'video.tv_show',
      images: [{ url: image, alt: `Poster ${drama.title}` }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

/** Metadata per-episode untuk halaman pemutar. */
export async function watchMetadata(slug: string, episode: string): Promise<Metadata> {
  const drama = await findDrama(slug);
  const url = `${APP_URL}/watch/${encodeURIComponent(slug)}/${encodeURIComponent(episode)}`;

  if (!drama) {
    return {
      title: { absolute: 'Nonton Episode Sub Indo | ZerDrakor' },
      description: 'Streaming episode drama Korea sub Indo gratis di ZerDrakor.',
      alternates: { canonical: url },
    };
  }

  const ep = episode || String(drama.latestEpisode || 1);
  const title = `Nonton ${drama.title} Episode ${ep} Sub Indo`;
  const description =
    cleanText(drama.synopsis, 160) ||
    `Streaming ${drama.title} Episode ${ep} sub Indo gratis di ZerDrakor — server cepat HD, subtitle Indonesia.`;
  const image = drama.bannerUrl || drama.posterUrl || FALLBACK_IMAGE;

  return {
    title: { absolute: `${title} | ZerDrakor` },
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      locale: 'id_ID',
      type: 'video.episode',
      images: [{ url: image, alt: `${drama.title} Episode ${ep}` }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}
