/**
 * Weather Service
 * Provides weather information with caching
 * Note: In production, integrate with OpenWeatherMap API or similar
 */

interface WeatherData {
  city: string;
  current: {
    temperature: number;
    condition: string;
    humidity: number;
    windSpeed: number;
    feelsLike?: number;
    pressure?: number;
  };
  lastUpdated: Date;
  disclaimer: string;
}

interface ForecastData {
  city: string;
  current: WeatherData['current'];
  forecast: Array<{
    date: string;
    high: number;
    low: number;
    condition: string;
    precipitation: number;
    humidity?: number;
  }>;
  lastUpdated: Date;
  disclaimer: string;
}

// In-memory cache for weather data (60 minutes TTL)
const weatherCache = new Map<string, { data: WeatherData | ForecastData; timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 60 minutes

/**
 * Mock weather conditions for demo purposes
 * In production, fetch from actual weather API
 */
const weatherConditions = [
  'Sunny', 'Partly Cloudy', 'Cloudy', 'Rainy', 'Thunderstorms',
  'Snowy', 'Foggy', 'Windy', 'Clear', 'Overcast'
];

/**
 * Generate mock weather data based on city
 * In production, replace with actual API call
 */
function generateMockWeather(city: string): WeatherData['current'] {
  // Use city name to generate consistent but varied data
  const seed = city.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const temp = 5 + (seed % 30); // Temperature between 5-35°C
  const conditionIndex = seed % weatherConditions.length;

  return {
    temperature: temp,
    condition: weatherConditions[conditionIndex],
    humidity: 40 + (seed % 50), // 40-90%
    windSpeed: 5 + (seed % 30), // 5-35 km/h
    feelsLike: temp + ((seed % 5) - 2), // +/- 2 degrees
    pressure: 1000 + (seed % 30), // 1000-1030 hPa
  };
}

/**
 * Generate mock 7-day forecast
 * In production, replace with actual API call
 */
function generateMockForecast(city: string) {
  const seed = city.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const baseTemp = 10 + (seed % 20);
  const forecast = [];

  const today = new Date();

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);

    const dayVariation = Math.sin(i) * 5;
    const high = baseTemp + 5 + dayVariation + ((seed + i) % 5);
    const low = baseTemp - 5 + dayVariation + ((seed + i) % 3);

    forecast.push({
      date: date.toISOString().split('T')[0],
      high: Math.round(high),
      low: Math.round(low),
      condition: weatherConditions[(seed + i) % weatherConditions.length],
      precipitation: (seed + i) % 100, // 0-100%
      humidity: 40 + ((seed + i) % 50),
    });
  }

  return forecast;
}

/**
 * Get current weather for a city
 */
export async function getCurrentWeather(city: string): Promise<WeatherData> {
  const cacheKey = `current_${city.toLowerCase()}`;

  // Check cache
  const cached = weatherCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data as WeatherData;
  }

  // In production, fetch from weather API
  // const apiKey = process.env.OPENWEATHER_API_KEY;
  // const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);

  // Generate mock data for now
  const weatherData: WeatherData = {
    city,
    current: generateMockWeather(city),
    lastUpdated: new Date(),
    disclaimer: 'Weather data refreshes periodically. Check official sources for critical decisions.',
  };

  // Cache the result
  weatherCache.set(cacheKey, { data: weatherData, timestamp: Date.now() });

  return weatherData;
}

/**
 * Get 7-day weather forecast for a city
 */
export async function getWeatherForecast(city: string): Promise<ForecastData> {
  const cacheKey = `forecast_${city.toLowerCase()}`;

  // Check cache
  const cached = weatherCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data as ForecastData;
  }

  // In production, fetch from weather API
  // const apiKey = process.env.OPENWEATHER_API_KEY;
  // const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`);

  // Generate mock data for now
  const current = generateMockWeather(city);
  const forecast = generateMockForecast(city);

  const forecastData: ForecastData = {
    city,
    current,
    forecast,
    lastUpdated: new Date(),
    disclaimer: 'Weather data refreshes periodically. Check official sources for critical decisions.',
  };

  // Cache the result
  weatherCache.set(cacheKey, { data: forecastData, timestamp: Date.now() });

  return forecastData;
}

/**
 * Clear weather cache (useful for testing or forced refresh)
 */
export function clearWeatherCache() {
  weatherCache.clear();
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return {
    size: weatherCache.size,
    entries: Array.from(weatherCache.keys()),
  };
}
