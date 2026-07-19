'use client';
// Dashboard Principal
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, TrendingDown, Plus, Target, Users, BarChart3,
  Bell, Settings, ArrowRight, Flame, Check, Search, Receipt, Trophy, Lightbulb, User, Star, Gamepad2
} from 'lucide-react';

import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
} from 'recharts';
import { PageTransition, containerVariants, itemVariants } from '@/components/layout/PageTransition';
import { CurrencyDisplay } from '@/components/ui/CurrencyDisplay';
import { TransactionItem } from '@/components/ui/TransactionItem';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { SkeletonCard, SkeletonTransactionItem } from '@/components/ui/SkeletonCard';
import { BenchmarkBar } from '@/components/ui/BenchmarkBar';
import { AchievementBadge } from '@/components/ui/AchievementBadge';
import { useAuthStore } from '@/store/authStore';
import { getTransactions, deleteTransaction } from '@/services/transactionService';
import { getSummary, getBenchmarks } from '@/services/analyticsService';
import { getProfile, getQuests, getAchievements, claimDailyReward, GamificationProfile, Quest, Achievement } from '@/services/gamificationService';
import { AchievementModal } from '@/components/gamification/AchievementModal';
import { LevelUpModal } from '@/components/gamification/LevelUpModal';
import { VirtualPet } from '@/components/gamification/VirtualPet';
import { ChestModal } from '@/components/gamification/ChestModal';
import { useGoalStore } from '@/store/goalStore';
import { getNotifications } from '@/services/notificationService';
import { cn, getGreeting, getInitials, formatCurrency, getIconForEmoji, getLevelProgress } from '@/lib/utils';
import { useUIStore } from '@/store/uiStore';
import type { Transaction } from '@/types/transaction.types';
import type { Summary } from '@/types/analytics.types';
import type { Goal } from '@/types/goal.types';

import { PIE_COLORS } from '@/lib/constants';

