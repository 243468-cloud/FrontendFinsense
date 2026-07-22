'use client';
// Metas Gamificadas — racha, insignias, metas activas, reto semanal, XP bar
import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Plus, Trophy, Clock, ArrowLeft, Trash2, Coins, Loader2 } from 'lucide-react';
import { PageTransition, containerVariants, itemVariants } from '@/components/layout/PageTransition';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { StreakCounter } from '@/components/ui/StreakCounter';
import { AchievementBadge } from '@/components/ui/AchievementBadge';
import { SkeletonCard } from '@/components/ui/SkeletonCard';
import { Button } from '@/components/ui/Button';
import { getGoals, updateProgress, deleteGoal } from '@/services/goalService';
import { getAchievements, getQuests, getProfile, type Achievement, type Quest, type GamificationProfile } from '@/services/gamificationService';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { useGoalStore } from '@/store/goalStore';
import { formatCurrency, getCountdown, getLevelProgress, getIconForEmoji } from '@/lib/utils';
import type { Goal } from '@/types/goal.types';
import confetti from 'canvas-confetti';


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

// Active Goal Card with deposit/delete actions
function ActiveGoalCard({ goal, onComplete }: { goal: Goal, onComplete: () => void }) {
  const { addToast } = useUIStore();
  const { updateGoalData, removeGoal } = useGoalStore();
  const [isDepositing, setIsDepositing] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const pct = Math.round((goal.currentAmount / goal.targetAmount) * 100);
  const isComplete = goal.currentAmount >= goal.targetAmount;

  async function handleDeposit() {
    const amt = parseFloat(depositAmount);
    if (!amt || amt <= 0) return addToast({ message: 'Ingresa un monto válido', type: 'warning' });
    setIsSaving(true);
    try {
      const updated = await updateProgress(goal.id, amt);
      updateGoalData(goal.id, { currentAmount: updated.currentAmount, status: updated.status });
      setIsDepositing(false);
      setDepositAmount('');
      addToast({ message: `¡Abonaste ${formatCurrency(amt)}!`, type: 'success' });
      if (updated.status === 'completed') onComplete();
    } catch {
      addToast({ message: 'Error al procesar el abono', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm('¿Estás seguro de eliminar esta meta? Perderás todo su progreso.')) return;
    setIsDeleting(true);
    try {
      await deleteGoal(goal.id);
      removeGoal(goal.id);
      addToast({ message: 'Meta eliminada correctamente', type: 'success' });
    } catch {
      addToast({ message: 'Error al eliminar la meta', type: 'error' });
      setIsDeleting(false);
    }
  }

  const GoalIcon = getIconForEmoji(goal.emoji);

  return (
    <motion.div
      variants={itemVariants}
      className="bg-surface rounded-2xl p-4 border border-border shadow-card relative group overflow-hidden"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl bg-surface-2 flex items-center justify-center flex-shrink-0"
            aria-hidden="true"
          >
            <GoalIcon size={22} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0 pr-8">
            <p className="font-syne font-bold text-sm text-text-primary">
              {goal.title}
            </p>
            <p className="font-dm text-xs text-text-secondary">
              Meta: {formatCurrency(goal.targetAmount)}
            </p>
          </div>
        </div>
        <span
          className="font-mono font-bold text-sm absolute top-4 right-4"
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

      {/* Action Bar */}
      {!isComplete && (
        <div className="mt-4 flex flex-col gap-2">
          {isDepositing ? (
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Monto a abonar"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="flex-1 px-3 py-2 bg-surface-2 border border-border rounded-xl font-dm text-sm text-text-primary focus:outline-none focus:border-primary transition-all"
                autoFocus
              />
              <Button size="sm" onClick={handleDeposit} disabled={isSaving} className="px-4">
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : 'Guardar'}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setIsDepositing(false)} disabled={isSaving} className="px-3 text-text-secondary">
                Cancelar
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={() => setIsDepositing(true)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-dm text-xs font-bold"
              >
                <Coins size={14} />
                Abonar
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                aria-label="Eliminar meta"
              >
                {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
              </button>
            </div>
          )}
        </div>
      )}

      {isComplete && (
        <Button
          fullWidth
          size="sm"
          variant="secondary"
          className="mt-3 text-success border-success/30 bg-success/10 hover:bg-success/20"
          onClick={onComplete}
        >
          🎉 Marcar como completada
        </Button>
      )}
    </motion.div>
  );
}

export default function GoalsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { addToast } = useUIStore();
  const { goals, isLoading, hasLoaded, fetchGoals, updateGoalData } = useGoalStore();
  const [showConfetti, setShowConfetti] = useState(false);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoadingAchievements, setIsLoadingAchievements] = useState(true);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [isLoadingQuests, setIsLoadingQuests] = useState(true);
  const [gamiProfile, setGamiProfile] = useState<GamificationProfile | null>(null);

  const currentXp = gamiProfile?.xp ?? user?.xp ?? 0;
  const level = user ? getLevelProgress(currentXp) : null;
  
  const activeQuest = quests.length > 0 ? quests[0] : null;
  const nextSunday = new Date();
  nextSunday.setDate(nextSunday.getDate() + (7 - nextSunday.getDay()));
  nextSunday.setHours(23, 59, 59, 999);

  const challenge = activeQuest ? {
    id: activeQuest.id.toString(),
    title: activeQuest.title,
    description: activeQuest.desc,
    emoji: '🏆',
    targetAmount: activeQuest.max,
    currentAmount: activeQuest.progress,
    deadline: nextSunday.toISOString(),
    xpReward: activeQuest.xp,
    isCompleted: activeQuest.progress >= activeQuest.max
  } : null;

  useEffect(() => {
    fetchGoals().catch(() => addToast({ message: 'Error cargando metas', type: 'error' }));
  }, [fetchGoals, addToast]);

  useEffect(() => {
    getProfile()
      .then(setGamiProfile)
      .catch((e: any) => { console.error(e); });

    getAchievements()
      .then((data) => {
        setAchievements(data);
        setIsLoadingAchievements(false);
      })
      .catch((err) => {
        console.error('Error fetching achievements:', err);
        addToast({ message: 'Error cargando insignias', type: 'error' });
        setIsLoadingAchievements(false);
      });

    getQuests()
      .then((data) => {
        setQuests(data);
        setIsLoadingQuests(false);
      })
      .catch((err) => {
        console.error('Error fetching quests:', err);
        setIsLoadingQuests(false);
      });
  }, [addToast]);

  function handleCompleteGoal() {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#0057FF', '#4ECDC4', '#FFB800', '#A855F7']
    });
    addToast({ message: '¡Meta completada! 🎉 +200 XP', type: 'success' });
  }

  return (
    <PageTransition className="min-h-screen bg-surface-2">

      {/* ─── Header ─── */}
      <header className="tour-goals-header sticky top-0 z-20 bg-surface/95 backdrop-blur-xl border-b border-border px-4 py-3.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="touch-target rounded-xl hover:bg-slate-100 dark:hover:bg-surface-3 transition-colors p-2"
            aria-label="Volver al Dashboard"
          >
            <ArrowLeft size={22} className="text-text-primary" />
          </button>
          <div>
            <h1 className="font-syne font-bold text-lg text-text-primary">Mis Metas</h1>
            <p className="font-dm text-xs text-text-secondary">Progreso gamificado</p>
          </div>
        </div>
        <button
          onClick={() => router.push('/goals/new')}
          className="flex items-center gap-1.5 bg-primary text-white px-4 py-2 rounded-xl font-dm font-semibold text-sm hover:bg-primary-dark transition-colors"
          aria-label="Nueva meta"
        >
          <Plus size={16} aria-hidden="true" />
          Nueva meta
        </button>
      </header>

      <div className="p-3 sm:p-4 space-y-3 sm:space-y-4 max-w-7xl mx-auto md:px-6 md:py-6">
        {/* ─── Streak + XP ─── */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="bg-surface rounded-2xl p-3 sm:p-4 border border-border shadow-card"
        >
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div>
              <p className="font-dm text-xs text-text-secondary mb-1">Racha actual</p>
              <StreakCounter days={gamiProfile?.streakDays ?? user?.streakDays ?? 0} size="sm" />
            </div>
            <div className="text-right">
              <p className="font-dm text-xs text-text-secondary mb-1">Mejor racha</p>
              <p className="font-syne font-bold text-xl sm:text-2xl text-text-primary">
                {gamiProfile?.maxStreak ?? user?.maxStreak ?? 0} <span className="text-xs sm:text-sm text-text-secondary font-dm">días</span>
              </p>
            </div>
          </div>

          {/* XP Level bar */}
          {level && (
            <div>
              <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-syne font-bold text-xs"
                    aria-label={`Nivel ${level.level}`}
                  >
                    {level.level}
                  </div>
                  <div>
                    <p className="font-dm font-semibold text-xs sm:text-sm text-text-primary">Nivel {level.level}</p>
                    <p className="font-dm text-xs text-text-secondary">
                      {level.xpInLevel} / {level.xpForNextLevel} XP
                    </p>
                  </div>
                </div>
                <Trophy size={16} className="sm:size-20 text-warning" aria-hidden="true" />
              </div>
              <ProgressBar
                value={level.xpInLevel}
                max={level.xpForNextLevel}
                color="#FFB800"
                trackColor="#E8EEFF"
                showLabel
                label="Progreso al siguiente nivel"
                height="sm"
              />
            </div>
          )}
        </motion.div>

        {/* ─── Reto de la Semana ─── */}
        {isLoadingQuests ? (
          <div className="bg-surface rounded-3xl p-6 h-40 shimmer-bg mb-6" />
        ) : challenge ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-3xl p-5 mb-6 sm:mb-8"
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
                  <h2 className="font-syne font-bold text-lg text-white mt-0.5 flex items-center gap-2">
                    {(() => {
                      const ChallengeIcon = getIconForEmoji(challenge.emoji);
                      return <ChallengeIcon size={20} className="text-white animate-pulse" />;
                    })()}
                    <span>{challenge.title}</span>
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
        ) : null}


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
              : goals
                  .filter((g) => g.status === 'active')
                  .map((goal) => (
                    <ActiveGoalCard key={goal.id} goal={goal} onComplete={handleCompleteGoal} />
                  ))}
          </motion.div>
        </div>

        {/* ─── Achievements Grid ─── */}
        <div>
          <h2 className="font-syne font-bold text-base text-text-primary mb-3">
            Insignias
          </h2>
          <div className="bg-surface rounded-2xl p-4 border border-border shadow-card">
            {isLoadingAchievements ? (
              <div className="grid grid-cols-4 gap-4">
                 {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="w-20 h-20 rounded-2xl shimmer-bg mx-auto"></div>)}
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-4">
                {achievements.map((achievement: any) => (
                  <AchievementBadge
                    key={achievement.id}
                    achievement={achievement}
                    unlocked={!!achievement.unlockedAt}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
