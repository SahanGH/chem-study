import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator } from '@playwright/test';
import { expectStaticDiagram, openDiagram } from './diagram';

const PAGE = '/unit-7-equilibrium/7-10-reaction-quotient-and-le-chateliers-principle/';
const NAME = 'equilibrium-shift';

// Every value below is written out from lesson 7.10's numbers (exact
// fractions), apart from the module under test. A table row is the quantity
// and its values Before, Just after and at the New equilibrium.
const CASES = [
  {
    radio: 'Add NO₂',
    mark: 'NO₂ added',
    // [N₂O₄] and [NO₂] in M: before, just after, new equilibrium.
    n2o4: [0.0625, 0.0625, 0.09],
    no2: [0.175, 0.265, 0.21],
    readout:
      'Adding NO₂ raises Q from 0.490 to 1.12. Q is now greater than K (0.490), so the reaction runs toward N₂O₄ until Q equals K again. New equilibrium: [N₂O₄] = 0.0900 M and [NO₂] = 0.210 M.',
    table: [
      ['[N₂O₄]', '0.0625', '0.0625', '0.0900'],
      ['[NO₂]', '0.175', '0.265', '0.210'],
      ['Q', '0.490', '1.12', '0.490'],
      ['K', '0.490', '0.490', '0.490'],
      ['Compare', 'Q = K', 'Q > K', 'Q = K'],
    ],
  },
  {
    radio: 'Add N₂O₄',
    mark: 'N₂O₄ added',
    n2o4: [0.0625, 0.1075, 0.09],
    no2: [0.175, 0.175, 0.21],
    readout:
      'Adding N₂O₄ lowers Q from 0.490 to 0.285. Q is now less than K (0.490), so the reaction runs toward NO₂ until Q equals K again. New equilibrium: [N₂O₄] = 0.0900 M and [NO₂] = 0.210 M.',
    table: [
      ['[N₂O₄]', '0.0625', '0.1075', '0.0900'],
      ['[NO₂]', '0.175', '0.175', '0.210'],
      ['Q', '0.490', '0.285', '0.490'],
      ['K', '0.490', '0.490', '0.490'],
      ['Compare', 'Q = K', 'Q < K', 'Q = K'],
    ],
  },
  {
    radio: 'Halve the volume',
    mark: 'volume halved',
    n2o4: [0.0625, 0.125, 0.16],
    no2: [0.175, 0.35, 0.28],
    readout:
      'Halving the volume doubles both concentrations, which raises Q from 0.490 to 0.980. Q is now greater than K (0.490), so the reaction runs toward N₂O₄ until Q equals K again. New equilibrium: [N₂O₄] = 0.160 M and [NO₂] = 0.280 M.',
    table: [
      ['[N₂O₄]', '0.0625', '0.125', '0.160'],
      ['[NO₂]', '0.175', '0.350', '0.280'],
      ['Q', '0.490', '0.980', '0.490'],
      ['K', '0.490', '0.490', '0.490'],
      ['Compare', 'Q = K', 'Q > K', 'Q = K'],
    ],
  },
  {
    radio: 'Double the volume',
    mark: 'volume doubled',
    n2o4: [0.0625, 0.03125, 0.0225],
    no2: [0.175, 0.0875, 0.105],
    readout:
      'Doubling the volume halves both concentrations, which lowers Q from 0.490 to 0.245. Q is now less than K (0.490), so the reaction runs toward NO₂ until Q equals K again. New equilibrium: [N₂O₄] = 0.0225 M and [NO₂] = 0.105 M.',
    table: [
      ['[N₂O₄]', '0.0625', '0.03125', '0.0225'],
      ['[NO₂]', '0.175', '0.0875', '0.105'],
      ['Q', '0.490', '0.245', '0.490'],
      ['K', '0.490', '0.490', '0.490'],
      ['Compare', 'Q = K', 'Q < K', 'Q = K'],
    ],
  },
  {
    radio: 'Warm the mixture',
    mark: 'warmed',
    n2o4: [0.0625, 0.0625, 0.048],
    no2: [0.175, 0.175, 0.204],
    readout:
      'Warming the mixture changes K, from 0.490 to 0.867. Q is still 0.490, now less than K, so the reaction runs toward NO₂ until Q equals the new K. New equilibrium: [N₂O₄] = 0.0480 M and [NO₂] = 0.204 M.',
    table: [
      ['[N₂O₄]', '0.0625', '0.0625', '0.0480'],
      ['[NO₂]', '0.175', '0.175', '0.204'],
      ['Q', '0.490', '0.490', '0.867'],
      ['K', '0.490', '0.867', '0.867'],
      ['Compare', 'Q = K', 'Q < K', 'Q = K'],
    ],
  },
] as const;

