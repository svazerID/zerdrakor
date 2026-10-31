'use client';

import React, { useState, useEffect } from 'react';
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
import { fetchDetail, type DetailData } from '@/lib/client/live';
import { useWatchlist } from '@/context/watchlist-context';
import { DonghuaCard } from '@/components/donghua-card';
import { formatViews } from '@/lib/utils';

export default function DrakorDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [drama, setDrama] = useState<DetailData | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let alive = true;
    setDrama(null);
    setNotFound(false);
    fetchDetail(slug)
      .then((d) => alive && setDrama(d))
      .catch(() => alive && setNotFound(true));
    return () => {
      alive = false;
    };
  }, [slug]);

  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const [copiedShare, setCopiedShare] = useState(false);

  if (!drama && !notFound) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-mute text-sm">
        Memuat detail live...
      </div>
    );
  }

  // 404 Not Found State
  if (!drama) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-accent/10 border border-accent/20 text-accent-soft flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Drama Korea Tidak Ditemukan</h1>
        <p className="text-sm text-mute mb-6">
          Judul atau slug drama yang Anda cari tidak terdaftar di katalog DrakorNusa.
        </p>
        <Link
          href="/katalog"
          className="px-5 py-2.5 rounded-md bg-accent hover:bg-accent text-white font-semibold text-xs transition-colors inline-flex items-center gap-2"
        >
          <span>Kembali ke Katalog Drakor</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const inWatchlist = isInWatchlist(drama.id);
  const relatedList = drama.related || [];

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
      <div className="relative w-full h-[320px] sm:h-[400px] overflow-hidden bg-canvas">
        <img
          src={drama.bannerUrl || drama.posterUrl}
          alt={drama.title}
          className="w-full h-full object-cover filter brightness-75 blur-xs scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07090e] via-[#07090e]/70 to-transparent" />
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 -mt-40 sm:-mt-52 relative z-10 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left Column: Poster & Quick CTAs */}
          <div className="md:col-span-4 lg:col-span-3 flex flex-col items-center md:items-start">
            <div className="w-56 sm:w-64 md:w-full aspect-[3/4] rounded-lg overflow-hidden bg-elevated border-2 border-line-strong/80 shadow-2xl relative">
              <img
                src={drama.posterUrl}
                alt={drama.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/75 backdrop-blur-xs text-xs font-semibold text-white">
                {drama.type === 'movie' ? 'Film Korea' : `${drama.totalEpisodes} Episode`}
              </div>
              <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-accent/20 border border-accent text-xs font-semibold text-accent-soft">
                Sub Indo
              </div>
            </div>

            {/* Action Buttons */}
            <div className="w-full mt-4 space-y-2.5">
              <Link
                href={`/watch/${drama.slug}/${drama.latestEpisode || 1}`}
                className="w-full py-3 px-4 rounded-md bg-accent hover:bg-accent text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-accent/25"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Mulai Nonton Ep {drama.latestEpisode || 1}</span>
              </Link>

              <button
                onClick={() => toggleWatchlist(drama.id)}
                className={`w-full py-2.5 px-4 rounded-md font-semibold text-xs flex items-center justify-center gap-2 transition-all border ${
                  inWatchlist
                    ? 'bg-ok/20 text-ok border-ok/80'
                    : 'bg-elevated hover:bg-line text-sub border-line'
                }`}
              >
                {inWatchlist ? (
                  <>
                    <Check className="w-4 h-4 text-ok stroke-[2.5]" />
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
                className="w-full py-2 px-4 rounded-md bg-elevated/60 hover:bg-line/80 text-mute hover:text-white border border-line text-xs font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copiedShare ? 'Tautan Disalin!' : 'Bagikan Drama'}</span>
              </button>
            </div>

            {/* Quick Metadata Box */}
            <div className="w-full mt-6 bg-surface border border-line/80 rounded-md p-4 text-xs space-y-2.5">
              <div className="flex justify-between py-1 border-b border-line/60">
                <span className="text-mute">Jaringan / Network</span>
                <span className="font-semibold text-accent-soft">{drama.network}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-line/60">
                <span className="text-mute">Status Tayang</span>
                <span
                  className={`font-semibold capitalize ${
                    drama.status === 'ongoing' ? 'text-ok' : 'text-warn'
                  }`}
                >
                  {drama.status === 'ongoing' ? 'Sedang Tayang' : 'Tamat'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-line/60">
                <span className="text-mute">Tahun Rilis</span>
                <span className="font-semibold text-sub">{drama.releaseYear}</span>
              </div>
              {drama.director && (
                <div className="flex justify-between py-1 border-b border-line/60">
                  <span className="text-mute">Sutradara</span>
                  <span className="font-semibold text-sub text-right">{drama.director}</span>
                </div>
              )}
              {drama.broadcastSchedule && (
                <div className="flex justify-between py-1 border-b border-line/60">
                  <span className="text-mute">Jadwal Siaran</span>
                  <span className="font-semibold text-sub text-right">{drama.broadcastSchedule}</span>
                </div>
              )}
              <div className="flex justify-between py-1 border-b border-line/60">
                <span className="text-mute">Subtitle</span>
                <span className="font-semibold text-accent-soft">
                  {drama.subtitleLanguages.join(', ')}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-mute">Total Tayangan</span>
                <span className="font-semibold text-sub">{formatViews(drama.views)}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Title, Cast, Synopsis, Episodes, & Related */}
          <div className="md:col-span-8 lg:col-span-9 space-y-8">
            {/* Main Header Info */}
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-xs font-semibold text-accent-soft flex items-center gap-1">
                  {drama.type === 'movie' ? <Film className="w-3.5 h-3.5" /> : <Tv className="w-3.5 h-3.5" />}
                  {drama.type === 'movie' ? 'Film Korea (K-Movie)' : `Serial ${drama.network}`}
                </span>
                <span className="text-faint">·</span>
                <span className="text-xs text-warn font-bold flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-warn" />
                  {drama.rating} / 10
                </span>
                <span className="text-faint">·</span>
                <span className="text-xs text-mute">{formatViews(drama.views)} ditonton</span>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                {drama.title}
              </h1>

              <p className="text-base sm:text-lg text-accent-soft font-semibold mt-1">
                {drama.hangulTitle} {drama.romanizedTitle ? `(${drama.romanizedTitle})` : ''}
              </p>

              {/* Cast Members */}
              {drama.cast && drama.cast.length > 0 && (
                <div className="mt-3 flex items-start gap-2 text-xs">
                  <Users className="w-4 h-4 text-accent-soft shrink-0 mt-0.5" />
                  <div>
                    <span className="text-mute">Pemeran: </span>
                    <span className="font-semibold text-sub">
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
                    className="text-xs bg-line/90 hover:bg-line-strong text-sub hover:text-white px-2.5 py-1 rounded-lg border border-line-strong/60 transition-colors"
                  >
                    {genre}
                  </Link>
                ))}
              </div>
            </div>

            {/* Synopsis Section */}
            <div className="bg-surface border border-line rounded-lg p-5 sm:p-6">
              <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                <span>Sinopsis Cerita</span>
              </h3>
              <p className="text-sm text-sub leading-relaxed whitespace-pre-line">
                {drama.synopsis}
              </p>
            </div>

            {/* Episodes List Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Play className="w-4 h-4 text-accent-soft" />
                  <span>Daftar Episode Drama</span>
                  <span className="text-xs font-normal text-mute">
                    ({drama.episodes?.length || 0} episode tersedia)
                  </span>
                </h3>
                <span className="text-xs text-mute">Subtitle Indonesia (server HD/SD/ENG dari sumber)</span>
              </div>

              {drama.episodes && drama.episodes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {drama.episodes.map((ep) => (
                    <Link
                      key={ep.id}
                      href={`/watch/${drama.slug}/${ep.episodeNumber}`}
                      className="flex items-center justify-between p-3.5 rounded-md bg-elevated/60 border border-line/80 hover:border-accent-soft/40 hover:bg-elevated transition-all group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-line group-hover:bg-accent group-hover:text-white text-accent-soft flex items-center justify-center shrink-0 transition-colors">
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-semibold text-sub group-hover:text-accent-soft transition-colors truncate">
                            Episode {ep.episodeNumber}
                          </h4>
                          <p className="text-[11px] text-mute truncate mt-0.5">
                            {ep.title}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0 pl-2 text-[11px] text-mute">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {ep.duration}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-elevated/40 rounded-md border border-line">
                  <p className="text-xs text-mute">Episode belum tersedia untuk drama ini.</p>
                </div>
              )}
            </div>

            {/* Related K-Drama Recommendations */}
            {relatedList.length > 0 && (
              <div className="pt-6 border-t border-line">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-accent-soft" />
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
