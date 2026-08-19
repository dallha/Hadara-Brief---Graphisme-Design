import React, { useState, useCallback } from 'react';
import {
  Palette, RefreshCw, ChevronDown, ChevronUp, Lightbulb, Sparkles,
  AlertTriangle, Check, Copy, Layers, FileText, Target, ShieldCheck,
} from 'lucide-react';
import { CreativeAssistantResult, CreativeAssistantStatus, CreativeQualityGate } from '../../types';
import API_BASE from '../../config';

const DIFFICULTE_COLOR: Record<string, string> = {
  'facile': 'text-emerald-400 bg-emerald-900/30 border-emerald-800/50',
  'moyen': 'text-amber-400 bg-amber-900/30 border-amber-800/50',
  'complexe': 'text-red-400 bg-red-900/30 border-red-800/50',
};

const PRIORITE_COLOR: Record<string, string> = {
  'haute': 'text-red-400 bg-red-900/30 border-red-800/50',
  'moyenne': 'text-amber-400 bg-amber-900/30 border-amber-800/50',
  'basse': 'text-slate-400 bg-slate-800/30 border-slate-700/50',
};

interface CreativeAssistantPanelProps {
  briefId: string;
  result: CreativeAssistantResult | undefined;
  onResultSaved: (result: CreativeAssistantResult) => void;
}

