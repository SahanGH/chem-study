import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator } from '@playwright/test';
import { expectStaticDiagram, openDiagram } from './diagram';

const PAGE = '/unit-4-chemical-reactions/4-5-stoichiometry/';
const NAME = 'limiting-reactant';

// Every sentence below is written out from the lesson's reaction, 2 NO + F₂ → 2 NOF,
// apart from the module under test.
const START_READOUT =
  '6 NO and 2 F₂: fluorine is the limiting reactant. 2 F₂ can react with only 4 NO, so 4 NOF form and 2 NO are left over.';
const NEITHER_READOUT = '6 NO and 3 F₂: neither is left over. They are in the ratio of the equation, 2 to 1, so 6 NOF form.';
const NO_LIMITING_READOUT =
  '4 NO and 5 F₂: nitrogen monoxide is the limiting reactant. 4 NO can react with only 2 F₂, so 4 NOF form and 3 F₂ are left over.';
const NO_NO_READOUT =
  '0 NO and 2 F₂: with no nitrogen monoxide there is nothing for the fluorine to react with.';

const ALL_NO = [0, 2, 4, 6, 8, 10];
const ALL_F2 = [0, 1, 2, 3, 4, 5];

const box = (diagram: Locator, which: 'before' | 'after') => diagram.locator(`[data-box="${which}"]`);
const particlesIn = (diagram: Locator, which: 'before' | 'after', kind?: string) =>
  box(diagram, which).locator(kind ? `[data-particle="${kind}"]` : '[data-particle]');
const status = (diagram: Locator) => diagram.getByRole('status');
const noSlider = (diagram: Locator) => diagram.getByRole('slider', { name: 'Nitrogen monoxide, NO', exact: true });
const f2Slider = (diagram: Locator) => diagram.getByRole('slider', { name: 'Fluorine, F₂', exact: true });
const table = (diagram: Locator) => diagram.locator('[data-table="amounts"]');
const key = (diagram: Locator) => diagram.locator('[data-part="key"]');

/** Every row of the table as the student reads it: the row header, then its three cells. */
async function tableText(diagram: Locator): Promise<string[][]> {
  return table(diagram)
    .locator('tbody tr')
    .evaluateAll((rows) => rows.map((row) => [...row.querySelectorAll('th, td')].map((cell) => (cell.textContent ?? '').trim())));
}

async function counts(diagram: Locator, which: 'before' | 'after') {
  return {
    no: await particlesIn(diagram, which, 'NO').count(),
    f2: await particlesIn(diagram, which, 'F2').count(),
    nof: await particlesIn(diagram, which, 'NOF').count(),
  };
}

async function numberOf(element: Locator, attribute: string): Promise<number> {
  const value = await element.getAttribute(attribute);
  if (value === null || value === '') throw new Error(`An element has no ${attribute} attribute.`);
  return Number(value);
}

/** The atoms of one particle, in drawing order, with their centers and radii in drawing units. */
async function atomsOf(particle: Locator) {
  const atoms = particle.locator('[data-atom]');
  const count = await atoms.count();
  const found = [];
  for (let i = 0; i < count; i++) {
    const atom = atoms.nth(i);
    found.push({
      element: await atom.getAttribute('data-atom'),
      cx: await numberOf(atom, 'cx'),
      cy: await numberOf(atom, 'cy'),
      r: await numberOf(atom, 'r'),
    });
  }
  return found;
}

test('the diagram starts with 6 NO and 2 F₂, with its table and its readout', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await expect(status(diagram)).toHaveText(START_READOUT);
  await expect(noSlider(diagram)).toHaveAttribute('aria-valuetext', '6 NO molecules');
  await expect(f2Slider(diagram)).toHaveAttribute('aria-valuetext', '2 F₂ molecules');
  await expect(box(diagram, 'before').locator('figcaption')).toHaveText('Before');
  await expect(box(diagram, 'after').locator('figcaption')).toHaveText('After');
  expect(await tableText(diagram)).toEqual([
    ['Before', '6', '2', '0'],
    ['Change', '−4', '−2', '+4'],
    ['After', '2', '0', '4'],
  ]);
  expect(await counts(diagram, 'before')).toEqual({ no: 6, f2: 2, nof: 0 });
  expect(await counts(diagram, 'after')).toEqual({ no: 2, f2: 0, nof: 4 });
});

