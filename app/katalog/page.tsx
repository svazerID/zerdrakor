'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, X, RefreshCw, Compass } from 'lucide-react';
import { DRAKOR_LIST, GENRES } from '@/lib/data/donghua-data';
import { DonghuaCard } from '@/components/donghua-card';
import { DramaType, DramaStatus } from '@/types/donghua';

function CatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialSearch = searchParams.get('q') || '';
  const initialGenre = searchParams.get('genre') || 'all';
  const initialType = (searchParams.get('type') as DramaType | 'all') || 'all';
  const initialStatus = (searchParams.get('status') as DramaStatus | 'all') || 'all';
  const initialSort = searchParams.get('sort') || 'popular';

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedGenre, setSelectedGenre] = useState(initialGenre);
  const [selectedType, setSelectedType] = useState<DramaType | 'all'>(initialType);
  const [selectedStatus, setSelectedStatus] = useState<DramaStatus | 'all'>(initialStatus);
  const [sortBy, setSortBy] = useState(initialSort);

  // Filter & sort computation
  const filteredList = useMemo(() => {
    return DRAKOR_LIST.filter((item) => {
      // Query filter
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        q === '' ||
        item.title.toLowerCase().includes(q) ||
        item.hangulTitle.toLowerCase().includes(q) ||
        (item.romanizedTitle && item.romanizedTitle.toLowerCase().includes(q)) ||
        item.network.toLowerCase().includes(q) ||
        item.cast.some((c) => c.toLowerCase().includes(q)) ||
        item.alternativeTitles?.some((a) => a.toLowerCase().includes(q)) ||
        item.genres.some((g) => g.toLowerCase().includes(q));

      // Genre filter
      const matchesGenre =
        selectedGenre === 'all' ||
        item.genres.some((g) => {
          const matched = GENRES.find((gen) => gen.slug === selectedGenre);
          return matched ? g.toLowerCase() === matched.name.toLowerCase() : false;
        });

      // Type filter
      const matchesType = selectedType === 'all' || item.type === selectedType;

      // Status filter
      const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;

      return matchesQuery && matchesGenre && matchesType && matchesStatus;
    }).sort((a, b) => {
      if (sortBy === 'popular') return b.views - a.views;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'latest') return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      if (sortBy === 'title-asc') return a.title.localeCompare(b.title);
      if (sortBy === 'title-desc') return b.title.localeCompare(a.title);
      return 0;
    });
  }, [searchQuery, selectedGenre, selectedType, selectedStatus, sortBy]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedGenre('all');
    setSelectedType('all');
    setSelectedStatus('all');
    setSortBy('popular');
    router.push('/katalog');
  };

  const hasActiveFilters =
    searchQuery !== '' || selectedGenre !== 'all' || selectedType !== 'all' || selectedStatus !== 'all';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Title & Search Bar */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
          Katalog Drama Korea (Drakor) Lengkap
        </h1>
        <p className="text-sm text-slate-400">
          Temukan drama Korea populer, serial terbaru, dan film bioskop Korea pilihan dengan subtitle Indonesia
        </p>

        {/* Big Search Input */}
        <div className="mt-5 relative max-w-2xl">
          <Search className="w-5 h-5 text-rose-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari judul drakor, nama aktor/aktris (contoh: Kim Soo-hyun), atau tvN... (Ctrl+K)"
            className="w-full bg-[#0d1322] border border-slate-700/80 rounded-xl pl-12 pr-10 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded transition-colors"
              aria-label="Bersihkan pencarian"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-[#0b101c] border border-slate-800 rounded-xl p-4 mb-8 space-y-4">
        {/* Row 1: Type, Status, & Sort */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Tipe Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium mr-1">Format:</span>
            {(['all', 'series', 'movie'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  selectedType === t
                    ? 'bg-rose-600 text-white font-bold shadow-xs'
                    : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                {t === 'all' ? 'Semua Format' : t === 'series' ? 'Serial Drakor' : 'Film Korea (K-Movie)'}
              </button>
            ))}
          </div>

          {/* Status Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium mr-1">Status:</span>
            {(['all', 'ongoing', 'completed'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSelectedStatus(s)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  selectedStatus === s
                    ? 'bg-rose-600 text-white font-bold shadow-xs'
                    : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                {s === 'all' ? 'Semua Status' : s === 'ongoing' ? 'Ongoing (Tayang)' : 'Tamat'}
              </button>
            ))}
          </div>

          {/* Urutan / Sort */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Urutkan:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Urutan katalog drakor"
              className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs outline-none cursor-pointer"
            >
              <option value="popular">Terpopuler</option>
              <option value="rating">Rating Tertinggi</option>
              <option value="latest">Pembaruan Terbaru</option>
              <option value="title-asc">Judul (A - Z)</option>
              <option value="title-desc">Judul (Z - A)</option>
            </select>
          </div>
        </div>

        {/* Row 2: Genre Pills Bar */}
        <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-slate-800/80">
          <span className="text-slate-400 font-medium text-xs mr-1">Genre:</span>
          <button
            onClick={() => setSelectedGenre('all')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              selectedGenre === 'all'
                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            Semua
          </button>
          {GENRES.map((g) => (
            <button
              key={g.id}
              onClick={() => setSelectedGenre(g.slug)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                selectedGenre === g.slug
                  ? 'bg-rose-950 text-rose-300 border border-rose-800'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              {g.name}
            </button>
          ))}

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="ml-auto text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 py-1 px-2 rounded hover:bg-rose-950/30 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset Filter</span>
            </button>
          )}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between mb-5 text-xs text-slate-400">
        <span>Menampilkan {filteredList.length} judul drama Korea</span>
        {searchQuery && (
          <span>
            Hasil untuk kata kunci: <strong className="text-rose-400">&ldquo;{searchQuery}&rdquo;</strong>
          </span>
        )}
      </div>

      {/* Drakor Grid or Empty State */}
      {filteredList.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredList.map((item) => (
            <DonghuaCard key={item.id} donghua={item} showSynopsis={true} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="py-16 px-4 text-center bg-[#0d1322] border border-dashed border-slate-800 rounded-2xl max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-slate-800/80 text-rose-400 flex items-center justify-center mx-auto mb-4">
            <Compass className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Tidak Ada Drama Korea Ditemukan</h3>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            Tidak ditemukan drama yang cocok dengan kata kunci atau filter Anda. Coba kurangi filter atau cari nama aktor favorit.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Semua Filter & Pencarian</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-12 text-center text-slate-400">
          Memuat katalog drama Korea...
        </div>
      }
    >
      <CatalogContent />
    </Suspense>
  );
}
