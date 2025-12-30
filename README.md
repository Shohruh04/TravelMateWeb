# TravelMate - AI-Powered Travel Planning Platform

<div align="center">

![TravelMate Logo](https://via.placeholder.com/150?text=TravelMate)

**Your one-stop platform for discovering destinations, finding accommodations, estimating flight costs, and accessing essential travel tools**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB)](https://reactjs.org/)
[![Bun](https://img.shields.io/badge/Bun-1.0-000000)](https://bun.sh/)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Environment Variables](#environment-variables)
- [Security](#security)
- [Contributing](#contributing)
- [License](#license)

---

## 🌍 Overview

TravelMate is a comprehensive travel planning platform that consolidates destination research, accommodation discovery, flight price estimation, and essential travel tools into one seamless experience. Unlike traditional travel agencies or booking platforms, TravelMate focuses on **information aggregation and decision support**, redirecting users to trusted external providers for final bookings.

### Core Value Proposition

- 🔍 **Centralized Research** - All travel planning in one platform
- 💰 **Transparent Pricing** - Clear estimates (never final prices)
- 🛠️ **Essential Tools** - Currency, weather, language, visa info
- ⚡ **Fast & Intuitive** - Modern UX with instant results
- 🔒 **Privacy-First** - No sensitive payment data storage

---

## ✨ Features

### 🏖️ Destination Discovery
- **13+ Popular Destinations** - Paris, Tokyo, NYC, London, Dubai, and more
- **Smart Search** - Real-time autocomplete with fuzzy matching
- **Rich Information** - Climate, best time to visit, attractions
- **Popularity Ranking** - Data-driven destination scoring

### 🏨 Accommodation Search
- **1000+ Properties** - Hotels, resorts, apartments, villas
- **Advanced Filters** - Price range, rating, type, amenities
- **Detailed Listings** - Photos, reviews, location maps
- **External Booking** - Seamless redirects to trusted providers

### ✈️ Flight Price Estimation
- **Smart Pricing Algorithm** - Distance-based with seasonal adjustments
- **30+ Airports** - Major hubs worldwide
- **Route Information** - Direct vs connections, duration
- **Price Ranges** - Min/max estimates with clear disclaimers

### 🛠️ Tourist Tools Suite

#### 💱 Currency Converter
- 25+ currencies supported
- Real-time exchange rates
- Conversion history
- Clear disclaimers

#### ☀️ Weather Information
- Current conditions + 7-day forecast
- Temperature, humidity, wind speed
- Destination-specific alerts
- Favorite cities tracking

#### 🗣️ Language Assistant
- 70+ travel phrases in 5 languages
- Phonetic pronunciation guides
- Categorized by scenario (greetings, emergencies, dining)
- Bookmark favorite phrases

#### 📋 Visa Requirements
- 18+ country combinations
- Entry requirements and passport validity
- Health requirements and travel advisories
- Government source disclaimers

### 💳 Premium Subscriptions

| Tier | Price | Features |
|------|-------|----------|
| **Free** | $0 | Basic search, limited results, standard support |
| **Pro** | $9.99/mo or $99/year | Unlimited searches, advanced filters, ad-free, priority support |
| **Enterprise** | $49.99/mo or $499/year | API access, custom integrations, dedicated support, SLA |

**Payment Processing:** Secure Stripe integration with no card data storage

---

## 🛠️ Tech Stack

### Backend
- **Runtime:** [Bun](https://bun.sh/) - Ultra-fast JavaScript runtime
- **Framework:** [Hono](https://hono.dev/) - Lightweight web framework
- **Database:** PostgreSQL 16 with [Prisma ORM](https://www.prisma.io/)
- **Authentication:** JWT + bcrypt
- **Payments:** [Stripe](https://stripe.com/) SDK
- **Validation:** Zod schemas

### Frontend
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router v6
- **HTTP Client:** Axios
- **State:** React Context API
- **Payments:** Stripe.js / Stripe Elements

### Infrastructure
- **Containerization:** Docker + Docker Compose
- **Database:** PostgreSQL in Docker
- **Environment:** dotenv for configuration

---

## 🏗️ Architecture

```
TravelMate/
├── backend/                 # Bun + Hono API
│   ├── src/
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Auth, CORS, error handling
│   │   ├── db/             # Prisma schema & seed
│   │   └── index.ts        # App entry point
│   ├── docker-compose.yml  # PostgreSQL container
│   └── package.json
│
├── frontend/               # React + Vite SPA
│   ├── src/
│   │   ├── pages/         # Route components
│   │   ├── components/    # Reusable UI components
│   │   ├── context/       # Global state (Auth, Destination)
│   │   ├── utils/         # API client, helpers
│   │   └── types/         # TypeScript definitions
│   └── package.json
│
├── SECURITY_AUDIT_REPORT.md
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Bun** v1.0+ ([Installation guide](https://bun.sh/docs/installation))
- **Node.js** v18+ (for frontend)
- **Docker** & Docker Compose
- **PostgreSQL** (via Docker or local)
- **Stripe Account** (for payment features)

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/travelmate.git
cd travelmate
```

#### 2. Backend Setup

```bash
cd backend

# Install dependencies
bun install

# Copy environment template
cp .env.example .env

# Edit .env with your configurations
# IMPORTANT: Change JWT_SECRET and add your Stripe keys

# Start PostgreSQL
docker-compose up -d

# Generate Prisma Client
bun run db:generate

# Run database migrations
bun run db:migrate

# Seed database with sample data
bun run db:seed

# Start development server
bun run dev
```

Backend will run on **http://localhost:3001**

#### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Start development server
npm run dev
```

Frontend will run on **http://localhost:5173**

### Quick Start (Development)

```bash
# Terminal 1 - Backend
cd backend && docker-compose up -d && bun run db:seed && bun run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

Visit **http://localhost:5173** in your browser.

---

## 📁 Project Structure

### Backend (`backend/src/`)

```
src/
├── routes/
│   ├── auth.ts              # Registration, login
│   ├── payment.ts           # Stripe checkout, webhooks
│   ├── destinations.ts      # Destination CRUD
│   ├── flights.ts           # Flight estimation
│   ├── tools.ts             # Tourist tools
│   └── search.ts            # Global search
│
├── services/
│   ├── authService.ts       # JWT, bcrypt logic
│   ├── stripeService.ts     # Stripe integration
│   ├── flightEstimator.ts   # Pricing algorithm
│   ├── currencyService.ts   # Exchange rates
│   ├── weatherService.ts    # Weather API
│   ├── translationService.ts # Phrase library
│   └── visaService.ts       # Visa requirements
│
├── middleware/
│   ├── auth.ts              # JWT validation
│   ├── cors.ts              # CORS config
│   └── errorHandler.ts      # Global error handling
│
├── db/
│   ├── schema.prisma        # Database models
│   ├── client.ts            # Prisma instance
│   └── seed.ts              # Sample data
│
└── index.ts                 # App initialization
```

### Frontend (`frontend/src/`)

```
src/
├── pages/
│   ├── Home.tsx             # Landing page + search
│   ├── DestinationDetail.tsx # Destination info
│   ├── Accommodations.tsx   # Hotel search
│   ├── Flights.tsx          # Flight estimation
│   ├── TouristTools.tsx     # Tools dashboard
│   ├── Premium.tsx          # Pricing plans
│   ├── Login.tsx            # Authentication
│   ├── Register.tsx         # User registration
│   ├── Account.tsx          # User dashboard
│   ├── PaymentSuccess.tsx   # Stripe success
│   └── PaymentCancel.tsx    # Stripe cancel
│
├── components/
│   ├── layout/
│   │   ├── Header.tsx       # Navigation
│   │   ├── Footer.tsx       # Footer
│   │   └── Layout.tsx       # Page wrapper
│   ├── common/
│   │   ├── Loading.tsx      # Spinner
│   │   ├── ErrorMessage.tsx # Error display
│   │   └── AirportAutocomplete.tsx
│   ├── tools/
│   │   ├── CurrencyConverter.tsx
│   │   ├── WeatherWidget.tsx
│   │   ├── LanguagePhrases.tsx
│   │   └── VisaRequirements.tsx
│   ├── payment/
│   │   └── Checkout.tsx     # Stripe redirect
│   └── ProtectedRoute.tsx   # Auth guard
│
├── context/
│   ├── AuthContext.tsx      # User state
│   └── DestinationContext.tsx # Selected destination
│
├── utils/
│   └── api.ts               # Axios client
│
└── types/
    └── index.ts             # TypeScript definitions
```

---

## 📡 API Documentation

### Base URL
```
http://localhost:3001/api
```

### Authentication

All authenticated endpoints require:
```
Authorization: Bearer <JWT_TOKEN>
```

### Endpoints

#### 🔐 Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Create new account | No |
| POST | `/auth/login` | Login user | No |
| GET | `/auth/me` | Get current user | Yes |
| PUT | `/auth/profile` | Update profile | Yes |
| POST | `/auth/change-password` | Change password | Yes |

#### 🏖️ Destinations

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/destinations` | List all destinations | No |
| GET | `/destinations/popular?limit=6` | Popular destinations | No |
| GET | `/destinations/:id` | Get destination details | No |
| GET | `/destinations/:id/accommodations` | Get accommodations | No |
| GET | `/destinations/:id/attractions` | Get attractions | No |

#### ✈️ Flights

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/flights/estimate` | Get price estimate | No |
| GET | `/flights/popular-routes` | Popular routes | No |
| GET | `/flights/airports?q=search` | Search airports | No |

#### 🛠️ Tourist Tools

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/tools/currency/rates` | All currencies | No |
| POST | `/tools/currency/convert` | Convert currency | No |
| GET | `/tools/weather/:city` | Current weather | No |
| GET | `/tools/language/phrases/:lang` | Travel phrases | No |
| POST | `/tools/visa/check` | Check visa requirements | No |

#### 💳 Payment

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/payment/pricing` | Get pricing tiers | No |
| POST | `/payment/create-checkout-session` | Start Stripe checkout | Yes |
| POST | `/payment/create-portal-session` | Manage subscription | Yes |
| GET | `/payment/subscription-status` | Get current subscription | Yes |
| POST | `/payment/webhook` | Stripe webhooks | No (verified) |

---

## 🔐 Environment Variables

### Backend (`.env`)

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/travelmate_db"

# Server
PORT=3001
NODE_ENV=development

# CORS
FRONTEND_URL=http://localhost:5173

# Authentication
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
JWT_EXPIRES_IN=7d

# Stripe (Get from https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_test_xxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxx

# Stripe Price IDs (Create in Stripe Dashboard)
STRIPE_PRO_MONTHLY_PRICE_ID=price_xxxx
STRIPE_PRO_ANNUAL_PRICE_ID=price_xxxx
STRIPE_ENTERPRISE_MONTHLY_PRICE_ID=price_xxxx
STRIPE_ENTERPRISE_ANNUAL_PRICE_ID=price_xxxx
```

### Frontend (`.env`)

```env
VITE_API_BASE_URL=http://localhost:3001
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxx
```

---

## 🔒 Security

### Implemented Security Measures

✅ **Authentication & Authorization**
- JWT tokens with 7-day expiration
- bcrypt password hashing (10 rounds)
- Protected route middleware
- Subscription tier-based access control

✅ **Payment Security**
- Stripe for payment processing
- **No credit card data stored locally**
- Webhook signature verification
- HTTPS required in production

✅ **API Security**
- Zod schema validation on all inputs
- Prisma ORM prevents SQL injection
- CORS configuration
- Rate limiting by subscription tier
- Error message sanitization

✅ **Data Protection**
- Environment variables for secrets
- .gitignore for sensitive files
- No secrets in version control

### Security Recommendations

See [SECURITY_AUDIT_REPORT.md](./SECURITY_AUDIT_REPORT.md) for comprehensive security review and recommendations before production deployment.

**Before Production:**
1. Change all default secrets
2. Enable HTTPS/TLS
3. Implement Redis-based rate limiting
4. Add password strength requirements
5. Configure CSP headers
6. Set up monitoring & logging

---

## 🧪 Testing

### Backend Tests

```bash
cd backend
bun add --dev @types/jest jest
bun test
```

### Frontend Tests

```bash
cd frontend
npm install --save-dev vitest @testing-library/react
npm test
```

---

## 🚢 Deployment

### Backend (Production)

```bash
# Build Prisma Client
bun run db:generate

# Run migrations
bun run db:migrate

# Seed database (optional)
bun run db:seed

# Start production server
bun run start
```

### Frontend (Production)

```bash
# Build optimized bundle
npm run build

# Preview build
npm run preview

# Deploy to Vercel/Netlify/Cloudflare Pages
```

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose -f docker-compose.prod.yml up -d
```

---

## 📊 Performance

- **Backend Response Time:** < 100ms (simple queries)
- **Frontend Build Size:** ~233 KB (gzipped)
- **Database:** Indexed queries, connection pooling
- **Caching:** Weather data (60 min), exchange rates (24 hours)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors

- **Your Name** - *Initial work* - [YourGitHub](https://github.com/yourusername)

---

## 🙏 Acknowledgments

- Stripe for payment processing
- OpenWeatherMap for weather data
- All open-source contributors

---

## 📧 Contact

- **Email:** support@travelmate.com
- **Website:** https://travelmate.com
- **Twitter:** [@travelmate](https://twitter.com/travelmate)

---

<div align="center">

Made with ❤️ by the TravelMate Team

**[Website](https://travelmate.com)** • **[Documentation](https://docs.travelmate.com)** • **[API Reference](https://api.travelmate.com/docs)**

</div>
# TravelMateWeb
