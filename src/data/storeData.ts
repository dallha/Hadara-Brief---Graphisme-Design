import { StoreProduct } from '../types';

export const DEFAULT_STORE_PRODUCTS: StoreProduct[] = [
  // ⌨️ ACCESSOIRES
  {
    id: 'prod-01',
    name: 'Clavier Mécanique Ergonomique Pro',
    category: 'Accessoires',
    priceFCFA: 0,
    stockStatus: 'in_stock',
    description: 'Clavier mécanique silencieux rétroéclairé, parfait pour les longues sessions de création graphique et de saisie.',
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80',
    badge: '⭐ Recommandé Pro',
    isActive: true,
    createdAt: '2026-08-02'
  },
  {
    id: 'prod-02',
    name: 'Souris Sans Fil Haute Précision',
    category: 'Accessoires',
    priceFCFA: 0,
    stockStatus: 'in_stock',
    description: 'Capteur optique haute résolution (DPI ajustable), design ergonomique pour designers et monteurs vidéo.',
    imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=600&q=80',
    badge: '🟢 En Stock',
    isActive: true,
    createdAt: '2026-08-02'
  },
  {
    id: 'prod-03',
    name: 'Casque Audio Studio Réduction de Bruit',
    category: 'Accessoires',
    priceFCFA: 0,
    stockStatus: 'on_order',
    description: 'Casque circum-aural avec isolation phonique active, microphone HD et autonomie 30 heures.',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    badge: '⏳ Sur Commande',
    isActive: true,
    createdAt: '2026-08-02'
  },
  {
    id: 'prod-04',
    name: 'SSD Externe Ultra-Rapide 1 To USB-C',
    category: 'Accessoires',
    priceFCFA: 0,
    stockStatus: 'in_stock',
    description: 'Vitesse de transfert jusqu\'à 1050 Mo/s, boîtier antichoc en aluminium. Idéal pour sauvegarder vos visuels HD.',
    imageUrl: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=600&q=80',
    badge: '🔥 Best-Seller',
    isActive: true,
    createdAt: '2026-08-02'
  },

  // 🖨️ IMPRESSION
  {
    id: 'prod-05',
    name: 'Câble Imprimante Blindé USB-A vers USB-B (3m)',
    category: 'Impression',
    priceFCFA: 0,
    stockStatus: 'in_stock',
    description: 'Câble haut débit avec connecteurs plaqués or pour une transmission sans perte vers vos imprimantes et traceurs.',
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    badge: '🟢 En Stock',
    isActive: true,
    createdAt: '2026-08-02'
  },
  {
    id: 'prod-06',
    name: 'Adaptateur USB 3.0 OTG Haute Vitesse',
    category: 'Impression',
    priceFCFA: 0,
    stockStatus: 'in_stock',
    description: 'Adaptateur universel compact pour connecter vos clés USB, imprimantes et périphériques sur smartphone ou PC.',
    imageUrl: 'https://images.unsplash.com/photo-1609592424074-8b6fa2077e68?auto=format&fit=crop&w=600&q=80',
    badge: '⚡ Pratique',
    isActive: true,
    createdAt: '2026-08-02'
  },
  {
    id: 'prod-07',
    name: 'Clé USB 3.2 Metal 64 Go Métallique',
    category: 'Impression',
    priceFCFA: 0,
    stockStatus: 'in_stock',
    description: 'Boîtier métallique étanche ultra-résistant. Idéale pour livrer les fichiers HD (PDF, TIFF, AI) à vos imprimeurs.',
    imageUrl: 'https://images.unsplash.com/photo-1563298723-dcfebaa392e3?auto=format&fit=crop&w=600&q=80',
    badge: '🟢 En Stock',
    isActive: true,
    createdAt: '2026-08-02'
  },

  // 🎨 GRAPHISME
  {
    id: 'prod-08',
    name: 'Tapis de Souris XXL Bureau Signature (90x40cm)',
    category: 'Graphisme',
    priceFCFA: 0,
    stockStatus: 'in_stock',
    description: 'Surface en tissu micro-tissé haute précision, base en caoutchouc antidérapant et coutures renforcées.',
    imageUrl: 'https://images.unsplash.com/photo-1616440342955-5986d6373845?auto=format&fit=crop&w=600&q=80',
    badge: '🎨 Hadara Edition',
    isActive: true,
    createdAt: '2026-08-02'
  },
  {
    id: 'prod-09',
    name: 'Support Laptop Pliable en Aluminium',
    category: 'Graphisme',
    priceFCFA: 0,
    stockStatus: 'in_stock',
    description: 'Réglage de la hauteur sur 6 niveaux, dissipation thermique naturelle, compatible avec ordinateurs 10 à 17 pouces.',
    imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=600&q=80',
    badge: '⭐ Ergonomie',
    isActive: true,
    createdAt: '2026-08-02'
  },
  {
    id: 'prod-10',
    name: 'Hub USB-C Multiport 7-en-1 Aluminium',
    category: 'Graphisme',
    priceFCFA: 0,
    stockStatus: 'in_stock',
    description: 'Port HDMI 4K, 3x USB 3.0, lecteur SD/MicroSD et charge rapide Power Delivery 100W.',
    imageUrl: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=600&q=80',
    badge: '🚀 Incontournable',
    isActive: true,
    createdAt: '2026-08-02'
  },

  // 🔌 ÉLECTRONIQUE
  {
    id: 'prod-11',
    name: 'Chargeur Rapide GaN 65W Multi-Ports USB-C/A',
    category: 'Électronique',
    priceFCFA: 0,
    stockStatus: 'in_stock',
    description: 'Technologie Gallium Nitride ultra-compacte pour charger rapidement PC portable, MacBook et smartphone en même temps.',
    imageUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80',
    badge: '⚡ Charge Rapide',
    isActive: true,
    createdAt: '2026-08-02'
  },
  {
    id: 'prod-12',
    name: 'Câble Tressé Renforcé Type-C vers Type-C (2m)',
    category: 'Électronique',
    priceFCFA: 0,
    stockStatus: 'in_stock',
    description: 'Gaine en nylon tressé haute résistance supportant 100W PD et transfert de données rapide.',
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    badge: '🟢 En Stock',
    isActive: true,
    createdAt: '2026-08-02'
  }
];
