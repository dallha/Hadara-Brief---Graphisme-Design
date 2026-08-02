/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from './components/Navbar';
import { LandingHero } from './components/LandingHero';
import { BriefForm } from './components/BriefForm';
import { BriefConfirmation } from './components/BriefConfirmation';
import { PortfolioShowcase } from './components/PortfolioShowcase';
import { AdminDashboard } from './components/AdminDashboard';
import { PrintableBrief } from './components/PrintableBrief';
import { ResumeCV } from './components/ResumeCV';
import { ClientPortalView } from './components/client/ClientPortalView';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { SplashEntry } from './components/SplashEntry';
import { RoadmapView } from './components/RoadmapView';
import { BriefData, BriefStatus, AIAnalysisResult, SamplePortfolioItem } from './types';

import { Lock, Eye, EyeOff, MapPin, Phone, Mail, Palette, User } from 'lucide-react';
import API_BASE from './config';
import { ErrorBoundary } from './components/ErrorBoundary';


// Derive active tab from URL path for Navbar highlighting
function pathToTab(pathname: string): string {
  if (pathname.startsWith('/brief')) return 'brief';
  if (pathname.startsWith('/portfolio')) return 'portfolio';
  if (pathname.startsWith('/roadmap')) return 'roadmap';
  if (pathname.startsWith('/admin')) return 'admin';
  if (pathname.startsWith('/cv')) return 'cv';
  if (pathname.startsWith('/confirmation')) return 'confirmation';
  if (pathname.startsWith('/espace-client') || pathname.startsWith('/portail-client') || pathname.startsWith('/suivi')) return 'client';
  return 'home';
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = pathToTab(location.pathname);

  const [briefs, setBriefs] = useState<BriefData[]>([]);
  const [currentBrief, setCurrentBrief] = useState<BriefData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [printableBrief, setPrintableBrief] = useState<BriefData | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    try {
      return !!sessionStorage.getItem('hadara_admin_token');
    } catch {
      return false;
    }
  });

  const [hasVisited, setHasVisited] = useState(false);

  const [adminUsernameInput, setAdminUsernameInput] = useState('');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminPasswordError, setAdminPasswordError] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // Brute-force state
  const [failedAttempts, setFailedAttempts] = useState(() => {
    try {
      return parseInt(localStorage.getItem('admin_failed_attempts') || '0', 10);
    } catch {
      return 0;
    }
  });
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(() => {
    try {
      const lockout = localStorage.getItem('admin_lockout_until');
      return lockout ? parseInt(lockout, 10) : null;
    } catch {
      return null;
    }
  });
  const [lockoutRemaining, setLockoutRemaining] = useState(0);

  // Countdown timer
  useEffect(() => {
    if (lockoutUntil) {
      const interval = setInterval(() => {
        const remaining = Math.max(0, Math.ceil((lockoutUntil - Date.now()) / 1000));
        setLockoutRemaining(remaining);
        if (remaining === 0) {
          setLockoutUntil(null);
          setFailedAttempts(0);
          localStorage.removeItem('admin_lockout_until');
          localStorage.removeItem('admin_failed_attempts');
          clearInterval(interval);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [lockoutUntil]);

  // Auto-logout
  useEffect(() => {
    if (!isAdminAuthenticated) return;
    let inactivityTimer: NodeJS.Timeout;
    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        setIsAdminAuthenticated(false);
        sessionStorage.removeItem('hadara_admin_token');
        navigate('/');
      }, 30 * 60 * 1000);
    };
    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart'];
    events.forEach(e => window.addEventListener(e, resetTimer));
    resetTimer();
    return () => {
      events.forEach(e => window.removeEventListener(e, resetTimer));
      clearTimeout(inactivityTimer);
    };
  }, [isAdminAuthenticated, navigate]);

  const goTo = (tab: string) => {
    const routes: Record<string, string> = {
      home: '/', brief: '/brief', portfolio: '/portfolio',
      admin: '/admin', cv: '/cv', confirmation: '/confirmation',
      client: '/espace-client',
    };
    navigate(routes[tab] || '/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [portfolioItems, setPortfolioItems] = useState<SamplePortfolioItem[]>([]);

  const fetchBriefs = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/briefs/`);
      if (res.ok) {
        const data = await res.json();
        setBriefs(Array.isArray(data) ? data : (data.briefs || []));
      }
    } catch (err) {
      console.warn('Could not connect to backend API.');
    }
  };

  const fetchPortfolio = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/portfolio/`);
      if (res.ok) {
        const data = await res.json();
        const items = Array.isArray(data) ? data : (data.results || data.portfolio || []);
        if (items.length > 0) setPortfolioItems(items);
      }
    } catch (err) {
      console.warn('Could not connect to portfolio backend API.');
    }
  };

  useEffect(() => { fetchBriefs(); fetchPortfolio(); }, []);

  useEffect(() => {
    if (activeTab === 'admin' && isAdminAuthenticated) {
      fetchBriefs();
      fetchPortfolio();
    }
  }, [activeTab, isAdminAuthenticated]);

  const handleAddPortfolioItem = async (newItem: Omit<SamplePortfolioItem, 'id'>) => {
    try {
      const res = await fetch(`${API_BASE}/api/portfolio/`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('hadara_admin_token')}`
        },
        body: JSON.stringify(newItem),
      });
      if (res.ok) {
        const created = await res.json();
        setPortfolioItems(prev => [created, ...prev]);
        return;
      }
    } catch (err) {
      console.error('Error creating portfolio item:', err);
    }
    const fallback: SamplePortfolioItem = {
      ...newItem,
      id: `PRT-${Date.now()}`,
    };
    setPortfolioItems(prev => [fallback, ...prev]);
  };

  const handleUpdatePortfolioItem = async (id: string, updatedItem: Partial<SamplePortfolioItem>) => {
    try {
      const res = await fetch(`${API_BASE}/api/portfolio/${id}/`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('hadara_admin_token')}`
        },
        body: JSON.stringify(updatedItem),
      });
      if (res.ok) {
        const updated = await res.json();
        setPortfolioItems(prev => prev.map(item => item.id === id ? updated : item));
        return;
      }
    } catch (err) {
      console.error('Error updating portfolio item:', err);
    }
    setPortfolioItems(prev => prev.map(item => item.id === id ? { ...item, ...updatedItem } as SamplePortfolioItem : item));
  };

  const handleDeletePortfolioItem = async (id: string) => {
    try {
      await fetch(`${API_BASE}/api/portfolio/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('hadara_admin_token')}` },
      });
      setPortfolioItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error('Error deleting portfolio item:', err);
    }
  };

  const handleSubmitBrief = async (briefData: Omit<BriefData, 'id' | 'createdAt' | 'status'>) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/briefs/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(briefData),
      });
      if (res.ok) {
        const result = await res.json();
        const created = result.brief || result;
        if (created?.id) {
          setCurrentBrief(created);
          setBriefs(prev => [created, ...prev]);
          navigate('/confirmation');
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
      }
      // Fallback
      const fallback: BriefData = {
        ...briefData, id: `HAD-${String(briefs.length + 1).padStart(4, '0')}`,
        createdAt: new Date().toISOString(), status: 'nouveau',
      };
      setBriefs(prev => [fallback, ...prev]);
      setCurrentBrief(fallback);
      navigate('/confirmation');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Error submitting brief:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (briefId: string, status: BriefStatus, notes?: string, price?: number) => {
    try {
      const res = await fetch(`${API_BASE}/api/briefs/${briefId}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, designerNotes: notes, quotedPriceFCFA: price }),
      });
      const updated = res.ok ? (await res.json()) : null;
      setBriefs(prev => prev.map(b => b.id === briefId ? (updated?.brief || updated || { ...b, status, designerNotes: notes, quotedPriceFCFA: price }) : b));
    } catch (err) { console.error(err); }
  };

  const handleAnalyzeWithAI = async (briefId: string): Promise<AIAnalysisResult | null> => {
    try {
      const res = await fetch(`${API_BASE}/api/briefs/${briefId}/analyze/`, { method: 'POST' });
      if (res.ok) { const d = await res.json(); if (d.analysis) { fetchBriefs(); return d.analysis; } }
    } catch (err) { console.error(err); }
    return null;
  };

  const handleDeleteBrief = async (briefId: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/briefs/${briefId}/`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${sessionStorage.getItem('hadara_admin_token')}` } });
      setBriefs(prev => prev.filter(b => b.id !== briefId));
    } catch (err) { console.error(err); }
  };

  const handleAdminLogin = async () => {
    if (lockoutUntil && Date.now() < lockoutUntil) return;
    try {
      const res = await fetch(`${API_BASE}/api/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: adminUsernameInput, password: adminPasswordInput })
      });
      if (res.ok) {
        const data = await res.json();
        sessionStorage.setItem('hadara_admin_token', data.token);
        setIsAdminAuthenticated(true);
        setFailedAttempts(0);
        localStorage.removeItem('admin_failed_attempts');
        fetchBriefs();
      } else if (res.status === 429) {
        // Backend Rate Limit triggered
        const lTime = Date.now() + 15 * 60 * 1000;
        setLockoutUntil(lTime);
        localStorage.setItem('admin_lockout_until', lTime.toString());
      } else {
        setAdminPasswordError(true);
        const newAttempts = failedAttempts + 1;
        setFailedAttempts(newAttempts);
        localStorage.setItem('admin_failed_attempts', newAttempts.toString());
        if (newAttempts >= 5) {
          const lTime = Date.now() + 15 * 60 * 1000;
          setLockoutUntil(lTime);
          localStorage.setItem('admin_lockout_until', lTime.toString());
        }
      }
    } catch (err) {
      setAdminPasswordError(true);
    }
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem('hadara_admin_token');
    setIsAdminAuthenticated(false);
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEnterStudio = () => {
    setHasVisited(true);
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── SPLASH SCREEN ─────────────────────────────────────────────
  if ((location.pathname === '/' && !hasVisited) || location.pathname === '/splash') {
    return (
      <div className="min-h-screen bg-[#0d131f] text-[#F5F5DC] font-sans">
        <SplashEntry onEnter={handleEnterStudio} />
        <FloatingWhatsApp />
      </div>
    );
  }

  // ── ADMIN LOCK SCREEN ─────────────────────────────────────────
  const AdminLockScreen = (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 w-full max-w-md shadow-2xl relative overflow-hidden">
        
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col items-center gap-4 mb-8 relative">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#816C07] to-amber-600 p-[2px] shadow-lg shadow-amber-500/20">
            <div className="w-full h-full rounded-[22px] bg-slate-900 flex items-center justify-center">
              <Lock className="w-8 h-8 text-amber-400" />
            </div>
          </div>
          <div className="text-center space-y-1">
            <h2 className="text-3xl font-serif font-bold text-slate-100">La Hadara</h2>
            <p className="text-amber-500/90 font-mono text-sm tracking-widest uppercase font-bold">Studio Access</p>
            <p className="text-slate-400 text-xs mt-2 max-w-[250px] mx-auto">Veuillez vous identifier pour accéder à l'administration sécurisée.</p>
          </div>
        </div>

        {lockoutUntil ? (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 mx-auto flex items-center justify-center mb-2">
              <Lock className="w-6 h-6" />
            </div>
            <p className="text-red-400 font-bold">Sécurité activée</p>
            <p className="text-slate-300 text-sm">Trop de tentatives. Veuillez patienter :</p>
            <p className="text-3xl font-mono font-bold text-red-300">
              {Math.floor(lockoutRemaining / 60).toString().padStart(2, '0')}:{(lockoutRemaining % 60).toString().padStart(2, '0')}
            </p>
          </div>
        ) : (
          <div className="space-y-4 relative">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                value={adminUsernameInput}
                onChange={e => { setAdminUsernameInput(e.target.value); setAdminPasswordError(false); }}
                onKeyDown={e => { if (e.key === 'Enter') handleAdminLogin(); }}
                placeholder="Email ou nom d'utilisateur"
                autoFocus
                className="w-full bg-slate-950/50 border border-slate-700 rounded-2xl px-5 py-4 pl-12 text-slate-100 focus:outline-none focus:border-amber-400 transition-colors placeholder:text-slate-600"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type={showAdminPassword ? 'text' : 'password'}
                value={adminPasswordInput}
                onChange={e => { setAdminPasswordInput(e.target.value); setAdminPasswordError(false); }}
                onKeyDown={e => { if (e.key === 'Enter') handleAdminLogin(); }}
                placeholder="Mot de passe d'administration"
                className={`w-full bg-slate-950/50 border ${adminPasswordError ? 'border-red-500' : 'border-slate-700'} rounded-2xl px-5 py-4 pl-12 text-slate-100 pr-12 focus:outline-none focus:border-amber-400 transition-colors placeholder:text-slate-600`}
              />
              <button 
                onClick={() => setShowAdminPassword(p => !p)} 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                title={showAdminPassword ? "Masquer" : "Afficher"}
              >
                {showAdminPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            
            {adminPasswordError && (
              <p className="text-red-400 text-sm px-1 animate-pulse">Mot de passe incorrect. Tentative {failedAttempts}/5</p>
            )}
            
            <button 
              onClick={handleAdminLogin} 
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-slate-950 font-extrabold shadow-xl shadow-amber-500/20 active:scale-[0.98] transition-all"
            >
              Déverrouiller le panneau
            </button>
            <button
              onClick={() => goTo('home')}
              className="w-full py-3 rounded-2xl bg-slate-800/50 hover:bg-slate-800 text-slate-300 font-medium transition-colors border border-transparent hover:border-slate-700 text-sm"
            >
              Retourner au site public
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-400 selection:text-slate-950 flex flex-col justify-between">

      <Navbar
        activeTab={activeTab as any}
        setActiveTab={goTo}
        briefsCount={(briefs || []).length}
        newBriefsCount={(briefs || []).filter(b => b.status === 'nouveau').length}
      />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 pb-32 md:pb-16 relative">
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                <LandingHero onStartBrief={() => goTo('brief')} onViewPortfolio={() => goTo('portfolio')} onOpenAdmin={() => goTo('admin')} onOpenCV={() => goTo('cv')} />
              </motion.div>
            } />
            <Route path="/brief" element={
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                <BriefForm onSubmitBrief={handleSubmitBrief} isSubmitting={isSubmitting} onCancel={() => goTo('home')} />
              </motion.div>
            } />
            <Route path="/portfolio" element={
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                <PortfolioShowcase items={portfolioItems} onSelectCategoryForBrief={() => goTo('brief')} />
              </motion.div>
            } />
            <Route path="/roadmap" element={
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                <RoadmapView onGoToBrief={() => goTo('brief')} />
              </motion.div>
            } />
            <Route path="/cv" element={
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                <ResumeCV onGoToBrief={() => goTo('brief')} onGoToPortfolio={() => goTo('portfolio')} />
              </motion.div>
            } />
            <Route path="/confirmation" element={
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                {currentBrief
                  ? <BriefConfirmation brief={currentBrief} onNewBrief={() => goTo('brief')} onViewAllBriefs={() => goTo('admin')} onPrintBrief={b => setPrintableBrief(b)} />
                  : <LandingHero onStartBrief={() => goTo('brief')} onViewPortfolio={() => goTo('portfolio')} onOpenAdmin={() => goTo('admin')} onOpenCV={() => goTo('cv')} />
                }
              </motion.div>
            } />
            <Route path="/admin" element={
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                {isAdminAuthenticated
                  ? <ErrorBoundary fallbackLabel="AdminDashboard">
                      <AdminDashboard 
                        briefs={briefs} 
                        portfolioItems={portfolioItems}
                        onUpdateStatus={handleUpdateStatus} 
                        onAnalyzeWithAI={handleAnalyzeWithAI} 
                        onDeleteBrief={handleDeleteBrief} 
                        onPrintBrief={b => setPrintableBrief(b)} 
                        onAddNewBriefDirectly={handleSubmitBrief} 
                        onAddPortfolioItem={handleAddPortfolioItem}
                        onUpdatePortfolioItem={handleUpdatePortfolioItem}
                        onDeletePortfolioItem={handleDeletePortfolioItem}
                        onLogout={handleAdminLogout} 
                      />
                    </ErrorBoundary>
                  : AdminLockScreen
                }
              </motion.div>
            } />
            <Route path="/espace-client" element={
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                <ClientPortalView 
                  briefs={briefs} 
                  onUpdateBriefEnriched={async (updated) => {
                    setBriefs(prev => prev.map(b => b.id === updated.id ? updated : b));
                  }} 
                  onClosePortal={() => goTo('home')} 
                />
              </motion.div>
            } />
            <Route path="/portail-client" element={
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                <ClientPortalView 
                  briefs={briefs} 
                  onUpdateBriefEnriched={async (updated) => {
                    setBriefs(prev => prev.map(b => b.id === updated.id ? updated : b));
                  }} 
                  onClosePortal={() => goTo('home')} 
                />
              </motion.div>
            } />
            <Route path="/suivi" element={
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                <ClientPortalView 
                  briefs={briefs} 
                  onUpdateBriefEnriched={async (updated) => {
                    setBriefs(prev => prev.map(b => b.id === updated.id ? updated : b));
                  }} 
                  onClosePortal={() => goTo('home')} 
                />
              </motion.div>
            } />
            <Route path="*" element={
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                <LandingHero onStartBrief={() => goTo('brief')} onViewPortfolio={() => goTo('portfolio')} onOpenAdmin={() => goTo('admin')} onOpenCV={() => goTo('cv')} />
              </motion.div>
            } />
          </Routes>
        </AnimatePresence>
      </main>

      {printableBrief && <PrintableBrief brief={printableBrief} onClose={() => setPrintableBrief(null)} />}

      <footer className="border-t border-slate-800 bg-slate-950/80 backdrop-blur-md pt-8 pb-32 text-center text-xs text-slate-400 space-y-4 print:hidden">
        <div className="flex flex-col items-center justify-center space-y-2 mb-4">
          <p className="font-serif font-bold text-amber-400 text-sm sm:text-base tracking-wide">
            Graphiste de la Hadara — El Hadji Abdoulaye Niass
          </p>
          <p className="text-slate-500 font-medium">
            Identités Visuelles, Logos, Communication, Bâches Grand Format & Création de Sites Web
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs font-medium">
          <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-500" /> Dakar, Sénégal</span>
          <span className="hidden sm:inline text-slate-700">•</span>
          <a href="https://wa.me/221776232741" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition-colors">
            <Phone className="w-3.5 h-3.5" /> +221 77 623 27 41
          </a>
          <span className="hidden sm:inline text-slate-700">•</span>
          <a href="tel:+221763756363" className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition-colors">
            <Phone className="w-3.5 h-3.5" /> +221 76 375 63 63
          </a>
          <span className="hidden sm:inline text-slate-700">•</span>
          <a href="mailto:mrniass@gmail.com" className="flex items-center gap-1.5 text-amber-300 hover:text-amber-200 transition-colors">
            <Mail className="w-3.5 h-3.5" /> mrniass@gmail.com
          </a>
        </div>

        <div className="flex items-center justify-center pt-4">
          <a href="https://www.behance.net/mrniasse" target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white font-bold transition-all inline-flex items-center gap-2">
            <Palette className="w-4 h-4 text-amber-400" />
            <span>behance.net/mrniasse</span>
          </a>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-slate-500">
          <p>© {new Date().getFullYear()} Hadara Brief. Tous droits réservés.</p>
          <button onClick={() => goTo('admin')} className="p-2 rounded-full hover:bg-slate-800 transition-colors group" title="Espace réservé">
            <Lock className="w-3.5 h-3.5 text-slate-600 group-hover:text-amber-400 transition-colors" />
          </button>
        </div>
      </footer>

      <div className="print:hidden">
        <FloatingWhatsApp />
        <PWAReloadPrompt />
      </div>
    </div>
  );
}
