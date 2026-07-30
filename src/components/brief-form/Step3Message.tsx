import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import { BriefData } from '../../types';

interface Step3MessageProps {
  formData: Partial<BriefData>;
  setFormData: (data: Partial<BriefData>) => void;
  direction: number;
  stepVariants: any;
}

export const Step3Message: React.FC<Step3MessageProps> = ({ formData, setFormData, direction, stepVariants }) => {
  const handleChipToggle = (chip: string) => {
    const currentChips = formData.targetAudienceChips || [];
    if (currentChips.includes(chip)) {
      setFormData({ ...formData, targetAudienceChips: currentChips.filter(c => c !== chip) });
    } else {
      setFormData({ ...formData, targetAudienceChips: [...currentChips, chip] });
    }
  };

  return (
    <motion.div
      key="step-3"
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
          <MessageSquare className="w-5 h-5 text-amber-400" />
          <span>3. Titre Principal & Textes de l'Affiche</span>
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Indiquez le titre majeur en grandes lettres et l'ensemble des textes à imprimer.
        </p>
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between">
            <span>Titre principal / Slogan (Grandes Lettres) *</span>
            <span className="text-amber-400 text-[10px]">Obligatoire</span>
          </label>
          <input
            type="text"
            required
            placeholder="Ex: GRAND GAMOU ANNUEL HADARA 2026"
            value={formData.mainTitle || ''}
            onChange={(e) => setFormData({ ...formData, mainTitle: e.target.value })}
            className="w-full p-4 rounded-2xl bg-slate-950 border border-amber-500/50 text-slate-100 font-bold text-lg focus:border-amber-400 focus:outline-none transition-colors shadow-inner"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Texte complet à afficher (Thème, Intervenants, Dates, Lieu, Contacts)
          </label>
          <textarea
            rows={6}
            placeholder={`Copiez-collez votre texte ici :\n- Thème : L'Éducation & la spiritualité\n- Sous le haut patronage de : Cheikh...\n- Conférencier : Serigne...\n- Date : Samedi 15 Août 2026 à 16h\n- Lieu : Esplanade Grande Mosquée, Dakar\n- Contact WhatsApp : 77 000 00 00`}
            value={formData.fullTextContent || ''}
            onChange={(e) => setFormData({ ...formData, fullTextContent: e.target.value })}
            className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 text-slate-100 text-sm font-mono focus:border-amber-500 focus:outline-none transition-colors"
          />
        </div>

        {/* Target Audience */}
        <div className="space-y-3 pt-2">
          <label className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
            Public visé / Cibles privilégiées :
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              'Disciples & Talibés',
              'Dignitaires Religieux',
              'Jeunes & Étudiants',
              'Entrepreneurs & Partenaires',
              'Familles',
              'Femmes & Dahira Féminin',
              'Grand Public'
            ].map((chip) => {
              const isChecked = (formData.targetAudienceChips || []).includes(chip);
              return (
                <button
                  key={chip}
                  type="button"
                  onClick={() => handleChipToggle(chip)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isChecked
                      ? 'bg-amber-400 text-slate-950 font-bold'
                      : 'bg-slate-950 text-slate-300 border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {chip} {isChecked ? '✓' : '+'}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
