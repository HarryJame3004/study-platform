# Study Platform Specification

## Vision

Study is a personal learning platform that organizes knowledge, lessons, exercises, and flashcards in one GitHub repository.

## Core Principle

```
ONE REPOSITORY
      ↓
MULTIPLE SUBJECTS
      ↓
DAILY LESSONS
      ↓
LESSONS + EXERCISES + FLASHCARDS
```

## Architecture

```
study-platform/

├── subjects/   # Learning content
├── website/    # Astro static web application
├── docs/       # Documentation
└── README.md
```

## Content Flow

Learn → Create lesson → Store in GitHub → Website displays content.

The website should display content, not own the content.

## Phase 2 — Web foundation

The `website/` Astro app generates pages from `subjects/*/` and each lesson's Markdown files at build time. Optional `subject.json` files supply subject names and descriptions. Subjects and lessons appear automatically after a rebuild; the `TEMPLATE` lesson is excluded. The site provides a home dashboard, subject and lesson pages, exercises with revealable answers, flashcards, responsive layouts, and a saved light/dark preference. Continue Learning stores only the last opened lesson in the browser's local storage. There is no authentication, database, backend, or cloud sync. See `website/README.md` for local and Netlify build instructions.

## Goal

Add knowledge, not frontend code.
