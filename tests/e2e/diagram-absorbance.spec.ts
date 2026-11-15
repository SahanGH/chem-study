import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator, type Page } from '@playwright/test';
import { expectStaticDiagram, openDiagram } from './diagram';

const PAGE = '/unit-3-substances-and-mixtures/3-13-beer-lambert-law/';
const NAME = 'absorbance';

const readout = (wavelength: number, cell: number, absorptivity: string, concentration: string, absorbance: string) =>
  `At ${wavelength} nm in a ${cell} cm cell, ε = ${absorptivity} L/(mol·cm). ` +
  `A ${concentration} M solution has an absorbance of ${absorbance}.`;
const START = readout(520, 1, '2.00 × 10⁴', '3.0 × 10⁻⁵', '0.60');

const NUMBER = String.raw`(-?\d+(?:\.\d+)?)`;
const POINT = new RegExp(`[ML]${NUMBER} ${NUMBER}`, 'g');

interface Point {
  x: number;
  y: number;
}

const spectrum = (diagram: Locator) => diagram.locator('[data-panel="spectrum"]');
const calibration = (diagram: Locator) => diagram.locator('[data-panel="calibration"]');
const curve = (diagram: Locator) => spectrum(diagram).locator('[data-curve]');
const chosenLine = (diagram: Locator) => spectrum(diagram).locator('[data-chosen]');
const peakGuide = (diagram: Locator) => spectrum(diagram).locator('[data-peak-guide]');
const peakLabel = (diagram: Locator) => spectrum(diagram).locator('[data-peak-label]');
const line = (diagram: Locator) => calibration(diagram).locator('[data-line]');
const slopeLabel = (diagram: Locator) => calibration(diagram).locator('[data-slope-label]');
const status = (diagram: Locator) => diagram.getByRole('status');
const wavelengthSlider = (diagram: Locator) => diagram.getByRole('slider', { name: 'Wavelength' });
const concentrationSlider = (diagram: Locator) => diagram.getByRole('slider', { name: 'Concentration' });
const cellGroup = (diagram: Locator) => diagram.getByRole('group', { name: 'Path length' });
const cellRadio = (diagram: Locator, cell: number) => cellGroup(diagram).getByRole('radio', { name: `${cell} cm` });

async function numberOf(element: Locator, attribute: string): Promise<number> {
  const value = await element.getAttribute(attribute);
  if (value === null || value === '') throw new Error(`An element has no ${attribute} attribute.`);
  return Number(value);
}

/** The points of the drawn spectrum, in drawing units. A larger y is lower on the screen. */
async function pointsOf(path: Locator): Promise<Point[]> {
  const d = (await path.getAttribute('d')) ?? '';
  const points = [...d.matchAll(POINT)].map((m) => ({ x: Number(m[1]), y: Number(m[2]) }));
  if (points.length < 3) throw new Error(`Not a curve: ${d}`);
  return points;
}

/** The highest point of a drawn curve: the one with the smallest y. */
async function topOf(curve: Locator): Promise<Point> {
  const points = await pointsOf(curve);
  return points.reduce((best, p) => (p.y < best.y ? p : best));
}

async function centerOf(circle: Locator): Promise<Point> {
  return { x: await numberOf(circle, 'cx'), y: await numberOf(circle, 'cy') };
}

async function endsOf(line: Locator): Promise<{ from: Point; to: Point }> {
  return {
    from: { x: await numberOf(line, 'x1'), y: await numberOf(line, 'y1') },
    to: { x: await numberOf(line, 'x2'), y: await numberOf(line, 'y2') },
  };
}

/** How steeply a drawn line climbs: its rise over its run, in drawing units. */
async function steepnessOf(line: Locator): Promise<number> {
  const { from, to } = await endsOf(line);
  if (to.x === from.x) throw new Error('The line is vertical, so it has no slope.');
  return (from.y - to.y) / (to.x - from.x);
}

/** Where a graph's absorbance axis puts a value, read from its ticks at 0 and 2.0. */
async function yOnAxis(panel: Locator, value: number): Promise<number> {
  const zero = await numberOf(panel.locator('[data-tick-y="0"]'), 'y1');
  const two = await numberOf(panel.locator('[data-tick-y="2"]'), 'y1');
  return zero + (value / 2) * (two - zero);
}

