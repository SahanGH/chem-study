import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator } from '@playwright/test';
import { expectStaticDiagram, openDiagram } from './diagram';

const PAGE = '/unit-4-chemical-reactions/4-6-introduction-to-titration/';
const NAME = 'titration';

// Every sentence and number below is written out from the lesson's model (20.0 mL of
// 0.150 M acid, 0.200 M NaOH), apart from the module under test.
const START_READOUT =
  '10.0 mL of base added: 2.00 mmol of OH⁻ have neutralized 2.00 mmol of acidic protons, and 1.00 mmol are left. The flask is still yellow.';
const LACTIC_AT =
  '15.0 mL added: 3.00 mmol of OH⁻ have neutralized all 3.00 mmol of acidic protons. This is the equivalence point. The indicator has turned blue: that is the endpoint.';
const TARTARIC_AT =
  '30.0 mL added: 6.00 mmol of OH⁻ have neutralized all 6.00 mmol of acidic protons. This is the equivalence point. The indicator has turned blue: that is the endpoint.';
const TARTARIC_15 =
  '15.0 mL of base added: 3.00 mmol of OH⁻ have neutralized 3.00 mmol of acidic protons, and 3.00 mmol are left. The flask is still yellow.';
const LACTIC_40 = '40.0 mL added: every acidic proton is gone, and 5.00 mmol of OH⁻ is in excess. The flask is blue.';
const TARTARIC_40 = '40.0 mL added: every acidic proton is gone, and 2.00 mmol of OH⁻ is in excess. The flask is blue.';

type AcidKey = 'lactic' | 'tartaric';
const RADIO: Record<AcidKey, string> = {
  lactic: 'Lactic acid (gives up one proton)',
  tartaric: 'Tartaric acid (gives up two)',
};
/** The graph's lines as end points, [volume in mL, amount in mmol], written out for each acid. */
const LINES: Record<AcidKey, { protons: [number, number][]; excess: [number, number][]; equivalence: number }> = {
  lactic: {
    protons: [[0, 3], [15, 0], [40, 0]],
    excess: [[0, 0], [15, 0], [40, 5]],
    equivalence: 15,
  },
  tartaric: {
    protons: [[0, 6], [30, 0], [40, 0]],
    excess: [[0, 0], [30, 0], [40, 2]],
    equivalence: 30,
  },
};

const flaskPanel = (diagram: Locator) => diagram.locator('[data-panel="flask"]');
const graph = (diagram: Locator) => diagram.locator('[data-panel="graph"]');
const flaskLabel = (diagram: Locator) => flaskPanel(diagram).locator('[data-flask-label]');
const liquid = (diagram: Locator) => flaskPanel(diagram).locator('[data-liquid]');
const status = (diagram: Locator) => diagram.getByRole('status');
const slider = (diagram: Locator) => diagram.getByRole('slider', { name: 'Base added', exact: true });
const acidGroup = (diagram: Locator) => diagram.getByRole('group', { name: 'Acid in the flask' });
const acidRadio = (diagram: Locator, acid: AcidKey) => acidGroup(diagram).getByRole('radio', { name: RADIO[acid] });

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
  if (points.length < 3) throw new Error(`Not a line of three points: ${d}`);
  return points;
}

/** Where the graph's axes put a volume in mL (ticks at 0 and 40) and an amount in mmol (ticks at 0 and 6). */
async function axes(diagram: Locator) {
  const x0 = await numberOf(graph(diagram).locator('[data-tick-x="0"]'), 'x1');
  const x40 = await numberOf(graph(diagram).locator('[data-tick-x="40"]'), 'x1');
  const y0 = await numberOf(graph(diagram).locator('[data-tick-y="0"]'), 'y1');
  const y6 = await numberOf(graph(diagram).locator('[data-tick-y="6"]'), 'y1');
  return {
    x: (volume: number) => x0 + (volume / 40) * (x40 - x0),
    y: (millimoles: number) => y0 + (millimoles / 6) * (y6 - y0),
  };
}

// Each drawn position is rounded to a tenth of a unit, and so is each tick.
const TOLERANCE = 0.3;
function expectNear(actual: number, expected: number, what: string) {
  expect(Math.abs(actual - expected), `${what}: ${actual} is not within ${TOLERANCE} of ${expected}`).toBeLessThanOrEqual(TOLERANCE);
}

