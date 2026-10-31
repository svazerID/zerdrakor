import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { pageMetadata } from '@/lib/metadata';

export const metadata: Metadata = pageMetadata({
  path: '/watchlist',
  title: 'Watchlist Saya',
  description:
    'Daftar tontonan drama Korea dan film Korea pribadi Anda di ZerDrakor — simpan judul favorit, lanjutkan episode terakhir, dan pantau rilis baru.',
});

export default function WatchlistMetaLayout({ children }: { children: ReactNode }) {
  return children;
}
