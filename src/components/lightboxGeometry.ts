export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export const MIN_ZOOM = 1;
export const MAX_ZOOM = 4;
export const ZOOM_LEVELS = [1, 1.5, 2, 3, 4] as const;

export function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

export function stepZoom(current: number, direction: -1 | 1): number {
  if (direction > 0) {
    return ZOOM_LEVELS.find((level) => level > current + 0.001) ?? MAX_ZOOM;
  }
  return [...ZOOM_LEVELS].reverse().find((level) => level < current - 0.001) ?? MIN_ZOOM;
}

export function wheelZoom(current: number, deltaY: number): number {
  const direction = deltaY < 0 ? 1 : -1;
  return clamp(Math.round((current + direction * 0.25) * 4) / 4, MIN_ZOOM, MAX_ZOOM);
}

export function panBounds(viewport: Size, media: Size, zoom: number): Point {
  return {
    x: Math.max(0, (media.width * zoom - viewport.width) / 2),
    y: Math.max(0, (media.height * zoom - viewport.height) / 2),
  };
}

export function clampPan(pan: Point, viewport: Size, media: Size, zoom: number): Point {
  const bounds = panBounds(viewport, media, zoom);
  return {
    x: clamp(pan.x, -bounds.x, bounds.x),
    y: clamp(pan.y, -bounds.y, bounds.y),
  };
}

export function zoomAroundPoint({
  point,
  viewport,
  media,
  pan,
  fromZoom,
  toZoom,
}: {
  point: Point;
  viewport: Size;
  media: Size;
  pan: Point;
  fromZoom: number;
  toZoom: number;
}): Point {
  const centre = { x: viewport.width / 2, y: viewport.height / 2 };
  const mediaPoint = {
    x: (point.x - centre.x - pan.x) / fromZoom,
    y: (point.y - centre.y - pan.y) / fromZoom,
  };
  return clampPan(
    {
      x: point.x - centre.x - mediaPoint.x * toZoom,
      y: point.y - centre.y - mediaPoint.y * toZoom,
    },
    viewport,
    media,
    toZoom,
  );
}
