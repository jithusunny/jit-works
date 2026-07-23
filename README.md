# jit.works

jit.works is the public portfolio and studio website for [Jithu Sunny](https://github.com/jithusunny). Its job is simple: show a small selection of real work clearly and make it easy to start a useful conversation.

## Status

The first portfolio release is being built: an Astro + Preact site showing four selected projects,
with a permanent Upwork-safe `/upwork` surface. Real screenshots and production deployment follow in
a separate reviewed slice. Stack rationale: [docs/adr/0001-stack-astro-cloudflare.md](docs/adr/0001-stack-astro-cloudflare.md).

## Working here

- Read [AGENTS.md](AGENTS.md) before making changes.
- Run `npm run work -- brief` to see the current product work.
- Use the selected GitHub issue as the standalone implementation handoff.
- Keep public requirements complete; do not rely on undisclosed context.
- See [docs/README.md](docs/README.md) for durable documentation homes.

Run the site (dev server at `http://localhost:4321`):

```sh
npm install --include=dev   # NODE_ENV=production omits devDependencies otherwise
npm run dev
```

Current checks:

```sh
npm run build       # prerenders both routes
npx astro check     # type-check
npm test            # work-system tests
```

The repository does not yet grant a software license. Do not assume rights beyond those provided by GitHub's terms until a license is selected.
