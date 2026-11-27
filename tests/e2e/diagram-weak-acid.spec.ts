import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator, type Page } from '@playwright/test';
import {
  BOX,
  concentrationValueText,
  countText,
  curve,
  describeBox,
  describeGraph,
  particles,
  readout,
  state as weakAcidState,
} from '../../src/lib/weak-acid';
import { expectStaticDiagram, openDiagram } from './diagram';

const PAGE = '/unit-8-acids-and-bases/8-3-weak-acid-and-base-equilibria/';
const NAME = 'weak-acid';

// Every sentence and number below is written out from lesson 8.3's brief, "Diagram data: the weak-acid
// explorer" (the acids, the ten concentrations, the thirty worked states and the readout sentences),
// apart from the module under test. Only the sweeps over every setting compare the drawing with the
// module itself.
const START_READOUT =
  'Formic acid at 0.10 M: [H₃O⁺] = 4.2 × 10⁻³ M and the pH is 2.38. Of the acid, 4.2 percent is ionized. The shortcut gives a pH of 2.37, and its check comes to 4.2 percent, under 5, so it passes. A strong acid at 0.10 M would have a pH of 1.00.';
const FORMIC_0010 =
  'Formic acid at 0.0010 M: [H₃O⁺] = 3.4 × 10⁻⁴ M and the pH is 3.46. Of the acid, 34 percent is ionized. The shortcut gives a pH of 3.37, but its check comes to 42 percent, over 5, so it fails here. A strong acid at 0.0010 M would have a pH of 3.00.';
const FORMIC_0020 =
  'Formic acid at 0.0020 M: [H₃O⁺] = 5.2 × 10⁻⁴ M and the pH is 3.29. Of the acid, 26 percent is ionized. The shortcut gives a pH of 3.22, but its check comes to 30 percent, over 5, so it fails here. A strong acid at 0.0020 M would have a pH of 2.70.';
const FORMIC_10 =
  'Formic acid at 1.0 M: [H₃O⁺] = 1.3 × 10⁻² M and the pH is 1.88. Of the acid, 1.3 percent is ionized. The shortcut gives a pH of 1.87, and its check comes to 1.3 percent, under 5, so it passes. A strong acid at 1.0 M would have a pH of 0.00.';
const BUTANOIC_10 =
  'Butanoic acid at 1.0 M: [H₃O⁺] = 3.9 × 10⁻³ M and the pH is 2.41. Of the acid, 0.39 percent is ionized, fewer than 1 molecule in 100. The shortcut gives a pH of 2.41, and its check comes to 0.39 percent, under 5, so it passes. A strong acid at 1.0 M would have a pH of 0.00.';
const BUTANOIC_010 =
  'Butanoic acid at 0.10 M: [H₃O⁺] = 1.2 × 10⁻³ M and the pH is 2.91. Of the acid, 1.2 percent is ionized. The shortcut gives a pH of 2.91, and its check comes to 1.2 percent, under 5, so it passes. A strong acid at 0.10 M would have a pH of 1.00.';
const CHLOROACETIC_010 =
  'Chloroacetic acid at 0.10 M: [H₃O⁺] = 1.1 × 10⁻² M and the pH is 1.95. Of the acid, 11 percent is ionized. The shortcut gives a pH of 1.93, but its check comes to 12 percent, over 5, so it fails here. A strong acid at 0.10 M would have a pH of 1.00.';
const CHLOROACETIC_10 =
  'Chloroacetic acid at 1.0 M: [H₃O⁺] = 3.7 × 10⁻² M and the pH is 1.44. Of the acid, 3.7 percent is ionized. The shortcut gives a pH of 1.43, and its check comes to 3.7 percent, under 5, so it passes. A strong acid at 1.0 M would have a pH of 0.00.';
const CHLOROACETIC_0010 =
  'Chloroacetic acid at 0.0010 M: [H₃O⁺] = 6.7 × 10⁻⁴ M and the pH is 3.17. Of the acid, 67 percent is ionized. The shortcut gives a pH of 2.93, but its check comes to 118 percent, more acid than there is, so it fails here. A strong acid at 0.0010 M would have a pH of 3.00.';
