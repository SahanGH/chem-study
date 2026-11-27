import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator, type Page } from '@playwright/test';
import { describeBox, describeGraph, particles, readout, state as heatingState } from '../../src/lib/heating-curve';
import { expectStaticDiagram, openDiagram } from './diagram';

const PAGE = '/unit-6-thermochemistry/6-5-energy-of-phase-changes/';
const NAME = 'heating-curve';

// Every sentence and number below is written out from the lesson brief's "Diagram data" (one mole,
// 1 atm, the two tables), apart from the module under test. Only the sweeps over every setting
// compare the drawing with the module itself.
const START_READOUT =
  'Ethanol melting at −114.1 °C: 50 percent is liquid. The energy going in is separating molecules, not speeding them up, so the temperature holds. This segment takes 4.9 kJ.';
const ETHANOL_0 =
  'Solid ethanol at −150.0 °C. The energy going in is raising the average kinetic energy of the molecules, so the temperature climbs. This segment takes 2.5 kJ.';
const ETHANOL_1 =
  'Solid ethanol at −135.7 °C. The energy going in is raising the average kinetic energy of the molecules, so the temperature climbs. This segment takes 2.5 kJ.';
const ETHANOL_12 =
  'Liquid ethanol at −73.4 °C. The energy going in is raising the average kinetic energy of the molecules, so the temperature climbs. This segment takes 21.5 kJ.';
const ETHANOL_40 =
  'Ethanol boiling at 78.3 °C: 29 percent is gas. The energy going in is separating molecules, not speeding them up, so the temperature holds. This segment takes 38.6 kJ.';
const ETHANOL_70 =
  'Ethanol gas at 110.0 °C. The energy going in is raising the average kinetic energy of the molecules, so the temperature climbs. Up to the end of the slider, this segment takes 2.4 kJ.';
const IODINE_0 =
  'Solid iodine at 25.0 °C. The energy going in is raising the average kinetic energy of the molecules, so the temperature climbs. This segment takes 4.8 kJ.';
const IODINE_12 =
  'Iodine melting at 113.7 °C: 46 percent is liquid. The energy going in is separating molecules, not speeding them up, so the temperature holds. This segment takes 15.5 kJ.';
const IODINE_40 =
  'Iodine boiling at 184.4 °C: 34 percent is gas. The energy going in is separating molecules, not speeding them up, so the temperature holds. This segment takes 41.6 kJ.';
const IODINE_70 =
  'Iodine gas at 248.6 °C. The energy going in is raising the average kinetic energy of the molecules, so the temperature climbs. Up to the end of the slider, this segment takes 2.4 kJ.';
const CAPTION =
  'One mole of the substance at 1 atm, heated from a solid: ethanol from −150.0 °C, iodine from 25.0 °C. Each molar heat capacity is held constant over its segment, and the value for solid ethanol is approximate. The box shows 20 molecules, not to scale.';

type SubstanceKey = 'ethanol' | 'iodine';
const RADIO: Record<SubstanceKey, string> = { ethanol: 'Ethanol, C₂H₅OH', iodine: 'Iodine, I₂' };

/** Each curve's six corners, [kJ, °C], from the brief's table of segment energies; and its flats. */
const CURVE: Record<SubstanceKey, { corners: [number, number][]; melting: number; boiling: number }> = {
  ethanol: {
    corners: [[0, -150], [2.513, -114.1], [7.443, -114.1], [28.9918, 78.3], [67.5918, 78.3], [70, 110.0]],
    melting: -114.1,
    boiling: 78.3,
  },
  iodine: {
    corners: [[0, 25], [4.82528, 113.7], [20.32528, 113.7], [26.03077, 184.4], [67.63077, 184.4], [70, 248.6]],
    melting: 113.7,
    boiling: 184.4,
  },
};
/** The brief's slopes of the three sloped parts, in °C for each kJ. */
const SLOPES: Record<SubstanceKey, [number, number, number]> = { ethanol: [14.3, 8.9, 13.2], iodine: [18.4, 12.4, 27.1] };

const boxPanel = (diagram: Locator) => diagram.locator('[data-panel="box"]');
const graph = (diagram: Locator) => diagram.locator('[data-panel="graph"]');
const status = (diagram: Locator) => diagram.getByRole('status');
const slider = (diagram: Locator) => diagram.getByRole('slider', { name: 'Energy added', exact: true });
const substanceGroup = (diagram: Locator) => diagram.getByRole('group', { name: 'Substance' });
const substanceRadio = (diagram: Locator, id: SubstanceKey) => substanceGroup(diagram).getByRole('radio', { name: RADIO[id] });
const molecules = (diagram: Locator, phase?: 'solid' | 'liquid' | 'gas') =>
  boxPanel(diagram).locator(phase ? `[data-molecule="${phase}"]` : '[data-molecule]');

/**
 * Chooses a substance and waits until the drawing has changed to it. A radio is checked the moment it is
 * clicked, before the redraw, so its own state proves nothing: the graph's name says what is drawn.
 */
async function chooseSubstance(diagram: Locator, id: SubstanceKey) {
  await substanceRadio(diagram, id).check();
  await expect(graph(diagram).getByRole('img')).toHaveAccessibleName(new RegExp(`for one mole of ${id}\\.`));
}

async function setEnergy(diagram: Locator, energy: number) {
  await slider(diagram).fill(String(energy));
  await expect(slider(diagram)).toHaveAttribute('aria-valuetext', `${energy.toFixed(1)} kJ`);
}

const NUMBER = String.raw`(-?\d+(?:\.\d+)?)`;
const POINT = new RegExp(`[ML]${NUMBER} ${NUMBER}`, 'g');

interface Point {
  x: number;
  y: number;
}

