import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const WIDTHS = [320, 360, 390, 412];

async function pageOverflow(page: Page): Promise<number> {
  return page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
}

/** Scans the page named by its heading, so a 404 page cannot pass for the real one. */
async function expectNoViolations(page: Page, theme: 'light' | 'dark', path: string, heading: string) {
  await page.addInitScript((value) => localStorage.setItem('chemstudy:theme', value), theme);
  await page.goto(path);
  await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(results.violations.map((v) => `${v.id}: ${v.nodes.length} node(s) - ${v.help}`)).toEqual([]);
}

test.describe('the periodic table page', () => {
  const PATH = '/tools/periodic-table/';
  const cell = (page: Page, symbol: string) => page.locator(`.ptable li[data-symbol="${symbol}"]`);
  const scrollBox = (page: Page) => page.getByRole('region', { name: 'Periodic table of the elements' });

  test('has a heading, a title and a description', async ({ page }) => {
    await page.goto(PATH);

    await expect(page.getByRole('heading', { level: 1, name: 'Periodic table' })).toBeVisible();
    await expect(page).toHaveTitle('Periodic table: ChemStudy');
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      'content',
      'The periodic table with the atomic masses the AP Chemistry exam provides, and a list of all 118 elements by name.',
    );
  });

  test('has one cell for each of the 118 elements', async ({ page }) => {
    await page.goto(PATH);

    await expect(page.locator('.ptable li[data-symbol]')).toHaveCount(118);
  });

  test('shows hydrogen as its name (hidden), 1, H and 1.008', async ({ page }) => {
    await page.goto(PATH);
    const hydrogen = cell(page, 'H');

    await expect(hydrogen).toContainText('Hydrogen');
    await expect(hydrogen.locator('.ptable-z')).toHaveText('1');
    await expect(hydrogen.locator('.ptable-symbol')).toHaveText('H');
    await expect(hydrogen.locator('.ptable-mass')).toHaveText('1.008');
    // The name is for a screen reader only.
    await expect(hydrogen.getByText('Hydrogen')).toHaveClass(/visually-hidden/);
  });

  test("shows lead's mass as 207.2", async ({ page }) => {
    await page.goto(PATH);

    await expect(cell(page, 'Pb').locator('.ptable-mass')).toHaveText('207.2');
  });

  test('shows technetium with no mass, and says so to a screen reader', async ({ page }) => {
    await page.goto(PATH);
    const technetium = cell(page, 'Tc');

    await expect(technetium.locator('.ptable-mass')).toHaveCount(0);
    await expect(technetium).toContainText('no mass given');
    await expect(technetium.getByText('no mass given')).toHaveClass(/visually-hidden/);
  });

  test('sets lanthanum in the lower block and hafnium after barium in the main table', async ({ page }) => {
    await page.goto(PATH);

    await expect(cell(page, 'La')).toHaveCSS('grid-row-start', '9');
    await expect(cell(page, 'Hf')).toHaveCSS('grid-row-start', '6');
    await expect(cell(page, 'Hf')).toHaveCSS('grid-column-start', '4');
    await expect(cell(page, 'Ba')).toHaveCSS('grid-column-start', '2');
  });

  test('labels the two series in the gaps of rows 6 and 7, and hides the labels from a screen reader', async ({ page }) => {
    await page.goto(PATH);

    const lanthanoids = page.locator('.ptable [aria-hidden="true"]', { hasText: '57–71' });
    const actinoids = page.locator('.ptable [aria-hidden="true"]', { hasText: '89–103' });
    await expect(lanthanoids).toHaveCSS('grid-row-start', '6');
    await expect(lanthanoids).toHaveCSS('grid-column-start', '3');
    await expect(actinoids).toHaveCSS('grid-row-start', '7');
    await expect(actinoids).toHaveCSS('grid-column-start', '3');
  });

  test('numbers the groups 1 to 18 above the table, hidden from a screen reader', async ({ page }) => {
    await page.goto(PATH);

    const numbers = page.locator('.ptable .ptable-group[aria-hidden="true"]');
    await expect(numbers).toHaveText(Array.from({ length: 18 }, (_, i) => String(i + 1)));
  });

  test('has a key for the four blocks that says which columns each covers', async ({ page }) => {
    await page.goto(PATH);
    const key = page.getByRole('list', { name: 'Key to the blocks' });

    await expect(key.getByRole('listitem')).toHaveText([
      's block: groups 1 and 2, and helium',
      'p block: groups 13 to 18, except helium',
      'd block: groups 3 to 12',
      'f block: the two rows below. Each of those rows also holds one element of the d block',
    ]);
  });

  test('tints each block differently, so a block can be told from a neighbor', async ({ page }) => {
    await page.goto(PATH);

    const tint = (symbol: string) => cell(page, symbol).evaluate((el) => getComputedStyle(el).backgroundColor);
    const tints = await Promise.all([tint('Na'), tint('Cl'), tint('Fe'), tint('Ce')]);

    expect(new Set(tints).size).toBe(4);
  });

  test('lists all 118 elements by name in alphabetical order', async ({ page }) => {
    await page.goto(PATH);
    await expect(page.getByRole('heading', { level: 2, name: 'Elements by name' })).toBeVisible();
    const rows = page.locator('table.elements-by-name tbody tr');

    await expect(rows).toHaveCount(118);
    await expect(rows.first().locator('th, td').first()).toHaveText('Actinium');
    await expect(rows.last().locator('th, td').first()).toHaveText('Zirconium');
  });

  test('gives sulfur as Sulfur, S, 16 and 32.06 in the name list', async ({ page }) => {
    await page.goto(PATH);
    const row = page.locator('table.elements-by-name tbody tr', { has: page.getByText('Sulfur', { exact: true }) });

    await expect(row.locator('th, td')).toHaveText(['Sulfur', 'S', '16', '32.06']);
  });

  test('marks a missing mass in the name list with a dash and a spoken "no mass given"', async ({ page }) => {
    await page.goto(PATH);
    const row = page.locator('table.elements-by-name tbody tr', { has: page.getByText('Technetium', { exact: true }) });

    await expect(row.locator('td').last()).toContainText('—');
    await expect(row.locator('td').last().getByText('no mass given')).toHaveClass(/visually-hidden/);
  });

  test('says in the name list column heads what each column is', async ({ page }) => {
    await page.goto(PATH);

    await expect(page.locator('table.elements-by-name thead th')).toHaveText([
      'Name',
      'Symbol',
      'Atomic number',
      'Atomic mass',
    ]);
  });

  for (const width of WIDTHS) {
    test(`does not scroll sideways at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto(PATH);
      await expect(page.locator('.ptable li[data-symbol]')).toHaveCount(118);
      await page.evaluate(() => document.fonts.ready);

      expect(await pageOverflow(page)).toBeLessThanOrEqual(0);
    });
  }

  test('at 320px the name list fits its space, so its last column is not cut off', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto(PATH);
    await expect(page.locator('table.elements-by-name tbody tr')).toHaveCount(118);
    await page.evaluate(() => document.fonts.ready);

    const sizes = await page
      .locator('table.elements-by-name')
      .evaluate((el) => ({ scroll: el.scrollWidth, client: el.clientWidth }));
    expect(sizes.scroll).toBeLessThanOrEqual(sizes.client);
  });

  test('at 320px the table scrolls inside its own box, which takes focus and the arrow keys', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto(PATH);
    await page.evaluate(() => document.fonts.ready);
    const box = scrollBox(page);

    const sizes = await box.evaluate((el) => ({ scroll: el.scrollWidth, client: el.clientWidth }));
    expect(sizes.scroll).toBeGreaterThan(sizes.client);
    await expect(box).toHaveAttribute('tabindex', '0');
    await box.focus();
    await expect(box).toBeFocused();
    for (let press = 0; press < 5; press += 1) await page.keyboard.press('ArrowRight');
    await expect.poll(() => box.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
  });

  test('at 320px no text spills out of its cell', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto(PATH);
    await expect(page.locator('.ptable li[data-symbol]')).toHaveCount(118);
    await page.evaluate(() => document.fonts.ready);

    const spilling = await page.locator('.ptable li[data-symbol]').evaluateAll((cells) =>
      cells.flatMap((el) => {
        const parts = Array.from(el.querySelectorAll<HTMLElement>('.ptable-z, .ptable-symbol, .ptable-mass'));
        const wide = parts.filter((part) => part.scrollWidth > part.clientWidth || part.scrollWidth > el.clientWidth);
        return wide.length > 0 || el.scrollWidth > el.clientWidth ? [el.getAttribute('data-symbol')] : [];
      }),
    );
    expect(spilling).toEqual([]);
  });

  test('keeps cell text at 12px or larger', async ({ page }) => {
    await page.goto(PATH);

    const sizes = await page
      .locator('.ptable-z, .ptable-symbol, .ptable-mass')
      .evaluateAll((parts) => parts.map((part) => parseFloat(getComputedStyle(part).fontSize)));
    // 118 cells, each with a number and a symbol; 84 of them with a mass.
    expect(sizes).toHaveLength(118 * 2 + 84);
    expect(Math.min(...sizes)).toBeGreaterThanOrEqual(12);
  });

  test('at 1280px the table fits its box without scrolling', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(PATH);
    await page.evaluate(() => document.fonts.ready);

    const sizes = await scrollBox(page).evaluate((el) => ({ scroll: el.scrollWidth, client: el.clientWidth }));
    expect(sizes.scroll).toBeLessThanOrEqual(sizes.client);
  });

  test('on paper the box does not clip and the table shrinks to the page', async ({ page }) => {
    await page.setViewportSize({ width: 700, height: 900 });
    await page.emulateMedia({ media: 'print' });
    await page.goto(PATH);
    await page.evaluate(() => document.fonts.ready);

    await expect(scrollBox(page)).toHaveCSS('overflow-x', 'visible');
    const sizes = await scrollBox(page).evaluate((el) => ({ scroll: el.scrollWidth, client: el.clientWidth }));
    expect(sizes.scroll).toBeLessThanOrEqual(sizes.client);
    expect(await pageOverflow(page)).toBeLessThanOrEqual(0);
  });

  for (const theme of ['light', 'dark'] as const) {
    test(`has no accessibility violations in the ${theme} theme`, async ({ page }) => {
      await expectNoViolations(page, theme, PATH, 'Periodic table');
    });
  }

  test('is found by searching the site for "zirconium"', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Search' }).click();
    await page.locator('.pagefind-ui__search-input').fill('zirconium');

    await expect(page.locator('.pagefind-ui__result-link[href*="/tools/periodic-table/"]').first()).toBeVisible();
  });

  test.describe('with JavaScript off', () => {
    test.use({ javaScriptEnabled: false });

    test('reads the same: the table, the key and the name list', async ({ page }) => {
      await page.goto(PATH);

      await expect(page.getByRole('heading', { level: 1, name: 'Periodic table' })).toBeVisible();
      await expect(page.locator('.ptable li[data-symbol]')).toHaveCount(118);
      await expect(cell(page, 'H').locator('.ptable-mass')).toHaveText('1.008');
      await expect(page.locator('table.elements-by-name tbody tr')).toHaveCount(118);
      await expect(page.getByRole('list', { name: 'Key to the blocks' })).toBeVisible();
    });
  });
});
