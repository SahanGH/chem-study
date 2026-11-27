import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator, type Page } from '@playwright/test';
import {
  bars,
  bufferMark,
  curve,
  describeBars,
  describeGraph,
  readout,
  state as titrationCurveState,
  volumeValueText,
  type IndicatorChoice,
} from '../../src/lib/titration-curve';
import { expectStaticDiagram, openDiagram } from './diagram';

const PAGE = '/unit-8-acids-and-bases/8-5-acid-base-titrations/';
const NAME = 'titration-curve';

// Every sentence and number below is written out from lesson 8.5's brief, "Diagram data" (the
// controls, the readout sentences, every state's pH and the indicators over the two curves), apart
// from the module under test. Only the sweeps over every setting compare the drawing with the module.
const START_READOUT = 'No base yet. The flask holds 3.00 mmol of lactic acid, a weak acid, and nothing else that matters. pH 2.35.';
const LACTIC_HALF = 'Half-equivalence point: 1.50 mmol of lactic acid and 1.50 mmol of lactate ion. Equal amounts, so pH = pKa = 3.86.';
const LACTIC_EQUIVALENCE =
  'Equivalence point: all 3.00 mmol of the acid has reacted. The flask holds lactate ion alone, a weak base, so the pH is above 7: 8.40.';
const LACTIC_05 = '2.90 mmol of lactic acid and 0.10 mmol of lactate ion. The acid still outweighs the lactate by more than ten to one. pH 2.59.';
const LACTIC_145 = '0.10 mmol of lactic acid and 2.90 mmol of lactate ion. The lactate now outweighs the acid by more than ten to one. pH 5.32.';
const LACTIC_5 = 'Buffer region: 2.00 mmol of lactic acid and 1.00 mmol of lactate ion, both members of the pair. pH 3.56.';
const PAST_155 = 'Past the equivalence point: 0.10 mmol of OH⁻ is left over, and it sets the pH: 11.45.';
const PAST_30 = 'Past the equivalence point: 3.00 mmol of OH⁻ is left over, and it sets the pH: 12.78.';
const HBR_START = 'No base yet. The flask holds 3.00 mmol of H₃O⁺ from hydrobromic acid, a strong acid. pH 0.82.';
const HBR_75 = '1.50 mmol of H₃O⁺ is left, and it sets the pH: 1.26.';
const HBR_EQUIVALENCE = 'Equivalence point: neither H₃O⁺ nor OH⁻ is left over. The flask holds Na⁺, Br⁻ and water. pH 7.00 at 25 °C.';
const GREEN_70 =
  'Buffer region: 1.60 mmol of lactic acid and 1.40 mmol of lactate ion, both members of the pair. pH 3.80. ' +
  'Bromocresol green is green here, partway from yellow to blue. On this curve its color changes between 6.96 mL and 14.58 mL.';
const THYMOL_HBR_0 = `${HBR_START} Thymol blue is red here. On this curve its second change, from yellow to blue, comes between 15.00 mL and 15.01 mL.`;
const BROMOTHYMOL_HBR_15 = `${HBR_EQUIVALENCE} Bromothymol blue is green here, partway from yellow to blue. On this curve its color changes within 0.01 mL of 15.00 mL.`;
const CAPTION =
  '20.0 mL of 0.150 M acid, lactic acid (pKa 3.86, so Ka = 10⁻³·⁸⁶) or hydrobromic acid, titrated with 0.200 M sodium hydroxide at 25 °C: the flask of topic 4.6, with its equivalence point at 15.0 mL for either acid. The volumes are taken to add. The amounts are those left after the base added has reacted completely. Every pH comes from the full equilibrium, water’s own ions included, so it can differ in the last place from a calculation by hand. Thymol blue’s band is its second change; its first, red to yellow from pH 1.2 to 2.8, is not drawn.';

type AcidKey = 'lactic' | 'hydrobromic';
const ACIDS: AcidKey[] = ['lactic', 'hydrobromic'];
const ACID_RADIO: Record<AcidKey, string> = { lactic: 'Lactic acid (weak)', hydrobromic: 'Hydrobromic acid (strong)' };
const INDICATORS: IndicatorChoice[] = ['none', 'bromocresolGreen', 'bromothymolBlue', 'thymolBlue'];
const INDICATOR_RADIO: Record<IndicatorChoice, string> = {
  none: 'None',
  bromocresolGreen: 'Bromocresol green',
  bromothymolBlue: 'Bromothymol blue',
  thymolBlue: 'Thymol blue',
};
const VOLUMES = Array.from({ length: 61 }, (_, i) => i / 2);
// A sweep of settings for the slower checks: every 2.5 mL and every step near the equivalence point.
const SWEEP = VOLUMES.filter((v) => v % 2.5 === 0 || (v >= 13.5 && v <= 16.5));

