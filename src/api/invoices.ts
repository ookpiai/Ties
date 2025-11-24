/**
 * INVOICES API LAYER
 * Phase 1 - Automatic Invoice Generation
 *
 * Handles all invoice operations:
 * - Automatic invoice generation on booking completion
 * - Stripe Invoicing integration
 * - Invoice retrieval and tracking
 * - PDF generation and email delivery
 */

import { supabase } from '../lib/supabase'
import { calculatePlatformFee } from './payments'

// =====================================================
// TYPESCRIPT INTERFACES
// =====================================================

export interface Invoice {
  id: string
  booking_id: string
  invoice_number: string
  stripe_invoice_id?: string
  stripe_hosted_url?: string
  stripe_pdf_url?: string
  client_id: string
  freelancer_id: string
  subtotal: number // in cents
  platform_fee: number // in cents
  tax_amount: number // in cents
  total_amount: number // in cents
  freelancer_payout: number // in cents
  currency: string
  status: 'pending' | 'paid' | 'cancelled' | 'refunded'
  payment_method?: string
  issued_at: string
  due_date?: string
  paid_at?: string
  created_at: string
  updated_at: string
}

export interface InvoiceWithDetails extends Invoice {
  booking?: {
    service_description: string
    start_date: string
    end_date: string
  }
  client_profile?: {
    display_name: string
    email: string
    avatar_url?: string
  }
  freelancer_profile?: {
    display_name: string
    email: string
    avatar_url?: string
  }
}

// =====================================================
// AUTOMATIC INVOICE GENERATION
// =====================================================

/**
 * Generate invoice automatically when booking is completed
 * This is called from completeBooking() in bookings.ts
 */
export async function generateInvoiceOnCompletion(
  bookingId: string
): Promise<Invoice> {
  try {
    // Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        *,
        client_profile:profiles!bookings_client_id_fkey(
          id,
          display_name,
          email
        ),
        freelancer_profile:profiles!bookings_freelancer_id_fkey(
          id,
          display_name,
          email
        )
      `)
      .eq('id', bookingId)
      .single()

    if (bookingError) throw bookingError

    // Check if invoice already exists
    const { data: existingInvoice } = await supabase
      .from('invoices')
      .select('id')
      .eq('booking_id', bookingId)
      .single()

    if (existingInvoice) {
      console.log('Invoice already exists for this booking')
      return existingInvoice as Invoice
    }

    // Calculate amounts (convert to cents)
    const subtotalInCents = Math.round(booking.total_amount * 100)
    const platformFeeInCents = calculatePlatformFee(subtotalInCents)
    const freelancerPayoutInCents = subtotalInCents - platformFeeInCents

    // Generate unique invoice number
    const invoiceNumber = await generateInvoiceNumber()

    // Create invoice in database
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        booking_id: bookingId,
        invoice_number: invoiceNumber,
        client_id: booking.client_id,
        freelancer_id: booking.freelancer_id,
        subtotal: subtotalInCents,
        platform_fee: platformFeeInCents,
        tax_amount: 0, // TODO: Integrate Stripe Tax if needed
        total_amount: subtotalInCents,
        freelancer_payout: freelancerPayoutInCents,
        currency: 'usd',
        status: booking.payment_status === 'captured' ? 'paid' : 'pending',
        issued_at: new Date().toISOString(),
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
      })
      .select()
      .single()

    if (invoiceError) throw invoiceError

    // Update booking with invoice reference
    await supabase
      .from('bookings')
      .update({ invoice_id: invoice.id })
      .eq('id', bookingId)

    // Call Edge Function to create Stripe Invoice (if using Stripe Invoicing)
    try {
      await createStripeInvoice(invoice.id, booking)
    } catch (stripeError) {
      console.error('⚠️ Failed to create Stripe invoice:', stripeError)
      // Don't throw - invoice is still created in our database
    }

    console.log('✅ Invoice generated:', invoiceNumber)

    return invoice as Invoice
  } catch (error) {
    console.error('generateInvoiceOnCompletion error:', error)
    throw error
  }
}

/**
 * Create Stripe Invoice for professional PDF and email delivery
 */
async function createStripeInvoice(
  invoiceId: string,
  booking: any
): Promise<void> {
  try {
    // Call Edge Function to create Stripe Invoice
    const response = await fetch('/api/stripe/create-invoice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        invoiceId,
        booking
      })
    })

    if (!response.ok) {
      throw new Error('Failed to create Stripe invoice')
    }

    const data = await response.json()

    // Update invoice with Stripe details
    await supabase
      .from('invoices')
      .update({
        stripe_invoice_id: data.invoiceId,
        stripe_hosted_url: data.hostedInvoiceUrl,
        stripe_pdf_url: data.invoicePdf
      })
      .eq('id', invoiceId)

    console.log('✅ Stripe invoice created:', data.invoiceId)
  } catch (error) {
    console.error('createStripeInvoice error:', error)
    throw error
  }
}

/**
 * Generate unique invoice number (format: INV-YYYYMM-0001)
 */
async function generateInvoiceNumber(): Promise<string> {
  try {
    const { data, error } = await supabase
      .rpc('generate_invoice_number')

    if (error) {
      // Fallback if RPC fails
      const timestamp = Date.now()
      return `INV-${timestamp}`
    }

    return data
  } catch (error) {
    // Fallback
    const timestamp = Date.now()
    return `INV-${timestamp}`
  }
}

// =====================================================
// INVOICE RETRIEVAL
// =====================================================

/**
 * Get invoice by ID
 */
export async function getInvoiceById(
  invoiceId: string,
  userId: string
): Promise<InvoiceWithDetails> {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        booking:bookings(
          service_description,
          start_date,
          end_date
        ),
        client_profile:profiles!invoices_client_id_fkey(
          display_name,
          email,
          avatar_url
        ),
        freelancer_profile:profiles!invoices_freelancer_id_fkey(
          display_name,
          email,
          avatar_url
        )
      `)
      .eq('id', invoiceId)
      .single()

    if (error) throw error

    // Verify user is authorized
    if (data.client_id !== userId && data.freelancer_id !== userId) {
      throw new Error('Unauthorized: You are not part of this invoice')
    }

    return data as InvoiceWithDetails
  } catch (error) {
    console.error('getInvoiceById error:', error)
    throw error
  }
}

