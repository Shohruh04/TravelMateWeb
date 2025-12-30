# TravelMate Backend API

High-performance REST API for the TravelMate travel information platform, built with Bun, Hono, and PostgreSQL.

## Tech Stack

- **Runtime**: [Bun](https://bun.sh) - Ultra-fast JavaScript runtime
- **Framework**: [Hono](https://hono.dev) - Lightweight, ultrafast web framework
- **Database**: PostgreSQL 16 with Prisma ORM
- **Language**: TypeScript

## Features

- RESTful API for destinations, accommodations, and attractions
- PostgreSQL database with Prisma ORM
- CORS support for frontend integration
- Comprehensive error handling and logging
- Health check endpoint
- Database seeding with sample data
- Type-safe queries with Prisma Client

## Prerequisites

- [Bun](https://bun.sh) >= 1.0.0
- [Docker](https://www.docker.com/) and Docker Compose
- PostgreSQL 16 (via Docker)

## Getting Started

### 1. Install Dependencies

```bash
bun install
```

### 2. Environment Setup

Copy the example environment file and configure:

```bash
cp .env.example .env
```

Default configuration:
- Database: `postgresql://travelmate:travelmate_dev_password@localhost:5432/travelmate_db`
- Server Port: `3001`
- Frontend URL: `http://localhost:5173`

### 3. Start PostgreSQL Database

```bash
docker-compose up -d
```

This starts a PostgreSQL 16 container on port 5432.

### 4. Database Setup

Generate Prisma Client:

```bash
bun run db:generate
```

Run database migrations:

```bash
bun run db:migrate
```

Seed the database with sample data:

```bash
bun run db:seed
```

### 5. Start Development Server

```bash
bun run dev
```

The API will be available at `http://localhost:3001`

## API Endpoints

### Health Check

```
GET /health
```

Returns server status and database connectivity.

### Destinations

```
GET /api/destinations
```

Retrieves all destinations.

**Query Parameters:**
- `country` - Filter by country
- `limit` - Limit results (pagination)
- `offset` - Offset for pagination

**Response:**
```json
{
  "data": [
    {
      "id": "clx123...",
      "name": "Paris",
      "country": "France",
      "description": "...",
      "imageUrl": "...",
      "latitude": 48.8566,
      "longitude": 2.3522,
      "_count": {
        "accommodations": 5,
        "attractions": 8
      }
    }
  ],
  "pagination": {
    "total": 10,
    "limit": 10,
    "offset": 0
  }
}
```

---

```
GET /api/destinations/:id
```

Retrieves a specific destination by ID.

**Response:**
```json
{
  "data": {
    "id": "clx123...",
    "name": "Paris",
    "country": "France",
    "description": "...",
    "climate": "Temperate oceanic",
    "bestTimeToVisit": "April to June",
    "currency": "EUR",
    "language": "French",
    "timezone": "CET (UTC+1)"
  }
}
```

---

```
GET /api/destinations/:id/accommodations
```

Retrieves all accommodations for a destination.

**Query Parameters:**
- `type` - Filter by accommodation type (hotel, hostel, resort, etc.)
- `minPrice` - Minimum price per night
- `maxPrice` - Maximum price per night
- `minRating` - Minimum rating (1-5)
- `limit` - Limit results
- `offset` - Offset for pagination

**Response:**
```json
{
  "data": [
    {
      "id": "clx456...",
      "name": "Hotel Le Marais",
      "type": "hotel",
      "description": "...",
      "address": "15 Rue des Archives, 75004 Paris",
      "pricePerNight": 180,
      "rating": 4.5,
      "amenities": ["WiFi", "Breakfast", "Air Conditioning"]
    }
  ],
  "pagination": {
    "total": 5,
    "limit": 10,
    "offset": 0
  }
}
```

---

```
GET /api/destinations/:id/attractions
```

Retrieves all attractions for a destination.

**Query Parameters:**
- `type` - Filter by attraction type (museum, park, landmark, etc.)
- `minRating` - Minimum rating (1-5)
- `limit` - Limit results
- `offset` - Offset for pagination

**Response:**
```json
{
  "data": [
    {
      "id": "clx789...",
      "name": "Eiffel Tower",
      "type": "landmark",
      "description": "...",
      "address": "Champ de Mars, 75007 Paris",
      "entryFee": 26.8,
      "rating": 4.8,
      "openingHours": "9:30 AM - 11:45 PM"
    }
  ],
  "pagination": {
    "total": 8,
    "limit": 10,
    "offset": 0
  }
}
```

## Database Schema

### Destination
- Core travel destination information
- Includes geographic, cultural, and practical details
- One-to-many relationships with accommodations and attractions

### Accommodation
- Hotels, hostels, resorts, apartments, etc.
- Pricing, ratings, amenities, contact information
- Linked to parent destination

### Attraction
- Museums, landmarks, parks, restaurants, etc.
- Entry fees, ratings, opening hours
- Linked to parent destination

## Scripts

```bash
# Development
bun run dev              # Start dev server with hot reload

# Production
bun run start            # Start production server

# Database
bun run db:generate      # Generate Prisma Client
bun run db:migrate       # Run database migrations
bun run db:push          # Push schema changes (dev only)
bun run db:studio        # Open Prisma Studio GUI
bun run db:seed          # Seed database with sample data

# Docker
docker-compose up -d     # Start PostgreSQL
docker-compose down      # Stop PostgreSQL
docker-compose logs -f   # View database logs
```

## Project Structure

```
backend/
├── src/
│   ├── db/
│   │   ├── schema.prisma    # Database schema
│   │   ├── client.ts        # Prisma client singleton
│   │   └── seed.ts          # Database seeding script
│   ├── middleware/
│   │   ├── cors.ts          # CORS middleware
│   │   └── errorHandler.ts # Error handling & logging
│   ├── routes/
│   │   ├── health.ts        # Health check endpoint
│   │   └── destinations.ts  # Destination routes
│   └── index.ts             # Application entry point
├── docker-compose.yml       # PostgreSQL container config
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── .env.example             # Environment template
└── README.md                # This file
```

## Architecture Decisions

### Why Bun?
- 3x faster than Node.js for I/O operations
- Native TypeScript support
- Built-in package manager and test runner
- Excellent developer experience

### Why Hono?
- Ultrafast and lightweight (< 30KB)
- Optimized for edge and serverless
- TypeScript-first design
- Minimal overhead, maximum performance

### Why Prisma?
- Type-safe database queries
- Excellent TypeScript integration
- Migration system and schema management
- Intuitive API for complex queries

## Performance Considerations

- **Connection Pooling**: Prisma manages connection pools automatically
- **Query Optimization**: All list endpoints use pagination
- **Eager Loading**: Related data loaded efficiently with `include`
- **Indexing**: Database indexes on foreign keys and filter fields
- **Async Operations**: All database operations are async

## Security

- **CORS**: Configured for frontend origin only
- **Input Validation**: Query parameters parsed and validated
- **Error Handling**: Production errors don't leak sensitive information
- **SQL Injection**: Protected by Prisma's parameterized queries

## Error Handling

The API uses centralized error handling with custom error types:

- `ValidationError` (400) - Invalid input
- `NotFoundError` (404) - Resource not found
- `DatabaseError` (500) - Database operation failed
- `HTTPException` (varies) - HTTP-specific errors

All errors return JSON responses with:
```json
{
  "error": "Error Type",
  "message": "Human-readable description"
}
```

## Development Tips

1. **Hot Reload**: The dev server automatically reloads on file changes
2. **Database GUI**: Use `bun run db:studio` to explore data visually
3. **Logging**: All requests are logged with method, path, status, and duration
4. **Type Safety**: Prisma generates types from schema - use them!

## Troubleshooting

### Database Connection Issues

1. Ensure Docker is running: `docker ps`
2. Check database container: `docker-compose logs postgres`
3. Verify DATABASE_URL in `.env`
4. Test connection: `bun run db:studio`

### Prisma Client Errors

Regenerate Prisma Client:
```bash
bun run db:generate
```

### Port Already in Use

Change the PORT in `.env` file or kill the process:
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

## Contributing

1. Follow TypeScript best practices
2. Use Prisma for all database operations
3. Add error handling for all endpoints
4. Document new endpoints in this README
5. Test changes with sample data

## License

MIT
