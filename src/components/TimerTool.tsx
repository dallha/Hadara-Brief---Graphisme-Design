import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Clock, Plus, Trash2, Sparkles, Receipt } from 'lucide-react';
import { ToolsNav } from './ToolsNav';

interface Session {
  id: string;
  description: string;
  seconds: number;
  rate: number;
  amount: number;
}

interface TimerToolProps {
  onGoToInvoice?: () => void;
}

export const TimerTool: React.FC<TimerToolProps> = ({ onGoToInvoice }) => {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [hourlyRate, setHourlyRate] = useState(5000); // FCFA/h
  const [description, setDescription] = useState('');
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    let interval: any = null;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (totalSec: number) => {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentAmount = Math.round((seconds / 3600) * hourlyRate);

  const saveSession = () => {
    if (seconds === 0) return;
    const newSession: Session = {
      id: Date.now().toString(),
      description: description || 'Session de travail',
      seconds,
      rate: hourlyRate,
      amount: currentAmount,
    };
    setSessions(prev => [newSession, ...prev]);
    setSeconds(0);
    setIsRunning(false);
    setDescription('');
  };

  const removeSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
  };

  const totalSessionsAmount = sessions.reduce((sum, s) => sum + s.amount, 0);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-24 px-3 sm:px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4 pt-6 sm:pt-16">
        <ToolsNav />
        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
          <Sparkles className="w-4 h-4" />
          <span>Outils Gratuits Hadara Studio</span>
        </div>
        <h1 className="text-2xl sm:text-5xl font-serif font-extrabold text-slate-100">
          Minuterie de <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Facturation Horaire</span>
        </h1>
        <p className="text-slate-400 text-sm max-w-2xl mx-auto">
          Chronométrez votre temps de travail en direct et calculez automatiquement le montant à facturer à votre client.
        </p>
      </motion.div>

      {/* Timer Display Card */}
      <div className="p-6 sm:p-10 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-6 shadow-2xl relative overflow-hidden">
        <div className="flex justify-center items-center gap-4">
          <div className="space-y-1">
            <label className="text-xs text-slate-400 uppercase font-bold">Tarif Horaire (FCFA/h)</label>
            <input
              type="number"
              value={hourlyRate}
              onChange={e => setHourlyRate(Number(e.target.value))}
              className="w-36 text-center bg-slate-950 border border-slate-700 rounded-xl py-2 text-sm text-amber-400 font-mono font-bold focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Digital Clock */}
        <div className="font-mono text-5xl sm:text-7xl font-black tracking-wider text-slate-100 py-4 select-none">
          {formatTime(seconds)}
        </div>

        <div className="text-xl font-bold font-mono text-emerald-400">
          = {currentAmount.toLocaleString('fr-FR')} FCFA
        </div>

        {/* Session Description */}
        <div className="max-w-md mx-auto">
          <input
            type="text"
            placeholder="Nom de la tâche / projet..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`px-8 py-3.5 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all active:scale-95 shadow-lg ${
              isRunning
                ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
            }`}
          >
            {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            <span>{isRunning ? 'Pause' : 'Démarrer'}</span>
          </button>

          <button
            onClick={() => { setSeconds(0); setIsRunning(false); }}
            className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
            title="Réinitialiser"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={saveSession}
            disabled={seconds === 0}
            className="px-6 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-sm disabled:opacity-40 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Enregistrer</span>
          </button>
        </div>
      </div>

      {/* Saved Sessions Table */}
      {sessions.length > 0 && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Sessions enregistrées ({sessions.length})</h3>
            <div className="text-sm font-mono font-bold text-amber-400">Total : {totalSessionsAmount.toLocaleString('fr-FR')} FCFA</div>
          </div>

          <div className="space-y-2">
            {sessions.map(s => (
              <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/60 text-xs">
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-200">{s.description}</div>
                  <div className="font-mono text-slate-500">{formatTime(s.seconds)} • {s.rate.toLocaleString()} FCFA/h</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-emerald-400 text-sm">{s.amount.toLocaleString()} FCFA</span>
                  <button onClick={() => removeSession(s.id)} className="p-1 text-slate-500 hover:text-rose-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {onGoToInvoice && (
            <button
              onClick={onGoToInvoice}
              className="w-full py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Receipt className="w-4 h-4" />
              <span>Générer la facture avec ces sessions ({totalSessionsAmount.toLocaleString()} FCFA)</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