const graph = (diagram: Locator) => diagram.locator('[data-panel="graph"]');
const barsPanel = (diagram: Locator) => diagram.locator('[data-panel="bars"]');
const status = (diagram: Locator) => diagram.getByRole('status');
const slider = (diagram: Locator) => diagram.getByRole('slider', { name: 'NaOH added', exact: true });
const acidGroup = (diagram: Locator) => diagram.getByRole('group', { name: 'Acid in the flask' });
const indicatorGroup = (diagram: Locator) => diagram.getByRole('group', { name: 'Indicator' });
const acidRadio = (diagram: Locator, id: AcidKey) => acidGroup(diagram).getByRole('radio', { name: ACID_RADIO[id] });
const indicatorRadio = (diagram: Locator, id: IndicatorChoice) => indicatorGroup(diagram).getByRole('radio', { name: INDICATOR_RADIO[id], exact: true });

const mL = (v: number) => v.toFixed(1);

/** Chooses an acid and waits until the drawing has changed to it: the graph's name says what is drawn. */
async function chooseAcid(diagram: Locator, id: AcidKey) {
  await acidRadio(diagram, id).check();
  await expect(graph(diagram).getByRole('img')).toHaveAccessibleName(new RegExp(`The curve of ${id} acid is drawn heavy`));
}

async function chooseIndicator(diagram: Locator, id: IndicatorChoice) {
  await indicatorRadio(diagram, id).check();
  if (id === 'none') await expect(graph(diagram).locator('[data-band]')).toHaveCount(0);
  else await expect(graph(diagram).locator('[data-band]')).toHaveAttribute('data-band', id);
}

async function setVolume(diagram: Locator, volume: number) {
  await slider(diagram).fill(String(volume));
  await expect(slider(diagram)).toHaveAttribute('aria-valuetext', `${mL(volume)} milliliters of sodium hydroxide added`);
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

/** Where the graph's axes put a volume (ticks at 0 and 30 mL) and a pH (ticks at 0 and 14). */
async function axes(diagram: Locator) {
  const x0 = await numberOf(graph(diagram).locator('[data-tick-x="0"]'), 'x1');
  const x30 = await numberOf(graph(diagram).locator('[data-tick-x="30"]'), 'x1');
  const y0 = await numberOf(graph(diagram).locator('[data-tick-y="0"]'), 'y1');
  const y14 = await numberOf(graph(diagram).locator('[data-tick-y="14"]'), 'y1');
  return {
    x: (volume: number) => x0 + (volume / 30) * (x30 - x0),
    y: (pH: number) => y0 + (pH / 14) * (y14 - y0),
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

test('the diagram starts with lactic acid, no base and no indicator, with its readout, graph and bars', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await expect(status(diagram)).toHaveText(START_READOUT);
  await expect(acidRadio(diagram, 'lactic')).toBeChecked();
  await expect(acidRadio(diagram, 'hydrobromic')).not.toBeChecked();
  await expect(indicatorRadio(diagram, 'none')).toBeChecked();
  await expect(slider(diagram)).toHaveAttribute('aria-valuetext', '0.0 milliliters of sodium hydroxide added');
  await expect(slider(diagram)).toHaveAttribute('min', '0');
  await expect(slider(diagram)).toHaveAttribute('max', '30');
  await expect(slider(diagram)).toHaveAttribute('step', '0.5');
  await expect(slider(diagram)).toHaveValue('0');
  await expect(diagram.locator('.diagram-slider-value')).toHaveText('0.0 mL');
  await expect(graph(diagram).locator('[data-axis-label="y"]')).toHaveText('pH');
  await expect(graph(diagram).locator('[data-axis-label="x"]')).toHaveText('NaOH added (mL)');
  await expect(graph(diagram).locator('[data-band]')).toHaveCount(0);
  await expect(graph(diagram).locator('[data-buffer]')).toHaveCount(1);
  await expect(barsPanel(diagram).locator('figcaption')).toHaveText('What is in the flask');
  await expect(barsPanel(diagram).locator('[data-bar-value]')).toHaveText(['3.00 mmol', '0.00 mmol', '0.00 mmol']);
});

test('the two choices are radio groups named "Acid in the flask" and "Indicator", in the brief’s order, with names unique to the instance', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  const acids = acidGroup(diagram).getByRole('radio');
  await expect(acids).toHaveCount(2);
  for (const [i, id] of ACIDS.entries()) await expect(acids.nth(i)).toHaveAccessibleName(ACID_RADIO[id]);
  const indicators = indicatorGroup(diagram).getByRole('radio');
  await expect(indicators).toHaveCount(4);
  for (const [i, id] of INDICATORS.entries()) await expect(indicators.nth(i)).toHaveAccessibleName(INDICATOR_RADIO[id]);
  expect(await acids.first().getAttribute('name')).toMatch(/^titration-curve-.+-acid$/);
  expect(await indicators.first().getAttribute('name')).toMatch(/^titration-curve-.+-indicator$/);
});

test('the slider works from the keyboard: the arrows, Page Up, Home and End', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await slider(diagram).focus();
  await page.keyboard.press('ArrowRight');
  await expect(slider(diagram)).toHaveAttribute('aria-valuetext', volumeValueText(0.5));
  await expect(status(diagram)).toHaveText(LACTIC_05);

  await pressTimes(page, 'ArrowRight', 14);
  await expect(slider(diagram)).toHaveAttribute('aria-valuetext', volumeValueText(7.5));
  await expect(status(diagram)).toHaveText(LACTIC_HALF);

  await pressTimes(page, 'ArrowRight', 15);
  await expect(status(diagram)).toHaveText(LACTIC_EQUIVALENCE);

  await page.keyboard.press('End');
  await expect(slider(diagram)).toHaveAttribute('aria-valuetext', volumeValueText(30));
  await expect(status(diagram)).toHaveText(PAST_30);

  await page.keyboard.press('Home');
  await expect(status(diagram)).toHaveText(START_READOUT);
});

