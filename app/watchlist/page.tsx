'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bookmark, Trash2, Compass } from 'lucide-react';
import { useWatchlist } from '@/context/watchlist-context';
import { fetchDetail } from '@/lib/client/live';
import type { Drakor } from '@/types/donghua';
import { DonghuaCard } from '@/components/donghua-card';

export default function WatchlistPage() {
  const { watchlistIds, removeFromWatchlist, clearWatchlist, isLoaded } =
    useWatchlist();

  const [filterStatus, setFilterStatus] = useState<'all' | 'ongoing' | 'completed'>('all');
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [drakorList, setDrakorList] = useState<Drakor[]>([]);

  useEffect(() => {
    if (!isLoaded) return;
    Promise.all(
      watchlistIds.map(async (id) => {
        try {
          return await fetchDetail(id);
        } catch {
          return null;
        }
      }),
    ).then((items) => setDrakorList(items.filter((d) => Boolean(d)) as Drakor[]));
  }, [isLoaded, watchlistIds]);

  const filtered = drakorList.filter((item) => {
    if (filterStatus === 'all') return true;
    return item.status === filterStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-8">
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-accent/20 text-accent-soft border border-accent/30">
              <Bookmark className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-accent-soft uppercase tracking-wider">
              Daftar Drama Korea Tersimpan
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Watchlist Drakor Saya
          </h1>
          <p className="text-sm text-mute mt-1">
            Simpan serial drakor dan film Korea favorit Anda secara lokal di peramban tanpa perlu masuk akun
          </p>
        </div>

        {drakorList.length > 0 && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {showConfirmClear ? (
              <div className="flex items-center gap-2 bg-accent/20 border border-accent p-1.5 rounded-xl text-xs">
                <span className="text-accent pl-1">Hapus semua?</span>
                <button
                  onClick={() => {
                    clearWatchlist();
                    setShowConfirmClear(false);
                  }}
                  className="px-2 py-1 rounded bg-accent hover:bg-accent text-white font-bold"
                >
                  Ya, Bersihkan
                </button>
                <button
                  onClick={() => setShowConfirmClear(false)}
                  className="px-2 py-1 rounded bg-line text-sub hover:text-white"
                >
                  Batal
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirmClear(true)}
                className="px-3 py-2 rounded-xl bg-elevated border border-line text-mute hover:text-accent-soft hover:border-accent/50 text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Kosongkan Watchlist</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Filter Tabs if items exist */}
      {drakorList.length > 0 && (
        <div className="flex items-center justify-between bg-[#0b101c] border border-line rounded-xl p-3 mb-6 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-mute font-medium">Filter Status:</span>
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                filterStatus === 'all'
                  ? 'bg-accent text-white font-bold'
                  : 'text-mute hover:text-white'
              }`}
            >
              Semua ({drakorList.length})
            </button>
            <button
              onClick={() => setFilterStatus('ongoing')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                filterStatus === 'ongoing'
                  ? 'bg-accent text-white font-bold'
                  : 'text-mute hover:text-white'
              }`}
            >
              Ongoing ({drakorList.filter((d) => d.status === 'ongoing').length})
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                filterStatus === 'completed'
                  ? 'bg-accent text-white font-bold'
                  : 'text-mute hover:text-white'
              }`}
            >
              Tamat ({drakorList.filter((d) => d.status === 'completed').length})
            </button>
          </div>

          <span className="text-mute font-mono">
            {filtered.length} dari {drakorList.length} judul
          </span>
        </div>
      )}

      {/* Main Grid or Empty State */}
      {!isLoaded || (watchlistIds.length > 0 && drakorList.length === 0) ? (
        <div className="py-20 text-center text-mute text-sm">
          Memuat watchlist drama Korea...
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
          {filtered.map((item) => (
            <div key={item.id} className="relative group">
              <DonghuaCard donghua={item} showSynopsis={true} />
              {/* Quick Remove Button on Card */}
              <button
                onClick={() => removeFromWatchlist(item.id)}
                className="absolute top-2 left-2 z-20 px-2 py-1 rounded-md bg-black/80 hover:bg-accent text-sub hover:text-white text-[10px] font-semibold flex items-center gap-1 backdrop-blur-xs transition-colors"
                title="Hapus dari watchlist"
              >
                <Trash2 className="w-3 h-3" />
                <span className="hidden sm:inline">Hapus</span>
              </button>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="py-20 px-4 text-center bg-[#0d1322] border border-dashed border-line rounded-2xl max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-line text-faint flex items-center justify-center mx-auto mb-4">
            <Bookmark className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Watchlist Drakor Anda Masih Kosong</h3>
          <p className="text-xs text-mute mb-6 leading-relaxed">
            Anda belum menambahkan serial drama Korea atau film ke dalam daftar tontonan. Jelajahi katalog sekarang dan tekan tombol ikon bookmark untuk menyimpan drama favorit Anda.
          </p>
          <Link
            href="/katalog"
            className="px-5 py-2.5 rounded-xl bg-accent hover:bg-accent text-white font-semibold text-xs transition-colors inline-flex items-center gap-2 shadow-lg shadow-accent/20"
          >
            <Compass className="w-4 h-4" />
            <span>Jelajahi Katalog Drama Korea</span>
          </Link>
        </div>
      )}
    </div>
  );
}
