import React from 'react';
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
  UserCheck
} from 'lucide-react';
import { PROCESS_STEPS } from '../data/portfolioData';
import { HadaraLogo } from './HadaraLogo';

interface LandingHeroProps {
  onStartBrief: () => void;
  onViewPortfolio: () => void;
  onOpenAdmin: () => void;
  onOpenCV?: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onStartBrief,
  onViewPortfolio,
  onOpenAdmin,
  onOpenCV,
}) => {
  return (
    <div className="space-y-12 sm:space-y-16 pb-12">

      {/* ── Carte Profil Designer ── */}
      <section className="max-w-6xl mx-auto">
        <div className="relative p-6 sm:p-10 rounded-3xl bg-[#141c2e]/80 border border-[#335A79]/40 shadow-2xl space-y-6 overflow-hidden backdrop-blur-md hover:border-[#816C07]/50 transition-colors">
          {/* Halo décoratif */}
          <div className="absolute -top-28 -right-28 w-80 h-80 bg-[#816C07]/8 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#335A79]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex flex-col lg:flex-row items-center justify-between gap-8">
            {/* Identité */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6">
              <HadaraLogo size="xl" className="w-20 h-20 sm:w-24 sm:h-24 shrink-0" />

              <div className="space-y-3">
                {/* Badge titre */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#816C07]/15 border border-[#816C07]/35 text-[#F5F5DC] text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-[#816C07]" />
                  <span>Graphiste de la Hadara</span>
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-extrabold text-[#F5F5DC] tracking-tight">
                  El Hadji Abdoulaye Niass
                </h1>
                <p className="text-[11px] font-bold uppercase tracking-widest text-[#816C07]">
                  Identités Visuelles · Affiches · Bâches · Sites Web
                </p>

                <p className="text-[#D4C9BF] text-xs sm:text-sm max-w-2xl leading-relaxed italic border-l-2 border-[#816C07]/50 pl-3">
                  ﴿وَمَا تَوْفِيقِي إِلَّا بِاللَّهِ﴾ — Alliant tradition et modernité, je conçois des identités visuelles élégantes et mémorables pour les entreprises, institutions et événements.
                </p>

                {/* Infos contact */}
                <div className="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs">
                  <span className="flex items-center gap-1.5 text-[#D4C9BF] font-medium">
                    <MapPin className="w-3.5 h-3.5 text-[#816C07]" />
                    Dakar, Sénégal
                  </span>

                  <a
                    href="https://wa.me/221776232741"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-[#D4C9BF] hover:text-[#F5F5DC] font-semibold transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#816C07]" />
                    +221 77 623 27 41
                  </a>

                  <a
                    href="tel:+221763756363"
                    className="flex items-center gap-1.5 text-[#D4C9BF] hover:text-[#F5F5DC] font-semibold transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#816C07]" />
                    +221 76 375 63 63
                  </a>

                  <a
                    href="https://www.behance.net/mrniasse"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="behance-btn inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-serif font-bold transition-all shadow-md"
                  >
                    <Globe className="w-3.5 h-3.5 behance-gold-icon" />
                    <span className="text-[#F5F5DC]">Portfolio Behance</span>
                    <ExternalLink className="w-3 h-3 text-[#F5F5DC]/80" />
                  </a>
                </div>
              </div>
            </div>

            {/* Boutons CTA */}
            <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-3 w-full sm:w-auto">
              <button
                onClick={onStartBrief}
                className="px-6 py-3.5 rounded-xl font-serif font-bold text-[#F5F5DC] text-xs sm:text-sm shadow-xl bg-gradient-to-r from-[#816C07] to-[#a38b12] hover:from-[#927b08] hover:to-[#b59b15] border border-[#816C07]/50 active:scale-95 transition-all flex items-center justify-center gap-2 group"
              >
                <FileCheck2 className="w-4 h-4 text-[#F5F5DC]" />
                <span>Remplir le Brief de Commande</span>
                <ArrowRight className="w-4 h-4 text-[#F5F5DC] group-hover:translate-x-1 transition-transform" />
              </button>

              {onOpenCV && (
                <button
                  onClick={onOpenCV}
                  className="px-5 py-3 rounded-xl font-serif font-bold text-[#F5F5DC] text-xs bg-[#335A79] hover:bg-[#284963] border border-[#816C07]/60 shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <UserCheck className="w-4 h-4 text-[#816C07]" />
                  <span>Consulter mon CV Pro</span>
                </button>
              )}

              <a
                href="https://www.behance.net/mrniasse"
                target="_blank"
                rel="noopener noreferrer"
                className="behance-btn px-5 py-3 rounded-xl font-serif font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Globe className="w-4 h-4 behance-gold-icon" />
                <span className="text-[#F5F5DC]">Projets sur Behance</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#F5F5DC]/80" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Bannière Hero principale ── */}
      <section className="relative overflow-hidden pt-10 pb-12 sm:pt-14 sm:pb-16 bg-gradient-to-br from-[#141c2e] via-[#0d131f] to-[#141c2e] border border-[#335A79]/35 rounded-3xl backdrop-blur-md px-6 sm:px-12 max-w-6xl mx-auto shadow-2xl">
        {/* Halos décoratifs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-64 bg-[#816C07]/6 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-[#335A79]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center space-y-6">

          {/* Titre principal */}
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-extrabold tracking-tight leading-tight">
            <span className="text-white">Obtenez une identité visuelle</span>
            {' '}<span className="text-[#816C07]">&amp;</span>{' '}
            <span className="text-white">un design d’impact</span>
            <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-[#816C07] via-[#c9a80c] to-[#a38b12] bg-clip-text text-transparent">
              {' '}adapté à vos besoins
            </span>
          </h2>

          {/* Description */}
          <p className="text-[#D4C9BF] text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Formulaire officiel de brief pour vos <strong className="text-white font-bold">Identités Visuelles</strong>, <strong className="text-white font-bold">Affiches</strong>, <strong className="text-white font-bold">Bâches grand format</strong>, <strong className="text-white font-bold">Packages Booster</strong> et <strong className="text-white font-bold">Créations de sites web</strong>.
          </p>

          {/* CTA Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onStartBrief}
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-serif font-bold text-[#F5F5DC] text-base shadow-xl bg-gradient-to-r from-[#816C07] to-[#a38b12] hover:from-[#927b08] hover:to-[#b59b15] active:scale-95 transition-all flex items-center justify-center gap-3 group border border-[#816C07]/60"
            >
              <FileCheck2 className="w-5 h-5 text-[#F5F5DC] group-hover:scale-110 transition-transform" />
              <span>Démarrer un brief projet</span>
              <ArrowRight className="w-5 h-5 text-[#F5F5DC] group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onViewPortfolio}
              className="w-full sm:w-auto px-6 py-4 rounded-xl font-serif font-bold text-[#F5F5DC] text-base bg-[#335A79] hover:bg-[#284963] border border-[#335A79]/80 hover:border-[#816C07]/60 transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <ImageIcon className="w-5 h-5 text-[#816C07]" />
              <span>Nos Services &amp; Tarifs</span>
            </button>
          </div>

          {/* Avantages clés */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left max-w-3xl mx-auto border-t border-[#335A79]/30">
            {[
              { icon: Clock, title: 'Devis sous 24h', sub: 'Analyse rigoureuse', color: 'text-[#816C07]', bg: 'bg-[#816C07]/10 border-[#816C07]/25' },
              { icon: MessageSquare, title: 'Échange WhatsApp', sub: 'Suivi réactif & clair', color: 'text-[#7ab0d4]', bg: 'bg-[#335A79]/15 border-[#335A79]/30' },
              { icon: ShieldCheck, title: 'Multi-Formats', sub: 'PNG, SVG, PDF, CMJN', color: 'text-[#5da87a]', bg: 'bg-[#224A33]/15 border-[#224A33]/30' },
              { icon: BadgeCheck, title: 'Signé Hadara', sub: 'Esthétique & Culture', color: 'text-[#816C07]', bg: 'bg-[#816C07]/10 border-[#816C07]/25' },
            ].map(({ icon: Icon, title, sub, color, bg }) => (
              <div key={title} className={`p-3.5 rounded-xl ${bg} border flex items-center gap-3`}>
                <Icon className={`w-5 h-5 ${color} shrink-0`} />
                <div>
                  <p className="text-xs font-bold text-[#F5F5DC]">{title}</p>
                  <p className="text-[11px] text-[#D4C9BF]/80">{sub}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── Processus de commande ── */}
      <section className="space-y-8 max-w-6xl mx-auto">
        <div className="text-center space-y-2">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#816C07]/15 border border-[#816C07]/30 text-[#816C07] text-xs font-bold uppercase tracking-widest">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Processus de Commande
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
            4 étapes pour concrétiser votre vision
          </h2>
          <p className="text-[#D4C9BF] text-xs sm:text-sm max-w-xl mx-auto">
            Un déroulement clair et sécurisé de la première prise de contact jusqu’à la livraison finale.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
          {PROCESS_STEPS.map((step, index) => {
            const colors = [
              { border: 'border-[#816C07]/40 hover:border-[#816C07]/80', num: 'text-[#816C07]', icon: 'bg-[#816C07]/15 border-[#816C07]/30 text-[#816C07]' },
              { border: 'border-[#335A79]/40 hover:border-[#335A79]/80', num: 'text-[#7ab0d4]', icon: 'bg-[#335A79]/15 border-[#335A79]/30 text-[#7ab0d4]' },
              { border: 'border-[#224A33]/40 hover:border-[#224A33]/80', num: 'text-[#5da87a]', icon: 'bg-[#224A33]/15 border-[#224A33]/30 text-[#5da87a]' },
              { border: 'border-[#816C07]/40 hover:border-[#816C07]/80', num: 'text-[#816C07]', icon: 'bg-[#816C07]/15 border-[#816C07]/30 text-[#816C07]' },
            ][index % 4];
            return (
              <div
                key={step.number}
                className={`relative p-6 rounded-2xl bg-[#141c2e]/70 border ${colors.border} transition-all flex flex-col justify-between space-y-4 group backdrop-blur-md shadow-lg`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-2xl font-black font-serif ${colors.num}`}>
                    {step.number}
                  </span>
                  <span className={`w-8 h-8 rounded-lg border flex items-center justify-center ${colors.icon}`}>
                    <CheckCircle2 className="w-4 h-4" />
                  </span>
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-sm font-bold text-white leading-snug">{step.title}</h3>
                  <p className={`text-xs font-semibold ${colors.num}`}>{step.subtitle}</p>
                  <p className="text-xs text-[#C8BDB5] leading-relaxed pt-1">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Services & Packages ── */}
      <section className="space-y-8 max-w-6xl mx-auto pt-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-[#335A79]/30 pb-6">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#335A79]/15 border border-[#335A79]/30 text-[#7ab0d4] text-xs font-bold uppercase tracking-widest">
              <Palette className="w-3.5 h-3.5 text-[#816C07]" />
              Nos Services &amp; Packages
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-2">
              Des tarifs clairs adaptés à chaque besoin
            </h2>
          </div>
          <button
            onClick={onStartBrief}
            className="shrink-0 px-5 py-2.5 rounded-xl bg-[#816C07]/20 hover:bg-[#816C07]/35 text-[#F5F5DC] border border-[#816C07]/50 hover:border-[#816C07]/90 font-serif font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md active:scale-95"
          >
            <span>Commander un service</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Sparkles, label: '1. Identité Visuelle', title: 'Logo & Branding',
              desc: 'Recherche & Concepts (3 propositions), jusqu\'à 3 cycles de modifications et fichiers finaux (PNG, JPG, SVG, PDF).',
              price: 'À partir de 60 000 F',
              color: { icon: 'bg-[#816C07]/15 border-[#816C07]/30 text-[#816C07]', label: 'text-[#816C07]', border: 'border-[#816C07]/30 hover:border-[#816C07]/70', foot: 'border-[#816C07]/20', price: 'text-[#816C07]' }
            },
            {
              icon: ImageIcon, label: '2. Communication', title: 'Affiches, Flyers & Bâches',
              desc: 'Designs percutants pour événements (30k F) ou business/marketing (50k F). Bâches grand format à partir de 45k F.',
              price: '30 000 F à 50 000 F',
              color: { icon: 'bg-[#335A79]/15 border-[#335A79]/30 text-[#7ab0d4]', label: 'text-[#7ab0d4]', border: 'border-[#335A79]/30 hover:border-[#335A79]/70', foot: 'border-[#335A79]/20', price: 'text-[#7ab0d4]' }
            },
            {
              icon: Layers, label: '3. Packages "Booster"', title: 'Starter & Event Pack',
              desc: 'Offres complètes : Starter Pack (Logo + Charte simple + Carte de visite) ou Event Pack (Affiche/Flyer + Badge + Kakemono).',
              price: 'Sur Devis Avantageux',
              color: { icon: 'bg-[#224A33]/15 border-[#224A33]/30 text-[#5da87a]', label: 'text-[#5da87a]', border: 'border-[#224A33]/30 hover:border-[#224A33]/70', foot: 'border-[#224A33]/20', price: 'text-[#5da87a]' }
            },
            {
              icon: Monitor, label: '4. Digital & Web IA', title: 'Sites Web via IA',
              desc: 'Conception de sites vitrines et landing pages fonctionnelles réalisées grâce à la puissance des outils de génération IA.',
              price: 'Sur Devis Sur Mesure',
              color: { icon: 'bg-[#816C07]/15 border-[#816C07]/30 text-[#816C07]', label: 'text-[#816C07]', border: 'border-[#816C07]/30 hover:border-[#816C07]/70', foot: 'border-[#816C07]/20', price: 'text-[#816C07]' }
            },
          ].map(({ icon: Icon, label, title, desc, price, color }) => (
            <div key={title} className={`p-6 rounded-2xl bg-[#141c2e]/80 border ${color.border} transition-all space-y-4 flex flex-col justify-between backdrop-blur-md`}>
              <div className="space-y-4">
                <div className={`w-11 h-11 rounded-xl border flex items-center justify-center ${color.icon}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <span className={`text-[10px] font-extrabold uppercase tracking-widest ${color.label}`}>{label}</span>
                  <h3 className="text-base font-bold text-white mt-1">{title}</h3>
                </div>
                <p className="text-xs text-[#E5E7EB] leading-relaxed">{desc}</p>
              </div>
              <div className={`pt-4 border-t ${color.foot} flex items-center justify-between text-xs`}>
                <span className="text-[#D4C9BF]/80">Tarif</span>
                <span className={`font-extrabold font-mono ${color.price}`}>{price}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Call to Action final ── */}
      <section className="max-w-6xl mx-auto">
        <div className="relative p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[#141c2e] via-[#0d131f] to-[#141c2e] border border-[#816C07]/40 text-center space-y-6 shadow-2xl backdrop-blur-md overflow-hidden">
          <div className="absolute inset-0 bg-[#816C07]/4 pointer-events-none" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-[#816C07]/8 blur-3xl rounded-full pointer-events-none" />

          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-[#816C07]/25 border border-[#816C07]/50 mx-auto flex items-center justify-center text-[#816C07] mb-4">
              <Send className="w-7 h-7" />
            </div>
            <div className="space-y-2 max-w-xl mx-auto">
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                Prêt à discuter de votre projet ?
              </h3>
              <p className="text-[#D4C9BF] text-xs sm:text-sm">
                Soumettez votre brief en 3 minutes ou contactez directement <strong className="text-white">El Hadji Abdoulaye Niass</strong> au <strong className="text-[#816C07]">+221 77 623 27 41</strong>.
              </p>
            </div>
            <button
              onClick={onStartBrief}
              className="mt-6 px-8 py-4 rounded-xl font-serif font-bold text-[#F5F5DC] bg-gradient-to-r from-[#816C07] to-[#a38b12] hover:from-[#927b08] hover:to-[#b59b15] shadow-xl transition-all hover:scale-105 inline-flex items-center gap-2 text-sm border border-[#816C07]/60"
            >
              <span>Démarrer le Formulaire de Brief</span>
              <ArrowRight className="w-4 h-4 text-[#F5F5DC]" />
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
