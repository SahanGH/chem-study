import { afterEach, describe, expect, it, vi } from 'vitest';
import { createProgress, type KeyValueStore } from '../../src/lib/progress';

const STORAGE_KEY = 'chemstudy:progress:v1';

function memoryStore(initial: Record<string, string> = {}): KeyValueStore & { data: Record<string, string> } {
  const data = { ...initial };
  return {
    data,
    getItem: (key) => (Object.hasOwn(data, key) ? (data[key] ?? null) : null),
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

  it('remembers answered checks across instances', () => {
    const store = memoryStore();
    createProgress(store).recordAnswer('5.2', 0, 2);

    const later = createProgress(store);

    expect(later.recordAnswer('5.2', 1, 2)).toBe(true);
    expect(later.isDone('5.2')).toBe(true);
  });

  it('replaces corrupt stored JSON on the next write', () => {
    const store = memoryStore({ [STORAGE_KEY]: '{not json' });

    createProgress(store).markDone('5.2');

    expect(JSON.parse(store.data[STORAGE_KEY] ?? '')).toEqual({ answered: {}, done: ['5.2'], last: null });
  });

  it('honors a valid value with absent fields', () => {
    const progress = createProgress(memoryStore({ [STORAGE_KEY]: '{"done":["5.1"]}' }));

    expect(progress.isDone('5.1')).toBe(true);
    expect(progress.lastVisited()).toBeNull();
  });

  it.each([
    '{"done":null}',
    '{"done":"5.1"}',
    '{"done":[5]}',
    '{"answered":null}',
    '{"answered":{"5.2":5}}',
    '{"answered":{"5.2":["0"]}}',
    '{"answered":{"5.2":[-1]}}',
    '{"answered":{"5.2":[1.5]}}',
    '{"last":5}',
    '{"last":{"path":"/x/"}}',
    '{"last":{"path":"javascript:alert(1)","title":"X"}}',
    '{"last":{"path":"//evil.example/x","title":"X"}}',
    '{"last":{"path":"https://evil.example/","title":"X"}}',
    '{"last":{"path":"/\\\\evil.example/x","title":"X"}}',
    '{"last":{"path":"","title":"X"}}',
    'null',
    '[]',
    '5',
  ])('starts fresh and keeps working when the stored value is %s', (stored) => {
    const store = memoryStore({ [STORAGE_KEY]: stored });
    const progress = createProgress(store);

    expect(progress.isDone('5.1')).toBe(false);
    expect(progress.isDone('5.')).toBe(false);
    expect(progress.lastVisited()).toBeNull();
    expect(() => progress.markDone('5.1')).not.toThrow();
    expect(() => progress.recordAnswer('5.2', 0, 2)).not.toThrow();
    expect(() => progress.setLastVisited({ path: '/x/', title: 'X' })).not.toThrow();
    expect(progress.isDone('5.1')).toBe(true);
    expect(progress.lastVisited()).toEqual({ path: '/x/', title: 'X' });
    // Nothing from the malformed value survives into what is written back.
    expect(JSON.parse(store.data[STORAGE_KEY] ?? '')).toEqual({
      answered: { '5.2': [0] },
      done: ['5.1'],
      last: { path: '/x/', title: 'X' },
    });
  });

  it('honors a stored last-visited path that is a site path', () => {
    const progress = createProgress(
      memoryStore({
        [STORAGE_KEY]: '{"last":{"path":"/unit-5-kinetics/5-2-rate-law/","title":"Introduction to Rate Law"}}',
      }),
    );

    expect(progress.lastVisited()).toEqual({
      path: '/unit-5-kinetics/5-2-rate-law/',
      title: 'Introduction to Rate Law',
    });
  });

  it('keeps working in memory when reading the store throws', () => {
    const store: KeyValueStore = {
      getItem: () => {
        throw new Error('SecurityError');
      },
      setItem: () => {},
    };
    const progress = createProgress(store);

    expect(() => progress.isDone('5.2')).not.toThrow();
    expect(() => progress.markDone('5.2')).not.toThrow();
    expect(progress.isDone('5.2')).toBe(true);
    expect(() => progress.lastVisited()).not.toThrow();
    expect(() => progress.unitProgress(['5.2'])).not.toThrow();
  });
});

describe('browserProgress', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  async function freshBrowserProgress() {
    vi.resetModules();
    return (await import('../../src/lib/progress')).browserProgress;
  }

  it('works in memory when window.localStorage throws', async () => {
    vi.stubGlobal('window', {
      get localStorage(): Storage {
        throw new Error('SecurityError');
      },
    });
    const browserProgress = await freshBrowserProgress();

    const progress = browserProgress();
    progress.markDone('5.2');

    expect(progress.isDone('5.2')).toBe(true);
  });

  it('works in memory when there is no window at all', async () => {
    vi.stubGlobal('window', undefined);
    const browserProgress = await freshBrowserProgress();

    const progress = browserProgress();
    progress.markDone('5.2');

    expect(progress.isDone('5.2')).toBe(true);
  });

  it('writes to a working store and returns one shared instance', async () => {
    const store = memoryStore();
    vi.stubGlobal('window', { localStorage: store });
    const browserProgress = await freshBrowserProgress();

    const progress = browserProgress();
    progress.markDone('5.2');

    expect(JSON.parse(store.data[STORAGE_KEY] ?? '').done).toEqual(['5.2']);
    expect(browserProgress()).toBe(progress);
  });
});
