/**
 * A display equation too wide for the screen scrolls sideways inside its own
 * box. A box that scrolls must be reachable from the keyboard (WCAG 2.1.1),
 * but KaTeX generates the markup, so the page cannot carry the tabindex.
 * This adds it, with a name, to exactly the equations that overflow now, and
 * removes it again when a wider window or a smaller font stops the overflow.
 * Equations that fit stay out of the tab order.
 */
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

// The equation's own box only changes with the window; the .katex inside it
// also changes when the math fonts arrive, which is when its width settles.
const observer = new ResizeObserver((entries) => {
  for (const entry of entries) {
    const equation = entry.target.closest<HTMLElement>('.katex-display');
    if (equation) update(equation);
  }
});

for (const equation of equations) {
  update(equation);
  observer.observe(equation);
  const math = equation.querySelector('.katex');
  if (math) observer.observe(math);
}
