/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
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
import { Sparkles, Heart } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'splash' | 'home' | 'brief' | 'confirmation' | 'portfolio' | 'admin' | 'cv'>('splash');
  const [briefs, setBriefs] = useState<BriefData[]>([]);
  const [currentBrief, setCurrentBrief] = useState<BriefData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [printableBrief, setPrintableBrief] = useState<BriefData | null>(null);

  // Fetch all briefs from server
  const fetchBriefs = async () => {
    try {
      const res = await fetch('/api/briefs');
      if (res.ok) {
        const data = await res.json();
        if (data.briefs) {
          setBriefs(data.briefs);
        }
      }
    } catch (err) {
      console.warn('Could not connect to backend API, using client state fallback.');
    }
  };

  useEffect(() => {
    fetchBriefs();
  }, []);

  // Scroll to top whenever active tab changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  // Handle Brief Submission
  const handleSubmitBrief = async (briefData: Omit<BriefData, 'id' | 'createdAt' | 'status'>) => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/briefs/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(briefData),
      });

      if (res.ok) {
        const result = await res.json();
        if (result.brief) {
          setCurrentBrief(result.brief);
          setBriefs((prev) => [result.brief, ...prev]);
          setActiveTab('confirmation');
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
      }

      // Fallback if API route is unreachable
      const fallbackId = `HADARA-2026-${String(briefs.length + 1).padStart(3, '0')}`;
      const newBrief: BriefData = {
        ...briefData,
        id: fallbackId,
        createdAt: new Date().toISOString(),
        status: 'nouveau',
      };
      setBriefs((prev) => [newBrief, ...prev]);
      setCurrentBrief(newBrief);
      setActiveTab('confirmation');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Error submitting brief:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update Brief Status in Admin
  const handleUpdateStatus = async (
    briefId: string,
    status: BriefStatus,
    notes?: string,
    price?: number
  ) => {
    try {
      const res = await fetch(`/api/briefs/${briefId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          designerNotes: notes,
          quotedPriceFCFA: price,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.brief) {
          setBriefs((prev) =>
            prev.map((b) => (b.id === briefId ? data.brief : b))
          );
          return;
        }
      }

      // Fallback
      setBriefs((prev) =>
        prev.map((b) =>
          b.id === briefId
            ? { ...b, status, designerNotes: notes, quotedPriceFCFA: price }
            : b
        )
      );
    } catch (err) {
      console.error('Error updating brief status:', err);
    }
  };

  // Run AI Brief Analysis via Gemini API server route
  const handleAnalyzeWithAI = async (briefId: string): Promise<AIAnalysisResult | null> => {
    try {
      const res = await fetch(`/api/briefs/${briefId}/analyze`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        if (data.analysis) {
          fetchBriefs(); // Refresh state
          return data.analysis;
        }
      }
    } catch (err) {
      console.error('Error calling AI analysis endpoint:', err);
    }
    return null;
  };

  // Delete brief
  const handleDeleteBrief = async (briefId: string) => {
    try {
      await fetch(`/api/briefs/${briefId}`, { method: 'DELETE' });
      setBriefs((prev) => prev.filter((b) => b.id !== briefId));
    } catch (err) {
      console.error('Error deleting brief:', err);
    }
  };

  if (activeTab === 'splash') {
    return (
      <div className="min-h-screen bg-[#0d131f] text-[#F5F5DC] font-sans selection:bg-[#816C07] selection:text-[#0d131f]">
        <SplashEntry onEnter={() => {
          setActiveTab('home');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }} />
        <FloatingWhatsApp />
        <PWAReloadPrompt />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-400 selection:text-slate-950 flex flex-col justify-between">
      
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        briefsCount={briefs.length}
        newBriefsCount={briefs.filter((b) => b.status === 'nouveau').length}
      />

      {/* Main Content Area */}
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 pb-32 md:pb-16">
        
        {activeTab === 'home' && (
          <LandingHero
            onStartBrief={() => setActiveTab('brief')}
            onViewPortfolio={() => setActiveTab('portfolio')}
            onOpenAdmin={() => setActiveTab('admin')}
            onOpenCV={() => setActiveTab('cv')}
          />
        )}

        {activeTab === 'brief' && (
          <BriefForm
            onSubmitBrief={handleSubmitBrief}
            isSubmitting={isSubmitting}
            onCancel={() => setActiveTab('home')}
          />
        )}

        {activeTab === 'confirmation' && currentBrief && (
          <BriefConfirmation
            brief={currentBrief}
            onNewBrief={() => setActiveTab('brief')}
            onViewAllBriefs={() => setActiveTab('admin')}
            onPrintBrief={(brief) => setPrintableBrief(brief)}
          />
        )}

        {activeTab === 'portfolio' && (
          <PortfolioShowcase
            onSelectCategoryForBrief={(category) => {
              setActiveTab('brief');
              window.scrollTo({ top: 120, behavior: 'smooth' });
            }}
          />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard
            briefs={briefs}
            onUpdateStatus={handleUpdateStatus}
            onAnalyzeWithAI={handleAnalyzeWithAI}
            onDeleteBrief={handleDeleteBrief}
            onPrintBrief={(brief) => setPrintableBrief(brief)}
            onAddNewBriefDirectly={handleSubmitBrief}
          />
        )}

        {activeTab === 'cv' && (
          <ResumeCV
            onGoToBrief={() => {
              setActiveTab('brief');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onGoToPortfolio={() => {
              setActiveTab('portfolio');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

      </main>

      {/* Printable PDF Modal Overlay */}
      {printableBrief && (
        <PrintableBrief
          brief={printableBrief}
          onClose={() => setPrintableBrief(null)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 pt-8 pb-32 text-center text-xs text-slate-400 space-y-3">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className="font-serif font-bold text-amber-400">Graphiste de la Hadara — El Hadji Abdoulaye Niass</span>
          <span>•</span>
          <span>Dakar, Sénégal</span>
          <span>•</span>
          <a href="https://wa.me/221776232741" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline font-bold">
            +221 77 623 27 41
          </a>
          <span>|</span>
          <a href="tel:+221763756363" className="text-emerald-400 hover:underline font-bold">
            +221 76 375 63 63
          </a>
          <span>•</span>
          <a href="mailto:mrniass@gmail.com" className="text-amber-300 hover:underline font-semibold">
            mrniass@gmail.com
          </a>
          <span>|</span>
          <a href="mailto:abouniass@hotmail.com" className="text-amber-300 hover:underline font-semibold">
            abouniass@hotmail.com
          </a>
          <span>•</span>
          <a href="https://www.behance.net/mrniasse" target="_blank" rel="noopener noreferrer" className="px-2.5 py-1 rounded-md bg-[#335A79] border border-[#816C07] text-[#F5F5DC] hover:bg-[#284963] font-serif font-bold transition-all inline-flex items-center space-x-1 shadow-sm">
            <span className="text-[#816C07]">🎨</span>
            <span className="text-[#F5F5DC]">behance.net/mrniasse</span>
          </a>
        </div>
        <p className="text-slate-500 text-[11px]">
          Identités Visuelles, Logo, Communication (Affiches/Flyers), Bâches Grand Format, Packages Booster & Création de Sites Web
        </p>
      </footer>

      {/* Persistent Floating WhatsApp Contact Button */}
      <FloatingWhatsApp />

      {/* PWA Reload and Offline Ready Prompt */}
      <PWAReloadPrompt />

    </div>
  );
}
