/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { FileText, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LyricsInputForm } from './components/LyricsInputForm';
import { LyricsDisplay } from './components/LyricsDisplay';
import { processLyrics, LyricsResult } from './services/geminiService';

export default function App() {
  const [lyricsData, setLyricsData] = useState<LyricsResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const hash = window.location.hash;
    let timeoutId: number;
    
    if (hash.startsWith('#print=') || hash.startsWith('#popout=')) {
      const isPrint = hash.startsWith('#print=');
      const dataString = hash.replace(/^#(print|popout)=/, '');
      
      try {
        const parsed = JSON.parse(decodeURIComponent(dataString));
        setLyricsData(parsed);
        if (isPrint) {
          timeoutId = window.setTimeout(() => {
            window.print();
          }, 800);
        }
      } catch (e) {
        console.error("Failed to parse lyrics data from URL", e);
      }
    }
    
    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, []);

  const handleProcess = async (
    title: string, 
    artist: string, 
    text?: string, 
    image?: { mimeType: string, data: string },
    album?: string,
    year?: string
  ) => {
    setIsLoading(true);
    setError(null);
    
    const result = await processLyrics(title, artist, text, image, album, year);
    
    if (result) {
      setLyricsData(result);
    } else {
      setError("AI Processing failed. This can happen due to safety filters, network issues, or internal errors. Please try again with different text or a clearer image, or check the browser console for details.");
    }
    setIsLoading(false);
  };

  const reset = () => {
    setLyricsData(null);
    setError(null);
    
    // Clean up URL parameters without refreshing
    const url = new URL(window.location.href);
    url.hash = '';
    window.history.replaceState({}, '', url.toString());
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 print:p-0 print:bg-white">
      {/* App Header */}
      <header className="max-w-4xl mx-auto text-center mb-12 no-print">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center justify-center w-16 h-16 bg-black text-white rounded-2xl mb-6 shadow-xl border-4 border-white shadow-black/10"
        >
          <FileText size={32} />
        </motion.div>
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-5xl font-black tracking-tight text-gray-900 mb-4"
        >
          Lyric<span className="text-gray-400">Sheet</span>
        </motion.h1>
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-gray-500 font-medium mb-8"
        >
          Professional layouts for your lyric collection.
        </motion.p>


      </header>

      <main className="max-w-6xl mx-auto print:max-w-none print:m-0 print:p-0">
        <AnimatePresence mode="wait">
          {!lyricsData ? (
            <motion.div
              key="input-form"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <LyricsInputForm onProcess={handleProcess} isLoading={isLoading} />
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="relative"
            >

              <LyricsDisplay data={lyricsData} />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {error && (
            <motion.div 
              key="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-2xl mx-auto mt-8 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-700"
            >
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="font-medium">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      
      <footer className="mt-24 text-center text-gray-400 text-sm no-print pb-8">
        <p>© {new Date().getFullYear()} LyricSheet • AI-Optimized Print Layouts</p>
        <p className="mt-2 font-medium">Built by Daniel Seo</p>
      </footer>
    </div>
  );
}
