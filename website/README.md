# Study Web App

Astro static site for the learning content in the repository's `subjects/` directory. The website is a display layer: `subject.json`, `lesson.md`, `exercises.md`, and `flashcards.md` remain the source of truth.

## Run locally

From `website/`:

```sh
npm install
npm run dev
```

Open the URL printed by Astro. Run `npm run check` for TypeScript and Astro diagnostics, or `npm run build` to generate the static site in `website/dist/`. Use `npm run preview` to inspect the build.

## Add a subject

Create `subjects/<subject-slug>/` at the repository root. A subject appears on the site once it has at least one lesson with body content. Its default name comes from the directory slug. For a custom name, description, and color, add `subject.json`:

```json
{
  "name": "New Subject",
  "description": "What this subject covers.",
  "color": "blue"
}
```

`color` may be `blue`, `green`, `purple`, `orange`, or `red`; unknown values use blue. The directory name becomes the URL slug. Empty placeholder folders, metadata-only subjects, and subjects without a usable lesson are omitted from pages and the sitemap. A new build discovers eligible subjects automatically.

`scripts/import-law-kit.mjs` (repository root) regenerates the Law & Data Protection lessons from the standalone single-file study kit:

```sh
node scripts/import-law-kit.mjs /path/to/law-data-protection-study-kit.html
```

It converts the kit's chapter notes to `lesson.md` (boxes become blockquotes, tables become pipe tables), its flashcard array to `flashcards.md`, and its multiple-choice bank to `exercises.md` with the correct answer letter and explanation in the answer line. Rerunning overwrites the generated lessons, so edit those files directly only after the final import.

## Add a lesson

Create `subjects/<subject-slug>/lessons/<lesson-slug>/lesson.md`:

```md
---
title: "Lesson Title"
date: "2026-09-23"
---

# Learning Objectives

- Understand the key idea.

# Lesson

Write the lesson here.

# Examples

Add an example.

# Summary

Summarize the lesson.
```

Optionally add `exercises.md` and `flashcards.md` in the same folder. The site discovers the lesson on the next build. The `TEMPLATE` lesson directory is excluded.

A `new-lesson` command can scaffold this for you (see `scripts/new-lesson` at the repository root; install it next to `up` with `scripts/install-up.sh`):

```sh
new-lesson computer-architecture cpu-basics "CPU Basics"
```

Exercises can use `## Question 1` with `### Hint` and `### Answer`, or `### Question 1` within a `##` topic. A plain `Answer:` line also creates a revealable answer. Sections without an answer remain visible as practice notes. Flashcards use `## Card 1`, then `Front:` and `Back:` lines (or `### Front` and `### Back` headings). Separate cards with the next `## Card` heading. See existing lessons for examples.

Markdown supports code blocks, tables, and KaTeX math with `$...$` and `$$...$$`. HTML in Markdown is disabled. Recent lessons are sorted by frontmatter date. Continue Learning remembers the last opened lesson in the current browser; without history it links to the newest lesson.

## Reading interface

The desktop sidebar and mobile bottom bar link to Home, Subjects, and Search. Search opens a small in-page dialog listing subjects and lessons; use **Ctrl/⌘ K** to open it from a keyboard. It works entirely with the content generated at build time.

The lesson page separates the existing Markdown headings into readable sections and highlights Learning Objectives and Summary. Exercise answers expand with a button. Flashcards flip on click, Enter, or Space. The **✨ AI Summary** button sends the visible lesson text to a Netlify Function and displays separate Vietnamese and English summaries, key points, and important concepts. **📝 Generate Practice** sends the same lesson text to a separate function and displays new questions with answers and explanations behind reveal controls. The light/dark switch saves its choice in browser storage. Continue Learning shows the last opened lesson and its approximate reading progress, also saved only in that browser. Clearing browser storage resets both preferences and progress.

The interface uses system fonts and no additional UI dependency. Layouts adapt for phone, tablet, and laptop widths; reduced-motion settings shorten animations.

## Deploy to Netlify

Connect the repository and set **Base directory** to `website`, **Build command** to `npm run build`, and **Publish directory** to `dist`. No Astro adapter is needed. Netlify must check out the whole repository so the build can read `../subjects/`. Netlify discovers `netlify/functions/ai-summary.js` and `netlify/functions/ai-exercise.js` under the same base directory and exposes them at `/.netlify/functions/ai-summary` and `/.netlify/functions/ai-exercise`.

For AI features, set `GEMINI_API_KEY` in Netlify's environment variables with access for Functions, then redeploy. The key is read only by the functions and is never included in the browser build. A normal `npm run dev` or `npm run preview` serves the static site without Netlify Functions; use Netlify Dev or the deployed site to exercise the AI buttons. Both functions accept POST requests with JSON `{ "content": "lesson text" }`. The summary function returns `vietnamese` and `english` objects, each containing `summary`, `keyPoints`, and `importantConcepts`; the exercise function returns an `exercises` array containing `question`, `answer`, and `explanation` for each item.

### AI function protection and cache

Both functions share two helper modules in `netlify/functions/`:

- `_ai-guard.js` — rejects requests whose `Origin` is not the study site (the production domain, localhost, or a Netlify deploy preview) and rate limits each visitor to 10 requests per minute. Exceeding the limit returns HTTP 429 with a friendly message.
- `_ai-cache.js` — stores finished results in Netlify Blobs keyed by a SHA-256 hash of the lesson text for up to 7 days. Repeating the same request returns the cached copy instantly (`"cached": true` in the response) and costs no Gemini quota.

Netlify Blobs works automatically on Netlify with no extra setup. Cache and rate-limit responses are best-effort: if Blobs is unavailable, generation still proceeds normally.

## Client feature modules

Browser features live as one file per feature in `website/src/scripts/`, imported by the pages that need them:

| File | Feature |
| --- | --- |
| `theme.ts` | Light/dark switch |
| `search.ts` | Search dialog and Ctrl/⌘ K |
| `continue-learning.ts` | Continue Learning card |
| `reading-progress.ts` | Saved reading position |
| `lesson-tracker.ts` | Daily activity, visited lessons, last-lesson record |
| `study-dashboard.ts` | Home dashboard: streak, activity heat, subject progress, due reviews |
| `exercise-reveal.ts` | Exercise answer disclosure |
| `flashcard-flip.ts` | Flashcard flip interaction |
| `srs-recorder.ts` | Leitner spaced repetition schedule for flashcards (Again / Hard / Good / Easy) |
| `ai-summary.ts` | AI Summary button and card |
| `ai-exercise.ts` | Generate Practice button and cards |

`@netlify/blobs` is a runtime dependency of the functions only; the browser bundle does not include it.

## SEO and site URL

Each page has a title, description, canonical URL, and Open Graph metadata. The build creates `robots.txt` and `sitemap.xml` from the same subjects and lessons used for the pages. The cat mascot in `public/cat-logo.jpg` is used for the site branding, PNG favicons, Apple touch icon, and `og-image.png` social preview.

Set `SITE_URL` to the public site origin (for example, `https://study.example.com`) when using a custom domain. Otherwise, Netlify's `URL` build environment variable supplies the origin. Local builds use `http://localhost:4321` so previews and checks can run without deployment settings. Rebuild after changing the origin so canonical links, Open Graph URLs, robots.txt, and sitemap.xml use the new URL.
