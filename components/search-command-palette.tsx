'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Film, Tv, Star, ArrowRight, Compass } from 'lucide-react';
import { fetchSearch } from '@/lib/client/live';
import { Drakor } from '@/types/donghua';

interface SearchCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchCommandPalette({ isOpen, onClose }: SearchCommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'series' | 'movie'>('all');
  const [results, setResults] = useState<Drakor[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const t = setTimeout(() => {
      fetchSearch(query.trim())
        .then((d) => setResults(d.items))
        .catch(() => setResults([]));
    }, 400);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = results.filter(
    (item) => selectedType === 'all' || item.type === selectedType,
  );

  const handleSelect = (drakor: Drakor) => {
    setQuery('');
    onClose();
    router.push(`/donghua/${drakor.slug}`);
  };

  const handleClose = () => {
    setQuery('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-[#0f172a] border border-line-strong/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header / Search Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-line bg-elevated/90">
          <Search className="w-5 h-5 text-accent-soft shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari judul drakor, aktor, hangul... (contoh: Kim Ji-won, Queen of Tears, tvN)"
            className="w-full bg-transparent text-white placeholder-mute text-sm sm:text-base outline-none font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-mute hover:text-white p-1 rounded-md transition-colors"
              aria-label="Bersihkan pencarian"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={handleClose}
            className="text-xs px-2 py-1 rounded bg-line text-sub hover:text-white hover:bg-line-strong transition-colors shrink-0"
          >
            ESC
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-line/80 bg-elevated/50 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-mute mr-1 hidden sm:inline">Format:</span>
            <button
              onClick={() => setSelectedType('all')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                selectedType === 'all'
                  ? 'bg-accent/20 text-accent-soft border border-accent/30'
                  : 'text-mute hover:text-sub hover:bg-line'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setSelectedType('series')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                selectedType === 'series'
                  ? 'bg-accent/20 text-accent-soft border border-accent/30'
                  : 'text-mute hover:text-sub hover:bg-line'
              }`}
            >
              Serial Drakor
            </button>
            <button
              onClick={() => setSelectedType('movie')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                selectedType === 'movie'
                  ? 'bg-accent/20 text-accent-soft border border-accent/30'
                  : 'text-mute hover:text-sub hover:bg-line'
              }`}
            >
              Film Korea (K-Movie)
            </button>
          </div>
          <span className="text-faint text-[11px]">{filtered.length} ditemukan</span>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 divide-y divide-line/40">
          {filtered.length > 0 ? (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => handleSelect(item)}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-line/70 cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-16 rounded-lg overflow-hidden bg-line shrink-0 relative border border-line-strong/50">
                    <img
                      src={item.posterUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-accent-soft flex items-center gap-1">
                        {item.type === 'movie' ? <Film className="w-3 h-3" /> : <Tv className="w-3 h-3" />}
                        {item.type === 'movie' ? 'Film Korea' : 'Serial Drakor'}
                      </span>
                      <span className="text-faint text-xs">·</span>
                      <span className="text-[11px] font-medium text-sub">
                        {item.network}
                      </span>
                      <span className="text-faint text-xs">·</span>
                      <span className="text-xs text-warn flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-warn" />
                        {item.rating}
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-white group-hover:text-accent-soft transition-colors truncate">
                      {item.title}
                    </h4>
                    <p className="text-xs text-mute truncate">
                      {item.hangulTitle} {item.romanizedTitle ? `· ${item.romanizedTitle}` : ''}
                    </p>
                    <p className="text-[11px] text-mute truncate mt-0.5">
                      Pemeran: {item.cast.slice(0, 3).join(', ')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-mute group-hover:text-accent-soft pl-2 shrink-0">
                  <span className="text-xs hidden sm:inline">Buka Detail</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 px-4 text-center">
              <Compass className="w-10 h-10 text-faint mx-auto mb-3" />
              <p className="text-sub font-medium text-sm">
                Tidak ada drama Korea yang cocok dengan &ldquo;{query}&rdquo;
              </p>
              <p className="text-faint text-xs mt-1">
                Coba gunakan kata kunci nama aktor (Kim Soo-hyun, Park Shin-hye) atau genre favorit.
              </p>
              <button
                onClick={() => {
                  handleClose();
                  router.push('/katalog');
                }}
                className="mt-4 px-4 py-2 bg-accent hover:bg-accent text-white text-xs font-medium rounded-lg transition-colors"
              >
                Jelajahi Semua Katalog Drakor
              </button>
            </div>
          )}
        </div>

        {/* Footer shortcuts info */}
        <div className="px-4 py-2 bg-canvas/80 border-t border-line/80 flex items-center justify-between text-[11px] text-mute">
          <span>Tekan ESC untuk menutup</span>
          <span className="text-accent-soft">Ctrl + K untuk pencarian instan drama Korea</span>
        </div>
      </div>
    </div>
  );
}
