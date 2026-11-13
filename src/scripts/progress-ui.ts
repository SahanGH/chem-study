import { browserProgress } from '../lib/progress';

/**
 * Paints stored progress into whatever the current page offers:
 *   [data-topic-link="5.2"]            gets .is-done
 *   [data-unit-topics="5.1,5.2"]       its [data-unit-progress] child gets " · 1 done"
 *   [data-continue]                    is shown with a link to the last lesson
 *   [data-complete]                    is shown on a finished lesson
 */
const progress = browserProgress();
const main = document.querySelector<HTMLElement>('main[data-topic]');

if (main) {
  const heading = document.querySelector('h1');
  progress.setLastVisited({ path: location.pathname, title: heading?.textContent?.trim() ?? '' });
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

  const last = progress.lastVisited();
  const resume = document.querySelector<HTMLElement>('[data-continue]');
  const link = resume?.querySelector('a');
  if (resume && link && last && last.title) {
    link.href = last.path;
    link.textContent = last.title;
    resume.hidden = false;
  }

  const badge = document.querySelector<HTMLElement>('[data-complete]');
  if (badge && main) badge.hidden = !progress.isDone(main.dataset.topic ?? '');
}

paint();
document.addEventListener('chemstudy:progress', paint);
