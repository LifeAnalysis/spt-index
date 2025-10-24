'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, ReferenceLine } from 'recharts';
import InfoTooltip from '../../components/InfoTooltip';

interface ProtocolDetail {
  name: string;
  slug: string;
  category: string;
  type: string;
  description?: string;
  website?: string;
  twitter?: string;
  logo?: string;
  current: {
    tvl: number;
    fees: number;
    volume: number;
    score: number;
    rawScore: number;
    momentumScore?: number;
    momentum?: 'growing' | 'stable' | 'declining';
    change24h: number | null;
    change7d: number | null;
    change30d: number | null;
  };
  historicalMetrics?: {
    fees: number[];
    volume: number[];
    tvl: number[];
    activity: number[];
  };
  historicalDataPoints: number;
  history: Array<{
    date: string;
    timestamp: number;
    score: number;
    rawScore: number;
    momentumScore: number;
    tvl: number;
    fees: number;
    volume: number;
  }>;
}

export default function ProtocolDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  
  const [data, setData] = useState<ProtocolDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [showMomentum, setShowMomentum] = useState(true);
  const [etag, setEtag] = useState<string | null>(null);

  useEffect(() => {
    fetchProtocolDetail();
  }, [slug]);

  const fetchProtocolDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Include ETag in request headers for conditional request
      const headers: HeadersInit = {};
      if (etag) {
        headers['If-None-Match'] = etag;
      }
      
      const RAILWAY_API = 'https://spt-index-production.up.railway.app';
      const res = await fetch(`${RAILWAY_API}/api/protocol/${slug}`, { headers });
      
      // If 304 Not Modified, data hasn't changed
      if (res.status === 304) {
        console.log(`✅ Protocol ${slug} data unchanged (304 Not Modified) - using cached data`);
        setLoading(false);
        return;
      }
      
      if (!res.ok) throw new Error('Protocol not found');
      
      // Store new ETag for next request
      const newEtag = res.headers.get('ETag');
      if (newEtag) {
        setEtag(newEtag);
      }
      
      const responseData = await res.json();
      setData(responseData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number | undefined) => {
    if (value === undefined || value === null || isNaN(value)) return '—';
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatChange = (change: number | null | undefined) => {
    if (change === null || change === undefined || isNaN(change)) return '—';
    const isPositive = change >= 0;
    const arrow = isPositive ? '↑' : '↓';
    return `${arrow} ${Math.abs(change).toFixed(2)}%`;
  };

  const getScoreRating = (score: number): { label: string; color: string } => {
    if (score >= 0.80) return { label: 'AAA', color: 'text-[#49997E] bg-[#49997E]/10' };
    if (score >= 0.65) return { label: 'AA', color: 'text-emerald-600 bg-emerald-50' };
    if (score >= 0.50) return { label: 'A', color: 'text-blue-600 bg-blue-50' };
    if (score >= 0.35) return { label: 'BBB', color: 'text-amber-600 bg-amber-50' };
    if (score >= 0.20) return { label: 'BB', color: 'text-orange-600 bg-orange-50' };
    return { label: 'B', color: 'text-gray-600 bg-gray-100' };
  };

  const filterHistoryByRange = () => {
    if (!data?.history) return [];
    
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const cutoff = Date.now() / 1000 - (days * 86400);
    
    return data.history
      .filter(point => point.timestamp >= cutoff)
      .map(point => ({
        ...point,
        dateStr: point.date // Already formatted as YYYY-MM-DD from backend
      }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#49997E] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading protocol data...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
          {/* Mobile Header - Just Back Arrow */}
          <div className="md:hidden container mx-auto px-3 py-3">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-1 text-gray-600 hover:text-[#49997E] transition-colors"
            >
              <span className="text-xl">←</span>
            </button>
          </div>
          
          {/* Desktop Header */}
          <div className="hidden md:block container mx-auto px-4 py-3">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="flex items-center text-gray-600 hover:text-[#49997E] transition-colors"
              >
                <span className="mr-2">←</span>
                <span className="text-sm font-medium">Dashboard</span>
              </button>
              <div className="h-4 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-[#49997E] via-[#5eb896] to-[#49997E] bg-clip-text text-transparent">
                  SPT Index
                </h1>
                <p className="text-xs text-gray-500">Protocol Performance Analytics</p>
              </div>
            </div>
          </div>
        </nav>
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center bg-white rounded-xl border border-gray-200 p-12 shadow-sm">
            <div className="text-5xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Protocol Not Found</h1>
            <p className="text-gray-600 mb-6">{error || 'The protocol you are looking for does not exist.'}</p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-2 bg-gradient-to-r from-[#49997E] to-[#5eb896] text-white rounded-lg hover:from-[#3d8268] hover:to-[#49997E] transition-all shadow-sm"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const chartData = filterHistoryByRange();
  const rating = data?.current?.score !== undefined ? getScoreRating(data.current.score) : { label: 'N/A', color: 'text-gray-500 bg-gray-100' };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        {/* Mobile Header - Just Back Arrow */}
        <div className="md:hidden container mx-auto px-3 py-3">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-1 text-gray-600 hover:text-[#49997E] transition-colors"
          >
            <span className="text-xl">←</span>
          </button>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:block container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="flex items-center text-gray-600 hover:text-[#49997E] transition-colors"
              >
                <span className="mr-2">←</span>
                <span className="text-sm font-medium">Dashboard</span>
              </button>
              <div className="h-4 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-[#49997E] via-[#5eb896] to-[#49997E] bg-clip-text text-transparent">
                  SPT Index
                </h1>
                <p className="text-xs text-gray-500">Protocol Performance Analytics</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {data?.current?.score !== undefined && (
                <>
                  <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                    <span className={`inline-block px-2 py-0.5 rounded text-caption font-bold ${rating.color}`}>
                      {rating.label}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-1 text-caption text-gray-500">
                      SPT Score
                      <InfoTooltip 
                        content="compares this protocol against category peers using z-score normalization. higher = better performance vs competitors."
                        position="bottom"
                        maxWidth="600px"
                      />
                    </div>
                    <div className="text-lg font-bold text-[#49997E]">{data.current.score.toFixed(4)}</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-6 max-w-7xl">
        {/* Protocol Header - Ultra Compact Mobile */}
        <section className="mb-3 sm:mb-6">
          <div className="bg-gradient-to-r from-[#49997E]/10 via-blue-50 to-purple-50 rounded-lg sm:rounded-xl border border-gray-200 shadow-sm px-3 sm:px-8 py-3 sm:py-6">
            {/* Title Row */}
            <div className="flex items-center justify-between gap-2 mb-2 sm:mb-3">
              <h1 className="text-lg sm:text-3xl lg:text-4xl font-bold text-gray-900 truncate">{data.name}</h1>
              <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-white/80 text-gray-700 rounded text-[10px] sm:text-sm font-medium border border-gray-200 whitespace-nowrap flex-shrink-0">
                {data.type === 'dex' ? '🔄 DEX' : '💰 Lending'}
              </span>
            </div>

            {/* Description - Hidden on mobile */}
            {data.description && (
              <p className="hidden sm:block text-sm lg:text-base text-gray-700 leading-relaxed mb-3 sm:mb-4">{data.description}</p>
            )}

            {/* Links - Very compact */}
            {(data.website || data.twitter) && (
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4">
                {data.website && (
                  <a 
                    href={data.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[11px] sm:text-sm text-[#49997E] hover:underline flex items-center gap-1 font-medium"
                  >
                    🌐 <span className="hidden xs:inline">Site</span>
                  </a>
                )}
                {data.twitter && (
                  <a 
                    href={data.twitter.startsWith('http') ? data.twitter : `https://twitter.com/${data.twitter.replace('@', '')}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[11px] sm:text-sm text-[#49997E] hover:underline flex items-center gap-1 font-medium"
                  >
                    🐦 <span className="hidden xs:inline">Twitter</span>
                  </a>
                )}
              </div>
            )}
            
            {/* Flatter Metrics Row */}
            <div className="flex items-center gap-3 sm:gap-6 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-lg">💰</span>
                <div className="flex items-baseline gap-1">
                  <div className="font-bold text-gray-900 text-sm sm:text-base">{formatCurrency(data.current.tvl)}</div>
                  <div className="text-[10px] sm:text-xs text-gray-500 font-medium">TVL</div>
                </div>
              </div>
              
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-lg">💵</span>
                <div className="flex items-baseline gap-1">
                  <div className="font-bold text-gray-900 text-sm sm:text-base">{formatCurrency(data.current.fees)}</div>
                  <div className="text-[10px] sm:text-xs text-gray-500 font-medium">Fees</div>
                </div>
              </div>
              
              {data.type === 'dex' && (
                <div className="flex items-center gap-1.5">
                  <span className="text-base sm:text-lg">📊</span>
                  <div className="flex items-baseline gap-1">
                    <div className="font-bold text-gray-900 text-sm sm:text-base">{formatCurrency(data.current.volume)}</div>
                    <div className="text-[10px] sm:text-xs text-gray-500 font-medium">Vol</div>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-lg">⚡</span>
                <div className="flex items-baseline gap-1">
                  <div className="font-bold text-gray-900 text-sm sm:text-base">
                    {data?.current?.fees !== undefined && data?.current?.tvl !== undefined && data.current.tvl > 0
                      ? data.type === 'dex' && data?.current?.volume !== undefined
                        ? (((data.current.fees + data.current.volume) / data.current.tvl) * 100).toFixed(1)
                        : ((data.current.fees / data.current.tvl) * 100).toFixed(1)
                      : '—'
                    }
                    {data?.current?.fees !== undefined && data?.current?.tvl !== undefined && data.current.tvl > 0 && '%'}
                  </div>
                  <div className="text-[10px] sm:text-xs text-gray-500 font-medium">Eff</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Ultra Compact Performance Overview */}
        <section className="mb-3 sm:mb-6">
          <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-[#49997E]/5 to-blue-50 px-3 sm:px-6 py-2 sm:py-4">
              <div className="flex items-center justify-between gap-2 sm:gap-6">
                {/* Score & Rating - Compact */}
                <div className="flex items-center gap-2 sm:gap-4">
                  <div>
                    <div className="flex items-center gap-0.5 text-[10px] sm:text-xs text-gray-500 mb-0.5">
                      SPT
                      <InfoTooltip 
                        content="cross-protocol comparison score. measures operational efficiency against category peers."
                        position="bottom"
                        maxWidth="600px"
                      />
                    </div>
                    <div className="text-xl sm:text-3xl font-bold text-[#49997E] tabular-nums">
                      {data?.current?.score !== undefined ? data.current.score.toFixed(4) : '—'}
                    </div>
                  </div>
                  <div className={`px-2 sm:px-3 py-0.5 sm:py-1.5 rounded text-[10px] sm:text-sm font-bold ${rating.color}`}>
                    {rating.label}
                  </div>
                </div>
                
                {/* Performance Changes - Compact */}
                <div className="flex items-center gap-2 sm:gap-6">
                  <div className="text-center">
                    <div className="text-[9px] sm:text-xs text-gray-500 mb-0.5">24h</div>
                    <div className={`text-xs sm:text-base lg:text-lg font-bold tabular-nums ${data.current.change24h && data.current.change24h >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {formatChange(data.current.change24h)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-[9px] sm:text-xs text-gray-500 mb-0.5">7d</div>
                    <div className={`text-xs sm:text-base lg:text-lg font-bold tabular-nums ${data.current.change7d && data.current.change7d >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {formatChange(data.current.change7d)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-[9px] sm:text-xs text-gray-500 mb-0.5">30d</div>
                    <div className={`text-xs sm:text-base lg:text-lg font-bold tabular-nums ${data.current.change30d && data.current.change30d >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {formatChange(data.current.change30d)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Two Column Layout for Chart & Methodology */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6 mb-3 sm:mb-6">
          {/* Historical Chart - Takes 2 columns */}
          <div className="lg:col-span-2">
            <h3 className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">Historical Analysis</h3>
            <div className="bg-white border border-gray-200 rounded-lg sm:rounded-xl shadow-sm overflow-hidden h-full">
              <div className="border-b border-gray-200 bg-gray-50 px-3 sm:px-6 py-2 sm:py-4">
                <div className="space-y-2 sm:space-y-3">
                  <div>
                    <h4 className="text-xs sm:text-base lg:text-lg font-bold text-gray-900">SPT Score Timeline</h4>
                    <p className="text-xs text-gray-600 mt-0.5 sm:mt-1">
                      {timeRange === '7d' ? '7 days' : timeRange === '30d' ? '30 days' : '90 days'}
                      {' • '}{chartData.length} points
                    </p>
                  </div>
                  
                  {/* Controls - Compact Single Line */}
                  <div className="flex flex-wrap gap-2">
                    {/* Momentum Toggle */}
                    <button
                      onClick={() => setShowMomentum(!showMomentum)}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                        showMomentum
                          ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-sm'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-orange-300'
                      }`}
                      title={showMomentum ? 'Hide Momentum Score' : 'Show Momentum Score'}
                    >
                      <span className={`w-2 h-2 rounded-full ${showMomentum ? 'bg-white' : 'bg-orange-500'}`}></span>
                      <span>Momentum</span>
                    </button>
                    
                    {/* Time Range Buttons */}
                    {(['7d', '30d', '90d'] as const).map((range) => (
                      <button
                        key={range}
                        onClick={() => setTimeRange(range)}
                        className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                          timeRange === range
                            ? 'bg-gradient-to-r from-[#49997E] to-[#5eb896] text-white shadow-sm'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-[#49997E]/30'
                        }`}
                      >
                        {range.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#49997E" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#49997E" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="dateStr" 
                        stroke="#9ca3af"
                        style={{ fontSize: '11px' }}
                        tick={{ fill: '#6b7280' }}
                      />
                      <YAxis 
                        stroke="#9ca3af"
                        style={{ fontSize: '11px' }}
                        tick={{ fill: '#6b7280' }}
                        tickFormatter={(value) => value.toFixed(4)}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          padding: '12px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                        formatter={(value: number, name: string) => {
                          if (name === 'score') return [value.toFixed(6), 'SPT Score'];
                          if (name === 'momentumScore') return [value.toFixed(6), 'Momentum'];
                          return [value.toFixed(6), name];
                        }}
                        labelStyle={{ color: '#374151', fontWeight: 600, marginBottom: '4px' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="score" 
                        stroke="#49997E" 
                        strokeWidth={3}
                        fill="url(#scoreGradient)"
                      />
                      {/* Momentum Score Historical Line */}
                      {showMomentum && (
                        <Line 
                          type="monotone" 
                          dataKey="momentumScore" 
                          stroke="#f97316" 
                          strokeWidth={2.5}
                          dot={false}
                        />
                      )}
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-96 text-gray-400">
                    <div className="text-display">📊</div>
                    <p className="text-body-sm">No historical data available</p>
                    <p className="text-caption mt-1">Data collection in progress</p>
                  </div>
                )}
                
                {/* Chart Legend */}
                {chartData.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-4 text-caption">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-0.5 bg-[#49997E] rounded"></div>
                      <span className="text-gray-600">
                        <strong className="text-gray-900">SPT Score:</strong> Cross-protocol comparison vs category peers
                      </span>
                    </div>
                    {showMomentum && (
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-0.5 bg-orange-500 rounded"></div>
                        <span className="text-gray-600">
                          <strong className="text-orange-600">Momentum:</strong> Historical self-comparison vs own baseline
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Weighting Schema - Takes 1 column */}
          <div className="lg:col-span-1">
            <h3 className="text-label font-semibold text-gray-500 uppercase tracking-wider mb-3">Weighting Schema</h3>
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 h-full">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="text-body-lg font-bold text-gray-900">
                    {data.type === 'dex' ? 'DEX' : 'Lending'} Weights
                  </h4>
                  <InfoTooltip 
                    content="protocol-specific weights for spt score calculation. dex and lending protocols use different metric priorities."
                    position="bottom"
                    maxWidth="600px"
                  />
                </div>
                <p className="text-caption text-gray-600">
                  Protocol-specific metric weighting
                </p>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between bg-gradient-to-r from-[#49997E]/5 to-transparent rounded-lg px-4 py-3 border border-gray-200">
                  <span className="text-body-sm font-medium text-gray-700">💵 Fees</span>
                  <span className="text-score-md text-[#49997E]">
                    {data.type === 'dex' ? '35%' : '40%'}
                  </span>
                </div>
                <div className="flex items-center justify-between bg-gradient-to-r from-blue-500/5 to-transparent rounded-lg px-4 py-3 border border-gray-200">
                  <span className="text-body-sm font-medium text-gray-700">📊 Volume</span>
                  <span className="text-score-md text-blue-600">
                    {data.type === 'dex' ? '30%' : '15%'}
                  </span>
                </div>
                <div className="flex items-center justify-between bg-gradient-to-r from-amber-500/5 to-transparent rounded-lg px-4 py-3 border border-gray-200">
                  <span className="text-body-sm font-medium text-gray-700">💰 TVL</span>
                  <span className="text-score-md text-amber-600">
                    {data.type === 'dex' ? '25%' : '35%'}
                  </span>
                </div>
                <div className="flex items-center justify-between bg-gradient-to-r from-gray-500/5 to-transparent rounded-lg px-4 py-3 border border-gray-200">
                  <span className="text-body-sm font-medium text-gray-700">⚡ Activity</span>
                  <span className="text-score-md text-gray-700">10%</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="text-caption text-gray-600 space-y-2">
                  <p className="font-semibold text-gray-900">Calculation Process:</p>
                  <div className="space-y-1.5">
                    <div className="flex items-start gap-2">
                      <span className="text-[#49997E] font-bold">1.</span>
                      <span>Z-score normalization (90d window)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">2.</span>
                      <span>Sigmoid mapping [0,1]</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-amber-600 font-bold">3.</span>
                      <span>Weighted aggregation</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-gray-600 font-bold">4.</span>
                      <span>Relative peer normalization</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Trend - Self-Comparison Analysis */}
        <section className="mb-6">
          <h3 className="text-label font-semibold text-gray-500 uppercase tracking-wider mb-3">Performance Trend</h3>
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            {/* Compact Header */}
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h4 className="text-body-sm font-bold text-gray-900">Performance vs 90-Day Average</h4>
                <InfoTooltip 
                  content="current performance vs protocol's own 90-day baseline. independent of peers—shows if protocol is improving or declining against itself."
                  position="bottom"
                  maxWidth="600px"
                />
              </div>
              {data.current.momentum === 'growing' && (
                <span className="inline-flex items-center px-3 py-1 rounded bg-emerald-100 text-emerald-700 font-bold text-caption uppercase">↑ Growing</span>
              )}
              {data.current.momentum === 'stable' && (
                <span className="inline-flex items-center px-3 py-1 rounded bg-blue-100 text-blue-700 font-bold text-caption uppercase">→ Stable</span>
              )}
              {data.current.momentum === 'declining' && (
                <span className="inline-flex items-center px-3 py-1 rounded bg-rose-100 text-rose-700 font-bold text-caption uppercase">↓ Declining</span>
              )}
            </div>
            
            {/* Compact Metrics */}
            {data.historicalMetrics && (
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Fees */}
                  <div className="border border-gray-200 rounded-lg p-3">
                    <div className="text-caption font-semibold text-gray-500 mb-2">FEES (24H)</div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs text-gray-600">Current</span>
                        <span className="text-lg font-bold text-gray-900">{formatCurrency(data.current.fees)}</span>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs text-gray-600">Avg</span>
                        <span className="text-sm font-medium text-gray-700">
                          {formatCurrency(data.historicalMetrics.fees.reduce((a, b) => a + b, 0) / data.historicalMetrics.fees.length)}
                        </span>
                      </div>
                      <div className={`text-xs font-bold pt-1 border-t border-gray-200 ${
                        data.current.fees > (data.historicalMetrics.fees.reduce((a, b) => a + b, 0) / data.historicalMetrics.fees.length)
                          ? 'text-emerald-600'
                          : 'text-rose-600'
                      }`}>
                        {data.current.fees > (data.historicalMetrics.fees.reduce((a, b) => a + b, 0) / data.historicalMetrics.fees.length)
                          ? `↑ +${(((data.current.fees / (data.historicalMetrics.fees.reduce((a, b) => a + b, 0) / data.historicalMetrics.fees.length)) - 1) * 100).toFixed(1)}%`
                          : `↓ ${(((data.current.fees / (data.historicalMetrics.fees.reduce((a, b) => a + b, 0) / data.historicalMetrics.fees.length)) - 1) * 100).toFixed(1)}%`}
                      </div>
                    </div>
                  </div>

                  {/* Volume (DEX only) */}
                  {data.type === 'dex' && (
                    <div className="border border-gray-200 rounded-lg p-3">
                      <div className="text-caption font-semibold text-gray-500 mb-2">VOLUME (24H)</div>
                      <div className="space-y-1">
                        <div className="flex justify-between items-baseline">
                          <span className="text-caption text-gray-600">Current</span>
                          <span className="text-score-md text-gray-900">{formatCurrency(data.current.volume)}</span>
                        </div>
                        <div className="flex justify-between items-baseline">
                          <span className="text-caption text-gray-600">Avg</span>
                          <span className="text-body-sm font-medium text-gray-700">
                            {formatCurrency(data.historicalMetrics.volume.reduce((a, b) => a + b, 0) / data.historicalMetrics.volume.length)}
                          </span>
                        </div>
                        <div className={`text-caption font-bold pt-1 border-t border-gray-200 ${
                          data.current.volume > (data.historicalMetrics.volume.reduce((a, b) => a + b, 0) / data.historicalMetrics.volume.length)
                            ? 'text-emerald-600'
                            : 'text-rose-600'
                        }`}>
                          {data.current.volume > (data.historicalMetrics.volume.reduce((a, b) => a + b, 0) / data.historicalMetrics.volume.length)
                            ? `↑ +${(((data.current.volume / (data.historicalMetrics.volume.reduce((a, b) => a + b, 0) / data.historicalMetrics.volume.length)) - 1) * 100).toFixed(1)}%`
                            : `↓ ${(((data.current.volume / (data.historicalMetrics.volume.reduce((a, b) => a + b, 0) / data.historicalMetrics.volume.length)) - 1) * 100).toFixed(1)}%`}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TVL */}
                  <div className="border border-gray-200 rounded-lg p-3">
                    <div className="text-caption font-semibold text-gray-500 mb-2">TVL</div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-baseline">
                        <span className="text-caption text-gray-600">Current</span>
                        <span className="text-score-md text-gray-900">{formatCurrency(data.current.tvl)}</span>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className="text-caption text-gray-600">Avg</span>
                        <span className="text-body-sm font-medium text-gray-700">
                          {formatCurrency(data.historicalMetrics.tvl.reduce((a, b) => a + b, 0) / data.historicalMetrics.tvl.length)}
                        </span>
                      </div>
                      <div className={`text-caption font-bold pt-1 border-t border-gray-200 ${
                        data.current.tvl > (data.historicalMetrics.tvl.reduce((a, b) => a + b, 0) / data.historicalMetrics.tvl.length)
                          ? 'text-emerald-600'
                          : 'text-rose-600'
                      }`}>
                        {data.current.tvl > (data.historicalMetrics.tvl.reduce((a, b) => a + b, 0) / data.historicalMetrics.tvl.length)
                          ? `↑ +${(((data.current.tvl / (data.historicalMetrics.tvl.reduce((a, b) => a + b, 0) / data.historicalMetrics.tvl.length)) - 1) * 100).toFixed(1)}%`
                          : `↓ ${(((data.current.tvl / (data.historicalMetrics.tvl.reduce((a, b) => a + b, 0) / data.historicalMetrics.tvl.length)) - 1) * 100).toFixed(1)}%`}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-8 border-t border-gray-200 pt-6">
          <div className="text-center text-caption text-gray-500">
            <p className="mb-2">
              SPT Index v1.0 • Protocol Analysis • Data: DefiLlama API • For Research Purposes Only
            </p>
            <p className="text-gray-400 mb-4">
              Not financial advice • Scores represent operational metrics, not investment recommendations
            </p>
          </div>
          <div className="text-center">
            <span className="text-body-sm font-bold text-gray-700">powered by exagroup.xyz</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

