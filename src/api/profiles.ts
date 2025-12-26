import { supabase, Profile } from '../lib/supabase'

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data as Profile
}

export async function createProfile(profile: Omit<Profile, 'created_at'>) {
  const { data, error } = await supabase
    .from('profiles')
    .insert(profile)
    .select()
    .single()

  if (error) throw error
  return data as Profile
}

export async function updateProfile(userId: string, updates: Partial<Profile>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data as Profile
}

export async function listProfiles() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Profile[]
}

export interface SearchFilters {
  query?: string
  role?: string
  location?: string
  minPrice?: number
  maxPrice?: number
  specialties?: string[]
  badges?: string[]
  sortBy?: 'relevance' | 'rating' | 'price_low' | 'price_high' | 'recent'
  limit?: number
  offset?: number
}

export interface ProfileWithStats extends Profile {
  average_rating?: number
  total_reviews?: number
  on_time_delivery_rate?: number
  last_active_at?: string
  total_bookings_completed?: number
}

export async function searchProfiles(filters: SearchFilters = {}): Promise<ProfileWithStats[]> {
  // Build query with profile_stats join for ratings/reviews
  let query = supabase
    .from('profiles')
    .select(`
      *,
      profile_stats (
        average_rating,
        total_reviews,
        on_time_delivery_rate,
        last_active_at,
        total_bookings_completed
      )
    `)

  // Apply text search filter (searches display_name and bio)
  if (filters.query) {
    query = query.or(`display_name.ilike.%${filters.query}%,bio.ilike.%${filters.query}%`)
  }

  // Apply role filter
  if (filters.role && filters.role !== 'all') {
    query = query.eq('role', filters.role)
  }

  // Apply location filter
  if (filters.location) {
    query = query.ilike('city', `%${filters.location}%`)
  }

  // Apply price range filter
  if (filters.minPrice !== undefined && filters.minPrice > 0) {
    query = query.gte('hourly_rate', filters.minPrice)
  }
  if (filters.maxPrice !== undefined && filters.maxPrice > 0) {
    query = query.lte('hourly_rate', filters.maxPrice)
  }

  // Apply specialty filter (skills)
  if (filters.specialties && filters.specialties.length > 0) {
    query = query.in('specialty', filters.specialties)
  }

  // Apply badge filters
  if (filters.badges && filters.badges.length > 0) {
    // Verified badge = email_verified is true
    if (filters.badges.includes('verified')) {
      query = query.eq('email_verified', true)
    }
    // Note: Other badge filters (active, reliable, top_rated) require profile_stats
    // which is handled in post-processing below
  }

  // Apply sorting
  switch (filters.sortBy) {
    case 'price_low':
      query = query.order('hourly_rate', { ascending: true, nullsFirst: false })
      break
    case 'price_high':
      query = query.order('hourly_rate', { ascending: false, nullsFirst: false })
      break
    case 'recent':
      query = query.order('created_at', { ascending: false })
      break
    case 'rating':
      // Will sort in post-processing due to join complexity
      query = query.order('created_at', { ascending: false })
      break
    default:
      // Relevance/default - order by created_at
      query = query.order('created_at', { ascending: false })
  }

  // Apply pagination
  if (filters.limit) {
    query = query.limit(filters.limit)
  }
  if (filters.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1)
  }

  const { data, error } = await query

  if (error) throw error

  // Transform data to flatten profile_stats
  let results = (data || []).map((profile: any) => {
    const stats = profile.profile_stats?.[0] || profile.profile_stats || {}
    return {
      ...profile,
      average_rating: stats.average_rating || 0,
      total_reviews: stats.total_reviews || 0,
      on_time_delivery_rate: stats.on_time_delivery_rate || 100,
      last_active_at: stats.last_active_at || profile.created_at,
      total_bookings_completed: stats.total_bookings_completed || 0,
      profile_stats: undefined // Remove nested object
    } as ProfileWithStats
  })

  // Post-process badge filters that depend on profile_stats
  if (filters.badges && filters.badges.length > 0) {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    results = results.filter(profile => {
      // Active badge: last active within 30 days
      if (filters.badges!.includes('active')) {
        const lastActive = profile.last_active_at ? new Date(profile.last_active_at) : null
        if (!lastActive || lastActive < thirtyDaysAgo) return false
      }

      // Reliable badge: on_time_delivery_rate >= 90%
      if (filters.badges!.includes('reliable')) {
        if ((profile.on_time_delivery_rate || 0) < 90) return false
      }

      // Top Rated badge: average_rating >= 4.5
      if (filters.badges!.includes('top_rated')) {
        if ((profile.average_rating || 0) < 4.5) return false
      }

      return true
    })
  }

  // Post-process sorting by rating (can't do in SQL due to join)
  if (filters.sortBy === 'rating') {
    results.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0))
  }

  return results
}

