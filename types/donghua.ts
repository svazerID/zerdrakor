export type DramaType = 'series' | 'movie';
export type DramaStatus = 'ongoing' | 'completed' | 'upcoming';
export type ScheduleStatus = 'upcoming' | 'aired' | 'delayed';
export type RankingPeriod = 'daily' | 'weekly' | 'monthly' | 'all_time';

export interface VideoSource {
  id: string;
  name: string;
  quality: '1080p' | '720p' | '480p' | '360p';
  url: string;
  type: 'mp4' | 'iframe';
  serverName: string;
}

export interface SubtitleSource {
  id: string;
  language: string;
  label: string;
  isDefault?: boolean;
}

export interface Episode {
  id: string;
  drakorId: string;
  title: string;
  episodeNumber: number;
  thumbnailUrl?: string;
  releasedAt: string;
  duration: string;
  videoSources: VideoSource[];
  subtitleSources?: SubtitleSource[];
}

export interface Drakor {
  id: string;
  slug: string;
  title: string;
  hangulTitle: string; // Hangul Korea
  romanizedTitle?: string;
  alternativeTitles?: string[];
  synopsis: string;
  posterUrl: string;
  bannerUrl?: string;
  type: DramaType;
  status: DramaStatus;
  genres: string[];
  releaseYear: number;
  network: string; // tvN, SBS, JTBC, Netflix, ENA, KBS2, MBC, Disney+
  director?: string;
  cast: string[];
  rating: number; // e.g. 9.8
  views: number;
  totalEpisodes: number;
  latestEpisode: number;
  subtitleLanguages: string[]; // e.g. ['Sub Indo', 'Eng Sub']
  broadcastSchedule?: string; // e.g. 'Sabtu & Minggu 19:20 WIB'
  featured?: boolean;
  isEditorPick?: boolean;
  episodes?: Episode[];
  createdAt: string;
  updatedAt: string;
}

// Aliases for compatibility
export type Donghua = Drakor;
export type DonghuaType = DramaType;
export type DonghuaStatus = DramaStatus;

export interface Genre {
  id: string;
  name: string;
  slug: string;
  description: string;
  count?: number;
}

export interface ScheduleEntry {
  id: string;
  drakorId: string;
  drakor?: Drakor;
  // compatibility alias
  donghuaId?: string;
  donghua?: Drakor;
  dayOfWeek: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu' | 'Minggu';
  airTime: string; // e.g. '19:20 WIB'
  episodeNumber: number;
  network: string;
  status: ScheduleStatus;
}

export interface RankingEntry {
  id: string;
  drakorId: string;
  drakor?: Drakor;
  // compatibility alias
  donghuaId?: string;
  donghua?: Drakor;
  period: RankingPeriod;
  rank: number;
  viewCount: number;
  score: number;
  snapshotAt: string;
}

export interface WatchlistEntry {
  id: string;
  drakorId: string;
  addedAt: string;
  drakor?: Drakor;
}

export interface PlaybackProgress {
  id: string;
  drakorId?: string;
  donghuaId?: string;
  episodeNumber: number;
  positionSeconds: number;
  durationSeconds: number;
  updatedAt: string;
  drakorTitle?: string;
  episodeTitle?: string;
  posterUrl?: string;
}
