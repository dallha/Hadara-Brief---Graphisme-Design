export type UserRole = 
  | 'super_admin'
  | 'studio_owner'
  | 'directeur_artistique'
  | 'graphiste_senior'
  | 'graphiste_junior'
  | 'commercial'
  | 'comptable'
  | 'client';

export type ProjectType = 
  | 'affiche'
  | 'bache'
  | 'flyer'
  | 'identite_visuelle'
  | 'site_web'
  | 'reseaux_sociaux'
  | 'pack_starter'
  | 'pack_event'
  | 'pack_hajj_oumrah'
  | 'broderie'
  | 'autre';

export type StylePreference = 
  | 'moderne'
  | 'classique'
  | 'minimaliste'
  | 'luxueux'
  | 'spirituel'
  | 'traditionnel';

export type TechnicalFormat = 
  | 'A3_A4'
  | 'bache_3x1'
  | 'flyer_A5'
  | 'post_RS'
  | 'story_vertical'
  | 'sur_mesure';

export type BudgetRange = 
  | '30k-50k'
  | '50k-80k'
  | '80k-120k'
  | 'sur_devis';

export type BriefStatus = 
  | 'nouveau'
  | 'devis_envoye'
  | 'acompte_recu'
  | 'en_creation'
  | 'validation'
  | 'termine';

export interface StudioTenantConfig {
  id: string;
  name: string;
  ownerName: string;
  ownerEmail: string;
  logoUrl?: string;
  primaryColor: string;
  customDomain?: string;
  subscriptionPlan: 'starter' | 'pro_studio' | 'enterprise_saas';
  waveNumber: string;
  omNumber: string;
  isWhiteLabelEnabled: boolean;
  createdAt: string;
}

export interface SoftDeleteTrashItem {
  id: string;
  originalId: string;
  entityType: 'brief' | 'client' | 'invoice' | 'template' | 'portfolio';
  title: string;
  deletedBy: string;
  deletedAt: string;
  data: any;
}

export interface ESignatureRecord {
  id: string;
  briefId: string;
  clientName: string;
  signatureDataUrl: string;
  ipAddress?: string;
  signedAt: string;
}

export interface SaaSMetricsCloud {
  activeStudiosCount: number;
  mrrFCFA: number;
  arrFCFA: number;
  churnRatePercentage: number;
  conversionRatePercentage: number;
  openSupportTicketsCount: number;
}

export interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  dataUrl?: string;
}

export interface DeliverableVersion {
  id: string;
  versionNumber: number;
  title: string;
  fileUrl: string;
  previewUrl?: string;
  originalFileUrl?: string;
  notes?: string;
  createdAt: string;
  status: 'draft' | 'client_review' | 'approved' | 'rejected';
}

export interface ActivityLogItem {
  id: string;
  timestamp: string;
  user: string;
  userRole: UserRole;
  action: string;
  details?: string;
}

export interface QualityCheckItem {
  id: string;
  label: string;
  completed: boolean;
}

export interface ClientBrandingAsset {
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  favoriteFonts?: string[];
  brandGuidelinesNotes?: string;
}

export interface ProjectComment {
  id: string;
  author: string;
  authorRole: UserRole;
  text: string;
  createdAt: string;
}

export interface InvoiceData {
  id: string;
  briefId: string;
  clientName: string;
  type: 'devis' | 'facture_acompte' | 'facture_solde' | 'recu';
  amountFCFA: number;
  paidAmountFCFA: number;
  status: 'brouillon' | 'envoye' | 'paye_partiel' | 'paye' | 'en_retard';
  paymentMethod?: 'wave' | 'orange_money' | 'free_money' | 'virement' | 'especes';
  dueDate: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  channel: 'internal' | 'whatsapp' | 'email';
  read: boolean;
  createdAt: string;
  briefId?: string;
}

