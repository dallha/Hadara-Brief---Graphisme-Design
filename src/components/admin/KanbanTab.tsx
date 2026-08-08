import React, { useState } from 'react';
import { 
  BriefData, 
  BriefStatus, 
  UserRole 
} from '../../types';
import { 
  FileText, 
  Clock, 
  DollarSign, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowLeft, 
  ArrowRight, 
  User, 
  Phone, 
  Calendar, 
  Maximize2, 
  Tag, 
  Search, 
  ChevronRight,
  Eye
} from 'lucide-react';

interface KanbanTabProps {
  briefs: BriefData[];
  userRole: UserRole;
  onOpenProject360: (brief: BriefData) => void;
  onUpdateStatus: (briefId: string, status: BriefStatus) => Promise<void>;
}

const KANBAN_COLUMNS: { id: BriefStatus; title: string; color: string; border: string; bg: string; icon: any }[] = [
  { id: 'nouveau', title: 'Briefs Reçus', color: 'text-amber-400', border: 'border-amber-500/40', bg: 'bg-amber-500/10', icon: FileText },
  { id: 'devis_envoye', title: 'Devis Transmis', color: 'text-blue-400', border: 'border-blue-500/40', bg: 'bg-blue-500/10', icon: Clock },
  { id: 'acompte_recu', title: 'Acompte 50% Validé', color: 'text-emerald-400', border: 'border-emerald-500/40', bg: 'bg-emerald-500/10', icon: DollarSign },
  { id: 'en_creation', title: 'En Création', color: 'text-purple-400', border: 'border-purple-500/40', bg: 'bg-purple-500/10', icon: Sparkles },
  { id: 'validation', title: 'En Validation', color: 'text-orange-400', border: 'border-orange-500/40', bg: 'bg-orange-500/10', icon: CheckCircle2 },
  { id: 'termine', title: 'Livrés & Terminés', color: 'text-teal-400', border: 'border-teal-500/40', bg: 'bg-teal-500/10', icon: ShieldCheck },
];

export const KanbanTab: React.FC<KanbanTabProps> = ({
  briefs,
  userRole,
  onOpenProject360,
  onUpdateStatus,
}) => {
  const safeBriefs = Array.isArray(briefs) ? briefs : [];
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBriefs = safeBriefs.filter(b => 
    (b.mainTitle || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.clientName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.id || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getNextStatus = (current: BriefStatus): BriefStatus | null => {
    const sequence: BriefStatus[] = ['nouveau', 'devis_envoye', 'acompte_recu', 'en_creation', 'validation', 'termine'];
    const idx = sequence.indexOf(current);
    return idx >= 0 && idx < sequence.length - 1 ? sequence[idx + 1] : null;
  };

  const getPrevStatus = (current: BriefStatus): BriefStatus | null => {
    const sequence: BriefStatus[] = ['nouveau', 'devis_envoye', 'acompte_recu', 'en_creation', 'validation', 'termine'];
    const idx = sequence.indexOf(current);
    return idx > 0 ? sequence[idx - 1] : null;
  };

  return (
    <div className="space-y-6">
      
      {/* Top Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Rechercher dans le Kanban..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:border-amber-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-3 text-xs text-slate-400">
          <span className="font-bold text-slate-200">{safeBriefs.length} Total Projets</span>
          <span>•</span>
          <span className="text-emerald-400 font-semibold">{safeBriefs.filter(b => b.status === 'en_creation').length} En Production</span>
        </div>
      </div>

      {/* 6 Kanban Columns Grid */}
      <div className="flex flex-row overflow-x-auto snap-x snap-mandatory gap-4 pb-6 scrollbar-hide md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 md:snap-none">
        {KANBAN_COLUMNS.map((col) => {
          const colBriefs = filteredBriefs.filter((b) => b.status === col.id);
          const ColIcon = col.icon;

          return (
            <div key={col.id} className="snap-center flex flex-col rounded-2xl bg-slate-950/80 border border-slate-800/80 p-3 min-w-[280px] w-[85vw] md:w-auto min-h-[500px]">
              
              {/* Column Header */}
              <div className={`p-3 rounded-xl border ${col.bg} ${col.border} flex items-center justify-between mb-3`}>
                <div className="flex items-center space-x-2">
                  <ColIcon className={`w-4 h-4 ${col.color}`} />
                  <span className={`text-xs font-bold ${col.color}`}>{col.title}</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold ${col.bg} ${col.color} border ${col.border}`}>
                  {colBriefs.length}
                </span>
              </div>

              {/* Cards Container */}
              <div className="flex-1 space-y-3 overflow-y-auto max-h-[70vh] pr-0.5">
                {colBriefs.length === 0 ? (
                  <div className="p-6 text-center border border-dashed border-slate-800/80 rounded-xl">
                    <p className="text-[11px] text-slate-600 font-medium">Aucun projet</p>
                  </div>
                ) : (
                  colBriefs.map((brief) => {
                    const prevStatus = getPrevStatus(brief.status);
                    const nextStatus = getNextStatus(brief.status);

                    return (
                      <div
                        key={brief.id}
                        className="p-4 rounded-xl bg-slate-900 border border-slate-800/90 hover:border-amber-400/50 transition-all shadow-md space-y-3 group relative"
                      >
                        {/* ID & Project Type Badge */}
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-950 text-amber-400 border border-amber-500/20">
                            {brief.id}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">
                            {brief.projectType}
                          </span>
                        </div>

                        {/* Title & Client */}
                        <div>
                          <h4 
                            onClick={() => window.open(`https://hadara-backend.onrender.com/admin/api/brief/${brief.id}/change/`, '_blank')}
                            className="text-xs font-bold text-slate-100 group-hover:text-amber-300 transition-colors cursor-pointer line-clamp-2 leading-snug"
                          >
                            "{brief.mainTitle}"
                          </h4>
                          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                            <User className="w-3 h-3 text-slate-500" />
                            <span>{brief.clientName}</span>
                          </p>
                        </div>

                        {/* Quoted Price & Date */}
                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                          <span className="font-mono font-bold text-emerald-400">
                            {brief.quotedPriceFCFA ? `${brief.quotedPriceFCFA.toLocaleString('fr-FR')} F` : 'À deviser'}
                          </span>
                          <span className="text-[10px] text-slate-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-600" />
                            {brief.desiredDeliveryDate ? brief.desiredDeliveryDate.slice(-5) : 'Standard'}
                          </span>
                        </div>

                        {/* Action Buttons: Django Admin */}
                        <div className="pt-2 flex items-center justify-center gap-1">
                          <button
                            onClick={() => window.open(`https://hadara-backend.onrender.com/admin/api/brief/${brief.id}/change/`, '_blank')}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 font-bold text-[10px] transition-all flex items-center justify-center space-x-1"
                          >
                            <ShieldCheck className="w-3 h-3" />
                            <span>Gérer dans l'Admin</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
