import React, { useState } from 'react';
import { BriefData, DeliverableVersion } from '../../types';
import { 
  CheckCircle2, 
  Clock, 
  Download, 
  ExternalLink, 
  MessageSquare, 
  FileText, 
  Phone, 
  ShieldCheck, 
  Sparkles, 
  AlertCircle, 
  Check, 
  ChevronRight, 
  Layers, 
  User,
  Image as ImageIcon,
  X,
  CreditCard,
  Send,
  ZoomIn
} from 'lucide-react';

interface ClientPortalViewProps {
  briefs: BriefData[];
  onUpdateBriefEnriched: (updatedBrief: BriefData) => Promise<void>;
  onClosePortal?: () => void;
}

const WORKFLOW_STEPS = [
  { key: 'nouveau', label: 'Brief Reçu', desc: 'Commande enregistrée par le studio' },
  { key: 'devis_envoye', label: 'Devis Transmis', desc: 'Tarif officiel validé' },
  { key: 'acompte_recu', label: 'Acompte Validé (50%)', desc: 'Paiement de démarrage reçu' },
  { key: 'en_creation', label: 'En Création', desc: 'Direction artistique & maquette' },
  { key: 'validation', label: 'Révision Client', desc: 'Ajustements & retours' },
  { key: 'termine', label: 'Livraison HD', desc: 'Fichiers HD imprimables téléchargeables' },
];

function isImageUrl(url?: string): boolean {
  if (!url) return false;
  if (url.startsWith('data:image/')) return true;
  const clean = url.toLowerCase().split('?')[0];
  return clean.endsWith('.png') || clean.endsWith('.jpg') || clean.endsWith('.jpeg') || clean.endsWith('.webp') || clean.endsWith('.gif') || clean.endsWith('.svg');
}

