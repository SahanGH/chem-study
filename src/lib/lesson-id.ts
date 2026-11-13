const LESSON_ID = /^unit-(\d+)\/(\d+)-(\d+)-[a-z0-9-]+$/;

/**
 * True when a lesson's collection id ("unit-5/5-2-rate-law": its path without
 * the extension) agrees with the topic in its frontmatter ("5.2"). The id
 * becomes the URL, so a disagreement would publish a lesson at an address
 * that names a different topic.
 */
export function lessonIdMatchesTopic(id: string, topic: string): boolean {
  const match = LESSON_ID.exec(id);
  if (!match) return false;
  const [, folderUnit, unit, number] = match;
  return folderUnit === unit && topic === `${unit}.${number}`;
}
