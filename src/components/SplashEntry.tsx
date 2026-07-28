import React from 'react';
import { HadaraLogo } from './HadaraLogo';
import { Sparkles, ArrowRight, MapPin, Phone, Globe, ExternalLink, Award } from 'lucide-react';

interface SplashEntryProps {
  onEnter: () => void;
}

export const SplashEntry: React.FC<SplashEntryProps> = ({ onEnter }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0d131f] via-[#141c2e] to-[#0a0f18] text-[#F5F5DC] flex flex-col justify-between p-6 sm:p-12 relative overflow-hidden selection:bg-[#816C07] selection:text-[#0d131f]">
      
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] sm:w-[700px] sm:h-[700px] bg-[#816C07]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-[#335A79]/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-10 right-10 w-96 h-96 bg-[#224A33]/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Top bar / minimalist location & branding */}
      <header className="relative z-10 flex items-center justify-between max-w-5xl mx-auto w-full text-xs text-[#D4C9BF]/80">
        <div className="flex items-center space-x-2 font-serif font-bold tracking-wider text-[#816C07] uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Studio de Design Graphique HD</span>
        </div>
        <div className="hidden sm:flex items-center space-x-1.5 font-medium">
          <MapPin className="w-3.5 h-3.5 text-[#816C07]" />
          <span>Dakar, Sénégal · International</span>
        </div>
      </header>

      {/* Main Centerpiece */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center max-w-4xl mx-auto w-full my-10 space-y-8">
        
        {/* Logo with interactive hover grow and golden aura */}
        <div className="relative group cursor-pointer" onClick={onEnter} title="Cliquez pour entrer">
          <div className="absolute -inset-6 bg-[#816C07]/25 rounded-full blur-2xl group-hover:bg-[#816C07]/50 transition-all duration-700 pointer-events-none" />
          <HadaraLogo size="xl" variant="or" className="w-44 sm:w-60 h-auto drop-shadow-[0_10px_30px_rgba(129,108,7,0.4)] transition-transform duration-500 group-hover:scale-105" />
        </div>

        {/* Title Block */}
        <div className="space-y-4">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#335A79]/50 border border-[#816C07]/60 text-[#F5F5DC] text-xs sm:text-sm font-bold shadow-inner">
            <Award className="w-4 h-4 text-[#816C07]" />
            <span className="uppercase tracking-widest font-serif">Le Graphiste de la Hadara</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#F5F5DC] via-white to-[#D4C9BF] tracking-tight leading-tight">
            El Hadji Abdoulaye Niass
          </h1>

          <p className="text-sm sm:text-lg text-[#816C07] font-serif font-bold italic max-w-2xl mx-auto">
            « Allier l'héritage de la tradition et l'excellence de la modernité digitale »
          </p>
        </div>

        {/* Quranic Verse Banner */}
        <div className="w-full max-w-lg px-6 py-3.5 rounded-2xl bg-[#141c2e]/90 border border-[#816C07]/40 shadow-xl backdrop-blur-md">
          <p className="text-amber-300 font-serif text-lg sm:text-xl font-bold tracking-wider dir-rtl" lang="ar">
            ﴿وَمَا تَوْفِيقِي إِلَّا بِاللَّهِ﴾
          </p>
          <p className="text-[#D4C9BF]/90 text-xs sm:text-sm italic font-serif mt-1">
            « Ma réussite ne dépend que d’Allah. » (Sourate Hûd, v. 88)
          </p>
        </div>

        {/* Briefing text */}
        <p className="text-xs sm:text-base text-[#D4C9BF] max-w-2xl leading-relaxed font-normal px-4">
          Concepteur visuel haut de gamme pour vos événements institutionnels (Ziarra, Gamou, Magal), vos identités de marque sur-mesure et vos supports grand format. Le savoir-faire artisanal combiné à la puissance de l'IA pour des créations qui captivent et traversent le temps.
        </p>

        {/* Enter Button */}
        <div className="pt-4 w-full sm:w-auto flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onEnter}
            className="w-full sm:w-auto px-12 py-5 rounded-2xl font-serif font-black text-[#0d131f] text-base sm:text-lg tracking-wider bg-gradient-to-r from-[#816C07] via-amber-300 to-[#816C07] bg-[length:200%_auto] hover:bg-right shadow-[0_0_35px_rgba(129,108,7,0.6)] active:scale-95 transition-all duration-500 flex items-center justify-center space-x-3 border border-amber-200 group hover:scale-105"
          >
            <span>ENTRER DANS LE STUDIO</span>
            <ArrowRight className="w-5 h-5 text-[#0d131f] group-hover:translate-x-2 transition-transform duration-300" />
          </button>
        </div>

      </main>

      {/* Footer / Quick Socials */}
      <footer className="relative z-10 max-w-5xl mx-auto w-full pt-6 border-t border-[#335A79]/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#D4C9BF]/80">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 font-semibold">
          <a
            href="https://wa.me/221776232741"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 text-[#F5F5DC] hover:text-[#816C07] transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-400" />
            <span>+221 77 623 27 41</span>
          </a>

          <span className="hidden sm:inline text-slate-600">•</span>

          <a
            href="mailto:mrniass@gmail.com"
            className="text-[#D4C9BF] hover:text-[#816C07] transition-colors"
          >
            mrniass@gmail.com
          </a>
        </div>

        <a
          href="https://www.behance.net/mrniasse"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#335A79]/80 hover:bg-[#335A79] border border-[#816C07]/50 text-[#F5F5DC] font-serif font-bold transition-all shadow-md"
        >
          <Globe className="w-3.5 h-3.5 text-[#816C07]" />
          <span>Portfolio Behance</span>
          <ExternalLink className="w-3 h-3 text-slate-300" />
        </a>
      </footer>

    </div>
  );
};
