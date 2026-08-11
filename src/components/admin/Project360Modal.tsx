import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  Clock, 
  Send, 
  Sparkles, 
  User, 
  Phone, 
  Calendar, 
  DollarSign, 
  FileText, 
  Printer, 
  Copy, 
  Check, 
  Layers, 
  CheckSquare, 
  History, 
  MessageSquare, 
  Plus, 
  ExternalLink, 
  FileCheck, 
  ShieldCheck, 
  AlertCircle,
  Tag,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { 
  BriefData, 
  BriefStatus, 
  UserRole, 
  DeliverableVersion, 
  QualityCheckItem, 
  ProjectComment, 
  ActivityLogItem 
} from '../../types';

interface Project360ModalProps {
  brief: BriefData;
  userRole: UserRole;
  onClose: () => void;
  onUpdateStatus: (briefId: string, status: BriefStatus, notes?: string) => Promise<void>;
  onUpdateBriefEnriched: (updatedBrief: BriefData) => Promise<void>;
  onPrintBrief: (brief: BriefData) => void;
}

const WORKFLOW_STEPS: { key: BriefStatus; label: string; desc: string; icon: any }[] = [
  { key: 'nouveau', label: 'Brief Reçu', desc: 'Analyse initiale', icon: FileText },
  { key: 'devis_envoye', label: 'Devis Envoyé', desc: 'Proposition transmise', icon: Clock },
  { key: 'acompte_recu', label: 'Acompte (50%)', desc: 'Encaissement validé', icon: DollarSign },
  { key: 'en_creation', label: 'En Création', desc: 'Design & Maquettage', icon: Sparkles },
  { key: 'validation', label: 'Validation', desc: 'Révisions client', icon: CheckCircle2 },
  { key: 'termine', label: 'Livré & Terminé', desc: 'Fichiers HD transmis', icon: ShieldCheck },
];

const DEFAULT_CHECKLIST: QualityCheckItem[] = [
  { id: 'qc-1', label: 'Format Imprimeur HD (300 DPI / Vectoriel)', completed: false },
  { id: 'qc-2', label: 'Vérification orthographe & coordonnées client', completed: false },
  { id: 'qc-3', label: 'Contrôle des marges de coupe et repères de pliage', completed: false },
  { id: 'qc-4', label: 'Déclinaison pour Réseaux Sociaux (Carré/Story)', completed: false },
  { id: 'qc-5', label: 'Validation finale du client et solde réglé', completed: false },
];

