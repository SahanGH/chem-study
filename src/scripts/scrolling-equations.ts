/**
 * A display equation too wide for the screen scrolls sideways inside its own
 * box. A box that scrolls must be reachable from the keyboard (WCAG 2.1.1),
 * but KaTeX generates the markup, so the page cannot carry the tabindex.
 * This adds it, with a name, to exactly the equations that overflow now, and
 * removes it again when a wider window or a smaller font stops the overflow.
 * Equations that fit stay out of the tab order.
 */
export {};

const SCROLL_LABEL = 'Equation, scrolls sideways';

function update(equation: HTMLElement): void {
  if (equation.scrollWidth > equation.clientWidth) {
    equation.tabIndex = 0;
    equation.setAttribute('role', 'group');
    equation.setAttribute('aria-label', SCROLL_LABEL);
  } else {
    equation.removeAttribute('tabindex');
    equation.removeAttribute('role');
    equation.removeAttribute('aria-label');
  }
}

const equations = Array.from(document.querySelectorAll<HTMLElement>('.katex-display'));

function updateAll(): void {
  for (const equation of equations) update(equation);
}

updateAll();

// An equation's own box only changes with the window, so this catches resizing.
// The math inside is display: block and as wide as its box, so a ResizeObserver
// on it would never fire when the math fonts arrive, even though that is when
// the content's true width (scrollWidth) settles. The font events cover that.
const observer = new ResizeObserver((entries) => {
  for (const entry of entries) {
    if (entry.target instanceof HTMLElement) update(entry.target);
  }
});
for (const equation of equations) observer.observe(equation);

void document.fonts.ready.then(updateAll);
document.fonts.addEventListener('loadingdone', updateAll);
