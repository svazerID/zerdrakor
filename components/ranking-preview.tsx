'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trophy, Star, Eye, ArrowRight } from 'lucide-react';
import { RankingEntry, RankingPeriod } from '@/types/donghua';
import { fetchRankings } from '@/lib/client/live';
import { formatViews } from '@/lib/utils';

export function RankingPreview() {
  const [period, setPeriod] = useState<RankingPeriod>('weekly');
  const [allRankings, setAllRankings] = useState<RankingEntry[]>([]);

  useEffect(() => {
    let alive = true;
    fetchRankings(period)
      .then((d) => alive && setAllRankings(d.items))
      .catch(() => alive && setAllRankings([]));
    return () => {
      alive = false;
    };
  }, [period]);

  const rankings = allRankings.slice(0, 6);

  const periodLabels: Record<RankingPeriod, string> = {
    daily: 'Hari Ini',
    weekly: 'Mingguan',
    monthly: 'Bulanan',
    all_time: 'Sepanjang Masa',
  };

  return (
    <div className="w-full bg-surface rounded-lg p-5 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-md bg-warn/15 text-warn border border-warn/40">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Peringkat Drakor Terpopuler</h2>
            <p className="text-xs text-mute">Drama Korea paling banyak ditonton pemirsa</p>
          </div>
        </div>

        <Link
          href="/peringkat"
          className="text-xs font-semibold text-accent-soft hover:text-accent-soft flex items-center gap-1 group self-start sm:self-auto"
        >
          <span>Papan Peringkat Lengkap</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-elevated/90 rounded-md border border-line mb-5 overflow-x-auto scrollbar-none">
        {(['daily', 'weekly', 'monthly', 'all_time'] as RankingPeriod[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`flex-1 min-w-[90px] py-1.5 px-3 rounded-lg text-xs font-medium transition-all text-center whitespace-nowrap ${
              period === p
                ? 'bg-accent text-white font-bold shadow-sm'
                : 'text-mute hover:text-white'
            }`}
          >
            {periodLabels[p]}
          </button>
        ))}
      </div>

      {/* Ranking List */}
      <div className="divide-y divide-line/60">
        {rankings.map((item) => {
          const drama = item.drakor || item.donghua;
          if (!drama) return null;

          return (
            <Link
              key={item.id}
              href={`/donghua/${drama.slug}`}
              className="flex items-center justify-between py-2.5 px-2 rounded-md hover:bg-elevated/80 transition-colors group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                {/* Rank Badge */}
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 tabular-nums ${
                    item.rank === 1
                      ? 'bg-warn text-canvas shadow-md shadow-warn/20'
                      : item.rank === 2
                      ? 'bg-sub text-canvas'
                      : item.rank === 3
                      ? 'bg-warn text-white'
                      : 'bg-line text-mute'
                  }`}
                >
                  {item.rank}
                </div>

                {/* Poster Thumbnail */}
                <div className="w-10 h-14 rounded-lg overflow-hidden bg-canvas shrink-0 border border-line">
                  <img
                    src={drama.posterUrl}
                    alt={drama.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Title & Metadata */}
                <div className="min-w-0">
                  <h4 className="font-semibold text-sm text-ink group-hover:text-accent-soft transition-colors truncate">
                    {drama.title}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-mute mt-0.5">
                    <span className="text-accent-soft font-medium">
                      {drama.network}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1 text-warn">
                      <Star className="w-3 h-3 fill-warn" />
                      {drama.rating}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1 text-mute">
                      <Eye className="w-3 h-3" />
                      {formatViews(item.viewCount)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-faint group-hover:text-accent-soft pl-2 shrink-0">
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
