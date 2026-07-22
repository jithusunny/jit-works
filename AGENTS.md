# jit.works agent operating rules

Shared brief for every coding agent in this repository. Keep it short: operating rules and up-front context only. Detailed history and completed planning do not belong here.

jit.works is the public portfolio and studio website for Jithu Sunny. It should become one concise, credible link that shows selected work and makes it easy to start a conversation. The technical stack is not selected yet; choose it only when an implementation slice needs that decision.

## Talking to me

- Short and plain. Lead with the answer, then the reason in a few lines.
- Be practical and unambiguous: say what changes, where, and what I will see.
- When I ask why, what, or how, explain first; do not edit until I say go.
- Make URLs clickable Markdown links.

## How we work

- Discuss ambiguous product or behavior choices; do not silently choose for me.
- For clear execution, keep momentum. Stop only for a choice you genuinely cannot resolve.
- Big or risky work: plan, red-team, then execute.
- A skipped or declined question must stop the work; do not guess.
- Operational status and priority come from `npm run work -- brief`.
- Durable shared preferences belong here, not in an agent's private memory.

## Engineering bar

Clean, lean, correct, maintainable. Use proportionate tests, review your own change, and update durable documentation with behavior. Avoid hacks, unused abstractions, and premature infrastructure.

## Start

- For any repository change, run `npm run work -- brief` before planning or editing.
- Use the active item, or the first ready item when asked for the next work.
- If the work service is unavailable, report it. Continue only from an issue the user explicitly selected; otherwise ask for the intended outcome.
- Read only the selected issue and the technical references it explicitly links.
- Before implementation, confirm the user/problem, observable outcome, first-version scope, non-scope, constraints, and acceptance evidence are clear enough. Skip this ceremony for an obvious bug or routine task.
- Resolve public-safe product ambiguity here. If essential reasoning is sensitive, ask for a standalone sanitized requirement; never search for or depend on undisclosed context.

## Work tracking

- GitHub issues are the public work records. This repository contains every public constraint needed to understand, build, test, and contribute to jit.works.
- Never depend on, mention, or search for undisclosed repositories or private planning.
- Search open and closed work before creating an issue. Update an existing item instead of duplicating it.
- Treat a large brainstorm as intake evidence, not an automatic roadmap. Reconcile it with existing work first, and never commit sensitive raw material.
- Ask before a material phase change, cancellation, public release, destructive action, or rewrite of an accepted outcome. Small deduplication and clearer wording do not need approval.
- For explicitly requested scoped work, commit, push, and merge after checks pass, the diff is reviewed, and no critical finding remains. Ask only when a genuine unresolved user choice remains.
- New durable findings go to Inbox and do not displace active work unless they reveal a critical security, data-loss, privacy, or release-integrity risk.
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

## Repository layout and commands

- `docs/` contains current public specifications and accepted technical decisions.
- `ops/` contains product-scoped work tooling.
- Application directories and stack-specific commands will be documented when the first implementation slice selects them.
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
- The work item is updated, and `npm run work -- brief` gives the next step.