async function numberOf(element: Locator, attribute: string): Promise<number> {
  const value = await element.getAttribute(attribute);
  if (value === null || value === '') throw new Error(`An element has no ${attribute} attribute.`);
  return Number(value);
}

async function pointsOf(path: Locator): Promise<Point[]> {
  const d = (await path.getAttribute('d')) ?? '';
  const points = [...d.matchAll(POINT)].map((m) => ({ x: Number(m[1]), y: Number(m[2]) }));
  if (points.length < 6) throw new Error(`Not a curve of six points: ${d}`);
  return points;
}

/** Where the graph's axes put an energy in kJ (ticks at 0 and 70) and a temperature in °C (ticks at −150 and 250). */
async function axes(diagram: Locator) {
  const x0 = await numberOf(graph(diagram).locator('[data-tick-x="0"]'), 'x1');
  const x70 = await numberOf(graph(diagram).locator('[data-tick-x="70"]'), 'x1');
  const yLow = await numberOf(graph(diagram).locator('[data-tick-y="-150"]'), 'y1');
  const yHigh = await numberOf(graph(diagram).locator('[data-tick-y="250"]'), 'y1');
  return {
    x: (kJ: number) => x0 + (kJ / 70) * (x70 - x0),
    y: (celsius: number) => yLow + ((celsius + 150) / 400) * (yHigh - yLow),
    kJFor: (x: number) => ((x - x0) / (x70 - x0)) * 70,
    celsiusFor: (y: number) => ((y - yLow) / (yHigh - yLow)) * 400 - 150,
  };
}

// Each drawn position is rounded to a tenth of a unit, and so is each tick.
const TOLERANCE = 0.3;
function expectNear(actual: number, expected: number, what: string, tolerance = TOLERANCE) {
  expect(Math.abs(actual - expected), `${what}: ${actual} is not within ${tolerance} of ${expected}`).toBeLessThanOrEqual(tolerance);
}

async function expectCurveFor(diagram: Locator, id: SubstanceKey) {
  const { x, y } = await axes(diagram);
  const drawn = await pointsOf(graph(diagram).locator('[data-curve]'));
  const want = CURVE[id];
  expect(drawn, `${id}: corners drawn`).toHaveLength(6);
  want.corners.forEach(([kJ, celsius], i) => {
    const point = drawn[i];
    if (!point) throw new Error('A point is missing.');
    expectNear(point.x, x(kJ), `${id} corner ${i} x`);
    // The last corner's temperature is shown to a tenth of a degree, which is 0.045 units.
    expectNear(point.y, y(celsius), `${id} corner ${i} y`);
  });
  expectNear(await numberOf(graph(diagram).locator('[data-guide="melting"]'), 'y1'), y(want.melting), `${id} melting guide`);
  expectNear(await numberOf(graph(diagram).locator('[data-guide="boiling"]'), 'y1'), y(want.boiling), `${id} boiling guide`);
}

async function expectMarkerAt(diagram: Locator, kJ: number, celsius: number) {
  const { x, y } = await axes(diagram);
  expectNear(await numberOf(graph(diagram).locator('[data-chosen]'), 'x1'), x(kJ), `the marker line at ${kJ} kJ`);
  const dot = graph(diagram).locator('[data-dot]');
  expectNear(await numberOf(dot, 'cx'), x(kJ), `the dot's x at ${kJ} kJ`);
  expectNear(await numberOf(dot, 'cy'), y(celsius), `the dot's y at ${kJ} kJ`);
}

async function pressTimes(page: Page, key: string, times: number) {
  for (let i = 0; i < times; i++) await page.keyboard.press(key);
}

test('the diagram starts with ethanol at 5.0 kJ, half melted, with its readout, box and graph', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await expect(status(diagram)).toHaveText(START_READOUT);
  await expect(substanceRadio(diagram, 'ethanol')).toBeChecked();
  await expect(substanceRadio(diagram, 'iodine')).not.toBeChecked();
  await expect(slider(diagram)).toHaveAttribute('aria-valuetext', '5.0 kJ');
  await expect(slider(diagram)).toHaveAttribute('min', '0');
  await expect(slider(diagram)).toHaveAttribute('max', '70');
  await expect(slider(diagram)).toHaveAttribute('step', '0.5');
  await expect(diagram.locator('.diagram-slider-value')).toHaveText('5.0 kJ');
  await expect(graph(diagram).locator('[data-axis-label="y"]')).toHaveText('temperature (°C)');
  await expect(graph(diagram).locator('[data-axis-label="x"]')).toHaveText('energy added (kJ)');
  await expect(molecules(diagram, 'solid')).toHaveCount(10);
  await expect(molecules(diagram, 'liquid')).toHaveCount(10);
  await expect(molecules(diagram, 'gas')).toHaveCount(0);
});

test('the substance control is two radio buttons in a group named Substance', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await expect(substanceGroup(diagram).getByRole('radio')).toHaveCount(2);
  await expect(substanceRadio(diagram, 'ethanol')).toBeVisible();
  await expect(substanceRadio(diagram, 'iodine')).toBeVisible();
});

test('the slider works from the keyboard: Home, the arrows and End', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await slider(diagram).focus();
  await page.keyboard.press('Home');
  await expect(slider(diagram)).toHaveAttribute('aria-valuetext', '0.0 kJ');
  await expect(status(diagram)).toHaveText(ETHANOL_0);

  await pressTimes(page, 'ArrowRight', 2);
  await expect(slider(diagram)).toHaveAttribute('aria-valuetext', '1.0 kJ');
  await expect(status(diagram)).toHaveText(ETHANOL_1);

  await pressTimes(page, 'ArrowRight', 22);
  await expect(slider(diagram)).toHaveAttribute('aria-valuetext', '12.0 kJ');
  await expect(status(diagram)).toHaveText(ETHANOL_12);

  await pressTimes(page, 'ArrowLeft', 2);
  await expect(slider(diagram)).toHaveAttribute('aria-valuetext', '11.0 kJ');

  await page.keyboard.press('End');
  await expect(slider(diagram)).toHaveAttribute('aria-valuetext', '70.0 kJ');
  await expect(status(diagram)).toHaveText(ETHANOL_70);
});

