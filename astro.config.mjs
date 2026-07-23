// @ts-check
import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import cloudflare from '@astrojs/cloudflare';

// v1 is fully prerendered (static, fast). The Cloudflare adapter is wired now so
// individual routes can opt into on-demand rendering later (live commit/stat data,
// analytics, embeds) without a re-platform. See docs/adr/0001-stack-astro-cloudflare.md.
export default defineConfig({
  site: 'https://jit.works',
  output: 'static',
  adapter: cloudflare(),
  integrations: [preact()],
});
