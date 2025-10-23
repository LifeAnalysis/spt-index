import { NextResponse } from 'next/server';
import { getSPTIndex } from '@/lib/data';

// List of protocols to fetch
const PROTOCOLS = [
  // DEXs
  'uniswap', 'curve-dex', 'pancakeswap', 'sushiswap', 'balancer',
  'raydium', 'orca', 'trader-joe', 'quickswap', 'aerodrome',
  // Lending
  'aave', 'compound-v3', 'makerdao', 'morpho', 'spark',
  'justlend', 'venus', 'radiant', 'benqi'
];

export const revalidate = 86400; // Revalidate every 24 hours

export async function GET() {
  try {
    console.log('🔄 Fetching SPT Index data from DeFiLlama...');
    
    const data = await getSPTIndex(PROTOCOLS);
    
    console.log(`✅ Successfully fetched: ${data.dex.length} DEXs, ${data.lending.length} Lending protocols`);
    
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600',
      },
    });
  } catch (error) {
    console.error('❌ Error fetching SPT data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch protocol data' },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    console.log('🔄 Force refresh requested - fetching fresh data...');
    
    // Force fresh data by not using cache
    const data = await getSPTIndex(PROTOCOLS);
    
    console.log(`✅ Successfully refreshed: ${data.dex.length} DEXs, ${data.lending.length} Lending protocols`);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Error forcing refresh:', error);
    return NextResponse.json(
      { error: 'Failed to refresh protocol data' },
      { status: 500 }
    );
  }
}

