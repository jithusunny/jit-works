# jit.works agent operating rules

Shared brief for every coding agent in this repository. Keep it short: operating rules and up-front context only. Detailed history and completed planning do not belong here.

jit.works is the public portfolio and studio website for Jithu Sunny. It should become one concise, credible link that shows selected work and makes it easy to start a conversation. The technical stack is not selected yet; choose it only when an implementation slice needs that decision.

## Engineering bar

Clean, lean, correct, maintainable. Use proportionate tests, review your own change, and update durable documentation with behavior. Avoid hacks, unused abstractions, and premature infrastructure.

## Start

- Product-local status comes from `npm run work -- brief`. Its Ready list is not a cross-product
  priority decision.
- For any repository change, run `npm run work -- brief` before planning or editing.
- Work on the issue the user selected. If the user explicitly wants to continue this product, use
  its active item or help choose a local Ready item. Do not automatically start another item after
  completing a slice unless the user approved a bounded issue sequence or focus run.
- If the work service is unavailable, report it. Continue only from an issue the user explicitly selected; otherwise ask for the intended outcome.
- Read only the selected issue and the technical references it explicitly links.
- Before implementation, confirm the user/problem, observable outcome, first-version scope, non-scope, constraints, and acceptance evidence are clear enough. Skip this ceremony for an obvious bug or routine task.
- Resolve public-safe product ambiguity here. If essential reasoning is sensitive, ask for a standalone sanitized requirement; never search for or depend on undisclosed context.

## Work tracking

- GitHub issues are the public work records. This repository contains every public constraint needed to understand, build, test, and contribute to jit.works.
- Every issue and tracked artifact must stand alone. Never record, require, link, or reconstruct
  undisclosed context in this repository.
- Search open and closed work before creating an issue. Update an existing item instead of duplicating it.
- Create or edit issue bodies through a Markdown file or stdin with real line breaks; never build them from escaped `\n` text. Re-read the saved body after writing and fix malformed Markdown before continuing.
- Treat a large brainstorm as intake evidence, not an automatic roadmap. Reconcile it with existing work first, and never commit sensitive raw material.
- Ask before a material phase change, cancellation, public release, destructive action, or rewrite of an accepted outcome. Small deduplication and clearer wording do not need approval.
- For explicitly requested scoped work, commit, push, and merge after checks pass, the diff is reviewed, and no critical finding remains. Ask only when a genuine unresolved user choice remains.
- New public-safe, product-specific findings go to this repository's Inbox and do not displace active
  work unless they reveal a critical security, data-loss, privacy, or release-integrity risk. Ask the
  user to capture private, commercial, customer, financial, legal, sensitive-security, or
  cross-product findings in an appropriate private context; do not record that context here.
- Keep one primary implementation item active. Split epics and multi-day work into small verifiable slices.
- The selected public issue is the handoff and must stand on its own.

## Gentle course correction

Briefly nudge when work bypasses the active item, duplicates status, reopens settled decisions without evidence, expands scope, prepares indefinitely, or introduces an unnecessary abstraction. Name the pattern, its cost, and the smallest correction. Do not interrupt harmless exploration.

## Execute one slice

1. Restate the goal, scope, non-scope, dependencies, and acceptance checks.
2. Plan and red-team in proportion to risk.
3. Implement only the selected slice.
4. Run relevant automated checks and exercise the affected behavior.
5. Review the diff for regressions, security, privacy, accessibility, and operational effects.
6. Record verification and link the commit or pull request before closing the issue.
7. Capture genuine follow-ups in Inbox instead of expanding the slice.
8. Stop after the slice. Continue back-to-back only within an explicitly approved issue sequence or
   bounded focus run; otherwise let the user choose the next work from their wider context.

## Repository layout and commands

- `docs/` contains current public specifications and accepted technical decisions.
- `ops/` contains product-scoped work tooling.
- The web app is **Astro + Preact** on the Cloudflare adapter (see `docs/adr/0001-stack-astro-cloudflare.md`):
  - `src/pages/` — routes (`index.astro` = main, `upwork.astro` = the Upwork-safe surface).
  - `src/components/Showcase.tsx` — the single Preact island (header, hero, carousel, overlays);
    both routes render it with a `variant` prop.
  - `src/data/` — `projects.ts` (the four projects, single source of truth) and `site.ts` (config,
    Upwork URL). `src/layouts/Base.astro` holds fonts, grain, tokens. `public/assets/` holds images.
- Because `NODE_ENV=production` is set in this environment, install dev tooling with
  `npm install --include=dev`, otherwise devDependencies are silently omitted.
- Dev server: `npm run dev` (the Cloudflare adapter does not support `astro preview`).
- Build: `npm run build` · Type-check: `npx astro check`
- Deploy: `npm run deploy` (Cloudflare Worker with static assets; config in `wrangler.jsonc`). The
  approved production target is the existing `jit-works` Worker at `jit.works`. After relevant
  checks pass and a change is merged, deploy there routinely without a separate owner approval,
  then run production health checks. Ask before changing the Worker, domain, DNS, visibility,
  privacy, security boundary, or deployment target.
- Work status: `npm run work -- brief`
- Work-system tests: `npm run test:work`
- Full current test suite: `npm test`

## Sources of truth

- Tests and code define implemented behavior.
- `docs/README.md` defines where durable product knowledge belongs.
- Current specifications describe cross-cutting behavior and evolve with it.
- Important, hard-to-reverse technical decisions belong in short ADRs. A Decision issue tracks a choice still being made; it is not the accepted record.
- Risks are issues. Research is dated evidence. Do not create duplicate status catalogs or roadmaps.

## Done means

- Acceptance checks pass with evidence.
- Relevant tests, builds, and runtime checks were run.
- Documentation describing changed behavior is current.
- No unresolved critical review finding remains.
- The work item is updated, and `npm run work -- brief` shows this product's current state and local
  Ready options.
