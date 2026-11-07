# AGENTS.md

Guidance for AI coding agents working in this repository. Deploy history and
the Cloudflare dashboard setup live in `DEPLOY.md` (Indonesian); read it before
touching build or deploy configuration.

## Project

ZerDrakor is an Indonesian-language catalog and streaming site for Korean
dramas and films ("drakor"). It is a Next.js 15 App Router app (React 19,
TypeScript strict, Tailwind CSS v4) deployed to Cloudflare Workers through the
OpenNext adapter (`@opennextjs/cloudflare`).

- No database, no auth. All catalog data comes live from one private upstream
  JSON API, fetched server-side in `app/api/*`.
- Watchlist and playback history exist only in the browser's `localStorage`.
- The app was forked from a sibling project, ZerDonghua, and bootstrapped in
  Google AI Studio (`metadata.json`, `DISABLE_HMR`). See "Legacy naming".

## Commands

npm with a committed `package-lock.json` (required by the deploy pipeline; keep
it in sync). No `engines` pin; verified with Node 24 and npm 11.

| Task | Command | Notes |
| --- | --- | --- |
| Install | `npm install` | |
| Dev server | `npm run dev` | http://localhost:3000, works with no env vars |
| Typecheck | `npx tsc --noEmit` | A few seconds; currently clean |
| Lint | `npm run lint` | ESLint 9 flat config; baseline is not clean (below) |
| Next build | `npm run build` | Plain `next build`; type errors fail it, lint is skipped |
| Workers build | `npx opennextjs-cloudflare build` | Runs `npm run build` itself, then writes `.open-next/worker.js` (~30 s) |
| Local Workers preview | `npm run preview` | OpenNext build + local `wrangler` runtime |
| Deploy | `npm run deploy` | Needs `wrangler login`; never run unless explicitly asked |
| Worker env types | `npm run cf-typegen` | Writes `cloudflare-env.d.ts` (not committed) |

There is no test suite. Verify changes with `npx tsc --noEmit`, `npm run lint`
and `npx opennextjs-cloudflare build` (it catches Workers bundling problems
that `next build` alone misses), then exercise the affected pages and `/api/*`
routes under `npm run dev`.

Lint notes:

- Baseline: 3 pre-existing `react-hooks/set-state-in-effect` errors
  (`app/donghua/[slug]/page.tsx`, `app/watch/[slug]/[episode]/page.tsx`,
  `components/search-command-palette.tsx`) plus `@next/next/no-img-element`
  warnings. Don't add new ones.
- `eslint .` also lints the generated `.open-next/` directory after a Workers
  build and floods the output. Delete `.open-next/` first, or lint sources
  only: `npx eslint app components context hooks lib types`.
- `eslint.config.mjs` is the active config; `.eslintrc.json` is a legacy file
  ESLint 9 ignores.

## Build and deploy guardrails

Each of these comes from a real failed deploy (see `DEPLOY.md`). Don't undo them.

- Keep `"build": "next build"`. Pointing it at `opennextjs-cloudflare build`
  recurses forever, because the adapter itself calls `npm run build`.
- Don't add `output: 'standalone'` to `next.config.ts` or use `--skipNextBuild`.
- Don't add `export const runtime = 'edge'`; OpenNext Cloudflare doesn't
  support the edge runtime. Keep the `nodejs_compat` flag in `wrangler.jsonc`.
- Don't use `next/font/google` (Google Fonts fetches broke Workers builds).
  Fonts are self-hosted via `next/font/local` from `app/fonts/`.
- `@opennextjs/cloudflare` and `wrangler` are pinned to exact versions that
  were verified to build. Don't bump them as a side effect of other work.
- Production deploys run in Cloudflare Workers Builds (repo `svazerID/zerdrakor`,
  branch `main`) with build command `npx @opennextjs/cloudflare build` and
  deploy command `npx @opennextjs/cloudflare deploy`. Don't call anything live
  until the deployed `/api/*` routes return 200 and a video actually plays.

## Architecture

```
app/
  layout.tsx               Root layout: fonts, site metadata, JSON-LD, providers, nav
  page.tsx                 Home
  katalog/ jadwal/ peringkat/ watchlist/
                           Catalog, schedule, rankings, watchlist
  donghua/[slug]/          Series detail page (the real implementation)
  drakor/[slug]/           Alias; page.tsx re-exports the donghua page
  watch/[slug]/[episode]/  Episode player page
  api/                     Route handlers, the only code that reaches upstream
lib/
  server/drakor-api.ts     Upstream client + mapping to app types (server-only)
  client/live.ts           Typed browser fetchers for our /api/* routes
  metadata.ts              Open Graph / Twitter / canonical metadata helpers
  utils.ts                 cn(), formatViews(), getTodayWIBDay() (Asia/Jakarta)
  data/donghua-data.ts     Legacy placeholder data, imported nowhere
types/donghua.ts           Domain types: Drakor, Episode, VideoSource, ScheduleEntry, ...
context/watchlist-context.tsx  localStorage watchlist + playback history
components/                UI; player/video-player.tsx is the native <video> player
public/                    Served static assets (icons, OG image)
src/assets/images/         Raw image sources only; no code lives in src/
```

Data flow: client page → `lib/client/live.ts` → `app/api/<route>` →
`lib/server/drakor-api.ts` → upstream API.

Patterns to follow:

