import { expect, test, type Locator } from '@playwright/test';
import { expectStaticDiagram, openDiagram } from './diagram';

const PAGE = '/unit-5-kinetics/5-3-concentration-changes-over-time/';
const NAME = 'concentration-plots';
const START = 'For a first-order reaction, ln[A] against time is the straight line. Its slope is −k = −0.020 s⁻¹.';

const POINT = /^(\d+(?:\.\d+)?),(\d+(?:\.\d+)?)$/;

/** The points of a plotted curve, in drawing units. Throws on anything that is not a list of "x,y" pairs. */
async function pointsOf(plot: Locator): Promise<{ x: number; y: number }[]> {
  const attribute = await plot.locator('polyline').getAttribute('points');
  if (attribute === null) throw new Error('The curve has no points attribute.');
  const points = attribute.split(' ').map((pair) => {
    const match = POINT.exec(pair);
    if (!match) throw new Error(`The curve has a point that is not "x,y": "${pair}"`);
    return { x: Number(match[1]), y: Number(match[2]) };
  });
  if (points.length < 3) throw new Error(`The curve has too few points: "${attribute}"`);
  return points;
}

/** How far the middle of a plotted curve sits from the straight line joining its two ends, in drawing units. */
async function bend(plot: Locator): Promise<number> {
  const points = await pointsOf(plot);
  const first = points[0];
  const middle = points[Math.floor(points.length / 2)];
  const last = points[points.length - 1];
  if (!first || !middle || !last) throw new Error('The curve lost its first, middle or last point.');
  if (last.x === first.x) throw new Error('The curve starts and ends at the same x, so it has no slope to compare with.');
  const onTheLine = first.y + ((last.y - first.y) * (middle.x - first.x)) / (last.x - first.x);
  return Math.abs(middle.y - onTheLine);
}

test('the plots start on first order, where ln[A] is the straight line', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await expect(diagram.getByRole('status')).toHaveText(START);
  await expect(diagram.locator('.diagram-plot.is-linear')).toHaveCount(1);
  await expect(diagram.locator('[data-plot="ln"]')).toHaveClass(/is-linear/);
});

test('choosing second order from the keyboard makes 1/[A] the straight line', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await diagram.getByRole('radio', { checked: true }).focus();
  await page.keyboard.press('ArrowRight');

  await expect(diagram.getByRole('status')).toHaveText(
    'For a second-order reaction, 1/[A] against time is the straight line. Its slope is +k = +0.040 M⁻¹ s⁻¹.',
  );
  await expect(diagram.locator('.diagram-plot.is-linear')).toHaveCount(1);
  await expect(diagram.locator('[data-plot="reciprocal"]')).toHaveClass(/is-linear/);
});

test('choosing zero order makes [A] the straight line', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await diagram.getByRole('radio', { name: 'zero' }).check();

  await expect(diagram.getByRole('status')).toHaveText(
    'For a zero-order reaction, [A] against time is the straight line. Its slope is −k = −8.0 × 10⁻³ M/s.',
  );
  await expect(diagram.locator('[data-plot="concentration"]')).toHaveClass(/is-linear/);
});

for (const [order, straight] of [
  ['zero', 'concentration'],
  ['first', 'ln'],
  ['second', 'reciprocal'],
] as const) {
  test(`for ${order} order the plot marked straight is drawn straight and the other two are bent`, async ({ page }) => {
    const diagram = await openDiagram(page, PAGE, NAME);
    await diagram.getByRole('radio', { name: order }).check();
    await expect(diagram.locator(`[data-plot="${straight}"]`)).toHaveClass(/is-linear/);

    for (const kind of ['concentration', 'ln', 'reciprocal']) {
      const offLine = await bend(diagram.locator(`[data-plot="${kind}"]`));
      if (kind === straight) expect(offLine, `${kind} plot`).toBeLessThan(0.5);
      else expect(offLine, `${kind} plot`).toBeGreaterThan(3);
    }
  });
}

/** The height of a plotted curve's last point above the time axis, in drawing units. */
async function endHeight(plot: Locator): Promise<number> {
  const last = (await pointsOf(plot)).at(-1);
  const axis = await plot.locator('.diagram-axis').getAttribute('d');
  const axisY = /V(\d+(?:\.\d+)?)H/.exec(axis ?? '')?.[1];
  if (!last || axisY === undefined) throw new Error(`Could not find where the time axis is drawn: "${axis}"`);
  return Number(axisY) - last.y;
}

for (const order of ['zero', 'first', 'second'] as const) {
  test(`for ${order} order the [A] curve ends above the time axis, because A has not run out`, async ({ page }) => {
    const diagram = await openDiagram(page, PAGE, NAME);

    await diagram.getByRole('radio', { name: order }).check();

    expect(await endHeight(diagram.locator('[data-plot="concentration"]'))).toBeGreaterThan(10);
  });

  test(`for ${order} order the ln[A] curve ends clear of the time axis`, async ({ page }) => {
    const diagram = await openDiagram(page, PAGE, NAME);

    await diagram.getByRole('radio', { name: order }).check();

    expect(await endHeight(diagram.locator('[data-plot="ln"]'))).toBeGreaterThan(10);
  });
}

test('the plots say where they start and how long they run', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await expect(diagram.locator('.diagram-detail')).toHaveText('Every plot starts at [A] = 1.0 M and runs for 100 s.');
});

test.describe('with JavaScript off', () => {
  test.use({ javaScriptEnabled: false });

  test('the plots show first order and no controls', async ({ page }) => {
    await expectStaticDiagram(page, PAGE, NAME, START);
  });
});
