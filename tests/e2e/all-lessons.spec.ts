import fs from 'node:fs';
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

// Checks that hold for every lesson, whatever it teaches. The list comes from
// the lesson files, so a new lesson gets its own test the day it is added.
const UNIT = '/unit-5-kinetics/';
const LESSON_FILES = new URL('../../src/content/lessons/unit-5/', import.meta.url);
const paths = fs
  .readdirSync(LESSON_FILES)
  .filter((name) => name.endsWith('.mdx'))
  .map((name) => `${UNIT}${name.replace(/\.mdx$/, '')}/`)
  .sort();

test('the unit page links to every lesson that has a file, and to nothing else', async ({ page }) => {
  await page.goto(UNIT);

  const linked = await page.locator('.topic-list a').evaluateAll((links) =>
    links.map((link) => link.getAttribute('href')),
  );

  expect(paths.length).toBeGreaterThanOrEqual(1);
  expect([...linked].sort()).toEqual(paths);
});

for (const path of paths) {
  test(`${path} renders its math, has its checks, fits the screen and is accessible`, async ({ page }) => {
    await page.goto(path);

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    expect(await page.locator('.katex-error').count(), 'math that failed to render').toBe(0);
    expect(await page.locator('cs-check.is-enhanced').count(), 'check-yourself questions').toBeGreaterThanOrEqual(3);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, 'sideways scrolling').toBeLessThanOrEqual(0);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    expect(results.violations.map((v) => `${v.id}: ${v.nodes.length} node(s) - ${v.help}`)).toEqual([]);
  });
}

test('search finds every published Unit 5 lesson by its title', async ({ page }) => {
  test.slow();
  await page.goto(UNIT);
  const lessons = await page.locator('.topic-list a').evaluateAll((links) =>
    links.map((link) => ({ path: link.getAttribute('href'), title: link.textContent?.trim() ?? '' })),
  );
  expect(lessons.length).toBeGreaterThanOrEqual(1);
  await page.getByRole('button', { name: 'Search' }).click();
  const input = page.locator('.pagefind-ui__search-input');
  const more = page.locator('.pagefind-ui__button');

  for (const { path, title } of lessons) {
    if (!path || !title) throw new Error(`A topic link has no address or no text: ${JSON.stringify({ path, title })}`);
    await input.fill(title);
    // Wait for this query's results: the last query's are still on screen
    // until Pagefind answers, and could satisfy the check below.
    await expect(page.locator('.pagefind-ui__message')).toContainText(`for ${title}`);
    await expect(page.locator('.pagefind-ui__result-link').first()).toBeVisible();
    const result = page.locator(`.pagefind-ui__result-link[href*="${path}"]`).first();
    // Pagefind shows five results at a time. Titles share words ("rate",
    // "reaction"), so the lesson may be further down the list.
    while (!(await result.isVisible()) && (await more.isVisible())) await more.click();

    await expect(result, title).toBeVisible();
  }
});
