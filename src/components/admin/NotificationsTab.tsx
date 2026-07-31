import React, { useState } from 'react';
import { BriefData, NotificationItem } from '../../types';
import { 
  Bell, 
  CheckCircle2, 
  MessageSquare, 
  Send, 
  Clock, 
  AlertCircle, 
  Check, 
  Trash2, 
  ExternalLink, 
  Filter 
} from 'lucide-react';

interface NotificationsTabProps {
  briefs: BriefData[];
}

export const NotificationsTab: React.FC<NotificationsTabProps> = ({ briefs }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    // Generate notification list based on briefs events
    return briefs.flatMap((b, idx) => [
      {
        id: `notif-new-${b.id}`,
        title: `Nouveau brief reçu : "${b.mainTitle}"`,
        message: `Client ${b.clientName} (${b.whatsapp}). Projet : ${b.projectType.toUpperCase()}`,
        type: 'info',
        channel: 'internal',
        read: idx > 2,
        createdAt: new Date(b.createdAt).toLocaleString('fr-FR'),
        briefId: b.id
      },
      ...(b.status === 'acompte_recu' ? [{
        id: `notif-pay-${b.id}`,
        title: `Acompte 50% validé !`,
        message: `Acompte reçu pour le projet ${b.id} de ${b.clientName}. Passé en création.`,
        type: 'success' as const,
        channel: 'whatsapp' as const,
        read: false,
        createdAt: new Date().toLocaleString('fr-FR'),
        briefId: b.id
      }] : [])
    ]);
  });

  const [filterRead, setFilterRead] = useState<'all' | 'unread'>('all');

  const filteredNotifs = notifications.filter(n => filterRead === 'all' || !n.read);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const toggleRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: !n.read } : n));
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-slate-100 flex items-center gap-2">
            <Bell className="w-6 h-6 text-amber-400" />
            <span>Centre de Notifications & Alertes Multi-canaux</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">Alertes temps réel (Internal, WhatsApp direct & Email)</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center space-x-1.5"
          >
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Tout marquer comme lu</span>
          </button>
        </div>
      </div>

      {/* Notifications Controls & List */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 bg-slate-900 p-2 rounded-2xl border border-slate-800 w-fit">
          <button
            onClick={() => setFilterRead('all')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterRead === 'all' ? 'bg-amber-400 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Toutes ({notifications.length})
          </button>
          <button
            onClick={() => setFilterRead('unread')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterRead === 'unread' ? 'bg-amber-400 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Non lues ({notifications.filter(n => !n.read).length})
          </button>
        </div>

        <div className="space-y-3">
          {filteredNotifs.length === 0 ? (
            <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center text-slate-500 text-xs">
              Aucune notification.
            </div>
          ) : (
            filteredNotifs.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                  notif.read
                    ? 'bg-slate-950/60 border-slate-800/80 text-slate-400'
                    : 'bg-slate-900 border-amber-500/30 text-slate-100 shadow-md'
                }`}
              >
                <div className="flex items-start space-x-3.5">
                  <div className={`p-2.5 rounded-xl shrink-0 ${
                    notif.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    <Bell className="w-4 h-4" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-bold">{notif.title}</h4>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      )}
                    </div>
                    <p className="text-xs text-slate-400">{notif.message}</p>
                    <p className="text-[10px] text-slate-500 font-mono mt-1">{notif.createdAt}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => toggleRead(notif.id)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
                    title={notif.read ? "Marquer comme non lu" : "Marquer comme lu"}
                  >
                    <Check className={`w-4 h-4 ${notif.read ? 'text-emerald-400' : 'text-slate-400'}`} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};
