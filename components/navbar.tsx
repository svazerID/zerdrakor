'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Bookmark, Calendar, Trophy, Menu, X, Flame } from 'lucide-react';
import { useWatchlist } from '@/context/watchlist-context';
import { SearchCommandPalette } from './search-command-palette';

// Header ala ZerDonghua: fixed, bg-canvas/90, menyusut saat scroll,
// nav pill bar di desktop, logo mark violet + wordmark dua warna.
export function Navbar() {
  const pathname = usePathname();
  const { watchlistIds } = useWatchlist();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: React.KeyboardEvent | KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown as (e: KeyboardEvent) => void);
    return () => window.removeEventListener('keydown', handleKeyDown as (e: KeyboardEvent) => void);
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Beranda', href: '/' },
    { label: 'Katalog Drakor', href: '/katalog' },
    { label: 'Jadwal Tayang', href: '/jadwal', icon: Calendar },
    { label: 'Peringkat', href: '/peringkat', icon: Trophy },
    {
      label: 'Watchlist',
      href: '/watchlist',
      icon: Bookmark,
      badge: watchlistIds.length > 0 ? watchlistIds.length : undefined,
    },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 bg-canvas/90 border-b border-line transition-all duration-300 ${
          isScrolled ? 'shadow-sm' : ''
        }`}
      >
        <div
          className={`max-w-7xl mx-auto px-3 sm:px-6 flex items-center justify-between gap-4 transition-all duration-300 ${
            isScrolled ? 'py-3' : 'py-4 sm:py-5'
          }`}
        >
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
              <span className="w-10 h-10 rounded-2xl bg-accent p-[1.5px] shadow-sm group-hover:scale-105 transition-transform flex items-center justify-center">
                <span className="w-full h-full bg-surface rounded-[14px] flex items-center justify-center">
                  <img
                    src="/zerdrakor_icon.jpg"
                    alt="ZerDrakor Icon"
                    className="w-full h-full object-contain p-1.5 rounded-[14px]"
                  />
                </span>
              </span>
              <span className="text-xl font-black tracking-tight leading-none">
                <span className="text-ink">ZER</span>
                <span className="text-accent-soft">DRAKOR</span>
              </span>
            </Link>

            <nav className="hidden md:flex gap-1 bg-surface p-1 rounded-2xl border border-line ml-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-accent text-white shadow-sm'
                        : 'text-mute hover:text-ink hover:bg-line'
                    }`}
                  >
                    {Icon && <Icon className="w-4 h-4 opacity-80" />}
                    <span>{link.label}</span>
                    {link.badge !== undefined && (
                      <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-accent text-white">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-surface hover:bg-elevated border border-line text-xs transition-all"
              aria-label="Buka pencarian drakor (Ctrl+K)"
            >
              <Search className="w-4 h-4 text-accent-soft" />
              <span className="hidden sm:inline text-mute">Cari judul drakor, aktor...</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-black/50 border border-line rounded-md text-mute font-mono">
                Ctrl+K
              </kbd>
            </button>

            <Link
              href="/watchlist"
              className="md:hidden relative p-2.5 rounded-xl bg-surface hover:bg-elevated border border-line text-sub hover:text-ink"
              aria-label="Watchlist Drakor"
            >
              <Bookmark className="w-4 h-4" />
              {watchlistIds.length > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-accent text-white text-[9px] font-black flex items-center justify-center">
                  {watchlistIds.length > 99 ? '99+' : watchlistIds.length}
                </span>
              )}
            </Link>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl bg-surface hover:bg-elevated border border-line text-sub hover:text-ink"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden bg-surface/98 border-b border-line px-4 py-4 space-y-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    isActive ? 'text-ink bg-line' : 'text-sub hover:text-ink hover:bg-line'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    {Icon && <Icon className="w-4 h-4 text-accent-soft" />}
                    <span>{link.label}</span>
                  </span>
                  {link.badge !== undefined && (
                    <span className="px-2 py-0.5 text-xs font-bold bg-accent text-white rounded-full">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
            <p className="flex items-center gap-2 px-3 pt-1 text-xs text-mute">
              <Flame className="w-4 h-4 text-warn" /> Drama Korea Sub Indo, update tiap hari
            </p>
          </div>
        )}
      </header>

      <SearchCommandPalette isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
