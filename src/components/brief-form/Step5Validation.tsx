import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Calendar, Clock, CheckSquare } from 'lucide-react';
import { BriefData } from '../../types';
import { FORMAT_OPTIONS, BUDGET_OPTIONS } from './constants';

interface Step5ValidationProps {
  formData: Partial<BriefData>;
  setFormData: (data: Partial<BriefData>) => void;
  direction: number;
  stepVariants: any;
}

export const Step5Validation: React.FC<Step5ValidationProps> = ({ formData, setFormData, direction, stepVariants }) => {
  return (
    <motion.div
      key="step-5"
      custom={direction}
      variants={stepVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="space-y-6"
    >
      <div className="border-b border-slate-800 pb-3">
        <h3 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 text-amber-400" />
          <span>5. Format Technique, Devis & Validation Finale</span>
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Finalisez le format technique, la demande de devis et validez les conditions de soumission.
        </p>
      </div>

      {/* Technical Format */}
      <div className="space-y-4">
        <label className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
          Format technique désiré :
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {FORMAT_OPTIONS.map((format) => {
            const isSelected = formData.technicalFormat === format.id;
            return (
              <div
                key={format.id}
                onClick={() => setFormData({ ...formData, technicalFormat: format.id as any })}
                className={`p-3 rounded-xl cursor-pointer border transition-all ${
                  isSelected
                    ? 'bg-emerald-950 border-amber-400 text-slate-100 ring-1 ring-amber-400'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <h4 className="text-xs font-bold text-slate-100">{format.label}</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">{format.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Budget / Demande de Devis */}
        <div className="pt-2 space-y-2">
          <label className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
            Demande de devis & Estimation budgétaire :
          </label>
          <p className="text-[11px] text-slate-400">
            Par défaut, le graphiste analysera votre brief et vous transmettra un devis sur mesure par WhatsApp. Vous pouvez également indiquer une tranche indicative si vous avez un budget précis.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {BUDGET_OPTIONS.map((b) => {
              const isSelected = formData.budgetRange === b.id;
              return (
                <div
                  key={b.id}
                  onClick={() => setFormData({ ...formData, budgetRange: b.id as any })}
                  className={`p-3.5 rounded-xl cursor-pointer border transition-all ${
                    isSelected
                      ? 'bg-emerald-950/80 border-amber-400 text-slate-100 ring-1 ring-amber-400'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <h4 className="text-xs font-bold text-amber-300">{b.label}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">{b.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic AI Estimation Box */}
        {(() => {
          let basePrice = 35000;
          let days = '2 à 3';
          let stars = '⭐⭐⭐☆☆ (Standard)';

          const pType = formData.projectType || 'affiche';
          if (pType === 'logo' || pType === 'branding') {
            basePrice = 80000;
            days = '4 à 6';
            stars = '⭐⭐⭐⭐☆ (Avancée)';
          } else if (pType === 'pack_hadara' || pType === 'pack_starter' || pType === 'pack_booster') {
            basePrice = 75000;
            days = '3 à 5';
            stars = '⭐⭐⭐⭐⭐ (Haute Complexité)';
          } else if (pType === 'bache' || pType === 'grandformat') {
            basePrice = 50000;
            days = '2 à 4';
            stars = '⭐⭐⭐☆☆ (Grand Format)';
          } else if (pType === 'web' || pType === 'site') {
            basePrice = 150000;
            days = '5 à 10';
            stars = '⭐⭐⭐⭐⭐ (Projet Web Complexe)';
          } else if (pType === 'badge' || pType === 'papeterie') {
            basePrice = 20000;
            days = '1 à 2';
            stars = '⭐⭐☆☆☆ (Rapide)';
          }

          if (formData.criticalDeadline && formData.criticalDeadline.trim()) {
            basePrice = Math.round(basePrice * 1.15);
          }

          return (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-600/5 to-slate-900 border border-amber-500/30 space-y-3 shadow-xl my-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="text-amber-400">✨</span>
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">Estimation Automatique IA — Studio Hadara</span>
                </div>
                <span className="text-sm font-mono font-extrabold text-emerald-400 bg-emerald-950/90 px-3 py-1 rounded-full border border-emerald-700/60 shadow-lg">
                  À partir de {basePrice.toLocaleString('fr-FR')} FCFA
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 font-mono">
                <span>Délai estimé : <strong className="text-amber-300">{days} jours</strong></span>
                <span>Complexité : <strong className="text-amber-300">{stars}</strong></span>
              </div>

              <p className="text-[11px] text-slate-400 italic leading-relaxed pt-2 border-t border-slate-800">
                « Chaque projet est unique. Notre système analyse automatiquement votre brief afin de proposer une estimation adaptée à vos besoins. Le devis final définitif sera confirmé par l'équipe après étude. »
              </p>
            </div>
          );
        })()}

        {/* Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>Date souhaitée de livraison *</span>
            </label>
            <input
              type="date"
              required
              value={formData.desiredDeliveryDate || ''}
              onChange={(e) => setFormData({ ...formData, desiredDeliveryDate: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-rose-400" />
              <span>Date limite critique (Optionnel)</span>
            </label>
            <input
              type="text"
              placeholder="Ex: Avant envoi imprimerie le 12"
              value={formData.criticalDeadline || ''}
              onChange={(e) => setFormData({ ...formData, criticalDeadline: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Acceptation des conditions */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <label className="flex items-start space-x-3 cursor-pointer group">
            <div className={`mt-0.5 w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
              formData.acceptProcess ? 'bg-amber-400 border-amber-400 text-slate-950' : 'bg-slate-950 border-slate-700 text-transparent'
            }`}>
              <CheckSquare className="w-3 h-3" />
            </div>
            <input
              type="checkbox"
              checked={formData.acceptProcess || false}
              onChange={(e) => setFormData({ ...formData, acceptProcess: e.target.checked })}
              className="hidden"
            />
            <span className="text-[11px] text-slate-300 leading-relaxed group-hover:text-slate-200">
              <strong>Processus de création :</strong> Je confirme l'exactitude des informations fournies et comprends que la réception de ce brief ne constitue pas une validation finale de commande avant signature du devis.
            </span>
          </label>

          <label className="flex items-start space-x-3 cursor-pointer group">
            <div className={`mt-0.5 w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
              formData.acceptDeadlines ? 'bg-amber-400 border-amber-400 text-slate-950' : 'bg-slate-950 border-slate-700 text-transparent'
            }`}>
              <CheckSquare className="w-3 h-3" />
            </div>
            <input
              type="checkbox"
              checked={formData.acceptDeadlines || false}
              onChange={(e) => setFormData({ ...formData, acceptDeadlines: e.target.checked })}
              className="hidden"
            />
            <span className="text-[11px] text-slate-300 leading-relaxed group-hover:text-slate-200">
              <strong>Délais :</strong> J'accepte que les délais de création (3 à 7 jours) débutent uniquement après la réception de l'avance (50%) et la fourniture de tous les fichiers requis (Logos HD, textes validés).
            </span>
          </label>
        </div>
      </div>
    </motion.div>
  );
};
