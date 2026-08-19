import React, { useState, useCallback } from 'react';
import {
  Zap, RefreshCw, ChevronDown, ChevronUp, Check, AlertTriangle,
  Clock, Brain, DollarSign, Palette, MessageSquare, Loader2, RotateCcw,
} from 'lucide-react';
import { WorkflowResult, WorkflowStatus, WorkflowStep } from '../../types';
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
  pending: 'border-slate-700/50',
  running: 'border-cyan-800/50 bg-cyan-950/20',
  completed: 'border-emerald-800/50 bg-emerald-950/20',
  failed: 'border-red-800/50 bg-red-950/20',
  skipped: 'border-slate-700/50 opacity-50',
  retrying: 'border-amber-800/50 bg-amber-950/20',
};

const STATUS_DOT: Record<string, string> = {
  pending: 'bg-slate-500',
  running: 'bg-cyan-400 animate-pulse',
  completed: 'bg-emerald-400',
  failed: 'bg-red-400',
  skipped: 'bg-slate-600',
  retrying: 'bg-amber-400 animate-pulse',
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
  const isComplete = data?.overall_status === 'completed';
  const isPartial = data?.overall_status === 'partial';

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
            const stepData = data?.steps.find(s => s.step_name === step);
            return (
              <div key={step} className={`p-2 rounded-lg bg-slate-900 border ${STATUS_STYLE[stepData?.status || 'pending']} text-center`}>
                <Icon className="w-4 h-4 mx-auto text-slate-500 mb-1" />
                <span className="text-[9px] text-slate-500">{STEP_LABELS[step]}</span>
                {stepData?.status === 'retrying' && (
                  <span className="text-[8px] text-amber-400 block mt-0.5">Retry</span>
                )}
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

  const borderColor = isComplete ? 'border-emerald-900/40' : isPartial ? 'border-amber-900/40' : 'border-red-900/40';
  const bgGradient = isComplete ? 'to-emerald-950/20' : isPartial ? 'to-amber-950/20' : 'to-red-950/20';

  // ─── Result ────────────────────────────────────────────────────────────────
  return (
    <div className={`rounded-2xl bg-gradient-to-br from-slate-950 via-slate-950 ${bgGradient} border ${borderColor} overflow-hidden`}>
      {/* Header */}
      <div className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-900/30 transition-colors" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-xl ${isComplete ? 'bg-emerald-900/40 border border-emerald-800/50' : isPartial ? 'bg-amber-900/40 border border-amber-800/50' : 'bg-red-900/40 border border-red-800/50'}`}>
            <Zap className={`w-5 h-5 ${isComplete ? 'text-emerald-400' : isPartial ? 'text-amber-400' : 'text-red-400'}`} />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-100">Hadara AI — Workflow Complet</h4>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                isComplete ? 'bg-emerald-900/40 text-emerald-400 border-emerald-800/50'
                : isPartial ? 'bg-amber-900/40 text-amber-400 border-amber-800/50'
                : 'bg-red-900/40 text-red-400 border-red-800/50'
              }`}>
                {isComplete ? 'Complété' : isPartial ? 'Partiel' : 'Échoué'}
              </span>
              <span className="text-[11px] text-slate-400">
                {completedSteps}/{totalSteps} · {(data.total_duration_ms / 1000).toFixed(1)}s
              </span>
              {data.total_cost_usd > 0 && (
                <span className="text-[10px] text-slate-500">
                  <DollarSign className="w-2.5 h-2.5 inline" />${data.total_cost_usd.toFixed(4)}
                </span>
              )}
              {data.retry_count > 0 && (
                <span className="text-[10px] text-amber-400">
                  <RotateCcw className="w-2.5 h-2.5 inline" /> {data.retry_count} retry
                </span>
              )}
            </div>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
      </div>

      {expanded && (
        <div className="px-5 pb-5 space-y-3 border-t border-slate-800/50 pt-4">

          {/* Timeline */}
          <div className="space-y-0">
            {data.steps.map((step, idx) => (
              <WorkflowStepRow key={step.id} step={step} isLast={idx === data.steps.length - 1} />
            ))}
          </div>

          {/* Timestamps */}
          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-800/50">
            <span>Début: {data.started_at ? new Date(data.started_at).toLocaleTimeString('fr-FR') : '—'}</span>
            <span>Fin: {data.completed_at ? new Date(data.completed_at).toLocaleTimeString('fr-FR') : '—'}</span>
          </div>

          {/* Refresh */}
          <div className="flex justify-end pt-1">
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


// ─── Step Row ─────────────────────────────────────────────────────────────────

const WorkflowStepRow: React.FC<{ step: WorkflowStep; isLast: boolean }> = ({ step, isLast }) => {
  const Icon = STEP_ICONS[step.step_name] || Brain;
  const label = STEP_LABELS[step.step_name] || step.step_name;

  const dotColor = STATUS_DOT[step.status] || 'bg-slate-500';
  const borderColor = STATUS_STYLE[step.status] || 'border-slate-700/50';

  return (
    <div className="flex items-start space-x-3">
      {/* Timeline line */}
      <div className="flex flex-col items-center">
        <div className={`w-3 h-3 rounded-full ${dotColor} mt-1.5`} />
        {!isLast && <div className="w-px h-full bg-slate-800 min-h-[24px]" />}
      </div>

      {/* Step content */}
      <div className={`flex-1 pb-3 ${!isLast ? '' : ''}`}>
        <div className={`flex items-center justify-between p-2.5 rounded-xl border ${borderColor}`}>
          <div className="flex items-center space-x-2">
            <Icon className={`w-3.5 h-3.5 ${step.status === 'completed' ? 'text-emerald-400' : step.status === 'failed' ? 'text-red-400' : 'text-slate-400'}`} />
            <span className="text-[11px] font-bold text-slate-200">{label}</span>
            {step.status === 'retrying' && (
              <span className="text-[9px] text-amber-400 bg-amber-900/30 px-1.5 py-0.5 rounded border border-amber-800/50">Retry</span>
            )}
          </div>
          <div className="flex items-center space-x-3 text-[10px]">
            {step.cost_usd > 0 && (
              <span className="text-slate-500">${step.cost_usd.toFixed(4)}</span>
            )}
            {step.duration_ms > 0 && (
              <span className="text-slate-500">
                <Clock className="w-2.5 h-2.5 inline mr-0.5" />
                {(step.duration_ms / 1000).toFixed(1)}s
              </span>
            )}
            <span className="text-slate-400">
              {step.status === 'completed' && '✅'}
              {step.status === 'failed' && '❌'}
              {step.status === 'skipped' && '⏭'}
              {step.status === 'pending' && '⏳'}
              {step.status === 'retrying' && '🔄'}
            </span>
          </div>
        </div>
        {step.error_message && step.status === 'failed' && (
          <p className="text-[10px] text-red-400 mt-1 ml-5">{step.error_message}</p>
        )}
      </div>
    </div>
  );
};
