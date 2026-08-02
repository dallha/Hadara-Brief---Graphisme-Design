import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle2, Rocket, Zap, ArrowRight } from 'lucide-react';

interface RoadmapViewProps {
  onGoToBrief?: () => void;
}

export const RoadmapView: React.FC<RoadmapViewProps> = ({ onGoToBrief }) => {
  const roadmapPhases = [
    {
      version: 'Version 1.0 — Février 2026',
      status: 'Livrée & Opérationnelle',
      statusColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      icon: CheckCircle2,
      title: 'Socle SaaS & Formulaire Brief Intelligent',
      description: 'Lancement du moteur de brief guidé en 5 étapes, système de tarification dynamique et portail client synchronisé.',
      milestones: [
        'Formulaire de brief interactif à 5 étapes avec validation en direct',
        'Calculateur d’estimation budgétaire automatique par IA',
        'Portail Client avec suivi de projet à 6 étapes',
        'Administration sécurisée par jeton d’accès & protection anti-bruteforce'
      ]
    },
    {
      version: 'Version 2.0 — Mars 2026',
      status: 'En Déploiement Actif',
      statusColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      icon: Zap,
      title: 'Gestion des Fichiers HD & Studio 360°',
      description: 'Module de téléversement direct pour les designers, visionneuse HD Lightbox et synchronisation automatique des révisions.',
      milestones: [
        'Téléversement direct d’images (.png, .jpg, .webp, .pdf) sans hébergeur externe',
        'Visionneuse HD Lightbox avec zoom pour le client sur mobile et PC',
        'Modèles de services prédéfinis avec fiches détaillées et livrables explicites',
        'Intégration du profil d’artiste & de la landing page d’accueil signature'
      ]
    },
    {
      version: 'Version 3.0 — Q3/Q4 2026',
      status: 'En Développement & Futur',
      statusColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      icon: Rocket,
      title: 'Internationalisation & Automatisation',
      description: 'Passage au multilingue intégral, intégration directe des API de paiement Wave/Orange Money et notifications WhatsApp automatiques.',
      milestones: [
        'Support multilingue natif (Français 🇫🇷, English 🇬🇧, العربية 🇸🇦)',
        'Génération automatique des devis et factures au format PDF téléchargeable',
        'Intégration directe des SDK de paiements mobiles (Wave & Orange Money)',
        'Notifications instantanées par WhatsApp Business API pour le statut de livraison'
      ]
    }
  ];

  return (
    <div className="space-y-12 pb-16 max-w-5xl mx-auto px-4 sm:px-6 relative overflow-hidden">
      {/* Decorative ambient background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] sm:w-[700px] h-[350px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4 max-w-3xl mx-auto relative z-10"
      >
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Feuille de Route & Évolution Produit</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-serif font-extrabold text-slate-100 tracking-tight">
          La Vision & la <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Roadmap Hadara</span>
        </h2>

        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
          Découvrez la trajectoire de Hadara Suite v2.0.0. Nous privilégions la finition extrême, la simplicité d'utilisation et la fiabilité technique pour notre communauté de clients et partenaires.
        </p>
      </motion.div>

      {/* Timeline Phases */}
      <div className="space-y-8 relative z-10">
        {roadmapPhases.map((phase, idx) => {
          const IconComp = phase.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.15 }}
              className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 backdrop-blur-md border border-slate-800 hover:border-amber-500/40 transition-all space-y-6 shadow-xl relative overflow-hidden"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                    <IconComp className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">{phase.version}</span>
                    <h3 className="text-xl font-serif font-bold text-slate-100">{phase.title}</h3>
                  </div>
                </div>

                <span className={`px-3.5 py-1.5 rounded-full border text-xs font-bold font-mono ${phase.statusColor}`}>
                  {phase.status}
                </span>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed font-normal">
                {phase.description}
              </p>

              <div className="space-y-2 pt-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Jalons & Fonctionnalités clés :</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {phase.milestones.map((m, mIdx) => (
                    <div key={mIdx} className="flex items-start space-x-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{m}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* CTA Bottom Banner */}
      {onGoToBrief && (
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl relative z-10">
          <div className="text-center sm:text-left space-y-1">
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-slate-100">Prêt à lancer votre projet avec Hadara ?</h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Bénéficiez immédiatement du Brief Intelligent et d’un suivi dédié sur votre Espace Client sécurisé.
            </p>
          </div>
          <button
            onClick={onGoToBrief}
            className="px-8 py-4 rounded-2xl font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-300 hover:brightness-110 shadow-xl shadow-amber-400/20 active:scale-95 transition-all inline-flex items-center space-x-2 text-sm"
          >
            <span>Créer votre Brief Intelligent</span>
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </button>
        </div>
      )}
    </div>
  );
};
