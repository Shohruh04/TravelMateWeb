/**
 * Common type definitions for the TravelMate application
 */

// Destination Types
export interface Destination {
  id: string
  name: string
  country: string
  description: string
  image?: string
  popularityScore: number
  averageRating: number
  coordinates?: {
    latitude: number
    longitude: number
  }
}

// Accommodation Types
export interface Accommodation {
  id: string
  name: string
  type: 'hotel' | 'resort' | 'apartment' | 'cabin' | 'hostel' | 'villa'
  location: {
    address: string
    city: string
    country: string
    coordinates?: {
      latitude: number
      longitude: number
    }
  }
  rating: number
  reviewCount: number
  price: {
    amount: number
    currency: string
    period: 'night' | 'week' | 'month'
  }
  amenities: string[]
  images: string[]
  description: string
  availability: boolean
}

export interface AccommodationSearchParams {
  location?: string
  checkIn?: string
  checkOut?: string
  guests?: number
  priceRange?: string
  rating?: string
  type?: string
}

// Flight Types
export interface Flight {
  id: string
  airline: string
  flightNumber: string
  departure: {
    airport: string
    airportCode: string
    time: string
    date: string
  }
  arrival: {
    airport: string
    airportCode: string
    time: string
    date: string
  }
  duration: string
  stops: number
  price: {
    amount: number
    currency: string
    class: 'economy' | 'premium-economy' | 'business' | 'first'
  }
  availability: number
}

export interface FlightSearchParams {
  from: string
  to: string
  departDate: string
  returnDate?: string
  passengers: number
  class?: string
}

// User Types
export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  preferences?: UserPreferences
  subscription?: Subscription
  createdAt: string
}

export interface UserPreferences {
  currency: string
  language: string
  interests: string[]
  budget?: 'budget' | 'moderate' | 'luxury'
  travelStyle?: 'adventure' | 'relaxation' | 'cultural' | 'business'
}

export interface Subscription {
  plan: 'free' | 'pro' | 'enterprise'
  status: 'active' | 'inactive' | 'trial' | 'expired'
  startDate: string
  endDate?: string
  autoRenew: boolean
}

// Weather Types
export interface Weather {
  location: string
  current: {
    temperature: number
    condition: string
    humidity: number
    windSpeed: number
  }
  forecast: DayForecast[]
}

export interface DayForecast {
  date: string
  high: number
  low: number
  condition: string
  precipitation: number
}

// Currency Types
export interface CurrencyConversion {
  from: string
  to: string
  amount: number
  convertedAmount: number
  rate: number
  timestamp: string
}

// AI Types
export interface AIRecommendation {
  id: string
  type: 'destination' | 'accommodation' | 'activity'
  title: string
  description: string
  score: number
  reasoning: string
  data: unknown
}

export interface Itinerary {
  id: string
  destination: string
  duration: number
  startDate?: string
  days: ItineraryDay[]
  estimatedBudget?: {
    min: number
    max: number
    currency: string
  }
}

export interface ItineraryDay {
  day: number
  date?: string
  activities: Activity[]
  meals?: {
    breakfast?: string
    lunch?: string
    dinner?: string
  }
  accommodation?: string
}

