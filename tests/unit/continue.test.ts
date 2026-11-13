import { describe, expect, it } from 'vitest';
import { continueTarget, parseLessonLinks, type LessonLink } from '../../src/lib/continue';

const lessons: LessonLink[] = [
  { topic: '5.1', path: '/unit-5-kinetics/5-1-reaction-rates/', title: 'Reaction Rates' },
  { topic: '5.2', path: '/unit-5-kinetics/5-2-rate-law/', title: 'Introduction to Rate Law' },
  { topic: '5.3', path: '/unit-5-kinetics/5-3-concentration-changes-over-time/', title: 'Concentration Changes over Time' },
];
const doneTopics = (...topics: string[]) => (topic: string) => topics.includes(topic);

describe('continueTarget', () => {
  it('offers nothing to a student who has not opened a lesson', () => {
    expect(continueTarget(lessons, null, doneTopics())).toBeNull();
  });

  it('sends the student back to the lesson they last opened while it is unfinished', () => {
    const target = continueTarget(lessons, '/unit-5-kinetics/5-2-rate-law/', doneTopics('5.1'));

    expect(target).toEqual({ kind: 'resume', path: '/unit-5-kinetics/5-2-rate-law/', title: 'Introduction to Rate Law' });
  });

  it('moves on to the next lesson once the last one opened is finished', () => {
    const target = continueTarget(lessons, '/unit-5-kinetics/5-2-rate-law/', doneTopics('5.2'));

    expect(target).toEqual({
      kind: 'next',
      path: '/unit-5-kinetics/5-3-concentration-changes-over-time/',
      title: 'Concentration Changes over Time',
    });
  });

  it('skips later lessons that are already finished', () => {
    const target = continueTarget(lessons, '/unit-5-kinetics/5-1-reaction-rates/', doneTopics('5.1', '5.2'));

    expect(target?.path).toBe('/unit-5-kinetics/5-3-concentration-changes-over-time/');
  });

  it('goes back to an earlier unfinished lesson when nothing later is left', () => {
    const target = continueTarget(lessons, '/unit-5-kinetics/5-3-concentration-changes-over-time/', doneTopics('5.2', '5.3'));

    expect(target).toEqual({ kind: 'next', path: '/unit-5-kinetics/5-1-reaction-rates/', title: 'Reaction Rates' });
  });

  it('offers nothing when every lesson is finished', () => {
    const target = continueTarget(lessons, '/unit-5-kinetics/5-2-rate-law/', doneTopics('5.1', '5.2', '5.3'));

    expect(target).toBeNull();
  });

  it('offers nothing when the last page opened is no longer a lesson', () => {
    expect(continueTarget(lessons, '/unit-5-kinetics/renamed-lesson/', doneTopics())).toBeNull();
  });

  it('offers nothing when there are no lessons', () => {
    expect(continueTarget([], '/unit-5-kinetics/5-2-rate-law/', doneTopics())).toBeNull();
  });
});

describe('parseLessonLinks', () => {
  it('reads the list the home page carries', () => {
    expect(parseLessonLinks(JSON.stringify(lessons))).toEqual(lessons);
  });

  it.each([
    ['text that is not JSON', 'not json'],
    ['something that is not a list', '{"topic":"5.1"}'],
    ['an entry with a field missing', '[{"topic":"5.1","path":"/a/"}]'],
    ['an entry with a field of the wrong kind', '[{"topic":5.1,"path":"/a/","title":"A"}]'],
    ['an entry whose path leaves the site', '[{"topic":"5.1","path":"//evil.example/","title":"A"}]'],
    ['an entry with an empty title', '[{"topic":"5.1","path":"/a/","title":" "}]'],
  ])('throws for %s', (_name, text) => {
    expect(() => parseLessonLinks(text)).toThrow('lesson list');
  });
});