const START_CASE = CASES[0];
const WARM_CASE = CASES[4];
const AXIS_MAX = 0.4;
const DISTURBANCE_TIME = 2;
const TIME_MAX = 8;

const GRAPH_NAME_START =
  'Graph of concentration against time for N₂O₄(g) ⇌ 2 NO₂(g). [N₂O₄] is a solid line and [NO₂] a dashed line. ' +
  'Before the disturbance, [N₂O₄] is 0.0625 M and [NO₂] is 0.175 M. ' +
  'The dotted line marks the disturbance (NO₂ added). Just after it, [N₂O₄] is 0.0625 M and [NO₂] is 0.265 M. ' +
  'At the new equilibrium, [N₂O₄] is 0.0900 M and [NO₂] is 0.210 M.';

const NUMBER = String.raw`(-?\d+(?:\.\d+)?)`;
const POINT = new RegExp(`[ML]${NUMBER} ${NUMBER}`, 'g');

interface Point {
  x: number;
  y: number;
}

const graph = (diagram: Locator) => diagram.locator('[data-panel="concentrations"]');
const status = (diagram: Locator) => diagram.getByRole('status');
const group = (diagram: Locator) => diagram.getByRole('group', { name: 'Disturbance' });
const radio = (diagram: Locator, name: string) => group(diagram).getByRole('radio', { name });
const table = (diagram: Locator) => diagram.getByRole('table');
const curve = (diagram: Locator, which: 'n2o4' | 'no2') => graph(diagram).locator(`[data-curve="${which}"]`);
const curveName = (diagram: Locator, which: 'n2o4' | 'no2') => graph(diagram).locator(`[data-curve-name="${which}"]`);
const dottedLine = (diagram: Locator) => graph(diagram).locator('[data-disturbance]');
const markLabel = (diagram: Locator) => graph(diagram).locator('[data-disturbance-label]');

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

/** Where the vertical axis puts a concentration in M, read from its ticks at 0 M and 0.4 M. */
async function yOfConcentration(diagram: Locator, value: number): Promise<number> {
  const bottom = await numberOf(graph(diagram).locator('[data-tick-y="0"]'), 'y1');
  const top = await numberOf(graph(diagram).locator(`[data-tick-y="${AXIS_MAX}"]`), 'y1');
  return bottom + (value / AXIS_MAX) * (top - bottom);
}

// Each drawn position is rounded to a tenth of a unit, and so is each tick.
const TOLERANCE = 0.25;

function expectNear(actual: number, expected: number, what: string) {
  expect(Math.abs(actual - expected), `${what}: ${actual} is not within ${TOLERANCE} of ${expected}`).toBeLessThanOrEqual(TOLERANCE);
}

/** Every row of the table as the student reads it: the row header, then its three cells. */
async function tableText(diagram: Locator): Promise<string[][]> {
  return diagram
    .locator('tbody tr')
    .evaluateAll((rows) => rows.map((row) => [...row.querySelectorAll('th, td')].map((cell) => (cell.textContent ?? '').trim())));
}

async function expectCase(diagram: Locator, expected: (typeof CASES)[number]) {
  await expect(radio(diagram, expected.radio)).toBeChecked();
  await expect(status(diagram)).toHaveText(expected.readout);
  expect(await tableText(diagram), expected.radio).toEqual(expected.table);
  await expect(markLabel(diagram)).toHaveText(expected.mark);
}

test('the diagram starts with adding NO₂, its readout and its table', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await expectCase(diagram, START_CASE);
  await expect(graph(diagram).locator('figcaption')).toHaveText('Concentrations');
  await expect(graph(diagram).locator('[data-axis-label="y"]')).toHaveText('concentration (M)');
  await expect(graph(diagram).locator('[data-axis-label="x"]')).toHaveText('time');
});

