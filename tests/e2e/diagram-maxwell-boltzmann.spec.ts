import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator, type Page } from '@playwright/test';
import { expectStaticDiagram, openDiagram } from './diagram';

const PAGE = '/unit-3-substances-and-mixtures/3-5-kinetic-molecular-theory/';
const NAME = 'maxwell-boltzmann';

const speedReadout = (gas: string, temperature: number, peak: number, share: string, threshold: number) =>
  `${gas} at ${temperature} K: the most probable speed is ${peak} m/s. ${share} of the molecules are faster than ${threshold} m/s.`;
const energyReadout = (temperature: number, share: string, threshold: number) =>
  `At ${temperature} K, every gas has the same spread of kinetic energies. ${share} of the molecules have more than ${threshold} kJ/mol.`;
const START = speedReadout('N₂', 300, 422, '26%', 600);
const ENERGY_START = energyReadout(300, '4.6%', 10);

const GASES = ['CH₄', 'N₂', 'CO₂'];
const SPEED_AXIS_MAX = 2000;
const ENERGY_AXIS_MAX = 30;

const NUMBER = String.raw`(-?\d+(?:\.\d+)?)`;
const POINT = new RegExp(`[ML]${NUMBER} ${NUMBER}`, 'g');

interface Point {
  x: number;
  y: number;
}

/** The points of a drawn curve or region, in drawing units. A larger y is lower on the screen. */
async function pointsOf(path: Locator): Promise<Point[]> {
  const d = (await path.getAttribute('d')) ?? '';
  const points = [...d.matchAll(POINT)].map((m) => ({ x: Number(m[1]), y: Number(m[2]) }));
  if (points.length < 3) throw new Error(`Not a curve: ${d}`);
  return points;
}

/** The highest point of a drawn curve: the one with the smallest y. */
async function peakOf(curve: Locator): Promise<Point> {
  const points = await pointsOf(curve);
  return points.reduce((best, p) => (p.y < best.y ? p : best));
}

/** Where the horizontal axis puts a value, read from its first and last ticks. */
async function xOnAxis(diagram: Locator, value: number, axisMax: number): Promise<number> {
  const start = Number(await diagram.locator('[data-tick="0"]').getAttribute('x1'));
  const end = Number(await diagram.locator(`[data-tick="${axisMax}"]`).getAttribute('x1'));
  return start + (value / axisMax) * (end - start);
}

async function centerOf(circle: Locator): Promise<Point> {
  return { x: Number(await circle.getAttribute('cx')), y: Number(await circle.getAttribute('cy')) };
}

/**
 * Checks that a dot sits on a curve at the curve's highest drawn point.
 * Points beside the peak can round to the same height, so "highest" means
 * no point is higher, not one particular point.
 */
async function expectAtTop(curve: Locator, dot: Point) {
  const points = await pointsOf(curve);
  expect(points, 'the dot is on the curve').toContainEqual(dot);
  expect(Math.min(...points.map((p) => p.y)), 'no point of the curve is higher').toBe(dot.y);
}

async function pressTimes(page: Page, key: string, times: number) {
  for (let i = 0; i < times; i++) await page.keyboard.press(key);
}

const chosen = (diagram: Locator) => diagram.locator('[data-curve="chosen"]');
const reference = (diagram: Locator) => diagram.locator('[data-curve="reference"]');
const shade = (diagram: Locator) => diagram.locator('[data-shade]');
const marker = (diagram: Locator) => diagram.locator('[data-marker]');
const status = (diagram: Locator) => diagram.getByRole('status');
const gasGroup = (diagram: Locator) => diagram.getByRole('group', { name: 'Gas' });
const showGroup = (diagram: Locator) => diagram.getByRole('group', { name: 'Show' });
const gasRadio = (diagram: Locator, gas: string) => gasGroup(diagram).getByRole('radio', { name: gas, exact: true });
const temperatureSlider = (diagram: Locator) => diagram.getByRole('slider', { name: 'Temperature' });
const speedSlider = (diagram: Locator) => diagram.getByRole('slider', { name: 'Faster than' });
const energySlider = (diagram: Locator) => diagram.getByRole('slider', { name: 'More energy than' });

