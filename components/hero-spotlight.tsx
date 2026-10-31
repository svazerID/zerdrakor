'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Play, Info, Bookmark, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { Drakor } from '@/types/donghua';
import { useWatchlist } from '@/context/watchlist-context';

interface HeroSpotlightProps {
  featuredList: Drakor[];
}

// Hero ala Netflix: full-bleed edge-to-edge, ditarik ke atas melewati
// padding main agar navbar transparan menimpanya, gradasi melebur ke
// kanvas, konten di kiri-bawah dengan tombol Putar / Info dua warna.
export function HeroSpotlight({ featuredList }: HeroSpotlightProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { isInWatchlist, toggleWatchlist } = useWatchlist();

  // Touch and drag coordinates for swipe support
  const touchStartXRef = useRef<number>(0);
  const touchStartYRef = useRef<number>(0);
  const mouseStartXRef = useRef<number | null>(null);
  const isDraggingRef = useRef<boolean>(false);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % featuredList.length);
  }, [featuredList.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + featuredList.length) % featuredList.length);
  }, [featuredList.length]);

  // Auto-advance every 8 seconds
  useEffect(() => {
    if (featuredList.length <= 1) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 8000);
    return () => clearInterval(interval);
  }, [featuredList.length, nextSlide]);

  if (!featuredList || featuredList.length === 0) return null;

  const current = featuredList[currentIndex];
  const coverImage = current.posterUrl || current.bannerUrl;
  const inWatchlist = isInWatchlist(current.id);

  // Touch Swipe Handlers (Swipe pake tangan)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const deltaX = endX - touchStartXRef.current;
    const deltaY = endY - touchStartYRef.current;

    // Trigger if horizontal swipe is dominant and exceeds 40px
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 40) {
      if (deltaX < 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  };

  // Mouse drag handlers for desktop swipe
  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a') || target.closest('input')) return;
    mouseStartXRef.current = e.clientX;
    isDraggingRef.current = true;
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || mouseStartXRef.current === null) return;
    const deltaX = e.clientX - mouseStartXRef.current;
    if (Math.abs(deltaX) > 50) {
      if (deltaX < 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    isDraggingRef.current = false;
    mouseStartXRef.current = null;
  };

  return (
    <section
      className="relative w-full select-none touch-pan-y -mt-18 sm:-mt-24"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      {/* Full-bleed backdrop: cover image + fade gradasi ala Netflix */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <img
          src={coverImage}
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover object-top scale-105 transition-all duration-700 ease-out"
          referrerPolicy="no-referrer"
          draggable={false}
        />
        <div className="absolute inset-0 nf-hero-fade" />
      </div>

      {/* Main Content Body: kiri-bawah ala Netflix */}
      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 flex flex-col justify-end min-h-[520px] sm:min-h-[560px] lg:min-h-[640px] pt-18 sm:pt-24">
        <div className="max-w-2xl pb-14 sm:pb-16">
          {/* Baris kategori + rating ala Netflix */}
          <div className="flex items-center gap-2.5 mb-3 flex-wrap">
            <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-accent">
              <span className="w-1.5 h-1.5 rounded-sm bg-accent" />
              Spotlight #{currentIndex + 1}
            </span>
            <span className="rounded-sm px-2 py-0.5 text-[11px] sm:text-xs font-semibold bg-white/15 text-white backdrop-blur-sm">
              {current.network || current.genres[0] || 'Drakor'}
            </span>
            <span className="rounded-sm px-2 py-0.5 text-[11px] sm:text-xs font-semibold bg-ok/20 text-ok border border-ok/40">
              Sub Indo HD
            </span>
          </div>

          {/* Drama Title */}
          <h1
            className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.05] line-clamp-2 drop-shadow-[0_3px_10px_rgba(0,0,0,0.8)]"
            key={current.id}
          >
            {current.title}
          </h1>

          {/* Hangul / Romanized Title */}
          <p className="text-xs sm:text-sm text-white/70 font-medium mt-2 drop-shadow">
            {current.hangulTitle} {current.romanizedTitle ? `· ${current.romanizedTitle}` : ''}
          </p>

          {/* Synopsis */}
          <p className="text-sm sm:text-base text-white/85 mt-3 line-clamp-2 sm:line-clamp-3 max-w-xl leading-relaxed drop-shadow">
            {current.synopsis}
          </p>

          {/* Action Buttons Row ala Netflix: Putar (putih) + Info (abu) */}
          <div className="flex items-center gap-3 mt-6 flex-wrap">
            <Link
              href={`/watch/${current.slug}/${current.latestEpisode || 1}`}
              className="flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 rounded-md bg-white hover:bg-white/80 active:scale-95 text-black font-bold text-xs sm:text-base transition-all shadow-lg"
            >
              <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-black" />
              <span>Tonton Sekarang</span>
            </Link>

            <Link
              href={`/donghua/${current.slug}`}
              className="flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 rounded-md bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-bold text-xs sm:text-base transition-all"
            >
              <Info className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Info Selengkapnya</span>
            </Link>

            <button
              onClick={() => toggleWatchlist(current.id)}
              aria-label={inWatchlist ? 'Hapus dari Watchlist' : 'Tambah ke Watchlist'}
              title={inWatchlist ? 'Tersimpan di Watchlist' : 'Simpan ke Watchlist'}
              className={`p-2.5 sm:p-3 rounded-full border transition-all flex items-center justify-center cursor-pointer ${
                inWatchlist
                  ? 'bg-accent border-accent text-white'
                  : 'bg-black/40 border-white/40 text-white hover:bg-black/60'
              }`}
            >
              {inWatchlist ? (
                <Check className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
              ) : (
                <Bookmark className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Kontrol slide: indikator kiri, panah kanan */}
        <div className="absolute bottom-4 right-3 sm:right-6 flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            {featuredList.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`transition-all cursor-pointer ${
                  idx === currentIndex
                    ? 'w-6 h-1 rounded-full bg-accent'
                    : 'w-2 h-1 rounded-full bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Slide ke ${idx + 1}`}
                title={`Slide ${idx + 1}`}
              />
            ))}
          </div>
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              onClick={prevSlide}
              aria-label="Slide sebelumnya"
              className="w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 border border-white/30 text-white transition-all cursor-pointer active:scale-95 flex items-center justify-center"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextSlide}
              aria-label="Slide berikutnya"
              className="w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 border border-white/30 text-white transition-all cursor-pointer active:scale-95 flex items-center justify-center"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
