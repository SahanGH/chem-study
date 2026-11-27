import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator, type Page } from '@playwright/test';
import {
  METAL_IDS,
  concentrationValueText,
  describeCell,
  describeScales,
  flowText,
  gapText,
  meterText,
  readout,
  sideLabels,
  state as cellState,
  type Exponent,
  type MetalId,
  type Side,
} from '../../src/lib/galvanic-cell';
import { expectStaticDiagram, openDiagram } from './diagram';

const PAGE = '/unit-9-thermodynamics/9-9-cell-potential-and-free-energy/';
const NAME = 'galvanic-cell';

// Every sentence and number below is written out from lesson 9.9's brief, "Diagram data" (the
// controls, the readout sentences, the worked states and the limits), and from the explorer values
// lesson 9.10's brief quotes, apart from the module under test. Only the sweeps over every setting
// compare the drawing with the module.
const HEAD_TIN_SILVER =
  'Sn(s) + 2Ag⁺(aq) → Sn²⁺(aq) + 2Ag(s). For each mole of reaction, 2 mol of electrons pass through the wire. ' +
  'E°cell = 0.80 − (−0.14) = 0.94 V, and ΔG° = −181 kJ/mol_rxn. ';
const START_READOUT = `${HEAD_TIN_SILVER}Q = [Sn²⁺]/[Ag⁺]² = 1.0. Both solutions are 1.0 M, the standard condition, so E = E°cell: 0.940 V.`;
const Q_ONE_AWAY = `${HEAD_TIN_SILVER}Q = [Sn²⁺]/[Ag⁺]² = 1.0. Q is 1, so E is equal to E°cell: 0.940 V.`;
const Q_BELOW = `${HEAD_TIN_SILVER}Q = [Sn²⁺]/[Ag⁺]² = 1.0 × 10⁻³. Q is below 1, so E is above E°cell: 1.029 V.`;
const Q_ABOVE = `${HEAD_TIN_SILVER}Q = [Sn²⁺]/[Ag⁺]² = 1.0 × 10⁴. Q is above 1, so E is below E°cell: 0.822 V.`;
const COBALT_DILUTE_LEFT =
  'Both half-cells are cobalt, so E°cell = 0 V and ΔG° = 0. The half-cell with the lower concentration, the left one, is the anode. ' +
  'For each mole of Co²⁺ made there, 2 mol of electrons pass through the wire. ' +
  'Q = [Co²⁺, dilute]/[Co²⁺, concentrated] = 1.0 × 10⁻³. Q is below 1, so E is above zero: 0.089 V.';
const COBALT_EQUAL =
  'Both half-cells are cobalt at 1.0 M, so nothing sets them apart. Q = 1 and K = 1: the cell is at equilibrium, E = 0 V and no electrons flow.';
const CHROMIUM_EQUAL =
  'Both half-cells are chromium at 0.0010 M, so nothing sets them apart. Q = 1 and K = 1: the cell is at equilibrium, E = 0 V and no electrons flow.';
const CAPTION =
  'The cell is at 25 °C, each metal stands in a solution of its own ion, and the salt bridge holds potassium nitrate. The standard reduction potentials are tabulated to 0.01 V. E is shown to a third decimal place only so that a small change can be seen.';

const METALS: MetalId[] = ['silver', 'copper', 'tin', 'cobalt', 'cadmium', 'chromium'];
const MENU: Record<MetalId, string> = { silver: 'Silver', copper: 'Copper', tin: 'Tin', cobalt: 'Cobalt', cadmium: 'Cadmium', chromium: 'Chromium' };
const EXPONENTS: Exponent[] = [-3, -2, -1, 0];
const MOLAR: Record<string, Exponent> = { '1.0': 0, '0.10': -1, '0.010': -2, '0.0010': -3 };
const SHOWN: Record<Exponent, string> = { [-3]: '0.0010 M', [-2]: '0.010 M', [-1]: '0.10 M', 0: '1.0 M' };
const SPOKEN: Record<Exponent, string> = { [-3]: '0.0010 molar', [-2]: '0.010 molar', [-1]: '0.10 molar', 0: '1.0 molar' };
const SIDES: Side[] = ['left', 'right'];
const GROUP: Record<Side, string> = { left: 'Left half-cell', right: 'Right half-cell' };

const cell = (diagram: Locator) => diagram.locator('[data-panel="cell"]');
const scales = (diagram: Locator) => diagram.locator('[data-panel="scales"]');
// A panel's main drawing, never a small one inside it.
const drawing = (panel: Locator) => panel.locator('svg[role="img"]');
const status = (diagram: Locator) => diagram.getByRole('status');
const flow = (diagram: Locator) => diagram.locator('[data-flow]');
const group = (diagram: Locator, side: Side) => diagram.getByRole('group', { name: GROUP[side], exact: true });
const menu = (diagram: Locator, side: Side) => group(diagram, side).getByRole('combobox', { name: `${GROUP[side]} metal`, exact: true });
const slider = (diagram: Locator, side: Side) => group(diagram, side).getByRole('slider', { name: `${GROUP[side]} concentration`, exact: true });
const sliderValue = (diagram: Locator, side: Side) => group(diagram, side).locator('.diagram-slider-value');
const label = (diagram: Locator, name: string) => drawing(cell(diagram)).locator(`[data-label="${name}"]`);

interface Setting {
  left: MetalId;
  leftExponent: Exponent;
  right: MetalId;
  rightExponent: Exponent;
}
const where = (s: Setting) => `${s.left} 10^${s.leftExponent} M | ${s.right} 10^${s.rightExponent} M`;

async function chooseMetal(diagram: Locator, side: Side, metal: MetalId) {
  await menu(diagram, side).selectOption(metal);
  await expect(menu(diagram, side)).toHaveValue(metal);
}

async function setExponent(diagram: Locator, side: Side, exponent: Exponent) {
  await slider(diagram, side).fill(String(exponent));
  await expect(slider(diagram, side)).toHaveAttribute('aria-valuetext', get(SPOKEN, exponent));
}

