import type { Metadata } from 'next';
import './globals.css';
import { WatchlistProvider } from '@/context/watchlist-context';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';

const APP_URL = process.env.APP_URL || 'https://ais-dev-axmubqedhypywogl5zklmh-484850806664.asia-east1.run.app';

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
    icon: '/zerdrakor_icon.jpg',
    shortcut: '/zerdrakor_icon.jpg',
    apple: '/zerdrakor_icon.jpg',
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
        {/* Favicon & Web Icons */}
        <link rel="icon" type="image/jpeg" href="/zerdrakor_icon.jpg" />
        <link rel="apple-touch-icon" href="/zerdrakor_icon.jpg" />

        {/* Primary Open Graph Meta Tags (Facebook, WhatsApp, LinkedIn, Discord) */}
        <meta property="og:site_name" content="ZerDrakor" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="ZerDrakor – Nonton & Streaming Drama Korea Sub Indo Gratis" />
        <meta
          property="og:description"
          content="Streaming drama Korea (Drakor) dan K-Movie terlengkap subtitle Indonesia resmi. Server cepat HD 1080p, jadwal tayang mingguan, dan watchlist gratis."
        />
        <meta property="og:image" content={`${APP_URL}/zerdrakor_og_preview.jpg`} />
        <meta property="og:image:secure_url" content={`${APP_URL}/zerdrakor_og_preview.jpg`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="ZerDrakor - Nonton & Streaming Drama Korea Subtitle Indonesia" />
        <meta property="og:locale" content="id_ID" />

        {/* Twitter Cards (X/Twitter) */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="ZerDrakor – Nonton & Streaming Drama Korea Sub Indo Gratis" />
        <meta
          name="twitter:description"
          content="Streaming drama Korea dan film bioskop Korea terbaru dengan subtitle Indonesia resmi, update episode tercepat, dan bebas iklan mengganggu."
        />
        <meta name="twitter:image" content={`${APP_URL}/zerdrakor_og_preview.jpg`} />
        <meta name="twitter:image:alt" content="ZerDrakor - Nonton & Streaming Drama Korea Subtitle Indonesia" />
        <meta name="twitter:creator" content="@ZerDrakor" />
        <meta name="twitter:site" content="@ZerDrakor" />

        {/* Schema.org Structured Data (JSON-LD) for Search Rich Snippets */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className="bg-[#07090e] text-slate-100 min-h-screen flex flex-col antialiased selection:bg-purple-600 selection:text-white"
        suppressHydrationWarning
      >
        <WatchlistProvider>
          <Navbar />
          <main className="flex-1 w-full">{children}</main>
          <Footer />
        </WatchlistProvider>
      </body>
    </html>
  );
}
