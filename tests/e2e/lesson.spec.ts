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
  // Unit 5's Checks name the likely mistake (the unit's check feedback data file).
  await expect(feedback).toHaveText(
    'Not quite. Zero order means the rate does not change when the concentration of A changes. Here it does.',
  );
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

test('the topic is not complete while a check is still unanswered', async ({ page }) => {
  await page.goto(LESSON);
  const checks = page.locator('cs-check');

  await checks.nth(0).locator('.check-option').nth(2).click();
  await checks.nth(1).locator('.check-option').nth(1).click();

  await expect(checks.nth(1).locator('.check-feedback')).toHaveText('Correct.');
  await expect(page.locator('[data-complete]')).toBeHidden();
});

test('a wrong numeric answer says so and does not complete the topic', async ({ page }) => {
  await page.goto(LESSON);
  const checks = page.locator('cs-check');
  await checks.nth(0).locator('.check-option').nth(2).click();
  await checks.nth(1).locator('.check-option').nth(1).click();

  await checks.nth(2).locator('input').fill('0.5');
  await checks.nth(2).locator('input').press('Enter');

  await expect(checks.nth(2).locator('.check-feedback')).toContainText('Not quite');
  await expect(page.locator('[data-complete]')).toBeHidden();
});

test('finishing every check marks the topic done in the topic navigation', async ({ page }) => {
  await page.goto(LESSON);
  const entry = page.locator('[data-topic-link="5.2"]');
  await expect(entry).not.toHaveClass(/is-done/);

  const checks = page.locator('cs-check');
  await checks.nth(0).locator('.check-option').nth(2).click();
  await checks.nth(1).locator('.check-option').nth(1).click();
  await checks.nth(2).locator('input').fill('0.020');
  await checks.nth(2).locator('input').press('Enter');

  await expect(entry).toHaveClass(/is-done/);
});

test('a numeric check rejects text that is not a number', async ({ page }) => {
  await page.goto(LESSON);
  const numeric = page.locator('cs-check[data-numeric]').first();
  await numeric.locator('input').fill('lots');
  await numeric.locator('input').press('Enter');
  await expect(numeric.locator('.check-feedback')).toContainText('Enter a number');
});

test.describe('giving up on a question', () => {
  test('a stuck student can show the answer to a numeric question, written as the lesson wrote it', async ({
    page,
  }) => {
    await page.goto(LESSON);
    const numeric = page.locator('cs-check[data-numeric]').first();
    await numeric.locator('input').fill('0.5');
    await numeric.locator('input').press('Enter');
    await expect(numeric.locator('.check-feedback')).toContainText('Not quite');

    await numeric.getByText('Show answer').click();

    await expect(numeric.locator('.check-answer')).toBeVisible();
    await expect(numeric.locator('.check-answer')).toHaveText('Answer: 0.020 M/s');
    await expect(numeric.locator('.check-why > div')).toBeVisible();
  });

  test('a choice question offers the same way out', async ({ page }) => {
    await page.goto(LESSON);
    const first = page.locator('cs-check').first();

    await first.getByText('Show answer').click();

    await expect(first.locator('.check-answer')).toHaveText('Answer: option 3');
    await expect(first.locator('.check-answer')).toBeVisible();
  });

  test('showing every answer does not complete the topic', async ({ page }) => {
    await page.goto(LESSON);
    const checks = page.locator('cs-check');
    const count = await checks.count();
    expect(count).toBeGreaterThanOrEqual(3);
    for (let index = 0; index < count; index += 1) {
      await checks.nth(index).getByText('Show answer').click();
      await expect(checks.nth(index).locator('.check-answer')).toBeVisible();
    }

    await expect(page.locator('[data-complete]')).toBeHidden();
    // The badge is hidden until told otherwise, so look at what was stored too.
    const stored = await page.evaluate(() => localStorage.getItem('chemstudy:progress:v1'));
    expect(JSON.parse(stored ?? '{}')).toMatchObject({ answered: {}, done: [] });
  });

  test('a question can still be answered after its answer was shown', async ({ page }) => {
    await page.goto(LESSON);
    const numeric = page.locator('cs-check[data-numeric]').first();
    await numeric.getByText('Show answer').click();

    await numeric.locator('input').fill('0.020');
    await numeric.locator('input').press('Enter');

    await expect(numeric.locator('.check-feedback')).toHaveText('Correct.');
  });
});

