import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../utils/api'
import type { SubscriptionStatus, PaymentRecord } from '../types'

const Account = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null)
  const [paymentHistory, setPaymentHistory] = useState<PaymentRecord[]>([])
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(true)
  const [isLoadingPayments, setIsLoadingPayments] = useState(true)
  const [isCreatingPortalSession, setIsCreatingPortalSession] = useState(false)

  useEffect(() => {
    loadSubscriptionStatus()
    loadPaymentHistory()
  }, [])

  const loadSubscriptionStatus = async () => {
    try {
      const data = await api.payment.getSubscriptionStatus()
      setSubscriptionStatus(data as SubscriptionStatus)
    } catch (error) {
      console.error('Failed to load subscription status:', error)
    } finally {
      setIsLoadingSubscription(false)
    }
  }

  const loadPaymentHistory = async () => {
    try {
      const data = await api.payment.getPaymentHistory()
      setPaymentHistory(data as PaymentRecord[])
    } catch (error) {
      console.error('Failed to load payment history:', error)
    } finally {
      setIsLoadingPayments(false)
    }
  }

  const handleManageSubscription = async () => {
    setIsCreatingPortalSession(true)
    try {
      const response = await api.payment.createPortalSession()
      // Redirect to Stripe Customer Portal
      window.location.href = response.url
    } catch (error) {
      console.error('Failed to create portal session:', error)
      alert('Failed to open subscription management. Please try again.')
    } finally {
      setIsCreatingPortalSession(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'pro':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'enterprise':
        return 'bg-purple-100 text-purple-700 border-purple-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'trial':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'cancelled':
      case 'expired':
        return 'bg-red-100 text-red-700 border-red-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Settings</h1>
          <p className="text-gray-600">Manage your account and subscription</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card">
              <div className="text-center pb-6 border-b border-gray-200">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-xl font-semibold text-gray-900">{user.name}</h2>
                <p className="text-sm text-gray-600 mt-1">{user.email}</p>
              </div>

              <div className="pt-6">
                <button
                  onClick={handleLogout}
                  className="w-full btn-outline text-red-600 border-red-200 hover:bg-red-50"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Subscription Card */}
            <div className="card">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Subscription</h3>

              {isLoadingSubscription ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto"></div>
                </div>
              ) : subscriptionStatus ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Current Plan</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getTierBadgeColor(subscriptionStatus.tier)}`}>
                      {subscriptionStatus.tier.charAt(0).toUpperCase() + subscriptionStatus.tier.slice(1)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Status</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadgeColor(subscriptionStatus.status)}`}>
                      {subscriptionStatus.status.charAt(0).toUpperCase() + subscriptionStatus.status.slice(1)}
                    </span>
                  </div>

                  {subscriptionStatus.currentPeriodEnd && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">
                        {subscriptionStatus.cancelAtPeriodEnd ? 'Expires' : 'Renews'}
                      </span>
                      <span className="text-gray-900 font-medium">
                        {formatDate(subscriptionStatus.currentPeriodEnd)}
                      </span>
                    </div>
                  )}

                  {subscriptionStatus.cancelAtPeriodEnd && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3">
                      <p className="text-sm text-yellow-800">
                        Your subscription will be cancelled at the end of the current billing period.
                      </p>
                    </div>
                  )}

                  <div className="pt-4 border-t border-gray-200 space-y-3">
                    {subscriptionStatus.tier === 'free' ? (
                      <Link to="/premium" className="block w-full btn-primary text-center">
                        Upgrade to Premium
                      </Link>
                    ) : (
                      <button
                        onClick={handleManageSubscription}
                        disabled={isCreatingPortalSession}
                        className="w-full btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isCreatingPortalSession ? 'Opening...' : 'Manage Subscription'}
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">No subscription information available</p>
                  <Link to="/premium" className="btn-primary inline-block">
                    View Plans
                  </Link>
                </div>
              )}
            </div>

            {/* Payment History Card */}
            <div className="card">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Payment History</h3>

              {isLoadingPayments ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto"></div>
                </div>
              ) : paymentHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                          Invoice
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paymentHistory.map((payment) => (
                        <tr key={payment.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(payment.createdAt)}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900">
                            {payment.description}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            ${payment.amount.toFixed(2)} {payment.currency.toUpperCase()}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              payment.status === 'succeeded'
                                ? 'bg-green-100 text-green-700'
                                : payment.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm">
                            {payment.invoiceUrl ? (
                              <a
                                href={payment.invoiceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary-600 hover:text-primary-700 font-medium"
                              >
                                View
                              </a>
                            ) : (
                              <span className="text-gray-400">N/A</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">No payment history available</p>
                </div>
              )}
            </div>

            {/* Security Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <div>
                  <p className="text-sm text-blue-800 font-medium mb-1">Secured by Stripe</p>
                  <p className="text-sm text-blue-700">
                    All payment information is handled securely by Stripe. We never store your card details.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Account
