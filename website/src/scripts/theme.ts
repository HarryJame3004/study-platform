// Appearance switch: toggles light/dark and persists the choice.
const toggles = document.querySelectorAll<HTMLButtonElement>('.theme-toggle');

toggles.forEach((button) => button.addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem('study-theme', next); } catch {}
}));

export {};
