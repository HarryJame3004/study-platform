// Search dialog: opens from sidebar, topbar, or mobile nav (Cmd/Ctrl+K) and filters links.
const dialog = document.querySelector<HTMLDialogElement>('.search-dialog');
const input = document.querySelector<HTMLInputElement>('#site-search');
const results = [...document.querySelectorAll<HTMLAnchorElement>('.search-results a')];
const empty = document.querySelector<HTMLElement>('.search-empty');

document.querySelectorAll<HTMLButtonElement>('.search-trigger').forEach((button) =>
  button.addEventListener('click', () => { dialog?.showModal(); input?.focus(); }));

document.querySelector('.search-close')?.addEventListener('click', () => dialog?.close());
dialog?.addEventListener('click', (event) => { if (event.target === dialog) dialog?.close(); });

document.addEventListener('keydown', (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    dialog?.showModal();
    input?.focus();
  }
});

input?.addEventListener('input', () => {
  const query = input.value.trim().toLowerCase();
  let visible = 0;
  results.forEach((result) => {
    const match = result.dataset.search?.includes(query) ?? false;
    result.hidden = !match;
    if (match) visible++;
  });
  if (empty) empty.hidden = visible > 0;
});

export {};
