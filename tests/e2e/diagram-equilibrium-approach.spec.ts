import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator, type Page } from '@playwright/test';
import { expectStaticDiagram, openDiagram } from './diagram';

const PAGE = '/unit-7-equilibrium/7-1-introduction-to-equilibrium/';
const NAME = 'equilibrium-approach';

const FORWARD_SENTENCE = 'A is turning into B faster than B turns back.';
const REVERSE_SENTENCE = 'B is turning into A faster than A turns back.';
const EQUAL_SENTENCE =
  'the rates are equal, so the concentrations have stopped changing. Both reactions are still running.';

const readout = (time: string, a: string, b: string, forward: string, reverse: string, sentence: string) =>
  `At ${time}: [A] = ${a} M and [B] = ${b} M. Forward rate ${forward} M/s, reverse rate ${reverse} M/s: ${sentence}`;
const START = readout('1 s', '0.49', '0.51', '0.392', '0.102', FORWARD_SENTENCE);
const SETTLED = readout('8 s', '0.20', '0.80', '0.160', '0.160', EQUAL_SENTENCE);

const NUMBER = String.raw`(-?\d+(?:\.\d+)?)`;
const POINT = new RegExp(`[ML]${NUMBER} ${NUMBER}`, 'g');

interface Point {
  x: number;
  y: number;
}

const concentrations = (diagram: Locator) => diagram.locator('[data-panel="concentrations"]');
const rates = (diagram: Locator) => diagram.locator('[data-panel="rates"]');
const status = (diagram: Locator) => diagram.getByRole('status');
const timeSlider = (diagram: Locator) => diagram.getByRole('slider', { name: 'Time' });
const startGroup = (diagram: Locator) => diagram.getByRole('group', { name: 'Start with' });
const startRadio = (diagram: Locator, name: string) => startGroup(diagram).getByRole('radio', { name });
const constantsGroup = (diagram: Locator) => diagram.getByRole('group', { name: 'Rate constants (per second)' });
const constantsRadio = (diagram: Locator, name: string) => constantsGroup(diagram).getByRole('radio', { name });
const curve = (panel: Locator, which: string) => panel.locator(`[data-curve="${which}"]`);
const dot = (panel: Locator, which: string) => panel.locator(`[data-dot="${which}"]`);
const curveName = (panel: Locator, which: string) => panel.locator(`[data-curve-name="${which}"]`);
const chosenLine = (panel: Locator) => panel.locator('[data-chosen]');

async function numberOf(element: Locator, attribute: string): Promise<number> {
  const value = await element.getAttribute(attribute);
  if (value === null || value === '') throw new Error(`An element has no ${attribute} attribute.`);
  return Number(value);
}

/** The points of a drawn curve, in drawing units. A larger y is lower on the screen. */
async function pointsOf(path: Locator): Promise<Point[]> {
  const d = (await path.getAttribute('d')) ?? '';
  const points = [...d.matchAll(POINT)].map((m) => ({ x: Number(m[1]), y: Number(m[2]) }));
  if (points.length < 3) throw new Error(`Not a curve: ${d}`);
  return points;
}

async function centerOf(circle: Locator): Promise<Point> {
  return { x: await numberOf(circle, 'cx'), y: await numberOf(circle, 'cy') };
}

/** Where a graph's vertical axis puts a value, read from its ticks at `low` and `high`. */
async function yOnAxis(panel: Locator, value: number, low: number, high: number): Promise<number> {
  const bottom = await numberOf(panel.locator(`[data-tick-y="${low}"]`), 'y1');
  const top = await numberOf(panel.locator(`[data-tick-y="${high}"]`), 'y1');
  return bottom + ((value - low) / (high - low)) * (top - bottom);
}

const yOfConcentration = (diagram: Locator, value: number) => yOnAxis(concentrations(diagram), value, 0, 1);
const yOfRate = (diagram: Locator, value: number) => yOnAxis(rates(diagram), value, 0, 0.8);

