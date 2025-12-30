import { useState, useEffect } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { api } from '@/utils/api'
import { Accommodation, AccommodationSearchParams } from '@/types'
import { useDestination } from '@/context/DestinationContext'
import Loading from '@/components/common/Loading'
import ErrorMessage from '@/components/common/ErrorMessage'

interface FilterState {
  priceRange: string
  rating: string
  type: string
  checkIn: string
  checkOut: string
  guests: number
}

const Accommodations = () => {
  const location = useLocation()
  const { selectedDestination, searchQuery } = useDestination()

  const [filters, setFilters] = useState<FilterState>({
    priceRange: 'all',
    rating: 'all',
    type: 'all',
    checkIn: '',
    checkOut: '',
    guests: 1
  })

  const [searchLocation, setSearchLocation] = useState(
    (location.state as { destination?: string })?.destination ||
    selectedDestination?.name ||
    searchQuery ||
    ''
  )

  const [accommodations, setAccommodations] = useState<Accommodation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [totalResults, setTotalResults] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const ITEMS_PER_PAGE = 12

  // Load accommodations when filters or search location change
  useEffect(() => {
    const loadAccommodations = async () => {
      try {
        setLoading(true)
        setError(null)

        const searchParams: AccommodationSearchParams = {
          location: searchLocation || undefined,
          checkIn: filters.checkIn || undefined,
          checkOut: filters.checkOut || undefined,
          guests: filters.guests > 0 ? filters.guests : undefined,
          priceRange: filters.priceRange !== 'all' ? filters.priceRange : undefined,
          rating: filters.rating !== 'all' ? filters.rating : undefined,
          type: filters.type !== 'all' ? filters.type : undefined
        }

        const response = await api.accommodations.search(searchParams) as {
          data: Accommodation[]
          pagination?: {
            total: number
            page: number
            totalPages: number
          }
        }

        setAccommodations(response.data || [])
        setTotalResults(response.pagination?.total || response.data?.length || 0)
        setTotalPages(response.pagination?.totalPages || 1)
        setCurrentPage(response.pagination?.page || 1)
      } catch (err) {
        setError(err as Error)
        console.error('Failed to load accommodations:', err)
        setAccommodations([])
      } finally {
        setLoading(false)
      }
    }

    loadAccommodations()
  }, [searchLocation, filters])

  const handleFilterChange = (key: keyof FilterState, value: string | number) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1) // Reset to first page when filters change
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    // Trigger reload by updating filters (search location is already in state)
    setFilters(prev => ({ ...prev }))
  }

  const handleClearFilters = () => {
    setFilters({
      priceRange: 'all',
      rating: 'all',
      type: 'all',
      checkIn: '',
      checkOut: '',
      guests: 1
    })
    setSearchLocation('')
  }

  const getPriceRangeLabel = (accommodation: Accommodation) => {
    const price = accommodation.price.amount
    if (price < 100) return 'Budget'
    if (price < 200) return 'Mid-range'
    return 'Luxury'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-700 text-white py-16">
        <div className="section-container">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Find Your Perfect Stay</h1>
          <p className="text-xl text-primary-100">
            AI-powered accommodation search with personalized recommendations
          </p>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="section-container">
        <div className="card mb-8">
          <form onSubmit={handleSearch} className="space-y-6">
            {/* Location and Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  placeholder="Enter city or destination"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Check-in Date
                </label>
                <input
                  type="date"
                  value={filters.checkIn}
                  onChange={(e) => handleFilterChange('checkIn', e.target.value)}
                  className="input-field"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Check-out Date
                </label>
                <input
                  type="date"
                  value={filters.checkOut}
                  onChange={(e) => handleFilterChange('checkOut', e.target.value)}
                  className="input-field"
                  min={filters.checkIn || new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Guests
                </label>
                <input
                  type="number"
                  value={filters.guests}
                  onChange={(e) => handleFilterChange('guests', parseInt(e.target.value) || 1)}
                  min="1"
                  max="20"
                  className="input-field"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range
                </label>
                <select
                  value={filters.priceRange}
                  onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                  className="input-field"
                >
                  <option value="all">All Prices</option>
                  <option value="budget">Budget (Under $100)</option>
                  <option value="mid">Mid-range ($100-$200)</option>
                  <option value="luxury">Luxury ($200+)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating
                </label>
                <select
                  value={filters.rating}
                  onChange={(e) => handleFilterChange('rating', e.target.value)}
                  className="input-field"
                >
                  <option value="all">All Ratings</option>
                  <option value="4.5">4.5+ Stars</option>
                  <option value="4.0">4.0+ Stars</option>
                  <option value="3.5">3.5+ Stars</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Type
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="input-field"
                >
                  <option value="all">All Types</option>
                  <option value="hotel">Hotel</option>
                  <option value="resort">Resort</option>
                  <option value="apartment">Apartment</option>
                  <option value="cabin">Cabin</option>
                  <option value="hostel">Hostel</option>
                  <option value="villa">Villa</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button type="submit" className="btn-primary flex-1 md:flex-initial">
                Search Accommodations
              </button>
              <button
                type="button"
                onClick={handleClearFilters}
                className="btn-secondary"
              >
                Clear Filters
              </button>
            </div>
          </form>
        </div>

        {/* Results Section */}
        <div>
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
            <h2 className="text-2xl font-bold text-gray-900">
              {searchLocation ? `Accommodations in ${searchLocation}` : 'Available Accommodations'}
            </h2>
            <p className="text-gray-600">
              {loading ? 'Searching...' : `${totalResults} properties found`}
            </p>
          </div>

          {loading ? (
            <Loading text="Searching for accommodations..." />
          ) : error ? (
            <ErrorMessage
              error={error}
              title="Failed to load accommodations"
              onRetry={() => window.location.reload()}
            />
          ) : accommodations.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏨</div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                No accommodations found
              </h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search criteria or filters to find more options
              </p>
              <button
                onClick={handleClearFilters}
                className="btn-primary"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {accommodations.map((accommodation) => (
                  <div
                    key={accommodation.id}
                    className="card hover:scale-[1.02] transition-transform duration-200"
                  >
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Image Placeholder */}
                      <div className="w-full sm:w-40 h-40 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex-shrink-0 overflow-hidden">
                        {accommodation.images && accommodation.images[0] ? (
                          <img
                            src={accommodation.images[0]}
                            alt={accommodation.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-6xl">
                            🏨
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-1">
                              {accommodation.name}
                            </h3>
                            <p className="text-gray-600 text-sm">
                              {accommodation.location.city}, {accommodation.location.country}
                            </p>
                          </div>
                          <div className="flex items-center space-x-1 bg-primary-50 px-3 py-1 rounded-full">
                            <span className="text-primary-600 font-semibold">
                              {accommodation.rating.toFixed(1)}
                            </span>
                            <span className="text-primary-600">★</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full capitalize font-medium">
                            {accommodation.type}
                          </span>
                          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                            {getPriceRangeLabel(accommodation)}
                          </span>
                          {accommodation.amenities.slice(0, 3).map((amenity, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                            >
                              {amenity}
                            </span>
                          ))}
                          {accommodation.amenities.length > 3 && (
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                              +{accommodation.amenities.length - 3} more
                            </span>
                          )}
                        </div>

                        {accommodation.description && (
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {accommodation.description}
                          </p>
                        )}

                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-2xl font-bold text-gray-900">
                              {accommodation.price.currency}{accommodation.price.amount}
                            </span>
                            <span className="text-gray-600 text-sm ml-1">
                              / {accommodation.price.period}
                            </span>
                          </div>
                          <Link
                            to={`/accommodations/${accommodation.id}`}
                            className="btn-primary text-sm"
                          >
                            View Details
                          </Link>
                        </div>

                        {accommodation.reviewCount > 0 && (
                          <div className="mt-2 text-xs text-gray-500">
                            Based on {accommodation.reviewCount} reviews
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center items-center gap-4">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-700 text-white">
        <div className="section-container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Need Help Finding the Perfect Stay?
          </h2>
          <p className="text-xl mb-8 text-primary-100 max-w-2xl mx-auto">
            Our AI-powered recommendations can help you discover accommodations tailored to your preferences
          </p>
          <Link
            to="/premium"
            className="inline-block px-8 py-4 bg-white text-primary-700 rounded-lg font-semibold text-lg hover:bg-gray-100 active:bg-gray-200 transition-colors duration-200"
          >
            Get Premium Recommendations
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Accommodations