const CAPTION =
  'Three weak acids alone in water at 25 °C: chloroacetic acid (Ka = 1.4 × 10⁻³), formic acid (Ka = 1.8 × 10⁻⁴) and butanoic acid (Ka = 1.5 × 10⁻⁵). Every number comes from the full equilibrium, water’s own ions included, so a pH can differ in the last place from a calculation by hand. The box draws 100 particles of the acid, with the number ionized rounded to the nearest whole particle.';

type AcidKey = 'chloroacetic' | 'formic' | 'butanoic';
const ACIDS: AcidKey[] = ['chloroacetic', 'formic', 'butanoic'];
const RADIO: Record<AcidKey, string> = {
  chloroacetic: 'Chloroacetic acid, HC₂H₂ClO₂',
  formic: 'Formic acid, HCHO₂',
  butanoic: 'Butanoic acid, HC₄H₇O₂',
};
const CONCENTRATIONS = ['1.0', '0.50', '0.20', '0.10', '0.050', '0.020', '0.010', '0.0050', '0.0020', '0.0010'];
const POSITIONS = CONCENTRATIONS.map((_, i) => i);

const boxPanel = (diagram: Locator) => diagram.locator('[data-panel="box"]');
const boxDrawing = (diagram: Locator) => boxPanel(diagram).getByRole('img');
const graph = (diagram: Locator) => diagram.locator('[data-panel="graph"]');
const status = (diagram: Locator) => diagram.getByRole('status');
const slider = (diagram: Locator) => diagram.getByRole('slider', { name: 'Starting concentration', exact: true });
const acidGroup = (diagram: Locator) => diagram.getByRole('group', { name: 'Acid' });
const acidRadio = (diagram: Locator, id: AcidKey) => acidGroup(diagram).getByRole('radio', { name: RADIO[id] });
const drawnParticles = (diagram: Locator, kind?: 'whole' | 'pair') =>
  boxDrawing(diagram).locator(kind ? `:scope > [data-particle="${kind}"]` : ':scope > [data-particle]');

/**
 * Chooses an acid and waits until the drawing has changed to it. A radio is checked the moment it is
 * clicked, before the redraw, so its own state proves nothing: the graph's name says what is drawn.
 */
async function chooseAcid(diagram: Locator, id: AcidKey) {
  await acidRadio(diagram, id).check();
  await expect(graph(diagram).getByRole('img')).toHaveAccessibleName(new RegExp(`The curve of ${id} acid is drawn heavy`));
}

async function setPosition(diagram: Locator, position: number) {
  await slider(diagram).fill(String(position));
  await expect(slider(diagram)).toHaveAttribute('aria-valuetext', `${CONCENTRATIONS[position]} molar`);
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
  if (points.length < 10) throw new Error(`Not a curve: ${d}`);
  return points;
}

