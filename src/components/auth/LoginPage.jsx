/**
 * LOGIN PAGE - Secure Modern Authentication
 *
 * Industry-standard security features:
 * - Rate limiting (5 attempts per 15 minutes)
 * - Sanitized error messages
 * - Loading states for all actions
 * - Password visibility toggle
 * - Google OAuth integration
 * - Forgot password flow
 * - No developer bypasses
 */

import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Eye, EyeOff, Loader2, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react'

// Rate limiting configuration
const MAX_LOGIN_ATTEMPTS = 5
const LOCKOUT_DURATION_MS = 15 * 60 * 1000 // 15 minutes

// Get sanitized error message (don't expose internal details)
const getAuthErrorMessage = (error) => {
  const message = error?.message?.toLowerCase() || ''

  if (message.includes('invalid login credentials') || message.includes('invalid password')) {
    return 'Invalid email or password. Please try again.'
  }
  if (message.includes('email not confirmed')) {
    return 'Please verify your email address before logging in.'
  }
  if (message.includes('user not found')) {
    return 'Invalid email or password. Please try again.'
  }
  if (message.includes('too many requests')) {
    return 'Too many login attempts. Please try again later.'
  }
  if (message.includes('network') || message.includes('fetch')) {
    return 'Network error. Please check your connection and try again.'
  }

  // Generic fallback - never expose raw error messages
  return 'Unable to sign in. Please try again.'
}

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLocked, setIsLocked] = useState(false)
  const [lockoutRemaining, setLockoutRemaining] = useState(0)

  const navigate = useNavigate()
  const location = useLocation()

  // Check for success messages from other pages (e.g., password reset)
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.get('reset') === 'success') {
      setSuccess('Password reset successful! Please sign in with your new password.')
    }
    if (params.get('verified') === 'true') {
      setSuccess('Email verified! You can now sign in.')
    }
  }, [location])

  // Rate limiting check on mount and lockout timer
  useEffect(() => {
    checkLockout()

    const interval = setInterval(() => {
      if (isLocked) {
        checkLockout()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [isLocked])

  const checkLockout = () => {
    const lockoutData = localStorage.getItem('auth_lockout')
    if (lockoutData) {
      const { timestamp, attempts } = JSON.parse(lockoutData)
      const elapsed = Date.now() - timestamp

      if (attempts >= MAX_LOGIN_ATTEMPTS && elapsed < LOCKOUT_DURATION_MS) {
        setIsLocked(true)
        setLockoutRemaining(Math.ceil((LOCKOUT_DURATION_MS - elapsed) / 1000))
      } else if (elapsed >= LOCKOUT_DURATION_MS) {
        // Lockout expired, reset
        localStorage.removeItem('auth_lockout')
        setIsLocked(false)
        setLockoutRemaining(0)
      }
    }
  }

  const recordLoginAttempt = (success) => {
    if (success) {
      // Clear lockout on success
      localStorage.removeItem('auth_lockout')
      return
    }

    const lockoutData = localStorage.getItem('auth_lockout')
    let attempts = 1

    if (lockoutData) {
      const data = JSON.parse(lockoutData)
      const elapsed = Date.now() - data.timestamp

      if (elapsed < LOCKOUT_DURATION_MS) {
        attempts = data.attempts + 1
      }
    }

    localStorage.setItem('auth_lockout', JSON.stringify({
      timestamp: Date.now(),
      attempts
    }))

    if (attempts >= MAX_LOGIN_ATTEMPTS) {
      setIsLocked(true)
      setLockoutRemaining(Math.ceil(LOCKOUT_DURATION_MS / 1000))
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    // Clear messages when user starts typing
    if (error) setError('')
    if (success) setSuccess('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Check lockout
    if (isLocked) {
      setError(`Too many failed attempts. Please wait ${Math.ceil(lockoutRemaining / 60)} minutes.`)
      return
    }

    // Validate inputs
    if (!formData.email?.trim()) {
      setError('Please enter your email address.')
      return
    }
    if (!formData.password) {
      setError('Please enter your password.')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      })

      if (signInError) {
        // Check if email not confirmed
        if (signInError.message?.toLowerCase().includes('email not confirmed')) {
          navigate(`/email-not-confirmed?email=${encodeURIComponent(formData.email)}`)
          return
        }

        recordLoginAttempt(false)
        throw signInError
      }

      // Success - clear lockout and navigate
      recordLoginAttempt(true)

      // Check if profile exists to determine redirect
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', data.user.id)
        .single()

      if (!profile || !profile.onboarding_completed) {
        navigate('/onboarding')
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      setError(getAuthErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    if (isLocked) {
      setError(`Too many failed attempts. Please wait ${Math.ceil(lockoutRemaining / 60)} minutes.`)
      return
    }

    setGoogleLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) throw error
    } catch (err) {
      setError('Google sign-in failed. Please try again.')
      setGoogleLoading(false)
    }
  }

  // Format lockout time remaining
  const formatLockoutTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF0F0] via-[#FFD6D6] to-[#FFB8B8] relative overflow-hidden">
      {/* Animated Background Layer */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 bg-[#dc2626] rounded-full blur-3xl opacity-[0.12] animate-float" />
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-[#dc2626] rounded-full blur-3xl opacity-[0.15] animate-float-slow" />
        <div className="absolute top-1/2 left-1/4 w-56 h-56 bg-[#dc2626] rounded-full blur-3xl opacity-[0.13] animate-float-delayed" />
        <div className="absolute top-40 right-20 w-80 h-80 bg-[#dc2626] rounded-full blur-3xl opacity-[0.14] animate-float-delayed" />
        <div className="absolute bottom-40 right-1/4 w-96 h-96 bg-[#dc2626] rounded-full blur-3xl opacity-[0.12] animate-float" />
        <div className="absolute top-20 right-1/3 w-64 h-64 bg-[#dc2626] rounded-full blur-3xl opacity-[0.15] animate-float-slow" />
      </div>

      {/* Logo */}
      <img
        src="/logo.png"
        alt="TIES logo"
        className="absolute left-6 top-4 md:left-10 md:top-6 h-[140px] w-auto md:h-[280px] z-30"
        style={{ imageRendering: 'crisp-edges' }}
      />

      {/* Main Content */}
      <div className="min-h-screen flex flex-col lg:flex-row items-center justify-center relative z-10 px-4">
        {/* Left Column - Brand Block */}
        <div className="hidden lg:flex w-full lg:w-1/2 px-10 items-center justify-center">
          <div className="px-12 max-w-[900px]">
            <h1 className="font-extrabold tracking-tight leading-[0.9] text-[clamp(56px,8vw,128px)] text-black">
              TIES<br/>Together
            </h1>
            <p className="mt-8 text-[clamp(20px,2.4vw,32px)] font-semibold text-black">
              Connect. Create. Collaborate.
            </p>
            <p className="mt-3 text-[clamp(14px,1.6vw,18px)] text-black/70">
              A home for creatives
            </p>
          </div>
        </div>

        {/* Right Column - Login Card */}
        <div className="w-full lg:w-1/2 flex items-center justify-center py-8 lg:py-0 mt-20 lg:mt-0">
          <div className="w-full max-w-md mx-auto">
            <div className="rounded-2xl bg-white/90 backdrop-blur-md shadow-xl border border-black/5 p-8">
              <h2 className="text-2xl font-bold text-black mb-2">
                Welcome back
              </h2>
              <p className="text-sm text-black/70 mb-6">
                Sign in to your account to continue
              </p>

              {/* Success Message */}
              {success && (
                <Alert className="mb-4 bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700">{success}</AlertDescription>
                </Alert>
              )}

              {/* Error Message */}
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Lockout Warning */}
              {isLocked && (
                <Alert className="mb-4 bg-yellow-50 border-yellow-200">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-700">
                    Account temporarily locked. Try again in {formatLockoutTime(lockoutRemaining)}
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email Field */}
                <div>
                  <Label htmlFor="email" className="text-black font-medium">
                    Email address
                  </Label>
                  <div className="mt-1.5 relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/40" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      disabled={loading || isLocked}
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className="pl-10 text-black placeholder:text-black/40 bg-white/50"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-black font-medium">
                      Password
                    </Label>
                    <Link
                      to="/forgot-password"
                      className="text-sm font-medium text-[#dc2626] hover:text-[#b91c1c] transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="mt-1.5 relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/40" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      disabled={loading || isLocked}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="pl-10 pr-10 text-black placeholder:text-black/40 bg-white/50"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black/60 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-[#dc2626] hover:bg-[#b91c1c] text-white font-medium h-11"
                  disabled={loading || googleLoading || isLocked}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign in'
                  )}
                </Button>
              </form>

              {/* OAuth Divider */}
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-black/10" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-white/90 text-black/60">or continue with</span>
                  </div>
                </div>

                {/* Google OAuth Button */}
                <div className="mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-black/20 text-black hover:bg-black/5 h-11 font-medium"
                    onClick={handleGoogleSignIn}
                    disabled={loading || googleLoading || isLocked}
                  >
                    {googleLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                    )}
                    {googleLoading ? 'Connecting...' : 'Continue with Google'}
                  </Button>
                </div>
              </div>

              {/* Sign Up Link */}
              <p className="mt-8 text-center text-sm text-black/70">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="font-semibold text-[#dc2626] hover:text-[#b91c1c] transition-colors"
                >
                  Sign up for free
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
