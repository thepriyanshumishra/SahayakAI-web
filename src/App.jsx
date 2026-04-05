import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import useAuth from './hooks/useAuth.js'
import useAuthStore from './store/useAuthStore.js'
import { subscribeToNotifications } from './services/notificationService.js'
import useNotificationStore from './store/useNotificationStore.js'

import { HelmetProvider } from 'react-helmet-async'
import { ErrorBoundary } from 'react-error-boundary'
import ErrorFallback from './components/common/GlobalErrorBoundary.jsx'

// Layout
import Navbar from './components/common/Navbar.jsx'
import Sidebar from './components/common/Sidebar.jsx'
import OfflineBanner from './components/common/OfflineBanner.jsx'
import LoadingScreen from './components/common/LoadingScreen.jsx'
import ProtectedRoute from './components/auth/ProtectedRoute.jsx'

// Pages — Public (Lazy loaded)
const LandingPage = React.lazy(() => import('./pages/LandingPage.jsx'))
const UnifiedSignup = React.lazy(() => import('./pages/auth/UnifiedSignup.jsx'))
const FeaturesPage = React.lazy(() => import('./pages/public/FeaturesPage.jsx'))
const AboutPage = React.lazy(() => import('./pages/public/AboutPage.jsx'))
const DocsPage = React.lazy(() => import('./pages/public/DocsPage.jsx'))
const LegalPage = React.lazy(() => import('./pages/public/LegalPage.jsx'))
const ContactPage = React.lazy(() => import('./pages/public/ContactPage.jsx'))

// Pages — Volunteer (Lazy loaded)
const VolunteerDashboard = React.lazy(() => import('./pages/volunteer/VolunteerDashboard.jsx'))
const ActiveTaskPage = React.lazy(() => import('./pages/volunteer/ActiveTaskPage.jsx'))
const TaskFeedPage = React.lazy(() => import('./pages/volunteer/TaskFeedPage.jsx'))
const ProfilePage = React.lazy(() => import('./pages/volunteer/ProfilePage.jsx'))

// Pages — NGO (Lazy loaded)
const NGODashboard = React.lazy(() => import('./pages/ngo/NGODashboard.jsx'))
const NGOPendingPage = React.lazy(() => import('./pages/ngo/NGOPendingPage.jsx'))
const CreateTaskPage = React.lazy(() => import('./pages/ngo/CreateTaskPage.jsx'))
const NGOTaskManagementPage = React.lazy(() => import('./pages/ngo/NGOTaskManagementPage.jsx'))

// Pages — Admin (Lazy loaded)
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard.jsx'))
const NGOReviewPage  = React.lazy(() => import('./pages/admin/NGOReviewPage.jsx'))
const FullMapPage    = React.lazy(() => import('./pages/tracking/FullMapPage.jsx'))

/**
 * AppShell — sidebar + navbar layout for authenticated pages
 */
function AppShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  return (
    <div className="page-layout">
      <Sidebar 
        open={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        onToggle={() => setSidebarOpen(v => !v)}
      />
      <div className={`main-content ${sidebarOpen ? 'desktop-collapsed' : ''}`}>
        <Navbar onMenuToggle={() => setSidebarOpen((v) => !v)} />
        {children}
      </div>
    </div>
  )
}

/**
 * Smart redirect to the correct dashboard based on role
 */
function DashboardRedirect() {
  const { profile, loading, user } = useAuthStore()
  if (loading) return <LoadingScreen />
  
  if (!user) return <Navigate to="/" replace />
  if (!profile || !profile.role || !profile.onboardingCompleted) {
    return <Navigate to="/signup" replace />
  }
  
  if (profile.role === 'volunteer') return <Navigate to="/volunteer" replace />
  if (profile.role === 'ngo') {
    return profile.verificationStatus === 'approved'
      ? <Navigate to="/ngo" replace />
      : <Navigate to="/ngo/pending" replace />
  }
  if (profile.role === 'admin') return <Navigate to="/admin" replace />
  return <Navigate to="/" replace />
}

