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

// Initialize Stripe (server-side only - this should be in a backend/Edge Function)
// For now, we'll use environment variables
const STRIPE_SECRET_KEY = import.meta.env.VITE_STRIPE_SECRET_KEY || ''
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ''

// Platform settings
const PLATFORM_FEE_PERCENT = 0.10 // 10% commission
const CURRENCY = 'usd'

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
  country: string = 'US'
): Promise<{ accountId: string; onboardingUrl: string }> {
  try {
    // NOTE: This should be done in a Supabase Edge Function for security
    // For now, this is the structure - you'll need to implement the Edge Function

    const response = await fetch('/api/stripe/create-connect-account', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, email, country })
    })

    if (!response.ok) {
      throw new Error('Failed to create Stripe Connect account')
    }

    const data = await response.json()

    // Save account to database
    const { error } = await supabase
      .from('stripe_accounts')
      .insert({
        user_id: userId,
        stripe_account_id: data.accountId,
        account_type: 'express',
        country,
        currency: CURRENCY,
        charges_enabled: false,
        payouts_enabled: false,
        details_submitted: false,
        onboarding_completed: false
      })

    if (error) throw error

    return {
      accountId: data.accountId,
      onboardingUrl: data.onboardingUrl
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
  freelancerId: string
): Promise<{ paymentIntentId: string; clientSecret: string }> {
  try {
    const amountInCents = Math.round(amount * 100)
    const platformFee = Math.round(amountInCents * PLATFORM_FEE_PERCENT)

    // Get freelancer's Stripe account
    const { data: stripeAccount } = await supabase
      .from('stripe_accounts')
      .select('stripe_account_id')
      .eq('user_id', freelancerId)
      .single()

    if (!stripeAccount) {
      throw new Error('Freelancer has not set up payment account')
    }

    // Call Edge Function to create PaymentIntent
    const response = await fetch('/api/stripe/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: amountInCents,
        platformFee,
        connectedAccountId: stripeAccount.stripe_account_id,
        bookingId,
        clientId,
        freelancerId
      })
    })

    if (!response.ok) {
      throw new Error('Failed to create payment intent')
    }

    const data = await response.json()

    // Update booking with payment intent ID
    await supabase
      .from('bookings')
      .update({
        stripe_payment_intent_id: data.paymentIntentId,
        stripe_connected_account_id: stripeAccount.stripe_account_id,
        payment_status: 'authorized'
      })
      .eq('id', bookingId)

    return {
      paymentIntentId: data.paymentIntentId,
      clientSecret: data.clientSecret
    }
  } catch (error) {
    console.error('createPaymentIntent error:', error)
    throw error
  }
}

/**
 * Capture payment when booking is completed
 */
export async function capturePayment(
  bookingId: string,
  paymentIntentId: string
): Promise<Payment> {
  try {
    // Call Edge Function to capture payment
    const response = await fetch('/api/stripe/capture-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentIntentId, bookingId })
    })

    if (!response.ok) {
      throw new Error('Failed to capture payment')
    }

    const data = await response.json()

    // Create payment record
    const { data: payment, error } = await supabase
      .from('payments')
      .insert({
        invoice_id: data.invoiceId,
        booking_id: bookingId,
        stripe_payment_intent_id: paymentIntentId,
        stripe_charge_id: data.chargeId,
        stripe_transfer_id: data.transferId,
        payer_id: data.payerId,
        recipient_id: data.recipientId,
        amount: data.amount,
        platform_fee: data.platformFee,
        recipient_amount: data.recipientAmount,
        status: 'succeeded',
        payment_method_id: data.paymentMethodId,
        payment_method_type: data.paymentMethodType,
        captured_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    // Update booking
    await supabase
      .from('bookings')
      .update({
        payment_status: 'captured',
        payment_captured_at: new Date().toISOString()
      })
      .eq('id', bookingId)

    return payment as Payment
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
export function formatAmount(cents: number, currency: string = 'USD'): string {
  const dollars = cents / 100
  return new Intl.NumberFormat('en-US', {
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
  capturePayment,
  getPaymentHistory,
  getEarningsHistory,
  getPaymentSettings,
  updatePaymentSettings,
  calculatePlatformFee,
  formatAmount,
  getStripePublishableKey
}
