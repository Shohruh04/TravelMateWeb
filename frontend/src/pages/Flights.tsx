import { useState, useEffect } from 'react'
import { api } from '@/utils/api'
import { FlightEstimateResponse, PopularRoute, Airport } from '@/types'
import AirportAutocomplete from '@/components/common/AirportAutocomplete'
import Loading from '@/components/common/Loading'
import ErrorMessage from '@/components/common/ErrorMessage'

interface FlightSearchForm {
  origin: string
  destination: string
  departureDate: string
  returnDate: string
  passengers: number
  tripType: 'one-way' | 'round-trip'
}

const Flights = () => {
  const [formData, setFormData] = useState<FlightSearchForm>({
    origin: '',
    destination: '',
    departureDate: '',
    returnDate: '',
    passengers: 1,
    tripType: 'round-trip'
  })

  const [selectedOriginAirport, setSelectedOriginAirport] = useState<Airport | null>(null)
  const [selectedDestinationAirport, setSelectedDestinationAirport] = useState<Airport | null>(null)
  const [estimate, setEstimate] = useState<FlightEstimateResponse | null>(null)
  const [popularRoutes, setPopularRoutes] = useState<PopularRoute[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [hasSearched, setHasSearched] = useState(false)

  // Load popular routes on mount
  useEffect(() => {
    loadPopularRoutes()
  }, [])

  const loadPopularRoutes = async () => {
    setIsLoadingRoutes(true)
    try {
      const response = await api.flights.popularRoutes() as { routes: PopularRoute[] }
      setPopularRoutes(response.routes || [])
    } catch (err) {
      console.error('Error loading popular routes:', err)
    } finally {
      setIsLoadingRoutes(false)
    }
  }

  const handleInputChange = (field: keyof FlightSearchForm, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleOriginChange = (value: string, airport?: Airport) => {
    setFormData(prev => ({ ...prev, origin: value }))
    if (airport) {
      setSelectedOriginAirport(airport)
    }
  }

  const handleDestinationChange = (value: string, airport?: Airport) => {
    setFormData(prev => ({ ...prev, destination: value }))
    if (airport) {
      setSelectedDestinationAirport(airport)
    }
  }

  const handleSwapLocations = () => {
    setFormData(prev => ({
      ...prev,
      origin: prev.destination,
      destination: prev.origin
    }))
    const tempAirport = selectedOriginAirport
    setSelectedOriginAirport(selectedDestinationAirport)
    setSelectedDestinationAirport(tempAirport)
  }

  const handlePopularRouteClick = (route: PopularRoute) => {
    setFormData(prev => ({
      ...prev,
      origin: `${route.route.origin.city} (${route.route.origin.code})`,
      destination: `${route.route.destination.city} (${route.route.destination.code})`
    }))
    setSelectedOriginAirport(route.route.origin)
    setSelectedDestinationAirport(route.route.destination)

    // Scroll to search form
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedOriginAirport || !selectedDestinationAirport) {
      setError(new Error('Please select valid airports from the suggestions'))
      return
    }

    setIsSearching(true)
    setError(null)
    setHasSearched(true)

    try {
      const requestData = {
        origin: selectedOriginAirport.code,
        destination: selectedDestinationAirport.code,
        departureDate: formData.departureDate,
        returnDate: formData.tripType === 'round-trip' ? formData.returnDate : undefined,
        passengers: formData.passengers,
        tripType: formData.tripType
      }

      const response = await api.flights.estimate(requestData) as FlightEstimateResponse
      setEstimate(response)
    } catch (err) {
      setError(err as Error)
      setEstimate(null)
    } finally {
      setIsSearching(false)
    }
  }

  const handleFindFlights = () => {
    if (!selectedOriginAirport || !selectedDestinationAirport) return

    // Construct Google Flights URL
    const url = `https://www.google.com/flights?hl=en#flt=${selectedOriginAirport.code}.${selectedDestinationAirport.code}.${formData.departureDate}${
      formData.tripType === 'round-trip' && formData.returnDate
        ? `.${selectedDestinationAirport.code}.${selectedOriginAirport.code}.${formData.returnDate}`
        : ''
    };c:USD;e:1;px:${formData.passengers}`

    window.open(url, '_blank', 'noopener,noreferrer')
  }

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-700 text-white py-16">
        <div className="section-container">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Flight Price Estimates</h1>
          <p className="text-xl text-primary-100">
            AI-powered flight predictions to help you find the best deals
          </p>
        </div>
      </section>

      {/* Search Form Section */}
      <section className="section-container">
        <div className="card mb-8">
          <form onSubmit={handleSearch} className="space-y-6">
            {/* Trip Type Toggle */}
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => handleInputChange('tripType', 'round-trip')}
                className={`px-6 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  formData.tripType === 'round-trip'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Round Trip
              </button>
              <button
                type="button"
                onClick={() => handleInputChange('tripType', 'one-way')}
                className={`px-6 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  formData.tripType === 'one-way'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                One Way
              </button>
            </div>

            {/* Location Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-4 items-end">
              <AirportAutocomplete
                value={formData.origin}
                onChange={handleOriginChange}
                placeholder="Departure city or airport"
                label="From"
                required
              />

              <button
                type="button"
                onClick={handleSwapLocations}
                className="mb-1 p-3 rounded-full bg-primary-100 text-primary-600 hover:bg-primary-200 transition-colors duration-200 self-center md:mb-0"
                title="Swap locations"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              </button>

              <AirportAutocomplete
                value={formData.destination}
                onChange={handleDestinationChange}
                placeholder="Destination city or airport"
                label="To"
                required
              />
            </div>

            {/* Date and Passenger Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Departure Date
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="date"
                  value={formData.departureDate}
                  onChange={(e) => handleInputChange('departureDate', e.target.value)}
                  min={today}
                  className="input-field w-full"
                  required
                />
              </div>

              {formData.tripType === 'round-trip' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Return Date
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.returnDate}
                    onChange={(e) => handleInputChange('returnDate', e.target.value)}
                    min={formData.departureDate || today}
                    className="input-field w-full"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Passengers
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="9"
                  value={formData.passengers}
                  onChange={(e) => handleInputChange('passengers', parseInt(e.target.value) || 1)}
                  className="input-field w-full"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary w-full md:w-auto px-8"
              disabled={isSearching}
            >
              {isSearching ? 'Searching...' : 'Search Flights'}
            </button>
          </form>
        </div>

        {/* Error Display */}
        {error && (
          <ErrorMessage
            error={error}
            title="Search Failed"
            onRetry={() => setError(null)}
            className="mb-8"
          />
        )}

        {/* Loading State */}
        {isSearching && (
          <Loading text="Finding best flight prices..." />
        )}

        {/* Results Section */}
        {estimate && !isSearching && (
          <div className="mb-8 space-y-6">
            {/* Price Estimate Card */}
            <div className="card bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Estimated Price Range
                  </h2>

                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-1">From</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {estimate.route.origin.city} ({estimate.route.origin.code})
                      </p>
                    </div>

                    <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>

                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-1">To</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {estimate.route.destination.city} ({estimate.route.destination.code})
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Duration</p>
                      <p className="font-semibold text-gray-900">{estimate.estimatedDuration}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Stops</p>
                      <p className="font-semibold text-gray-900">{estimate.stops}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600 mb-1">Example Carriers</p>
                      <p className="font-semibold text-gray-900">{estimate.carriers.join(', ')}</p>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <div className="flex gap-3">
                      <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="font-semibold text-yellow-900 mb-1">Important Notice</p>
                        <p className="text-sm text-yellow-800">{estimate.disclaimer}</p>
                        <p className="text-xs text-yellow-700 mt-2">
                          Generated at: {new Date(estimate.generatedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center lg:items-end gap-4">
                  <div className="text-center lg:text-right">
                    <p className="text-sm text-gray-600 mb-2">Estimated Price Range</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-primary-600">
                        ${estimate.priceRange.min}
                      </span>
                      <span className="text-2xl text-gray-600">-</span>
                      <span className="text-4xl font-bold text-primary-600">
                        ${estimate.priceRange.max}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {estimate.priceRange.currency} per person
                    </p>
                  </div>

                  <button
                    onClick={handleFindFlights}
                    className="btn-primary px-8 py-3 text-lg"
                  >
                    Find Flights
                  </button>
                </div>
              </div>
            </div>

            {/* Price Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-3xl">📈</span>
                  <h3 className="text-lg font-semibold text-gray-900">Best Time to Book</h3>
                </div>
                <p className="text-gray-700">
                  Prices typically drop 8-12 weeks before departure
                </p>
              </div>

              <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-3xl">💰</span>
                  <h3 className="text-lg font-semibold text-gray-900">Save Money</h3>
                </div>
                <p className="text-gray-700">
                  Compare prices across multiple booking sites
                </p>
              </div>

              <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-3xl">⏰</span>
                  <h3 className="text-lg font-semibold text-gray-900">Cheapest Days</h3>
                </div>
                <p className="text-gray-700">
                  Tuesday and Wednesday flights save up to 20%
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!estimate && !isSearching && hasSearched && !error && (
          <div className="text-center py-12">
            <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Results Found</h3>
            <p className="text-gray-500">Try adjusting your search criteria</p>
          </div>
        )}

        {/* Popular Routes Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Routes</h2>

          {isLoadingRoutes ? (
            <Loading text="Loading popular routes..." />
          ) : popularRoutes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularRoutes.map((route) => (
                <button
                  key={route.id}
                  onClick={() => handlePopularRouteClick(route)}
                  className="card text-left hover:scale-[1.02] hover:shadow-lg transition-all duration-200 group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-semibold text-gray-900">
                          {route.route.origin.city}
                        </p>
                        <svg className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                        <p className="font-semibold text-gray-900">
                          {route.route.destination.city}
                        </p>
                      </div>
                      <p className="text-sm text-gray-600">
                        {route.route.origin.code} → {route.route.destination.code}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary-600">
                        ${route.averagePrice}
                      </p>
                      <p className="text-xs text-gray-500">{route.currency}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-200">
                    <span className="text-sm text-primary-600 group-hover:text-primary-700 font-medium">
                      Quick Select →
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No popular routes available at the moment
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default Flights
