// Reading progress: stores how far down the lesson the reader has scrolled.
let scheduled = false;
const page = document.querySelector<HTMLElement>('[data-lesson-url]');
const url = page?.dataset.lessonUrl;

if (page && url) {
  const saveProgress = () => {
    scheduled = false;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const progress = total <= 0 ? 100 : Math.round(Math.min(100, window.scrollY / total * 100));
    try { localStorage.setItem(`study-progress:${url}`, String(progress)); } catch {}
  };
  window.addEventListener('scroll', () => {
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(saveProgress);
    }
  }, { passive: true });
}

export {};
