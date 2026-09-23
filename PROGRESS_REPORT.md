# Phase 2.2 — Study Web Premium UI Redesign

## Files changed

- `website/src/layouts/BaseLayout.astro` — desktop sidebar, mobile bottom navigation, search dialog, appearance switch.
- `website/src/pages/index.astro` — hero, Continue Learning progress, subject and recent lesson layouts.
- `website/src/components/SubjectCard.astro` — redesigned subject cards.
- `website/src/pages/subjects/[subject].astro` — subject header and lesson cards with short descriptions derived from rendered lesson content.
- `website/src/pages/subjects/[subject]/lessons/[lesson].astro` — reading sections, table of contents, exercises, flashcards, and local reading progress.
- `website/src/styles/global.css` — new color tokens, typography, spacing, light/dark palettes, responsive layouts, and restrained transitions.
- `website/README.md` — navigation, search, reading progress, and interaction notes.
- `PROGRESS_REPORT.md` — this report.

## UI changes

The interface now uses a soft violet and blue palette, rounded white surfaces, gentle shadows, and clearer spacing. On desktop the app has a persistent sidebar; at widths under 900px it uses a bottom navigation bar. The dashboard centers on the current lesson and shows locally saved reading progress. Subjects use a distinctive header and lesson cards. Lessons have a narrower reading column, section hierarchy, highlighted objectives and summary, code/table styling, and a contents panel. Exercise answers expand with a fade; flashcards rotate to show the answer. Search filters the generated subject and lesson list without a server.

## Tests

- `npm run check` — passed with zero Astro/TypeScript errors or warnings.
- `npm run build` — passed; 11 static pages generated, including Computer Architecture, C Programming, and Boolean Algebra.
- Generated HTML checks — passed for home, both subject examples, Boolean Algebra lesson, five flashcards, three revealable answers, and internal links.
- Responsive CSS checks — phone, tablet, and laptop breakpoints are present; dark palette and reduced-motion rules are present.
- Browser screenshot attempt — Firefox headless could not render in this environment (`RenderCompositorSWGL failed mapping default framebuffer`). Visual screenshots and interactive browser checks remain unverified here.

## Next steps

Open the built site in a regular browser to visually review phone, tablet, laptop, and dark mode layouts, then adjust any device-specific spacing found there. No content or architecture changes are needed for this phase.

# Phase 3.2 — Study Platform SEO Setup

## Changes

- Added page titles and descriptions for home, subjects, and lessons. Subject names and descriptions come from existing subject metadata; lesson titles include their subject names.
- Added canonical URLs and Open Graph title, description, URL, type, site name, and image metadata in the shared layout. Lesson pages use the `article` type.
- Kept the existing SVG favicon and added a 32 px PNG fallback and 180 px Apple touch icon. Added a 1200 × 630 social preview image.
- Added generated `robots.txt` and `sitemap.xml` endpoints. The sitemap includes the home page, every subject, and every published lesson found by the current content loader.
- Configured the site origin from `SITE_URL`, then Netlify's `URL`, with a localhost fallback for local builds. Documented the setting in `website/README.md`.
- Left `subjects/`, lesson format, content paths, and static Netlify deployment architecture unchanged.

## Verification

- `npm run check` — passed with 0 errors, 0 warnings, and 0 hints.
- `npm run build` — passed; 11 content pages plus `robots.txt` and `sitemap.xml` generated.
- Inspected generated metadata for home, Computer Architecture, and Boolean Algebra pages; titles, descriptions, canonical URLs, Open Graph values, and favicon links are present.
- Inspected generated sitemap and robots output; all 11 content pages are listed, and robots points to the sitemap.
- Confirmed the social preview PNG is 1200 × 630 and visually rendered as intended.

## Deployment note

For a custom domain, set `SITE_URL` to its public origin in Netlify and rebuild. Without that setting, Netlify's `URL` build variable supplies the canonical and sitemap origin.

# Phase 3.3 — Fix Sitemap Generation

## Changes

- Validate subject and lesson slugs before constructing sitemap paths. Lesson paths must match the routes generated from their subject and lesson slugs.
- Validate each absolute sitemap URL before writing it; skip empty, malformed, or off-origin paths, and remove duplicates.
- Keep `subjects/` as the source of truth. Content architecture, routing, and SEO page metadata are unchanged.

## Verification

- `npm run check` — passed with 0 errors, 0 warnings, and 0 hints.
- `npm run build` — passed; 11 content pages generated.
- Parsed the generated sitemap and compared it with built `index.html` routes: all 11 URLs are nonempty and unique, with no missing or extra page routes.

# Phase 3.4 — Clean Subject Discovery

## Changes

- Subject discovery now publishes only subjects with at least one usable lesson. Lessons with empty Markdown bodies are ignored.
- Placeholder folders and metadata-only subjects remain in `subjects/` but no longer appear on the home page, in search, as generated subject pages, or in the sitemap.
- Updated the website README to describe when a subject becomes visible. Lesson format and route patterns are unchanged.

## Verification

- `npm run check` — passed with 0 errors, 0 warnings, and 0 hints.
- `npm run build` — passed; 4 pages generated: home, Computer Architecture, and its two lessons.
- Parsed `sitemap.xml` and compared it with built HTML routes: exactly the same 4 URLs, with no empty or duplicate entries and no placeholder subjects.

# Phase 5.1 — Global Study Platform Publish Command

## Files created

- `scripts/up` — executable publish command for `~/study-platform`.
- `scripts/install-up.sh` — executable user-level installer for `~/.local/bin/up`.

## How it works

