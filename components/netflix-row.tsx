'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

interface NetflixRowProps {
  title: string;
  subtitle?: string;
  seeAllHref?: string;
  seeAllLabel?: string;
  children: React.ReactNode;
}

// Baris carousel horizontal ala Netflix: judul seksi bold dengan link
// "Lihat Semua" muncul saat hover, konten overflow-x dengan tombol
// panah bulat di tepi kiri/kanan (muncul saat hover container).
export function NetflixRow({ title, subtitle, seeAllHref, seeAllLabel, children }: NetflixRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const updateArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 8);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }, []);

  useEffect(() => {
    updateArrows();
    window.addEventListener('resize', updateArrows);
    return () => window.removeEventListener('resize', updateArrows);
  }, [updateArrows]);

  const scrollBy = (dir: 1 | -1) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: 'smooth' });
  };

  return (
    <section className="group/row relative">
      {/* Header seksi ala Netflix */}
      <div className="flex items-end justify-between mb-3 px-3 sm:px-6">
        <h2 className="text-lg sm:text-xl font-bold tracking-tight text-ink">
          {title}
          {subtitle && (
            <span className="ml-2 text-xs font-medium text-mute hidden sm:inline">{subtitle}</span>
          )}
        </h2>
        {seeAllHref && (
          <Link
            href={seeAllHref}
            className="opacity-0 group-hover/row:opacity-100 transition-opacity text-[11px] font-bold text-accent hover:text-accent-soft flex items-center gap-0.5 shrink-0"
          >
            <span>{seeAllLabel || 'Lihat Semua'}</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        )}
      </div>

      <div className="relative">
        {/* Tombol panah kiri */}
        {canLeft && (
          <button
            onClick={() => scrollBy(-1)}
            aria-label="Geser ke kiri"
            className="absolute left-0 top-0 bottom-0 z-20 w-8 sm:w-10 rounded-r-md bg-black/60 hover:bg-black/80 text-white opacity-0 group-hover/row:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 sm:w-7 sm:h-7" />
          </button>
        )}

        {/* Track konten: lebar kartu diatur oleh anak lewat properti card */}
        <div
          ref={scrollRef}
          onScroll={updateArrows}
          className="flex gap-2 sm:gap-2.5 overflow-x-auto no-scrollbar scroll-smooth px-3 sm:px-6 pb-2 snap-x snap-mandatory"
        >
          {children}
        </div>

        {/* Tombol panah kanan */}
        {canRight && (
          <button
            onClick={() => scrollBy(1)}
            aria-label="Geser ke kanan"
            className="absolute right-0 top-0 bottom-0 z-20 w-8 sm:w-10 rounded-l-md bg-black/60 hover:bg-black/80 text-white opacity-0 group-hover/row:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
          >
            <ChevronRight className="w-5 h-5 sm:w-7 sm:h-7" />
          </button>
        )}
      </div>
    </section>
  );
}