export interface ResourceAssetItem {
  id: string;
  title: string;
  category: 'logo' | 'police' | 'palette' | 'mockup' | 'template' | 'document';
  fileUrl?: string;
  previewUrl?: string;
  description?: string;
  tags: string[];
  createdAt: string;
}

export interface BusinessIntelligenceMetrics {
  totalRevenueFCFA: number;
  totalPaidFCFA: number;
  totalPendingFCFA: number;
  averageMarginPercentage: number;
  quoteConversionRate: number;
  averageProductionDays: number;
  topClientLTV: { clientName: string; ltvFCFA: number }[];
  revenueByMonth: { month: string; amount: number }[];
}

// ─── HADARA AI BRIEF ANALYST ─────────────────────────────────────────────────

export type BriefAnalystStatut =
  | 'exploitable'
  | 'exploitable_sous_reserve'
  | 'incomplet'
  | 'refuser';

export type BriefAnalystDecision =
  | 'ACCEPTER'
  | 'ACCEPTER SOUS RÉSERVE'
  | 'CLARIFIER'
  | 'REFUSER';

export type BriefAnalystPriorite = 'Normal' | 'Urgent';

export type ClientFidelite = 'nouveau' | 'régulier' | 'ancien';

export interface BriefAnalystPricing {
  prix_min_fcfa: number;
  prix_max_fcfa: number;
  heures_min: number;
  heures_max: number;
  source: 'pricing_engine';
}

export interface BriefAnalystContexteClient {
  fidélité: ClientFidelite;
  nb_projets_precedents: number;
  facturation_totale_fcfa: number;
  solde_du_fcfa: number;
}

export interface BriefAnalystResult {
  statut_brief: BriefAnalystStatut;
  score_completude: number;
  complexite_percue: number;
  decision_recommandee: BriefAnalystDecision;
  raison_decision: string;
  informations_manquantes: string[];
  questions_client: string[];
  risques: string[];
  niveau_priorite: BriefAnalystPriorite;
  brouillon_whatsapp: string;
  pricing: BriefAnalystPricing;
  contexte_client: BriefAnalystContexteClient;
}

export type BriefAnalystStatus = 'idle' | 'loading' | 'success' | 'error' | 'fallback';

// ─── HADARA AI PRICING AGENT ─────────────────────────────────────────────────

export interface PricingFactor {
  facteur: string;
  impact: 'faible' | 'moyen' | 'élevé';
  detail: string;
}

export interface PricingExplication {
  resume: string;
  niveau_complexite: 'faible' | 'moyen' | 'élevé' | 'très_élevé';
  facteurs: PricingFactor[];
  heures_estimees: { min: number; max: number; justification: string };
}

export interface PricingStrategie {
  positionnement: 'standard' | 'premium' | 'économique';
  argument_client: string;
  approche: string;
  acompte_conseille_pourcentage: number;
  justification_acompte: string;
}

export interface PricingRisqueCommercial {
  risque: string;
  probabilité: 'faible' | 'moyenne' | 'élevée';
  mitigation: string;
}

export interface PricingAgentResult {
  prix_recommande: {
    source: 'pricing_engine';
    min: number;
    max: number;
  };
  explication: PricingExplication;
  strategie_commerciale: PricingStrategie;
  risques_commerciaux: PricingRisqueCommercial[];
  contexte_client: {
    type_relation: string;
    note: string;
  };
  brouillon_devis: string;
}

export type PricingAgentStatus = 'idle' | 'loading' | 'success' | 'error';

// ─── HADARA AI CREATIVE ASSISTANT ────────────────────────────────────────────

export interface CreativeColor {
  nom: string;
  hex: string;
  usage: string;
}

export interface CreativeTypography {
  nom: string;
  usage: string;
  style: string;
}

export interface CreativeDirection {
  concept_directeur: string;
  ambiance: string;
  palette: CreativeColor[];
  typographies: CreativeTypography[];
  composition: string[];
  elements_visuels: string[];
}

