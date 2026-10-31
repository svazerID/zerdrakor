import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { pageMetadata } from '@/lib/metadata';

export const metadata: Metadata = pageMetadata({
  path: '/katalog',
  title: 'Katalog Drama Korea Lengkap',
  description:
    'Jelajahi katalog drama Korea (drakor) dan film Korea terlengkap — romance, komedi, thriller, fantasi, hingga melodrama. Filter genre, status tayang, dan rating dengan subtitle Indonesia.',
});

export default function KatalogMetaLayout({ children }: { children: ReactNode }) {
  return children;
}