/** Where a graph's time axis puts a time in seconds, read from its ticks at 0 s and 8 s. */
async function xOfTime(panel: Locator, seconds: number): Promise<number> {
  const start = await numberOf(panel.locator('[data-tick-x="0"]'), 'x1');
  const end = await numberOf(panel.locator('[data-tick-x="8"]'), 'x1');
  return start + (seconds / 8) * (end - start);
}

// Each drawn position is rounded to a tenth of a unit, and so is each tick.
const TOLERANCE = 0.25;

async function expectNear(actual: number, expected: number, what: string) {
  expect(Math.abs(actual - expected), `${what}: ${actual} is not within ${TOLERANCE} of ${expected}`).toBeLessThanOrEqual(TOLERANCE);
}

async function pressTimes(page: Page, key: string, times: number) {
  for (let i = 0; i < times; i++) await page.keyboard.press(key);
}

test('the diagram starts at 1 s, with only A and forward 0.8, reverse 0.2', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await expect(status(diagram)).toHaveText(START);
  await expect(timeSlider(diagram)).toHaveAttribute('aria-valuetext', '1 s');
  await expect(startRadio(diagram, 'Only A')).toBeChecked();
  await expect(constantsRadio(diagram, 'forward 0.8, reverse 0.2')).toBeChecked();
  await expect(concentrations(diagram).locator('figcaption')).toHaveText('Concentrations');
  await expect(rates(diagram).locator('figcaption')).toHaveText('Rates');
  await expect(concentrations(diagram).locator('[data-axis-label="y"]')).toHaveText('concentration (M)');
  await expect(rates(diagram).locator('[data-axis-label="y"]')).toHaveText('rate (M/s)');
  for (const panel of [concentrations(diagram), rates(diagram)]) {
    await expect(panel.locator('[data-axis-label="x"]')).toHaveText('time (s)');
  }
});

test('the controls are the three starts, the three pairs of rate constants and a time slider', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await expect(startGroup(diagram).getByRole('radio')).toHaveCount(3);
  for (const name of ['Only A', 'Half A, half B', 'Only B']) await expect(startRadio(diagram, name)).toBeVisible();
  await expect(constantsGroup(diagram).getByRole('radio')).toHaveCount(3);
  for (const name of ['forward 0.8, reverse 0.2', 'forward 0.5, reverse 0.5', 'forward 0.2, reverse 0.8']) {
    await expect(constantsRadio(diagram, name)).toBeVisible();
  }
  await expect(timeSlider(diagram)).toHaveAttribute('min', '0');
  await expect(timeSlider(diagram)).toHaveAttribute('max', '8');
  await expect(timeSlider(diagram)).toHaveAttribute('step', '0.25');
});

test('both graphs have the time axis from 0 s to 8 s, and the axes the contract gives', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  const timeTicks = (panel: Locator) =>
    panel.locator('[data-tick-x]').evaluateAll((lines) => lines.map((tick) => tick.getAttribute('data-tick-x')));
  const valueTicks = (panel: Locator) =>
    panel.locator('[data-tick-y]').evaluateAll((lines) => lines.map((tick) => tick.getAttribute('data-tick-y')));

  expect(await timeTicks(concentrations(diagram))).toEqual(['0', '2', '4', '6', '8']);
  expect(await timeTicks(rates(diagram))).toEqual(['0', '2', '4', '6', '8']);
  expect(await valueTicks(concentrations(diagram))).toEqual(['0', '0.5', '1']);
  expect(await valueTicks(rates(diagram))).toEqual(['0', '0.2', '0.4', '0.6', '0.8']);
});

