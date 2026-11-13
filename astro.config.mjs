// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import svelte from '@astrojs/svelte';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
// Registers \ce{...} on KaTeX. This works only while node_modules holds ONE
// copy of katex: rehype-katex depends on katex 0.16, so package.json pins
// the same range. With two copies \ce renders as literal text and the build
// still succeeds; scripts/check-dist.mjs fails the build if that happens.
import 'katex/contrib/mhchem';

export default defineConfig({
  site: 'https://chem-study.com',
  trailingSlash: 'always',
  integrations: [mdx(), svelte()],
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
  },
});
