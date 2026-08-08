import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, Download, Smartphone, Laptop, Monitor, Sparkles, Trash2 } from 'lucide-react';
import { ToolsNav } from './ToolsNav';

interface MockupToolProps {
  onGoToBrief: () => void;
}

type DeviceType = 'iphone' | 'macbook' | 'browser';

export const MockupTool: React.FC<MockupToolProps> = ({ onGoToBrief }) => {
  const [image, setImage] = useState<string | null>(null);
  const [device, setDevice] = useState<DeviceType>('iphone');
  const [bgGradient, setBgGradient] = useState('from-slate-900 to-slate-950');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => setImage(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const gradients = [
    { key: 'from-amber-950 via-slate-900 to-slate-950', name: 'Hadara Or' },
    { key: 'from-blue-950 via-slate-900 to-slate-950', name: 'Bleu Nuit' },
    { key: 'from-emerald-950 via-slate-900 to-slate-950', name: 'Émeraude' },
    { key: 'from-purple-950 via-slate-900 to-slate-950', name: 'Violet Dark' },
    { key: 'from-slate-900 to-slate-950', name: 'Neutre' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-24 px-3 sm:px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4 pt-6 sm:pt-16">
        <ToolsNav />
        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
          <Sparkles className="w-4 h-4" />
          <span>Outils Gratuits Hadara Studio</span>
        </div>
        <h1 className="text-2xl sm:text-5xl font-serif font-extrabold text-slate-100">
          Générateur de <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Mockups Device</span>
        </h1>
        <p className="text-slate-400 text-sm max-w-2xl mx-auto">
          Sublimez vos captures d'écran en les encadrant dans un iPhone, MacBook ou fenêtre de navigateur élégante.
        </p>
      </motion.div>

      {!image ? (
        <div
          onDragOver={e => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-700 hover:border-amber-500/50 rounded-2xl p-12 text-center cursor-pointer transition-colors flex flex-col items-center justify-center min-h-[280px] bg-slate-900/50"
        >
          <Upload className="w-12 h-12 text-slate-500 mb-4" />
          <h3 className="text-lg font-bold text-slate-200 mb-2">Glissez une capture d'écran ici</h3>
          <p className="text-sm text-slate-400">ou cliquez pour choisir — JPG, PNG, WebP</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Device Selection & Controls */}
          <div className="flex flex-wrap gap-4 justify-between items-center bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            <div className="flex gap-2">
              <button
                onClick={() => setDevice('iphone')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${device === 'iphone' ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}
              >
                <Smartphone className="w-4 h-4" />
                iPhone 15 Pro
              </button>

              <button
                onClick={() => setDevice('macbook')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${device === 'macbook' ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}
              >
                <Laptop className="w-4 h-4" />
                MacBook Air
              </button>

              <button
                onClick={() => setDevice('browser')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${device === 'browser' ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}
              >
                <Monitor className="w-4 h-4" />
                Navigateur Web
              </button>
            </div>

            <div className="flex items-center gap-2">
              {gradients.map(g => (
                <button
                  key={g.key}
                  onClick={() => setBgGradient(g.key)}
                  className={`w-7 h-7 rounded-full bg-gradient-to-br ${g.key} border-2 transition-all ${bgGradient === g.key ? 'border-amber-400 scale-110' : 'border-slate-700'}`}
                  title={g.name}
                />
              ))}
            </div>
          </div>

          {/* Canvas Render Area */}
          <div className={`p-8 sm:p-16 rounded-3xl bg-gradient-to-br ${bgGradient} border border-slate-800 flex items-center justify-center min-h-[400px] shadow-2xl relative overflow-hidden`}>
            {device === 'iphone' && (
              <div className="w-[260px] sm:w-[300px] rounded-[40px] p-3 bg-slate-800 border-4 border-slate-700 shadow-2xl relative">
                {/* Notch */}
                <div className="w-24 h-4 bg-slate-950 rounded-full mx-auto mb-2 relative z-10" />
                <div className="rounded-[28px] overflow-hidden bg-slate-950 aspect-[9/19.5]">
                  <img src={image} alt="Mockup iPhone" className="w-full h-full object-cover" />
                </div>
              </div>
            )}

            {device === 'macbook' && (
              <div className="w-full max-w-xl space-y-1">
                <div className="rounded-t-2xl p-2.5 bg-slate-800 border-4 border-b-0 border-slate-700 shadow-2xl relative">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-950 mx-auto mb-1" />
                  <div className="rounded-lg overflow-hidden bg-slate-950 aspect-[16/10]">
                    <img src={image} alt="Mockup MacBook" className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="h-3 bg-slate-700 rounded-b-xl max-w-xs mx-auto" />
              </div>
            )}

            {device === 'browser' && (
              <div className="w-full max-w-2xl rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 shadow-2xl">
                <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <div className="ml-4 px-4 py-1 rounded-md bg-slate-950 text-slate-500 font-mono text-xs w-64 truncate">https://hadara-studio.com</div>
                </div>
                <div className="max-h-[350px] overflow-y-auto">
                  <img src={image} alt="Mockup Browser" className="w-full h-auto" />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setImage(null)}
              className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />

      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-3xl mx-auto text-center p-6 sm:p-12 rounded-[2rem] bg-gradient-to-br from-[#335A79] to-[#184260] border border-blue-400/20 shadow-2xl">
        <h3 className="text-xl sm:text-2xl font-serif font-bold text-white mb-3">Besoin d'une présentation de projet sur-mesure ?</h3>
        <p className="text-blue-100/80 mb-6 text-sm">Nous créons des visuels de présentation professionnels pour vos clients et réseaux sociaux.</p>
        <button onClick={onGoToBrief} className="w-full sm:w-auto px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-2xl flex items-center justify-center gap-3 mx-auto transition-all active:scale-95">
          <Sparkles className="w-5 h-5" />
          <span>Créer mon Brief</span>
        </button>
      </motion.div>
    </div>
  );
};
