const { test, expect } = require('@playwright/test');

const pages = [
  ['index.html', '#verse-text'],
  ['news.html', '#headlines'],
  ['church.html', '#church-news'],
  ['journal.html', '#posts'],
  ['scripture.html', '#results'],
  ['quizzes.html', '#crossword'],
  ['art.html', '#art-gallery'],
  ['artwork-credits.html', 'h1'],
  ['contact.html', '#contact']
];

for (const [url, target] of pages) {
  test('published page works: '+url, async ({page}) => {
    const errors=[];
    page.on('pageerror', error=>errors.push(error.message));
    const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:25000});
    expect(response?.status()).toBe(200);
    await expect(page.locator(target)).toBeVisible({timeout:18000});
    expect(await page.locator('body').innerText()).toContain('Daily Bread');
    if(url==='index.html')await expect(page.locator('#verse-text')).not.toContainText('Loading');
    if(url==='scripture.html')await expect(page.locator('#library-count')).toContainText('verses');
    if(url==='art.html')await expect(page.locator('#art-count')).toContainText('works');
    if(url==='quizzes.html')await expect(page.locator('#crossword')).not.toBeEmpty();
    if(url==='contact.html')await expect(page.locator('form').first()).toBeVisible();
    expect(errors).toEqual([]);
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+3);
    expect(overflow,'Horizontal scrolling on '+url).toBe(false);
  });
}

test('published news has a working biblical reflection', async ({page}) => {
  const response=await page.goto('news.html',{waitUntil:'domcontentloaded'});
  expect(response?.status()).toBe(200);
  const button=page.locator('#headlines [data-story]').first();
  await expect(button).toBeVisible({timeout:20000});
  await button.click();
  await expect(page.locator('#guidance')).toBeVisible();
  await expect(page.locator('#guidance')).toContainText('Scripture');
  await expect(page.locator('#guidance a[href*="scripture.html"]')).toBeVisible();
});