test('the starting curves are drawn from the model: [A] falls and [B] rises, one point every 0.05 s', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  const panel = concentrations(diagram);

  const a = await pointsOf(curve(panel, 'a'));
  const b = await pointsOf(curve(panel, 'b'));

  expect(a).toHaveLength(161);
  expect(b).toHaveLength(161);
  // [A] starts at 1.0 M and settles near 0.20 M; [B] is the other way round.
  await expectNear(a[0]?.y ?? Number.NaN, await yOfConcentration(diagram, 1), '[A] at 0 s');
  await expectNear(b[0]?.y ?? Number.NaN, await yOfConcentration(diagram, 0), '[B] at 0 s');
  await expectNear(a[160]?.y ?? Number.NaN, await yOfConcentration(diagram, 0.2), '[A] at 8 s');
  await expectNear(b[160]?.y ?? Number.NaN, await yOfConcentration(diagram, 0.8), '[B] at 8 s');
  // Forward rate: 0.8 M/s at the start, 0.16 M/s at the end. Reverse: 0 and 0.16.
  const forward = await pointsOf(curve(rates(diagram), 'forward'));
  const reverse = await pointsOf(curve(rates(diagram), 'reverse'));
  await expectNear(forward[0]?.y ?? Number.NaN, await yOfRate(diagram, 0.8), 'forward rate at 0 s');
  await expectNear(reverse[0]?.y ?? Number.NaN, await yOfRate(diagram, 0), 'reverse rate at 0 s');
  await expectNear(forward[160]?.y ?? Number.NaN, await yOfRate(diagram, 0.16), 'forward rate at 8 s');
  await expectNear(reverse[160]?.y ?? Number.NaN, await yOfRate(diagram, 0.16), 'reverse rate at 8 s');
});

test('a line at the chosen time runs through both graphs, with a dot on each curve', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  for (const panel of [concentrations(diagram), rates(diagram)]) {
    const x = await xOfTime(panel, 1);
    await expectNear(await numberOf(chosenLine(panel), 'x1'), x, 'the line, top');
    expect(await numberOf(chosenLine(panel), 'x2')).toBe(await numberOf(chosenLine(panel), 'x1'));
  }
  const dotA = await centerOf(dot(concentrations(diagram), 'a'));
  const dotB = await centerOf(dot(concentrations(diagram), 'b'));
  const dotForward = await centerOf(dot(rates(diagram), 'forward'));
  const dotReverse = await centerOf(dot(rates(diagram), 'reverse'));
  // At 1 s: [A] = 0.494 M, [B] = 0.506 M, forward 0.395 M/s, reverse 0.101 M/s.
  await expectNear(dotA.y, await yOfConcentration(diagram, 0.494304), 'the dot on [A]');
  await expectNear(dotB.y, await yOfConcentration(diagram, 0.505696), 'the dot on [B]');
  await expectNear(dotForward.y, await yOfRate(diagram, 0.395443), 'the dot on the forward rate');
  await expectNear(dotReverse.y, await yOfRate(diagram, 0.101139), 'the dot on the reverse rate');
  expect(await pointsOf(curve(concentrations(diagram), 'a')), 'the dot is on [A]').toContainEqual(dotA);
  expect(await pointsOf(curve(concentrations(diagram), 'b')), 'the dot is on [B]').toContainEqual(dotB);
  expect(await pointsOf(curve(rates(diagram), 'forward')), 'the dot is on the forward rate').toContainEqual(dotForward);
  expect(await pointsOf(curve(rates(diagram), 'reverse')), 'the dot is on the reverse rate').toContainEqual(dotReverse);
});

test('moving the time from the keyboard moves the line and the dots but not the curves, and the slider says the time', async ({
  page,
}) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  const curvesBefore = await curve(concentrations(diagram), 'a').getAttribute('d');
  const slider = timeSlider(diagram);

  await slider.focus();
  await page.keyboard.press('ArrowRight');

  await expect(slider).toHaveAttribute('aria-valuetext', '1.25 s');
  await expect(status(diagram)).toContainText('At 1.25 s: ');
  expect(await curve(concentrations(diagram), 'a').getAttribute('d')).toBe(curvesBefore);
  const x = await xOfTime(concentrations(diagram), 1.25);
  await expectNear((await centerOf(dot(concentrations(diagram), 'a'))).x, x, 'the dot');
  await expectNear(await numberOf(chosenLine(rates(diagram)), 'x1'), await xOfTime(rates(diagram), 1.25), 'the line');
  // The name is static; the value is announced once, through aria-valuetext.
  await expect(slider).toHaveAccessibleName('Time');
});

