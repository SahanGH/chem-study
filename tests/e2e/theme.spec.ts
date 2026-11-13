import { expect, test } from '@playwright/test';

test('the page shell has a header, main content and a footer', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'ChemStudy home' })).toBeVisible();
  await expect(page.locator('main#main')).toBeVisible();
  await expect(page.locator('footer')).toContainText('AP® is a trademark');
});

test('the theme follows the device, can be switched, and is remembered', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  const html = page.locator('html');
  await expect(html).toHaveAttribute('data-theme', 'light');

  await page.getByRole('button', { name: 'Switch between light and dark theme' }).click();
  await expect(html).toHaveAttribute('data-theme', 'dark');

  await page.reload();
  await expect(html).toHaveAttribute('data-theme', 'dark');
});

test('a device set to dark starts dark', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});
