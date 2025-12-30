import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams()
  const { refreshUser } = useAuth()

  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    // Refresh user data to get updated subscription status
    refreshUser()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="card text-center">
          {/* Success Animation */}
          <div className="mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Payment Successful!
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Thank you for subscribing to TravelMate Premium
          </p>

          {/* Confirmation Details */}
          <div className="bg-gray-50 rounded-lg px-6 py-4 mb-6 text-left">
            <div className="space-y-3">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-900">Premium access activated</p>
                  <p className="text-sm text-gray-600">You now have access to all premium features</p>
                </div>
              </div>

              <div className="flex items-start">
                <svg className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-900">Confirmation email sent</p>
                  <p className="text-sm text-gray-600">Check your inbox for receipt and details</p>
                </div>
              </div>

              <div className="flex items-start">
                <svg className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-900">Secure payment processed</p>
                  <p className="text-sm text-gray-600">Your payment was processed securely by Stripe</p>
                </div>
              </div>
            </div>
          </div>

          {sessionId && (
            <div className="mb-6 text-xs text-gray-500">
              <p>Session ID: {sessionId.substring(0, 20)}...</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link to="/" className="block w-full btn-primary">
              Continue to Dashboard
            </Link>
            <Link to="/account" className="block w-full btn-outline">
              View Account Settings
            </Link>
          </div>

          {/* What's Next */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">What's next?</h3>
            <div className="text-sm text-gray-600 space-y-2 text-left">
              <p className="flex items-start">
                <span className="text-primary-600 mr-2">1.</span>
                <span>Explore AI-powered travel recommendations</span>
              </p>
              <p className="flex items-start">
                <span className="text-primary-600 mr-2">2.</span>
                <span>Set up price alerts for your favorite destinations</span>
              </p>
              <p className="flex items-start">
                <span className="text-primary-600 mr-2">3.</span>
                <span>Generate personalized itineraries with our AI assistant</span>
              </p>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Need help?{' '}
            <a href="mailto:support@travelmate.com" className="text-primary-600 hover:text-primary-700 font-medium">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default PaymentSuccess