async function expectLinesFor(diagram: Locator, acid: AcidKey) {
  const { x, y } = await axes(diagram);
  const expected = LINES[acid];
  for (const kind of ['protons', 'excess'] as const) {
    const drawn = await pointsOf(graph(diagram).locator(`[data-line="${kind}"]`));
    const want = expected[kind];
    expect(drawn, `${acid} ${kind}: points drawn`).toHaveLength(want.length);
    want.forEach(([volume, millimoles], i) => {
      const point = drawn[i];
      if (!point) throw new Error('A point is missing.');
      expectNear(point.x, x(volume), `${acid} ${kind} point ${i} x`);
      expectNear(point.y, y(millimoles), `${acid} ${kind} point ${i} y`);
    });
  }
  expectNear(await numberOf(graph(diagram).locator('[data-equivalence]'), 'x1'), x(expected.equivalence), `${acid} equivalence line`);
}

async function expectMarkerAt(diagram: Locator, volume: number, protons: number, excess: number) {
  const { x, y } = await axes(diagram);
  const chosen = graph(diagram).locator('[data-chosen]');
  expectNear(await numberOf(chosen, 'x1'), x(volume), `the marker line at ${volume} mL`);
  const dotProtons = graph(diagram).locator('[data-dot="protons"]');
  const dotExcess = graph(diagram).locator('[data-dot="excess"]');
  expectNear(await numberOf(dotProtons, 'cx'), x(volume), `protons dot x at ${volume} mL`);
  expectNear(await numberOf(dotExcess, 'cx'), x(volume), `excess dot x at ${volume} mL`);
  expectNear(await numberOf(dotProtons, 'cy'), y(protons), `protons dot y at ${volume} mL`);
  expectNear(await numberOf(dotExcess, 'cy'), y(excess), `excess dot y at ${volume} mL`);
}

async function pressTimes(page: import('@playwright/test').Page, key: string, times: number) {
  for (let i = 0; i < times; i++) await page.keyboard.press(key);
}

test('the diagram starts with lactic acid and 10.0 mL of base, its readout, flask and graph', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await expect(status(diagram)).toHaveText(START_READOUT);
  await expect(acidRadio(diagram, 'lactic')).toBeChecked();
  await expect(acidRadio(diagram, 'tartaric')).not.toBeChecked();
  await expect(slider(diagram)).toHaveAttribute('aria-valuetext', '10.0 mL');
  await expect(slider(diagram)).toHaveAttribute('min', '0');
  await expect(slider(diagram)).toHaveAttribute('max', '40');
  await expect(slider(diagram)).toHaveAttribute('step', '0.5');
  await expect(flaskLabel(diagram)).toHaveText('yellow');
  await expect(graph(diagram).locator('[data-axis-label="y"]')).toHaveText('amount (mmol)');
  await expect(graph(diagram).locator('[data-axis-label="x"]')).toHaveText('base added (mL)');
});

test('the acid control is two radio buttons in a group named Acid in the flask', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await expect(acidGroup(diagram).getByRole('radio')).toHaveCount(2);
  await expect(acidRadio(diagram, 'lactic')).toBeVisible();
  await expect(acidRadio(diagram, 'tartaric')).toBeVisible();
});

test('moving the slider to 15.0 mL from the keyboard gives the equivalence point readout and a flask labeled blue', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await slider(diagram).focus();
  await pressTimes(page, 'ArrowRight', 10);

  await expect(slider(diagram)).toHaveAttribute('aria-valuetext', '15.0 mL');
  await expect(status(diagram)).toHaveText(LACTIC_AT);
  await expect(flaskLabel(diagram)).toHaveText('blue');
});

test('at 14.5 mL the flask is labeled yellow, half a mL before the equivalence point', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await slider(diagram).focus();
  await pressTimes(page, 'ArrowRight', 9);

  await expect(slider(diagram)).toHaveAttribute('aria-valuetext', '14.5 mL');
  await expect(flaskLabel(diagram)).toHaveText('yellow');
  await expect(status(diagram)).toHaveText(
    '14.5 mL of base added: 2.90 mmol of OH⁻ have neutralized 2.90 mmol of acidic protons, and 0.10 mmol are left. The flask is still yellow.',
  );
});

test('the liquid in the flask changes its shading with its label', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  const fill = () => liquid(diagram).evaluate((element) => getComputedStyle(element).fill);

  const yellow = await fill();
  await slider(diagram).fill('15');
  await expect(flaskLabel(diagram)).toHaveText('blue');
  const blue = await fill();

  expect(blue, 'the liquid keeps one shading for both colors').not.toBe(yellow);
});

test('tartaric acid at 15.0 mL is still yellow with 3.00 mmol left, and reaches its equivalence point at 30.0 mL', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await acidRadio(diagram, 'tartaric').check();
  await slider(diagram).fill('15');
  await expect(status(diagram)).toHaveText(TARTARIC_15);
  await expect(flaskLabel(diagram)).toHaveText('yellow');

  await slider(diagram).fill('30');
  await expect(status(diagram)).toHaveText(TARTARIC_AT);
  await expect(flaskLabel(diagram)).toHaveText('blue');
});

