import React from 'react';
import { motion } from 'framer-motion';
import { User, Building, Phone, MapPin, Mail } from 'lucide-react';
import { BriefData } from '../../types';

interface Step1ContactProps {
  formData: Partial<BriefData>;
  setFormData: (data: Partial<BriefData>) => void;
  direction: number;
  stepVariants: any;
}

export const Step1Contact: React.FC<Step1ContactProps> = ({ formData, setFormData, direction, stepVariants }) => {
  return (
    <motion.div
      key="step-1"
      custom={direction}
      variants={stepVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="space-y-6"
    >
      <div className="border-b border-slate-800 pb-3">
        <h3 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
          <User className="w-5 h-5 text-amber-400" />
          <span>1. Informations & Coordonnées Client</span>
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Vos coordonnées permettent au studio d'identifier votre commande et de vous transmettre votre devis sous 24h.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Nom complet / Raison Sociale *
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              required
              placeholder="Saisissez votre prénom et nom complet"
              value={formData.clientName || ''}
              onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:border-amber-500 focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Organisation / Dahira / Entreprise
          </label>
          <div className="relative">
            <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Nom de la structure, entreprise ou association"
              value={formData.organization || ''}
              onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:border-amber-500 focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Téléphone (WhatsApp & Telegram) *
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="tel"
              required
              placeholder="+221 7X XXX XX XX (Numéro joignable)"
              value={formData.whatsapp || ''}
              onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:border-amber-500 focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Ville & Pays de Résidence
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Ville, Pays (ex: Dakar, Sénégal / Paris, France)"
              value={formData.cityCountry || ''}
              onChange={(e) => setFormData({ ...formData, cityCountry: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:border-amber-500 focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <label className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Adresse Email (Optionnel)
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="email"
              placeholder="Ex: client@exemple.sn"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:border-amber-500 focus:outline-none transition-colors"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
