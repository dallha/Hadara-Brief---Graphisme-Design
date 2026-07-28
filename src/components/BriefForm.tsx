import React, { useState } from 'react';
import { 
  User, 
  Building, 
  Phone, 
  Mail, 
  MapPin, 
  Palette, 
  FileText, 
  Target, 
  Users, 
  MessageSquare, 
  Image as ImageIcon, 
  CheckSquare, 
  Calendar, 
  Clock, 
  DollarSign, 
  Upload, 
  Link as LinkIcon, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  AlertCircle,
  X,
  FileCode,
  Layers
} from 'lucide-react';
import { 
  BriefData, 
  ProjectType, 
  StylePreference, 
  TechnicalFormat, 
  BudgetRange, 
  FileAttachment 
} from '../types';

interface BriefFormProps {
  onSubmitBrief: (brief: Omit<BriefData, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  isSubmitting: boolean;
  onCancel?: () => void;
}

const PROJECT_TYPES: { id: ProjectType; label: string; desc: string; icon: string }[] = [
  { id: 'affiche', label: 'Affiche événementielle', desc: 'Ziarra, Gamou, Conférence, Causerie', icon: '🖼️' },
  { id: 'bache', label: 'Bâche / Banderole', desc: 'Grand format pour scène ou façade', icon: '🚩' },
  { id: 'flyer', label: 'Flyer (A5 / A6)', desc: 'Programme, horaires, tract impression', icon: '📄' },
  { id: 'identite_visuelle', label: 'Identité Visuelle / Logo', desc: 'Logo Dahira, charte & marque', icon: '✨' },
  { id: 'pack_starter', label: 'Pack "Starter"', desc: 'Affiche + Visuel Réseaux Sociaux', icon: '🚀' },
  { id: 'pack_event', label: 'Pack "Event Global"', desc: 'Affiche + Bâche + Flyer + Story IG', icon: '👑' },
  { id: 'autre', label: 'Autre projet sur mesure', desc: 'Besoin spécifique', icon: '⚙️' },
];

const STYLE_OPTIONS: { id: StylePreference; label: string; desc: string }[] = [
  { id: 'spirituel', label: 'Spirituel & Religieux', desc: 'Motifs orientaux, dorures, arabesques fines, solennel' },
  { id: 'luxueux', label: 'Luxueux & Premium', desc: 'Orfèvrerie, contrastes sombres, typographie royale' },
  { id: 'moderne', label: 'Moderne & Dynamique', desc: 'Lignes épurées, couleurs vives, mise en page actuelle' },
  { id: 'traditionnel', label: 'Traditionnel Local', desc: 'Références culturelles, tonalités chaleureuses' },
  { id: 'classique', label: 'Classique Sobriété', desc: 'Structure académique, grande clarté de lecture' },
  { id: 'minimaliste', label: 'Minimaliste & Épuré', desc: 'Moins d’éléments, focus absolu sur le message' },
];

const FORMAT_OPTIONS: { id: TechnicalFormat; label: string; desc: string }[] = [
  { id: 'A3_A4', label: 'Affiche A3 / A4 HD', desc: 'Standard impression & numérique' },
  { id: 'bache_3x1', label: 'Bâche Grand Format (ex: 3m x 1.5m)', desc: 'Optimisé œillets & grand tirage' },
  { id: 'flyer_A5', label: 'Flyer A5 Recto / Verso', desc: 'Format poche distribution' },
  { id: 'post_RS', label: 'Post Réseaux Sociaux (1:1 / 4:5)', desc: 'Instagram, WhatsApp, Facebook' },
  { id: 'story_vertical', label: 'Story & Reels (9:16 Vertical)', desc: 'Plein écran smartphone' },
  { id: 'sur_mesure', label: 'Dimensions personnalisées', desc: 'Préciser les mesures exactes' },
];

const BUDGET_OPTIONS: { id: BudgetRange; label: string; desc: string }[] = [
  { id: 'sur_devis', label: 'Demander un devis au graphiste (Sur mesure)', desc: 'Analyse gratuite de votre brief et envoi d’un devis FCFA personnalisé' },
  { id: '30k-50k', label: 'Budget indicatif : 30 000 – 50 000 FCFA', desc: 'Pour affiche simple, flyer ou visuel unique' },
  { id: '50k-80k', label: 'Budget indicatif : 50 000 – 80 000 FCFA', desc: 'Pour bâche grand format ou Pack Starter' },
  { id: '80k-120k', label: 'Budget indicatif : 80 000 – 120 000 FCFA', desc: 'Pour Pack Event complet ou Identité Visuelle' },
];

const STEP_DEFINITIONS = [
  { step: 1, label: '1. Contact Client', short: 'Contact', icon: User },
  { step: 2, label: '2. Choix du Projet', short: 'Projet', icon: Layers },
  { step: 3, label: '3. Titre & Contenu', short: 'Message', icon: MessageSquare },
  { step: 4, label: '4. Style & Fichiers', short: 'Style', icon: Palette },
  { step: 5, label: '5. Devis & Valider', short: 'Validation', icon: CheckCircle2 },
];

export const BriefForm: React.FC<BriefFormProps> = ({
  onSubmitBrief,
  isSubmitting,
  onCancel,
}) => {
  const [currentSection, setCurrentSection] = useState<number>(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    clientName: '',
    organization: '',
    whatsapp: '',
    email: '',
    cityCountry: 'Dakar, Sénégal',
    projectType: 'affiche' as ProjectType,
    projectTypeCustom: '',
    contextDescription: '',
    primaryObjective: 'Valoriser la Hadara, réunir la communauté et transmettre les informations claires.',
    targetAudience: '',
    targetAudienceChips: ['Disciples & Talibés', 'Familles'],
    mainTitle: '',
    fullTextContent: '',
    stylePreferences: ['spirituel', 'luxueux'] as StylePreference[],
    preferredColors: 'Vert émeraude, Doré, Blanc',
    avoidColors: 'Rouge néon',
    technicalFormat: 'A3_A4' as TechnicalFormat,
    customDimensions: '',
    usageType: 'both' as 'print' | 'web' | 'both',
    budgetRange: 'sur_devis' as BudgetRange,
    desiredDeliveryDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
    criticalDeadline: '',
    referenceLinks: '',
    attachments: [] as FileAttachment[],
    acceptProcess: false,
    acceptDeadlines: false,
  });

