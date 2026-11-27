import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator, type Page } from '@playwright/test';
import {
  bars,
  describeBars,
  describeGraph,
  linePoints,
  readout,
  state as freeEnergyState,
  temperatureValueText,
  zeroTemperature,
  type ReactionId,
} from '../../src/lib/free-energy';
import { expectStaticDiagram, openDiagram } from './diagram';

const PAGE = '/unit-9-thermodynamics/9-3-gibbs-free-energy-and-thermodynamic-favorability/';
const NAME = 'free-energy';

// Every sentence and number below is written out from lesson 9.3's brief, "Diagram data" (the
// reactions, the slider, the readout sentences, the worked states and the limits), apart from the
// module under test. Only the sweeps over every setting compare the drawing with the module.
const START_READOUT =
  'Methane with steam at 300 K: ΔH° = +205.9 kJ/mol, −TΔS° = −64.4 kJ/mol, so ΔG° = +141.5 kJ/mol. Thermodynamically unfavored at this temperature. ΔG° is negative above 959 K.';
const METHANE_325 =
  'Methane with steam at 325 K: ΔH° = +205.9 kJ/mol, −TΔS° = −69.8 kJ/mol, so ΔG° = +136.1 kJ/mol. Thermodynamically unfavored at this temperature. ΔG° is negative above 959 K.';
const METHANE_950 =
  'Methane with steam at 950 K: ΔH° = +205.9 kJ/mol, −TΔS° = −204.0 kJ/mol, so ΔG° = +1.9 kJ/mol. Thermodynamically unfavored at this temperature. ΔG° is negative above 959 K.';
const METHANE_975 =
  'Methane with steam at 975 K: ΔH° = +205.9 kJ/mol, −TΔS° = −209.3 kJ/mol, so ΔG° = −3.4 kJ/mol. Thermodynamically favored at this temperature. ΔG° is negative above 959 K.';
const METHANE_200 =
  'Methane with steam at 200 K: ΔH° = +205.9 kJ/mol, −TΔS° = −42.9 kJ/mol, so ΔG° = +163.0 kJ/mol. Thermodynamically unfavored at this temperature. ΔG° is negative above 959 K.';
const METHANE_1400 =
  'Methane with steam at 1,400 K: ΔH° = +205.9 kJ/mol, −TΔS° = −300.6 kJ/mol, so ΔG° = −94.7 kJ/mol. Thermodynamically favored at this temperature. ΔG° is negative above 959 K.';
const METHANOL_300 =
  'Methanol from carbon monoxide at 300 K: ΔH° = −90.5 kJ/mol, −TΔS° = +65.8 kJ/mol, so ΔG° = −24.7 kJ/mol. Thermodynamically favored at this temperature. ΔG° is negative below 413 K.';
const METHANOL_400 =
  'Methanol from carbon monoxide at 400 K: ΔH° = −90.5 kJ/mol, −TΔS° = +87.7 kJ/mol, so ΔG° = −2.8 kJ/mol. Thermodynamically favored at this temperature. ΔG° is negative below 413 K.';
const METHANOL_425 =
  'Methanol from carbon monoxide at 425 K: ΔH° = −90.5 kJ/mol, −TΔS° = +93.2 kJ/mol, so ΔG° = +2.7 kJ/mol. Thermodynamically unfavored at this temperature. ΔG° is negative below 413 K.';
const N2O_300 =
  'Nitrous oxide breaking down at 300 K: ΔH° = −164.1 kJ/mol, −TΔS° = −44.5 kJ/mol, so ΔG° = −208.6 kJ/mol. Thermodynamically favored at this temperature. With these values, ΔG° is negative at every temperature.';
const N2O_1400 =
  'Nitrous oxide breaking down at 1,400 K: ΔH° = −164.1 kJ/mol, −TΔS° = −207.8 kJ/mol, so ΔG° = −371.9 kJ/mol. Thermodynamically favored at this temperature. With these values, ΔG° is negative at every temperature.';
const OZONE_300 =
  'Ozone forming at 300 K: ΔH° = +285.4 kJ/mol, −TΔS° = +41.3 kJ/mol, so ΔG° = +326.7 kJ/mol. Thermodynamically unfavored at this temperature. With these values, ΔG° is positive at every temperature.';
const OZONE_1400 =
  'Ozone forming at 1,400 K: ΔH° = +285.4 kJ/mol, −TΔS° = +192.9 kJ/mol, so ΔG° = +478.3 kJ/mol. Thermodynamically unfavored at this temperature. With these values, ΔG° is positive at every temperature.';
const CAPTION = 'ΔH° and ΔS° are taken as the same at every temperature, and each substance is in the state its equation gives. The slider moves in steps of 25 K.';

