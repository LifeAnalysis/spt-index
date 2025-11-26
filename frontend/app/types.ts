export interface LendingMetrics {
  borrowVolume: number;
  supplyVolume: number;
  utilization: number;
  vanillaSupply: number;
  vanillaUtilization: number;
  vanillaSupplyRatio: number;
  pools?: Array<{
    symbol: string;
    chain: string;
    supplyUsd: number;
    borrowUsd: number;
    utilization: number;
    isVanilla: boolean;
  }>;
}

export interface DEXMetrics {
  capitalEfficiency: number;
  volumeToTVL: number;
}

export interface Protocol {
  protocol: string;
  slug: string;
  logo?: string | null;
  category: string;
  type: string;
  tvl: number;
  fees: number;
  volume: number;
  score: number;
  rawScore?: number;
  momentumScore?: number;
  momentum?: 'growing' | 'stable' | 'declining';
  historicalDataPoints?: number;
  change24h: number | null;
  change7d: number | null;
  change30d: number | null;
  lendingMetrics?: LendingMetrics;
  dexMetrics?: DEXMetrics;
}

export interface SPTData {
  dex: Protocol[];
  lending: Protocol[];
  cdp?: Protocol[];
  all: Protocol[];
  _metadata?: {
    cached: boolean;
    cacheAge: number;
    cacheTTL: number;
  };
}

export interface ProtocolDetail {
  name: string;
  slug: string;
  category: string;
  type: string;
  description?: string;
  website?: string;
  twitter?: string;
  logo?: string;
  versionsTracked?: string[];
  current: {
    tvl: number;
    fees: number;
    volume: number;
    score: number;
    rawScore: number;
    momentumScore?: number;
    momentum?: 'growing' | 'stable' | 'declining';
    change24h: number | null;
    change7d: number | null;
    change30d: number | null;
    lendingMetrics?: LendingMetrics;
    dexMetrics?: DEXMetrics;
  };
  historicalMetrics?: {
    fees: number[];
    volume: number[];
    tvl: number[];
    activity: number[];
  };
  historicalDataPoints: number;
  history: Array<{
    date: string;
    timestamp: number;
    score: number;
    rawScore: number;
    momentumScore: number;
    tvl: number;
    fees: number;
    volume: number;
  }>;
}

export type SortColumn = 'protocol' | 'rating' | 'score' | 'change24h' | 'change7d' | 'change30d';
export type SortDirection = 'asc' | 'desc';
