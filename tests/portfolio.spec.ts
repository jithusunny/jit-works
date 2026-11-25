import { expect, test } from '@playwright/test';

const sizes = [[1920,1080], [1440,900], [834,1194], [1194,834], [390,844], [844,390], [320,740], [700,900], [2560,1440]];

for (const [width,height] of sizes) {
  test(`${width}×${height}: responsive page, scoped gallery and local feedback`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setViewportSize({ width, height });
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('#work .project-panel')).toHaveCount(4);
    await expect(page.locator('.more-grid article')).toHaveCount(3);
    await expect(page.locator('main#top > .hero h1')).toHaveCount(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const centres = await page.locator('.capability-groups article').evaluateAll(elements => elements.map(element => {
      const rect = element.getBoundingClientRect();
      return ['.capability-heading', 'ul'].map(selector => {
        const child = element.querySelector(selector)!.getBoundingClientRect();
        return Math.abs(child.x + child.width / 2 - rect.x - rect.width / 2);
      });
    }));
    expect(centres.flat().every(offset => offset < 1)).toBe(true);
    const contactCentres = await page.locator('.contact').evaluate(element => {
      const rect = element.getBoundingClientRect();
      return [...element.querySelectorAll('h2,.contact-actions>p,.button,.text-link')].map(child => {
        const r = child.getBoundingClientRect();
        return Math.abs(r.x + r.width / 2 - rect.x - rect.width / 2);
      });
    });
    expect(contactCentres.every(offset => offset < 1)).toBe(true);
    if (width <= 700) {
      expect(await page.locator('.site-header').evaluate(e => e.getBoundingClientRect().height)).toBeLessThanOrEqual(120);
      const navSizes = await page.locator('.site-header nav a').evaluateAll(elements => elements.map(e => ({ font: parseFloat(getComputedStyle(e).fontSize), height: e.getBoundingClientRect().height })));
      expect(navSizes.every(n => n.font <= 14 && n.height >= 44)).toBe(true);
    }
    const gallery = page.locator('#mridhu .inspect-image');
    await gallery.first().click();
    const dialog = page.locator('#media-dialog');
    await expect(dialog).toBeVisible();
    await expect(page.locator('#dialog-content img')).toHaveAttribute('src', /mridhu-rich.webp$/);
    await page.locator('#dialog-content img').evaluate(async image => { await (image as HTMLImageElement).decode(); });
    expect(await page.locator('#dialog-content img').evaluate(image => (image as HTMLImageElement).naturalWidth)).toBeGreaterThanOrEqual(4000);
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('#dialog-content img')).toHaveAttribute('src', /mridhu-product.webp$/);
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('#dialog-content img')).toHaveAttribute('src', /mridhu-rich.webp$/);
    await page.keyboard.press('Escape');
    await expect(gallery.first()).toBeFocused();
    await expect(dialog).toBeHidden();
    // Rapid reopen must not allow the queued old close event to clear new content.
    await gallery.first().click();
    await page.evaluate(() => {
      (document.querySelector('#media-dialog') as HTMLDialogElement).close();
      (document.querySelector('#mridhu .inspect-image') as HTMLElement).click();
    });
    await expect(page.locator('#dialog-content img')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('.feedback-row')).toHaveCount(2);
    await page.locator('.pickup-target').click();
    await page.locator('#feedback-text').fill('Please make this note smaller.');
    await page.locator('#feedback-text').press('Enter');
    await expect(page.locator('.feedback-row')).toHaveCount(3);
    await expect(page.locator('.feedback-composer')).toBeHidden();
    await page.locator('.feedback-submit').click();
    await expect(page.locator('.feedback-status')).toHaveText('Preview only. No feedback was sent.');
    await expect(page.locator('.contact .button')).toHaveAttribute('href', 'https://wa.me/919632323154');
    expect(errors).toEqual([]);
  });
}

