import React, { useState, useEffect } from 'react';
import {
  BarChart3, DollarSign, Zap, Users, Clock, TrendingUp, Brain,
  DollarSign as DollarIcon, Palette, MessageSquare, RefreshCw,
} from 'lucide-react';
import { AnalyticsDashboard, AgentAnalytics } from '../../types';
import API_BASE from '../../config';

const AGENT_COLORS: Record<string, string> = {
  brief_analyst: 'from-blue-500 to-blue-400',
  pricing_agent: 'from-emerald-500 to-emerald-400',
  creative_assistant: 'from-violet-500 to-violet-400',
  communication_agent: 'from-cyan-500 to-cyan-400',
};

const AGENT_ICONS: Record<string, React.FC<{ className?: string }>> = {
  brief_analyst: Brain,
  pricing_agent: DollarIcon,
  creative_assistant: Palette,
  communication_agent: MessageSquare,
};

export const AnalyticsDashboardPanel: React.FC = () => {
  const [data, setData] = useState<AnalyticsDashboard | null>(null);
  const [agents, setAgents] = useState<AgentAnalytics[]>([]);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const token = sessionStorage.getItem('hadara_admin_token');
    if (!token) return;

    try {
      const [dashRes, agentsRes] = await Promise.all([
        fetch(`${API_BASE}/api/ai/v1/analytics/dashboard/?days=${days}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/api/ai/v1/analytics/agents/?days=${days}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
      ]);

      if (dashRes.ok) setData(await dashRes.json());
      if (agentsRes.ok) setAgents(await agentsRes.json());
    } catch (err) {
      console.error('Analytics fetch error:', err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [days]);

  if (loading && !data) {
    return (
      <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-950 to-indigo-950/30 border border-indigo-900/50">
        <div className="flex items-center space-x-3">
          <RefreshCw className="w-5 h-5 text-indigo-400 animate-spin" />
          <span className="text-sm text-slate-400">Chargement des analytics...</span>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="rounded-2xl bg-gradient-to-br from-slate-950 via-slate-950 to-indigo-950/20 border border-indigo-900/40 overflow-hidden">
      {/* Header */}
      <div className="p-5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-indigo-900/40 border border-indigo-800/50">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-100">Hadara AI — Analytics & ROI</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Performance des agents · Coûts · Retour sur investissement
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                days === d
                  ? 'bg-indigo-900/40 text-indigo-400 border border-indigo-800/50'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {d}j
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 pb-5 space-y-4 border-t border-slate-800/50 pt-4">

        {/* KPI Grid */}
        <div className="grid grid-cols-4 gap-3">
          <KPICard
            icon={DollarSign}
            label="Coût Total"
            value={`$${data.total_cost_usd.toFixed(4)}`}
            sub={`${data.total_tokens.toLocaleString()} tokens`}
            color="emerald"
          />
          <KPICard
            icon={Zap}
            label="Workflows"
            value={`${data.completed_workflows}/${data.total_workflows}`}
            sub={`${data.success_rate}% succès`}
            color="amber"
          />
          <KPICard
            icon={Users}
            label="Briefs Analysés"
            value={`${data.briefs_analyzed}`}
            sub={`${data.acceptance_rate}% acceptés`}
            color="blue"
          />
          <KPICard
            icon={TrendingUp}
            label="ROI"
            value={`${data.roi_ratio}x`}
            sub={`${data.revenue_attributed_fcfa.toLocaleString()} FCFA attribué`}
            color="violet"
          />
        </div>

        {/* Agent Breakdown */}
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Performance par Agent</span>
          <div className="space-y-2">
            {agents.map((a) => {
              const Icon = AGENT_ICONS[a.agent] || Brain;
              const maxCalls = Math.max(...agents.map(x => x.total_calls), 1);
              const pct = (a.total_calls / maxCalls) * 100;

              return (
                <div key={a.agent} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Icon className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-[11px] font-bold text-slate-200">{a.label}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-[10px] text-slate-500">
                      <span>{a.total_calls} appels</span>
                      <span>${a.total_cost_usd.toFixed(4)}</span>
                      <span>{(a.avg_duration_ms / 1000).toFixed(1)}s</span>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${AGENT_COLORS[a.agent] || 'from-slate-500 to-slate-400'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cost per brief + Avg duration */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center space-x-2 mb-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span className="text-[10px] text-slate-500 uppercase font-bold">Coût par Brief</span>
            </div>
            <p className="text-lg font-bold text-slate-100">${data.cost_per_brief.toFixed(6)}</p>
            <p className="text-[10px] text-slate-500 mt-1">Moyenne sur {data.period_days} jours</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span className="text-[10px] text-slate-500 uppercase font-bold">Durée Moyenne</span>
            </div>
            <p className="text-lg font-bold text-slate-100">{(data.avg_duration_ms / 1000).toFixed(1)}s</p>
            <p className="text-[10px] text-slate-500 mt-1">Workflow complété</p>
          </div>
        </div>
      </div>
    </div>
  );
};


// ─── KPI Card ────────────────────────────────────────────────────────────────

const KPICard: React.FC<{
  icon: React.FC<{ className?: string }>;
  label: string;
  value: string;
  sub: string;
  color: string;
}> = ({ icon: Icon, label, value, sub, color }) => {
  const colors: Record<string, string> = {
    emerald: 'bg-emerald-900/40 border-emerald-800/50 text-emerald-400',
    amber: 'bg-amber-900/40 border-amber-800/50 text-amber-400',
    blue: 'bg-blue-900/40 border-blue-800/50 text-blue-400',
    violet: 'bg-violet-900/40 border-violet-800/50 text-violet-400',
  };

  return (
    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
      <div className="flex items-center space-x-2 mb-2">
        <div className={`p-1.5 rounded-lg border ${colors[color] || ''}`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
        <span className="text-[10px] text-slate-500 uppercase font-bold">{label}</span>
      </div>
      <p className="text-lg font-bold text-slate-100">{value}</p>
      <p className="text-[10px] text-slate-500 mt-0.5">{sub}</p>
    </div>
  );
};
