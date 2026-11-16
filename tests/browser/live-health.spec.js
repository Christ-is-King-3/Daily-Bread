const { test, expect } = require('@playwright/test');

const pages = [
  ['index.html', '#verse-text'],
  ['news.html', '#headlines'],
  ['church.html', '#church-news'],
  ['journal.html', '#posts'],
  ['scripture.html', '#results'],
  ['start.html', '#who-is-jesus'],
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
    if (url !== 'artwork-credits.html') {
      const start = page.getByRole('navigation', {name:'Main navigation'}).getByRole('link', {name:'Start Here'});
      await expect(start).toHaveAttribute('href', 'start.html');
    }
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

test('a beginner can find the lessons and reveal the reading checks', async ({page}) => {
  await page.goto('index.html', {waitUntil:'domcontentloaded'});
  await page.getByRole('navigation', {name:'Explore Daily Bread'}).getByRole('link', {name:/New to Christianity/}).click();
  await expect(page.getByRole('heading', {name:'New to Christianity?'})).toBeVisible();
  const lessons = page.getByRole('navigation', {name:'Lessons'});
  await expect(lessons.locator('ol a')).toHaveText([
    'Who is Jesus?', 'Why did Jesus die and rise again?', 'How do I begin following Jesus?',
    'How do I read the Bible?', 'How do I pray?'
  ]);
  await lessons.getByRole('link', {name:'Who is Jesus?'}).click();
  await expect(page).toHaveURL(/#who-is-jesus$/);
  for (const id of ['who-is-jesus', 'cross-and-resurrection', 'following-jesus', 'reading-scripture', 'prayer']) {
    const lesson = page.locator('#' + id);
    await expect(lesson.getByRole('link', {name:/\(ESV\)/})).toHaveAttribute('href', /^https:\/\/www\.esv\.org\//);
    const check = lesson.locator('.start-check');
    await expect(check.locator('p')).toBeHidden();
    await check.locator('summary').click();
    await expect(check.locator('p')).toBeVisible();
  }
  await expect(page.locator('.start-ranked')).toHaveAttribute('start', '6');
  await expect(page.locator('.start-ranked > li')).toHaveCount(14);
  const history = page.locator('#early-church');
  await expect(history.locator('.start-answer')).toBeHidden();
  await history.locator(':scope > summary').click();
  await expect(history.locator('.start-answer')).toBeVisible();
  await history.getByText('Read further', {exact:true}).click();
  await expect(history.getByRole('link', {name:/Larry Hurtado/})).toBeVisible();
  await page.getByRole('link', {name:'Read on in Mark 1'}).click();
  await expect(page.getByLabel('Search Scripture by feeling, need, words or Bible reference')).toHaveValue('Mark 1');
  await expect(page.locator('#results')).toContainText('Mark 1:1');
});
