import { expect, test, type Locator } from '@playwright/test';
import { expectStaticDiagram, openDiagram } from './diagram';

const PAGE = '/unit-5-kinetics/5-11-catalysis/';
const NAME = 'catalyst-profile';
const START = 'Without a catalyst the activation energy is 120 kJ/mol. The reaction releases 50 kJ/mol.';
const withCatalyst = (activationEnergy: number) =>
  `The catalyzed route (dashed curve) has an activation energy of ${activationEnergy} kJ/mol. The original route's is 120 kJ/mol. The reaction still releases 50 kJ/mol.`;

const NUMBER = String.raw`(\d+(?:\.\d+)?)`;
// "M34 150H90C128 150 132 42 165 42S202 195 240 195H306": a flat start, a
// hill whose top is the y written twice before the S, and a flat end.
const PROFILE = new RegExp(
  `^M${NUMBER} ${NUMBER}H${NUMBER}C${NUMBER} ${NUMBER} ${NUMBER} ${NUMBER} ${NUMBER} ${NUMBER}S${NUMBER} ${NUMBER} ${NUMBER} ${NUMBER}H${NUMBER}$`,
);

/** Where a drawn profile starts, peaks and ends, in drawing units. A larger y is lower on the screen. */
async function shapeOf(curve: Locator) {
  const path = await curve.getAttribute('d');
  const match = PROFILE.exec(path ?? '');
  if (!match) throw new Error(`Not an energy profile path: ${path}`);
  const [startX, startY, , , , , peakControlY, , peakY, , , , endY, endX] = match.slice(1).map(Number);
  if (peakControlY !== peakY) throw new Error(`The hill does not arrive level at its top: ${path}`);
  return { startX, startY, peakY, endY, endX };
}

const plainCurve = (diagram: Locator) => diagram.locator('[data-curve="plain"]');
const catalyzedCurve = (diagram: Locator) => diagram.locator('[data-curve="catalyzed"]');

test('the profile starts with no catalyst', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await expect(diagram.getByRole('status')).toHaveText(START);
  await expect(catalyzedCurve(diagram)).toHaveCount(0);
  await expect(diagram.getByRole('slider')).toBeDisabled();
});

test('while there is no catalyst the slider says what to do first', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await expect(diagram.getByRole('slider')).toHaveAccessibleName('Add a catalyst to set its activation energy');
});

test('adding a catalyst from the keyboard says so and frees the slider', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await diagram.getByRole('checkbox', { name: 'Add a catalyst' }).focus();
  await page.keyboard.press('Space');

  await expect(diagram.getByRole('status')).toHaveText(withCatalyst(80));
  await expect(diagram.getByRole('slider')).toBeEnabled();
  await expect(diagram.getByRole('slider')).toHaveAccessibleName('Activation energy with the catalyst: 80 kJ/mol');
});

test('the catalyzed curve is a lower hill between the same two ends', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);

  await diagram.getByRole('checkbox', { name: 'Add a catalyst' }).check();

  const plain = await shapeOf(plainCurve(diagram));
  const catalyzed = await shapeOf(catalyzedCurve(diagram));
  expect({ ...catalyzed, peakY: plain.peakY }).toEqual(plain);
  expect(catalyzed.peakY, 'the catalyzed peak is lower on the screen').toBeGreaterThan(plain.peakY);
  expect(catalyzed.peakY, 'and is still a hill above the reactants').toBeLessThan(catalyzed.startY);
});

test('lowering the catalyzed activation energy from the keyboard lowers the dashed hill', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  await diagram.getByRole('checkbox', { name: 'Add a catalyst' }).check();
  const before = await shapeOf(catalyzedCurve(diagram));

  await diagram.getByRole('slider').focus();
  await page.keyboard.press('ArrowLeft');

  await expect(diagram.getByRole('status')).toHaveText(withCatalyst(70));
  const after = await shapeOf(catalyzedCurve(diagram));
  expect(after.peakY).toBeGreaterThan(before.peakY);
});

for (const end of ['lowest', 'highest'] as const) {
  test(`at the slider's ${end} setting the dashed hill is still below the original and above the reactants`, async ({
    page,
  }) => {
    const diagram = await openDiagram(page, PAGE, NAME);
    await diagram.getByRole('checkbox', { name: 'Add a catalyst' }).check();
    const slider = diagram.getByRole('slider');
    const setting = await slider.getAttribute(end === 'lowest' ? 'min' : 'max');
    if (setting === null) throw new Error(`The slider has no ${end} setting.`);

    await slider.fill(setting);

    const plain = await shapeOf(plainCurve(diagram));
    const catalyzed = await shapeOf(catalyzedCurve(diagram));
    expect(catalyzed.peakY).toBeGreaterThan(plain.peakY);
    expect(catalyzed.peakY).toBeLessThan(catalyzed.startY);
  });
}

test('taking the catalyst away again puts everything back', async ({ page }) => {
  const diagram = await openDiagram(page, PAGE, NAME);
  const checkbox = diagram.getByRole('checkbox', { name: 'Add a catalyst' });
  await checkbox.check();
  await expect(catalyzedCurve(diagram)).toHaveCount(1);

  await checkbox.uncheck();

  await expect(diagram.getByRole('status')).toHaveText(START);
  await expect(catalyzedCurve(diagram)).toHaveCount(0);
  await expect(diagram.getByRole('slider')).toBeDisabled();
});

test.describe('with JavaScript off', () => {
  test.use({ javaScriptEnabled: false });

  test('the profile shows the uncatalyzed reaction and no controls', async ({ page }) => {
    await expectStaticDiagram(page, PAGE, NAME, START);
  });
});
