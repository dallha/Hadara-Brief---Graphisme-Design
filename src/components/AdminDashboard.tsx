import React, { useState, useEffect } from 'react';
import API_BASE from '../config';
import { 
  LayoutDashboard, 
  Search, 
  Filter, 
  Sparkles, 
  Phone, 
  Mail, 
  User, 
  Calendar, 
  Clock, 
  DollarSign, 
  FileText, 
  Printer, 
  Send, 
  Copy, 
  Check, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  Edit3, 
  Trash2, 
  ExternalLink,
  Bot,
  RefreshCw,
  Palette,
  BookOpen,
  Plus,
  Zap,
  Tag,
  Layers,
  Building,
  FileImage,
  Maximize2,
  CreditCard,
  Monitor
} from 'lucide-react';
import { BriefData, BriefStatus, AIAnalysisResult, BriefTemplate, ProjectType, TechnicalFormat, StylePreference, BudgetRange } from '../types';
import { INITIAL_TEMPLATES } from '../data/templateData';

interface AdminDashboardProps {
  briefs: BriefData[];
  onUpdateStatus: (briefId: string, status: BriefStatus, notes?: string, price?: number) => Promise<void>;
  onAnalyzeWithAI: (briefId: string) => Promise<AIAnalysisResult | null>;
  onDeleteBrief: (briefId: string) => Promise<void>;
  onPrintBrief: (brief: BriefData) => void;
  onAddNewBriefDirectly?: (briefData: Omit<BriefData, 'id' | 'createdAt' | 'status'>) => Promise<void>;
}

const STATUS_CONFIG: Record<BriefStatus, { label: string; bg: string; text: string; border: string }> = {
  nouveau: { label: 'Nouveau Brief', bg: 'bg-[#816C07]/15', text: 'text-[#D4C9BF]', border: 'border-[#816C07]/40' },
  devis_envoye: { label: 'Devis Envoyé', bg: 'bg-[#335A79]/20', text: 'text-[#F8F8F8]', border: 'border-[#335A79]/50' },
  acompte_recu: { label: 'Acompte Reçu (50%)', bg: 'bg-[#816C07]/30', text: 'text-[#F5F5DC]', border: 'border-[#816C07]/60' },
  en_creation: { label: 'En Création', bg: 'bg-[#224A33]/30', text: 'text-[#F5F5DC]', border: 'border-[#224A33]/60' },
  validation: { label: 'En Validation', bg: 'bg-[#335A79]/30', text: 'text-[#D4C9BF]', border: 'border-[#335A79]/60' },
  termine: { label: 'Terminé / Livré HD', bg: 'bg-[#224A33]/40', text: 'text-[#F5F5DC]', border: 'border-[#224A33]/70' },
};

