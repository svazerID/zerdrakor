import React from 'react';
import Link from 'next/link';
import { Home, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-16">
      <div className="w-16 h-16 rounded-2xl bg-purple-950/80 border border-purple-800/60 flex items-center justify-center text-2xl font-black text-purple-400 mb-6 shadow-xl shadow-purple-950/50">
        404
      </div>
      <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
        Halaman Tidak Ditemukan
      </h1>
      <p className="text-slate-400 text-sm max-w-md mb-8 leading-relaxed">
        Maaf, drama Korea atau halaman yang Anda cari tidak tersedia atau tautannya telah berpindah.
      </p>
      <div className="flex items-center gap-3 flex-wrap justify-center">
        <Link
          href="/"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm transition-all shadow-lg shadow-purple-600/30"
        >
          <Home className="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </Link>
        <Link
          href="/katalog"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm transition-all"
        >
          <Compass className="w-4 h-4" />
          <span>Jelajahi Katalog</span>
        </Link>
      </div>
    </div>
  );
}