/** Sets all four controls and waits until the readout is the module's for that setting. */
async function setCell(diagram: Locator, s: Setting) {
  await chooseMetal(diagram, 'left', s.left);
  await chooseMetal(diagram, 'right', s.right);
  await setExponent(diagram, 'left', s.leftExponent);
  await setExponent(diagram, 'right', s.rightExponent);
  await expect(status(diagram), where(s)).toHaveText(readout(s.left, s.leftExponent, s.right, s.rightExponent));
}

async function pressTimes(page: Page, key: string, times: number) {
  for (let i = 0; i < times; i++) await page.keyboard.press(key);
}

/** A value that must be there: a missing one is an error, never a default. */
function get<K extends string | number, V>(record: Readonly<Record<K, V>>, key: K): V {
  const value = record[key];
  if (value === undefined) throw new Error(`There is no "${String(key)}".`);
  return value;
}
function at<T>(list: readonly T[], index: number): T {
  const item = list[index];
  if (item === undefined) throw new Error(`The list has no item ${index}; it has ${list.length}.`);
  return item;
}

async function numberOf(element: Locator, attribute: string): Promise<number> {
  const value = await element.getAttribute(attribute);
  if (value === null || value === '') throw new Error(`An element has no ${attribute} attribute.`);
  return Number(value);
}

/** Where the Q line puts a log Q, from its ticks at 10⁻⁹ and 10⁹. */
async function qAxis(diagram: Locator) {
  const low = await numberOf(scales(diagram).locator('[data-q-tick="-9"]'), 'x1');
  const high = await numberOf(scales(diagram).locator('[data-q-tick="9"]'), 'x1');
  return (logQ: number) => low + ((logQ + 9) / 18) * (high - low);
}

function expectNear(actual: number, expected: number, what: string, tolerance = 0.3) {
  expect(Math.abs(actual - expected), `${what}: ${actual} is not within ${tolerance} of ${expected}`).toBeLessThanOrEqual(tolerance);
}

/** The arrows drawn now: which way each points, or none. */
async function arrows(diagram: Locator) {
  const of = async (name: string) => {
    const heads = drawing(cell(diagram)).locator(`[data-arrowhead="${name}"]`);
    const count = await heads.count();
    if (count === 0) return null;
    expect(count, `one arrowhead for ${name}`).toBe(1);
    return heads.getAttribute('data-points');
  };
  return { electrons: await of('electrons'), nitrate: await of('nitrate'), potassium: await of('potassium') };
}

test('the diagram starts with tin on the left and silver on the right, both 1.0 M, with its readout and labels', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await expect(status(diagram)).toHaveText(START_READOUT);
  await expect(menu(diagram, 'left')).toHaveValue('tin');
  await expect(menu(diagram, 'right')).toHaveValue('silver');
  for (const side of SIDES) {
    await expect(slider(diagram, side)).toHaveValue('0');
    await expect(slider(diagram, side)).toHaveAttribute('min', '-3');
    await expect(slider(diagram, side)).toHaveAttribute('max', '0');
    await expect(slider(diagram, side)).toHaveAttribute('step', '1');
    await expect(slider(diagram, side)).toHaveAttribute('aria-valuetext', '1.0 molar');
    await expect(sliderValue(diagram, side)).toHaveText('1.0 M');
  }
  await expect(label(diagram, 'role-left')).toHaveText('anode: oxidation');
  await expect(label(diagram, 'role-right')).toHaveText('cathode: reduction');
  await expect(label(diagram, 'half-reaction-left')).toHaveText('Sn(s) → Sn²⁺(aq) + 2e⁻');
  await expect(label(diagram, 'half-reaction-right')).toHaveText('Ag⁺(aq) + e⁻ → Ag(s)');
  await expect(label(diagram, 'electrode-left')).toHaveText('loses mass');
  await expect(label(diagram, 'electrode-right')).toHaveText('gains mass');
  await expect(label(diagram, 'solution-left')).toHaveText('1.0 M Sn²⁺');
  await expect(label(diagram, 'solution-right')).toHaveText('1.0 M Ag⁺');
  await expect(label(diagram, 'symbol-left')).toHaveText('Sn');
  await expect(label(diagram, 'symbol-right')).toHaveText('Ag');
  await expect(label(diagram, 'meter')).toHaveText('0.940 V');
  await expect(label(diagram, 'electrons')).toHaveText('e⁻');
  await expect(label(diagram, 'nitrate')).toHaveText('NO₃⁻');
  await expect(label(diagram, 'potassium')).toHaveText('K⁺');
  expect(await arrows(diagram)).toEqual({ electrons: 'right', nitrate: 'left', potassium: 'right' });
  await expect(flow(diagram)).toHaveAttribute('aria-live', 'polite');
  await expect(flow(diagram)).toHaveText(
    'Electrons flow through the wire from the tin electrode on the left, the anode, to the silver electrode on the right, the cathode. ' +
      'In the salt bridge, NO₃⁻ ions move toward the left half-cell and K⁺ ions toward the right half-cell.',
  );
  await expect(scales(diagram).locator('[data-chosen]')).toHaveCount(2);
  await expect(scales(diagram).locator('[data-rung="silver"]')).toHaveAttribute('data-chosen', 'true');
  await expect(scales(diagram).locator('[data-rung="tin"]')).toHaveAttribute('data-chosen', 'true');
  await expect(scales(diagram).locator('[data-gap]')).toHaveText('E°cell = 0.94 V');
  await expect(scales(diagram).locator('[data-label="q-one"]')).toHaveText('Q = 1: E = E°');
});

test('the controls are a group for each half-cell: a menu of the six metals in the brief’s order and a slider of four stops', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  for (const side of SIDES) {
    const options = menu(diagram, side).locator('option');
    await expect(options).toHaveText(METALS.map((m) => MENU[m]));
    expect(await options.evaluateAll((list) => list.map((o) => (o as HTMLOptionElement).value))).toEqual(METALS);
  }
  // The ladder has the same six rungs, top first.
  await expect(scales(diagram).locator('[data-rung-name]')).toHaveText([
    'Ag⁺/Ag +0.80 V',
    'Cu²⁺/Cu +0.34 V',
    'Sn²⁺/Sn −0.14 V',
    'Co²⁺/Co −0.28 V',
    'Cd²⁺/Cd −0.40 V',
    'Cr³⁺/Cr −0.74 V',
  ]);
  await expect(scales(diagram).locator('[data-q-tick-label]')).toHaveText(['10⁻⁹', '10⁻⁶', '10⁻³', '1', '10³', '10⁶', '10⁹']);
});

