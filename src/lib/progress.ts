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
  /**
   * Records one answered check. Returns true when every check in the topic
   * has now been answered; the topic is then marked done. Returns false
   * otherwise, even for a topic already marked done another way.
   */
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

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isIndexArray(value: unknown): value is number[] {
  return Array.isArray(value) && value.every((item) => Number.isInteger(item) && item >= 0);
}

function isAnswered(value: unknown): value is Record<string, number[]> {
  return isPlainObject(value) && Object.values(value).every(isIndexArray);
}

// The path becomes a link's href, and localStorage can be written by anything
// on the origin, so only a path on this site is accepted: it must start with
// "/" and not be protocol-relative. "/\" is refused with "//" because
// browsers read a backslash as a slash and would leave the site.
function isSitePath(value: unknown): value is string {
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') && !value.startsWith('/\\');
}

function isLastVisited(value: unknown): value is LastVisited | null {
  return value === null || (isPlainObject(value) && isSitePath(value.path) && typeof value.title === 'string');
}

/** Returns the stored state, or null when it is not a well-formed State. */
function parseState(raw: string): State | null {
  const parsed: unknown = JSON.parse(raw);
  if (!isPlainObject(parsed)) return null;
  const { answered = {}, done = [], last = null } = parsed;
  if (!isAnswered(answered) || !isStringArray(done) || !isLastVisited(last)) return null;
  return { answered, done, last };
}

export function createProgress(store: KeyValueStore | null): Progress {
  // Used when there is no store, or after the store refuses a read or write.
  let memory: State | null = null;

  function read(): State {
    if (memory) return memory;
    if (!store) return (memory = empty());
    let raw: string | null;
    try {
      raw = store.getItem(KEY);
    } catch {
      // Storage was revoked mid-session. Progress still works for the rest
      // of this page view; it just will not survive a reload.
      return (memory = empty());
    }
    if (raw === null) return empty();
    // Unparseable JSON (the catch) and well-formed JSON of the wrong shape
    // (parseState returning null) are handled alike: a damaged value cannot
    // be repaired, so the student starts fresh and the next write replaces
    // it. Salvaging the well-formed parts would risk showing progress the
    // student never made.
    try {
      return parseState(raw) ?? empty();
    } catch {
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
    // The catch also covers there being no window at all (build time, when
    // Astro renders pages in Node); progress then lives in memory only.
    store = window.localStorage;
    store.getItem(KEY);
  } catch {
    store = null;
  }
  return (shared = createProgress(store));
}
