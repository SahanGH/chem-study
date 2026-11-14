import { expect, test } from '@playwright/test';

const ENERGY_LESSON = '/unit-2-compound-structure/2-2-intramolecular-force-and-potential-energy/';
const IONIC_LESSON = '/unit-2-compound-structure/2-3-structure-of-ionic-solids/';

test('a Lewis diagram is one image named by its alt text', async ({ page }) => {
  await page.goto(IONIC_LESSON);

  const chloride = page.getByRole('img', { name: /^Lewis diagram of the chloride ion/ });

  await expect(chloride).toBeVisible();
  await expect(chloride.locator('text')).toHaveText(['Cl', '−']);
});

test('an ion is drawn in brackets with its charge outside them', async ({ page }) => {
  await page.goto(IONIC_LESSON);
  const sodium = page.getByRole('img', { name: /^Lewis diagram of the sodium ion/ });

  const bracket = await sodium.locator('.lewis-bracket').first().boundingBox();
  const charge = await sodium.locator('text', { hasText: /^\+$/ }).boundingBox();

  if (!bracket || !charge) throw new Error('The ion has no brackets or no charge.');
  expect(charge.y).toBeLessThan(bracket.y + bracket.height / 2);
  const brackets = await sodium.locator('.lewis-bracket').all();
  const right = await brackets[brackets.length - 1]?.boundingBox();
  if (!right) throw new Error('The ion has no closing bracket.');
  expect(charge.x).toBeGreaterThan(right.x + right.width - 1);
});

test('a chloride ion shows its eight electrons as four pairs of dots', async ({ page }) => {
  await page.goto(IONIC_LESSON);

  const chloride = page.getByRole('img', { name: /^Lewis diagram of the chloride ion/ });

  await expect(chloride.locator('circle')).toHaveCount(8);
});

test('a single bond is one line, and a diagram without formal charges shows none', async ({ page }) => {
  await page.goto(ENERGY_LESSON);

  const hydrogen = page.getByRole('img', { name: /^Lewis diagram of hydrogen/ });

  await expect(hydrogen.locator('line')).toHaveCount(1);
  await expect(hydrogen.locator('.lewis-charge')).toHaveCount(0);
});

test('a Lewis diagram on its own shows no resonance arrow', async ({ page }) => {
  await page.goto(IONIC_LESSON);
  await expect(page.locator('.lewis:not(.resonance .lewis)')).not.toHaveCount(0);

  await expect(page.locator('.lewis:not(.resonance .lewis) .lewis-arrow:visible')).toHaveCount(0);
});

test('a Lewis diagram is drawn in the text color, so it follows the theme', async ({ page }) => {
  await page.goto(ENERGY_LESSON);
  await page.getByRole('button', { name: /theme/i }).click();
  const hydrogen = page.getByRole('img', { name: /^Lewis diagram of hydrogen/ });

  const colors = await hydrogen.evaluate((svg) => {
    const line = svg.querySelector('line');
    const letter = svg.querySelector('text');
    if (!line || !letter) throw new Error('The hydrogen diagram has no bond line or no letter.');
    return {
      text: getComputedStyle(document.body).color,
      line: getComputedStyle(line).stroke,
      letter: getComputedStyle(letter).fill,
    };
  });

  expect(new Set(Object.values(colors)).size).toBe(1);
});

test('Lewis letters are kept out of the search index', async ({ page }) => {
  await page.goto(IONIC_LESSON);
  await expect(page.locator('.lewis-drawing')).not.toHaveCount(0);

  await expect(page.locator('.lewis-drawing:not([data-pagefind-ignore])')).toHaveCount(0);
});
