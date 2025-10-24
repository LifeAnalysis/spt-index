# SPT Index: Protocol Expansion Analysis

## Current State (17 Protocols)

### DEXs (8 protocols)
- Uniswap, Curve DEX, SushiSwap, Balancer, PancakeSwap, Raydium, QuickSwap, Aerodrome

### Lending (9 protocols)
- Aave, Compound V3, MakerDAO, Morpho, Spark, JustLend, Venus, Radiant, BENQI

---

## DefiLlama API Capabilities

Based on Context7 documentation analysis, DefiLlama provides:

### **Core Endpoint**: `/api/protocols`
- **Returns**: ALL DeFi protocols with TVL, categories, chains, and 24h/7d/30d changes
- **Categories Available**:
  - ✅ **Lending** (currently tracking 9)
  - ✅ **Dexes** (currently tracking 8)
  - 🆕 **CDP** (Collateralized Debt Position)
  - 🆕 **Derivatives** (Perpetuals)
  - 🆕 **Options** (Options Trading)
  - 🆕 **Liquid Staking** (stETH, rETH, etc.)
  - 🆕 **Yield Aggregators** (Yearn, Beefy, etc.)
  - 🆕 **Bridges** (Cross-chain bridges)
  - 🆕 **RWA** (Real World Assets)
  - 🆕 **Synthetics** (Synthetic assets)
  - And 20+ more categories!

### **Data Available Per Protocol**:
1. **TVL**: Historical + current across all chains
2. **Fees**: `/api/summary/fees/{protocol}` - Daily fees & revenue
3. **Volume**: 
   - DEXs: `/api/summary/dexs/{protocol}` - Trading volume
   - Derivatives: `/api/summary/derivatives/{protocol}` - Perp volume + open interest
   - Options: `/api/summary/options/{protocol}` - Premium + notional volume
4. **Lending Metrics**: `/yields/poolsBorrow` - Borrow rates, utilization
5. **Historical Data**: 90+ days for all metrics

---

## Expansion Potential by Category

### 1️⃣ **DEXs** - Can Add ~50+ More Protocols

**Top Missing DEXs by TVL/Volume:**
- **Ethereum Layer 2s:**
  - Velodrome (Optimism) - $200M+ TVL
  - TraderJoe (Avalanche) - $150M+ TVL
  - Camelot (Arbitrum) - $100M+ TVL
  - Zyberswap (Arbitrum)
  - KyberSwap (Multi-chain)
  
- **Alt Layer 1s:**
  - Orca (Solana) - $500M+ TVL
  - Jupiter (Solana) - Largest Solana DEX
  - SpookySwap (Fantom)
  - SpiritSwap (Fantom)
  
- **Emerging Chains:**
  - Maverick (Base, zkSync)
  - BaseSwap (Base)
  - SyncSwap (zkSync)

**DEX Metrics Available:**
```json
{
  "volume24h": 1500000000,
  "volume7d": 10500000000,
  "capitalEfficiency": "volume/tvl",
  "fees24h": 2000000,
  "change_1d": 3.2,
  "chains": ["Ethereum", "Arbitrum"]
}
```

---

### 2️⃣ **Lending** - Can Add ~30+ More Protocols

**Top Missing Lending Protocols:**
- **Ethereum:**
  - Euler Finance - $200M+ TVL
  - Silo Finance - Isolated lending
  - Fraxlend - Frax ecosystem
  - Gearbox - Leveraged farming
  
- **Layer 2s:**
  - Moonwell (Base, Optimism) - $100M+ TVL
  - Sonne Finance (Optimism)
  - Granary (Optimism)
  
- **Alt Chains:**
  - Geist (Fantom)
  - Scream (Fantom)
  - Kinza (BSC)
  - Tectonic (Cronos)

**Lending Metrics Available:**
```json
{
  "totalSupplyUsd": 2000000000,
  "totalBorrowUsd": 1500000000,
  "utilizationRate": 75.0,
  "apyBaseBorrow": 5.2,
  "ltv": 0.75,
  "fees24h": 150000
}
```

---

### 3️⃣ **NEW CATEGORY: CDP (Collateralized Debt)** - 15+ Protocols

