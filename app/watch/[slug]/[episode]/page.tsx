'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ListVideo,
  Bookmark,
  Check,
  Share2,
  Star,
  Film,
  Tv,
  MessageSquare,
  Send,
  AlertCircle,
  ArrowRight,
  Heart,
} from 'lucide-react';
import { fetchDetail, type DetailData } from '@/lib/client/live';
import { VideoPlayer } from '@/components/player/video-player';
import { useWatchlist } from '@/context/watchlist-context';

export default function WatchEpisodePage() {
  const params = useParams();
  const slug = params?.slug as string;
  const episodeNumberStr = params?.episode as string;
  const currentEpisodeNumber = parseInt(episodeNumberStr, 10) || 1;

  const [drama, setDrama] = useState<DetailData | null>(null);
  const [notFound, setNotFound] = useState(false);
  const { isInWatchlist, toggleWatchlist } = useWatchlist();

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

  // Comments are local only (no comment backend yet): start empty, not seeded
  // with fake users, so a fresh episode honestly shows no comments yet.
  const [commentInput, setCommentInput] = useState('');
  const [comments, setComments] = useState<
    { id: string; author: string; avatarColor: string; time: string; text: string; likes: number }[]
  >([]);
  const [copiedShare, setCopiedShare] = useState(false);

  if (!drama && !notFound) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-mute text-sm">
        Memuat episode live...
      </div>
    );
  }

  // 404 Drama not found
  if (!drama) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-accent/10 border border-accent/20 text-accent-soft flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Drama Korea Tidak Ditemukan</h1>
        <p className="text-sm text-mute mb-6">
          Tidak dapat memutar video karena serial drakor tidak ditemukan.
        </p>
        <Link
          href="/katalog"
          className="px-5 py-2.5 rounded-xl bg-accent hover:bg-accent text-white font-semibold text-xs transition-colors inline-flex items-center gap-2"
        >
          <span>Kembali ke Katalog Drakor</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  // Find target episode; if the number does not exist, show the first
  // episode's player with an empty source list (honest error state) instead
  // of a sample video pretending to be the episode.
  const episodes = drama.episodes || [];
  const activeEpisode =
    episodes.find((e) => e.episodeNumber === currentEpisodeNumber) ||
    episodes[0] || {
      id: `${drama.id}-ep-${currentEpisodeNumber}`,
      drakorId: drama.id,
      title: `Episode ${currentEpisodeNumber}`,
      episodeNumber: currentEpisodeNumber,
      duration: '',
      releasedAt: '',
      videoSources: [],
    };

  const prevEpisode = episodes.find((e) => e.episodeNumber === currentEpisodeNumber - 1);
  const nextEpisode = episodes.find((e) => e.episodeNumber === currentEpisodeNumber + 1);
  const inWatchlist = isInWatchlist(drama.id);

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    const newComment = {
      id: `c-${Date.now()}`,
      author: 'Kamu (Penonton)',
      avatarColor: 'bg-accent',
      time: 'Baru saja',
      text: commentInput.trim(),
      likes: 1,
    };
    setComments([newComment, ...comments]);
    setCommentInput('');
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-mute mb-4 overflow-x-auto whitespace-nowrap">
        <Link href="/" className="hover:text-accent-soft transition-colors">
          Beranda
        </Link>
        <span>/</span>
        <Link href="/katalog" className="hover:text-accent-soft transition-colors">
          Katalog Drakor
        </Link>
        <span>/</span>
        <Link href={`/donghua/${drama.slug}`} className="hover:text-accent-soft transition-colors truncate max-w-xs">
          {drama.title}
        </Link>
        <span>/</span>
        <span className="text-accent-soft font-semibold">Episode {activeEpisode.episodeNumber}</span>
      </nav>

      {/* Main Player Row */}
      <div className="mb-8">
        <VideoPlayer
          donghua={drama}
          episode={activeEpisode}
          prevEpisode={prevEpisode}
          nextEpisode={nextEpisode}
        />
      </div>

      {/* Two Column Layout: Details & Playlist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Title, Metadata, Synopsis, Comments */}
        <div className="lg:col-span-8 space-y-6">
          {/* Header & Quick Actions */}
          <div className="bg-[#0b101c] border border-line rounded-2xl p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs text-mute mb-1.5 flex-wrap">
                  <span className="text-accent-soft font-semibold flex items-center gap-1">
                    {drama.type === 'movie' ? <Film className="w-3.5 h-3.5" /> : <Tv className="w-3.5 h-3.5" />}
                    {drama.network}
                  </span>
                  <span>·</span>
                  <span className="text-ok font-medium">Sub Indo Resmi</span>
                  <span>·</span>
                  <span className="flex items-center gap-1 text-warn font-semibold">
                    <Star className="w-3.5 h-3.5 fill-warn" />
                    {drama.rating}
                  </span>
                  <span>·</span>
                  <span className="text-mute">{drama.hangulTitle}</span>
                </div>

                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {drama.title} — Episode {activeEpisode.episodeNumber}
                </h1>
                <p className="text-xs text-mute mt-1">
                  {activeEpisode.title}
                </p>
                {drama.cast && (
                  <p className="text-xs text-accent-soft/80 font-medium mt-1">
                    Pemeran: {drama.cast.join(', ')}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => toggleWatchlist(drama.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                    inWatchlist
                      ? 'bg-ok/20 text-ok border-ok/80'
                      : 'bg-elevated hover:bg-line text-sub border-line-strong'
                  }`}
                >
                  {inWatchlist ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-ok stroke-[2.5]" />
                      <span>Di Watchlist</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>+ Watchlist</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleShare}
                  className="px-3 py-2 rounded-xl bg-elevated hover:bg-line text-sub hover:text-white border border-line-strong text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{copiedShare ? 'Tersalin' : 'Bagikan'}</span>
                </button>
              </div>
            </div>

            {/* Synopsis Dropdown / Excerpt */}
            <div className="mt-4 pt-4 border-t border-line/80">
              <h4 className="text-xs font-semibold text-sub uppercase tracking-wider mb-1">
                Sinopsis Drama Korea
              </h4>
              <p className="text-xs text-mute leading-relaxed line-clamp-3">
                {drama.synopsis}
              </p>
              <Link
                href={`/donghua/${drama.slug}`}
                className="text-xs text-accent-soft hover:text-accent-soft font-semibold inline-flex items-center gap-1 mt-2"
              >
                <span>Lihat profil & info lengkap drama ini</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Comment & Discussion Section */}
          <div className="bg-[#0b101c] border border-line rounded-2xl p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-accent-soft" />
                <h3 className="text-base font-bold text-white">Diskusi & Komentar Pemirsa ({comments.length})</h3>
              </div>
              <span className="text-xs text-mute">Komunitas DrakorNusa</span>
            </div>

            {/* Comment Form */}
            <form onSubmit={handleAddComment} className="mb-6">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder="Bagikan reaksimu tentang episode drakor ini..."
                  className="flex-1 bg-canvas border border-line-strong/80 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-mute focus:outline-none focus:border-accent"
                />
                <button
                  type="submit"
                  disabled={!commentInput.trim()}
                  className="px-4 py-2.5 rounded-xl bg-accent hover:bg-accent disabled:opacity-50 disabled:pointer-events-none text-white font-semibold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Kirim</span>
                </button>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-3.5">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="p-3 rounded-xl bg-canvas/60 border border-line/80 text-xs"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-6 h-6 rounded-full ${comment.avatarColor} text-white font-bold text-[10px] flex items-center justify-center`}
                      >
                        {comment.author.charAt(0)}
                      </div>
                      <span className="font-semibold text-sub">{comment.author}</span>
                    </div>
                    <span className="text-[11px] text-mute">{comment.time}</span>
                  </div>
                  <p className="text-sub pl-8 leading-relaxed">{comment.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Episode Playlist Sidebar */}
        <div className="lg:col-span-4 bg-[#0b101c] border border-line rounded-2xl p-4 sm:p-5 sticky top-20">
          <div className="flex items-center justify-between mb-3.5 pb-3 border-b border-line">
            <div className="flex items-center gap-2">
              <ListVideo className="w-4 h-4 text-accent-soft" />
              <h3 className="font-bold text-sm text-white">Daftar Episode</h3>
            </div>
            <span className="text-xs text-mute font-mono">
              {episodes.length} Episode
            </span>
          </div>

          <div className="max-h-[500px] overflow-y-auto space-y-2 pr-1">
            {episodes.map((ep) => {
              const isCurrent = ep.episodeNumber === currentEpisodeNumber;
              return (
                <Link
                  key={ep.id}
                  href={`/watch/${drama.slug}/${ep.episodeNumber}`}
                  className={`flex items-center justify-between p-2.5 rounded-xl text-xs transition-all ${
                    isCurrent
                      ? 'bg-accent text-white font-bold shadow-md shadow-accent/20'
                      : 'bg-elevated/60 text-sub hover:text-white hover:bg-elevated border border-line/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-6 h-6 rounded flex items-center justify-center text-[11px] font-bold shrink-0 ${
                        isCurrent ? 'bg-canvas text-accent-soft' : 'bg-line text-mute'
                      }`}
                    >
                      {ep.episodeNumber}
                    </span>
                    <span className="truncate">
                      Episode {ep.episodeNumber} {ep.title ? `- ${ep.title}` : ''}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-mono shrink-0 ml-2 ${
                      isCurrent ? 'text-white font-bold' : 'text-mute'
                    }`}
                  >
                    {ep.duration}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
