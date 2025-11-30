/**
 * PAYMENTS API LAYER
 * Phase 1 - Stripe Integration
 *
 * Handles all payment operations:
 * - Stripe Connect account creation
 * - Payment intent creation and capture
 * - Payment method management
 * - Payout scheduling
 * - Payment tracking
 */

import { supabase } from '../lib/supabase'
import Stripe from 'stripe'

// =====================================================
// CONFIGURATION
// =====================================================

// Stripe configuration (publishable key only - secret operations go through Edge Functions)
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ''
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Platform settings
const PLATFORM_FEE_PERCENT = 0.10 // 10% commission
const CURRENCY = 'aud'

// =====================================================
// EDGE FUNCTION HELPER
// =====================================================

/**
 * Call a Supabase Edge Function
 */
async function callEdgeFunction(functionName: string, body: object): Promise<any> {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/${functionName}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(body),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || `Edge function ${functionName} failed`)
  }

  return data
}

// =====================================================
// TYPESCRIPT INTERFACES
// =====================================================

export interface StripeAccount {
  id: string
  user_id: string
  stripe_account_id: string
  account_type: 'express' | 'standard'
  charges_enabled: boolean
  payouts_enabled: boolean
  details_submitted: boolean
  onboarding_completed: boolean
  country: string
  currency: string
  created_at: string
  updated_at: string
}

export interface PaymentMethod {
  id: string
  user_id: string
  stripe_customer_id: string
  stripe_payment_method_id: string
  type: string
  brand?: string
  last4?: string
  exp_month?: number
  exp_year?: number
  is_default: boolean
  created_at: string
}

export interface Payment {
  id: string
  invoice_id: string
  booking_id: string
  stripe_payment_intent_id: string
  stripe_charge_id?: string
  stripe_transfer_id?: string
  payer_id: string
  recipient_id: string
  amount: number
  platform_fee: number
  recipient_amount: number
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled'
  failure_reason?: string
  payment_method_id?: string
  payment_method_type?: string
  captured_at?: string
  transferred_at?: string
  created_at: string
}

export interface PaymentSettings {
  id: string
  user_id: string
  payout_schedule: 'daily' | 'weekly' | 'monthly' | 'manual'
  minimum_payout_amount: number
  auto_pay_on_completion: boolean
  notify_on_payment_received: boolean
  notify_on_payout_processed: boolean
  notify_on_invoice_generated: boolean
  created_at: string
}

// =====================================================
// STRIPE CONNECT - ACCOUNT CREATION
// =====================================================

/**
 * Create a Stripe Connect Express account for a freelancer/venue/vendor
 * This allows them to receive payments
 */
export async function createStripeConnectAccount(
  userId: string,
  email: string,
  country: string = 'AU'
): Promise<{ accountId: string; onboardingUrl: string; isExisting?: boolean }> {
  try {
    const data = await callEdgeFunction('create-connect-account', {
      userId,
      email,
      country,
      returnUrl: `${window.location.origin}/settings?stripe=success`,
      refreshUrl: `${window.location.origin}/settings?stripe=refresh`,
    })

    return {
      accountId: data.accountId,
      onboardingUrl: data.onboardingUrl,
      isExisting: data.isExisting,
    }
  } catch (error) {
    console.error('createStripeConnectAccount error:', error)
    throw error
  }
}

/**
 * Get Stripe Connect account status
 */
export async function getStripeAccountStatus(
  userId: string
): Promise<StripeAccount | null> {
  try {
    const { data, error } = await supabase
      .from('stripe_accounts')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw error
    }

    return data as StripeAccount
  } catch (error) {
    console.error('getStripeAccountStatus error:', error)
    throw error
  }
}

/**
 * Check if user has completed Stripe Connect onboarding
 */
export async function hasCompletedStripeOnboarding(
  userId: string
): Promise<boolean> {
  try {
    const account = await getStripeAccountStatus(userId)
    return account?.onboarding_completed === true &&
           account?.charges_enabled === true &&
           account?.payouts_enabled === true
  } catch (error) {
    return false
  }
}

// =====================================================
// PAYMENT METHODS
// =====================================================