export const ClientPortalView: React.FC<ClientPortalViewProps> = ({
  briefs,
  onUpdateBriefEnriched,
  onClosePortal,
}) => {
  const [clientPhoneInput, setClientPhoneInput] = useState('');
  const [authenticatedPhone, setAuthenticatedPhone] = useState<string | null>(null);
  const [selectedBriefId, setSelectedBriefId] = useState<string | null>(null);
  const [revisionNote, setRevisionNote] = useState('');
  const [isSubmittingRevision, setIsSubmittingRevision] = useState(false);
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);

  // Filter client projects matching phone
  const clientBriefs = authenticatedPhone
    ? (briefs || []).filter(b => (b.whatsapp || '').replace(/\D/g, '').includes(authenticatedPhone.replace(/\D/g, '')))
    : [];

  const activeBrief = clientBriefs.find(b => b.id === selectedBriefId) || clientBriefs[0];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientPhoneInput.trim()) return;
    setAuthenticatedPhone(clientPhoneInput);
    const matched = (briefs || []).filter(b => (b.whatsapp || '').replace(/\D/g, '').includes(clientPhoneInput.replace(/\D/g, '')));
    if (matched.length > 0) {
      setSelectedBriefId(matched[0].id);
    }
  };

  const handleApproveVersion = async (versionId: string) => {
    if (!activeBrief) return;
    const updatedVersions = (activeBrief.deliverableVersions || []).map(v => 
      v.id === versionId ? { ...v, status: 'approved' as const } : v
    );

    const updatedBrief: BriefData = {
      ...activeBrief,
      status: 'termine',
      deliverableVersions: updatedVersions,
      activityLog: [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toLocaleString('fr-FR'),
          user: activeBrief.clientName,
          userRole: 'client',
          action: 'Version livrable approuvée par le client ! ✅'
        },
        ...(activeBrief.activityLog || [])
      ]
    };

    await onUpdateBriefEnriched(updatedBrief);
    alert('Merci ! La version a été officiellement approuvée.');
  };

  const handleRequestRevision = async (versionId: string) => {
    if (!activeBrief || !revisionNote.trim()) return;
    setIsSubmittingRevision(true);
    try {
      const updatedVersions = (activeBrief.deliverableVersions || []).map(v => 
        v.id === versionId ? { ...v, status: 'rejected' as const, notes: revisionNote } : v
      );

      const updatedBrief: BriefData = {
        ...activeBrief,
        status: 'en_creation',
        deliverableVersions: updatedVersions,
        comments: [
          ...(activeBrief.comments || []),
          {
            id: `comm-${Date.now()}`,
            author: activeBrief.clientName,
            authorRole: 'client',
            text: `Demande de modification : ${revisionNote}`,
            createdAt: new Date().toLocaleString('fr-FR')
          }
        ],
        activityLog: [
          {
            id: `log-${Date.now()}`,
            timestamp: new Date().toLocaleString('fr-FR'),
            user: activeBrief.clientName,
            userRole: 'client',
            action: `Demande de modification envoyée par le client : "${revisionNote}"`
          },
          ...(activeBrief.activityLog || [])
        ]
      };

      await onUpdateBriefEnriched(updatedBrief);
      setRevisionNote('');
      alert('Votre demande de modification a bien été envoyée au graphiste.');
    } finally {
      setIsSubmittingRevision(false);
    }
  };

  const getStepIndex = (status: string) => {
    const idx = WORKFLOW_STEPS.findIndex(s => s.key === status);
    return idx >= 0 ? idx : 0;
  };

  if (!authenticatedPhone) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 selection:bg-amber-400 selection:text-slate-950">
        <div className="bg-slate-900/90 backdrop-blur-2xl border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400/20 to-amber-500/10 border border-amber-400/30 flex items-center justify-center mx-auto text-amber-400 shadow-xl">
            <User className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <span className="px-3 py-1 rounded-full bg-amber-400/10 text-amber-400 text-[10px] font-bold uppercase tracking-widest border border-amber-400/30">
              HADARA SUITE PORTAL
            </span>
            <h2 className="text-2xl font-serif font-bold text-slate-100 pt-2">Suivi Client & Maquettes</h2>
            <p className="text-xs text-slate-400">Accédez au suivi en temps réel de vos commandes et téléchargez vos visuels HD.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 pt-2">
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-500 absolute left-4 top-4" />
              <input
                type="text"
                placeholder="Numéro WhatsApp"
                value={clientPhoneInput}
                onChange={(e) => setClientPhoneInput(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-950 border border-slate-700 text-slate-100 font-mono text-sm focus:border-amber-400 focus:outline-none shadow-inner"
              />
            </div>
            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-400/20 active:scale-98 transition-all flex items-center justify-center space-x-2"
            >
              <span>Accéder à mes Commandes</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </form>

          {onClosePortal && (
            <button onClick={onClosePortal} className="text-xs text-slate-500 hover:text-slate-300 transition-colors pt-2 block mx-auto">
              ← Retour au site principal
            </button>
          )}
        </div>
      </div>
    );
  }

  const currentStepIdx = activeBrief ? getStepIndex(activeBrief.status) : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 max-w-7xl mx-auto space-y-8 font-sans">
      
      {/* Top Bar Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/30">
              Espace Client Sécurisé
            </span>
            <span className="text-xs font-mono text-slate-400">Sénégal & International</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-100">
            Portail de Suivi Client — Hadara Studio
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={`https://wa.me/221776232741?text=Bonjour%20Hadara%20Studio,%20je%20suis%20connect%C3%A9%20sur%20mon%20espace%20client%20pour%20le%20projet%20${activeBrief?.id || ''}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-300 hover:bg-emerald-900 transition-all text-xs font-bold flex items-center space-x-2"
          >
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">WhatsApp Studio</span>
          </a>

          <button
            onClick={() => setAuthenticatedPhone(null)}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
          >
            Déconnexion ({authenticatedPhone})
          </button>
        </div>
      </div>

      {clientBriefs.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4 shadow-xl">
          <AlertCircle className="w-12 h-12 text-amber-400 mx-auto" />
          <h3 className="text-xl font-serif font-bold">Aucun projet trouvé</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Aucune commande n'est associée au numéro <span className="font-mono text-amber-400 font-bold">{authenticatedPhone}</span>. Assurez-vous d'utiliser le numéro WhatsApp indiqué lors de votre brief.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Orders List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-serif font-bold uppercase tracking-wider text-slate-400">
                Vos Projets en Cours ({clientBriefs.length})
              </h3>
            </div>

            <div className="space-y-3">
              {clientBriefs.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setSelectedBriefId(b.id)}
                  className={`w-full p-4 rounded-2xl border text-left transition-all ${
                    activeBrief?.id === b.id
                      ? 'bg-slate-900 border-amber-400 shadow-xl scale-[1.02]'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                    <span className="font-bold text-amber-400">{b.id}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                      b.status === 'termine' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-400/10 text-amber-300 border border-amber-400/30'
                    }`}>
                      {b.status === 'termine' ? 'Livré HD' : b.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-100 text-sm line-clamp-1">"{b.mainTitle}"</h4>
                  <p className="text-[11px] text-slate-400 mt-1 capitalize font-mono">{b.projectType} • {b.createdAt}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Active Order Main View */}
          {activeBrief && (
            <div className="lg:col-span-2 space-y-6">
              
              {/* Order Card Summary */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-2xl relative overflow-hidden">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div className="space-y-1">
                    <span className="px-3 py-1 rounded-lg bg-amber-400/10 text-amber-400 font-mono text-xs font-bold border border-amber-400/30">
                      ID : {activeBrief.id}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-100 mt-1">
                      "{activeBrief.mainTitle}"
                    </h2>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Tarif Officiel Devisé</p>
                    <p className="text-xl font-black font-mono text-emerald-400">
                      {activeBrief.quotedPriceFCFA ? `${activeBrief.quotedPriceFCFA.toLocaleString('fr-FR')} FCFA` : 'Sur devis (en étude)'}
                    </p>
                  </div>
                </div>

                {/* Workflow Timeline Tracker */}
                <div className="space-y-3">
                  <h3 className="text-xs font-serif font-bold uppercase tracking-wider text-slate-400">
                    Avancement du Projet dans le Studio
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                    {WORKFLOW_STEPS.map((step, idx) => {
                      const isPast = idx < currentStepIdx;
                      const isCurrent = idx === currentStepIdx;
                      return (
                        <div
                          key={step.key}
                          className={`p-3 rounded-2xl border text-center space-y-1 transition-all ${
                            isCurrent
                              ? 'bg-amber-400/15 border-amber-400 shadow-lg text-amber-300'
                              : isPast
                              ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-400'
                              : 'bg-slate-950/50 border-slate-800 text-slate-500'
                          }`}
                        >
                          <div className="flex items-center justify-center">
                            {isPast || isCurrent ? (
                              <CheckCircle2 className={`w-4 h-4 ${isCurrent ? 'text-amber-400 animate-pulse' : 'text-emerald-400'}`} />
                            ) : (
                              <Clock className="w-4 h-4 text-slate-600" />
                            )}
                          </div>
                          <p className="text-[10px] font-bold uppercase tracking-tight line-clamp-1">{step.label}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Specifications Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Type de Visuel</span>
                    <span className="font-bold text-slate-200 capitalize">{activeBrief.projectType}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Format Technique</span>
                    <span className="font-bold text-slate-200">{activeBrief.technicalFormat}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Date de Livraison</span>
                    <span className="font-bold text-amber-400 font-mono">{activeBrief.desiredDeliveryDate || 'À convenir'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Usage Prévu</span>
                    <span className="font-bold text-slate-200 capitalize">{activeBrief.usageType}</span>
                  </div>
                </div>
              </div>

              {/* Deliverable Versions & Image Preview Section */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5 shadow-2xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-serif font-bold text-slate-100 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-amber-400" /> Maquettes & Fichiers HD à Valider
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">
                    {(activeBrief.deliverableVersions || []).length} version(s)
                  </span>
                </div>

                <div className="space-y-4">
                  {(activeBrief.deliverableVersions || []).length === 0 ? (
                    <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2">
                      <Sparkles className="w-8 h-8 text-amber-400/60 mx-auto" />
                      <p className="text-xs text-slate-400 font-medium">
                        Le graphiste prépare actuellement votre première maquette. Elle apparaîtra ici dès sa publication !
                      </p>
                    </div>
                  ) : (
                    activeBrief.deliverableVersions?.map((ver) => {
                      const isImg = isImageUrl(ver.fileUrl);
                      return (
                        <div key={ver.id} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 shadow-md">
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <span className="font-bold text-slate-100 text-sm block">Version {ver.versionNumber} : {ver.title}</span>
                              <span className="text-[10px] text-slate-500 font-mono">Publié le {ver.createdAt}</span>
                            </div>

                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                              ver.status === 'approved'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                            }`}>
                              {ver.status === 'approved' ? 'Approuvé ✅' : 'En révision client'}
                            </span>
                          </div>

                          {/* Image Thumbnail Preview & Lightbox Button */}
                          {isImg && (
                            <div className="relative rounded-2xl overflow-hidden border border-slate-800 group bg-slate-900 max-h-72 flex items-center justify-center">
                              <img
                                src={ver.fileUrl}
                                alt={ver.title}
                                className="w-full h-full object-contain max-h-72 transition-transform duration-300 group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                <button
                                  onClick={() => setPreviewImage({ url: ver.fileUrl, title: ver.title })}
                                  className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-lg"
                                >
                                  <ZoomIn className="w-4 h-4" />
                                  <span>Aperçu HD Plein Écran</span>
                                </button>
                                <a
                                  href={ver.fileUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  download
                                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-100 font-bold text-xs flex items-center space-x-1.5 shadow-lg"
                                >
                                  <Download className="w-4 h-4 text-emerald-400" />
                                  <span>Télécharger</span>
                                </a>
                              </div>
                            </div>
                          )}

                          <div className="flex flex-wrap items-center gap-3 pt-1">
                            {isImg && (
                              <button
                                onClick={() => setPreviewImage({ url: ver.fileUrl, title: ver.title })}
                                className="px-4 py-2.5 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-300 hover:bg-amber-400/20 text-xs font-bold flex items-center space-x-1.5"
                              >
                                <ImageIcon className="w-4 h-4" />
                                <span>Agrandir l'image HD</span>
                              </button>
                            )}

                            <a
                              href={ver.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center space-x-1.5"
                            >
                              <ExternalLink className="w-4 h-4 text-amber-400" />
                              <span>Ouvrir le fichier ({ver.title})</span>
                            </a>

                            {ver.status !== 'approved' && (
                              <button
                                onClick={() => handleApproveVersion(ver.id)}
                                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-lg transition-all"
                              >
                                Approuver cette version ✅
                              </button>
                            )}
                          </div>

                          {ver.status !== 'approved' && (
                            <div className="pt-3 border-t border-slate-800 space-y-2">
                              <label className="text-[11px] font-bold text-slate-400">Demander des retours ou ajustements au graphiste :</label>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  placeholder="Détaillez vos ajustements (ex: modifier la couleur du titre)..."
                                  value={revisionNote}
                                  onChange={(e) => setRevisionNote(e.target.value)}
                                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:border-amber-400 focus:outline-none"
                                />
                                <button
                                  onClick={() => handleRequestRevision(ver.id)}
                                  disabled={isSubmittingRevision}
                                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs shrink-0 flex items-center space-x-1"
                                >
                                  <Send className="w-3.5 h-3.5" />
                                  <span>Envoyer</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Financial Summary & Payment Instructions */}
              {activeBrief.quotedPriceFCFA && (
                <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-2xl">
                  <h3 className="text-base font-serif font-bold text-slate-100 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-emerald-400" /> Règlement & Factures
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Montant Total</span>
                      <span className="text-lg font-black font-mono text-slate-100">{activeBrief.quotedPriceFCFA.toLocaleString('fr-FR')} FCFA</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-amber-400 uppercase font-bold block">Acompte Devisé (50%)</span>
                      <span className="text-lg font-black font-mono text-amber-300">{Math.round(activeBrief.quotedPriceFCFA * 0.5).toLocaleString('fr-FR')} FCFA</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-emerald-400 uppercase font-bold block">Solde Restant à la livraison</span>
                      <span className="text-lg font-black font-mono text-emerald-300">{Math.round(activeBrief.quotedPriceFCFA * 0.5).toLocaleString('fr-FR')} FCFA</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-emerald-900/40 text-xs space-y-2">
                    <p className="font-bold text-emerald-400">Modes de règlement acceptés par Hadara Studio :</p>
                    <div className="flex flex-wrap gap-4 text-slate-300">
                      <span>📲 Wave Sénégal : <strong className="font-mono text-emerald-300">+221 77 623 27 41</strong></span>
                      <span>🍊 Orange Money : <strong className="font-mono text-orange-300">+221 76 375 63 63</strong></span>
                    </div>
                  </div>
                </div>
              )}

              {/* CSAT Rating & Feedback Prompt for Completed Projects */}
              {activeBrief.status === 'termine' && (
                <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-emerald-950/20 to-slate-900 border border-amber-500/30 space-y-4 shadow-2xl">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">⭐</span>
                    <h3 className="text-base font-serif font-bold text-amber-300">Votre Avis sur cette Collaboration</h3>
                  </div>

                  <p className="text-xs text-slate-300">
                    Projet livré HD avec succès ! Votre retour est essentiel pour nous aider à améliorer Hadara Studio.
                  </p>

                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Note globale de satisfaction (/10) :
                      </label>
                      <div className="flex items-center space-x-1 overflow-x-auto pb-1">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                          <button
                            key={score}
                            onClick={() => alert(`Merci ! Note enregistrée : ${score}/10`)}
                            className="w-8 h-8 rounded-xl bg-slate-950 hover:bg-amber-400 hover:text-slate-950 border border-slate-800 text-xs font-bold font-mono text-slate-200 transition-colors shrink-0"
                          >
                            {score}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <input
                        type="text"
                        placeholder="Qu'avez-vous le plus apprécié ?"
                        className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:border-amber-400 focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Qu'aurait-on pu simplifier ?"
                        className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:border-amber-400 focus:outline-none"
                      />
                    </div>

                    <button
                      onClick={() => alert("Merci infiniment pour vos retours précieux !")}
                      className="px-5 py-2.5 rounded-xl font-bold text-slate-950 text-xs bg-amber-400 hover:bg-amber-300 shadow-md transition-all"
                    >
                      Transmettre mon avis au Studio Hadara
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      )}

      {/* High Resolution Image Lightbox Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-5xl flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-100 truncate">{previewImage.title}</h3>
            <button
              onClick={() => setPreviewImage(null)}
              className="p-2 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="relative max-w-4xl max-h-[80vh] overflow-auto rounded-2xl border border-slate-800 flex items-center justify-center">
            <img src={previewImage.url} alt={previewImage.title} className="max-w-full max-h-[80vh] object-contain rounded-xl" />
          </div>

          <div className="mt-4 flex items-center gap-4">
            <a
              href={previewImage.url}
              target="_blank"
              rel="noreferrer"
              download
              className="px-6 py-3 rounded-2xl bg-amber-400 text-slate-950 font-black text-xs shadow-xl flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Télécharger l'image HD</span>
            </a>
          </div>
        </div>
      )}

    </div>
  );
};
