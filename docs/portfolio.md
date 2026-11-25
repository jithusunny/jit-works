# Maintaining the portfolio

The page is composed in `src/pages/index.astro`. Each section lives in
`src/components/portfolio/`; shared responsive styles are in `src/styles/portfolio.css`.
Direct contact destinations are defined once in `src/data/site.ts`.

## Media

Keep small display assets under `public/assets/portfolio/previews/` and their originals under
`public/assets/portfolio/`. Explicit `data-image` values identify originals when names differ.
Keep width/height attributes and responsive sources accurate; do not enlarge a small source and
claim more detail. Font licence notices sit beside the local font files. Swishbook’s wordmark and the embedded menu share the local Inter font. Its blue mark and product destination follow [swishbook.app](https://swishbook.app/).

The media dialog uses the largest comfortable viewport area, a nearby caption and one close
button. Escape or the backdrop closes it and returns focus. Left/right arrows cycle only the
current collage, project or service group. Different projects must not share a gallery.

## Interactive samples

The menu reader and project plan are isolated documents under `public/demos/`. They do not submit
client choices or collect information. The review animation supports direct local interaction,
pauses offscreen and respects reduced motion. Its submitted state explicitly confirms that no
feedback was sent. WhatsApp scenes and service compositions are authored portfolio material,
not integrations with WhatsApp, campaign accounts or analytics services. Chat scenes show the
client’s view: Jithu in the header, his incoming messages on the left, and the client’s outgoing
messages and delivery ticks on the right. Small circular expand buttons sit just below the bottom-right of the design and chat previews, clear of the device frames. The icon buttons and preview images open the same image dialog; each button has a specific accessible name and a 44px tap target.

## Verification

Run `npm test`, `npx astro check` and `npm run test:browser`. The browser command builds first and
starts a local Cloudflare Worker. Install Chromium with `npx playwright install chromium` when
needed. Browser tests cover nine viewport sizes, including phone/tablet landscape, compact
phones and wide desktops; scoped original-image galleries; local feedback; product tabs; reader
navigation, zoom and fullscreen; project decisions; and content without JavaScript.

Also inspect native-size renders: automated overflow checks cannot judge composition, image
quality, spacing or convincing device proportions. Check all sections and opened images in phone,
tablet and desktop modes, including landscape and an older browser. Keep performance and
independent review evidence with the owning issue. Physical-device Safari checks remain distinct
from Chromium emulation.
