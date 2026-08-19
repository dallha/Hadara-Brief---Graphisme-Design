import React, { useState, useEffect } from 'react';
import { 
  Printer, X, Bot, Sparkles, RefreshCw, Palette, Calendar, Phone, 
  Mail, MapPin, Layers, Copy, Check, CheckCircle2, Edit3, Trash2, 
  ExternalLink, FileImage, Maximize2, CreditCard, Tag, Monitor, FileText 
} from 'lucide-react';
import { BriefData, BriefStatus, AIAnalysisResult, BriefAnalystResult, PricingAgentResult, CreativeAssistantResult } from '../../../types';
import { BriefAnalysisPanel } from '../BriefAnalysisPanel';
import { PricingAgentPanel } from '../PricingAgentPanel';
import { CreativeAssistantPanel } from '../CreativeAssistantPanel';

interface BriefDetailsModalProps {
  selectedBrief: BriefData | null;
  onClose: () => void;
  onPrintBrief: (brief: BriefData) => void;
  onUpdateStatus: (briefId: string, status: BriefStatus, notes?: string, price?: number) => Promise<void>;
  onAnalyzeWithAI: (briefId: string) => Promise<AIAnalysisResult | null>;
  onDeleteBrief: (briefId: string) => Promise<void>;
}

const STATUS_CONFIG: Record<BriefStatus, { label: string; bg: string; text: string; border: string }> = {
  nouveau: { label: 'Nouveau Brief', bg: 'bg-[#816C07]/15', text: 'text-[#D4C9BF]', border: 'border-[#816C07]/40' },
  devis_envoye: { label: 'Devis Envoyé', bg: 'bg-[#335A79]/20', text: 'text-[#F8F8F8]', border: 'border-[#335A79]/50' },
  acompte_recu: { label: 'Acompte Reçu (50%)', bg: 'bg-[#816C07]/30', text: 'text-[#F5F5DC]', border: 'border-[#816C07]/60' },
  en_creation: { label: 'En Création', bg: 'bg-[#224A33]/30', text: 'text-[#F5F5DC]', border: 'border-[#224A33]/60' },
  validation: { label: 'En Validation', bg: 'bg-[#335A79]/30', text: 'text-[#D4C9BF]', border: 'border-[#335A79]/60' },
  termine: { label: 'Terminé / Livré HD', bg: 'bg-[#224A33]/40', text: 'text-[#F5F5DC]', border: 'border-[#224A33]/70' },
};

