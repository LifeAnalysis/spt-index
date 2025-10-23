import { NextResponse } from 'next/server';
import { getSPTIndex } from '@/lib/data';

// List of protocols to fetch
// Limited to top 6 to stay under Vercel free tier 10s timeout
// Using 30-day historical window for faster fetching
const PROTOCOLS = [
  // Top 3 DEXs by TVL
  'uniswap', 'curve-dex', 'pancakeswap',
  // Top 3 Lending by TVL  
  'aave', 'spark', 'morpho'
];

// Additional protocols (add these when you upgrade to Vercel Pro):
// DEX: 'raydium', 'sushiswap', 'balancer', 'orca', 'trader-joe', 'quickswap', 'aerodrome'
// Lending: 'compound-v3', 'makerdao', 'justlend', 'venus', 'radiant', 'benqi'

export const revalidate = 86400; // Revalidate every 24 hours
export const maxDuration = 60; // Maximum execution time: 60 seconds (requires Pro plan, free tier max is 10s)
export const dynamic = 'force-dynamic'; // Force dynamic rendering

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

