# System Design Document: LyricSheet

**Project**: LyricSheet  
**Date**: May 3, 2026  
**Author**: Daniel Seo  
**Status**: Ready for Review  

## 1. Executive Summary

LyricSheet is a specialized web application built for musicians and collectors to generate professional-grade, printable lyric sheets. The system automates the tedious task of formatting and organizing lyrics by leveraging Large Language Models (LLMs) for text processing and OCR (Optical Character Recognition), coupled with a print-optimized frontend layout engine.

---

## 2. System Architecture

The application follows a modern Single Page Application (SPA) architecture, emphasizing speed, portability, and zero-asset overhead.

### 2.1 Core Tech Stack
- **Framework**: React 19 (Functional Components + Hooks)
- **Language**: TypeScript (Strict mode)
- **Build Tool**: Vite 6.x
- **Styling**: Tailwind CSS 4.0
- **Animations**: Framer Motion (`motion/react`)
- **AI Engine**: Google Gemini 1.5 Flash (`@google/genai`)

### 2.2 Data Flow Diagram
1. **Input Phase**: User provides metadata (Title/Artist) and source content (Raw Text or Image/Screenshot).
2. **Processing Phase**: 
   - Base64 encoding for images (if provided).
   - `geminiService` constructs a structured prompt with JSON response schema.
   - LLM extracts verbatim lyrics and performs OCR if necessary.
3. **Display Phase**: Responsive React components render the cleaned data.
4. **Export Phase**: State is serialized into a URL fragment (Hash) for state-sharing or triggered for direct browser printing.

---

## 3. Component Breakdown

### 3.1 `App.tsx` (The Orchestrator)
The central hub for state management. It handles:
- **Global States**: `lyricsData`, `isLoading`, `error`.
- **Deep Linking**: Parses URL hashes on mount to support sharing/reloading formatted sheets.
- **Side Effects**: Manages print triggers and audio feedback cues.

### 3.2 `geminiService.ts` (AI Integration)
A decoupled service layer utilizing a singleton pattern for the `GoogleGenAI` client.
- **Schema Enforcement**: Uses `responseMimeType: "application/json"` and `responseSchema` to guarantee structured data delivery (Title, Artist, Album, Year, Lyrics).
- **Prompt Engineering**: Multi-modal instructions that prioritize verbatim accuracy and metadata adherence.

### 3.3 `LyricsDisplay.tsx` (The Virtual Paging Engine)
A specialized component designed with a "Print-First" philosophy. It handles the most complex logic in the system:
- **Virtual Paging Algorithm**: Instead of a naive scroll, the component calculates estimated vertical heights for every line (based on font size and line-height) and logically segments them into 11-inch "Pages".
- **Multi-Page Support**: Includes lookahead logic to prevent "orphaned" headers at the bottom of pages, ensuring section headers and the following line remain on the same page.
- **Layout Control**: Utilizes CSS Column Layout (`column-count`) via utility classes to manage complex word-wrapping flow between columns.
- **Interactive Editing**: Specifically allows users to override AI results directly in a preview-mirrored textarea before final export.

### 3.4 `audio.ts` (Web Audio API)
Instead of loading MP3/WAV files, uses the **Web Audio API** to synthesize a "Ding" notification sound programmatically.
- **Synthesized Tones**: Plays a specific sequence (C5 and E5) to provide non-visual feedback for successful AI generations.
- **Constraint Benefit**: Zero network latency for assets and reduced bundle size.

---

## 4. Key Design Patterns & Principles

### 4.1 Asset-less Design
To ensure maximum compatibility and speed in the AI Studio environment, the app avoids external binary assets (images/audio). All icons are SVG (via `lucide-react`) and sounds are synthesized.

### 4.2 State Recovery via URL Hashes
The application uses the URL Hash (`#print={DATA}`) as an ephemeral database. This allows:
- **Popouts**: Opening a clean view in a new tab without a backend.
- **Printing**: Deep-links that automatically trigger `window.print()`.

### 4.3 Error Handling & Resilience
- **Try-Catch Wrappers**: All AI and Audio calls are guarded.
- **Validation Helpers**: `LyricsInputForm` enforces required fields before allowing AI processing.
- **Implicit Knowledge**: If the user provides incomplete metadata, the AI uses its training data to fill gaps (Title/Artist) while strictly respecting user-provided overrides.

---

## 5. Security & Infrastructure

- **Environment Variables**: `GEMINI_API_KEY` is never exposed in the source. It is accessed via `process.env` (server-side/build-time context) or `import.meta.env`.
- **Isolation**: The application runs entirely client-side after the initial load, minimizing server dependency and costs.

---

## 6. Future Scalability

1. **Firestore Integration**: Add a persistence layer for user "Lyric Libraries".
2. **Batch Processing**: Allow users to upload full albums for formatting in one pass.
3. **Chord Detection**: Integrate secondary AI passes to detect and align chords above lyrics.

---
