import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator, type Page } from '@playwright/test';
import {
  describeBox,
  describeGraph,
  freeEnergyValueText,
  linePoints,
  particles,
  readout,
  state as gibbsState,
  type Kelvins,
} from '../../src/lib/gibbs-and-k';
import { expectStaticDiagram, openDiagram } from './diagram';

const PAGE = '/unit-9-thermodynamics/9-5-free-energy-and-equilibrium/';
const NAME = 'gibbs-and-k';

// Every sentence and number below is written out from lesson 9.5's brief, "Diagram data" (the
// controls, the readout sentences, the worked states and the limits), apart from the module under
// test. Only the sweeps over every setting compare the drawing with the module.
const START_READOUT =
  'ΔG° = −5 kJ/mol at 298 K. RT is 2.48 kJ/mol, so ΔG° is 2.0 times RT below zero. K = 7.5. At equilibrium about 88 of every 100 particles are B.';
const MINUS_4 =
  'ΔG° = −4 kJ/mol at 298 K. RT is 2.48 kJ/mol, so ΔG° is 1.6 times RT below zero. K = 5.0. At equilibrium about 83 of every 100 particles are B.';
const ZERO_298 = 'ΔG° = 0 kJ/mol at 298 K. RT is 2.48 kJ/mol. K = 1.0. At equilibrium about 50 of every 100 particles are B.';
const PLUS_5 =
  'ΔG° = +5 kJ/mol at 298 K. RT is 2.48 kJ/mol, so ΔG° is 2.0 times RT above zero. K = 0.13. At equilibrium about 12 of every 100 particles are B.';
const MINUS_6 =
  'ΔG° = −6 kJ/mol at 298 K. RT is 2.48 kJ/mol, so ΔG° is 2.4 times RT below zero. K = 11. At equilibrium about 92 of every 100 particles are B.';
const MINUS_11 =
  'ΔG° = −11 kJ/mol at 298 K. RT is 2.48 kJ/mol, so ΔG° is 4.4 times RT below zero. K = 85. At equilibrium about 99 of every 100 particles are B.';
const MINUS_17 =
  'ΔG° = −17 kJ/mol at 298 K. RT is 2.48 kJ/mol, so ΔG° is 6.9 times RT below zero. K = 950. At equilibrium fewer than 1 in 100 particles is A.';
const MINUS_40_298 =
  'ΔG° = −40 kJ/mol at 298 K. RT is 2.48 kJ/mol, so ΔG° is 16 times RT below zero. K = 1.0 × 10⁷. At equilibrium fewer than 1 in 100 particles is A.';
const MINUS_40_500 =
  'ΔG° = −40 kJ/mol at 500 K. RT is 4.16 kJ/mol, so ΔG° is 9.6 times RT below zero. K = 1.5 × 10⁴. At equilibrium fewer than 1 in 100 particles is A.';
const MINUS_40_1000 =
  'ΔG° = −40 kJ/mol at 1,000 K. RT is 8.31 kJ/mol, so ΔG° is 4.8 times RT below zero. K = 120. At equilibrium about 99 of every 100 particles are B.';
const PLUS_40_298 =
  'ΔG° = +40 kJ/mol at 298 K. RT is 2.48 kJ/mol, so ΔG° is 16 times RT above zero. K = 9.7 × 10⁻⁸. At equilibrium fewer than 1 in 100 particles is B.';
const PLUS_13_298 =
  'ΔG° = +13 kJ/mol at 298 K. RT is 2.48 kJ/mol, so ΔG° is 5.2 times RT above zero. K = 5.3 × 10⁻³. At equilibrium about 1 of every 100 particles is B.';
const MINUS_5_500 =
  'ΔG° = −5 kJ/mol at 500 K. RT is 4.16 kJ/mol, so ΔG° is 1.2 times RT below zero. K = 3.3. At equilibrium about 77 of every 100 particles are B.';
const CAPTION =
  'The reaction A(g) ⇌ B(g) is made up. For a real reaction ΔG° itself changes with temperature (topic 9.3). The box shows proportions, not a real count of molecules, and with only 100 particles it is rough: the number of B divided by the number of A matches K only approximately, and when fewer than 1 particle in 100 is of one kind the box cannot show it, though it is there.';

const TEMPERATURES: Kelvins[] = [298, 500, 1000];
const RADIO: Record<Kelvins, string> = { 298: '298 K', 500: '500 K', 1000: '1,000 K' };
const FREE_ENERGIES = Array.from({ length: 81 }, (_, i) => i - 40);

