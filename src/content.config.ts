import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { topicByCode } from './data/units';
import { PRACTICE_KINDS } from './lib/practice-id';

const topicCode = z
  .string()
  .regex(/^[1-9]\.\d{1,2}$/, 'topic must look like "5.2"')
  .refine((code) => topicByCode(code) !== undefined, {
    message: 'topic is not one of the AP topics in src/data/units.ts',
  });

const lessons = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/lessons' }),
  schema: z.object({
    // The title and unit come from src/data/units.ts, looked up by this code.
    topic: topicCode,
    minutes: z.number().int().min(1).max(60),
    summary: z.string().min(20).max(200),
  }),
});

const practice = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/practice' }),
  schema: z.object({
    // The unit comes from the folder the file sits in (unit-5/).
    title: z.string().min(3).max(80),
    kind: z.enum(PRACTICE_KINDS),
    /** Where the document sits in its unit's list of practice, counting from 1. */
    order: z.number().int().min(1),
    topics: z.array(topicCode).min(1),
    summary: z.string().min(20).max(200),
    /** Total points, for a document that is scored. */
    points: z.number().int().min(1).optional(),
    /** Suggested time, for a document meant to be timed. */
    minutes: z.number().int().min(1).max(180).optional(),
  }),
});

export const collections = { lessons, practice };
