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
  Layers,
  Lightbulb,
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
        className={`relative bg-black rounded-2xl overflow-hidden border border-slate-800 shadow-2xl transition-all ${
          isCinemaMode ? 'relative z-50 shadow-cyan-900/40 ring-2 ring-cyan-500/40' : ''
        }`}
      >
        <div className="relative aspect-video w-full flex items-center justify-center bg-[#05070c]">
          {!isErrorState ? (
            <video
              ref={videoRef}
              src={selectedSource.url}
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
              <div className="w-14 h-14 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-3">
                <AlertCircle className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">
                {isSimulatedUnavailable ? 'Simulasi Server Offline' : 'Video Tidak Dapat Diputar'}
              </h3>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                {errorMessage ||
                  'Sumber video pada server saat ini sedang mengalami gangguan atau tautan tidak tersedia. Silakan ganti ke Server Alternatif lain.'}
              </p>

              <div className="flex items-center gap-2 flex-wrap justify-center">
                <button
                  onClick={handleRetryVideo}
                  className="px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Muat Ulang Video</span>
                </button>
                {episode.videoSources.length > 1 && (
                  <button
                    onClick={() => {
                      const next = episode.videoSources.find((s) => s.id !== selectedSource.id);
                      if (next) setSelectedSource(next);
                      setHasError(false);
                      setIsSimulatedUnavailable(false);
                    }}
                    className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                  >
                    Ganti Server Alternatif
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Loading Indicator */}
          {isLoading && !isErrorState && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-xs pointer-events-none">
              <div className="w-10 h-10 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Top Info Bar inside Player */}
          <div className="absolute top-0 inset-x-0 p-4 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between text-white text-xs opacity-0 hover:opacity-100 focus-within:opacity-100 transition-opacity pointer-events-auto">
            <div className="flex items-center gap-2 truncate">
              <span className="font-bold text-cyan-400">{donghua.title}</span>
              <span>·</span>
              <span className="text-slate-300">Episode {episode.episodeNumber}</span>
              <span>·</span>
              <span className="text-emerald-400">Sub Indo</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-black/60 border border-slate-700 text-[11px] text-cyan-300">
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
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
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
                      className="w-16 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                  </div>

                  <span className="text-[11px] text-slate-300 font-mono tabular-nums">
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
                    className="bg-black/60 border border-slate-700 text-slate-300 rounded px-1.5 py-0.5 text-[11px] outline-none cursor-pointer"
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
                      isCinemaMode ? 'text-amber-400' : 'text-slate-300'
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
                      isTheater ? 'text-cyan-400' : 'text-slate-300'
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

        {/* Video Player Sub-Bar: Server Picker, Subtitles, Episode Nav, & Simulation Toggle */}
        <div className="bg-[#0b101c] p-3.5 border-t border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          {/* Episode Navigation */}
          <div className="flex items-center gap-2">
            {prevEpisode ? (
              <Link
                href={`/watch/${donghua.slug}/${prevEpisode.episodeNumber}`}
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 hover:bg-slate-800 text-slate-200 font-medium flex items-center gap-1 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Ep {prevEpisode.episodeNumber}</span>
              </Link>
            ) : (
              <span className="px-3 py-1.5 rounded-lg bg-slate-900/40 border border-slate-800 text-slate-600 font-medium flex items-center gap-1 cursor-not-allowed">
                <ChevronLeft className="w-4 h-4" />
                <span>Ep Awal</span>
              </span>
            )}

            <span className="font-semibold text-white px-2">
              Episode {episode.episodeNumber}
            </span>

            {nextEpisode ? (
              <Link
                href={`/watch/${donghua.slug}/${nextEpisode.episodeNumber}`}
                className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium flex items-center gap-1 transition-colors"
              >
                <span>Ep {nextEpisode.episodeNumber}</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            ) : (
              <span className="px-3 py-1.5 rounded-lg bg-slate-900/40 border border-slate-800 text-slate-600 font-medium flex items-center gap-1 cursor-not-allowed">
                <span>Ep Akhir</span>
                <ChevronRight className="w-4 h-4" />
              </span>
            )}
          </div>

          {/* Server Switcher */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              Server:
            </span>
            <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
              {episode.videoSources.map((source) => (
                <button
                  key={source.id}
                  onClick={() => {
                    setSelectedSource(source);
                    setHasError(false);
                    setIsSimulatedUnavailable(false);
                  }}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                    selectedSource.id === source.id
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {source.quality} · {source.name.split(' ')[1] || 'HD'}
                </button>
              ))}
            </div>

            {/* Subtitle toggle */}
            <div className="flex items-center gap-1 text-[11px] text-slate-400 ml-2">
              <Subtitles className="w-3.5 h-3.5 text-emerald-400" />
              <button
                onClick={() => setActiveSubtitle(activeSubtitle === 'id' ? 'off' : 'id')}
                className={`px-2 py-0.5 rounded border ${
                  activeSubtitle === 'id'
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
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
              className="text-[11px] text-slate-400 hover:text-slate-300 underline underline-offset-2 ml-1"
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
