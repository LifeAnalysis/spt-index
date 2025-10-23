import { fetch } from 'undici';
import { calculateCohortSPTScore, calculateSelfSPTScore, calculateMomentumTrend } from './scoring.js';
import { buildHistoricalMetrics } from './data.js';

const PROTOCOL_TYPES = {
  // DEXs - Ethereum
  'uniswap': 'dex',
  'curve-dex': 'dex',
  'sushiswap': 'dex',
  'balancer': 'dex',
  // DEXs - Multi-chain
  'pancakeswap': 'dex',
  // DEXs - Solana
  'raydium': 'dex',
  'orca': 'dex',
  // DEXs - Other L2s/Chains
  'trader-joe': 'dex',
  'quickswap': 'dex',
  'aerodrome': 'dex',
  // Lending - Ethereum
  'aave': 'lending',
  'compound-v3': 'lending',
  'makerdao': 'lending',
  'morpho': 'lending',
  'spark': 'lending',
  // Lending - Other Chains
  'justlend': 'lending',
  'venus': 'lending',
  'radiant': 'lending',
  'benqi': 'lending'
};

const PROTOCOL_METADATA = {
  // DEXs
  'uniswap': {
    description: 'Leading decentralized exchange protocol with automated market making',
    website: 'https://uniswap.org',
    twitter: '@Uniswap'
  },
  'curve-dex': {
    description: 'Stablecoin-focused decentralized exchange with low slippage',
    website: 'https://curve.fi',
    twitter: '@CurveFinance'
  },
  'pancakeswap': {
    description: 'Multi-chain DEX with automated market making and yield farming',
    website: 'https://pancakeswap.finance',
    twitter: '@PancakeSwap'
  },
  'sushiswap': {
    description: 'Community-driven DEX with AMM and multi-chain support',
    website: 'https://sushi.com',
    twitter: '@SushiSwap'
  },
  'balancer': {
    description: 'Automated portfolio manager and trading platform',
    website: 'https://balancer.fi',
    twitter: '@Balancer'
  },
  // Lending
  'aave': {
    description: 'Decentralized lending and borrowing protocol',
    website: 'https://aave.com',
    twitter: '@AaveAave'
  },
  'compound-v3': {
    description: 'Algorithmic money market protocol for lending and borrowing',
    website: 'https://compound.finance',
    twitter: '@compoundfinance'
  },
  'makerdao': {
    description: 'Decentralized credit platform for DAI stablecoin',
    website: 'https://makerdao.com',
    twitter: '@MakerDAO'
  },
  'morpho': {
    description: 'Optimized lending protocol improving rates on top of Aave and Compound',
    website: 'https://morpho.org',
    twitter: '@MorphoLabs'
  },
  'spark': {
    description: 'Decentralized lending protocol by MakerDAO',
    website: 'https://sparkprotocol.io',
    twitter: '@sparkdotfi'
  },
  // New DEXs
  'raydium': {
    description: 'Leading AMM and liquidity provider on Solana',
    website: 'https://raydium.io',
    twitter: '@RaydiumProtocol'
  },
  'orca': {
    description: 'User-friendly DEX on Solana with concentrated liquidity',
    website: 'https://www.orca.so',
    twitter: '@orca_so'
  },
  'trader-joe': {
    description: 'Leading DEX on Avalanche with Liquidity Book innovation',
    website: 'https://traderjoexyz.com',
    twitter: '@traderjoe_xyz'
  },
  'quickswap': {
    description: 'Leading DEX on Polygon with low-fee trading',
    website: 'https://quickswap.exchange',
    twitter: '@QuickswapDEX'
  },
  'aerodrome': {
    description: 'Next-generation AMM on Base designed for deep liquidity',
    website: 'https://aerodrome.finance',
    twitter: '@AerodromeFi'
  },
  // New Lending
  'justlend': {
    description: 'Leading money market protocol on Tron network',
    website: 'https://justlend.org',
    twitter: '@JustLendDAO'
  },
  'venus': {
    description: 'Algorithmic money market and synthetic stablecoin protocol on BNB Chain',
    website: 'https://venus.io',
    twitter: '@VenusProtocol'
  },
  'radiant': {
    description: 'Omnichain money market on Arbitrum',
    website: 'https://radiant.capital',
    twitter: '@RDNTCapital'
  },
  'benqi': {
    description: 'Liquidity market protocol on Avalanche',
    website: 'https://benqi.fi',
    twitter: '@BenqiFinance'
  }
};

/**
 * Calculate historical SPT scores using Z-score normalization
 * This ensures consistency with the main dashboard scoring methodology
 */
