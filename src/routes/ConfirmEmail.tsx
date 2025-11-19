import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Mail, CheckCircle, ArrowRight } from 'lucide-react'

export function ConfirmEmail() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const email = searchParams.get('email') || 'your email'

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
            <div className="mx-auto w-20 h-20 bg-[#E03131]/10 rounded-full flex items-center justify-center mb-6">
              <Mail className="w-10 h-10 text-[#E03131]" />
            </div>

            {/* Heading */}
            <h1 className="text-3xl font-bold text-black mb-3">
              Check your email
            </h1>

            {/* Description */}
            <p className="text-black/70 mb-8 text-lg">
              We've sent a confirmation link to
            </p>
            <p className="text-[#E03131] font-semibold text-lg mb-8">
              {email}
            </p>

            {/* Instructions */}
            <div className="bg-[#E03131]/5 rounded-lg p-6 mb-8 text-left">
              <h3 className="font-semibold text-black mb-4 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-[#E03131]" />
                Next steps:
              </h3>
              <ol className="space-y-3 text-black/70">
                <li className="flex items-start">
                  <span className="font-semibold text-[#E03131] mr-2">1.</span>
                  <span>Check your inbox (and spam folder just in case)</span>
                </li>
                <li className="flex items-start">
                  <span className="font-semibold text-[#E03131] mr-2">2.</span>
                  <span>Click the confirmation link in the email</span>
                </li>
                <li className="flex items-start">
                  <span className="font-semibold text-[#E03131] mr-2">3.</span>
                  <span>You'll be automatically logged in and ready to set up your profile</span>
                </li>
              </ol>
            </div>

            {/* Help Text */}
            <p className="text-sm text-black/60 mb-6">
              Didn't receive the email? Check your spam folder or contact support
            </p>

            {/* Back to Login */}
            <Button
              variant="outline"
              onClick={() => navigate('/login')}
              className="w-full"
            >
              Back to Login
            </Button>
          </div>

          {/* Additional Help */}
          <div className="mt-6 text-center">
            <p className="text-black/70 text-sm">
              Need help?{' '}
              <a href="mailto:support@tiestogether.com" className="text-[#E03131] hover:text-[#F03E3E] font-medium">
                Contact Support
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
