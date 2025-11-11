import React, { createContext, useContext, useState, useEffect, Component } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import AppLayout from './components/layout/AppLayout'
import LandingPage from './components/LandingPage'
import LoginPage from './components/auth/LoginPage'
import RegisterPage from './components/auth/RegisterPage'

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
import DiscoveryPage from './components/discovery/DiscoveryPage'
import MessagesPage from './components/messages/MessagesPage'
import NotificationsPage from './components/notifications/NotificationsPage'
import CreatePage from './components/create/CreatePage'
import BookingsPage from './components/bookings/BookingsPage'
import SettingsPage from './components/settings/SettingsPage'
import ReportPage from './components/report/ReportPage'
import AdminDashboard from './components/admin/AdminDashboard'
import FunctionalStudioPage from './components/studio/FunctionalStudioPage'
import EnhancedOnboarding from './components/onboarding/EnhancedOnboarding'
import ProfilePage from './components/profile/ProfilePage'
import PublicProfileView from './components/profile/PublicProfileView'
import ProjectsPage from './components/projects/ProjectsPage'
import GuidedOnboarding from './components/onboarding/GuidedOnboarding'
import JobFeedPage from './components/jobs/JobFeedPage'
import CreateJobPage from './components/jobs/CreateJobPage'
import MyApplicationsPage from './components/jobs/MyApplicationsPage'
import JobApplicantsPage from './components/jobs/JobApplicantsPage'
import MyJobsPage from './components/jobs/MyJobsPage'
import { LiveRegionManager, initFocusVisible, createSkipLink } from './utils/accessibility'
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

  // Mock user data for testing - COMPLETED USER FOR DASHBOARD TESTING
  const mockUser = {
    id: 1,
    username: 'charliewhite',
    email: 'charlie.white@example.com',
    first_name: 'Charlie',
    last_name: 'White',
    role: 'freelancer',
    is_admin: false,
    bio: 'Local DJ and music producer specializing in electronic and house music.',
    location: 'Sydney, Australia',
    subscription_type: 'pro',
    created_at: '2024-01-15T10:00:00Z',
    onboarding_completed: true // COMPLETED USER CAN ACCESS DASHBOARD
  }

  // Check authentication status on app load
  useEffect(() => {
    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
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
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (profile) {
        setUser({
          id: userId,
          ...profile,
          onboarding_completed: true
        })
      }
      setLoading(false)
    } catch (error) {
      console.error('Error loading profile:', error)
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
      console.error('Auth check failed:', error)
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
      // Mock onboarding completion - in production this would call the backend
      console.log('Onboarding completion:', onboardingData)
      
      // Update user with onboarding data
      const updatedUser = {
        ...user,
        ...onboardingData,
        onboarding_completed: true
      }
      
      setUser(updatedUser)
      setNeedsOnboarding(false)
      return { success: true }
    } catch (error) {
      return { success: false, error: 'Network error' }
    }
  }

  const logout = async () => {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
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

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading, needsOnboarding } = useAuth()

  // TEMPORARY: Bypass auth for testing - REMOVE IN PRODUCTION
  return children

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" />
  }

  // If user needs onboarding, redirect to onboarding
  if (needsOnboarding || (!user.onboarding_completed && user.onboarding_completed !== undefined)) {
    return <Navigate to="/onboarding" />
  }

  return children
}

// Onboarding Wrapper Component
const OnboardingWrapper = () => {
  const { completeOnboarding } = useAuth()
  
  return (
    <GuidedOnboarding onComplete={completeOnboarding} />
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
    <AuthProvider>
      <Router>
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

          {/* Onboarding Route */}
          <Route path="/onboarding" element={<OnboardingWrapper />} />

          {/* Protected Routes - With AppLayout */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <AppLayout>
                <CleanFeedDashboard />
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
          <Route path="/bookings" element={
            <ProtectedRoute>
              <AppLayout>
                <BookingsPage />
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
          <Route path="/jobs/:jobId/applicants" element={
            <ProtectedRoute>
              <AppLayout>
                <JobApplicantsPage />
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
                <FunctionalStudioPage />
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

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
