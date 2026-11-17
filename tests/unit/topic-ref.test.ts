import { describe, expect, it } from 'vitest';
import { topicLabel } from '../../src/lib/topic-ref';

// Any value will do for a lesson: the function only says whether there is one.
const lessons = new Map<string, string>([
  ['3.4', 'the lesson for 3.4'],
  ['7.11', 'the lesson for 7.11'],
]);

describe('topicLabel', () => {
  it('words the label as the topic code and its title from src/data/units.ts', () => {
    expect(topicLabel('3.4', lessons).label).toBe('Topic 3.4, Ideal Gas Law');
  });

  it('keeps an en dash in a title that has one', () => {
    expect(topicLabel('8.9', lessons).label).toBe('Topic 8.9, Henderson–Hasselbalch Equation');
  });

  it('gives the lesson when the topic has one, so the label is a link', () => {
    expect(topicLabel('3.4', lessons).lesson).toBe('the lesson for 3.4');
  });

  it('gives no lesson when the topic has none, so the label is plain text', () => {
    expect(topicLabel('8.9', lessons).lesson).toBeUndefined();
  });

  it('gives no lesson when no lessons exist at all', () => {
    expect(topicLabel('3.4', new Map()).lesson).toBeUndefined();
  });

  it('gives the unit the topic belongs to, for the lesson address', () => {
    expect(topicLabel('7.11', lessons).unit.slug).toBe('unit-7-equilibrium');
  });

  it('accepts the first and last topic of a unit', () => {
    expect(topicLabel('1.1', lessons).label).toBe('Topic 1.1, Moles and Molar Mass');
    expect(topicLabel('3.13', lessons).label).toBe('Topic 3.13, Beer–Lambert Law');
  });

  it.each([
    ['a topic number past the end of its unit', '3.99'],
    ['a unit that does not exist', '12.1'],
    ['topic zero', '3.0'],
    ['a code with no dot', '34'],
    ['an empty code', ''],
    ['a code with a space', '3.4 '],
  ])('throws for %s, naming the code and saying what to use', (_reason, code) => {
    expect(() => topicLabel(code, lessons)).toThrow(
      new RegExp(`"${code}".*is not an AP topic.*topic number from src/data/units\\.ts`),
    );
  });
});
