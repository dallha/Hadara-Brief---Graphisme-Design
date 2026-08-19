import React, { useState, useCallback, useEffect } from 'react';
import {
  Brain, RefreshCw, AlertTriangle, CheckCircle2, XCircle, Clock,
  MessageCircle, Copy, Check, ShieldAlert, TrendingUp, User, FileText,
  Sparkles, ChevronDown, ChevronUp, History, Cpu,
} from 'lucide-react';
import {
  BriefAnalystResult, BriefAnalystStatus, BriefAnalystStatut,
  BriefAnalystDecision,
} from '../../types';
import API_BASE from '../../config';

// ─── Config ──────────────────────────────────────────────────────────────────

const STATUT_CONFIG: Record<BriefAnalystStatut, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  exploitable: {
    label: 'Exploitable',
    color: 'text-emerald-400',
    bg: 'bg-emerald-950 border-emerald-800',
    icon: <CheckCircle2 className="w-4 h-4" />,
  },
  exploitable_sous_reserve: {
    label: 'Exploitable sous réserve',
    color: 'text-amber-400',
    bg: 'bg-amber-950 border-amber-800',
    icon: <AlertTriangle className="w-4 h-4" />,
  },
  incomplet: {
    label: 'Incomplet',
    color: 'text-orange-400',
    bg: 'bg-orange-950 border-orange-800',
    icon: <Clock className="w-4 h-4" />,
  },
  refuser: {
    label: 'Refuser',
    color: 'text-red-400',
    bg: 'bg-red-950 border-red-800',
    icon: <XCircle className="w-4 h-4" />,
  },
};

