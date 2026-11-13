import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

// Checks that hold for every lesson, whatever it teaches. The lessons are
// found from the unit page, so a new lesson is covered the day it is added.
const UNIT = '/unit-5-kinetics/';

test('every published Unit 5 lesson renders its math, has its checks, fits the screen and is accessible', async ({
  page,
}) => {
  test.slow();
  await page.goto(UNIT);
  const paths = await page
    .locator('.topic-list a')
    .evaluateAll((links) => links.map((link) => link.getAttribute('href') ?? ''));
  expect(paths.length).toBeGreaterThanOrEqual(1);

  for (const path of paths) {
    await test.step(path, async () => {
      await page.goto(path);

      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      expect(await page.locator('.katex-error').count(), 'math that failed to render').toBe(0);
      expect(await page.locator('cs-check.is-enhanced').count(), 'check-yourself questions').toBeGreaterThanOrEqual(3);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, 'sideways scrolling').toBeLessThanOrEqual(0);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();
      expect(results.violations.map((v) => `${v.id}: ${v.nodes.length} node(s) - ${v.help}`)).toEqual([]);
    });
  }
});

test('search finds every published Unit 5 lesson by its title', async ({ page }) => {
  test.slow();
  await page.goto(UNIT);
  const lessons = await page.locator('.topic-list a').evaluateAll((links) =>
    links.map((link) => ({ path: link.getAttribute('href') ?? '', title: link.textContent?.trim() ?? '' })),
  );
  expect(lessons.length).toBeGreaterThanOrEqual(1);
  await page.getByRole('button', { name: 'Search' }).click();
  const input = page.locator('.pagefind-ui__search-input');

  for (const { path, title } of lessons) {
    await input.fill(title);

    await expect(page.locator(`.pagefind-ui__result-link[href*="${path}"]`).first(), title).toBeVisible();
  }
});
