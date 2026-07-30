import React, { useMemo } from 'react';
import { FileText, DollarSign, CheckCircle2, AlertCircle, BarChart3, TrendingUp, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';
import { BriefData } from '../../types';

interface AnalyticsTabProps {
  briefs: BriefData[];
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ briefs }) => {
  // KPIs
  const pipelineValue = briefs.filter(b => b.status !== 'termine' && b.status !== 'nouveau').reduce((acc, b) => acc + (b.quotedPriceFCFA || 0), 0);
  const realizedRevenue = briefs.filter(b => b.status === 'termine').reduce((acc, b) => acc + (b.quotedPriceFCFA || 0), 0);
  
  const newBriefsCount = briefs.filter(b => b.status === 'nouveau').length;
  const completedBriefs = briefs.filter(b => b.status === 'termine').length;
  const conversionRate = briefs.length > 0 ? Math.round((completedBriefs / briefs.length) * 100) : 0;

  // Chart Data: Group by projectType
  const projectTypesData = useMemo(() => {
    const counts: Record<string, number> = {};
    briefs.forEach(b => {
      const type = b.projectType || 'autre';
      counts[type] = (counts[type] || 0) + 1;
    });
    
    // Sort and calculate percentages for bars
    const maxCount = Math.max(...Object.values(counts), 1);
    return Object.entries(counts)
      .map(([type, count]) => ({
        type,
        count,
        heightPercentage: (count / maxCount) * 100
      }))
      .sort((a, b) => b.count - a.count); // sort descending
  }, [briefs]);

  const typeColors = [
    'from-amber-400 to-amber-600',
    'from-emerald-400 to-emerald-600',
    'from-blue-400 to-blue-600',
    'from-purple-400 to-purple-600',
    'from-rose-400 to-rose-600'
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay: 0.1}} className="bg-slate-900/90 border border-slate-700/50 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl" />
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6 text-amber-500" />
          </div>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">Nouveaux (À Traiter)</p>
          <h3 className="text-3xl font-bold text-amber-500 mt-1">{newBriefsCount}</h3>
        </motion.div>

        <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay: 0.2}} className="bg-slate-900/90 border border-slate-700/50 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl" />
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4">
            <DollarSign className="w-6 h-6 text-emerald-500" />
          </div>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">CA Réalisé (Terminé)</p>
          <h3 className="text-3xl font-bold text-slate-100 mt-1">{realizedRevenue.toLocaleString('fr-FR')} F</h3>
        </motion.div>
        
        <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay: 0.3}} className="bg-slate-900/90 border border-slate-700/50 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl" />
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-4">
            <TrendingUp className="w-6 h-6 text-blue-500" />
          </div>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">Pipeline (En Cours)</p>
          <h3 className="text-3xl font-bold text-slate-100 mt-1">{pipelineValue.toLocaleString('fr-FR')} F</h3>
        </motion.div>

        <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay: 0.4}} className="bg-slate-900/90 border border-slate-700/50 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl" />
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-6 h-6 text-purple-500" />
          </div>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">Taux de Conversion</p>
          <h3 className="text-3xl font-bold text-slate-100 mt-1">{conversionRate}%</h3>
        </motion.div>
      </div>

      {/* Chart Section */}
      <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay: 0.5}} className="bg-slate-900/90 border border-slate-700/50 rounded-3xl p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-amber-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-100">Répartition par Type de Projet</h2>
        </div>

        {projectTypesData.length > 0 ? (
          <div className="flex items-end gap-6 h-64 mt-4">
            {projectTypesData.slice(0, 7).map((item, index) => (
              <div key={item.type} className="flex-1 flex flex-col items-center gap-3 group">
                <div className="w-full flex-1 flex items-end justify-center relative">
                  {/* Tooltip */}
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-slate-100 text-xs font-bold py-1 px-3 rounded-lg shadow-xl whitespace-nowrap pointer-events-none">
                    {item.count} projets
                  </div>
                  {/* Bar */}
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${item.heightPercentage}%` }}
                    transition={{ duration: 1, delay: 0.5 + (index * 0.1), type: 'spring', bounce: 0.4 }}
                    className={`w-full max-w-[3rem] rounded-t-xl bg-gradient-to-t ${typeColors[index % typeColors.length]} opacity-80 group-hover:opacity-100 transition-opacity relative overflow-hidden`}
                  >
                    <div className="absolute inset-0 bg-white/20 blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.div>
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase text-center truncate w-full px-2">
                  {item.type.replace('_', ' ')}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-slate-700 rounded-2xl">
            <p className="text-slate-500 font-bold">Aucune donnée suffisante</p>
          </div>
        )}
      </motion.div>

    </div>
  );
};
