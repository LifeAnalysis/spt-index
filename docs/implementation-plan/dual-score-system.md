# Dual-Score System Implementation

## Branch Name
`feature/dual-score-cross-protocol-momentum`

## Background and Motivation

The current SPT scoring system uses self-comparison Z-scores, where each protocol is compared only to its own 90-day historical baseline. This creates counterintuitive rankings where protocols with strong fundamentals (like Uniswap with $50M daily fees) can rank below smaller protocols simply because they've had recent declines relative to their own history.

For the endgame vision of tradable perpetuals (SPT_PERP), we need:
1. **Stable, intuitive rankings** based on objective operational strength (for perpetual markets)
2. **Momentum signals** showing improvement/decline vs own baseline (for trend analysis)

## Solution: Dual-Score System

Implement two complementary scoring methodologies:

### 1. SPT Score (Cross-Protocol)
- **Purpose:** Main tradable metric for perpetual markets
- **Method:** Z-score normalization against entire protocol cohort (all DEXes or all Lending)
- **Example:** Uniswap's fees compared to average DEX fees
- **Result:** Stable rankings reflecting operational dominance

### 2. Momentum Score (Self-Comparison)
- **Purpose:** Trend analysis and governance signals
- **Method:** Current self-comparison Z-score methodology
- **Example:** Uniswap today vs Uniswap's 90-day average
- **Result:** Shows if protocol is improving or declining

## High-level Task Breakdown

### Phase 1: Backend - Cross-Protocol Scoring Engine
- [x] Task 1.1: Create feature branch
- [x] Task 1.2: Add cohort-wide Z-score calculation to `scoring.js`
- [x] Task 1.3: Update `data.js` to calculate both scores
- [ ] Task 1.4: Update `protocolDetail.js` for dual metrics
- [ ] Task 1.5: Test backend with sample data

### Phase 2: Frontend - Landing Page Updates
- [x] Task 2.1: Update Protocol interface to include momentum
- [x] Task 2.2: Add Trend column to main table
- [x] Task 2.3: Update tooltips and labels
- [x] Task 2.4: Adjust rating thresholds for new score range
- [x] Task 2.5: Test landing page display

### Phase 3: Frontend - Protocol Detail Pages
- [x] Task 3.1: Design dual-view performance section
- [x] Task 3.2: Implement Operational Strength breakdown (via existing chart)
- [x] Task 3.3: Implement Performance Momentum breakdown
- [x] Task 3.4: Add metric comparisons with historical averages
- [x] Task 3.5: Test protocol pages

### Phase 4: Integration & Testing
- [ ] Task 4.1: End-to-end testing with all protocols
- [ ] Task 4.2: Verify CSV exports include both scores
- [ ] Task 4.3: Update documentation
- [ ] Task 4.4: Create PR and review

## Project Status Board

### In Progress
- [ ] Task 1.1: Create feature branch off main

### Pending
- All other tasks

### Completed
- Initial planning and design

## Technical Specifications

### Backend Changes

**scoring.js:**
```javascript
// New function: calculateCohortSPTScore
export function calculateCohortSPTScore(currentMetrics, cohortHistoricalMetrics, protocolType, correlations = null)

// Keep existing: calculateSPTScore (rename to calculateSelfSPTScore for clarity)
```

**data.js:**
```javascript
// Build cohort-wide historical arrays
const cohortMetrics = {
  fees: allProtocols.flatMap(p => p.history.fees),
  tvl: allProtocols.flatMap(p => p.history.tvl),
  volume: allProtocols.flatMap(p => p.history.volume),
  activity: allProtocols.flatMap(p => p.history.activity)
};

// Calculate both scores
protocol.sptScore = calculateCohortSPTScore(current, cohortMetrics, type);
protocol.momentumScore = calculateSelfSPTScore(current, ownMetrics, type);
protocol.momentum = calculateMomentumTrend(protocol.momentumScore);
```

**API Response:**
```json
{
  "protocol": "Uniswap",
  "score": 0.7200,
  "rawScore": 0.8300,
  "momentumScore": 0.3500,
  "momentum": "declining",
  "momentumChange": -12.3,
  "change24h": -1.2,
  "change7d": -3.2,
  "change30d": -8.1
}
```

### Frontend Changes

**Landing Page Table:**
```
Protocol | Rating | SPT Score | Trend | Δ 24h | Δ 7d | Δ 30d
---------|--------|-----------|-------|-------|------|-------
Uniswap  | AAA    | 0.7200    | 📉    | ↓ 1%  | ↓ 3% | ↓ 8%
```

**Protocol Detail Page:**
- Main card shows both SPT Score and Momentum
- Expandable section shows detailed Z-score breakdowns
- Two tables: "Operational Strength" (cohort) and "Performance Momentum" (self)

## Key Challenges and Analysis

### Challenge 1: Cohort Data Construction
Building cohort-wide historical arrays requires aggregating 90 days × N protocols worth of data. Need to ensure:
- Proper time alignment
- Handling missing data points
- Efficient memory usage

**Solution:** Build cohort arrays once per refresh, cache in memory alongside individual protocol data.

### Challenge 2: Score Range Adjustment
Cross-protocol scores will have different ranges than self-comparison scores.

**Current (self):** ~0.20 to 0.60
**Expected (cohort):** ~0.30 to 0.80 (wider spread due to larger variance)

**Solution:** Update rating thresholds on frontend accordingly.

### Challenge 3: Historical Score Compatibility
Existing CSV files use self-comparison methodology. Need to decide:
- Recalculate all historical data? (time-intensive)
- Keep historical as-is, only change current scores? (inconsistent)
- Hybrid approach?

**Solution:** Recalculate historical data using cohort methodology for consistency. Run one-time backfill on implementation.

## Executor's Feedback or Assistance Requests

*Will be updated as implementation progresses*

## Lessons Learned

### [2025-10-23] Dual-score approach chosen over pure cross-protocol
**Rationale:** User values both perspectives - operational strength for trading, momentum for trends. Implementing both provides maximum utility without losing existing insights.

**Implementation Note:** Keep both scores separate rather than blending (60/40 hybrid rejected) for clarity and flexibility.

