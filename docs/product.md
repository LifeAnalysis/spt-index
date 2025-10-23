**Product Name:** **SPT Index Dashboard (MVP)**
**Purpose:** On-chain analytics dashboard assigning a live **performance score** to DeFi protocols, derived from deterministic, verifiable on-chain metrics — **not tradable**, but designed as the analytical foundation for future **SPT-perpetual markets**.

---

## **1. Core Objective**

Deliver a **real-time scoring engine and dashboard** measuring DeFi protocol operational performance using only public, verifiable on-chain data.
Output: **SPT Index Score (0–1)** per protocol, representing relative efficiency and growth.
Purpose: Foundational “fundamentals layer” for future synthetic markets (SPT-perpetuals).

---

## **2. Functional Overview**

### **2.1 MVP Scope**

Implements minimal version of Sections 2.1–2.4 from the full specification, using only publicly available data (DefiLlama API).
No database, weighting engine, or user system.
Primary functionality: data ingestion → normalization → score → REST output.

### **2.2 Core Functions**

1. **Protocol Scoring Engine (Simplified)**

   * Formula: `score = (fees + volume) / (tvl || 1)`
   * Source:

     * TVL: `https://api.llama.fi/protocol/{protocol}`
     * Fees: `https://api.llama.fi/summary/fees/{protocol}`
     * Volume: `https://api.llama.fi/summary/dexs/{protocol}`
   * Scoring normalized to relative scale (0–1) across protocols.
   * No correlation weighting in MVP.

2. **Ranking Feed**

   * List of protocols sorted by SPT score descending.
   * Example protocols: Uniswap, Curve, Aave, Compound.
   * Fields: `protocol`, `tvl`, `fees`, `volume`, `score`.

3. **Basic API Endpoint**

   * `GET /api/spt` returns live ranking data.
   * Refresh via real-time DefiLlama fetch (no caching).
   * Output JSON formatted for frontend charts.

4. **Frontend Display (Read-Only)**

   * Leaderboard table showing:

     * Protocol name
     * SPT Score
     * Fees / TVL / Volume
   * Minimal React/Next.js interface (no auth, no settings).

---

## **3. Technical Stack**

### **Backend**

* **Language:** Node.js (ESM)
* **Framework:** Express
* **HTTP Client:** Undici
* **Data Source:** Public DefiLlama API (no key, no rate limit)
* **Structure:**

  **/data.js**

  ```js
  import { fetch } from 'undici';

  async function getProtocolData(protocol) {
    const [tvl, fees, volume] = await Promise.all([
      fetch(`https://api.llama.fi/protocol/${protocol}`).then(r => r.json()),
      fetch(`https://api.llama.fi/summary/fees/${protocol}`).then(r => r.json()),
      fetch(`https://api.llama.fi/summary/dexs/${protocol}`).then(r => r.json())
    ]);

    return {
      name: tvl.name,
      chains: tvl.chains,
      tvl: tvl.tvl,
      fees: fees.total24h,
      volume: volume.total24h
    };
  }

  export async function getSPTIndex(protocols) {
    const metrics = await Promise.all(protocols.map(p => getProtocolData(p)));
    return metrics.map(p => ({
      protocol: p.name,
      score: (p.fees + p.volume) / (p.tvl || 1)
    })).sort((a, b) => b.score - a.score);
  }
  ```

  **/server.js**

  ```js
  import express from 'express';
  import { getSPTIndex } from './data.js';

  const app = express();

  app.get('/api/spt', async (req, res) => {
    const protocols = ['uniswap', 'curve', 'aave', 'compound'];
    const data = await getSPTIndex(protocols);
    res.json(data);
  });

  app.listen(3000);
  ```

---

### **Frontend**

* **Language:** TypeScript
* **Framework:** Next.js + React
* **Styling:** TailwindCSS
* **Visualization:** Recharts or ECharts
* **Layout:**

  * Dark theme
  * Table-based ranking view
  * Simple “Protocol Card” component
  * Auto-refresh every 1–4 hours

**Example fetch:**

```js
const res = await fetch('/api/spt');
const data = await res.json();
```

---

## **4. UI Layout Overview**

### **Home Page**

* **Header:** “SPT Index Dashboard — DeFi Fundamentals Live”
* **Leaderboard Table:**

  * Columns: Protocol | SPT Score | TVL | Fees | Volume
  * Sorted by SPT Score
  * Refresh on load

### **Protocol Detail Page (Future)**

* Not included in MVP (reserved for Phase 2).
* Placeholder route with JSON response per protocol.

---

## **5. Example Output**

```json
[
  { "protocol": "Uniswap", "score": 0.0234 },
  { "protocol": "Curve", "score": 0.0181 },
  { "protocol": "Aave", "score": 0.0073 },
  { "protocol": "Compound", "score": 0.0052 }
]
```

---

## **6. MVP Deliverables**

1. **Backend Service**

   * Node.js + Express
   * DefiLlama API integration
   * `/api/spt` route returning live normalized scores

2. **Frontend**

   * Minimal Next.js app with leaderboard UI

3. **Deployment**

   * Frontend on Vercel
   * Backend on Railway or Supabase Edge

4. **Testing**

   * Manual verification of API responses
   * Comparison with raw DefiLlama metrics

---

## **7. Positioning Summary**

| Feature                 | Coingecko         | SPT Dashboard (MVP)     |
| ----------------------- | ----------------- | ----------------------- |
| Tracks token prices     | Yes               | No                      |
| Tracks on-chain metrics | Partial           | Yes                     |
| Composite scoring       | No                | Yes                     |
| Oracle dependency       | High              | None                    |
| Governance utility      | None              | Planned                 |
| Tradability             | Yes (tokens)      | No (indices only)       |
| Goal                    | Price aggregation | Performance truth layer |

---

**Summary Statement:**
The **SPT Index Dashboard (MVP)** establishes the core analytical layer for evaluating protocol fundamentals directly from verifiable on-chain data. It outputs normalized, comparable performance scores for major DeFi protocols using public DefiLlama metrics, serving as the non-tradable prototype for the future SPT-perpetual ecosystem.