test('the acid and the indicator can be chosen from the keyboard, and the volume stays where it was', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  await setVolume(diagram, 7.5);

  await acidRadio(diagram, 'lactic').focus();
  await page.keyboard.press('ArrowDown');
  await expect(acidRadio(diagram, 'hydrobromic')).toBeChecked();
  await expect(slider(diagram)).toHaveAttribute('aria-valuetext', volumeValueText(7.5));
  await expect(status(diagram)).toHaveText(HBR_75);

  await page.keyboard.press('ArrowUp');
  await expect(acidRadio(diagram, 'lactic')).toBeChecked();
  await expect(status(diagram)).toHaveText(LACTIC_HALF);

  await indicatorRadio(diagram, 'none').focus();
  await page.keyboard.press('ArrowDown');
  await expect(indicatorRadio(diagram, 'bromocresolGreen')).toBeChecked();
  await expect(status(diagram)).toHaveText(readout('lactic', 7.5, 'bromocresolGreen'));
  await pressTimes(page, 'ArrowDown', 2);
  await expect(indicatorRadio(diagram, 'thymolBlue')).toBeChecked();
  await expect(graph(diagram).locator('[data-band]')).toHaveAttribute('data-band', 'thymolBlue');
});

test('the readout follows the brief at the states the lessons walk through', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  const cases: [AcidKey, number, IndicatorChoice, string][] = [
    ['lactic', 0, 'none', START_READOUT],
    ['lactic', 5, 'none', LACTIC_5],
    ['lactic', 7.5, 'none', LACTIC_HALF],
    ['lactic', 14.5, 'none', LACTIC_145],
    ['lactic', 15, 'none', LACTIC_EQUIVALENCE],
    ['lactic', 15.5, 'none', PAST_155],
    ['lactic', 7, 'bromocresolGreen', GREEN_70],
    ['hydrobromic', 0, 'none', HBR_START],
    ['hydrobromic', 7.5, 'none', HBR_75],
    ['hydrobromic', 15, 'none', HBR_EQUIVALENCE],
    ['hydrobromic', 15.5, 'none', PAST_155],
    ['hydrobromic', 0, 'thymolBlue', THYMOL_HBR_0],
    ['hydrobromic', 15, 'bromothymolBlue', BROMOTHYMOL_HBR_15],
  ];
  for (const [id, volume, indicator, sentence] of cases) {
    await chooseAcid(diagram, id);
    await chooseIndicator(diagram, indicator);
    await setVolume(diagram, volume);
    await expect(status(diagram), `${id} at ${mL(volume)} mL with ${indicator}`).toHaveText(sentence);
  }
});

