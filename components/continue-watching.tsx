'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Play, Clock, Trash2, ArrowRight } from 'lucide-react';
import { useWatchlist } from '@/context/watchlist-context';
import { fetchDetail } from '@/lib/client/live';
import type { Drakor } from '@/types/donghua';

export function ContinueWatching() {
  const { history, clearHistory, isLoaded } = useWatchlist();
  const [resolved, setResolved] = useState<Record<string, Drakor>>({});

  useEffect(() => {
    if (!isLoaded) return;
    const ids = [...new Set(history.map((h) => h.drakorId || h.donghuaId || '').filter(Boolean))];
    // History stores a slug in drakorTitle? No: it stores the drama id
    // (cat-xxxx for live titles). Resolve each via the live detail route.
    // The player also stores drakorTitle/posterUrl on the history item, so
    // fall back to those when a detail fetch fails.
    Promise.all(
      ids.map(async (id) => {
        try {
          const d = await fetchDetail(id);
          return [id, d] as const;
        } catch {
          return null;
        }
      }),
    ).then((pairs) => {
      const map: Record<string, Drakor> = {};
      for (const p of pairs) if (p) map[p[0]] = p[1];
      setResolved(map);
    });
  }, [isLoaded, history]);

  if (!isLoaded || history.length === 0) return null;

  return (
    <div className="w-full mb-10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-rose-400" />
          <h2 className="text-xl font-bold text-white tracking-tight">Lanjutkan Menonton Drakor</h2>
        </div>
        <button
          onClick={clearHistory}
          className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
          title="Hapus riwayat tontonan"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Hapus Riwayat</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {history.slice(0, 4).map((item) => {
          const drama = resolved[item.drakorId || item.donghuaId || ''];
          if (!drama) return null;

          const progressPercent =
            item.durationSeconds > 0
              ? Math.min(100, Math.round((item.positionSeconds / item.durationSeconds) * 100))
              : 35;

          return (
            <div
              key={item.id}
              className="group bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden hover:border-rose-500/40 transition-all flex flex-col"
            >
              <div className="relative aspect-video w-full bg-slate-950 overflow-hidden">
                <img
                  src={drama.bannerUrl || drama.posterUrl}
                  alt={drama.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <Link
                    href={`/watch/${drama.slug}/${item.episodeNumber}`}
                    className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"
                    aria-label={`Lanjutkan ${drama.title} Episode ${item.episodeNumber}`}
                  >
                    <Play className="w-5 h-5 fill-white ml-0.5" />
                  </Link>
                </div>

                {/* Episode Tag */}
                <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-xs text-[11px] font-semibold text-white">
                  Episode {item.episodeNumber}
                </div>

                {/* Progress bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800">
                  <div className="h-full bg-rose-500" style={{ width: `${progressPercent}%` }} />
                </div>
              </div>

              <div className="p-3 flex-1 flex flex-col justify-between">
                <div>
                  <Link
                    href={`/donghua/${drama.slug}`}
                    className="font-semibold text-sm text-slate-100 hover:text-rose-300 transition-colors line-clamp-1"
                  >
                    {drama.title}
                  </Link>
                  <p className="text-xs text-slate-400 mt-0.5 flex items-center justify-between">
                    <span>{drama.network}</span>
                    <span className="text-rose-400 font-medium">{progressPercent}% selesai</span>
                  </p>
                </div>

                <Link
                  href={`/watch/${drama.slug}/${item.episodeNumber}`}
                  className="mt-3 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-rose-600 hover:text-white text-xs font-semibold text-slate-200 transition-colors"
                >
                  <span>Putar Sekarang</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