test('the time slider runs from 0 s to 8 s', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  const slider = timeSlider(diagram);

  await slider.focus();
  await page.keyboard.press('Home');
  await expect(slider).toHaveAttribute('aria-valuetext', '0 s');
  await expect(status(diagram)).toHaveText(
    readout('0 s', '1.00', '0.00', '0.800', '0.000', FORWARD_SENTENCE),
  );
  await page.keyboard.press('ArrowRight');
  await expect(slider).toHaveAttribute('aria-valuetext', '0.25 s');
  await page.keyboard.press('End');

  await expect(slider).toHaveAttribute('aria-valuetext', '8 s');
  await expect(status(diagram)).toHaveText(SETTLED);
});

test('at 8 s the rates are equal and the mixture is 0.20 M and 0.80 M', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await timeSlider(diagram).focus();
  await page.keyboard.press('End');

  await expect(status(diagram)).toHaveText(SETTLED);
  const dotForward = await centerOf(dot(rates(diagram), 'forward'));
  const dotReverse = await centerOf(dot(rates(diagram), 'reverse'));
  await expectNear(dotForward.y, dotReverse.y, 'the two rate dots meet');
});

test('starting with only B and waiting 8 s gives the same mixture', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  await timeSlider(diagram).focus();
  await page.keyboard.press('End');
  await expect(status(diagram)).toHaveText(SETTLED);

  await startRadio(diagram, 'Only B').check();

  await expect(status(diagram)).toHaveText(SETTLED);
  // The curves are different: [A] climbs from 0 instead of falling from 1.0.
  const a = await pointsOf(curve(concentrations(diagram), 'a'));
  await expectNear(a[0]?.y ?? Number.NaN, await yOfConcentration(diagram, 0), '[A] at 0 s');
});

test('starting with only B at 1 s: the reverse reaction is faster', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await startRadio(diagram, 'Only B').check();

  await expect(status(diagram)).toHaveText(readout('1 s', '0.13', '0.87', '0.104', '0.174', REVERSE_SENTENCE));
});

test('forward 0.5, reverse 0.5 with half A, half B is equal at 0 s, and at every time after', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await constantsRadio(diagram, 'forward 0.5, reverse 0.5').check();
  await startRadio(diagram, 'Half A, half B').check();
  await timeSlider(diagram).focus();
  await page.keyboard.press('Home');

  await expect(status(diagram)).toHaveText(readout('0 s', '0.50', '0.50', '0.250', '0.250', EQUAL_SENTENCE));
  await page.keyboard.press('ArrowRight');
  await expect(status(diagram)).toHaveText(readout('0.25 s', '0.50', '0.50', '0.250', '0.250', EQUAL_SENTENCE));
});

test('choosing forward 0.2, reverse 0.8 changes the curves and the readout', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  const before = {
    a: await curve(concentrations(diagram), 'a').getAttribute('d'),
    forward: await curve(rates(diagram), 'forward').getAttribute('d'),
  };

  await constantsRadio(diagram, 'forward 0.2, reverse 0.8').check();

  await expect(status(diagram)).toHaveText(readout('1 s', '0.87', '0.13', '0.174', '0.104', FORWARD_SENTENCE));
  expect(await curve(concentrations(diagram), 'a').getAttribute('d')).not.toBe(before.a);
  expect(await curve(rates(diagram), 'forward').getAttribute('d')).not.toBe(before.forward);
  // [A] now settles near 0.80 M, [B] near 0.20 M, and the rates meet at 0.16 M/s.
  const a = await pointsOf(curve(concentrations(diagram), 'a'));
  await expectNear(a[160]?.y ?? Number.NaN, await yOfConcentration(diagram, 0.8), '[A] at 8 s');
  const forward = await pointsOf(curve(rates(diagram), 'forward'));
  await expectNear(forward[0]?.y ?? Number.NaN, await yOfRate(diagram, 0.2), 'forward rate at 0 s');
  await expect(concentrations(diagram).getByRole('img')).toHaveAccessibleName(/for rate constants forward 0\.2, reverse 0\.8 per second\./);
});

