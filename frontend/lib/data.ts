import { calculateCohortSPTScore, calculateSelfSPTScore, calculateMomentumTrend } from './scoring';

// Protocol categories with their types
const PROTOCOL_TYPES: Record<string, 'dex' | 'lending'> = {
  'uniswap': 'dex',
  'curve-dex': 'dex',
  'sushiswap': 'dex',
  'balancer': 'dex',
  'pancakeswap': 'dex',
  'raydium': 'dex',
  'orca': 'dex',
  'trader-joe': 'dex',
  'quickswap': 'dex',
  'aerodrome': 'dex',
  'aave': 'lending',
  'compound-v3': 'lending',
  'makerdao': 'lending',
  'morpho': 'lending',
  'spark': 'lending',
  'justlend': 'lending',
  'venus': 'lending',
  'radiant': 'lending',
  'benqi': 'lending'
};

type HistoricalMetrics = {
  tvl: number[];
  fees: number[];
  volume: number[];
  activity: number[];
};

type Metrics = {
  fees: number;
  volume: number;
  tvl: number;
  activity: number;
};

type ProtocolData = {
  name: string;
  logo: string | null;
  category: string;
  type: 'dex' | 'lending';
  slug: string;
  currentMetrics: Metrics;
  historicalMetrics: HistoricalMetrics;
  tvl: number;
  tvl24hAgo: number;
  tvl7dAgo: number;
  tvl30dAgo: number;
  fees: number;
  fees7d: number;
  fees30d: number;
  volume: number;
  volume7d: number;
  volume30d: number;
};

/**
 * Get TVL at a specific timestamp from historical data
 */
function getTvlAtTimestamp(chainTvls: any, targetTimestamp: number): number {
  if (!chainTvls) return 0;
  
  let totalTvl = 0;
  for (const chain in chainTvls) {
    if (chainTvls[chain]?.tvl) {
      const tvlArray = chainTvls[chain].tvl;
      const closestPoint = tvlArray.reduce((prev: any, curr: any) => {
        return Math.abs(curr.date - targetTimestamp) < Math.abs(prev.date - targetTimestamp) ? curr : prev;
      });
      totalTvl += closestPoint.totalLiquidityUSD || 0;
    }
  }
  return totalTvl;
}

/**
 * Build historical arrays for all metrics over 90 days
 */
function buildHistoricalMetrics(tvlData: any, feesData: any, volumeData: any): HistoricalMetrics {
  const cutoff = Math.floor(Date.now() / 1000) - (90 * 86400);
  const dateMap = new Map<number, number>();
  
  // Aggregate TVL across ALL chains by date
  if (tvlData.chainTvls) {
    for (const chain in tvlData.chainTvls) {
      if (tvlData.chainTvls[chain]?.tvl) {
        tvlData.chainTvls[chain].tvl
          .filter((point: any) => point.date >= cutoff)
          .forEach((point: any) => {
            const date = point.date;
            const currentTvl = dateMap.get(date) || 0;
            dateMap.set(date, currentTvl + (point.totalLiquidityUSD || 0));
          });
      }
    }
  }
  
  const tvlHistory = Array.from(dateMap.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([, tvl]) => tvl)
    .filter(tvl => tvl > 0);
  
  const feesHistory: number[] = [];
  if (feesData.totalDataChart && Array.isArray(feesData.totalDataChart)) {
    feesData.totalDataChart
      .filter((item: any) => Array.isArray(item) && item[0] >= cutoff)
      .forEach(([, value]: [number, number]) => feesHistory.push(value || 0));
  }
  
  const volumeHistory: number[] = [];
  if (volumeData.totalDataChart && Array.isArray(volumeData.totalDataChart)) {
    volumeData.totalDataChart
      .filter((item: any) => Array.isArray(item) && item[0] >= cutoff)
      .forEach(([, value]: [number, number]) => volumeHistory.push(value || 0));
  }
  
  return {
    tvl: tvlHistory,
    fees: feesHistory,
    volume: volumeHistory,
    activity: []
  };
}

