'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trophy, Star, Eye, Play } from 'lucide-react';
import { RankingEntry, RankingPeriod } from '@/types/donghua';
import { fetchRankings } from '@/lib/client/live';
import { formatViews } from '@/lib/utils';

export default function RankingPage() {
  const [period, setPeriod] = useState<RankingPeriod>('weekly');
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let alive = true;
    fetchRankings(period)
      .then((d) => alive && setRankings(d.items))
      .catch((e) => alive && setLoadError(e?.message || 'Gagal memuat peringkat'));
    return () => {
      alive = false;
    };
  }, [period]);

  const periodLabels: Record<RankingPeriod, string> = {
    daily: 'Hari Ini',
    weekly: 'Mingguan',
    monthly: 'Bulanan',
    all_time: 'Sepanjang Masa',
  };

  // Honest labels: the upstream source has no daily/weekly/monthly split, so
  // each tab is a different live sort of the same recent catalogue, not a
  // separate official chart.
  const periodDescriptions: Record<RankingPeriod, string> = {
    daily: 'Diurutkan dari pembaruan terbaru di katalog live.',
    weekly: 'Diurutkan dari tayangan episode terbaru di katalog live.',
    monthly: 'Diurutkan dari rating tertinggi di katalog live.',
    all_time: 'Diurutkan dari tayangan dan rating di katalog live.',
  };
  const topThree = rankings.slice(0, 3);
  const restRankings = rankings.slice(3);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-8">
      {/* Title */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 rounded-lg bg-warn/20 text-warn border border-warn/30">
            <Trophy className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-warn uppercase tracking-wider">
            Papan Peringkat Resmi Drakor
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Peringkat Drama Korea Terpopuler
        </h1>
        <p className="text-sm text-mute mt-1 max-w-2xl">
          {periodDescriptions[period]}
        </p>
        {loadError && <p className="text-sm text-accent-soft mt-2">{loadError}</p>}
        {rankings.length === 0 && !loadError && (
          <p className="text-sm text-mute mt-2">Memuat peringkat live...</p>
        )}
      </div>

      {/* Period Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-[#0b101c] border border-line rounded-2xl mb-8 overflow-x-auto scrollbar-none max-w-xl">
        {(['daily', 'weekly', 'monthly', 'all_time'] as RankingPeriod[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all text-center whitespace-nowrap ${
              period === p
                ? 'bg-accent text-white font-bold shadow-md shadow-accent/20'
                : 'text-mute hover:text-white hover:bg-line/40'
            }`}
          >
            {periodLabels[p]}
          </button>
        ))}
      </div>

      {/* Top 3 Podium Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {topThree.map((item) => {
          const drama = item.drakor || item.donghua;
          if (!drama) return null;

          const isGold = item.rank === 1;
          const isSilver = item.rank === 2;
          const isBronze = item.rank === 3;

          return (
            <div
              key={item.id}
              className={`relative bg-[#0d1322] rounded-2xl overflow-hidden border p-5 flex flex-col justify-between transition-all group ${
                isGold
                  ? 'border-warn/50 shadow-xl shadow-warn/10 order-first md:order-2 md:-translate-y-2'
                  : isSilver
                  ? 'border-mute/40 order-2 md:order-1'
                  : 'border-warn/40 order-3'
              }`}
            >
              {/* Crown & Rank Badge */}
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-sm shadow-md ${
                    isGold
                      ? 'bg-warn text-canvas ring-2 ring-warn'
                      : isSilver
                      ? 'bg-sub text-elevated ring-2 ring-sub'
                      : 'bg-warn text-white ring-2 ring-warn'
                  }`}
                >
                  #{item.rank}
                </div>

                <div className="flex items-center gap-1.5 text-xs font-semibold text-warn">
                  <Star className="w-4 h-4 fill-warn" />
                  <span>{item.score} Skor</span>
                </div>
              </div>

              {/* Poster & Main Info */}
              <div className="flex items-center gap-4 mb-4">
                <div className="w-20 aspect-[3/4] rounded-xl overflow-hidden bg-canvas shrink-0 border border-line shadow-md">
                  <img
                    src={drama.posterUrl}
                    alt={drama.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="min-w-0">
                  <span className="text-[10px] font-semibold text-accent-soft uppercase tracking-wider">
                    {drama.network} · {drama.type === 'movie' ? 'Film' : `Ep ${drama.latestEpisode}`}
                  </span>
                  <Link
                    href={`/donghua/${drama.slug}`}
                    className="font-bold text-base text-white hover:text-accent-soft transition-colors block line-clamp-1 mt-0.5"
                  >
                    {drama.title}
                  </Link>
                  <p className="text-xs text-mute line-clamp-1 mt-0.5">
                    {drama.hangulTitle}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-mute">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-mute" />
                      {formatViews(item.viewCount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <Link
                href={`/watch/${drama.slug}/${drama.latestEpisode || 1}`}
                className="w-full py-2.5 rounded-xl bg-accent hover:bg-accent text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Tonton Episode {drama.latestEpisode || 1}</span>
              </Link>
            </div>
          );
        })}
      </div>

      {/* Leaderboard Table for Ranks #4+ */}
      {restRankings.length > 0 && (
        <div className="bg-[#0b101c] border border-line rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-line flex items-center justify-between text-xs text-mute">
            <span>Posisi & Judul Drama Korea</span>
            <div className="flex items-center gap-6">
              <span className="hidden sm:inline">Statistik Tayangan</span>
              <span>Aksi</span>
            </div>
          </div>

          <div className="divide-y divide-line/60">
            {restRankings.map((item) => {
              const drama = item.drakor || item.donghua;
              if (!drama) return null;

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 hover:bg-elevated/60 transition-colors group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-line text-mute font-bold text-xs flex items-center justify-center shrink-0 tabular-nums">
                      #{item.rank}
                    </div>

                    <div className="w-12 h-16 rounded-lg overflow-hidden bg-canvas shrink-0 border border-line">
                      <img
                        src={drama.posterUrl}
                        alt={drama.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    <div className="min-w-0">
                      <Link
                        href={`/donghua/${drama.slug}`}
                        className="font-bold text-sm text-ink hover:text-accent-soft transition-colors block truncate"
                      >
                        {drama.title}
                      </Link>
                      <div className="flex items-center gap-2 text-xs text-mute mt-1 flex-wrap">
                        <span className="text-accent-soft font-medium">
                          {drama.network}
                        </span>
                        <span>·</span>
                        <span className="text-sub">
                          {drama.type === 'movie' ? 'Film' : `Ep ${drama.latestEpisode}`}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1 text-warn font-semibold">
                          <Star className="w-3 h-3 fill-warn" />
                          {item.score}
                        </span>
                        <span className="hidden sm:inline">·</span>
                        <span className="hidden sm:inline text-mute">{drama.cast?.slice(0, 2).join(', ')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 shrink-0 pl-3">
                    <div className="text-right hidden sm:block">
                      <div className="text-xs font-semibold text-sub">
                        {formatViews(item.viewCount)}
                      </div>
                      <span className="text-[10px] text-mute">tayangan</span>
                    </div>

                    <Link
                      href={`/donghua/${drama.slug}`}
                      className="px-3.5 py-1.5 rounded-lg bg-line hover:bg-accent hover:text-white text-sub text-xs font-semibold transition-colors"
                    >
                      Detail
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