export interface Activity {
  id: string
  title: string
  description: string
  duration: string
  time?: string
  location: string
  cost?: {
    amount: number
    currency: string
  }
  category: 'sightseeing' | 'dining' | 'adventure' | 'cultural' | 'relaxation' | 'shopping'
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  timestamp: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ApiError {
  message: string
  code?: string
  status?: number
  details?: unknown
}

// Flight Estimation Types
export interface Airport {
  code: string
  name: string
  city: string
  country: string
}

export interface FlightEstimateRequest {
  origin: string
  destination: string
  departureDate: string
  returnDate?: string
  passengers: number
  tripType: 'one-way' | 'round-trip'
}

export interface FlightEstimateResponse {
  route: {
    origin: Airport
    destination: Airport
  }
  priceRange: {
    min: number
    max: number
    currency: string
  }
  estimatedDuration: string
  stops: string
  carriers: string[]
  disclaimer: string
  generatedAt: string
}

export interface PopularRoute {
  id: string
  route: {
    origin: Airport
    destination: Airport
  }
  averagePrice: number
  currency: string
  popularity: number
}

// Tourist Tools Types

// Currency Types
export interface CurrencyRate {
  code: string
  name: string
  symbol: string
  rate: number
  lastUpdated: string
}

export interface CurrencyConversionResult {
  from: string
  to: string
  amount: number
  convertedAmount: number
  rate: number
  lastUpdated: string
  disclaimer: string
}

// Weather Types
export interface WeatherCurrent {
  city: string
  country: string
  temperature: number
  feelsLike: number
  condition: string
  description: string
  humidity: number
  windSpeed: number
  windDirection: string
  pressure: number
  visibility: number
  uvIndex: number
  icon: string
  lastUpdated: string
}

export interface WeatherForecastDay {
  date: string
  day: string
  high: number
  low: number
  condition: string
  description: string
  precipitation: number
  humidity: number
  windSpeed: number
  icon: string
}

export interface WeatherForecast {
  city: string
  country: string
  current: WeatherCurrent
  forecast: WeatherForecastDay[]
  disclaimer: string
}

// Language Phrases Types
export interface TravelPhrase {
  id: string
  english: string
  translated: string
  pronunciation: string
  category: PhraseCategory
  audioUrl?: string
}

export type PhraseCategory =
  | 'greetings'
  | 'directions'
  | 'emergencies'
  | 'dining'
  | 'shopping'
  | 'accommodation'
  | 'transportation'
  | 'numbers'
  | 'common'

export interface LanguagePhrasesResponse {
  language: string
  languageCode: string
  languageName: string
  phrases: TravelPhrase[]
  categories: PhraseCategory[]
}

// Visa Requirements Types
export interface VisaRequirement {
  nationality: string
  destination: string
  visaRequired: boolean
  visaType: 'none' | 'visa-free' | 'visa-on-arrival' | 'e-visa' | 'visa-required'
  maxStayDuration: string
  passportValidityRequired: string
  processingTime?: string
  fees?: string
  entryRequirements: string[]
  healthRequirements: string[]
  customsInfo: string[]
  travelAdvisories: string[]
  lastUpdated: string
  disclaimer: string
}

export interface VisaCheckRequest {
  nationality: string
  destination: string
}

export interface CountryInfo {
  code: string
  name: string
  region: string
  flag?: string
}

// Authentication Types
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
}

export interface AuthResponse {
  success: boolean
  token: string
  user: User
}

export interface AuthUser extends User {
  subscriptionTier: SubscriptionTier
  subscriptionStatus?: SubscriptionStatus
}

// Payment & Subscription Types
export type SubscriptionTier = 'free' | 'pro' | 'enterprise'

export interface SubscriptionStatus {
  tier: SubscriptionTier
  status: 'active' | 'inactive' | 'trial' | 'expired' | 'cancelled'
  currentPeriodStart?: string
  currentPeriodEnd?: string
  cancelAtPeriodEnd: boolean
  stripeCustomerId?: string
  stripeSubscriptionId?: string
}

export interface PricingTier {
  id: string
  name: string
  tier: SubscriptionTier
  description: string
  monthlyPrice: number
  annualPrice: number
  currency: string
  features: string[]
  highlighted: boolean
  popular: boolean
}

export interface CheckoutSessionRequest {
  tier: SubscriptionTier
  billingPeriod: 'monthly' | 'annual'
}

export interface CheckoutSession {
  sessionId: string
  url: string
}

export interface PaymentRecord {
  id: string
  amount: number
  currency: string
  status: 'succeeded' | 'pending' | 'failed'
  description: string
  createdAt: string
  invoiceUrl?: string
}
