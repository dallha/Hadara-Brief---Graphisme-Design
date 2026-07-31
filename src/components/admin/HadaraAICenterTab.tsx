import React, { useState } from 'react';
import { BriefData, AIAnalysisResult } from '../../types';
import { 
  Bot, 
  Sparkles, 
  Copy, 
  Check, 
  Palette, 
  Type, 
  CheckSquare, 
  MessageSquare, 
  Zap, 
  Sliders, 
  FileText, 
  Terminal, 
  Share2 
} from 'lucide-react';

interface HadaraAICenterTabProps {
  briefs: BriefData[];
}

export const HadaraAICenterTab: React.FC<HadaraAICenterTabProps> = ({ briefs }) => {
  const [selectedBriefId, setSelectedBriefId] = useState<string>(briefs[0]?.id || '');
  const [activeSubTab, setActiveSubTab] = useState<'prompts' | 'social' | 'checklist' | 'analysis'>('prompts');
  const [copiedPromptKey, setCopiedPromptKey] = useState<string | null>(null);

  const selectedBrief = briefs.find(b => b.id === selectedBriefId) || briefs[0];

  // Dynamic AI output generator based on selected brief
  const generateAIOutput = (brief?: BriefData): AIAnalysisResult => {
    if (!brief) {
      return {
        summary: "Sélectionnez un brief pour démarrer l'analyse de l'IA Hadara.",
        strengths: [],
        missingDetails: [],
        recommendedColors: [{ hex: '#816C07', name: 'Doré Or Hadara' }, { hex: '#224A33', name: 'Vert Émeraude' }],
        suggestedTypography: 'Cinzel & Cairo',
        layoutAdvice: 'Mise en page solennelle avec hiérarchie visuelle claire.',
        estimatedHours: '4h - 6h',
        suggestedPriceFCFA: 45000,
        whatsappQuoteDraft: ''
      };
    }

    const title = brief.mainTitle || 'Événement Islamique / Branding';
    const pType = brief.projectType || 'affiche';
    const isBigEvent = brief.budgetRange === '80k-120k' || brief.budgetRange === 'sur_devis';

    return {
      summary: `Brief analysé par Hadara AI pour "${title}". Projet de type ${pType.toUpperCase()} orienté ${brief.stylePreferences?.join(', ') || 'spirituel et moderne'}.`,
      strengths: [
        'Titre principal percutant et clair',
        'Directives de couleurs précises transmises',
        'Format technique imprimeur bien renseigné'
      ],
      missingDetails: [
        'Confirmer si les logos des parrains doivent figurer en bas de bâche',
        'Préciser le format exact pour la déclinaison Story WhatsApp (1080x1920)'
      ],
      recommendedColors: [
        { hex: '#816C07', name: 'Doré Royal Hadara' },
        { hex: '#224A33', name: 'Vert Émeraude Islamique' },
        { hex: '#D4C9BF', name: 'Parchemin Lumineux' },
        { hex: '#0D131F', name: 'Bleu Nuit Solennel' }
      ],
      suggestedTypography: 'Titre : Cinzel Decorative / En-tête : Amiri / Textes : Cairo Bold',
      layoutAdvice: 'Utiliser une structure en pyramide visuelle avec le titre principal en lettres dorées 3D, cadré par un motif arabesque filigrane.',
      estimatedHours: isBigEvent ? '8h - 12h' : '3h - 5h',
      suggestedPriceFCFA: isBigEvent ? 85000 : 45000,
      whatsappQuoteDraft: '',
      complexityLevel: isBigEvent ? 'Haute Définition Master' : 'Moyen',
      prompts: {
        midjourney: `/imagine prompt: Majestic Islamic event poster title text "${title}", 3D ornate gold typography, emerald green background, intricate geometric arabesque patterns, volumetric lighting, studio lighting, highly detailed, photorealistic, 8k --ar 4:5 --v 6.0`,
        firefly: `Vector graphic poster art for "${title}", gold filigree headers, deep green spiritual atmosphere, clean typography placeholder, high resolution print --no blur`,
        dalle: `A luxurious graphic design layout for an African Islamic conference poster titled "${title}". Gold metallic title text, emerald green silk background, high contrast, elegant typography.`
      },
      socialCaptions: {
        facebook: `✨ [NOUVELLE CRÉATION HADARA DESIGN] ✨\n\nNous avons l'honneur de vous présenter le visuel officiel réalisé pour "${title}".\n\n📍 Une direction artistique alliant tradition, solennité et élégance contemporaine.\n\n📲 Vous aussi, confiez la création de vos affiches, bâches et logos à Hadara Studio au +221 77 623 27 41 !\n\n#HadaraDesign #GraphismeSenegal #Gamou #Magal #Branding`,
        instagram: `🎨 Direct Art Direction by @hadara.design\n\nVisuel officiel : "${title}" 💫\n\nÉléments clés :\n• Typographies : Cinzel & Amiri\n• Palette : Vert Émeraude & Doré Or\n\n📥 Briefs & Commandes via le lien en bio !`
      },
      productionChecklist: [
        'Vérifier la définition des images de fond (300 DPI)',
        'Appliquer les marges de sécurité imprimeur (5mm)',
        'Vectoriser l’ensemble des typographies pour l’export PDF/X-1a',
        'Créer le fichier au format carré 1080x1080 pour Facebook',
        'Créer le format vertical 1080x1920 pour la Story WhatsApp'
      ]
    };
  };

  const aiResult = generateAIOutput(selectedBrief);

  const handleCopyPrompt = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPromptKey(key);
    setTimeout(() => setCopiedPromptKey(null), 2500);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Top Header */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-amber-500/30 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-amber-400">
              <Bot className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold uppercase">
                  Moteur IA Autonome
                </span>
                <span className="text-xs text-slate-400">Studio Assistant v2.0</span>
              </div>
              <h2 className="text-2xl font-serif font-bold text-slate-100 mt-0.5">
                Hadara AI Studio — Assistant Métier Graphique
              </h2>
            </div>
          </div>

          {/* Brief Selector Dropdown */}
          <div className="w-full sm:w-80">
            <label className="block text-[11px] font-bold text-slate-400 mb-1">Sélectionner le Brief à analyser :</label>
            <select
              value={selectedBriefId}
              onChange={(e) => setSelectedBriefId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs font-bold focus:border-amber-400 focus:outline-none"
            >
              {briefs.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.id} — "{b.mainTitle}" ({b.clientName})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Analysis Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Deep Scan Summary */}
        <div className="space-y-6">
          
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-xs font-serif font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" /> Analyse du Brief & Incohérences
            </h3>

            <p className="text-xs text-slate-200 leading-relaxed font-sans">{aiResult.summary}</p>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-serif font-bold">Niveau de Complexité Estimé :</span>
              <p className="text-sm font-bold text-emerald-400 font-mono">{aiResult.complexityLevel}</p>
              <p className="text-[11px] text-slate-400">Temps estimé : {aiResult.estimatedHours} • Tarif suggéré : {aiResult.suggestedPriceFCFA.toLocaleString('fr-FR')} FCFA</p>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold text-rose-400 uppercase">Points à Clarifier avec le Client :</span>
              <ul className="space-y-1 text-xs text-slate-400">
                {aiResult.missingDetails.map((m, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-rose-400">•</span>
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Color & Typography Recommendations */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-xs font-serif font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Palette className="w-4 h-4 text-amber-400" /> Direction Artistique & Palettes
            </h3>

            <div className="grid grid-cols-2 gap-2">
              {aiResult.recommendedColors.map((c) => (
                <div key={c.hex} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-lg border border-white/20 shrink-0" style={{ backgroundColor: c.hex }} />
                  <div>
                    <p className="text-[11px] font-bold text-slate-200">{c.name}</p>
                    <p className="text-[9px] font-mono text-slate-400">{c.hex}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Typographies Associées :</span>
              <p className="font-serif text-slate-200 mt-0.5">{aiResult.suggestedTypography}</p>
            </div>
          </div>

        </div>

        {/* Right Column: AI Generators Sub-Tabs */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Sub-tabs header */}
          <div className="flex items-center space-x-2 bg-slate-900 p-2 rounded-2xl border border-slate-800">
            {[
              { id: 'prompts', label: 'Prompts AI (Midjourney/Firefly)', icon: Terminal },
              { id: 'social', label: 'Social Copywriter (RS)', icon: Share2 },
              { id: 'checklist', label: 'Checklist Production', icon: CheckSquare },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
                  activeSubTab === tab.id
                    ? 'bg-amber-400 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Sub-Tab 1: Prompts */}
          {activeSubTab === 'prompts' && (
            <div className="space-y-4">
              
              {/* Midjourney Prompt */}
              <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Midjourney v6 Prompt (3D & Photoréalisme)</span>
                  <button
                    onClick={() => handleCopyPrompt(aiResult.prompts?.midjourney || '', 'mj')}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center space-x-1.5"
                  >
                    {copiedPromptKey === 'mj' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedPromptKey === 'mj' ? 'Copié !' : 'Copier Prompt'}</span>
                  </button>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 leading-relaxed">
                  {aiResult.prompts?.midjourney}
                </div>
              </div>

              {/* Adobe Firefly Prompt */}
              <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Adobe Firefly Prompt (Vectoriel & Imprimeur)</span>
                  <button
                    onClick={() => handleCopyPrompt(aiResult.prompts?.firefly || '', 'ff')}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center space-x-1.5"
                  >
                    {copiedPromptKey === 'ff' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedPromptKey === 'ff' ? 'Copié !' : 'Copier Prompt'}</span>
                  </button>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 leading-relaxed">
                  {aiResult.prompts?.firefly}
                </div>
              </div>

            </div>
          )}

          {/* Sub-Tab 2: Social Copywriter */}
          {activeSubTab === 'social' && (
            <div className="space-y-4">
              
              <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Texte de Publication Facebook</span>
                  <button
                    onClick={() => handleCopyPrompt(aiResult.socialCaptions?.facebook || '', 'fb')}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center space-x-1.5"
                  >
                    {copiedPromptKey === 'fb' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedPromptKey === 'fb' ? 'Copié !' : 'Copier Texte'}</span>
                  </button>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {aiResult.socialCaptions?.facebook}
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Légende Instagram</span>
                  <button
                    onClick={() => handleCopyPrompt(aiResult.socialCaptions?.instagram || '', 'ig')}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center space-x-1.5"
                  >
                    {copiedPromptKey === 'ig' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedPromptKey === 'ig' ? 'Copié !' : 'Copier Légende'}</span>
                  </button>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {aiResult.socialCaptions?.instagram}
                </div>
              </div>

            </div>
          )}

          {/* Sub-Tab 3: Production Checklist */}
          {activeSubTab === 'checklist' && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-xs font-serif font-bold uppercase tracking-wider text-amber-400">
                Checklist Technique Générée par l'IA pour ce Projet
              </h3>
              <div className="space-y-2">
                {aiResult.productionChecklist?.map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200 flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-full bg-amber-400/10 text-amber-400 font-bold flex items-center justify-center font-mono text-[10px] shrink-0">
                      {idx + 1}
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
