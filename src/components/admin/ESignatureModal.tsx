import React, { useState, useRef } from 'react';
import { ESignatureRecord } from '../../types';
import { FileCheck, X, Check, RefreshCw, Lock } from 'lucide-react';

interface ESignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  briefId: string;
  clientName: string;
  quotedPriceFCFA: number;
  onSigned: (record: ESignatureRecord) => void;
}

export const ESignatureModal: React.FC<ESignatureModalProps> = ({
  isOpen,
  onClose,
  briefId,
  clientName,
  quotedPriceFCFA,
  onSigned,
}) => {
  const [signatureText, setSignatureText] = useState(clientName);
  const [isSigning, setIsSigning] = useState(false);

  if (!isOpen) return null;

  const handleConfirmSignature = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signatureText.trim()) return;

    setIsSigning(true);
    setTimeout(() => {
      const record: ESignatureRecord = {
        id: `SIG-${Date.now().toString().slice(-4)}`,
        briefId,
        clientName: signatureText,
        signatureDataUrl: 'data:image/svg+xml;utf8,<svg>Signature Validée</svg>',
        signedAt: new Date().toLocaleString('fr-FR')
      };
      onSigned(record);
      setIsSigning(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden my-auto">
        
        {/* Header */}
        <div className="p-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-amber-400">
              <FileCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-slate-100">Signature Électronique du Devis</h2>
              <p className="text-xs text-slate-400">Engagement juridique & validation du contrat de création</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleConfirmSignature} className="p-6 space-y-4 text-xs">
          
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex justify-between text-slate-400 font-mono">
              <span>Projet N° :</span>
              <span className="font-bold text-amber-400">{briefId}</span>
            </div>
            <div className="flex justify-between text-slate-400 font-mono">
              <span>Montant Devisé :</span>
              <span className="font-bold text-emerald-400">{quotedPriceFCFA.toLocaleString('fr-FR')} FCFA</span>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">Nom Complet pour Signature Électronique *</label>
            <input
              type="text"
              value={signatureText}
              onChange={(e) => setSignatureText(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm font-serif font-bold focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-emerald-500/30 text-[11px] text-slate-400 leading-relaxed flex items-start space-x-2">
            <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>En signant électroniquement, vous confirmez le bon pour accord du devis et autorisez le démarrage de la création graphique.</span>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSigning}
              className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-lg flex items-center space-x-2"
            >
              {isSigning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              <span>{isSigning ? 'Validation...' : 'Signer & Valider le Devis'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
