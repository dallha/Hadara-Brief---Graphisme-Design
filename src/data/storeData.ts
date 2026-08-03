import { LegacyStoreProduct } from '../types';

export const DEFAULT_STORE_PRODUCTS: LegacyStoreProduct[] = [
  // ⌨️ ACCESSOIRES
  {
    id: 'prod-01',
    name: 'Clavier Mécanique Ergonomique Pro',
    brand: 'Logitech',
    category: 'Accessoires',
    priceFCFA: 0,
    stockStatus: 'on_order',
    description: 'Clavier ergonomique silencieux, conçu pour réduire la fatigue lors des longues sessions de création graphique et de mise en page.',
    imageUrl: '/images/store/prod-01.jpg',
    badge: '📦 Sur Commande',
    isHadaraSelection: true,
    isActive: true,
    createdAt: '2026-08-02'
  },
  {
    id: 'prod-02',
    name: 'Souris Sans Fil MX Master 3S',
    brand: 'Logitech',
    category: 'Accessoires',
    priceFCFA: 0,
    stockStatus: 'on_order',
    description: 'Souris haute précision avec molette électromagnétique, parfaite pour naviguer dans vos maquettes et logiciels Adobe avec fluidité.',
    imageUrl: '/images/store/prod-02.jpg',
    badge: '🎯 Sélection Hadara',
    isHadaraSelection: true,
    isActive: true,
    createdAt: '2026-08-02'
  },
  {
    id: 'prod-03',
    name: 'Casque Audio Studio Réduction de Bruit Active',
    brand: 'Sony',
    category: 'Accessoires',
    priceFCFA: 0,
    stockStatus: 'on_order',
    description: 'Casque studio à isolation phonique active, idéal pour vous immerger dans vos créations et vos montages vidéo sans distraction.',
    imageUrl: '/images/store/prod-03.jpg',
    badge: '📦 Sur Commande',
    isActive: true,
    createdAt: '2026-08-02'
  },
  {
    id: 'prod-04',
    name: 'SSD Externe Ultra-Rapide 1 To USB-C',
    brand: 'SanDisk',
    category: 'Accessoires',
    priceFCFA: 0,
    stockStatus: 'on_order',
    description: 'SSD externe rapide, idéal pour transporter vos projets Photoshop, Illustrator et vos montages vidéo HD en toute sécurité.',
    imageUrl: '/images/store/prod-04.jpg',
    badge: '🎯 Sélection Hadara',
    isHadaraSelection: true,
    isActive: true,
    createdAt: '2026-08-02'
  },

  // 🖨️ IMPRESSION
  {
    id: 'prod-05',
    name: 'Câble Imprimante Blindé USB-A vers USB-B (3m)',
    brand: 'UGREEN',
    category: 'Impression',
    priceFCFA: 0,
    stockStatus: 'on_order',
    description: 'Câble haute qualité blindé, garantissant l\'envoi rapide et sans erreur de vos visuels lourds vers vos imprimantes et traceurs.',
    imageUrl: '/images/store/prod-05.jpg',
    badge: '📦 Sur Commande',
    isActive: true,
    createdAt: '2026-08-02'
  },
  {
    id: 'prod-06',
    name: 'Adaptateur USB 3.0 OTG Aluminium',
    brand: 'Anker',
    category: 'Impression',
    priceFCFA: 0,
    stockStatus: 'on_order',
    description: 'Adaptateur universel résistant pour connecter directement vos clés USB et périphériques sur vos appareils de création.',
    imageUrl: '/images/store/prod-06.jpg',
    badge: '⚡ Pratique',
    isActive: true,
    createdAt: '2026-08-02'
  },
  {
    id: 'prod-07',
    name: 'Clé USB 3.2 Metal 64 Go Métallique',
    brand: 'Kingston',
    category: 'Impression',
    priceFCFA: 0,
    stockStatus: 'on_order',
    description: 'Clé USB métallique antichoc, spécialement recommandée pour livrer vos fichiers HD (PDF 300 DPI, AI, TIFF) à vos imprimeurs.',
    imageUrl: '/images/store/prod-07.jpg',
    badge: '🎯 Sélection Hadara',
    isHadaraSelection: true,
    isActive: true,
    createdAt: '2026-08-02'
  },

  // 🎨 GRAPHISME
  {
    id: 'prod-08',
    name: 'Tapis de Souris XXL Bureau Signature (90x40cm)',
    brand: 'Hadara Studio',
    category: 'Graphisme',
    priceFCFA: 0,
    stockStatus: 'on_order',
    description: 'Grand tapis de bureau à surface lisse, offrant une glisse parfaite de la souris pour les tracés précis sous Illustrator.',
    imageUrl: '/images/store/prod-08.jpg',
    badge: '🎯 Sélection Hadara',
    isHadaraSelection: true,
    isActive: true,
    createdAt: '2026-08-02'
  },
  {
    id: 'prod-09',
    name: 'Support Laptop Pliable en Aluminium Ergonomique',
    brand: 'Baseus',
    category: 'Graphisme',
    priceFCFA: 0,
    stockStatus: 'on_order',
    description: 'Support pliable en aluminium pour surélever votre écran à hauteur des yeux et améliorer votre posture de travail au quotidien.',
    imageUrl: '/images/store/prod-09.jpg',
    badge: '📦 Sur Commande',
    isActive: true,
    createdAt: '2026-08-02'
  },
  {
    id: 'prod-10',
    name: 'Hub USB-C Multiport 7-en-1 Aluminium 4K',
    brand: 'UGREEN',
    category: 'Graphisme',
    priceFCFA: 0,
    stockStatus: 'on_order',
    description: 'Hub multiport aluminium 7-en-1 pour brancher simultanément vos disques, cartes SD, écrans 4K et tablettes graphiques.',
    imageUrl: '/images/store/prod-10.jpg',
    badge: '🚀 Incontournable',
    isHadaraSelection: true,
    isActive: true,
    createdAt: '2026-08-02'
  },

  // 🔌 ÉLECTRONIQUE
  {
    id: 'prod-11',
    name: 'Chargeur Rapide GaN 65W Multi-Ports USB-C/A',
    brand: 'Anker',
    category: 'Électronique',
    priceFCFA: 0,
    stockStatus: 'on_order',
    description: 'Chargeur rapide compact 65W capable d\'alimenter votre ordinateur portable et smartphone en même temps lors de vos déplacements.',
    imageUrl: '/images/store/prod-11.jpg',
    badge: '🎯 Sélection Hadara',
    isHadaraSelection: true,
    isActive: true,
    createdAt: '2026-08-02'
  },
  {
    id: 'prod-12',
    name: 'Câble Tressé Renforcé Type-C vers Type-C (2m)',
    brand: 'UGREEN',
    category: 'Électronique',
    priceFCFA: 0,
    stockStatus: 'on_order',
    description: 'Câble tressé ultra-résistant supportant la charge rapide 100W et le transfert de vos gros fichiers créatifs en quelques secondes.',
    imageUrl: '/images/store/prod-12.jpg',
    badge: '📦 Sur Commande',
    isActive: true,
    createdAt: '2026-08-02'
  }
];
