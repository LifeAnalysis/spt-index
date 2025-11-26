import { useRouter } from 'next/navigation';
import InfoTooltip from './InfoTooltip';
import MobileProtocolCard from './MobileProtocolCard';
import { Protocol, SortColumn, SortDirection } from '../types';
import { PROTOCOL_SLUGS, formatScore, formatChange, getScoreRating } from '../utils';

interface ProtocolTableProps {
  protocols: Protocol[];
  title: string;
  description: string;
  icon: string;
  sortColumn: SortColumn;
  sortDirection: SortDirection;
  onSort: (column: SortColumn) => void;
}

export default function ProtocolTable({ 
  protocols, 
  title, 
  description, 
  icon,
  sortColumn,
  sortDirection,
  onSort
}: ProtocolTableProps) {
  const router = useRouter();

  if (protocols.length === 0) return null;

  const sortedProtocols = [...protocols].sort((a, b) => {
    let aValue: number | string | null;
    let bValue: number | string | null;
    
    switch (sortColumn) {
      case 'protocol':
        aValue = a.protocol.toLowerCase();
        bValue = b.protocol.toLowerCase();
        break;
      case 'rating':
        aValue = a.score;
        bValue = b.score;
        break;
      case 'score':
        aValue = a.score;
        bValue = b.score;
        break;
      case 'change24h':
        aValue = a.change24h ?? -Infinity;
        bValue = b.change24h ?? -Infinity;
        break;
      case 'change7d':
        aValue = a.change7d ?? -Infinity;
        bValue = b.change7d ?? -Infinity;
        break;
      case 'change30d':
        aValue = a.change30d ?? -Infinity;
        bValue = b.change30d ?? -Infinity;
        break;
      default:
        return 0;
    }
    
    if (aValue === null || aValue === -Infinity) return 1;
    if (bValue === null || bValue === -Infinity) return -1;
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    return sortDirection === 'asc' 
      ? (aValue as number) - (bValue as number)
      : (bValue as number) - (aValue as number);
  });

  const SortIcon = ({ column }: { column: SortColumn }) => {
    if (sortColumn !== column) {
      return <span className="text-gray-300 ml-1">⇅</span>;
    }
    return sortDirection === 'asc' ? 
      <span className="text-[#49997E] ml-1">↑</span> : 
      <span className="text-[#49997E] ml-1">↓</span>;
  };

  return (
    <div className="mb-8">
      <div className="mb-4 hidden md:block">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-h1">{icon}</span>
          <h2 className="text-h2 text-gray-900">{title}</h2>
        </div>
        <p className="text-body-sm text-gray-600">{description}</p>
      </div>
      
      {/* Mobile Title */}
      <div className="md:hidden mb-3">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          {title}
        </h2>
      </div>

      {/* Mobile Cards (< 768px) */}
      <div className="md:hidden space-y-2">
        {sortedProtocols.map((protocol, index) => (
          <MobileProtocolCard key={protocol.protocol} protocol={protocol} index={index} />
        ))}
      </div>

      {/* Desktop Table (>= 768px) */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <thead>
              <tr className="bg-gradient-to-r from-[#49997E]/10 to-[#49997E]/5 border-b-2 border-gray-200">
                <th className="w-[30%] px-6 py-4 align-middle">
                  <button
                    onClick={() => onSort('protocol')}
                    className="flex items-center justify-start w-full text-caption font-semibold text-gray-700 uppercase tracking-wider hover:text-[#49997E] transition-colors"
                  >
                    Protocol
                    <SortIcon column="protocol" />
                  </button>
                </th>
                <th className="w-[12%] px-6 py-4 align-middle">
                  <div className="flex items-center justify-center w-full">
                    <button
                      onClick={() => onSort('rating')}
                      className="flex items-center text-xs font-semibold text-gray-700 uppercase tracking-wider hover:text-[#49997E] transition-colors"
                    >
                      Rating
                      <SortIcon column="rating" />
                    </button>
                    <InfoTooltip 
                      content="credit-style rating: aaa (best) to b (lowest) based on spt score. higher rating = more efficient protocol operations."
                      position="bottom"
                      maxWidth="550px"
                    />
                  </div>
                </th>
                <th className="w-[14%] px-6 py-4 align-middle">
                  <div className="flex items-center justify-center w-full">
                    <button
                      onClick={() => onSort('score')}
                      className="flex items-center text-xs font-semibold text-gray-700 uppercase tracking-wider hover:text-[#49997E] transition-colors"
                    >
                      SPT Score
                      <SortIcon column="score" />
                    </button>
                    <InfoTooltip 
                      content="compares protocols against category peers (dex vs dex, lending vs lending) using z-score normalization. range: 0.20-0.60. higher = better."
                      position="bottom"
                      maxWidth="600px"
                    />
                  </div>
                </th>
                <th className="w-[10%] px-6 py-4 align-middle">
                  <div className="flex items-center justify-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    <span>Trend</span>
                    <InfoTooltip 
                      content="protocol's current performance vs its own 90-day average. 📈 growing = above baseline, ➡️ stable = at baseline, 📉 declining = below baseline."
                      position="bottom"
                      maxWidth="600px"
                    />
                  </div>
                </th>
                <th className="w-[12%] px-6 py-4 align-middle">
                  <button
                    onClick={() => onSort('change24h')}
                    className="flex items-center justify-center w-full text-xs font-semibold text-gray-700 uppercase tracking-wider hover:text-[#49997E] transition-colors"
                  >
                    Δ 24h
                    <SortIcon column="change24h" />
                  </button>
                </th>
                <th className="w-[14.33%] px-6 py-4 align-middle">
                  <button
                    onClick={() => onSort('change7d')}
                    className="flex items-center justify-center w-full text-xs font-semibold text-gray-700 uppercase tracking-wider hover:text-[#49997E] transition-colors"
                  >
                    Δ 7d
                    <SortIcon column="change7d" />
                  </button>
                </th>
                <th className="w-[14.34%] px-6 py-4 align-middle">
                  <button
                    onClick={() => onSort('change30d')}
                    className="flex items-center justify-center w-full text-xs font-semibold text-gray-700 uppercase tracking-wider hover:text-[#49997E] transition-colors"
                  >
                    Δ 30d
                    <SortIcon column="change30d" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {sortedProtocols.map((protocol, index) => {
                const rating = getScoreRating(protocol.score);
                return (
                  <tr
                    key={protocol.protocol}
                    className="hover:bg-gradient-to-r hover:from-[#49997E]/5 hover:to-transparent transition-all duration-200 group"
                  >
                    <td className="px-6 py-5 align-middle">
                      <button
                        onClick={() => {
                          const slug = protocol.slug || PROTOCOL_SLUGS[protocol.protocol];
                          if (slug) router.push(`/protocol/${slug}`);
                        }}
                        className="w-full text-left group-hover:translate-x-1 transition-transform duration-200"
                      >
                        <div className="flex items-center gap-3">
                          {protocol.logo && (
                            <img 
                              src={protocol.logo} 
                              alt={`${protocol.protocol} logo`}
                              className="w-8 h-8 rounded-full"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          )}
                          <div className="flex items-center gap-2.5">
                            <span className="text-body-lg font-semibold text-gray-900 group-hover:text-[#49997E] transition-colors">
                              {protocol.protocol}
                            </span>
                            <span className="text-gray-300 group-hover:text-[#49997E] transition-colors text-body-sm">→</span>
                          </div>
                        </div>
                      </button>
                    </td>
                    <td className="px-6 py-5 align-middle">
                      <div className="flex justify-center">
                        <span className={`inline-flex items-center justify-center px-3 py-1.5 rounded-md text-xs font-bold ${rating.color} min-w-[50px]`}>
                          {rating.label}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 align-middle">
                      <div className="flex justify-center">
                        <span className="text-lg font-bold text-[#49997E] tabular-nums">{formatScore(protocol.score)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 align-middle">
                      <div className="flex justify-center items-center gap-1.5" title={`Momentum Score: ${protocol.momentumScore?.toFixed(4) || 'N/A'}`}>
                        {protocol.momentum === 'growing' && <span className="text-2xl">📈</span>}
                        {protocol.momentum === 'declining' && <span className="text-2xl">📉</span>}
                        {protocol.momentum === 'stable' && <span className="text-2xl">➡️</span>}
                        {!protocol.momentum && <span className="text-gray-400">—</span>}
                      </div>
                    </td>
                    <td className="px-6 py-5 align-middle">
                      <div className="flex justify-center text-sm font-semibold tabular-nums">
                        {(() => {
                          const change = formatChange(protocol.change24h);
                          if (change.type === 'new') {
                            return <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs font-medium rounded-full">NEW</span>;
                          }
                          return <span className={change.color}>{change.arrow} {change.value}%</span>;
                        })()}
                      </div>
                    </td>
                    <td className="px-6 py-5 align-middle">
                      <div className="flex justify-center text-sm font-semibold tabular-nums">
                        {(() => {
                          const change = formatChange(protocol.change7d);
                          if (change.type === 'new') {
                            return <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs font-medium rounded-full">NEW</span>;
                          }
                          return <span className={change.color}>{change.arrow} {change.value}%</span>;
                        })()}
                      </div>
                    </td>
                    <td className="px-6 py-5 align-middle">
                      <div className="flex justify-center text-sm font-semibold tabular-nums">
                        {(() => {
                          const change = formatChange(protocol.change30d);
                          if (change.type === 'new') {
                            return <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs font-medium rounded-full">NEW</span>;
                          }
                          return <span className={change.color}>{change.arrow} {change.value}%</span>;
                        })()}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

