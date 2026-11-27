import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator, type Page } from '@playwright/test';
import { expectStaticDiagram, openDiagram } from './diagram';

const PAGE = '/unit-6-thermochemistry/6-4-heat-capacity-and-calorimetry/';
const NAME = 'calorimetry';

// The sentences below are written out from the lesson's brief, apart from the module under test.
const START_READOUT =
  'Both end at 26.7 °C. The titanium lost 2,789 J and the water gained 2,789 J. ' +
  "The water's temperature changed less, by 6.67 °C against 53.33 °C (to 0.01 °C), because its heat capacity is larger: 418 J/°C against 52.3 J/°C.";
const TUNGSTEN_READOUT =
  'Both end at 21.8 °C. The tungsten lost 768 J and the water gained 768 J. ' +
  "The water's temperature changed less, by 1.84 °C against 58.16 °C (to 0.01 °C), because its heat capacity is larger: 418 J/°C against 13.2 J/°C.";
const TIN_READOUT =
  'Both end at 23.1 °C. The tin lost 1,297 J and the water gained 1,297 J. ' +
  "The water's temperature changed less, by 3.10 °C against 56.90 °C (to 0.01 °C), because its heat capacity is larger: 418 J/°C against 22.8 J/°C.";
const MORE_WATER_READOUT =
  'Both end at 23.5 °C. The titanium lost 2,953 J and the water gained 2,953 J. ' +
  "The water's temperature changed less, by 3.53 °C against 56.47 °C (to 0.01 °C), because its heat capacity is larger: 836 J/°C against 52.3 J/°C.";
const CAPTION =
  'A heated piece of titanium, tin or tungsten, 50 to 200 g at 50 to 100 °C, goes into 50 to 200 g of water at 20.0 °C in an insulated cup. ' +
  'Specific heat capacities in J/(g·°C): titanium 0.523, tin 0.228, tungsten 0.132, water 4.18. ' +
  'The model takes it that no energy passes to the cup or the room.';

type Metal = 'titanium' | 'tin' | 'tungsten';
const METALS: Metal[] = ['titanium', 'tin', 'tungsten'];
const RADIO: Record<Metal, string> = {
  titanium: 'Titanium (0.523 J/(g·°C))',
  tin: 'Tin (0.228 J/(g·°C))',
  tungsten: 'Tungsten (0.132 J/(g·°C))',
};

interface Setting {
  metal: Metal;
  metalMass: number;
  metalTemperature: number;
  waterMass: number;
}
const setting = (metal: Metal, metalMass: number, metalTemperature: number, waterMass: number): Setting => ({
  metal,
  metalMass,
  metalTemperature,
  waterMass,
});
const START = setting('titanium', 100, 80, 100);

// An exact model of its own, in BigInt, for the sweep: specific heat capacities in mJ/(g·°C).
const C_MJ: Record<Metal, bigint> = { titanium: 523n, tin: 228n, tungsten: 132n };
const halfUp = (n: bigint, d: bigint) => (2n * n + d) / (2n * d);
const tenthsText = (tenths: bigint) => `${tenths / 10n}.${tenths % 10n}`;
const hundredthsText = (hundredths: bigint) => `${hundredths / 100n}.${String(hundredths % 100n).padStart(2, '0')}`;
const commas = (n: bigint) => {
  const digits = String(n);
  let out = '';
  for (let i = 0; i < digits.length; i++) {
    if (i > 0 && (digits.length - i) % 3 === 0) out += ',';
    out += digits[i];
  }
  return out;
};
/** mJ/°C to J/°C, three figures, half up. */
const threeFigures = (millijoules: bigint) => {
  const scale = 10n ** BigInt(String(millijoules).length - 3);
  const rounded = halfUp(millijoules, scale) * scale;
  const whole = rounded / 1000n;
  const decimals = Math.max(0, 3 - String(whole).length);
  if (decimals === 0) return String(whole);
  const fraction = String((rounded % 1000n) / 10n ** BigInt(3 - decimals)).padStart(decimals, '0');
  return `${whole}.${fraction}`;
};
function expected({ metal, metalMass, metalTemperature, waterMass }: Setting) {
  const cm = BigInt(metalMass) * C_MJ[metal];
  const cw = BigInt(waterMass) * 4180n;
  const tm = BigInt(metalTemperature) * 10n;
  const finalTenths = halfUp(cm * tm + cw * 200n, cm + cw);
  // The changes come from the exact final temperature, in hundredths of a degree.
  const exactHundredths = { n: 10n * (cm * tm + cw * 200n), d: cm + cw };
  const waterChange = halfUp(exactHundredths.n - 2000n * exactHundredths.d, exactHundredths.d);
  const metalChange = halfUp(10n * tm * exactHundredths.d - exactHundredths.n, exactHundredths.d);
  const energy = halfUp(cm * cw * (tm - 200n), (cm + cw) * 10000n);
  const joules = commas(energy);
  return {
    final: tenthsText(finalTenths),
    energy: Number(energy),
    joules,
    metalStart: tenthsText(tm),
    readout:
      `Both end at ${tenthsText(finalTenths)} °C. The ${metal} lost ${joules} J and the water gained ${joules} J. ` +
      `The water's temperature changed less, by ${hundredthsText(waterChange)} °C against ${hundredthsText(metalChange)} °C (to 0.01 °C), ` +
      `because its heat capacity is larger: ${threeFigures(cw)} J/°C against ${threeFigures(cm)} J/°C.`,
  };
}

