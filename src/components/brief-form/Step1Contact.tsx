import React from 'react';
import { motion } from 'framer-motion';
import { User, Building, Phone, MapPin, Mail } from 'lucide-react';
import { BriefData } from '../../types';
import { HadaraClientCombobox } from '../HadaraClientCombobox';

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
          Sélectionnez un client existant ou créez-en un nouveau.
        </p>
      </div>

      <div className="max-w-md">
        <HadaraClientCombobox 
          value={formData.client_id}
          onChange={(id) => setFormData({ ...formData, client_id: id })}
          onClientData={(client) => setFormData({ 
            ...formData, 
            client_id: client.id,
            clientName: client.name,
            whatsapp: client.whatsapp || '',
            organization: client.organization || '',
            email: client.email || '',
            cityCountry: client.address || ''
          })}
        />
      </div>

      {formData.clientName && (
        <div className="mt-4 p-4 rounded-xl border border-slate-800 bg-slate-900/50 flex flex-col space-y-2">
          <div className="text-sm font-bold text-slate-200">Client sélectionné :</div>
          <div className="flex items-center space-x-2 text-slate-300 text-sm">
            <User className="w-4 h-4 text-slate-500" />
            <span>{formData.clientName}</span>
          </div>
          {formData.organization && (
            <div className="flex items-center space-x-2 text-slate-300 text-sm">
              <Building className="w-4 h-4 text-slate-500" />
              <span>{formData.organization}</span>
            </div>
          )}
          <div className="flex items-center space-x-2 text-slate-300 text-sm">
            <Phone className="w-4 h-4 text-slate-500" />
            <span>{formData.whatsapp}</span>
          </div>
        </div>
      )}

    </motion.div>
  );
};
