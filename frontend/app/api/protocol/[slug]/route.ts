import { NextResponse } from 'next/server';

// This API route acts as a caching proxy for protocol detail pages
// Vercel will cache this for 24h, so all users share the same cached data

export const revalidate = 86400; // 24 hours

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const RAILWAY_API = `https://spt-index-production.up.railway.app/api/protocol/${slug}`;
    
    console.log(`🔄 Fetching ${slug} from Railway backend (cached for 24h)...`);
    
    const res = await fetch(RAILWAY_API, {
      next: { revalidate: 86400 }, // Cache for 24h on Vercel edge
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!res.ok) {
      if (res.status === 404) {
        return NextResponse.json(
          { error: 'Protocol not found' },
          { status: 404 }
        );
      }
      throw new Error(`Backend returned ${res.status}`);
    }
    
    const data = await res.json();
    
    console.log(`✅ ${slug} data fetched and cached`);
    
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200',
      },
    });
  } catch (error) {
    console.error('❌ Error fetching protocol data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch protocol data' },
      { status: 500 }
    );
  }
}

