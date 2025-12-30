import Stripe from 'stripe';
import { prisma } from '../db/client';
import type { SubscriptionTier } from '@prisma/client';

// Initialize Stripe with API key
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY environment variable is not set');
}

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

// Pricing configuration - centralized pricing logic
export const PRICING_CONFIG = {
  FREE: {
    name: 'Free',
    price: 0,
    billingPeriod: 'forever' as const,
    features: [
      'Basic destination search',
      'Limited to 10 searches per day',
      'Standard support',
      'Basic travel information',
    ],
  },
  PRO: {
    name: 'Pro',
    prices: {
      monthly: 9.99,
      annual: 99.0,
    },
    stripePriceIds: {
      monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || 'price_pro_monthly',
      annual: process.env.STRIPE_PRO_ANNUAL_PRICE_ID || 'price_pro_annual',
    },
    features: [
      'Unlimited searches',
      'Advanced filters and sorting',
      'Priority support',
      'Ad-free experience',
      'Save favorite destinations',
      'Export itineraries to PDF',
    ],
  },
  ENTERPRISE: {
    name: 'Enterprise',
    prices: {
      monthly: 49.99,
      annual: 499.0,
    },
    stripePriceIds: {
      monthly: process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID || 'price_enterprise_monthly',
      annual: process.env.STRIPE_ENTERPRISE_ANNUAL_PRICE_ID || 'price_enterprise_annual',
    },
    features: [
      'All Pro features',
      'API access for integrations',
      'Custom branding options',
      'Dedicated account manager',
      'Priority feature requests',
      'White-label solutions',
      '99.9% SLA guarantee',
    ],
  },
} as const;

interface CreateCheckoutSessionParams {
  userId: string;
  tier: SubscriptionTier;
  billingPeriod: 'monthly' | 'annual';
  successUrl: string;
  cancelUrl: string;
}

/**
 * Creates or retrieves a Stripe customer for a user
 */
export async function getOrCreateStripeCustomer(userId: string, email: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true },
  });

  if (user?.stripeCustomerId) {
    return user.stripeCustomerId;
  }

  // Create new Stripe customer
  const customer = await stripe.customers.create({
    email,
    metadata: {
      userId,
    },
  });

  // Save customer ID to database
  await prisma.user.update({
    where: { id: userId },
    data: { stripeCustomerId: customer.id },
  });

  return customer.id;
}

/**
 * Creates a Stripe Checkout session for subscription purchase
 */
export async function createCheckoutSession(
  params: CreateCheckoutSessionParams
): Promise<Stripe.Checkout.Session> {
  const { userId, tier, billingPeriod, successUrl, cancelUrl } = params;

  // Free tier doesn't need Stripe checkout
  if (tier === 'FREE') {
    throw new Error('Free tier does not require checkout');
  }

  // Get user to retrieve email and customer ID
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, stripeCustomerId: true },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Get or create Stripe customer
  const customerId = await getOrCreateStripeCustomer(userId, user.email);

  // Get price ID from configuration
  const priceId = PRICING_CONFIG[tier].stripePriceIds[billingPeriod];

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId,
      tier,
      billingPeriod,
    },
    subscription_data: {
      metadata: {
        userId,
        tier,
      },
    },
    allow_promotion_codes: true,
  });

  return session;
}

/**
 * Creates a Customer Portal session for managing subscriptions
 */
export async function createCustomerPortalSession(
  userId: string,
  returnUrl: string
): Promise<Stripe.BillingPortal.Session> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true, email: true },
  });

  if (!user) {
    throw new Error('User not found');
  }

  if (!user.stripeCustomerId) {
    throw new Error('User does not have a Stripe customer ID');
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: returnUrl,
  });

  return session;
}

/**
 * Retrieves subscription details for a user
 */
export async function getSubscriptionDetails(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      subscriptionTier: true,
      subscriptionStatus: true,
      subscriptionEndDate: true,
      stripeCustomerId: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  let stripeSubscription = null;

  // If user has a Stripe customer ID, fetch active subscriptions
  if (user.stripeCustomerId) {
    try {
      const subscriptions = await stripe.subscriptions.list({
        customer: user.stripeCustomerId,
        status: 'active',
        limit: 1,
      });

      if (subscriptions.data.length > 0) {
        stripeSubscription = subscriptions.data[0];
      }
    } catch (error) {
      console.error('Error fetching Stripe subscription:', error);
    }
  }

  return {
    tier: user.subscriptionTier,
    status: user.subscriptionStatus,
    endDate: user.subscriptionEndDate,
    stripeSubscription,
  };
}

/**
 * Handles checkout session completed webhook
 */
export async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
): Promise<void> {
  const userId = session.metadata?.userId;
  const tier = session.metadata?.tier as SubscriptionTier;
  const billingPeriod = session.metadata?.billingPeriod as 'monthly' | 'annual';

  if (!userId || !tier || !billingPeriod) {
    throw new Error('Missing required metadata in checkout session');
  }

  // Get subscription details
  const subscriptionId = session.subscription as string;
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  // Calculate subscription end date
  const endDate = new Date(subscription.current_period_end * 1000);

  // Update user subscription in database
  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionTier: tier,
      subscriptionStatus: 'active',
      subscriptionEndDate: endDate,
    },
  });

  // Create payment record
  const amount = session.amount_total ? session.amount_total / 100 : 0;
  await prisma.payment.create({
    data: {
      userId,
      stripePaymentId: session.payment_intent as string,
      amount,
      currency: session.currency?.toUpperCase() || 'USD',
      status: 'succeeded',
      tier,
      billingPeriod,
      metadata: {
        subscriptionId: subscriptionId,
        sessionId: session.id,
      },
    },
  });
}

/**
 * Handles subscription updated webhook
 */
export async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription
): Promise<void> {
  const userId = subscription.metadata?.userId;

  if (!userId) {
    console.error('No userId found in subscription metadata');
    return;
  }

  const endDate = new Date(subscription.current_period_end * 1000);
  let status = subscription.status;

  // Update user subscription status
  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionStatus: status,
      subscriptionEndDate: endDate,
    },
  });
}

/**
 * Handles subscription deleted (canceled) webhook
 */
export async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription
): Promise<void> {
  const userId = subscription.metadata?.userId;

  if (!userId) {
    console.error('No userId found in subscription metadata');
    return;
  }

  // Downgrade user to free tier
  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionTier: 'FREE',
      subscriptionStatus: 'canceled',
      subscriptionEndDate: null,
    },
  });
}

/**
 * Verifies Stripe webhook signature
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  secret: string
): Stripe.Event {
  try {
    return stripe.webhooks.constructEvent(payload, signature, secret);
  } catch (error) {
    throw new Error(`Webhook signature verification failed: ${error}`);
  }
}
