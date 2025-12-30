# Payment & Auth API Reference

Quick reference for authentication and payment endpoints.

## Base URL
```
http://localhost:3001
```

## Authentication

All authenticated endpoints require the `Authorization` header:
```
Authorization: Bearer <your-jwt-token>
```

---

## Auth Endpoints

### POST /api/auth/register
Register a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe" // optional
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "clxxx",
    "email": "user@example.com",
    "name": "John Doe",
    "subscriptionTier": "FREE",
    "subscriptionStatus": null
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### POST /api/auth/login
Login with existing account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user": { ... },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### GET /api/auth/me
Get current user information. Requires authentication.

**Response (200):**
```json
{
  "user": {
    "id": "clxxx",
    "email": "user@example.com",
    "name": "John Doe",
    "subscriptionTier": "PRO",
    "subscriptionStatus": "active",
    "subscriptionEndDate": "2025-02-01T00:00:00.000Z",
    "stripeCustomerId": "cus_xxx"
  }
}
```

---

### PUT /api/auth/profile
Update user profile. Requires authentication.

**Request:**
```json
{
  "name": "Jane Doe",
  "email": "newemail@example.com" // optional
}
```

**Response (200):**
```json
{
  "message": "Profile updated successfully",
  "user": { ... }
}
```

---

### POST /api/auth/change-password
Change user password. Requires authentication.

**Request:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword456"
}
```

**Response (200):**
```json
{
  "message": "Password changed successfully"
}
```

---

### POST /api/auth/logout
Logout user. Requires authentication.

**Response (200):**
```json
{
  "message": "Logout successful"
}
```

Note: Client should remove token from storage.

---

## Payment Endpoints

### GET /api/payment/pricing
Get pricing information for all subscription tiers. No authentication required.

**Response (200):**
```json
{
  "tiers": [
    {
      "id": "FREE",
      "name": "Free",
      "price": 0,
      "billingPeriod": "forever",
      "features": [
        "Basic destination search",
        "Limited to 10 searches per day",
        "Standard support",
        "Basic travel information"
      ]
    },
    {
      "id": "PRO",
      "name": "Pro",
      "prices": {
        "monthly": 9.99,
        "annual": 99
      },
      "features": [
        "Unlimited searches",
        "Advanced filters and sorting",
        "Priority support",
        "Ad-free experience",
        "Save favorite destinations",
        "Export itineraries to PDF"
      ]
    },
    {
      "id": "ENTERPRISE",
      "name": "Enterprise",
      "prices": {
        "monthly": 49.99,
        "annual": 499
      },
      "features": [
        "All Pro features",
        "API access for integrations",
        "Custom branding options",
        "Dedicated account manager",
        "Priority feature requests",
        "White-label solutions",
        "99.9% SLA guarantee"
      ]
    }
  ]
}
```

---

### POST /api/payment/create-checkout-session
Create a Stripe checkout session. Requires authentication.

**Request:**
```json
{
  "tier": "PRO",
  "billingPeriod": "monthly",
  "successUrl": "https://yourapp.com/success?session_id={CHECKOUT_SESSION_ID}", // optional
  "cancelUrl": "https://yourapp.com/pricing" // optional
}
```

**Validation:**
- `tier`: Must be "PRO" or "ENTERPRISE"
- `billingPeriod`: Must be "monthly" or "annual"

**Response (200):**
```json
{
  "sessionId": "cs_test_xxxxxxxxxxxxx",
  "url": "https://checkout.stripe.com/c/pay/cs_test_xxxxxxxxxxxxx"
}
```

**Usage:**
Redirect user to the `url` to complete payment in Stripe Checkout.

---

### POST /api/payment/create-customer-portal-session
Create a Stripe Customer Portal session for managing subscriptions. Requires authentication.

**Request:**
```json
{
  "returnUrl": "https://yourapp.com/account" // optional
}
```

**Response (200):**
```json
{
  "url": "https://billing.stripe.com/session/xxxxxxxxxxxxx"
}
```

**Usage:**
Redirect user to the `url` to manage their subscription (cancel, update payment method, view invoices, etc.)

---

### GET /api/payment/subscription-status
Get current user's subscription status. Requires authentication.

**Response (200):**
```json
{
  "tier": "PRO",
  "status": "active",
  "endDate": "2025-02-01T00:00:00.000Z",
  "isActive": true
}
```

**Possible statuses:**
- `active` - Subscription is active
- `trialing` - In trial period
- `past_due` - Payment failed, subscription at risk
- `canceled` - Subscription canceled
- `null` - Free tier (no subscription)

---

### POST /api/payment/webhook
Handle Stripe webhook events. Called by Stripe, not by clients.

**Headers:**
```
stripe-signature: t=1234567890,v1=xxxxxxxxxxxxx
```

**Events Handled:**
- `checkout.session.completed` - Payment successful, activate subscription
- `customer.subscription.updated` - Subscription changed
- `customer.subscription.deleted` - Subscription canceled
- `invoice.payment_failed` - Payment failed
- `invoice.payment_succeeded` - Recurring payment successful

**Response (200):**
```json
{
  "received": true
}
```

---

## Error Responses

All endpoints return consistent error formats:

### 400 Bad Request
```json
{
  "error": "Bad Request",
  "message": "Detailed error message"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "This feature requires a PRO or ENTERPRISE subscription",
  "currentTier": "FREE",
  "requiredTiers": ["PRO", "ENTERPRISE"]
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Route GET /api/invalid not found"
}
```

### 409 Conflict
```json
{
  "error": "Conflict",
  "message": "User with this email already exists"
}
```

### 429 Too Many Requests
```json
{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Your tier (FREE) allows 10 requests per hour.",
  "retryAfter": "2025-01-30T13:00:00.000Z"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "Failed to process request"
}
```

---

## Rate Limiting

Rate limits are applied based on subscription tier:

| Tier       | Hourly Limit |
|------------|--------------|
| FREE       | 10 requests  |
| PRO        | 100 requests |
| ENTERPRISE | 1000 requests|

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 2025-01-30T13:00:00.000Z
```

