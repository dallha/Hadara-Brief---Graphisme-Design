import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Download, Sparkles, RefreshCw, Upload, Loader2, BarChart2, ExternalLink } from 'lucide-react';
import { ToolsNav } from './ToolsNav';

interface WordCloudToolProps {
  onGoToBrief: () => void;
}

// ─── Types ────────────────────────────────────────────────────────────────────
type BgMode = 'dark' | 'white-color' | 'white-black' | 'transparent';
type ShapeType = 'rectangle' | 'circle' | 'heart' | 'star' | 'hexagon' | 'cloud' | 'custom';
type RotationMode = 'none' | 'classic' | 'dynamic' | 'random';
type ExportFormat = 'png' | 'jpg' | 'svg';
type ExportQuality = 'standard' | 'hd' | 'ultrahd';

interface PlacedWord {
  text: string;
  count: number;
  size: number;
  color: string;
  x: number;      // center X
  y: number;      // center Y
  angle: number;  // radians
  w: number;      // raw text width (before rotation)
  h: number;      // raw text height (before rotation)
  bw: number;     // bounding box width (after rotation)
  bh: number;     // bounding box height (after rotation)
}

interface LayoutStats {
  placed: number;
  total: number;
  collisions: number;
  fillRate: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const CANVAS_W = 650;
const CANVAS_H = 450;
const EXPORT_SCALES: Record<ExportQuality, number> = {
  standard: 2,    // 1300×900
  hd: 4,          // 2600×1800
  ultrahd: 6,     // 3900×2700
};

const STOPWORDS = new Set([
  'le','la','les','un','une','des','du','de','d','l','à','au','aux','en','par','pour','avec','sans','sur','sous','dans',
  'et','ou','mais','donc','or','ni','car','que','qui','quoi','dont','où','si','comme','quand','plus','moins','bien',
  'ce','cet','cette','ces','mon','ton','son','ma','ta','sa','mes','tes','ses','notre','votre','leur','nos','vos','leurs',
  'je','tu','il','elle','nous','vous','ils','elles','on','me','te','se','moi','toi','lui','y',
  'être','avoir','faire','dire','pouvoir','aller','voir','vouloir','venir','devoir','prendre','trouver','donner',
  'est','sont','a','ont','fait','font','été','pas','ne','aussi','tout','tous','toute','toutes',
  'the','an','and','but','in','on','at','to','for','of','with','by','from','up','about','into','over','after',
  'is','are','was','were','be','been','being','have','has','had','do','does','did','will','would','should','can','could',
  'it','its','this','that','these','those','my','your','his','her','our','their'
]);

const PRESET_TEXTS = [
  { title: '✨ Hadara Studio', text: 'Design Graphique Identité Visuelle Logo Typographie Branding Hadara Studio Créativité Slogan Dakar Sénégal Excellence Tradition Modernité Affiche Bâche Graphiste Art Numérique Concept Projets Web UI UX Client Couleur Forme Espace' },
  { title: '🤖 IA & Tech', text: 'Intelligence Artificielle Machine Learning Algorithme Data Réseau Neurones Deep Learning Innovation Futur Code Python React TypeScript Cloud Automation Prompt Agent Vision Digital Transformation API' },
  { title: '🎯 Marketing', text: 'Marketing Digital Stratégie Business Commerce Vente Audience Social Media Performance Conversion Engagement Lead Content SEO ROI Growth Impact Marque Storytelling Campagne Réseaux' },
];

const PALETTES = [
  { name: '✨ Hadara Gold',     dark: ['#fbbf24','#f59e0b','#d97706','#b45309','#fef3c7'], light: ['#b45309','#d97706','#816c07','#92400e','#78350f'] },
  { name: '✨ Hadara Night',    dark: ['#60a5fa','#3b82f6','#818cf8','#a78bfa','#c4b5fd'], light: ['#1d4ed8','#1e40af','#2563eb','#3730a3','#4f46e5'] },
  { name: '✨ Hadara Emerald',  dark: ['#34d399','#10b981','#6ee7b7','#a7f3d0','#059669'], light: ['#047857','#065f46','#059669','#064e3b','#10b981'] },
  { name: '✨ Hadara Heritage', dark: ['#cd853f','#d2b48c','#a0522d','#8B4513','#f4a460'], light: ['#5C4033','#8B4513','#A0522D','#CD853F','#D2B48C'] },
  { name: 'Vibrant Multi',     dark: ['#fbbf24','#38bdf8','#f43f5e','#a855f7','#34d399'], light: ['#d97706','#0284c7','#e11d48','#7e22ce','#059669'] },
];

const SHAPES: { key: ShapeType; label: string; icon: string }[] = [
  { key: 'rectangle', label: 'Libre',    icon: '▭' },
  { key: 'circle',    label: 'Cercle',   icon: '○' },
  { key: 'heart',     label: 'Cœur',     icon: '♥' },
  { key: 'star',      label: 'Étoile',   icon: '★' },
  { key: 'hexagon',   label: 'Hexagone', icon: '⬡' },
  { key: 'cloud',     label: 'Nuage',    icon: '☁' },
];

const ROTATIONS: { key: RotationMode; label: string; desc: string }[] = [
  { key: 'none',    label: 'Horizontal', desc: '100% horizontal' },
  { key: 'classic', label: 'Classique',  desc: 'Majorité horizontale + quelques verticaux' },
  { key: 'dynamic', label: 'Dynamique',  desc: '±15° / ±30° — jamais 45°' },
  { key: 'random',  label: 'Aléatoire',  desc: 'Mode expérimental' },
];

// ─── Seeded PRNG (Mulberry32) ─────────────────────────────────────────────────
function createPRNG(seed: number) {
  let s = seed;
  return () => {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ─── applyBackground (SOURCE UNIQUE — utilisée partout) ──────────────────────
function applyBackground(ctx: CanvasRenderingContext2D, w: number, h: number, bgMode: BgMode) {
  ctx.clearRect(0, 0, w, h);
  if (bgMode === 'dark') {
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, w, h);
  } else if (bgMode === 'white-color' || bgMode === 'white-black') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
  }
  // transparent: clearRect seul suffit
}

// ─── drawPlacedWords (SOURCE UNIQUE — utilisée pour aperçu ET export) ─────────
function drawPlacedWords(
  ctx: CanvasRenderingContext2D,
  words: PlacedWord[],
  fontFamily: string,
  bgMode: BgMode,
  scale: number = 1
) {
  words.forEach(word => {
    ctx.save();
    ctx.translate(word.x * scale, word.y * scale);
    ctx.rotate(word.angle);
    ctx.font = `bold ${word.size * scale}px ${fontFamily}`;
    ctx.fillStyle = word.color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (bgMode === 'dark') {
      ctx.shadowColor = 'rgba(0,0,0,0.55)';
      ctx.shadowBlur = 4 * scale;
    }
    ctx.fillText(word.text, 0, 0);
    ctx.restore();
  });
}

// ─── Mask Generator ───────────────────────────────────────────────────────────
function buildMask(
  width: number,
  height: number,
  shape: ShapeType,
  customImage: HTMLImageElement | null
): Uint8ClampedArray | null {
  if (shape === 'rectangle') return null;
  const oc = document.createElement('canvas');
  oc.width = width; oc.height = height;
  const ctx = oc.getContext('2d')!;
  const cx = width / 2, cy = height / 2;
  const rx = width / 2 - 24, ry = height / 2 - 24;

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();

  if (shape === 'custom' && customImage) {
    // Detect silhouette by luminosity threshold
    const scale = Math.min((width - 48) / customImage.width, (height - 48) / customImage.height);
    const iw = customImage.width * scale, ih = customImage.height * scale;
    const ox = (width - iw) / 2, oy = (height - ih) / 2;
    ctx.drawImage(customImage, ox, oy, iw, ih);
    const imgData = ctx.getImageData(0, 0, width, height);
    const d = imgData.data;
    // Binarize: keep dark pixels as mask
    for (let i = 0; i < d.length; i += 4) {
      const lum = 0.299 * d[i] + 0.587 * d[i+1] + 0.114 * d[i+2];
      const alpha = d[i+3];
      // Accept: dark pixel OR pixel with significant alpha
      const isShape = (alpha > 80 && lum < 200) || (alpha > 128);
      d[i] = d[i+1] = d[i+2] = isShape ? 255 : 0;
      d[i+3] = isShape ? 255 : 0;
    }
    ctx.putImageData(imgData, 0, 0);
    return ctx.getImageData(0, 0, width, height).data;
  }

  if (shape === 'circle') {
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  } else if (shape === 'heart') {
    const r = Math.min(rx, ry) * 0.95;
    for (let t = 0; t <= Math.PI * 2; t += 0.03) {
      const hx = cx + r * (16 * Math.pow(Math.sin(t), 3)) / 16;
      const hy = cy - r * (13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t)) / 16;
      t < 0.03 ? ctx.moveTo(hx, hy) : ctx.lineTo(hx, hy);
    }
  } else if (shape === 'star') {
    const r = Math.min(rx, ry);
    for (let i = 0; i < 10; i++) {
      const a = i * Math.PI / 5 - Math.PI / 2;
      const rad = i % 2 === 0 ? r : r * 0.42;
      const px = cx + rad * Math.cos(a), py = cy + rad * Math.sin(a);
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
  } else if (shape === 'hexagon') {
    const r = Math.min(rx, ry);
    for (let i = 0; i < 6; i++) {
      const a = i * Math.PI / 3 - Math.PI / 6;
      const px = cx + r * Math.cos(a), py = cy + r * Math.sin(a);
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
  } else if (shape === 'cloud') {
    const r = Math.min(rx, ry);
    ctx.arc(cx - r*0.35, cy + r*0.20, r*0.42, 0, Math.PI * 2);
    ctx.arc(cx + r*0.35, cy + r*0.20, r*0.42, 0, Math.PI * 2);
    ctx.arc(cx,          cy - r*0.18, r*0.52, 0, Math.PI * 2);
    ctx.arc(cx - r*0.20, cy + r*0.22, r*0.44, 0, Math.PI * 2);
    ctx.arc(cx + r*0.20, cy + r*0.22, r*0.44, 0, Math.PI * 2);
  }

  ctx.closePath();
  ctx.fill();
  return ctx.getImageData(0, 0, width, height).data;
}

// ─── validateLayout ────────────────────────────────────────────────────────────
function validateLayout(words: PlacedWord[], mask: Uint8ClampedArray | null, width: number, height: number): LayoutStats {
  let collisions = 0;
  const GAP = 8;
  for (let i = 0; i < words.length; i++) {
    const a = words[i];
    const ax1 = a.x - a.bw/2 - GAP, ay1 = a.y - a.bh/2 - GAP;
    const ax2 = a.x + a.bw/2 + GAP, ay2 = a.y + a.bh/2 + GAP;
    for (let j = i+1; j < words.length; j++) {
      const b = words[j];
      const bx1 = b.x - b.bw/2, by1 = b.y - b.bh/2;
      const bx2 = b.x + b.bw/2, by2 = b.y + b.bh/2;
      if (ax1 < bx2 && ax2 > bx1 && ay1 < by2 && ay2 > by1) collisions++;
    }
  }

  let fillArea = 0;
  let maskArea = 0;
  if (mask) {
    for (let i = 3; i < mask.length; i += 4) {
      if (mask[i] > 128) maskArea++;
    }
    words.forEach(w => { fillArea += w.bw * w.bh; });
  } else {
    maskArea = width * height;
    words.forEach(w => { fillArea += w.bw * w.bh; });
  }

  const fillRate = maskArea > 0 ? Math.min(100, Math.round((fillArea / maskArea) * 100)) : 0;
  return { placed: words.length, total: words.length, collisions, fillRate };
}

// ─── Main Component ───────────────────────────────────────────────────────────
export const WordCloudTool: React.FC<WordCloudToolProps> = ({ onGoToBrief }) => {
  // Content
  const [textInput, setTextInput]         = useState(PRESET_TEXTS[0].text);
  const [removeStopWords, setRemoveStopWords] = useState(true);
  const [forceLowercase, setForceLowercase]   = useState(true);
  const [maxWords, setMaxWords]           = useState(80);
  const [maxFontSize, setMaxFontSize]     = useState(64);
  const [minFontSize] = useState(11);
  const [excludedWords, setExcludedWords] = useState<Set<string>>(new Set());

  // Shape
  const [shapeType, setShapeType]         = useState<ShapeType>('circle');
  const [customImage, setCustomImage]     = useState<HTMLImageElement | null>(null);

  // Composition
  const [rotationMode, setRotationMode]   = useState<RotationMode>('none');
  const [density, setDensity]             = useState(3);   // 1=aéré, 5=dense
  const [fontFamily, setFontFamily]       = useState('Plus Jakarta Sans, sans-serif');

  // Style
  const [bgMode, setBgMode]               = useState<BgMode>('dark');
  const [selectedPalette, setSelectedPalette] = useState(0);

  // Layout (Source Unique de Vérité)
  const [rawWords, setRawWords]           = useState<{ text: string; count: number }[]>([]);
  const [placedWords, setPlacedWords]     = useState<PlacedWord[]>([]);
  const [layoutSeed, setLayoutSeed]       = useState(() => Math.floor(Math.random() * 999999));
  const [isComputing, setIsComputing]     = useState(false);
  const [stats, setStats]                 = useState<LayoutStats | null>(null);

  // Export
  const [exportFormat, setExportFormat]   = useState<ExportFormat>('png');
  const [exportQuality, setExportQuality] = useState<ExportQuality>('hd');
  const [exportUrl, setExportUrl]         = useState<string | null>(null);
  const [isExporting, setIsExporting]     = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ── 1. Parse text → rawWords ──────────────────────────────────────────────
  const parseText = useCallback(() => {
    if (!textInput.trim()) { setRawWords([]); return; }

    let text = textInput.replace(/[^\w\sàâäéèêëîïôöùûüçñ'-]/g, ' ').replace(/\s+/g, ' ');
    if (forceLowercase) text = text.toLowerCase();

    const counts: Record<string, number> = {};
    text.split(' ').forEach(w => {
      const cw = w.trim();
      const lw = cw.toLowerCase();
      if (cw.length < 2 || /^\d+$/.test(cw) || excludedWords.has(lw)) return;
      if (removeStopWords && STOPWORDS.has(lw)) return;
      counts[cw] = (counts[cw] || 0) + 1;
    });

    const sorted = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxWords)
      .map(([text, count]) => ({ text, count }));
    setRawWords(sorted);
  }, [textInput, maxWords, excludedWords, removeStopWords, forceLowercase]);

  useEffect(() => { parseText(); }, [parseText]);

  // ── 2. Compute layout (deterministic via seed) ────────────────────────────
  const computeLayout = useCallback(() => {
    if (!rawWords.length) { setPlacedWords([]); setStats(null); return; }
    setIsComputing(true);

    setTimeout(() => {
      const rng = createPRNG(layoutSeed);
      const ctx = document.createElement('canvas').getContext('2d')!;
      const W = CANVAS_W, H = CANVAS_H;
      const cx = W / 2, cy = H / 2;

      // Color palette
      const paletteColors =
        bgMode === 'white-black' ? ['#0f172a','#1e293b','#334155','#475569','#000000'] :
        bgMode === 'white-color' ? PALETTES[selectedPalette].light :
        PALETTES[selectedPalette].dark;

      // Build mask once
      const mask = buildMask(W, H, shapeType, customImage);

      // Size with logarithmic curve (less aggressive hierarchy)
      const maxCount = rawWords[0].count;
      const minCount = rawWords[rawWords.length - 1].count;

      // Density params
      const GAP = Math.max(4, 20 - density * 3);          // density 1→17, 5→5
      const spiralStep = Math.max(1.0, 3.0 - density * 0.4); // density 1→2.6, 5→1.0
      const maxIter = 300 + density * 80;

      const pixelInMask = (px: number, py: number) => {
        if (!mask) return px >= 0 && py >= 0 && px < W && py < H;
        if (px < 0 || py < 0 || px >= W || py >= H) return false;
        return mask[(Math.floor(py) * W + Math.floor(px)) * 4 + 3] > 128;
      };

      const placedBoxes: { x1: number; y1: number; x2: number; y2: number }[] = [];

      const noCollision = (bx: number, by: number, bw: number, bh: number) => {
        const x1 = bx - GAP, y1 = by - GAP;
        const x2 = bx + bw + GAP, y2 = by + bh + GAP;
        for (const p of placedBoxes) {
          if (x1 < p.x2 && x2 > p.x1 && y1 < p.y2 && y2 > p.y1) return false;
        }
        return true;
      };

      const boxInsideMask = (bx: number, by: number, bw: number, bh: number) => {
        // Check 9 points (4 corners + 4 edge midpoints + center)
        const pts = [
          [bx, by], [bx+bw, by], [bx, by+bh], [bx+bw, by+bh],
          [bx+bw/2, by], [bx+bw/2, by+bh],
          [bx, by+bh/2], [bx+bw, by+bh/2],
          [bx+bw/2, by+bh/2],
        ];
        return pts.every(([px, py]) => pixelInMask(px, py));
      };

      const newPlaced: PlacedWord[] = [];

      rawWords.forEach((word, idx) => {
        const ratio = maxCount === minCount ? 1 : (word.count - minCount) / (maxCount - minCount);
        // Logarithmic (more balanced)
        const size = Math.round(minFontSize + Math.pow(ratio, 0.55) * (maxFontSize - minFontSize));
        const color = paletteColors[idx % paletteColors.length];

        // Rotation per mode
        let angle = 0;
        const r = rng();
        if (rotationMode === 'classic') {
          angle = idx % 6 === 5 ? Math.PI / 2 : 0;
        } else if (rotationMode === 'dynamic') {
          // ±15° or ±30° only — never 45°
          const opts = [0, 0, 0, Math.PI/12, -Math.PI/12, Math.PI/6, -Math.PI/6];
          angle = opts[Math.floor(r * opts.length)];
        } else if (rotationMode === 'random') {
          angle = (rng() - 0.5) * Math.PI * 0.85;
        }

        ctx.font = `bold ${size}px ${fontFamily}`;
        const rawW = ctx.measureText(word.text).width + 6;
        const rawH = size * 1.15;

        // AABB after rotation
        const bw = Math.abs(rawW * Math.cos(angle)) + Math.abs(rawH * Math.sin(angle));
        const bh = Math.abs(rawW * Math.sin(angle)) + Math.abs(rawH * Math.cos(angle));

        let placed = false;
        let finalCX = cx, finalCY = cy;
        let spiralAngle = rng() * Math.PI * 2; // random start angle for spiral
        let radius = 0;

        for (let i = 0; i < maxIter; i++) {
          spiralAngle += 0.42 + rng() * 0.05; // slight jitter
          radius += spiralStep;

          const tx = cx + radius * Math.cos(spiralAngle) - bw / 2;
          const ty = cy + radius * Math.sin(spiralAngle) - bh / 2;

          if (boxInsideMask(tx, ty, bw, bh) && noCollision(tx, ty, bw, bh)) {
            placedBoxes.push({ x1: tx, y1: ty, x2: tx+bw, y2: ty+bh });
            finalCX = tx + bw / 2;
            finalCY = ty + bh / 2;
            placed = true;
            break;
          }
        }

        if (!placed) return; // skip word if no position found

        newPlaced.push({ text: word.text, count: word.count, size, color, x: finalCX, y: finalCY, angle, w: rawW, h: rawH, bw, bh });
      });

      setPlacedWords(newPlaced);

      // Rebuild mask for stats (mask was consumed)
      const maskForStats = buildMask(W, H, shapeType, customImage);
      setStats(validateLayout(newPlaced, maskForStats, W, H));
      setExportUrl(null); // reset export URL when layout changes
      setIsComputing(false);
    }, 20);
  }, [rawWords, layoutSeed, bgMode, selectedPalette, shapeType, customImage, rotationMode, density, fontFamily, maxFontSize, minFontSize]);

  useEffect(() => { computeLayout(); }, [computeLayout]);

  // ── 3. Render preview (uses same drawPlacedWords as export) ───────────────
  const renderPreview = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    applyBackground(ctx, canvas.width, canvas.height, bgMode);

    if (!placedWords.length) {
      ctx.fillStyle = bgMode === 'dark' ? '#64748b' : '#94a3b8';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Saisissez du texte pour générer le nuage de mots.', canvas.width / 2, canvas.height / 2);
      return;
    }

    drawPlacedWords(ctx, placedWords, fontFamily, bgMode, 1);
  }, [placedWords, fontFamily, bgMode]);

  useEffect(() => { renderPreview(); }, [renderPreview]);

  // ── 4. Export Engine (AUCUN recalcul — même placedWords) ─────────────────
  const buildExport = useCallback(() => {
    if (!placedWords.length) return;
    setIsExporting(true);
    setExportUrl(null);

    setTimeout(() => {
      if (exportFormat === 'svg') {
        const bgRect =
          bgMode === 'dark' ? `<rect width="${CANVAS_W}" height="${CANVAS_H}" fill="#020617"/>` :
          (bgMode === 'white-color' || bgMode === 'white-black') ? `<rect width="${CANVAS_W}" height="${CANVAS_H}" fill="#ffffff"/>` :
          '';
        const shadow = bgMode === 'dark'
          ? `<defs><filter id="sh"><feDropShadow dx="0" dy="0" stdDeviation="3" flood-color="#000" flood-opacity="0.55"/></filter></defs>`
          : '';
        const fontName = fontFamily.split(',')[0].replace(/'/g,'').trim();
        const fi = bgMode === 'dark' ? ' filter="url(#sh)"' : '';

        const texts = placedWords.map(w => {
          const safe = w.text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
          const deg = (w.angle * 180 / Math.PI).toFixed(2);
          return `  <text x="${w.x.toFixed(1)}" y="${w.y.toFixed(1)}" transform="rotate(${deg},${w.x.toFixed(1)},${w.y.toFixed(1)})" font-family="${fontName},sans-serif" font-size="${w.size}" font-weight="bold" fill="${w.color}" text-anchor="middle" dominant-baseline="central"${fi}>${safe}</text>`;
        }).join('\n');

        const svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CANVAS_W} ${CANVAS_H}" width="${CANVAS_W}" height="${CANVAS_H}">\n${shadow}\n${bgRect}\n${texts}\n</svg>`;
        const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
        setExportUrl(URL.createObjectURL(blob));
        setIsExporting(false);
        return;
      }

      // PNG or JPG
      const scale = EXPORT_SCALES[exportQuality];
      const offCanvas = document.createElement('canvas');
      offCanvas.width = CANVAS_W * scale;
      offCanvas.height = CANVAS_H * scale;
      const ctx = offCanvas.getContext('2d')!;

      // For JPG, force white background regardless of bgMode
      const effectiveBg: BgMode = exportFormat === 'jpg' && bgMode === 'transparent' ? 'white-color' : bgMode;
      applyBackground(ctx, offCanvas.width, offCanvas.height, effectiveBg);
      drawPlacedWords(ctx, placedWords, fontFamily, bgMode, scale);

      const mimeType = exportFormat === 'jpg' ? 'image/jpeg' : 'image/png';
      offCanvas.toBlob(blob => {
        if (!blob) { setIsExporting(false); return; }
        setExportUrl(URL.createObjectURL(blob));
        setIsExporting(false);
      }, mimeType, 1.0);
    }, 30);
  }, [placedWords, exportFormat, exportQuality, bgMode, fontFamily]);

  const triggerDownload = () => {
    if (!exportUrl) return;
    const ext = exportFormat;
    const a = document.createElement('a');
    a.href = exportUrl;
    a.download = `hadara-shape-cloud-${shapeType}-${bgMode}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

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

  const regenerate = () => {
    setLayoutSeed(Math.floor(Math.random() * 999999));
  };

  const toggleExcludeWord = (word: string) => {
    setExcludedWords(prev => {
      const next = new Set(prev);
      if (next.has(word)) next.delete(word); else next.add(word);
      return next;
    });
  };

  const QUALITY_LABELS: Record<ExportQuality, string> = {
    standard: 'Standard (1300×900)',
    hd: 'HD (2600×1800)',
    ultrahd: 'Ultra HD (3900×2700)',
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-24 px-3 sm:px-4">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-3 pt-6 sm:pt-14">
        <ToolsNav />
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Hadara Visual Tools — Gratuit
        </div>
        <h1 className="text-2xl sm:text-5xl font-serif font-extrabold text-slate-100">
          Atelier <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Shape Cloud</span>
        </h1>
        <p className="text-slate-400 text-sm max-w-xl mx-auto">
          Nuages de mots vectoriels prêts pour l'impression. Cercle, cœur, étoile ou votre propre silhouette.
        </p>
      </motion.div>

      {/* ── CANVAS (hero sur mobile) ─────────────────────────────────── */}
      <div className="lg:hidden">
        <div className={`relative rounded-2xl overflow-hidden border ${bgMode === 'white-color' || bgMode === 'white-black' ? 'bg-white border-slate-300' : bgMode === 'transparent' ? 'bg-slate-700/30 border-dashed border-slate-600' : 'bg-slate-950 border-slate-800'}`}>
          <canvas ref={canvasRef} width={CANVAS_W} height={CANVAS_H} className="w-full h-auto" />
          {isComputing && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80">
              <Loader2 className="w-8 h-8 text-amber-400 animate-spin mb-2" />
              <span className="text-xs text-amber-400 font-bold">Calcul de la composition…</span>
            </div>
          )}
        </div>
        {stats && !isComputing && (
          <div className="mt-2 flex items-center gap-3 text-[11px] font-mono text-slate-400 px-1">
            <BarChart2 className="w-3.5 h-3.5 text-amber-500" />
            <span>{stats.placed} mots</span>
            <span>•</span>
            <span className={stats.collisions > 0 ? 'text-rose-400' : 'text-emerald-400'}>{stats.collisions} collision{stats.collisions !== 1 ? 's' : ''}</span>
            <span>•</span>
            <span>{stats.fillRate}% remplissage</span>
          </div>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* ── LEFT PANEL ─────────────────────────────────────────────── */}
        <div className="lg:col-span-5 space-y-4">

          {/* 01 Contenu */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-widest">01 — Contenu</h3>
              <button onClick={parseText} className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold flex items-center gap-1 transition-colors">
                <RefreshCw className="w-3 h-3" /> Actualiser
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_TEXTS.map((p, i) => (
                <button key={i} onClick={() => setTextInput(p.text)} className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition-colors">{p.title}</button>
              ))}
            </div>
            <textarea rows={4} value={textInput} onChange={e => setTextInput(e.target.value)}
              placeholder="Collez votre texte, article, brief…"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-400 resize-none leading-relaxed" />
            <div className="flex flex-col gap-1.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={removeStopWords} onChange={e => setRemoveStopWords(e.target.checked)} className="accent-amber-500" />
                <span className="text-xs text-slate-300">Supprimer les mots courants (le, de, the…)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={forceLowercase} onChange={e => setForceLowercase(e.target.checked)} className="accent-amber-500" />
                <span className="text-xs text-slate-300">Tout en minuscules</span>
              </label>
            </div>
          </div>

          {/* 02 Forme */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-widest">02 — Forme (Shape Cloud)</h3>
            <div className="grid grid-cols-3 gap-2">
              {SHAPES.map(s => (
                <button key={s.key} onClick={() => setShapeType(s.key)}
                  className={`p-2 rounded-xl border text-xs font-bold flex flex-col items-center gap-0.5 transition-all ${shapeType === s.key ? 'bg-amber-500 border-amber-500 text-slate-950 shadow-lg shadow-amber-500/20' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200'}`}>
                  <span className="text-lg leading-none">{s.icon}</span>
                  <span className="text-[10px]">{s.label}</span>
                </button>
              ))}
            </div>
            <label className={`flex items-center justify-center gap-2 w-full p-2.5 rounded-xl border border-dashed cursor-pointer transition-all ${shapeType === 'custom' ? 'border-amber-400 bg-amber-500/10 text-amber-400' : 'border-slate-700 bg-slate-950 text-slate-500 hover:border-slate-500 hover:text-slate-300'}`}>
              <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleImageUpload} />
              <Upload className="w-3.5 h-3.5" />
              <span className="text-[11px] font-bold uppercase">{customImage && shapeType === 'custom' ? '✓ Silhouette importée' : 'Importer ma silhouette (PNG)'}</span>
            </label>
          </div>

          {/* 03 Composition */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-widest">03 — Composition</h3>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase flex justify-between">
                <span>Densité</span>
                <span className="text-slate-300">{['','Aérée','Légère','Équilibrée','Compacte','Dense'][density]}</span>
              </label>
              <input type="range" min={1} max={5} value={density} onChange={e => setDensity(+e.target.value)} className="w-full accent-amber-400" />
              <div className="flex justify-between text-[9px] text-slate-600"><span>Aérée</span><span>Dense</span></div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Mots max ({maxWords})</label>
                <input type="range" min={20} max={200} value={maxWords} onChange={e => setMaxWords(+e.target.value)} className="w-full accent-amber-400" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Taille max ({maxFontSize}px)</label>
                <input type="range" min={24} max={120} value={maxFontSize} onChange={e => setMaxFontSize(+e.target.value)} className="w-full accent-amber-400" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Rotation</label>
              <div className="grid grid-cols-2 gap-1.5">
                {ROTATIONS.map(r => (
                  <button key={r.key} onClick={() => setRotationMode(r.key)}
                    className={`p-2 rounded-xl border text-[10px] font-bold transition-all text-left ${rotationMode === r.key ? 'bg-amber-500 text-slate-950 border-amber-500' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'}`}>
                    <div>{r.label}</div>
                    <div className={`text-[9px] font-normal mt-0.5 ${rotationMode === r.key ? 'text-slate-800' : 'text-slate-600'}`}>{r.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Police</label>
              <select value={fontFamily} onChange={e => setFontFamily(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400">
                <option value="Plus Jakarta Sans, sans-serif">Modern Sans (Plus Jakarta)</option>
                <option value="Playfair Display, serif">Élégant Serif (Playfair)</option>
                <option value="monospace">Code Monospace</option>
                <option value="Impact, sans-serif">Bold Impact</option>
              </select>
            </div>
          </div>

          {/* 04 Style */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-widest">04 — Style & Couleurs</h3>
            <div className="grid grid-cols-2 gap-2">
              {([['dark','🌙 Fond Sombre'],['white-color','☀️ Fond Blanc'],['white-black','⬛ Noir & Blanc'],['transparent','✦ Transparent']] as [BgMode,string][]).map(([key, label]) => (
                <button key={key} onClick={() => setBgMode(key)}
                  className={`p-2 rounded-xl border text-[10px] font-bold flex items-center gap-1.5 transition-all ${bgMode === key
                    ? key === 'dark' ? 'bg-slate-950 border-amber-400 text-amber-400'
                    : key === 'transparent' ? 'bg-slate-950 border-emerald-400 text-emerald-400'
                    : 'bg-white border-amber-500 text-slate-900'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'}`}>
                  {label}
                </button>
              ))}
            </div>
            {bgMode !== 'white-black' && (
              <div className="grid grid-cols-2 gap-2">
                {PALETTES.map((p, i) => (
                  <button key={i} onClick={() => setSelectedPalette(i)}
                    className={`p-2 rounded-xl border text-left space-y-1 transition-all ${selectedPalette === i ? 'bg-amber-400/10 border-amber-400' : 'bg-slate-950 border-slate-800 hover:border-slate-700'}`}>
                    <span className="text-[9px] font-bold text-slate-300 block truncate">{p.name}</span>
                    <div className="flex gap-1">
                      {(bgMode === 'white-color' ? p.light : p.dark).map((c, ci) => (
                        <div key={ci} className="w-3 h-3 rounded-full border border-white/10" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT PANEL ────────────────────────────────────────────── */}
        <div className="lg:col-span-7 space-y-4">

          {/* Canvas (desktop) */}
          <div className="hidden lg:block">
            <div className={`relative rounded-2xl overflow-hidden border ${bgMode === 'white-color' || bgMode === 'white-black' ? 'bg-white border-slate-300' : bgMode === 'transparent' ? 'bg-slate-700/30 border-dashed border-slate-600' : 'bg-slate-950 border-slate-800'}`}>
              <canvas ref={canvasRef} width={CANVAS_W} height={CANVAS_H} className="w-full h-auto" />
              {isComputing && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 rounded-2xl">
                  <Loader2 className="w-8 h-8 text-amber-400 animate-spin mb-2" />
                  <span className="text-xs text-amber-400 font-bold">Calcul de la composition…</span>
                </div>
              )}
            </div>
            {stats && !isComputing && (
              <div className="mt-2 flex items-center gap-3 text-[11px] font-mono text-slate-400 px-1">
                <BarChart2 className="w-3.5 h-3.5 text-amber-500" />
                <span>{stats.placed} mots placés</span>
                <span>•</span>
                <span className={stats.collisions > 0 ? 'text-rose-400' : 'text-emerald-400'}>{stats.collisions} collision{stats.collisions !== 1 ? 's' : ''}</span>
                <span>•</span>
                <span>{stats.fillRate}% de la forme utilisée</span>
              </div>
            )}
          </div>

          {/* Regenerate button */}
          <button onClick={regenerate} disabled={isComputing}
            className="w-full py-3 rounded-2xl border border-dashed border-slate-700 hover:border-amber-500/50 text-slate-400 hover:text-amber-400 text-xs font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-40">
            <RefreshCw className={`w-4 h-4 ${isComputing ? 'animate-spin' : ''}`} />
            Générer une nouvelle composition (même paramètres)
          </button>

          {/* Export Panel */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Exporter le design</h3>

            {/* Format */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Format</label>
              <div className="flex gap-2">
                {(['png','svg','jpg'] as ExportFormat[]).map(f => (
                  <button key={f} onClick={() => { setExportFormat(f); setExportUrl(null); }}
                    className={`flex-1 py-2 rounded-xl border text-xs font-bold uppercase transition-all ${exportFormat === f ? 'bg-amber-500 border-amber-500 text-slate-950' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'}`}>
                    {f}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-600 px-1">
                {exportFormat === 'svg' ? 'SVG vectoriel — textes éditables dans Illustrator/Inkscape' :
                 exportFormat === 'jpg' ? 'JPG compressé — fond blanc automatique (pas de transparence en JPG)' :
                 'PNG avec transparence — recommandé pour impression et post-production'}
              </p>
            </div>

            {/* Quality (PNG/JPG only) */}
            {exportFormat !== 'svg' && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Qualité</label>
                <select value={exportQuality} onChange={e => { setExportQuality(e.target.value as ExportQuality); setExportUrl(null); }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400">
                  {(Object.entries(QUALITY_LABELS) as [ExportQuality, string][]).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Fond override info */}
            {exportFormat === 'jpg' && bgMode === 'transparent' && (
              <div className="text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                ⚠️ Le fond transparent sera remplacé par du blanc dans le JPG.
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <button onClick={buildExport} disabled={!placedWords.length || isComputing || isExporting}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95">
                {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                {isExporting ? 'Préparation…' : 'Préparer le fichier'}
              </button>

              {exportUrl && (
                <button onClick={triggerDownload}
                  className="flex-1 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-400/25 active:scale-95 transition-all animate-pulse">
                  <Download className="w-4 h-4" />
                  Télécharger
                </button>
              )}
            </div>

            {/* iOS fallback */}
            {exportUrl && (
              <div className="flex items-start gap-2 text-[10px] text-slate-500 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2">
                <span>📱</span>
                <span>
                  Sur iPhone Safari, si le téléchargement ne démarre pas :&nbsp;
                  <a href={exportUrl} target="_blank" rel="noopener noreferrer"
                    className="text-amber-400 underline inline-flex items-center gap-0.5">
                    Ouvrir le fichier <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                  &nbsp;puis appuyer longtemps → Enregistrer.
                </span>
              </div>
            )}
          </div>

          {/* Words list (click to exclude) */}
          {rawWords.length > 0 && (
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mots extraits — cliquer pour exclure</h4>
              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                {rawWords.map(w => (
                  <button key={w.text} onClick={() => toggleExcludeWord(w.text)}
                    className={`px-2 py-0.5 rounded-lg border text-[11px] font-mono flex items-center gap-1 transition-colors ${excludedWords.has(w.text.toLowerCase()) ? 'bg-rose-950/50 border-rose-700 text-rose-400 line-through' : 'bg-slate-950 border-slate-800 hover:border-rose-500/50 text-slate-300'}`}>
                    {w.text}
                    <span className="text-[9px] text-amber-500 font-bold">({w.count})</span>
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
        <button onClick={onGoToBrief} className="w-full sm:w-auto px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-2xl flex items-center justify-center gap-3 mx-auto transition-all active:scale-95">
          <Sparkles className="w-5 h-5" />
          Créer mon Brief Intelligent
        </button>
      </motion.div>
    </div>
  );
};
