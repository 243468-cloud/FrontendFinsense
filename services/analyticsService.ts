// FinSense — Analytics Service
import apiClient from '@/lib/apiClient';
import type { Summary, BenchmarkReport, Period } from '@/types/analytics.types';

export async function getSummary(period: Period): Promise<Summary> {
  const { data } = await apiClient.get<Summary>('/analytics/summary', {
    params: { period },
  });
  return data;
}

export async function getBenchmarks(city: string): Promise<BenchmarkReport> {
  const { data } = await apiClient.get<BenchmarkReport>('/analytics/benchmarks', {
    params: { city },
  });
  return data;
}

export async function analyzeChart(chartData: any[]): Promise<string> {
  const { data } = await apiClient.post<{ summary: string }>('/chat/analyze-chart', { chartData });
  return data.summary;
}

export async function getMonthlyComparison(months = 6) {
  const res = await apiClient.get(`/analytics/monthly-comparison?months=${months}`);
  return res.data as { month: string; income: number; expenses: number; balance: number }[];
}

export async function getPredictions() {
  const res = await apiClient.get('/analytics/predictions');
  return res.data as {
    spentSoFar: number; dailyAvg: number; projectedMonthTotal: number;
    projectedRemaining: number; remainingDays: number; historicalMonthlyAvg: number;
    trend: number; isOverBudget: boolean;
  };
}

export async function getAnomalies() {
  const res = await apiClient.get('/analytics/anomalies');
  return res.data as { categoryId: string; categoryName: string; categoryIcon: string; currentAmount: number; historicalAvg: number; multiple: number }[];
}
