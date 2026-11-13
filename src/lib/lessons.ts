import { getCollection, type CollectionEntry } from 'astro:content';
import { lessonIdMatchesTopic } from './lesson-id';

export type Lesson = CollectionEntry<'lessons'>;

/** "unit-5/5-2-rate-law" -> "5-2-rate-law": the last URL segment. */
export function lessonSlug(lesson: Lesson): string {
  const slug = lesson.id.split('/').pop();
  if (!slug) throw new Error(`Lesson has an empty id: ${JSON.stringify(lesson.id)}`);
  return slug;
}

export function lessonPath(unitSlug: string, lesson: Lesson): string {
  return `/${unitSlug}/${lessonSlug(lesson)}/`;
}

/**
 * Every published lesson, keyed by topic code. Two lessons for one topic is an
 * error, and so is a lesson filed under a name that disagrees with its topic:
 * the file name becomes the URL.
 */
export async function lessonsByTopic(): Promise<Map<string, Lesson>> {
  const byTopic = new Map<string, Lesson>();
  for (const lesson of await getCollection('lessons')) {
    if (!lessonIdMatchesTopic(lesson.id, lesson.data.topic)) {
      const [unit = '', number = ''] = lesson.data.topic.split('.');
      throw new Error(
        `Lesson file ${lesson.filePath ?? lesson.id} claims topic ${lesson.data.topic} but is filed as ${lesson.id}. ` +
          `Name it unit-${unit}/${unit}-${number}-<slug>.mdx, where <slug> is lowercase letters, digits and hyphens.`,
      );
    }
    const existing = byTopic.get(lesson.data.topic);
    if (existing) {
      throw new Error(
        `Two lessons claim topic ${lesson.data.topic}: ${existing.id} and ${lesson.id}. Keep one.`,
      );
    }
    byTopic.set(lesson.data.topic, lesson);
  }
  return byTopic;
}