function calculateHistoricalScores(tvlData, feesData, volumeData, protocolType, historicalMetrics, days = 90) {
  const now = Math.floor(Date.now() / 1000);
  const cutoff = now - (days * 86400);
  
  // Build daily score history using aggregated data
  const dateMap = new Map();
  
  // Aggregate TVL across ALL chains by date (consistent with buildHistoricalMetrics)
  if (tvlData.chainTvls) {
    for (const chain in tvlData.chainTvls) {
      if (tvlData.chainTvls[chain]?.tvl) {
        tvlData.chainTvls[chain].tvl
          .filter(point => point.date >= cutoff)
          .forEach(point => {
            const dateKey = point.date;
            if (!dateMap.has(dateKey)) {
              dateMap.set(dateKey, { date: dateKey, tvl: 0, fees: 0, volume: 0 });
            }
            dateMap.get(dateKey).tvl += point.totalLiquidityUSD || 0;
          });
      }
    }
  }
  
  // Add fees history
  if (feesData.totalDataChart) {
    feesData.totalDataChart
      .filter(([date]) => date >= cutoff)
      .forEach(([date, value]) => {
        if (!dateMap.has(date)) {
          dateMap.set(date, { date, tvl: 0, fees: 0, volume: 0 });
        }
        dateMap.get(date).fees = value || 0;
      });
  }
  
  // Add volume history
  if (volumeData.totalDataChart) {
    volumeData.totalDataChart
      .filter(([date]) => date >= cutoff)
      .forEach(([date, value]) => {
        if (!dateMap.has(date)) {
          dateMap.set(date, { date, tvl: 0, fees: 0, volume: 0 });
        }
        dateMap.get(date).volume = value || 0;
      });
  }
  
  // Calculate Z-score normalized SPT score for each day
  const history = [];
  const sortedDates = Array.from(dateMap.keys()).sort((a, b) => a - b);
  
  // Forward-fill missing data with previous day's values
  let previousData = null;
  
  for (const date of sortedDates) {
    let data = dateMap.get(date);
    
    // If data is missing or has zeros, use previous day's data
    if ((!data.tvl || !data.fees) && previousData) {
      console.log(`Forward-filling missing data for ${new Date(date * 1000).toISOString().split('T')[0]}`);
      data = {
        ...data,
        tvl: data.tvl || previousData.tvl,
        fees: data.fees || previousData.fees,
        volume: data.volume || previousData.volume
      };
      dateMap.set(date, data);
    }
    
    // Use Z-score normalization with historical context
    const dailyMetrics = {
      fees: data.fees,
      volume: data.volume,
      tvl: data.tvl,
      activity: 0
    };
    
    // Calculate SPT score using self-comparison Z-score (protocol vs its own history)
    // This shows how the protocol is doing relative to its own past performance
    const rawScore = calculateSelfSPTScore(dailyMetrics, historicalMetrics, protocolType);
    
    // Calculate momentum score using a simpler weighted average for comparison
    // This provides a different perspective - absolute performance metric
    const weights = protocolType === 'dex' 
      ? { fees: 0.35, volume: 0.30, tvl: 0.35 }
      : { fees: 0.40, volume: 0.0, tvl: 0.60 };
    
    const normalizedFees = Math.min(dailyMetrics.fees / (historicalMetrics.fees.reduce((a, b) => Math.max(a, b), 1)), 2);
    const normalizedVolume = protocolType === 'dex' 
      ? Math.min(dailyMetrics.volume / (historicalMetrics.volume.reduce((a, b) => Math.max(a, b), 1)), 2)
      : 0;
    const normalizedTvl = Math.min(dailyMetrics.tvl / (historicalMetrics.tvl.reduce((a, b) => Math.max(a, b), 1)), 2);
    
    const momentumScore = (
      weights.fees * normalizedFees +
      weights.volume * normalizedVolume +
      weights.tvl * normalizedTvl
    ) * 0.5; // Scale to 0-1 range similar to Z-scores
    
    history.push({
      date,
      rawScore, // Store raw score before relative normalization
      score: 0, // Will be normalized later
      momentumScore, // Track momentum separately
      tvl: data.tvl,
      fees: data.fees,
      volume: data.volume
    });
    
    // Store for next iteration's forward-filling
    previousData = data;
  }
  
  return history;
}

/**
 * Get detailed protocol data with historical SPT scores
 * Uses Z-score normalization consistently across all calculations
 */
