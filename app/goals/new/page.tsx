'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, Target, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useUIStore } from '@/store/uiStore';
import { createGoal } from '@/services/goalService';
import { CATEGORIES } from '@/lib/constants';
import { getTodayISO, cn } from '@/lib/utils';

const EMOJIS = ['🎯', '💻', '🚗', '🏠', '✈️', '🎓', '💰', '🛡️', '🏆', '🎁'];

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

export default function NewGoalPage() {
  const router = useRouter();
  const { addToast } = useUIStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0].id);
  const [selectedEmoji, setSelectedEmoji] = useState(EMOJIS[0]);
  const [deadline, setDeadline] = useState(getTodayISO());
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Errors state
  const [titleError, setTitleError] = useState('');
  const [amountError, setAmountError] = useState('');

  async function handleSave() {
    let hasError = false;

    if (!title.trim()) {
      setTitleError('El título de la meta es obligatorio');
      hasError = true;
    } else {
      setTitleError('');
    }

    const numAmount = parseFloat(targetAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setAmountError('El monto objetivo debe ser mayor a 0');
      hasError = true;
    } else {
      setAmountError('');
    }

    if (hasError) {
      addToast({ message: 'Corrige los errores del formulario', type: 'warning' });
      return;
    }

    setIsLoading(true);
    try {
      await createGoal({
        title,
        description: description || undefined,
        targetAmount: numAmount,
        deadline,
        categoryId: selectedCategory,
        emoji: selectedEmoji
      });
      setShowSuccess(true);
    } catch {
      addToast({ message: 'Error al crear la meta', type: 'error' });
      setIsLoading(false);
    }
  }

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
          Crear nueva meta
        </h1>
      </header>

      <div className="flex-1 flex flex-col max-w-md mx-auto w-full p-4 space-y-5 pb-10">
        {/* Emoji Selector Card */}
        <div className="bg-surface border border-border rounded-2xl p-4 flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-surface-2 flex items-center justify-center text-4xl shadow-blue-sm border border-border/50 mb-3">
            {selectedEmoji}
          </div>
          <span className="font-dm text-xs text-text-secondary mb-3">
            Selecciona un ícono para tu meta
          </span>
          <div className="flex flex-wrap justify-center gap-2">
            {EMOJIS.map((emoji) => (
              <motion.button
                key={emoji}
                type="button"
                onClick={() => setSelectedEmoji(emoji)}
                className={cn(
                  'w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all',
                  selectedEmoji === emoji
                    ? 'bg-primary text-white border-2 border-primary shadow-blue-sm scale-110'
                    : 'bg-surface-2 text-text-primary border border-border hover:bg-surface-3'
                )}
                whileTap={{ scale: 0.9 }}
              >
                {emoji}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Inputs */}
        <div className="space-y-4">
          <Input
            label="Título de la meta"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (e.target.value.trim()) setTitleError('');
            }}
            error={titleError}
            placeholder="Ej. Laptop UNACH"
          />

          <Input
            label="Monto objetivo (MXN)"
            value={targetAmount}
            type="number"
            onChange={(e) => {
              setTargetAmount(e.target.value);
              const val = parseFloat(e.target.value);
              if (!isNaN(val) && val > 0) setAmountError('');
            }}
            error={amountError}
            placeholder="Ej. 8000"
          />

          {/* Date Picker */}
          <div className="space-y-1">
            <span className="font-dm text-xs text-text-secondary pl-1">Fecha límite</span>
            <div className="relative">
              <Calendar
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
              />
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-surface border border-border rounded-xl font-dm text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                aria-label="Fecha límite"
              />
            </div>
          </div>

          {/* Category Picker */}
          <div className="space-y-2">
            <span className="font-dm text-xs text-text-secondary pl-1">Categoría vinculada</span>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    'py-2 px-3 rounded-xl border font-dm text-xs font-semibold transition-all flex flex-col items-center gap-1',
                    selectedCategory === cat.id
                      ? 'border-primary bg-primary/5 text-primary shadow-blue-sm'
                      : 'border-border bg-surface text-text-secondary hover:bg-surface-2'
                  )}
                >
                  <span className="text-base">{cat.emoji}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción de la meta (opcional)..."
              className="w-full px-4 py-3 bg-surface border border-border rounded-xl font-dm text-xs sm:text-sm text-text-primary placeholder-text-secondary resize-none focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
              rows={3}
              maxLength={150}
              aria-label="Descripción de la meta"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <Button
            fullWidth
            loading={isLoading}
            onClick={handleSave}
            className="from-primary to-primary-light"
          >
            Crear meta
          </Button>
        </div>
      </div>

      {/* Success Animation */}
      <AnimatePresence>
        {showSuccess && (
          <SuccessAnimation onDone={() => router.push('/goals')} />
        )}
      </AnimatePresence>
    </div>
  );
}
