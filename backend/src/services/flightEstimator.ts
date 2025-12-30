/**
 * Flight Price Estimation Service
 * Provides estimated flight price ranges based on various factors
 *
 * NOTE: This is an estimation service, NOT a real-time booking API
 * Prices are indicative and should be used for budgeting purposes only
 */

interface Location {
  code: string;
  city: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

interface RouteInfo {
  origin: Location;
  destination: Location;
  isDirect: boolean;
  durationHours: number;
  distanceKm: number;
}

interface PriceEstimate {
  minPrice: number;
  maxPrice: number;
  currency: string;
  route: RouteInfo;
  carriers: string[];
  tripType: 'one-way' | 'round-trip';
  generatedAt: string;
}

interface EstimateRequest {
  origin: Location;
  destination: Location;
  departDate?: string;
  returnDate?: string;
  passengers?: number;
}

/**
 * Calculate distance between two points using Haversine formula
 * Returns distance in kilometers
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Estimate flight duration based on distance
 * Includes average taxi, takeoff, landing time
 */
function estimateFlightDuration(distanceKm: number, isDirect: boolean): number {
  // Average cruise speed: 800 km/h
  // Add 1 hour for taxi, takeoff, landing
  const cruiseHours = distanceKm / 800;
  const totalHours = cruiseHours + 1;

  // Add layover time for connecting flights
  if (!isDirect) {
    return totalHours + 2; // Average 2-hour layover
  }

  return Math.round(totalHours * 10) / 10; // Round to 1 decimal
}

/**
 * Determine if route is typically direct based on distance and popularity
 */
function isDirectFlight(distanceKm: number): boolean {
  // Direct flights typically available for routes < 8000km
  // Most long-haul routes > 8000km require connections
  return distanceKm < 8000;
}

/**
 * Get seasonal price multiplier
 */
function getSeasonalMultiplier(departDate?: string): number {
  if (!departDate) return 1.0;

  const date = new Date(departDate);
  const month = date.getMonth(); // 0-11

  // Peak season: June-August (summer), December (holidays)
  if (month >= 5 && month <= 7) return 1.3; // Summer
  if (month === 11) return 1.4; // December holidays

  // Shoulder season: March-May, September-November
  if ((month >= 2 && month <= 4) || (month >= 8 && month <= 10)) return 1.1;

  // Low season: January-February
  return 0.9;
}

/**
 * Get advance booking multiplier
 */
function getAdvanceBookingMultiplier(departDate?: string): number {
  if (!departDate) return 1.0;

  const now = new Date();
  const departure = new Date(departDate);
  const daysInAdvance = Math.floor(
    (departure.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Last minute (< 7 days): high price
  if (daysInAdvance < 7) return 1.5;

  // Short notice (7-21 days): moderate premium
  if (daysInAdvance < 21) return 1.2;

  // Sweet spot (21-90 days): best prices
  if (daysInAdvance <= 90) return 0.9;

  // Very early (> 90 days): slight premium
  return 1.1;
}

/**
 * Get sample carriers for a route
 */
function getSampleCarriers(
  origin: Location,
  destination: Location,
  distanceKm: number
): string[] {
  const carriers: string[] = [];

  // Add regional carriers based on origin/destination
  const regions = {
    northAmerica: ['United', 'American', 'Delta'],
    europe: ['Air France', 'Lufthansa', 'British Airways'],
    asia: ['ANA', 'JAL', 'Singapore Airlines'],
    middleEast: ['Emirates', 'Qatar Airways', 'Etihad'],
    latinAmerica: ['LATAM', 'Avianca', 'Aeromexico'],
    oceania: ['Qantas', 'Air New Zealand'],
  };

  // Determine regions based on city/country
  const isNorthAmerica = (loc: Location) =>
    loc.country === 'United States' || loc.country === 'Canada' || loc.country === 'Mexico';
  const isEurope = (loc: Location) =>
    loc.country === 'France' || loc.country === 'Germany' || loc.country === 'United Kingdom' ||
    loc.country === 'Spain' || loc.country === 'Italy' || loc.country === 'Netherlands';
  const isAsia = (loc: Location) =>
    loc.country === 'Japan' || loc.country === 'China' || loc.country === 'Singapore' ||
    loc.country === 'Thailand' || loc.country === 'South Korea';

  // Add carriers based on origin
  if (isNorthAmerica(origin)) carriers.push(...regions.northAmerica.slice(0, 2));
  if (isEurope(origin)) carriers.push(...regions.europe.slice(0, 2));
  if (isAsia(origin)) carriers.push(...regions.asia.slice(0, 2));

  // Add carriers based on destination
  if (isNorthAmerica(destination) && !isNorthAmerica(origin)) {
    carriers.push(regions.northAmerica[0]);
  }
  if (isEurope(destination) && !isEurope(origin)) {
    carriers.push(regions.europe[0]);
  }
  if (isAsia(destination) && !isAsia(origin)) {
    carriers.push(regions.asia[0]);
  }

  // For long-haul flights, add major international carriers
  if (distanceKm > 5000) {
    carriers.push(...regions.middleEast.slice(0, 1));
  }

  // Remove duplicates and limit to 3-4 carriers
  const uniqueCarriers = [...new Set(carriers)];
  return uniqueCarriers.slice(0, Math.min(4, uniqueCarriers.length));
}

/**
 * Calculate base price per kilometer
 * Uses tiered pricing based on distance
 */
function getBasePricePerKm(distanceKm: number): number {
  // Short-haul (< 1500km): Higher per-km cost
  if (distanceKm < 1500) return 0.20;

  // Medium-haul (1500-4000km): Moderate per-km cost
  if (distanceKm < 4000) return 0.15;

  // Long-haul (4000-8000km): Lower per-km cost
  if (distanceKm < 8000) return 0.12;

  // Ultra long-haul (> 8000km): Lowest per-km cost
  return 0.10;
}

/**
 * Main estimation function
 * Calculates flight price estimate based on multiple factors
 */
export function estimateFlightPrice(request: EstimateRequest): PriceEstimate {
  const { origin, destination, departDate, returnDate, passengers = 1 } = request;

  // Validate coordinates
  if (
    !origin.latitude ||
    !origin.longitude ||
    !destination.latitude ||
    !destination.longitude
  ) {
    throw new Error('Origin and destination must have valid coordinates');
  }

  // Calculate distance
  const distanceKm = calculateDistance(
    origin.latitude,
    origin.longitude,
    destination.latitude,
    destination.longitude
  );

  // Determine if direct flight
  const isDirect = isDirectFlight(distanceKm);

  // Calculate flight duration
  const durationHours = estimateFlightDuration(distanceKm, isDirect);

  // Calculate base price
  const basePricePerKm = getBasePricePerKm(distanceKm);
  let basePrice = distanceKm * basePricePerKm;

  // Add base fee (covers airport fees, fuel surcharge, etc.)
  basePrice += 50;

  // Apply seasonal multiplier
  const seasonalMultiplier = getSeasonalMultiplier(departDate);
  basePrice *= seasonalMultiplier;

  // Apply advance booking multiplier
  const advanceMultiplier = getAdvanceBookingMultiplier(departDate);
  basePrice *= advanceMultiplier;

  // Direct flight premium
  if (isDirect) {
    basePrice *= 1.2;
  }

  // Round-trip pricing
  const tripType = returnDate ? 'round-trip' : 'one-way';
  if (tripType === 'round-trip') {
    // Round-trip typically 1.8x one-way (not 2x due to discounts)
    basePrice *= 1.8;
  }

  // Calculate price range (±30% variation)
  const minPrice = Math.round(basePrice * 0.7 * passengers);
  const maxPrice = Math.round(basePrice * 1.3 * passengers);

  // Get sample carriers
  const carriers = getSampleCarriers(origin, destination, distanceKm);

  // Build route info
  const route: RouteInfo = {
    origin: {
      code: origin.code,
      city: origin.city,
      country: origin.country,
    },
    destination: {
      code: destination.code,
      city: destination.city,
      country: destination.country,
    },
    isDirect,
    durationHours,
    distanceKm: Math.round(distanceKm),
  };

  return {
    minPrice,
    maxPrice,
    currency: 'USD',
    route,
    carriers: carriers.length > 0 ? carriers : ['Various carriers'],
    tripType,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Popular routes with pre-calculated estimates
 * These are static for fast response times
 */
export const POPULAR_ROUTES = [
  {
    name: 'New York to London',
    origin: { code: 'JFK', city: 'New York', country: 'United States' },
    destination: { code: 'LHR', city: 'London', country: 'United Kingdom' },
    estimatedPrice: { min: 350, max: 850 },
    duration: 7.5,
    isDirect: true,
  },
  {
    name: 'Los Angeles to Tokyo',
    origin: { code: 'LAX', city: 'Los Angeles', country: 'United States' },
    destination: { code: 'NRT', city: 'Tokyo', country: 'Japan' },
    estimatedPrice: { min: 600, max: 1400 },
    duration: 11.5,
    isDirect: true,
  },
  {
    name: 'Miami to Cancun',
    origin: { code: 'MIA', city: 'Miami', country: 'United States' },
    destination: { code: 'CUN', city: 'Cancun', country: 'Mexico' },
    estimatedPrice: { min: 200, max: 500 },
    duration: 2.5,
    isDirect: true,
  },
  {
    name: 'Paris to Dubai',
    origin: { code: 'CDG', city: 'Paris', country: 'France' },
    destination: { code: 'DXB', city: 'Dubai', country: 'UAE' },
    estimatedPrice: { min: 400, max: 1000 },
    duration: 7,
    isDirect: true,
  },
  {
    name: 'London to Singapore',
    origin: { code: 'LHR', city: 'London', country: 'United Kingdom' },
    destination: { code: 'SIN', city: 'Singapore', country: 'Singapore' },
    estimatedPrice: { min: 550, max: 1300 },
    duration: 13,
    isDirect: true,
  },
  {
    name: 'Sydney to Auckland',
    origin: { code: 'SYD', city: 'Sydney', country: 'Australia' },
    destination: { code: 'AKL', city: 'Auckland', country: 'New Zealand' },
    estimatedPrice: { min: 250, max: 600 },
    duration: 3.5,
    isDirect: true,
  },
  {
    name: 'Toronto to Mexico City',
    origin: { code: 'YYZ', city: 'Toronto', country: 'Canada' },
    destination: { code: 'MEX', city: 'Mexico City', country: 'Mexico' },
    estimatedPrice: { min: 300, max: 700 },
    duration: 5,
    isDirect: true,
  },
  {
    name: 'Barcelona to Rome',
    origin: { code: 'BCN', city: 'Barcelona', country: 'Spain' },
    destination: { code: 'FCO', city: 'Rome', country: 'Italy' },
    estimatedPrice: { min: 150, max: 400 },
    duration: 2,
    isDirect: true,
  },
];
