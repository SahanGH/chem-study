import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { topicByCode } from './data/units';

const lessons = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/lessons' }),
  schema: z.object({
    // The title and unit come from src/data/units.ts, looked up by this code.
    topic: z
      .string()
      .regex(/^[1-9]\.\d{1,2}$/, 'topic must look like "5.2"')
      .refine((code) => topicByCode(code) !== undefined, {
        message: 'topic is not one of the AP topics in src/data/units.ts',
      }),
    minutes: z.number().int().min(1).max(60),
    summary: z.string().min(20).max(200),
  }),
});

export const collections = { lessons };
