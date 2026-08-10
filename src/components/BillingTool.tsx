import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, X, ChevronDown, Trash2, RefreshCw,
  TrendingUp, AlertCircle, CheckCircle2, Clock,
  Wallet, CreditCard, Banknote, FileText, Send,
  BarChart3, CircleDollarSign, ArrowRight, Receipt
} from 'lucide-react';
import type {
  BillingDocument, BillingClient, BillingLine,
  BillingPayment, BillingStats, DocType, PaymentMethod
} from '../types';

const API = import.meta.env.VITE_API_BASE_URL || 'https://hadara-backend.onrender.com/api';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number) =>
  new Intl.NumberFormat('fr-FR').format(n) + ' F';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  brouillon:           { label: 'Brouillon',            color: '#94a3b8', bg: 'rgba(148,163,184,.12)', icon: <FileText className="w-3.5 h-3.5" /> },
  en_attente:          { label: 'Non payé',             color: '#f59e0b', bg: 'rgba(245,158,11,.12)',  icon: <Clock className="w-3.5 h-3.5" /> },
  partiellement_paye:  { label: 'Partiellement payé',   color: '#f97316', bg: 'rgba(249,115,22,.12)',  icon: <CircleDollarSign className="w-3.5 h-3.5" /> },
  paye:                { label: 'Payé',                 color: '#10b981', bg: 'rgba(16,185,129,.12)',  icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  en_retard:           { label: 'En retard',            color: '#ef4444', bg: 'rgba(239,68,68,.12)',   icon: <AlertCircle className="w-3.5 h-3.5" /> },
  annule:              { label: 'Annulé',               color: '#64748b', bg: 'rgba(100,116,139,.12)', icon: <X className="w-3.5 h-3.5" /> },
};

const METHODS: { value: PaymentMethod; label: string; icon: React.ReactNode }[] = [
  { value: 'wave',         label: '🟣 Wave',           icon: <Wallet className="w-4 h-4" /> },
  { value: 'orange_money', label: '🟠 Orange Money',   icon: <Wallet className="w-4 h-4" /> },
  { value: 'especes',      label: '💵 Espèces',        icon: <Banknote className="w-4 h-4" /> },
  { value: 'virement',     label: '🏦 Virement',       icon: <CreditCard className="w-4 h-4" /> },
  { value: 'cheque',       label: '📋 Chèque',         icon: <FileText className="w-4 h-4" /> },
  { value: 'autre',        label: '💳 Autre',          icon: <CreditCard className="w-4 h-4" /> },
];

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.brouillon;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ color: cfg.color, background: cfg.bg }}
    >
      {cfg.icon} {cfg.label}
    </span>
  );
}

