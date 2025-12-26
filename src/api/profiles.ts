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
