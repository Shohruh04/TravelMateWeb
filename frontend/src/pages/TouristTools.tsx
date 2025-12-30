import { useState } from 'react'
import CurrencyConverter from '../components/tools/CurrencyConverter'
import WeatherWidget from '../components/tools/WeatherWidget'
import LanguagePhrases from '../components/tools/LanguagePhrases'
import VisaRequirements from '../components/tools/VisaRequirements'

type ToolType = 'currency' | 'weather' | 'language' | 'visa'

interface Tool {
  id: ToolType
  icon: string
  title: string
  description: string
  color: string
  component: React.ComponentType
}

const TOOLS: Tool[] = [
  {
    id: 'currency',
    icon: '💱',
    title: 'Currency Converter',
    description: 'Real-time exchange rates for 150+ currencies',
    color: 'from-blue-500 to-blue-600',
    component: CurrencyConverter,
  },
  {
    id: 'weather',
    icon: '☀️',
    title: 'Weather Forecast',
    description: '7-day weather predictions for your destination',
    color: 'from-orange-500 to-orange-600',
    component: WeatherWidget,
  },
  {
    id: 'language',
    icon: '🗣️',
    title: 'Travel Phrases',
    description: 'Essential phrases in multiple languages',
    color: 'from-purple-500 to-purple-600',
    component: LanguagePhrases,
  },
  {
    id: 'visa',
    icon: '📋',
    title: 'Visa Requirements',
    description: 'Check entry requirements for any destination',
    color: 'from-green-500 to-green-600',
    component: VisaRequirements,
  },
]

const TouristTools = () => {
  const [activeTool, setActiveTool] = useState<ToolType | null>(null)

  const ActiveComponent = activeTool ? TOOLS.find(t => t.id === activeTool)?.component : null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-700 text-white py-16">
        <div className="section-container">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Tourist Tools</h1>
          <p className="text-xl text-primary-100 max-w-3xl">
            Essential utilities to make your travel experience smooth and enjoyable.
            From currency conversion to visa requirements, we've got you covered.
          </p>
        </div>
      </section>

      {/* Tools Navigation */}
      <section className="section-container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {TOOLS.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setActiveTool(activeTool === tool.id ? null : tool.id)}
              className={`card group cursor-pointer hover:scale-105 transition-all duration-200 text-left ${
                activeTool === tool.id
                  ? 'ring-4 ring-primary-500 shadow-xl'
                  : 'hover:shadow-xl'
              }`}
            >
              <div
                className={`w-16 h-16 bg-gradient-to-br ${tool.color} rounded-xl flex items-center justify-center text-4xl mb-4 group-hover:scale-110 transition-transform duration-200`}
              >
                {tool.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors duration-200">
                {tool.title}
              </h3>
              <p className="text-gray-600">{tool.description}</p>

              {activeTool === tool.id && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <span className="text-primary-600 font-medium flex items-center">
                    Active
                    <svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Active Tool Display */}
        {activeTool && ActiveComponent ? (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-900 flex items-center">
                <span className="text-4xl mr-3">
                  {TOOLS.find(t => t.id === activeTool)?.icon}
                </span>
                {TOOLS.find(t => t.id === activeTool)?.title}
              </h2>
              <button
                onClick={() => setActiveTool(null)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors duration-200 flex items-center space-x-2"
              >
                <span>Close</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <ActiveComponent />
          </div>
        ) : (
          /* Welcome Message */
          <div className="card bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200 text-center py-12">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Select a Tool to Get Started
              </h2>
              <p className="text-lg text-gray-700 mb-6">
                Choose from the tools above to access currency conversion, weather forecasts,
                travel phrases, or visa requirements for your destination.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
                  <span className="text-2xl mr-2">💡</span>
                  <span className="text-sm text-gray-700">Click any tool card above</span>
                </div>
                <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
                  <span className="text-2xl mr-2">📱</span>
                  <span className="text-sm text-gray-700">Mobile-friendly interface</span>
                </div>
                <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
                  <span className="text-2xl mr-2">⚡</span>
                  <span className="text-sm text-gray-700">Real-time data</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Travel Tips */}
        <div className="mt-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Quick Travel Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: '📄',
                title: 'Travel Documents',
                tips: [
                  'Check passport expiry (6 months validity)',
                  'Apply for visa well in advance',
                  'Keep digital copies of documents',
                ],
              },
              {
                icon: '🏥',
                title: 'Health & Safety',
                tips: [
                  'Get required vaccinations',
                  'Purchase travel insurance',
                  'Register with embassy',
                ],
              },
              {
                icon: '💰',
                title: 'Money Matters',
                tips: [
                  'Notify bank of travel plans',
                  'Carry multiple payment methods',
                  'Keep emergency cash',
                ],
              },
              {
                icon: '🎒',
                title: 'Packing Tips',
                tips: [
                  'Check weather forecast',
                  'Pack light and smart',
                  'Keep essentials in carry-on',
                ],
              },
            ].map((category, index) => (
              <div key={index} className="card hover:shadow-lg transition-shadow duration-200">
                <div className="text-4xl mb-3">{category.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{category.title}</h3>
                <ul className="space-y-2">
                  {category.tips.map((tip, tipIndex) => (
                    <li key={tipIndex} className="flex items-start space-x-2">
                      <span className="text-primary-600 mt-1 flex-shrink-0">✓</span>
                      <span className="text-gray-700 text-sm">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Resources */}
        <div className="mt-12 card bg-gradient-to-br from-secondary-50 to-secondary-100 border-secondary-200">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Need Personalized Travel Advice?</h2>
            <p className="text-gray-700 mb-6">
              Our AI assistant can help you with personalized travel recommendations,
              real-time updates, and answers to your specific travel questions.
            </p>
            <button className="btn-primary inline-flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <span>Chat with AI Assistant</span>
            </button>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card text-center hover:shadow-lg transition-shadow duration-200">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
              🌍
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Global Coverage</h3>
            <p className="text-gray-600 text-sm">
              Access information for destinations worldwide with up-to-date data
            </p>
          </div>

          <div className="card text-center hover:shadow-lg transition-shadow duration-200">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
              ⚡
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-Time Updates</h3>
            <p className="text-gray-600 text-sm">
              Get current exchange rates, weather conditions, and travel advisories
            </p>
          </div>

          <div className="card text-center hover:shadow-lg transition-shadow duration-200">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
              📱
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Mobile Friendly</h3>
            <p className="text-gray-600 text-sm">
              Access all tools on the go with our responsive mobile interface
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default TouristTools