/**
 * Add a payment method for a client/organiser
 */
export async function addPaymentMethod(
  userId: string,
  paymentMethodId: string
): Promise<PaymentMethod> {
  try {
    // Call Edge Function to attach payment method to customer
    const response = await fetch('/api/stripe/add-payment-method', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, paymentMethodId })
    })

    if (!response.ok) {
      throw new Error('Failed to add payment method')
    }

    const data = await response.json()

    // Save to database
    const { data: paymentMethod, error } = await supabase
      .from('payment_methods')
      .insert({
        user_id: userId,
        stripe_customer_id: data.customerId,
        stripe_payment_method_id: paymentMethodId,
        type: data.type,
        brand: data.brand,
        last4: data.last4,
        exp_month: data.exp_month,
        exp_year: data.exp_year,
        is_default: data.is_default
      })
      .select()
      .single()

    if (error) throw error

    return paymentMethod as PaymentMethod
  } catch (error) {
    console.error('addPaymentMethod error:', error)
    throw error
  }
}

/**
 * Get user's payment methods
 */
export async function getPaymentMethods(
  userId: string
): Promise<PaymentMethod[]> {
  try {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return data as PaymentMethod[]
  } catch (error) {
    console.error('getPaymentMethods error:', error)
    throw error
  }
}

/**
 * Set default payment method
 */
export async function setDefaultPaymentMethod(
  userId: string,
  paymentMethodId: string
): Promise<void> {
  try {
    // Unset all existing defaults
    await supabase
      .from('payment_methods')
      .update({ is_default: false })
      .eq('user_id', userId)

    // Set new default
    const { error } = await supabase
      .from('payment_methods')
      .update({ is_default: true })
      .eq('id', paymentMethodId)
      .eq('user_id', userId)

    if (error) throw error
  } catch (error) {
    console.error('setDefaultPaymentMethod error:', error)
    throw error
  }
}

/**
 * Remove payment method
 */
export async function removePaymentMethod(
  userId: string,
  paymentMethodId: string
): Promise<void> {
  try {
    // Call Edge Function to detach from Stripe
    await fetch('/api/stripe/remove-payment-method', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentMethodId })
    })

    // Remove from database
    const { error } = await supabase
      .from('payment_methods')
      .delete()
      .eq('id', paymentMethodId)
      .eq('user_id', userId)

    if (error) throw error
  } catch (error) {
    console.error('removePaymentMethod error:', error)
    throw error
  }
}

// =====================================================
// PAYMENT CAPTURE
// =====================================================

/**
 * Create payment intent when booking is accepted
 * Amount is authorized but not captured until job completes
 */
export async function createPaymentIntent(
  bookingId: string,
  amount: number, // in dollars
  clientId: string,
  freelancerId: string,
  description?: string
): Promise<{ paymentIntentId: string; clientSecret: string }> {
  try {
    const data = await callEdgeFunction('create-payment-intent', {
      bookingId,
      amount,
      clientId,
      freelancerId,
      description,
    })

    return {
      paymentIntentId: data.paymentIntentId,
      clientSecret: data.clientSecret,
    }
  } catch (error) {
    console.error('createPaymentIntent error:', error)
    throw error
  }
}

/**
 * Create a Stripe Checkout session for booking payment
 * Redirects client to Stripe-hosted payment page
 */
export async function createCheckoutSession(
  bookingId: string,
  amount: number,
  clientEmail: string,
  freelancerName: string,
  description?: string
): Promise<{ sessionId: string; url: string }> {
  try {
    const data = await callEdgeFunction('create-checkout-session', {
      bookingId,
      amount,
      clientEmail,
      freelancerName,
      description,
      successUrl: `${window.location.origin}/bookings?payment=success&booking=${bookingId}`,
      cancelUrl: `${window.location.origin}/bookings?payment=cancelled&booking=${bookingId}`,
    })

    return {
      sessionId: data.sessionId,
      url: data.url,
    }
  } catch (error) {
    console.error('createCheckoutSession error:', error)
    throw error
  }
}

/**
 * Capture payment when booking is completed
 */
