import React, { useState } from 'react';
import { BriefData, BriefStatus, UserRole } from '../types';
import { KanbanTab } from './admin/KanbanTab';
import { Project360Modal } from './admin/Project360Modal';
import { MigrationTool } from './admin/MigrationTool';
import { BillingTool } from './BillingTool';
import { LayoutDashboard, LogOut, Briefcase, FileText, Download } from 'lucide-react';

interface AdminDashboardProps {
  briefs: BriefData[];
  onUpdateStatus: (briefId: string, status: BriefStatus, notes?: string) => Promise<void>;
  onLogout?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  briefs,
  onUpdateStatus,
  onLogout,
}) => {
  const [userRole] = useState<UserRole>('admin');
  const [selected360Brief, setSelected360Brief] = useState<BriefData | null>(null);
  const [activeTab, setActiveTab] = useState<'kanban' | 'billing' | 'migration'>('kanban');

  // Safe parsing for briefs in case any fields are missing
  const safeBriefs = (briefs || []).map(b => ({
    ...b,
    stylePreferences: Array.isArray(b.stylePreferences) ? b.stylePreferences : [],
    targetAudienceChips: Array.isArray(b.targetAudienceChips) ? b.targetAudienceChips : [],
    attachments: Array.isArray(b.attachments) ? b.attachments : [],
  }));

  return (
    <div className="min-h-screen bg-[#0d131f] text-slate-300 font-sans flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#141c2e]/95 backdrop-blur-md border-b border-[#335A79]/30">
        <div className="flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 py-3 gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#816C07] to-[#F5F5DC] flex items-center justify-center shadow-lg shadow-[#816C07]/20">
              <LayoutDashboard className="w-4 h-4 sm:w-5 sm:h-5 text-slate-900" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black text-[#F5F5DC] tracking-tight flex items-center space-x-2">
                <span>Hadara Studio</span>
                <span className="text-[10px] uppercase font-bold tracking-widest bg-[#335A79]/30 text-[#D4C9BF] px-2 py-0.5 rounded-full border border-[#335A79]/50">
                  {activeTab === 'kanban' ? 'Projets & Briefs' : activeTab === 'billing' ? 'Facturation' : 'Migration'}
                </span>
              </h1>
              <p className="text-[10px] sm:text-xs text-[#D4C9BF]/70 font-mono">
                {activeTab === 'kanban' ? 'Production et suivi' : activeTab === 'billing' ? 'Revenus et documents financiers' : 'Outil de rapprochement'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <div className="flex bg-slate-800/50 p-1 rounded-lg border border-slate-700/50 mr-4">
              <button 
                onClick={() => setActiveTab('kanban')}
                className={`px-3 py-1 flex items-center space-x-1.5 text-xs font-bold rounded-md transition-colors ${activeTab === 'kanban' ? 'bg-amber-500 text-slate-900' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Projets & Briefs</span>
              </button>
              <button 
                onClick={() => setActiveTab('billing')}
                className={`px-3 py-1 flex items-center space-x-1.5 text-xs font-bold rounded-md transition-colors ${activeTab === 'billing' ? 'bg-amber-500 text-slate-900' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Facturation & Revenus</span>
              </button>
              <button 
                onClick={() => setActiveTab('migration')}
                className={`px-3 py-1 flex items-center space-x-1.5 text-xs font-bold rounded-md transition-colors ${activeTab === 'migration' ? 'bg-amber-500 text-slate-900' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Migration</span>
              </button>
            </div>

            {onLogout && (
              <button
                onClick={onLogout}
                className="flex-shrink-0 flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 transition-colors text-xs font-bold"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-2 sm:p-4 overflow-y-auto">
        {activeTab === 'kanban' && (
          <KanbanTab 
            briefs={safeBriefs} 
            userRole={userRole}
            onOpenProject360={(b) => setSelected360Brief(b)}
            onUpdateStatus={async (id, st) => onUpdateStatus(id, st)}
          />
        )}
        {activeTab === 'billing' && (
          <BillingTool />
        )}
        {activeTab === 'migration' && (
          <MigrationTool />
        )}
      </main>

      {/* Modals */}
      {selected360Brief && (
        <Project360Modal 
          brief={selected360Brief}
          userRole={userRole}
          onClose={() => setSelected360Brief(null)}
          onUpdateStatus={onUpdateStatus}
          onUpdateBriefEnriched={async () => {}}
          onPrintBrief={() => window.print()}
        />
      )}
    </div>
  );
};
