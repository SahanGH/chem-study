import { expect, test, type Page } from '@playwright/test';

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

test.describe('the search index holds words, not TeX source', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Search' }).click();
  });

  test('a TeX command matches nothing', async ({ page }) => {
    await page.locator('.pagefind-ui__search-input').fill('qquad');
    await expect(page.locator('.pagefind-ui__message')).toHaveText('No results for qquad');
  });

  test('ordinary words around an equation still find the lesson', async ({ page }) => {
    await page.locator('.pagefind-ui__search-input').fill('rate law');
    await expect(page.locator('.pagefind-ui__result-link').first()).toHaveText('Introduction to Rate Law');
  });

  test('no excerpt shows a backslash', async ({ page }) => {
    const input = page.locator('.pagefind-ui__search-input');
    for (const query of ['rate law', 'initial rates', 'rate constant']) {
      await input.fill(query);
      await expect(page.locator('.pagefind-ui__message')).toHaveText(`1 result for ${query}`);
      const excerpts = await page.locator('.pagefind-ui__result-excerpt').allInnerTexts();
      expect(excerpts.length, `excerpts for "${query}"`).toBeGreaterThan(0);
      expect(excerpts.filter((text) => text.includes('\\')), `excerpts for "${query}"`).toEqual([]);
    }
  });
});

test.describe('when the search UI fails to load', () => {
  const UI_SCRIPT = '**/pagefind/pagefind-ui.js';

  test('the note tells a student what to do, not how to run a build', async ({ page }) => {
    await page.route(UI_SCRIPT, (route) => route.abort());
    await page.goto('/');
    await page.getByRole('button', { name: 'Search' }).click();

    const note = page.locator('[data-search-note]');
    await expect(note).toBeVisible();
    await expect(note).toHaveText('Search could not load. Check your connection and try again.');
  });

  test('opening search again retries and shows the search box', async ({ page }) => {
    let failedOnce = false;
    await page.route(UI_SCRIPT, (route) => {
      if (failedOnce) return route.continue();
      failedOnce = true;
      return route.abort();
    });
    await page.goto('/');
    const note = page.locator('[data-search-note]');
    await page.getByRole('button', { name: 'Search' }).click();
    await expect(note).toBeVisible();

    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Search' }).click();

    await expect(page.locator('.pagefind-ui__search-input')).toBeVisible();
    await expect(note).toBeHidden();
  });

  test('a script that loads without defining PagefindUI fails with a clear message', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    await page.route(UI_SCRIPT, (route) =>
      route.fulfill({ contentType: 'text/javascript', body: '/* no PagefindUI here */' }),
    );
    await page.goto('/');
    await page.getByRole('button', { name: 'Search' }).click();

    await expect(page.locator('[data-search-note]')).toBeVisible();
    expect(errors.join('\n')).toContain('did not define PagefindUI');
  });
});

test.describe('the slash shortcut', () => {
  const dialog = (page: Page) => page.locator('[data-search-dialog]');

  test('is ignored when Control is held', async ({ page }) => {
    await page.goto('/about/');
    await page.keyboard.press('Control+/');
    await expect(dialog(page)).not.toHaveAttribute('open', '');
  });

  test('is ignored when another handler already claimed the key', async ({ page }) => {
    await page.goto('/about/');
    await page.evaluate(() => {
      window.addEventListener('keydown', (event) => event.preventDefault(), { capture: true });
    });
    await page.keyboard.press('/');
    await expect(dialog(page)).not.toHaveAttribute('open', '');
  });

  test('types a slash into the answer box instead of opening search', async ({ page }) => {
    await page.goto('/unit-5-kinetics/5-2-rate-law/');
    const answer = page.locator('cs-check[data-numeric] input').first();
    await answer.focus();
    await page.keyboard.press('/');
    await expect(answer).toHaveValue('/');
    await expect(dialog(page)).not.toHaveAttribute('open', '');
  });

  test('is ignored while a drop-down list has focus', async ({ page }) => {
    await page.goto('/about/');
    await page.evaluate(() => {
      document.querySelector('main')?.insertAdjacentHTML(
        'beforeend',
        '<select id="probe" aria-label="probe"><option>a</option><option>b</option></select>',
      );
    });
    await page.locator('#probe').focus();
    await page.keyboard.press('/');
    await expect(dialog(page)).not.toHaveAttribute('open', '');
  });
});

test('the slash key opens search and Escape closes it', async ({ page }) => {
  await page.goto('/about/');
  await page.keyboard.press('/');
  await expect(page.locator('[data-search-dialog]')).toHaveAttribute('open', '');
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-search-dialog]')).not.toHaveAttribute('open', '');
});