test('every choice can be made from the keyboard, and Tab goes from the starts to the rate constants to the time', async ({
  page,
}) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await startGroup(diagram).getByRole('radio', { checked: true }).focus();
  await page.keyboard.press('ArrowDown');
  await expect(startRadio(diagram, 'Half A, half B')).toBeChecked();
  // Half and half at 1 s, forward 0.8, reverse 0.2: [A] = 0.31 M, so 0.8 × 0.31 and 0.2 × 0.69.
  await expect(status(diagram)).toHaveText(readout('1 s', '0.31', '0.69', '0.248', '0.138', FORWARD_SENTENCE));
  await page.keyboard.press('ArrowUp');
  await expect(startRadio(diagram, 'Only A')).toBeChecked();
  await expect(status(diagram)).toHaveText(START);

  await page.keyboard.press('Tab');
  await expect(constantsGroup(diagram).getByRole('radio', { checked: true })).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(constantsRadio(diagram, 'forward 0.5, reverse 0.5')).toBeChecked();
  await page.keyboard.press('Tab');

  await expect(timeSlider(diagram)).toBeFocused();
});

test('each curve is named on the curve, and the two names differ by more than color', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await expect(curveName(concentrations(diagram), 'a')).toHaveText('[A]');
  await expect(curveName(concentrations(diagram), 'b')).toHaveText('[B]');
  await expect(curveName(rates(diagram), 'forward')).toHaveText('forward rate');
  await expect(curveName(rates(diagram), 'reverse')).toHaveText('reverse rate');
  // A solid line and a dashed one: told apart without color.
  await expect(curve(concentrations(diagram), 'a')).toHaveCSS('stroke-dasharray', 'none');
  await expect(curve(concentrations(diagram), 'b')).not.toHaveCSS('stroke-dasharray', 'none');
  await expect(curve(rates(diagram), 'forward')).toHaveCSS('stroke-dasharray', 'none');
  await expect(curve(rates(diagram), 'reverse')).not.toHaveCSS('stroke-dasharray', 'none');
});

test('the line at the chosen time is solid, so it is told apart from the dashed curves', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await expect(chosenLine(concentrations(diagram))).toHaveCSS('stroke-dasharray', 'none');
});

test('when the two curves lie on top of each other, both are still drawn and both names show, apart', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await constantsRadio(diagram, 'forward 0.5, reverse 0.5').check();
  await startRadio(diagram, 'Half A, half B').check();
  await expect(status(diagram)).toContainText('the rates are equal');

  expect(await curve(concentrations(diagram), 'a').getAttribute('d')).toBe(await curve(concentrations(diagram), 'b').getAttribute('d'));
  expect(await curve(rates(diagram), 'forward').getAttribute('d')).toBe(await curve(rates(diagram), 'reverse').getAttribute('d'));
  for (const [panel, first, second] of [
    [concentrations(diagram), 'a', 'b'],
    [rates(diagram), 'forward', 'reverse'],
  ] as const) {
    await expect(curveName(panel, first)).toBeVisible();
    await expect(curveName(panel, second)).toBeVisible();
    const one = await labelBox(curveName(panel, first));
    const two = await labelBox(curveName(panel, second));
    expect(one.bottom, `"${one.name}" is above "${two.name}"`).toBeLessThanOrEqual(two.top);
  }
});

interface Box {
  name: string;
  left: number;
  right: number;
  top: number;
  bottom: number;
}

/** The box of a label, in drawing units. The label is not rotated. */
async function labelBox(label: Locator): Promise<Box> {
  return label.evaluate((text) => {
    if (!(text instanceof SVGTextElement)) throw new Error('A label is not SVG text.');
    const box = text.getBBox();
    return { name: text.textContent ?? '', left: box.x, right: box.x + box.width, top: box.y, bottom: box.y + box.height };
  });
}

