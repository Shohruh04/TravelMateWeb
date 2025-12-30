import { useState, useEffect, useRef } from 'react'
import { api } from '@/utils/api'
import { Airport } from '@/types'

interface AirportAutocompleteProps {
  value: string
  onChange: (value: string, airport?: Airport) => void
  placeholder?: string
  label?: string
  required?: boolean
  className?: string
}

const AirportAutocomplete = ({
  value,
  onChange,
  placeholder = 'Search airports...',
  label,
  required = false,
  className = ''
}: AirportAutocompleteProps) => {
  const [query, setQuery] = useState(value)
  const [airports, setAirports] = useState<Airport[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout>()

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Debounced airport search
  useEffect(() => {
    if (query.length < 2) {
      setAirports([])
      setIsOpen(false)
      return
    }

    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Set new timer for debounced search
    debounceTimerRef.current = setTimeout(async () => {
      setIsLoading(true)
      try {
        const response = await api.flights.searchAirports(query) as { airports: Airport[] }
        setAirports(response.airports || [])
        setIsOpen(true)
        setSelectedIndex(-1)
      } catch (error) {
        console.error('Error searching airports:', error)
        setAirports([])
      } finally {
        setIsLoading(false)
      }
    }, 300)

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [query])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setQuery(newValue)
    onChange(newValue)
  }

  const handleSelectAirport = (airport: Airport) => {
    const displayValue = `${airport.city} (${airport.code})`
    setQuery(displayValue)
    onChange(airport.code, airport)
    setIsOpen(false)
    setAirports([])
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || airports.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev =>
          prev < airports.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && airports[selectedIndex]) {
          handleSelectAirport(airports[selectedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        break
    }
  }

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (airports.length > 0) setIsOpen(true)
          }}
          placeholder={placeholder}
          required={required}
          className="input-field w-full pr-10"
          autoComplete="off"
        />

        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          </div>
        )}

        {!isLoading && query && (
          <button
            type="button"
            onClick={() => {
              setQuery('')
              onChange('')
              setAirports([])
              setIsOpen(false)
              inputRef.current?.focus()
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {isOpen && airports.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
          {airports.map((airport, index) => (
            <button
              key={`${airport.code}-${index}`}
              type="button"
              onClick={() => handleSelectAirport(airport)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`w-full text-left px-4 py-3 hover:bg-primary-50 transition-colors duration-150 border-b border-gray-100 last:border-b-0 ${
                index === selectedIndex ? 'bg-primary-50' : ''
              }`}
            >
              <div className="font-medium text-gray-900">
                {airport.city} ({airport.code})
              </div>
              <div className="text-sm text-gray-600">
                {airport.name} - {airport.country}
              </div>
            </button>
          ))}
        </div>
      )}

      {isOpen && !isLoading && query.length >= 2 && airports.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-center text-gray-500">
          No airports found for "{query}"
        </div>
      )}
    </div>
  )
}

export default AirportAutocomplete
