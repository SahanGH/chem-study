import { expect, test, type Locator, type Page } from '@playwright/test';
import { expectStaticDiagram, openDiagram } from './diagram';

const PAGE = '/unit-2-compound-structure/2-7-vsepr-and-hybridization/';
const NAME = 'shape-viewer';
const START =
  'CH₄: 4 electron domains around C (4 bonds, no lone pairs). Electron geometry: tetrahedral. ' +
  'Molecular shape: tetrahedral. Angles: 109.5°.';
const TURN = 'Turn the molecule: drag, or use the arrow keys';

const terminalAtoms = (diagram: Locator) => diagram.locator('[data-atom="terminal"]');
const lonePairs = (diagram: Locator) => diagram.locator('[data-lone-pair]');

/** Where every terminal atom is drawn, in the order of its bond, so a turn shows as a change. */
async function atomPositions(diagram: Locator): Promise<string[]> {
  const atoms = await terminalAtoms(diagram).evaluateAll((circles) =>
    circles.map((c) => ({ index: Number(c.getAttribute('data-index')), at: `${c.getAttribute('cx')},${c.getAttribute('cy')}` })),
  );
  return atoms.sort((a, b) => a.index - b.index).map((a) => a.at);
}

/**
 * Records on the body whether the page's own keydown listener found the key's
 * default action canceled. A listener on the window runs after the diagram's,
 * so it sees what the diagram did. (The browser scrolls smoothly, so a scroll
 * could not be seen right after a key press.)
 */
async function watchKeyCancelation(page: Page) {
  await page.evaluate(() =>
    window.addEventListener('keydown', (event) => {
      document.body.dataset.keyCanceled = String(event.defaultPrevented);
    }),
  );
}

/** The drawing's box on the page, to aim the mouse at. */
async function drawingBox(diagram: Locator) {
  const box = await diagram.getByRole('group', { name: TURN }).boundingBox();
  if (!box) throw new Error('The drawing has no size.');
  return box;
}

test('the viewer starts with methane: four bonds, no lone pairs', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await expect(diagram.getByRole('status')).toHaveText(START);
  await expect(terminalAtoms(diagram)).toHaveCount(4);
  await expect(lonePairs(diagram)).toHaveCount(0);
  await expect(diagram.getByRole('img')).toHaveAccessibleName(
    '3D model of CH₄: C in the middle with 4 bonds to H atoms and no lone pairs, a tetrahedral shape.',
  );
});

const CHOICES = [
  { id: 'SF4', atoms: 4, pairs: 1, readout: 'SF₄: 5 electron domains around S (4 bonds, 1 lone pair).', shape: 'seesaw' },
  { id: 'XeF4', atoms: 4, pairs: 2, readout: 'XeF₄: 6 electron domains around Xe (4 bonds, 2 lone pairs).', shape: 'square planar' },
  { id: 'SF6', atoms: 6, pairs: 0, readout: 'SF₆: 6 electron domains around S (6 bonds, no lone pairs).', shape: 'octahedral' },
  { id: 'H2O', atoms: 2, pairs: 2, readout: 'H₂O: 4 electron domains around O (2 bonds, 2 lone pairs).', shape: 'bent' },
];

for (const choice of CHOICES) {
  test(`choosing ${choice.id} redraws it with ${choice.atoms} atoms and ${choice.pairs} lone pairs`, async ({ page }) => {
    const diagram = await openDiagram(page, PAGE, NAME);

    await diagram.getByRole('combobox', { name: 'Molecule' }).selectOption(choice.id);

    await expect(diagram.getByRole('status')).toContainText(choice.readout);
    await expect(diagram.getByRole('status')).toContainText(`Molecular shape: ${choice.shape}.`);
    await expect(terminalAtoms(diagram)).toHaveCount(choice.atoms);
    await expect(lonePairs(diagram)).toHaveCount(choice.pairs);
  });
}

test('the arrow keys turn the drawing and leave the readout alone', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  const start = await atomPositions(diagram);

  await diagram.getByRole('group', { name: TURN }).focus();
  await page.keyboard.press('ArrowRight');
  const turned = await atomPositions(diagram);
  await page.keyboard.press('ArrowDown');
  const tipped = await atomPositions(diagram);

  expect(turned).not.toEqual(start);
  expect(tipped).not.toEqual(turned);
  await expect(diagram.getByRole('status')).toHaveText(START);
});

for (const key of ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']) {
  test(`${key} turns the molecule instead of scrolling the page`, async ({ page }) => {
    const diagram = await openDiagram(page, PAGE, NAME);
    await watchKeyCancelation(page);
    await diagram.getByRole('group', { name: TURN }).focus();

    await page.keyboard.press(key);

    await expect(page.locator('body')).toHaveAttribute('data-key-canceled', 'true');
  });
}

test('other keys keep their usual job while the drawing has focus', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  await watchKeyCancelation(page);
  await diagram.getByRole('group', { name: TURN }).focus();

  await page.keyboard.press('PageDown');

  await expect(page.locator('body')).toHaveAttribute('data-key-canceled', 'false');
});

// Alt+Left is the browser's Back, Ctrl+Left and Meta+Left move by word or go back: not the drawing's to take.
for (const modifier of ['Alt', 'Control', 'Meta']) {
  test(`${modifier} with an arrow key keeps its usual job and leaves the drawing alone`, async ({ page }) => {
    const diagram = await openDiagram(page, PAGE, NAME);
    await watchKeyCancelation(page);
    const start = await atomPositions(diagram);
    await diagram.getByRole('group', { name: TURN }).focus();

    await page.keyboard.press(`${modifier}+ArrowLeft`);

    await expect(page.locator('body')).toHaveAttribute('data-key-canceled', 'false');
    expect(await atomPositions(diagram)).toEqual(start);
  });
}

