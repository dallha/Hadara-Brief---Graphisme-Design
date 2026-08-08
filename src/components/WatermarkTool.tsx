import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Download, Sliders, Type, Image as ImageIcon, Sparkles, Trash2, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { ToolsNav } from './ToolsNav';

interface WatermarkToolProps {
  onGoToBrief: () => void;
}

type Position = 'top-left' | 'top-center' | 'top-right' | 'center' | 'bottom-left' | 'bottom-center' | 'bottom-right';

export const WatermarkTool: React.FC<WatermarkToolProps> = ({ onGoToBrief }) => {
  const [image, setImage] = useState<string | null>(null);
  const [watermarkText, setWatermarkText] = useState('© Hadara Studio');
  const [fontSize, setFontSize] = useState(36);
  const [opacity, setOpacity] = useState(50);
  const [color, setColor] = useState('#ffffff');
  const [position, setPosition] = useState<Position>('bottom-right');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const applyWatermark = useCallback((imgSrc: string) => {
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);

      const hex = color;
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      ctx.fillStyle = `rgba(${r},${g},${b},${opacity / 100})`;
      ctx.font = `bold ${fontSize}px Arial`;
      ctx.textBaseline = 'bottom';

      const padding = 20;
      const textW = ctx.measureText(watermarkText).width;
      const textH = fontSize;

      let x = 0;
      let y = 0;

      switch (position) {
        case 'top-left':     x = padding;                      y = textH + padding; break;
        case 'top-center':   x = (img.width - textW) / 2;     y = textH + padding; break;
        case 'top-right':    x = img.width - textW - padding;  y = textH + padding; break;
        case 'center':       x = (img.width - textW) / 2;     y = (img.height + textH) / 2; break;
        case 'bottom-left':  x = padding;                      y = img.height - padding; break;
        case 'bottom-center':x = (img.width - textW) / 2;     y = img.height - padding; break;
        case 'bottom-right': x = img.width - textW - padding;  y = img.height - padding; break;
      }

      ctx.fillText(watermarkText, x, y);
      setPreviewUrl(canvas.toDataURL('image/png'));
    };
    img.src = imgSrc;
  }, [watermarkText, fontSize, opacity, color, position]);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      setImage(src);
      applyWatermark(src);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleUpdate = () => {
    if (image) applyWatermark(image);
  };

  const handleDownload = () => {
    if (!previewUrl) return;
    const a = document.createElement('a');
    a.href = previewUrl;
    a.download = 'hadara-filigrane.png';
    a.click();
  };

  const positions: { key: Position; label: string }[] = [
    { key: 'top-left', label: '↖' }, { key: 'top-center', label: '↑' }, { key: 'top-right', label: '↗' },
    { key: 'center', label: '●' },
    { key: 'bottom-left', label: '↙' }, { key: 'bottom-center', label: '↓' }, { key: 'bottom-right', label: '↘' },
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
          Ajout de <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Filigrane</span>
        </h1>
        <p className="text-slate-400 text-sm max-w-2xl mx-auto">
          Protégez vos maquettes et livrables avec un filigrane personnalisé. Ajoutez votre nom, site web ou copyright.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Upload + Preview */}
        <div className="space-y-4">
          {!image ? (
            <div
              onDragOver={e => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-amber-500/50 rounded-2xl p-10 text-center cursor-pointer transition-colors flex flex-col items-center justify-center min-h-[280px] bg-slate-900/50"
            >
              <Upload className="w-10 h-10 text-slate-500 mb-3" />
              <h3 className="text-base font-bold text-slate-200 mb-1">Glissez ou cliquez pour charger</h3>
              <p className="text-xs text-slate-400">JPG, PNG, WebP</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
                {previewUrl && <img src={previewUrl} alt="Aperçu" className="w-full h-auto object-contain max-h-[400px]" />}
              </div>
              <div className="flex gap-2">
                <button onClick={handleDownload} className="flex-1 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95">
                  <Download className="w-4 h-4" />
                  Télécharger
                </button>
                <button onClick={() => { setImage(null); setPreviewUrl(null); }} className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
          <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
        </div>

        {/* Right: Controls */}
        <div className="space-y-5 p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <Sliders className="w-4 h-4" />
            <span>Paramètres du filigrane</span>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">Texte</label>
            <input
              type="text"
              value={watermarkText}
              onChange={e => setWatermarkText(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-400"
              placeholder="Votre texte..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase">Taille ({fontSize}px)</label>
              <input type="range" min={12} max={120} value={fontSize} onChange={e => setFontSize(+e.target.value)}
                className="w-full accent-amber-400" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase">Opacité ({opacity}%)</label>
              <input type="range" min={5} max={100} value={opacity} onChange={e => setOpacity(+e.target.value)}
                className="w-full accent-amber-400" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">Couleur</label>
            <div className="flex items-center gap-3">
              <input type="color" value={color} onChange={e => setColor(e.target.value)}
                className="w-12 h-10 rounded-lg border border-slate-700 cursor-pointer bg-slate-800" />
              <span className="text-sm font-mono text-slate-300">{color.toUpperCase()}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">Position</label>
            <div className="grid grid-cols-3 gap-1.5">
              {positions.map(p => (
                <button key={p.key} onClick={() => setPosition(p.key)}
                  className={`py-2.5 rounded-xl text-lg font-bold transition-all ${position === p.key ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleUpdate}
            disabled={!image}
            className="w-full py-3 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            Appliquer le filigrane
          </button>
        </div>
      </div>

      {/* CTA */}
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        className="max-w-3xl mx-auto text-center p-6 sm:p-12 rounded-[2rem] bg-gradient-to-br from-[#335A79] to-[#184260] border border-blue-400/20 shadow-2xl">
        <h3 className="text-xl sm:text-2xl font-serif font-bold text-white mb-3">Besoin d'un identité visuelle complète ?</h3>
        <p className="text-blue-100/80 mb-6 text-sm">Confiez la création de votre logo, charte graphique et supports à Hadara Studio.</p>
        <button onClick={onGoToBrief} className="w-full sm:w-auto px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-2xl flex items-center justify-center gap-3 mx-auto transition-all active:scale-95">
          <Sparkles className="w-5 h-5" />
          <span>Créer mon Brief</span>
        </button>
      </motion.div>
    </div>
  );
};
