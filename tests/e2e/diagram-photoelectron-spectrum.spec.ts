import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator, type Page } from '@playwright/test';
import { expectStaticDiagram, openDiagram } from './diagram';

const PAGE = '/unit-1-atomic-structure/1-6-photoelectron-spectroscopy/';
const NAME = 'photoelectron-spectrum';

const START =
  'Silicon, 1s² 2s² 2p⁶ 3s² 3p²: five peaks. The 1s electrons are held most strongly, at 178 MJ/mol. ' +
  'The 3p electrons are the easiest to remove, at 0.79 MJ/mol.';

/**
 * Opens the diagram and waits for the fonts: a text box measured before they
 * load is the box of a fallback font.
 */
async function open(page: Page): Promise<Locator> {
  const diagram = await openDiagram(page, PAGE, NAME);
  await page.evaluate(() => document.fonts.ready);
  return diagram;
}

/** How many peaks each atom has, written out from the plan's table (H to Ca). */
const PEAK_COUNTS: Record<string, number> = {
  H: 1, He: 1, Li: 2, Be: 2, B: 3, C: 3, N: 3, O: 3, F: 3, Ne: 3, Na: 4, Mg: 4,
  Al: 5, Si: 5, P: 5, S: 5, Cl: 5, Ar: 5, K: 6, Ca: 6,
};

const panel = (diagram: Locator) => diagram.locator('[data-panel="spectrum"]');
const peaks = (diagram: Locator) => panel(diagram).locator('[data-peak]');
const peakLabels = (diagram: Locator) => panel(diagram).locator('[data-peak-label]');
const status = (diagram: Locator) => diagram.getByRole('status');
const table = (diagram: Locator) => diagram.locator('[data-table="peaks"]');

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

async function numberOf(element: Locator, attribute: string): Promise<number> {
  const value = await element.getAttribute(attribute);
  if (value === null || value === '') throw new Error(`An element has no ${attribute} attribute.`);
  return Number(value);
}

/** Where the axes put things, read from the drawn ticks and lines, not from the module. */
async function axesOf(diagram: Locator) {
  const x1000 = await numberOf(panel(diagram).locator('[data-tick-x="1000"]'), 'x1');
  const x01 = await numberOf(panel(diagram).locator('[data-tick-x="0.1"]'), 'x1');
  const y2 = await numberOf(panel(diagram).locator('[data-gridline="2"]'), 'y1');
  const y6 = await numberOf(panel(diagram).locator('[data-gridline="6"]'), 'y1');
  return {
    /** Where an energy in MJ/mol falls: 1000 at the left edge, 0.1 at the right, logarithmic. */
    xOf: (energy: number) => x1000 + ((3 - Math.log10(energy)) / 4) * (x01 - x1000),
    // Heights are proportional to electrons, so the line at 2 and the line at 6 fix the baseline.
    baseline: y2 + (y2 - y6) / 2,
    y2,
    y6,
  };
}

const rowsOf = (diagram: Locator) => table(diagram).locator('tbody tr');

/** The text of each cell as a sighted reader has it: what is hidden for screen readers is left out. */
async function cellTexts(row: Locator): Promise<string[]> {
  return row.locator('th, td').evaluateAll((cells) =>
    cells.map((cell) => {
      const copy = cell.cloneNode(true);
      if (!(copy instanceof Element)) throw new Error('A cell is not an element.');
      for (const hidden of copy.querySelectorAll('.visually-hidden')) hidden.remove();
      return (copy.textContent ?? '').trim();
    }),
  );
}

test('the diagram starts with silicon, compared with nothing: its readout and its five peaks', async ({ page }) => {
  const diagram = await open(page);

  await expect(status(diagram)).toHaveText(START);
  await expect(peaks(diagram)).toHaveCount(5);
  await expect(peakLabels(diagram)).toHaveText(['1s', '2s', '2p', '3s', '3p']);
  await expect(diagram.locator('[data-compared-peak]')).toHaveCount(0);
});

test('the horizontal axis is binding energy in MJ/mol on a log scale, larger values at the left', async ({ page }) => {
  const diagram = await open(page);

  const ticks = panel(diagram).locator('[data-tick-x]');
  await expect(ticks).toHaveCount(5);
  expect(await ticks.evaluateAll((lines) => lines.map((tick) => tick.getAttribute('data-tick-x')))).toEqual([
    '1000',
    '100',
    '10',
    '1',
    '0.1',
  ]);
  const xs = await ticks.evaluateAll((lines) => lines.map((tick) => Number(tick.getAttribute('x1'))));
  const gaps = xs.slice(1).map((x, i) => x - (xs[i] ?? 0));
  for (const gap of gaps) expect(gap, 'each decade is as wide as the next, and the values fall to the right').toBeGreaterThan(0);
  for (const gap of gaps) expect(Math.abs(gap - (gaps[0] ?? 0))).toBeLessThanOrEqual(0.15);
  await expect(panel(diagram).locator('[data-tick-label-x]')).toHaveText(['1000', '100', '10', '1', '0.1']);
  await expect(panel(diagram).locator('[data-axis-label="x"]')).toHaveText('binding energy (MJ/mol)');
});