async function showEnergies(diagram: Locator) {
  await showGroup(diagram).getByRole('radio', { name: 'Kinetic energy' }).check();
  await expect(status(diagram)).toHaveText(ENERGY_START);
}

test('the diagram starts with nitrogen at 300 K, drawn on top of the comparison curve', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await expect(status(diagram)).toHaveText(START);
  await expect(gasRadio(diagram, 'N₂')).toBeChecked();
  await expect(showGroup(diagram).getByRole('radio', { name: 'Speed' })).toBeChecked();
  await expect(temperatureSlider(diagram)).toHaveAttribute('aria-valuetext', '300 K');
  await expect(speedSlider(diagram)).toHaveAttribute('aria-valuetext', '600 m/s');
  expect(await chosen(diagram).getAttribute('d')).toBe(await reference(diagram).getAttribute('d'));
  await expect(diagram.locator('[data-curve-label="chosen"]')).toHaveText('N₂, 300 K');
  await expect(diagram.locator('[data-curve-label="reference"]')).toHaveText('N₂, 300 K, to compare');
  await expect(diagram.locator('[data-axis-label="x"]')).toHaveText('molecular speed (m/s)');
  await expect(diagram.locator('[data-axis-label="y"]')).toHaveText('fraction of molecules');
});

test('a dot and a label mark the most probable speed, at the top of the chosen curve', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  const dot = await centerOf(marker(diagram));

  await expectAtTop(chosen(diagram), dot);
  // Within the rounding of three drawn positions, each to a tenth of a unit.
  expect(Math.abs(dot.x - (await xOnAxis(diagram, 421.98, SPEED_AXIS_MAX)))).toBeLessThanOrEqual(0.2);
  await expect(diagram.locator('[data-peak-label]')).toHaveText('422 m/s');
});

test('raising the temperature from the keyboard moves the peak right and lowers it', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  const before = await peakOf(chosen(diagram));

  await temperatureSlider(diagram).focus();
  await pressTimes(page, 'ArrowRight', 4);

  await expect(status(diagram)).toHaveText(speedReadout('N₂', 500, 545, '49%', 600));
  const after = await peakOf(chosen(diagram));
  expect(after.x).toBeGreaterThan(before.x);
  expect(after.y, 'lower on the screen').toBeGreaterThan(before.y);
  await expectAtTop(chosen(diagram), await centerOf(marker(diagram)));
  await expect(diagram.locator('[data-curve-label="chosen"]')).toHaveText('N₂, 500 K');
  // The name is static; the value is announced once, through aria-valuetext.
  await expect(temperatureSlider(diagram)).toHaveAccessibleName('Temperature');
  await expect(temperatureSlider(diagram)).toHaveAttribute('aria-valuetext', '500 K');
});

test('the temperature slider runs from 200 K to 600 K in steps of 50 K', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  const slider = temperatureSlider(diagram);

  await slider.focus();
  await page.keyboard.press('Home');
  await expect(status(diagram)).toHaveText(speedReadout('N₂', 200, 345, '11%', 600));
  await page.keyboard.press('ArrowRight');
  await expect(slider).toHaveAttribute('aria-valuetext', '250 K');
  await page.keyboard.press('End');

  await expect(status(diagram)).toHaveText(speedReadout('N₂', 600, 597, '57%', 600));
});

test('choosing methane moves the peak right of the comparison curve and lowers it', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await gasRadio(diagram, 'CH₄').check();

  await expect(status(diagram)).toHaveText(speedReadout('CH₄', 300, 558, '51%', 600));
  const peak = await peakOf(chosen(diagram));
  const comparison = await peakOf(reference(diagram));
  expect(peak.x).toBeGreaterThan(comparison.x);
  expect(peak.y, 'lower on the screen').toBeGreaterThan(comparison.y);
  await expect(diagram.locator('[data-curve-label="chosen"]')).toHaveText('CH₄, 300 K');
});

