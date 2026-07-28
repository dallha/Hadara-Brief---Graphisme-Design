import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Send, 
  Printer, 
  Copy, 
  Check, 
  Calendar, 
  Phone, 
  User, 
  FileText, 
  Sparkles, 
  ArrowRight, 
  Clock, 
  Download,
  Share2
} from 'lucide-react';
import { BriefData } from '../types';

interface BriefConfirmationProps {
  brief: BriefData;
  onNewBrief: () => void;
  onViewAllBriefs?: () => void;
  onPrintBrief?: (brief: BriefData) => void;
}

export const BriefConfirmation: React.FC<BriefConfirmationProps> = ({
  brief,
  onNewBrief,
  onViewAllBriefs,
  onPrintBrief,
}) => {
  const [copied, setCopied] = useState(false);

  // Generate WhatsApp summary text
  const whatsappNumber = "+221776232741"; // El Hadji Abdoulaye Niass - Graphiste de la Hadara
  const formattedWhatsAppText = encodeURIComponent(
    `*ASSALAMOU 'ALAYKOUM GRAPHISTE DE LA HADARA*\n\n` +
    `Je viens de soumettre mon brief créatif sur votre site.\n\n` +
    `📌 *Dossier N° :* ${brief.id}\n` +
    `👤 *Client :* ${brief.clientName} (${brief.organization || 'Particulier'})\n` +
    `📱 *WhatsApp :* ${brief.whatsapp}\n` +
    `📍 *Ville :* ${brief.cityCountry}\n` +
    `🎨 *Type de Projet :* ${brief.projectType.toUpperCase()}\n` +
    `🏷️ *Titre Principal :* "${brief.mainTitle}"\n` +
    `📐 *Format / Dimensions :* ${brief.technicalFormat} (${brief.customDimensions || 'Standard'})\n` +
    `💰 *Budget indicatif :* ${brief.budgetRange}\n` +
    `📅 *Livraison souhaitée :* ${brief.desiredDeliveryDate}\n\n` +
    `Merci d'analyser ma demande et de m'envoyer le devis sous 24h.`
  );

  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${formattedWhatsAppText}`;

  const fullTextSummary = `--- BRIEF DE CONCEPTION GRAPHISTE DE LA HADARA ---
DOSSIER N° : ${brief.id}
CLIENT : ${brief.clientName} (${brief.organization || 'N/A'})
WHATSAPP : ${brief.whatsapp} | EMAIL : ${brief.email || 'N/A'}
PROJET : ${brief.projectType}
TITRE : ${brief.mainTitle}
CONTEXTE : ${brief.contextDescription}
OBJECTIF : ${brief.primaryObjective}
TEXTE : ${brief.fullTextContent}
STYLES : ${brief.stylePreferences.join(', ')}
FORMAT : ${brief.technicalFormat} (${brief.customDimensions || ''})
BUDGET : ${brief.budgetRange}
DATE DE LIVRAISON : ${brief.desiredDeliveryDate}`;

  const handleCopyText = () => {
    navigator.clipboard.writeText(fullTextSummary);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      
      {/* Top Banner Success */}
      <div className="p-8 sm:p-10 rounded-3xl bg-slate-900 border border-emerald-500/60 shadow-2xl text-center space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400 mx-auto flex items-center justify-center text-emerald-400 shadow-xl animate-bounce" style={{ animationDuration: '3s' }}>
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Brief Enregistré avec Succès</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-serif font-bold text-slate-100">
            Merci {brief.clientName} !
          </h2>
          <p className="text-slate-300 text-sm max-w-lg mx-auto">
            Votre brief créatif a été enregistré sous la référence <strong className="text-amber-400">{brief.id}</strong>. Nous analyserons toutes vos indications sous 24h.
          </p>
        </div>

        {/* Primary Action Button: Send via WhatsApp */}
        <div className="pt-2 max-w-md mx-auto space-y-3">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:brightness-110 text-slate-950 font-extrabold text-sm sm:text-base shadow-xl transition-all flex items-center justify-center space-x-3 group"
          >
            <Send className="w-5 h-5 text-slate-950 group-hover:scale-110 transition-transform" />
            <span>Envoyer la demande au Graphiste par WhatsApp</span>
          </a>
          <p className="text-[11px] text-slate-400">
            Un clic ouvre votre WhatsApp avec le texte du brief pré-rempli pour un contact direct.
          </p>
        </div>
      </div>

      {/* Brief Summary Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400">Fiche de Synthèse</span>
            <h3 className="text-lg font-bold text-slate-100">Récapitulatif de votre Dossier</h3>
          </div>
          <span className="px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold">
            {brief.id}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <p className="text-slate-400 uppercase font-bold text-[10px]">Client / Organisation</p>
            <p className="font-bold text-slate-100">{brief.clientName}</p>
            <p className="text-slate-300">{brief.organization || 'Particulier'}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <p className="text-slate-400 uppercase font-bold text-[10px]">Contact WhatsApp & Email</p>
            <p className="font-bold text-emerald-400">{brief.whatsapp}</p>
            <p className="text-slate-300">{brief.email || 'Non renseigné'}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <p className="text-slate-400 uppercase font-bold text-[10px]">Type de projet</p>
            <p className="font-bold text-amber-300 uppercase">{brief.projectType}</p>
            <p className="text-slate-300">Format : {brief.technicalFormat}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <p className="text-slate-400 uppercase font-bold text-[10px]">Budget & Échéance</p>
            <p className="font-bold text-slate-100">{brief.budgetRange}</p>
            <p className="text-slate-300">Livraison : {brief.desiredDeliveryDate}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
          <p className="text-slate-400 uppercase font-bold text-[10px]">Titre Principal & Texte à Afficher</p>
          <p className="font-bold text-slate-100 text-sm">"{brief.mainTitle}"</p>
          <p className="text-slate-300 whitespace-pre-wrap leading-relaxed font-mono text-[11px] pt-1">
            {brief.fullTextContent || "Aucun texte secondaire fourni."}
          </p>
        </div>

        {/* Secondary Action Buttons */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800">
          <button
            onClick={handleCopyText}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center space-x-2"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Texte copié !</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-400" />
                <span>Copier le texte du brief</span>
              </>
            )}
          </button>

          {onPrintBrief && (
            <button
              onClick={() => onPrintBrief(brief)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center space-x-2"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>Imprimer / Télécharger PDF</span>
            </button>
          )}

          <button
            onClick={onNewBrief}
            className="px-5 py-2.5 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-300 hover:bg-emerald-900 text-xs font-bold transition-all flex items-center space-x-2 ml-auto"
          >
            <span>Nouveau Brief</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Next Step Info Box */}
      <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3 text-xs">
        <h4 className="font-bold text-slate-200 flex items-center space-x-2">
          <Clock className="w-4 h-4 text-amber-400" />
          <span>Prochaine Étape du Workflow :</span>
        </h4>
        <ol className="list-decimal list-inside space-y-1.5 text-slate-300 leading-relaxed pl-1">
          <li>Le Graphiste de la Hadara examine votre brief et vos fichiers.</li>
          <li>Vous recevez par WhatsApp un devis détaillé avec l'estimation exacte du tarif en FCFA.</li>
          <li>Après versement de l'acompte (50%), la création graphique démarrera immédiatement.</li>
          <li>Une fois le visuel validé et le solde réglé, vous recevez vos fichiers HD (PDF Imprimeur, PNG, etc.) prêts à être transmis à votre imprimeur.</li>
        </ol>
      </div>

    </div>
  );
};
