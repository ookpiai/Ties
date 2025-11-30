import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { TitoLoader } from '../components/TitoLoader'
import { CheckCircle } from 'lucide-react'

export function AuthCallback() {
  const navigate = useNavigate()
  const [status, setStatus] = useState<'confirming' | 'success' | 'error'>('confirming')
  const [message, setMessage] = useState('')

  useEffect(() => {
    // Handle the auth callback
    const handleAuthCallback = async () => {
      try {
        // When user clicks email confirmation link, Supabase automatically
        // exchanges the tokens in the URL hash and establishes a session
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Error during auth callback:', error)
          setStatus('error')
          setMessage('Failed to confirm email. Please try again.')
          setTimeout(() => navigate('/login?error=confirmation_failed'), 2000)
          return
        }

        if (session) {
          // Show success message
          setStatus('success')
          setMessage('Welcome to TIES Together!')

          // Wait 2 seconds so user sees the success message
          await new Promise(resolve => setTimeout(resolve, 2000))

          // Session successfully established - check if profile exists
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (profile && profile.onboarding_completed) {
            // Profile exists and onboarding complete - go to dashboard
            navigate('/dashboard')
          } else {
            // No profile or onboarding not complete - go to onboarding
            navigate('/onboarding')
          }
        } else {
          // No session - redirect to login
          setStatus('error')
          setMessage('Could not establish session. Please log in.')
          setTimeout(() => navigate('/login'), 2000)
        }
      } catch (error) {
        console.error('Unexpected error during auth callback:', error)
        setStatus('error')
        setMessage('An unexpected error occurred.')
        setTimeout(() => navigate('/login?error=unexpected'), 2000)
      }
    }

    handleAuthCallback()
  }, [navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF0F0] via-[#FFD6D6] to-[#FFB8B8] relative overflow-hidden">
      {/* Animated Background Layer */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 bg-[#E03131] rounded-full blur-3xl opacity-[0.12] animate-float" />
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-[#E03131] rounded-full blur-3xl opacity-[0.15] animate-float-slow" />
        <div className="absolute top-1/2 left-1/4 w-56 h-56 bg-[#F03E3E] rounded-full blur-3xl opacity-[0.13] animate-float-delayed" />
        <div className="absolute top-40 right-20 w-80 h-80 bg-[#F03E3E] rounded-full blur-3xl opacity-[0.14] animate-float-delayed" />
        <div className="absolute bottom-40 right-1/4 w-96 h-96 bg-[#E03131] rounded-full blur-3xl opacity-[0.12] animate-float" />
        <div className="absolute top-20 right-1/3 w-64 h-64 bg-[#F03E3E] rounded-full blur-3xl opacity-[0.15] animate-float-slow" />
      </div>

      {/* Logo */}
      <img
        src="/logo.png"
        alt="TIES logo"
        className="absolute left-10 top-4 md:left-14 md:top-6 h-[225px] w-auto md:h-[375px] z-30"
        style={{ imageRendering: 'crisp-edges' }}
      />

      {/* Main Content */}
      <div className="min-h-screen flex items-center justify-center relative z-10 px-4">
        <div className="w-full max-w-md">
          <div className="rounded-2xl bg-white/90 backdrop-blur-md shadow-xl border border-black/5 p-8 md:p-12 text-center">
            {status === 'confirming' && (
              <>
                <TitoLoader show={true} />
                <div className="mx-auto w-20 h-20 bg-[#E03131]/10 rounded-full flex items-center justify-center mb-6">
                  <div className="w-10 h-10 border-4 border-[#E03131] border-t-transparent rounded-full animate-spin"></div>
                </div>
                <h2 className="text-2xl font-bold text-black mb-2">Confirming your email...</h2>
                <p className="text-black/70">Please wait while we verify your account</p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-black mb-2">Email Confirmed! ✓</h2>
                <p className="text-black/70 mb-4 text-lg">{message}</p>
                <p className="text-sm text-black/60">Taking you to your dashboard...</p>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                  <span className="text-4xl">❌</span>
                </div>
                <h2 className="text-2xl font-bold text-black mb-2">Confirmation Failed</h2>
                <p className="text-black/70 mb-4">{message}</p>
                <p className="text-sm text-black/60">Redirecting to login...</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