export interface CreativeVisualConcept {
  titre: string;
  description: string;
  direction_artistique: string;
  angle_marketing: string;
  ai_prompt: string;
  difficulte: 'facile' | 'moyen' | 'complexe';
  faisabilite: 'immédiat' | 'nécessite_maquette' | 'référence_requise';
}

export interface CreativeProductionAdvice {
  logiciels_recommandes: string[];
  formats_livraison: string[];
  resolution: string;
  erreurs_a_eviter: string[];
}

export interface CreativeDeliverable {
  nom: string;
  priorite: 'haute' | 'moyenne' | 'basse';
  justification: string;
}

export interface CreativeAssistantResult {
  direction_artistique: CreativeDirection;
  concepts_visuels: CreativeVisualConcept[];
  conseils_production: CreativeProductionAdvice;
  livrables_recommandes: CreativeDeliverable[];
  accroche_visuelle: string;
}

export type CreativeAssistantStatus = 'idle' | 'loading' | 'success' | 'error';

export interface AIConcept {
  number: number;
  name: string;
  visualDescription: string;
  artDirection: string;
  marketingAngle: string;
  metaphorSymbol?: string;
}

export interface AIAnalysisResult {
  summary: string;
  strengths: string[];
  missingDetails: string[];
  recommendedColors: { hex: string; name: string }[];
  suggestedTypography: string;
  layoutAdvice: string;
  estimatedHours: string;
  suggestedPriceFCFA: number;
  whatsappQuoteDraft: string;
  concepts?: AIConcept[];

  complexityLevel?: 'Facile' | 'Moyen' | 'Complexe' | 'Haute Définition Master';
  qualityScore?: number;
  textDensityAudit?: {
    isTooLong: boolean;
    recommendation: string;
    suggestedStructure: {
      title: string;
      subtitle: string;
      speakersBlock: string;
      sponsorsBlock: string;
      cta: string;
    };
  };
  prompts?: {
    firefly?: string;
    midjourney?: string;
    dalle?: string;
  };
  socialCaptions?: {
    facebook?: string;
    instagram?: string;
  };
  productionChecklist?: string[];
}

export interface BriefData {
  id: string;
  studioId?: string;
  createdAt: string;
  status: BriefStatus;
  
  // 1. Client Info
  client_id?: string;
  clientDetails?: any;
  clientName: string;
  organization?: string;
  whatsapp: string;
  email: string;
  cityCountry: string;
  
  // 2. Project Type
  projectType: ProjectType;
  projectTypeCustom?: string;
  
  // 3. Context & Objectives
  contextDescription: string;
  primaryObjective: string;
  
  // 4. Target Audience
  targetAudience: string;
  targetAudienceChips: string[];
  
  // 5. Message & Content
  mainTitle: string;
  fullTextContent: string;
  
  // 6. Style & Direction
  stylePreferences: StylePreference[];
  preferredColors: string;
  avoidColors: string;
  
  // 7. Technical Format
  technicalFormat: TechnicalFormat;
  customDimensions?: string;
  usageType: 'print' | 'web' | 'both';
  
  // 8. Budget & Deadline
  budgetRange: BudgetRange;
  desiredDeliveryDate: string;
  criticalDeadline?: string;
  
  // 9. References & Files
  referenceLinks?: string;
  attachments: FileAttachment[];
  
  // 10. Conditions Validation
  acceptProcess: boolean;
  acceptDeadlines: boolean;
  
  // Admin / Designer fields
  designerNotes?: string;
  quotedPriceFCFA?: number;
  aiAnalysis?: AIAnalysisResult;
  briefAnalystResult?: BriefAnalystResult;
  pricingAgentResult?: PricingAgentResult;
  creativeAssistantResult?: CreativeAssistantResult;

