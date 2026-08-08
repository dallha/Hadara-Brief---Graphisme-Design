import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Cloud,
  Download,
  Sparkles,
  RefreshCw,
  Sliders,
  Type,
  Palette,
  Shapes,
  FileText,
  Copy,
  Check,
  Eye,
  Trash2,
  Plus,
  Sun,
  Moon
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
  rotated?: boolean;
}

type BgMode = 'dark' | 'white-color' | 'white-black' | 'transparent';

// French & English Common Stop Words
const DEFAULT_STOPWORDS = new Set([
  'le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'd', 'l', 'à', 'au', 'aux', 'en', 'par', 'pour', 'avec', 'sans', 'sur', 'sous', 'dans',
  'et', 'ou', 'mais', 'donc', 'or', 'ni', 'car', 'que', 'qui', 'quoi', 'dont', 'où', 'si', 'comme', 'quand', 'plus', 'moins', 'bien',
  'ce', 'cet', 'cette', 'ces', 'mon', 'ton', 'son', 'ma', 'ta', 'sa', 'mes', 'tes', 'ses', 'notre', 'votre', 'leur', 'nos', 'vos', 'leurs',
  'je', 'tu', 'il', 'elle', 'nous', 'vous', 'ils', 'elles', 'on', 'me', 'te', 'se', 'moi', 'toi', 'lui', 'y', 'en',
  'être', 'avoir', 'faire', 'dire', 'pouvoir', 'aller', 'voir', 'vouloir', 'venir', 'devoir', 'prendre', 'trouver', 'donner',
  'est', 'sont', 'a', 'ont', 'fait', 'font', 'ete', 'été', 'pas', 'ne', 'plus', 'aussi', 'tout', 'tous', 'toute', 'toutes',
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'up', 'about', 'into', 'over', 'after',
  'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'can', 'could',
  'it', 'its', 'this', 'that', 'these', 'those', 'my', 'your', 'his', 'her', 'our', 'their'
]);

const PRESET_TEXTS = [
  {
    title: '✨ Hadara Design & Studio',
    text: 'Design Graphique Identité Visuelle Logo Typographie Branding Hadara Studio Créativité Slogan Dakar Sénégal Excellence Tradition Modernité Affiche Bâche Graphiste Art Numérique Concept Projets Web UI UX Client'
  },
  {
    title: '🤖 IA & Technologie',
    text: 'Intelligence Artificielle Machine Learning Algorithme Data Reseau Neurones Deep Learning Innovation Futur Code Python React TypeScript Cloud Automation Prompt Agent Vision Digital Transformation API'
  },
  {
    title: '🎯 Marketing & Business',
    text: 'Marketing Digital Strategie Business Commerce Vente Audience Social Media Performance Conversion Engagement Lead Content SEO ROI Growth Impact Marque Storytelling Campagne Reseaux'
  }
];

const COLOR_PALETTES = [
  { name: 'Hadara Or', colorsDark: ['#fbbf24', '#f59e0b', '#d97706', '#b45309', '#fef3c7'], colorsLight: ['#b45309', '#d97706', '#816c07', '#92400e', '#78350f'] },
  { name: 'Nuit Profonde', colorsDark: ['#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8', '#93c5fd'], colorsLight: ['#1d4ed8', '#1e40af', '#2563eb', '#1e3a8a', '#3b82f6'] },
  { name: 'Émeraude', colorsDark: ['#34d399', '#10b981', '#059669', '#047857', '#a7f3d0'], colorsLight: ['#047857', '#065f46', '#059669', '#064e3b', '#10b981'] },
  { name: 'Vibrant Multi', colorsDark: ['#fbbf24', '#38bdf8', '#f43f5e', '#a855f7', '#34d399'], colorsLight: ['#d97706', '#0284c7', '#e11d48', '#7e22ce', '#059669'] },
  { name: 'Noir & Blanc', colorsDark: ['#ffffff', '#e2e8f0', '#cbd5e1', '#94a3b8', '#64748b'], colorsLight: ['#0f172a', '#1e293b', '#334155', '#475569', '#000000'] },
];

