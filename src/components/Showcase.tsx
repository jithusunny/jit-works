/** @jsxImportSource preact */
import { useEffect, useRef, useState } from 'preact/hooks';
import type { JSX } from 'preact';
import { projects, DOT_COLOR, type Project } from '../data/projects';
import {
  UPWORK_URL,
  AUTOPLAY_SECONDS,
  PHOTO_OPACITY_DESKTOP,
  PHOTO_OPACITY_MOBILE,
  type ShowcaseVariant,
} from '../data/site';

interface Props {
  variant: ShowcaseVariant;
}

/** Cast helper so verbose inline style bags satisfy the strict style prop type. */
const sx = (o: Record<string, unknown>): JSX.CSSProperties => o as JSX.CSSProperties;

const N = projects.length;
const LOOP: Project[] = [projects[N - 1], ...projects, projects[0]];
const DURATION = AUTOPLAY_SECONDS * 1000;
/** The track's slide transition. Applied imperatively so it is never lost to vdom diffing. */
const TRACK_TRANS = 'transform 0.6s cubic-bezier(0.4,0,0.2,1)';
/**
 * Hero height, shared across the mobile/desktop breakpoint so nothing jumps at 640px.
 * The `vw` term shrinks the hero as the window narrows (cards rise gradually); the `86dvh`
 * cap keeps the full-bleed hero on wide screens as the design intends.
 */
const HERO_H = 'clamp(300px, calc(10dvh + 60vw), 86dvh)';
const pad = (x: number) => String(x).padStart(2, '0');
const real = (vi: number) => (((vi - 1) % N) + N) % N;

/**
 * The product destination we may link to for this project on this surface.
 * On the Upwork-safe surface a destination is linked only after its contact-boundary
 * audit passes (`upworkLinkable`). On the main page any live product link is allowed.
 */
function productLink(p: Project, isUpwork: boolean): string | undefined {
  if (!p.href) return undefined;
  if (isUpwork && !p.upworkLinkable) return undefined;
  return p.href;
}

const dot = (p: Project): JSX.CSSProperties =>
  sx({ width: '7px', height: '7px', borderRadius: '50%', background: DOT_COLOR[p.statusTone], display: 'inline-block' });

