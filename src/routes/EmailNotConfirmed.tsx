import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { supabase } from '../lib/supabase'
import { Mail, AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react'
import { useToast } from '../components/Toaster'
import { TitoLoader, useLoader } from '../components/TitoLoader'

export function EmailNotConfirmed() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const email = searchParams.get('email') || ''
  const { showToast } = useToast()
  const { isLoading, withLoader } = useLoader()
  const [emailSent, setEmailSent] = useState(false)

  const handleResendEmail = async () => {
    if (!email) {
      showToast('Please provide your email address', 'error')
      return
    }

    try {
      await withLoader(async () => {
        const { error } = await supabase.auth.resend({
          type: 'signup',
          email: email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`
          }
        })

        if (error) throw error

        setEmailSent(true)
        showToast('Confirmation email resent! Check your inbox.', 'success')
      })
    } catch (error: any) {
      showToast(error.message || 'Failed to resend email', 'error')
    }
  }

  return (
    <>
      <TitoLoader show={isLoading} />
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

        {/* Logo at very top of page */}
        <img
          src="/logo.png"
          alt="TIES logo"
          className="absolute left-10 top-4 md:left-14 md:top-6 h-[225px] w-auto md:h-[375px] z-30"
          style={{ imageRendering: 'crisp-edges' }}
        />

        {/* Main Content */}
        <div className="min-h-screen flex items-center justify-center relative z-10 px-4">
          <div className="w-full max-w-lg">
            <div className="rounded-2xl bg-white/90 backdrop-blur-md shadow-xl border border-black/5 p-8 md:p-12 text-center">
              {/* Icon */}
              <div className="mx-auto w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-6">
                <AlertCircle className="w-10 h-10 text-orange-600" />
              </div>

              {/* Heading */}
              <h1 className="text-3xl font-bold text-black mb-3">
                Email Not Confirmed
              </h1>

              {/* Description */}
              <p className="text-black/70 mb-6 text-lg">
                You need to confirm your email address before you can log in.
              </p>

              {email && (
                <p className="text-[#E03131] font-semibold text-lg mb-8">
                  {email}
                </p>
              )}

              {/* Instructions */}
              <div className="bg-orange-50 rounded-lg p-6 mb-8 text-left">
                <h3 className="font-semibold text-black mb-4 flex items-center">
                  <Mail className="w-5 h-5 mr-2 text-orange-600" />
                  What you need to do:
                </h3>
                <ol className="space-y-3 text-black/70">
                  <li className="flex items-start">
                    <span className="font-semibold text-orange-600 mr-2">1.</span>
                    <span>Check your email inbox (and spam folder)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-semibold text-orange-600 mr-2">2.</span>
                    <span>Find the confirmation email from TIES Together</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-semibold text-orange-600 mr-2">3.</span>
                    <span>Click the confirmation link in the email</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-semibold text-orange-600 mr-2">4.</span>
                    <span>You'll be automatically logged in and ready to go!</span>
                  </li>
                </ol>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 mb-6">
                {email && !emailSent && (
                  <Button
                    onClick={handleResendEmail}
                    className="w-full bg-[#E03131] hover:bg-[#F03E3E] text-white"
                    disabled={isLoading}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Resend Confirmation Email
                  </Button>
                )}

                {emailSent && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <p className="text-green-800 font-medium">
                      ✓ Confirmation email sent! Check your inbox.
                    </p>
                  </div>
                )}

                <Button
                  variant="outline"
                  onClick={() => navigate('/login')}
                  className="w-full"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </Button>
              </div>

              {/* Help Text */}
              <p className="text-sm text-black/60">
                Still having trouble?{' '}
                <a href="mailto:support@tiestogether.com" className="text-[#E03131] hover:text-[#F03E3E] font-medium">
                  Contact Support
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