The command finds `~/study-platform` using the user's home directory, changes into it, and verifies that it is the Git repository root. If `git status --porcelain` finds no changes, it prints `Nothing to update` and exits successfully. Otherwise it runs `git add .`, `git commit -m "Update learning content"`, and `git push` in that order. It prints a success message only after the push succeeds. It does not use force push or operate on another repository.

## Installation

Run `~/study-platform/scripts/install-up.sh` in a normal user terminal. The installer copies the command to `~/.local/bin/up` with executable permissions. Ensure `~/.local/bin` is in `PATH`; it is already present in this environment's `PATH`. After installation, `up` can be run from any directory.

## Testing results and environment limit

- `bash -n` passed for both scripts; `git diff --check` passed.
- The installer created an executable `up` command in a temporary home directory.
- With Git mocked to prevent a real commit and push, running `up` from `/home/khoi` printed `Nothing to update` for a clean status. Running it from `/home/khoi/Downloads` used the expected add, commit, and push sequence and printed success. Every Git call ran from `/home/khoi/study-platform`.
- Installing to the actual `/home/khoi/.local/bin/up` was rejected because that directory is read-only in this workspace sandbox. Actual global invocation and live Git push remain unverified until installation is run in a normal user terminal.

# Phase 6.1 Fix — Gemini AI Summary Function

## Changes

- Added `website/netlify/functions/ai-summary.js`. It reads `GEMINI_API_KEY` from the function environment, accepts POST requests with lesson text, asks Gemini 2.5 Flash for structured JSON, validates the result, and returns `summary`, `keyPoints`, and `importantConcepts`.
- Added an **✨ AI Summary** button and a summary card to lesson pages. The browser sends the visible lesson text to `/.netlify/functions/ai-summary` and renders returned text safely, with loading and error states.
- Styled the card for desktop, mobile, and the existing light/dark themes. Updated the website README with setup and local testing notes.
- Left `subjects/`, the lesson format, lesson routes, and Netlify's static site deployment settings unchanged.

## Verification

- `npm run check` — passed with 0 errors, 0 warnings, and 0 hints.
- `npm run build` — passed; 4 static pages generated.
- Direct function checks with a mocked Gemini request passed for method validation, empty and oversized input, missing key, expected request and response shape, and upstream failure.
- Inspected the generated lesson HTML: it includes the button, card, and function URL, with no API key embedded.
- Live Gemini and deployed Netlify Function calls were not run in this environment because no API key or Netlify deployment is available here.

# Phase 6.2 — Cat Branding Update

## Changes

- Used the available `website/public/cat-logo.jpg` as the mascot source. The requested `cat-logo.png.jpg` filename was not present in the workspace.
- Replaced the generic S branding marks in the sidebar and top bar with the cat, and changed visible brand text to **Khoi Study VGU**.
- Replaced the old SVG favicon with cat-based 16 px and 32 px PNG favicons and a 180 px Apple touch icon.
- Updated the 1200 × 630 Open Graph image to feature the cat and Khoi Study VGU branding. Updated page titles, Open Graph site name, and image alt text to match.
- Updated the website README. AI Summary, `subjects/`, lesson structure, and deployment settings remain unchanged.

## Verification

- `npm run check` — passed with 0 errors, 0 warnings, and 0 hints.
- `npm run build` — passed; 4 static pages generated.
- Inspected the cat source and generated social image visually. Confirmed generated image dimensions: favicon 16 × 16 and 32 × 32, touch icon 180 × 180, and Open Graph image 1200 × 630.
- Checked built home and lesson HTML for cat branding, valid icon links, and the Open Graph image. The lesson still includes the AI Summary button.

# Phase 6.2 — AI Exercise Generator

## Changes

- Added `website/netlify/functions/ai-exercise.js`. It reads `GEMINI_API_KEY` server-side, accepts lesson text by POST, asks Gemini 3.6 Flash for structured practice exercises, validates the response, and returns an `exercises` array with `question`, `answer`, and `explanation` fields.
- Added a **📝 Generate Practice** button to each lesson page. Generated questions appear in a card list, with answers and explanations behind reveal controls. The UI includes loading, retry, and error states.
- Updated `website/README.md` with the endpoint, response shape, and Netlify environment setup. AI Summary was not modified; `subjects/`, lesson format, routing, and deployment architecture remain unchanged.

## Verification

- `npm run check` — passed with 0 errors, 0 warnings, and 0 hints.
- `npm run build` — passed; 4 static pages generated.
- Mocked function checks passed for POST handling, input limits, missing key, Gemini request schema, valid response, malformed response, and upstream failure.
- Inspected a built lesson page: it contains the new practice button and endpoint, retains AI Summary, and contains no API key.
- A live Gemini or deployed Netlify Function call was not run in this environment.

# Phase 6.1.1 — Bilingual AI Summary

## Changes

- Updated `website/netlify/functions/ai-summary.js` to request structured Vietnamese and English summaries in one Gemini response. Each language contains `summary`, `keyPoints`, and `importantConcepts`; the function validates both sections before returning them.
- Updated the lesson AI Summary card to show separate 🇻🇳 Vietnamese and 🇬🇧 English panels. Each panel displays its summary, key points, and important concepts, with language attributes and responsive styling for mobile and dark mode.
- Updated `website/README.md` with the bilingual response shape. AI Exercise Generator, `subjects/`, lesson format, routing, and deployment settings are unchanged.

## Verification

- `npm run check` — passed with 0 errors, 0 warnings, and 0 hints.
- `npm run build` — passed; 4 static pages generated.
- Mocked function checks passed for request schema, both language outputs, trimmed values, missing language, empty key points, and request validation.
- Inspected built lesson HTML for both language panels and the unchanged Generate Practice feature. Live Gemini and deployed Netlify calls were not run here.
