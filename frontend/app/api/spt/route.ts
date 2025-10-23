import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

export async function GET() {
  try {
    // Fetch from backend with Next.js caching
    const res = await fetch(`${BACKEND_URL}/api/spt`, {
      // Revalidate every 24 hours (86400 seconds)
      next: { revalidate: 86400 }
    });
    
    if (!res.ok) {
      throw new Error(`Backend API returned ${res.status}`);
    }
    
    const data = await res.json();
    
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600',
      },
    });
  } catch (error) {
    console.error('Error fetching SPT data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch protocol data' },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    // Force refresh - bypass cache
    const res = await fetch(`${BACKEND_URL}/api/spt/refresh`, {
      method: 'POST',
      cache: 'no-store'
    });
    
    if (!res.ok) {
      throw new Error(`Backend API returned ${res.status}`);
    }
    
    const data = await res.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error forcing refresh:', error);
    return NextResponse.json(
      { error: 'Failed to refresh protocol data' },
      { status: 500 }
    );
  }
}

