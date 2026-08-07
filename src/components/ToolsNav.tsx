import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Wand2, QrCode, FileText } from 'lucide-react';
import { cn } from '../utils/cn';

export const ToolsNav: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const links = [
    { name: "Détourage Image", path: "/outils/detourage", icon: <Wand2 className="w-4 h-4" /> },
    { name: "QR Code", path: "/outils/qr-code", icon: <QrCode className="w-4 h-4" /> },
    // { name: "Extracteur de texte", path: "/outils/ocr", icon: <FileText className="w-4 h-4" /> },
  ];

  return (
    <div className="flex justify-center mb-8">
      <div className="flex bg-slate-900/50 p-1.5 rounded-2xl backdrop-blur-md border border-slate-800">
        {links.map((link) => {
          const isActive = currentPath === link.path || (link.path === '/outils/detourage' && currentPath === '/outils');
          return (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                isActive 
                  ? "bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/20" 
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              )}
            >
              {link.icon}
              {link.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
};
