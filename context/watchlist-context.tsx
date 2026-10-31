'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Drakor, PlaybackProgress } from '@/types/donghua';
import { getDrakorById } from '@/lib/data/donghua-data';

interface WatchlistContextType {
  watchlistIds: string[];
  addToWatchlist: (drakorId: string) => void;
  removeFromWatchlist: (drakorId: string) => void;
  toggleWatchlist: (drakorId: string) => void;
  isInWatchlist: (drakorId: string) => boolean;
  clearWatchlist: () => void;
  getWatchlistDrakor: () => Drakor[];
  getWatchlistDonghua: () => Drakor[]; // compatibility alias
  history: PlaybackProgress[];
  saveProgress: (progress: Omit<PlaybackProgress, 'id' | 'updatedAt'>) => void;
  clearHistory: () => void;
  isLoaded: boolean;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

const WATCHLIST_STORAGE_KEY = 'drakornusa_watchlist_v1';
const HISTORY_STORAGE_KEY = 'drakornusa_history_v1';

export function WatchlistProvider({ children }: { children: React.ReactNode }) {
  const [watchlistIds, setWatchlistIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(WATCHLIST_STORAGE_KEY) || localStorage.getItem('donghuanusa_watchlist_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed.filter((id) => typeof id === 'string');
        }
      }
    } catch {
      return [];
    }
    return [];
  });

  const [history, setHistory] = useState<PlaybackProgress[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(HISTORY_STORAGE_KEY) || localStorage.getItem('donghuanusa_history_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch {
      return [];
    }
    return [];
  });

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const saveWatchlistToStorage = (newIds: string[]) => {
    setWatchlistIds(newIds);
    try {
      localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(newIds));
    } catch (e) {
      console.error('Failed to save watchlist to localStorage', e);
    }
  };

  const addToWatchlist = (id: string) => {
    if (!watchlistIds.includes(id)) {
      const updated = [id, ...watchlistIds];
      saveWatchlistToStorage(updated);
    }
  };

  const removeFromWatchlist = (id: string) => {
    const updated = watchlistIds.filter((item) => item !== id);
    saveWatchlistToStorage(updated);
  };

  const toggleWatchlist = (id: string) => {
    if (watchlistIds.includes(id)) {
      removeFromWatchlist(id);
    } else {
      addToWatchlist(id);
    }
  };

  const isInWatchlist = (id: string) => {
    return watchlistIds.includes(id);
  };

  const clearWatchlist = () => {
    saveWatchlistToStorage([]);
  };

  const getWatchlistDrakor = (): Drakor[] => {
    return watchlistIds
      .map((id) => getDrakorById(id))
      .filter((d): d is Drakor => Boolean(d));
  };

  const saveProgress = (item: Omit<PlaybackProgress, 'id' | 'updatedAt'>) => {
    const targetId = item.drakorId || item.donghuaId || '';
    const drakor = getDrakorById(targetId);
    const updatedItem: PlaybackProgress = {
      ...item,
      drakorId: targetId,
      id: `${targetId}-${item.episodeNumber}`,
      updatedAt: new Date().toISOString(),
      drakorTitle: drakor?.title || 'Drama Korea',
      episodeTitle: `Episode ${item.episodeNumber}`,
      posterUrl: drakor?.posterUrl || '',
    };

    setHistory((prev) => {
      const filtered = prev.filter((p) => (p.drakorId || p.donghuaId) !== targetId);
      const nextHistory = [updatedItem, ...filtered].slice(0, 10);
      try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(nextHistory));
      } catch (e) {
        console.error('Failed to save history', e);
      }
      return nextHistory;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(HISTORY_STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear history', e);
    }
  };

  return (
    <WatchlistContext.Provider
      value={{
        watchlistIds,
        addToWatchlist,
        removeFromWatchlist,
        toggleWatchlist,
        isInWatchlist,
        clearWatchlist,
        getWatchlistDrakor,
        getWatchlistDonghua: getWatchlistDrakor,
        history,
        saveProgress,
        clearHistory,
        isLoaded,
      }}
    >
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
}
