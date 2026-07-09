// FinSense — Transaction Service
import apiClient from '@/lib/apiClient';
import type {
  Transaction,
  CreateTransactionDTO,
  TransactionFilters,
  TransactionSummary,
} from '@/types/transaction.types';


// Maps DB category names → frontend slugs
const NAME_TO_SLUG: Record<string, string> = {
  alimentacion:   'food',
  transporte:     'transport',
  educacion:      'university',
  entretenimiento:'entertainment',
  servicios:      'services',
  salud:          'health',
  ropa:           'clothing',
  ahorro:         'savings',
  colectivo:      'colectivo',
  pozol:          'pozol',
  copias:         'copias',
  renta:          'renta',
  sueldo:         'salary',
  mesada:         'allowance',
  beca:           'scholarship',
  negocio:        'freelance',
  regalo:         'gift',
  otro:           'other',
};

// ─── Shape normalizer: backend → frontend ───
function mapTransaction(raw: any): Transaction {
  const catName = (raw.category?.name ?? '').toLowerCase();
  const categoryId = NAME_TO_SLUG[catName] ?? raw.categoryId ?? 'other';
  return {
    id: raw.id,
    userId: raw.userId ?? raw.user_id,
    type: raw.type,
    amount: Number(raw.amount),
    categoryId,
    note: raw.description ?? raw.note ?? '',
    date: raw.date ?? raw.createdAt,
    createdAt: raw.createdAt ?? raw.date,
    groupId: raw.groupId,
  } as Transaction;
}

export async function getTransactions(filters?: TransactionFilters): Promise<Transaction[]> {
  const { data } = await apiClient.get<{ data: any[]; total: number }>('/transactions', {
    params: filters,
  });
  return (data.data ?? []).map(mapTransaction);
}

export async function createTransaction(
  dto: CreateTransactionDTO,
): Promise<{ transaction: Transaction; streakResult?: any }> {
  const { data } = await apiClient.post<any>('/transactions', {
    amount: dto.amount,
    type: dto.type,
    categoryId: dto.categoryId,
    description: dto.note,
    date: dto.date,
    groupId: dto.groupId,
  });
  return { transaction: mapTransaction(data), streakResult: data.streakResult };
}

export async function deleteTransaction(id: string): Promise<void> {
  await apiClient.delete(`/transactions/${id}`);
}

export async function getTransactionSummary(): Promise<TransactionSummary> {
  const { data } = await apiClient.get<TransactionSummary>('/transactions/summary');
  return data;
}
