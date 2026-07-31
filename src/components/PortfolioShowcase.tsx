import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Palette, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Tag, 
  Eye, 
  Globe, 
  ExternalLink
} from 'lucide-react';

import { SamplePortfolioItem } from '../types';

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

export const PortfolioShowcase: React.FC<PortfolioShowcaseProps> = ({
  items,
  onSelectCategoryForBrief,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [activeModalItem, setActiveModalItem] = useState<SamplePortfolioItem | null>(null);

  const displayItems = items || [];

  const filteredItems = displayItems.filter((item) => {
    if (selectedFilter === 'all') return true;
    const cat = (item.category || '').toLowerCase();
    if (selectedFilter === 'identite' && (cat.includes('identité') || cat.includes('logo') || cat.includes('branding'))) return true;
    if (selectedFilter === 'communication' && (cat.includes('communication') || cat.includes('affiche') || cat.includes('flyer'))) return true;
    if (selectedFilter === 'grandformat' && (cat.includes('grand format') || cat.includes('bâche') || cat.includes('bache'))) return true;
    if (selectedFilter === 'booster' && (cat.includes('booster') || cat.includes('package') || cat.includes('pack'))) return true;
    if (selectedFilter === 'web' && (cat.includes('web') || cat.includes('site') || cat.includes('digital') || cat.includes('ia'))) return true;
    return false;
  });

  return (
    <div className="space-y-12 pb-16 max-w-7xl mx-auto px-4 sm:px-6 relative">
      
      {/* Decorative background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-5 max-w-3xl mx-auto relative z-10"
      >
        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold shadow-[0_0_15px_rgba(245,158,11,0.15)]">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Graphiste de la Hadara — El Hadji Abdoulaye Niass</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-serif font-extrabold text-slate-100 tracking-tight">
          Nos Services & <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Portfolio</span>
        </h2>

        <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
          Combinaison d’une approche esthétique moderne avec la richesse de notre héritage culturel. Explorez nos offres et consultez nos réalisations complètes sur Behance.
        </p>

        {/* External Behance Link Banner */}
        <div className="pt-2">
          <a
            href="https://www.behance.net/mrniasse"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-3 px-6 py-3.5 rounded-2xl bg-[#0057ff]/10 border border-[#0057ff]/30 hover:bg-[#0057ff]/20 font-serif font-bold text-sm shadow-xl hover:shadow-[#0057ff]/20 transition-all group"
          >
            <Globe className="w-5 h-5 text-[#0057ff]" />
            <span className="text-slate-200">Consulter le Portfolio Complet sur Behance</span>
            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-6">
          {[
            { id: 'all', label: 'Toutes les offres' },
            { id: 'identite', label: 'Identité & Logo' },
            { id: 'communication', label: 'Communication Visuelle' },
            { id: 'grandformat', label: 'Grand Format (Bâches)' },
            { id: 'booster', label: 'Packages Booster' },
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
        className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10"
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
              className="group rounded-[2rem] bg-slate-900/50 backdrop-blur-md border border-slate-800 hover:border-amber-500/50 transition-all duration-500 overflow-hidden flex flex-col justify-between shadow-2xl hover:shadow-[0_20px_40px_-15px_rgba(245,158,11,0.15)]"
            >
              {/* Styled Visual Mockup Container */}
              <div className={`h-64 sm:h-80 bg-gradient-to-br ${item.colorBg} relative p-6 flex flex-col justify-between overflow-hidden group-hover:scale-[1.02] transition-transform duration-700 ease-out origin-bottom`}>
                
                {/* Background Islamic / Geometric Pattern Overlay */}
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#d97706_1.5px,transparent_1.5px)] [background-size:24px_24px] pointer-events-none mix-blend-overlay" />

                <div className="relative z-10 flex items-center justify-between">
                  <span className="px-3.5 py-1.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-amber-500/40 text-amber-300 text-xs font-bold shadow-lg">
                    {item.badge}
                  </span>
                  <span className="px-3.5 py-1.5 rounded-full bg-slate-950/80 backdrop-blur-md text-emerald-400 text-xs font-mono font-bold border border-emerald-500/20 shadow-lg">
                    {item.priceEstimate}
                  </span>
                </div>

                {/* Sample Poster Visual Representation */}
                <div className="relative z-10 my-auto text-center space-y-3 p-6 rounded-3xl bg-slate-950/40 backdrop-blur-lg border border-white/10 shadow-2xl group-hover:bg-slate-950/60 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/40 mx-auto flex items-center justify-center text-amber-300 font-serif text-lg font-bold shadow-inner">
                    ح
                  </div>
                  <h3 className="text-xl sm:text-2xl font-serif font-extrabold text-white tracking-wide drop-shadow-md">
                    {item.title}
                  </h3>
                  <p className="text-xs text-amber-200/90 font-medium tracking-wide">
                    {item.imageTheme}
                  </p>
                </div>

                {/* Bottom Card Footer */}
                <div className="relative z-10 flex items-center justify-between text-xs text-slate-300">
                  <span className="flex items-center space-x-1.5 text-xs text-slate-100 font-medium px-3 py-1.5 bg-slate-900/50 rounded-lg backdrop-blur-sm">
                    <Tag className="w-3.5 h-3.5 text-amber-400" />
                    <span>{item.category}</span>
                  </span>
                  <button
                    onClick={() => setActiveModalItem(item)}
                    className="px-4 py-2 rounded-xl bg-slate-950/80 hover:bg-slate-900 text-white font-bold text-xs flex items-center space-x-1.5 border border-white/10 hover:border-amber-500/50 transition-all shadow-lg"
                  >
                    <Eye className="w-4 h-4 text-amber-400" />
                    <span>Aperçu</span>
                  </button>
                </div>
              </div>

              {/* Content info */}
              <div className="p-6 sm:p-8 space-y-5">
                <p className="text-sm text-slate-300 leading-relaxed font-medium">
                  {item.description}
                </p>

                <div className="space-y-3">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                    Inclus dans la livraison :
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {item.features.map((feat, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-xl bg-emerald-950/30 border border-emerald-900/50 text-[11px] text-emerald-300 font-semibold flex items-center space-x-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{feat}</span>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Tarif indicatif</p>
                    <p className="text-lg font-extrabold text-amber-400 font-mono">{item.priceEstimate}</p>
                  </div>

                  <button
                    onClick={() => onSelectCategoryForBrief(item.category)}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm transition-all flex items-center justify-center sm:justify-start space-x-2 shadow-[0_0_15px_rgba(245,158,11,0.2)] active:scale-95 group/btn"
                  >
                    <span>Commander</span>
                    <ArrowRight className="w-4 h-4 text-slate-950 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Detail Modal */}
      <AnimatePresence>
        {activeModalItem && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-slate-900/90 border border-slate-700/50 rounded-[2.5rem] max-w-2xl w-full p-6 sm:p-10 space-y-6 shadow-2xl relative"
            >
              <div className="flex items-start justify-between border-b border-slate-800 pb-5">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-amber-400 flex items-center gap-1.5 mb-1">
                    <Palette className="w-4 h-4" /> {activeModalItem.category}
                  </span>
                  <h3 className="text-2xl font-serif font-extrabold text-white">{activeModalItem.title}</h3>
                </div>
                <button
                  onClick={() => setActiveModalItem(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
                >
                  Fermer
                </button>
              </div>

              <div className="space-y-6 text-sm text-slate-300">
                <p className="leading-relaxed text-base">{activeModalItem.description}</p>
                
                <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-2 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Sparkles className="w-16 h-16 text-amber-400" />
                  </div>
                  <p className="font-bold text-amber-400 text-base">Conseil du Graphiste :</p>
                  <p className="text-slate-300 leading-relaxed relative z-10">
                    Pour un résultat optimal, fournissez le titre exact (français/arabe), les noms des conférenciers, la date précise et la localisation. Si vous avez un logo, joignez-le en PNG haute qualité sans fond.
                  </p>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-center sm:text-left w-full sm:w-auto">
                    <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">Tarif estimé</p>
                    <p className="text-2xl font-extrabold text-amber-400 font-mono">{activeModalItem.priceEstimate}</p>
                  </div>
                  <button
                    onClick={() => {
                      const cat = activeModalItem.category;
                      setActiveModalItem(null);
                      onSelectCategoryForBrief(cat);
                    }}
                    className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-sm shadow-xl hover:shadow-amber-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <span>Lancer ce Brief</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