test('the substance can be chosen from the keyboard, and the energy added stays where it was', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await substanceRadio(diagram, 'ethanol').focus();
  await page.keyboard.press('ArrowRight');
  await expect(substanceRadio(diagram, 'iodine')).toBeChecked();
  await expect(graph(diagram).getByRole('img')).toHaveAccessibleName(/for one mole of iodine\./);
  await expect(slider(diagram)).toHaveAttribute('aria-valuetext', '5.0 kJ');
  // Iodine at 5.0 kJ: 174.72 J into its melting flat of 15,500 J is 1 percent.
  await expect(status(diagram)).toHaveText(
    'Iodine melting at 113.7 °C: 1 percent is liquid. The energy going in is separating molecules, not speeding them up, so the temperature holds. This segment takes 15.5 kJ.',
  );

  await page.keyboard.press('ArrowLeft');
  await expect(substanceRadio(diagram, 'ethanol')).toBeChecked();
  await expect(status(diagram)).toHaveText(START_READOUT);
});

test('the readout follows the brief at its worked states, for both substances', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  const cases: [SubstanceKey, number, string][] = [
    ['ethanol', 0, ETHANOL_0],
    ['ethanol', 12, ETHANOL_12],
    ['ethanol', 40, ETHANOL_40],
    ['ethanol', 70, ETHANOL_70],
    ['iodine', 0, IODINE_0],
    ['iodine', 12, IODINE_12],
    ['iodine', 40, IODINE_40],
    ['iodine', 70, IODINE_70],
  ];
  for (const [id, energy, sentence] of cases) {
    await chooseSubstance(diagram, id);
    await setEnergy(diagram, energy);
    await expect(status(diagram), `${id} at ${energy} kJ`).toHaveText(sentence);
  }
});

test('the temperatures of the other worked states are in the readout', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  // [substance, kJ, the start of the readout], from the brief's table of worked states.
  const cases: [SubstanceKey, number, string][] = [
    ['ethanol', 26, 'Liquid ethanol at 51.6 °C.'],
    ['ethanol', 29, 'Ethanol boiling at 78.3 °C: less than 1 percent is gas.'],
    ['ethanol', 67.5, 'Ethanol boiling at 78.3 °C: more than 99 percent is gas.'],
    ['ethanol', 68, 'Ethanol gas at 83.7 °C.'],
    ['ethanol', 68.5, 'Ethanol gas at 90.3 °C.'],
    ['iodine', 2.5, 'Solid iodine at 71.0 °C.'],
    ['iodine', 23, 'Liquid iodine at 146.8 °C.'],
    ['iodine', 68, 'Iodine gas at 194.4 °C.'],
  ];
  for (const [id, energy, opening] of cases) {
    await chooseSubstance(diagram, id);
    await setEnergy(diagram, energy);
    await expect(status(diagram), `${id} at ${energy} kJ`).toHaveText(new RegExp(`^${opening.replace(/[.]/g, '\\.')} `));
  }
});

test('the box shows the phases the readout names, in the counts of the percent', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  // [substance, kJ, solid, liquid, gas]: 20 molecules, split by the exact share, at least one of each phase on a flat.
  const cases: [SubstanceKey, number, number, number, number][] = [
    ['ethanol', 0, 20, 0, 0],
    ['ethanol', 5, 10, 10, 0],
    ['ethanol', 12, 0, 20, 0],
    ['ethanol', 29, 0, 19, 1],
    ['ethanol', 40, 0, 14, 6],
    ['ethanol', 67.5, 0, 1, 19],
    ['ethanol', 70, 0, 0, 20],
    ['iodine', 12, 11, 9, 0],
    ['iodine', 40, 0, 13, 7],
  ];
  for (const [id, energy, solid, liquid, gas] of cases) {
    await chooseSubstance(diagram, id);
    await setEnergy(diagram, energy);
    const where = `${id} at ${energy} kJ`;
    await expect(molecules(diagram, 'solid'), where).toHaveCount(solid);
    await expect(molecules(diagram, 'liquid'), where).toHaveCount(liquid);
    await expect(molecules(diagram, 'gas'), where).toHaveCount(gas);
    await expect(molecules(diagram), where).toHaveCount(20);
  }
});

test('every molecule is drawn alike in every phase: the phases differ by where the molecules are', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  await setEnergy(diagram, 5);
  const looks = async () =>
    molecules(diagram).evaluateAll((circles) =>
      circles.map((circle) => {
        const style = getComputedStyle(circle);
        return `${circle.getAttribute('r')} ${style.fill} ${style.stroke} ${style.strokeWidth}`;
      }),
    );
  const atFive = await looks();
  await chooseSubstance(diagram, 'iodine');
  await setEnergy(diagram, 40);
  const atForty = await looks();
  expect(new Set([...atFive, ...atForty]).size, 'one look for every molecule').toBe(1);

  // The solid in rows: five columns of four.
  await chooseSubstance(diagram, 'ethanol');
  await setEnergy(diagram, 0);
  const solid = await molecules(diagram, 'solid').evaluateAll((circles) => circles.map((c) => [c.getAttribute('cx'), c.getAttribute('cy')]));
  expect(new Set(solid.map(([x]) => x)).size).toBe(5);
  expect(new Set(solid.map(([, y]) => y)).size).toBe(4);
});