// The brief's twelve worked states, then the corners of every metal: [metal, metal g, metal °C, water g, final °C, J].
const WORKED: [Metal, number, number, number, string, number][] = [
  ['titanium', 100, 80, 100, '26.7', 2789],
  ['tungsten', 100, 80, 100, '21.8', 768],
  ['tin', 100, 80, 100, '23.1', 1297],
  ['titanium', 100, 80, 200, '23.5', 2953],
  ['titanium', 200, 100, 50, '46.7', 5577],
  ['tungsten', 50, 50, 200, '20.2', 196],
  ['tin', 150, 65, 80, '24.2', 1396],
  ['tungsten', 200, 100, 50, '29.0', 1875],
  ['titanium', 50, 50, 200, '20.9', 761],
  ['tin', 50, 100, 150, '21.4', 896],
  ['tin', 50, 80, 70, '22.3', 658],
  ['tin', 60, 90, 180, '21.3', 941],
];
const SWEEP: Setting[] = [
  ...WORKED.map(([metal, mm, tm, mw]) => setting(metal, mm, tm, mw)),
  ...METALS.flatMap((metal) =>
    [50, 75, 100].flatMap((tm) => [50, 200].flatMap((mm) => [50, 200].map((mw) => setting(metal, mm, tm, mw)))),
  ),
];

const cupPanel = (diagram: Locator) => diagram.locator('[data-panel="cup"]');
const barsPanel = (diagram: Locator) => diagram.locator('[data-panel="bars"]');
const status = (diagram: Locator) => diagram.getByRole('status');
const metalGroup = (diagram: Locator) => diagram.getByRole('group', { name: 'Metal' });
const metalRadio = (diagram: Locator, metal: Metal) => metalGroup(diagram).getByRole('radio', { name: RADIO[metal], exact: true });
const SLIDER = {
  metalMass: 'Mass of metal',
  metalTemperature: 'Starting temperature of the metal',
  waterMass: 'Mass of water',
} as const;
const slider = (diagram: Locator, which: keyof typeof SLIDER) => diagram.getByRole('slider', { name: SLIDER[which], exact: true });
const reading = (diagram: Locator, which: 'metal' | 'water' | 'after') => cupPanel(diagram).locator(`[data-reading="${which}"]`);
const barValue = (diagram: Locator, which: 'metal' | 'water') => barsPanel(diagram).locator(`[data-bar-value="${which}"]`);
const barName = (diagram: Locator, which: 'metal' | 'water') => barsPanel(diagram).locator(`[data-bar-name="${which}"]`);
const bar = (diagram: Locator, which: 'metal' | 'water') => barsPanel(diagram).locator(`[data-bar="${which}"]`);

