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
// diizinkan.
//
// Perbaikan kedua (2026-10-31, setelah Error 1102 di production):
// Worker Cloudflare punya batas CPU 10 ms (Free) / 30 detik (Paid) dan
// memori 128 MB per isolate, dan isolate itu dipakai bersama oleh
// request-request yang berjalan bersamaan. Kalau browser minta video
// dengan Range terbuka (bytes=0- atau bytes=xxxx-<total>), satu
// invocation Worker harus men-stream ratusan MB selama belasan menit —
// CPU yang terakumulasi dari memproses chunk demi chunk + memori
// isolate yang dipakai bersama request lain akhirnya melewati batas,
// dan Cloudflare mengembalikan Error 1102 "Worker exceeded resource
// limits" (bukan rate limit 1015/1027, dan bukan file mati). Buktinya:
// dari container, stream 1 KB / 1 MB / 10 MB / 20 MB / 34 MB lewat
// proxy masih 200/206, tapi di HP setelah beberapa menit nonton,
// halaman watch-nya sendiri kena 1102.
// Karena itu Range di sini DIJEPIT (clamp) maksimal 4 MB per response.
// Browser <video> sudah paham 206 yang lebih kecil dari yang diminta:
// dia akan minta range berikutnya sendiri begitu buffer butuh data
// lagi, jadi seek dan playback tetap jalan, tapi tiap invocation
// Worker hanya hidup sebentar (beberapa detik, beberapa MB) dan
// isolate tidak pernah menumpuk beban satu stream panjang.

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

const CHUNK_SIZE = 4 * 1024 * 1024; // 4 MB per response

// Ubah Range client menjadi Range yang dijepit 4 MB.
// - "bytes=123-"        -> "bytes=123-<123+4MB-1>"
// - "bytes=123-9999999" -> "bytes=123-<min(9999999, 123+4MB-1)>"
// - "bytes=-500" (suffix) dan multi-range dibiarkan apa adanya —
//   suffix selalu kecil, multi-range tidak dipakai player video.
function clampRange(range: string | null): string | null {
  if (!range) return `bytes=0-${CHUNK_SIZE - 1}`;
  const m = /^bytes=(\d+)-(\d*)$/.exec(range.trim());
  if (!m) return range;
  const start = Number(m[1]);
  const end = m[2] === '' ? start + CHUNK_SIZE - 1 : Math.min(Number(m[2]), start + CHUNK_SIZE - 1);
  return `bytes=${start}-${end}`;
}

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get('url');
  if (!raw || !isAllowed(raw)) {
    return NextResponse.json({ error: 'invalid upstream url' }, { status: 400 });
  }

  const headers = new Headers();
  const range = clampRange(req.headers.get('range'));
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
