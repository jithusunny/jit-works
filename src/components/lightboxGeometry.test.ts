import assert from 'node:assert/strict';
import test from 'node:test';
import {
  clampPan,
  panBounds,
  stepZoom,
  wheelZoom,
  zoomAroundPoint,
} from './lightboxGeometry.ts';

test('visible controls provide several zoom steps and return to fit', () => {
  assert.equal(stepZoom(1, 1), 1.5);
  assert.equal(stepZoom(1.5, 1), 2);
  assert.equal(stepZoom(2, 1), 3);
  assert.equal(stepZoom(4, 1), 4);
  assert.equal(stepZoom(3, -1), 2);
  assert.equal(stepZoom(1, -1), 1);
});

test('wheel zoom uses smaller increments within the supported range', () => {
  assert.equal(wheelZoom(1, -10), 1.25);
  assert.equal(wheelZoom(1.25, -10), 1.5);
  assert.equal(wheelZoom(1, 10), 1);
  assert.equal(wheelZoom(4, -10), 4);
});

test('pan bounds expose every overflowing edge without losing the image', () => {
  assert.deepEqual(
    panBounds({ width: 360, height: 600 }, { width: 360, height: 255 }, 2),
    { x: 180, y: 0 },
  );
  assert.deepEqual(
    clampPan(
      { x: 500, y: -500 },
      { width: 360, height: 600 },
      { width: 360, height: 500 },
      2,
    ),
    { x: 180, y: -200 },
  );
});

test('zooming around the pointer keeps that image point stationary', () => {
  assert.deepEqual(
    zoomAroundPoint({
      point: { x: 270, y: 300 },
      viewport: { width: 360, height: 600 },
      media: { width: 360, height: 255 },
      pan: { x: 0, y: 0 },
      fromZoom: 1,
      toZoom: 2,
    }),
    { x: -90, y: 0 },
  );
});
