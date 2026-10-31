# ZerDrakor — deploy ke Cloudflare Workers

Repo ini sudah siap deploy ke Workers lewat OpenNext, dengan konfigurasi
yang di-commit (bukan auto-migrate dari dashboard — itu yang dulu bikin
deploy ZerDonghua gagal).

## Kegagalan deploy 2026-10-31 ~22:55 WIB — penyebab & perbaikan

Log dashboard menunjukkan:

- Build command dashboard: `npm run build` → `next build` polos → SUKSES.
- Deploy command dashboard: `npx wrangler deploy` → wrangler mendeteksi
  proyek OpenNext dan memanggil `opennextjs-cloudflare deploy` →
  `ERROR Could not find compiled Open Next config, did you run the build command?`

Penyebabnya sederhana: `next build` polos TIDAK menghasilkan `.open-next/`,
sedangkan deploy OpenNext butuh output dari `opennextjs-cloudflare build`.

**Perbaikannya ada di dashboard, bukan di repo — dan sudah dicoba dua
jalan repo yang ternyata buntu, jangan diulang:**

1. Mengubah script `build` di `package.json` jadi `opennextjs-cloudflare
   build` → REKURSI TAK BERUJUNG. Adapter OpenNext di dalamnya
   menjalankan `npm run build` lagi, jadi build memanggil dirinya sendiri
   berulang kali sampai timeout (terbukti lokal 2026-10-31 ~23:02 WIB).
2. `next build && opennextjs-cloudflare build --skipNextBuild` (plus
   `output: 'standalone'`) → GAGAL dengan `ENOENT .../.next/standalone/
   .next/server/pages-manifest.json`. Build skip OpenNext mengharapkan
   layout standalone yang tidak dihasilkan build polos di proyek ini.

Jadi satu-satunya cara yang benar: ubah perintah di dashboard Workers
Builds jadi:

- **Build command:** `npx @opennextjs/cloudflare build`
- **Deploy command:** `npx @opennextjs/cloudflare deploy`
  (atau biarkan `npx wrangler deploy` — wrangler otomatis mendelegasikan
  ke deploy OpenNext, ASALKAN build command di atas sudah menghasilkan
  `.open-next/`).

Setelah perintah itu diubah, klik **Retry deployment** di dashboard.
Perintah itu sudah diverifikasi jalan di lokal (lihat "Verifikasi lokal"
di bawah).

## Yang sudah ada di repo

- `wrangler.jsonc` — Worker `zerdrakor`, `main: .open-next/worker.js`,
  `compatibility_flags: ["nodejs_compat"]` (wajib, tanpa ini Next gagal runtime)
- `open-next.config.ts` — konfigurasi OpenNext default
- `package.json` — script `preview` / `deploy`, adapter
  `@opennextjs/cloudflare` dan `wrangler` di-pin ke versi yang sudah
  diverifikasi build lokal (bukan `^` mengambang)
- `package-lock.json` — WAJIB di-commit. Tanpa lockfile, dashboard akan
  resolve `^` fresh dan bisa mengulang drift versi seperti kasus ZerDonghua.
- Font: repo ini TIDAK pakai `next/font/google` (system font stack), jadi
  tidak kena kegagalan build Google Fonts yang dulu menimpa ZerDonghua.
  Jangan tambahkan `next/font/google` tanpa self-host font-nya dulu.

## Perintah lokal

```bash
npm install
npm run build            # build Next polos -> .next (dipakai npm start lokal)
npm run preview          # build OpenNext + preview di runtime Workers lokal
npm run deploy           # build OpenNext + deploy via CLI (butuh wrangler login)
# atau, persis seperti yang harus dipakai dashboard:
npx @opennextjs/cloudflare build   # -> .open-next/worker.js
npx @opennextjs/cloudflare deploy
```

Build OpenNext lokal sudah diverifikasi: `Worker saved in .open-next/worker.js`.

## Deploy via Workers Builds (cara yang dipakai ZerDonghua)

1. Cloudflare dashboard → Workers → Create / hubungkan repo
   `svazerID/zerdrakor`, branch `main`.
2. Build settings — JANGAN biarkan dashboard auto-migrate / menulis ulang
   script. Set persis:
   - Build command: `npx @opennextjs/cloudflare build`
   - Deploy command: `npx @opennextjs/cloudflare deploy`
   - Bukan `npm run build` + `npx wrangler deploy` polos.
3. Variables (Workers → Settings → Variables):
   - `APP_URL` → host produksi yang sebenarnya, misal
     `https://drakor.svazer.us.ci` (atau `*.workers.dev` dulu untuk verifikasi).
     Tanpa ini, OG/canonical akan mengarah ke fallback localhost.
   - `DRAKOR_API_BASE` → opsional, default `https://kampretloh.top/v3`.
4. Secret (bukan variable biasa, dan JANGAN di-commit):
   - `DRAKOR_API_KEY` → via `wrangler secret put DRAKOR_API_KEY` atau
     dashboard Secrets. Kunci ini ada di gist sumber yang dipakai proyek.
     Tanpa secret ini, semua `/api/*` akan mengembalikan 502.
5. Custom domain (opsional, setelah `*.workers.dev` terverifikasi):
   Workers → Settings → Domains & Routes → Custom Domain.

## Verifikasi setelah deploy (wajib, jangan langsung klaim live)

Upstream belum pernah dites dari IP Workers (IP datacenter). Dari container,
video direct MP4 sudah terverifikasi 206, tapi itu bukan bukti untuk Workers.
Setelah deploy, cek dari URL Workers:

- `/api/home`, `/api/catalog`, `/api/search?q=Queen%20of%20Tears`,
  `/api/schedule`, `/api/rankings`, `/api/drakor/tigers-sniff-the-rose-3744`
  semuanya harus 200 (bukan 502).
- Buka satu halaman watch dan pastikan video benar-benar bisa diputar dari
  jaringan HP (bukan dari container).

## Batasan jujur dari sumber data (baca sebelum klaim "lengkap")

Sumbernya adalah API JSON privat, bukan situs HTML. Yang TIDAK ada di sumber:

- Jadwal: hanya hari tayang (`days`), tidak ada jam siaran. Halaman
  `/jadwal` menampilkan hari, bukan jam — dan hanya ~126 dari 3737 judul
  yang punya hari di sumber; sisanya tidak punya jadwal di sumber.
- Cast, sutradara, negara, durasi: tidak ada field-nya di sumber.
- Subtitle file (.vtt): tidak ada. Yang ada adalah URL video Indo (SD),
  HD, dan ENG — subtitle diasumsikan sudah menempel di video.
- Search: maksimal 20 hasil dan TIDAK bisa dipaginasi (mengirim `page`
  justru mengembalikan 0 hasil, sudah diverifikasi live).
- Peringkat: tidak ada endpoint ranking harian/mingguan/bulanan di sumber.
  Tab peringkat adalah urutan berbeda dari katalog live yang sama
  (terbaru / tayangan / rating), bukan chart resmi terpisah.
- Satu titik kegagalan: satu host + satu kunci aplikasi. Kalau kunci
  dirotasi, host pindah, atau IP Workers diblokir, semua halaman mati.
  Tidak ada sumber cadangan di repo ini.
- Kualitas video: sumber hanya memberi label HD/SD/ENG, bukan 1080p/720p
  pasti. Jangan klaim resolusi spesifik di UI.
