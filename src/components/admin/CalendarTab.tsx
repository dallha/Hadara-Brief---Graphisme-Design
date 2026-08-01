import React, { useState } from 'react';
import { BriefData } from '../../types';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  User, 
  Maximize2 
} from 'lucide-react';

interface CalendarTabProps {
  briefs: BriefData[];
  onOpenProject360: (brief: BriefData) => void;
}

export const CalendarTab: React.FC<CalendarTabProps> = ({ briefs, onOpenProject360 }) => {
  const safeBriefs = Array.isArray(briefs) ? briefs : [];
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  // Calculate approaching deadlines (within 3 days) or overdue
  const todayStr = new Date().toISOString().split('T')[0];

  const upcomingDeadlines = safeBriefs.filter((b) => {
    if (b.status === 'termine') return false;
    return true;
  });

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-slate-100 flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-amber-400" />
            <span>Calendrier des Échéances & Livraisons</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">Planning de production, charge de travail quotidienne et gestion des retards</p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setViewMode('month')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'month' ? 'bg-amber-400 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Vue Mois
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'week' ? 'bg-amber-400 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Vue Échéances Prévues
          </button>
        </div>
      </div>

      {/* Deadlines Warning Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Schedule List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xs font-serif font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" /> Prochaines Livraisons Prévues
          </h3>

          <div className="space-y-3">
            {upcomingDeadlines.length === 0 ? (
              <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center text-slate-500 text-xs">
                Aucune livraison urgente planifiée.
              </div>
            ) : (
              upcomingDeadlines.map((brief) => (
                <div
                  key={brief.id}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-400/50 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-amber-400/10 border border-amber-400/30 text-amber-400 font-mono text-xs font-bold">
                        {brief.id}
                      </span>
                      <span className="text-sm font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
                        "{brief.mainTitle}"
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      <span>{brief.clientName} ({brief.organization || 'Particulier'})</span>
                    </p>
                  </div>

                  <div className="flex items-center space-x-3 w-full sm:w-auto shrink-0">
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 font-serif font-bold uppercase">Date de livraison</p>
                      <p className="text-xs font-mono font-bold text-amber-400">{brief.desiredDeliveryDate || 'À définir'}</p>
                    </div>

                    <button
                      onClick={() => onOpenProject360(brief)}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors"
                    >
                      Voir Fiche
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Sidebar: Daily Workload Summary */}
        <div className="space-y-4">
          <h3 className="text-xs font-serif font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Maximize2 className="w-4 h-4 text-amber-400" /> Metrics & Charge de Travail
          </h3>

          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 text-xs">
            <div className="flex justify-between items-center text-slate-300">
              <span>Projets en cours :</span>
              <span className="font-bold font-mono text-amber-400">{briefs.filter(b => b.status === 'en_creation').length}</span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span>En attente validation :</span>
              <span className="font-bold font-mono text-orange-400">{briefs.filter(b => b.status === 'validation').length}</span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span>Livrés ce mois :</span>
              <span className="font-bold font-mono text-emerald-400">{briefs.filter(b => b.status === 'termine').length}</span>
            </div>

            <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 leading-relaxed">
              💡 Le rythme moyen de livraison conseillé est de 2 visuels majeurs par jour afin de garantir la haute qualité d'impression Hadara.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