/** Where a graph's horizontal axis puts a value, read from its first and last ticks. */
async function xOnAxis(panel: Locator, value: number, first: number, last: number): Promise<number> {
  const start = await numberOf(panel.locator(`[data-tick-x="${first}"]`), 'x1');
  const end = await numberOf(panel.locator(`[data-tick-x="${last}"]`), 'x1');
  return start + ((value - first) / (last - first)) * (end - start);
}

const xOfWavelength = (diagram: Locator, wavelength: number) => xOnAxis(spectrum(diagram), wavelength, 400, 700);
/** The concentration axis counts in units of 10⁻⁵ M. */
const xOfConcentration = (diagram: Locator, units: number) => xOnAxis(calibration(diagram), units, 0, 5);

/** How far a dot is above the bottom of its graph's absorbance axis, in drawing units. */
async function heightOf(panel: Locator): Promise<number> {
  return (await yOnAxis(panel, 0)) - (await centerOf(panel.locator('[data-dot]'))).y;
}

/** Checks that the calibration graph's dot sits on its line. */
async function expectDotOnLine(diagram: Locator) {
  const { from, to } = await endsOf(line(diagram));
  const dot = await centerOf(calibration(diagram).locator('[data-dot]'));
  const onLine = from.y + ((dot.x - from.x) / (to.x - from.x)) * (to.y - from.y);
  // Within the rounding of three drawn positions, each to a tenth of a unit.
  expect(Math.abs(dot.y - onLine), 'the dot is on the line').toBeLessThanOrEqual(0.15);
}

async function pressTimes(page: Page, key: string, times: number) {
  for (let i = 0; i < times; i++) await page.keyboard.press(key);
}

test('the diagram starts at 520 nm with a 3.0 × 10⁻⁵ M solution in a 1 cm cell', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await expect(status(diagram)).toHaveText(START);
  await expect(wavelengthSlider(diagram)).toHaveAttribute('aria-valuetext', '520 nm');
  await expect(concentrationSlider(diagram)).toHaveAttribute('aria-valuetext', '3.0 × 10⁻⁵ M');
  await expect(cellRadio(diagram, 1)).toBeChecked();
  await expect(spectrum(diagram).locator('figcaption')).toHaveText('Absorption spectrum');
  await expect(calibration(diagram).locator('figcaption')).toHaveText('Calibration line');
  await expect(spectrum(diagram).locator('[data-axis-label="x"]')).toHaveText('wavelength (nm)');
  await expect(calibration(diagram).locator('[data-axis-label="x"]')).toHaveText('concentration (× 10⁻⁵ M)');
  // No value: the readout gives ε and the cell, and εb can need a fourth figure.
  await expect(slopeLabel(diagram)).toHaveText('slope = εb');
  await expect(peakLabel(diagram)).toHaveText('λmax = 520 nm');
});

test('both graphs measure absorbance on the same axis, from 0 to 2.0', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  const heights: number[][] = [];
  for (const panel of [spectrum(diagram), calibration(diagram)]) {
    await expect(panel.locator('[data-axis-label="y"]')).toHaveText('absorbance');
    const ticks = panel.locator('[data-tick-y]');
    await expect(ticks).toHaveCount(5);
    expect(await ticks.evaluateAll((lines) => lines.map((tick) => tick.getAttribute('data-tick-y')))).toEqual([
      '0',
      '0.5',
      '1',
      '1.5',
      '2',
    ]);
    heights.push(await ticks.evaluateAll((lines) => lines.map((tick) => Number(tick.getAttribute('y1')))));
  }

  expect(heights[1]).toEqual(heights[0]);
});