for (const [width,height] of [[390,844], [844,390], [1194,834], [320,740]]) {
  test(`${width}×${height}: embedded menu navigation, page entry and fullscreen`, async ({ page }) => {
    await page.setViewportSize({ width,height });
    await page.goto('/');
    await page.locator('.tonico-book').scrollIntoViewIfNeeded();
    const menu = page.frameLocator('.tonico-book');
    await expect(menu.locator('body')).toHaveClass(/ready/);
    const count = menu.locator('#pageCount');
    const initial = width > height ? '4–5/16' : '1/16';
    await expect(count).toHaveText(initial);
    const bounds = await menu.locator('#prev,#next,#count,#zoomBtn,#fullscreenBtn').evaluateAll(elements => elements.map(e => {
      const r = e.getBoundingClientRect();
      return r.x >= 0 && r.y >= 0 && r.right <= innerWidth + 1 && r.bottom <= innerHeight + 1;
    }));
    expect(bounds.every(Boolean)).toBe(true);
    await menu.locator('#next').click();
    await expect(count).not.toHaveText(initial);
    await menu.locator('#prev').click();
    await expect(count).toHaveText(initial);
    await menu.locator('#count').click();
    await menu.locator('#jumpTo').fill('16');
    await menu.locator('#jumpTo').press('Enter');
    await expect(count).toHaveText('16/16');
    await menu.locator('#next').click();
    await expect(count).toHaveText('1/16');
    await menu.locator('#zoomBtn').click();
    await expect(menu.locator('#zoom')).toBeVisible();
    await menu.locator('#zClose').click();
    await expect(menu.locator('#zoom')).toBeHidden();
    await menu.locator('#fullscreenBtn').click();
    await expect(menu.locator('#fullscreenBtn')).toHaveAttribute('aria-label', 'Exit full screen');
    await menu.locator('#fullscreenBtn').click();
    await expect(menu.locator('#fullscreenBtn')).toHaveAttribute('aria-label', 'Full screen');
  });
}

test('LifeSuite tabs and hero gallery retain their own originals', async ({ page }) => {
  await page.goto('/');
  const hero = page.locator('.product-collage .inspect-image');
  await hero.first().click();
  const sources = new Set<string>();
  for (let i = 0; i < 3; i++) {
    sources.add((await page.locator('#dialog-content img').getAttribute('src'))!);
    await page.keyboard.press('ArrowRight');
  }
  expect(sources.size).toBe(3);
  await page.keyboard.press('Escape');
  for (const key of ['people','places','shopping','pulse']) {
    await page.locator(`[data-life="${key}"]`).click();
    await expect(page.locator('#life-feature')).toHaveAttribute('data-feature', key);
    await page.locator('.life-tablet-image').click();
    await expect(page.locator('#dialog-content img')).toHaveAttribute('src', new RegExp(`life-${key}-tablet.webp$`));
    await page.keyboard.press('Escape');
  }
});

test('Project plan decisions stay local and accessible', async ({ page }) => {
  await page.goto('/');
  await page.locator('.board-device iframe').scrollIntoViewIfNeeded();
  const board = page.frameLocator('.board-device iframe');
  await board.locator('#review-decision').click();
  await expect(board.locator('dialog')).toBeVisible();
  await board.locator('#approve').click();
  await expect(board.locator('.local-result')).toHaveText('Choice previewed. Nothing was sent.');
  await board.locator('#request-change').click();
  await expect(board.locator('textarea')).toBeFocused();
  await board.locator('textarea').fill('Add health expenses.');
  await board.locator('#preview-change').click();
  await expect(board.locator('.local-result')).toHaveText('Request previewed. Nothing was sent.');
});

test('content and contact remain readable without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width:390,height:844 } });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4322/');
  await expect(page.locator('main#top > .hero h1')).toBeVisible();
  await expect(page.locator('#mridhu-title')).toBeVisible();
  await expect(page.locator('.contact .button')).toHaveAttribute('href', 'https://wa.me/919632323154');
  await context.close();
});

test('offscreen samples do not compete with the first screen', async ({ page }) => {
  const demoRequests: string[] = [];
  page.on('request', request => { if (request.url().includes('/demos/')) demoRequests.push(request.url()); });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('.product-collage')).toHaveAttribute('data-running', 'false');
  expect(await page.locator('.collage-shop').evaluate(e => getComputedStyle(e).animationName)).toBe('none');
  expect(demoRequests).toEqual([]);
  await page.locator('.tonico-book').scrollIntoViewIfNeeded();
  await expect(page.frameLocator('.tonico-book').locator('#pageCount')).toHaveText('1/16');
  expect(demoRequests.some(url => url.includes('/menu/'))).toBe(true);
});