/**
 * Get invoice by booking ID
 */
export async function getInvoiceByBookingId(
  bookingId: string,
  userId: string
): Promise<InvoiceWithDetails | null> {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        booking:bookings(
          service_description,
          start_date,
          end_date
        ),
        client_profile:profiles!invoices_client_id_fkey(
          display_name,
          email,
          avatar_url
        ),
        freelancer_profile:profiles!invoices_freelancer_id_fkey(
          display_name,
          email,
          avatar_url
        )
      `)
      .eq('booking_id', bookingId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw error
    }

    // Verify user is authorized
    if (data.client_id !== userId && data.freelancer_id !== userId) {
      throw new Error('Unauthorized: You are not part of this invoice')
    }

    return data as InvoiceWithDetails
  } catch (error) {
    console.error('getInvoiceByBookingId error:', error)
    throw error
  }
}

/**
 * Get all invoices for a user (as client)
 */
export async function getClientInvoices(
  clientId: string
): Promise<InvoiceWithDetails[]> {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        booking:bookings(
          service_description,
          start_date,
          end_date
        ),
        freelancer_profile:profiles!invoices_freelancer_id_fkey(
          display_name,
          email,
          avatar_url
        )
      `)
      .eq('client_id', clientId)
      .order('issued_at', { ascending: false })

    if (error) throw error

    return data as InvoiceWithDetails[]
  } catch (error) {
    console.error('getClientInvoices error:', error)
    throw error
  }
}

/**
 * Get all invoices for a user (as freelancer)
 */
export async function getFreelancerInvoices(
  freelancerId: string
): Promise<InvoiceWithDetails[]> {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        booking:bookings(
          service_description,
          start_date,
          end_date
        ),
        client_profile:profiles!invoices_client_id_fkey(
          display_name,
          email,
          avatar_url
        )
      `)
      .eq('freelancer_id', freelancerId)
      .order('issued_at', { ascending: false })

    if (error) throw error

    return data as InvoiceWithDetails[]
  } catch (error) {
    console.error('getFreelancerInvoices error:', error)
    throw error
  }
}

/**
 * Get all invoices for a user (client OR freelancer)
 */
export async function getAllUserInvoices(
  userId: string
): Promise<InvoiceWithDetails[]> {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        booking:bookings(
          service_description,
          start_date,
          end_date
        ),
        client_profile:profiles!invoices_client_id_fkey(
          display_name,
          email,
          avatar_url
        ),
        freelancer_profile:profiles!invoices_freelancer_id_fkey(
          display_name,
          email,
          avatar_url
        )
      `)
      .or(`client_id.eq.${userId},freelancer_id.eq.${userId}`)
      .order('issued_at', { ascending: false })

    if (error) throw error

    return data as InvoiceWithDetails[]
  } catch (error) {
    console.error('getAllUserInvoices error:', error)
    throw error
  }
}

// =====================================================
// INVOICE STATUS UPDATES
// =====================================================

