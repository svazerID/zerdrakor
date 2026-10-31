import React from 'react';
import Link from 'next/link';
import { Home, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-16">
      <div className="w-16 h-16 rounded-2xl bg-accent/20 border border-accent-soft/40 flex items-center justify-center text-2xl font-black text-accent-soft mb-6 shadow-xl shadow-accent/50">
        404
      </div>
      <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
        Halaman Tidak Ditemukan
      </h1>
      <p className="text-mute text-sm max-w-md mb-8 leading-relaxed">
        Maaf, drama Korea atau halaman yang Anda cari tidak tersedia atau tautannya telah berpindah.
      </p>
      <div className="flex items-center gap-3 flex-wrap justify-center">
        <Link
          href="/"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent hover:bg-accent text-white font-bold text-sm transition-all shadow-lg shadow-accent/30"
        >
          <Home className="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </Link>
        <Link
          href="/katalog"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-elevated hover:bg-line text-sub border border-line-strong font-semibold text-sm transition-all"
        >
          <Compass className="w-4 h-4" />
          <span>Jelajahi Katalog</span>
        </Link>
      </div>
    </div>
  );
}