test('the sliders work from the keyboard: the arrows, Home and End', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await slider(diagram, 'right').focus();
  await page.keyboard.press('ArrowLeft');
  await expect(slider(diagram, 'right')).toHaveAttribute('aria-valuetext', '0.10 molar');
  await expect(sliderValue(diagram, 'right')).toHaveText('0.10 M');
  await expect(status(diagram)).toContainText('Q = [Sn²⁺]/[Ag⁺]² = 1.0 × 10². Q is above 1, so E is below E°cell: 0.881 V.');
  await page.keyboard.press('ArrowLeft');
  await expect(status(diagram)).toHaveText(Q_ABOVE);
  await page.keyboard.press('Home');
  await expect(slider(diagram, 'right')).toHaveAttribute('aria-valuetext', '0.0010 molar');
  await expect(status(diagram)).toContainText('E is below E°cell: 0.763 V.');
  await page.keyboard.press('ArrowLeft');
  await expect(slider(diagram, 'right')).toHaveAttribute('aria-valuetext', '0.0010 molar');
  await page.keyboard.press('End');
  await expect(slider(diagram, 'right')).toHaveAttribute('aria-valuetext', '1.0 molar');
  await expect(status(diagram)).toHaveText(START_READOUT);

  await slider(diagram, 'left').focus();
  await pressTimes(page, 'ArrowLeft', 3);
  await expect(slider(diagram, 'left')).toHaveAttribute('aria-valuetext', '0.0010 molar');
  await expect(sliderValue(diagram, 'left')).toHaveText('0.0010 M');
  await expect(status(diagram)).toHaveText(Q_BELOW);
  await page.keyboard.press('ArrowRight');
  await expect(slider(diagram, 'left')).toHaveAttribute('aria-valuetext', '0.010 molar');
  await page.keyboard.press('End');
  await page.keyboard.press('ArrowRight');
  await expect(slider(diagram, 'left')).toHaveAttribute('aria-valuetext', '1.0 molar');
});

test('the menus work from the keyboard, and the concentrations stay where they were', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  await setExponent(diagram, 'right', -2);

  // Tin is third; one step down is cobalt.
  await menu(diagram, 'left').focus();
  await page.keyboard.press('ArrowDown');
  await expect(menu(diagram, 'left')).toHaveValue('cobalt');
  await expect(slider(diagram, 'right')).toHaveAttribute('aria-valuetext', '0.010 molar');
  await expect(status(diagram)).toHaveText(readout('cobalt', 0, 'silver', -2));
  await page.keyboard.press('ArrowDown');
  await expect(menu(diagram, 'left')).toHaveValue('cadmium');
  await page.keyboard.press('ArrowUp');
  await page.keyboard.press('ArrowUp');
  await expect(menu(diagram, 'left')).toHaveValue('tin');
  await expect(status(diagram)).toHaveText(Q_ABOVE);

  await menu(diagram, 'right').focus();
  await page.keyboard.press('ArrowDown');
  await expect(menu(diagram, 'right')).toHaveValue('copper');
  await expect(status(diagram)).toHaveText(readout('tin', 0, 'copper', -2));
});

test('the readout follows the brief at every state the brief writes out', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  const cases: [Setting, string][] = [
    [{ left: 'tin', leftExponent: 0, right: 'silver', rightExponent: 0 }, START_READOUT],
    [{ left: 'tin', leftExponent: -2, right: 'silver', rightExponent: -1 }, Q_ONE_AWAY],
    [{ left: 'tin', leftExponent: -3, right: 'silver', rightExponent: 0 }, Q_BELOW],
    [{ left: 'tin', leftExponent: 0, right: 'silver', rightExponent: -2 }, Q_ABOVE],
    [{ left: 'cobalt', leftExponent: -3, right: 'cobalt', rightExponent: 0 }, COBALT_DILUTE_LEFT],
    [{ left: 'cobalt', leftExponent: 0, right: 'cobalt', rightExponent: 0 }, COBALT_EQUAL],
    [{ left: 'chromium', leftExponent: -3, right: 'chromium', rightExponent: -3 }, CHROMIUM_EQUAL],
  ];
  for (const [s, sentence] of cases) {
    await chooseMetal(diagram, 'left', s.left);
    await chooseMetal(diagram, 'right', s.right);
    await setExponent(diagram, 'left', s.leftExponent);
    await setExponent(diagram, 'right', s.rightExponent);
    await expect(status(diagram), where(s)).toHaveText(sentence);
  }
});