**Major CDP Protocols:**
- **Ethereum:**
  - MakerDAO (already tracked, but can separate CDP metrics)
  - Liquity - LUSD stablecoin
  - Reflexer - RAI stablecoin
  - Abracadabra - MIM stablecoin
  
- **Alt Chains:**
  - QiDao (Polygon) - MAI stablecoin
  - QANX (BSC)
  - Prisma Finance - mkUSD

**CDP-Specific Metrics:**
```json
{
  "debtCeiling": 1000000000,
  "debtUtilization": 85.2,
  "collateralRatio": 150.0,
  "stabilityFee": 2.5,
  "liquidations24h": 50000,
  "mintedStablecoin": 850000000
}
```

**SPT Scoring for CDPs:**
- **Debt Volume (40%)**: Total minted stablecoins
- **Collateral Quality (30%)**: % of blue-chip collateral (ETH, wBTC)
- **Stability Fee Revenue (20%)**: Protocol revenue
- **Utilization Rate (10%)**: Debt/ceiling ratio

---

### 4️⃣ **NEW CATEGORY: Derivatives (Perps)** - 20+ Protocols

**Major Derivatives Protocols:**
- **On-Chain Perps:**
  - GMX (Arbitrum) - $500M+ OI
  - Hyperliquid - $2B+ volume/day
  - dYdX (Cosmos chain) - $1B+ daily volume
  - Gains Network (Polygon)
  - Vertex Protocol (Arbitrum)
  - ApolloX (BSC)
  
- **Synthetic Assets:**
  - Synthetix - sUSD, sBTC, sETH
  - Kwenta (Optimism) - Synthetix frontend
  - Polynomial (Optimism)

**Derivatives Metrics Available:**
```json
{
  "volume24h": 1000000000,
  "openInterest": 500000000,
  "fees24h": 3000000,
  "liquidations24h": 10000000,
  "funding Rate": 0.01,
  "capitalEfficiency": "volume/OI"
}
```

**SPT Scoring for Derivatives:**
- **Trading Volume (40%)**: Daily perp volume
- **Open Interest (25%)**: Total positions
- **Fee Revenue (20%)**: Protocol fees
- **OI Growth (15%)**: 7d momentum

---

### 5️⃣ **NEW CATEGORY: Liquid Staking (LSDs)** - 10+ Protocols

**Major Liquid Staking Protocols:**
- **Ethereum:**
  - Lido - $35B+ TVL (largest DeFi protocol)
  - Rocket Pool - $5B+ TVL
  - Frax Ether - $1B+ TVL
  - Stakewise - $500M+ TVL
  
- **Alt Chains:**
  - Marinade (Solana) - $2B+ TVL
  - Jito (Solana)
  - Ankr (Multi-chain)
  - Stader (Multi-chain)

**LSD Metrics Available:**
```json
{
  "tvlUsd": 35000000000,
  "apy": 3.8,
  "marketShare": 0.32,
  "stakedAssets": 10000000,
  "exchangeRate": 1.05,
  "fees24h": 500000
}
```

**SPT Scoring for LSDs:**
- **Staked Assets (40%)**: Total ETH/SOL staked
- **Market Share (30%)**: % of total staking market
- **APY Competitiveness (20%)**: vs other LSDs
- **Fee Revenue (10%)**: Protocol fees

---

### 6️⃣ **NEW CATEGORY: Yield Aggregators** - 15+ Protocols

**Major Yield Aggregators:**
- Yearn Finance - $400M+ TVL
- Beefy Finance - $300M+ TVL
- Convex - $3B+ TVL (Curve boost)
- Aura Finance - $1B+ TVL (Balancer boost)
- Sommelier (Ethereum)
- Alpaca Finance (BSC)

**Yield Aggregator Metrics:**
```json
{
  "tvlUsd": 400000000,
  "apy": 8.5,
  "vaults": 150,
  "autoCompoundFee": 2.0,
  "performanceFee": 20.0,
  "fees24h": 15000
}
```

**SPT Scoring for Yield Aggregators:**
- **TVL (30%)**: Capital under management
- **APY Alpha (35%)**: Excess return vs base protocol
- **Fee Revenue (25%)**: Performance fees
- **Vault Diversity (10%)**: Strategy count