  const handleChipToggle = (chip: string) => {
    setFormData((prev) => {
      const exists = prev.targetAudienceChips.includes(chip);
      return {
        ...prev,
        targetAudienceChips: exists
          ? prev.targetAudienceChips.filter((c) => c !== chip)
          : [...prev.targetAudienceChips, chip],
      };
    });
  };

  const handleStyleToggle = (style: StylePreference) => {
    setFormData((prev) => {
      const exists = prev.stylePreferences.includes(style);
      return {
        ...prev,
        stylePreferences: exists
          ? prev.stylePreferences.filter((s) => s !== style)
          : [...prev.stylePreferences, style],
      };
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const fileList: File[] = Array.from(e.target.files);

    fileList.forEach((file: File) => {
      if (file.size > 10 * 1024 * 1024) {
        alert(`Le fichier ${file.name} dépasse la limite de 10Mo.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const newAttachment: FileAttachment = {
          id: 'file-' + Math.random().toString(36).substring(2, 9),
          name: file.name,
          type: file.type,
          size: file.size,
          dataUrl: reader.result as string,
        };
        setFormData((prev) => ({
          ...prev,
          attachments: [...prev.attachments, newAttachment],
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAttachment = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((f) => f.id !== id),
    }));
  };

  const validateCurrentSection = (targetStep?: number): boolean => {
    setErrorMessage(null);

    // Step 1 validation (Contact)
    if (currentSection === 1 || (targetStep && targetStep > 1)) {
      if (!formData.clientName.trim()) {
        setErrorMessage('Veuillez saisir votre Nom complet à l’étape 1.');
        return false;
      }
      if (!formData.whatsapp.trim()) {
        setErrorMessage('Veuillez saisir votre numéro WhatsApp à l’étape 1.');
        return false;
      }
    }

    // Step 2 validation (Projet)
    if (currentSection === 2 || (targetStep && targetStep > 2)) {
      if (formData.projectType === 'autre' && !formData.projectTypeCustom.trim()) {
        setErrorMessage('Veuillez préciser votre projet personnalisé à l’étape 2.');
        return false;
      }
    }

    // Step 3 validation (Titre & Message)
    if (currentSection === 3 || (targetStep && targetStep > 3)) {
      if (!formData.mainTitle.trim()) {
        setErrorMessage('Veuillez saisir le titre principal du visuel à l’étape 3.');
        return false;
      }
    }

    // Step 5 validation (Final submission)
    if (currentSection === 5 || (targetStep && targetStep === 5)) {
      if (currentSection === 5) {
        if (!formData.acceptProcess || !formData.acceptDeadlines) {
          setErrorMessage('Veuillez cocher les deux cases de confirmation pour soumettre le brief.');
          return false;
        }
      }
    }

    return true;
  };

  const handleNextSection = () => {
    if (validateCurrentSection(currentSection + 1)) {
      if (currentSection < 5) {
        setCurrentSection((prev) => prev + 1);
        window.scrollTo({ top: 100, behavior: 'smooth' });
      }
    }
  };

  const handlePrevSection = () => {
    if (currentSection > 1) {
      setErrorMessage(null);
      setCurrentSection((prev) => prev - 1);
      window.scrollTo({ top: 100, behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCurrentSection()) return;

    try {
      await onSubmitBrief({
        ...formData,
      });
    } catch (err: any) {
      setErrorMessage("Une erreur est survenue lors de l'envoi du brief.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      
      {/* Header Banner & Step Progress Bar */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-5 relative overflow-hidden backdrop-blur-md">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold font-mono text-sm">
              {currentSection}/5
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400">Briefing Créatif Express</span>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-100">
                {STEP_DEFINITIONS[currentSection - 1].label}
              </h2>
            </div>
          </div>

          {onCancel && (
            <button 
              onClick={onCancel}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
              title="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Dynamic Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span>Progression du formulaire</span>
            <span className="font-bold font-mono text-amber-400">{Math.round((currentSection / 5) * 100)}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-700/50">
            <div 
              className="bg-amber-400 h-full rounded-full transition-all duration-300 shadow-sm"
              style={{ width: `${(currentSection / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* 5-Step Interactive Navigation Pills */}
        <div className="grid grid-cols-5 gap-1.5 pt-1 text-xs">
          {STEP_DEFINITIONS.map((s) => {
            const IconComp = s.icon;
            const isDone = s.step < currentSection;
            const isCurrent = s.step === currentSection;

            return (
              <button
                key={s.step}
                type="button"
                onClick={() => {
                  if (s.step < currentSection || validateCurrentSection(s.step)) {
                    setCurrentSection(s.step);
                    window.scrollTo({ top: 100, behavior: 'smooth' });
                  }
                }}
                className={`p-2 sm:p-2.5 rounded-xl font-bold transition-all flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-1.5 text-center ${
                  isCurrent
                    ? 'bg-amber-400 text-slate-950 shadow-md ring-2 ring-amber-300'
                    : isDone
                    ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-800/80 hover:bg-emerald-900'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <IconComp className="w-3.5 h-3.5 shrink-0" />
                <span className="text-[10px] sm:text-xs truncate">{s.short}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Error Alert Box */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-800/80 text-rose-200 flex items-center space-x-3 text-sm animate-shake">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="p-6 sm:p-10 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md shadow-2xl space-y-8">
        
        {/* ================= ÉTAPE 1 : CONTACT CLIENT ================= */}
        {currentSection === 1 && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
                <User className="w-5 h-5 text-amber-400" />
                <span>1. Vos Coordonnées Client</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Ces informations permettent au graphiste de vous identifier et de vous répondre rapidement.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Nom complet *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="Ex: Cheikh Ndoye"
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Organisation / Dahira / Structure
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    placeholder="Ex: Dahira Mouhsine de Dakar"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Téléphone WhatsApp *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    required
                    placeholder="Ex: +221 77 123 45 67"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Ville / Pays
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    placeholder="Ex: Dakar, Sénégal"
                    value={formData.cityCountry}
                    onChange={(e) => setFormData({ ...formData, cityCountry: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Adresse Email (Optionnel)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    placeholder="Ex: client@exemple.sn"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= ÉTAPE 2 : CHOIX DU PROJET & CONTEXTE ================= */}
        {currentSection === 2 && (
          <div className="space-y-6">
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
                    className={`p-3.5 rounded-2xl cursor-pointer border transition-all flex flex-col justify-between space-y-2 ${
                      isSelected
                        ? 'bg-emerald-950/80 border-amber-400 shadow-lg ring-1 ring-amber-400'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xl">{type.icon}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-100">{type.label}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">{type.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {formData.projectType === 'autre' && (
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-amber-500/50 space-y-1.5">
                <label className="text-xs font-bold text-amber-300">
                  Précisez votre besoin spécifique *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Badge événementiel, Roll-up, Kakemono..."
                  value={formData.projectTypeCustom}
                  onChange={(e) => setFormData({ ...formData, projectTypeCustom: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:border-amber-400 focus:outline-none"
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
                value={formData.contextDescription}
                onChange={(e) => setFormData({ ...formData, contextDescription: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* ================= ÉTAPE 3 : TITRE & TEXTES DU VISUEL ================= */}
        {currentSection === 3 && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-amber-400" />
                <span>3. Titre Principal & Textes de l'Affiche</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Indiquez le titre majeur en grandes lettres et l'ensemble des textes à imprimer.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between">
                  <span>Titre principal / Slogan (Grandes Lettres) *</span>
                  <span className="text-amber-400 text-[10px]">Obligatoire</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: GRAND GAMOU ANNUEL HADARA 2026"
                  value={formData.mainTitle}
                  onChange={(e) => setFormData({ ...formData, mainTitle: e.target.value })}
                  className="w-full p-3.5 rounded-xl bg-slate-950 border border-amber-500/60 text-slate-100 font-bold text-base focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Texte complet à afficher (Thème, Intervenants, Dates, Lieu, Contacts)
                </label>
                <textarea
                  rows={6}
                  placeholder={`Copiez-collez votre texte ici :
- Thème : L'Éducation & la spiritualité
- Sous le haut patronage de : Cheikh...
- Conférencier : Serigne...
- Date : Samedi 15 Août 2026 à 16h
- Lieu : Esplanade Grande Mosquée, Dakar
- Contact WhatsApp : 77 000 00 00`}
                  value={formData.fullTextContent}
                  onChange={(e) => setFormData({ ...formData, fullTextContent: e.target.value })}
                  className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs font-mono focus:border-amber-500 focus:outline-none"
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
                    const isChecked = formData.targetAudienceChips.includes(chip);
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
          </div>
        )}

        {/* ================= ÉTAPE 4 : STYLE, COULEURS & FICHIERS ================= */}
        {currentSection === 4 && (
          <div className="space-y-6">
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
                  const isChecked = formData.stylePreferences.includes(style.id);
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
                        className="mt-0.5 rounded accent-amber-400"
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
                    value={formData.preferredColors}
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
                    value={formData.avoidColors}
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

                {formData.attachments.length > 0 && (
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
          </div>
        )}

        {/* ================= ÉTAPE 5 : FORMAT, DEVIS, DÉLAIS & VALIDATION ================= */}
        {currentSection === 5 && (
          <div className="space-y-6">
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
                      onClick={() => setFormData({ ...formData, technicalFormat: format.id })}
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
                        onClick={() => setFormData({ ...formData, budgetRange: b.id })}
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
                    value={formData.desiredDeliveryDate}
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
                    value={formData.criticalDeadline}
                    onChange={(e) => setFormData({ ...formData, criticalDeadline: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Terms Acceptance */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-900/60 space-y-3 pt-4">
                <p className="font-bold text-xs text-amber-400">Confirmation du dossier client :</p>
                
                <label className="flex items-start space-x-3 cursor-pointer p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700">
                  <input
                    type="checkbox"
                    required
                    checked={formData.acceptProcess}
                    onChange={(e) => setFormData({ ...formData, acceptProcess: e.target.checked })}
                    className="mt-1 w-4 h-4 rounded accent-amber-400"
                  />
                  <span className="text-[11px] text-slate-300 leading-relaxed">
                    <strong>Processus de création :</strong> J'ai pris connaissance qu'un devis définitif sera transmis sous 24h, et qu'un acompte de 50% valide le démarrage des travaux graphiques. *
                  </span>
                </label>

                <label className="flex items-start space-x-3 cursor-pointer p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700">
                  <input
                    type="checkbox"
                    required
                    checked={formData.acceptDeadlines}
                    onChange={(e) => setFormData({ ...formData, acceptDeadlines: e.target.checked })}
                    className="mt-1 w-4 h-4 rounded accent-amber-400"
                  />
                  <span className="text-[11px] text-slate-300 leading-relaxed">
                    <strong>Exactitude des informations :</strong> Je certifie que les textes et informations fournis sont exacts. *
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Control Bar */}
        <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
          {currentSection > 1 ? (
            <button
              type="button"
              onClick={handlePrevSection}
              className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Précédent</span>
            </button>
          ) : (
            <div />
          )}

          {currentSection < 5 ? (
            <button
              type="button"
              onClick={handleNextSection}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-emerald-400 text-slate-950 text-xs font-bold transition-all hover:brightness-110 flex items-center space-x-2 shadow-lg"
            >
              <span>Étape suivante ({currentSection + 1}/5)</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-emerald-500 text-slate-950 font-extrabold text-sm shadow-xl hover:brightness-110 transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Enregistrement en cours...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 text-slate-950" />
                  <span>Soumettre le Brief Créatif</span>
                </>
              )}
            </button>
          )}
        </div>

      </form>
    </div>
  );
};
