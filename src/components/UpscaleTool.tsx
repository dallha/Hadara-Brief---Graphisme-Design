import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Upload,
  Download,
  Maximize2,
  Sliders,
  FileImage,
  Trash2,
  Check,
  Zap,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { ToolsNav } from './ToolsNav';

interface UpscaleToolProps {
  onGoToBrief: () => void;
}

type ScaleFactor = 2 | 4;
type EnhancePreset = 'sharp' | 'balanced' | 'smooth';

export const UpscaleTool: React.FC<UpscaleToolProps> = ({ onGoToBrief }) => {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState<{ w: number; h: number } | null>(null);
  const [upscaledDimensions, setUpscaledDimensions] = useState<{ w: number; h: number } | null>(null);
  const [scaleFactor, setScaleFactor] = useState<ScaleFactor>(2);
  const [preset, setPreset] = useState<EnhancePreset>('sharp');
  const [sharpnessAmount, setSharpnessAmount] = useState<number>(40);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [upscaledUrl, setUpscaledUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Unsharp Mask Filter (3x3 Kernel Convolution on Canvas ImageData)
  const applyUnsharpMask = (ctx: CanvasRenderingContext2D, width: number, height: number, amount: number) => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const copy = new Uint8ClampedArray(data);

    // Amount normalized (0.1 to 0.8)
    const a = (amount / 100) * 0.6;
    // 3x3 Sharpening Kernel matrix:
    //  0  -a   0
    // -a 1+4a -a
    //  0  -a   0

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;

        for (let c = 0; c < 3; c++) { // R, G, B channels
          const center = copy[idx + c];
          const top = copy[((y - 1) * width + x) * 4 + c];
          const bottom = copy[((y + 1) * width + x) * 4 + c];
          const left = copy[(y * width + (x - 1)) * 4 + c];
          const right = copy[(y * width + (x + 1)) * 4 + c];

          const val = center + a * (4 * center - top - bottom - left - right);
          data[idx + c] = Math.min(255, Math.max(0, val));
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);
  };

  // Multi-pass Bicubic/Lanczos Upscaling algorithm
  const processUpscale = useCallback((imageSrc: string, scale: ScaleFactor, sharp: number, mode: EnhancePreset) => {
    setIsProcessing(true);
    const img = new Image();
    img.onload = () => {
      setOriginalDimensions({ w: img.width, h: img.height });

      const targetW = img.width * scale;
      const targetH = img.height * scale;
      setUpscaledDimensions({ w: targetW, h: targetH });

      // Canvas Multi-pass scaling for high quality interpolation
      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        setIsProcessing(false);
        return;
      }

      // Enable high quality image smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Pass 1: Intermediate scale if 4x
      if (scale === 4) {
        const midCanvas = document.createElement('canvas');
        midCanvas.width = img.width * 2;
        midCanvas.height = img.height * 2;
        const midCtx = midCanvas.getContext('2d')!;
        midCtx.imageSmoothingEnabled = true;
        midCtx.imageSmoothingQuality = 'high';
        midCtx.drawImage(img, 0, 0, midCanvas.width, midCanvas.height);
        ctx.drawImage(midCanvas, 0, 0, targetW, targetH);
      } else {
        ctx.drawImage(img, 0, 0, targetW, targetH);
      }

      // Pass 2: Apply Sharpening Convolution Filter based on preset
      if (mode === 'sharp' || mode === 'balanced') {
        const effectiveSharp = mode === 'sharp' ? sharp : sharp * 0.6;
        applyUnsharpMask(ctx, targetW, targetH, effectiveSharp);
      }

      const resultUrl = canvas.toDataURL('image/png', 1.0);
      setUpscaledUrl(resultUrl);
      setIsProcessing(false);
    };
    img.src = imageSrc;
  }, []);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      setSourceImage(src);
      processUpscale(src, scaleFactor, sharpnessAmount, preset);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleScaleChange = (scale: ScaleFactor) => {
    setScaleFactor(scale);
    if (sourceImage) processUpscale(sourceImage, scale, sharpnessAmount, preset);
  };

  const handlePresetChange = (p: EnhancePreset) => {
    setPreset(p);
    if (sourceImage) processUpscale(sourceImage, scaleFactor, sharpnessAmount, p);
  };

  const handleSharpnessChange = (val: number) => {
    setSharpnessAmount(val);
    if (sourceImage) processUpscale(sourceImage, scaleFactor, val, preset);
  };

  const handleDownload = () => {
    if (!upscaledUrl) return;
    const a = document.createElement('a');
    a.href = upscaledUrl;
    a.download = `hadara-upscale-${scaleFactor}x-hd.png`;
    a.click();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-24 px-3 sm:px-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4 pt-6 sm:pt-16">
        <ToolsNav />
        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Outils Gratuits Hadara Studio</span>
        </div>
        <h1 className="text-2xl sm:text-5xl font-serif font-extrabold text-slate-100">
          Améliorateur & <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Agrandisseur HD (2x/4x)</span>
        </h1>
        <p className="text-slate-400 text-sm max-w-2xl mx-auto">
          Inspiré d'Upscayl — Augmentez la résolution de vos images et logos en HD sans perte de netteté directement dans votre navigateur.
        </p>
      </motion.div>

      {!sourceImage ? (
        <div
          onDragOver={e => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-700 hover:border-amber-500/50 rounded-2xl p-12 text-center cursor-pointer transition-colors flex flex-col items-center justify-center min-h-[300px] bg-slate-900/50"
        >
          <Upload className="w-12 h-12 text-slate-500 mb-4" />
          <h3 className="text-lg font-bold text-slate-200 mb-2">Glissez une image basse résolution ici</h3>
          <p className="text-sm text-slate-400">ou cliquez pour choisir — JPG, PNG, WebP (Logos, Photos, Maquettes)</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Factor 2x / 4x */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase block">Facteur d'agrandissement</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleScaleChange(2)}
                    className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                      scaleFactor === 2 ? 'bg-amber-400 text-slate-950 shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>2x HD</span>
                  </button>
                  <button
                    onClick={() => handleScaleChange(4)}
                    className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                      scaleFactor === 4 ? 'bg-amber-400 text-slate-950 shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>4x Ultra HD</span>
                  </button>
                </div>
              </div>

              {/* Preset mode */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase block">Mode de rendu</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePresetChange('sharp')}
                    className={`px-3 py-2 rounded-xl font-bold text-xs transition-all ${
                      preset === 'sharp' ? 'bg-amber-400/20 border border-amber-400 text-amber-400' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Netteté Max (Logos)
                  </button>
                  <button
                    onClick={() => handlePresetChange('balanced')}
                    className={`px-3 py-2 rounded-xl font-bold text-xs transition-all ${
                      preset === 'balanced' ? 'bg-amber-400/20 border border-amber-400 text-amber-400' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Équilibré (Photos)
                  </button>
                  <button
                    onClick={() => handlePresetChange('smooth')}
                    className={`px-3 py-2 rounded-xl font-bold text-xs transition-all ${
                      preset === 'smooth' ? 'bg-amber-400/20 border border-amber-400 text-amber-400' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Doux
                  </button>
                </div>
              </div>

              {/* Sharpness Slider */}
              {preset !== 'smooth' && (
                <div className="space-y-1 w-full sm:w-48">
                  <label className="text-xs font-bold text-slate-400 uppercase flex justify-between">
                    <span>Netteté</span>
                    <span>{sharpnessAmount}%</span>
                  </label>
                  <input
                    type="range"
                    min={10}
                    max={90}
                    value={sharpnessAmount}
                    onChange={e => handleSharpnessChange(+e.target.value)}
                    className="w-full accent-amber-400"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Side-by-Side Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Original */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase">Original</span>
                {originalDimensions && (
                  <span className="text-xs font-mono text-slate-400">
                    {originalDimensions.w} × {originalDimensions.h} px
                  </span>
                )}
              </div>
              <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 p-3 flex items-center justify-center min-h-[300px]">
                <img src={sourceImage} alt="Original" className="max-w-full max-h-[350px] object-contain rounded-xl" />
              </div>
            </div>

            {/* Upscaled */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 uppercase flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Résultat Agrandie ({scaleFactor}x HD)
                </span>
                {upscaledDimensions && (
                  <span className="text-xs font-mono text-amber-400 font-bold">
                    {upscaledDimensions.w} × {upscaledDimensions.h} px
                  </span>
                )}
              </div>
              <div className="rounded-2xl overflow-hidden border border-amber-500/30 bg-slate-950 p-3 flex items-center justify-center min-h-[300px] relative">
                {isProcessing ? (
                  <div className="flex flex-col items-center justify-center space-y-3 text-amber-400">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <span className="text-xs font-bold">Traitement de netteté HD en cours...</span>
                  </div>
                ) : upscaledUrl ? (
                  <img src={upscaledUrl} alt="Upscaled HD" className="max-w-full max-h-[350px] object-contain rounded-xl drop-shadow-2xl" />
                ) : null}
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleDownload}
              disabled={!upscaledUrl || isProcessing}
              className="flex-1 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 disabled:opacity-40 transition-all active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Télécharger l'image HD ({upscaledDimensions?.w}×{upscaledDimensions?.h} px)</span>
            </button>
            <button
              onClick={() => { setSourceImage(null); setUpscaledUrl(null); }}
              className="p-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 transition-colors"
              title="Recommencer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />

      {/* CTA */}
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-3xl mx-auto text-center p-6 sm:p-12 rounded-[2rem] bg-gradient-to-br from-[#335A79] to-[#184260] border border-blue-400/20 shadow-2xl">
        <h3 className="text-xl sm:text-2xl font-serif font-bold text-white mb-3">Votre logo a besoin d'une vectorisation professionnelle ?</h3>
        <p className="text-blue-100/80 mb-6 text-sm">Confiez la refonte, vectorisation et déclinaison HD de votre logo au Studio Hadara.</p>
        <button onClick={onGoToBrief} className="w-full sm:w-auto px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-2xl flex items-center justify-center gap-3 mx-auto transition-all active:scale-95 text-sm">
          <Sparkles className="w-5 h-5" />
          <span>Créer mon Brief Intelligent</span>
        </button>
      </motion.div>
    </div>
  );
};
