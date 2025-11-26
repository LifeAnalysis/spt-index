'use client';

import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, BarChart, Bar, Cell, ReferenceLine } from 'recharts';
import InfoTooltip from '../../components/InfoTooltip';
import { ProtocolDetail } from '../../types';
import { formatCurrency, getScoreRating } from '../../utils';

export default function ProtocolDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  
  const [data, setData] = useState<ProtocolDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [showMomentum, setShowMomentum] = useState(false);
  const [etag, setEtag] = useState<string | null>(null);
  const [categoryAvg, setCategoryAvg] = useState<number | null>(null);

  useEffect(() => {
    const loadProtocolData = async () => {
      // Try to load from cache first
      const cacheKey = `protocol-${slug}`;
      const cached = sessionStorage.getItem(cacheKey);
      const cachedTime = sessionStorage.getItem(`${cacheKey}-time`);
      
      if (cached && cachedTime) {
        try {
          const parsedData = JSON.parse(cached);
          const cacheAge = Date.now() - parseInt(cachedTime);
          const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
          
          // Show cached data immediately
          setData(parsedData);
          setLoading(false);
          console.log(`✅ Showing cached ${slug} data (${Math.floor(cacheAge / 1000 / 60)}min old)`);
          
          // Only fetch if cache expired
          if (cacheAge > CACHE_DURATION) {
            console.log('🔄 Cache expired, fetching fresh data...');
            await fetchProtocolDetail();
          }
          return;
        } catch (e) {
          console.error('Failed to parse cached protocol data:', e);
        }
      }
      
      // No cache, fetch fresh data
      await fetchProtocolDetail();
    };
    
    loadProtocolData();
  }, [slug]);

  const fetchProtocolDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`Fetching protocol ${slug} from Vercel edge cache...`);
      
      // Reuse cached SPT index data if available
      const cachedIndex = sessionStorage.getItem('spt-data');
      let indexData;
      
      if (cachedIndex) {
        try {
          indexData = JSON.parse(cachedIndex);
          console.log('✅ Reusing cached SPT index data');
        } catch (e) {
          indexData = null;
        }
      }
      
      // Fetch from Vercel edge cache (Railway kept warm by cron)
      const detailRes = await fetch(`/api/protocol/${slug}`, { 
        cache: 'default' // Use browser + Vercel edge cache
      });
      
      if (!detailRes.ok) {
        if (detailRes.status === 404) {
          throw new Error('Protocol not found');
        }
        throw new Error('Failed to fetch protocol data');
      }
      
      const detailData = await detailRes.json();
      
      // Fetch index data only if not cached
      if (!indexData) {
        const indexRes = await fetch('/api/spt', {
          cache: 'default' // Use browser + Vercel edge cache
        });
        if (!indexRes.ok) throw new Error('Failed to fetch SPT index');
        indexData = await indexRes.json();
      }
      
      const allProtocols = [...(indexData.dex || []), ...(indexData.lending || []), ...(indexData.cdp || []), ...(indexData['liquid-staking'] || [])];
      const cohortData = allProtocols.find((p: any) => p.slug === slug);
      
      // Calculate category average
      let categoryProtocols = [];
      if (detailData.type === 'dex') categoryProtocols = indexData.dex || [];
      else if (detailData.type === 'lending') categoryProtocols = indexData.lending || [];
      else if (detailData.type === 'cdp') categoryProtocols = indexData.cdp || [];
      else if (detailData.type === 'liquid-staking') categoryProtocols = indexData['liquid-staking'] || [];
      
      if (categoryProtocols.length > 0) {
        const avg = categoryProtocols.reduce((sum: number, p: any) => sum + p.score, 0) / categoryProtocols.length;
        setCategoryAvg(avg);
      }
      
      const mergedData = {
        ...detailData,
        current: {
          ...detailData.current,
          score: cohortData?.score || detailData.current.score,
          change24h: cohortData?.change24h || detailData.current.change24h,
          change7d: cohortData?.change7d || detailData.current.change7d,
          change30d: cohortData?.change30d || detailData.current.change30d,
          momentum: cohortData?.momentum || detailData.current.momentum
        }
      };
      
      // Cache the protocol data
      const cacheKey = `protocol-${slug}`;
      sessionStorage.setItem(cacheKey, JSON.stringify(mergedData));
      sessionStorage.setItem(`${cacheKey}-time`, Date.now().toString());
      
      console.log(`✅ Successfully loaded ${slug} data`);
      setData(mergedData);
    } catch (err) {
      console.error('Error fetching protocol data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatChange = (change: number | null | undefined) => {
    if (change === null || change === undefined || isNaN(change)) return 'N/A';
    const isPositive = change >= 0;
    const arrow = isPositive ? '↑' : '↓';
    return `${arrow} ${Math.abs(change).toFixed(2)}%`;
  };

  const chartData = useMemo(() => {
    if (!data?.history) return [];
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const cutoff = Date.now() / 1000 - (days * 86400);
    return data.history
      .filter(point => point.timestamp >= cutoff)
      .map(point => ({
        ...point,
        dateStr: point.date
      }));
  }, [data, timeRange]);

  const periodMax = useMemo(() => {
    if (chartData.length === 0) return 0;
    return Math.max(...chartData.map(d => d.score));
  }, [chartData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#49997E]"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="text-4xl mb-4">😕</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Protocol Not Found</h2>
        <button onClick={() => router.push('/')} className="text-[#49997E] hover:underline">
          Back to Dashboard
            </button>
      </div>
    );
  }

  const rating = data?.current?.score !== undefined ? getScoreRating(data.current.score) : { label: 'N/A', color: 'text-gray-500 bg-gray-100' };

  // Helper to get metric weights based on type
  const getWeights = () => {
    if (data.type === 'dex') {
      return [
        { name: 'Volume', value: 40, color: '#3b82f6' },
        { name: 'Efficiency', value: 30, color: '#8b5cf6' },
        { name: 'Revenue', value: 20, color: '#10b981' },
        { name: 'Growth', value: 10, color: '#f59e0b' }
      ];
    } else if (data.type === 'cdp') {
      return [
        { name: 'Minting', value: 40, color: '#3b82f6' },
        { name: 'Collateral', value: 25, color: '#8b5cf6' },
        { name: 'Util', value: 20, color: '#f59e0b' },
        { name: 'Revenue', value: 15, color: '#10b981' }
      ];
    } else if (data.type === 'liquid-staking') {
      return [
        { name: 'TVL', value: 50, color: '#3b82f6' },
        { name: 'Revenue', value: 25, color: '#10b981' },
        { name: 'Activity', value: 15, color: '#8b5cf6' },
        { name: 'Growth', value: 10, color: '#f59e0b' }
      ];
    } else {
      return [
        { name: 'Borrow', value: 40, color: '#3b82f6' },
        { name: 'Vanilla', value: 25, color: '#8b5cf6' },
        { name: 'Util', value: 20, color: '#f59e0b' },
        { name: 'Revenue', value: 15, color: '#10b981' }
      ];
    }
  };

  const weights = getWeights();

  return (
    <div className="min-h-screen bg-transparent">
      <nav className="sticky top-0 z-50 border-b border-gray-200/50 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Left: Back + Brand */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100/50 hover:bg-gray-200/50 text-gray-500 hover:text-gray-900 transition-colors"
              >
                ←
              </button>
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/')}>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#49997E] to-[#2c7a60] flex items-center justify-center shadow-lg shadow-[#49997E]/20 hover:scale-105 transition-transform">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
                <div className="hidden sm:flex flex-col">
                  <h1 className="text-lg font-bold text-gray-900 leading-none tracking-tight">
                    SPT Index
                  </h1>
                  <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mt-0.5">
                    Protocol Analytics
                  </span>
                </div>
              </div>
            </div>

            {/* Right: About */}
            <button
              onClick={() => router.push('/about')}
              className="px-4 py-2 rounded-full bg-gray-50/50 hover:bg-gray-100 text-gray-600 hover:text-gray-900 text-sm font-medium transition-all border border-gray-200/60 hover:border-gray-300"
            >
              About
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 sm:px-6 py-8 max-w-[1400px]">
        
        {/* HEADER SECTION - Compact for better mobile hierarchy */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-start gap-4">
            <div className="flex items-center gap-4">
              {data.logo && (
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gray-50 border border-gray-100 p-1 flex-shrink-0 shadow-sm">
                  <img 
                    src={data.logo} 
                    alt={`${data.name} logo`} 
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
              )}
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">{data.name}</h1>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider ${
                    data.type === 'dex' ? 'bg-blue-50 text-blue-700' : 
                    data.type === 'lending' ? 'bg-green-50 text-green-700' : 
                    data.type === 'liquid-staking' ? 'bg-amber-50 text-amber-700' : 'bg-purple-50 text-purple-700'
                  }`}>
                    {data.type === 'dex' ? 'DEX' : 
                     data.type === 'lending' ? 'Lending' : 
                     data.type === 'liquid-staking' ? 'Liquid Staking' : 'CDP'}
                  </span>
                </div>
                
                {(data.website || data.twitter) && (
                  <div className="flex items-center gap-3">
                    {data.website && (
                      <a 
                        href={data.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-[#49997E] hover:text-[#3d8268] font-medium flex items-center gap-1 hover:underline"
                      >
                        <span>🌐</span> Website
                      </a>
                    )}
                    {data.twitter && (
                      <a 
                        href={data.twitter.startsWith('http') ? data.twitter : `https://twitter.com/${data.twitter.replace('@', '')}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-[#49997E] hover:text-[#3d8268] font-medium flex items-center gap-1 hover:underline"
                      >
                        <span>🐦</span> Twitter
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>

            {data.description && (
              <p className="text-sm text-gray-600 leading-relaxed max-w-3xl hidden sm:block md:mt-1">
                {data.description}
              </p>
            )}
          </div>
          {/* Mobile description only */}
          {data.description && (
            <p className="text-sm text-gray-600 leading-relaxed sm:hidden">
              {data.description}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          
          {/* MAIN CONTENT */}
          <main className="lg:col-span-8 xl:col-span-9 space-y-6 lg:order-2">
            
            {/* BENTO GRID - Score & Key Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* 1. Score Card (Primary) */}
              <div className="lg:col-span-5 bg-white rounded-3xl border border-gray-200 shadow-lg p-6 flex flex-col justify-center relative overflow-hidden bg-gradient-to-br from-[#49997E]/5 to-transparent">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                  SPT Score
                  <InfoTooltip content="Composite score (0-1) based on weighted, normalized metrics." position="right" />
                </div>
                <div className="flex items-baseline gap-3 mb-4">
                  <span className="text-5xl sm:text-6xl font-black text-[#49997E] tracking-tight">
                    {data?.current?.score !== undefined ? data.current.score.toFixed(4) : 'N/A'}
                  </span>
                  <span className={`px-3 py-1 rounded-lg text-lg font-bold ${rating.color}`}>
                    {rating.label}
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-white/60 w-fit px-3 py-1.5 rounded-lg backdrop-blur-sm border border-gray-100">
                   <span className={`text-sm font-bold ${data.current.change30d && data.current.change30d >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {formatChange(data.current.change30d)}
                   </span>
                   <span className="text-xs text-gray-500 font-medium">vs 30d avg</span>
                </div>
              </div>

              {/* 2. Key Metrics Grid (Context) */}
              <div className="lg:col-span-7 grid grid-cols-2 gap-3 sm:gap-4">
                {/* TVL */}
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
                   <div className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Total TVL</div>
                   <div className="text-lg sm:text-xl font-bold text-gray-900">{formatCurrency(data.current.tvl)}</div>
                   {data.historicalMetrics && (
                      <div className={`text-[10px] sm:text-xs font-bold flex items-center gap-1 mt-1 ${
                        data.current.tvl >= (data.historicalMetrics.tvl.reduce((a, b) => a + b, 0) / data.historicalMetrics.tvl.length)
                          ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {data.current.tvl >= (data.historicalMetrics.tvl.reduce((a, b) => a + b, 0) / data.historicalMetrics.tvl.length) ? '↑' : '↓'}
                        {Math.abs(((data.current.tvl / (data.historicalMetrics.tvl.reduce((a, b) => a + b, 0) / data.historicalMetrics.tvl.length)) - 1) * 100).toFixed(1)}% vs avg
                      </div>
                   )}
                </div>

                {/* Fees */}
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
                   <div className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">24h Fees</div>
                   <div className="text-lg sm:text-xl font-bold text-gray-900">{formatCurrency(data.current.fees)}</div>
                   {data.historicalMetrics && (
                      <div className={`text-[10px] sm:text-xs font-bold flex items-center gap-1 mt-1 ${
                        data.current.fees >= (data.historicalMetrics.fees.reduce((a, b) => a + b, 0) / data.historicalMetrics.fees.length)
                          ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {data.current.fees >= (data.historicalMetrics.fees.reduce((a, b) => a + b, 0) / data.historicalMetrics.fees.length) ? '↑' : '↓'}
                        {Math.abs(((data.current.fees / (data.historicalMetrics.fees.reduce((a, b) => a + b, 0) / data.historicalMetrics.fees.length)) - 1) * 100).toFixed(1)}% vs avg
                      </div>
                   )}
                </div>

                {/* Activity (Vol or Util) */}
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
                  {(data.type === 'dex' || data.type === 'liquid-staking') ? (
                    <>
                      <div className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">24h Volume</div>
                      <div className="text-lg sm:text-xl font-bold text-gray-900">{formatCurrency(data.current.volume)}</div>
                    </>
                  ) : (
                    <>
                      <div className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Utilization</div>
                      <div className="text-lg sm:text-xl font-bold text-gray-900">
                        {data.current.lendingMetrics ? `${data.current.lendingMetrics.utilization.toFixed(1)}%` : 'N/A'}
                      </div>
                    </>
                  )}
                  <div className="text-[10px] sm:text-xs text-gray-400 font-medium mt-1">
                    {data.type === 'dex' || data.type === 'liquid-staking' ? 'Trading Activity' : 'Capital Efficiency'}
                  </div>
                </div>

                {/* Momentum Trend */}
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
                   <div className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Momentum</div>
                   <div className="flex items-center gap-2">
                      <span className={`text-lg sm:text-xl font-bold ${
                        data.current.momentum === 'growing' ? 'text-emerald-600' :
                        data.current.momentum === 'declining' ? 'text-rose-600' : 'text-blue-600'
                      }`}>
                        {data.current.momentum ? (data.current.momentum.charAt(0).toUpperCase() + data.current.momentum.slice(1)) : 'Stable'}
                      </span>
                   </div>
                   <div className="text-[10px] sm:text-xs text-gray-400 font-medium mt-1">
                     Trend Strength
                   </div>
                </div>
              </div>
            </div>

            {/* Main Chart Section */}
            <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-shadow p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                  <div>
                  <h3 className="text-xl font-bold bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    Score Trajectory
                  </h3>
                  <p className="text-sm text-gray-500">Historical performance vs category average</p>
                  </div>
                <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowMomentum(!showMomentum)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-2 ${
                        showMomentum
                        ? 'bg-orange-50 border-orange-200 text-orange-700'
                        : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                    <span className={`w-2 h-2 rounded-full ${showMomentum ? 'bg-orange-500' : 'bg-gray-300'}`}></span>
                    Self-Trend
                    </button>
                  <div className="flex bg-gray-100 p-1 rounded-xl">
                    {(['7d', '30d', '90d'] as const).map((range) => (
                      <button
                        key={range}
                        onClick={() => setTimeRange(range)}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          timeRange === range
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        {range.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="h-[400px] w-full">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 90, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FFFFFF" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#FFFFFF" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                      <XAxis 
                        dataKey="dateStr" 
                        stroke="#6b7280"
                        tick={{ fill: '#4b5563', fontSize: 11, fontWeight: 500 }}
                        tickLine={false}
                        axisLine={false}
                        dy={10}
                        minTickGap={30}
                      />
                      <YAxis 
                        stroke="#6b7280"
                        tick={{ fill: '#4b5563', fontSize: 11, fontWeight: 500 }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => value.toFixed(3)}
                        domain={['auto', 'auto']}
                        dx={-10}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.98)',
                          border: 'none',
                          borderRadius: '12px',
                          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                          padding: '12px 16px'
                        }}
                        labelStyle={{ color: '#6b7280', fontSize: '12px', marginBottom: '4px', fontWeight: 500 }}
                        formatter={(value: number, name: string) => {
                          if (name === 'score') return [<span className="text-[#49997E] font-bold text-lg">{value.toFixed(4)}</span>, 'SPT Score'];
                          if (name === 'momentumScore') return [<span className="text-orange-500 font-bold text-lg">{value.toFixed(4)}</span>, 'Self-Trend'];
                          return [value.toFixed(4), name];
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="score" 
                        stroke="#49997E" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorScore)" 
                        activeDot={{ r: 6, strokeWidth: 0, fill: '#49997E' }}
                        animationDuration={1500}
                      />
                      {showMomentum && (
                        <Line 
                          type="monotone" 
                          dataKey="momentumScore" 
                          stroke="#f97316" 
                          strokeWidth={2}
                          strokeDasharray="4 4"
                          dot={false}
                        />
                      )}
                      {categoryAvg && (
                        <ReferenceLine 
                          y={categoryAvg} 
                          stroke="#9ca3af" 
                          strokeDasharray="3 3"
                          label={{ 
                            value: 'Category Avg', 
                            position: 'right', 
                            fill: '#6b7280', 
                            fontSize: 11,
                            fontWeight: 600
                          }}
                        />
                      )}
                      {periodMax > 0 && (
                         <ReferenceLine 
                           y={periodMax} 
                           stroke="#10b981" 
                           strokeDasharray="3 3" 
                           strokeOpacity={0.5}
                           label={{ 
                             value: 'Period High', 
                             position: 'right', 
                             fill: '#059669', 
                             fontSize: 11,
                             fontWeight: 600
                           }} 
                        />
                      )}
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <span className="text-4xl mb-2">📉</span>
                    <p>No chart data available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Deep Dive Metrics Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Detailed Metrics Panel */}
              <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-8">
                <h3 className="text-lg font-bold text-gray-900 mb-6">
                  {data.type === 'dex' ? 'Efficiency Metrics' : data.type === 'liquid-staking' ? 'Staking Metrics' : 'Capital Utilization'}
                </h3>
                
                <div className="space-y-6">
                  {data.type === 'dex' && data.current.dexMetrics ? (
                    <>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm text-gray-600">Capital Efficiency (Vol/TVL)</span>
                          <span className="text-sm font-bold text-gray-900">{data.current.dexMetrics.capitalEfficiency.toFixed(3)}x</span>
                  </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500 rounded-full" style={{ width: `${Math.min(data.current.dexMetrics.capitalEfficiency * 100, 100)}%` }}></div>
                  </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Higher is better. Indicates how much volume is generated per $1 of TVL.
                    </p>
                  </div>
                  
                      <div className="pt-4 border-t border-gray-100">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-600">Daily Revenue</span>
                          <span className="text-sm font-bold text-gray-900">{formatCurrency(data.current.fees)}</span>
                      </div>
                      </div>
                    </>
                  ) : data.type === 'liquid-staking' ? (
                    <>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm text-gray-600">Total Value Staked</span>
                          <span className="text-sm font-bold text-gray-900">{formatCurrency(data.current.tvl)}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Total assets staked through this protocol.
                        </p>
                      </div>
                      
                      <div className="pt-4 border-t border-gray-100">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-600">Daily Revenue</span>
                          <span className="text-sm font-bold text-gray-900">{formatCurrency(data.current.fees)}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Protocol fees generated from staking operations.
                        </p>
                      </div>
                    </>
                  ) : data.current.lendingMetrics ? (
                    <>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm text-gray-600">Utilization Rate</span>
                          <span className="text-sm font-bold text-gray-900">{data.current.lendingMetrics.utilization.toFixed(1)}%</span>
                      </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${
                            data.current.lendingMetrics.utilization > 80 ? 'bg-orange-500' : 'bg-blue-500'
                          }`} style={{ width: `${data.current.lendingMetrics.utilization}%` }}></div>
          </div>
        </div>

                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm text-gray-600">
                            {data.type === 'cdp' ? 'Minted' : 'Borrowed'}
                          </span>
                          <span className="text-sm font-bold text-gray-900">
                            {formatCurrency(data.current.lendingMetrics.borrowVolume)}
                        </span>
                      </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-500">
                             {data.type === 'cdp' ? 'Collateral' : 'Supplied'}
                          </span>
                          <span className="text-base font-bold text-gray-900">
                            {formatCurrency(data.current.lendingMetrics.supplyVolume)}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden mt-2">
                          <div className="h-full bg-green-500 rounded-full" style={{ 
                            width: `${data.current.lendingMetrics.vanillaSupplyRatio}%` 
                          }}></div>
                        </div>
                      </div>
                    </>
                  ) : null}
                    </div>
                      </div>

              {/* Key Insight Panel */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl border border-blue-100 p-6 sm:p-8 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-blue-600 text-white p-1.5 rounded-lg">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </span>
                  <h3 className="font-bold text-blue-900">Automated Insight</h3>
                      </div>
                
                <p className="text-blue-800 leading-relaxed text-sm sm:text-base">
                  {data.type === 'dex' && data.current.dexMetrics ? (
                    <>
                      This protocol is operating with a capital efficiency of <strong>{data.current.dexMetrics.capitalEfficiency.toFixed(2)}x</strong>. 
                      {data.current.dexMetrics.capitalEfficiency > 0.5 
                        ? " This is exceptionally high, indicating highly efficient liquidity usage." 
                        : " There may be room to improve liquidity utilization compared to top-tier peers."}
                    </>
                  ) : data.type === 'liquid-staking' ? (
                    <>
                      This protocol has <strong>{formatCurrency(data.current.tvl)}</strong> in staked assets, generating <strong>{formatCurrency(data.current.fees)}</strong> in daily revenue. 
                      Liquid staking allows users to earn staking rewards while maintaining liquidity through derivative tokens.
                    </>
                  ) : data.current.lendingMetrics ? (
                    <>
                      Utilization is currently at <strong>{data.current.lendingMetrics.utilization.toFixed(1)}%</strong>. 
                      {data.current.lendingMetrics.utilization > 70 
                        ? " High utilization suggests strong borrower demand but limited room for withdrawals."
                        : " Lower utilization indicates ample liquidity but potentially inefficient capital deployment."}
                    </>
                  ) : "Data analysis pending for this protocol type."}
            </p>
          </div>
          </div>

          </main>

          {/* SIDEBAR - Weights & Versions (Second on Mobile) */}
          <aside className="lg:col-span-4 xl:col-span-3 space-y-6 lg:order-1">
            
            {/* Weighting Schema Card */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Scoring Weights</h3>
                <InfoTooltip content="How this protocol is scored relative to its peers." position="top" />
              </div>
              <div className="space-y-3">
                {weights.map((w) => (
                  <div key={w.name} className="group">
                    <div className="flex justify-between text-xs font-medium text-gray-600 mb-1">
                      <span>{w.name}</span>
                      <span style={{ color: w.color }}>{w.value}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500 ease-out" 
                        style={{ width: `${w.value}%`, backgroundColor: w.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Versions Tracked */}
            {data.versionsTracked && data.versionsTracked.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <span className="text-xs text-gray-400 block mb-3 uppercase tracking-wider font-bold">TRACKED VERSIONS</span>
                <div className="flex flex-wrap gap-2">
                  {data.versionsTracked.map((v: string) => (
                    <span key={v} className="px-2.5 py-1.5 bg-gray-50 text-gray-600 rounded-md text-xs font-medium border border-gray-100">
                      {v.split('-').pop()?.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>
            )}

          </aside>
        </div>
      </div>
    </div>
  );
}