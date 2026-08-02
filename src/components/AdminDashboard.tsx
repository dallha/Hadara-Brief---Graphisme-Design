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
  Monitor,
  Users,
  Settings,
  Download,
  LogOut,
  BarChart3,
  Bell,
  Cloud,
  ShoppingBag
} from 'lucide-react';
import { BriefData, BriefStatus, AIAnalysisResult, BriefTemplate, ProjectType, TechnicalFormat, StylePreference, BudgetRange, SamplePortfolioItem, UserRole, StoreProduct } from '../types';

import { AnalyticsTab } from './admin/AnalyticsTab';
import { CRMTab } from './admin/CRMTab';
import { SettingsTab } from './admin/SettingsTab';
import { PortfolioTab } from './admin/PortfolioTab';
import { KanbanTab } from './admin/KanbanTab';
import { Project360Modal } from './admin/Project360Modal';
import { FinanceTab } from './admin/FinanceTab';
import { CalendarTab } from './admin/CalendarTab';
import { NotificationsTab } from './admin/NotificationsTab';
import { ResourceLibraryTab } from './admin/ResourceLibraryTab';
import { HadaraAICenterTab } from './admin/HadaraAICenterTab';
import { BusinessIntelligenceTab } from './admin/BusinessIntelligenceTab';
import { HadaraCloudTab } from './admin/HadaraCloudTab';
import { GlobalSearchModal } from './admin/GlobalSearchModal';
import { TrashBinModal } from './admin/TrashBinModal';
import { ESignatureModal } from './admin/ESignatureModal';
import { BriefDetailsModal } from './admin/modals/BriefDetailsModal';
import { NewBriefModal } from './admin/modals/NewBriefModal';
import { TemplateModals } from './admin/modals/TemplateModals';
import { StudioOnboardingModal } from './admin/modals/StudioOnboardingModal';
import { ClientPortalView } from './client/ClientPortalView';
import { StoreTab } from './admin/StoreTab';

interface SoftDeleteTrashItem {
  id: string;
  type: string;
  title: string;
  deletedAt: string;
}