const boxPanel = (diagram: Locator) => diagram.locator('[data-panel="box"]');
const graph = (diagram: Locator) => diagram.locator('[data-panel="graph"]');
// A panel's main drawing; the key under the box holds small SVGs of its own.
const drawing = (panel: Locator) => panel.locator('svg[role="img"]');
const drawnParticles = (diagram: Locator, kind?: 'A' | 'B') =>
  drawing(boxPanel(diagram)).locator(kind ? `[data-particle="${kind}"]` : '[data-particle]');
const status = (diagram: Locator) => diagram.getByRole('status');
const slider = (diagram: Locator) => diagram.getByRole('slider', { name: 'ΔG°', exact: true });
const group = (diagram: Locator) => diagram.getByRole('group', { name: 'Temperature' });
const radio = (diagram: Locator, t: Kelvins) => group(diagram).getByRole('radio', { name: RADIO[t], exact: true });

/** The slider's spoken value, written out from the brief's words, apart from the module. */
function spoken(g: number): string {
  const unit = Math.abs(g) === 1 ? 'kilojoule per mole' : 'kilojoules per mole';
  if (g === 0) return `0 ${unit}`;
  return `${g > 0 ? 'plus' : 'minus'} ${Math.abs(g)} ${unit}`;
}
/** The slider's shown value: "−5 kJ/mol", "0 kJ/mol", "+5 kJ/mol". */
const shown = (g: number) => `${g === 0 ? '0' : `${g > 0 ? '+' : '−'}${Math.abs(g)}`} kJ/mol`;

/** Chooses a temperature and waits until the drawing has changed to it: the graph's name says which line is heavy. */
async function chooseTemperature(diagram: Locator, t: Kelvins) {
  await radio(diagram, t).check();
  await expect(drawing(graph(diagram))).toHaveAccessibleName(new RegExp(`The line for ${RADIO[t]} is drawn heavy`));
}

async function setFreeEnergy(diagram: Locator, g: number) {
  await slider(diagram).fill(String(g));
  await expect(slider(diagram)).toHaveAttribute('aria-valuetext', spoken(g));
}

async function pressTimes(page: Page, key: string, times: number) {
  for (let i = 0; i < times; i++) await page.keyboard.press(key);
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

/** An item of a list that must be there: a missing one is an error, never a default. */
function at<T>(list: readonly T[], index: number): T {
  const item = list[index];
  if (item === undefined) throw new Error(`The list has no item ${index}; it has ${list.length}.`);
  return item;
}

async function pointsOf(path: Locator): Promise<Point[]> {
  const d = await path.getAttribute('d');
  if (d === null) throw new Error('A line has no d attribute.');
  const points = [...d.matchAll(POINT)].map((m) => ({ x: Number(m[1]), y: Number(m[2]) }));
  if (points.length !== 2) throw new Error(`Not a straight line: ${d}`);
  return points;
}

/** Where the graph's axes put a ΔG° (ticks at −40 and +40 kJ) and a log K (ticks at −6 and +6). */
async function axes(diagram: Locator) {
  const xLow = await numberOf(graph(diagram).locator('[data-tick-x="-40"]'), 'x1');
  const xHigh = await numberOf(graph(diagram).locator('[data-tick-x="40"]'), 'x1');
  const yLow = await numberOf(graph(diagram).locator('[data-tick-y="-6"]'), 'y1');
  const yHigh = await numberOf(graph(diagram).locator('[data-tick-y="6"]'), 'y1');
  return {
    x: (kJ: number) => xLow + ((kJ + 40) / 80) * (xHigh - xLow),
    y: (logK: number) => yLow + ((logK + 6) / 12) * (yHigh - yLow),
  };
}

// Each drawn position is rounded to a tenth of a unit, and so is each tick.
const TOLERANCE = 0.3;
function expectNear(actual: number, expected: number, what: string, tolerance = TOLERANCE) {
  expect(Math.abs(actual - expected), `${what}: ${actual} is not within ${tolerance} of ${expected}`).toBeLessThanOrEqual(tolerance);
}

test('the diagram starts at −5 kJ/mol and 298 K, with its readout, box and graph', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await expect(status(diagram)).toHaveText(START_READOUT);
  await expect(radio(diagram, 298)).toBeChecked();
  await expect(radio(diagram, 500)).not.toBeChecked();
  await expect(radio(diagram, 1000)).not.toBeChecked();
  await expect(slider(diagram)).toHaveAttribute('aria-valuetext', 'minus 5 kilojoules per mole');
  await expect(slider(diagram)).toHaveAttribute('min', '-40');
  await expect(slider(diagram)).toHaveAttribute('max', '40');
  await expect(slider(diagram)).toHaveAttribute('step', '1');
  await expect(slider(diagram)).toHaveValue('-5');
  await expect(diagram.locator('.diagram-slider-value')).toHaveText('−5 kJ/mol');
  await expect(graph(diagram).locator('[data-axis-label="y"]')).toHaveText('K (log scale)');
  await expect(graph(diagram).locator('[data-axis-label="x"]')).toHaveText('ΔG° (kJ/mol)');
  await expect(graph(diagram).locator('[data-k-one-name]')).toHaveText('K = 1');
  await expect(graph(diagram).locator('[data-line-name]')).toHaveText(['298 K', '500 K', '1,000 K']);
  await expect(graph(diagram).locator('[data-chosen-line]')).toHaveAttribute('data-line', '298');
  await expect(boxPanel(diagram).locator('figcaption')).toHaveText('At equilibrium');
  await expect(drawnParticles(diagram, 'B')).toHaveCount(88);
  await expect(drawnParticles(diagram, 'A')).toHaveCount(12);
});

