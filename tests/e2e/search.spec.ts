import { expect, test } from '@playwright/test';

test('search finds a lesson by words in it', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Search' }).click();
  await page.locator('.pagefind-ui__search-input').fill('method of initial rates');
  const result = page.locator('.pagefind-ui__result-link').first();
  await expect(result).toBeVisible();
  await expect(result).toHaveAttribute('href', /\/unit-5-kinetics\/5-2-rate-law\//);
});

test('the slash key opens search and Escape closes it', async ({ page }) => {
  await page.goto('/about/');
  await page.keyboard.press('/');
  await expect(page.locator('[data-search-dialog]')).toHaveAttribute('open', '');
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-search-dialog]')).not.toHaveAttribute('open', '');
});