/** Chooses a metal and waits until the drawing has changed to it: a radio is checked before the redraw. */
async function chooseMetal(diagram: Locator, metal: Metal) {
  await metalRadio(diagram, metal).check();
  await expect(barName(diagram, 'metal')).toHaveText(`${metal} lost`);
}

/** Sets every control and waits until the readout is the one expected. */
async function setAll(diagram: Locator, value: Setting) {
  await chooseMetal(diagram, value.metal);
  await slider(diagram, 'metalMass').fill(String(value.metalMass));
  await slider(diagram, 'metalTemperature').fill(String(value.metalTemperature));
  await slider(diagram, 'waterMass').fill(String(value.waterMass));
  await expect(status(diagram)).toHaveText(expected(value).readout);
}

async function numberOf(element: Locator, attribute: string): Promise<number> {
  const value = await element.getAttribute(attribute);
  if (value === null || value === '') throw new Error(`An element has no ${attribute} attribute.`);
  return Number(value);
}

/** Where the energy axis puts a number of joules (ticks at 0 and 8,000 J). */
async function energyAxis(diagram: Locator) {
  const y0 = await numberOf(barsPanel(diagram).locator('[data-tick-y="0"]'), 'y1');
  const y8000 = await numberOf(barsPanel(diagram).locator('[data-tick-y="8000"]'), 'y1');
  return (joules: number) => y0 + (joules / 8000) * (y8000 - y0);
}

// Each drawn position is rounded to a tenth of a unit, and so is each tick.
const TOLERANCE = 0.3;
function expectNear(actual: number, wanted: number, what: string) {
  expect(Math.abs(actual - wanted), `${what}: ${actual} is not within ${TOLERANCE} of ${wanted}`).toBeLessThanOrEqual(TOLERANCE);
}

async function pressTimes(page: Page, key: string, times: number) {
  for (let i = 0; i < times; i++) await page.keyboard.press(key);
}

async function expectDrawnState(diagram: Locator, value: Setting) {
  const want = expected(value);
  const where = JSON.stringify(value);
  await expect(status(diagram), where).toHaveText(want.readout);
  await expect(reading(diagram, 'metal'), where).toHaveText(`${value.metal} at ${want.metalStart} °C`);
  await expect(reading(diagram, 'water'), where).toHaveText('water at 20.0 °C');
  await expect(reading(diagram, 'after'), where).toHaveText(`both at ${want.final} °C`);
  await expect(barValue(diagram, 'metal'), where).toHaveText(`${want.joules} J`);
  await expect(barValue(diagram, 'water'), where).toHaveText(`${want.joules} J`);
  const y = await energyAxis(diagram);
  for (const which of ['metal', 'water'] as const) {
    const top = await numberOf(bar(diagram, which), 'y');
    const height = await numberOf(bar(diagram, which), 'height');
    expectNear(top, y(want.energy), `${where}: the ${which} bar's top`);
    expectNear(top + height, y(0), `${where}: the ${which} bar's foot`);
  }
}

test('the diagram starts with 100 g of titanium at 80 °C in 100 g of water, its readout, cups and bars', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await expect(status(diagram)).toHaveText(START_READOUT);
  await expect(metalRadio(diagram, 'titanium')).toBeChecked();
  await expect(metalRadio(diagram, 'tin')).not.toBeChecked();
  await expect(metalRadio(diagram, 'tungsten')).not.toBeChecked();
  for (const [which, valuetext, min, max, step] of [
    ['metalMass', '100 g', '50', '200', '10'],
    ['metalTemperature', '80 °C', '50', '100', '5'],
    ['waterMass', '100 g', '50', '200', '10'],
  ] as const) {
    await expect(slider(diagram, which)).toHaveAttribute('aria-valuetext', valuetext);
    await expect(slider(diagram, which)).toHaveAttribute('min', min);
    await expect(slider(diagram, which)).toHaveAttribute('max', max);
    await expect(slider(diagram, which)).toHaveAttribute('step', step);
  }
  await expectDrawnState(diagram, START);
  await expect(barName(diagram, 'metal')).toHaveText('titanium lost');
  await expect(barName(diagram, 'water')).toHaveText('water gained');
  await expect(barsPanel(diagram).locator('[data-axis-label="y"]')).toHaveText('energy (J)');
  await expect(cupPanel(diagram).locator('[data-scene-title]')).toHaveText(['Before', 'At equilibrium']);
});

