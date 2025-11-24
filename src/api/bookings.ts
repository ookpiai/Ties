/**
 * BOOKINGS API LAYER
 * Phase 4A - Day 26
 *
 * Handles all booking operations for Workflow 1 (Direct Booking)
 * Integrates with calendar API for automatic date blocking/releasing
 */

import { supabase } from '../lib/supabase'
import { blockDatesForBooking, releaseDatesForBooking } from './availability'
import {
  sendBookingRequestEmail,
  sendBookingAcceptedEmail,
  sendBookingDeclinedEmail,
  sendBookingCancelledEmail,
  sendBookingCompletedEmail
} from './emails'
import { generateInvoiceOnCompletion } from './invoices'
import { capturePayment } from './payments'

// =====================================================
// TYPESCRIPT INTERFACES
// =====================================================

export type BookingStatus =
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'paid'

export interface Booking {
  id: string
  client_id: string
  freelancer_id: string
  start_date: string
  end_date: string
  status: BookingStatus
  total_amount: number
  service_description: string
  client_message?: string | null
  freelancer_response?: string | null
  cancellation_reason?: string | null
  stripe_payment_intent_id?: string | null
  stripe_connected_account_id?: string | null
  commission_amount?: number | null
  payout_status?: string | null
  created_at: string
  updated_at: string
  accepted_at?: string | null
  completed_at?: string | null
  cancelled_at?: string | null
  // Joined data from profiles table
  client_profile?: any
  freelancer_profile?: any
}

export interface CreateBookingParams {
  freelancer_id: string
  start_date: Date
  end_date: Date
  total_amount: number
  service_description: string
  client_message?: string
}

export interface BookingStats {
  as_client: {
    total: number
    pending: number
    accepted: number
    in_progress: number
    completed: number
    total_spent: number
  }
  as_freelancer: {
    total: number
    pending: number
    accepted: number
    in_progress: number
    completed: number
    total_earned: number
  }
}

// =====================================================
// CREATE BOOKING
// =====================================================

/**
 * Create a new booking request
 * Phase 4A: No payment processing (that's Phase 4B)
 * Phase 4B: Will add Stripe Payment Intent creation
 */
export async function createBooking(
  params: CreateBookingParams
): Promise<Booking> {
  try {
    // Get current user ID (client)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    // Validate dates
    if (params.start_date >= params.end_date) {
      throw new Error('End date must be after start date')
    }

    // Check if dates are available (prevent double-booking)
    const { data: hasOverlap, error: overlapError } = await supabase
      .rpc('check_booking_overlap', {
        p_freelancer_id: params.freelancer_id,
        p_start_date: params.start_date.toISOString(),
        p_end_date: params.end_date.toISOString(),
        p_exclude_booking_id: null
      })

    if (overlapError) {
      console.error('Overlap check failed:', overlapError)
      throw new Error('Failed to check availability')
    }

    if (hasOverlap) {
      throw new Error('These dates are not available. Please choose different dates.')
    }

    // Create booking record
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        client_id: user.id,
        freelancer_id: params.freelancer_id,
        start_date: params.start_date.toISOString(),
        end_date: params.end_date.toISOString(),
        total_amount: params.total_amount,
        service_description: params.service_description,
        client_message: params.client_message || null,
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to create booking:', error)
      throw error
    }

    // Send email notification to freelancer
    try {
      const { data: freelancerProfile } = await supabase
        .from('profiles')
        .select('display_name, email')
        .eq('id', params.freelancer_id)
        .single()

      const { data: clientProfile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', user.id)
        .single()

      if (freelancerProfile && clientProfile) {
        await sendBookingRequestEmail({
          freelancerEmail: freelancerProfile.email,
          freelancerName: freelancerProfile.display_name,
          clientName: clientProfile.display_name,
          startDate: new Date(data.start_date).toLocaleDateString('en-AU', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
          }),
          endDate: new Date(data.end_date).toLocaleDateString('en-AU', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
          }),
          rate: `$${params.total_amount.toFixed(2)}`,
          bookingUrl: `${window.location.origin}/bookings/${data.id}`
        })
        console.log('✅ Booking request email sent to freelancer')
      }
    } catch (emailError) {
      console.error('⚠️ Failed to send booking request email:', emailError)
      // Don't throw - booking is still created
    }

    return data as Booking
  } catch (error) {
    console.error('createBooking error:', error)
    throw error
  }
}

