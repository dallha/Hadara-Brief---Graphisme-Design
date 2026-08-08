import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Check, Sparkles, ArrowRight, Info } from 'lucide-react';
import { ToolsNav } from './ToolsNav';

interface QuoteCalculatorToolProps {
  onGoToBrief: () => void;
  onGoToInvoice?: () => void;
}

const SERVICES = [
  { id: 'logo', name: 'Logo & Identité Visuelle', basePrice: 25000, icon: '🎨' },
  { id: 'affiche', name: 'Affiche / Flyer', basePrice: 8000, icon: '📄' },
  { id: 'bache', name: 'Bâche / Roll-up', basePrice: 15000, icon: '🖼️' },
  { id: 'carte', name: 'Carte de Visite', basePrice: 6000, icon: '💳' },
  { id: 'social', name: 'Pack Réseaux Sociaux', basePrice: 20000, icon: '📱' },
  { id: 'video', name: 'Montage Vidéo', basePrice: 35000, icon: '🎬' },
  { id: 'site', name: 'Site Web Vitrine', basePrice: 80000, icon: '💻' },
  { id: 'charte', name: 'Charte Graphique Complète', basePrice: 60000, icon: '📘' },
];

export const QuoteCalculatorTool: React.FC<QuoteCalculatorToolProps> = ({ onGoToBrief, onGoToInvoice }) => {
  const [selectedServices, setSelectedServices] = useState<string[]>(['logo']);
  const [revisions, setRevisions] = useState<number>(1); // 1 = standard, 1.15 = 3 revisions, 1.3 = unlimited
  const [urgency, setUrgency] = useState<number>(1); // 1 = normal, 1.3 = express 48h, 1.6 = urgent 24h
  const [includeSources, setIncludeSources] = useState<boolean>(false);

  const toggleService = (id: string) => {
    setSelectedServices(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const rawSubtotal = selectedServices.reduce((sum, id) => {
    const s = SERVICES.find(srv => srv.id === id);
    return sum + (s ? s.basePrice : 0);
  }, 0);

  const sourceMultiplier = includeSources ? 1.2 : 1.0;
  const total = Math.round(rawSubtotal * revisions * urgency * sourceMultiplier);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-24 px-3 sm:px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4 pt-6 sm:pt-16">
        <ToolsNav />
        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
          <Sparkles className="w-4 h-4" />
          <span>Outils Gratuits Hadara Studio</span>
        </div>
        <h1 className="text-2xl sm:text-5xl font-serif font-extrabold text-slate-100">
          Calculateur de <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Devis Rapide</span>
        </h1>
        <p className="text-slate-400 text-sm max-w-2xl mx-auto">
          Sélectionnez vos besoins pour obtenir une estimation instantanée de votre projet créatif.
        </p>
      </motion.div>

      {/* Step 1: Select Services */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">1. Choisissez vos prestations</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {SERVICES.map(srv => {
            const isSelected = selectedServices.includes(srv.id);
            return (
              <button
                key={srv.id}
                onClick={() => toggleService(srv.id)}
                className={`p-4 rounded-2xl border text-left transition-all space-y-2 relative overflow-hidden ${
                  isSelected
                    ? 'bg-amber-500/10 border-amber-400 text-slate-100 shadow-lg shadow-amber-500/10'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-2xl mb-1">{srv.icon}</div>
                <div className="font-bold text-xs leading-snug">{srv.name}</div>
                <div className="text-amber-400 font-mono text-xs font-semibold">
                  dès {srv.basePrice.toLocaleString('fr-FR')} FCFA
                </div>
                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2: Options */}
      {selectedServices.length > 0 && (
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-5">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">2. Options & Délais</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-bold uppercase">Révisions</label>
              <select
                value={revisions}
                onChange={e => setRevisions(parseFloat(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
              >
                <option value={1.0}>1 Révision incluse (Normal)</option>
                <option value={1.15}>3 Révisions (+15%)</option>
                <option value={1.3}>Révisions illimitées (+30%)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-bold uppercase">Délai de livraison</label>
              <select
                value={urgency}
                onChange={e => setUrgency(parseFloat(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
              >
                <option value={1.0}>Délai Normal (3-5 jours)</option>
                <option value={1.3}>Express 48h (+30%)</option>
                <option value={1.6}>Urgent 24h (+60%)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-bold uppercase">Fichiers sources (.AI, .PSD)</label>
              <button
                type="button"
                onClick={() => setIncludeSources(!includeSources)}
                className={`w-full py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-between ${
                  includeSources ? 'bg-amber-400/20 border-amber-400 text-amber-300' : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                <span>Fichiers Sources HD (+20%)</span>
                {includeSources && <Check className="w-4 h-4 text-amber-400" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Result & Total */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-amber-500/30 text-center space-y-4 shadow-2xl relative overflow-hidden">
        <div className="text-xs text-slate-400 uppercase font-bold tracking-widest">Estimation Budgétaire Indicative</div>
        <div className="text-3xl sm:text-5xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-300">
          {total.toLocaleString('fr-FR')} FCFA
        </div>
        <p className="text-xs text-slate-400 max-w-md mx-auto flex items-center justify-center gap-1">
          <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Le tarif final est validé sur devis officiel après soumission du brief.</span>
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onGoToBrief}
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-400 to-amber-300 text-slate-950 font-bold rounded-2xl flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-xl shadow-amber-400/20 active:scale-95 text-sm"
          >
            <span>Lancer mon Brief avec cette estimation</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          {onGoToInvoice && (
            <button
              onClick={onGoToInvoice}
              className="w-full sm:w-auto px-6 py-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-2xl text-xs transition-all"
            >
              Générer une Facture d'acompte
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