test('the metal control is three radio buttons, in order, in a group named Metal', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await expect(metalGroup(diagram).getByRole('radio')).toHaveCount(3);
  expect(await metalGroup(diagram).getByRole('radio').evaluateAll((radios) => radios.map((radio) => (radio as HTMLInputElement).value))).toEqual(
    METALS,
  );
});

test('the arrow keys choose the metal, and the readout follows', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await metalRadio(diagram, 'titanium').focus();
  await page.keyboard.press('ArrowDown');
  await expect(metalRadio(diagram, 'tin')).toBeChecked();
  await expect(status(diagram)).toHaveText(TIN_READOUT);
  await page.keyboard.press('ArrowDown');
  await expect(metalRadio(diagram, 'tungsten')).toBeChecked();
  await expect(status(diagram)).toHaveText(TUNGSTEN_READOUT);
});

test('each slider moves by its step from the keyboard', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await slider(diagram, 'metalMass').focus();
  await pressTimes(page, 'ArrowLeft', 5);
  await expect(slider(diagram, 'metalMass')).toHaveAttribute('aria-valuetext', '50 g');
  await expect(status(diagram)).toHaveText(expected(setting('titanium', 50, 80, 100)).readout);

  await slider(diagram, 'metalTemperature').focus();
  await pressTimes(page, 'ArrowRight', 2);
  await expect(slider(diagram, 'metalTemperature')).toHaveAttribute('aria-valuetext', '90 °C');
  await page.keyboard.press('End');
  await expect(slider(diagram, 'metalTemperature')).toHaveAttribute('aria-valuetext', '100 °C');
  await expect(status(diagram)).toHaveText(expected(setting('titanium', 50, 100, 100)).readout);

  await slider(diagram, 'waterMass').focus();
  await page.keyboard.press('Home');
  await expect(slider(diagram, 'waterMass')).toHaveAttribute('aria-valuetext', '50 g');
  await pressTimes(page, 'ArrowRight', 3);
  await expect(slider(diagram, 'waterMass')).toHaveAttribute('aria-valuetext', '80 g');
  await expect(status(diagram)).toHaveText(expected(setting('titanium', 50, 100, 80)).readout);
});

test('the three steps the lesson walks through give the numbers it promises', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  await expect(status(diagram)).toHaveText(START_READOUT);

  await chooseMetal(diagram, 'tungsten');
  await expect(status(diagram)).toHaveText(TUNGSTEN_READOUT);
  await expect(barValue(diagram, 'metal')).toHaveText('768 J');

  await chooseMetal(diagram, 'tin');
  await expect(status(diagram)).toHaveText(TIN_READOUT);

  await chooseMetal(diagram, 'titanium');
  await slider(diagram, 'waterMass').focus();
  await page.keyboard.press('End');
  await expect(status(diagram)).toHaveText(MORE_WATER_READOUT);
  await expect(reading(diagram, 'after')).toHaveText('both at 23.5 °C');
  await expect(barValue(diagram, 'water')).toHaveText('2,953 J');
});

