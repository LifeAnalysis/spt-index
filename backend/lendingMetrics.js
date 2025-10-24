// Lending Protocol Metrics Module
// Fetches borrow volume, utilization rates, and vanilla asset supply from DeFiLlama

import { fetch } from 'undici';

// Vanilla assets that are the growth bottleneck for lending protocols
const VANILLA_ASSETS = ['USDC', 'USDT', 'DAI', 'WETH', 'ETH', 'WBTC', 'wBTC'];

// Protocol name mappings for DeFiLlama borrow API
const LENDING_PROJECT_NAMES = {
  'aave': 'aave-v3',
  'aave-v3': 'aave-v3',
  'compound-v3': 'compound-v3',
  'morpho': 'morpho',
  'spark': 'spark',
  'makerdao': 'maker',
  'justlend': 'justlend',
  'venus': 'venus',
  'radiant': 'radiant-capital',
  'benqi': 'benqi'
};

/**
 * Fetch lending pool data from DeFiLlama's borrow rates API
 * Returns pools with borrow/supply data
 */
async function fetchBorrowPoolsData() {
  try {
    const response = await fetch('https://yields.llama.fi/pools', {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }
    
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching borrow pools data:', error.message);
    return [];
  }
}

/**
 * Calculate lending metrics for a protocol
 * Returns: borrow volume, vanilla asset supply, utilization rate, capital efficiency
 */
export async function getLendingMetrics(protocolSlug) {
  try {
    const projectName = LENDING_PROJECT_NAMES[protocolSlug] || protocolSlug;
    
    // Fetch all pools data
    const allPools = await fetchBorrowPoolsData();
    
    // Filter pools for this protocol
    const protocolPools = allPools.filter(pool => 
      pool.project?.toLowerCase() === projectName.toLowerCase()
    );
    
    if (protocolPools.length === 0) {
      console.log(`No lending pools found for ${protocolSlug} (${projectName})`);
      return null;
    }
    
    console.log(`Found ${protocolPools.length} pools for ${protocolSlug}`);
    
    // Aggregate metrics across all pools
    let totalSupplyUsd = 0;
    let totalBorrowUsd = 0;
    let vanillaSupplyUsd = 0;
    let vanillaBorrowUsd = 0;
    
    const poolDetails = [];
    
    for (const pool of protocolPools) {
      const supplyUsd = pool.totalSupplyUsd || 0;
      const borrowUsd = pool.totalBorrowUsd || 0;
      const symbol = pool.symbol || '';
      
      totalSupplyUsd += supplyUsd;
      totalBorrowUsd += borrowUsd;
      
      // Check if this is a vanilla asset
      const isVanilla = VANILLA_ASSETS.some(vanillaSymbol => 
        symbol.toUpperCase().includes(vanillaSymbol.toUpperCase())
      );
      
      if (isVanilla) {
        vanillaSupplyUsd += supplyUsd;
        vanillaBorrowUsd += borrowUsd;
      }
      
      poolDetails.push({
        symbol,
        chain: pool.chain,
        supplyUsd,
        borrowUsd,
        utilization: supplyUsd > 0 ? (borrowUsd / supplyUsd) * 100 : 0,
        isVanilla,
        apyBaseBorrow: pool.apyBaseBorrow || 0,
        ltv: pool.ltv || 0
      });
    }
    
    // Calculate overall metrics
    const utilizationRate = totalSupplyUsd > 0 ? (totalBorrowUsd / totalSupplyUsd) * 100 : 0;
    const vanillaUtilization = vanillaSupplyUsd > 0 ? (vanillaBorrowUsd / vanillaSupplyUsd) * 100 : 0;
    const vanillaSupplyRatio = totalSupplyUsd > 0 ? (vanillaSupplyUsd / totalSupplyUsd) * 100 : 0;
    
    console.log(`${protocolSlug} Lending Metrics:
  - Total Borrow: $${totalBorrowUsd.toLocaleString()}
  - Total Supply: $${totalSupplyUsd.toLocaleString()}
  - Utilization: ${utilizationRate.toFixed(2)}%
  - Vanilla Supply: $${vanillaSupplyUsd.toLocaleString()} (${vanillaSupplyRatio.toFixed(1)}% of total)
  - Vanilla Utilization: ${vanillaUtilization.toFixed(2)}%`);
    
    return {
      totalBorrowUsd,
      totalSupplyUsd,
      utilizationRate,
      vanillaSupplyUsd,
      vanillaBorrowUsd,
      vanillaUtilization,
      vanillaSupplyRatio,
      capitalEfficiency: totalSupplyUsd > 0 ? totalBorrowUsd / totalSupplyUsd : 0,
      poolCount: protocolPools.length,
      pools: poolDetails
    };
  } catch (error) {
    console.error(`Error getting lending metrics for ${protocolSlug}:`, error.message);
    return null;
  }
}

/**
 * Fetch DEX-specific metrics including active users
 * This provides additional context beyond volume/fees
 */
export async function getDEXMetrics(protocolSlug) {
  try {
    // Try to get active users data
    const response = await fetch('https://api.llama.fi/overview/dexs', {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    const protocolData = data.protocols?.find(p => 
      p.name?.toLowerCase() === protocolSlug.toLowerCase() ||
      p.module?.toLowerCase() === protocolSlug.toLowerCase()
    );
    
    if (!protocolData) {
      return null;
    }
    
    return {
      totalVolume24h: protocolData.total24h || 0,
      change1d: protocolData.change_1d || 0,
      change7d: protocolData.change_7d || 0,
      dominance: protocolData.dominance || 0
    };
  } catch (error) {
    console.error(`Error getting DEX metrics for ${protocolSlug}:`, error.message);
    return null;
  }
}

export default {
  getLendingMetrics,
  getDEXMetrics,
  VANILLA_ASSETS
};