test('the choice is a radio group named "Temperature", in the brief’s order, with a name unique to the instance', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  const radios = group(diagram).getByRole('radio');
  await expect(radios).toHaveCount(3);
  for (const [i, t] of TEMPERATURES.entries()) await expect(radios.nth(i)).toHaveAccessibleName(RADIO[t]);
  expect(await radios.first().getAttribute('name')).toMatch(/^gibbs-and-k-.+-temperature$/);
});

test('the slider works from the keyboard: the arrows, Home and End', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await slider(diagram).focus();
  await page.keyboard.press('ArrowRight');
  await expect(slider(diagram)).toHaveAttribute('aria-valuetext', 'minus 4 kilojoules per mole');
  await expect(diagram.locator('.diagram-slider-value')).toHaveText('−4 kJ/mol');
  await expect(status(diagram)).toHaveText(MINUS_4);

  await pressTimes(page, 'ArrowRight', 4);
  await expect(slider(diagram)).toHaveAttribute('aria-valuetext', '0 kilojoules per mole');
  await expect(status(diagram)).toHaveText(ZERO_298);
  await pressTimes(page, 'ArrowRight', 5);
  await expect(diagram.locator('.diagram-slider-value')).toHaveText('+5 kJ/mol');
  await expect(status(diagram)).toHaveText(PLUS_5);

  await page.keyboard.press('End');
  await expect(slider(diagram)).toHaveAttribute('aria-valuetext', 'plus 40 kilojoules per mole');
  await expect(status(diagram)).toHaveText(PLUS_40_298);
  await page.keyboard.press('ArrowRight');
  await expect(slider(diagram)).toHaveAttribute('aria-valuetext', 'plus 40 kilojoules per mole');

  await page.keyboard.press('Home');
  await expect(slider(diagram)).toHaveAttribute('aria-valuetext', 'minus 40 kilojoules per mole');
  await expect(diagram.locator('.diagram-slider-value')).toHaveText('−40 kJ/mol');
  await expect(status(diagram)).toHaveText(MINUS_40_298);
  await page.keyboard.press('ArrowLeft');
  await expect(slider(diagram)).toHaveAttribute('aria-valuetext', 'minus 40 kilojoules per mole');
});

test('the temperature can be chosen from the keyboard, and ΔG° stays where it was', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await radio(diagram, 298).focus();
  await page.keyboard.press('ArrowDown');
  await expect(radio(diagram, 500)).toBeChecked();
  await expect(slider(diagram)).toHaveAttribute('aria-valuetext', 'minus 5 kilojoules per mole');
  await expect(status(diagram)).toHaveText(MINUS_5_500);

  await setFreeEnergy(diagram, -40);
  await radio(diagram, 500).focus();
  await page.keyboard.press('ArrowDown');
  await expect(radio(diagram, 1000)).toBeChecked();
  await expect(status(diagram)).toHaveText(MINUS_40_1000);
  await pressTimes(page, 'ArrowUp', 2);
  await expect(radio(diagram, 298)).toBeChecked();
  await expect(status(diagram)).toHaveText(MINUS_40_298);
});