// =====================================================
// GET BOOKINGS
// =====================================================

/**
 * Get all bookings for a user (as client or freelancer)
 */
export async function getBookings(
  userId: string,
  role: 'client' | 'freelancer' | 'both' = 'both'
): Promise<Booking[]> {
  try {
    let query = supabase
      .from('bookings')
      .select(`
        *,
        client_profile:profiles!bookings_client_id_fkey(
          id,
          display_name,
          avatar_url,
          role
        ),
        freelancer_profile:profiles!bookings_freelancer_id_fkey(
          id,
          display_name,
          avatar_url,
          role
        )
      `)
      .order('start_date', { ascending: false })

    // Filter by role
    if (role === 'client') {
      query = query.eq('client_id', userId)
    } else if (role === 'freelancer') {
      query = query.eq('freelancer_id', userId)
    } else {
      // Both: client OR freelancer
      query = query.or(`client_id.eq.${userId},freelancer_id.eq.${userId}`)
    }

    const { data, error } = await query

    if (error) {
      console.error('Failed to fetch bookings:', error)
      throw error
    }

    return data as Booking[]
  } catch (error) {
    console.error('getBookings error:', error)
    throw error
  }
}

// =====================================================
// GET BOOKING BY ID
// =====================================================

/**
 * Get a single booking by ID
 * Verifies user is authorized (client or freelancer)
 */
