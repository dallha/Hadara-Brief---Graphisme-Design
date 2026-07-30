import React from 'react';
import { motion } from 'framer-motion';
import { Palette, Upload, X } from 'lucide-react';
import { BriefData } from '../../types';
import { STYLE_OPTIONS } from './constants';

interface Step4StyleProps {
  formData: Partial<BriefData>;
  setFormData: (data: Partial<BriefData>) => void;
  direction: number;
  stepVariants: any;
}

export const Step4Style: React.FC<Step4StyleProps> = ({ formData, setFormData, direction, stepVariants }) => {
  const handleStyleToggle = (styleId: string) => {
    const currentStyles = formData.stylePreferences || [];
    if (currentStyles.includes(styleId as any)) {
      setFormData({ ...formData, stylePreferences: currentStyles.filter(s => s !== styleId) });
    } else {
      setFormData({ ...formData, stylePreferences: [...currentStyles, styleId as any] });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB limit
      const validFiles = Array.from(e.target.files).filter(f => {
        if (f.size > MAX_SIZE_BYTES) {
          alert(`Le fichier "${f.name}" dépasse la limite maximale de 5 Mo.`);
          return false;
        }
        return true;
      });

      const newFiles = validFiles.map(f => ({
        id: Math.random().toString(36).substr(2, 9),
        name: f.name,
        size: f.size,
        type: f.type,
      }));
      setFormData({
        ...formData,
        attachments: [...(formData.attachments || []), ...newFiles]
      });
    }
  };

  const removeAttachment = (id: string) => {
    setFormData({
      ...formData,
      attachments: (formData.attachments || []).filter(a => a.id !== id)
    });
  };

  return (
    <motion.div
      key="step-4"
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
          <Palette className="w-5 h-5 text-amber-400" />
          <span>4. Direction Artistique & Pièces Jointes</span>
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Définissez l'ambiance graphique désirée et joignez vos visuels (Logos, Photos, Fichiers).
        </p>
      </div>

      {/* Style Selection */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
          Style graphique souhaité :
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {STYLE_OPTIONS.map((style) => {
            const isChecked = (formData.stylePreferences || []).includes(style.id as any);
            return (
              <div
                key={style.id}
                onClick={() => handleStyleToggle(style.id)}
                className={`p-3 rounded-xl cursor-pointer border transition-all flex items-start space-x-2.5 ${
                  isChecked
                    ? 'bg-emerald-950 border-amber-400 text-slate-100'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => {}}
                  className="mt-0.5 rounded accent-amber-400 w-4 h-4"
                />
                <div>
                  <p className="text-xs font-bold text-slate-200">{style.label}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{style.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Color Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Couleurs préférées
            </label>
            <input
              type="text"
              placeholder="Ex: Vert émeraude, Doré, Blanc"
              value={formData.preferredColors || ''}
              onChange={(e) => setFormData({ ...formData, preferredColors: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Couleurs à éviter
            </label>
            <input
              type="text"
              placeholder="Ex: Rouge vif, Rose"
              value={formData.avoidColors || ''}
              onChange={(e) => setFormData({ ...formData, avoidColors: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Attachments / References */}
      <div className="space-y-4 pt-2">
        <div className="border-t border-slate-800 pt-4">
          <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2 mb-2">
            <Upload className="w-4 h-4 text-amber-400" />
            <span>Joindre vos logos, photos ou documentations (Word, PDF, PNG)</span>
          </label>

          <div className="border-2 border-dashed border-slate-800 hover:border-emerald-500/50 rounded-2xl p-5 text-center bg-slate-950 transition-colors">
            <p className="text-xs text-slate-300 font-semibold">
              Sélectionnez vos fichiers (Logo Dahira, Photo Conférenciers, etc.)
            </p>
            <p className="text-[10px] text-slate-500 mt-1">
              Format PNG, JPG, PDF, Word. Max 10Mo par fichier.
            </p>
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload-input"
            />
            <label
              htmlFor="file-upload-input"
              className="mt-3 inline-block px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs cursor-pointer"
            >
              Parcourir mes fichiers
            </label>
          </div>

          {(formData.attachments && formData.attachments.length > 0) && (
            <div className="space-y-2 pt-3">
              <p className="text-xs font-bold text-emerald-400">
                {formData.attachments.length} fichier(s) joint(s) :
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {formData.attachments.map((file) => (
                  <div
                    key={file.id}
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="truncate pr-2">
                      <p className="font-bold text-slate-200 truncate">{file.name}</p>
                      <p className="text-[10px] text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(file.id)}
                      className="p-1 rounded text-rose-400 hover:bg-rose-950"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
