import React, { useState, useRef } from 'react';
import { FileText, Image as ImageIcon, Upload, X, CheckCircle2, FileImage } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LyricsInputFormProps {
  onProcess: (title: string, artist: string, text?: string, image?: { mimeType: string, data: string }, album?: string, year?: string) => void;
  isLoading: boolean;
}

export const LyricsInputForm: React.FC<LyricsInputFormProps> = ({ onProcess, isLoading }) => {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [year, setYear] = useState('');
  const [lyricsText, setLyricsText] = useState('');
  const [inputType, setInputType] = useState<'text' | 'image'>('text');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let imageData: { mimeType: string, data: string } | undefined;
    
    if (inputType === 'image' && imageFile) {
      const base64Data = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(imageFile);
      });
      imageData = { mimeType: imageFile.type, data: base64Data };
    }

    onProcess(title, artist, inputType === 'text' ? lyricsText : undefined, imageData, album || undefined, year || undefined);
  };

  const isFormValid = (title.trim() && (lyricsText.trim() || imageFile));

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-3xl mx-auto bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden no-print"
    >
      <div className="bg-gray-50 border-b border-gray-100 px-8 py-4 flex items-center justify-between">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
          <Upload size={16} /> Input Source
        </h2>
        <div className="flex bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
          <button
            onClick={() => setInputType('text')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${inputType === 'text' ? 'bg-black text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            TEXT
          </button>
          <button
            onClick={() => setInputType('image')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${inputType === 'image' ? 'bg-black text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            SCREENSHOT
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-900 uppercase tracking-tighter">Song Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Stairway to Heaven"
              className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-black focus:bg-white transition-all outline-none font-medium placeholder:text-gray-300"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-900 uppercase tracking-tighter">Artist</label>
            <input
              type="text"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="e.g. Led Zeppelin"
              className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-black focus:bg-white transition-all outline-none font-medium placeholder:text-gray-300"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-900 uppercase tracking-tighter">Album Title (Optional)</label>
            <input
              type="text"
              value={album}
              onChange={(e) => setAlbum(e.target.value)}
              placeholder="e.g. Led Zeppelin IV"
              className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-black focus:bg-white transition-all outline-none font-medium placeholder:text-gray-300"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-900 uppercase tracking-tighter">Release Year (Optional)</label>
            <input
              type="text"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="e.g. 1971"
              className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-black focus:bg-white transition-all outline-none font-medium placeholder:text-gray-300"
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {inputType === 'text' ? (
            <motion.div
              key="text-input"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-2"
            >
              <label className="text-xs font-black text-gray-900 uppercase tracking-tighter">Paste Lyrics</label>
              <textarea
                value={lyricsText}
                onChange={(e) => setLyricsText(e.target.value)}
                placeholder="Paste the lyrics here... We'll clean them up for you."
                className="w-full min-h-[220px] px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-black focus:bg-white transition-all outline-none font-sans leading-relaxed placeholder:text-gray-300 resize-none"
              />
            </motion.div>
          ) : (
            <motion.div
              key="image-input"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-2"
            >
              <label className="text-xs font-black text-gray-900 uppercase tracking-tighter">Upload Screenshot</label>
              {!imagePreview ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-200 rounded-2xl py-12 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-black hover:bg-gray-50 transition-all group"
                >
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 group-hover:text-black group-hover:bg-white transition-all">
                    <FileImage size={24} />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-gray-900">Drop screenshot here</p>
                    <p className="text-sm text-gray-400">or click to browse</p>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="relative group">
                  <div className="w-full h-[220px] rounded-2xl overflow-hidden border-2 border-black">
                    <img src={imagePreview} alt="Lyrics screenshot" className="w-full h-full object-cover" />
                  </div>
                  <button 
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all"
                  >
                    <X size={16} />
                  </button>
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <CheckCircle2 className="text-white" size={48} />
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="submit"
          disabled={isLoading || !isFormValid}
          className="w-full py-5 bg-black text-white rounded-2xl font-black uppercase tracking-wider text-sm flex items-center justify-center gap-2 hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-[0.98] shadow-xl shadow-black/10"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <FileText size={18} />
              <span>Format for Print</span>
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
};