test('the table has a caption, column headers for NO, F₂ and NOF, and row headers', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await expect(table(diagram).locator('caption')).toHaveText('Number of molecules');
  await expect(table(diagram).locator('thead th[scope="col"]')).toHaveText(['Stage', 'NO', 'F₂', 'NOF']);
  await expect(table(diagram).locator('tbody th[scope="row"]')).toHaveText(['Before', 'Change', 'After']);
});

test('the two controls are sliders, 0 to 10 in twos for NO and 0 to 5 in ones for F₂', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await expect(noSlider(diagram)).toHaveAttribute('min', '0');
  await expect(noSlider(diagram)).toHaveAttribute('max', '10');
  await expect(noSlider(diagram)).toHaveAttribute('step', '2');
  await expect(f2Slider(diagram)).toHaveAttribute('min', '0');
  await expect(f2Slider(diagram)).toHaveAttribute('max', '5');
  await expect(f2Slider(diagram)).toHaveAttribute('step', '1');
});

test('moving the fluorine slider to 3 from the keyboard gives the "neither" readout and 6 NOF after', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await f2Slider(diagram).focus();
  await page.keyboard.press('ArrowRight');

  await expect(f2Slider(diagram)).toHaveAttribute('aria-valuetext', '3 F₂ molecules');
  await expect(status(diagram)).toHaveText(NEITHER_READOUT);
  expect(await counts(diagram, 'after')).toEqual({ no: 0, f2: 0, nof: 6 });
  expect(await tableText(diagram)).toEqual([
    ['Before', '6', '3', '0'],
    ['Change', '−6', '−3', '+6'],
    ['After', '0', '0', '6'],
  ]);
});

test('setting 4 NO and 5 F₂ gives the nitrogen monoxide readout and 3 F₂ after', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await noSlider(diagram).focus();
  await page.keyboard.press('ArrowLeft');
  await f2Slider(diagram).focus();
  for (let i = 0; i < 3; i++) await page.keyboard.press('ArrowRight');

  await expect(noSlider(diagram)).toHaveAttribute('aria-valuetext', '4 NO molecules');
  await expect(status(diagram)).toHaveText(NO_LIMITING_READOUT);
  expect(await counts(diagram, 'after')).toEqual({ no: 0, f2: 3, nof: 4 });
});

test('setting NO to 0 gives the "nothing to react with" readout and leaves the F₂ in the After box', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await noSlider(diagram).focus();
  await page.keyboard.press('Home');

  await expect(noSlider(diagram)).toHaveAttribute('aria-valuetext', '0 NO molecules');
  await expect(status(diagram)).toHaveText(NO_NO_READOUT);
  expect(await counts(diagram, 'after')).toEqual({ no: 0, f2: 2, nof: 0 });
});

test('the particles drawn in each box equal the table row, in all 36 states', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  let states = 0;

  for (const no of ALL_NO) {
    for (const f2 of ALL_F2) {
      await noSlider(diagram).fill(String(no));
      await f2Slider(diagram).fill(String(f2));
      await expect(f2Slider(diagram)).toHaveAttribute('aria-valuetext', `${f2} F₂ molecule${f2 === 1 ? '' : 's'}`);
      await expect(noSlider(diagram)).toHaveAttribute('aria-valuetext', `${no} NO molecules`);

      const rows = await tableText(diagram);
      const [before, change, after] = rows;
      if (!before || !change || !after) throw new Error(`The table has ${rows.length} rows, not 3.`);
      expect(before.slice(1), `the before row for ${no} NO and ${f2} F₂`).toEqual([String(no), String(f2), '0']);
      expect(await counts(diagram, 'before'), `before: ${no} NO and ${f2} F₂`).toEqual({ no, f2, nof: 0 });
      expect(await counts(diagram, 'after'), `after: ${no} NO and ${f2} F₂`).toEqual({
        no: Number(after[1]),
        f2: Number(after[2]),
        nof: Number(after[3]),
      });
      // The change row is the after row less the before row, whatever the state.
      expect(
        change.slice(1).map((cell) => Number(cell.replace('−', '-'))),
        `the change row for ${no} NO and ${f2} F₂`,
      ).toEqual([Number(after[1]) - no, Number(after[2]) - f2, Number(after[3])]);
      states += 1;
    }
  }
  expect(states).toBe(36);
});