export async function capturePayment(
  bookingId: string,
  paymentIntentId: string
): Promise<{ success: boolean; invoiceId?: string; amount?: number }> {
  try {
    const data = await callEdgeFunction('capture-payment', {
      paymentIntentId,
      bookingId,
    })

    return {
      success: data.success,
      invoiceId: data.invoiceId,
      amount: data.amount,
    }
  } catch (error) {
    console.error('capturePayment error:', error)
    throw error
  }
}

// =====================================================
// PAYMENT HISTORY
// =====================================================

/**
 * Get user's payment history (as client)
 */
export async function getPaymentHistory(
  userId: string
): Promise<Payment[]> {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        invoice:invoices(invoice_number, status),
        booking:bookings(
          service_description,
          start_date,
          end_date,
          freelancer_profile:profiles!bookings_freelancer_id_fkey(
            display_name,
            avatar_url
          )
        )
      `)
      .eq('payer_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return data as Payment[]
  } catch (error) {
    console.error('getPaymentHistory error:', error)
    throw error
  }
}

/**
 * Get user's earnings history (as freelancer)
 */
export async function getEarningsHistory(
  userId: string
): Promise<Payment[]> {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        invoice:invoices(invoice_number, status),
        booking:bookings(
          service_description,
          start_date,
          end_date,
          client_profile:profiles!bookings_client_id_fkey(
            display_name,
            avatar_url
          )
        )
      `)
      .eq('recipient_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return data as Payment[]
  } catch (error) {
    console.error('getEarningsHistory error:', error)
    throw error
  }
}

// =====================================================
// PAYMENT SETTINGS
// =====================================================

/**
 * Get user's payment settings
 */
export async function getPaymentSettings(
  userId: string
): Promise<PaymentSettings | null> {
  try {
    const { data, error } = await supabase
      .from('payment_settings')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // Create default settings
        return await createDefaultPaymentSettings(userId)
      }
      throw error
    }

    return data as PaymentSettings
  } catch (error) {
    console.error('getPaymentSettings error:', error)
    throw error
  }
}

/**
 * Create default payment settings
 */
async function createDefaultPaymentSettings(
  userId: string
): Promise<PaymentSettings> {
  const { data, error } = await supabase
    .from('payment_settings')
    .insert({
      user_id: userId,
      payout_schedule: 'weekly',
      minimum_payout_amount: 2000, // $20.00
      auto_pay_on_completion: false,
      notify_on_payment_received: true,
      notify_on_payout_processed: true,
      notify_on_invoice_generated: true
    })
    .select()
    .single()

  if (error) throw error

  return data as PaymentSettings
}

/**
 * Update payment settings
 */
export async function updatePaymentSettings(
  userId: string,
  settings: Partial<PaymentSettings>
): Promise<PaymentSettings> {
  try {
    const { data, error } = await supabase
      .from('payment_settings')
      .update({
        ...settings,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error

    return data as PaymentSettings
  } catch (error) {
    console.error('updatePaymentSettings error:', error)
    throw error
  }
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

/**
 * Calculate platform fee (10%)
 */
export function calculatePlatformFee(amount: number): number {
  return Math.round(amount * PLATFORM_FEE_PERCENT)
}

/**
 * Format amount from cents to dollars
 */
export function formatAmount(cents: number, currency: string = 'AUD'): string {
  const dollars = cents / 100
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency
  }).format(dollars)
}

/**
 * Get publishable key (client-side safe)
 */
export function getStripePublishableKey(): string {
  return STRIPE_PUBLISHABLE_KEY
}

// =====================================================
// EXPORTS
// =====================================================

export default {
  createStripeConnectAccount,
  getStripeAccountStatus,
  hasCompletedStripeOnboarding,
  addPaymentMethod,
  getPaymentMethods,
  setDefaultPaymentMethod,
  removePaymentMethod,
  createPaymentIntent,
  createCheckoutSession,
  capturePayment,
  getPaymentHistory,
  getEarningsHistory,
  getPaymentSettings,
  updatePaymentSettings,
  calculatePlatformFee,
  formatAmount,
  getStripePublishableKey
}
