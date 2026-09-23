import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import MarkdownIt from 'markdown-it';
import markdownItKatex from 'markdown-it-katex';

const subjectsRoot = fileURLToPath(new URL('../../../subjects/', import.meta.url));
const md = new MarkdownIt({ html: false, linkify: true, typographer: true });
md.use(markdownItKatex, { throwOnError: false });

export interface Subject {
  slug: string;
  name: string;
  description: string;
  color: string;
  lessons: Lesson[];
}

export interface Exercise {
  title: string;
  questionHtml: string;
  answerHtml: string;
}

export interface Flashcard {
  frontHtml: string;
  backHtml: string;
}

export interface Lesson {
  slug: string;
  subjectSlug: string;
  title: string;
  date: string;
  html: string;
  exercises: Exercise[];
  flashcards: Flashcard[];
  url: string;
}

export function renderMarkdown(source: string): string {
  return md.render(source.trim());
}

function readOptional(path: string): string {
  return existsSync(path) ? readFileSync(path, 'utf8') : '';
}

function displayName(slug: string): string {
  return slug.replace(/[-_]/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function parseExercises(source: string): Exercise[] {
  if (!source.trim()) return [];
  const body = source.replace(/^# Exercises\s*/i, '').trim();
  const sections = body.split(/(?=^## )/m).filter((part) => part.trim());
  const chunks = sections.flatMap((section) => {
    const heading = section.match(/^## (.+)\n/);
    const pieces = section.split(/(?=^### Question\b)/m).filter((part) => part.trim());
    if (pieces.length <= 1) return section.split(/^---\s*$/m).filter((part) => part.trim());
    return pieces.map((part, index) => index === 0 ? part : `## ${heading?.[1] ?? 'Exercises'}\n\n${part}`)
      .filter((part) => !/^## .+\s*$/.test(part.trim()));
  });
  return chunks.map((chunk) => {
    const match = chunk.match(/(?:^|\n)(?:### Answer\s*\n|Answer:\s*)([\s\S]*)/i);
    const question = match ? chunk.slice(0, match.index! + (chunk[match.index!] === '\n' ? 1 : 0)) : chunk;
    const answer = match?.[1]?.trim() ?? '';
    const title = question.match(/^###? (.+)$/m)?.[1] ?? 'Practice';
    return { title, questionHtml: renderMarkdown(question), answerHtml: renderMarkdown(answer) };
  }).filter((item) => item.questionHtml);
}

function parseFlashcards(source: string): Flashcard[] {
  if (!source.trim()) return [];
  return source.replace(/^# Flashcards\s*/i, '').split(/(?=^## Card\b)/m)
    .map((card) => {
      const front = card.match(/(?:^|\n)(?:### Front|Front:)\s*\n([\s\S]*?)(?=(?:\n)(?:### Back|Back:)\s*\n|$)/i);
      const back = card.match(/(?:^|\n)(?:### Back|Back:)\s*\n([\s\S]*)/i);
      return { frontHtml: renderMarkdown(front?.[1] ?? ''), backHtml: renderMarkdown((back?.[1] ?? '').replace(/\n---\s*$/, '')) };
    })
    .filter((card) => card.frontHtml && card.backHtml);
}

function loadLessons(subjectSlug: string, subjectPath: string): Lesson[] {
  const lessonsPath = join(subjectPath, 'lessons');
  if (!existsSync(lessonsPath)) return [];
  return readdirSync(lessonsPath, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name.toLowerCase() !== 'template')
    .flatMap((entry) => {
      const path = join(lessonsPath, entry.name);
      const raw = readOptional(join(path, 'lesson.md'));
      if (!raw.trim()) return [];
      const { data, content } = matter(raw);
      const title = typeof data.title === 'string' ? data.title : displayName(entry.name);
      const date = typeof data.date === 'string' ? data.date : data.date instanceof Date ? data.date.toISOString().slice(0, 10) : '';
      return [{
        slug: entry.name,
        subjectSlug,
        title,
        date,
        html: renderMarkdown(content),
        exercises: parseExercises(readOptional(join(path, 'exercises.md'))),
        flashcards: parseFlashcards(readOptional(join(path, 'flashcards.md'))),
        url: `/subjects/${subjectSlug}/lessons/${entry.name}/`,
      }];
    })
    .sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
}

export function getSubjects(): Subject[] {
  return readdirSync(subjectsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
    .map((entry) => {
      const path = join(subjectsRoot, entry.name);
      const rawMetadata = readOptional(join(path, 'subject.json'));
      const metadata = rawMetadata ? JSON.parse(rawMetadata) : {};
      return {
        slug: entry.name,
        name: typeof metadata.name === 'string' ? metadata.name : displayName(entry.name),
        description: typeof metadata.description === 'string' ? metadata.description : '',
        color: typeof metadata.color === 'string' ? metadata.color : 'blue',
        lessons: loadLessons(entry.name, path),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}