test('with no base added, the readout says how many acidic protons there are to neutralize', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await slider(diagram).focus();
  await page.keyboard.press('Home');
  await expect(status(diagram)).toHaveText('No base added yet: 3.00 mmol of acidic protons to neutralize. The flask is yellow.');

  await acidRadio(diagram, 'tartaric').check();
  await expect(status(diagram)).toHaveText(
    'No base added yet: 6.00 mmol of acidic protons to neutralize, two from each molecule of acid. The flask is yellow.',
  );
});

test('at 40.0 mL lactic acid shows 5.00 mmol of OH⁻ in excess and tartaric acid 2.00 mmol', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await slider(diagram).focus();
  await page.keyboard.press('End');
  await expect(slider(diagram)).toHaveAttribute('aria-valuetext', '40.0 mL');
  await expect(status(diagram)).toHaveText(LACTIC_40);

  await acidRadio(diagram, 'tartaric').check();
  await expect(status(diagram)).toHaveText(TARTARIC_40);
});

test('both axes are labeled with their units and ticked from 0 to 6 mmol and 0 to 40 mL', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  const ticksY = graph(diagram).locator('[data-tick-y]');
  await expect(ticksY).toHaveCount(7);
  expect(await ticksY.evaluateAll((lines) => lines.map((line) => line.getAttribute('data-tick-y')))).toEqual(['0', '1', '2', '3', '4', '5', '6']);
  const ticksX = graph(diagram).locator('[data-tick-x]');
  await expect(ticksX).toHaveCount(5);
  expect(await ticksX.evaluateAll((lines) => lines.map((line) => line.getAttribute('data-tick-x')))).toEqual(['0', '10', '20', '30', '40']);
});

for (const acid of ['lactic', 'tartaric'] as const) {
  test(`the ${acid} acid lines are drawn from the model, with the equivalence line where they meet`, async ({ page }) => {
    const diagram = await openDiagram(page, PAGE, NAME);
    await acidRadio(diagram, acid).check();
    await expect(acidRadio(diagram, acid)).toBeChecked();

    await expectLinesFor(diagram, acid);
  });
}

test('the two lines differ by dash pattern as well as color, and the equivalence line differs from both', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  const dash = (selector: string) => graph(diagram).locator(selector).evaluate((element) => getComputedStyle(element).strokeDasharray);

  const protons = await dash('[data-line="protons"]');
  const excess = await dash('[data-line="excess"]');
  const equivalence = await dash('[data-equivalence]');

  expect(protons, 'the protons line is solid').toBe('none');
  expect(excess, 'the excess line is dashed').not.toBe('none');
  expect(equivalence, 'the equivalence line is dotted').not.toBe('none');
  expect(equivalence, 'dotted differs from dashed').not.toBe(excess);
});

test('the marker sits on both lines at the chosen volume, for each acid', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  // [volume in mL, protons left in mmol, OH⁻ in excess in mmol], written out.
  const cases: Record<AcidKey, [number, number, number][]> = {
    lactic: [[0, 3, 0], [10, 1, 0], [14.5, 0.1, 0], [15, 0, 0], [15.5, 0, 0.1], [22, 0, 1.4], [40, 0, 5]],
    tartaric: [[0, 6, 0], [15, 3, 0], [29.5, 0.1, 0], [30, 0, 0], [36, 0, 1.2], [40, 0, 2]],
  };
  let checked = 0;

  for (const acid of ['lactic', 'tartaric'] as const) {
    await acidRadio(diagram, acid).check();
    for (const [volume, protons, excess] of cases[acid]) {
      await slider(diagram).fill(String(volume));
      await expect(slider(diagram)).toHaveAttribute('aria-valuetext', `${volume.toFixed(1)} mL`);
      await expectMarkerAt(diagram, volume, protons, excess);
      checked += 1;
    }
  }
  expect(checked).toBe(13);
});

