import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { dramaMetadata } from '@/lib/metadata';

// Layout server khusus metadata: client page di bawahnya tetap utuh,
// layout ini hanya menyuntikkan Open Graph / Twitter Card per-judul.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return dramaMetadata(slug, `/donghua/${encodeURIComponent(slug)}`);
}

export default function DonghuaMetaLayout({ children }: { children: ReactNode }) {
  return children;
}
