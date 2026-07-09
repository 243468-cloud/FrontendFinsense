'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, AlertTriangle, TrendingDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PageTransition, containerVariants, itemVariants } from '@/components/layout/PageTransition';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { getBudgets, Budget } from '@/services/budgetService';
import { formatCurrency, cn } from '@/lib/utils';
import { SkeletonCard } from '@/components/ui/SkeletonCard';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { BudgetForm } from '@/components/budgets/BudgetForm';

export default function BudgetsPage() {
  const router = useRouter();
  const { isPanicMode } = useAuthStore();
  const { openBottomSheet } = useUIStore();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadBudgets = () => {
    getBudgets().then((data) => {
      setBudgets(data);
      setIsLoading(false);
    });
  };

  useEffect(() => {
    loadBudgets();
  }, []);

  const handleCreate = () => {
    openBottomSheet(<BudgetForm onSuccess={loadBudgets} />);
  };

  const handleEdit = (b: Budget) => {
    openBottomSheet(
      <BudgetForm 
        initialData={{ id: b.id, categoryId: b.categoryId, limit: b.limit }} 
        onSuccess={loadBudgets} 
      />
    );
  };

  const totalLimit = budgets.reduce((acc, b) => acc + b.limit, 0);
  const totalSpent = budgets.reduce((acc, b) => acc + b.spent, 0);
  const totalPct = totalLimit > 0 ? (totalSpent / totalLimit) * 100 : 0;
  const isTotalOver = totalPct >= 100;

  return (
    <PageTransition className="min-h-screen bg-surface-2">
      {/* Header */}
      <header className="tour-budgets-header sticky top-0 z-20 bg-surface/95 backdrop-blur-xl border-b border-border px-4 py-3.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="touch-target rounded-xl hover:bg-surface-3 transition-colors p-2"
          >
            <ArrowLeft size={22} className="text-text-primary" />
          </button>
          <div>
            <h1 className="font-syne font-bold text-lg text-text-primary">Presupuestos</h1>
            <p className="font-dm text-xs text-text-secondary">Controla tus gastos</p>
          </div>
        </div>
        {budgets.length > 0 && (
          <button onClick={handleCreate} className="flex items-center gap-1.5 bg-primary/10 text-primary dark:text-accent hover:bg-primary/20 px-3.5 py-2 rounded-xl font-dm font-semibold text-xs sm:text-sm transition-all">
            <Plus size={14} />
            <span>Nuevo</span>
          </button>
        )}
      </header>

      <div className="p-3 sm:p-4 space-y-4 max-w-7xl mx-auto md:px-6 md:py-6">
        {/* Resumen Total */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="bg-surface rounded-3xl p-5 sm:p-6 border border-border shadow-card overflow-hidden relative"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent" />
          <h2 className="font-dm text-sm font-semibold text-text-secondary mb-1">Gasto Total vs Presupuesto</h2>
          
          {isLoading ? (
            <div className="h-10 w-48 shimmer-bg rounded-lg mt-2 mb-4" />
          ) : (
            <div className="flex items-baseline gap-2 mb-4 mt-1">
              <span className={`font-mono text-3xl font-bold ${isTotalOver ? 'text-red-500' : 'text-text-primary'}`}>
                {formatCurrency(totalSpent)}
              </span>
              <span className="font-dm text-sm text-text-secondary">/ {formatCurrency(totalLimit)}</span>
            </div>
          )}

          {!isLoading && (
            <div className="space-y-2">
              <ProgressBar 
                value={totalSpent} 
                max={totalLimit} 
                color={isTotalOver ? '#EF4444' : (totalPct > 80 ? '#F59E0B' : '#0057FF')}
                height="md"
              />
              <p className="font-dm text-xs text-text-secondary text-right">
                {totalPct.toFixed(1)}% consumido
              </p>
            </div>
          )}
        </motion.div>

        {/* Lista de Presupuestos */}
        {budgets.length === 0 && !isLoading ? (
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center justify-center py-12 px-4 bg-surface rounded-3xl border border-border border-dashed text-center shadow-sm"
          >
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
              <TrendingDown size={28} className="-rotate-12" />
            </div>
            <h3 className="font-syne font-bold text-lg text-text-primary mb-2">No tienes presupuestos activos</h3>
            <p className="font-dm text-sm text-text-secondary max-w-xs mx-auto mb-6">
              Establecer un límite mensual te ayudará a controlar tus gastos inteligentemente.
            </p>
            <button
              onClick={handleCreate}
              className="bg-primary text-white px-6 py-3 rounded-xl font-dm font-semibold text-sm hover:bg-primary/90 transition-all shadow-blue-md flex items-center gap-2 hover:-translate-y-0.5 active:translate-y-0"
            >
              <Plus size={18} />
              Crear presupuesto
            </button>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
            ) : (
              budgets.map((budget) => {
              const pct = (budget.spent / budget.limit) * 100;
              const isDanger = pct >= 90;
              const isWarning = pct >= 75 && pct < 90;
              
              // Basic check for essential (could be expanded based on categoryId)
              const isEssential = budget.categoryId === '1' || budget.categoryId === '2' || budget.categoryName.toLowerCase().includes('comida') || budget.categoryName.toLowerCase().includes('transporte');
              const isDisabled = isPanicMode && !isEssential;

              let statusColor = budget.categoryColor;
              if (isDisabled) statusColor = '#9CA3AF'; // Gray out
              else if (isDanger) statusColor = '#EF4444'; // Red
              else if (isWarning) statusColor = '#F59E0B'; // Amber

              return (
                <motion.div
                  key={budget.id}
                  variants={itemVariants}
                  whileHover={isDisabled ? {} : { y: -2 }}
                  onClick={() => !isDisabled && handleEdit(budget)}
                  className={cn(
                    "bg-surface rounded-2xl p-4 border shadow-sm flex flex-col justify-between transition-all cursor-pointer",
                    isDisabled ? "opacity-50 grayscale border-red-500/50 cursor-not-allowed" : "border-border hover:border-primary/30 hover:shadow-blue-sm"
                  )}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                        style={{ backgroundColor: `${budget.categoryColor}20` }}
                      >
                        {budget.categoryIcon}
                      </div>
                      <div>
                        <h3 className="font-syne font-bold text-text-primary text-sm">{budget.categoryName}</h3>
                        <p className="font-dm text-xs text-text-secondary capitalize">{budget.month}</p>
                      </div>
                    </div>
                    {isDisabled ? (
                      <div className="bg-red-50 text-red-500 px-2 py-1 rounded-lg text-[10px] font-bold uppercase flex items-center gap-1">
                        <AlertTriangle size={12}/> Bloqueado
                      </div>
                    ) : isDanger && (
                      <div className="bg-red-50 text-red-500 p-1.5 rounded-lg">
                        <AlertTriangle size={16} />
                      </div>
                    )}
                  </div>

                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between items-end">
                      <span className="font-mono font-bold text-sm text-text-primary">
                        {formatCurrency(budget.spent)}
                      </span>
                      <span className="font-dm text-xs text-text-secondary">
                        de {formatCurrency(budget.limit)}
                      </span>
                    </div>
                    <ProgressBar 
                      value={budget.spent}
                      max={budget.limit}
                      color={statusColor}
                    />
                    {budget.limit - budget.spent > 0 ? (
                      <p className="font-dm text-[10px] text-text-secondary/70">
                        Quedan <span className="font-semibold text-text-secondary">{formatCurrency(budget.limit - budget.spent)}</span>
                      </p>
                    ) : (
                      <p className="font-dm text-[10px] text-red-500 font-semibold">
                        Presupuesto excedido
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
}
