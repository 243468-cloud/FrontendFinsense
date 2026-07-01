// FinSense — Transaction Service (SOA)
import apiClient from '@/lib/apiClient';
import type {
  Transaction,
  CreateTransactionDTO,
  TransactionFilters,
  TransactionSummary,
} from '@/types/transaction.types';
import { MOCK_TRANSACTIONS } from '@/lib/mockData';

const USE_MOCK = false;
let mockData = [...MOCK_TRANSACTIONS];

const BACKEND_TO_FRONTEND_CATEGORIES: Record<string, string> = {
  'alimentacion': 'food',
  'comida': 'food',
  'transporte': 'transport',
  'educacion': 'university',
  'universidad': 'university',
  'entretenimiento': 'entertainment',
  'servicios': 'services',
  'salud': 'health',
  'ropa': 'clothing',
  'ahorro': 'savings',
};

// Normalize backend shape → frontend Transaction type
function mapTx(raw: any): Transaction {
  const rawCatName = raw.category?.name?.toLowerCase() ?? '';
  const mappedId = BACKEND_TO_FRONTEND_CATEGORIES[rawCatName] ?? raw.categoryId ?? 'other';
  return {
    id: raw.id,
    userId: raw.userId ?? raw.user_id,
    type: raw.type,
    amount: Number(raw.amount),
    categoryId: mappedId,
    note: raw.description ?? raw.note ?? '',
    date: raw.date ?? raw.createdAt,
    createdAt: raw.createdAt ?? raw.date,
    groupId: raw.groupId,
  } as Transaction;
}

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

  const { data } = await apiClient.get<{ data: any[]; total: number }>('/transactions', {
    params: filters,
  });
  return (data.data ?? []).map(mapTx);
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

  // Map frontend categoryId slug → Spanish name for backend auto-resolution
  const CATEGORY_NAMES: Record<string, string> = {
    food: 'Alimentacion', transport: 'Transporte', university: 'Educacion',
    entertainment: 'Entretenimiento', services: 'Servicios', health: 'Salud',
    clothing: 'Ropa', savings: 'Ahorro', other: 'Otro',
  };
  const payload = {
    ...dto,
    categoryId: undefined,
    categoryName: CATEGORY_NAMES[dto.categoryId] ?? dto.categoryId,
    description: dto.note,
  };
  const { data } = await apiClient.post<any>('/transactions', payload);
  return mapTx(data);
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