test('particles sit on a grid of five columns and three rows, one to a place', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  // The fullest box: 10 NO and 5 F₂ is 15 particles.
  await noSlider(diagram).fill('10');
  await f2Slider(diagram).fill('5');
  await expect(particlesIn(diagram, 'before')).toHaveCount(15);

  const places = await particlesIn(diagram, 'before').evaluateAll((all) =>
    all.map((particle) => `${particle.getAttribute('data-column')},${particle.getAttribute('data-row')}`),
  );
  expect(new Set(places).size, 'two particles share a place').toBe(15);
  const columns = places.map((place) => Number(place.split(',')[0]));
  const rows = places.map((place) => Number(place.split(',')[1]));
  expect(Math.min(...columns)).toBe(0);
  expect(Math.max(...columns)).toBe(4);
  expect(Math.min(...rows)).toBe(0);
  expect(Math.max(...rows)).toBe(2);
});

test('each atom has one size and one shading in both boxes and in the key, and the three differ', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  // A state with every kind of particle in the After box: 6 NO and 5 F₂ leaves F₂ and makes NOF.
  await noSlider(diagram).fill('6');
  await f2Slider(diagram).fill('5');
  await expect(particlesIn(diagram, 'after', 'F2')).not.toHaveCount(0);
  await expect(particlesIn(diagram, 'after', 'NOF')).not.toHaveCount(0);

  const looks: Record<string, Set<string>> = { N: new Set(), O: new Set(), F: new Set() };
  const radii: Record<string, number> = {};
  for (const element of Object.keys(looks)) {
    const atoms = diagram.locator(`[data-atom="${element}"]`);
    const total = await atoms.count();
    // At least one in each box and one in the key.
    expect(total, `atoms of ${element}`).toBeGreaterThanOrEqual(3);
    const styles = await atoms.evaluateAll((all) =>
      all.map((atom) => {
        const style = getComputedStyle(atom);
        return { r: atom.getAttribute('r'), fill: style.fill, stroke: style.stroke };
      }),
    );
    for (const style of styles) {
      looks[element]?.add(`${style.fill}|${style.stroke}`);
      radii[element] = Number(style.r);
      expect(Number(style.r), `radius of ${element}`).toBe(Number(styles[0]?.r));
    }
    expect(looks[element]?.size, `${element} has more than one look`).toBe(1);
  }
  const shadings = Object.values(looks).map((set) => [...set][0]);
  expect(new Set(shadings).size, 'the three atoms share a shading').toBe(3);
  expect(new Set(Object.values(radii)).size, 'the three atoms share a size').toBe(3);
});

test('NO and F₂ are two touching circles and NOF a bent row of three with nitrogen in the middle', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  await noSlider(diagram).fill('6');
  await f2Slider(diagram).fill('5');

  const touching = (a: { cx: number; cy: number; r: number }, b: { cx: number; cy: number; r: number }) =>
    Math.abs(Math.hypot(a.cx - b.cx, a.cy - b.cy) - (a.r + b.r));

  const no = await atomsOf(particlesIn(diagram, 'before', 'NO').first());
  expect(no.map((atom) => atom.element).sort()).toEqual(['N', 'O']);
  const [first, second] = no;
  if (!first || !second) throw new Error('NO has fewer than two atoms.');
  expect(touching(first, second)).toBeLessThanOrEqual(0.2);
  expect(first.r, 'the two atoms of NO are the same size').not.toBe(second.r);

  const f2 = await atomsOf(particlesIn(diagram, 'before', 'F2').first());
  expect(f2.map((atom) => atom.element)).toEqual(['F', 'F']);
  const [one, other] = f2;
  if (!one || !other) throw new Error('F₂ has fewer than two atoms.');
  expect(touching(one, other)).toBeLessThanOrEqual(0.2);

  const nof = await atomsOf(particlesIn(diagram, 'after', 'NOF').first());
  expect(nof.map((atom) => atom.element)).toEqual(['O', 'N', 'F']);
  const [left, middle, right] = nof;
  if (!left || !middle || !right) throw new Error('NOF has fewer than three atoms.');
  expect(touching(left, middle)).toBeLessThanOrEqual(0.2);
  expect(touching(middle, right)).toBeLessThanOrEqual(0.2);
  // Bent: the middle atom is off the line between the other two, by more than a stroke.
  const lineY = left.cy + ((middle.cx - left.cx) / (right.cx - left.cx)) * (right.cy - left.cy);
  expect(Math.abs(middle.cy - lineY), 'NOF is drawn straight').toBeGreaterThan(3);
});

