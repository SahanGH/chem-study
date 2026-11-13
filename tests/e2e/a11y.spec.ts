import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const PAGES = ['/', '/unit-5-kinetics/', '/unit-5-kinetics/5-2-rate-law/', '/about/'];

for (const theme of ['light', 'dark'] as const) {
  for (const path of PAGES) {
    test(`${path} has no accessibility violations in the ${theme} theme`, async ({ page }) => {
      await page.addInitScript((value) => localStorage.setItem('chemstudy:theme', value), theme);
      await page.goto(path);
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();
      expect(results.violations.map((v) => `${v.id}: ${v.nodes.length} node(s) - ${v.help}`)).toEqual([]);
    });
  }
}

for (const theme of ['light', 'dark'] as const) {
  test(`the search dialog with results has no accessibility violations in the ${theme} theme`, async ({ page }) => {
    await page.addInitScript((value) => localStorage.setItem('chemstudy:theme', value), theme);
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    await page.getByRole('button', { name: 'Search' }).click();
    await page.locator('.pagefind-ui__search-input').fill('rate');
    await expect(page.locator('.pagefind-ui__result-link').first()).toBeVisible();
    const results = await new AxeBuilder({ page })
      .include('[data-search-dialog]')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(results.violations.map((v) => `${v.id}: ${v.nodes.length} node(s) - ${v.help}`)).toEqual([]);
  });
}

test('an equation is keyboard-focusable exactly while it is wider than the screen', async ({ page }) => {
  const focusable = page.locator('.katex-display[tabindex="0"]');
  // Equations stay on one line, so even at 1280px the long worked-example
  // equation overflows its column; the claim is "exactly the ones that overflow".
  const overflowing = async () => {
    await page.evaluate(() => document.fonts.ready);
    return page
      .locator('.katex-display')
      .evaluateAll((all) => all.filter((equation) => equation.scrollWidth > equation.clientWidth).length);
  };
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/unit-5-kinetics/5-2-rate-law/');
  const wideCount = await overflowing();
  await expect(focusable).toHaveCount(wideCount);

  await page.setViewportSize({ width: 320, height: 700 });
  const narrowCount = await overflowing();
  expect(narrowCount).toBeGreaterThan(wideCount);
  await expect(focusable).toHaveCount(narrowCount);
  await expect(focusable.first()).toHaveAttribute('aria-label', /scrolls sideways/);
  await focusable.first().focus();
  await expect(focusable.first()).toBeFocused();

  await page.setViewportSize({ width: 1280, height: 900 });
  await expect(focusable).toHaveCount(wideCount);
});

const LESSON = '/unit-5-kinetics/5-2-rate-law/';

test.describe('display equations at phone and desktop widths', () => {
  for (const width of [320, 412, 445, 1280]) {
    test(`at ${width}px exactly the equations that scroll are focusable, and the page does not`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto(LESSON);
      await page.evaluate(() => document.fonts.ready);

      // Measured after the math fonts are in: that is when an equation's true
      // width is known, and the script has to notice it without a resize.
      const mismatches = () =>
        page.locator('.katex-display').evaluateAll((equations) =>
          equations.flatMap((equation, index) => {
            const scrolls = equation.scrollWidth > equation.clientWidth;
            const focusable = equation.getAttribute('tabindex') === '0';
            return scrolls === focusable ? [] : [`equation ${index}: scrolls=${scrolls}, tabindex=${focusable}`];
          }),
        );
      await expect.poll(mismatches).toEqual([]);

      const pageOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(pageOverflow).toBeLessThanOrEqual(0);
    });
  }

  test('a long equation stays on one line instead of breaking at an operator', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto(LESSON);
    const wrapping = await page
      .locator('.katex-display > .katex')
      .evaluateAll((all) => all.map((el) => getComputedStyle(el).whiteSpace).filter((value) => value !== 'nowrap'));
    expect(wrapping).toEqual([]);
  });
});

test('an answered check still passes in both of its states', async ({ page }) => {
  await page.goto('/unit-5-kinetics/5-2-rate-law/');
  const first = page.locator('cs-check').first();
  await first.locator('.check-option').nth(0).click();
  await first.locator('.check-option').nth(2).click();
  const results = await new AxeBuilder({ page })
    .include('cs-check')
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();
  expect(results.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
});
