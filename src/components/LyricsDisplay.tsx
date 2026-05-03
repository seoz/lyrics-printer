import React, { useState, useEffect } from 'react';
import { Printer, Columns, AlignLeft, Info, Edit3, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { LyricsResult } from '../services/geminiService';

interface LyricsDisplayProps {
  data: LyricsResult;
}

export const LyricsDisplay: React.FC<LyricsDisplayProps> = ({ data }) => {
  const [isTwoColumns, setIsTwoColumns] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editableLyrics, setEditableLyrics] = useState(data.lyrics);

  // Reset editable lyrics when new data arrives
  useEffect(() => {
    setEditableLyrics(data.lyrics);
  }, [data.lyrics]);

  // Simple paging: split lyrics into pages based on stanzas
  // A rough estimate: ~3000 chars per page in 2 columns
  const pages: string[] = [];
  const stanzas = editableLyrics.split(/\n\n+/);
  let currentPage = "";
  
  stanzas.forEach((stanza) => {
    if ((currentPage.length + stanza.length) > 3200 && currentPage.length > 0) {
      pages.push(currentPage);
      currentPage = stanza;
    } else {
      currentPage = currentPage ? `${currentPage}\n\n${stanza}` : stanza;
    }
  });
  if (currentPage) pages.push(currentPage);

  const handlePrint = () => {
    try {
      const printData = {
        ...data,
        lyrics: editableLyrics
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

  const openInNewTab = () => {
    const printData = {
      ...data,
      lyrics: editableLyrics
    };
    const url = new URL(window.location.href);
    url.hash = `#popout=${encodeURIComponent(JSON.stringify(printData))}`;
    window.open(url.toString(), '_blank');
  };

  return (
    <div className="w-full max-w-[9.5in] mx-auto mt-8">
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
            onClick={openInNewTab}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
            title="Open in a new tab for unrestricted printing"
          >
            <AlignLeft size={18} className="rotate-90" />
            <span className="hidden sm:inline">Open in New Window</span>
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

      <div className="no-print px-6 mb-4">
        <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl text-xs text-amber-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Info size={16} className="text-amber-500 shrink-0" />
            <p><strong>Printing Tip:</strong> If the print dialog doesn't appear, use the <strong>Open in New Window</strong> button to bypass preview restrictions.</p>
          </div>
          <button onClick={openInNewTab} className="bg-amber-200 hover:bg-amber-300 px-3 py-1 rounded-lg font-bold transition-colors">Launch Full Standalone version</button>
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
            <div className="sheet print-sheet">
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

              <main className="flex-1 overflow-visible">
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
                      whitespace-pre-wrap font-sans text-[13px] leading-relaxed text-gray-800 h-full
                      ${isTwoColumns ? 'sheet-columns' : 'single-column'}
                    `}
                  >
                    {pageText}
                  </div>
                )}
              </main>

              <footer className="mt-8 pt-4 border-t border-gray-100 text-[10px] text-gray-400 font-mono uppercase tracking-[0.2em] flex justify-between items-center">
                <span>LyricSheet Pro • US Letter 8.5" x 11"</span>
                <span className="opacity-50">Page {index + 1} of {pages.length}</span>
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
