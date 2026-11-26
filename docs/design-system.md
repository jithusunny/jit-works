# Portfolio design system

This reference describes the implemented jit.works design in four layers: foundations,
components, patterns and screens. It is a map of the existing website, not a new component
library. [Maintaining the portfolio](portfolio.md) owns the design intent, media rules and
verification workflow; this document explains how the pieces fit together. The palette, type and
identity belong to jit.works. Another brand can reuse the four-layer structure and interaction
contracts while establishing its own visual identity.

The [stylesheet](../src/styles/portfolio.css) and rendered page remain authoritative for exact
values. The stylesheet contains later refinements and responsive overrides: inspect every
matching selector, not just its first declaration. Some responsive queries also appear in markup
and scripts. Line links below locate relevant rules;
selector names remain useful when lines move.

## 1. Foundations

Foundations supply the visual vocabulary shared by the pieces above them.

**Colour.** The [root variables](../src/styles/portfolio.css#L14) define the main forest-green
canvas (`--green: #142b20`), warm white text (`--ink: #f3f1e9`), secondary text
(`--muted: #bbc6b4`) and pale green accent (`--accent: #c8e69e`). Root focus and hover colours
are `#b3d78e` and `#d8efb9`. The selected-work and collaboration sections use related green
gradients and fine rules. Most project panels are transparent; `#swishbook` uses a matching
solid `#1b3428` surface. These are not independent light boxes.
See [section surfaces and scoped variables](../src/styles/portfolio.css#L1718).

The stylesheet also retains `--paper`, `--paper-ink`, `--paper-muted` and `--line`. Their root
values are not the effective colours of every project section: `.project-panel` and `.approach`
override the paper text variables. White feedback panels and colours inside product screenshots
belong to those demonstrations, not a second global website theme.

**Typography.** Local Figtree is the site family, with system fallbacks and `font-display: swap`.
Body text is 18px/1.5, becoming 16px/1.5 at widths up to 700px. Headings normally use weight 500
and tight tracking; each heading selector controls its own responsive size. Eyebrows are compact,
tracked labels, not substitutes for descriptive headings. [Font and base rules](../src/styles/portfolio.css#L1).

Project identities deliberately differ: Swishbook uses local Inter, Sunny Varkey K. uses local
Literata, and other names keep their own family and weight. Mridhu uses its actual wordmark
artwork. These are [identity exceptions](../src/styles/portfolio.css#L6876), not competing defaults
for body copy.

**Space and scale.** `--gutter` is `clamp(24px, 5.5vw, 150px)`, overridden to 24px up to 700px,
30px on short landscape screens up to 950px wide, and 19px up to 360px. Section padding, reading widths, gaps,
radii and shadows are owned by their selectors; there is no universal spacing or radius scale.
For example, desktop `.project-info` is limited to 390px while the adjacent media can grow.
[Reading-column rules](../src/styles/portfolio.css#L3207).

**Motion and input.** Motion supports orientation without gating content. The
[reveal script](../src/scripts/reveal.js) keeps content visible and adds a small entrance movement.
[Collage motion](../src/scripts/collage.js) stops offscreen, in a hidden document and under reduced
motion. Hover treatments are supplementary; keyboard focus and touch actions remain available.

## 2. Components

These are reusable visual or interactive pieces, whether implemented as CSS classes, markup or
scripts. The Astro files mostly compose sections; they are not a separate primitive library.

| Piece | Implementation and current contract |
| --- | --- |
| Navigation | [Header](../src/components/portfolio/Header.astro), `.site-header`, `.wordmark`, `.nav-contact`. Includes a skip link, project/work-style anchors and a contact avatar; [responsive navigation](../src/styles/portfolio.css#L5860) preserves distinct touch targets. |
| Links and buttons | `.text-link`, `.round-link`, `.button` and `.card-visit` have different jobs. The [contact button](../src/styles/portfolio.css#L5173) is at least 56px tall; [expand buttons](../src/styles/portfolio.css#L6342) are 44px circles below previews. Do not replace these roles with one generic button style. |
| Product identity | `.project-identity`, `.identity-mark`, `.identity-name`, `.identity-wordmark` combine marks and names while preserving each product's identity. [Rules](../src/styles/portfolio.css#L6876). |
| Device presentation | `.laptop-device`, `.tablet-device`, `.phone-device` layer separate screenshots behind photographic hardware. [Shell geometry](../src/styles/portfolio.css#L3582) and later selectors preserve screen openings and safe areas; `.menu-tablet` has its own [rotating tablet frame](../src/styles/portfolio.css#L6248). |
| Feature tabs | `.life-feature-tabs` and [LifeSuite behaviour](../src/scripts/lifesuite.js) change the summary and matching tablet/phone images with tab semantics and keyboard navigation. |
| Media dialog | [Markup](../src/components/portfolio/MediaDialog.astro), [behaviour](../src/scripts/media-dialog.js) and [viewport-fit styling](../src/styles/portfolio.css#L5605). Original image, nearby caption and close control; no decorative hardware or gallery toolbar inside the dialog. |

## 3. Patterns

Patterns combine components into recognisable, repeatable arrangements.

- **Product proof:** [Projects](../src/components/portfolio/Projects.astro) pairs a project identity,
  category, purpose, short detail and destination with its media. `.project-panel` boundaries use
  space and fine rules. Its gallery stays within that project. Mridhu combines two device views;
  LifeSuite adds feature tabs; Swishbook embeds a reader; ProjectBoard links to a plan example.
- **Compact projects:** `.more-project-card` uses an 8:5 image, 20px corners and a floating visit
  link. The image opens media; the visit link opens the product. These three cards deliberately
  have no device frame. [Card rules and short-landscape exception](../src/styles/portfolio.css#L6103).
- **Work-style evidence:** [WorkingTogether](../src/components/portfolio/WorkingTogether.astro)
  starts with a four-step path, then uses `.process-row` to pair an explanation with design,
  decisions, feedback, instructions, tracking or updates. Chat variants share `.chat-phone` and
  `.guide-chat`; they show the client's view and keep text separate from image attachments.
- **Feedback over a visible design:** `.feedback-ready` presents a local comment interaction,
  not a customer integration. Its [scoped styles](../src/styles/portfolio.css#L6424) and
  [script](../src/scripts/feedback-demo.js) handle selected targets, comments, confirmation,
  offscreen playback and short-height completion without hiding the underlying design.
- **Supporting capabilities and future services:** [Capabilities](../src/components/portfolio/Capabilities.astro)
  groups current help under four headings. Its grid becomes two columns up to 1200px and one up
  to 600px. [Upcoming](../src/components/portfolio/Upcoming.astro) separately uses 3:2 media cards
  under “Available soon”. These are distinct claims, not interchangeable card collections.
- **One contact invitation:** [Contact](../src/components/portfolio/Contact.astro) centres its
  heading, explanation, WhatsApp button and email link on one reading axis. Destinations come
  from [site data](../src/data/site.ts), not duplicated literals.

## 4. Screens

[The homepage](../src/pages/index.astro) composes Header → Hero → Projects → Working together →
Capabilities → Upcoming → Contact → Footer, with one shared media dialog. The hero is a distinct
composition: level laptop, tilted phone and oppositely tilted menu, with different imagery from
later project views. Its final placement and motion rules include
[collage drift](../src/styles/portfolio.css#L5730) and [phone/book positions](../src/styles/portfolio.css#L5994).

Phone, tablet and desktop are compositions of this same page, not separate routes. Portrait
tablets and short landscape screens have specific layout rules; width alone is insufficient.
The reader rotates to a portrait tablet at 700px, compact project cards stay frameless, and
feedback uses a phone presentation for narrow screens and landscape viewports up to 950px wide
and 500px tall, plus a tablet frame at 701–950px in portrait. Both ProjectBoard presentations
switch from laptop to phone at widths up to 700px. Keep the corresponding queries in
[project markup](../src/components/portfolio/Projects.astro),
[project-frame behaviour](../src/scripts/project-frame.js) and
[feedback behaviour](../src/scripts/feedback-demo.js) consistent when changing these layouts.

The opened image/video dialog is another page state. Arrow keys move only within its current
collage, project, collaboration example or service group. The [menu](../public/demos/menu/index.html)
and [project plan](../public/demos/project-plan/index.html) are isolated embedded documents with
their own internal screens and controls, not site-wide design primitives.

## Keeping the reference current

Change the owning selector/component first, then update the affected layer here when its shared
contract changes. Recheck line links after stylesheet edits. Update [portfolio.md](portfolio.md) when design intent or maintainer behaviour
changes. Do not add a parallel catalogue of every CSS value or turn a product-specific exception
into a global rule without a reason.

Use [browser acceptance checks](../tests/portfolio.spec.ts) for the nine supported verification
viewports, scoped galleries, local interactions, contact alignment and no-JavaScript content.
Follow [portfolio verification](portfolio.md#verification) for commands and whole-page visual
review, including opened media, reduced motion, landscape and an older browser. Automated
geometry checks and Chromium emulation do not establish visual quality or physical-device
Safari behaviour. Documentation-only changes need link/source checks, not new runtime tests.
