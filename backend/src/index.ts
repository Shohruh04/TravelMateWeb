import { Hono } from 'hono';
import { corsMiddleware } from './middleware/cors';
import { errorHandler, logger } from './middleware/errorHandler';
import healthRoutes from './routes/health';
import destinationRoutes from './routes/destinations';
import searchRoutes from './routes/search';
import flightRoutes from './routes/flights';
import toolsRoutes from './routes/tools';
import authRoutes from './routes/auth';
import paymentRoutes from './routes/payment';

const app = new Hono();

// Apply global middleware
app.use('*', corsMiddleware);
app.use('*', logger);

// Root endpoint
app.get('/', (c) => {
  return c.json({
    message: 'TravelMate API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      destinations: '/api/destinations',
      search: '/api/search',
      flights: '/api/flights',
      tools: '/api/tools',
      auth: '/api/auth',
      payment: '/api/payment',
    },
  });
});

// Mount routes
app.route('/health', healthRoutes);
app.route('/api/destinations', destinationRoutes);
app.route('/api/search', searchRoutes);
app.route('/api/flights', flightRoutes);
app.route('/api/tools', toolsRoutes);
app.route('/api/auth', authRoutes);
app.route('/api/payment', paymentRoutes);

// 404 handler
app.notFound((c) => {
  return c.json(
    {
      error: 'Not Found',
      message: `Route ${c.req.method} ${c.req.path} not found`,
    },
    404
  );
});

// Error handler (must be last)
app.onError(errorHandler);

// Start server
const port = parseInt(process.env.PORT || '3001', 10);

console.log(`Starting TravelMate API server...`);
console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`Port: ${port}`);

export default {
  port,
  fetch: app.fetch,
};