/** Where the graph's axes put a log concentration (ticks at 1 and 0.001 M) and a percent (ticks at 0 and 70). */
async function axes(diagram: Locator) {
  const xOne = await numberOf(graph(diagram).locator('[data-tick-x="1"]'), 'x1');
  const xThousandth = await numberOf(graph(diagram).locator('[data-tick-x="0.001"]'), 'x1');
  const y0 = await numberOf(graph(diagram).locator('[data-tick-y="0"]'), 'y1');
  const y70 = await numberOf(graph(diagram).locator('[data-tick-y="70"]'), 'y1');
  return {
    x: (log: number) => xOne + (-log / 3) * (xThousandth - xOne),
    y: (percent: number) => y0 + (percent / 70) * (y70 - y0),
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

test('the diagram starts with formic acid at 0.10 M, 4 of 100 ionized, with its readout, box and graph', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await expect(status(diagram)).toHaveText(START_READOUT);
  await expect(acidRadio(diagram, 'formic')).toBeChecked();
  await expect(acidRadio(diagram, 'chloroacetic')).not.toBeChecked();
  await expect(acidRadio(diagram, 'butanoic')).not.toBeChecked();
  await expect(slider(diagram)).toHaveAttribute('aria-valuetext', '0.10 molar');
  await expect(slider(diagram)).toHaveAttribute('min', '0');
  await expect(slider(diagram)).toHaveAttribute('max', '9');
  await expect(slider(diagram)).toHaveAttribute('step', '1');
  await expect(slider(diagram)).toHaveValue('3');
  await expect(diagram.locator('.diagram-slider-value')).toHaveText('0.10 M');
  await expect(graph(diagram).locator('[data-axis-label="y"]')).toHaveText('percent ionized');
  await expect(graph(diagram).locator('[data-axis-label="x"]')).toHaveText('starting concentration (M)');
  await expect(drawnParticles(diagram, 'pair')).toHaveCount(4);
  await expect(drawnParticles(diagram, 'whole')).toHaveCount(96);
  await expect(boxPanel(diagram).locator('[data-count]')).toHaveText('4 of 100 ionized');
});

test('the acid control is three radio buttons in a group named Acid, in the brief’s order', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  const radios = acidGroup(diagram).getByRole('radio');
  await expect(radios).toHaveCount(3);
  for (const [i, id] of ACIDS.entries()) await expect(radios.nth(i)).toHaveAccessibleName(RADIO[id]);
  // The group's name is made from the instance's id, so two explorers on one page do not share it.
  const name = await radios.first().getAttribute('name');
  expect(name).toMatch(/^weak-acid-.+-acid$/);
});

test('the slider works from the keyboard: Home, the arrows and End', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await slider(diagram).focus();
  await page.keyboard.press('Home');
  await expect(slider(diagram)).toHaveAttribute('aria-valuetext', '1.0 molar');
  await expect(status(diagram)).toHaveText(FORMIC_10);

  await pressTimes(page, 'ArrowRight', 3);
  await expect(slider(diagram)).toHaveAttribute('aria-valuetext', '0.10 molar');
  await expect(status(diagram)).toHaveText(START_READOUT);

  await page.keyboard.press('End');
  await expect(slider(diagram)).toHaveAttribute('aria-valuetext', '0.0010 molar');
  await expect(status(diagram)).toHaveText(FORMIC_0010);

  await page.keyboard.press('ArrowLeft');
  await expect(slider(diagram)).toHaveAttribute('aria-valuetext', '0.0020 molar');
  await expect(status(diagram)).toHaveText(FORMIC_0020);
});

test('the acid can be chosen from the keyboard, and the concentration stays where it was', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await acidRadio(diagram, 'formic').focus();
  await page.keyboard.press('ArrowDown');
  await expect(acidRadio(diagram, 'butanoic')).toBeChecked();
  await expect(slider(diagram)).toHaveAttribute('aria-valuetext', '0.10 molar');
  await expect(status(diagram)).toHaveText(BUTANOIC_010);

  await pressTimes(page, 'ArrowUp', 2);
  await expect(acidRadio(diagram, 'chloroacetic')).toBeChecked();
  await expect(status(diagram)).toHaveText(CHLOROACETIC_010);

  await page.keyboard.press('ArrowDown');
  await expect(acidRadio(diagram, 'formic')).toBeChecked();
  await expect(status(diagram)).toHaveText(START_READOUT);
});

test('the readout follows the brief at the states the lesson walks through, and at its three kinds of sentence', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  const cases: [AcidKey, number, string][] = [
    ['formic', 3, START_READOUT],
    ['formic', 9, FORMIC_0010],
    ['butanoic', 3, BUTANOIC_010],
    ['chloroacetic', 3, CHLOROACETIC_010],
    ['chloroacetic', 0, CHLOROACETIC_10],
    ['butanoic', 0, BUTANOIC_10],
    ['chloroacetic', 9, CHLOROACETIC_0010],
  ];
  for (const [id, position, sentence] of cases) {
    await chooseAcid(diagram, id);
    await setPosition(diagram, position);
    await expect(status(diagram), `${id} at ${CONCENTRATIONS[position]} M`).toHaveText(sentence);
  }
});