test('each line is named on the line, and the equivalence line is labeled', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await expect(graph(diagram).locator('[data-line-name="protons"]')).toHaveText('acidic protons left');
  await expect(graph(diagram).locator('[data-line-name="excess"]')).toHaveText('OH⁻ in excess');
  await expect(graph(diagram).locator('[data-equivalence-label]')).toHaveText('equivalence point');
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

for (const acid of ['lactic', 'tartaric'] as const) {
  test(`with ${acid} acid no label is cut off or touches a line, the equivalence line or another label`, async ({ page }) => {
    const diagram = await openDiagram(page, PAGE, NAME);
    await page.evaluate(() => document.fonts.ready);
    await acidRadio(diagram, acid).check();
    await expect(acidRadio(diagram, acid)).toBeChecked();

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

    const labels = [
      await labelBox(graph(diagram).locator('[data-line-name="protons"]'), 'acidic protons left'),
      await labelBox(graph(diagram).locator('[data-line-name="excess"]'), 'OH⁻ in excess'),
      await labelBox(graph(diagram).locator('[data-equivalence-label]'), 'equivalence point'),
    ];
    const drawn = [
      ...finePoints(await pointsOf(graph(diagram).locator('[data-line="protons"]'))),
      ...finePoints(await pointsOf(graph(diagram).locator('[data-line="excess"]'))),
    ];
    const equivalenceX = await numberOf(graph(diagram).locator('[data-equivalence]'), 'x1');
    for (const box of labels) {
      expect(drawn.filter((p) => near(box, p, CLEARANCE)), `"${box.name}" touches a line`).toEqual([]);
      if (box.name !== 'equivalence point') {
        expect(box.left - CLEARANCE > equivalenceX || box.right + CLEARANCE < equivalenceX, `"${box.name}" touches the equivalence line`).toBe(true);
      }
    }
    const [one, two, three] = labels;
    if (!one || !two || !three) throw new Error('A label is missing.');
    expect(apart(one, two), 'the two line names overlap').toBe(true);
    expect(apart(one, three), '"acidic protons left" and "equivalence point" overlap').toBe(true);
    expect(apart(two, three), '"OH⁻ in excess" and "equivalence point" overlap').toBe(true);
  });
}

test("each drawing's name says what is drawn now", async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await expect(flaskPanel(diagram).getByRole('img')).toHaveAccessibleName(
    'A flask of lactic acid solution under the tip of a buret. The liquid is yellow. 10.0 mL of base has been added.',
  );
  await expect(graph(diagram).getByRole('img')).toHaveAccessibleName(/^Graph of amount in millimoles against volume of base added, from 0 to 40 mL\./);
  await expect(graph(diagram).getByRole('img')).toHaveAccessibleName(/A marker at 10\.0 mL shows 1\.00 mmol of acidic protons left and 0\.00 mmol of OH⁻ in excess\.$/);

  await acidRadio(diagram, 'tartaric').check();
  await slider(diagram).fill('36');
  await expect(flaskPanel(diagram).getByRole('img')).toHaveAccessibleName(
    'A flask of tartaric acid solution under the tip of a buret. The liquid is blue. 36.0 mL of base has been added.',
  );
  await expect(graph(diagram).getByRole('img')).toHaveAccessibleName(/A marker at 36\.0 mL shows 0\.00 mmol of acidic protons left and 1\.20 mmol of OH⁻ in excess\.$/);
});

// A nominal size, not a rendered one: the font size in drawing units, times 320, over the
// drawing's width in units. That is the size of the text when the drawing is shown 320 px
// wide, the ratio of the site's figures (18 on 480).
test("each drawing's text is 12 px or more when the drawing itself is shown 320 px wide", async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  for (const panel of [flaskPanel(diagram), graph(diagram)]) {
    const sizes = await panel.locator('svg').evaluate((svg) => {
      if (!(svg instanceof SVGSVGElement)) throw new Error('The drawing is not an SVG.');
      const unitsWide = svg.viewBox.baseVal.width;
      return [...svg.querySelectorAll('text, tspan')].map((text) => ({
        text: text.textContent,
        pxAt320: (Number.parseFloat(getComputedStyle(text).fontSize) * 320) / unitsWide,
      }));
    });
    expect(sizes.length).toBeGreaterThanOrEqual(2);
    for (const size of sizes) expect(size.pxAt320, `"${size.text}"`).toBeGreaterThanOrEqual(12);
  }
});

// The text as drawn on the screen: its size in drawing units, scaled by how wide the drawing is shown.
for (const width of [1280, 412]) {
  test(`on a ${width} px screen the drawn text is 12 px or larger`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const diagram = await openDiagram(page, PAGE, NAME);
    await page.evaluate(() => document.fonts.ready);

    let total = 0;
    for (const panel of [flaskPanel(diagram), graph(diagram)]) {
      const sizes = await panel.locator('svg').evaluate((svg) => {
        if (!(svg instanceof SVGSVGElement)) throw new Error('The drawing is not an SVG.');
        const scale = svg.getBoundingClientRect().width / svg.viewBox.baseVal.width;
        return [...svg.querySelectorAll('text, tspan')].map((text) => ({
          text: text.textContent,
          px: Number.parseFloat(getComputedStyle(text).fontSize) * scale,
        }));
      });
      total += sizes.length;
      for (const size of sizes) expect(size.px, `"${size.text}"`).toBeGreaterThanOrEqual(12);
    }
    expect(total).toBeGreaterThanOrEqual(12);
  });
}