test('lesson 8.7’s numbers: the volumes between which each indicator changes on each curve', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  const cases: [AcidKey, IndicatorChoice, string][] = [
    ['lactic', 'bromocresolGreen', 'between 6.96 mL and 14.58 mL.'],
    ['lactic', 'bromothymolBlue', 'between 14.89 mL and 15.00 mL.'],
    ['lactic', 'thymolBlue', 'between 15.00 mL and 15.01 mL.'],
    ['hydrobromic', 'bromocresolGreen', 'between 14.97 mL and 15.00 mL.'],
    ['hydrobromic', 'bromothymolBlue', 'within 0.01 mL of 15.00 mL.'],
    ['hydrobromic', 'thymolBlue', 'between 15.00 mL and 15.01 mL.'],
  ];
  for (const [id, indicator, ending] of cases) {
    await chooseAcid(diagram, id);
    await chooseIndicator(diagram, indicator);
    await expect(status(diagram), `${id} with ${indicator}`).toHaveText(new RegExp(`${ending.replace(/\./g, '\\.')}$`));
  }
});

test('choosing hydrobromic acid changes the heavy curve, the marker, the bars and the guides', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  const dotBefore = await graph(diagram).locator('[data-dot]').getAttribute('cy');
  await chooseAcid(diagram, 'hydrobromic');

  await expect(graph(diagram).locator('[data-chosen-curve]')).toHaveAttribute('data-curve', 'hydrobromic');
  expect(await graph(diagram).locator('[data-dot]').getAttribute('cy')).not.toBe(dotBefore);
  await expect(graph(diagram).locator('[data-guide="half"]')).toHaveCount(0);
  await expect(graph(diagram).locator('[data-guide-name="half"]')).toHaveCount(0);
  await expect(graph(diagram).locator('[data-buffer]')).toHaveCount(0);
  await expect(graph(diagram).locator('[data-guide="equivalence"]')).toHaveCount(1);
  await expect(barsPanel(diagram).locator('[data-bar]')).toHaveCount(2);
  await expect(barsPanel(diagram).locator('[data-bar-name]')).toHaveText(['H₃O⁺ left', 'OH⁻ left over']);
  await expect(barsPanel(diagram).locator('[data-spectators]')).toHaveText('Br⁻ and Na⁺ are spectators');
  await expect(status(diagram)).toHaveText(HBR_START);
});

test('both axes are labeled and ticked: pH 0 to 14 and 0 to 30 mL', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  const ticksY = graph(diagram).locator('[data-tick-y]');
  expect(await ticksY.evaluateAll((lines) => lines.map((line) => line.getAttribute('data-tick-y')))).toEqual(['0', '2', '4', '6', '8', '10', '12', '14']);
  const ticksX = graph(diagram).locator('[data-tick-x]');
  expect(await ticksX.evaluateAll((lines) => lines.map((line) => line.getAttribute('data-tick-x')))).toEqual(['0', '5', '10', '15', '20', '25', '30']);
});

test('the two curves are drawn from the module, the chosen one heavy and solid, the other faint and dashed', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  const { x, y } = await axes(diagram);

  for (const id of ACIDS) {
    const drawn = await pointsOf(graph(diagram).locator(`[data-curve="${id}"]`));
    const want = curve(id);
    expect(drawn, `${id}: points drawn`).toHaveLength(want.length);
    want.forEach((point, i) => {
      const at = drawn[i];
      if (!at) throw new Error('A point is missing.');
      expectNear(at.x, x(point.volume), `${id} point ${i} x`);
      expectNear(at.y, y(point.pH), `${id} point ${i} y`);
    });
  }
  const style = (selector: string) =>
    graph(diagram)
      .locator(selector)
      .evaluate((element) => {
        const s = getComputedStyle(element);
        return { dash: s.strokeDasharray, width: Number.parseFloat(s.strokeWidth) };
      });
  const chosen = await style('[data-curve="lactic"]');
  const faint = await style('[data-curve="hydrobromic"]');
  expect(chosen.dash, 'the chosen curve is solid').toBe('none');
  expect(faint.dash, 'the other curve is dashed').not.toBe('none');
  expect(chosen.width).toBeGreaterThan(faint.width);
  // The key under the graph names both, and the buffer region.
  await expect(graph(diagram).locator('[data-key]')).toHaveText(['lactic acid', 'hydrobromic acid', 'buffer region, 1.36 to 13.64 mL']);
});

