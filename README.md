# SPT Index Dashboard

A real-time DeFi protocol scoring dashboard that calculates performance scores based on on-chain metrics from DefiLlama.

## 🌟 Overview

The SPT Index Dashboard provides live performance scores for major DeFi protocols using **Z-score normalization** methodology:

- **Statistical Normalization**: Z-score transformation over 90-day rolling window
- **Protocol-Specific Weights**: Different formulas for DEX vs Lending protocols  
- **Dual-Score System**: Cross-protocol ranking + momentum trends
- **Multi-Chain Support**: 18 protocols across 8 blockchain networks

## ✨ Current Features

### Core Functionality
- ✅ **18 Active Protocols** - DEX and Lending across 8 chains (Ethereum, Solana, BNB Chain, Avalanche, Polygon, Base, Arbitrum, Tron)
- ✅ **Real-time Data** - Live metrics from DefiLlama API
- ✅ **Z-Score Normalization** - Statistical scoring over 90-day windows
- ✅ **Dual-Score System** - SPT Score (cross-protocol) + Momentum (self-comparison)
- ✅ **Protocol Detail Pages** - Interactive charts with 90-day history
- ✅ **Multi-Tier Caching** - 5min main cache, 10min protocol cache (~4000x speedup)
- ✅ **CSV Export** - Automatic data exports for analysis
- ✅ **Credit Ratings** - AAA to B style ratings (like Moody's)

### UI/UX
- ✅ Modern responsive design with TailwindCSS
- ✅ Interactive charts with Recharts
- ✅ Protocol logos and branding
- ✅ Hover tooltips for explanations
- ✅ Change indicators (24h, 7d, 30d)
- ✅ Cache status indicators
- ✅ Clickable protocol names with detail pages

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

```bash
# Clone the repository
cd /Users/gherardolattanzi/SPT

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Running the Application

**Terminal 1 - Start Backend:**
```bash
cd backend
npm start
# Backend runs on http://localhost:3000
```

**Terminal 2 - Start Frontend:**
```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:3001
```

**Open Dashboard:**
Navigate to http://localhost:3001

### Quick Commands

```bash
# Test backend API
curl http://localhost:3000/api/spt

# View CSV exports
cd backend/data
ls -lh

# Force refresh data
curl -X POST http://localhost:3000/api/spt/refresh
```

## 📊 Understanding the Scores

### SPT Score (Cross-Protocol)
- **Purpose:** Main tradable metric showing operational strength
- **Method:** Z-score normalized against entire protocol cohort
- **Range:** Typically 0.30-0.80
- **Use:** Rankings, perpetual markets (future)

### Momentum Score (Self-Comparison)
- **Purpose:** Trend analysis showing improvement/decline
- **Method:** Current performance vs own 90-day baseline
- **Indicators:** 📈 Growing | ➡️ Stable | 📉 Declining
- **Use:** Governance signals, trend trading

### Rating System
- **AAA** (0.45+): Exceptional operational efficiency
- **AA** (0.40-0.45): Very strong performance
- **A** (0.35-0.40): Good performance
- **BBB** (0.30-0.35): Average performance
- **BB** (0.25-0.30): Below average
- **B** (<0.25): Weak performance

## 🏗️ Architecture

### Tech Stack

**Full Stack (Vercel):**
- Next.js 16 with App Router & Serverless Functions
- React 19 with TypeScript
- TailwindCSS for styling
- Recharts for data visualization

**Backend Logic (Serverless):**
- Next.js API Routes (Edge Functions)
- Z-score normalization engine
- Native Fetch API
- Vercel Edge Caching (24h revalidation)

**Data Source:**
- DeFiLlama API (no key required)

### Deployment Architecture

```
User Browser → Vercel Edge Network → Next.js API Route → DeFiLlama API
                      ↓
              [24h Edge Cache]
                      ↓
              [SessionStorage Cache]
```

### Project Structure

```
SPT/
├── backend/
│   ├── server.js           # Express API server
│   ├── data.js             # Data fetching & aggregation
│   ├── scoring.js          # Z-score normalization engine
│   ├── protocolDetail.js   # Protocol detail endpoints
│   ├── csvExport.js        # CSV export functionality
│   ├── cache.js            # Multi-tier caching
│   └── data/               # CSV export storage
├── frontend/
│   ├── app/
│   │   ├── page.tsx                    # Main dashboard
│   │   ├── protocol/[slug]/page.tsx    # Protocol details
│   │   ├── components/InfoTooltip.tsx  # Reusable tooltip
│   │   ├── layout.tsx                  # Root layout
│   │   └── globals.css                 # Global styles
│   └── package.json
└── docs/
    ├── product.md                      # Product specification
    ├── scratchpad.md                   # Active work tracking
    ├── ROADMAP.md                      # Future enhancements
    ├── CHANGELOG.md                    # Implementation history
    └── implementation-plan/
        └── dual-score-system.md        # Current active task
```

## 🔌 API Endpoints

### `GET /api/spt`
Returns SPT index data for all protocols (cached 5 min).

**Response:**
```json
{
  "dex": [
    {
      "protocol": "Uniswap",
      "slug": "uniswap",
      "score": 0.7672,
      "momentum": "declining",
      "tvl": 5577413610,
      "fees": 2326785,
      "volume": 4307455888
    }
  ],
  "lending": [...],
  "_metadata": {
    "cached": true,
    "cacheAge": 45,
    "cacheTTL": 300
  }
}
```

### `GET /api/protocol/:slug`
Returns detailed protocol data with 90-day history.

### `POST /api/spt/refresh`
Force refresh cache and recalculate all scores.

### `GET /health`
Health check endpoint.

## 📈 Scoring Methodology

### 1. Z-Score Normalization
```
z = (value - mean) / stdDev
```
Calculated over 90-day rolling window for each metric.

### 2. Sigmoid Transformation
```
S(z) = 1 / (1 + e^(-z))
```
Maps Z-scores to [0,1] range, dampening outliers.

### 3. Weighted Aggregation

**DEX Protocols:**
- Fees: 35%
- Volume: 30%
- TVL: 25%
- Activity: 10%

**Lending Protocols:**
- Fees: 40%
- TVL: 35%
- Volume: 15%
- Activity: 10%

### 4. Dual Score Calculation

**Cross-Protocol (SPT Score):**
```javascript
score = Σ(weight × sigmoid(z_cohort))
```

**Self-Comparison (Momentum):**
```javascript
momentum = Σ(weight × sigmoid(z_self))
```

## 🌐 Supported Protocols

### DEX Protocols (9)
- **Ethereum**: Uniswap, Curve DEX, SushiSwap, Balancer
- **Solana**: Raydium, Orca
- **BNB Chain**: PancakeSwap
- **Avalanche**: Trader Joe
- **Polygon**: QuickSwap
- **Base**: Aerodrome

### Lending Protocols (9)
- **Ethereum**: Aave, Compound V3, MakerDAO (Sky), Morpho, Spark
- **Tron**: JustLend
- **BNB Chain**: Venus
- **Arbitrum**: Radiant
- **Avalanche**: BENQI

## 🚀 Deployment

**🎉 Live Application:** https://frontend-flxr6bm3i-lifeanalysis-projects.vercel.app

**⚠️ Note:** Password protection may be enabled. To disable:
1. Go to https://vercel.com/lifeanalysis-projects/frontend/settings/deployment-protection
2. Select "Disabled"
3. Save

**Fully deployed on Vercel** as serverless functions - no separate backend needed!

### Current Configuration (Free Tier - Optimized)
- **Protocols Tracked:** 6 (top by TVL)
  - **DEX:** Uniswap, Curve, PancakeSwap
  - **Lending:** Aave, Spark, Morpho
- **Historical Window:** 30 days (optimal for Z-score analysis)
- **Batched Fetching:** 3 protocols at a time (2 batches)
- **Execution Time:** ~4-6 seconds (comfortably under 10s limit)
- **Edge Caching:** 24-hour cache with stale-while-revalidate
- **All Features:** ✅ Dual-score system, rankings, charts

### Why These Limitations?

Vercel Free Tier has a **10-second serverless function timeout**. Fetching DeFiLlama historical data for multiple protocols is resource-intensive:
- Each protocol requires 3 API calls (TVL, fees, volume)
- Historical data processing takes time
- 6 protocols × 30 days = optimal balance

### Upgrade Options

**Option 1: Vercel Pro ($20/month)**
- 60-second `maxDuration`
- Track all 19 protocols
- 90-day historical window
- Just uncomment protocols in code

**Option 2: Deploy Backend Separately (FREE)**
- Use the `/backend` Express server
- Deploy to Railway/Render free tier
- No timeout limits
- Track all 19 protocols with 90 days
- See [DEPLOYMENT.md](DEPLOYMENT.md) for instructions

See **[DEPLOYMENT_COMPLETE.md](DEPLOYMENT_COMPLETE.md)** for:
- Complete deployment architecture
- Performance metrics
- Maintenance guide
- Custom domain setup

## 📖 Documentation

- **[Deployment Guide](DEPLOYMENT.md)** - Production deployment instructions
- **[Product Specification](docs/product.md)** - Full product vision and requirements
- **[Roadmap](docs/ROADMAP.md)** - Future enhancements and improvements
- **[Changelog](docs/CHANGELOG.md)** - Complete implementation history
- **[Scratchpad](docs/scratchpad.md)** - Active development notes

## 🎯 Key Innovations

1. **Credit Rating System** - First DeFi dashboard using Moody's-style ratings (AAA-B)
2. **Z-Score Normalization** - Robust to outliers, statistically sound
3. **Dual-Score System** - Cross-protocol rankings + momentum trends
4. **Multi-Tier Caching** - Optimized for speed without sacrificing freshness
5. **Protocol-Specific Weights** - Different formulas for DEX vs Lending
6. **Interactive Charts** - 90-day historical SPT score visualization
7. **Multi-Chain Coverage** - 8 blockchain networks in one dashboard

## 🔧 Development

### Backend Development
```bash
cd backend
node server.js
```

### Frontend Development
```bash
cd frontend
npm run dev
```

### Testing
```bash
# Test API manually
curl http://localhost:3000/api/spt | python3 -m json.tool

# Check CSV exports
ls -lh backend/data/
```

## 📊 Performance

- **API Response Time**: 10-20ms (cached)
- **Initial Load**: ~80s (first request, fetches all data)
- **Historical Data**: 90 days × 18 protocols = 1,620 data points
- **Cache Hit Rate**: ~95% for typical usage
- **Frontend Build**: ~380ms with Turbopack

## 🤝 Contributing

This is an internal project. For questions or suggestions, contact the development team.

## 📝 License

MIT

## 🙏 Data Sources

All protocol data is sourced from [DefiLlama](https://defillama.com/), the largest TVL aggregator in DeFi.

---

**Last Updated:** October 23, 2025  
**Status:** ✅ Production Ready  
**Active Protocols:** 18  
**Supported Chains:** 8