/**
 * Mark invoice as paid
 */
export async function markInvoiceAsPaid(
  invoiceId: string,
  paymentMethod?: string
): Promise<Invoice> {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .update({
        status: 'paid',
        payment_method: paymentMethod,
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', invoiceId)
      .select()
      .single()

    if (error) throw error

    console.log('✅ Invoice marked as paid:', invoiceId)

    return data as Invoice
  } catch (error) {
    console.error('markInvoiceAsPaid error:', error)
    throw error
  }
}

/**
 * Cancel invoice
 */
export async function cancelInvoice(
  invoiceId: string,
  userId: string
): Promise<Invoice> {
  try {
    // Get invoice to verify ownership
    const invoice = await getInvoiceById(invoiceId, userId)

    if (invoice.status !== 'pending') {
      throw new Error('Can only cancel pending invoices')
    }

    const { data, error } = await supabase
      .from('invoices')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', invoiceId)
      .select()
      .single()

    if (error) throw error

    console.log('✅ Invoice cancelled:', invoiceId)

    return data as Invoice
  } catch (error) {
    console.error('cancelInvoice error:', error)
    throw error
  }
}

// =====================================================
// INVOICE STATISTICS
// =====================================================

/**
 * Get invoice statistics for a user
 */
export async function getInvoiceStats(
  userId: string
): Promise<{
  as_client: {
    total: number
    pending: number
    paid: number
    total_spent: number
  }
  as_freelancer: {
    total: number
    pending: number
    paid: number
    total_earned: number
  }
}> {
  try {
    // Get client invoices
    const { data: clientInvoices } = await supabase
      .from('invoices')
      .select('status, total_amount')
      .eq('client_id', userId)

    // Get freelancer invoices
    const { data: freelancerInvoices } = await supabase
      .from('invoices')
      .select('status, freelancer_payout')
      .eq('freelancer_id', userId)

    const clientStats = {
      total: clientInvoices?.length || 0,
      pending: clientInvoices?.filter((i) => i.status === 'pending').length || 0,
      paid: clientInvoices?.filter((i) => i.status === 'paid').length || 0,
      total_spent: clientInvoices?.reduce((sum, i) => sum + (i.total_amount || 0), 0) || 0
    }

    const freelancerStats = {
      total: freelancerInvoices?.length || 0,
      pending: freelancerInvoices?.filter((i) => i.status === 'pending').length || 0,
      paid: freelancerInvoices?.filter((i) => i.status === 'paid').length || 0,
      total_earned: freelancerInvoices?.reduce((sum, i) => sum + (i.freelancer_payout || 0), 0) || 0
    }

    return {
      as_client: clientStats,
      as_freelancer: freelancerStats
    }
  } catch (error) {
    console.error('getInvoiceStats error:', error)
    throw error
  }
}

// =====================================================
// PDF GENERATION (Optional - if not using Stripe)
// =====================================================

/**
 * Download invoice PDF
 * If using Stripe Invoicing, this redirects to Stripe's PDF
 * Otherwise, generate custom PDF
 */
export async function downloadInvoicePDF(
  invoiceId: string,
  userId: string
): Promise<string> {
  try {
    const invoice = await getInvoiceById(invoiceId, userId)

    // If Stripe PDF exists, return that URL
    if (invoice.stripe_pdf_url) {
      return invoice.stripe_pdf_url
    }

    // Otherwise, call Edge Function to generate custom PDF
    const response = await fetch('/api/invoices/generate-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invoiceId })
    })

    if (!response.ok) {
      throw new Error('Failed to generate PDF')
    }

    const data = await response.json()
    return data.pdfUrl
  } catch (error) {
    console.error('downloadInvoicePDF error:', error)
    throw error
  }
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

/**
 * Format amount from cents to currency string
 */
export function formatInvoiceAmount(cents: number, currency: string = 'USD'): string {
  const dollars = cents / 100
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(dollars)
}

/**
 * Get invoice status badge color
 */
export function getInvoiceStatusColor(status: string): string {
  switch (status) {
    case 'paid':
      return 'green'
    case 'pending':
      return 'yellow'
    case 'cancelled':
      return 'gray'
    case 'refunded':
      return 'red'
    default:
      return 'gray'
  }
}

// =====================================================
// EXPORTS
// =====================================================

export default {
  generateInvoiceOnCompletion,
  getInvoiceById,
  getInvoiceByBookingId,
  getClientInvoices,
  getFreelancerInvoices,
  getAllUserInvoices,
  markInvoiceAsPaid,
  cancelInvoice,
  getInvoiceStats,
  downloadInvoicePDF,
  formatInvoiceAmount,
  getInvoiceStatusColor
}