const REACTIONS: ReactionId[] = ['nitrous-oxide', 'ozone', 'methane-steam', 'methanol'];
const RADIO: Record<ReactionId, string> = {
  'nitrous-oxide': 'Nitrous oxide breaking down',
  ozone: 'Ozone forming',
  'methane-steam': 'Methane with steam',
  methanol: 'Methanol from carbon monoxide',
};
const EQUATION: Record<ReactionId, string> = {
  'nitrous-oxide': '2N₂O(g) → 2N₂(g) + O₂(g)',
  ozone: '3O₂(g) → 2O₃(g)',
  'methane-steam': 'CH₄(g) + H₂O(g) → CO(g) + 3H₂(g)',
  methanol: 'CO(g) + 2H₂(g) → CH₃OH(g)',
};
const IN_A_SENTENCE: Record<ReactionId, string> = {
  'nitrous-oxide': 'nitrous oxide breaking down',
  ozone: 'ozone forming',
  'methane-steam': 'methane with steam',
  methanol: 'methanol from carbon monoxide',
};
const TEMPERATURES = Array.from({ length: 49 }, (_, i) => 200 + 25 * i);

const graph = (diagram: Locator) => diagram.locator('[data-panel="graph"]');
const barsPanel = (diagram: Locator) => diagram.locator('[data-panel="bars"]');
// A panel's main drawing; the key under the graph holds small SVGs of its own.
const drawing = (panel: Locator) => panel.locator('svg[role="img"]');
const status = (diagram: Locator) => diagram.getByRole('status');
const slider = (diagram: Locator) => diagram.getByRole('slider', { name: 'Temperature', exact: true });
const group = (diagram: Locator) => diagram.getByRole('group', { name: 'Reaction' });
const radio = (diagram: Locator, id: ReactionId) => group(diagram).getByRole('radio', { name: RADIO[id], exact: true });

const kelvins = (t: number) => t.toLocaleString('en-US');

/** Chooses a reaction and waits until the drawing has changed to it: the graph's name says which line is heavy. */
async function chooseReaction(diagram: Locator, id: ReactionId) {
  await radio(diagram, id).check();
  await expect(drawing(graph(diagram))).toHaveAccessibleName(new RegExp(`The line of ${IN_A_SENTENCE[id]} is drawn heavy`));
}

async function setTemperature(diagram: Locator, temperature: number) {
  await slider(diagram).fill(String(temperature));
  await expect(slider(diagram)).toHaveAttribute('aria-valuetext', `${kelvins(temperature)} kelvins`);
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
  if (points.length !== 2) throw new Error(`Not a straight line: ${d}`);
  return points;
}

/** Where the graph's axes put a temperature (ticks at 200 and 1,400 K) and a ΔG° (ticks at −400 and +400 kJ). */
async function axes(diagram: Locator) {
  const x200 = await numberOf(graph(diagram).locator('[data-tick-x="200"]'), 'x1');
  const x1400 = await numberOf(graph(diagram).locator('[data-tick-x="1400"]'), 'x1');
  const yLow = await numberOf(graph(diagram).locator('[data-tick-y="-400"]'), 'y1');
  const yHigh = await numberOf(graph(diagram).locator('[data-tick-y="400"]'), 'y1');
  return {
    x: (t: number) => x200 + ((t - 200) / 1200) * (x1400 - x200),
    y: (kJ: number) => yLow + ((kJ + 400) / 800) * (yHigh - yLow),
    unitsPerKJ: (yLow - yHigh) / 800,
  };
}

// Each drawn position is rounded to a tenth of a unit, and so is each tick.
const TOLERANCE = 0.3;
function expectNear(actual: number, expected: number, what: string, tolerance = TOLERANCE) {
  expect(Math.abs(actual - expected), `${what}: ${actual} is not within ${tolerance} of ${expected}`).toBeLessThanOrEqual(tolerance);
}

async function pressTimes(page: Page, key: string, times: number) {
  for (let i = 0; i < times; i++) await page.keyboard.press(key);
}

test('the diagram starts with methane with steam at 300 K, with its readout, graph and bars', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await expect(status(diagram)).toHaveText(START_READOUT);
  await expect(radio(diagram, 'methane-steam')).toBeChecked();
  for (const id of REACTIONS.filter((r) => r !== 'methane-steam')) await expect(radio(diagram, id)).not.toBeChecked();
  await expect(slider(diagram)).toHaveAttribute('aria-valuetext', '300 kelvins');
  await expect(slider(diagram)).toHaveAttribute('min', '200');
  await expect(slider(diagram)).toHaveAttribute('max', '1400');
  await expect(slider(diagram)).toHaveAttribute('step', '25');
  await expect(slider(diagram)).toHaveValue('300');
  await expect(diagram.locator('.diagram-slider-value')).toHaveText('300 K');
  await expect(graph(diagram).locator('[data-equation]')).toHaveText(EQUATION['methane-steam']);
  await expect(graph(diagram).locator('[data-axis-label="y"]')).toHaveText('ΔG° (kJ/mol)');
  await expect(graph(diagram).locator('[data-axis-label="x"]')).toHaveText('temperature (K)');
  await expect(graph(diagram).locator('[data-favored-label]')).toHaveText('favored');
  await expect(graph(diagram).locator('[data-guide-name]')).toHaveText('959 K');
  await expect(barsPanel(diagram).locator('figcaption')).toHaveText('ΔG° = ΔH° − TΔS°, in kJ/mol');
  await expect(barsPanel(diagram).locator('[data-bar-name]')).toHaveText(['ΔH°', '−TΔS°', 'ΔG°']);
  await expect(barsPanel(diagram).locator('[data-bar-value]')).toHaveText(['+205.9', '−64.4', '+141.5']);
});

