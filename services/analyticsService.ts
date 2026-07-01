// FinSense â€” Analytics Service (SOA)
import apiClient from '@/lib/apiClient';
import type { Summary, BenchmarkReport } from '@/types/analytics.types';
import type { Period } from '@/types/analytics.types';
import { MOCK_SUMMARY, MOCK_BENCHMARKS } from '@/lib/mockData';

const USE_MOCK = false;

export async function getSummary(period: Period): Promise<Summary> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 800));
    return { ...MOCK_SUMMARY, period };
  }

  const { data } = await apiClient.get<Summary>('/analytics/summary', {
    params: { period },
  });
  return data;
}

export async function getBenchmarks(city: string): Promise<BenchmarkReport> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 700));
    return MOCK_BENCHMARKS;
  }

  const { data } = await apiClient.get<BenchmarkReport>('/analytics/benchmarks', {
    params: { city },
  });
  return data;
}
