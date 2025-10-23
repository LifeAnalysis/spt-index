# SPT Index Dashboard - Improvements Roadmap

## 🎯 Priority Improvements

### HIGH PRIORITY (Next Sprint)

#### 1. **More Protocols** ⭐⭐⭐
**Current:** 4 protocols (Uniswap, Curve DEX, Aave, Compound V3)
**Target:** 20-50 top protocols

**Benefits:**
- More comprehensive DeFi coverage
- Better market representation
- More useful for users

**Implementation:**
```javascript
// Easy to add in backend/data.js
const PROTOCOLS = [
  // DEXs
  'uniswap', 'curve-dex', 'pancakeswap', 'balancer', 
  'sushiswap', 'velodrome', 'aerodrome',
  
  // Lending
  'aave', 'compound-v3', 'morpho', 'spark', 'venus',
  
  // Derivatives
  'gmx', 'synthetix', 'dydx',
  
  // Liquid Staking
  'lido', 'rocket-pool', 'frax-ether'
];
```

**Effort:** Low (1-2 hours)

---

#### 2. **Real Activity Metric** ⭐⭐⭐
**Current:** Activity set to 0 (placeholder)
**Target:** Real transaction count or unique users

**Data Source:**
```javascript
// DefiLlama has transaction data
fetch(`https://api.llama.fi/overview/fees/${protocol}`)
  .then(data => data.totalDataChart) // Daily transactions
```

**Benefits:**
- More accurate scoring
- Reflects actual protocol usage
- Better for smaller protocols with high activity

**Effort:** Medium (3-4 hours)

---

#### 3. **Database Integration** ⭐⭐⭐
**Current:** In-memory cache + CSV files
**Target:** PostgreSQL or MongoDB

**Benefits:**
- Persistent historical data
- Faster queries
- User data storage
- Audit trail

**Schema:**
```sql
CREATE TABLE protocol_scores (
  id SERIAL PRIMARY KEY,
  protocol_slug VARCHAR(50),
  score DECIMAL(10, 8),
  tvl BIGINT,
  fees BIGINT,
  volume BIGINT,
  timestamp TIMESTAMP,
  INDEX idx_protocol_time (protocol_slug, timestamp)
);

CREATE TABLE protocols (
  slug VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100),
  type VARCHAR(20),
  category VARCHAR(50),
  metadata JSONB
);
```

**Effort:** High (1-2 days)

---

#### 4. **Sort & Filter UI** ⭐⭐
**Current:** Fixed sorting by score
**Target:** Sort by any column, filter by type/category

**Features:**
- Click column headers to sort
- Search bar for protocol names
- Filter chips (DEX, Lending, DeFi, etc.)
- Multi-column sorting

**UI Example:**
```tsx
// Add to page.tsx
<div className="flex gap-2 mb-4">
  <input 
    placeholder="Search protocols..." 
    className="flex-1 px-4 py-2 border rounded-lg"
  />
  <select className="px-4 py-2 border rounded-lg">
    <option>All Types</option>
    <option>DEX</option>
    <option>Lending</option>
  </select>
  <select className="px-4 py-2 border rounded-lg">
    <option>Sort by Score</option>
    <option>Sort by TVL</option>
    <option>Sort by Fees</option>
  </select>
</div>
```

**Effort:** Medium (4-6 hours)

---

#### 5. **Protocol Comparison** ⭐⭐
**Current:** Individual protocol pages only
**Target:** Compare 2-4 protocols side-by-side

**Features:**
- Multi-line chart showing SPT scores
- Side-by-side metrics comparison
- Relative performance analysis
- Shareable comparison links

**Route:** `/compare?protocols=uniswap,curve-dex,aave`

**Effort:** High (1-2 days)

---

### MEDIUM PRIORITY

#### 6. **WebSocket Real-Time Updates** ⭐⭐
**Current:** Manual refresh required
**Target:** Auto-updates every 5 minutes

```javascript
// backend/server.js
import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 3001 });