// [left, left M, right, right M, anode, n, E°cell, ΔG°, E] from the brief's thirty-one worked states.
const WORKED: [MetalId, string, MetalId, string, Side | 'none', number, string, string, string][] = [
  ['tin', '1.0', 'silver', '1.0', 'left', 2, '0.94', '−181', '0.940'],
  ['silver', '1.0', 'tin', '1.0', 'right', 2, '0.94', '−181', '0.940'],
  ['cadmium', '1.0', 'silver', '1.0', 'left', 2, '1.20', '−232', '1.200'],
  ['cobalt', '1.0', 'silver', '1.0', 'left', 2, '1.08', '−208', '1.080'],
  ['chromium', '1.0', 'copper', '1.0', 'left', 6, '1.08', '−625', '1.080'],
  ['tin', '1.0', 'silver', '0.10', 'left', 2, '0.94', '−181', '0.881'],
  ['tin', '1.0', 'silver', '0.010', 'left', 2, '0.94', '−181', '0.822'],
  ['tin', '0.10', 'silver', '1.0', 'left', 2, '0.94', '−181', '0.970'],
  ['tin', '0.0010', 'silver', '1.0', 'left', 2, '0.94', '−181', '1.029'],
  ['tin', '0.010', 'silver', '0.10', 'left', 2, '0.94', '−181', '0.940'],
  ['cobalt', '1.0', 'cobalt', '1.0', 'none', 2, '0', '0', '0.000'],
  ['cobalt', '0.0010', 'cobalt', '1.0', 'left', 2, '0', '0', '0.089'],
  ['cobalt', '1.0', 'cobalt', '0.0010', 'right', 2, '0', '0', '0.089'],
  ['cadmium', '1.0', 'cobalt', '0.0010', 'left', 2, '0.12', '−23', '0.031'],
  ['chromium', '1.0', 'silver', '0.0010', 'left', 3, '1.54', '−446', '1.363'],
  ['chromium', '0.0010', 'copper', '1.0', 'left', 6, '1.08', '−625', '1.139'],
  ['silver', '0.10', 'silver', '0.0010', 'right', 1, '0', '0', '0.118'],
  ['chromium', '0.010', 'chromium', '1.0', 'left', 3, '0', '0', '0.039'],
  ['copper', '0.010', 'tin', '0.10', 'right', 2, '0.48', '−93', '0.450'],
  ['cadmium', '1.0', 'copper', '1.0', 'left', 2, '0.74', '−143', '0.740'],
  ['chromium', '0.0010', 'chromium', '0.0010', 'none', 3, '0', '0', '0.000'],
  ['silver', '0.0010', 'chromium', '1.0', 'right', 3, '1.54', '−446', '1.363'],
  ['chromium', '0.0010', 'silver', '1.0', 'left', 3, '1.54', '−446', '1.599'],
  ['silver', '1.0', 'silver', '0.0010', 'right', 1, '0', '0', '0.177'],
  ['cadmium', '1.0', 'silver', '0.0010', 'left', 2, '1.20', '−232', '1.023'],
  ['chromium', '0.10', 'copper', '0.10', 'left', 6, '1.08', '−625', '1.070'],
  ['cadmium', '1.0', 'silver', '0.10', 'left', 2, '1.20', '−232', '1.141'],
  ['tin', '1.0', 'silver', '0.0010', 'left', 2, '0.94', '−181', '0.763'],
  ['cobalt', '0.10', 'silver', '1.0', 'left', 2, '1.08', '−208', '1.110'],
  ['cobalt', '0.0010', 'silver', '0.010', 'left', 2, '1.08', '−208', '1.050'],
  ['cobalt', '0.010', 'silver', '0.10', 'left', 2, '1.08', '−208', '1.080'],
];

test('the thirty-one worked states show the brief’s E°cell, ΔG°, n, anode and E', async ({ page }) => {
  test.setTimeout(120_000);
  const diagram = await openDiagram(page, PAGE, NAME);
  for (const [left, leftM, right, rightM, anode, n, standard, deltaG, e] of WORKED) {
    const s: Setting = { left, leftExponent: get(MOLAR, leftM), right, rightExponent: get(MOLAR, rightM) };
    await setCell(diagram, s);
    const w = where(s);
    await expect(label(diagram, 'meter'), w).toHaveText(`${e} V`);
    const text = await status(diagram).textContent();
    if (text === null) throw new Error(`${w}: the readout has no text.`);
    if (anode === 'none') {
      expect(text, w).toContain('E = 0 V and no electrons flow');
      await expect(label(diagram, 'role-left'), w).toHaveText('no net reaction');
      await expect(label(diagram, 'role-right'), w).toHaveText('no net reaction');
      continue;
    }
    const cathode = anode === 'left' ? 'right' : 'left';
    await expect(label(diagram, `role-${anode}`), w).toHaveText('anode: oxidation');
    await expect(label(diagram, `role-${cathode}`), w).toHaveText('cathode: reduction');
    if (left === right) {
      expect(text, w).toContain(`the ${anode} one, is the anode`);
      expect(text, w).toContain(`${n} mol of electrons ${n === 1 ? 'passes' : 'pass'}`);
      expect(text, w).toContain(`so E is above zero: ${e} V.`);
    } else {
      expect(text, w).toContain(`For each mole of reaction, ${n} mol of electrons pass through the wire.`);
      expect(text, w).toContain(` = ${standard} V, and ΔG° = ${deltaG} kJ/mol_rxn.`);
      expect(text, w).toMatch(new RegExp(`: ${e.replace('.', '\\.')} V\\.$`));
    }
  }
});

test('trading the two sides moves the labels and the arrows and changes no number', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  const before = await status(diagram).textContent();

  await chooseMetal(diagram, 'left', 'silver');
  await chooseMetal(diagram, 'right', 'tin');
  await expect(status(diagram)).toHaveText(START_READOUT);
  expect(await status(diagram).textContent()).toBe(before);
  await expect(label(diagram, 'role-left')).toHaveText('cathode: reduction');
  await expect(label(diagram, 'role-right')).toHaveText('anode: oxidation');
  await expect(label(diagram, 'half-reaction-left')).toHaveText('Ag⁺(aq) + e⁻ → Ag(s)');
  await expect(label(diagram, 'half-reaction-right')).toHaveText('Sn(s) → Sn²⁺(aq) + 2e⁻');
  await expect(label(diagram, 'electrode-left')).toHaveText('gains mass');
  await expect(label(diagram, 'electrode-right')).toHaveText('loses mass');
  await expect(label(diagram, 'meter')).toHaveText('0.940 V');
  await expect(scales(diagram).locator('[data-gap]')).toHaveText('E°cell = 0.94 V');
  expect(await arrows(diagram)).toEqual({ electrons: 'left', nitrate: 'right', potassium: 'left' });
  // The electron arrow and its label stand on the anode's side of the wire, now the right.
  const middle = 160;
  expect(await numberOf(label(diagram, 'electrons'), 'x')).toBeGreaterThan(middle);
  await expect(flow(diagram)).toHaveText(
    'Electrons flow through the wire from the tin electrode on the right, the anode, to the silver electrode on the left, the cathode. ' +
      'In the salt bridge, NO₃⁻ ions move toward the right half-cell and K⁺ ions toward the left half-cell.',
  );
});