  deliverableVersions?: DeliverableVersion[];
  activityLog?: ActivityLogItem[];
  qualityChecklist?: QualityCheckItem[];
  clientBranding?: ClientBrandingAsset;
  comments?: ProjectComment[];
  assignedDesigner?: string;
  invoices?: InvoiceData[];
  eSignature?: ESignatureRecord;
  isDeleted?: boolean;
}

export interface SamplePortfolioItem {
  id: string;
  title: string;
  subtitle?: string;
  category: string;
  description: string;
  problemSolved?: string;
  badge: '👑 Premium' | '🟢 Populaire' | '⭐ Recommandé' | '🚀 Nouveau' | '💼 Professionnel' | string;
  priceEstimate: string;
  startingPriceFCFA?: number;
  deliveryTime?: string;
  includedRevisions?: string;
  imageTheme?: string;
  imageUrl?: string;
  colorBg?: string;
  accentHex?: string;
  features: string[];
  notIncluded?: string[];
  faq?: { question: string; answer: string }[];
  isBriefIntelligentEligible?: boolean;
}

export interface BriefTemplate {
  id: string;
  title: string;
  category: string;
  description: string;
  projectType: ProjectType;
  technicalFormat: TechnicalFormat;
  customDimensions?: string;
  defaultMainTitle: string;
  defaultFullTextContent: string;
  stylePreferences: StylePreference[];
  preferredColors: string;
  avoidColors: string;
  defaultBudgetRange: BudgetRange;
  suggestedPriceFCFA: number;
  usageCount?: number;
}

export type ProductCategory = 'Accessoires' | 'Impression' | 'Graphisme' | 'Électronique';
export type StockStatus = 'in_stock' | 'available_24_48h' | 'on_order' | 'unavailable';

export interface StoreProduct {
  id: string;
  name: string;
  brand?: string;
  category: ProductCategory | string;
  description: string;
  image?: string;
  status: StockStatus;
  featured: boolean;
  visible: boolean;
  price?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface LegacyStoreProduct {
  id: string;
  name: string;
  brand?: string;
  category: ProductCategory | string;
  priceFCFA?: number;
  stockStatus: StockStatus;
  description: string;
  imageUrl?: string;
  badge?: string;
  isHadaraSelection?: boolean;
  isActive: boolean;
  createdAt: string;
}

// ─── MODULE FACTURATION & REVENUS ────────────────────────────────────────────

export type DocType = 'proforma' | 'facture' | 'avoir';
export type PaymentStatus = 'brouillon' | 'en_attente' | 'partiellement_paye' | 'paye' | 'en_retard' | 'annule';
export type PaymentMethod = 'wave' | 'orange_money' | 'especes' | 'virement' | 'cheque' | 'autre';

export interface BillingClient {
  id: string;
  name: string;
  organization?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  created_at: string;
}

export interface BillingLine {
  id?: number;
  designation: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

export interface BillingPayment {
  id: string;
  amount: number;
  method: PaymentMethod;
  method_display: string;
  reference_code: string;
  payment_date: string;
  note: string;
  created_at: string;
}

export interface BillingDocument {
  id: number;
  document_number: string;
  doc_type: DocType;
  doc_type_display: string;
  payment_status: PaymentStatus;
  payment_status_display: string;
  client?: string;
  client_name?: string;
  brief?: string;
  billing_client_name: string;
  billing_organization: string;
  billing_address: string;
  billing_email: string;
  billing_whatsapp: string;
  subtotal: number;
  discount: number;
  total: number;
  currency: string;
  issue_date: string;
  due_date?: string;
  notes: string;
  paid_amount: number;
  balance_due: number;
  lines: BillingLine[];
  payments: BillingPayment[];
  created_at: string;
  updated_at: string;
}

export interface BillingStats {
  ca_facture: number;
  ca_encaisse: number;
  ca_restant: number;
  en_retard: number;
  non_payees: number;
  partielles: number;
  monthly: { month: string; encaisse: number }[];
}

