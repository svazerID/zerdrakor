'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Bookmark, Calendar, Trophy, Menu, X, Play } from 'lucide-react';
import { useWatchlist } from '@/context/watchlist-context';
import { SearchCommandPalette } from './search-command-palette';

// Header ala Netflix: transparan dengan gradasi gelap di paling atas
// (menimpa hero full-bleed), lalu menjadi solid bg-canvas saat scroll.
// Wordmark merah Netflix, link teks polos tanpa pill background.
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
    const handleScroll = () => setIsScrolled(window.scrollY > 24);
    handleScroll();
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
        className={`fixed top-0 left-0 right-0 z-40 transition-colors duration-300 ${
          isScrolled
            ? 'bg-canvas shadow-lg shadow-black/30'
            : 'bg-gradient-to-b from-black/80 via-black/40 to-transparent'
        }`}
      >
        <div
          className={`max-w-7xl mx-auto px-3 sm:px-6 flex items-center justify-between gap-4 transition-all duration-300 ${
            isScrolled ? 'py-2.5' : 'py-3.5 sm:py-4'
          }`}
        >
          <div className="flex items-center gap-5 sm:gap-8">
            <Link href="/" className="flex items-center gap-2 shrink-0 group">
              <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-md bg-accent flex items-center justify-center shadow-md shadow-black/40 group-hover:scale-105 transition-transform">
                <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white text-white" />
              </span>
              <span className="text-lg sm:text-2xl font-black tracking-tighter leading-none text-accent drop-shadow-[0_2px_6px_rgba(0,0,0,0.55)]">
                ZERDRAKOR
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-4 lg:gap-5">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-1.5 text-xs lg:text-sm transition-colors whitespace-nowrap ${
                      isActive
                        ? 'text-white font-semibold'
                        : 'text-mute hover:text-sub font-medium'
                    }`}
                  >
                    {Icon && <Icon className="w-3.5 h-3.5 opacity-80" />}
                    <span>{link.label}</span>
                    {link.badge !== undefined && (
                      <span className="ml-0.5 px-1.5 py-0.5 rounded-sm text-[10px] font-bold bg-accent text-white">
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
              className="flex items-center gap-2 p-2 sm:px-3 sm:py-1.5 rounded-md border border-line-strong/70 bg-black/40 hover:bg-black/60 text-xs transition-all"
              aria-label="Buka pencarian drakor (Ctrl+K)"
            >
              <Search className="w-4 h-4 text-white" />
              <span className="hidden sm:inline text-mute">Cari judul drakor, aktor...</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-black/60 border border-line rounded-sm text-mute font-mono">
                Ctrl+K
              </kbd>
            </button>

            <Link
              href="/watchlist"
              className="md:hidden relative p-2 text-sub hover:text-white transition-colors"
              aria-label="Watchlist Drakor"
            >
              <Bookmark className="w-5 h-5" />
              {watchlistIds.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-accent text-white text-[9px] font-black flex items-center justify-center">
                  {watchlistIds.length > 99 ? '99+' : watchlistIds.length}
                </span>
              )}
            </Link>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-sub hover:text-white transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div
            className={`md:hidden px-4 py-3 space-y-1 border-b border-line ${
              isScrolled ? 'bg-canvas' : 'bg-black/90 backdrop-blur-sm'
            }`}
          >
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between w-full text-left px-3 py-2.5 rounded-md text-sm transition-colors ${
                    isActive ? 'text-white font-bold bg-white/10' : 'text-mute hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    {Icon && <Icon className="w-4 h-4" />}
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
            <p className="px-3 pt-1 pb-1 text-xs text-faint">Drama Korea Sub Indo, update tiap hari</p>
          </div>
        )}
      </header>

      <SearchCommandPalette isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
