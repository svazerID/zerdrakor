'use client';

import React, { useEffect, useState } from 'react';
import { fetchHome, type HomeData } from '@/lib/client/live';
import { HeroSpotlight } from '@/components/hero-spotlight';
import { DonghuaCard } from '@/components/donghua-card';
import { NetflixRow } from '@/components/netflix-row';
import { SchedulePreview } from '@/components/schedule-preview';
import { RankingPreview } from '@/components/ranking-preview';
import { ContinueWatching } from '@/components/continue-watching';
import Link from 'next/link';
import { Compass } from 'lucide-react';

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
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-20 text-center">
        <h1 className="text-xl font-bold text-ink mb-2">Data live belum bisa dimuat</h1>
        <p className="text-sm text-mute">{error}. Coba muat ulang halaman.</p>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-20 text-center text-mute text-sm">
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
    <div className="pb-10 space-y-8 sm:space-y-10">
      {/* 1. Hero Spotlight full-bleed */}
      <HeroSpotlight featuredList={featured} />

      {/* 2. Continue Watching (if user has history) */}
      <ContinueWatching />

      {/* 3. Pilihan Editor & Rekomendasi Unggulan — baris carousel */}
      <NetflixRow
        title="Rekomendasi & Pilihan Editor"
        subtitle="Rating tinggi, chemistry memukau"
        seeAllHref="/katalog"
        seeAllLabel="Semua Katalog Drakor"
      >
        {editorPicks.map((item) => (
          <DonghuaCard key={item.id} donghua={item} showSynopsis={false} row />
        ))}
      </NetflixRow>

      {/* 4. Pembaruan Episode Terbaru — baris carousel */}
      <NetflixRow
        title="Pembaruan Episode Terbaru"
        subtitle="Sub Indo siap ditonton"
        seeAllHref="/katalog?sort=latest"
        seeAllLabel="Lihat Semua Rilis"
      >
        {latestUpdates.map((item) => (
          <DonghuaCard key={item.id} donghua={item} row />
        ))}
      </NetflixRow>

      {/* 5. Split Section: Jadwal Tayang Drakor & Peringkat Populer */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7">
          <SchedulePreview schedules={SCHEDULE_LIST} />
        </div>
        <div className="lg:col-span-5">
          <RankingPreview />
        </div>
      </section>

      {/* 6. Telusuri Berdasarkan Genre */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-end justify-between mb-3">
          <h2 className="flex items-center gap-2 text-lg sm:text-xl font-bold tracking-tight text-ink">
            <Compass className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
            Telusuri Berdasarkan Genre
          </h2>
          <Link
            href="/katalog"
            className="opacity-0 md:opacity-100 text-[11px] font-bold text-accent hover:text-accent-soft flex items-center gap-0.5 shrink-0"
          >
            <span>Buka Semua Genre</span>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
          {GENRES.map((genre) => (
            <Link
              key={genre.id}
              href={`/katalog?genre=${genre.slug}`}
              className="p-3.5 rounded-md bg-surface hover:bg-alt transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sm text-ink group-hover:text-accent transition-colors">
                  {genre.name}
                </span>
                <span className="text-[11px] font-mono text-faint">{genre.count}</span>
              </div>
              <p className="text-[11px] text-mute line-clamp-2 leading-relaxed">
                {genre.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* 7. Film Layar Lebar Korea (K-Movie) — baris carousel */}
      {movies.length > 0 && (
        <NetflixRow
          title="Film Layar Lebar Korea (K-Movie)"
          subtitle="Blockbuster berdurasi penuh"
          seeAllHref="/katalog?type=movie"
          seeAllLabel="Semua Film Korea"
        >
          {movies.map((item) => (
            <DonghuaCard key={item.id} donghua={item} showSynopsis={true} row />
          ))}
        </NetflixRow>
      )}
    </div>
  );
}
