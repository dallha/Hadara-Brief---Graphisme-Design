import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FolderKanban, Home, PlusCircle, UserCheck, Sun, Moon, Laptop, ChevronDown, Check, Sparkles, User, Rocket } from 'lucide-react';
import { HadaraLogo } from './HadaraLogo';
import { cn } from '../utils/cn';

interface NavbarProps {
  activeTab: 'splash' | 'home' | 'brief' | 'portfolio' | 'admin' | 'confirmation' | 'cv' | 'client';
  setActiveTab: (tab: 'splash' | 'home' | 'brief' | 'portfolio' | 'admin' | 'confirmation' | 'cv' | 'client') => void;
  briefsCount: number;
  newBriefsCount: number;
}

type ThemeMode = 'dark' | 'light' | 'system';

const THEME_OPTIONS: { id: ThemeMode; label: string; desc: string; icon: React.ReactNode }[] = [
  { id: 'system', label: 'Système', desc: 'Auto', icon: <Laptop className="w-4 h-4" /> },
  { id: 'dark', label: 'Sombre', desc: 'Nuit', icon: <Moon className="w-4 h-4" /> },
  { id: 'light', label: 'Clair', desc: 'Jour', icon: <Sun className="w-4 h-4" /> },
];

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('hadara_theme') as ThemeMode;
    return saved || 'dark';
  });
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) {
        setThemeMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const currentTheme = THEME_OPTIONS.find(t => t.id === themeMode)!;

  const handleTabChange = (tab: any) => {
    setActiveTab(tab);
  };
  const navItems = [
    { id: 'home', label: 'Accueil', icon: Home },
    { id: 'portfolio', label: 'Prestations', icon: FolderKanban },
    { id: 'roadmap', label: 'Roadmap', icon: Rocket },
    { id: 'cv', label: 'CV', icon: UserCheck },
    { id: 'client', label: 'Suivi', icon: User },
  ];

  return (
    <>
      {/* DESKTOP FLOATING NAVBAR */}
      <header className="hidden md:flex fixed bottom-6 inset-x-0 z-50 justify-center px-4 pointer-events-none">
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className={cn(
            "pointer-events-auto flex items-center justify-between gap-6 px-4 py-3 rounded-full transition-all duration-500",
            scrolled 
              ? "bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 shadow-2xl shadow-black/20"
              : "bg-slate-950/80 backdrop-blur-lg border border-slate-800/80 shadow-2xl"
          )}
        >
          {/* Logo */}
          <div
            onClick={() => handleTabChange('home')}
            className="flex items-center space-x-3 cursor-pointer group shrink-0"
          >
            <HadaraLogo size="sm" className="w-10 h-10" />
            <div className={cn("flex flex-col transition-opacity duration-300", scrolled ? "opacity-0 w-0 overflow-hidden" : "opacity-100")}>
              <span className="font-serif text-lg font-bold text-slate-100 tracking-wide group-hover:text-amber-400 transition-colors">
                Hadara
              </span>
            </div>
          </div>

          {/* Links */}
          <nav className={cn(
            "flex items-center space-x-1 px-2 py-1.5 rounded-full transition-all duration-300",
            !scrolled && "bg-slate-900/60 backdrop-blur-md border border-slate-700/50"
          )}>
            {navItems.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => handleTabChange(id)}
                className="relative px-4 py-2 rounded-full text-sm font-medium transition-colors"
              >
                {activeTab === id && (
                  <motion.div
                    layoutId="desktop-active-tab"
                    className="absolute inset-0 bg-slate-800 rounded-full border border-slate-700"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className={cn(
                  "relative z-10 transition-colors duration-200 font-sans",
                  activeTab === id ? "text-amber-400 font-semibold" : "text-slate-300 hover:text-slate-100"
                )}>
                  {label === 'Suivi' ? 'Suivi Client' : label}
                </span>
              </button>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-3 shrink-0">
            {/* Theme Toggle */}
            <div className="relative" ref={themeMenuRef}>
              <button
                onClick={() => setThemeMenuOpen(prev => !prev)}
                className={cn(
                  "p-2.5 rounded-full transition-all flex items-center justify-center",
                  scrolled ? "bg-slate-800/50 hover:bg-slate-800 text-slate-300" : "bg-slate-900/60 backdrop-blur-md border border-slate-700/50 text-slate-300 hover:text-white"
                )}
              >
                {currentTheme.icon}
              </button>

              <AnimatePresence>
                {themeMenuOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 bottom-full mb-3 w-48 z-50 rounded-2xl bg-slate-900 border border-slate-700/50 shadow-xl overflow-hidden p-1.5"
                  >
                    {THEME_OPTIONS.map(option => (
                      <button
                        key={option.id}
                        onClick={() => { setThemeMode(option.id); setThemeMenuOpen(false); }}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all",
                          themeMode === option.id ? "bg-amber-400/10 text-amber-400" : "hover:bg-slate-800 text-slate-300"
                        )}
                      >
                        {option.icon}
                        <span className="text-sm font-medium flex-1">{option.label}</span>
                        {themeMode === option.id && <Check className="w-4 h-4" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Brief Button */}
            <button
              onClick={() => handleTabChange('brief')}
              className={cn(
                "px-5 py-2.5 rounded-full font-sans font-bold text-sm transition-all flex items-center space-x-2 shadow-lg hover:scale-105 active:scale-95",
                activeTab === 'brief'
                  ? "bg-slate-800 text-amber-400 border border-slate-700"
                  : "bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-amber-400/20"
              )}
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>Nouveau Brief</span>
            </button>
          </div>
        </motion.div>
      </header>

      {/* MOBILE BOTTOM NAVBAR (Ultra-Compact for Small Screens) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 pb-safe">
        <div className="bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 px-0.5 py-1 flex items-center justify-around shadow-[0_-10px_40px_rgba(0,0,0,0.3)]">
          {navItems.slice(0, 2).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => handleTabChange(id)}
              className={cn(
                "flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all duration-300 flex-1 min-w-0",
                activeTab === id ? "text-amber-400 font-bold" : "text-slate-400 hover:text-slate-200"
              )}
            >
              <Icon className={cn("w-4 h-4 sm:w-5 sm:h-5 mb-0.5 shrink-0 transition-transform", activeTab === id && "scale-110")} />
              <span className="text-[8px] sm:text-[10px] tracking-tight truncate w-full text-center">{label}</span>
            </button>
          ))}

          {/* Center Brief Action */}
          <div className="relative -top-4 shrink-0 px-0.5">
            <button
              onClick={() => handleTabChange('brief')}
              className={cn(
                "flex items-center justify-center w-11 h-11 sm:w-13 sm:h-13 rounded-full shadow-2xl transition-all duration-300 border-4 border-slate-950",
                activeTab === 'brief'
                  ? "bg-slate-800 text-amber-400 scale-105"
                  : "bg-amber-400 text-slate-950 hover:bg-amber-300 hover:scale-105 shadow-amber-400/30"
              )}
            >
              <PlusCircle className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {navItems.slice(2).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => handleTabChange(id)}
              className={cn(
                "flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all duration-300 flex-1 min-w-0",
                activeTab === id ? "text-amber-400 font-bold" : "text-slate-400 hover:text-slate-200"
              )}
            >
              <Icon className={cn("w-4 h-4 sm:w-5 sm:h-5 mb-0.5 shrink-0 transition-transform", activeTab === id && "scale-110")} />
              <span className="text-[8px] sm:text-[10px] tracking-tight truncate w-full text-center">{label}</span>
            </button>
          ))}

          {/* Small Theme Toggle in Mobile Nav */}
          <button
            onClick={() => {
              const newMode = themeMode === 'dark' ? 'light' : 'dark';
              setThemeMode(newMode);
            }}
            className="flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all duration-300 flex-1 min-w-0 text-slate-400"
          >
            {themeMode === 'dark' ? <Sun className="w-4 h-4 sm:w-5 sm:h-5 mb-0.5 shrink-0" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5 mb-0.5 shrink-0" />}
            <span className="text-[8px] sm:text-[10px] tracking-tight truncate w-full text-center">Thème</span>
          </button>
        </div>
      </nav>
    </>
  );
};
