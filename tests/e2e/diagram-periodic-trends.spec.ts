import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator, type Page } from '@playwright/test';
import { expectStaticDiagram, openDiagram } from './diagram';

const PAGE = '/unit-1-atomic-structure/1-7-periodic-trends/';
const NAME = 'periodic-trends';

const START = 'Sulfur: atomic radius 105 pm, first ionization energy 1000 kJ/mol, electronegativity 2.6.';
const ARGON =
  'Argon: first ionization energy 1521 kJ/mol. No atomic radius or electronegativity is shown for a noble gas: both describe an atom in a bond.';

/**
 * Opens the diagram and waits for the fonts: a text box measured before they
 * load is the box of a fallback font.
 */
async function open(page: Page): Promise<Locator> {
  const diagram = await openDiagram(page, PAGE, NAME);
  await page.evaluate(() => document.fonts.ready);
  return diagram;
}

type PropertyName = 'radius' | 'ie1' | 'en';

// Written out apart from the module, from the plan's table: symbol, name,
// group, period, radius in pm, first ionization energy in kJ/mol and
// electronegativity, each as the text a cell shows ("" where none is shown).
const ROWS: readonly (readonly [string, string, number, number, string, string, string])[] = [
  ['H', 'Hydrogen', 1, 1, '31', '1312', '2.2'],
  ['He', 'Helium', 18, 1, '', '2372', ''],
  ['Li', 'Lithium', 1, 2, '128', '520', '1.0'],
  ['Be', 'Beryllium', 2, 2, '96', '900', '1.6'],
  ['B', 'Boron', 13, 2, '84', '801', '2.0'],
  ['C', 'Carbon', 14, 2, '76', '1086', '2.6'],
  ['N', 'Nitrogen', 15, 2, '71', '1402', '3.0'],
  ['O', 'Oxygen', 16, 2, '66', '1314', '3.4'],
  ['F', 'Fluorine', 17, 2, '57', '1681', '4.0'],
  ['Ne', 'Neon', 18, 2, '', '2081', ''],
  ['Na', 'Sodium', 1, 3, '166', '496', '0.9'],
  ['Mg', 'Magnesium', 2, 3, '141', '738', '1.3'],
  ['Al', 'Aluminum', 13, 3, '121', '578', '1.6'],
  ['Si', 'Silicon', 14, 3, '111', '787', '1.9'],
  ['P', 'Phosphorus', 15, 3, '107', '1012', '2.2'],
  ['S', 'Sulfur', 16, 3, '105', '1000', '2.6'],
  ['Cl', 'Chlorine', 17, 3, '102', '1251', '3.2'],
  ['Ar', 'Argon', 18, 3, '', '1521', ''],
  ['K', 'Potassium', 1, 4, '203', '419', '0.8'],
  ['Ca', 'Calcium', 2, 4, '176', '590', '1.0'],
  ['Ga', 'Gallium', 13, 4, '122', '579', '1.8'],
  ['Ge', 'Germanium', 14, 4, '120', '762', '2.0'],
  ['As', 'Arsenic', 15, 4, '119', '944', '2.2'],
  ['Se', 'Selenium', 16, 4, '120', '941', '2.6'],
  ['Br', 'Bromine', 17, 4, '120', '1140', '3.0'],
  ['Kr', 'Krypton', 18, 4, '', '1351', ''],
  ['Rb', 'Rubidium', 1, 5, '220', '403', '0.8'],
  ['Sr', 'Strontium', 2, 5, '195', '549', '1.0'],
  ['In', 'Indium', 13, 5, '142', '558', '1.8'],
  ['Sn', 'Tin', 14, 5, '139', '709', '2.0'],
  ['Sb', 'Antimony', 15, 5, '139', '831', '2.1'],
  ['Te', 'Tellurium', 16, 5, '138', '869', '2.1'],
  ['I', 'Iodine', 17, 5, '139', '1008', '2.7'],
  ['Xe', 'Xenon', 18, 5, '', '1170', ''],
];

interface Row {
  symbol: string;
  name: string;
  group: number;
  period: number;
  values: Record<PropertyName, string>;
}
const TABLE: readonly Row[] = ROWS.map(([symbol, name, group, period, radius, ie1, en]) => ({
  symbol,
  name,
  group,
  period,
  values: { radius, ie1, en },
}));
const GROUPS = [1, 2, 13, 14, 15, 16, 17, 18];
const LABELS: Record<PropertyName, string> = {
  radius: 'Atomic radius',
  ie1: 'First ionization energy',
  en: 'Electronegativity',
};
const UNITS: Record<PropertyName, string> = { radius: 'pm', ie1: 'kJ/mol', en: '' };
const PROPERTY_NAMES: readonly PropertyName[] = ['radius', 'ie1', 'en'];
const TICKS: Record<PropertyName, readonly string[]> = {
  radius: ['0', '50', '100', '150', '200', '250'],
  ie1: ['0', '500', '1000', '1500', '2000', '2500'],
  en: ['0', '1', '2', '3', '4'],
};
const AXIS_MAX: Record<PropertyName, number> = { radius: 250, ie1: 2500, en: 4 };
const AXIS_TITLES: Record<PropertyName, string> = {
  radius: 'atomic radius (pm)',
  ie1: 'first ionization energy (kJ/mol)',
  en: 'electronegativity',
};

function rowOf(symbol: string): Row {
  const found = TABLE.find((row) => row.symbol === symbol);
  if (!found) throw new Error(`The test table has no ${symbol}.`);
  return found;
}

/** The elements of a series with a value, in order, as the plan's table gives them. */
function expectedSeries(symbol: string, property: PropertyName, direction: 'period' | 'group'): Row[] {
  const start = rowOf(symbol);
  return TABLE.filter((row) => (direction === 'period' ? row.period === start.period : row.group === start.group)).filter(
    (row) => row.values[property] !== '',
  );
}

const heading = (property: PropertyName, symbol: string, direction: 'period' | 'group') => {
  const start = rowOf(symbol);
  return `${LABELS[property]} ${direction === 'period' ? `across period ${start.period}` : `down group ${start.group}`}`;
};