test('a concentration cell: the dilute side is the anode, and with equal concentrations nothing flows and no arrow is drawn', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  await chooseMetal(diagram, 'left', 'cobalt');
  await chooseMetal(diagram, 'right', 'cobalt');
  await expect(status(diagram)).toHaveText(COBALT_EQUAL);
  expect(await arrows(diagram)).toEqual({ electrons: null, nitrate: null, potassium: null });
  await expect(label(diagram, 'electrons')).toHaveCount(0);
  await expect(label(diagram, 'electrode-left')).toHaveCount(0);
  await expect(label(diagram, 'electrode-right')).toHaveCount(0);
  await expect(label(diagram, 'role-left')).toHaveText('no net reaction');
  await expect(label(diagram, 'half-reaction-left')).toHaveText('Co²⁺(aq) + 2e⁻ ⇌ Co(s)');
  await expect(label(diagram, 'meter')).toHaveText('0.000 V');
  await expect(scales(diagram).locator('[data-chosen]')).toHaveCount(1);
  await expect(scales(diagram).locator('[data-bracket]')).toHaveCount(0);
  await expect(scales(diagram).locator('[data-gap]')).toHaveText('E°cell = 0 V');
  await expect(flow(diagram)).toHaveText('No electrons flow and no ions move through the salt bridge: neither electrode is an anode or a cathode.');

  await setExponent(diagram, 'left', -3);
  await expect(status(diagram)).toHaveText(COBALT_DILUTE_LEFT);
  await expect(label(diagram, 'role-left')).toHaveText('anode: oxidation');
  await expect(label(diagram, 'half-reaction-left')).toHaveText('Co(s) → Co²⁺(aq) + 2e⁻');
  await expect(label(diagram, 'half-reaction-right')).toHaveText('Co²⁺(aq) + 2e⁻ → Co(s)');
  expect(await arrows(diagram)).toEqual({ electrons: 'right', nitrate: 'left', potassium: 'right' });
  await expect(label(diagram, 'meter')).toHaveText('0.089 V');

  // The two concentrations exchanged: the labels change sides and the number does not.
  await setExponent(diagram, 'left', 0);
  await setExponent(diagram, 'right', -3);
  await expect(label(diagram, 'role-right')).toHaveText('anode: oxidation');
  await expect(label(diagram, 'role-left')).toHaveText('cathode: reduction');
  expect(await arrows(diagram)).toEqual({ electrons: 'left', nitrate: 'right', potassium: 'left' });
  await expect(label(diagram, 'meter')).toHaveText('0.089 V');
});

test('the ladder marks the two chosen rungs, heavier than the others, and brackets the gap', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  const width = (selector: string) => scales(diagram).locator(selector).evaluate((element) => Number.parseFloat(getComputedStyle(element).strokeWidth));
  expect(await width('[data-rung="silver"]')).toBeGreaterThan(await width('[data-rung="copper"]'));
  await expect(scales(diagram).locator('[data-rung-name="silver"]')).toHaveClass(/is-selected/);
  await expect(scales(diagram).locator('[data-rung-name="copper"]')).not.toHaveClass(/is-selected/);

  // The rungs stand in the order of their potentials, top first, and the bracket spans the chosen two.
  const ys = await Promise.all(METALS.map((m) => numberOf(scales(diagram).locator(`[data-rung="${m}"]`), 'y1')));
  for (let i = 1; i < ys.length; i++) expect(at(ys, i)).toBeGreaterThan(at(ys, i - 1));
  await chooseMetal(diagram, 'left', 'chromium');
  await chooseMetal(diagram, 'right', 'copper');
  await expect(scales(diagram).locator('[data-gap]')).toHaveText('E°cell = 1.08 V');
  const d = await scales(diagram).locator('[data-bracket]').getAttribute('d');
  if (d === null) throw new Error('The bracket has no d attribute.');
  const numbers = [...d.matchAll(/-?\d+(?:\.\d+)?/g)].map((m) => Number(m[0]));
  expect(numbers).toContain(at(ys, 1));
  expect(numbers).toContain(at(ys, 5));
});

test('over all 576 settings, the readout, the names of the drawings, the labels, the arrows, the rungs and the Q marker are those of the module', async ({ page }) => {
  test.setTimeout(900_000);
  const diagram = await openDiagram(page, PAGE, NAME);
  const xFor = await qAxis(diagram);
  let states = 0;
  for (const left of METALS) {
    await chooseMetal(diagram, 'left', left);
    for (const right of METALS) {
      await chooseMetal(diagram, 'right', right);
      for (const leftExponent of EXPONENTS) {
        await setExponent(diagram, 'left', leftExponent);
        for (const rightExponent of EXPONENTS) {
          await setExponent(diagram, 'right', rightExponent);
          const s = { left, leftExponent, right, rightExponent };
          const w = where(s);
          const now = cellState(left, leftExponent, right, rightExponent);
          await expect(status(diagram), w).toHaveText(readout(left, leftExponent, right, rightExponent));
          await expect(drawing(cell(diagram)), w).toHaveAccessibleName(describeCell(now));
          await expect(drawing(scales(diagram)), w).toHaveAccessibleName(describeScales(now));
          await expect(flow(diagram), w).toHaveText(flowText(now));
          await expect(label(diagram, 'meter'), w).toHaveText(meterText(now));
          await expect(scales(diagram).locator('[data-gap]'), w).toHaveText(gapText(now));
          await expect(slider(diagram, 'left'), w).toHaveAttribute('aria-valuetext', concentrationValueText(leftExponent));
          await expect(sliderValue(diagram, 'right'), w).toHaveText(get(SHOWN, rightExponent));
          const labels = sideLabels(now);
          for (const side of SIDES) {
            const l = labels[side];
            await expect(label(diagram, `role-${side}`), w).toHaveText(l.role);
            await expect(label(diagram, `half-reaction-${side}`), w).toHaveText(l.halfReaction);
            await expect(label(diagram, `solution-${side}`), w).toHaveText(l.solution);
            if (l.electrode === null) await expect(label(diagram, `electrode-${side}`), w).toHaveCount(0);
            else await expect(label(diagram, `electrode-${side}`), w).toHaveText(l.electrode);
          }
          // An arrowhead points toward the side its electrons or ions move to.
          expect(await arrows(diagram), w).toEqual(now.flow);
          const chosen = await scales(diagram)
            .locator('[data-chosen]')
            .evaluateAll((rungs) => rungs.map((rung) => rung.getAttribute('data-rung')));
          expect(chosen, w).toEqual(METAL_IDS.filter((m) => m === left || m === right));
          expectNear(await numberOf(scales(diagram).locator('[data-q-marker]'), 'cx'), xFor(now.logQ), `${w}: the Q marker`);
          states += 1;
        }
      }
    }
  }
  expect(states).toBe(576);
});

