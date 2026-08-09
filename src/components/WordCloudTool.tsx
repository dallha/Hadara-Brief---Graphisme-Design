import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Download,
  Sparkles,
  RefreshCw,
  Sliders,
  Shapes,
  Sun,
  Moon,
  Upload,
  Loader2
} from 'lucide-react';
import { ToolsNav } from './ToolsNav';

interface WordCloudToolProps {
  onGoToBrief: () => void;
}

interface WordFreq {
  text: string;
  count: number;
  size: number;
  color: string;
  x?: number;
  y?: number;
  angle?: number;
  w?: number;
  h?: number;
}

type BgMode = 'dark' | 'white-color' | 'white-black' | 'transparent';
type ShapeType = 'rectangle' | 'circle' | 'heart' | 'star' | 'hexagon' | 'cloud' | 'custom';
type RotationMode = 'none' | 'light' | 'dynamic' | 'random';

// French & English Common Stop Words
const DEFAULT_STOPWORDS = new Set([
  'le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'd', 'l', 'à', 'au', 'aux', 'en', 'par', 'pour', 'avec', 'sans', 'sur', 'sous', 'dans',
  'et', 'ou', 'mais', 'donc', 'or', 'ni', 'car', 'que', 'qui', 'quoi', 'dont', 'où', 'si', 'comme', 'quand', 'plus', 'moins', 'bien',
  'ce', 'cet', 'cette', 'ces', 'mon', 'ton', 'son', 'ma', 'ta', 'sa', 'mes', 'tes', 'ses', 'notre', 'votre', 'leur', 'nos', 'vos', 'leurs',
  'je', 'tu', 'il', 'elle', 'nous', 'vous', 'ils', 'elles', 'on', 'me', 'te', 'se', 'moi', 'toi', 'lui', 'y', 'en',
  'être', 'avoir', 'faire', 'dire', 'pouvoir', 'aller', 'voir', 'vouloir', 'venir', 'devoir', 'prendre', 'trouver', 'donner',
  'est', 'sont', 'a', 'ont', 'fait', 'font', 'ete', 'été', 'pas', 'ne', 'plus', 'aussi', 'tout', 'tous', 'toute', 'toutes',
  'the', 'an', 'and', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'up', 'about', 'into', 'over', 'after',
  'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'can', 'could',
  'it', 'its', 'this', 'that', 'these', 'those', 'my', 'your', 'his', 'her', 'our', 'their'
]);

const PRESET_TEXTS = [
  {
    title: '✨ Hadara Studio',
    text: 'Design Graphique Identité Visuelle Logo Typographie Branding Hadara Studio Créativité Slogan Dakar Sénégal Excellence Tradition Modernité Affiche Bâche Graphiste Art Numérique Concept Projets Web UI UX Client'
  },
  {
    title: '🤖 IA & Tech',
    text: 'Intelligence Artificielle Machine Learning Algorithme Data Reseau Neurones Deep Learning Innovation Futur Code Python React TypeScript Cloud Automation Prompt Agent Vision Digital Transformation API'
  },
  {
    title: '🎯 Marketing',
    text: 'Marketing Digital Strategie Business Commerce Vente Audience Social Media Performance Conversion Engagement Lead Content SEO ROI Growth Impact Marque Storytelling Campagne Reseaux'
  }
];

const COLOR_PALETTES = [
  { name: '✨ Hadara Gold',    colorsDark: ['#fbbf24', '#f59e0b', '#d97706', '#b45309', '#fef3c7'], colorsLight: ['#b45309', '#d97706', '#816c07', '#92400e', '#78350f'] },
  { name: '✨ Hadara Night',   colorsDark: ['#60a5fa', '#3b82f6', '#818cf8', '#a78bfa', '#c4b5fd'], colorsLight: ['#1d4ed8', '#1e40af', '#2563eb', '#3730a3', '#4f46e5'] },
  { name: '✨ Hadara Emerald', colorsDark: ['#34d399', '#10b981', '#6ee7b7', '#a7f3d0', '#059669'], colorsLight: ['#047857', '#065f46', '#059669', '#064e3b', '#10b981'] },
  { name: '✨ Hadara Heritage',colorsDark: ['#cd853f', '#d2b48c', '#a0522d', '#8B4513', '#f4a460'], colorsLight: ['#5C4033', '#8B4513', '#A0522D', '#CD853F', '#D2B48C'] },
  { name: 'Vibrant Multi',     colorsDark: ['#fbbf24', '#38bdf8', '#f43f5e', '#a855f7', '#34d399'], colorsLight: ['#d97706', '#0284c7', '#e11d48', '#7e22ce', '#059669'] },
];

