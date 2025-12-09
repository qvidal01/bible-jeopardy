import { NextResponse } from 'next/server';
import { getConnectionStats, CONNECTION_LIMITS } from '@/lib/connectionStore';

// GET /api/connections/status - Get current connection stats
export async function GET() {
  const stats = getConnectionStats();

  return NextResponse.json({
    ...stats,
    limits: CONNECTION_LIMITS,
    timestamp: Date.now(),
  });
}