interface Box {
  name: string;
  left: number;
  right: number;
  top: number;
  bottom: number;
}
interface Point {
  x: number;
  y: number;
  what: string;
}

/** Every text in a drawing, as a box in drawing units (its whole line box, which errs on the safe side), and points every half unit along every line and outline but the solutions' fill. */
async function geometry(panel: Locator): Promise<{ labels: Box[]; points: Point[]; width: number; height: number }> {
  return drawing(panel).evaluate((svg) => {
    if (!(svg instanceof SVGSVGElement)) throw new Error('The drawing is not an SVG.');
    const frame = svg.getBoundingClientRect();
    const scale = svg.viewBox.baseVal.width / frame.width;
    const labels = [...svg.querySelectorAll('text')].map((text) => {
      const box = text.getBoundingClientRect();
      const name = text.textContent;
      if (name === null) throw new Error('A text has no content.');
      return { name, left: (box.left - frame.left) * scale, right: (box.right - frame.left) * scale, top: (box.top - frame.top) * scale, bottom: (box.bottom - frame.top) * scale };
    });
    const points: { x: number; y: number; what: string }[] = [];
    for (const shape of svg.querySelectorAll<SVGGeometryElement>('line, path, rect, polygon')) {
      if (shape.classList.contains('galvanic-cell-solution')) continue;
      const length = shape.getTotalLength();
      const what = `${shape.tagName} ${shape.getAttribute('class')} ${Object.values(shape.dataset).join(' ')}`;
      for (let along = 0; along <= length; along += 0.5) {
        const p = shape.getPointAtLength(along);
        points.push({ x: p.x, y: p.y, what });
      }
    }
    return { labels, points, width: svg.viewBox.baseVal.width, height: svg.viewBox.baseVal.height };
  });
}

/** Two labels with at least `gap` units between them, across or down. */
const apart = (one: Box, two: Box, gap: number) =>
  one.bottom + gap <= two.top || two.bottom + gap <= one.top || one.right + gap <= two.left || two.right + gap <= one.left;
const near = (box: Box, p: Point, margin: number) => p.x >= box.left - margin && p.x <= box.right + margin && p.y >= box.top - margin && p.y <= box.bottom + margin;
// Half the thickest stroke near a label, and a little more.
const CLEARANCE = 2.5;
// The least space between two labels, at every setting.
const LABEL_GAP = 4;

function checkPanel(where: string, g: Awaited<ReturnType<typeof geometry>>) {
  for (const box of g.labels) {
    expect(box.left >= -0.5 && box.top >= -0.5 && box.right <= g.width + 0.5 && box.bottom <= g.height + 0.5, `${where}: "${box.name}" is cut off`).toBe(true);
  }
  for (let i = 0; i < g.labels.length; i++) {
    for (let j = i + 1; j < g.labels.length; j++) {
      const [one, two] = [at(g.labels, i), at(g.labels, j)];
      expect(apart(one, two, LABEL_GAP), `${where}: "${one.name}" and "${two.name}" are less than ${LABEL_GAP} units apart`).toBe(true);
    }
  }
  for (const box of g.labels) {
    const touching = g.points.filter((p) => near(box, p, CLEARANCE));
    expect(touching.map((p) => p.what).slice(0, 1), `${where}: "${box.name}" touches a line`).toEqual([]);
  }
}

// Every pair of half-cells, both ways round, at the concentrations that give the widest and the
// narrowest labels and both directions of a concentration cell.
test('for every pair of half-cells, either way round, no text is cut off, no two labels come within 4 units, and no label meets a line', async ({ page }) => {
  test.setTimeout(600_000);
  const diagram = await openDiagram(page, PAGE, NAME);
  await page.evaluate(() => document.fonts.ready);
  let states = 0;
  for (const left of METALS) {
    for (const right of METALS) {
      for (const [leftExponent, rightExponent] of [
        [-3, -3],
        [0, 0],
        [-3, 0],
        [0, -3],
      ] as [Exponent, Exponent][]) {
        const s = { left, leftExponent, right, rightExponent };
        await setCell(diagram, s);
        checkPanel(`${where(s)}, the cell`, await geometry(cell(diagram)));
        checkPanel(`${where(s)}, the ladder`, await geometry(scales(diagram)));
        states += 1;
      }
    }
  }
  expect(states).toBe(144);
});

// The same check at the narrowest phone widths, where font hinting can change the boxes: a reduced set,
// with every metal on each side at least once, the widest labels both ways round and the concentration extremes.
for (const width of [320, 412]) {
  test(`at ${width} px wide, no text is cut off, no two labels come within 4 units, and no label meets a line`, async ({ page }) => {
    test.setTimeout(300_000);
    await page.setViewportSize({ width, height: 900 });
    const diagram = await openDiagram(page, PAGE, NAME);
    await page.evaluate(() => document.fonts.ready);
    const pairs: [MetalId, MetalId][] = [
      ...METALS.map((m, i): [MetalId, MetalId] => [m, at(METALS, (i + 1) % METALS.length)]),
      ['chromium', 'silver'],
      ['silver', 'chromium'],
      ['chromium', 'chromium'],
      ['silver', 'silver'],
    ];
    let states = 0;
    for (const [left, right] of pairs) {
      for (const [leftExponent, rightExponent] of [
        [-3, -3],
        [0, 0],
        [-3, 0],
        [0, -3],
      ] as [Exponent, Exponent][]) {
        const s = { left, leftExponent, right, rightExponent };
        await setCell(diagram, s);
        checkPanel(`${width} px, ${where(s)}, the cell`, await geometry(cell(diagram)));
        checkPanel(`${width} px, ${where(s)}, the ladder`, await geometry(scales(diagram)));
        states += 1;
      }
    }
    expect(states).toBe(40);
  });
}

