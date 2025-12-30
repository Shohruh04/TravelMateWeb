import { Context, Next } from 'hono';
import { verifyToken, getUserById } from '../services/authService';
import type { JWTPayload } from '../services/authService';

// Extend Hono's context to include user information
export interface AuthContext {
  user: {
    id: string;
    email: string;
    name: string | null;
    subscriptionTier: string;
    subscriptionStatus: string | null;
    subscriptionEndDate: Date | null;
    stripeCustomerId: string | null;
  };
}

/**
 * Authentication middleware - validates JWT token and attaches user to context
 */
export async function authMiddleware(c: Context, next: Next) {
  try {
    // Extract token from Authorization header
    const authHeader = c.req.header('Authorization');

    if (!authHeader) {
      return c.json(
        {
          error: 'Unauthorized',
          message: 'No authorization header provided',
        },
        401
      );
    }

    // Check if it's a Bearer token
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return c.json(
        {
          error: 'Unauthorized',
          message: 'Invalid authorization header format. Use: Bearer <token>',
        },
        401
      );
    }

    const token = parts[1];

    // Verify token
    let payload: JWTPayload;
    try {
      payload = verifyToken(token);
    } catch (error) {
      return c.json(
        {
          error: 'Unauthorized',
          message: 'Invalid or expired token',
        },
        401
      );
    }

    // Get user from database
    const user = await getUserById(payload.userId);

    if (!user) {
      return c.json(
        {
          error: 'Unauthorized',
          message: 'User not found',
        },
        401
      );
    }

    // Attach user to context
    c.set('user', user);

    await next();
  } catch (error) {
    console.error('Authentication error:', error);
    return c.json(
      {
        error: 'Internal Server Error',
        message: 'Authentication failed',
      },
      500
    );
  }
}

/**
 * Optional authentication middleware - doesn't fail if no token provided
 * Useful for endpoints that work for both authenticated and unauthenticated users
 */
export async function optionalAuthMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');

  if (authHeader) {
    const parts = authHeader.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      try {
        const token = parts[1];
        const payload = verifyToken(token);
        const user = await getUserById(payload.userId);

        if (user) {
          c.set('user', user);
        }
      } catch (error) {
        // Silently fail - user will be undefined
        console.error('Optional auth error:', error);
      }
    }
  }

  await next();
}

/**
 * Subscription tier middleware - checks if user has required subscription tier
 */
export function requireSubscription(
  allowedTiers: ('FREE' | 'PRO' | 'ENTERPRISE')[]
) {
  return async (c: Context, next: Next) => {
    const user = c.get('user');

    if (!user) {
      return c.json(
        {
          error: 'Unauthorized',
          message: 'Authentication required',
        },
        401
      );
    }

    if (!allowedTiers.includes(user.subscriptionTier as any)) {
      return c.json(
        {
          error: 'Forbidden',
          message: `This feature requires a ${allowedTiers.join(' or ')} subscription`,
          currentTier: user.subscriptionTier,
          requiredTiers: allowedTiers,
        },
        403
      );
    }

    // Check if subscription is active (for paid tiers)
    if (user.subscriptionTier !== 'FREE') {
      if (
        user.subscriptionStatus !== 'active' &&
        user.subscriptionStatus !== 'trialing'
      ) {
        return c.json(
          {
            error: 'Forbidden',
            message: 'Your subscription is not active. Please update your payment method.',
            subscriptionStatus: user.subscriptionStatus,
          },
          403
        );
      }
    }

    await next();
  };
}

/**
 * Rate limiting middleware based on subscription tier
 * Free users: more restrictive limits
 * Paid users: higher limits
 */
interface RateLimitConfig {
  FREE: number;
  PRO: number;
  ENTERPRISE: number;
}

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export function rateLimitByTier(limits: RateLimitConfig) {
  return async (c: Context, next: Next) => {
    const user = c.get('user');

    // If no user, apply FREE tier limits
    const tier = (user?.subscriptionTier as keyof RateLimitConfig) || 'FREE';
    const limit = limits[tier];
    const windowMs = 60 * 60 * 1000; // 1 hour window

    const key = user ? `user:${user.id}` : `ip:${c.req.header('x-forwarded-for') || 'unknown'}`;
    const now = Date.now();

    let record = rateLimitStore.get(key);

    // Reset if window has passed
    if (!record || now > record.resetAt) {
      record = { count: 0, resetAt: now + windowMs };
      rateLimitStore.set(key, record);
    }

    record.count++;

    // Set rate limit headers
    c.header('X-RateLimit-Limit', limit.toString());
    c.header('X-RateLimit-Remaining', Math.max(0, limit - record.count).toString());
    c.header('X-RateLimit-Reset', new Date(record.resetAt).toISOString());

    if (record.count > limit) {
      return c.json(
        {
          error: 'Too Many Requests',
          message: `Rate limit exceeded. Your tier (${tier}) allows ${limit} requests per hour.`,
          retryAfter: new Date(record.resetAt).toISOString(),
        },
        429
      );
    }

    await next();
  };
}