test('the spectrum peaks at 520 nm, where a line and a dot mark the chosen wavelength', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  const points = await pointsOf(curve(diagram));
  const top = await topOf(curve(diagram));
  const dot = await centerOf(spectrum(diagram).locator('[data-dot]'));
  const at520 = await xOfWavelength(diagram, 520);

  // The curve has one point for each wavelength the slider offers.
  expect(points).toHaveLength(61);
  // Within the rounding of the drawn positions, each to a tenth of a unit.
  expect(Math.abs(top.x - at520)).toBeLessThanOrEqual(0.1);
  expect(Math.abs(top.y - (await yOnAxis(spectrum(diagram), 0.6)))).toBeLessThanOrEqual(0.1);
  expect(points.filter((p) => p.y === top.y), 'one point is highest: the top is not level').toHaveLength(1);
  expect(dot).toEqual(top);
  expect(await numberOf(chosenLine(diagram), 'x1')).toBe(dot.x);
  expect(await numberOf(chosenLine(diagram), 'x2')).toBe(dot.x);
  expect(await numberOf(peakGuide(diagram), 'x1')).toBe(top.x);
});

test('the calibration line starts at the origin and passes through the dot at the chosen concentration', async ({
  page,
}) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  const { from, to } = await endsOf(line(diagram));
  const dot = await centerOf(calibration(diagram).locator('[data-dot]'));

  expect(from).toEqual({ x: await xOfConcentration(diagram, 0), y: await yOnAxis(calibration(diagram), 0) });
  expect(to.x).toBe(await xOfConcentration(diagram, 5));
  expect(Math.abs(to.y - (await yOnAxis(calibration(diagram), 1.0)))).toBeLessThanOrEqual(0.1);
  expect(Math.abs(dot.x - (await xOfConcentration(diagram, 3)))).toBeLessThanOrEqual(0.1);
  expect(Math.abs(dot.y - (await yOnAxis(calibration(diagram), 0.6)))).toBeLessThanOrEqual(0.1);
  await expectDotOnLine(diagram);
});

test('moving the wavelength away from 520 nm from the keyboard flattens the calibration line and lowers the absorbance', async ({
  page,
}) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  const steepnessBefore = await steepnessOf(line(diagram));
  const heightBefore = await heightOf(calibration(diagram));
  const spectrumBefore = await curve(diagram).getAttribute('d');

  await wavelengthSlider(diagram).focus();
  await pressTimes(page, 'ArrowRight', 8);

  await expect(status(diagram)).toHaveText(readout(560, 1, '1.21 × 10⁴', '3.0 × 10⁻⁵', '0.36'));
  // ε falls from 2.00 × 10⁴ to 1.21 × 10⁴, to 0.605 of its largest value.
  expect(Math.abs((await steepnessOf(line(diagram))) / steepnessBefore - 0.605)).toBeLessThanOrEqual(0.005);
  expect(Math.abs((await heightOf(calibration(diagram))) / heightBefore - 0.605)).toBeLessThanOrEqual(0.005);
  expect((await endsOf(line(diagram))).from).toEqual({
    x: await xOfConcentration(diagram, 0),
    y: await yOnAxis(calibration(diagram), 0),
  });
  await expectDotOnLine(diagram);
  await expect(slopeLabel(diagram)).toHaveText('slope = εb');
  // The spectrum belongs to the solution and the cell, so it stays; the line and the dot on it move.
  expect(await curve(diagram).getAttribute('d')).toBe(spectrumBefore);
  const dot = await centerOf(spectrum(diagram).locator('[data-dot]'));
  expect(Math.abs(dot.x - (await xOfWavelength(diagram, 560)))).toBeLessThanOrEqual(0.1);
  expect(await numberOf(chosenLine(diagram), 'x1')).toBe(dot.x);
  expect(await pointsOf(curve(diagram)), 'the dot is on the curve').toContainEqual(dot);
  expect(dot.y, 'lower on the screen than the peak').toBeGreaterThan((await topOf(curve(diagram))).y);
  // The name is static; the value is announced once, through aria-valuetext.
  await expect(wavelengthSlider(diagram)).toHaveAccessibleName('Wavelength');
  await expect(wavelengthSlider(diagram)).toHaveAttribute('aria-valuetext', '560 nm');
});

test('the calibration line is as flat 40 nm below the peak as 40 nm above it', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  await wavelengthSlider(diagram).fill('560');
  await expect(status(diagram)).toHaveText(readout(560, 1, '1.21 × 10⁴', '3.0 × 10⁻⁵', '0.36'));
  const above = await endsOf(line(diagram));

  await wavelengthSlider(diagram).focus();
  await pressTimes(page, 'ArrowLeft', 16);

  await expect(status(diagram)).toHaveText(readout(480, 1, '1.21 × 10⁴', '3.0 × 10⁻⁵', '0.36'));
  expect(await endsOf(line(diagram))).toEqual(above);
});

