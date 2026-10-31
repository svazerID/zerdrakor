import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { pageMetadata } from '@/lib/metadata';

export const metadata: Metadata = pageMetadata({
  path: '/peringkat',
  title: 'Peringkat Drakor Terpopuler',
  description:
    'Papan peringkat drama Korea paling banyak ditonton — peringkat harian, mingguan, bulanan, dan sepanjang masa berdasarkan jumlah views pemirsa ZerDrakor.',
});

export default function PeringkatMetaLayout({ children }: { children: ReactNode }) {
  return children;
}