test('the numeric input brings up the full keyboard, so a minus sign and an exponent can be typed', async ({
  page,
}) => {
  await page.goto(LESSON);
  const input = page.locator('cs-check[data-numeric] input').first();

  // The decimal keypad on an iPhone has no minus sign and no letter e.
  await expect(input).not.toHaveAttribute('inputmode');
  await expect(input).toHaveAttribute('autocapitalize', 'off');
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

  // Lesson 5.2 has no explanation with two paragraphs in a row; lesson 7.1 has several.
  test('a paragraph that follows a paragraph in a check explanation has space above it', async ({ page }) => {
    await page.goto('/unit-7-equilibrium/7-1-introduction-to-equilibrium/');
    expect(await marginTopOf(page, '.check-why > div > p + p')).toBeGreaterThan(0);
  });

  test('a list that follows a paragraph in a check explanation has space above it', async ({ page }) => {
    await page.goto('/unit-1-atomic-structure/1-4-composition-of-mixtures/');
    expect(await marginTopOf(page, '.check-why > div > p + ul')).toBeGreaterThan(0);
  });

  test('an equation in a check explanation keeps its own space above it', async ({ page }) => {
    await page.goto('/unit-7-equilibrium/7-1-introduction-to-equilibrium/');
    const text = await marginTopOf(page, '.check-why > div > p + p');
    expect(await marginTopOf(page, '.check-why > div > p + .katex-display')).toBeGreaterThan(text);
  });

  test('the question sits clear of its "Check yourself" label', async ({ page }) => {
    expect(await marginTopOf(page, 'cs-check > .check-body')).toBeGreaterThan(0);
  });

  test('the numeric input does not touch its label text or its unit', async ({ page }) => {
    const gaps = await page
      .locator('.check-numeric label')
      .first()
      .evaluate((label) => {
        const input = label.querySelector('input');
        const before = label.firstChild;
        const after = label.lastChild;
        if (!input || !before || !after) throw new Error('The numeric check is missing its input, label text or unit.');
        const range = document.createRange();
        const boxOf = (node: ChildNode) => {
          range.selectNodeContents(node);
          return range.getBoundingClientRect();
        };
        const box = input.getBoundingClientRect();
        return { before: box.left - boxOf(before).right, after: boxOf(after).left - box.right };
      });

    expect(gaps.before).toBeGreaterThanOrEqual(6);
    expect(gaps.after).toBeGreaterThanOrEqual(6);
  });
});

test('the lesson fits a phone screen without sideways scrolling', async ({ page }) => {
  await page.goto(LESSON);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});

test.describe('feedback on a wrong answer', () => {
  const UNIT_1 = '/unit-1-atomic-structure/';

  test('a wrong option says what went wrong, and the right one still explains itself', async ({ page }) => {
    await page.goto(`${UNIT_1}1-3-elemental-composition-of-pure-substances/`);
    const check = page.locator('cs-check').nth(1);
    const feedback = check.locator('.check-feedback');
    const options = check.locator('.check-option');

    await options.nth(1).click();
    await expect(feedback).toHaveText(
      'Not quite. Check the mole ratio before you round. Is it within a few hundredths of a whole number? If not, multiply both numbers until both are whole.',
    );
    await expect(check.locator('.check-why')).not.toHaveAttribute('open', '');

    await options.nth(3).click();
    await expect(feedback).toHaveText(
      'Not quite. That reads the masses, 3.00 g to 2.00 g, as a ratio of atoms. Compare moles, not grams.',
    );

    await options.nth(0).click();
    await expect(feedback).toHaveText('Correct.');
    await expect(check.locator('.check-why')).toHaveAttribute('open', '');
  });

  test('a typed number that a known slip gives gets the message of that slip', async ({ page }) => {
    await page.goto(`${UNIT_1}1-3-elemental-composition-of-pure-substances/`);
    const check = page.locator('cs-check').first();
    const input = check.locator('input');
    const feedback = check.locator('.check-feedback');

    await input.fill('9.39');
    await input.press('Enter');
    await expect(feedback).toHaveText('Not quite. The formula has two lithium atoms. Count both.');

    // Within 1 percent of the slip, so the same message.
    await input.fill('9.4');
    await input.press('Enter');
    await expect(feedback).toHaveText('Not quite. The formula has two lithium atoms. Count both.');

    // Near no slip.
    await input.fill('12');
    await input.press('Enter');
    await expect(feedback).toHaveText('Not quite. Check your setup and try again.');

    await input.fill('18.78');
    await input.press('Enter');
    await expect(feedback).toHaveText('Correct.');
  });

  test('a slip that 2 percent would have accepted is refused, and a rounded answer is not', async ({ page }) => {
    await page.goto(`${UNIT_1}1-1-moles-and-molar-mass/`);
    const check = page.locator('cs-check').nth(4);
    const input = check.locator('input');
    const feedback = check.locator('.check-feedback');

    await input.fill('9.35e21');
    await input.press('Enter');
    await expect(feedback).toHaveText(
      'Not quite. Close, but check the molar mass. The 2 outside the parentheses doubles the H as well as the O.',
    );

    await input.fill('9.3e21');
    await input.press('Enter');
    await expect(feedback).toHaveText('Correct.');
  });

  test('leaving out a peak is refused in lesson 1.2, and whole-number masses are still accepted', async ({ page }) => {
    await page.goto(`${UNIT_1}1-2-mass-spectra-of-elements/`);
    const check = page.locator('cs-check').nth(2);
    const input = check.locator('input');
    const feedback = check.locator('.check-feedback');

    await input.fill('64.95');
    await input.press('Enter');
    await expect(feedback).toHaveText(
      'Not quite. Did you leave out a small peak, or round your answer? The fractions should add up to 1; give the average to two decimal places.',
    );

    // Inside the 1 percent of the slip 66.18, but nearer the answer: not told it made that slip.
    await input.fill('65.72');
    await input.press('Enter');
    await expect(feedback).toHaveText('Not quite. Check your setup and try again.');

    await input.fill('65.45');
    await input.press('Enter');
    await expect(feedback).toHaveText('Correct.');
  });

  test('the longest message does not make a 320px page scroll sideways', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto(`${UNIT_1}1-3-elemental-composition-of-pure-substances/`);
    const check = page.locator('cs-check').nth(1);

    await check.locator('.check-option').nth(1).click();
    await expect(check.locator('.check-feedback')).toContainText('within a few hundredths of a whole number');
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth),
    ).toBeLessThanOrEqual(0);
  });
});
