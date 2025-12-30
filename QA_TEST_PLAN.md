# TravelMate QA Test Plan
**Version:** 1.0
**Date:** December 30, 2025
**Status:** Ready for Testing

---

## Test Environment Setup

### Prerequisites
- ✅ Backend running on `localhost:3001`
- ✅ Frontend running on `localhost:5173`
- ✅ PostgreSQL database seeded with test data
- ✅ Stripe test mode enabled
- ✅ All environment variables configured

---

## 1. Authentication & User Management

### Test Case 1.1: User Registration
**Priority:** HIGH | **Type:** Functional

| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 1 | Navigate to `/register` | Registration form displays | ⬜ |
| 2 | Enter email: `test@example.com` | Email field accepts input | ⬜ |
| 3 | Enter password: `Test123!` | Password field shows masked characters | ⬜ |
| 4 | Enter name: `Test User` | Name field accepts input | ⬜ |
| 5 | Click "Register" button | Registration succeeds, redirects to home | ⬜ |
| 6 | Verify token in localStorage | JWT token stored | ⬜ |
| 7 | Verify database | User created with FREE tier | ⬜ |

**Edge Cases:**
- ⬜ Duplicate email registration fails with clear message
- ⬜ Weak password (< 8 chars) shows validation error
- ⬜ Missing required fields show validation errors
- ⬜ Invalid email format rejected

---

### Test Case 1.2: User Login
**Priority:** HIGH | **Type:** Functional

| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 1 | Navigate to `/login` | Login form displays | ⬜ |
| 2 | Enter registered email | Email field accepts input | ⬜ |
| 3 | Enter correct password | Password field accepts input | ⬜ |
| 4 | Click "Login" button | Login succeeds, JWT token issued | ⬜ |
| 5 | Verify redirect | Redirects to home page | ⬜ |
| 6 | Verify header | Shows logged-in user menu | ⬜ |

**Edge Cases:**
- ⬜ Wrong password shows error
- ⬜ Non-existent email shows error
- ⬜ Empty fields show validation errors

---

### Test Case 1.3: Protected Routes
**Priority:** HIGH | **Type:** Security

| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 1 | Logout (clear token) | User logged out | ⬜ |
| 2 | Navigate to `/account` | Redirects to `/login` | ⬜ |
| 3 | Login again | Can access `/account` | ⬜ |
| 4 | Delete token from localStorage manually | Next API call returns 401 | ⬜ |

---

## 2. Destination Search & Discovery

### Test Case 2.1: Destination Search
**Priority:** HIGH | **Type:** Functional

| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 1 | Navigate to home page | Search bar visible | ⬜ |
| 2 | Type "Paris" in search | Autocomplete dropdown appears | ⬜ |
| 3 | Verify results | Shows "Paris, France" | ⬜ |
| 4 | Click on "Paris" | Navigates to `/destinations/:id` | ⬜ |
| 5 | Verify destination detail | Shows Paris info, accommodations, attractions | ⬜ |

**Edge Cases:**
- ⬜ Empty search shows no results
- ⬜ Partial match ("par") shows Paris
- ⬜ Case-insensitive search works
- ⬜ Special characters handled gracefully

---

### Test Case 2.2: Popular Destinations
**Priority:** MEDIUM | **Type:** Functional

| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 1 | Navigate to home page | Popular destinations section visible | ⬜ |
| 2 | Verify count | Shows 6 popular destinations | ⬜ |
| 3 | Verify sorting | Sorted by popularity score (NYC, Paris, London first) | ⬜ |
| 4 | Click on a destination card | Navigates to destination detail | ⬜ |

---

## 3. Accommodation Search

### Test Case 3.1: Accommodation Filtering
**Priority:** HIGH | **Type:** Functional

| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 1 | Navigate to `/accommodations` | Accommodation list displays | ⬜ |
| 2 | Select price range "Budget" | Filters to accommodations < $100/night | ⬜ |
| 3 | Select rating "4.5+" | Further filters to rating >= 4.5 | ⬜ |
| 4 | Select type "Hotel" | Further filters to type="hotel" | ⬜ |
| 5 | Verify results | All filters applied correctly | ⬜ |
| 6 | Click "Clear Filters" | Resets to full list | ⬜ |

**Edge Cases:**
- ⬜ No results scenario shows empty state
- ⬜ Multiple filters combine correctly (AND logic)
- ⬜ Filter by destination works

---

## 4. Flight Price Estimation

### Test Case 4.1: Flight Search
**Priority:** HIGH | **Type:** Functional

| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 1 | Navigate to `/flights` | Flight search form displays | ⬜ |
| 2 | Type "JFK" in origin | Autocomplete shows "New York (JFK)" | ⬜ |
| 3 | Select "JFK" | Origin set to JFK | ⬜ |
| 4 | Type "CDG" in destination | Autocomplete shows "Paris (CDG)" | ⬜ |
| 5 | Select "CDG" | Destination set to CDG | ⬜ |
| 6 | Select trip type "Round-trip" | Return date field appears | ⬜ |
| 7 | Select depart date (future) | Date accepted | ⬜ |
| 8 | Select return date (after depart) | Date accepted | ⬜ |
| 9 | Set passengers to 2 | Passenger count = 2 | ⬜ |
| 10 | Click "Search Flights" | API call made, results display | ⬜ |
| 11 | Verify price range | Shows min-max estimate | ⬜ |
| 12 | Verify disclaimer | "Prices are estimates only" visible | ⬜ |
| 13 | Verify route info | Shows direct/connections, duration | ⬜ |
| 14 | Click "Find Flights" | Opens Google Flights in new tab | ⬜ |

**Edge Cases:**
- ⬜ Same origin/destination shows error
- ⬜ Past depart date shows validation error
- ⬜ Return before depart shows error
- ⬜ Invalid airport codes rejected

---

### Test Case 4.2: Popular Routes
**Priority:** MEDIUM | **Type:** Functional

| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 1 | Navigate to `/flights` | Popular routes section visible | ⬜ |
| 2 | Verify routes | Shows 8 popular routes | ⬜ |
| 3 | Click on a route | Populates form with route details | ⬜ |
| 4 | Verify auto-scroll | Scrolls to search form | ⬜ |

---

## 5. Tourist Tools

### Test Case 5.1: Currency Converter
**Priority:** MEDIUM | **Type:** Functional

| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 1 | Navigate to `/tourist-tools` | Tools dashboard displays | ⬜ |
| 2 | Click "Currency Converter" tool | Currency converter opens | ⬜ |
| 3 | Select "USD" as from currency | USD selected | ⬜ |
| 4 | Select "EUR" as to currency | EUR selected | ⬜ |
| 5 | Enter amount "100" | Amount accepted | ⬜ |
| 6 | Verify conversion | Shows converted amount (~92.50 EUR) | ⬜ |
| 7 | Verify exchange rate | Shows rate (0.925) | ⬜ |
| 8 | Verify disclaimer | Disclaimer visible | ⬜ |
| 9 | Click swap button | Currencies swap (EUR → USD) | ⬜ |

---

### Test Case 5.2: Weather Widget
**Priority:** MEDIUM | **Type:** Functional

| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 1 | Select "Weather" tool | Weather widget displays | ⬜ |
| 2 | Search for "Paris" | City search works | ⬜ |
| 3 | Press Enter or click search | Weather data displays | ⬜ |
| 4 | Verify current weather | Shows temp, condition, humidity, wind | ⬜ |
| 5 | Verify forecast | Shows 7-day forecast | ⬜ |
| 6 | Toggle Fahrenheit/Celsius | Temperature units change | ⬜ |
| 7 | Add to favorites | City saved to favorites | ⬜ |

---

### Test Case 5.3: Language Phrases
**Priority:** MEDIUM | **Type:** Functional

| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 1 | Select "Language Assistant" tool | Phrase library displays | ⬜ |
| 2 | Select language "French" | French phrases load | ⬜ |
| 3 | Expand "Greetings" category | Shows greeting phrases | ⬜ |
| 4 | Verify phrase display | Shows English, French, pronunciation | ⬜ |
| 5 | Search for "thank you" | Filters to matching phrases | ⬜ |
| 6 | Bookmark a phrase | Phrase saved to bookmarks | ⬜ |

---

### Test Case 5.4: Visa Requirements
**Priority:** MEDIUM | **Type:** Functional

| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 1 | Select "Visa Requirements" tool | Visa checker displays | ⬜ |
| 2 | Select nationality "US" | US selected | ⬜ |
| 3 | Select destination "France" | France selected | ⬜ |
| 4 | Click "Check Requirements" | Results display | ⬜ |
| 5 | Verify visa status | Shows "No visa required" (green) | ⬜ |
| 6 | Verify stay duration | Shows "90 days within 180 days" | ⬜ |
| 7 | Verify entry requirements | Lists requirements | ⬜ |
| 8 | Verify disclaimer | Prominent disclaimer visible | ⬜ |

