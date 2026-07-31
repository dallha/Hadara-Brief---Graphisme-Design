import React, { useState } from 'react';
import { SaaSMetricsCloud } from '../../types';
import { 
  Cloud, 
  Building, 
  TrendingUp, 
  DollarSign, 
  Users, 
  HelpCircle, 
  LifeBuoy, 
  ShieldCheck, 
  Zap, 
  Server, 
  CheckCircle2 
} from 'lucide-react';

export const HadaraCloudTab: React.FC = () => {
  const [activeCloudTab, setActiveCloudTab] = useState<'metrics' | 'studios' | 'support'>('metrics');

  const cloudMetrics: SaaSMetricsCloud = {
    activeStudiosCount: 14,
    mrrFCFA: 630000,
    arrFCFA: 7560000,
    churnRatePercentage: 1.8,
    conversionRatePercentage: 34,
    openSupportTicketsCount: 2
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Top Cloud Header Banner */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-amber-500/30 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-amber-400">
            <Cloud className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold uppercase">
                Console Hadara Cloud
              </span>
              <span className="text-xs text-slate-400">SaaS Multi-Studio Admin</span>
            </div>
            <h2 className="text-2xl font-serif font-bold text-slate-100 mt-0.5">
              Hadara Cloud — Administration SaaS & Métriques Récurrentes
            </h2>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
          {[
            { id: 'metrics', label: 'Metrics SaaS (MRR)', icon: TrendingUp },
            { id: 'studios', label: 'Studios Actifs', icon: Building },
            { id: 'support', label: 'Support & FAQ', icon: LifeBuoy },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCloudTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                activeCloudTab === tab.id
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* SUB-TAB 1: SAAS METRICS */}
      {activeCloudTab === 'metrics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-slate-400 text-xs">
                <span>Revenu Mensuel Récurrent (MRR)</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-black font-mono text-emerald-400">{cloudMetrics.mrrFCFA.toLocaleString('fr-FR')} F</p>
              <p className="text-[10px] text-slate-500">14 abonnements Pro Studio actifs</p>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-slate-400 text-xs">
                <span>Revenu Annuel Projeté (ARR)</span>
                <TrendingUp className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-2xl font-black font-mono text-slate-100">{cloudMetrics.arrFCFA.toLocaleString('fr-FR')} F</p>
              <p className="text-[10px] text-slate-500">Croissance annuelle prévisionnelle</p>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-slate-400 text-xs">
                <span>Taux de Churn</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-black font-mono text-emerald-400">{cloudMetrics.churnRatePercentage} %</p>
              <p className="text-[10px] text-slate-500">Excellente rétention des studios</p>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-slate-400 text-xs">
                <span>Conversion Essais ➔ Payant</span>
                <Zap className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-2xl font-black font-mono text-amber-400">{cloudMetrics.conversionRatePercentage} %</p>
              <p className="text-[10px] text-slate-500">Période d'essai 14 jours</p>
            </div>

          </div>
        </div>
      )}

      {/* SUB-TAB 2: STUDIOS LIST */}
      {activeCloudTab === 'studios' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-serif font-bold text-slate-100">Instances Studios Déployées sur Hadara Cloud</h3>
          
          <div className="space-y-3">
            {[
              { id: 'STD-1001', name: 'Hadara Studio Original', owner: 'Cheikh Ndoye', plan: 'Enterprise WhiteLabel', domain: 'hadara-design.com', status: 'actif' },
              { id: 'STD-1002', name: 'Dakar Graphics Studio', owner: 'Mamadou Diallo', plan: 'Pro Studio', domain: 'dakar-graphics.sn', status: 'actif' },
              { id: 'STD-1003', name: 'Touba Design & Print', owner: 'Serigne Fallou', plan: 'Pro Studio', domain: 'touba-design.sn', status: 'actif' },
            ].map((st) => (
              <div key={st.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-amber-400">{st.id}</span>
                    <span className="font-bold text-slate-100 text-sm">{st.name}</span>
                  </div>
                  <p className="text-xs text-slate-400">Fondateur : {st.owner} • Domaine : <span className="font-mono text-slate-300">{st.domain}</span></p>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold uppercase">
                    {st.plan}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: SUPPORT */}
      {activeCloudTab === 'support' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-serif font-bold text-slate-100">Centre d'Assistance & Tickets Support Studios</h3>
          <p className="text-xs text-slate-400">Support prioritaire 24/7 pour les studios abonnés à la plateforme SaaS Hadara Suite.</p>
        </div>
      )}

    </div>
  );
};
