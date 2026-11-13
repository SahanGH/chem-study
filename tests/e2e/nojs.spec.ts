import { expect, test } from '@playwright/test';

test.use({ javaScriptEnabled: false });

test('without JavaScript a lesson is fully readable and answers can be opened', async ({ page }) => {
  await page.goto('/unit-5-kinetics/5-2-rate-law/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Introduction to Rate Law');
  const first = page.locator('cs-check').first();
  await expect(first.locator('li').first()).toBeVisible();
  await first.locator('summary').click();
  await expect(first.locator('.check-answer')).toHaveText('Answer: option 3');
  await expect(first.locator('.check-answer')).toBeVisible();
});
