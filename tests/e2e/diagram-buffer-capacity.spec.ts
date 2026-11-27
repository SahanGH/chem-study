import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator, type Page } from '@playwright/test';
import {
  addedValueText,
  amountValueText,
  bars,
  describeBars,
  describeScales,
  readout,
  state as bufferCapacityState,
} from '../../src/lib/buffer-capacity';
import { expectStaticDiagram, openDiagram } from './diagram';

const PAGE = '/unit-8-acids-and-bases/8-10-buffer-capacity/';
const NAME = 'buffer-capacity';

// Every sentence and number below is written out from lesson 8.10's brief, "Diagram data" (the
// controls, the readout sentences, the descriptions and the worked states), apart from the module
// under test. Only the sweeps over many settings compare the drawing with the module.
const START_READOUT =
  "The buffer holds 100 mmol of propanoic acid and 100 mmol of propanoate ion: a ratio of base form to acid form of 1.00. Its pH is 4.87. The water's pH is 7.00. Nothing has been added yet.";
const OH_15 =
  "15 mmol of OH⁻ reacted with 15 mmol of propanoic acid and made 15 mmol of propanoate ion. The ratio of base form to acid form went from 1.00 to 1.35, and the buffer's pH from 4.87 to 5.00. The same 15 mmol took the water from pH 7.00 to 12.18.";
const H3O_15 =
  "15 mmol of H₃O⁺ reacted with 15 mmol of propanoate ion and made 15 mmol of propanoic acid. The ratio of base form to acid form went from 1.00 to 0.739, and the buffer's pH from 4.87 to 4.74. The same 15 mmol took the water from pH 7.00 to 1.82.";
const SMALL_20 =
  '20 mmol of OH⁻ reacted with all 20 mmol of the propanoic acid. The acid form is used up, so this is no longer a buffer. What is left is propanoate ion, a weak base, and the pH has jumped from 4.87 to 8.74. The same 20 mmol took the water from pH 7.00 to 12.30.';
const SMALL_25 =
  'Only 20 mmol of the 25 mmol of OH⁻ found propanoic acid to react with. The acid form is used up, and the 5 mmol of OH⁻ left over now sets the pH, which has jumped from 4.87 to 11.70. The same 25 mmol took the water from pH 7.00 to 12.40.';
const LOPSIDED_50 =
  '50 mmol of H₃O⁺ reacted with all 50 mmol of the propanoate ion. The base form is used up, so this is no longer a buffer. What is left is propanoic acid, a weak acid, and the pH has dropped from 4.39 to 2.79. The same 50 mmol took the water from pH 7.00 to 1.30.';
const ACID_HEAVY_50 =
  'Only 10 mmol of the 50 mmol of H₃O⁺ found propanoate ion to react with. The base form is used up, and the 40 mmol of H₃O⁺ left over now sets the pH, which has dropped from 3.58 to 1.40. The same 50 mmol took the water from pH 7.00 to 1.30.';
const CAPTION =
  'One liter of a buffer of propanoic acid and propanoate ion beside one liter of pure water, at 25 °C. The volume is taken as 1.00 L before and after each addition. The pH values come from the full equilibrium.';

const ADDED_STEPS = Array.from({ length: 21 }, (_, i) => -50 + 5 * i);
// The buffers of the sweeps: those the lesson walks through and the corners of the sliders.
const BUFFERS: [number, number][] = [
  [100, 100],
  [20, 20],
  [200, 200],
  [150, 50],
  [50, 150],
  [10, 200],
  [200, 10],
  [10, 10],
];

