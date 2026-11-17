import { describe, expect, it } from 'vitest';
import { requireReferenceMeta } from '../../src/lib/reference-meta';

describe('requireReferenceMeta', () => {
  it('returns the title and the description when both are text', () => {
    expect(requireReferenceMeta({ title: 'Equations', description: 'The sheet.' })).toEqual({
      title: 'Equations',
      description: 'The sheet.',
    });
  });

  it('ignores other front matter', () => {
    const meta = requireReferenceMeta({ title: 'T', description: 'D', layout: '../layouts/x.astro' });

    expect(meta).toEqual({ title: 'T', description: 'D' });
  });

  it.each([
    ['no title', { description: 'D' }, 'title'],
    ['an empty title', { title: '', description: 'D' }, 'title'],
    ['a blank title', { title: '   ', description: 'D' }, 'title'],
    ['a title that is not text', { title: 42, description: 'D' }, 'title'],
    ['no description', { title: 'T' }, 'description'],
    ['an empty description', { title: 'T', description: '' }, 'description'],
    ['a description that is not text', { title: 'T', description: ['D'] }, 'description'],
  ])('throws for %s, naming the field', (_reason, frontmatter, field) => {
    // Only the failing field is named: the sentence before it names both.
    const other = field === 'title' ? 'description' : 'title';
    const thrown = () => requireReferenceMeta(frontmatter);

    expect(thrown).toThrow(new RegExp(`Problem: ${field} is`));
    expect(thrown).not.toThrow(new RegExp(`Problem:.*${other} is`));
  });

  it('throws when there is no front matter at all', () => {
    expect(() => requireReferenceMeta(undefined)).toThrow(/needs a title and a description/);
  });

  it('names the file when it is given', () => {
    expect(() => requireReferenceMeta({ title: 'T' }, 'src/pages/tools/x.mdx')).toThrow(/src\/pages\/tools\/x\.mdx/);
  });

  it('says what it got, so the mistake can be found', () => {
    expect(() => requireReferenceMeta({ title: 'T', description: 7 })).toThrow(/description is 7/);
  });
});
