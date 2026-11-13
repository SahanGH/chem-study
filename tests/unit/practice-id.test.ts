import { describe, expect, it } from 'vitest';
import {
  kindLabel,
  orderedPractice,
  parseTopics,
  practiceIdParts,
  topicFromLessonPath,
  topicsLabel,
} from '../../src/lib/practice-id';

describe('practiceIdParts', () => {
  it('reads the unit and the slug from a file in a unit folder', () => {
    expect(practiceIdParts('unit-5/worksheet-1-rates-and-rate-laws')).toEqual({
      unit: 5,
      slug: 'worksheet-1-rates-and-rate-laws',
    });
  });

  it.each([
    ['a file outside a unit folder', 'worksheet-1'],
    ['a folder that is not a unit', 'kinetics/worksheet-1'],
    ['a deeper folder', 'unit-5/extra/worksheet-1'],
    ['capital letters', 'unit-5/Worksheet-1'],
    ['a space', 'unit-5/worksheet 1'],
    ['a doubled hyphen', 'unit-5/worksheet--1'],
    ['an empty name', 'unit-5/'],
  ])('returns null for %s', (_name, id) => {
    expect(practiceIdParts(id)).toBeNull();
  });
});

describe('topicFromLessonPath', () => {
  it('reads the topic from a lesson address', () => {
    expect(topicFromLessonPath('/unit-5-kinetics/5-2-rate-law/')).toBe('5.2');
  });

  it('reads a two-digit topic number', () => {
    expect(topicFromLessonPath('/unit-5-kinetics/5-11-catalysis/')).toBe('5.11');
  });

  it.each([
    ['the home page', '/'],
    ['a unit page', '/unit-5-kinetics/'],
    ['a practice page', '/unit-5-kinetics/practice/worksheet-1-rates-and-rate-laws/'],
    ['a lesson address without its closing slash', '/unit-5-kinetics/5-2-rate-law'],
    ['the about page', '/about/'],
  ])('returns null for %s', (_name, path) => {
    expect(topicFromLessonPath(path)).toBeNull();
  });
});

describe('parseTopics', () => {
  it('reads one code', () => {
    expect(parseTopics('5.2')).toEqual(['5.2']);
  });

  it('reads several codes separated by commas, with or without spaces', () => {
    expect(parseTopics('5.7, 5.8,5.10')).toEqual(['5.7', '5.8', '5.10']);
  });

  it.each([
    ['an empty text', ''],
    ['a range', '5.7-5.10'],
    ['a word', 'kinetics'],
    ['a code with no topic number', '5.'],
    ['a topic numbered zero', '5.0'],
    ['a trailing comma', '5.1,'],
  ])('throws on %s', (_name, text) => {
    expect(() => parseTopics(text)).toThrow(/not a list of topic codes/);
  });

  it('throws when a topic is named twice', () => {
    expect(() => parseTopics('5.1, 5.1')).toThrow(/twice/);
  });
});

describe('topicsLabel', () => {
  it('names one topic', () => {
    expect(topicsLabel(['5.3'])).toBe('Topic 5.3');
  });

  it('writes neighbors as a range', () => {
    expect(topicsLabel(['5.1', '5.2'])).toBe('Topics 5.1–5.2');
    expect(topicsLabel(['5.9', '5.10', '5.11'])).toBe('Topics 5.9–5.11');
  });

  it('lists topics that are not neighbors', () => {
    expect(topicsLabel(['5.1', '5.3'])).toBe('Topics 5.1, 5.3');
  });

  it('does not write topics from two units as a range', () => {
    expect(topicsLabel(['4.9', '5.10'])).toBe('Topics 4.9, 5.10');
  });

  it('throws when there is no topic', () => {
    expect(() => topicsLabel([])).toThrow(/at least one topic/);
  });
});

describe('orderedPractice', () => {
  const unit5 = new Set(['5.1', '5.2', '5.3']);
  const doc = (id: string, order: number, topics: string[] = ['5.1']) => ({ id, data: { order, topics } });

  it('returns an empty list for no documents', () => {
    expect(orderedPractice([], 5, unit5)).toEqual([]);
  });

  it('sorts by order and leaves the list it was given as it was', () => {
    const docs = [doc('unit-5/c', 3), doc('unit-5/a', 1), doc('unit-5/b', 2)];

    const ordered = orderedPractice(docs, 5, unit5);

    expect(ordered.map((d) => d.id)).toEqual(['unit-5/a', 'unit-5/b', 'unit-5/c']);
    expect(docs.map((d) => d.id)).toEqual(['unit-5/c', 'unit-5/a', 'unit-5/b']);
  });

  it('throws when a document names a topic outside the unit', () => {
    const docs = [doc('unit-5/stray', 1, ['5.1', '4.9'])];

    expect(() => orderedPractice(docs, 5, unit5)).toThrow(/unit-5\/stray.*4\.9.*not a topic of Unit 5/);
  });

  it('throws when two documents share a place in the list', () => {
    const docs = [doc('unit-5/first', 1), doc('unit-5/second', 1)];

    expect(() => orderedPractice(docs, 5, unit5)).toThrow(/order 1: unit-5\/first and unit-5\/second/);
  });
});

describe('kindLabel', () => {
  it('names each kind of practice', () => {
    expect(kindLabel('worksheet')).toBe('Worksheet');
    expect(kindLabel('ladders')).toBe('Skill ladders');
    expect(kindLabel('free-response')).toBe('Free response');
  });
});
