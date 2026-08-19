import React, { useState, useCallback } from 'react';
import {
  DollarSign, RefreshCw, TrendingUp, ShieldAlert, Copy, Check,
  ChevronDown, ChevronUp, Lightbulb, Target, AlertTriangle,
} from 'lucide-react';
import { PricingAgentResult, PricingAgentStatus } from '../../types';
import API_BASE from '../../config';

const IMPACT_COLOR: Record<string, string> = {
  'faible': 'text-emerald-400 bg-emerald-900/30 border-emerald-800/50',
  'moyen': 'text-amber-400 bg-amber-900/30 border-amber-800/50',
  'élevé': 'text-red-400 bg-red-900/30 border-red-800/50',
  'élevée': 'text-red-400 bg-red-900/30 border-red-800/50',
};

const POSITION_COLOR: Record<string, string> = {
  'standard': 'text-blue-400 bg-blue-900/30 border-blue-800/50',
  'premium': 'text-purple-400 bg-purple-900/30 border-purple-800/50',
  'économique': 'text-emerald-400 bg-emerald-900/30 border-emerald-800/50',
};

interface PricingAgentPanelProps {
  briefId: string;
  result: PricingAgentResult | undefined;
  onResultSaved: (result: PricingAgentResult) => void;
}

export const PricingAgentPanel: React.FC<PricingAgentPanelProps> = ({
  briefId,
  result,
  onResultSaved,
}) => {
  const [status, setStatus] = useState<PricingAgentStatus>(result ? 'success' : 'idle');
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PricingAgentResult | null>(result || null);
  const [expanded, setExpanded] = useState(true);
  const [copiedDevis, setCopiedDevis] = useState(false);

  const handleAnalyze = useCallback(async () => {
    setStatus('loading');
    setError(null);
    const token = sessionStorage.getItem('hadara_admin_token');
    if (!token) { setError('Token manquant'); setStatus('error'); return; }

    try {
      const res = await fetch(`${API_BASE}/api/ai/v1/briefs/${briefId}/pricing-agent/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Erreur ${res.status}`);
      }
      const resultData: PricingAgentResult = await res.json();
      setData(resultData);
      setStatus('success');
      onResultSaved(resultData);
    } catch (err: any) {
      setError(err.message || 'Erreur inconnue');
      setStatus('error');
    }
  }, [briefId, onResultSaved]);

  const handleCopyDevis = () => {
    if (!data?.brouillon_devis) return;
    navigator.clipboard.writeText(data.brouillon_devis);
    setCopiedDevis(true);
    setTimeout(() => setCopiedDevis(false), 2000);
  };

  // ─── Idle ──────────────────────────────────────────────────────────────────
  if (status === 'idle' && !data) {
    return (
      <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-950 to-emerald-950/30 border border-emerald-900/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-emerald-900/40 border border-emerald-800/50">
              <DollarSign className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-100">Hadara AI — Pricing Agent</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Conseil tarifaire et stratégie commerciale
              </p>
            </div>
          </div>
          <button
            onClick={handleAnalyze}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-xs shadow-lg hover:brightness-110 flex items-center space-x-2 transition-all"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Obtenir le conseil tarifaire</span>
          </button>
        </div>
      </div>
    );
  }

  // ─── Loading ───────────────────────────────────────────────────────────────
  if (status === 'loading') {
    return (
      <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-950 to-emerald-950/30 border border-emerald-900/50">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-emerald-900/40 border border-emerald-800/50">
            <RefreshCw className="w-5 h-5 text-emerald-400 animate-spin" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-100">Pricing Agent analyse le tarif...</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Facteurs, stratégie, argumentaire</p>
          </div>
        </div>
      </div>
    );
  }

  // ─── Error ─────────────────────────────────────────────────────────────────
  if (status === 'error') {
    return (
      <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-950 to-red-950/20 border border-red-900/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-red-900/40 border border-red-800/50">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-100">Analyse tarifaire échouée</h4>
              <p className="text-[11px] text-red-400 mt-0.5">{error}</p>
            </div>
          </div>
          <button onClick={handleAnalyze} className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center space-x-2">
            <RefreshCw className="w-3.5 h-3.5" /><span>Réessayer</span>
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // ─── Result ────────────────────────────────────────────────────────────────
  return (
    <div className="rounded-2xl bg-gradient-to-br from-slate-950 via-slate-950 to-emerald-950/20 border border-emerald-900/40 overflow-hidden">
      {/* Header */}
      <div className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-900/30 transition-colors" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-emerald-900/40 border border-emerald-800/50">
            <DollarSign className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-100">Hadara AI — Pricing Agent</h4>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${POSITION_COLOR[data.strategie_commerciale.positionnement] || POSITION_COLOR.standard}`}>
                {data.strategie_commerciale.positionnement}
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-[11px] text-slate-400">
                {data.prix_recommande.min.toLocaleString('fr-FR')} — {data.prix_recommande.max.toLocaleString('fr-FR')} FCFA
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="px-2 py-0.5 rounded-full bg-indigo-900/40 text-indigo-400 text-[10px] font-bold border border-indigo-800/50">
            🟢 Pricing Engine
          </span>
          {expanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </div>
      </div>

      {expanded && (
        <div className="px-5 pb-5 space-y-4 border-t border-slate-800/50 pt-4">

          {/* Prix */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">Prix recommandé</span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-900/40 text-indigo-400 text-[10px] font-bold border border-indigo-800/50">🟢 Pricing Engine</span>
            </div>
            <p className="text-lg font-bold text-slate-100">
              {data.prix_recommande.min.toLocaleString('fr-FR')} — {data.prix_recommande.max.toLocaleString('fr-FR')} FCFA
            </p>
          </div>

          {/* Explication */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center space-x-2">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Explication</span>
              <span className={`ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold border ${IMPACT_COLOR[data.explication.niveau_complexite] || ''}`}>
                {data.explication.niveau_complexite}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">{data.explication.resume}</p>

            {data.explication.facteurs.length > 0 && (
              <div className="space-y-1.5">
                {data.explication.facteurs.map((f, i) => (
                  <div key={i} className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">{f.facteur}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-500">{f.detail}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${IMPACT_COLOR[f.impact] || ''}`}>{f.impact}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {data.explication.heures_estimees.min > 0 && (
              <p className="text-[10px] text-slate-500">
                {data.explication.heures_estimees.min}—{data.explication.heures_estimees.max}h estimées · {data.explication.heures_estimees.justification}
              </p>
            )}
          </div>

          {/* Stratégie commerciale */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-purple-400" />
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Stratégie Commerciale</span>
            </div>

            <div className="space-y-2 text-[11px]">
              <div>
                <span className="text-slate-500">Argument client :</span>
                <p className="text-slate-200 mt-0.5">{data.strategie_commerciale.argument_client}</p>
              </div>
              <div>
                <span className="text-slate-500">Approche :</span>
                <p className="text-slate-300 mt-0.5">{data.strategie_commerciale.approche}</p>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-slate-500">Acompte conseillé :</span>
                <span className="text-emerald-400 font-bold">{data.strategie_commerciale.acompte_conseille_pourcentage}%</span>
                <span className="text-slate-500 text-[10px]">{data.strategie_commerciale.justification_acompte}</span>
              </div>
            </div>
          </div>

          {/* Risques commerciaux */}
          {data.risques_commerciaux.length > 0 && (
            <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-900/30">
              <div className="flex items-center space-x-2 mb-2">
                <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                <span className="text-[10px] text-red-400 uppercase tracking-wider font-bold">Risques Commerciaux</span>
              </div>
              <div className="space-y-2">
                {data.risques_commerciaux.map((r, i) => (
                  <div key={i} className="text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="text-red-300 font-bold">{r.risque}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${IMPACT_COLOR[r.probabilité] || ''}`}>{r.probabilité}</span>
                    </div>
                    <p className="text-slate-500 mt-0.5">→ {r.mitigation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Brouillon devis */}
          {data.brouillon_devis && (
            <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-900/40">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-emerald-400 uppercase tracking-wider font-bold">Brouillon Devis</span>
                <button onClick={handleCopyDevis} className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold flex items-center space-x-1">
                  {copiedDevis ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedDevis ? 'Copié !' : 'Copier'}</span>
                </button>
              </div>
              <p className="font-mono text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed">{data.brouillon_devis}</p>
            </div>
          )}

          {/* Refresh */}
          <div className="flex justify-end pt-2">
            <button onClick={handleAnalyze} className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center space-x-2 transition-all">
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Relancer le conseil</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