test('choosing carbon dioxide from the keyboard moves the peak left of the comparison curve and raises it', async ({
  page,
}) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await gasGroup(diagram).getByRole('radio', { checked: true }).focus();
  await page.keyboard.press('ArrowDown');

  await expect(gasRadio(diagram, 'CO₂')).toBeChecked();
  await expect(status(diagram)).toHaveText(speedReadout('CO₂', 300, 337, '9.6%', 600));
  const peak = await peakOf(chosen(diagram));
  const comparison = await peakOf(reference(diagram));
  expect(peak.x).toBeLessThan(comparison.x);
  expect(peak.y, 'higher on the screen').toBeLessThan(comparison.y);
});

test('the shaded region starts at the threshold and lies under the chosen curve', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  const region = await pointsOf(shade(diagram));
  const curve = await pointsOf(chosen(diagram));

  const left = Math.min(...region.map((p) => p.x));
  expect(Math.abs(left - (await xOnAxis(diagram, 600, SPEED_AXIS_MAX)))).toBeLessThanOrEqual(0.1);
  expect(Number(await diagram.locator('[data-threshold]').getAttribute('x1'))).toBe(left);
  // Its top edge is the curve itself, from the threshold on.
  for (const p of curve.filter((p) => p.x >= left)) expect(region).toContainEqual(p);
});

test('raising the threshold from the keyboard shrinks the shaded region and the percentage', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  const before = await pointsOf(shade(diagram));

  await speedSlider(diagram).focus();
  await pressTimes(page, 'ArrowRight', 8);

  await expect(status(diagram)).toHaveText(speedReadout('N₂', 300, 422, '1.1%', 1000));
  const after = await pointsOf(shade(diagram));
  expect(Math.abs(Math.min(...after.map((p) => p.x)) - (await xOnAxis(diagram, 1000, SPEED_AXIS_MAX)))).toBeLessThanOrEqual(
    0.1,
  );
  expect(after.length).toBeLessThan(before.length);
  await expect(speedSlider(diagram)).toHaveAccessibleName('Faster than');
  await expect(speedSlider(diagram)).toHaveAttribute('aria-valuetext', '1000 m/s');
});

test('the readout never says 0% or 100% at the ends of the threshold slider', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await speedSlider(diagram).fill('2000');
  await expect(status(diagram)).toHaveText(speedReadout('N₂', 300, 422, 'Fewer than 0.1%', 2000));
  await speedSlider(diagram).fill('0');

  await expect(status(diagram)).toHaveText(speedReadout('N₂', 300, 422, 'More than 99.9%', 0));
});

test('showing kinetic energy draws the energy curve, with no most probable speed', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  const speedCurve = await chosen(diagram).getAttribute('d');

  await showGroup(diagram).getByRole('radio', { checked: true }).focus();
  await page.keyboard.press('ArrowDown');

  await expect(showGroup(diagram).getByRole('radio', { name: 'Kinetic energy' })).toBeChecked();
  await expect(status(diagram)).toHaveText(ENERGY_START);
  await expect(diagram.locator('[data-axis-label="x"]')).toHaveText('kinetic energy (kJ/mol)');
  // The energy curve is the same for every gas, so its names single none out.
  await expect(diagram.locator('[data-curve-label="chosen"]')).toHaveText('any gas, 300 K');
  await expect(diagram.locator('[data-curve-label="reference"]')).toHaveText('any gas, 300 K, to compare');
  expect(await chosen(diagram).getAttribute('d')).not.toBe(speedCurve);
  await expect(marker(diagram)).toHaveCount(0);
  await expect(diagram.locator('[data-peak-label]')).toHaveCount(0);
  await expect(energySlider(diagram)).toHaveAttribute('aria-valuetext', '10 kJ/mol');
  await expect(speedSlider(diagram)).toHaveCount(0);
  const left = Math.min(...(await pointsOf(shade(diagram))).map((p) => p.x));
  expect(Math.abs(left - (await xOnAxis(diagram, 10, ENERGY_AXIS_MAX)))).toBeLessThanOrEqual(0.1);
});

