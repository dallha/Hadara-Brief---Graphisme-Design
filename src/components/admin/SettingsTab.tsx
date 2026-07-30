import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Brain, Bell, Moon, Database, Shield, Zap, Check } from 'lucide-react';
import { motion } from 'framer-motion';

export const SettingsTab: React.FC = () => {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('hadara_admin_settings');
    try {
      return saved ? JSON.parse(saved) : {
        aiSuggestions: true,
        soundNotifications: false,
        darkModeForced: true,
        autoRefresh: true
      };
    } catch (e) {
      return {
        aiSuggestions: true,
        soundNotifications: false,
        darkModeForced: true,
        autoRefresh: true
      };
    }
  });

  const [webhookUrl, setWebhookUrl] = useState('https://api.telegram.org/bot<TOKEN>/...');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    localStorage.setItem('hadara_admin_settings', JSON.stringify(settings));
  }, [settings]);

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings((p: any) => ({ ...p, [key]: !p[key] }));
  };

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const ToggleSwitch = ({ label, icon: Icon, settingKey, desc }: any) => (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50">
      <div className="flex items-center gap-4">
        <div className={`p-2.5 rounded-xl ${settings[settingKey] ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-700 text-slate-400'}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-slate-200">{label}</h4>
          <p className="text-xs text-slate-500">{desc}</p>
        </div>
      </div>
      <button 
        onClick={() => toggleSetting(settingKey)}
        className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${settings[settingKey] ? 'bg-amber-500' : 'bg-slate-600'}`}
      >
        <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${settings[settingKey] ? 'translate-x-6' : 'translate-x-0'}`} />
      </button>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
          <SettingsIcon className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Paramètres Système</h2>
          <p className="text-sm text-slate-400">Configuration avancée de votre espace de travail</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Préférences UI & UX */}
        <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="bg-slate-900/90 border border-slate-700/50 rounded-3xl p-8 shadow-xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Moon className="w-5 h-5 text-purple-400" /> Préférences d'Interface
          </h3>
          <div className="space-y-4">
            <ToggleSwitch label="Mode Sombre Forcé" icon={Moon} settingKey="darkModeForced" desc="Maintient l'interface en thème sombre en tout temps." />
            <ToggleSwitch label="Notifications Sonores" icon={Bell} settingKey="soundNotifications" desc="Joue un son lors de l'arrivée d'un nouveau brief." />
            <ToggleSwitch label="Rafraîchissement Auto" icon={Zap} settingKey="autoRefresh" desc="Vérifie les nouveaux briefs toutes les 5 minutes." />
          </div>
        </motion.div>

        {/* Intégrations & IA */}
        <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay: 0.1}} className="bg-slate-900/90 border border-slate-700/50 rounded-3xl p-8 shadow-xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Brain className="w-5 h-5 text-amber-400" /> Intégrations & Intelligence
          </h3>
          <div className="space-y-4">
            <ToggleSwitch label="IA Suggestive (Gemini)" icon={Brain} settingKey="aiSuggestions" desc="Active l'assistance de Google Gemini sur les briefs." />
            
            <div className="mt-6 pt-6 border-t border-slate-800">
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Webhook Telegram (Alertes)</label>
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  value={webhookUrl}
                  readOnly
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-500 font-mono"
                />
                <button 
                  onClick={handleCopyWebhook}
                  className="px-4 py-3 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors font-bold flex items-center gap-2"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : 'Copier'}
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-2">Ce lien est défini dans vos variables d'environnement (.env).</p>
            </div>
          </div>
        </motion.div>

        {/* Maintenance */}
        <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay: 0.2}} className="lg:col-span-2 bg-slate-900/90 border border-red-500/20 rounded-3xl p-8 shadow-xl">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 mb-6">
            <Shield className="w-5 h-5 text-red-400" /> Maintenance & Cache
          </h3>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1">
              <h4 className="font-bold text-slate-200">Vider le cache local</h4>
              <p className="text-sm text-slate-500 mt-1">Réinitialise les préférences locales, les vues et force le rechargement des données backend.</p>
            </div>
            <button 
              onClick={() => {
                if(window.confirm('Vider le cache local ? Vous devrez vous reconnecter.')) {
                  localStorage.clear();
                  sessionStorage.clear();
                  window.location.reload();
                }
              }}
              className="px-6 py-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 font-bold transition-colors whitespace-nowrap"
            >
              Purger le Cache
            </button>
          </div>
        </motion.div>

      </div>
    </div>
  );
};
