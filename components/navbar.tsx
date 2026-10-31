'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Bookmark, Calendar, Trophy, Menu, X, PlayCircle, Heart } from 'lucide-react';
import { useWatchlist } from '@/context/watchlist-context';
import { SearchCommandPalette } from './search-command-palette';

export function Navbar() {
  const pathname = usePathname();
  const { watchlistIds } = useWatchlist();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Keyboard shortcut listener for Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Background scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
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
        className={`sticky top-0 z-40 w-full transition-all duration-200 border-b ${
          isScrolled
            ? 'bg-[#070a12]/95 backdrop-blur-md border-slate-800/80 shadow-lg shadow-black/40'
            : 'bg-[#070a12]/80 backdrop-blur-sm border-slate-800/40'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 md:gap-8">
          {/* Zone 1: Brand Wordmark */}
          <Link
            href="/"
            className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-white hover:text-purple-300 transition-colors shrink-0"
          >
            <img
              src="/zerdrakor_icon.jpg"
              alt="ZerDrakor Icon"
              className="w-8 h-8 rounded-lg object-cover border border-purple-500/40 shadow-md shadow-purple-500/25"
            />
            <span className="font-extrabold tracking-tight bg-gradient-to-r from-white via-purple-100 to-rose-300 bg-clip-text text-transparent">
              Zer<span className="text-purple-400">Drakor</span>
            </span>
          </Link>

          {/* Zone 2: Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shrink-0 relative ${
                    isActive
                      ? 'text-rose-400 bg-slate-800/60'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4 opacity-80" />}
                  <span>{link.label}</span>
                  {link.badge !== undefined && (
                    <span className="ml-1 px-1.5 py-0.2 text-[11px] font-bold bg-rose-500 text-white rounded-full tabular-nums">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Zone 3: Quick Search & Primary Actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Quick Search Trigger */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/70 text-slate-400 hover:text-slate-200 hover:border-slate-600 text-xs sm:text-sm transition-all shadow-inner group"
              aria-label="Buka pencarian drakor (Ctrl+K)"
            >
              <Search className="w-4 h-4 text-slate-400 group-hover:text-rose-400 transition-colors" />
              <span className="hidden sm:inline">Cari judul drakor, aktor...</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-slate-800 border border-slate-700 rounded text-slate-400 font-mono">
                Ctrl+K
              </kbd>
            </button>

            {/* Mobile Watchlist Icon Shortcut */}
            <Link
              href="/watchlist"
              className="lg:hidden p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white relative"
              aria-label="Watchlist Drakor"
            >
              <Bookmark className="w-4 h-4" />
              {watchlistIds.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {watchlistIds.length}
                </span>
              )}
            </Link>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-800 bg-[#090d18] px-4 pt-3 pb-5 space-y-1 animate-in slide-in-from-top-2 duration-150">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-rose-400 bg-slate-800/80'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {Icon && <Icon className="w-4 h-4" />}
                    <span>{link.label}</span>
                  </div>
                  {link.badge !== undefined && (
                    <span className="px-2 py-0.5 text-xs font-bold bg-rose-500 text-white rounded-full">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* Global Command Palette */}
      <SearchCommandPalette isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
