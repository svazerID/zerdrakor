import React from 'react';
import Link from 'next/link';
import { Heart, ShieldCheck } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full bg-[#05070d] border-t border-slate-800/80 text-slate-400 text-sm mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: Brand & Synopsis */}
          <div className="md:col-span-2 space-y-3">
            <Link href="/" className="flex items-center gap-2.5 text-lg font-bold text-white">
              <img
                src="/zerdrakor_icon.jpg"
                alt="ZerDrakor Icon"
                className="w-7 h-7 rounded-lg object-cover border border-purple-500/40 shadow-sm"
              />
              <span className="font-extrabold tracking-tight bg-gradient-to-r from-white via-purple-100 to-rose-300 bg-clip-text text-transparent">
                Zer<span className="text-purple-400">Drakor</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              Platform katalog, jadwal tayang, dan streaming serial drama Korea (drakor) serta film Korea (K-Movie)
              terdepan berbahasa Indonesia. Temukan ribuan episode romansa, komedi, melodrama, thriller misteri, dan
              hukum kriminal dengan kualitas HD dan subtitle Indonesia resmi.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Sinkronisasi jadwal tayang saluran tvN, SBS, JTBC, ENA, dan Netflix zona WIB (UTC+7)</span>
            </div>
          </div>

          {/* Col 2: Navigasi Cepat */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">Navigasi Utama</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-rose-400 transition-colors">
                  Beranda
                </Link>
              </li>
              <li>
                <Link href="/katalog" className="hover:text-rose-400 transition-colors">
                  Katalog Drama Korea
                </Link>
              </li>
              <li>
                <Link href="/jadwal" className="hover:text-rose-400 transition-colors">
                  Jadwal Rilis Mingguan
                </Link>
              </li>
              <li>
                <Link href="/peringkat" className="hover:text-rose-400 transition-colors">
                  Peringkat Populer
                </Link>
              </li>
              <li>
                <Link href="/watchlist" className="hover:text-rose-400 transition-colors">
                  Daftar Tontonan (Watchlist)
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Genre Populer */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">Genre Drakor Pilihan</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/katalog?genre=rom-com" className="hover:text-rose-400 transition-colors">
                  Rom-Com (Komedi Romantis)
                </Link>
              </li>
              <li>
                <Link href="/katalog?genre=melodrama" className="hover:text-rose-400 transition-colors">
                  Melodrama Menguras Air Mata
                </Link>
              </li>
              <li>
                <Link href="/katalog?genre=crime-law" className="hover:text-rose-400 transition-colors">
                  Hukum & Kriminal
                </Link>
              </li>
              <li>
                <Link href="/katalog?genre=thriller" className="hover:text-rose-400 transition-colors">
                  Thriller & Misteri
                </Link>
              </li>
              <li>
                <Link href="/katalog?type=movie" className="hover:text-rose-400 transition-colors">
                  Film Korea (K-Movie)
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Disclaimer */}
        <div className="pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} ZerDrakor. Dibuat dengan cinta untuk komunitas pecinta drama Korea Indonesia.</p>
          <p className="text-[11px] text-slate-400 text-center sm:text-right">
            Hak cipta drama, poster, dan materi siaran adalah milik masing-masing jaringan TV (tvN, SBS, JTBC, Netflix, Disney+, dll).
          </p>
        </div>
      </div>
    </footer>
  );
}
