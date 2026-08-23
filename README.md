# Document Summary Assistant

A web app that takes a PDF or a scanned image, extracts the text, and produces a
summary (short, medium, or long) plus a separate list of key points.

## Features

- Upload via drag-and-drop or a file picker button (PDF, JPG, PNG)
- File name, size, and image preview thumbnail after upload
- PDF text extraction with paragraph and line breaks preserved
- OCR for image files, entirely in the browser
- Summary length control: Short / Medium / Long, re-generated instantly
- Key points listed as bullets below the summary
- Clear states: idle, uploading, processing, summary-ready, error
- Friendly text-only error handling for unsupported files, blank documents,
  and processing failures, with a retry action
- Mobile-responsive, text-only interface (no icon libraries)

## Tech stack

| Concern      | Tool                                             |
| ------------ | ------------------------------------------------ |
| Framework    | React 19 + TanStack Start (Vite 7)               |
| Styling      | Tailwind CSS v4 with semantic design tokens      |
| PDF parsing  | `pdfjs-dist`                                     |
| OCR          | `tesseract.js`                                   |
| Summarising  | Custom TF-ISF extractive algorithm (`src/lib/summarize.ts`) |

## Approach

1. **Extraction** (`src/lib/extract.ts`) — PDFs are parsed page by page; line and
   paragraph breaks are inferred from the vertical position of each text run.
   Images are passed to the OCR engine, which reports progress back to the UI.
   Both libraries are dynamically imported so they only load in the browser when
   a file is actually uploaded.
2. **Summarisation** (`src/lib/summarize.ts`) — the text is split into sentences
   and scored with term-frequency weighting, normalised by sentence length, with
   small bonuses for opening sentences. Top-ranked sentences are re-ordered by
   their original position to keep the summary readable. Key points reuse the
   highest-ranked sentences, trimmed to bullet length.
3. **UI** (`src/routes/index.tsx`) — one state machine drives every visual state,
   so loading, error, and result views can never contradict each other.

Summarisation runs locally, which means there are **no API keys to configure**
and no per-request cost or rate limit.

## Setup

```bash
bun install     # or: npm install
bun run dev     # or: npm run dev
```

The app runs at http://localhost:8080.

## Environment variables

None are required. If you later swap the local summariser for a hosted model,
add the key to a `.env` file and read it inside a server function handler only:

```
SUMMARY_API_KEY=your-key-here
```

Then set the same variable in your host's dashboard (Vercel: Project Settings →
Environment Variables; Netlify: Site configuration → Environment variables).
Never expose a private key through a `VITE_`-prefixed variable.

## Build and deployment

```bash
bun run build
```

The build outputs a server bundle plus static client assets and deploys as-is on
Vercel or Netlify — import the repository and both platforms detect the Vite
build automatically (build command `npm run build`). Node 20+ is required.

## Project structure

```
src/
  components/FileDropzone.tsx   Drag-and-drop + file picker
  components/ui/                Reusable primitives (button, etc.)
  lib/extract.ts                PDF text extraction and OCR
  lib/summarize.ts              Extractive summarisation
  routes/index.tsx              Page, state machine, all visual states
  styles.css                    Design tokens and base styles
```