test('the choice is a radio group named "Reaction", in the brief’s order, with a name unique to the instance', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  const radios = group(diagram).getByRole('radio');
  await expect(radios).toHaveCount(4);
  for (const [i, id] of REACTIONS.entries()) await expect(radios.nth(i)).toHaveAccessibleName(RADIO[id]);
  expect(await radios.first().getAttribute('name')).toMatch(/^free-energy-.+-reaction$/);
});

test('the slider works from the keyboard: the arrows, Home and End', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await slider(diagram).focus();
  await page.keyboard.press('ArrowRight');
  await expect(slider(diagram)).toHaveAttribute('aria-valuetext', '325 kelvins');
  await expect(diagram.locator('.diagram-slider-value')).toHaveText('325 K');
  await expect(status(diagram)).toHaveText(METHANE_325);

  await pressTimes(page, 'ArrowRight', 25);
  await expect(slider(diagram)).toHaveAttribute('aria-valuetext', '950 kelvins');
  await expect(status(diagram)).toHaveText(METHANE_950);
  await page.keyboard.press('ArrowRight');
  await expect(status(diagram)).toHaveText(METHANE_975);

  await page.keyboard.press('End');
  await expect(slider(diagram)).toHaveAttribute('aria-valuetext', '1,400 kelvins');
  await expect(diagram.locator('.diagram-slider-value')).toHaveText('1,400 K');
  await expect(status(diagram)).toHaveText(METHANE_1400);

  await page.keyboard.press('Home');
  await expect(slider(diagram)).toHaveAttribute('aria-valuetext', '200 kelvins');
  await expect(status(diagram)).toHaveText(METHANE_200);

  await page.keyboard.press('ArrowLeft');
  await expect(slider(diagram)).toHaveAttribute('aria-valuetext', '200 kelvins');
});

test('the reaction can be chosen from the keyboard, and the temperature stays where it was', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  await setTemperature(diagram, 300);

  await radio(diagram, 'methane-steam').focus();
  await page.keyboard.press('ArrowDown');
  await expect(radio(diagram, 'methanol')).toBeChecked();
  await expect(slider(diagram)).toHaveAttribute('aria-valuetext', '300 kelvins');
  await expect(status(diagram)).toHaveText(METHANOL_300);

  await pressTimes(page, 'ArrowUp', 3);
  await expect(radio(diagram, 'nitrous-oxide')).toBeChecked();
  await expect(status(diagram)).toHaveText(N2O_300);

  await page.keyboard.press('ArrowDown');
  await expect(radio(diagram, 'ozone')).toBeChecked();
  await expect(status(diagram)).toHaveText(OZONE_300);
});

test('the readout follows the brief at the states the lesson walks through', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  const cases: [ReactionId, number, string][] = [
    ['methane-steam', 300, START_READOUT],
    ['methane-steam', 950, METHANE_950],
    ['methane-steam', 975, METHANE_975],
    ['methanol', 300, METHANOL_300],
    ['methanol', 400, METHANOL_400],
    ['methanol', 425, METHANOL_425],
    ['nitrous-oxide', 300, N2O_300],
    ['nitrous-oxide', 1400, N2O_1400],
    ['ozone', 300, OZONE_300],
    ['ozone', 1400, OZONE_1400],
  ];
  for (const [id, temperature, sentence] of cases) {
    await chooseReaction(diagram, id);
    await setTemperature(diagram, temperature);
    await expect(status(diagram), `${id} at ${temperature} K`).toHaveText(sentence);
  }
});

test('choosing a reaction changes the equation, the heavy line, the marker, the guide and the bars', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  const dotBefore = await graph(diagram).locator('[data-dot]').getAttribute('cy');

  await chooseReaction(diagram, 'methanol');
  await expect(graph(diagram).locator('[data-equation]')).toHaveText(EQUATION.methanol);
  await expect(graph(diagram).locator('[data-chosen-line]')).toHaveAttribute('data-line', 'methanol');
  expect(await graph(diagram).locator('[data-dot]').getAttribute('cy')).not.toBe(dotBefore);
  await expect(graph(diagram).locator('[data-guide-name]')).toHaveText('413 K');
  await expect(barsPanel(diagram).locator('[data-bar-value]')).toHaveText(['−90.5', '+65.8', '−24.7']);
  await expect(graph(diagram).locator('[data-key="chosen"]')).toHaveText('methanol from carbon monoxide');

  for (const id of ['nitrous-oxide', 'ozone'] as const) {
    await chooseReaction(diagram, id);
    await expect(graph(diagram).locator('[data-equation]')).toHaveText(EQUATION[id]);
    await expect(graph(diagram).locator('[data-guide]')).toHaveCount(0);
    await expect(graph(diagram).locator('[data-guide-name]')).toHaveCount(0);
  }
});

