import React, { useState, useCallback } from 'react';
import {
  MessageSquare, RefreshCw, ChevronDown, ChevronUp, Copy, Check,
  AlertTriangle, Send, Clock, ArrowRight, Smartphone, Mail, MessageCircle,
} from 'lucide-react';
import { CommunicationResult, CommunicationStatus, CommunicationType } from '../../types';
import API_BASE from '../../config';

const TYPE_OPTIONS: { value: CommunicationType; label: string; icon: string }[] = [
  { value: 'proposition', label: 'Proposition', icon: '📋' },
  { value: 'devis', label: 'Devis', icon: '💰' },
  { value: 'relance', label: 'Relance', icon: '📞' },
  { value: 'livraison', label: 'Livraison', icon: '📦' },
  { value: 'acceptation', label: 'Acceptation', icon: '✅' },
  { value: 'complet', label: 'Séquence complète', icon: '🔄' },
];

const TON_COLORS: Record<string, string> = {
  'professionnel': 'text-blue-400 bg-blue-900/30 border-blue-800/50',
  'chaleureux': 'text-amber-400 bg-amber-900/30 border-amber-800/50',
  'formel': 'text-slate-400 bg-slate-800/30 border-slate-700/50',
  'entreprenant': 'text-emerald-400 bg-emerald-900/30 border-emerald-800/50',
};

interface CommunicationAgentPanelProps {
  briefId: string;
  result: CommunicationResult | undefined;
  onResultSaved: (result: CommunicationResult) => void;
}