test('the vertical axis is the relative number of electrons, with light lines at 2, 4 and 6', async ({ page }) => {
  const diagram = await open(page);

  await expect(panel(diagram).locator('[data-axis-label="y"]')).toHaveText('relative number of electrons');
  const lines = panel(diagram).locator('[data-gridline]');
  await expect(lines).toHaveCount(3);
  expect(await lines.evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-gridline')))).toEqual(['2', '4', '6']);
  await expect(panel(diagram).locator('[data-tick-label-y]')).toHaveText(['2', '4', '6']);
  const [y2, y4, y6] = await lines.evaluateAll((nodes) => nodes.map((node) => Number(node.getAttribute('y1'))));
  expect(y6, 'six is above four, which is above two').toBeLessThan(y4 ?? 0);
  expect(y4).toBeLessThan(y2 ?? 0);
  expect(Math.abs((y2 ?? 0) - (y4 ?? 0) - ((y4 ?? 0) - (y6 ?? 0)))).toBeLessThanOrEqual(0.15);
});

test('each peak sits at its binding energy and is as tall as its electrons', async ({ page }) => {
  const diagram = await open(page);
  const axes = await axesOf(diagram);
  // Silicon: subshell, electrons, binding energy in MJ/mol, written out from the plan's table.
  const expected = [
    ['1s', 2, 178],
    ['2s', 2, 15.1],
    ['2p', 6, 10.3],
    ['3s', 2, 1.46],
    ['3p', 2, 0.79],
  ] as const;

  const boxes = await boxesOf(peaks(diagram), 'data-peak');

  expect(boxes.map((box) => box.name)).toEqual(expected.map(([name]) => name));
  boxes.forEach((box, index) => {
    const [name, electrons, energy] = expected[index] ?? [];
    if (name === undefined || electrons === undefined || energy === undefined) throw new Error('Missing a peak.');
    // Within the rounding of a drawn position, a tenth of a unit, plus a hair.
    expect(Math.abs((box.left + box.right) / 2 - axes.xOf(energy)), `${name} is at ${energy} MJ/mol`).toBeLessThanOrEqual(0.15);
    expect(Math.abs(box.bottom - axes.baseline), `${name} stands on the axis`).toBeLessThanOrEqual(0.15);
    const height = box.bottom - box.top;
    const sixHeight = axes.baseline - axes.y6;
    expect(Math.abs(height / sixHeight - electrons / 6), `${name} is ${electrons} of 6 electrons tall`).toBeLessThanOrEqual(0.005);
  });
});

test('every peak has one width, narrower than the gap between neighboring peaks', async ({ page }) => {
  const diagram = await open(page);

  const boxes = await boxesOf(peaks(diagram), 'data-peak');

  const widths = boxes.map((box) => box.right - box.left);
  for (const width of widths) expect(Math.abs(width - (widths[0] ?? 0))).toBeLessThanOrEqual(0.05);
  boxes.slice(1).forEach((box, index) => {
    const before = boxes[index];
    if (!before) throw new Error('Missing a peak.');
    expect(box.left, `${box.name} does not touch ${before.name}`).toBeGreaterThan(before.right);
  });
});

test("each label is the peak's subshell, above its peak", async ({ page }) => {
  const diagram = await open(page);

  const labels = await boxesOf(peakLabels(diagram), 'data-peak-label');
  const boxes = await boxesOf(peaks(diagram), 'data-peak');

  expect(labels, 'five labels').toHaveLength(5);
  expect(boxes, 'five peaks').toHaveLength(5);
  labels.forEach((label, index) => {
    const peak = boxes[index];
    if (!peak) throw new Error('Missing a peak.');
    const center = (peak.left + peak.right) / 2;
    expect(label.name).toBe(peak.name);
    expect(label.bottom, `${label.name}'s label is above its peak`).toBeLessThanOrEqual(peak.top);
    // Silicon's 2s peak is only 0.0415 of the axis from the taller 2p peak
    // on its lower-energy side, so its label ends at its center, away from
    // that peak. Every other label is centered over its peak.
    const anchored = label.name === '2s' ? label.right : (label.left + label.right) / 2;
    expect(Math.abs(anchored - center), `${label.name}'s label is where it should be`).toBeLessThanOrEqual(0.6);
  });
});

test('the drawing has a name that says what it shows', async ({ page }) => {
  const diagram = await open(page);

  await expect(panel(diagram).getByRole('img')).toHaveAccessibleName(
    'Photoelectron spectrum of silicon: five peaks, 1s, 2s, 2p, 3s and 3p, from the highest binding energy at the left to the lowest at the right. ' +
      'The height of each peak is its number of electrons: 2, 2, 6, 2 and 2.',
  );
});

test("under the graph, a table gives the subshell, electrons and binding energy of each of the chosen atom's peaks", async ({
  page,
}) => {
  const diagram = await open(page);

  await expect(table(diagram).locator('thead th')).toHaveText(['Subshell', 'Electrons', 'Binding energy (MJ/mol)']);
  await expect(rowsOf(diagram)).toHaveCount(5);
  const rows: string[][] = [];
  for (const row of await rowsOf(diagram).all()) rows.push(await cellTexts(row));
  expect(rows).toEqual([
    ['1s', '2', '178'],
    ['2s', '2', '15.1'],
    ['2p', '6', '10.3'],
    ['3s', '2', '1.46'],
    ['3p', '2', '0.79'],
  ]);
});

test('the wrapper says where the values come from, how the heights are drawn and that the widths are not measured', async ({ page }) => {
  const diagram = await open(page);

  await expect(page.locator('[data-part="diagram"]', { has: diagram }).locator('figcaption').last()).toHaveText(
    "Binding energies are the values of the table used to teach photoelectron spectroscopy; those of inner electrons are approximate. The peaks' heights are drawn in exact proportion to the number of electrons; their widths are drawn, not measured.",
  );
});

const legend = (diagram: Locator, which: 'chosen' | 'compared') => panel(diagram).locator(`[data-legend="${which}"]`);
const comparedPeaks = (diagram: Locator) => panel(diagram).locator('[data-compared-peak]');

/**
 * Chooses an atom, and waits for the drawing to change: a menu has its new
 * value before the drawing is updated, so the value alone proves nothing.
 */
async function choose(diagram: Locator, symbol: string) {
  const label = await elementSelect(diagram).locator(`option[value="${symbol}"]`).innerText();
  const name = label.split(', ')[1];
  if (name === undefined) throw new Error(`The option for ${symbol} reads "${label}", not like "14 Si, silicon".`);
  const count = PEAK_COUNTS[symbol];
  if (count === undefined) throw new Error(`The test has no peak count for ${symbol}.`);
  await elementSelect(diagram).selectOption(symbol);
  await expect(status(diagram)).toContainText(`${name.charAt(0).toUpperCase()}${name.slice(1)}, `);
  await expect(peaks(diagram)).toHaveCount(count);
  await expect(peakLabels(diagram)).toHaveCount(count);
}

/** Chooses the atom to compare with, and waits for its dashed peaks. */
async function compareWith(diagram: Locator, symbol: string) {
  const count = PEAK_COUNTS[symbol];
  if (count === undefined) throw new Error(`The test has no peak count for ${symbol}.`);
  await compareSelect(diagram).selectOption(symbol);
  await expect(legend(diagram, 'compared')).toContainText(`(${symbol})`);
  await expect(comparedPeaks(diagram)).toHaveCount(count);
}

const elementSelect = (diagram: Locator) => diagram.getByRole('combobox', { name: 'Element' });
const compareSelect = (diagram: Locator) => diagram.getByRole('combobox', { name: 'Compare with' });

const CALCIUM =
  'Calcium, 1s² 2s² 2p⁶ 3s² 3p⁶ 4s²: six peaks. The 1s electrons are held most strongly, at 390 MJ/mol. ' +
  'The 4s electrons are the easiest to remove, at 0.59 MJ/mol.';

test('"Element" is a menu of the twenty atoms, silicon chosen', async ({ page }) => {
  const diagram = await open(page);

  const options = elementSelect(diagram).locator('option');

  await expect(elementSelect(diagram)).toHaveValue('Si');
  await expect(options).toHaveCount(20);
  await expect(options.first()).toHaveText('1 H, hydrogen');
  await expect(options.nth(13)).toHaveText('14 Si, silicon');
  await expect(options.last()).toHaveText('20 Ca, calcium');
});

test('choosing calcium from the keyboard gives six peaks and its readout', async ({ page }) => {
  const diagram = await open(page);

  await elementSelect(diagram).focus();
  await page.keyboard.press('End');

  await expect(elementSelect(diagram)).toHaveValue('Ca');
  await expect(status(diagram)).toHaveText(CALCIUM);
  await expect(peaks(diagram)).toHaveCount(6);
  await expect(peakLabels(diagram)).toHaveText(['1s', '2s', '2p', '3s', '3p', '4s']);
  await expect(rowsOf(diagram)).toHaveCount(6);
  await expect(table(diagram).locator('caption')).toContainText('Calcium');
  await expect(panel(diagram).getByRole('img')).toHaveAccessibleName(/^Photoelectron spectrum of calcium: six peaks, 1s, 2s, 2p, 3s, 3p and 4s,/);
});

test('choosing hydrogen from the keyboard gives the one-peak sentence', async ({ page }) => {
  const diagram = await open(page);

  await elementSelect(diagram).focus();
  await page.keyboard.press('Home');

  await expect(elementSelect(diagram)).toHaveValue('H');
  await expect(status(diagram)).toHaveText('Hydrogen, 1s¹: one peak, at 1.31 MJ/mol.');
  await expect(peaks(diagram)).toHaveCount(1);
  await expect(rowsOf(diagram)).toHaveCount(1);
  expect(await cellTexts(rowsOf(diagram).first())).toEqual(['1s', '1', '1.31']);
});

test('the peaks of each atom stand where its binding energies put them, whichever atom is chosen', async ({ page }) => {
  const diagram = await open(page);
  const axes = await axesOf(diagram);
  // Written out from the plan's table: for each atom, its last peak's energy and electrons.
  const outermost = [
    ['H', '1s', 1, 1.31],
    ['Li', '2s', 1, 0.52],
    ['O', '2p', 4, 1.31],
    ['Ne', '2p', 6, 2.08],
    ['Ca', '4s', 2, 0.59],
  ] as const;

  for (const [symbol, subshell, electrons, energy] of outermost) {
    await choose(diagram, symbol);
    const box = (await boxesOf(panel(diagram).locator(`[data-peak="${subshell}"]`), 'data-peak'))[0];
    if (!box) throw new Error(`No ${subshell} peak for ${symbol}.`);

    expect(Math.abs((box.left + box.right) / 2 - axes.xOf(energy)), `${symbol} ${subshell} is at ${energy} MJ/mol`).toBeLessThanOrEqual(0.15);
    const sixHeight = axes.baseline - axes.y6;
    expect(Math.abs((box.bottom - box.top) / sixHeight - electrons / 6), `${symbol} ${subshell} is ${electrons} of 6 electrons tall`).toBeLessThanOrEqual(0.005);
  }
});

/** Every label of the drawing and every peak, in drawing units. */
async function labelsAndPeaks(diagram: Locator) {
  return { labels: await boxesOf(peakLabels(diagram), 'data-peak-label'), peaks: await boxesOf(peaks(diagram), 'data-peak') };
}

const overlap = (a: Box, b: Box, margin: number) =>
  a.left < b.right + margin && b.left < a.right + margin && a.top < b.bottom + margin && b.top < a.bottom + margin;

test('for every atom, no label meets another label or any peak but its own, and none is cut off', async ({ page }) => {
  const diagram = await open(page);
  const symbols = await elementSelect(diagram).locator('option').evaluateAll((options) => options.map((option) => option.getAttribute('value') ?? ''));

  expect(symbols, 'the menu offers all twenty atoms').toHaveLength(20);

  for (const symbol of symbols) {
    await choose(diagram, symbol);
    const { labels, peaks: drawn } = await labelsAndPeaks(diagram);

    // The loops below would pass on an empty drawing: say how many there must be.
    expect(labels, `${symbol}: one label for each peak`).toHaveLength(PEAK_COUNTS[symbol] ?? -1);
    expect(drawn, `${symbol}: one peak for each subshell`).toHaveLength(PEAK_COUNTS[symbol] ?? -1);

    labels.forEach((label, index) => {
      labels.slice(index + 1).forEach((other) => {
        expect(overlap(label, other, 0.5), `${symbol}: label ${label.name} meets label ${other.name}`).toBe(false);
      });
      for (const peak of drawn) {
        if (peak.name !== label.name) expect(overlap(label, peak, 0.5), `${symbol}: label ${label.name} meets peak ${peak.name}`).toBe(false);
      }
    });
    const cutOff = await panel(diagram).locator('svg').evaluate((svg) => {
      const frame = svg.getBoundingClientRect();
      return [...svg.querySelectorAll('text')]
        .filter((text) => {
          const box = text.getBoundingClientRect();
          return box.left < frame.left - 0.5 || box.right > frame.right + 0.5 || box.top < frame.top - 0.5 || box.bottom > frame.bottom + 0.5;
        })
        .map((text) => text.textContent);
    });
    expect(cutOff, `${symbol}: text outside the drawing`).toEqual([]);
  }
});

async function tableRows(diagram: Locator): Promise<string[][]> {
  const rows: string[][] = [];
  for (const row of await rowsOf(diagram).all()) rows.push(await cellTexts(row));
  return rows;
}

test('"Compare with" offers "Nothing", chosen to begin with, and the other nineteen atoms', async ({ page }) => {
  const diagram = await open(page);

  const options = compareSelect(diagram).locator('option');

  await expect(compareSelect(diagram)).toHaveValue('');
  await expect(options).toHaveCount(20);
  await expect(options.first()).toHaveText('Nothing');
  await expect(compareSelect(diagram).locator('option[value="Si"]')).toHaveCount(0);
  await expect(compareSelect(diagram).locator('option[value="Al"]')).toHaveText('13 Al, aluminum');
  await expect(legend(diagram, 'chosen')).toHaveText('Silicon (Si)');
  await expect(legend(diagram, 'compared')).toHaveCount(0);
});

test('comparing oxygen with nitrogen gives the mixed sentence, a second column and dashed peaks behind', async ({ page }) => {
  const diagram = await open(page);
  await choose(diagram, 'O');

  await compareWith(diagram, 'N');

  // The opening and the comparison, and no more: the two sentences about
  // the atom's strongest and weakest peaks would repeat the table.
  await expect(status(diagram)).toHaveText(
    'Oxygen, 1s² 2s² 2p⁴: three peaks. ' +
      "Oxygen has 8 protons to nitrogen's 7, and its 1s and 2s peaks lie at higher binding energies. " +
      'Its 2p peak is lower, 1.31 against 1.40 MJ/mol: topic 1.7 explains why.',
  );
  await expect(table(diagram).locator('thead th')).toHaveText([
    'Subshell',
    'Electrons (O)',
    'O (oxygen, MJ/mol)',
    'N (nitrogen, MJ/mol)',
  ]);
  await expect(table(diagram).locator('caption')).toHaveText(
    "Oxygen (O) and nitrogen (N), binding energies in MJ/mol. The electron counts are oxygen's; nitrogen's configuration is 1s² 2s² 2p³.",
  );
  expect(await tableRows(diagram)).toEqual([
    ['1s', '2', '52.6', '39.6'],
    ['2s', '2', '3.12', '2.45'],
    ['2p', '4', '1.31', '1.40'],
  ]);
  await expect(comparedPeaks(diagram)).toHaveCount(3);
  await expect(peaks(diagram)).toHaveCount(3);
  await expect(legend(diagram, 'chosen')).toHaveText('Oxygen (O)');
  await expect(legend(diagram, 'compared')).toHaveText('Nitrogen (N)');
  await expect(panel(diagram).getByRole('img')).toHaveAccessibleName(
    /Dashed outlines behind the peaks show nitrogen's peaks, for comparison\. Nitrogen's configuration is 1s² 2s² 2p³\.$/,
  );
});

test("a compared atom's peaks are dashed outlines, drawn behind the chosen atom's filled peaks and without labels", async ({
  page,
}) => {
  const diagram = await open(page);
  const axes = await axesOf(diagram);

  await compareWith(diagram, 'Al');

  const outlines = await boxesOf(comparedPeaks(diagram), 'data-compared-peak');
  expect(outlines.map((box) => box.name)).toEqual(['1s', '2s', '2p', '3s', '3p']);
  // Aluminum: subshell, electrons, binding energy.
  const expected = [
    ['1s', 2, 151],
    ['2s', 2, 12.1],
    ['2p', 6, 7.79],
    ['3s', 2, 1.09],
    ['3p', 1, 0.58],
  ] as const;
  outlines.forEach((box, index) => {
    const [name, electrons, energy] = expected[index] ?? [];
    if (name === undefined || electrons === undefined || energy === undefined) throw new Error('Missing a peak.');
    expect(Math.abs((box.left + box.right) / 2 - axes.xOf(energy)), `aluminum ${name}`).toBeLessThanOrEqual(0.15);
    expect(Math.abs((box.bottom - box.top) / (axes.baseline - axes.y6) - electrons / 6), `aluminum ${name}`).toBeLessThanOrEqual(0.005);
  });
  const dashed = await comparedPeaks(diagram).first().evaluate((node) => getComputedStyle(node).strokeDasharray);
  const solid = await peaks(diagram).first().evaluate((node) => getComputedStyle(node).strokeDasharray);
  expect(dashed).not.toBe('none');
  expect(solid).toBe('none');
  await expect(comparedPeaks(diagram).first()).toHaveCSS('fill', 'none');
  await expect(peaks(diagram).first()).not.toHaveCSS('fill', 'none');
  // Behind: each compared peak comes before the first chosen peak in the drawing.
  const behind = await panel(diagram).evaluate((root) => {
    const first = root.querySelector('[data-peak]');
    const compared = [...root.querySelectorAll('[data-compared-peak]')];
    return (
      compared.length > 0 &&
      compared.every((node) => first !== null && Boolean(node.compareDocumentPosition(first) & Node.DOCUMENT_POSITION_FOLLOWING))
    );
  });
  expect(behind, 'the dashed peaks are drawn before the filled ones').toBe(true);
  await expect(peakLabels(diagram)).toHaveCount(5);
});

test('a subshell the compared atom lacks has a dash in its column', async ({ page }) => {
  const diagram = await open(page);
  await choose(diagram, 'Na');

  await compareWith(diagram, 'Ne');

  expect((await tableRows(diagram)).slice(0, 3)).toEqual([
    ['1s', '2', '104', '84.0'],
    ['2s', '2', '6.84', '4.68'],
    ['2p', '6', '3.67', '2.08'],
  ]);
  const [subshell, electrons, energy, dash] = await rowsOf(diagram).nth(3).locator('th, td').all();
  await expect(subshell).toHaveText('3s');
  await expect(electrons).toHaveText('1');
  await expect(energy).toHaveText('0.50');
  await expect(dash).toContainText('—');
  await expect(dash).toContainText('no 3s peak');
  await expect(comparedPeaks(diagram)).toHaveCount(3);
});

// Hydrogen against calcium draws five peaks that hydrogen does not have, so the table says what they are.
test('while comparing, the table lists every subshell either atom has, with a dash where one of them lacks it', async ({
  page,
}) => {
  const diagram = await open(page);
  await choose(diagram, 'H');

  await compareWith(diagram, 'Ca');

  await expect(table(diagram).locator('thead th')).toHaveText([
    'Subshell',
    'Electrons (H)',
    'H (hydrogen, MJ/mol)',
    'Ca (calcium, MJ/mol)',
  ]);
  expect(await tableRows(diagram)).toEqual([
    ['1s', '1', '1.31', '390'],
    ['2s', '—', '—', '42.7'],
    ['2p', '—', '—', '34.0'],
    ['3s', '—', '—', '4.65'],
    ['3p', '—', '—', '2.90'],
    ['4s', '—', '—', '0.59'],
  ]);
  const [, electrons, energy, other] = await rowsOf(diagram).nth(1).locator('th, td').all();
  await expect(electrons).toContainText('no 2s peak');
  await expect(energy).toContainText('no 2s peak');
  await expect(other).not.toContainText('no 2s peak');
  await expect(table(diagram).locator('caption')).toContainText("calcium's configuration is 1s² 2s² 2p⁶ 3s² 3p⁶ 4s².");
  await expect(panel(diagram).getByRole('img')).toHaveAccessibleName(/Calcium's configuration is 1s² 2s² 2p⁶ 3s² 3p⁶ 4s²\.$/);
});

test("while comparing, a subshell only the compared atom lacks has a dash in that atom's column: calcium against hydrogen", async ({
  page,
}) => {
  const diagram = await open(page);
  await choose(diagram, 'Ca');

  await compareWith(diagram, 'H');

  expect(await tableRows(diagram)).toEqual([
    ['1s', '2', '390', '1.31'],
    ['2s', '2', '42.7', '—'],
    ['2p', '6', '34.0', '—'],
    ['3s', '2', '4.65', '—'],
    ['3p', '6', '2.90', '—'],
    ['4s', '2', '0.59', '—'],
  ]);
});

// The readout is longer while comparing, and the menus used to sit under it,
// so choosing an atom to compare moved the menu just used. They sit above
// the readout instead: this differs from the other explorers, whose
// readouts hardly change length.
test('the menus sit under the drawing and above the readout and the table, and do not move when a comparison is chosen', async ({
  page,
}) => {
  const diagram = await open(page);
  const top = async (locator: Locator) => (await locator.boundingBox())?.y ?? Number.NaN;
  const bottom = async (locator: Locator) => {
    const box = await locator.boundingBox();
    return box ? box.y + box.height : Number.NaN;
  };

  const drawingBottom = await bottom(panel(diagram).locator('svg'));
  const menusTop = await top(diagram.locator('.diagram-controls'));
  const menusBottom = await bottom(diagram.locator('.diagram-controls'));
  const readoutTop = await top(status(diagram));
  const tableTop = await top(table(diagram));

  expect(drawingBottom, 'the menus are under the drawing').toBeLessThanOrEqual(menusTop);
  expect(menusBottom, 'the readout is under the menus').toBeLessThanOrEqual(readoutTop);
  expect(readoutTop, 'the table is under the readout').toBeLessThanOrEqual(tableTop);

  await choose(diagram, 'O');
  await compareWith(diagram, 'N');

  expect(Math.abs((await top(diagram.locator('.diagram-controls'))) - menusTop), 'the menus did not move').toBeLessThanOrEqual(0.5);
});

// A compared atom's peak can stand where one of the chosen atom's labels is:
// hydrogen's 1s and oxygen's 2p are both at 1.31 MJ/mol. The dashed line
// would strike through the label, so each label has a halo in the card's color.
for (const [chosen, compared] of [
  ['H', 'O'],
  ['He', 'Ne'],
  ['Li', 'Mg'],
] as const) {
  test(`${chosen} against ${compared}: a compared peak crosses a label of the chosen atom, and every label has a halo`, async ({
    page,
  }) => {
    const diagram = await open(page);
    await choose(diagram, chosen);
    await compareWith(diagram, compared);

    const labels = await boxesOf(peakLabels(diagram), 'data-peak-label');
    const outlines = await boxesOf(comparedPeaks(diagram), 'data-compared-peak');
    const crossed = labels.filter((label) => outlines.some((outline) => overlap(label, outline, 0)));
    const halos = await peakLabels(diagram).evaluateAll((nodes) =>
      nodes.map((node) => {
        const style = getComputedStyle(node);
        return { name: node.textContent, paintOrder: style.paintOrder, stroke: style.stroke, width: style.strokeWidth };
      }),
    );
    const card = await diagram.evaluate((body) => {
      const frame = body.closest('.diagram');
      if (!frame) throw new Error('The diagram is not inside a .diagram figure.');
      return getComputedStyle(frame).backgroundColor;
    });

    // The test is about a real crossing: this pair has one.
    expect(crossed.map((label) => label.name), `${chosen}/${compared} has a label a compared peak crosses`).not.toEqual([]);
    expect(halos).toHaveLength(PEAK_COUNTS[chosen] ?? -1);
    for (const halo of halos) {
      expect(halo.paintOrder, `${halo.name} is painted stroke first`).toMatch(/^stroke/);
      expect(halo.stroke, `${halo.name}'s halo is the card's color`).toBe(card);
      expect(halo.width, `${halo.name}'s halo is 3px`).toBe('3px');
    }
  });
}

test('the two legend entries do not meet, with the longest names, at 320 px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  const diagram = await open(page);
  await choose(diagram, 'P');

  await compareWith(diagram, 'Mg');

  const [chosen, compared] = await boxesOf(panel(diagram).locator('[data-legend]'), 'data-legend');
  if (!chosen || !compared) throw new Error('The legend does not have two entries.');
  expect(chosen.name).toBe('chosen');
  expect(compared.name).toBe('compared');
  expect(chosen.right, 'a gap between the entries').toBeLessThan(compared.left - 4);
  const width = await panel(diagram).locator('svg').evaluate((svg) => {
    if (!(svg instanceof SVGSVGElement)) throw new Error('The drawing is not an SVG.');
    return svg.viewBox.baseVal.width;
  });
  expect(compared.right, 'inside the drawing').toBeLessThanOrEqual(width);
});

test('under the axis title, a cue says that larger binding energies are held more tightly, clear of the legend', async ({
  page,
}) => {
  const diagram = await open(page);

  const [title, cue, key] = [
    (await boxesOf(panel(diagram).locator('[data-axis-label="x"]'), 'data-axis-label'))[0],
    (await boxesOf(panel(diagram).locator('[data-axis-cue]'), 'data-axis-cue'))[0],
    (await boxesOf(panel(diagram).locator('[data-legend="chosen"]'), 'data-legend'))[0],
  ];
  if (!title || !cue || !key) throw new Error('The title, the cue or the legend is missing.');

  await expect(panel(diagram).locator('[data-axis-cue]')).toHaveText('← held more tightly');
  expect(cue.top, 'under the title').toBeGreaterThanOrEqual(title.bottom);
  expect(cue.bottom, 'above the legend').toBeLessThanOrEqual(key.top);
});

test('choosing "Nothing" takes away the second column, the dashed peaks, the legend entry and the comparison', async ({
  page,
}) => {
  const diagram = await open(page);
  await choose(diagram, 'O');
  await compareWith(diagram, 'N');
  await expect(comparedPeaks(diagram)).toHaveCount(3);

  await compareSelect(diagram).selectOption({ label: 'Nothing' });

  await expect(compareSelect(diagram)).toHaveValue('');
  await expect(comparedPeaks(diagram)).toHaveCount(0);
  await expect(legend(diagram, 'compared')).toHaveCount(0);
  await expect(table(diagram).locator('thead th')).toHaveText(['Subshell', 'Electrons', 'Binding energy (MJ/mol)']);
  await expect(status(diagram)).toHaveText(
    'Oxygen, 1s² 2s² 2p⁴: three peaks. The 1s electrons are held most strongly, at 52.6 MJ/mol. The 2p electrons are the easiest to remove, at 1.31 MJ/mol.',
  );
});

test('choosing the atom that is being compared with ends the comparison, and the menu follows', async ({ page }) => {
  const diagram = await open(page);
  await choose(diagram, 'O');
  await compareWith(diagram, 'N');
  await expect(comparedPeaks(diagram)).toHaveCount(3);

  await choose(diagram, 'N');

  await expect(compareSelect(diagram)).toHaveValue('');
  await expect(comparedPeaks(diagram)).toHaveCount(0);
  await expect(status(diagram)).toContainText('Nitrogen, 1s² 2s² 2p³: three peaks.');
  await expect(compareSelect(diagram).locator('option[value="N"]')).toHaveCount(0);
  await expect(compareSelect(diagram).locator('option[value="O"]')).toHaveCount(1);
  await expect(compareSelect(diagram).locator('option')).toHaveCount(20);
});

test('the comparison stays when another atom is chosen, as long as it is a different one', async ({ page }) => {
  const diagram = await open(page);
  await compareWith(diagram, 'Al');

  await choose(diagram, 'P');

  await expect(compareSelect(diagram)).toHaveValue('Al');
  await expect(status(diagram)).toContainText(
    "Every peak phosphorus shares with aluminum lies at a higher binding energy in phosphorus, whose nucleus has 15 protons to aluminum's 13.",
  );
  await expect(legend(diagram, 'compared')).toHaveText('Aluminum (Al)');
});

test('both menus can be reached with Tab, in the order shown, and the comparison can be chosen from the keyboard', async ({
  page,
}) => {
  const diagram = await open(page);

  await elementSelect(diagram).focus();
  await page.keyboard.press('Tab');
  await expect(compareSelect(diagram)).toBeFocused();
  await page.keyboard.press('ArrowDown');

  await expect(compareSelect(diagram)).toHaveValue('H');
  await expect(legend(diagram, 'compared')).toHaveText('Hydrogen (H)');
});

// A nominal size, not a rendered one: the font size in drawing units, times
// 320, over the drawing's width in units. That is the size of the text when
// the drawing itself is shown 320 px wide, the ratio of the site's figures
// (18 on 480).
test("the drawing's text is 12 px or more when the drawing itself is shown 320 px wide, the ratio of the site's figures", async ({
  page,
}) => {
  const diagram = await open(page);
  await compareWith(diagram, 'Al');

  const sizes = await panel(diagram).locator('svg').evaluate((svg) => {
    if (!(svg instanceof SVGSVGElement)) throw new Error('The drawing is not an SVG.');
    const unitsWide = svg.viewBox.baseVal.width;
    return [...svg.querySelectorAll('text, tspan')].map((text) => ({
      text: text.textContent,
      pxAt320: (Number.parseFloat(getComputedStyle(text).fontSize) * 320) / unitsWide,
    }));
  });

  expect(sizes.length).toBeGreaterThanOrEqual(15);
  for (const size of sizes) expect(size.pxAt320, `"${size.text}"`).toBeGreaterThanOrEqual(12);
});

// The text as it is drawn on the screen: its size in drawing units, scaled by
// how wide the drawing is shown, and the text of the rest of the diagram.
for (const width of [1280, 412]) {
  test(`on a ${width} px screen every piece of text in the diagram is drawn 12 px or larger`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const diagram = await open(page);
    await compareWith(diagram, 'Al');
    await page.evaluate(() => document.fonts.ready);

    const drawn = await panel(diagram).locator('svg').evaluate((svg) => {
      if (!(svg instanceof SVGSVGElement)) throw new Error('The drawing is not an SVG.');
      const scale = svg.getBoundingClientRect().width / svg.viewBox.baseVal.width;
      return [...svg.querySelectorAll('text, tspan')].map((text) => ({
        text: text.textContent,
        px: Number.parseFloat(getComputedStyle(text).fontSize) * scale,
      }));
    });
    const around = await diagram.evaluate((body) => {
      const sizes: { text: string; px: number }[] = [];
      for (const element of body.querySelectorAll('p, caption, th, td, label, span, option, select')) {
        if (element.closest('svg') || element.closest('.visually-hidden')) continue;
        const own = [...element.childNodes].some((node) => node.nodeType === Node.TEXT_NODE && (node.textContent ?? '').trim() !== '');
        if (own) sizes.push({ text: (element.textContent ?? '').trim().slice(0, 30), px: Number.parseFloat(getComputedStyle(element).fontSize) });
      }
      return sizes;
    });

    expect(drawn.length).toBeGreaterThanOrEqual(15);
    for (const size of drawn) expect(size.px, `"${size.text}"`).toBeGreaterThanOrEqual(12);
    expect(around.length).toBeGreaterThanOrEqual(10);
    for (const size of around) expect(size.px, `"${size.text}"`).toBeGreaterThanOrEqual(12);
  });
}

