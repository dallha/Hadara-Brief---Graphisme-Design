import React, { useState, useEffect } from 'react';
import { BriefData } from '../../types';
import { User, CheckCircle2, UserPlus, XCircle } from 'lucide-react';
import { HadaraClientCombobox } from '../HadaraClientCombobox';

export const MigrationTool: React.FC = () => {
  const [briefs, setBriefs] = useState<BriefData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/briefs/')
      .then(res => res.json())
      .then(data => {
        const allBriefs: BriefData[] = Array.isArray(data) ? data : data.results || [];
        // Ne garder que les briefs sans client_id
        setBriefs(allBriefs.filter(b => !b.client_id));
        setLoading(false);
      })
      .catch(err => {
        console.error("Erreur", err);
        setLoading(false);
      });
  }, []);

  const handleAssociate = async (briefId: string, clientId: string) => {
    try {
      const res = await fetch(`/api/briefs/${briefId}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: clientId })
      });
      if (res.ok) {
        setBriefs(prev => prev.filter(b => b.id !== briefId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleIgnore = (briefId: string) => {
    // Just remove from local list for now
    setBriefs(prev => prev.filter(b => b.id !== briefId));
  };

  if (loading) return <div className="p-8 text-slate-400">Chargement...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-slate-100 flex items-center">
          <User className="w-5 h-5 mr-2 text-amber-500" />
          Outil de rapprochement (Migration Assistée)
        </h2>
        <p className="text-sm text-slate-400 mt-2">
          Associez les anciens briefs à des clients officiels de la base de données. 
          {briefs.length} brief(s) à traiter.
        </p>
      </div>

      <div className="space-y-4">
        {briefs.length === 0 && (
          <div className="p-8 text-center text-emerald-400 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2" />
            Aucun brief à rapprocher. Tout est à jour !
          </div>
        )}

        {briefs.map(brief => (
          <MigrationCard 
            key={brief.id} 
            brief={brief} 
            onAssociate={(clientId) => handleAssociate(brief.id, clientId)}
            onIgnore={() => handleIgnore(brief.id)}
          />
        ))}
      </div>
    </div>
  );
};

const MigrationCard: React.FC<{ brief: BriefData, onAssociate: (id: string) => void, onIgnore: () => void }> = ({ brief, onAssociate, onIgnore }) => {
  const [selectedClientId, setSelectedClientId] = useState<string | undefined>();

  return (
    <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row gap-6">
      <div className="flex-1 space-y-2">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono font-bold bg-slate-800 text-slate-300 px-2 py-1 rounded">{brief.id}</span>
          <span className="text-sm text-slate-400">{new Date(brief.createdAt).toLocaleDateString()}</span>
        </div>
        <div className="font-bold text-lg text-slate-100">{brief.clientName || 'Inconnu'}</div>
        <div className="text-sm text-slate-400 flex flex-col gap-1">
          {brief.organization && <span>🏢 {brief.organization}</span>}
          {brief.whatsapp && <span>📱 {brief.whatsapp}</span>}
          {brief.email && <span>✉️ {brief.email}</span>}
        </div>
      </div>

      <div className="flex-1 space-y-4 border-l border-slate-800 pl-6 flex flex-col justify-center">
        <HadaraClientCombobox 
          value={selectedClientId}
          onChange={(id) => setSelectedClientId(id)}
        />

        <div className="flex items-center gap-2">
          <button 
            onClick={() => selectedClientId && onAssociate(selectedClientId)}
            disabled={!selectedClientId}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold flex items-center justify-center transition-colors ${
              selectedClientId ? 'bg-amber-500 text-slate-950 hover:bg-amber-400' : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Associer
          </button>
          
          <button 
            onClick={onIgnore}
            className="p-2 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
            title="Ignorer pour le moment"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
