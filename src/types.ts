export type ProjectType = 
  | 'affiche'
  | 'bache'
  | 'flyer'
  | 'identite_visuelle'
  | 'pack_starter'
  | 'pack_event'
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

export interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  dataUrl?: string;
}

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
}

export interface BriefData {
  id: string;
  createdAt: string;
  status: BriefStatus;
  
  // 1. Client Info
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
}

export interface SamplePortfolioItem {
  id: string;
  title: string;
  category: string;
  description: string;
  badge: string;
  priceEstimate: string;
  imageTheme?: string;
  imageUrl?: string;
  colorBg?: string;
  accentHex?: string;
  features: string[];
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