/**
 * Get multiple profiles by IDs (for compare page)
 */
export async function getProfilesByIds(ids: string[]): Promise<ProfileWithStats[]> {
  if (!ids || ids.length === 0) return []

  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      profile_stats (
        average_rating,
        total_reviews,
        on_time_delivery_rate,
        last_active_at,
        total_bookings_completed
      )
    `)
    .in('id', ids)

  if (error) throw error

  return (data || []).map((profile: any) => {
    const stats = profile.profile_stats?.[0] || profile.profile_stats || {}
    return {
      ...profile,
      average_rating: stats.average_rating || 0,
      total_reviews: stats.total_reviews || 0,
      on_time_delivery_rate: stats.on_time_delivery_rate || 100,
      last_active_at: stats.last_active_at || profile.created_at,
      total_bookings_completed: stats.total_bookings_completed || 0,
      profile_stats: undefined
    } as ProfileWithStats
  })
}

// Personalized recommendation types
export type DiscoveryTab = 'for_you' | 'top_rated' | 'near_you' | 'new_talent' | 'recently_active'

export interface RecommendedProfile extends ProfileWithStats {
  recommendation_score?: number
  recommendation_reason?: string
}

export interface UserContext {
  userId?: string
  role?: string
  specialty?: string
  city?: string
}

// Complementary skills matrix - what professionals work well together
const COMPLEMENTARY_SKILLS: Record<string, string[]> = {
  // Freelancers
  'photographer': ['videographer', 'makeup_artist', 'stylist', 'model', 'editor'],
  'videographer': ['photographer', 'editor', 'sound_engineer', 'drone_operator'],
  'dj': ['sound_engineer', 'lighting_tech', 'mc', 'musician'],
  'makeup_artist': ['photographer', 'stylist', 'hair_stylist', 'model'],
  'musician': ['sound_engineer', 'videographer', 'photographer', 'dj'],
  'event_planner': ['caterer', 'florist', 'decorator', 'photographer', 'dj'],
  'mc': ['dj', 'sound_engineer', 'event_planner'],
  'editor': ['videographer', 'photographer', 'colorist'],
  // Vendors
  'catering': ['event_planner', 'florist', 'decorator'],
  'florist': ['event_planner', 'photographer', 'decorator'],
  'decorator': ['event_planner', 'florist', 'photographer'],
  // More can be added
}

// Role-based default filters - what each role typically looks for
const ROLE_DEFAULT_FILTERS: Record<string, string[]> = {
  'Organiser': ['Freelancer', 'Vendor', 'Venue'], // Looking to hire talent
  'Freelancer': ['Organiser', 'Freelancer'],      // Find gigs + collaborators
  'Vendor': ['Organiser', 'Venue'],               // Find events to work
  'Venue': ['Organiser'],                         // Find event bookings
}

/**
 * Get personalized profile recommendations based on user context and tab
 */
export async function getRecommendedProfiles(
  tab: DiscoveryTab,
  userContext: UserContext,
  limit: number = 20
): Promise<RecommendedProfile[]> {
  const { userId, role, specialty, city } = userContext

  // Build base query with profile_stats
  let query = supabase
    .from('profiles')
    .select(`
      *,
      profile_stats (
        average_rating,
        total_reviews,
        on_time_delivery_rate,
        last_active_at,
        total_bookings_completed
      )
    `)
    .neq('id', userId || '')  // Exclude current user

  // Apply tab-specific filters
  switch (tab) {
    case 'top_rated':
      // Will sort by rating in post-processing
      break
    case 'near_you':
      if (city) {
        query = query.ilike('city', `%${city}%`)
      }
      break
    case 'new_talent':
      // Users who joined in last 30 days
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      query = query.gte('created_at', thirtyDaysAgo.toISOString())
      break
    case 'recently_active':
      // Will filter by last_active in post-processing
      break
    case 'for_you':
    default:
      // For You tab: Apply role-based filters
      if (role && ROLE_DEFAULT_FILTERS[role]) {
        query = query.in('role', ROLE_DEFAULT_FILTERS[role])
      }
      break
  }

  query = query.limit(limit * 2) // Fetch more for scoring/filtering

  const { data, error } = await query

  if (error) throw error

  // Transform and calculate recommendation scores
  let results: RecommendedProfile[] = (data || []).map((profile: any) => {
    const stats = profile.profile_stats?.[0] || profile.profile_stats || {}
    const transformedProfile: RecommendedProfile = {
      ...profile,
      average_rating: stats.average_rating || 0,
      total_reviews: stats.total_reviews || 0,
      on_time_delivery_rate: stats.on_time_delivery_rate || 100,
      last_active_at: stats.last_active_at || profile.created_at,
      total_bookings_completed: stats.total_bookings_completed || 0,
      profile_stats: undefined,
      recommendation_score: 0,
      recommendation_reason: ''
    }

    // Calculate personalized score for "For You" tab
    if (tab === 'for_you') {
      const { score, reason } = calculateRecommendationScore(transformedProfile, userContext)
      transformedProfile.recommendation_score = score
      transformedProfile.recommendation_reason = reason
    }

    return transformedProfile
  })

  // Apply tab-specific sorting/filtering
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  switch (tab) {
    case 'for_you':
      // Sort by recommendation score
      results.sort((a, b) => (b.recommendation_score || 0) - (a.recommendation_score || 0))
      break
    case 'top_rated':
      results.sort((a, b) => {
        // Primary: rating, Secondary: review count
        const ratingDiff = (b.average_rating || 0) - (a.average_rating || 0)
        if (ratingDiff !== 0) return ratingDiff
        return (b.total_reviews || 0) - (a.total_reviews || 0)
      })
      results.forEach(p => {
        if ((p.average_rating || 0) >= 4.5) {
          p.recommendation_reason = `Top rated (${p.average_rating?.toFixed(1)}★)`
        } else if ((p.average_rating || 0) >= 4.0) {
          p.recommendation_reason = `Highly rated (${p.average_rating?.toFixed(1)}★)`
        }
      })
      break
    case 'near_you':
      results.forEach(p => {
        if (p.city && city && p.city.toLowerCase().includes(city.toLowerCase())) {
          p.recommendation_reason = `Near you in ${p.city}`
        }
      })
      break
    case 'new_talent':
      results.sort((a, b) =>
        new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      )
      results.forEach(p => {
        p.recommendation_reason = 'New to TIES Together'
      })
      break
    case 'recently_active':
      results = results.filter(p => {
        const lastActive = p.last_active_at ? new Date(p.last_active_at) : null
        return lastActive && lastActive >= sevenDaysAgo
      })
      results.sort((a, b) =>
        new Date(b.last_active_at || 0).getTime() - new Date(a.last_active_at || 0).getTime()
      )
      results.forEach(p => {
        p.recommendation_reason = 'Recently active'
      })
      break
  }

  return results.slice(0, limit)
}

/**
 * Calculate a recommendation score based on user context
 */
function calculateRecommendationScore(
  profile: ProfileWithStats,
  userContext: UserContext
): { score: number; reason: string } {
  const { role: userRole, specialty: userSpecialty, city: userCity } = userContext
  let score = 0
  const reasons: string[] = []

  // 1. Role matching (30% weight)
  if (userRole && ROLE_DEFAULT_FILTERS[userRole]?.includes(profile.role || '')) {
    score += 0.30
    reasons.push('Good match for your needs')
  } else if (profile.role === userRole) {
    score += 0.15 // Same role (potential collaborator)
    reasons.push('Potential collaborator')
  }

  // 2. Complementary skills (25% weight)
  if (userSpecialty && profile.specialty) {
    const complementary = COMPLEMENTARY_SKILLS[userSpecialty.toLowerCase()] || []
    if (complementary.includes(profile.specialty.toLowerCase())) {
      score += 0.25
      reasons.push('Complementary skills')
    } else if (profile.specialty.toLowerCase() === userSpecialty.toLowerCase()) {
      score += 0.10 // Same specialty
    }
  }

  // 3. Location proximity (20% weight)
  if (userCity && profile.city) {
    if (profile.city.toLowerCase() === userCity.toLowerCase()) {
      score += 0.20
      reasons.push(`Near you in ${profile.city}`)
    } else if (profile.city.toLowerCase().includes(userCity.toLowerCase().split(',')[0])) {
      score += 0.10 // Same region/area
    }
  }

  // 4. Rating score (15% weight)
  const ratingScore = ((profile.average_rating || 0) / 5) * 0.15
  score += ratingScore
  if ((profile.average_rating || 0) >= 4.5) {
    reasons.push('Top rated')
  }

  // 5. Activity recency (10% weight)
  if (profile.last_active_at) {
    const lastActive = new Date(profile.last_active_at)
    const now = new Date()
    const daysSinceActive = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)

    if (daysSinceActive <= 7) {
      score += 0.10
      reasons.push('Recently active')
    } else if (daysSinceActive <= 30) {
      score += 0.05
    }
  }

  // Pick the most relevant reason
  const primaryReason = reasons[0] || ''

  return { score, reason: primaryReason }
}

/**
 * Get the default role filter for a user based on their role
 */
export function getDefaultRoleFilter(userRole?: string): string[] | null {
  if (!userRole) return null
  return ROLE_DEFAULT_FILTERS[userRole] || null
}
