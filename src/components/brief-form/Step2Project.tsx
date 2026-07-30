import React from 'react';
import { motion } from 'framer-motion';
import { Layers, CheckCircle2 } from 'lucide-react';
import { BriefData } from '../../types';
import { PROJECT_TYPES } from './constants';

interface Step2ProjectProps {
  formData: Partial<BriefData>;
  setFormData: (data: Partial<BriefData>) => void;
  direction: number;
  stepVariants: any;
}

export const Step2Project: React.FC<Step2ProjectProps> = ({ formData, setFormData, direction, stepVariants }) => {
  return (
    <motion.div
      key="step-2"
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
          <Layers className="w-5 h-5 text-amber-400" />
          <span>2. Choix du Support Visuel & Contexte</span>
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Choisissez le livrable principal que vous désirez commander.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {PROJECT_TYPES.map((type) => {
          const isSelected = formData.projectType === type.id;
          return (
            <div
              key={type.id}
              onClick={() => setFormData({ ...formData, projectType: type.id })}
              className={`p-4 rounded-2xl cursor-pointer border transition-all flex flex-col justify-between space-y-2 ${
                isSelected
                  ? 'bg-amber-500/10 border-amber-400 shadow-lg ring-1 ring-amber-400'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">{type.icon}</span>
                {isSelected && <CheckCircle2 className="w-5 h-5 text-amber-400" />}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-100">{type.label}</h4>
                <p className="text-[11px] text-slate-400 mt-1">{type.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {formData.projectType === 'autre' && (
        <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/50 space-y-2">
          <label className="text-xs font-bold text-amber-300">
            Précisez votre besoin spécifique *
          </label>
          <input
            type="text"
            placeholder="Ex: Badge événementiel, Roll-up, Kakemono..."
            value={formData.projectTypeCustom || ''}
            onChange={(e) => setFormData({ ...formData, projectTypeCustom: e.target.value })}
            className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:border-amber-400 focus:outline-none"
          />
        </div>
      )}

      {/* Context & Objective */}
      <div className="space-y-3 pt-2">
        <label className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
          Contexte & Objectif de l'événement (Optionnel)
        </label>
        <textarea
          rows={3}
          placeholder="Ex: C'est la 12ème édition de notre Ziarra annuelle. Objectif : Réunir les fidèles et communiquer le programme..."
          value={formData.contextDescription || ''}
          onChange={(e) => setFormData({ ...formData, contextDescription: e.target.value })}
          className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:border-amber-500 focus:outline-none transition-colors"
        />
      </div>
    </motion.div>
  );
};
