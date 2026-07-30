import React from 'react';
import { motion } from 'framer-motion';
import { HadaraLogo } from './HadaraLogo';
import { Sparkles, ArrowRight, MapPin, Phone, Globe, ExternalLink, Award } from 'lucide-react';

interface SplashEntryProps {
  onEnter: () => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 20 }
  }
};

export const SplashEntry: React.FC<SplashEntryProps> = ({ onEnter }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0d131f] via-[#141c2e] to-[#0a0f18] text-[#F5F5DC] flex flex-col justify-between p-6 sm:p-12 relative overflow-hidden selection:bg-amber-400 selection:text-slate-950">
      
      {/* Ambient background glows */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] sm:w-[700px] sm:h-[700px] bg-[#816C07]/10 rounded-full blur-[120px] pointer-events-none" 
      />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-[#335A79]/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-10 right-10 w-96 h-96 bg-[#224A33]/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Top bar / minimalist location & branding */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="relative z-10 flex items-center justify-between max-w-5xl mx-auto w-full text-xs text-slate-400"
      >
        <div className="flex items-center space-x-2 font-serif font-bold tracking-wider text-amber-500 uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Studio de Design Graphique HD</span>
        </div>
        <div className="hidden sm:flex items-center space-x-1.5 font-medium">
          <MapPin className="w-3.5 h-3.5 text-amber-500" />
          <span>Dakar, Sénégal · International</span>
        </div>
      </motion.header>

      {/* Main Centerpiece */}
      <motion.main 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex-1 flex flex-col items-center justify-center text-center max-w-4xl mx-auto w-full my-10 space-y-8"
      >
        
        {/* Logo with interactive hover grow and golden aura */}
        <motion.div variants={itemVariants} className="relative group cursor-pointer" onClick={onEnter} title="Cliquez pour entrer">
          <div className="absolute -inset-6 bg-[#816C07]/25 rounded-full blur-2xl group-hover:bg-[#816C07]/50 transition-all duration-700 pointer-events-none" />
          <HadaraLogo size="xl" variant="or" className="w-44 sm:w-60 h-auto drop-shadow-[0_10px_30px_rgba(129,108,7,0.4)] transition-transform duration-500 group-hover:scale-105" />
        </motion.div>

        {/* Title Block */}
        <motion.div variants={itemVariants} className="space-y-5">
          <div className="inline-flex items-center space-x-2 px-5 py-2 rounded-full bg-slate-900/50 border border-slate-700/60 text-slate-200 text-xs sm:text-sm font-bold shadow-inner backdrop-blur-sm">
            <Award className="w-4 h-4 text-amber-400" />
            <span className="uppercase tracking-widest font-serif">Le Graphiste de la Hadara</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-white to-amber-200 tracking-tight leading-tight drop-shadow-sm">
            El Hadji Abdoulaye Niass
          </h1>

          <p className="text-sm sm:text-lg text-amber-400/90 font-serif font-medium italic max-w-2xl mx-auto tracking-wide">
            « Allier l'héritage de la tradition et l'excellence de la modernité digitale »
          </p>
        </motion.div>

        {/* Quranic Verse Banner */}
        <motion.div variants={itemVariants} className="w-full max-w-lg px-8 py-5 rounded-3xl bg-slate-900/40 border border-amber-500/20 shadow-2xl backdrop-blur-md relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none" />
          <p className="text-amber-300 font-serif text-xl sm:text-2xl font-bold tracking-wider dir-rtl" lang="ar">
            <span dir="rtl" lang="ar" className="inline-block">﴿وَمَا تَوْفِيقِي إِلَّا بِاللَّهِ﴾</span>
          </p>
          <p className="text-slate-400 text-xs sm:text-sm italic font-serif mt-2">
            « Ma réussite ne dépend que d’Allah. » (Sourate Hûd, v. 88)
          </p>
        </motion.div>

        {/* Briefing text */}
        <motion.p variants={itemVariants} className="text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed font-light px-4">
          Concepteur visuel haut de gamme pour vos événements institutionnels, vos identités de marque sur-mesure et vos supports grand format. Le savoir-faire artisanal combiné à la puissance du digital pour des créations qui captivent et traversent le temps.
        </motion.p>

        {/* Enter Button */}
        <motion.div variants={itemVariants} className="pt-6 w-full sm:w-auto flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onEnter}
            className="w-full sm:w-auto px-10 py-4 rounded-full font-sans font-bold text-slate-950 text-sm sm:text-base tracking-wider bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 shadow-[0_0_40px_rgba(251,191,36,0.3)] hover:shadow-[0_0_60px_rgba(251,191,36,0.5)] active:scale-95 transition-all duration-300 flex items-center justify-center space-x-3 group"
          >
            <span>ENTRER DANS LE STUDIO</span>
            <ArrowRight className="w-5 h-5 text-slate-950 group-hover:translate-x-1.5 transition-transform duration-300" />
          </button>
        </motion.div>

      </motion.main>

      {/* Footer / Quick Socials */}
      <motion.footer 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="relative z-10 max-w-5xl mx-auto w-full pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400"
      >
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 font-medium">
          <a
            href="https://wa.me/221776232741"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 text-slate-300 hover:text-amber-400 transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-400" />
            <span>+221 77 623 27 41</span>
          </a>

          <span className="hidden sm:inline text-slate-600">•</span>

          <a
            href="mailto:mrniass@gmail.com"
            className="text-slate-400 hover:text-amber-400 transition-colors"
          >
            mrniass@gmail.com
          </a>
        </div>

        <a
          href="https://www.behance.net/mrniasse"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-sans font-medium transition-all"
        >
          <Globe className="w-3.5 h-3.5 text-amber-400" />
          <span>Portfolio Behance</span>
          <ExternalLink className="w-3 h-3 text-slate-500" />
        </a>
      </motion.footer>

    </div>
  );
};