test('the control is five radio buttons in a group named Disturbance', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await expect(group(diagram).getByRole('radio')).toHaveCount(5);
  for (const { radio: name } of CASES) await expect(radio(diagram, name)).toBeVisible();
});

test('the table has a caption, column headers and row headers', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await expect(table(diagram)).toHaveAccessibleName('Before and after the disturbance. Concentrations in M.');
  for (const name of ['Before', 'Just after', 'New equilibrium']) {
    await expect(table(diagram).getByRole('columnheader', { name })).toBeVisible();
  }
  for (const name of ['[N₂O₄]', '[NO₂]', 'Q', 'K', 'Compare']) {
    await expect(table(diagram).getByRole('rowheader', { name, exact: true })).toBeVisible();
  }
  await expect(table(diagram).getByRole('row')).toHaveCount(6);
});

test('choosing each disturbance from the keyboard changes the readout, the table and the graph', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  await group(diagram).getByRole('radio', { checked: true }).focus();
  const pathBefore = await curve(diagram, 'no2').getAttribute('d');

  for (const expected of CASES.slice(1)) {
    await page.keyboard.press('ArrowDown');

    await expectCase(diagram, expected);
  }
  await expect(radio(diagram, 'Warm the mixture')).toBeFocused();
  expect(await curve(diagram, 'no2').getAttribute('d')).not.toBe(pathBefore);
  await page.keyboard.press('ArrowUp');
  await expectCase(diagram, CASES[3]);
});

test('warming changes the K row to 0.867 in the last two columns and leaves the concentrations just after at 0.0625 and 0.175', async ({
  page,
}) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await radio(diagram, 'Warm the mixture').check();
  await expect(status(diagram)).toHaveText(WARM_CASE.readout);

  const rows = await tableText(diagram);
  expect(rows[3]).toEqual(['K', '0.490', '0.867', '0.867']);
  expect(rows[0]?.[2]).toBe('0.0625');
  expect(rows[1]?.[2]).toBe('0.175');
});

test('the curves are drawn from the model: flat, a vertical step at the dotted line, then a settle on the new equilibrium', async ({
  page,
}) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  for (const expected of CASES) {
    await radio(diagram, expected.radio).check();
    await expect(status(diagram)).toHaveText(expected.readout);
    const lineX = await numberOf(dottedLine(diagram), 'x1');
    for (const [which, values] of [
      ['n2o4', expected.n2o4],
      ['no2', expected.no2],
    ] as const) {
      const points = await pointsOf(curve(diagram, which));
      const label = `${expected.radio}, ${which}`;
      const [before, after, fresh] = values;

      const first = points[0];
      const last = points.at(-1);
      if (!first || !last) throw new Error('A curve has no points.');
      expectNear(first.y, await yOfConcentration(diagram, before), `${label} at time 0`);
      expectNear(last.y, await yOfConcentration(diagram, fresh), `${label} at the end`);
      // The step: two points above the dotted line, the first at the starting value and the second just after.
      const onLine = points.filter((p) => Math.abs(p.x - lineX) < 0.01);
      expect(onLine, `${label}: two points on the dotted line`).toHaveLength(2);
      expectNear(onLine[0]?.y ?? Number.NaN, await yOfConcentration(diagram, before), `${label} before the step`);
      expectNear(onLine[1]?.y ?? Number.NaN, await yOfConcentration(diagram, after), `${label} after the step`);
      // Flat before the line.
      const left = points.filter((p) => p.x < lineX - 0.01);
      for (const p of left) expectNear(p.y, first.y, `${label} before the line`);
      // The line stands at 2 on the axis that runs from 0 to 8.
      expectNear(lineX, first.x + (DISTURBANCE_TIME / TIME_MAX) * (last.x - first.x), 'the dotted line');
    }
  }
});

test('the two curves differ by dash pattern as well as color, and the dotted line is told apart from both', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await expect(curve(diagram, 'n2o4')).toHaveCSS('stroke-dasharray', 'none');
  await expect(curve(diagram, 'no2')).not.toHaveCSS('stroke-dasharray', 'none');
  await expect(dottedLine(diagram)).not.toHaveCSS('stroke-dasharray', 'none');
  const dashes = async (locator: Locator) => locator.evaluate((element) => getComputedStyle(element).strokeDasharray);
  expect(await dashes(dottedLine(diagram))).not.toBe(await dashes(curve(diagram, 'no2')));
});

