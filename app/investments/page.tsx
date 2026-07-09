'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PageTransition, containerVariants, itemVariants } from '@/components/layout/PageTransition';
import { formatCurrency, cn } from '@/lib/utils';
import { Plus, Edit2 } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { useEffect } from 'react';
import { getInvestments, syncInvestments } from '@/services/investmentService';
import type { InvestmentSummary } from '@/types/investment.types';

import { InvestmentForm } from '@/components/investments/InvestmentForm';
import { SkeletonCard } from '@/components/ui/SkeletonCard';
import { RefreshCw } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';

export default function InvestmentsPage() {
  const router = useRouter();
  const { openBottomSheet } = useUIStore();
  const [summary, setSummary] = useState<InvestmentSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const loadInvestments = () => {
    getInvestments().then(data => {
      setSummary(data);
      setIsLoading(false);
    }).catch(e => {
      console.error(e);
      setIsLoading(false);
    });
  };

  useEffect(() => {
    loadInvestments();
  }, []);

  const handleCreate = () => {
    openBottomSheet(<InvestmentForm onSuccess={loadInvestments} />);
  };

  const handleEdit = (inv: any) => {
    openBottomSheet(<InvestmentForm initialData={inv} onSuccess={loadInvestments} />);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncInvestments();
      await loadInvestments();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSyncing(false);
    }
  };

  const [initialAmount, setInitialAmount] = useState(1000);
  const [monthlyContribution, setMonthlyContribution] = useState(500);
  const [years, setYears] = useState(10);
  const [interestRate, setInterestRate] = useState(10); // 10% annual

  const data = useMemo(() => {
    const result = [];
    let currentSaved = initialAmount;
    let currentInvested = initialAmount;
    const monthlyRate = interestRate / 100 / 12;

    for (let year = 0; year <= years; year++) {
      result.push({
        year,
        saved: Math.round(currentSaved),
        invested: Math.round(currentInvested),
      });

      // Calculate next year
      for (let month = 0; month < 12; month++) {
        currentSaved += monthlyContribution;
        currentInvested = (currentInvested + monthlyContribution) * (1 + monthlyRate);
      }
    }
    return result;
  }, [initialAmount, monthlyContribution, years, interestRate]);

  const finalSaved = data[data.length - 1]?.saved || 0;
  const finalInvested = data[data.length - 1]?.invested || 0;
  const difference = finalInvested - finalSaved;

  return (
    <PageTransition className="tour-investments-view min-h-screen bg-surface-2 pb-24">
      <header className="tour-investments-header sticky top-0 z-20 bg-surface/95 backdrop-blur-xl border-b border-border px-4 py-3.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/dashboard')} className="p-2 rounded-xl hover:bg-surface-3 transition-colors">
            <ArrowLeft size={22} className="text-text-primary" />
          </button>
          <div>
            <h1 className="font-syne font-bold text-lg text-text-primary flex items-center gap-2">
              <TrendingUp size={18} className="text-primary"/> Portafolio
            </h1>
            <p className="font-dm text-xs text-text-secondary">Tus inversiones activas</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleSync} disabled={isSyncing} className="flex items-center gap-1.5 bg-surface-2 text-text-secondary hover:bg-surface-3 px-3.5 py-2 rounded-xl font-dm font-semibold text-xs sm:text-sm transition-all disabled:opacity-50">
            <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Sincronizar</span>
          </button>
          <button onClick={handleCreate} className="flex items-center gap-1.5 bg-primary/10 text-primary hover:bg-primary/20 px-3.5 py-2 rounded-xl font-dm font-semibold text-xs sm:text-sm transition-all">
            <Plus size={14} />
            <span>Nueva</span>
          </button>
        </div>
      </header>

      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
        
        {/* User's Investments */}
        <div className="space-y-4">
          <h2 className="font-syne font-bold text-xl text-text-primary">Tus Inversiones</h2>
          
          {isLoading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
             </div>
          ) : (
            <>
              {summary && summary.investments.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-surface border border-border rounded-xl p-4 shadow-sm">
                      <p className="text-xs text-text-secondary font-semibold uppercase">Total Invertido</p>
                      <p className="font-mono text-xl font-bold">{formatCurrency(summary.summary.totalInvested)}</p>
                    </div>
                    <div className="bg-surface border border-border rounded-xl p-4 shadow-sm">
                      <p className="text-xs text-text-secondary font-semibold uppercase">Valor Actual</p>
                      <p className="font-mono text-xl font-bold">{formatCurrency(summary.summary.totalCurrentValue)}</p>
                    </div>
                    <div className="bg-surface border border-border rounded-xl p-4 shadow-sm">
                      <p className="text-xs text-text-secondary font-semibold uppercase">Ganancia/Pérdida</p>
                      <p className={cn("font-mono text-xl font-bold", summary.summary.totalGainLoss >= 0 ? "text-success" : "text-error")}>
                        {summary.summary.totalGainLoss >= 0 ? '+' : ''}{formatCurrency(summary.summary.totalGainLoss)}
                      </p>
                    </div>
                    <div className="bg-surface border border-border rounded-xl p-4 shadow-sm">
                      <p className="text-xs text-text-secondary font-semibold uppercase">Rendimiento</p>
                      <p className={cn("font-mono text-xl font-bold", summary.summary.totalGainLossPct >= 0 ? "text-success" : "text-error")}>
                        {summary.summary.totalGainLossPct >= 0 ? '+' : ''}{summary.summary.totalGainLossPct.toFixed(2)}%
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {summary.investments.map(inv => (
                      <div key={inv.id} className="bg-surface border border-border rounded-2xl p-4 shadow-sm relative group">
                        <button onClick={() => handleEdit(inv)} className="absolute top-3 right-3 p-2 bg-surface-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                          <Edit2 size={14} className="text-text-secondary" />
                        </button>
                        <h3 className="font-syne font-bold text-base text-text-primary mb-1">
                          {inv.name} {inv.ticker && <span className="text-xs bg-surface-3 px-1.5 py-0.5 rounded ml-1 font-mono">{inv.ticker}</span>}
                        </h3>
                        <p className="font-dm text-xs text-text-secondary mb-4">
                          {inv.type} · {new Date(inv.purchaseDate).toLocaleDateString()}
                          {inv.shares && ` · ${inv.shares} shares`}
                        </p>
                        
                        <div className="flex justify-between items-end mb-2">
                           <span className="font-dm text-xs text-text-secondary">Monto Inicial:</span>
                           <span className="font-mono text-sm text-text-primary">{formatCurrency(inv.initialAmount)}</span>
                        </div>
                        <div className="flex justify-between items-end mb-2">
                           <span className="font-dm text-xs text-text-secondary">Valor Actual:</span>
                           <span className="font-mono font-bold text-sm text-text-primary">{formatCurrency(inv.currentValue)}</span>
                        </div>
                        
                        <div className={cn("mt-3 inline-flex items-center px-2 py-1 rounded-lg text-xs font-bold font-mono", inv.gainLoss >= 0 ? "bg-success/10 text-success" : "bg-red-50 text-error")}>
                           {inv.gainLoss >= 0 ? '▲' : '▼'} {formatCurrency(inv.gainLoss)} ({inv.gainLossPct.toFixed(2)}%)
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="bg-surface-2 border border-border rounded-2xl p-8 text-center shadow-sm">
                  <TrendingUp size={48} className="text-text-secondary/50 mx-auto mb-4" />
                  <h3 className="font-syne font-bold text-lg text-text-primary mb-2">Aún no tienes inversiones</h3>
                  <p className="font-dm text-sm text-text-secondary mb-4 max-w-sm mx-auto">
                    Registra tus CETES, acciones o crypto para hacer un seguimiento centralizado de tu portafolio.
                  </p>
                  <button onClick={handleCreate} className="bg-primary text-white font-dm font-semibold text-sm px-6 py-2.5 rounded-xl hover:bg-primary-dark transition-colors inline-flex items-center gap-2">
                    <Plus size={16} /> Agregar Inversión
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <hr className="border-border" />
        <motion.div variants={itemVariants} className="bg-gradient-primary rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
          <div className="relative z-10">
            <h2 className="font-syne font-bold text-2xl mb-2 flex items-center gap-2">
              Haz crecer tu dinero
            </h2>
            <p className="font-dm text-white/90 max-w-md text-sm mb-6">
              Descubre cómo el interés compuesto puede multiplicar tus ahorros con el paso del tiempo si decides invertir.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/20">
                <p className="text-xs uppercase tracking-wider text-white/80 font-bold mb-1">Ahorrado (Bajo colchón)</p>
                <p className="text-2xl font-mono font-bold">{formatCurrency(finalSaved)}</p>
              </div>
              <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm border border-white/30">
                <p className="text-xs uppercase tracking-wider text-white/90 font-bold mb-1 flex items-center gap-1">Invertido al {interestRate}%</p>
                <p className="text-2xl font-mono font-bold">{formatCurrency(finalInvested)}</p>
                <p className="text-xs text-green-200 mt-1">+{formatCurrency(difference)} extra</p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Controls */}
          <motion.div variants={itemVariants} className="bg-surface p-5 rounded-2xl shadow-sm border border-border space-y-6 lg:col-span-1">
            <h3 className="font-syne font-bold text-lg text-text-primary">Variables</h3>
            
            <div className="space-y-2">
              <label className="flex justify-between font-dm text-sm text-text-secondary font-bold">
                Monto Inicial <span>{formatCurrency(initialAmount)}</span>
              </label>
              <input 
                type="range" min="0" max="50000" step="500" 
                value={initialAmount} onChange={e => setInitialAmount(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="flex justify-between font-dm text-sm text-text-secondary font-bold">
                Aportación Mensual <span>{formatCurrency(monthlyContribution)}</span>
              </label>
              <input 
                type="range" min="0" max="10000" step="100" 
                value={monthlyContribution} onChange={e => setMonthlyContribution(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="flex justify-between font-dm text-sm text-text-secondary font-bold">
                Años <span>{years} años</span>
              </label>
              <input 
                type="range" min="1" max="40" step="1" 
                value={years} onChange={e => setYears(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="flex justify-between font-dm text-sm text-text-secondary font-bold">
                Tasa de Interés Anual <span>{interestRate}%</span>
              </label>
              <input 
                type="range" min="1" max="20" step="1" 
                value={interestRate} onChange={e => setInterestRate(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <p className="text-[10px] text-text-secondary mt-1 flex items-center gap-1">
                <Info size={12}/> Ej: Cetes da ~10-11%, S&P500 da ~8-10%
              </p>
            </div>
          </motion.div>

          {/* Chart */}
          <motion.div variants={itemVariants} className="bg-surface p-5 rounded-2xl shadow-sm border border-border lg:col-span-2 flex flex-col h-[400px]">
            <h3 className="font-syne font-bold text-lg text-text-primary mb-4">Proyección en el tiempo</h3>
            <div className="flex-1 w-full h-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorSaved" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#9CA3AF" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#9CA3AF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border opacity-50" />
                  <XAxis 
                    dataKey="year" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: 'currentColor' }} 
                    className="text-text-secondary"
                    tickFormatter={(v) => `Año ${v}`}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: 'currentColor' }} 
                    className="text-text-secondary"
                    tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`}
                    width={50}
                  />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => formatCurrency(value)}
                    labelFormatter={(label) => `Año ${label}`}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="invested" 
                    name="Invertido" 
                    stroke="#10B981" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorInvested)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="saved" 
                    name="Ahorrado" 
                    stroke="#9CA3AF" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorSaved)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

      </div>
    </PageTransition>
  );
}
