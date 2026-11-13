import { continueTarget, parseLessonLinks } from '../lib/continue';
import { browserProgress } from '../lib/progress';

/**
 * Paints stored progress into whatever the current page offers:
 *   [data-topic-link="5.2"]            gets .is-done
 *   [data-unit-topics="5.1,5.2"]       its [data-unit-progress] child gets " · 1 done"
 *   [data-continue]                    is shown with a link to the lesson to open next
 *   [data-complete]                    is shown on a finished lesson
 */
const progress = browserProgress();
const main = document.querySelector<HTMLElement>('main[data-topic]');

if (main) {
  const heading = document.querySelector('h1');
  progress.setLastVisited({ path: location.pathname, title: heading?.textContent?.trim() ?? '' });
}

const CONTINUE_LABEL = { resume: 'Continue where you left off:', next: 'Next up:' };

/** Points the home page's offer at the lesson to open next, or hides it when there is none. */
function paintContinue(offer: HTMLElement): void {
  const label = offer.querySelector('[data-continue-label]');
  const link = offer.querySelector('a');
  if (!label || !link) throw new Error('The continue offer is missing its label or its link.');
  const list = offer.dataset.lessons;
  if (list === undefined) throw new Error('The continue offer does not carry the list of lessons.');
  const lessons = parseLessonLinks(list);
  const target = continueTarget(lessons, progress.lastVisited()?.path ?? null, (topic) => progress.isDone(topic));
  offer.hidden = target === null;
  if (!target) return;
  label.textContent = CONTINUE_LABEL[target.kind];
  link.href = target.path;
  link.textContent = target.title;
}

function paint(): void {
  for (const el of document.querySelectorAll<HTMLElement>('[data-topic-link]')) {
    el.classList.toggle('is-done', progress.isDone(el.dataset.topicLink ?? ''));
  }

  for (const el of document.querySelectorAll<HTMLElement>('[data-unit-topics]')) {
    const codes = (el.dataset.unitTopics ?? '').split(',').filter(Boolean);
    const { done } = progress.unitProgress(codes);
    const out = el.querySelector('[data-unit-progress]');
    // Added after the page's own count ("1 of 11 lessons ready"), not in
    // place of it: replacing it gave the same row two different totals.
    if (out) out.textContent = done > 0 ? ` · ${done} done` : '';
  }

  const badge = document.querySelector<HTMLElement>('[data-complete]');
  if (badge && main) badge.hidden = !progress.isDone(main.dataset.topic ?? '');

  // Last, because it is the one step that can throw (on a lesson list the
  // build wrote wrongly): everything above is painted first.
  const offer = document.querySelector<HTMLElement>('[data-continue]');
  if (offer) paintContinue(offer);
}

// Registered before the first paint, so a throw there cannot leave the page
// deaf to later progress.
document.addEventListener('chemstudy:progress', paint);
paint();