test('the guides stand at 15.0 mL and, for lactic acid, 7.5 mL; the buffer region is marked from 1.36 to 13.64 mL, untextured', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  const { x, y } = await axes(diagram);

  expectNear(await numberOf(graph(diagram).locator('[data-guide="equivalence"]'), 'x1'), x(15), 'the equivalence line');
  expectNear(await numberOf(graph(diagram).locator('[data-guide="half"]'), 'x1'), x(7.5), 'the half-equivalence line');
  await expect(graph(diagram).locator('[data-guide-name="equivalence"]')).toHaveText('equivalence point');
  await expect(graph(diagram).locator('[data-guide-name="half"]')).toHaveText('half-equivalence point');
  const mark = await pointsOf(graph(diagram).locator('[data-buffer]'));
  const want = bufferMark();
  expect(mark).toHaveLength(want.length);
  expectNear(mark[0]?.x ?? Number.NaN, x(15 / 11), 'the start of the buffer region');
  expectNear(mark.at(-1)?.x ?? Number.NaN, x(150 / 11), 'the end of the buffer region');
  want.forEach((p, i) => expectNear(mark[i]?.y ?? Number.NaN, y(p.pH), `buffer point ${i}`));
  const fill = await graph(diagram)
    .locator('[data-buffer]')
    .evaluate((element) => getComputedStyle(element).fill);
  expect(fill).toBe('none');
});