---

### 7️⃣ **NEW CATEGORY: Options** - 8+ Protocols

**Major Options Protocols:**
- Lyra (Optimism) - $5M+ daily premium
- Premia (Arbitrum)
- Aevo (formerly Ribbon)
- Hegic (Ethereum)
- Dopex (Arbitrum)
- Thales (Optimism)

**Options Metrics Available:**
```json
{
  "premiumVolume24h": 5000000,
  "notionalVolume24h": 100000000,
  "openInterest": 50000000,
  "fees24h": 250000
}
```

**SPT Scoring for Options:**
- **Premium Volume (40%)**: Actual premium paid
- **Notional Volume (30%)**: Underlying exposure
- **Open Interest (20%)**: Active contracts
- **Fee Revenue (10%)**: Protocol fees

---

### 8️⃣ **NEW CATEGORY: Bridges** - 20+ Protocols

**Major Bridge Protocols:**
- Stargate (LayerZero) - $500M+ daily volume
- Across Protocol - $200M+ daily
- Synapse - $100M+ daily
- Hop Protocol - Multi-rollup
- Celer cBridge
- Multichain (RIP but historical data)

**Bridge Metrics Available:**
```json
{
  "volume24h": 200000000,
  "deposits": 150000000,
  "withdrawals": 50000000,
  "txCount24h": 5000,
  "fees24h": 100000,
  "chains": ["Ethereum", "Arbitrum", "Optimism"]
}
```

**SPT Scoring for Bridges:**
- **Transfer Volume (45%)**: Daily bridge volume
- **Fee Revenue (30%)**: Bridge fees
- **Chain Coverage (15%)**: Number of chains
- **Transaction Count (10%)**: Usage indicator

---

## Total Expansion Potential

| Category | Current | Can Add | Total Possible |
|----------|---------|---------|----------------|
| **DEXs** | 8 | ~50 | 58+ |
| **Lending** | 9 | ~30 | 39+ |
| **CDP** | 0 | ~15 | 15+ |
| **Derivatives** | 0 | ~20 | 20+ |
| **Liquid Staking** | 0 | ~10 | 10+ |
| **Yield Aggregators** | 0 | ~15 | 15+ |
| **Options** | 0 | ~8 | 8+ |
| **Bridges** | 0 | ~20 | 20+ |
| **TOTAL** | **17** | **~168** | **185+** |

---

## Implementation Priority

### **Phase 1 (High Value, Easy to Add)**: ~30 protocols
1. Top 10 Missing DEXs (Orca, Jupiter, Velodrome, etc.)
2. Top 10 Missing Lending (Euler, Moonwell, Silo, etc.)
3. Top 10 CDPs (Liquity, Reflexer, Abracadabra, etc.)

**Why First:**
- Same category, existing scoring logic
- High TVL and recognizability
- Already have template code

---

### **Phase 2 (New Categories, High Impact)**: ~30 protocols
1. Derivatives (GMX, Hyperliquid, dYdX, Vertex, Gains Network)
2. Liquid Staking (Lido, Rocket Pool, Frax Ether, Marinade, Jito)
3. Yield Aggregators (Yearn, Convex, Beefy, Aura)

**Why Second:**
- Massive TVL (Lido alone = $35B)
- New scoring dimensions
- High user interest

---

### **Phase 3 (Emerging Categories)**: ~20 protocols
1. Options (Lyra, Premia, Aevo)
2. Bridges (Stargate, Across, Synapse)

**Why Third:**
- Lower TVL per protocol
- More niche user base
- Newer category development

---

## API Requirements

### **Current Data We Fetch:**
```javascript
// For each protocol:
GET /api/protocol/{slug}        // TVL + historical
GET /api/summary/fees/{slug}    // Fees
GET /api/summary/dexs/{slug}    // Volume (DEXs only)
GET /yields/poolsBorrow         // Lending metrics
```

### **New Data We Can Fetch:**

**For Derivatives:**
```javascript
GET /api/summary/derivatives/{slug}
// Returns: volume24h, volume7d, openInterest, totalVolume, chains
```

**For Options:**
```javascript
GET /api/summary/options/{slug}
// Returns: premiumVolume24h, notionalVolume24h, totalPremiumVolume
```

