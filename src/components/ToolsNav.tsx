import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Wand2, QrCode, FileText, Receipt, Palette, Smartphone, Stamp, FileImage, Timer, Calculator, Cloud } from 'lucide-react';
import { cn } from '../utils/cn';

export const ToolsNav: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const links = [
    { name: "Nuage Mots", path: "/outils/nuage-mots", icon: <Cloud className="w-4 h-4" /> },
    { name: "Devis", path: "/outils/devis", icon: <Calculator className="w-4 h-4" /> },
    { name: "Facture", path: "/outils/facture", icon: <Receipt className="w-4 h-4" /> },
    { name: "Couleurs", path: "/outils/couleurs", icon: <Palette className="w-4 h-4" /> },
    { name: "Mockup", path: "/outils/mockup", icon: <Smartphone className="w-4 h-4" /> },
    { name: "Détourage", path: "/outils/detourage", icon: <Wand2 className="w-4 h-4" /> },
    { name: "Compresseur", path: "/outils/compresseur", icon: <FileImage className="w-4 h-4" /> },
    { name: "Filigrane", path: "/outils/filigrane", icon: <Stamp className="w-4 h-4" /> },
    { name: "QR Code", path: "/outils/qr-code", icon: <QrCode className="w-4 h-4" /> },
    { name: "OCR", path: "/outils/ocr", icon: <FileText className="w-4 h-4" /> },
    { name: "Minuterie", path: "/outils/minuterie", icon: <Timer className="w-4 h-4" /> },
  ];

  return (
    <div className="flex justify-center mb-6">
      <div className="flex overflow-x-auto scrollbar-hide gap-1.5 bg-slate-900/50 p-1.5 rounded-2xl backdrop-blur-md border border-slate-800 max-w-full">
        {links.map((link) => {
          const isActive = currentPath === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex-shrink-0",
                isActive
                  ? "bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              )}
            >
              {link.icon}
              <span>{link.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