test('the readout follows the brief at the states the lesson walks through', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  const cases: [number, Kelvins, string][] = [
    [-5, 298, START_READOUT],
    [0, 298, ZERO_298],
    [5, 298, PLUS_5],
    [-6, 298, MINUS_6],
    [-11, 298, MINUS_11],
    [-17, 298, MINUS_17],
    [-40, 298, MINUS_40_298],
    [-40, 500, MINUS_40_500],
    [-40, 1000, MINUS_40_1000],
    [40, 298, PLUS_40_298],
    [13, 298, PLUS_13_298],
  ];
  for (const [g, t, sentence] of cases) {
    await chooseTemperature(diagram, t);
    await setFreeEnergy(diagram, g);
    await expect(status(diagram), `${g} kJ at ${t} K`).toHaveText(sentence);
  }
});

test('choosing a temperature changes the heavy line, its name, the marker, the box and the readout', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  const before = {
    dot: await graph(diagram).locator('[data-dot]').getAttribute('cy'),
    box: await drawing(boxPanel(diagram)).getAttribute('aria-label'),
  };
  await chooseTemperature(diagram, 1000);

  await expect(graph(diagram).locator('[data-chosen-line]')).toHaveAttribute('data-line', '1000');
  expect(await graph(diagram).locator('[data-dot]').getAttribute('cy')).not.toBe(before.dot);
  expect(await drawing(boxPanel(diagram)).getAttribute('aria-label')).not.toBe(before.box);
  await expect(graph(diagram).locator('[data-line-name="1000"]')).toHaveClass(/is-selected/);
  await expect(graph(diagram).locator('[data-line-name="298"]')).not.toHaveClass(/is-selected/);
  await expect(status(diagram)).toHaveText(readout(-5, 1000));
});

test('both axes are labeled and ticked: K from 10⁻⁶ to 10⁶, and ΔG° from −40 to +40 kJ/mol', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  const ticksY = graph(diagram).locator('[data-tick-y]');
  expect(await ticksY.evaluateAll((lines) => lines.map((line) => line.getAttribute('data-tick-y')))).toEqual(['-6', '-3', '0', '3', '6']);
  await expect(graph(diagram).locator('[data-tick-label-y]')).toHaveText(['10⁻⁶', '10⁻³', '1', '10³', '10⁶']);
  const ticksX = graph(diagram).locator('[data-tick-x]');
  expect(await ticksX.evaluateAll((lines) => lines.map((line) => line.getAttribute('data-tick-x')))).toEqual(['-40', '-20', '0', '20', '40']);
  await expect(graph(diagram).locator('[data-tick-label-x]')).toHaveText(['−40', '−20', '0', '+20', '+40']);
  // The gridlines at the labeled powers of ten other than 1, which has a line of its own.
  expect(await graph(diagram).locator('[data-gridline]').evaluateAll((lines) => lines.map((line) => line.getAttribute('data-gridline')))).toEqual([
    '-6',
    '-3',
    '3',
    '6',
  ]);
});

test('the three lines are drawn from the module, the chosen one heavy and solid, the other two faint, each with its own dashes', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  const { x, y } = await axes(diagram);

  // The brief's ends of the three lines, at −40 and +40 kJ: log K.
  const ends: Record<Kelvins, number> = { 298: 7.012, 500: 4.179, 1000: 2.089 };
  for (const t of TEMPERATURES) {
    const drawn = await pointsOf(graph(diagram).locator(`[data-line="${t}"]`));
    const end = ends[t];
    expect(at(linePoints(t), 0).logK).toBeCloseTo(end, 3);
    expect(at(linePoints(t), 1).logK).toBeCloseTo(-end, 3);
    expectNear(at(drawn, 0).x, x(-40), `${t} K: start x`);
    expectNear(at(drawn, 0).y, y(end), `${t} K: start y`, 0.4);
    expectNear(at(drawn, 1).x, x(40), `${t} K: end x`);
    expectNear(at(drawn, 1).y, y(-end), `${t} K: end y`, 0.4);
  }
  const style = (selector: string) =>
    graph(diagram)
      .locator(selector)
      .evaluate((element) => {
        const s = getComputedStyle(element);
        return { dash: s.strokeDasharray, width: Number.parseFloat(s.strokeWidth) };
      });
  for (const chosenT of TEMPERATURES) {
    await chooseTemperature(diagram, chosenT);
    const chosen = await style(`[data-line="${chosenT}"]`);
    expect(chosen.dash, `${chosenT} K: the chosen line is solid`).toBe('none');
    const faint = await Promise.all(TEMPERATURES.filter((t) => t !== chosenT).map((t) => style(`[data-line="${t}"]`)));
    for (const line of faint) {
      expect(line.dash, `${chosenT} K: a faint line is dashed`).not.toBe('none');
      expect(chosen.width).toBeGreaterThan(line.width);
    }
    expect(at(faint, 0).dash, `${chosenT} K: the two faint lines have different dashes`).not.toBe(at(faint, 1).dash);
  }
});

