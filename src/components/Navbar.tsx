import React, { useState, useEffect, useRef } from 'react';
import { FilePlus, LayoutDashboard, Sparkles, FolderKanban, Home, PlusCircle, UserCheck, Sun, Moon, Laptop, ChevronDown, Check } from 'lucide-react';
import { HadaraLogo } from './HadaraLogo';

interface NavbarProps {
  activeTab: 'splash' | 'home' | 'brief' | 'portfolio' | 'admin' | 'confirmation' | 'cv';
  setActiveTab: (tab: 'splash' | 'home' | 'brief' | 'portfolio' | 'admin' | 'confirmation' | 'cv') => void;
  briefsCount: number;
  newBriefsCount: number;
}

type ThemeMode = 'dark' | 'light' | 'system';

const THEME_OPTIONS: { id: ThemeMode; label: string; desc: string; icon: React.ReactNode }[] = [
  {
    id: 'system',
    label: 'Système',
    desc: 'Suit le thème de votre appareil',
    icon: <Laptop className="w-4 h-4" />,
  },
  {
    id: 'dark',
    label: 'Sombre Hadara',
    desc: 'Mode nuit premium',
    icon: <Moon className="w-4 h-4" />,
  },
  {
    id: 'light',
    label: 'Parchemin Lumineux',
    desc: 'Mode jour élégant',
    icon: <Sun className="w-4 h-4" />,
  },
];

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  briefsCount,
}) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('hadara_theme') as ThemeMode;
    return saved || 'dark';
  });
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const applyTheme = (mode: ThemeMode) => {
      let resolved: 'dark' | 'light' = 'dark';
      if (mode === 'system') {
        resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      } else {
        resolved = mode;
      }
      document.documentElement.setAttribute('data-theme', resolved);
      localStorage.setItem('hadara_theme', mode);
    };

    applyTheme(themeMode);

    if (themeMode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme('system');
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [themeMode]);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) {
        setThemeMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selectTheme = (mode: ThemeMode) => {
    setThemeMode(mode);
    setThemeMenuOpen(false);
  };

  const currentTheme = THEME_OPTIONS.find(t => t.id === themeMode)!;

  const handleTabChange = (tab: 'home' | 'brief' | 'portfolio' | 'admin' | 'cv') => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-[#0d131f]/92 backdrop-blur-xl border-b border-[#335A79]/30 text-[#F8F8F8] py-3 px-4 sm:px-6 lg:px-8 transition-colors shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">

          {/* Brand Logo & Studio Identity */}
          <div
            onClick={() => handleTabChange('home')}
            className="flex items-center space-x-3 cursor-pointer group shrink-0"
          >
            <HadaraLogo size="md" />
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-serif text-base sm:text-lg lg:text-xl font-bold text-[#F5F5DC] tracking-wide group-hover:text-[#816C07] transition-colors">
                  Le Graphiste de la Hadara
                </span>
                <span className="hidden xl:inline-flex text-[9px] uppercase font-serif font-bold tracking-widest px-2 py-0.5 rounded-md bg-[#816C07]/20 text-[#F5F5DC] border border-[#816C07]/30">
                  Dakar • Sénégal
                </span>
              </div>
              <p className="text-[11px] text-[#D4C9BF] hidden sm:block font-medium">
                El Hadji Abdoulaye Niass — Identité Visuelle & Design Studio
              </p>
            </div>
          </div>

          {/* Desktop Central Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {[
              { tab: 'home' as const, label: 'Accueil', icon: <Home className="w-4 h-4" /> },
              { tab: 'portfolio' as const, label: 'Portfolio', icon: <FolderKanban className="w-4 h-4" /> },
              { tab: 'cv' as const, label: 'Mon CV Pro', icon: <UserCheck className="w-4 h-4" /> },
            ].map(({ tab, label, icon }) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`px-3.5 py-2 rounded-xl text-xs font-serif font-bold transition-all flex items-center space-x-2 relative ${
                  activeTab === tab
                    ? 'bg-[#816C07] text-[#F8F8F8] shadow-md border border-[#816C07]/60'
                    : 'text-[#D4C9BF] hover:bg-[#141c2e] hover:text-[#F8F8F8]'
                }`}
              >
                {icon}
                <span>{label}</span>
              </button>
            ))}
          </nav>

          {/* Action Tools & CTA */}
          <div className="flex items-center space-x-2 sm:space-x-3 text-xs shrink-0">

            {/* Smart Theme Selector */}
            <div className="relative" ref={themeMenuRef}>
              <button
                onClick={() => setThemeMenuOpen(prev => !prev)}
                title="Changer le thème"
                className="p-2 sm:px-3 sm:py-2 rounded-xl border border-[#335A79]/40 bg-[#141c2e]/80 hover:bg-[#335A79]/30 text-[#D4C9BF] hover:text-[#F8F8F8] transition-all flex items-center gap-2 shadow-sm"
              >
                <span className="text-[#816C07]">{currentTheme.icon}</span>
                <span className="hidden lg:inline font-serif text-[11px] font-semibold text-[#D4C9BF]">
                  {currentTheme.label}
                </span>
                <ChevronDown className={`w-3 h-3 hidden lg:block transition-transform duration-200 ${themeMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Panel */}
              {themeMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 z-50 rounded-2xl bg-[#0d131f] border border-[#335A79]/40 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="p-1.5 space-y-0.5">
                    {THEME_OPTIONS.map(option => (
                      <button
                        key={option.id}
                        onClick={() => selectTheme(option.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                          themeMode === option.id
                            ? 'bg-[#816C07]/20 border border-[#816C07]/40'
                            : 'hover:bg-[#141c2e] border border-transparent'
                        }`}
                      >
                        <span className={`${themeMode === option.id ? 'text-[#816C07]' : 'text-[#D4C9BF]'}`}>
                          {option.icon}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-serif font-bold truncate ${themeMode === option.id ? 'text-[#F5F5DC]' : 'text-[#D4C9BF]'}`}>
                            {option.label}
                          </p>
                          <p className="text-[10px] text-[#816C07]/80 truncate">{option.desc}</p>
                        </div>
                        {themeMode === option.id && (
                          <Check className="w-3.5 h-3.5 text-[#816C07] shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Primary Action Button: Créer un Brief */}
            <button
              onClick={() => handleTabChange('brief')}
              className={`px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl font-serif font-bold text-xs transition-all flex items-center space-x-2 shadow-lg active:scale-95 ${
                activeTab === 'brief'
                  ? 'bg-[#816C07] text-[#F8F8F8] border border-[#a38b12] ring-2 ring-[#816C07]/40'
                  : 'bg-gradient-to-r from-[#816C07] to-[#a38b12] hover:from-[#927b08] hover:to-[#b59b15] text-[#F8F8F8] border border-[#816C07]/50 shadow-[#816C07]/20 hover:scale-[1.02]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#F8F8F8] shrink-0" />
              <span className="hidden sm:inline">Nouveau Brief</span>
              <span className="sm:hidden">Brief</span>
            </button>
          </div>

        </div>
      </header>

      {/* Fixed Bottom Navigation Bar - Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#335A79]/92 backdrop-blur-xl border-t-2 border-x border-[#816C07]/60 px-3 py-2 shadow-2xl flex items-center justify-around max-w-md mx-auto rounded-t-2xl text-xs">

        {[
          { tab: 'home' as const, label: 'Accueil', icon: Home },
          { tab: 'cv' as const, label: 'CV Pro', icon: UserCheck },
        ].map(({ tab, label, icon: Icon }) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-all duration-200 group ${
              activeTab === tab
                ? 'bg-[#816C07] text-[#F5F5DC] font-bold shadow-md border border-[#816C07]'
                : 'text-[#F5F5DC]/90 hover:bg-[#816C07]/20'
            }`}
          >
            <Icon className={`w-4 h-4 ${activeTab === tab ? 'text-[#F5F5DC]' : 'text-[#816C07]'}`} />
            <span className="text-[10px] mt-0.5 tracking-tight font-serif font-bold text-[#F5F5DC]">{label}</span>
          </button>
        ))}

        {/* Central Primary Action */}
        <button
          onClick={() => handleTabChange('brief')}
          className={`flex flex-col items-center -mt-5 py-2 px-3.5 rounded-2xl transition-all duration-200 shadow-xl border ${
            activeTab === 'brief'
              ? 'bg-[#816C07] text-[#F5F5DC] font-black border-[#F5F5DC] scale-105 ring-2 ring-[#816C07]'
              : 'bg-gradient-to-r from-[#816C07] to-[#a38b12] text-[#F5F5DC] font-extrabold border-[#816C07] hover:scale-105'
          }`}
        >
          <PlusCircle className="w-5 h-5 text-[#F5F5DC]" />
          <span className="text-[10px] mt-0.5 font-serif font-black uppercase tracking-wider text-[#F5F5DC]">Brief</span>
        </button>

        {[
          { tab: 'portfolio' as const, label: 'Portfolio', icon: FolderKanban },
          { tab: 'cv' as const, label: 'CV Pro', icon: UserCheck },
        ].map(({ tab, label, icon: Icon }) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-all duration-200 group relative ${
              activeTab === tab
                ? 'bg-[#816C07] text-[#F5F5DC] font-bold shadow-md border border-[#816C07]'
                : 'text-[#F5F5DC]/90 hover:bg-[#816C07]/20'
            }`}
          >
            <div className="relative">
              <Icon className={`w-4 h-4 ${activeTab === tab ? 'text-[#F5F5DC]' : 'text-[#816C07]'}`} />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-serif font-bold text-[#F5F5DC]">{label}</span>
          </button>
        ))}

      </nav>
    </>
  );
};
