import { expect, test } from '@playwright/test';

// The counts grow as lessons are published, so these match any count rather
// than today's, and check that the verb agrees with it.
const UNIT_5_READY = /\d+ of 11 lessons ready/;
const UNIT_5_READY_ONE_DONE = /\d+ of 11 lessons ready · 1 done/;
const HOME_COUNT = /\b(?:1 of 91 lessons is|(?:[2-9]|\d\d) of 91 lessons are) ready so far/;
const ABOUT_COUNT = /\b(?:1 of 91 topics has|(?:[2-9]|\d\d) of 91 topics have) a lesson so far/;

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
  await expect(page.locator('.unit-row[data-unit="5"] .unit-meta')).toHaveText(UNIT_5_READY_ONE_DONE);
});

test('a unit row counts lessons the same way before and after one is finished', async ({ page }) => {
  await page.goto('/');
  const meta = page.locator('.unit-row[data-unit="5"] .unit-meta');
  await expect(meta).toHaveText(UNIT_5_READY);
  await expect(meta).not.toContainText('done');

  await page.evaluate(() =>
    localStorage.setItem('chemstudy:progress:v1', JSON.stringify({ answered: {}, done: ['5.2'], last: null })),
  );
  await page.reload();

  await expect(meta).toHaveText(UNIT_5_READY_ONE_DONE);
});

test('the home page says how many lessons exist instead of promising all of them', async ({ page }) => {
  await page.goto('/');
  const hero = page.locator('.hero');

  await expect(hero).toContainText(HOME_COUNT);
  await expect(hero).not.toContainText('Every topic');
  await expect(page.locator('meta[name="description"]')).not.toHaveAttribute('content', /every/i);
});

test('the About page says how many lessons exist instead of promising all of them', async ({ page }) => {
  await page.goto('/about/');
  const main = page.locator('main');

  await expect(main).toContainText(ABOUT_COUNT);
  await expect(main).not.toContainText('a lesson for each topic');
});

test('the About page does not ask for error reports while there is no way to send one', async ({ page }) => {
  await page.goto('/about/');
  const main = page.locator('main');

  await expect(main).toContainText('fact-checked');
  await expect(main).not.toContainText(/report/i);
  await expect(main.locator('a[href*="github.com"]')).toHaveCount(0);
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
