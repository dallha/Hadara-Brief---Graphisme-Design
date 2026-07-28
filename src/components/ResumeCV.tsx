import React, { useState } from 'react';
import { HadaraLogo } from './HadaraLogo';
import { 
  User, 
  Briefcase, 
  GraduationCap, 
  Sparkles, 
  Award, 
  Globe, 
  Phone, 
  Mail, 
  MapPin, 
  Video, 
  Palette, 
  Bot, 
  Printer, 
  CheckCircle2, 
  ExternalLink, 
  MessageSquare, 
  ChevronRight, 
  Download,
  Star,
  Layers,
  Megaphone,
  BookOpen,
  Monitor,
  Film,
  Heart,
  Target,
  Check,
  QrCode,
  Lightbulb,
  Clock
} from 'lucide-react';

interface ResumeCVProps {
  onGoToBrief?: () => void;
  onGoToPortfolio?: () => void;
}

export const ResumeCV: React.FC<ResumeCVProps> = ({ onGoToBrief, onGoToPortfolio }) => {
  const [viewMode, setViewMode] = useState<'interactive' | 'ats'>('interactive');
  const [activeTab, setActiveTab] = useState<'expertise' | 'experience' | 'education' | 'qualities'>('expertise');

  const expertiseDomains = [
    {
      category: 'Identité Visuelle & Branding',
      icon: Palette,
      color: 'from-amber-500/20 to-amber-950/40 border-amber-500/40 text-amber-400',
      items: ['Création de logos', 'Branding & Identité de marque', 'Charte graphique complète', 'Régénération d’identité']
    },
    {
      category: 'Communication Événementielle',
      icon: Megaphone,
      color: 'from-emerald-500/20 to-emerald-950/40 border-emerald-500/40 text-emerald-400',
      items: ['Affiches d’impact', 'Flyers & Dépliants', 'Brochures & Magazines', 'Programmes & Invitations', 'Certificats & Diplômes']
    },
    {
      category: 'Supports Publicitaires Grand Format',
      icon: Layers,
      color: 'from-blue-500/20 to-blue-950/40 border-blue-500/40 text-blue-400',
      items: ['Bâches grand format (Ziarra, Gamou, Magal)', 'Roll-up & Kakémonos', 'Panneaux & Enseignes', 'Signalétique événementielle']
    },
    {
      category: 'Communication Digitale & Social Media',
      icon: Globe,
      color: 'from-purple-500/20 to-purple-950/40 border-purple-500/40 text-purple-400',
      items: ['Visuels Facebook, Instagram, LinkedIn', 'Stories dynamiques', 'Bannières de couverture', 'Miniatures YouTube d’impact']
    },
    {
      category: 'Création Audiovisuelle & Montage',
      icon: Video,
      color: 'from-rose-500/20 to-rose-950/40 border-rose-500/40 text-rose-400',
      items: ['Montage vidéo (Premiere Pro)', 'Sous-titrage dynamique', 'Habillage graphique', 'Formatage réseaux (Reels, TikTok)']
    },
    {
      category: 'Création de Sites Web via IA',
      icon: Monitor,
      color: 'from-teal-500/20 to-teal-950/40 border-teal-500/40 text-teal-400',
      items: ['Sites vitrines modernes', 'Pages de présentation', 'Interfaces épurées', 'Conception assistée par l’IA']
    }
  ];

  const adobeSkills = [
    { name: 'Adobe Photoshop', level: 98, desc: 'Retouche photo HD, photomontage d’impact, visuels réseaux & affiches' },
    { name: 'Adobe Illustrator', level: 95, desc: 'Dessin vectoriel, logos, chartes graphiques & bâches grand format' },
    { name: 'Adobe InDesign', level: 92, desc: 'Mise en page éditoriale, catalogues, magazines, brochures & fichiers interactifs' },
    { name: 'Adobe Premiere Pro', level: 90, desc: 'Montage vidéo professionnel, découpe, sous-titrage & rythmes' },
    { name: 'Adobe Lightroom', level: 88, desc: 'Étalonnage colorimétrique & développement photo' },
    { name: 'Adobe Acrobat Pro', level: 95, desc: 'Gestion avancée des PDF, contrôle pré-presse & préparation HD' },
    { name: 'Adobe After Effects', level: 75, desc: 'Motion design de base, habillage graphique & titres animés (notions)' }
  ];

  const aiSkills = [
    'Création graphique & génération d’images (Midjourney, DALL-E)',
    'Conception de sites web vitrines assistée par l’IA',
    'Rédaction de contenus & prompt engineering (ChatGPT, Gemini)',
    'Optimisation du processus créatif & automatisation des briefs'
  ];

  const experiences = [
    {
      role: 'Graphiste & Designer Visuel',
      company: 'Institut AlMouyassar Litahfizil Alqur',
      period: 'Poste Actuel / Employé',
      location: 'Dakar, Sénégal',
      badge: 'Institutionnel',
      highlights: [
        'Conception des identités visuelles, affiches, diplômes, certificats et supports de communication de l’institut.',
        'Mise en page des publications institutionnelles et des supports pédagogiques coraniques.',
        'Supervision de la charte graphique et de la présence digitale de l’institut.'
      ]
    },
    {
      role: 'Graphiste Freelance',
      company: 'Le Graphiste de la Hadara',
      period: '2020 – Présent',
      location: 'Dakar, Sénégal / International',
      badge: 'Activité Principale',
      highlights: [
        'Création d’identités visuelles professionnelles et chartes graphiques sur-mesure.',
        'Conception d’affiches d’impact et bâches grand format (Ziarra, Gamou, Magal, événements institutionnels).',
        'Réalisation de supports publicitaires imprimés (flyers, brochures, kakémonos, diplômes).',
        'Communication visuelle globale alliant tradition et modernité pour événements religieux, culturels et entreprises.',
        'Création de contenus captivants pour les réseaux sociaux (visuels & vidéos).',
        'Préparation rigoureuse des fichiers HD destinés à l’impression professionnelle.',
        'Accompagnement personnalisé des clients de la conception à la livraison finale.'
      ]
    },
    {
      role: 'Gérant Multiservices',
      company: 'Point Service & Commerce Digital',
      period: '2014 – 2017',
      location: 'Sénégal',
      badge: 'Gestion & Service Client',
      highlights: [
        'Gestion complète d’un point multiservices de proximité.',
        'Paiement de factures et opérations de transferts d’argent.',
        'Gestion de la relation clientèle, accueil et fidélisation.',
        'Gestion administrative et suivi financier quotidien.'
      ]
    }
  ];

  const education = [
    {
      title: 'Diplôme d’Imam',
      institution: 'Institut Mohammed VI pour la Formation des Imams, Mourchidines et Mourchidates',
      year: '2020',
      desc: 'Formation académique et religieuse d’excellence.'
    },
    {
      title: 'Formation en Informatique, Maintenance & Bureautique',
      institution: 'Centre de Formation Professionnelle',
      year: '2013',
      desc: 'Bureautique avancée, maintenance système et bases informatiques.'
    },
    {
      title: 'Baccalauréat',
      institution: 'École Al-Azhar (Le Caire, Égypte)',
      year: '2013',
      desc: 'Diplôme de fin d’études secondaires.'
    },
    {
      title: 'Brevet de Fin d’Études Moyennes (BFEM)',
      institution: 'Al-Azhar (Le Caire, Égypte)',
      year: '2008',
      desc: 'Études secondaires de premier cycle.'
    },
    {
      title: 'Diplôme de Fin d’Études Élémentaires (CFEE)',
      institution: 'Institut Islamique Franco-Arabe (Sénégal)',
      year: '2005',
      desc: 'Enseignement primaire franco-arabe.'
    }
  ];

  const certifications = [
    {
      title: 'Interactive Files in Adobe InDesign',
      org: 'Khayal Academy',
      year: '2021',
      file: 'mrniass-Interactive-Files-In-Indesign-Khayal-Academy-Certificate-Khayal-Academy.pdf'
    },
    {
      title: 'Adobe Photoshop 2021',
      org: 'Khayal Academy',
      year: '2022',
      file: 'Certificat Adobe Photoshop 2021'
    },
    {
      title: 'Graphs in Adobe Illustrator',
      org: 'Khayal Academy',
      year: '2022',
      file: 'mrniass-Graphs-in-Adobe-Illustrator-Khayal-Academy-Certificate-Khayal-Academy.pdf'
    },
    {
      title: 'Script in Adobe Illustrator',
      org: 'Khayal Academy',
      year: '2024',
      file: 'alskrybt-fy-alalystrytwr-__-Script-in-illustrator-certificate.pdf'
    },
    {
      title: 'Learn Basics of Adobe After Effects CC 2022 for Beginners',
      org: 'Udemy',
      year: '2022',
      file: 'basic adobe after effe CD.pdf'
    },
    {
      title: 'American English Language and Accent (13,5 Heures)',
      org: 'Udemy',
      year: '2022',
      file: 'UC-516f7ea7-89d3-4026-84f0-171371943e12.pdf'
    }
  ];

  const languages = [
    { name: 'Français', level: 'Langue Principale (Courant / Bilingue - Rédaction & Communication)', score: '100%' },
    { name: 'Arabe', level: 'Langue Secondaire (Courant / Bilingue - Textes & Calligraphie)', score: '98%' },
    { name: 'Wolof', level: 'Langue Maternelle', score: '100%' },
    { name: 'Anglais', level: 'Niveau Professionnel (Lecture & Compréhension)', score: '75%' },
  ];

  const qualities = [
    'Créativité & Innovation',
    'Sens aigu du détail & esthétique',
    'Organisation & Rigueur',
    'Esprit d’analyse & Écoute client',
    'Gestion du temps & Respect des délais',
    'Autonomie & Esprit d’équipe',
    'Capacité d’adaptation rapide',
    'Apprentissage continu (Autoformation)'
  ];

  const interests = [
    'Lecture et étude du Saint Coran',
    'Design graphique & Typographie',
    'Communication visuelle & Branding',
    'Technologies numériques & Innovation',
    'Intelligence artificielle créative',
    'Montage vidéo & Cinéma',
    'Football'
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      
      {/* View Switcher Toolbar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl print:hidden">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-emerald-500 p-0.5 shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <User className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-100">
              CV & Profil Professionnel — El Hadji Abdoulaye Mouhamed Lamine Niass
            </h1>
            <p className="text-xs text-slate-400">
              Le Graphiste de la Hadara | Design Graphique, Adobe CC, Montage Vidéo & Web IA
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('interactive')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              viewMode === 'interactive'
                ? 'bg-amber-400 text-slate-950 shadow-lg'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Mini-Site CV Interactif</span>
          </button>

          <button
            onClick={() => setViewMode('ats')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              viewMode === 'ats'
                ? 'bg-emerald-500 text-slate-950 shadow-lg'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>Format Classique ATS / Imprimable</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: INTERACTIVE MINI-SITE CV */}
      {/* ========================================================================= */}
      {viewMode === 'interactive' && (
        <div className="space-y-12 print:hidden">
          
          {/* Hero Header Card */}
          <section className="relative overflow-hidden p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 border border-emerald-800/60 shadow-2xl space-y-8">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            
            {/* Quranic Verse Banner */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-center space-y-1">
              <p className="text-amber-300 font-serif text-lg sm:text-xl font-bold tracking-wider dir-rtl" lang="ar">
                ﴿وَمَا تَوْفِيقِي إِلَّا بِاللَّهِ﴾
              </p>
              <p className="text-amber-200/90 text-xs italic font-serif">
                « Ma réussite ne dépend que d’Allah. » (Sourate Hûd, verset 88)
              </p>
            </div>

            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              {/* Profile Badge */}
              <div className="relative shrink-0">
                <HadaraLogo size="xl" className="w-36 h-36 sm:w-44 sm:h-44 shadow-2xl" />
                <div className="absolute -bottom-2 -right-2 px-3 py-1 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-lg flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" />
                  <span>Disponible</span>
                </div>
              </div>

              {/* Bio & Information */}
              <div className="space-y-4 text-center md:text-left flex-1">
                <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Le Graphiste de la Hadara</span>
                </div>

                <h1 className="text-2xl sm:text-4xl font-serif font-extrabold text-slate-100 tracking-tight">
                  El Hadji Abdoulaye Mouhamed Lamine Niass
                </h1>

                <p className="text-amber-400 font-semibold text-xs sm:text-base leading-snug">
                  Graphiste | Créateur d’identités visuelles | Monteur vidéo | Créateur de sites web assisté par l’IA
                </p>

                <p className="text-slate-300 text-xs sm:text-sm max-w-3xl leading-relaxed">
                  Graphiste créatif spécialisé dans la conception d’identités visuelles, la communication événementielle (affiches & bâches grand format) et les supports publicitaires. J'accompagne les entreprises, associations et institutions avec la suite Adobe et l'intelligence artificielle.
                </p>

                {/* Contact Pills */}
                <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-2.5 text-xs text-slate-300">
                  <span className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>Dakar, Sénégal</span>
                  </span>

                  <a 
                    href="https://wa.me/221776232741" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/90 border border-emerald-800 text-emerald-300 font-bold hover:bg-emerald-900 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>+221 77 623 27 41</span>
                  </a>

                  <a 
                    href="mailto:mrniass@gmail.com" 
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-950/90 border border-blue-800 text-blue-300 font-bold hover:bg-blue-900 transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 text-blue-400" />
                    <span>mrniass@gmail.com</span>
                  </a>

                  <a 
                    href="mailto:abouniass@hotmail.com" 
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-950/90 border border-blue-800 text-blue-300 font-bold hover:bg-blue-900 transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 text-blue-400" />
                    <span>abouniass@hotmail.com</span>
                  </a>
                </div>

                {/* Buttons */}
                <div className="pt-4 flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <button
                    onClick={() => setViewMode('ats')}
                    className="px-5 py-3 rounded-xl font-bold text-slate-950 text-xs bg-amber-400 hover:bg-amber-300 transition-all flex items-center space-x-2 shadow-lg"
                  >
                    <Download className="w-4 h-4" />
                    <span>Télécharger / Imprimer CV (ATS)</span>
                  </button>

                  <a
                    href="https://wa.me/221776232741?text=Bonjour%20El%20Hadji%20Abdoulaye%20Niass,%20je%20souhaite%20discuter%20d'un%20projet."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-3 rounded-xl font-bold text-emerald-300 text-xs bg-emerald-950 hover:bg-emerald-900 border border-emerald-700 transition-all flex items-center space-x-2 shadow-lg"
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                    <span>WhatsApp Direct</span>
                  </a>

                  {onGoToPortfolio && (
                    <button
                      onClick={onGoToPortfolio}
                      className="px-5 py-3 rounded-xl font-semibold text-slate-200 text-xs bg-slate-900 hover:bg-slate-800 border border-slate-700 transition-all flex items-center space-x-2"
                    >
                      <Palette className="w-4 h-4 text-amber-400" />
                      <span>Découvrir le Portfolio</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Profil & Objectif Professionnel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
                <User className="w-5 h-5" />
                <span>À Propos & Résumé du Profil</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Graphiste créatif spécialisé dans la conception d’identités visuelles, la communication événementielle et les supports publicitaires. J’accompagne les entreprises, associations, institutions et organisateurs d’événements dans la création de visuels élégants, stratégiques et adaptés à leurs objectifs. Je réalise également des montages vidéo et conçois des sites web vitrines avec l’assistance de l’IA.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-b from-emerald-950/60 to-slate-900/90 border border-emerald-700/60 space-y-3">
              <div className="flex items-center space-x-2 text-emerald-300 font-bold text-sm">
                <Target className="w-5 h-5" />
                <span>Objectif Professionnel</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed italic">
                « Mettre mes compétences en design graphique, communication visuelle et création de contenus au service de projets ambitieux, tout en contribuant à valoriser les marques, les institutions et les événements grâce à des créations modernes, élégantes et porteuses de sens. »
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
            <button
              onClick={() => setActiveTab('expertise')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                activeTab === 'expertise'
                  ? 'bg-amber-400 text-slate-950 shadow-lg'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Domaines d’Expertise & Logiciels</span>
            </button>

            <button
              onClick={() => setActiveTab('experience')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                activeTab === 'experience'
                  ? 'bg-amber-400 text-slate-950 shadow-lg'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Expériences Professionnelles</span>
            </button>

            <button
              onClick={() => setActiveTab('education')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                activeTab === 'education'
                  ? 'bg-amber-400 text-slate-950 shadow-lg'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Formations & Certifications</span>
            </button>

            <button
              onClick={() => setActiveTab('qualities')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                activeTab === 'qualities'
                  ? 'bg-amber-400 text-slate-950 shadow-lg'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Langues, Qualités & Intérêts</span>
            </button>
          </div>

          {/* TAB 1: DOMAINES D'EXPERTISE & LOGICIELS */}
          {activeTab === 'expertise' && (
            <div className="space-y-10">
              
              {/* Domaines d'Expertise */}
              <div className="space-y-4">
                <h3 className="text-lg font-serif font-bold text-slate-100 flex items-center space-x-2">
                  <Palette className="w-5 h-5 text-amber-400" />
                  <span>6 Domaines d’Expertise Globale</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {expertiseDomains.map((exp, i) => {
                    const IconComp = exp.icon;
                    return (
                      <div 
                        key={i} 
                        className={`p-5 rounded-2xl bg-gradient-to-b ${exp.color} border space-y-3 flex flex-col justify-between`}
                      >
                        <div className="space-y-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-center">
                            <IconComp className="w-5 h-5" />
                          </div>
                          <h4 className="text-sm font-bold text-slate-100">{exp.category}</h4>
                          <ul className="space-y-1.5 pt-1">
                            {exp.items.map((item, idx) => (
                              <li key={idx} className="flex items-center space-x-2 text-xs text-slate-300">
                                <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Compétences Adobe CC & IA */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Adobe Suite */}
                <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5">
                  <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
                    <Palette className="w-5 h-5" />
                    <span>Adobe Creative Cloud</span>
                  </div>

                  <div className="space-y-4">
                    {adobeSkills.map((sk, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-200">{sk.name}</span>
                          <span className="text-amber-400 font-mono font-bold">{sk.level}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden p-0.5 border border-slate-800">
                          <div 
                            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-400" 
                            style={{ width: `${sk.level}%` }} 
                          />
                        </div>
                        <p className="text-[11px] text-slate-400">{sk.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Intelligence Artificielle */}
                <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5">
                  <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
                    <Bot className="w-5 h-5" />
                    <span>Intelligence Artificielle & Digital</span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    Utilisation professionnelle et éthique de l’IA pour optimiser les flux de création, accélérer la production et proposer des fonctionnalités innovantes :
                  </p>

                  <ul className="space-y-3">
                    {aiSkills.map((item, idx) => (
                      <li key={idx} className="flex items-start space-x-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-200">
                        <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-2 p-4 rounded-xl bg-emerald-950/50 border border-emerald-800/60 text-xs text-emerald-300 space-y-1">
                    <span className="font-bold">Processus Hybride Gagnant :</span>
                    <p className="text-[11px] text-slate-300">
                      L'IA génère les idées et prototypes rapides, tandis que ma maîtrise d'Adobe Photoshop et Illustrator garantit une finition professionnelle de qualité impression HD.
                    </p>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: EXPÉRIENCES PROFESSIONNELLES */}
          {activeTab === 'experience' && (
            <div className="space-y-6">
              <h3 className="text-lg font-serif font-bold text-slate-100 flex items-center space-x-2">
                <Briefcase className="w-5 h-5 text-amber-400" />
                <span>Expériences Professionnelles</span>
              </h3>

              <div className="space-y-6 relative border-l-2 border-emerald-800/80 pl-6 ml-2">
                {experiences.map((exp, idx) => (
                  <div key={idx} className="relative space-y-3 group">
                    <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-amber-400 border-4 border-slate-950 group-hover:scale-125 transition-transform" />

                    <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-emerald-700/60 transition-all space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">{exp.company}</span>
                          <h4 className="text-lg font-bold text-slate-100">{exp.role}</h4>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="px-3 py-1 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs font-bold">
                            {exp.period}
                          </span>
                          <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-[10px] font-semibold">
                            {exp.location}
                          </span>
                        </div>
                      </div>

                      <ul className="space-y-2 pt-2">
                        {exp.highlights.map((item, i) => (
                          <li key={i} className="flex items-start space-x-2 text-xs text-slate-300">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: FORMATIONS & CERTIFICATIONS */}
          {activeTab === 'education' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Formations */}
              <div className="space-y-4">
                <h3 className="text-lg font-serif font-bold text-slate-100 flex items-center space-x-2">
                  <GraduationCap className="w-5 h-5 text-amber-400" />
                  <span>Formations & Diplômes</span>
                </h3>

                <div className="space-y-3">
                  {education.map((edu, idx) => (
                    <div key={idx} className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-400">{edu.institution}</span>
                        <span className="text-[11px] font-mono font-bold text-slate-400 px-2 py-0.5 rounded bg-slate-950">
                          {edu.year}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-100">{edu.title}</h4>
                      <p className="text-xs text-slate-400">{edu.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Certifications Khayal & Udemy */}
              <div className="space-y-4">
                <h3 className="text-lg font-serif font-bold text-slate-100 flex items-center space-x-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  <span>Certifications Professionnelles (Adobe & Udemy)</span>
                </h3>

                <div className="space-y-3">
                  {certifications.map((cert, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-emerald-400">{cert.org}</span>
                        <span className="text-[10px] font-mono bg-slate-950 px-2 py-0.5 rounded text-slate-400">{cert.year}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-100">{cert.title}</h4>
                      <p className="text-[10px] text-slate-400 flex items-center space-x-1">
                        <Star className="w-3 h-3 text-amber-400" />
                        <span>Certificat officiel vérifié ({cert.file})</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: LANGUES, QUALITÉS & INTÉRÊTS */}
          {activeTab === 'qualities' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Langues */}
              <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
                <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
                  <Globe className="w-5 h-5" />
                  <span>Langues Parlées</span>
                </div>

                <div className="space-y-3">
                  {languages.map((lang, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-100">{lang.name}</span>
                        <span className="text-emerald-400">{lang.score}</span>
                      </div>
                      <p className="text-[11px] text-slate-400">{lang.level}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Qualités Professionnelles */}
              <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
                <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
                  <Award className="w-5 h-5" />
                  <span>Qualités & Soft Skills</span>
                </div>

                <ul className="space-y-2">
                  {qualities.map((q, idx) => (
                    <li key={idx} className="flex items-center space-x-2 text-xs text-slate-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Centres d'intérêt */}
              <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
                <div className="flex items-center space-x-2 text-purple-400 font-bold text-sm">
                  <Heart className="w-5 h-5" />
                  <span>Centres d’Intérêt</span>
                </div>

                <ul className="space-y-2">
                  {interests.map((int, idx) => (
                    <li key={idx} className="flex items-center space-x-2 text-xs text-slate-300">
                      <Star className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{int}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: CLASSIC ATS SINGLE-PAGE PRINTABLE CV */}
      {/* ========================================================================= */}
      {viewMode === 'ats' && (
        <div className="space-y-6">
          
          <div className="flex items-center justify-between bg-slate-900 p-4 rounded-2xl border border-slate-800 print:hidden">
            <div className="flex items-center space-x-2 text-xs text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Format classique ATS épuré — Cliquez sur Imprimer pour sauvegarder en PDF</span>
            </div>
            <button
              onClick={handlePrint}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center space-x-2 shadow-lg"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimer / Exporter PDF</span>
            </button>
          </div>

          {/* Printable Sheet */}
          <div className="bg-white text-slate-900 p-8 sm:p-12 rounded-2xl shadow-2xl space-y-6 font-sans text-xs max-w-4xl mx-auto print:p-0 print:shadow-none print:bg-transparent print:text-black">
            
            {/* Verse Citation */}
            <div className="text-center pb-2 border-b border-slate-200">
              <p className="font-serif text-sm font-bold text-slate-800">
                ﴿وَمَا تَوْفِيقِي إِلَّا بِاللَّهِ﴾
              </p>
              <p className="text-[10px] text-slate-600 italic">
                « Ma réussite ne dépend que d’Allah. » (Sourate Hûd, verset 88)
              </p>
            </div>

            {/* Header */}
            <div className="border-b-2 border-slate-800 pb-4 space-y-2 text-center sm:text-left">
              <h1 className="text-2xl font-bold uppercase tracking-wider text-slate-900 font-serif">
                EL HADJI ABDOULAYE MOUHAMED LAMINE NIASS
              </h1>
              <p className="text-xs font-bold text-slate-700">
                Graphiste | Créateur d’identités visuelles | Monteur vidéo | Créateur de sites web assisté par l’IA
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-[11px] text-slate-600 pt-1">
                <span>📍 Dakar, Sénégal</span>
                <span>•</span>
                <span>📞 +221 77 623 27 41</span>
                <span>•</span>
                <span>✉️ mrniass@gmail.com | abouniass@hotmail.com</span>
              </div>
            </div>

            {/* Profil */}
            <div className="space-y-1">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
                PROFIL
              </h2>
              <p className="text-slate-700 text-[11px] leading-relaxed pt-1">
                Graphiste créatif spécialisé dans la conception d’identités visuelles, la communication événementielle et les supports publicitaires. J’accompagne les entreprises, associations, institutions et organisateurs d’événements dans la création de visuels élégants, stratégiques et adaptés à leurs objectifs. Je réalise également des montages vidéo et conçois des sites web vitrines avec l’assistance des technologies d’intelligence artificielle afin de proposer des solutions modernes, rapides et efficaces.
              </p>
            </div>

            {/* Domaines d'Expertise */}
            <div className="space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
                DOMAINES D’EXPERTISE
              </h2>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700">
                <div><strong>Identité visuelle:</strong> Logos, Branding, Charte graphique, Identité de marque</div>
                <div><strong>Communication événementielle:</strong> Affiches, Flyers, Dépliants, Brochures, Magazines, Invitations, Certificats</div>
                <div><strong>Supports publicitaires:</strong> Bâches grand format, Roll-up, Kakémonos, Panneaux, Signalétique</div>
                <div><strong>Communication digitale:</strong> Publications Facebook, Instagram, LinkedIn, Stories, Bannières, Miniatures YouTube</div>
                <div><strong>Création audiovisuelle:</strong> Montage vidéo, Sous-titrage, Habillage graphique, Formats réseaux sociaux</div>
                <div><strong>Création de sites web:</strong> Sites vitrines, Pages de présentation, Interfaces modernes, Conception assistée par l’IA</div>
              </div>
            </div>

            {/* Compétences Techniques */}
            <div className="space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
                COMPÉTENCES TECHNIQUES
              </h2>
              <div className="text-[11px] text-slate-700 space-y-1">
                <p><strong>Adobe Creative Cloud:</strong> Photoshop, Illustrator, InDesign, Premiere Pro, Lightroom, Acrobat Pro, After Effects (notions)</p>
                <p><strong>Intelligence Artificielle:</strong> Création graphique, génération d’images, création de contenus, conception de sites web, optimisation du processus créatif</p>
              </div>
            </div>

            {/* Expérience Professionnelle */}
            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
                EXPÉRIENCE PROFESSIONNELLE
              </h2>

              <div className="space-y-1">
                <div className="flex justify-between items-baseline font-bold text-slate-900">
                  <span>Graphiste Freelance — Le Graphiste de la Hadara</span>
                  <span>2020 – Présent</span>
                </div>
                <ul className="list-disc list-inside text-slate-700 text-[11px] space-y-0.5">
                  <li>Création d’identités visuelles professionnelles.</li>
                  <li>Conception d’affiches et de bâches grand format.</li>
                  <li>Réalisation de supports publicitaires imprimés.</li>
                  <li>Communication visuelle pour événements religieux, institutionnels et culturels.</li>
                  <li>Création de contenus pour les réseaux sociaux.</li>
                  <li>Préparation des fichiers HD destinés à l’impression.</li>
                  <li>Accompagnement des clients de la conception jusqu’à la livraison finale.</li>
                </ul>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-baseline font-bold text-slate-900">
                  <span>Gérant Multiservices — Sénégal</span>
                  <span>2014 – 2017</span>
                </div>
                <ul className="list-disc list-inside text-slate-700 text-[11px] space-y-0.5">
                  <li>Gestion d’un point multiservices, paiement de factures, transferts d’argent.</li>
                  <li>Relation clientèle, gestion administrative et financière.</li>
                </ul>
              </div>
            </div>

            {/* Formations & Certifications */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
                  FORMATIONS
                </h2>
                <div className="text-[11px] text-slate-700 space-y-1 pt-1">
                  <p><strong>Diplôme d’Imam:</strong> Institut Mohammed VI (2020)</p>
                  <p><strong>Informatique & Bureautique:</strong> Formation (2013)</p>
                  <p><strong>Baccalauréat:</strong> École Al-Azhar, Le Caire (2013)</p>
                  <p><strong>BFEM:</strong> Al-Azhar, Le Caire (2008)</p>
                  <p><strong>CFEE:</strong> Institut islamique franco-arabe (2005)</p>
                </div>
              </div>

              <div className="space-y-1">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
                  CERTIFICATIONS PROFESSIONNELLES
                </h2>
                <div className="text-[11px] text-slate-700 space-y-1 pt-1">
                  <p><strong>Khayal Academy:</strong> Interactive Files in InDesign (2021), Photoshop 2021 (2022), Graphs in Illustrator (2022), Script in Illustrator (2024)</p>
                  <p><strong>Udemy:</strong> Adobe After Effects CC 2022, American English Language & Accent (13,5h)</p>
                </div>
              </div>
            </div>

            {/* Langues & Qualités */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
                  LANGUES
                </h2>
                <p className="text-[11px] text-slate-700 pt-1">
                  Arabe • Français • Wolof (Maternelle) • Anglais (En progression)
                </p>
              </div>

              <div className="space-y-1">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
                  QUALITÉS & INTÉRÊTS
                </h2>
                <p className="text-[11px] text-slate-700 pt-1">
                  Créativité, Sens du détail, Organisation, Autonomie, Apprentissage continu • Étude du Coran, Design, IA, Montage vidéo, Football
                </p>
              </div>
            </div>

            {/* Footer ATS */}
            <div className="border-t border-slate-300 pt-3 text-center text-[10px] text-slate-700">
              <p>CV Officiel de El Hadji Abdoulaye Mouhamed Lamine Niass — Le Graphiste de la Hadara • Dakar, Sénégal</p>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
