import React, { useState, useEffect } from 'react';
import { Printer, Columns, AlignLeft, Info, Edit3, Check, Type, RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';
import { LyricsResult } from '../services/geminiService';

interface LyricsDisplayProps {
  data: LyricsResult;
  onReset: () => void;
}

export const LyricsDisplay: React.FC<LyricsDisplayProps> = ({ data, onReset }) => {
  const [isTwoColumns, setIsTwoColumns] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [fontSize, setFontSize] = useState(data.fontSize || 13);
  const [editableLyrics, setEditableLyrics] = useState(data.lyrics);

  // Reset editable lyrics and font size when new data arrives
  useEffect(() => {
    setEditableLyrics(data.lyrics);
    if (data.fontSize) setFontSize(data.fontSize);
  }, [data.lyrics, data.fontSize]);

  // Parse lyrics into structured stanzas/sections
  const parseLyrics = (text: string) => {
    const lines = text.trim().split('\n');
    const result: { type: 'header' | 'stanza'; content: string; key: string }[] = [];
    let currentStanzaLines: string[] = [];
    
    lines.forEach((line, i) => {
      const trimmedLine = line.trim();
      const isHeader = /^\[.*\]$/.test(trimmedLine) || /^(Chorus|Verse|Bridge|Outro|Intro|Pre-Chorus)/i.test(trimmedLine);
      
      if (isHeader) {
        // Push current stanza if any
        if (currentStanzaLines.length > 0) {
          result.push({ 
            type: 'stanza', 
            content: currentStanzaLines.join('\n'),
            key: `stanza-${i}`
          });
          currentStanzaLines = [];
        }
        result.push({ 
          type: 'header', 
          content: trimmedLine,
          key: `header-${i}`
        });
      } else if (trimmedLine === '') {
        if (currentStanzaLines.length > 0) {
          result.push({ 
            type: 'stanza', 
            content: currentStanzaLines.join('\n'),
            key: `stanza-${i}`
          });
          currentStanzaLines = [];
        }
      } else {
        currentStanzaLines.push(line);
      }
    });
    
    if (currentStanzaLines.length > 0) {
      result.push({ 
        type: 'stanza', 
        content: currentStanzaLines.join('\n'),
        key: `stanza-final`
      });
    }
    
    return result;
  };

  const processedStanzas = parseLyrics(editableLyrics);

  // Paging logic based on processed stanzas and font size
  const pages: (typeof processedStanzas)[] = [];
  let currentPageItems: typeof processedStanzas = [];
  let currentLength = 0;
  
  // Base character limit for 13px font
  // 1750 is safe for 2 columns, ~950 is safe for 1 column to avoid overflow
  const baseLimit = isTwoColumns ? 1750 : 950;
  // Adjust limit based on font size (inverse relationship)
  // We use a power of 1.2 to better approximate spatial usage
  const adjustedLimit = Math.floor(baseLimit * Math.pow(13 / fontSize, 1.2));

  processedStanzas.forEach((item) => {
    // Aggressive paging to ensure bottom padding is respected
    if ((currentLength + item.content.length) > adjustedLimit && currentPageItems.length > 0) {
      pages.push(currentPageItems);
      currentPageItems = [item];
      currentLength = item.content.length;
    } else {
      currentPageItems.push(item);
      currentLength += item.content.length;
    }
  });
  if (currentPageItems.length > 0) pages.push(currentPageItems);

  const handlePrint = () => {
    try {
      const printData = {
        ...data,
        lyrics: editableLyrics,
        fontSize // Pass font size for print-specific rendering if needed elsewhere
      };

      if (window.self !== window.top) {
        // We are in an iframe, the browser will likely block window.print()
        // Open in a new tab with the print instruction
        const url = new URL(window.location.href);
        url.hash = `#print=${encodeURIComponent(JSON.stringify(printData))}`;
        window.open(url.toString(), '_blank');
      } else {
        window.focus();
        setTimeout(() => {
          window.print();
        }, 100);
      }
    } catch (e) {
      console.error("Print failed", e);
    }
  };


  return (
    <div className="w-full max-w-[9.5in] mx-auto mt-8 print:max-w-none print:w-auto print:m-0">
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 px-6 no-print">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsTwoColumns(!isTwoColumns)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
            title={isTwoColumns ? "Switch to single column" : "Switch to two columns"}
          >
            {isTwoColumns ? <AlignLeft size={18} /> : <Columns size={18} />}
            <span className="hidden sm:inline">{isTwoColumns ? "Single Column" : "Two Columns"}</span>
          </button>

          <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium shadow-sm">
            <Type size={18} className="text-gray-400" />
            <input 
              type="range" 
              min="10" 
              max="24" 
              step="1"
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              className="w-20 sm:w-32 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
            />
            <span className="min-w-[2ch]">{fontSize}</span>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-all shadow-sm ${
              isEditing ? 'bg-black text-white border-black' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {isEditing ? <Check size={18} /> : <Edit3 size={18} />}
            <span>{isEditing ? "Finish Editing" : "Edit Lyrics"}</span>
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <RotateCcw size={18} />
            <span className="hidden sm:inline">Reset</span>
          </button>
          
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-2 bg-black text-white rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors shadow-lg active:scale-95"
          >
            <Printer size={18} />
            <span>Print Lyrics</span>
          </button>
        </div>
      </div>

      {/* Printable Area */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="no-scrollbar overflow-x-auto pb-12 print:overflow-visible print:pb-0 space-y-8 print:space-y-0"
      >
        {pages.map((pageText, index) => (
          <React.Fragment key={index}>
            <div className={`sheet print-sheet ${!isTwoColumns ? 'sheet-single' : ''}`}>
              {index === 0 && (
                <header className="mb-6 border-b-2 border-black pb-4 flex justify-between items-end">
                  <div className="flex-1">
                    <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-black uppercase">{data.title}</h1>
                    <p className="text-lg md:text-xl font-serif italic text-gray-700 mt-1">{data.artist}</p>
                  </div>
                  {(data.album || data.year) && (
                    <div className="text-right hidden sm:block text-gray-400 font-mono text-[10px] uppercase tracking-wider leading-tight ml-4">
                      {data.album && <div>{data.album}</div>}
                      {data.year && <div>{data.year}</div>}
                    </div>
                  )}
                </header>
              )}
              
              {index > 0 && (
                <header className="mb-6 border-b border-gray-100 pb-2 flex justify-between items-center no-print">
                  <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">{data.title} (Page {index + 1})</span>
                </header>
              )}

              <main className="flex-1 min-h-0 overflow-visible relative block">
                {isEditing ? (
                  <textarea
                    value={editableLyrics}
                    onChange={(e) => setEditableLyrics(e.target.value)}
                    className="w-full min-h-[600px] p-6 text-sm font-sans leading-relaxed text-gray-800 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl focus:border-black outline-none resize-none transition-all no-print"
                    placeholder="Edit the lyrics here..."
                  />
                ) : (
                  <div 
                    className={`
                      font-sans leading-relaxed text-gray-800 h-full
                      ${isTwoColumns ? 'sheet-columns' : 'single-column'}
                    `}
                    style={{ fontSize: `${fontSize}px` }}
                  >
                    {pageText.map((item, i) => (
                      <div 
                        key={item.key} 
                        className={`
                          stanza-item ${item.type === 'header' ? 'mt-6 mb-2 first:mt-0 font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-1' : 'mb-5'}
                        `}
                        style={item.type === 'header' ? { fontSize: `${Math.max(fontSize - 3, 9)}px` } : {}}
                      >
                        {item.type === 'header' ? (
                          item.content
                        ) : (
                          <div className="whitespace-pre-wrap">{item.content}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </main>

              <footer className="absolute bottom-8 left-0 right-0 text-center pointer-events-none">
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-[0.2em]">
                  — {index + 1} —
                </span>
              </footer>
            </div>
            {index < pages.length - 1 && (
              <div className="preview-page-break no-print" />
            )}
          </React.Fragment>
        ))}
      </motion.div>

      {/* Print Instructions - Desktop Only */}
      <div className="mt-8 px-6 no-print flex flex-col sm:flex-row items-start sm:items-center gap-3 text-sm text-gray-500 bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-gray-200 shadow-sm">
        <Info size={16} className="text-gray-400 shrink-0" />
        <p>If the AI missed a line, use <strong className="text-gray-800">Edit Lyrics</strong> above to fix it word-for-word before printing.</p>
      </div>
    </div>
  );
};