test('both axes are labeled and ticked: −400 to +400 kJ/mol and 200 to 1,400 K', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  const ticksY = graph(diagram).locator('[data-tick-y]');
  expect(await ticksY.evaluateAll((lines) => lines.map((line) => line.getAttribute('data-tick-y')))).toEqual(['-400', '-200', '0', '200', '400']);
  const ticksX = graph(diagram).locator('[data-tick-x]');
  expect(await ticksX.evaluateAll((lines) => lines.map((line) => line.getAttribute('data-tick-x')))).toEqual([
    '200',
    '400',
    '600',
    '800',
    '1000',
    '1200',
    '1400',
  ]);
  const texts = await drawing(graph(diagram)).locator('text').allTextContents();
  for (const label of ['−400', '−200', '0', '+200', '+400', '200', '1,000', '1,400']) expect(texts).toContain(label);
});

test('the four lines are drawn from the module, the chosen one heavy and solid, the others faint and dashed', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  const { x, y } = await axes(diagram);

  // The brief's ends of the four lines, at 200 K and 1,400 K.
  const ends: Record<ReactionId, [number, number]> = {
    'nitrous-oxide': [-193.78, -371.86],
    ozone: [312.96, 478.32],
    'methane-steam': [162.96, -94.68],
    methanol: [-46.66, 216.38],
  };
  for (const id of REACTIONS) {
    const drawn = await pointsOf(graph(diagram).locator(`[data-line="${id}"]`));
    const [start, end] = ends[id];
    expect(linePoints(id).map((p) => p.kJ)).toEqual([start, end]);
    expectNear(drawn[0]?.x ?? Number.NaN, x(200), `${id}: start x`);
    expectNear(drawn[0]?.y ?? Number.NaN, y(start), `${id}: start y`);
    expectNear(drawn[1]?.x ?? Number.NaN, x(1400), `${id}: end x`);
    expectNear(drawn[1]?.y ?? Number.NaN, y(end), `${id}: end y`);
  }
  const style = (selector: string) =>
    graph(diagram)
      .locator(selector)
      .evaluate((element) => {
        const s = getComputedStyle(element);
        return { dash: s.strokeDasharray, width: Number.parseFloat(s.strokeWidth) };
      });
  const chosen = await style('[data-line="methane-steam"]');
  expect(chosen.dash, 'the chosen line is solid').toBe('none');
  for (const id of ['nitrous-oxide', 'ozone', 'methanol']) {
    const faint = await style(`[data-line="${id}"]`);
    expect(faint.dash, `${id} is dashed`).not.toBe('none');
    expect(chosen.width).toBeGreaterThan(faint.width);
  }
  await expect(graph(diagram).locator('[data-key]')).toHaveText(['methane with steam', 'the other three reactions']);
});

