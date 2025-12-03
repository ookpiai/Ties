/**
 * REVIEWS & RATINGS API
 * Phase 6: Trust & Reputation System
 *
 * Handles review creation, display, and rating management
 */

import { supabase } from '../lib/supabase'

// ============================================
// TYPES
// ============================================

export interface Review {
  id: string
  about_user_id: string
  by_user_id: string
  booking_id?: string
  job_id?: string
  rating: number
  communication_rating?: number
  professionalism_rating?: number
  quality_rating?: number
  value_rating?: number
  title?: string
  text?: string
  review_type: 'booking' | 'job' | 'general'
  service_provided?: string
  response_text?: string
  response_at?: string
  is_public: boolean
  is_verified: boolean
  helpful_count: number
  created_at: string
  updated_at: string
  // Joined data
  reviewer?: {
    id: string
    display_name: string
    avatar_url?: string
    role?: string
  }
  reviewed_user?: {
    id: string
    display_name: string
    avatar_url?: string
    role?: string
  }
  booking?: any
}

export interface ProfileRating {
  user_id: string
  average_rating: number
  total_reviews: number
  rating_distribution: {
    '1': number
    '2': number
    '3': number
    '4': number
    '5': number
  }
  avg_communication?: number
  avg_professionalism?: number
  avg_quality?: number
  avg_value?: number
  last_review_at?: string
}

export interface CreateReviewParams {
  about_user_id: string
  booking_id?: string
  job_id?: string
  rating: number
  communication_rating?: number
  professionalism_rating?: number
  quality_rating?: number
  value_rating?: number
  title?: string
  text?: string
  review_type?: 'booking' | 'job' | 'general'
  service_provided?: string
}

// ============================================
// GET REVIEWS
// ============================================

/**
 * Get all reviews for a user (as reviewed)
 */
export async function getReviewsForUser(userId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      reviewer:profiles!reviews_by_user_id_fkey(id, display_name, avatar_url, role),
      booking:bookings(id, start_date, end_date, service_description)
    `)
    .eq('about_user_id', userId)
    .eq('is_public', true)
    .eq('moderation_status', 'approved')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching reviews:', error)
    throw error
  }

  return data as Review[]
}

/**
 * Get reviews written by a user
 */
export async function getReviewsByUser(userId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      reviewed_user:profiles!reviews_about_user_id_fkey(id, display_name, avatar_url, role),
      booking:bookings(id, start_date, end_date, service_description)
    `)
    .eq('by_user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching reviews by user:', error)
    throw error
  }

  return data as Review[]
}

/**
 * Get a single review by ID
 */