test('in energy mode, choosing each gas leaves the curve unchanged, and the readout says why', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  await showEnergies(diagram);
  const curve = await chosen(diagram).getAttribute('d');
  const region = await shade(diagram).getAttribute('d');

  for (const gas of GASES) {
    await gasRadio(diagram, gas).check();

    await expect(gasRadio(diagram, gas)).toBeChecked();
    await expect(diagram.locator('[data-curve-label="chosen"]')).toHaveText('any gas, 300 K');
    await expect(status(diagram)).toHaveText(ENERGY_START);
    expect(await chosen(diagram).getAttribute('d'), gas).toBe(curve);
    expect(await shade(diagram).getAttribute('d'), gas).toBe(region);
  }

  // The choice was taken, though nothing moved: the speed view shows the last gas chosen.
  await showGroup(diagram).getByRole('radio', { name: 'Speed' }).check();
  await expect(status(diagram)).toHaveText(speedReadout('CO₂', 300, 337, '9.6%', 600));
  await expect(diagram.locator('[data-curve-label="chosen"]')).toHaveText('CO₂, 300 K');
});

test('in energy mode, the temperature and the threshold still change the curve and the percentage', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  await showEnergies(diagram);
  const before = await peakOf(chosen(diagram));

  await temperatureSlider(diagram).fill('600');

  await expect(status(diagram)).toHaveText(energyReadout(600, '26%', 10));
  const after = await peakOf(chosen(diagram));
  expect(after.x).toBeGreaterThan(before.x);
  expect(after.y, 'lower on the screen').toBeGreaterThan(before.y);

  await energySlider(diagram).focus();
  await page.keyboard.press('ArrowRight');

  await expect(status(diagram)).toHaveText(energyReadout(600, '22%', 11));
  await expect(energySlider(diagram)).toHaveAttribute('aria-valuetext', '11 kJ/mol');
});

test('each view keeps its own threshold', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  await speedSlider(diagram).fill('1000');
  await showGroup(diagram).getByRole('radio', { name: 'Kinetic energy' }).check();
  await expect(status(diagram)).toHaveText(ENERGY_START);

  await showGroup(diagram).getByRole('radio', { name: 'Speed' }).check();

  await expect(status(diagram)).toHaveText(speedReadout('N₂', 300, 422, '1.1%', 1000));
  await expect(speedSlider(diagram)).toHaveValue('1000');
});

test('the comparison curve never changes, and is dashed where the chosen curve is solid', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  const speedComparison = await reference(diagram).getAttribute('d');
  await expect(reference(diagram)).not.toHaveCSS('stroke-dasharray', 'none');
  await expect(chosen(diagram)).toHaveCSS('stroke-dasharray', 'none');

  await gasRadio(diagram, 'CH₄').check();
  await temperatureSlider(diagram).fill('600');
  await speedSlider(diagram).fill('1000');
  await expect(status(diagram)).toHaveText(speedReadout('CH₄', 600, 789, '36%', 1000));

  expect(await reference(diagram).getAttribute('d')).toBe(speedComparison);
  expect(await chosen(diagram).getAttribute('d')).not.toBe(speedComparison);

  await showGroup(diagram).getByRole('radio', { name: 'Kinetic energy' }).check();
  await expect(status(diagram)).toHaveText(energyReadout(600, '26%', 10));
  const energyComparison = await reference(diagram).getAttribute('d');
  expect(energyComparison).not.toBe(speedComparison);
  await gasRadio(diagram, 'CO₂').check();
  await temperatureSlider(diagram).fill('200');
  await energySlider(diagram).fill('5');
  await expect(status(diagram)).toHaveText(energyReadout(200, '11%', 5));

  expect(await reference(diagram).getAttribute('d')).toBe(energyComparison);
  await expect(reference(diagram)).not.toHaveCSS('stroke-dasharray', 'none');

  await showGroup(diagram).getByRole('radio', { name: 'Speed' }).check();
  await expect(status(diagram)).toHaveText(speedReadout('CO₂', 200, 275, 'Fewer than 0.1%', 1000));
  expect(await reference(diagram).getAttribute('d')).toBe(speedComparison);
});

