import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { watchMetadata } from '@/lib/metadata';

// Metadata per-episode untuk halaman pemutar /watch/[slug]/[episode].
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; episode: string }>;
}): Promise<Metadata> {
  const { slug, episode } = await params;
  return watchMetadata(slug, episode);
}

export default function WatchMetaLayout({ children }: { children: ReactNode }) {
  return children;
}
