import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { WatchlistProvider } from '@/context/watchlist-context';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { MobileBottomNav } from '@/components/mobile-bottom-nav';

// Font self-hosted persis ZerDonghua (bukan next/font/google — fetch
// Google Fonts pernah merusak deploy Workers).
const inter = localFont({
  src: './fonts/Inter.woff2',
  variable: '--font-inter',
  weight: '100 900',
  display: 'swap',
});
const outfit = localFont({
  src: './fonts/Outfit.woff2',
  variable: '--font-outfit',
  weight: '100 900',
  display: 'swap',
});

// Set APP_URL in the deployment environment (Workers dashboard variable) to
// the real production host. The localhost fallback is only for local dev;
// the old AI Studio URL it replaced pointed OG/canonical links at the wrong host.
const APP_URL = process.env.APP_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'ZerDrakor – Nonton & Streaming Drama Korea Sub Indo Gratis',
    template: '%s | ZerDrakor',
  },
  description:
    'Platform streaming & katalog serial drama Korea (Drakor) dan film Korea (K-Movie) terlengkap dengan subtitle Indonesia resmi. Server cepat HD 1080p, jadwal tayang mingguan stasiun tvN, SBS, JTBC, Netflix, peringkat populer, dan watchlist gratis.',
  applicationName: 'ZerDrakor',
  keywords: [
    'ZerDrakor',
    'Drama Korea',
    'Drakor Sub Indo',
    'Streaming Drakor',
    'Nonton Drakor Gratis',
    'K-Movie',
    'Drama Korea Terbaru',
    'Queen of Tears Sub Indo',
    'Lovely Runner Sub Indo',
    'Jadwal Drakor',
  ],
  authors: [{ name: 'ZerDrakor' }],
  creator: 'ZerDrakor',
  publisher: 'ZerDrakor',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'ZerDrakor – Nonton & Streaming Drama Korea Sub Indo Gratis',
    description:
      'Platform streaming & katalog drama Korea (Drakor) terlengkap subtitle Indonesia resmi. Update episode tercepat, server HD, jadwal rilis tvN, SBS, JTBC, Netflix, dan watchlist tanpa ribet.',
    url: APP_URL,
    siteName: 'ZerDrakor',
    locale: 'id_ID',
    type: 'website',
    images: [
      {
        url: '/zerdrakor_og_preview.jpg',
        width: 1200,
        height: 630,
        alt: 'ZerDrakor - Nonton & Streaming Drama Korea Subtitle Indonesia',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ZerDrakor – Nonton Drama Korea Sub Indo HD',
    description:
      'Streaming drama Korea dan film bioskop Korea terbaru dengan subtitle Indonesia resmi, update episode tercepat, dan bebas iklan mengganggu.',
    images: ['/zerdrakor_og_preview.jpg'],
    creator: '@ZerDrakor',
    site: '@ZerDrakor',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'ZerDrakor',
    url: APP_URL,
    applicationCategory: 'EntertainmentApplication',
    operatingSystem: 'All',
    description:
      'Platform streaming dan katalog drama Korea (Drakor) terlengkap dengan subtitle Indonesia resmi, pemutar episode HD, jadwal rilis mingguan, dan watchlist lokal.',
    image: `${APP_URL}/zerdrakor_og_preview.jpg`,
    inLanguage: 'id-ID',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'IDR',
    },
  };

  return (
    <html lang="id" className="dark">
      <head>
        {/* Favicon, OG, dan Twitter Cards semuanya di-render oleh metadata
         * API Next.js (export metadata di file ini + layout per-rute) —
     * tidak ada <meta>/<link> manual di sini supaya tidak duplikat.
     * Yang tersisa di head hanyalah structured data JSON-LD. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${inter.variable} ${outfit.variable} bg-canvas text-ink min-h-screen flex flex-col antialiased selection:bg-accent selection:text-white`}
        suppressHydrationWarning
      >
        <WatchlistProvider>
          <Navbar />
          {/* pt mengimbangi header fixed ala ZerDonghua */}
          <main className="flex-1 w-full pt-18 sm:pt-24">{children}</main>
          <Footer />
          <MobileBottomNav />
        </WatchlistProvider>
      </body>
    </html>
  );
}
