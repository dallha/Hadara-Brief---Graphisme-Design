import React, { useState, useEffect } from 'react';
import { MessageSquare, Phone, X, Sparkles, Send, Clock, CheckCircle2 } from 'lucide-react';

export const FloatingWhatsApp: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Status detection: 'available' (green dot) or 'busy' (gray dot)
  const [status, setStatus] = useState<'available' | 'busy'>(() => {
    return (localStorage.getItem('hadara_designer_whatsapp_status') as 'available' | 'busy') || 'available';
  });

  useEffect(() => {
    const handleStatusChange = () => {
      const stored = (localStorage.getItem('hadara_designer_whatsapp_status') as 'available' | 'busy') || 'available';
      setStatus(stored);
    };

    window.addEventListener('whatsappStatusChange', handleStatusChange);
    window.addEventListener('storage', handleStatusChange);
    return () => {
      window.removeEventListener('whatsappStatusChange', handleStatusChange);
      window.removeEventListener('storage', handleStatusChange);
    };
  }, []);

  const primaryPhoneSN = '221776232741';

  const defaultMessage = encodeURIComponent("Bonjour El Hadji Abdoulaye Niass, je souhaite discuter d'un projet de création visuelle / site web.");

  const isAvailable = status === 'available';

  return (
    <div className="fixed bottom-24 right-3 sm:right-6 md:right-10 z-40 flex flex-col items-end print:hidden pointer-events-auto transition-all duration-300 floating-whatsapp-container">
      
      {/* Tooltip banner (can be closed by user) */}
      {!isOpen && showTooltip && (
        <div className="mb-3 max-w-xs bg-[#335A79] border border-[#816C07]/70 text-[#F5F5DC] p-3.5 rounded-2xl shadow-2xl backdrop-blur-2xl relative animate-bounce-short flex items-start space-x-3 group ring-1 ring-[#816C07]/40">
          <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
            isAvailable 
              ? 'bg-[#816C07] border-[#816C07]/60 text-[#F5F5DC]' 
              : 'bg-[#141c2e] border-[#335A79] text-[#D4C9BF]'
          }`}>
            <Sparkles className="w-4 h-4 text-[#F5F5DC]" />
          </div>
          <div className="space-y-1 text-xs pr-4">
            <div className="flex items-center space-x-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isAvailable ? 'bg-[#224A33] border border-[#F5F5DC] ring-2 ring-[#25D366] animate-pulse' : 'bg-slate-400'}`} />
              <p className="font-serif font-bold text-xs text-[#F5F5DC]">
                {isAvailable ? "Graphiste En Ligne !" : "En Création / Atelier"}
              </p>
            </div>
            <p className="text-[11px] text-[#F5F5DC] font-medium leading-snug">
              {isAvailable 
                ? "Discutez en direct avec le Graphiste de la Hadara sur WhatsApp." 
                : "Studio actuellement occupé. Laissez votre message, réponse assurée."}
            </p>
          </div>
          <button
            onClick={() => setShowTooltip(false)}
            className="absolute top-2 right-2 text-[#F5F5DC]/80 hover:text-[#F5F5DC] p-1 rounded-full hover:bg-[#816C07]/30"
            title="Fermer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Expanded Quick Contact Menu */}
      {isOpen && (
        <div className="mb-3 w-80 bg-[#335A79] border border-[#816C07]/70 rounded-2xl p-5 shadow-2xl space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-200 text-[#F5F5DC] backdrop-blur-2xl ring-1 ring-[#816C07]/40">
          <div className="flex items-center justify-between pb-3 border-b border-[#816C07]/40">
            <div className="flex items-center space-x-2.5">
              <div className={`w-9 h-9 rounded-xl border flex items-center justify-center font-bold ${
                isAvailable ? 'bg-[#816C07] border-[#816C07]/60 text-[#F5F5DC]' : 'bg-[#141c2e] border-[#816C07]/50 text-[#D4C9BF]'
              }`}>
                <MessageSquare className="w-5 h-5 text-[#F5F5DC]" />
              </div>
              <div>
                <h4 className="text-sm font-serif font-bold text-[#F5F5DC]">Contact WhatsApp Direct</h4>
                <div className="flex items-center space-x-1.5 mt-0.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${isAvailable ? 'bg-[#224A33] border border-[#F5F5DC] ring-2 ring-[#25D366] animate-pulse' : 'bg-slate-400'}`} />
                  <span className="text-[10px] font-serif font-bold text-[#F5F5DC]">
                    {isAvailable ? "En ligne • Réponse rapide" : "En studio • Réponse différée"}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[#F5F5DC]/80 hover:text-[#F5F5DC] p-1 rounded-lg hover:bg-[#816C07]/30"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-[#F5F5DC] font-serif font-medium leading-relaxed">
            Pour vos créations de visuels, logos, bâches grand format ou sites web via IA, contactez le studio :
          </p>

          <div className="space-y-2">
            {/* Primary Phone: Appels, WhatsApp & Telegram */}
            <a
              href={`https://wa.me/221776232741?text=${defaultMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-xl bg-[#224A33] hover:bg-[#1a3a28] border border-[#816C07]/60 transition-all text-xs font-bold text-[#F5F5DC] group shadow-lg"
            >
              <div className="flex items-center space-x-2.5">
                <span className="text-base">📞</span>
                <div>
                  <span className="block font-serif font-bold text-[#F5F5DC] text-[11px]">Appels, WhatsApp & Telegram</span>
                  <span className="text-[11px] text-amber-300 font-mono font-bold">+221 77 623 27 41</span>
                </div>
              </div>
              <Send className="w-4 h-4 text-[#F5F5DC] group-hover:translate-x-1 transition-transform" />
            </a>

            {/* Secondary Phone: WhatsApp & Telegram */}
            <a
              href={`https://wa.me/221763756363?text=${defaultMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 transition-all text-xs font-bold text-[#F5F5DC] group shadow-md"
            >
              <div className="flex items-center space-x-2.5">
                <span className="text-base">💬</span>
                <div>
                  <span className="block font-serif font-bold text-[#F5F5DC] text-[11px]">WhatsApp & Telegram</span>
                  <span className="text-[11px] text-emerald-400 font-mono font-bold">+221 76 375 63 63</span>
                </div>
              </div>
              <Send className="w-4 h-4 text-[#F5F5DC] group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          <div className="pt-2.5 text-center border-t border-[#816C07]/40 flex items-center justify-between text-[11px] font-serif text-[#F5F5DC]">
            <span className="font-bold text-[#F5F5DC]">Le Graphiste de la Hadara</span>
            <span className={`px-2.5 py-0.5 rounded-md font-bold text-[10px] ${isAvailable ? 'bg-[#224A33] text-[#F5F5DC] border border-[#816C07]/60' : 'bg-[#141c2e] text-[#D4C9BF]'}`}>
              {isAvailable ? "🟢 En ligne" : "⚪ Occupé"}
            </span>
          </div>
        </div>
      )}

      {/* Floating Main Trigger Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setShowTooltip(false);
        }}
        className={`relative group p-3 rounded-full font-bold transition-all duration-300 flex items-center justify-center border-2 border-[#816C07] shadow-2xl backdrop-blur-2xl hover:scale-105 active:scale-95 ${
          isAvailable
            ? 'bg-[#335A79] hover:bg-[#284963] text-[#F5F5DC] ring-2 ring-[#816C07]/60 shadow-[#816C07]/40'
            : 'bg-[#141c2e] text-[#D4C9BF] ring-1 ring-[#335A79]/50'
        }`}
        aria-label="Contact WhatsApp"
      >
        {/* Availability Badge Dot - Forest Green #224A33 */}
        {isAvailable ? (
          <>
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#224A33] rounded-full border-2 border-[#F5F5DC] ring-2 ring-[#25D366] animate-ping" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#224A33] rounded-full border-2 border-[#F5F5DC] ring-1 ring-[#25D366] flex items-center justify-center">
              <span className="w-1.5 h-1.5 bg-[#25D366] rounded-full" />
            </span>
          </>
        ) : (
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-slate-500 rounded-full border-2 border-[#335A79]" />
        )}

        {/* Recognizable WhatsApp Brand Icon Container */}
        <div className="w-8 h-8 rounded-full bg-[#25D366] flex items-center justify-center shadow-md transition-transform group-hover:scale-110">
          <svg 
            viewBox="0 0 24 24" 
            className="w-5 h-5 fill-white stroke-none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.705 1.754zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
          </svg>
        </div>
      </button>

    </div>
  );
};