// ─── Stats Mini Dashboard ─────────────────────────────────────────────────────
function MiniDashboard({ stats }: { stats: BillingStats | null }) {
  if (!stats) return null;
  const pct = stats.ca_facture > 0 ? Math.round(stats.ca_encaisse / stats.ca_facture * 100) : 0;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {[
        { label: 'CA Facturé', value: fmt(stats.ca_facture), sub: '(total émis)', color: '#f59e0b', icon: <Receipt className="w-5 h-5" /> },
        { label: 'CA Encaissé', value: fmt(stats.ca_encaisse), sub: `${pct}% recouvré`, color: '#10b981', icon: <TrendingUp className="w-5 h-5" /> },
        { label: 'Reste à encaisser', value: fmt(stats.ca_restant), sub: `${stats.en_retard} en retard`, color: '#ef4444', icon: <AlertCircle className="w-5 h-5" /> },
      ].map(({ label, value, sub, color, icon }) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-4"
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}18`, color }}>
            {icon}
          </div>
          <div>
            <p className="text-xs text-slate-500">{label}</p>
            <p className="text-lg font-bold text-slate-100" style={{ color }}>{value}</p>
            <p className="text-xs text-slate-500">{sub}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Modal Nouveau Document ───────────────────────────────────────────────────
interface NewDocModalProps {
  clients: BillingClient[];
  onClose: () => void;
  onSaved: () => void;
}
function NewDocModal({ clients, onClose, onSaved }: NewDocModalProps) {
  const today = new Date().toISOString().split('T')[0];
  const [docType, setDocType] = useState<DocType>('proforma');
  const [clientId, setClientId] = useState('');
  const [billingName, setBillingName] = useState('');
  const [billingOrg, setBillingOrg] = useState('');
  const [billingPhone, setBillingPhone] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [discount, setDiscount] = useState(0);
  const [lines, setLines] = useState<{ designation: string; quantity: number; unit_price: number }[]>([
    { designation: '', quantity: 1, unit_price: 0 },
  ]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const subtotal = lines.reduce((acc, l) => acc + l.quantity * l.unit_price, 0);
  const total = Math.max(0, subtotal - discount);

  const onClientChange = (id: string) => {
    setClientId(id);
    const c = clients.find(c => c.id === id);
    if (c) { setBillingName(c.name); setBillingOrg(c.organization || ''); setBillingPhone(c.whatsapp || ''); }
  };

  const updateLine = (i: number, field: string, val: string | number) =>
    setLines(ls => ls.map((l, idx) => idx === i ? { ...l, [field]: field === 'designation' ? val : Number(val) } : l));

  const addLine = () => setLines(ls => [...ls, { designation: '', quantity: 1, unit_price: 0 }]);
  const removeLine = (i: number) => setLines(ls => ls.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    if (!billingName) { setError('Le nom du client est requis.'); return; }
    if (lines.every(l => !l.designation)) { setError('Ajoutez au moins une ligne de prestation.'); return; }
    setSaving(true); setError('');
    try {
      const res = await fetch(`${API}/billing/documents/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doc_type: docType,
          client: clientId || null,
          billing_client_name: billingName,
          billing_organization: billingOrg,
          billing_whatsapp: billingPhone,
          subtotal,
          discount,
          due_date: dueDate || null,
          notes,
        }),
      });
      if (!res.ok) throw new Error('Erreur lors de la création');
      const doc = await res.json();

      // Créer les lignes
      for (const line of lines.filter(l => l.designation)) {
        await fetch(`${API}/billing/lines/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ document: doc.id, ...line }),
        });
      }
      onSaved();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur réseau');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-100">Nouveau Document</h2>
            <p className="text-sm text-slate-400 mt-0.5">Proforma • Facture • Avoir</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* Type + Client */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Type de document</label>
              <div className="flex gap-2">
                {(['proforma', 'facture', 'avoir'] as DocType[]).map(t => (
                  <button key={t} onClick={() => setDocType(t)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold capitalize transition-all border ${docType === t ? 'bg-amber-500/20 border-amber-500/50 text-amber-400' : 'border-slate-700 text-slate-500 hover:border-slate-600'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Client (optionnel)</label>
              <div className="relative">
                <select value={clientId} onChange={e => onClientChange(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 appearance-none pr-8">
                  <option value="">— Saisir manuellement —</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}{c.organization ? ` (${c.organization})` : ''}</option>)}
                </select>
                <ChevronDown className="absolute right-2.5 top-3 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Infos client snapshot */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">📸 Informations sur la facture</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input value={billingName} onChange={e => setBillingName(e.target.value)} placeholder="Nom client *" className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500" />
              <input value={billingOrg} onChange={e => setBillingOrg(e.target.value)} placeholder="Organisation / Marque" className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500" />
              <input value={billingPhone} onChange={e => setBillingPhone(e.target.value)} placeholder="WhatsApp" className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500" />
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-100" title="Date d'échéance" />
            </div>
          </div>

          {/* Lignes */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">📋 Lignes de prestation</p>
            <div className="space-y-2">
              {lines.map((l, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center">
                  <input value={l.designation} onChange={e => updateLine(i, 'designation', e.target.value)}
                    placeholder="Désignation…" className="col-span-6 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500" />
                  <input type="number" value={l.quantity} min={1} onChange={e => updateLine(i, 'quantity', e.target.value)}
                    className="col-span-2 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 text-center" title="Quantité" />
                  <input type="number" value={l.unit_price} min={0} onChange={e => updateLine(i, 'unit_price', e.target.value)}
                    className="col-span-3 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 text-right" placeholder="PU" />
                  <button onClick={() => removeLine(i)} disabled={lines.length === 1}
                    className="col-span-1 flex items-center justify-center text-slate-600 hover:text-red-400 disabled:opacity-30 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <button onClick={addLine} className="flex items-center gap-2 text-sm text-amber-400 hover:text-amber-300 transition-colors">
              <Plus className="w-4 h-4" /> Ajouter une ligne
            </button>
          </div>

          {/* Calcul */}
          <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4 space-y-2">
            <div className="flex justify-between text-sm text-slate-400"><span>Sous-total</span><span className="text-slate-300">{fmt(subtotal)}</span></div>
            <div className="flex justify-between items-center text-sm text-slate-400">
              <span>Remise</span>
              <div className="flex items-center gap-2">
                <input type="number" value={discount} min={0} onChange={e => setDiscount(Number(e.target.value))}
                  className="w-28 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-right text-sm text-slate-100" />
                <span className="text-slate-500">FCFA</span>
              </div>
            </div>
            <div className="flex justify-between text-base font-bold pt-2 border-t border-slate-800">
              <span className="text-slate-100">TOTAL NET</span>
              <span className="text-amber-400 text-xl">{fmt(total)}</span>
            </div>
          </div>

          {/* Notes */}
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
            placeholder="Notes / conditions de paiement…"
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 resize-none" />

          {error && <p className="text-red-400 text-sm bg-red-500/10 rounded-xl p-3">{error}</p>}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800 flex gap-3 shrink-0">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-400 hover:text-slate-200 text-sm font-medium transition-colors">Annuler</button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-sm transition-all flex items-center justify-center gap-2 active:scale-95">
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Receipt className="w-4 h-4" />}
            {saving ? 'Création…' : `Créer la ${docType}`}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Modal Ajouter Paiement ───────────────────────────────────────────────────
interface AddPaymentModalProps {
  doc: BillingDocument;
  onClose: () => void;
  onSaved: () => void;
}
function AddPaymentModal({ doc, onClose, onSaved }: AddPaymentModalProps) {
  const today = new Date().toISOString().split('T')[0];
  const [amount, setAmount] = useState(doc.balance_due);
  const [method, setMethod] = useState<PaymentMethod>('wave');
  const [ref, setRef] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(today);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (amount <= 0) { setError('Montant invalide.'); return; }
    setSaving(true); setError('');
    try {
      const res = await fetch(`${API}/billing/payments/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ billing_document: doc.id, amount, method, reference_code: ref, payment_date: date, note }),
      });
      if (!res.ok) throw new Error('Erreur serveur');
      onSaved();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur réseau');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-100">Enregistrer un paiement</h2>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"><X className="w-5 h-5" /></button>
        </div>

        {/* Solde restant */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 mb-5 flex justify-between items-center">
          <div>
            <p className="text-xs text-slate-500">Solde restant</p>
            <p className="text-2xl font-bold text-amber-400">{fmt(doc.balance_due)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">Déjà encaissé</p>
            <p className="text-base font-semibold text-emerald-400">{fmt(doc.paid_amount)}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Montant (FCFA) *</label>
            <input type="number" value={amount} min={1} max={doc.balance_due} onChange={e => setAmount(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-lg font-bold text-slate-100" />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Méthode *</label>
            <div className="grid grid-cols-3 gap-2">
              {METHODS.map(m => (
                <button key={m.value} onClick={() => setMethod(m.value)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all border ${method === m.value ? 'bg-amber-500/20 border-amber-500/50 text-amber-400' : 'border-slate-700 text-slate-500 hover:border-slate-600'}`}>
                  {m.label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-100" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Référence</label>
              <input value={ref} onChange={e => setRef(e.target.value)} placeholder="WAVE-XXXXX"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500" />
            </div>
          </div>
          <input value={note} onChange={e => setNote(e.target.value)} placeholder="Note (ex: Acompte, Solde…)"
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500" />
          {error && <p className="text-red-400 text-sm bg-red-500/10 rounded-xl p-3">{error}</p>}
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-400 text-sm font-medium transition-colors hover:text-slate-200">Annuler</button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 active:scale-95">
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Fiche Document ───────────────────────────────────────────────────────────
function DocCard({ doc, onClick }: { doc: BillingDocument; onClick: () => void }) {
  const docTypeColors: Record<string, string> = { proforma: '#f59e0b', facture: '#3b82f6', avoir: '#8b5cf6' };
  const color = docTypeColors[doc.doc_type] || '#94a3b8';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className="group p-4 bg-slate-900/80 border border-slate-800 hover:border-amber-500/30 rounded-2xl cursor-pointer transition-all hover:bg-slate-900"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border" style={{ color, borderColor: `${color}50`, background: `${color}12` }}>
              {doc.doc_type_display}
            </span>
            <span className="text-xs text-slate-500">{doc.document_number}</span>
          </div>
          <p className="font-semibold text-slate-100">{doc.billing_client_name}</p>
          {doc.billing_organization && <p className="text-xs text-slate-500">{doc.billing_organization}</p>}
        </div>
        <StatusBadge status={doc.payment_status} />
      </div>

      {/* Barre de progression paiement */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>Encaissé : <span className="text-emerald-400 font-semibold">{fmt(doc.paid_amount)}</span></span>
          <span>Total : <span className="text-amber-400 font-semibold">{fmt(doc.total)}</span></span>
        </div>
        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${doc.total > 0 ? Math.min(100, (doc.paid_amount / doc.total) * 100) : 0}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ background: doc.payment_status === 'paye' ? '#10b981' : '#f59e0b' }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{new Date(doc.issue_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
        <span className="flex items-center gap-1 text-amber-400 group-hover:translate-x-1 transition-transform font-medium">
          Ouvrir <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </motion.div>
  );
}

// ─── Modal Détail Document ─────────────────────────────────────────────────────
interface DocDetailModalProps {
  doc: BillingDocument;
  onClose: () => void;
  onRefresh: () => void;
}
function DocDetailModal({ doc, onClose, onRefresh }: DocDetailModalProps) {
  const [addingPayment, setAddingPayment] = useState(false);

  const whatsappMsg = encodeURIComponent(
    `Bonjour,\nVeuillez trouver ci-joint votre ${doc.doc_type_display} ${doc.document_number} d'un montant de ${fmt(doc.total)}.\nMerci pour votre confiance.\n— Hadara Studio`
  );
  const waUrl = doc.billing_whatsapp
    ? `https://wa.me/${doc.billing_whatsapp.replace(/\D/g, '')}?text=${whatsappMsg}`
    : null;

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
          className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">

          {/* Header */}
          <div className="flex items-start justify-between p-6 border-b border-slate-800 shrink-0">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-xl font-bold text-slate-100">{doc.document_number}</h2>
                <StatusBadge status={doc.payment_status} />
              </div>
              <p className="text-slate-300 font-semibold">{doc.billing_client_name}</p>
              {doc.billing_organization && <p className="text-sm text-slate-500">{doc.billing_organization}</p>}
            </div>
            <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"><X className="w-5 h-5" /></button>
          </div>

          <div className="overflow-y-auto flex-1 p-6 space-y-5">
            {/* Résumé financier */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Total', value: fmt(doc.total), color: '#f59e0b' },
                { label: 'Encaissé', value: fmt(doc.paid_amount), color: '#10b981' },
                { label: 'Reste', value: fmt(doc.balance_due), color: doc.balance_due > 0 ? '#ef4444' : '#10b981' },
              ].map(({ label, value, color }) => (
                <div key={label} className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                  <p className="text-xs text-slate-500 mb-1">{label}</p>
                  <p className="font-bold" style={{ color }}>{value}</p>
                </div>
              ))}
            </div>

            {/* Lignes de facturation */}
            {doc.lines.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Lignes de prestation</p>
                <div className="rounded-2xl overflow-hidden border border-slate-800">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-950">
                      <tr>
                        <th className="text-left px-4 py-2.5 text-xs text-slate-500 font-medium">Désignation</th>
                        <th className="text-center px-3 py-2.5 text-xs text-slate-500 font-medium">Qté</th>
                        <th className="text-right px-4 py-2.5 text-xs text-slate-500 font-medium">PU</th>
                        <th className="text-right px-4 py-2.5 text-xs text-slate-500 font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {doc.lines.map((l, i) => (
                        <tr key={i}>
                          <td className="px-4 py-2.5 text-slate-200">{l.designation}</td>
                          <td className="px-3 py-2.5 text-center text-slate-400">{l.quantity}</td>
                          <td className="px-4 py-2.5 text-right text-slate-400">{fmt(l.unit_price)}</td>
                          <td className="px-4 py-2.5 text-right font-semibold text-slate-200">{fmt(l.line_total)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-950 border-t border-slate-700">
                      {doc.discount > 0 && (
                        <tr>
                          <td colSpan={3} className="px-4 py-2 text-right text-xs text-slate-500">Remise</td>
                          <td className="px-4 py-2 text-right text-xs text-red-400">− {fmt(doc.discount)}</td>
                        </tr>
                      )}
                      <tr>
                        <td colSpan={3} className="px-4 py-2.5 text-right text-sm font-bold text-slate-300">NET À PAYER</td>
                        <td className="px-4 py-2.5 text-right font-bold text-amber-400">{fmt(doc.total)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            {/* Paiements */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">💳 Paiements</p>
                {doc.balance_due > 0 && (
                  <button onClick={() => setAddingPayment(true)}
                    className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-400/10 hover:bg-emerald-400/20 px-3 py-1.5 rounded-xl transition-all">
                    <Plus className="w-3.5 h-3.5" /> Enregistrer un paiement
                  </button>
                )}
              </div>
              {doc.payments.length === 0 ? (
                <p className="text-sm text-slate-600 italic py-3">Aucun paiement enregistré</p>
              ) : (
                <div className="space-y-2">
                  {doc.payments.map(p => (
                    <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <div className="flex items-center gap-3">
                        <Wallet className="w-4 h-4 text-emerald-400 shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-slate-200">{fmt(p.amount)}</p>
                          <p className="text-xs text-slate-500">{p.method_display} {p.note && `· ${p.note}`}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-400">{new Date(p.payment_date).toLocaleDateString('fr-FR')}</p>
                        {p.reference_code && <p className="text-xs text-slate-600">{p.reference_code}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {doc.notes && (
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <p className="text-xs text-slate-500 mb-1">Notes</p>
                <p className="text-sm text-slate-300">{doc.notes}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="p-6 border-t border-slate-800 flex flex-wrap gap-2 shrink-0">
            {waUrl && (
              <a href={waUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600/15 border border-emerald-600/30 text-emerald-400 hover:bg-emerald-600/25 text-sm font-medium transition-all">
                <Send className="w-4 h-4" /> WhatsApp
              </a>
            )}
            <button onClick={onClose}
              className="ml-auto px-5 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-slate-200 text-sm font-medium transition-colors">
              Fermer
            </button>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {addingPayment && (
          <AddPaymentModal doc={doc} onClose={() => setAddingPayment(false)} onSaved={() => { setAddingPayment(false); onRefresh(); }} />
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Composant Principal ──────────────────────────────────────────────────────
export const BillingTool: React.FC = () => {
  const [docs, setDocs] = useState<BillingDocument[]>([]);
  const [clients, setClients] = useState<BillingClient[]>([]);
  const [stats, setStats] = useState<BillingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<BillingDocument | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [docsRes, clientsRes, statsRes] = await Promise.all([
        fetch(`${API}/billing/documents/`),
        fetch(`${API}/billing/clients/`),
        fetch(`${API}/billing/documents/stats/`),
      ]);
      if (docsRes.ok) setDocs(await docsRes.json());
      if (clientsRes.ok) setClients(await clientsRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
    } catch { /* réseau */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filtered = docs.filter(d => {
    const q = search.toLowerCase();
    const matchSearch = !q || d.billing_client_name.toLowerCase().includes(q) || d.document_number.toLowerCase().includes(q);
    const matchStatus = !filterStatus || d.payment_status === filterStatus;
    const matchType = !filterType || d.doc_type === filterType;
    return matchSearch && matchStatus && matchType;
  });

  const handleDocRefresh = async () => {
    await fetchAll();
    if (selectedDoc) {
      const res = await fetch(`${API}/billing/documents/${selectedDoc.id}/`);
      if (res.ok) setSelectedDoc(await res.json());
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-24 px-3 sm:px-4 space-y-6 pt-6">
      {/* Titre */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-bold text-slate-100">Facturation & Revenus</h1>
            <p className="text-sm text-slate-500">Proformas · Factures · Paiements · Cockpit financier</p>
          </div>
        </div>
      </motion.div>

      {/* Dashboard Mini */}
      <MiniDashboard stats={stats} />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un client ou numéro…"
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-amber-500/50 outline-none" />
        </div>
        <div className="flex gap-2">
          <select value={filterType} onChange={e => setFilterType(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-300 appearance-none">
            <option value="">Tous types</option>
            <option value="proforma">Proforma</option>
            <option value="facture">Facture</option>
            <option value="avoir">Avoir</option>
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-300 appearance-none">
            <option value="">Tous statuts</option>
            <option value="en_attente">Non payé</option>
            <option value="partiellement_paye">Partiellement payé</option>
            <option value="paye">Payé</option>
            <option value="en_retard">En retard</option>
          </select>
          <button onClick={() => setShowNew(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-xl transition-all active:scale-95 shrink-0">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nouveau</span>
          </button>
        </div>
      </div>

      {/* Liste */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500">
          <RefreshCw className="w-8 h-8 animate-spin text-amber-500" />
          <p>Chargement des documents…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Receipt className="w-12 h-12 text-slate-700 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Aucun document trouvé</p>
          <button onClick={() => setShowNew(true)}
            className="mt-4 px-5 py-2.5 bg-amber-500/15 border border-amber-500/30 text-amber-400 rounded-xl text-sm font-medium hover:bg-amber-500/25 transition-all">
            Créer votre première facture
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(doc => (
            <DocCard key={doc.id} doc={doc} onClick={() => setSelectedDoc(doc)} />
          ))}
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showNew && (
          <NewDocModal clients={clients} onClose={() => setShowNew(false)} onSaved={() => { setShowNew(false); fetchAll(); }} />
        )}
        {selectedDoc && (
          <DocDetailModal doc={selectedDoc} onClose={() => setSelectedDoc(null)} onRefresh={handleDocRefresh} />
        )}
      </AnimatePresence>
    </div>
  );
};