// Side by side only where both drawings keep text of 12 px or more: the graph is drawn
// 320 units wide, so it needs about 320 px of its own.
for (const { width, sideBySide } of [
  { width: 1280, sideBySide: true },
  { width: 412, sideBySide: false },
  { width: 320, sideBySide: false },
]) {
  test(`at ${width} px the flask and the graph are ${sideBySide ? 'side by side' : 'one above the other'}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const diagram = await openDiagram(page, PAGE, NAME);

    const flask = await flaskPanel(diagram).boundingBox();
    const plot = await graph(diagram).boundingBox();
    if (!flask || !plot) throw new Error('A part has no bounding box.');
    if (sideBySide) {
      expect(plot.x, 'the graph is right of the flask').toBeGreaterThanOrEqual(flask.x + flask.width);
      expect(Math.abs(flask.y + flask.height / 2 - (plot.y + plot.height / 2)), 'the two are centered on each other').toBeLessThanOrEqual(2);
    } else {
      expect(plot.y, 'the graph is below the flask').toBeGreaterThanOrEqual(flask.y + flask.height);
    }
  });
}

test('the graph is no wider than 22rem and the readout is under both drawings', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  const diagram = await openDiagram(page, PAGE, NAME);

  const plot = await graph(diagram).boundingBox();
  const flask = await flaskPanel(diagram).boundingBox();
  const readout = await status(diagram).boundingBox();
  if (!plot || !flask || !readout) throw new Error('A part has no bounding box.');
  expect(plot.width).toBeLessThanOrEqual(22 * 16 + 1);
  expect(readout.y).toBeGreaterThanOrEqual(Math.max(plot.y + plot.height, flask.y + flask.height));
});

for (const width of [1280, 412, 390, 360, 320]) {
  test(`on a ${width} px screen nothing scrolls sideways and the controls stay inside the diagram`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    const diagram = await openDiagram(page, PAGE, NAME);
    // The longest readout: tartaric acid's equivalence point.
    await acidRadio(diagram, 'tartaric').check();
    await slider(diagram).fill('30');
    await expect(status(diagram)).toHaveText(TARTARIC_AT);
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
  test(`the diagram has no accessibility violations in the ${theme} theme, at the start and with tartaric acid past its equivalence point`, async ({
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
    await acidRadio(diagram, 'tartaric').check();
    await slider(diagram).fill('36');
    await expect(flaskLabel(diagram)).toHaveText('blue');
    await expect(status(diagram)).toHaveText(
      '36.0 mL added: every acidic proton is gone, and 1.20 mmol of OH⁻ is in excess. The flask is blue.',
    );

    expect(await violations(), 'tartaric acid at 36.0 mL').toEqual([]);
  });
}

test('in print the controls are hidden and the flask, the graph and the readout stay', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  await page.emulateMedia({ media: 'print' });

  await expect(diagram.locator('.diagram-controls')).toBeHidden();
  await expect(flaskPanel(diagram).getByRole('img')).toBeVisible();
  await expect(graph(diagram).getByRole('img')).toBeVisible();
  await expect(status(diagram)).toHaveText(START_READOUT);
});

test('the caption under the diagram names the volumes, the concentrations and the indicator', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  const caption = page.locator('[data-part="diagram"]', { has: diagram }).locator('> figcaption');

  await expect(caption).toHaveText(
    '20.0 mL of 0.150 M acid, titrated with 0.200 M sodium hydroxide. The indicator, bromothymol blue, shades from yellow toward green over the last few drops and is blue at the equivalence point.',
  );
});

test.describe('with JavaScript off', () => {
  test.use({ javaScriptEnabled: false });

  test('the flask, the graph and the starting readout show, with no controls', async ({ page }) => {
    await expectStaticDiagram(page, PAGE, NAME, START_READOUT);

    const diagram = page.locator(`[data-diagram="${NAME}"]`);
    await expect(flaskPanel(diagram).getByRole('img')).toBeVisible();
    await expect(graph(diagram).getByRole('img')).toBeVisible();
    await expect(flaskLabel(diagram)).toHaveText('yellow');
    await expectLinesFor(diagram, 'lactic');
    await expectMarkerAt(diagram, 10, 1, 0);
  });
});
