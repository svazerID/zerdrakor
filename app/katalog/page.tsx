'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, X, RefreshCw, Compass } from 'lucide-react';
import { fetchCatalog, type CatalogData } from '@/lib/client/live';
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
  const [page, setPage] = useState(1);
  const [data, setData] = useState<CatalogData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Live catalog: filtering/sorting happens server-side over the full
  // upstream catalogue, not over a hardcoded list. Search is debounced.
  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(true);
      fetchCatalog({ q: searchQuery, genre: selectedGenre, type: selectedType, status: selectedStatus, sort: sortBy, page, pageSize: 40 })
        .then((d) => {
          setData(d);
          setError('');
        })
        .catch((e) => setError(e?.message || 'Gagal memuat katalog'))
        .finally(() => setLoading(false));
    }, 400);
    return () => clearTimeout(t);
  }, [searchQuery, selectedGenre, selectedType, selectedStatus, sortBy, page]);

  const filteredList = data?.items || [];
  const GENRES = data?.genres || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedGenre('all');
    setSelectedType('all');
    setSelectedStatus('all');
    setSortBy('popular');
    setPage(1);
    router.push('/katalog');
  };

  const hasActiveFilters =
    searchQuery !== '' || selectedGenre !== 'all' || selectedType !== 'all' || selectedStatus !== 'all';

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-8">
      {/* Page Title & Search Bar */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
          Katalog Drama Korea (Drakor) Lengkap
        </h1>
        <p className="text-sm text-mute">
          Temukan drama Korea populer, serial terbaru, dan film bioskop Korea pilihan dengan subtitle Indonesia
        </p>

        {/* Big Search Input */}
        <div className="mt-5 relative max-w-2xl">
          <Search className="w-5 h-5 text-accent-soft absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari judul drakor, nama aktor/aktris (contoh: Kim Soo-hyun), atau tvN... (Ctrl+K)"
            className="w-full bg-[#0d1322] border border-line-strong/80 rounded-xl pl-12 pr-10 py-3 text-sm text-white placeholder-mute focus:outline-none focus:border-accent focus:ring-1 focus:ring-rose-500 transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-mute hover:text-white p-1 rounded transition-colors"
              aria-label="Bersihkan pencarian"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-[#0b101c] border border-line rounded-xl p-4 mb-8 space-y-4">
        {/* Row 1: Type, Status, & Sort */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Tipe Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-mute font-medium mr-1">Format:</span>
            {(['all', 'series', 'movie'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  selectedType === t
                    ? 'bg-accent text-white font-bold shadow-xs'
                    : 'bg-elevated text-sub hover:text-white hover:bg-line'
                }`}
              >
                {t === 'all' ? 'Semua Format' : t === 'series' ? 'Serial Drakor' : 'Film Korea (K-Movie)'}
              </button>
            ))}
          </div>

          {/* Status Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-mute font-medium mr-1">Status:</span>
            {(['all', 'ongoing', 'completed'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSelectedStatus(s)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  selectedStatus === s
                    ? 'bg-accent text-white font-bold shadow-xs'
                    : 'bg-elevated text-sub hover:text-white hover:bg-line'
                }`}
              >
                {s === 'all' ? 'Semua Status' : s === 'ongoing' ? 'Ongoing (Tayang)' : 'Tamat'}
              </button>
            ))}
          </div>

          {/* Urutan / Sort */}
          <div className="flex items-center gap-2">
            <span className="text-mute font-medium">Urutkan:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Urutan katalog drakor"
              className="bg-elevated border border-line-strong text-sub rounded-lg px-2.5 py-1.5 text-xs outline-none cursor-pointer"
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
        <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-line/80">
          <span className="text-mute font-medium text-xs mr-1">Genre:</span>
          <button
            onClick={() => setSelectedGenre('all')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              selectedGenre === 'all'
                ? 'bg-accent text-accent-soft border border-accent'
                : 'bg-elevated text-mute hover:text-sub'
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
                  ? 'bg-accent text-accent-soft border border-accent'
                  : 'bg-elevated text-mute hover:text-sub'
              }`}
            >
              {g.name}
            </button>
          ))}

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="ml-auto text-xs text-accent-soft hover:text-accent-soft flex items-center gap-1 py-1 px-2 rounded hover:bg-accent/30 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset Filter</span>
            </button>
          )}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between mb-5 text-xs text-mute">
        <span>
          {loading ? 'Memuat...' : `Menampilkan ${filteredList.length} dari ${total} judul drama Korea`}
          {error && <span className="text-accent-soft ml-2">{error}</span>}
        </span>
        {searchQuery && (
          <span>
            Hasil untuk kata kunci: <strong className="text-accent-soft">&ldquo;{searchQuery}&rdquo;</strong>
          </span>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mb-6 text-xs">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-3 py-1.5 rounded-lg bg-elevated border border-line text-sub disabled:opacity-40"
          >
            Sebelumnya
          </button>
          <span className="text-mute">
            Halaman {page} dari {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-3 py-1.5 rounded-lg bg-elevated border border-line text-sub disabled:opacity-40"
          >
            Berikutnya
          </button>
        </div>
      )}

      {/* Drakor Grid or Empty State */}
      {filteredList.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredList.map((item) => (
            <DonghuaCard key={item.id} donghua={item} showSynopsis={true} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="py-16 px-4 text-center bg-[#0d1322] border border-dashed border-line rounded-2xl max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-line/80 text-accent-soft flex items-center justify-center mx-auto mb-4">
            <Compass className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Tidak Ada Drama Korea Ditemukan</h3>
          <p className="text-xs text-mute mb-6 leading-relaxed">
            Tidak ditemukan drama yang cocok dengan kata kunci atau filter Anda. Coba kurangi filter atau cari nama aktor favorit.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 bg-accent hover:bg-accent text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-2"
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
        <div className="max-w-7xl mx-auto px-4 py-12 text-center text-mute">
          Memuat katalog drama Korea...
        </div>
      }
    >
      <CatalogContent />
    </Suspense>
  );
}
