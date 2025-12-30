import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../utils/api'
import type { SubscriptionTier } from '../../types'

const Checkout = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { isAuthenticated } = useAuth()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get tier and billing period from URL params
  const tier = searchParams.get('tier') as SubscriptionTier || 'pro'
  const billingPeriod = (searchParams.get('period') as 'monthly' | 'annual') || 'monthly'

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/checkout?tier=${tier}&period=${billingPeriod}` } } })
      return
    }

    // Auto-redirect to Stripe Checkout
    initiateCheckout()
  }, [isAuthenticated])

  const initiateCheckout = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await api.payment.createCheckoutSession(tier, billingPeriod)

      // Redirect to Stripe Checkout
      window.location.href = response.url
    } catch (err) {
      console.error('Failed to create checkout session:', err)
      setError('Failed to initiate checkout. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="card text-center">
          {isLoading ? (
            <>
              <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-6"></div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Redirecting to checkout...
              </h2>
              <p className="text-gray-600">
                Please wait while we prepare your secure payment session.
              </p>
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
                <p className="text-sm text-blue-800 flex items-center justify-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Secured by Stripe
                </p>
              </div>
            </>
          ) : error ? (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Checkout Failed
              </h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <div className="space-y-3">
                <button
                  onClick={initiateCheckout}
                  className="w-full btn-primary"
                >
                  Try Again
                </button>
                <button
                  onClick={() => navigate('/premium')}
                  className="w-full btn-outline"
                >
                  Back to Pricing
                </button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default Checkout
