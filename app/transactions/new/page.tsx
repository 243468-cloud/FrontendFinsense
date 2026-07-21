'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, Calendar, FileText, TrendingDown, TrendingUp, Loader2, Camera, ScanLine, Mic } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useUIStore } from '@/store/uiStore';
import { createTransaction } from '@/services/transactionService';
import { useAuthStore } from '@/store/authStore';
import { CATEGORIES, INCOME_CATEGORIES } from '@/lib/constants';
import { cn, getTodayISO, formatCurrency, getIconForEmoji, getMinDateISO } from '@/lib/utils';
import type { CategoryId, TransactionType } from '@/types/transaction.types';
import { VoiceRecorderModal } from '@/components/transactions/VoiceRecorderModal';



// Success checkmark animation on save
function SuccessAnimation({ onDone }: { onDone: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="w-24 h-24 rounded-full bg-success flex items-center justify-center"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        onAnimationComplete={() => setTimeout(onDone, 800)}
      >
        <motion.div
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <Check size={48} className="text-white" strokeWidth={3} />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default function NewTransactionPage() {
  const router = useRouter();
  const { addToast } = useUIStore();
  const { updateUserStats, user } = useAuthStore();

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('0');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | string>('food');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(getTodayISO());
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const t = params.get('type');
      if (t === 'income' || t === 'expense') {
        setType(t);
      }
      if (params.get('voice') === 'true') {
        startListening();
      }
    }
  }, []);

  function startListening() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      addToast({ message: 'Tu navegador no soporta reconocimiento de voz', type: 'error' });
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'es-MX';
    
    recognition.onstart = () => {
      setIsListening(true);
      setShowVoiceModal(true);
      setNote(''); // Clear previous note to show only new transcript
    };
    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      
      const matchAmount = transcript.match(/(\d+(\.\d+)?)/);
      if (matchAmount) setAmount(matchAmount[0]);

      if (transcript.includes('ingreso') || transcript.includes('gané') || transcript.includes('recibí')) {
        setType('income');
      } else {
        setType('expense');
      }

      setNote(transcript);
      addToast({ message: `Voz: "${transcript}"`, type: 'success' });
    };

    recognition.start();
  }

  function handleKey(key: string) {
    if (key === '⌫') {
      setAmount((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0'));
      return;
    }
    if (key === '.' && amount.includes('.')) return;
    if (amount.includes('.') && amount.split('.')[1]?.length >= 2) return;

    setAmount((prev) => {
      if (prev === '0' && key !== '.') return key;
      return prev + key;
    });
  }

  async function handleSave() {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      addToast({ message: 'Ingresa un monto válido', type: 'warning' });
      return;
    }



    setIsLoading(true);
    try {
      const res = await createTransaction({
        type,
        amount: numAmount,
        categoryId: selectedCategory as CategoryId,
        note,
        date,
      });
      if (res.streakResult && user) {
        updateUserStats(res.streakResult.currentStreak, user.level, res.streakResult.longestStreak);
      }
      setShowSuccess(true);
    } catch {
      addToast({ message: 'Error al guardar', type: 'error' });
      setIsLoading(false);
    }
  }

  const isExpense = type === 'expense';

  return (
    <div className="min-h-screen bg-surface flex flex-col text-text-primary">
      {/* ─── Header ─── */}
      <header className="relative flex items-center justify-between px-4 py-4 bg-surface border-b border-border">
        <button
          onClick={() => router.back()}
          className="touch-target rounded-xl hover:bg-surface-2 transition-colors p-2"
          aria-label="Volver"
        >
          <ArrowLeft size={22} className="text-text-primary" />
        </button>
        <h1 className="font-syne font-bold text-lg text-text-primary text-center">
          Nueva transacción
        </h1>
        <button
          onClick={startListening}
          className={cn("p-2 rounded-xl transition-colors", isListening ? "bg-red-500 text-white animate-pulse" : "text-purple-500 bg-purple-50 hover:bg-purple-100")}
          aria-label="Voz"
        >
          <Mic size={22} />
        </button>
      </header>

      <div className="flex-1 flex flex-col max-w-md mx-auto w-full p-4 space-y-5 pb-8 justify-between">
        <div className="space-y-4">
          {/* ─── Type Toggle ─── */}
          <div
            className="flex bg-surface-3 rounded-full p-1 border border-border"
            role="radiogroup"
            aria-label="Tipo de transacción"
          >
            {(['expense', 'income'] as TransactionType[]).map((t) => {
              const isSelected = type === t;
              return (
                <button
                  key={t}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  className={cn(
                    'flex-1 py-2.5 text-xs sm:text-sm font-dm font-bold rounded-full flex items-center justify-center gap-2 relative transition-colors duration-200 z-10',
                    isSelected
                      ? 'text-white'
                      : 'text-text-secondary hover:text-text-primary'
                  )}
                  onClick={() => {
                    setType(t);
                    setSelectedCategory(t === 'expense' ? 'food' : 'salary');
                  }}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="active-type-bg"
                      className={cn(
                        'absolute inset-0 rounded-full z-[-1] shadow-sm',
                        t === 'expense' ? 'bg-red-500' : 'bg-success'
                      )}
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  {t === 'expense' ? (
                    <>
                      <TrendingDown size={16} />
                      <span>Gasto</span>
                    </>
                  ) : (
                    <>
                      <TrendingUp size={16} />
                      <span>Ingreso</span>
                    </>
                  )}
                </button>
              );
            })}
          </div>

          {/* ─── Amount Input ─── */}
          <div className="text-center py-2 flex flex-col items-center">
            <p className="font-dm text-xs sm:text-sm text-text-secondary mb-0.5 font-semibold">
              {isExpense ? 'Monto del gasto' : 'Monto del ingreso'}
            </p>
            <div className="relative flex items-center justify-center">
              <span className={cn("font-mono font-bold text-5xl sm:text-6xl tracking-tight transition-colors duration-300 mr-1", isExpense ? 'text-red-500' : 'text-success')}>
                $
              </span>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                onFocus={(e) => { if(e.target.value === '0') setAmount('') }}
                onBlur={(e) => { if(e.target.value === '') setAmount('0') }}
                className={cn(
                  "font-mono font-bold text-5xl sm:text-6xl tracking-tight transition-colors duration-300 bg-transparent border-none focus:outline-none focus:ring-0 w-[4ch] sm:w-[5ch]",
                  isExpense ? 'text-red-500' : 'text-success'
                )}
                aria-label="Monto"
              />
            </div>
          </div>

          {/* ─── Category Grid ─── */}
          <div className="space-y-2">
            <p className="font-dm font-bold text-xs sm:text-sm text-text-primary pl-1">Categoría</p>
            <div
              className="grid grid-cols-3 gap-2.5"
              role="radiogroup"
              aria-label="Categoría"
            >
              {(isExpense ? CATEGORIES : INCOME_CATEGORIES).map((cat) => {
                const isSelected = selectedCategory === cat.id;
                const Icon = getIconForEmoji(cat.emoji);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={cn(
                      'flex flex-col items-center gap-1.5 p-2 rounded-2xl border transition-all duration-200 justify-center text-center',
                      isSelected
                        ? isExpense
                          ? 'border-red-500 bg-red-50/70 text-red-600 ring-2 ring-red-500/10 font-bold'
                          : 'border-success bg-success/10/70 text-success ring-2 ring-success/10 font-bold'
                        : 'border-border bg-surface text-text-secondary hover:bg-surface-2 hover:text-text-primary shadow-sm'
                    )}
                  >
                    <div
                      className={cn(
                        'w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0',
                        isSelected 
                          ? isExpense ? 'bg-red-500/10' : 'bg-success/10'
                          : 'bg-surface-3'
                      )}
                    >
                      <Icon size={16} style={{ color: isSelected ? (isExpense ? '#FF3B5C' : '#10B981') : cat.color }} />
                    </div>
                    <span className="font-dm text-[11px] font-semibold leading-tight">
                      {cat.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ─── Note Input ─── */}
          <div className="relative">
            <FileText
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Nota (opcional)"
              className="w-full pl-11 pr-4 py-3.5 bg-surface border border-border rounded-xl font-dm text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all shadow-sm"
              aria-label="Nota de la transacción"
            />
          </div>

          {/* ─── Date Picker ─── */}
          <div className="relative">
            <Calendar
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-surface border border-border rounded-xl font-dm text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all shadow-sm"
              aria-label="Fecha de la transacción"
            />
          </div>
        </div>

        <div className="space-y-4 pt-2">


          {/* ─── Save Button ─── */}
          <motion.button
            type="button"
            className="text-white py-3.5 font-bold shadow-md rounded-2xl border w-full flex items-center justify-center font-dm font-semibold transition-all duration-200 select-none relative"
            animate={{
              backgroundColor: isExpense ? '#EF4444' : '#10B981',
              borderColor: isExpense ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
            }}
            transition={{ duration: 0.3 }}
            onClick={handleSave}
            disabled={isLoading}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? (
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
            ) : (
              `Guardar ${isExpense ? 'gasto' : 'ingreso'}`
            )}
          </motion.button>
        </div>
      </div>

      {/* ─── Success Animation ─── */}
      <AnimatePresence>
        {showSuccess && (
          <SuccessAnimation onDone={() => router.push('/dashboard')} />
        )}
      </AnimatePresence>

      <VoiceRecorderModal
        isOpen={showVoiceModal}
        isListening={isListening}
        transcript={note} // Use note state to temporarily hold the transcript
        onClose={() => setShowVoiceModal(false)}
        onStop={() => {
          setIsListening(false);
          // If we had a reference to recognition we would call recognition.stop() here
        }}
      />
    </div>
  );
}