test('the line K = 1 is firm, solid and named, and each line is named at its right-hand end', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  const { x, y } = await axes(diagram);

  const one = graph(diagram).locator('[data-k-one]');
  expectNear(await numberOf(one, 'y1'), y(0), 'the K = 1 line');
  expectNear(await numberOf(one, 'y2'), y(0), 'the K = 1 line');
  expectNear(await numberOf(one, 'x1'), x(-40), 'the K = 1 line starts at the axis');
  expectNear(await numberOf(one, 'x2'), x(40), 'the K = 1 line ends at the plot’s right');
  const oneStyle = await one.evaluate((element) => {
    const s = getComputedStyle(element);
    return { dash: s.strokeDasharray, width: Number.parseFloat(s.strokeWidth) };
  });
  expect(oneStyle.dash, 'the K = 1 line is solid').toBe('none');
  expect(oneStyle.width).toBeGreaterThanOrEqual(1.5);
  expect(await numberOf(graph(diagram).locator('[data-k-one-name]'), 'x')).toBeGreaterThan(x(40));

  for (const t of TEMPERATURES) {
    const name = graph(diagram).locator(`[data-line-name="${t}"]`);
    expect(await numberOf(name, 'x'), `${t} K: the name is right of the plot`).toBeGreaterThan(x(40));
    expectNear(await numberOf(name, 'y'), y(at(linePoints(t), 1).logK), `${t} K: the name is at the height of the line's end`, 0.4);
  }
});

test('the box shows the count of B the brief gives, as filled squares, and the rest as open circles', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  // [ΔG°, T, n_B], from the brief's worked states.
  const cases: [number, Kelvins, number][] = [
    [-5, 298, 88],
    [0, 298, 50],
    [5, 298, 12],
    [-17, 298, 100],
    [40, 298, 0],
    [13, 298, 1],
    [14, 298, 0],
    [22, 500, 1],
    [23, 500, 0],
    [-40, 1000, 99],
    [1, 1000, 47],
    [40, 1000, 1],
  ];
  for (const [g, t, countB] of cases) {
    await chooseTemperature(diagram, t);
    await setFreeEnergy(diagram, g);
    const where = `${g} kJ at ${t} K`;
    await expect(drawnParticles(diagram, 'B'), where).toHaveCount(countB);
    await expect(drawnParticles(diagram, 'A'), where).toHaveCount(100 - countB);
  }
});

test('A and B differ in shape: an open circle and a filled square, named in the key', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  const a = drawnParticles(diagram, 'A').first();
  const b = drawnParticles(diagram, 'B').first();
  expect(await a.evaluate((element) => element.tagName)).toBe('circle');
  expect(await b.evaluate((element) => element.tagName)).toBe('rect');
  const fills = await Promise.all([a, b].map((part) => part.evaluate((element) => getComputedStyle(element).fill)));
  expect(at(fills, 0)).not.toBe(at(fills, 1));
  await expect(boxPanel(diagram).locator('[data-key-particle="A"]')).toHaveText('A');
  await expect(boxPanel(diagram).locator('[data-key-particle="B"]')).toHaveText('B');
  await expect(boxPanel(diagram).locator('[data-key-particle="A"] circle')).toHaveCount(1);
  await expect(boxPanel(diagram).locator('[data-key-particle="B"] rect')).toHaveCount(1);
});

test('one step of the slider changes only a few cells and never rearranges the rest', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  await chooseTemperature(diagram, 1000);
  const kinds = () => drawnParticles(diagram).evaluateAll((parts) => parts.map((part) => part.getAttribute('data-particle')));
  await setFreeEnergy(diagram, -40);
  let before = await kinds();
  for (let g = -39; g <= 40; g++) {
    await setFreeEnergy(diagram, g);
    const now = await kinds();
    expect(now).toHaveLength(100);
    // ΔG° rises, so K falls: a cell may turn from B to A, never from A to B.
    before.forEach((kind, cell) => {
      if (kind === 'A') expect(now[cell], `cell ${cell} at ${g} kJ`).toBe('A');
    });
    before = now;
  }
});

