import React, { createContext, useContext, useState, useEffect, Component } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { supabase } from './lib/supabase'
import AppLayout from './components/layout/AppLayout'
import LandingPage from './components/LandingPage'
import LoginPage from './components/auth/LoginPage'
import RegisterPage from './components/auth/RegisterPage'
import ForgotPasswordPage from './components/auth/ForgotPasswordPage'
import ResetPasswordPage from './components/auth/ResetPasswordPage'
import { ConfirmEmail } from './routes/ConfirmEmail'
import { AuthCallback } from './routes/AuthCallback'
import { EmailNotConfirmed } from './routes/EmailNotConfirmed'
import PublicBookingPage from './components/booking/PublicBookingPage'

// ErrorBoundary Component
class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-6">
          <h2 className="text-xl font-semibold">Something went wrong.</h2>
          <button
            onClick={() => { this.setState({ hasError: false }); window.location.reload() }}
            className="mt-4 px-3 py-2 rounded bg-red-600 text-white"
          >
            Try again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
import CleanFeedDashboard from './components/CleanFeedDashboard'
import { SocialFeed } from './components/feed'
import DiscoveryPage from './components/discovery/DiscoveryPage'
import MessagesPage from './components/messages/MessagesPage'
import NotificationsPage from './components/notifications/NotificationsPage'
import CreatePage from './components/create/CreatePage'
import PortfolioStudioPage from './components/create/PortfolioStudioPage'
import BookingsPage from './components/bookings/BookingsPage'
import SettingsPage from './components/settings/SettingsPage'
import ReportPage from './components/report/ReportPage'
import AdminDashboard from './components/admin/AdminDashboard'
import StudioPage from './components/studio/FunctionalStudioPage'
import EnhancedOnboarding from './components/onboarding/EnhancedOnboarding'
import ProfilePage from './components/profile/ProfilePage'
import PublicProfileView from './components/profile/PublicProfileView'
import ProjectsPage from './components/projects/ProjectsPage'
import GuidedOnboarding from './components/onboarding/GuidedOnboarding'
import JobFeedPage from './components/jobs/JobFeedPage'
import CreateJobPage from './components/jobs/CreateJobPage'
import MyApplicationsPage from './components/jobs/MyApplicationsPage'
import JobApplicantsPage from './components/jobs/JobApplicantsPage'
import JobDetailPage from './components/jobs/JobDetailPage'
import MyJobsPage from './components/jobs/MyJobsPage'
import CalendarPage from './components/calendar/CalendarPage'
import VenuePortfolio from './components/venue/VenuePortfolio'
import { BadgeRulesPage } from './components/profile/badges'
import TestAccountsPage from './components/dev/TestAccountsPage'
// Help Center Pages
import HelpCenterPage from './components/help/HelpCenterPage'
import GettingStartedPage from './components/help/GettingStartedPage'
import SubscriptionsGuidePage from './components/help/SubscriptionsGuidePage'
import PostingJobsGuidePage from './components/help/PostingJobsGuidePage'
import MessagingGuidePage from './components/help/MessagingGuidePage'
import ProfileSetupGuidePage from './components/help/ProfileSetupGuidePage'
import { LiveRegionManager, initFocusVisible, createSkipLink } from './utils/accessibility'
import useKeyboardShortcuts from './hooks/useKeyboardShortcuts'
import KeyboardShortcutsModal from './components/ui/KeyboardShortcutsModal'
import './styles/accessibility.css'
import './App.css'