const scalesPanel = (diagram: Locator) => diagram.locator('[data-panel="scales"]');
const barsPanel = (diagram: Locator) => diagram.locator('[data-panel="bars"]');
const status = (diagram: Locator) => diagram.getByRole('status');
const addedSlider = (diagram: Locator) => diagram.getByRole('slider', { name: 'Added to both', exact: true });
const acidSlider = (diagram: Locator) => diagram.getByRole('slider', { name: 'Propanoic acid (acid form)', exact: true });
const baseSlider = (diagram: Locator) => diagram.getByRole('slider', { name: 'Propanoate ion (base form)', exact: true });
const values = (diagram: Locator) => diagram.locator('.diagram-slider-value');

async function setAdded(diagram: Locator, added: number) {
  await addedSlider(diagram).fill(String(added));
  await expect(addedSlider(diagram)).toHaveAttribute('aria-valuetext', addedValueText(added));
}

async function setBuffer(diagram: Locator, acid: number, base: number) {
  await acidSlider(diagram).fill(String(acid));
  await expect(acidSlider(diagram)).toHaveAttribute('aria-valuetext', `${acid} millimoles of propanoic acid`);
  await baseSlider(diagram).fill(String(base));
  await expect(baseSlider(diagram)).toHaveAttribute('aria-valuetext', `${base} millimoles of propanoate ion`);
}

async function setState(diagram: Locator, acid: number, base: number, added: number) {
  await setBuffer(diagram, acid, base);
  await setAdded(diagram, added);
}

async function numberOf(element: Locator, attribute: string): Promise<number> {
  const value = await element.getAttribute(attribute);
  if (value === null || value === '') throw new Error(`An element has no ${attribute} attribute.`);
  return Number(value);
}

/** Where a scale puts a pH (ticks at 0 and 14). */
async function scaleX(diagram: Locator) {
  const x0 = await numberOf(scalesPanel(diagram).locator('[data-scale="buffer"] [data-tick-x="0"]'), 'x1');
  const x14 = await numberOf(scalesPanel(diagram).locator('[data-scale="buffer"] [data-tick-x="14"]'), 'x1');
  return (pH: number) => x0 + (pH / 14) * (x14 - x0);
}

// Each drawn position is rounded to a tenth of a unit, and so is each tick.
const TOLERANCE = 0.3;
function expectNear(actual: number, expected: number, what: string, tolerance = TOLERANCE) {
  expect(Math.abs(actual - expected), `${what}: ${actual} is not within ${tolerance} of ${expected}`).toBeLessThanOrEqual(tolerance);
}

async function pressTimes(page: Page, key: string, times: number) {
  for (let i = 0; i < times; i++) await page.keyboard.press(key);
}

test('the diagram starts with 100 mmol of each form and nothing added, with its readout, scales and bars', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await expect(status(diagram)).toHaveText(START_READOUT);
  await expect(addedSlider(diagram)).toHaveAttribute('aria-valuetext', 'nothing added');
  await expect(addedSlider(diagram)).toHaveAttribute('min', '-50');
  await expect(addedSlider(diagram)).toHaveAttribute('max', '50');
  await expect(addedSlider(diagram)).toHaveAttribute('step', '5');
  await expect(addedSlider(diagram)).toHaveValue('0');
  for (const slider of [acidSlider(diagram), baseSlider(diagram)]) {
    await expect(slider).toHaveAttribute('min', '10');
    await expect(slider).toHaveAttribute('max', '200');
    await expect(slider).toHaveAttribute('step', '10');
    await expect(slider).toHaveValue('100');
  }
  await expect(acidSlider(diagram)).toHaveAttribute('aria-valuetext', '100 millimoles of propanoic acid');
  await expect(baseSlider(diagram)).toHaveAttribute('aria-valuetext', '100 millimoles of propanoate ion');
  await expect(values(diagram)).toHaveText(['nothing added', '100 mmol', '100 mmol']);
  await expect(scalesPanel(diagram).locator('[data-scale-title]')).toHaveText(['Buffer', 'Water']);
  // One marker on each scale, hollow, when nothing is added.
  await expect(scalesPanel(diagram).locator('[data-marker="before"]')).toHaveCount(2);
  await expect(scalesPanel(diagram).locator('[data-marker="after"]')).toHaveCount(0);
  await expect(barsPanel(diagram).locator('figcaption')).toHaveText('In the buffer, in millimoles');
  await expect(barsPanel(diagram).locator('[data-bar-name]')).toHaveText(['Acid form', 'Base form', 'Left over']);
  await expect(barsPanel(diagram).locator('[data-bar-value]')).toHaveText(['100', '100', '0']);
});