export async function getReviewById(reviewId: string): Promise<Review | null> {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      reviewer:profiles!reviews_by_user_id_fkey(id, display_name, avatar_url, role),
      reviewed_user:profiles!reviews_about_user_id_fkey(id, display_name, avatar_url, role),
      booking:bookings(id, start_date, end_date, service_description)
    `)
    .eq('id', reviewId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    console.error('Error fetching review:', error)
    throw error
  }

  return data as Review
}

/**
 * Get profile rating summary
 */
export async function getProfileRating(userId: string): Promise<ProfileRating | null> {
  const { data, error } = await supabase
    .from('profile_ratings')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    console.error('Error fetching profile rating:', error)
    throw error
  }

  return data as ProfileRating
}

/**
 * Get average rating for a user (simple version)
 */
export async function getAverageRating(userId: string): Promise<number> {
  const rating = await getProfileRating(userId)
  return rating?.average_rating || 0
}

// ============================================
// CREATE & UPDATE REVIEWS
// ============================================

/**
 * Check if user can leave a review
 */
export async function canLeaveReview(
  revieweeId: string,
  bookingId?: string
): Promise<{ canReview: boolean; reason?: string }> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { canReview: false, reason: 'Not authenticated' }

  // Can't review yourself
  if (user.id === revieweeId) {
    return { canReview: false, reason: 'Cannot review yourself' }
  }

  // Check for completed booking between users
  const { data: bookings, error: bookingError } = await supabase
    .from('bookings')
    .select('id')
    .in('status', ['completed', 'paid'])
    .or(`client_id.eq.${user.id},freelancer_id.eq.${user.id}`)
    .or(`client_id.eq.${revieweeId},freelancer_id.eq.${revieweeId}`)
    .limit(1)

  if (bookingError || !bookings?.length) {
    return { canReview: false, reason: 'No completed booking with this user' }
  }

  // Check if already reviewed this booking
  if (bookingId) {
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('by_user_id', user.id)
      .eq('about_user_id', revieweeId)
      .eq('booking_id', bookingId)
      .single()

    if (existingReview) {
      return { canReview: false, reason: 'Already reviewed this booking' }
    }
  }

  return { canReview: true }
}

/**
 * Create a new review
 */
export async function createReview(params: CreateReviewParams): Promise<Review> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Validate rating
  if (params.rating < 1 || params.rating > 5) {
    throw new Error('Rating must be between 1 and 5')
  }

  // Check can review
  const { canReview, reason } = await canLeaveReview(params.about_user_id, params.booking_id)
  if (!canReview) {
    throw new Error(reason || 'Cannot leave review')
  }

  const { data, error } = await supabase
    .from('reviews')
    .insert({
      ...params,
      by_user_id: user.id,
      review_type: params.review_type || 'booking',
      is_public: true,
      is_verified: false,
      moderation_status: 'approved' // Auto-approve for now
    })
    .select(`
      *,
      reviewer:profiles!reviews_by_user_id_fkey(id, display_name, avatar_url, role)
    `)
    .single()

  if (error) {
    console.error('Error creating review:', error)
    throw error
  }

  return data as Review
}

/**
 * Update a review (only text, not rating)
 */
export async function updateReview(
  reviewId: string,
  updates: { title?: string; text?: string }
): Promise<Review> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('reviews')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', reviewId)
    .eq('by_user_id', user.id)
    .select(`
      *,
      reviewer:profiles!reviews_by_user_id_fkey(id, display_name, avatar_url, role)
    `)
    .single()

  if (error) {
    console.error('Error updating review:', error)
    throw error
  }

  return data as Review
}

/**
 * Delete a review (soft delete - sets is_public to false)
 */
export async function deleteReview(reviewId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('reviews')
    .update({ is_public: false })
    .eq('id', reviewId)
    .eq('by_user_id', user.id)

  if (error) {
    console.error('Error deleting review:', error)
    throw error
  }
}

// ============================================
// REVIEW RESPONSES
// ============================================

/**
 * Respond to a review (as the reviewed user)
 */
export async function respondToReview(
  reviewId: string,
  responseText: string
): Promise<Review> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('reviews')
    .update({
      response_text: responseText,
      response_at: new Date().toISOString()
    })
    .eq('id', reviewId)
    .eq('about_user_id', user.id) // Only the reviewed user can respond
    .select(`
      *,
      reviewer:profiles!reviews_by_user_id_fkey(id, display_name, avatar_url, role)
    `)
    .single()

  if (error) {
    console.error('Error responding to review:', error)
    throw error
  }

  return data as Review
}

// ============================================
// HELPFUL VOTES
// ============================================

/**
 * Mark a review as helpful
 */
export async function markReviewHelpful(
  reviewId: string,
  isHelpful: boolean = true
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('review_helpful_votes')
    .upsert({
      review_id: reviewId,
      user_id: user.id,
      is_helpful: isHelpful
    }, {
      onConflict: 'review_id,user_id'
    })

  if (error) {
    console.error('Error marking review helpful:', error)
    throw error
  }
}

/**
 * Remove helpful vote
 */
export async function removeHelpfulVote(reviewId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('review_helpful_votes')
    .delete()
    .eq('review_id', reviewId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error removing helpful vote:', error)
    throw error
  }
}

/**
 * Check if user has voted on a review
 */
export async function hasVotedHelpful(reviewId: string): Promise<boolean | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('review_helpful_votes')
    .select('is_helpful')
    .eq('review_id', reviewId)
    .eq('user_id', user.id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    console.error('Error checking helpful vote:', error)
    return null
  }

  return data?.is_helpful ?? null
}

// ============================================
// PENDING REVIEWS
// ============================================

/**
 * Get bookings that can be reviewed by the current user
 */
export async function getPendingReviewBookings(): Promise<any[]> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Get completed bookings where user hasn't left a review
  const { data: bookings, error } = await supabase
    .from('bookings')
    .select(`
      *,
      client_profile:profiles!bookings_client_id_fkey(id, display_name, avatar_url, role),
      freelancer_profile:profiles!bookings_freelancer_id_fkey(id, display_name, avatar_url, role)
    `)
    .in('status', ['completed', 'paid'])
    .or(`client_id.eq.${user.id},freelancer_id.eq.${user.id}`)
    .order('end_date', { ascending: false })

  if (error) {
    console.error('Error fetching bookings:', error)
    throw error
  }

  // Get existing reviews by user
  const { data: existingReviews } = await supabase
    .from('reviews')
    .select('booking_id')
    .eq('by_user_id', user.id)

  const reviewedBookingIds = new Set(existingReviews?.map(r => r.booking_id) || [])

  // Filter to only unreviewed bookings
  const pendingReviews = bookings?.filter(booking => {
    if (reviewedBookingIds.has(booking.id)) return false
    // Determine who to review
    const revieweeId = booking.client_id === user.id
      ? booking.freelancer_id
      : booking.client_id
    return revieweeId // Has someone to review
  }).map(booking => {
    const isClient = booking.client_id === user.id
    return {
      ...booking,
      reviewee_id: isClient ? booking.freelancer_id : booking.client_id,
      reviewee_profile: isClient ? booking.freelancer_profile : booking.client_profile,
      your_role: isClient ? 'client' : 'freelancer'
    }
  })

  return pendingReviews || []
}

// ============================================
// EXPORTS
// ============================================

// Legacy export for backwards compatibility
export async function listReviewsForUser(userId: string) {
  return getReviewsForUser(userId)
}

export default {
  getReviewsForUser,
  getReviewsByUser,
  getReviewById,
  getProfileRating,
  getAverageRating,
  canLeaveReview,
  createReview,
  updateReview,
  deleteReview,
  respondToReview,
  markReviewHelpful,
  removeHelpfulVote,
  hasVotedHelpful,
  getPendingReviewBookings,
  listReviewsForUser
}
