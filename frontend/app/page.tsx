'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import InfoTooltip from './components/InfoTooltip';
import ProtocolTable from './components/ProtocolTable';
import { SPTData, Protocol, SortColumn, SortDirection } from './types';
import { PROTOCOL_SLUGS, formatCurrency, formatScore, getScoreRating } from './utils';

export default function Home() {
  const router = useRouter();
  const [data, setData] = useState<SPTData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [sortColumn, setSortColumn] = useState<SortColumn>('score');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const fetchData = async () => {
    try {
      console.log('🔍 Fetching data from Railway backend...');
      setLoading(true);
      setError(null);
      
      const RAILWAY_API = 'https://spt-index-production.up.railway.app/api/spt';
      // Add cache-busting timestamp to bypass HTTP caching
      const cacheBuster = `?t=${Date.now()}`;
      console.log('📡 Fetching from:', RAILWAY_API + cacheBuster);
      const res = await fetch(RAILWAY_API + cacheBuster, {
        cache: 'no-store', // Disable Next.js caching
        headers: {
          'Cache-Control': 'no-cache' // Request fresh data from server
        }
      });
      
      console.log('📊 Response status:', res.status, res.ok);
      if (!res.ok) throw new Error('Failed to fetch data');
      const responseData = await res.json();
      console.log('✅ Data received:', {
        dex: responseData.dex?.length || 0,
        lending: responseData.lending?.length || 0,
        total: responseData.all?.length || 0
      });
      console.log('📦 Full response data:', responseData);
      console.log('📋 DEX protocols:', responseData.dex?.length);
      console.log('📋 Lending protocols:', responseData.lending?.length);
      console.log('📋 CDP protocols:', responseData.cdp?.length);
      console.log('🦄 Uniswap logo:', responseData.dex?.find((p: any) => p.slug === 'uniswap')?.logo);
      
      // Save to sessionStorage for persistence across navigation
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('spt-data', JSON.stringify(responseData));
        sessionStorage.setItem('spt-last-updated', new Date().toISOString());
        console.log('💾 Data cached to sessionStorage');
      }
      
      setData(responseData);
      const now = new Date();
      setLastUpdated(now);
      console.log('✅ State updated with data');
    } catch (err) {
      console.error('❌ Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Load cached data from sessionStorage after hydration and fetch fresh data
  useEffect(() => {
    const loadData = async () => {
      console.log('🎬 Component mounted, checking for cached data...');
      
      // Deployment version for cache invalidation
      const DEPLOYMENT_VERSION = '1.1.2'; // Force cache clear - backend data refreshed
      const cachedVersion = sessionStorage.getItem('spt-version');
      console.log(`🔧 Frontend Version: ${DEPLOYMENT_VERSION}, Cached Version: ${cachedVersion}`);
      
      // Invalidate cache if deployment version changed
      if (cachedVersion !== DEPLOYMENT_VERSION) {
        console.log(`🔄 Deployment updated (${cachedVersion} → ${DEPLOYMENT_VERSION}), clearing cache...`);
        sessionStorage.removeItem('spt-data');
        sessionStorage.removeItem('spt-last-updated');
        sessionStorage.setItem('spt-version', DEPLOYMENT_VERSION);
      }
      
      // Try to load from sessionStorage first
      const cached = sessionStorage.getItem('spt-data');
      const cachedTime = sessionStorage.getItem('spt-last-updated');
      
      if (cached && cachedTime) {
        try {
          console.log('📦 Found cached data in sessionStorage');
          const parsedData = JSON.parse(cached);
          const lastUpdateTime = new Date(cachedTime);
          const cacheAge = Date.now() - lastUpdateTime.getTime();
          const STALE_TIME = 30 * 1000; // 30 seconds - reduced for faster updates
          
          // Show cached data immediately
          setData(parsedData);
          setLastUpdated(lastUpdateTime);
          setLoading(false);
          console.log(`✅ Showing cached data (${Math.floor(cacheAge / 1000)}s old)`);
          
          // Always fetch fresh data in background to ensure latest
          console.log('🔄 Fetching fresh data in background...');
          await fetchData();
        } catch (e) {
          console.error('❌ Failed to parse cached data:', e);
          console.log('🚀 Fetching fresh data...');
          await fetchData();
        }
      } else {
        console.log('🚀 No cached data found, fetching fresh data...');
        await fetchData();
      }
    };
    
    loadData();
  }, []);

  useEffect(() => {
    console.log('📌 Data state changed:', {
      hasData: !!data,
      dexCount: data?.dex?.length || 0,
      lendingCount: data?.lending?.length || 0,
      allCount: data?.all?.length || 0
    });
  }, [data]);

  const formatChange = (change: number | null | undefined) => {
    if (change === null || change === undefined || isNaN(change)) {
      return (
        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs font-medium rounded-full">
          NEW
        </span>
      );
    }
    const isPositive = change >= 0;
    const color = isPositive ? 'text-emerald-600' : 'text-rose-600';
    const arrow = isPositive ? '▲' : '▼';
    return (
      <span className={color}>
        {arrow} {Math.abs(change).toFixed(2)}%
      </span>
    );
  };

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection(column === 'protocol' ? 'asc' : 'desc');
    }
  };

  const getAggregateMetrics = () => {
    if (!data) return null;
    
    const totalTVL = data.all.reduce((sum, p) => sum + p.tvl, 0);
    const totalFees = data.all.reduce((sum, p) => sum + p.fees, 0);
    const totalVolume = data.all.reduce((sum, p) => sum + p.volume, 0);
    const avgScore = data.all.reduce((sum, p) => sum + p.score, 0) / data.all.length;
    
    // Calculate capital efficiency: annualized fee yield
    const capitalEfficiency = totalTVL > 0 ? (totalFees / totalTVL) * 365 * 100 : 0;
    
    const scores24h = data.all.filter(p => p.change24h !== null);
    const positiveMovers24h = scores24h.filter(p => p.change24h! > 0).length;
    
    return {
      totalTVL,
      totalFees,
      totalVolume,
      capitalEfficiency,
      avgScore,
      protocolCount: data.all.length,
      positiveMovers24h,
      negativeMovers24h: scores24h.length - positiveMovers24h
    };
  };

  // Mobile Card Component - REMOVED (Moved to components/MobileProtocolCard.tsx)

  // Desktop Table Component - REMOVED (Moved to components/ProtocolTable.tsx)

  const metrics = getAggregateMetrics();
  
  // Debug: Log render state
  console.log('🎨 Rendering page:', { 
    loading, 
    error, 
    hasData: !!data, 
    hasMetrics: !!metrics,
    protocolCount: metrics?.protocolCount || 0
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 py-3">
          {/* Mobile Layout */}
          <div className="flex md:hidden justify-between items-center">
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-[#49997E] via-[#5eb896] to-[#49997E] bg-clip-text text-transparent">
                SPT Index
              </h1>
              <p className="text-[10px] text-gray-500">Protocol Performance Analytics</p>
            </div>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-600 hover:text-[#49997E] transition-colors"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-3 pt-3 border-t border-gray-200 space-y-3">
              {data?._metadata && (
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg text-sm">
                  <div className={`w-2 h-2 rounded-full ${data._metadata.cached ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                  <span className="text-caption text-gray-600 font-medium">
                    {data._metadata.cached ? `Cached (${data._metadata.cacheAge}s)` : 'Live'}
                  </span>
                </div>
              )}
              {lastUpdated && (
                <div className="text-caption text-gray-500 px-3">
                  Updated: {lastUpdated.toLocaleTimeString()}
                </div>
              )}
              <button
                onClick={() => {
                  router.push('/about');
                  setMobileMenuOpen(false);
                }}
                className="w-full px-3 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-caption font-medium transition-all"
              >
                About SPT Index
              </button>
              <button
                onClick={() => {
                  fetchData();
                  setMobileMenuOpen(false);
                }}
                disabled={loading}
                className="w-full px-3 py-2 bg-gradient-to-r from-[#49997E] to-[#5eb896] hover:from-[#3d8268] hover:to-[#49997E] text-white rounded-lg text-caption font-medium transition-all disabled:opacity-50 shadow-sm"
              >
                {loading ? 'Loading...' : 'Refresh Data'}
              </button>
            </div>
          )}

          {/* Desktop Layout */}
          <div className="hidden md:flex justify-between items-center">
            <div>
              <h1 className="text-h3 font-bold bg-gradient-to-r from-[#49997E] via-[#5eb896] to-[#49997E] bg-clip-text text-transparent">
                SPT Index
              </h1>
              <p className="text-caption text-gray-500">Protocol Performance Analytics</p>
            </div>
            <div className="flex items-center gap-4">
              {data?._metadata && (
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                  <div className={`w-2 h-2 rounded-full ${data._metadata.cached ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                  <span className="text-caption text-gray-600 font-medium">
                    {data._metadata.cached ? `Cached (${data._metadata.cacheAge}s)` : 'Live'}
                  </span>
                </div>
              )}
              {lastUpdated && (
                <span className="text-caption text-gray-500">
                  {lastUpdated.toLocaleString()}
                </span>
              )}
              <button
                onClick={() => router.push('/about')}
                className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-caption font-medium transition-all"
              >
                About
              </button>
              <button
                onClick={() => fetchData()}
                disabled={loading}
                className="px-4 py-2 bg-gradient-to-r from-[#49997E] to-[#5eb896] hover:from-[#3d8268] hover:to-[#49997E] text-white rounded-lg text-caption font-medium transition-all disabled:opacity-50 shadow-sm"
              >
                {loading ? 'Loading...' : 'Refresh Data'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 sm:px-6 py-6">
        {/* Page Title & Description */}
        <header className="mb-6">
          <h2 className="text-h1 text-gray-900 mb-2">Beyond TVL: A Performance-Based Scoreboard</h2>
          <p className="text-body text-gray-600 mb-3">
            TVL measures capital attraction, not productivity. A protocol can show billions in TVL while most of it sits idle or is recursively looped to inflate on-chain optics. 
            <strong> SPT quantifies what TVL hides</strong>: actual activity, efficiency, and revenue generation.
          </p>
          
          {/* Mobile-optimized explanation boxes */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 space-y-3">
            <div>
              <h3 className="text-body font-bold text-blue-900 mb-1.5">How SPT Works</h3>
              <p className="text-body-sm text-gray-700 mb-2">
                Each protocol is evaluated against <strong>peer cohorts in the same category</strong>—DEXs compete with DEXs, lending platforms with lending platforms. 
                Metrics are standardized over a 90-day window using z-scores, enabling fair comparison across sizes and conditions.
              </p>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="bg-white rounded-lg p-3 border border-blue-100">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-lg">🏆</span>
                  <span className="text-body-sm font-bold text-gray-900">SPT Score</span>
                </div>
                <p className="text-body-sm text-gray-700">
                  Cross-protocol ranking. A smaller, efficient protocol can outrank a larger, underperforming one.
                </p>
                <p className="text-caption text-gray-600 mt-1 italic">
                  Example: $2B TVL at 60% utilization beats $10B at 10% utilization.
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-3 border border-blue-100">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-lg">📈</span>
                  <span className="text-body-sm font-bold text-gray-900">Trend</span>
                </div>
                <p className="text-body-sm text-gray-700">
                  Self-comparison. Is this protocol's efficiency improving or declining vs. its own 90-day baseline?
                </p>
                <p className="text-caption text-gray-600 mt-1 italic">
                  Shows operational momentum, not just static rank.
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Error State */}
        {error && (
          <div className="bg-rose-50 border border-rose-300 text-rose-800 px-4 sm:px-6 py-4 rounded-lg mb-6">
            <p className="font-semibold">Error loading data:</p>
            <p className="text-sm">{error}</p>
            <p className="text-sm mt-2">Make sure the backend API is running and accessible</p>
          </div>
        )}

        {/* Loading State */}
        {loading && !error && !data && (
          <div className="flex flex-col justify-center items-center py-20 space-y-4">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#49997E]"></div>
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-700">Fetching Protocol Data...</p>
              <p className="text-sm text-gray-500 mt-1">This may take a few seconds</p>
            </div>
          </div>
        )}
        
        {/* Background Refresh Indicator */}
        {loading && data && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6 flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-600"></div>
            <div>
              <p className="text-sm font-medium text-blue-900">Refreshing data in background...</p>
              <p className="text-xs text-blue-700">Showing cached data while fetching latest information</p>
            </div>
          </div>
        )}

        {/* Executive Summary - KPI Cards */}
        {!error && data && metrics && (
          <div className="animate-fade-in">
            <section className="mb-8">
              <h3 className="text-label font-semibold text-gray-500 uppercase tracking-wider mb-3">Market Overview</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-2">
                <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-caption font-medium text-gray-500 uppercase tracking-wide">Total Protocols</div>
                    <div className="text-xl sm:text-h2">📊</div>
                  </div>
                  <div className="text-score-lg text-gray-900">{metrics.protocolCount}</div>
                  <div className="text-caption text-gray-500 mt-1">
                    <span className="text-emerald-600">↑ {metrics.positiveMovers24h}</span>
                    {' • '}
                    <span className="text-rose-600">↓ {metrics.negativeMovers24h}</span>
                    <span className="text-gray-400"> (24h)</span>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-caption font-medium text-gray-500 uppercase tracking-wide">Capital Efficiency</div>
                    <div className="text-xl sm:text-h2">⚡</div>
                  </div>
                  <div className="text-score-lg text-[#49997E]">{metrics.capitalEfficiency.toFixed(2)}%</div>
                  <div className="text-caption text-gray-500 mt-1">Annualized fee yield</div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-caption font-medium text-gray-500 uppercase tracking-wide">24h Fees</div>
                    <div className="text-xl sm:text-h2">💵</div>
                  </div>
                  <div className="text-score-lg text-gray-900">{formatCurrency(metrics.totalFees)}</div>
                  <div className="text-caption text-gray-500 mt-1">Protocol revenue</div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-caption font-medium text-gray-500 uppercase tracking-wide">24h Volume</div>
                    <div className="text-xl sm:text-h2">📊</div>
                  </div>
                  <div className="text-score-lg text-gray-900">{formatCurrency(metrics.totalVolume)}</div>
                  <div className="text-caption text-gray-500 mt-1">Trading activity</div>
                </div>
              </div>
            </section>

            {/* Protocol Rankings */}
            <section>
              <h3 className="text-label font-semibold text-gray-500 uppercase tracking-wider mb-4">Protocol Rankings</h3>
              
              <ProtocolTable
                protocols={data.dex}
                title="DEX Protocols"
                description="Ranked by capital efficiency: volume turnover (40%), capital efficiency ratio (30%), fee generation (20%), growth momentum (10%)"
                icon="🔄"
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onSort={handleSort}
              />
              
              <ProtocolTable
                protocols={data.lending}
                title="Lending Protocols"
                description="Ranked by utilization: borrow demand (40%), vanilla asset supply (25%), utilization rate (20%), fee revenue (15%)"
                icon="💰"
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onSort={handleSort}
              />
              
              {data.cdp && data.cdp.length > 0 && (
                <ProtocolTable
                  protocols={data.cdp}
                  title="CDP Protocols (Stablecoins)"
                  description="Ranked by stablecoin adoption: minted supply (40%), blue-chip collateral (30%), utilization (20%), fees (10%)"
                  icon="🏦"
                  sortColumn={sortColumn}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                />
              )}
              
              {data['liquid-staking'] && data['liquid-staking'].length > 0 && (
                <ProtocolTable
                  protocols={data['liquid-staking']}
                  title="Liquid Staking Protocols"
                  description="Ranked by staking dominance: total value staked (50%), fee revenue (25%), staking activity (15%), TVL growth (10%)"
                  icon="💎"
                  sortColumn={sortColumn}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                />
              )}
            </section>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && data && data.all.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <p className="text-xl">No protocol data available</p>
          </div>
        )}

        {/* Research Methodology - Mobile optimized */}
        <section className="mt-12 mb-8">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Methodology</h3>
          
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-[#49997E]/10 to-blue-50 px-4 sm:px-6 py-4 border-b border-gray-200">
              <h4 className="text-lg sm:text-xl font-bold text-gray-900">How We Calculate SPT Scores</h4>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                A three-step process that turns raw on-chain data into fair, category-specific performance scores
              </p>
            </div>

            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
                {/* Step 1 */}
                <div className="border-l-4 border-[#49997E] pl-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-[#49997E] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
                    <h5 className="font-bold text-gray-900 text-sm">Level the Playing Field</h5>
                    <InfoTooltip 
                      content="z-score normalization converts raw metrics to standard deviations from mean. a $10M protocol and $10B protocol can be compared fairly based on efficiency, not just size."
                      position="bottom"
                      maxWidth="600px"
                    />
                  </div>
                  <p className="text-xs text-gray-600 mb-3">
                    Raw metrics like volume and fees are <strong>standardized using z-scores</strong> over 90 days. This removes size bias—a small, efficient protocol can outrank a large, inefficient one.
                  </p>
                  <div className="bg-gray-50 rounded p-2 text-xs text-gray-700">
                    <div className="font-mono mb-1">z = (x - μ) / σ</div>
                    <div className="text-gray-600">Measures how many standard deviations above/below average</div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="border-l-4 border-blue-500 pl-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
                    <h5 className="font-bold text-gray-900 text-sm">Weight What Matters</h5>
                    <InfoTooltip 
                      content="different protocol types have different success metrics. dexs optimize for volume turnover, lending for borrow demand, cdps for stablecoin adoption. weights reflect what drives value in each category."
                      position="bottom"
                      maxWidth="600px"
                    />
                  </div>
                  <p className="text-xs text-gray-600 mb-3">
                    Each category uses <strong>custom weights</strong> for what matters most. DEXs are judged on capital efficiency, lending on borrow demand, CDPs on stablecoin minting.
                  </p>
                  <div className="space-y-1.5 text-xs">
                    <div className="bg-blue-50 rounded px-2 py-1.5">
                      <div className="font-semibold text-gray-700">DEX Performance</div>
                      <div className="text-gray-600">Volume 40% • Cap Efficiency 30% • Fees 20% • Growth 10%</div>
                    </div>
                    <div className="bg-emerald-50 rounded px-2 py-1.5">
                      <div className="font-semibold text-gray-700">Lending Performance</div>
                      <div className="text-gray-600">Borrows 40% • Vanilla Assets 25% • Utilization 20% • Fees 15%</div>
                    </div>
                    <div className="bg-purple-50 rounded px-2 py-1.5">
                      <div className="font-semibold text-gray-700">CDP Performance</div>
                      <div className="text-gray-600">Minted 40% • Blue-chip Collateral 30% • Util 20% • Fees 10%</div>
                    </div>
                    <div className="bg-indigo-50 rounded px-2 py-1.5">
                      <div className="font-semibold text-gray-700">Liquid Staking Performance</div>
                      <div className="text-gray-600">TVL 50% • Fees 25% • Activity 15% • Growth 10%</div>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="border-l-4 border-amber-500 pl-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
                    <h5 className="font-bold text-gray-900 text-sm">Grade on a Curve</h5>
                    <InfoTooltip 
                      content="final scores are rated aaa to b, like credit ratings. compares each protocol to its category peers, not the entire market. a top dex and top lender both get high scores despite different business models."
                      position="bottom"
                      maxWidth="600px"
                    />
                  </div>
                  <p className="text-xs text-gray-600 mb-3">
                    Scores are <strong>ranked within categories</strong>, like grading on a curve. DEXs compete with DEXs, not lenders. Ratings (AAA to B) show where each protocol stands among peers.
                  </p>
                  <div className="bg-gray-50 rounded p-2 text-xs text-gray-700 space-y-1">
                    <div className="font-semibold text-[#49997E]">AAA: Top 10% performers</div>
                    <div className="text-gray-600">Consistently high efficiency, strong fundamentals</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-8 border-t border-gray-200 pt-6">
          <div className="text-center text-xs text-gray-400 mb-3">
            © 2025 SPT Index • Protocol Performance Analytics • Updated {lastUpdated?.toLocaleDateString()}
          </div>
          <div className="text-center">
            <span className="text-sm font-bold text-gray-700">powered by exagroup.xyz</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
