'use client';
import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, X, Bot, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import apiClient from '@/lib/apiClient';
import { formatCurrency } from '@/lib/utils';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

interface Message {
 role: 'user' | 'assistant';
 content: string;
 timestamp: Date;
}

export function FinancialAdvisorBot() {
 const { user, isAuthenticated } = useAuthStore();
 const pathname = usePathname();
 const [mounted, setMounted] = useState(false);

 useEffect(() => {
   setMounted(true);
 }, []);
 const { isChatOpen, toggleChat, closeChat, isFABOpen } = useUIStore();
 const [messages, setMessages] = useState<Message[]>([
 {
 role: 'assistant',
 content: '¡Hola! Soy tu asistente financiero personal de FinSense. ¿En qué puedo ayudarte hoy con tu presupuesto, metas de ahorro o gastos?',
 timestamp: new Date(),
 },
 ]);
 const [inputValue, setInputValue] = useState('');
 const [isLoading, setIsLoading] = useState(false);
 const [suggestions, setSuggestions] = useState<string[]>([]);
 const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
 const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isChatOpen) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg && lastMsg.role === 'assistant') {
        // Add a slight delay to avoid hitting API rate limits with simultaneous requests
        const timer = setTimeout(() => fetchSuggestions(), 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [isChatOpen, messages.length]);

  async function fetchSuggestions() {
    setIsLoadingSuggestions(true);
    try {
      const { data } = await apiClient.get<{ suggestions: string[] }>('/chat/suggestions');
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error('Error fetching suggestions', error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  }

 useEffect(() => {
 if (isChatOpen) {
 messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
 }
 }, [messages, isChatOpen]);

 // Wait for client hydration to avoid mismatches, and hide if not authenticated or on public pages
 if (!mounted || !pathname || !isAuthenticated || !user || pathname === '/' || pathname.startsWith('/auth') || pathname.includes('/new') || pathname.startsWith('/settings')) return null;

 async function handleSend() {
 if (!inputValue.trim() || isLoading) return;

 const userPrompt = inputValue.trim();
 setInputValue('');
 setSuggestions([]);

 const newMsg: Message = {
 role: 'user',
 content: userPrompt,
 timestamp: new Date(),
 };

 setMessages((prev) => [...prev, newMsg]);
 setIsLoading(true);

 try {
 const { data } = await apiClient.post<{ reply: string }>('/chat', {
 prompt: userPrompt,
 });

 setMessages((prev) => [
 ...prev,
 {
 role: 'assistant',
 content: data.reply,
 timestamp: new Date(),
 },
 ]);
 } catch {
 setMessages((prev) => [
 ...prev,
 {
 role: 'assistant',
 content: 'Lo siento, no pude comunicarme con mi servicio en este momento. Revisa tu API key de Gemini.',
 timestamp: new Date(),
 },
 ]);
 } finally {
 setIsLoading(false);
 }
 }

 return (
 <>
  {/* Floating Button */}
  <AnimatePresence>
    {!isFABOpen && (
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0, transition: { duration: 0.2 } }}
        onClick={toggleChat}
        className="tour-ai-bot fixed bottom-20 right-[92px] sm:bottom-8 sm:right-[112px] z-40 w-14 h-14 rounded-full bg-surface text-primary border-2 border-primary/20 shadow-blue-sm flex items-center justify-center hover:scale-105 hover:border-primary/50 hover:shadow-blue-lg active:scale-95 transition-all print:hidden"
        aria-label="Abrir asistente financiero"
        whileHover={{ y: -2 }}
        layout
      >
        {isChatOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </motion.button>
    )}
  </AnimatePresence>

  {/* Chat Window Panel */}
  <AnimatePresence>
  {isChatOpen && (
  <motion.div
  initial={{ opacity: 0, y: 50, scale: 0.9 }}
  animate={{ opacity: 1, y: 0, scale: 1 }}
  exit={{ opacity: 0, y: 50, scale: 0.9 }}
  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
  className="fixed bottom-36 right-4 sm:bottom-24 sm:right-6 z-40 w-[90vw] sm:w-[400px] h-[550px] bg-surface dark:bg-surface border border-border dark:border-white/10 rounded-[32px] shadow-blue-lg flex flex-col overflow-hidden print:hidden"
  >
  {/* Header */}
  <div className="bg-gradient-to-r from-primary to-accent/90 px-6 py-5 flex items-center justify-between text-white border-b border-white/10 shadow-sm relative overflow-hidden">
  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
  <div className="flex items-center gap-3 relative z-10">
 <div className="w-8 h-8 rounded-xl bg-surface/20 flex items-center justify-center">
 <Bot size={18} />
 </div>
 <div>
 <h3 className="font-syne font-bold text-sm">Asistente FinSense</h3>
 <div className="flex items-center gap-1">
 <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
 <span className="text-[10px] text-white/80 font-dm">Asistido con Gemini 1.5</span>
 </div>
  </div>
  </div>
  <button
  onClick={closeChat}
  className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-all backdrop-blur-sm relative z-10"
  aria-label="Cerrar chat"
  >
  <X size={18} />
  </button>
  </div>

  {/* Chat Messages */}
  <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-hide">
  <AnimatePresence initial={false}>
  {messages.map((msg, index) => {
  const isAI = msg.role === 'assistant';
  return (
  <motion.div
  key={index}
  initial={{ opacity: 0, y: 10, scale: 0.95 }}
  animate={{ opacity: 1, y: 0, scale: 1 }}
  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
  className={`flex ${isAI ? 'justify-start' : 'justify-end'}`}
  >
  <div
  className={`max-w-[85%] px-4 py-3 rounded-2xl text-xs sm:text-sm font-dm leading-relaxed shadow-sm ${
  isAI
  ? 'bg-surface-2 dark:bg-surface-3 border border-border text-text-primary rounded-tl-sm'
  : 'bg-gradient-primary text-white rounded-tr-sm border border-primary/20'
  }`}
  >
  {msg.content}
  </div>
  </motion.div>
  );
  })}
  {isLoading && (
  <motion.div 
    initial={{ opacity: 0, y: 10 }} 
    animate={{ opacity: 1, y: 0 }} 
    className="flex justify-start"
  >
  <div className="bg-surface-2 dark:bg-surface-3 border border-border px-4 py-3.5 rounded-2xl rounded-tl-sm flex items-center gap-1.5 shadow-sm">
 <span className="w-1.5 h-1.5 rounded-full bg-text-secondary/60 animate-bounce" style={{ animationDelay: '0ms' }} />
 <span className="w-1.5 h-1.5 rounded-full bg-text-secondary/60 animate-bounce" style={{ animationDelay: '150ms' }} />
  <span className="w-1.5 h-1.5 rounded-full bg-text-secondary/60 animate-bounce" style={{ animationDelay: '300ms' }} />
  </div>
  </motion.div>
  )}
  <div ref={messagesEndRef} />
  </AnimatePresence>
  </div>

  {/* Suggestions */}
  {isChatOpen && suggestions.length > 0 && !isLoading && (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-5 pb-3 pt-2 flex gap-2 overflow-x-auto scrollbar-hide border-t border-white/10"
    >
      {suggestions.map((suggestion, idx) => (
        <button
          key={idx}
          onClick={() => setInputValue(suggestion)}
          className="whitespace-nowrap px-4 py-2 bg-surface/60 hover:bg-gradient-to-r hover:from-primary hover:to-accent text-primary hover:text-white border border-primary/20 rounded-full text-[11px] font-bold font-dm transition-all duration-300 shadow-sm active:scale-95"
        >
          {suggestion}
        </button>
      ))}
    </motion.div>
  )}

  {/* Input Bar */}
  <div className="p-4 bg-surface/60 backdrop-blur-xl border-t border-white/10 flex items-center gap-3">
  <div className="flex-1 relative">
    <input
    type="text"
    value={inputValue}
    onChange={(e) => setInputValue(e.target.value)}
    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
    placeholder="Pregúntame cualquier cosa..."
    className="w-full bg-surface border border-border/50 rounded-2xl pl-4 pr-12 py-3.5 font-dm text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
    disabled={isLoading}
    />
    <button
    onClick={handleSend}
    disabled={!inputValue.trim() || isLoading}
    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent text-white flex items-center justify-center hover:shadow-blue-sm active:scale-95 disabled:opacity-50 disabled:grayscale transition-all"
    aria-label="Enviar mensaje"
    >
    <Send size={14} />
    </button>
  </div>
  </div>
  </motion.div>
  )}
  </AnimatePresence>
  </>
  );
}