test('each curve is named on the curve', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await expect(curveName(diagram, 'n2o4')).toHaveText('[N₂O₄]');
  await expect(curveName(diagram, 'no2')).toHaveText('[NO₂]');
});

interface Box {
  name: string;
  left: number;
  right: number;
  top: number;
  bottom: number;
}

/** The box of a label, in drawing units. The labels are not rotated. */
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
const near = (box: Box, p: Point, margin: number) =>
  p.x >= box.left - margin && p.x <= box.right + margin && p.y >= box.top - margin && p.y <= box.bottom + margin;
const apart = (one: Box, two: Box) =>
  one.bottom <= two.top || two.bottom <= one.top || one.right <= two.left || two.right <= one.left;

test('in each of the five states no label is cut off or touches a curve, the dotted line or another label', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  // The labels are measured, so the web fonts must have loaded.
  await page.evaluate(() => document.fonts.ready);

  for (const expected of CASES) {
    const state = expected.radio;
    await radio(diagram, state).check();
    // Measure only once the page shows the new state, as expectCase does.
    await expect(status(diagram)).toHaveText(expected.readout);
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
    expect(cutOff, `${state}: text outside the drawing`).toEqual([]);

    const labels = [
      await labelBox(curveName(diagram, 'n2o4')),
      await labelBox(curveName(diagram, 'no2')),
      await labelBox(markLabel(diagram)),
    ];
    const drawn = [...finePoints(await pointsOf(curve(diagram, 'n2o4'))), ...finePoints(await pointsOf(curve(diagram, 'no2')))];
    const lineX = await numberOf(dottedLine(diagram), 'x1');
    for (const box of labels) {
      expect(drawn.filter((p) => near(box, p, CLEARANCE)), `${state}: "${box.name}" touches a curve`).toEqual([]);
      expect(
        box.left - CLEARANCE > lineX || box.right + CLEARANCE < lineX,
        `${state}: "${box.name}" touches the dotted line`,
      ).toBe(true);
    }
    const [one, two, three] = labels;
    if (!one || !two || !three) throw new Error('A label is missing.');
    expect(apart(one, two), `${state}: "${one.name}" and "${two.name}" overlap`).toBe(true);
    expect(apart(one, three), `${state}: "${one.name}" and "${three.name}" overlap`).toBe(true);
    expect(apart(two, three), `${state}: "${two.name}" and "${three.name}" overlap`).toBe(true);
  }
});

// A nominal size, not a rendered one: the font size in drawing units, times
// 320, over the drawing's width in units. That is the size of the text when
// the drawing itself is shown 320 px wide, the ratio of the site's figures
// (18 on 480). On a narrow phone the drawing is narrower than 320 px, and its
// text is smaller in proportion.
test("the drawing's text is 12 px or more when the drawing itself is shown 320 px wide, the ratio of the site's figures", async ({
  page,
}) => {
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

  expect(sizes.length).toBeGreaterThanOrEqual(9);
  for (const size of sizes) expect(size.pxAt320, `"${size.text}"`).toBeGreaterThanOrEqual(12);
});

// The text as it is drawn on the screen: its size in drawing units, scaled by
// how wide the drawing is shown. Each drawing is wide enough for 12 px text
// from a 412 px phone up.
for (const width of [1280, 412]) {
  test(`on a ${width} px screen the drawing's text is drawn 12 px or larger`, async ({ page }) => {
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

    expect(sizes.length).toBeGreaterThanOrEqual(9);
    for (const size of sizes) expect(size.px, `"${size.text}"`).toBeGreaterThanOrEqual(12);
  });
}