setInterval(async () => {
  const data = await getSPTIndex(protocols);
  wss.clients.forEach(client => {
    client.send(JSON.stringify(data));
  });
}, 300000); // 5 minutes
```

**Effort:** Medium (6-8 hours)

---

#### 7. **User Authentication & Watchlist** ⭐⭐
**Current:** No user accounts
**Target:** Login + personalized watchlist

**Features:**
- OAuth (Google, Twitter, GitHub)
- Favorite protocols
- Custom alerts
- Portfolio tracking

**Tech Stack:**
- Auth: NextAuth.js or Clerk
- Database: User table with favorites

**Effort:** High (2-3 days)

---

#### 8. **Advanced Charts** ⭐⭐
**Current:** Basic area chart
**Target:** Multiple chart types

**Options:**
- Candlestick for volatility
- Heatmap for protocol comparison
- Treemap for TVL distribution
- Network graph for protocol relationships
- Correlation matrix

**Libraries:**
- D3.js for custom visualizations
- Apache ECharts for complex charts
- Plotly.js for interactive charts

**Effort:** High (3-5 days)

---

#### 9. **Alert System** ⭐
**Features:**
- Email alerts on score changes (±10%)
- Telegram/Discord bot notifications
- SMS for critical changes (via Twilio)
- Custom alert rules

```javascript
// Example alert logic
if (Math.abs(scoreChange) > 0.10) {
  sendEmail({
    to: user.email,
    subject: `${protocol} SPT Score Changed by ${scoreChange*100}%`,
    body: `New score: ${newScore}`
  });
}
```

**Effort:** High (2-3 days)

---

#### 10. **API Documentation & Public API** ⭐
**Current:** No public API docs
**Target:** OpenAPI spec + API keys

**Features:**
- Swagger UI documentation
- Rate limiting per API key
- Tiered access (free, pro, enterprise)
- Usage analytics

**Tools:**
- Swagger/OpenAPI
- Express rate-limit
- API key management

**Effort:** Medium (1-2 days)

---

### LOW PRIORITY (Nice to Have)

#### 11. **Testing Suite**
**Coverage:**
- Unit tests (Jest)
- Integration tests (Supertest)
- E2E tests (Playwright)
- Performance tests

**Target:** 80% code coverage

**Effort:** High (1 week)

---

#### 12. **Mobile App**
**Platform:** React Native or Flutter
**Features:**
- Native push notifications
- Offline mode
- Biometric login
- Widget for home screen

**Effort:** Very High (1-2 months)

---

#### 13. **AI/ML Features**
**Capabilities:**
- Predict score trends (LSTM/Prophet)
- Anomaly detection
- Automatic categorization
- Sentiment analysis from social media

**Tech:**
- TensorFlow.js or Python backend
- Historical data training
- Real-time inference

**Effort:** Very High (2-3 months)

---

#### 14. **Social Features**
**Community:**
- Comments/discussions per protocol
- User ratings and reviews
- Community score predictions
- Protocol comparisons by community

**Moderation:**
- Content filtering
- User reputation system
- Admin dashboard

**Effort:** Very High (1-2 months)

---

## 🐛 Bug Fixes & Optimizations

### Immediate Fixes

#### 1. **Adaptive Weight Recalculation**
**Issue:** Logic exists but never triggers
**Fix:** Add cron job to recalculate every 30 days

```javascript
// Add to backend
import cron from 'node-cron';

// Run every 30 days at midnight
cron.schedule('0 0 */30 * *', async () => {
  await recalculateAdaptiveWeights();
});
```

**Effort:** Low (2 hours)

---

#### 2. **Error Boundaries**
**Issue:** Frontend crashes on API errors
**Fix:** Add React Error Boundaries

```tsx
// frontend/app/ErrorBoundary.tsx
export class ErrorBoundary extends React.Component {
  state = { hasError: false };
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

**Effort:** Low (2 hours)

---

#### 3. **Loading States**
**Issue:** No skeleton loaders
**Fix:** Add skeleton screens during data fetch

```tsx
{loading ? (
  <SkeletonTable rows={4} />
) : (
  <ActualTable data={data} />
)}
```

**Effort:** Low (2-3 hours)

---

#### 4. **CSV Download Button**
**Issue:** CSV files only in backend/data
**Fix:** Add download button in UI

```tsx
<button onClick={() => {
  fetch(`/api/export/csv/${protocolSlug}`)
    .then(r => r.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${protocolSlug}_spt.csv`;
      a.click();
    });
}}>
  Download CSV
</button>
```

**Effort:** Low (1-2 hours)

---

#### 5. **Performance Optimization**
**Issues:**
- No code splitting
- Large bundle size
- No image optimization

**Fixes:**
```javascript
// next.config.js
export default {
  images: {
    domains: ['icons.llama.fi'],
    formats: ['image/avif', 'image/webp']
  },
  experimental: {
    optimizeCss: true
  }
};

