import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import Tesseract from 'tesseract.js';
import { 
  Upload, 
  Image as ImageIcon, 
  Copy, 
  Wand2, 
  ArrowRight,
  Loader2,
  Trash2,
  Sparkles,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { ToolsNav } from './ToolsNav';
import { cn } from '../utils/cn';

import API_BASE from '../config';

interface OCRToolProps {
  onGoToBrief: () => void;
}

export const OCRTool: React.FC<OCRToolProps> = ({ onGoToBrief }) => {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isCorrecting, setIsCorrecting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    loadFile(file);
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    loadFile(file);
  }, []);

  const loadFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Veuillez sélectionner une image valide (JPG, PNG).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setSourceImage(event.target?.result as string);
      setExtractedText('');
      setError(null);
      setProgress(0);
      setCopied(false);
    };
    reader.readAsDataURL(file);
  };

  const processImage = async () => {
    if (!sourceImage) return;
    setIsProcessing(true);
    setError(null);
    setProgress(0);

    try {
      const result = await Tesseract.recognize(
        sourceImage,
        'fra+eng+ara', // French, English and Arabic support
        {
          logger: m => {
            if (m.status === 'recognizing text') {
              setProgress(Math.round(m.progress * 100));
              setStatusText('Analyse en cours...');
            } else {
              setStatusText('Préparation...');
            }
          }
        }
      );
      setExtractedText(result.data.text);
      setProgress(100);
    } catch (err) {
      console.error(err);
      setError('Une erreur est survenue lors de la lecture du texte.');
    } finally {
      setIsProcessing(false);
      setStatusText('');
    }
  };

  const correctWithAI = async () => {
    if (!extractedText) return;
    setIsCorrecting(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/api/ocr-correct/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: extractedText })
      });
      if (response.ok) {
        const data = await response.json();
        setExtractedText(data.text);
      } else {
        setError("Erreur lors de la correction par l'IA.");
      }
    } catch (err) {
      console.error(err);
      setError("Impossible de contacter le serveur d'IA.");
    } finally {
      setIsCorrecting(false);
    }
  };

  const copyToClipboard = () => {
    if (!extractedText) return;
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
    setSourceImage(null);
    setExtractedText('');
    setProgress(0);
    setError(null);
    setCopied(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
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
          Extracteur de <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Texte (OCR)</span>
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Récupérez le texte de n'importe quelle image ou capture d'écran grâce à l'Intelligence Artificielle.
          100% privé, aucun fichier n'est envoyé sur le cloud.
        </p>
      </motion.div>

      {/* Main Workspace */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-[2rem] p-4 sm:p-8 shadow-2xl"
      >
        {!sourceImage ? (
          /* Dropzone */
          <div 
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-700 hover:border-amber-500/50 rounded-2xl p-12 text-center cursor-pointer transition-colors flex flex-col items-center justify-center min-h-[300px] bg-slate-950/50"
          >
            <Upload className="w-12 h-12 text-slate-500 mb-4" />
            <h3 className="text-lg font-bold text-slate-200 mb-2">Cliquez ou glissez une image ici</h3>
            <p className="text-sm text-slate-400">Formats supportés : JPG, PNG</p>
          </div>
        ) : (
          /* Preview & Actions */
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Source Image */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-300 uppercase tracking-wider">Image Originale</span>
                  <button onClick={reset} className="p-2 text-rose-400 hover:bg-rose-400/10 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="relative aspect-square sm:aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
                  <img src={sourceImage} alt="Original" className="max-w-full max-h-full object-contain" />
                </div>
              </div>

              {/* Result Text */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-amber-400 uppercase tracking-wider">Texte Extrait</span>
                  <div className="flex items-center gap-2">
                    {extractedText && (
                      <button 
                        onClick={correctWithAI} 
                        disabled={isCorrecting}
                        className={cn(
                          "flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold text-xs transition-colors",
                          isCorrecting ? "bg-slate-700 text-slate-400 cursor-not-allowed" : "bg-purple-500/20 text-purple-400 hover:bg-purple-500/30"
                        )}
                        title="Corriger les erreurs avec l'IA"
                      >
                        {isCorrecting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                        {isCorrecting ? "Correction..." : "Correction IA"}
                      </button>
                    )}
                    {extractedText && (
                      <button 
                        onClick={copyToClipboard} 
                        className={cn(
                          "flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold text-xs transition-colors",
                          copied ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-400 text-slate-950 hover:bg-amber-300"
                        )}
                      >
                        {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied ? "Copié !" : "Copier"}
                      </button>
                    )}
                  </div>
                </div>
                <div className="relative h-full min-h-[250px] sm:aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex flex-col">
                  {isProcessing ? (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                      <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                      <div className="text-amber-400 font-mono font-bold">{progress}%</div>
                      <p className="text-xs text-slate-400">{statusText}</p>
                    </div>
                  ) : extractedText ? (
                    <textarea 
                      value={extractedText}
                      onChange={(e) => setExtractedText(e.target.value)}
                      className="flex-1 w-full p-4 bg-transparent text-slate-200 resize-none focus:outline-none"
                    />
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-600 space-y-2">
                      <ImageIcon className="w-8 h-8" />
                      <p className="text-sm">En attente de traitement</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-center text-sm font-medium">
                {error}
              </div>
            )}

            {!extractedText && !isProcessing && (
              <div className="flex justify-center pt-4">
                <button 
                  onClick={processImage}
                  className="px-8 py-4 bg-gradient-to-r from-amber-400 to-amber-300 text-slate-950 font-bold rounded-2xl flex items-center gap-3 hover:from-amber-300 hover:to-amber-200 transition-all shadow-xl shadow-amber-400/20 active:scale-95"
                >
                  <Wand2 className="w-5 h-5" />
                  <span>Extraire le texte</span>
                </button>
              </div>
            )}
          </div>
        )}

        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileSelect} 
          accept="image/jpeg, image/png, image/webp" 
          className="hidden" 
        />
      </motion.div>

      {/* Cross-sell */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-3xl mx-auto text-center p-8 sm:p-12 rounded-[2rem] bg-gradient-to-br from-[#335A79] to-[#184260] border border-blue-400/20 shadow-2xl mt-12"
      >
        <h3 className="text-2xl font-serif font-bold text-white mb-4">
          Un texte extrait pour une nouvelle création ?
        </h3>
        <p className="text-blue-100/80 mb-8 text-sm leading-relaxed">
          Maintenant que vous avez récupéré ce texte, pourquoi ne pas l'utiliser dans un design moderne et professionnel ? Confiez la refonte de vos visuels au Studio Hadara.
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
