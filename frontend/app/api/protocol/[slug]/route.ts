import { NextResponse } from 'next/server';

// Vercel edge cache for protocol detail pages
// Caches Railway backend response for 24h across ALL users

export const revalidate = 86400; // 24 hours

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const RAILWAY_API = `https://spt-index-production.up.railway.app/api/protocol/${slug}`;
    
    console.log(`📡 [EDGE] Fetching ${slug} from Railway...`);
    
    const startTime = Date.now();
    const res = await fetch(RAILWAY_API, {
      next: { revalidate: 86400 }, // Cache on Vercel edge for 24h
      headers: {
        'Content-Type': 'application/json',
      }
    });
    const duration = Date.now() - startTime;
    
    if (!res.ok) {
      if (res.status === 404) {
        return NextResponse.json(
          { error: 'Protocol not found' },
          { status: 404 }
        );
      }
      console.error(`❌ [EDGE] Railway returned ${res.status} for ${slug}`);
      throw new Error(`Backend returned ${res.status}`);
    }
    
    const data = await res.json();
    
    console.log(`✅ [EDGE] ${slug} cached (${duration}ms)`);
    
    return NextResponse.json(data, {
      headers: {
        // Cache on Vercel edge for 24h, serve stale for 12h while revalidating
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200',
        'X-Cache-Duration': duration.toString(),
      },
    });
  } catch (error) {
    console.error('❌ [EDGE] Error fetching protocol data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch protocol data' },
      { status: 500 }
    );
  }
}