---

## 6. Payment & Subscriptions

### Test Case 6.1: View Pricing
**Priority:** HIGH | **Type:** Functional

| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 1 | Navigate to `/premium` | Pricing page displays | ⬜ |
| 2 | Verify tiers | Shows Free, Pro, Enterprise | ⬜ |
| 3 | Toggle "Monthly/Annual" | Prices update accordingly | ⬜ |
| 4 | Verify savings badge | Annual shows "Save X%" | ⬜ |
| 5 | Verify feature comparison | All features listed per tier | ⬜ |

---

### Test Case 6.2: Stripe Checkout Flow (CRITICAL)
**Priority:** CRITICAL | **Type:** Payment Integration

**⚠️ Use Stripe Test Cards ONLY**

| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 1 | Login as test user | User authenticated | ⬜ |
| 2 | Navigate to `/premium` | Pricing page displays | ⬜ |
| 3 | Click "Select Plan" on Pro Monthly | Redirects to Stripe Checkout | ⬜ |
| 4 | Verify Stripe session | Shows correct plan (Pro Monthly $9.99) | ⬜ |
| 5 | Enter test card: `4242 4242 4242 4242` | Card accepted | ⬜ |
| 6 | Enter future expiry: `12/34` | Expiry accepted | ⬜ |
| 7 | Enter CVC: `123` | CVC accepted | ⬜ |
| 8 | Enter zip: `12345` | Zip accepted | ⬜ |
| 9 | Click "Subscribe" | Payment processes | ⬜ |
| 10 | Verify redirect | Redirects to `/payment/success` | ⬜ |
| 11 | Verify success page | Shows confirmation | ⬜ |
| 12 | Navigate to `/account` | Subscription updated to PRO | ⬜ |
| 13 | Verify database | User tier = PRO, status = active | ⬜ |
| 14 | Verify Stripe dashboard | Subscription created | ⬜ |

**Test Decline Scenarios:**
- ⬜ Card `4000 0000 0000 0002` (declined) shows error
- ⬜ Card `4000 0000 0000 9995` (insufficient funds) shows error

---

### Test Case 6.3: Subscription Management
**Priority:** HIGH | **Type:** Functional

| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 1 | Login as PRO user | User authenticated | ⬜ |
| 2 | Navigate to `/account` | Account page displays | ⬜ |
| 3 | Verify subscription display | Shows PRO tier badge | ⬜ |
| 4 | Click "Manage Subscription" | Opens Stripe Customer Portal | ⬜ |
| 5 | Verify portal | Shows subscription details | ⬜ |
| 6 | Click "Cancel Subscription" | Cancellation flow starts | ⬜ |
| 7 | Confirm cancellation | Subscription canceled | ⬜ |
| 8 | Return to TravelMate | Account shows "Canceled" status | ⬜ |
| 9 | Verify webhook | Webhook processed correctly | ⬜ |
| 10 | Verify database | User tier updated appropriately | ⬜ |

---

### Test Case 6.4: Webhook Security
**Priority:** CRITICAL | **Type:** Security

| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 1 | Send webhook without signature | Returns 400 error | ⬜ |
| 2 | Send webhook with invalid signature | Returns 400 error | ⬜ |
| 3 | Send valid test webhook from Stripe CLI | Webhook processed successfully | ⬜ |
| 4 | Verify database updates | User subscription status updated | ⬜ |

**Webhook Events to Test:**
- ⬜ `checkout.session.completed`
- ⬜ `customer.subscription.updated`
- ⬜ `customer.subscription.deleted`

---

## 7. Security Testing

### Test Case 7.1: SQL Injection (Prisma ORM)
**Priority:** CRITICAL | **Type:** Security

| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 1 | Search destinations with: `'; DROP TABLE users; --` | Query safe, no SQL execution | ⬜ |
| 2 | Login with email: `admin' OR '1'='1` | Login fails, no SQL injection | ⬜ |

---

### Test Case 7.2: XSS Protection
**Priority:** HIGH | **Type:** Security

| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 1 | Register with name: `<script>alert('XSS')</script>` | Script not executed, sanitized | ⬜ |
| 2 | Search: `<img src=x onerror=alert('XSS')>` | Image not rendered, safe | ⬜ |

---

### Test Case 7.3: JWT Token Validation
**Priority:** CRITICAL | **Type:** Security

| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 1 | Make API call with expired token | Returns 401 Unauthorized | ⬜ |
| 2 | Make API call with malformed token | Returns 401 Unauthorized | ⬜ |
| 3 | Make API call without token | Returns 401 Unauthorized | ⬜ |
| 4 | Make API call with valid token | Returns 200 OK | ⬜ |

