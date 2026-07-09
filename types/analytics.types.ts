// Analytics Types
export type Period = 'week' | 'month' | 'quarter' | 'year';

export interface Summary {
  period: Period;
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  savingsRate: number;
  dailyAverage?: number;
  topCategories: CategoryStat[];
  dailyData: DailyData[];
  weeklyData: WeeklyData[];
}

export interface CategoryStat {
  categoryId: string;
  label: string;
  emoji: string;
  color: string;
  amount: number;
  percentage: number;
  trend: number; // % change vs previous period
}

export interface DailyData {
  date: string;
  income: number;
  expenses: number;
}

export interface WeeklyData {
  week: string;
  income: number;
  expenses: number;
}

export interface Benchmark {
  categoryId: string;
  label: string;
  emoji: string;
  userAmount: number;
  cityAverage: number;
  city: string;
  percentageDiff: number; // positive = user spends more
}

export interface BenchmarkReport {
  city: string;
  period: Period;
  benchmarks: Benchmark[];
  overallSavingsComparison: number;
  suggestion: string;
}
