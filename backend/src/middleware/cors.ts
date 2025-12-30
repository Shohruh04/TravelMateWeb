import { Context, Next } from 'hono';

/**
 * CORS Middleware
 * Allows cross-origin requests from the frontend application
 */
export const corsMiddleware = async (c: Context, next: Next) => {
  const origin = c.req.header('Origin');
  const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ];

  // Check if origin is allowed
  if (origin && allowedOrigins.includes(origin)) {
    c.header('Access-Control-Allow-Origin', origin);
  } else {
    // Default to first allowed origin for preflight requests
    c.header('Access-Control-Allow-Origin', allowedOrigins[0]);
  }

  c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  c.header('Access-Control-Allow-Credentials', 'true');
  c.header('Access-Control-Max-Age', '86400'); // 24 hours

  // Handle preflight requests
  if (c.req.method === 'OPTIONS') {
    return c.text('', 204);
  }

  await next();
};