// Auth Context
const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Auth Provider Component
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [needsOnboarding, setNeedsOnboarding] = useState(false)

  // Check authentication status on app load
  useEffect(() => {
    checkAuth()

    // Listen for auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null)
        setLoading(false)
      } else if (session?.user) {
        loadUserProfile(session.user.id)
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadUserProfile = async (userId) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        // Real error (not just "not found")
        throw error
      }

      if (profile) {
        setUser({
          id: userId,
          ...profile,
          onboarding_completed: profile.onboarding_completed ?? false
        })
        setNeedsOnboarding(!profile.onboarding_completed)
      } else {
        // User exists in auth but no profile yet - needs onboarding
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (authUser) {
          setUser({
            id: userId,
            email: authUser.email,
            onboarding_completed: false
          })
          setNeedsOnboarding(true)
        }
      }
      setLoading(false)
    } catch (error) {
      // Silent fail - don't expose errors to console in production
      setUser(null)
      setLoading(false)
    }
  }

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        await loadUserProfile(session.user.id)
      } else {
        setLoading(false)
      }
    } catch (error) {
      // Silent fail - don't expose auth errors
      setLoading(false)
    }
  }

  const login = async (credentials) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      })

      if (error) throw error

      await loadUserProfile(data.user.id)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const register = async (userData) => {
    try {
      // This is handled in RegisterPage.jsx now
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const completeOnboarding = async (onboardingData) => {
    try {
      // Ensure we have a user ID
      if (!user?.id) {
        // Try to get user from session
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.user?.id) {
          return { success: false, error: 'No authenticated user found. Please log in again.' }
        }
        // Use session user ID
        const userId = session.user.id

        const { error } = await supabase
          .from('profiles')
          .update({
            ...onboardingData,
            onboarding_completed: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId)

        if (error) throw error

        // Update local user state
        setUser({
          id: userId,
          email: session.user.email,
          ...onboardingData,
          onboarding_completed: true
        })
      } else {
        // Update profile in database
        const { error } = await supabase
          .from('profiles')
          .update({
            ...onboardingData,
            onboarding_completed: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)

        if (error) throw error

        // Update local user state
        const updatedUser = {
          ...user,
          ...onboardingData,
          onboarding_completed: true
        }
        setUser(updatedUser)
      }

      setNeedsOnboarding(false)
      return { success: true }
    } catch (error) {
      console.error('Onboarding error:', error)
      return { success: false, error: 'Failed to complete onboarding. Please try again.' }
    }
  }

  const logout = async () => {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      // Silent fail - user will be logged out regardless
    } finally {
      setUser(null)
      setNeedsOnboarding(false)
    }
  }

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    checkAuth,
    needsOnboarding,
    completeOnboarding
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Protected Route Component - SECURE (no bypass)
const ProtectedRoute = ({ children }) => {
  const { user, loading, needsOnboarding } = useAuth()

  // Show loading spinner while checking auth status
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // If user needs onboarding, redirect to onboarding
  if (needsOnboarding || (!user.onboarding_completed && user.onboarding_completed !== undefined)) {
    return <Navigate to="/onboarding" replace />
  }

  return children
}

// Onboarding Wrapper Component
const OnboardingWrapper = () => {
  const { completeOnboarding } = useAuth()
  const navigate = useNavigate()

  const handleComplete = async (data) => {
    const result = await completeOnboarding(data)
    if (result.success) {
      navigate('/dashboard')
    } else {
      // Throw error so GuidedOnboarding can catch and display it
      throw new Error(result.error || 'Failed to complete onboarding')
    }
  }

  return (
    <GuidedOnboarding onComplete={handleComplete} />
  )
}

// Public Route Component (redirect to dashboard if logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return user ? <Navigate to="/dashboard" /> : children
}

// Inner app component that uses router hooks
function AppRoutes() {
  const [showShortcutsModal, setShowShortcutsModal] = useState(false)

  // Keyboard shortcuts - now inside Router context
  useKeyboardShortcuts({
    onShowHelp: () => setShowShortcutsModal(true),
    onFocusSearch: () => {
      // Try to find and focus search input
      const searchInput = document.querySelector('input[type="search"], input[placeholder*="Search"]')
      if (searchInput) {
        searchInput.focus()
      }
    }
  })

  return (
    <>
      <Routes>
        {/* Public Routes - No Layout */}
          <Route path="/" element={
            <PublicRoute>
              <LandingPage />
            </PublicRoute>
          } />
          <Route path="/login" element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          } />
          <Route path="/forgot-password" element={
            <PublicRoute>
              <ForgotPasswordPage />
            </PublicRoute>
          } />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Email Confirmation Routes */}
          <Route path="/confirm-email" element={<ConfirmEmail />} />
          <Route path="/email-not-confirmed" element={<EmailNotConfirmed />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Onboarding Route */}
          <Route path="/onboarding" element={<OnboardingWrapper />} />

          {/* Public Booking Page (SEO-optimized, vanity URL) */}
          <Route path="/book/:username" element={<PublicBookingPage />} />

          {/* Test Accounts Page (Development only) */}
          <Route path="/test-accounts" element={<TestAccountsPage />} />

          {/* Protected Routes - With AppLayout */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <AppLayout>
                <SocialFeed />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/discover" element={
            <ProtectedRoute>
              <AppLayout>
                <DiscoveryPage />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/messages" element={
            <ErrorBoundary>
              <ProtectedRoute>
                <AppLayout>
                  <MessagesPage />
                </AppLayout>
              </ProtectedRoute>
            </ErrorBoundary>
          } />
          <Route path="/notifications" element={
            <ProtectedRoute>
              <AppLayout>
                <NotificationsPage />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/create" element={
            <ProtectedRoute>
              <AppLayout>
                <CreatePage />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/create/portfolio" element={
            <ProtectedRoute>
              <AppLayout>
                <PortfolioStudioPage />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/bookings" element={
            <ProtectedRoute>
              <AppLayout>
                <BookingsPage />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/calendar" element={
            <ProtectedRoute>
              <AppLayout>
                <CalendarPage />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/venue" element={
            <ProtectedRoute>
              <AppLayout>
                <VenuePortfolio />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/jobs" element={
            <ProtectedRoute>
              <AppLayout>
                <JobFeedPage />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/jobs/create" element={
            <ProtectedRoute>
              <CreateJobPage />
            </ProtectedRoute>
          } />
          <Route path="/jobs/my-applications" element={
            <ProtectedRoute>
              <AppLayout>
                <MyApplicationsPage />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/jobs/my-jobs" element={
            <ProtectedRoute>
              <AppLayout>
                <MyJobsPage />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/jobs/:jobId/applicants" element={
            <ProtectedRoute>
              <AppLayout>
                <JobApplicantsPage />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/jobs/:jobId" element={
            <ProtectedRoute>
              <AppLayout>
                <JobDetailPage />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/profile/:userId" element={
            <ProtectedRoute>
              <AppLayout>
                <PublicProfileView />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <AppLayout>
                <ProfilePage />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/studio" element={
            <ProtectedRoute>
              <AppLayout>
                <StudioPage />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/projects" element={
            <ProtectedRoute>
              <AppLayout>
                <ProjectsPage />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <AppLayout>
                <SettingsPage />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/report" element={
            <ProtectedRoute>
              <AppLayout>
                <ReportPage />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute>
              <AppLayout>
                <AdminDashboard />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/badges" element={
            <ProtectedRoute>
              <AppLayout>
                <BadgeRulesPage />
              </AppLayout>
            </ProtectedRoute>
          } />

          {/* Help Center Routes */}
          <Route path="/help" element={
            <AppLayout>
              <HelpCenterPage />
            </AppLayout>
          } />
          <Route path="/help/getting-started" element={
            <AppLayout>
              <GettingStartedPage />
            </AppLayout>
          } />
          <Route path="/help/subscriptions" element={
            <AppLayout>
              <SubscriptionsGuidePage />
            </AppLayout>
          } />
          <Route path="/help/posting-jobs" element={
            <AppLayout>
              <PostingJobsGuidePage />
            </AppLayout>
          } />
          <Route path="/help/messaging" element={
            <AppLayout>
              <MessagingGuidePage />
            </AppLayout>
          } />
          <Route path="/help/profile-setup" element={
            <AppLayout>
              <ProfileSetupGuidePage />
            </AppLayout>
          } />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>

      {/* Global Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={showShortcutsModal}
        onClose={() => setShowShortcutsModal(false)}
      />
    </>
  )
}

function App() {
  // Initialize accessibility features
  useEffect(() => {
    // Initialize focus-visible polyfill
    initFocusVisible()

    // Create and add skip link
    const skipLink = createSkipLink()
    document.body.insertBefore(skipLink, document.body.firstChild)

    // Initialize live region manager
    const liveRegionManager = new LiveRegionManager()
    window.liveRegionManager = liveRegionManager

    // Set page language
    document.documentElement.lang = 'en'

    // Add main content landmark
    const mainContent = document.createElement('main')
    mainContent.id = 'main-content'
    mainContent.setAttribute('role', 'main')

    return () => {
      // Cleanup
      if (window.liveRegionManager) {
        delete window.liveRegionManager
      }
    }
  }, [])

  return (
    <HelmetProvider>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </HelmetProvider>
  )
}

export default App
