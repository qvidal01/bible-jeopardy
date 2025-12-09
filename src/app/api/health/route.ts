import { NextResponse } from 'next/server';

/**
 * Health check endpoint for Docker and monitoring
 * GET /api/health
 */
export async function GET() {
  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '0.1.0',
    environment: process.env.NODE_ENV || 'development',
    checks: {
      server: 'ok',
      memory: getMemoryStatus(),
    },
  };

  return NextResponse.json(healthCheck, {
    status: 200,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}

function getMemoryStatus(): 'ok' | 'warning' | 'critical' {
  const used = process.memoryUsage();
  const heapUsedMB = Math.round(used.heapUsed / 1024 / 1024);
  const heapTotalMB = Math.round(used.heapTotal / 1024 / 1024);
  const usagePercent = (heapUsedMB / heapTotalMB) * 100;

  if (usagePercent > 90) return 'critical';
  if (usagePercent > 75) return 'warning';
  return 'ok';
}
