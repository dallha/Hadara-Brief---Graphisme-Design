import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';
import { BriefData, ProjectType, StylePreference, TechnicalFormat, BudgetRange, FileAttachment } from '../types';

import { STEP_DEFINITIONS } from './brief-form/constants';
import { Step1Contact } from './brief-form/Step1Contact';
import { Step2Project } from './brief-form/Step2Project';
import { Step3Message } from './brief-form/Step3Message';
import { Step4Style } from './brief-form/Step4Style';
import { Step5Validation } from './brief-form/Step5Validation';

interface BriefFormProps {
  onSubmitBrief: (brief: Omit<BriefData, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  isSubmitting: boolean;
  onCancel?: () => void;
}

const stepVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? 50 : -50, opacity: 0 }),
  center: { zIndex: 1, x: 0, opacity: 1 },
  exit: (direction: number) => ({ zIndex: 0, x: direction < 0 ? 50 : -50, opacity: 0 })
};

export const BriefForm: React.FC<BriefFormProps> = ({
  onSubmitBrief,
  isSubmitting,
  onCancel,
}) => {
  const [currentSection, setCurrentSection] = useState<number>(1);
  const [direction, setDirection] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const formTopRef = useRef<HTMLDivElement>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<BriefData>>({
    clientName: '',
    organization: '',
    whatsapp: '',
    email: '',
    cityCountry: 'Dakar, Sénégal',
    projectType: 'affiche',
    projectTypeCustom: '',
    contextDescription: '',
    primaryObjective: 'Valoriser la Hadara, réunir la communauté et transmettre les informations claires.',
    targetAudience: '',
    targetAudienceChips: ['Disciples & Talibés', 'Familles'],
    mainTitle: '',
    fullTextContent: '',
    stylePreferences: ['spirituel', 'luxueux'],
    preferredColors: 'Vert émeraude, Doré, Blanc',
    avoidColors: 'Rouge néon',
    technicalFormat: 'A3_A4',
    customDimensions: '',
    usageType: 'both',
    budgetRange: 'sur_devis',
    desiredDeliveryDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
    criticalDeadline: '',
    referenceLinks: '',
    attachments: [],
    acceptProcess: false,
    acceptDeadlines: false,
  });

  const validateCurrentSection = (targetStep?: number): boolean => {
    setErrorMessage(null);
    if (currentSection === 1 || (targetStep && targetStep > 1)) {
      if (!formData.clientName?.trim()) { setErrorMessage('Veuillez saisir votre Nom complet.'); return false; }
      if (!formData.whatsapp?.trim()) { setErrorMessage('Veuillez saisir votre numéro WhatsApp.'); return false; }
    }
    if (currentSection === 2 || (targetStep && targetStep > 2)) {
      if (formData.projectType === 'autre' && !formData.projectTypeCustom?.trim()) {
        setErrorMessage('Veuillez préciser votre projet.'); return false;
      }
    }
    if (currentSection === 3 || (targetStep && targetStep > 3)) {
      if (!formData.mainTitle?.trim()) { setErrorMessage('Veuillez saisir le titre principal.'); return false; }
    }
    if (currentSection === 5 || (targetStep && targetStep === 5)) {
      if (currentSection === 5) {
        if (!formData.acceptProcess || !formData.acceptDeadlines) {
          setErrorMessage('Veuillez cocher les conditions pour soumettre.'); return false;
        }
      }
    }
    return true;
  };

  const setStep = (newStep: number) => {
    if (newStep > currentSection && !validateCurrentSection(newStep)) return;
    setDirection(newStep > currentSection ? 1 : -1);
    setCurrentSection(newStep);
    setTimeout(() => {
      formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const handleNextSection = () => setStep(currentSection + 1);
  const handlePrevSection = () => setStep(currentSection - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCurrentSection()) return;
    try {
      await onSubmitBrief(formData as Omit<BriefData, 'id' | 'createdAt' | 'status'>);
    } catch (err: any) {
      setErrorMessage("Une erreur est survenue lors de l'envoi du brief.");
    }
  };

  const setFormDataWrapper = (newData: Partial<BriefData>) => {
    setFormData(newData);
  };

  return (
    <div ref={formTopRef} className="max-w-4xl mx-auto space-y-6 pb-16 pt-8">
      {/* Header Banner & Step Progress Bar */}
      <div className="p-6 sm:p-8 rounded-[2rem] bg-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-slate-400/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold font-mono text-base shadow-inner">
              {currentSection}/5
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-500">Briefing Créatif</span>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-100">
                {STEP_DEFINITIONS[currentSection - 1].label}
              </h2>
            </div>
          </div>

          {onCancel && (
            <button 
              type="button"
              onClick={onCancel}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors border border-slate-700/50"
              title="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* 5-Step Interactive Navigation Pills */}
        <div className="flex sm:grid sm:grid-cols-5 gap-2 relative z-10 overflow-x-auto pb-2 scrollbar-hide">
          {STEP_DEFINITIONS.map((s) => {
            const IconComp = s.icon;
            const isDone = s.step < currentSection;
            const isCurrent = s.step === currentSection;

            return (
              <button
                key={s.step}
                type="button"
                onClick={() => setStep(s.step)}
                className={`p-3 rounded-2xl font-bold transition-all flex flex-col items-center justify-center gap-1.5 text-center relative overflow-hidden ${
                  isCurrent
                    ? 'bg-amber-400 text-slate-950 shadow-lg ring-2 ring-amber-300'
                    : isDone
                    ? 'bg-slate-800/80 text-amber-400 border border-amber-500/20 hover:bg-slate-800'
                    : 'bg-slate-900/50 text-slate-500 border border-slate-800 hover:text-slate-300'
                }`}
              >
                {isDone && !isCurrent && (
                   <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/5 to-transparent pointer-events-none" />
                )}
                <IconComp className="w-4 h-4 shrink-0" />
                <span className="text-[10px] sm:text-xs truncate max-w-[60px] sm:max-w-none">{s.short}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Error Alert Box */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center space-x-3 text-sm"
          >
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
            <span>{errorMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form Container */}
      <div className="p-4 sm:p-10 rounded-[2rem] bg-slate-900/60 border border-slate-800/80 backdrop-blur-md shadow-2xl relative">
        <form onSubmit={handleSubmit} className="relative min-h-[400px]">
          <AnimatePresence mode="wait" custom={direction}>
            {currentSection === 1 && <Step1Contact formData={formData} setFormData={setFormDataWrapper} direction={direction} stepVariants={stepVariants} />}
            {currentSection === 2 && <Step2Project formData={formData} setFormData={setFormDataWrapper} direction={direction} stepVariants={stepVariants} />}
            {currentSection === 3 && <Step3Message formData={formData} setFormData={setFormDataWrapper} direction={direction} stepVariants={stepVariants} />}
            {currentSection === 4 && <Step4Style formData={formData} setFormData={setFormDataWrapper} direction={direction} stepVariants={stepVariants} />}
            {currentSection === 5 && <Step5Validation formData={formData} setFormData={setFormDataWrapper} direction={direction} stepVariants={stepVariants} />}
          </AnimatePresence>
        </form>

        {/* Buttons Nav */}
        <div className="mt-8 pt-4 flex flex-col-reverse sm:flex-row items-center justify-between gap-3 border-t border-slate-800">
          <button
            type="button"
            onClick={handlePrevSection}
            disabled={currentSection === 1}
            className={`w-full sm:w-auto px-5 py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
              currentSection === 1
                ? 'opacity-0 pointer-events-none'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Précédent</span>
          </button>

          {currentSection < 5 ? (
            <button
              type="button"
              onClick={handleNextSection}
              className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs bg-amber-400 hover:bg-amber-300 text-slate-950 transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95"
            >
              <span>Étape Suivante</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.acceptProcess || !formData.acceptDeadlines}
              className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 active:scale-95 ${
                isSubmitting || !formData.acceptProcess || !formData.acceptDeadlines
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
              }`}
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              <span>{isSubmitting ? 'Envoi en cours...' : 'Envoyer mon Brief'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