const tablePanel = (diagram: Locator) => diagram.locator('[data-panel="table"]');
const graphPanel = (diagram: Locator) => diagram.locator('[data-panel="graph"]');
const cell = (diagram: Locator, symbol: string) => tablePanel(diagram).locator(`[data-element="${symbol}"]`);
const cells = (diagram: Locator) => tablePanel(diagram).locator('[data-element]');
const points = (diagram: Locator) => graphPanel(diagram).locator('[data-point]');
const valueLabels = (diagram: Locator) => graphPanel(diagram).locator('[data-value-label]');
const symbolLabels = (diagram: Locator) => graphPanel(diagram).locator('[data-symbol-label]');
const graphTitle = (diagram: Locator) => graphPanel(diagram).locator('[data-title="graph"]');
const tableTitle = (diagram: Locator) => tablePanel(diagram).locator('[data-title="table"]');
const status = (diagram: Locator) => diagram.getByRole('status');
const elementSelect = (diagram: Locator) => diagram.getByRole('combobox', { name: 'Element' });
const propertyRadio = (diagram: Locator, property: PropertyName) =>
  diagram.getByRole('group', { name: 'Property' }).getByRole('radio', { name: LABELS[property] });
const trendRadio = (diagram: Locator, direction: 'period' | 'group') =>
  diagram.getByRole('group', { name: 'Show the trend' }).getByRole('radio', {
    name: direction === 'period' ? 'Across its period' : 'Down its group',
  });

/**
 * Chooses a property, and waits for the redraw: a radio is checked before the
 * drawing is updated, so being checked proves nothing. The graph's title
 * names the property, and the table's title does too.
 */
async function chooseProperty(diagram: Locator, property: PropertyName) {
  await propertyRadio(diagram, property).check();
  await expect(graphTitle(diagram)).toContainText(LABELS[property]);
  await expect(tableTitle(diagram)).toContainText(LABELS[property]);
}

/** Chooses a direction, and waits for the graph's title to say so. */
async function chooseDirection(diagram: Locator, direction: 'period' | 'group') {
  await trendRadio(diagram, direction).check();
  await expect(graphTitle(diagram)).toContainText(direction === 'period' ? 'across period' : 'down group');
}

/** Chooses an element from the menu, and waits for its readout. */
async function chooseElement(diagram: Locator, symbol: string) {
  await elementSelect(diagram).selectOption(symbol);
  await expect(status(diagram)).toContainText(`${rowOf(symbol).name}: `);
}

interface Box {
  name: string;
  left: number;
  right: number;
  top: number;
  bottom: number;
}

/** The boxes of drawn elements, in drawing units, each named by the attribute given. */
async function boxesOf(elements: Locator, nameAttribute: string): Promise<Box[]> {
  return elements.evaluateAll((nodes, attribute) => {
    return nodes.map((node) => {
      if (!(node instanceof SVGGraphicsElement)) throw new Error('Not a drawn element.');
      const box = node.getBBox();
      return {
        name: node.getAttribute(attribute) ?? node.textContent ?? '',
        left: box.x,
        right: box.x + box.width,
        top: box.y,
        bottom: box.y + box.height,
      };
    });
  }, nameAttribute);
}

const overlap = (a: Box, b: Box, margin: number) =>
  a.left < b.right + margin && b.left < a.right + margin && a.top < b.bottom + margin && b.top < a.bottom + margin;

async function numbersOf(elements: Locator, attribute: string): Promise<number[]> {
  return elements.evaluateAll((nodes, name) => {
    return nodes.map((node) => {
      const value = node.getAttribute(name);
      if (value === null || value === '') throw new Error(`An element has no ${name} attribute.`);
      return Number(value);
    });
  }, attribute);
}

/** What a sighted reader sees of an element: what is hidden for screen readers is left out. */
async function visibleText(element: Locator): Promise<string> {
  return element.evaluate((node) => {
    const copy = node.cloneNode(true);
    if (!(copy instanceof Element)) throw new Error('Not an element.');
    for (const hidden of copy.querySelectorAll('.visually-hidden')) hidden.remove();
    return (copy.textContent ?? '').replace(/\s+/g, ' ').trim();
  });
}

test('the diagram starts with first ionization energy, sulfur, across its period: its readout and eight points', async ({
  page,
}) => {
  const diagram = await open(page);

  await expect(status(diagram)).toHaveText(START);
  await expect(points(diagram)).toHaveCount(8);
  await expect(symbolLabels(diagram)).toHaveText(['Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar']);
  await expect(valueLabels(diagram)).toHaveText(['496', '738', '578', '787', '1012', '1000', '1251', '1521']);
  await expect(graphTitle(diagram)).toHaveText('First ionization energy across period 3');
  await expect(tableTitle(diagram)).toHaveText('First ionization energy (kJ/mol)');
  await expect(propertyRadio(diagram, 'ie1')).toBeChecked();
  await expect(trendRadio(diagram, 'period')).toBeChecked();
  await expect(elementSelect(diagram)).toHaveValue('S');
  await expect(cell(diagram, 'S')).toHaveAttribute('aria-current', 'true');
  await expect(cells(diagram).locator('xpath=self::*[@aria-current="true"]')).toHaveCount(1);
});

test('the wrapper says what the radius is and that measured values wobble around the trend', async ({ page }) => {
  const diagram = await open(page);

  await expect(page.locator('[data-part="diagram"]', { has: diagram }).locator('figcaption').last()).toHaveText(
    'Atomic radius here is the covalent radius, half the distance between two bonded atoms. Measured values wobble around the trend.',
  );
});

test('"Property" offers the three properties and "Show the trend" the two directions, and "Element" the 34 elements', async ({
  page,
}) => {
  const diagram = await open(page);

  await expect(diagram.getByRole('group', { name: 'Property' }).getByRole('radio')).toHaveCount(3);
  await expect(diagram.getByRole('group', { name: 'Show the trend' }).getByRole('radio')).toHaveCount(2);
  const options = elementSelect(diagram).locator('option');
  await expect(options).toHaveCount(34);
  await expect(options.first()).toHaveText('1 H, hydrogen');
  await expect(options.nth(15)).toHaveText('16 S, sulfur');
  await expect(options.last()).toHaveText('54 Xe, xenon');
});

