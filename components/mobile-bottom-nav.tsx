'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Calendar, Bookmark } from 'lucide-react';
import { useWatchlist } from '@/context/watchlist-context';
import { useState } from 'react';
import { SearchCommandPalette } from './search-command-palette';

// Mobile bottom nav ala ZerDonghua: floating pill, bukan edge-to-edge.
export function MobileBottomNav() {
  const pathname = usePathname();
  const { watchlistIds } = useWatchlist();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const items = [
    { label: 'Beranda', href: '/', icon: Home },
    { label: 'Cari', href: '#search', icon: Search, action: () => setIsSearchOpen(true) },
    { label: 'Jadwal', href: '/jadwal', icon: Calendar },
    { label: 'Watchlist', href: '/watchlist', icon: Bookmark, badge: watchlistIds.length },
  ];

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 pointer-events-none">
        <div className="max-w-md mx-auto pointer-events-auto rounded-3xl bg-surface/95 border border-line shadow-lg px-2 py-1.5 flex justify-around">
          {items.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            const inner = (
              <>
                {active && <span className="absolute -top-1 w-6 h-1 rounded-full bg-accent" />}
                <span
                  className={`p-1 rounded-xl ${
                    active ? 'bg-accent/20' : 'group-hover:bg-line'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </span>
                <span className="text-[10px] tracking-tight leading-none mt-1">{item.label}</span>
                {item.badge ? (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-accent border border-line-strong text-white text-[9px] font-black flex items-center justify-center">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                ) : null}
              </>
            );
            const cls = `group relative flex-1 flex flex-col items-center py-1.5 px-2 rounded-2xl active:scale-95 transition-all ${
              active ? 'text-accent-soft font-bold' : 'text-mute hover:text-ink'
            }`;
            return item.action ? (
              <button key={item.label} onClick={item.action} className={cls}>
                {inner}
              </button>
            ) : (
              <Link key={item.label} href={item.href} className={cls}>
                {inner}
              </Link>
            );
          })}
        </div>
      </nav>
      <SearchCommandPalette isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