const getProjectTypeBadge = (type: ProjectType | string) => {
  switch (type.toLowerCase()) {
    case 'affiche':
      return { label: 'Affiche', icon: <FileImage className="w-3.5 h-3.5 text-[#816C07]" />, bg: 'bg-[#816C07]/15 border-[#816C07]/30 text-[#F5F5DC]' };
    case 'bache':
      return { label: 'Bâche Grand Format', icon: <Maximize2 className="w-3.5 h-3.5 text-[#224A33]" />, bg: 'bg-[#224A33]/20 border-[#224A33]/40 text-[#F5F5DC]' };
    case 'logo':
      return { label: 'Logo / Branding', icon: <Sparkles className="w-3.5 h-3.5 text-[#816C07]" />, bg: 'bg-[#816C07]/20 border-[#816C07]/40 text-[#F8F8F8]' };
    case 'carte_visite':
      return { label: 'Carte de Visite', icon: <CreditCard className="w-3.5 h-3.5 text-[#335A79]" />, bg: 'bg-[#335A79]/20 border-[#335A79]/40 text-[#F8F8F8]' };
    case 'badge':
      return { label: 'Badge Événementiel', icon: <Tag className="w-3.5 h-3.5 text-[#D4C9BF]" />, bg: 'bg-[#335A79]/15 border-[#335A79]/30 text-[#D4C9BF]' };
    case 'web_ia':
      return { label: 'Site Web IA', icon: <Monitor className="w-3.5 h-3.5 text-[#335A79]" />, bg: 'bg-[#335A79]/25 border-[#335A79]/50 text-[#F8F8F8]' };
    default:
      return { label: type, icon: <FileText className="w-3.5 h-3.5 text-[#D4C9BF]" />, bg: 'bg-[#141c2e] border-[#335A79]/30 text-[#D4C9BF]' };
  }
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  briefs,
  onUpdateStatus,
  onAnalyzeWithAI,
  onDeleteBrief,
  onPrintBrief,
  onAddNewBriefDirectly,
}) => {
  // Main Navigation Tabs
  const [adminTab, setAdminTab] = useState<'briefs' | 'templates'>('briefs');

  // Briefs Tab State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedBrief, setSelectedBrief] = useState<BriefData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [copiedQuote, setCopiedQuote] = useState(false);

  // Edit fields inside detail modal
  const [editStatus, setEditStatus] = useState<BriefStatus>('nouveau');
  const [editNotes, setEditNotes] = useState('');
  const [editPrice, setEditPrice] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);

  // Templates Tab State
  const [templates, setTemplates] = useState<BriefTemplate[]>(INITIAL_TEMPLATES);
  const [templateCategoryFilter, setTemplateCategoryFilter] = useState<string>('all');
  const [templateSearchTerm, setTemplateSearchTerm] = useState<string>('');
  
  // Template Creation & Edit Modal
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<BriefTemplate | null>(null);

  // Quick Generation Modal State
  const [selectedTemplateForGen, setSelectedTemplateForGen] = useState<BriefTemplate | null>(null);

  // WhatsApp Availability Status State ('available' | 'busy')
  const [whatsappStatus, setWhatsappStatus] = useState<'available' | 'busy'>(() => {
    return (localStorage.getItem('hadara_designer_whatsapp_status') as 'available' | 'busy') || 'available';
  });

  const handleUpdateWhatsAppStatus = (newStatus: 'available' | 'busy') => {
    setWhatsappStatus(newStatus);
    localStorage.setItem('hadara_designer_whatsapp_status', newStatus);
    window.dispatchEvent(new Event('whatsappStatusChange'));
  };

  const [quickGenForm, setQuickGenForm] = useState({
    clientName: '',
    organization: '',
    whatsapp: '',
    desiredDeliveryDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
  });
  const [isGeneratingBrief, setIsGeneratingBrief] = useState(false);

  // Template Modal Form
  const [templateForm, setTemplateForm] = useState<Omit<BriefTemplate, 'id' | 'usageCount'>>({
    title: '',
    category: 'Magal',
    description: '',
    projectType: 'affiche',
    technicalFormat: 'A3_A4',
    customDimensions: 'A3 / Format Web 1080x1350',
    defaultMainTitle: '',
    defaultFullTextContent: '',
    stylePreferences: ['spirituel', 'luxueux'],
    preferredColors: 'Vert Émeraude, Doré, Blanc',
    avoidColors: 'Rouge vif',
    defaultBudgetRange: '50k-80k',
    suggestedPriceFCFA: 50000,
  });

  // Fetch templates from server on mount
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/templates/`);
        if (res.ok) {
          const data = await res.json();
          if (data.templates && data.templates.length > 0) {
            setTemplates(data.templates);
          }
        }
      } catch (err) {
        console.warn('Fallback to initial templates array');
      }
    };
    fetchTemplates();
  }, []);

  const filteredBriefs = briefs.filter((b) => {
    const matchesSearch = 
      b.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.mainTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.whatsapp.includes(searchTerm);

    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenueFCFA = briefs.reduce((acc, b) => acc + (b.quotedPriceFCFA || 0), 0);
  const newBriefsCount = briefs.filter((b) => b.status === 'nouveau').length;

  // Filter templates
  const filteredTemplates = templates.filter((tpl) => {
    const matchesCategory = templateCategoryFilter === 'all' || tpl.category.toLowerCase() === templateCategoryFilter.toLowerCase();
    const matchesSearch = 
      tpl.title.toLowerCase().includes(templateSearchTerm.toLowerCase()) ||
      tpl.description.toLowerCase().includes(templateSearchTerm.toLowerCase()) ||
      tpl.defaultMainTitle.toLowerCase().includes(templateSearchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleOpenDetail = (brief: BriefData) => {
    setSelectedBrief(brief);
    setEditStatus(brief.status);
    setEditNotes(brief.designerNotes || '');
    setEditPrice(brief.quotedPriceFCFA || 0);
  };

  const handleSaveChanges = async () => {
    if (!selectedBrief) return;
    setIsSaving(true);
    try {
      await onUpdateStatus(selectedBrief.id, editStatus, editNotes, editPrice);
      setSelectedBrief((prev) => prev ? {
        ...prev,
        status: editStatus,
        designerNotes: editNotes,
        quotedPriceFCFA: editPrice
      } : null);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRunAIAnalysis = async () => {
    if (!selectedBrief) return;
    setIsAnalyzing(true);
    try {
      const result = await onAnalyzeWithAI(selectedBrief.id);
      if (result) {
        setSelectedBrief((prev) => prev ? { ...prev, aiAnalysis: result } : null);
        if (result.suggestedPriceFCFA && !editPrice) {
          setEditPrice(result.suggestedPriceFCFA);
        }
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopyWhatsAppQuote = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedQuote(true);
    setTimeout(() => setCopiedQuote(false), 3000);
  };

  // Template Actions
  const handleOpenNewTemplateModal = () => {
    setEditingTemplate(null);
    setTemplateForm({
      title: '',
      category: 'Magal',
      description: '',
      projectType: 'affiche',
      technicalFormat: 'A3_A4',
      customDimensions: 'A3 / Format Web 1080x1350',
      defaultMainTitle: '',
      defaultFullTextContent: '',
      stylePreferences: ['spirituel', 'luxueux'],
      preferredColors: 'Vert Émeraude, Doré, Blanc',
      avoidColors: 'Rouge vif',
      defaultBudgetRange: '50k-80k',
      suggestedPriceFCFA: 50000,
    });
    setIsTemplateModalOpen(true);
  };

  const handleEditTemplateModal = (tpl: BriefTemplate) => {
    setEditingTemplate(tpl);
    setTemplateForm({
      title: tpl.title,
      category: tpl.category,
      description: tpl.description,
      projectType: tpl.projectType,
      technicalFormat: tpl.technicalFormat,
      customDimensions: tpl.customDimensions || '',
      defaultMainTitle: tpl.defaultMainTitle,
      defaultFullTextContent: tpl.defaultFullTextContent,
      stylePreferences: tpl.stylePreferences,
      preferredColors: tpl.preferredColors,
      avoidColors: tpl.avoidColors,
      defaultBudgetRange: tpl.defaultBudgetRange,
      suggestedPriceFCFA: tpl.suggestedPriceFCFA,
    });
    setIsTemplateModalOpen(true);
  };

  const handleSaveTemplateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTemplate) {
        // Update existing
        const updatedTpl = { ...editingTemplate, ...templateForm };
        const res = await fetch(`${API_BASE}/api/templates/${editingTemplate.id}/`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(templateForm),
        });
        if (res.ok) {
          setTemplates((prev) => prev.map((t) => t.id === editingTemplate.id ? updatedTpl : t));
        } else {
          setTemplates((prev) => prev.map((t) => t.id === editingTemplate.id ? updatedTpl : t));
        }
      } else {
        // Create new
        const newTpl: BriefTemplate = {
          ...templateForm,
          id: `TPL-${templateForm.category.toUpperCase().slice(0, 4)}-${Date.now().toString().slice(-3)}`,
          usageCount: 0,
        };
        const res = await fetch(`${API_BASE}/api/templates/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newTpl),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.template) {
            setTemplates((prev) => [...prev, data.template]);
          } else {
            setTemplates((prev) => [...prev, newTpl]);
          }
        } else {
          setTemplates((prev) => [...prev, newTpl]);
        }
      }
      setIsTemplateModalOpen(false);
    } catch (err) {
      console.error('Error saving template:', err);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer ce modèle de la bibliothèque ?')) return;
    try {
      await fetch(`${API_BASE}/api/templates/${id}/`, { method: 'DELETE' });
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error('Error deleting template:', err);
    }
  };

  // Generate Quick Brief from Template
  const handleGenerateBriefFromTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplateForGen) return;

    setIsGeneratingBrief(true);
    try {
      const briefToCreate: Omit<BriefData, 'id' | 'createdAt' | 'status'> = {
        clientName: quickGenForm.clientName || 'Client Express',
        organization: quickGenForm.organization || `Dahira / Event ${selectedTemplateForGen.category}`,
        whatsapp: quickGenForm.whatsapp || '+221 77 000 00 00',
        email: 'client@hadara.sn',
        cityCountry: 'Dakar, Sénégal',
        projectType: selectedTemplateForGen.projectType,
        contextDescription: selectedTemplateForGen.description,
        primaryObjective: `Projet généré depuis le modèle "${selectedTemplateForGen.title}".`,
        targetAudience: 'Membres du Dahira & Public',
        targetAudienceChips: ['Disciples & Talibés', 'Familles'],
        mainTitle: selectedTemplateForGen.defaultMainTitle,
        fullTextContent: selectedTemplateForGen.defaultFullTextContent,
        stylePreferences: selectedTemplateForGen.stylePreferences,
        preferredColors: selectedTemplateForGen.preferredColors,
        avoidColors: selectedTemplateForGen.avoidColors,
        technicalFormat: selectedTemplateForGen.technicalFormat,
        customDimensions: selectedTemplateForGen.customDimensions,
        usageType: 'both',
        budgetRange: selectedTemplateForGen.defaultBudgetRange,
        desiredDeliveryDate: quickGenForm.desiredDeliveryDate,
        attachments: [],
        acceptProcess: true,
        acceptDeadlines: true,
        quotedPriceFCFA: selectedTemplateForGen.suggestedPriceFCFA,
        designerNotes: `Créé automatiquement le ${new Date().toLocaleDateString('fr-FR')} via le modèle ${selectedTemplateForGen.id}`,
      };

      if (onAddNewBriefDirectly) {
        await onAddNewBriefDirectly(briefToCreate);
      } else {
        // Direct POST API fallback
        const res = await fetch(`${API_BASE}/api/briefs/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(briefToCreate),
        });
        if (res.ok) {
          window.location.reload();
        }
      }

      // Update usage count for template
      const updatedCount = (selectedTemplateForGen.usageCount || 0) + 1;
      fetch(`${API_BASE}/api/templates/${selectedTemplateForGen.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usageCount: updatedCount }),
      });
      setTemplates((prev) => prev.map((t) => t.id === selectedTemplateForGen.id ? { ...t, usageCount: updatedCount } : t));

      setSelectedTemplateForGen(null);
      setAdminTab('briefs');
    } catch (err) {
      console.error('Error generating quick brief:', err);
    } finally {
      setIsGeneratingBrief(false);
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto px-4 sm:px-6">
      
      {/* Top Header & Tab Switcher */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase">
                Espace Administration
              </span>
              <span className="text-xs text-slate-400">Graphiste de la Hadara</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-100 mt-1">
              Tableau de Bord & Modèles Récurrents
            </h2>
          </div>

          {/* Navigation Tabs (Demandes Clients vs Bibliothèque de modèles) */}
          <div className="flex items-center space-x-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 w-full sm:w-auto">
            <button
              onClick={() => setAdminTab('briefs')}
              className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center space-x-2 ${
                adminTab === 'briefs'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Demandes Clients ({briefs.length})</span>
            </button>

            <button
              onClick={() => setAdminTab('templates')}
              className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center space-x-2 ${
                adminTab === 'templates'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Bibliothèque de Modèles ({templates.length})</span>
            </button>
          </div>
        </div>

        {/* WhatsApp Availability Management Control Box */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="relative flex items-center justify-center shrink-0">
              <span className={`w-3.5 h-3.5 rounded-full ${whatsappStatus === 'available' ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
              <span className={`w-3.5 h-3.5 rounded-full ${whatsappStatus === 'available' ? 'bg-emerald-500' : 'bg-slate-400'} absolute top-0 left-0`} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-100">Statut Disponibilité WhatsApp</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                  whatsappStatus === 'available'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/80'
                    : 'bg-slate-800 text-slate-300 border border-slate-700'
                }`}>
                  {whatsappStatus === 'available' ? '🟢 En ligne (Réponse rapide)' : '⚪ Occupé (Réponse différée)'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Modifie la pastille du bouton flottant WhatsApp en temps réel pour tous les visiteurs du site.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto shrink-0">
            <button
              onClick={() => handleUpdateWhatsAppStatus('available')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
                whatsappStatus === 'available'
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/20 scale-105'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-slate-950" />
              <span>Disponible (Vert)</span>
            </button>

            <button
              onClick={() => handleUpdateWhatsAppStatus('busy')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
                whatsappStatus === 'busy'
                  ? 'bg-slate-300 text-slate-950 font-black shadow-lg scale-105'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-slate-600" />
              <span>Occupé (Gris)</span>
            </button>
          </div>
        </div>

        {/* Dynamic Stats Grid - Briefs Tab */}
        {adminTab === 'briefs' ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Card 1: Briefs en attente */}
            <div className="group p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#141c2e] to-[#0d131f] border border-[#816C07]/40 shadow-lg hover:shadow-[#816C07]/10 hover:border-[#816C07]/70 transition-all duration-300 space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-[#816C07]/15 border border-[#816C07]/30">
                  <FileText className="w-4 h-4 text-[#816C07]" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest font-mono text-[#816C07]/70 bg-[#816C07]/10 px-2 py-0.5 rounded-full">
                  {newBriefsCount > 0 ? '🔴 Urgent' : '✅ OK'}
                </span>
              </div>
              <div>
                <p className="text-3xl sm:text-4xl font-black font-mono text-[#F5F5DC] leading-none">{newBriefsCount}</p>
                <p className="text-[10px] font-serif font-bold uppercase tracking-wider text-[#816C07] mt-1">Briefs en attente</p>
                <p className="text-[10px] text-[#D4C9BF]/70 mt-0.5">À analyser & deviser</p>
              </div>
            </div>

            {/* Card 2: Projets en cours */}
            <div className="group p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#141c2e] to-[#0d131f] border border-[#224A33]/50 shadow-lg hover:border-[#224A33]/80 transition-all duration-300 space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-[#224A33]/20 border border-[#224A33]/40">
                  <Sparkles className="w-4 h-4 text-[#224A33]" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest font-mono text-emerald-400/80 bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-700/40">
                  En cours
                </span>
              </div>
              <div>
                <p className="text-3xl sm:text-4xl font-black font-mono text-[#F5F5DC] leading-none">
                  {briefs.filter(b => ['en_creation', 'validation', 'acompte_recu'].includes(b.status)).length}
                </p>
                <p className="text-[10px] font-serif font-bold uppercase tracking-wider text-emerald-500 mt-1">Projets en cours</p>
                <p className="text-[10px] text-[#D4C9BF]/70 mt-0.5">Création & validation</p>
              </div>
            </div>

            {/* Card 3: Devis envoyés */}
            <div className="group p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#141c2e] to-[#0d131f] border border-[#335A79]/50 shadow-lg hover:border-[#335A79]/80 transition-all duration-300 space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-[#335A79]/20 border border-[#335A79]/40">
                  <Clock className="w-4 h-4 text-[#335A79]" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest font-mono text-blue-300/70 bg-blue-950/40 px-2 py-0.5 rounded-full border border-blue-700/30">
                  En attente
                </span>
              </div>
              <div>
                <p className="text-3xl sm:text-4xl font-black font-mono text-[#F8F8F8] leading-none">
                  {briefs.filter(b => b.status === 'devis_envoye').length}
                </p>
                <p className="text-[10px] font-serif font-bold uppercase tracking-wider text-[#335A79] mt-1">Devis Envoyés</p>
                <p className="text-[10px] text-[#D4C9BF]/70 mt-0.5">En attente acompte 50%</p>
              </div>
            </div>

            {/* Card 4: Revenu Total */}
            <div className="group p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#816C07]/10 to-[#0d131f] border border-[#816C07]/50 shadow-lg shadow-[#816C07]/5 hover:border-[#816C07]/90 transition-all duration-300 space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-[#816C07]/25 border border-[#816C07]/50">
                  <CreditCard className="w-4 h-4 text-[#816C07]" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest font-mono text-[#816C07] bg-[#816C07]/15 px-2 py-0.5 rounded-full">
                  FCFA
                </span>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black font-mono text-[#F5F5DC] leading-tight">
                  {totalRevenueFCFA.toLocaleString('fr-FR')}
                </p>
                <p className="text-[10px] font-serif font-bold uppercase tracking-wider text-[#816C07] mt-1">Revenu Total Estimé</p>
                <p className="text-[10px] text-[#D4C9BF]/70 mt-0.5">Somme globale devisée</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#141c2e] to-[#0d131f] border border-[#816C07]/40 shadow-lg space-y-3">
              <div className="p-2 w-fit rounded-xl bg-[#816C07]/15 border border-[#816C07]/30">
                <BookOpen className="w-4 h-4 text-[#816C07]" />
              </div>
              <p className="text-3xl font-black font-mono text-[#F5F5DC]">{templates.length}</p>
              <div>
                <p className="text-[10px] font-serif font-bold uppercase tracking-wider text-[#816C07]">Modèles Disponibles</p>
                <p className="text-[10px] text-[#D4C9BF]/70">Briefs types configurés</p>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#141c2e] to-[#0d131f] border border-[#224A33]/50 shadow-lg space-y-3">
              <div className="p-2 w-fit rounded-xl bg-[#224A33]/20 border border-[#224A33]/40">
                <Sparkles className="w-4 h-4 text-[#224A33]" />
              </div>
              <p className="text-3xl font-black font-mono text-[#F5F5DC]">
                {templates.filter(t => ['Magal', 'Gamou'].includes(t.category)).length}
              </p>
              <div>
                <p className="text-[10px] font-serif font-bold uppercase tracking-wider text-emerald-500">Magal & Gamou</p>
                <p className="text-[10px] text-[#D4C9BF]/70">Événements majeurs</p>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#141c2e] to-[#0d131f] border border-[#335A79]/50 shadow-lg space-y-3">
              <div className="p-2 w-fit rounded-xl bg-[#335A79]/20 border border-[#335A79]/40">
                <Clock className="w-4 h-4 text-[#335A79]" />
              </div>
              <p className="text-3xl font-black font-mono text-[#F8F8F8]">
                {templates.filter(t => t.category === 'Conférences').length}
              </p>
              <div>
                <p className="text-[10px] font-serif font-bold uppercase tracking-wider text-[#335A79]">Conférences & Ziarra</p>
                <p className="text-[10px] text-[#D4C9BF]/70">Causeries & Dahiras</p>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#816C07]/10 to-[#0d131f] border border-[#816C07]/50 shadow-lg space-y-3">
              <div className="p-2 w-fit rounded-xl bg-[#816C07]/25 border border-[#816C07]/50">
                <Zap className="w-4 h-4 text-[#816C07]" />
              </div>
              <p className="text-3xl font-black font-mono text-[#F5F5DC]">
                {templates.reduce((acc, t) => acc + (t.usageCount || 0), 0)}
              </p>
              <div>
                <p className="text-[10px] font-serif font-bold uppercase tracking-wider text-[#816C07]">Projets Générés</p>
                <p className="text-[10px] text-[#D4C9BF]/70">Utilisations totales</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ================= SECTION 1: DEMANDES CLIENTS ================= */}
      {adminTab === 'briefs' && (
        <div className="space-y-6">
          {/* Filters & Search Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#141c2e]/90 p-4 rounded-2xl border border-[#335A79]/40">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-[#D4C9BF] absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Rechercher par nom, ID ou titre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0d131f] border border-[#335A79]/40 text-[#F8F8F8] text-xs focus:border-[#816C07] focus:outline-none"
              />
            </div>

            <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-xs">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all shrink-0 ${
                  statusFilter === 'all'
                    ? 'bg-[#816C07] text-[#F8F8F8] font-bold'
                    : 'bg-[#0d131f] text-[#D4C9BF] hover:text-[#F8F8F8]'
                }`}
              >
                Tous ({briefs.length})
              </button>

              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <button
                  key={key}
                  onClick={() => setStatusFilter(key)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all shrink-0 ${
                    statusFilter === key
                      ? 'bg-[#335A79] text-[#F8F8F8] border border-[#335A79] font-bold'
                      : 'bg-[#0d131f] text-[#D4C9BF] hover:text-[#F8F8F8]'
                  }`}
                >
                  {cfg.label}
                </button>
              ))}
            </div>
          </div>

          {/* Briefs Grid */}
          {filteredBriefs.length === 0 ? (
            <div className="p-12 rounded-3xl bg-[#141c2e]/80 border border-[#335A79]/40 text-center space-y-3">
              <FileText className="w-10 h-10 text-[#D4C9BF] mx-auto" />
              <h3 className="text-base font-serif font-bold text-[#F8F8F8]">Aucun brief ne correspond aux critères</h3>
              <p className="text-xs text-[#D4C9BF]">Essayez de modifier votre recherche ou le filtre de statut.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              {filteredBriefs.map((brief) => {
                const statusCfg = STATUS_CONFIG[brief.status] || STATUS_CONFIG.nouveau;
                const typeBadge = getProjectTypeBadge(brief.projectType);

                return (
                  <div
                    key={brief.id}
                    className="p-5 sm:p-6 rounded-2xl bg-[#141c2e]/80 border border-[#335A79]/40 hover:border-[#816C07]/60 backdrop-blur-md transition-all flex flex-col justify-between gap-4 shadow-xl group"
                  >
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg bg-[#0d131f] text-[#816C07] border border-[#816C07]/30">
                          {brief.id}
                        </span>

                        <span className={`inline-flex items-center space-x-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                          <span>{statusCfg.label}</span>
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center space-x-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-lg border ${typeBadge.bg}`}>
                          {typeBadge.icon}
                          <span>{typeBadge.label}</span>
                        </span>
                      </div>

                      <h3 className="text-base font-serif font-bold text-[#F8F8F8] group-hover:text-[#F5F5DC] transition-colors leading-snug">
                        "{brief.mainTitle}"
                      </h3>

                      <div className="space-y-1.5 text-xs text-[#D4C9BF]">
                        <div className="flex items-center space-x-1.5 font-semibold text-[#F8F8F8]">
                          <User className="w-3.5 h-3.5 text-[#816C07]" />
                          <span>{brief.clientName} ({brief.organization || 'Particulier'})</span>
                        </div>

                        <div className="flex items-center justify-between text-xs pt-1 border-t border-[#335A79]/20">
                          <span className="flex items-center space-x-1.5 text-[#224A33] font-semibold">
                            <Phone className="w-3.5 h-3.5 text-[#224A33]" />
                            <span>{brief.whatsapp}</span>
                          </span>

                          <span className="flex items-center space-x-1.5 text-[#D4C9BF]">
                            <Calendar className="w-3.5 h-3.5 text-[#816C07]" />
                            <span>{brief.desiredDeliveryDate}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-[#335A79]/30 pt-3 mt-1">
                      <div>
                        <p className="text-[10px] text-[#D4C9BF] uppercase font-serif font-bold tracking-wider">Tarif Devis</p>
                        <p className="text-sm font-extrabold text-[#F5F5DC] font-mono">
                          {brief.quotedPriceFCFA ? `${brief.quotedPriceFCFA.toLocaleString('fr-FR')} FCFA` : brief.budgetRange}
                        </p>
                      </div>

                      <button
                        onClick={() => handleOpenDetail(brief)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#816C07] to-[#a38b12] hover:from-[#927b08] hover:to-[#b59b15] text-[#F8F8F8] font-serif font-bold text-xs shadow-md transition-all flex items-center space-x-2 active:scale-95 border border-[#816C07]/40"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#F8F8F8]" />
                        <span>Ouvrir Brief</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= SECTION 2: BIBLIOTHÈQUE DE MODÈLES ================= */}
      {adminTab === 'templates' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Rechercher un modèle..."
                value={templateSearchTerm}
                onChange={(e) => setTemplateSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:border-amber-400 focus:outline-none"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-xs">
              {['all', 'Magal', 'Gamou', 'Conférences', 'Appel aux Dons'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setTemplateCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all shrink-0 ${
                    templateCategoryFilter === cat
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat === 'all' ? 'Toutes les catégories' : cat}
                </button>
              ))}
            </div>

            {/* Add New Template Button */}
            <button
              onClick={handleOpenNewTemplateModal}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-amber-400 hover:brightness-110 text-slate-950 font-extrabold text-xs shadow-md transition-all flex items-center justify-center space-x-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Nouveau Modèle</span>
            </button>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredTemplates.map((tpl) => (
              <div
                key={tpl.id}
                className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-all space-y-5 flex flex-col justify-between shadow-xl relative group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-400 font-mono font-bold text-[11px] border border-amber-500/20">
                        {tpl.id}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 font-bold text-[10px] border border-emerald-800">
                        {tpl.category}
                      </span>
                    </div>

                    <span className="text-[11px] text-slate-400 font-mono">
                      Utilisé <strong className="text-amber-400">{tpl.usageCount || 0} fois</strong>
                    </span>
                  </div>

                  <h3 className="text-lg font-serif font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
                    {tpl.title}
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {tpl.description}
                  </p>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1 text-xs">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Titre par Défaut :</p>
                    <p className="font-bold text-slate-100 font-mono text-xs">"{tpl.defaultMainTitle}"</p>
                  </div>

                  {/* Preset Spec Badges */}
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/60">
                      <span className="text-slate-400 block text-[10px]">Format & Type</span>
                      <strong className="text-slate-200 capitalize">{tpl.projectType} ({tpl.technicalFormat})</strong>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/60">
                      <span className="text-slate-400 block text-[10px]">Tarif Suggéré</span>
                      <strong className="text-emerald-400 font-mono">{tpl.suggestedPriceFCFA.toLocaleString('fr-FR')} FCFA</strong>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/60 col-span-2">
                      <span className="text-slate-400 block text-[10px]">Palette de Couleurs</span>
                      <span className="text-amber-300 font-medium">{tpl.preferredColors}</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleEditTemplateModal(tpl)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
                      title="Modifier ce modèle"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteTemplate(tpl)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 text-xs font-bold transition-all"
                      title="Supprimer ce modèle"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedTemplateForGen(tpl);
                      setQuickGenForm((prev) => ({
                        ...prev,
                        organization: `Dahira / Commande ${tpl.category}`
                      }));
                    }}
                    className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs shadow-md transition-all flex items-center space-x-1.5"
                  >
                    <Zap className="w-4 h-4" />
                    <span>Générer un Projet Rapide</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= MODAL 1: DETAIL BRIEF MODAL ================= */}
      {selectedBrief && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold text-amber-400 px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                    {selectedBrief.id}
                  </span>
                  <span className="text-xs text-slate-400">Soumis le {new Date(selectedBrief.createdAt).toLocaleDateString('fr-FR')}</span>
                </div>
                <h3 className="text-xl font-serif font-bold text-slate-100">
                  Brief : {selectedBrief.mainTitle}
                </h3>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onPrintBrief(selectedBrief)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center space-x-1"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-400" />
                  <span>PDF Print</span>
                </button>

                <button
                  onClick={() => setSelectedBrief(null)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

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
                  onClick={handleSaveChanges}
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
      )}

      {/* ================= MODAL 2: EDIT/CREATE TEMPLATE MODAL ================= */}
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

      {/* ================= MODAL 3: QUICK BRIEF GENERATOR FROM TEMPLATE ================= */}
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

    </div>
  );
};
