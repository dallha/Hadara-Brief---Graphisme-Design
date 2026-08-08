import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, Copy, Check, Palette, Sparkles, ArrowRight } from 'lucide-react';
import { ToolsNav } from './ToolsNav';

interface ColorExtractorToolProps {
  onGoToBrief: () => void;
}

export const ColorExtractorTool: React.FC<ColorExtractorToolProps> = ({ onGoToBrief }) => {
  const [image, setImage] = useState<string | null>(null);
  const [colors, setColors] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const extractColors = (imgEl: HTMLImageElement): string[] => {
    const canvas = document.createElement('canvas');
    const size = 150;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return [];

    ctx.drawImage(imgEl, 0, 0, size, size);
    const data = ctx.getImageData(0, 0, size, size).data;
    const colorMap: Record<string, number> = {};

    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] < 128) continue; // Skip transparent
      const r = Math.round(data[i] / 32) * 32;
      const g = Math.round(data[i + 1] / 32) * 32;
      const b = Math.round(data[i + 2] / 32) * 32;
      const key = `${r},${g},${b}`;
      colorMap[key] = (colorMap[key] || 0) + 1;
    }

    return Object.entries(colorMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([key]) => {
        const [r, g, b] = key.split(',').map(Number);
        const hexR = Math.min(255, Math.max(0, r)).toString(16).padStart(2, '0');
        const hexG = Math.min(255, Math.max(0, g)).toString(16).padStart(2, '0');
        const hexB = Math.min(255, Math.max(0, b)).toString(16).padStart(2, '0');
        return `#${hexR}${hexG}${hexB}`.toUpperCase();
      });
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      setImage(src);
      const img = new Image();
      img.onload = () => {
        const extracted = extractColors(img);
        setColors(extracted);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleCopy = (hex: string, index: number) => {
    navigator.clipboard.writeText(hex);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-24 px-3 sm:px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4 pt-6 sm:pt-16">
        <ToolsNav />
        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
          <Sparkles className="w-4 h-4" />
          <span>Outils Gratuits Hadara Studio</span>
        </div>
        <h1 className="text-2xl sm:text-5xl font-serif font-extrabold text-slate-100">
          Extracteur de <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Couleurs Palette</span>
        </h1>
        <p className="text-slate-400 text-sm max-w-2xl mx-auto">
          Importez un logo, une image ou une maquette pour en extraire instantanément la palette de couleurs dominantes.
        </p>
      </motion.div>

      {!image ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-700 hover:border-amber-500/50 rounded-2xl p-12 text-center cursor-pointer transition-colors flex flex-col items-center justify-center min-h-[280px] bg-slate-900/50"
        >
          <Upload className="w-12 h-12 text-slate-500 mb-4" />
          <h3 className="text-lg font-bold text-slate-200 mb-2">Glissez une image ou cliquez pour choisir</h3>
          <p className="text-sm text-slate-400">JPG, PNG, WebP, SVG</p>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center p-4">
              <img src={image} alt="Aperçu" className="max-w-full max-h-[300px] object-contain rounded-xl" />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                <Palette className="w-5 h-5 text-amber-400" />
                Palette extraite ({colors.length} couleurs)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {colors.map((hex, index) => (
                  <button
                    key={index}
                    onClick={() => handleCopy(hex, index)}
                    className="group p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-400/50 transition-all text-left space-y-2 relative overflow-hidden"
                  >
                    <div className="w-full h-12 rounded-xl shadow-inner border border-white/10" style={{ backgroundColor: hex }} />
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-slate-200">{hex}</span>
                      {copiedIndex === index ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition-colors" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
              <button
                onClick={() => { setImage(null); setColors([]); }}
                className="text-xs text-slate-400 hover:text-slate-200 underline pt-2"
              >
                Changer d'image
              </button>
            </div>
          </div>
        </div>
      )}

      <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />

      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-3xl mx-auto text-center p-6 sm:p-12 rounded-[2rem] bg-gradient-to-br from-[#335A79] to-[#184260] border border-blue-400/20 shadow-2xl">
        <h3 className="text-xl sm:text-2xl font-serif font-bold text-white mb-3">Besoin d'une charte graphique professionnelle ?</h3>
        <p className="text-blue-100/80 mb-6 text-sm">Harmonie des couleurs, typographies, règles de marque — confiez votre charte au Studio Hadara.</p>
        <button onClick={onGoToBrief} className="w-full sm:w-auto px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-2xl flex items-center justify-center gap-3 mx-auto transition-all active:scale-95">
          <Sparkles className="w-5 h-5" />
          <span>Créer mon Brief</span>
        </button>
      </motion.div>
    </div>
  );
};
