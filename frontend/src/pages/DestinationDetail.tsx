import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { api } from '@/utils/api'
import { Destination, Accommodation } from '@/types'
import { useDestination } from '@/context/DestinationContext'
import Loading from '@/components/common/Loading'
import ErrorMessage from '@/components/common/ErrorMessage'

interface DestinationStats {
  totalAccommodations: number
  totalAttractions: number
  averagePrice: number
  currency: string
}

const DestinationDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { selectedDestination, setSelectedDestination } = useDestination()

  const [destination, setDestination] = useState<Destination | null>(selectedDestination)
  const [accommodations, setAccommodations] = useState<Accommodation[]>([])
  const [stats, setStats] = useState<DestinationStats | null>(null)

  const [loadingDestination, setLoadingDestination] = useState(!selectedDestination)
  const [loadingAccommodations, setLoadingAccommodations] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const [filters, setFilters] = useState({
    priceRange: 'all',
    rating: 'all',
    type: 'all'
  })

  // Load destination details if not in context
  useEffect(() => {
    if (!destination && id) {
      const loadDestination = async () => {
        try {
          setLoadingDestination(true)
          setError(null)
          const response = await api.destinations.get(id) as { data: Destination }
          setDestination(response.data)
          setSelectedDestination(response.data)
        } catch (err) {
          setError(err as Error)
          console.error('Failed to load destination:', err)
        } finally {
          setLoadingDestination(false)
        }
      }
      loadDestination()
    }
  }, [id, destination, setSelectedDestination])

  // Load accommodations for this destination
  useEffect(() => {
    if (id) {
      const loadAccommodations = async () => {
        try {
          setLoadingAccommodations(true)
          const filterParams = {
            priceRange: filters.priceRange !== 'all' ? filters.priceRange : undefined,
            rating: filters.rating !== 'all' ? filters.rating : undefined,
            type: filters.type !== 'all' ? filters.type : undefined
          }

          const response = await api.accommodations.getByDestination(id, filterParams) as {
            data: Accommodation[]
            stats?: DestinationStats
          }

          setAccommodations(response.data || [])
          if (response.stats) {
            setStats(response.stats)
          }
        } catch (err) {
          console.error('Failed to load accommodations:', err)
          setAccommodations([])
        } finally {
          setLoadingAccommodations(false)
        }
      }
      loadAccommodations()
    }
  }, [id, filters])

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleViewAllAccommodations = () => {
    navigate('/accommodations', {
      state: { destination: destination?.name }
    })
  }

  if (loadingDestination) {
    return <Loading fullScreen text="Loading destination details..." />
  }

  if (error || !destination) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-2xl w-full px-4">
          <ErrorMessage
            error={error || 'Destination not found'}
            title="Failed to load destination"
            onRetry={() => window.location.reload()}
          />
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className="btn-primary"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        {destination.image && (
          <div className="absolute inset-0 opacity-20">
            <img
              src={destination.image}
              alt={destination.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="relative section-container py-16 lg:py-24">
          <div className="max-w-4xl">
            <div className="flex items-center gap-2 mb-4 text-primary-100">
              <Link to="/" className="hover:text-white transition-colors">
                Home
              </Link>
              <span>/</span>
              <span>Destinations</span>
              <span>/</span>
              <span className="text-white">{destination.name}</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              {destination.name}
            </h1>
            <p className="text-2xl text-primary-100 mb-6">
              {destination.country}
            </p>
            <div className="flex flex-wrap items-center gap-6 mb-6">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <span className="text-yellow-400 text-xl">★</span>
                <span className="font-semibold">{destination.averageRating.toFixed(1)}</span>
                <span className="text-primary-100">Rating</span>
              </div>
              {stats && (
                <>
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                    <span className="font-semibold">{stats.totalAccommodations}</span>
                    <span className="text-primary-100">Accommodations</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                    <span className="font-semibold">
                      {stats.currency}{stats.averagePrice}
                    </span>
                    <span className="text-primary-100">Avg. per night</span>
                  </div>
                </>
              )}
            </div>
            <p className="text-lg text-primary-50 leading-relaxed">
              {destination.description}
            </p>
          </div>
        </div>
      </section>

      {/* Quick Stats Section */}
      {destination.coordinates && (
        <section className="bg-white border-b">
          <div className="section-container py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-primary-600 mb-1">
                  {destination.popularityScore}
                </div>
                <div className="text-gray-600 text-sm">Popularity Score</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary-600 mb-1">
                  {destination.averageRating.toFixed(1)}
                </div>
                <div className="text-gray-600 text-sm">Average Rating</div>
              </div>
              {stats && (
                <>
                  <div>
                    <div className="text-3xl font-bold text-primary-600 mb-1">
                      {stats.totalAccommodations}
                    </div>
                    <div className="text-gray-600 text-sm">Places to Stay</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-primary-600 mb-1">
                      {stats.totalAttractions || 0}
                    </div>
                    <div className="text-gray-600 text-sm">Attractions</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Accommodations Section */}
      <section className="section-container">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Where to Stay
            </h2>
            <p className="text-gray-600">
              Find the perfect accommodation for your visit
            </p>
          </div>
          <button
            onClick={handleViewAllAccommodations}
            className="btn-primary md:w-auto"
          >
            View All Accommodations
          </button>
        </div>

        {/* Filters */}
        <div className="card mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Results</h3>
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
                <option value="villa">Villa</option>
              </select>
            </div>
          </div>
        </div>

        {/* Accommodations List */}
        {loadingAccommodations ? (
          <Loading text="Loading accommodations..." />
        ) : accommodations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-4">
              No accommodations found matching your criteria.
            </p>
            <button
              onClick={() => setFilters({ priceRange: 'all', rating: 'all', type: 'all' })}
              className="btn-secondary"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {accommodations.slice(0, 6).map((accommodation) => (
              <div
                key={accommodation.id}
                className="card hover:scale-[1.02] transition-transform duration-200"
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Image */}
                  <div className="w-full sm:w-32 h-32 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {accommodation.images && accommodation.images[0] ? (
                      <img
                        src={accommodation.images[0]}
                        alt={accommodation.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-4xl">🏨</span>
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
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full capitalize">
                        {accommodation.type}
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
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {accommodations.length > 6 && (
          <div className="mt-8 text-center">
            <button
              onClick={handleViewAllAccommodations}
              className="btn-secondary"
            >
              View All {accommodations.length} Accommodations
            </button>
          </div>
        )}
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="section-container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Explore {destination.name}?
          </h2>
          <p className="text-xl mb-8 text-primary-100 max-w-2xl mx-auto">
            Book your accommodation and start planning your perfect trip today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleViewAllAccommodations}
              className="px-8 py-4 bg-white text-primary-700 rounded-lg font-semibold text-lg hover:bg-gray-100 active:bg-gray-200 transition-colors duration-200"
            >
              Find Accommodations
            </button>
            <Link
              to="/flights"
              className="px-8 py-4 bg-secondary-500 text-white rounded-lg font-semibold text-lg hover:bg-secondary-600 active:bg-secondary-700 transition-colors duration-200"
            >
              Book Flights
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default DestinationDetail
