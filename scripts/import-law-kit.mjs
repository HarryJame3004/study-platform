#!/usr/bin/env node
// One-off importer: reads the standalone study kit HTML and writes subjects/law-and-data-protection/lessons/*.
// The kit's single-file data (CHAPTERS, CARDS_RAW, QUIZ) is re-expressed as website content:
//   CHAPTERS  -> lesson.md (Markdown)
//   CARDS_RAW -> flashcards.md (Front/Back cards)
//   QUIZ      -> exercises.md (question + answer: <letter>) <option>. <explanation>
// Usage: node scripts/import-law-kit.mjs /home/khoi/Downloads/law-data-protection-study-kit.html [--dry-run]
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const defaultInput = '/home/khoi/Downloads/law-data-protection-study-kit.html';
const input = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : defaultInput;
const dryRun = process.argv.includes('--dry-run');
const subjectsRoot = join(repoRoot, 'subjects', 'law-and-data-protection', 'lessons');

const html = readFileSync(input, 'utf8');

function slice(name) {
  const start = html.indexOf(`const ${name} = `);
  const end = html.indexOf('];', start);
  if (start < 0 || end < 0) throw new Error(`Cannot find ${name} in the kit HTML`);
  return html.slice(html.indexOf('[', start) + 1, end);
}

// Split "a","b" on top-level commas only (options contain commas inside strings).
function splitTopLevel(src) {
  const parts = [];
  let depth = 0, inString = false, current = '';
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (inString) {
      current += ch;
      if (ch === '\\') { current += src[++i] ?? ''; continue; }
      if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') { inString = true; current += ch; continue; }
    if (ch === '[' || ch === '{') depth++;
    if (ch === ']' || ch === '}') depth--;
    if (ch === ',' && depth === 0) { parts.push(current); current = ''; continue; }
    current += ch;
  }
  if (current.trim()) parts.push(current);
  return parts;
}

