import { expect, test } from '@playwright/test';

test('search finds a lesson by words in it', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Search' }).click();
  await page.locator('.pagefind-ui__search-input').fill('method of initial rates');
  const result = page.locator('.pagefind-ui__result-link').first();
  await expect(result).toBeVisible();
  await expect(result).toHaveAttribute('href', /\/unit-5-kinetics\/5-2-rate-law\//);
});

test('the dialog lays its search box and results out inside itself', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Search' }).click();
  await page.locator('.pagefind-ui__search-input').fill('rate');
  const firstResult = page.locator('.pagefind-ui__result').first();
  await expect(firstResult).toBeVisible();

  const dialog = page.locator('[data-search-dialog]');
  const layout = await dialog.evaluate((element) => {
    const styles = getComputedStyle(element);
    const box = element.getBoundingClientRect();
    const input = element.querySelector('.pagefind-ui__search-input')?.getBoundingClientRect();
    const result = element.querySelector('.pagefind-ui__result')?.getBoundingClientRect();
    if (!input || !result) throw new Error('The dialog has no search input or no result.');
    return {
      dialogWidth: box.width,
      contentLeft: box.left + parseFloat(styles.borderLeftWidth) + parseFloat(styles.paddingLeft),
      inputWidth: input.width,
      resultLeft: result.left,
      overflow: element.scrollWidth - element.clientWidth,
    };
  });

  expect(layout.inputWidth).toBeGreaterThanOrEqual(layout.dialogWidth * 0.6);
  expect(layout.resultLeft).toBeGreaterThanOrEqual(layout.contentLeft - 0.5);
  expect(layout.overflow).toBeLessThanOrEqual(0);
});

test('picking a result on the page you are already on closes the dialog', async ({ page }) => {
  await page.goto('/unit-5-kinetics/5-2-rate-law/');
  await page.getByRole('button', { name: 'Search' }).click();
  await page.locator('.pagefind-ui__search-input').fill('initial rates');
  const subResult = page.locator('.pagefind-ui__result-nested .pagefind-ui__result-link').first();
  await expect(subResult).toBeVisible();
  const href = await subResult.getAttribute('href');
  const fragment = new URL(href ?? '', page.url()).hash;
  expect(fragment).not.toBe('');

  await subResult.click();

  await expect(page.locator('[data-search-dialog]')).not.toHaveAttribute('open', '');
  expect(page.url().endsWith(fragment)).toBe(true);
});

test('choosing a result on the same page with the keyboard closes the dialog too', async ({ page }) => {
  await page.goto('/unit-5-kinetics/5-2-rate-law/');
  await page.getByRole('button', { name: 'Search' }).click();
  await page.locator('.pagefind-ui__search-input').fill('initial rates');
  const subResult = page.locator('.pagefind-ui__result-nested .pagefind-ui__result-link').first();
  await expect(subResult).toBeVisible();
  const href = await subResult.getAttribute('href');
  const fragment = new URL(href ?? '', page.url()).hash;

  await subResult.focus();
  await page.keyboard.press('Enter');

  await expect(page.locator('[data-search-dialog]')).not.toHaveAttribute('open', '');
  expect(page.url().endsWith(fragment)).toBe(true);
});

test('the slash key opens search and Escape closes it', async ({ page }) => {
  await page.goto('/about/');
  await page.keyboard.press('/');
  await expect(page.locator('[data-search-dialog]')).toHaveAttribute('open', '');
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-search-dialog]')).not.toHaveAttribute('open', '');
});
