const { test, expect } = require('@playwright/test');

// Synthetic reports exercise the UI without relying on current headlines or publishers.
const items = [
  { title: 'Community helps neighbours after flooding', publisher: 'QA fixture', date: '2026-11-06', section: 'UK', url: 'https://example.com/flood' },
  { title: 'ACN report documents Christian persecution', publisher: 'QA fixture', date: '2026-11-06', section: 'Christian world', url: 'https://example.com/church' }
];
test.beforeEach(async ({ page }) => {
  // Keep the featured work and its Scripture link stable as the calendar advances.
  await page.clock.setFixedTime(new Date('2026-11-06T12:00:00Z'));
  const failures = [];
  page.on('pageerror', e => failures.push(e.message));
  page.on('console', m => { if (m.type() === 'error') failures.push(m.text()); });
  page.on('response', r => {
    if (r.status() >= 400 && new URL(r.url()).origin === new URL(page.url()).origin) failures.push(`${r.status()} ${r.url()}`);
  });
  page.on('requestfailed', r => {
    // A new navigation can legitimately cancel an image still loading on the old page.
    if (r.failure()?.errorText !== 'net::ERR_ABORTED') failures.push(`${r.url()} ${r.failure()?.errorText}`);
  });
  page.__failures = failures;
  await page.route('**/content/news.json', route => route.fulfill({ json: { updated: '2026-11-06T12:00:00Z', items } }));
  await page.route('**/content/editorial.json', route => route.fulfill({ json: { reviewedStories: [] } }));
});
test.afterEach(async ({ page }) => { expect(page.__failures).toEqual([]); });

async function ready(page, path = './') {
  await page.goto(path);
  await expect(page.locator('body')).toHaveAttribute('data-ready', 'true');
}
async function noOverflow(page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}
async function nearTop(locator) {
  await expect.poll(async () => Math.round((await locator.boundingBox()).y)).toBeGreaterThanOrEqual(0);
  await expect.poll(async () => Math.round((await locator.boundingBox()).y)).toBeLessThan(50);
}

test('section hierarchy, search needs, references and favourites', async ({ page }) => {
  await ready(page);
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href', 'assets/favicon.svg');
  expect((await page.request.get('assets/favicon.svg')).ok()).toBe(true);
  await expect(page.locator('main > section h2')).toHaveCount(2);
  await ready(page, './scripture.html');
  await expect(page.locator('#library-count')).toHaveText('31,102 verses found');
  const search = page.getByRole('textbox', { name: 'Search Scripture by feeling, need, words or Bible reference' });
  for (const [query, reference] of [
    ['I feel anxious', 'Philippians 4:6'], ['I am grieving', 'Matthew 5:4'],
    ['I need strength', 'Isaiah 40:29'], ['I need confidence', 'Joshua 1:9']
  ]) {
    await search.fill(query);
    await expect(page.locator('#search-help')).toContainText('Suggested Scripture');
    await expect(page.locator('#results .meta').first()).toHaveText(reference + ' · KJV');
  }
  await search.fill('John 3:16');
  await expect(page.locator('#results .newsitem')).toHaveCount(1);
  await expect(page.locator('#results')).toContainText('For God so loved the world');
  await expect(page.locator('#results a')).toHaveAttribute('href', /esv.org\/John%2B3%3A16/);
  await page.locator('#results [data-save]').click();
  await page.locator('#favorites').click();
  await expect(page.locator('#results')).toContainText('John 3:16');
  await page.reload();
  await expect(page.locator('body')).toHaveAttribute('data-ready', 'true');
  await search.fill('John 3:16');
  await expect(page.locator('#results [data-save]')).toHaveText('♥ Saved');
  await search.fill('uncommonliteralxyz');
  await expect(page.locator('#results')).toContainText('No verses found');
  await noOverflow(page);
});

