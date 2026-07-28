import React, { useState } from 'react';
import { BriefData } from '../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PrintableBriefProps {
  brief: BriefData;
  onClose: () => void;
}

export const PrintableBrief: React.FC<PrintableBriefProps> = ({ brief, onClose }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    try {
      const element = document.getElementById('printable-brief-content');
      if (!element) return;
      
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Brief_Hadara_${brief.id}.pdf`);
    } catch (error) {
      console.error('Failed to generate PDF', error);
      alert('Erreur lors de la génération du PDF.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 overflow-y-auto p-4 sm:p-8">
      
      {/* Control bar */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between bg-slate-900 p-4 rounded-2xl border border-slate-800 text-slate-100 print:hidden">
        <div>
          <h2 className="font-serif font-bold text-base">Fiche de Brief Imprimable</h2>
          <p className="text-xs text-slate-400">Prêt pour l'impression ou la sauvegarde PDF</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => window.print()}
            className="px-5 py-2 rounded-xl bg-slate-800 text-slate-100 font-bold text-xs shadow hover:bg-slate-700"
            disabled={isGenerating}
          >
            Imprimer (Classique)
          </button>
          <button
            onClick={handleDownloadPDF}
            className="px-5 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs shadow hover:brightness-110 flex items-center space-x-2"
            disabled={isGenerating}
          >
            {isGenerating ? <span>Génération...</span> : <span>Télécharger en PDF</span>}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700"
          >
            Fermer
          </button>
        </div>
      </div>

      {/* Print Paper Sheet */}
      <div id="printable-brief-content" className="max-w-4xl mx-auto bg-white text-slate-900 p-8 sm:p-12 rounded-2xl shadow-2xl space-y-8 font-sans print:shadow-none print:p-0">
        
        {/* Header Branding */}
        <div className="border-b-2 border-emerald-900 pb-6 flex items-start justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest">
              STUDIO DE DESIGN GRAPHIQUE HADARA
            </span>
            <h1 className="text-2xl font-serif font-bold text-slate-900 mt-1">
              GRAPHISTE DE LA HADARA — DOSSIER DE BRIEF
            </h1>
            <p className="text-xs text-slate-600">
              Affiches, Bâches, Banderoles, Flyers & Identités Visuelles
            </p>
          </div>

          <div className="text-right">
            <span className="px-3 py-1 bg-amber-100 text-amber-900 font-mono font-bold text-sm rounded border border-amber-300">
              {brief.id}
            </span>
            <p className="text-[11px] text-slate-700 mt-1">
              Date : {new Date(brief.createdAt).toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>

        {/* Client & Project Specs Grid */}
        <div className="grid grid-cols-2 gap-6 text-xs">
          
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <p className="font-bold text-emerald-900 uppercase text-[10px]">1. Informations Client</p>
            <p className="font-bold text-sm text-slate-900">{brief.clientName}</p>
            <p className="text-slate-700">Organisation : {brief.organization || 'Particulier'}</p>
            <p className="text-slate-700">WhatsApp : {brief.whatsapp}</p>
            <p className="text-slate-700">Email : {brief.email || 'N/A'}</p>
            <p className="text-slate-700">Ville : {brief.cityCountry}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <p className="font-bold text-emerald-900 uppercase text-[10px]">2. Livrable & Format Technique</p>
            <p className="font-bold text-sm text-amber-800 uppercase">{brief.projectType}</p>
            <p className="text-slate-700">Format : {brief.technicalFormat}</p>
            <p className="text-slate-700">Dimensions : {brief.customDimensions || 'Standard'}</p>
            <p className="text-slate-700">Usage : {brief.usageType.toUpperCase()}</p>
            <p className="text-slate-700">Budget prévu : {brief.budgetRange}</p>
          </div>

        </div>

        {/* Context & Objective */}
        <div className="space-y-3 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <p className="font-bold text-emerald-900 uppercase text-[10px]">3. Contexte & Objectif</p>
            <p className="text-slate-800">{brief.contextDescription}</p>
            <p className="font-semibold text-slate-900 mt-1">Objectif principal : {brief.primaryObjective}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <p className="font-bold text-emerald-900 uppercase text-[10px]">4. Cible & Public Visé</p>
            <p className="text-slate-800">Public : {brief.targetAudienceChips.join(', ')}</p>
            <p className="text-slate-700">{brief.targetAudience}</p>
          </div>

          {/* Full Text Content */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <p className="font-bold text-emerald-900 uppercase text-[10px]">5. Titre & Texte Brut à Figer sur le Visuel</p>
            <p className="font-bold text-base text-slate-900">"{brief.mainTitle}"</p>
            <p className="font-mono text-xs text-slate-800 whitespace-pre-wrap bg-white p-3 rounded border border-slate-300">
              {brief.fullTextContent}
            </p>
          </div>

          {/* Style & Colors */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <p className="font-bold text-emerald-900 uppercase text-[10px]">6. Style & Direction Graphique</p>
              <p className="text-slate-800">Styles : {brief.stylePreferences.join(', ')}</p>
              <p className="text-slate-800">Couleurs préférées : {brief.preferredColors}</p>
              <p className="text-slate-800">Couleurs à éviter : {brief.avoidColors}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <p className="font-bold text-emerald-900 uppercase text-[10px]">7. Échéances & Validation</p>
              <p className="font-bold text-slate-900">Livraison souhaitée : {brief.desiredDeliveryDate}</p>
              {brief.criticalDeadline && (
                <p className="text-rose-700 font-semibold">Impression : {brief.criticalDeadline}</p>
              )}
              <p className="text-slate-600 text-[10px] pt-1">Processus d'acompte (50%) accepté : Oui</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-300 pt-6 text-center text-[10px] text-slate-700 space-y-1">
          <p className="font-bold text-slate-700">GRAPHISTE DE LA HADARA — EL HADJI ABDOULAYE NIASS — DESIGN GRAPHIQUE HD</p>
          <p>Identités Visuelles, Affiches, Flyers, Bâches Grand Format, Packages Booster & Sites Web</p>
          <p>Dakar, Sénégal • WhatsApp : +221 77 623 27 41 | +221 76 375 63 63 • Behance : behance.net/mrniasse</p>
        </div>

      </div>

    </div>
  );
};
