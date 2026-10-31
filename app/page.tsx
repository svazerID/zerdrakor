'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, Flame, Compass, ArrowRight, PlayCircle, Heart } from 'lucide-react';
import { fetchHome, type HomeData } from '@/lib/client/live';
import { HeroSpotlight } from '@/components/hero-spotlight';
import { DonghuaCard } from '@/components/donghua-card';
import { SchedulePreview } from '@/components/schedule-preview';
import { RankingPreview } from '@/components/ranking-preview';
import { ContinueWatching } from '@/components/continue-watching';

export default function HomePage() {
  const [data, setData] = useState<HomeData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    fetchHome()
      .then((d) => alive && setData(d))
      .catch((e) => alive && setError(e?.message || 'Gagal memuat data live'));
    return () => {
      alive = false;
    };
  }, []);

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-xl font-bold text-white mb-2">Data live belum bisa dimuat</h1>
        <p className="text-sm text-slate-400">{error}. Coba muat ulang halaman.</p>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-400 text-sm">
        Memuat katalog live...
      </div>
    );
  }

  const featured = data.featured;
  const editorPicks = data.editorPicks;
  const latestUpdates = data.latest;
  const movies = data.movies;
  const GENRES = data.genres;
  const SCHEDULE_LIST = data.schedule;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-12">
      {/* 1. Hero Spotlight */}
      <HeroSpotlight featuredList={featured} />

      {/* 2. Continue Watching (if user has history) */}
      <ContinueWatching />

      {/* 3. Pilihan Editor & Rekomendasi Unggulan */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-rose-950/80 text-rose-400 border border-rose-800/60">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Rekomendasi & Pilihan Editor</h2>
              <p className="text-xs text-slate-400">Drama Korea terbaik dengan rating tinggi dan chemistry memukau</p>
            </div>
          </div>

          <Link
            href="/katalog"
            className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 group"
          >
            <span>Semua Katalog Drakor</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-5">
          {editorPicks.slice(0, 4).map((item) => (
            <DonghuaCard key={item.id} donghua={item} showSynopsis={false} />
          ))}
        </div>
      </section>

      {/* 4. Pembaruan Episode Terbaru */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-rose-950/80 text-rose-400 border border-rose-800/60">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Pembaruan Episode Terbaru</h2>
              <p className="text-xs text-slate-400">Rilis subtitle Indonesia terkini yang siap ditonton</p>
            </div>
          </div>

          <Link
            href="/katalog?sort=latest"
            className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 group"
          >
            <span>Lihat Semua Rilis</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-5">
          {latestUpdates.map((item) => (
            <DonghuaCard key={item.id} donghua={item} />
          ))}
        </div>
      </section>

      {/* 5. Split Section: Jadwal Tayang Drakor & Peringkat Populer */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7">
          <SchedulePreview schedules={SCHEDULE_LIST} />
        </div>
        <div className="lg:col-span-5">
          <RankingPreview />
        </div>
      </section>

      {/* 6. Telusuri Berdasarkan Genre */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-purple-950/80 text-purple-400 border border-purple-800/60">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Telusuri Berdasarkan Genre</h2>
              <p className="text-xs text-slate-400">Eksplorasi drama Korea menurut tema dan suasana hati Anda</p>
            </div>
          </div>

          <Link
            href="/katalog"
            className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 group"
          >
            <span>Buka Semua Genre</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {GENRES.map((genre) => (
            <Link
              key={genre.id}
              href={`/katalog?genre=${genre.slug}`}
              className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-rose-500/40 hover:bg-slate-900 transition-all group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-sm text-slate-200 group-hover:text-rose-300 transition-colors">
                  {genre.name}
                </span>
                <span className="text-[11px] font-mono text-slate-400">{genre.count} judul</span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                {genre.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* 7. Film Layar Lebar Korea (K-Movie) */}
      {movies.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-pink-950/80 text-pink-400 border border-pink-800/60">
                <PlayCircle className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Film Layar Lebar Korea (K-Movie)</h2>
                <p className="text-xs text-slate-400">Film bioskop blockbuster Korea Selatan berdurasi penuh</p>
              </div>
            </div>

            <Link
              href="/katalog?type=movie"
              className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 group"
            >
              <span>Semua Film Korea</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {movies.map((item) => (
              <DonghuaCard key={item.id} donghua={item} showSynopsis={true} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
