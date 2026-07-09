// FinSense — Transaction Store (Zustand)
import { create } from 'zustand';
import type { Transaction } from '@/types/transaction.types';

interface TransactionState {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  hasLoaded: boolean;
  setTransactions: (transactions: Transaction[]) => void;
  addTransaction: (transaction: Transaction) => void;
  removeTransaction: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchTransactions: () => Promise<void>;
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  isLoading: false,
  error: null,
  hasLoaded: false,
  setTransactions: (transactions) => set({ transactions, hasLoaded: true }),
  addTransaction: (transaction) =>
    set((state) => ({ transactions: [transaction, ...state.transactions] })),
  removeTransaction: (id) =>
    set((state) => ({ transactions: state.transactions.filter((t) => t.id !== id) })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  fetchTransactions: async () => {
    if (get().hasLoaded) return;
    set({ isLoading: true });
    try {
      // Import here to avoid circular dependencies if any
      const { getTransactions } = await import('@/services/transactionService');
      const data = await getTransactions();
      set({ transactions: data, hasLoaded: true, error: null });
    } catch (e: any) {
      set({ error: e.message || 'Error fetching transactions' });
    } finally {
      set({ isLoading: false });
    }
  },
}));
