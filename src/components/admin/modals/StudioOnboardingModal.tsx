import React, { useState } from 'react';
import { StudioTenantConfig } from '../../../types';
import { Building, X, Sparkles, Check, Globe, CreditCard, Shield } from 'lucide-react';

interface StudioOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStudioCreated: (newStudio: StudioTenantConfig) => void;
}

export const StudioOnboardingModal: React.FC<StudioOnboardingModalProps> = ({
  isOpen,
  onClose,
  onStudioCreated,
}) => {
  const [studioName, setStudioName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#816C07');
  const [customDomain, setCustomDomain] = useState('');
  const [plan, setPlan] = useState<'starter' | 'pro_studio' | 'enterprise_saas'>('pro_studio');
  const [waveNumber, setWaveNumber] = useState('+221 77 623 27 41');
  const [omNumber, setOmNumber] = useState('+221 76 375 63 63');
  const [isWhiteLabel, setIsWhiteLabel] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studioName.trim() || !ownerName.trim()) return;

    const newStudio: StudioTenantConfig = {
      id: `STD-${Date.now().toString().slice(-4)}`,
      name: studioName,
      ownerName,
      ownerEmail,
      primaryColor,
      customDomain: customDomain || undefined,
      subscriptionPlan: plan,
      waveNumber,
      omNumber,
      isWhiteLabelEnabled: isWhiteLabel,
      createdAt: new Date().toLocaleDateString('fr-FR')
    };

    onStudioCreated(newStudio);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden my-auto">
        
        {/* Header */}
        <div className="p-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-amber-400">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-slate-100">Créer un Nouveau Studio (Multi-Tenant SaaS)</h2>
              <p className="text-xs text-slate-400">Déployer une instance Hadara Suite dédiée avec marque blanche</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Nom du Studio Graphique *</label>
              <input
                type="text"
                placeholder="ex: Design Studio Dakar"
                value={studioName}
                onChange={(e) => setStudioName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 focus:border-amber-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-300 mb-1">Nom du Fondateur / Designer *</label>
              <input
                type="text"
                placeholder="ex: Cheikh Ndiaye"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">Domaine Personnalisé (Marque Blanche)</label>
            <input
              type="text"
              placeholder="ex: studio-dakar.com"
              value={customDomain}
              onChange={(e) => setCustomDomain(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 focus:border-amber-400 focus:outline-none font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Numéro Wave</label>
              <input
                type="text"
                value={waveNumber}
                onChange={(e) => setWaveNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-300 mb-1">Numéro Orange Money</label>
              <input
                type="text"
                value={omNumber}
                onChange={(e) => setOmNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-mono"
              />
            </div>
          </div>

          {/* Plan Picker */}
          <div>
            <label className="block font-bold text-slate-300 mb-2">Formule d'Abonnement SaaS :</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'starter', title: 'Starter Studio', price: '25k / mois' },
                { id: 'pro_studio', title: 'Pro Studio (IA)', price: '45k / mois' },
                { id: 'enterprise_saas', title: 'Enterprise WhiteLabel', price: '85k / mois' },
              ].map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setPlan(p.id as any)}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    plan === p.id ? 'bg-amber-400/20 border-amber-400 text-amber-300' : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <p className="font-bold text-[11px]">{p.title}</p>
                  <p className="text-[10px] font-mono mt-0.5">{p.price}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-lg"
            >
              Déployer l'Instance Studio
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
