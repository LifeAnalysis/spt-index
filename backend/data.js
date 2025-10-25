import { fetch } from 'undici';
import { calculateCohortSPTScore, calculateSelfSPTScore, calculateMomentumTrend, normalizeScores } from './scoring.js';
import { getLendingMetrics, getDEXMetrics } from './lendingMetrics.js';

// Protocol categories with their types
const PROTOCOL_TYPES = {
  // DEXs - Ethereum
  'uniswap-v3': 'dex',      // Combined V3+V4 liquidity
  'curve-dex': 'dex',
  'sushiswap': 'dex',
  'balancer': 'dex',
  // DEXs - Multi-chain
  'pancakeswap': 'dex',
  // DEXs - Solana
  'raydium': 'dex',
  'orca-dex': 'dex',
  'meteora-dlmm': 'dex',
  // DEXs - Other L2s/Chains
  'quickswap': 'dex',
  'aerodrome': 'dex',
  'momentum': 'dex',
  // Lending - Ethereum
  'aave': 'lending',
  'compound-v3': 'lending',
  'makerdao': 'lending',
  'morpho': 'lending',
  'spark': 'lending',
  'euler-v2': 'lending',
  'fluid-lending': 'lending',
  'maple': 'lending',
  // Lending - Other Chains
  'justlend': 'lending',
  'venus': 'lending',
  'radiant': 'lending',
  'benqi': 'lending',
  'kamino-lend': 'lending',
  // CDP - Collateralized Debt Position
  'liquity-v1': 'cdp',
  'crvusd': 'cdp',
  'liquity-v2': 'cdp'
};

// Protocol slug mappings (same as API slugs)
const PROTOCOL_SLUGS_MAP = {
  // DEXs
  'uniswap-v3': 'uniswap-v3',
  'curve-dex': 'curve-dex',
  'pancakeswap': 'pancakeswap',
  'sushiswap': 'sushiswap',
  'balancer': 'balancer',
  'raydium': 'raydium',
  'orca-dex': 'orca-dex',
  'meteora-dlmm': 'meteora-dlmm',
  'quickswap': 'quickswap',
  'aerodrome': 'aerodrome',
  'momentum': 'momentum',
  // Lending
  'aave': 'aave',
  'compound-v3': 'compound-v3',
  'makerdao': 'makerdao',
  'morpho': 'morpho',
  'spark': 'spark',
  'euler-v2': 'euler-v2',
  'fluid-lending': 'fluid-lending',
  'maple': 'maple',
  'justlend': 'justlend',
  'venus': 'venus',
  'radiant': 'radiant',
  'benqi': 'benqi',
  'kamino-lend': 'kamino-lend',
  // CDP
  'liquity-v1': 'liquity-v1',
  'crvusd': 'crvusd',
  'liquity-v2': 'liquity-v2'
};


/**
 * Extract historical daily values from time-series data
 * Returns last N days of data
 */
function extractHistoricalValues(timeSeriesData, days = 30) {
  if (!timeSeriesData || !Array.isArray(timeSeriesData)) return [];
  
  const now = Math.floor(Date.now() / 1000);
  const cutoff = now - (days * 86400);
  
  return timeSeriesData
    .filter(point => point.date >= cutoff)
    .map(point => point.totalLiquidityUSD || point.total || 0)
    .filter(val => val > 0);
}

/**
 * Get TVL at a specific timestamp from historical data
 */
function getTvlAtTimestamp(chainTvls, targetTimestamp) {
  if (!chainTvls) return 0;
  
  let totalTvl = 0;
  for (const chain in chainTvls) {
    if (chainTvls[chain]?.tvl) {
      const tvlArray = chainTvls[chain].tvl;
      const closestPoint = tvlArray.reduce((prev, curr) => {
        return Math.abs(curr.date - targetTimestamp) < Math.abs(prev.date - targetTimestamp) ? curr : prev;
      });
      totalTvl += closestPoint.totalLiquidityUSD || 0;
    }
  }
  return totalTvl;
}

/**
 * Build historical arrays for all metrics over 30 days (optimized for Railway free tier)
 * Properly aggregates TVL across all chains
 */