async function getProtocolData(protocol: string): Promise<ProtocolData> {
  try {
    const [tvlData, fees, volume] = await Promise.all([
      fetch(`https://api.llama.fi/protocol/${protocol}`, { next: { revalidate: 86400 } }).then(r => r.json()),
      fetch(`https://api.llama.fi/summary/fees/${protocol}`, { next: { revalidate: 86400 } })
        .then(r => r.json())
        .catch(() => ({ total24h: 0, total7d: 0, total30d: 0 })),
      fetch(`https://api.llama.fi/summary/dexs/${protocol}`, { next: { revalidate: 86400 } })
        .then(r => r.json())
        .catch(() => ({ total24h: 0, total7d: 0, total30d: 0 }))
    ]);

    const currentTvl = tvlData.currentChainTvls 
      ? Object.values(tvlData.currentChainTvls).reduce((sum: number, val: any) => sum + (val || 0), 0)
      : 0;

    let protocolType = PROTOCOL_TYPES[protocol];
    if (!protocolType) {
      const category = tvlData.category?.toLowerCase() || '';
      protocolType = (category.includes('dex') || category.includes('exchange')) ? 'dex' : 'lending';
    }

    const historicalMetrics = buildHistoricalMetrics(tvlData, fees, volume);

    const now = Math.floor(Date.now() / 1000);
    const tvl24hAgo = getTvlAtTimestamp(tvlData.chainTvls, now - 86400);
    const tvl7dAgo = getTvlAtTimestamp(tvlData.chainTvls, now - 604800);
    const tvl30dAgo = getTvlAtTimestamp(tvlData.chainTvls, now - 2592000);

    const currentMetrics: Metrics = {
      fees: fees.total24h || 0,
      volume: volume.total24h || 0,
      tvl: currentTvl,
      activity: 0
    };

    console.log(`${tvlData.name} (${protocolType}): TVL=$${currentTvl.toLocaleString()}, Fees=$${currentMetrics.fees.toLocaleString()}, Volume=$${currentMetrics.volume.toLocaleString()}, History: ${historicalMetrics.tvl.length}d`);

    return {
      name: tvlData.name,
      logo: tvlData.logo || null,
      category: tvlData.category,
      type: protocolType,
      slug: protocol,
      currentMetrics,
      historicalMetrics,
      tvl: currentTvl,
      tvl24hAgo,
      tvl7dAgo,
      tvl30dAgo,
      fees: currentMetrics.fees,
      fees7d: fees.total7d || 0,
      fees30d: fees.total30d || 0,
      volume: currentMetrics.volume,
      volume7d: volume.total7d || 0,
      volume30d: volume.total30d || 0
    };
  } catch (error) {
    console.error(`Error fetching data for ${protocol}:`, error);
    throw error;
  }
}

function calculateScoreChange(currentScore: number, historicalScore: number | null): number | null {
  if (!historicalScore || historicalScore === 0 || historicalScore < 0.000001) return null;
  
  const change = ((currentScore - historicalScore) / historicalScore) * 100;
  
  if (Math.abs(change) > 1000) return null;
  
  return change;
}

/**
 * Fetch protocols in batches to avoid timeouts
 */
async function fetchInBatches<T>(
  items: string[],
  batchSize: number,
  fetchFn: (item: string) => Promise<T | null>
): Promise<(T | null)[]> {
  const results: (T | null)[] = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    console.log(`📦 Fetching batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(items.length / batchSize)}: ${batch.join(', ')}`);
    
    const batchResults = await Promise.all(
      batch.map(async (slug) => {
        try {
          return await fetchFn(slug);
        } catch (err) {
          console.error(`Failed to get data for ${slug}:`, err);
          return null;
        }
      })
    );
    
    results.push(...batchResults);
  }
  
  return results;
}