export const CreativeAssistantPanel: React.FC<CreativeAssistantPanelProps> = ({
  briefId,
  result,
  onResultSaved,
}) => {
  const [status, setStatus] = useState<CreativeAssistantStatus>(result ? 'success' : 'idle');
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<CreativeAssistantResult | null>(result || null);
  const [expanded, setExpanded] = useState(true);
  const [copiedPrompt, setCopiedPrompt] = useState<number | null>(null);

  const handleAnalyze = useCallback(async () => {
    setStatus('loading');
    setError(null);
    const token = sessionStorage.getItem('hadara_admin_token');
    if (!token) { setError('Token manquant'); setStatus('error'); return; }

    try {
      const res = await fetch(`${API_BASE}/api/ai/v1/briefs/${briefId}/creative-assistant/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Erreur ${res.status}`);
      }
      const resultData: CreativeAssistantResult = await res.json();
      setData(resultData);
      setStatus('success');
      onResultSaved(resultData);
    } catch (err: any) {
      setError(err.message || 'Erreur inconnue');
      setStatus('error');
    }
  }, [briefId, onResultSaved]);

  const handleCopyPrompt = (prompt: string, idx: number) => {
    navigator.clipboard.writeText(prompt);
    setCopiedPrompt(idx);
    setTimeout(() => setCopiedPrompt(null), 2000);
  };

  // ─── Idle ──────────────────────────────────────────────────────────────────
  if (status === 'idle' && !data) {
    return (
      <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-950 to-violet-950/30 border border-violet-900/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-violet-900/40 border border-violet-800/50">
              <Palette className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-100">Hadara AI — Creative Assistant</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Direction artistique IA · Concepts · Palette · Prompts
              </p>
            </div>
          </div>
          <button
            onClick={handleAnalyze}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white font-bold text-xs shadow-lg hover:brightness-110 flex items-center space-x-2 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Générer la direction artistique</span>
          </button>
        </div>
      </div>
    );
  }

  // ─── Loading ───────────────────────────────────────────────────────────────
  if (status === 'loading') {
    return (
      <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-950 to-violet-950/30 border border-violet-900/50">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-violet-900/40 border border-violet-800/50">
            <RefreshCw className="w-5 h-5 text-violet-400 animate-spin" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-100">Creative Assistant conceptualise...</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Direction artistique, concepts visuels</p>
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
              <h4 className="font-bold text-sm text-slate-100">Analyse creative échouée</h4>
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

  const d = data.direction_artistique;

  // ─── Result ────────────────────────────────────────────────────────────────
  return (
    <div className="rounded-2xl bg-gradient-to-br from-slate-950 via-slate-950 to-violet-950/20 border border-violet-900/40 overflow-hidden">
      {/* Header */}
      <div className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-900/30 transition-colors" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-violet-900/40 border border-violet-800/50">
            <Palette className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-100">Hadara AI — Creative Assistant</h4>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-[11px] text-violet-300 font-medium">
                « {d.concept_directeur || 'Concept'} »
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-[11px] text-slate-400">
                {data.concepts_visuels.length} concept(s) · {data.livrables_recommandes.length} livrable(s)
              </span>
            </div>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
      </div>

      {expanded && (
        <div className="px-5 pb-5 space-y-4 border-t border-slate-800/50 pt-4">

          {/* Quality Gate */}
          {data._quality_gate && (
            <QualityGateBar gate={data._quality_gate} />
          )}

          {/* Direction artistique */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-violet-400" />
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Direction Artistique</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase">Concept</span>
              <p className="text-sm font-bold text-slate-100 mt-0.5">{d.concept_directeur}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase">Ambiance</span>
              <p className="text-[11px] text-slate-300 mt-0.5">{d.ambiance}</p>
            </div>

            {/* Palette */}
            {d.palette.length > 0 && (
              <div>
                <span className="text-[10px] text-slate-500 uppercase mb-1.5 block">Palette</span>
                <div className="flex flex-wrap gap-2">
                  {d.palette.map((c, i) => (
                    <div key={i} className="flex items-center space-x-1.5 px-2 py-1 rounded-lg bg-slate-800 border border-slate-700">
                      <div className="w-3 h-3 rounded-full border border-slate-600" style={{ backgroundColor: c.hex }} />
                      <span className="text-[10px] text-slate-300">{c.nom}</span>
                      <span className="text-[9px] text-slate-500">{c.hex}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Typographies */}
            {d.typographies.length > 0 && (
              <div>
                <span className="text-[10px] text-slate-500 uppercase mb-1.5 block">Typographies</span>
                <div className="space-y-1">
                  {d.typographies.map((t, i) => (
                    <div key={i} className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-300 font-medium">{t.nom}</span>
                      <span className="text-slate-500">{t.usage} · {t.style}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Composition */}
            {d.composition.length > 0 && (
              <div>
                <span className="text-[10px] text-slate-500 uppercase mb-1.5 block">Composition</span>
                <div className="space-y-1">
                  {d.composition.map((c, i) => (
                    <p key={i} className="text-[11px] text-slate-300">• {c}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Éléments visuels */}
            {d.elements_visuels.length > 0 && (
              <div>
                <span className="text-[10px] text-slate-500 uppercase mb-1.5 block">Éléments Visuels</span>
                <div className="space-y-1">
                  {d.elements_visuels.map((e, i) => (
                    <p key={i} className="text-[11px] text-slate-300">• {e}</p>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Concepts visuels */}
          {data.concepts_visuels.length > 0 && (
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center space-x-2">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Concepts Visuels</span>
              </div>

              <div className="space-y-3">
                {data.concepts_visuels.map((c, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-100">{c.titre}</span>
                      <div className="flex items-center space-x-2">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${DIFFICULTE_COLOR[c.difficulte] || ''}`}>{c.difficulte}</span>
                        <span className="text-[9px] text-slate-500">{c.faisabilite}</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-300">{c.description}</p>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-500">{c.angle_marketing}</span>
                    </div>

                    {/* AI Prompt */}
                    {c.ai_prompt && (
                      <div className="mt-2 p-2 rounded-lg bg-slate-800/50 border border-slate-700">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[9px] text-violet-400 uppercase font-bold">AI Prompt</span>
                          <button
                            onClick={() => handleCopyPrompt(c.ai_prompt, i)}
                            className="px-2 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-[9px] text-slate-300 flex items-center space-x-1"
                          >
                            {copiedPrompt === i ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
                            <span>{copiedPrompt === i ? 'Copié' : 'Copier'}</span>
                          </button>
                        </div>
                        <p className="font-mono text-[10px] text-slate-400 leading-relaxed">{c.ai_prompt}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Conseils production */}
          {data.conseils_production.logiciels_recommandes.length > 0 && (
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-blue-400" />
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Conseils Production</span>
              </div>
              <div className="space-y-1 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Logiciels</span>
                  <span className="text-slate-300">{data.conseils_production.logiciels_recommandes.join(', ')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Formats</span>
                  <span className="text-slate-300">{data.conseils_production.formats_livraison.join(', ')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Résolution</span>
                  <span className="text-slate-300">{data.conseils_production.resolution}</span>
                </div>
              </div>
              {data.conseils_production.erreurs_a_eviter.length > 0 && (
                <div>
                  <span className="text-[9px] text-red-400 uppercase font-bold">Erreurs à éviter</span>
                  <div className="space-y-0.5 mt-1">
                    {data.conseils_production.erreurs_a_eviter.map((e, i) => (
                      <p key={i} className="text-[10px] text-red-300">• {e}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Livrables */}
          {data.livrables_recommandes.length > 0 && (
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Livrables Recommandés</span>
              </div>
              <div className="space-y-1.5">
                {data.livrables_recommandes.map((l, i) => (
                  <div key={i} className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-300">{l.nom}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-500 text-[10px]">{l.justification}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${PRIORITE_COLOR[l.priorite] || ''}`}>{l.priorite}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Accroche */}
          {data.accroche_visuelle && (
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-violet-950/30 to-purple-950/30 border border-violet-900/40">
              <span className="text-[9px] text-violet-400 uppercase font-bold">Accroche Visuelle</span>
              <p className="text-sm font-bold text-slate-100 mt-1">« {data.accroche_visuelle} »</p>
            </div>
          )}

          {/* Refresh */}
          <div className="flex justify-end pt-2">
            <button onClick={handleAnalyze} className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center space-x-2 transition-all">
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Relancer la direction artistique</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Quality Gate Bar ─────────────────────────────────────────────────────────

const QualityGateBar: React.FC<{ gate: CreativeQualityGate }> = ({ gate }) => {
  const pct = Math.round(gate.overall_score * 100);
  const barColor = gate.passed
    ? gate.overall_score >= 0.8 ? 'from-emerald-500 to-emerald-400' : 'from-amber-500 to-amber-400'
    : 'from-red-500 to-red-400';

  return (
    <div className={`p-3 rounded-xl border ${gate.passed ? 'bg-emerald-950/20 border-emerald-900/40' : 'bg-red-950/20 border-red-900/40'}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <ShieldCheck className={`w-4 h-4 ${gate.passed ? 'text-emerald-400' : 'text-red-400'}`} />
          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Quality Gate</span>
        </div>
        <span className={`text-sm font-bold ${gate.passed ? 'text-emerald-400' : 'text-red-400'}`}>
          {pct}%
        </span>
      </div>

      {/* Bar */}
      <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden mb-2">
        <div className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>

      {/* Checks */}
      <div className="space-y-1">
        {gate.checks.map((c, i) => (
          <div key={i} className="flex items-center justify-between text-[10px]">
            <div className="flex items-center space-x-1.5">
              {c.passed ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <AlertTriangle className="w-2.5 h-2.5 text-red-400" />}
              <span className={c.passed ? 'text-slate-300' : 'text-red-300'}>{c.name}</span>
            </div>
            <span className="text-slate-500">{c.detail}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
