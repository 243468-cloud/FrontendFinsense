'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Search, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Award, 
  Calendar, 
  SlidersHorizontal,
  X
} from 'lucide-react';
import { PageTransition, containerVariants, itemVariants } from '@/components/layout/PageTransition';
import { TransactionItem } from '@/components/ui/TransactionItem';
import { SkeletonTransactionItem } from '@/components/ui/SkeletonCard';
import { getTransactions, deleteTransaction } from '@/services/transactionService';
import { CATEGORIES } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';
import { useUIStore } from '@/store/uiStore';
import type { Transaction, CategoryId, TransactionType } from '@/types/transaction.types';

export default function TransactionsHistoryPage() {
  const router = useRouter();
  const { addToast } = useUIStore();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | TransactionType>('all');
  const [filterCategory, setFilterCategory] = useState<'all' | CategoryId>('all');
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  useEffect(() => {
    async function loadTransactions() {
      setIsLoading(true);
      try {
        const data = await getTransactions();
        setTransactions(data);
      } catch {
        addToast({ message: 'Error al cargar transacciones', type: 'error' });
      } finally {
        setIsLoading(false);
      }
    }
    loadTransactions();
  }, [addToast]);

  async function handleDeleteTransaction(id: string) {
    try {
      await deleteTransaction(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      addToast({ message: 'Transacción eliminada con éxito', type: 'success' });
    } catch {
      addToast({ message: 'Error al eliminar transacción', type: 'error' });
    }
  }

  // Filter transactions logically based on UI selections
  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch = searchQuery.trim() === '' || 
      (t.note ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (CATEGORIES.find(c => c.id === t.categoryId)?.label ?? '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === 'all' || t.type === filterType;
    const matchesCategory = filterCategory === 'all' || t.categoryId === filterCategory;

    return matchesSearch && matchesType && matchesCategory;
  });

  // Calculate dynamic totals from filtered results
  const totalIncome = filteredTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = filteredTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  const clearFilters = () => {
    setSearchQuery('');
    setFilterType('all');
    setFilterCategory('all');
  };

  const hasActiveFilters = searchQuery !== '' || filterType !== 'all' || filterCategory !== 'all';

  return (
    <PageTransition className="min-h-screen bg-surface-2">
      {/* ─── Header ─── */}
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-xl border-b border-border px-4 py-3 sm:py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="touch-target rounded-xl hover:bg-surface-2 transition-colors"
            aria-label="Volver al Dashboard"
          >
            <ArrowLeft size={22} className="text-text-primary" />
          </button>
          <div>
            <h1 className="font-syne font-bold text-lg sm:text-xl text-text-primary">Movimientos</h1>
            <p className="font-dm text-xs text-text-secondary">Historial de finanzas</p>
          </div>
        </div>
        <button
          onClick={() => router.push('/transactions/new')}
          className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-blue-sm hover:bg-primary-dark transition-all touch-target"
          aria-label="Agregar transacción"
        >
          <Plus size={20} />
        </button>
      </header>

      <div className="p-3 sm:p-4 space-y-4 max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-4xl mx-auto md:px-6 md:py-6 pb-20">
        
        {/* ─── Search & Quick Filter Controls ─── */}
        <div className="space-y-2">
          <div className="flex gap-2">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search 
                size={16} 
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" 
              />
              <input
                type="text"
                placeholder="Buscar nota o categoría..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-white border border-border rounded-xl font-dm text-xs sm:text-sm text-text-primary placeholder-text-secondary outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                  aria-label="Borrar búsqueda"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Toggle Filters Panel */}
            <button
              onClick={() => setShowFiltersPanel(!showFiltersPanel)}
              className={`px-3 rounded-xl border flex items-center justify-center transition-all touch-target ${
                showFiltersPanel || hasActiveFilters
                  ? 'bg-primary/10 border-primary text-primary'
                  : 'bg-white border-border text-text-secondary hover:bg-surface-2'
              }`}
              aria-label="Filtros avanzados"
            >
              <SlidersHorizontal size={18} />
            </button>
          </div>

          {/* Advanced Filters Panel */}
          <AnimatePresence>
            {showFiltersPanel && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-white border border-border rounded-2xl p-4 space-y-4 overflow-hidden shadow-card"
              >
                {/* Filter by Type */}
                <div className="space-y-2">
                  <label className="font-syne font-bold text-xs text-text-primary">Tipo de movimiento</label>
                  <div className="flex bg-surface-2 rounded-xl p-1 gap-1">
                    {[
                      { id: 'all', label: 'Todos' },
                      { id: 'expense', label: 'Gastos' },
                      { id: 'income', label: 'Ingresos' }
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setFilterType(t.id as any)}
                        className={`flex-1 py-1.5 text-xs font-dm font-semibold rounded-lg transition-colors ${
                          filterType === t.id 
                            ? 'bg-white text-primary shadow-blue-sm border border-primary/5' 
                            : 'text-text-secondary hover:text-text-primary'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Filter by Category */}
                <div className="space-y-2">
                  <label className="font-syne font-bold text-xs text-text-primary">Categoría</label>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setFilterCategory('all')}
                      className={`px-3 py-1.5 text-xs font-dm font-semibold rounded-full border transition-all ${
                        filterCategory === 'all'
                          ? 'bg-primary border-primary text-white'
                          : 'bg-surface-2 border-border text-text-secondary hover:bg-surface-3'
                      }`}
                    >
                      Todas
                    </button>
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setFilterCategory(cat.id)}
                        className={`px-3 py-1.5 text-xs font-dm font-semibold rounded-full border transition-all ${
                          filterCategory === cat.id
                            ? 'bg-primary border-primary text-white'
                            : 'bg-surface-2 border-border text-text-secondary hover:bg-surface-3'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Active Filters Footer */}
                {hasActiveFilters && (
                  <div className="flex justify-between items-center pt-2 border-t border-border">
                    <span className="font-dm text-[11px] text-text-secondary">
                      Filtros activos
                    </span>
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="font-dm text-xs font-bold text-red-500 hover:text-red-600 transition-colors"
                    >
                      Restablecer filtros
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ─── Dynamic Balance & Summary Card ─── */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="bg-white border border-border rounded-2xl p-4 shadow-card grid grid-cols-3 gap-2 text-center"
        >
          <div className="space-y-1">
            <span className="font-dm text-[10px] text-text-secondary uppercase tracking-wider block">Ingresos</span>
            <span className="font-mono font-bold text-sm sm:text-base text-success flex items-center justify-center gap-0.5">
              <TrendingUp size={12} />
              {formatCurrency(totalIncome)}
            </span>
          </div>
          <div className="space-y-1 border-x border-border">
            <span className="font-dm text-[10px] text-text-secondary uppercase tracking-wider block">Gastos</span>
            <span className="font-mono font-bold text-sm sm:text-base text-red-500 flex items-center justify-center gap-0.5">
              <TrendingDown size={12} />
              {formatCurrency(totalExpenses)}
            </span>
          </div>
          <div className="space-y-1">
            <span className="font-dm text-[10px] text-text-secondary uppercase tracking-wider block">Balance</span>
            <span className={`font-mono font-bold text-sm sm:text-base flex items-center justify-center gap-0.5 ${
              balance >= 0 ? 'text-primary' : 'text-red-500'
            }`}>
              <Award size={12} />
              {formatCurrency(balance)}
            </span>
          </div>
        </motion.div>

        {/* ─── Transactions List ─── */}
        <div className="space-y-2">
          <h2 className="font-syne font-bold text-sm sm:text-base text-text-primary px-1">
            {searchQuery || filterType !== 'all' || filterCategory !== 'all'
              ? `Resultados encontrados (${filteredTransactions.length})`
              : 'Historial completo'}
          </h2>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-2"
            role="list"
            aria-label="Lista de transacciones"
          >
            {isLoading ? (
              [...Array(5)].map((_, i) => <SkeletonTransactionItem key={i} />)
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-16 bg-white border border-border rounded-2xl shadow-card p-6">
                <Calendar size={32} className="text-text-secondary/50 mx-auto mb-2" />
                <h3 className="font-syne font-bold text-sm text-text-primary">No se encontraron movimientos</h3>
                <p className="font-dm text-xs text-text-secondary mt-1">
                  Intenta cambiar los filtros o busca otra palabra clave.
                </p>
                {hasActiveFilters && (
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="mt-4 font-syne text-xs"
                    onClick={clearFilters}
                  >
                    Quitar filtros
                  </Button>
                )}
              </div>
            ) : (
              filteredTransactions.map((tx) => (
                <TransactionItem
                  key={tx.id}
                  transaction={tx}
                  onDelete={handleDeleteTransaction}
                />
              ))
            )}
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