/** A clean, intentional placeholder for a project media stage (real screenshots land in the deploy slice). */
function PlaceholderShot({ label, i }: { label: string; i: number }) {
  return (
    <div style={sx({ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', background: '#FFFFFF' })}>
      <div style={sx({ height: '38px', flex: 'none', display: 'flex', alignItems: 'center', gap: '7px', padding: '0 14px', borderBottom: '1px solid #EEF2E8' })}>
        <span style={sx({ width: '8px', height: '8px', borderRadius: '50%', background: '#3E7A5B' })} />
        <span style={sx({ width: '8px', height: '8px', borderRadius: '50%', background: '#CBD8C2' })} />
        <span style={sx({ marginLeft: '6px', width: '30%', height: '6px', borderRadius: '4px', background: '#E4EADD' })} />
        <span style={sx({ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: '#A6AC98' })}>{label}</span>
      </div>
      <div style={sx({ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' })}>
        {i === 0 && (
          <>
            <div style={sx({ height: '40px', borderRadius: '10px', background: '#F1F4EA', display: 'flex', alignItems: 'center', gap: '10px', padding: '0 14px' })}>
              <span style={sx({ width: '16px', height: '16px', borderRadius: '5px', background: '#3E7A5B', opacity: 0.85 })} />
              <span style={sx({ width: '44%', height: '7px', borderRadius: '4px', background: '#D7DDCB' })} />
            </div>
            <div style={sx({ flex: 1, borderRadius: '10px', background: '#EAF2E1', display: 'flex', alignItems: 'center', gap: '10px', padding: '0 14px' })}>
              <span style={sx({ width: '16px', height: '16px', borderRadius: '5px', background: '#3E7A5B' })} />
              <span style={sx({ width: '32%', height: '7px', borderRadius: '4px', background: '#BFD3AE' })} />
              <span style={sx({ marginLeft: 'auto', width: '42px', height: '16px', borderRadius: '9px', background: '#C9F24E' })} />
            </div>
          </>
        )}
        {i === 1 && (
          <>
            <div style={sx({ display: 'flex', gap: '10px' })}>
              <div style={sx({ flex: 1, height: '64px', borderRadius: '12px', background: '#EAF2E1' })} />
              <div style={sx({ flex: 1, height: '64px', borderRadius: '12px', background: '#F1F4EA' })} />
            </div>
            <div style={sx({ flex: 1, borderRadius: '12px', background: '#F1F4EA', padding: '14px', display: 'flex', alignItems: 'flex-end', gap: '7px' })}>
              <span style={sx({ flex: 1, height: '40%', background: '#CFDCC3', borderRadius: '4px' })} />
              <span style={sx({ flex: 1, height: '66%', background: '#B6CCA6', borderRadius: '4px' })} />
              <span style={sx({ flex: 1, height: '52%', background: '#CFDCC3', borderRadius: '4px' })} />
              <span style={sx({ flex: 1, height: '92%', background: '#3E7A5B', borderRadius: '4px' })} />
              <span style={sx({ flex: 1, height: '60%', background: '#CFDCC3', borderRadius: '4px' })} />
            </div>
          </>
        )}
        {i === 2 && (
          <div style={sx({ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' })}>
            <div style={sx({ width: '72px', height: '72px', borderRadius: '20px', background: 'linear-gradient(150deg,#3E7A5B,#2E5E43)', boxShadow: '0 16px 30px -14px rgba(46,94,67,0.7)' })} />
            <span style={sx({ width: '48%', height: '8px', borderRadius: '5px', background: '#D7DDCB' })} />
            <span style={sx({ width: '30%', height: '8px', borderRadius: '5px', background: '#E4E8D9' })} />
          </div>
        )}
      </div>
      <span
        style={sx({ position: 'absolute', bottom: '10px', right: '12px', fontFamily: 'var(--font-mono)', fontSize: '9.5px', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#B4B29F' })}
      >
        preview
      </span>
    </div>
  );
}

/** A tiny, distinct thumbnail motif per media index; a stand-in until real screenshots land. */
function MiniShot({ i }: { i: number }) {
  return (
    <div style={sx({ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '3px', padding: '6px', background: 'linear-gradient(150deg,#F3F7EE,#E9F1E3)' })}>
      {i === 0 && (
        <>
          <span style={sx({ height: '5px', borderRadius: '3px', background: '#B6CCA6' })} />
          <span style={sx({ height: '5px', width: '70%', borderRadius: '3px', background: '#CFDCC3' })} />
          <span style={sx({ height: '5px', width: '85%', borderRadius: '3px', background: '#CFDCC3' })} />
        </>
      )}
      {i === 1 && (
        <div style={sx({ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '100%' })}>
          <span style={sx({ flex: 1, height: '45%', background: '#CFDCC3', borderRadius: '2px' })} />
          <span style={sx({ flex: 1, height: '80%', background: '#3E7A5B', borderRadius: '2px' })} />
          <span style={sx({ flex: 1, height: '60%', background: '#CFDCC3', borderRadius: '2px' })} />
          <span style={sx({ flex: 1, height: '95%', background: '#B6CCA6', borderRadius: '2px' })} />
        </div>
      )}
      {i === 2 && (
        <div style={sx({ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' })}>
          <span style={sx({ width: '46%', aspectRatio: '1', borderRadius: '6px', background: 'linear-gradient(150deg,#3E7A5B,#2E5E43)' })} />
        </div>
      )}
    </div>
  );
}

/** Full-screen media viewer: ← → / swipe between a project's shots, Esc / × / backdrop to close. */
function Lightbox({
  project, index, onClose, onStep,
}: {
  project: Project;
  index: number;
  onClose: () => void;
  onStep: (d: number) => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const drag = useRef<{ x: number; on: boolean }>({ x: 0, on: false });
  const total = project.screens.length;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); onStep(1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); onStep(-1); }
    };
    document.addEventListener('keydown', onKey);
    const t = setTimeout(() => { try { closeRef.current?.focus(); } catch {} }, 30);
    return () => { document.removeEventListener('keydown', onKey); clearTimeout(t); };
  }, [onClose, onStep]);

  const arrow = (side: 'left' | 'right'): JSX.CSSProperties => sx({
    position: 'absolute', [side]: 'clamp(8px,2vw,28px)', top: '50%', transform: 'translateY(-50%)', zIndex: 2,
    width: '52px', height: '52px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(28,26,20,0.55)', backdropFilter: 'blur(6px)', color: '#F1F7F0', fontSize: '26px', lineHeight: 1, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingBottom: '3px',
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={project.title + ' media'}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      onPointerDown={(e) => { drag.current = { x: e.clientX, on: true }; }}
      onPointerUp={(e) => {
        if (!drag.current.on) return;
        drag.current.on = false;
        const dx = e.clientX - drag.current.x;
        if (dx <= -50) onStep(1);
        else if (dx >= 50) onStep(-1);
      }}
      style={sx({ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(18,17,13,0.86)', backdropFilter: 'blur(6px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'clamp(16px,5vw,64px)', animation: 'fadeIn 0.2s ease', touchAction: 'pan-y' })}
    >
      <button ref={closeRef} onClick={onClose} aria-label="Close" style={sx({ position: 'absolute', top: 'clamp(12px,2vw,24px)', right: 'clamp(12px,2vw,24px)', zIndex: 2, width: '44px', height: '44px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(28,26,20,0.55)', backdropFilter: 'blur(6px)', color: '#F1F7F0', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' })}>&#10005;</button>

      {total > 1 && (
        <>
          <button onClick={() => onStep(-1)} aria-label="Previous image" style={arrow('left')}>&lsaquo;</button>
          <button onClick={() => onStep(1)} aria-label="Next image" style={arrow('right')}>&rsaquo;</button>
        </>
      )}

      <figure style={sx({ margin: 0, width: 'min(96vw, calc(82vh * 16 / 9))', maxWidth: '1400px', display: 'flex', flexDirection: 'column', gap: '14px' })}>
        <div style={sx({ position: 'relative', width: '100%', aspectRatio: '16 / 9', background: '#FFFFFF', borderRadius: 'clamp(10px,1.2vw,16px)', boxShadow: '0 40px 90px -30px rgba(0,0,0,0.6)', overflow: 'hidden' })}>
          <PlaceholderShot label={project.screens[index]} i={index} />
        </div>
        <figcaption style={sx({ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', fontFamily: 'var(--font-mono)', fontSize: '12.5px', letterSpacing: '0.04em', color: 'rgba(241,247,240,0.82)' })}>
          <span>{project.title} · {project.screens[index]}</span>
          <span>{index + 1} / {total}</span>
        </figcaption>
      </figure>
    </div>
  );
}

export default function Showcase({ variant }: Props) {
  const isUpwork = variant === 'upwork';

  const [index, setIndex] = useState(1);
  const [playing, setPlaying] = useState(true);
  const [overlay, setOverlay] = useState<null | 'project' | 'about'>(null);
  const [modalId, setModalId] = useState<string | null>(null);
  const [tab, setTab] = useState<'overview' | 'tech'>('overview');
  const [isMobile, setIsMobile] = useState(false);
  const [isShort, setIsShort] = useState(false);
  const [lightbox, setLightbox] = useState<{ id: string; i: number } | null>(null);

  const trackRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Imperative instance state (mirrors the prototype's `this.*` fields).
  const m = useRef({
    step: 0,
    cardW: 0,
    vpW: 0,
    appliedX: null as number | null,
    vi: 1,
    elapsed: 0,
    last: null as number | null,
    raf: 0,
    dragging: false,
    hovering: false,
    moved: 0,
    suppressClick: false,
    startX: 0,
    dragBase: 0,
    snapT: 0 as ReturnType<typeof setTimeout> | 0,
    fillT: 0,
    prevFocus: null as Element | null,
    prevFocusLB: null as Element | null,
  });
  // Live mirror of reactive state read inside the rAF loop.
  const sync = useRef({ playing: true, hasOverlay: false, index: 1, lightbox: false });
  sync.current = { playing, hasOverlay: overlay != null || lightbox != null, index, lightbox: lightbox != null };

  // Slide animation stays off until the initial layout settles, so early re-measures
  // reposition instantly instead of animating a visible jump.
  const slideReady = useRef(false);
  const trans = () => (slideReady.current ? TRACK_TRANS : 'none');

  function baseOffset() {
    return Math.max(0, ((m.current.vpW || 0) - (m.current.cardW || 0)) / 2);
  }
  function measureStep() {
    const track = trackRef.current;
    if (!track) return;
    const cards = track.children;
    if (cards.length < 2) return;
    const s = (cards[1] as HTMLElement).offsetLeft - (cards[0] as HTMLElement).offsetLeft;
    if (s > 0) {
      m.current.step = s;
      m.current.cardW = (cards[0] as HTMLElement).offsetWidth;
      m.current.appliedX = null;
    }
    const vp = viewportRef.current;
    if (vp) m.current.vpW = vp.clientWidth;
  }
  function styleCards(activeIdx: number) {
    const track = trackRef.current;
    if (!track) return;
    const cards = track.children;
    for (let i = 0; i < cards.length; i++) {
      const d = Math.abs(i - activeIdx);
      const scale = d === 0 ? 1 : 0.965;
      const op = d === 0 ? 1 : Math.max(0.22, 0.38 - (d - 1) * 0.12);
      const c = cards[i] as HTMLElement & { _sc?: string };
      const ns = 'scale(' + scale + ')';
      if (c._sc !== ns) {
        c._sc = ns;
        c.style.transform = ns;
        c.style.opacity = String(op);
      }
    }
  }
  function place(noTrans?: boolean) {
    const tr = trackRef.current;
    if (!tr) return;
    if (!m.current.step || !m.current.cardW) measureStep();
    const vi = m.current.vi;
    const target = baseOffset() - vi * (m.current.step || 0);
    if (noTrans) {
      tr.style.transition = 'none';
      tr.style.transform = 'translateX(' + target + 'px)';
      void tr.offsetWidth;
      tr.style.transition = trans();
    } else {
      tr.style.transition = trans();
      tr.style.transform = 'translateX(' + target + 'px)';
    }
    m.current.appliedX = target;
    styleCards(vi);
  }
  function applyLayout() {
    measureStep();
    place();
  }
  function setFills(frac: number) {
    const c = progressRef.current;
    if (!c) return;
    const fills = c.querySelectorAll('[data-fill]');
    const idx = real(sync.current.index);
    fills.forEach((f, i) => {
      const el = f as HTMLElement & { _w?: number };
      const w = i < idx ? 100 : i === idx ? Math.round(frac * 1000) / 10 : 0;
      if (el._w !== w) {
        el._w = w;
        el.style.width = w + '%';
        if (el.parentElement) el.parentElement.style.opacity = i === idx ? '1' : '0.6';
      }
    });
  }

  function go(delta: number) {
    m.current.elapsed = 0;
    if (m.current.snapT) clearTimeout(m.current.snapT);
    const nv = m.current.vi + delta;
    m.current.vi = nv;
    setIndex(nv);
    place();
    if (nv === 0 || nv === N + 1) {
      m.current.snapT = setTimeout(() => {
        const r = nv === 0 ? N : 1;
        m.current.vi = r;
        setIndex(r);
        place(true);
      }, 660);
    }
  }
  const next = () => go(1);
  const prev = () => go(-1);
  function goTo(i: number) {
    m.current.elapsed = 0;
    if (m.current.snapT) clearTimeout(m.current.snapT);
    m.current.vi = i + 1;
    setIndex(i + 1);
    place();
  }
  function togglePlay() {
    m.current.elapsed = 0;
    m.current.last = null;
    setPlaying((p) => !p);
  }

  function focusPanel() {
    setTimeout(() => {
      try {
        closeBtnRef.current?.focus();
      } catch {}
    }, 45);
  }
  function openProject(id: string) {
    if (m.current.suppressClick) return;
    m.current.prevFocus = document.activeElement;
    setModalId(id);
    setTab('overview');
    setOverlay('project');
    focusPanel();
  }
  function openAbout() {
    m.current.prevFocus = document.activeElement;
    setOverlay('about');
    focusPanel();
  }
  function closeOverlay() {
    setOverlay(null);
    const pf = m.current.prevFocus as HTMLElement | null;
    if (pf && pf.focus) setTimeout(() => { try { pf.focus({ preventScroll: true }); } catch {} }, 0);
  }
  function openLightbox(id: string, i: number) {
    m.current.prevFocusLB = document.activeElement;
    setLightbox({ id, i });
  }
  function closeLightbox() {
    setLightbox(null);
    // preventScroll so returning focus to the gallery thumb doesn't yank the overlay's
    // image column to the bottom (leaving it stuck-looking).
    const pf = m.current.prevFocusLB as HTMLElement | null;
    if (pf && pf.focus) setTimeout(() => { try { pf.focus({ preventScroll: true }); } catch {} }, 0);
  }
  function stepLightbox(d: number) {
    setLightbox((lb) => {
      if (!lb) return lb;
      const total = projects.find((p) => p.id === lb.id)?.screens.length ?? 1;
      return { id: lb.id, i: (lb.i + d + total) % total };
    });
  }

  // Pointer drag
  function onPointerDown(e: PointerEvent) {
    m.current.dragging = true;
    m.current.startX = e.clientX;
    m.current.moved = 0;
    m.current.dragBase = baseOffset() - m.current.vi * m.current.step;
    const tr = trackRef.current;
    if (tr) tr.style.transition = 'none';
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
  }
  function onPointerMove(e: PointerEvent) {
    if (!m.current.dragging) return;
    const dx = e.clientX - m.current.startX;
    m.current.moved = Math.max(m.current.moved, Math.abs(dx));
    const tr = trackRef.current;
    if (tr) tr.style.transform = 'translateX(' + (m.current.dragBase + dx) + 'px)';
  }
  function onPointerUp(e: PointerEvent) {
    if (!m.current.dragging) return;
    m.current.dragging = false;
    const dx = e.clientX - m.current.startX;
    const tr = trackRef.current;
    if (tr) tr.style.transition = trans();
    const th = Math.max(50, m.current.step * 0.14);
    if (dx <= -th) next();
    else if (dx >= th) prev();
    else applyLayout();
    m.current.appliedX = null;
    if (m.current.moved > 8) {
      m.current.suppressClick = true;
      setTimeout(() => { m.current.suppressClick = false; }, 60);
    }
  }

  // Mount: media queries, layout, rAF loop, listeners.
  useEffect(() => {
    try {
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) setPlaying(false);
    } catch {}

    const mq = window.matchMedia('(max-width: 640px)');
    const mqS = window.matchMedia('(max-height: 700px)');
    setIsMobile(mq.matches);
    setIsShort(mqS.matches);
    const onMq = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    const onMqS = (e: MediaQueryListEvent) => setIsShort(e.matches);
    mq.addEventListener('change', onMq);
    mqS.addEventListener('change', onMqS);

    applyLayout();
    const t1 = setTimeout(applyLayout, 220);
    const t2 = setTimeout(() => {
      applyLayout();
      slideReady.current = true; // layout settled; future navigation may animate
    }, 750);
    try {
      if (document.fonts?.ready) document.fonts.ready.then(applyLayout);
    } catch {}

    const onResize = () => applyLayout();
    window.addEventListener('resize', onResize);
    window.addEventListener('load', onResize);

    const onKey = (e: KeyboardEvent) => {
      if (sync.current.lightbox) return; // the Lightbox handles its own Esc / arrows
      if (e.key === 'Escape' && sync.current.hasOverlay) {
        closeOverlay();
        return;
      }
      if (!sync.current.hasOverlay) {
        if (e.key === 'ArrowRight') next();
        else if (e.key === 'ArrowLeft') prev();
        return;
      }
      if (e.key === 'Tab' && panelRef.current) {
        const f = panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])',
        );
        if (f.length) {
          const first = f[0];
          const last = f[f.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };
    document.addEventListener('keydown', onKey);

    const loop = (t: number) => {
      if (m.current.last == null) m.current.last = t;
      let dt = t - m.current.last;
      m.current.last = t;
      if (dt > 120) dt = 120;
      if (!m.current.step) measureStep();
      const active = sync.current.playing && !sync.current.hasOverlay && !m.current.dragging && !m.current.hovering;
      if (active) {
        m.current.elapsed += dt;
        if (m.current.elapsed >= DURATION) {
          m.current.elapsed = 0;
          next();
        }
      }
      if (!m.current.dragging) {
        const target = baseOffset() - m.current.vi * (m.current.step || 0);
        if (m.current.appliedX !== target) place();
        if (t - (m.current.fillT || 0) > 50) {
          m.current.fillT = t;
          setFills(active ? Math.min(m.current.elapsed / DURATION, 1) : 0);
        }
      }
      m.current.raf = requestAnimationFrame(loop);
    };
    const onVis = () => {
      if (document.hidden) {
        cancelAnimationFrame(m.current.raf);
        m.current.raf = 0;
      } else if (!m.current.raf) {
        m.current.last = null;
        m.current.raf = requestAnimationFrame(loop);
      }
    };
    document.addEventListener('visibilitychange', onVis);
    m.current.raf = requestAnimationFrame(loop);
    setFills(0);

    return () => {
      cancelAnimationFrame(m.current.raf);
      mq.removeEventListener('change', onMq);
      mqS.removeEventListener('change', onMqS);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('load', onResize);
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('visibilitychange', onVis);
      clearTimeout(t1);
      clearTimeout(t2);
      if (m.current.snapT) clearTimeout(m.current.snapT);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-place when viewport class flips (mobile/desktop layouts differ).
  useEffect(() => {
    applyLayout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile, isShort]);

  const modalProject = projects.find((p) => p.id === modalId) || projects[0];
  const showExtras = !isMobile && !isShort;
  const primaryLabel = isUpwork ? 'Continue on Upwork' : "Let’s build";
  const ri = real(index);

  // ----- styles that depend on layout -----
  const pageStyle = isMobile
    ? sx({ height: '100dvh', minHeight: '520px', overflow: 'hidden', position: 'relative', background: 'var(--bg)', display: 'flex', flexDirection: 'column' })
    : sx({ minHeight: '100dvh', overflowX: 'clip', position: 'relative', background: 'var(--bg)', display: 'flex', flexDirection: 'column' });
  // Same height on both sides of the breakpoint (see HERO_H) so the cards don't jump at 640px.
  const heroSectionStyle = sx({ flex: 'none', position: 'relative', zIndex: 1, height: HERO_H });
  const heroPhotoWrapStyle = isMobile
    ? sx({ position: 'absolute', left: '-18vw', top: '-9dvh', width: '138vw', height: '64dvh', pointerEvents: 'none' })
    : sx({ position: 'absolute', left: '-4.2vw', top: '-8.3dvh', width: '81.3vw', height: '100dvh', pointerEvents: 'none' });
  const heroTextStyle = isMobile
    ? sx({ position: 'absolute', zIndex: 2, left: 0, right: 0, bottom: 0, padding: '0 clamp(20px,6vw,30px) clamp(6px,1.2vh,14px)', animation: 'riseIn 0.6s cubic-bezier(0.22,1,0.36,1) both' })
    : sx({ position: 'absolute', zIndex: 2, top: 0, bottom: 0, right: '5.7vw', width: 'clamp(300px,34.4vw,760px)', display: 'flex', flexDirection: 'column', justifyContent: 'center', animation: 'riseIn 0.6s cubic-bezier(0.22,1,0.36,1) both' });
  const photoMask = isMobile
    ? 'radial-gradient(ellipse 70% 55% at 46% 38%, #000 10%, rgba(0,0,0,0.85) 35%, rgba(0,0,0,0.55) 58%, rgba(0,0,0,0.3) 75%, rgba(0,0,0,0.1) 90%, transparent 100%)'
    : 'radial-gradient(ellipse 62% 66% at 36% 46%, #000 22%, rgba(0,0,0,0.9) 42%, rgba(0,0,0,0.6) 62%, rgba(0,0,0,0.32) 78%, rgba(0,0,0,0.1) 91%, transparent 100%)';
  const photoStyle = sx({
    width: '100%', height: '100%', objectFit: 'cover',
    objectPosition: isMobile ? '42% 20%' : '35% 70%',
    opacity: isMobile ? PHOTO_OPACITY_MOBILE : PHOTO_OPACITY_DESKTOP,
    WebkitMaskImage: photoMask, maskImage: photoMask, animation: 'fadeIn 0.9s ease both',
  });
  const carouselSectionStyle = isMobile
    ? sx({ flex: '1 1 auto', minHeight: 0, position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', paddingBottom: 'clamp(10px,1.7vh,22px)', animation: 'riseIn 0.65s cubic-bezier(0.22,1,0.36,1) 0.12s both' })
    : sx({ flex: 'none', height: 'min(89dvh, calc(clamp(540px, 37vw, 860px) + 78px))', position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', paddingBottom: 'clamp(14px,2vh,30px)', animation: 'riseIn 0.65s cubic-bezier(0.22,1,0.36,1) 0.12s both' });
  const cardBodyStyle = isMobile
    ? sx({ flex: '1 1 auto', minHeight: 0, display: 'flex', flexDirection: 'column-reverse', gap: '12px', padding: '14px 14px 12px' })
    : sx({ flex: '1 1 auto', minHeight: 0, display: 'flex', gap: 'clamp(18px,2vw,40px)', padding: 'clamp(16px,1.7vw,32px) clamp(18px,2vw,38px)', alignItems: 'stretch' });
  const cardInfoColStyle = isMobile
    ? sx({ flex: 'none', display: 'flex', flexDirection: 'column', gap: '10px', overflow: 'hidden' })
    : sx({ flex: '1 1 0', minWidth: '280px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 'clamp(8px,1.8vh,22px)', padding: 'clamp(4px,0.5vw,10px) 0', overflow: 'hidden' });
  const cardMediaColStyle = isMobile
    ? sx({ flex: '1 1 auto', minHeight: '150px', display: 'flex', flexDirection: 'column', gap: '8px', borderRadius: '16px', overflow: 'hidden', background: 'radial-gradient(120% 130% at 78% 12%, #EAF1E3 0%, #E3EBDC 55%, #DEE7D6 100%)', padding: '10px' })
    : sx({ flex: '1.7 1 0', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 'clamp(8px,0.9vw,12px)', borderRadius: 'clamp(16px,1.8vw,28px)', overflow: 'hidden', background: 'radial-gradient(120% 130% at 78% 12%, #EAF1E3 0%, #E3EBDC 55%, #DEE7D6 100%)', padding: 'clamp(10px,1.2vw,18px)' });

  return (
    <div style={pageStyle}>
      {/* grain overlay */}
      <div
        aria-hidden="true"
        style={sx({
          position: 'absolute', inset: 0, zIndex: 0,
          backgroundImage:
            "url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22150%22 height=%22150%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%222%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22 opacity=%220.5%22/%3E%3C/svg%3E')",
          backgroundSize: '150px', opacity: 0.35, mixBlendMode: 'multiply', pointerEvents: 'none',
        })}
      />

      {/* ===== HEADER ===== */}
      <header style={sx({ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 5, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: 'clamp(14px,2.6vh,30px) clamp(18px,3.2vw,60px)', animation: 'fadeIn 0.5s ease both' })}>
        <nav style={sx({ display: 'flex', alignItems: 'center', gap: 'clamp(18px,2.6vw,30px)' })}>
          <a
            href={UPWORK_URL}
            target="_blank"
            rel="noopener"
            style={sx({ display: 'inline-flex', alignItems: 'center', gap: '13px', background: '#2E5E43', color: '#F1F7F0', cursor: 'pointer', padding: 'clamp(11px,1.05vw,28px) clamp(18px,2vw,52px)', borderRadius: '18px', fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 'clamp(15px,1.35vw,34px)', lineHeight: 1, boxShadow: '0 14px 30px -12px rgba(46,94,67,0.75)' })}
          >
            <span style={sx({ width: '14px', height: '14px', borderRadius: '50%', background: '#C9F24E' })} />
            {primaryLabel}
          </a>
          <button
            onClick={openAbout}
            aria-label="About Jithu"
            style={sx({ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 })}
          >
            <img
              src="/assets/jithu-avatar.jpg"
              alt="Jithu"
              width={150}
              height={150}
              style={sx({ width: 'clamp(44px,10.2vh,150px)', height: 'clamp(44px,10.2vh,150px)', borderRadius: '50%', objectFit: 'cover', border: '3px solid #FBF9F2', boxShadow: '0 10px 26px -8px rgba(46,94,67,0.6)' })}
            />
            <span style={sx({ fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 'clamp(14px,1.15vw,17px)', letterSpacing: '0.01em', color: '#57584A', lineHeight: 1 })}>Jithu</span>
          </button>
        </nav>
      </header>

      {/* ===== HERO ===== */}
      <section style={heroSectionStyle}>
        <div aria-hidden="true" style={heroPhotoWrapStyle}>
          <img src="/assets/jithu-hero.jpg" alt="" style={photoStyle} />
        </div>
        <div style={heroTextStyle}>
          <div style={sx({ fontFamily: 'var(--font-mono)', fontSize: 'clamp(10.5px,0.78vw,19px)', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#3E7A5B', marginBottom: 'clamp(8px,1.4vh,16px)', display: 'flex', alignItems: 'center', gap: '9px' })}>
            <span style={sx({ width: '22px', height: '2px', background: '#C9F24E', display: 'inline-block' })} />A living collection
          </div>
          <h1 style={sx({ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(46px,5.83vw,150px)', lineHeight: 0.9, letterSpacing: '-0.04em', margin: '0 0 clamp(10px,1.5vh,18px)', color: '#20211B' })}>Jit works.</h1>
          <p style={sx({ fontFamily: 'var(--font-ui)', fontSize: 'clamp(14.5px,1.25vw,30px)', lineHeight: 1.45, color: '#57584A', margin: 0, maxWidth: '36ch' })}>
            Projects, tools, and experiments I&rsquo;ve brought to life. Browse below, and click any one for the story.
          </p>
        </div>
      </section>

      {/* ===== CAROUSEL ===== */}
      <section style={carouselSectionStyle}>
        <div
          role="region"
          aria-label="Projects"
          ref={viewportRef}
          onMouseEnter={() => { m.current.hovering = true; }}
          onMouseLeave={() => { m.current.hovering = false; m.current.last = null; }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          style={sx({ position: 'relative', flex: '1 1 auto', minHeight: 0, overflow: 'hidden', padding: '6px 0', touchAction: 'pan-y' })}
        >
          <div ref={trackRef} style={sx({ display: 'flex', gap: 'clamp(8px,1vw,16px)', height: '100%', alignItems: 'stretch', transition: 'none', willChange: 'transform' })}>
            {LOOP.map((p, li) => {
              const link = productLink(p, isUpwork);
              return (
                <article
                  key={li}
                  data-id={p.id}
                  aria-label={p.title}
                  style={sx({ flex: '0 0 auto', width: '83.4vw', height: '100%', position: 'relative', background: '#FBF9F2', borderRadius: 'clamp(24px,2.4vw,40px)', boxShadow: '0 30px 62px -32px rgba(60,50,25,0.42), 0 3px 8px rgba(60,50,25,0.05)', overflow: 'hidden', display: 'flex', flexDirection: 'column', willChange: 'transform,opacity', transition: 'transform 0.55s cubic-bezier(0.22,1,0.36,1), opacity 0.55s ease, box-shadow 0.4s ease' })}
                >
                  <div style={cardBodyStyle}>
                    <div style={cardInfoColStyle}>
                      <div style={sx({ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' })}>
                        <span style={sx({ fontFamily: 'var(--font-mono)', fontSize: 'clamp(11px,0.7vw,14px)', letterSpacing: '0.07em', textTransform: 'uppercase', color: '#2E5E43', background: '#E4EFE3', padding: '5px 11px', borderRadius: '8px' })}>{p.category}</span>
                        <span style={sx({ display: 'inline-flex', alignItems: 'center', gap: '7px', fontFamily: 'var(--font-mono)', fontSize: 'clamp(11px,0.72vw,14px)', color: '#57584A' })}>
                          <span style={dot(p)} />{p.status}
                        </span>
                        <span aria-hidden="true" style={sx({ marginLeft: 'auto', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(18px,1.4vw,28px)', lineHeight: 1, letterSpacing: '-0.02em', color: 'rgba(62,122,91,0.22)' })}>{p.no}</span>
                      </div>
                      <div style={sx({ display: 'flex', flexDirection: 'column', gap: 'clamp(8px,1vw,16px)' })}>
                        <h2 style={sx({ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(28px,3vw,60px)', lineHeight: 0.98, letterSpacing: '-0.03em', margin: 0, color: '#23241E' })}>{p.title}</h2>
                        <p style={sx({ fontFamily: 'var(--font-ui)', fontSize: 'clamp(15px,1.25vw,26px)', lineHeight: 1.35, color: '#3C3D34', margin: 0, maxWidth: '30ch', textWrap: 'pretty' })}>{p.tagline}</p>
                        {showExtras && (
                          <p style={sx({ display: 'flex', gap: '9px', alignItems: 'flex-start', fontFamily: 'var(--font-ui)', fontSize: 'clamp(13px,0.92vw,17px)', lineHeight: 1.5, color: '#57584A', margin: 0, maxWidth: '40ch' })}>
                            <span style={sx({ flex: 'none', width: '8px', height: '8px', borderRadius: '2px', background: '#C9F24E', marginTop: 'clamp(5px,0.4vw,7px)' })} />
                            <span>{p.hardPart}</span>
                          </p>
                        )}
                      </div>
                      <div onPointerDown={(e) => e.stopPropagation()} style={sx({ display: 'flex', alignItems: 'center', gap: 'clamp(10px,1vw,16px)', flexWrap: 'wrap' })}>
                        {link ? (
                          <a
                            href={link}
                            target="_blank"
                            rel="noopener"
                            style={sx({ display: 'inline-flex', alignItems: 'center', gap: '9px', background: '#2E5E43', color: '#F1F7F0', padding: 'clamp(12px,0.9vw,19px) clamp(24px,1.8vw,40px)', borderRadius: '14px', fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 'clamp(15px,1.1vw,22px)', whiteSpace: 'nowrap', boxShadow: '0 10px 22px -10px rgba(46,94,67,0.7)' })}
                          >
                            {p.ctaLabel || 'Open'} ↗
                          </a>
                        ) : (
                          <span style={sx({ display: 'inline-flex', alignItems: 'center', gap: '7px', fontFamily: 'var(--font-mono)', fontSize: 'clamp(11px,0.72vw,14px)', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#8B8977', background: '#F1EEE1', border: '1px solid #E4DFCF', padding: 'clamp(9px,0.75vw,13px) 15px', borderRadius: '12px', whiteSpace: 'nowrap' })}>
                            {p.href ? 'Live product' : 'Private preview'}
                          </span>
                        )}
                        <button
                          onClick={() => openProject(p.id)}
                          style={sx({ display: 'inline-flex', alignItems: 'center', gap: '7px', background: 'transparent', color: '#2E5E43', padding: 'clamp(11px,0.85vw,17px) clamp(18px,1.4vw,28px)', borderRadius: '14px', border: '1px solid #CBD8C2', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 'clamp(14px,1.05vw,20px)', whiteSpace: 'nowrap' })}
                        >
                          The story →
                        </button>
                      </div>
                    </div>

                    <div style={cardMediaColStyle}>
                      <div
                        onPointerDown={(e) => e.stopPropagation()}
                        style={sx({ flex: '1 1 auto', minHeight: 0, display: 'flex', position: 'relative', containerType: 'size' })}
                      >
                        <button
                          onClick={() => openLightbox(p.id, 0)}
                          aria-label={'Open ' + p.title + ' gallery'}
                          style={sx({ position: 'relative', width: 'min(100%, calc(100cqh * 16 / 9))', aspectRatio: '16 / 9', margin: 'auto', padding: 0, border: 'none', background: '#FFFFFF', borderRadius: '12px', boxShadow: '0 24px 48px -26px rgba(30,60,40,0.55)', overflow: 'hidden', cursor: 'zoom-in', display: 'block' })}
                        >
                          <PlaceholderShot label={p.screens[0]} i={0} />
                          <span aria-hidden="true" style={sx({ position: 'absolute', top: '10px', right: '10px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(32,33,27,0.55)', color: '#F1F7F0', fontSize: '15px', backdropFilter: 'blur(3px)' })}>⤢</span>
                        </button>
                      </div>
                      <div onPointerDown={(e) => e.stopPropagation()} style={sx({ flex: 'none', display: 'flex', gap: '8px', alignItems: 'center' })}>
                        {p.screens.map((label, ti) => (
                          <button
                            key={ti}
                            onClick={() => openLightbox(p.id, ti)}
                            aria-label={'View ' + label}
                            style={sx({ flex: 'none', width: 'clamp(46px,5vw,74px)', aspectRatio: '16 / 9', padding: 0, borderRadius: '8px', border: '1px solid #D8E0CE', background: '#FFFFFF', cursor: 'pointer', overflow: 'hidden' })}
                          >
                            <MiniShot i={ti} />
                          </button>
                        ))}
                        <span style={sx({ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 'clamp(9px,0.62vw,12px)', color: '#A7A492', whiteSpace: 'nowrap' })}>{p.screens.length} shots · tap to enlarge</span>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <button aria-label="Previous project" onClick={prev} onPointerDown={(e) => e.stopPropagation()} style={sx({ position: 'absolute', left: 'max(6px, calc(8.3vw - 72px))', top: '50%', transform: 'translateY(-50%)', zIndex: 6, width: '58px', height: '58px', borderRadius: '50%', border: '1px solid #E4DFCF', background: 'rgba(251,249,242,0.92)', backdropFilter: 'blur(6px)', boxShadow: '0 10px 22px -12px rgba(60,50,25,0.5)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', lineHeight: 1, color: '#2E5E43', paddingBottom: '3px' })}>&lsaquo;</button>
          <button aria-label="Next project" onClick={next} onPointerDown={(e) => e.stopPropagation()} style={sx({ position: 'absolute', right: 'max(6px, calc(8.3vw - 72px))', top: '50%', transform: 'translateY(-50%)', zIndex: 6, width: '58px', height: '58px', borderRadius: '50%', border: '1px solid #E4DFCF', background: 'rgba(251,249,242,0.92)', backdropFilter: 'blur(6px)', boxShadow: '0 10px 22px -12px rgba(60,50,25,0.5)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', lineHeight: 1, color: '#2E5E43', paddingBottom: '3px' })}>&rsaquo;</button>
        </div>

        {/* controls */}
        <div style={sx({ flex: 'none', display: 'flex', alignItems: 'center', gap: 'clamp(10px,1.5vw,20px)', padding: 'clamp(8px,1.2vh,14px) clamp(20px,5vw,60px) 0' })}>
          <button onClick={togglePlay} aria-label={playing ? 'Pause auto-advance' : 'Play auto-advance'} style={sx({ flex: 'none', width: '38px', height: '38px', borderRadius: '50%', border: '1px solid #E4DFCF', background: '#FBF9F2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' })}>
            {playing ? (
              <span style={sx({ display: 'flex', gap: '3.5px' })}>
                <span style={sx({ width: '3.5px', height: '13px', background: '#2E5E43', borderRadius: '1px' })} />
                <span style={sx({ width: '3.5px', height: '13px', background: '#2E5E43', borderRadius: '1px' })} />
              </span>
            ) : (
              <span style={sx({ width: 0, height: 0, borderLeft: '11px solid #2E5E43', borderTop: '6.5px solid transparent', borderBottom: '6.5px solid transparent', marginLeft: '2px' })} />
            )}
          </button>
          <div ref={progressRef} aria-label="Project position" style={sx({ flex: '1 1 auto', display: 'flex', alignItems: 'center', gap: '7px', maxWidth: '540px' })}>
            {projects.map((p, i) => (
              <button key={i} onClick={() => goTo(i)} aria-label={'Go to ' + p.title} style={sx({ flex: 1, height: '5px', borderRadius: '3px', background: '#E1DDCE', overflow: 'hidden', padding: 0, border: 'none', cursor: 'pointer', minWidth: '12px' })}>
                <span data-fill="1" style={sx({ display: 'block', height: '100%', width: '0%', background: '#3E7A5B', borderRadius: '3px' })} />
              </button>
            ))}
          </div>
          <span style={sx({ flex: 'none', fontFamily: 'var(--font-mono)', fontSize: '12px', letterSpacing: '0.06em', color: '#8B8977', whiteSpace: 'nowrap' })}>{pad(ri + 1) + ' / ' + pad(N)}</span>
        </div>
      </section>

      {/* ===== OVERLAYS ===== */}
      {overlay && (
        <div onClick={(e) => { if (e.target === e.currentTarget) closeOverlay(); }} style={sx({ position: 'fixed', inset: 0, zIndex: 100, background: 'var(--backdrop)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(14px,3vw,48px)', animation: 'fadeIn 0.22s ease' })}>
          {overlay === 'project' && (
            <ProjectOverlay
              p={modalProject}
              isMobile={isMobile}
              isUpwork={isUpwork}
              tab={tab}
              setTab={setTab}
              panelRef={panelRef}
              closeBtnRef={closeBtnRef}
              onClose={closeOverlay}
              onOpenLightbox={openLightbox}
            />
          )}
          {overlay === 'about' && (
            <AboutOverlay panelRef={panelRef} closeBtnRef={closeBtnRef} onClose={closeOverlay} primaryLabel={primaryLabel} />
          )}
        </div>
      )}

      {lightbox && (
        <Lightbox
          project={projects.find((p) => p.id === lightbox.id) || projects[0]}
          index={lightbox.i}
          onClose={closeLightbox}
          onStep={stepLightbox}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Overlays
// ---------------------------------------------------------------------------

function ProjectOverlay({
  p, isMobile, isUpwork, tab, setTab, panelRef, closeBtnRef, onClose, onOpenLightbox,
}: {
  p: Project;
  isMobile: boolean;
  isUpwork: boolean;
  tab: 'overview' | 'tech';
  setTab: (t: 'overview' | 'tech') => void;
  panelRef: preact.RefObject<HTMLDivElement>;
  closeBtnRef: preact.RefObject<HTMLButtonElement>;
  onClose: () => void;
  onOpenLightbox: (id: string, i: number) => void;
}) {
  const over = tab === 'overview';
  const link = productLink(p, isUpwork);
  const tabBtn = (on: boolean): JSX.CSSProperties => sx({ border: 'none', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: '14px', padding: '8px 15px', borderRadius: '9px', transition: 'all .2s ease', background: on ? '#FBF9F2' : 'transparent', color: on ? '#23241E' : '#8B8977', boxShadow: on ? '0 3px 8px -4px rgba(60,50,25,0.4)' : 'none' });

  const shellStyle = isMobile
    ? sx({ position: 'fixed', inset: 0, width: '100%', height: '100%', background: '#FBF9F2', overflow: 'auto', display: 'flex', flexDirection: 'column', animation: 'sheetUp 0.32s cubic-bezier(0.22,1,0.36,1)', WebkitOverflowScrolling: 'touch' })
    : sx({ width: 'min(80vw,1180px)', height: 'min(82vh,800px)', background: '#FBF9F2', borderRadius: '24px', boxShadow: '0 50px 100px -35px rgba(30,22,12,0.6)', overflow: 'hidden', position: 'relative', display: 'flex', flexWrap: 'nowrap', animation: 'panelIn 0.34s cubic-bezier(0.22,1,0.36,1)' });
  const galleryStyle = isMobile
    ? sx({ flex: 'none', height: '44dvh', minHeight: '250px', background: '#E8EEE1', overflow: 'auto', display: 'flex', flexDirection: 'row', gap: '12px', padding: '16px', scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' })
    : sx({ flex: '1.15 1 380px', minWidth: '340px', minHeight: 0, background: '#E8EEE1', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', padding: 'clamp(22px,2.4vw,38px)' });
  const galleryItem = isMobile
    ? sx({ flex: 'none', width: '84%', height: '100%', scrollSnapAlign: 'center', background: '#FFFFFF', borderRadius: '16px', boxShadow: '0 22px 46px -30px rgba(30,60,40,0.5)', overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column' })
    : sx({ flex: 'none', width: '100%', minHeight: 'clamp(210px,30vh,320px)', background: '#FFFFFF', borderRadius: '18px', boxShadow: '0 26px 50px -32px rgba(30,60,40,0.5)', overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column' });
  const detailStyle = isMobile
    ? sx({ flex: '1 0 auto', padding: '22px 20px calc(22px + env(safe-area-inset-bottom))', display: 'flex', flexDirection: 'column' })
    : sx({ flex: '1 1 340px', minWidth: '290px', minHeight: 0, padding: 'clamp(22px,2.4vw,42px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' });

  return (
    <div ref={panelRef} role="dialog" aria-modal="true" aria-label={p.title} class={isMobile ? 'scroll-slim' : undefined} style={shellStyle}>
      {isMobile ? (
        <button ref={closeBtnRef} onClick={onClose} aria-label="Back" style={sx({ position: 'absolute', top: '14px', left: '14px', zIndex: 9, display: 'inline-flex', alignItems: 'center', gap: '6px', height: '40px', padding: '0 15px 0 11px', borderRadius: '20px', border: 'none', background: 'rgba(251,249,242,0.92)', backdropFilter: 'blur(8px)', boxShadow: '0 6px 16px -8px rgba(30,22,12,0.4)', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: '14.5px', color: '#2E5E43' })}>
          <span style={sx({ fontSize: '19px', lineHeight: 1, marginTop: '-1px' })}>&lsaquo;</span>Back
        </button>
      ) : (
        <button ref={closeBtnRef} onClick={onClose} aria-label="Close" style={sx({ position: 'absolute', top: '15px', right: '15px', zIndex: 9, width: '38px', height: '38px', borderRadius: '50%', border: '1px solid #E4DFCF', background: 'rgba(251,249,242,0.9)', backdropFilter: 'blur(6px)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '17px', color: '#57584A' })}>&#10005;</button>
      )}

      <div class="scroll-slim" style={galleryStyle}>
        {p.screens.map((label, i) => (
          <button key={i} onClick={() => onOpenLightbox(p.id, i)} aria-label={'Enlarge ' + label} style={{ ...galleryItem, cursor: 'zoom-in', border: 'none', padding: 0 }}>
            <PlaceholderShot label={label} i={i} />
          </button>
        ))}
      </div>

      <div style={detailStyle}>
        <div style={sx({ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '14px', flexWrap: 'wrap' })}>
          <span style={sx({ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.07em', textTransform: 'uppercase', color: '#2E5E43', background: '#E4EFE3', padding: '4px 9px', borderRadius: '7px' })}>{p.category}</span>
          <span style={sx({ display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-mono)', fontSize: '11.5px', color: '#57584A' })}><span style={dot(p)} />{p.status}</span>
        </div>
        <h2 style={sx({ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(30px,3vw,44px)', lineHeight: 1, letterSpacing: '-0.03em', margin: '0 0 10px', color: '#20211B' })}>{p.title}</h2>
        <p style={sx({ fontFamily: 'var(--font-ui)', fontSize: 'clamp(16px,1.4vw,19px)', lineHeight: 1.4, color: '#57584A', margin: '0 0 22px' })}>{p.tagline}</p>

        <div style={sx({ display: 'flex', gap: '4px', padding: '4px', background: '#EFEADE', border: '1px solid #E4DFCF', borderRadius: '12px', width: 'fit-content', marginBottom: '18px' })}>
          <button onClick={() => setTab('overview')} style={tabBtn(over)}>The idea</button>
          <button onClick={() => setTab('tech')} style={tabBtn(!over)}>Under the hood</button>
        </div>

        {over ? (
          <>
            <p style={sx({ fontFamily: 'var(--font-ui)', fontSize: '16px', lineHeight: 1.6, color: '#3C3D34', margin: '0 0 16px' })}>{p.overview}</p>
            <div style={sx({ display: 'flex', flexDirection: 'column', gap: '9px', marginBottom: '20px' })}>
              {p.features.map((f, i) => (
                <div key={i} style={sx({ display: 'flex', gap: '10px', alignItems: 'flex-start' })}>
                  <span style={sx({ flex: 'none', width: '8px', height: '8px', borderRadius: '2px', background: '#C9F24E', marginTop: '7px' })} />
                  <span style={sx({ fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: '14.5px', lineHeight: 1.4, color: '#2E4A3A' })}>{f}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <p style={sx({ fontFamily: 'var(--font-ui)', fontSize: '16px', lineHeight: 1.6, color: '#3C3D34', margin: '0 0 18px' })}>{p.tech}</p>
            <div style={sx({ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' })}>
              {p.stack.map((t, i) => (
                <span key={i} style={sx({ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#2E5E43', background: '#E9F1E6', border: '1px solid #D8E6CE', padding: '5px 10px', borderRadius: '8px' })}>{t}</span>
              ))}
            </div>
          </>
        )}

        <div style={sx({ display: 'flex', flexWrap: 'wrap', gap: '22px', padding: '16px 0', borderTop: '1px solid #EBE5D5', marginTop: 'auto' })}>
          <div>
            <div style={sx({ fontFamily: 'var(--font-mono)', fontSize: '10.5px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9A9784', marginBottom: '4px' })}>Role</div>
            <div style={sx({ fontFamily: 'var(--font-ui)', fontSize: '14.5px', fontWeight: 600, color: '#3C3D34' })}>{p.role}</div>
          </div>
          <div>
            <div style={sx({ fontFamily: 'var(--font-mono)', fontSize: '10.5px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9A9784', marginBottom: '4px' })}>Period</div>
            <div style={sx({ fontFamily: 'var(--font-ui)', fontSize: '14.5px', fontWeight: 600, color: '#3C3D34' })}>{p.period}</div>
          </div>
        </div>
        {link ? (
          <a href={link} target="_blank" rel="noopener" style={sx({ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#2E5E43', color: '#F1F7F0', padding: '13px 20px', borderRadius: '12px', fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: '15px', boxShadow: '0 10px 22px -10px rgba(46,94,67,0.7)', marginTop: '6px' })}>
            {p.ctaLabel || 'Visit'} ↗
          </a>
        ) : (
          <div style={sx({ fontFamily: 'var(--font-ui)', fontSize: '14px', color: '#8B8977', background: '#F3F0E6', border: '1px solid #E4DFCF', borderRadius: '12px', padding: '13px 16px', marginTop: '6px', lineHeight: 1.45 })}>
            {p.href ? 'Shown as visual proof on this surface.' : 'Private preview, not publicly linked yet.'}
          </div>
        )}
      </div>
    </div>
  );
}

function AboutOverlay({
  panelRef, closeBtnRef, onClose, primaryLabel,
}: {
  panelRef: preact.RefObject<HTMLDivElement>;
  closeBtnRef: preact.RefObject<HTMLButtonElement>;
  onClose: () => void;
  primaryLabel: string;
}) {
  return (
    <div ref={panelRef} role="dialog" aria-modal="true" aria-label="About" style={sx({ width: 'min(520px,92vw)', maxHeight: '88vh', overflow: 'auto', background: '#FBF9F2', borderRadius: '24px', boxShadow: '0 50px 100px -35px rgba(30,22,12,0.6)', position: 'relative', padding: 'clamp(26px,3vw,46px)', animation: 'panelIn 0.34s cubic-bezier(0.22,1,0.36,1)' })}>
      <button ref={closeBtnRef} onClick={onClose} aria-label="Close" style={sx({ position: 'absolute', top: '15px', right: '15px', width: '38px', height: '38px', borderRadius: '50%', border: '1px solid #E4DFCF', background: '#FBF9F2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '17px', color: '#57584A' })}>&#10005;</button>
      <div style={sx({ fontFamily: 'var(--font-mono)', fontSize: '12px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#3E7A5B', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' })}>
        <span style={sx({ width: '18px', height: '2px', background: '#C9F24E', display: 'inline-block' })} />About
      </div>
      <h2 style={sx({ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(28px,3vw,38px)', letterSpacing: '-0.03em', margin: '0 0 16px', color: '#20211B' })}>Hi, I&rsquo;m Jithu.</h2>
      <p style={sx({ fontFamily: 'var(--font-ui)', fontSize: '17px', lineHeight: 1.6, color: '#3C3D34', margin: '0 0 16px' })}>I build software, systems, and experiments around ideas that genuinely excite me, from local-first personal tools to real-time multiplayer games and AI-moderated chat.</p>
      <p style={sx({ fontFamily: 'var(--font-ui)', fontSize: '17px', lineHeight: 1.6, color: '#57584A', margin: '0 0 24px' })}>This site is a small, honest map of that work. If something here fits what you&rsquo;re building, the best next step is a message on Upwork.</p>
      <a href={UPWORK_URL} target="_blank" rel="noopener" style={sx({ display: 'inline-flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: '15px', color: '#F1F7F0', background: '#2E5E43', padding: '12px 18px', borderRadius: '12px', boxShadow: '0 10px 22px -10px rgba(46,94,67,0.7)' })}>
        <span style={sx({ width: '11px', height: '11px', borderRadius: '50%', background: '#C9F24E' })} />{primaryLabel} ↗
      </a>
    </div>
  );
}
