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
      className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-[#070a12] border border-slate-800/80 shadow-2xl mb-12 select-none touch-pan-y"
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
          className="w-full h-full object-cover object-center transition-all duration-700 ease-out"
          style={{
            filter: 'blur(12px)',
            WebkitFilter: 'blur(12px)',
            transform: 'scale(1.12)',
            opacity: 0.82,
          }}
          referrerPolicy="no-referrer"
          draggable={false}
        />

        {/* 2. Spotlight Beam Lighting (Sinar Lampu Sorot / Spotlight Cone) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at 75% 30%, rgba(168, 85, 247, 0.35) 0%, rgba(99, 102, 241, 0.15) 35%, transparent 70%)',
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 30% 20%, rgba(255, 255, 255, 0.08) 0%, transparent 80%)',
          }}
        />

        {/* 3. Soft gradient wash for text contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/20" />
      </div>

      {/* Main Content Body */}
      <div className="relative z-10 p-5 sm:p-7 md:p-10 flex flex-col justify-between min-h-[460px] sm:min-h-[420px]">
        {/* Top/Middle Section: Left Info + Right Poster Card */}
        <div className="flex flex-col-reverse md:flex-row md:items-center justify-between gap-6 md:gap-10">
          {/* Left Column: Badges, Title, Synopsis, Action Buttons */}
          <div className="flex-1 max-w-2xl">
            {/* Badges Row */}
            <div className="flex items-center gap-2 mb-3.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-300 bg-purple-950/80 border border-purple-700/60 px-3 py-1 rounded-full shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                Spotlight #{currentIndex + 1}
              </span>

              <span className="text-xs font-medium text-slate-300 bg-slate-900/80 border border-slate-800 px-3 py-1 rounded-full">
                {current.network || current.genres[0] || 'Drakor'}
              </span>

              <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/70 border border-emerald-800/60 px-3 py-1 rounded-full">
                Sub Indo HD
              </span>
            </div>

            {/* Drama Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              {current.title}
            </h1>

            {/* Hangul / Romanized Title */}
            <p className="text-xs sm:text-sm text-purple-300/80 font-medium mt-1">
              {current.hangulTitle} {current.romanizedTitle ? `· ${current.romanizedTitle}` : ''}
            </p>

            {/* Synopsis */}
            <p className="text-xs sm:text-sm md:text-base text-slate-300/90 mt-3 line-clamp-3 leading-relaxed">
              {current.synopsis}
            </p>

            {/* Action Buttons Row (Nonton Sekarang, Detail, Bookmark Icon) */}
            <div className="flex items-center gap-3 mt-6 flex-wrap">
              <Link
                href={`/watch/${current.slug}/${current.latestEpisode || 1}`}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-purple-600/30 active:scale-95"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Nonton Sekarang</span>
              </Link>

              <Link
                href={`/donghua/${current.slug}`}
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 font-semibold text-xs sm:text-sm transition-all shadow-sm"
              >
                <Info className="w-4 h-4 text-slate-400" />
                <span>Detail</span>
              </Link>

              <button
                onClick={() => toggleWatchlist(current.id)}
                aria-label={inWatchlist ? 'Hapus dari Watchlist' : 'Tambah ke Watchlist'}
                title={inWatchlist ? 'Tersimpan di Watchlist' : 'Simpan ke Watchlist'}
                className={`p-3 rounded-xl border transition-all flex items-center justify-center cursor-pointer ${
                  inWatchlist
                    ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300'
                    : 'bg-slate-900/90 border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                {inWatchlist ? (
                  <Check className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
                ) : (
                  <Bookmark className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Floating Poster Card with Spotlight Halo Glow */}
          <div className="flex justify-center md:justify-end">
            <div className="relative w-40 sm:w-48 md:w-56 aspect-[3/4] rounded-2xl overflow-hidden border border-purple-500/40 shadow-[0_0_45px_rgba(168,85,247,0.35)] bg-slate-950 flex-shrink-0 group">
              <img
                src={coverImage}
                alt={current.title}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />

              {/* Bottom tag inside poster card */}
              <div className="absolute bottom-2.5 left-2.5 right-2.5 p-2 rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-700/60 text-[11px] font-semibold text-slate-200 flex items-center justify-between shadow-lg">
                <span className="text-purple-300 font-bold">Spotlight #{currentIndex + 1}</span>
                <span className="text-slate-400 font-mono">
                  {currentIndex + 1} / {featuredList.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Navigation Bar: Left Indicator Dots + Right < > Arrow Buttons */}
        <div className="flex items-center justify-between pt-5 mt-6 border-t border-slate-800/60">
          {/* Indicator Dots */}
          <div className="flex items-center gap-1.5">
            {featuredList.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`transition-all cursor-pointer ${
                  idx === currentIndex
                    ? 'w-7 h-2 rounded-full bg-purple-500 shadow-sm shadow-purple-500/50'
                    : 'w-2 h-2 rounded-full bg-slate-700 hover:bg-slate-500'
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
              className="p-2 sm:p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextSlide}
              aria-label="Slide berikutnya"
              className="p-2 sm:p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer active:scale-95"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
