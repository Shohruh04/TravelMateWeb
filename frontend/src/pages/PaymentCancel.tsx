import { Link, useSearchParams } from 'react-router-dom'

const PaymentCancel = () => {
  const [searchParams] = useSearchParams()
  const tier = searchParams.get('tier') || 'pro'
  const period = searchParams.get('period') || 'monthly'

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="card text-center">
          {/* Cancel Icon */}
          <div className="mb-6">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>

          {/* Cancel Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Payment Cancelled
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Your subscription payment was cancelled. No charges were made.
          </p>

          {/* Information Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-6 py-4 mb-6 text-left">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">
              Why choose TravelMate Premium?
            </h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li className="flex items-start">
                <svg className="w-4 h-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>AI-powered personalized recommendations</span>
              </li>
              <li className="flex items-start">
                <svg className="w-4 h-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Real-time price alerts and notifications</span>
              </li>
              <li className="flex items-start">
                <svg className="w-4 h-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Priority 24/7 customer support</span>
              </li>
              <li className="flex items-start">
                <svg className="w-4 h-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>14-day money-back guarantee</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link
              to={`/checkout?tier=${tier}&period=${period}`}
              className="block w-full btn-primary"
            >
              Try Again
            </Link>
            <Link to="/premium" className="block w-full btn-outline">
              View All Plans
            </Link>
          </div>

          {/* Alternative Options */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-4">
              Still not sure? Explore our free plan features
            </p>
            <Link to="/" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              Continue with Free Plan
            </Link>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Have questions?{' '}
            <a href="mailto:support@travelmate.com" className="text-primary-600 hover:text-primary-700 font-medium">
              Contact Support
            </a>
            {' '}or{' '}
            <Link to="/premium#faq" className="text-primary-600 hover:text-primary-700 font-medium">
              View FAQ
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default PaymentCancel
