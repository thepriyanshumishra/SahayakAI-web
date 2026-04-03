import React from 'react'
import { Navigate } from 'react-router-dom'
import useAuthStore from '../../store/useAuthStore.js'
import LoadingScreen from '../common/LoadingScreen.jsx'

/**
 * ProtectedRoute — enforces the route guard logic from PRD §5
 *
 * Route guard table:
 * - Not logged in → /
 * - Logged in, no role → /role-select
 * - Has role, not onboarded → /onboarding
 * - NGO pending → /ngo/pending
 * - NGO rejected → /ngo/pending (with appeal)
 * - Volunteer, not phone verified → dashboard (with banners)
 * - Verified volunteer / approved NGO → children
 *
 * Props:
 * - requiredRole: 'volunteer' | 'ngo' | 'admin' | null (any authed user)
 * - requireVerified: bool (NGO must be approved)
 */
function ProtectedRoute({ children, requiredRole = null, requireVerified = false }) {
  const { user, profile, loading } = useAuthStore()

  if (loading) return <LoadingScreen />

  // Not logged in
  if (!user) return <Navigate to="/" replace />

  // No role selected yet
  if (!profile?.role) return <Navigate to="/role-select" replace />

  // Not onboarded
  if (!profile?.onboardingCompleted) return <Navigate to="/onboarding" replace />

  // Role mismatch
  if (requiredRole && profile.role !== requiredRole) {
    const dashboardMap = { volunteer: '/volunteer', ngo: '/ngo', admin: '/admin' }
    return <Navigate to={dashboardMap[profile.role] || '/'} replace />
  }

  // NGO specific gates
  if (profile.role === 'ngo') {
    if (profile.verificationStatus === 'pending' || profile.verificationStatus === 'rejected') {
      if (window.location.pathname !== '/ngo/pending') {
        return <Navigate to="/ngo/pending" replace />
      }
    }
  }

  // requireVerified for NGO
  if (requireVerified && profile.role === 'ngo' && profile.verificationStatus !== 'approved') {
    return <Navigate to="/ngo/pending" replace />
  }

  return children
}

export default ProtectedRoute