export const BriefDetailsModal: React.FC<BriefDetailsModalProps> = ({
  selectedBrief,
  onClose,
  onPrintBrief,
  onUpdateStatus,
  onAnalyzeWithAI,
  onDeleteBrief
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [copiedQuote, setCopiedQuote] = useState(false);
  const [editStatus, setEditStatus] = useState<BriefStatus>('nouveau');
  const [editNotes, setEditNotes] = useState('');
  const [editPrice, setEditPrice] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (selectedBrief) {
      setEditStatus(selectedBrief.status);
      setEditNotes(selectedBrief.adminNotes || '');
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedBrief]);

  if (!selectedBrief) return null;

  const handleCopyWhatsAppQuote = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedQuote(true);
    setTimeout(() => setCopiedQuote(false), 2000);
  };

  const handleRunAIAnalysis = async () => {
    setIsAnalyzing(true);
    await onAnalyzeWithAI(selectedBrief.id);
    setIsAnalyzing(false);
  };

  const handleSaveStatus = async () => {
    setIsSaving(true);
    await onUpdateStatus(selectedBrief.id, editStatus, editNotes);
    setIsSaving(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedQuote(true);
    setTimeout(() => setCopiedQuote(false), 2000);
  };

  // Mocking setSelectedBrief to onClose for the internal X button
  const setSelectedBrief = (val: null) => onClose();

  return (
    <>
      {selectedBrief && (
        <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-2 sm:p-6 overflow-hidden">
          <div className="bg-slate-900 border border-slate-800/90 rounded-2xl sm:rounded-3xl max-w-4xl w-full max-h-[92vh] sm:max-h-[88vh] flex flex-col shadow-2xl relative overflow-hidden">
            
            {/* Modal Sticky Header */}
            <div className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur-md p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between gap-2 shrink-0">
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                  <span className="font-mono text-xs font-bold text-amber-400 px-2 py-0.5 rounded bg-slate-950 border border-slate-800 shrink-0">
                    {selectedBrief.id}
                  </span>
                  <span className="text-[11px] sm:text-xs text-slate-400 truncate">Soumis le {new Date(selectedBrief.createdAt).toLocaleDateString('fr-FR')}</span>
                </div>
                <h3 className="text-base sm:text-xl font-serif font-bold text-slate-100 truncate">
                  Brief : {selectedBrief.mainTitle}
                </h3>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={() => onPrintBrief(selectedBrief)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center space-x-1"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">PDF Print</span>
                </button>

                <button
                  onClick={() => setSelectedBrief(null)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Modal Content */}
            <div className="p-4 sm:p-8 space-y-6 overflow-y-auto flex-1">

            {/* AI Assistant Section */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-950 to-slate-950 border border-emerald-800/80 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bot className="w-5 h-5 text-amber-400" />
                  <span className="font-bold text-sm text-slate-100">Assistant IA Directeur Artistique</span>
                </div>

                <button
                  onClick={handleRunAIAnalysis}
                  disabled={isAnalyzing}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-emerald-400 text-slate-950 font-extrabold text-xs shadow hover:brightness-110 flex items-center space-x-2 disabled:opacity-50"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Analyse en cours...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{selectedBrief.aiAnalysis ? 'Réanalyser le Brief' : 'Générer Diagnostic & Palette IA'}</span>
                    </>
                  )}
                </button>
              </div>

              {selectedBrief.aiAnalysis && (
                <div className="space-y-4 pt-2 text-xs text-slate-200">
                  <p className="text-slate-300 leading-relaxed font-medium">
                    {selectedBrief.aiAnalysis.summary}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Recommended Palette */}
                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                      <p className="font-bold text-amber-300 flex items-center space-x-1">
                        <Palette className="w-3.5 h-3.5" />
                        <span>Palette de Couleurs Suggérée :</span>
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selectedBrief.aiAnalysis.recommendedColors.map((col, idx) => (
                          <div key={idx} className="flex items-center space-x-1.5 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                            <span className="w-3.5 h-3.5 rounded-full border border-slate-700" style={{ backgroundColor: col.hex }} />
                            <span className="font-mono text-[10px] text-slate-300">{col.name} ({col.hex})</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Layout & Typography */}
                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                      <p className="font-bold text-emerald-400">Recommandation Typographie & Lay-out :</p>
                      <p className="text-[11px] text-slate-300 leading-relaxed">{selectedBrief.aiAnalysis.suggestedTypography}</p>
                      <p className="text-[11px] text-slate-400 mt-1">{selectedBrief.aiAnalysis.layoutAdvice}</p>
                    </div>
                  </div>

                  {/* 3 Visual Concepts Section */}
                  {selectedBrief.aiAnalysis.concepts && selectedBrief.aiAnalysis.concepts.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <h5 className="font-serif font-bold text-sm text-slate-100">
                          Exploration Conceptuelle — 3 Pistes Créatives (Tradition & Modernité)
                        </h5>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {selectedBrief.aiAnalysis.concepts.map((concept) => (
                          <div
                            key={concept.number}
                            className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-all space-y-3 flex flex-col justify-between shadow-md"
                          >
                            <div className="space-y-2">
                              <p className="font-serif font-bold text-xs text-amber-300 leading-snug">
                                💡 CONCEPT {concept.number} : {concept.name}
                              </p>

                              {concept.metaphorSymbol && (
                                <p className="text-[10px] text-amber-400/90 italic bg-slate-950 p-2 rounded-lg border border-amber-900/30">
                                  <strong>Métaphore visuelle :</strong> {concept.metaphorSymbol}
                                </p>
                              )}

                              <div className="space-y-1 text-[11px] text-slate-300">
                                <p>
                                  <strong className="text-slate-100">👁️ Description Visuelle :</strong>{' '}
                                  {concept.visualDescription}
                                </p>
                              </div>

                              <div className="space-y-1 text-[11px] text-slate-300">
                                <p>
                                  <strong className="text-emerald-400">🎨 Direction Artistique :</strong>{' '}
                                  {concept.artDirection}
                                </p>
                              </div>

                              <div className="space-y-1 text-[11px] text-slate-300">
                                <p>
                                  <strong className="text-amber-400">🧠 Angle Marketing :</strong>{' '}
                                  {concept.marketingAngle}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pre-formatted WhatsApp draft */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-900/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-400">Proposition de Devis Prête pour WhatsApp</span>
                      <button
                        onClick={() => handleCopyWhatsAppQuote(selectedBrief.aiAnalysis!.whatsappQuoteDraft)}
                        className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold flex items-center space-x-1"
                      >
                        {copiedQuote ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedQuote ? 'Copié !' : 'Copier Réponse'}</span>
                      </button>
                    </div>
                    <p className="font-mono text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {selectedBrief.aiAnalysis.whatsappQuoteDraft}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Hadara AI Brief Analyst Panel */}
            <BriefAnalysisPanel
              briefId={selectedBrief.id}
              result={selectedBrief.briefAnalystResult}
              onResultSaved={(result: BriefAnalystResult) => {
                selectedBrief.briefAnalystResult = result;
              }}
            />

            {/* Hadara AI Pricing Agent Panel */}
            <PricingAgentPanel
              briefId={selectedBrief.id}
              result={selectedBrief.pricingAgentResult}
              onResultSaved={(result: PricingAgentResult) => {
                selectedBrief.pricingAgentResult = result;
              }}
            />

            {/* Hadara AI Creative Assistant Panel */}
            <CreativeAssistantPanel
              briefId={selectedBrief.id}
              result={selectedBrief.creativeAssistantResult}
              onResultSaved={(result: CreativeAssistantResult) => {
                selectedBrief.creativeAssistantResult = result;
              }}
            />

            {/* Quick Status & Price Editor */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <h4 className="font-bold text-sm text-slate-100">Gestion du Statut & Tarif Devis</h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Statut du Dossier</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as BriefStatus)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none"
                  >
                    <option value="nouveau">Nouveau Brief</option>
                    <option value="devis_envoye">Devis Envoyé</option>
                    <option value="acompte_recu">Acompte Reçu (50%)</option>
                    <option value="en_creation">En Création</option>
                    <option value="validation">En Validation</option>
                    <option value="termine">Terminé / Livré HD</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 font-bold block mb-1">Tarif Devisé (FCFA)</label>
                  <input
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs font-mono font-bold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-bold block mb-1">Notes du Graphiste</label>
                  <input
                    type="text"
                    placeholder="Ex: Acompte Wave reçu, logo vectorisé..."
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end">
                <button
                  onClick={handleSaveStatus}
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs transition-all"
                >
                  {isSaving ? 'Mise à jour...' : 'Enregistrer le Statut'}
                </button>
              </div>
            </div>

            {/* Complete Brief Details Breakdown */}
            <div className="space-y-4 pt-2">
              <h4 className="font-bold text-sm text-slate-100 border-b border-slate-800 pb-2">
                Détails complets du Brief
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <p className="text-slate-400 uppercase font-bold text-[10px]">Client</p>
                  <p className="font-bold text-slate-100">{selectedBrief.clientName} ({selectedBrief.organization || 'Particulier'})</p>
                  <p className="text-emerald-400">{selectedBrief.whatsapp} | {selectedBrief.cityCountry}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <p className="text-slate-400 uppercase font-bold text-[10px]">Livrable & Format</p>
                  <p className="font-bold text-amber-300">{selectedBrief.projectType} ({selectedBrief.technicalFormat})</p>
                  <p className="text-slate-300">Dimensions : {selectedBrief.customDimensions || 'Standard'}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1 sm:col-span-2">
                  <p className="text-slate-400 uppercase font-bold text-[10px]">Contexte & Objectif</p>
                  <p className="text-slate-200">{selectedBrief.contextDescription}</p>
                  <p className="text-amber-300 font-semibold mt-1">Objectif : {selectedBrief.primaryObjective}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1 sm:col-span-2">
                  <p className="text-slate-400 uppercase font-bold text-[10px]">Texte Brut à Afficher</p>
                  <p className="font-mono text-slate-200 whitespace-pre-wrap bg-slate-900 p-3 rounded-lg border border-slate-800 mt-1">
                    {selectedBrief.fullTextContent}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <p className="text-slate-400 uppercase font-bold text-[10px]">Styles & Couleurs</p>
                  <p className="text-slate-200">Styles : {selectedBrief.stylePreferences.join(', ')}</p>
                  <p className="text-emerald-400">Préférées : {selectedBrief.preferredColors}</p>
                  <p className="text-rose-400">À éviter : {selectedBrief.avoidColors}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <p className="text-slate-400 uppercase font-bold text-[10px]">Budget & Échéances</p>
                  <p className="text-amber-400 font-bold">Budget indicatif : {selectedBrief.budgetRange}</p>
                  <p className="text-slate-200">Livraison : {selectedBrief.desiredDeliveryDate}</p>
                  {selectedBrief.criticalDeadline && (
                    <p className="text-rose-400">Impression : {selectedBrief.criticalDeadline}</p>
                  )}
                </div>
              </div>

              {selectedBrief.attachments.length > 0 && (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                  <p className="text-slate-400 uppercase font-bold text-[10px]">Fichiers Attachés ({selectedBrief.attachments.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedBrief.attachments.map((file) => (
                      <div key={file.id} className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-amber-400" />
                        <span className="font-bold text-slate-200">{file.name}</span>
                        {file.dataUrl && (
                          <a href={file.dataUrl} download={file.name} className="text-emerald-400 hover:underline text-[10px]">
                            [Télécharger]
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={async () => {
                  if (confirm("Voulez-vous vraiment supprimer ce brief ?")) {
                    await onDeleteBrief(selectedBrief.id);
                    setSelectedBrief(null);
                  }
                }}
                className="px-4 py-2 rounded-xl bg-rose-950 hover:bg-rose-900 text-rose-300 font-bold text-xs flex items-center space-x-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Supprimer</span>
              </button>

              <button
                onClick={() => setSelectedBrief(null)}
                className="px-6 py-2 rounded-xl bg-slate-800 text-slate-200 font-bold text-xs"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      </div>
      )}
    </>
  );
};
