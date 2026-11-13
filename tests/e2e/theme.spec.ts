import { expect, test, type Page } from '@playwright/test';

test('the page shell has a header, main content and a footer', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'ChemStudy home' })).toBeVisible();
  await expect(page.locator('main#main')).toBeVisible();
  await expect(page.locator('footer')).toContainText('AP® is a trademark');
});

test('the footer keeps the space between "under" and the license link', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('footer')).toContainText('share under CC BY-NC-SA 4.0');
});

const LIGHT_PAPER = 'rgb(253, 252, 249)';
const DARK_PAPER = 'rgb(27, 25, 22)';
const TOGGLE_NAME = 'Switch between light and dark theme';

test('the theme follows the device, can be switched, and is remembered', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  const html = page.locator('html');
  const body = page.locator('body');
  await expect(html).toHaveAttribute('data-theme', 'light');
  await expect(body).toHaveCSS('background-color', LIGHT_PAPER);

  await page.getByRole('button', { name: TOGGLE_NAME }).click();
  await expect(html).toHaveAttribute('data-theme', 'dark');
  await expect(body).toHaveCSS('background-color', DARK_PAPER);

  await page.reload();
  await expect(html).toHaveAttribute('data-theme', 'dark');
  await expect(body).toHaveCSS('background-color', DARK_PAPER);
});

test('a device set to dark starts dark', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('a stored light choice beats a device set to dark', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.addInitScript(() => localStorage.setItem('chemstudy:theme', 'light'));
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.locator('body')).toHaveCSS('background-color', LIGHT_PAPER);
});

test('switching back from dark to light is remembered after a reload', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  const html = page.locator('html');
  await expect(html).toHaveAttribute('data-theme', 'dark');

  await page.getByRole('button', { name: TOGGLE_NAME }).click();
  await expect(html).toHaveAttribute('data-theme', 'light');

  await page.reload();
  await expect(html).toHaveAttribute('data-theme', 'light');
  await expect(page.locator('body')).toHaveCSS('background-color', LIGHT_PAPER);
});

test('the theme is already set when the body first appears', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.addInitScript(() => {
    const seen = window as unknown as { __themeAtBody?: string };
    // Init scripts run before the <html> element exists, so watch the whole
    // document and wait for the record that adds <body>.
    new MutationObserver(() => {
      if (seen.__themeAtBody === undefined && document.body) {
        seen.__themeAtBody = document.documentElement.dataset.theme ?? 'unset';
      }
    }).observe(document, { childList: true, subtree: true });
  });
  await page.goto('/');
  const themeAtBody = await page.evaluate(
    () => (window as unknown as { __themeAtBody?: string }).__themeAtBody,
  );
  expect(themeAtBody).toBe('dark');
});

test.describe('with JavaScript off', () => {
  test.use({ javaScriptEnabled: false });

  test('the theme button is hidden but the rest of the shell still shows', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: TOGGLE_NAME })).toBeHidden();
    await expect(page.getByRole('link', { name: 'ChemStudy home' })).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
  });
});

test.describe('printing from the dark theme', () => {
  const PRINT_TOKENS = {
    '--paper': '#fff',
    '--card': '#fff',
    '--ink': '#000',
    '--muted': '#444',
    '--u-ink': '#000',
    '--u-tint': '#f2f2f2',
    '--line': '#999',
    '--no': '#7a2f25',
  };

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('chemstudy:theme', 'dark'));
    await page.emulateMedia({ media: 'print' });
  });

  async function readPrintStyles(page: Page) {
    return page.evaluate((names) => {
      document.querySelector('main')?.insertAdjacentHTML(
        'beforeend',
        '<p class="lede">lede</p><p class="kicker">kicker</p>',
      );
      const body = getComputedStyle(document.body);
      const colorOf = (selector: string) => {
        const element = document.querySelector(selector);
        return element ? getComputedStyle(element).color : null;
      };
      return {
        theme: document.documentElement.dataset.theme,
        colorScheme: getComputedStyle(document.documentElement).colorScheme,
        bodyBackground: body.backgroundColor,
        h1Color: colorOf('h1'),
        ledeColor: colorOf('.lede'),
        kickerColor: colorOf('.kicker'),
        tokens: Object.fromEntries(
          names.map((name) => [name, body.getPropertyValue(name).trim()]),
        ),
      };
    }, Object.keys(PRINT_TOKENS));
  }

  test('prints dark text on white even though the screen theme is dark', async ({ page }) => {
    await page.goto('/');
    const styles = await readPrintStyles(page);

    expect(styles.theme).toBe('dark');
    expect(styles.bodyBackground).toBe('rgb(255, 255, 255)');
    expect(styles.h1Color).toBe('rgb(0, 0, 0)');
    expect(styles.ledeColor).toBe('rgb(68, 68, 68)');
    expect(styles.kickerColor).toBe('rgb(0, 0, 0)');
    expect(styles.colorScheme).toBe('light');
    expect(styles.tokens).toEqual(PRINT_TOKENS);
  });

  test('prints the same on a page whose body carries a unit accent', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      document.body.dataset.unit = '5';
    });
    const styles = await readPrintStyles(page);

    expect(styles.kickerColor).toBe('rgb(0, 0, 0)');
    expect(styles.tokens).toEqual(PRINT_TOKENS);
  });
});

test('the page does not scroll sideways at 320px wide', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto('/');
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});
