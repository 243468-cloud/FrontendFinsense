'use client';
// Metas Gamificadas — racha, insignias, metas activas, reto semanal, XP bar + Creación y Abono de Metas
import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Plus, Trophy, Clock, X, PiggyBank, Trash2 } from 'lucide-react';
import { PageTransition, containerVariants, itemVariants } from '@/components/layout/PageTransition';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { StreakCounter } from '@/components/ui/StreakCounter';
import { AchievementBadge } from '@/components/ui/AchievementBadge';
import { SkeletonCard } from '@/components/ui/SkeletonCard';
import { Button } from '@/components/ui/Button';
import { getGoals, createGoal, updateProgress, deleteGoal } from '@/services/goalService';
import { getTransactions } from '@/services/transactionService';
import { getProfile } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import {
  MOCK_ACHIEVEMENTS,
  MOCK_WEEKLY_CHALLENGE,
} from '@/lib/mockData';
import { formatCurrency, getCountdown, getLevelProgress } from '@/lib/utils';
import type { Goal } from '@/types/goal.types';

// Confetti component
function Confetti({ active }: { active: boolean }) {
  if (!active) return null;
  const pieces = Array.from({ length: 25 }, (_, i) => ({
    id: i,
    color: ['#0057FF', '#00C2FF', '#00C896', '#FFB800', '#FF6B6B'][i % 5],
    x: Math.random() * 100,
    delay: Math.random() * 0.4,
    duration: 1.5 + Math.random(),
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden" aria-hidden="true">
      {pieces.map((piece) => (
        <motion.div
          key={piece.id}
          className="absolute w-3 h-3 rounded-sm"
          style={{
            left: `${piece.x}%`,
            top: -20,
            backgroundColor: piece.color,
          }}
          initial={{ y: -20, rotate: 0, opacity: 1 }}
          animate={{ y: '110vh', rotate: 720, opacity: 0 }}
          transition={{ duration: piece.duration, delay: piece.delay, ease: 'linear' }}
        />
      ))}
    </div>
  );
}

// Countdown display
function CountdownTimer({ deadline }: { deadline: string }) {
  const [time, setTime] = useState(getCountdown(deadline));

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getCountdown(deadline));
    }, 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  return (
    <div className="flex gap-2" aria-live="polite" aria-label="Tiempo restante">
      {[
        { value: time.days, label: 'd' },
        { value: time.hours, label: 'h' },
        { value: time.minutes, label: 'm' },
        { value: time.seconds, label: 's' },
      ].map(({ value, label }) => (
        <div key={label} className="flex flex-col items-center">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <span className="font-mono font-bold text-sm text-white">
              {String(value).padStart(2, '0')}
            </span>
          </div>
          <span className="text-xs text-white/60 font-dm mt-0.5">{label}</span>
        </div>
      ))}
    </div>
  );
}

export default function GoalsPage() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const { addToast } = useUIStore();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  // Create Form State
  const [goalTitle, setGoalTitle] = useState('');
  const [goalTargetAmount, setGoalTargetAmount] = useState('');
  const [goalDeadline, setGoalDeadline] = useState('');
  const [goalEmoji, setGoalEmoji] = useState('🎯');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Deposit Form State
  const [depositAmount, setDepositAmount] = useState('');
  const [isDepositing, setIsDepositing] = useState(false);
  const [weeklyTransportSpending, setWeeklyTransportSpending] = useState(0);

  const level = user ? getLevelProgress(user.xp) : null;
  const challenge = {
    ...MOCK_WEEKLY_CHALLENGE,
    currentAmount: weeklyTransportSpending,
    isCompleted: weeklyTransportSpending > 0 && weeklyTransportSpending <= MOCK_WEEKLY_CHALLENGE.targetAmount,
  };

  const fetchGoalsAndUser = useCallback(async () => {
    try {
      const goalsData = await getGoals();
      setGoals(goalsData);
      
      // Update local user data to get fresh XP/Streak
      const profileData = await getProfile();
      setUser(profileData);

      // Fetch real transactions for the weekly transport spending challenge
      const txs = await getTransactions();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const transportTxs = txs.filter(
        (t) =>
          t.categoryId === 'transport' &&
          t.type === 'expense' &&
          new Date(t.date || t.createdAt) >= sevenDaysAgo
      );
      const totalTransport = transportTxs.reduce((sum, t) => sum + t.amount, 0);
      setWeeklyTransportSpending(totalTransport);
    } catch {
      addToast({ message: 'Error cargando metas', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [addToast, setUser]);

  useEffect(() => {
    fetchGoalsAndUser();
  }, [fetchGoalsAndUser]);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle.trim() || !goalTargetAmount || Number(goalTargetAmount) <= 0) {
      addToast({ message: 'Por favor, llena los campos con datos válidos', type: 'warning' });
      return;
    }

    try {
      setIsSubmitting(true);
      await createGoal({
        title: goalTitle,
        targetAmount: Number(goalTargetAmount),
        deadline: goalDeadline || undefined,
        emoji: goalEmoji,
        categoryId: 'savings',
      });

      addToast({ message: 'Meta creada con éxito', type: 'success' });
      setShowCreateModal(false);
      setGoalTitle('');
      setGoalTargetAmount('');
      setGoalDeadline('');
      setGoalEmoji('🎯');
      fetchGoalsAndUser();
    } catch {
      addToast({ message: 'Error al crear la meta', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoal || !depositAmount || Number(depositAmount) <= 0) {
      addToast({ message: 'Por favor, ingresa un monto válido', type: 'warning' });
      return;
    }

    try {
      setIsDepositing(true);
      const amount = Number(depositAmount);
      const updated = await updateProgress(selectedGoal.id, amount);
      
      const completed = updated.currentAmount >= updated.targetAmount;
      if (completed) {
        setShowConfetti(true);
        addToast({ message: '¡Meta completada! 🎉 +100 XP', type: 'success' });
        setTimeout(() => setShowConfetti(false), 4000);
      } else {
        addToast({ message: `Abono de ${formatCurrency(amount)} guardado. +20 XP`, type: 'success' });
      }

      setShowDepositModal(false);
      setDepositAmount('');
      setSelectedGoal(null);
      fetchGoalsAndUser();
    } catch {
      addToast({ message: 'Error al realizar el depósito', type: 'error' });
    } finally {
      setIsDepositing(false);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta meta?')) return;
    try {
      await deleteGoal(id);
      addToast({ message: 'Meta eliminada', type: 'success' });
      fetchGoalsAndUser();
    } catch {
      addToast({ message: 'Error al eliminar la meta', type: 'error' });
    }
  };

  return (
    <PageTransition className="min-h-screen bg-surface-2 pb-24">
      <Confetti active={showConfetti} />

      {/* ─── Header ─── */}
      <header className="sticky top-0 z-20 bg-surface/95 backdrop-blur-xl border-b border-border px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="font-syne font-bold text-xl text-text-primary">Mis Metas</h1>
          <p className="font-dm text-xs text-text-secondary">Progreso gamificado</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 bg-primary text-white px-4 py-2 rounded-xl font-dm font-semibold text-sm hover:bg-primary-dark transition-colors"
          aria-label="Nueva meta"
        >
          <Plus size={16} aria-hidden="true" />
          Nueva meta
        </button>
      </header>

      <div className="px-4 py-4 space-y-4 max-w-2xl mx-auto">
        {/* ─── Streak + XP ─── */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="bg-surface rounded-2xl p-4 border border-border shadow-card"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-dm text-xs text-text-secondary mb-1">Racha actual</p>
              <StreakCounter days={user?.streakDays ?? 0} size="md" />
            </div>
            <div className="text-right">
              <p className="font-dm text-xs text-text-secondary mb-1">Mejor racha</p>
              <p className="font-syne font-bold text-2xl text-text-primary">
                {user?.maxStreak ?? 0} <span className="text-sm text-text-secondary font-dm">días</span>
              </p>
            </div>
          </div>

          {/* XP Level bar */}
          {level && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-syne font-bold text-xs"
                    aria-label={`Nivel ${level.level}`}
                  >
                    {level.level}
                  </div>
                  <div>
                    <p className="font-dm font-semibold text-sm text-text-primary">Nivel {level.level}</p>
                    <p className="font-dm text-xs text-text-secondary">
                      {level.xpInLevel} / {level.xpForNextLevel} XP
                    </p>
                  </div>
                </div>
                <Trophy size={20} className="text-warning" aria-hidden="true" />
              </div>
              <ProgressBar
                value={level.xpInLevel}
                max={level.xpForNextLevel}
                color="#FFB800"
                trackColor="#E8EEFF"
                showLabel
                label="Progreso al siguiente nivel"
                height="md"
              />
            </div>
          )}
        </motion.div>

        {/* ─── Reto de la Semana ─── */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl p-5"
          style={{
            background: 'linear-gradient(135deg, #0057FF 0%, #00C2FF 100%)',
            boxShadow: '0 8px 32px rgba(0, 87, 255, 0.25)',
          }}
        >
          <div
            className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-20"
            style={{ background: 'rgba(255,255,255,0.4)' }}
            aria-hidden="true"
          />
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-3">
              <div>
                <span className="text-white/70 font-dm text-xs uppercase tracking-wide">
                  Reto de la semana
                </span>
                <h2 className="font-syne font-bold text-lg text-white mt-0.5">
                  {challenge.emoji} {challenge.title}
                </h2>
                <p className="font-dm text-white/80 text-sm mt-1">
                  {challenge.description}
                </p>
              </div>
            </div>

            <CountdownTimer deadline={challenge.deadline} />

            <div className="mt-4">
              <div className="flex justify-between text-white/70 text-xs font-dm mb-1.5">
                <span>Progreso</span>
                <span className="font-mono font-semibold text-white">
                  {formatCurrency(challenge.currentAmount)} / {formatCurrency(challenge.targetAmount)}
                </span>
              </div>
              <ProgressBar
                value={challenge.currentAmount}
                max={challenge.targetAmount}
                color="rgba(255,255,255,0.9)"
                trackColor="rgba(255,255,255,0.2)"
                height="sm"
              />
            </div>

            <div className="mt-3 flex items-center gap-2">
              <span className="text-warning text-sm font-mono font-bold">
                +{challenge.xpReward} XP
              </span>
              <span className="text-white/50 text-xs font-dm">al completar</span>
            </div>
          </div>
        </motion.div>

        {/* ─── Active Goals ─── */}
        <div>
          <h2 className="font-syne font-bold text-base text-text-primary mb-3">
            Metas activas
          </h2>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-3"
          >
            {isLoading
              ? [1, 2].map((i) => <SkeletonCard key={i} lines={3} />)
              : goals.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 border border-border text-center">
                  <p className="font-dm text-text-secondary text-sm">No tienes metas de ahorro activas.</p>
                  <Button size="sm" className="mt-4" onClick={() => setShowCreateModal(true)}>
                    Crear mi primera meta
                  </Button>
                </div>
              ) : goals
                  .filter((g) => g.status === 'active')
                  .map((goal) => {
                    const pct = Math.round((goal.currentAmount / goal.targetAmount) * 100);
                    const isComplete = goal.currentAmount >= goal.targetAmount;
                    return (
                      <motion.div
                        key={goal.id}
                        variants={itemVariants}
                        className="bg-surface rounded-2xl p-4 border border-border shadow-card"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div
                            className="w-12 h-12 rounded-2xl bg-surface-2 flex items-center justify-center text-2xl"
                            aria-hidden="true"
                          >
                            {goal.emoji}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-syne font-bold text-sm text-text-primary truncate">
                                {goal.title}
                              </p>
                              <button
                                onClick={() => handleDeleteGoal(goal.id)}
                                className="text-red-400 hover:text-red-600 p-1"
                                aria-label="Eliminar meta"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                            <p className="font-dm text-xs text-text-secondary mt-0.5">
                              Meta: {formatCurrency(goal.targetAmount)}
                            </p>
                          </div>
                          <span
                            className="font-mono font-bold text-sm"
                            style={{ color: isComplete ? '#00C896' : '#0057FF' }}
                          >
                            {pct}%
                          </span>
                        </div>
                        <ProgressBar
                          value={goal.currentAmount}
                          max={goal.targetAmount}
                          color={isComplete ? '#00C896' : '#0057FF'}
                          showLabel
                          label={`${formatCurrency(goal.currentAmount)} ahorrados`}
                        />
                        {!isComplete && (
                          <Button
                            fullWidth
                            size="sm"
                            variant="secondary"
                            className="mt-3 text-primary border-primary/20 bg-blue-50/50 hover:bg-blue-50"
                            onClick={() => {
                              setSelectedGoal(goal);
                              setShowDepositModal(true);
                            }}
                          >
                            <PiggyBank size={16} className="mr-1.5" />
                            Abonar ahorro
                          </Button>
                        )}
                      </motion.div>
                    );
                  })}
          </motion.div>
        </div>

        {/* ─── Achievements Grid ─── */}
        <div>
          <h2 className="font-syne font-bold text-base text-text-primary mb-3">
            Insignias
          </h2>
          <div className="bg-surface rounded-2xl p-4 border border-border shadow-card">
            <div className="grid grid-cols-4 gap-4">
              {MOCK_ACHIEVEMENTS.map((achievement) => {
                // If goal badges matching goal id lists are earned, let's unlock them
                const unlocked = !!achievement.unlockedAt || (user?.badges && JSON.parse(user.badges).includes(achievement.id));
                return (
                  <AchievementBadge
                    key={achievement.id}
                    achievement={achievement}
                    unlocked={unlocked}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Modal Nueva Meta ─── */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              className="bg-surface w-full max-w-md rounded-t-3xl sm:rounded-3xl border border-border shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-2">
                <h3 className="font-syne font-bold text-base text-text-primary">Crear nueva meta</h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setGoalTitle('');
                    setGoalTargetAmount('');
                    setGoalDeadline('');
                  }}
                  className="w-8 h-8 rounded-lg hover:bg-surface-3 flex items-center justify-center text-text-secondary"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateGoal} className="p-6 overflow-y-auto space-y-4 flex-1">
                <div>
                  <label htmlFor="goalTitle" className="block text-xs font-dm font-semibold text-text-secondary mb-1.5">
                    Título de la meta
                  </label>
                  <input
                    id="goalTitle"
                    type="text"
                    required
                    value={goalTitle}
                    onChange={(e) => setGoalTitle(e.target.value)}
                    placeholder="Ej. Comprar Laptop 💻"
                    className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl font-dm text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="goalAmount" className="block text-xs font-dm font-semibold text-text-secondary mb-1.5">
                      Monto objetivo
                    </label>
                    <input
                      id="goalAmount"
                      type="number"
                      required
                      min="1"
                      value={goalTargetAmount}
                      onChange={(e) => setGoalTargetAmount(e.target.value)}
                      placeholder="Monto $"
                      className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl font-dm text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label htmlFor="goalEmoji" className="block text-xs font-dm font-semibold text-text-secondary mb-1.5">
                      Icono / Emoji
                    </label>
                    <select
                      id="goalEmoji"
                      value={goalEmoji}
                      onChange={(e) => setGoalEmoji(e.target.value)}
                      className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl font-dm text-sm text-text-primary focus:outline-none focus:border-primary transition-colors"
                    >
                      <option value="🎯">🎯 Meta</option>
                      <option value="💻">💻 Laptop</option>
                      <option value="🏠">🏠 Hogar</option>
                      <option value="🚗">🚗 Viajes</option>
                      <option value="🎓">🎓 Estudio</option>
                      <option value="👕">👕 Ropa</option>
                      <option value="🍔">🍔 Gustos</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="goalDeadline" className="block text-xs font-dm font-semibold text-text-secondary mb-1.5">
                    Fecha límite
                  </label>
                  <input
                    id="goalDeadline"
                    type="date"
                    value={goalDeadline}
                    onChange={(e) => setGoalDeadline(e.target.value)}
                    className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl font-dm text-sm text-text-primary focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div className="pt-2">
                  <Button type="submit" fullWidth loading={isSubmitting}>
                    Crear Meta
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── Modal Abonar Meta ─── */}
      <AnimatePresence>
        {showDepositModal && selectedGoal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              className="bg-surface w-full max-w-md rounded-t-3xl sm:rounded-3xl border border-border shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-2">
                <h3 className="font-syne font-bold text-base text-text-primary">
                  Abonar a &quot;{selectedGoal.title}&quot;
                </h3>
                <button
                  onClick={() => {
                    setShowDepositModal(false);
                    setDepositAmount('');
                    setSelectedGoal(null);
                  }}
                  className="w-8 h-8 rounded-lg hover:bg-surface-3 flex items-center justify-center text-text-secondary"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleDepositSubmit} className="p-6 space-y-4">
                <div>
                  <label htmlFor="depositVal" className="block text-xs font-dm font-semibold text-text-secondary mb-1.5">
                    Monto a depositar
                  </label>
                  <input
                    id="depositVal"
                    type="number"
                    required
                    min="1"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="Monto a ahorrar $"
                    className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl font-dm text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:border-primary transition-colors text-center text-xl font-bold"
                  />
                  <p className="text-[10px] text-text-secondary font-dm mt-1.5 text-center">
                    Restante para la meta: {formatCurrency(selectedGoal.targetAmount - selectedGoal.currentAmount)}
                  </p>
                </div>

                <div className="pt-2">
                  <Button type="submit" fullWidth loading={isDepositing}>
                    Confirmar Abono
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}
