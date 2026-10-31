'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Play, Info, Bookmark, Check, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { Drakor } from '@/types/donghua';
import { useWatchlist } from '@/context/watchlist-context';

interface HeroSpotlightProps {
  featuredList: Drakor[];
}

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
      className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-elevated border border-line shadow-sm mb-12 select-none touch-pan-y"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      {/* 1. Cover Cloned as Blurred Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <img
          src={coverImage}
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover object-center transition-all duration-700 ease-out opacity-60 sm:opacity-45 lg:opacity-25"
          referrerPolicy="no-referrer"
          draggable={false}
        />

        {/* 2. Spotlight Beam Lighting (Sinar Lampu Sorot / Spotlight Cone) */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

        {/* 3. Soft gradient wash for text contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-transparent" />
      </div>

      {/* Main Content Body */}
      <div className="relative z-10 p-4 sm:p-8 md:p-10 flex flex-col justify-between min-h-[420px] sm:min-h-[480px]">
        {/* Top/Middle Section: Left Info + Right Poster Card */}
        <div className="flex flex-col-reverse md:flex-row md:items-center justify-between gap-6 md:gap-10">
          {/* Left Column: Badges, Title, Synopsis, Action Buttons */}
          <div className="flex-1 max-w-2xl">
            {/* Badges Row */}
            <div className="flex items-center gap-2 mb-3.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 rounded-xl px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs font-semibold bg-accent/20 border border-accent-soft/40 text-accent-soft">
                <Sparkles className="w-3.5 h-3.5" />
                Spotlight #{currentIndex + 1}
              </span>

              <span className="rounded-xl px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs font-semibold bg-white/10 text-white border border-white/20">
                {current.network || current.genres[0] || 'Drakor'}
              </span>

              <span className="rounded-xl px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs font-semibold bg-ok/20 text-ok border border-ok/30">
                Sub Indo HD
              </span>
            </div>

            {/* Drama Title */}
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight line-clamp-2">
              {current.title}
            </h1>

            {/* Hangul / Romanized Title */}
            <p className="text-xs sm:text-sm text-accent-soft font-medium mt-1">
              {current.hangulTitle} {current.romanizedTitle ? `· ${current.romanizedTitle}` : ''}
            </p>

            {/* Synopsis */}
            <p className="text-sm sm:text-base text-white/80 mt-3 line-clamp-2 sm:line-clamp-3 max-w-2xl leading-relaxed">
              {current.synopsis}
            </p>

            {/* Action Buttons Row (Nonton Sekarang, Detail, Bookmark Icon) */}
            <div className="flex items-center gap-3 mt-6 flex-wrap">
              <Link
                href={`/watch/${current.slug}/${current.latestEpisode || 1}`}
                className="flex items-center gap-2 px-5 sm:px-7 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-accent hover:scale-[1.02] active:scale-95 text-white font-semibold text-xs sm:text-sm transition-all shadow-sm"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Nonton Sekarang</span>
              </Link>

              <Link
                href={`/donghua/${current.slug}`}
                className="flex items-center gap-2 px-5 sm:px-7 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs sm:text-sm transition-all"
              >
                <Info className="w-4 h-4" />
                <span>Detail</span>
              </Link>

              <button
                onClick={() => toggleWatchlist(current.id)}
                aria-label={inWatchlist ? 'Hapus dari Watchlist' : 'Tambah ke Watchlist'}
                title={inWatchlist ? 'Tersimpan di Watchlist' : 'Simpan ke Watchlist'}
                className={`p-3 rounded-xl border transition-all flex items-center justify-center cursor-pointer ${
                  inWatchlist
                    ? 'bg-accent/30 border-accent-soft/40 text-accent-soft'
                    : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                }`}
              >
                {inWatchlist ? (
                  <Check className="w-4 h-4 stroke-[2.5]" />
                ) : (
                  <Bookmark className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Floating Poster Card with Spotlight Halo Glow */}
          <div className="flex justify-center md:justify-end">
            <div className="relative hidden sm:block w-20 sm:w-40 lg:w-52 xl:w-60 aspect-[3/4] rounded-xl sm:rounded-2xl overflow-hidden border border-line bg-elevated flex-shrink-0 group">
              <img
                src={coverImage}
                alt={current.title}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />

              {/* Bottom tag inside poster card */}
              <div className="absolute bottom-2.5 left-2.5 right-2.5 p-2 rounded-xl bg-black/80 border border-white/20 text-[11px] font-semibold text-white flex items-center justify-between shadow-sm">
                <span className="text-accent-soft font-bold">Spotlight #{currentIndex + 1}</span>
                <span className="text-white/70 font-mono">
                  {currentIndex + 1} / {featuredList.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Navigation Bar: Left Indicator Dots + Right < > Arrow Buttons */}
        <div className="flex items-center justify-between pt-3.5 sm:pt-4 mt-4 sm:mt-5 border-t border-line">
          {/* Indicator Dots */}
          <div className="flex items-center gap-1.5">
            {featuredList.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`transition-all cursor-pointer ${
                  idx === currentIndex
                    ? 'w-6 sm:w-7 h-1.5 rounded-full bg-accent'
                    : 'w-2 h-1.5 rounded-full bg-white/25'
                }`}
                aria-label={`Slide ke ${idx + 1}`}
                title={`Slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Previous / Next Arrow Buttons (< > in dedicated space, never overlapping content!) */}
          <div className="flex items-center gap-2">
            <button
              onClick={prevSlide}
              aria-label="Slide sebelumnya"
              className="w-7 sm:w-8 h-7 sm:h-8 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all cursor-pointer active:scale-95 flex items-center justify-center"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextSlide}
              aria-label="Slide berikutnya"
              className="w-7 sm:w-8 h-7 sm:h-8 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all cursor-pointer active:scale-95 flex items-center justify-center"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
