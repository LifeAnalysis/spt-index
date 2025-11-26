'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, BarChart, Bar, Cell } from 'recharts';
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

  useEffect(() => {
    fetchProtocolDetail();
  }, [slug]);

  const fetchProtocolDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const RAILWAY_API = 'https://spt-index-production.up.railway.app';
      
      const headers: HeadersInit = {};
      if (etag) {
        headers['If-None-Match'] = etag;
      }
      
      const [detailRes, indexRes] = await Promise.all([
        fetch(`${RAILWAY_API}/api/protocol/${slug}`, { headers }),
        fetch(`${RAILWAY_API}/api/spt`)
      ]);
      
      if (detailRes.status === 304) {
        setLoading(false);
        return;
      }
      
      if (!detailRes.ok) throw new Error('Protocol not found');
      if (!indexRes.ok) throw new Error('Failed to fetch SPT index');
      
      const newEtag = detailRes.headers.get('ETag');
      if (newEtag) {
        setEtag(newEtag);
      }
      
      const detailData = await detailRes.json();
      const indexData = await indexRes.json();
      
      const allProtocols = [...(indexData.dex || []), ...(indexData.lending || [])];
      const cohortData = allProtocols.find((p: any) => p.slug === slug);
      
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
      
      setData(mergedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatChange = (change: number | null | undefined) => {
    if (change === null || change === undefined || isNaN(change)) return '—';
    const isPositive = change >= 0;
    const arrow = isPositive ? '↑' : '↓';
    return `${arrow} ${Math.abs(change).toFixed(2)}%`;
  };

  const filterHistoryByRange = () => {
    if (!data?.history) return [];
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const cutoff = Date.now() / 1000 - (days * 86400);
    return data.history
      .filter(point => point.timestamp >= cutoff)
      .map(point => ({
        ...point,
        dateStr: point.date
      }));
  };

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

  const chartData = filterHistoryByRange();
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
    <div className="min-h-screen bg-gray-50/50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm backdrop-blur-md bg-white/90">
        <div className="container mx-auto px-4 sm:px-6 py-3">
          <div className="flex justify-between items-center">
              <button
                onClick={() => router.push('/')}
              className="flex items-center text-gray-600 hover:text-[#49997E] transition-colors group"
              >
              <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span>
                <span className="text-sm font-medium">Dashboard</span>
              </button>
            <h1 className="text-lg font-bold text-gray-900">SPT Index</h1>
            <button
              onClick={() => router.push('/about')}
              className="text-sm text-gray-600 hover:text-[#49997E] transition-colors"
            >
              About
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 sm:px-6 py-8 max-w-[1400px]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT SIDEBAR - INFO & METADATA */}
          <aside className="lg:col-span-4 xl:col-span-3 space-y-6">
            {/* Identity Card */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-shadow sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  data.type === 'dex' ? 'bg-blue-50 text-blue-700' : 
                  data.type === 'lending' ? 'bg-green-50 text-green-700' : 'bg-purple-50 text-purple-700'
                }`}>
                  {data.type === 'dex' ? 'DEX' : data.type === 'lending' ? 'Lending' : 'CDP'}
                </span>
                <div className="flex gap-3">
                  {data.website && (
                    <a href={data.website} target="_blank" rel="noopener" className="text-gray-400 hover:text-[#49997E] transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                    </a>
                  )}
                  {data.twitter && (
                    <a href={data.twitter} target="_blank" rel="noopener" className="text-gray-400 hover:text-[#49997E] transition-colors">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                    </a>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-4 mb-4">
                {data.logo && (
                  <div className="w-12 h-12 rounded-full bg-gray-50 border border-gray-100 p-1 flex-shrink-0 shadow-sm">
                    <img 
                      src={data.logo} 
                      alt={`${data.name} logo`} 
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                )}
                <h1 className="text-3xl font-bold text-gray-900">{data.name}</h1>
            </div>

            {data.description && (
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  {data.description}
                </p>
            )}

              {/* Website & Twitter Links */}
            {(data.website || data.twitter) && (
                <div className="flex items-center gap-3 mb-4">
                {data.website && (
                  <a 
                    href={data.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                      className="text-xs text-[#49997E] hover:text-[#3d8268] font-medium flex items-center gap-1.5 hover:underline transition-colors"
                  >
                      <span>🌐</span> Website
                  </a>
                )}
                {data.twitter && (
                  <a 
                    href={data.twitter.startsWith('http') ? data.twitter : `https://twitter.com/${data.twitter.replace('@', '')}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                      className="text-xs text-[#49997E] hover:text-[#3d8268] font-medium flex items-center gap-1.5 hover:underline transition-colors"
                  >
                      <span>🐦</span> Twitter
                  </a>
                )}
              </div>
            )}
            
              {/* Growth Momentum Indicator */}
              {data.current.momentum && (
                <div className="mb-4 pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {data.current.momentum === 'growing' && '📈'}
                      {data.current.momentum === 'declining' && '📉'}
                      {data.current.momentum === 'stable' && '➡️'}
                    </span>
                    <div>
                      <div className="text-xs text-gray-400 uppercase tracking-wider font-medium">Recent Momentum</div>
                      <div className={`text-sm font-bold capitalize ${
                        data.current.momentum === 'growing' ? 'text-emerald-600' :
                        data.current.momentum === 'declining' ? 'text-rose-600' : 'text-blue-600'
                      }`}>
                        {data.current.momentum}
                        {data.current.change30d && ` (${data.current.change30d >= 0 ? '+' : ''}${data.current.change30d.toFixed(1)}% avg 30d)`}
                </div>
              </div>
                  </div>
                </div>
              )}
              
              {/* Quick Stats List */}
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium text-gray-500 mt-1">Total TVL</span>
                    {data.historicalMetrics && data.historicalMetrics.tvl.length >= 7 && (
                      <span className="text-sm">
                        {(() => {
                          const last7Days = data.historicalMetrics.tvl.slice(-7);
                          const trend = last7Days[last7Days.length - 1] > last7Days[0];
                          return trend ? '📈' : '📉';
                        })()}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-base font-bold text-gray-900">{formatCurrency(data.current.tvl)}</div>
                    {data.historicalMetrics && (
                       <div className={`text-xs font-bold ${
                         data.current.tvl >= (data.historicalMetrics.tvl.reduce((a, b) => a + b, 0) / data.historicalMetrics.tvl.length)
                           ? 'text-emerald-600'
                           : 'text-rose-600'
                       }`}>
                         {data.current.tvl >= (data.historicalMetrics.tvl.reduce((a, b) => a + b, 0) / data.historicalMetrics.tvl.length) ? '↑' : '↓'}
                         {Math.abs(((data.current.tvl / (data.historicalMetrics.tvl.reduce((a, b) => a + b, 0) / data.historicalMetrics.tvl.length)) - 1) * 100).toFixed(1)}% vs 90d
                       </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium text-gray-500 mt-1">24h Fees</span>
                    {data.historicalMetrics && data.historicalMetrics.fees.length >= 7 && (
                      <span className="text-sm">
                        {(() => {
                          const last7Days = data.historicalMetrics.fees.slice(-7);
                          const trend = last7Days[last7Days.length - 1] > last7Days[0];
                          return trend ? '📈' : '📉';
                        })()}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-base font-bold text-gray-900">{formatCurrency(data.current.fees)}</div>
                    {data.historicalMetrics && (
                       <div className={`text-xs font-bold ${
                         data.current.fees >= (data.historicalMetrics.fees.reduce((a, b) => a + b, 0) / data.historicalMetrics.fees.length)
                           ? 'text-emerald-600'
                           : 'text-rose-600'
                       }`}>
                         {data.current.fees >= (data.historicalMetrics.fees.reduce((a, b) => a + b, 0) / data.historicalMetrics.fees.length) ? '↑' : '↓'}
                         {Math.abs(((data.current.fees / (data.historicalMetrics.fees.reduce((a, b) => a + b, 0) / data.historicalMetrics.fees.length)) - 1) * 100).toFixed(1)}% vs 90d
                       </div>
                    )}
                  </div>
                </div>
                
                {data.type === 'dex' && (
                  <>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium text-gray-500 mt-1">24h Volume</span>
                        {data.historicalMetrics && data.historicalMetrics.volume.length >= 7 && (
                          <span className="text-sm">
                            {(() => {
                              const last7Days = data.historicalMetrics.volume.slice(-7);
                              const trend = last7Days[last7Days.length - 1] > last7Days[0];
                              return trend ? '📈' : '📉';
                            })()}
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-base font-bold text-gray-900">{formatCurrency(data.current.volume)}</div>
                         {data.historicalMetrics && (
                           <div className={`text-xs font-bold ${
                             data.current.volume >= (data.historicalMetrics.volume.reduce((a, b) => a + b, 0) / data.historicalMetrics.volume.length)
                               ? 'text-emerald-600'
                               : 'text-rose-600'
                           }`}>
                             {data.current.volume >= (data.historicalMetrics.volume.reduce((a, b) => a + b, 0) / data.historicalMetrics.volume.length) ? '↑' : '↓'}
                             {Math.abs(((data.current.volume / (data.historicalMetrics.volume.reduce((a, b) => a + b, 0) / data.historicalMetrics.volume.length)) - 1) * 100).toFixed(1)}% vs 90d
                           </div>
                        )}
                      </div>
                    </div>
                    {data.current.dexMetrics && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-500">Cap. Efficiency</span>
                        <span className="text-base font-bold text-gray-900">{data.current.dexMetrics.capitalEfficiency.toFixed(3)}x</span>
                      </div>
                    )}
                    {data.historicalMetrics && data.historicalMetrics.fees && data.historicalMetrics.fees.length >= 30 && (
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-medium text-gray-500 mt-1">Fee Growth (30d)</span>
                        <div className="text-right">
                          {(() => {
                            const last30Days = data.historicalMetrics.fees.slice(-30);
                            const first15Avg = last30Days.slice(0, 15).reduce((a, b) => a + b, 0) / 15;
                            const last15Avg = last30Days.slice(-15).reduce((a, b) => a + b, 0) / 15;
                            const growthRate = ((last15Avg - first15Avg) / first15Avg) * 100;
                            return (
                              <div className={`text-base font-bold ${growthRate >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {growthRate >= 0 ? '+' : ''}{growthRate.toFixed(1)}%
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    )}
                  </>
                )}

        {(data.type === 'lending' || data.type === 'cdp') && data.current.lendingMetrics && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-500">Utilization</span>
                      <span className="text-base font-bold text-gray-900">{data.current.lendingMetrics.utilization.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-500">
                        {data.type === 'cdp' ? 'Minted' : 'Borrowed'}
                      </span>
                      <span className="text-base font-bold text-gray-900">
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
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-medium text-gray-500 mt-1">Vanilla Assets</span>
                      <div className="text-right">
                        <div className="text-base font-bold text-gray-900">{formatCurrency(data.current.lendingMetrics.vanillaSupply)}</div>
                        <div className="text-xs text-gray-500">
                      {data.current.lendingMetrics.vanillaSupplyRatio.toFixed(1)}% of supply
                    </div>
                  </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-500">Vanilla Util.</span>
                      <span className="text-base font-bold text-gray-900">{data.current.lendingMetrics.vanillaUtilization.toFixed(1)}%</span>
                    </div>
                  </>
                )}

                {data.historicalMetrics && (
                   <div className="pt-4 mt-4 border-t border-gray-100">
                     <span className="text-xs text-gray-400 block mb-2 uppercase tracking-wider">90-Day Averages</span>
                     <div className="space-y-2">
                       <div className="flex justify-between items-center">
                         <span className="text-xs font-medium text-gray-500">Avg Fees</span>
                         <span className="text-sm font-semibold text-gray-700">
                           {formatCurrency(data.historicalMetrics.fees.reduce((a, b) => a + b, 0) / data.historicalMetrics.fees.length)}
                         </span>
                       </div>
                       {data.type === 'dex' && (
                         <div className="flex justify-between items-center">
                           <span className="text-xs font-medium text-gray-500">Avg Volume</span>
                           <span className="text-sm font-semibold text-gray-700">
                             {formatCurrency(data.historicalMetrics.volume.reduce((a, b) => a + b, 0) / data.historicalMetrics.volume.length)}
                           </span>
                         </div>
                       )}
                       <div className="flex justify-between items-center">
                         <span className="text-xs font-medium text-gray-500">Avg TVL</span>
                         <span className="text-sm font-semibold text-gray-700">
                           {formatCurrency(data.historicalMetrics.tvl.reduce((a, b) => a + b, 0) / data.historicalMetrics.tvl.length)}
                         </span>
                       </div>
                     </div>
                   </div>
                )}

                {data.versionsTracked && data.versionsTracked.length > 0 && (
                  <div className="pt-4 mt-4 border-t border-gray-100">
                    <span className="text-xs text-gray-400 block mb-2 uppercase tracking-wider">TRACKED VERSIONS</span>
                    <div className="flex flex-wrap gap-2">
                      {data.versionsTracked.map((v: string) => (
                        <span key={v} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium border border-gray-200">
                          {v.split('-').pop()?.toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
                    </div>

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
          </aside>

          {/* RIGHT CONTENT - CHARTS & ANALYSIS */}
          <main className="lg:col-span-8 xl:col-span-9 space-y-6">
            
            {/* Hero Score Card */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 items-stretch divide-y md:divide-y-0 md:divide-x divide-gray-100">
                {/* Main Score */}
                <div className="p-8 flex flex-col justify-center bg-gradient-to-br from-[#49997E]/5 to-transparent relative">
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 relative z-10">
                    SPT Score
                    <InfoTooltip content="Composite score (0-1) based on weighted, normalized metrics." position="right" />
                    </div>
                  <div className="flex items-baseline gap-4">
                    <span className="text-6xl font-black text-[#49997E] tracking-tight">
                      {data?.current?.score !== undefined ? data.current.score.toFixed(4) : '—'}
                    </span>
                    <span className={`px-3 py-1 rounded-lg text-lg font-bold ${rating.color}`}>
                      {rating.label}
                    </span>
                    </div>
                  <div className="mt-4 flex items-center gap-2">
                    <span className={`text-sm font-bold ${data.current.change30d && data.current.change30d >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {formatChange(data.current.change30d)}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">vs 30d avg</span>
                  </div>
                    </div>

                {/* Changes Grid */}
                <div className="lg:col-span-2 p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-gray-900">Performance Momentum</h3>
                    {data.current.momentum && (
                       <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                         data.current.momentum === 'growing' ? 'bg-emerald-100 text-emerald-700' :
                         data.current.momentum === 'declining' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'
                       }`}>
                         {data.current.momentum} Trend
                       </span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <div className="text-xs text-gray-400 font-medium mb-1">24H CHANGE</div>
                      <div className={`text-xl font-bold ${data.current.change24h && data.current.change24h >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {formatChange(data.current.change24h)}
                    </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 font-medium mb-1">7D CHANGE</div>
                      <div className={`text-xl font-bold ${data.current.change7d && data.current.change7d >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {formatChange(data.current.change7d)}
                  </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 font-medium mb-1">30D CHANGE</div>
                      <div className={`text-xl font-bold ${data.current.change30d && data.current.change30d >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {formatChange(data.current.change30d)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Chart Section */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-lg hover:shadow-xl transition-shadow p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                  <div>
                  <h3 className="text-xl font-bold text-gray-900">Score Trajectory</h3>
                  <p className="text-sm text-gray-500">Historical performance analysis</p>
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
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#49997E" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#49997E" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                      <XAxis 
                        dataKey="dateStr" 
                        stroke="#9ca3af"
                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                        dy={10}
                        minTickGap={30}
                      />
                      <YAxis 
                        stroke="#9ca3af"
                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => value.toFixed(3)}
                        domain={['auto', 'auto']}
                        dx={-10}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: 'none',
                          borderRadius: '12px',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                          padding: '12px 16px'
                        }}
                        labelStyle={{ color: '#6b7280', fontSize: '12px', marginBottom: '4px' }}
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
                  {data.type === 'dex' ? 'Efficiency Metrics' : 'Capital Utilization'}
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
                            Vanilla Supply
                        </span>
                          <span className="text-sm font-bold text-gray-900">
                            {data.current.lendingMetrics.vanillaSupplyRatio.toFixed(1)}%
                          </span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
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
          </div>
      </div>
    </div>
  );
}
