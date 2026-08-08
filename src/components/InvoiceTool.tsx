import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Printer, Plus, Trash2, FileText, Sparkles, Building2, Download } from 'lucide-react';
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
  
  // My Business Info
  const [myCompany, setMyCompany] = useState('');
  const [myAddress, setMyAddress] = useState('');
  const [myPhone, setMyPhone] = useState('');
  
  // Client Info
  const [clientName, setClientName] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  
  // Items
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', name: 'Service de création', price: 15000, quantity: 1 }
  ]);
  
  // Settings
  const [currency, setCurrency] = useState('FCFA');
  const [taxRate, setTaxRate] = useState(0); // e.g. 18 for 18%

  // Calculations (Inspiré du TP)
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const total = subtotal + taxAmount;

  const addItem = () => {
    setItems([...items, { id: Date.now().toString(), name: '', price: 0, quantity: 1 }]);
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-16 px-4">
      {/* Header (Hidden in Print) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4 pt-8 sm:pt-16 print:hidden"
      >
        <ToolsNav />
        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
          <Sparkles className="w-4 h-4" />
          <span>Outils Gratuits Hadara Studio</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-serif font-extrabold text-slate-100">
          Générateur de <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Factures</span>
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Créez des factures professionnelles en quelques clics. Calculez vos totaux instantanément et exportez en PDF.
        </p>
      </motion.div>

      {/* Control Panel (Hidden in Print) */}
      <div className="print:hidden flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
        <div className="flex gap-4 items-center w-full sm:w-auto">
          <div className="space-y-1">
            <label className="text-xs text-slate-400 uppercase font-bold">Devise</label>
            <input 
              type="text" 
              value={currency} 
              onChange={e => setCurrency(e.target.value)} 
              className="w-24 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-400 uppercase font-bold">TVA (%)</label>
            <input 
              type="number" 
              value={taxRate} 
              onChange={e => setTaxRate(Number(e.target.value))} 
              className="w-24 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200"
              min="0"
              max="100"
            />
          </div>
        </div>
        
        <button 
          onClick={handlePrint}
          className="w-full sm:w-auto px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          <Printer className="w-5 h-5" />
          <span>Imprimer / PDF</span>
        </button>
      </div>

      {/* The Printable Invoice Paper */}
      <div className="bg-white text-slate-900 shadow-2xl rounded-sm max-w-4xl mx-auto print:shadow-none print:m-0 print:p-0">
        <div className="p-8 sm:p-12 space-y-8 min-h-[1056px]">
          
          {/* Invoice Header */}
          <div className="flex justify-between items-start border-b-2 border-slate-200 pb-8">
            <div className="space-y-2 max-w-[250px]">
              <div className="flex items-center gap-2 text-amber-600 mb-4 print:hidden">
                <Building2 className="w-6 h-6" />
                <span className="font-bold text-sm">Vos Informations</span>
              </div>
              <input 
                type="text" 
                placeholder="Votre Nom ou Entreprise"
                value={myCompany}
                onChange={e => setMyCompany(e.target.value)}
                className="w-full text-2xl font-black bg-transparent border-none p-0 focus:ring-0 placeholder:text-slate-300"
              />
              <textarea 
                placeholder="Votre Adresse (Optionnel)"
                value={myAddress}
                onChange={e => setMyAddress(e.target.value)}
                className="w-full text-sm text-slate-600 bg-transparent border-none p-0 focus:ring-0 resize-none placeholder:text-slate-300"
                rows={2}
              />
              <input 
                type="text" 
                placeholder="Numéro de téléphone"
                value={myPhone}
                onChange={e => setMyPhone(e.target.value)}
                className="w-full text-sm text-slate-600 bg-transparent border-none p-0 focus:ring-0 placeholder:text-slate-300"
              />
            </div>

            <div className="text-right space-y-2">
              <h2 className="text-4xl font-black text-slate-200 uppercase tracking-widest mb-4 print:text-slate-300">Facture</h2>
              <div className="flex items-center justify-end gap-2 text-sm font-medium">
                <span className="text-slate-400">N° :</span>
                <input 
                  type="text" 
                  value={invoiceNumber}
                  onChange={e => setInvoiceNumber(e.target.value)}
                  className="w-32 text-right bg-slate-100 hover:bg-slate-200 rounded px-2 py-1 focus:outline-none print:bg-transparent print:p-0"
                />
              </div>
              <div className="flex items-center justify-end gap-2 text-sm font-medium">
                <span className="text-slate-400">Date :</span>
                <input 
                  type="date" 
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-36 text-right bg-slate-100 hover:bg-slate-200 rounded px-2 py-1 focus:outline-none print:bg-transparent print:p-0"
                />
              </div>
            </div>
          </div>

          {/* Client Info */}
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-2 bg-slate-50 p-6 rounded-xl border border-slate-100 print:bg-transparent print:border-none print:p-0">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Facturé à :</p>
              <input 
                type="text" 
                placeholder="Nom du Client"
                value={clientName}
                onChange={e => setClientName(e.target.value)}
                className="w-full text-lg font-bold bg-transparent border-none p-0 focus:ring-0 placeholder:text-slate-300"
              />
              <textarea 
                placeholder="Adresse du Client"
                value={clientAddress}
                onChange={e => setClientAddress(e.target.value)}
                className="w-full text-sm text-slate-600 bg-transparent border-none p-0 focus:ring-0 resize-none placeholder:text-slate-300"
                rows={3}
              />
            </div>
          </div>

          {/* Items Table */}
          <div className="space-y-4 pt-8">
            <div className="grid grid-cols-12 gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest border-b-2 border-slate-800 pb-2">
              <div className="col-span-6 sm:col-span-7">Désignation</div>
              <div className="col-span-2 text-center">Qté</div>
              <div className="col-span-2 text-right">Prix Unitaire</div>
              <div className="col-span-2 text-right">Total</div>
              <div className="hidden sm:block absolute right-0 print:hidden w-8"></div>
            </div>

            {items.map((item, index) => (
              <div key={item.id} className="grid grid-cols-12 gap-4 items-center group relative border-b border-slate-100 pb-2">
                <div className="col-span-6 sm:col-span-7">
                  <input 
                    type="text" 
                    placeholder="Description de l'article..."
                    value={item.name}
                    onChange={e => updateItem(item.id, 'name', e.target.value)}
                    className="w-full font-medium text-slate-800 bg-transparent border-none p-0 focus:ring-0 placeholder:text-slate-200"
                  />
                </div>
                <div className="col-span-2">
                  <input 
                    type="number" 
                    min="1"
                    value={item.quantity}
                    onChange={e => updateItem(item.id, 'quantity', Number(e.target.value))}
                    className="w-full text-center font-mono text-slate-600 bg-transparent border-none p-0 focus:ring-0"
                  />
                </div>
                <div className="col-span-2">
                  <input 
                    type="number"
                    min="0"
                    value={item.price || ''}
                    onChange={e => updateItem(item.id, 'price', Number(e.target.value))}
                    className="w-full text-right font-mono text-slate-600 bg-transparent border-none p-0 focus:ring-0"
                  />
                </div>
                <div className="col-span-2 text-right font-mono font-bold text-slate-800">
                  {((item.price || 0) * (item.quantity || 1)).toLocaleString()} {currency}
                </div>
                
                {/* Delete Button (Hidden in Print) */}
                {items.length > 1 && (
                  <button 
                    onClick={() => removeItem(item.id)}
                    className="absolute -right-8 top-1/2 -translate-y-1/2 p-2 text-rose-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity print:hidden"
                    title="Supprimer la ligne"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}

            {/* Add Line Button (Hidden in Print) */}
            <button 
              onClick={addItem}
              className="flex items-center gap-2 text-sm font-bold text-amber-500 hover:text-amber-600 transition-colors py-4 print:hidden"
            >
              <Plus className="w-4 h-4" />
              Ajouter une ligne
            </button>
          </div>

          {/* Totals Section */}
          <div className="flex justify-end pt-8">
            <div className="w-64 space-y-3">
              <div className="flex justify-between text-sm font-medium text-slate-500">
                <span>Sous-total</span>
                <span className="font-mono">{subtotal.toLocaleString()} {currency}</span>
              </div>
              
              {taxRate > 0 && (
                <div className="flex justify-between text-sm font-medium text-slate-500">
                  <span>TVA ({taxRate}%)</span>
                  <span className="font-mono">{taxAmount.toLocaleString()} {currency}</span>
                </div>
              )}
              
              <div className="flex justify-between text-lg font-black text-slate-900 border-t-2 border-slate-900 pt-3">
                <span>TOTAL TTC</span>
                <span className="font-mono text-amber-600">{total.toLocaleString()} {currency}</span>
              </div>
            </div>
          </div>
          
          {/* Footer Notice */}
          <div className="pt-24 pb-8 text-center text-xs font-medium text-slate-400">
            <p>Merci pour votre confiance.</p>
          </div>

        </div>
      </div>

      {/* Cross-sell (Hidden in Print) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-3xl mx-auto text-center p-8 sm:p-12 rounded-[2rem] bg-gradient-to-br from-[#335A79] to-[#184260] border border-blue-400/20 shadow-2xl mt-12 print:hidden"
      >
        <h3 className="text-2xl font-serif font-bold text-white mb-4">
          Votre facture manque de style ?
        </h3>
        <p className="text-blue-100/80 mb-8 text-sm leading-relaxed">
          Un design professionnel inspire confiance à vos clients. Confiez la création de votre logo et de votre identité visuelle complète au Studio Hadara.
        </p>
        <button
          onClick={onGoToBrief}
          className="px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-2xl flex items-center justify-center gap-3 transition-colors shadow-lg shadow-amber-500/20 mx-auto"
        >
          <Sparkles className="w-5 h-5" />
          <span>Créer mon Identité Visuelle</span>
        </button>
      </motion.div>
    </div>
  );
};
