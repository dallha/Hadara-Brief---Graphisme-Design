import React, { useState, useEffect } from 'react';
import { Search, X, Briefcase, User, CreditCard, FileText, ChevronRight, Layers } from 'lucide-react';
import { BriefData } from '../../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  briefs: BriefData[];
  onOpenProject360: (brief: BriefData) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  briefs,
  onOpenProject360,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredBriefs = query.trim()
    ? briefs.filter(
        (b) =>
          b.mainTitle.toLowerCase().includes(query.toLowerCase()) ||
          b.clientName.toLowerCase().includes(query.toLowerCase()) ||
          b.id.toLowerCase().includes(query.toLowerCase()) ||
          b.whatsapp.includes(query)
      )
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden">
        
        {/* Search Input Bar */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-amber-400 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Recherche globale (Tapez un nom client, ID, projet ou téléphone)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-slate-100 text-sm focus:outline-none placeholder-slate-500"
          />
          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 font-mono text-[10px]">ESC</span>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Area */}
        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-2">
          {!query.trim() ? (
            <div className="p-8 text-center text-xs text-slate-500 font-mono">
              Tapez un mot-clé pour lancer la recherche universelle (Cmd + K).
            </div>
          ) : filteredBriefs.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              Aucun résultat trouvé pour "{query}".
            </div>
          ) : (
            filteredBriefs.map((b) => (
              <div
                key={b.id}
                onClick={() => {
                  onOpenProject360(b);
                  onClose();
                }}
                className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-400/50 transition-all flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-amber-400/10 text-amber-400 shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-amber-400">{b.id}</span>
                      <span className="text-xs font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
                        "{b.mainTitle}"
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Client : {b.clientName} ({b.whatsapp}) • Statut : <span className="uppercase font-bold">{b.status}</span>
                    </p>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-amber-400 transition-colors shrink-0" />
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
