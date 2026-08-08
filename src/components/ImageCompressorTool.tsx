import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, Download, Sliders, FileImage, Sparkles, Trash2 } from 'lucide-react';
import { ToolsNav } from './ToolsNav';

interface ImageCompressorToolProps {
  onGoToBrief: () => void;
}

type OutputFormat = 'image/jpeg' | 'image/png' | 'image/webp';

const formatLabels: Record<OutputFormat, string> = {
  'image/jpeg': 'JPG',
  'image/png': 'PNG',
  'image/webp': 'WebP',
};

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} Mo`;
};

export const ImageCompressorTool: React.FC<ImageCompressorToolProps> = ({ onGoToBrief }) => {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string | null>(null);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const [quality, setQuality] = useState(80);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('image/jpeg');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processImage = useCallback((file: File, q: number, fmt: OutputFormat) => {
    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d')!;
        if (fmt === 'image/png') {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        } else {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          setCompressedUrl(url);
          setCompressedSize(blob.size);
          setIsProcessing(false);
        }, fmt, q / 100);
      };
      img.src = src;
      setOriginalPreview(src);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setOriginalFile(file);
    setCompressedUrl(null);
    processImage(file, quality, outputFormat);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleQualityChange = (q: number) => {
    setQuality(q);
    if (originalFile) processImage(originalFile, q, outputFormat);
  };

  const handleFormatChange = (fmt: OutputFormat) => {
    setOutputFormat(fmt);
    if (originalFile) processImage(originalFile, quality, fmt);
  };

  const handleDownload = () => {
    if (!compressedUrl) return;
    const ext = outputFormat.split('/')[1];
    const a = document.createElement('a');
    a.href = compressedUrl;
    a.download = `hadara-compresse.${ext}`;
    a.click();
  };

  const reduction = originalFile ? Math.round((1 - compressedSize / originalFile.size) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-24 px-3 sm:px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4 pt-6 sm:pt-16">
        <ToolsNav />
        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
          <Sparkles className="w-4 h-4" />
          <span>Outils Gratuits Hadara Studio</span>
        </div>
        <h1 className="text-2xl sm:text-5xl font-serif font-extrabold text-slate-100">
          Compresseur <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">d'Images</span>
        </h1>
        <p className="text-slate-400 text-sm max-w-2xl mx-auto">
          Réduisez le poids de vos images pour le web sans perte visible de qualité. Convertissez en JPG, PNG ou WebP.
        </p>
      </motion.div>

      {!originalFile ? (
        <div
          onDragOver={e => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-700 hover:border-amber-500/50 rounded-2xl p-12 text-center cursor-pointer transition-colors flex flex-col items-center justify-center min-h-[280px] bg-slate-900/50"
        >
          <FileImage className="w-12 h-12 text-slate-500 mb-4" />
          <h3 className="text-lg font-bold text-slate-200 mb-2">Glissez une image ici</h3>
          <p className="text-sm text-slate-400">ou cliquez pour choisir — JPG, PNG, WebP</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Controls */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-5">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Sliders className="w-4 h-4" />
              <span>Paramètres</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">Qualité ({quality}%)</label>
                <input type="range" min={5} max={100} value={quality}
                  onChange={e => handleQualityChange(+e.target.value)}
                  className="w-full accent-amber-400" />
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Léger</span><span>Équilibré</span><span>Qualité max</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">Format de sortie</label>
                <div className="flex gap-2">
                  {(Object.keys(formatLabels) as OutputFormat[]).map(fmt => (
                    <button key={fmt} onClick={() => handleFormatChange(fmt)}
                      className={`flex-1 py-2 rounded-xl font-bold text-xs transition-all ${outputFormat === fmt ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
                      {formatLabels[fmt]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Before / After comparison */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Original */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase">Original</span>
                <span className="text-xs font-mono text-slate-400">{formatSize(originalFile.size)}</span>
              </div>
              <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center min-h-[200px]">
                {originalPreview && <img src={originalPreview} alt="Original" className="max-w-full max-h-[280px] object-contain" />}
              </div>
            </div>

            {/* Compressed */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 uppercase">Compressé</span>
                <div className="flex items-center gap-2">
                  {compressedSize > 0 && (
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${reduction > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                      {reduction > 0 ? `-${reduction}%` : `+${Math.abs(reduction)}%`}
                    </span>
                  )}
                  <span className="text-xs font-mono text-slate-400">{formatSize(compressedSize)}</span>
                </div>
              </div>
              <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center min-h-[200px]">
                {isProcessing ? (
                  <div className="text-slate-400 text-sm animate-pulse">Compression...</div>
                ) : compressedUrl ? (
                  <img src={compressedUrl} alt="Compressé" className="max-w-full max-h-[280px] object-contain" />
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={handleDownload} disabled={!compressedUrl}
              className="flex-1 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-40 transition-all active:scale-95">
              <Download className="w-4 h-4" />
              Télécharger ({formatLabels[outputFormat]})
            </button>
            <button onClick={() => { setOriginalFile(null); setOriginalPreview(null); setCompressedUrl(null); }}
              className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <input ref={fileInputRef} type="file" className="hidden" accept="image/*"
        onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />

      {/* CTA */}
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        className="max-w-3xl mx-auto text-center p-6 sm:p-12 rounded-[2rem] bg-gradient-to-br from-[#335A79] to-[#184260] border border-blue-400/20 shadow-2xl">
        <h3 className="text-xl sm:text-2xl font-serif font-bold text-white mb-3">Votre site a besoin d'images professionnelles ?</h3>
        <p className="text-blue-100/80 mb-6 text-sm">Visuels HD, photos retouchées, identité visuelle — confiez tout à Hadara Studio.</p>
        <button onClick={onGoToBrief} className="w-full sm:w-auto px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-2xl flex items-center justify-center gap-3 mx-auto transition-all active:scale-95">
          <Sparkles className="w-5 h-5" />
          <span>Démarrer un Brief</span>
        </button>
      </motion.div>
    </div>
  );
};
