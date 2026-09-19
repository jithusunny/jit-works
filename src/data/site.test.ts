import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { EMAIL_URL, WHATSAPP_URL } from './site.ts';

test('direct contact destinations use canonical app links', () => {
  assert.equal(WHATSAPP_URL, 'https://wa.me/919632323154');
  assert.equal(EMAIL_URL, 'mailto:jithusunnyk@gmail.com');
});

test('the retired contact route redirects permanently to the portfolio', async () => {
  const redirects = await readFile(new URL('../../public/_redirects', import.meta.url), 'utf8');
  assert.deepEqual(
    redirects.trim().split('\n'),
    ['/upwork / 301', '/upwork/ / 301'],
  );
});
