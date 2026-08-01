import React, { useState } from 'react';
import { BriefData, InvoiceData } from '../../types';
import { 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Printer, 
  Copy, 
  Check, 
  Search, 
  Filter, 
  Download, 
  FileText, 
  Calendar 
} from 'lucide-react';

interface FinanceTabProps {
  briefs: BriefData[];
}

export const FinanceTab: React.FC<FinanceTabProps> = ({ briefs }) => {
  const safeBriefs = Array.isArray(briefs) ? briefs : [];
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Extract all invoices or generate virtual ones based on briefs
  const invoices: InvoiceData[] = safeBriefs.flatMap((b) => {
    if (b.invoices && b.invoices.length > 0) return b.invoices;
    
    const price = b.quotedPriceFCFA || (b.budgetRange === '30k-50k' ? 40000 : b.budgetRange === '50k-80k' ? 65000 : 100000);
    const isPaid = b.status === 'termine';
    const isPartial = b.status === 'acompte_recu' || b.status === 'en_creation' || b.status === 'validation';

    return [
      {
        id: `FAC-${b.id}`,
        briefId: b.id,
        clientName: b.clientName,
        type: isPaid ? 'recu' : isPartial ? 'facture_acompte' : 'devis',
        amountFCFA: price,
        paidAmountFCFA: isPaid ? price : isPartial ? price / 2 : 0,
        status: isPaid ? 'paye' : isPartial ? 'paye_partiel' : b.status === 'devis_envoye' ? 'envoye' : 'brouillon',
        paymentMethod: 'wave',
        dueDate: b.desiredDeliveryDate || 'Échéance standard',
        createdAt: new Date(b.createdAt).toLocaleDateString('fr-FR')
      }
    ];
  });

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch = inv.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || inv.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || inv.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const totalDeviseFCFA = invoices.reduce((acc, i) => acc + i.amountFCFA, 0);
  const totalEncaisseFCFA = invoices.reduce((acc, i) => acc + i.paidAmountFCFA, 0);
  const totalResteFCFA = totalDeviseFCFA - totalEncaisseFCFA;
  const totalRetardFCFA = invoices.filter(i => i.status === 'en_retard').reduce((acc, i) => acc + (i.amountFCFA - i.paidAmountFCFA), 0);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Top Header & Financial KPIs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-slate-100 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-amber-400" />
            <span>Tableau Financier & Facturation</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">Gestion des devis, acomptes 50%, solde et récapitulatif des encaissements Wave & OM</p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: CA Devisé Total */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-slate-400 text-xs">
            <span>CA Total Devisé</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black font-mono text-slate-100">{totalDeviseFCFA.toLocaleString('fr-FR')} F</p>
          <p className="text-[10px] text-slate-500">Somme globale de toutes les affaires</p>
        </div>

        {/* Card 2: Montant Encaissé */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-emerald-500/30 space-y-2">
          <div className="flex justify-between items-center text-emerald-400 text-xs font-bold">
            <span>Encaissé (Acomptes + Soldes)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black font-mono text-emerald-400">{totalEncaisseFCFA.toLocaleString('fr-FR')} F</p>
          <p className="text-[10px] text-slate-400">Paiements Wave & Orange Money perçus</p>
        </div>

        {/* Card 3: Reste à Recouvrer */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-slate-400 text-xs">
            <span>Solde à Recouvrer</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black font-mono text-amber-400">{totalResteFCFA.toLocaleString('fr-FR')} F</p>
          <p className="text-[10px] text-slate-500">Montant en attente de livraison finale</p>
        </div>

        {/* Card 4: Retards de Paiement */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-rose-500/30 space-y-2">
          <div className="flex justify-between items-center text-rose-400 text-xs font-bold">
            <span>Retards / Impayés</span>
            <AlertCircle className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-black font-mono text-rose-400">{totalRetardFCFA.toLocaleString('fr-FR')} F</p>
          <p className="text-[10px] text-slate-500">Relances requises</p>
        </div>
      </div>

      {/* Senegal Payment Gateways Summary Box */}
      <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-amber-400/10 border border-amber-400/20">
            <TrendingUp className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-100">Modes d'Encaissement Configurés</h4>
            <p className="text-xs text-slate-400">Wave (+221 77 623 27 41) • Orange Money (+221 76 375 63 63) • Free Money • Virement</p>
          </div>
        </div>
        <button
          onClick={() => alert("Informations de paiements Wave & OM prêtes pour l'envoi aux clients.")}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all shrink-0"
        >
          Coordonnées de Règlement
        </button>
      </div>

      {/* Invoices List Section */}
      <div className="space-y-4">
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Rechercher une facture ou client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto">
            {['all', 'paye', 'paye_partiel', 'envoye', 'brouillon'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-all ${
                  filterStatus === st ? 'bg-amber-400 text-slate-950 shadow-md' : 'bg-slate-950 text-slate-400 hover:text-slate-200'
                }`}
              >
                {st === 'all' ? 'Toutes' : st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase font-mono">
                <tr>
                  <th className="p-4">Réf Facture</th>
                  <th className="p-4">Client</th>
                  <th className="p-4">Type Document</th>
                  <th className="p-4">Montant Total</th>
                  <th className="p-4">Encaissé</th>
                  <th className="p-4">Statut</th>
                  <th className="p-4">Échéance</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-200">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-950/50 transition-colors">
                    <td className="p-4 font-mono font-bold text-amber-400">{inv.id}</td>
                    <td className="p-4 font-bold text-slate-100">{inv.clientName}</td>
                    <td className="p-4 uppercase text-[10px] font-bold text-slate-400">{inv.type.replace('_', ' ')}</td>
                    <td className="p-4 font-mono font-bold text-slate-100">{inv.amountFCFA.toLocaleString('fr-FR')} F</td>
                    <td className="p-4 font-mono font-bold text-emerald-400">{inv.paidAmountFCFA.toLocaleString('fr-FR')} F</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        inv.status === 'paye' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        inv.status === 'paye_partiel' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {inv.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400">{inv.dueDate}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => alert(`Impression PDF Facture ${inv.id}`)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                        title="Imprimer Facture PDF"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
