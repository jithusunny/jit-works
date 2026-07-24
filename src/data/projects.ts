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

export interface ProjectMedia {
  src: string;
  alt: string;
  kind?: 'image' | 'video';
  poster?: string;
  badge?: string;
}

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
  /** Approved public media. Omit while an evidence pack is still pending. */
  media?: [ProjectMedia, ProjectMedia, ProjectMedia];
  /** "The idea" overview. */
  overview: string;
  /** "Under the hood" technical note (public-safe, no private stack leak). */
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
    tagline: 'Start, watch, and steer coding sessions from a laptop or phone.',
    hardPart: 'The session stays on your own box while every connected device shows the same state.',
    screens: ['01 · Live', '02 · Sessions', '03 · Approve'],
    media: [
      {
        src: '/assets/projects/mobidev/desktop-working.png',
        alt: 'Mobidev desktop conversation showing a coding session working on a synthetic notes app.',
      },
      {
        src: '/assets/projects/mobidev/mobile-session-list.png',
        alt: 'Mobidev phone session list showing synthetic active and waiting coding sessions.',
      },
      {
        src: '/assets/projects/mobidev/mobile-permission.png',
        alt: 'Mobidev phone conversation showing a synthetic permission request with allow and deny choices.',
      },
    ],
    overview:
      'Coding sessions are usually tied to the terminal where they started. Mobidev keeps the agent on an always-on machine and turns the laptop and phone into synchronized windows for starting work, following progress, approving requests, and sending follow-ups.',
    tech:
      'One box owns each session and its state. The mobile and desktop interfaces share that session engine, reconnect quietly, and let the owner review permissions, approve plans, or queue and send steering without moving the underlying work.',
    stack: ['Real-time', 'Cross-device', 'Agent sessions'],
    role: 'Design + build',
    period: 'Since 2025',
    upworkLinkable: false,
    features: [
      'Start and steer sessions on your own box',
      'The same session on laptop and phone',
      'Review permissions, plans, and follow-ups',
    ],
  },
  {
    id: 'lifesuite',
    no: '02',
    title: 'LifeSuite',
    category: 'Software',
    status: 'Evidence review',
    statusTone: 'preview',
    tagline: 'A local-first personal suite designed to work offline and sync encrypted records.',
    hardPart: 'Its public evidence pack and deployment provenance are still under review.',
    screens: ['01 · Today', '02 · Suite', '03 · Sync'],
    overview:
      'LifeSuite brings daily personal tools into one offline-capable application. Its portfolio evidence and public deployment claims are still under review, so this release shows the concept without linking the product.',
    tech:
      'The current implementation uses encrypted local storage and encrypted synchronization. Detailed security and deployment claims will be published only after the evidence review is complete.',
    stack: ['Local-first', 'Offline', 'E2EE'],
    role: 'Design + build',
    period: 'Since 2024',
    upworkLinkable: false,
    features: [
      'Offline-capable local workflows',
      'Encrypted local storage and sync',
      'Public evidence pack under review',
    ],
  },
  {
    id: 'safechat',
    no: '03',
    title: 'SafeChat',
    category: 'AI',
    status: 'Live',
    statusTone: 'live',
    tagline: 'Anonymous one-to-one chat where every message is checked before delivery.',
    hardPart: 'Contact details are masked first; contextual moderation can deliver, mask, block, or end.',
    screens: ['01 · Protected', '02 · Blocked', '03 · Masked'],
    media: [
      {
        src: '/assets/projects/safechat/room-protection.png',
        alt: 'A production SafeChat conversation ended before a coercive secrecy and private-photo request was delivered.',
      },
      {
        src: '/assets/projects/safechat/platform-block.png',
        alt: 'A production SafeChat phone conversation where an Instagram request is blocked and the ordinary chat continues.',
      },
      {
        src: '/assets/projects/safechat/location-masking.png',
        alt: 'A production SafeChat conversation with fictional school and location details masked in place.',
      },
    ],
    overview:
      'Anonymous chat makes it easy to expose identifying details or send harmful content before the other person can react. SafeChat adds a visible moderation step at the delivery boundary without adding accounts or retaining a conversation history.',
    tech:
      'An edge Worker matches two people, then a single-use room processes messages in order. Deterministic patterns mask obvious contact details before a contextual model decides whether to deliver, mask, block, or end. Message text is handled in memory, not persisted.',
    stack: ['AI moderation', 'Anonymous', 'No history'],
    role: 'Design + build',
    period: '2025',
    href: 'https://safechat.jithusunnyk.workers.dev',
    ctaLabel: 'Try it live',
    upworkLinkable: false,
    features: [
      'Checked before delivery',
      'Mask, block, or end in context',
      'No persisted conversation history',
    ],
  },
  {
    id: 'rolleo',
    no: '04',
    title: 'Rolleo',
    category: 'Game',
    status: 'Live',
    statusTone: 'live',
    tagline: 'A 3D kart racer in a browser tab, split-screen or online.',
    hardPart: 'Fresh procedural tracks, deterministic simulation, and 1v1 netcode with no install.',
    screens: ['01 · Gameplay', '02 · Mobile', '03 · Switzerland'],
    media: [
      {
        src: '/assets/projects/rolleo/gameplay-7s.mp4',
        poster: '/assets/projects/rolleo/gameplay-poster.png',
        kind: 'video',
        badge: '7s clip',
        alt: 'Rolleo gameplay showing synthetic racers on a procedurally generated track.',
      },
      {
        src: '/assets/projects/rolleo/mobile-race.png',
        alt: 'Rolleo mobile gameplay showing touch controls and synthetic racers.',
      },
      {
        src: '/assets/projects/rolleo/switzerland-race.png',
        alt: 'Rolleo desktop gameplay showing synthetic racers on the Switzerland track.',
      },
    ],
    overview:
      'Rolleo is a proper kart racer that runs in a browser tab, with no install and no store. Grab a friend on the couch for local split-screen, or race people on other devices online, all rendered in real-time 3D on the web.',
    tech:
      'A fixed-timestep simulation drives host state, client prediction, and reconciliation replay. Online races use a WebRTC data channel when available and fall back to a lightweight Cloudflare Worker relay.',
    stack: ['WebGL / 3D', 'Split-screen', 'Online multiplayer'],
    role: 'Design + build',
    period: 'Since 2024',
    href: 'https://playrolleo.com',
    ctaLabel: 'Play it now',
    upworkLinkable: false,
    features: [
      'Fresh procedural track every race',
      'Couch 2-player and 1v1 online',
      'Desktop and mobile, no install',
    ],
  },
];
