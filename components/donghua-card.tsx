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
  /** Mode baris carousel Netflix: lebar tetap + snap; default: isi grid */
  row?: boolean;
}

export function DonghuaCard({ donghua, drakor, showSynopsis = false, rank, row = false }: DrakorCardProps) {
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
    <div
      className={
        row
          ? 'group relative flex flex-col shrink-0 snap-start w-[132px] sm:w-[152px] lg:w-[172px]'
          : 'group relative flex flex-col'
      }
    >
      {/* Poster Image Container — flat ala Netflix, hover naik + scale */}
      <Link
        href={`/donghua/${item.slug}`}
        className="relative block aspect-[3/4] w-full rounded-md overflow-hidden bg-elevated transition-transform duration-300 ease-out group-hover:scale-[1.04] group-hover:z-10 group-hover:shadow-xl group-hover:shadow-black/50"
      >
        {!imageError ? (
          <img
            src={item.posterUrl}
            alt={item.title}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover object-center"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-elevated text-center">
            <Film className="w-8 h-8 text-accent mb-2 opacity-70" />
            <span className="text-xs font-semibold text-sub line-clamp-2">{item.title}</span>
          </div>
        )}

        {/* Gradient Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent opacity-70 group-hover:opacity-90 transition-opacity" />

        {/* Rank Overlay Badge if provided */}
        {rank !== undefined && (
          <div className="absolute top-1.5 left-1.5 rounded-sm bg-accent font-black text-white text-[10px] sm:text-xs px-1.5 py-0.5 shadow-md">
            #{rank}
          </div>
        )}

        {/* Watchlist Quick Button */}
        <button
          onClick={handleWatchlistClick}
          aria-label={inWatchlist ? 'Hapus dari Watchlist' : 'Tambah ke Watchlist'}
          title={inWatchlist ? 'Tersimpan di Watchlist' : 'Simpan ke Watchlist'}
          className={`absolute top-1.5 right-1.5 p-1.5 rounded-full transition-all ${
            inWatchlist
              ? 'bg-accent text-white shadow-md'
              : 'bg-black/70 border border-white/30 text-white hover:bg-black/90'
          }`}
        >
          {inWatchlist ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : <Bookmark className="w-3.5 h-3.5" />}
        </button>

        {/* Center Hover Play Icon */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white text-black flex items-center justify-center shadow-lg">
            <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-black ml-0.5" />
          </div>
        </div>

        {/* Bottom Poster Info (Episode tag & Sub Indo) */}
        <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between text-[10px] sm:text-[11px] font-bold">
          <span className="bg-black/70 backdrop-blur-sm text-white px-1.5 py-0.5 rounded-sm flex items-center gap-1">
            {item.type === 'movie' ? <Film className="w-3 h-3" /> : null}
            {item.type === 'movie' ? 'Film' : `Ep ${item.latestEpisode}`}
          </span>
          <span className="bg-ok/90 text-white px-1.5 py-0.5 rounded-sm">Sub Indo</span>
        </div>
      </Link>

      {/* Content Area — tipografi minimal ala Netflix */}
      <div className="pt-2 flex-1 flex flex-col justify-between">
        <div>
          {/* Metadata Bar (Network, Status, Rating) */}
          <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-faint mb-1 flex-wrap">
            <span className="text-sub font-medium flex items-center gap-1">
              {item.type === 'movie' ? <Film className="w-3 h-3" /> : <Tv className="w-3 h-3" />}
              {item.network}
            </span>
            <span aria-hidden="true">·</span>
            <span className="text-warn flex items-center gap-0.5 font-bold">
              <Star className="w-3 h-3 fill-warn" />
              {item.rating}
            </span>
            <span aria-hidden="true">·</span>
            <span className={item.status === 'ongoing' ? 'text-ok font-medium' : 'text-faint font-medium'}>
              {item.status === 'ongoing' ? 'Ongoing' : 'Tamat'}
            </span>
          </div>

          {/* Title & Hangul */}
          <Link href={`/donghua/${item.slug}`} className="block">
            <h3 className="font-semibold text-xs sm:text-sm text-ink group-hover:text-accent transition-colors line-clamp-2 leading-snug">
              {item.title}
            </h3>
            {!row && (
              <p className="text-[10px] sm:text-[11px] text-mute line-clamp-1 mt-0.5 font-medium">
                {item.hangulTitle} {item.romanizedTitle ? `· ${item.romanizedTitle}` : ''}
              </p>
            )}
          </Link>

          {/* Cast Preview */}
          {!row && item.cast && item.cast.length > 0 && (
            <p className="text-[10px] sm:text-[11px] text-mute line-clamp-1 mt-1">
              {item.cast.slice(0, 2).join(', ')}
            </p>
          )}

          {/* Optional Synopsis */}
          {showSynopsis && (
            <p className="text-xs text-mute line-clamp-2 mt-1.5 leading-relaxed">
              {item.synopsis}
            </p>
          )}
        </div>

        {/* Genres tag list */}
        {!row && (
          <div className="flex items-center gap-1 mt-2 overflow-hidden text-[9px] sm:text-[10px] text-mute">
            {item.genres.slice(0, 2).map((genre) => (
              <span
                key={genre}
                className="px-1.5 py-0.5 rounded-sm bg-elevated text-mute whitespace-nowrap"
              >
                {genre}
              </span>
            ))}
            {item.genres.length > 2 && (
              <span className="text-faint">+{item.genres.length - 2}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export const DrakorCard = DonghuaCard;