test('the addition slider works from the keyboard and speaks in words, never as a signed number', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await addedSlider(diagram).focus();
  await pressTimes(page, 'ArrowRight', 3);
  await expect(addedSlider(diagram)).toHaveAttribute('aria-valuetext', '15 mmol of OH⁻');
  await expect(values(diagram).first()).toHaveText('15 mmol of OH⁻');
  await expect(status(diagram)).toHaveText(OH_15);

  await pressTimes(page, 'ArrowLeft', 6);
  await expect(addedSlider(diagram)).toHaveAttribute('aria-valuetext', '15 mmol of H₃O⁺');
  await expect(status(diagram)).toHaveText(H3O_15);

  await page.keyboard.press('Home');
  await expect(addedSlider(diagram)).toHaveAttribute('aria-valuetext', '50 mmol of H₃O⁺');
  await expect(status(diagram)).toHaveText(readout(100, 100, -50));

  await page.keyboard.press('End');
  await expect(addedSlider(diagram)).toHaveAttribute('aria-valuetext', '50 mmol of OH⁻');
  await expect(status(diagram)).toHaveText(readout(100, 100, 50));

  await pressTimes(page, 'ArrowLeft', 10);
  await expect(addedSlider(diagram)).toHaveAttribute('aria-valuetext', 'nothing added');
  await expect(status(diagram)).toHaveText(START_READOUT);
});

test('the two amount sliders work from the keyboard, and the addition stays where it was', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  await setAdded(diagram, 15);

  await acidSlider(diagram).focus();
  await pressTimes(page, 'ArrowLeft', 8);
  await expect(acidSlider(diagram)).toHaveAttribute('aria-valuetext', amountValueText(20, 'acid'));
  await expect(values(diagram).nth(1)).toHaveText('20 mmol');
  await expect(addedSlider(diagram)).toHaveAttribute('aria-valuetext', '15 mmol of OH⁻');
  await expect(status(diagram)).toHaveText(readout(20, 100, 15));

  await baseSlider(diagram).focus();
  await pressTimes(page, 'ArrowLeft', 8);
  await expect(baseSlider(diagram)).toHaveAttribute('aria-valuetext', amountValueText(20, 'base'));
  await expect(status(diagram)).toHaveText(readout(20, 20, 15));

  await page.keyboard.press('End');
  await expect(baseSlider(diagram)).toHaveAttribute('aria-valuetext', '200 millimoles of propanoate ion');
  await acidSlider(diagram).focus();
  await page.keyboard.press('Home');
  await expect(acidSlider(diagram)).toHaveAttribute('aria-valuetext', '10 millimoles of propanoic acid');
  await expect(status(diagram)).toHaveText(readout(10, 200, 15));
});