// Dynamic imports
const ProtocolChart = dynamic(() => import('./ProtocolChart'), {
  loading: () => <Skeleton />
});
```

**Effort:** Medium (4-6 hours)

---

## 📊 Data Quality Improvements

### 1. **Multiple Data Sources**
**Current:** DefiLlama only
**Add:**
- The Graph Protocol
- Dune Analytics
- Token Terminal
- L2Beat (for L2 protocols)

**Benefit:** Cross-validation and redundancy

---

### 2. **Data Validation**
```javascript
function validateMetrics(data) {
  if (data.tvl < 0) throw new Error('Invalid TVL');
  if (data.fees < 0) throw new Error('Invalid fees');
  if (data.tvl < data.fees) console.warn('Fees > TVL unusual');
}
```

---

### 3. **Missing Data Interpolation**
```javascript
function interpolateMissingData(history) {
  for (let i = 0; i < history.length; i++) {
    if (!history[i].value && i > 0 && i < history.length - 1) {
      // Linear interpolation
      history[i].value = (history[i-1].value + history[i+1].value) / 2;
    }
  }
}
```

---

## 🎨 UI/UX Enhancements

### 1. **Dark Mode Toggle**
```tsx
const [theme, setTheme] = useState('light');

// Toggle button
<button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
  {theme === 'light' ? '🌙' : '☀️'}
</button>
```

---

### 2. **Keyboard Shortcuts**
```tsx
// Use hotkeys library
useHotkeys('ctrl+k', () => openSearch());
useHotkeys('r', () => refreshData());
useHotkeys('/', () => focusSearch());
```

---

### 3. **Animations**
```tsx
// Framer Motion
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  <ProtocolCard />
</motion.div>
```

---

### 4. **Accessibility**
- ARIA labels
- Keyboard navigation
- Screen reader support
- High contrast mode
- Font size adjustment

---

## 🏗️ Infrastructure

### 1. **CI/CD Pipeline**
```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm test
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - run: npm run build
      - run: vercel deploy --prod
```

---

### 2. **Monitoring**
- Sentry for error tracking
- PostHog for analytics
- Grafana for metrics
- Uptime monitoring (UptimeRobot)

---

### 3. **Caching Strategy**
```
Browser → CDN (Cloudflare) → API Gateway → Redis → PostgreSQL
         (static)  (API cache)   (rate limit)  (hot data)  (cold storage)
```

---

## 📝 Summary: Quick Wins

**Can be done today (1-2 hours each):**
1. Add 10-15 more protocols ✅
2. CSV download button ✅
3. Error boundaries ✅
4. Loading skeletons ✅
5. Keyboard shortcuts ✅

**This week (1-2 days):**
1. Sort & filter UI
2. Activity metric integration
3. Protocol comparison page
4. API documentation

**Next sprint (1-2 weeks):**
1. Database integration
2. User authentication
3. Alert system
4. Advanced charts
5. WebSocket updates

**Long term (1-3 months):**
1. Mobile app
2. AI/ML features
3. Social features
4. Multi-language support

---

## 🎯 Recommended Next Steps

### Week 1: Core Features
1. Add 20 more protocols (2 hours)
2. Add sort/filter UI (6 hours)
3. CSV download button (2 hours)
4. Error boundaries (2 hours)
5. Loading states (3 hours)

### Week 2: Data & Performance
1. Real activity metric (4 hours)
2. Database setup (8 hours)
3. Performance optimization (6 hours)
4. Cron jobs for adaptive weights (3 hours)

### Week 3: Advanced Features
1. Protocol comparison (12 hours)
2. WebSocket updates (8 hours)
3. API documentation (6 hours)

### Week 4: Polish & Deploy
1. Testing (12 hours)
2. SEO optimization (4 hours)
3. Documentation (6 hours)
4. Production deployment (4 hours)

---

**Total Estimated Effort for Full Roadmap:** 3-6 months
**MVP Enhancements (Weeks 1-2):** 40-50 hours
**Production Ready (Weeks 1-4):** 100-120 hours

---

## 💡 Best ROI Improvements

If limited time, focus on:
1. **More protocols** (biggest user value)
2. **Sort/filter** (better UX)
3. **Database** (foundation for growth)
4. **Protocol comparison** (unique feature)
5. **Real-time updates** (feels alive)

These 5 features would significantly improve the product with reasonable effort.