for (const width of [1280, 412, 320]) {
  test(`on a ${width} px screen the controls sit directly under the drawings, above the readout, and no choice moves them`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    const diagram = await open(page);
    const order = async () =>
      diagram.evaluate((body) =>
        [...body.children].map((child) =>
          child.matches('.diagram-panels') ? 'drawings' : child.matches('.diagram-controls') ? 'controls' : child.matches('[role="status"]') ? 'readout' : 'other',
        ),
      );
    // The page can scroll as the diagram's content changes size, so measure from the top of the diagram.
    const offset = async () =>
      diagram.evaluate((body) => {
        const controls = body.querySelector('.diagram-controls');
        if (!controls) throw new Error('No controls.');
        return controls.getBoundingClientRect().top - body.getBoundingClientRect().top;
      });

    expect(await order()).toEqual(['drawings', 'controls', 'readout']);
    const before = await offset();
    // A longer readout, a shorter and a longer title for the graph and the table, an empty graph.
    await chooseElement(diagram, 'Ar');
    expect(await offset(), 'a longer readout').toBe(before);
    await chooseProperty(diagram, 'en');
    expect(await offset(), 'electronegativity').toBe(before);
    await chooseDirection(diagram, 'group');
    expect(await offset(), 'an empty graph').toBe(before);
    await chooseProperty(diagram, 'ie1');
    await chooseElement(diagram, 'H');
    expect(await offset(), 'two points, a longer title').toBe(before);
    await chooseProperty(diagram, 'radius');
    expect(await offset(), 'atomic radius').toBe(before);
  });
}

test('the table is a grid of eight columns, groups 1, 2 and 13 to 18, and five rows, one for each period', async ({ page }) => {
  const diagram = await open(page);

  const headers = tablePanel(diagram).locator('thead th');
  await expect(headers).toHaveCount(8);
  const texts: string[] = [];
  for (const header of await headers.all()) texts.push(await visibleText(header));
  expect(texts).toEqual(GROUPS.map(String));
  await expect(tablePanel(diagram).locator('tbody tr')).toHaveCount(5);
  await expect(cells(diagram)).toHaveCount(34);
});

test('each element sits in the column of its group and the row of its period, hydrogen in group 1 and helium in group 18', async ({
  page,
}) => {
  const diagram = await open(page);

  const positions = await cells(diagram).evaluateAll((buttons) =>
    buttons.map((button) => {
      const td = button.closest('td');
      const tr = td?.closest('tr');
      if (!td || !tr) throw new Error('A cell is not in a table row.');
      return {
        symbol: button.getAttribute('data-element'),
        column: [...tr.querySelectorAll('td')].indexOf(td),
        row: [...(tr.parentElement?.children ?? [])].indexOf(tr),
      };
    }),
  );

  expect(positions).toHaveLength(34);
  for (const position of positions) {
    const row = rowOf(position.symbol ?? '');
    expect(position, row.symbol).toEqual({ symbol: row.symbol, column: GROUPS.indexOf(row.group), row: row.period - 1 });
  }
  expect(rowOf('H').group).toBe(1);
  expect(rowOf('He').group).toBe(18);
  // Period 1 has an element in two of its eight columns: the other six cells are empty.
  const emptyInPeriod1 = await tablePanel(diagram)
    .locator('tbody tr')
    .first()
    .locator('td')
    .evaluateAll((tds) => tds.filter((td) => td.querySelector('[data-element]') === null).length);
  expect(emptyInPeriod1).toBe(6);
});

for (const property of PROPERTY_NAMES) {
  test(`with ${LABELS[property].toLowerCase()} chosen, every cell shows its symbol and its value, or a dash`, async ({ page }) => {
    const diagram = await open(page);
    if (property !== 'ie1') await chooseProperty(diagram, property);

    expect(TABLE, 'the test table has 34 elements').toHaveLength(34);
    for (const row of TABLE) {
      const expected = row.values[property] === '' ? '—' : row.values[property];
      expect(await visibleText(cell(diagram, row.symbol)), row.symbol).toBe(`${row.symbol} ${expected}`);
    }
    await expect(tableTitle(diagram)).toHaveText(UNITS[property] === '' ? LABELS[property] : `${LABELS[property]} (${UNITS[property]})`);
  });
}

test('each cell is a button kept out of the tab order, named by its element and value for a screen reader', async ({ page }) => {
  const diagram = await open(page);

  const tabindexes = await cells(diagram).evaluateAll((buttons) =>
    buttons.map((button) => [button.tagName, button.getAttribute('tabindex')]),
  );

  expect(tabindexes).toHaveLength(34);
  for (const entry of tabindexes) expect(entry).toEqual(['BUTTON', '-1']);
  await expect(cell(diagram, 'S')).toHaveAccessibleName('S 1000 (sulfur, 1000 kJ/mol)');
  await chooseProperty(diagram, 'radius');
  await expect(cell(diagram, 'Ar')).toHaveAccessibleName('Ar (argon, no value)');
  await expect(cell(diagram, 'S')).toHaveAccessibleName('S 105 (sulfur, 105 pm)');
});

test('a cell carries its shade level as a class, and a cell with no value carries none', async ({ page }) => {
  const diagram = await open(page);
  const shadeOf = async (symbol: string) =>
    (await cell(diagram, symbol).getAttribute('class'))?.split(' ').filter((name) => name.startsWith('trend-shade-')) ?? [];

  // First ionization energy: He the largest (2372) and Rb the smallest (403); sulfur is 30.3 percent of the way.
  expect(await shadeOf('He')).toEqual(['trend-shade-4']);
  expect(await shadeOf('Rb')).toEqual(['trend-shade-0']);
  expect(await shadeOf('S')).toEqual(['trend-shade-1']);
  await chooseProperty(diagram, 'radius');
  expect(await shadeOf('Rb')).toEqual(['trend-shade-4']);
  expect(await shadeOf('H')).toEqual(['trend-shade-0']);
  expect(await shadeOf('Ne')).toEqual([]);
  expect(await shadeOf('Ar')).toEqual([]);
});

test("the chosen element's cell has a heavy border, and the others a thin one", async ({ page }) => {
  const diagram = await open(page);

  const widthOf = async (symbol: string) =>
    cell(diagram, symbol).evaluate((button) => Number.parseFloat(getComputedStyle(button).borderTopWidth));

  expect(await widthOf('S')).toBeGreaterThanOrEqual(3);
  expect(await widthOf('Cl')).toBeLessThanOrEqual(1);
  await chooseElement(diagram, 'Cl');
  expect(await widthOf('Cl')).toBeGreaterThanOrEqual(3);
  expect(await widthOf('S')).toBeLessThanOrEqual(1);
});

