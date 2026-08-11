import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Wand2,
  QrCode,
  FileText,
  Receipt,
  Palette,
  Smartphone,
  Stamp,
  FileImage,
  Timer,
  Calculator,
  Cloud,
  Maximize2,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface ToolsHubProps {
  onGoToBrief: () => void;
}

export const ToolsHub: React.FC<ToolsHubProps> = ({ onGoToBrief }) => {
  const tools = [
    {
      name: 'Agrandisseur HD (2x/4x)',
      path: '/outils/upscale',
      icon: Maximize2,
      color: 'from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-400',
      description: 'Inspiré d\'Upscayl — Augmentez la résolution de vos images et logos en 2x/4x sans perte de netteté.',
      badge: 'Nouveau',
    },
    {
      name: 'Nuage de Mots',
      path: '/outils/nuage-mots',
      icon: Cloud,
      color: 'from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-400',
      description: 'Transformez vos textes et briefs en nuages de mots-clés artistiques personnalisés.',
      badge: 'Nouveau',
    },
    {
      name: 'Calculateur de Devis',
      path: '/outils/devis',
      icon: Calculator,
      color: 'from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-400',
      description: 'Estimez instantanément le budget de votre projet créatif selon vos besoins.',
      badge: 'Populaire',
    },
    {
      name: 'Générateur de Factures (Simple)',
      path: '/outils/facture',
      icon: Receipt,
      color: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-400',
      description: 'Créez et exportez des factures professionnelles en PDF en un clic.',
    },
    {
      name: 'Extracteur de Couleurs',
      path: '/outils/couleurs',
      icon: Palette,
      color: 'from-purple-500/20 to-purple-600/10 border-purple-500/30 text-purple-400',
      description: 'Extrayez la palette de couleurs dominantes (HEX/RGB) de n\'importe quelle image.',
      badge: 'Nouveau',
    },
    {
      name: 'Générateur de Mockups',
      path: '/outils/mockup',
      icon: Smartphone,
      color: 'from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-400',
      description: 'Encadrez vos captures d\'écran dans un iPhone, MacBook ou navigateur web.',
      badge: 'Nouveau',
    },
    {
      name: 'Détourage IA',
      path: '/outils/detourage',
      icon: Wand2,
      color: 'from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-400',
      description: 'Supprimez l\'arrière-plan de vos images instantanément et 100% en local.',
    },
    {
      name: 'Compresseur d\'Images',
      path: '/outils/compresseur',
      icon: FileImage,
      color: 'from-teal-500/20 to-teal-600/10 border-teal-500/30 text-teal-400',
      description: 'Réduisez le poids de vos images (JPG, PNG, WebP) sans perte de qualité.',
      badge: 'Nouveau',
    },
    {
      name: 'Ajout de Filigrane',
      path: '/outils/filigrane',
      icon: Stamp,
      color: 'from-rose-500/20 to-rose-600/10 border-rose-500/30 text-rose-400',
      description: 'Protégez vos visuels avec votre nom, logo ou texte personnalisé.',
      badge: 'Nouveau',
    },
    {
      name: 'Générateur QR Code',
      path: '/outils/qr-code',
      icon: QrCode,
      color: 'from-indigo-500/20 to-indigo-600/10 border-indigo-500/30 text-indigo-400',
      description: 'Créez des QR codes personnalisés avec couleurs et logo Hadara.',
    },
    {
      name: 'Extracteur OCR',
      path: '/outils/ocr',
      icon: FileText,
      color: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30 text-cyan-400',
      description: 'Extrayez le texte d\'images ou documents (Arabe & Français).',
    },
    {
      name: 'Minuterie Facturation',
      path: '/outils/minuterie',
      icon: Timer,
      color: 'from-orange-500/20 to-orange-600/10 border-orange-500/30 text-orange-400',
      description: 'Chronométrez votre travail horaire et calculez le montant à facturer.',
      badge: 'Nouveau',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-24 px-3 sm:px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4 pt-6 sm:pt-16">
        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Hadara Tools Suite</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-serif font-extrabold text-slate-100">
          Les Outils <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Gratuits du Studio</span>
        </h1>
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
          12 outils puissants et gratuits pour accélérer vos créations graphiques et la gestion de vos projets.
        </p>
      </motion.div>

      {/* Grid of 12 tools */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((t, idx) => {
          const IconComp = t.icon;
          return (
            <motion.div
              key={t.path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Link
                to={t.path}
                className="group block p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 hover:bg-slate-900 transition-all space-y-3 relative overflow-hidden h-full flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${t.color} border flex items-center justify-center`}>
                      <IconComp className="w-5 h-5" />
                    </div>
                    {t.badge && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20">
                        {t.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-slate-100 group-hover:text-amber-400 transition-colors flex items-center gap-1.5">
                    <span>{t.name}</span>
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{t.description}</p>
                </div>

                <div className="pt-2 flex items-center gap-1 text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
                  <span>Utiliser l'outil</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-3xl mx-auto text-center p-6 sm:p-12 rounded-[2rem] bg-gradient-to-br from-[#335A79] to-[#184260] border border-blue-400/20 shadow-2xl">
        <h3 className="text-xl sm:text-2xl font-serif font-bold text-white mb-3">Un projet créatif à nous confier ?</h3>
        <p className="text-blue-100/80 mb-6 text-sm">Transmettez-nous votre demande en 5 étapes simples et obtenez un devis personnalisé.</p>
        <button onClick={onGoToBrief} className="w-full sm:w-auto px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-2xl flex items-center justify-center gap-3 mx-auto transition-all active:scale-95 text-sm">
          <Sparkles className="w-5 h-5" />
          <span>Démarrer un Brief Intelligent</span>
        </button>
      </motion.div>
    </div>
  );
};
