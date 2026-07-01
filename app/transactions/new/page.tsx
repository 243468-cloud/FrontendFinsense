'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, Calendar, FileText, TrendingDown, TrendingUp, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useUIStore } from '@/store/uiStore';
import { createTransaction } from '@/services/transactionService';
import { CATEGORIES, INCOME_CATEGORIES } from '@/lib/constants';
import { cn, getTodayISO, formatCurrency, getIconForEmoji } from '@/lib/utils';
import type { CategoryId, TransactionType } from '@/types/transaction.types';

// Refined numeric keypad with tactile depth
function NumericKeypad({
  onKey,
}: {
  onKey: (key: string) => void;
}) {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫'];

  return (
    <div className="grid grid-cols-3 gap-3">
      {keys.map((key) => (
        <motion.button
          key={key}
          type="button"
          className="h-14 rounded-3xl bg-white border-b-4 border-slate-200 active:border-b-0 active:translate-y-1 font-mono font-bold text-xl text-text-primary hover:bg-slate-50 transition-all duration-75 shadow-sm flex items-center justify-center"
          onClick={() => onKey(key)}
          whileTap={{ scale: 0.96 }}
          aria-label={key === '⌫' ? 'Borrar' : key}
        >
          {key === '⌫' ? (
            <span className="text-xl">⌫</span>
          ) : (
            key
          )}
        </motion.button>
      ))}
    </div>
  );
}

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

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('0');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | string>('food');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(getTodayISO());
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const t = params.get('type');
      if (t === 'income' || t === 'expense') {
        setType(t);
      }
    }
  }, []);

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
      await createTransaction({
        type,
        amount: numAmount,
        categoryId: selectedCategory as CategoryId,
        note,
        date,
      });
      setShowSuccess(true);
    } catch {
      addToast({ message: 'Error al guardar', type: 'error' });
      setIsLoading(false);
    }
  }

  const isExpense = type === 'expense';

  return (
    <div className="min-h-screen bg-[#F0F5FF] flex flex-col text-text-primary">
      {/* ─── Header ─── */}
      <header className="relative flex items-center justify-center px-4 py-4 bg-white border-b border-border">
        <button
          onClick={() => router.back()}
          className="absolute left-4 touch-target rounded-xl hover:bg-slate-100 transition-colors p-2"
          aria-label="Volver"
        >
          <ArrowLeft size={22} className="text-text-primary" />
        </button>
        <h1 className="font-syne font-bold text-lg text-text-primary text-center">
          Nueva transacción
        </h1>
      </header>

      <div className="flex-1 flex flex-col max-w-md mx-auto w-full p-4 space-y-5 pb-8 justify-between">
        <div className="space-y-4">
          {/* ─── Type Toggle ─── */}
          <div
            className="flex bg-slate-100 rounded-full p-1 border border-slate-200"
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

          {/* ─── Amount Display ─── */}
          <div className="text-center py-2">
            <p className="font-dm text-xs sm:text-sm text-text-secondary mb-0.5 font-semibold">
              {isExpense ? 'Monto del gasto' : 'Monto del ingreso'}
            </p>
            <motion.p
              className="font-mono font-bold text-5xl sm:text-6xl tracking-tight transition-colors duration-300"
              animate={{ color: isExpense ? '#EF4444' : '#10B981' }}
              transition={{ duration: 0.3 }}
              aria-label={`Monto: $${amount}`}
            >
              ${amount}
            </motion.p>
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
                          : 'border-green-500 bg-green-50/70 text-green-700 ring-2 ring-green-500/10 font-bold'
                        : 'border-border bg-white text-text-secondary hover:bg-slate-50 hover:text-text-primary shadow-sm'
                    )}
                  >
                    <div
                      className={cn(
                        'w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0',
                        isSelected 
                          ? isExpense ? 'bg-red-500/10' : 'bg-green-500/10'
                          : 'bg-slate-100'
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
              className="w-full pl-11 pr-4 py-3.5 bg-white border border-border rounded-xl font-dm text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all shadow-sm"
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
              className="w-full pl-11 pr-4 py-3.5 bg-white border border-border rounded-xl font-dm text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all shadow-sm"
              aria-label="Fecha de la transacción"
            />
          </div>
        </div>

        <div className="space-y-4 pt-2">
          {/* ─── Numeric Keypad ─── */}
          <NumericKeypad onKey={handleKey} />

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
    </div>
  );
}
