import { useState, useEffect } from 'react'
import { api } from '../../utils/api'
import { CurrencyConversionResult } from '../../types'

interface RecentConversion {
  from: string
  to: string
  amount: number
  result: number
  timestamp: number
}

const POPULAR_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿' },
]

const CurrencyConverter = () => {
  const [amount, setAmount] = useState<string>('100')
  const [fromCurrency, setFromCurrency] = useState<string>('USD')
  const [toCurrency, setToCurrency] = useState<string>('EUR')
  const [result, setResult] = useState<CurrencyConversionResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recentConversions, setRecentConversions] = useState<RecentConversion[]>([])

  // Load recent conversions from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentConversions')
    if (saved) {
      try {
        setRecentConversions(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to load recent conversions', e)
      }
    }
  }, [])

  // Auto-convert as user types (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (amount && parseFloat(amount) > 0) {
        handleConvert()
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [amount, fromCurrency, toCurrency])

  const handleConvert = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await api.tools.currency.convert(
        fromCurrency,
        toCurrency,
        parseFloat(amount)
      ) as { data: CurrencyConversionResult }

      setResult(response.data)

      // Save to recent conversions
      const newConversion: RecentConversion = {
        from: fromCurrency,
        to: toCurrency,
        amount: parseFloat(amount),
        result: response.data.convertedAmount,
        timestamp: Date.now(),
      }

      const updated = [newConversion, ...recentConversions.filter(
        c => !(c.from === fromCurrency && c.to === toCurrency)
      )].slice(0, 5)

      setRecentConversions(updated)
      localStorage.setItem('recentConversions', JSON.stringify(updated))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to convert currency')
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency)
    setToCurrency(fromCurrency)
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      {/* Main Converter */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-2xl">
            💱
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Currency Converter</h2>
            <p className="text-sm text-gray-600">Real-time exchange rates</p>
          </div>
        </div>

        {/* Amount Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Currency Selection */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-4 mb-6 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From
            </label>
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {POPULAR_CURRENCIES.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.code} - {currency.name}
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <button
            onClick={handleSwapCurrencies}
            className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
            title="Swap currencies"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </button>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To
            </label>
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {POPULAR_CURRENCIES.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.code} - {currency.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Result Display */}
        {loading && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Converting...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {result && !loading && (
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-600 mb-1">Converted Amount:</p>
                <p className="text-4xl font-bold text-blue-600">
                  {result.convertedAmount.toFixed(2)} {result.to}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600 pt-4 border-t border-blue-200">
              <span>
                1 {result.from} = {result.rate.toFixed(4)} {result.to}
              </span>
              <span>
                Updated: {new Date(result.lastUpdated).toLocaleTimeString()}
              </span>
            </div>

            {result.disclaimer && (
              <div className="mt-4 pt-4 border-t border-blue-200">
                <p className="text-xs text-gray-500 italic">{result.disclaimer}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Recent Conversions */}
      {recentConversions.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Conversions</h3>
          <div className="space-y-2">
            {recentConversions.map((conversion, index) => (
              <button
                key={index}
                onClick={() => {
                  setFromCurrency(conversion.from)
                  setToCurrency(conversion.to)
                  setAmount(conversion.amount.toString())
                }}
                className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">
                    {conversion.amount} {conversion.from} → {conversion.result.toFixed(2)} {conversion.to}
                  </span>
                  <span className="text-sm text-gray-500">{formatDate(conversion.timestamp)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          <strong>Disclaimer:</strong> Exchange rates are indicative and may differ from actual rates offered by banks and exchange services. Always verify rates before conducting financial transactions.
        </p>
      </div>
    </div>
  )
}

export default CurrencyConverter
