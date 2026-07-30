import React from 'react';
import { Send, Search, Users, ExternalLink, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { BriefData } from '../../types';

interface CRMTabProps {
  briefs: BriefData[];
}

export const CRMTab: React.FC<CRMTabProps> = ({ briefs }) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const clients = Object.values(briefs.reduce((acc, b) => {
    const key = b.whatsapp || 'Inconnu';
    if (!acc[key]) acc[key] = { name: b.clientName || 'Inconnu', org: b.organization || '', whatsapp: b.whatsapp || '', email: b.email || '', count: 0, total: 0 };
    acc[key].count++;
    if (b.status === 'termine' || b.status === 'acompte_recu') {
      acc[key].total += (b.quotedPriceFCFA || 0);
    }
    return acc;
  }, {} as Record<string, {name:string, org:string, whatsapp:string, email:string, count:number, total:number}>))
  .sort((a, b) => b.total - a.total); // Sort by LTV

  const filteredClients = clients.filter(c => 
    (c.name && c.name.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (c.whatsapp && c.whatsapp.includes(searchTerm)) ||
    (c.org && c.org.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <Users className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-100">Répertoire Clients</h2>
            <p className="text-sm text-slate-400">Total : {clients.length} clients uniques</p>
          </div>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Nom, organisation ou numéro..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 pr-4 py-3 rounded-2xl bg-slate-900/50 border border-slate-700/50 text-slate-100 focus:outline-none focus:border-amber-400 w-full transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((c, i) => (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            key={c.whatsapp} 
            className="bg-slate-900/90 border border-slate-700/50 rounded-3xl p-6 shadow-xl hover:border-slate-500/50 transition-colors group relative overflow-hidden"
          >
            {/* Top accent */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center border border-slate-600 shadow-inner">
                  <span className="text-lg font-bold text-slate-200">
                    {c.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-100 text-lg leading-tight">{c.name}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{c.org || 'Particulier'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">Commandes totales</span>
                <span className="font-bold text-slate-200 bg-slate-800 px-3 py-1 rounded-full">{c.count}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">Valeur à vie (LTV)</span>
                <span className="font-bold text-emerald-400">{c.total.toLocaleString()} FCFA</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-slate-800/50">
              <a 
                href={`https://wa.me/${c.whatsapp.replace(/\D/g, '')}`} 
                target="_blank" 
                rel="noreferrer"
                className="flex-1 flex justify-center items-center gap-2 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 font-bold transition-colors text-sm"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </a>
              {c.email && (
                <a 
                  href={`mailto:${c.email}`}
                  className="p-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors"
                  title={c.email}
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </motion.div>
        ))}
        {filteredClients.length === 0 && (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-700/50 rounded-3xl">
            <p className="text-slate-500">Aucun client trouvé.</p>
          </div>
        )}
      </div>
    </div>
  );
};
