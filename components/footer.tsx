import React from 'react';
import Link from 'next/link';
import { Heart, ShieldCheck, Play } from 'lucide-react';

// Footer ala Netflix: kanvas datar tanpa garis pembatas, wordmark merah,
// link abu redup yang menyala saat hover, heading abu kecil uppercase.
export function Footer() {
  const genres = [
    { label: 'Romance', href: '/katalog?genre=romance' },
    { label: 'Drama', href: '/katalog?genre=drama' },
    { label: 'Comedy', href: '/katalog?genre=comedy' },
    { label: 'Thriller', href: '/katalog?genre=thriller' },
    { label: 'Film Korea (K-Movie)', href: '/katalog?type=movie' },
  ];
  return (
    <footer className="mt-16 bg-canvas text-mute pt-12 pb-24 md:pb-12 px-3 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2 space-y-3">
            <Link href="/" className="flex items-center gap-2">
              <span className="w-9 h-9 rounded-md bg-accent flex items-center justify-center">
                <Play className="w-4 h-4 fill-white text-white" />
              </span>
              <span className="text-2xl font-black tracking-tighter leading-none text-accent">
                ZERDRAKOR
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-mute max-w-md leading-relaxed">
              Platform katalog, jadwal tayang, dan streaming serial drama Korea (drakor) serta film Korea (K-Movie)
              berbahasa Indonesia. Temukan ribuan episode romansa, komedi, melodrama, thriller misteri, dan
              hukum kriminal dengan kualitas HD dan subtitle Indonesia.
            </p>
            <p className="flex items-center gap-2 text-xs text-ok font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Server Cepat • Sub Indo • Update Tiap Hari</span>
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-sub mb-3">Navigasi Utama</h4>
            <ul className="space-y-2 text-xs">
              {[
                { label: 'Beranda', href: '/' },
                { label: 'Katalog Drama Korea', href: '/katalog' },
                { label: 'Jadwal Rilis Mingguan', href: '/jadwal' },
                { label: 'Peringkat Populer', href: '/peringkat' },
                { label: 'Daftar Tontonan (Watchlist)', href: '/watchlist' },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-faint hover:text-sub transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-sub mb-3">Genre Drakor Pilihan</h4>
            <div className="flex flex-wrap gap-2">
              {genres.map((g) => (
                <Link
                  key={g.href}
                  href={g.href}
                  className="text-[11px] px-2 py-1 rounded-sm bg-elevated hover:bg-alt text-faint hover:text-sub transition-colors"
                >
                  {g.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-faint">
          <p>© {new Date().getFullYear()} ZerDrakor. Semua hak cipta drama dan poster milik jaringan TV masing-masing.</p>
          <p className="flex items-center gap-1">
            Dibuat dengan <Heart className="w-3 h-3 text-accent fill-accent" /> untuk pecinta drama Korea Indonesia
          </p>
        </div>
      </div>
    </footer>
  );
}
