export type ReferenceMeta = { title: string; description: string };

const isFilledText = (value: unknown): value is string => typeof value === 'string' && value.trim() !== '';

/**
 * The title and description a reference page must give in its front matter.
 * Throws, naming the field that is wrong and what it held, rather than letting
 * a page ship with an empty <title> or no description.
 */
export function requireReferenceMeta(
  frontmatter: { title?: unknown; description?: unknown } | undefined,
  file?: string,
): ReferenceMeta {
  const { title, description } = frontmatter ?? {};
  if (isFilledText(title) && isFilledText(description)) return { title, description };

  const problems = [
    ...(isFilledText(title) ? [] : [`title is ${JSON.stringify(title)}`]),
    ...(isFilledText(description) ? [] : [`description is ${JSON.stringify(description)}`]),
  ];
  const where = file === undefined ? '' : ` (${file})`;
  throw new Error(
    `A reference page${where} needs a title and a description in its front matter, both as non-empty text. ` +
      `Problem: ${problems.join('; ')}.`,
  );
}
