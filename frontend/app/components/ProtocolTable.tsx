import Link from 'next/link';
import Image from 'next/image';
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
      return <span className="text-gray-300 ml-1 text-[10px]">⇅</span>;
    }
    return sortDirection === 'asc' ? 
      <span className="text-[#49997E] ml-1 text-[10px]">▲</span> : 
      <span className="text-[#49997E] ml-1 text-[10px]">▼</span>;
  };

  // Helper for Change Badges
  const ChangeBadge = ({ value }: { value: number | null | undefined }) => {
    if (value === null || value === undefined || isNaN(value)) {
      return <span className="text-gray-300 font-medium text-xs">N/A</span>;
    }
    const isPositive = value >= 0;
    const bgClass = isPositive ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100';
    
    return (
      <div className={`inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-xs font-bold border ${bgClass} min-w-[70px]`}>
        {value > 0 ? '+' : ''}{value.toFixed(2)}%
      </div>
    );
  };

  return (
    <div className="mb-8 animate-fade-in">
      <div className="mb-5 hidden md:block">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl p-2 bg-white rounded-xl shadow-sm border border-gray-100">{icon}</span>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h2>
        </div>
        <p className="text-sm text-gray-500 max-w-2xl ml-14 leading-relaxed">{description}</p>
      </div>
      
      {/* Mobile Title */}
      <div className="md:hidden mb-3">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          {title}
        </h2>
        <p className="text-xs text-gray-500 mt-1 leading-relaxed">{description}</p>
      </div>

      {/* Mobile Cards (< 768px) */}
      <div className="md:hidden space-y-3">
        {sortedProtocols.map((protocol, index) => (
          <MobileProtocolCard key={protocol.protocol} protocol={protocol} index={index} />
        ))}
      </div>

      {/* Desktop Table (>= 768px) */}
      <div className="hidden md:block bg-glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <thead>
              <tr className="bg-white/50 border-b border-gray-200/50">
                <th className="w-[28%] px-6 py-4">
                  <button
                    onClick={() => onSort('protocol')}
                    className="flex items-center gap-1 text-xs font-bold text-gray-500 uppercase tracking-wider hover:text-[#49997E] transition-colors"
                  >
                    Protocol
                    <SortIcon column="protocol" />
                  </button>
                </th>
                <th className="w-[12%] px-4 py-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => onSort('rating')}
                      className="flex items-center text-xs font-bold text-gray-500 uppercase tracking-wider hover:text-[#49997E] transition-colors"
                    >
                      Rating
                      <SortIcon column="rating" />
                    </button>
                    <InfoTooltip content="Credit-style rating (AAA to B) based on efficiency." position="top" />
                  </div>
                </th>
                <th className="w-[15%] px-4 py-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => onSort('score')}
                      className="flex items-center text-xs font-bold text-gray-500 uppercase tracking-wider hover:text-[#49997E] transition-colors"
                    >
                      Score
                      <SortIcon column="score" />
                    </button>
                    <InfoTooltip content="0-1 normalized efficiency score." position="top" />
                  </div>
                </th>
                <th className="w-[12%] px-4 py-4 text-center">
                  <div className="flex items-center justify-center gap-1 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Trend
                    <InfoTooltip content="Momentum vs 90d average." position="top" />
                  </div>
                </th>
                <th className="w-[11%] px-4 py-4 text-right">
                  <button onClick={() => onSort('change24h')} className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 uppercase tracking-wider hover:text-[#49997E]">
                    24h <SortIcon column="change24h" />
                  </button>
                </th>
                <th className="w-[11%] px-4 py-4 text-right">
                  <button onClick={() => onSort('change7d')} className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 uppercase tracking-wider hover:text-[#49997E]">
                    7d <SortIcon column="change7d" />
                  </button>
                </th>
                <th className="w-[11%] px-4 py-4 text-right">
                  <button onClick={() => onSort('change30d')} className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 uppercase tracking-wider hover:text-[#49997E]">
                    30d <SortIcon column="change30d" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sortedProtocols.map((protocol) => {
                const rating = getScoreRating(protocol.score);
                return (
                  <tr
                    key={protocol.protocol}
                    className="group hover:bg-blue-50/30 transition-colors duration-200"
                  >
                    {/* Protocol Name & Logo */}
                    <td className="px-6 py-4">
                      <Link
                        href={(() => {
                          const slug = protocol.slug || PROTOCOL_SLUGS[protocol.protocol];
                          return slug ? `/protocol/${slug}` : '#';
                        })()}
                        className="flex items-center gap-4 w-full text-left group-hover:translate-x-1 transition-transform duration-200"
                      >
                        <div className="relative w-10 h-10 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {protocol.logo ? (
                            <div className="relative w-8 h-8">
                              <Image 
                                src={protocol.logo} 
                                alt={protocol.protocol}
                                fill
                                className="object-contain"
                              />
                            </div>
                          ) : (
                            <span className="text-lg">{icon}</span>
                          )}
                        </div>
                        <span className="text-sm font-bold text-gray-900 group-hover:text-[#49997E] transition-colors">
                          {protocol.protocol}
                        </span>
                      </Link>
                    </td>

                    {/* Rating */}
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center justify-center w-12 h-7 rounded-lg text-xs font-bold border ${rating.color} shadow-sm`}>
                        {rating.label}
                      </span>
                    </td>

                    {/* Score with Bar */}
                    <td className="px-4 py-4">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-sm font-bold text-gray-900 tabular-nums">
                          {formatScore(protocol.score)}
                        </span>
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#49997E] rounded-full"
                            style={{ width: `${Math.min(protocol.score * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Trend Pill */}
                    <td className="px-4 py-4 text-center">
                      {protocol.momentum === 'growing' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wide border border-emerald-200">
                          Growing
                        </span>
                      )}
                      {protocol.momentum === 'declining' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold uppercase tracking-wide border border-rose-200">
                          Declining
                        </span>
                      )}
                      {protocol.momentum === 'stable' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wide border border-blue-200">
                          Stable
                        </span>
                      )}
                      {!protocol.momentum && <span className="text-gray-300">N/A</span>}
                    </td>

                    {/* Changes */}
                    <td className="px-4 py-4 text-right">
                      <ChangeBadge value={protocol.change24h} />
                    </td>
                    <td className="px-4 py-4 text-right">
                      <ChangeBadge value={protocol.change7d} />
                    </td>
                    <td className="px-4 py-4 text-right">
                      <ChangeBadge value={protocol.change30d} />
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