const DECISION_CONFIG: Record<BriefAnalystDecision, { color: string; bg: string }> = {
  'ACCEPTER': { color: 'text-emerald-400', bg: 'bg-emerald-900/40 border-emerald-700/50' },
  'ACCEPTER SOUS RÉSERVE': { color: 'text-amber-400', bg: 'bg-amber-900/40 border-amber-700/50' },
  'CLARIFIER': { color: 'text-orange-400', bg: 'bg-orange-900/40 border-orange-700/50' },
  'REFUSER': { color: 'text-red-400', bg: 'bg-red-900/40 border-red-700/50' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-400';
  if (score >= 60) return 'text-amber-400';
  if (score >= 40) return 'text-orange-400';
  return 'text-red-400';
}

function getScoreRingColor(score: number): string {
  if (score >= 80) return '#34d399';
  if (score >= 60) return '#fbbf24';
  if (score >= 40) return '#fb923c';
  return '#f87171';
}

function ScoreRing({ score, size = 56 }: { score: number; size?: number }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = getScoreRingColor(score);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#1e293b" strokeWidth="4" />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color} strokeWidth="4" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-sm font-bold ${getScoreColor(score)}`}>{score}</span>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface BriefAnalysisPanelProps {
  briefId: string;
  result: BriefAnalystResult | undefined;
  onResultSaved: (result: BriefAnalystResult) => void;
}

export const BriefAnalysisPanel: React.FC<BriefAnalysisPanelProps> = ({
  briefId,
  result,
  onResultSaved,
}) => {
  const [status, setStatus] = useState<BriefAnalystStatus>(result ? 'success' : 'idle');
  const [error, setError] = useState<string | null>(null);
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [data, setData] = useState<BriefAnalystResult | null>(result || null);
  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchHistory = useCallback(async () => {
    const token = sessionStorage.getItem('hadara_admin_token');
    if (!token) return;
    setHistoryLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/ai/v1/briefs/${briefId}/analyses/`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        setHistory(await res.json());
      }
    } catch {
      // silently fail
    } finally {
      setHistoryLoading(false);
    }
  }, [briefId]);

  const handleAnalyze = useCallback(async () => {
    setStatus('loading');
    setError(null);

    const token = sessionStorage.getItem('hadara_admin_token');
    if (!token) {
      setError('Token admin manquant');
      setStatus('error');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/ai/v1/briefs/${briefId}/analyze/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Erreur ${res.status}`);
      }

      const resultData: BriefAnalystResult = await res.json();
      setData(resultData);
      setStatus(resultData.score_completude === 50 && resultData.raison_decision.includes('indisponible') ? 'fallback' : 'success');
      onResultSaved(resultData);
    } catch (err: any) {
      setError(err.message || 'Erreur inconnue');
      setStatus('error');
    }
  }, [briefId, onResultSaved]);

  const handleCopyWhatsApp = () => {
    if (!data?.brouillon_whatsapp) return;
    navigator.clipboard.writeText(data.brouillon_whatsapp);
    setCopiedWhatsApp(true);
    setTimeout(() => setCopiedWhatsApp(false), 2000);
  };

  // ─── Idle State ────────────────────────────────────────────────────────────

  if (status === 'idle' && !data) {
    return (
      <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-950 to-indigo-950/30 border border-indigo-900/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-indigo-900/40 border border-indigo-800/50">
              <Brain className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-100">Hadara AI — Brief Analyst</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Analyse complète du brief avec scoring, risques et recommandations
              </p>
            </div>
          </div>
          <button
            onClick={handleAnalyze}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold text-xs shadow-lg hover:brightness-110 flex items-center space-x-2 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Analyser avec Hadara AI</span>
          </button>
        </div>
      </div>
    );
  }

  // ─── Loading State ─────────────────────────────────────────────────────────

  if (status === 'loading') {
    return (
      <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-950 to-indigo-950/30 border border-indigo-900/50">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-indigo-900/40 border border-indigo-800/50">
            <RefreshCw className="w-5 h-5 text-indigo-400 animate-spin" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-100">Hadara AI analyse le brief...</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Collecte des données, analyse IA, vérification Pricing Engine
            </p>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-3 rounded-full bg-slate-800 animate-pulse" style={{ width: `${100 - i * 15}%` }} />
          ))}
        </div>
      </div>
    );
  }

  // ─── Error State ───────────────────────────────────────────────────────────

  if (status === 'error') {
    return (
      <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-950 to-red-950/20 border border-red-900/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-red-900/40 border border-red-800/50">
              <XCircle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-100">Analyse échouée</h4>
              <p className="text-[11px] text-red-400 mt-0.5">{error}</p>
            </div>
          </div>
          <button
            onClick={handleAnalyze}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center space-x-2 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Réessayer</span>
          </button>
        </div>
      </div>
    );
  }

  // ─── Result Display ────────────────────────────────────────────────────────

  if (!data) return null;

  const statutCfg = STATUT_CONFIG[data.statut_brief] || STATUT_CONFIG.exploitable_sous_reserve;
  const decisionCfg = DECISION_CONFIG[data.decision_recommandee] || DECISION_CONFIG['ACCEPTER SOUS RÉSERVE'];

  return (
    <div className="rounded-2xl bg-gradient-to-br from-slate-950 via-slate-950 to-indigo-950/20 border border-indigo-900/40 overflow-hidden">
      {/* ─── Header ────────────────────────────────────────────────────────── */}
      <div
        className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-900/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-indigo-900/40 border border-indigo-800/50">
            <Brain className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="font-bold text-sm text-slate-100">Hadara AI — Brief Analyst</h4>
              {status === 'fallback' && (
                <span className="px-2 py-0.5 rounded-full bg-amber-900/50 text-amber-400 text-[10px] font-bold border border-amber-800/50">
                  Fallback
                </span>
              )}
            </div>
            <div className="flex items-center space-x-3 mt-1">
              <span className={`flex items-center space-x-1 text-xs font-bold ${statutCfg.color}`}>
                {statutCfg.icon}
                <span>{statutCfg.label}</span>
              </span>
              <span className="text-slate-600">·</span>
              <span className={`text-xs font-bold ${decisionCfg.color}`}>
                {data.decision_recommandee}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <ScoreRing score={data.score_completude} />
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          )}
        </div>
      </div>

      {/* ─── Expanded Content ──────────────────────────────────────────────── */}
      {expanded && (
        <div className="px-5 pb-5 space-y-4 border-t border-slate-800/50 pt-4">

          {/* Decision Banner */}
          <div className={`p-3 rounded-xl border ${decisionCfg.bg}`}>
            <div className="flex items-center space-x-2 mb-1">
              <ShieldAlert className={`w-4 h-4 ${decisionCfg.color}`} />
              <span className={`font-bold text-xs ${decisionCfg.color}`}>
                {data.decision_recommandee}
              </span>
              <span className={`ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold ${
                data.niveau_priorite === 'Urgent'
                  ? 'bg-red-900/50 text-red-400 border border-red-800/50'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}>
                {data.niveau_priorite}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              {data.raison_decision}
            </p>
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Complexité</p>
              <p className={`text-lg font-bold ${data.complexite_percue >= 7 ? 'text-orange-400' : data.complexite_percue >= 4 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {data.complexite_percue}<span className="text-xs text-slate-500">/10</span>
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Complétude</p>
              <p className={`text-lg font-bold ${getScoreColor(data.score_completude)}`}>
                {data.score_completude}<span className="text-xs text-slate-500">%</span>
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Priorité</p>
              <p className={`text-lg font-bold ${data.niveau_priorite === 'Urgent' ? 'text-red-400' : 'text-slate-300'}`}>
                {data.niveau_priorite === 'Urgent' ? '🔥' : '📋'}
              </p>
            </div>
          </div>

          {/* Pricing — Source: Pricing Engine */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider flex items-center space-x-1">
                <TrendingUp className="w-3 h-3" />
                <span>Estimation Prix</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-900/40 text-indigo-400 text-[10px] font-bold border border-indigo-800/50">
                🟢 Pricing Engine
              </span>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-lg font-bold text-slate-100">
                {data.pricing.prix_min_fcfa.toLocaleString('fr-FR')} — {data.pricing.prix_max_fcfa.toLocaleString('fr-FR')} FCFA
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              {data.pricing.heures_min}—{data.pricing.heures_max}h estimées · Source : Pricing Engine (souverain)
            </p>
          </div>

          {/* Client Context */}
          {data.contexte_client && (
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center space-x-2 mb-2">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Contexte Client</span>
              </div>
              <div className="flex items-center space-x-4 text-xs">
                <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                  data.contexte_client['fidélité'] === 'ancien'
                    ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-800/50'
                    : data.contexte_client['fidélité'] === 'régulier'
                    ? 'bg-blue-900/50 text-blue-400 border border-blue-800/50'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}>
                  {data.contexte_client['fidélité'] === 'ancien' ? '⭐ Client fidèle' :
                   data.contexte_client['fidélité'] === 'régulier' ? '🔄 Régulier' :
                   '🆕 Nouveau client'}
                </span>
                <span className="text-slate-400">
                  {data.contexte_client.nb_projets_precedents} projet(s) précédent(s)
                </span>
                {data.contexte_client.solde_du_fcfa > 0 && (
                  <span className="text-amber-400 font-bold">
                    Solde dû : {data.contexte_client.solde_du_fcfa.toLocaleString('fr-FR')} FCFA
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Missing Info & Questions */}
          {(data.informations_manquantes.length > 0 || data.questions_client.length > 0) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {data.informations_manquantes.length > 0 && (
                <div className="p-3.5 rounded-xl bg-orange-950/30 border border-orange-900/40">
                  <p className="text-[10px] text-orange-400 uppercase tracking-wider font-bold mb-2 flex items-center space-x-1">
                    <FileText className="w-3 h-3" />
                    <span>Informations Manquantes</span>
                  </p>
                  <ul className="space-y-1">
                    {data.informations_manquantes.map((item, i) => (
                      <li key={i} className="text-[11px] text-orange-300 flex items-start space-x-1.5">
                        <span className="text-orange-500 mt-0.5">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {data.questions_client.length > 0 && (
                <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-900/40">
                  <p className="text-[10px] text-blue-400 uppercase tracking-wider font-bold mb-2 flex items-center space-x-1">
                    <MessageCircle className="w-3 h-3" />
                    <span>Questions au Client</span>
                  </p>
                  <ul className="space-y-1">
                    {data.questions_client.map((item, i) => (
                      <li key={i} className="text-[11px] text-blue-300 flex items-start space-x-1.5">
                        <span className="text-blue-500 mt-0.5">?</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Risks */}
          {data.risques.length > 0 && (
            <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-900/30">
              <p className="text-[10px] text-red-400 uppercase tracking-wider font-bold mb-2 flex items-center space-x-1">
                <ShieldAlert className="w-3 h-3" />
                <span>Risques Identifiés</span>
              </p>
              <ul className="space-y-1">
                {data.risques.map((item, i) => (
                  <li key={i} className="text-[11px] text-red-300 flex items-start space-x-1.5">
                    <span className="text-red-500 mt-0.5">⚠</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* WhatsApp Draft */}
          {data.brouillon_whatsapp && (
            <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-900/40">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-emerald-400 uppercase tracking-wider font-bold flex items-center space-x-1">
                  <MessageCircle className="w-3 h-3" />
                  <span>Brouillon WhatsApp</span>
                </span>
                <button
                  onClick={handleCopyWhatsApp}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold flex items-center space-x-1 transition-all"
                >
                  {copiedWhatsApp ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedWhatsApp ? 'Copié !' : 'Copier'}</span>
                </button>
              </div>
              <p className="font-mono text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed">
                {data.brouillon_whatsapp}
              </p>
            </div>
          )}

          {/* Analysis History */}
          <div className="border-t border-slate-800/50 pt-3">
            <button
              onClick={() => {
                setShowHistory(!showHistory);
                if (!showHistory && history.length === 0) fetchHistory();
              }}
              className="flex items-center space-x-2 text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
            >
              <History className="w-3.5 h-3.5" />
              <span>Historique des analyses ({history.length})</span>
              {showHistory ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {showHistory && (
              <div className="mt-3 space-y-2">
                {historyLoading ? (
                  <div className="space-y-2">
                    {[1, 2].map((i) => (
                      <div key={i} className="h-12 rounded-lg bg-slate-900 animate-pulse" />
                    ))}
                  </div>
                ) : history.length === 0 ? (
                  <p className="text-[11px] text-slate-500 italic">Aucune analyse précédente</p>
                ) : (
                  history.map((h) => (
                    <div
                      key={h.id}
                      className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${
                          h.score_completude >= 80 ? 'bg-emerald-400' :
                          h.score_completude >= 60 ? 'bg-amber-400' : 'bg-red-400'
                        }`} />
                        <div>
                          <p className="text-[11px] text-slate-200 font-bold">
                            {h.decision_recommandee}
                            <span className="text-slate-500 font-normal ml-2">
                              {h.score_completude}%
                            </span>
                          </p>
                          <p className="text-[10px] text-slate-500">
                            {h.model} · {new Date(h.created_at).toLocaleDateString('fr-FR', {
                              day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 text-[10px] text-slate-500">
                        <span className="flex items-center space-x-1">
                          <Cpu className="w-3 h-3" />
                          <span>{h.input_tokens + h.output_tokens} tok</span>
                        </span>
                        <span>${h.cost_usd.toFixed(4)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Refresh Button */}
          <div className="flex justify-end pt-2">
            <button
              onClick={handleAnalyze}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center space-x-2 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Relancer l'analyse</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
