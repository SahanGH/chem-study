/**
 * Where the home page sends a returning student. No DOM here, so it is
 * testable directly.
 */
import { isSitePath } from './progress';

/** One published lesson, in course order. */
export interface LessonLink {
  topic: string;
  path: string;
  title: string;
}

export interface ContinueTarget {
  /** "resume": the lesson last opened, still unfinished. "next": a lesson not yet finished. */
  kind: 'resume' | 'next';
  path: string;
  title: string;
}

/**
 * Back to the lesson last opened while it is unfinished. Once it is done, on
 * to the next unfinished lesson after it, or failing that the first
 * unfinished one before it. Nothing when every lesson is done, when the
 * student has not opened a lesson, or when the page they last opened is no
 * longer a lesson (renamed or removed): a link to it would be a dead end.
 */
export function continueTarget(
  lessons: readonly LessonLink[],
  lastPath: string | null,
  isDone: (topic: string) => boolean,
): ContinueTarget | null {
  if (lastPath === null) return null;
  const position = lessons.findIndex((lesson) => lesson.path === lastPath);
  if (position === -1) return null;
  const last = lessons[position];
  if (!last) return null;
  if (!isDone(last.topic)) return { kind: 'resume', path: last.path, title: last.title };
  const unfinished = (lesson: LessonLink) => !isDone(lesson.topic);
  const next = lessons.slice(position + 1).find(unfinished) ?? lessons.slice(0, position).find(unfinished);
  return next ? { kind: 'next', path: next.path, title: next.title } : null;
}

function isLessonLink(value: unknown): value is LessonLink {
  if (typeof value !== 'object' || value === null) return false;
  if (!('topic' in value) || !('title' in value) || !('path' in value)) return false;
  const hasText = (field: unknown) => typeof field === 'string' && field.trim() !== '';
  // The path becomes a link's href, so it must be a path on this site. The
  // title becomes the link's text: an empty one would be a link nobody can see.
  return hasText(value.topic) && hasText(value.title) && isSitePath(value.path);
}

/** Reads the list of lessons the home page carries in a data attribute. */
export function parseLessonLinks(text: string): LessonLink[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (cause) {
    throw new Error('The lesson list on the home page is not valid JSON.', { cause });
  }
  if (!Array.isArray(parsed) || !parsed.every(isLessonLink)) {
    throw new Error('The lesson list on the home page must be a list of { topic, path, title } with paths on this site.');
  }
  return parsed;
}