test('each indicator lays a hatched band over its range, named "yellow" below and "blue" above; thymol blue’s is its second range', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  const { y } = await axes(diagram);
  const ranges: [IndicatorChoice, number, number][] = [
    ['bromocresolGreen', 3.8, 5.4],
    ['bromothymolBlue', 6.0, 7.6],
    ['thymolBlue', 8.0, 9.6],
  ];
  for (const [id, low, high] of ranges) {
    await chooseIndicator(diagram, id);
    const rect = graph(diagram).locator('[data-band]');
    expectNear(await numberOf(rect, 'y'), y(high), `${id}: the top of the band`);
    expectNear((await numberOf(rect, 'y')) + (await numberOf(rect, 'height')), y(low), `${id}: the bottom of the band`);
    expect(await rect.getAttribute('fill')).toMatch(/^url\(#titration-curve-.+-hatch\)$/);
    await expect(graph(diagram).locator('[data-band-name="above"]')).toHaveText('blue');
    await expect(graph(diagram).locator('[data-band-name="below"]')).toHaveText('yellow');
    expect(await numberOf(graph(diagram).locator('[data-band-name="above"]'), 'y')).toBeLessThan(y(high));
    expect(await numberOf(graph(diagram).locator('[data-band-name="below"]'), 'y')).toBeGreaterThan(y(low));
  }
  // The hatching's id is the instance's own.
  const hatchId = (await graph(diagram).locator('[data-band]').getAttribute('fill'))?.slice(5, -1) ?? '';
  await expect(page.locator(`[id="${hatchId}"]`)).toHaveCount(1);
});

test('over every setting, the readout, the names of the drawings, the marker and the bars are those of the module', async ({ page }) => {
  test.setTimeout(240_000);
  const diagram = await openDiagram(page, PAGE, NAME);
  const { x, y } = await axes(diagram);
  let states = 0;
  for (const id of ACIDS) {
    await chooseAcid(diagram, id);
    for (const indicator of INDICATORS) {
      await chooseIndicator(diagram, indicator);
      const volumes = indicator === 'none' ? VOLUMES : SWEEP;
      for (const volume of volumes) {
        await setVolume(diagram, volume);
        const where = `${id} at ${mL(volume)} mL with ${indicator}`;
        const now = titrationCurveState(id, volume);
        await expect(status(diagram), where).toHaveText(readout(id, volume, indicator));
        await expect(diagram.locator('.diagram-slider-value'), where).toHaveText(`${mL(volume)} mL`);
        await expect(graph(diagram).getByRole('img'), where).toHaveAccessibleName(describeGraph(id, volume, indicator));
        await expect(barsPanel(diagram).getByRole('img'), where).toHaveAccessibleName(describeBars(id, volume));
        expectNear(await numberOf(graph(diagram).locator('[data-chosen]'), 'x1'), x(volume), `${where}: the marker line`);
        const dot = graph(diagram).locator('[data-dot]');
        expectNear(await numberOf(dot, 'cx'), x(volume), `${where}: the dot's x`);
        expectNear(await numberOf(dot, 'cy'), y(now.pH), `${where}: the dot's y`);
        await expect(barsPanel(diagram).locator('[data-bar-value]'), where).toHaveText(bars(id, volume).rows.map((r) => r.text));
        states += 1;
      }
    }
  }
  expect(states).toBe(2 * (61 + 3 * SWEEP.length));
});

test('the bars grow with the amounts, a full bar being 3.00 mmol, and each amount is written at its bar’s end', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  const full = async (volume: number, id: AcidKey) => {
    await chooseAcid(diagram, id);
    await setVolume(diagram, volume);
    return barsPanel(diagram)
      .locator('[data-bar]')
      .evaluateAll((rects) => rects.map((r) => ({ id: r.getAttribute('data-bar'), x: Number(r.getAttribute('x')), width: Number(r.getAttribute('width')) })));
  };
  const start = await full(0, 'lactic');
  const widthOfFull = start[0]?.width ?? 0;
  expect(widthOfFull).toBeGreaterThan(0);
  expect(start.slice(1).map((b) => b.width)).toEqual([0, 0]);
  const half = await full(7.5, 'lactic');
  expectNear(half[0]?.width ?? 0, widthOfFull / 2, 'lactic acid left at 7.5 mL');
  expectNear(half[1]?.width ?? 0, widthOfFull / 2, 'lactate formed at 7.5 mL');
  const end = await full(30, 'hydrobromic');
  expectNear(end[1]?.width ?? 0, widthOfFull, 'OH⁻ left over at 30.0 mL');
  for (const bar of end) {
    const value = barsPanel(diagram).locator(`[data-bar-value="${bar.id}"]`);
    expect(await numberOf(value, 'x')).toBeGreaterThan(bar.x + bar.width);
  }
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
  return panel.locator('svg[role="img"]').evaluate((svg) => {
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
// Half the thickest stroke, and a little more; the buffer mark's broad stroke has its own.
const CLEARANCE = 2.5;
const BUFFER_CLEARANCE = 6.5;

// No text stands inside the plot: the guides are named above it, the band's colors right of it, the
// curves in the key. So no label may meet another, a curve, the buffer mark, a guide, the band's
// edges, the marker line or the dot, for either acid with any indicator at any volume.
test('at every setting no text is cut off, and no label meets another label, a curve, a guide, the band or the marker', async ({ page }) => {
  test.setTimeout(240_000);
  const diagram = await openDiagram(page, PAGE, NAME);
  await page.evaluate(() => document.fonts.ready);
  let states = 0;

  for (const id of ACIDS) {
    await chooseAcid(diagram, id);
    for (const indicator of INDICATORS) {
      await chooseIndicator(diagram, indicator);
      const labels = await textBoxes(graph(diagram));
      const expected = 8 + 7 + 2 + 1 + (id === 'lactic' ? 1 : 0) + (indicator === 'none' ? 0 : 2);
      expect(labels, `${id} with ${indicator}: the labels`).toHaveLength(expected);
      const frame = await graph(diagram)
        .locator('svg[role="img"]')
        .evaluate((svg) => (svg instanceof SVGSVGElement ? { width: svg.viewBox.baseVal.width, height: svg.viewBox.baseVal.height } : null));
      if (!frame) throw new Error('The drawing is not an SVG.');
      for (const label of labels) {
        expect(label.left >= -0.5 && label.top >= -0.5 && label.right <= frame.width + 0.5 && label.bottom <= frame.height + 0.5, `"${label.name}" is cut off`).toBe(true);
      }
      for (let i = 0; i < labels.length; i++) {
        for (let j = i + 1; j < labels.length; j++) {
          const [one, two] = [labels[i], labels[j]];
          if (!one || !two) throw new Error('A label is missing.');
          expect(apart(one, two), `"${one.name}" and "${two.name}" overlap`).toBe(true);
        }
      }

      const curves = await Promise.all(ACIDS.map(async (acid) => finePoints(await pointsOf(graph(diagram).locator(`[data-curve="${acid}"]`)))));
      const guides = await Promise.all((await graph(diagram).locator('[data-guide]').all()).map(lineOf));
      const buffer = id === 'lactic' ? finePoints(await pointsOf(graph(diagram).locator('[data-buffer]'))) : [];
      let bandEdges: Point[] = [];
      if (indicator !== 'none') {
        const rect = graph(diagram).locator('[data-band]');
        const [bx, by, bw, bh] = await Promise.all(['x', 'y', 'width', 'height'].map((a) => numberOf(rect, a)));
        bandEdges = finePoints([
          { x: bx ?? 0, y: by ?? 0 },
          { x: (bx ?? 0) + (bw ?? 0), y: by ?? 0 },
          { x: (bx ?? 0) + (bw ?? 0), y: (by ?? 0) + (bh ?? 0) },
          { x: bx ?? 0, y: (by ?? 0) + (bh ?? 0) },
          { x: bx ?? 0, y: by ?? 0 },
        ]);
      }
      for (const label of labels) {
        for (const [k, points] of curves.entries()) {
          expect(points.filter((p) => near(label, p, CLEARANCE)), `"${label.name}" touches the ${ACIDS[k]} curve`).toEqual([]);
        }
        for (const guide of guides) expect(guide.filter((p) => near(label, p, CLEARANCE)), `"${label.name}" touches a guide`).toEqual([]);
        expect(buffer.filter((p) => near(label, p, BUFFER_CLEARANCE)), `"${label.name}" touches the buffer mark`).toEqual([]);
        expect(bandEdges.filter((p) => near(label, p, CLEARANCE)), `"${label.name}" touches the band`).toEqual([]);
      }

      for (const volume of indicator === 'none' ? VOLUMES : SWEEP) {
        await setVolume(diagram, volume);
        const where = `${id} at ${mL(volume)} mL with ${indicator}`;
        const markerLine = await lineOf(graph(diagram).locator('[data-chosen]'));
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
  }
  expect(states).toBe(2 * (61 + 3 * SWEEP.length));
});

test('in the bars no text is cut off and no label meets another or a bar, at any volume, for either acid', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  await page.evaluate(() => document.fonts.ready);
  for (const id of ACIDS) {
    await chooseAcid(diagram, id);
    for (const volume of SWEEP) {
      await setVolume(diagram, volume);
      const where = `${id} at ${mL(volume)} mL`;
      const labels = await textBoxes(barsPanel(diagram));
      expect(labels).toHaveLength(id === 'lactic' ? 6 : 5);
      for (const label of labels) expect(label.left >= -0.5 && label.right <= 320.5, `${where}: "${label.name}" is cut off`).toBe(true);
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
      for (const label of labels) for (const rect of rects) expect(apart(label, rect), `${where}: "${label.name}" meets a bar`).toBe(true);
    }
  }
});

test("each drawing's name says what is drawn now", async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await expect(graph(diagram).getByRole('img')).toHaveAccessibleName(/^Graph of pH, from 0 to 14, against sodium hydroxide added, from 0 to 30 mL\./);
  await expect(graph(diagram).getByRole('img')).toHaveAccessibleName(/A marker at 0\.0 mL is on the curve of lactic acid, at pH 2\.35\.$/);
  await expect(barsPanel(diagram).getByRole('img')).toHaveAccessibleName(
    'Bars of what is in the flask, in millimoles, after the base added has reacted completely: lactic acid left, 3.00; lactate ion formed, 0.00; OH⁻ left over, 0.00.',
  );
  await chooseIndicator(diagram, 'bromocresolGreen');
  await expect(graph(diagram).getByRole('img')).toHaveAccessibleName(/A hatched band lies across the graph from pH 3\.8 to 5\.4, where bromocresol green changes color: yellow below, blue above\./);
});

// A nominal size: the font size in drawing units, times 320, over the drawing's width in units.
test("the drawings' text is 12 px or more when each drawing itself is shown 320 px wide", async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  await chooseIndicator(diagram, 'thymolBlue');
  for (const panel of [graph(diagram), barsPanel(diagram)]) {
    const sizes = await panel.locator('svg[role="img"]').evaluate((svg) => {
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
    await chooseIndicator(diagram, 'thymolBlue');
    await page.evaluate(() => document.fonts.ready);
    for (const panel of [graph(diagram), barsPanel(diagram)]) {
      const sizes = await panel.locator('svg[role="img"]').evaluate((svg) => {
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
    const flask = await barsPanel(diagram).boundingBox();
    if (!plot || !flask) throw new Error('A part has no bounding box.');
    expect(flask.y, 'the bars are below the graph').toBeGreaterThanOrEqual(plot.y + plot.height);
    expect(plot.width).toBeLessThanOrEqual(22 * 16 + 1);
    expect(flask.width).toBeLessThanOrEqual(22 * 16 + 1);
  });
}

test('the order is the graph and the bars, the slider, the choice of acid, the choice of indicator, then the readout', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  const parts = await Promise.all(
    [graph(diagram), barsPanel(diagram), slider(diagram), acidGroup(diagram), indicatorGroup(diagram), status(diagram)].map((part) => part.boundingBox()),
  );
  const [plot, flask, volume, acids, indicators, readoutBox] = parts;
  if (!plot || !flask || !volume || !acids || !indicators || !readoutBox) throw new Error('A part of the diagram has no box.');
  const drawingsBottom = Math.max(plot.y + plot.height, flask.y + flask.height);
  expect(volume.y, 'the slider is under the drawings').toBeGreaterThanOrEqual(drawingsBottom);
  expect(acids.y, 'the choice of acid is under the slider').toBeGreaterThanOrEqual(volume.y + volume.height);
  expect(indicators.y, 'the choice of indicator is under the choice of acid').toBeGreaterThanOrEqual(acids.y + acids.height);
  expect(readoutBox.y, 'the readout is under the controls').toBeGreaterThanOrEqual(indicators.y + indicators.height);
});

// A student moves the slider and watches the marker. On a small phone the graph and the slider must
// be on the screen together, with the diagram scrolled so that the graph is at the top.
test('at 320 × 568 the graph and the slider are on the screen together', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  const diagram = await openDiagram(page, PAGE, NAME);
  // Thymol blue adds the fourth line to the key under the graph (lactic acid shows four), the
  // tallest the stack of graph, key, bars and slider gets.
  await chooseIndicator(diagram, 'thymolBlue');
  await expect(graph(diagram).locator('[data-key]')).toHaveCount(4);
  await graph(diagram).evaluate((element) => {
    window.scrollTo(0, element.getBoundingClientRect().top + window.scrollY - 8);
  });
  for (const [name, part] of Object.entries({ graph: await graph(diagram).getByRole('img').boundingBox(), slider: await slider(diagram).boundingBox() })) {
    if (!part) throw new Error(`The ${name} has no bounding box.`);
    expect(part.y, `the ${name} starts on the screen`).toBeGreaterThanOrEqual(0);
    expect(part.y + part.height, `the ${name} ends on the screen`).toBeLessThanOrEqual(568);
  }
});

for (const width of [1280, 680, 412, 390, 360, 320]) {
  test(`on a ${width} px screen nothing scrolls sideways and the controls stay inside the diagram`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    const diagram = await openDiagram(page, PAGE, NAME);
    // The longest readout of all 488 settings, found from the module.
    let longest = { id: 'lactic' as AcidKey, volume: 0, indicator: 'none' as IndicatorChoice, text: '' };
    for (const id of ACIDS) {
      for (const indicator of INDICATORS) {
        for (const volume of VOLUMES) {
          const text = readout(id, volume, indicator);
          if (text.length > longest.text.length) longest = { id, volume, indicator, text };
        }
      }
    }
    await chooseAcid(diagram, longest.id);
    await chooseIndicator(diagram, longest.indicator);
    await setVolume(diagram, longest.volume);
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
  test(`the diagram has no accessibility violations in the ${theme} theme, at the start and with hydrobromic acid and thymol blue at 15.0 mL`, async ({ page }) => {
    await page.addInitScript((value) => localStorage.setItem('chemstudy:theme', value), theme);
    const diagram = await openDiagram(page, PAGE, NAME);
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    const violations = async () => {
      const results = await new AxeBuilder({ page }).include(`[data-diagram="${NAME}"]`).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      return results.violations.map((v) => `${v.id}: ${v.nodes.length} node(s) - ${v.help}`);
    };
    expect(await violations(), 'at the start').toEqual([]);
    await chooseAcid(diagram, 'hydrobromic');
    await chooseIndicator(diagram, 'thymolBlue');
    await setVolume(diagram, 15);
    expect(await violations(), 'hydrobromic acid and thymol blue at 15.0 mL').toEqual([]);
  });
}

test('in print the controls are hidden and the graph, the bars and the readout stay', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  await page.emulateMedia({ media: 'print' });

  await expect(diagram.locator('.diagram-controls')).toBeHidden();
  await expect(graph(diagram).getByRole('img')).toBeVisible();
  await expect(barsPanel(diagram).getByRole('img')).toBeVisible();
  await expect(status(diagram)).toHaveText(START_READOUT);
});

test('the caption names the flask, the two acids, 25 °C, the full equilibrium and thymol blue’s band', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  await expect(page.locator('[data-part="diagram"]', { has: diagram }).locator('> figcaption')).toHaveText(CAPTION);
});

test.describe('with JavaScript off', () => {
  test.use({ javaScriptEnabled: false });

  test('the graph, the bars and the starting readout show, with no controls', async ({ page }) => {
    await expectStaticDiagram(page, PAGE, NAME, START_READOUT);

    const diagram = page.locator(`[data-diagram="${NAME}"]`);
    await expect(graph(diagram).getByRole('img')).toBeVisible();
    await expect(barsPanel(diagram).getByRole('img')).toBeVisible();
    await expect(graph(diagram).locator('[data-chosen-curve]')).toHaveAttribute('data-curve', 'lactic');
    await expect(barsPanel(diagram).locator('[data-bar-value]')).toHaveText(['3.00 mmol', '0.00 mmol', '0.00 mmol']);
    const { x, y } = await axes(diagram);
    expectNear(await numberOf(graph(diagram).locator('[data-dot]'), 'cx'), x(0), "the dot's x");
    expectNear(await numberOf(graph(diagram).locator('[data-dot]'), 'cy'), y(titrationCurveState('lactic', 0).pH), "the dot's y");
  });
});
