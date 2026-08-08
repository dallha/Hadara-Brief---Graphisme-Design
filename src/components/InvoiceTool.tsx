import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Printer, Plus, Trash2, Sparkles, Building2 } from 'lucide-react';
import { ToolsNav } from './ToolsNav';

interface InvoiceItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export const InvoiceTool: React.FC<{ onGoToBrief: () => void }> = ({ onGoToBrief }) => {
  const [invoiceNumber, setInvoiceNumber] = useState('FAC-2026-001');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [myCompany, setMyCompany] = useState('');
  const [myAddress, setMyAddress] = useState('');
  const [myPhone, setMyPhone] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', name: 'Service de création', price: 15000, quantity: 1 }
  ]);
  const [currency, setCurrency] = useState('FCFA');
  const [taxRate, setTaxRate] = useState(0);

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const total = subtotal + taxAmount;

  const addItem = () =>
    setItems([...items, { id: Date.now().toString(), name: '', price: 0, quantity: 1 }]);

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) =>
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));

  const removeItem = (id: string) => {
    if (items.length > 1) setItems(items.filter(item => item.id !== id));
  };

  /**
   * Opens a NEW blank window containing only the invoice HTML, then prints it.
   * This is the only 100% reliable way to print a single element from a React SPA.
   */
  const handlePrint = () => {
    const itemsRows = items.map(item => `
      <tr>
        <td style="padding:10px 4px;border-bottom:1px solid #e2e8f0;">${item.name || '—'}</td>
        <td style="padding:10px 4px;border-bottom:1px solid #e2e8f0;text-align:center;">${item.quantity}</td>
        <td style="padding:10px 4px;border-bottom:1px solid #e2e8f0;text-align:right;">${(item.price || 0).toLocaleString('fr-FR')}</td>
        <td style="padding:10px 4px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:700;">${((item.price || 0) * (item.quantity || 1)).toLocaleString('fr-FR')} ${currency}</td>
      </tr>
    `).join('');

    const taxRow = taxRate > 0 ? `
      <tr>
        <td colspan="3" style="text-align:right;padding:6px 4px;color:#64748b;font-size:13px;">TVA (${taxRate}%)</td>
        <td style="text-align:right;padding:6px 4px;color:#64748b;font-size:13px;">${taxAmount.toLocaleString('fr-FR')} ${currency}</td>
      </tr>` : '';

    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <title>Facture ${invoiceNumber}</title>
  <style>
    @page { size: A4; margin: 15mm 15mm 15mm 15mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: #1e293b; background: white; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #1e293b; padding-bottom: 24px; margin-bottom: 24px; gap: 24px; }
    .emitter { flex: 1; }
    .emitter h2 { font-size: 22px; font-weight: 900; color: #0f172a; margin-bottom: 4px; }
    .emitter p { color: #475569; font-size: 12px; line-height: 1.5; }
    .invoice-meta { text-align: right; flex-shrink: 0; }
    .invoice-meta h1 { font-size: 38px; font-weight: 900; color: #e2e8f0; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px; }
    .invoice-meta table { margin-left: auto; }
    .invoice-meta td { padding: 3px 6px; font-size: 13px; color: #475569; }
    .invoice-meta td:last-child { font-weight: 700; color: #0f172a; }
    .client-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px 20px; margin-bottom: 28px; }
    .client-box .label { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
    .client-box h3 { font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 2px; }
    .client-box p { color: #64748b; font-size: 12px; }
    table.items { width: 100%; border-collapse: collapse; margin-bottom: 0; }
    table.items thead tr { background: #1e293b; color: white; }
    table.items thead td { padding: 10px 8px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
    table.items thead td:nth-child(2) { text-align:center; }
    table.items thead td:nth-child(3), table.items thead td:nth-child(4) { text-align:right; }
    .totals { display: flex; justify-content: flex-end; margin-top: 24px; }
    .totals-box { width: 260px; border-top: 2px solid #1e293b; padding-top: 12px; }
    .totals-box .row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 13px; color: #64748b; }
    .totals-box .total { display: flex; justify-content: space-between; padding: 10px 0 0; font-size: 18px; font-weight: 900; color: #0f172a; border-top: 2px solid #0f172a; margin-top: 8px; }
    .totals-box .total .amount { color: #d97706; }
    .footer { margin-top: 48px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 16px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="emitter">
      <h2>${myCompany || 'Votre Entreprise'}</h2>
      ${myAddress ? `<p>${myAddress.replace(/\n/g, '<br/>')}</p>` : ''}
      ${myPhone ? `<p>${myPhone}</p>` : ''}
    </div>
    <div class="invoice-meta">
      <h1>Facture</h1>
      <table>
        <tr><td>N° :</td><td>${invoiceNumber}</td></tr>
        <tr><td>Date :</td><td>${new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</td></tr>
      </table>
    </div>
  </div>

  <div class="client-box">
    <div class="label">Facturé à :</div>
    <h3>${clientName || 'Nom du client'}</h3>
    ${clientAddress ? `<p>${clientAddress.replace(/\n/g, '<br/>')}</p>` : ''}
  </div>

  <table class="items">
    <thead>
      <tr>
        <td>Désignation</td>
        <td>Qté</td>
        <td>Prix Unitaire</td>
        <td>Total</td>
      </tr>
    </thead>
    <tbody>
      ${itemsRows}
    </tbody>
  </table>

  <div class="totals">
    <div class="totals-box">
      <div class="row"><span>Sous-total</span><span>${subtotal.toLocaleString('fr-FR')} ${currency}</span></div>
      ${taxRate > 0 ? `<div class="row"><span>TVA (${taxRate}%)</span><span>${taxAmount.toLocaleString('fr-FR')} ${currency}</span></div>` : ''}
      <div class="total"><span>TOTAL TTC</span><span class="amount">${total.toLocaleString('fr-FR')} ${currency}</span></div>
    </div>
  </div>

  <div class="footer"><p>Merci pour votre confiance.</p></div>

  <script>
    window.onload = function() { window.print(); window.close(); }
  </script>
</body>
</html>`;

    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-24 px-3 sm:px-4">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4 pt-6 sm:pt-16"
      >
        <ToolsNav />
        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
          <Sparkles className="w-4 h-4" />
          <span>Outils Gratuits Hadara Studio</span>
        </div>
        <h1 className="text-2xl sm:text-5xl font-serif font-extrabold text-slate-100">
          Générateur de <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Factures</span>
        </h1>
        <p className="text-slate-400 text-sm max-w-2xl mx-auto">
          Créez des factures professionnelles en quelques clics et exportez en PDF.
        </p>
      </motion.div>

      {/* Control Panel */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
        <div className="flex gap-3 items-center">
          <div className="space-y-1 flex-1">
            <label className="text-xs text-slate-400 uppercase font-bold">Devise</label>
            <input
              type="text"
              value={currency}
              onChange={e => setCurrency(e.target.value)}
              className="w-full sm:w-24 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-400"
            />
          </div>
          <div className="space-y-1 flex-1">
            <label className="text-xs text-slate-400 uppercase font-bold">TVA (%)</label>
            <input
              type="number"
              value={taxRate}
              onChange={e => setTaxRate(Number(e.target.value))}
              className="w-full sm:w-24 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-400"
              min="0" max="100"
            />
          </div>
        </div>
        <button
          onClick={handlePrint}
          className="w-full sm:w-auto px-6 py-3 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
        >
          <Printer className="w-5 h-5" />
          <span>Imprimer / PDF</span>
        </button>
      </div>

      {/* Invoice Preview Card */}
      <div className="bg-white text-slate-900 shadow-2xl rounded-xl overflow-hidden">
        <div className="p-5 sm:p-10 space-y-6">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 border-b-2 border-slate-200 pb-6">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2 text-amber-600 mb-2">
                <Building2 className="w-4 h-4" />
                <span className="font-bold text-xs">VOS INFORMATIONS</span>
              </div>
              <input
                type="text"
                placeholder="Votre Nom ou Entreprise"
                value={myCompany}
                onChange={e => setMyCompany(e.target.value)}
                className="w-full text-lg sm:text-2xl font-black bg-transparent border-b border-slate-200 focus:border-amber-400 focus:outline-none pb-1 placeholder:text-slate-300"
              />
              <textarea
                placeholder="Adresse (Optionnel)"
                value={myAddress}
                onChange={e => setMyAddress(e.target.value)}
                className="w-full text-sm text-slate-600 bg-transparent border-none focus:outline-none resize-none placeholder:text-slate-300"
                rows={2}
              />
              <input
                type="text"
                placeholder="Numéro de téléphone"
                value={myPhone}
                onChange={e => setMyPhone(e.target.value)}
                className="w-full text-sm text-slate-600 bg-transparent border-none focus:outline-none placeholder:text-slate-300"
              />
            </div>

            <div className="text-right flex-shrink-0">
              <h2 className="text-3xl sm:text-5xl font-black text-slate-800 uppercase tracking-widest mb-3">FACTURE</h2>
              <div className="flex items-center justify-end gap-2 text-sm font-medium text-slate-700 mb-1">
                <span>N° :</span>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={e => setInvoiceNumber(e.target.value)}
                  className="w-36 text-right bg-slate-100 rounded px-2 py-1 focus:outline-none text-slate-900 text-sm"
                />
              </div>
              <div className="flex items-center justify-end gap-2 text-sm font-medium text-slate-700">
                <span>Date :</span>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-40 text-right bg-slate-100 rounded px-2 py-1 focus:outline-none text-slate-900 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Client */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Facturé à :</p>
            <input
              type="text"
              placeholder="Nom du Client"
              value={clientName}
              onChange={e => setClientName(e.target.value)}
              className="w-full text-base sm:text-lg font-bold bg-transparent border-none focus:outline-none placeholder:text-slate-300 text-slate-900"
            />
            <textarea
              placeholder="Adresse du Client"
              value={clientAddress}
              onChange={e => setClientAddress(e.target.value)}
              className="w-full text-sm text-slate-600 bg-transparent border-none focus:outline-none resize-none placeholder:text-slate-300"
              rows={2}
            />
          </div>

          {/* Items table — scrollable on mobile */}
          <div className="overflow-x-auto -mx-5 sm:mx-0">
            <div className="min-w-[480px] px-5 sm:px-0">
              <div className="grid grid-cols-12 gap-2 text-xs font-bold text-white uppercase bg-slate-800 rounded-lg px-3 py-2 mb-2">
                <div className="col-span-5">Désignation</div>
                <div className="col-span-2 text-center">Qté</div>
                <div className="col-span-2 text-right">Prix Unit.</div>
                <div className="col-span-3 text-right">Total</div>
              </div>

              {items.map((item) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 items-center group border-b border-slate-100 py-2 relative">
                  <div className="col-span-5">
                    <input
                      type="text"
                      placeholder="Description..."
                      value={item.name}
                      onChange={e => updateItem(item.id, 'name', e.target.value)}
                      className="w-full font-medium text-slate-800 bg-transparent border-none focus:outline-none placeholder:text-slate-300 text-sm"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={e => updateItem(item.id, 'quantity', Number(e.target.value))}
                      className="w-full text-center font-mono text-slate-600 bg-transparent border-none focus:outline-none text-sm"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      min="0"
                      value={item.price || ''}
                      onChange={e => updateItem(item.id, 'price', Number(e.target.value))}
                      className="w-full text-right font-mono text-slate-600 bg-transparent border-none focus:outline-none text-sm"
                    />
                  </div>
                  <div className="col-span-3 text-right font-mono font-bold text-slate-800 text-sm">
                    {((item.price || 0) * (item.quantity || 1)).toLocaleString('fr-FR')} {currency}
                  </div>
                  {items.length > 1 && (
                    <button
                      onClick={() => removeItem(item.id)}
                      className="absolute -right-6 sm:-right-8 top-1/2 -translate-y-1/2 p-1.5 text-rose-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}

              <button
                onClick={addItem}
                className="flex items-center gap-2 text-sm font-bold text-amber-600 hover:text-amber-700 transition-colors py-3"
              >
                <Plus className="w-4 h-4" />
                Ajouter une ligne
              </button>
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-full sm:w-64 space-y-2">
              <div className="flex justify-between text-sm text-slate-500">
                <span>Sous-total</span>
                <span className="font-mono">{subtotal.toLocaleString('fr-FR')} {currency}</span>
              </div>
              {taxRate > 0 && (
                <div className="flex justify-between text-sm text-slate-500">
                  <span>TVA ({taxRate}%)</span>
                  <span className="font-mono">{taxAmount.toLocaleString('fr-FR')} {currency}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-black text-slate-900 border-t-2 border-slate-900 pt-3">
                <span>TOTAL TTC</span>
                <span className="font-mono text-amber-600">{total.toLocaleString('fr-FR')} {currency}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-400">
            <p>Merci pour votre confiance.</p>
          </div>
        </div>
      </div>

      {/* Cross-sell */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-3xl mx-auto text-center p-6 sm:p-12 rounded-[2rem] bg-gradient-to-br from-[#335A79] to-[#184260] border border-blue-400/20 shadow-2xl"
      >
        <h3 className="text-xl sm:text-2xl font-serif font-bold text-white mb-3">
          Votre facture manque de style ?
        </h3>
        <p className="text-blue-100/80 mb-6 text-sm leading-relaxed">
          Un design professionnel inspire confiance à vos clients. Confiez la création de votre logo au Studio Hadara.
        </p>
        <button
          onClick={onGoToBrief}
          className="w-full sm:w-auto px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-2xl flex items-center justify-center gap-3 transition-colors shadow-lg shadow-amber-500/20 mx-auto"
        >
          <Sparkles className="w-5 h-5" />
          <span>Créer mon Identité Visuelle</span>
        </button>
      </motion.div>
    </div>
  );
};
