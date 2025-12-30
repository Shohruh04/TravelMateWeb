import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../utils/api'
import type { PricingTier, SubscriptionStatus } from '../types'

const Premium = () => {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()

  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly')
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>([])
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCreatingPortalSession, setIsCreatingPortalSession] = useState(false)

  // Default pricing if API fails or not yet loaded
  const defaultPlans: PricingTier[] = [
    {
      id: 'free',
      name: 'Free',
      tier: 'free',
      description: 'Perfect for occasional travelers',
      monthlyPrice: 0,
      annualPrice: 0,
      currency: 'USD',
      features: [
        'Basic destination search',
        'Standard accommodation listings',
        'Flight price estimates',
        'Currency converter',
        'Weather forecasts',
        'Community support'
      ],
      highlighted: false,
      popular: false,
    },
    {
      id: 'pro',
      name: 'Pro',
      tier: 'pro',
      description: 'Ideal for frequent travelers',
      monthlyPrice: 9.99,
      annualPrice: 99.99,
      currency: 'USD',
      features: [
        'Everything in Free, plus:',
        'AI-powered recommendations',
        'Personalized itineraries',
        'Price drop alerts',
        'Advanced filtering options',
        'Priority customer support',
        'Offline access',
        'Ad-free experience'
      ],
      highlighted: true,
      popular: true,
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      tier: 'enterprise',
      description: 'For travel agencies and businesses',
      monthlyPrice: 49.99,
      annualPrice: 499.99,
      currency: 'USD',
      features: [
        'Everything in Pro, plus:',
        'Multi-user accounts',
        'Custom integrations',
        'API access',
        'Dedicated account manager',
        'Advanced analytics',
        'White-label options',
        'SLA guarantee',
        'Custom training'
      ],
      highlighted: false,
      popular: false,
    }
  ]

  useEffect(() => {
    loadPricingData()
    if (isAuthenticated) {
      loadSubscriptionStatus()
    }
  }, [isAuthenticated])

  const loadPricingData = async () => {
    try {
      const data = await api.payment.getPricing()
      setPricingTiers(data as PricingTier[])
    } catch (error) {
      // Use default pricing if API fails
      setPricingTiers(defaultPlans)
    } finally {
      setIsLoading(false)
    }
  }

  const loadSubscriptionStatus = async () => {
    try {
      const data = await api.payment.getSubscriptionStatus()
      setSubscriptionStatus(data as SubscriptionStatus)
    } catch (error) {
      console.error('Failed to load subscription status:', error)
    }
  }

  const handleSelectPlan = (tier: string) => {
    if (tier === 'free') {
      return // Free plan doesn't require checkout
    }

    if (tier === 'enterprise') {
      // Contact sales for enterprise
      window.location.href = 'mailto:sales@travelmate.com?subject=Enterprise Plan Inquiry'
      return
    }

    // Redirect to checkout
    navigate(`/checkout?tier=${tier}&period=${billingPeriod}`)
  }

  const handleManageSubscription = async () => {
    setIsCreatingPortalSession(true)
    try {
      const response = await api.payment.createPortalSession()
      window.location.href = response.url
    } catch (error) {
      console.error('Failed to create portal session:', error)
      alert('Failed to open subscription management. Please try again.')
    } finally {
      setIsCreatingPortalSession(false)
    }
  }

  const getButtonText = (plan: PricingTier) => {
    if (!isAuthenticated) {
      return plan.tier === 'free' ? 'Current Plan' : plan.tier === 'enterprise' ? 'Contact Sales' : 'Start Free Trial'
    }

    if (subscriptionStatus?.tier === plan.tier) {
      return 'Current Plan'
    }

    if (plan.tier === 'free') {
      return 'Downgrade'
    }

    if (plan.tier === 'enterprise') {
      return 'Contact Sales'
    }

    const tierHierarchy = { free: 0, pro: 1, enterprise: 2 }
    const currentTierLevel = tierHierarchy[subscriptionStatus?.tier || 'free']
    const planTierLevel = tierHierarchy[plan.tier]

    return currentTierLevel < planTierLevel ? 'Upgrade' : 'Switch Plan'
  }

  const getPrice = (plan: PricingTier) => {
    return billingPeriod === 'monthly' ? plan.monthlyPrice : plan.annualPrice
  }

  const getSavingsPercentage = (plan: PricingTier) => {
    if (plan.monthlyPrice === 0) return 0
    const monthlyTotal = plan.monthlyPrice * 12
    const savings = ((monthlyTotal - plan.annualPrice) / monthlyTotal) * 100
    return Math.round(savings)
  }

  const plans = pricingTiers.length > 0 ? pricingTiers : defaultPlans

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Digital Nomad',
      avatar: '👩‍💼',
      comment: 'TravelMate Pro has transformed how I plan my trips. The AI recommendations are incredibly accurate!',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'Travel Blogger',
      avatar: '👨‍💻',
      comment: 'The price alerts alone have saved me thousands of dollars. Absolutely worth every penny.',
      rating: 5
    },
    {
      name: 'Emma Williams',
      role: 'Business Traveler',
      avatar: '👩‍✈️',
      comment: 'As someone who travels frequently for work, the personalized itineraries are a game-changer.',
      rating: 5
    }
  ]

  const premiumFeatures = [
    {
      icon: '🤖',
      title: 'AI-Powered Insights',
      description: 'Get personalized recommendations based on your preferences, budget, and travel history.'
    },
    {
      icon: '📊',
      title: 'Advanced Analytics',
      description: 'Track price trends, analyze travel patterns, and make data-driven decisions.'
    },
    {
      icon: '🔔',
      title: 'Smart Alerts',
      description: 'Receive notifications about price drops, special deals, and travel advisories.'
    },
    {
      icon: '🗺️',
      title: 'Custom Itineraries',
      description: 'AI-generated travel plans tailored to your interests and schedule.'
    },
    {
      icon: '💎',
      title: 'Exclusive Deals',
      description: 'Access to premium-only discounts and partner offers.'
    },
    {
      icon: '🎯',
      title: 'Priority Support',
      description: '24/7 dedicated support team to assist with any travel needs.'
    }
  ]

  const faqs = [
    {
      question: 'Can I cancel my subscription anytime?',
      answer: 'Yes, you can cancel your subscription at any time. Your premium access will continue until the end of your current billing period.'
    },
    {
      question: 'Is there a free trial?',
      answer: 'Yes! All premium plans come with a 14-day free trial. No credit card required to start.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, debit cards, and digital payment methods through our secure payment processor, Stripe.'
    },
    {
      question: 'Can I switch between plans?',
      answer: 'Absolutely! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we\'ll prorate your billing.'
    },
    {
      question: 'Do you offer refunds?',
      answer: 'Yes, we offer a 14-day money-back guarantee. If you\'re not satisfied with your premium subscription, contact us for a full refund.'
    },
    {
      question: 'Is my payment information secure?',
      answer: 'Yes, all payments are processed securely through Stripe. We never store your payment information on our servers.'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-20">
        <div className="section-container text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-balance">
            Unlock Premium Travel Intelligence
          </h1>
          <p className="text-xl md:text-2xl text-primary-100 max-w-3xl mx-auto text-balance">
            Take your travel planning to the next level with AI-powered insights and exclusive features
          </p>

          {isAuthenticated && subscriptionStatus && subscriptionStatus.tier !== 'free' && (
            <div className="mt-8 inline-block bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3">
              <p className="text-sm text-primary-100">
                Current Plan: <span className="font-semibold text-white">{subscriptionStatus.tier.charAt(0).toUpperCase() + subscriptionStatus.tier.slice(1)}</span>
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Billing Period Toggle */}
      <section className="section-container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            Start with a 14-day free trial. No credit card required.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-6 py-2 rounded-md font-medium transition-all duration-200 ${
                billingPeriod === 'monthly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('annual')}
              className={`px-6 py-2 rounded-md font-medium transition-all duration-200 relative ${
                billingPeriod === 'annual'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Annual
              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                Save 17%
              </span>
            </button>
          </div>
        </div>

        {/* Manage Subscription Button */}
        {isAuthenticated && subscriptionStatus && subscriptionStatus.tier !== 'free' && (
          <div className="text-center mb-8">
            <button
              onClick={handleManageSubscription}
              disabled={isCreatingPortalSession}
              className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreatingPortalSession ? 'Opening...' : 'Manage Subscription'}
            </button>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan) => {
            const price = getPrice(plan)
            const savings = getSavingsPercentage(plan)
            const isCurrentPlan = subscriptionStatus?.tier === plan.tier

            return (
              <div
                key={plan.id}
                className={`card relative ${
                  plan.highlighted
                    ? 'ring-2 ring-primary-600 shadow-xl scale-105'
                    : ''
                } ${isCurrentPlan ? 'ring-2 ring-green-500' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-secondary-500 to-secondary-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}

                {isCurrentPlan && (
                  <div className="absolute -top-4 right-4">
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Current
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center">
                    <span className="text-5xl font-bold text-gray-900">
                      ${price}
                    </span>
                    <span className="text-gray-600 ml-2">
                      / {plan.tier === 'free' ? 'forever' : billingPeriod === 'monthly' ? 'month' : 'year'}
                    </span>
                  </div>
                  {billingPeriod === 'annual' && savings > 0 && (
                    <p className="text-sm text-green-600 font-medium mt-2">
                      Save {savings}% vs monthly billing
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li
                      key={featureIndex}
                      className={`flex items-start space-x-3 ${
                        feature.startsWith('Everything') ? 'font-semibold text-gray-900' : ''
                      }`}
                    >
                      <span className="text-primary-600 mt-1 flex-shrink-0">
                        {feature.startsWith('Everything') ? '⭐' : '✓'}
                      </span>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSelectPlan(plan.tier)}
                  disabled={isCurrentPlan}
                  className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 ${
                    isCurrentPlan
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : plan.highlighted
                      ? 'btn-primary'
                      : 'btn-outline'
                  }`}
                >
                  {getButtonText(plan)}
                </button>
              </div>
            )
          })}
        </div>
      </section>

      {/* Premium Features */}
      <section className="bg-gray-100">
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Premium Features
            </h2>
            <p className="text-lg text-gray-600">
              Powerful tools to enhance your travel experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {premiumFeatures.map((feature, index) => (
              <div key={index} className="card bg-white">
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Loved by Travelers Worldwide
          </h2>
          <p className="text-lg text-gray-600">
            Join thousands of satisfied premium members
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="card">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-3xl">
                  {testimonial.avatar}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>

              <div className="flex space-x-1 mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-xl">★</span>
                ))}
              </div>

              <p className="text-gray-700 italic">"{testimonial.comment}"</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-gray-100" id="faq">
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600">
              Everything you need to know about our premium plans
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <details key={index} className="card group">
                <summary className="cursor-pointer font-semibold text-gray-900 flex items-center justify-between">
                  {faq.question}
                  <span className="text-primary-600 group-open:rotate-180 transition-transform duration-200">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </summary>
                <p className="mt-4 text-gray-600">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-secondary-600 to-secondary-700 text-white">
        <div className="section-container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
            Ready to Travel Smarter?
          </h2>
          <p className="text-xl mb-8 text-secondary-100 max-w-2xl mx-auto text-balance">
            Start your 14-day free trial today. No credit card required.
          </p>
          <button
            onClick={() => handleSelectPlan('pro')}
            className="inline-block px-8 py-4 bg-white text-secondary-700 rounded-lg font-semibold text-lg hover:bg-gray-100 active:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-white/50"
          >
            Start Free Trial
          </button>
          <p className="text-sm text-secondary-200 mt-4">
            Cancel anytime. No questions asked.
          </p>

          {/* Security Badge */}
          <div className="mt-8 flex items-center justify-center space-x-2 text-secondary-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="text-sm">Secured by Stripe - We never store your card details</span>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Premium