export function buildHistoricalMetrics(tvlData, feesData, volumeData) {
  const cutoff = Math.floor(Date.now() / 1000) - (30 * 86400);
  const dateMap = new Map();
  
  // Aggregate TVL across ALL chains by date
  if (tvlData.chainTvls) {
    for (const chain in tvlData.chainTvls) {
      if (tvlData.chainTvls[chain]?.tvl) {
        tvlData.chainTvls[chain].tvl
          .filter(point => point.date >= cutoff)
          .forEach(point => {
            const date = point.date;
            const currentTvl = dateMap.get(date) || 0;
            dateMap.set(date, currentTvl + (point.totalLiquidityUSD || 0));
          });
      }
    }
  }
  
  // Extract historical TVL values sorted by date
  const tvlHistory = Array.from(dateMap.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([date, tvl]) => tvl)
    .filter(tvl => tvl > 0);
  
  // Extract historical fees (if available)
  const feesHistory = [];
  if (feesData.totalDataChart && Array.isArray(feesData.totalDataChart)) {
    feesData.totalDataChart
      .filter(item => Array.isArray(item) && item[0] >= cutoff)
      .forEach(([date, value]) => feesHistory.push(value || 0));
  }
  
  // Extract historical volume (if available)
  const volumeHistory = [];
  if (volumeData.totalDataChart && Array.isArray(volumeData.totalDataChart)) {
    volumeData.totalDataChart
      .filter(item => Array.isArray(item) && item[0] >= cutoff)
      .forEach(([date, value]) => volumeHistory.push(value || 0));
  }
  
  return {
    tvl: tvlHistory,
    fees: feesHistory,
    volume: volumeHistory,
    feeGrowth: [] // Fee growth (change_1d) will be calculated from current data
  };
}

async function getProtocolData(protocol) {
  try {
    // Fetch current and historical data
    const [tvlData, fees, volume] = await Promise.all([
      fetch(`https://api.llama.fi/protocol/${protocol}`).then(r => r.json()),
      fetch(`https://api.llama.fi/summary/fees/${protocol}`).then(r => r.json()).catch(() => ({ 
        total24h: 0, 
        total7d: 0, 
        total30d: 0,
        change_1d: 0
      })),
      fetch(`https://api.llama.fi/summary/dexs/${protocol}`).then(r => r.json()).catch(() => ({ 
        total24h: 0, 
        total7d: 0, 
        total30d: 0 
      }))
    ]);

    // Calculate current TVL from currentChainTvls
    const currentTvl = tvlData.currentChainTvls 
      ? Object.values(tvlData.currentChainTvls).reduce((sum, val) => sum + (val || 0), 0)
      : 0;

    // Determine protocol type
    let protocolType = PROTOCOL_TYPES[protocol];
    if (!protocolType) {
      const category = tvlData.category?.toLowerCase() || '';
      protocolType = (category.includes('dex') || category.includes('exchange')) ? 'dex' : 'lending';
    }

    // Build historical metrics for scoring
    const historicalMetrics = buildHistoricalMetrics(tvlData, fees, volume);

    // Get historical TVL for change calculations
    const now = Math.floor(Date.now() / 1000);
    const tvl24hAgo = getTvlAtTimestamp(tvlData.chainTvls, now - 86400);
    const tvl7dAgo = getTvlAtTimestamp(tvlData.chainTvls, now - 604800);
    const tvl30dAgo = getTvlAtTimestamp(tvlData.chainTvls, now - 2592000);

    // Extract fee growth (change_1d) from fees API
    const feeGrowth = fees.change_1d ? parseFloat(fees.change_1d) : 0;

    // Fetch protocol-type specific metrics
    let currentMetrics;
    let lendingMetrics = null;
    
    if (protocolType === 'lending' || protocolType === 'cdp') {
      // Fetch lending/CDP metrics (borrow volume, utilization, vanilla assets)
      // CDP protocols mint stablecoins (debt) which is similar to lending borrow volumes
      lendingMetrics = await getLendingMetrics(protocol);
      
      if (lendingMetrics) {
        currentMetrics = {
          borrowVolume: lendingMetrics.totalBorrowUsd,
          vanillaSupply: lendingMetrics.vanillaSupplyUsd,
          utilization: lendingMetrics.utilizationRate / 100, // Convert to decimal
          fees: fees.total24h || 0,
          // Legacy metrics for backwards compatibility
          volume: lendingMetrics.totalBorrowUsd,
          tvl: currentTvl,
          feeGrowth: feeGrowth
        };
        
        console.log(`${tvlData.name} (${protocolType}): Borrow=$${lendingMetrics.totalBorrowUsd.toLocaleString()}, Vanilla=$${lendingMetrics.vanillaSupplyUsd.toLocaleString()}, Utilization=${lendingMetrics.utilizationRate.toFixed(1)}%, Fees=$${currentMetrics.fees.toLocaleString()}`);
      } else {
        // Fallback if lending/CDP metrics unavailable
        currentMetrics = {
          borrowVolume: 0,
          vanillaSupply: 0,
          utilization: 0,
          fees: fees.total24h || 0,
          volume: 0,
          tvl: currentTvl,
          feeGrowth: feeGrowth
        };
        console.log(`${tvlData.name} (${protocolType}): No borrow data available, using fallback metrics`);
      }
    } else {
      // DEX metrics - calculate capital efficiency (Volume/TVL ratio)
      const volumeAmount = volume.total24h || 0;
      const capitalEfficiency = currentTvl > 0 ? volumeAmount / currentTvl : 0;
      
      currentMetrics = {
        volume: volumeAmount,
        capitalEfficiency: capitalEfficiency,
        fees: fees.total24h || 0,
        feeGrowth: feeGrowth,
        // Legacy metrics for backwards compatibility
        tvl: currentTvl
      };
      
      console.log(`${tvlData.name} (dex): Volume=$${volumeAmount.toLocaleString()}, TVL=$${currentTvl.toLocaleString()}, Cap.Eff=${capitalEfficiency.toFixed(4)}, Fees=$${currentMetrics.fees.toLocaleString()}`);
    }

    return {
      name: tvlData.name,
      logo: tvlData.logo || null,
      category: tvlData.category,
      type: protocolType,
      currentMetrics,
      historicalMetrics,
      lendingMetrics, // Include full lending metrics for detail page
      tvl: currentTvl,
      tvl24hAgo,
      tvl7dAgo,
      tvl30dAgo,
      fees: fees.total24h || 0,
      fees7d: fees.total7d || 0,
      fees30d: fees.total30d || 0,
      volume: volume.total24h || 0,
      volume7d: volume.total7d || 0,
      volume30d: volume.total30d || 0
    };
  } catch (error) {
    console.error(`Error fetching data for ${protocol}:`, error.message);
    throw error;
  }
}

