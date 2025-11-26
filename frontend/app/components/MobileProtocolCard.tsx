import Link from 'next/link';
import Image from 'next/image';
import { Protocol } from '../types';
import { PROTOCOL_SLUGS, formatChange, getScoreRating } from '../utils';

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
      className="block bg-white rounded-lg p-3 active:scale-[0.98] transition-transform cursor-pointer border border-gray-200 shadow-sm hover:shadow-md"
    >
      <div className="flex items-center gap-3">
        {/* Rank */}
        <div className="text-gray-400 font-medium text-sm w-6 flex-shrink-0">
          {index + 1}
        </div>
        
        {/* Logo & Name */}
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          {protocol.logo && (
            <div className="relative w-9 h-9 flex-shrink-0">
              <Image 
                src={protocol.logo} 
                alt={`${protocol.protocol} logo`}
                fill
                className="rounded-full object-contain"
              />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="text-gray-900 font-semibold text-base truncate">{protocol.protocol}</div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold ${rating.color}`}>
                {rating.label}
              </span>
              {protocol.momentum && (
                <span className="text-sm" title={`Momentum: ${protocol.momentum}`}>
                  {protocol.momentum === 'growing' && '📈'}
                  {protocol.momentum === 'declining' && '📉'}
                  {protocol.momentum === 'stable' && '➡️'}
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Changes */}
        <div className="flex flex-col gap-1 items-end flex-shrink-0">
            <div className="text-xs font-semibold tabular-nums">
              {(() => {
                const change = formatChange(protocol.change24h);
                if (change.type === 'new') {
                  return <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs font-medium rounded-full">NEW</span>;
                }
                return <span className={change.color}>{change.arrow} {change.value}%</span>;
              })()}
          </div>
            <div className="text-xs font-medium tabular-nums">
              {(() => {
                const change = formatChange(protocol.change7d);
                if (change.type === 'new') {
                  return <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs font-medium rounded-full">NEW</span>;
                }
                return <span className={change.color}>{change.arrow} {change.value}%</span>;
              })()}
          </div>
          <div className="text-[10px] text-gray-500">24h/7d</div>
        </div>
      </div>
    </Link>
  );
}
