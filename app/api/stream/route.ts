import { NextRequest, NextResponse } from 'next/server';

// Proxy video lewat origin sendiri (https) supaya browser tidak memblokir
// mixed content.
//
// Penyebab "Video Tidak Dapat Diputar" di production (2026-10-31):
// semua URL video upstream adalah http://*.whatbox.ca:<port>/*.mp4 —
// server file itu hanya melayani HTTP polos di port custom, tanpa TLS.
// Halaman production adalah https, jadi Chrome di HP memblokir <video>
// http sebagai mixed content, dan player menampilkan error. File-nya
// sendiri hidup (dari container: HTTP 206, Range jalan, HD Trigger
// ~425 MB, SD ~112 MB). Proxy ini yang memperbaikinya: browser minta
// ke /api/stream (https, origin sama), server/Worker yang mengambil
// http upstream dan men-stream balik.
//
// Bukan open proxy: hanya host *.whatbox.ca dan path .mp4 yang
// diizinkan. Range diteruskan 1:1 supaya seek di player tetap jalan.

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const ALLOWED_HOST = /\.whatbox\.ca$/i;

function isAllowed(raw: string): boolean {
  try {
    const u = new URL(raw);
    if (u.protocol !== 'http:') return false;
    if (!ALLOWED_HOST.test(u.hostname)) return false;
    if (!u.pathname.toLowerCase().endsWith('.mp4')) return false;
    return true;
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get('url');
  if (!raw || !isAllowed(raw)) {
    return NextResponse.json({ error: 'invalid upstream url' }, { status: 400 });
  }

  const headers = new Headers();
  const range = req.headers.get('range');
  if (range) headers.set('range', range);
  // Upstream nginx tidak butuh UA khusus, tapi kirim yang wajar.
  headers.set('user-agent', 'Mozilla/5.0');

  let upstream: Response;
  try {
    upstream = await fetch(raw, { headers, redirect: 'follow' });
  } catch {
    return NextResponse.json({ error: 'upstream unreachable' }, { status: 502 });
  }

  if (!upstream.body) {
    return NextResponse.json({ error: 'upstream empty' }, { status: 502 });
  }

  const out = new Headers();
  // Paksa video/mp4: upstream mengirim application/octet-stream, yang
  // di sebagian browser membuat <video> ragu memutar file mp4.
  out.set('content-type', 'video/mp4');
  out.set('accept-ranges', 'bytes');
  const len = upstream.headers.get('content-length');
  if (len) out.set('content-length', len);
  const cr = upstream.headers.get('content-range');
  if (cr) out.set('content-range', cr);
  // Jangan cache di edge dalam bentuk yang menahan Range aneh-aneh.
  out.set('cache-control', 'public, max-age=3600');

  return new Response(upstream.body, {
    status: upstream.status,
    headers: out,
  });
}