export async function getSPTIndex(protocols: string[]) {
  // Fetch in batches of 6 protocols at a time to avoid timeout
  const metricsWithSlugs = await fetchInBatches(protocols, 6, getProtocolData);
  
  const validMetrics = metricsWithSlugs.filter((m): m is ProtocolData => m !== null);
  
  const dexProtocols = validMetrics.filter(p => p.type === 'dex');
  const lendingProtocols = validMetrics.filter(p => p.type === 'lending');
  
  const buildCohortMetrics = (protocolList: ProtocolData[]): HistoricalMetrics | null => {
    if (protocolList.length === 0) return null;
    
    return {
      fees: protocolList.flatMap(p => p.historicalMetrics.fees || []),
      volume: protocolList.flatMap(p => p.historicalMetrics.volume || []),
      tvl: protocolList.flatMap(p => p.historicalMetrics.tvl || []),
      activity: protocolList.flatMap(p => p.historicalMetrics.activity || [])
    };
  };
  
  const dexCohortMetrics = buildCohortMetrics(dexProtocols);
  const lendingCohortMetrics = buildCohortMetrics(lendingProtocols);
  
  const scored = validMetrics.map(p => {
    const cohortMetrics = p.type === 'dex' ? dexCohortMetrics : lendingCohortMetrics;
    
    let rawScore = 0;
    if (cohortMetrics && p.historicalMetrics && p.historicalMetrics.tvl.length > 0) {
      rawScore = calculateCohortSPTScore(
        p.currentMetrics,
        cohortMetrics,
        p.type
      );
    }
    
    let momentumScore = 0.5;
    if (p.historicalMetrics && p.historicalMetrics.tvl.length > 0) {
      momentumScore = calculateSelfSPTScore(
        p.currentMetrics,
        p.historicalMetrics,
        p.type
      );
    }
    
    const momentum = calculateMomentumTrend(momentumScore);
    
    let score24hAgo = null;
    let score7dAgo = null;
    let score30dAgo = null;
    
    if (cohortMetrics && p.historicalMetrics && p.historicalMetrics.tvl.length >= 30) {
      const historicalMetrics24h = {
        fees: p.currentMetrics.fees,
        volume: p.currentMetrics.volume,
        tvl: p.tvl24hAgo,
        activity: 0
      };
      score24hAgo = calculateCohortSPTScore(historicalMetrics24h, cohortMetrics, p.type);
      
      const historicalMetrics7d = {
        fees: p.fees7d / 7,
        volume: p.volume7d / 7,
        tvl: p.tvl7dAgo,
        activity: 0
      };
      score7dAgo = calculateCohortSPTScore(historicalMetrics7d, cohortMetrics, p.type);
      
      const historicalMetrics30d = {
        fees: p.fees30d / 30,
        volume: p.volume30d / 30,
        tvl: p.tvl30dAgo,
        activity: 0
      };
      score30dAgo = calculateCohortSPTScore(historicalMetrics30d, cohortMetrics, p.type);
    }
    
    const change24h = calculateScoreChange(rawScore, score24hAgo);
    const change7d = calculateScoreChange(rawScore, score7dAgo);
    const change30d = calculateScoreChange(rawScore, score30dAgo);

    return {
      protocol: p.name,
      logo: p.logo,
      slug: p.slug,
      category: p.category,
      type: p.type,
      tvl: p.tvl,
      fees: p.fees,
      volume: p.volume,
      rawScore,
      momentumScore,
      momentum,
      change24h,
      change7d,
      change30d,
      historicalDataPoints: p.historicalMetrics.tvl.length
    };
  });
  
  const dexResults = scored
    .filter(p => p.type === 'dex')
    .map(p => ({ ...p, score: p.rawScore }))
    .sort((a, b) => b.score - a.score);
  
  const lendingResults = scored
    .filter(p => p.type === 'lending')
    .map(p => ({ ...p, score: p.rawScore }))
    .sort((a, b) => b.score - a.score);
  
  return {
    dex: dexResults,
    lending: lendingResults,
    all: [...dexResults, ...lendingResults].sort((a, b) => b.score - a.score)
  };
}

