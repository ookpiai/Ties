import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'

// Rate limiting for password reset requests
const MAX_RESET_ATTEMPTS = 3
const LOCKOUT_DURATION_MS = 30 * 60 * 1000 // 30 minutes

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isLocked, setIsLocked] = useState(false)
  const [lockoutRemaining, setLockoutRemaining] = useState(0)

  // Check rate limit
  const checkRateLimit = () => {
    const resetData = localStorage.getItem('passwordResetAttempts')
    if (resetData) {
      const { attempts, timestamp } = JSON.parse(resetData)
      const timePassed = Date.now() - timestamp

      if (timePassed < LOCKOUT_DURATION_MS && attempts >= MAX_RESET_ATTEMPTS) {
        const remaining = Math.ceil((LOCKOUT_DURATION_MS - timePassed) / 60000)
        setLockoutRemaining(remaining)
        setIsLocked(true)
        return false
      }

      // Reset if lockout has expired
      if (timePassed >= LOCKOUT_DURATION_MS) {
        localStorage.removeItem('passwordResetAttempts')
        setIsLocked(false)
      }
    }
    return true
  }

  // Update rate limit counter
  const updateRateLimit = () => {
    const resetData = localStorage.getItem('passwordResetAttempts')
    let attempts = 1

    if (resetData) {
      const data = JSON.parse(resetData)
      const timePassed = Date.now() - data.timestamp

      if (timePassed < LOCKOUT_DURATION_MS) {
        attempts = data.attempts + 1
      }
    }

    localStorage.setItem('passwordResetAttempts', JSON.stringify({
      attempts,
      timestamp: Date.now()
    }))

    if (attempts >= MAX_RESET_ATTEMPTS) {
      setIsLocked(true)
      setLockoutRemaining(30)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validate email
    if (!email.trim()) {
      setError('Please enter your email address.')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.')
      return
    }

    // Check rate limit
    if (!checkRateLimit()) {
      setError(`Too many reset attempts. Please try again in ${lockoutRemaining} minutes.`)
      return
    }

    setLoading(true)

    try {
      // Determine the correct redirect URL based on environment
      const redirectUrl = window.location.origin + '/reset-password'

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl
      })

      if (resetError) throw resetError

      // Update rate limit counter
      updateRateLimit()

      // Always show success to prevent email enumeration
      setSuccess(true)
    } catch (err) {
      // Don't expose whether the email exists or not
      // Always show success message for security
      updateRateLimit()
      setSuccess(true)
    } finally {
      setLoading(false)
    }
  }

  // Success state
  if (success) {
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
            <div className="rounded-2xl bg-white/90 backdrop-blur-md shadow-xl border border-black/5 p-8">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold text-black mb-4">Check Your Email</h1>
                <p className="text-black/70 mb-6">
                  If an account exists with <span className="text-black font-medium">{email}</span>,
                  you will receive a password reset link shortly.
                </p>
                <p className="text-black/60 text-sm mb-8">
                  Don't see the email? Check your spam folder or try again in a few minutes.
                </p>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-[#dc2626] hover:text-[#b91c1c] transition-colors font-medium"
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
            <h2 className="text-2xl font-bold text-black mb-2">Forgot Password?</h2>
            <p className="text-black/70 mb-6">
              No worries, we'll send you reset instructions.
            </p>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Lockout Warning */}
            {isLocked && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-700 text-sm">
                  Too many reset attempts. Please wait {lockoutRemaining} minutes before trying again.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-black mb-2">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black/40" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    disabled={loading || isLocked}
                    className="w-full pl-10 pr-4 py-3 bg-white/50 border border-black/20 rounded-lg text-black placeholder-black/40 focus:outline-none focus:ring-2 focus:ring-[#dc2626] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || isLocked}
                className="w-full py-3 px-4 bg-[#dc2626] hover:bg-[#b91c1c] text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Reset Link'
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

          {/* Footer */}
          <p className="text-center text-black/70 text-sm mt-8">
            Remember your password?{' '}
            <Link to="/login" className="text-[#dc2626] hover:text-[#b91c1c] font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordPage
