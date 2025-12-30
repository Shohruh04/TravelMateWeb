# Payment & Subscription System Setup Guide

This guide explains how to set up and use the Stripe-based payment and subscription system for TravelMate.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Database Setup](#database-setup)
3. [Stripe Configuration](#stripe-configuration)
4. [Environment Variables](#environment-variables)
5. [API Endpoints](#api-endpoints)
6. [Testing](#testing)
7. [Security Notes](#security-notes)

## Prerequisites

- Bun runtime installed
- PostgreSQL database running
- Stripe account (use test mode for development)

## Database Setup

### 1. Install Dependencies

```bash
cd backend
bun install
```

This will install the new dependencies:
- `stripe` - Stripe SDK for Node.js
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT token generation and verification

### 2. Generate Prisma Client

```bash
bun run db:generate
```

### 3. Run Database Migration

```bash
bun run db:migrate
```

This will create the new tables:
- `users` - User accounts with subscription information
- `payments` - Payment transaction records

### 4. (Optional) Seed Test Data

You can create test users manually using the `/api/auth/register` endpoint.

## Stripe Configuration

### 1. Create a Stripe Account

- Go to https://stripe.com and sign up
- Use **Test Mode** for development (toggle in the dashboard)

### 2. Get Your API Keys

Navigate to **Developers > API Keys** in Stripe Dashboard:

- Copy your **Publishable Key** (starts with `pk_test_`)
- Copy your **Secret Key** (starts with `sk_test_`)

### 3. Create Products and Prices

In Stripe Dashboard, go to **Products** and create:

#### Pro Subscription
- Name: "TravelMate Pro"
- Create two prices:
  - **Monthly**: $9.99/month, recurring
  - **Annual**: $99/year, recurring
- Copy the Price IDs (start with `price_`)

#### Enterprise Subscription
- Name: "TravelMate Enterprise"
- Create two prices:
  - **Monthly**: $49.99/month, recurring
  - **Annual**: $499/year, recurring
- Copy the Price IDs

### 4. Set Up Webhooks

In Stripe Dashboard, go to **Developers > Webhooks**:

1. Click **Add endpoint**
2. Set endpoint URL: `https://your-domain.com/api/payment/webhook`
   - For local development, use a tool like [Stripe CLI](https://stripe.com/docs/stripe-cli) or [ngrok](https://ngrok.com/)
3. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
   - `invoice.payment_succeeded`
4. Copy the **Signing Secret** (starts with `whsec_`)

## Environment Variables

Create a `.env` file in the `backend` directory (copy from `.env.example`):

```env
# Database
DATABASE_URL="postgresql://travelmate:travelmate_dev_password@localhost:5432/travelmate_db"

# Server
PORT=3001
NODE_ENV=development

# CORS
FRONTEND_URL=http://localhost:5173

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Stripe Payment Processing
STRIPE_SECRET_KEY=sk_test_your_actual_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_actual_webhook_secret

# Stripe Price IDs
STRIPE_PRO_MONTHLY_PRICE_ID=price_your_pro_monthly_id
STRIPE_PRO_ANNUAL_PRICE_ID=price_your_pro_annual_id
STRIPE_ENTERPRISE_MONTHLY_PRICE_ID=price_your_enterprise_monthly_id
STRIPE_ENTERPRISE_ANNUAL_PRICE_ID=price_your_enterprise_annual_id
```

**Important:** Generate a strong JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## API Endpoints

### Authentication Endpoints

#### Register a New User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe"
}
```

Response:
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "clxxx...",
    "email": "user@example.com",
    "name": "John Doe",
    "subscriptionTier": "FREE",
    "subscriptionStatus": null
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Payment Endpoints

#### Get Pricing Information
```http
GET /api/payment/pricing
```

Response:
```json
{
  "tiers": [
    {
      "id": "FREE",
      "name": "Free",
      "price": 0,
      "billingPeriod": "forever",
      "features": [...]
    },
    {
      "id": "PRO",
      "name": "Pro",
      "prices": {
        "monthly": 9.99,
        "annual": 99
      },
      "features": [...]
    },
    {
      "id": "ENTERPRISE",
      "name": "Enterprise",
      "prices": {
        "monthly": 49.99,
        "annual": 499
      },
      "features": [...]
    }
  ]
}
```

#### Create Checkout Session
```http
POST /api/payment/create-checkout-session
Authorization: Bearer <token>
Content-Type: application/json

{
  "tier": "PRO",
  "billingPeriod": "monthly"
}
```

Response:
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/c/pay/cs_test_..."
}
```

Redirect the user to the `url` to complete payment.

#### Get Subscription Status
```http
GET /api/payment/subscription-status
Authorization: Bearer <token>
```

Response:
```json
{
  "tier": "PRO",
  "status": "active",
  "endDate": "2025-01-30T12:00:00.000Z",
  "isActive": true
}
```

#### Create Customer Portal Session
```http
POST /api/payment/create-customer-portal-session
Authorization: Bearer <token>
Content-Type: application/json

{
  "returnUrl": "https://your-app.com/account"
}
```

This allows users to manage their subscription, update payment methods, view invoices, etc.

## Testing

### Testing with Stripe Test Cards

Use these test card numbers in Stripe Checkout (test mode):

- **Success**: `4242 4242 4242 4242`
- **Declined**: `4000 0000 0000 0002`
- **Requires Authentication**: `4000 0025 0000 3155`

Any future expiration date, any 3-digit CVC, any ZIP code.

### Testing Webhooks Locally

#### Option 1: Stripe CLI (Recommended)

```bash
# Install Stripe CLI
# See: https://stripe.com/docs/stripe-cli

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3001/api/payment/webhook

# Copy the webhook signing secret and add to .env
```

#### Option 2: ngrok

```bash
# Install ngrok
# See: https://ngrok.com/

# Start your backend server
bun run dev

# In another terminal, start ngrok
ngrok http 3001

# Use the ngrok URL in Stripe webhook settings
# Example: https://abc123.ngrok.io/api/payment/webhook
```

### Testing the Flow

1. **Register a user:**
   ```bash
   curl -X POST http://localhost:3001/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"test1234","name":"Test User"}'
   ```

2. **Create checkout session:**
   ```bash
   curl -X POST http://localhost:3001/api/payment/create-checkout-session \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{"tier":"PRO","billingPeriod":"monthly"}'
   ```

3. **Complete payment** in Stripe Checkout (use test card)

4. **Verify subscription:**
   ```bash
   curl -X GET http://localhost:3001/api/payment/subscription-status \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

## Security Notes

### What We DO Store:
- User email and hashed password
- Stripe Customer ID (reference only)
- Subscription tier and status
- Payment metadata (amounts, dates, status)

### What We DON'T Store:
- ❌ Credit card numbers
- ❌ CVV codes
- ❌ Full card details
- ❌ Any sensitive payment information

### Security Best Practices:

1. **HTTPS Only in Production**
   - All payment endpoints MUST use HTTPS
   - Stripe webhooks require HTTPS

2. **Webhook Signature Verification**
   - All webhooks verify Stripe signature
   - Prevents malicious requests

3. **JWT Token Security**
   - Tokens expire after 7 days (configurable)
   - Store tokens securely on client (httpOnly cookies recommended)

4. **Password Security**
   - Passwords hashed with bcrypt (10 rounds)
   - Minimum 8 characters enforced

5. **Environment Variables**
   - Never commit `.env` file
   - Use different keys for dev/staging/prod

6. **Rate Limiting**
   - Auth middleware includes rate limiting
   - Free tier: more restrictive
   - Paid tiers: higher limits

## Frontend Integration

### Client-Side Flow

1. **User Registration/Login**
   ```typescript
   const response = await fetch('http://localhost:3001/api/auth/login', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ email, password })
   });
   const { token, user } = await response.json();
   localStorage.setItem('token', token);
   ```

2. **Create Checkout Session**
   ```typescript
   const response = await fetch('http://localhost:3001/api/payment/create-checkout-session', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${token}`
     },
     body: JSON.stringify({ tier: 'PRO', billingPeriod: 'monthly' })
   });
   const { url } = await response.json();
   window.location.href = url; // Redirect to Stripe
   ```

3. **Handle Success Return**
   - After payment, Stripe redirects to `successUrl`
   - Check subscription status on your success page

4. **Protect Premium Features**
   ```typescript
   const user = await fetch('http://localhost:3001/api/auth/me', {
     headers: { 'Authorization': `Bearer ${token}` }
   }).then(r => r.json());

   if (user.subscriptionTier === 'FREE') {
     // Show upgrade prompt
   }
   ```

## Troubleshooting

### Common Issues

1. **"STRIPE_SECRET_KEY environment variable is not set"**
   - Make sure `.env` file exists in `backend/` directory
   - Verify the key is properly formatted

2. **Webhook signature verification failed**
   - Ensure `STRIPE_WEBHOOK_SECRET` is correct
   - For local testing, use Stripe CLI webhook secret

3. **"User does not have a Stripe customer ID"**
   - Customer is created automatically on first checkout
   - For customer portal, user must have completed at least one purchase

4. **Database connection errors**
   - Ensure PostgreSQL is running
   - Verify `DATABASE_URL` in `.env`
   - Run migrations: `bun run db:migrate`

## Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Testing Guide](https://stripe.com/docs/testing)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

## Support

For issues or questions:
1. Check this documentation
2. Review Stripe logs in Dashboard
3. Check server logs for errors
4. Consult Stripe documentation
