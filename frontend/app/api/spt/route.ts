import { NextResponse } from 'next/server';

// Vercel edge cache for SPT index data
// Caches Railway backend response for 24h across ALL users

export const revalidate = 86400; // 24 hours

export async function GET() {
  try {
    const RAILWAY_API = 'https://spt-index-production.up.railway.app/api/spt';
    
    console.log('📡 [EDGE] Fetching SPT index from Railway...');
    
    const startTime = Date.now();
    const res = await fetch(RAILWAY_API, {
      next: { revalidate: 86400 }, // Cache on Vercel edge for 24h
      headers: {
        'Content-Type': 'application/json',
      }
    });
    const duration = Date.now() - startTime;
    
    if (!res.ok) {
      console.error(`❌ [EDGE] Railway returned ${res.status}`);
      throw new Error(`Backend returned ${res.status}`);
    }
    
    const data = await res.json();
    
    console.log(`✅ [EDGE] SPT index cached (${duration}ms)`);
    
    return NextResponse.json(data, {
      headers: {
        // Cache on Vercel edge for 24h, serve stale for 12h while revalidating
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200',
        'X-Cache-Duration': duration.toString(),
      },
    });
  } catch (error) {
    console.error('❌ [EDGE] Error fetching SPT index:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}

