import { ProjectType, StylePreference, TechnicalFormat, BudgetRange } from '../../types';
import { User, Layers, MessageSquare, Palette, CheckCircle2 } from 'lucide-react';

export const PROJECT_TYPES: { id: ProjectType; label: string; desc: string; icon: string }[] = [
  { id: 'affiche', label: 'Affiche événementielle', desc: 'Ziarra, Gamou, Conférence, Causerie', icon: '🖼️' },
  { id: 'bache', label: 'Bâche / Banderole', desc: 'Grand format pour scène ou façade', icon: '🚩' },
  { id: 'flyer', label: 'Flyer (A5 / A6)', desc: 'Programme, horaires, tract impression', icon: '📄' },
  { id: 'identite_visuelle', label: 'Identité Visuelle / Logo', desc: 'Logo Dahira, charte & marque', icon: '✨' },
  { id: 'site_web', label: 'Site Web Vitrine', desc: 'Présentation de votre entreprise', icon: '🌐' },
  { id: 'reseaux_sociaux', label: 'Réseaux Sociaux', desc: 'Community management, visibilité', icon: '📱' },
  { id: 'pack_starter', label: 'Pack "Starter"', desc: 'Affiche + Visuel Réseaux Sociaux', icon: '🚀' },
  { id: 'pack_event', label: 'Pack "Event Global"', desc: 'Affiche + Bâche + Flyer + Story IG', icon: '👑' },
  { id: 'pack_hajj_oumrah', label: 'Pack "Voyage / Pèlerinage"', desc: 'Badges, Écharpes, Sacoches, etc.', icon: '🕋' },
  { id: 'autre', label: 'Autre projet sur mesure', desc: 'Besoin spécifique', icon: '⚙️' },
];

export const STYLE_OPTIONS: { id: StylePreference; label: string; desc: string }[] = [
  { id: 'spirituel', label: 'Spirituel & Religieux', desc: 'Motifs orientaux, dorures, arabesques fines, solennel' },
  { id: 'luxueux', label: 'Luxueux & Premium', desc: 'Orfèvrerie, contrastes sombres, typographie royale' },
  { id: 'moderne', label: 'Moderne & Dynamique', desc: 'Lignes épurées, couleurs vives, mise en page actuelle' },
  { id: 'traditionnel', label: 'Traditionnel Local', desc: 'Références culturelles, tonalités chaleureuses' },
  { id: 'classique', label: 'Classique Sobriété', desc: 'Structure académique, grande clarté de lecture' },
  { id: 'minimaliste', label: 'Minimaliste & Épuré', desc: 'Moins d’éléments, focus absolu sur le message' },
];

export const FORMAT_OPTIONS: { id: TechnicalFormat; label: string; desc: string }[] = [
  { id: 'A3_A4', label: 'Affiche A3 / A4 HD', desc: 'Standard impression & numérique' },
  { id: 'bache_3x1', label: 'Bâche Grand Format (ex: 3m x 1.5m)', desc: 'Optimisé œillets & grand tirage' },
  { id: 'flyer_A5', label: 'Flyer A5 Recto / Verso', desc: 'Format poche distribution' },
  { id: 'post_RS', label: 'Post Réseaux Sociaux (1:1 / 4:5)', desc: 'Instagram, WhatsApp, Facebook' },
  { id: 'story_vertical', label: 'Story & Reels (9:16 Vertical)', desc: 'Plein écran smartphone' },
  { id: 'sur_mesure', label: 'Dimensions personnalisées', desc: 'Préciser les mesures exactes' },
];

export const BUDGET_OPTIONS: { id: BudgetRange; label: string; desc: string }[] = [
  { id: 'sur_devis', label: 'Demander un devis au graphiste', desc: 'Analyse gratuite de votre brief et envoi d’un devis personnalisé' },
  { id: '30k-50k', label: 'Budget : 30 000 – 50 000 FCFA', desc: 'Pour affiche simple, flyer ou visuel unique' },
  { id: '50k-80k', label: 'Budget : 50 000 – 80 000 FCFA', desc: 'Pour bâche grand format ou Pack Starter' },
  { id: '80k-120k', label: 'Budget : 80 000 – 120 000 FCFA', desc: 'Pour Pack Event complet ou Identité Visuelle' },
];

export const STEP_DEFINITIONS = [
  { step: 1, label: '1. Contact', short: 'Contact', icon: User },
  { step: 2, label: '2. Choix du Projet', short: 'Projet', icon: Layers },
  { step: 3, label: '3. Titre & Contenu', short: 'Message', icon: MessageSquare },
  { step: 4, label: '4. Style & Fichiers', short: 'Style', icon: Palette },
  { step: 5, label: '5. Validation', short: 'Validation', icon: CheckCircle2 },
];