export async function getBookingById(
  bookingId: string,
  userId: string
): Promise<Booking> {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        client_profile:profiles!bookings_client_id_fkey(
          id,
          display_name,
          avatar_url,
          role,
          bio
        ),
        freelancer_profile:profiles!bookings_freelancer_id_fkey(
          id,
          display_name,
          avatar_url,
          role,
          bio
        )
      `)
      .eq('id', bookingId)
      .single()

    if (error) {
      console.error('Failed to fetch booking:', error)
      throw error
    }

    // Verify user is authorized
    if (data.client_id !== userId && data.freelancer_id !== userId) {
      throw new Error('Unauthorized: You are not part of this booking')
    }

    return data as Booking
  } catch (error) {
    console.error('getBookingById error:', error)
    throw error
  }
}

// =====================================================
// ACCEPT BOOKING
// =====================================================

/**
 * Freelancer accepts a booking request
 * Automatically blocks calendar dates
 */
export async function acceptBooking(
  bookingId: string,
  userId: string,
  response?: string
): Promise<Booking> {
  try {
    // Fetch booking to verify
    const booking = await getBookingById(bookingId, userId)

    // Verify user is the freelancer
    if (booking.freelancer_id !== userId) {
      throw new Error('Only the freelancer can accept this booking')
    }

    // Verify status is pending
    if (booking.status !== 'pending') {
      throw new Error(`Cannot accept booking with status: ${booking.status}`)
    }

    // Update booking status to accepted
    const { data, error } = await supabase
      .from('bookings')
      .update({
        status: 'accepted',
        freelancer_response: response || null,
        accepted_at: new Date().toISOString()
      })
      .eq('id', bookingId)
      .select()
      .single()

    if (error) {
      console.error('Failed to accept booking:', error)
      throw error
    }

    // 🔗 AUTO-BLOCK CALENDAR DATES
    try {
      await blockDatesForBooking(
        userId,
        bookingId,
        new Date(booking.start_date),
        new Date(booking.end_date)
      )
      console.log('✅ Calendar dates blocked automatically')
    } catch (calendarError) {
      console.error('⚠️ Failed to block calendar dates:', calendarError)
      // Don't throw - booking is still accepted, just warn
      // Could add a flag to retry later
    }

    // Send email notification to client
    try {
      const { data: clientProfile } = await supabase
        .from('profiles')
        .select('display_name, email')
        .eq('id', booking.client_id)
        .single()

      const { data: freelancerProfile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', userId)
        .single()

      if (clientProfile && freelancerProfile) {
        await sendBookingAcceptedEmail({
          clientEmail: clientProfile.email,
          clientName: clientProfile.display_name,
          freelancerName: freelancerProfile.display_name,
          startDate: new Date(booking.start_date).toLocaleDateString('en-AU', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
          }),
          endDate: new Date(booking.end_date).toLocaleDateString('en-AU', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
          }),
          bookingUrl: `${window.location.origin}/bookings/${bookingId}`
        })
        console.log('✅ Booking accepted email sent to client')
      }
    } catch (emailError) {
      console.error('⚠️ Failed to send booking accepted email:', emailError)
      // Don't throw - booking is still accepted
    }

    return data as Booking
  } catch (error) {
    console.error('acceptBooking error:', error)
    throw error
  }
}

// =====================================================
// DECLINE BOOKING
// =====================================================

/**
 * Freelancer declines a booking request
 */
export async function declineBooking(
  bookingId: string,
  userId: string,
  reason?: string
): Promise<Booking> {
  try {
    // Fetch booking to verify
    const booking = await getBookingById(bookingId, userId)

    // Verify user is the freelancer
    if (booking.freelancer_id !== userId) {
      throw new Error('Only the freelancer can decline this booking')
    }

    // Verify status is pending
    if (booking.status !== 'pending') {
      throw new Error(`Cannot decline booking with status: ${booking.status}`)
    }

    // Update booking status to declined
    const { data, error } = await supabase
      .from('bookings')
      .update({
        status: 'declined',
        freelancer_response: reason || 'Declined by freelancer'
      })
      .eq('id', bookingId)
      .select()
      .single()

    if (error) {
      console.error('Failed to decline booking:', error)
      throw error
    }

    // Send email notification to client
    try {
      const { data: clientProfile } = await supabase
        .from('profiles')
        .select('display_name, email')
        .eq('id', booking.client_id)
        .single()

      const { data: freelancerProfile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', userId)
        .single()

      if (clientProfile && freelancerProfile) {
        await sendBookingDeclinedEmail({
          clientEmail: clientProfile.email,
          clientName: clientProfile.display_name,
          freelancerName: freelancerProfile.display_name,
          discoverUrl: `${window.location.origin}/discover`
        })
        console.log('✅ Booking declined email sent to client')
      }
    } catch (emailError) {
      console.error('⚠️ Failed to send booking declined email:', emailError)
      // Don't throw - booking is still declined
    }

    return data as Booking
  } catch (error) {
    console.error('declineBooking error:', error)
    throw error
  }
}

// =====================================================
// CANCEL BOOKING
// =====================================================

/**
 * Cancel a booking (either party can cancel)
 * Automatically releases calendar dates if booking was accepted
 */
export async function cancelBooking(
  bookingId: string,
  userId: string,
  reason: string
): Promise<Booking> {
  try {
    // Fetch booking to verify
    const booking = await getBookingById(bookingId, userId)

    // Verify user is client or freelancer
    if (booking.client_id !== userId && booking.freelancer_id !== userId) {
      throw new Error('Only booking parties can cancel')
    }

    // Verify booking can be cancelled
    if (['declined', 'cancelled', 'completed', 'paid'].includes(booking.status)) {
      throw new Error(`Cannot cancel booking with status: ${booking.status}`)
    }

    // Update booking status to cancelled
    const { data, error } = await supabase
      .from('bookings')
      .update({
        status: 'cancelled',
        cancellation_reason: reason,
        cancelled_at: new Date().toISOString()
      })
      .eq('id', bookingId)
      .select()
      .single()

    if (error) {
      console.error('Failed to cancel booking:', error)
      throw error
    }

    // 🔗 AUTO-RELEASE CALENDAR DATES (if booking was accepted)
    if (booking.status === 'accepted' || booking.status === 'in_progress') {
      try {
        await releaseDatesForBooking(bookingId)
        console.log('✅ Calendar dates released automatically')
      } catch (calendarError) {
        console.error('⚠️ Failed to release calendar dates:', calendarError)
        // Don't throw - booking is still cancelled
      }
    }

    // Send email notification to the other party
    try {
      const otherPartyId = userId === booking.client_id ? booking.freelancer_id : booking.client_id
      const { data: otherPartyProfile } = await supabase
        .from('profiles')
        .select('display_name, email')
        .eq('id', otherPartyId)
        .single()

      const { data: cancellerProfile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', userId)
        .single()

      if (otherPartyProfile && cancellerProfile) {
        await sendBookingCancelledEmail({
          recipientEmail: otherPartyProfile.email,
          recipientName: otherPartyProfile.display_name,
          cancelledBy: cancellerProfile.display_name,
          startDate: new Date(booking.start_date).toLocaleDateString('en-AU', {
            month: 'short', day: 'numeric', year: 'numeric'
          }),
          endDate: new Date(booking.end_date).toLocaleDateString('en-AU', {
            month: 'short', day: 'numeric', year: 'numeric'
          }),
          bookingUrl: `${window.location.origin}/bookings/${bookingId}`
        })
        console.log('✅ Booking cancelled email sent to other party')
      }
    } catch (emailError) {
      console.error('⚠️ Failed to send booking cancelled email:', emailError)
      // Don't throw - booking is still cancelled
    }

    return data as Booking
  } catch (error) {
    console.error('cancelBooking error:', error)
    throw error
  }
}

// =====================================================
// COMPLETE BOOKING
// =====================================================

/**
 * Mark booking as complete
 * Either party can complete after end_date
 * Phase 4B: Will trigger automatic payout
 */
export async function completeBooking(
  bookingId: string,
  userId: string
): Promise<Booking> {
  try {
    // Fetch booking to verify
    const booking = await getBookingById(bookingId, userId)

    // Verify user is client or freelancer
    if (booking.client_id !== userId && booking.freelancer_id !== userId) {
      throw new Error('Only booking parties can complete')
    }

    // Verify status allows completion
    if (!['accepted', 'in_progress'].includes(booking.status)) {
      throw new Error(`Cannot complete booking with status: ${booking.status}`)
    }

    // Verify end_date has passed
    const endDate = new Date(booking.end_date)
    const now = new Date()
    if (endDate > now) {
      throw new Error('Cannot complete booking before end date')
    }

    // Update booking status to completed
    const { data, error } = await supabase
      .from('bookings')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', bookingId)
      .select()
      .single()

    if (error) {
      console.error('Failed to complete booking:', error)
      throw error
    }

    // 💰 PHASE 1: Automatic Invoice Generation & Payment Capture
    try {
      // Generate invoice automatically
      const invoice = await generateInvoiceOnCompletion(bookingId)
      console.log('✅ Invoice generated:', invoice.invoice_number)

      // If payment was authorized, capture it now
      if (booking.stripe_payment_intent_id && booking.payment_status === 'authorized') {
        await capturePayment(bookingId, booking.stripe_payment_intent_id)
        console.log('✅ Payment captured')
      }
    } catch (paymentError) {
      console.error('⚠️ Failed to process payment/invoice:', paymentError)
      // Don't throw - booking is still completed, just log the error
      // You may want to implement retry logic or manual intervention
    }

    // Send email notifications to both parties
    try {
      const { data: clientProfile } = await supabase
        .from('profiles')
        .select('display_name, email')
        .eq('id', booking.client_id)
        .single()

      const { data: freelancerProfile } = await supabase
        .from('profiles')
        .select('display_name, email')
        .eq('id', booking.freelancer_id)
        .single()

      if (clientProfile && freelancerProfile) {
        // Email to client
        await sendBookingCompletedEmail({
          recipientEmail: clientProfile.email,
          recipientName: clientProfile.display_name,
          otherPartyName: freelancerProfile.display_name,
          reviewUrl: `${window.location.origin}/bookings/${bookingId}?review=true`
        })

        // Email to freelancer
        await sendBookingCompletedEmail({
          recipientEmail: freelancerProfile.email,
          recipientName: freelancerProfile.display_name,
          otherPartyName: clientProfile.display_name,
          reviewUrl: `${window.location.origin}/bookings/${bookingId}?review=true`
        })

        console.log('✅ Booking completed emails sent to both parties')
      }
    } catch (emailError) {
      console.error('⚠️ Failed to send booking completed emails:', emailError)
      // Don't throw - booking is still completed
    }

    return data as Booking
  } catch (error) {
    console.error('completeBooking error:', error)
    throw error
  }
}

// =====================================================
// GET UPCOMING BOOKINGS
// =====================================================

/**
 * Get upcoming bookings for a user (next 30 days)
 * Only returns accepted and in_progress bookings
 */
export async function getUpcomingBookings(userId: string): Promise<Booking[]> {
  try {
    const today = new Date()
    const thirtyDaysLater = new Date()
    thirtyDaysLater.setDate(today.getDate() + 30)

    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        client_profile:profiles!bookings_client_id_fkey(
          id,
          display_name,
          avatar_url
        ),
        freelancer_profile:profiles!bookings_freelancer_id_fkey(
          id,
          display_name,
          avatar_url
        )
      `)
      .or(`client_id.eq.${userId},freelancer_id.eq.${userId}`)
      .gte('start_date', today.toISOString())
      .lte('start_date', thirtyDaysLater.toISOString())
      .in('status', ['accepted', 'in_progress'])
      .order('start_date', { ascending: true })

    if (error) {
      console.error('Failed to fetch upcoming bookings:', error)
      throw error
    }

    return data as Booking[]
  } catch (error) {
    console.error('getUpcomingBookings error:', error)
    throw error
  }
}

