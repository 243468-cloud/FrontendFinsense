'use client';
// Nueva Transacción — teclado numérico, selector de categoría, bottom sheet
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, Calendar, FileText, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CategoryBadge } from '@/components/ui/CategoryBadge';
import { useUIStore } from '@/store/uiStore';
import { createTransaction } from '@/services/transactionService';
import { CATEGORIES } from '@/lib/constants';
import { getTodayISO, formatCurrency } from '@/lib/utils';
import type { CategoryId, TransactionType } from '@/types/transaction.types';

// Numeric keypad
function NumericKeypad({
  onKey,
}: {
  onKey: (key: string) => void;
}) {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫'];

  return (
    <div className="grid grid-cols-3 gap-2">
      {keys.map((key) => (
        <motion.button
          key={key}
          className="h-14 rounded-2xl bg-surface-2 border border-border font-mono font-semibold text-xl text-text-primary hover:bg-surface-3 active:bg-surface-3 transition-colors"
          onClick={() => onKey(key)}
          whileTap={{ scale: 0.93 }}
          aria-label={key === '⌫' ? 'Borrar' : key}
        >
          {key}
        </motion.button>
      ))}
    </div>
  );
}

// Checkmark animation on save
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
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('food');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(getTodayISO());
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

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
        categoryId: selectedCategory,
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
  const displayAmount = parseFloat(amount || '0');

  return (
    <div className="min-h-screen bg-surface-2 flex flex-col">
      {/* ─── Header ─── */}
      <header className="flex items-center gap-3 px-4 py-4 bg-surface border-b border-border">
        <button
          onClick={() => router.back()}
          className="touch-target rounded-xl hover:bg-surface-2 transition-colors"
          aria-label="Volver"
        >
          <ArrowLeft size={22} className="text-text-primary" />
        </button>
        <h1 className="font-syne font-bold text-lg text-text-primary flex-1">
          Nueva transacción
        </h1>
      </header>

      <div className="flex-1 flex flex-col max-w-md mx-auto w-full">
        {/* ─── Type Toggle ─── */}
        <div className="px-4 pt-4">
          <div
            className="flex bg-surface rounded-xl border border-border p-1"
            role="radiogroup"
            aria-label="Tipo de transacción"
          >
            {(['expense', 'income'] as TransactionType[]).map((t) => {
              const isSelected = type === t;
              return (
                <button
                  key={t}
                  role="radio"
                  aria-checked={isSelected}
                  className="flex-1 py-2.5 text-sm font-dm font-semibold rounded-lg transition-all duration-200 relative"
                  onClick={() => setType(t)}
                >
                  <span
                    className={isSelected ? 'relative z-10 text-white' : 'text-text-secondary'}
                  >
                    {t === 'expense' ? '💸 Gasto' : '💰 Ingreso'}
                  </span>
                  {isSelected && (
                    <motion.div
                      layoutId="type-indicator"
                      className={`absolute inset-0 rounded-lg ${t === 'expense' ? 'bg-red-500' : 'bg-success'}`}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── Amount Display ─── */}
        <motion.div
          className="px-4 py-6 text-center"
          animate={{ color: isExpense ? '#FF3B5C' : '#00C896' }}
        >
          <p className="font-dm text-sm text-text-secondary mb-1">
            {isExpense ? 'Monto del gasto' : 'Monto del ingreso'}
          </p>
          <motion.p
            className="font-mono font-bold text-6xl"
            key={amount}
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.1 }}
            aria-label={`Monto: $${amount}`}
            aria-live="polite"
          >
            ${amount}
          </motion.p>
        </motion.div>

        {/* ─── Numeric Keypad ─── */}
        <div className="px-4">
          <NumericKeypad onKey={handleKey} />
        </div>

        {/* ─── Category Selector ─── */}
        <div className="px-4 mt-4">
          <p className="font-dm font-semibold text-sm text-text-primary mb-3">Categoría</p>
          <div
            className="grid grid-cols-5 gap-2"
            role="radiogroup"
            aria-label="Categoría"
          >
            {CATEGORIES.map((cat) => (
              <div key={cat.id} className="flex flex-col items-center gap-1">
                <CategoryBadge
                  category={cat.id as CategoryId}
                  selected={selectedCategory === cat.id}
                  onClick={() => setSelectedCategory(cat.id as CategoryId)}
                  size="md"
                />
                <span className="text-xs font-dm text-text-secondary text-center leading-tight">
                  {cat.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Note Field ─── */}
        <div className="px-4 mt-4">
          <div className="relative">
            <FileText
              size={18}
              className="absolute left-3 top-3 text-text-secondary"
              aria-hidden="true"
            />
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Nota (opcional)..."
              className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-xl font-dm text-sm text-text-primary placeholder-text-secondary resize-none focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
              rows={2}
              maxLength={100}
              aria-label="Nota de la transacción"
            />
          </div>
        </div>

        {/* ─── Date Selector ─── */}
        <div className="px-4 mt-3">
          <div className="relative">
            <Calendar
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-xl font-dm text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
              aria-label="Fecha de la transacción"
            />
          </div>
        </div>

        {/* ─── Save Button ─── */}
        <div className="px-4 mt-4 pb-8">
          <Button
            fullWidth
            size="lg"
            loading={isLoading}
            onClick={handleSave}
            className={isExpense ? 'from-red-500 to-red-400' : 'from-success to-emerald-400'}
          >
            Guardar {isExpense ? 'gasto' : 'ingreso'}
          </Button>
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
