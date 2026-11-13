import { getCollection, type CollectionEntry } from 'astro:content';
import { topicByCode, type Unit } from '../data/units';
import { practiceIdParts } from './practice-id';

export type Practice = CollectionEntry<'practice'>;

function idParts(doc: Practice): { unit: number; slug: string } {
  const parts = practiceIdParts(doc.id);
  if (!parts) {
    throw new Error(
      `Practice file ${doc.filePath ?? doc.id} is filed as ${doc.id}. ` +
        'Name it unit-<number>/<slug>.mdx, where <slug> is lowercase letters, digits and hyphens.',
    );
  }
  return parts;
}

/** The number of the unit whose folder a practice document sits in. */
export function practiceUnitNumber(doc: Practice): number {
  return idParts(doc).unit;
}

/** "unit-5/worksheet-1-rates" -> "worksheet-1-rates": the last URL segment. */
export function practiceSlug(doc: Practice): string {
  return idParts(doc).slug;
}

export function practicePath(unitSlug: string, doc: Practice): string {
  return `/${unitSlug}/practice/${practiceSlug(doc)}/`;
}

/**
 * A unit's practice documents in the order they are listed. A document that
 * names a topic outside its unit, or shares its place in the list with
 * another, is an error: both would otherwise show up as a quietly wrong page.
 */
export async function practiceForUnit(unit: Unit): Promise<Practice[]> {
  const docs = (await getCollection('practice')).filter((doc) => practiceUnitNumber(doc) === unit.number);
  const codes = new Set(unit.topics.map((topic) => topic.code));
  const byOrder = new Map<number, Practice>();
  for (const doc of docs) {
    const stray = doc.data.topics.find((code) => !codes.has(code));
    if (stray) {
      throw new Error(`Practice file ${doc.id} lists topic ${stray}, which is not a topic of Unit ${unit.number}.`);
    }
    const clash = byOrder.get(doc.data.order);
    if (clash) {
      throw new Error(
        `Two practice files in Unit ${unit.number} have order ${doc.data.order}: ${clash.id} and ${doc.id}. Give each its own number.`,
      );
    }
    byOrder.set(doc.data.order, doc);
  }
  return [...docs].sort((a, b) => a.data.order - b.data.order);
}

/** The practice that covers one topic, as links for the end of its lesson. */
export async function practiceForTopic(code: string): Promise<{ title: string; href: string }[]> {
  const found = topicByCode(code);
  if (!found) throw new Error(`Topic ${code} is not one of the AP topics in src/data/units.ts.`);
  const docs = await practiceForUnit(found.unit);
  return docs
    .filter((doc) => doc.data.topics.includes(code))
    .map((doc) => ({ title: doc.data.title, href: practicePath(found.unit.slug, doc) }));
}
