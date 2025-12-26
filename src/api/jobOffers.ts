import { supabase } from '../lib/supabase'

// ============================================
// TYPES
// ============================================

export type JobOfferStatus = 'pending' | 'viewed' | 'accepted' | 'rejected' | 'withdrawn' | 'countered' | 'expired'
export type BudgetType = 'fixed' | 'hourly' | 'negotiable'
export type RoleType = 'freelancer' | 'vendor' | 'venue'

export interface JobOffer {
  id: string
  sender_id: string
  recipient_id: string
  message_id?: string | null

  // Offer details
  title: string
  description: string
  event_type?: string | null
  location?: string | null

  // Dates
  event_date?: string | null
  start_time?: string | null
  end_time?: string | null

  // Compensation
  budget_type: BudgetType
  budget_amount?: number | null
  budget_currency: string

  // Role
  role_type?: RoleType | null
  role_title?: string | null
  required_skills?: string[] | null

  // Status
  status: JobOfferStatus
  response_message?: string | null
  responded_at?: string | null
  expires_at?: string | null

  // Conversion
  converted_to_booking_id?: string | null
  original_offer_id?: string | null

  // Timestamps
  created_at: string
  updated_at: string

  // Joined data
  sender?: {
    id: string
    display_name: string
    avatar_url: string | null
    role: string
  }
  recipient?: {
    id: string
    display_name: string
    avatar_url: string | null
    role: string
  }
}

export interface CreateJobOfferInput {
  recipientId: string
  title: string
  description: string
  eventType?: string
  location?: string
  eventDate?: string
  startTime?: string
  endTime?: string
  budgetType: BudgetType
  budgetAmount?: number
  roleType?: RoleType
  roleTitle?: string
  requiredSkills?: string[]
  expiresInDays?: number
}

// ============================================
// HELPER FUNCTIONS
// ============================================

async function getCurrentUserId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  return user.id
}

// ============================================
// JOB OFFER CRUD
// ============================================

/**
 * Send a job offer to another user
 * Also creates/updates the message conversation
 */