export const Project360Modal: React.FC<Project360ModalProps> = ({
  brief,
  userRole,
  onClose,
  onUpdateStatus,
  onUpdateBriefEnriched,
  onPrintBrief,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'versions' | 'quality' | 'activity'>('overview');
  const [editStatus, setEditStatus] = useState<BriefStatus>(brief.status);
  const [editNotes, setEditNotes] = useState<string>(brief.designerNotes || '');
  const [isSaving, setIsSaving] = useState(false);
  const [copiedQuote, setCopiedQuote] = useState(false);

  // New Version Form State
  const [newVersionTitle, setNewVersionTitle] = useState('');
  const [newVersionUrl, setNewVersionUrl] = useState('');
  const [newVersionNotes, setNewVersionNotes] = useState('');
  const [versionFilePreview, setVersionFilePreview] = useState<string | null>(null);

  const handleFileVersionUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        alert('Le fichier sélectionné est trop volumineux (limite 15 Mo).');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setNewVersionUrl(result);
        setVersionFilePreview(result);
        if (!newVersionTitle) {
          setNewVersionTitle(file.name.replace(/\.[^/.]+$/, ""));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // New Comment Form State
  const [newCommentText, setNewCommentText] = useState('');

  // Local state for versions, checklist, logs & comments
  const [versions, setVersions] = useState<DeliverableVersion[]>(brief.deliverableVersions || []);
  const [checklist, setChecklist] = useState<QualityCheckItem[]>(brief.qualityChecklist || DEFAULT_CHECKLIST);
  const [comments, setComments] = useState<ProjectComment[]>(brief.comments || []);
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>(
    brief.activityLog || [
      {
        id: `log-init`,
        timestamp: new Date(brief.createdAt).toLocaleString('fr-FR'),
        user: brief.clientName,
        userRole: 'client',
        action: 'Brief créé et soumis sur Hadara Studio'
      }
    ]
  );

  const currentStepIndex = WORKFLOW_STEPS.findIndex((s) => s.key === editStatus);

  const handleStepClick = (newStatus: BriefStatus) => {
    setEditStatus(newStatus);
    logActivity(`Statut mis à jour vers "${WORKFLOW_STEPS.find(s => s.key === newStatus)?.label}"`);
  };

  const logActivity = (actionText: string, details?: string) => {
    const newLog: ActivityLogItem = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString('fr-FR'),
      user: userRole === 'admin' ? 'Administrateur Studio' : userRole === 'graphiste' ? 'Graphiste Référent' : brief.clientName,
      userRole: userRole,
      action: actionText,
      details
    };
    setActivityLogs((prev) => [newLog, ...prev]);
  };

  const handleToggleChecklist = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextCompleted = !item.completed;
          logActivity(`Contrôle qualité "${item.label}" marqué comme ${nextCompleted ? 'conforme ✅' : 'non effectué ❌'}`);
          return { ...item, completed: nextCompleted };
        }
        return item;
      })
    );
  };

  const handleAddVersion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVersionTitle.trim() || !newVersionUrl.trim()) return;

    const nextVerNumber = versions.length + 1;
    const newVer: DeliverableVersion = {
      id: `ver-${Date.now()}`,
      versionNumber: nextVerNumber,
      title: newVersionTitle,
      fileUrl: newVersionUrl,
      notes: newVersionNotes,
      createdAt: new Date().toLocaleString('fr-FR'),
      status: 'client_review'
    };

    setVersions((prev) => [newVer, ...prev]);
    logActivity(`Nouvelle version livrable ajoutée : Version ${nextVerNumber} (${newVersionTitle})`);
    setNewVersionTitle('');
    setNewVersionUrl('');
    setNewVersionNotes('');
    setVersionFilePreview(null);
  };

  const handleUpdateVersionStatus = (versionId: string, newVerStatus: DeliverableVersion['status']) => {
    setVersions((prev) =>
      prev.map((v) => {
        if (v.id === versionId) {
          logActivity(`Statut de la version V${v.versionNumber} changé en "${newVerStatus.toUpperCase()}"`);
          return { ...v, status: newVerStatus };
        }
        return v;
      })
    );
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const newComm: ProjectComment = {
      id: `comm-${Date.now()}`,
      author: userRole === 'admin' ? 'Hadara Admin' : userRole === 'graphiste' ? 'Graphiste Hadara' : brief.clientName,
      authorRole: userRole,
      text: newCommentText,
      createdAt: new Date().toLocaleString('fr-FR')
    };

    setComments((prev) => [...prev, newComm]);
    logActivity(`Nouveau commentaire ajouté : "${newCommentText.slice(0, 30)}..."`);
    setNewCommentText('');
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      await onUpdateStatus(brief.id, editStatus, editNotes);
      
      const updatedBriefData: BriefData = {
        ...brief,
        status: editStatus,
        designerNotes: editNotes,
        deliverableVersions: versions,
        qualityChecklist: checklist,
        comments: comments,
        activityLog: activityLogs
      };

      await onUpdateBriefEnriched(updatedBriefData);
      onClose();
    } catch (err) {
      console.error('Error saving 360 project updates:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyWhatsAppQuote = () => {
    const formattedQuote = `🟢 *HADARA DESIGN & GRAPHISME* — Devis Projet
------------------------------------------
📋 *Projet :* ${brief.mainTitle}
👤 *Client :* ${brief.clientName} (${brief.organization || 'Particulier'})
📐 *Format :* ${brief.projectType.toUpperCase()} — ${brief.technicalFormat}
💰 *Montant Global :* ${brief.quotedPriceFCFA ? brief.quotedPriceFCFA.toLocaleString('fr-FR') : 'Sur devis'} FCFA
💳 *Acompte 50% à la commande :* ${brief.quotedPriceFCFA ? (brief.quotedPriceFCFA / 2).toLocaleString('fr-FR') : 'Sur devis'} FCFA

📲 *Mode de Paiement :* Wave / Orange Money au +221 77 623 27 41
📅 *Livraison Estimée :* ${brief.desiredDeliveryDate}

Merci pour votre confiance !`;

    navigator.clipboard.writeText(formattedQuote);
    setCopiedQuote(true);
    setTimeout(() => setCopiedQuote(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        
        {/* Header Bar */}
        <div className="p-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              <span className="px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs font-bold">
                {brief.id}
              </span>
              <span className="px-3 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-bold uppercase tracking-wider">
                Rôle : {userRole.toUpperCase()}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-100 flex items-center gap-2">
              <span>{brief.mainTitle}</span>
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 6-Step Visual Workflow Progress Bar */}
        <div className="px-6 py-4 bg-slate-950/50 border-b border-slate-800/80 overflow-x-auto">
          <div className="flex items-center justify-between min-w-[650px] relative">
            {/* Connecting line */}
            <div className="absolute top-1/2 left-4 right-4 h-1 bg-slate-800 -translate-y-1/2 -z-0" />
            
            {WORKFLOW_STEPS.map((step, idx) => {
              const isPassed = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              const StepIcon = step.icon;

              return (
                <div
                  key={step.key}
                  className={`relative z-10 flex flex-col items-center group transition-all ${
                    isCurrent ? 'scale-105' : ''
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all shadow-md ${
                      isCurrent
                        ? 'bg-amber-400 border-amber-300 text-slate-950 font-extrabold shadow-amber-400/20'
                        : isPassed
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                        : 'bg-slate-900 border-slate-700 text-slate-500'
                    }`}
                  >
                    <StepIcon className="w-4 h-4" />
                  </div>
                    <div className={`mt-3 text-center`}>
                    <p className={`text-[10px] font-bold uppercase tracking-wider ${isCurrent ? 'text-amber-400' : isPassed ? 'text-slate-300' : 'text-slate-500'}`}>
                      {step.label}
                    </p>
                    <p className={`text-[9px] mt-0.5 ${isCurrent ? 'text-slate-300' : 'text-slate-600'}`}>{step.desc}</p>
                  </div>
                </div> );
            })}
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center space-x-2 px-6 bg-slate-900 border-b border-slate-800 pt-3">
          {[
            { id: 'overview', label: 'Vue d’ensemble & Brief', icon: FileText },
            { id: 'versions', label: `Livrables & Versions (${versions.length})`, icon: Layers },
            { id: 'quality', label: `Checklist Qualité (${checklist.filter(c => c.completed).length}/${checklist.length})`, icon: CheckSquare },
            { id: 'activity', label: `Historique & Notes (${activityLogs.length})`, icon: History },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all flex items-center space-x-2 border-t border-x ${
                activeTab === tab.id
                  ? 'bg-slate-950 text-amber-400 border-slate-800 border-b-slate-950 -mb-px'
                  : 'bg-transparent text-slate-400 hover:text-slate-200 border-transparent'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Contents Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Brief Details */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Client Info Block */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <h3 className="text-xs font-serif font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <User className="w-4 h-4 text-amber-400" /> Information Client & Contact
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-slate-400">Client / Organisation</p>
                      <p className="font-bold text-slate-100 text-sm">{brief.clientName} ({brief.organization || 'N/A'})</p>
                    </div>
                    <div>
                      <p className="text-slate-400">WhatsApp / Téléphone</p>
                      <a
                        href={`https://wa.me/${brief.whatsapp.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-bold text-emerald-400 hover:underline flex items-center gap-1.5 mt-0.5"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>{brief.whatsapp}</span>
                      </a>
                    </div>
                    <div>
                      <p className="text-slate-400">Email</p>
                      <p className="font-bold text-slate-200">{brief.email || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Ville / Pays</p>
                      <p className="font-bold text-slate-200">{brief.cityCountry}</p>
                    </div>
                  </div>
                </div>

                {/* Project Specs */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                  <h3 className="text-xs font-serif font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-amber-400" /> Contenu & Style du Visuel
                  </h3>
                  
                  <div className="space-y-3 text-xs">
                    <div>
                      <p className="text-slate-400 font-semibold mb-1">Texte Intégral du Visuel :</p>
                      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 whitespace-pre-wrap font-sans leading-relaxed">
                        {brief.fullTextContent || brief.contextDescription}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div>
                        <p className="text-slate-400">Couleurs Souhaitées :</p>
                        <p className="font-semibold text-emerald-400 mt-0.5">{brief.preferredColors || 'Non spécifié'}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Couleurs à Éviter :</p>
                        <p className="font-semibold text-rose-400 mt-0.5">{brief.avoidColors || 'Aucune'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Quoting & Admin Actions */}
              <div className="space-y-6">
                
                {/* Quotation Box */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-4">
                  <h3 className="text-xs font-serif font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-amber-400" /> Tarification & Acompte
                  </h3>

                  <div className="space-y-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Prix Devisé</p>
                    <div className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-emerald-400 font-mono font-bold">
                      {editPrice ? `${editPrice.toLocaleString('fr-FR')} FCFA` : 'Non devisé'}
                    </div>
                  </div>

                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
                      <div className="flex justify-between text-slate-400">
                        <span>Acompte 50% requis :</span>
                        <span className="font-bold text-emerald-400">{(editPrice / 2).toLocaleString('fr-FR')} FCFA</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Solde à la livraison :</span>
                        <span className="font-bold text-slate-200">{(editPrice / 2).toLocaleString('fr-FR')} FCFA</span>
                      </div>
                    </div>

                    <button
                      onClick={handleCopyWhatsAppQuote}
                      className="w-full py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold transition-all flex items-center justify-center space-x-2"
                    >
                      {copiedQuote ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedQuote ? 'Devis copié pour WhatsApp !' : 'Copier le Devis WhatsApp'}</span>
                    </button>
                  </div>
                </div>

                {/* Designer Notes */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <h3 className="text-xs font-serif font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-amber-400" /> Notes du Designer
                </h3>
                <div className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-slate-300 text-xs min-h-[100px]">
                  {editNotes || <span className="text-slate-600 italic">Aucune note.</span>}
                </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: DELIVERABLE VERSIONS */}
          {activeTab === 'versions' && (
            <div className="space-y-6">
              
              {/* Form: Add Deliverable Version (Removed - Django Admin Only) */}

              {/* Versions List */}
              <div className="space-y-3">
                {versions.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2">
                    <FileCheck className="w-8 h-8 text-slate-600 mx-auto" />
                    <p className="text-xs text-slate-400">Aucune version livrable publiée pour ce projet pour le moment.</p>
                  </div>
                ) : (
                  versions.map((ver) => (
                    <div key={ver.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="px-2.5 py-0.5 rounded-md bg-amber-400/20 text-amber-400 text-xs font-mono font-bold">
                            V{ver.versionNumber}
                          </span>
                          <span className="text-sm font-bold text-slate-100">{ver.title}</span>
                        </div>
                        <p className="text-[11px] text-slate-400">Publié le {ver.createdAt}</p>
                      </div>

                      <div className="flex items-center space-x-3 w-full sm:w-auto shrink-0">
                        <a
                          href={ver.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center space-x-1.5"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Voir le Fichier</span>
                        </a>

                        <span
                          className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-slate-200 focus:outline-none"
                        >
                          {ver.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: QUALITY CHECKLIST */}
          {activeTab === 'quality' && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" /> Control Quality Pre-Delivery Checklist
                    </h3>
                    <p className="text-xs text-slate-400">Assurez la perfection visuelle et technique avant d’expédier la version HD au client.</p>
                  </div>
                  <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                    {checklist.filter((c) => c.completed).length} / {checklist.length} Validés
                  </span>
                </div>

                <div className="space-y-2 pt-2">
                  {checklist.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center space-x-3 p-3 rounded-xl bg-slate-900/50 border border-slate-800/80 transition-colors"
                    >
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border ${
                        item.completed ? 'bg-emerald-500 border-emerald-500' : 'bg-slate-950 border-slate-700'
                      }`}>
                        {item.completed && <Check className="w-3.5 h-3.5 text-slate-950 font-bold" />}
                      </div>
                      <span className={`text-xs ${item.completed ? 'text-slate-300 line-through opacity-70' : 'text-slate-200'}`}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ACTIVITY LOGS & COMMENTS */}
          {activeTab === 'activity' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Left Column: Comments Feed */}
              <div className="space-y-4">
                <h3 className="text-xs font-serif font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 mb-4">
                  <MessageSquare className="w-4 h-4 text-amber-400" /> Discussion & Notes de Révision
                </h3>

                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {comments.length === 0 ? (
                    <p className="text-xs text-slate-500 italic p-4 text-center">Aucun commentaire rédigé.</p>
                  ) : (
                    comments.map((c) => (
                      <div key={c.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-amber-400">{c.author}</span>
                          <span className="text-slate-500">{c.createdAt}</span>
                        </div>
                        <p className="text-xs text-slate-200">{c.text}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Right Column: Audit Trail */}
              <div className="space-y-4">
                <h3 className="text-xs font-serif font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <History className="w-4 h-4 text-amber-400" /> Journal d'Activité & Traçabilité
                </h3>

                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {activityLogs.map((log) => (
                    <div key={log.id} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs space-y-0.5">
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                        <span>{log.user} ({log.userRole})</span>
                        <span>{log.timestamp}</span>
                      </div>
                      <p className="text-slate-300 font-medium">{log.action}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer Actions Bar */}
        <div className="p-6 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={() => onPrintBrief(brief)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center justify-center space-x-2"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Imprimer la Fiche PDF</span>
          </button>
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-amber-400 text-slate-900 font-bold hover:bg-amber-300 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