interface AdminDashboardProps {
  briefs: BriefData[];
  portfolioItems?: SamplePortfolioItem[];
  storeProducts?: StoreProduct[];
  onUpdateStatus: (briefId: string, status: BriefStatus, notes?: string, price?: number) => Promise<void>;
  onUpdateBriefEnriched?: (updated: BriefData) => Promise<void>;
  onAnalyzeWithAI: (briefId: string) => Promise<AIAnalysisResult | null>;
  onDeleteBrief: (briefId: string) => Promise<void>;
  onPrintBrief: (brief: BriefData) => void;
  onAddNewBriefDirectly?: (briefData: Omit<BriefData, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  onAddPortfolioItem?: (item: Omit<SamplePortfolioItem, 'id'>) => Promise<void>;
  onUpdatePortfolioItem?: (id: string, updatedItem: Partial<SamplePortfolioItem>) => Promise<void>;
  onDeletePortfolioItem?: (id: string) => Promise<void>;
  onAddStoreProduct?: (product: Omit<StoreProduct, 'id' | 'createdAt'>) => Promise<void>;
  onUpdateStoreProduct?: (id: string, updatedProduct: Partial<StoreProduct>) => Promise<void>;
  onDeleteStoreProduct?: (id: string) => Promise<void>;
  onLogout?: () => void;
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
  if (!type) type = 'autre';
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
  portfolioItems,
  storeProducts,
  onUpdateStatus,
  onUpdateBriefEnriched,
  onAnalyzeWithAI,
  onDeleteBrief,
  onPrintBrief,
  onAddNewBriefDirectly,
  onAddPortfolioItem,
  onUpdatePortfolioItem,
  onDeletePortfolioItem,
  onAddStoreProduct,
  onUpdateStoreProduct,
  onDeleteStoreProduct,
  onLogout,
}) => {
  // Main Navigation Tabs
  const [adminTab, setAdminTab] = useState<'kanban' | 'briefs' | 'bi' | 'finance' | 'calendar' | 'notifications' | 'resources' | 'ai_studio' | 'crm' | 'analytics' | 'portfolio' | 'cloud' | 'settings'>('kanban');

  // Modals & Hardening State
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  const [isTrashBinOpen, setIsTrashBinOpen] = useState(false);
  const [eSignBrief, setESignBrief] = useState<BriefData | null>(null);

  const [softDeletedItems, setSoftDeletedItems] = useState<SoftDeleteTrashItem[]>([]);

  // Client Portal Toggle State
  const [showClientPortal, setShowClientPortal] = useState(false);

  // Multi-Tenant Studio Onboarding State
  const [isStudioModalOpen, setIsStudioModalOpen] = useState(false);
  
  // User Role State
  const [userRole, setUserRole] = useState<UserRole>('admin');

  // Selected 360 Project Modal
  const [selected360Brief, setSelected360Brief] = useState<BriefData | null>(null);
  const [isNewBriefModalOpen, setIsNewBriefModalOpen] = useState(false);
  const [newBriefForm, setNewBriefForm] = useState<Partial<BriefData>>({
    clientName: '', whatsapp: '', projectType: 'affiche', mainTitle: '', budgetRange: 'sur_devis'
  });

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
  const [templates, setTemplates] = useState<BriefTemplate[]>([]);
  const [templateCategoryFilter, setTemplateCategoryFilter] = useState<string>('all');
  const [templateSearchTerm, setTemplateSearchTerm] = useState<string>('');
  
  // Template Creation & Edit Modal
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<BriefTemplate | null>(null);

  // Quick Generation Modal State
  const [selectedTemplateForGen, setSelectedTemplateForGen] = useState<BriefTemplate | null>(null);

  // WhatsApp Availability Status State ('available' | 'busy')
  const [whatsappStatus, setWhatsappStatus] = useState<'available' | 'busy'>(
    () => (localStorage.getItem('hadara_designer_whatsapp_status') as 'available' | 'busy') || 'available'
  );

  const handleUpdateWhatsAppStatus = (newStatus: 'available' | 'busy') => {
    setWhatsappStatus(newStatus);
    localStorage.setItem('hadara_designer_whatsapp_status', newStatus);
    window.dispatchEvent(new Event('whatsappStatusChange'));
  };

  const exportCSV = () => {
    const headers = ['ID', 'Date', 'Client', 'WhatsApp', 'Projet', 'Statut', 'Prix FCFA'];
    const rows = briefs.map(b => [b.id, b.createdAt, b.clientName, b.whatsapp, b.projectType, b.status, b.quotedPriceFCFA || 0]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "hadara_briefs.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  const safeBriefs = Array.isArray(briefs) ? briefs : [];

  const filteredBriefs = safeBriefs.filter((b) => {
    const sTerm = searchTerm.toLowerCase();
    const matchesSearch = 
      (b.clientName && b.clientName.toLowerCase().includes(sTerm)) ||
      (b.id && b.id.toLowerCase().includes(sTerm)) ||
      (b.mainTitle && b.mainTitle.toLowerCase().includes(sTerm)) ||
      (b.whatsapp && b.whatsapp.includes(searchTerm));

    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenueFCFA = safeBriefs.reduce((acc, b) => acc + (b.quotedPriceFCFA || 0), 0);
  const newBriefsCount = safeBriefs.filter((b) => b.status === 'nouveau').length;

  // Filter templates
  const filteredTemplates = templates.filter((tpl) => {
    const matchesCategory = templateCategoryFilter === 'all' || (tpl.category && tpl.category.toLowerCase() === templateCategoryFilter.toLowerCase());
    const matchesSearch = 
      (tpl.title && tpl.title.toLowerCase().includes(templateSearchTerm.toLowerCase())) ||
      (tpl.description && tpl.description.toLowerCase().includes(templateSearchTerm.toLowerCase())) ||
      (tpl.defaultMainTitle && tpl.defaultMainTitle.toLowerCase().includes(templateSearchTerm.toLowerCase()));
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
    <div className="space-y-8 pb-16 max-w-7xl mx-auto px-4 sm:px-6 w-full min-w-0">
      
      {/* Top Header & Tab Switcher */}
      <div className="p-4 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-5 w-full min-w-0 overflow-hidden">
        
        {/* Top Controls Row */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-800 pb-4 w-full min-w-0">
          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-bold uppercase shrink-0">
                Hadara Manager ERP
              </span>
              <span className="text-xs text-slate-400 truncate">Studio Graphique Pro</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-100 mt-0.5 truncate">
              Tableau de Bord & Production ERP
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto shrink-0">
            {/* Role Switcher Selector */}
            <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 font-bold px-1.5">Rôle:</span>
              {(['admin', 'graphiste', 'client'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setUserRole(r)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-extrabold uppercase transition-all ${
                    userRole === r
                      ? 'bg-slate-800 text-amber-400 border border-slate-700'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* Portal, Search, Trash & Studio Action Buttons */}
            <div className="flex items-center space-x-1.5 max-w-full overflow-x-auto">
              <button
                onClick={() => setIsGlobalSearchOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all flex items-center space-x-1 shrink-0"
                title="Recherche Globale (Cmd + K)"
              >
                <Search className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Recherche (Cmd+K)</span>
              </button>
              <button
                onClick={() => setIsTrashBinOpen(true)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 transition-all shrink-0"
                title="Corbeille & Restauration"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowClientPortal(true)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all flex items-center space-x-1 shrink-0"
              >
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Portail Client</span>
              </button>
              <button
                onClick={() => setIsStudioModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold text-xs transition-all flex items-center space-x-1 border border-amber-500/30 shrink-0"
              >
                <Building className="w-3.5 h-3.5 text-amber-400" />
                <span>+ Studio</span>
              </button>

              {/* Logout Button */}
              {onLogout && (
                <button
                  onClick={onLogout}
                  title="Se déconnecter"
                  className="px-3 py-1.5 rounded-xl bg-red-950/30 text-red-400 hover:bg-red-500 hover:text-slate-50 border border-red-500/20 hover:border-red-500 transition-all flex items-center space-x-1 font-bold text-xs shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* WhatsApp Availability Management Control Box (Ultra-Compact Mobile-First) */}
        <div className="p-2.5 sm:p-3 rounded-2xl bg-slate-950/90 border border-emerald-500/30 flex items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="relative flex items-center justify-center shrink-0">
              <span className={`w-3 h-3 rounded-full ${whatsappStatus === 'available' ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
              <span className={`w-3 h-3 rounded-full ${whatsappStatus === 'available' ? 'bg-emerald-500' : 'bg-slate-400'} absolute top-0 left-0`} />
            </div>
            <div className="flex items-center space-x-2 truncate">
              <span className="text-xs font-bold text-slate-200 truncate">WhatsApp :</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase shrink-0 ${
                whatsappStatus === 'available'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/80'
                  : 'bg-slate-800 text-slate-300 border border-slate-700'
              }`}>
                {whatsappStatus === 'available' ? '🟢 En ligne' : '⚪ Occupé'}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800 shrink-0">
            <button
              onClick={() => handleUpdateWhatsAppStatus('available')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all flex items-center space-x-1 ${
                whatsappStatus === 'available'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Disponible</span>
            </button>
            <button
              onClick={() => handleUpdateWhatsAppStatus('busy')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all flex items-center space-x-1 ${
                whatsappStatus === 'busy'
                  ? 'bg-slate-300 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Occupé</span>
            </button>
          </div>
        </div>

        {/* Dynamic Stats Grid - Ultra-Compact Mobile-First */}
        {adminTab !== 'templates' ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
            {/* Card 1: Briefs en attente */}
            <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-[#141c2e] to-[#0d131f] border border-[#816C07]/40 shadow-md space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="p-1.5 rounded-lg bg-[#816C07]/15 border border-[#816C07]/30">
                  <FileText className="w-3.5 h-3.5 text-[#816C07]" />
                </div>
                <span className="text-[9px] font-black uppercase font-mono text-[#816C07] bg-[#816C07]/10 px-1.5 py-0.5 rounded-full">
                  {newBriefsCount > 0 ? '🔴 Urgent' : '✅ OK'}
                </span>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black font-mono text-[#F5F5DC] leading-none">{newBriefsCount}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#816C07] mt-1 truncate">Briefs en attente</p>
              </div>
            </div>

            {/* Card 2: Projets en cours */}
            <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-[#141c2e] to-[#0d131f] border border-[#224A33]/50 shadow-md space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="p-1.5 rounded-lg bg-[#224A33]/20 border border-[#224A33]/40">
                  <Sparkles className="w-3.5 h-3.5 text-[#224A33]" />
                </div>
                <span className="text-[9px] font-black uppercase font-mono text-emerald-400 bg-emerald-950/50 px-1.5 py-0.5 rounded-full">
                  En cours
                </span>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black font-mono text-[#F5F5DC] leading-none">
                  {safeBriefs.filter(b => ['en_creation', 'validation', 'acompte_recu'].includes(b.status)).length}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 mt-1 truncate">Projets en cours</p>
              </div>
            </div>

            {/* Card 3: Devis envoyés */}
            <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-[#141c2e] to-[#0d131f] border border-[#335A79]/50 shadow-md space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="p-1.5 rounded-lg bg-[#335A79]/20 border border-[#335A79]/40">
                  <Clock className="w-3.5 h-3.5 text-[#335A79]" />
                </div>
                <span className="text-[9px] font-black uppercase font-mono text-blue-300 bg-blue-950/40 px-1.5 py-0.5 rounded-full">
                  En attente
                </span>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black font-mono text-[#F8F8F8] leading-none">
                  {safeBriefs.filter(b => b.status === 'devis_envoye').length}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#335A79] mt-1 truncate">Devis Envoyés</p>
              </div>
            </div>

            {/* Card 4: Revenu Total */}
            <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-[#816C07]/10 to-[#0d131f] border border-[#816C07]/50 shadow-md space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="p-1.5 rounded-lg bg-[#816C07]/25 border border-[#816C07]/50">
                  <CreditCard className="w-3.5 h-3.5 text-[#816C07]" />
                </div>
                <span className="text-[9px] font-black uppercase font-mono text-[#816C07] bg-[#816C07]/15 px-1.5 py-0.5 rounded-full">
                  FCFA
                </span>
              </div>
              <div>
                <p className="text-lg sm:text-xl font-black font-mono text-[#F5F5DC] leading-none">
                  {totalRevenueFCFA.toLocaleString('fr-FR')} F
                </p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#816C07] mt-1 truncate">Revenu Devisé</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#141c2e] to-[#0d131f] border border-[#816C07]/40 shadow-lg space-y-3">
              <div className="p-2 w-fit rounded-xl bg-[#816C07]/15 border border-[#816C07]/30">
                <BookOpen className="w-4 h-4 text-[#816C07]" />
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black text-amber-400">
                  {(templates || []).length}
                </p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Modèles d'Offres</p>
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <p className="text-2xl sm:text-3xl font-black text-slate-100">
                100%
              </p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Performance</p>
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

      {/* 13 Navigation Tabs Bar (Scrollable & Ultra-Responsive) */}
      <div className="w-full min-w-0 overflow-x-auto pb-1 scrollbar-none bg-slate-900 p-1.5 sm:p-2.5 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex items-center space-x-1.5 sm:space-x-2 min-w-max">
          {[
            { id: 'kanban', icon: Layers, label: 'Kanban ERP' },
            { id: 'briefs', icon: FileText, label: 'Briefs' },
            { id: 'store', icon: ShoppingBag, label: 'Hadara Store' },
            { id: 'bi', icon: BarChart3, label: 'Dashboard BI' },
            { id: 'finance', icon: CreditCard, label: 'Finance' },
            { id: 'calendar', icon: Calendar, label: 'Calendrier' },
            { id: 'notifications', icon: Bell, label: 'Notifications' },
            { id: 'resources', icon: BookOpen, label: 'Ressources' },
            { id: 'ai_studio', icon: Bot, label: 'Hadara AI Studio' },
            { id: 'cloud', icon: Cloud, label: 'Hadara Cloud' },
            { id: 'crm', icon: Users, label: 'CRM Clients' },
            { id: 'analytics', icon: LayoutDashboard, label: 'Analytics' },
            { id: 'portfolio', icon: FileImage, label: 'Portfolio' },
            { id: 'settings', icon: Settings, label: 'Réglages' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setAdminTab(tab.id as any)}
              className={`shrink-0 whitespace-nowrap px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-xs font-extrabold transition-all flex items-center space-x-1.5 sm:space-x-2 ${
                adminTab === tab.id
                  ? 'bg-amber-400 text-slate-950 shadow-md scale-[1.02]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950 border border-slate-800/80'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ================= NEW SECTIONS ================= */}
      {adminTab === 'kanban' && (
        <KanbanTab 
          briefs={briefs} 
          userRole={userRole}
          onOpenProject360={(b) => setSelected360Brief(b)}
          onUpdateStatus={async (id, st) => onUpdateStatus(id, st)}
        />
      )}
      {adminTab === 'bi' && <BusinessIntelligenceTab briefs={briefs} />}
      {adminTab === 'finance' && <FinanceTab briefs={briefs} />}
      {adminTab === 'calendar' && <CalendarTab briefs={briefs} onOpenProject360={(b) => setSelected360Brief(b)} />}
      {adminTab === 'notifications' && <NotificationsTab briefs={briefs} />}
      {adminTab === 'resources' && <ResourceLibraryTab />}
      {adminTab === 'ai_studio' && <HadaraAICenterTab briefs={briefs} />}
      {adminTab === 'cloud' && <HadaraCloudTab />}
      {adminTab === 'analytics' && <AnalyticsTab briefs={briefs} />}
      {adminTab === 'crm' && <CRMTab briefs={briefs} />}
      {adminTab === 'settings' && <SettingsTab />}

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
                Tous ({safeBriefs.length})
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
            <div className="flex items-center gap-2 w-full lg:w-auto">
              <button onClick={exportCSV} className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center gap-2">
                <Download className="w-4 h-4 text-amber-400" /> <span className="hidden sm:inline">Export CSV</span>
              </button>
              <button onClick={() => setIsNewBriefModalOpen(true)} className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold transition-colors flex items-center gap-2 ml-auto">
                <Plus className="w-4 h-4" /> <span>Nouveau Brief</span>
              </button>
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

                  const exportCSV = () => {
    const headers = ['ID', 'Date', 'Client', 'WhatsApp', 'Projet', 'Statut', 'Prix FCFA'];
    const rows = briefs.map(b => [b.id, b.createdAt, b.clientName, b.whatsapp, b.projectType, b.status, b.quotedPriceFCFA || 0]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "hadara_briefs.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelected360Brief(brief)}
                          className="px-3 py-2 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 font-bold text-xs transition-all flex items-center space-x-1.5 border border-amber-400/30"
                        >
                          <Layers className="w-3.5 h-3.5" />
                          <span>Fiche 360°</span>
                        </button>
                        <button
                          onClick={() => handleOpenDetail(brief)}
                          className="px-3 py-2 rounded-xl bg-gradient-to-r from-[#816C07] to-[#a38b12] hover:from-[#927b08] hover:to-[#b59b15] text-[#F8F8F8] font-serif font-bold text-xs shadow-md transition-all flex items-center space-x-1.5 active:scale-95 border border-[#816C07]/40"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-[#F8F8F8]" />
                          <span>Ouvrir Brief</span>
                        </button>
                      </div>
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

      {adminTab === 'portfolio' && (
        <PortfolioTab 
          portfolioItems={portfolioItems || []} 
          onAddPortfolioItem={onAddPortfolioItem || (async () => {})} 
          onUpdatePortfolioItem={onUpdatePortfolioItem || (async () => {})}
          onDeletePortfolioItem={onDeletePortfolioItem || (async () => {})} 
        />
      )}

      {adminTab === 'store' && (
        <StoreTab 
          products={storeProducts || []}
          onAddProduct={onAddStoreProduct || (async () => {})}
          onUpdateProduct={onUpdateStoreProduct || (async () => {})}
          onDeleteProduct={onDeleteStoreProduct || (async () => {})}
        />
      )}
      <BriefDetailsModal 
        selectedBrief={selectedBrief} 
        onClose={() => setSelectedBrief(null)} 
        onPrintBrief={onPrintBrief} 
        onUpdateStatus={onUpdateStatus} 
        onAnalyzeWithAI={onAnalyzeWithAI} 
        onDeleteBrief={onDeleteBrief} 
      />
      {selected360Brief && (
        <Project360Modal
          brief={selected360Brief}
          userRole={userRole}
          onClose={() => setSelected360Brief(null)}
          onUpdateStatus={onUpdateStatus}
          onUpdateBriefEnriched={async (updated) => {
            if (onUpdateBriefEnriched) {
              await onUpdateBriefEnriched(updated);
            }
          }}
          onPrintBrief={onPrintBrief}
        />
      )}
      <TemplateModals 
        isTemplateModalOpen={isTemplateModalOpen} 
        setIsTemplateModalOpen={setIsTemplateModalOpen} 
        editingTemplate={editingTemplate} 
        setEditingTemplate={setEditingTemplate} 
        selectedTemplateForGen={selectedTemplateForGen} 
        setSelectedTemplateForGen={setSelectedTemplateForGen} 
        onAddNewBriefDirectly={onAddNewBriefDirectly} 
      />
      <NewBriefModal 
        isOpen={isNewBriefModalOpen} 
        onClose={() => setIsNewBriefModalOpen(false)} 
        onAddNewBriefDirectly={onAddNewBriefDirectly} 
      />
      <StudioOnboardingModal
        isOpen={isStudioModalOpen}
        onClose={() => setIsStudioModalOpen(false)}
        onStudioCreated={(st) => alert(`Nouveau Studio "${st.name}" créé avec succès !`)}
      />
      {showClientPortal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950">
          <ClientPortalView 
            briefs={briefs}
            onUpdateBriefEnriched={async (b) => {
              if (onUpdateBriefEnriched) {
                await onUpdateBriefEnriched(b);
              }
            }}
            onClosePortal={() => setShowClientPortal(false)}
          />
        </div>
      )}
      <GlobalSearchModal
        isOpen={isGlobalSearchOpen}
        onClose={() => setIsGlobalSearchOpen(false)}
        briefs={briefs}
        onOpenProject360={(b) => setSelected360Brief(b)}
      />
      <TrashBinModal
        isOpen={isTrashBinOpen}
        onClose={() => setIsTrashBinOpen(false)}
        deletedItems={softDeletedItems}
        onRestoreItem={(id) => setSoftDeletedItems(prev => prev.filter(i => i.id !== id))}
        onPermanentDelete={(id) => setSoftDeletedItems(prev => prev.filter(i => i.id !== id))}
      />
      {eSignBrief && (
        <ESignatureModal
          isOpen={!!eSignBrief}
          onClose={() => setESignBrief(null)}
          briefId={eSignBrief.id}
          clientName={eSignBrief.clientName}
          quotedPriceFCFA={eSignBrief.quotedPriceFCFA || 0}
          onSigned={(rec) => alert(`Devis ${rec.briefId} signé par ${rec.clientName} !`)}
        />
      )}
    </div>
  );
};
