// Transaction Types
export type TransactionType = 'expense' | 'income';

export type CategoryId =
  | 'food'
  | 'transport'
  | 'university'
  | 'entertainment'
  | 'services'
  | 'health'
  | 'clothing'
  | 'savings'
  | 'other';

export interface Category {
  id: CategoryId;
  label: string;
  emoji: string;
  color: string;
  bgColor: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  categoryId: CategoryId;
  note: string;
  date: string;
  createdAt: string;
  groupId?: string;
}

export interface CreateTransactionDTO {
  type: TransactionType;
  amount: number;
  categoryId: CategoryId;
  note: string;
  date: string;
  groupId?: string;
}

export interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  type?: TransactionType;
  categoryId?: CategoryId;
  groupId?: string;
  limit?: number;
  offset?: number;
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  byCategory: Record<CategoryId, number>;
}