test('the readout follows the brief at the states the lesson walks through', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  const cases: [number, number, number, string | RegExp][] = [
    [100, 100, 0, START_READOUT],
    [100, 100, 15, OH_15],
    [100, 100, -15, H3O_15],
    [20, 20, 15, /the buffer's pH from 4\.87 to 5\.72\. The same 15 mmol took the water from pH 7\.00 to 12\.18\.$/],
    [20, 20, 20, SMALL_20],
    [20, 20, 25, SMALL_25],
    [200, 200, 15, /from 1\.00 to 1\.16, and the buffer's pH from 4\.87 to 4\.94\./],
    [200, 200, 50, /from 1\.00 to 1\.67, and the buffer's pH from 4\.87 to 5\.09\./],
    [150, 50, 0, /Its pH is 4\.39\./],
    [150, 50, 40, /from 0\.333 to 0\.818, and the buffer's pH from 4\.39 to 4\.78\./],
    [150, 50, -40, /from 0\.333 to 0\.0526, and the buffer's pH from 4\.39 to 3\.60\./],
    [150, 50, -50, LOPSIDED_50],
    [200, 10, -50, ACID_HEAVY_50],
  ];
  for (const [acid, base, added, sentence] of cases) {
    await setState(diagram, acid, base, added);
    await expect(status(diagram), `${acid}, ${base}, ${added}`).toHaveText(sentence);
  }
});

test('the addition moves the filled markers and the bars; the amounts move the hollow markers and the outlines', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  const x = await scaleX(diagram);
  const before = (scale: string) => scalesPanel(diagram).locator(`[data-scale="${scale}"] [data-marker="before"]`);
  const after = (scale: string) => scalesPanel(diagram).locator(`[data-scale="${scale}"] [data-marker="after"]`);

  await setAdded(diagram, 15);
  await expect(scalesPanel(diagram).locator('[data-marker="after"]')).toHaveCount(2);
  expectNear(await numberOf(before('buffer'), 'cx'), x(bufferCapacityState(100, 100, 15).bufferBefore), 'the buffer before');
  expectNear(await numberOf(after('buffer'), 'cx'), x(bufferCapacityState(100, 100, 15).bufferAfter), 'the buffer after');
  expectNear(await numberOf(after('water'), 'cx'), x(bufferCapacityState(100, 100, 15).waterAfter), 'the water after');
  await expect(barsPanel(diagram).locator('[data-bar-value]')).toHaveText(['85', '115', '0']);
  await expect(barsPanel(diagram).locator('[data-bar-name="left"]')).toHaveText('OH⁻ left over');

  const ringBefore = await numberOf(before('buffer'), 'cx');
  const outlineBefore = await barsPanel(diagram).locator('[data-bar-before="acid"]').getAttribute('height');
  await setBuffer(diagram, 150, 50);
  expect(await numberOf(before('buffer'), 'cx')).toBeLessThan(ringBefore);
  expect(await barsPanel(diagram).locator('[data-bar-before="acid"]').getAttribute('height')).not.toBe(outlineBefore);
  // The water does not care what is in the buffer.
  expectNear(await numberOf(before('water'), 'cx'), x(7), 'the water before');

  await setAdded(diagram, -50);
  await expect(barsPanel(diagram).locator('[data-bar-name="left"]')).toHaveText('H₃O⁺ left over');
  await setBuffer(diagram, 200, 10);
  await expect(barsPanel(diagram).locator('[data-bar-value]')).toHaveText(['210', '0', '40']);
});

test('the scales are ticked from 0 to 14, and the markers differ in shape and fill, not color alone', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  for (const scale of ['buffer', 'water']) {
    const ticks = scalesPanel(diagram).locator(`[data-scale="${scale}"] [data-tick-x]`);
    expect(await ticks.evaluateAll((lines) => lines.map((line) => line.getAttribute('data-tick-x')))).toEqual(['0', '2', '4', '6', '8', '10', '12', '14']);
  }
  await setAdded(diagram, 15);
  const look = (selector: string) =>
    scalesPanel(diagram)
      .locator(selector)
      .first()
      .evaluate((element) => ({ r: Number(element.getAttribute('r')), fill: getComputedStyle(element).fill, stroke: getComputedStyle(element).stroke }));
  const ring = await look('[data-marker="before"]');
  const dot = await look('[data-marker="after"]');
  expect(ring.r, 'the hollow ring is larger than the dot').toBeGreaterThan(dot.r);
  expect(ring.fill, 'the ring is hollow: filled with the card').not.toBe(dot.fill);
  expect(ring.fill).not.toBe(ring.stroke);
  await expect(scalesPanel(diagram).locator('[data-key]')).toHaveText(['before the addition', 'after it']);
});

test('the bars differ in pattern: the acid form hatched, the base form plain, the amount before dashed', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  const acid = barsPanel(diagram).locator('[data-bar="acid"]');
  const fill = await acid.getAttribute('fill');
  expect(fill).toMatch(/^url\(#buffer-capacity-.+-hatch\)$/);
  const hatchId = fill?.slice(5, -1) ?? '';
  await expect(page.locator(`[id="${hatchId}"]`)).toHaveCount(1);
  expect(await barsPanel(diagram).locator('[data-bar="base"]').getAttribute('fill')).toBeNull();
  for (const id of ['acid', 'base']) {
    const dash = await barsPanel(diagram)
      .locator(`[data-bar-before="${id}"]`)
      .evaluate((element) => getComputedStyle(element).strokeDasharray);
    expect(dash, `the ${id} outline is dashed`).not.toBe('none');
  }
  await expect(barsPanel(diagram).locator('[data-bar-before="left"]')).toHaveCount(0);
  await expect(barsPanel(diagram).locator('[data-key]')).toHaveText(['amount before']);
});

test('over a sweep of settings, the readout, the names of the drawings, the markers and the bars are those of the module', async ({ page }) => {
  test.setTimeout(240_000);
  const diagram = await openDiagram(page, PAGE, NAME);
  const x = await scaleX(diagram);
  const baseline = await numberOf(barsPanel(diagram).locator('[data-baseline]'), 'y1');
  // A full bar is 250 mmol: 200 of a form and 50 more from the other. Read its scale from the start.
  const startHeight = await numberOf(barsPanel(diagram).locator('[data-bar="acid"]'), 'height');
  const unitsPerMmol = startHeight / 100;
  let states = 0;
  for (const [acid, base] of BUFFERS) {
    await setBuffer(diagram, acid, base);
    for (const added of ADDED_STEPS) {
      await setAdded(diagram, added);
      const where = `${acid}, ${base}, ${added}`;
      const s = bufferCapacityState(acid, base, added);
      await expect(status(diagram), where).toHaveText(readout(acid, base, added));
      await expect(scalesPanel(diagram).getByRole('img'), where).toHaveAccessibleName(describeScales(acid, base, added));
      await expect(barsPanel(diagram).getByRole('img'), where).toHaveAccessibleName(describeBars(acid, base, added));
      for (const [scale, from, to] of [
        ['buffer', s.bufferBefore, s.bufferAfter],
        ['water', s.waterBefore, s.waterAfter],
      ] as const) {
        expectNear(await numberOf(scalesPanel(diagram).locator(`[data-scale="${scale}"] [data-marker="before"]`), 'cx'), x(from), `${where}: ${scale} before`);
        const dot = scalesPanel(diagram).locator(`[data-scale="${scale}"] [data-marker="after"]`);
        if (added === 0) await expect(dot).toHaveCount(0);
        else expectNear(await numberOf(dot, 'cx'), x(to), `${where}: ${scale} after`);
      }
      const rows = bars(acid, base, added);
      await expect(barsPanel(diagram).locator('[data-bar-value]'), where).toHaveText(rows.map((r) => r.text));
      await expect(barsPanel(diagram).locator('[data-bar-name]'), where).toHaveText(rows.map((r) => r.name));
      for (const row of rows) {
        const rect = barsPanel(diagram).locator(`[data-bar="${row.id}"]`);
        expectNear(await numberOf(rect, 'height'), row.after * unitsPerMmol, `${where}: the ${row.id} bar`);
        expectNear((await numberOf(rect, 'y')) + (await numberOf(rect, 'height')), baseline, `${where}: the ${row.id} bar stands on the baseline`);
        if (row.before !== null) {
          expectNear(await numberOf(barsPanel(diagram).locator(`[data-bar-before="${row.id}"]`), 'height'), row.before * unitsPerMmol, `${where}: the ${row.id} outline`);
        }
      }
      states += 1;
    }
  }
  expect(states).toBe(BUFFERS.length * 21);
  expect(250 * unitsPerMmol, 'the tallest bar fits above the baseline').toBeLessThanOrEqual(baseline);
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

/** The boxes of the drawn shapes a selector finds, in drawing units, strokes included. */
async function shapeBoxes(panel: Locator, selector: string): Promise<Box[]> {
  return panel.locator('svg[role="img"]').evaluate((svg, sel) => {
    if (!(svg instanceof SVGSVGElement)) throw new Error('The drawing is not an SVG.');
    return [...svg.querySelectorAll(sel)].map((shape) => {
      const half = Number.parseFloat(getComputedStyle(shape).strokeWidth || '0') / 2;
      const n = (a: string) => Number(shape.getAttribute(a));
      if (shape.tagName === 'circle') {
        const reach = n('r') + half;
        return { name: shape.getAttribute('data-marker') ?? 'circle', left: n('cx') - reach, right: n('cx') + reach, top: n('cy') - reach, bottom: n('cy') + reach };
      }
      return { name: shape.getAttribute('data-bar') ?? shape.getAttribute('data-bar-before') ?? 'rect', left: n('x') - half, right: n('x') + n('width') + half, top: n('y') - half, bottom: n('y') + n('height') + half };
    });
  }, selector);
}

const apart = (one: Box, two: Box, margin = 0) =>
  one.bottom + margin <= two.top || two.bottom + margin <= one.top || one.right + margin <= two.left || two.right + margin <= one.left;

test('at every setting of the sweep no text is cut off, and no label meets another label, a marker, a bar or an outline', async ({ page }) => {
  test.setTimeout(240_000);
  const diagram = await openDiagram(page, PAGE, NAME);
  await page.evaluate(() => document.fonts.ready);
  let states = 0;
  for (const [acid, base] of BUFFERS) {
    await setBuffer(diagram, acid, base);
    for (const added of ADDED_STEPS) {
      await setAdded(diagram, added);
      const where = `${acid}, ${base}, ${added}`;
      for (const [panel, shapes, count] of [
        [scalesPanel(diagram), 'circle', 2 * (1 + 8)],
        [barsPanel(diagram), 'rect', 6],
      ] as const) {
        const labels = await textBoxes(panel);
        expect(labels, `${where}: the labels`).toHaveLength(count);
        const frame = await panel
          .locator('svg[role="img"]')
          .evaluate((svg) => (svg instanceof SVGSVGElement ? { width: svg.viewBox.baseVal.width, height: svg.viewBox.baseVal.height } : null));
        if (!frame) throw new Error('The drawing is not an SVG.');
        for (const label of labels) {
          expect(label.left >= -0.5 && label.top >= -0.5 && label.right <= frame.width + 0.5 && label.bottom <= frame.height + 0.5, `${where}: "${label.name}" is cut off`).toBe(true);
        }
        for (let i = 0; i < labels.length; i++) {
          for (let j = i + 1; j < labels.length; j++) {
            const [one, two] = [labels[i], labels[j]];
            if (!one || !two) throw new Error('A label is missing.');
            expect(apart(one, two), `${where}: "${one.name}" and "${two.name}" overlap`).toBe(true);
          }
        }
        const drawn = await shapeBoxes(panel, shapes);
        for (const label of labels) for (const shape of drawn) expect(apart(label, shape, 1), `${where}: "${label.name}" meets the ${shape.name}`).toBe(true);
      }
      states += 1;
    }
  }
  expect(states).toBe(BUFFERS.length * 21);
});

test("each drawing's name says what is drawn now", async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await expect(scalesPanel(diagram).getByRole('img')).toHaveAccessibleName('Two pH scales from 0 to 14, with nothing added yet. Buffer: 4.87. Water: 7.00.');
  await expect(barsPanel(diagram).getByRole('img')).toHaveAccessibleName('Bars in millimoles, with nothing added yet. Acid form: 100. Base form: 100. Left over: none.');
  await setAdded(diagram, 15);
  await expect(scalesPanel(diagram).getByRole('img')).toHaveAccessibleName('Two pH scales from 0 to 14. Buffer: 4.87 before, 5.00 after. Water: 7.00 before, 12.18 after.');
  await expect(barsPanel(diagram).getByRole('img')).toHaveAccessibleName('Bars in millimoles. Acid form: 85, down from 100. Base form: 115, up from 100. Left over: none.');
  await setState(diagram, 20, 20, 25);
  await expect(barsPanel(diagram).getByRole('img')).toHaveAccessibleName(/Left over: 5 of OH⁻\.$/);
});

// A nominal size: the font size in drawing units, times 320, over the drawing's width in units.
test("the drawings' text is 12 px or more when each drawing itself is shown 320 px wide", async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  await setAdded(diagram, -50);
  for (const panel of [scalesPanel(diagram), barsPanel(diagram)]) {
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
    await setAdded(diagram, -50);
    await page.evaluate(() => document.fonts.ready);
    for (const panel of [scalesPanel(diagram), barsPanel(diagram)]) {
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
  test(`at ${width} px the scales are above the bars, each no wider than 22rem`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const diagram = await openDiagram(page, PAGE, NAME);
    const scales = await scalesPanel(diagram).boundingBox();
    const amounts = await barsPanel(diagram).boundingBox();
    if (!scales || !amounts) throw new Error('A part has no bounding box.');
    expect(amounts.y, 'the bars are below the scales').toBeGreaterThanOrEqual(scales.y + scales.height);
    expect(scales.width).toBeLessThanOrEqual(22 * 16 + 1);
    expect(amounts.width).toBeLessThanOrEqual(22 * 16 + 1);
  });
}

test('the order is the scales and the bars, the addition, the acid form, the base form, then the readout', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  const parts = await Promise.all(
    [scalesPanel(diagram), barsPanel(diagram), addedSlider(diagram), acidSlider(diagram), baseSlider(diagram), status(diagram)].map((part) => part.boundingBox()),
  );
  const [scales, amounts, added, acid, base, readoutBox] = parts;
  if (!scales || !amounts || !added || !acid || !base || !readoutBox) throw new Error('A part of the diagram has no box.');
  const drawingsBottom = Math.max(scales.y + scales.height, amounts.y + amounts.height);
  expect(added.y, 'the addition slider is under the drawings').toBeGreaterThanOrEqual(drawingsBottom);
  // On a wide screen the sliders share a row, so "after" means lower down or,
  // in the same row, farther right.
  const after = (later: { x: number; y: number }, earlier: { x: number; y: number; height: number }) =>
    later.y >= earlier.y + earlier.height || (later.y === earlier.y && later.x > earlier.x);
  expect(after(acid, added), 'the acid form slider comes after the addition').toBe(true);
  expect(after(base, acid), 'the base form slider comes after the acid form').toBe(true);
  expect(readoutBox.y, 'the readout is under the controls').toBeGreaterThanOrEqual(Math.max(added.y + added.height, acid.y + acid.height, base.y + base.height));
});

// A student moves the addition and watches the markers. On a small phone the scales and that slider
// must be on the screen together, with the diagram scrolled so that the scales are at the top.
test('at 320 × 568 the scales and the addition slider are on the screen together', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  const diagram = await openDiagram(page, PAGE, NAME);
  await scalesPanel(diagram).evaluate((element) => {
    window.scrollTo(0, element.getBoundingClientRect().top + window.scrollY - 8);
  });
  for (const [name, part] of Object.entries({ scales: await scalesPanel(diagram).getByRole('img').boundingBox(), slider: await addedSlider(diagram).boundingBox() })) {
    if (!part) throw new Error(`The ${name} has no bounding box.`);
    expect(part.y, `the ${name} starts on the screen`).toBeGreaterThanOrEqual(0);
    expect(part.y + part.height, `the ${name} ends on the screen`).toBeLessThanOrEqual(568);
  }
});

for (const width of [1280, 680, 412, 390, 360, 320]) {
  test(`on a ${width} px screen nothing scrolls sideways and the controls stay inside the diagram`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    const diagram = await openDiagram(page, PAGE, NAME);
    // The longest readout of all 8,400 settings, found from the module.
    let longest = { acid: 100, base: 100, added: 0, text: '' };
    for (let acid = 10; acid <= 200; acid += 10) {
      for (let base = 10; base <= 200; base += 10) {
        for (const added of ADDED_STEPS) {
          const text = readout(acid, base, added);
          if (text.length > longest.text.length) longest = { acid, base, added, text };
        }
      }
    }
    await setState(diagram, longest.acid, longest.base, longest.added);
    await expect(status(diagram)).toHaveText(longest.text);
    await page.evaluate(() => document.fonts.ready);
    const figure = page.locator('[data-part="diagram"]', { has: diagram });

    const measured = await figure.evaluate((element) => {
      const frame = element.getBoundingClientRect();
      const outside = [...element.querySelectorAll('svg, p, input, label, li, figcaption')]
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
  test(`the diagram has no accessibility violations in the ${theme} theme, at the start and with 50 mmol of H₃O⁺ in a lopsided buffer`, async ({ page }) => {
    await page.addInitScript((value) => localStorage.setItem('chemstudy:theme', value), theme);
    const diagram = await openDiagram(page, PAGE, NAME);
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    const violations = async () => {
      const results = await new AxeBuilder({ page }).include(`[data-diagram="${NAME}"]`).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      return results.violations.map((v) => `${v.id}: ${v.nodes.length} node(s) - ${v.help}`);
    };
    expect(await violations(), 'at the start').toEqual([]);
    await setState(diagram, 200, 10, -50);
    expect(await violations(), '200, 10 and 50 mmol of H₃O⁺').toEqual([]);
  });
}

test('in print the controls are hidden and the scales, the bars and the readout stay', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  await page.emulateMedia({ media: 'print' });

  await expect(diagram.locator('.diagram-controls')).toBeHidden();
  await expect(scalesPanel(diagram).getByRole('img')).toBeVisible();
  await expect(barsPanel(diagram).getByRole('img')).toBeVisible();
  await expect(status(diagram)).toHaveText(START_READOUT);
});

test('the caption names the buffer, the water, 25 °C, the fixed volume and the full equilibrium', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  await expect(page.locator('[data-part="diagram"]', { has: diagram }).locator('> figcaption')).toHaveText(CAPTION);
});

test.describe('with JavaScript off', () => {
  test.use({ javaScriptEnabled: false });

  test('the scales, the bars and the starting readout show, with no controls', async ({ page }) => {
    await expectStaticDiagram(page, PAGE, NAME, START_READOUT);

    const diagram = page.locator(`[data-diagram="${NAME}"]`);
    await expect(scalesPanel(diagram).getByRole('img')).toBeVisible();
    await expect(barsPanel(diagram).getByRole('img')).toBeVisible();
    await expect(barsPanel(diagram).locator('[data-bar-value]')).toHaveText(['100', '100', '0']);
    const x = await scaleX(diagram);
    expectNear(await numberOf(scalesPanel(diagram).locator('[data-scale="buffer"] [data-marker="before"]'), 'cx'), x(4.87), 'the buffer marker', 0.4);
    expectNear(await numberOf(scalesPanel(diagram).locator('[data-scale="water"] [data-marker="before"]'), 'cx'), x(7), 'the water marker');
    await expect(scalesPanel(diagram).locator('[data-marker="after"]')).toHaveCount(0);
  });
});
