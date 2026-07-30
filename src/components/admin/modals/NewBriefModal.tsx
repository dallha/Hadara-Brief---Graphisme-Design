import React, { useState } from 'react';
import { X } from 'lucide-react';
import { BriefData } from '../../../types';

interface NewBriefModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddNewBriefDirectly?: (briefData: Omit<BriefData, 'id' | 'createdAt' | 'status'>) => Promise<void>;
}

export const NewBriefModal: React.FC<NewBriefModalProps> = ({ isOpen, onClose, onAddNewBriefDirectly }) => {
  const [newBriefForm, setNewBriefForm] = useState<Partial<BriefData>>({
    clientName: '', whatsapp: '', projectType: 'affiche', mainTitle: '', budgetRange: 'sur_devis'
  });

  if (!isOpen) return null;

  // Mask the state functions so they map to internal state
  const isNewBriefModalOpen = isOpen;
  const setIsNewBriefModalOpen = (val: boolean) => { if(!val) onClose(); };

  return (
    <>
      {isNewBriefModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-100">Créer un Brief Manuel</h3>
              <button onClick={() => setIsNewBriefModalOpen(false)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Nom Client *</label>
                  <input type="text" value={newBriefForm.clientName} onChange={e => setNewBriefForm(p => ({...p, clientName: e.target.value}))} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-amber-400" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">WhatsApp *</label>
                  <input type="text" value={newBriefForm.whatsapp} onChange={e => setNewBriefForm(p => ({...p, whatsapp: e.target.value}))} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-amber-400" />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Titre du Projet</label>
                <input type="text" value={newBriefForm.mainTitle} onChange={e => setNewBriefForm(p => ({...p, mainTitle: e.target.value}))} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-amber-400" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Type</label>
                  <select value={newBriefForm.projectType} onChange={e => setNewBriefForm(p => ({...p, projectType: e.target.value as any}))} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-amber-400">
                    <option value="affiche">Affiche</option>
                    <option value="bache">Bâche</option>
                    <option value="logo">Logo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Format</label>
                  <input type="text" value={newBriefForm.technicalFormat} onChange={e => setNewBriefForm(p => ({...p, technicalFormat: e.target.value}))} placeholder="A3, A4, Carré..." className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-amber-400" />
                </div>
              </div>
              
              <button onClick={() => {
                if (onAddNewBriefDirectly && newBriefForm.clientName && newBriefForm.whatsapp) {
                  onAddNewBriefDirectly(newBriefForm as Omit<BriefData, 'id' | 'createdAt' | 'status'>);
                  setIsNewBriefModalOpen(false);
                }
              }} className="w-full py-4 mt-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold transition-colors">
                Enregistrer le Dossier
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
};
