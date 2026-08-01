import React, { useState } from 'react';
import { Send, Search, Users, ExternalLink, MessageCircle, Palette, Tag, Briefcase, Plus, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { BriefData, ClientBrandingAsset } from '../../types';

interface CRMTabProps {
  briefs: BriefData[];
}

export const CRMTab: React.FC<CRMTabProps> = ({ briefs }) => {
  const safeBriefs = Array.isArray(briefs) ? briefs : [];
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClientPhone, setSelectedClientPhone] = useState<string | null>(null);

  // Client branding overrides state
  const [clientBrandings, setClientBrandings] = useState<Record<string, ClientBrandingAsset>>(() => {
    const saved = localStorage.getItem('hadara_crm_client_brandings');
    return saved ? JSON.parse(saved) : {};
  });

  const [editingBrandingPhone, setEditingBrandingPhone] = useState<string | null>(null);
  const [primaryColorInput, setPrimaryColorInput] = useState('#816C07');
  const [fontInput, setFontInput] = useState('Cinzel, Cairo');
  const [brandNotesInput, setBrandNotesInput] = useState('');

  const clients = Object.values(safeBriefs.reduce((acc, b) => {
    const key = b.whatsapp || 'Inconnu';
    if (!acc[key]) {
      acc[key] = { 
        name: b.clientName || 'Inconnu', 
        org: b.organization || '', 
        whatsapp: b.whatsapp || '', 
        email: b.email || '', 
        count: 0, 
        total: 0,
        projects: [] as BriefData[]
      };
    }
    acc[key].count++;
    acc[key].projects.push(b);
    if (b.status === 'termine' || b.status === 'acompte_recu' || b.status === 'validation') {
      acc[key].total += (b.quotedPriceFCFA || 0);
    }
    return acc;
  }, {} as Record<string, { name: string; org: string; whatsapp: string; email: string; count: number; total: number; projects: BriefData[] }>))
  .sort((a, b) => b.total - a.total);

  const filteredClients = clients.filter(c => 
    (c.name && c.name.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (c.whatsapp && c.whatsapp.includes(searchTerm)) ||
    (c.org && c.org.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleOpenEditBranding = (whatsapp: string) => {
    const existing = clientBrandings[whatsapp] || {};
    setPrimaryColorInput(existing.primaryColor || '#816C07');
    setFontInput(existing.favoriteFonts?.join(', ') || 'Cinzel, Cairo');
    setBrandNotesInput(existing.brandGuidelinesNotes || '');
    setEditingBrandingPhone(whatsapp);
  };

  const handleSaveBranding = (whatsapp: string) => {
    const updated: ClientBrandingAsset = {
      primaryColor: primaryColorInput,
      favoriteFonts: fontInput.split(',').map(s => s.trim()).filter(Boolean),
      brandGuidelinesNotes: brandNotesInput,
    };

    const newDict = { ...clientBrandings, [whatsapp]: updated };
    setClientBrandings(newDict);
    localStorage.setItem('hadara_crm_client_brandings', JSON.stringify(newDict));
    setEditingBrandingPhone(null);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
            <Users className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-100 font-serif">Répertoire Clients 360° & Charte</h2>
            <p className="text-xs text-slate-400">Total : {clients.length} clients uniques • Chiffre d'Affaires totalisé</p>
          </div>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Nom, organisation ou WhatsApp..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-700/80 text-slate-100 text-xs focus:outline-none focus:border-amber-400 w-full transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((c, i) => {
          const branding = clientBrandings[c.whatsapp] || {};

          return (
            <motion.div 
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              key={c.whatsapp} 
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl hover:border-slate-700 transition-all group relative flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-2xl flex items-center justify-center border border-slate-700 shadow-inner font-bold text-slate-100 text-lg"
                      style={{ backgroundColor: branding.primaryColor ? `${branding.primaryColor}25` : '#1e293b' }}
                    >
                      <span style={{ color: branding.primaryColor || '#fbbf24' }}>
                        {c.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-slate-100 text-base leading-tight">{c.name}</h4>
                      <p className="text-xs text-amber-400 font-semibold mt-0.5">{c.org || 'Client Particulier'}</p>
                    </div>
                  </div>
                </div>

                {/* Financials & Project Stats */}
                <div className="space-y-2 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs mb-4">
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Projets Commandés :</span>
                    <span className="font-bold text-slate-100 bg-slate-800 px-2.5 py-0.5 rounded-full font-mono">{c.count}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Valeur Client (CA) :</span>
                    <span className="font-mono font-bold text-emerald-400">{c.total.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                </div>

                {/* Client Branding Assets (Logos/Colors/Fonts) */}
                <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800/80 space-y-2 text-xs mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-amber-400" /> Identity & Branding
                    </span>
                    <button
                      onClick={() => handleOpenEditBranding(c.whatsapp)}
                      className="text-[10px] font-bold text-amber-400 hover:underline"
                    >
                      Éditer
                    </button>
                  </div>

                  {editingBrandingPhone === c.whatsapp ? (
                    <div className="space-y-2 pt-2 border-t border-slate-800">
                      <div>
                        <label className="text-[10px] text-slate-400">Couleur Principale (Hex)</label>
                        <input
                          type="text"
                          value={primaryColorInput}
                          onChange={(e) => setPrimaryColorInput(e.target.value)}
                          className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-700 text-xs text-slate-100"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400">Polices Favorites</label>
                        <input
                          type="text"
                          value={fontInput}
                          onChange={(e) => setFontInput(e.target.value)}
                          className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-700 text-xs text-slate-100"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400">Notes / Charte</label>
                        <input
                          type="text"
                          value={brandNotesInput}
                          onChange={(e) => setBrandNotesInput(e.target.value)}
                          className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-700 text-xs text-slate-100"
                        />
                      </div>
                      <button
                        onClick={() => handleSaveBranding(c.whatsapp)}
                        className="w-full py-1 rounded bg-amber-400 text-slate-950 font-bold text-xs"
                      >
                        Sauvegarder
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1.5 text-[11px] text-slate-300">
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-500">Couleur :</span>
                        <span className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: branding.primaryColor || '#816C07' }} />
                        <span className="font-mono text-slate-400">{branding.primaryColor || 'Non configurée'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Polices : </span>
                        <span className="font-serif text-slate-300">{branding.favoriteFonts?.join(', ') || 'Cinzel, Cairo (Default)'}</span>
                      </div>
                      {branding.brandGuidelinesNotes && (
                        <p className="text-[10px] text-slate-400 italic mt-1">"{branding.brandGuidelinesNotes}"</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Projects History List */}
                <div className="space-y-1.5 mb-4">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Derniers Projets :</span>
                  <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
                    {c.projects.map(p => (
                      <div key={p.id} className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] flex justify-between items-center">
                        <span className="font-bold text-slate-200 truncate max-w-[170px]">{p.mainTitle}</span>
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-slate-800 text-amber-400">{p.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center gap-2 pt-4 border-t border-slate-800">
                <a 
                  href={`https://wa.me/${c.whatsapp.replace(/\D/g, '')}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex-1 flex justify-center items-center gap-2 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 font-bold transition-colors text-xs border border-emerald-500/20"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp Direct</span>
                </a>
              </div>
            </motion.div>
          );
        })}

        {filteredClients.length === 0 && (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-800 rounded-3xl">
            <p className="text-slate-500 text-xs">Aucun client ne correspond à votre recherche.</p>
          </div>
        )}
      </div>
    </div>
  );
};