test('choosing iodine changes the curve, the guides, the box and the readout', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  const before = {
    curve: await graph(diagram).locator('[data-curve]').getAttribute('d'),
    melting: await graph(diagram).locator('[data-guide="melting"]').getAttribute('y1'),
    boiling: await graph(diagram).locator('[data-guide="boiling"]').getAttribute('y1'),
    box: await boxPanel(diagram).getByRole('img').getAttribute('aria-label'),
  };
  await chooseSubstance(diagram, 'iodine');

  expect(await graph(diagram).locator('[data-curve]').getAttribute('d')).not.toBe(before.curve);
  expect(await graph(diagram).locator('[data-guide="melting"]').getAttribute('y1')).not.toBe(before.melting);
  expect(await graph(diagram).locator('[data-guide="boiling"]').getAttribute('y1')).not.toBe(before.boiling);
  expect(await boxPanel(diagram).getByRole('img').getAttribute('aria-label')).not.toBe(before.box);
  await expect(status(diagram)).not.toHaveText(START_READOUT);
});

test('both axes are labeled with their units and ticked from −150 to 250 °C and from 0 to 70 kJ', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  const ticksY = graph(diagram).locator('[data-tick-y]');
  expect(await ticksY.evaluateAll((lines) => lines.map((line) => line.getAttribute('data-tick-y')))).toEqual([
    '-150', '-100', '-50', '0', '50', '100', '150', '200', '250',
  ]);
  const ticksX = graph(diagram).locator('[data-tick-x]');
  expect(await ticksX.evaluateAll((lines) => lines.map((line) => line.getAttribute('data-tick-x')))).toEqual([
    '0', '10', '20', '30', '40', '50', '60', '70',
  ]);
  // The tick labels use a true minus sign.
  await expect(graph(diagram).locator('text', { hasText: '−150' })).toHaveCount(1);
});

for (const id of ['ethanol', 'iodine'] as const) {
  test(`the ${id} curve is drawn from the model, with its guides at its melting and boiling points`, async ({ page }) => {
    const diagram = await openDiagram(page, PAGE, NAME);
    await chooseSubstance(diagram, id);

    await expectCurveFor(diagram, id);
  });

  test(`the ${id} curve has two flats and three slopes as steep as the brief's heat capacities make them`, async ({ page }) => {
    const diagram = await openDiagram(page, PAGE, NAME);
    await chooseSubstance(diagram, id);
    const { kJFor, celsiusFor } = await axes(diagram);
    const drawn = await pointsOf(graph(diagram).locator('[data-curve]'));
    const slopes = drawn.slice(1).map((point, i) => {
      const from = drawn[i];
      if (!from) throw new Error('A point is missing.');
      return (celsiusFor(point.y) - celsiusFor(from.y)) / (kJFor(point.x) - kJFor(from.x));
    });
    const [solid, melting, liquid, boiling, gas] = slopes;
    expect(melting, 'the melting flat').toBe(0);
    expect(boiling, 'the boiling flat').toBe(0);
    const [solidSlope, liquidSlope, gasSlope] = SLOPES[id];
    // The drawing is rounded to a tenth of a unit; the short gas segment makes that a few tenths of °C per kJ.
    expectNear(solid ?? Number.NaN, solidSlope, `${id} solid slope`, 0.4);
    expectNear(liquid ?? Number.NaN, liquidSlope, `${id} liquid slope`, 0.4);
    expectNear(gas ?? Number.NaN, gasSlope, `${id} gas slope`, 1);
  });
}

test("the boiling flat is longer than the melting flat for both substances, and iodine's gas line is the steepest", async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  for (const id of ['ethanol', 'iodine'] as const) {
    await chooseSubstance(diagram, id);
    const drawn = await pointsOf(graph(diagram).locator('[data-curve]'));
    const length = (i: number) => (drawn[i + 1]?.x ?? 0) - (drawn[i]?.x ?? 0);
    expect(length(3), `${id}: boiling flat`).toBeGreaterThan(length(1));
  }
  const drawn = await pointsOf(graph(diagram).locator('[data-curve]'));
  const rise = (i: number) => ((drawn[i]?.y ?? 0) - (drawn[i + 1]?.y ?? 0)) / ((drawn[i + 1]?.x ?? 0) - (drawn[i]?.x ?? 0));
  expect(rise(4), 'gas steeper than solid').toBeGreaterThan(rise(0));
  expect(rise(0), 'solid steeper than liquid').toBeGreaterThan(rise(2));
});

test('the marker sits on the curve at the chosen energy, at the worked states', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  // [kJ, exact °C], from the brief.
  const cases: Record<SubstanceKey, [number, number][]> = {
    ethanol: [[0, -150], [1, -150 + 1000 / 70], [5, -114.1], [12, -114.1 + 4557 / 112], [40, 78.3], [68.5, 90.25], [70, 78.3 + 2408.2 / 76]],
    iodine: [[0, 25], [2.5, 25 + 2500 / 54.4], [12, 113.7], [23, 113.7 + 2674.72 / 80.7], [40, 184.4], [70, 184.4 + 2369.23 / 36.9]],
  };
  let checked = 0;
  for (const id of ['ethanol', 'iodine'] as const) {
    await chooseSubstance(diagram, id);
    for (const [energy, celsius] of cases[id]) {
      await setEnergy(diagram, energy);
      await expectMarkerAt(diagram, energy, celsius);
      checked += 1;
    }
  }
  expect(checked).toBe(13);
});