test('the box shows the count of ions the brief gives, and says "fewer than 1" when it draws none', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  // [acid, position, ions, the line under the box], from the brief's table.
  const cases: [AcidKey, number, number, string][] = [
    ['formic', 3, 4, '4 of 100 ionized'],
    ['formic', 9, 34, '34 of 100 ionized'],
    ['butanoic', 3, 1, '1 of 100 ionized'],
    ['butanoic', 0, 0, 'fewer than 1 of 100 ionized'],
    ['butanoic', 1, 1, '1 of 100 ionized'],
    ['chloroacetic', 3, 11, '11 of 100 ionized'],
    ['chloroacetic', 9, 67, '67 of 100 ionized'],
  ];
  for (const [id, position, ions, line] of cases) {
    await chooseAcid(diagram, id);
    await setPosition(diagram, position);
    const where = `${id} at ${CONCENTRATIONS[position]} M`;
    await expect(drawnParticles(diagram, 'pair'), where).toHaveCount(ions);
    await expect(drawnParticles(diagram, 'whole'), where).toHaveCount(100 - ions);
    await expect(boxPanel(diagram).locator('[data-count]'), where).toHaveText(line);
  }
});

test('diluting adds ions without moving those already drawn', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  await chooseAcid(diagram, 'chloroacetic');
  const kinds = () => drawnParticles(diagram).evaluateAll((parts) => parts.map((part) => part.getAttribute('data-particle')));
  let before: (string | null)[] | null = null;
  for (const position of POSITIONS) {
    await setPosition(diagram, position);
    const now = await kinds();
    expect(now).toHaveLength(100);
    if (before) before.forEach((kind, cell) => kind === 'pair' && expect(now[cell], `cell ${cell} at position ${position}`).toBe('pair'));
    before = now;
  }
});

test('a whole molecule and an ion pair differ in shape: one circle, or a small dark circle beside a larger hollow one', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  const whole = drawnParticles(diagram, 'whole').first();
  expect(await whole.evaluate((element) => element.tagName)).toBe('circle');
  const pair = await drawnParticles(diagram, 'pair')
    .first()
    .evaluate((group) => {
      const circles = [...group.querySelectorAll('circle')].map((circle) => ({
        r: Number(circle.getAttribute('r')),
        fill: getComputedStyle(circle).fill,
      }));
      return { circles, marks: group.querySelectorAll('path').length };
    });
  expect(pair.circles).toHaveLength(2);
  expect(pair.marks, 'a plus and a minus').toBe(2);
  const [hydronium, anion] = pair.circles;
  if (!hydronium || !anion) throw new Error('A pair has two circles.');
  expect(hydronium.r).toBeLessThan(anion.r);
  expect(hydronium.fill).not.toBe(anion.fill);
  // The key names both, with the same shapes beside the words.
  await expect(boxPanel(diagram).locator('[data-key-particle="whole"]')).toHaveText('whole molecule, HA');
  await expect(boxPanel(diagram).locator('[data-key-particle="pair"]')).toHaveText('ions, H₃O⁺ and A⁻');
  await expect(boxPanel(diagram).locator('[data-key-particle="pair"] [data-particle="pair"] circle')).toHaveCount(2);
});

test('choosing butanoic acid changes the heavy curve, the marker, the box and the readout', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  const before = {
    chosen: await graph(diagram).locator('[data-chosen-curve]').getAttribute('data-curve'),
    dot: await graph(diagram).locator('[data-dot]').getAttribute('cy'),
    box: await boxDrawing(diagram).getAttribute('aria-label'),
  };
  await chooseAcid(diagram, 'butanoic');

  expect(before.chosen).toBe('formic');
  await expect(graph(diagram).locator('[data-chosen-curve]')).toHaveAttribute('data-curve', 'butanoic');
  expect(await graph(diagram).locator('[data-dot]').getAttribute('cy')).not.toBe(before.dot);
  expect(await boxDrawing(diagram).getAttribute('aria-label')).not.toBe(before.box);
  await expect(status(diagram)).toHaveText(BUTANOIC_010);
  await expect(graph(diagram).locator('[data-curve-name="butanoic"]')).toHaveClass(/is-selected/);
  await expect(graph(diagram).locator('[data-curve-name="formic"]')).not.toHaveClass(/is-selected/);
});