test('over all 243 settings, the readout, the names of the drawings, the slider, the marker and the box are those of the module', async ({ page }) => {
  test.setTimeout(300_000);
  const diagram = await openDiagram(page, PAGE, NAME);
  const { x, y } = await axes(diagram);
  let states = 0;
  for (const t of TEMPERATURES) {
    await chooseTemperature(diagram, t);
    for (const g of FREE_ENERGIES) {
      await setFreeEnergy(diagram, g);
      const where = `${g} kJ at ${t} K`;
      const now = gibbsState(g, t);
      await expect(status(diagram), where).toHaveText(readout(g, t));
      await expect(slider(diagram), where).toHaveAttribute('aria-valuetext', freeEnergyValueText(g));
      await expect(diagram.locator('.diagram-slider-value'), where).toHaveText(shown(g));
      await expect(drawing(graph(diagram)), where).toHaveAccessibleName(describeGraph(g, t));
      await expect(drawing(boxPanel(diagram)), where).toHaveAccessibleName(describeBox(g, t));
      const dot = graph(diagram).locator('[data-dot]');
      expectNear(await numberOf(dot, 'cx'), x(g), `${where}: the dot's x`);
      expectNear(await numberOf(dot, 'cy'), y(now.logK), `${where}: the dot's y`, 0.4);
      const kinds = await drawnParticles(diagram).evaluateAll((parts) => parts.map((part) => part.getAttribute('data-particle')));
      expect(kinds, where).toEqual(particles(g, t).map((p) => p.kind));
      states += 1;
    }
  }
  expect(states).toBe(243);
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
      const name = text.textContent;
      if (name === null) throw new Error('A text has no content.');
      return {
        name,
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
    const from = at(points, i);
    const to = at(points, i + 1);
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
/** Two labels with at least `gap` units between them, across or down. */
const apart = (one: Box, two: Box, gap: number) =>
  one.bottom + gap <= two.top || two.bottom + gap <= one.top || one.right + gap <= two.left || two.right + gap <= one.left;
// Half the thickest stroke, and a little more.
const CLEARANCE = 2.5;
// The least space between two labels, at every setting.
const LABEL_GAP = 4;

// The values stand outside the plot, the names of the lines and of K = 1 past its right-hand edge,
// where neither a line nor the marker goes. So no label may come within 4 units of another, or meet
// a line, the K = 1 line, a gridline or the marker, at any temperature and any ΔG°.
test('at every setting no text is cut off, no two labels come within 4 units, and no label meets a line, a gridline or the marker', async ({ page }) => {
  test.setTimeout(300_000);
  const diagram = await openDiagram(page, PAGE, NAME);
  await page.evaluate(() => document.fonts.ready);
  let states = 0;

  for (const t of TEMPERATURES) {
    await chooseTemperature(diagram, t);
    const labels = await textBoxes(graph(diagram));
    // Five values on each axis, two axis names, the three names of the lines and "K = 1".
    expect(labels, `${t} K: the labels`).toHaveLength(5 + 5 + 2 + 3 + 1);
    const frame = await drawing(graph(diagram)).evaluate((svg) =>
      svg instanceof SVGSVGElement ? { width: svg.viewBox.baseVal.width, height: svg.viewBox.baseVal.height } : null,
    );
    if (!frame) throw new Error('The drawing is not an SVG.');
    for (const label of labels) {
      expect(label.left >= -0.5 && label.top >= -0.5 && label.right <= frame.width + 0.5 && label.bottom <= frame.height + 0.5, `"${label.name}" is cut off`).toBe(true);
    }
    for (let i = 0; i < labels.length; i++) {
      for (let j = i + 1; j < labels.length; j++) {
        const [one, two] = [at(labels, i), at(labels, j)];
        expect(apart(one, two, LABEL_GAP), `${t} K: "${one.name}" and "${two.name}" are less than ${LABEL_GAP} units apart`).toBe(true);
      }
    }

    const lines = await Promise.all(TEMPERATURES.map(async (r) => finePoints(await pointsOf(graph(diagram).locator(`[data-line="${r}"]`)))));
    const oneLine = await lineOf(graph(diagram).locator('[data-k-one]'));
    const gridlines = await Promise.all((await graph(diagram).locator('[data-gridline]').all()).map(lineOf));
    for (const label of labels) {
      for (const [k, points] of lines.entries()) {
        expect(points.filter((p) => near(label, p, CLEARANCE)), `${t} K: "${label.name}" touches the line for ${at(TEMPERATURES, k)} K`).toEqual([]);
      }
      expect(oneLine.filter((p) => near(label, p, CLEARANCE)), `${t} K: "${label.name}" touches the K = 1 line`).toEqual([]);
      for (const gridline of gridlines) expect(gridline.filter((p) => near(label, p, 1)), `${t} K: "${label.name}" touches a gridline`).toEqual([]);
    }

    for (const g of FREE_ENERGIES) {
      await setFreeEnergy(diagram, g);
      const where = `${g} kJ at ${t} K`;
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
  expect(states).toBe(243);
});

test("each drawing's name says what is drawn now", async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await expect(drawing(graph(diagram))).toHaveAccessibleName(
    'Graph of K, on a scale of powers of ten from 10⁻⁸ to 10⁸, against ΔG° from −40 to +40 kJ/mol. A firm line marks K = 1. ' +
      'The line for 298 K is drawn heavy and those for 500 K and 1,000 K faint and dashed. ' +
      'It runs from K = 1.0 × 10⁷ at −40 kJ/mol to K = 9.7 × 10⁻⁸ at +40 kJ/mol. A marker at −5 kJ/mol is on it at K = 7.5.',
  );
  await expect(drawing(boxPanel(diagram))).toHaveAccessibleName(
    'A box of 100 particles at equilibrium: 88 are B, drawn as filled squares, and 12 are A, drawn as open circles.',
  );
  await setFreeEnergy(diagram, -17);
  await expect(drawing(boxPanel(diagram))).toHaveAccessibleName('A box of 100 particles at equilibrium, all drawn as B, filled squares: fewer than 1 in 100 is A.');
  await chooseTemperature(diagram, 1000);
  await expect(drawing(graph(diagram))).toHaveAccessibleName(/It runs from K = 120 at −40 kJ\/mol to K = 8\.1 × 10⁻³ at \+40 kJ\/mol\./);
});

// A nominal size: the font size in drawing units, times 320, over the drawing's width in units.
test("the graph's text is 12 px or more when the drawing itself is shown 320 px wide, and the box holds no text", async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  const sizes = await drawing(graph(diagram)).evaluate((svg) => {
    if (!(svg instanceof SVGSVGElement)) throw new Error('The drawing is not an SVG.');
    const unitsWide = svg.viewBox.baseVal.width;
    return [...svg.querySelectorAll('text, tspan')].map((text) => ({
      text: text.textContent,
      pxAt320: (Number.parseFloat(getComputedStyle(text).fontSize) * 320) / unitsWide,
    }));
  });
  expect(sizes.length).toBeGreaterThan(0);
  for (const size of sizes) expect(size.pxAt320, `"${size.text}"`).toBeGreaterThanOrEqual(12);
  await expect(drawing(boxPanel(diagram)).locator('text')).toHaveCount(0);
});

for (const width of [1280, 680, 660, 412]) {
  test(`on a ${width} px screen the graph's drawn text is 12 px or larger`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const diagram = await openDiagram(page, PAGE, NAME);
    await page.evaluate(() => document.fonts.ready);
    const sizes = await drawing(graph(diagram)).evaluate((svg) => {
      if (!(svg instanceof SVGSVGElement)) throw new Error('The drawing is not an SVG.');
      const scale = svg.getBoundingClientRect().width / svg.viewBox.baseVal.width;
      return [...svg.querySelectorAll('text, tspan')].map((text) => ({ text: text.textContent, px: Number.parseFloat(getComputedStyle(text).fontSize) * scale }));
    });
    for (const size of sizes) expect(size.px, `"${size.text}"`).toBeGreaterThanOrEqual(12);
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

test('the graph is no wider than 22rem, the box’s column no wider than 12rem and its drawing no wider than 10rem', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  const diagram = await openDiagram(page, PAGE, NAME);

  const plot = await graph(diagram).boundingBox();
  const box = await boxPanel(diagram).boundingBox();
  const boxDrawing = await drawing(boxPanel(diagram)).boundingBox();
  if (!plot || !box || !boxDrawing) throw new Error('A part has no bounding box.');
  expect(plot.width).toBeLessThanOrEqual(22 * 16 + 1);
  expect(box.width).toBeLessThanOrEqual(12 * 16 + 1);
  expect(boxDrawing.width).toBeLessThanOrEqual(10 * 16 + 1);
});

for (const width of [1280, 680, 412, 320]) {
  test(`at ${width} px the order is the box and the graph, the slider, the choice of temperature, then the readout`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const diagram = await openDiagram(page, PAGE, NAME);

    const parts = await Promise.all([boxPanel(diagram), graph(diagram), slider(diagram), group(diagram), status(diagram)].map((part) => part.boundingBox()));
    const [box, plot, freeEnergy, temperatures, readoutBox] = parts;
    if (!box || !plot || !freeEnergy || !temperatures || !readoutBox) throw new Error('A part of the diagram has no box.');
    const drawingsBottom = Math.max(box.y + box.height, plot.y + plot.height);
    expect(freeEnergy.y, 'the slider is under the drawings').toBeGreaterThanOrEqual(drawingsBottom);
    expect(temperatures.y, 'the choice of temperature is under the drawings').toBeGreaterThanOrEqual(drawingsBottom);
    // On a wide screen the choice shares the slider's row, farther right; on a narrow one it is under the slider.
    const underSlider = temperatures.y >= freeEnergy.y + freeEnergy.height;
    const sameRowFartherRight = temperatures.x >= freeEnergy.x + freeEnergy.width && temperatures.y < freeEnergy.y + freeEnergy.height;
    expect(underSlider || sameRowFartherRight, 'the choice of temperature comes after the slider').toBe(true);
    const controlsBottom = Math.max(freeEnergy.y + freeEnergy.height, temperatures.y + temperatures.height);
    expect(readoutBox.y, 'the readout is under the controls').toBeGreaterThanOrEqual(controlsBottom);
  });
}

// A student moves the slider and watches the marker and the box. On a small phone the drawings and
// the slider must be on the screen together, with the diagram scrolled so that the box's title is at the top.
test('at 320 × 568 the box, the graph and the slider are on the screen together', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  const diagram = await openDiagram(page, PAGE, NAME);
  // The longest readout makes no difference here: the readout is under the slider.
  await boxPanel(diagram).evaluate((element) => {
    window.scrollTo(0, element.getBoundingClientRect().top + window.scrollY - 8);
  });

  const parts = {
    box: await drawing(boxPanel(diagram)).boundingBox(),
    graph: await drawing(graph(diagram)).boundingBox(),
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
    // The longest readout of all 243 settings, found from the module.
    let longest = { g: -5, t: 298 as Kelvins, text: '' };
    for (const t of TEMPERATURES) {
      for (const g of FREE_ENERGIES) {
        const text = readout(g, t);
        if (text.length > longest.text.length) longest = { g, t, text };
      }
    }
    await chooseTemperature(diagram, longest.t);
    await setFreeEnergy(diagram, longest.g);
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
  test(`the diagram has no accessibility violations in the ${theme} theme, at the start and at +40 kJ/mol and 1,000 K`, async ({ page }) => {
    await page.addInitScript((value) => localStorage.setItem('chemstudy:theme', value), theme);
    const diagram = await openDiagram(page, PAGE, NAME);
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    const violations = async () => {
      const results = await new AxeBuilder({ page }).include(`[data-diagram="${NAME}"]`).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      return results.violations.map((v) => `${v.id}: ${v.nodes.length} node(s) - ${v.help}`);
    };
    expect(await violations(), 'at the start').toEqual([]);
    await chooseTemperature(diagram, 1000);
    await setFreeEnergy(diagram, 40);
    expect(await violations(), 'at +40 kJ/mol and 1,000 K').toEqual([]);
  });
}

test('in print the controls are hidden and the box, the graph and the readout stay', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  await page.emulateMedia({ media: 'print' });

  await expect(diagram.locator('.diagram-controls')).toBeHidden();
  await expect(drawing(boxPanel(diagram))).toBeVisible();
  await expect(drawing(graph(diagram))).toBeVisible();
  await expect(status(diagram)).toHaveText(START_READOUT);
});

test('the caption says that the reaction is made up, that a real ΔG° changes with temperature, and that the box shows proportions', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  await expect(page.locator('[data-part="diagram"]', { has: diagram }).locator('> figcaption')).toHaveText(CAPTION);
});

test.describe('with JavaScript off', () => {
  test.use({ javaScriptEnabled: false });

  test('the box, the graph and the starting readout show, with no controls', async ({ page }) => {
    await expectStaticDiagram(page, PAGE, NAME, START_READOUT);

    const diagram = page.locator(`[data-diagram="${NAME}"]`);
    await expect(drawing(boxPanel(diagram))).toBeVisible();
    await expect(drawing(graph(diagram))).toBeVisible();
    await expect(graph(diagram).locator('[data-chosen-line]')).toHaveAttribute('data-line', '298');
    await expect(drawnParticles(diagram, 'B')).toHaveCount(88);
    await expect(drawnParticles(diagram, 'A')).toHaveCount(12);
    const { x, y } = await axes(diagram);
    expectNear(await numberOf(graph(diagram).locator('[data-dot]'), 'cx'), x(-5), "the dot's x");
    expectNear(await numberOf(graph(diagram).locator('[data-dot]'), 'cy'), y(5000 / (8.314 * 298 * Math.LN10)), "the dot's y", 0.4);
  });
});
