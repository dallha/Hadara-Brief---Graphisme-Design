import React, { useState } from 'react';
import { SoftDeleteTrashItem } from '../../types';
import { Trash2, RefreshCw, X, AlertTriangle, ShieldCheck } from 'lucide-react';

interface TrashBinModalProps {
  isOpen: boolean;
  onClose: () => void;
  deletedItems: SoftDeleteTrashItem[];
  onRestoreItem: (itemId: string) => void;
  onPermanentDelete: (itemId: string) => void;
}

export const TrashBinModal: React.FC<TrashBinModalProps> = ({
  isOpen,
  onClose,
  deletedItems,
  onRestoreItem,
  onPermanentDelete,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-auto">
        
        {/* Header */}
        <div className="p-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-slate-100">Corbeille & Restauration (Soft-Delete)</h2>
              <p className="text-xs text-slate-400">Restaurez instantanément tout élément supprimé par erreur</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
          {deletedItems.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-slate-800 rounded-2xl text-slate-500 text-xs">
              La corbeille est actuellement vide. Aucune donnée supprimée.
            </div>
          ) : (
            deletedItems.map((item) => (
              <div key={item.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-mono font-bold uppercase">
                      {item.entityType}
                    </span>
                    <h4 className="text-xs font-bold text-slate-100">{item.title}</h4>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 font-mono">
                    Supprimé par {item.deletedBy} le {item.deletedAt}
                  </p>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => onRestoreItem(item.id)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold transition-all flex items-center space-x-1 border border-emerald-500/30"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Restaurer</span>
                  </button>
                  <button
                    onClick={() => onPermanentDelete(item.id)}
                    className="p-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 text-xs transition-colors"
                    title="Supprimer définitivement"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
