// FinSense — Investment Service
import apiClient from '@/lib/apiClient';
import type {
  Investment,
  InvestmentSummary,
  TickerSearchResult,
  CreateInvestmentDTO,
  UpdateInvestmentDTO,
} from '@/types/investment.types';

export async function getInvestments(): Promise<InvestmentSummary> {
  const { data } = await apiClient.get<InvestmentSummary>('/investments');
  return data;
}

export async function createInvestment(body: CreateInvestmentDTO): Promise<void> {
  await apiClient.post('/investments', body);
}

export async function searchTicker(query: string): Promise<TickerSearchResult[]> {
  const { data } = await apiClient.get<TickerSearchResult[]>(
    `/investments/search?q=${encodeURIComponent(query)}`,
  );
  return data;
}

export async function syncInvestments(): Promise<{ synced: number }> {
  const { data } = await apiClient.post<{ synced: number }>('/investments/sync');
  return data;
}

export async function updateInvestment(id: string, body: UpdateInvestmentDTO): Promise<void> {
  await apiClient.put(`/investments/${id}`, body);
}

export async function deleteInvestment(id: string): Promise<void> {
  await apiClient.delete(`/investments/${id}`);
}
