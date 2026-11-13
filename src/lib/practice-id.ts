// The naming rules for practice documents, kept free of astro:content so they
// can be unit-tested.

const PRACTICE_ID = /^unit-(\d+)\/([a-z0-9]+(?:-[a-z0-9]+)*)$/;
const LESSON_PATH = /^\/unit-\d+-[a-z0-9-]+\/(\d+)-(\d+)-[a-z0-9-]+\/$/;
export const TOPIC_CODE = /^[1-9]\.[1-9]\d?$/;

export const PRACTICE_KINDS = ['worksheet', 'ladders', 'free-response'] as const;
export type PracticeKind = (typeof PRACTICE_KINDS)[number];

const KIND_LABEL: Record<PracticeKind, string> = {
  worksheet: 'Worksheet',
  ladders: 'Skill ladders',
  'free-response': 'Free response',
};

export function kindLabel(kind: PracticeKind): string {
  return KIND_LABEL[kind];
}

/**
 * Splits a practice document's collection id ("unit-5/worksheet-1-rates": its
 * path without the extension) into its unit number and the last URL segment.
 * Null when the file is not filed as unit-<number>/<slug>.
 */
export function practiceIdParts(id: string): { unit: number; slug: string } | null {
  const match = PRACTICE_ID.exec(id);
  if (!match) return null;
  const [, unit = '', slug = ''] = match;
  return { unit: Number(unit), slug };
}

/**
 * The topic a lesson's address names: "/unit-5-kinetics/5-2-rate-law/" gives
 * "5.2". Null for any address that is not a lesson's.
 */
export function topicFromLessonPath(path: string): string | null {
  const match = LESSON_PATH.exec(path);
  if (!match) return null;
  const [, unit = '', number = ''] = match;
  return `${unit}.${number}`;
}

/** "5.7, 5.8" gives ["5.7", "5.8"]. Throws on anything that is not a list of topic codes. */
export function parseTopics(text: string): string[] {
  const codes = text.split(',').map((code) => code.trim());
  for (const code of codes) {
    if (!TOPIC_CODE.test(code)) {
      throw new Error(
        `"${text}" is not a list of topic codes. Write one code such as "5.2", or several separated by commas: "5.7, 5.8".`,
      );
    }
  }
  if (new Set(codes).size !== codes.length) throw new Error(`"${text}" names a topic twice.`);
  return codes;
}

/** The least a practice document must carry to be put in order. */
export interface PracticeEntry {
  id: string;
  data: { order: number; topics: string[] };
}

/**
 * A unit's practice documents in the order they are listed. A document that
 * names a topic outside its unit, or shares its place in the list with
 * another, is an error: both would otherwise show up as a quietly wrong page.
 */
export function orderedPractice<T extends PracticeEntry>(
  docs: readonly T[],
  unitNumber: number,
  topicCodes: ReadonlySet<string>,
): T[] {
  const byOrder = new Map<number, T>();
  for (const doc of docs) {
    const stray = doc.data.topics.find((code) => !topicCodes.has(code));
    if (stray) {
      throw new Error(`Practice file ${doc.id} lists topic ${stray}, which is not a topic of Unit ${unitNumber}.`);
    }
    const clash = byOrder.get(doc.data.order);
    if (clash) {
      throw new Error(
        `Two practice files in Unit ${unitNumber} have order ${doc.data.order}: ${clash.id} and ${doc.id}. Give each its own number.`,
      );
    }
    byOrder.set(doc.data.order, doc);
  }
  return [...docs].sort((a, b) => a.data.order - b.data.order);
}

/**
 * True when one topic comes straight after another in the same unit: "5.10"
 * after "5.9", but not "5.3" after "5.1" or "6.1" after "5.11".
 */
function follows(previous: string, code: string): boolean {
  const [previousUnit, previousNumber] = previous.split('.');
  const [unit, number] = code.split('.');
  return unit === previousUnit && Number(number) === Number(previousNumber) + 1;
}

/**
 * How a document's topics read in a list: "Topic 5.3"; "Topics 5.1–5.2" for a
 * run of neighbors; "Topics 5.1–5.8, 5.10–5.11" when a topic is skipped;
 * "Topics 5.1, 5.3" when none are neighbors.
 */
export function topicsLabel(codes: readonly string[]): string {
  if (codes.length === 0) throw new Error('A practice document must cover at least one topic.');
  const runs: string[][] = [];
  for (const code of codes) {
    const run = runs.at(-1);
    const previous = run?.at(-1);
    if (run && previous !== undefined && follows(previous, code)) run.push(code);
    else runs.push([code]);
  }
  const written = runs.map((run) => {
    const [start] = run;
    const end = run.at(-1);
    if (start === undefined || end === undefined) throw new Error('A run of topics cannot be empty.');
    return run.length > 1 ? `${start}–${end}` : start;
  });
  return `${codes.length === 1 ? 'Topic' : 'Topics'} ${written.join(', ')}`;
}