---

## Subscription Tiers

### FREE
- Price: $0
- Features:
  - Basic destination search
  - Limited to 10 searches per day
  - Standard support
  - Basic travel information

### PRO
- Price: $9.99/month or $99/year
- Features:
  - Unlimited searches
  - Advanced filters and sorting
  - Priority support
  - Ad-free experience
  - Save favorite destinations
  - Export itineraries to PDF

### ENTERPRISE
- Price: $49.99/month or $499/year
- Features:
  - All Pro features
  - API access for integrations
  - Custom branding options
  - Dedicated account manager
  - Priority feature requests
  - White-label solutions
  - 99.9% SLA guarantee

---

## Example: Complete Payment Flow

### 1. User Registration
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123","name":"John Doe"}'
```

### 2. Create Checkout Session
```bash
curl -X POST http://localhost:3001/api/payment/create-checkout-session \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"tier":"PRO","billingPeriod":"monthly"}'
```

### 3. Redirect User to Stripe
User completes payment at the Stripe Checkout URL.

### 4. Stripe Webhook
Stripe sends webhook to `/api/payment/webhook` when payment succeeds.
Backend automatically updates user's subscription tier.

### 5. Verify Subscription
```bash
curl -X GET http://localhost:3001/api/payment/subscription-status \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 6. Access Premium Features
User can now access features restricted to PRO tier.

---

## TypeScript Types

### User
```typescript
interface User {
  id: string;
  email: string;
  name: string | null;
  subscriptionTier: 'FREE' | 'PRO' | 'ENTERPRISE';
  subscriptionStatus: string | null;
  subscriptionEndDate: Date | null;
  stripeCustomerId: string | null;
  createdAt: Date;
  updatedAt: Date;
}
```

### Payment
```typescript
interface Payment {
  id: string;
  userId: string;
  stripePaymentId: string;
  amount: number;
  currency: string;
  status: string;
  tier: 'FREE' | 'PRO' | 'ENTERPRISE';
  billingPeriod: 'monthly' | 'annual';
  metadata: any;
  createdAt: Date;
  updatedAt: Date;
}
```

### Auth Response
```typescript
interface AuthResponse {
  message: string;
  user: User;
  token: string;
}
```

### Subscription Status
```typescript
interface SubscriptionStatus {
  tier: 'FREE' | 'PRO' | 'ENTERPRISE';
  status: string | null;
  endDate: Date | null;
  isActive: boolean;
}
```