test('over every setting, the readout, the names of the drawings, the marker and the box are those of the module', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  let states = 0;
  for (const id of ['ethanol', 'iodine'] as const) {
    await chooseSubstance(diagram, id);
    const { x, y } = await axes(diagram);
    for (let halves = 0; halves <= 140; halves++) {
      const energy = halves / 2;
      await setEnergy(diagram, energy);
      const where = `${id} at ${energy} kJ`;
      await expect(status(diagram), where).toHaveText(readout(id, energy));
      await expect(graph(diagram).getByRole('img'), where).toHaveAccessibleName(describeGraph(id, energy));
      await expect(boxPanel(diagram).getByRole('img'), where).toHaveAccessibleName(describeBox(id, energy));
      const dot = graph(diagram).locator('[data-dot]');
      expectNear(await numberOf(dot, 'cx'), x(energy), `${where}: the dot's x`);
      expectNear(await numberOf(dot, 'cy'), y(heatingState(id, energy).temperature), `${where}: the dot's y`);
      const drawn = await molecules(diagram).evaluateAll((circles) =>
        circles.map((c) => ({ phase: c.getAttribute('data-molecule'), x: Number(c.getAttribute('cx')), y: Number(c.getAttribute('cy')) })),
      );
      expect(drawn, `${where}: the box`).toEqual(particles(id, energy).map((m) => ({ phase: m.phase, x: m.x, y: m.y })));
      states += 1;
    }
  }
  expect(states, 'both substances at all 141 energies').toBe(282);
});

test('the guides are named, and differ from the curve by dash pattern and width', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await expect(graph(diagram).locator('[data-guide-name="melting"]')).toHaveText('melting point');
  await expect(graph(diagram).locator('[data-guide-name="boiling"]')).toHaveText('boiling point');
  const style = (selector: string) =>
    graph(diagram)
      .locator(selector)
      .evaluate((element) => ({ dash: getComputedStyle(element).strokeDasharray, width: Number.parseFloat(getComputedStyle(element).strokeWidth) }));
  const curve = await style('[data-curve]');
  const guide = await style('[data-guide="melting"]');
  expect(curve.dash, 'the curve is solid').toBe('none');
  expect(guide.dash, 'the guide is dashed').not.toBe('none');
  expect(curve.width).toBeGreaterThan(guide.width);
});

interface Box {
  name: string;
  left: number;
  right: number;
  top: number;
  bottom: number;
}

/** A label's box in drawing units, from its screen box and the drawing's scale. */
async function labelBox(label: Locator, name: string): Promise<Box> {
  return label.evaluate((element, labelName) => {
    const svg = element.closest('svg');
    if (!svg) throw new Error('A label is outside its drawing.');
    const frame = svg.getBoundingClientRect();
    const scale = svg.viewBox.baseVal.width / frame.width;
    const box = element.getBoundingClientRect();
    return {
      name: labelName,
      left: (box.left - frame.left) * scale,
      right: (box.right - frame.left) * scale,
      top: (box.top - frame.top) * scale,
      bottom: (box.bottom - frame.top) * scale,
    };
  }, name);
}

/** Points along a drawn line, one every unit, so that a label too close to it is found. */
function finePoints(points: Point[]): Point[] {
  const fine: Point[] = [];
  for (let i = 0; i + 1 < points.length; i++) {
    const from = points[i];
    const to = points[i + 1];
    if (!from || !to) throw new Error('A point is missing.');
    const steps = Math.max(1, Math.ceil(Math.hypot(to.x - from.x, to.y - from.y)));
    for (let step = 0; step <= steps; step++) {
      fine.push({ x: from.x + ((to.x - from.x) * step) / steps, y: from.y + ((to.y - from.y) * step) / steps });
    }
  }
  return fine;
}

const near = (box: Box, p: Point, margin: number) =>
  p.x >= box.left - margin && p.x <= box.right + margin && p.y >= box.top - margin && p.y <= box.bottom + margin;
const apart = (one: Box, two: Box) => one.bottom <= two.top || two.bottom <= one.top || one.right <= two.left || two.right <= one.left;
// Half the thickest stroke, and a little more.
const CLEARANCE = 2.5;

for (const id of ['ethanol', 'iodine'] as const) {
  test(`with ${id} no text is cut off, and the guide names touch neither the curve, the guides nor each other`, async ({ page }) => {
    const diagram = await openDiagram(page, PAGE, NAME);
    await page.evaluate(() => document.fonts.ready);
    await chooseSubstance(diagram, id);

    const cutOff = await graph(diagram)
      .locator('svg')
      .evaluate((svg) => {
        const frame = svg.getBoundingClientRect();
        return [...svg.querySelectorAll('text')]
          .filter((text) => {
            const box = text.getBoundingClientRect();
            return box.left < frame.left - 0.5 || box.right > frame.right + 0.5 || box.top < frame.top - 0.5 || box.bottom > frame.bottom + 0.5;
          })
          .map((text) => text.textContent);
      });
    expect(cutOff, 'text outside the drawing').toEqual([]);

    const names = [
      await labelBox(graph(diagram).locator('[data-guide-name="melting"]'), 'melting point'),
      await labelBox(graph(diagram).locator('[data-guide-name="boiling"]'), 'boiling point'),
    ];
    const curve = finePoints(await pointsOf(graph(diagram).locator('[data-curve]')));
    const guideYs = [
      await numberOf(graph(diagram).locator('[data-guide="melting"]'), 'y1'),
      await numberOf(graph(diagram).locator('[data-guide="boiling"]'), 'y1'),
    ];
    const axisLabels = await Promise.all(
      ['x', 'y'].map((axis) => labelBox(graph(diagram).locator(`[data-axis-label="${axis}"]`), `${axis} axis`)),
    );
    for (const box of names) {
      expect(curve.filter((p) => near(box, p, CLEARANCE)), `"${box.name}" touches the curve`).toEqual([]);
      for (const guideY of guideYs) {
        expect(box.bottom + 1 < guideY || box.top - 1 > guideY, `"${box.name}" touches a guide at ${guideY}`).toBe(true);
      }
      for (const axisLabel of axisLabels) expect(apart(box, axisLabel), `"${box.name}" and the ${axisLabel.name} label`).toBe(true);
    }
    const [melting, boiling] = names;
    if (!melting || !boiling) throw new Error('A name is missing.');
    expect(apart(melting, boiling), 'the two names overlap').toBe(true);
  });
}

