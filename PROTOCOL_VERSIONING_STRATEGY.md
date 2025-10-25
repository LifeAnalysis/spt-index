# Protocol Versioning Strategy

## 🔍 Current Issues

### Issue 1: Uniswap Misconfiguration
**Problem:** We're tracking `uniswap` (doesn't exist) and `uniswap-v4`

**Reality:**
- `uniswap` → ❌ Not a valid DefiLlama slug
- `uniswap-v2` → ✅ $1.73B TVL (older version)
- `uniswap-v3` → ✅ $2.78B TVL (dominant version)
- `uniswap-v4` → ✅ $1.43B TVL (latest version)

### Issue 2: Missing Change Data
**Affected Protocols:**
- Maple → No 24h/7d/30d changes showing
- Fluid Lending → No changes showing
- Compound V3 → No changes showing

---

## 🎯 Versioning Philosophy

### Question: Should We Track Multiple Versions?

**Option A: Track All Versions Separately** ✅ RECOMMENDED
- ✅ They are literally different smart contracts
- ✅ Liquidity is NOT shared (Uniswap V3 ≠ V4 pools)
- ✅ Different capital efficiency (V4 has better features)
- ✅ Shows migration patterns and adoption
- ✅ Lets users compare performance between versions
- ❌ May confuse users (looks like duplicate)

**Option B: Track Only Latest Version**
- ✅ Simpler, no confusion
- ✅ Focuses on current state
- ❌ Ignores that V3 still has 2x more liquidity
- ❌ Misses performance comparison opportunity

**Option C: Aggregate All Versions**
- ✅ One "Uniswap" entry
- ❌ DefiLlama doesn't provide aggregated data
- ❌ Would need custom aggregation logic
- ❌ Loses per-version insights

---

## ✅ Recommended Solution

### **Track Both, But Make It Clear**

**For Uniswap:**
1. ✅ Track `uniswap-v3` (dominant)
2. ✅ Track `uniswap-v4` (latest)
3. ✅ Display clearly: "Uniswap V3" and "Uniswap V4"
4. ❌ Remove `uniswap` (invalid slug)

**Rationale:**
- Different smart contracts = different protocols
- V4 has better capital efficiency (hooks, custom curves)
- V3 still has majority of liquidity
- Users benefit from seeing which version performs better
- **Analogy:** Like tracking Aave V2 vs Aave V3 separately

**Similar Cases:**
- Compound V2 vs Compound V3 → Track separately ✅
- Liquity V1 vs Liquity V2 → Track separately ✅
- Balancer V2 vs Balancer V3 → Track separately ✅

---

## 🔧 Implementation

### Fix 1: Update Uniswap Slugs

**Current (WRONG):**
```javascript
PROTOCOL_TYPES = {
  'uniswap': 'dex',        // ❌ Invalid slug
  'uniswap-v4': 'dex',     // ✅ Valid
}

PROTOCOL_SLUGS_MAP = {
  'uniswap': 'uniswap',    // ❌ Returns 404
  'uniswap-v4': 'uniswap-v4', // ✅ Works
}
```

**Fixed (CORRECT):**
```javascript
PROTOCOL_TYPES = {
  'uniswap-v3': 'dex',     // ✅ Dominant version
  'uniswap-v4': 'dex',     // ✅ Latest version
}

PROTOCOL_SLUGS_MAP = {
  'uniswap-v3': 'uniswap-v3',  // ✅ Valid
  'uniswap-v4': 'uniswap-v4',  // ✅ Valid
}
```

### Fix 2: Display Names (Frontend)

**Show version in name:**
- Backend returns: `name: "Uniswap V3"` from DefiLlama
- Frontend displays: "Uniswap V3" (already handled by API)

---

## 🐛 Missing Change Data Fix

### Root Cause

Protocols showing "—" for changes lack sufficient historical data points.

