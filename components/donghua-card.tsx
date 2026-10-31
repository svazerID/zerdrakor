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
    <div className="group relative flex flex-col rounded-xl sm:rounded-2xl bg-elevated hover:bg-elevated border border-line hover:border-accent-soft/40 p-2 sm:p-2.5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
      {/* Poster Image Container */}
      <Link href={`/donghua/${item.slug}`} className="relative aspect-[3/4] w-full rounded-lg sm:rounded-xl overflow-hidden bg-canvas border border-line block">
        {!imageError ? (
          <img
            src={item.posterUrl}
            alt={item.title}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-elevated text-center">
            <Film className="w-8 h-8 text-accent-soft mb-2 opacity-60" />
            <span className="text-xs font-semibold text-sub line-clamp-2">{item.title}</span>
          </div>
        )}

        {/* Gradient Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

        {/* Rank Overlay Badge if provided */}
        {rank !== undefined && (
          <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg bg-accent font-black text-white text-[10px] sm:text-xs flex items-center justify-center shadow-sm">
            #{rank}
          </div>
        )}

        {/* Watchlist Quick Button */}
        <button
          onClick={handleWatchlistClick}
          aria-label={inWatchlist ? 'Hapus dari Watchlist' : 'Tambah ke Watchlist'}
          title={inWatchlist ? 'Tersimpan di Watchlist' : 'Simpan ke Watchlist'}
          className={`absolute top-1.5 right-1.5 sm:top-2 sm:right-2 p-2 rounded-xl transition-all ${
            inWatchlist
              ? 'bg-accent text-white shadow-md'
              : 'bg-black/75 border border-white/20 text-white'
          }`}
        >
          {inWatchlist ? <Check className="w-4 h-4 stroke-[2.5]" /> : <Bookmark className="w-4 h-4" />}
        </button>

        {/* Center Hover Play Icon */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-accent border border-line-strong text-white flex items-center justify-center shadow-sm transform group-hover:scale-110 transition-transform">
            <Play className="w-5 h-5 fill-white ml-0.5" />
          </div>
        </div>

        {/* Bottom Poster Info (Episode tag, Network & Sub Indo) */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] sm:text-[11px] font-bold">
          <span className="bg-accent text-white shadow-sm px-2 py-0.5 rounded flex items-center gap-1">
            {item.type === 'movie' ? 'Film' : `Ep ${item.latestEpisode}`}
          </span>
          <span className="bg-ok/20 text-ok border border-ok/30 px-1.5 py-0.5 rounded">
            Sub Indo
          </span>
        </div>
      </Link>

      {/* Content Area */}
      <div className="pt-2 sm:pt-2.5 flex-1 flex flex-col justify-between">
        <div>
          {/* Metadata Bar (Network, Status, Rating) */}
          <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-mute mb-1.5 flex-wrap">
            <span className="text-accent-soft font-semibold flex items-center gap-1">
              {item.type === 'movie' ? <Film className="w-3 h-3" /> : <Tv className="w-3 h-3" />}
              {item.network}
            </span>
            <span aria-hidden="true" className="text-faint">·</span>
            <span
              className={
                item.status === 'ongoing'
                  ? 'text-ok font-medium'
                  : 'text-warn font-medium'
              }
            >
              {item.status === 'ongoing' ? 'Ongoing' : 'Tamat'}
            </span>
            <span aria-hidden="true" className="text-faint">·</span>
            <span className="text-warn flex items-center gap-0.5 font-bold">
              <Star className="w-3 h-3 fill-warn" />
              {item.rating}
            </span>
          </div>

          {/* Title & Hangul */}
          <Link href={`/donghua/${item.slug}`} className="block">
            <h3 className="font-semibold text-xs sm:text-sm text-ink group-hover:text-accent-soft transition-colors line-clamp-2 leading-tight">
              {item.title}
            </h3>
            <p className="text-[10px] sm:text-[11px] text-mute line-clamp-1 mt-0.5 font-medium">
              {item.hangulTitle} {item.romanizedTitle ? `· ${item.romanizedTitle}` : ''}
            </p>
          </Link>

          {/* Cast Preview */}
          {item.cast && item.cast.length > 0 && (
            <p className="text-[10px] sm:text-[11px] text-mute line-clamp-1 mt-1">
              {item.cast.slice(0, 2).join(', ')}
            </p>
          )}

          {/* Optional Synopsis */}
          {showSynopsis && (
            <p className="text-xs text-mute line-clamp-2 mt-2 leading-relaxed">
              {item.synopsis}
            </p>
          )}
        </div>

        {/* Genres tag list */}
        <div className="flex items-center gap-1 mt-2.5 overflow-hidden text-[9px] sm:text-[10px] text-mute">
          {item.genres.slice(0, 2).map((genre) => (
            <span
              key={genre}
              className="px-1.5 py-0.5 rounded bg-line text-mute border border-line whitespace-nowrap"
            >
              {genre}
            </span>
          ))}
          {item.genres.length > 2 && (
            <span className="text-mute">+{item.genres.length - 2}</span>
          )}
        </div>
      </div>
    </div>
  );
}

export const DrakorCard = DonghuaCard;
