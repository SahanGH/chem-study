import { expect, test } from '@playwright/test';
import { expectStaticDiagram, openDiagram } from './diagram';

const PAGE = '/unit-5-kinetics/5-2-rate-law/';
const NAME = 'rate-law-explorer';
const START = 'rate = k[A]²[B] = 3.2 × 10⁻³ M/s';

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

  await expect(diagram.getByRole('status')).toHaveText('rate = k[A]²[B] = 5.0 × 10⁻³ M/s');
  expect(Number(await bar.getAttribute('width'))).toBeGreaterThan(widthBefore);
});

test('changing an order from the keyboard rewrites the rate law', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await diagram.getByRole('group', { name: 'Order in A' }).getByRole('radio', { checked: true }).focus();
  await page.keyboard.press('ArrowLeft');

  await expect(diagram.getByRole('status')).toHaveText('rate = k[A][B] = 8.0 × 10⁻³ M/s');
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

test.describe('with JavaScript off', () => {
  test.use({ javaScriptEnabled: false });

  test('the rate-law explorer shows its starting values and no controls', async ({ page }) => {
    await expectStaticDiagram(page, PAGE, NAME, START);
  });
});
