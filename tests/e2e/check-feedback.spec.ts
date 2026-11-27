import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';
import { FEEDBACK_UNITS } from '../../scripts/check-dist.mjs';
import { units } from '../../src/data/units';

// Every unit on FEEDBACK_UNITS has a data file of messages, the master copy
// they were written into the lessons from. On each lesson page, one wrong
// option of every Check with options, and one slip of every typed-number
// Check, must show the message the data file gives for it.

interface Option {
  text: string;
  message: string | null;
}
interface Slip {
  value: string;
  message: string;
}
interface FeedbackCheck {
  file: string;
  check: number;
  kind: 'choice' | 'numeric';
  options?: Option[];
  slips?: Slip[];
}

const PLANS = fileURLToPath(new URL('../../docs/superpowers/plans/', import.meta.url));

function feedbackFile(unit: string): FeedbackCheck[] {
  const names = fs.readdirSync(PLANS).filter((name) => name.endsWith(`-chemstudy-unit-${unit}-check-feedback.json`));
  if (names.length !== 1) throw new Error(`Unit ${unit} is on FEEDBACK_UNITS but has ${names.length} data files.`);
  return JSON.parse(fs.readFileSync(path.join(PLANS, names[0]), 'utf8')).checks;
}

for (const unit of FEEDBACK_UNITS) {
  const slug = units.find((u) => String(u.number) === unit)?.slug;
  if (!slug) throw new Error(`Unit ${unit} is on FEEDBACK_UNITS but not in src/data/units.ts.`);
  const byLesson = Map.groupBy(feedbackFile(unit), (check) => path.basename(check.file, '.mdx'));

  test.describe(`unit ${unit}: the message for a wrong answer`, () => {
    // The messages do not depend on the width of the page; one project is enough.
    test.beforeEach(({}, testInfo) => {
      test.skip(testInfo.project.name !== 'desktop', 'checked on the desktop project');
    });

    for (const [lesson, checks] of byLesson) {
      test(lesson, async ({ page }) => {
        await page.goto(`/${slug}/${lesson}/`);
        const cards = page.locator('cs-check');
        await expect(cards).toHaveCount(checks.length);
        for (const check of checks) {
          const card = cards.nth(check.check - 1);
          const feedback = card.locator('.check-feedback');
          if (check.kind === 'choice') {
            const index = check.options!.findIndex((option) => option.message !== null);
            await card.locator('.check-option').nth(index).click();
            await expect(feedback, `Check ${check.check}, option ${index + 1}`).toHaveText(
              `Not quite. ${check.options![index].message}`,
            );
          } else {
            const [slip] = check.slips!;
            await card.locator('input').fill(slip.value);
            await card.locator('input').press('Enter');
            await expect(feedback, `Check ${check.check}, slip ${slip.value}`).toHaveText(`Not quite. ${slip.message}`);
          }
        }
      });
    }
  });
}