export const WordCloudTool: React.FC<WordCloudToolProps> = ({ onGoToBrief }) => {
  const [textInput, setTextInput] = useState<string>(PRESET_TEXTS[0].text);
  const [maxWords, setMaxWords] = useState<number>(60);
  const [minFontSize, setMinFontSize] = useState<number>(14);
  const [maxFontSize, setMaxFontSize] = useState<number>(54);
  const [selectedPalette, setSelectedPalette] = useState<number>(0);
  const [bgMode, setBgMode] = useState<BgMode>('dark');
  const [allowVertical, setAllowVertical] = useState<boolean>(true);
  const [fontFamily, setFontFamily] = useState<string>('Plus Jakarta Sans, sans-serif');
  const [excludedWords, setExcludedWords] = useState<Set<string>>(new Set());
  const [extractedWords, setExtractedWords] = useState<WordFreq[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Parse text and compute frequencies
  const parseText = useCallback(() => {
    if (!textInput.trim()) {
      setExtractedWords([]);
      return;
    }

    const cleanText = textInput
      .toLowerCase()
      .replace(/[^\w\sàâäéèêëîïôöùûüçñ'-]/g, ' ')
      .replace(/\s+/g, ' ');

    const words = cleanText.split(' ').filter(w => {
      const cleanW = w.trim();
      return (
        cleanW.length >= 2 &&
        !DEFAULT_STOPWORDS.has(cleanW) &&
        !excludedWords.has(cleanW) &&
        !/^\d+$/.test(cleanW)
      );
    });

    const counts: Record<string, number> = {};
    words.forEach(w => {
      counts[w] = (counts[w] || 0) + 1;
    });

    let paletteColors: string[] = [];
    if (bgMode === 'white-black') {
      paletteColors = ['#0f172a', '#1e293b', '#334155', '#475569', '#000000'];
    } else if (bgMode === 'white-color') {
      paletteColors = COLOR_PALETTES[selectedPalette].colorsLight;
    } else {
      paletteColors = COLOR_PALETTES[selectedPalette].colorsDark;
    }

    const sorted = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxWords);

    if (sorted.length === 0) {
      setExtractedWords([]);
      return;
    }

    const maxCount = sorted[0][1];
    const minCount = sorted[sorted.length - 1][1];

    const wordList: WordFreq[] = sorted.map(([w, count], i) => {
      const ratio = maxCount === minCount ? 1 : (count - minCount) / (maxCount - minCount);
      const size = Math.round(minFontSize + ratio * (maxFontSize - minFontSize));
      const color = paletteColors[i % paletteColors.length];
      const rotated = allowVertical && i % 4 === 1;

      return { text: w, count, size, color, rotated };
    });

    setExtractedWords(wordList);
  }, [textInput, maxWords, minFontSize, maxFontSize, selectedPalette, bgMode, allowVertical, excludedWords]);

  useEffect(() => {
    parseText();
  }, [parseText]);

  // Render Cloud on Canvas using Archimedean Spiral algorithm
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear & Fill Background
    ctx.clearRect(0, 0, width, height);

    if (bgMode === 'white-color' || bgMode === 'white-black') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
    } else if (bgMode === 'dark') {
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, width, height);
    }

    if (extractedWords.length === 0) {
      ctx.fillStyle = bgMode === 'dark' ? '#64748b' : '#94a3b8';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Saisissez du texte pour générer le nuage de mots.', width / 2, height / 2);
      return;
    }

    const centerX = width / 2;
    const centerY = height / 2;
    const placedBoxes: { x: number; y: number; w: number; h: number }[] = [];

    const checkCollision = (box: { x: number; y: number; w: number; h: number }) => {
      for (const p of placedBoxes) {
        if (
          box.x < p.x + p.w &&
          box.x + box.w > p.x &&
          box.y < p.y + p.h &&
          box.y + box.h > p.y
        ) {
          return true;
        }
      }
      return false;
    };

    extractedWords.forEach((word) => {
      ctx.font = `bold ${word.size}px ${fontFamily}`;
      const metrics = ctx.measureText(word.text);
      const w = metrics.width + 8;
      const h = word.size * 1.1;

      let placed = false;
      let angle = 0;
      let radius = 0;

      for (let i = 0; i < 350; i++) {
        angle += 0.35;
        radius += 1.8;
        const x = centerX + radius * Math.cos(angle) - w / 2;
        const y = centerY + radius * Math.sin(angle) - h / 2;

        if (x < 10 || x + w > width - 10 || y < 10 || y + h > height - 10) {
          continue;
        }

        const box = { x, y, w, h };
        if (!checkCollision(box)) {
          placedBoxes.push(box);
          ctx.fillStyle = word.color;
          ctx.textAlign = 'left';
          ctx.textBaseline = 'top';

          if (bgMode === 'dark') {
            ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
            ctx.shadowBlur = 3;
          } else {
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
          }

          ctx.fillText(word.text, x, y);
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
          placed = true;
          break;
        }
      }

      if (!placed) {
        const x = Math.max(10, Math.min(width - w - 10, centerX + (Math.random() - 0.5) * (width * 0.5)));
        const y = Math.max(10, Math.min(height - h - 10, centerY + (Math.random() - 0.5) * (height * 0.5)));
        ctx.fillStyle = word.color;
        ctx.fillText(word.text, x, y);
      }
    });
  }, [extractedWords, fontFamily, bgMode]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  const handleDownloadPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `hadara-nuage-mots-${bgMode}.png`;
    a.click();
  };

  const toggleExcludeWord = (word: string) => {
    setExcludedWords(prev => {
      const next = new Set(prev);
      if (next.has(word)) next.delete(word);
      else next.add(word);
      return next;
    });
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
          Générateur de <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Nuage de Mots</span>
        </h1>
        <p className="text-slate-400 text-sm max-w-2xl mx-auto">
          Transformez vos textes et briefs en nuages de mots-clés artistiques personnalisables sur fond sombre, blanc ou transparent.
        </p>
      </motion.div>

      {/* Main Grid: Settings + Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Settings Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-5 p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>Texte & Paramètres</span>
            </h3>
            <button
              onClick={parseText}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold flex items-center gap-1 transition-colors"
              title="Régénérer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Actualiser</span>
            </button>
          </div>

          {/* Presets */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase">Exemples rapides</label>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_TEXTS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => setTextInput(p.text)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                >
                  {p.title}
                </button>
              ))}
            </div>
          </div>

          {/* Text Area */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase">Votre texte</label>
            <textarea
              rows={4}
              value={textInput}
              onChange={e => setTextInput(e.target.value)}
              placeholder="Collez ici votre texte, article ou liste de mots..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-400 font-sans leading-relaxed resize-none"
            />
          </div>

          {/* Background & Style Mode (NOUVEAU) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase block">Style de Fond & Couleurs</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setBgMode('dark')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  bgMode === 'dark' ? 'bg-slate-950 border-amber-400 text-amber-400 shadow-md' : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Couleurs sur Fond Sombre</span>
              </button>

              <button
                onClick={() => setBgMode('white-color')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  bgMode === 'white-color' ? 'bg-white border-amber-500 text-slate-950 shadow-md' : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-amber-600" />
                <span>Couleurs sur Fond Blanc</span>
              </button>

              <button
                onClick={() => setBgMode('white-black')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  bgMode === 'white-black' ? 'bg-white border-slate-900 text-slate-950 shadow-md' : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                <span className="w-3 h-3 rounded-full bg-slate-950 border border-slate-300 inline-block" />
                <span>Noir sur Fond Blanc</span>
              </button>

              <button
                onClick={() => setBgMode('transparent')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  bgMode === 'transparent' ? 'bg-slate-950 border-emerald-400 text-emerald-400 shadow-md' : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="w-3 h-3 rounded-full border border-dashed border-emerald-400 inline-block" />
                <span>Fond Transparent</span>
              </button>
            </div>
          </div>

          {/* Controls */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase">Nombre max mots ({maxWords})</label>
              <input
                type="range"
                min={20}
                max={120}
                value={maxWords}
                onChange={e => setMaxWords(+e.target.value)}
                className="w-full accent-amber-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase">Taille max ({maxFontSize}px)</label>
              <input
                type="range"
                min={30}
                max={90}
                value={maxFontSize}
                onChange={e => setMaxFontSize(+e.target.value)}
                className="w-full accent-amber-400"
              />
            </div>
          </div>

          {/* Palette Picker (disabled in white-black mode) */}
          {bgMode !== 'white-black' && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase">Palette de couleurs</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {COLOR_PALETTES.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedPalette(idx)}
                    className={`p-2 rounded-xl border text-left transition-all space-y-1 ${
                      selectedPalette === idx ? 'bg-amber-400/10 border-amber-400' : 'bg-slate-950 border-slate-800'
                    }`}
                  >
                    <span className="text-[10px] font-bold text-slate-300 block">{p.name}</span>
                    <div className="flex gap-1">
                      {(bgMode === 'white-color' ? p.colorsLight : p.colorsDark).map((c, cIdx) => (
                        <div key={cIdx} className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Typography */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase">Style de police</label>
            <select
              value={fontFamily}
              onChange={e => setFontFamily(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
            >
              <option value="Plus Jakarta Sans, sans-serif">Modern Sans (Plus Jakarta)</option>
              <option value="Playfair Display, serif">Élégant Serif (Playfair)</option>
              <option value="monospace">Code Monospace</option>
              <option value="Impact, sans-serif">Bold Impact</option>
            </select>
          </div>
        </div>

        {/* Right Canvas Preview Area (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-4 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center">
            {/* Canvas */}
            <div className={`relative rounded-2xl overflow-hidden shadow-inner w-full flex items-center justify-center border ${
              bgMode === 'white-color' || bgMode === 'white-black' ? 'bg-white border-slate-300' : 'bg-slate-950 border-slate-800'
            }`}>
              <canvas
                ref={canvasRef}
                width={650}
                height={450}
                className="w-full h-auto max-h-[450px] object-contain"
              />
            </div>

            {/* Canvas Action Bar */}
            <div className="w-full pt-4 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-slate-400 font-mono">
                {extractedWords.length} mots placés • Mode: {bgMode}
              </span>
              <button
                onClick={handleDownloadPNG}
                disabled={extractedWords.length === 0}
                className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-400/20 active:scale-95 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Télécharger PNG HD</span>
              </button>
            </div>
          </div>

          {/* Top Words Frequency List */}
          {extractedWords.length > 0 && (
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Mots extraits — Cliquer pour masquer un mot :
              </h4>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto scrollbar-hide">
                {extractedWords.map(w => (
                  <button
                    key={w.text}
                    onClick={() => toggleExcludeWord(w.text)}
                    className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-rose-500/50 text-slate-300 hover:text-rose-300 text-xs font-mono flex items-center gap-1.5 transition-colors"
                    title="Cliquer pour exclure"
                  >
                    <span>{w.text}</span>
                    <span className="text-[10px] text-amber-400 font-bold">({w.count})</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CTA */}
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-3xl mx-auto text-center p-6 sm:p-12 rounded-[2rem] bg-gradient-to-br from-[#335A79] to-[#184260] border border-blue-400/20 shadow-2xl">
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
