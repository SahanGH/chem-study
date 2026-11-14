import { expect, test, type Locator, type Page } from '@playwright/test';
import { expectStaticDiagram, openDiagram } from './diagram';

const PAGE = '/unit-2-compound-structure/2-2-intramolecular-force-and-potential-energy/';
const NAME = 'bond-energy-curve';

// The readout holds "C–C" together with invisible word joiners, so a line
// cannot break after the dash. The sentences here are written without them.
const JOINER = String.fromCharCode(0x2060);
const joined = (text: string) => text.replaceAll('–', `${JOINER}–${JOINER}`);
const atBondLength = (name: string, length: number, energy: number) =>
  joined(
    `The nuclei are ${length} pm apart, the bond length of ${name}. The energy is at its lowest: ${energy} kJ/mol below that of the separate atoms.`,
  );
const START = atBondLength('C–C', 154, 347);

const NUMBER = String.raw`(-?\d+(?:\.\d+)?)`;
const POINT = new RegExp(`[ML]${NUMBER} ${NUMBER}`, 'g');

/** The points of a drawn curve, in drawing units. A larger y is lower on the screen. */
async function pointsOf(curve: Locator): Promise<{ x: number; y: number }[]> {
  const d = (await curve.getAttribute('d')) ?? '';
  const points = [...d.matchAll(POINT)].map((m) => ({ x: Number(m[1]), y: Number(m[2]) }));
  if (points.length < 10) throw new Error(`Not a curve: ${d}`);
  return points;
}

/**
 * Checks that a dot sits on a curve at the curve's lowest drawn point.
 * Points beside the bottom can round to the same height, so "lowest" means
 * no point is lower, not one particular point.
 */
async function expectAtBottom(curve: Locator, dot: { x: number; y: number }) {
  const points = await pointsOf(curve);
  expect(points, 'the dot is on the curve').toContainEqual(dot);
  expect(Math.max(...points.map((p) => p.y)), 'no point of the curve is lower').toBe(dot.y);
}

async function centerOf(circle: Locator) {
  return { x: Number(await circle.getAttribute('cx')), y: Number(await circle.getAttribute('cy')) };
}

/** Where the axis puts a distance, read from its 100 pm and 200 pm ticks. */
async function xOnAxis(diagram: Locator, distance: number): Promise<number> {
  const x100 = Number(await diagram.locator('[data-tick-distance="100"]').getAttribute('x1'));
  const x200 = Number(await diagram.locator('[data-tick-distance="200"]').getAttribute('x1'));
  return x100 + ((distance - 100) * (x200 - x100)) / 100;
}

const selected = (diagram: Locator) => diagram.locator('[data-curve][data-selected]');
const marker = (diagram: Locator) => diagram.locator('[data-marker]');

async function pressTimes(page: Page, key: string, times: number) {
  for (let i = 0; i < times; i++) await page.keyboard.press(key);
}

test('the curve starts with C–C at its bond length, the dot at the bottom of its well', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await expect(diagram.getByRole('status')).toHaveText(START);
  await expect(selected(diagram)).toHaveAttribute('data-curve', 'c-single');
  await expect(diagram.locator('[data-curve]')).toHaveCount(3);
  await expectAtBottom(selected(diagram), await centerOf(marker(diagram)));
});

test('moving the nuclei closer from the keyboard says repulsion wins and moves the dot up the wall', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  const before = await centerOf(marker(diagram));

  await diagram.getByRole('slider').focus();
  await pressTimes(page, 'ArrowLeft', 34);

  await expect(diagram.getByRole('status')).toHaveText(
    'The nuclei are 120 pm apart, closer than the bond length (154 pm). Repulsion now outweighs attraction, and the closer the nuclei go, the more steeply the energy climbs.',
  );
  const after = await centerOf(marker(diagram));
  expect(after.x).toBeLessThan(before.x);
  expect(after.y, 'higher on the screen: more energy').toBeLessThan(before.y);
  // The name is static; the value is announced once, through aria-valuetext.
  await expect(diagram.getByRole('slider')).toHaveAccessibleName('Distance between the nuclei');
  await expect(diagram.getByRole('slider')).toHaveAttribute('aria-valuetext', '120 pm');
});