**For Liquid Staking:**
```javascript
GET /yields/lsdRates
// Returns: apy, tvlUsd, marketShare, apyBase7d, apyBase30d
```

**For Bridges:**
```javascript
GET /bridgevolume/{chain}
// Returns: depositUSD, withdrawUSD, depositTxs, withdrawTxs
```

---

## Technical Implementation

### **Minimal Code Changes Needed:**

1. **Add Protocol Slugs** (1 line per protocol):
```javascript
const PROTOCOL_TYPES = {
  // ... existing ...
  'gmx': 'derivatives',
  'lido': 'liquid-staking',
  'liquity': 'cdp',
  'stargate': 'bridge'
};
```

2. **Add Scoring Weights** (per category):
```javascript
const DEFAULT_WEIGHTS = {
  // ... existing dex & lending ...
  derivatives: {
    volume: 0.40,
    openInterest: 0.25,
    fees: 0.20,
    oiGrowth: 0.15
  },
  'liquid-staking': {
    stakedAssets: 0.40,
    marketShare: 0.30,
    apyCompetitiveness: 0.20,
    fees: 0.10
  }
};
```

3. **Add Metrics Fetchers** (similar to `getLendingMetrics`):
```javascript
async function getDerivativesMetrics(protocolSlug) {
  const data = await fetch(`https://pro-api.llama.fi/api/summary/derivatives/${protocolSlug}`);
  return {
    volume: data.volume24h,
    openInterest: data.openInterest,
    fees: data.fees24h,
    oiGrowth: data.change_7d
  };
}
```

---

## Recommended Next Steps

### **Immediate Action (This Week):**
1. **Fetch Protocol List**: Call `/api/protocols` to get ALL available protocols
2. **Filter by Category**: Group by category and TVL threshold (e.g., >$50M)
3. **Prioritize**: Top 10 per category by TVL/Volume

### **Quick Win (Next Sprint):**
1. Add **Top 10 DEXs** (Orca, Jupiter, Velodrome, etc.)
2. Add **Top 10 Lending** (Euler, Moonwell, etc.)
3. Deploy and test

### **Major Expansion (Next Month):**
1. Launch **Derivatives Category** (GMX, Hyperliquid, dYdX + 7 more)
2. Launch **Liquid Staking Category** (Lido, Rocket Pool + 8 more)
3. Update frontend to show new categories

---

## Business Impact

### **Current State:**
- 17 protocols
- 2 categories
- ~$100B combined TVL coverage

### **After Phase 1 (47 protocols):**
- 3x more protocols
- 3 categories (DEX, Lending, CDP)
- ~$200B TVL coverage

### **After Phase 2 (77 protocols):**
- 4.5x more protocols
- 5 categories (+ Derivatives, Liquid Staking, Yield)
- ~$300B+ TVL coverage
- **Includes Lido ($35B) = instant credibility**

### **After Phase 3 (97+ protocols):**
- 5.7x more protocols
- 7 categories (+ Options, Bridges)
- Comprehensive DeFi coverage
- **Near-complete DeFi ecosystem coverage**

---

## Cost Considerations

**DefiLlama API:**
- Free tier: 150 requests/minute, 300 requests/hour
- Current: ~17 protocols × 3 endpoints = 51 requests per refresh
- With 97 protocols: ~97 × 4 endpoints = 388 requests per refresh

**Solution:**
- Add protocols gradually (10-20 per phase)
- Increase cache TTL to 10-15 minutes
- Consider Pro API ($99/mo) if scaling beyond 100 protocols

---

## Conclusion

**We can expand from 17 to 185+ protocols** using DefiLlama's free API, covering 7+ new categories. The API provides everything we need:

✅ **TVL** - Historical + current  
✅ **Fees** - Daily revenue  
✅ **Volume** - Trading/transfer activity  
✅ **Category-Specific Metrics** - Borrow rates, open interest, staking APY, etc.  
✅ **Chain Breakdowns** - Multi-chain support  
✅ **Historical Data** - 90+ days for trending  

**Recommended approach**: Start with Phase 1 (30 protocols in existing categories), then expand to high-impact new categories (Derivatives, Liquid Staking) in Phase 2.