/** Points a tenth of the way apart along each stretch between two drawn points, so a name cannot hide between them. */
function finePoints(points: readonly Point[]): Point[] {
  return points.flatMap((p, i) => {
    const next = points[i + 1];
    if (!next) return [p];
    return Array.from({ length: 10 }, (_, k) => ({ x: p.x + ((next.x - p.x) * k) / 10, y: p.y + ((next.y - p.y) * k) / 10 }));
  });
}

// Half the width of the thickest stroke, and a little more.
const CLEARANCE = 2;
const DOT_RADIUS = 5;
const near = (box: Box, p: Point, margin: number) =>
  p.x >= box.left - margin && p.x <= box.right + margin && p.y >= box.top - margin && p.y <= box.bottom + margin;

const PANELS = [
  { panel: concentrations, curves: ['a', 'b'] },
  { panel: rates, curves: ['forward', 'reverse'] },
] as const;

/** Checks both drawings as they stand: no text cut off, and no name on a curve, a dot, or the other name. */
async function expectNamesClear(diagram: Locator, state: string) {
  for (const { panel, curves } of PANELS) {
    const drawing = panel(diagram);
    const cutOff = await drawing.locator('svg').evaluate((svg) => {
      const frame = svg.getBoundingClientRect();
      return [...svg.querySelectorAll('text')]
        .filter((text) => {
          const box = text.getBoundingClientRect();
          return box.left < frame.left - 0.5 || box.right > frame.right + 0.5 || box.top < frame.top - 0.5 || box.bottom > frame.bottom + 0.5;
        })
        .map((text) => text.textContent);
    });
    expect(cutOff, `${state}: text outside the drawing`).toEqual([]);

    const boxes = [await labelBox(curveName(drawing, curves[0])), await labelBox(curveName(drawing, curves[1]))] as const;
    const drawn = [
      ...finePoints(await pointsOf(curve(drawing, curves[0]))),
      ...finePoints(await pointsOf(curve(drawing, curves[1]))),
    ];
    const dots = [await centerOf(dot(drawing, curves[0])), await centerOf(dot(drawing, curves[1]))];
    for (const box of boxes) {
      expect(drawn.filter((p) => near(box, p, CLEARANCE)), `${state}: "${box.name}" touches a curve`).toEqual([]);
      expect(dots.filter((p) => near(box, p, DOT_RADIUS)), `${state}: "${box.name}" touches a dot`).toEqual([]);
    }
    const [one, two] = boxes;
    const apart = one.bottom <= two.top || two.bottom <= one.top || one.right <= two.left || two.right <= one.left;
    expect(apart, `${state}: "${one.name}" and "${two.name}" overlap`).toBe(true);
  }
}

// Each pair settles differently, each start approaches from a different side,
// and the dot is nearest the names at the end of the axis.
const STATES = [
  { start: 'Only A', constants: 'forward 0.8, reverse 0.2', time: 1 },
  { start: 'Only A', constants: 'forward 0.8, reverse 0.2', time: 8 },
  { start: 'Only A', constants: 'forward 0.8, reverse 0.2', time: 7.75 },
  { start: 'Only B', constants: 'forward 0.8, reverse 0.2', time: 8 },
  { start: 'Half A, half B', constants: 'forward 0.8, reverse 0.2', time: 7 },
  { start: 'Only A', constants: 'forward 0.5, reverse 0.5', time: 8 },
  { start: 'Only B', constants: 'forward 0.5, reverse 0.5', time: 7.5 },
  { start: 'Half A, half B', constants: 'forward 0.5, reverse 0.5', time: 7.75 },
  { start: 'Half A, half B', constants: 'forward 0.5, reverse 0.5', time: 0 },
  { start: 'Only A', constants: 'forward 0.2, reverse 0.8', time: 8 },
  { start: 'Only B', constants: 'forward 0.2, reverse 0.8', time: 7.75 },
  { start: 'Half A, half B', constants: 'forward 0.2, reverse 0.8', time: 8 },
] as const;

