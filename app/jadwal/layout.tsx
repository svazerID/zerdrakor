import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { pageMetadata } from '@/lib/metadata';

export const metadata: Metadata = pageMetadata({
  path: '/jadwal',
  title: 'Jadwal Tayang Drakor Mingguan',
  description:
    'Jadwal siaran drama Korea mingguan zona WIB (UTC+7) dari tvN, SBS, JTBC, ENA, KBS2, MBC, dan Netflix — lengkap dengan jam rilis episode dan status tayang.',
});

export default function JadwalMetaLayout({ children }: { children: ReactNode }) {
  return children;
}
