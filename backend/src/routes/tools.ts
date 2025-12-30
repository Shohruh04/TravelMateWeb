import { Hono } from 'hono';
import * as currencyService from '../services/currencyService';
import * as weatherService from '../services/weatherService';
import * as translationService from '../services/translationService';
import * as visaService from '../services/visaService';

const tools = new Hono();

// ==================== CURRENCY ROUTES ====================

/**
 * GET /api/tools/currency/rates
 * Get all supported currencies with current exchange rates
 */
tools.get('/currency/rates', async (c) => {
  try {
    const result = await currencyService.getAllCurrencies();

    return c.json({
      data: result.currencies,
      lastUpdated: result.lastUpdated,
      disclaimer: 'Rates are for reference only. Verify with financial institutions for transactions.',
    });
  } catch (error) {
    console.error('Error fetching currency rates:', error);
    throw error;
  }
});

/**
 * POST /api/tools/currency/convert
 * Convert between currencies
 * Body: { from: string, to: string, amount: number }
 */
tools.post('/currency/convert', async (c) => {
  try {
    const body = await c.req.json();
    const { from, to, amount } = body;

    // Validation
    if (!from || !to) {
      return c.json(
        {
          error: 'Bad Request',
          message: 'Both "from" and "to" currency codes are required',
        },
        400
      );
    }

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return c.json(
        {
          error: 'Bad Request',
          message: 'Valid amount greater than 0 is required',
        },
        400
      );
    }

    const result = await currencyService.convertCurrency(from, to, amount);

    return c.json(result);
  } catch (error: any) {
    console.error('Error converting currency:', error);

    if (error.message?.includes('not found')) {
      return c.json(
        {
          error: 'Not Found',
          message: error.message,
        },
        404
      );
    }

    throw error;
  }
});

/**
 * GET /api/tools/currency/:code
 * Get specific currency information
 */
tools.get('/currency/:code', async (c) => {
  try {
    const { code } = c.req.param();
    const currency = await currencyService.getCurrencyByCode(code);

    if (!currency) {
      return c.json(
        {
          error: 'Not Found',
          message: `Currency ${code.toUpperCase()} not found`,
        },
        404
      );
    }

    return c.json({ data: currency });
  } catch (error) {
    console.error('Error fetching currency:', error);
    throw error;
  }
});

// ==================== WEATHER ROUTES ====================

/**
 * GET /api/tools/weather/:city
 * Get current weather for a city
 */
tools.get('/weather/:city', async (c) => {
  try {
    const { city } = c.req.param();

    if (!city || city.trim().length === 0) {
      return c.json(
        {
          error: 'Bad Request',
          message: 'City name is required',
        },
        400
      );
    }

    const weather = await weatherService.getCurrentWeather(city);

    return c.json(weather);
  } catch (error) {
    console.error('Error fetching weather:', error);
    throw error;
  }
});

/**
 * GET /api/tools/weather/forecast/:city
 * Get 7-day weather forecast for a city
 */
tools.get('/weather/forecast/:city', async (c) => {
  try {
    const { city } = c.req.param();

    if (!city || city.trim().length === 0) {
      return c.json(
        {
          error: 'Bad Request',
          message: 'City name is required',
        },
        400
      );
    }

    const forecast = await weatherService.getWeatherForecast(city);

    return c.json(forecast);
  } catch (error) {
    console.error('Error fetching weather forecast:', error);
    throw error;
  }
});

// ==================== LANGUAGE/TRANSLATION ROUTES ====================

/**
 * GET /api/tools/language/available
 * Get all available languages
 */
tools.get('/language/available', async (c) => {
  try {
    const languages = await translationService.getAvailableLanguages();

    return c.json({
      data: languages,
      total: languages.length,
    });
  } catch (error) {
    console.error('Error fetching available languages:', error);
    throw error;
  }
});

/**
 * GET /api/tools/language/phrases
 * Get common travel phrases for all languages
 */
tools.get('/language/phrases', async (c) => {
  try {
    const phrases = await translationService.getAllPhrases();

    return c.json({
      data: phrases,
      total: phrases.length,
    });
  } catch (error) {
    console.error('Error fetching phrases:', error);
    throw error;
  }
});

/**
 * GET /api/tools/language/phrases/:language
 * Get phrases for a specific language
 */
tools.get('/language/phrases/:language', async (c) => {
  try {
    const { language } = c.req.param();
    const phrases = await translationService.getPhrasesByLanguage(language);

    if (!phrases) {
      return c.json(
        {
          error: 'Not Found',
          message: `Language '${language}' not found`,
        },
        404
      );
    }

    return c.json(phrases);
  } catch (error) {
    console.error('Error fetching phrases by language:', error);
    throw error;
  }
});

