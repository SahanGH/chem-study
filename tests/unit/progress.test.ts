import { describe, expect, it } from 'vitest';
import { createProgress, type KeyValueStore } from '../../src/lib/progress';

function memoryStore(initial: Record<string, string> = {}): KeyValueStore & { data: Record<string, string> } {
  const data = { ...initial };
  return {
    data,
    getItem: (key) => (key in data ? data[key] : null),
    setItem: (key, value) => {
      data[key] = value;
    },
  };
}

describe('progress', () => {
  it('reports nothing done on a fresh device', () => {
    const progress = createProgress(memoryStore());
    expect(progress.isDone('5.2')).toBe(false);
    expect(progress.lastVisited()).toBeNull();
    expect(progress.unitProgress(['5.1', '5.2'])).toEqual({ done: 0, total: 2 });
  });

  it('marks a topic done only when every check has been answered', () => {
    const progress = createProgress(memoryStore());
    expect(progress.recordAnswer('5.2', 0, 3)).toBe(false);
    expect(progress.recordAnswer('5.2', 1, 3)).toBe(false);
    expect(progress.isDone('5.2')).toBe(false);
    expect(progress.recordAnswer('5.2', 2, 3)).toBe(true);
    expect(progress.isDone('5.2')).toBe(true);
  });

  it('does not count the same check twice', () => {
    const progress = createProgress(memoryStore());
    progress.recordAnswer('5.2', 0, 2);
    progress.recordAnswer('5.2', 0, 2);
    expect(progress.isDone('5.2')).toBe(false);
  });

  it('marks a topic done directly', () => {
    const progress = createProgress(memoryStore());
    progress.markDone('5.1');
    expect(progress.isDone('5.1')).toBe(true);
    expect(progress.unitProgress(['5.1', '5.2'])).toEqual({ done: 1, total: 2 });
  });

  it('remembers progress in the store across instances', () => {
    const store = memoryStore();
    createProgress(store).markDone('5.1');
    createProgress(store).setLastVisited({ path: '/unit-5-kinetics/5-2-rate-law/', title: 'Introduction to Rate Law' });
    const later = createProgress(store);
    expect(later.isDone('5.1')).toBe(true);
    expect(later.lastVisited()).toEqual({ path: '/unit-5-kinetics/5-2-rate-law/', title: 'Introduction to Rate Law' });
  });

  it('starts fresh when the stored value is not valid JSON', () => {
    const progress = createProgress(memoryStore({ 'chemstudy:progress:v1': '{not json' }));
    expect(progress.isDone('5.2')).toBe(false);
    progress.markDone('5.2');
    expect(progress.isDone('5.2')).toBe(true);
  });

  it('works for the current page when there is no store at all', () => {
    const progress = createProgress(null);
    progress.markDone('5.2');
    expect(progress.isDone('5.2')).toBe(true);
  });

  it('keeps working when the store refuses writes', () => {
    const store: KeyValueStore = {
      getItem: () => null,
      setItem: () => {
        throw new Error('QuotaExceededError');
      },
    };
    const progress = createProgress(store);
    expect(() => progress.markDone('5.2')).not.toThrow();
    expect(progress.isDone('5.2')).toBe(true);
  });
});
