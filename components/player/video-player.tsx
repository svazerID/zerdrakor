'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Settings,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  Tv,
  Subtitles,

  Lightbulb,
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

  // Playback states
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isTheater, setIsTheater] = useState(false);
  const [isCinemaMode, setIsCinemaMode] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
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
      setCurrentTime(time);
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
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setIsLoading(false);
    }
  };

  const handleTogglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    setIsMuted(vol === 0);
    if (videoRef.current) {
      videoRef.current.volume = vol;
    }
  };

  const handleToggleMute = () => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.volume = volume || 0.5;
      setIsMuted(false);
    } else {
      videoRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const handleToggleFullscreen = () => {
    const container = document.getElementById('player-container');
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
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

  const formatPlayerTime = (seconds: number) => {
    if (isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isErrorState = hasError || isSimulatedUnavailable || !selectedSource.url;

  return (
    <div className={`w-full transition-all duration-300 ${isTheater ? 'max-w-none' : 'max-w-5xl mx-auto'}`}>
      {/* Cinema Mode Backdrop */}
      {isCinemaMode && (
        <div
          className="fixed inset-0 bg-black/90 z-40 backdrop-blur-xs transition-opacity cursor-pointer"
          onClick={() => setIsCinemaMode(false)}
          title="Klik untuk mematikan mode bioskop"
        />
      )}

      {/* Main Player Box */}
      <div
        id="player-container"
        className={`relative bg-surface rounded-2xl overflow-hidden border border-line shadow-2xl transition-all ${
          isCinemaMode ? 'relative z-50 shadow-accent/40 ring-2 ring-accent/40' : ''
        }`}
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
        <div className="relative aspect-video w-full flex items-center justify-center bg-canvas">
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
              onPlaying={() => {
                setIsPlaying(true);
                setIsLoading(false);
              }}
              onPause={() => setIsPlaying(false)}
              onError={() => {
                setHasError(true);
                setErrorMessage('Sumber video pada server ini sedang tidak dapat diakses atau bermasalah.');
                setIsLoading(false);
              }}
              className="w-full h-full object-contain cursor-pointer"
              onClick={handleTogglePlay}
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

          {/* Top Info Bar inside Player */}
          <div className="absolute top-0 inset-x-0 p-4 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between text-white text-xs opacity-0 hover:opacity-100 focus-within:opacity-100 transition-opacity pointer-events-auto">
            <div className="flex items-center gap-2 truncate">
              <span className="font-bold text-accent-soft">{donghua.title}</span>
              <span>·</span>
              <span className="text-sub">Episode {episode.episodeNumber}</span>
              <span>·</span>
              <span className="text-ok">Sub Indo</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-black/60 border border-line-strong text-[11px] text-accent-soft">
                {selectedSource.quality}
              </span>
            </div>
          </div>

          {/* Bottom Player Controls */}
          {!isErrorState && (
            <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex flex-col gap-2 transition-opacity">
              {/* Progress Slider */}
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  aria-label="Progress video"
                  className="w-full h-1.5 bg-line-strong rounded-lg appearance-none cursor-pointer accent-accent"
                />
              </div>

              {/* Controls Toolbar */}
              <div className="flex items-center justify-between text-xs text-white">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleTogglePlay}
                    aria-label={isPlaying ? 'Jeda' : 'Putar'}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleToggleMute}
                      aria-label={isMuted ? 'Nyalakan Suara' : 'Bisukan'}
                      className="p-1 rounded hover:bg-white/10 text-white"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      aria-label="Volume suara"
                      className="w-16 h-1 bg-line-strong rounded-lg appearance-none cursor-pointer accent-accent"
                    />
                  </div>

                  <span className="text-[11px] text-sub font-mono tabular-nums">
                    {formatPlayerTime(currentTime)} / {formatPlayerTime(duration)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Speed selector */}
                  <select
                    value={playbackSpeed}
                    onChange={(e) => {
                      const speed = parseFloat(e.target.value);
                      setPlaybackSpeed(speed);
                      if (videoRef.current) videoRef.current.playbackRate = speed;
                    }}
                    aria-label="Kecepatan putar"
                    className="bg-black/60 border border-line-strong text-sub rounded px-1.5 py-0.5 text-[11px] outline-none cursor-pointer"
                  >
                    <option value="0.75">0.75x</option>
                    <option value="1">1.0x (Normal)</option>
                    <option value="1.25">1.25x</option>
                    <option value="1.5">1.5x</option>
                    <option value="2">2.0x</option>
                  </select>

                  {/* Cinema Mode Toggle */}
                  <button
                    onClick={() => setIsCinemaMode(!isCinemaMode)}
                    aria-label="Mode bioskop"
                    title={isCinemaMode ? 'Nyalakan Lampu' : 'Matikan Lampu (Mode Bioskop)'}
                    className={`p-1.5 rounded hover:bg-white/10 transition-colors ${
                      isCinemaMode ? 'text-warn' : 'text-sub'
                    }`}
                  >
                    <Lightbulb className="w-4 h-4" />
                  </button>

                  {/* Theater Mode Toggle */}
                  <button
                    onClick={() => setIsTheater(!isTheater)}
                    aria-label="Mode teater"
                    title={isTheater ? 'Mode Normal' : 'Mode Teater (Lebar)'}
                    className={`p-1.5 rounded hover:bg-white/10 transition-colors ${
                      isTheater ? 'text-accent-soft' : 'text-sub'
                    }`}
                  >
                    <Tv className="w-4 h-4" />
                  </button>

                  {/* Fullscreen Toggle */}
                  <button
                    onClick={handleToggleFullscreen}
                    aria-label="Layar penuh"
                    title="Layar Penuh"
                    className="p-1.5 rounded hover:bg-white/10 text-white transition-colors"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
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
