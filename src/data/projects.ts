// Single source of truth for the four selected projects (issue #3).
// Reused verbatim by both the main page and the /upwork surface.
//
// COPY & LINKS are public-safe and subject to owner approval before the deploy slice.
// STATS are illustrative capability descriptors, not audience/usage claims — replace or
// confirm with the owner before shipping.
// `upworkLinkable` is the contact-boundary gate for the /upwork surface: a destination is
// linked there only after the deploy-slice audit confirms it exposes no off-platform contact
// path. All four start `false` (audit pending); flip per destination once audited.

export type StatusTone = 'live' | 'beta' | 'preview' | 'sketch';

export interface Stat {
  /** Short value, e.g. "E2EE". */
  v: string;
  /** Uppercase label under the value. */
  l: string;
}

export interface Project {
  id: string;
  no: string;
  title: string;
  category: string;
  status: string;
  statusTone: StatusTone;
  tagline: string;
  /** Media-switcher tab labels (stage 1/2/3). */
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
  /** May this destination be linked from the Upwork-safe surface? Set by the deploy-slice audit. */
  upworkLinkable: boolean;
  stats: [Stat, Stat, Stat];
  blurb: string;
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
    tagline:
      'A personal command center for starting, watching, and steering coding-agent sessions from laptop or phone.',
    screens: ['01 · Sessions', '02 · Live', '03 · Steer'],
    overview:
      "Coding agents do real work, but usually only while you're glued to a terminal. Mobidev turns that into something you can run from anywhere — start a session, watch it think and act in real time, and step in to steer or approve, whether you're at your desk or on your phone.",
    tech:
      'A single control plane over long-running agent sessions with a live event stream, so laptop and phone stay in sync. Built to observe and safely interrupt agent tool-calls in the moment, not just tail logs.',
    stack: ['Real-time', 'Cross-device', 'Agent sessions'],
    role: 'Design + build',
    period: '2025 — now',
    upworkLinkable: false,
    stats: [
      { v: 'Preview', l: 'status' },
      { v: 'Laptop + phone', l: 'surfaces' },
      { v: 'Live', l: 'session stream' },
    ],
    blurb:
      'Run and supervise coding-agent sessions from anywhere — start work at your desk, keep an eye on it from your phone, and jump in when it matters.',
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
    tagline:
      'A local-first personal suite that keeps your daily tools private, offline-ready, and end-to-end encrypted.',
    screens: ['01 · Today', '02 · Suite', '03 · Sync'],
    overview:
      "Most personal apps put your life on someone else's server. LifeSuite flips that: your notes, tasks, and daily tools live on your device first, work fully offline, and sync end-to-end encrypted — so the data stays yours and still follows you across devices.",
    tech:
      'A local-first architecture with an offline-capable store and end-to-end encrypted sync, so the app is fully usable with no network and the server never sees plaintext.',
    stack: ['Local-first', 'Offline', 'E2EE'],
    role: 'Design + build',
    period: '2024 — now',
    href: 'https://lifesuite-spa.vercel.app',
    upworkLinkable: false,
    stats: [
      { v: 'Local-first', l: 'data model' },
      { v: 'Offline', l: 'works fully' },
      { v: 'E2EE', l: 'sync' },
    ],
    blurb:
      'Your everyday tools, kept private by design — on-device first, usable offline, and end-to-end encrypted when it syncs.',
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
    tagline: 'Anonymous chat with AI moderation that runs before a message is ever delivered.',
    screens: ['01 · Chat', '02 · Shield', '03 · Anon'],
    overview:
      "SafeChat lets people talk anonymously without it turning toxic. Every message passes AI moderation before delivery — masking identifying details and blocking abuse — and nothing is kept afterwards, because there's no message history at all.",
    tech:
      "Pre-delivery moderation sits in the send path: each message is screened and identifying information masked before it reaches the recipient. The design is deliberately history-less — messages aren't stored — so there's nothing to leak later.",
    stack: ['AI moderation', 'Anonymous', 'No history'],
    role: 'Design + build',
    period: '2025',
    href: 'https://safechat.jithusunnyk.workers.dev',
    upworkLinkable: false,
    stats: [
      { v: 'Pre-delivery', l: 'moderation' },
      { v: 'Masked', l: 'identity' },
      { v: 'None', l: 'stored history' },
    ],
    blurb:
      'Talk anonymously without the toxicity — AI screens and masks every message before it lands, and nothing is stored afterwards.',
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
    tagline: 'A browser-based 3D kart racer with local split-screen and cross-device online play.',
    screens: ['01 · Track', '02 · Split', '03 · Online'],
    overview:
      'Rolleo is a proper kart racer that runs in a browser tab — no install, no store. Grab a friend on the couch for local split-screen, or race people on other devices online, all rendered in real-time 3D on the web.',
    tech:
      'A real-time 3D racing game running entirely in the browser, with local split-screen rendering and networked cross-device multiplayer — built on web graphics and a low-latency netcode layer.',
    stack: ['WebGL / 3D', 'Split-screen', 'Online multiplayer'],
    role: 'Design + build',
    period: '2024 — now',
    href: 'https://playrolleo.com',
    upworkLinkable: false,
    stats: [
      { v: '3D', l: 'in the browser' },
      { v: 'Split-screen', l: 'local co-op' },
      { v: 'Cross-device', l: 'online play' },
    ],
    blurb:
      'A no-install 3D kart racer in a browser tab — split-screen on the couch or cross-device online, rendered in real-time 3D.',
    features: [
      'Runs in the browser — no install',
      'Local split-screen multiplayer',
      'Cross-device online races',
    ],
  },
];
