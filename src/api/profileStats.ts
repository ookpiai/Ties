/**
 * Profile Stats API
 *
 * Handles real-time profile statistics and view tracking
 * Replaces hardcoded placeholder stats with actual data
 *
 * Sources:
 * - Fiverr seller analytics
 * - Upwork profile insights
 */

import { supabase } from '../lib/supabase'

// Types
export interface ProfileStats {
  user_id: string

  // Booking stats
  total_bookings_completed: number
  total_bookings_cancelled: number

  // Financial stats (only visible to profile owner)
  total_revenue_earned: number
  average_booking_value: number

  // Rating stats
  average_rating: number
  total_reviews: number
  five_star_count: number

  // Performance metrics
  on_time_delivery_rate: number
  repeat_client_rate: number
  response_rate: number
  average_response_time_hours: number

  // Engagement stats
  profile_views_total: number
  profile_views_30d: number
  profile_views_7d: number

  // Timestamps
  last_active_at: string
  last_booking_at: string | null
  member_since: string
  updated_at: string
}

export interface ProfileView {
  id: string
  profile_id: string
  viewer_id: string | null
  source: string | null
  created_at: string
}

/**
 * Get profile stats for a user
 */
export async function getProfileStats(userId: string): Promise<ProfileStats | null> {
  const { data, error } = await supabase
    .from('profile_stats')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    throw error
  }
  return data as ProfileStats
}

/**
 * Initialize profile stats for a new user
 * Called automatically by database trigger, but can be called manually
 */