// The longest readout and the widest table cells are the doubled volume's and
// the add-N₂O₄ case's ("0.1075", "0.03125"); the doubled volume is chosen here.
for (const width of [1280, 412, 390, 360, 320]) {
  test(`on a ${width} px screen nothing scrolls sideways, the table fits and the controls stay inside the diagram`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 800 });
    const diagram = await openDiagram(page, PAGE, NAME);
    await radio(diagram, 'Double the volume').check();
    await expect(status(diagram)).toHaveText(CASES[3].readout);
    await page.evaluate(() => document.fonts.ready);
    const figure = page.locator('[data-part="diagram"]', { has: diagram });

    const measured = await figure.evaluate((element) => {
      const frame = element.getBoundingClientRect();
      const outside = [...element.querySelectorAll('svg, p, input, label, legend, figcaption, table, th, td, caption')]
        .filter((part) => {
          const box = part.getBoundingClientRect();
          return box.left < frame.left - 0.5 || box.right > frame.right + 0.5;
        })
        .map((part) => part.outerHTML.slice(0, 80));
      const grid = element.querySelector('table');
      if (!grid) throw new Error('The diagram has no table.');
      return {
        overflow: element.scrollWidth - element.clientWidth,
        pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        tableOverflow: grid.scrollWidth - grid.clientWidth,
        tableDisplay: getComputedStyle(grid).display,
        outside,
        left: frame.left,
        right: frame.right,
      };
    });

    expect(measured.tableDisplay, 'the table is a table, not a box that scrolls').toBe('table');
    expect(measured.tableOverflow, 'sideways scrolling inside the table').toBeLessThanOrEqual(0);
    expect(measured.overflow, 'sideways scrolling inside the diagram').toBeLessThanOrEqual(0);
    expect(measured.pageOverflow, 'sideways scrolling of the page').toBeLessThanOrEqual(0);
    expect(measured.outside, 'parts sticking out of the diagram').toEqual([]);
    expect(measured.left).toBeGreaterThanOrEqual(0);
    expect(measured.right).toBeLessThanOrEqual(width);
  });
}

test('the table is under the graph, and the readout under the table', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  const boxes = await Promise.all([graph(diagram), table(diagram), status(diagram)].map((part) => part.boundingBox()));
  const [graphBox, tableBox, statusBox] = boxes;
  if (!graphBox || !tableBox || !statusBox) throw new Error('A part of the diagram has no box.');

  expect(tableBox.y).toBeGreaterThanOrEqual(graphBox.y + graphBox.height);
  expect(statusBox.y).toBeGreaterThanOrEqual(tableBox.y + tableBox.height);
});

test("the drawing's name says what is drawn now", async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  const drawing = graph(diagram).getByRole('img');

  await expect(drawing).toHaveAccessibleName(GRAPH_NAME_START);
  await radio(diagram, 'Warm the mixture').check();

  await expect(drawing).toHaveAccessibleName(/\(warmed\)\. Just after it, \[N₂O₄\] is 0\.0625 M and \[NO₂\] is 0\.175 M\. At the new equilibrium, \[N₂O₄\] is 0\.0480 M and \[NO₂\] is 0\.204 M\.$/);
});

for (const theme of ['light', 'dark'] as const) {
  test(`the diagram has no accessibility violations in the ${theme} theme, at the start and with the mixture warmed`, async ({
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
    await radio(diagram, 'Warm the mixture').check();
    await expect(status(diagram)).toHaveText(WARM_CASE.readout);

    expect(await violations(), 'warmed').toEqual([]);
  });
}

test('in print the controls are hidden and the drawing, the table and the readout stay', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  await page.emulateMedia({ media: 'print' });

  await expect(diagram.locator('.diagram-controls')).toBeHidden();
  await expect(graph(diagram).getByRole('img')).toBeVisible();
  await expect(table(diagram)).toBeVisible();
  await expect(status(diagram)).toHaveText(START_CASE.readout);
});

test.describe('with JavaScript off', () => {
  test.use({ javaScriptEnabled: false });

  test('the drawing, the table and the starting readout show, with no controls', async ({ page }) => {
    await expectStaticDiagram(page, PAGE, NAME, START_CASE.readout);

    const diagram = page.locator(`[data-diagram="${NAME}"]`);
    await expect(graph(diagram).getByRole('img')).toBeVisible();
    await expect(curveName(diagram, 'n2o4')).toHaveText('[N₂O₄]');
    await expect(curveName(diagram, 'no2')).toHaveText('[NO₂]');
    await expect(markLabel(diagram)).toHaveText(START_CASE.mark);
    await expect(table(diagram)).toBeVisible();
    expect(await tableText(diagram)).toEqual(START_CASE.table);
  });
});