// The marker line and its dot move over the whole graph, and the two guide names stay where they
// are. The names come last in the drawing, each with a card-colored backing and an outline in the
// same color, so that the marker line is broken cleanly where it crosses a name; and the dot, with
// its stroke, may never come into a name's glyph box or its backing at any energy.
test('the names come after the marker and the dot, each with a backing and a halo, and the dot touches neither at any energy', async ({
  page,
}) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  await page.evaluate(() => document.fonts.ready);
  let states = 0;

  for (const id of ['ethanol', 'iodine'] as const) {
    await chooseSubstance(diagram, id);

    const structure = await graph(diagram)
      .locator('svg')
      .evaluate((svg) => {
        const card = getComputedStyle(svg.closest('.diagram') ?? document.body).backgroundColor;
        const follows = (earlier: Element | null, later: Element | null) =>
          earlier !== null && later !== null && Boolean(earlier.compareDocumentPosition(later) & Node.DOCUMENT_POSITION_FOLLOWING);
        const chosen = svg.querySelector('[data-chosen]');
        const dot = svg.querySelector('[data-dot]');
        return ['melting', 'boiling'].map((kind) => {
          const text = svg.querySelector(`[data-guide-name="${kind}"]`);
          const backing = svg.querySelector(`[data-name-backing="${kind}"]`);
          if (!text || !backing) throw new Error(`The ${kind} name has no text or no backing.`);
          const halo = getComputedStyle(text);
          return {
            kind,
            afterMarker: follows(chosen, text) && follows(dot, text),
            backingBeforeName: backing.nextElementSibling === text,
            backingAfterMarker: follows(chosen, backing) && follows(dot, backing),
            backingFill: getComputedStyle(backing).fill,
            haloStroke: halo.stroke,
            haloWidth: Number.parseFloat(halo.strokeWidth),
            haloOrder: halo.paintOrder,
            card,
          };
        });
      });
    for (const name of structure) {
      const what = `${id} ${name.kind} name`;
      expect(name.afterMarker, `${what} comes after the marker line and the dot`).toBe(true);
      expect(name.backingBeforeName, `${what} has its backing right before it`).toBe(true);
      expect(name.backingAfterMarker, `${what} backing comes after the marker line and the dot`).toBe(true);
      expect(name.backingFill, `${what} backing is card-colored`).toBe(name.card);
      expect(name.haloStroke, `${what} halo is card-colored`).toBe(name.card);
      expect(name.haloWidth, `${what} halo is 3 px`).toBeGreaterThanOrEqual(3);
      expect(name.haloOrder.startsWith('stroke'), `${what} halo is painted under the glyphs`).toBe(true);
    }

    const curve = finePoints(await pointsOf(graph(diagram).locator('[data-curve]')));

    for (let halves = 0; halves <= 140; halves++) {
      const energy = halves / 2;
      await setEnergy(diagram, energy);

      const measured = await graph(diagram)
        .locator('svg')
        .evaluate((svg) => {
          const rectOf = (element: Element) => {
            const [x, y, width, height] = ['x', 'y', 'width', 'height'].map((name) => Number(element.getAttribute(name)));
            return { left: x ?? 0, top: y ?? 0, right: (x ?? 0) + (width ?? 0), bottom: (y ?? 0) + (height ?? 0) };
          };
          const names = ['melting', 'boiling'].map((kind) => {
            const text = svg.querySelector(`[data-guide-name="${kind}"]`);
            const backing = svg.querySelector(`[data-name-backing="${kind}"]`);
            if (!(text instanceof SVGGraphicsElement) || !backing) throw new Error(`The ${kind} name is incomplete.`);
            const size = Number.parseFloat(getComputedStyle(text).fontSize);
            const advance = text.getBBox();
            const baseline = Number(text.getAttribute('y'));
            // The glyphs, not the line box: the capitals reach 0.73 em above the baseline and the descenders 0.21 em below.
            const glyphs = { left: advance.x, right: advance.x + advance.width, top: baseline - 0.73 * size, bottom: baseline + 0.21 * size };
            return { kind, glyphs, backing: rectOf(backing) };
          });
          const dot = svg.querySelector('[data-dot]');
          if (!dot) throw new Error('The dot is missing.');
          const reach = Number(dot.getAttribute('r')) + Number.parseFloat(getComputedStyle(dot).strokeWidth) / 2;
          return { names, dot: { x: Number(dot.getAttribute('cx')), y: Number(dot.getAttribute('cy')), reach } };
        });

      const distance = (dot: { x: number; y: number }, box: { left: number; right: number; top: number; bottom: number }) =>
        Math.hypot(Math.max(box.left - dot.x, 0, dot.x - box.right), Math.max(box.top - dot.y, 0, dot.y - box.bottom));
      for (const name of measured.names) {
        const where = `${id} at ${energy} kJ: the dot and the ${name.kind} name`;
        expect(distance(measured.dot, name.glyphs), `${where}: the dot enters the glyph box`).toBeGreaterThanOrEqual(measured.dot.reach);
        expect(distance(measured.dot, name.backing), `${where}: the dot enters the backing`).toBeGreaterThanOrEqual(measured.dot.reach);
        if (halves === 0) {
          // Once per substance: the backing covers its glyphs and hides no part of the curve.
          const covered = curve.filter(
            (p) => p.x >= name.backing.left && p.x <= name.backing.right && p.y >= name.backing.top && p.y <= name.backing.bottom,
          );
          expect(covered, `${id}: the ${name.kind} backing hides the curve`).toEqual([]);
          expect(name.backing.left, `${id}: the ${name.kind} backing covers its glyphs`).toBeLessThanOrEqual(name.glyphs.left);
          expect(name.backing.right, `${id}: the ${name.kind} backing covers its glyphs`).toBeGreaterThanOrEqual(name.glyphs.right);
          expect(name.backing.top, `${id}: the ${name.kind} backing covers its glyphs`).toBeLessThanOrEqual(name.glyphs.top);
          expect(name.backing.bottom, `${id}: the ${name.kind} backing covers its glyphs`).toBeGreaterThanOrEqual(name.glyphs.bottom);
        }
      }
      states += 1;
    }
  }
  expect(states, 'both substances at all 141 energies').toBe(282);
});

