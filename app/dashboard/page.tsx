'use client';
// Dashboard Principal
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, Plus, Target, Users, BarChart3,
  Bell, Settings, ArrowRight, Flame, Check, Search, Receipt
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
import { MOCK_ACHIEVEMENTS } from '@/lib/mockData';
import { useAuthStore } from '@/store/authStore';
import { getTransactions, deleteTransaction } from '@/services/transactionService';
import { getSummary } from '@/services/analyticsService';
import { getGoals } from '@/services/goalService';
import { getNotifications } from '@/services/notificationService';
import { cn, getGreeting, getInitials, formatCurrency, getIconForEmoji } from '@/lib/utils';
import { useUIStore } from '@/store/uiStore';
import type { Transaction } from '@/types/transaction.types';
import type { Summary } from '@/types/analytics.types';
import type { Goal } from '@/types/goal.types';

const PIE_COLORS = ['#FF6B6B', '#4ECDC4', '#FFB800', '#A855F7', '#45B7D1'];

export default function DashboardPage() {
  const router = useRouter();
  const { user, preferences } = useAuthStore();
  const { addToast } = useUIStore();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [txs, sum, gls, notifs] = await Promise.all([
          getTransactions({ limit: 5 }),
          getSummary('month'),
          getGoals(),
          getNotifications(),
        ]);
        setTransactions(txs);
        setSummary(sum);
        setGoals(gls.filter((g) => g.status === 'active').slice(0, 2));
        setUnreadNotifications(notifs.filter((n) => !n.read).length);
      } catch {
        addToast({ message: 'Error al cargar datos', type: 'error' });
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [addToast]);

  async function handleDeleteTransaction(id: string) {
    await deleteTransaction(id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    addToast({ message: 'Transacción eliminada', type: 'success' });
  }

  const pieData = summary?.topCategories.slice(0, 5).map((cat) => ({
    name: cat.label,
    value: cat.amount,
    emoji: cat.emoji,
  })) ?? [];

  const greeting = getGreeting();
  const firstName = user?.name.split(' ')[0] ?? 'Usuario';

  return (
    <PageTransition className="min-h-screen bg-surface-2">
      {/* ─── Header ─── */}
      <header className="sticky top-0 z-20 bg-surface/95 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/profile" className="flex items-center gap-3 text-left group hover:opacity-90 transition-opacity cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shadow-sm border border-primary/20 text-lg">
              {user?.avatar || '👤'}
            </div>
            <div className="flex flex-col">
              <p className="font-dm text-xs text-text-secondary group-hover:text-primary transition-colors">{greeting}</p>
              <h1 className="font-syne font-bold text-lg text-text-primary group-hover:text-primary transition-colors leading-tight">
                {firstName} 👋
              </h1>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            {/* Level Pill */}
            {user && (
              <button
                onClick={() => router.push('/goals')}
                className="flex items-center gap-1 bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors px-2.5 py-1 rounded-full text-primary"
                aria-label={`Nivel ${user.level}`}
              >
                <span className="text-[10px] font-dm font-bold">LVL</span>
                <span className="font-mono text-xs font-bold">{user.level}</span>
              </button>
            )}

            {/* Streak Pill */}
            {user && (
              <div
                className="flex items-center gap-1 bg-orange-500/10 border border-orange-500/20 px-2.5 py-1 rounded-full text-orange-500 animate-pulse"
                aria-label={`Racha de ${user.streakDays} días`}
              >
                <Flame size={13} fill="currentColor" className="text-orange-500" />
                <span className="font-mono text-xs font-bold">{user.streakDays}d</span>
              </div>
            )}

            <button
              onClick={() => addToast({ message: 'Búsqueda no implementada aún', type: 'info' })}
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
      </header>

<div className="p-4 space-y-4 max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-4xl mx-auto md:px-6 md:py-6">
         {/* ─── Balance Card ─── */}
         <motion.div
           variants={itemVariants}
           initial="hidden"
           animate="visible"
           className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-white transition-colors duration-500"
           style={{
             background: `linear-gradient(135deg, ${preferences?.themeColor || '#0A1128'} 0%, ${preferences?.themeColor === '#0A1128' ? '#0057FF' : (preferences?.themeColor || '#0A1128') + 'DD'} 100%)`,
             boxShadow: '0 8px 30px rgba(0, 87, 255, 0.15)',
           }}
         >
          {/* Decorative shapes */}
          <div
            className="absolute -top-12 -right-12 w-40 h-40 rounded-full opacity-20"
            style={{ background: 'rgba(255,255,255,0.3)' }}
            aria-hidden="true"
          />
          <div
            className="absolute bottom-0 left-8 w-24 h-24 opacity-10"
            style={{
              background: 'rgba(255,255,255,0.5)',
              clipPath: 'polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)',
            }}
            aria-hidden="true"
          />

          <div className="relative z-10">
            <p className="font-dm text-white/70 text-sm mb-1">Balance del mes</p>
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
            <div className="flex gap-4 mt-2">
              <div className="flex items-center gap-2">
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
            <div className="flex gap-3 mt-4">
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
          className="relative overflow-hidden rounded-2xl p-4 sm:p-5 bg-surface border border-border text-text-primary shadow-card hover:shadow-card-hover transition-all duration-200"
          whileHover={{ y: -1 }}
        >
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-500">
                <Flame size={24} fill="currentColor" className="text-orange-500 animate-bounce" />
              </div>
              <div>
                <h3 className="font-syne font-bold text-sm sm:text-base text-text-primary">Racha de Registro Diario</h3>
                <p className="font-dm text-xs text-text-secondary mt-0.5">
                  Llevas <span className="font-bold text-orange-500 font-mono text-sm">{user?.streakDays ?? 7} días</span> seguidos. ¡Sigue quemando!
                </p>
              </div>
            </div>
            <span className="font-mono text-[10px] font-bold text-orange-500 bg-orange-50 border border-orange-200/60 px-2.5 py-1 rounded-full uppercase tracking-wide">
              Racha Activa
            </span>
          </div>

          {/* Week Progress Circles */}
          <div className="grid grid-cols-7 gap-2 relative z-10 pt-3 border-t border-border">
            {[
              { label: 'L', active: true,  current: false },
              { label: 'M', active: true,  current: false },
              { label: 'M', active: true,  current: false },
              { label: 'J', active: true,  current: false },
              { label: 'V', active: true,  current: false },
              { label: 'S', active: true,  current: true  }, // Current day
              { label: 'D', active: false, current: false },
            ].map((day, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1.5">
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


        {/* ─── Quick Actions ─── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-4 gap-4 sm:gap-6"
          aria-label="Acciones rápidas"
        >
          {[{ icon: Receipt,   label: 'Historial', href: '/transactions',     color: '#FF6B6B', bg: '#FFF0F0' },
            { icon: BarChart3, label: 'Analytics', href: '/analytics',        color: '#00C896', bg: '#F0FFF9' },
            { icon: Target,    label: 'Metas',     href: '/goals',            color: '#0057FF', bg: '#F0F5FF' },
            { icon: Users,     label: 'Grupos',    href: '/groups',           color: '#A855F7', bg: '#FAF0FF' },
          ].map((action) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.label}
                variants={itemVariants}
                className="flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-2xl bg-surface border border-border transition-all duration-150 hover:shadow-card-hover"
                onClick={() => router.push(action.href)}
                aria-label={action.label}
                whileTap={{ scale: 0.95 }}
                whileHover={{ y: -2 }}
              >
                <div
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: action.bg }}
                  aria-hidden="true"
                >
                  <Icon size={20} className="sm:size-26" style={{ color: action.color }} />
                </div>
                <span className="font-dm text-xs sm:text-sm font-semibold text-text-secondary leading-tight text-center">
                  {action.label}
                </span>
              </motion.button>
            );
          })}
        </motion.div>

        {/* ─── Spending Donut Chart + Benchmarks ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Donut chart */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="bg-surface rounded-2xl p-5 sm:p-6 border border-border shadow-card"
          >
            <h2 className="font-syne font-bold text-sm sm:text-base text-text-primary mb-2 sm:mb-3">
              Gastos del mes
            </h2>
            {isLoading ? (
              <div className="h-40 sm:h-48 shimmer-bg rounded-xl" />
            ) : (
              <div className="h-40 sm:h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="35%"
                      cy="50%"
                      innerRadius="45%"
                      outerRadius="75%"
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [formatCurrency(value), '']}
                      contentStyle={{
                        background: '#fff',
                        border: '1px solid rgba(0,87,255,0.12)',
                        borderRadius: '12px',
                        fontFamily: 'DM Sans, sans-serif',
                        fontSize: 12,
                      }}
                    />
                    <Legend
                      layout="vertical"
                      align="right"
                      verticalAlign="middle"
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ fontSize: 12, fontFamily: 'DM Sans, sans-serif', paddingLeft: 10 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
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
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-8 shimmer-bg rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {(summary?.topCategories ?? []).slice(0, 3).map((cat, i) => (
                  <BenchmarkBar
                    key={cat.categoryId}
                    emoji={cat.emoji}
                    label={cat.label}
                    userValue={cat.amount}
                    avgValue={cat.amount / (1 + cat.trend / 100)}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* ─── Active Goals ─── */}
        {goals.length > 0 && (
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
              {goals.map((goal) => {
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
              })}
            </div>
          </motion.div>
        )}

        {/* ─── Achievements Showcase ─── */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="bg-surface rounded-2xl p-4 border border-border shadow-card"
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
            {MOCK_ACHIEVEMENTS.map((achievement) => (
              <div key={achievement.id} className="flex-shrink-0 w-20">
                <AchievementBadge
                  achievement={achievement}
                  unlocked={!!achievement.unlockedAt}
                  size="sm"
                />
              </div>
            ))}
          </div>
        </motion.div>


      </div>
    </PageTransition>
  );
}
