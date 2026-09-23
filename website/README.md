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

Create `subjects/<subject-slug>/` at the repository root. The directory alone appears as a subject with a name derived from its slug. For a custom name, description, and color, add `subject.json`:

```json
{
  "name": "New Subject",
  "description": "What this subject covers.",
  "color": "blue"
}
```

`color` may be `blue`, `green`, `purple`, `orange`, or `red`; unknown values use blue. The directory name becomes the URL slug. Subjects without lessons still get a page. A new build discovers the subject automatically.

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

Exercises can use `## Question 1` with `### Hint` and `### Answer`, or `### Question 1` within a `##` topic. A plain `Answer:` line also creates a revealable answer. Sections without an answer remain visible as practice notes. Flashcards use `## Card 1`, then `Front:` and `Back:` lines (or `### Front` and `### Back` headings). Separate cards with the next `## Card` heading. See existing lessons for examples.

Markdown supports code blocks, tables, and KaTeX math with `$...$` and `$$...$$`. HTML in Markdown is disabled. Recent lessons are sorted by frontmatter date. Continue Learning remembers the last opened lesson in the current browser; without history it links to the newest lesson.

## Reading interface

The desktop sidebar and mobile bottom bar link to Home, Subjects, and Search. Search opens a small in-page dialog listing subjects and lessons; use **Ctrl/⌘ K** to open it from a keyboard. It works entirely with the content generated at build time.

The lesson page separates the existing Markdown headings into readable sections and highlights Learning Objectives and Summary. Exercise answers expand with a button. Flashcards flip on click, Enter, or Space. The light/dark switch saves its choice in browser storage. Continue Learning shows the last opened lesson and its approximate reading progress, also saved only in that browser. Clearing browser storage resets both preferences and progress.

The interface uses system fonts and no additional UI dependency. Layouts adapt for phone, tablet, and laptop widths; reduced-motion settings shorten animations.

## Deploy to Netlify

Connect the repository and set **Base directory** to `website`, **Build command** to `npm run build`, and **Publish directory** to `dist`. No adapter or server is needed. Netlify must check out the whole repository so the build can read `../subjects/`.

## SEO and site URL

Each page has a title, description, canonical URL, and Open Graph metadata. The build creates `robots.txt` and `sitemap.xml` from the same subjects and lessons used for the pages. The SVG favicon has PNG and Apple touch icon versions, and social previews use `og-image.png`.

Set `SITE_URL` to the public site origin (for example, `https://study.example.com`) when using a custom domain. Otherwise, Netlify's `URL` build environment variable supplies the origin. Local builds use `http://localhost:4321` so previews and checks can run without deployment settings. Rebuild after changing the origin so canonical links, Open Graph URLs, robots.txt, and sitemap.xml use the new URL.
