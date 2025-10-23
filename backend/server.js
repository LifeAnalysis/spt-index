import express from 'express';
import compression from 'compression';
import crypto from 'crypto';
import cron from 'node-cron';
import { getSPTIndex } from './data.js';
import { getProtocolDetail } from './protocolDetail.js';
import { exportToCSV, exportSummaryCSV } from './csvExport.js';
import Cache from './cache.js';

const app = express();
const PORT = process.env.PORT || 3000; // Use Railway's PORT or default to 3000
const CACHE_TTL_MINUTES = 1440; // Cache for 24 hours (1440 minutes)
const PROTOCOL_CACHE_TTL_MINUTES = 1440; // Cache for 24 hours

// Protocol list for SPT Index
const PROTOCOLS = [
  // DEXs - Ethereum
  'uniswap', 
  'curve-dex', 
  'sushiswap',
  'balancer',
  // DEXs - Multi-chain
  'pancakeswap',
  // DEXs - Solana
  'raydium',
  'orca',
  // DEXs - Other L2s/Chains
  'trader-joe',
  'quickswap',
  'aerodrome',
  // Lending - Ethereum
  'aave', 
  'compound-v3',
  'makerdao',
  'morpho',
  'spark',
  // Lending - Other Chains
  'justlend',
  'venus',
  'radiant',
  'benqi'
];

// Initialize caches
const cache = new Cache(CACHE_TTL_MINUTES);
const protocolCache = new Cache(PROTOCOL_CACHE_TTL_MINUTES);

// Helper function to generate ETag from data
function generateETag(data) {
  const hash = crypto.createHash('md5');
  hash.update(JSON.stringify(data));
  return `"${hash.digest('hex')}"`;
}