/** Where the vertical axis puts a value, read from the drawn gridlines, not from the module. */
async function yAxisOf(diagram: Locator, property: PropertyName) {
  const lines = graphPanel(diagram).locator('[data-gridline]');
  const y0 = (await numbersOf(graphPanel(diagram).locator('[data-gridline="0"]'), 'y1'))[0];
  const yMax = (await numbersOf(graphPanel(diagram).locator(`[data-gridline="${AXIS_MAX[property]}"]`), 'y1'))[0];
  if (y0 === undefined || yMax === undefined) throw new Error('The graph has no gridline at 0 or at its maximum.');
  expect(await lines.evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-gridline')))).toEqual(TICKS[property]);
  return { y0, yOf: (value: number) => y0 + ((yMax - y0) * value) / AXIS_MAX[property] };
}

test('each point stands at its value on an axis that starts at 0, and the chosen element has the larger point', async ({
  page,
}) => {
  const diagram = await open(page);
  const axis = await yAxisOf(diagram, 'ie1');
  const expected = expectedSeries('S', 'ie1', 'period');

  const cx = await numbersOf(points(diagram), 'cx');
  const cy = await numbersOf(points(diagram), 'cy');
  const radii = await numbersOf(points(diagram), 'r');

  expect(expected).toHaveLength(8);
  expect(cy).toHaveLength(8);
  expected.forEach((row, index) => {
    expect(Math.abs((cy[index] ?? 0) - axis.yOf(Number(row.values.ie1))), `${row.symbol} stands at ${row.values.ie1}`).toBeLessThanOrEqual(0.15);
  });
  const gaps = cx.slice(1).map((x, i) => x - (cx[i] ?? 0));
  for (const gap of gaps) expect(gap, 'the points run to the right').toBeGreaterThan(0);
  for (const gap of gaps) expect(Math.abs(gap - (gaps[0] ?? 0)), 'evenly spaced').toBeLessThanOrEqual(0.15);
  const chosen = expected.findIndex((row) => row.symbol === 'S');
  radii.forEach((radius, index) => {
    if (index === chosen) return;
    expect(radii[chosen] ?? 0, `S against ${expected[index]?.symbol}`).toBeGreaterThan(radius + 0.5);
  });
  await expect(graphPanel(diagram).locator('[data-point][data-chosen="true"]')).toHaveCount(1);
  await expect(graphPanel(diagram).locator('[data-point="S"]')).toHaveAttribute('data-chosen', 'true');
});

test('the line joins the points, and each point is labeled with its symbol below the axis and its value above', async ({
  page,
}) => {
  const diagram = await open(page);
  const cx = await numbersOf(points(diagram), 'cx');
  const cy = await numbersOf(points(diagram), 'cy');
  const axisY = await yAxisOf(diagram, 'ie1');

  const vertices = (await graphPanel(diagram).locator('[data-series-line]').getAttribute('d'))
    ?.replace(/[A-Za-z]/g, ' ')
    .trim()
    .split(' ')
    .filter((part) => part !== '')
    .map(Number);
  const symbolBoxes = await boxesOf(symbolLabels(diagram), 'data-symbol-label');
  const valueBoxes = await boxesOf(valueLabels(diagram), 'data-value-label');

  expect(vertices).toHaveLength(16);
  cx.forEach((x, index) => {
    expect(Math.abs((vertices?.[index * 2] ?? Number.NaN) - x), `vertex ${index} x`).toBeLessThanOrEqual(0.15);
    expect(Math.abs((vertices?.[index * 2 + 1] ?? Number.NaN) - (cy[index] ?? 0)), `vertex ${index} y`).toBeLessThanOrEqual(0.15);
  });
  expect(symbolBoxes).toHaveLength(8);
  expect(valueBoxes).toHaveLength(8);
  symbolBoxes.forEach((box, index) => {
    expect(Math.abs((box.left + box.right) / 2 - (cx[index] ?? 0)), `${box.name}'s symbol is under its point`).toBeLessThanOrEqual(0.6);
    expect(box.top, `${box.name}'s symbol is below the axis`).toBeGreaterThanOrEqual(axisY.y0);
  });
  valueBoxes.forEach((box, index) => {
    expect(Math.abs((box.left + box.right) / 2 - (cx[index] ?? 0)), `${box.name} is over its point`).toBeLessThanOrEqual(0.6);
    expect(box.bottom, `${box.name} is above its point`).toBeLessThanOrEqual(cy[index] ?? 0);
  });
});

for (const property of PROPERTY_NAMES) {
  test(`the vertical axis for ${LABELS[property].toLowerCase()} starts at 0, runs to ${AXIS_MAX[property]} and is titled in lowercase`, async ({
    page,
  }) => {
    const diagram = await open(page);
    if (property !== 'ie1') await chooseProperty(diagram, property);

    await yAxisOf(diagram, property);

    await expect(graphPanel(diagram).locator('[data-tick-label-y]')).toHaveText(TICKS[property]);
    await expect(graphPanel(diagram).locator('[data-axis-label="y"]')).toHaveText(AXIS_TITLES[property]);
    await expect(graphPanel(diagram).locator('[data-axis-label="x"]')).toHaveText('in order of group');
  });
}

test('the horizontal axis says what order the elements are in', async ({ page }) => {
  const diagram = await open(page);

  await chooseDirection(diagram, 'group');

  await expect(graphPanel(diagram).locator('[data-axis-label="x"]')).toHaveText('in order of period');
});

test('choosing "Atomic radius" shows 105 in sulfur\'s cell, a dash in argon\'s and seven points', async ({ page }) => {
  const diagram = await open(page);

  await chooseProperty(diagram, 'radius');

  await expect(points(diagram)).toHaveCount(7);
  await expect(symbolLabels(diagram)).toHaveText(['Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl']);
  await expect(valueLabels(diagram)).toHaveText(['166', '141', '121', '111', '107', '105', '102']);
  expect(await visibleText(cell(diagram, 'S'))).toBe('S 105');
  expect(await visibleText(cell(diagram, 'Ar'))).toBe('Ar —');
  await expect(graphTitle(diagram)).toHaveText('Atomic radius across period 3');
  await expect(status(diagram)).toHaveText(START);
});

test('choosing "Electronegativity" shows 2.6 in sulfur\'s cell and keeps the zero of 1.0 and 4.0', async ({ page }) => {
  const diagram = await open(page);

  await chooseProperty(diagram, 'en');

  expect(await visibleText(cell(diagram, 'S'))).toBe('S 2.6');
  expect(await visibleText(cell(diagram, 'F'))).toBe('F 4.0');
  expect(await visibleText(cell(diagram, 'Li'))).toBe('Li 1.0');
  await expect(points(diagram)).toHaveCount(7);
  await expect(valueLabels(diagram)).toHaveText(['0.9', '1.3', '1.6', '1.9', '2.2', '2.6', '3.2']);
});

test('choosing "Down its group" gives four points, O to Te', async ({ page }) => {
  const diagram = await open(page);

  await chooseDirection(diagram, 'group');

  await expect(points(diagram)).toHaveCount(4);
  await expect(symbolLabels(diagram)).toHaveText(['O', 'S', 'Se', 'Te']);
  await expect(valueLabels(diagram)).toHaveText(['1314', '1000', '941', '869']);
  await expect(graphTitle(diagram)).toHaveText('First ionization energy down group 16');
  await expect(graphPanel(diagram).locator('[data-point="S"]')).toHaveAttribute('data-chosen', 'true');
});

test('choosing argon with electronegativity, down its group, gives the noble-gas readout and an empty graph with a note', async ({
  page,
}) => {
  const diagram = await open(page);

  await chooseElement(diagram, 'Ar');
  await chooseProperty(diagram, 'en');
  await chooseDirection(diagram, 'group');

  await expect(status(diagram)).toHaveText(ARGON);
  await expect(points(diagram)).toHaveCount(0);
  await expect(valueLabels(diagram)).toHaveCount(0);
  await expect(graphPanel(diagram).locator('[data-series-line]')).toHaveCount(0);
  await expect(graphPanel(diagram).locator('[data-no-values]')).toHaveText('No values to plot');
  await expect(graphPanel(diagram).getByRole('img')).toHaveAccessibleName(
    'Electronegativity down group 18: no values to plot, because none is shown for a noble gas.',
  );
  expect(await visibleText(cell(diagram, 'Ar'))).toBe('Ar —');
  // The axes are still drawn: the graph is empty, not missing.
  await expect(graphPanel(diagram).locator('[data-gridline]')).toHaveCount(5);
  // The note is drawn over a gridline (the one at 2, in the middle of the plot), so it has the halo too.
  const halo = await graphPanel(diagram)
    .locator('[data-no-values]')
    .evaluate((node) => {
      const style = getComputedStyle(node);
      return { paintOrder: style.paintOrder, strokeWidth: style.strokeWidth, stroke: style.stroke, card: getComputedStyle(node.closest('.diagram') ?? document.body).backgroundColor };
    });
  expect(halo.paintOrder.startsWith('stroke')).toBe(true);
  expect(halo.strokeWidth).toBe('3px');
  expect(halo.stroke).toBe(halo.card);
});

test('across its period, argon still has seven electronegativities to plot, none of them its own', async ({ page }) => {
  const diagram = await open(page);

  await chooseElement(diagram, 'Ar');
  await chooseProperty(diagram, 'en');

  await expect(points(diagram)).toHaveCount(7);
  await expect(graphPanel(diagram).locator('[data-no-values]')).toHaveCount(0);
  await expect(graphPanel(diagram).locator('[data-point][data-chosen="true"]')).toHaveCount(0);
  await expect(symbolLabels(diagram)).toHaveText(['Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl']);
});

test("pressing rubidium's cell chooses it in the menu too, and redraws the graph for period 5", async ({ page }) => {
  const diagram = await open(page);

  await cell(diagram, 'Rb').click();

  await expect(status(diagram)).toHaveText(
    'Rubidium: atomic radius 220 pm, first ionization energy 403 kJ/mol, electronegativity 0.8.',
  );
  await expect(elementSelect(diagram)).toHaveValue('Rb');
  await expect(cell(diagram, 'Rb')).toHaveAttribute('aria-current', 'true');
  await expect(cell(diagram, 'S')).not.toHaveAttribute('aria-current', 'true');
  await expect(graphTitle(diagram)).toHaveText('First ionization energy across period 5');
  await expect(points(diagram)).toHaveCount(8);
  await expect(symbolLabels(diagram)).toHaveText(['Rb', 'Sr', 'In', 'Sn', 'Sb', 'Te', 'I', 'Xe']);
  await expect(graphPanel(diagram).locator('[data-point="Rb"]')).toHaveAttribute('data-chosen', 'true');
});

test("choosing an element from the menu moves the heavy border to its cell", async ({ page }) => {
  const diagram = await open(page);

  await chooseElement(diagram, 'Kr');

  await expect(cell(diagram, 'Kr')).toHaveAttribute('aria-current', 'true');
  await expect(cell(diagram, 'S')).not.toHaveAttribute('aria-current', 'true');
  await expect(graphTitle(diagram)).toHaveText('First ionization energy across period 4');
  await expect(points(diagram)).toHaveCount(8);
});

test('the element menu works from the keyboard: End gives xenon, Home gives hydrogen', async ({ page }) => {
  const diagram = await open(page);

  await elementSelect(diagram).focus();
  await page.keyboard.press('End');
  await expect(elementSelect(diagram)).toHaveValue('Xe');
  await expect(status(diagram)).toContainText('Xenon: first ionization energy 1170 kJ/mol.');
  await expect(graphTitle(diagram)).toHaveText('First ionization energy across period 5');
  await page.keyboard.press('Home');

  await expect(elementSelect(diagram)).toHaveValue('H');
  await expect(status(diagram)).toHaveText(
    'Hydrogen: atomic radius 31 pm, first ionization energy 1312 kJ/mol, electronegativity 2.2.',
  );
  await expect(points(diagram)).toHaveCount(2);
  await expect(symbolLabels(diagram)).toHaveText(['H', 'He']);
});

test('the radio buttons work from the keyboard, and Tab goes from the property to the menu to the trend, never to a cell', async ({
  page,
}) => {
  const diagram = await open(page);

  await propertyRadio(diagram, 'ie1').focus();
  await page.keyboard.press('ArrowLeft');
  await expect(graphTitle(diagram)).toHaveText('Atomic radius across period 3');
  await expect(propertyRadio(diagram, 'radius')).toBeChecked();
  await page.keyboard.press('Tab');
  await expect(elementSelect(diagram)).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(trendRadio(diagram, 'period')).toBeFocused();
  await page.keyboard.press('ArrowRight');

  await expect(trendRadio(diagram, 'group')).toBeChecked();
  await expect(graphTitle(diagram)).toHaveText('Atomic radius down group 16');
  await expect(points(diagram)).toHaveCount(4);
});

test('the graph has a name that lists every value, in order, and the table has a name for a screen reader', async ({ page }) => {
  const diagram = await open(page);

  await expect(graphPanel(diagram).getByRole('img')).toHaveAccessibleName(
    'First ionization energy across period 3, in kJ/mol: Na 496, Mg 738, Al 578, Si 787, P 1012, S 1000, Cl 1251, Ar 1521.',
  );
  await chooseDirection(diagram, 'group');
  await chooseProperty(diagram, 'en');
  await expect(graphPanel(diagram).getByRole('img')).toHaveAccessibleName(
    'Electronegativity down group 16: O 3.4, S 2.6, Se 2.6, Te 2.1.',
  );
  await expect(tablePanel(diagram).locator('table')).toHaveAccessibleName(/^Electronegativity of the main-group elements of periods 1 to 5/);
});

/**
 * Whether a straight segment passes through a box: sampled finely, which is
 * enough for a segment a few dozen units long and a box a few units wide.
 */
function crosses(from: { x: number; y: number }, to: { x: number; y: number }, box: Box): boolean {
  for (let step = 0; step <= 200; step++) {
    const t = step / 200;
    const x = from.x + (to.x - from.x) * t;
    const y = from.y + (to.y - from.y) * t;
    if (x > box.left && x < box.right && y > box.top && y < box.bottom) return true;
  }
  return false;
}

test('a label that the line really does cross carries a halo in the card color, like every label near a mark', async ({ page }) => {
  const diagram = await open(page);
  // Down group 1, the line from hydrogen to lithium falls 792 kJ/mol over one gap and passes over lithium's value.
  await chooseElement(diagram, 'Li');
  await chooseDirection(diagram, 'group');
  await expect(points(diagram)).toHaveCount(5);

  const centers = await points(diagram).evaluateAll((nodes) =>
    nodes.map((node) => ({ x: Number(node.getAttribute('cx')), y: Number(node.getAttribute('cy')) })),
  );
  const labels = await boxesOf(valueLabels(diagram), 'data-value-label');
  const crossed: string[] = [];
  labels.forEach((label) => {
    // The text's box includes room above and below the digits: shrink it to the digits.
    const digits = { ...label, top: label.top + 2, bottom: label.bottom - 2 };
    centers.slice(1).forEach((to, index) => {
      const from = centers[index];
      if (from && crosses(from, to, digits)) crossed.push(`${label.name} crossed by the segment ending at point ${index + 1}`);
    });
  });
  const halos = await graphPanel(diagram)
    .locator('[data-value-label], [data-symbol-label]')
    .evaluateAll((nodes) =>
      nodes.map((node) => {
        const style = getComputedStyle(node);
        const card = getComputedStyle(node.closest('.diagram') ?? document.body).backgroundColor;
        return { paintOrder: style.paintOrder, stroke: style.stroke, strokeWidth: style.strokeWidth, card };
      }),
    );

  expect(crossed.length, `the line crosses a label here: ${crossed.join('; ')}`).toBeGreaterThanOrEqual(1);
  expect(halos).toHaveLength(10);
  for (const halo of halos) {
    expect(halo.paintOrder.startsWith('stroke')).toBe(true);
    expect(halo.strokeWidth).toBe('3px');
    expect(halo.stroke).toBe(halo.card);
  }
});

const PERIOD_REPRESENTATIVES = ['H', 'Li', 'Na', 'K', 'Rb'];
const GROUP_REPRESENTATIVES = ['Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'He'];

test('for every property and series, no label meets another label or a mark that is not its own, and none is cut off', async ({
  page,
}) => {
  const diagram = await open(page);
  const states: { symbol: string; direction: 'period' | 'group' }[] = [
    ...PERIOD_REPRESENTATIVES.map((symbol) => ({ symbol, direction: 'period' as const })),
    ...GROUP_REPRESENTATIVES.map((symbol) => ({ symbol, direction: 'group' as const })),
  ];

  // The loops below would pass on an empty list: say how many states there are, and how many drawn.
  expect(states).toHaveLength(13);
  let drawnStates = 0;
  for (const property of PROPERTY_NAMES) {
    await chooseProperty(diagram, property);
    for (const { symbol, direction } of states) {
      await chooseDirection(diagram, direction);
      await elementSelect(diagram).selectOption(symbol);
      await expect(graphTitle(diagram)).toHaveText(heading(property, symbol, direction));
      const expected = expectedSeries(symbol, property, direction);
      const where = `${property}, ${symbol}, ${direction}`;
      await expect(points(diagram)).toHaveCount(expected.length);
      if (expected.length === 0) continue;
      drawnStates += 1;

      const values = await boxesOf(valueLabels(diagram), 'data-value-label');
      const symbols = await boxesOf(symbolLabels(diagram), 'data-symbol-label');
      const marks = await points(diagram).evaluateAll((nodes) =>
        nodes.map((node) => ({
          name: node.getAttribute('data-point') ?? '',
          left: Number(node.getAttribute('cx')) - Number(node.getAttribute('r')),
          right: Number(node.getAttribute('cx')) + Number(node.getAttribute('r')),
          top: Number(node.getAttribute('cy')) - Number(node.getAttribute('r')),
          bottom: Number(node.getAttribute('cy')) + Number(node.getAttribute('r')),
        })),
      );
      const title = await boxesOf(graphPanel(diagram).locator('[data-axis-label="y"]'), 'data-axis-label');

      expect(values, `${where}: one value label for each point`).toHaveLength(expected.length);
      expect(symbols, `${where}: one symbol label for each point`).toHaveLength(expected.length);
      values.forEach((label, index) => {
        values.slice(index + 1).forEach((other) => {
          expect(overlap(label, other, 0.5), `${where}: value ${label.name} meets value ${other.name}`).toBe(false);
        });
        for (const mark of marks) {
          if (mark.name !== label.name) expect(overlap(label, mark, 0.5), `${where}: value ${label.name} meets the point of ${mark.name}`).toBe(false);
        }
        for (const axisTitle of title) expect(overlap(label, axisTitle, 0.5), `${where}: value ${label.name} meets the axis title`).toBe(false);
      });
      symbols.forEach((label, index) => {
        symbols.slice(index + 1).forEach((other) => {
          expect(overlap(label, other, 0.5), `${where}: symbol ${label.name} meets symbol ${other.name}`).toBe(false);
        });
      });
      const cutOff = await graphPanel(diagram).locator('svg').evaluate((svg) => {
        const frame = svg.getBoundingClientRect();
        return [...svg.querySelectorAll('text')]
          .filter((text) => {
            const box = text.getBoundingClientRect();
            return box.left < frame.left - 0.5 || box.right > frame.right + 0.5 || box.top < frame.top - 0.5 || box.bottom > frame.bottom + 0.5;
          })
          .map((text) => text.textContent);
      });
      expect(cutOff, `${where}: text outside the drawing`).toEqual([]);
    }
  }
  // 13 states for each of 3 properties, except that no radius or electronegativity is plotted down group 18 (He): 39 - 2.
  expect(drawnStates).toBe(37);
});

/**
 * Every colour as it is drawn: a canvas turns any CSS colour into pixels, so
 * the contrast is computed from what the eye gets and not from a format.
 */
async function worstContrast(diagram: Locator): Promise<{ ratio: number; where: string }[]> {
  return cells(diagram).evaluateAll((buttons) => {
    const context = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
    if (!context) throw new Error('No canvas to read colors with.');
    const channels = (css: string) => {
      context.clearRect(0, 0, 1, 1);
      context.fillStyle = '#000000';
      context.fillStyle = css;
      context.fillRect(0, 0, 1, 1);
      const [r = 0, g = 0, b = 0, a = 255] = context.getImageData(0, 0, 1, 1).data;
      if (a !== 255) throw new Error(`The color ${css} is not opaque.`);
      return [r, g, b].map((value) => {
        const unit = value / 255;
        return unit <= 0.03928 ? unit / 12.92 : ((unit + 0.055) / 1.055) ** 2.4;
      });
    };
    const luminance = (css: string) => {
      const [r = 0, g = 0, b = 0] = channels(css);
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    return buttons.flatMap((button) => {
      const background = getComputedStyle(button).backgroundColor;
      return [...button.querySelectorAll('.trend-symbol, .trend-value')].map((text) => {
        const a = luminance(getComputedStyle(text).color);
        const b = luminance(background);
        return {
          ratio: (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05),
          where: `${button.getAttribute('data-element')} ${text.className}`,
        };
      });
    });
  });
}

for (const theme of ['light', 'dark'] as const) {
  test(`the text in every cell, on every shade, has a contrast of at least 4.5 to 1 in the ${theme} theme`, async ({ page }) => {
    await page.addInitScript((value) => localStorage.setItem('chemstudy:theme', value), theme);
    const diagram = await open(page);
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);

    for (const property of PROPERTY_NAMES) {
      await chooseProperty(diagram, property);
      const ratios = await worstContrast(diagram);

      // Two texts, symbol and value, in each of 34 cells.
      expect(ratios, property).toHaveLength(68);
      for (const { ratio, where } of ratios) expect(ratio, `${property}: ${where}`).toBeGreaterThanOrEqual(4.5);
    }
  });
}

test('the five shades are five different colors, in order, for each property', async ({ page }) => {
  const diagram = await open(page);

  for (const property of PROPERTY_NAMES) {
    await chooseProperty(diagram, property);
    const byLevel = await cells(diagram).evaluateAll((buttons) => {
      const colors: Record<string, string> = {};
      for (const button of buttons) {
        const level = [...button.classList].find((name) => name.startsWith('trend-shade-'));
        if (level) colors[level] = getComputedStyle(button).backgroundColor;
      }
      return colors;
    });

    expect(Object.keys(byLevel).sort(), property).toEqual(['trend-shade-0', 'trend-shade-1', 'trend-shade-2', 'trend-shade-3', 'trend-shade-4']);
    expect(new Set(Object.values(byLevel)).size, `${property}: five distinct colors`).toBe(5);
  }
});

// A nominal size, not a rendered one: the font size in drawing units, times
// 320, over the drawing's width in units. That is the size of the text when
// the drawing itself is shown 320 px wide, the ratio of the site's figures
// (18 on 480).
test("the drawing's text is 12 px or more when the drawing itself is shown 320 px wide, the ratio of the site's figures", async ({
  page,
}) => {
  const diagram = await open(page);

  const sizes = await graphPanel(diagram).locator('svg').evaluate((svg) => {
    if (!(svg instanceof SVGSVGElement)) throw new Error('The drawing is not an SVG.');
    const unitsWide = svg.viewBox.baseVal.width;
    return [...svg.querySelectorAll('text, tspan')].map((text) => ({
      text: text.textContent,
      pxAt320: (Number.parseFloat(getComputedStyle(text).fontSize) * 320) / unitsWide,
    }));
  });

  // 6 ticks, 8 symbols, 8 values, two axis titles.
  expect(sizes.length).toBeGreaterThanOrEqual(24);
  for (const size of sizes) expect(size.pxAt320, `"${size.text}"`).toBeGreaterThanOrEqual(12);
});

for (const width of [1280, 412]) {
  test(`on a ${width} px screen every piece of text in the diagram is drawn 12 px or larger, the table's too`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const diagram = await open(page);
    await page.evaluate(() => document.fonts.ready);

    const drawn = await graphPanel(diagram).locator('svg').evaluate((svg) => {
      if (!(svg instanceof SVGSVGElement)) throw new Error('The drawing is not an SVG.');
      const scale = svg.getBoundingClientRect().width / svg.viewBox.baseVal.width;
      return [...svg.querySelectorAll('text, tspan')].map((text) => ({
        text: text.textContent,
        px: Number.parseFloat(getComputedStyle(text).fontSize) * scale,
      }));
    });
    const around = await diagram.evaluate((body) => {
      const sizes: { text: string; px: number }[] = [];
      for (const element of body.querySelectorAll('p, caption, figcaption, th, td, label, legend, span, option, select, button')) {
        if (element.closest('svg') || element.closest('.visually-hidden')) continue;
        const own = [...element.childNodes].some((node) => node.nodeType === Node.TEXT_NODE && (node.textContent ?? '').trim() !== '');
        if (own) sizes.push({ text: (element.textContent ?? '').trim().slice(0, 30), px: Number.parseFloat(getComputedStyle(element).fontSize) });
      }
      return sizes;
    });

    expect(drawn.length).toBeGreaterThanOrEqual(24);
    for (const size of drawn) expect(size.px, `"${size.text}"`).toBeGreaterThanOrEqual(12);
    // The symbols and values of 34 cells, the group numbers, the titles and the controls.
    expect(around.length).toBeGreaterThanOrEqual(60);
    for (const size of around) expect(size.px, `"${size.text}"`).toBeGreaterThanOrEqual(12);
  });
}

test('on a wide screen the table and the graph stop at 22rem wide and sit in the middle of the diagram', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  const diagram = await open(page);

  const measured = await diagram.evaluate((body) => {
    const frame = body.getBoundingClientRect();
    const rem = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
    return [...body.querySelectorAll('[data-panel]')].map((panel) => {
      const box = panel.getBoundingClientRect();
      return { rems: box.width / rem, spaceLeft: box.left - frame.left, spaceRight: frame.right - box.right };
    });
  });

  expect(measured).toHaveLength(2);
  for (const panel of measured) {
    expect(Math.abs(panel.rems - 22)).toBeLessThanOrEqual(0.05);
    expect(Math.abs(panel.spaceLeft - panel.spaceRight)).toBeLessThanOrEqual(1);
  }
});