const CANVAS_W = 650;
const CANVAS_H = 450;

export const WordCloudTool: React.FC<WordCloudToolProps> = ({ onGoToBrief }) => {
  const [textInput, setTextInput] = useState<string>(PRESET_TEXTS[0].text);
  const [maxWords, setMaxWords] = useState<number>(80);
  const [maxFontSize, setMaxFontSize] = useState<number>(60);
  const [minFontSize] = useState<number>(12);
  const [selectedPalette, setSelectedPalette] = useState<number>(0);
  const [bgMode, setBgMode] = useState<BgMode>('dark');
  const [fontFamily, setFontFamily] = useState<string>('Plus Jakarta Sans, sans-serif');
  const [excludedWords, setExcludedWords] = useState<Set<string>>(new Set());
  const [extractedWords, setExtractedWords] = useState<WordFreq[]>([]);
  const [placedWords, setPlacedWords] = useState<WordFreq[]>([]);
  const [shapeType, setShapeType] = useState<ShapeType>('rectangle');
  const [customImage, setCustomImage] = useState<HTMLImageElement | null>(null);
  const [rotationMode, setRotationMode] = useState<RotationMode>('none');
  const [removeStopWords, setRemoveStopWords] = useState<boolean>(true);
  const [forceLowercase, setForceLowercase] = useState<boolean>(true);
  const [isComputing, setIsComputing] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ---------- STEP 1: Parse text ----------
  const parseText = useCallback(() => {
    if (!textInput.trim()) { setExtractedWords([]); return; }

    let raw = textInput.replace(/[^\w\sàâäéèêëîïôöùûüçñ'-]/g, ' ').replace(/\s+/g, ' ');
    if (forceLowercase) raw = raw.toLowerCase();

    const words = raw.split(' ').filter(w => {
      const cw = w.trim();
      const lw = cw.toLowerCase();
      if (cw.length < 2 || /^\d+$/.test(cw) || excludedWords.has(lw)) return false;
      if (removeStopWords && DEFAULT_STOPWORDS.has(lw)) return false;
      return true;
    });

    const counts: Record<string, number> = {};
    words.forEach(w => { counts[w] = (counts[w] || 0) + 1; });

    let paletteColors: string[];
    if (bgMode === 'white-black') {
      paletteColors = ['#0f172a', '#1e293b', '#334155', '#475569', '#000000'];
    } else if (bgMode === 'white-color') {
      paletteColors = COLOR_PALETTES[selectedPalette].colorsLight;
    } else {
      paletteColors = COLOR_PALETTES[selectedPalette].colorsDark;
    }

    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, maxWords);
    if (!sorted.length) { setExtractedWords([]); return; }

    const maxCount = sorted[0][1];
    const minCount = sorted[sorted.length - 1][1];

    const wordList: WordFreq[] = sorted.map(([w, count], i) => {
      const ratio = maxCount === minCount ? 1 : (count - minCount) / (maxCount - minCount);
      const size = Math.round(minFontSize + ratio * (maxFontSize - minFontSize));
      const color = paletteColors[i % paletteColors.length];
      return { text: w, count, size, color };
    });

    setExtractedWords(wordList);
  }, [textInput, maxWords, minFontSize, maxFontSize, selectedPalette, bgMode, excludedWords, removeStopWords, forceLowercase]);

  useEffect(() => { parseText(); }, [parseText]);

  // ---------- STEP 2: Build collision mask ----------
  const generateMask = useCallback((width: number, height: number): Uint8ClampedArray | null => {
    if (shapeType === 'rectangle') return null;

    const oc = document.createElement('canvas');
    oc.width = width;
    oc.height = height;
    const ctx = oc.getContext('2d');
    if (!ctx) return null;

    ctx.fillStyle = '#ffffff';
    const cx = width / 2, cy = height / 2;
    const rx = width / 2 - 20, ry = height / 2 - 20;

    ctx.beginPath();
    if (shapeType === 'custom' && customImage) {
      const scale = Math.min((width - 40) / customImage.width, (height - 40) / customImage.height);
      const iw = customImage.width * scale;
      const ih = customImage.height * scale;
      ctx.drawImage(customImage, (width - iw) / 2, (height - ih) / 2, iw, ih);
      const data = ctx.getImageData(0, 0, width, height).data;
      return data;
    }

    if (shapeType === 'circle') {
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    } else if (shapeType === 'heart') {
      const r = Math.min(rx, ry);
      for (let t = 0; t <= Math.PI * 2; t += 0.04) {
        const x = cx + r * 0.9 * (16 * Math.pow(Math.sin(t), 3)) / 16;
        const y = cy - r * 0.9 * (13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t)) / 16;
        t === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
    } else if (shapeType === 'star') {
      const r = Math.min(rx, ry);
      for (let i = 0; i < 10; i++) {
        const a = i * Math.PI / 5 - Math.PI / 2;
        const rad = i % 2 === 0 ? r : r * 0.45;
        const px = cx + rad * Math.cos(a);
        const py = cy + rad * Math.sin(a);
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
    } else if (shapeType === 'hexagon') {
      const r = Math.min(rx, ry);
      for (let i = 0; i < 6; i++) {
        const a = i * Math.PI / 3 - Math.PI / 6;
        const px = cx + r * Math.cos(a);
        const py = cy + r * Math.sin(a);
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
    } else if (shapeType === 'cloud') {
      const r = Math.min(rx, ry);
      ctx.arc(cx - r*0.35, cy + r*0.15, r*0.42, 0, Math.PI * 2);
      ctx.arc(cx + r*0.35, cy + r*0.15, r*0.42, 0, Math.PI * 2);
      ctx.arc(cx, cy - r*0.15, r*0.55, 0, Math.PI * 2);
      ctx.arc(cx - r*0.2, cy + r*0.2, r*0.45, 0, Math.PI * 2);
      ctx.arc(cx + r*0.2, cy + r*0.2, r*0.45, 0, Math.PI * 2);
    }

    ctx.closePath();
    ctx.fill();
    return ctx.getImageData(0, 0, width, height).data;
  }, [shapeType, customImage]);

  // ---------- STEP 3: Compute layout ----------
  const computeLayout = useCallback(() => {
    if (!extractedWords.length) { setPlacedWords([]); return; }
    setIsComputing(true);

    setTimeout(() => {
      const tmpCanvas = document.createElement('canvas');
      const ctx = tmpCanvas.getContext('2d');
      if (!ctx) { setIsComputing(false); return; }

      const width = CANVAS_W;
      const height = CANVAS_H;
      const cx = width / 2, cy = height / 2;

      const mask = generateMask(width, height);

      const pixelAllowed = (px: number, py: number) => {
        if (!mask) return true;
        if (px < 0 || py < 0 || px >= width || py >= height) return false;
        const idx = (Math.floor(py) * width + Math.floor(px)) * 4 + 3;
        return mask[idx] > 128;
      };

      const boxAllowed = (bx: number, by: number, bw: number, bh: number) => {
        if (!mask) return bx >= 10 && by >= 10 && bx + bw <= width - 10 && by + bh <= height - 10;
        return pixelAllowed(bx, by) && pixelAllowed(bx+bw, by) && pixelAllowed(bx, by+bh) && pixelAllowed(bx+bw, by+bh) && pixelAllowed(bx+bw/2, by+bh/2);
      };

      const placedBoxes: { x: number; y: number; w: number; h: number }[] = [];

      const noCollision = (bx: number, by: number, bw: number, bh: number) => {
        for (const p of placedBoxes) {
          if (bx < p.x+p.w && bx+bw > p.x && by < p.y+p.h && by+bh > p.y) return false;
        }
        return true;
      };

      const newPlaced: WordFreq[] = [];

      extractedWords.forEach((word, idx) => {
        ctx.font = `bold ${word.size}px ${fontFamily}`;
        const rawW = ctx.measureText(word.text).width + 8;
        const rawH = word.size * 1.15;

        let wordAngle = 0;
        if (rotationMode === 'light') {
          wordAngle = idx % 4 === 1 ? -Math.PI / 2 : 0;
        } else if (rotationMode === 'dynamic') {
          const r = Math.random();
          wordAngle = r < 0.33 ? 0 : r < 0.66 ? -Math.PI / 4 : Math.PI / 4;
        } else if (rotationMode === 'random') {
          wordAngle = (Math.random() - 0.5) * Math.PI * 0.8;
        }

        // bounding box after rotation
        const bw = Math.abs(rawW * Math.cos(wordAngle)) + Math.abs(rawH * Math.sin(wordAngle));
        const bh = Math.abs(rawW * Math.sin(wordAngle)) + Math.abs(rawH * Math.cos(wordAngle));

        let placed = false;
        let angle = 0, radius = 0;
        let finalCX = cx, finalCY = cy;

        for (let i = 0; i < 500; i++) {
          angle += 0.4;
          radius += 1.8;
          const tx = cx + radius * Math.cos(angle) - bw / 2;
          const ty = cy + radius * Math.sin(angle) - bh / 2;

          if (boxAllowed(tx, ty, bw, bh) && noCollision(tx, ty, bw, bh)) {
            placedBoxes.push({ x: tx, y: ty, w: bw, h: bh });
            finalCX = tx + bw / 2;
            finalCY = ty + bh / 2;
            placed = true;
            break;
          }
        }

        if (!placed) {
          // fallback: random spot (may overlap, but don't lose the word)
          finalCX = cx + (Math.random() - 0.5) * width * 0.4;
          finalCY = cy + (Math.random() - 0.5) * height * 0.4;
        }

        newPlaced.push({ ...word, x: finalCX, y: finalCY, angle: wordAngle, w: rawW, h: rawH });
      });

      setPlacedWords(newPlaced);
      setIsComputing(false);
    }, 20);
  }, [extractedWords, fontFamily, generateMask, rotationMode]);

  useEffect(() => { computeLayout(); }, [computeLayout]);

  // ---------- STEP 4: Render preview ----------
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (bgMode === 'white-color' || bgMode === 'white-black') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (bgMode === 'dark') {
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    if (!placedWords.length) {
      ctx.fillStyle = bgMode === 'dark' ? '#64748b' : '#94a3b8';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Saisissez du texte pour générer le nuage de mots.', canvas.width / 2, canvas.height / 2);
      return;
    }

    placedWords.forEach((word) => {
      ctx.save();
      ctx.translate(word.x!, word.y!);
      ctx.rotate(word.angle ?? 0);
      ctx.font = `bold ${word.size}px ${fontFamily}`;
      ctx.fillStyle = word.color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (bgMode === 'dark') { ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 4; }
      ctx.fillText(word.text, 0, 0);
      ctx.restore();
    });
  }, [placedWords, fontFamily, bgMode]);

  useEffect(() => { renderCanvas(); }, [renderCanvas]);

  // ---------- Export Engine ----------
  const drawWords = (ctx: CanvasRenderingContext2D, scale: number = 1, forceBg?: string) => {
    const w = CANVAS_W;
    const h = CANVAS_H;
    if (forceBg) {
      ctx.fillStyle = forceBg;
      ctx.fillRect(0, 0, w, h);
    } else if (bgMode === 'white-color' || bgMode === 'white-black') {
      ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h);
    } else if (bgMode === 'dark') {
      ctx.fillStyle = '#020617'; ctx.fillRect(0, 0, w, h);
    }
    placedWords.forEach((word) => {
      ctx.save();
      ctx.translate(word.x! * scale, word.y! * scale);
      ctx.rotate(word.angle ?? 0);
      ctx.font = `bold ${word.size * scale}px ${fontFamily}`;
      ctx.fillStyle = word.color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (bgMode === 'dark') { ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 4 * scale; }
      ctx.fillText(word.text, 0, 0);
      ctx.restore();
    });
  };

  const exportImage = (type: 'image/png' | 'image/jpeg', scale: number = 3) => {
    if (!placedWords.length) return;
    const canvas = document.createElement('canvas');
    canvas.width = CANVAS_W * scale;
    canvas.height = CANVAS_H * scale;
    const ctx = canvas.getContext('2d')!;
    drawWords(ctx, scale, type === 'image/jpeg' ? '#ffffff' : undefined);
    canvas.toBlob(blob => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hadara-cloud-${shapeType}-${bgMode}.${type === 'image/jpeg' ? 'jpg' : 'png'}`;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(url);
    }, type, 1.0);
  };

  const handleDownloadSVG = () => {
    if (!placedWords.length) return;
    let bgRect = '';
    if (bgMode === 'white-color' || bgMode === 'white-black') bgRect = `<rect width="${CANVAS_W}" height="${CANVAS_H}" fill="#ffffff"/>`;
    else if (bgMode === 'dark') bgRect = `<rect width="${CANVAS_W}" height="${CANVAS_H}" fill="#020617"/>`;

    const shadow = bgMode === 'dark' ? `<defs><filter id="sh"><feDropShadow dx="0" dy="0" stdDeviation="3" flood-color="#000" flood-opacity="0.5"/></filter></defs>` : '';
    const fontName = fontFamily.split(',')[0].replace(/'/g, '').trim();

    const texts = placedWords.map(word => {
      const safe = word.text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      const deg = ((word.angle ?? 0) * 180) / Math.PI;
      const fi = bgMode === 'dark' ? ` filter="url(#sh)"` : '';
      return `<text x="${word.x?.toFixed(1)}" y="${word.y?.toFixed(1)}" transform="rotate(${deg.toFixed(1)},${word.x?.toFixed(1)},${word.y?.toFixed(1)})" font-family="${fontName}" font-size="${word.size}px" font-weight="bold" fill="${word.color}" text-anchor="middle" dominant-baseline="central"${fi}>${safe}</text>`;
    }).join('\n');

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CANVAS_W} ${CANVAS_H}">\n${shadow}\n${bgRect}\n${texts}\n</svg>`;
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hadara-cloud-${shapeType}.svg`;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  // ---------- Utility ----------
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const img = new Image();
      img.onload = () => { setCustomImage(img); setShapeType('custom'); };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const toggleExcludeWord = (word: string) => {
    setExcludedWords(prev => {
      const next = new Set(prev);
      if (next.has(word)) next.delete(word); else next.add(word);
      return next;
    });
  };

  const SHAPES: { key: ShapeType; label: string; icon: string }[] = [
    { key: 'rectangle', label: 'Libre', icon: '▭' },
    { key: 'circle',    label: 'Cercle', icon: '○' },
    { key: 'heart',     label: 'Cœur', icon: '♥' },
    { key: 'star',      label: 'Étoile', icon: '★' },
    { key: 'hexagon',   label: 'Hexagone', icon: '⬡' },
    { key: 'cloud',     label: 'Nuage', icon: '☁' },
  ];

  const ROTATIONS: { key: RotationMode; label: string }[] = [
    { key: 'none',    label: 'Horizontal' },
    { key: 'light',   label: 'Classique' },
    { key: 'dynamic', label: 'Dynamique' },
    { key: 'random',  label: 'Aléatoire' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-24 px-3 sm:px-4">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4 pt-6 sm:pt-16">
        <ToolsNav />
        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Hadara Visual Tools — Gratuit</span>
        </div>
        <h1 className="text-2xl sm:text-5xl font-serif font-extrabold text-slate-100">
          Atelier <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Shape Cloud</span>
        </h1>
        <p className="text-slate-400 text-sm max-w-2xl mx-auto">
          Générez des nuages de mots dans n'importe quelle forme — cercle, cœur, étoile, ou votre propre silhouette importée.
        </p>
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* ─── Left Settings Panel ─── */}
        <div className="lg:col-span-5 space-y-5 p-5 rounded-2xl bg-slate-900/80 border border-slate-800">

          {/* Étape 1 — Contenu */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-black text-amber-500 uppercase tracking-widest">Étape 1 — Contenu</h3>
              <button onClick={parseText} className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold flex items-center gap-1 transition-colors">
                <RefreshCw className="w-3 h-3" /><span>Actualiser</span>
              </button>
            </div>

            {/* Presets */}
            <div className="flex flex-wrap gap-1.5">
              {PRESET_TEXTS.map((p, idx) => (
                <button key={idx} onClick={() => setTextInput(p.text)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors">
                  {p.title}
                </button>
              ))}
            </div>

            <textarea rows={4} value={textInput} onChange={e => setTextInput(e.target.value)}
              placeholder="Collez votre texte, article, brief..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-400 font-sans leading-relaxed resize-none" />

            <div className="flex flex-col gap-2 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={removeStopWords} onChange={e => setRemoveStopWords(e.target.checked)} className="accent-amber-500 w-4 h-4" />
                <span className="text-xs text-slate-300">Supprimer les mots courants (le, de, the…)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={forceLowercase} onChange={e => setForceLowercase(e.target.checked)} className="accent-amber-500 w-4 h-4" />
                <span className="text-xs text-slate-300">Tout mettre en minuscules</span>
              </label>
            </div>
          </div>

          <div className="border-t border-slate-800" />

          {/* Étape 2 — Forme */}
          <div className="space-y-3">
            <h3 className="text-[11px] font-black text-amber-500 uppercase tracking-widest">Étape 2 — Forme (Shape Cloud)</h3>
            <div className="grid grid-cols-3 gap-2">
              {SHAPES.map(s => (
                <button key={s.key} onClick={() => setShapeType(s.key)}
                  className={`p-2 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${shapeType === s.key ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-lg shadow-amber-500/20' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200'}`}>
                  <span className="text-base">{s.icon}</span>
                  <span>{s.label}</span>
                </button>
              ))}
            </div>
            <label className={`flex items-center justify-center gap-2 w-full p-2.5 rounded-xl border border-dashed cursor-pointer transition-all ${shapeType === 'custom' ? 'border-amber-500 bg-amber-500/10 text-amber-400' : 'border-slate-600 bg-slate-950 text-slate-400 hover:border-slate-400 hover:text-slate-200'}`}>
              <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleImageUpload} />
              <Upload className="w-4 h-4" />
              <span className="text-xs font-bold uppercase">{customImage && shapeType === 'custom' ? '✓ Silhouette importée' : 'Importer ma silhouette (PNG)'}</span>
            </label>
          </div>

          <div className="border-t border-slate-800" />

          {/* Étape 3 — Composition */}
          <div className="space-y-3">
            <h3 className="text-[11px] font-black text-amber-500 uppercase tracking-widest">Étape 3 — Composition</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase">Mots max ({maxWords})</label>
                <input type="range" min={20} max={250} value={maxWords} onChange={e => setMaxWords(+e.target.value)} className="w-full accent-amber-400" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase">Taille max ({maxFontSize}px)</label>
                <input type="range" min={20} max={120} value={maxFontSize} onChange={e => setMaxFontSize(+e.target.value)} className="w-full accent-amber-400" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase">Rotation</label>
              <div className="grid grid-cols-4 gap-1">
                {ROTATIONS.map(r => (
                  <button key={r.key} onClick={() => setRotationMode(r.key)}
                    className={`p-1.5 rounded-lg border text-[10px] font-bold uppercase transition-all text-center ${rotationMode === r.key ? 'bg-amber-500 text-slate-950 border-amber-500' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'}`}>
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase">Police</label>
              <select value={fontFamily} onChange={e => setFontFamily(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400">
                <option value="Plus Jakarta Sans, sans-serif">Modern Sans (Plus Jakarta)</option>
                <option value="Playfair Display, serif">Élégant Serif (Playfair)</option>
                <option value="monospace">Code Monospace</option>
                <option value="Impact, sans-serif">Bold Impact</option>
              </select>
            </div>
          </div>

          <div className="border-t border-slate-800" />

          {/* Étape 4 — Style */}
          <div className="space-y-3">
            <h3 className="text-[11px] font-black text-amber-500 uppercase tracking-widest">Étape 4 — Style & Couleurs</h3>
            <div className="grid grid-cols-2 gap-2">
              {([['dark','🌙 Fond Sombre'],['white-color','☀️ Fond Blanc'],['white-black','⬛ Noir & Blanc'],['transparent','✦ Transparent']] as [BgMode,string][]).map(([key, label]) => (
                <button key={key} onClick={() => setBgMode(key)}
                  className={`p-2 rounded-xl border text-[10px] font-bold flex items-center gap-1.5 transition-all ${bgMode === key
                    ? key === 'dark' ? 'bg-slate-950 border-amber-400 text-amber-400'
                    : key === 'transparent' ? 'bg-slate-950 border-emerald-400 text-emerald-400'
                    : 'bg-white border-amber-500 text-slate-950'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'}`}>
                  {label}
                </button>
              ))}
            </div>

            {bgMode !== 'white-black' && (
              <div className="grid grid-cols-2 gap-2 pt-1">
                {COLOR_PALETTES.map((p, idx) => (
                  <button key={idx} onClick={() => setSelectedPalette(idx)}
                    className={`p-2 rounded-xl border text-left transition-all space-y-1 ${selectedPalette === idx ? 'bg-amber-400/10 border-amber-400' : 'bg-slate-950 border-slate-800 hover:border-slate-700'}`}>
                    <span className="text-[9px] font-bold text-slate-300 block truncate">{p.name}</span>
                    <div className="flex gap-1">
                      {(bgMode === 'white-color' ? p.colorsLight : p.colorsDark).map((c, ci) => (
                        <div key={ci} className="w-3 h-3 rounded-full border border-white/10" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ─── Right Preview Area ─── */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-4 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col items-center">

            {/* Canvas wrapper */}
            <div className={`relative rounded-2xl overflow-hidden shadow-inner w-full flex items-center justify-center border ${bgMode === 'white-color' || bgMode === 'white-black' ? 'bg-white border-slate-300' : bgMode === 'transparent' ? 'bg-[url("data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20width%3D%2716%27%20height%3D%2716%27%3E%3Crect%20width%3D%278%27%20height%3D%278%27%20fill%3D%27%23374151%27/%3E%3Crect%20x%3D%278%27%20y%3D%228%27%20width%3D%278%27%20height%3D%278%27%20fill%3D%27%23374151%27/%3E%3Crect%20y%3D%228%27%20width%3D%278%27%20height%3D%278%27%20fill%3D%27%234b5563%27/%3E%3Crect%20x%3D%278%27%20width%3D%278%27%20height%3D%278%27%20fill%3D%27%234b5563%27/%3E%3C/svg%3E")] border-slate-700' : 'bg-slate-950 border-slate-800'}`}>
              <canvas ref={canvasRef} width={CANVAS_W} height={CANVAS_H} className="w-full h-auto max-h-[450px] object-contain" />
              {isComputing && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 rounded-2xl">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                    <span className="text-xs text-amber-400 font-bold">Calcul de la composition…</span>
                  </div>
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="w-full pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="text-xs text-slate-400 font-mono">
                {placedWords.length} mots • {shapeType} • {bgMode}
              </div>
              <div className="flex flex-col items-stretch sm:items-end gap-2 w-full sm:w-auto">
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Exporter le Design</div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => exportImage('image/png', 3)} disabled={!placedWords.length || isComputing}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-amber-400/20 active:scale-95 transition-all">
                    <Download className="w-3.5 h-3.5" /><span>PNG HD</span>
                  </button>
                  <button onClick={handleDownloadSVG} disabled={!placedWords.length || isComputing}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 disabled:opacity-40 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all">
                    <Download className="w-3.5 h-3.5" /><span>SVG</span>
                  </button>
                  <button onClick={() => exportImage('image/jpeg', 3)} disabled={!placedWords.length || isComputing}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all">
                    <Download className="w-3.5 h-3.5" /><span>JPG</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Words frequency (click to exclude) */}
          {extractedWords.length > 0 && (
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5" />
                Mots extraits — cliquer pour masquer un mot
              </h4>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                {extractedWords.map(w => (
                  <button key={w.text} onClick={() => toggleExcludeWord(w.text)}
                    className={`px-2.5 py-1 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition-colors ${excludedWords.has(w.text) ? 'bg-rose-950/50 border-rose-700 text-rose-400 line-through' : 'bg-slate-950 border-slate-800 hover:border-rose-500/50 text-slate-300 hover:text-rose-300'}`}>
                    {w.text}
                    <span className="text-[10px] text-amber-400 font-bold">({w.count})</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CTA */}
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        className="max-w-3xl mx-auto text-center p-6 sm:p-12 rounded-[2rem] bg-gradient-to-br from-[#335A79] to-[#184260] border border-blue-400/20 shadow-2xl">
        <h3 className="text-xl sm:text-2xl font-serif font-bold text-white mb-3">Besoin d'un visuel de marque percutant ?</h3>
        <p className="text-blue-100/80 mb-6 text-sm">Affiches, identités visuelles, supports marketing — confiez tout au Studio Hadara.</p>
        <button onClick={onGoToBrief} className="w-full sm:w-auto px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-2xl flex items-center justify-center gap-3 mx-auto transition-all active:scale-95 text-sm">
          <Sparkles className="w-5 h-5" />
          <span>Créer mon Brief Intelligent</span>
        </button>
      </motion.div>
    </div>
  );
};
