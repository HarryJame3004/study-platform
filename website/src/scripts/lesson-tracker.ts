// Lesson activity recorder: logs a daily activity point and remembers visited lessons.
// The home dashboard (study-dashboard.ts) reads these localStorage records.
const page = document.querySelector<HTMLElement>('[data-lesson-url]');
const url = page?.dataset.lessonUrl;
const title = page?.dataset.lessonTitle;
const subject = page?.dataset.lessonSubject;

if (page && url && title && subject) {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const activity: Record<string, number> = JSON.parse(localStorage.getItem('study-activity') ?? '{}');
    activity[today] = (activity[today] ?? 0) + 1;
    localStorage.setItem('study-activity', JSON.stringify(activity));

    const visited: Record<string, { title: string; subject: string; last: string }> =
      JSON.parse(localStorage.getItem('study-visited') ?? '{}');
    visited[url] = { title, subject, last: today };
    localStorage.setItem('study-visited', JSON.stringify(visited));

    localStorage.setItem('study-last-lesson', JSON.stringify({ url, title, subject }));
  } catch {}
}

export {};