test('each control changes what it should and nothing else', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  const waterTops = () => cupPanel(diagram).locator('[data-water]').evaluateAll((rects) => rects.map((rect) => rect.getAttribute('y')));
  const blocks = () => cupPanel(diagram).locator('[data-block]').evaluateAll((rects) => rects.map((rect) => rect.getAttribute('y')));
  const startWater = await waterTops();
  const startBlocks = await blocks();
  expect(startWater[0], 'the water is as deep in both cups').toBe(startWater[1]);

  // The metal: the bar's name, the reading's name, the numbers; not the water.
  await chooseMetal(diagram, 'tin');
  await expect(reading(diagram, 'metal')).toHaveText('tin at 80.0 °C');
  expect(await waterTops()).toEqual(startWater);

  // The mass of metal: the numbers; not the readings before, the water or the block.
  await slider(diagram, 'metalMass').fill('200');
  await expectDrawnState(diagram, setting('tin', 200, 80, 100));
  expect(await waterTops()).toEqual(startWater);
  expect(await blocks()).toEqual(startBlocks);

  // The metal's temperature: its reading before, and the numbers.
  await slider(diagram, 'metalTemperature').fill('55');
  await expectDrawnState(diagram, setting('tin', 200, 55, 100));
  expect(await waterTops()).toEqual(startWater);

  // The mass of water: the water's depth in both cups, and the numbers.
  await slider(diagram, 'waterMass').fill('200');
  await expectDrawnState(diagram, setting('tin', 200, 55, 200));
  const deeper = await waterTops();
  expect(deeper[0]).toBe(deeper[1]);
  expect(Number(deeper[0]), 'more water stands higher in the cup').toBeLessThan(Number(startWater[0]));
  expect(await blocks()).toEqual(startBlocks);
});

test('the block hangs above the cup before and lies in the water at equilibrium', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  for (const water of ['50', '200']) {
    await slider(diagram, 'waterMass').fill(water);
    await expect(slider(diagram, 'waterMass')).toHaveAttribute('aria-valuetext', `${water} g`);
    const [before, after] = await cupPanel(diagram)
      .locator('[data-scene]')
      .evaluateAll((scenes) =>
        scenes.map((scene) => {
          const box = (selector: string) => {
            const element = scene.querySelector(selector);
            if (!(element instanceof SVGGraphicsElement)) throw new Error(`No ${selector}.`);
            const { x, y, width, height } = element.getBBox();
            return { left: x, right: x + width, top: y, bottom: y + height };
          };
          return { block: box('[data-block]'), water: box('[data-water]'), cup: box('[data-inner-outline]') };
        }),
      );
    if (!before || !after) throw new Error('A scene is missing.');
    expect(before.block.bottom, `${water} g: the block is above the cup before`).toBeLessThan(before.cup.top);
    expect(after.block.top, `${water} g: the block is under the water at equilibrium`).toBeGreaterThanOrEqual(after.water.top);
    expect(after.block.bottom, `${water} g: the block lies on the bottom`).toBeLessThanOrEqual(after.cup.bottom + 0.5);
  }
});

test('the numbers drawn and the readout equal the exact model over a sweep of settings, with the two bars always equal', async ({ page }) => {
  test.setTimeout(120_000);
  const diagram = await openDiagram(page, PAGE, NAME);
  // The brief's worked states first, in the brief's own numbers.
  for (const [metal, mm, tm, mw, final, joules] of WORKED) {
    await setAll(diagram, setting(metal, mm, tm, mw));
    await expect(reading(diagram, 'after')).toHaveText(`both at ${final} °C`);
    await expect(barValue(diagram, 'metal')).toHaveText(`${commas(BigInt(joules))} J`);
  }
  let checked = 0;
  for (const value of SWEEP) {
    await setAll(diagram, value);
    await expectDrawnState(diagram, value);
    checked += 1;
  }
  expect(checked).toBe(12 + 36);
});

// The reviewer's case: a change taken from the rounded final temperature (0.2 °C) would give
// 794 × 0.2 = 159 J against the 196 J shown; to 0.01 °C it is 0.25 °C, and 794 × 0.25 = 198.5 J.
test('the readout shows the changes to 0.01 °C, so that heat capacity × change gives the energy shown', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await setAll(diagram, setting('tungsten', 50, 50, 190));
  await expect(status(diagram)).toHaveText(
    'Both end at 20.2 °C. The tungsten lost 196 J and the water gained 196 J. ' +
      "The water's temperature changed less, by 0.25 °C against 29.75 °C (to 0.01 °C), because its heat capacity is larger: 794 J/°C against 6.60 J/°C.",
  );
});

