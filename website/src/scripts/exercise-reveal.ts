// Exercise answer disclosures: expand/collapse reveal panels.
document.querySelectorAll('.answer-disclosure').forEach((disclosure) => {
  const button = disclosure.querySelector<HTMLButtonElement>('.answer-button');
  const panel = disclosure.querySelector<HTMLElement>('.answer-reveal');
  button?.addEventListener('click', () => {
    const open = !disclosure.classList.contains('is-open');
    disclosure.classList.toggle('is-open', open);
    button.setAttribute('aria-expanded', String(open));
    (button.querySelector('span') as HTMLElement).textContent = open ? 'Hide answer' : 'Show answer';
    panel?.setAttribute('aria-hidden', String(!open));
    if (panel) panel.inert = !open;
  });
});

export {};