test("each drawing's name says what is drawn now", async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await expect(boxPanel(diagram).getByRole('img')).toHaveAccessibleName(
    'A box of 20 molecules of ethanol: 10 still in the fixed rows of the solid, and 10 in the liquid, touching but out of order.',
  );
  await expect(graph(diagram).getByRole('img')).toHaveAccessibleName(
    /^Graph of temperature, from −150 to 250 °C, against energy added, from 0 to 70 kJ, for one mole of ethanol\./,
  );
  await expect(graph(diagram).getByRole('img')).toHaveAccessibleName(/A marker at 5\.0 kJ is on the melting flat, at −114\.1 °C\.$/);

  await chooseSubstance(diagram, 'iodine');
  await setEnergy(diagram, 40);
  await expect(boxPanel(diagram).getByRole('img')).toHaveAccessibleName(
    'A box of 20 molecules of iodine: 13 in the liquid, touching but out of order, and 7 far apart in the gas.',
  );
  await expect(graph(diagram).getByRole('img')).toHaveAccessibleName(/A marker at 40\.0 kJ is on the boiling flat, at 184\.4 °C\.$/);
});

// A nominal size, not a rendered one: the font size in drawing units, times 320, over the
// drawing's width in units. That is the size of the text when the drawing is shown 320 px
// wide, the ratio of the site's figures (18 on 480).
test("the graph's text is 12 px or more when the drawing itself is shown 320 px wide", async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  const sizes = await graph(diagram)
    .locator('svg')
    .evaluate((svg) => {
      if (!(svg instanceof SVGSVGElement)) throw new Error('The drawing is not an SVG.');
      const unitsWide = svg.viewBox.baseVal.width;
      return [...svg.querySelectorAll('text, tspan')].map((text) => ({
        text: text.textContent,
        pxAt320: (Number.parseFloat(getComputedStyle(text).fontSize) * 320) / unitsWide,
      }));
    });
  // 9 temperature ticks, 8 energy ticks, 2 axis titles and 2 guide names.
  expect(sizes).toHaveLength(21);
  for (const size of sizes) expect(size.pxAt320, `"${size.text}"`).toBeGreaterThanOrEqual(12);
});

// The text as drawn on the screen: its size in drawing units, scaled by how wide the drawing is shown.
// 660 and 680 px are just below and just above the width where the two drawings go side by side.
for (const width of [1280, 680, 660, 412]) {
  test(`on a ${width} px screen the drawn text is 12 px or larger, and the box holds no text`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const diagram = await openDiagram(page, PAGE, NAME);
    await page.evaluate(() => document.fonts.ready);

    const sizes = await graph(diagram)
      .locator('svg')
      .evaluate((svg) => {
        if (!(svg instanceof SVGSVGElement)) throw new Error('The drawing is not an SVG.');
        const scale = svg.getBoundingClientRect().width / svg.viewBox.baseVal.width;
        return [...svg.querySelectorAll('text, tspan')].map((text) => ({
          text: text.textContent,
          px: Number.parseFloat(getComputedStyle(text).fontSize) * scale,
        }));
      });
    expect(sizes).toHaveLength(21);
    for (const size of sizes) expect(size.px, `"${size.text}"`).toBeGreaterThanOrEqual(12);
    await expect(boxPanel(diagram).locator('svg text')).toHaveCount(0);
  });
}