export async function getProtocolDetail(protocolSlug) {
  try {
    const [tvlData, feesData, volumeData] = await Promise.all([
      fetch(`https://api.llama.fi/protocol/${protocolSlug}`).then(r => r.json()),
      fetch(`https://api.llama.fi/summary/fees/${protocolSlug}`).then(r => r.json()).catch(() => ({ 
        total24h: 0, 
        total7d: 0, 
        total30d: 0,
        totalDataChart: [] 
      })),
      fetch(`https://api.llama.fi/summary/dexs/${protocolSlug}`).then(r => r.json()).catch(() => ({ 
        total24h: 0, 
        total7d: 0, 
        total30d: 0,
        totalDataChart: [] 
      }))
    ]);
    
    // Calculate current TVL
    const currentTvl = tvlData.currentChainTvls 
      ? Object.values(tvlData.currentChainTvls).reduce((sum, val) => sum + (val || 0), 0)
      : 0;
    
    // Determine protocol type
    let protocolType = PROTOCOL_TYPES[protocolSlug];
    if (!protocolType) {
      const category = tvlData.category?.toLowerCase() || '';
      protocolType = (category.includes('dex') || category.includes('exchange')) ? 'dex' : 'lending';
    }
    
    // Build historical metrics for Z-score normalization (90-day window)
    const historicalMetrics = buildHistoricalMetrics(tvlData, feesData, volumeData);
    
    // Get current metrics
    const currentMetrics = {
      fees: feesData.total24h || 0,
      volume: volumeData.total24h || 0,
      tvl: currentTvl,
      activity: 0
    };
    
    // Calculate current SPT score using cohort-based Z-score normalization
    // Note: For protocol detail pages, we use self-comparison since we don't have cohort data here
    // The main landing page uses cohort comparison
    const currentRawScore = calculateSelfSPTScore(currentMetrics, historicalMetrics, protocolType);
    
    // Calculate momentum score (self-comparison)
    const momentumScore = calculateSelfSPTScore(currentMetrics, historicalMetrics, protocolType);
    const momentum = calculateMomentumTrend(momentumScore);
    
    // Calculate historical scores using Z-score normalization
    const history = calculateHistoricalScores(tvlData, feesData, volumeData, protocolType, historicalMetrics, 90);
    
    // Use raw Z-score normalized scores directly (no relative normalization)
    const finalHistory = history.map(h => ({
      ...h,
      score: h.rawScore
    }));
    
    // Calculate score changes using raw scores
    const score24hAgo = finalHistory.length >= 1 ? finalHistory[finalHistory.length - 2]?.score : currentRawScore;
    const score7dAgo = finalHistory.length >= 7 ? finalHistory[finalHistory.length - 7]?.score : currentRawScore;
    const score30dAgo = finalHistory.length >= 30 ? finalHistory[finalHistory.length - 30]?.score : currentRawScore;
    
    const change24h = score24hAgo ? ((currentRawScore - score24hAgo) / score24hAgo) * 100 : null;
    const change7d = score7dAgo ? ((currentRawScore - score7dAgo) / score7dAgo) * 100 : null;
    const change30d = score30dAgo ? ((currentRawScore - score30dAgo) / score30dAgo) * 100 : null;
    
    // Get metadata
    const metadata = PROTOCOL_METADATA[protocolSlug] || {};
    
    return {
      slug: protocolSlug,
      name: tvlData.name,
      type: protocolType,
      category: tvlData.category,
      description: metadata.description || tvlData.description || '',
      website: metadata.website || tvlData.url || '',
      twitter: metadata.twitter || (tvlData.twitter ? `@${tvlData.twitter}` : ''),
      logo: tvlData.logo || '',
      current: {
        protocol: tvlData.name, // Add protocol name
        tvl: currentTvl,
        fees: currentMetrics.fees,
        volume: currentMetrics.volume,
        rawScore: currentRawScore,
        score: currentRawScore,
        momentumScore,
        momentum,
        change24h,
        change7d,
        change30d
      },
      historicalMetrics: {
        fees: historicalMetrics.fees,
        volume: historicalMetrics.volume,
        tvl: historicalMetrics.tvl,
        activity: historicalMetrics.activity
      },
      history: finalHistory.map(h => ({
        date: new Date(h.date * 1000).toISOString().split('T')[0], // Format: YYYY-MM-DD
        timestamp: h.date,
        score: h.score,
        rawScore: h.rawScore,
        momentumScore: h.momentumScore,
        tvl: h.tvl,
        fees: h.fees,
        volume: h.volume
      })),
      historicalDataPoints: historicalMetrics.tvl.length
    };
  } catch (error) {
    console.error(`Error fetching protocol detail for ${protocolSlug}:`, error.message);
    throw error;
  }
}
