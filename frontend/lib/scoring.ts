// SPT Scoring Engine with Z-Score Normalization and Adaptive Weighting

/**
 * Calculate mean of an array
 */
function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

/**
 * Calculate standard deviation of an array
 */
function standardDeviation(values: number[]): number {
  if (values.length === 0) return 1;
  const avg = mean(values);
  const squareDiffs = values.map(value => Math.pow(value - avg, 2));
  const avgSquareDiff = mean(squareDiffs);
  return Math.sqrt(avgSquareDiff);
}

/**
 * Calculate Z-score for a value given historical data
 */
function calculateZScore(value: number, historicalValues: number[]): number {
  if (historicalValues.length === 0) return 0;
  const avg = mean(historicalValues);
  const stdDev = standardDeviation(historicalValues);
  if (stdDev === 0) return 0;
  return (value - avg) / stdDev;
}

/**
 * Sigmoid function to map Z-scores to [0, 1] range
 */
function sigmoid(zScore: number): number {
  return 1 / (1 + Math.exp(-zScore));
}

/**
 * Normalize a metric using Z-score + sigmoid transformation
 */
function normalizeMetric(currentValue: number, historicalValues: number[]): number {
  const zScore = calculateZScore(currentValue, historicalValues);
  return sigmoid(zScore);
}

/**
 * Default weights for different protocol types
 */
const DEFAULT_WEIGHTS = {
  dex: {
    fees: 0.35,
    volume: 0.30,
    tvl: 0.25,
    activity: 0.10
  },
  lending: {
    fees: 0.40,
    tvl: 0.35,
    volume: 0.15,
    activity: 0.10
  }
};

type ProtocolType = 'dex' | 'lending';
type Metrics = { fees: number; volume: number; tvl: number; activity: number };
type HistoricalMetrics = { fees: number[]; volume: number[]; tvl: number[]; activity: number[] };

/**
 * Calculate SPT score using CROSS-PROTOCOL Z-score normalization
 */
export function calculateCohortSPTScore(
  currentMetrics: Metrics,
  cohortHistoricalMetrics: HistoricalMetrics,
  protocolType: ProtocolType
): number {
  const weights = DEFAULT_WEIGHTS[protocolType] || DEFAULT_WEIGHTS.dex;
  
  const normalizedMetrics: Record<string, number> = {};
  
  for (const metric in currentMetrics) {
    const key = metric as keyof Metrics;
    if (cohortHistoricalMetrics[key] && cohortHistoricalMetrics[key].length > 0) {
      normalizedMetrics[metric] = normalizeMetric(
        currentMetrics[key],
        cohortHistoricalMetrics[key]
      );
    } else {
      normalizedMetrics[metric] = sigmoid(currentMetrics[key] / 1e9);
    }
  }
  
  let score = 0;
  for (const metric in weights) {
    const key = metric as keyof typeof weights.dex;
    if (normalizedMetrics[metric] !== undefined) {
      score += weights[key] * normalizedMetrics[metric];
    }
  }
  
  return score;
}

/**
 * Calculate Momentum score using SELF-COMPARISON Z-score normalization
 */
export function calculateSelfSPTScore(
  currentMetrics: Metrics,
  selfHistoricalMetrics: HistoricalMetrics,
  protocolType: ProtocolType
): number {
  const weights = DEFAULT_WEIGHTS[protocolType] || DEFAULT_WEIGHTS.dex;
  
  const normalizedMetrics: Record<string, number> = {};
  
  for (const metric in currentMetrics) {
    const key = metric as keyof Metrics;
    if (selfHistoricalMetrics[key] && selfHistoricalMetrics[key].length > 0) {
      normalizedMetrics[metric] = normalizeMetric(
        currentMetrics[key],
        selfHistoricalMetrics[key]
      );
    } else {
      normalizedMetrics[metric] = sigmoid(currentMetrics[key] / 1e9);
    }
  }
  
  let score = 0;
  for (const metric in weights) {
    const key = metric as keyof typeof weights.dex;
    if (normalizedMetrics[metric] !== undefined) {
      score += weights[key] * normalizedMetrics[metric];
    }
  }
  
  return score;
}

/**
 * Calculate momentum trend from momentum score
 */
export function calculateMomentumTrend(momentumScore: number): string {
  if (momentumScore > 0.55) return 'growing';
  if (momentumScore < 0.45) return 'declining';
  return 'stable';
}

