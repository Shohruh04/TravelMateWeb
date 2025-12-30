import { Hono } from 'hono';
import { prisma } from '../db/client';

const search = new Hono();

/**
 * GET /api/search?q=query
 * Global search across destinations by name, country, or description
 * Returns top 10 most relevant results
 */
search.get('/', async (c) => {
  try {
    const query = c.req.query('q');

    if (!query || query.trim().length === 0) {
      return c.json({
        data: [],
        message: 'Search query is required',
      });
    }

    const searchTerm = query.trim();

    // Search destinations with fuzzy matching
    // Using case-insensitive contains for name, country
    const destinations = await prisma.destination.findMany({
      where: {
        OR: [
          {
            name: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
          {
            country: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
          {
            description: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
        ],
      },
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
      orderBy: [
        { popularityScore: 'desc' },
        { name: 'asc' },
      ],
      take: 10,
    });

    return c.json({
      data: destinations,
      query: searchTerm,
      total: destinations.length,
    });
  } catch (error) {
    console.error('Error searching destinations:', error);
    throw error;
  }
});

export default search;
