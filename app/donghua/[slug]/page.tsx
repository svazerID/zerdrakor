'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Play,
  Bookmark,
  Check,
  Star,
  Film,
  Tv,
  Calendar,
  Share2,
  AlertCircle,
  Eye,
  Sparkles,
  ArrowRight,
  Clock,
  Users,
} from 'lucide-react';
import { getDrakorBySlug, getRelatedDrakor } from '@/lib/data/donghua-data';
import { useWatchlist } from '@/context/watchlist-context';
import { DonghuaCard } from '@/components/donghua-card';
import { formatViews } from '@/lib/utils';

export default function DrakorDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const drama = getDrakorBySlug(slug);

  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const [copiedShare, setCopiedShare] = useState(false);

  // 404 Not Found State
  if (!drama) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Drama Korea Tidak Ditemukan</h1>
        <p className="text-sm text-slate-400 mb-6">
          Judul atau slug drama yang Anda cari tidak terdaftar di katalog DrakorNusa.
        </p>
        <Link
          href="/katalog"
          className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors inline-flex items-center gap-2"
        >
          <span>Kembali ke Katalog Drakor</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const inWatchlist = isInWatchlist(drama.id);
  const relatedList = getRelatedDrakor(drama, 4);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  return (
    <div className="w-full">
      {/* Backdrop Header with Banner */}
      <div className="relative w-full h-[320px] sm:h-[400px] overflow-hidden bg-slate-950">
        <img
          src={drama.bannerUrl || drama.posterUrl}
          alt={drama.title}
          className="w-full h-full object-cover filter brightness-75 blur-xs scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07090e] via-[#07090e]/70 to-transparent" />
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-40 sm:-mt-52 relative z-10 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left Column: Poster & Quick CTAs */}
          <div className="md:col-span-4 lg:col-span-3 flex flex-col items-center md:items-start">
            <div className="w-56 sm:w-64 md:w-full aspect-[3/4] rounded-2xl overflow-hidden bg-slate-900 border-2 border-slate-700/80 shadow-2xl relative">
              <img
                src={drama.posterUrl}
                alt={drama.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/75 backdrop-blur-xs text-xs font-semibold text-white">
                {drama.type === 'movie' ? 'Film Korea' : `${drama.totalEpisodes} Episode`}
              </div>
              <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-rose-950/90 border border-rose-800 text-xs font-semibold text-rose-300">
                Sub Indo
              </div>
            </div>

            {/* Action Buttons */}
            <div className="w-full mt-4 space-y-2.5">
              <Link
                href={`/watch/${drama.slug}/${drama.latestEpisode || 1}`}
                className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-rose-600/25"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Mulai Nonton Ep {drama.latestEpisode || 1}</span>
              </Link>

              <button
                onClick={() => toggleWatchlist(drama.id)}
                className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all border ${
                  inWatchlist
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-800'
                }`}
              >
                {inWatchlist ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
                    <span>Tersimpan di Watchlist</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 h-4" />
                    <span>Tambah ke Watchlist</span>
                  </>
                )}
              </button>

              <button
                onClick={handleShare}
                className="w-full py-2 px-4 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 text-slate-400 hover:text-white border border-slate-800 text-xs font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copiedShare ? 'Tautan Disalin!' : 'Bagikan Drama'}</span>
              </button>
            </div>

            {/* Quick Metadata Box */}
            <div className="w-full mt-6 bg-[#0d1322] border border-slate-800/80 rounded-xl p-4 text-xs space-y-2.5">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Jaringan / Network</span>
                <span className="font-semibold text-rose-300">{drama.network}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Status Tayang</span>
                <span
                  className={`font-semibold capitalize ${
                    drama.status === 'ongoing' ? 'text-emerald-400' : 'text-amber-300'
                  }`}
                >
                  {drama.status === 'ongoing' ? 'Sedang Tayang' : 'Tamat'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Tahun Rilis</span>
                <span className="font-semibold text-slate-200">{drama.releaseYear}</span>
              </div>
              {drama.director && (
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Sutradara</span>
                  <span className="font-semibold text-slate-200 text-right">{drama.director}</span>
                </div>
              )}
              {drama.broadcastSchedule && (
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Jadwal Siaran</span>
                  <span className="font-semibold text-slate-200 text-right">{drama.broadcastSchedule}</span>
                </div>
              )}
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Subtitle</span>
                <span className="font-semibold text-cyan-300">
                  {drama.subtitleLanguages.join(', ')}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Total Tayangan</span>
                <span className="font-semibold text-slate-200">{formatViews(drama.views)}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Title, Cast, Synopsis, Episodes, & Related */}
          <div className="md:col-span-8 lg:col-span-9 space-y-8">
            {/* Main Header Info */}
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-xs font-semibold text-rose-400 flex items-center gap-1">
                  {drama.type === 'movie' ? <Film className="w-3.5 h-3.5" /> : <Tv className="w-3.5 h-3.5" />}
                  {drama.type === 'movie' ? 'Film Korea (K-Movie)' : `Serial ${drama.network}`}
                </span>
                <span className="text-slate-600">·</span>
                <span className="text-xs text-amber-400 font-bold flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  {drama.rating} / 10
                </span>
                <span className="text-slate-600">·</span>
                <span className="text-xs text-slate-400">{formatViews(drama.views)} ditonton</span>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                {drama.title}
              </h1>

              <p className="text-base sm:text-lg text-rose-300 font-semibold mt-1">
                {drama.hangulTitle} {drama.romanizedTitle ? `(${drama.romanizedTitle})` : ''}
              </p>

              {/* Cast Members */}
              {drama.cast && drama.cast.length > 0 && (
                <div className="mt-3 flex items-start gap-2 text-xs">
                  <Users className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400">Pemeran: </span>
                    <span className="font-semibold text-slate-200">
                      {drama.cast.join(' · ')}
                    </span>
                  </div>
                </div>
              )}

              {/* Genre Badges */}
              <div className="flex items-center gap-2 mt-4 flex-wrap">
                {drama.genres.map((genre) => (
                  <Link
                    key={genre}
                    href={`/katalog?genre=${genre.toLowerCase()}`}
                    className="text-xs bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white px-2.5 py-1 rounded-lg border border-slate-700/60 transition-colors"
                  >
                    {genre}
                  </Link>
                ))}
              </div>
            </div>

            {/* Synopsis Section */}
            <div className="bg-[#0b101c] border border-slate-800 rounded-2xl p-5 sm:p-6">
              <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                <span>Sinopsis Cerita</span>
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {drama.synopsis}
              </p>
            </div>

            {/* Episodes List Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Play className="w-4 h-4 text-rose-400" />
                  <span>Daftar Episode Drama</span>
                  <span className="text-xs font-normal text-slate-400">
                    ({drama.episodes?.length || 0} episode tersedia)
                  </span>
                </h3>
                <span className="text-xs text-slate-400">Subtitle Indonesia HD 1080p</span>
              </div>

              {drama.episodes && drama.episodes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {drama.episodes.map((ep) => (
                    <Link
                      key={ep.id}
                      href={`/watch/${drama.slug}/${ep.episodeNumber}`}
                      className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-rose-500/40 hover:bg-slate-900 transition-all group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-slate-800 group-hover:bg-rose-600 group-hover:text-white text-rose-400 flex items-center justify-center shrink-0 transition-colors">
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-semibold text-slate-200 group-hover:text-rose-300 transition-colors truncate">
                            Episode {ep.episodeNumber}
                          </h4>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">
                            {ep.title}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0 pl-2 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {ep.duration}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-900/40 rounded-xl border border-slate-800">
                  <p className="text-xs text-slate-400">Episode belum tersedia untuk drama ini.</p>
                </div>
              )}
            </div>

            {/* Related K-Drama Recommendations */}
            {relatedList.length > 0 && (
              <div className="pt-6 border-t border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-rose-400" />
                    <h3 className="text-lg font-bold text-white">Rekomendasi Drama Serupa</h3>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {relatedList.map((rel) => (
                    <DonghuaCard key={rel.id} donghua={rel} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
