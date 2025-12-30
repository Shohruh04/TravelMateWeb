import { createContext, useContext, useState, ReactNode } from 'react'
import { Destination } from '@/types'

interface DestinationContextType {
  selectedDestination: Destination | null
  setSelectedDestination: (destination: Destination | null) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
}

const DestinationContext = createContext<DestinationContextType | undefined>(undefined)

export const useDestination = () => {
  const context = useContext(DestinationContext)
  if (!context) {
    throw new Error('useDestination must be used within a DestinationProvider')
  }
  return context
}

interface DestinationProviderProps {
  children: ReactNode
}

export const DestinationProvider = ({ children }: DestinationProviderProps) => {
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const value: DestinationContextType = {
    selectedDestination,
    setSelectedDestination,
    searchQuery,
    setSearchQuery
  }

  return (
    <DestinationContext.Provider value={value}>
      {children}
    </DestinationContext.Provider>
  )
}

export default DestinationContext
