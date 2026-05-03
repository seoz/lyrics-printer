# LyricSheet 🎵

LyricSheet is a professional, AI-powered tool designed to convert your song lyrics or screenshots into beautiful, printable 2-column US Letter sheets. Whether you're a performing musician, a choir director, or just a music enthusiast, LyricSheet provides the perfect layout for your collection.

## ✨ Features

- **2-Column Layout:** Specifically optimized for US Letter (8.5" x 11") printing, maximizing space while keeping text legible.
- **AI Processing:** Powered by Google Gemini, the app can clean up messy text or extract lyrics directly from screenshots using OCR.
- **Smart Formatting:** Maintains stanza breaks and song structure verbatim.
- **Professional Metadata:** Include album title, release year, and artist information for a complete look.
- **Instant Print:** Optimized with CSS print media queries for a clean "what you see is what you get" experience.
- **Interactive UI:** Smooth animations and feedback using Framer Motion.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A Gemini API Key

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd lyricsheet
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Create a `.env` file in the root directory and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_actual_api_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000`.

## 🛠️ Built With

- **React 19** - UI Framework
- **Vite** - Build Tool
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Lucide React** - Icons
- **Google Gemini API** - AI OCR and Text Processing

## 📄 License

SPDX-License-Identifier: Apache-2.0

Built with ❤️ by Daniel Seo
