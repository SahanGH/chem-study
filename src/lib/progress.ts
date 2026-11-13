/**
 * On-device progress. Pages use only the Progress interface, so a version
 * backed by an account can replace this one later without touching them.
 */
export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface LastVisited {
  path: string;
  title: string;
}

export interface Progress {
  /** Records one answered check. Returns true if the topic is now done. */
  recordAnswer(topic: string, checkIndex: number, totalChecks: number): boolean;
  markDone(topic: string): void;
  isDone(topic: string): boolean;
  unitProgress(topicCodes: string[]): { done: number; total: number };
  setLastVisited(page: LastVisited): void;
  lastVisited(): LastVisited | null;
}

interface State {
  answered: Record<string, number[]>;
  done: string[];
  last: LastVisited | null;
}

const KEY = 'chemstudy:progress:v1';
const empty = (): State => ({ answered: {}, done: [], last: null });

export function createProgress(store: KeyValueStore | null): Progress {
  // Used when there is no store, or after the store refuses a write.
  let memory: State | null = null;

  function read(): State {
    if (memory) return memory;
    if (!store) return (memory = empty());
    const raw = store.getItem(KEY);
    if (raw === null) return empty();
    try {
      return { ...empty(), ...(JSON.parse(raw) as Partial<State>) };
    } catch {
      // A corrupt value cannot be repaired; the student starts fresh and
      // the next write replaces it.
      return empty();
    }
  }

  function write(state: State): void {
    if (!store) {
      memory = state;
      return;
    }
    try {
      store.setItem(KEY, JSON.stringify(state));
    } catch {
      // Storage full or blocked (private mode). Progress still works for
      // the rest of this page view; it just will not survive a reload.
      memory = state;
    }
  }

  function markDone(topic: string): void {
    const state = read();
    if (!state.done.includes(topic)) {
      state.done.push(topic);
      write(state);
    }
  }

  return {
    recordAnswer(topic, checkIndex, totalChecks) {
      const state = read();
      const answered = new Set(state.answered[topic] ?? []);
      answered.add(checkIndex);
      state.answered[topic] = [...answered];
      write(state);
      if (answered.size >= totalChecks) {
        markDone(topic);
        return true;
      }
      return false;
    },
    markDone,
    isDone: (topic) => read().done.includes(topic),
    unitProgress(topicCodes) {
      const done = read().done;
      return { done: topicCodes.filter((c) => done.includes(c)).length, total: topicCodes.length };
    },
    setLastVisited(page) {
      const state = read();
      state.last = page;
      write(state);
    },
    lastVisited: () => read().last,
  };
}

let shared: Progress | null = null;

/** The one Progress instance for the current page. */
export function browserProgress(): Progress {
  if (shared) return shared;
  let store: KeyValueStore | null = null;
  try {
    // Merely touching localStorage throws when the browser blocks storage.
    store = window.localStorage;
    store.getItem(KEY);
  } catch {
    store = null;
  }
  return (shared = createProgress(store));
}
