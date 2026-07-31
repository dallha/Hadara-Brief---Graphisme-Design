import React from 'react';
import { motion } from 'framer-motion';
import { 
  FileCheck2, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  MessageSquare, 
  CheckCircle2, 
  Image as ImageIcon, 
  Layers, 
  BadgeCheck,
  Send,
  Phone,
  Globe,
  MapPin,
  ExternalLink,
  Monitor,
  Palette,
  UserCheck,
  ArrowUpRight
} from 'lucide-react';
import { PROCESS_STEPS } from '../data/portfolioData';
import { HadaraLogo } from './HadaraLogo';
import { cn } from '../utils/cn';

interface LandingHeroProps {
  onStartBrief: () => void;
  onViewPortfolio: () => void;
  onOpenAdmin: () => void;
  onOpenCV?: () => void;
}

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } }
};

export const LandingHero: React.FC<LandingHeroProps> = ({
  onStartBrief,
  onViewPortfolio,
  onOpenCV,
}) => {
  return (
    <div className="space-y-16 sm:space-y-24 pb-12 pt-16 sm:pt-24 max-w-7xl mx-auto">

      {/* ── HERO SECTION ── */}
      <motion.section 
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="relative"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative text-center max-w-4xl mx-auto space-y-8">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-slate-800 text-amber-500 text-xs font-semibold uppercase tracking-widest shadow-sm">
            <Sparkles className="w-4 h-4" />
            <span>Studio Créatif Premium</span>
          </motion.div>

          <motion.h1 variants={fadeUp} className="text-4xl sm:text-6xl lg:text-7xl font-serif font-extrabold tracking-tight leading-[1.1]">
            <span className="text-slate-100">Des designs qui</span>
            <br />
            <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent">
              captivent l'attention
            </span>
          </motion.h1>

          <motion.p variants={fadeUp} className="text-slate-400 text-base sm:text-xl max-w-2xl mx-auto leading-relaxed font-light">
            Élevez votre marque avec des identités visuelles mémorables, des affiches percutantes et des expériences web sur mesure signées par 
            <strong className="text-slate-200 font-medium ml-1">El Hadji Abdoulaye Niass</strong>.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={onStartBrief}
              className="w-full sm:w-auto px-8 py-4 rounded-full font-sans font-bold text-slate-950 text-base shadow-[0_0_40px_rgba(251,191,36,0.3)] bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 active:scale-95 transition-all flex items-center justify-center gap-3 group"
            >
              <span>Démarrer un projet</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={onViewPortfolio}
              className="w-full sm:w-auto px-8 py-4 rounded-full font-sans font-bold text-slate-300 text-base bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-500 transition-all flex items-center justify-center gap-3 active:scale-95"
            >
              <span>Voir le portfolio</span>
            </button>
          </motion.div>
        </div>
      </motion.section>


      {/* ── DESIGNER CARD ── */}
      <motion.section 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="relative p-6 sm:p-12 rounded-[2rem] bg-slate-900/50 border border-slate-800 backdrop-blur-md overflow-hidden">
          <div className="flex flex-col lg:flex-row items-center gap-10">
            <div className="shrink-0 relative group">
              <div className="absolute inset-0 bg-amber-500/20 blur-3xl group-hover:bg-amber-500/30 transition-all duration-500" />
              <HadaraLogo size="xl" variant="or" className="relative w-32 h-32 sm:w-40 sm:h-40" />
            </div>

            <div className="flex-1 space-y-6 text-center lg:text-left">
              <div className="space-y-2">
                <h2 className="text-3xl font-serif font-bold text-slate-100">L'Art de la Création</h2>
                <p className="text-sm font-semibold uppercase tracking-widest text-amber-500">
                  Dakar, Sénégal · International
                </p>
              </div>

              <blockquote className="text-slate-300 text-base sm:text-xl font-serif border-amber-500/40 border-l-2 pl-4 py-2 my-2 space-y-2">
                <span dir="rtl" lang="ar" className="block text-amber-400 text-2xl sm:text-3xl font-serif leading-loose font-bold tracking-wide">
                  ﴿وَمَا تَوْفِيقِي إِلَّا بِاللَّهِ﴾
                </span>
                <p className="text-slate-300 text-sm sm:text-lg italic">
                  "Allier l'héritage de la tradition et l'excellence de la modernité digitale."
                </p>
              </blockquote>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                <a href="https://wa.me/221776232741" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors text-sm font-medium">
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span>+221 77 623 27 41</span>
                </a>
                <a href="https://www.behance.net/mrniasse" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#0057ff]/10 hover:bg-[#0057ff]/20 text-[#0057ff] border border-[#0057ff]/30 transition-colors text-sm font-bold">
                  <Globe className="w-4 h-4" />
                  <span>Behance</span>
                </a>
                {onOpenCV && (
                  <button onClick={onOpenCV} className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors text-sm font-medium">
                    <UserCheck className="w-4 h-4 text-amber-400" />
                    <span>CV Pro</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.section>


      {/* ── SERVICES (BENTO GRID PREMIUM) ── */}
      <motion.section 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="space-y-12"
        id="expertise"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-slate-800">
          <div className="space-y-2">
            <span className="text-xs font-bold text-amber-500 uppercase tracking-widest block font-serif">Domaines d'Expertise</span>
            <h2 className="text-3xl sm:text-5xl font-serif font-bold text-slate-100">Solutions Créatives Sur-Mesure</h2>
          </div>
          <p className="text-slate-400 text-sm sm:text-base max-w-md">
            Chaque projet est une oeuvre unique. Nous allions stratégie, esthétique et technologie pour élever votre marque à un niveau supérieur.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Card 1: Identité Visuelle (Span 8) */}
          <motion.div 
            whileHover={{ y: -4 }}
            className="md:col-span-8 p-8 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 transition-all flex flex-col justify-between min-h-[340px] group shadow-xl relative overflow-hidden"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500 transition-colors">
                <Sparkles className="w-7 h-7 text-amber-400 group-hover:text-slate-950 transition-colors" />
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 font-serif text-xs font-bold border border-amber-500/20">
                Branding & Logos
              </span>
            </div>
            <div>
              <h3 className="text-2xl font-serif font-bold text-slate-100 mb-3 group-hover:text-amber-300 transition-colors">
                Identité Visuelle & Univers de Marque
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed mb-6 max-w-xl font-light">
                Création de logos d'exception, chartes graphiques complètes, palettes de couleurs harmonieuses et typographies sur-mesure. Une fondation solide et intemporelle pour marquer les esprits et imposer votre leadership.
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
                <span className="text-xs text-slate-400 font-mono">À partir de <strong className="text-amber-400 font-bold">60 000 FCFA</strong></span>
                <button onClick={onStartBrief} className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 font-bold text-xs uppercase tracking-wider">
                  <span>Démarrer ce projet</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Communication Visuelle (Span 4) */}
          <motion.div 
            whileHover={{ y: -4 }}
            className="md:col-span-4 p-8 rounded-3xl bg-gradient-to-br from-[#335A79] to-[#184260] text-slate-100 flex flex-col justify-between min-h-[340px] shadow-xl relative overflow-hidden"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-400/20 flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-amber-300" />
              </div>
              <span className="text-xs uppercase font-bold text-amber-300 tracking-widest block font-serif">Supports d'Impact</span>
              <h3 className="text-xl font-serif font-bold">Communication Visuelle</h3>
              <p className="text-xs text-amber-100/90 leading-relaxed font-light">
                Affiches événementielles haute définition, brochures, flyers, bâches grand tirage et visuels réseaux sociaux conçus pour captiver et convertir.
              </p>
            </div>
            <div className="pt-6 border-t border-amber-300/20 flex items-center justify-between">
              <span className="text-xs font-mono text-amber-200">30k - 50k FCFA</span>
              <button onClick={onStartBrief} className="p-2 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs hover:bg-amber-300 transition-colors">
                Commander
              </button>
            </div>
          </motion.div>

          {/* Card 3: Packages Booster (Span 4) */}
          <motion.div 
            whileHover={{ y: -4 }}
            className="md:col-span-4 p-8 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 transition-all flex flex-col justify-between min-h-[300px] group shadow-xl"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
                <Layers className="w-6 h-6 text-emerald-400 group-hover:text-slate-950 transition-colors" />
              </div>
              <h3 className="text-xl font-serif font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
                Packages Booster
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-light">
                Offres clés en main pour lancements rapides ou événements majeurs (Ziarra, Gamou, Lancement d'entreprise) combinant identité et supports imprimés.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs font-mono text-emerald-400">Sur Devis Personnalisé</span>
              <button onClick={onStartBrief} className="text-xs font-bold text-amber-400 hover:text-amber-300">
                Explorer →
              </button>
            </div>
          </motion.div>

          {/* Card 4: Sites Web IA (Span 8) */}
          <motion.div 
            whileHover={{ y: -4 }}
            className="md:col-span-8 p-8 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 transition-all flex flex-col md:flex-row justify-between gap-6 group shadow-xl"
          >
            <div className="flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500 transition-colors">
                  <Monitor className="w-6 h-6 text-amber-400 group-hover:text-slate-950 transition-colors" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
                  Plateformes & Sites Web IA
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
                  Conception de sites vitrines modernes, d'applications SaaS et de plateformes de briefing propulsées par l'IA pour une expérience utilisateur d'excellence.
                </p>
              </div>
              <button onClick={onStartBrief} className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 font-bold text-xs uppercase tracking-wider">
                <span>Démarrer un projet Web</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="md:w-2/5 rounded-2xl bg-slate-950 border border-slate-800 p-4 flex flex-col justify-center items-center text-center space-y-3 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 to-blue-500/10 pointer-events-none" />
              <Monitor className="w-10 h-10 text-amber-400 animate-pulse" />
              <span className="text-xs font-bold text-slate-200">Design Responsive & IA</span>
              <span className="text-[10px] text-slate-400">Optimisé pour Mobile, Tablette & Desktop</span>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* ── PROCESS (CONNECTED TIMELINE METHODOLOGY) ── */}
      <motion.section 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative p-8 sm:p-16 rounded-[3rem] bg-slate-900/90 border border-slate-800 overflow-hidden shadow-2xl"
        id="process"
      >
        <div className="text-center space-y-4 mb-16 relative z-10">
          <span className="text-xs font-bold text-amber-500 uppercase tracking-widest block font-serif">Méthodologie Studio</span>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-slate-100">Processus de Commande</h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
            Une collaboration fluide, transparente et structurée en 4 étapes claires pour garantir un résultat à la hauteur de vos exigences.
          </p>
        </div>

        {/* Connecting Line */}
        <div className="hidden lg:block absolute top-1/2 left-16 right-16 h-px bg-slate-800 -translate-y-1/2 z-0" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
          {[
            { num: '01', title: 'Contact & Briefing', desc: 'Prise de contact initiale et expression de vos besoins via notre formulaire intelligent.' },
            { num: '02', title: 'Devis & Validation', desc: 'Proposition commerciale détaillée sous 24h et calendrier prévisionnel du projet.' },
            { num: '03', title: 'Création & Design', desc: 'Phase de recherche, direction artistique et conception des pistes visuelles.' },
            { num: '04', title: 'Livraison Finale', desc: 'Validation définitive et remise de tous les fichiers sources prêts à l\'impression ou au web.' }
          ].map((step, i) => (
            <div key={step.num} className="bg-slate-950 p-6 rounded-2xl border border-slate-800/80 hover:border-amber-500/40 transition-all space-y-4 relative flex flex-col justify-between group shadow-lg">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-full bg-slate-900 border-2 border-amber-500 flex items-center justify-center text-amber-400 font-mono font-bold text-sm shadow-md group-hover:scale-110 transition-transform">
                    {step.num}
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="text-lg font-serif font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
                  {step.title}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed font-light">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* ── CTA ── */}
      <motion.section 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="max-w-4xl mx-auto text-center p-8 sm:p-16 rounded-[3rem] bg-gradient-to-br from-amber-500/20 to-slate-900 border border-amber-500/30"
      >
        <div className="space-y-6">
          <Send className="w-12 h-12 text-amber-400 mx-auto" />
          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-slate-100">Prêt à sublimer votre image ?</h2>
          <p className="text-slate-300 text-lg">
            Remplissez un brief rapide et obtenez un devis personnalisé sous 24h.
          </p>
          <button
            onClick={onStartBrief}
            className="mt-4 px-8 py-4 rounded-full font-sans font-bold text-slate-950 text-base bg-amber-400 hover:bg-amber-300 shadow-[0_0_30px_rgba(251,191,36,0.3)] active:scale-95 transition-all inline-flex items-center gap-3"
          >
            <span>Démarrer mon projet</span>
            <ArrowUpRight className="w-5 h-5" />
          </button>
        </div>
      </motion.section>

    </div>
  );
};
