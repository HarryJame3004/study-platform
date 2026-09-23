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
├── website/    # Future web application
├── docs/       # Documentation
└── README.md
```

## Content Flow

Learn → Create lesson → Store in GitHub → Website displays content.

The website should display content, not own the content.

## Goal

Add knowledge, not frontend code.