test('the zero line is firm, the half below it is hatched and labeled "favored", and the guide stands at 959 K or 413 K', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  const { x, y } = await axes(diagram);

  const zero = graph(diagram).locator('[data-zero]');
  expectNear(await numberOf(zero, 'y1'), y(0), 'the zero line');
  const zeroStyle = await zero.evaluate((element) => {
    const s = getComputedStyle(element);
    return { dash: s.strokeDasharray, width: Number.parseFloat(s.strokeWidth) };
  });
  expect(zeroStyle.dash, 'the zero line is solid').toBe('none');
  expect(zeroStyle.width).toBeGreaterThanOrEqual(1.5);

  const region = graph(diagram).locator('[data-favored-region]');
  expectNear(await numberOf(region, 'y'), y(0), 'the top of the favored half');
  // The plot's foot is −400 kJ, the lowest value on the axis.
  expectNear((await numberOf(region, 'y')) + (await numberOf(region, 'height')), y(-400), 'the bottom of the favored half');
  expectNear(await numberOf(region, 'x'), x(200), 'the left of the favored half');
  expectNear((await numberOf(region, 'x')) + (await numberOf(region, 'width')), x(1400), 'the right of the favored half');
  expect(await region.getAttribute('fill')).toMatch(/^url\(#free-energy-.+-favored-hatch\)$/);
  const hatchId = (await region.getAttribute('fill'))?.slice(5, -1) ?? '';
  await expect(page.locator(`[id="${hatchId}"]`)).toHaveCount(1);
  expect(await numberOf(graph(diagram).locator('[data-favored-label]'), 'y'), 'the label is in the favored half').toBeGreaterThan(y(0));

  for (const [id, exact, text] of [
    ['methane-steam', 2_059_000 / 2_147, '959 K'],
    ['methanol', 905_000 / 2_192, '413 K'],
  ] as const) {
    await chooseReaction(diagram, id);
    expect(zeroTemperature(id)?.exact).toBeCloseTo(exact, 9);
    const guide = graph(diagram).locator('[data-guide]');
    expectNear(await numberOf(guide, 'x1'), x(exact), `${id}: the guide`);
    expectNear(await numberOf(guide, 'x2'), x(exact), `${id}: the guide`);
    expectNear(await numberOf(guide, 'y2'), y(0), `${id}: the guide meets the zero line`);
    await expect(graph(diagram).locator('[data-guide-name]')).toHaveText(text);
    expectNear(await numberOf(graph(diagram).locator('[data-guide-name]'), 'x'), x(exact), `${id}: the guide's value`);
  }
});

test('over all 196 settings, the readout, the names of the drawings, the marker and the bars are those of the module', async ({ page }) => {
  test.setTimeout(240_000);
  const diagram = await openDiagram(page, PAGE, NAME);
  const { x, y, unitsPerKJ } = await axes(diagram);
  const barZero = await numberOf(barsPanel(diagram).locator('[data-bar-zero]'), 'y1');
  let states = 0;
  for (const id of REACTIONS) {
    await chooseReaction(diagram, id);
    await expect(graph(diagram).locator('[data-equation]')).toHaveText(EQUATION[id]);
    for (const temperature of TEMPERATURES) {
      await setTemperature(diagram, temperature);
      const where = `${id} at ${temperature} K`;
      const now = freeEnergyState(id, temperature);
      await expect(status(diagram), where).toHaveText(readout(id, temperature));
      await expect(slider(diagram), where).toHaveAttribute('aria-valuetext', temperatureValueText(temperature));
      await expect(diagram.locator('.diagram-slider-value'), where).toHaveText(`${kelvins(temperature)} K`);
      await expect(drawing(graph(diagram)), where).toHaveAccessibleName(describeGraph(id, temperature));
      await expect(drawing(barsPanel(diagram)), where).toHaveAccessibleName(describeBars(id, temperature));
      const dot = graph(diagram).locator('[data-dot]');
      expectNear(await numberOf(dot, 'cx'), x(temperature), `${where}: the dot's x`);
      expectNear(await numberOf(dot, 'cy'), y(now.freeKJ), `${where}: the dot's y`);
      const rows = bars(id, temperature);
      await expect(barsPanel(diagram).locator('[data-bar-value]'), where).toHaveText(rows.map((r) => r.text));
      for (const row of rows) {
        const rect = barsPanel(diagram).locator(`[data-bar="${row.id}"]`);
        const top = await numberOf(rect, 'y');
        const height = await numberOf(rect, 'height');
        expectNear(height, Math.abs(row.kJ) * unitsPerKJ, `${where}: the ${row.id} bar's length`);
        // A positive term rises from the zero line, a negative one falls from it.
        if (row.kJ > 0) expectNear(top + height, barZero, `${where}: the ${row.id} bar stands on the zero line`);
        else expectNear(top, barZero, `${where}: the ${row.id} bar hangs from the zero line`);
      }
      states += 1;
    }
  }
  expect(states).toBe(196);
});

interface Box {
  name: string;
  left: number;
  right: number;
  top: number;
  bottom: number;
}

/** Every text in a drawing, as a box in drawing units: its whole line box, which errs on the safe side. */
async function textBoxes(panel: Locator): Promise<Box[]> {
  return drawing(panel).evaluate((svg) => {
    if (!(svg instanceof SVGSVGElement)) throw new Error('The drawing is not an SVG.');
    const frame = svg.getBoundingClientRect();
    const scale = svg.viewBox.baseVal.width / frame.width;
    return [...svg.querySelectorAll('text')].map((text) => {
      const box = text.getBoundingClientRect();
      return {
        name: text.textContent ?? '',
        left: (box.left - frame.left) * scale,
        right: (box.right - frame.left) * scale,
        top: (box.top - frame.top) * scale,
        bottom: (box.bottom - frame.top) * scale,
      };
    });
  });
}

/** Points along a drawn line, one every unit, so that a label too close to it is found. */
function finePoints(points: Point[]): Point[] {
  const fine: Point[] = [];
  for (let i = 0; i + 1 < points.length; i++) {
    const from = points[i];
    const to = points[i + 1];
    if (!from || !to) throw new Error('A point is missing.');
    const steps = Math.max(1, Math.ceil(Math.hypot(to.x - from.x, to.y - from.y)));
    for (let step = 0; step <= steps; step++) fine.push({ x: from.x + ((to.x - from.x) * step) / steps, y: from.y + ((to.y - from.y) * step) / steps });
  }
  return fine;
}

async function lineOf(line: Locator): Promise<Point[]> {
  return finePoints([
    { x: await numberOf(line, 'x1'), y: await numberOf(line, 'y1') },
    { x: await numberOf(line, 'x2'), y: await numberOf(line, 'y2') },
  ]);
}

const near = (box: Box, p: Point, margin: number) =>
  p.x >= box.left - margin && p.x <= box.right + margin && p.y >= box.top - margin && p.y <= box.bottom + margin;
const apart = (one: Box, two: Box) => one.bottom <= two.top || two.bottom <= one.top || one.right <= two.left || two.right <= one.left;
// Half the thickest stroke, and a little more.
const CLEARANCE = 2.5;

// "favored" stands in the bottom left of the hatched half, the guide's value above the plot, and the
// lines are named in the key. So no label may meet another, a line, the zero line, the guide or the
// marker, for any reaction at any temperature.
test('at every setting no text is cut off, and no label meets another label, a line, the zero line, the guide or the marker', async ({ page }) => {
  test.setTimeout(240_000);
  const diagram = await openDiagram(page, PAGE, NAME);
  await page.evaluate(() => document.fonts.ready);
  let states = 0;

  for (const id of REACTIONS) {
    await chooseReaction(diagram, id);
    const labels = await textBoxes(graph(diagram));
    // Five values on each axis but seven temperatures, two axis names, "favored", and the guide's value.
    const expected = 5 + 7 + 2 + 1 + (zeroTemperature(id) ? 1 : 0);
    expect(labels, `${id}: the labels`).toHaveLength(expected);
    const frame = await drawing(graph(diagram)).evaluate((svg) =>
      svg instanceof SVGSVGElement ? { width: svg.viewBox.baseVal.width, height: svg.viewBox.baseVal.height } : null,
    );
    if (!frame) throw new Error('The drawing is not an SVG.');
    for (const label of labels) {
      expect(label.left >= -0.5 && label.top >= -0.5 && label.right <= frame.width + 0.5 && label.bottom <= frame.height + 0.5, `"${label.name}" is cut off`).toBe(true);
    }
    for (let i = 0; i < labels.length; i++) {
      for (let j = i + 1; j < labels.length; j++) {
        const [one, two] = [labels[i], labels[j]];
        if (!one || !two) throw new Error('A label is missing.');
        expect(apart(one, two), `${id}: "${one.name}" and "${two.name}" overlap`).toBe(true);
      }
    }

    const lines = await Promise.all(REACTIONS.map(async (r) => finePoints(await pointsOf(graph(diagram).locator(`[data-line="${r}"]`)))));
    const zeroLine = await lineOf(graph(diagram).locator('[data-zero]'));
    const guides = await Promise.all((await graph(diagram).locator('[data-guide]').all()).map(lineOf));
    for (const label of labels) {
      for (const [k, points] of lines.entries()) {
        expect(points.filter((p) => near(label, p, CLEARANCE)), `${id}: "${label.name}" touches the line of ${REACTIONS[k]}`).toEqual([]);
      }
      expect(zeroLine.filter((p) => near(label, p, CLEARANCE)), `${id}: "${label.name}" touches the zero line`).toEqual([]);
      for (const guide of guides) expect(guide.filter((p) => near(label, p, CLEARANCE)), `${id}: "${label.name}" touches the guide`).toEqual([]);
    }

    for (const temperature of TEMPERATURES) {
      await setTemperature(diagram, temperature);
      const where = `${id} at ${temperature} K`;
      const dot = graph(diagram).locator('[data-dot]');
      const reach = (await numberOf(dot, 'r')) + Number.parseFloat(await dot.evaluate((element) => getComputedStyle(element).strokeWidth)) / 2;
      const center = { x: await numberOf(dot, 'cx'), y: await numberOf(dot, 'cy') };
      for (const label of labels) {
        const distance = Math.hypot(Math.max(label.left - center.x, 0, center.x - label.right), Math.max(label.top - center.y, 0, center.y - label.bottom));
        expect(distance, `${where}: the dot touches "${label.name}"`).toBeGreaterThanOrEqual(reach);
      }
      states += 1;
    }
  }
  expect(states).toBe(196);
});

test('in the bars no text is cut off and no label meets another, a bar or the zero line, at any setting', async ({ page }) => {
  test.setTimeout(240_000);
  const diagram = await openDiagram(page, PAGE, NAME);
  await page.evaluate(() => document.fonts.ready);
  const zeroLine = await lineOf(barsPanel(diagram).locator('[data-bar-zero]'));
  for (const id of REACTIONS) {
    await chooseReaction(diagram, id);
    for (const temperature of TEMPERATURES) {
      await setTemperature(diagram, temperature);
      const where = `${id} at ${temperature} K`;
      const labels = await textBoxes(barsPanel(diagram));
      // Three values, three names and the zero line's "0".
      expect(labels).toHaveLength(7);
      for (const label of labels) {
        expect(label.left >= -0.5 && label.right <= 320.5 && label.top >= -0.5 && label.bottom <= 218.5, `${where}: "${label.name}" is cut off`).toBe(true);
      }
      for (let i = 0; i < labels.length; i++) {
        for (let j = i + 1; j < labels.length; j++) {
          const [one, two] = [labels[i], labels[j]];
          if (!one || !two) throw new Error('A label is missing.');
          expect(apart(one, two), `${where}: "${one.name}" and "${two.name}" overlap`).toBe(true);
        }
      }
      const rects = await barsPanel(diagram)
        .locator('[data-bar]')
        .evaluateAll((all) =>
          all.map((r) => {
            const [x, y, w, h] = ['x', 'y', 'width', 'height'].map((a) => Number(r.getAttribute(a)));
            return { name: 'bar', left: x ?? 0, right: (x ?? 0) + (w ?? 0), top: y ?? 0, bottom: (y ?? 0) + (h ?? 0) };
          }),
        );
      for (const label of labels) {
        for (const rect of rects) expect(apart(label, rect), `${where}: "${label.name}" meets a bar`).toBe(true);
        expect(zeroLine.filter((p) => near(label, p, 1)), `${where}: "${label.name}" touches the zero line`).toEqual([]);
      }
    }
  }
});

test("each drawing's name says what is drawn now", async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await expect(drawing(graph(diagram))).toHaveAccessibleName(
    /^Graph of ΔG° against temperature, from 200 K to 1,400 K, on a scale from −400 to \+500 kJ\/mol\. The region below zero is hatched and labeled favored\./,
  );
  await expect(drawing(graph(diagram))).toHaveAccessibleName(
    /It runs from \+163\.0 kJ\/mol at 200 K to −94\.7 kJ\/mol at 1,400 K and crosses zero at 959 K\. A marker at 300 K is on it at \+141\.5 kJ\/mol\.$/,
  );
  await expect(drawing(barsPanel(diagram))).toHaveAccessibleName('Three bars in kJ/mol, rising or falling from a zero line: ΔH°, +205.9; −TΔS°, −64.4; ΔG°, +141.5.');
  await chooseReaction(diagram, 'nitrous-oxide');
  await expect(drawing(graph(diagram))).toHaveAccessibleName(/It runs from −193\.8 kJ\/mol at 200 K to −371\.9 kJ\/mol at 1,400 K and stays below zero\./);
  await chooseReaction(diagram, 'ozone');
  await expect(drawing(graph(diagram))).toHaveAccessibleName(/It runs from \+313\.0 kJ\/mol at 200 K to \+478\.3 kJ\/mol at 1,400 K and stays above zero\./);
});

