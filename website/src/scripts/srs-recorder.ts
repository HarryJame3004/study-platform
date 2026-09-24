// Spaced repetition recorder (Leitner box system) for lesson flashcards.
// Every flip to the back records a review; the answer grade buttons set the box.
// Storage key: study-srs:<lesson url> -> [{ id, box, due }] reviewed in study/srs-review.ts.
const page = document.querySelector<HTMLElement>('[data-lesson-url]');
const url = page?.dataset.lessonUrl;
const grid = document.querySelector<HTMLElement>('.flashcard-grid');

const DAY_MS = 24 * 60 * 60 * 1000;
export const BOX_INTERVALS_DAYS = [0, 1, 3, 7, 16, 35];

type CardState = { id: number; box: number; due: number };

function load(): CardState[] {
  try { return JSON.parse(localStorage.getItem(`study-srs:${url}`) ?? '[]') as CardState[]; } catch { return []; }
}

function save(states: CardState[]) {
  try { localStorage.setItem(`study-srs:${url}`, JSON.stringify(states)); } catch {}
}

function record(id: number, grade: 'again' | 'hard' | 'good' | 'easy') {
  if (!url) return;
  const states = load();
  const existing = states.find((state) => state.id === id);
  const box = existing?.box ?? 1;
  // Again resets to box 1; Hard stays in the same box; Good moves up one; Easy jumps two.
  const nextBox = grade === 'again' ? 1 : grade === 'hard' ? Math.max(1, box) : Math.min(BOX_INTERVALS_DAYS.length - 1, box + (grade === 'easy' ? 2 : 1));
  const due = Date.now() + BOX_INTERVALS_DAYS[nextBox] * DAY_MS;
  const next: CardState = { id, box: nextBox, due };
  save([...states.filter((state) => state.id !== id), next]);
  renderGrade(id, nextBox);
}

function gradeRow(id: number): HTMLElement {
  const row = document.createElement('span');
  row.className = 'srs-grade-row';
  const again = document.createElement('button');
  again.type = 'button';
  again.className = 'srs-grade srs-again';
  again.textContent = 'Again';
  again.setAttribute('aria-label', `Card ${id + 1}: review again tomorrow`);
  again.addEventListener('click', (event) => { event.stopPropagation(); record(id, 'again'); });
  const hard = document.createElement('button');
  hard.type = 'button';
  hard.className = 'srs-grade srs-hard';
  hard.textContent = 'Hard';
  hard.setAttribute('aria-label', `Card ${id + 1}: struggled, keep the current box`);
  hard.addEventListener('click', (event) => { event.stopPropagation(); record(id, 'hard'); });
  const good = document.createElement('button');
  good.type = 'button';
  good.className = 'srs-grade srs-good';
  good.textContent = 'Good';
  good.setAttribute('aria-label', `Card ${id + 1}: reviewed, see it again in a few days`);
  good.addEventListener('click', (event) => { event.stopPropagation(); record(id, 'good'); });
  const easy = document.createElement('button');
  easy.type = 'button';
  easy.className = 'srs-grade srs-easy';
  easy.textContent = 'Easy';
  easy.setAttribute('aria-label', `Card ${id + 1}: easy, postpone the next review`);
  easy.addEventListener('click', (event) => { event.stopPropagation(); record(id, 'easy'); });
  row.append(again, hard, good, easy);
  return row;
}

function renderGrade(id: number, box: number) {
  const card = grid?.querySelector<HTMLElement>(`.flashcard:nth-child(${id + 1})`);
  if (!card) return;
  const back = card.querySelector<HTMLElement>('.flashcard-back');
  if (!back) return;
  back.querySelector('.srs-grade-row')?.remove();
  const row = gradeRow(id);
  if (box > 1) {
    const boxLabel = document.createElement('span');
    boxLabel.className = 'srs-box-label';
    boxLabel.textContent = `Box ${box}`;
    row.prepend(boxLabel);
  }
  back.appendChild(row);
  card.dataset.srs = String(box);
}

if (grid && url) {
  const states = load();
  grid.querySelectorAll<HTMLElement>('.flashcard').forEach((card, index) => {
    const state = states.find((entry) => entry.id === index);
    if (state) {
      card.dataset.srs = String(state.box);
      renderGrade(index, state.box);
    }
    // Insert grade buttons on the back face the first time the card is flipped.
    card.addEventListener('click', () => {
      if (card.dataset.flipped === 'true') renderGrade(index, state?.box ?? 1);
    }, { once: false });
  });
}
