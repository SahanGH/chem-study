import { expect, test } from '@playwright/test';

test('the home page lists all nine units and is honest about what exists', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('finally clicks');
  const rows = page.locator('.unit-row');
  await expect(rows).toHaveCount(9);
  await expect(rows.filter({ hasText: 'Coming soon' })).toHaveCount(8);
  await expect(page.getByRole('link', { name: 'Kinetics', exact: true })).toHaveAttribute(
    'href',
    '/unit-5-kinetics/',
  );
});

test('the unit page lists every topic and links the ones that have lessons', async ({ page }) => {
  await page.goto('/unit-5-kinetics/');
  await expect(page.getByRole('heading', { level: 1, name: 'Kinetics' })).toBeVisible();
  await expect(page.locator('.topic-list > li')).toHaveCount(11);
  await page.getByRole('link', { name: 'Introduction to Rate Law' }).click();
  await expect(page).toHaveURL(/\/unit-5-kinetics\/5-2-rate-law\/$/);
});

test('a finished topic shows as done on the unit page and the home page offers to continue', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-continue]')).toBeHidden();

  await page.goto('/unit-5-kinetics/5-2-rate-law/');
  const checks = page.locator('cs-check');
  await checks.nth(0).locator('.check-option').nth(2).click();
  await checks.nth(1).locator('.check-option').nth(1).click();
  await checks.nth(2).locator('input').fill('0.020');
  await checks.nth(2).locator('input').press('Enter');
  await expect(page.locator('[data-complete]')).toBeVisible();

  await page.goto('/unit-5-kinetics/');
  await expect(page.locator('[data-topic-link="5.2"]')).toHaveClass(/is-done/);

  await page.goto('/');
  await expect(page.locator('[data-continue] a')).toHaveText('Introduction to Rate Law');
  await expect(page.locator('.unit-row[data-unit="5"] [data-unit-progress]')).toHaveText('1 of 1 done');
});

test('the home and unit pages fit a phone screen without sideways scrolling', async ({ page }) => {
  for (const path of ['/', '/unit-5-kinetics/']) {
    await page.goto(path);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, path).toBeLessThanOrEqual(0);
  }
});

test('the About page says who wrote the site, how it is checked, and the license', async ({ page }) => {
  await page.goto('/about/');
  await expect(page.getByRole('heading', { level: 1, name: 'About ChemStudy' })).toBeVisible();
  await expect(page.locator('main')).toContainText('fact-checked');
  await expect(page.locator('main')).toContainText('CC BY-NC-SA 4.0');
  await expect(page.locator('main')).toContainText('College Board');
});

test('an address that does not exist gets a helpful page and a 404 status', async ({ page }) => {
  const response = await page.goto('/no-such-page/');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1, name: 'Page not found' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'the nine units' })).toHaveAttribute('href', '/#units');
});
