'use client';
// Metas Gamificadas — racha, insignias, metas activas, reto semanal, XP bar
import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Plus, Trophy, Clock } from 'lucide-react';
import { PageTransition, containerVariants, itemVariants } from '@/components/layout/PageTransition';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { StreakCounter } from '@/components/ui/StreakCounter';
import { AchievementBadge } from '@/components/ui/AchievementBadge';
import { SkeletonCard } from '@/components/ui/SkeletonCard';
import { Button } from '@/components/ui/Button';
import { getGoals } from '@/services/goalService';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import {
  MOCK_ACHIEVEMENTS,
  MOCK_WEEKLY_CHALLENGE,
} from '@/lib/mockData';
import { formatCurrency, getCountdown, getLevelProgress, getIconForEmoji } from '@/lib/utils';
import type { Goal } from '@/types/goal.types';

// Confetti component
function Confetti({ active }: { active: boolean }) {
  if (!active) return null;
  const pieces = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    color: ['#0057FF', '#00C2FF', '#00C896', '#FFB800', '#FF6B6B'][i % 5],
    x: Math.random() * 100,
    delay: Math.random() * 0.5,
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
  const { user } = useAuthStore();
  const { addToast } = useUIStore();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);

  const level = user ? getLevelProgress(user.xp) : null;
  const challenge = MOCK_WEEKLY_CHALLENGE;

  useEffect(() => {
    getGoals()
      .then(setGoals)
      .catch(() => addToast({ message: 'Error cargando metas', type: 'error' }))
      .finally(() => setIsLoading(false));
  }, [addToast]);

  function handleCompleteGoal() {
    setShowConfetti(true);
    addToast({ message: '¡Meta completada! 🎉 +200 XP', type: 'success' });
    setTimeout(() => setShowConfetti(false), 3000);
  }

  return (
    <PageTransition className="min-h-screen bg-surface-2">
      <Confetti active={showConfetti} />

      {/* ─── Header ─── */}
      <header className="sticky top-0 z-20 bg-surface/95 backdrop-blur-xl border-b border-border px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="font-syne font-bold text-xl text-text-primary">Mis Metas</h1>
          <p className="font-dm text-xs text-text-secondary">Progreso gamificado</p>
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

      <div className="p-3 sm:p-4 space-y-3 sm:space-y-4 max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-4xl mx-auto md:px-6 md:py-6">
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
              <StreakCounter days={user?.streakDays ?? 7} size="sm" />
            </div>
            <div className="text-right">
              <p className="font-dm text-xs text-text-secondary mb-1">Mejor racha</p>
              <p className="font-syne font-bold text-xl sm:text-2xl text-text-primary">
                {user?.maxStreak ?? 14} <span className="text-xs sm:text-sm text-text-secondary font-dm">días</span>
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
                          {(() => {
                            const GoalIcon = getIconForEmoji(goal.emoji);
                            return (
                              <div
                                className="w-12 h-12 rounded-2xl bg-surface-2 flex items-center justify-center flex-shrink-0"
                                aria-hidden="true"
                              >
                                <GoalIcon size={22} className="text-primary" />
                              </div>
                            );
                          })()}
                          <div className="flex-1 min-w-0">
                            <p className="font-syne font-bold text-sm text-text-primary">
                              {goal.title}
                            </p>
                            <p className="font-dm text-xs text-text-secondary">
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
                        {isComplete && (
                          <Button
                            fullWidth
                            size="sm"
                            variant="secondary"
                            className="mt-3 text-success border-success/30 bg-green-50 hover:bg-green-100"
                            onClick={handleCompleteGoal}
                          >
                            🎉 Marcar como completada
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
              {MOCK_ACHIEVEMENTS.map((achievement) => (
                <AchievementBadge
                  key={achievement.id}
                  achievement={achievement}
                  unlocked={!!achievement.unlockedAt}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