test('a step past the bond length says the energy is still close to its lowest', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await diagram.getByRole('slider').focus();
  await page.keyboard.press('ArrowRight');

  await expect(diagram.getByRole('status')).toHaveText(
    joined(
      'The nuclei are 155 pm apart, close to the bond length of C–C (154 pm). The energy is close to its lowest value, which is 347 kJ/mol below that of the separate atoms.',
    ),
  );
});

test('moving the atoms apart says they pull back together, and the right atom follows the dot', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await diagram.getByRole('slider').fill('250');

  await expect(diagram.getByRole('status')).toHaveText(
    'The nuclei are 250 pm apart, farther than the bond length (154 pm). The atoms pull back toward each other; far enough apart they no longer interact and the energy is zero.',
  );
  const dot = await centerOf(marker(diagram));
  const atom = await centerOf(diagram.locator('[data-atom="right"]'));
  expect(atom.x).toBe(dot.x);
  expect(dot.x).toBeCloseTo(await xOnAxis(diagram, 250), 0);
});

test('choosing another bond keeps the distance and compares it with the new bond length', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await diagram.getByRole('group', { name: 'Bond' }).getByRole('radio', { name: 'C≡C' }).check();

  await expect(selected(diagram)).toHaveAttribute('data-curve', 'c-triple');
  await expect(diagram.getByRole('status')).toHaveText(
    'The nuclei are 154 pm apart, farther than the bond length (120 pm). The atoms pull back toward each other; far enough apart they no longer interact and the energy is zero.',
  );
});

test('switching to the halogens from the keyboard draws their curves with chlorine at its bond length', async ({
  page,
}) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await diagram.getByRole('group', { name: 'Compare' }).getByRole('radio', { checked: true }).focus();
  await page.keyboard.press('ArrowDown');

  await expect(diagram.getByRole('radio', { name: 'Atom size (halogens)' })).toBeChecked();
  await expect(diagram.getByRole('status')).toHaveText(atBondLength('Cl–Cl', 199, 243));
  await expect(selected(diagram)).toHaveAttribute('data-curve', 'cl');
  await expect(diagram.locator('[data-curve="c-single"]')).toHaveCount(0);
  await expect(diagram.getByRole('group', { name: 'Bond' }).locator('label')).toHaveText(['Cl–Cl', 'Br–Br', 'I–I']);
});

const BONDS = [
  { family: 'Bond order (carbon–carbon)', name: 'C–C', id: 'c-single', length: 154 },
  { family: 'Bond order (carbon–carbon)', name: 'C=C', id: 'c-double', length: 134 },
  { family: 'Bond order (carbon–carbon)', name: 'C≡C', id: 'c-triple', length: 120 },
  { family: 'Atom size (halogens)', name: 'Cl–Cl', id: 'cl', length: 199 },
  { family: 'Atom size (halogens)', name: 'Br–Br', id: 'br', length: 228 },
  { family: 'Atom size (halogens)', name: 'I–I', id: 'i', length: 267 },
];

for (const bond of BONDS) {
  test(`${bond.name}: the bottom of the well is drawn at the bond length, and the dot sits there at that distance`, async ({
    page,
  }) => {
    const diagram = await openDiagram(page, PAGE, NAME);
    await diagram.getByRole('radio', { name: bond.family }).check();
    await diagram.getByRole('group', { name: 'Bond' }).getByRole('radio', { name: bond.name, exact: true }).check();

    await diagram.getByRole('slider').fill(String(bond.length));

    await expect(selected(diagram)).toHaveAttribute('data-curve', bond.id);
    const dot = await centerOf(marker(diagram));
    // Within the rounding of three drawn positions, each to a tenth of a unit.
    expect(Math.abs(dot.x - (await xOnAxis(diagram, bond.length)))).toBeLessThanOrEqual(0.2);
    await expectAtBottom(selected(diagram), dot);
  });
}