test('the key names the three shadings and the three particles', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await expect(key(diagram).locator('[data-key-atom]')).toHaveText(['N nitrogen', 'O oxygen', 'F fluorine']);
  await expect(key(diagram).locator('[data-key-particle]')).toHaveText([
    'NO nitrogen monoxide',
    'F₂ fluorine',
    'NOF nitrosyl fluoride',
  ]);
});

test('each box has a name that says what it holds now', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await expect(box(diagram, 'before').getByRole('img')).toHaveAccessibleName('The Before box holds 6 NO molecules and 2 F₂ molecules.');
  await expect(box(diagram, 'after').getByRole('img')).toHaveAccessibleName('The After box holds 4 NOF molecules and 2 NO molecules.');

  await f2Slider(diagram).fill('3');
  await expect(box(diagram, 'after').getByRole('img')).toHaveAccessibleName('The After box holds 6 NOF molecules.');
});

test('the table is under the boxes and the key, and the readout is under the table', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  const parts = await Promise.all(
    [box(diagram, 'before'), box(diagram, 'after'), key(diagram), table(diagram), status(diagram)].map((part) => part.boundingBox()),
  );
  const [beforeBox, afterBox, keyBox, tableBox, statusBox] = parts;
  if (!beforeBox || !afterBox || !keyBox || !tableBox || !statusBox) throw new Error('A part of the diagram has no box.');

  expect(keyBox.y).toBeGreaterThanOrEqual(Math.max(beforeBox.y + beforeBox.height, afterBox.y + afterBox.height));
  expect(tableBox.y).toBeGreaterThanOrEqual(keyBox.y + keyBox.height);
  expect(statusBox.y).toBeGreaterThanOrEqual(tableBox.y + tableBox.height);
});

