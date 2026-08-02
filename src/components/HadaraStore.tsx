import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, 
  Search, 
  Sparkles, 
  Send, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Tag, 
  Laptop,
  Printer,
  Palette,
  Zap,
  Info,
  ShieldCheck,
  BadgeCheck,
  Truck,
  Check,
  X,
  Target,
  Award
} from 'lucide-react';
import { StoreProduct, StockStatus } from '../types';

interface HadaraStoreProps {
  products: StoreProduct[];
}

const CATEGORIES = [
  { id: 'all', label: 'Tous les produits', icon: ShoppingBag },
  { id: 'Accessoires', label: 'Accessoires', icon: Laptop },
  { id: 'Impression', label: 'Impression', icon: Printer },
  { id: 'Graphisme', label: 'Graphisme', icon: Palette },
  { id: 'Électronique', label: 'Électronique', icon: Zap },
];

export const HadaraStore: React.FC<HadaraStoreProps> = ({ products }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeModalProduct, setActiveModalProduct] = useState<StoreProduct | null>(null);

  // Active products only for public store
  const activeProducts = (products || []).filter(p => p.isActive !== false);

  const filteredProducts = activeProducts.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category.toLowerCase() === selectedCategory.toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      product.name.toLowerCase().includes(query) ||
      (product.brand || '').toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query) ||
      (product.badge || '').toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  const getStockBadge = (status: StockStatus) => {
    switch (status) {
      case 'in_stock':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold backdrop-blur-md shadow-md">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>En stock</span>
          </span>
        );
      case 'available_24_48h':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/40 text-[11px] font-bold backdrop-blur-md shadow-md">
            <Truck className="w-3.5 h-3.5" />
            <span>Dispo 24–48h</span>
          </span>
        );
      case 'on_order':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/40 text-[11px] font-bold backdrop-blur-md shadow-md">
            <Clock className="w-3.5 h-3.5" />
            <span>Sur commande</span>
          </span>
        );
      case 'unavailable':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/40 text-[11px] font-bold backdrop-blur-md shadow-md">
            <XCircle className="w-3.5 h-3.5" />
            <span>Indisponible</span>
          </span>
        );
      default:
        return null;
    }
  };

  const getStockText = (status: StockStatus) => {
    switch (status) {
      case 'in_stock': return 'En Stock';
      case 'available_24_48h': return 'Disponible sous 24–48h';
      case 'on_order': return 'Sur Commande';
      case 'unavailable': return 'Indisponible';
    }
  };

  const generateWhatsAppUrl = (product: StoreProduct) => {
    const phone = '221776232741';
    const message = `Bonjour El Hadji Abdoulaye Niass,

Je souhaite obtenir des informations concernant :
🛍️ *Produit* : ${product.name}${product.brand ? ` (${product.brand})` : ''}
🏷️ *Catégorie* : ${product.category}
📦 *Statut* : ${getStockText(product.stockStatus)}

Merci de me communiquer :
• Le prix actuel
• La disponibilité exacte
• Les modalités de livraison

Merci.`;

    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="space-y-10 pb-16 max-w-7xl mx-auto px-4 sm:px-6 relative min-w-0">
      
      {/* Decorative ambient background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] sm:w-[700px] h-[350px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-5 max-w-3xl mx-auto relative z-10 pt-4 sm:pt-8"
      >
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-widest shadow-lg">
          <ShoppingBag className="w-4 h-4 text-amber-400" />
          <span>Hadara Store — Équipements Créatifs & Tech</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-serif font-extrabold text-slate-100 tracking-tight">
          Équipements & <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Accessoires Pro</span>
        </h1>

        <p className="text-slate-300 text-xs sm:text-base leading-relaxed max-w-2xl mx-auto font-light">
          Des accessoires et équipements sélectionnés avec soin pour accompagner votre activité numérique et créative au quotidien.
        </p>

        {/* Guarantees Reassurance Bar */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 py-2.5 px-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-slate-300 text-xs font-medium max-w-2xl mx-auto shadow-inner">
          <span className="flex items-center space-x-1.5 text-emerald-400 font-semibold">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Garantie fournisseur</span>
          </span>
          <span className="hidden sm:inline text-slate-700">•</span>
          <span className="flex items-center space-x-1.5 text-amber-400 font-semibold">
            <BadgeCheck className="w-4 h-4 shrink-0" />
            <span>Produits neufs</span>
          </span>
          <span className="hidden sm:inline text-slate-700">•</span>
          <span className="flex items-center space-x-1.5 text-blue-400 font-semibold">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Vérifié avant livraison</span>
          </span>
        </div>

        {/* Search & Category Filter Section */}
        <div className="pt-2 space-y-4">
          {/* Search bar */}
          <div className="relative max-w-md mx-auto">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              placeholder="Rechercher un produit ou marque (Logitech, Kingston, SSD...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-100 text-xs sm:text-sm focus:border-amber-400 focus:outline-none shadow-xl transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {CATEGORIES.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setSelectedCategory(id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  selectedCategory === id
                    ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/20 scale-105'
                    : 'bg-slate-900/70 text-slate-300 border border-slate-800 hover:border-slate-600 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900/50 border border-slate-800 max-w-md mx-auto space-y-3">
          <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-serif font-bold text-slate-300">Aucun produit trouvé</h3>
          <p className="text-xs text-slate-500">Essayez de modifier votre recherche ou de changer de catégorie.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6 relative z-10">
          {filteredProducts.map((product) => (
            <motion.div
              key={product.id}
              whileHover={{ y: -4 }}
              className="rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 transition-all overflow-hidden flex flex-col justify-between shadow-xl group relative"
            >
              {/* Product Image & Badge Overlay */}
              <div className="relative h-52 bg-slate-950 overflow-hidden flex items-center justify-center p-3">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                )}
                
                {/* Stock Status Badge */}
                <div className="absolute top-3 left-3 z-10">
                  {getStockBadge(product.stockStatus)}
                </div>

                {/* Hadara Selection Badge OR Custom Badge */}
                {product.isHadaraSelection ? (
                  <div className="absolute top-3 right-3 z-10">
                    <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 text-[10px] font-black shadow-lg flex items-center space-x-1">
                      <Target className="w-3 h-3 text-slate-950" />
                      <span>Sélection Hadara</span>
                    </span>
                  </div>
                ) : product.badge ? (
                  <div className="absolute top-3 right-3 z-10">
                    <span className="px-2.5 py-1 rounded-full bg-slate-950/90 backdrop-blur-md border border-slate-700 text-amber-300 text-[10px] font-bold shadow-md">
                      {product.badge}
                    </span>
                  </div>
                ) : null}
              </div>

              {/* Product Content Details */}
              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    {product.brand && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
                        {product.brand}
                      </span>
                    )}
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                      {product.category}
                    </span>
                  </div>

                  <h3 className="text-base font-serif font-bold text-slate-100 group-hover:text-amber-300 transition-colors line-clamp-2">
                    {product.name}
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-2 font-light">
                    {product.description}
                  </p>
                </div>

                {/* Price & Action */}
                <div className="pt-3 border-t border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">Tarif :</span>
                    <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/30">
                      {product.priceFCFA && product.priceFCFA > 0 ? `${product.priceFCFA.toLocaleString('fr-FR')} FCFA` : 'Prix sur demande'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={generateWhatsAppUrl(product)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-3 px-3 rounded-xl font-bold text-slate-950 text-xs bg-gradient-to-r from-emerald-400 to-emerald-300 hover:from-emerald-300 hover:to-emerald-200 transition-all flex items-center justify-center space-x-1.5 shadow-md shadow-emerald-400/10 active:scale-95"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Commander sur WhatsApp</span>
                    </a>

                    <button
                      onClick={() => setActiveModalProduct(product)}
                      className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors shrink-0"
                      title="Détails du produit"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Product Detail Modal */}
      <AnimatePresence>
        {activeModalProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-5 text-slate-100 relative"
            >
              <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    {getStockBadge(activeModalProduct.stockStatus)}
                    {activeModalProduct.brand && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-400/10 text-amber-400 text-xs font-bold border border-amber-400/30">
                        {activeModalProduct.brand}
                      </span>
                    )}
                    <span className="text-xs text-slate-400 font-mono font-bold">{activeModalProduct.category}</span>
                  </div>
                  <h3 className="text-xl font-serif font-bold text-slate-100 pt-1">{activeModalProduct.name}</h3>
                </div>
                <button
                  onClick={() => setActiveModalProduct(null)}
                  className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {activeModalProduct.imageUrl && (
                <div className="h-56 rounded-2xl bg-slate-950 overflow-hidden border border-slate-800 p-2">
                  <img src={activeModalProduct.imageUrl} alt={activeModalProduct.name} className="w-full h-full object-cover rounded-xl" />
                </div>
              )}

              {/* Hadara Selection Highlight Tag */}
              {activeModalProduct.isHadaraSelection && (
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center space-x-2.5 text-xs text-amber-300 font-medium">
                  <Target className="w-5 h-5 text-amber-400 shrink-0" />
                  <span>🎯 <strong>Sélection Hadara Studio</strong> : Équipement testé et validé par notre équipe créative.</span>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Description & Spécifications :</p>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">{activeModalProduct.description}</p>
              </div>

              {/* Guarantees Box inside Modal */}
              <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] text-center text-slate-300 font-medium">
                <div className="space-y-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 mx-auto" />
                  <span>Garantie fournisseur</span>
                </div>
                <div className="space-y-1">
                  <BadgeCheck className="w-4 h-4 text-amber-400 mx-auto" />
                  <span>Produit neuf</span>
                </div>
                <div className="space-y-1">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 mx-auto" />
                  <span>Contrôlé avant envoi</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">Tarification :</span>
                <span className="text-sm font-bold text-amber-400">
                  {activeModalProduct.priceFCFA && activeModalProduct.priceFCFA > 0
                    ? `${activeModalProduct.priceFCFA.toLocaleString('fr-FR')} FCFA`
                    : 'Prix sur demande'}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
                <button
                  onClick={() => setActiveModalProduct(null)}
                  className="px-4 py-3 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
                >
                  Fermer
                </button>

                <a
                  href={generateWhatsAppUrl(activeModalProduct)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3.5 rounded-xl font-bold text-slate-950 text-xs bg-gradient-to-r from-emerald-400 to-emerald-300 hover:from-emerald-300 hover:to-emerald-200 transition-all flex items-center space-x-2 shadow-xl shadow-emerald-400/20"
                >
                  <Send className="w-4 h-4" />
                  <span>Obtenir les informations sur WhatsApp</span>
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