for (const bond of BONDS) {
  test(`${bond.name}: at the slider's far end, the right atom lies wholly inside the drawing`, async ({ page }) => {
    const diagram = await openDiagram(page, PAGE, NAME);
    await diagram.getByRole('radio', { name: bond.family }).check();
    await diagram.getByRole('group', { name: 'Bond' }).getByRole('radio', { name: bond.name, exact: true }).check();
    const slider = diagram.getByRole('slider');

    await slider.fill((await slider.getAttribute('max')) ?? '');

    const edges = await diagram.locator('svg').first().evaluate((svg) => {
      if (!(svg instanceof SVGSVGElement)) throw new Error('The diagram is not an SVG.');
      const atom = svg.querySelector('[data-atom="right"]');
      if (!(atom instanceof SVGCircleElement)) throw new Error('There is no right atom circle.');
      const box = atom.getBBox();
      // The outline is drawn half inside and half outside the circle's edge.
      const halfStroke = Number.parseFloat(getComputedStyle(atom).strokeWidth) / 2;
      return {
        left: box.x - halfStroke,
        right: box.x + box.width + halfStroke,
        top: box.y - halfStroke,
        bottom: box.y + box.height + halfStroke,
        view: { width: svg.viewBox.baseVal.width, height: svg.viewBox.baseVal.height },
      };
    });

    expect(edges.left).toBeGreaterThanOrEqual(0);
    expect(edges.top).toBeGreaterThanOrEqual(0);
    expect(edges.right, 'right edge of the atom, with its outline').toBeLessThanOrEqual(edges.view.width);
    expect(edges.bottom).toBeLessThanOrEqual(edges.view.height);
  });
}

for (const bond of BONDS) {
  test(`${bond.name} selected (its name in bold): no curve's name touches a curve`, async ({ page }) => {
    const diagram = await openDiagram(page, PAGE, NAME);
    await diagram.getByRole('radio', { name: bond.family }).check();
    await diagram.getByRole('group', { name: 'Bond' }).getByRole('radio', { name: bond.name, exact: true }).check();
    await expect(selected(diagram)).toHaveAttribute('data-curve', bond.id);
    // The box measured below is the bold one.
    await expect(diagram.locator(`[data-curve-label="${bond.id}"]`)).toHaveCSS('font-weight', '700');

    // Near a steep wall one segment climbs about 30 units, so a label could
    // sit between two drawn points: test points every tenth of each segment.
    const curves = (await Promise.all((await diagram.locator('[data-curve]').all()).map(pointsOf))).map((points) =>
      points.flatMap((p, i) => {
        const next = points[i + 1];
        if (!next) return [p];
        return Array.from({ length: 10 }, (_, k) => ({ x: p.x + ((next.x - p.x) * k) / 10, y: p.y + ((next.y - p.y) * k) / 10 }));
      }),
    );
    const labels = await diagram.locator('[data-curve-label]').evaluateAll((texts) =>
      texts.map((text) => {
        if (!(text instanceof SVGTextElement)) throw new Error('A curve label is not SVG text.');
        const box = text.getBBox();
        return { name: text.textContent, left: box.x, right: box.x + box.width, top: box.y, bottom: box.y + box.height };
      }),
    );

    expect(labels).toHaveLength(3);
    for (const label of labels) {
      const touching = curves.flat().filter((p) => p.x >= label.left - 1 && p.x <= label.right + 1 && p.y >= label.top - 1 && p.y <= label.bottom + 1);
      expect(touching, `${label.name} touches a curve`).toEqual([]);
    }
  });
}

test.describe('with JavaScript off', () => {
  test.use({ javaScriptEnabled: false });

  test('the curves show C–C at its bond length and no controls', async ({ page }) => {
    await expectStaticDiagram(page, PAGE, NAME, START);
  });
});
