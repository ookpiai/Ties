import { Navigate } from 'react-router-dom'
import { useUser } from '../hooks/useUser'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <img 
            src="/logo.png" 
            alt="Loading" 
            className="h-24 w-auto mx-auto mb-4 animate-pulse"
            style={{ imageRendering: 'crisp-edges' }}
          />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