// Side by side from a 412 px phone up, one above the other below that.
for (const { width, sideBySide } of [
  { width: 1280, sideBySide: true },
  { width: 412, sideBySide: true },
  { width: 390, sideBySide: false },
  { width: 320, sideBySide: false },
]) {
  test(`at ${width} px the two boxes are ${sideBySide ? 'side by side' : 'one above the other'}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const diagram = await openDiagram(page, PAGE, NAME);

    const before = await box(diagram, 'before').boundingBox();
    const after = await box(diagram, 'after').boundingBox();
    if (!before || !after) throw new Error('A box has no bounding box.');
    if (sideBySide) {
      expect(Math.abs(before.y - after.y), 'the boxes are not level').toBeLessThanOrEqual(1);
      expect(after.x, 'After is right of Before').toBeGreaterThanOrEqual(before.x + before.width);
    } else {
      expect(Math.abs(before.x - after.x), 'the boxes are not stacked').toBeLessThanOrEqual(1);
      expect(after.y, 'After is below Before').toBeGreaterThanOrEqual(before.y + before.height);
    }
  });
}

for (const width of [1280, 412, 390, 360, 320]) {
  test(`on a ${width} px screen nothing scrolls sideways, the table fits and the controls stay inside the diagram`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 800 });
    const diagram = await openDiagram(page, PAGE, NAME);
    // The longest readout.
    await noSlider(diagram).focus();
    await page.keyboard.press('ArrowLeft');
    await f2Slider(diagram).focus();
    for (let i = 0; i < 3; i++) await page.keyboard.press('ArrowRight');
    await expect(status(diagram)).toHaveText(NO_LIMITING_READOUT);
    await page.evaluate(() => document.fonts.ready);
    const figure = page.locator('[data-part="diagram"]', { has: diagram });

    const measured = await figure.evaluate((element) => {
      const frame = element.getBoundingClientRect();
      const outside = [...element.querySelectorAll('svg, p, input, label, legend, figcaption, table, th, td, caption, li')]
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

// The boxes' drawings hold no text, so there is nothing in them under 12 px; the
// labels are HTML text, which this checks is 12 px or more from 412 px up.
test('the diagram draws no text under 12 px at 412 px', async ({ page }) => {
  await page.setViewportSize({ width: 412, height: 900 });
  const diagram = await openDiagram(page, PAGE, NAME);
  await page.evaluate(() => document.fonts.ready);

  const sizes = await diagram.evaluate((root) => {
    const drawn = [...root.querySelectorAll('svg text, svg tspan')].map((text) => {
      const svg = text.closest('svg');
      const scale = svg ? svg.getBoundingClientRect().width / (svg.viewBox.baseVal.width || 1) : 1;
      return { text: text.textContent, px: Number.parseFloat(getComputedStyle(text).fontSize) * scale };
    });
    const written = [...root.querySelectorAll('figcaption, th, td, caption, li, p, legend, label span')]
      .filter((element) => (element.textContent ?? '').trim() !== '' && !element.closest('.visually-hidden'))
      .map((element) => ({ text: element.textContent, px: Number.parseFloat(getComputedStyle(element).fontSize) }));
    return [...drawn, ...written];
  });

  expect(sizes.length).toBeGreaterThanOrEqual(15);
  for (const size of sizes) expect(size.px, `"${size.text}"`).toBeGreaterThanOrEqual(12);
});

for (const theme of ['light', 'dark'] as const) {
  test(`the diagram has no accessibility violations in the ${theme} theme, at the start and with NO limiting`, async ({
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
    await noSlider(diagram).fill('4');
    await f2Slider(diagram).fill('5');
    await expect(status(diagram)).toHaveText(NO_LIMITING_READOUT);

    expect(await violations(), 'with NO limiting').toEqual([]);
  });
}

test('in print the controls are hidden and the boxes, the key, the table and the readout stay', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  await page.emulateMedia({ media: 'print' });

  await expect(diagram.locator('.diagram-controls')).toBeHidden();
  await expect(box(diagram, 'before').getByRole('img')).toBeVisible();
  await expect(box(diagram, 'after').getByRole('img')).toBeVisible();
  await expect(key(diagram)).toBeVisible();
  await expect(table(diagram)).toBeVisible();
  await expect(status(diagram)).toHaveText(START_READOUT);
});

test('the caption under the diagram says the boxes are counts and leaves out the further reaction', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  const caption = page.locator('[data-part="diagram"]', { has: diagram }).locator('> figcaption');

  await expect(caption).toHaveText(
    'Each box is a count, not a picture of a real sample. With fluorine left over, a little of the product can react further, which the diagram leaves out.',
  );
});

test.describe('with JavaScript off', () => {
  test.use({ javaScriptEnabled: false });

  test('the two boxes, the key, the table and the starting readout show, with no controls', async ({ page }) => {
    await expectStaticDiagram(page, PAGE, NAME, START_READOUT);

    const diagram = page.locator(`[data-diagram="${NAME}"]`);
    await expect(box(diagram, 'before').getByRole('img')).toBeVisible();
    await expect(box(diagram, 'after').getByRole('img')).toBeVisible();
    expect(await counts(diagram, 'before')).toEqual({ no: 6, f2: 2, nof: 0 });
    expect(await counts(diagram, 'after')).toEqual({ no: 2, f2: 0, nof: 4 });
    await expect(key(diagram)).toBeVisible();
    await expect(table(diagram)).toBeVisible();
    expect(await tableText(diagram)).toEqual([
      ['Before', '6', '2', '0'],
      ['Change', '−4', '−2', '+4'],
      ['After', '2', '0', '4'],
    ]);
  });
});
