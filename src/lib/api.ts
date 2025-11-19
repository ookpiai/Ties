import { supabase } from './supabase'

// Backend API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5001/api'

/**
 * Get the current user's JWT token from Supabase session
 */
async function getAuthToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token || null
}

/**
 * Make an authenticated API request to the Flask backend
 * Automatically adds the Authorization header with JWT token
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // Get JWT token
  const token = await getAuthToken()

  // Build headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }

  // Add Authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  // Make request
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  // Handle errors
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(error.error || `HTTP ${response.status}`)
  }

  // Return JSON response
  return response.json()
}

/**
 * Convenience methods for common HTTP verbs
 */
export const api = {
  get: <T>(endpoint: string) =>
    apiRequest<T>(endpoint, { method: 'GET' }),

  post: <T>(endpoint: string, data?: any) =>
    apiRequest<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  put: <T>(endpoint: string, data?: any) =>
    apiRequest<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: <T>(endpoint: string) =>
    apiRequest<T>(endpoint, { method: 'DELETE' }),
}

/**
 * Test the backend connection and JWT validation
 */
export async function testBackendConnection() {
  try {
    const result = await api.get<{
      message: string
      user_id: string
      email: string
      role: string
    }>('/auth/verify-token')

    console.log('✅ Backend connection successful!', result)
    return result
  } catch (error) {
    console.error('❌ Backend connection failed:', error)
    throw error
  }
}