test('on a wide screen the drawing stops at 22rem wide and sits in the middle of the diagram', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  const diagram = await open(page);

  const measured = await diagram.evaluate((body) => {
    const frame = body.getBoundingClientRect();
    const rem = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
    return [...body.querySelectorAll('[data-panel] svg')].map((svg) => {
      const box = svg.getBoundingClientRect();
      return { rems: box.width / rem, spaceLeft: box.left - frame.left, spaceRight: frame.right - box.right };
    });
  });

  expect(measured).toHaveLength(1);
  for (const drawing of measured) {
    expect(Math.abs(drawing.rems - 22)).toBeLessThanOrEqual(0.05);
    expect(drawing.spaceLeft).toBeGreaterThan(0);
    expect(Math.abs(drawing.spaceLeft - drawing.spaceRight)).toBeLessThanOrEqual(1);
  }
});

for (const width of [1280, 412, 390, 360, 320]) {
  test(`on a ${width} px screen nothing scrolls sideways, with the longest readout and the widest table showing`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 800 });
    const diagram = await open(page);
    // The longest readout (a mixed comparison, after the atom's own) and a four-column table.
    await choose(diagram, 'S');
    await compareWith(diagram, 'P');
    await expect(status(diagram)).toContainText('topic 1.7 explains why.');
    await page.evaluate(() => document.fonts.ready);
    const figure = page.locator('[data-part="diagram"]', { has: diagram });

    const measured = await figure.evaluate((element) => {
      const frame = element.getBoundingClientRect();
      const outside = [...element.querySelectorAll('svg, p, select, label, th, td, caption, figcaption')]
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
  test(`the diagram has no accessibility violations in the ${theme} theme, at the start and while comparing`, async ({ page }) => {
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
    await choose(diagram, 'Na');
    await compareWith(diagram, 'Ne');
    await expect(status(diagram)).toContainText("whose nucleus has 11 protons to neon's 10.");

    expect(await violations(), 'while comparing sodium with neon').toEqual([]);
  });
}

test('in print the controls are gone and the drawing, the readout and the table stay', async ({ page }) => {
  const diagram = await open(page);
  await page.emulateMedia({ media: 'print' });

  await expect(diagram.locator('.diagram-controls')).toBeHidden();
  await expect(panel(diagram).locator('svg')).toBeVisible();
  await expect(status(diagram)).toBeVisible();
  await expect(table(diagram)).toBeVisible();
});

test.describe('with JavaScript off', () => {
  test.use({ javaScriptEnabled: false });

  test('the drawing, the starting readout and the table show, with no controls', async ({ page }) => {
    await expectStaticDiagram(page, PAGE, NAME, START);

    const diagram = page.locator(`[data-diagram="${NAME}"]`);
    await expect(panel(diagram).getByRole('img')).toBeVisible();
    await expect(peaks(diagram)).toHaveCount(5);
    await expect(peakLabels(diagram)).toHaveText(['1s', '2s', '2p', '3s', '3p']);
    await expect(rowsOf(diagram)).toHaveCount(5);
    await expect(legend(diagram, 'chosen')).toHaveText('Silicon (Si)');
    await expect(elementSelect(diagram)).toBeHidden();
    await expect(compareSelect(diagram)).toBeHidden();
  });
});
