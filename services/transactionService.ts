// FinSense — Transaction Service (SOA)
import apiClient from '@/lib/apiClient';
import type {
  Transaction,
  CreateTransactionDTO,
  TransactionFilters,
  TransactionSummary,
} from '@/types/transaction.types';
import { MOCK_TRANSACTIONS } from '@/lib/mockData';

const USE_MOCK = true;
let mockData = [...MOCK_TRANSACTIONS];

export async function getTransactions(
  filters?: TransactionFilters
): Promise<Transaction[]> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 600));
    let result = [...mockData];
    if (filters?.type) result = result.filter((t) => t.type === filters.type);
    if (filters?.categoryId) result = result.filter((t) => t.categoryId === filters.categoryId);
    if (filters?.limit) result = result.slice(0, filters.limit);
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  const { data } = await apiClient.get<Transaction[]>('/transactions', {
    params: filters,
  });
  return data;
}

export async function createTransaction(
  dto: CreateTransactionDTO
): Promise<Transaction> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 800));
    const newTransaction: Transaction = {
      id: `tx_${Date.now()}`,
      userId: 'user_001',
      ...dto,
      createdAt: new Date().toISOString(),
    };
    mockData = [newTransaction, ...mockData];
    return newTransaction;
  }

  const { data } = await apiClient.post<Transaction>('/transactions', dto);
  return data;
}

export async function deleteTransaction(id: string): Promise<void> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 400));
    mockData = mockData.filter((t) => t.id !== id);
    return;
  }

  await apiClient.delete(`/transactions/${id}`);
}

export async function getTransactionSummary(): Promise<TransactionSummary> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 500));
    const income = mockData.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expenses = mockData.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const byCategory = mockData.reduce(
      (acc, t) => {
        if (t.type === 'expense') acc[t.categoryId] = (acc[t.categoryId] ?? 0) + t.amount;
        return acc;
      },
      {} as TransactionSummary['byCategory']
    );
    return { totalIncome: income, totalExpenses: expenses, balance: income - expenses, byCategory };
  }

  const { data } = await apiClient.get<TransactionSummary>('/transactions/summary');
  return data;
}