test('the wavelength slider runs from 400 nm to 700 nm in steps of 5 nm', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  const slider = wavelengthSlider(diagram);

  await slider.focus();
  await page.keyboard.press('Home');
  await expect(status(diagram)).toHaveText(readout(400, 1, '2.22 × 10²', '3.0 × 10⁻⁵', '0.01'));
  await page.keyboard.press('ArrowRight');
  await expect(slider).toHaveAttribute('aria-valuetext', '405 nm');
  await page.keyboard.press('End');

  await expect(status(diagram)).toHaveText(readout(700, 1, '0.801', '3.0 × 10⁻⁵', '0.00'));
});

test('raising the concentration from the keyboard moves the dot along the line and raises the absorbance in proportion', async ({
  page,
}) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  const lineBefore = await endsOf(line(diagram));
  const dotBefore = await centerOf(calibration(diagram).locator('[data-dot]'));
  const heightBefore = await heightOf(calibration(diagram));
  const peakBefore = (await yOnAxis(spectrum(diagram), 0)) - (await topOf(curve(diagram))).y;

  await concentrationSlider(diagram).focus();
  await pressTimes(page, 'ArrowRight', 2);

  await expect(status(diagram)).toHaveText(readout(520, 1, '2.00 × 10⁴', '4.0 × 10⁻⁵', '0.80'));
  expect(await endsOf(line(diagram)), 'the line does not move').toEqual(lineBefore);
  const dot = await centerOf(calibration(diagram).locator('[data-dot]'));
  expect(dot.x).toBeGreaterThan(dotBefore.x);
  expect(Math.abs(dot.x - (await xOfConcentration(diagram, 4)))).toBeLessThanOrEqual(0.1);
  await expectDotOnLine(diagram);
  // From 3.0 to 4.0 × 10⁻⁵ M the concentration, and so the absorbance, is 4/3 as large.
  expect(Math.abs((await heightOf(calibration(diagram))) / heightBefore - 4 / 3)).toBeLessThanOrEqual(0.005);
  const peak = (await yOnAxis(spectrum(diagram), 0)) - (await topOf(curve(diagram))).y;
  expect(Math.abs(peak / peakBefore - 4 / 3)).toBeLessThanOrEqual(0.005);
  await expect(concentrationSlider(diagram)).toHaveAccessibleName('Concentration');
  await expect(concentrationSlider(diagram)).toHaveAttribute('aria-valuetext', '4.0 × 10⁻⁵ M');
});

test('the concentration slider runs from 0 to 5.0 × 10⁻⁵ M in steps of 0.5 × 10⁻⁵ M', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  const slider = concentrationSlider(diagram);

  await slider.focus();
  await page.keyboard.press('Home');
  await expect(status(diagram)).toHaveText(readout(520, 1, '2.00 × 10⁴', '0', '0.00'));
  await expect(slider).toHaveAttribute('aria-valuetext', '0 M');
  await page.keyboard.press('ArrowRight');
  await expect(status(diagram)).toHaveText(readout(520, 1, '2.00 × 10⁴', '5.0 × 10⁻⁶', '0.10'));
  await expect(slider).toHaveAttribute('aria-valuetext', '5.0 × 10⁻⁶ M');
  await page.keyboard.press('End');

  await expect(status(diagram)).toHaveText(readout(520, 1, '2.00 × 10⁴', '5.0 × 10⁻⁵', '1.00'));
  await expect(slider).toHaveAttribute('aria-valuetext', '5.0 × 10⁻⁵ M');
});

