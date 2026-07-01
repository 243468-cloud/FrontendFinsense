'use client';
// Dashboard Principal con Panel de Notificaciones Conectado al Backend
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, TrendingDown, Plus, Target, Users, BarChart3,
  Bell, Settings, ArrowRight, X, Lightbulb,
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
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { getTransactions, deleteTransaction } from '@/services/transactionService';
import { getSummary, getBenchmarks } from '@/services/analyticsService';
import { getGoals } from '@/services/goalService';
import { getNotifications, markAsRead, markAllAsRead, type Notification } from '@/services/notificationService';
import { getGreeting, getInitials, formatCurrency, formatRelativeDate } from '@/lib/utils';
import { useUIStore } from '@/store/uiStore';
import type { Transaction } from '@/types/transaction.types';
import type { Summary, BenchmarkReport } from '@/types/analytics.types';
import type { Goal } from '@/types/goal.types';

const PIE_COLORS = ['#FF6B6B', '#4ECDC4', '#FFB800', '#A855F7', '#45B7D1'];

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { addToast } = useUIStore();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [benchmarks, setBenchmarks] = useState<BenchmarkReport | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [txs, sum, gls, notifs, bench] = await Promise.all([
          getTransactions({ limit: 5 }),
          getSummary('month'),
          getGoals(),
          getNotifications(),
          getBenchmarks('Tuxtla Gutiérrez'),
        ]);
        setTransactions(txs);
        setSummary(sum);
        setGoals(gls.filter((g) => g.status === 'active').slice(0, 2));
        setNotifications(notifs);
        setBenchmarks(bench);
      } catch {
        addToast({ message: 'Error al cargar datos', type: 'error' });
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [addToast]);

  // Polling for real-time notifications checking
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const notifs = await getNotifications();
        const currentUnreadIds = notifications.filter(n => !n.read).map(n => n.id);
        const newUnread = notifs.filter(n => !n.read && !currentUnreadIds.includes(n.id));
        if (newUnread.length > 0) {
          setNotifications(notifs);
          newUnread.forEach(n => {
            addToast({ message: `🔔 ${n.title}: ${n.body}`, type: 'success' });
          });
        }
      } catch {}
    }, 6000);
    return () => clearInterval(interval);
  }, [notifications, addToast]);

  async function handleDeleteTransaction(id: string) {
    await deleteTransaction(id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    addToast({ message: 'Transacción eliminada', type: 'success' });
  }

  async function handleMarkRead(id: string) {
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch {
      addToast({ message: 'Error al marcar como leída', type: 'error' });
    }
  }

  async function handleMarkAllRead() {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      addToast({ message: 'Todas las notificaciones leídas', type: 'success' });
    } catch {
      addToast({ message: 'Error al marcar todas como leídas', type: 'error' });
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  const pieData = (summary?.topCategories ?? []).slice(0, 5).map((cat) => ({
    name: cat.label,
    value: cat.amount,
    emoji: cat.emoji,
  })) ?? [];

  const greeting = getGreeting();
  const firstName = user?.name.split(' ')[0] ?? 'Usuario';

  return (
    <PageTransition className="min-h-screen bg-surface-2 pb-24">
      {/* ─── Header ─── */}
      <header className="sticky top-0 z-20 bg-surface/95 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="font-dm text-xs text-text-secondary">{greeting}</p>
            <h1 className="font-syne font-bold text-lg text-text-primary">
              {firstName} 👋
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNotifications(true)}
              className="touch-target rounded-xl hover:bg-surface-2 transition-colors relative w-10 h-10 flex items-center justify-center"
              aria-label="Notificaciones"
            >
              <Bell size={22} className="text-text-secondary" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-4 h-4 px-1 bg-red-500 rounded-full text-[9px] text-white font-mono font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            <button
              onClick={() => router.push('/profile')}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-syne font-bold text-sm touch-target"
              aria-label="Ver perfil"
            >
              {getInitials(user?.name ?? 'U')}
            </button>
          </div>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4 max-w-2xl mx-auto md:max-w-4xl">
        {/* ─── Balance Card ─── */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="relative overflow-hidden rounded-3xl p-6 text-white"
          style={{
            background: 'linear-gradient(135deg, #0057FF 0%, #003DB5 50%, #00C2FF 100%)',
            boxShadow: '0 12px 40px rgba(0, 87, 255, 0.30)',
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

            {/* Savings rate */}
            {!isLoading && summary && (
              <div className="mt-4">
                <div className="flex justify-between text-xs text-white/70 mb-1.5">
                  <span className="font-dm">Tasa de ahorro</span>
                  <span className="font-mono font-semibold text-white">{summary.savingsRate.toFixed(1)}%</span>
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

        {/* ─── Quick Actions ─── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-4 gap-3"
          aria-label="Acciones rápidas"
        >
          {[
            { icon: Plus,     label: 'Gasto',    href: '/transactions/new', color: '#FF6B6B', bg: '#FFF0F0' },
            { icon: TrendingUp,label: 'Ingreso',  href: '/transactions/new', color: '#00C896', bg: '#F0FFF9' },
            { icon: Target,   label: 'Metas',    href: '/goals',            color: '#0057FF', bg: '#F0F5FF' },
            { icon: Users,    label: 'Grupos',   href: '/groups',           color: '#A855F7', bg: '#FAF0FF' },
          ].map((action) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.label}
                variants={itemVariants}
                className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-surface border border-border transition-all duration-150 hover:shadow-card"
                onClick={() => router.push(action.href)}
                aria-label={action.label}
                whileTap={{ scale: 0.95 }}
                whileHover={{ y: -2 }}
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: action.bg }}
                  aria-hidden="true"
                >
                  <Icon size={22} style={{ color: action.color }} />
                </div>
                <span className="font-dm text-xs font-medium text-text-secondary">
                  {action.label}
                </span>
              </motion.button>
            );
          })}
        </motion.div>

        {/* ─── Spending Donut Chart + Benchmarks ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Donut chart */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="bg-surface rounded-2xl p-4 border border-border shadow-card"
          >
            <h2 className="font-syne font-bold text-base text-text-primary mb-3">
              Gastos del mes
            </h2>
            {isLoading ? (
              <div className="h-48 shimmer-bg rounded-xl" />
            ) : (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
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
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ fontSize: 11, fontFamily: 'DM Sans, sans-serif' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </motion.div>

          {/* Benchmarks locales */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="bg-surface rounded-2xl p-4 border border-border shadow-card"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-syne font-bold text-base text-text-primary">
                Benchmarks Locales
              </h2>
              <span className="text-xs font-dm text-text-secondary bg-surface-2 px-2 py-1 rounded-lg border border-border">
                vs. Tuxtla
              </span>
            </div>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-8 shimmer-bg rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {benchmarks && benchmarks.benchmarks.length > 0 ? (
                  benchmarks.benchmarks.slice(0, 3).map((b) => (
                    <BenchmarkBar
                      key={b.categoryId}
                      emoji={b.emoji}
                      label={b.label}
                      userValue={b.userAmount}
                      avgValue={b.cityAverage}
                    />
                  ))
                ) : (
                  <p className="font-dm text-xs text-text-secondary">Sin datos de benchmark este mes.</p>
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
                return (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl" role="img" aria-hidden="true">{goal.emoji}</span>
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

        {/* ─── Recent Transactions ─── */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="bg-surface rounded-2xl p-4 border border-border shadow-card"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-syne font-bold text-base text-text-primary">
              Últimos movimientos
            </h2>
            <button
              onClick={() => router.push('/analytics')}
              className="flex items-center gap-1 text-primary text-xs font-dm font-semibold hover:text-primary-dark"
              aria-label="Ver analytics"
            >
              Analytics <BarChart3 size={14} aria-hidden="true" />
            </button>
          </div>

          <div className="space-y-2" role="list" aria-label="Transacciones recientes">
            {isLoading
              ? [...Array(5)].map((_, i) => (
                  <SkeletonTransactionItem key={i} />
                ))
              : transactions.map((tx) => (
                  <TransactionItem
                    key={tx.id}
                    transaction={tx}
                    onDelete={handleDeleteTransaction}
                  />
                ))}
          </div>
        </motion.div>
      </div>

      {/* ─── Panel de Notificaciones Deslizable ─── */}
      <AnimatePresence>
        {showNotifications && (
          <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/50 backdrop-blur-xs p-4">
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              className="bg-surface w-full max-w-sm h-full max-h-[85vh] rounded-3xl border border-border shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-surface-2">
                <div>
                  <h3 className="font-syne font-bold text-sm text-text-primary">Notificaciones</h3>
                  {unreadCount > 0 && (
                    <p className="font-dm text-xs text-primary">{unreadCount} pendientes</p>
                  )}
                </div>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="w-8 h-8 rounded-lg hover:bg-surface-3 flex items-center justify-center text-text-secondary transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-border">
                {notifications.length === 0 ? (
                  <div className="text-center py-16 px-4">
                    <p className="text-2xl mb-2">🔔</p>
                    <p className="font-dm text-sm text-text-secondary">Sin notificaciones nuevas</p>
                  </div>
                ) : (
                  notifications.map((notif) => {
                    const typeEmojis = {
                      budget_exceeded: '🚨',
                      streak_at_risk: '🔥',
                      goal_deadline: '🎯',
                      reminder: '⏰',
                      badge_earned: '🎉',
                    };
                    return (
                      <button
                        key={notif.id}
                        onClick={() => !notif.read && handleMarkRead(notif.id)}
                        className={`w-full p-4 hover:bg-surface-2 transition-colors text-left flex gap-3 items-start relative ${
                          !notif.read ? 'bg-blue-50/20' : ''
                        }`}
                      >
                        <span className="text-xl mt-0.5">{typeEmojis[notif.type] || '🔔'}</span>
                        <div className="flex-1 min-w-0">
                          <p className={`font-dm text-xs ${!notif.read ? 'font-semibold text-text-primary' : 'text-text-secondary'}`}>
                            {notif.title}
                          </p>
                          <p className="font-dm text-[11px] text-text-secondary mt-0.5 leading-snug">
                            {notif.body}
                          </p>
                          <p className="font-dm text-[9px] text-text-secondary mt-1">
                            {formatRelativeDate(notif.createdAt)}
                          </p>
                        </div>
                        {!notif.read && (
                          <span className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>

              {unreadCount > 0 && (
                <div className="p-4 border-t border-border bg-surface-2 flex gap-2">
                  <Button fullWidth size="sm" variant="secondary" onClick={handleMarkAllRead}>
                    Marcar todo leído
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}
