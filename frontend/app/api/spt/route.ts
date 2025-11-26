import { NextResponse } from 'next/server';

// This API route acts as a caching proxy between frontend and Railway backend
// Vercel will cache this for 24h, so all users share the same cached data

export const revalidate = 86400; // 24 hours

export async function GET() {
  try {
    const RAILWAY_API = 'https://spt-index-production.up.railway.app/api/spt';
    
    console.log('🔄 Fetching from Railway backend (cached for 24h)...');
    
    const res = await fetch(RAILWAY_API, {
      next: { revalidate: 86400 }, // Cache for 24h on Vercel edge
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!res.ok) {
      throw new Error(`Backend returned ${res.status}`);
    }
    
    const data = await res.json();
    
    console.log('✅ Data fetched and cached');
    
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200',
      },
    });
  } catch (error) {
    console.error('❌ Error fetching from backend:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}