for (const width of [1280, 412, 390, 360, 320]) {
  test(`on a ${width} px screen nothing scrolls sideways, the table's numbers fit their cells and the longest readout shows`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 800 });
    const diagram = await open(page);
    // Argon has the longest readout, and ionization energies have the widest numbers (four digits).
    await chooseElement(diagram, 'Ar');
    await expect(status(diagram)).toHaveText(ARGON);
    await page.evaluate(() => document.fonts.ready);
    const figure = page.locator('[data-part="diagram"]', { has: diagram });

    const measured = await figure.evaluate((element) => {
      const frame = element.getBoundingClientRect();
      const outside = [...element.querySelectorAll('svg, table, p, select, label, th, td, button, caption, figcaption')]
        .filter((part) => {
          if (part.closest('.visually-hidden')) return false;
          const box = part.getBoundingClientRect();
          return box.left < frame.left - 0.5 || box.right > frame.right + 0.5;
        })
        .map((part) => part.outerHTML.slice(0, 80));
      const clipped = [...element.querySelectorAll('[data-element]')]
        .filter((button) => button.scrollWidth > button.clientWidth + 0.5)
        .map((button) => `${button.getAttribute('data-element')}: ${button.scrollWidth} > ${button.clientWidth}`);
      return {
        overflow: element.scrollWidth - element.clientWidth,
        pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        outside,
        clipped,
        cellCount: element.querySelectorAll('[data-element]').length,
        left: frame.left,
        right: frame.right,
      };
    });

    expect(measured.cellCount).toBe(34);
    expect(measured.overflow, 'sideways scrolling inside the diagram').toBeLessThanOrEqual(0);
    expect(measured.pageOverflow, 'sideways scrolling of the page').toBeLessThanOrEqual(0);
    expect(measured.outside, 'parts sticking out of the diagram').toEqual([]);
    expect(measured.clipped, 'numbers wider than their cell').toEqual([]);
    expect(measured.left).toBeGreaterThanOrEqual(0);
    expect(measured.right).toBeLessThanOrEqual(width);
  });
}

