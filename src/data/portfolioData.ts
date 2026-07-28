import { SamplePortfolioItem } from '../types';

export const PORTFOLIO_ITEMS: SamplePortfolioItem[] = [
  {
    id: 'p1',
    title: 'Identité Visuelle & Logo',
    category: 'Identité Visuelle',
    description: 'La fondation de votre marque. Inclut : 3 propositions de logo initiales, jusqu’à 3 cycles de modifications, et livraison en formats PNG, JPG, SVG, PDF pour tous vos supports.',
    badge: 'Pack Logo & Branding',
    priceEstimate: 'À partir de 60 000 FCFA',
    imageTheme: 'Or & Vert Émeraude',
    colorBg: 'from-emerald-950 via-slate-900 to-amber-950',
    accentHex: '#d97706',
    features: ['3 Concepts de Logo', 'Jusqu’à 3 révisions', 'Fichiers PNG, JPG, SVG, PDF HD']
  },
  {
    id: 'p2',
    title: 'Affiches & Flyers Événementiel',
    category: 'Communication Visuelle',
    description: 'Création de designs percutants pour vos événements (Ziarra, Gamou, Conférence, Cérémonie religieuse ou culturelle).',
    badge: 'Affiche & Flyer Simple',
    priceEstimate: '30 000 FCFA',
    imageTheme: 'Prestige & Solennité',
    colorBg: 'from-slate-900 to-emerald-950',
    accentHex: '#34d399',
    features: ['Design percutant HD', 'Format A3/A4 Print & Web', 'Export PDF Imprimeur + JPG']
  },
  {
    id: 'p3',
    title: 'Affiches & Flyers Business',
    category: 'Communication Visuelle',
    description: 'Design plus complexe et orienté marketing pour entreprises, campagnes publicitaires, marques et institutions.',
    badge: 'Affiche Business Marketing',
    priceEstimate: '50 000 FCFA',
    imageTheme: 'Moderne & Corporate',
    colorBg: 'from-blue-950 to-slate-900',
    accentHex: '#60a5fa',
    features: ['Mise en page marketing avancée', 'Mise en valeur produits/services', 'Déclinaisons RS incluses']
  },
  {
    id: 'p4',
    title: 'Bâches & Bannières Grand Format',
    category: 'Grand Format',
    description: 'Conception de supports publicitaires grand format pour scènes, devantures, stands et podiums.',
    badge: 'Bâche Grand Format',
    priceEstimate: 'À partir de 45 000 FCFA',
    imageTheme: 'Haute Précision',
    colorBg: 'from-amber-950 to-stone-900',
    accentHex: '#f59e0b',
    features: ['Format vectoriel grand tirage', 'Marges & repères œillets', 'Prêt pour l’imprimeur']
  },
  {
    id: 'p5',
    title: 'Starter Pack Booster',
    category: 'Packages Booster',
    description: 'Offre complète pour démarrer votre communication : Logo + Charte graphique simple (couleurs, typographies) + Carte de visite.',
    badge: 'Pack Lancement',
    priceEstimate: 'Sur Devis',
    imageTheme: 'Branding Complet',
    colorBg: 'from-purple-950 to-slate-900',
    accentHex: '#c084fc',
    features: ['Logo + Charte Graphique Simple', 'Carte de Visite HD', 'Guide Couleurs & Typo']
  },
  {
    id: 'p6',
    title: 'Event Pack Booster',
    category: 'Packages Booster',
    description: 'Ensemble harmonisé pour vos événements d’envergure : Affiche ou flyer + Badge organisateur + Kakemono / Roll-up.',
    badge: 'Pack Événementif Complete',
    priceEstimate: 'Sur Devis',
    imageTheme: 'Identité Événementielle',
    colorBg: 'from-teal-950 to-emerald-900',
    accentHex: '#2dd4bf',
    features: ['Affiche/Flyer + Badge + Kakemono', 'Cohérence visuelle globale', 'Support prioritaire']
  },
  {
    id: 'p7',
    title: 'Création de Sites Web par IA',
    category: 'Digital & Web IA',
    description: 'Conception de sites vitrines modernes et ergonomiques pour entreprises, institutions, dahiras et particuliers, réalisés grâce aux outils de génération IA.',
    badge: 'Site Web Vitrine IA',
    priceEstimate: 'Sur Devis',
    imageTheme: 'Digital & IA',
    colorBg: 'from-indigo-950 to-slate-900',
    accentHex: '#818cf8',
    features: ['Design Web Responsive Mobile', 'Conception guidée par IA', 'Intégration WhatsApp & Contact']
  }
];

export const PROCESS_STEPS = [
  {
    number: '01',
    title: 'Contact & Briefing',
    subtitle: 'Discussion du projet',
    description: 'Nous discutons de votre projet et de vos besoins précis via le formulaire ou WhatsApp.',
    iconName: 'MessageSquare'
  },
  {
    number: '02',
    title: 'Devis & Acompte',
    subtitle: 'Acompte de 50% requis',
    description: 'Envoi d’un devis détaillé. Un acompte de 50% est requis avant de commencer le travail.',
    iconName: 'Calculator'
  },
  {
    number: '03',
    title: 'Création & Révisions',
    subtitle: 'Propositions & Ajustements',
    description: 'Travail sur les propositions. Collaboration directe pour arriver au résultat parfait.',
    iconName: 'Palette'
  },
  {
    number: '04',
    title: 'Validation & Paiement',
    subtitle: 'Règlement solde & Livraison HD',
    description: 'Une fois le design validé, vous réglez le solde restant. Envoi de tous les fichiers finaux HD.',
    iconName: 'CheckCircle2'
  }
];
