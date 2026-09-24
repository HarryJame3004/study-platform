// Continue Learning card: points at the last opened lesson and shows its saved progress.
try {
  const raw = localStorage.getItem('study-last-lesson');
  const last = raw && JSON.parse(raw);
  const card = document.querySelector<HTMLAnchorElement>('#continue-card');
  if (card && last?.url && last?.title && last?.subject) {
    card.href = last.url;
    document.querySelector('#continue-subject')!.textContent = last.subject;
    document.querySelector('#continue-title')!.textContent = last.title;
    document.querySelector('#continue-caption')!.textContent = 'Reading progress';
    const progress = Math.max(0, Math.min(100, Number(localStorage.getItem(`study-progress:${last.url}`)) || 0));
    document.querySelector('#continue-percent')!.textContent = `${progress}%`;
    (document.querySelector('#continue-progress') as HTMLElement).style.width = `${progress}%`;
  }
} catch {}

export {};
