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
  const [showInfo, setShowInfo] = useState(false);

  const fetchData = async () => {
    try {
      console.log('🔍 Fetching data from Railway backend...');
      setLoading(true);
      setError(null);
      
      // Fetch from Vercel edge cache (Railway kept warm by cron)
      const API_URL = '/api/spt';
      console.log('📡 Fetching from Vercel edge cache:', API_URL);
      const res = await fetch(API_URL, {
        cache: 'default' // Use browser + Vercel edge cache
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
      const DEPLOYMENT_VERSION = '1.1.3'; // Snappy caching update
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
          const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours - data refreshes daily
          
          // Show cached data immediately for snappy UX
          setData(parsedData);
          setLastUpdated(lastUpdateTime);
          setLoading(false);
          console.log(`✅ Showing cached data (${Math.floor(cacheAge / 1000 / 60)}min old)`);
          
          // Only fetch fresh data if cache is older than 24h
          if (cacheAge > CACHE_DURATION) {
            console.log('🔄 Cache expired, fetching fresh data in background...');
            await fetchData();
          } else {
            console.log(`✨ Cache is fresh (valid for ${Math.floor((CACHE_DURATION - cacheAge) / 1000 / 60 / 60)}h more)`);
          }
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
    
    const scores24h = data.all.filter(p => p.change24h !== null);
    const positiveMovers24h = scores24h.filter(p => p.change24h! > 0).length;
    
    // Top Performers Logic
    const topByTVL = [...data.all].sort((a, b) => b.tvl - a.tvl).slice(0, 3);
    const topByFees = [...data.all].sort((a, b) => b.fees - a.fees).slice(0, 3);
    const topByVolume = [...data.all].sort((a, b) => b.volume - a.volume).slice(0, 3);
    
    // Top Gainers - protocols with biggest 24h score increase
    const topGainers = [...data.all]
      .filter(p => p.change24h !== null && p.change24h > 0)
      .sort((a, b) => (b.change24h || 0) - (a.change24h || 0))
      .slice(0, 3);

    return {
      totalTVL,
      totalFees,
      totalVolume,
      protocolCount: data.all.length,
      positiveMovers24h,
      negativeMovers24h: scores24h.length - positiveMovers24h,
      topByTVL,
      topByFees,
      topByVolume,
      topGainers
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
    <div className="min-h-screen bg-transparent">
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 border-b border-gray-200/50 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Brand */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#49997E] to-[#2c7a60] flex items-center justify-center shadow-lg shadow-[#49997E]/20 hover:scale-105 transition-transform">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <div className="flex flex-col">
                <h1 className="text-lg font-bold text-gray-900 leading-none tracking-tight">
                  SPT Index
                </h1>
                <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mt-0.5">
                  Protocol Analytics
                </span>
              </div>
            </div>

            {/* Nav Items */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/about')}
                className="px-4 py-2 rounded-full bg-gray-50/50 hover:bg-gray-100 text-gray-600 hover:text-gray-900 text-sm font-medium transition-all border border-gray-200/60 hover:border-gray-300"
              >
                About
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 sm:px-6 py-6">
        {/* Page Title & Toggle */}
        <header className="mb-8 text-center animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-gradient-dark mb-3 tracking-tight">
             DeFi Efficiency Rankings
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-2">
            <span>Measuring true protocol productivity beyond TVL.</span>
            <button 
              onClick={() => setShowInfo(!showInfo)}
              className="text-[#49997E] font-semibold hover:text-[#3d8268] hover:underline focus:outline-none flex items-center gap-1 transition-colors"
            >
              {showInfo ? 'Hide Methodology' : 'How it works'} 
              <span className={`transform transition-transform duration-200 ${showInfo ? 'rotate-180' : ''}`}>▼</span>
            </button>
          </p>

          {/* Collapsible Methodology Section */}
          <div className={`grid transition-all duration-300 ease-in-out overflow-hidden ${showInfo ? 'grid-rows-[1fr] opacity-100 mt-6' : 'grid-rows-[0fr] opacity-0 mt-0'}`}>
            <div className="min-h-0 text-left">
              <div className="bg-glass rounded-2xl p-6">
                <div className="grid md:grid-cols-3 gap-8">
                  {/* Col 1: The Philosophy */}
                  <div>
                    <div className="flex items-center gap-2 mb-3 text-[#49997E]">
                      <span className="text-xl">🎯</span>
                      <h3 className="font-bold text-gray-900">Beyond Vanity Metrics</h3>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      TVL measures capital attraction, not productivity. A protocol can show billions in TVL while most of it sits idle. 
                      <strong> SPT quantifies efficiency</strong>: actual activity and revenue generation per dollar of TVL.
                    </p>
                  </div>

                  {/* Col 2: The Method */}
                  <div>
                    <div className="flex items-center gap-2 mb-3 text-blue-600">
                      <span className="text-xl">⚖️</span>
                      <h3 className="font-bold text-gray-900">Fair Comparison</h3>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Protocols are evaluated against <strong>peer cohorts</strong>. DEXs compete with DEXs, lending platforms with lending platforms. Metrics are standardized using <strong>z-scores</strong> over 90 days, allowing small, efficient protocols to fairly compete with giants.
                    </p>
                  </div>

                  {/* Col 3: The Score */}
                  <div>
                    <div className="flex items-center gap-2 mb-3 text-amber-500">
                      <span className="text-xl">🏆</span>
                      <h3 className="font-bold text-gray-900">The SPT Score</h3>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed mb-2">
                      A composite score (0-1) rating efficiency.
                    </p>
                    <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-700 border border-gray-100">
                      <strong>Example:</strong><br/>
                      $2B TVL @ 60% util <span className="text-emerald-600 font-bold">BEATS</span><br/>
                      $10B TVL @ 10% util
                    </div>
                  </div>
                </div>
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
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-2">
                <div className="bg-glass rounded-xl p-4 sm:p-5 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-caption font-medium text-gray-500 uppercase tracking-wide">Total TVL</div>
                    <div className="text-xl sm:text-h2">🔒</div>
                  </div>
                  <div className="text-score-lg text-gray-900">{formatCurrency(metrics.totalTVL)}</div>
                  <div className="text-caption text-gray-500 mt-1 flex items-center gap-1.5">
                    <span>{metrics.protocolCount} protocols</span>
                    <span className="text-gray-300 mx-0.5">•</span>
                    <span className="text-emerald-600 font-medium text-xs">↑{metrics.positiveMovers24h}</span>
                    <span className="text-rose-600 font-medium text-xs">↓{metrics.negativeMovers24h}</span>
                  </div>
                  
                  <div className="mt-auto pt-3 border-t border-gray-100/80">
                    <div className="space-y-1.5">
                      {metrics.topByTVL.map((p, i) => (
                        <div key={p.slug} className="flex justify-between items-center text-xs">
                          <div className="flex items-center gap-1.5">
                            <span className="text-gray-400 font-medium w-3">{i + 1}</span>
                            {p.logo ? (
                              <img src={p.logo} alt={p.protocol} className="w-4 h-4 rounded-full flex-shrink-0" />
                            ) : (
                              <div className="w-4 h-4 rounded-full bg-gray-200 flex-shrink-0" />
                            )}
                            <span className="font-medium text-gray-700 truncate max-w-[60px]">{p.protocol}</span>
                          </div>
                          <span className="text-gray-500">{formatCurrency(p.tvl)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-glass rounded-xl p-4 sm:p-5 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-caption font-medium text-gray-500 uppercase tracking-wide">Top Gainers</div>
                    <div className="text-xl sm:text-h2">🚀</div>
                  </div>
                  <div className="text-score-lg text-emerald-600">
                    {metrics.topGainers[0] ? `↑${metrics.topGainers[0].change24h?.toFixed(1)}%` : 'N/A'}
                  </div>
                  <div className="text-caption text-gray-500 mt-1">24h score change</div>
                  
                  <div className="mt-auto pt-3 border-t border-gray-100/80">
                    <div className="space-y-1.5">
                      {metrics.topGainers.map((p, i) => (
                        <div key={p.slug} className="flex justify-between items-center text-xs">
                          <div className="flex items-center gap-1.5">
                            <span className="text-gray-400 font-medium w-3">{i + 1}</span>
                            {p.logo ? (
                              <img src={p.logo} alt={p.protocol} className="w-4 h-4 rounded-full flex-shrink-0" />
                            ) : (
                              <div className="w-4 h-4 rounded-full bg-gray-200 flex-shrink-0" />
                            )}
                            <span className="font-medium text-gray-700 truncate max-w-[60px]">{p.protocol}</span>
                          </div>
                          <span className="text-emerald-600 font-medium">↑{p.change24h?.toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-glass rounded-xl p-4 sm:p-5 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-caption font-medium text-gray-500 uppercase tracking-wide">24h Fees</div>
                    <div className="text-xl sm:text-h2">💵</div>
                  </div>
                  <div className="text-score-lg text-gray-900">{formatCurrency(metrics.totalFees)}</div>
                  <div className="text-caption text-gray-500 mt-1">Protocol revenue</div>
                  
                  <div className="mt-auto pt-3 border-t border-gray-100/80">
                    <div className="space-y-1.5">
                      {metrics.topByFees.map((p, i) => (
                        <div key={p.slug} className="flex justify-between items-center text-xs">
                          <div className="flex items-center gap-1.5">
                            <span className="text-gray-400 font-medium w-3">{i + 1}</span>
                            {p.logo ? (
                              <img src={p.logo} alt={p.protocol} className="w-4 h-4 rounded-full flex-shrink-0" />
                            ) : (
                              <div className="w-4 h-4 rounded-full bg-gray-200 flex-shrink-0" />
                            )}
                            <span className="font-medium text-gray-700 truncate max-w-[60px]">{p.protocol}</span>
                          </div>
                          <span className="text-gray-500">{formatCurrency(p.fees)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-glass rounded-xl p-4 sm:p-5 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-caption font-medium text-gray-500 uppercase tracking-wide">24h Volume</div>
                    <div className="text-xl sm:text-h2">📊</div>
                  </div>
                  <div className="text-score-lg text-gray-900">{formatCurrency(metrics.totalVolume)}</div>
                  <div className="text-caption text-gray-500 mt-1">Trading activity</div>
                  
                  <div className="mt-auto pt-3 border-t border-gray-100/80">
                    <div className="space-y-1.5">
                      {metrics.topByVolume.map((p, i) => (
                        <div key={p.slug} className="flex justify-between items-center text-xs">
                          <div className="flex items-center gap-1.5">
                            <span className="text-gray-400 font-medium w-3">{i + 1}</span>
                            {p.logo ? (
                              <img src={p.logo} alt={p.protocol} className="w-4 h-4 rounded-full flex-shrink-0" />
                            ) : (
                              <div className="w-4 h-4 rounded-full bg-gray-200 flex-shrink-0" />
                            )}
                            <span className="font-medium text-gray-700 truncate max-w-[60px]">{p.protocol}</span>
                          </div>
                          <span className="text-gray-500">{formatCurrency(p.volume)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
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
                    Raw metrics like volume and fees are <strong>standardized using z-scores</strong> over 90 days. This removes size bias so a small, efficient protocol can outrank a large, inefficient one.
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