test('with no dye the spectrum lies along the axis, the dot sits at the origin and no peak is named', async ({
  page,
}) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  await expect(peakLabel(diagram)).toHaveCount(1);
  const lineBefore = await endsOf(line(diagram));

  await concentrationSlider(diagram).fill('0');

  await expect(status(diagram)).toHaveText(readout(520, 1, '2.00 × 10⁴', '0', '0.00'));
  const axis = await yOnAxis(spectrum(diagram), 0);
  expect((await pointsOf(curve(diagram))).filter((p) => p.y !== axis)).toEqual([]);
  expect(await centerOf(calibration(diagram).locator('[data-dot]'))).toEqual((await endsOf(line(diagram))).from);
  // A label naming a peak would contradict a flat curve.
  await expect(peakLabel(diagram)).toHaveCount(0);
  await expect(peakGuide(diagram)).toHaveCount(0);
  // The line keeps its slope: it belongs to the wavelength and the cell, not to this solution.
  expect(await endsOf(line(diagram))).toEqual(lineBefore);
  await expect(slopeLabel(diagram)).toHaveText('slope = εb');

  await concentrationSlider(diagram).fill('0.5');

  await expect(status(diagram)).toHaveText(readout(520, 1, '2.00 × 10⁴', '5.0 × 10⁻⁶', '0.10'));
  await expect(peakLabel(diagram)).toHaveText('λmax = 520 nm');
});

test('the 2 cm cell doubles the absorbance and the slope', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  const steepnessBefore = await steepnessOf(line(diagram));
  const heightBefore = await heightOf(calibration(diagram));
  const peakBefore = (await yOnAxis(spectrum(diagram), 0)) - (await topOf(curve(diagram))).y;

  await cellRadio(diagram, 2).check();

  // ε belongs to the dye and the wavelength, so it does not change with the cell.
  await expect(status(diagram)).toHaveText(readout(520, 2, '2.00 × 10⁴', '3.0 × 10⁻⁵', '1.20'));
  expect(Math.abs((await steepnessOf(line(diagram))) / steepnessBefore - 2)).toBeLessThanOrEqual(0.005);
  expect(Math.abs((await heightOf(calibration(diagram))) / heightBefore - 2)).toBeLessThanOrEqual(0.005);
  await expectDotOnLine(diagram);
  await expect(slopeLabel(diagram)).toHaveText('slope = εb');
  const peak = (await yOnAxis(spectrum(diagram), 0)) - (await topOf(curve(diagram))).y;
  expect(Math.abs(peak / peakBefore - 2)).toBeLessThanOrEqual(0.005);
});

// The dye's ε is tabulated to the three figures shown, so a student can check A = εbc on the readout itself.
test('the numbers in the readout multiply to the absorbance shown', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await wavelengthSlider(diagram).fill('495');
  await cellRadio(diagram, 2).check();
  await concentrationSlider(diagram).fill('5');

  // 1.65 × 10⁴ × 2 × 5.0 × 10⁻⁵ = 1.65.
  await expect(status(diagram)).toHaveText(readout(495, 2, '1.65 × 10⁴', '5.0 × 10⁻⁵', '1.65'));

  await wavelengthSlider(diagram).fill('545');
  await cellRadio(diagram, 1).check();
  await concentrationSlider(diagram).fill('3');

  // 1.65 × 10⁴ × 1 × 3.0 × 10⁻⁵ = 0.495, a tie, which rounds up.
  await expect(status(diagram)).toHaveText(readout(545, 1, '1.65 × 10⁴', '3.0 × 10⁻⁵', '0.50'));
});

test('the cell can be chosen from the keyboard', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await cellGroup(diagram).getByRole('radio', { checked: true }).focus();
  await page.keyboard.press('ArrowDown');

  await expect(cellRadio(diagram, 2)).toBeChecked();
  await expect(status(diagram)).toHaveText(readout(520, 2, '2.00 × 10⁴', '3.0 × 10⁻⁵', '1.20'));

  await page.keyboard.press('ArrowUp');

  await expect(cellRadio(diagram, 1)).toBeChecked();
  await expect(status(diagram)).toHaveText(START);
});

test('the largest absorbance the controls reach, 2.00, is at the top of both axes', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await cellRadio(diagram, 2).check();
  await concentrationSlider(diagram).fill('5');

  await expect(status(diagram)).toHaveText(readout(520, 2, '2.00 × 10⁴', '5.0 × 10⁻⁵', '2.00'));
  const corner = { x: await xOfConcentration(diagram, 5), y: await yOnAxis(calibration(diagram), 2) };
  expect((await endsOf(line(diagram))).to).toEqual(corner);
  expect(await centerOf(calibration(diagram).locator('[data-dot]'))).toEqual(corner);
  expect((await topOf(curve(diagram))).y).toBe(await yOnAxis(spectrum(diagram), 2));
});

