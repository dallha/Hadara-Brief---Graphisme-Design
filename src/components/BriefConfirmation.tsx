import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  Send, 
  Printer, 
  Copy, 
  Check, 
  ArrowRight, 
  Clock,
  User,
  Phone,
  Layers,
  DollarSign,
  Calendar,
  FileText,
  Sparkles
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

  const whatsappNumber = "+221776232741";
  const formattedWhatsAppText = encodeURIComponent(
    `ASSALAMOU 'ALAYKOUM,\n\n` +
    `Je vous informe avoir soumis un nouveau brief créatif sur votre plateforme. Vous trouverez ci-dessous les informations relatives à ma demande :\n\n` +
    `• N° de dossier : ${brief.id}\n` +
    `• Client : ${brief.clientName} (${brief.organization || 'Particulier'})\n` +
    `• Type de projet : ${brief.projectType.charAt(0).toUpperCase() + brief.projectType.slice(1)}\n` +
    `• Intitulé : « ${brief.mainTitle} »\n` +
    `• Formats souhaités : ${brief.technicalFormat}\n` +
    `• Date de livraison souhaitée : ${brief.desiredDeliveryDate}\n\n` +
    `Je vous serais reconnaissant de bien vouloir prendre en charge cette demande et de me transmettre votre devis dans les meilleurs délais.\n\n` +
    `Je reste disponible pour toute information complémentaire.\n\n` +
    `Cordialement,`
  );

  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${formattedWhatsAppText}`;

  const fullTextSummary = `--- BRIEF DE CONCEPTION — GRAPHISTE DE LA HADARA ---
N° de Dossier  : ${brief.id}
Client         : ${brief.clientName} (${brief.organization || 'N/A'})
WhatsApp       : ${brief.whatsapp}
Email          : ${brief.email || 'N/A'}
Projet         : ${brief.projectType}
Intitulé       : ${brief.mainTitle}
Contexte       : ${brief.contextDescription}
Texte visuel   : ${brief.fullTextContent}
Styles         : ${brief.stylePreferences.join(', ')}
Format         : ${brief.technicalFormat} ${brief.customDimensions || ''}
Budget         : ${brief.budgetRange}
Livraison      : ${brief.desiredDeliveryDate}`;

  const handleCopyText = () => {
    navigator.clipboard.writeText(fullTextSummary);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const summaryFields = [
    { icon: User,       label: 'Client',          value: brief.clientName,                   sub: brief.organization || 'Particulier' },
    { icon: Phone,      label: 'WhatsApp',         value: brief.whatsapp,                     sub: brief.email || 'Email non renseigné', accent: 'text-emerald-400' },
    { icon: Layers,     label: 'Type de projet',   value: brief.projectType.charAt(0).toUpperCase() + brief.projectType.slice(1), sub: `Format : ${brief.technicalFormat}`, accent: 'text-amber-300' },
    { icon: DollarSign, label: 'Budget',           value: brief.budgetRange,                  sub: '' },
    { icon: Calendar,   label: 'Livraison',        value: brief.desiredDeliveryDate,           sub: brief.criticalDeadline ? `Délai critique : ${brief.criticalDeadline}` : '', accent: 'text-sky-300' },
  ];

  const workflowSteps = [
    { n: '01', title: 'Analyse du brief',      desc: 'Le Graphiste de la Hadara examine votre dossier et vos fichiers joints.' },
    { n: '02', title: 'Envoi du devis',        desc: 'Vous recevez par WhatsApp un devis détaillé avec le tarif exact en FCFA.' },
    { n: '03', title: 'Démarrage création',    desc: "Après versement de l'acompte (50%), la création graphique démarre immédiatement." },
    { n: '04', title: 'Livraison des fichiers', desc: 'Une fois le visuel validé et le solde réglé, vous recevez vos fichiers HD prêts pour l\'imprimeur.' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-24 pt-8">

      {/* ─── 1. HERO SUCCESS BANNER ─── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden p-8 sm:p-12 rounded-3xl bg-slate-900 border border-emerald-500/40 shadow-2xl text-center space-y-5"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-transparent to-transparent pointer-events-none" />

        {/* Badge */}
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-700/60 text-emerald-300 text-xs font-bold">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Brief enregistré avec succès</span>
        </div>

        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 mx-auto flex items-center justify-center text-emerald-400">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        {/* Title & subtitle */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-100">
            Merci, {brief.clientName} !
          </h1>
          <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
            Votre dossier a été enregistré sous la référence{' '}
            <span className="text-amber-400 font-mono font-bold">{brief.id}</span>.
            <br />Nous analyserons votre brief sous <strong className="text-slate-200">24 heures</strong>.
          </p>
        </div>

        {/* Primary CTA */}
        <div className="pt-2 max-w-sm mx-auto space-y-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-4 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-extrabold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center space-x-3"
          >
            <Send className="w-4 h-4" />
            <span>Confirmer par WhatsApp</span>
          </a>
          <p className="text-[11px] text-slate-500 text-center">
            Ouvre WhatsApp avec votre brief pré-rempli pour un contact direct.
          </p>
        </div>
      </motion.div>

      {/* ─── 2. FICHE DE SYNTHÈSE ─── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="rounded-3xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400">Fiche de synthèse</p>
            <h2 className="text-base font-bold text-slate-100 mt-0.5">Récapitulatif du dossier</h2>
          </div>
          <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold">
            {brief.id}
          </span>
        </div>

        {/* Fields Grid */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {summaryFields.map(({ icon: Icon, label, value, sub, accent }) => (
            <div key={label} className="flex items-start space-x-3 p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                <Icon className="w-4 h-4 text-slate-400" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">{label}</p>
                <p className={`text-sm font-bold truncate ${accent || 'text-slate-100'}`}>{value}</p>
                {sub && <p className="text-xs text-slate-400 mt-0.5 truncate">{sub}</p>}
              </div>
            </div>
          ))}

          {/* Titre principal - spans full width */}
          <div className="sm:col-span-2 flex items-start space-x-3 p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
              <FileText className="w-4 h-4 text-slate-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Intitulé & contenu</p>
              <p className="text-sm font-bold text-slate-100">« {brief.mainTitle} »</p>
              {brief.fullTextContent && (
                <p className="text-xs text-slate-400 mt-1.5 whitespace-pre-wrap leading-relaxed font-mono">
                  {brief.fullTextContent}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-6 py-4 border-t border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all flex items-center space-x-2"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className={copied ? 'text-emerald-400' : ''}>{copied ? 'Copié !' : 'Copier le brief'}</span>
            </button>

            {onPrintBrief && (
              <button
                onClick={() => onPrintBrief(brief)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all flex items-center space-x-2"
              >
                <Printer className="w-3.5 h-3.5 text-amber-400" />
                <span>Imprimer PDF</span>
              </button>
            )}
          </div>

          <button
            onClick={onNewBrief}
            className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold transition-all flex items-center space-x-2 active:scale-95"
          >
            <span>Nouveau Brief</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>

      {/* ─── 3. WORKFLOW ─── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 space-y-4"
      >
        <div className="flex items-center space-x-2 mb-2">
          <Clock className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold text-slate-200">Prochaines étapes</h3>
        </div>

        <div className="space-y-3">
          {workflowSteps.map(({ n, title, desc }) => (
            <div key={n} className="flex items-start space-x-4">
              <span className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 text-amber-400 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                {n}
              </span>
              <div className="pt-1">
                <p className="text-xs font-bold text-slate-200">{title}</p>
                <p className="text-xs text-slate-400 leading-relaxed mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

    </div>
  );
};
