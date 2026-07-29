/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { LandingHero } from './components/LandingHero';
import { BriefForm } from './components/BriefForm';
import { BriefConfirmation } from './components/BriefConfirmation';
import { PortfolioShowcase } from './components/PortfolioShowcase';
import { AdminDashboard } from './components/AdminDashboard';
import { PrintableBrief } from './components/PrintableBrief';
import { ResumeCV } from './components/ResumeCV';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import PWAReloadPrompt from './components/PWAReloadPrompt';
import { SplashEntry } from './components/SplashEntry';
import { BriefData, BriefStatus, AIAnalysisResult } from './types';
import { Lock, Eye, EyeOff } from 'lucide-react';
import API_BASE from './config';

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'hadara2026';

// Derive active tab from URL path for Navbar highlighting
function pathToTab(pathname: string): string {
  if (pathname.startsWith('/brief')) return 'brief';
  if (pathname.startsWith('/portfolio')) return 'portfolio';
  if (pathname.startsWith('/admin')) return 'admin';
  if (pathname.startsWith('/cv')) return 'cv';
  if (pathname.startsWith('/confirmation')) return 'confirmation';
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
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => sessionStorage.getItem('hadara_admin') === 'true');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminPasswordError, setAdminPasswordError] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  const goTo = (tab: string) => {
    const routes: Record<string, string> = {
      home: '/', brief: '/brief', portfolio: '/portfolio',
      admin: '/admin', cv: '/cv', confirmation: '/confirmation',
    };
    navigate(routes[tab] || '/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

  useEffect(() => { fetchBriefs(); }, []);

  useEffect(() => {
    if (activeTab === 'admin' && isAdminAuthenticated) fetchBriefs();
  }, [activeTab, isAdminAuthenticated]);

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
          return;
        }
      }
      // Fallback
      const fallback: BriefData = {
        ...briefData, id: `HADARA-2026-${String(briefs.length + 1).padStart(3, '0')}`,
        createdAt: new Date().toISOString(), status: 'nouveau',
      };
      setBriefs(prev => [fallback, ...prev]);
      setCurrentBrief(fallback);
      navigate('/confirmation');
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
      await fetch(`${API_BASE}/api/briefs/${briefId}/`, { method: 'DELETE' });
      setBriefs(prev => prev.filter(b => b.id !== briefId));
    } catch (err) { console.error(err); }
  };

  const handleAdminLogin = () => {
    if (adminPasswordInput === ADMIN_PASSWORD) {
      sessionStorage.setItem('hadara_admin', 'true');
      setIsAdminAuthenticated(true);
      fetchBriefs();
    } else { setAdminPasswordError(true); }
  };

  // ── SPLASH SCREEN ─────────────────────────────────────────────
  if (location.pathname === '/' && !sessionStorage.getItem('hadara_visited')) {
    return (
      <div className="min-h-screen bg-[#0d131f] text-[#F5F5DC] font-sans">
        <SplashEntry onEnter={() => { sessionStorage.setItem('hadara_visited', 'true'); navigate('/'); }} />
        <FloatingWhatsApp />
      </div>
    );
  }

  // ── ADMIN LOCK SCREEN ─────────────────────────────────────────
  const AdminLockScreen = (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <div className="flex flex-col items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center">
            <Lock className="w-6 h-6 text-amber-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-100">Espace Réservé</h2>
          <p className="text-slate-400 text-sm text-center">Cette section est réservée au graphiste.</p>
        </div>
        <div className="relative mb-3">
          <input
            type={showAdminPassword ? 'text' : 'password'}
            value={adminPasswordInput}
            onChange={e => { setAdminPasswordInput(e.target.value); setAdminPasswordError(false); }}
            onKeyDown={e => { if (e.key === 'Enter') handleAdminLogin(); }}
            placeholder="Mot de passe"
            autoFocus
            className={`w-full bg-slate-800 border ${adminPasswordError ? 'border-red-500' : 'border-slate-600'} rounded-xl px-4 py-3 text-slate-100 pr-12 focus:outline-none focus:border-amber-400`}
          />
          <button onClick={() => setShowAdminPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
            {showAdminPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {adminPasswordError && <p className="text-red-400 text-sm mb-3">Mot de passe incorrect.</p>}
        <button onClick={handleAdminLogin} className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold transition-colors">
          Accéder au tableau de bord
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-400 selection:text-slate-950 flex flex-col justify-between">

      <Navbar
        activeTab={activeTab as any}
        setActiveTab={goTo}
        briefsCount={briefs.length}
        newBriefsCount={briefs.filter(b => b.status === 'nouveau').length}
      />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 pb-32 md:pb-16">
        <Routes>
          <Route path="/" element={
            <LandingHero
              onStartBrief={() => goTo('brief')}
              onViewPortfolio={() => goTo('portfolio')}
              onOpenAdmin={() => goTo('admin')}
              onOpenCV={() => goTo('cv')}
            />
          } />
          <Route path="/brief" element={
            <BriefForm onSubmitBrief={handleSubmitBrief} isSubmitting={isSubmitting} onCancel={() => goTo('home')} />
          } />
          <Route path="/portfolio" element={
            <PortfolioShowcase onSelectCategoryForBrief={() => goTo('brief')} />
          } />
          <Route path="/cv" element={
            <ResumeCV onGoToBrief={() => goTo('brief')} onGoToPortfolio={() => goTo('portfolio')} />
          } />
          <Route path="/confirmation" element={
            currentBrief
              ? <BriefConfirmation brief={currentBrief} onNewBrief={() => goTo('brief')} onViewAllBriefs={() => goTo('admin')} onPrintBrief={b => setPrintableBrief(b)} />
              : <LandingHero onStartBrief={() => goTo('brief')} onViewPortfolio={() => goTo('portfolio')} onOpenAdmin={() => goTo('admin')} onOpenCV={() => goTo('cv')} />
          } />
          <Route path="/admin" element={
            isAdminAuthenticated
              ? <AdminDashboard briefs={briefs} onUpdateStatus={handleUpdateStatus} onAnalyzeWithAI={handleAnalyzeWithAI} onDeleteBrief={handleDeleteBrief} onPrintBrief={b => setPrintableBrief(b)} onAddNewBriefDirectly={handleSubmitBrief} />
              : AdminLockScreen
          } />
          <Route path="*" element={<LandingHero onStartBrief={() => goTo('brief')} onViewPortfolio={() => goTo('portfolio')} onOpenAdmin={() => goTo('admin')} onOpenCV={() => goTo('cv')} />} />
        </Routes>
      </main>

      {printableBrief && <PrintableBrief brief={printableBrief} onClose={() => setPrintableBrief(null)} />}

      <footer className="border-t border-slate-900 bg-slate-950/80 pt-8 pb-32 text-center text-xs text-slate-400 space-y-3">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className="font-serif font-bold text-amber-400">Graphiste de la Hadara — El Hadji Abdoulaye Niass</span>
          <span>•</span><span>Dakar, Sénégal</span><span>•</span>
          <a href="https://wa.me/221776232741" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline font-bold">+221 77 623 27 41</a>
          <span>|</span>
          <a href="tel:+221763756363" className="text-emerald-400 hover:underline font-bold">+221 76 375 63 63</a>
          <span>•</span>
          <a href="mailto:mrniass@gmail.com" className="text-amber-300 hover:underline font-semibold">mrniass@gmail.com</a>
          <span>|</span>
          <a href="mailto:abouniass@hotmail.com" className="text-amber-300 hover:underline font-semibold">abouniass@hotmail.com</a>
          <span>•</span>
          <a href="https://www.behance.net/mrniasse" target="_blank" rel="noopener noreferrer" className="px-2.5 py-1 rounded-md bg-[#335A79] border border-[#816C07] text-[#F5F5DC] hover:bg-[#284963] font-serif font-bold transition-all inline-flex items-center space-x-1">
            <span className="text-[#816C07]">🎨</span><span>behance.net/mrniasse</span>
          </a>
        </div>
        <p className="text-slate-500 text-[11px]">Identités Visuelles, Logo, Communication, Bâches Grand Format, Packages Booster & Création de Sites Web</p>
        <button onClick={() => goTo('admin')} className="opacity-10 hover:opacity-40 transition-opacity duration-300 text-slate-500 mt-2 cursor-default select-none" title="Espace réservé">
          <Lock className="w-3 h-3 inline" />
        </button>
      </footer>

      <FloatingWhatsApp />
      <PWAReloadPrompt />
    </div>
  );
}