export async function initializeProfileStats(userId: string): Promise<ProfileStats> {
  const { data, error } = await supabase
    .from('profile_stats')
    .upsert({
      user_id: userId,
      member_since: new Date().toISOString(),
      last_active_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return data as ProfileStats
}

/**
 * Record a profile view
 */
export async function recordProfileView(
  profileId: string,
  viewerId: string | null = null,
  source: 'discovery' | 'search' | 'direct' | 'booking' | 'message' = 'direct'
): Promise<void> {
  // Don't record self-views
  if (viewerId === profileId) return

  const { error } = await supabase
    .from('profile_views')
    .insert({
      profile_id: profileId,
      viewer_id: viewerId,
      source,
    })

  // Silently fail - view tracking shouldn't break the page
  if (error) {
    console.warn('Failed to record profile view:', error)
  }
}

/**
 * Get public stats (what others can see)
 */
export function getPublicStats(stats: ProfileStats | null): {
  totalProjects: number
  totalReviews: number
  averageRating: number
  responseTime: string
  onTimeRate: number
  repeatClientRate: number
  memberSince: string
} {
  if (!stats) {
    return {
      totalProjects: 0,
      totalReviews: 0,
      averageRating: 0,
      responseTime: 'N/A',
      onTimeRate: 100,
      repeatClientRate: 0,
      memberSince: new Date().toISOString(),
    }
  }

  return {
    totalProjects: stats.total_bookings_completed,
    totalReviews: stats.total_reviews,
    averageRating: stats.average_rating,
    responseTime: formatResponseTime(stats.average_response_time_hours),
    onTimeRate: stats.on_time_delivery_rate,
    repeatClientRate: stats.repeat_client_rate,
    memberSince: stats.member_since,
  }
}

/**
 * Get private stats (what only the profile owner can see)
 */
export function getPrivateStats(stats: ProfileStats | null): {
  totalRevenue: number
  averageBookingValue: number
  profileViewsTotal: number
  profileViews30d: number
  profileViews7d: number
  lastActiveAt: string
  lastBookingAt: string | null
} {
  if (!stats) {
    return {
      totalRevenue: 0,
      averageBookingValue: 0,
      profileViewsTotal: 0,
      profileViews30d: 0,
      profileViews7d: 0,
      lastActiveAt: new Date().toISOString(),
      lastBookingAt: null,
    }
  }

  return {
    totalRevenue: stats.total_revenue_earned,
    averageBookingValue: stats.average_booking_value,
    profileViewsTotal: stats.profile_views_total,
    profileViews30d: stats.profile_views_30d,
    profileViews7d: stats.profile_views_7d,
    lastActiveAt: stats.last_active_at,
    lastBookingAt: stats.last_booking_at,
  }
}

/**
 * Format response time for display
 */
export function formatResponseTime(hours: number): string {
  if (hours < 1) {
    return '< 1 hour'
  }
  if (hours < 24) {
    return `${Math.round(hours)} hours`
  }
  const days = Math.round(hours / 24)
  return days === 1 ? '1 day' : `${days} days`
}

/**
 * Get rating display info
 */
export function getRatingDisplay(rating: number, totalReviews: number): {
  stars: number
  display: string
  color: string
} {
  if (totalReviews === 0) {
    return {
      stars: 0,
      display: 'New',
      color: 'text-slate-500',
    }
  }

  const roundedRating = Math.round(rating * 10) / 10

  let color = 'text-slate-500'
  if (rating >= 4.8) {
    color = 'text-green-600'
  } else if (rating >= 4.5) {
    color = 'text-blue-600'
  } else if (rating >= 4.0) {
    color = 'text-yellow-600'
  } else if (rating >= 3.0) {
    color = 'text-orange-600'
  } else {
    color = 'text-red-600'
  }

  return {
    stars: roundedRating,
    display: `${roundedRating} (${totalReviews})`,
    color,
  }
}

/**
 * Get performance level based on stats
 * Used for automatic badge qualification
 */
export function getPerformanceLevel(stats: ProfileStats): {
  level: 'new' | 'rising' | 'established' | 'top' | 'elite'
  qualifiesForBadge: 'none' | 'rising_talent' | 'top_rated' | 'top_rated_plus'
} {
  const { total_bookings_completed, average_rating, on_time_delivery_rate, total_bookings_cancelled } = stats

  const cancellationRate = total_bookings_completed > 0
    ? (total_bookings_cancelled / (total_bookings_completed + total_bookings_cancelled)) * 100
    : 0

  // Elite (Top Rated Plus): 25+ bookings, 4.9+ rating, <5% cancellation, 95%+ on-time
  if (
    total_bookings_completed >= 25 &&
    average_rating >= 4.9 &&
    cancellationRate < 5 &&
    on_time_delivery_rate >= 95
  ) {
    return { level: 'elite', qualifiesForBadge: 'top_rated_plus' }
  }

  // Top (Top Rated): 10+ bookings, 4.8+ rating
  if (total_bookings_completed >= 10 && average_rating >= 4.8) {
    return { level: 'top', qualifiesForBadge: 'top_rated' }
  }

  // Rising (Rising Talent): 3+ bookings, 4.5+ rating
  if (total_bookings_completed >= 3 && average_rating >= 4.5) {
    return { level: 'rising', qualifiesForBadge: 'rising_talent' }
  }

  // Established: Has some bookings
  if (total_bookings_completed > 0) {
    return { level: 'established', qualifiesForBadge: 'none' }
  }

  // New: No bookings yet
  return { level: 'new', qualifiesForBadge: 'none' }
}

/**
 * Update last active timestamp
 */
export async function updateLastActive(userId: string): Promise<void> {
  await supabase
    .from('profile_stats')
    .update({ last_active_at: new Date().toISOString() })
    .eq('user_id', userId)
}

/**
 * Format member since date
 */
export function formatMemberSince(date: string): string {
  return new Date(date).toLocaleDateString('en-AU', {
    month: 'long',
    year: 'numeric',
  })
}

/**
 * Calculate profile strength/completion
 * Returns percentage and recommendations
 */
export async function calculateProfileStrength(userId: string): Promise<{
  percentage: number
  recommendations: string[]
}> {
  // This would ideally be a database function for performance
  // But we'll calculate it client-side for now

  const recommendations: string[] = []
  let score = 0
  const maxScore = 100

  // Get profile data
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (!profile) {
    return { percentage: 0, recommendations: ['Complete your profile setup'] }
  }

  // Avatar (10 points)
  if (profile.avatar_url) {
    score += 10
  } else {
    recommendations.push('Add a profile photo')
  }

  // Display name (10 points)
  if (profile.display_name) {
    score += 10
  } else {
    recommendations.push('Add your name')
  }

  // Headline (10 points)
  if (profile.headline) {
    score += 10
  } else {
    recommendations.push('Add a professional headline')
  }

  // Bio (10 points)
  if (profile.bio && profile.bio.length > 50) {
    score += 10
  } else {
    recommendations.push('Write a detailed bio (50+ characters)')
  }

  // Location (5 points)
  if (profile.city) {
    score += 5
  } else {
    recommendations.push('Add your location')
  }

  // Rates (10 points)
  if (profile.hourly_rate || profile.daily_rate) {
    score += 10
  } else {
    recommendations.push('Set your rates')
  }

  // Check portfolio items (15 points)
  const { data: portfolio } = await supabase
    .from('portfolio_items')
    .select('id')
    .eq('user_id', userId)
    .limit(1)

  if (portfolio && portfolio.length > 0) {
    score += 15
  } else {
    recommendations.push('Add portfolio items to showcase your work')
  }

  // Check skills (10 points)
  const { data: skills } = await supabase
    .from('user_skills')
    .select('id')
    .eq('user_id', userId)
    .limit(1)

  if (skills && skills.length > 0) {
    score += 10
  } else {
    recommendations.push('Add your skills and specializations')
  }

  // Check services (10 points)
  const { data: services } = await supabase
    .from('services')
    .select('id')
    .eq('owner_id', userId)
    .limit(1)

  if (services && services.length > 0) {
    score += 10
  } else {
    recommendations.push('Create service listings')
  }

  // Languages (5 points)
  if (profile.languages && JSON.parse(JSON.stringify(profile.languages)).length > 0) {
    score += 5
  } else {
    recommendations.push('Add languages you speak')
  }

  // Social links (5 points)
  if (profile.social_links && Object.keys(profile.social_links).length > 0) {
    score += 5
  } else {
    recommendations.push('Connect your social media accounts')
  }

  return {
    percentage: Math.min(100, Math.round((score / maxScore) * 100)),
    recommendations: recommendations.slice(0, 3), // Top 3 recommendations
  }
}