test('both axes are labeled and ticked: 0 to 70 percent, and 1 M at the left to 0.001 M at the right', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  const ticksY = graph(diagram).locator('[data-tick-y]');
  expect(await ticksY.evaluateAll((lines) => lines.map((line) => line.getAttribute('data-tick-y')))).toEqual([
    '0', '10', '20', '30', '40', '50', '60', '70',
  ]);
  const ticksX = graph(diagram).locator('[data-tick-x]');
  expect(await ticksX.evaluateAll((lines) => lines.map((line) => line.getAttribute('data-tick-x')))).toEqual(['1', '0.1', '0.01', '0.001']);
  const xs = await ticksX.evaluateAll((lines) => lines.map((line) => Number(line.getAttribute('x1'))));
  // A logarithmic axis: the four decades are evenly spaced, and sliding right dilutes.
  for (let i = 1; i < xs.length; i++) expectNear((xs[i] ?? 0) - (xs[i - 1] ?? 0), (xs[1] ?? 0) - (xs[0] ?? 0), `decade ${i}`);
  expect(xs[3]).toBeGreaterThan(xs[0] ?? Number.POSITIVE_INFINITY);
});

test('the three curves are drawn from the module, the chosen one heavy and solid, the other two faint, each with its own dashes', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  const { x, y } = await axes(diagram);

  for (const id of ACIDS) {
    const drawn = await pointsOf(graph(diagram).locator(`[data-curve="${id}"]`));
    const want = curve(id);
    expect(drawn, `${id}: points drawn`).toHaveLength(want.length);
    want.forEach((point, i) => {
      const at = drawn[i];
      if (!at) throw new Error('A point is missing.');
      expectNear(at.x, x(point.logConcentration), `${id} point ${i} x`);
      expectNear(at.y, y(point.percent), `${id} point ${i} y`);
    });
  }

  const style = (selector: string) =>
    graph(diagram)
      .locator(selector)
      .evaluate((element) => {
        const s = getComputedStyle(element);
        return { dash: s.strokeDasharray, width: Number.parseFloat(s.strokeWidth) };
      });
  const chosen = await style('[data-curve="formic"]');
  const chloroacetic = await style('[data-curve="chloroacetic"]');
  const butanoic = await style('[data-curve="butanoic"]');
  expect(chosen.dash, 'the chosen curve is solid').toBe('none');
  expect(chloroacetic.dash, 'a faint curve is dashed').not.toBe('none');
  expect(butanoic.dash, 'a faint curve is dashed').not.toBe('none');
  expect(chloroacetic.dash, 'the two faint curves have their own dashes').not.toBe(butanoic.dash);
  expect(chosen.width).toBeGreaterThan(chloroacetic.width);

  // Each curve is named at its right-hand end, the most dilute.
  for (const id of ACIDS) await expect(graph(diagram).locator(`[data-curve-name="${id}"]`)).toHaveText(id);
});

test('a dashed line marks 5 percent, and is named', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  const { y } = await axes(diagram);

  const guide = graph(diagram).locator('[data-guide="check"]');
  expectNear(await numberOf(guide, 'y1'), y(5), 'the 5 percent line');
  expect(await numberOf(guide, 'y2')).toBe(await numberOf(guide, 'y1'));
  expect(await guide.evaluate((element) => getComputedStyle(element).strokeDasharray)).not.toBe('none');
  await expect(graph(diagram).locator('[data-guide-name="check"]')).toHaveText('5 percent');
});

