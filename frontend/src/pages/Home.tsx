import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '@/utils/api'
import { Destination } from '@/types'
import { useDestination } from '@/context/DestinationContext'
import Loading from '@/components/common/Loading'
import ErrorMessage from '@/components/common/ErrorMessage'

const Home = () => {
  const navigate = useNavigate()
  const { setSelectedDestination, setSearchQuery: setGlobalSearchQuery } = useDestination()

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Destination[]>([])
  const [showAutocomplete, setShowAutocomplete] = useState(false)
  const [isSearching, setIsSearching] = useState(false)

  const [popularDestinations, setPopularDestinations] = useState<Destination[]>([])
  const [loadingPopular, setLoadingPopular] = useState(true)
  const [popularError, setPopularError] = useState<Error | null>(null)

  const searchRef = useRef<HTMLDivElement>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout>()

  const features = [
    {
      icon: '🏨',
      title: 'Smart Accommodations',
      description: 'Find the perfect place to stay with AI-powered recommendations tailored to your preferences and budget.',
      link: '/accommodations'
    },
    {
      icon: '✈️',
      title: 'Flight Estimates',
      description: 'Get accurate flight price predictions and discover the best times to book your next journey.',
      link: '/flights'
    },
    {
      icon: '🗺️',
      title: 'Tourist Tools',
      description: 'Access essential travel tools including currency converters, weather forecasts, and local guides.',
      link: '/tourist-tools'
    },
    {
      icon: '⭐',
      title: 'Premium Features',
      description: 'Unlock advanced AI insights, personalized itineraries, and exclusive travel recommendations.',
      link: '/premium'
    }
  ]

  // Load popular destinations on mount
  useEffect(() => {
    const loadPopularDestinations = async () => {
      try {
        setLoadingPopular(true)
        setPopularError(null)
        const response = await api.destinations.popular() as { data: Destination[] }
        setPopularDestinations(response.data || [])
      } catch (err) {
        setPopularError(err as Error)
        console.error('Failed to load popular destinations:', err)
      } finally {
        setLoadingPopular(false)
      }
    }

    loadPopularDestinations()
  }, [])

  // Handle search input with debounce
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([])
      setShowAutocomplete(false)
      return
    }

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    // Set new timeout for search
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        setIsSearching(true)
        const response = await api.destinations.search(searchQuery) as { data: Destination[] }
        setSearchResults(response.data || [])
        setShowAutocomplete(true)
      } catch (err) {
        console.error('Search failed:', err)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery])

  // Close autocomplete when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowAutocomplete(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setGlobalSearchQuery(searchQuery)
      navigate('/accommodations')
    }
  }

  const handleDestinationSelect = (destination: Destination) => {
    setSelectedDestination(destination)
    setSearchQuery('')
    setShowAutocomplete(false)
    navigate(`/destinations/${destination.id}`)
  }

  const handlePopularDestinationClick = (destination: Destination) => {
    setSelectedDestination(destination)
    navigate(`/destinations/${destination.id}`)
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white">
        <div className="section-container py-20 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-balance">
              Your AI-Powered Travel Companion
            </h1>
            <p className="text-xl md:text-2xl mb-10 text-primary-100 text-balance">
              Discover destinations, find accommodations, and plan your perfect journey with intelligent recommendations
            </p>

            {/* Search Bar with Autocomplete */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="relative" ref={searchRef}>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => searchResults.length > 0 && setShowAutocomplete(true)}
                      placeholder="Where do you want to go?"
                      className="w-full px-6 py-4 rounded-lg text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-4 focus:ring-primary-300"
                    />
                    {isSearching && (
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <div className="w-5 h-5 border-2 border-gray-300 border-t-primary-600 rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="px-8 py-4 bg-secondary-500 text-white rounded-lg font-semibold hover:bg-secondary-600 active:bg-secondary-700 transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-secondary-300"
                  >
                    Search
                  </button>
                </div>

                {/* Autocomplete Dropdown */}
                {showAutocomplete && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 sm:right-auto sm:w-full mt-2 bg-white rounded-lg shadow-xl max-h-96 overflow-y-auto z-50">
                    {searchResults.map((destination) => (
                      <button
                        key={destination.id}
                        type="button"
                        onClick={() => handleDestinationSelect(destination)}
                        className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors duration-150 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <h4 className="text-gray-900 font-semibold">
                              {destination.name}
                            </h4>
                            <p className="text-gray-600 text-sm">
                              {destination.country}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <span className="text-yellow-500">★</span>
                            <span>{destination.averageRating.toFixed(1)}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Travel Smart
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Powered by advanced AI to make your travel planning effortless and enjoyable
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Link
              key={index}
              to={feature.link}
              className="card group hover:scale-105 transition-transform duration-200"
            >
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors duration-200">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular Destinations Section */}
      <section className="bg-gray-100">
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Popular Destinations
            </h2>
            <p className="text-lg text-gray-600">
              Explore the world's most amazing places
            </p>
          </div>

          {loadingPopular ? (
            <Loading text="Loading popular destinations..." />
          ) : popularError ? (
            <ErrorMessage
              error={popularError}
              title="Failed to load popular destinations"
              onRetry={() => window.location.reload()}
            />
          ) : popularDestinations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No popular destinations available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularDestinations.map((destination) => (
                <button
                  key={destination.id}
                  onClick={() => handlePopularDestinationClick(destination)}
                  className="card group cursor-pointer hover:scale-105 transition-transform duration-200 text-left"
                >
                  {destination.image && (
                    <div className="w-full h-48 mb-4 rounded-lg overflow-hidden bg-gray-200">
                      <img
                        src={destination.image}
                        alt={destination.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors duration-200">
                        {destination.name}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {destination.country}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 bg-primary-50 px-3 py-1 rounded-full">
                      <span className="text-yellow-500 text-sm">★</span>
                      <span className="text-primary-600 font-semibold text-sm">
                        {destination.averageRating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-600 line-clamp-2">
                    {destination.description}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-secondary-600 to-secondary-700 text-white">
        <div className="section-container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl mb-8 text-secondary-100 max-w-2xl mx-auto text-balance">
            Join thousands of travelers who trust TravelMate for their adventures
          </p>
          <Link
            to="/premium"
            className="inline-block px-8 py-4 bg-white text-secondary-700 rounded-lg font-semibold text-lg hover:bg-gray-100 active:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-white/50"
          >
            Get Started Now
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Home
