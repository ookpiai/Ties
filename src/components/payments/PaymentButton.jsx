import React, { useState } from 'react'
import { createCheckoutSession } from '../../api/payments'
import { CreditCard, Loader2, ExternalLink } from 'lucide-react'

/**
 * PaymentButton - Initiates Stripe Checkout for booking payment
 *
 * @param {Object} props
 * @param {string} props.bookingId - The booking ID
 * @param {number} props.amount - Amount in dollars
 * @param {string} props.clientEmail - Client's email
 * @param {string} props.freelancerName - Freelancer's display name
 * @param {string} props.description - Service description
 * @param {string} props.variant - 'primary' | 'secondary' | 'outline'
 * @param {string} props.size - 'sm' | 'md' | 'lg'
 * @param {boolean} props.fullWidth - Make button full width
 * @param {function} props.onSuccess - Callback on successful redirect
 * @param {function} props.onError - Callback on error
 */
const PaymentButton = ({
  bookingId,
  amount,
  clientEmail,
  freelancerName,
  description,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  onSuccess,
  onError,
  disabled = false,
  children,
}) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handlePayment = async () => {
    try {
      setLoading(true)
      setError('')

      const result = await createCheckoutSession(
        bookingId,
        amount,
        clientEmail,
        freelancerName,
        description
      )

      if (result.url) {
        onSuccess?.()
        // Redirect to Stripe Checkout
        window.location.href = result.url
      } else {
        throw new Error('No checkout URL returned')
      }
    } catch (err) {
      const message = err.message || 'Failed to initiate payment'
      setError(message)
      onError?.(message)
      setLoading(false)
    }
  }

  // Style variants
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'

  const variantStyles = {
    primary: 'bg-[#dc2626] hover:bg-[#b91c1c] text-white',
    secondary: 'bg-gray-700 hover:bg-gray-600 text-white',
    outline: 'border border-[#dc2626] text-[#dc2626] hover:bg-[#dc2626]/10',
  }

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  const buttonStyles = `
    ${baseStyles}
    ${variantStyles[variant]}
    ${sizeStyles[size]}
    ${fullWidth ? 'w-full' : ''}
  `

  return (
    <div className={fullWidth ? 'w-full' : 'inline-block'}>
      <button
        onClick={handlePayment}
        disabled={disabled || loading}
        className={buttonStyles}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing...
          </>
        ) : children ? (
          children
        ) : (
          <>
            <CreditCard className="w-4 h-4" />
            Pay ${amount?.toFixed(2) || '0.00'}
          </>
        )}
      </button>

      {error && (
        <p className="mt-2 text-sm text-red-400">{error}</p>
      )}
    </div>
  )
}

export default PaymentButton
