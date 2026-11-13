import { expect, test } from '@playwright/test';

const LESSON = '/unit-5-kinetics/5-2-rate-law/';

test('a lesson shows its topic, title and all its building blocks', async ({ page }) => {
  await page.goto(LESSON);
  await expect(page.getByRole('heading', { level: 1, name: 'Introduction to Rate Law' })).toBeVisible();
  await expect(page.locator('.kicker')).toContainText('Topic 5.2');
  for (const part of ['key-idea', 'worked', 'trap', 'key-points', 'practice-next', 'figure']) {
    await expect(page.locator(`[data-part="${part}"]`).first()).toBeVisible();
  }
  expect(await page.locator('cs-check').count()).toBeGreaterThanOrEqual(3);
});

test('chemical equations are typeset, not left as source text', async ({ page }) => {
  await page.goto(LESSON);
  const visible = await page.locator('article .katex-html').allInnerTexts();
  expect(visible.length).toBeGreaterThan(5);
  expect(visible.join(' ')).not.toContain('\\ce');
  expect(await page.locator('.katex-error').count()).toBe(0);
});

test('a wrong answer says so, a right answer explains itself, and the keyboard works', async ({ page }) => {
  await page.goto(LESSON);
  const first = page.locator('cs-check').first();
  const feedback = first.locator('.check-feedback');
  const options = first.locator('.check-option');

  await options.nth(0).click();
  await expect(feedback).toHaveText('Not quite. Try another.');
  await expect(first.locator('.check-why')).not.toHaveAttribute('open', '');

  await options.nth(2).focus();
  await page.keyboard.press('Enter');
  await expect(feedback).toHaveText('Correct.');
  await expect(first.locator('.check-why')).toHaveAttribute('open', '');
});

test('answering every check completes the topic, and the device remembers', async ({ page }) => {
  await page.goto(LESSON);
  await expect(page.locator('[data-complete]')).toBeHidden();

  const checks = page.locator('cs-check');
  await checks.nth(0).locator('.check-option').nth(2).click();
  await checks.nth(1).locator('.check-option').nth(1).click();
  await checks.nth(2).locator('input').fill('0.020');
  await checks.nth(2).locator('input').press('Enter');
  await expect(checks.nth(2).locator('.check-feedback')).toHaveText('Correct.');
  await expect(page.locator('[data-complete]')).toBeVisible();

  await page.reload();
  await expect(page.locator('[data-complete]')).toBeVisible();
});

test('a numeric check rejects text that is not a number', async ({ page }) => {
  await page.goto(LESSON);
  const numeric = page.locator('cs-check[data-numeric]').first();
  await numeric.locator('input').fill('lots');
  await numeric.locator('input').press('Enter');
  await expect(numeric.locator('.check-feedback')).toContainText('Enter a number');
});

test('the lesson fits a phone screen without sideways scrolling', async ({ page }) => {
  await page.goto(LESSON);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});
