import React, { useState, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { motion } from 'framer-motion';
import { QrCode, Download, Link as LinkIcon, Settings2, Sparkles, ArrowRight, PaintBucket } from 'lucide-react';
import { ToolsNav } from './ToolsNav';

interface QRCodeToolProps {
  onGoToBrief: () => void;
}

export const QRCodeTool: React.FC<QRCodeToolProps> = ({ onGoToBrief }) => {
  const [url, setUrl] = useState('https://hadarastudio.com');
  const [fgColor, setFgColor] = useState('#0f172a'); // slate-900
  const [bgColor, setBgColor] = useState('#ffffff');
  const [includeLogo, setIncludeLogo] = useState(true);
  const qrRef = useRef<HTMLDivElement>(null);

  const colors = [
    { name: 'Classique', fg: '#0f172a', bg: '#ffffff' },
    { name: 'Hadara Or', fg: '#fbbf24', bg: '#020617' }, // amber-400 / slate-950
    { name: 'Bleu Nuit', fg: '#3b82f6', bg: '#020617' }, // blue-500
    { name: 'Émeraude', fg: '#10b981', bg: '#ffffff' }, // emerald-500
  ];

  const handleDownload = () => {
    if (!qrRef.current) return;
    const canvas = qrRef.current.querySelector('canvas');
    if (!canvas) return;

    const imageUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = 'hadara-qrcode.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-16 px-4">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4 pt-8 sm:pt-16"
      >
        <ToolsNav />
        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
          <Sparkles className="w-4 h-4" />
          <span>Outils Gratuits Hadara Studio</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-serif font-extrabold text-slate-100">
          Générateur de <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">QR Code</span>
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Créez des QR Codes professionnels, vectoriels et personnalisables pour vos supports de communication.
        </p>
      </motion.div>

      {/* Main Workspace */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-[2rem] p-4 sm:p-8 shadow-2xl"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Controls (Left) */}
          <div className="space-y-8">
            {/* URL Input */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-300 flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-amber-400" />
                Lien web ou texte
              </label>
              <input 
                type="text" 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400/50 transition-shadow"
                placeholder="https://votre-site.com"
              />
            </div>

            {/* Color Presets */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-300 flex items-center gap-2">
                <PaintBucket className="w-4 h-4 text-amber-400" />
                Thème de couleurs
              </label>
              <div className="grid grid-cols-2 gap-3">
                {colors.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => { setFgColor(c.fg); setBgColor(c.bg); }}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${fgColor === c.fg && bgColor === c.bg ? 'border-amber-400 bg-amber-400/10' : 'border-slate-800 bg-slate-950/50 hover:bg-slate-800'}`}
                  >
                    <div 
                      className="w-6 h-6 rounded-md border border-slate-700 shadow-sm"
                      style={{ backgroundColor: c.bg, position: 'relative' }}
                    >
                      <div 
                        className="absolute inset-[4px] rounded-sm" 
                        style={{ backgroundColor: c.fg }}
                      />
                    </div>
                    <span className="text-sm font-medium text-slate-300">{c.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Options */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-300 flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-amber-400" />
                Options avancées
              </label>
              <label className="flex items-center gap-3 p-4 rounded-xl border border-slate-800 bg-slate-950/50 cursor-pointer hover:bg-slate-800 transition-colors">
                <input 
                  type="checkbox" 
                  checked={includeLogo}
                  onChange={(e) => setIncludeLogo(e.target.checked)}
                  className="w-5 h-5 rounded border-slate-700 text-amber-500 focus:ring-amber-500 bg-slate-900"
                />
                <span className="text-sm text-slate-300 font-medium">Inclure le logo Hadara au centre</span>
              </label>
            </div>
          </div>

          {/* Preview (Right) */}
          <div className="flex flex-col items-center justify-center space-y-8 bg-slate-950/50 rounded-2xl p-8 border border-slate-800/50">
            
            <div 
              ref={qrRef}
              className="p-4 bg-white rounded-2xl shadow-2xl transition-transform hover:scale-105"
              style={{ backgroundColor: bgColor }}
            >
              <QRCodeCanvas 
                value={url || 'https://hadarastudio.com'}
                size={256}
                fgColor={fgColor}
                bgColor={bgColor}
                level="H"
                includeMargin={false}
                imageSettings={includeLogo ? {
                  src: "/assets/logo-picto-Da8Z5ZPY.png", // Safe assumption since it was in dist/assets recently
                  height: 64,
                  width: 64,
                  excavate: true,
                } : undefined}
                style={{ borderRadius: '8px' }}
              />
            </div>

            <button 
              onClick={handleDownload}
              className="px-8 py-4 bg-amber-400 text-slate-950 font-bold rounded-2xl flex items-center gap-3 hover:bg-amber-300 transition-all shadow-xl shadow-amber-400/20 active:scale-95 w-full justify-center max-w-xs"
            >
              <Download className="w-5 h-5" />
              <span>Télécharger (PNG)</span>
            </button>
          </div>

        </div>
      </motion.div>

      {/* Cross-sell */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-3xl mx-auto text-center p-8 sm:p-12 rounded-[2rem] bg-gradient-to-br from-[#335A79] to-[#184260] border border-blue-400/20 shadow-2xl mt-12"
      >
        <h3 className="text-2xl font-serif font-bold text-white mb-4">
          Besoin d'une carte de visite avec ce QR Code ?
        </h3>
        <p className="text-blue-100/80 mb-8 text-sm leading-relaxed">
          Le QR Code c'est bien, mais sur un beau support design c'est encore mieux. Laissez le Studio Hadara créer vos cartes de visite, flyers ou affiches professionnelles.
        </p>
        <button
          onClick={onGoToBrief}
          className="px-8 py-4 bg-amber-400 text-slate-950 font-bold rounded-xl flex items-center gap-2 hover:bg-amber-300 transition-all mx-auto shadow-xl"
        >
          <span>Démarrer un Projet</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </motion.div>

    </div>
  );
};