// Side by side only where the graph keeps text of 12 px or more: it is drawn 320 units wide,
// so it needs about 320 px of its own beside the 12rem box.
for (const { width, sideBySide } of [
  { width: 1280, sideBySide: true },
  { width: 680, sideBySide: true },
  { width: 660, sideBySide: false },
  { width: 412, sideBySide: false },
  { width: 320, sideBySide: false },
]) {
  test(`at ${width} px the box and the graph are ${sideBySide ? 'side by side' : 'one above the other'}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const diagram = await openDiagram(page, PAGE, NAME);

    const box = await boxPanel(diagram).boundingBox();
    const plot = await graph(diagram).boundingBox();
    if (!box || !plot) throw new Error('A part has no bounding box.');
    if (sideBySide) {
      expect(plot.x, 'the graph is right of the box').toBeGreaterThanOrEqual(box.x + box.width);
      expect(Math.abs(box.y + box.height / 2 - (plot.y + plot.height / 2)), 'the two are centered on each other').toBeLessThanOrEqual(2);
    } else {
      expect(plot.y, 'the graph is below the box').toBeGreaterThanOrEqual(box.y + box.height);
    }
  });
}

test('the graph is no wider than 22rem and the box no wider than 12rem', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  const diagram = await openDiagram(page, PAGE, NAME);

  const plot = await graph(diagram).boundingBox();
  const box = await boxPanel(diagram).boundingBox();
  if (!plot || !box) throw new Error('A part has no bounding box.');
  expect(plot.width).toBeLessThanOrEqual(22 * 16 + 1);
  expect(box.width).toBeLessThanOrEqual(12 * 16 + 1);
});

test('the order is the box and the graph, the choice of substance and the slider, then the readout', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  const parts = await Promise.all([boxPanel(diagram), graph(diagram), substanceGroup(diagram), slider(diagram), status(diagram)].map((part) => part.boundingBox()));
  const [box, plot, substances, energy, readoutBox] = parts;
  if (!box || !plot || !substances || !energy || !readoutBox) throw new Error('A part of the diagram has no box.');

  const drawingsBottom = Math.max(box.y + box.height, plot.y + plot.height);
  expect(substances.y, 'the choice of substance is under the drawings').toBeGreaterThanOrEqual(drawingsBottom);
  expect(energy.y, 'the slider is under the drawings').toBeGreaterThanOrEqual(drawingsBottom);
  expect(readoutBox.y, 'the readout is under the controls').toBeGreaterThanOrEqual(Math.max(substances.y + substances.height, energy.y + energy.height));
});

// A student moves the slider and watches the marker and the box. On a small phone the drawings and
// the slider must be on the screen together, with the diagram scrolled so that its drawing is at the top.
test('at 320 × 568 the box, the graph and the slider are on the screen together', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  const diagram = await openDiagram(page, PAGE, NAME);
  await boxPanel(diagram).evaluate((element) => {
    window.scrollTo(0, element.getBoundingClientRect().top + window.scrollY - 8);
  });

  const parts = {
    box: await boxPanel(diagram).boundingBox(),
    graph: await graph(diagram).boundingBox(),
    slider: await slider(diagram).boundingBox(),
  };
  for (const [name, part] of Object.entries(parts)) {
    if (!part) throw new Error(`The ${name} has no bounding box.`);
    expect(part.y, `the ${name} starts on the screen`).toBeGreaterThanOrEqual(0);
    expect(part.y + part.height, `the ${name} ends on the screen`).toBeLessThanOrEqual(568);
  }
});

for (const width of [1280, 680, 660, 412, 390, 360, 320]) {
  test(`on a ${width} px screen nothing scrolls sideways and the controls stay inside the diagram`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    const diagram = await openDiagram(page, PAGE, NAME);
    // The longest readout of all 282 settings, found from the module.
    let longest = { id: 'ethanol' as SubstanceKey, energy: 0, text: '' };
    for (const id of ['ethanol', 'iodine'] as const) {
      for (let halves = 0; halves <= 140; halves++) {
        const text = readout(id, halves / 2);
        if (text.length > longest.text.length) longest = { id, energy: halves / 2, text };
      }
    }
    await chooseSubstance(diagram, longest.id);
    await setEnergy(diagram, longest.energy);
    await expect(status(diagram)).toHaveText(longest.text);
    await page.evaluate(() => document.fonts.ready);
    const figure = page.locator('[data-part="diagram"]', { has: diagram });

    const measured = await figure.evaluate((element) => {
      const frame = element.getBoundingClientRect();
      const outside = [...element.querySelectorAll('svg, p, input, label, legend, figcaption')]
        .filter((part) => {
          const box = part.getBoundingClientRect();
          return box.left < frame.left - 0.5 || box.right > frame.right + 0.5;
        })
        .map((part) => part.outerHTML.slice(0, 80));
      return {
        overflow: element.scrollWidth - element.clientWidth,
        pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        outside,
        left: frame.left,
        right: frame.right,
      };
    });

    expect(measured.overflow, 'sideways scrolling inside the diagram').toBeLessThanOrEqual(0);
    expect(measured.pageOverflow, 'sideways scrolling of the page').toBeLessThanOrEqual(0);
    expect(measured.outside, 'parts sticking out of the diagram').toEqual([]);
    expect(measured.left).toBeGreaterThanOrEqual(0);
    expect(measured.right).toBeLessThanOrEqual(width);
  });
}

for (const theme of ['light', 'dark'] as const) {
  test(`the diagram has no accessibility violations in the ${theme} theme, at the start and with iodine boiling`, async ({ page }) => {
    await page.addInitScript((value) => localStorage.setItem('chemstudy:theme', value), theme);
    const diagram = await openDiagram(page, PAGE, NAME);
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    const violations = async () => {
      const results = await new AxeBuilder({ page })
        .include(`[data-diagram="${NAME}"]`)
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();
      return results.violations.map((v) => `${v.id}: ${v.nodes.length} node(s) - ${v.help}`);
    };

    expect(await violations(), 'at the start').toEqual([]);
    await chooseSubstance(diagram, 'iodine');
    await setEnergy(diagram, 40);
    await expect(status(diagram)).toHaveText(IODINE_40);

    expect(await violations(), 'iodine at 40.0 kJ').toEqual([]);
  });
}

test('in print the controls are hidden and the box, the graph and the readout stay', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  await page.emulateMedia({ media: 'print' });

  await expect(diagram.locator('.diagram-controls')).toBeHidden();
  await expect(boxPanel(diagram).getByRole('img')).toBeVisible();
  await expect(graph(diagram).getByRole('img')).toBeVisible();
  await expect(status(diagram)).toHaveText(START_READOUT);
});

test('the caption under the diagram names the amount, the pressure, the starting temperatures and the approximation', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  const caption = page.locator('[data-part="diagram"]', { has: diagram }).locator('> figcaption');

  await expect(caption).toHaveText(CAPTION);
});

test.describe('with JavaScript off', () => {
  test.use({ javaScriptEnabled: false });

  test('the box, the graph and the starting readout show, with no controls', async ({ page }) => {
    await expectStaticDiagram(page, PAGE, NAME, START_READOUT);

    const diagram = page.locator(`[data-diagram="${NAME}"]`);
    await expect(boxPanel(diagram).getByRole('img')).toBeVisible();
    await expect(graph(diagram).getByRole('img')).toBeVisible();
    await expect(molecules(diagram, 'solid')).toHaveCount(10);
    await expect(molecules(diagram, 'liquid')).toHaveCount(10);
    await expectCurveFor(diagram, 'ethanol');
    await expectMarkerAt(diagram, 5, -114.1);
  });
});
