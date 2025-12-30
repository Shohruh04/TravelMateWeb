import { Hono } from 'hono';
import { prisma } from '../db/client';
import { NotFoundError } from '../middleware/errorHandler';

const destinations = new Hono();

/**
 * GET /api/destinations/popular
 * Retrieves most popular destinations
 * Query params: limit (default: 6)
 */
destinations.get('/popular', async (c) => {
  try {
    const limit = c.req.query('limit');
    const take = limit ? parseInt(limit, 10) : 6;

    const popularDestinations = await prisma.destination.findMany({
      select: {
        id: true,
        name: true,
        country: true,
        description: true,
        imageUrl: true,
        popularityScore: true,
        _count: {
          select: {
            accommodations: true,
            attractions: true,
          },
        },
      },
      orderBy: {
        popularityScore: 'desc',
      },
      take,
    });

    return c.json({
      data: popularDestinations,
      total: popularDestinations.length,
    });
  } catch (error) {
    console.error('Error fetching popular destinations:', error);
    throw error;
  }
});

/**
 * GET /api/destinations
 * Retrieves all destinations with optional filtering
 * Query params: country, limit, offset
 */
destinations.get('/', async (c) => {
  try {
    const { country, limit, offset } = c.req.query();

    const where = country ? { country } : {};
    const take = limit ? parseInt(limit, 10) : undefined;
    const skip = offset ? parseInt(offset, 10) : undefined;

    const [destinations, total] = await Promise.all([
      prisma.destination.findMany({
        where,
        take,
        skip,
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          country: true,
          description: true,
          imageUrl: true,
          latitude: true,
          longitude: true,
          climate: true,
          bestTimeToVisit: true,
          currency: true,
          language: true,
          timezone: true,
          popularityScore: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              accommodations: true,
              attractions: true,
            },
          },
        },
      }),
      prisma.destination.count({ where }),
    ]);

    return c.json({
      data: destinations,
      pagination: {
        total,
        limit: take || total,
        offset: skip || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching destinations:', error);
    throw error;
  }
});

/**
 * GET /api/destinations/:id
 * Retrieves a specific destination by ID with full details including statistics
 */
destinations.get('/:id', async (c) => {
  try {
    const { id } = c.req.param();

    const destination = await prisma.destination.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            accommodations: true,
            attractions: true,
          },
        },
      },
    });

    if (!destination) {
      throw new NotFoundError(`Destination with ID ${id} not found`);
    }

    // Transform response to include count properties at root level
    const response = {
      ...destination,
      accommodationCount: destination._count.accommodations,
      attractionCount: destination._count.attractions,
    };

    return c.json({ data: response });
  } catch (error) {
    console.error('Error fetching destination:', error);
    throw error;
  }
});

/**
 * GET /api/destinations/:id/accommodations
 * Retrieves all accommodations for a specific destination
 * Query params: type, minPrice, maxPrice, minRating, amenities, sortBy, limit, offset
 * amenities: comma-separated list (e.g., "WiFi,Pool,Parking")
 * sortBy: price_asc, price_desc, rating_asc, rating_desc, name_asc, name_desc (default: rating_desc)
 */
destinations.get('/:id/accommodations', async (c) => {
  try {
    const { id } = c.req.param();
    const { type, minPrice, maxPrice, minRating, amenities, sortBy, limit, offset } = c.req.query();

    // Verify destination exists
    const destination = await prisma.destination.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!destination) {
      throw new NotFoundError(`Destination with ID ${id} not found`);
    }

    // Build filter conditions
    const where: any = { destinationId: id };

    if (type) {
      where.type = type;
    }

    if (minPrice || maxPrice) {
      where.pricePerNight = {};
      if (minPrice) where.pricePerNight.gte = parseFloat(minPrice);
      if (maxPrice) where.pricePerNight.lte = parseFloat(maxPrice);
    }

    if (minRating) {
      where.rating = { gte: parseFloat(minRating) };
    }

    // Filter by amenities (all must be present)
    if (amenities) {
      const amenityList = amenities.split(',').map((a: string) => a.trim());
      where.amenities = {
        hasEvery: amenityList,
      };
    }

    // Parse sort parameter
    let orderBy: any = [{ rating: 'desc' }, { name: 'asc' }];
    if (sortBy) {
      switch (sortBy) {
        case 'price_asc':
          orderBy = { pricePerNight: 'asc' };
          break;
        case 'price_desc':
          orderBy = { pricePerNight: 'desc' };
          break;
        case 'rating_asc':
          orderBy = { rating: 'asc' };
          break;
        case 'rating_desc':
          orderBy = { rating: 'desc' };
          break;
        case 'name_asc':
          orderBy = { name: 'asc' };
          break;
        case 'name_desc':
          orderBy = { name: 'desc' };
          break;
        default:
          orderBy = [{ rating: 'desc' }, { name: 'asc' }];
      }
    }

    const take = limit ? parseInt(limit, 10) : undefined;
    const skip = offset ? parseInt(offset, 10) : undefined;

    const [accommodations, total] = await Promise.all([
      prisma.accommodation.findMany({
        where,
        take,
        skip,
        orderBy,
      }),
      prisma.accommodation.count({ where }),
    ]);

    return c.json({
      data: accommodations,
      pagination: {
        total,
        limit: take || total,
        offset: skip || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching accommodations:', error);
    throw error;
  }
});

/**
 * GET /api/destinations/:id/attractions
 * Retrieves all attractions for a specific destination
 * Query params: type, minRating, limit, offset
 */
destinations.get('/:id/attractions', async (c) => {
  try {
    const { id } = c.req.param();
    const { type, minRating, limit, offset } = c.req.query();

    // Verify destination exists
    const destination = await prisma.destination.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!destination) {
      throw new NotFoundError(`Destination with ID ${id} not found`);
    }

    // Build filter conditions
    const where: any = { destinationId: id };

    if (type) {
      where.type = type;
    }

    if (minRating) {
      where.rating = { gte: parseFloat(minRating) };
    }

    const take = limit ? parseInt(limit, 10) : undefined;
    const skip = offset ? parseInt(offset, 10) : undefined;

    const [attractions, total] = await Promise.all([
      prisma.attraction.findMany({
        where,
        take,
        skip,
        orderBy: [{ rating: 'desc' }, { name: 'asc' }],
      }),
      prisma.attraction.count({ where }),
    ]);

    return c.json({
      data: attractions,
      pagination: {
        total,
        limit: take || total,
        offset: skip || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching attractions:', error);
    throw error;
  }
});

export default destinations;