---

### Test Case 7.4: Password Security
**Priority:** CRITICAL | **Type:** Security

| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 1 | Check database `users` table | `passwordHash` column has bcrypt hashes | ⬜ |
| 2 | Verify hash format | Starts with `$2a$` or `$2b$` | ⬜ |
| 3 | Verify uniqueness | Two users with same password have different hashes | ⬜ |

---

### Test Case 7.5: Payment Data Storage
**Priority:** CRITICAL | **Type:** Security

| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 1 | Complete test payment | Payment succeeds | ⬜ |
| 2 | Check `payments` table | **NO credit card numbers stored** | ⬜ |
| 3 | Check `payments` table | **NO CVV codes stored** | ⬜ |
| 4 | Verify stored data | Only Stripe payment ID, amount, status | ⬜ |

---

## 8. Performance Testing

### Test Case 8.1: API Response Time
**Priority:** MEDIUM | **Type:** Performance

| Endpoint | Expected Time | Actual Time | Status |
|----------|---------------|-------------|--------|
| GET `/api/destinations` | < 100ms | ___ms | ⬜ |
| GET `/api/destinations/popular` | < 100ms | ___ms | ⬜ |
| POST `/api/flights/estimate` | < 100ms | ___ms | ⬜ |
| POST `/api/auth/login` | < 200ms | ___ms | ⬜ |
| GET `/api/tools/currency/rates` | < 50ms | ___ms | ⬜ |

---

### Test Case 8.2: Frontend Load Time
**Priority:** MEDIUM | **Type:** Performance

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Initial page load | < 3s | ___s | ⬜ |
| Time to interactive | < 5s | ___s | ⬜ |
| Bundle size (gzipped) | < 300 KB | ___KB | ⬜ |

---

## 9. Cross-Browser Testing

### Test Case 9.1: Browser Compatibility
**Priority:** MEDIUM | **Type:** Compatibility

| Browser | Version | Homepage | Login | Flights | Payment | Status |
|---------|---------|----------|-------|---------|---------|--------|
| Chrome | Latest | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Firefox | Latest | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Safari | Latest | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Edge | Latest | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |

---

## 10. Mobile Responsiveness

### Test Case 10.1: Mobile Layout
**Priority:** HIGH | **Type:** UI/UX

| Screen Size | Homepage | Navigation | Forms | Payment | Status |
|-------------|----------|------------|-------|---------|--------|
| 375x667 (iPhone SE) | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| 390x844 (iPhone 12) | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| 360x800 (Android) | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| 768x1024 (iPad) | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |

---

## Test Summary Report Template

```
## Test Execution Summary
**Date:** _______________
**Tester:** _______________
**Environment:** Development / Staging / Production

### Overall Results
- Total Test Cases: ___
- Passed: ___ ✅
- Failed: ___ ❌
- Blocked: ___ ⚠️
- Not Executed: ___ ⬜

### Critical Issues Found
1. [Issue description]
2. [Issue description]

### High Priority Issues
1. [Issue description]

### Recommendations
- [Recommendation 1]
- [Recommendation 2]

### Ready for Production? YES / NO
**Reason:**
```

---

## Test Execution Instructions

### 1. Setup Test Environment
```bash
# Start backend
cd backend && docker-compose up -d && bun run db:seed && bun run dev

# Start frontend
cd frontend && npm run dev
```

### 2. Stripe Test Mode Setup
- Login to Stripe Dashboard
- Switch to "Test Mode" (toggle in top-right)
- Use test API keys in `.env`
- Use test cards: https://stripe.com/docs/testing

### 3. Test Data
- **Test User Email:** `tester@travelmate.test`
- **Test Password:** `Test123!`
- **Stripe Test Card:** `4242 4242 4242 4242`

### 4. Reporting Bugs
For each bug found:
1. Take screenshot
2. Note steps to reproduce
3. Note expected vs actual result
4. Check browser console for errors
5. Log in project issue tracker

---

## Approval Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| QA Lead | __________ | __________ | _____ |
| Backend Dev | __________ | __________ | _____ |
| Frontend Dev | __________ | __________ | _____ |
| Product Owner | __________ | __________ | _____ |

---

**Next Steps After QA:**
1. Fix critical and high-priority bugs
2. Re-test failed cases
3. Update documentation
4. Deploy to staging
5. Final pre-production review
6. **Go Live** ✈️
