// Protocol name to slug mapping
export const PROTOCOL_SLUGS: Record<string, string> = {
  // DEXs - Ethereum
  'Uniswap': 'uniswap',
  'Curve DEX': 'curve-dex',
  'SushiSwap': 'sushiswap',
  'Balancer': 'balancer',
  // DEXs - Multi-chain
  'PancakeSwap': 'pancakeswap',
  // DEXs - Solana
  'Raydium': 'raydium',
  // DEXs - Other L2s/Chains
  'QuickSwap': 'quickswap',
  'Aerodrome': 'aerodrome',
  // Lending - Ethereum
  'Aave': 'aave',
  'Compound V3': 'compound-v3',
  'Sky Lending': 'makerdao',
  'MakerDAO': 'makerdao',
  'Morpho': 'morpho',
  'Spark': 'spark',
  // Lending - Other Chains
  'JustLend': 'justlend',
  'Venus': 'venus',
  'Radiant': 'radiant',
  'BENQI': 'benqi'
};

export const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined || isNaN(value)) return '—';
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
  return `$${value.toFixed(2)}`;
};

export const formatScore = (score: number): string => {
  return score.toFixed(4);
};

export const formatChange = (change: number | null | undefined) => {
  if (change === null || change === undefined || isNaN(change)) {
    return { type: 'new' as const };
  }
  const isPositive = change >= 0;
  const color = isPositive ? 'text-emerald-600' : 'text-rose-600';
  const arrow = isPositive ? '▲' : '▼';
  return { 
    type: 'change' as const, 
    color, 
    arrow, 
    value: Math.abs(change).toFixed(2) 
  };
};

export const getScoreRating = (score: number): { label: string; color: string } => {
  // Updated thresholds for cross-protocol Z-score range (typically 0.35-0.75)
  // Using the more granular thresholds from the dashboard page
  if (score >= 0.65) return { label: 'AAA', color: 'text-[#49997E] bg-[#49997E]/10' };
  if (score >= 0.55) return { label: 'AA', color: 'text-emerald-600 bg-emerald-50' };
  if (score >= 0.48) return { label: 'A', color: 'text-blue-600 bg-blue-50' };
  if (score >= 0.42) return { label: 'BBB', color: 'text-amber-600 bg-amber-50' };
  if (score >= 0.35) return { label: 'BB', color: 'text-orange-600 bg-orange-50' };
  return { label: 'B', color: 'text-gray-600 bg-gray-100' };
};