// ---------- CHAPTERS -> Markdown ----------
const chapters = [];
{
  const src = slice('CHAPTERS');
  const re = /\{n:(\d+), title:"((?:[^"\\]|\\.)*)", short:"((?:[^"\\]|\\.)*)", html:`([\s\S]*?)`\s*\}/g;
  for (const [, n, title, , htmlBody] of src.matchAll(re)) {
    chapters.push({ n: Number(n), title: JSON.parse(`"${title}"`), html: htmlBody });
  }
}
if (chapters.length !== 8) throw new Error(`Expected 8 chapters, found ${chapters.length}`);

function mdEscapeText(s) {
  return s
    .replace(/\\/g, '\\\\')
    .replace(/([\\*_[\]<])/g, '\\$1')
    .replace(/\$/g, '\\$');
}

// Inline HTML -> Markdown (the kit only uses a small tag set).
function inlineToMd(htmlString) {
  let s = htmlString;
  s = s.replace(/<span class="seal">([\s\S]*?)<\/span>/g, (_m, inner) => `\`${inner}\``);
  // Tables -> GitHub pipe tables.
  s = s.replace(/<div class="tbl"><table>([\s\S]*?)<\/table><\/div>/g, (_m, table) => {
    const rows = [...table.matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map((r) =>
      [...r[1].matchAll(/<t([hd])>([\s\S]*?)<\/t\1>/g)].map((c) => c[2].trim().replace(/\s+/g, ' '))
    );
    if (!rows.length) return '';
    const widths = rows[0].map((_h, i) => Math.max(...rows.map((r) => (r[i] ?? '').length), 3));
    const out = rows.map((row, ri) =>
      `| ${row.map((cell, i) => (cell ?? '').padEnd(widths[i])).join(' | ')} |` +
      (ri === 0 ? `\n| ${widths.map((w) => '-'.repeat(w)).join(' | ')} |` : '')
    );
    return `\n\n${out.join('\n')}\n\n`;
  });
  // Boxes -> blockquotes. Titles in the kit already carry the label words; just add an emoji.
  s = s.replace(/<div class="box (trap|case|mnemo|beyond)"><b class="k">([\s\S]*?)<\/b>([\s\S]*?)<\/div>/g,
    (_m, kind, title, body) => {
      const icon = { trap: '⚠️', case: '⚖️', mnemo: '🧠', beyond: '📚' }[kind];
      const bodyText = body.replace(/<li>/g, '\n- ').replace(/<\/li>/g, '').replace(/<\/?ul>/g, '').trim();
      return `\n\n> **${icon} ${title.trim()}**\n>\n> ${bodyText.replace(/\n/g, '\n> ')}\n\n`;
    });
  // Simple callout.
  s = s.replace(/<p class="simple">([\s\S]*?)<\/p>/g, '\n\n> **In one sentence:** $1\n\n');
  // Bold/italic last, after structures that rely on <b>/<\/b> markers are consumed.
  s = s.replace(/<b>/g, '**').replace(/<\/b>/g, '**').replace(/<i>/g, '*').replace(/<\/i>/g, '*');
  s = s.replace(/<br\s*\/?>/gi, '\n');
  // Stop the Markdown typographer turning "(c)" into © (lawful bases a–f).
  s = mdSafe(s);
  return s;
}

function blockToMd(htmlString) {
  let s = htmlString;
  s = inlineToMd(s);
  s = s.replace(/<h3>([\s\S]*?)<\/h3>/g, (_m, t) => `\n## ${mdEscapeText(t.trim())}\n`);
  s = s.replace(/<h4>([\s\S]*?)<\/h4>/g, (_m, t) => `\n### ${mdEscapeText(t.trim())}\n`);
  s = s.replace(/<ol>/g, '\n').replace(/<\/ol>/g, '');
  s = s.replace(/<ul>/g, '\n').replace(/<\/ul>/g, '');
  s = s.replace(/<li>([\s\S]*?)<\/li>/g, (_m, body) => `- ${body.trim().replace(/\s+/g, ' ')}`);
  s = s.replace(/<p>([\s\S]*?)<\/p>/g, (_m, body) => `\n${body.trim().replace(/\s+/g, ' ')}\n`);
  s = s.replace(/<\/?div[^>]*>/g, '');
  s = s.replace(/<span class="tagline">[\s\S]*?<\/span>/g, '');
  s = s.replace(/<[^>]+>/g, '');
  s = s.replace(/&amp;/g, '&').replace(/&lt;/g, '&lt;').replace(/&gt;/g, '&gt;');
  // Collapse whitespace, but keep blockquotes and table pipes intact.
  s = s.split('\n').map((line) => {
    if (line.startsWith('>')) return line.replace(/\s+$/, '');
    if (line.trim().startsWith('|')) return line.trim();
    return line.replace(/\s+/g, ' ').replace(/\s+$/, '');
  }).join('\n');
  s = s.replace(/\n{3,}/g, '\n\n').trim();
  return s;
}

// ---------- CARDS_RAW -> flashcards ----------
const cards = [];
{
  const src = slice('CARDS_RAW');
  const re = /\[(\d+),"((?:[^"\\]|\\.)*)","((?:[^"\\]|\\.)*)"\]/g;
  for (const [, c, f, b] of src.matchAll(re)) {
    cards.push({ c: Number(c), front: JSON.parse(`"${f}"`), back: JSON.parse(`"${b}"`) });
  }
}

// ---------- QUIZ -> exercises ----------
const quiz = [];
{
  const src = slice('QUIZ');
  const re = /\[(\d+),"((?:[^"\\]|\\.)*)",\[([\s\S]*?)\],(\d+),"((?:[^"\\]|\\.)*)"\]/g;
  for (const [, c, q, opts, ans, ex] of src.matchAll(re)) {
    quiz.push({
      c: Number(c),
      q: JSON.parse(`"${q}"`),
      opts: splitTopLevel(opts).map((o) => JSON.parse(o.trim())),
      ans: Number(ans),
      ex: JSON.parse(`"${ex}"`),
    });
  }
}

const CHAPTER_TITLES = {
  1: 'Basics of Law & the Background of Data Protection',
  2: 'The Concept of Personal Data',
  3: 'Core Principles of the GDPR',
  4: 'Data Subject Rights under the GDPR',
  5: 'Special Categories & Criminal Data (Art. 9 and Art. 10)',
  6: 'Remedies, Liability, Penalties and Compensation',
  7: 'Data Protection Impact Assessment (DPIA)',
  8: 'International Data Transfers under the GDPR',
};

const LESSONS = [
  { slug: 'how-to-use-this-study-kit', title: 'How to Use This Study Kit', n: 0 },
  ...chapters.map((ch) => ({ slug: `ch${ch.n}-${ch.title.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`, title: CHAPTER_TITLES[ch.n], n: ch.n })),
];

function lessonBody(n) {
  if (n === 0) {
    const totals = [
      ['Read', '1 intro + 8 chapter lessons below'],
      ['Flashcards', `${cards.length} cards across all chapters (spaced repetition with Again / Hard / Good / Easy)`],
      ['Multiple choice', `${quiz.length} exam-style questions with explanations (each chapter + a 30-question mock on the Start page of the original kit)`],
      ['Written practice', '19 exam questions with model-answer outlines (in the original kit file)'],
      ['Feynman prompts', '16 explain-it-simply exercises (in the original kit file)'],
    ];
    return [
      '# Learning Objectives',
      '',
      '- Know the four-step study loop: Read → Explain → Recall → Test.',
      `- Rehearse all 8 chapters of the Law & Data Protection course with ${cards.length} flashcards and ${quiz.length} multiple-choice questions.`,
      '- Use the exam traps and memory hooks embedded in each chapter to avoid the classic mistakes.',
      '',
      '# Lesson',
      '',
      'This subject is a complete study kit for the Law & Data Protection course, imported from the single-file study kit. Study the chapters in order: each chapter lesson contains the full reading notes plus its flashcards and multiple-choice questions.',
      '',
      '## The four-step loop per chapter',
      '',
      '1. **Read** one chapter lesson (about 25 minutes).',
      '2. **Explain** — close the notes and explain a concept in plain words (Feynman technique).',
      '3. **Recall** — do your due flashcards every day, 10–15 minutes; the site schedules reviews for you.',
      '4. **Test** — take the chapter quiz, then a mixed mock a few days later.',
      '',
      '## What is inside',
      '',
      '| Part | Where to find it |',
      '| ---- | ---------------- |',
      ...totals.map(([k, v]) => `| ${k} | ${v} |`),
      '',
      '## Exam strategy in brief',
      '',
      '- **Multiple choice:** find the key fact first (who processes, why, what kind of data). Watch the small words: "whichever is **higher**", "**two or more** criteria", "**explicit** consent", "**solely** automated", "at the latest **one month**".',
      '- **Written answers:** use IRAC — Issue, Rule (with the article), Application to the facts, Conclusion. Naming a lecture case (Google Spain, Digital Rights Ireland, S. and Marper, Rijkeboer) earns extra marks.',
      '- **10-day plan:** ch 1–2 → ch 3 (two days) → ch 4 → ch 5 → ch 6 → ch 7 → ch 8 → mixed mocks → written answers in exam conditions.',
      '',
      '# Summary',
      '',
      'Four steps per chapter — read, explain, recall, test — plus spaced repetition and mock exams, is the fastest route through this kit. The chapter lessons below contain everything from the original single-file study kit.',
    ].join('\n');
  }
  const ch = chapters[n - 1];
  return [
    '# Learning Objectives',
    '',
    `Master Chapter ${n} — ${ch.title} — well enough to answer both multiple-choice and written exam questions on it.`,
    '',
    '# Lesson',
    '',
    blockToMd(ch.html),
    '',
    '# Summary',
    '',
    'Use the flashcards below for spaced repetition, then take the chapter quiz. Re-read any section you missed.',
  ].join('\n');
}

// Stop the Markdown typographer turning "(c)" into © (article letters like 6(1)(c)).
function mdSafe(s) {
  return s.replace(/\(([cC])\)/g, '&lpar;$1&rpar;');
}

function flashcardsFor(n) {
  const deck = cards.filter((c) => c.c === n);
  if (!deck.length) return '';
  const out = ['# Flashcards', ''];
  deck.forEach((card, i) => {
    out.push(`## Card ${i + 1}`, '', 'Front:', '', mdSafe(card.front), '', 'Back:', '', mdSafe(card.back), '');
    if (i < deck.length - 1) out.push('---', '');
  });
  return out.join('\n');
}

function exercisesFor(n) {
  const pool = quiz.filter((q) => q.c === n);
  if (!pool.length) return '';
  const out = ['# Exercises', '', '## Chapter ' + n + ' MCQ', ''];
  pool.forEach((q, i) => {
    const letters = ['A', 'B', 'C', 'D'];
    out.push(`### Question ${i + 1}`, '', mdSafe(q.q), '');
    q.opts.forEach((opt, j) => out.push(`- ${letters[j]}. ${mdSafe(opt)}`));
    out.push('', `Answer: ${letters[q.ans]}. ${mdSafe(q.opts[q.ans])}. ${mdSafe(q.ex)}`, '');
    if (i < pool.length - 1) out.push('---', '');
  });
  return out.join('\n');
}

if (dryRun) {
  console.log(`Would write ${LESSONS.length} lessons, ${cards.length} cards, ${quiz.length} quiz questions.`);
  LESSONS.forEach((l) => console.log(`  ${l.slug}  cards=${cards.filter((c) => c.c === l.n).length}  quiz=${quiz.filter((q) => q.c === l.n).length}`));
  process.exit(0);
}

for (const lesson of LESSONS) {
  const dir = join(subjectsRoot, lesson.slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'lesson.md'), `---\ntitle: "${lesson.title}"\ndate: "2026-09-24"\n---\n\n${lessonBody(lesson.n)}\n`);
  const cardsMd = flashcardsFor(lesson.n);
  if (cardsMd) writeFileSync(join(dir, 'flashcards.md'), cardsMd + '\n');
  const exMd = exercisesFor(lesson.n);
  if (exMd) writeFileSync(join(dir, 'exercises.md'), exMd + '\n');
}
console.log(`Imported ${LESSONS.length} lessons into subjects/law-and-data-protection/lessons/`);
console.log(`Cards: ${cards.length}, quiz questions: ${quiz.length}`);