// A nominal size: the font size in drawing units, times 320, over the drawing's width in units.
test("the drawings' text is 12 px or more when each drawing itself is shown 320 px wide", async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  for (const panel of [graph(diagram), barsPanel(diagram)]) {
    const sizes = await drawing(panel).evaluate((svg) => {
      if (!(svg instanceof SVGSVGElement)) throw new Error('The drawing is not an SVG.');
      const unitsWide = svg.viewBox.baseVal.width;
      return [...svg.querySelectorAll('text, tspan')].map((text) => ({
        text: text.textContent,
        pxAt320: (Number.parseFloat(getComputedStyle(text).fontSize) * 320) / unitsWide,
      }));
    });
    expect(sizes.length).toBeGreaterThan(0);
    for (const size of sizes) expect(size.pxAt320, `"${size.text}"`).toBeGreaterThanOrEqual(12);
  }
});

for (const width of [1280, 680, 412]) {
  test(`on a ${width} px screen the drawn text is 12 px or larger`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const diagram = await openDiagram(page, PAGE, NAME);
    await page.evaluate(() => document.fonts.ready);
    for (const panel of [graph(diagram), barsPanel(diagram)]) {
      const sizes = await drawing(panel).evaluate((svg) => {
        if (!(svg instanceof SVGSVGElement)) throw new Error('The drawing is not an SVG.');
        const scale = svg.getBoundingClientRect().width / svg.viewBox.baseVal.width;
        return [...svg.querySelectorAll('text, tspan')].map((text) => ({ text: text.textContent, px: Number.parseFloat(getComputedStyle(text).fontSize) * scale }));
      });
      for (const size of sizes) expect(size.px, `"${size.text}"`).toBeGreaterThanOrEqual(12);
    }
  });
}

