import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios'

// API Configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '30000')

/**
 * Custom API Error class for better error handling
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public data?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * Create and configure Axios instance
 */
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_URL,
    timeout: API_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // Request interceptor - add auth token if available
  client.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('auth_token')
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  // Response interceptor - handle errors globally
  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      const apiError = handleApiError(error)
      return Promise.reject(apiError)
    }
  )

  return client
}

/**
 * Handle API errors and convert to ApiError
 */
const handleApiError = (error: AxiosError): ApiError => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response
    const errorData = data as { message?: string; code?: string }

    return new ApiError(
      errorData.message || 'An error occurred',
      status,
      errorData.code,
      data
    )
  } else if (error.request) {
    // Request made but no response
    return new ApiError(
      'Network error. Please check your connection.',
      undefined,
      'NETWORK_ERROR'
    )
  } else {
    // Error in request setup
    return new ApiError(
      error.message || 'An unexpected error occurred',
      undefined,
      'REQUEST_ERROR'
    )
  }
}

// Create the API client instance
const apiClient = createApiClient()

/**
 * Generic API request wrapper
 */
async function request<T>(
  method: 'get' | 'post' | 'put' | 'patch' | 'delete',
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  try {
    const response = await apiClient.request<T>({
      method,
      url,
      data,
      ...config,
    })
    return response.data
  } catch (error) {
    throw error
  }
}

/**
 * API Service - Organized by domain
 */
export const api = {
  // Authentication
  auth: {
    register: (email: string, password: string, name: string) =>
      request<{ success: boolean; token: string; user: unknown }>('post', '/auth/register', {
        email,
        password,
        name
      }),

    login: (email: string, password: string) =>
      request<{ success: boolean; token: string; user: unknown }>('post', '/auth/login', {
        email,
        password
      }),

    me: () =>
      request<{ user: unknown }>('get', '/auth/me'),

    logout: () =>
      request<{ success: boolean }>('post', '/auth/logout'),
  },

  // Payment & Subscriptions
  payment: {
    createCheckoutSession: (tier: string, billingPeriod: 'monthly' | 'annual') =>
      request<{ sessionId: string; url: string }>('post', '/payment/create-checkout-session', {
        tier,
        billingPeriod
      }),

    createPortalSession: () =>
      request<{ url: string }>('post', '/payment/create-portal-session'),

    getSubscriptionStatus: () =>
      request<unknown>('get', '/payment/subscription-status'),

    getPricing: () =>
      request<unknown>('get', '/payment/pricing'),

    getPaymentHistory: () =>
      request<unknown[]>('get', '/payment/history'),
  },

  // Destinations
  destinations: {
    list: () =>
      request<unknown>('get', '/destinations'),

    search: (query: string) =>
      request<unknown>('get', '/destinations/search', undefined, { params: { q: query } }),

    get: (id: string) =>
      request<unknown>('get', `/destinations/${id}`),

    getById: (id: string) =>
      request<unknown>('get', `/destinations/${id}`),

    popular: () =>
      request<unknown>('get', '/destinations/popular'),

    getPopular: () =>
      request<unknown>('get', '/destinations/popular'),
  },

  // Search
  search: {
    query: (q: string) =>
      request<unknown>('get', '/search', undefined, { params: { q } }),
  },

  // Accommodations
  accommodations: {
    search: (params: {
      location?: string
      checkIn?: string
      checkOut?: string
      guests?: number
      priceRange?: string
      rating?: string
      type?: string
    }) =>
      request<unknown>('get', '/accommodations/search', undefined, { params }),

    getById: (id: string) =>
      request<unknown>('get', `/accommodations/${id}`),

    getByDestination: (destinationId: string, filters?: {
      priceRange?: string
      rating?: string
      type?: string
      amenities?: string[]
      page?: number
      limit?: number
    }) =>
      request<unknown>('get', `/accommodations`, undefined, {
        params: { destinationId, ...filters }
      }),

    getRecommendations: (userId?: string) =>
      request<unknown>('get', '/accommodations/recommendations', undefined, {
        params: { userId }
      }),
  },

  // Flights
  flights: {
    search: (params: {
      from: string
      to: string
      departDate: string
      returnDate?: string
      passengers: number
      class?: string
    }) =>
      request<unknown>('get', '/flights/search', undefined, { params }),

    estimate: (data: {
      origin: string
      destination: string
      departureDate: string
      returnDate?: string
      passengers: number
      tripType: 'one-way' | 'round-trip'
    }) =>
      request<unknown>('post', '/flights/estimate', data),

    popularRoutes: () =>
      request<unknown>('get', '/flights/popular-routes'),

    searchAirports: (query: string) =>
      request<unknown>('get', '/flights/airports', undefined, {
        params: { q: query }
      }),

    getEstimates: (from: string, to: string) =>
      request<unknown>('get', '/flights/estimates', undefined, {
        params: { from, to }
      }),

    getPriceAlerts: () =>
      request<unknown>('get', '/flights/price-alerts'),
  },

  // Tourist Tools
  tools: {
    currency: {
      rates: () =>
        request<unknown>('get', '/tools/currency/rates'),

      convert: (from: string, to: string, amount: number) =>
        request<unknown>('post', '/tools/currency/convert', { from, to, amount }),
    },

    weather: {
      get: (city: string) =>
        request<unknown>('get', '/tools/weather', undefined, {
          params: { city }
        }),

      forecast: (city: string, days?: number) =>
        request<unknown>('get', '/tools/weather/forecast', undefined, {
          params: { city, days: days || 7 }
        }),
    },

    language: {
      phrases: (languageCode?: string) =>
        request<unknown>('get', '/tools/language/phrases', undefined, {
          params: languageCode ? { language: languageCode } : {}
        }),
    },

    visa: {
      check: (nationality: string, destination: string) =>
        request<unknown>('post', '/tools/visa/check', { nationality, destination }),

      get: (country: string) =>
        request<unknown>('get', '/tools/visa', undefined, {
          params: { country }
        }),
    },
  },

  // User & Premium
  user: {
    getProfile: () =>
      request<unknown>('get', '/user/profile'),

    updateProfile: (data: unknown) =>
      request<unknown>('put', '/user/profile', data),

    getSubscription: () =>
      request<unknown>('get', '/user/subscription'),

    subscribe: (planId: string) =>
      request<unknown>('post', '/user/subscribe', { planId }),
  },

  // AI Features
  ai: {
    getRecommendations: (preferences: unknown) =>
      request<unknown>('post', '/ai/recommendations', preferences),

    generateItinerary: (params: {
      destination: string
      duration: number
      interests: string[]
      budget?: string
    }) =>
      request<unknown>('post', '/ai/itinerary', params),

    chat: (message: string, conversationId?: string) =>
      request<unknown>('post', '/ai/chat', { message, conversationId }),
  },
}

export default apiClient
