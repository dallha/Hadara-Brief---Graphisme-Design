import React, { useState, useCallback } from 'react';
import {
  Zap, RefreshCw, ChevronDown, ChevronUp, Check, AlertTriangle,
  Clock, Brain, DollarSign, Palette, MessageSquare, Loader2,
} from 'lucide-react';
import { WorkflowResult, WorkflowStatus } from '../../types';
import API_BASE from '../../config';

const STEP_ICONS: Record<string, React.FC<{ className?: string }>> = {
  analyst: Brain,
  pricing: DollarSign,
  creative: Palette,
  communication: MessageSquare,
};

const STEP_LABELS: Record<string, string> = {
  analyst: 'Brief Analyst',
  pricing: 'Pricing Agent',
  creative: 'Creative Assistant',
  communication: 'Communication Agent',
};

const STATUS_STYLE: Record<string, string> = {
  pending: 'text-slate-500 bg-slate-900/50 border-slate-700/50',
  running: 'text-cyan-400 bg-cyan-900/30 border-cyan-800/50',
  completed: 'text-emerald-400 bg-emerald-900/30 border-emerald-800/50',
  failed: 'text-red-400 bg-red-900/30 border-red-800/50',
  skipped: 'text-slate-400 bg-slate-800/30 border-slate-700/50',
};

interface WorkflowPanelProps {
  briefId: string;
  result: WorkflowResult | undefined;
  onResultSaved: (result: WorkflowResult) => void;
}

export const WorkflowPanel: React.FC<WorkflowPanelProps> = ({
  briefId,
  result,
  onResultSaved,
}) => {
  const [status, setStatus] = useState<WorkflowStatus>(result ? 'completed' : 'idle');
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<WorkflowResult | null>(result || null);
  const [expanded, setExpanded] = useState(true);

  const handleRun = useCallback(async () => {
    setStatus('running');
    setError(null);
    const token = sessionStorage.getItem('hadara_admin_token');
    if (!token) { setError('Token manquant'); setStatus('failed'); return; }

    try {
      const res = await fetch(`${API_BASE}/api/ai/v1/briefs/${briefId}/workflow/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Erreur ${res.status}`);
      }
      const resultData: WorkflowResult = await res.json();
      setData(resultData);
      setStatus(resultData.overall_status as WorkflowStatus);
      onResultSaved(resultData);
    } catch (err: any) {
      setError(err.message || 'Erreur inconnue');
      setStatus('failed');
    }
  }, [briefId, onResultSaved]);

  const completedSteps = data?.steps.filter(s => s.status === 'completed').length || 0;
  const totalSteps = data?.steps.length || 4;

  // ─── Idle ──────────────────────────────────────────────────────────────────
  if (status === 'idle' && !data) {
    return (
      <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-950 to-amber-950/30 border border-amber-900/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-amber-900/40 border border-amber-800/50">
              <Zap className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-100">Hadara AI — Workflow Complet</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Exécute les 4 agents en séquence automatique
              </p>
            </div>
          </div>
          <button
            onClick={handleRun}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs shadow-lg hover:brightness-110 flex items-center space-x-2 transition-all"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Lancer le workflow</span>
          </button>
        </div>

        <div className="mt-4 flex items-center space-x-3 text-[11px] text-slate-500">
          <span>4 étapes</span>
          <span>·</span>
          <span>~30s estimées</span>
          <span>·</span>
          <span>Analyst → Pricing → Creative → Communication</span>
        </div>
      </div>
    );
  }

  // ─── Running ───────────────────────────────────────────────────────────────
  if (status === 'running') {
    return (
      <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-950 to-amber-950/30 border border-amber-900/50">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 rounded-xl bg-amber-900/40 border border-amber-800/50">
            <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-100">Workflow en cours...</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">{completedSteps}/{totalSteps} étapes complétées</p>
          </div>
        </div>

        <div className="h-2 rounded-full bg-slate-800 overflow-hidden mb-4">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-400 transition-all duration-500"
            style={{ width: `${(completedSteps / totalSteps) * 100}%` }}
          />
        </div>

        <div className="grid grid-cols-4 gap-2">
          {['analyst', 'pricing', 'creative', 'communication'].map((step) => {
            const Icon = STEP_ICONS[step] || Brain;
            return (
              <div key={step} className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-center">
                <Icon className="w-4 h-4 mx-auto text-slate-500 mb-1" />
                <span className="text-[9px] text-slate-500">{STEP_LABELS[step]}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ─── Failed ────────────────────────────────────────────────────────────────
  if (status === 'failed' && !data) {
    return (
      <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-950 to-red-950/20 border border-red-900/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-red-900/40 border border-red-800/50">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-100">Workflow échoué</h4>
              <p className="text-[11px] text-red-400 mt-0.5">{error}</p>
            </div>
          </div>
          <button onClick={handleRun} className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center space-x-2">
            <RefreshCw className="w-3.5 h-3.5" /><span>Réessayer</span>
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const isComplete = data.overall_status === 'completed';

  // ─── Result ────────────────────────────────────────────────────────────────
  return (
    <div className={`rounded-2xl bg-gradient-to-br from-slate-950 via-slate-950 ${isComplete ? 'to-amber-950/20 border-amber-900/40' : 'to-red-950/20 border-red-900/40'} overflow-hidden`}>
      {/* Header */}
      <div className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-900/30 transition-colors" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-xl ${isComplete ? 'bg-amber-900/40 border border-amber-800/50' : 'bg-red-900/40 border border-red-800/50'}`}>
            <Zap className={`w-5 h-5 ${isComplete ? 'text-amber-400' : 'text-red-400'}`} />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-100">Hadara AI — Workflow Complet</h4>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${isComplete ? 'bg-emerald-900/40 text-emerald-400 border-emerald-800/50' : 'bg-red-900/40 text-red-400 border-red-800/50'}`}>
                {isComplete ? 'Complété' : 'Partiel'}
              </span>
              <span className="text-[11px] text-slate-400">
                {completedSteps}/{totalSteps} étapes · {(data.total_duration_ms / 1000).toFixed(1)}s
              </span>
            </div>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
      </div>

      {expanded && (
        <div className="px-5 pb-5 space-y-3 border-t border-slate-800/50 pt-4">

          {/* Steps */}
          {data.steps.map((step) => {
            const Icon = STEP_ICONS[step.name] || Brain;
            return (
              <div key={step.name} className={`flex items-center justify-between p-3 rounded-xl border ${STATUS_STYLE[step.status]}`}>
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4" />
                  <span className="text-[11px] font-bold">{STEP_LABELS[step.name]}</span>
                </div>
                <div className="flex items-center space-x-3">
                  {step.error && <span className="text-[10px] text-red-400">{step.error}</span>}
                  <span className="text-[10px]">
                    {step.status === 'completed' && '✅'}
                    {step.status === 'failed' && '❌'}
                    {step.status === 'skipped' && '⏭'}
                    {step.status === 'pending' && '⏳'}
                  </span>
                  {step.duration_ms > 0 && (
                    <span className="text-[10px] text-slate-500">
                      <Clock className="w-2.5 h-2.5 inline mr-0.5" />
                      {(step.duration_ms / 1000).toFixed(1)}s
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {/* Refresh */}
          <div className="flex justify-end pt-2">
            <button onClick={handleRun} className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center space-x-2 transition-all">
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Relancer le workflow</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
