import { NextResponse } from 'next/server';

// Cron job to keep Railway backend warm
// Runs every 10 minutes to prevent cold starts

export async function GET() {
  try {
    const RAILWAY_API = 'https://spt-index-production.up.railway.app/health';
    
    console.log('🔥 [CRON] Pinging Railway to keep warm...');
    
    const startTime = Date.now();
    const res = await fetch(RAILWAY_API, {
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });
    const duration = Date.now() - startTime;
    
    if (!res.ok) {
      console.error(`❌ [CRON] Railway health check failed: ${res.status}`);
      return NextResponse.json(
        { 
          success: false, 
          error: `Railway returned ${res.status}`,
          duration 
        },
        { status: 500 }
      );
    }
    
    const data = await res.json();
    
    console.log(`✅ [CRON] Railway is warm (${duration}ms)`);
    
    return NextResponse.json({
      success: true,
      railway: data,
      duration,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [CRON] Error keeping Railway warm:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