for (const width of [1280, 412, 320]) {
  test(`at ${width} px the graph is above the bars, each no wider than 22rem`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const diagram = await openDiagram(page, PAGE, NAME);
    const plot = await graph(diagram).boundingBox();
    const barBox = await barsPanel(diagram).boundingBox();
    if (!plot || !barBox) throw new Error('A part has no bounding box.');
    expect(barBox.y, 'the bars are below the graph').toBeGreaterThanOrEqual(plot.y + plot.height);
    expect(plot.width).toBeLessThanOrEqual(22 * 16 + 1);
    expect(barBox.width).toBeLessThanOrEqual(22 * 16 + 1);
  });
}

for (const width of [1280, 412, 320]) {
  test(`at ${width} px the order is the graph and the bars, the slider, the choice of reaction, then the readout`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const diagram = await openDiagram(page, PAGE, NAME);

    const parts = await Promise.all([graph(diagram), barsPanel(diagram), slider(diagram), group(diagram), status(diagram)].map((part) => part.boundingBox()));
    const [plot, barBox, temperature, reactions, readoutBox] = parts;
    if (!plot || !barBox || !temperature || !reactions || !readoutBox) throw new Error('A part of the diagram has no box.');
    const drawingsBottom = Math.max(plot.y + plot.height, barBox.y + barBox.height);
    expect(temperature.y, 'the slider is under the drawings').toBeGreaterThanOrEqual(drawingsBottom);
    // The choice spans every column of the controls, so it is on a row of its own under the slider.
    expect(reactions.y, 'the choice of reaction is under the slider').toBeGreaterThanOrEqual(temperature.y + temperature.height);
    expect(readoutBox.y, 'the readout is under the controls').toBeGreaterThanOrEqual(reactions.y + reactions.height);
  });
}

