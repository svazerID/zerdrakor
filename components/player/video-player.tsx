'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Play,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  Tv,
  Subtitles,
  X,
  Server,
  ExternalLink,
  Info,
} from 'lucide-react';
import { Donghua, Episode, VideoSource } from '@/types/donghua';
import { useWatchlist } from '@/context/watchlist-context';

interface VideoPlayerProps {
  donghua: Donghua;
  episode: Episode;
  prevEpisode?: Episode;
  nextEpisode?: Episode;
}

function VideoPlayerCore({ donghua, episode, prevEpisode, nextEpisode }: VideoPlayerProps) {
  const { saveProgress } = useWatchlist();
  const videoRef = useRef<HTMLVideoElement>(null);

  // Active server source initialized directly from episode
  const [selectedSource, setSelectedSource] = useState<VideoSource>(
    episode.videoSources && episode.videoSources.length > 0
      ? episode.videoSources[0]
      : {
          id: 'default',
          name: 'Server Utama 720p HD',
          quality: '720p',
          url: '',
          type: 'mp4',
          serverName: 'Default CDN',
        }
  );

  // Theater mode ala ZerDonghua WatchModal (max-w-5xl <-> max-w-7xl)
  const [isTheater, setIsTheater] = useState(false);
  const [activeSubtitle, setActiveSubtitle] = useState('id');

  // Error handling & simulation
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSimulatedUnavailable, setIsSimulatedUnavailable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Video event handlers
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime;
      const dur = videoRef.current.duration;
      if (time > 5 && dur > 0 && Math.floor(time) % 15 === 0) {
        saveProgress({
          drakorId: donghua.id,
          donghuaId: donghua.id,
          episodeNumber: episode.episodeNumber,
          positionSeconds: Math.floor(time),
          durationSeconds: Math.floor(dur),
          drakorTitle: donghua.title,
          episodeTitle: episode.title,
          posterUrl: donghua.posterUrl,
        });
      }
    }
  };

  const handleLoadedMetadata = () => {
    setIsLoading(false);
  };

  const handleRetryVideo = () => {
    setHasError(false);
    setIsSimulatedUnavailable(false);
    setIsLoading(true);
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  };

  const isErrorState = hasError || isSimulatedUnavailable || !selectedSource.url;

  return (
    <div className={`w-full transition-all duration-300 ${isTheater ? 'max-w-none' : 'max-w-5xl mx-auto'}`}>
      {/* Main Player Box */}
      <div
        id="player-container"
        className={`relative bg-surface rounded-2xl overflow-hidden border border-line shadow-2xl transition-all`}
      >
        {/* Top Header Bar ala ZerDonghua WatchModal */}
        <div className="p-3 sm:p-4 border-b border-line bg-surface flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-accent/20 border border-accent-soft/40 flex items-center justify-center text-accent-soft shrink-0">
              <Play className="w-4 h-4 fill-accent-soft" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-ink truncate">
                {donghua.title} — Episode {episode.episodeNumber}
              </h2>
              <Link
                href={`/donghua/${donghua.slug}`}
                className="text-xs text-accent-soft hover:text-ink hover:underline flex items-center gap-1 font-semibold truncate"
              >
                <span>Series: {donghua.title}</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsTheater(!isTheater)}
              className="p-2 rounded-xl bg-line hover:bg-line-strong text-mute hover:text-ink border border-line transition-colors hidden sm:flex cursor-pointer"
              title={isTheater ? 'Mode Standar' : 'Mode Bioskop (Lebar)'}
            >
              <Tv className="w-4 h-4" />
            </button>
            <Link
              href={`/donghua/${donghua.slug}`}
              className="p-2 rounded-xl bg-line hover:bg-line-strong text-mute hover:text-ink border border-line transition-colors cursor-pointer"
              title="Tutup Player"
            >
              <X className="w-5 h-5" />
            </Link>
          </div>
        </div>
        <div className="relative aspect-video w-full flex items-center justify-center bg-canvas overflow-hidden">
          {!isErrorState ? (
            <video
              ref={videoRef}
              // Lewat proxy origin sendiri, bukan URL http upstream langsung:
              // halaman https memblokir video http (mixed content) — lihat
              // app/api/stream/route.ts untuk penjelasan lengkapnya.
              src={`/api/stream?url=${encodeURIComponent(selectedSource.url)}`}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onWaiting={() => setIsLoading(true)}
              onPlaying={() => setIsLoading(false)}
              onError={() => {
                setHasError(true);
                setErrorMessage('Sumber video pada server ini sedang tidak dapat diakses atau bermasalah.');
                setIsLoading(false);
              }}
              className="w-full h-full border-0"
              controls
              playsInline
            />
          ) : (
            /* Error & Unavailable State */
            <div className="flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
              <div className="w-14 h-14 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center text-accent-soft mb-3">
                <AlertCircle className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">
                {isSimulatedUnavailable ? 'Simulasi Server Offline' : 'Video Tidak Dapat Diputar'}
              </h3>
              <p className="text-sm text-bad font-semibold -mt-1 mb-1">Gagal memuat video stream episode ini.</p>
              <p className="text-xs text-mute mb-4 leading-relaxed">
                {errorMessage ||
                  'Sumber video pada server saat ini sedang mengalami gangguan atau tautan tidak tersedia. Silakan ganti ke Server Alternatif lain.'}
              </p>

              <div className="flex items-center gap-2 flex-wrap justify-center">
                <button
                  onClick={handleRetryVideo}
                  className="px-3.5 py-2 rounded-lg bg-accent hover:bg-accent text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Coba Lagi</span>
                </button>
                {episode.videoSources.length > 1 && (
                  <button
                    onClick={() => {
                      const next = episode.videoSources.find((s) => s.id !== selectedSource.id);
                      if (next) setSelectedSource(next);
                      setHasError(false);
                      setIsSimulatedUnavailable(false);
                    }}
                    className="px-3.5 py-2 rounded-lg bg-line hover:bg-line-strong text-sub text-xs font-semibold transition-colors"
                  >
                    Ganti Server Alternatif
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Loading Indicator */}
          {isLoading && !isErrorState && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/40 backdrop-blur-xs pointer-events-none">
              <div className="w-10 h-10 rounded-full border-3 border-accent-soft border-t-transparent animate-spin" />
              <p className="text-xs text-mute font-medium">Menghubungkan ke server stream ZerDrakor...</p>
            </div>
          )}

        </div>

        {/* Server Mirrors & Navigation Controls ala ZerDonghua WatchModal */}
        <div className="p-3 sm:p-5 bg-surface border-t border-line space-y-4 sm:space-y-6 text-xs">
          {/* Server Selector */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-mute uppercase tracking-wider">
                <Server className="w-3.5 h-3.5 text-accent-soft" />
                <span>Pilih Server ({episode.videoSources.length})</span>
              </div>
              <a
                href={`/api/stream?url=${encodeURIComponent(selectedSource.url)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] sm:text-xs text-accent-soft hover:text-ink flex items-center gap-1 font-semibold hover:underline"
                title="Buka pemutar video langsung di tab terpisah"
              >
                <span>Tab Baru</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {episode.videoSources.map((source) => (
                <button
                  key={source.id}
                  onClick={() => {
                    setSelectedSource(source);
                    setHasError(false);
                    setIsSimulatedUnavailable(false);
                  }}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                    selectedSource.id === source.id
                      ? 'bg-accent text-white shadow-sm border border-line-strong'
                      : 'bg-line hover:bg-line-strong text-sub hover:text-ink border border-line'
                  }`}
                >
                  <Play className="w-3 h-3" />
                  <span>{source.quality} · {source.name.split(' ')[1] || 'HD'}</span>
                </button>
              ))}
            </div>
            <p className="text-[10px] sm:text-[11px] text-faint flex items-start gap-1.5 leading-relaxed">
              <Info className="w-3 h-3 mt-0.5 shrink-0 text-accent-soft" />
              <span>Jika video tidak bisa diputar atau error, silakan ganti server di atas atau klik Tab Baru.</span>
            </p>
          </div>

          {/* Prev / Next Episode Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-line">
            {prevEpisode ? (
              <Link
                href={`/watch/${donghua.slug}/${prevEpisode.episodeNumber}`}
                className="flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-line hover:bg-line-strong active:scale-95 text-sub hover:text-ink text-[11px] sm:text-xs font-semibold border border-line transition-all cursor-pointer"
              >
                <ChevronLeft className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                <span>Prev Ep</span>
              </Link>
            ) : (
              <span className="px-3 sm:px-4 py-2 rounded-xl bg-line/60 border border-line text-faint text-[11px] sm:text-xs font-semibold flex items-center gap-1.5 cursor-not-allowed">
                <ChevronLeft className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                <span>Ep Awal</span>
              </span>
            )}

            <Link
              href={`/donghua/${donghua.slug}`}
              className="flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-accent/20 hover:bg-accent/30 active:scale-95 text-accent-soft text-[11px] sm:text-xs font-semibold border border-accent-soft/40 transition-all cursor-pointer"
            >
              <span>Semua Episode</span>
            </Link>

            {nextEpisode ? (
              <Link
                href={`/watch/${donghua.slug}/${nextEpisode.episodeNumber}`}
                className="flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-accent hover:scale-[1.02] active:scale-95 text-white text-[11px] sm:text-xs font-semibold shadow-sm transition-all cursor-pointer"
              >
                <span>Next Ep</span>
                <ChevronRight className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
              </Link>
            ) : (
              <span className="px-3 sm:px-4 py-2 rounded-xl bg-line/60 border border-line text-faint text-[11px] sm:text-xs font-semibold flex items-center gap-1.5 cursor-not-allowed">
                <span>Ep Akhir</span>
                <ChevronRight className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
              </span>
            )}
          </div>

          {/* Subtitle & Simulation (fitur ZerDrakor yang dipertahankan) */}
          <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-line">
            {/* Subtitle toggle */}
            <div className="flex items-center gap-1 text-[11px] text-mute ml-2">
              <Subtitles className="w-3.5 h-3.5 text-ok" />
              <button
                onClick={() => setActiveSubtitle(activeSubtitle === 'id' ? 'off' : 'id')}
                className={`px-2 py-0.5 rounded border ${
                  activeSubtitle === 'id'
                    ? 'bg-ok/20 text-ok border-ok/60'
                    : 'bg-elevated text-mute border-line'
                }`}
              >
                {activeSubtitle === 'id' ? 'Sub Indo (Aktif)' : 'Sub Mati'}
              </button>
            </div>

            {/* Test Error Simulator button */}
            <button
              onClick={() => {
                setIsSimulatedUnavailable(!isSimulatedUnavailable);
                setErrorMessage('Server sedang dalam perawatan berkala atau video gagal dimuat.');
              }}
              title="Uji coba tampilan bila video tidak tersedia"
              className="text-[11px] text-mute hover:text-sub underline underline-offset-2 ml-1"
            >
              {isSimulatedUnavailable ? 'Normal' : 'Simulasi Offline'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function VideoPlayer(props: VideoPlayerProps) {
  return <VideoPlayerCore key={props.episode.id} {...props} />;
}
