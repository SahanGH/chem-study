import { expect, test } from '@playwright/test';
import { expectStaticDiagram, openDiagram } from './diagram';

const PAGE = '/unit-5-kinetics/5-2-rate-law/';
const NAME = 'rate-law-explorer';
const START = 'rate = k[A]²[B] = 0.010 M/s';

test('the rate-law explorer starts second order in A and first order in B', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await expect(diagram.getByRole('status')).toHaveText(START);
});

test('raising a concentration from the keyboard raises the rate and the bar', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  const bar = diagram.locator('.diagram-bar');
  const widthBefore = Number(await bar.getAttribute('width'));

  await diagram.getByRole('slider', { name: /^\[A\]/ }).focus();
  await page.keyboard.press('ArrowRight');

  await expect(diagram.getByRole('status')).toHaveText('rate = k[A]²[B] = 0.014 M/s');
  expect(Number(await bar.getAttribute('width'))).toBeGreaterThan(widthBefore);
});

test('changing an order from the keyboard rewrites the rate law', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await diagram.getByRole('group', { name: 'Order in A' }).getByRole('radio', { checked: true }).focus();
  await page.keyboard.press('ArrowLeft');

  await expect(diagram.getByRole('status')).toHaveText('rate = k[A][B] = 0.020 M/s');
});

test('a reactant that is zero order drops out of the rate law', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await diagram.getByRole('group', { name: 'Order in A' }).getByRole('radio', { name: '0' }).check();
  await diagram.getByRole('group', { name: 'Order in B' }).getByRole('radio', { name: '0' }).check();

  await expect(diagram.getByRole('status')).toHaveText('rate = k = 0.10 M/s');
});

test('the explorer says what doubling each concentration does', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await expect(diagram.locator('.diagram-detail')).toContainText('Doubling [A] multiplies the rate by 4.');
  await expect(diagram.locator('.diagram-detail')).toContainText('Doubling [B] doubles the rate.');
});

test('the bar stays in proportion to the rate, even when the rate is tiny', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  const bar = diagram.locator('.diagram-bar');
  await diagram.getByRole('slider', { name: /^\[A\]/ }).fill('0.1');
  await diagram.getByRole('slider', { name: /^\[B\]/ }).fill('0.1');
  await expect(diagram.getByRole('status')).toHaveText('rate = k[A]²[B] = 1.0 × 10⁻⁴ M/s');
  const tiny = Number(await bar.getAttribute('width'));

  await diagram.getByRole('slider', { name: /^\[B\]/ }).fill('0.2');

  await expect(diagram.getByRole('status')).toHaveText('rate = k[A]²[B] = 2.0 × 10⁻⁴ M/s');
  const doubled = Number(await bar.getAttribute('width'));
  expect(tiny).toBeGreaterThan(0);
  expect(doubled / tiny).toBeCloseTo(2, 5);
});

test('the lesson below the explorer does not move when its controls wake up', async ({ page }) => {
  await page.goto(PAGE);
  const body = page.locator(`[data-diagram="${NAME}"]`);
  const figure = page.locator('[data-part="diagram"]', { has: body });
  // Still below the fold, so its script has not loaded yet.
  await expect(body).not.toHaveAttribute('data-hydrated');
  const heightBefore = await figure.evaluate((element) => element.getBoundingClientRect().height);

  await body.scrollIntoViewIfNeeded();
  await expect(body).toHaveAttribute('data-hydrated', 'true');

  const heightAfter = await figure.evaluate((element) => element.getBoundingClientRect().height);
  expect(heightAfter).toBeCloseTo(heightBefore, 0);
});

test.describe('with JavaScript off', () => {
  test.use({ javaScriptEnabled: false });

  test('the rate-law explorer shows its starting values and no controls', async ({ page }) => {
    await expectStaticDiagram(page, PAGE, NAME, START);
  });
});