test('every clip path and hatching the drawings use is their own, with an id no other element on the page has', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  const found = await diagram.evaluate((root) => {
    const references = [...root.querySelectorAll('[fill^="url(#"], [clip-path^="url(#"]')].map((element) => {
      const value = element.getAttribute('fill')?.startsWith('url(') ? element.getAttribute('fill') : element.getAttribute('clip-path');
      return /^url\(#([^)]+)\)$/.exec(value ?? '')?.[1] ?? '';
    });
    return references.map((id) => ({
      id,
      onPage: document.querySelectorAll(`[id="${id}"]`).length,
      inDiagram: root.querySelectorAll(`[id="${id}"]`).length,
    }));
  });
  expect(found.length, 'the block twice, the metal bar and the two cups').toBe(5);
  for (const reference of found) {
    expect(reference.id, 'an id of this diagram').toMatch(/^calorimetry-.+/);
    expect(reference.onPage, `#${reference.id} is unique on the page`).toBe(1);
    expect(reference.inDiagram, `#${reference.id} is inside this diagram`).toBe(1);
  }
});

test('the two bars differ by pattern as well as color: the metal hatched like the block, the water plain', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  const fill = (element: Locator) => element.evaluate((node) => getComputedStyle(node).fill);

  expect(await fill(bar(diagram, 'metal')), 'the metal bar is hatched').toMatch(/^url\(/);
  expect(await fill(bar(diagram, 'water')), 'the water bar is plain').not.toMatch(/^url\(/);
  expect(await fill(cupPanel(diagram).locator('[data-block]').first()), 'the block is hatched').toMatch(/^url\(/);
  expect(await fill(cupPanel(diagram).locator('[data-water]').first()), 'the water is plain').not.toMatch(/^url\(/);
});

interface Box {
  name: string;
  left: number;
  right: number;
  top: number;
  bottom: number;
}

/** Every text in a drawing and the named shapes, as boxes in drawing units. */
async function boxesIn(panel: Locator, shapes: string) {
  return panel.locator('svg').evaluate((svg, shapeSelector) => {
    if (!(svg instanceof SVGSVGElement)) throw new Error('The drawing is not an SVG.');
    const frame = svg.getBoundingClientRect();
    const scale = svg.viewBox.baseVal.width / frame.width;
    const texts = [...svg.querySelectorAll('text')].map((text) => {
      const box = text.getBoundingClientRect();
      return {
        name: text.textContent ?? '',
        left: (box.left - frame.left) * scale,
        right: (box.right - frame.left) * scale,
        top: (box.top - frame.top) * scale,
        bottom: (box.bottom - frame.top) * scale,
      };
    });
    const parts = [...svg.querySelectorAll(shapeSelector)].map((shape) => {
      if (!(shape instanceof SVGGraphicsElement)) throw new Error('A shape is not drawn.');
      const { x, y, width, height } = shape.getBBox();
      const reach = Number.parseFloat(getComputedStyle(shape).strokeWidth) / 2 || 0;
      return { name: shape.outerHTML.slice(0, 60), left: x - reach, right: x + width + reach, top: y - reach, bottom: y + height + reach };
    });
    return { texts, parts, width: svg.viewBox.baseVal.width, height: svg.viewBox.baseVal.height };
  }, shapes);
}

const CLEARANCE = 2;
const apart = (one: Box, two: Box, margin = 0) =>
  one.bottom + margin <= two.top || two.bottom + margin <= one.top || one.right + margin <= two.left || two.right + margin <= one.left;

function expectNoCollisions(measured: { texts: Box[]; parts: Box[]; width: number; height: number }, where: string) {
  const { texts, parts, width, height } = measured;
  for (const text of texts) {
    expect(text.left >= -0.5 && text.right <= width + 0.5 && text.top >= -0.5 && text.bottom <= height + 0.5, `${where}: "${text.name}" is cut off`).toBe(
      true,
    );
    for (const part of parts) expect(apart(text, part, CLEARANCE), `${where}: "${text.name}" touches ${part.name}`).toBe(true);
  }
  texts.forEach((one, i) => {
    texts.slice(i + 1).forEach((two) => expect(apart(one, two), `${where}: "${one.name}" and "${two.name}" overlap`).toBe(true));
  });
}

test('no text is cut off or touches another text, a cup, the block, the thread, the probe or a bar, over the sweep', async ({ page }) => {
  test.setTimeout(120_000);
  const diagram = await openDiagram(page, PAGE, NAME);
  await page.evaluate(() => document.fonts.ready);
  // The longest readings (tungsten at 100.0 °C), the tallest and the shortest bars, and the deepest water.
  const extremes = [
    setting('tungsten', 200, 100, 50),
    setting('titanium', 200, 100, 200),
    setting('tungsten', 50, 50, 200),
    setting('titanium', 50, 50, 50),
    ...SWEEP,
  ];
  let checked = 0;
  for (const value of extremes) {
    await setAll(diagram, value);
    const where = JSON.stringify(value);
    expectNoCollisions(
      await boxesIn(cupPanel(diagram), '.calorimetry-foam, [data-block], .calorimetry-thread, .calorimetry-probe, [data-water]'),
      `cup, ${where}`,
    );
    expectNoCollisions(await boxesIn(barsPanel(diagram), '[data-bar]'), `bars, ${where}`);
    checked += 1;
  }
  expect(checked).toBe(4 + 48);
});

test("each drawing's name says what is drawn now", async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await expect(cupPanel(diagram).getByRole('img')).toHaveAccessibleName(
    'Two drawings of an insulated cup of water. Before: 100 g of titanium at 80.0 °C hangs above 100 g of water at 20.0 °C. ' +
      'At equilibrium: the titanium lies in the water, and both are at 26.7 °C.',
  );
  await expect(barsPanel(diagram).getByRole('img')).toHaveAccessibleName(
    'Bar chart of energy in joules, from 0 to 8,000 J. A hatched bar, the energy the titanium lost, ' +
      'and a plain bar, the energy the water gained, are the same height: 2,789 J each.',
  );

  await setAll(diagram, setting('tin', 60, 90, 180));
  await expect(cupPanel(diagram).getByRole('img')).toHaveAccessibleName(
    'Two drawings of an insulated cup of water. Before: 60 g of tin at 90.0 °C hangs above 180 g of water at 20.0 °C. ' +
      'At equilibrium: the tin lies in the water, and both are at 21.3 °C.',
  );
  await expect(barsPanel(diagram).getByRole('img')).toHaveAccessibleName(/the energy the tin lost, .* 941 J each\.$/);
});

// A nominal size, not a rendered one: the font size in drawing units, times 320, over the
// drawing's width in units. That is the size of the text when the drawing is shown 320 px wide.
test("the drawings' text is 12 px or more when each drawing itself is shown 320 px wide", async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  for (const panel of [cupPanel(diagram), barsPanel(diagram)]) {
    const sizes = await panel.locator('svg').evaluate((svg) => {
      if (!(svg instanceof SVGSVGElement)) throw new Error('The drawing is not an SVG.');
      const unitsWide = svg.viewBox.baseVal.width;
      return [...svg.querySelectorAll('text, tspan')].map((text) => ({
        text: text.textContent,
        pxAt320: (Number.parseFloat(getComputedStyle(text).fontSize) * 320) / unitsWide,
      }));
    });
    expect(sizes.length).toBeGreaterThanOrEqual(5);
    for (const size of sizes) expect(size.pxAt320, `"${size.text}"`).toBeGreaterThanOrEqual(12);
  }
});

for (const width of [1280, 768, 412]) {
  test(`on a ${width} px screen the drawn text is 12 px or larger`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const diagram = await openDiagram(page, PAGE, NAME);
    await page.evaluate(() => document.fonts.ready);

    for (const panel of [cupPanel(diagram), barsPanel(diagram)]) {
      const sizes = await panel.locator('svg').evaluate((svg) => {
        if (!(svg instanceof SVGSVGElement)) throw new Error('The drawing is not an SVG.');
        const scale = svg.getBoundingClientRect().width / svg.viewBox.baseVal.width;
        return [...svg.querySelectorAll('text, tspan')].map((text) => ({
          text: text.textContent,
          px: Number.parseFloat(getComputedStyle(text).fontSize) * scale,
        }));
      });
      for (const size of sizes) expect(size.px, `"${size.text}"`).toBeGreaterThanOrEqual(12);
    }
  });
}