// =====================================================
// GET BOOKING STATISTICS
// =====================================================

/**
 * Get booking statistics for dashboard
 * Uses the Postgres function created in migration
 */
export async function getBookingStats(userId: string): Promise<BookingStats> {
  try {
    const { data, error } = await supabase
      .rpc('get_booking_stats', {
        p_user_id: userId
      })

    if (error) {
      console.error('Failed to fetch booking stats:', error)
      throw error
    }

    return data as BookingStats
  } catch (error) {
    console.error('getBookingStats error:', error)
    throw error
  }
}

// =====================================================
// HELPER: Update Booking Status (Admin/System Use)
// =====================================================

/**
 * Update booking status (for system processes)
 * Not exposed directly to users - used internally
 * Example: Auto-update status from "accepted" to "in_progress" on start_date
 */
export async function updateBookingStatus(
  bookingId: string,
  newStatus: BookingStatus
): Promise<void> {
  try {
    const { error } = await supabase
      .from('bookings')
      .update({ status: newStatus })
      .eq('id', bookingId)

    if (error) {
      console.error('Failed to update booking status:', error)
      throw error
    }

    console.log(`Booking ${bookingId} status updated to: ${newStatus}`)
  } catch (error) {
    console.error('updateBookingStatus error:', error)
    throw error
  }
}

// =====================================================
// EXPORTS
// =====================================================

export default {
  createBooking,
  getBookings,
  getBookingById,
  acceptBooking,
  declineBooking,
  cancelBooking,
  completeBooking,
  getUpcomingBookings,
  getBookingStats,
  updateBookingStatus
}
