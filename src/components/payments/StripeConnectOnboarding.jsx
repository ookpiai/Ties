import React, { useState, useEffect } from 'react'
import { useAuth } from '../../App'
import {
  createStripeConnectAccount,
  getStripeAccountStatus,
  hasCompletedStripeOnboarding
} from '../../api/payments'
import {
  CreditCard,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Loader2,
  Shield,
  DollarSign,
  Clock
} from 'lucide-react'

const StripeConnectOnboarding = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)
  const [accountStatus, setAccountStatus] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user?.id) {
      loadAccountStatus()
    }
  }, [user?.id])

  // Check URL params for Stripe return
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const stripeStatus = params.get('stripe')

    if (stripeStatus === 'success') {
      // Refresh status after returning from Stripe
      loadAccountStatus()
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname)
    } else if (stripeStatus === 'refresh') {
      // User needs to complete onboarding
      setError('Please complete all required information to activate your payment account.')
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  const loadAccountStatus = async () => {
    try {
      setLoading(true)
      const status = await getStripeAccountStatus(user.id)
      setAccountStatus(status)
    } catch (err) {
      // No account yet - that's okay
      setAccountStatus(null)
    } finally {
      setLoading(false)
    }
  }

  const handleConnectStripe = async () => {
    try {
      setConnecting(true)
      setError('')

      const result = await createStripeConnectAccount(
        user.id,
        user.email,
        'AU' // Default to Australia
      )

      if (result.onboardingUrl) {
        // Redirect to Stripe onboarding
        window.location.href = result.onboardingUrl
      } else if (result.isExisting && !result.onboardingUrl) {
        // Already onboarded
        await loadAccountStatus()
      }
    } catch (err) {
      setError(err.message || 'Failed to connect Stripe account')
      setConnecting(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </div>
    )
  }

  // Account is fully set up
  if (accountStatus?.onboarding_completed) {
    return (
      <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-6 h-6 text-green-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-1">
              Payment Account Active
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              Your Stripe account is connected and ready to receive payments.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-900/50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                  <DollarSign className="w-3 h-3" />
                  Charges
                </div>
                <span className={`text-sm font-medium ${accountStatus.charges_enabled ? 'text-green-400' : 'text-yellow-400'}`}>
                  {accountStatus.charges_enabled ? 'Enabled' : 'Pending'}
                </span>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                  <Clock className="w-3 h-3" />
                  Payouts
                </div>
                <span className={`text-sm font-medium ${accountStatus.payouts_enabled ? 'text-green-400' : 'text-yellow-400'}`}>
                  {accountStatus.payouts_enabled ? 'Enabled' : 'Pending'}
                </span>
              </div>
            </div>

            <a
              href="https://dashboard.stripe.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-[#dc2626] hover:text-[#b91c1c] transition-colors"
            >
              View Stripe Dashboard
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    )
  }

  // Account exists but onboarding incomplete
  if (accountStatus && !accountStatus.onboarding_completed) {
    return (
      <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-6 h-6 text-yellow-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-1">
              Complete Your Setup
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              Your payment account setup is incomplete. Please finish the onboarding process to start receiving payments.
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              onClick={handleConnectStripe}
              disabled={connecting}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#dc2626] hover:bg-[#b91c1c] text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {connecting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <ExternalLink className="w-4 h-4" />
                  Continue Setup
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // No account - show setup prompt
  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 bg-[#dc2626]/20 rounded-full flex items-center justify-center flex-shrink-0">
          <CreditCard className="w-6 h-6 text-[#dc2626]" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">
            Set Up Payments
          </h3>
          <p className="text-gray-400 text-sm">
            Connect your bank account to receive payments for your services.
          </p>
        </div>
      </div>

      {/* Benefits */}
      <div className="grid gap-3 mb-6">
        <div className="flex items-center gap-3 text-gray-300 text-sm">
          <Shield className="w-4 h-4 text-green-400" />
          Secure payments powered by Stripe
        </div>
        <div className="flex items-center gap-3 text-gray-300 text-sm">
          <DollarSign className="w-4 h-4 text-green-400" />
          Get paid directly to your bank account
        </div>
        <div className="flex items-center gap-3 text-gray-300 text-sm">
          <Clock className="w-4 h-4 text-green-400" />
          Fast payouts (1-2 business days)
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <button
        onClick={handleConnectStripe}
        disabled={connecting}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#dc2626] hover:bg-[#b91c1c] text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
      >
        {connecting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Connecting to Stripe...
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5" />
            Connect Stripe Account
          </>
        )}
      </button>

      <p className="text-gray-500 text-xs text-center mt-4">
        You'll be redirected to Stripe to complete secure account setup.
        TIES Together takes a 10% platform fee on all transactions.
      </p>
    </div>
  )
}

export default StripeConnectOnboarding
