import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  field,
  issueRef,
  matchingItems,
  mergeWorkConfig,
  normalizeRestItem,
  planRows,
  sameTitle,
  scopeProductItems,
  slug,
} from './work-lib.mjs';

const items = [
  { title: 'Create the public portfolio shell', product: 'jit.works', status: 'Ready', maturity: 'Stable', area: 'Product', priority: 'P0', type: 'Slice', url: 'https://github.com/o/r/issues/1' },
  { title: 'Public launch', product: 'Town', status: 'Deferred', maturity: 'Growth', area: 'Release', priority: 'P2', type: 'Epic', url: 'https://github.com/o/r/issues/2' },
];

test('reads normalized Project fields', () => {
  assert.equal(field(items[0], 'Status'), 'Ready');
});

test('keeps local Project values outside the tracked work config', () => {
  const publicConfig = JSON.parse(readFileSync(new URL('../.work/config.json', import.meta.url), 'utf8'));
  for (const key of ['owner', 'ownerType', 'project', 'fieldIds']) {
    assert.equal(Object.hasOwn(publicConfig, key), false, `${key} must stay local`);
  }
  assert.deepEqual(
    mergeWorkConfig(publicConfig, {
      owner: 'contributor',
      project: '42',
      fieldIds: { Status: 100 },
    }),
    {
      ...publicConfig,
      owner: 'contributor',
      ownerType: 'user',
      project: '42',
      fieldIds: { Status: 100 },
    },
  );
});

test('rejects owner Project values in tracked defaults and incomplete local setup', () => {
  const publicConfig = { productRepo: 'jit-works', productName: 'jit.works' };
  assert.throws(
    () => mergeWorkConfig({ ...publicConfig, project: '1' }, { owner: 'o', project: '2', fieldIds: { Status: 3 } }),
    /tracked work config contains local connection keys: project/,
  );
  assert.throws(() => mergeWorkConfig(publicConfig, {}), /local work config is missing owner/);
  assert.throws(
    () => mergeWorkConfig(publicConfig, { owner: 'o', project: '2' }),
    /local work config is missing fieldIds/,
  );
});

test('normalizes REST Project items and single-select fields', () => {
  const item = normalizeRestItem({
    id: 17,
    node_id: 'PVTI_17',
    content_type: 'Issue',
    content: {
      title: 'A slice', body: 'Goal', number: 4,
      html_url: 'https://github.com/o/r/issues/4',
      created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-02T00:00:00Z',
      repository: { full_name: 'o/r' },
    },
    fields: [{ name: 'Status', value: { name: { raw: 'Ready' } } }],
  });
  assert.equal(item.restId, 17);
  assert.equal(item.status, 'Ready');
  assert.equal(item.content.repository, 'o/r');
});

test('parses only full GitHub issue URLs', () => {
  assert.deepEqual(issueRef('https://github.com/o/r/issues/12'), { owner: 'o', repo: 'r', number: 12, url: 'https://github.com/o/r/issues/12' });
  assert.throws(() => issueRef('#12'), /full GitHub issue URL/);
});

test('search includes exact and cautious fuzzy matches', () => {
  assert.equal(matchingItems(items, 'portfolio').length, 1);
  assert.equal(matchingItems(items, 'create shell', { fuzzy: true }).length, 1);
  assert.equal(matchingItems(items, 'unrelated words', { fuzzy: true }).length, 0);
});

test('exact issue titles compare case-insensitively without fuzzy matching', () => {
  assert.equal(sameTitle('Release CI', 'release ci'), true);
  assert.equal(sameTitle('Release CI', 'Release CI follow-up'), false);
});

test('plan filters by maturity and area and hides inactive work', () => {
  assert.equal(planRows(items).length, 1);
  assert.equal(planRows(items, { maturity: 'growth', includeInactive: true })[0].title, 'Public launch');
  assert.equal(planRows(items, { area: 'product' })[0].title, 'Create the public portfolio shell');
  assert.equal(planRows(items, { product: 'town', includeInactive: true })[0].title, 'Public launch');
});

test('product scope excludes other repositories carrying the same Product value', () => {
  const mixed = [
    { product: 'jit.works', content: { repository: 'jithusunny/jit-works' }, title: 'Public slice' },
    { product: 'jit.works', content: { repository: 'owner/another-repo' }, title: 'Other repository' },
    { product: 'Town', content: { repository: 'jithusunny/jit-works' }, title: 'Wrong product' },
  ];
  assert.deepEqual(
    scopeProductItems(mixed, { repository: 'jithusunny/jit-works', product: 'jit.works' }).map((item) => item.title),
    ['Public slice'],
  );
});

test('creates stable safe slugs', () => {
  assert.equal(slug('A Huge Plan!.md'), 'a-huge-plan-md');
});

test('labels readiness as product-local instead of global priority', () => {
  const source = readFileSync(new URL('./work.mjs', import.meta.url), 'utf8');
  assert.match(source, /Ready here:/);
  assert.doesNotMatch(source, /console\.log\(`Next:/);
  assert.match(source, /Show this product's active work, Ready options/);
});
