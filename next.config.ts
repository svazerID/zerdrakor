import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // Allow access to remote image placeholder.
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      // Live posters/trailers come from these hosts (plain <img> today, but
      // keep the allowlist correct if the app switches to next/image).
      { protocol: 'https', hostname: 'i.mydramalist.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'v.mydramalist.com', port: '', pathname: '/**' },
    ],
  },
  // No `output: 'standalone'` here: that is for a Node server. The OpenNext
  // Cloudflare adapter produces its own Workers bundle (see wrangler.jsonc).
  transpilePackages: ['motion'],
  webpack: (config, {dev}) => {
    // HMR is disabled in AI Studio via DISABLE_HMR env var.
    // Do not modify—file watching is disabled to prevent flickering during agent edits.
    if (dev && process.env.DISABLE_HMR === 'true') {
      config.watchOptions = {
        ignored: /.*/,
      };
    }
    return config;
  },
};

export default nextConfig;
