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
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/unit-5-kinetics/5-2-rate-law/');
  await expect(focusable).toHaveCount(0);

  await page.setViewportSize({ width: 320, height: 700 });
  await expect(focusable.first()).toHaveAttribute('aria-label', /scrolls sideways/);
  await focusable.first().focus();
  await expect(focusable.first()).toBeFocused();

  await page.setViewportSize({ width: 1280, height: 900 });
  await expect(focusable).toHaveCount(0);
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
