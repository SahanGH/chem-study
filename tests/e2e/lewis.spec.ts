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
const RESONANCE_LESSON = '/unit-2-compound-structure/2-6-resonance-and-formal-charge/';
/** Lesson 2.6: the first resonance group is ozone's two structures, with formal charges. */
const OZONE_FIRST = /^First resonance structure of ozone/;
/** Lesson 2.6: carbon dioxide drawn on its own, not in a resonance group. */
const CARBON_DIOXIDE = /^Lewis diagram of carbon dioxide drawn as O=C=O/;

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

test('formal charges are shown when asked for, and only the non-zero ones', async ({ page }) => {
  await page.goto(RESONANCE_LESSON);

  await expect(page.getByRole('img', { name: OZONE_FIRST }).locator('.lewis-charge')).toHaveText(['+1', '−1']);
  await expect(page.getByRole('img', { name: CARBON_DIOXIDE }).locator('.lewis-charge')).toHaveCount(0);
});

test('resonance structures are a labeled group with an arrow between each pair, hidden from screen readers', async ({
  page,
}) => {
  await page.goto(RESONANCE_LESSON);
  const ozone = page.getByRole('group', { name: 'Resonance structures' }).first();

  await expect(ozone.getByRole('img')).toHaveCount(2);
  const arrows = ozone.locator('.lewis-arrow');
  await expect(arrows.first(), 'no arrow before the first structure').toBeHidden();
  await expect(arrows.nth(1)).toBeVisible();
  await expect(arrows.nth(1)).toHaveAttribute('aria-hidden', 'true');
});

test('a Lewis diagram on its own shows no resonance arrow', async ({ page }) => {
  await page.goto(RESONANCE_LESSON);
  const alone = page.getByRole('img', { name: CARBON_DIOXIDE }).locator('xpath=..');

  await expect(alone.locator('.lewis-arrow')).toBeHidden();
});

test('resonance structures sit side by side on a wide screen and wrap on a narrow one', async ({ page }) => {
  const ozone = page.getByRole('group', { name: 'Resonance structures' }).first();
  const tops = async () =>
    Promise.all((await ozone.locator('.lewis-drawing').all()).map(async (d) => (await d.boundingBox())?.y ?? NaN));

  await page.setViewportSize({ width: 1200, height: 800 });
  await page.goto(RESONANCE_LESSON);
  const wide = await tops();
  await page.setViewportSize({ width: 320, height: 800 });
  const narrow = await tops();

  expect(new Set(wide).size, 'one row on a wide screen').toBe(1);
  expect(new Set(narrow).size, 'more than one row on a phone').toBeGreaterThan(1);
});

test('Lewis letters are kept out of the search index', async ({ page }) => {
  await page.goto(IONIC_LESSON);
  await expect(page.locator('.lewis-drawing')).not.toHaveCount(0);

  await expect(page.locator('.lewis-drawing:not([data-pagefind-ignore])')).toHaveCount(0);
});
