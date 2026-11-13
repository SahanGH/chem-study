import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const PAGES = ['/', '/unit-5-kinetics/', '/unit-5-kinetics/5-2-rate-law/', '/about/'];

for (const theme of ['light', 'dark'] as const) {
  for (const path of PAGES) {
    test(`${path} has no accessibility violations in the ${theme} theme`, async ({ page }) => {
      await page.addInitScript((value) => localStorage.setItem('chemstudy:theme', value), theme);
      await page.goto(path);
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();
      expect(results.violations.map((v) => `${v.id}: ${v.nodes.length} node(s) - ${v.help}`)).toEqual([]);
    });
  }
}

for (const theme of ['light', 'dark'] as const) {
  test(`the search dialog with results has no accessibility violations in the ${theme} theme`, async ({ page }) => {
    await page.addInitScript((value) => localStorage.setItem('chemstudy:theme', value), theme);
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    await page.getByRole('button', { name: 'Search' }).click();
    await page.locator('.pagefind-ui__search-input').fill('rate');
    await expect(page.locator('.pagefind-ui__result-link').first()).toBeVisible();
    const results = await new AxeBuilder({ page })
      .include('[data-search-dialog]')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(results.violations.map((v) => `${v.id}: ${v.nodes.length} node(s) - ${v.help}`)).toEqual([]);
  });
}

test('an equation is keyboard-focusable exactly while it is wider than its space', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/unit-5-kinetics/5-2-rate-law/');
  await page.evaluate(() => document.fonts.ready);
  const equation = page.locator('.katex-display').first();
  const setMaxWidth = (value: string) =>
    equation.evaluate((element, width) => {
      if (!(element instanceof HTMLElement)) throw new Error('The equation is not an HTML element.');
      element.style.maxWidth = width;
    }, value);
  await expect(equation).not.toHaveAttribute('tabindex');

  // Squeeze it until it must scroll, whatever the lesson's equations are today.
  await setMaxWidth('4rem');

  await expect(equation).toHaveAttribute('tabindex', '0');
  await expect(equation).toHaveAttribute('aria-label', /scrolls sideways/);
  await equation.focus();
  await expect(equation).toBeFocused();

  await setMaxWidth('');
  await expect(equation).not.toHaveAttribute('tabindex');
});

test.describe('a table in a lesson', () => {
  const WITH_TABLES = '/unit-5-kinetics/5-3-concentration-changes-over-time/';

  test('stays out of the tab order while it fits', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(WITH_TABLES);
    await page.evaluate(() => document.fonts.ready);
    const table = page.locator('article table').first();

    await expect(table).not.toHaveAttribute('tabindex');
  });

  test('can be reached and scrolled from the keyboard once it is too wide for its space', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(WITH_TABLES);
    await page.evaluate(() => document.fonts.ready);
    const table = page.locator('article table').first();

    // Squeeze it until it must scroll, whatever the lesson's wording is today.
    await table.evaluate((element) => {
      if (!(element instanceof HTMLElement)) throw new Error('The table is not an HTML element.');
      element.style.maxWidth = '9rem';
    });

    await expect(table).toHaveAttribute('tabindex', '0');
    await expect(table).toHaveAttribute('aria-label', 'Table, scrolls sideways');
    await table.focus();
    await expect(table).toBeFocused();
  });
});

test('on a phone, an equation in a numbered step starts left of the step, and one in a question does not move', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto('/unit-5-kinetics/5-1-reaction-rates/');
  const inStep = page.locator('[data-part="worked"] li .katex-display').first();
  await expect(inStep).toHaveCSS('margin-left', /^-\d/);

  // The same markup anywhere else in the lesson must be left alone.
  const elsewhere = await page.evaluate(() => {
    const item = document.createElement('li');
    const equation = document.createElement('span');
    equation.className = 'katex-display';
    item.append(equation);
    const list = document.createElement('ul');
    list.append(item);
    document.querySelector('article.prose')?.append(list);
    return getComputedStyle(equation).marginLeft;
  });
  expect(elsewhere).toBe('0px');
});

const LESSON = '/unit-5-kinetics/5-2-rate-law/';

test.describe('display equations at phone and desktop widths', () => {
  for (const width of [320, 412, 445, 1280]) {
    test(`at ${width}px exactly the equations that scroll are focusable, and the page does not`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto(LESSON);
      await page.evaluate(() => document.fonts.ready);

      // Measured after the math fonts are in: that is when an equation's true
      // width is known, and the script has to notice it without a resize.
      const mismatches = () =>
        page.locator('.katex-display').evaluateAll((equations) =>
          equations.flatMap((equation, index) => {
            const scrolls = equation.scrollWidth > equation.clientWidth;
            const focusable = equation.getAttribute('tabindex') === '0';
            return scrolls === focusable ? [] : [`equation ${index}: scrolls=${scrolls}, tabindex=${focusable}`];
          }),
        );
      await expect.poll(mismatches).toEqual([]);

      const pageOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(pageOverflow).toBeLessThanOrEqual(0);
    });
  }

  test('a long equation stays on one line instead of breaking at an operator', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto(LESSON);
    const wrapping = await page
      .locator('.katex-display > .katex')
      .evaluateAll((all) => all.map((el) => getComputedStyle(el).whiteSpace).filter((value) => value !== 'nowrap'));
    expect(wrapping).toEqual([]);
  });
});

test('an answered check still passes in both of its states', async ({ page }) => {
  await page.goto('/unit-5-kinetics/5-2-rate-law/');
  const first = page.locator('cs-check').first();
  const violationsInChecks = async () => {
    const results = await new AxeBuilder({ page })
      .include('cs-check')
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    return results.violations.map((v) => `${v.id}: ${v.help}`);
  };

  await first.locator('.check-option').nth(0).click();
  await expect(first.locator('.check-feedback')).toHaveText('Not quite. Try another.');
  await expect(first.locator('.check-option.is-wrong')).toHaveCount(1);
  expect(await violationsInChecks(), 'after a wrong answer').toEqual([]);

  await first.locator('.check-option').nth(2).click();
  await expect(first.locator('.check-feedback')).toHaveText('Correct.');
  await expect(first.locator('.check-option.is-correct')).toHaveCount(1);
  expect(await violationsInChecks(), 'after the right answer').toEqual([]);
});
