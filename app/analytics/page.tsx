'use client';
// Analytics / Benchmarks — gráficas, comparativas locales, sugerencias
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { PageTransition, itemVariants } from '@/components/layout/PageTransition';
import { BenchmarkBar } from '@/components/ui/BenchmarkBar';
import { SkeletonCard } from '@/components/ui/SkeletonCard';
import { getSummary, getBenchmarks } from '@/services/analyticsService';
import { useUIStore } from '@/store/uiStore';
import { formatCurrency } from '@/lib/utils';
import type { Summary, BenchmarkReport } from '@/types/analytics.types';
import type { Period } from '@/types/analytics.types';
import { Lightbulb, TrendingUp, TrendingDown, Award } from 'lucide-react';

const PERIOD_LABELS: Record<Period, string> = {
  week: 'Semana',
  month: 'Mes',
  quarter: 'Trimestre',
  year: 'Año',
};

// Custom tooltip for line chart
function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface border border-border rounded-xl shadow-card p-3 font-dm text-xs">
      <p className="font-semibold text-text-primary mb-1">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-text-secondary">{entry.name}:</span>
          <span className="font-mono font-semibold" style={{ color: entry.color }}>
            {formatCurrency(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

// Podium for top 3 categories
function CategoryPodium({ categories }: {
  categories: Summary['topCategories'];
}) {
  const top3 = categories.slice(0, 3);
  const podiumOrder = [1, 0, 2]; // 2nd, 1st, 3rd

  return (
    <div className="flex items-end justify-center gap-3 pt-4 pb-2">
      {podiumOrder.map((idx) => {
        const cat = top3[idx];
        if (!cat) return null;
        const heights = ['h-24', 'h-32', 'h-20'];
        const medals = ['🥈', '🥇', '🥉'];
        const rankColors = ['#C0C0C0', '#FFD700', '#CD7F32'];

        return (
          <motion.div
            key={cat.categoryId}
            className="flex flex-col items-center gap-2"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            viewport={{ once: true }}
          >
            <span className="text-2xl" role="img" aria-hidden="true">{cat.emoji}</span>
            <p className="font-dm text-xs text-text-secondary text-center max-w-[60px] truncate">
              {cat.label}
            </p>
            <p className="font-mono font-bold text-xs" style={{ color: rankColors[podiumOrder.indexOf(idx)] }}>
              {formatCurrency(cat.amount)}
            </p>
            <div
              className={`w-16 ${heights[podiumOrder.indexOf(idx)]} rounded-t-xl flex items-center justify-center text-xl`}
              style={{ backgroundColor: cat.color + '25', border: `2px solid ${cat.color}40` }}
              aria-label={`Puesto ${podiumOrder.indexOf(idx) + 1}: ${cat.label}`}
            >
              {medals[podiumOrder.indexOf(idx)]}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export default function AnalyticsPage() {
  const { addToast } = useUIStore();
  const [period, setPeriod] = useState<Period>('month');
  const [summary, setSummary] = useState<Summary | null>(null);
  const [benchmarks, setBenchmarks] = useState<BenchmarkReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([getSummary(period), getBenchmarks('Tuxtla Gutiérrez')])
      .then(([s, b]) => { setSummary(s); setBenchmarks(b); })
      .catch(() => addToast({ message: 'Error cargando analytics', type: 'error' }))
      .finally(() => setIsLoading(false));
  }, [period, addToast]);

  const chartData = summary?.weeklyData ?? [];

  return (
    <PageTransition className="min-h-screen bg-surface-2">
      {/* ─── Header ─── */}
      <header className="sticky top-0 z-20 bg-surface/95 backdrop-blur-xl border-b border-border px-4 py-3">
        <h1 className="font-syne font-bold text-xl text-text-primary">Analytics</h1>
        <p className="font-dm text-xs text-text-secondary">Tu resumen financiero</p>
      </header>

      <div className="px-4 py-4 space-y-4 max-w-2xl mx-auto">
        {/* ─── Period Selector ─── */}
        <div
          className="flex bg-surface rounded-xl border border-border p-1 gap-1"
          role="tablist"
          aria-label="Período de análisis"
        >
          {(['week', 'month', 'quarter'] as Period[]).map((p) => (
            <button
              key={p}
              role="tab"
              aria-selected={period === p}
              className="flex-1 py-2 text-xs font-dm font-semibold rounded-lg transition-all duration-200 relative"
              onClick={() => setPeriod(p)}
            >
              <span className={period === p ? 'relative z-10 text-white' : 'text-text-secondary'}>
                {PERIOD_LABELS[p]}
              </span>
              {period === p && (
                <motion.div
                  layoutId="period-tab"
                  className="absolute inset-0 bg-primary rounded-lg"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* ─── Summary Cards ─── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              label: 'Ingresos',
              value: summary?.totalIncome ?? 0,
              icon: TrendingUp,
              color: '#00C896',
              bg: '#F0FFF9',
            },
            {
              label: 'Gastos',
              value: summary?.totalExpenses ?? 0,
              icon: TrendingDown,
              color: '#FF3B5C',
              bg: '#FFF0F3',
            },
            {
              label: 'Balance',
              value: summary?.balance ?? 0,
              icon: Award,
              color: '#0057FF',
              bg: '#F0F5FF',
            },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.label}
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="bg-surface rounded-2xl p-3 border border-border shadow-card"
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center mb-2"
                  style={{ backgroundColor: card.bg }}
                  aria-hidden="true"
                >
                  <Icon size={16} style={{ color: card.color }} />
                </div>
                {isLoading ? (
                  <div className="h-5 w-full shimmer-bg rounded" />
                ) : (
                  <p
                    className="font-mono font-bold text-sm"
                    style={{ color: card.color }}
                  >
                    {formatCurrency(card.value)}
                  </p>
                )}
                <p className="font-dm text-xs text-text-secondary mt-0.5">
                  {card.label}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* ─── Line Chart ─── */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="bg-surface rounded-2xl p-4 border border-border shadow-card"
        >
          <h2 className="font-syne font-bold text-base text-text-primary mb-4">
            Evolución de gastos
          </h2>
          {isLoading ? (
            <div className="h-48 shimmer-bg rounded-xl" />
          ) : (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,87,255,0.08)" />
                  <XAxis
                    dataKey="week"
                    tick={{ fontFamily: 'DM Sans', fontSize: 11, fill: '#4A5578' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontFamily: 'JetBrains Mono', fontSize: 10, fill: '#4A5578' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) => `$${v}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="income"
                    name="Ingresos"
                    stroke="#00C896"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#00C896' }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="expenses"
                    name="Gastos"
                    stroke="#FF3B5C"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#FF3B5C' }}
                    activeDot={{ r: 6 }}
                    strokeDasharray="5 5"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        {/* ─── Top 3 Categorías (Podio) ─── */}
        {summary && summary.topCategories.length >= 3 && (
          <motion.div
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="bg-surface rounded-2xl p-4 border border-border shadow-card"
          >
            <h2 className="font-syne font-bold text-base text-text-primary mb-1">
              Top categorías del mes
            </h2>
            <CategoryPodium categories={summary.topCategories} />
          </motion.div>
        )}

        {/* ─── Benchmarks Locales ─── */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="bg-surface rounded-2xl p-4 border border-border shadow-card"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-syne font-bold text-base text-text-primary">
              Vs. promedio Tuxtla
            </h2>
            <span className="text-xs bg-primary/10 text-primary font-dm font-semibold px-3 py-1 rounded-full border border-primary/20">
              📍 Tuxtla Gutiérrez
            </span>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => <div key={i} className="h-12 shimmer-bg rounded-xl" />)}
            </div>
          ) : (
            <div className="space-y-5">
              {benchmarks?.benchmarks.map((b) => (
                <BenchmarkBar
                  key={b.categoryId}
                  emoji={b.emoji}
                  label={b.label}
                  userValue={b.userAmount}
                  avgValue={b.cityAverage}
                />
              ))}
            </div>
          )}
        </motion.div>

        {/* ─── Sugerencia Inteligente ─── */}
        {benchmarks?.suggestion && (
          <motion.div
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-4 border border-primary/20"
          >
            <div className="flex gap-3">
              <div
                className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0"
                aria-hidden="true"
              >
                <Lightbulb size={20} className="text-primary" />
              </div>
              <div>
                <p className="font-syne font-bold text-sm text-primary mb-1">
                  Sugerencia FinSense
                </p>
                <p className="font-dm text-sm text-text-primary leading-relaxed">
                  {benchmarks.suggestion}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
}
