import { expect, test, type Page } from '@playwright/test';

const LESSON = '/unit-5-kinetics/5-2-rate-law/';

declare global {
  interface Window {
    cspViolations?: string[];
  }
}

/** Records every Content-Security-Policy violation the page reports. */
async function watchForViolations(page: Page) {
  await page.addInitScript(() => {
    window.cspViolations = [];
    document.addEventListener('securitypolicyviolation', (event) => {
      window.cspViolations?.push(`${event.violatedDirective} blocked ${event.blockedURI}`);
    });
  });
}

const violations = (page: Page) => page.evaluate(() => window.cspViolations ?? []);

const PAGES = ['/', '/unit-5-kinetics/', LESSON, '/about/', '/no-such-page/'];

test('every page carries the content security policy', async ({ page }) => {
  for (const path of PAGES) {
    await page.goto(path);
    await expect(page.locator('meta[http-equiv="Content-Security-Policy"]'), path).toHaveAttribute(
      'content',
      /default-src 'self'/,
    );
  }
});

test('every page tells other sites only where a visitor came from, not which page', async ({ page }) => {
  for (const path of PAGES) {
    await page.goto(path);
    await expect(page.locator('meta[name="referrer"]'), path).toHaveAttribute(
      'content',
      'strict-origin-when-cross-origin',
    );
  }
});

test('the policy blocks an image from another site', async ({ page }) => {
  await watchForViolations(page);
  // The address is never fetched: the policy stops it first, and without a
  // policy this route does.
  await page.route('https://csp-probe.invalid/**', (route) => route.abort());
  await page.goto('/');

  await page.evaluate(() => {
    const image = document.createElement('img');
    image.src = 'https://csp-probe.invalid/pixel.png';
    document.body.append(image);
  });

  await expect.poll(() => violations(page)).toEqual(['img-src blocked https://csp-probe.invalid/pixel.png']);
});

test('the policy does not get in the way of a lesson: math, a figure, a check and the theme switch', async ({
  page,
}) => {
  await watchForViolations(page);
  await page.goto(LESSON);
  await expect(page.locator('[data-part="figure"] img')).toBeVisible();
  await page.locator('cs-check').first().locator('.check-option').nth(2).click();
  await expect(page.locator('cs-check').first().locator('.check-feedback')).toHaveText('Correct.');
  const before = await page.locator('html').getAttribute('data-theme');
  expect(before).toMatch(/^(light|dark)$/);
  await page.locator('[data-theme-toggle]').first().click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', before === 'light' ? 'dark' : 'light');

  expect(await violations(page)).toEqual([]);
});

test('the policy does not get in the way of search', async ({ page }) => {
  await watchForViolations(page);
  await page.goto('/');
  await page.getByRole('button', { name: 'Search' }).click();
  await page.locator('.pagefind-ui__search-input').fill('method of initial rates');
  await expect(page.locator('.pagefind-ui__result-link').first()).toBeVisible();

  expect(await violations(page)).toEqual([]);
});
