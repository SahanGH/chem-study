import { expect, test, type Page } from '@playwright/test';

// These tests look at diagrams written in the lessons, so they name them as
// the lessons do. If a lesson's alt text or structure changes, change it here.
const ENERGY_LESSON = '/unit-2-compound-structure/2-2-intramolecular-force-and-potential-energy/';
const IONIC_LESSON = '/unit-2-compound-structure/2-3-structure-of-ionic-solids/';
/** Lesson 2.2: H2, one single bond, no lone pairs. */
const HYDROGEN = /^Lewis diagram of hydrogen/;
/** Lesson 2.3: Na+, no dots, in brackets. */
const SODIUM_ION = /^Lewis diagram of the sodium ion/;
/** Lesson 2.3: Cl-, four lone pairs, in brackets. */
const CHLORIDE_ION = /^Lewis diagram of the chloride ion/;
const CHLORIDE_DOTS = 8;

test('a Lewis diagram is one image named by its alt text', async ({ page }) => {
  await page.goto(IONIC_LESSON);

  const chloride = page.getByRole('img', { name: CHLORIDE_ION });

  await expect(chloride).toBeVisible();
  await expect(chloride.locator('text')).toHaveText(['Cl', '−']);
});

test('an ion is drawn in brackets with its charge outside them', async ({ page }) => {
  await page.goto(IONIC_LESSON);
  const sodium = page.getByRole('img', { name: SODIUM_ION });

  const brackets = await sodium.locator('.lewis-bracket').boundingBox();
  const charge = await sodium.locator('text', { hasText: /^\+$/ }).boundingBox();

  if (!brackets || !charge) throw new Error('The ion has no brackets or no charge.');
  expect(charge.x, 'the charge is to the right of the closing bracket').toBeGreaterThan(brackets.x + brackets.width - 1);
  expect(charge.y, 'the charge is in the upper half').toBeLessThan(brackets.y + brackets.height / 2);
});

test('lone pairs are drawn as pairs of dots', async ({ page }) => {
  await page.goto(IONIC_LESSON);

  const chloride = page.getByRole('img', { name: CHLORIDE_ION });

  await expect(chloride.locator('circle')).toHaveCount(CHLORIDE_DOTS);
});

test('a single bond is one line, and a diagram without formal charges shows none', async ({ page }) => {
  await page.goto(ENERGY_LESSON);

  const hydrogen = page.getByRole('img', { name: HYDROGEN });

  await expect(hydrogen.locator('line')).toHaveCount(1);
  await expect(hydrogen.locator('.lewis-charge')).toHaveCount(0);
});

/** The page's text color, and the color of a bond line and a letter in the hydrogen diagram. */
async function hydrogenColors(page: Page) {
  return page.getByRole('img', { name: HYDROGEN }).evaluate((svg) => {
    const line = svg.querySelector('line');
    const letter = svg.querySelector('text');
    if (!line || !letter) throw new Error('The hydrogen diagram has no bond line or no letter.');
    return {
      text: getComputedStyle(document.body).color,
      line: getComputedStyle(line).stroke,
      letter: getComputedStyle(letter).fill,
    };
  });
}

test('a Lewis diagram is drawn in the text color, so it follows the theme', async ({ page }) => {
  await page.goto(ENERGY_LESSON);
  const before = await hydrogenColors(page);

  await page.getByRole('button', { name: /theme/i }).click();
  const after = await hydrogenColors(page);

  expect(after.text, 'the theme changed the text color').not.toBe(before.text);
  expect(new Set(Object.values(before)).size, 'before: all one color').toBe(1);
  expect(new Set(Object.values(after)).size, 'after: all one color').toBe(1);
});

test('Lewis letters are kept out of the search index', async ({ page }) => {
  await page.goto(IONIC_LESSON);
  await expect(page.locator('.lewis-drawing')).not.toHaveCount(0);

  await expect(page.locator('.lewis-drawing:not([data-pagefind-ignore])')).toHaveCount(0);
});
