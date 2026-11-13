import fs from 'node:fs';
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

// Checks that hold for every practice document, whatever it asks. The list
// comes from the files, so a new document gets its own tests the day it is added.
const UNIT = '/unit-5-kinetics/';
const PRACTICE_FILES = new URL('../../src/content/practice/unit-5/', import.meta.url);
const paths = fs
  .readdirSync(PRACTICE_FILES)
  .filter((name) => name.endsWith('.mdx'))
  .map((name) => `${UNIT}practice/${name.replace(/\.mdx$/, '')}/`)
  .sort();
const WORKSHEET_1 = `${UNIT}practice/worksheet-1-rates-and-rate-laws/`;

test('the unit page links to every practice document that has a file, and to no other', async ({ page }) => {
  await page.goto(UNIT);

  const linked = await page.locator('.practice-list a').evaluateAll((links) =>
    links.map((link) => link.getAttribute('href')),
  );

  expect(paths.length).toBeGreaterThanOrEqual(1);
  expect([...linked].sort()).toEqual(paths);
});

for (const path of paths) {
  test(`${path} renders its math, keeps its answers closed, fits the screen and is accessible`, async ({ page }) => {
    await page.goto(path);

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    expect(await page.locator('.katex-error').count(), 'math that failed to render').toBe(0);
    expect(await page.locator('[data-part="question"]').count(), 'questions').toBeGreaterThanOrEqual(1);
    expect(await page.locator('details[open]').count(), 'answers open before the student asks').toBe(0);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, 'sideways scrolling').toBeLessThanOrEqual(0);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    expect(results.violations.map((v) => `${v.id}: ${v.nodes.length} node(s) - ${v.help}`)).toEqual([]);
  });
}

for (const path of paths) {
  // A long equation written inside a sentence cannot wrap or scroll, so it
  // pushes the whole page sideways. Answers are opened first: a closed one
  // takes no space, so its math would not be measured.
  test(`${path} does not scroll sideways on the narrowest phones with every answer open`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 700 });
    await page.goto(path);
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => {
      for (const details of document.querySelectorAll('details')) details.open = true;
    });

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );

    expect(overflow).toBeLessThanOrEqual(0);
  });

  test(`${path} is accessible with every answer open`, async ({ page }) => {
    await page.goto(path);
    await page.evaluate(() => {
      for (const details of document.querySelectorAll('details')) details.open = true;
    });

    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();

    expect(results.violations.map((v) => `${v.id}: ${v.nodes.length} node(s) - ${v.help}`)).toEqual([]);
  });
}

test('an answer stays hidden until "Show answer" is chosen', async ({ page }) => {
  await page.goto(WORKSHEET_1);
  const first = page.locator('[data-part="answer"]').first();
  await expect(first.locator('.answer-body')).toBeHidden();

  await first.locator('summary').click();

  await expect(first.locator('.answer-body')).toBeVisible();
  await expect(first.locator('.answer-body')).toContainText('M/s');
});

test('an answer opens from the keyboard', async ({ page }) => {
  await page.goto(WORKSHEET_1);
  const first = page.locator('[data-part="answer"]').first();

  await first.locator('summary').focus();
  await page.keyboard.press('Enter');

  await expect(first.locator('.answer-body')).toBeVisible();
});

test('a question names its topic and links to that lesson', async ({ page }) => {
  await page.goto(WORKSHEET_1);
  const link = page.locator('[data-part="question"]').first().getByRole('link', { name: '5.1 Reaction Rates' });

  await link.click();

  await expect(page).toHaveURL(/\/unit-5-kinetics\/5-1-reaction-rates\/$/);
});

test('a lesson ends with a link to the practice for its topic', async ({ page }) => {
  await page.goto(`${UNIT}5-1-reaction-rates/`);

  await page.locator('[data-part="practice-next"]').getByRole('link', { name: 'Worksheet 1: Rates and rate laws' }).click();

  await expect(page).toHaveURL(new RegExp(`${WORKSHEET_1}$`));
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Worksheet 1: Rates and rate laws');
});

test('a practice page lists the unit\'s practice and marks the one being read', async ({ page }) => {
  await page.goto(WORKSHEET_1);

  const current = page.getByRole('navigation', { name: 'Unit 5 practice' }).locator('[aria-current="page"]');

  await expect(current).toHaveText('Worksheet 1: Rates and rate laws');
});

// Playwright's print emulation applies the @media print CSS, which is all a
// practice page relies on.
test('a printed practice page carries the answers that are open and leaves out the closed ones', async ({ page }) => {
  await page.goto(WORKSHEET_1);
  const answers = page.locator('[data-part="answer"]');
  await answers.nth(0).locator('summary').click();

  await page.emulateMedia({ media: 'print' });

  await expect(answers.nth(0).locator('.answer-body')).toBeVisible();
  await expect(answers.nth(0).locator('summary')).toBeHidden();
  await expect(answers.nth(1)).toBeHidden();
  await expect(page.locator('.print-note')).toBeHidden();
});

test('search finds every practice document by its title', async ({ page }) => {
  test.slow();
  await page.goto(UNIT);
  const documents = await page.locator('.practice-list a').evaluateAll((links) =>
    links.map((link) => ({ path: link.getAttribute('href'), title: link.textContent?.trim() ?? '' })),
  );
  expect(documents.length).toBeGreaterThanOrEqual(1);
  await page.getByRole('button', { name: 'Search' }).click();
  const input = page.locator('.pagefind-ui__search-input');
  const more = page.locator('.pagefind-ui__button');

  for (const { path, title } of documents) {
    if (!path || !title) throw new Error(`A practice link has no address or no text: ${JSON.stringify({ path, title })}`);
    await input.fill(title);
    // Wait for this query's results: the last query's are still on screen
    // until Pagefind answers, and could satisfy the check below.
    await expect(page.locator('.pagefind-ui__message')).toContainText(`for ${title}`);
    await expect(page.locator('.pagefind-ui__result-link').first()).toBeVisible();
    const result = page.locator(`.pagefind-ui__result-link[href*="${path}"]`).first();
    while (!(await result.isVisible()) && (await more.isVisible())) await more.click();

    await expect(result, title).toBeVisible();
  }
});

test('search does not show what is inside an answer', async ({ page }) => {
  test.slow();
  await page.goto(UNIT);
  await page.getByRole('button', { name: 'Search' }).click();

  // On Worksheet 1 these words appear only inside an answer.
  await page.locator('.pagefind-ui__search-input').fill('hydrogen bonding');

  await expect(page.locator('.pagefind-ui__message')).toContainText('for hydrogen bonding');
  await expect(page.locator('.pagefind-ui__result-link[href*="worksheet-1-rates-and-rate-laws"]')).toHaveCount(0);
});

test("the unit page puts each practice document's topics under its title", async ({ page }) => {
  await page.goto(UNIT);
  const item = page.locator('.practice-list > li').first();

  const title = await item.locator('a').boundingBox();
  const topics = await item.locator('.topic-meta').boundingBox();

  if (!title || !topics) throw new Error('The first practice item has no visible title or topics note to measure.');
  expect(topics.y).toBeGreaterThanOrEqual(title.y + title.height - 1);
  expect(Math.abs(topics.x - title.x)).toBeLessThanOrEqual(1);
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('a practice page is readable and its answers can be opened', async ({ page }) => {
    await page.goto(WORKSHEET_1);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Worksheet 1: Rates and rate laws');
    const first = page.locator('[data-part="answer"]').first();

    await first.locator('summary').click();

    await expect(first.locator('.answer-body')).toBeVisible();
  });
});