- Pages are client components (`'use client'`) that fetch through
  `lib/client/live.ts` in `useEffect` (with an `alive` flag to drop stale
  responses) and render loading, error and not-found states. Each route
  segment has a server `layout.tsx` that only provides metadata via
  `pageMetadata`, `dramaMetadata` or `watchMetadata` from `lib/metadata.ts`.
  Keep that split.
- A page using `useSearchParams` must render inside `<Suspense>` (see
  `app/katalog/page.tsx`) or `next build` fails.
- Route handlers export `dynamic = 'force-dynamic'` and return JSON; upstream
  failures become `{ error }` with status 502 (404 for an unknown series).
  `lib/client/live.ts` throws that `error` message.
- Import `lib/server/drakor-api.ts` only from `app/api/*` and server code such
  as `lib/metadata.ts`. It has no `server-only` guard, so a client import would
  compile and ship the upstream key to the browser.
- In layouts and metadata, use `getCategoriesMapped()` (one cached call), not
  `getSeriesDetail()`, which fans out to as many as 50 upstream requests.
- The in-memory cache in `drakor-api.ts` is per Worker isolate: an
  optimization, not shared state.
- Imports use the `@/` alias for the repo root. Route segments use Indonesian
  names.

## Upstream data rules

- IDs are `cat-<catId>`. Slugs are `<slugified-title>-<catId>` (`slugFor`), and
  `parseCatId` reads the numeric suffix, so every slug must keep it.
- The upstream `pages` field echoes the requested page; derive totals from
  `count_total`.
- Search returns at most 20 results and can't be paginated (sending `page`
  returns 0 results).
- Show only real data. The source has a weekday but no air time; no cast,
  director, country or duration; no subtitle files; no official rankings
  (`/peringkat` re-sorts the live catalog); and video quality labels are only
  HD, SD or ENG. Don't invent times, resolutions such as 1080p, comments,
  sample videos or placeholder titles. The code deliberately shows empty or
  error states instead. Don't revive `lib/data/donghua-data.ts`.

## Video streaming proxy

Upstream MP4s are plain `http://*.whatbox.ca:<port>/...` URLs, which HTTPS pages
block as mixed content, so the player always loads
`/api/stream?url=<encoded>` (`app/api/stream/route.ts`).

- Keep the allowlist (`http:`, `*.whatbox.ca`, `.mp4` paths) so the route
  stays a closed proxy.
- Keep the 4 MB Range clamp. Long open-ended streams exceeded Worker CPU and
  memory limits (Cloudflare Error 1102); browsers request the next range
  themselves.

## Environment variables

All optional; see `.env.example`. Never commit `.env*` files other than
`.env.example`.

- `APP_URL`: public origin for canonical and OG URLs. Defaults to
  `http://localhost:3000`; `wrangler.jsonc` sets the workers.dev host.
- `DRAKOR_API_KEY`: overrides the upstream key. By the owner's decision the
  public upstream key is hardcoded as a default in `lib/server/drakor-api.ts`,
  so deploys work without it (DEPLOY.md's "502 without this secret" predates
  that). Don't copy the key anywhere else.
- `DRAKOR_API_BASE`: upstream base URL, default `https://kampretloh.top/v3`.
- `DISABLE_HMR`: used only by AI Studio; leave the webpack block in
  `next.config.ts` alone.

## UI and code conventions

- All user-facing copy is Indonesian (`lang="id"`, `locale: 'id_ID'`). Write
  new UI text in Indonesian.
- Tailwind v4 is configured in CSS (`app/globals.css`, `@theme inline`); there
  is no `tailwind.config.*`. Use the semantic color tokens (`canvas`, `surface`,
  `elevated`, `alt`, `ink`, `sub`, `mute`, `faint`, `line`, `line-strong`,
  `accent`, `accent-soft`, `ok`, `warn`, `bad`) rather than raw hex or palette
  colors. Dark is the default (`class="dark"` on `<html>`). The look is
  Netflix-style: flat surfaces, small radii, red accent.
- Merge classes with `cn()` from `lib/utils.ts`; icons come from `lucide-react`.
- Remote posters use plain `<img ... referrerPolicy="no-referrer">`, like every
  existing image. If you switch to `next/image`, the hosts are already
  allowlisted in `next.config.ts`.
- 2-space indentation, single quotes, semicolons. There is no Prettier config,
  so match the surrounding file.
- Comments explain non-obvious reasons, especially workarounds tied to past
  incidents; existing ones mix Indonesian and English.
- Unused AI Studio template leftovers: `@google/genai`, `@hookform/resolvers`,
  `class-variance-authority`, `motion`, `@tailwindcss/typography`,
  `tw-animate-css`. They are not part of the architecture.

## Legacy naming (ZerDonghua fork)

Many identifiers still say "donghua": `types/donghua.ts`, `DonghuaCard`,
`donghua` props, the `Donghua*` type aliases, the `donghuaId` mirror fields,
and `/donghua/[slug]` as the detail URL that internal links use. These are
deliberate compatibility aliases. Prefer `Drakor` / `drakorId` in new code, but
don't mass-rename unless asked.

- Never change the localStorage keys `drakornusa_watchlist_v1` and
  `drakornusa_history_v1` (they fall back to reading `donghuanusa_*`).
  Renaming them wipes users' saved watchlists and history.
- A few UI strings still say "DrakorNusa", an older brand. The current brand
  is ZerDrakor.

## Commits

Recent history uses short, lowercase Indonesian messages with no type prefix,
e.g. `jepit range proxy video maksimal 4 mb untuk hindari error 1102 worker`.
Put optional details as bullets in the body.
