import { useState, useEffect } from 'react'
import { api } from '../../utils/api'
import { VisaRequirement } from '../../types'

const COUNTRIES = [
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬' },
  { code: 'TR', name: 'Turkey', flag: '🇹🇷' },
  { code: 'RU', name: 'Russia', flag: '🇷🇺' },
].sort((a, b) => a.name.localeCompare(b.name))

interface SavedQuery {
  nationality: string
  destination: string
  timestamp: number
}

const VisaRequirements = () => {
  const [nationality, setNationality] = useState<string>('US')
  const [destination, setDestination] = useState<string>('FR')
  const [requirement, setRequirement] = useState<VisaRequirement | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>([])

  // Load saved queries from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('visaQueries')
    if (saved) {
      try {
        setSavedQueries(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to load saved visa queries', e)
      }
    }

    // Load last used values
    const lastNationality = localStorage.getItem('lastVisaNationality')
    const lastDestination = localStorage.getItem('lastVisaDestination')
    if (lastNationality) setNationality(lastNationality)
    if (lastDestination) setDestination(lastDestination)
  }, [])

  const handleCheck = async () => {
    if (nationality === destination) {
      setError('Please select different countries for nationality and destination')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await api.tools.visa.check(nationality, destination) as { data: VisaRequirement }
      setRequirement(response.data)

      // Save query to history
      const newQuery: SavedQuery = {
        nationality,
        destination,
        timestamp: Date.now(),
      }

      const updated = [newQuery, ...savedQueries.filter(
        q => !(q.nationality === nationality && q.destination === destination)
      )].slice(0, 5)

      setSavedQueries(updated)
      localStorage.setItem('visaQueries', JSON.stringify(updated))

      // Save last used values
      localStorage.setItem('lastVisaNationality', nationality)
      localStorage.setItem('lastVisaDestination', destination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check visa requirements')
      setRequirement(null)
    } finally {
      setLoading(false)
    }
  }

  const loadSavedQuery = (query: SavedQuery) => {
    setNationality(query.nationality)
    setDestination(query.destination)
    setRequirement(null)
  }

  const getVisaTypeColor = (visaType: string) => {
    switch (visaType) {
      case 'none':
      case 'visa-free':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'visa-on-arrival':
      case 'e-visa':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'visa-required':
        return 'bg-red-100 text-red-800 border-red-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getVisaTypeLabel = (visaType: string) => {
    switch (visaType) {
      case 'none':
      case 'visa-free':
        return 'No Visa Required'
      case 'visa-on-arrival':
        return 'Visa on Arrival'
      case 'e-visa':
        return 'E-Visa Required'
      case 'visa-required':
        return 'Visa Required'
      default:
        return visaType
    }
  }

  const getVisaTypeIcon = (visaType: string) => {
    switch (visaType) {
      case 'none':
      case 'visa-free':
        return '✅'
      case 'visa-on-arrival':
      case 'e-visa':
        return '⚠️'
      case 'visa-required':
        return '🚫'
      default:
        return '📋'
    }
  }

  const getNationalityLabel = (code: string) => {
    const country = COUNTRIES.find(c => c.code === code)
    return country ? `${country.flag} ${country.name}` : code
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center text-2xl">
            📋
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Visa Requirements</h2>
            <p className="text-sm text-gray-600">Check entry requirements for your destination</p>
          </div>
        </div>

        {/* Country Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Nationality
            </label>
            <select
              value={nationality}
              onChange={(e) => setNationality(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {COUNTRIES.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.flag} {country.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Destination Country
            </label>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {COUNTRIES.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.flag} {country.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Check Button */}
        <button
          onClick={handleCheck}
          disabled={loading || nationality === destination}
          className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Checking Requirements...' : 'Check Visa Requirements'}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Requirements Display */}
      {requirement && !loading && (
        <div className="space-y-6">
          {/* Visa Status Card */}
          <div className={`rounded-xl shadow-md p-6 border-2 ${getVisaTypeColor(requirement.visaType)}`}>
            <div className="flex items-center space-x-4 mb-4">
              <span className="text-5xl">{getVisaTypeIcon(requirement.visaType)}</span>
              <div>
                <h3 className="text-2xl font-bold">
                  {getVisaTypeLabel(requirement.visaType)}
                </h3>
                <p className="text-sm mt-1">
                  For {getNationalityLabel(requirement.nationality)} citizens traveling to{' '}
                  {getNationalityLabel(requirement.destination)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="bg-white bg-opacity-50 rounded-lg p-4">
                <p className="text-sm font-medium mb-1">Maximum Stay</p>
                <p className="text-lg font-semibold">{requirement.maxStayDuration}</p>
              </div>
              <div className="bg-white bg-opacity-50 rounded-lg p-4">
                <p className="text-sm font-medium mb-1">Passport Validity</p>
                <p className="text-lg font-semibold">{requirement.passportValidityRequired}</p>
              </div>
              {requirement.processingTime && (
                <div className="bg-white bg-opacity-50 rounded-lg p-4">
                  <p className="text-sm font-medium mb-1">Processing Time</p>
                  <p className="text-lg font-semibold">{requirement.processingTime}</p>
                </div>
              )}
              {requirement.fees && (
                <div className="bg-white bg-opacity-50 rounded-lg p-4">
                  <p className="text-sm font-medium mb-1">Fees</p>
                  <p className="text-lg font-semibold">{requirement.fees}</p>
                </div>
              )}
            </div>
          </div>

          {/* Entry Requirements */}
          {requirement.entryRequirements.length > 0 && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">📄</span>
                Entry Requirements
              </h3>
              <ul className="space-y-2">
                {requirement.entryRequirements.map((req, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <span className="text-green-600 mt-1">✓</span>
                    <span className="text-gray-700">{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Health Requirements */}
          {requirement.healthRequirements.length > 0 && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">💉</span>
                Health Requirements
              </h3>
              <ul className="space-y-2">
                {requirement.healthRequirements.map((req, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <span className="text-blue-600 mt-1">⚕️</span>
                    <span className="text-gray-700">{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Customs Info */}
          {requirement.customsInfo.length > 0 && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">🛃</span>
                Customs Information
              </h3>
              <ul className="space-y-2">
                {requirement.customsInfo.map((info, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <span className="text-orange-600 mt-1">•</span>
                    <span className="text-gray-700">{info}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Travel Advisories */}
          {requirement.travelAdvisories.length > 0 && (
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-yellow-900 mb-4 flex items-center">
                <span className="mr-2">⚠️</span>
                Travel Advisories
              </h3>
              <ul className="space-y-2">
                {requirement.travelAdvisories.map((advisory, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <span className="text-yellow-700 mt-1">!</span>
                    <span className="text-yellow-800">{advisory}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Last Updated & Disclaimer */}
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
            <h4 className="font-bold text-red-900 mb-2">Important Disclaimer</h4>
            <p className="text-sm text-red-800 mb-4">{requirement.disclaimer}</p>
            <p className="text-xs text-red-700">
              Last updated: {new Date(requirement.lastUpdated).toLocaleDateString()}
            </p>
          </div>
        </div>
      )}

      {/* Recent Queries */}
      {savedQueries.length > 0 && !requirement && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Checks</h3>
          <div className="space-y-2">
            {savedQueries.map((query, index) => (
              <button
                key={index}
                onClick={() => loadSavedQuery(query)}
                className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-green-50 border border-gray-200 hover:border-green-300 rounded-lg transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">
                    {getNationalityLabel(query.nationality)} → {getNationalityLabel(query.destination)}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(query.timestamp).toLocaleDateString()}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default VisaRequirements
