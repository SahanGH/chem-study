import { describe, expect, it } from 'vitest';
import { topicByCode, unitBySlug, units } from '../../src/data/units';

describe('units data', () => {
  it('has the nine AP units in order', () => {
    expect(units.map((u) => u.number)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it('has the topic count of the 2024 course framework for each unit', () => {
    expect(units.map((u) => u.topics.length)).toEqual([8, 7, 13, 9, 11, 9, 12, 11, 11]);
  });

  it('numbers topics consecutively within each unit', () => {
    for (const unit of units) {
      const expected = unit.topics.map((_, i) => `${unit.number}.${i + 1}`);
      expect(unit.topics.map((t) => t.code)).toEqual(expected);
    }
  });

  it('gives every unit a unique slug that starts with its number', () => {
    const slugs = units.map((u) => u.slug);
    expect(new Set(slugs).size).toBe(9);
    for (const unit of units) expect(unit.slug.startsWith(`unit-${unit.number}-`)).toBe(true);
  });

  it('finds a topic and its unit by code', () => {
    const found = topicByCode('5.2');
    expect(found?.unit.number).toBe(5);
    expect(found?.topic.title).toBe('Introduction to Rate Law');
  });

  it('returns undefined for an unknown topic code or slug', () => {
    expect(topicByCode('5.99')).toBeUndefined();
    expect(unitBySlug('unit-12-nope')).toBeUndefined();
  });

  it('finds a unit by slug', () => {
    expect(unitBySlug('unit-5-kinetics')?.title).toBe('Kinetics');
  });
});
