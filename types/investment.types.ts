// FinSense — Investment Types

export interface Investment {
  id: string;
  name: string;
  type: string;
  ticker?: string | null;
  shares?: number | null;
  initialAmount: number;
  currentValue: number;
  gainLoss: number;
  gainLossPct: number;
  purchaseDate: string;
  notes?: string | null;
  createdAt?: string;
}

export interface TickerSearchResult {
  symbol: string;
  name: string;
  exchange: string;
  type: string;
}

export interface InvestmentSummary {
  investments: Investment[];
  summary: {
    totalInvested: number;
    totalCurrentValue: number;
    totalGainLoss: number;
    totalGainLossPct: number;
    count: number;
  };
}

export interface CreateInvestmentDTO {
  name: string;
  type: string;
  initialAmount: number;
  currentValue: number;
  purchaseDate: string;
  notes?: string;
  ticker?: string;
  shares?: number;
}

export interface UpdateInvestmentDTO {
  currentValue?: number;
  name?: string;
  notes?: string;
}
