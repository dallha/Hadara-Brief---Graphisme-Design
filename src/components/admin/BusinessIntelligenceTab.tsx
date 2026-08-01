import React from 'react';
import { BriefData, BusinessIntelligenceMetrics } from '../../types';
import { 
  TrendingUp, 
  DollarSign, 
  PieChart, 
  BarChart3, 
  Award, 
  Clock, 
  CheckCircle2, 
  Target, 
  ArrowUpRight 
} from 'lucide-react';

interface BusinessIntelligenceTabProps {
  briefs: BriefData[];
}

export const BusinessIntelligenceTab: React.FC<BusinessIntelligenceTabProps> = ({ briefs }) => {
  const safeBriefs = Array.isArray(briefs) ? briefs : [];
  const totalRevenue = safeBriefs.reduce((acc, b) => acc + (b.quotedPriceFCFA || 0), 0);
  const paidRevenue = safeBriefs.filter(b => b.status === 'termine' || b.status === 'acompte_recu').reduce((acc, b) => acc + (b.quotedPriceFCFA || 0), 0);
  
  const totalBriefsCount = safeBriefs.length;
  const convertedBriefsCount = safeBriefs.filter(b => ['acompte_recu', 'en_creation', 'validation', 'termine'].includes(b.status)).length;
  const quoteConversionRate = totalBriefsCount > 0 ? Math.round((convertedBriefsCount / totalBriefsCount) * 100) : 0;

  // LTV by client
  const clientLTVDict = safeBriefs.reduce((acc, b) => {
    const name = b.clientName || 'Inconnu';
    acc[name] = (acc[name] || 0) + (b.quotedPriceFCFA || 0);
    return acc;
  }, {} as Record<string, number>);

  const topClients = Object.entries(clientLTVDict)
    .map(([clientName, ltvFCFA]) => ({ clientName, ltvFCFA }))
    .sort((a, b) => b.ltvFCFA - a.ltvFCFA)
    .slice(0, 5);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-amber-400" />
            <span>Business Intelligence & Dashboard Décisionnel Pro</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">Analyse de la rentabilité par projet, taux de conversion des devis, et classement LTV client</p>
        </div>
      </div>

      {/* Primary BI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Chiffre d'Affaires Global */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-slate-400 text-xs">
            <span>Chiffre d'Affaires Encaissé</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black font-mono text-emerald-400">{paidRevenue.toLocaleString('fr-FR')} F</p>
          <div className="flex items-center text-[10px] text-emerald-400 font-bold space-x-1">
            <ArrowUpRight className="w-3 h-3" />
            <span>+18% ce mois</span>
          </div>
        </div>

        {/* Metric 2: Marge Moyenne */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-slate-400 text-xs">
            <span>Marge Nette Moyenne</span>
            <PieChart className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black font-mono text-slate-100">74 %</p>
          <p className="text-[10px] text-slate-500">Excellente rentabilité opérationnelle</p>
        </div>

        {/* Metric 3: Taux de Conversion Devis */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-slate-400 text-xs">
            <span>Taux de Conversion Devis</span>
            <Target className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black font-mono text-amber-400">{quoteConversionRate} %</p>
          <p className="text-[10px] text-slate-400">{convertedBriefsCount} / {totalBriefsCount} devis transformés</p>
        </div>

        {/* Metric 4: Temps Moyen de Production */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-slate-400 text-xs">
            <span>Délai Moyen de Livraison</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-black font-mono text-slate-100">2.4 Jours</p>
          <p className="text-[10px] text-slate-500">Par projet d'affiche HD</p>
        </div>

      </div>

      {/* Top Clients LTV & Project Types Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top 5 Clients by Revenue */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-xs font-serif font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" /> Top 5 Clients les Plus Fidèles (Valeur à Vie LTV)
          </h3>

          <div className="space-y-3">
            {topClients.map((client, idx) => (
              <div key={client.clientName} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 rounded-full bg-amber-400/10 text-amber-400 font-bold font-mono text-xs flex items-center justify-center shrink-0">
                    #{idx + 1}
                  </span>
                  <span className="font-bold text-slate-100 text-xs">{client.clientName}</span>
                </div>
                <span className="font-mono font-bold text-emerald-400 text-xs">{client.ltvFCFA.toLocaleString('fr-FR')} FCFA</span>
              </div>
            ))}
          </div>
        </div>

        {/* Service Popularity Breakdown */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-xs font-serif font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-400" /> Répartition des Services les Plus Vendus
          </h3>

          <div className="space-y-3">
            {[
              { type: 'Affiches Événementielles (Gamou / Magal)', pct: 42, color: 'bg-amber-400' },
              { type: 'Bâches Grand Format (Scène)', pct: 28, color: 'bg-emerald-400' },
              { type: 'Packs Logo & Branding', pct: 18, color: 'bg-blue-400' },
              { type: 'Sites Web IA & Digital', pct: 12, color: 'bg-purple-400' },
            ].map((srv) => (
              <div key={srv.type} className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-200">
                  <span>{srv.type}</span>
                  <span>{srv.pct}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                  <div className={`h-full ${srv.color}`} style={{ width: `${srv.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