test('the chosen wavelength is a solid line and the peak a dashed one, so they differ by more than color', async ({
  page,
}) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await wavelengthSlider(diagram).fill('560');

  await expect(status(diagram)).toHaveText(readout(560, 1, '1.21 × 10⁴', '3.0 × 10⁻⁵', '0.36'));
  await expect(chosenLine(diagram)).toHaveCSS('stroke-dasharray', 'none');
  await expect(peakGuide(diagram)).not.toHaveCSS('stroke-dasharray', 'none');
  expect(await numberOf(peakGuide(diagram), 'x1')).toBeLessThan(await numberOf(chosenLine(diagram), 'x1'));
});

test("each drawing's name says what is drawn now", async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  const spectrumDrawing = spectrum(diagram).getByRole('img');
  const calibrationDrawing = calibration(diagram).getByRole('img');

  await expect(spectrumDrawing).toHaveAccessibleName(
    /^Graph of absorbance against wavelength, from 400 nm to 700 nm, for a 3\.0 × 10⁻⁵ M solution in a 1 cm cell\. .*the absorbance there is 0\.60\. .*520 nm, at the top of the peak\.$/,
  );
  await expect(calibrationDrawing).toHaveAccessibleName(
    /^Graph of absorbance against concentration, .*at 520 nm in a 1 cm cell\. .*its slope is εb\. The line is at its steepest for this cell.*chosen concentration, 3\.0 × 10⁻⁵ M\.$/,
  );

  await wavelengthSlider(diagram).fill('560');
  await cellRadio(diagram, 2).check();

  await expect(spectrumDrawing).toHaveAccessibleName(
    /in a 2 cm cell\. .*the absorbance there is 1\.20\. .*560 nm, to the right of the peak\.$/,
  );
  await expect(calibrationDrawing).toHaveAccessibleName(
    /at 560 nm in a 2 cm cell\. .*its slope is εb\. The line is less steep than at 520 nm/,
  );

  await concentrationSlider(diagram).fill('0');

  await expect(spectrumDrawing).toHaveAccessibleName(/With no dye in the solution, the curve lies along the wavelength axis\./);
});

