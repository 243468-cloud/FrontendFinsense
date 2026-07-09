'use client';

import { useState, useEffect, useRef } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Search, X, Receipt, Target, SlidersHorizontal, Users, Clock } from 'lucide-react';
import { PageTransition, itemVariants } from '@/components/layout/PageTransition';
import { TransactionItem } from '@/components/ui/TransactionItem';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { getTransactions, deleteTransaction } from '@/services/transactionService';
import { getGoals } from '@/services/goalService';
import { searchUsers, UserSearchResult } from '@/services/userService';
import { formatCurrency, cn } from '@/lib/utils';
import Image from 'next/image';
import type { Transaction } from '@/types/transaction.types';
import type { Goal } from '@/types/goal.types';

export default function SearchPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { addToast } = useUIStore();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [users, setUsers] = useState<UserSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'transactions' | 'goals' | 'users'>('all');
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    try {
      const h = localStorage.getItem('finsense_search_history');
      if (h) setHistory(JSON.parse(h));
    } catch {}
  }, []);

  const saveToHistory = (term: string) => {
    if (!term.trim() || term.length < 2) return;
    const cleanTerm = term.trim().toLowerCase();
    setHistory(prev => {
      const newHistory = [cleanTerm, ...prev.filter(h => h !== cleanTerm)].slice(0, 5);
      localStorage.setItem('finsense_search_history', JSON.stringify(newHistory));
      return newHistory;
    });
  };

  const removeHistoryItem = (term: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHistory(prev => {
      const newHistory = prev.filter(h => h !== term);
      localStorage.setItem('finsense_search_history', JSON.stringify(newHistory));
      return newHistory;
    });
  };

  const handleResultClick = (action: () => void) => {
    saveToHistory(query);
    action();
  };

  useEffect(() => {
    if (!query || query.length < 2) {
      setUsers([]);
      return;
    }
    const delay = setTimeout(async () => {
      setIsSearchingUsers(true);
      try {
        const res = await searchUsers(query);
        setUsers(res);
      } catch { } finally { setIsSearchingUsers(false); }
    }, 300);
    return () => clearTimeout(delay);
  }, [query]);

  useEffect(() => {
    if (!user) { router.push('/auth'); return; }
    async function load() {
      try {
        const [txs, gls] = await Promise.all([getTransactions({ limit: 200 }), getGoals()]);
        setTransactions(txs);
        setGoals(gls);
      } catch { /* silent */ }
      finally { setIsLoading(false); }
    }
    load();
    setTimeout(() => inputRef.current?.focus(), 200);
  }, [user, router]);

  const debouncedQuery = useDebounce(query, 300);
  const q = debouncedQuery.toLowerCase().trim();

  const filteredTx = transactions.filter(t =>
    !q || t.note?.toLowerCase().includes(q) || t.categoryId?.toLowerCase().includes(q) ||
    String(t.amount).includes(q)
  );

  const filteredGoals = goals.filter(g =>
    !q || g.title?.toLowerCase().includes(q) || g.description?.toLowerCase().includes(q)
  );

  const totalResults = filteredTx.length + filteredGoals.length + users.length;

  return (
    <PageTransition className="min-h-screen bg-surface-2/50 -2 pb-24 text-text-primary">
      {/* Search Header */}
      <header className="sticky top-0 z-20 bg-surface/95 backdrop-blur-xl border-b border-border px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2 max-w-lg mx-auto">
          <button onClick={() => router.back()} className="touch-target p-2 rounded-xl hover:bg-surface-3 transition-colors flex-shrink-0">
            <ArrowLeft size={22} className="text-text-primary" />
          </button>
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary/60" />
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') saveToHistory(query);
              }}
              placeholder="Buscar transacciones, metas, usuarios…"
              className="w-full pl-9 pr-8 py-2.5 bg-surface-3 border border-transparent rounded-xl font-dm text-sm focus:outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/10 transition-all"
            />
            {query && (
              <button onClick={() => setQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-secondary/60 hover:text-text-primary">
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-3 max-w-lg mx-auto">
          {(['all', 'transactions', 'goals', 'users'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'flex-1 py-1.5 rounded-lg font-dm text-xs font-semibold transition-all',
                activeTab === tab ? 'bg-primary text-white shadow-sm' : 'text-text-secondary hover:bg-surface-3'
              )}
            >
              {tab === 'all' ? 'Todo' : tab === 'transactions' ? 'Mov.' : tab === 'goals' ? 'Metas' : 'Usuarios'}
            </button>
          ))}
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Results count */}
        {query && !isLoading && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-dm text-xs text-text-secondary">
            {totalResults} resultado{totalResults !== 1 ? 's' : ''} para "<span className="font-semibold text-primary">{query}</span>"
          </motion.p>
        )}

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-16 bg-slate-200/60 animate-pulse rounded-2xl" />)}
          </div>
        ) : (
          <>
            {/* Transactions */}
            {(activeTab === 'all' || activeTab === 'transactions') && filteredTx.length > 0 && (
              <div>
                <p className="font-syne font-bold text-xs text-text-secondary uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Receipt size={12} /> Movimientos ({filteredTx.length})
                </p>
                <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-card divide-y divide-border">
                  {filteredTx.slice(0, 20).map(tx => (
                    <div key={tx.id} onClick={() => saveToHistory(query)}>
                      <TransactionItem
                        transaction={tx}
                        onDelete={async (id) => {
                          await deleteTransaction(id);
                          setTransactions(prev => prev.filter(t => t.id !== id));
                          addToast({ message: 'Movimiento eliminado', type: 'success' });
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Goals */}
            {(activeTab === 'all' || activeTab === 'goals') && filteredGoals.length > 0 && (
              <div>
                <p className="font-syne font-bold text-xs text-text-secondary uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Target size={12} /> Metas ({filteredGoals.length})
                </p>
                <div className="space-y-2">
                  {filteredGoals.map(g => {
                    const pct = Math.min(Math.round((g.currentAmount / g.targetAmount) * 100), 100);
                    return (
                      <motion.button
                        key={g.id}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        onClick={() => handleResultClick(() => router.push('/goals'))}
                        className="w-full bg-surface border border-border rounded-2xl p-4 text-left shadow-card hover:shadow-card-hover transition-all"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-dm font-semibold text-sm text-text-primary">{g.title}</p>
                          <span className="font-mono text-xs text-primary font-bold">{pct}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-surface-3 rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <p className="font-dm text-xs text-text-secondary mt-1.5">
                          {formatCurrency(g.currentAmount)} / {formatCurrency(g.targetAmount)}
                        </p>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Users */}
            {(activeTab === 'all' || activeTab === 'users') && users.length > 0 && (
              <div>
                <p className="font-syne font-bold text-xs text-text-secondary uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Users size={12} /> Usuarios ({users.length})
                </p>
                <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-card divide-y divide-border">
                  {users.map(u => (
                    <button
                      key={u.id}
                      onClick={() => handleResultClick(() => router.push(`/users/${u.id}`))}
                      className="w-full flex items-center gap-3 p-4 hover:bg-surface-2 transition-colors text-left"
                    >
                      <div className="w-10 h-10 rounded-full border border-border overflow-hidden relative flex-shrink-0">
                        {u.avatar ? (
                          u.avatar.startsWith('http') || u.avatar.startsWith('/') || u.avatar.startsWith('data:') ? (
                            <Image src={u.avatar} alt={u.name} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full bg-surface-3 flex items-center justify-center font-syne text-xl">
                              {u.avatar}
                            </div>
                          )
                        ) : (
                          <div className="w-full h-full bg-surface-3 flex items-center justify-center font-syne font-bold text-sm text-primary">
                            {u.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-dm font-bold text-sm text-text-primary truncate">{u.name}</p>
                        <p className="font-dm text-xs text-text-secondary truncate">{u.city} · Nivel {u.userXp?.level || 1}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state & History */}
            {!query && (
              <div className="pt-2">
                {history.length > 0 ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                      <h3 className="font-syne font-bold text-sm text-text-primary">Búsquedas recientes</h3>
                      <button 
                        onClick={() => { setHistory([]); localStorage.removeItem('finsense_search_history'); }} 
                        className="text-xs font-dm text-text-secondary hover:text-primary transition-colors"
                      >
                        Borrar
                      </button>
                    </div>
                    <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm divide-y divide-border">
                      {history.map(h => (
                        <button
                          key={h}
                          onClick={() => setQuery(h)}
                          className="w-full flex items-center justify-between p-4 hover:bg-surface-2 transition-colors text-left group"
                        >
                          <div className="flex items-center gap-3">
                            <Clock size={16} className="text-text-secondary/60" />
                            <span className="font-dm text-sm text-text-primary">{h}</span>
                          </div>
                          <div 
                            onClick={(e) => removeHistoryItem(h, e)} 
                            className="p-1.5 rounded-lg hover:bg-surface-3 text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={14} />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16 space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-surface-3 border border-border flex items-center justify-center mx-auto text-text-secondary/40">
                      <Search size={22} />
                    </div>
                    <p className="font-dm font-semibold text-sm text-text-secondary">
                      Escribe para buscar
                    </p>
                    <p className="font-dm text-xs text-text-secondary/60">Busca por concepto, monto, categoría o usuario</p>
                  </motion.div>
                )}
              </div>
            )}

            {query && totalResults === 0 && !isLoading && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-surface-3 border border-border flex items-center justify-center mx-auto text-text-secondary/40">
                  <Search size={22} />
                </div>
                <p className="font-dm font-semibold text-sm text-text-secondary">
                  Sin resultados para "{query}"
                </p>
              </motion.div>
            )}
          </>
        )}
      </div>
    </PageTransition>
  );
}
