import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { dramaMetadata } from '@/lib/metadata';

// Alias rute /drakor/[slug] memakai metadata per-judul yang sama
// dengan /donghua/[slug].
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return dramaMetadata(slug, `/drakor/${encodeURIComponent(slug)}`);
}

export default function DrakorMetaLayout({ children }: { children: ReactNode }) {
  return children;
}
