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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Trophy className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
            Papan Peringkat Resmi Drakor
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Peringkat Drama Korea Terpopuler
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-2xl">
          {periodDescriptions[period]}
        </p>
        {loadError && <p className="text-sm text-rose-400 mt-2">{loadError}</p>}
        {rankings.length === 0 && !loadError && (
          <p className="text-sm text-slate-400 mt-2">Memuat peringkat live...</p>
        )}
      </div>

      {/* Period Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-[#0b101c] border border-slate-800 rounded-2xl mb-8 overflow-x-auto scrollbar-none max-w-xl">
        {(['daily', 'weekly', 'monthly', 'all_time'] as RankingPeriod[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all text-center whitespace-nowrap ${
              period === p
                ? 'bg-rose-600 text-white font-bold shadow-md shadow-rose-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
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
                  ? 'border-amber-500/50 shadow-xl shadow-amber-500/10 order-first md:order-2 md:-translate-y-2'
                  : isSilver
                  ? 'border-slate-400/40 order-2 md:order-1'
                  : 'border-amber-800/40 order-3'
              }`}
            >
              {/* Crown & Rank Badge */}
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-sm shadow-md ${
                    isGold
                      ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300'
                      : isSilver
                      ? 'bg-slate-200 text-slate-900 ring-2 ring-slate-300'
                      : 'bg-amber-700 text-white ring-2 ring-amber-600'
                  }`}
                >
                  #{item.rank}
                </div>

                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>{item.score} Skor</span>
                </div>
              </div>

              {/* Poster & Main Info */}
              <div className="flex items-center gap-4 mb-4">
                <div className="w-20 aspect-[3/4] rounded-xl overflow-hidden bg-slate-950 shrink-0 border border-slate-800 shadow-md">
                  <img
                    src={drama.posterUrl}
                    alt={drama.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="min-w-0">
                  <span className="text-[10px] font-semibold text-rose-400 uppercase tracking-wider">
                    {drama.network} · {drama.type === 'movie' ? 'Film' : `Ep ${drama.latestEpisode}`}
                  </span>
                  <Link
                    href={`/donghua/${drama.slug}`}
                    className="font-bold text-base text-white hover:text-rose-300 transition-colors block line-clamp-1 mt-0.5"
                  >
                    {drama.title}
                  </Link>
                  <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                    {drama.hangulTitle}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                      {formatViews(item.viewCount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <Link
                href={`/watch/${drama.slug}/${drama.latestEpisode || 1}`}
                className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
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
        <div className="bg-[#0b101c] border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Posisi & Judul Drama Korea</span>
            <div className="flex items-center gap-6">
              <span className="hidden sm:inline">Statistik Tayangan</span>
              <span>Aksi</span>
            </div>
          </div>

          <div className="divide-y divide-slate-800/60">
            {restRankings.map((item) => {
              const drama = item.drakor || item.donghua;
              if (!drama) return null;

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 hover:bg-slate-900/60 transition-colors group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 font-bold text-xs flex items-center justify-center shrink-0 tabular-nums">
                      #{item.rank}
                    </div>

                    <div className="w-12 h-16 rounded-lg overflow-hidden bg-slate-950 shrink-0 border border-slate-800">
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
                        className="font-bold text-sm text-slate-100 hover:text-rose-300 transition-colors block truncate"
                      >
                        {drama.title}
                      </Link>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 flex-wrap">
                        <span className="text-rose-400 font-medium">
                          {drama.network}
                        </span>
                        <span>·</span>
                        <span className="text-slate-300">
                          {drama.type === 'movie' ? 'Film' : `Ep ${drama.latestEpisode}`}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1 text-amber-400 font-semibold">
                          <Star className="w-3 h-3 fill-amber-400" />
                          {item.score}
                        </span>
                        <span className="hidden sm:inline">·</span>
                        <span className="hidden sm:inline text-slate-400">{drama.cast?.slice(0, 2).join(', ')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 shrink-0 pl-3">
                    <div className="text-right hidden sm:block">
                      <div className="text-xs font-semibold text-slate-200">
                        {formatViews(item.viewCount)}
                      </div>
                      <span className="text-[10px] text-slate-400">tayangan</span>
                    </div>

                    <Link
                      href={`/donghua/${drama.slug}`}
                      className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 hover:text-white text-slate-200 text-xs font-semibold transition-colors"
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