test('over every setting, the readout, the names of the drawings, the marker, the count and the box are those of the module', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  const { x, y } = await axes(diagram);
  let states = 0;
  for (const id of ACIDS) {
    await chooseAcid(diagram, id);
    for (const position of POSITIONS) {
      await setPosition(diagram, position);
      const where = `${id} at ${CONCENTRATIONS[position]} M`;
      const now = weakAcidState(id, position);
      await expect(status(diagram), where).toHaveText(readout(id, position));
      await expect(slider(diagram), where).toHaveAttribute('aria-valuetext', concentrationValueText(position));
      await expect(graph(diagram).getByRole('img'), where).toHaveAccessibleName(describeGraph(id, position));
      await expect(boxDrawing(diagram), where).toHaveAccessibleName(describeBox(id, position));
      await expect(boxPanel(diagram).locator('[data-count]'), where).toHaveText(countText(id, position));
      expectNear(await numberOf(graph(diagram).locator('[data-chosen]'), 'x1'), x(now.logConcentration), `${where}: the marker line`);
      const dot = graph(diagram).locator('[data-dot]');
      expectNear(await numberOf(dot, 'cx'), x(now.logConcentration), `${where}: the dot's x`);
      expectNear(await numberOf(dot, 'cy'), y(now.percent), `${where}: the dot's y`);
      const drawn = await drawnParticles(diagram).evaluateAll((parts, hydroniumOffset) =>
        parts.map((part) => {
          const circle = part.tagName === 'circle' ? part : part.querySelector('circle');
          const offset = part.tagName === 'circle' ? 0 : hydroniumOffset;
          return {
            ionized: part.getAttribute('data-particle') === 'pair',
            x: Number(circle?.getAttribute('cx')) - offset,
            y: Number(circle?.getAttribute('cy')),
          };
        }),
      BOX.hydroniumOffset);
      const want = particles(id, position);
      expect(drawn.map((p) => p.ionized), `${where}: the ions`).toEqual(want.map((p) => p.ionized));
      drawn.forEach((p, cell) => {
        expectNear(p.x, want[cell]?.x ?? Number.NaN, `${where}: cell ${cell} x`, 0.01);
        expectNear(p.y, want[cell]?.y ?? Number.NaN, `${where}: cell ${cell} y`, 0.01);
      });
      states += 1;
    }
  }
  expect(states, 'three acids at ten concentrations').toBe(30);
});

interface Box {
  name: string;
  left: number;
  right: number;
  top: number;
  bottom: number;
}

