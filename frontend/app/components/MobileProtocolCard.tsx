import Link from 'next/link';
import Image from 'next/image';
import { Protocol } from '../types';
import { PROTOCOL_SLUGS, formatChange, getScoreRating, formatScore } from '../utils';

interface MobileProtocolCardProps {
  protocol: Protocol;
  index: number;
}

export default function MobileProtocolCard({ protocol, index }: MobileProtocolCardProps) {
  const rating = getScoreRating(protocol.score);
  const slug = protocol.slug || PROTOCOL_SLUGS[protocol.protocol];
  
  return (
    <Link
      href={slug ? `/protocol/${slug}` : '#'}
      className="block bg-white/80 backdrop-blur-sm rounded-xl p-4 active:scale-[0.98] transition-all cursor-pointer border border-gray-200/60 shadow-sm hover:shadow-md hover:border-[#49997E]/30 group"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Rank Badge */}
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center text-xs font-bold border border-gray-100">
            {index + 1}
          </div>
          
          {/* Logo & Name */}
          <div className="flex items-center gap-3 min-w-0">
            {protocol.logo && (
              <div className="relative w-10 h-10 flex-shrink-0 rounded-xl overflow-hidden bg-gray-50 p-0.5 border border-gray-100">
                <Image 
                  src={protocol.logo} 
                  alt={`${protocol.protocol} logo`}
                  fill
                  className="object-contain"
                />
              </div>
            )}
            <div className="min-w-0">
              <div className="text-gray-900 font-bold text-base truncate group-hover:text-[#49997E] transition-colors">
                {protocol.protocol}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide border ${rating.color} bg-opacity-50`}>
                  {rating.label}
                </span>
                {protocol.momentum && (
                  <span className="text-xs opacity-80" title={`Momentum: ${protocol.momentum}`}>
                    {protocol.momentum === 'growing' && '📈'}
                    {protocol.momentum === 'declining' && '📉'}
                    {protocol.momentum === 'stable' && '➡️'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Score */}
        <div className="text-right">
          <div className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-0.5">SPT Score</div>
          <div className="text-lg font-bold text-gray-900 tabular-nums leading-none">
            {formatScore(protocol.score)}
          </div>
        </div>
      </div>
      
      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100">
        {/* 24h Change */}
        <div className="flex flex-col">
          <span className="text-[10px] text-gray-400 uppercase font-medium">24h</span>
          <div className="text-xs font-bold tabular-nums mt-0.5">
            {(() => {
              const change = formatChange(protocol.change24h);
              if (change.type === 'new') return <span className="text-blue-600">NEW</span>;
              return <span className={change.color}>{change.value}%</span>;
            })()}
          </div>
        </div>

        {/* 7d Change */}
        <div className="flex flex-col text-center">
          <span className="text-[10px] text-gray-400 uppercase font-medium">7d</span>
          <div className="text-xs font-bold tabular-nums mt-0.5">
            {(() => {
              const change = formatChange(protocol.change7d);
              if (change.type === 'new') return <span className="text-blue-600">NEW</span>;
              return <span className={change.color}>{change.value}%</span>;
            })()}
          </div>
        </div>

        {/* 30d Change */}
        <div className="flex flex-col text-right">
          <span className="text-[10px] text-gray-400 uppercase font-medium">30d</span>
          <div className="text-xs font-bold tabular-nums mt-0.5">
            {(() => {
              const change = formatChange(protocol.change30d);
              if (change.type === 'new') return <span className="text-blue-600">NEW</span>;
              return <span className={change.color}>{change.value}%</span>;
            })()}
          </div>
        </div>
      </div>
    </Link>
  );
}
