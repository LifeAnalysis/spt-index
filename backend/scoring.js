// SPT Scoring Engine with Z-Score Normalization and Adaptive Weighting

/**
 * Calculate mean of an array
 */
function mean(values) {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

/**
 * Calculate standard deviation of an array
 */
function standardDeviation(values) {
  if (values.length === 0) return 1;
  const avg = mean(values);
  const squareDiffs = values.map(value => Math.pow(value - avg, 2));
  const avgSquareDiff = mean(squareDiffs);
  return Math.sqrt(avgSquareDiff);
}

/**
 * Calculate Z-score for a value given historical data
 * Z-score = (value - mean) / stdDev
 */
function calculateZScore(value, historicalValues) {
  if (historicalValues.length === 0) return 0;
  const avg = mean(historicalValues);
  const stdDev = standardDeviation(historicalValues);
  if (stdDev === 0) return 0;
  return (value - avg) / stdDev;
}

/**
 * Sigmoid function to map Z-scores to [0, 1] range
 * Dampens outliers and creates smooth transitions
 * sigmoid(z) = 1 / (1 + e^(-z))
 */
function sigmoid(zScore) {
  return 1 / (1 + Math.exp(-zScore));
}

/**
 * Normalize a metric using Z-score + sigmoid transformation
 * Returns value in [0, 1] range
 */
function normalizeMetric(currentValue, historicalValues) {
  const zScore = calculateZScore(currentValue, historicalValues);
  return sigmoid(zScore);
}

/**
 * Calculate correlation coefficient between two arrays
 * Used for adaptive weighting
 */
function correlation(x, y) {
  if (x.length !== y.length || x.length === 0) return 0;
  
  const n = x.length;
  const meanX = mean(x);
  const meanY = mean(y);
  const stdX = standardDeviation(x);
  const stdY = standardDeviation(y);
  
  if (stdX === 0 || stdY === 0) return 0;
  
  let sum = 0;
  for (let i = 0; i < n; i++) {
    sum += ((x[i] - meanX) / stdX) * ((y[i] - meanY) / stdY);
  }
  
  return sum / n;
}

/**
 * Default weights for different protocol types
 * Updated based on fundamental analysis of what drives protocol success
 * 
 * DEX Principles:
 * - Volume matters more than TVL (actual activity > idle capital)
 * - Capital efficiency (Volume/TVL) is key metric
 * - Fee revenue shows sustainability
 * 
 * Lending Principles:
 * - Borrow volume is the revenue driver (not TVL)
 * - Vanilla assets (USDC, ETH, wBTC) are the bottleneck
 * - Utilization rate shows capital efficiency
 * - Fee revenue shows sustainability
 */
const DEFAULT_WEIGHTS = {
  dex: {
    volume: 0.40,           // 40% - Trading volume (actual activity)
    capitalEfficiency: 0.30, // 30% - Volume/TVL ratio (capital efficiency)
    fees: 0.20,             // 20% - Fee revenue (sustainability)
    feeGrowth: 0.10         // 10% - Fee growth momentum (24h change)
  },
  lending: {
    borrowVolume: 0.40,     // 40% - Borrow volume (revenue driver)
    vanillaSupply: 0.25,    // 25% - Vanilla asset supply (growth bottleneck)
    utilization: 0.20,      // 20% - Utilization rate (capital efficiency)
    fees: 0.15              // 15% - Fee revenue (sustainability)
  }
};

/**
 * Weight constraints for adaptive weighting
 */
const WEIGHT_LIMITS = {
  min: 0.10,  // Minimum 10%
  max: 0.40   // Maximum 40%
};

/**
 * Adjust weights based on correlation with performance
 * Simulates adaptive weighting based on which metrics correlate with growth
 */
function adaptiveWeights(baseWeights, metricCorrelations) {
  const weights = { ...baseWeights };
  
  // Calculate total correlation strength
  const totalCorr = Object.values(metricCorrelations).reduce((sum, corr) => sum + Math.abs(corr), 0);
  
  if (totalCorr === 0) return weights;
  
  // Adjust weights based on correlations (higher correlation = higher weight)
  const adjusted = {};
  let totalWeight = 0;
  
  for (const [metric, baseWeight] of Object.entries(weights)) {
    const corr = metricCorrelations[metric] || 0;
    // Boost or reduce weight based on correlation strength
    const adjustment = (Math.abs(corr) / totalCorr) * 0.2; // Max 20% adjustment
    let newWeight = baseWeight + (corr > 0 ? adjustment : -adjustment);
    
    // Apply limits
    newWeight = Math.max(WEIGHT_LIMITS.min, Math.min(WEIGHT_LIMITS.max, newWeight));
    adjusted[metric] = newWeight;
    totalWeight += newWeight;
  }
  
  // Normalize to sum to 1.0
  for (const metric in adjusted) {
    adjusted[metric] /= totalWeight;
  }
  
  return adjusted;
}

/**
 * Calculate SPT score using CROSS-PROTOCOL Z-score normalization
 * Compares protocol metrics against the entire cohort (all DEXes or all Lending protocols)
 * This is the PRIMARY score for trading and perpetuals
 * 
 * @param {Object} currentMetrics - Current values { fees, volume, tvl, feeGrowth }
 * @param {Object} cohortHistoricalMetrics - Cohort-wide historical arrays { fees: [], volume: [], tvl: [], feeGrowth: [] }
 * @param {string} protocolType - 'dex' or 'lending'
 * @param {Object} correlations - Optional correlations for adaptive weighting
 * @returns {number} SPT score in [0, 1] range
 */
export function calculateCohortSPTScore(currentMetrics, cohortHistoricalMetrics, protocolType, correlations = null) {
  // Get base weights for protocol type
  let weights = DEFAULT_WEIGHTS[protocolType] || DEFAULT_WEIGHTS.dex;
  
  // Apply adaptive weighting if correlations provided
  if (correlations) {
    weights = adaptiveWeights(weights, correlations);
  }
  
  // Normalize each metric using Z-score + sigmoid (vs COHORT)
  const normalizedMetrics = {};
  
  for (const metric in currentMetrics) {
    if (cohortHistoricalMetrics[metric] && cohortHistoricalMetrics[metric].length > 0) {
      normalizedMetrics[metric] = normalizeMetric(
        currentMetrics[metric],
        cohortHistoricalMetrics[metric]
      );
    } else {
      // Fallback: simple sigmoid of raw value if no history
      normalizedMetrics[metric] = sigmoid(currentMetrics[metric] / 1e9); // Scale large numbers
    }
  }
  
  // Calculate weighted score
  let score = 0;
  for (const metric in weights) {
    if (normalizedMetrics[metric] !== undefined) {
      score += weights[metric] * normalizedMetrics[metric];
    }
  }
  
  return score;
}

/**
 * Calculate Momentum score using SELF-COMPARISON Z-score normalization
 * Compares protocol metrics against its OWN 90-day historical baseline
 * This is the SECONDARY score for trend analysis
 * 
 * @param {Object} currentMetrics - Current values { fees, volume, tvl, feeGrowth }
 * @param {Object} selfHistoricalMetrics - Protocol's own historical arrays { fees: [], volume: [], tvl: [], feeGrowth: [] }
 * @param {string} protocolType - 'dex' or 'lending'
 * @param {Object} correlations - Optional correlations for adaptive weighting
 * @returns {number} Momentum score in [0, 1] range
 */
export function calculateSelfSPTScore(currentMetrics, selfHistoricalMetrics, protocolType, correlations = null) {
  // Get base weights for protocol type
  let weights = DEFAULT_WEIGHTS[protocolType] || DEFAULT_WEIGHTS.dex;
  
  // Apply adaptive weighting if correlations provided
  if (correlations) {
    weights = adaptiveWeights(weights, correlations);
  }
  
  // Normalize each metric using Z-score + sigmoid (vs SELF)
  const normalizedMetrics = {};
  
  for (const metric in currentMetrics) {
    if (selfHistoricalMetrics[metric] && selfHistoricalMetrics[metric].length > 0) {
      normalizedMetrics[metric] = normalizeMetric(
        currentMetrics[metric],
        selfHistoricalMetrics[metric]
      );
    } else {
      // Fallback: simple sigmoid of raw value if no history
      normalizedMetrics[metric] = sigmoid(currentMetrics[metric] / 1e9); // Scale large numbers
    }
  }
  
  // Calculate weighted score
  let score = 0;
  for (const metric in weights) {
    if (normalizedMetrics[metric] !== undefined) {
      score += weights[metric] * normalizedMetrics[metric];
    }
  }
  
  return score;
}

/**
 * Legacy function - kept for backward compatibility
 * Defaults to cross-protocol scoring
 */
export function calculateSPTScore(currentMetrics, historicalMetrics, protocolType, correlations = null) {
  return calculateCohortSPTScore(currentMetrics, historicalMetrics, protocolType, correlations);
}

/**
 * Calculate momentum trend from momentum score
 * @param {number} momentumScore - Momentum score [0,1]
 * @returns {string} - 'growing', 'stable', or 'declining'
 */
export function calculateMomentumTrend(momentumScore) {
  if (momentumScore > 0.55) return 'growing';
  if (momentumScore < 0.45) return 'declining';
  return 'stable';
}

/**
 * DEPRECATED: Simple capital efficiency calculation
 * DO NOT USE - This function uses the old methodology (Fees/TVL or (Fees+Volume)/TVL)
 * All scoring should use calculateSPTScore with Z-score normalization
 */
export function calculateSimpleSPTScore(fees, volume, tvl, protocolType) {
  console.warn('⚠️  DEPRECATED: calculateSimpleSPTScore should not be used. Use calculateSPTScore with Z-score normalization instead.');
  if (protocolType === 'dex') {
    // DEX: (Fees + Volume) / TVL
    return (fees + volume) / (tvl || 1);
  } else {
    // Lending: Fees / TVL
    return fees / (tvl || 1);
  }
}

/**
 * Normalize scores to relative [0, 1] scale across all protocols
 * This makes scores comparable (like a rating scale)
 */
export function normalizeScores(protocols) {
  if (protocols.length === 0) return protocols;
  
  const scores = protocols.map(p => p.rawScore || p.score);
  const minScore = Math.min(...scores);
  const maxScore = Math.max(...scores);
  const range = maxScore - minScore;
  
  if (range === 0) {
    return protocols.map(p => ({ ...p, score: 0.5 }));
  }
  
  return protocols.map(p => ({
    ...p,
    rawScore: p.rawScore || p.score,
    score: (p.rawScore - minScore) / range
  }));
}

export default {
  calculateSPTScore,
  calculateCohortSPTScore,
  calculateSelfSPTScore,
  calculateMomentumTrend,
  calculateSimpleSPTScore,
  normalizeScores,
  sigmoid,
  calculateZScore
};

