// Home dashboard: renders streak, activity heat, per-subject progress, and due reviews
// from localStorage records written by lesson-tracker.ts and srs-recorder.ts.
function dayKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function readJson<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(key) ?? '') as T; } catch { return fallback; }
}

// --- Streak ---
const activity = readJson<Record<string, number>>('study-activity', {});
const streakValue = document.querySelector<HTMLElement>('#dash-streak');
if (streakValue) {
  let streak = 0;
  const cursor = new Date();
  if (!activity[dayKey(cursor)]) cursor.setDate(cursor.getDate() - 1); // today not studied yet does not break yesterday's streak
  while (activity[dayKey(cursor)]) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  streakValue.textContent = String(streak);
}

// --- Totals ---
const visited = readJson<Record<string, { title: string; subject: string; last: string }>>('study-visited', {});
const visitedCount = document.querySelector<HTMLElement>('#dash-visited');
if (visitedCount) visitedCount.textContent = String(Object.keys(visited).length);

// --- Activity heat (last 5 weeks) ---
const heat = document.querySelector<HTMLElement>('#dash-heat');
if (heat) {
  const cursor = new Date();
  cursor.setDate(cursor.getDate() - 34);
  for (let index = 0; index < 35; index++) {
    const key = dayKey(cursor);
    const cell = document.createElement('span');
    cell.className = 'heat-cell';
    const level = Math.min(3, activity[key] ?? 0);
    if (level) cell.dataset.level = String(level);
    cell.title = `${key}: ${activity[key] ?? 0} lesson visit${(activity[key] ?? 0) === 1 ? '' : 's'}`;
    heat.appendChild(cell);
    cursor.setDate(cursor.getDate() + 1);
  }
}

// --- Subject progress (read lessons per subject) ---
const progressList = document.querySelector<HTMLElement>('#dash-progress');
if (progressList) {
  const subjects = [...document.querySelectorAll<HTMLElement>('[data-dash-subject]')];
  const rows = subjects.map((element) => {
    const name = element.dataset.dashSubject ?? '';
    const total = Number(element.dataset.dashTotal ?? '0');
    const urls = (element.dataset.dashUrls ?? '').split('|').filter(Boolean);
    const read = urls.filter((lessonUrl) => visited[lessonUrl]).length;
    const percent = total ? Math.round(read / total * 100) : 0;
    return { name, read, total, percent };
  }).filter((row) => row.total > 0);

  if (rows.length) {
    progressList.replaceChildren(...rows.map((row) => {
      const item = document.createElement('li');
      item.className = 'dash-progress-row';
      const label = document.createElement('span');
      label.className = 'dash-progress-label';
      label.textContent = row.name;
      const track = document.createElement('span');
      track.className = 'dash-progress-track';
      const fill = document.createElement('span');
      fill.className = 'dash-progress-fill';
      fill.style.width = `${row.percent}%`;
      track.appendChild(fill);
      const value = document.createElement('span');
      value.className = 'dash-progress-value';
      value.textContent = `${row.read}/${row.total}`;
      item.append(label, track, value);
      return item;
    }));
  } else {
    const empty = document.createElement('li');
    empty.className = 'dash-empty';
    empty.textContent = 'Open a lesson to start filling this in.';
    progressList.replaceChildren(empty);
  }
}

// --- Due reviews today ---
const dueList = document.querySelector<HTMLElement>('#dash-due');
const dueCount = document.querySelector<HTMLElement>('#dash-due-count');
if (dueList && dueCount) {
  const now = Date.now();
  const due: { url: string; count: number }[] = [];
  for (let index = 0; index < localStorage.length; index++) {
    const key = localStorage.key(index);
    if (!key?.startsWith('study-srs:')) continue;
    try {
      const states = JSON.parse(localStorage.getItem(key) ?? '[]') as { due: number }[];
      const overdue = states.filter((state) => state.due <= now).length;
      if (overdue) due.push({ url: key.slice('study-srs:'.length), count: overdue });
    } catch {}
  }
  const totalDue = due.reduce((sum, entry) => sum + entry.count, 0);
  dueCount.textContent = String(totalDue);
  if (totalDue) {
    dueList.replaceChildren(...due.slice(0, 5).map((entry) => {
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = entry.url;
      const lesson = visited[entry.url];
      link.textContent = lesson ? lesson.title : entry.url.split('/').filter(Boolean).pop() ?? entry.url;
      const badge = document.createElement('span');
      badge.className = 'dash-due-badge';
      badge.textContent = String(entry.count);
      item.append(link, badge);
      return item;
    }));
  } else {
    const empty = document.createElement('li');
    empty.className = 'dash-empty';
    empty.textContent = 'Nothing due. Review flashcards in a lesson to schedule the next round.';
    dueList.replaceChildren(empty);
  }
}

export {};