// A student moves the slider and watches the marker. On a small phone the graph and the slider must
// be on the screen together, with the diagram scrolled so that the graph's title is at the top.
test('at 320 × 568 the graph and the slider are on the screen together', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  const diagram = await openDiagram(page, PAGE, NAME);
  // The longest equation and the longest name in the key: the tallest the stack gets.
  for (const id of REACTIONS) {
    await chooseReaction(diagram, id);
    await graph(diagram).evaluate((element) => {
      window.scrollTo(0, element.getBoundingClientRect().top + window.scrollY - 8);
    });
    for (const [name, part] of Object.entries({ graph: await drawing(graph(diagram)).boundingBox(), slider: await slider(diagram).boundingBox() })) {
      if (!part) throw new Error(`The ${name} has no bounding box.`);
      expect(part.y, `${id}: the ${name} starts on the screen`).toBeGreaterThanOrEqual(0);
      expect(part.y + part.height, `${id}: the ${name} ends on the screen`).toBeLessThanOrEqual(568);
    }
  }
});

for (const width of [1280, 680, 412, 390, 360, 320]) {
  test(`on a ${width} px screen nothing scrolls sideways and the controls stay inside the diagram`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    const diagram = await openDiagram(page, PAGE, NAME);
    // The longest readout of all 196 settings, found from the module.
    let longest = { id: 'methane-steam' as ReactionId, temperature: 300, text: '' };
    for (const id of REACTIONS) {
      for (const temperature of TEMPERATURES) {
        const text = readout(id, temperature);
        if (text.length > longest.text.length) longest = { id, temperature, text };
      }
    }
    await chooseReaction(diagram, longest.id);
    await setTemperature(diagram, longest.temperature);
    await expect(status(diagram)).toHaveText(longest.text);
    await page.evaluate(() => document.fonts.ready);
    const figure = page.locator('[data-part="diagram"]', { has: diagram });

    const measured = await figure.evaluate((element) => {
      const frame = element.getBoundingClientRect();
      const outside = [...element.querySelectorAll('svg, p, input, label, legend, li, figcaption')]
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
  test(`the diagram has no accessibility violations in the ${theme} theme, at the start and with methanol at 400 K`, async ({ page }) => {
    await page.addInitScript((value) => localStorage.setItem('chemstudy:theme', value), theme);
    const diagram = await openDiagram(page, PAGE, NAME);
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    const violations = async () => {
      const results = await new AxeBuilder({ page }).include(`[data-diagram="${NAME}"]`).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      return results.violations.map((v) => `${v.id}: ${v.nodes.length} node(s) - ${v.help}`);
    };
    expect(await violations(), 'at the start').toEqual([]);
    await chooseReaction(diagram, 'methanol');
    await setTemperature(diagram, 400);
    expect(await violations(), 'methanol at 400 K').toEqual([]);
  });
}

test('in print the controls are hidden and the graph, the bars and the readout stay', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  await page.emulateMedia({ media: 'print' });

  await expect(diagram.locator('.diagram-controls')).toBeHidden();
  await expect(drawing(graph(diagram))).toBeVisible();
  await expect(drawing(barsPanel(diagram))).toBeVisible();
  await expect(status(diagram)).toHaveText(START_READOUT);
});

test('the caption says what is taken as fixed and how the slider moves', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  await expect(page.locator('[data-part="diagram"]', { has: diagram }).locator('> figcaption')).toHaveText(CAPTION);
});

test.describe('with JavaScript off', () => {
  test.use({ javaScriptEnabled: false });

  test('the graph, the bars and the starting readout show, with no controls', async ({ page }) => {
    await expectStaticDiagram(page, PAGE, NAME, START_READOUT);

    const diagram = page.locator(`[data-diagram="${NAME}"]`);
    await expect(drawing(graph(diagram))).toBeVisible();
    await expect(drawing(barsPanel(diagram))).toBeVisible();
    await expect(graph(diagram).locator('[data-chosen-line]')).toHaveAttribute('data-line', 'methane-steam');
    await expect(graph(diagram).locator('[data-guide-name]')).toHaveText('959 K');
    await expect(barsPanel(diagram).locator('[data-bar-value]')).toHaveText(['+205.9', '−64.4', '+141.5']);
    const { x, y } = await axes(diagram);
    expectNear(await numberOf(graph(diagram).locator('[data-dot]'), 'cx'), x(300), "the dot's x");
    expectNear(await numberOf(graph(diagram).locator('[data-dot]'), 'cy'), y(141.49), "the dot's y");
  });
});
