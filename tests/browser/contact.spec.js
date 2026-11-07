const { test, expect } = require('@playwright/test');

const endpoint = 'https://formspree.io/f/mwlljnow';
const footerLabel = 'Contact us or a member of clergy';

test('each site page links to contact and the page fits the viewport', async ({ page }) => {
  for (const path of [
    'index.html', 'news.html', 'church.html', 'journal.html', 'scripture.html',
    'quizzes.html', 'art.html', 'artwork-credits.html'
  ]) {
    await page.goto(path, { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('contentinfo').getByRole('link', { name: footerLabel }))
      .toHaveAttribute('href', 'contact.html');
  }
  await page.getByRole('link', { name: footerLabel }).click();
  await expect(page.getByRole('heading', { name: 'Contact Daily Bread' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    page.viewportSize().width
  );
  await page.getByRole('button', { name: 'Toggle dark mode' }).click();
  await expect(page.locator('body')).toHaveClass('dark');
});

test('a prayer request can be retried after a service error', async ({ page }) => {
  const requests = [];
  await page.route(endpoint, async route => {
    requests.push(route.request());
    if (requests.length === 1) {
      await route.fulfill({ status: 503, json: { errors: [{ message: 'Unavailable' }] } });
    } else {
      await route.fulfill({ json: { ok: true } });
    }
  });

  await page.goto('contact.html');
  const form = page.getByRole('form', { name: 'Send us a message' });
  await form.getByLabel('Your name').fill('Example visitor');
  await form.getByLabel('Email for a reply').fill('visitor@example.com');
  await form.getByLabel('What is it about?').selectOption('Prayer request');
  const message = form.getByLabel('Your message');
  await message.fill('A synthetic prayer request.');
  const send = form.getByRole('button', { name: 'Send message' });
  await send.click();
  await expect(form.getByRole('status')).toContainText('Your text is still here');
  await expect(message).toHaveValue('A synthetic prayer request.');
  await expect(send).toBeEnabled();

  await send.click();
  await expect(form.getByRole('status')).toHaveText('Thank you. Your message was sent.');
  await expect(message).toHaveValue('');
  expect(requests).toHaveLength(2);
  expect(requests[1].method()).toBe('POST');
  expect(requests[1].headers().accept).toBe('application/json');
  const body = requests[1].postData();
  for (const [field, value] of [
    ['name', 'Example visitor'], ['email', 'visitor@example.com'],
    ['subject', 'Prayer request'], ['message', 'A synthetic prayer request.'], ['_gotcha', '']
  ]) {
    expect(body).toContain('name="' + field + '"\r\n\r\n' + value + '\r\n');
  }
});

test.describe('with JavaScript disabled', () => {
  test.use({ javaScriptEnabled: false });

  test('the clergy form requires permission and sends a native POST', async ({ page }) => {
    let request;
    await page.route(endpoint, async route => {
      request = route.request();
      await route.fulfill({ contentType: 'text/html', body: '<h1>Form received</h1>' });
    });

    await page.goto('contact.html', { waitUntil: 'domcontentloaded' });
    const form = page.getByRole('form', { name: 'Ask a member of clergy' });
    await form.getByLabel('Your question').fill('A synthetic question.');
    const permission = form.getByRole('checkbox');
    const send = form.getByRole('button', { name: 'Send question' });
    await send.press('Enter');
    await expect(permission).toBeFocused();
    expect(request).toBeUndefined();

    await permission.press('Space');
    await send.press('Enter');
    await expect(page.getByRole('heading', { name: 'Form received' })).toBeVisible();
    expect(request.method()).toBe('POST');
    const data = new URLSearchParams(request.postData());
    expect(data.get('subject')).toBe('Question for clergy');
    expect(data.get('permission_to_forward')).toBe('yes');
    expect(data.get('message')).toBe('A synthetic question.');
  });
});
