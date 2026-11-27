import fs from 'node:fs';
import { describe, expect, it } from 'vitest';

/**
 * Units whose answers have been spread over the four options. Add a unit when
 * its Checks are balanced; the other units are listed, with their counts, in
 * the design of 2026-11-26.
 */
const BALANCED_UNITS = [1, 2];
const LOWEST_SHARE = 0.15;
const HIGHEST_SHARE = 0.35;

/** The option number of the answer of every Check with options, in a unit's lessons. */
function answerPositions(unit: number): number[] {
  const folder = new URL(`../../src/content/lessons/unit-${unit}/`, import.meta.url);
  return fs
    .readdirSync(folder)
    .filter((name) => name.endsWith('.mdx'))
    .flatMap((name) => {
      const lesson = fs.readFileSync(new URL(name, folder), 'utf8');
      // The answer comes first in a Check's tag, and no message holds ">".
      return [...lesson.matchAll(/<Check\b[^>]*?\banswer=\{(\d+)\}/g)].map((match) => Number(match[1]));
    });
}

describe.each(BALANCED_UNITS)('where the answers of unit %i sit', (unit) => {
  const positions = answerPositions(unit);

  it('has enough Checks with options for shares to mean something', () => {
    expect(positions.length).toBeGreaterThanOrEqual(12);
  });

  it.each([1, 2, 3, 4])('option %i is the answer for 15 to 35 percent of them', (option) => {
    const share = positions.filter((position) => position === option).length / positions.length;
    expect(share, `${Math.round(share * 100)} percent`).toBeGreaterThanOrEqual(LOWEST_SHARE);
    expect(share, `${Math.round(share * 100)} percent`).toBeLessThanOrEqual(HIGHEST_SHARE);
  });
});