for (const width of [1280, 768, 412, 320]) {
  test(`at ${width} px the cups are above the bars, each no wider than 22rem`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const diagram = await openDiagram(page, PAGE, NAME);

    const cup = await cupPanel(diagram).boundingBox();
    const bars = await barsPanel(diagram).boundingBox();
    if (!cup || !bars) throw new Error('A drawing has no bounding box.');
    expect(bars.y, 'the bars are below the cups').toBeGreaterThanOrEqual(cup.y + cup.height);
    expect(cup.width).toBeLessThanOrEqual(22 * 16 + 1);
    expect(bars.width).toBeLessThanOrEqual(22 * 16 + 1);
  });
}

test('the order is the cups and the bars, the choice of metal and the three sliders, then the readout', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  const boxes = await Promise.all(
    [
      cupPanel(diagram),
      barsPanel(diagram),
      metalGroup(diagram),
      slider(diagram, 'metalMass'),
      slider(diagram, 'metalTemperature'),
      slider(diagram, 'waterMass'),
      status(diagram),
    ].map((part) => part.boundingBox()),
  );
  const [cup, bars, metals, mass, temperature, water, readout] = boxes;
  if (!cup || !bars || !metals || !mass || !temperature || !water || !readout) throw new Error('A part of the diagram has no box.');

  const drawingsBottom = Math.max(cup.y + cup.height, bars.y + bars.height);
  for (const [name, control] of [
    ['the choice of metal', metals],
    ['the mass of metal', mass],
    ['the temperature', temperature],
    ['the mass of water', water],
  ] as const) {
    expect(control.y, `${name} is under the drawings`).toBeGreaterThanOrEqual(drawingsBottom);
    expect(readout.y, `the readout is under ${name}`).toBeGreaterThanOrEqual(control.y + control.height);
  }
  // In the page's order too, for the keyboard.
  const order = await diagram.evaluate((root) =>
    [...root.querySelectorAll('[data-panel], fieldset, input[type="range"], [role="status"]')].map(
      (element) => element.getAttribute('data-panel') ?? element.tagName.toLowerCase(),
    ),
  );
  expect(order).toEqual(['cup', 'bars', 'fieldset', 'input', 'input', 'input', 'p']);
});

