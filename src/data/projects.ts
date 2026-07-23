// Single source of truth for the four selected projects (issue #3).
// Reused verbatim by both the main page and the /upwork surface.
//
// The card is a glance surface: it carries a hook (problem + twist), one plain-language
// "hard part", a real screenshot, and one honest action. Depth (the idea, the tech, stack,
// role, gallery) lives in the detail overlay. COPY & LINKS are public-safe and subject to
// owner approval before the deploy slice.
//
// `upworkLinkable` is the contact-boundary gate for the /upwork surface: a destination is
// linked there only after the deploy-slice audit confirms it exposes no off-platform contact
// path. All four start `false` (audit pending); flip per destination once audited.

export type StatusTone = 'live' | 'beta' | 'preview' | 'sketch';

export interface Project {
  id: string;
  no: string;
  title: string;
  category: string;
  status: string;
  statusTone: StatusTone;
  /** Card hook: the problem with a twist, in one sentence. */
  tagline: string;
  /** Card credibility line: the one clever/hard thing, in plain words. */
  hardPart: string;
  /** Media-switcher tab labels used by the overlay gallery (stage 1/2/3). */
  screens: [string, string, string];
  /** "The idea" overview. */
  overview: string;
  /** "Under the hood" technical note (public-safe — no private stack leak). */
  tech: string;
  stack: string[];
  role: string;
  period: string;
  /** Live destination for the product. Absent for private-preview work (Mobidev). */
  href?: string;
  /** Action label when the destination is linked (e.g. "Try it live", "Play it now"). */
  ctaLabel?: string;
  /** May this destination be linked from the Upwork-safe surface? Set by the deploy-slice audit. */
  upworkLinkable: boolean;
  /** Concrete capabilities, shown in the detail overlay. */
  features: [string, string, string];
}

export const DOT_COLOR: Record<StatusTone, string> = {
  live: '#3E9E5B',
  beta: '#C79A3B',
  preview: '#C79A3B',
  sketch: '#9A9384',
};

export const projects: Project[] = [
  {
    id: 'mobidev',
    no: '01',
    title: 'Mobidev',
    category: 'Dev tools',
    status: 'Private preview',
    statusTone: 'preview',
    tagline: 'Run and steer your AI coding agents from your phone.',
    hardPart: 'Jump into a live agent session from anywhere — approve or redirect in the moment.',
    screens: ['01 · Sessions', '02 · Live', '03 · Steer'],
    overview:
      "Coding agents do real work, but usually only while you're glued to a terminal. Mobidev turns that into something you can run from anywhere — start a session, watch it think and act in real time, and step in to steer or approve, whether you're at your desk or on your phone.",
    tech:
      'A single control plane over long-running agent sessions with a live event stream, so laptop and phone stay in sync. Built to observe and safely interrupt agent tool-calls in the moment, not just tail logs.',
    stack: ['Real-time', 'Cross-device', 'Agent sessions'],
    role: 'Design + build',
    period: '2025 — now',
    upworkLinkable: false,
    features: [
      'Start & steer agent sessions remotely',
      'Live session stream, laptop ↔ phone',
      'Approve or interrupt tool-calls in the moment',
    ],
  },
  {
    id: 'lifesuite',
    no: '02',
    title: 'LifeSuite',
    category: 'Software',
    status: 'Live',
    statusTone: 'live',
    tagline: 'Your personal tools, fully private — offline and end-to-end encrypted.',
    hardPart: 'Fully usable with no network; the server never sees your data.',
    screens: ['01 · Today', '02 · Suite', '03 · Sync'],
    overview:
      "Most personal apps put your life on someone else's server. LifeSuite flips that: your notes, tasks, and daily tools live on your device first, work fully offline, and sync end-to-end encrypted — so the data stays yours and still follows you across devices.",
    tech:
      'A local-first architecture with an offline-capable store and end-to-end encrypted sync, so the app is fully usable with no network and the server never sees plaintext.',
    stack: ['Local-first', 'Offline', 'E2EE'],
    role: 'Design + build',
    period: '2024 — now',
    href: 'https://lifesuite-spa.vercel.app',
    ctaLabel: 'Try it live',
    upworkLinkable: false,
    features: [
      'On-device first, works fully offline',
      'End-to-end encrypted sync',
      'One private home for daily tools',
    ],
  },
  {
    id: 'safechat',
    no: '03',
    title: 'SafeChat',
    category: 'AI',
    status: 'Live',
    statusTone: 'live',
    tagline: 'Anonymous chat that AI cleans up before a message ever lands.',
    hardPart: 'Screens and masks every message before delivery — and stores nothing.',
    screens: ['01 · Chat', '02 · Shield', '03 · Anon'],
    overview:
      "SafeChat lets people talk anonymously without it turning toxic. Every message passes AI moderation before delivery — masking identifying details and blocking abuse — and nothing is kept afterwards, because there's no message history at all.",
    tech:
      "Pre-delivery moderation sits in the send path: each message is screened and identifying information masked before it reaches the recipient. The design is deliberately history-less — messages aren't stored — so there's nothing to leak later.",
    stack: ['AI moderation', 'Anonymous', 'No history'],
    role: 'Design + build',
    period: '2025',
    href: 'https://safechat.jithusunnyk.workers.dev',
    ctaLabel: 'Try it live',
    upworkLinkable: false,
    features: [
      'Moderation before delivery, not after',
      'Identifying info masked automatically',
      'No message history by design',
    ],
  },
  {
    id: 'rolleo',
    no: '04',
    title: 'Rolleo',
    category: 'Game',
    status: 'Live',
    statusTone: 'live',
    tagline: 'A 3D kart racer in a browser tab — split-screen or online.',
    hardPart: 'Real-time 3D and cross-device multiplayer, with no install.',
    screens: ['01 · Track', '02 · Split', '03 · Online'],
    overview:
      'Rolleo is a proper kart racer that runs in a browser tab — no install, no store. Grab a friend on the couch for local split-screen, or race people on other devices online, all rendered in real-time 3D on the web.',
    tech:
      'A real-time 3D racing game running entirely in the browser, with local split-screen rendering and networked cross-device multiplayer — built on web graphics and a low-latency netcode layer.',
    stack: ['WebGL / 3D', 'Split-screen', 'Online multiplayer'],
    role: 'Design + build',
    period: '2024 — now',
    href: 'https://playrolleo.com',
    ctaLabel: 'Play it now',
    upworkLinkable: false,
    features: [
      'Runs in the browser — no install',
      'Local split-screen multiplayer',
      'Cross-device online races',
    ],
  },
];
