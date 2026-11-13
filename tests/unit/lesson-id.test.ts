import { describe, expect, it } from 'vitest';
import { lessonIdMatchesTopic } from '../../src/lib/lesson-id';

describe('lessonIdMatchesTopic', () => {
  it.each([
    ['unit-5/5-2-rate-law', '5.2'],
    ['unit-3/3-13-beer-lambert-law', '3.13'],
    ['unit-1/1-1-x', '1.1'],
    ['unit-5/5-2-2nd-order', '5.2'],
  ])('accepts %s for topic %s', (id, topic) => {
    expect(lessonIdMatchesTopic(id, topic)).toBe(true);
  });

  it.each([
    ['the wrong unit folder', 'unit-6/5-2-rate-law', '5.2'],
    ['the wrong topic number', 'unit-5/5-3-rate-law', '5.2'],
    ['no slug', 'unit-5/5-2', '5.2'],
    ['a longer topic number that starts with the right digits', 'unit-5/5-20-x', '5.2'],
    ['a shorter topic number than the id', 'unit-5/5-2-x', '5.20'],
    ['no folder', '5-2-rate-law', '5.2'],
    ['uppercase in the slug', 'unit-5/5-2-Rate-Law', '5.2'],
    ['an underscore in the slug', 'unit-5/5-2-rate_law', '5.2'],
    ['a leading zero in the topic number', 'unit-5/5-02-rate-law', '5.2'],
    ['an extra folder level', 'unit-5/extra/5-2-rate-law', '5.2'],
    ['a file extension left on', 'unit-5/5-2-rate-law.mdx', '5.2'],
    ['an empty id', '', '5.2'],
    ['an empty topic', 'unit-5/5-2-rate-law', ''],
  ])('rejects %s', (_reason, id, topic) => {
    expect(lessonIdMatchesTopic(id, topic)).toBe(false);
  });
});
