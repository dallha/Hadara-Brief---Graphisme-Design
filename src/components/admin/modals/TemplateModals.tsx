import React, { useState, useEffect } from 'react';
import { X, BookOpen, Zap } from 'lucide-react';
import { BriefTemplate, ProjectType, TechnicalFormat, BriefData } from '../../../types';

interface TemplateModalsProps {
  isTemplateModalOpen: boolean;
  setIsTemplateModalOpen: (val: boolean) => void;
  editingTemplate: BriefTemplate | null;
  setEditingTemplate: (val: BriefTemplate | null) => void;
  selectedTemplateForGen: BriefTemplate | null;
  setSelectedTemplateForGen: (val: BriefTemplate | null) => void;
  onSaveTemplate?: (template: Omit<BriefTemplate, 'id'> | BriefTemplate) => void;
  onAddNewBriefDirectly?: (briefData: Omit<BriefData, 'id' | 'createdAt' | 'status'>) => Promise<void>;
}

export const TemplateModals: React.FC<TemplateModalsProps> = ({
  isTemplateModalOpen,
  setIsTemplateModalOpen,
  editingTemplate,
  setEditingTemplate,
  selectedTemplateForGen,
  setSelectedTemplateForGen,
  onSaveTemplate,
  onAddNewBriefDirectly
}) => {
  const [templateForm, setTemplateForm] = useState<Partial<BriefTemplate>>({
    title: '', category: 'Autre', suggestedPriceFCFA: 0, description: '', projectType: 'affiche', technicalFormat: 'A3_A4', defaultMainTitle: '', defaultStylePreferences: [], defaultUsageType: 'both', requiredAssets: []
  });

  const [quickGenForm, setQuickGenForm] = useState({
    clientName: '', whatsapp: ''
  });
  const [isSubmittingQuickGen, setIsSubmittingQuickGen] = useState(false);

  useEffect(() => {
    if (editingTemplate) {
      setTemplateForm(editingTemplate);
    } else {
      setTemplateForm({
        title: '', category: 'Autre', suggestedPriceFCFA: 0, description: '', projectType: 'affiche', technicalFormat: 'A3_A4', defaultMainTitle: '', defaultStylePreferences: [], defaultUsageType: 'both', requiredAssets: []
      });
    }
  }, [editingTemplate, isTemplateModalOpen]);

  const handleSaveTemplateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSaveTemplate) onSaveTemplate(templateForm as BriefTemplate);
    setIsTemplateModalOpen(false);
    setEditingTemplate(null);
  };

  const handleQuickGenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplateForGen || !onAddNewBriefDirectly) return;
    
    setIsSubmittingQuickGen(true);
    const generatedBrief: Omit<BriefData, 'id' | 'createdAt' | 'status'> = {
      clientName: quickGenForm.clientName,
      organization: '',
      whatsapp: quickGenForm.whatsapp,
      email: '',
      cityCountry: 'Dakar, Sénégal',
      projectType: selectedTemplateForGen.projectType,
      projectTypeCustom: '',
      contextDescription: selectedTemplateForGen.description,
      primaryObjective: '',
      targetAudience: '',
      targetAudienceChips: [],
      mainTitle: selectedTemplateForGen.defaultMainTitle || 'Projet basé sur Modèle',
      fullTextContent: '',
      stylePreferences: selectedTemplateForGen.defaultStylePreferences || [],
      preferredColors: '',
      avoidColors: '',
      technicalFormat: selectedTemplateForGen.technicalFormat,
      customDimensions: '',
      usageType: selectedTemplateForGen.defaultUsageType || 'both',
      budgetRange: 'sur_devis',
      desiredDeliveryDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
      criticalDeadline: '',
      referenceLinks: '',
      attachments: [],
      acceptProcess: true,
      acceptDeadlines: true,
      templateSourceId: selectedTemplateForGen.id,
      quotedPriceFCFA: selectedTemplateForGen.suggestedPriceFCFA
    };

    await onAddNewBriefDirectly(generatedBrief);
    setIsSubmittingQuickGen(false);
    setSelectedTemplateForGen(null);
    setQuickGenForm({ clientName: '', whatsapp: '' });
  };

  return (
    <>

      {isTemplateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <form onSubmit={handleSaveTemplateSubmit} className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-serif font-bold text-slate-100 flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-amber-400" />
                <span>{editingTemplate ? 'Modifier le Modèle de Brief' : 'Créer un Nouveau Modèle de Brief'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsTemplateModalOpen(false)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="text-slate-300 font-bold block mb-1">Nom du Modèle *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Affiche & Bâche Gamou Annuel Dahira"
                  value={templateForm.title}
                  onChange={(e) => setTemplateForm({ ...templateForm, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Catégorie</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Magal, Gamou, Conférences..."
                  value={templateForm.category}
                  onChange={(e) => setTemplateForm({ ...templateForm, category: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Tarif Suggéré (FCFA)</label>
                <input
                  type="number"
                  required
                  value={templateForm.suggestedPriceFCFA}
                  onChange={(e) => setTemplateForm({ ...templateForm, suggestedPriceFCFA: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-amber-400 font-mono font-bold focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-slate-300 font-bold block mb-1">Description du Modèle</label>
                <textarea
                  rows={2}
                  placeholder="Expliquer dans quel cas réutiliser ce modèle..."
                  value={templateForm.description}
                  onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Type de Projet</label>
                <select
                  value={templateForm.projectType}
                  onChange={(e) => setTemplateForm({ ...templateForm, projectType: e.target.value as ProjectType })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none"
                >
                  <option value="affiche">Affiche événementielle</option>
                  <option value="bache">Bâche / Banderole</option>
                  <option value="flyer">Flyer (A5 / A6)</option>
                  <option value="identite_visuelle">Identité Visuelle / Logo</option>
                  <option value="pack_starter">Pack "Starter"</option>
                  <option value="pack_event">Pack "Event Global"</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Format Technique</label>
                <select
                  value={templateForm.technicalFormat}
                  onChange={(e) => setTemplateForm({ ...templateForm, technicalFormat: e.target.value as TechnicalFormat })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none"
                >
                  <option value="A3_A4">Affiche A3 / A4 HD</option>
                  <option value="bache_3x1">Bâche Grand Format (3x1.5m)</option>
                  <option value="flyer_A5">Flyer A5 Recto/Verso</option>
                  <option value="post_RS">Post Réseaux Sociaux</option>
                  <option value="story_vertical">Story Vertical (9:16)</option>
                  <option value="sur_mesure">Sur Mesure</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-slate-300 font-bold block mb-1">Titre Principal par Défaut</label>
                <input
                  type="text"
                  placeholder="Ex: MAWLID AL-NABI — GAMOU ANNUEL"
                  value={templateForm.defaultMainTitle}
                  onChange={(e) => setTemplateForm({ ...templateForm, defaultMainTitle: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-slate-300 font-bold block mb-1">Texte / Programme par Défaut</label>
                <textarea
                  rows={3}
                  placeholder="Récitation du Saint Coran & Zikr..."
                  value={templateForm.defaultFullTextContent}
                  onChange={(e) => setTemplateForm({ ...templateForm, defaultFullTextContent: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono focus:outline-none focus:border-amber-400 text-xs"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Couleurs Préférées</label>
                <input
                  type="text"
                  placeholder="Vert Émeraude, Doré, Blanc"
                  value={templateForm.preferredColors}
                  onChange={(e) => setTemplateForm({ ...templateForm, preferredColors: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Couleurs à Éviter</label>
                <input
                  type="text"
                  placeholder="Rouge vif, Fluo"
                  value={templateForm.avoidColors}
                  onChange={(e) => setTemplateForm({ ...templateForm, avoidColors: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsTemplateModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs shadow-md"
              >
                {editingTemplate ? 'Mettre à jour' : 'Enregistrer le Modèle'}
              </button>
            </div>
          </form>
        </div>
      )}

      

      {selectedTemplateForGen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <form onSubmit={handleGenerateBriefFromTemplate} className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wide">
                  Génération Rapide de Projet
                </span>
                <h3 className="text-lg font-serif font-bold text-slate-100 flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-amber-400" />
                  <span>Projet basé sur "{selectedTemplateForGen.title}"</span>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTemplateForGen(null)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Template Summary Preview */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <p className="text-slate-400 font-bold">Préconfiguration appliquée :</p>
              <div className="flex flex-wrap gap-2 text-[11px]">
                <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono font-bold">
                  Tarif : {selectedTemplateForGen.suggestedPriceFCFA.toLocaleString('fr-FR')} FCFA
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800 capitalize">
                  {selectedTemplateForGen.projectType}
                </span>
              </div>
              <p className="text-slate-300 font-mono text-[11px] truncate">
                Titre : "{selectedTemplateForGen.defaultMainTitle}"
              </p>
            </div>

            {/* Client Info Inputs */}
            <div className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Nom du Client / Responsable *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Serigne Cheikh Ndiaye"
                  value={quickGenForm.clientName}
                  onChange={(e) => setQuickGenForm({ ...quickGenForm, clientName: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Nom de l'Organisation / Dahira</label>
                <input
                  type="text"
                  placeholder="Ex: Dahira Mafatikhul Bichri"
                  value={quickGenForm.organization}
                  onChange={(e) => setQuickGenForm({ ...quickGenForm, organization: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Numéro WhatsApp du Client *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: +221 77 123 45 67"
                  value={quickGenForm.whatsapp}
                  onChange={(e) => setQuickGenForm({ ...quickGenForm, whatsapp: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 font-mono font-bold focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Date Souhaitée de Livraison</label>
                <input
                  type="date"
                  required
                  value={quickGenForm.desiredDeliveryDate}
                  onChange={(e) => setQuickGenForm({ ...quickGenForm, desiredDeliveryDate: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setSelectedTemplateForGen(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isGeneratingBrief}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-amber-400 hover:brightness-110 text-slate-950 font-extrabold text-xs shadow-md transition-all flex items-center space-x-2"
              >
                {isGeneratingBrief ? (
                  <span>Génération...</span>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Créer le Brief Client</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}


      {/* ─── MODAL: NOUVEAU BRIEF ADMIN ─── */}
          </>
  );
};
