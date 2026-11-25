import { topicByCode, type Unit } from '../data/units';

export type TopicLabel<Lesson> = {
  unit: Unit;
  /** "Topic 3.4, Ideal Gas Law". */
  label: string;
  /** The topic's lesson when it exists: the label is then a link. */
  lesson: Lesson | undefined;
};

/**
 * What a reference page writes for a topic: its label, and its lesson if one is
 * published. Takes the published lessons as an argument so that the choice
 * between a link and plain text can be tested without building the site.
 * Throws for a code that is not an AP topic, because a typo would otherwise
 * print a label that points nowhere.
 */
export function topicLabel<Lesson>(code: string, lessons: ReadonlyMap<string, Lesson>): TopicLabel<Lesson> {
  const found = topicByCode(code);
  if (!found) {
    throw new Error(
      `"${code}" is not an AP topic. Use a topic number from src/data/units.ts, such as "3.4".`,
    );
  }
  return { unit: found.unit, label: `Topic ${code}, ${found.topic.title}`, lesson: lessons.get(code) };
}