// Enable response compression (Gzip/Deflate)
app.use(compression({
  level: 6, // Balance between speed and compression ratio
  threshold: 1024, // Only compress responses > 1KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

// Enable CORS for local development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, If-None-Match');
  res.header('Access-Control-Expose-Headers', 'ETag, Cache-Control');
  next();
});

app.get('/api/spt', async (req, res) => {
  try {
    const CACHE_KEY = 'spt_index';
    
    // Check cache first
    const cached = cache.get(CACHE_KEY);
    if (cached) {
      const cacheAge = cache.getAge(CACHE_KEY);
      const responseData = {
        ...cached,
        _metadata: {
          cached: true,
          cacheAge: cacheAge,
          cacheTTL: CACHE_TTL_MINUTES * 60
        }
      };
      
      // Generate ETag
      const etag = generateETag(responseData);
      
      // Check if client has current version (conditional request)
      if (req.headers['if-none-match'] === etag) {
        console.log(`✅ Client has current version (304 Not Modified)`);
        res.status(304).end();
        return;
      }
      
      // Set cache headers
      res.set({
        'ETag': etag,
        'Cache-Control': `public, max-age=${CACHE_TTL_MINUTES * 60}, stale-while-revalidate=${CACHE_TTL_MINUTES * 60}`,
        'Vary': 'Accept-Encoding'
      });
      
      console.log(`✅ Serving cached data (age: ${cacheAge}s)`);
      res.json(responseData);
      return;
    }

    // Fetch fresh data
    console.log('🔄 Fetching fresh SPT Index data...');
    const data = await getSPTIndex(PROTOCOLS);
    console.log(`✅ Successfully fetched: ${data.dex.length} DEXs, ${data.lending.length} Lending protocols`);
    
    // Export summary to CSV (async, don't wait)
    exportSummaryCSV(data.all).catch(err => 
      console.error('Failed to export summary CSV:', err.message)
    );
    
    // Cache the result
    cache.set(CACHE_KEY, data);
    
    const responseData = {
      ...data,
      _metadata: {
        cached: false,
        cacheAge: 0,
        cacheTTL: CACHE_TTL_MINUTES * 60
      }
    };
    
    // Generate ETag and set cache headers
    const etag = generateETag(responseData);
    res.set({
      'ETag': etag,
      'Cache-Control': `public, max-age=${CACHE_TTL_MINUTES * 60}, stale-while-revalidate=${CACHE_TTL_MINUTES * 60}`,
      'Vary': 'Accept-Encoding'
    });
    
    res.json(responseData);
  } catch (error) {
    console.error('❌ Error in /api/spt:', error);
    res.status(500).json({ error: 'Failed to fetch SPT index data' });
  }
});

app.get('/health', (req, res) => {
  // Health endpoint doesn't need aggressive caching
  res.set('Cache-Control', 'public, max-age=30');
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Force refresh endpoint - clears cache and fetches fresh data
app.post('/api/spt/refresh', async (req, res) => {
  try {
    console.log('🔄 Force refresh requested - clearing cache...');
    cache.clear();
    
    const protocols = [
      // DEXs - Ethereum
      'uniswap', 
      'curve-dex', 
      'sushiswap',
      'balancer',
      // DEXs - Multi-chain
      'pancakeswap',
      // DEXs - Solana
      'raydium',
      'orca',
      // DEXs - Other L2s/Chains
      'trader-joe',
      'quickswap',
      'aerodrome',
      // Lending - Ethereum
      'aave', 
      'compound-v3',
      'makerdao',
      'morpho',
      'spark',
      // Lending - Other Chains
      'justlend',
      'venus',
      'radiant',
      'benqi'
    ];
    const data = await getSPTIndex(protocols);
    
    // Export summary to CSV (async, don't wait)
    exportSummaryCSV(data.all).catch(err =>
      console.error('Failed to export summary CSV:', err.message)
    );
    
    cache.set('spt_index', data);
    
    console.log(`✅ Cache refreshed: ${data.dex.length} DEXs, ${data.lending.length} Lending protocols`);
    res.json({
      ...data,
      _metadata: {
        cached: false,
        cacheAge: 0,
        cacheTTL: CACHE_TTL_MINUTES * 60
      }
    });
  } catch (error) {
    console.error('❌ Error refreshing cache:', error);
    res.status(500).json({ error: 'Failed to refresh data' });
  }
});

// Individual protocol detail endpoint with historical data
app.get('/api/protocol/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const CACHE_KEY = `protocol_${slug}`;
    
    // Check cache first
    const cached = protocolCache.get(CACHE_KEY);
    if (cached) {
      const cacheAge = protocolCache.getAge(CACHE_KEY);
      const responseData = {
        ...cached,
        _metadata: {
          cached: true,
          cacheAge,
          cacheTTL: PROTOCOL_CACHE_TTL_MINUTES * 60
        }
      };
      
      // Generate ETag
      const etag = generateETag(responseData);
      
      // Check if client has current version (conditional request)
      if (req.headers['if-none-match'] === etag) {
        console.log(`✅ Client has current version of ${slug} (304 Not Modified)`);
        res.status(304).end();
        return;
      }
      
      // Set cache headers (longer TTL for protocol details)
      res.set({
        'ETag': etag,
        'Cache-Control': `public, max-age=${PROTOCOL_CACHE_TTL_MINUTES * 60}, stale-while-revalidate=${PROTOCOL_CACHE_TTL_MINUTES * 60}`,
        'Vary': 'Accept-Encoding'
      });
      
      console.log(`✅ Serving cached protocol data for ${slug} (age: ${cacheAge}s)`);
      return res.json(responseData);
    }
    
    // Fetch fresh data
    console.log(`🔄 Fetching protocol detail for ${slug}...`);
    const data = await getProtocolDetail(slug);
    
    // Export to CSV (async, don't wait)
    exportToCSV(slug, data.history).catch(err => 
      console.error(`Failed to export CSV for ${slug}:`, err.message)
    );
    
    // Cache the result
    protocolCache.set(CACHE_KEY, data);
    
    const responseData = {
      ...data,
      _metadata: {
        cached: false,
        cacheAge: 0,
        cacheTTL: PROTOCOL_CACHE_TTL_MINUTES * 60
      }
    };
    
    // Generate ETag and set cache headers
    const etag = generateETag(responseData);
    res.set({
      'ETag': etag,
      'Cache-Control': `public, max-age=${PROTOCOL_CACHE_TTL_MINUTES * 60}, stale-while-revalidate=${PROTOCOL_CACHE_TTL_MINUTES * 60}`,
      'Vary': 'Accept-Encoding'
    });
    
    console.log(`✅ Fetched ${slug}: ${data.history.length} historical data points`);
    res.json(responseData);
  } catch (error) {
    console.error(`❌ Error fetching protocol ${req.params.slug}:`, error);
    res.status(404).json({ error: 'Protocol not found' });
  }
});

// Background data refresh function
async function refreshSPTData() {
  const CACHE_KEY = 'spt_index';
  
  try {
    console.log('🔄 [CRON] Refreshing SPT Index data...');
    const data = await getSPTIndex(PROTOCOLS);
    
    // Export to CSV
    await exportSummaryCSV(data.all).catch(err => 
      console.error('[CRON] Failed to export summary CSV:', err.message)
    );
    
    // Update cache
    cache.set(CACHE_KEY, data);
    
    const timestamp = new Date().toISOString();
    console.log(`✅ [CRON] Data refreshed successfully at ${timestamp} - ${data.all.length} protocols`);
  } catch (error) {
    console.error('❌ [CRON] Failed to refresh data:', error.message);
  }
}

// Schedule automatic data refresh once daily at 2 AM
// This ensures fresh data is available each day
cron.schedule('0 2 * * *', () => {
  refreshSPTData();
});

app.listen(PORT, async () => {
  console.log(`SPT Backend API running on http://localhost:${PORT}`);
  console.log(`Endpoint: http://localhost:${PORT}/api/spt`);
  console.log(`Cache TTL: ${CACHE_TTL_MINUTES} minutes (24 hours)`);
  console.log('🔄 Auto-refresh: Daily at 2:00 AM');
  
  // Warm cache on startup
  console.log('🚀 Warming cache on startup...');
  await refreshSPTData();
});

