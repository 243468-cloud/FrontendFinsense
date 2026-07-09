import api from '@/lib/apiClient';

export interface Budget {
  id: string;
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  limit: number;
  spent: number;
  pct: number;
  status: 'healthy' | 'warning' | 'exceeded';
  month: string;
}

export async function getBudgets(month?: string): Promise<Budget[]> {
  const params = month ? `?month=${month}` : '';
  const res = await api.get(`/budgets${params}`);
  return res.data;
}

export async function getBudgetCategories(): Promise<{ id: string; name: string; icon: string; color: string }[]> {
  const res = await api.get('/budgets/categories');
  return res.data;
}

export async function createBudget(body: { categoryId: string; limitAmount: number; month?: string }): Promise<void> {
  await api.post('/budgets', body);
}

export async function updateBudget(id: string, limitAmount: number): Promise<void> {
  await api.put(`/budgets/${id}`, { limitAmount });
}

export async function deleteBudget(id: string): Promise<void> {
  await api.delete(`/budgets/${id}`);
}
