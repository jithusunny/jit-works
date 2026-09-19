# ADR 0001: Build jit.works on Astro with the Cloudflare adapter

- Status: Accepted
- Date: 2026-07-23
- Decision issue: n/a (selected during #3, which delegates the stack choice to implementation)

## Context

The first jit.works release (#3) is a concise, high-fidelity portfolio built around one interactive
page. The issue asks for the "smallest suitable application stack" that stays fast and legible on
mobile.

The owner also set a forward direction the stack must not foreclose: project status that updates as
commits land, changing stats, privacy-gated analytics (Umami), scheduling (Calendly), and a live
"working" stream. A purely static, build-once site would need re-platforming to serve that live and
edge data later.

## Decision

Use **Astro** with the **`@astrojs/cloudflare` adapter** and a single **Preact** island.

- v1 renders fully prerendered/static (`output: 'static'`); every page is HTML at build time, so
  first paint is fast and content is readable without JS.
- The whole interactive app (header, hero, carousel, overlays) is one Preact island hydrated
  `client:load`. Preact is React-compatible, so the design export's React logic ports directly at
  ~11 kB gzip.
- The public route renders one `Showcase` component backed by one project data source
  (`src/data/projects.ts`). Contact choices are configured separately in `src/data/site.ts`.

## Consequences

- **Easier later:** individual routes/endpoints can opt into on-demand rendering (`export const
  prerender = false`) on Cloudflare for live commit/stat data, and analytics/Calendly/stream embeds
  drop in without a re-platform. KV/D1/Durable Objects are available through the same adapter.
- **Required:** the Cloudflare adapter is present now; the build emits Pages artifacts
  (`_worker.js`, `_routes.json`) even though v1 is static. Hosting binding specifics (e.g. the
  `SESSION` KV binding the adapter mentions) are resolved in the deploy slice, not here.
- **Constraint:** `astro preview` is unsupported under this adapter — use `astro dev` locally, or
  serve `dist/` with any static server.
- **Deliberately unsupported in v1:** analytics, live data, and embeds are out of #3 scope (analytics
  additionally needs a separate privacy decision). The stack enables them; this release does not add
  them.

## Evidence

- `npm run build` prerenders `/` to static HTML. The retired `/upwork` route is a permanent redirect
  to `/` using Cloudflare Static Assets redirects. The client island includes the project media
  viewer and direct-contact chooser.
- `astro check` passes with 0 errors.
- Headless-Chromium renders at 390×844 and 1440×1000 reproduce the design's hero, carousel, and
  card anatomy.