export async function sendJobOffer(
  input: CreateJobOfferInput
): Promise<{ success: boolean; data?: JobOffer; messageId?: string; error?: string }> {
  try {
    const senderId = await getCurrentUserId()

    // Calculate expiration date if specified
    let expiresAt: string | null = null
    if (input.expiresInDays && input.expiresInDays > 0) {
      const expDate = new Date()
      expDate.setDate(expDate.getDate() + input.expiresInDays)
      expiresAt = expDate.toISOString()
    }

    // Create the job offer
    const { data: offer, error: offerError } = await supabase
      .from('job_offers')
      .insert({
        sender_id: senderId,
        recipient_id: input.recipientId,
        title: input.title,
        description: input.description,
        event_type: input.eventType || null,
        location: input.location || null,
        event_date: input.eventDate || null,
        start_time: input.startTime || null,
        end_time: input.endTime || null,
        budget_type: input.budgetType,
        budget_amount: input.budgetAmount || null,
        budget_currency: 'AUD',
        role_type: input.roleType || null,
        role_title: input.roleTitle || null,
        required_skills: input.requiredSkills || null,
        expires_at: expiresAt,
        status: 'pending'
      })
      .select()
      .single()

    if (offerError) throw offerError

    // Create a message with the job offer attached
    const { data: message, error: msgError } = await supabase
      .from('messages')
      .insert({
        from_id: senderId,
        to_id: input.recipientId,
        body: `[Job Offer] ${input.title}`,
        message_type: 'job_offer',
        job_offer_id: offer.id,
        context_type: 'job_offer'
      })
      .select()
      .single()

    if (msgError) {
      console.error('Failed to create message for job offer:', msgError)
      // Don't fail the whole operation, the offer was created
    }

    // Update the offer with the message_id
    if (message) {
      await supabase
        .from('job_offers')
        .update({ message_id: message.id })
        .eq('id', offer.id)
    }

    // Create notification for recipient
    await supabase.from('notifications').insert({
      user_id: input.recipientId,
      type: 'job_offer_received',
      title: 'New Job Offer',
      message: `You received a job offer: ${input.title}`,
      data: { offer_id: offer.id, sender_id: senderId },
      link: '/messages'
    })

    return { success: true, data: offer, messageId: message?.id }
  } catch (error: any) {
    console.error('Error sending job offer:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get all job offers received by the current user
 */
export async function getReceivedOffers(
  status?: JobOfferStatus
): Promise<{ success: boolean; data: JobOffer[]; error?: string }> {
  try {
    const userId = await getCurrentUserId()

    let query = supabase
      .from('job_offers')
      .select(`
        *,
        sender:profiles!job_offers_sender_id_fkey(id, display_name, avatar_url, role)
      `)
      .eq('recipient_id', userId)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) throw error

    return { success: true, data: data || [] }
  } catch (error: any) {
    console.error('Error getting received offers:', error)
    return { success: false, data: [], error: error.message }
  }
}

/**
 * Get all job offers sent by the current user
 */
export async function getSentOffers(
  status?: JobOfferStatus
): Promise<{ success: boolean; data: JobOffer[]; error?: string }> {
  try {
    const userId = await getCurrentUserId()

    let query = supabase
      .from('job_offers')
      .select(`
        *,
        recipient:profiles!job_offers_recipient_id_fkey(id, display_name, avatar_url, role)
      `)
      .eq('sender_id', userId)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) throw error

    return { success: true, data: data || [] }
  } catch (error: any) {
    console.error('Error getting sent offers:', error)
    return { success: false, data: [], error: error.message }
  }
}

/**
 * Get a single job offer by ID
 */
export async function getJobOffer(
  offerId: string
): Promise<{ success: boolean; data?: JobOffer; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('job_offers')
      .select(`
        *,
        sender:profiles!job_offers_sender_id_fkey(id, display_name, avatar_url, role),
        recipient:profiles!job_offers_recipient_id_fkey(id, display_name, avatar_url, role)
      `)
      .eq('id', offerId)
      .single()

    if (error) throw error

    return { success: true, data }
  } catch (error: any) {
    console.error('Error getting job offer:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Mark an offer as viewed (recipient only)
 */
export async function markOfferViewed(
  offerId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = await getCurrentUserId()

    const { error } = await supabase
      .from('job_offers')
      .update({ status: 'viewed' })
      .eq('id', offerId)
      .eq('recipient_id', userId)
      .eq('status', 'pending')

    if (error) throw error

    return { success: true }
  } catch (error: any) {
    console.error('Error marking offer as viewed:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Accept a job offer (recipient only)
 */
export async function acceptJobOffer(
  offerId: string,
  responseMessage?: string
): Promise<{ success: boolean; data?: JobOffer; error?: string }> {
  try {
    const userId = await getCurrentUserId()

    const { data, error } = await supabase
      .from('job_offers')
      .update({
        status: 'accepted',
        response_message: responseMessage || null,
        responded_at: new Date().toISOString()
      })
      .eq('id', offerId)
      .eq('recipient_id', userId)
      .in('status', ['pending', 'viewed'])
      .select(`
        *,
        sender:profiles!job_offers_sender_id_fkey(id, display_name, avatar_url, role)
      `)
      .single()

    if (error) throw error

    // Create notification for sender
    await supabase.from('notifications').insert({
      user_id: data.sender_id,
      type: 'job_offer_accepted',
      title: 'Job Offer Accepted!',
      message: `Your job offer "${data.title}" was accepted`,
      data: { offer_id: offerId },
      link: '/messages'
    })

    // Send acceptance message in conversation
    await supabase.from('messages').insert({
      from_id: userId,
      to_id: data.sender_id,
      body: responseMessage || `I've accepted your job offer: ${data.title}`,
      message_type: 'text',
      context_type: 'job_offer_response'
    })

    return { success: true, data }
  } catch (error: any) {
    console.error('Error accepting job offer:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Reject a job offer (recipient only)
 */
export async function rejectJobOffer(
  offerId: string,
  responseMessage?: string
): Promise<{ success: boolean; data?: JobOffer; error?: string }> {
  try {
    const userId = await getCurrentUserId()

    const { data, error } = await supabase
      .from('job_offers')
      .update({
        status: 'rejected',
        response_message: responseMessage || null,
        responded_at: new Date().toISOString()
      })
      .eq('id', offerId)
      .eq('recipient_id', userId)
      .in('status', ['pending', 'viewed'])
      .select(`
        *,
        sender:profiles!job_offers_sender_id_fkey(id, display_name, avatar_url, role)
      `)
      .single()

    if (error) throw error

    // Create notification for sender
    await supabase.from('notifications').insert({
      user_id: data.sender_id,
      type: 'job_offer_rejected',
      title: 'Job Offer Declined',
      message: `Your job offer "${data.title}" was declined`,
      data: { offer_id: offerId },
      link: '/messages'
    })

    return { success: true, data }
  } catch (error: any) {
    console.error('Error rejecting job offer:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Withdraw a job offer (sender only, pending offers only)
 */
export async function withdrawJobOffer(
  offerId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = await getCurrentUserId()

    const { data, error } = await supabase
      .from('job_offers')
      .update({ status: 'withdrawn' })
      .eq('id', offerId)
      .eq('sender_id', userId)
      .eq('status', 'pending')
      .select('recipient_id, title')
      .single()

    if (error) throw error

    // Create notification for recipient
    await supabase.from('notifications').insert({
      user_id: data.recipient_id,
      type: 'job_offer_withdrawn',
      title: 'Job Offer Withdrawn',
      message: `A job offer "${data.title}" was withdrawn`,
      data: { offer_id: offerId },
      link: '/messages'
    })

    return { success: true }
  } catch (error: any) {
    console.error('Error withdrawing job offer:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Counter a job offer with new terms (recipient only)
 * Creates a new offer as a counter
 */
export async function counterJobOffer(
  originalOfferId: string,
  counterInput: Omit<CreateJobOfferInput, 'recipientId'>
): Promise<{ success: boolean; data?: JobOffer; error?: string }> {
  try {
    const userId = await getCurrentUserId()

    // Get the original offer
    const { data: original, error: fetchError } = await supabase
      .from('job_offers')
      .select('*')
      .eq('id', originalOfferId)
      .eq('recipient_id', userId)
      .in('status', ['pending', 'viewed'])
      .single()

    if (fetchError) throw fetchError

    // Mark original as countered
    await supabase
      .from('job_offers')
      .update({ status: 'countered', responded_at: new Date().toISOString() })
      .eq('id', originalOfferId)

    // Create counter offer (swap sender/recipient)
    const result = await sendJobOffer({
      ...counterInput,
      recipientId: original.sender_id
    })

    if (!result.success) throw new Error(result.error)

    // Link the counter offer to original
    if (result.data) {
      await supabase
        .from('job_offers')
        .update({ original_offer_id: originalOfferId })
        .eq('id', result.data.id)
    }

    return { success: true, data: result.data }
  } catch (error: any) {
    console.error('Error countering job offer:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Convert an accepted offer to a booking
 */
export async function convertOfferToBooking(
  offerId: string
): Promise<{ success: boolean; bookingId?: string; error?: string }> {
  try {
    const userId = await getCurrentUserId()

    // Get the accepted offer
    const { data: offer, error: fetchError } = await supabase
      .from('job_offers')
      .select('*')
      .eq('id', offerId)
      .eq('status', 'accepted')
      .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
      .single()

    if (fetchError) throw fetchError

    // Determine client and provider
    // The sender is typically the client (person hiring)
    // The recipient is the provider (person being hired)
    const clientId = offer.sender_id
    const providerId = offer.recipient_id

    // Create the booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        client_id: clientId,
        provider_id: providerId,
        event_name: offer.title,
        event_date: offer.event_date,
        start_time: offer.start_time,
        end_time: offer.end_time,
        location: offer.location,
        notes: offer.description,
        total_amount: offer.budget_amount,
        status: 'confirmed',
        source: 'job_offer',
        source_id: offerId
      })
      .select()
      .single()

    if (bookingError) throw bookingError

    // Update offer with booking reference
    await supabase
      .from('job_offers')
      .update({ converted_to_booking_id: booking.id })
      .eq('id', offerId)

    // Notify both parties
    const notifications = [
      {
        user_id: clientId,
        type: 'booking_created',
        title: 'Booking Created',
        message: `Your booking for "${offer.title}" has been created`,
        data: { booking_id: booking.id, offer_id: offerId },
        link: `/bookings/${booking.id}`
      },
      {
        user_id: providerId,
        type: 'booking_created',
        title: 'New Booking',
        message: `You have a new booking for "${offer.title}"`,
        data: { booking_id: booking.id, offer_id: offerId },
        link: `/bookings/${booking.id}`
      }
    ]

    await supabase.from('notifications').insert(notifications)

    return { success: true, bookingId: booking.id }
  } catch (error: any) {
    console.error('Error converting offer to booking:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get offers summary (counts by status) for current user
 */
export async function getOffersSummary(): Promise<{
  success: boolean
  data?: {
    received: { total: number; pending: number; accepted: number; rejected: number }
    sent: { total: number; pending: number; accepted: number; rejected: number }
  }
  error?: string
}> {
  try {
    const userId = await getCurrentUserId()

    // Get received offers
    const { data: received, error: recvError } = await supabase
      .from('job_offers')
      .select('status')
      .eq('recipient_id', userId)

    if (recvError) throw recvError

    // Get sent offers
    const { data: sent, error: sentError } = await supabase
      .from('job_offers')
      .select('status')
      .eq('sender_id', userId)

    if (sentError) throw sentError

    const countByStatus = (offers: any[], status: string) =>
      offers.filter(o => o.status === status).length

    return {
      success: true,
      data: {
        received: {
          total: received.length,
          pending: countByStatus(received, 'pending') + countByStatus(received, 'viewed'),
          accepted: countByStatus(received, 'accepted'),
          rejected: countByStatus(received, 'rejected')
        },
        sent: {
          total: sent.length,
          pending: countByStatus(sent, 'pending') + countByStatus(sent, 'viewed'),
          accepted: countByStatus(sent, 'accepted'),
          rejected: countByStatus(sent, 'rejected')
        }
      }
    }
  } catch (error: any) {
    console.error('Error getting offers summary:', error)
    return { success: false, error: error.message }
  }
}