test('headline offers one biblical interpretation and scrolls into view', async ({ page }) => {
  await ready(page, './news.html');
  await expect(page.locator('#peace')).toHaveCount(0);
  await expect(page.locator('#action')).toHaveCount(0);
  await page.locator('#headlines [data-story]').first().click();
  const guidance = page.locator('#guidance');
  await expect(guidance).toBeFocused();
  await expect(guidance).toContainText(items[0].title);
  await expect(guidance.locator('blockquote')).not.toBeEmpty();
  await nearTop(guidance);
  await expect(guidance).not.toContainText('not yet been prepared');
  await guidance.getByRole('link', { name: '← Back to reports' }).click();
  await expect(page.locator('#latest-headlines')).toBeInViewport();
  await ready(page, './church.html');
  await page.locator('#church-news [data-story]').first().click();
  await expect(guidance).toContainText(items[1].title);
  await expect(guidance.getByRole('link', { name: '← Back to reports' })).toHaveAttribute('href', '#church-news');
  await noOverflow(page);
});

test('incoming passage remains in view after delayed news and journal loading', async ({ page }) => {
  await page.route('**/content/posts.json', async route => {
    // Wait for the browser to reach the early fragment destination, then release content above it.
    await page.waitForFunction(() => document.querySelector('#search')?.value === 'Luke 18:35–43');
    await route.fulfill({ json: [{ title: 'A journal fixture', author: 'QA', date: '2026-11-06', body: ['A short reflection.'] }] });
  });
  await ready(page, './index.html?scripture=Luke%2018%3A35%E2%80%9343#library');
  await expect(page.locator('#results .newsitem')).toHaveCount(9);
  await nearTop(page.locator('#library'));
  await noOverflow(page);
});

test('navigation, journal, artwork credits and persistent dark mode', async ({ page }, testInfo) => {
  await ready(page);
  await page.getByRole('navigation').getByRole('link', { name: 'Journal', exact: true }).click();
  await page.locator('[data-post]').first().click();
  await expect(page.locator('#post-0')).toBeVisible();
  await page.locator('#theme').click();
  await expect(page.locator('#theme')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('body')).toHaveClass('dark');
  await page.getByRole('navigation').getByRole('link', { name: 'Christian Art', exact: true }).click();
  await expect(page.locator('#art-count')).toContainText('218 works found · 12 shown');
  await expect(page.locator('body')).toHaveClass('dark');
  await page.locator('#daily-image').scrollIntoViewIfNeeded();
  await expect.poll(() => page.locator('#daily-image').evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
  await page.getByRole('button', { name: 'Enlarge & explore', exact: true }).click();
  await expect(page.locator('#work-dialog')).toBeVisible();
  await expect(page.locator('#work-text')).toContainText('Collection & image credit');
  await expect(page.locator('#work-text a', { hasText: 'Image reuse terms' })).toHaveAttribute('href', /^https:\/\//);
  await page.locator('#close-work').click();
  await page.locator('#more-art').click();
  await expect(page.locator('#art-count')).toContainText('24 shown');
  await page.locator('#art-search').fill('uncommonliteralxyz');
  await expect(page.locator('#no-art')).toBeVisible();
  await page.locator('#clear-art').click();
  await expect(page.locator('#art-count')).toContainText('12 shown');
  await page.getByRole('button', { name: "Previous day's artwork" }).click();
  await expect(page.locator('#next-day')).toBeEnabled();
  await page.locator('#back-today').click();
  await expect(page.locator('#next-day')).toBeDisabled();
  await noOverflow(page);
  await page.screenshot({ path: testInfo.outputPath('art-dark.png') });
  await page.locator('#daily-copy').getByRole('link', { name: /in Scripture/ }).click();
  await expect(page.locator('body')).toHaveAttribute('data-ready', 'true');
  await expect(page.locator('#search-help')).toContainText('Showing the passage');
  await nearTop(page.locator('#library'));
  await page.getByRole('navigation').getByRole('link', { name: "Today's Verse", exact: true }).click();
  await page.getByRole('link', { name: 'Full credit ↗', exact: true }).first().click();
  await expect(page.locator('body')).toContainText('CC0');
});