for (const theme of ['light', 'dark'] as const) {
  test(`the diagram has no accessibility violations in the ${theme} theme, at the start and in two other states`, async ({
    page,
  }) => {
    await page.addInitScript((value) => localStorage.setItem('chemstudy:theme', value), theme);
    const diagram = await open(page);
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    const violations = async () => {
      const results = await new AxeBuilder({ page })
        .include(`[data-diagram="${NAME}"]`)
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();
      return results.violations.map((v) => `${v.id}: ${v.nodes.length} node(s) - ${v.help}`);
    };

    expect(await violations(), 'at the start').toEqual([]);
    await chooseProperty(diagram, 'radius');
    await chooseDirection(diagram, 'group');
    expect(await violations(), 'atomic radius down group 16').toEqual([]);
    await chooseElement(diagram, 'Ar');
    await chooseProperty(diagram, 'en');
    await expect(graphPanel(diagram).locator('[data-no-values]')).toBeVisible();
    expect(await violations(), 'the empty graph').toEqual([]);
  });
}

test('in print the controls are gone and the table, the graph and the readout stay', async ({ page }) => {
  const diagram = await open(page);
  await page.emulateMedia({ media: 'print' });

  await expect(diagram.locator('.diagram-controls')).toBeHidden();
  await expect(tablePanel(diagram).locator('table')).toBeVisible();
  await expect(graphPanel(diagram).locator('svg')).toBeVisible();
  await expect(status(diagram)).toBeVisible();
});

test.describe('with JavaScript off', () => {
  test.use({ javaScriptEnabled: false });

  test('the table, the graph and the starting readout show, with no controls', async ({ page }) => {
    await expectStaticDiagram(page, PAGE, NAME, START);

    const diagram = page.locator(`[data-diagram="${NAME}"]`);
    await expect(tablePanel(diagram).locator('table')).toBeVisible();
    await expect(cells(diagram)).toHaveCount(34);
    expect(await visibleText(cell(diagram, 'S'))).toBe('S 1000');
    await expect(cell(diagram, 'S')).toHaveAttribute('aria-current', 'true');
    await expect(graphPanel(diagram).getByRole('img')).toBeVisible();
    await expect(points(diagram)).toHaveCount(8);
    await expect(valueLabels(diagram)).toHaveText(['496', '738', '578', '787', '1012', '1000', '1251', '1521']);
    await expect(elementSelect(diagram)).toBeHidden();
  });
});
