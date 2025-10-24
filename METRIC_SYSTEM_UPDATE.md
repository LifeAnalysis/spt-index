# SPT Metric System Update - Fundamental-Based Scoring

## Summary

Updated the SPT scoring system to use fundamental metrics that actually drive protocol success, moving away from TVL-centric measurements to activity-based and efficiency-focused metrics.

## Key Changes

### 1. New Scoring Weights

**DEX Protocols:**
- 40% Trading Volume (actual activity, not idle capital)
- 30% Capital Efficiency (Volume/TVL ratio)
- 20% Fee Revenue (sustainability)
- 10% Fee Growth (momentum)

**Lending Protocols:**
- 40% Borrow Volume (revenue driver, not TVL)
- 25% Vanilla Asset Supply (USDC, ETH, wBTC - growth bottleneck)
- 20% Utilization Rate (capital efficiency)
- 15% Fee Revenue (sustainability)

### 2. Backend Changes

#### New File: `backend/lendingMetrics.js`
- Fetches lending-specific data from DeFiLlama's `/pools` endpoint
- Calculates borrow volume, vanilla asset supply, and utilization rates
- Identifies vanilla assets: USDC, USDT, DAI, WETH, ETH, WBTC

#### Updated: `backend/scoring.js`
- Updated `DEFAULT_WEIGHTS` to reflect new metric priorities
- DEX weights now prioritize volume and capital efficiency
- Lending weights now prioritize borrow volume and vanilla assets

#### Updated: `backend/data.js`
- Integrated `getLendingMetrics()` for lending protocols
- Calculates capital efficiency (Volume/TVL) for DEXs
- Updated `currentMetrics` object to include protocol-specific metrics
- Adds `lendingMetrics` and `dexMetrics` to protocol data

#### Updated: `backend/protocolDetail.js`
- Integrated lending metrics for protocol detail pages
- Calculates and exposes capital efficiency for DEXs
- Includes full pool-level data for lending protocols

### 3. Frontend Changes

#### Updated: `frontend/app/page.tsx`
- Added `LendingMetrics` and `DEXMetrics` interfaces
- Extended `Protocol` interface to include new metrics

#### Updated: `frontend/app/protocol/[slug]/page.tsx`
- Added new "Lending Metrics" section showing:
  - Borrow Volume
  - Vanilla Asset Supply
  - Overall Utilization Rate
  - Vanilla Asset Utilization
  - Total Supply Volume
  - Contextual insights based on metrics
- Added new "DEX Metrics" section showing:
  - 24h Trading Volume
  - Capital Efficiency (Volume/TVL)
  - Total TVL
  - 24h Fees
  - Contextual insights based on metrics

## Principles Applied

Based on industry analysis, the following principles now guide our scoring:

### For All Protocols
1. **Efficiency > Size** - Measure how well protocols use capital, not just how much they have
2. **Activity > Idle Capital** - Reward protocols that facilitate transactions
3. **Revenue Drivers** - Focus on metrics that correlate with protocol revenue

### For Lending
1. TVL obscures more than it reveals
2. Borrow volume is the actual revenue driver
3. Vanilla assets (USDC, ETH, wBTC) are the growth bottleneck
4. Utilization rate shows capital efficiency
5. Long-tail assets add risk without proportional benefit

### For DEXs
1. Trading volume matters more than TVL
2. Capital efficiency (Volume/TVL) shows optimal liquidity use
3. Fee revenue indicates sustainability
4. Active trading shows protocol health

## API Integration

### DeFiLlama Endpoints Used
- `/pools` - For lending borrow/supply data
- `/protocol/{slug}` - For TVL data (existing)
- `/summary/fees/{slug}` - For fee revenue (existing)
- `/summary/dexs/{slug}` - For DEX volume (existing)

## Testing

To test the new metrics:

1. **Backend:**
   ```bash
   cd backend
   npm start
   ```

2. **Check lending protocol metrics:**
   ```bash
   curl http://localhost:3001/api/protocol/aave
   ```
   Look for `lendingMetrics` object with:
   - `borrowVolume`
   - `supplyVolume`
   - `utilization`
   - `vanillaSupply`
   - `vanillaUtilization`

3. **Check DEX metrics:**
   ```bash
   curl http://localhost:3001/api/protocol/uniswap
   ```
   Look for `dexMetrics` object with:
   - `capitalEfficiency`
   - `volumeToTVL`

4. **Frontend:**
   Navigate to any protocol detail page to see the new metrics sections

## Migration Notes

- **Backward Compatible:** Legacy TVL and volume metrics are still available
- **Graceful Fallback:** If lending metrics unavailable, falls back to zero values
- **No Breaking Changes:** Existing API responses still include all previous fields

## Next Steps

1. Monitor protocol rankings to see how they change with new metrics
2. Collect user feedback on new metric displays
3. Consider adding historical charts for new metrics
4. Potentially add alerts when vanilla asset supply is low
5. Add documentation explaining the new metrics to end users

## Files Modified

- `backend/lendingMetrics.js` (NEW)
- `backend/scoring.js`
- `backend/data.js`
- `backend/protocolDetail.js`
- `frontend/app/page.tsx`
- `frontend/app/protocol/[slug]/page.tsx`

## Date

2025-01-24