test('the Q marker never meets a label, over every log Q the sliders reach', async ({ page }) => {
  test.setTimeout(300_000);
  const diagram = await openDiagram(page, PAGE, NAME);
  await page.evaluate(() => document.fonts.ready);
  const seen = new Set<number>();
  for (const [left, right] of [
    ['chromium', 'copper'],
    ['chromium', 'silver'],
    ['silver', 'silver'],
  ] as [MetalId, MetalId][]) {
    for (const leftExponent of EXPONENTS) {
      for (const rightExponent of EXPONENTS) {
        const s = { left, leftExponent, right, rightExponent };
        await setCell(diagram, s);
        seen.add(cellState(left, leftExponent, right, rightExponent).logQ);
        const { labels } = await geometry(scales(diagram));
        const dot = scales(diagram).locator('[data-q-marker]');
        const reach = (await numberOf(dot, 'r')) + Number.parseFloat(await dot.evaluate((element) => getComputedStyle(element).strokeWidth)) / 2;
        const center = { x: await numberOf(dot, 'cx'), y: await numberOf(dot, 'cy') };
        for (const box of labels) {
          const distance = Math.hypot(Math.max(box.left - center.x, 0, center.x - box.right), Math.max(box.top - center.y, 0, center.y - box.bottom));
          expect(distance, `${where(s)}: the marker touches "${box.name}"`).toBeGreaterThanOrEqual(reach + 1);
        }
      }
    }
  }
  // These three cells reach every whole log Q from -6 to 9 except -5
  // (2a - 3b, a - 3b and a - b with a and b from 0 down to -3).
  expect([...seen].sort((a, b) => a - b)).toEqual([-6, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
});

// A sign after the word ("anode: +", "cathode (−)") or before it ("+ electrode", "(−) cathode").
const SIGN_AFTER = /(electrode|anode|cathode)s?[\s:,;(]*[+−-]/i;
const SIGN_BEFORE = /[+−-][\s)]*(electrode|anode|cathode)/i;

test('no electrode, anode or cathode is given a sign anywhere in the diagram, at any arrangement', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  const figure = page.locator('[data-part="diagram"]', { has: diagram });
  for (const s of [
    { left: 'tin', leftExponent: 0, right: 'silver', rightExponent: 0 },
    { left: 'silver', leftExponent: -3, right: 'chromium', rightExponent: 0 },
    { left: 'cobalt', leftExponent: 0, right: 'cobalt', rightExponent: -3 },
    { left: 'cobalt', leftExponent: 0, right: 'cobalt', rightExponent: 0 },
  ] as Setting[]) {
    await setCell(diagram, s);
    const words = await figure.evaluate((element) => {
      const names = [...element.querySelectorAll('[aria-label]')].map((e) => {
        const name = e.getAttribute('aria-label');
        if (name === null) throw new Error('An element lost its aria-label.');
        return name;
      });
      return [element.textContent, ...names].join(' ');
    });
    expect(words, where(s)).not.toMatch(/\b(positive|negative)\b/i);
    expect(words, where(s)).not.toMatch(/terminal/i);
    expect(words, where(s)).not.toMatch(SIGN_AFTER);
    expect(words, where(s)).not.toMatch(SIGN_BEFORE);
    expect(words, where(s)).not.toMatch(/spontaneous|favorable|oxidizing agent|reducing agent/i);
  }
});

test('the sign patterns can fail: they match deliberately bad strings', () => {
  for (const bad of ['anode: +', 'cathode (−)', 'the cathode, − side', 'cathode (-)', 'electrode +', '+ electrode', '(−) cathode']) {
    expect(bad, bad).toMatch(new RegExp(`${SIGN_AFTER.source}|${SIGN_BEFORE.source}`, 'i'));
  }
  expect('the anode, Sn(s) → Sn²⁺(aq) + 2e⁻').not.toMatch(SIGN_AFTER);
});

// A nominal size: the font size in drawing units, times 320, over the drawing's width in units.
test("the drawings' text is 12 px or more when each drawing itself is shown 320 px wide", async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  for (const panel of [cell(diagram), scales(diagram)]) {
    const sizes = await drawing(panel).evaluate((svg) => {
      if (!(svg instanceof SVGSVGElement)) throw new Error('The drawing is not an SVG.');
      const unitsWide = svg.viewBox.baseVal.width;
      return [...svg.querySelectorAll('text, tspan')].map((text) => ({ text: text.textContent, pxAt320: (Number.parseFloat(getComputedStyle(text).fontSize) * 320) / unitsWide }));
    });
    expect(sizes.length).toBeGreaterThan(0);
    for (const size of sizes) expect(size.pxAt320, `"${size.text}"`).toBeGreaterThanOrEqual(12);
  }
});

for (const width of [1280, 680, 412]) {
  test(`on a ${width} px screen the drawn text is 12 px or larger`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const diagram = await openDiagram(page, PAGE, NAME);
    await page.evaluate(() => document.fonts.ready);
    for (const panel of [cell(diagram), scales(diagram)]) {
      const sizes = await drawing(panel).evaluate((svg) => {
        if (!(svg instanceof SVGSVGElement)) throw new Error('The drawing is not an SVG.');
        const scale = svg.getBoundingClientRect().width / svg.viewBox.baseVal.width;
        return [...svg.querySelectorAll('text, tspan')].map((text) => ({ text: text.textContent, px: Number.parseFloat(getComputedStyle(text).fontSize) * scale }));
      });
      for (const size of sizes) expect(size.px, `"${size.text}"`).toBeGreaterThanOrEqual(12);
    }
  });
}

for (const width of [1280, 412, 320]) {
  test(`at ${width} px the cell is above the ladder, each no wider than 22rem`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const diagram = await openDiagram(page, PAGE, NAME);
    const top = await cell(diagram).boundingBox();
    const bottom = await scales(diagram).boundingBox();
    if (!top || !bottom) throw new Error('A drawing has no bounding box.');
    expect(bottom.y, 'the ladder is below the cell').toBeGreaterThanOrEqual(top.y + top.height);
    expect(top.width).toBeLessThanOrEqual(22 * 16 + 1);
    expect(bottom.width).toBeLessThanOrEqual(22 * 16 + 1);
  });
}

