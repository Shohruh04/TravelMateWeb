import { useState, useEffect } from 'react'
import { api } from '../../utils/api'
import { WeatherForecast } from '../../types'

interface FavoriteCity {
  city: string
  country: string
  timestamp: number
}

const WeatherWidget = () => {
  const [city, setCity] = useState<string>('')
  const [weather, setWeather] = useState<WeatherForecast | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [temperatureUnit, setTemperatureUnit] = useState<'C' | 'F'>('C')
  const [favorites, setFavorites] = useState<FavoriteCity[]>([])

  // Load favorites from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('favoriteWeatherCities')
    if (saved) {
      try {
        setFavorites(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to load favorite cities', e)
      }
    }
  }, [])

  const handleSearch = async (searchCity?: string) => {
    const targetCity = searchCity || city
    if (!targetCity.trim()) {
      setError('Please enter a city name')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await api.tools.weather.forecast(targetCity.trim()) as { data: WeatherForecast }
      setWeather(response.data)
      setCity(searchCity || city)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weather data')
      setWeather(null)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const addToFavorites = () => {
    if (!weather) return

    const newFavorite: FavoriteCity = {
      city: weather.city,
      country: weather.country,
      timestamp: Date.now(),
    }

    const updated = [newFavorite, ...favorites.filter(
      f => f.city.toLowerCase() !== weather.city.toLowerCase()
    )].slice(0, 5)

    setFavorites(updated)
    localStorage.setItem('favoriteWeatherCities', JSON.stringify(updated))
  }

  const removeFavorite = (cityName: string) => {
    const updated = favorites.filter(f => f.city !== cityName)
    setFavorites(updated)
    localStorage.setItem('favoriteWeatherCities', JSON.stringify(updated))
  }

  const isFavorite = weather && favorites.some(f => f.city.toLowerCase() === weather.city.toLowerCase())

  const convertTemperature = (temp: number) => {
    if (temperatureUnit === 'F') {
      return Math.round((temp * 9/5) + 32)
    }
    return Math.round(temp)
  }

  const getWeatherIcon = (condition: string) => {
    const icons: { [key: string]: string } = {
      'clear': '☀️',
      'sunny': '☀️',
      'clouds': '☁️',
      'cloudy': '☁️',
      'rain': '🌧️',
      'rainy': '🌧️',
      'drizzle': '🌦️',
      'thunderstorm': '⛈️',
      'snow': '❄️',
      'snowy': '❄️',
      'mist': '🌫️',
      'fog': '🌫️',
      'wind': '💨',
      'windy': '💨',
    }

    const key = Object.keys(icons).find(k => condition.toLowerCase().includes(k))
    return key ? icons[key] : '🌤️'
  }

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center text-2xl">
            ☀️
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Weather Forecast</h2>
            <p className="text-sm text-gray-600">7-day weather predictions</p>
          </div>
        </div>

        {/* Search Input */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter city name (e.g., Paris, Tokyo, New York)"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
          <button
            onClick={() => handleSearch()}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Temperature Unit Toggle */}
        <div className="flex items-center justify-end space-x-2">
          <span className="text-sm text-gray-600">Temperature:</span>
          <button
            onClick={() => setTemperatureUnit('C')}
            className={`px-3 py-1 rounded-lg transition-colors duration-200 ${
              temperatureUnit === 'C'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            °C
          </button>
          <button
            onClick={() => setTemperatureUnit('F')}
            className={`px-3 py-1 rounded-lg transition-colors duration-200 ${
              temperatureUnit === 'F'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            °F
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Current Weather */}
      {weather && !loading && (
        <>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-md p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {weather.city}, {weather.country}
                </h3>
                <p className="text-sm text-gray-600">
                  Last updated: {new Date(weather.current.lastUpdated).toLocaleString()}
                </p>
              </div>
              <button
                onClick={isFavorite ? () => removeFavorite(weather.city) : addToFavorites}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  isFavorite
                    ? 'bg-orange-500 text-white hover:bg-orange-600'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
                title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                {isFavorite ? '★' : '☆'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Current Temperature */}
              <div className="text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start space-x-4">
                  <span className="text-6xl">{getWeatherIcon(weather.current.condition)}</span>
                  <div>
                    <p className="text-5xl font-bold text-gray-900">
                      {convertTemperature(weather.current.temperature)}°{temperatureUnit}
                    </p>
                    <p className="text-lg text-gray-700 capitalize">{weather.current.description}</p>
                  </div>
                </div>
                <p className="text-gray-600 mt-2">
                  Feels like {convertTemperature(weather.current.feelsLike)}°{temperatureUnit}
                </p>
              </div>

              {/* Weather Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-3">
                  <p className="text-xs text-gray-600">Humidity</p>
                  <p className="text-lg font-semibold text-gray-900">{weather.current.humidity}%</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-xs text-gray-600">Wind Speed</p>
                  <p className="text-lg font-semibold text-gray-900">{weather.current.windSpeed} km/h</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-xs text-gray-600">Pressure</p>
                  <p className="text-lg font-semibold text-gray-900">{weather.current.pressure} hPa</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-xs text-gray-600">UV Index</p>
                  <p className="text-lg font-semibold text-gray-900">{weather.current.uvIndex}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 7-Day Forecast */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">7-Day Forecast</h3>
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
              {weather.forecast.map((day, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 text-center hover:shadow-lg transition-shadow duration-200"
                >
                  <p className="font-semibold text-gray-900 mb-2">{day.day}</p>
                  <p className="text-xs text-gray-600 mb-3">
                    {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                  <div className="text-4xl mb-3">{getWeatherIcon(day.condition)}</div>
                  <p className="text-sm text-gray-700 capitalize mb-2">{day.description}</p>
                  <div className="flex justify-center items-center space-x-2">
                    <span className="text-lg font-bold text-gray-900">
                      {convertTemperature(day.high)}°
                    </span>
                    <span className="text-gray-400">|</span>
                    <span className="text-sm text-gray-600">
                      {convertTemperature(day.low)}°
                    </span>
                  </div>
                  <p className="text-xs text-blue-600 mt-2">💧 {day.precipitation}%</p>
                </div>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          {weather.disclaimer && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Disclaimer:</strong> {weather.disclaimer}
              </p>
            </div>
          )}
        </>
      )}

      {/* Favorite Cities */}
      {favorites.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Favorite Destinations</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {favorites.map((favorite, index) => (
              <button
                key={index}
                onClick={() => handleSearch(favorite.city)}
                className="flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-orange-50 border border-gray-200 hover:border-orange-300 rounded-lg transition-all duration-200"
              >
                <span className="font-medium text-gray-900">
                  {favorite.city}, {favorite.country}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFavorite(favorite.city)
                  }}
                  className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                >
                  ✕
                </button>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default WeatherWidget
