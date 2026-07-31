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
  DollarSign, 
  ShieldCheck, 
  Sparkles, 
  AlertCircle, 
  Check, 
  ChevronRight, 
  Layers, 
  User 
} from 'lucide-react';

interface ClientPortalViewProps {
  briefs: BriefData[];
  onUpdateBriefEnriched: (updatedBrief: BriefData) => Promise<void>;
  onClosePortal?: () => void;
}

const WORKFLOW_STEPS = [
  { key: 'nouveau', label: 'Brief Reçu' },
  { key: 'devis_envoye', label: 'Devis Transmis' },
  { key: 'acompte_recu', label: 'Acompte Validé (50%)' },
  { key: 'en_creation', label: 'En Création' },
  { key: 'validation', label: 'En Révision Client' },
  { key: 'termine', label: 'Livré HD & Terminé' },
];

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

  // Filter client projects matching phone
  const clientBriefs = authenticatedPhone
    ? briefs.filter(b => b.whatsapp.replace(/\D/g, '').includes(authenticatedPhone.replace(/\D/g, '')))
    : [];

  const activeBrief = clientBriefs.find(b => b.id === selectedBriefId) || clientBriefs[0];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientPhoneInput.trim()) return;
    setAuthenticatedPhone(clientPhoneInput);
    const matched = briefs.filter(b => b.whatsapp.replace(/\D/g, '').includes(clientPhoneInput.replace(/\D/g, '')));
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
            text: `Demande de révision : ${revisionNote}`,
            createdAt: new Date().toLocaleString('fr-FR')
          }
        ]
      };

      await onUpdateBriefEnriched(updatedBrief);
      setRevisionNote('');
      alert('Votre demande de modification a bien été envoyée au graphiste.');
    } finally {
      setIsSubmittingRevision(false);
    }
  };

  if (!authenticatedPhone) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center mx-auto text-amber-400">
            <User className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-serif font-bold">Portail Client Hadara</h2>
            <p className="text-xs text-slate-400 mt-1">Saisissez votre numéro WhatsApp pour accéder à l'état de vos commandes et télécharger vos fichiers HD</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="text"
              placeholder="Votre numéro WhatsApp (ex: 77 623 27 41)"
              value={clientPhoneInput}
              onChange={(e) => setClientPhoneInput(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-700 text-slate-100 font-mono text-sm text-center focus:border-amber-400 focus:outline-none"
            />
            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-lg transition-all"
            >
              Accéder à mes Commandes
            </button>
          </form>

          {onClosePortal && (
            <button onClick={onClosePortal} className="text-xs text-slate-500 hover:underline">
              Retour au site principal
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      
      {/* Header Bar */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full bg-amber-400/10 text-amber-400 text-xs font-bold uppercase border border-amber-400/30">
            Espace Suivi Client
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-100 mt-1">
            Mes Commandes Hadara Studio
          </h1>
        </div>

        <button
          onClick={() => setAuthenticatedPhone(null)}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
        >
          Déconnexion ({authenticatedPhone})
        </button>
      </div>

      {clientBriefs.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-lg font-serif font-bold">Aucune commande trouvée</h3>
          <p className="text-xs text-slate-400">Aucun projet n'est associé au numéro {authenticatedPhone}.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Orders List */}
          <div className="space-y-4">
            <h3 className="text-xs font-serif font-bold uppercase tracking-wider text-slate-400">Historique de vos projets ({clientBriefs.length})</h3>
            <div className="space-y-3">
              {clientBriefs.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setSelectedBriefId(b.id)}
                  className={`w-full p-4 rounded-2xl border text-left transition-all ${
                    activeBrief?.id === b.id
                      ? 'bg-slate-900 border-amber-400 shadow-xl'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono mb-1">
                    <span className="font-bold text-amber-400">{b.id}</span>
                    <span className="text-slate-400 uppercase text-[10px]">{b.status}</span>
                  </div>
                  <h4 className="font-bold text-slate-100 text-sm line-clamp-1">"{b.mainTitle}"</h4>
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Active Order Details & Actions */}
          {activeBrief && (
            <div className="lg:col-span-2 space-y-6">
              
              {/* Order Status Bar */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-lg bg-amber-400/10 text-amber-400 font-mono text-xs font-bold border border-amber-400/30">
                    {activeBrief.id}
                  </span>
                  <span className="text-xs font-bold text-emerald-400 font-mono">
                    {activeBrief.quotedPriceFCFA ? `${activeBrief.quotedPriceFCFA.toLocaleString('fr-FR')} FCFA` : 'En attente devis'}
                  </span>
                </div>
                <h2 className="text-xl font-serif font-bold text-slate-100">"{activeBrief.mainTitle}"</h2>
              </div>

              {/* Deliverable Versions & Approvals */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                <h3 className="text-sm font-serif font-bold text-slate-100 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-amber-400" /> Maquettes & Fichiers HD à Valider
                </h3>

                <div className="space-y-4">
                  {(activeBrief.deliverableVersions || []).length === 0 ? (
                    <p className="text-xs text-slate-500 italic p-4 text-center">Le graphiste prépare actuellement votre première version.</p>
                  ) : (
                    activeBrief.deliverableVersions?.map((ver) => (
                      <div key={ver.id} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-100 text-sm">Version {ver.versionNumber} : {ver.title}</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            ver.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400'
                          }`}>
                            {ver.status === 'approved' ? 'Approuvé ✅' : 'En révision client'}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <a
                            href={ver.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center space-x-1.5"
                          >
                            <ExternalLink className="w-4 h-4 text-amber-400" />
                            <span>Afficher la maquette</span>
                          </a>

                          {ver.status !== 'approved' && (
                            <button
                              onClick={() => handleApproveVersion(ver.id)}
                              className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-extrabold text-xs shadow-md"
                            >
                              Approuver cette version ✅
                            </button>
                          )}
                        </div>

                        {ver.status !== 'approved' && (
                          <div className="pt-3 border-t border-slate-800 space-y-2">
                            <label className="text-[11px] font-bold text-slate-400">Demander des ajustements :</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Détaillez vos retours (ex: modifier le numéro de téléphone)..."
                                value={revisionNote}
                                onChange={(e) => setRevisionNote(e.target.value)}
                                className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100"
                              />
                              <button
                                onClick={() => handleRequestRevision(ver.id)}
                                disabled={isSubmittingRevision}
                                className="px-4 py-2 rounded-xl bg-slate-800 text-amber-400 font-bold text-xs shrink-0"
                              >
                                Envoyer
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
};