test('in every kind of state, no name is cut off or touches a curve, a dot or the other name', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  // The names are measured, so the web fonts must have loaded.
  await page.evaluate(() => document.fonts.ready);

  for (const { start, constants, time } of STATES) {
    await startRadio(diagram, start).check();
    await constantsRadio(diagram, constants).check();
    await timeSlider(diagram).fill(String(time));
    await expect(timeSlider(diagram)).toHaveAttribute('aria-valuetext', `${time} s`);
    await expect(status(diagram)).toContainText(`At ${time} s: `);

    await expectNamesClear(diagram, `${start}, ${constants}, ${time} s`);
  }
});

// A nominal size, not a rendered one: the font size in drawing units, times
// 320, over the drawing's width in units. That is the size of the text when
// a drawing itself is shown 320 px wide, the ratio of the site's figures
// (18 on 480). On a narrow phone a drawing is narrower than 320 px, and its
// text is smaller in proportion.
test("each drawing's text is 12 px or more when the drawing itself is shown 320 px wide, the ratio of the site's figures", async ({
  page,
}) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  for (const panel of [concentrations(diagram), rates(diagram)]) {
    const sizes = await panel.locator('svg').evaluate((svg) => {
      if (!(svg instanceof SVGSVGElement)) throw new Error('The drawing is not an SVG.');
      const unitsWide = svg.viewBox.baseVal.width;
      return [...svg.querySelectorAll('text, tspan')].map((text) => ({
        text: text.textContent,
        pxAt320: (Number.parseFloat(getComputedStyle(text).fontSize) * 320) / unitsWide,
      }));
    });

    expect(sizes.length).toBeGreaterThanOrEqual(12);
    for (const size of sizes) expect(size.pxAt320, `"${size.text}"`).toBeGreaterThanOrEqual(12);
  }
});

// The text as it is drawn on the screen: its size in drawing units, scaled by
// how wide the drawing is shown. One above the other, each drawing is wide
// enough for 12 px text from a 412 px phone up.
for (const width of [1280, 412]) {
  test(`on a ${width} px screen each drawing's text is drawn 12 px or larger`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const diagram = await openDiagram(page, PAGE, NAME);
    await page.evaluate(() => document.fonts.ready);

    for (const panel of [concentrations(diagram), rates(diagram)]) {
      const sizes = await panel.locator('svg').evaluate((svg) => {
        if (!(svg instanceof SVGSVGElement)) throw new Error('The drawing is not an SVG.');
        const scale = svg.getBoundingClientRect().width / svg.viewBox.baseVal.width;
        return [...svg.querySelectorAll('text, tspan')].map((text) => ({
          text: text.textContent,
          px: Number.parseFloat(getComputedStyle(text).fontSize) * scale,
        }));
      });

      expect(sizes.length).toBeGreaterThanOrEqual(12);
      for (const size of sizes) expect(size.px, `"${size.text}"`).toBeGreaterThanOrEqual(12);
    }
  });
}

test('on a wide screen each drawing stops at 22rem wide and sits in the middle of the diagram', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  const diagram = await openDiagram(page, PAGE, NAME);

  const measured = await diagram.evaluate((body) => {
    const frame = body.getBoundingClientRect();
    const rem = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
    return [...body.querySelectorAll('[data-panel] svg')].map((svg) => {
      const box = svg.getBoundingClientRect();
      return { rems: box.width / rem, spaceLeft: box.left - frame.left, spaceRight: frame.right - box.right };
    });
  });

  expect(measured).toHaveLength(2);
  for (const drawing of measured) {
    expect(Math.abs(drawing.rems - 22)).toBeLessThanOrEqual(0.05);
    expect(drawing.spaceLeft).toBeGreaterThan(0);
    expect(Math.abs(drawing.spaceLeft - drawing.spaceRight)).toBeLessThanOrEqual(1);
  }
});

