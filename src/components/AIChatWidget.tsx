import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';
import API_BASE from '../config';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export const AIChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Bonjour ! 👋 Je suis l'assistant IA de MrNiass. Comment puis-je vous aider pour votre projet ?" }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: inputValue.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/chat/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content }))
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: "Oups, je rencontre un problème réseau. Vous pouvez contacter MrNiass sur WhatsApp !" }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Désolé, impossible de joindre le serveur. N'hésitez pas à utiliser WhatsApp !" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent("Bonjour MrNiass, je vous contacte depuis le site web.");
    window.open(`https://wa.me/221773099958?text=${text}`, '_blank');
  };

  return (
    <div className="fixed bottom-6 sm:bottom-24 right-4 sm:right-6 z-[100] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mb-4 w-[calc(100vw-2rem)] sm:w-[350px] bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden flex flex-col"
            style={{ height: '500px', maxHeight: 'calc(100vh - 120px)' }}
          >
            {/* Header */}
            <div className="bg-slate-800 p-4 border-b border-slate-700/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-400 rounded-full flex items-center justify-center shrink-0">
                  <Bot className="w-6 h-6 text-slate-900" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100">Assistant IA</h3>
                  <p className="text-xs text-amber-400">En ligne</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/50">
              {messages.map((msg, idx) => (
                <div key={idx} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
                    msg.role === 'user' 
                      ? "bg-amber-400 text-slate-950 rounded-tr-sm" 
                      : "bg-slate-800 text-slate-200 border border-slate-700/50 rounded-tl-sm"
                  )}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 text-slate-400 border border-slate-700/50 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1 items-center">
                    <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Footer / Input */}
            <div className="p-3 bg-slate-800 border-t border-slate-700/50 space-y-2">
              <form onSubmit={handleSend} className="relative flex items-center">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Tapez votre question..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-full pl-4 pr-12 py-3 text-sm text-slate-200 focus:outline-none focus:border-amber-400/50 transition-colors"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className="absolute right-2 p-2 rounded-full bg-amber-400 text-slate-900 hover:bg-amber-300 disabled:opacity-50 disabled:hover:bg-amber-400 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
              <button
                type="button"
                onClick={handleWhatsApp}
                className="w-full py-2 bg-slate-900/50 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-full transition-colors flex items-center justify-center gap-2 border border-slate-700/30"
              >
                <Phone className="w-3 h-3 text-green-400" />
                Finaliser sur WhatsApp
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-transform hover:scale-110 active:scale-95",
          isOpen ? "bg-slate-800 text-slate-200 border border-slate-700" : "bg-amber-400 text-slate-950"
        )}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>
    </div>
  );
};
