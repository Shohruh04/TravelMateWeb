import { Hono } from 'hono';
import { z } from 'zod';
import { prisma } from '../db/client';
import { estimateFlightPrice, POPULAR_ROUTES } from '../services/flightEstimator';

const flights = new Hono();

// Validation schemas
const estimateRequestSchema = z.object({
  origin: z.string().min(2, 'Origin must be at least 2 characters'),
  destination: z.string().min(2, 'Destination must be at least 2 characters'),
  departDate: z.string().optional(),
  returnDate: z.string().optional(),
  passengers: z.number().int().min(1).max(9).optional().default(1),
});

/**
 * Helper function to find airport by code or city name
 */
async function findAirport(query: string) {
  const upperQuery = query.toUpperCase().trim();

  // Try exact code match first (most common case)
  const byCode = await prisma.airport.findUnique({
    where: { code: upperQuery },
  });

  if (byCode) return byCode;

  // Try partial city match
  const byCity = await prisma.airport.findFirst({
    where: {
      OR: [
        { city: { contains: query, mode: 'insensitive' } },
        { name: { contains: query, mode: 'insensitive' } },
      ],
    },
    orderBy: { isPopular: 'desc' }, // Prefer popular airports
  });

  return byCity;
}

/**
 * POST /api/flights/estimate
 * Get flight price estimate for a route
 *
 * Request body:
 * {
 *   "origin": "JFK" or "New York",
 *   "destination": "CDG" or "Paris",
 *   "departDate": "2025-01-15" (optional),
 *   "returnDate": "2025-01-22" (optional),
 *   "passengers": 1 (optional, default: 1)
 * }
 */
flights.post('/estimate', async (c) => {
  try {
    const body = await c.req.json();

    // Validate request
    const validation = estimateRequestSchema.safeParse(body);
    if (!validation.success) {
      return c.json(
        {
          error: 'Validation failed',
          details: validation.error.errors,
        },
        400
      );
    }

    const { origin, destination, departDate, returnDate, passengers } = validation.data;

    // Validate date logic
    if (departDate) {
      const departureDate = new Date(departDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (departureDate < today) {
        return c.json(
          {
            error: 'Invalid departure date',
            message: 'Departure date cannot be in the past',
          },
          400
        );
      }

      if (returnDate) {
        const returnDateObj = new Date(returnDate);
        if (returnDateObj <= departureDate) {
          return c.json(
            {
              error: 'Invalid return date',
              message: 'Return date must be after departure date',
            },
            400
          );
        }
      }
    }

    // Find airports
    const [originAirport, destinationAirport] = await Promise.all([
      findAirport(origin),
      findAirport(destination),
    ]);

    if (!originAirport) {
      return c.json(
        {
          error: 'Airport not found',
          message: `Could not find airport for origin: ${origin}`,
        },
        404
      );
    }

    if (!destinationAirport) {
      return c.json(
        {
          error: 'Airport not found',
          message: `Could not find airport for destination: ${destination}`,
        },
        404
      );
    }

    // Check for same origin and destination
    if (originAirport.code === destinationAirport.code) {
      return c.json(
        {
          error: 'Invalid route',
          message: 'Origin and destination cannot be the same',
        },
        400
      );
    }

    // Build location objects for estimator
    const originLocation = {
      code: originAirport.code,
      city: originAirport.city,
      country: originAirport.country,
      latitude: originAirport.latitude || undefined,
      longitude: originAirport.longitude || undefined,
    };

    const destinationLocation = {
      code: destinationAirport.code,
      city: destinationAirport.city,
      country: destinationAirport.country,
      latitude: destinationAirport.latitude || undefined,
      longitude: destinationAirport.longitude || undefined,
    };

    // Calculate estimate
    const estimate = estimateFlightPrice({
      origin: originLocation,
      destination: destinationLocation,
      departDate,
      returnDate,
      passengers,
    });

    return c.json({
      estimate,
      disclaimer:
        'Prices are estimates and subject to change. Final prices available from booking providers.',
    });
  } catch (error) {
    console.error('Error estimating flight price:', error);

    if (error instanceof Error) {
      return c.json(
        {
          error: 'Estimation failed',
          message: error.message,
        },
        500
      );
    }

    throw error;
  }
});

/**
 * GET /api/flights/popular-routes
 * Get popular flight routes with estimated prices
 *
 * Returns 8 pre-calculated popular routes with estimates
 */
flights.get('/popular-routes', async (c) => {
  try {
    // Return popular routes with current timestamp
    const routesWithTimestamp = POPULAR_ROUTES.map((route) => ({
      ...route,
      currency: 'USD',
      generatedAt: new Date().toISOString(),
    }));

    return c.json({
      data: routesWithTimestamp,
      total: routesWithTimestamp.length,
      disclaimer:
        'Prices are estimates and subject to change. Final prices available from booking providers.',
    });
  } catch (error) {
    console.error('Error fetching popular routes:', error);
    throw error;
  }
});

/**
 * GET /api/flights/airports?q=search
 * Search airports by name, city, or code
 *
 * Query params:
 * - q: Search query (minimum 2 characters)
 * - limit: Maximum results (default: 10)
 */
flights.get('/airports', async (c) => {
  try {
    const query = c.req.query('q');
    const limit = c.req.query('limit');

    if (!query || query.length < 2) {
      return c.json(
        {
          error: 'Invalid query',
          message: 'Search query must be at least 2 characters',
        },
        400
      );
    }

    const take = limit ? parseInt(limit, 10) : 10;

    // Search by code, city, or name
    const airports = await prisma.airport.findMany({
      where: {
        OR: [
          { code: { contains: query.toUpperCase(), mode: 'insensitive' } },
          { city: { contains: query, mode: 'insensitive' } },
          { name: { contains: query, mode: 'insensitive' } },
          { country: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        code: true,
        name: true,
        city: true,
        country: true,
        isPopular: true,
      },
      orderBy: [
        { isPopular: 'desc' }, // Popular airports first
        { code: 'asc' },
      ],
      take,
    });

    return c.json({
      data: airports,
      total: airports.length,
    });
  } catch (error) {
    console.error('Error searching airports:', error);
    throw error;
  }
});

/**
 * GET /api/flights/airports/popular
 * Get popular airports (useful for autocomplete suggestions)
 *
 * Query params:
 * - limit: Maximum results (default: 20)
 */
flights.get('/airports/popular', async (c) => {
  try {
    const limit = c.req.query('limit');
    const take = limit ? parseInt(limit, 10) : 20;

    const airports = await prisma.airport.findMany({
      where: {
        isPopular: true,
      },
      select: {
        id: true,
        code: true,
        name: true,
        city: true,
        country: true,
      },
      orderBy: {
        city: 'asc',
      },
      take,
    });

    return c.json({
      data: airports,
      total: airports.length,
    });
  } catch (error) {
    console.error('Error fetching popular airports:', error);
    throw error;
  }
});

export default flights;