test('every control can be reached with Tab, in the order shown', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await wavelengthSlider(diagram).focus();
  await page.keyboard.press('Tab');
  await expect(concentrationSlider(diagram)).toBeFocused();
  await page.keyboard.press('Tab');

  await expect(cellGroup(diagram).getByRole('radio', { checked: true })).toBeFocused();
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

/** Points a tenth of the way apart along each stretch between two drawn points, so a label cannot hide between them. */
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

/** Checks both drawings as they stand: no text cut off, and nothing drawn through the name of the peak or the slope. */
async function expectLabelsClear(diagram: Locator, state: string) {
  for (const panel of [spectrum(diagram), calibration(diagram)]) {
    const cutOff = await panel.locator('svg').evaluate((svg) => {
      const frame = svg.getBoundingClientRect();
      return [...svg.querySelectorAll('text')]
        .filter((text) => {
          const box = text.getBoundingClientRect();
          return box.left < frame.left - 0.5 || box.right > frame.right + 0.5 || box.top < frame.top - 0.5 || box.bottom > frame.bottom + 0.5;
        })
        .map((text) => text.textContent);
    });
    expect(cutOff, `${state}: text outside the drawing`).toEqual([]);
  }

  if ((await peakLabel(diagram).count()) > 0) {
    const peak = await labelBox(peakLabel(diagram));
    const spectrumPoints = finePoints(await pointsOf(curve(diagram)));
    expect(spectrumPoints.filter((p) => near(peak, p, CLEARANCE)), `${state}: "${peak.name}" touches the curve`).toEqual([]);
    const dot = await centerOf(spectrum(diagram).locator('[data-dot]'));
    expect(near(peak, dot, DOT_RADIUS), `${state}: "${peak.name}" touches the dot`).toBe(false);
  }

  const slope = await labelBox(slopeLabel(diagram));
  const { from, to } = await endsOf(line(diagram));
  const linePoints = Array.from({ length: 201 }, (_, k) => ({
    x: from.x + ((to.x - from.x) * k) / 200,
    y: from.y + ((to.y - from.y) * k) / 200,
  }));
  expect(linePoints.filter((p) => near(slope, p, CLEARANCE)), `${state}: "${slope.name}" touches the line`).toEqual([]);
  const dot = await centerOf(calibration(diagram).locator('[data-dot]'));
  expect(near(slope, dot, DOT_RADIUS), `${state}: "${slope.name}" touches the dot`).toBe(false);
}

// The steepest line, the tallest peak, both ends of the spectrum and a flat curve.
const EXTREMES = [
  { wavelength: 520, units: 3, cell: 1 },
  { wavelength: 520, units: 5, cell: 2 },
  { wavelength: 520, units: 0.5, cell: 2 },
  { wavelength: 400, units: 5, cell: 2 },
  { wavelength: 700, units: 5, cell: 2 },
  { wavelength: 505, units: 4.5, cell: 2 },
  { wavelength: 520, units: 0, cell: 1 },
];

test('at the extremes of every control, no label is cut off or touches what is drawn', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  for (const { wavelength, units, cell } of EXTREMES) {
    await wavelengthSlider(diagram).fill(String(wavelength));
    await concentrationSlider(diagram).fill(String(units));
    await cellRadio(diagram, cell).check();
    await expect(status(diagram)).toContainText(`At ${wavelength} nm in a ${cell} cm cell`);
    await expect(concentrationSlider(diagram)).toHaveValue(String(units));

    await expectLabelsClear(diagram, `${wavelength} nm, ${units} × 10⁻⁵ M, ${cell} cm`);
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

  for (const panel of [spectrum(diagram), calibration(diagram)]) {
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

// The text as it is drawn on the screen: its size in drawing units, scaled
// by how wide the drawing is shown. One above the other, each drawing is wide
// enough for 12 px text from a 412 px phone up; side by side on a desktop it
// was not, which is why the graphs stack at every width.
for (const width of [1280, 412]) {
  test(`on a ${width} px screen each drawing's text is drawn 12 px or larger`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const diagram = await openDiagram(page, PAGE, NAME);
    await page.evaluate(() => document.fonts.ready);

    for (const panel of [spectrum(diagram), calibration(diagram)]) {
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

for (const width of [1280, 412, 390, 360, 320]) {
  test(`on a ${width} px screen the two graphs stack, nothing scrolls sideways and the controls stay inside the diagram`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 800 });
    const diagram = await openDiagram(page, PAGE, NAME);
    // The longest readout and the steepest line, with the dot in the corner of its graph.
    await cellRadio(diagram, 2).check();
    await concentrationSlider(diagram).fill('5');
    await expect(status(diagram)).toHaveText(readout(520, 2, '2.00 × 10⁴', '5.0 × 10⁻⁵', '2.00'));
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

for (const theme of ['light', 'dark'] as const) {
  test(`the diagram has no accessibility violations in the ${theme} theme, at the start and off the peak in the 2 cm cell`, async ({
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
    await wavelengthSlider(diagram).fill('560');
    await cellRadio(diagram, 2).check();
    await expect(status(diagram)).toHaveText(readout(560, 2, '1.21 × 10⁴', '3.0 × 10⁻⁵', '0.73'));

    expect(await violations(), 'off the peak in the 2 cm cell').toEqual([]);
  });
}

test.describe('with JavaScript off', () => {
  test.use({ javaScriptEnabled: false });

  test('both drawings and the starting readout show, with no controls', async ({ page }) => {
    await expectStaticDiagram(page, PAGE, NAME, START);

    const diagram = page.locator(`[data-diagram="${NAME}"]`);
    await expect(spectrum(diagram).getByRole('img')).toBeVisible();
    await expect(calibration(diagram).getByRole('img')).toBeVisible();
    await expect(peakLabel(diagram)).toHaveText('λmax = 520 nm');
    await expect(slopeLabel(diagram)).toHaveText('slope = εb');
  });
});