function App() {
  useAuth() // Bootstrap Firebase auth listener

  const { user, profile, loading } = useAuthStore()
  const { setNotifications } = useNotificationStore()

  // Real-time notifications
  useEffect(() => {
    if (!user?.uid) return
    const unsub = subscribeToNotifications(user.uid, setNotifications)
    return unsub
  }, [user?.uid, setNotifications])

  if (loading) return <LoadingScreen />

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => window.location.reload()}>
      <HelmetProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <OfflineBanner />
          <React.Suspense fallback={<LoadingScreen />}>
            <Routes>
              {/* ── Public ────────────────────────────────────── */}
              <Route path="/" element={
                user?.uid ? <Navigate to="/dashboard" replace /> : <LandingPage />
              } />
              <Route path="/features" element={<FeaturesPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/docs" element={<DocsPage />} />
              <Route path="/legal" element={<LegalPage />} />
              <Route path="/contact" element={<ContactPage />} />

              {/* ── Auth flow ─────────────────────────────────── */}
              <Route path="/signup" element={
                user?.uid && profile?.onboardingCompleted ? <Navigate to="/dashboard" replace /> : <UnifiedSignup />
              } />

              {/* ── NGO pending (fullscreen, no shell) ────────── */}
              <Route path="/ngo/pending" element={
                <ProtectedRoute requiredRole="ngo"><NGOPendingPage /></ProtectedRoute>
              } />

              {/* ── Smart redirect ────────────────────────────── */}
              <Route path="/dashboard" element={<DashboardRedirect />} />

              {/* ── Volunteer ─────────────────────────────────── */}
              <Route path="/volunteer" element={
                <ProtectedRoute requiredRole="volunteer">
                  <AppShell><VolunteerDashboard /></AppShell>
                </ProtectedRoute>
              } />
              <Route path="/volunteer/tasks" element={
                <ProtectedRoute requiredRole="volunteer">
                  <AppShell><TaskFeedPage /></AppShell>
                </ProtectedRoute>
              } />
              <Route path="/volunteer/active" element={
                <ProtectedRoute requiredRole="volunteer">
                  <AppShell><ActiveTaskPage /></AppShell>
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <AppShell><ProfilePage /></AppShell>
                </ProtectedRoute>
              } />

              {/* ── NGO ───────────────────────────────────────── */}
              <Route path="/ngo" element={
                <ProtectedRoute requiredRole="ngo" requireVerified>
                  <AppShell><NGODashboard /></AppShell>
                </ProtectedRoute>
              } />
              <Route path="/ngo/create-task" element={
                <ProtectedRoute requiredRole="ngo" requireVerified>
                  <AppShell><CreateTaskPage /></AppShell>
                </ProtectedRoute>
              } />
              <Route path="/ngo/tasks" element={
                <ProtectedRoute requiredRole="ngo" requireVerified>
                  <AppShell><NGOTaskManagementPage /></AppShell>
                </ProtectedRoute>
              } />

              {/* ── Full Map (both roles) ─────────────────────── */}
              <Route path="/map" element={
                <ProtectedRoute>
                  <FullMapPage />
                </ProtectedRoute>
              } />

              {/* ── Admin ─────────────────────────────────────── */}
              <Route path="/admin" element={
                <ProtectedRoute requiredRole="admin">
                  <AppShell><AdminDashboard /></AppShell>
                </ProtectedRoute>
              } />
              <Route path="/admin/ngo-review" element={
                <ProtectedRoute requiredRole="admin">
                  <AppShell><NGOReviewPage /></AppShell>
                </ProtectedRoute>
              } />

              {/* ── 404 fallback ──────────────────────────────── */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </React.Suspense>
        </BrowserRouter>
      </HelmetProvider>
    </ErrorBoundary>
  )
}

export default App