interface Frame {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

async function panelFrames(diagram: Locator): Promise<Frame[]> {
  return diagram.locator('[data-panel]').evaluateAll((panels) =>
    panels.map((panel) => {
      const box = panel.getBoundingClientRect();
      return { left: box.left, right: box.right, top: box.top, bottom: box.bottom };
    }),
  );
}

for (const width of [1280, 412, 390, 360, 320]) {
  test(`on a ${width} px screen the two graphs stack, nothing scrolls sideways and the controls stay inside the diagram`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 800 });
    const diagram = await openDiagram(page, PAGE, NAME);
    // The longest readout.
    await timeSlider(diagram).focus();
    await page.keyboard.press('End');
    await expect(status(diagram)).toHaveText(SETTLED);
    await page.evaluate(() => document.fonts.ready);
    const figure = page.locator('[data-part="diagram"]', { has: diagram });

    const [first, second] = await panelFrames(diagram);
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

    if (!first || !second) throw new Error('The diagram does not have two graphs.');
    expect(second.top, 'the second graph is below the first').toBeGreaterThanOrEqual(first.bottom);
    expect(second.left).toBe(first.left);
    expect(second.right).toBe(first.right);
    expect(measured.overflow, 'sideways scrolling inside the diagram').toBeLessThanOrEqual(0);
    expect(measured.pageOverflow, 'sideways scrolling of the page').toBeLessThanOrEqual(0);
    expect(measured.outside, 'parts sticking out of the diagram').toEqual([]);
    expect(measured.left).toBeGreaterThanOrEqual(0);
    expect(measured.right).toBeLessThanOrEqual(width);
  });
}

test("each drawing's name says what is drawn now", async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  const concentrationDrawing = concentrations(diagram).getByRole('img');
  const rateDrawing = rates(diagram).getByRole('img');

  await expect(concentrationDrawing).toHaveAccessibleName(
    /^Graph of concentration against time, from 0 s to 8 s, for rate constants forward 0\.8, reverse 0\.2 per second\. .*At 0 s, \[A\] is 1\.00 M and \[B\] is 0\.00 M; at 8 s, \[A\] is 0\.20 M and \[B\] is 0\.80 M\. .*the chosen time, 1 s\.$/,
  );
  await expect(rateDrawing).toHaveAccessibleName(
    /^Graph of rate against time, from 0 s to 8 s, for rate constants forward 0\.8, reverse 0\.2 per second\. .*at 8 s, both are 0\.160 M\/s\. .*the chosen time, 1 s\.$/,
  );

  await timeSlider(diagram).fill('2.5');
  await startRadio(diagram, 'Only B').check();

  await expect(concentrationDrawing).toHaveAccessibleName(/At 0 s, \[A\] is 0\.00 M and \[B\] is 1\.00 M; .*the chosen time, 2\.5 s\.$/);
  await expect(rateDrawing).toHaveAccessibleName(/At 0 s, the forward rate is 0\.000 M\/s and the reverse rate is 0\.200 M\/s; .*the chosen time, 2\.5 s\.$/);
});

for (const theme of ['light', 'dark'] as const) {
  test(`the diagram has no accessibility violations in the ${theme} theme, at the start and with the rate constants and the start changed`, async ({
    page,
  }) => {
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
    await startRadio(diagram, 'Only B').check();
    await constantsRadio(diagram, 'forward 0.2, reverse 0.8').check();
    await expect(status(diagram)).toHaveText(readout('1 s', '0.51', '0.49', '0.102', '0.392', REVERSE_SENTENCE));

    expect(await violations(), 'only B, forward 0.2, reverse 0.8').toEqual([]);
  });
}

test.describe('with JavaScript off', () => {
  test.use({ javaScriptEnabled: false });

  test('both drawings and the starting readout show, with no controls', async ({ page }) => {
    await expectStaticDiagram(page, PAGE, NAME, START);

    const diagram = page.locator(`[data-diagram="${NAME}"]`);
    await expect(concentrations(diagram).getByRole('img')).toBeVisible();
    await expect(rates(diagram).getByRole('img')).toBeVisible();
    await expect(curveName(concentrations(diagram), 'a')).toHaveText('[A]');
    await expect(curveName(concentrations(diagram), 'b')).toHaveText('[B]');
    await expect(curveName(rates(diagram), 'forward')).toHaveText('forward rate');
    await expect(curveName(rates(diagram), 'reverse')).toHaveText('reverse rate');
  });
});
