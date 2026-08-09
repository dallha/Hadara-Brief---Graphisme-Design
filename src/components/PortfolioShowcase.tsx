import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Tilt from 'react-parallax-tilt';
import { 
  Palette, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Tag, 
  Eye, 
  Globe, 
  ExternalLink,
  Clock,
  RotateCcw,
  Check,
  X,
  HelpCircle,
  ShieldCheck,
  Send
} from 'lucide-react';

import { SamplePortfolioItem } from '../types';
import heroArtistImg from '../assets/hero-artist.jpg';

interface PortfolioShowcaseProps {
  items?: SamplePortfolioItem[];
  onSelectCategoryForBrief: (categoryType: string) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export const DEFAULT_PORTFOLIO_MODELS: SamplePortfolioItem[] = [
  {
    id: 'model-pack-hadara',
    title: 'Pack Hadara Événement',
    subtitle: 'Solution 360° intégrale pour vos événements majeurs (Ziarra, Gamou, Magal & Conférences)',
    category: 'Packages Booster',
    description: 'Ne commandez plus vos visuels au compte-gouttes. Obtenez une identité événementielle globale et parfaitement harmonisée sur tous vos supports physiques et digitaux.',
    problemSolved: 'Évite le manque de cohérence visuelle et les retards en confiant la création globale de l’événement à un studio unique.',
    badge: '👑 Premium',
    priceEstimate: 'À partir de 75 000 FCFA',
    deliveryTime: '3 à 5 jours',
    includedRevisions: '3 révisions incluses',
    imageTheme: 'Identité Événementielle 360° Signature',
    colorBg: 'from-[#451a03] via-[#78350f] to-[#1c0d02]',
    accentHex: '#f59e0b',
    isBriefIntelligentEligible: true,
    features: [
      'Logo & Monogramme officiel de l’événement',
      'Affiche principale A3/A4 HD (300 DPI)',
      'Bâche Grand Format XXL (3x2m ou 5x2m)',
      'Flyer A5 recto/verso prêt à imprimer',
      'Visuel d’annonce Facebook & Instagram (1:1)',
      'Story verticale WhatsApp (16:9)',
      'Bannière de couverture Facebook HD',
      'Badge d’accréditation Organisateur / VIP',
      'Certificat / Attestation de participation'
    ],
    notIncluded: [
      'Impression physique (devis imprimeur sur mesure disponible)',
      'Rédaction de contenus rédactionnels'
    ],
    faq: [
      { question: 'Puis-je adapter les dimensions de la bâche ?', answer: 'Oui, les visuels sont livrés en format grand format entièrement personnalisable selon les contraintes de votre imprimeur.' },
      { question: 'Comment suivre mon projet ?', answer: 'Vous bénéficiez de votre Espace Client sécurisé avec suivi de projet étape par étape et téléchargement des versions HD.' }
    ]
  },
  {
    id: 'model-logo-master',
    title: 'Identité Visuelle Hadara Master',
    subtitle: 'Création de marque institutionnelle ou commerciale d’excellence',
    category: 'Identité & Logo',
    description: 'Conception sur-mesure de votre logo et charte graphique. Une image de marque forte et mémorable qui inspire confiance à vos clients dès le premier regard.',
    problemSolved: 'Donne à votre entreprise ou organisation une crédibilité haut de gamme et un ancrage visuel mémorable.',
    badge: '👑 Premium',
    priceEstimate: 'À partir de 80 000 FCFA',
    deliveryTime: '4 à 6 jours',
    includedRevisions: '3 révisions incluses',
    imageTheme: 'Logo Master Vectoriel & Charte Graphique',
    colorBg: 'from-[#1c1917] via-[#292524] to-[#0c0a09]',
    accentHex: '#816C07',
    isBriefIntelligentEligible: true,
    features: [
      'Logo principal (Concept original)',
      'Logo secondaire / version compacte',
      'Version monochrome (Noir & Blanc pure)',
      'Favicon optimisé pour site web & applications',
      'Palette de couleurs officielles (HEX, CMJN, RVB)',
      'Typographies de marque recommandées',
      'Guide d’utilisation officiel de la charte',
      'Export vectoriel (AI, SVG, PDF, PNG HD 300DPI)'
    ],
    notIncluded: ['Dépôt de marque officiel auprès de l’OAPI']
  },
  {
    id: 'model-branding-pro',
    title: 'Pack Branding Professionnel',
    subtitle: 'Identité complète avec supports de papeterie d’entreprise',
    category: 'Identité & Logo',
    description: 'Tout le nécessaire pour lancer ou moderniser votre entreprise avec professionnalisme : logo master, cartes de visite et papier en-tête.',
    problemSolved: 'Équipe vos équipes commerciales de supports physiques et digitaux prêts à prospecter.',
    badge: '⭐ Recommandé',
    priceEstimate: 'À partir de 95 000 FCFA',
    deliveryTime: '5 à 7 jours',
    includedRevisions: '3 révisions incluses',
    imageTheme: 'Logo + Cartes de Visite + Papier En-tête',
    colorBg: 'from-[#311042] via-[#1f0a2b] to-[#0c0412]',
    accentHex: '#ec4899',
    isBriefIntelligentEligible: true,
    features: [
      'Logo Master Vectoriel complet',
      'Carte de visite recto/verso personnalisée',
      'Papier en-tête officiel (Formats Word & PDF)',
      'Signature d’e-mail professionnelle HTML / Image',
      'Fichiers prêts pour imprimerie & utilisation web'
    ]
  },
  {
    id: 'model-affiche-event',
    title: 'Affiche d’Événement & Cérémonie',
    subtitle: 'Conception graphique solennelle & d’impact (Ziarra, Gamou, Magal, Conférences)',
    category: 'Communication Visuelle',
    description: 'Affiches captivantes alliant la richesse de la typographie traditionnelle et la rigueur de la mise en page moderne.',
    problemSolved: 'Assure une visibilité maximale et une haute qualité esthétique pour remplir vos salles et lieux de rassemblement.',
    badge: '🟢 Populaire',
    priceEstimate: 'À partir de 35 000 FCFA',
    deliveryTime: '2 à 3 jours',
    includedRevisions: '2 révisions incluses',
    imageTheme: 'Affiche Solennelle, Spirituelle & Corporate',
    colorBg: 'from-[#141c2e] via-[#0d131f] to-[#0a0f18]',
    accentHex: '#fbbf24',
    isBriefIntelligentEligible: true,
    features: [
      'Fichier HD Haute Résolution (300 DPI)',
      'PDF haute qualité prêt pour imprimerie',
      'Version Réseaux Sociaux optimisée (Square 1:1)',
      'Déclinaison Story WhatsApp & Instagram (16:9)',
      '2 Révisions incluses'
    ]
  },
  {
    id: 'model-social-media',
    title: 'Pack Visuels Réseaux Sociaux & Stories',
    subtitle: 'Série de visuels captivants et harmonieux pour votre communication digitale',
    category: 'Communication Visuelle',
    description: 'Déclinez votre message sur toutes vos plateformes grâce à des créations au format exact de chaque réseau.',
    problemSolved: 'Maintient l’engagement de vos abonnés sur WhatsApp, Facebook et Instagram sans visuels amateurs.',
    badge: '🟢 Populaire',
    priceEstimate: 'À partir de 30 000 FCFA',
    deliveryTime: '2 à 3 jours',
    includedRevisions: '2 révisions incluses',
    imageTheme: 'Pack de 5 Visuels Web & Story',
    colorBg: 'from-[#1e1b4b] via-[#311b92] to-[#0f051d]',
    accentHex: '#a855f7',
    isBriefIntelligentEligible: true,
    features: [
      '5 Visuels Carrés (Facebook & Instagram 1:1)',
      '5 Stories Verticales (WhatsApp & Instagram 16:9)',
      'Direction artistique et couleurs cohérentes',
      'Exportation rapide PNG HD'
    ]
  },
  {
    id: 'model-bache-xxl',
    title: 'Bâche Événementielle Grand Format XXL',
    subtitle: 'Signalétique grand format & décors de scène (3x2m, 5x2m, etc.)',
    category: 'Grand Format (Bâches)',
    description: 'Création graphique sur-mesure conçue spécialement pour l’impression grand format sans pixellisation.',
    problemSolved: 'Garantit une impression géante parfaitement nette sans flou ni déformation.',
    badge: '💼 Professionnel',
    priceEstimate: 'À partir de 50 000 FCFA',
    deliveryTime: '2 à 4 jours',
    includedRevisions: '2 révisions incluses',
    imageTheme: 'Bâche Grand Format & Podium',
    colorBg: 'from-[#064e3b] via-[#022c22] to-[#01140e]',
    accentHex: '#34d399',
    isBriefIntelligentEligible: true,
    features: [
      'Format vectoriel grand format sans limite de taille',
      'Contrôle des marges de sécurité et fonds perdus',
      'Emplacements repérés pour œillets d’accroche',
      'Export PDF Imprimeur CMJN HD'
    ]
  },
  {
    id: 'model-rollup',
    title: 'Roll-up & Kakémono de Présentation',
    subtitle: 'Stand d’exposition & accueil institutionnel (85x200cm)',
    category: 'Grand Format (Bâches)',
    description: 'Visuel vertical élégant et impactant pour vos salons, forums, conférences et halls d’accueil.',
    problemSolved: 'Capte l’attention des visiteurs à distance sur vos lieux d’exposition.',
    badge: '💼 Professionnel',
    priceEstimate: 'À partir de 25 000 FCFA',
    deliveryTime: '2 jours',
    includedRevisions: '2 révisions incluses',
    imageTheme: 'Roll-Up Stand & Signalétique Verticale',
    colorBg: 'from-[#1e293b] via-[#0f172a] to-[#020617]',
    accentHex: '#cbd5e1',
    isBriefIntelligentEligible: true,
    features: [
      'Gabarit 85x200cm ou 120x200cm prêt',
      'Structuration hiérarchisée lisible de loin',
      'Fichier PDF CMJN prêt pour impression'
    ]
  },
  {
    id: 'model-web-vitrine',
    title: 'Site Web Vitrine Professionnel',
    subtitle: 'Conçu avec les technologies d’intelligence artificielle',
    category: 'Création Web',
    description: 'Site web ultra-moderne, rapide et optimisé pour smartphone. Présentez vos activités et recevez vos briefs clients en ligne.',
    problemSolved: 'Passez d’une simple présence sur réseaux sociaux à une plateforme professionnelle d’acquisition client.',
    badge: '🚀 Nouveau',
    priceEstimate: 'À partir de 150 000 FCFA',
    deliveryTime: '5 à 10 jours',
    includedRevisions: '3 révisions incluses',
    imageTheme: 'Site Web Responsive & UI Premium',
    colorBg: 'from-[#0f2027] via-[#203a43] to-[#2c5364]',
    accentHex: '#38bdf8',
    isBriefIntelligentEligible: true,
    features: [
      'Design Responsive (Mobile, Tablette, PC)',
      'Formulaire interactif de demande de devis',
      'Bouton d’action WhatsApp direct',
      'Optimisation SEO de base pour Google',
      'Hébergement & Nom de Domaine inclus (1 an)'
    ]
  },
  {
    id: 'model-edition',
    title: 'Brochure, Dépliant & Catalogue',
    subtitle: 'Mise en page éditoriale professionnelle',
    category: 'Supports Imprimés',
    description: 'Mise en valeur de vos produits et prestations à travers des dépliants 2 ou 3 volets, brochures ou magazines institutionnels.',
    problemSolved: 'Présente vos offres de manière claire et structurée lors de vos rendez-vous d’affaires.',
    badge: '💼 Professionnel',
    priceEstimate: 'À partir de 40 000 FCFA',
    deliveryTime: '3 à 5 jours',
    includedRevisions: '2 révisions incluses',
    imageTheme: 'Dépliant 3 volets, Brochure & Catalogue',
    colorBg: 'from-[#334155] via-[#1e293b] to-[#0f051d]',
    accentHex: '#94a3b8',
    features: [
      'Dépliant 2 ou 3 volets / Brochure',
      'Mise en page typographique soignée',
      'Export PDF Imprimeur CMJN avec fond perdu'
    ]
  },
  {
    id: 'model-papeterie',
    title: 'Carte de Visite, Badge & Certificat',
    subtitle: 'Supports de papeterie et d’accréditation',
    category: 'Papeterie & Badges',
    description: 'Supports officiels pour vos collaborateurs, invités VIP et participants d’événements.',
    problemSolved: 'Uniformise la présentation des cartes et badges d’accréditation.',
    badge: '🟢 Populaire',
    priceEstimate: 'À partir de 20 000 FCFA',
    deliveryTime: '1 à 2 jours',
    includedRevisions: '2 révisions incluses',
    imageTheme: 'Carte de visite, Badge VIP & Certificat',
    colorBg: 'from-[#065f46] via-[#047857] to-[#022c22]',
    accentHex: '#10b981',
    features: [
      'Cartes de visite recto/verso personnalisées',
      'Badges d’accréditation de conférences / VIP',
      'Certificats & Diplômes de participation',
      'Fichiers imprimables HD'
    ]
  },
  {
    id: 'model-audiovisuel',
    title: 'Montage Vidéo & Capsule Promotionnelle',
    subtitle: 'Montage dynamique avec habillage graphique',
    category: 'Audiovisuel & Montage',
    description: 'Transformez vos rushs vidéo bruts en séquences dynamiques prêtes à diffuser sur Reels, TikTok et YouTube.',
    problemSolved: 'Rend vos vidéos professionnelles grâce au rythme de montage et au sous-titrage moderne.',
    badge: '🚀 Nouveau',
    priceEstimate: 'À partir de 45 000 FCFA',
    deliveryTime: '2 à 4 jours',
    includedRevisions: '2 révisions incluses',
    imageTheme: 'Montage Vidéo & Habillage Graphique',
    colorBg: 'from-[#881337] via-[#4c0519] to-[#1f030b]',
    accentHex: '#f43f5e',
    features: [
      'Montage dynamique sur Adobe Premiere Pro',
      'Sous-titrage stylisé & animations de texte',
      'Habillage graphique & sonorisation libre de droits',
      'Export MP4 HD optimisé Réseaux'
    ]
  }
];

export const PortfolioShowcase: React.FC<PortfolioShowcaseProps> = ({
  items,
  onSelectCategoryForBrief,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [activeModalItem, setActiveModalItem] = useState<SamplePortfolioItem | null>(null);

  const displayItems = (items && items.length > 0) ? items : DEFAULT_PORTFOLIO_MODELS;

  const filteredItems = displayItems.filter((item) => {
    if (selectedFilter === 'all') return true;
    const cat = (item.category || '').toLowerCase();
    const title = (item.title || '').toLowerCase();
    
    if (selectedFilter === 'pack_hadara' && (cat.includes('booster') || title.includes('pack'))) return true;
    if (selectedFilter === 'identite' && (cat.includes('identité') || cat.includes('logo') || cat.includes('branding'))) return true;
    if (selectedFilter === 'communication' && (cat.includes('communication') || cat.includes('affiche') || cat.includes('flyer'))) return true;
    if (selectedFilter === 'grandformat' && (cat.includes('grand format') || cat.includes('bâche') || cat.includes('bache'))) return true;
    if (selectedFilter === 'edition' && (cat.includes('imprimé') || cat.includes('brochure') || cat.includes('dépliant'))) return true;
    if (selectedFilter === 'papeterie' && (cat.includes('papeterie') || cat.includes('badge') || cat.includes('carte'))) return true;
    if (selectedFilter === 'audiovisuel' && (cat.includes('audiovisuel') || cat.includes('montage') || cat.includes('vidéo'))) return true;
    if (selectedFilter === 'web' && (cat.includes('web') || cat.includes('site') || cat.includes('digital') || cat.includes('ia'))) return true;
    return false;
  });

  return (
    <div className="space-y-12 pb-16 max-w-7xl mx-auto px-4 sm:px-6 relative">
      
      {/* Decorative background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] sm:w-[800px] h-[350px] sm:h-[400px] bg-amber-500/5 rounded-full blur-[100px] sm:blur-[120px] pointer-events-none" />

      {/* Header with Artist Artwork Showcase */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-5 max-w-3xl mx-auto relative z-10"
      >
        {/* Compact Artist Portrait Badge */}
        <div className="flex justify-center mb-2">
          <div className="relative group">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl p-1 bg-gradient-to-b from-amber-400 to-amber-600 border border-amber-400/60 shadow-xl overflow-hidden">
              <img src={heroArtistImg} alt="El Hadji Abdoulaye Niass" className="w-full h-full object-cover rounded-[12px]" />
            </div>
          </div>
        </div>

        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold shadow-[0_0_15px_rgba(245,158,11,0.15)]">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Studio Hadara — El Hadji Abdoulaye Niass</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-serif font-extrabold text-slate-100 tracking-tight">
          Nos Prestations & <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Solutions Studio</span>
        </h2>

        <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
          Chaque projet est unique. Notre système analyse automatiquement votre brief afin de vous proposer une estimation personnalisée adaptée à vos besoins.
        </p>

        {/* External Behance Link Banner */}
        <div className="pt-2 px-2">
          <a
            href="https://www.behance.net/mrniasse"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 sm:space-x-3 px-4 py-3 sm:px-6 sm:py-3.5 rounded-2xl bg-[#0057ff]/10 border border-[#0057ff]/30 hover:bg-[#0057ff]/20 font-serif font-bold text-xs sm:text-sm shadow-xl hover:shadow-[#0057ff]/20 transition-all group max-w-full"
          >
            <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-[#0057ff] shrink-0" />
            <span className="text-slate-200 truncate">Portfolio Behance Officiel</span>
            <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 group-hover:translate-x-1 transition-transform shrink-0" />
          </a>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-6">
          {[
            { id: 'all', label: 'Tous les services' },
            { id: 'pack_hadara', label: '👑 Packs Signature' },
            { id: 'identite', label: 'Identité & Logo' },
            { id: 'communication', label: 'Communication & Affiches' },
            { id: 'grandformat', label: 'Grand Format (Bâches)' },
            { id: 'edition', label: 'Supports Imprimés' },
            { id: 'papeterie', label: 'Papeterie & Badges' },
            { id: 'audiovisuel', label: 'Montage Vidéo' },
            { id: 'web', label: 'Création Web' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                selectedFilter === tab.id
                  ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/20 scale-105'
                  : 'bg-slate-900/60 text-slate-300 border border-slate-800 hover:border-slate-600 hover:bg-slate-800 backdrop-blur-sm'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Grid of Portfolio Samples */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8 relative z-10"
      >
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item) => (
            <motion.div
              layout
              variants={itemVariants}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, scale: 0.9 }}
              key={item.id}
              className="h-full"
            >
              <Tilt
                tiltMaxAngleX={4}
                tiltMaxAngleY={4}
                scale={1.02}
                transitionSpeed={2500}
                className="group rounded-[2rem] bg-slate-900/60 backdrop-blur-md border border-slate-800 hover:border-amber-500/50 transition-all duration-500 overflow-hidden flex flex-col justify-between shadow-2xl hover:shadow-[0_20px_40px_-15px_rgba(245,158,11,0.2)] hover:-translate-y-2 cursor-pointer h-full"
              >
              {/* Styled Visual Mockup Container */}
              <div className={`h-48 sm:h-64 bg-gradient-to-br ${item.colorBg || 'from-slate-900 to-slate-950'} relative p-4 sm:p-6 flex flex-col justify-between overflow-hidden group-hover:scale-[1.02] transition-transform duration-700 ease-out origin-bottom`}>
                
                {/* Background Image if uploaded */}
                {item.imageUrl ? (
                  <div className="absolute inset-0 z-0">
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent opacity-90" />
                  </div>
                ) : (
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#d97706_1.5px,transparent_1.5px)] [background-size:24px_24px] pointer-events-none mix-blend-overlay" />
                )}

                <div className="relative z-10 flex items-center justify-between">
                  <span className="px-3.5 py-1.5 rounded-full bg-slate-950/90 backdrop-blur-md border border-amber-500/40 text-amber-300 text-xs font-bold shadow-lg flex items-center space-x-1">
                    <span>{item.badge}</span>
                  </span>
                  <span className="px-3.5 py-1.5 rounded-full bg-slate-950/90 backdrop-blur-md text-emerald-400 text-xs font-mono font-bold border border-emerald-500/30 shadow-lg">
                    {item.priceEstimate}
                  </span>
                </div>

                {/* Sample Poster Visual Representation (Model without image) */}
                {!item.imageUrl && (
                  <div className="relative z-10 my-auto text-center space-y-2 p-5 rounded-3xl bg-slate-950/50 backdrop-blur-lg border border-white/10 shadow-2xl group-hover:bg-slate-950/70 transition-colors">
                    <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/40 mx-auto flex items-center justify-center text-amber-300 font-serif text-base font-bold shadow-inner">
                      ح
                    </div>
                    <h3 className="text-lg font-serif font-extrabold text-white tracking-wide drop-shadow-md line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-amber-200/90 font-medium tracking-wide line-clamp-1">
                      {item.imageTheme}
                    </p>
                  </div>
                )}

                {/* Bottom Card Footer Badges */}
                <div className="relative z-10 flex items-center justify-between text-xs text-slate-300">
                  <span className="flex items-center space-x-1.5 text-[11px] text-slate-200 font-medium px-3 py-1 rounded-lg bg-slate-950/80 backdrop-blur-sm border border-slate-800">
                    <Tag className="w-3 h-3 text-amber-400" />
                    <span>{item.category}</span>
                  </span>
                  
                  {item.deliveryTime && (
                    <span className="flex items-center space-x-1 text-[11px] text-amber-300 font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-950/80 border border-amber-500/30">
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span>{item.deliveryTime}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Content info */}
              <div className="p-6 space-y-5 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <h3 className="text-lg font-serif font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
                    {item.title}
                  </h3>

                  {item.subtitle && (
                    <p className="text-[11px] text-amber-400 font-medium">{item.subtitle}</p>
                  )}

                  <p className="text-xs text-slate-300 leading-relaxed font-normal line-clamp-3">
                    {item.description}
                  </p>

                  {/* Checklist of deliverables */}
                  <div className="space-y-2 pt-2 border-t border-slate-800/80">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Livrables inclus :
                    </p>
                    <ul className="space-y-1 text-xs text-slate-300">
                      {(item.features || []).slice(0, 4).map((feat, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-1 text-[11px]">{feat}</span>
                        </li>
                      ))}
                      {(item.features || []).length > 4 && (
                        <li className="text-[10px] text-amber-400 font-semibold pl-5">
                          + {(item.features || []).length - 4} autres livrables...
                        </li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-4 border-t border-slate-800 flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectCategoryForBrief(item.category);
                    }}
                    className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-950 text-xs bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 transition-all flex items-center justify-center space-x-1.5 shadow-lg shadow-amber-400/20 active:scale-95"
                  >
                    <span>Commander</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveModalItem(item);
                    }}
                    className="py-3 px-3.5 rounded-xl font-medium text-slate-300 text-xs bg-slate-800/80 hover:bg-slate-800 hover:text-white border border-slate-700 transition-all flex items-center space-x-1"
                    title="Voir les détails complets"
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-400" />
                    <span className="hidden sm:inline">Détails</span>
                  </button>
                </div>
              </div>
              </Tilt>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Detail Modal */}
      <AnimatePresence>
        {activeModalItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-slate-900 border border-slate-700/80 rounded-3xl p-4 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-5 sm:space-y-6 text-slate-100 relative"
            >
              {/* Top Banner */}
              <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-bold">
                      {activeModalItem.badge}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-slate-800 text-emerald-400 text-xs font-mono font-bold">
                      {activeModalItem.priceEstimate}
                    </span>
                  </div>
                  <h3 className="text-2xl font-serif font-extrabold text-slate-100 pt-2">
                    {activeModalItem.title}
                  </h3>
                  {activeModalItem.subtitle && (
                    <p className="text-xs text-amber-300 font-medium">{activeModalItem.subtitle}</p>
                  )}
                </div>

                <button
                  onClick={() => setActiveModalItem(null)}
                  className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* SaaS Advantage Tag */}
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-300 font-medium">
                <span className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>✨ Disponible avec Brief Intelligent & Suivi Espace Client</span>
                </span>
                <span className="hidden sm:inline text-[11px] font-mono text-emerald-400 font-bold">Calcul IA</span>
              </div>

              {/* Value Proposition */}
              {activeModalItem.problemSolved && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-amber-400">Objectif du service :</p>
                  <p className="text-xs text-slate-300 italic">{activeModalItem.problemSolved}</p>
                </div>
              )}

              {/* Description */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Description :</p>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {activeModalItem.description}
                </p>
              </div>

              {/* Delivery & Revisions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Délai estimé</p>
                    <p className="text-xs font-bold text-slate-100">{activeModalItem.deliveryTime || '2 à 3 jours'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <RotateCcw className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Révisions incluses</p>
                    <p className="text-xs font-bold text-slate-100">{activeModalItem.includedRevisions || '2 révisions incluses'}</p>
                  </div>
                </div>
              </div>

              {/* Checklist included */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Ce qui est inclus dans votre livraison :</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  {(activeModalItem.features || []).map((feat, idx) => (
                    <div key={idx} className="flex items-start space-x-2 text-xs text-slate-300">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* What is not included */}
              {activeModalItem.notIncluded && activeModalItem.notIncluded.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <X className="w-4 h-4 text-rose-400" />
                    <span>Non inclus / En option :</span>
                  </p>
                  <ul className="space-y-1 text-xs text-slate-400 pl-2">
                    {activeModalItem.notIncluded.map((item, i) => (
                      <li key={i} className="flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Collaboration Workflow */}
              <div className="space-y-2 border-t border-slate-800 pt-4">
                <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">Processus de création en 3 étapes :</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] text-slate-300">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <strong className="text-amber-300 block mb-1">1. Brief Intelligent</strong>
                    Remplissez le formulaire guidé en 2 minutes.
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <strong className="text-amber-300 block mb-1">2. Proposition V1</strong>
                    Conception et première version transmise.
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <strong className="text-amber-300 block mb-1">3. Validation & HD</strong>
                    Ajustements puis livraison de vos fichiers HD.
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-800 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
                <button
                  onClick={() => setActiveModalItem(null)}
                  className="px-5 py-3 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-center"
                >
                  Fermer
                </button>

                <button
                  onClick={() => {
                    const cat = activeModalItem.category;
                    setActiveModalItem(null);
                    onSelectCategoryForBrief(cat);
                  }}
                  className="px-5 sm:px-6 py-3.5 rounded-xl font-bold text-slate-950 text-xs bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 transition-all flex items-center justify-center space-x-2 shadow-xl shadow-amber-400/20"
                >
                  <span>Obtenir une estimation avec Brief Intelligent ✨</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
