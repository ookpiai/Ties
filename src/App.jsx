import React, { createContext, useContext, useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import LandingPage from './components/LandingPage'
import LoginPage from './components/auth/LoginPage'
import RegisterPage from './components/auth/RegisterPage'
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
import ProjectsPage from './components/projects/ProjectsPage'
import GuidedOnboarding from './components/onboarding/GuidedOnboarding'
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
  }, [])

  const checkAuth = async () => {
    try {
      // For demo purposes, automatically log in with mock user
      // In production, this would check for a valid session/token
      setTimeout(() => {
        setUser(mockUser)
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Auth check failed:', error)
      setLoading(false)
    }
  }

  const login = async (credentials) => {
    try {
      // Mock login - in production this would call the backend
      console.log('Login attempt:', credentials)
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // For demo, accept any credentials and log in with mock user
      setUser(mockUser)
      return { success: true }
    } catch (error) {
      return { success: false, error: 'Network error' }
    }
  }

  const register = async (userData) => {
    try {
      // Mock registration - in production this would call the backend
      console.log('Registration attempt:', userData)
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // For demo, create a mock user based on registration data
      const newUser = {
        ...mockUser,
        username: userData.username,
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        role: userData.role,
        bio: userData.bio || '',
        location: userData.location || '',
        onboarding_completed: false // New users need onboarding
      }
      
      setUser(newUser)
      setNeedsOnboarding(true) // Trigger onboarding flow
      return { success: true }
    } catch (error) {
      return { success: false, error: 'Network error' }
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
      // Mock logout
      console.log('Logout')
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
            <ProtectedRoute>
              <AppLayout>
                <MessagesPage />
              </AppLayout>
            </ProtectedRoute>
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