**Check in `data.js`:**
```javascript
const tvl24hAgo = getTvlAtTimestamp(tvlData.chainTvls, now - 86400);
const change24h = calculateChange(currentTvl, tvl24hAgo);

function calculateChange(current, previous) {
  if (!previous || previous === 0) return null; // ← Returns null, shows "—"
  return ((current - previous) / previous) * 100;
}
```

**Why This Happens:**
1. Protocol is new → DefiLlama has < 24h of data
2. API call failed → `tvl24hAgo` is 0 or null
3. Historical data incomplete → `getTvlAtTimestamp` can't find data point

### Solution Options

**Option A: Show "NEW" instead of "—"**
```javascript
const formatChange = (change) => {
  if (change === null) return <span className="text-gray-400">NEW</span>;
  // ... rest
}
```

**Option B: Calculate from available data**
```javascript
// If 24h data missing, try 12h, 6h, or 1h and extrapolate
if (!tvl24hAgo && tvl12hAgo) {
  change24h = calculateChange(currentTvl, tvl12hAgo) * 2; // Estimate
}
```

**Option C: Show partial data**
```javascript
// Show "< 1 day old" or "Insufficient data"
if (!tvl24hAgo) {
  change24h = 'INSUFFICIENT_DATA';
}
```

**Recommended: Option A** (show "NEW" badge)
- Clearest to users
- No fake data
- Indicates protocol is recently added

---

## 📋 Action Plan

### Step 1: Fix Uniswap Slug
- [ ] Replace `'uniswap': 'dex'` with `'uniswap-v3': 'dex'`
- [ ] Update `PROTOCOL_SLUGS_MAP` accordingly
- [ ] Update `PROTOCOLS` array in `server.js`

### Step 2: Verify New Protocols
- [ ] Test Maple, Fluid, Compound V3 API calls
- [ ] Check if DefiLlama has historical data for them
- [ ] Add error handling for missing historical data

### Step 3: Update Frontend Display
- [ ] Change "—" to "NEW" for null changes
- [ ] Consider adding tooltips explaining versions
- [ ] Ensure "Uniswap V3" vs "Uniswap V4" is clear

### Step 4: Documentation
- [ ] Update protocol list in README
- [ ] Note versioning strategy
- [ ] Explain why multiple versions are tracked

---

## 🎓 Protocol Versioning Guidelines

**When to Track Separate Versions:**
✅ Different smart contracts  
✅ Separate liquidity pools  
✅ Significantly different features  
✅ Both versions have meaningful TVL (>$100M)  
✅ Both versions are actively used  

**When to Track Only One Version:**
❌ Old version is deprecated (< $10M TVL)  
❌ Migration is complete (99% moved to new version)  
❌ Versions share the same liquidity  
❌ Only name change, no technical difference  

**Examples:**
- **Uniswap V3 + V4:** Track both ✅ (separate pools, both active)
- **Compound V2 + V3:** Track both ✅ (different protocols)
- **Aave V2 + V3:** Track V3 only if V2 deprecated
- **Curve:** Track once (versions share pools)

---

## 🔍 Testing New Protocols

**Before Adding a Protocol, Verify:**

1. **TVL exists:**
   ```bash
   curl https://api.llama.fi/tvl/maple
   # Should return a number, not 404
   ```

2. **Historical data exists:**
   ```bash
   curl https://api.llama.fi/protocol/maple
   # Check chainTvls.{chain}.tvl array has entries
   ```

3. **Fees exist:**
   ```bash
   curl https://api.llama.fi/summary/fees/maple
   # Should return total24h, total7d
   ```

4. **Volume exists (DEX only):**
   ```bash
   curl https://api.llama.fi/summary/dexs/orca-dex
   # Should return total24h volume
   ```

---

## 📊 Current Protocol Count After Fixes

| Category | Before | After | Change |
|----------|--------|-------|--------|
| **DEXs** | 12 | 12 | Replace `uniswap` → `uniswap-v3` |
| **Lending** | 13 | 13 | No change |
| **CDP** | 3 | 3 | No change |
| **TOTAL** | **28** | **28** | Fix data quality |

**No protocols removed, just fixing the broken `uniswap` slug!**