/**
 * GET /api/tools/language/category/:category
 * Get phrases by category across all languages
 */
tools.get('/language/category/:category', async (c) => {
  try {
    const { category } = c.req.param();
    const phrases = await translationService.getPhrasesByCategory(category);

    return c.json({
      data: phrases,
      category,
      total: phrases.length,
    });
  } catch (error) {
    console.error('Error fetching phrases by category:', error);
    throw error;
  }
});

/**
 * GET /api/tools/language/search
 * Search phrases by query
 * Query params: q (search query)
 */
tools.get('/language/search', async (c) => {
  try {
    const query = c.req.query('q');

    if (!query || query.trim().length === 0) {
      return c.json(
        {
          error: 'Bad Request',
          message: 'Search query parameter "q" is required',
        },
        400
      );
    }

    const results = await translationService.searchPhrases(query);

    return c.json({
      data: results,
      query,
      total: results.length,
    });
  } catch (error) {
    console.error('Error searching phrases:', error);
    throw error;
  }
});

// ==================== VISA ROUTES ====================

/**
 * GET /api/tools/visa/destinations
 * Get all available destination countries
 */
tools.get('/visa/destinations', async (c) => {
  try {
    const countries = await visaService.getDestinationCountries();

    return c.json({
      data: countries,
      total: countries.length,
    });
  } catch (error) {
    console.error('Error fetching destination countries:', error);
    throw error;
  }
});

/**
 * GET /api/tools/visa/nationalities
 * Get all available nationality countries
 */
tools.get('/visa/nationalities', async (c) => {
  try {
    const countries = await visaService.getNationalityCountries();

    return c.json({
      data: countries,
      total: countries.length,
    });
  } catch (error) {
    console.error('Error fetching nationality countries:', error);
    throw error;
  }
});

/**
 * GET /api/tools/visa/:country
 * Get visa information for a destination country (all nationalities)
 */
tools.get('/visa/:country', async (c) => {
  try {
    const { country } = c.req.param();
    const requirements = await visaService.getVisaInfoByDestination(country);

    if (requirements.length === 0) {
      return c.json(
        {
          error: 'Not Found',
          message: `No visa information found for destination '${country.toUpperCase()}'`,
        },
        404
      );
    }

    return c.json({
      data: requirements,
      destination: country.toUpperCase(),
      total: requirements.length,
    });
  } catch (error) {
    console.error('Error fetching visa info by destination:', error);
    throw error;
  }
});

/**
 * POST /api/tools/visa/check
 * Check visa requirements for specific nationality and destination
 * Body: { nationality: string, destination: string }
 */
tools.post('/visa/check', async (c) => {
  try {
    const body = await c.req.json();
    const { nationality, destination } = body;

    // Validation
    if (!nationality || !destination) {
      return c.json(
        {
          error: 'Bad Request',
          message: 'Both "nationality" and "destination" country codes are required',
        },
        400
      );
    }

    const result = await visaService.checkVisaRequirements(nationality, destination);

    if (!result) {
      return c.json(
        {
          error: 'Not Found',
          message: `No visa information found for ${nationality.toUpperCase()} traveling to ${destination.toUpperCase()}`,
        },
        404
      );
    }

    return c.json(result);
  } catch (error) {
    console.error('Error checking visa requirements:', error);
    throw error;
  }
});

/**
 * GET /api/tools/visa/nationality/:code
 * Get visa requirements by nationality (all destinations)
 */
tools.get('/visa/nationality/:code', async (c) => {
  try {
    const { code } = c.req.param();
    const requirements = await visaService.getVisaInfoByNationality(code);

    if (requirements.length === 0) {
      return c.json(
        {
          error: 'Not Found',
          message: `No visa information found for nationality '${code.toUpperCase()}'`,
        },
        404
      );
    }

    return c.json({
      data: requirements,
      nationality: code.toUpperCase(),
      total: requirements.length,
    });
  } catch (error) {
    console.error('Error fetching visa info by nationality:', error);
    throw error;
  }
});

/**
 * GET /api/tools/visa/visa-free/:nationality
 * Get countries where visa is not required for a nationality
 */
tools.get('/visa/visa-free/:nationality', async (c) => {
  try {
    const { nationality } = c.req.param();
    const countries = await visaService.getVisaFreeCountries(nationality);

    return c.json({
      data: countries,
      nationality: nationality.toUpperCase(),
      total: countries.length,
    });
  } catch (error) {
    console.error('Error fetching visa-free countries:', error);
    throw error;
  }
});

export default tools;