test('the arrow keys do nothing while the drawing is not focused', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  const start = await atomPositions(diagram);
  await diagram.getByRole('button', { name: 'Reset view' }).focus();

  for (const key of ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown']) await page.keyboard.press(key);

  expect(await atomPositions(diagram)).toEqual(start);
});

// Tipping past straight up or straight down would turn the molecule over; the
// view stops there instead. From the start (20° down), 8 presses of Up and 6 of
// Down are enough to pass it, so a later press changes nothing.
for (const [key, presses] of [
  ['ArrowUp', 8],
  ['ArrowDown', 6],
] as const) {
  test(`${key} stops tipping the molecule at straight up or down`, async ({ page }) => {
    const diagram = await openDiagram(page, PAGE, NAME);
    await diagram.getByRole('group', { name: TURN }).focus();
    for (let press = 0; press < presses; press++) await page.keyboard.press(key);
    const atTheStop = await atomPositions(diagram);

    for (let press = 0; press < 10; press++) await page.keyboard.press(key);

    expect(await atomPositions(diagram)).toEqual(atTheStop);
  });
}

test('turning moves each atom rather than handing its drawing to another atom', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  await terminalAtoms(diagram).evaluateAll((circles) =>
    circles.forEach((c) => c.setAttribute('data-first-drawn-as', c.getAttribute('data-index') ?? '')),
  );
  await diagram.getByRole('group', { name: TURN }).focus();

  // Far enough that the atoms swap places front to back.
  for (let press = 0; press < 6; press++) await page.keyboard.press('ArrowRight');

  const drawnAs = await terminalAtoms(diagram).evaluateAll((circles) =>
    circles.map((c) => [c.getAttribute('data-first-drawn-as'), c.getAttribute('data-index')]),
  );
  expect(drawnAs.filter(([first, now]) => first !== now)).toEqual([]);
});

test('the drawing says it is a rotatable 3D model', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await expect(diagram.getByRole('group', { name: TURN })).toHaveAttribute('aria-roledescription', 'rotatable 3D model');
});

test('dragging the drawing turns the molecule', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  const start = await atomPositions(diagram);
  const box = await drawingBox(diagram);

  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 60, box.y + box.height / 2, { steps: 5 });
  await page.mouse.up();

  expect(await atomPositions(diagram)).not.toEqual(start);
  await expect(diagram.getByRole('status')).toHaveText(START);
});

test('a drag ends when the button is let go: moving over the drawing afterward does not turn it', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  const box = await drawingBox(diagram);
  const middle = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  await page.mouse.move(middle.x, middle.y);
  await page.mouse.down();
  await page.mouse.move(middle.x + 60, middle.y, { steps: 5 });
  await page.mouse.up();
  const dragged = await atomPositions(diagram);

  await page.mouse.move(middle.x - 40, middle.y + 20, { steps: 5 });
  await page.mouse.move(middle.x + 30, middle.y - 25, { steps: 5 });

  expect(await atomPositions(diagram)).toEqual(dragged);
});

test('a drag that goes on past the edge of the drawing still turns it', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  const start = await atomPositions(diagram);
  const box = await drawingBox(diagram);
  const viewport = page.viewportSize();
  if (!viewport) throw new Error('The page has no viewport size.');
  // One move, ending outside the drawing: only a drawing that kept hold of the
  // pointer is told about it. Aim to the right if there is room, else the left.
  const toTheRight = box.x + box.width + 12 < viewport.width;
  if (!toTheRight && box.x - 12 < 0) throw new Error('There is no room beside the drawing to drag into.');
  const startX = toTheRight ? box.x + box.width - 2 : box.x + 2;
  const endX = toTheRight ? box.x + box.width + 12 : box.x - 12;
  const y = box.y + box.height / 2;

  await page.mouse.move(startX, y);
  await page.mouse.down();
  await page.mouse.move(endX, y);
  await page.mouse.up();

  expect(await atomPositions(diagram)).not.toEqual(start);
});

test('Reset view puts the molecule back where it started', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  const start = await atomPositions(diagram);
  await diagram.getByRole('group', { name: TURN }).focus();
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('ArrowUp');
  expect(await atomPositions(diagram)).not.toEqual(start);

  await diagram.getByRole('button', { name: 'Reset view' }).click();

  expect(await atomPositions(diagram)).toEqual(start);
});

test('turning one molecule and choosing another shows the new one at its own start view', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  const molecule = diagram.getByRole('combobox', { name: 'Molecule' });
  await molecule.selectOption('PCl5');
  const fresh = await atomPositions(diagram);
  await molecule.selectOption('CH4');
  await diagram.getByRole('group', { name: TURN }).focus();
  await page.keyboard.press('ArrowRight');

  await molecule.selectOption('PCl5');

  expect(await atomPositions(diagram)).toEqual(fresh);
});

test.describe('with JavaScript off', () => {
  test.use({ javaScriptEnabled: false });

  test('the viewer shows methane and its readout, and no controls', async ({ page }) => {
    await expectStaticDiagram(page, PAGE, NAME, START);
  });

  test('the drawing does not offer itself to the keyboard', async ({ page }) => {
    await page.goto(PAGE);

    await expect(page.locator('.shape-stage')).not.toHaveAttribute('tabindex');
  });
});