for (const width of [1280, 680, 412, 320]) {
  test(`at ${width} px the order is the drawings, the left half-cell's controls, the right half-cell's, the readout, then the sentence about the flow`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const diagram = await openDiagram(page, PAGE, NAME);

    const parts = await Promise.all(
      [cell(diagram), scales(diagram), menu(diagram, 'left'), slider(diagram, 'left'), menu(diagram, 'right'), slider(diagram, 'right'), status(diagram), flow(diagram)].map((part) =>
        part.boundingBox(),
      ),
    );
    const [top, ladder, leftMenu, leftSlider, rightMenu, rightSlider, readoutBox, flowBox] = parts;
    if (!top || !ladder || !leftMenu || !leftSlider || !rightMenu || !rightSlider || !readoutBox || !flowBox) throw new Error('A part of the diagram has no box.');
    const drawingsBottom = ladder.y + ladder.height;
    for (const [name, part] of Object.entries({ leftMenu, leftSlider, rightMenu, rightSlider })) {
      expect(part.y, `the ${name} is under the drawings`).toBeGreaterThanOrEqual(drawingsBottom);
    }
    expect(leftSlider.y, 'the left slider is under the left menu').toBeGreaterThanOrEqual(leftMenu.y + leftMenu.height);
    expect(rightSlider.y, 'the right slider is under the right menu').toBeGreaterThanOrEqual(rightMenu.y + rightMenu.height);
    // On a wide screen the right half-cell's group shares the left one's row, farther right; on a narrow one it is under it.
    const leftBottom = leftSlider.y + leftSlider.height;
    const underLeft = rightMenu.y >= leftBottom;
    const sameRowFartherRight = rightMenu.x >= leftMenu.x + leftMenu.width && rightMenu.y < leftBottom;
    expect(underLeft || sameRowFartherRight, 'the right half-cell comes after the left').toBe(true);
    const controlsBottom = Math.max(leftBottom, rightSlider.y + rightSlider.height);
    expect(readoutBox.y, 'the readout is under the controls').toBeGreaterThanOrEqual(controlsBottom);
    expect(flowBox.y, 'the sentence about the flow is under the readout').toBeGreaterThanOrEqual(readoutBox.y + readoutBox.height);
  });
}

// A student changes a metal and watches the cell and the ladder. On a small phone the drawings and
// the first control must be on the screen together, with the diagram scrolled so that the cell's top
// is at the top.
test('at 320 × 568 the drawing and the first control are on the screen together', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  const diagram = await openDiagram(page, PAGE, NAME);
  await drawing(cell(diagram)).evaluate((element) => {
    window.scrollTo(0, element.getBoundingClientRect().top + window.scrollY - 8);
  });
  const parts = {
    cell: await drawing(cell(diagram)).boundingBox(),
    ladder: await drawing(scales(diagram)).boundingBox(),
    menu: await menu(diagram, 'left').boundingBox(),
  };
  for (const [name, part] of Object.entries(parts)) {
    if (!part) throw new Error(`The ${name} has no bounding box.`);
    expect(part.y, `the ${name} starts on the screen`).toBeGreaterThanOrEqual(0);
    expect(part.y + part.height, `the ${name} ends on the screen`).toBeLessThanOrEqual(568);
  }
});

for (const width of [1280, 680, 412, 390, 360, 320]) {
  test(`on a ${width} px screen nothing scrolls sideways and the controls stay inside the diagram`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    const diagram = await openDiagram(page, PAGE, NAME);
    // The longest readout of all 576 settings, found from the module.
    let longest = { s: { left: 'tin', leftExponent: 0, right: 'silver', rightExponent: 0 } as Setting, text: '' };
    for (const left of METALS) {
      for (const right of METALS) {
        for (const leftExponent of EXPONENTS) {
          for (const rightExponent of EXPONENTS) {
            const text = readout(left, leftExponent, right, rightExponent);
            if (text.length > longest.text.length) longest = { s: { left, leftExponent, right, rightExponent }, text };
          }
        }
      }
    }
    await setCell(diagram, longest.s);
    await page.evaluate(() => document.fonts.ready);
    const figure = page.locator('[data-part="diagram"]', { has: diagram });
    const measured = await figure.evaluate((element) => {
      const frame = element.getBoundingClientRect();
      const outside = [...element.querySelectorAll('svg, p, input, select, label, legend, fieldset, figcaption')]
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
  test(`the diagram has no accessibility violations in the ${theme} theme, at the start and with a cobalt concentration cell`, async ({ page }) => {
    await page.addInitScript((value) => localStorage.setItem('chemstudy:theme', value), theme);
    const diagram = await openDiagram(page, PAGE, NAME);
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    const violations = async () => {
      const results = await new AxeBuilder({ page }).include(`[data-diagram="${NAME}"]`).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      return results.violations.map((v) => `${v.id}: ${v.nodes.length} node(s) - ${v.help}`);
    };
    expect(await violations(), 'at the start').toEqual([]);
    await setCell(diagram, { left: 'cobalt', leftExponent: -3, right: 'cobalt', rightExponent: 0 });
    expect(await violations(), 'with a cobalt concentration cell').toEqual([]);
  });
}

test('in print the controls are hidden and the drawings, the readout and the sentence about the flow stay', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  await page.emulateMedia({ media: 'print' });

  await expect(diagram.locator('.diagram-controls')).toBeHidden();
  await expect(drawing(cell(diagram))).toBeVisible();
  await expect(drawing(scales(diagram))).toBeVisible();
  await expect(status(diagram)).toHaveText(START_READOUT);
  await expect(flow(diagram)).toBeVisible();
});

test('the caption says 25 °C, a potassium nitrate salt bridge, potentials tabulated to 0.01 V, and why E has a third decimal place', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  await expect(page.locator('[data-part="diagram"]', { has: diagram }).locator('> figcaption')).toHaveText(CAPTION);
});

test.describe('with JavaScript off', () => {
  test.use({ javaScriptEnabled: false });

  test('the cell, the ladder and the starting readout show, with no controls', async ({ page }) => {
    await expectStaticDiagram(page, PAGE, NAME, START_READOUT);

    const diagram = page.locator(`[data-diagram="${NAME}"]`);
    await expect(drawing(cell(diagram))).toBeVisible();
    await expect(drawing(scales(diagram))).toBeVisible();
    await expect(label(diagram, 'role-left')).toHaveText('anode: oxidation');
    await expect(label(diagram, 'role-right')).toHaveText('cathode: reduction');
    await expect(label(diagram, 'meter')).toHaveText('0.940 V');
    await expect(flow(diagram)).toBeVisible();
    const xFor = await qAxis(diagram);
    expectNear(await numberOf(scales(diagram).locator('[data-q-marker]'), 'cx'), xFor(0), 'the Q marker at Q = 1');
  });
});