function calculateScoreWithHistory(protocol) {
  // Use advanced scoring if we have sufficient historical data
  const hasHistory = protocol.historicalMetrics.tvl.length >= 30 && 
                     (protocol.historicalMetrics.fees.length >= 30 || 
                      protocol.historicalMetrics.volume.length >= 30);
  
  if (hasHistory) {
    // Advanced Z-score based scoring
    return calculateSPTScore(
      protocol.currentMetrics,
      protocol.historicalMetrics,
      protocol.type
    );
  } else {
    // Fallback to simple capital efficiency
    return calculateSimpleSPTScore(
      protocol.fees,
      protocol.volume,
      protocol.tvl,
      protocol.type
    );
  }
}

function calculateScoreChange(currentScore, historicalScore) {
  if (!historicalScore || historicalScore === 0 || historicalScore < 0.000001) return null;
  
  const change = ((currentScore - historicalScore) / historicalScore) * 100;
  
  // Cap unrealistic changes (likely due to data issues or system changes)
  // Max +/-1000% is already a 10x change, anything beyond suggests data problems
  if (Math.abs(change) > 1000) return null;
  
  return change;
}

export async function getSPTIndex(protocols) {
  // Fetch in batches of 3 to avoid memory exhaustion on Railway's 512MB limit
  const metricsWithSlugs = [];
  const batchSize = 3;
  
  for (let i = 0; i < protocols.length; i += batchSize) {
    const batch = protocols.slice(i, i + batchSize);
    console.log(`📦 Fetching batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(protocols.length / batchSize)}: ${batch.join(', ')}`);
    
    const batchResults = await Promise.all(
      batch.map(async (slug) => {
        try {
          const data = await getProtocolData(slug);
          return { ...data, slug }; // Add slug to the data
        } catch (err) {
          console.error(`Failed to get data for ${slug}:`, err.message);
          return null;
        }
      })
    );
    
    metricsWithSlugs.push(...batchResults);
    
    // Allow garbage collection between batches
    if (global.gc) global.gc();
  }
  
  const validMetrics = metricsWithSlugs.filter(m => m !== null);
  
  // Separate protocols by type for cohort analysis
  const dexProtocols = validMetrics.filter(p => p.type === 'dex');
  const lendingProtocols = validMetrics.filter(p => p.type === 'lending');
  const cdpProtocols = validMetrics.filter(p => p.type === 'cdp');
  
  // Build cohort-wide historical metrics for each type
  const buildCohortMetrics = (protocolList) => {
    if (protocolList.length === 0) return null;
    
    return {
      fees: protocolList.flatMap(p => p.historicalMetrics.fees || []),
      volume: protocolList.flatMap(p => p.historicalMetrics.volume || []),
      tvl: protocolList.flatMap(p => p.historicalMetrics.tvl || []),
      feeGrowth: protocolList.flatMap(p => p.historicalMetrics.feeGrowth || [])
    };
  };
  
  const dexCohortMetrics = buildCohortMetrics(dexProtocols);
  const lendingCohortMetrics = buildCohortMetrics(lendingProtocols);
  const cdpCohortMetrics = buildCohortMetrics(cdpProtocols);
  
  // Calculate both scores for each protocol
  const scored = validMetrics.map(p => {
    const cohortMetrics = p.type === 'dex' ? dexCohortMetrics : (p.type === 'cdp' ? cdpCohortMetrics : lendingCohortMetrics);
    
    // Calculate current SPT score (cross-protocol comparison)
    let rawScore = 0;
    if (cohortMetrics && p.historicalMetrics && p.historicalMetrics.tvl.length > 0) {
      rawScore = calculateCohortSPTScore(
        p.currentMetrics,
        cohortMetrics,
        p.type
      );
    } else {
      // Fallback if no cohort data
      rawScore = calculateScoreWithHistory(p);
    }
    
    // Calculate momentum score (self-comparison)
    let momentumScore = 0.5; // Default neutral
    if (p.historicalMetrics && p.historicalMetrics.tvl.length > 0) {
      momentumScore = calculateSelfSPTScore(
        p.currentMetrics,
        p.historicalMetrics,
        p.type
      );
    }
    
    // Calculate momentum trend
    const momentum = calculateMomentumTrend(momentumScore);
    
    // Calculate historical SPT scores (cohort-based) for change calculations
    let score24hAgo = null;
    let score7dAgo = null;
    let score30dAgo = null;
    
    if (cohortMetrics && p.historicalMetrics && p.historicalMetrics.tvl.length >= 30) {
      // Use cohort methodology for historical comparisons
      const historicalMetrics24h = {
        fees: p.currentMetrics.fees,
        volume: p.currentMetrics.volume,
        tvl: p.tvl24hAgo,
        feeGrowth: 0 // Historical fee growth not available for past periods
      };
      score24hAgo = calculateCohortSPTScore(historicalMetrics24h, cohortMetrics, p.type);
      
      const historicalMetrics7d = {
        fees: p.fees7d / 7,
        volume: p.volume7d / 7,
        tvl: p.tvl7dAgo,
        feeGrowth: 0
      };
      score7dAgo = calculateCohortSPTScore(historicalMetrics7d, cohortMetrics, p.type);
      
      const historicalMetrics30d = {
        fees: p.fees30d / 30,
        volume: p.volume30d / 30,
        tvl: p.tvl30dAgo,
        feeGrowth: 0
      };
      score30dAgo = calculateCohortSPTScore(historicalMetrics30d, cohortMetrics, p.type);
    }
    
    // Calculate percentage changes based on SPT score (not momentum)
    const change24h = calculateScoreChange(rawScore, score24hAgo);
    const change7d = calculateScoreChange(rawScore, score7dAgo);
    const change30d = calculateScoreChange(rawScore, score30dAgo);

    // Build display metrics based on protocol type
    const displayMetrics = {
      protocol: p.name,
      logo: p.logo,
      slug: p.slug,
      category: p.category,
      type: p.type,
      tvl: p.tvl,
      fees: p.fees,
      volume: p.volume,
      feeGrowth: p.currentMetrics.feeGrowth,
      currentMetrics: p.currentMetrics,
      rawScore,
      momentumScore,
      momentum,
      change24h,
      change7d,
      change30d,
      historicalDataPoints: p.historicalMetrics.tvl.length
    };
    
    // Add lending-specific metrics if available
    if (p.type === 'lending' && p.lendingMetrics) {
      displayMetrics.lendingMetrics = {
        borrowVolume: p.lendingMetrics.totalBorrowUsd,
        supplyVolume: p.lendingMetrics.totalSupplyUsd,
        utilization: p.lendingMetrics.utilizationRate,
        vanillaSupply: p.lendingMetrics.vanillaSupplyUsd,
        vanillaUtilization: p.lendingMetrics.vanillaUtilization,
        vanillaSupplyRatio: p.lendingMetrics.vanillaSupplyRatio
      };
    }
    
    // Add DEX-specific metrics
    if (p.type === 'dex') {
      displayMetrics.dexMetrics = {
        capitalEfficiency: p.currentMetrics.capitalEfficiency,
        volumeToTVL: p.currentMetrics.capitalEfficiency
      };
    }
    
    return displayMetrics;
  });
  
  // Use raw Z-score normalized scores directly (already in [0,1] range)
  // No need for relative normalization which would make lowest = 0
  const dexResults = scored
    .filter(p => p.type === 'dex')
    .map(p => ({ ...p, score: p.rawScore }))
    .sort((a, b) => b.score - a.score);
  
  const lendingResults = scored
    .filter(p => p.type === 'lending')
    .map(p => ({ ...p, score: p.rawScore }))
    .sort((a, b) => b.score - a.score);
  
  const cdpResults = scored
    .filter(p => p.type === 'cdp')
    .map(p => ({ ...p, score: p.rawScore }))
    .sort((a, b) => b.score - a.score);
  
  return {
    dex: dexResults,
    lending: lendingResults,
    cdp: cdpResults,
    all: [...dexResults, ...lendingResults, ...cdpResults].sort((a, b) => b.score - a.score)
  };
}
