'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Star, Bookmark, Play, Film, Tv, Check } from 'lucide-react';
import { Drakor } from '@/types/donghua';
import { useWatchlist } from '@/context/watchlist-context';

interface DrakorCardProps {
  donghua: Drakor; // kept prop name for backwards compatibility
  drakor?: Drakor;
  showSynopsis?: boolean;
  rank?: number;
}

export function DonghuaCard({ donghua, drakor, showSynopsis = false, rank }: DrakorCardProps) {
  const item = drakor || donghua;
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const inWatchlist = isInWatchlist(item.id);
  const [imageError, setImageError] = useState(false);

  const handleWatchlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWatchlist(item.id);
  };

  return (
    <div className="group relative flex flex-col bg-slate-900/40 hover:bg-slate-900/90 border border-slate-800/80 hover:border-rose-500/40 rounded-xl overflow-hidden transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-rose-950/20">
      {/* Poster Image Container */}
      <Link href={`/donghua/${item.slug}`} className="relative aspect-[3/4] w-full overflow-hidden bg-slate-950 block">
        {!imageError ? (
          <img
            src={item.posterUrl}
            alt={item.title}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-950 to-rose-950 text-center">
            <Film className="w-8 h-8 text-rose-400 mb-2 opacity-60" />
            <span className="text-xs font-semibold text-slate-300 line-clamp-2">{item.title}</span>
          </div>
        )}

        {/* Gradient Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-90 group-hover:opacity-75 transition-opacity" />

        {/* Rank Overlay Badge if provided */}
        {rank !== undefined && (
          <div
            className={`absolute top-2 left-2 w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shadow-md ${
              rank === 1
                ? 'bg-amber-400 text-slate-950'
                : rank === 2
                ? 'bg-slate-200 text-slate-900'
                : rank === 3
                ? 'bg-amber-700 text-white'
                : 'bg-slate-900/90 text-slate-300 border border-slate-700'
            }`}
          >
            #{rank}
          </div>
        )}

        {/* Watchlist Quick Button */}
        <button
          onClick={handleWatchlistClick}
          aria-label={inWatchlist ? 'Hapus dari Watchlist' : 'Tambah ke Watchlist'}
          title={inWatchlist ? 'Tersimpan di Watchlist' : 'Simpan ke Watchlist'}
          className={`absolute top-2 right-2 p-1.5 rounded-lg backdrop-blur-md transition-all ${
            inWatchlist
              ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
              : 'bg-black/60 text-slate-300 hover:text-white hover:bg-black/80'
          }`}
        >
          {inWatchlist ? <Check className="w-4 h-4 stroke-[2.5]" /> : <Bookmark className="w-4 h-4" />}
        </button>

        {/* Center Hover Play Icon */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-12 h-12 rounded-full bg-rose-500/95 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
            <Play className="w-5 h-5 fill-white ml-0.5" />
          </div>
        </div>

        {/* Bottom Poster Info (Episode tag, Network & Sub Indo) */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[11px] text-slate-300">
          <span className="font-semibold bg-black/75 backdrop-blur-xs px-2 py-0.5 rounded text-white flex items-center gap-1">
            {item.type === 'movie' ? 'Film' : `Ep ${item.latestEpisode}`}
          </span>
          <span className="font-semibold text-rose-300 bg-rose-950/90 border border-rose-800/60 px-1.5 py-0.5 rounded">
            Sub Indo
          </span>
        </div>
      </Link>

      {/* Content Area */}
      <div className="p-3 flex-1 flex flex-col justify-between">
        <div>
          {/* Metadata Bar (Network, Status, Rating) */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1.5 flex-wrap">
            <span className="text-rose-400 font-semibold flex items-center gap-1">
              {item.type === 'movie' ? <Film className="w-3 h-3" /> : <Tv className="w-3 h-3" />}
              {item.network}
            </span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span
              className={
                item.status === 'ongoing'
                  ? 'text-emerald-400 font-medium'
                  : 'text-amber-300 font-medium'
              }
            >
              {item.status === 'ongoing' ? 'Ongoing' : 'Tamat'}
            </span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-amber-400 flex items-center gap-0.5 font-semibold">
              <Star className="w-3 h-3 fill-amber-400" />
              {item.rating}
            </span>
          </div>

          {/* Title & Hangul */}
          <Link href={`/donghua/${item.slug}`} className="block">
            <h3 className="font-bold text-sm text-slate-100 group-hover:text-rose-300 transition-colors line-clamp-1 leading-snug">
              {item.title}
            </h3>
            <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5 font-medium">
              {item.hangulTitle} {item.romanizedTitle ? `· ${item.romanizedTitle}` : ''}
            </p>
          </Link>

          {/* Cast Preview */}
          {item.cast && item.cast.length > 0 && (
            <p className="text-[11px] text-slate-400 line-clamp-1 mt-1">
              {item.cast.slice(0, 2).join(', ')}
            </p>
          )}

          {/* Optional Synopsis */}
          {showSynopsis && (
            <p className="text-xs text-slate-400 line-clamp-2 mt-2 leading-relaxed">
              {item.synopsis}
            </p>
          )}
        </div>

        {/* Genres tag list */}
        <div className="flex items-center gap-1 mt-2.5 overflow-hidden text-[10px] text-slate-400">
          {item.genres.slice(0, 2).map((genre) => (
            <span
              key={genre}
              className="px-1.5 py-0.5 bg-slate-800/80 rounded text-slate-300 whitespace-nowrap"
            >
              {genre}
            </span>
          ))}
          {item.genres.length > 2 && (
            <span className="text-slate-400">+{item.genres.length - 2}</span>
          )}
        </div>
      </div>
    </div>
  );
}

export const DrakorCard = DonghuaCard;
