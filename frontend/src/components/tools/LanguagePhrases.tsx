import { useState, useEffect } from 'react'
import { api } from '../../utils/api'
import { LanguagePhrasesResponse, TravelPhrase, PhraseCategory } from '../../types'

const LANGUAGES = [
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'th', name: 'Thai', flag: '🇹🇭' },
]

const CATEGORY_LABELS: { [key in PhraseCategory]: { label: string; icon: string } } = {
  greetings: { label: 'Greetings & Basics', icon: '👋' },
  directions: { label: 'Directions & Navigation', icon: '🧭' },
  emergencies: { label: 'Emergencies', icon: '🚨' },
  dining: { label: 'Dining & Food', icon: '🍽️' },
  shopping: { label: 'Shopping', icon: '🛍️' },
  accommodation: { label: 'Accommodation', icon: '🏨' },
  transportation: { label: 'Transportation', icon: '🚗' },
  numbers: { label: 'Numbers', icon: '🔢' },
  common: { label: 'Common Phrases', icon: '💬' },
}

const LanguagePhrases = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('es')
  const [phrasesData, setPhrasesData] = useState<LanguagePhrasesResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [expandedCategories, setExpandedCategories] = useState<Set<PhraseCategory>>(new Set(['greetings']))
  const [bookmarkedPhrases, setBookmarkedPhrases] = useState<Set<string>>(new Set())

  // Load bookmarks from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('bookmarkedPhrases')
    if (saved) {
      try {
        setBookmarkedPhrases(new Set(JSON.parse(saved)))
      } catch (e) {
        console.error('Failed to load bookmarked phrases', e)
      }
    }
  }, [])

  // Fetch phrases when language changes
  useEffect(() => {
    fetchPhrases()
  }, [selectedLanguage])

  const fetchPhrases = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await api.tools.language.phrases(selectedLanguage) as { data: LanguagePhrasesResponse }
      setPhrasesData(response.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch phrases')
      setPhrasesData(null)
    } finally {
      setLoading(false)
    }
  }

  const toggleCategory = (category: PhraseCategory) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
  }

  const toggleBookmark = (phraseId: string) => {
    const newBookmarks = new Set(bookmarkedPhrases)
    if (newBookmarks.has(phraseId)) {
      newBookmarks.delete(phraseId)
    } else {
      newBookmarks.add(phraseId)
    }
    setBookmarkedPhrases(newBookmarks)
    localStorage.setItem('bookmarkedPhrases', JSON.stringify(Array.from(newBookmarks)))
  }

  const filterPhrases = (phrases: TravelPhrase[]) => {
    if (!searchQuery.trim()) return phrases

    const query = searchQuery.toLowerCase()
    return phrases.filter(
      phrase =>
        phrase.english.toLowerCase().includes(query) ||
        phrase.translated.toLowerCase().includes(query) ||
        phrase.pronunciation.toLowerCase().includes(query)
    )
  }

  const groupPhrasesByCategory = () => {
    if (!phrasesData) return {}

    const grouped: { [key in PhraseCategory]?: TravelPhrase[] } = {}

    phrasesData.phrases.forEach(phrase => {
      if (!grouped[phrase.category]) {
        grouped[phrase.category] = []
      }
      grouped[phrase.category]!.push(phrase)
    })

    return grouped
  }

  const playAudio = (audioUrl?: string) => {
    if (audioUrl) {
      const audio = new Audio(audioUrl)
      audio.play().catch(err => console.error('Failed to play audio', err))
    }
  }

  const groupedPhrases = groupPhrasesByCategory()
  const filteredGrouped: { [key: string]: TravelPhrase[] } = {}

  Object.entries(groupedPhrases).forEach(([category, phrases]) => {
    const filtered = filterPhrases(phrases)
    if (filtered.length > 0) {
      filteredGrouped[category] = filtered
    }
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center text-2xl">
            🗣️
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Travel Phrases</h2>
            <p className="text-sm text-gray-600">Essential phrases for your destination</p>
          </div>
        </div>

        {/* Language Selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Language
          </label>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.name}
              </option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search phrases..."
            className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading phrases...</p>
        </div>
      )}

      {/* Phrases List */}
      {!loading && phrasesData && (
        <div className="space-y-4">
          {Object.entries(filteredGrouped).map(([category, phrases]) => {
            const categoryKey = category as PhraseCategory
            const categoryInfo = CATEGORY_LABELS[categoryKey]
            const isExpanded = expandedCategories.has(categoryKey)

            return (
              <div key={category} className="bg-white rounded-xl shadow-md overflow-hidden">
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(categoryKey)}
                  className="w-full px-6 py-4 bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 transition-colors duration-200 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{categoryInfo.icon}</span>
                    <div className="text-left">
                      <h3 className="text-lg font-semibold text-gray-900">{categoryInfo.label}</h3>
                      <p className="text-sm text-gray-600">{phrases.length} phrases</p>
                    </div>
                  </div>
                  <svg
                    className={`w-6 h-6 text-gray-600 transition-transform duration-200 ${
                      isExpanded ? 'transform rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Phrases List */}
                {isExpanded && (
                  <div className="divide-y divide-gray-100">
                    {phrases.map((phrase) => (
                      <div
                        key={phrase.id}
                        className="px-6 py-4 hover:bg-gray-50 transition-colors duration-200"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-2">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">English</p>
                                <p className="text-gray-900 font-medium">{phrase.english}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                                  {phrasesData.languageName}
                                </p>
                                <p className="text-purple-600 font-semibold text-lg">{phrase.translated}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Pronunciation</p>
                                <p className="text-gray-700 italic">{phrase.pronunciation}</p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 ml-4">
                            {/* Audio Button */}
                            {phrase.audioUrl && (
                              <button
                                onClick={() => playAudio(phrase.audioUrl)}
                                className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors duration-200"
                                title="Play pronunciation"
                              >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" />
                                </svg>
                              </button>
                            )}

                            {/* Bookmark Button */}
                            <button
                              onClick={() => toggleBookmark(phrase.id)}
                              className={`p-2 rounded-lg transition-colors duration-200 ${
                                bookmarkedPhrases.has(phrase.id)
                                  ? 'text-purple-600 bg-purple-50'
                                  : 'text-gray-400 hover:text-purple-600 hover:bg-purple-50'
                              }`}
                              title={bookmarkedPhrases.has(phrase.id) ? 'Remove bookmark' : 'Bookmark phrase'}
                            >
                              {bookmarkedPhrases.has(phrase.id) ? '★' : '☆'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* No Results */}
      {!loading && phrasesData && Object.keys(filteredGrouped).length === 0 && (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <p className="text-gray-600">No phrases found matching your search.</p>
        </div>
      )}

      {/* Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          <strong>Tip:</strong> Practice these phrases before your trip. Local people appreciate the effort, even if your pronunciation isn't perfect!
        </p>
      </div>
    </div>
  )
}

export default LanguagePhrases
