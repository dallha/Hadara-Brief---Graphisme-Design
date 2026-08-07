import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { removeBackground } from '@imgly/background-removal';
import { 
  Upload, 
  Image as ImageIcon, 
  Download, 
  Wand2, 
  ArrowRight,
  Loader2,
  Trash2,
  Sparkles
} from 'lucide-react';

interface BgRemovalToolProps {
  onGoToBrief: () => void;
}

export const BgRemovalTool: React.FC<BgRemovalToolProps> = ({ onGoToBrief }) => {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Veuillez sélectionner une image valide (JPG, PNG).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setSourceImage(event.target?.result as string);
      setResultImage(null);
      setError(null);
      setProgress(0);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith('image/')) {
      setError('Veuillez déposer une image valide.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setSourceImage(event.target?.result as string);
      setResultImage(null);
      setError(null);
      setProgress(0);
    };
    reader.readAsDataURL(file);
  }, []);

  const processImage = async () => {
    if (!sourceImage) return;
    setIsProcessing(true);
    setError(null);
    setProgress(10); // Start progress

    try {
      const blob = await removeBackground(sourceImage, {
        progress: (key, current, total) => {
          // simple progress estimation
          const p = Math.round((current / total) * 100);
          setProgress(Math.max(10, p));
        }
      });
      const url = URL.createObjectURL(blob);
      setResultImage(url);
      setProgress(100);
    } catch (err) {
      console.error(err);
      setError('Une erreur est survenue lors du traitement. Veuillez réessayer.');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResult = () => {
    if (!resultImage) return;
    const a = document.createElement('a');
    a.href = resultImage;
    a.download = 'hadara-detourage.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const reset = () => {
    setSourceImage(null);
    setResultImage(null);
    setProgress(0);
    setError(null);
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
        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
          <Sparkles className="w-4 h-4" />
          <span>Outils Gratuits Hadara Studio</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-serif font-extrabold text-slate-100">
          Détourage d'Image <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">IA Gratuit</span>
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Supprimez l'arrière-plan de n'importe quelle image instantanément et directement dans votre navigateur. 
          100% privé, aucune image n'est envoyée sur nos serveurs.
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

              {/* Result Image */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-amber-400 uppercase tracking-wider">Résultat</span>
                  {resultImage && (
                    <button onClick={downloadResult} className="flex items-center gap-2 px-3 py-1.5 bg-amber-400 text-slate-950 rounded-lg font-bold text-xs hover:bg-amber-300 transition-colors">
                      <Download className="w-4 h-4" />
                      Télécharger
                    </button>
                  )}
                </div>
                <div className="relative aspect-square sm:aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
                  {/* Checkerboard background for transparency */}
                  <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CjxyZWN0IHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0iI2ZmZiIvPgo8cmVjdCB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiNjY2MiLz4KPHJlY3QgeD0iMTAiIHk9IjEwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiNjY2MiLz4KPC9zdmc+')] pointer-events-none" />
                  
                  {isProcessing ? (
                    <div className="flex flex-col items-center justify-center z-10 space-y-4">
                      <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                      <div className="text-amber-400 font-mono font-bold">{progress}%</div>
                      <p className="text-xs text-slate-400">Traitement IA local en cours...</p>
                    </div>
                  ) : resultImage ? (
                    <img src={resultImage} alt="Résultat détouré" className="max-w-full max-h-full object-contain relative z-10 drop-shadow-2xl" />
                  ) : (
                    <div className="text-slate-600 flex flex-col items-center space-y-2 z-10">
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

            {!resultImage && !isProcessing && (
              <div className="flex justify-center pt-4">
                <button 
                  onClick={processImage}
                  className="px-8 py-4 bg-gradient-to-r from-amber-400 to-amber-300 text-slate-950 font-bold rounded-2xl flex items-center gap-3 hover:from-amber-300 hover:to-amber-200 transition-all shadow-xl shadow-amber-400/20 active:scale-95"
                >
                  <Wand2 className="w-5 h-5" />
                  <span>Détourer l'image par IA</span>
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

      {/* Cross-sell / Upsell Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-3xl mx-auto text-center p-8 sm:p-12 rounded-[2rem] bg-gradient-to-br from-[#335A79] to-[#184260] border border-blue-400/20 shadow-2xl mt-12"
      >
        <h3 className="text-2xl font-serif font-bold text-white mb-4">
          Besoin d'un design professionnel avec cette image ?
        </h3>
        <p className="text-blue-100/80 mb-8 text-sm leading-relaxed">
          Maintenant que votre image est détourée, utilisez-la dans une affiche, un logo ou un visuel pour vos réseaux sociaux. Confiez la création graphique au Studio Hadara pour un résultat d'excellence.
        </p>
        <button
          onClick={onGoToBrief}
          className="px-8 py-4 bg-amber-400 text-slate-950 font-bold rounded-xl flex items-center gap-2 hover:bg-amber-300 transition-all mx-auto shadow-xl"
        >
          <span>Démarrer un Brief Intelligent</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </motion.div>

    </div>
  );
};