export const CommunicationAgentPanel: React.FC<CommunicationAgentPanelProps> = ({
  briefId,
  result,
  onResultSaved,
}) => {
  const [status, setStatus] = useState<CommunicationStatus>(result ? 'success' : 'idle');
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<CommunicationResult | null>(result || null);
  const [expanded, setExpanded] = useState(true);
  const [selectedType, setSelectedType] = useState<CommunicationType>('proposition');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'email' | 'sms'>('whatsapp');

  const handleGenerate = useCallback(async (type: CommunicationType) => {
    setStatus('loading');
    setError(null);
    setSelectedType(type);
    const token = sessionStorage.getItem('hadara_admin_token');
    if (!token) { setError('Token manquant'); setStatus('error'); return; }

    try {
      const res = await fetch(`${API_BASE}/api/ai/v1/briefs/${briefId}/communicate/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Erreur ${res.status}`);
      }
      const resultData: CommunicationResult = await res.json();
      setData(resultData);
      setStatus('success');
      onResultSaved(resultData);
    } catch (err: any) {
      setError(err.message || 'Erreur inconnue');
      setStatus('error');
    }
  }, [briefId, onResultSaved]);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // ─── Idle ──────────────────────────────────────────────────────────────────
  if (status === 'idle' && !data) {
    return (
      <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-950 to-cyan-950/30 border border-cyan-900/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-cyan-900/40 border border-cyan-800/50">
              <MessageSquare className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-100">Hadara AI — Communication Agent</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Messages client · WhatsApp · Email · Devis
              </p>
            </div>
          </div>
        </div>

        {/* Type selector */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          {TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleGenerate(opt.value)}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-800/50 text-center transition-all group"
            >
              <span className="text-lg">{opt.icon}</span>
              <p className="text-[10px] text-slate-400 mt-1 group-hover:text-cyan-400">{opt.label}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ─── Loading ───────────────────────────────────────────────────────────────
  if (status === 'loading') {
    return (
      <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-950 to-cyan-950/30 border border-cyan-900/50">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-cyan-900/40 border border-cyan-800/50">
            <RefreshCw className="w-5 h-5 text-cyan-400 animate-spin" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-100">Communication Agent rédige...</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Message {selectedType} en cours</p>
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
              <h4 className="font-bold text-sm text-slate-100">Communication échouée</h4>
              <p className="text-[11px] text-red-400 mt-0.5">{error}</p>
            </div>
          </div>
          <button onClick={() => handleGenerate(selectedType)} className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center space-x-2">
            <RefreshCw className="w-3.5 h-3.5" /><span>Réessayer</span>
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // ─── Result ────────────────────────────────────────────────────────────────
  const currentMessage = data.messages[activeTab] || '';
  const hasMultiple = data.type_message === 'complet';

  return (
    <div className="rounded-2xl bg-gradient-to-br from-slate-950 via-slate-950 to-cyan-950/20 border border-cyan-900/40 overflow-hidden">
      {/* Header */}
      <div className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-900/30 transition-colors" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-cyan-900/40 border border-cyan-800/50">
            <MessageSquare className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-100">Hadara AI — Communication Agent</h4>
            <div className="flex items-center space-x-2 mt-1">
              <span className="px-2 py-0.5 rounded-full bg-cyan-900/40 text-cyan-400 text-[10px] font-bold border border-cyan-800/50">
                {data.type_message}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${TON_COLORS[data.ton] || TON_COLORS.professionnel}`}>
                {data.ton}
              </span>
            </div>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
      </div>

      {expanded && (
        <div className="px-5 pb-5 space-y-4 border-t border-slate-800/50 pt-4">

          {/* Tabs WhatsApp / Email / SMS */}
          <div className="flex space-x-1 p-1 rounded-xl bg-slate-900 border border-slate-800">
            {([
              { key: 'whatsapp' as const, icon: MessageCircle, label: 'WhatsApp' },
              { key: 'email' as const, icon: Mail, label: 'Email' },
              { key: 'sms' as const, icon: Smartphone, label: 'SMS' },
            ]).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 flex items-center justify-center space-x-1.5 py-2 rounded-lg text-[11px] font-bold transition-all ${
                  activeTab === tab.key
                    ? 'bg-cyan-900/40 text-cyan-400 border border-cyan-800/50'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Message content */}
          {currentMessage && (
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                  Message {activeTab}
                </span>
                <button
                  onClick={() => handleCopy(currentMessage, activeTab)}
                  className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold flex items-center space-x-1"
                >
                  {copiedField === activeTab ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedField === activeTab ? 'Copié !' : 'Copier'}</span>
                </button>
              </div>
              <div className="font-mono text-[12px] text-slate-200 whitespace-pre-wrap leading-relaxed">
                {currentMessage}
              </div>
            </div>
          )}

          {/* Objets email */}
          {data.objets_email.length > 0 && activeTab === 'email' && (
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Objets suggérés</span>
              <div className="space-y-1 mt-2">
                {data.objets_email.map((obj, i) => (
                  <div key={i} className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-300">{obj}</span>
                    <button onClick={() => handleCopy(obj, `obj-${i}`)} className="text-slate-500 hover:text-cyan-400">
                      {copiedField === `obj-${i}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Points clés */}
          {data.points_cles.length > 0 && (
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Points clés</span>
              <div className="space-y-1 mt-2">
                {data.points_cles.map((p, i) => (
                  <div key={i} className="flex items-start space-x-2 text-[11px]">
                    <span className="text-cyan-400 mt-0.5">•</span>
                    <span className="text-slate-300">{p}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Prochaine action + timing */}
          <div className="grid grid-cols-2 gap-3">
            {data.prochaine_action && (
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex items-center space-x-1.5 mb-1">
                  <ArrowRight className="w-3 h-3 text-cyan-400" />
                  <span className="text-[9px] text-slate-500 uppercase font-bold">Prochaine action</span>
                </div>
                <p className="text-[11px] text-slate-300">{data.prochaine_action}</p>
              </div>
            )}
            {data.timing_conseille && (
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex items-center space-x-1.5 mb-1">
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span className="text-[9px] text-slate-500 uppercase font-bold">Timing</span>
                </div>
                <p className="text-[11px] text-slate-300">{data.timing_conseille}</p>
              </div>
            )}
          </div>

          {/* Alertes internes */}
          {data.alertes_internes.length > 0 && (
            <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-900/30">
              <span className="text-[10px] text-amber-400 uppercase font-bold">Alertes internes</span>
              <div className="space-y-1 mt-2">
                {data.alertes_internes.map((a, i) => (
                  <p key={i} className="text-[11px] text-amber-300">⚠ {a}</p>
                ))}
              </div>
            </div>
          )}

          {/* Actions rapides */}
          <div className="flex justify-between pt-2">
            <div className="flex space-x-2">
              {TYPE_OPTIONS.filter(t => t.value !== data.type_message && t.value !== 'complet').slice(0, 3).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleGenerate(opt.value)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 text-[10px] font-bold"
                >
                  {opt.icon} {opt.label}
                </button>
              ))}
            </div>
            <button onClick={() => handleGenerate(selectedType)} className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center space-x-2 transition-all">
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Régénérer</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