test("the drawing's name says what is drawn now", async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  const drawing = diagram.getByRole('img');

  await expect(drawing).toHaveAccessibleName(/^Graph of the fraction of molecules against molecular speed\. .*N₂ at 300 K.*It lies on the dashed comparison curve/);
  await gasRadio(diagram, 'CH₄').check();
  await expect(drawing).toHaveAccessibleName(/for CH₄ at 300 K.*it is lower and broader, with its peak farther right\./);
  await showGroup(diagram).getByRole('radio', { name: 'Kinetic energy' }).check();

  await expect(drawing).toHaveAccessibleName(/^Graph of the fraction of molecules against kinetic energy\. .*for any gas at 300 K/);
});

test('every control can be reached with Tab, in the order shown', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await gasGroup(diagram).getByRole('radio', { checked: true }).focus();
  await page.keyboard.press('Tab');
  await expect(temperatureSlider(diagram)).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(speedSlider(diagram)).toBeFocused();
  await page.keyboard.press('Tab');

  await expect(showGroup(diagram).getByRole('radio', { checked: true })).toBeFocused();
});

interface Box {
  name: string;
  left: number;
  right: number;
  top: number;
  bottom: number;
}

/** The boxes of the labels matching a selector, in drawing units. None of them is rotated. */
async function labelBoxes(diagram: Locator, selector: string): Promise<Box[]> {
  return diagram.locator(selector).evaluateAll((texts) =>
    texts.map((text) => {
      if (!(text instanceof SVGTextElement)) throw new Error('A label is not SVG text.');
      const box = text.getBBox();
      return { name: text.textContent ?? '', left: box.x, right: box.x + box.width, top: box.y, bottom: box.y + box.height };
    }),
  );
}

/** A drawn curve with nine more points along each of its segments, so a label cannot hide between two points. */
async function finePointsOf(curve: Locator): Promise<Point[]> {
  const points = await pointsOf(curve);
  return points.flatMap((p, i) => {
    const next = points[i + 1];
    if (!next) return [p];
    return Array.from({ length: 10 }, (_, k) => ({ x: p.x + ((next.x - p.x) * k) / 10, y: p.y + ((next.y - p.y) * k) / 10 }));
  });
}

const inside = (box: Box, p: Point) =>
  p.x >= box.left - 1 && p.x <= box.right + 1 && p.y >= box.top - 1 && p.y <= box.bottom + 1;
const overlap = (a: Box, b: Box) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;

/** Checks the drawing as it stands: no text cut off, no curve through a curve's name, the peak's label clear. */
async function expectLabelsClear(diagram: Locator, state: string) {
  const cutOff = await diagram.locator('svg').first().evaluate((svg) => {
    const frame = svg.getBoundingClientRect();
    return [...svg.querySelectorAll('text')]
      .filter((text) => {
        const box = text.getBoundingClientRect();
        return box.left < frame.left - 0.5 || box.right > frame.right + 0.5 || box.top < frame.top - 0.5 || box.bottom > frame.bottom + 0.5;
      })
      .map((text) => text.textContent);
  });
  expect(cutOff, `${state}: text outside the drawing`).toEqual([]);

  const chosenCurve = await finePointsOf(chosen(diagram));
  const bothCurves = [...chosenCurve, ...(await finePointsOf(reference(diagram)))];
  const curveLabels = await labelBoxes(diagram, '[data-curve-label]');
  expect(curveLabels).toHaveLength(2);
  for (const label of curveLabels) {
    expect(bothCurves.filter((p) => inside(label, p)), `${state}: "${label.name}" touches a curve`).toEqual([]);
  }
  // The comparison curve may pass behind the peak's label, which has
  // a halo for that; the chosen curve and the other labels may not.
  for (const label of await labelBoxes(diagram, '[data-peak-label]')) {
    expect(chosenCurve.filter((p) => inside(label, p)), `${state}: "${label.name}" touches its curve`).toEqual([]);
    expect(curveLabels.filter((other) => overlap(label, other)), `${state}: "${label.name}" overlaps a label`).toEqual([]);
  }
}

