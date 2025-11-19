import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './routes/ProtectedRoute'
import { Login } from './routes/Login'
import { Signup } from './routes/Signup'
import { ProfileSetup } from './routes/ProfileSetup'
import { Browse } from './routes/Browse'
import LandingPage from './components/LandingPage'

// Placeholder components - to be implemented
function Profile() {
  return <div className="p-8">Profile Page - Coming Soon</div>
}

function ServiceDetail() {
  return <div className="p-8">Service Detail - Coming Soon</div>
}

function Inbox() {
  return <div className="p-8">Inbox - Coming Soon</div>
}

function Projects() {
  return <div className="p-8">Projects - Coming Soon</div>
}

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Protected Routes */}
      <Route
        path="/profile/setup"
        element={
          <ProtectedRoute>
            <ProfileSetup />
          </ProtectedRoute>
        }
      />
      <Route
        path="/browse"
        element={
          <ProtectedRoute>
            <Browse />
          </ProtectedRoute>
        }
      />
      <Route
        path="/services/:id"
        element={
          <ProtectedRoute>
            <ServiceDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/inbox"
        element={
          <ProtectedRoute>
            <Inbox />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects"
        element={
          <ProtectedRoute>
            <Projects />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
