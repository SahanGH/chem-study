import { expect, test, type Page } from '@playwright/test';

const LESSON = '/unit-5-kinetics/5-2-rate-law/';

test('a lesson shows its topic, title and all its building blocks', async ({ page }) => {
  await page.goto(LESSON);
  await expect(page.getByRole('heading', { level: 1, name: 'Introduction to Rate Law' })).toBeVisible();
  await expect(page.locator('.kicker')).toContainText('Topic 5.2');
  for (const part of ['key-idea', 'worked', 'trap', 'key-points', 'practice-next', 'figure']) {
    await expect(page.locator(`[data-part="${part}"]`).first()).toBeVisible();
  }
  expect(await page.locator('cs-check').count()).toBeGreaterThanOrEqual(3);
});

test('chemical equations are typeset, not left as source text', async ({ page }) => {
  await page.goto(LESSON);
  const visible = await page.locator('article .katex-html').allInnerTexts();
  expect(visible.length).toBeGreaterThan(5);
  expect(visible.join(' ')).not.toContain('\\ce');
  expect(await page.locator('.katex-error').count()).toBe(0);
});

test('a wrong answer says so, a right answer explains itself, and the keyboard works', async ({ page }) => {
  await page.goto(LESSON);
  const first = page.locator('cs-check').first();
  const feedback = first.locator('.check-feedback');
  const options = first.locator('.check-option');

  await options.nth(0).click();
  await expect(feedback).toHaveText('Not quite. Try another.');
  await expect(first.locator('.check-why')).not.toHaveAttribute('open', '');

  await options.nth(2).focus();
  await page.keyboard.press('Enter');
  await expect(feedback).toHaveText('Correct.');
  await expect(first.locator('.check-why')).toHaveAttribute('open', '');
});

test('answering every check completes the topic, and the device remembers', async ({ page }) => {
  await page.goto(LESSON);
  await expect(page.locator('[data-complete]')).toBeHidden();

  const checks = page.locator('cs-check');
  await checks.nth(0).locator('.check-option').nth(2).click();
  await checks.nth(1).locator('.check-option').nth(1).click();
  await checks.nth(2).locator('input').fill('0.020');
  await checks.nth(2).locator('input').press('Enter');
  await expect(checks.nth(2).locator('.check-feedback')).toHaveText('Correct.');
  await expect(page.locator('[data-complete]')).toBeVisible();

  await page.reload();
  await expect(page.locator('[data-complete]')).toBeVisible();
});

test('a numeric check rejects text that is not a number', async ({ page }) => {
  await page.goto(LESSON);
  const numeric = page.locator('cs-check[data-numeric]').first();
  await numeric.locator('input').fill('lots');
  await numeric.locator('input').press('Enter');
  await expect(numeric.locator('.check-feedback')).toContainText('Enter a number');
});

// Playwright's print emulation applies the @media print CSS but does not fire
// beforeprint, so these tests prove the CSS path only. The script path has its
// own test below.
test.describe('printing a lesson', () => {
  async function expectEveryAnswerShown(page: Page) {
    await page.emulateMedia({ media: 'print' });
    await page.goto(LESSON);
    const checks = page.locator('cs-check');
    expect(await checks.count()).toBe(3);
    for (let index = 0; index < 3; index += 1) {
      const check = checks.nth(index);
      await expect(check.locator('.check-answer')).toBeVisible();
      await expect(check.locator('.check-why > div')).toBeVisible();
    }
  }

  test('shows every answer and explanation on paper before anything is answered', async ({ page }) => {
    await expectEveryAnswerShown(page);
  });

  test.describe('with JavaScript off', () => {
    test.use({ javaScriptEnabled: false });

    test('shows every answer and explanation on paper', async ({ page }) => {
      await expectEveryAnswerShown(page);
    });
  });

  test('leaves the "Topic complete" badge off the page', async ({ page }) => {
    await page.goto(LESSON);
    const checks = page.locator('cs-check');
    await checks.nth(0).locator('.check-option').nth(2).click();
    await checks.nth(1).locator('.check-option').nth(1).click();
    await checks.nth(2).locator('input').fill('0.020');
    await checks.nth(2).locator('input').press('Enter');
    await expect(page.locator('[data-complete]')).toBeVisible();

    await page.emulateMedia({ media: 'print' });

    await expect(page.locator('[data-complete]')).toBeHidden();
  });
});