const EXTREME_TEMPERATURES = [200, 300, 600];

test('Speed: for every gas at the lowest, starting and highest temperature, no label is cut off or touches a curve', async ({
  page,
}) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  for (const gas of GASES) {
    for (const temperature of EXTREME_TEMPERATURES) {
      await gasRadio(diagram, gas).check();
      await temperatureSlider(diagram).fill(String(temperature));
      await expect(diagram.locator('[data-curve-label="chosen"]')).toHaveText(`${gas}, ${temperature} K`);

      await expectLabelsClear(diagram, `${gas} at ${temperature} K`);
    }
  }
});

// The gas has no effect on the energy curve, so only the temperature is varied.
test('Kinetic energy: at the lowest, starting and highest temperature, no label is cut off or touches a curve', async ({
  page,
}) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  await showEnergies(diagram);

  for (const temperature of EXTREME_TEMPERATURES) {
    await temperatureSlider(diagram).fill(String(temperature));
    await expect(diagram.locator('[data-curve-label="chosen"]')).toHaveText(`any gas, ${temperature} K`);

    await expectLabelsClear(diagram, `${temperature} K`);
  }
});

test('on a wide screen the two "Show" choices sit on one line', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  const diagram = await openDiagram(page, PAGE, NAME);

  const tops = await showGroup(diagram)
    .locator('label')
    .evaluateAll((labels) => labels.map((label) => label.getBoundingClientRect().top));

  expect(tops).toHaveLength(2);
  expect(tops[1]).toBe(tops[0]);
});

// A nominal size, not a rendered one: the font size in drawing units, times
// 320, over the drawing's width in units. That is the size of the text when
// the drawing itself is shown 320 px wide, the ratio of the site's figures
// (18 on 480). On a narrow phone the drawing is narrower than 320 px, and
// its text is smaller in proportion.
test("the drawing's text is 12 px or more when the drawing itself is shown 320 px wide, the ratio of the site's figures", async ({
  page,
}) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  const sizes = await diagram.locator('svg').first().evaluate((svg) => {
    if (!(svg instanceof SVGSVGElement)) throw new Error('The drawing is not an SVG.');
    const unitsWide = svg.viewBox.baseVal.width;
    return [...svg.querySelectorAll('text')].map((text) => ({
      text: text.textContent,
      pxAt320: (Number.parseFloat(getComputedStyle(text).fontSize) * 320) / unitsWide,
    }));
  });

  expect(sizes.length).toBeGreaterThanOrEqual(10);
  for (const size of sizes) expect(size.pxAt320, `"${size.text}"`).toBeGreaterThanOrEqual(12);
});

for (const view of ['Speed', 'Kinetic energy']) {
  test(`${view}: on a 320 px screen the diagram does not scroll sideways and its controls stay inside it`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 700 });
    const diagram = await openDiagram(page, PAGE, NAME);
    await showGroup(diagram).getByRole('radio', { name: view }).check();
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
      return { overflow: element.scrollWidth - element.clientWidth, outside, right: frame.right, left: frame.left };
    });

    expect(measured.overflow, 'sideways scrolling inside the diagram').toBeLessThanOrEqual(0);
    expect(measured.outside, 'parts sticking out of the diagram').toEqual([]);
    expect(measured.left).toBeGreaterThanOrEqual(0);
    expect(measured.right).toBeLessThanOrEqual(320);
  });
}

for (const theme of ['light', 'dark'] as const) {
  test(`the diagram has no accessibility violations in the ${theme} theme, showing speeds and then energies`, async ({
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

    expect(await violations(), 'showing speeds').toEqual([]);
    await showEnergies(diagram);

    expect(await violations(), 'showing energies').toEqual([]);
  });
}

test.describe('with JavaScript off', () => {
  test.use({ javaScriptEnabled: false });

  test('the drawing shows nitrogen at 300 K and no controls', async ({ page }) => {
    await expectStaticDiagram(page, PAGE, NAME, START);
  });
});
