# SPT MVP Launch Guide: Single-Protocol Rebasing Accumulator

**How to launch exactly one SPT token (e.g., SPT-AAVE) as a minimum viable product.**

---

## 1. What You're Building

A single rebasing token that:
1. **Tracks** AAVE's revenue dominance vs a frozen benchmark
2. **Rebases** daily to distribute vault yield to all holders
3. **Trades** on a Uniswap v3 pool against USDC

**MVP Scope:**
- 1 token (SPT-AAVE)
- 1 benchmark (frozen 2025 DeFi revenue weights)
- 1 AMM pool (SPT-AAVE / USDC)
- 1 vault (holds USDC, earns yield, provides liquidity)

---

## 2. Token Mechanics

### 2.1 Dual-State Design

The token tracks two numbers per user:

| State | What It Represents |
|-------|-------------------|
| `principal` | User's accumulator units (unchanged after buy/sell) |
| `lastYieldIndex` | Snapshot of global yield index at last interaction |

**Global State:**
| State | What It Represents |
|-------|-------------------|
| `totalPrincipal` | Sum of all users' principal |
| `yieldIndex` | Global multiplier (starts at 1.0, grows with yield) |
| `accumulatedIntegral` | Sum of all daily Δ values (revenue drift) |

### 2.2 User Balance Calculation

```
balanceOf(user) = user.principal × (yieldIndex / user.lastYieldIndex)
```

- When yield accrues, `yieldIndex` increases.
- User's balance grows automatically without any action.

### 2.3 Token Price Calculation

```
price() = 100 × exp(k × accumulatedIntegral)
```

- `k = 0.008` (degen mode)
- `accumulatedIntegral` = sum of all daily `Δ` values since genesis

---

## 3. Daily Price Update Flow

**Triggered once per day by a keeper/bot:**

### Step 1: Fetch Revenue Data
- Query 3+ oracle sources for AAVE's 30-day rolling revenue ($R_{AAVE}$)
- Query the same for all benchmark protocols
- Take median of each

### Step 2: Calculate Deviation
```
S_AAVE = R_AAVE / D_global
S_bench = Σ (w_i × S_i)  # Using frozen 2025 weights
Δ = S_AAVE - S_bench
```

### Step 3: Update Accumulated Integral
```
accumulatedIntegral += Δ
```

### Step 4: Price Auto-Updates
- Any call to `price()` now reflects the new integral
- No explicit "price update" transaction needed

---

## 4. Yield Integration

### 4.1 Where Yield Comes From

The vault holds USDC (from LP deposits and swap fees). This USDC is:
1. Deposited into Aave/Morpho to earn ~5-10% APR
2. Harvested daily

### 4.2 Yield Distribution Flow

**Triggered once per day after harvest:**

```
yieldAmount = harvest_from_aave()
yieldIndex += (yieldAmount × 1e18) / totalPrincipal
```

**Result:** Every holder's `balanceOf()` increases proportionally.

### 4.3 Example

| Day | yieldIndex | User A (100 principal) | User B (50 principal) |
|-----|-----------|------------------------|----------------------|
| 0 | 1.000 | 100 tokens | 50 tokens |
| 30 | 1.008 | 100.8 tokens | 50.4 tokens |
| 365 | 1.100 | 110 tokens | 55 tokens |

---

## 5. Liquidity Setup

### 5.1 Initial Pool Setup

1. **Create Uniswap v3 Pool:** SPT-AAVE / USDC
2. **Set Fee Tier:** 0.30% (standard for volatile pairs)
3. **Set Initial Price:** $100 per SPT-AAVE

### 5.2 Concentrated Liquidity Range

LPs should concentrate liquidity around:
- **Lower Bound:** $10 (90% crash from $100)
- **Upper Bound:** $1,000 (10× from $100)

This covers the first year of expected price movement.

### 5.3 Vault as Primary LP

The vault itself is the largest LP:
1. Holds USDC from user deposits
2. Auto-provides liquidity to the pool
3. Earns swap fees + lending yield

**Seed Liquidity Target:** $1M–$5M USDC at launch.

---

## 6. User Flows

### 6.1 Buy (Go Long)

1. User approves USDC spend
2. User calls Uniswap Router: swap USDC → SPT-AAVE
3. User receives SPT-AAVE in wallet
4. Balance rebases daily

### 6.2 Sell

1. User approves SPT-AAVE spend
2. User calls Uniswap Router: swap SPT-AAVE → USDC
3. User receives USDC

### 6.3 Check Balance

User calls `balanceOf(address)`:
- Returns current token count (with yield applied)

### 6.4 Check Value

User calls `valueOf(address)`:
- Returns `balanceOf(user) × price()`
- This is the USD value of their position

---

## 7. MVP Components Checklist

| Component | Description | Status |
|-----------|-------------|--------|
| **SPT-AAVE Token** | ERC-20 with rebasing logic and price tracking | Required |
| **Vault** | Holds USDC, earns yield, distributes via rebase | Required |
| **Oracle** | 3+ sources for AAVE + benchmark protocol revenues | Required |
| **Keeper** | Bot that calls daily update (revenue fetch + yield harvest) | Required |
| **Uniswap v3 Pool** | SPT-AAVE / USDC trading pair | Required |
| **UI** | Simple interface: buy/sell/check balance | Optional for MVP |

---

## 8. Genesis Parameters

| Parameter | Value | Notes |
|-----------|-------|-------|
| Initial Price | $100 | Arbitrary starting point |
| k (sensitivity) | 0.008 | Degen mode (~600% theoretical APR) |
| Genesis Date | 2025-03-01 | Benchmark snapshot date |
| D_global | $10M | Total DeFi revenue at genesis (adjust to real data) |
| w_AAVE | 0.15 | AAVE's weight in frozen benchmark (example) |
| Seed Liquidity | $1M–$5M | Vault USDC at launch |

---

## 9. Day 1 Launch Sequence

1. **Deploy Token Contract** with genesis parameters
2. **Deploy Vault Contract** linked to token
3. **Create Uniswap v3 Pool** (SPT-AAVE / USDC)
4. **Vault deposits seed USDC** to pool as LP
5. **Deploy Keeper** (Chainlink Automation or Gelato)
6. **First Oracle Update** triggers to set Day 1 price
7. **Announce:** Users can now buy SPT-AAVE

---

## 10. What's NOT in MVP

| Feature | Why Skipped |
|---------|-------------|
| SPT-INDEX basket | Add after 3+ single tokens exist |
| Lending market | Let Morpho/Aave list SPT-AAVE organically |
| Perps layer | Let Hyperliquid/GMX list it organically |
| Multiple tokens | Launch 1 token, prove it works, then expand |

---

## 11. Success Criteria (30 Days Post-Launch)

| Metric | Target |
|--------|--------|
| TVL in Vault | $5M+ |
| Daily Volume | $500k+ |
| Price Tracking | < 1% deviation from theoretical |
| Yield Distributed | > 0% (any yield = success) |
| Zero Exploits | No smart contract incidents |

---

## 12. Summary

The MVP is exactly:
1. **One token** (SPT-AAVE)
2. **One vault** (USDC → yield → rebase)
3. **One pool** (Uniswap v3)
4. **One keeper** (daily updates)

Users buy, hold, and watch their balance grow from yield while their value tracks AAVE's revenue dominance.

**This is the simplest possible version of V7.0.**

After 30 days of clean operation, add the second token (SPT-UNI), then the third, then build the INDEX basket.