for (const width of [1280, 768, 412, 390, 360, 320]) {
  test(`on a ${width} px screen nothing scrolls sideways and the controls stay inside the diagram`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    const diagram = await openDiagram(page, PAGE, NAME);
    // The longest readout of the sweep's kind: tungsten from 100 °C, four-figure water.
    await setAll(diagram, setting('tungsten', 200, 100, 50));
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
  test(`the diagram has no accessibility violations in the ${theme} theme, at the start and with tungsten`, async ({ page }) => {
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
    await setAll(diagram, setting('tungsten', 200, 100, 50));
    expect(await violations(), 'tungsten, 200 g at 100 °C in 50 g of water').toEqual([]);
  });
}

test('in print the controls are hidden and the cups, the bars and the readout stay', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  await page.emulateMedia({ media: 'print' });

  await expect(diagram.locator('.diagram-controls')).toBeHidden();
  await expect(cupPanel(diagram).getByRole('img')).toBeVisible();
  await expect(barsPanel(diagram).getByRole('img')).toBeVisible();
  await expect(status(diagram)).toHaveText(START_READOUT);
});

test('the caption names the metals, the amounts, the water, the specific heat capacities and the approximation', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  const caption = page.locator('[data-part="diagram"]', { has: diagram }).locator('> figcaption');

  await expect(caption).toHaveText(CAPTION);
});

test.describe('with JavaScript off', () => {
  test.use({ javaScriptEnabled: false });

  test('the cups, the bars and the starting readout show, with no controls', async ({ page }) => {
    await expectStaticDiagram(page, PAGE, NAME, START_READOUT);

    const diagram = page.locator(`[data-diagram="${NAME}"]`);
    await expect(cupPanel(diagram).getByRole('img')).toBeVisible();
    await expect(barsPanel(diagram).getByRole('img')).toBeVisible();
    await expectDrawnState(diagram, START);
  });
});