export default function DashboardPage() {
  const router = useRouter();
  const { user, preferences, isPanicMode, setPanicMode } = useAuthStore();
  const { addToast } = useUIStore();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const { goals: allGoals, hasLoaded: goalsLoaded, fetchGoals } = useGoalStore();
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingBenchmarks, setIsLoadingBenchmarks] = useState(true);

  // Benchmarks, Gamification & Level Up Modal State
  const [benchmarks, setBenchmarks] = useState<any>(null);
  const [gamiProfile, setGamiProfile] = useState<GamificationProfile | null>(null);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [levelUpInfo, setLevelUpInfo] = useState({ old: 4, new: 5 });
  const [unlockedAchievement, setUnlockedAchievement] = useState<Achievement | null>(null);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [canClaimDaily, setCanClaimDaily] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [showChestModal, setShowChestModal] = useState(false);

  // ─── Data fetch function (reusable for refresh) ───
  const fetchDashboardData = (isMounted: () => boolean) => {
    getTransactions({ limit: 5 }).then(txs => {
      if (isMounted()) setTransactions(txs);
    }).catch((e: any) => { console.error(e); });

    getSummary('week').then(sum => {
      if (isMounted()) {
        setSummary(sum);
        setIsLoading(false);
      }
    }).catch(() => {
      if (isMounted()) {
        addToast({ message: 'Error al cargar resumen', type: 'error' });
        setIsLoading(false);
      }
    });

    getNotifications().then(notifs => {
      if (isMounted()) setUnreadNotifications(notifs.filter(n => !n.read).length);
    }).catch((e: any) => { console.error(e); });

    getProfile().then(pData => {
      if (isMounted()) {
        setGamiProfile(pData);
        const today = new Date().toISOString().split('T')[0];
        const lastEntry = pData.lastEntryDate ? new Date(pData.lastEntryDate).toISOString().split('T')[0] : null;
        if (lastEntry !== today) setCanClaimDaily(true);
      }
    }).catch((e: any) => { console.error(e); });

    getQuests().then(qData => {
      if (isMounted()) setQuests(qData);
    }).catch((e: any) => { console.error(e); });

    getAchievements().then(aData => {
      if (isMounted()) {
        setAchievements(aData);
        const newAch = aData.find(a => a.justUnlocked);
        if (newAch) {
          setUnlockedAchievement(newAch);
          setShowAchievementModal(true);
        }
      }
    }).catch((e: any) => { console.error(e); });
  };

  // Initial load
  useEffect(() => {
    let mounted = true;
    const isMounted = () => mounted;

    fetchDashboardData(isMounted);

    if (!goalsLoaded) {
      fetchGoals().catch(err => { console.error(err); addToast({ message: 'Error cargando metas', type: 'error' }); });
    }

    // Bug 1 fix: re-fetch when user returns to this tab
    const handleVisibility = () => {
      if (!document.hidden && mounted) {
        setIsLoading(true);
        fetchDashboardData(isMounted);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      mounted = false;
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addToast, goalsLoaded, fetchGoals]);

  // Bug 6 fix: re-fetch benchmarks when city changes
  useEffect(() => {
    let mounted = true;
    getBenchmarks(user?.city ?? 'Tuxtla Gutiérrez').then(bData => {
      if (mounted) {
        setBenchmarks(bData);
        setIsLoadingBenchmarks(false);
      }
    }).catch(() => {
      if (mounted) setIsLoadingBenchmarks(false);
    });
    return () => { mounted = false; };
  }, [user?.city]);

  const goals = allGoals.filter((g) => g.status === 'active').slice(0, 2);

  async function handleDeleteTransaction(id: string) {
    await deleteTransaction(id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    addToast({ message: 'Transacción eliminada', type: 'success' });
  }

  const pieData = summary?.topCategories.slice(0, 5).map((cat) => ({
    name: cat.label,
    value: cat.amount,
    emoji: cat.emoji,
    percentage: cat.percentage,
  })) ?? [];

  async function handleClaimDaily() {
    setIsClaiming(true);
    try {
      const res = await claimDailyReward();
      if (res.success) {
        addToast({ message: `¡Felicidades! Ganaste ${res.reward} FinCoins.`, type: 'success' });
        setCanClaimDaily(false);
        getProfile().then(setGamiProfile);
      }
    } catch (e: any) {
      addToast({ message: 'No se pudo reclamar la recompensa.', type: 'error' });
    } finally {
      setIsClaiming(false);
    }
  }

  const greeting = getGreeting();
  const firstName = user?.name.split(' ')[0] ?? 'Usuario';
  const currentXp = gamiProfile?.xp ?? user?.xp ?? 0;
  const currentLevel = user ? getLevelProgress(currentXp).level : 1;

  return (
    <PageTransition className="min-h-screen bg-surface-2">
      {/* Header */}
      <header className="tour-dashboard-header sticky top-0 z-20 bg-surface/95 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/profile" className="flex items-center gap-3 text-left group hover:opacity-90 transition-opacity cursor-pointer min-w-0 flex-1 mr-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex shrink-0 items-center justify-center shadow-sm border border-primary/20 text-lg">
              {user?.avatar || <User size={20} className="text-primary dark:text-accent" />}
            </div>
            <div className="flex flex-col min-w-0">
              <p className="font-dm text-xs text-text-secondary group-hover:text-primary dark:group-hover:text-accent transition-colors truncate">{greeting}</p>
              <h1 className="font-syne font-bold text-lg text-text-primary group-hover:text-primary dark:group-hover:text-accent transition-colors leading-tight truncate">
                {firstName}
              </h1>
            </div>
          </Link>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Level Pill */}
            {user && (
              <button
                onClick={() => router.push('/profile')}
                className="flex items-center gap-1.5 sm:gap-2 bg-primary/10 dark:bg-accent/10 border border-primary/20 dark:border-accent/20 hover:bg-primary/20 dark:hover:bg-accent/20 transition-colors px-2 sm:px-3 py-1 rounded-full text-primary dark:text-accent min-w-0 shrink-0"
                aria-label={`Nivel ${currentLevel}, Experiencia ${currentXp}`}
              >
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-dm font-bold hidden sm:inline">LVL</span>
                  <span className="font-mono text-xs font-bold">{currentLevel}</span>
                </div>
                <div className="hidden sm:block w-px h-3 bg-primary/30" />
                <div className="hidden sm:flex items-center gap-1">
                  <span className="font-mono text-xs font-bold">{currentXp}</span>
                  <span className="text-[10px] font-dm font-bold">XP</span>
                </div>
              </button>
            )}

            {/* Streak Pill */}
            {user && (
              <button
                onClick={() => router.push('/profile')}
                className="flex items-center gap-1 bg-orange-500/10 dark:bg-orange-400/10 border border-orange-500/20 dark:border-orange-400/20 hover:bg-orange-500/20 dark:hover:bg-orange-400/20 transition-colors px-2 py-1 sm:px-2.5 rounded-full text-orange-500 dark:text-orange-400 animate-pulse min-w-0 shrink-0"
                aria-label={`Racha de ${gamiProfile?.streakDays ?? user.streakDays} días`}
              >
                <Flame size={13} fill="currentColor" className="text-orange-500 dark:text-orange-400 shrink-0" />
                <span className="font-mono text-xs font-bold">{gamiProfile?.streakDays ?? user.streakDays}d</span>
              </button>
            )}

            <button
              onClick={() => router.push('/search')}
              className="touch-target rounded-xl hover:bg-surface-2 transition-colors p-2 text-text-secondary"
              aria-label="Buscar"
            >
              <Search size={22} />
            </button>

            <button
              onClick={() => router.push('/notifications')}
              className="touch-target rounded-xl hover:bg-surface-2 transition-colors relative"
              aria-label="Notificaciones"
            >
              <Bell size={22} className="text-text-secondary" />
              {unreadNotifications > 0 && (
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Panic Mode Banner */}
        <AnimatePresence>
          {isPanicMode && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-red-500 text-white overflow-hidden"
            >
              <div className="px-4 py-2 text-xs font-dm font-bold flex items-center justify-center gap-2">
                <Flame size={14} className="animate-pulse" />
                MODO AHORRO EXTREMO ACTIVADO
                <Flame size={14} className="animate-pulse" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="px-3 sm:px-4 py-6 md:px-6 w-full max-w-5xl mx-auto space-y-8 pb-24 relative z-10 overflow-x-hidden sm:overflow-visible">

        {/* Top Row: Panic & Pet */}
        <div className="flex flex-row gap-3 sm:gap-4 w-full min-w-0">
          {/* Panic Toggle */}
          <div className="bg-surface rounded-2xl p-3 sm:p-4 border border-border shadow-sm flex items-center justify-between flex-1 min-w-0">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className={cn("p-1.5 sm:p-2 rounded-xl shrink-0", isPanicMode ? "bg-red-500/20 text-red-500" : "bg-surface-2 text-text-secondary")}>
                <Flame size={20} className="sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <h3 className="font-syne font-bold text-text-primary text-[11px] sm:text-base truncate">Botón de Pánico</h3>
                <p className="font-dm text-[9px] sm:text-sm text-text-secondary truncate">Ahorro extremo</p>
              </div>
            </div>
            <button 
              onClick={() => setPanicMode(!isPanicMode)}
              className={cn(
                "w-10 sm:w-14 h-6 sm:h-8 rounded-full p-1 transition-colors flex items-center shrink-0 ml-1",
                isPanicMode ? "bg-red-500" : "bg-surface-3 border border-border"
              )}
            >
              <div className={cn("w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-white transition-transform shadow-sm", isPanicMode ? "translate-x-4 sm:translate-x-6" : "")} />
            </button>
          </div>

          {/* Virtual Pet */}
          <div className="bg-surface rounded-2xl p-2 sm:p-4 border border-border shadow-sm flex items-center justify-center w-[110px] sm:w-[240px] lg:min-w-[240px] shrink-0 min-w-0 relative">
             <VirtualPet />
          </div>
        </div>

        <div className="max-w-7xl mx-auto flex flex-col lg:grid lg:grid-cols-3 gap-6 min-w-0 w-full">
          {/* ─── Balance Card ─── */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-2 relative overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-white transition-colors duration-500 border border-white/10 bg-gradient-primary shadow-blue-lg"
          >
            {/* Decorative shapes */}
            <div
              className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-30 mix-blend-overlay"
              style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%)' }}
              aria-hidden="true"
            />
            <div
              className="absolute -bottom-10 left-10 w-40 h-40 opacity-20 mix-blend-overlay"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.6) 0%, transparent 100%)',
                clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                transform: 'rotate(15deg)'
              }}
              aria-hidden="true"
            />

            <div className="relative z-10">
              <p className="font-dm text-white/70 text-sm mb-1">Balance de la semana</p>
              {isLoading ? (
                <div className="h-12 w-48 shimmer-bg rounded-xl mb-4" />
              ) : (
                <CurrencyDisplay
                  amount={summary?.balance ?? 0}
                  animated
                  size="2xl"
                  color="white"
                  className="mb-4"
                />
              )}

              {/* Income / Expense row */}
              <div className="flex gap-4 mt-2 min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                    <TrendingUp size={16} className="text-white" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-dm text-white/60 text-xs">Ingresos</p>
                    {isLoading ? (
                      <div className="h-4 w-20 shimmer-bg rounded" />
                    ) : (
                      <p className="font-mono font-bold text-white text-sm">
                        +{formatCurrency(summary?.totalIncome ?? 0)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="w-px bg-white/20" aria-hidden="true" />

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                    <TrendingDown size={16} className="text-white" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-dm text-white/60 text-xs">Gastos</p>
                    {isLoading ? (
                      <div className="h-4 w-20 shimmer-bg rounded" />
                    ) : (
                      <p className="font-mono font-bold text-white text-sm">
                        -{formatCurrency(summary?.totalExpenses ?? 0)}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <button
                  onClick={() => router.push('/transactions/new?type=income')}
                  className="flex-1 py-2 bg-white/10 hover:bg-white/20 active:bg-white/25 text-white rounded-xl font-dm font-semibold text-xs transition-all flex items-center justify-center gap-1.5 border border-white/5 shadow-sm"
                >
                  <Plus size={14} />
                  <span>Agregar Ingreso</span>
                </button>
                <button
                  onClick={() => router.push('/transactions/new?type=expense')}
                  className="flex-1 py-2 bg-white/10 hover:bg-white/20 active:bg-white/25 text-white rounded-xl font-dm font-semibold text-xs transition-all flex items-center justify-center gap-1.5 border border-white/5 shadow-sm"
                >
                  <Plus size={14} />
                  <span>Registrar Gasto</span>
                </button>
              </div>

              {/* Savings rate */}
              {!isLoading && summary && (
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-white font-medium mb-1.5">
                    <span className="font-dm">Tasa de ahorro</span>
                    <span className="font-mono font-bold text-yellow-300">{summary.savingsRate.toFixed(1)}%</span>
                  </div>
                  <ProgressBar
                    value={summary.savingsRate}
                    max={100}
                    color="rgba(255,255,255,0.9)"
                    trackColor="rgba(255,255,255,0.2)"
                    height="xs"
                  />
                </div>
              )}
            </div>
          </motion.div>

          {/* ─── Racha de Registro Diario (Gamificada) ─── */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-1 relative overflow-hidden rounded-2xl p-4 sm:p-5 bg-surface border border-border text-text-primary shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between min-w-0"
            whileHover={{ y: -1 }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 relative z-10 min-w-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-500">
                  <Flame size={24} fill="currentColor" className="text-orange-500 animate-bounce" />
                </div>
                <div>
                  <h3 className="font-syne font-bold text-sm sm:text-base text-text-primary">Racha de Registro Diario</h3>
                  <p className="font-dm text-xs text-text-secondary mt-0.5">
                    Llevas <span className="font-bold text-orange-500 font-mono text-sm">{gamiProfile?.streakDays ?? user?.streakDays ?? 0} días</span> seguidos. ¡Sigue quemando!
                  </p>
                </div>
              </div>
              <span className="self-start sm:self-auto font-mono text-[10px] font-bold text-orange-500 bg-orange-50 border border-orange-200/60 px-2.5 py-1 rounded-full uppercase tracking-wide">
                Racha Activa
              </span>
            </div>

            {/* Week Progress Circles */}
            <div className="flex gap-2 sm:justify-between overflow-x-auto scrollbar-hide relative z-10 pt-3 border-t border-border w-full min-w-0">
              {(() => {
                const currentDayIndex = (new Date().getDay() + 6) % 7;
                const streakDays = gamiProfile?.streakDays ?? user?.streakDays ?? 0;
                
                return [
                  { label: 'L' }, { label: 'M' }, { label: 'M' }, { label: 'J' }, 
                  { label: 'V' }, { label: 'S' }, { label: 'D' }
                ].map((day, idx) => {
                  const current = idx === currentDayIndex;
                  const active = idx <= currentDayIndex && idx > currentDayIndex - streakDays;
                  return { ...day, current, active };
                });
              })().map((day, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1.5 shrink-0">
                  <motion.div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all relative',
                      day.current 
                        ? 'bg-orange-50 text-orange-500 border-2 border-orange-500 shadow-orange-sm' 
                        : day.active
                          ? 'bg-orange-500 text-white border border-orange-500 shadow-blue-sm'
                          : 'bg-surface-2 text-text-secondary/60 border border-border'
                    )}
                    animate={day.current ? { scale: [1, 1.05, 1] } : {}}
                    transition={day.current ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' } : {}}
                  >
                    {day.active ? (
                      day.current ? (
                        <Flame size={14} fill="currentColor" />
                      ) : (
                        <Check size={14} strokeWidth={3} className="text-white" />
                      )
                    ) : (
                      day.label
                    )}
                  </motion.div>
                  <span className="text-[10px] font-dm font-semibold text-text-secondary">{day.label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ─── Acciones Rápidas (Compact) ─── */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="tour-quick-actions lg:col-span-3 grid grid-cols-4 md:grid-cols-6 gap-2 sm:gap-4"
          >
            {[
              { icon: Receipt, label: 'Historial', href: '/transactions', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' },
              { icon: BarChart3, label: 'Analytics', href: '/analytics', color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
              { icon: Target, label: 'Metas', href: '/goals', color: 'text-success', bg: 'bg-success/10 dark:bg-success/10' },
              { icon: Trophy, label: 'Ranking', href: '/leaderboard', color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-500/10' },
              { icon: TrendingUp, label: 'Inversión', href: '/investments', color: 'text-success', bg: 'bg-emerald-50 dark:bg-success/10' },
              { icon: Gamepad2, label: 'Retos', href: '/challenges', color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-500/10' },
              { icon: Receipt, label: 'Presupuestos', href: '/budgets', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-500/10' },
              { icon: Users, label: 'Grupos', href: '/groups', color: 'text-pink-500', bg: 'bg-pink-50 dark:bg-pink-500/10' },
            ].map((action) => (
              <motion.button
                key={action.label}
                variants={itemVariants}
                className="flex flex-col items-center justify-start gap-1.5 sm:gap-2 p-1.5 sm:p-3 rounded-2xl bg-surface/50 sm:bg-surface border border-transparent sm:border-border transition-all duration-150 hover:bg-surface-2 group min-w-0"
                onClick={() => router.push(action.href)}
                aria-label={action.label}
                whileTap={{ scale: 0.95 }}
              >
                <div className={cn(
                  "w-12 h-12 sm:w-14 sm:h-14 rounded-[14px] sm:rounded-2xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-all shrink-0",
                  action.bg
                )}>
                  <action.icon size={20} className={action.color} />
                </div>
                <span className="font-dm font-medium text-[9px] sm:text-[11px] text-text-secondary text-center leading-tight truncate w-full">
                  {action.label}
                </span>
              </motion.button>
            ))}
          </motion.div>

          {/* ─── Misiones Semanales (Quests) ─── */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="tour-gamification lg:col-span-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-5 sm:p-6 shadow-card text-white overflow-hidden relative"
          >
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            <div className="flex items-center gap-3 mb-4 relative z-10">
              <div className="bg-white/20 p-2 rounded-xl border border-white/30 backdrop-blur-sm">
                <Gamepad2 size={24} className="text-white" />
              </div>
              <div>
                <h2 className="font-syne font-bold text-lg text-white">Misiones Semanales</h2>
                <p className="font-dm text-xs text-indigo-100">Completa tareas y gana XP</p>
              </div>
            </div>
            
            {/* Chests Available Banner */}
            <AnimatePresence>
              {(gamiProfile?.chests ?? 0) > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="mb-6 bg-gradient-to-r from-yellow-400 to-amber-600 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl shrink-0">
                      🎁
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-syne font-bold text-white text-sm sm:text-base truncate">¡Tienes {gamiProfile?.chests} cofre{gamiProfile?.chests !== 1 ? 's' : ''} sin abrir!</h3>
                      <p className="font-dm text-xs text-white/90 truncate">¡Ábrelo para ganar recompensas raras!</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowChestModal(true)}
                    className="w-full sm:w-auto bg-white text-yellow-600 font-bold font-dm text-sm px-4 py-2 rounded-xl hover:bg-surface transition-colors whitespace-nowrap shrink-0"
                  >
                    Abrir cofre
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Daily Reward Banner */}
            <AnimatePresence>
              {canClaimDaily && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="mb-6 bg-gradient-to-r from-primary to-[#FF9F43] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl shrink-0">
                      🎁
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-syne font-bold text-white text-sm sm:text-base truncate">Recompensa Diaria Disponible</h3>
                      <p className="font-dm text-xs text-white/90 truncate">¡Reclama tus 10 FinCoins de hoy!</p>
                    </div>
                  </div>
                  <button
                    onClick={handleClaimDaily}
                    disabled={isClaiming}
                    className="w-full sm:w-auto bg-white text-primary font-bold font-dm text-sm px-4 py-2 rounded-xl hover:bg-surface transition-colors whitespace-nowrap shrink-0"
                  >
                    {isClaiming ? '...' : 'Reclamar'}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 relative z-10">
              {quests.map(quest => (
                <div key={quest.id} className="bg-white/10 border border-white/20 rounded-xl p-3 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-dm font-semibold text-sm">{quest.title}</h3>
                      <div className="bg-white/20 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                        <Star size={10} className="text-yellow-300" fill="#FDE047" />
                        <span className="text-[10px] font-bold font-mono">{quest.xp} XP</span>
                      </div>
                    </div>
                    <p className="text-[10px] font-dm text-indigo-100 mb-3">{quest.desc}</p>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] font-mono mb-1">
                      <span>{quest.progress} / {quest.max}</span>
                      <span>{Math.round((quest.progress / quest.max) * 100)}%</span>
                    </div>
                    <ProgressBar 
                      value={quest.progress} 
                      max={quest.max} 
                      color={quest.progress >= quest.max ? '#00C896' : 'white'} 
                      height="xs"
                      trackColor="rgba(255,255,255,0.2)"
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ─── Spending Donut Chart + Benchmarks ─── */}
          <div className="lg:col-span-3 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Donut chart */}
            <motion.div
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="tour-analytics bg-surface rounded-2xl p-5 sm:p-6 border border-border shadow-card"
            >
              <h2 className="font-syne font-bold text-sm sm:text-base text-text-primary mb-2 sm:mb-3">
                Gastos de la semana
              </h2>
              {isLoading ? (
                <div className="h-40 sm:h-48 shimmer-bg rounded-xl" />
              ) : pieData.length === 0 ? (
                <div className="h-40 sm:h-48 flex flex-col items-center justify-center text-center border border-border border-dashed rounded-xl bg-surface-2/50 mt-2">
                  <BarChart3 size={32} className="text-text-secondary mb-2 opacity-50" />
                  <p className="font-syne font-semibold text-text-primary text-sm">Sin gastos esta semana</p>
                  <p className="font-dm text-xs text-text-secondary mt-1">Registra un gasto para ver el gráfico</p>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center gap-6 mt-4">
                  {/* Chart Side */}
                  <div className="flex flex-col items-center gap-3 w-36 shrink-0 mx-auto sm:mx-0">
                    <div className="relative w-36 h-36">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius="65%"
                            outerRadius="100%"
                            paddingAngle={3}
                            dataKey="value"
                            stroke="none"
                          >
                            {pieData.map((_, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={PIE_COLORS[index % PIE_COLORS.length]}
                              />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      {/* Total Overlay */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-[10px] font-dm text-text-secondary leading-none">Total</span>
                        <span className="font-syne font-bold text-sm text-text-primary mt-0.5">
                          {formatCurrency(summary?.totalExpenses ?? 0)}
                        </span>
                      </div>
                    </div>
                    {summary?.dailyAverage !== undefined && (
                      <span className="text-[9px] font-dm text-text-secondary px-2 py-0.5 bg-surface-2 rounded-md border border-border text-center whitespace-nowrap">
                        Promedio: {formatCurrency(summary.dailyAverage)}/día
                      </span>
                    )}
                  </div>

                  {/* Details Side */}
                  <div className="flex-1 w-full space-y-3">
                    {pieData.map((entry, index) => {
                      return (
                        <div key={entry.name} className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <div 
                              className="w-3 h-3 rounded-full shrink-0" 
                              style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} 
                            />
                            <span className="font-dm text-xs text-text-secondary flex items-center gap-1.5 min-w-0">
                              {(() => {
                                const CatIcon = getIconForEmoji(entry.emoji);
                                return <CatIcon size={14} className="text-text-secondary shrink-0" />;
                              })()}
                              <span className="truncate">{entry.name}</span>
                            </span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] text-text-secondary font-medium">{Math.round(entry.percentage)}%</span>
                            <span className="font-mono text-xs font-semibold text-text-primary">
                              {formatCurrency(entry.value)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>

            <motion.div
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="bg-surface rounded-2xl p-5 sm:p-6 border border-border shadow-card"
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-syne font-bold text-base text-text-primary">
                  Benchmarks Locales
                </h2>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-dm text-text-secondary">vs.</span>
                  <select
                    className="text-xs font-dm font-semibold text-primary bg-primary/10 border border-primary/20 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                    aria-label="Seleccionar ciudad de comparación"
                    defaultValue="Tuxtla"
                  >
                    <option value="Tuxtla">Tuxtla</option>
                    <option value="Suchiapa">Suchiapa</option>
                  </select>
                </div>
              </div>
              {isLoadingBenchmarks ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-8 shimmer-bg rounded-lg" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {benchmarks && benchmarks.benchmarks.length > 0 ? (
                    benchmarks.benchmarks.slice(0, 3).map((b: any) => (
                      <BenchmarkBar
                        key={b.categoryId}
                        emoji={b.emoji}
                        label={b.label}
                        userValue={b.userAmount}
                        avgValue={b.cityAverage}
                      />
                    ))
                  ) : (
                    <p className="font-dm text-xs text-text-secondary font-medium">Sin datos de benchmark este mes.</p>
                  )}
                  {benchmarks?.suggestion && (
                    <div className="mt-3 bg-blue-50/50 border border-blue-100/50 rounded-2xl p-3 flex gap-2">
                      <Lightbulb size={16} className="text-primary shrink-0 mt-0.5" />
                      <p className="font-dm text-xs text-text-secondary leading-normal">
                        {benchmarks.suggestion}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>

          {/* ─── Active Goals ─── */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="bg-surface rounded-2xl p-4 border border-border shadow-card"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-syne font-bold text-base text-text-primary">
                Metas Activas
              </h2>
              <button
                onClick={() => router.push('/goals')}
                className="flex items-center gap-1 text-primary text-xs font-dm font-semibold hover:text-primary-dark"
                aria-label="Ver todas las metas"
              >
                Ver todas <ArrowRight size={14} aria-hidden="true" />
              </button>
            </div>

            <div className="space-y-4">
              {goals.length === 0 ? (
                <div className="text-center py-6 border border-border border-dashed rounded-xl">
                  <Target size={32} className="text-text-secondary mb-2 mx-auto opacity-50" />
                  <p className="font-syne font-semibold text-text-primary text-sm">Sin metas activas</p>
                  <p className="font-dm text-xs text-text-secondary mt-1">Dirígete a Metas para crear una</p>
                </div>
              ) : (
                goals.map((goal) => {
                  const pct = Math.round((goal.currentAmount / goal.targetAmount) * 100);
                  const GoalIcon = getIconForEmoji(goal.emoji);
                  return (
                    <div key={goal.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <GoalIcon size={18} className="text-primary flex-shrink-0" />
                          <p className="font-dm font-semibold text-sm text-text-primary">
                            {goal.title}
                          </p>
                        </div>

                        <p className="font-mono text-xs text-text-secondary">
                          {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                        </p>
                      </div>
                      <ProgressBar
                        value={goal.currentAmount}
                        max={goal.targetAmount}
                        showLabel
                        label={`${pct}% completado`}
                        color="#0057FF"
                      />
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>

          {/* ─── Achievements Showcase ─── */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="lg:col-span-2 bg-surface rounded-2xl p-4 border border-border shadow-card flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-syne font-bold text-base text-text-primary">
                Logros e Insignias
              </h2>
              <button
                onClick={() => router.push('/goals')}
                className="flex items-center gap-1 text-primary text-xs font-dm font-semibold hover:text-primary-dark"
                aria-label="Ver todas las insignias"
              >
                Ver todas <ArrowRight size={14} aria-hidden="true" />
              </button>
            </div>

            <div className="flex overflow-x-auto gap-4 scrollbar-none pb-2 pt-1 px-1">
              {achievements.map((achievement) => (
                <div key={achievement.id} className="flex-shrink-0 w-20">
                  <AchievementBadge
                    achievement={achievement as any}
                    unlocked={!!achievement.unlockedAt}
                    size="sm"
                  />
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>

      {/* Level Up Modal Overlay */}
      <LevelUpModal
        isOpen={showLevelUpModal}
        onClose={() => setShowLevelUpModal(false)}
        levelUpInfo={levelUpInfo}
      />

      {/* Bug 2 fix: clear achievement object on close so modal fully unmounts */}
      <AchievementModal 
        achievement={showAchievementModal ? unlockedAchievement : null}
        onClose={() => { setShowAchievementModal(false); setUnlockedAchievement(null); }}
      />

      <ChestModal
        isOpen={showChestModal}
        onClose={() => setShowChestModal(false)}
        onRewardClaimed={() => { getProfile().then(setGamiProfile); }}
      />
    </PageTransition>
  );
}