/** Every text in the graph, as a box in drawing units: its whole line box, which is larger than its glyphs, so the checks err on the safe side. */
async function textBoxes(diagram: Locator): Promise<Box[]> {
  return graph(diagram)
    .locator('svg')
    .evaluate((svg) => {
      if (!(svg instanceof SVGSVGElement)) throw new Error('The drawing is not an SVG.');
      const frame = svg.getBoundingClientRect();
      const scale = svg.viewBox.baseVal.width / frame.width;
      return [...svg.querySelectorAll('text')].map((text) => {
        const box = text.getBoundingClientRect();
        const name =
          text.getAttribute('data-curve-name') ?? text.getAttribute('data-guide-name') ?? text.getAttribute('data-axis-label') ?? text.textContent ?? '';
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

// The names of the three curves and of the 5 percent line stand right of the plot, where the marker
// never goes; the tick labels and axis titles stand outside it. So no label may meet another, a curve,
// the 5 percent line, the marker line or the dot, for any acid at any concentration.
test('at every setting no text is cut off, and no label meets another label, a curve, the 5 percent line or the marker', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  await page.evaluate(() => document.fonts.ready);
  let states = 0;

  for (const id of ACIDS) {
    await chooseAcid(diagram, id);
    const labels = await textBoxes(diagram);
    expect(labels, 'eight percent ticks, four concentration ticks, two axis titles, three curve names and the line’s name').toHaveLength(18);

    const frame = await graph(diagram)
      .locator('svg')
      .evaluate((svg) => (svg instanceof SVGSVGElement ? { width: svg.viewBox.baseVal.width, height: svg.viewBox.baseVal.height } : null));
    if (!frame) throw new Error('The drawing is not an SVG.');
    for (const label of labels) {
      expect(label.left >= -0.5 && label.top >= -0.5 && label.right <= frame.width + 0.5 && label.bottom <= frame.height + 0.5, `"${label.name}" is cut off`).toBe(
        true,
      );
    }
    for (let i = 0; i < labels.length; i++) {
      for (let j = i + 1; j < labels.length; j++) {
        const [one, two] = [labels[i], labels[j]];
        if (!one || !two) throw new Error('A label is missing.');
        expect(apart(one, two), `"${one.name}" and "${two.name}" overlap`).toBe(true);
      }
    }

    const curves = await Promise.all(ACIDS.map(async (acid) => finePoints(await pointsOf(graph(diagram).locator(`[data-curve="${acid}"]`)))));
    const guide = graph(diagram).locator('[data-guide="check"]');
    const guideLine = finePoints([
      { x: await numberOf(guide, 'x1'), y: await numberOf(guide, 'y1') },
      { x: await numberOf(guide, 'x2'), y: await numberOf(guide, 'y2') },
    ]);
    for (const label of labels) {
      for (const [k, points] of curves.entries()) {
        expect(points.filter((p) => near(label, p, CLEARANCE)), `"${label.name}" touches the ${ACIDS[k]} curve`).toEqual([]);
      }
      expect(guideLine.filter((p) => near(label, p, CLEARANCE)), `"${label.name}" touches the 5 percent line`).toEqual([]);
    }

    for (const position of POSITIONS) {
      await setPosition(diagram, position);
      const where = `${id} at ${CONCENTRATIONS[position]} M`;
      const chosen = graph(diagram).locator('[data-chosen]');
      const markerLine = finePoints([
        { x: await numberOf(chosen, 'x1'), y: await numberOf(chosen, 'y1') },
        { x: await numberOf(chosen, 'x2'), y: await numberOf(chosen, 'y2') },
      ]);
      const dot = graph(diagram).locator('[data-dot]');
      const reach = (await numberOf(dot, 'r')) + Number.parseFloat(await dot.evaluate((element) => getComputedStyle(element).strokeWidth)) / 2;
      const center = { x: await numberOf(dot, 'cx'), y: await numberOf(dot, 'cy') };
      for (const label of labels) {
        expect(markerLine.filter((p) => near(label, p, 1)), `${where}: the marker line crosses "${label.name}"`).toEqual([]);
        const distance = Math.hypot(Math.max(label.left - center.x, 0, center.x - label.right), Math.max(label.top - center.y, 0, center.y - label.bottom));
        expect(distance, `${where}: the dot touches "${label.name}"`).toBeGreaterThanOrEqual(reach);
      }
      states += 1;
    }
  }
  expect(states).toBe(30);
});

test("each drawing's name says what is drawn now", async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await expect(boxDrawing(diagram)).toHaveAccessibleName(
    'A box of 100 particles of formic acid: 96 whole molecules, drawn as filled circles, and 4 ionized, each drawn as a hydronium ion, a small dark circle marked plus, beside a formate ion, a hollow circle marked minus.',
  );
  await expect(graph(diagram).getByRole('img')).toHaveAccessibleName(
    /^Graph of percent ionized, from 0 to 70 percent, against starting concentration on a logarithmic scale, from 1 M at the left to 0\.001 M at the right\./,
  );
  await expect(graph(diagram).getByRole('img')).toHaveAccessibleName(/A marker at 0\.10 M is on the curve of formic acid, at 4\.2 percent\.$/);

  await chooseAcid(diagram, 'butanoic');
  await setPosition(diagram, 0);
  await expect(boxDrawing(diagram)).toHaveAccessibleName(
    'A box of 100 particles of butanoic acid, all drawn as whole molecules, filled circles: fewer than 1 in 100 is ionized.',
  );
  await expect(graph(diagram).getByRole('img')).toHaveAccessibleName(/A marker at 1\.0 M is on the curve of butanoic acid, at 0\.39 percent\.$/);
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
  // 8 percent ticks, 4 concentration ticks, 2 axis titles, 3 curve names and the line's name.
  expect(sizes).toHaveLength(18);
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
    expect(sizes).toHaveLength(18);
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

test('the graph is no wider than 22rem, the box’s column no wider than 12rem and its drawing no wider than 10rem', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  const diagram = await openDiagram(page, PAGE, NAME);

  const plot = await graph(diagram).boundingBox();
  const box = await boxPanel(diagram).boundingBox();
  const drawing = await boxDrawing(diagram).boundingBox();
  if (!plot || !box || !drawing) throw new Error('A part has no bounding box.');
  expect(plot.width).toBeLessThanOrEqual(22 * 16 + 1);
  expect(box.width).toBeLessThanOrEqual(12 * 16 + 1);
  expect(drawing.width).toBeLessThanOrEqual(10 * 16 + 1);
});

test('the order is the box and the graph, the slider and the choice of acid, then the readout', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  const parts = await Promise.all([boxPanel(diagram), graph(diagram), slider(diagram), acidGroup(diagram), status(diagram)].map((part) => part.boundingBox()));
  const [box, plot, concentration, acids, readoutBox] = parts;
  if (!box || !plot || !concentration || !acids || !readoutBox) throw new Error('A part of the diagram has no box.');

  const drawingsBottom = Math.max(box.y + box.height, plot.y + plot.height);
  expect(concentration.y, 'the slider is under the drawings').toBeGreaterThanOrEqual(drawingsBottom);
  expect(acids.y, 'the choice of acid is under the slider').toBeGreaterThanOrEqual(concentration.y + concentration.height);
  expect(readoutBox.y, 'the readout is under the controls').toBeGreaterThanOrEqual(acids.y + acids.height);
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
    box: await boxDrawing(diagram).boundingBox(),
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
    // The longest readout of all 30 settings, found from the module.
    let longest = { id: 'formic' as AcidKey, position: 3, text: '' };
    for (const id of ACIDS) {
      for (const position of POSITIONS) {
        const text = readout(id, position);
        if (text.length > longest.text.length) longest = { id, position, text };
      }
    }
    await chooseAcid(diagram, longest.id);
    await setPosition(diagram, longest.position);
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
  test(`the diagram has no accessibility violations in the ${theme} theme, at the start and with chloroacetic acid at 0.0010 M`, async ({ page }) => {
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
    await chooseAcid(diagram, 'chloroacetic');
    await setPosition(diagram, 9);
    await expect(status(diagram)).toHaveText(CHLOROACETIC_0010);

    expect(await violations(), 'chloroacetic acid at 0.0010 M').toEqual([]);
  });
}

test('in print the controls are hidden and the box, the graph and the readout stay', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  await page.emulateMedia({ media: 'print' });

  await expect(diagram.locator('.diagram-controls')).toBeHidden();
  await expect(boxDrawing(diagram)).toBeVisible();
  await expect(graph(diagram).getByRole('img')).toBeVisible();
  await expect(boxPanel(diagram).locator('[data-count]')).toBeVisible();
  await expect(status(diagram)).toHaveText(START_READOUT);
});

test('the caption under the diagram names the acids and their Ka values, 25 °C, the full equilibrium and the rounding of the box', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  const caption = page.locator('[data-part="diagram"]', { has: diagram }).locator('> figcaption');

  await expect(caption).toHaveText(CAPTION);
});

test.describe('with JavaScript off', () => {
  test.use({ javaScriptEnabled: false });

  test('the box, the graph and the starting readout show, with no controls', async ({ page }) => {
    await expectStaticDiagram(page, PAGE, NAME, START_READOUT);

    const diagram = page.locator(`[data-diagram="${NAME}"]`);
    await expect(boxDrawing(diagram)).toBeVisible();
    await expect(graph(diagram).getByRole('img')).toBeVisible();
    await expect(drawnParticles(diagram, 'pair')).toHaveCount(4);
    await expect(drawnParticles(diagram, 'whole')).toHaveCount(96);
    await expect(boxPanel(diagram).locator('[data-count]')).toHaveText('4 of 100 ionized');
    await expect(graph(diagram).locator('[data-chosen-curve]')).toHaveAttribute('data-curve', 'formic');
    const { x, y } = await axes(diagram);
    const start = weakAcidState('formic', 3);
    expectNear(await numberOf(graph(diagram).locator('[data-dot]'), 'cx'), x(start.logConcentration), "the dot's x");
    expectNear(await numberOf(graph(diagram).locator('[data-dot]'), 'cy'), y(start.percent), "the dot's y");
  });
});
