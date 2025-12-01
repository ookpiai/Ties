import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft, ShieldCheck } from 'lucide-react'

const ResetPasswordPage = () => {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [validSession, setValidSession] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)

  // Password strength requirements
  const passwordRequirements = [
    { test: (p) => p.length >= 8, label: 'At least 8 characters' },
    { test: (p) => /[A-Z]/.test(p), label: 'One uppercase letter' },
    { test: (p) => /[a-z]/.test(p), label: 'One lowercase letter' },
    { test: (p) => /[0-9]/.test(p), label: 'One number' },
    { test: (p) => /[^A-Za-z0-9]/.test(p), label: 'One special character' }
  ]

  // Check for valid reset session
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Check if we have a valid session from the reset link
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) throw error

        // User should have a session if they clicked the reset link
        if (session?.user) {
          setValidSession(true)
        } else {
          setError('Invalid or expired reset link. Please request a new password reset.')
        }
      } catch (err) {
        setError('Invalid or expired reset link. Please request a new password reset.')
      } finally {
        setCheckingSession(false)
      }
    }

    // Listen for auth events - Supabase handles the token from URL
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setValidSession(true)
        setCheckingSession(false)
      }
    })

    checkSession()

    return () => subscription.unsubscribe()
  }, [])

  const getPasswordStrength = () => {
    const passed = passwordRequirements.filter(req => req.test(password)).length
    if (passed === 0) return { label: '', color: '' }
    if (passed <= 2) return { label: 'Weak', color: 'text-red-400' }
    if (passed <= 3) return { label: 'Fair', color: 'text-yellow-400' }
    if (passed <= 4) return { label: 'Good', color: 'text-blue-400' }
    return { label: 'Strong', color: 'text-green-400' }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validate password
    if (!password) {
      setError('Please enter a new password.')
      return
    }

    // Check password strength
    const unmetRequirements = passwordRequirements.filter(req => !req.test(password))
    if (unmetRequirements.length > 0) {
      setError('Password does not meet all requirements.')
      return
    }

    // Check password match
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      })

      if (updateError) throw updateError

      setSuccess(true)

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login', {
          state: { message: 'Password reset successful. Please sign in with your new password.' }
        })
      }, 3000)
    } catch (err) {
      // Sanitize error messages
      const message = err?.message?.toLowerCase() || ''

      if (message.includes('same as old') || message.includes('different from')) {
        setError('New password must be different from your current password.')
      } else if (message.includes('weak') || message.includes('short')) {
        setError('Password is too weak. Please choose a stronger password.')
      } else {
        setError('Unable to reset password. Please try again or request a new reset link.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Loading state while checking session
  if (checkingSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFF0F0] via-[#FFD6D6] to-[#FFB8B8] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-black/20 border-t-[#dc2626] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-black/70">Verifying reset link...</p>
        </div>
      </div>
    )
  }

  // Invalid session state
  if (!validSession && !checkingSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFF0F0] via-[#FFD6D6] to-[#FFB8B8] relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 bg-[#dc2626] rounded-full blur-3xl opacity-[0.12] animate-float" />
          <div className="absolute bottom-20 left-20 w-72 h-72 bg-[#dc2626] rounded-full blur-3xl opacity-[0.15] animate-float-slow" />
        </div>
        <img
          src="/logo.png"
          alt="TIES logo"
          className="absolute left-6 top-4 md:left-10 md:top-6 h-[140px] w-auto md:h-[280px] z-30"
          style={{ imageRendering: 'crisp-edges' }}
        />
        <div className="min-h-screen flex items-center justify-center relative z-10 p-4">
          <div className="w-full max-w-md">
            <div className="rounded-2xl bg-white/90 backdrop-blur-md shadow-xl border border-black/5 p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-black mb-4">Invalid Reset Link</h1>
              <p className="text-black/70 mb-6">
                {error || 'This password reset link is invalid or has expired.'}
              </p>
              <Link
                to="/forgot-password"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#dc2626] hover:bg-[#b91c1c] text-white font-semibold rounded-lg transition-all"
              >
                Request New Link
              </Link>
              <div className="mt-4">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-black/60 hover:text-black transition-colors text-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFF0F0] via-[#FFD6D6] to-[#FFB8B8] relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 bg-[#dc2626] rounded-full blur-3xl opacity-[0.12] animate-float" />
          <div className="absolute bottom-20 left-20 w-72 h-72 bg-[#dc2626] rounded-full blur-3xl opacity-[0.15] animate-float-slow" />
        </div>
        <img
          src="/logo.png"
          alt="TIES logo"
          className="absolute left-6 top-4 md:left-10 md:top-6 h-[140px] w-auto md:h-[280px] z-30"
          style={{ imageRendering: 'crisp-edges' }}
        />
        <div className="min-h-screen flex items-center justify-center relative z-10 p-4">
          <div className="w-full max-w-md">
            <div className="rounded-2xl bg-white/90 backdrop-blur-md shadow-xl border border-black/5 p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-black mb-4">Password Reset Complete</h1>
              <p className="text-black/70 mb-6">
                Your password has been successfully reset. You will be redirected to the login page shortly.
              </p>
              <div className="flex items-center justify-center gap-2 text-black/60 text-sm">
                <div className="w-4 h-4 border-2 border-black/20 border-t-[#dc2626] rounded-full animate-spin" />
                Redirecting to login...
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const passwordStrength = getPasswordStrength()

  // Updated password strength colors for light theme
  const getStrengthColor = () => {
    const passed = passwordRequirements.filter(req => req.test(password)).length
    if (passed === 0) return ''
    if (passed <= 2) return 'text-red-600'
    if (passed <= 3) return 'text-yellow-600'
    if (passed <= 4) return 'text-blue-600'
    return 'text-green-600'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF0F0] via-[#FFD6D6] to-[#FFB8B8] relative overflow-hidden">
      {/* Animated Background Layer */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 bg-[#dc2626] rounded-full blur-3xl opacity-[0.12] animate-float" />
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-[#dc2626] rounded-full blur-3xl opacity-[0.15] animate-float-slow" />
        <div className="absolute top-40 right-20 w-80 h-80 bg-[#dc2626] rounded-full blur-3xl opacity-[0.14] animate-float-delayed" />
      </div>

      {/* Logo */}
      <img
        src="/logo.png"
        alt="TIES logo"
        className="absolute left-6 top-4 md:left-10 md:top-6 h-[140px] w-auto md:h-[280px] z-30"
        style={{ imageRendering: 'crisp-edges' }}
      />

      <div className="min-h-screen flex items-center justify-center relative z-10 p-4">
        <div className="w-full max-w-md">
          {/* Form Card */}
          <div className="rounded-2xl bg-white/90 backdrop-blur-md shadow-xl border border-black/5 p-8">
            <div className="text-center mb-6">
              <div className="mx-auto w-12 h-12 bg-[#dc2626]/10 rounded-full flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6 text-[#dc2626]" />
              </div>
              <h2 className="text-2xl font-bold text-black mb-2">Set New Password</h2>
              <p className="text-black/70">
                Choose a strong password to secure your account.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* New Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-black mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black/40" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    disabled={loading}
                    className="w-full pl-10 pr-12 py-3 bg-white/50 border border-black/20 rounded-lg text-black placeholder-black/40 focus:outline-none focus:ring-2 focus:ring-[#dc2626] focus:border-transparent disabled:opacity-50 transition-all"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black/60 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {password && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-black/60">Password Strength</span>
                      <span className={`text-xs font-medium ${getStrengthColor()}`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {passwordRequirements.map((req, index) => (
                        <div
                          key={index}
                          className={`flex items-center gap-2 text-xs ${
                            req.test(password) ? 'text-green-600' : 'text-black/50'
                          }`}
                        >
                          <CheckCircle className={`w-3 h-3 ${req.test(password) ? 'opacity-100' : 'opacity-30'}`} />
                          {req.label}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-black mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black/40" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    disabled={loading}
                    className={`w-full pl-10 pr-12 py-3 bg-white/50 border rounded-lg text-black placeholder-black/40 focus:outline-none focus:ring-2 focus:ring-[#dc2626] focus:border-transparent disabled:opacity-50 transition-all ${
                      confirmPassword && password !== confirmPassword
                        ? 'border-red-500'
                        : confirmPassword && password === confirmPassword
                        ? 'border-green-500'
                        : 'border-black/20'
                    }`}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black/60 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="mt-2 text-xs text-red-600">Passwords do not match</p>
                )}
                {confirmPassword && password === confirmPassword && (
                  <p className="mt-2 text-xs text-green-600">Passwords match</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !password || !confirmPassword || password !== confirmPassword}
                className="w-full py-3 px-4 bg-[#dc2626] hover:bg-[#b91c1c] text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Resetting Password...
                  </>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>

            {/* Back to Login */}
            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-black/60 hover:text-black transition-colors text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResetPasswordPage
