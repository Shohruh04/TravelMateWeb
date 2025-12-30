import { Hono } from 'hono';
import { z } from 'zod';
import {
  createCheckoutSession,
  createCustomerPortalSession,
  getSubscriptionDetails,
  verifyWebhookSignature,
  handleCheckoutSessionCompleted,
  handleSubscriptionUpdated,
  handleSubscriptionDeleted,
  PRICING_CONFIG,
} from '../services/stripeService';
import { authMiddleware } from '../middleware/auth';
import type { SubscriptionTier } from '@prisma/client';

const payment = new Hono();

// Validation schemas
const createCheckoutSchema = z.object({
  tier: z.enum(['PRO', 'ENTERPRISE']),
  billingPeriod: z.enum(['monthly', 'annual']),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

const customerPortalSchema = z.object({
  returnUrl: z.string().url().optional(),
});

/**
 * GET /api/payment/pricing
 * Get pricing information for all subscription tiers
 */
payment.get('/pricing', async (c) => {
  try {
    const pricing = {
      tiers: [
        {
          id: 'FREE',
          name: PRICING_CONFIG.FREE.name,
          price: PRICING_CONFIG.FREE.price,
          billingPeriod: PRICING_CONFIG.FREE.billingPeriod,
          features: PRICING_CONFIG.FREE.features,
        },
        {
          id: 'PRO',
          name: PRICING_CONFIG.PRO.name,
          prices: PRICING_CONFIG.PRO.prices,
          features: PRICING_CONFIG.PRO.features,
        },
        {
          id: 'ENTERPRISE',
          name: PRICING_CONFIG.ENTERPRISE.name,
          prices: PRICING_CONFIG.ENTERPRISE.prices,
          features: PRICING_CONFIG.ENTERPRISE.features,
        },
      ],
    };

    return c.json(pricing);
  } catch (error) {
    console.error('Get pricing error:', error);

    return c.json(
      {
        error: 'Internal Server Error',
        message: 'Failed to retrieve pricing information',
      },
      500
    );
  }
});

/**
 * POST /api/payment/create-checkout-session
 * Create a Stripe checkout session for subscription purchase
 * Requires authentication
 */
payment.post('/create-checkout-session', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const body = await c.req.json();

    // Validate input
    const validationResult = createCheckoutSchema.safeParse(body);
    if (!validationResult.success) {
      return c.json(
        {
          error: 'Validation Error',
          message: 'Invalid input data',
          details: validationResult.error.errors,
        },
        400
      );
    }

    const { tier, billingPeriod, successUrl, cancelUrl } = validationResult.data;

    // Default URLs if not provided
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const defaultSuccessUrl = `${frontendUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`;
    const defaultCancelUrl = `${frontendUrl}/pricing`;

    // Create checkout session
    const session = await createCheckoutSession({
      userId: user.id,
      tier: tier as SubscriptionTier,
      billingPeriod,
      successUrl: successUrl || defaultSuccessUrl,
      cancelUrl: cancelUrl || defaultCancelUrl,
    });

    return c.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Create checkout session error:', error);

    if (error instanceof Error) {
      return c.json(
        {
          error: 'Bad Request',
          message: error.message,
        },
        400
      );
    }

    return c.json(
      {
        error: 'Internal Server Error',
        message: 'Failed to create checkout session',
      },
      500
    );
  }
});

/**
 * POST /api/payment/create-customer-portal-session
 * Create a Stripe Customer Portal session for managing subscriptions
 * Requires authentication
 */
payment.post('/create-customer-portal-session', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const body = await c.req.json().catch(() => ({}));

    // Validate input
    const validationResult = customerPortalSchema.safeParse(body);
    if (!validationResult.success) {
      return c.json(
        {
          error: 'Validation Error',
          message: 'Invalid input data',
          details: validationResult.error.errors,
        },
        400
      );
    }

    const { returnUrl } = validationResult.data;

    // Default return URL if not provided
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const defaultReturnUrl = `${frontendUrl}/account`;

    // Create customer portal session
    const session = await createCustomerPortalSession(
      user.id,
      returnUrl || defaultReturnUrl
    );

    return c.json({
      url: session.url,
    });
  } catch (error) {
    console.error('Create customer portal session error:', error);

    if (error instanceof Error) {
      return c.json(
        {
          error: 'Bad Request',
          message: error.message,
        },
        400
      );
    }

    return c.json(
      {
        error: 'Internal Server Error',
        message: 'Failed to create customer portal session',
      },
      500
    );
  }
});

/**
 * GET /api/payment/subscription-status
 * Get current user's subscription status
 * Requires authentication
 */
payment.get('/subscription-status', authMiddleware, async (c) => {
  try {
    const user = c.get('user');

    const subscription = await getSubscriptionDetails(user.id);

    return c.json({
      tier: subscription.tier,
      status: subscription.status,
      endDate: subscription.endDate,
      isActive:
        subscription.tier === 'FREE' ||
        subscription.status === 'active' ||
        subscription.status === 'trialing',
    });
  } catch (error) {
    console.error('Get subscription status error:', error);

    if (error instanceof Error) {
      return c.json(
        {
          error: 'Bad Request',
          message: error.message,
        },
        400
      );
    }

    return c.json(
      {
        error: 'Internal Server Error',
        message: 'Failed to retrieve subscription status',
      },
      500
    );
  }
});

/**
 * POST /api/payment/webhook
 * Handle Stripe webhook events
 * This endpoint is called by Stripe, not by the client
 * SECURITY: Verifies webhook signature to ensure request is from Stripe
 */
payment.post('/webhook', async (c) => {
  try {
    // Get raw body and signature
    const signature = c.req.header('stripe-signature');
    if (!signature) {
      return c.json(
        {
          error: 'Bad Request',
          message: 'Missing stripe-signature header',
        },
        400
      );
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET is not set');
      return c.json(
        {
          error: 'Internal Server Error',
          message: 'Webhook secret not configured',
        },
        500
      );
    }

    // Get raw body as text for signature verification
    const rawBody = await c.req.text();

    // Verify webhook signature
    let event;
    try {
      event = verifyWebhookSignature(rawBody, signature, webhookSecret);
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      return c.json(
        {
          error: 'Bad Request',
          message: 'Invalid signature',
        },
        400
      );
    }

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        console.log('Checkout session completed:', session.id);
        await handleCheckoutSessionCompleted(session as any);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        console.log('Subscription updated:', subscription.id);
        await handleSubscriptionUpdated(subscription as any);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        console.log('Subscription deleted:', subscription.id);
        await handleSubscriptionDeleted(subscription as any);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any;
        console.log('Payment failed for invoice:', invoice.id);
        // Could send email notification to user
        // Could update subscription status to past_due
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any;
        console.log('Payment succeeded for invoice:', invoice.id);
        // Could send receipt email to user
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Return success response to Stripe
    return c.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);

    return c.json(
      {
        error: 'Internal Server Error',
        message: 'Webhook processing failed',
      },
      500
    );
  }
});

export default payment;
