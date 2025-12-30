import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { SubscriptionTier } from '../types'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
  requiredTier?: SubscriptionTier
}

const ProtectedRoute = ({
  children,
  requireAuth = true,
  requiredTier,
}: ProtectedRouteProps) => {
  const { isAuthenticated, user, isLoading } = useAuth()
  const location = useLocation()

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect to login if authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check subscription tier if required
  if (requiredTier && user) {
    const tierHierarchy: Record<SubscriptionTier, number> = {
      free: 0,
      pro: 1,
      enterprise: 2,
    }

    const userTierLevel = tierHierarchy[user.subscriptionTier] || 0
    const requiredTierLevel = tierHierarchy[requiredTier] || 0

    if (userTierLevel < requiredTierLevel) {
      return <Navigate to="/premium" replace />
    }
  }

  return <>{children}</>
}

export default ProtectedRoute
