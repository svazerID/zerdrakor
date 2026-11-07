# ZerDrakor

Katalog dan streaming drama Korea (drakor) serta film Korea dengan subtitle Indonesia. Semua konten — katalog, episode, jadwal, peringkat — diambil live dari API JSON upstream lewat route `/api/*` di server. Tidak ada database: watchlist dan riwayat tonton tersimpan di `localStorage` browser.

**Stack:** Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Cloudflare Workers via [OpenNext](https://opennext.js.org/cloudflare)

## Fitur

| Rute | Isi |
| --- | --- |
| `/` | Beranda: spotlight, episode terbaru, film Korea, genre, cuplikan jadwal dan peringkat, "lanjutkan menonton" |
| `/katalog` | Pencarian, filter genre / tipe / status, pengurutan, paginasi |
| `/jadwal` | Jadwal tayang per hari (hanya hari, tanpa jam) |
| `/peringkat` | Tab harian, mingguan, bulanan, sepanjang masa |
| `/donghua/[slug]` | Detail judul, daftar episode, judul terkait. `/drakor/[slug]` merender halaman yang sama |
| `/watch/[slug]/[episode]` | Pemutar episode dengan pilihan server HD / SD / ENG |
| `/watchlist` | Watchlist dan riwayat tonton |

Pencarian cepat bisa dibuka dari navbar atau dengan <kbd>Ctrl</kbd>/<kbd>⌘</kbd> + <kbd>K</kbd>. Slug berformat `<judul>-<id>` (mis. `queen-of-tears-1234`); angka di akhir adalah id seri di API upstream.

## Cara kerja

```text
Halaman (client component)
   │  lib/client/live.ts
   ▼
/api/*  (route handler di server / Worker)
   │  lib/server/drakor-api.ts
   ▼
API JSON upstream

<video> ──► /api/stream?url=… ──► file MP4 upstream (HTTP)
```

- **Browser tidak pernah memanggil upstream langsung.** Halaman hanya memanggil `/api/*`, jadi API key upstream tidak pernah sampai ke browser.
- **`lib/server/drakor-api.ts`** memetakan data upstream ke tipe di `types/donghua.ts`, menerjemahkan slug ↔ id numerik, memakai timeout 15 detik + satu kali retry, dan meng-cache daftar seri di memori selama 10 menit.
- **`/api/stream`** mem-proxy video: file upstream hanya tersedia lewat HTTP, sedangkan situsnya HTTPS sehingga browser akan memblokirnya sebagai mixed content. Proxy hanya menerima host di allowlist dengan path `.mp4`, dan membatasi tiap respons Range maksimal 4 MB agar satu invocation Worker tidak melewati batas resource (Error 1102). Penjelasan lengkapnya ada di komentar `app/api/stream/route.ts`.
- **Metadata SEO** (canonical, Open Graph, Twitter Card, JSON-LD) dirender di server oleh `layout.tsx` tiap rute dan `lib/metadata.ts`, memakai `APP_URL`.
- **Watchlist dan riwayat** dikelola `context/watchlist-context.tsx`; riwayat menyimpan 10 judul terakhir.

## Persyaratan

- Node.js 22+ (Wrangler 4 membutuhkan Node ≥ 22; untuk `next dev` / `next build` saja cukup ≥ 18.18)
- npm, dengan `package-lock.json` yang sudah ada
- Akses internet ke API upstream — tanpa itu halaman hanya menampilkan pesan gagal memuat data

## Menjalankan secara lokal

```bash
npm install
npm run dev        # http://localhost:3000
```

Tidak ada variabel lingkungan yang wajib untuk development. Untuk mencoba bundle Workers di runtime lokal sebelum deploy, jalankan `npm run preview`.

## Script npm

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | Server development Next.js |
| `npm run build` | Build Next.js biasa ke `.next/` — **bukan** build untuk Workers |
| `npm start` | Menjalankan hasil `npm run build` dengan server Node.js |
| `npm run lint` | ESLint (`eslint.config.mjs`). `next build` melewati lint, jadi jalankan terpisah |
| `npm run preview` | Build OpenNext, lalu jalankan Worker di runtime Workers lokal |
| `npm run deploy` | Build OpenNext, lalu deploy lewat Wrangler (perlu `npx wrangler login`) |
| `npm run cf-typegen` | Generate tipe binding Worker ke `cloudflare-env.d.ts` |

Belum ada test otomatis; `npm run build` tetap menjalankan pengecekan tipe TypeScript.

## Variabel lingkungan

Semua variabel punya nilai default. Untuk development, taruh override di `.env.local` (contoh di `.env.example`).

| Variabel | Default | Fungsi |
| --- | --- | --- |
| `APP_URL` | `http://localhost:3000` | Host publik untuk canonical, Open Graph, dan JSON-LD. Di produksi selalu isi dengan host sebenarnya |
| `DRAKOR_API_KEY` | key bawaan di `lib/server/drakor-api.ts` | Override API key upstream bila key dirotasi. Simpan sebagai secret, jangan di-commit |
| `DRAKOR_API_BASE` | `https://kampretloh.top/v3` | Override base URL API upstream |

Di Cloudflare:

- **Variabel runtime non-rahasia** (`APP_URL`, `DRAKOR_API_BASE`) sebaiknya diatur di `vars` pada `wrangler.jsonc`. Wrangler menimpa variabel yang diubah lewat dashboard setiap kali deploy ([dok. Wrangler](https://developers.cloudflare.com/workers/wrangler/configuration/)), jadi perubahan di dashboard tidak bertahan. `APP_URL` di sana saat ini `https://zerdrakor.workers.dev`.
- **Secret** (`DRAKOR_API_KEY`) diatur dengan `npx wrangler secret put DRAKOR_API_KEY` atau lewat dashboard; secret tidak ikut tertimpa saat deploy.
- **`APP_URL` juga dibutuhkan saat build.** Halaman statis (`/`, `/katalog`, `/jadwal`, `/peringkat`, `/watchlist`) di-prerender ketika build, sehingga canonical/OG-nya memakai `APP_URL` dari environment build, bukan dari `wrangler.jsonc`. Isi juga di **Workers Builds → Build variables and secrets**; tanpa itu halaman-halaman tersebut menunjuk ke `http://localhost:3000`.

## Deploy ke Cloudflare Workers

Worker `zerdrakor` di-deploy oleh Workers Builds yang terhubung ke repo ini. Perintah di dashboard harus:

- **Build command:** `npx @opennextjs/cloudflare build`
- **Deploy command:** `npx @opennextjs/cloudflare deploy`

Yang perlu dijaga:

- Jangan pakai `npm run build` sebagai build command — itu hanya `next build` dan tidak menghasilkan `.open-next/`, sehingga deploy gagal.
- Jangan ubah script `build` menjadi `opennextjs-cloudflare build`: adapter memanggil `npm run build` sendiri, jadi build akan rekursif tanpa akhir.
- `compatibility_flags: ["nodejs_compat"]` di `wrangler.jsonc` wajib ada.
- Commit `package-lock.json` supaya versi dependensi di CI sama dengan lokal.
- Jangan pakai `next/font/google`; font di-self-host di `app/fonts/` lewat `next/font/local`.

Untuk deploy manual dari lokal: `npx wrangler login`, lalu `npm run deploy`. Riwayat kegagalan deploy dan checklist verifikasi setelah deploy ada di [DEPLOY.md](DEPLOY.md).

## API internal

Semua endpoint mengembalikan JSON (kecuali `/api/stream`) dan merespons `502` dengan `{ "error": "…" }` bila upstream gagal.

| Endpoint | Keterangan |
| --- | --- |
| `GET /api/home` | Data beranda: featured, editor picks, terbaru, film, genre, jadwal |
| `GET /api/catalog` | Katalog terfilter dan terpaginasi. Query: `q`, `genre`, `type` (`series` / `movie`), `status` (`ongoing` / `completed`), `sort` (`popular`, `rating`, `latest`, `title-asc`, `title-desc`), `page`, `pageSize` (maks. 40) |
| `GET /api/search?q=` | Pencarian judul, maks. 20 hasil |
| `GET /api/schedule` | Judul yang punya hari tayang |
| `GET /api/rankings?period=` | `daily`, `weekly` (default), `monthly`, `all_time` |
| `GET /api/drakor/[slug]` | Detail seri, semua episode, dan judul terkait; `404` bila tidak ditemukan |
| `GET /api/stream?url=` | Proxy video MP4 (lihat [Cara kerja](#cara-kerja)) |

## Batasan sumber data

Ringkasan; detailnya ada di [DEPLOY.md](DEPLOY.md) bagian *Batasan jujur dari sumber data*.

- Jadwal hanya berisi hari tayang tanpa jam siaran, dan hanya sebagian kecil judul yang punya data hari.
- Tidak ada data cast, sutradara, negara, atau durasi.
- Tidak ada file subtitle terpisah — subtitle sudah menempel di video. Label kualitas hanya HD / SD / ENG, bukan resolusi pasti.
- Pencarian upstream maksimal 20 hasil dan tidak bisa dipaginasi.
- Peringkat bukan chart resmi, melainkan urutan berbeda (terbaru / tayangan / rating) dari pembaruan episode terbaru.
- Hanya ada satu host dan satu API key tanpa sumber cadangan: bila key dirotasi, host pindah, atau IP Workers diblokir, semua halaman ikut mati.

## Struktur proyek

```text
app/                      Rute App Router: halaman berupa client component,
                          layout.tsx per rute menyuntikkan metadata dari server
app/api/                  Route handler /api/* (data upstream dan proxy video)
app/fonts/                Font self-hosted (Inter, Outfit)
components/               Komponen UI: navbar, kartu, hero, player, palet pencarian, dll.
context/                  Watchlist dan riwayat tonton (localStorage)
lib/server/drakor-api.ts  Klien API upstream (khusus server)
lib/client/live.ts        Fetcher browser untuk /api/*
lib/metadata.ts           Helper canonical / Open Graph / Twitter Card
types/donghua.ts          Tipe bersama (Drakor, Episode, ScheduleEntry, …)
public/                   Ikon, gambar OG, dan aset statis
wrangler.jsonc            Konfigurasi Worker Cloudflare
open-next.config.ts       Konfigurasi adapter OpenNext
```

Nama `donghua` di beberapa tempat (`types/donghua.ts`, `components/donghua-card.tsx`, rute `/donghua/[slug]`) diwarisi dari basis kode ZerDonghua; isinya tetap data drakor. `lib/data/donghua-data.ts` berisi data contoh lama dan tidak dipakai aplikasi. `metadata.json` dan `.aistudio/` adalah sisa template Google AI Studio.
