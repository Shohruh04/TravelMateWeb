import { Hono } from 'hono';
import { prisma } from '../db/client';

const health = new Hono();

/**
 * Health Check Endpoint
 * Returns server status and database connectivity
 */
health.get('/', async (c) => {
  try {
    // Check database connectivity
    await prisma.$queryRaw`SELECT 1`;

    return c.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'connected',
      version: '1.0.0',
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return c.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      503
    );
  }
});

export default health;
