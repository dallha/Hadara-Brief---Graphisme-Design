import React, { useState } from 'react';
import { 
  Palette, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Tag, 
  Eye, 
  DollarSign, 
  Layers, 
  FileText,
  BadgeCheck,
  Globe,
  ExternalLink
} from 'lucide-react';
import { PORTFOLIO_ITEMS } from '../data/portfolioData';
import { SamplePortfolioItem } from '../types';

interface PortfolioShowcaseProps {
  onSelectCategoryForBrief: (categoryType: string) => void;
}

export const PortfolioShowcase: React.FC<PortfolioShowcaseProps> = ({
  onSelectCategoryForBrief,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [activeModalItem, setActiveModalItem] = useState<SamplePortfolioItem | null>(null);

  const filteredItems = PORTFOLIO_ITEMS.filter((item) => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'identite' && item.category.toLowerCase().includes('identité')) return true;
    if (selectedFilter === 'communication' && item.category.toLowerCase().includes('communication')) return true;
    if (selectedFilter === 'grandformat' && item.category.toLowerCase().includes('grand format')) return true;
    if (selectedFilter === 'booster' && item.category.toLowerCase().includes('booster')) return true;
    if (selectedFilter === 'web' && item.category.toLowerCase().includes('web')) return true;
    return true;
  });

  return (
    <div className="space-y-12 pb-16 max-w-7xl mx-auto px-4 sm:px-6">
      
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Graphiste de la Hadara — El Hadji Abdoulaye Niass</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-100">
          Nos Services, Packages & Portfolio
        </h2>

        <p className="text-slate-300 text-sm leading-relaxed">
          Combinaison d’une approche esthétique moderne avec la richesse de notre héritage culturel. Explorez nos offres et consultez nos réalisations complètes sur Behance.
        </p>

        {/* External Behance Link Banner */}
        <div className="pt-2">
          <a
            href="https://www.behance.net/mrniasse"
            target="_blank"
            rel="noopener noreferrer"
            className="behance-btn inline-flex items-center space-x-2.5 px-6 py-3 rounded-xl font-serif font-bold text-xs sm:text-sm shadow-xl transition-all group"
          >
            <Globe className="w-4 h-4 behance-gold-icon" />
            <span className="text-[#F5F5DC]">Consulter le Portfolio Complet sur Behance (behance.net/mrniasse)</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#F5F5DC]/80 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
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
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedFilter === tab.id
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Portfolio Samples */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="group rounded-3xl bg-slate-900 border border-slate-800 hover:border-amber-500/60 transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-xl"
          >
            {/* Styled Visual Mockup Container */}
            <div className={`h-64 sm:h-72 bg-gradient-to-br ${item.colorBg} relative p-6 flex flex-col justify-between overflow-hidden`}>
              
              {/* Background Islamic / Geometric Pattern Overlay */}
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

              <div className="relative z-10 flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur border border-amber-500/40 text-amber-300 text-xs font-bold">
                  {item.badge}
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur text-emerald-400 text-xs font-mono font-bold">
                  {item.priceEstimate}
                </span>
              </div>

              {/* Sample Poster Visual Representation */}
              <div className="relative z-10 my-auto text-center space-y-2 p-4 rounded-2xl bg-slate-950/60 backdrop-blur border border-slate-800/80 shadow-2xl">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 mx-auto flex items-center justify-center text-amber-300 font-serif text-sm font-bold">
                  ح
                </div>
                <h3 className="text-lg sm:text-xl font-serif font-extrabold text-slate-100 tracking-wide">
                  {item.title}
                </h3>
                <p className="text-xs text-amber-200/90 font-medium">
                  Harmonie Visuelle : {item.imageTheme}
                </p>
              </div>

              {/* Bottom Card Footer */}
              <div className="relative z-10 flex items-center justify-between text-xs text-slate-300">
                <span className="flex items-center space-x-1 text-[11px] text-slate-400">
                  <Tag className="w-3.5 h-3.5 text-amber-400" />
                  <span>{item.category}</span>
                </span>
                <button
                  onClick={() => setActiveModalItem(item)}
                  className="px-3 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-100 font-semibold text-xs flex items-center space-x-1 border border-slate-700/80"
                >
                  <Eye className="w-3.5 h-3.5 text-amber-400" />
                  <span>Aperçu du Brief</span>
                </button>
              </div>
            </div>

            {/* Content info */}
            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed">
                {item.description}
              </p>

              <div className="space-y-2 pt-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Inclus dans la livraison :
                </p>
                <div className="flex flex-wrap gap-2">
                  {item.features.map((feat, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-emerald-300 font-medium flex items-center space-x-1"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>{feat}</span>
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Tarif indicatif</p>
                  <p className="text-sm font-extrabold text-amber-400 font-mono">{item.priceEstimate}</p>
                </div>

                <button
                  onClick={() => onSelectCategoryForBrief(item.category)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-all flex items-center justify-center sm:justify-start space-x-1.5 shadow-md active:scale-95"
                >
                  <span>Commander un projet similaire</span>
                  <ArrowRight className="w-4 h-4 text-slate-950" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-bold uppercase text-amber-400">{activeModalItem.category}</span>
                <h3 className="text-xl font-serif font-bold text-slate-100">{activeModalItem.title}</h3>
              </div>
              <button
                onClick={() => setActiveModalItem(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Fermer
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-300">
              <p className="leading-relaxed">{activeModalItem.description}</p>
              
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <p className="font-bold text-amber-300">Conseil du Graphiste pour ce type de brief :</p>
                <p className="text-slate-400">
                  Pour obtenir un résultat optimal, fournissez le titre exact en français/arabe, les noms des conférenciers, la date précise et la localisation. Si vous avez un logo de Dahira, joignez-le en fichier PNG sans fond.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400">Tarif estimé</p>
                  <p className="text-base font-extrabold text-amber-400 font-mono">{activeModalItem.priceEstimate}</p>
                </div>
                <button
                  onClick={() => {
                    const cat = activeModalItem.category;
                    setActiveModalItem(null);
                    onSelectCategoryForBrief(cat);
                  }}
                  className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95"
                >
                  Faire un brief pour ce projet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
