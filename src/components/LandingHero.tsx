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


      {/* ── SERVICES ── */}
      <motion.section 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="space-y-12"
      >
        <div className="text-center space-y-4">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-100">Expertises Créatives</h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">Des solutions visuelles sur mesure pour sublimer votre projet.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Sparkles, title: 'Identité Visuelle', desc: 'Logos, chartes graphiques et branding complet.', price: 'À partir de 60k F' },
            { icon: ImageIcon, title: 'Communication', desc: 'Affiches, flyers et bâches grand format pour événements.', price: '30k F - 50k F' },
            { icon: Layers, title: 'Packages Booster', desc: 'Offres groupées pour startups et événements majeurs.', price: 'Sur Devis' },
            { icon: Monitor, title: 'Sites Web IA', desc: 'Landing pages et sites vitrines modernes.', price: 'Sur Devis' },
          ].map((service, i) => (
            <motion.div 
              key={service.title}
              whileHover={{ y: -5 }}
              className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition-colors group flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500 transition-colors">
                  <service.icon className="w-6 h-6 text-amber-500 group-hover:text-slate-950 transition-colors" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-100 mb-2">{service.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{service.desc}</p>
                </div>
              </div>
              <div className="pt-6 mt-6 border-t border-slate-800 flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tarif</span>
                <span className="text-sm font-bold text-amber-400">{service.price}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ── PROCESS ── */}
      <motion.section 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative p-8 sm:p-16 rounded-[3rem] bg-slate-900 border border-slate-800 overflow-hidden"
      >
        <div className="text-center space-y-4 mb-16 relative z-10">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-100">Processus de Commande</h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">De la conception à la livraison, une méthodologie claire et transparente.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
          {PROCESS_STEPS.map((step, i) => (
            <div key={step.number} className="relative group">
              <div className="text-7xl font-sans font-black text-slate-800/50 absolute -top-8 -left-4 pointer-events-none group-hover:text-amber-500/10 transition-colors">
                {step.number}
              </div>
              <div className="space-y-3 relative z-10">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-amber-500 mb-6 group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-100">{step.title}</h3>
                <p className="text-xs font-semibold text-amber-500 uppercase tracking-wider">{step.subtitle}</p>
                <p className="text-sm text-slate-400 leading-relaxed">{step.description}</p>
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
