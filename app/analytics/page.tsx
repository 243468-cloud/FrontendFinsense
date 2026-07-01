'use client';
// Analytics / Benchmarks — gráficas, comparativas locales, sugerencias
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { PageTransition, itemVariants } from '@/components/layout/PageTransition';
import { BenchmarkBar } from '@/components/ui/BenchmarkBar';
import { SkeletonCard } from '@/components/ui/SkeletonCard';
import { getSummary, getBenchmarks } from '@/services/analyticsService';
import { useUIStore } from '@/store/uiStore';
import { formatCurrency, getIconForEmoji, cn } from '@/lib/utils';
import type { Summary, BenchmarkReport } from '@/types/analytics.types';
import type { Period } from '@/types/analytics.types';
import { Lightbulb, TrendingUp, TrendingDown, Award, Medal, Download, Loader2, Trophy, ArrowLeft } from 'lucide-react';

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
    <div className="flex items-end justify-center gap-2 sm:gap-3 pt-3 sm:pt-4 pb-1.5 sm:pb-2">
      {podiumOrder.map((idx) => {
        const cat = top3[idx];
        if (!cat) return null;
        const heights = ['h-16 sm:h-24', 'h-20 sm:h-32', 'h-12 sm:h-20'];
        
        const medalIcons = [
          <Award key="2nd" size={20} className="text-slate-400" aria-label="Segundo lugar" />,
          <Trophy key="1st" size={24} className="text-yellow-500 animate-bounce" aria-label="Primer lugar" />,
          <Medal key="3rd" size={18} className="text-amber-700" aria-label="Tercer lugar" />
        ];
        const rankColors = ['#C0C0C0', '#FFD700', '#CD7F32'];
        const CategoryIcon = getIconForEmoji(cat.emoji);

        return (
          <motion.div
            key={cat.categoryId}
            className="flex flex-col items-center gap-1.5 sm:gap-2"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            viewport={{ once: true }}
          >
            <CategoryIcon size={20} className="text-text-secondary" />
            <p className="font-dm text-xs text-text-secondary text-center max-w-[50px] sm:max-w-[60px] truncate">
              {cat.label}
            </p>
            <p className="font-mono font-bold text-xs" style={{ color: rankColors[podiumOrder.indexOf(idx)] }}>
              {formatCurrency(cat.amount)}
            </p>
            <div
              className={`w-12 sm:w-16 ${heights[podiumOrder.indexOf(idx)]} rounded-t-md sm:rounded-t-xl flex items-center justify-center`}
              style={{ backgroundColor: cat.color + '25', border: `2px solid ${cat.color}40` }}
              aria-label={`Puesto ${podiumOrder.indexOf(idx) + 1}: ${cat.label}`}
            >
              {medalIcons[podiumOrder.indexOf(idx)]}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export default function AnalyticsPage() {
  const router = useRouter();
  const { addToast } = useUIStore();
  const [period, setPeriod] = useState<Period>('month');
  const [activeSection, setActiveSection] = useState<'summary' | 'categories' | 'comparative'>('summary');
  const [summary, setSummary] = useState<Summary | null>(null);
  const [benchmarks, setBenchmarks] = useState<BenchmarkReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([getSummary(period), getBenchmarks('Tuxtla Gutiérrez')])
      .then(([s, b]) => { setSummary(s); setBenchmarks(b); })
      .catch(() => addToast({ message: 'Error cargando analytics', type: 'error' }))
      .finally(() => setIsLoading(false));
  }, [period, addToast]);

  const handleExport = () => {
    setIsExporting(true);
    addToast({ message: 'Generando informe visual en formato PDF...', type: 'info' });
    setTimeout(() => {
      setIsExporting(false);
      addToast({ message: '¡Tu informe mensual en PDF se ha descargado! 📄', type: 'success' });
    }, 2000);
  };

  const chartData = summary?.weeklyData ?? [];
  const pieColors = ['#FF6B6B', '#4ECDC4', '#FFB800', '#A855F7', '#45B7D1', '#00C896', '#0057FF', '#6B7280'];
  const pieData = summary?.topCategories.map((cat, idx) => ({
    name: cat.label,
    value: cat.amount,
    color: cat.color || pieColors[idx % pieColors.length]
  })) ?? [];

  return (
    <PageTransition className="min-h-screen bg-surface-2">
      {/* ─── Header ─── */}
      <header className="sticky top-0 z-20 bg-surface/95 backdrop-blur-xl border-b border-border px-4 py-3.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="touch-target rounded-xl hover:bg-slate-100 dark:hover:bg-surface-3 transition-colors p-2"
            aria-label="Volver al Dashboard"
          >
            <ArrowLeft size={22} className="text-text-primary" />
          </button>
          <div>
            <h1 className="font-syne font-bold text-lg text-text-primary">Analytics</h1>
            <p className="font-dm text-xs text-text-secondary">Tu resumen financiero</p>
          </div>
        </div>
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="flex items-center gap-1.5 bg-primary hover:bg-primary-dark text-white px-3.5 py-2 rounded-xl font-dm font-semibold text-xs sm:text-sm disabled:opacity-50 transition-all shadow-blue-sm touch-target"
        >
          {isExporting ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span>Exportando...</span>
            </>
          ) : (
            <>
              <Download size={14} />
              <span>Exportar PDF</span>
            </>
          )}
        </button>
      </header>

      <div className="p-3 sm:p-4 space-y-4 max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-4xl mx-auto md:px-6 md:py-6 pb-24">
        {/* ─── Period Selector ─── */}
        <div
          className="flex bg-surface rounded-lg sm:rounded-xl border border-border p-1 gap-1"
          role="tablist"
          aria-label="Período de análisis"
        >
          {(['week', 'month', 'quarter'] as Period[]).map((p) => (
            <button
              key={p}
              role="tab"
              aria-selected={period === p}
              className="flex-1 py-1.5 sm:py-2 text-xs sm:text-sm font-dm font-semibold rounded-md sm:rounded-lg transition-all duration-200 relative"
              onClick={() => setPeriod(p)}
            >
              <span className={period === p ? 'relative z-10 text-white font-bold' : 'text-text-secondary'}>
                {PERIOD_LABELS[p]}
              </span>
              {period === p && (
                <motion.div
                  layoutId="period-tab"
                  className="absolute inset-0 bg-primary rounded-md sm:rounded-lg"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* ─── Section Secondary Tabs ─── */}
        <div className="flex bg-surface rounded-xl border border-border p-1 gap-1" role="tablist">
          {[
            { id: 'summary', label: 'Resumen' },
            { id: 'categories', label: 'Categorías' },
            { id: 'comparative', label: 'Comparativa' }
          ].map((sec) => (
            <button
              key={sec.id}
              role="tab"
              aria-selected={activeSection === sec.id}
              className="flex-1 py-2 text-xs sm:text-sm font-dm font-semibold rounded-lg transition-all duration-200 relative"
              onClick={() => setActiveSection(sec.id as any)}
            >
              <span className={activeSection === sec.id ? 'relative z-10 text-white font-bold' : 'text-text-secondary'}>
                {sec.label}
              </span>
              {activeSection === sec.id && (
                <motion.div
                  layoutId="active-section-tab"
                  className="absolute inset-0 bg-primary rounded-lg"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* ─── Dynamic Section Rendering ─── */}
        <AnimatePresence mode="wait">
          {activeSection === 'summary' && (
            <motion.div
              key="summary-tab-content"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
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
                    <div
                      key={card.label}
                      className="bg-surface rounded-xl sm:rounded-2xl p-2 sm:p-3 border border-border shadow-card"
                    >
                      <div
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl flex items-center justify-center mb-1.5 sm:mb-2"
                        style={{ backgroundColor: card.bg }}
                        aria-hidden="true"
                      >
                        <Icon size={14} style={{ color: card.color }} />
                      </div>
                      {isLoading ? (
                        <div className="h-4 w-full shimmer-bg rounded" />
                      ) : (
                        <p
                          className="font-mono font-bold text-[11px] sm:text-sm text-ellipsis overflow-hidden"
                          style={{ color: card.color }}
                        >
                          {formatCurrency(card.value)}
                        </p>
                      )}
                      <p className="font-dm text-[10px] sm:text-xs text-text-secondary mt-0.5">
                        {card.label}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Line Chart */}
              <div className="bg-surface rounded-2xl p-4 border border-border shadow-card">
                <h2 className="font-syne font-bold text-base text-text-primary mb-4">
                  Evolución de finanzas
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
              </div>

              {/* Smart Suggestion */}
              {benchmarks?.suggestion && (
                <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-4 border border-primary/20 shadow-sm">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
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
                </div>
              )}
            </motion.div>
          )}

          {activeSection === 'categories' && (
            <motion.div
              key="categories-tab-content"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* Donut Chart */}
              <div className="bg-surface rounded-2xl p-4 border border-border shadow-card">
                <h2 className="font-syne font-bold text-base text-text-primary mb-4 text-center">
                  Distribución de gastos
                </h2>
                {isLoading ? (
                  <div className="h-56 shimmer-bg rounded-xl" />
                ) : (
                  <div className="h-56 flex items-center justify-center relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="45%"
                          innerRadius={55}
                          outerRadius={75}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {pieData.map((entry, idx) => (
                            <Cell key={`cell-${idx}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Legend 
                          verticalAlign="bottom" 
                          height={36} 
                          iconType="circle" 
                          iconSize={8}
                          wrapperStyle={{ fontFamily: 'DM Sans', fontSize: '11px', bottom: 0 }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute flex flex-col items-center justify-center pointer-events-none" style={{ transform: 'translateY(-18px)' }}>
                      <span className="font-dm text-[10px] text-text-secondary uppercase tracking-wider">Total Gastos</span>
                      <span className="font-mono font-bold text-base text-text-primary">
                        {formatCurrency(summary?.totalExpenses ?? 0)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Podium for top 3 categories */}
              {summary && summary.topCategories.length >= 3 && (
                <div className="bg-surface rounded-2xl p-4 border border-border shadow-card">
                  <h2 className="font-syne font-bold text-base text-text-primary mb-2">
                    Top categorías del mes
                  </h2>
                  <CategoryPodium categories={summary.topCategories} />
                </div>
              )}

              {/* Category Breakdown list */}
              <div className="bg-surface rounded-2xl p-4 border border-border shadow-card space-y-4">
                <h2 className="font-syne font-bold text-base text-text-primary">
                  Desglose por categorías
                </h2>
                <div className="space-y-3">
                  {summary?.topCategories.map((cat) => {
                    const CategoryIcon = getIconForEmoji(cat.emoji);
                    const isTrendPositive = cat.trend > 0;
                    return (
                      <div key={cat.categoryId} className="flex flex-col space-y-2 bg-slate-50 dark:bg-surface-3 p-3 rounded-2xl border border-border shadow-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white dark:bg-surface border border-border" style={{ color: cat.color }}>
                              <CategoryIcon size={18} />
                            </div>
                            <div>
                              <p className="font-dm text-xs font-bold text-text-primary">{cat.label}</p>
                              <p className="font-mono text-[10px] text-text-secondary">{cat.percentage}% del total</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-mono font-bold text-xs text-text-primary">{formatCurrency(cat.amount)}</p>
                            <div className={cn(
                              "inline-flex items-center gap-0.5 text-[9px] font-bold px-2 py-0.5 rounded-full mt-0.5",
                              cat.trend === 0 
                                ? "bg-slate-100 text-slate-600"
                                : isTrendPositive 
                                  ? "bg-red-50 dark:bg-red-950/20 text-red-500" 
                                  : "bg-green-50 dark:bg-green-950/20 text-green-500"
                            )}>
                              <span>{cat.trend === 0 ? '=' : isTrendPositive ? '↑' : '↓'}</span>
                              <span>{Math.abs(cat.trend)}% vs anterior</span>
                            </div>
                          </div>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-surface rounded-full h-1.5 overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {activeSection === 'comparative' && (
            <motion.div
              key="comparative-tab-content"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* Local Benchmarks vs Tuxtla */}
              <div className="bg-surface rounded-2xl p-4 border border-border shadow-card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-syne font-bold text-base text-text-primary">
                    Comparativa de gastos
                  </h2>
                  <span className="text-xs bg-primary/10 text-primary font-dm font-semibold px-3 py-1 rounded-full border border-primary/20">
                    📍 Tuxtla Gutiérrez
                  </span>
                </div>
                <p className="font-dm text-xs text-text-secondary mb-4 leading-relaxed">
                  Comparamos tus gastos mensuales con el promedio estimado para estudiantes universitarios y jóvenes en Tuxtla Gutiérrez ($4,200 MXN).
                </p>
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
              </div>

              {/* Local average stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white dark:bg-surface border border-border rounded-2xl p-4 shadow-sm text-center flex flex-col items-center justify-center">
                  <span className="text-2xl" role="img" aria-label="Ahorro promedio">📈</span>
                  <p className="font-mono font-bold text-lg text-text-primary mt-2">
                    {benchmarks?.overallSavingsComparison ? `+${benchmarks.overallSavingsComparison}%` : '+15.2%'}
                  </p>
                  <p className="font-dm text-[10px] text-text-secondary mt-1">
                    Tu tasa de ahorro vs. promedio local
                  </p>
                </div>
                <div className="bg-white dark:bg-surface border border-border rounded-2xl p-4 shadow-sm text-center flex flex-col items-center justify-center">
                  <span className="text-2xl" role="img" aria-label="Ingreso promedio">🎓</span>
                  <p className="font-mono font-bold text-lg text-text-primary mt-2">
                    $3,500
                  </p>
                  <p className="font-dm text-[10px] text-text-secondary mt-1">
                    Beca / Ingreso promedio mensual de estudiantes en Chiapas
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
