// Site-wide configuration shared by both routes.

/**
 * The single contact channel for v1 (Upwork-first). Both the main page and the
 * permanent /upwork surface route their primary action here. A later, separately
 * reviewed change may give the main page a direct destination — it must not touch
 * the Upwork-safe surface. See issue #3.
 */
export const UPWORK_URL = 'https://www.upwork.com/freelancers/jithusunny';

/** Carousel autoplay interval in seconds (handoff default 6.5, tweakable 3–12). */
export const AUTOPLAY_SECONDS = 6.5;

/** Hero photo opacity (handoff default 0.9 mobile / 0.96 desktop, range 0.3–1). */
export const PHOTO_OPACITY_DESKTOP = 0.96;
export const PHOTO_OPACITY_MOBILE = 0.9;

export type ShowcaseVariant = 'main' | 'upwork';