test('opening the answers for printing is undone afterwards, check by check', async ({ page }) => {
  await page.goto(LESSON);
  const checks = page.locator('cs-check');
  await checks.nth(0).locator('.check-option').nth(2).click();
  const whys = page.locator('.check-why');
  const openStates = () => whys.evaluateAll((all) => all.map((el) => (el as HTMLDetailsElement).open));
  expect(await openStates()).toEqual([true, false, false]);

  await page.evaluate(() => window.dispatchEvent(new Event('beforeprint')));
  expect(await openStates()).toEqual([true, true, true]);

  await page.evaluate(() => window.dispatchEvent(new Event('afterprint')));
  expect(await openStates()).toEqual([true, false, false]);
});

test.describe('option names for assistive technology', () => {
  test('every option has an accessible name, and the math-only options all differ', async ({ page }) => {
    await page.goto(LESSON);
    const options = page.locator('.check-option');
    const count = await options.count();
    expect(count).toBe(8);
    for (let index = 0; index < count; index += 1) {
      await expect(options.nth(index)).toHaveAccessibleName(/\S/);
    }

    const snapshot = await page.locator('cs-check').nth(1).locator('.check-options').ariaSnapshot();
    const names = Array.from(snapshot.matchAll(/- button(?: "([^"]*)")?/g), (match) => match[1] ?? '');
    expect(names).toHaveLength(4);
    expect(new Set(names).size).toBe(4);
  });

  test('plain-text options keep their own text as the name, with no aria-label', async ({ page }) => {
    await page.goto(LESSON);
    const options = page.locator('cs-check').first().locator('.check-option');
    await expect(options).toHaveCount(4);
    for (let index = 0; index < 4; index += 1) {
      await expect(options.nth(index)).not.toHaveAttribute('aria-label');
    }
    await expect(options.nth(2)).toHaveAccessibleName('2');
  });

  test('an option whose readable text is empty leaves the no-JavaScript version in place', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(LESSON);

    await page.evaluate(() => {
      document.body.insertAdjacentHTML(
        'beforeend',
        `<cs-check id="probe" data-answer="1">
           <div class="check-body"><ul>
             <li>plain</li>
             <li><span class="katex"><span class="katex-html" aria-hidden="true">x</span></span></li>
           </ul></div>
           <p class="check-feedback"></p>
           <details class="check-why"><summary>Show answer</summary></details>
         </cs-check>`,
      );
    });

    await expect.poll(() => errors.join(' ')).toContain('no readable text');
    const probe = page.locator('#probe');
    await expect(probe).not.toHaveClass(/is-enhanced/);
    await expect(probe.locator('button')).toHaveCount(0);
    await expect(probe.locator('li').first()).toHaveText('plain');
  });
});

test.describe('lesson spacing', () => {
  async function marginTopOf(page: Page, selector: string) {
    const target = page.locator(selector).first();
    await expect(target, `${selector} should exist on the lesson`).toHaveCount(1);
    return target.evaluate((element) => parseFloat(getComputedStyle(element).marginTop));
  }

  test.beforeEach(async ({ page }) => {
    await page.goto(LESSON);
  });

  test('a paragraph that follows a paragraph has space above it', async ({ page }) => {
    expect(await marginTopOf(page, 'article > p + p')).toBeGreaterThan(0);
  });

  test('a list that follows a paragraph has space above it', async ({ page }) => {
    expect(await marginTopOf(page, 'article > p + ul')).toBeGreaterThan(0);
  });

  test('a paragraph inside a worked example has space above it', async ({ page }) => {
    expect(await marginTopOf(page, '.worked > * + p')).toBeGreaterThan(0);
  });

  test('the option list is not indented', async ({ page }) => {
    await expect(page.locator('.check-options').first()).toHaveCSS('padding-left', '0px');
  });

  test('the check feedback line has space above it', async ({ page }) => {
    expect(await marginTopOf(page, '.check-feedback')).toBeGreaterThan(0);
  });
});

test('the lesson fits a phone screen without sideways scrolling', async ({ page }) => {
  await page.goto(LESSON);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});
