/**
 * VENUE PORTFOLIO API
 * For venues managing their entertainer contacts and bookings
 *
 * Features:
 * - Track regular entertainers/vendors
 * - Quick booking from contact list
 * - Favorites and tags for organization
 * - Booking history per entertainer
 */

import { supabase } from '../lib/supabase'

// =====================================================
// TYPES
// =====================================================

export type ContactStatus = 'active' | 'inactive' | 'blocked'

export interface VenueEntertainerContact {
  id: string
  venue_id: string
  entertainer_id: string
  status: ContactStatus
  is_favorite: boolean
  preferred_rate?: number | null
  preferred_rate_type?: 'hourly' | 'daily' | 'flat' | null
  default_set_length_hours?: number | null
  internal_notes?: string | null
  tags?: string[] | null
  total_bookings: number
  last_booked_at?: string | null
  created_at: string
  updated_at: string
  // Joined data
  entertainer_profile?: {
    id: string
    display_name: string
    avatar_url?: string
    role?: string
    specialty?: string
    specialty_display_name?: string
    hourly_rate?: number
    daily_rate?: number
    bio?: string
    city?: string
  }
}

export interface VenuePortfolioStats {
  total_contacts: number
  favorite_contacts: number
  total_bookings_this_month: number
  total_spent_this_month: number
  upcoming_bookings: number
  pending_availability_requests: number
}

export interface AddContactParams {
  entertainer_id: string
  is_favorite?: boolean
  preferred_rate?: number
  preferred_rate_type?: 'hourly' | 'daily' | 'flat'
  default_set_length_hours?: number
  internal_notes?: string
  tags?: string[]
}

// =====================================================
// GET VENUE PORTFOLIO STATS
// =====================================================

/**
 * Get aggregated statistics for the venue portfolio
 */
export async function getVenuePortfolioStats(): Promise<VenuePortfolioStats> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  // Try RPC function first
  const { data: rpcData, error: rpcError } = await supabase
    .rpc('get_venue_portfolio_stats', { p_venue_id: user.id })

  if (!rpcError && rpcData) {
    return rpcData as VenuePortfolioStats
  }

  // Fallback: Calculate manually
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()

  const [contactsResult, bookingsResult, requestsResult] = await Promise.all([
    supabase
      .from('venue_entertainer_contacts')
      .select('id, is_favorite, status')
      .eq('venue_id', user.id),
    supabase
      .from('bookings')
      .select('id, total_amount, status, created_at, completed_at, start_date')
      .eq('client_id', user.id)
      .gte('created_at', monthStart),
    supabase
      .from('availability_requests')
      .select('id')
      .eq('requester_id', user.id)
      .eq('status', 'pending')
  ])

  const contacts = contactsResult.data || []
  const bookings = bookingsResult.data || []
  const requests = requestsResult.data || []

  return {
    total_contacts: contacts.filter(c => c.status === 'active').length,
    favorite_contacts: contacts.filter(c => c.is_favorite).length,
    total_bookings_this_month: bookings.length,
    total_spent_this_month: bookings
      .filter(b => ['completed', 'paid'].includes(b.status))
      .reduce((sum, b) => sum + b.total_amount, 0),
    upcoming_bookings: bookings
      .filter(b => ['pending', 'accepted'].includes(b.status) && new Date(b.start_date) >= new Date())
      .length,
    pending_availability_requests: requests.length
  }
}

// =====================================================
// MANAGE ENTERTAINER CONTACTS
// =====================================================

/**
 * Get all entertainer contacts for a venue
 */
export async function getEntertainerContacts(options?: {
  status?: ContactStatus
  favoritesOnly?: boolean
  tags?: string[]
}): Promise<VenueEntertainerContact[]> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  let query = supabase
    .from('venue_entertainer_contacts')
    .select(`
      *,
      entertainer_profile:profiles!venue_entertainer_contacts_entertainer_id_fkey(
        id, display_name, avatar_url, role, specialty, specialty_display_name,
        hourly_rate, daily_rate, bio, city
      )
    `)
    .eq('venue_id', user.id)
    .order('is_favorite', { ascending: false })
    .order('last_booked_at', { ascending: false, nullsFirst: false })

  if (options?.status) {
    query = query.eq('status', options.status)
  }

  if (options?.favoritesOnly) {
    query = query.eq('is_favorite', true)
  }

  if (options?.tags && options.tags.length > 0) {
    query = query.overlaps('tags', options.tags)
  }

  const { data, error } = await query

  if (error) {
    console.error('Failed to fetch contacts:', error)
    throw error
  }

  return data as VenueEntertainerContact[]
}

/**
 * Add an entertainer to venue's contact list
 */
export async function addEntertainerContact(
  params: AddContactParams
): Promise<VenueEntertainerContact> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('venue_entertainer_contacts')
    .insert({
      venue_id: user.id,
      entertainer_id: params.entertainer_id,
      status: 'active',
      is_favorite: params.is_favorite || false,
      preferred_rate: params.preferred_rate || null,
      preferred_rate_type: params.preferred_rate_type || null,
      default_set_length_hours: params.default_set_length_hours || null,
      internal_notes: params.internal_notes || null,
      tags: params.tags || null
    })
    .select(`
      *,
      entertainer_profile:profiles!venue_entertainer_contacts_entertainer_id_fkey(
        id, display_name, avatar_url, role, specialty
      )
    `)
    .single()

  if (error) {
    console.error('Failed to add contact:', error)
    throw error
  }

  return data as VenueEntertainerContact
}

/**
 * Update an entertainer contact
 */
export async function updateEntertainerContact(
  contactId: string,
  updates: Partial<Omit<AddContactParams, 'entertainer_id'> & { status?: ContactStatus }>
): Promise<VenueEntertainerContact> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('venue_entertainer_contacts')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', contactId)
    .eq('venue_id', user.id)
    .select(`
      *,
      entertainer_profile:profiles!venue_entertainer_contacts_entertainer_id_fkey(
        id, display_name, avatar_url, role, specialty
      )
    `)
    .single()

  if (error) {
    console.error('Failed to update contact:', error)
    throw error
  }

  return data as VenueEntertainerContact
}

/**
 * Toggle favorite status for a contact
 */
export async function toggleFavorite(contactId: string): Promise<VenueEntertainerContact> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  // First get current status
  const { data: current } = await supabase
    .from('venue_entertainer_contacts')
    .select('is_favorite')
    .eq('id', contactId)
    .eq('venue_id', user.id)
    .single()

  const { data, error } = await supabase
    .from('venue_entertainer_contacts')
    .update({
      is_favorite: !current?.is_favorite,
      updated_at: new Date().toISOString()
    })
    .eq('id', contactId)
    .eq('venue_id', user.id)
    .select()
    .single()

  if (error) {
    console.error('Failed to toggle favorite:', error)
    throw error
  }

  return data as VenueEntertainerContact
}

/**
 * Remove an entertainer from contacts (soft delete by setting inactive)
 */
export async function removeEntertainerContact(contactId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { error } = await supabase
    .from('venue_entertainer_contacts')
    .update({
      status: 'inactive',
      updated_at: new Date().toISOString()
    })
    .eq('id', contactId)
    .eq('venue_id', user.id)

  if (error) {
    console.error('Failed to remove contact:', error)
    throw error
  }
}

/**
 * Block an entertainer (they can't contact or book with this venue)
 */
export async function blockEntertainer(contactId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { error } = await supabase
    .from('venue_entertainer_contacts')
    .update({
      status: 'blocked',
      updated_at: new Date().toISOString()
    })
    .eq('id', contactId)
    .eq('venue_id', user.id)

  if (error) {
    console.error('Failed to block entertainer:', error)
    throw error
  }
}

// =====================================================
// BOOKING HISTORY
// =====================================================

/**
 * Get booking history with a specific entertainer
 */
export async function getEntertainerBookingHistory(entertainerId: string): Promise<any[]> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('client_id', user.id)
    .eq('freelancer_id', entertainerId)
    .order('start_date', { ascending: false })

  if (error) {
    console.error('Failed to fetch booking history:', error)
    throw error
  }

  return data || []
}

// =====================================================
// DISCOVER & ADD
// =====================================================

/**
 * Check if an entertainer is already in the venue's contacts
 */
export async function isEntertainerInContacts(entertainerId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data } = await supabase
    .from('venue_entertainer_contacts')
    .select('id')
    .eq('venue_id', user.id)
    .eq('entertainer_id', entertainerId)
    .in('status', ['active', 'inactive'])
    .single()

  return !!data
}

/**
 * Get all unique tags used in venue's contacts
 */
export async function getAllTags(): Promise<string[]> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { data } = await supabase
    .from('venue_entertainer_contacts')
    .select('tags')
    .eq('venue_id', user.id)
    .not('tags', 'is', null)

  if (!data) return []

  const allTags = new Set<string>()
  data.forEach(row => {
    if (row.tags) {
      row.tags.forEach((tag: string) => allTags.add(tag))
    }
  })

  return Array.from(allTags).sort()
}

// =====================================================
// EXPORTS
// =====================================================

export default {
  getVenuePortfolioStats,
  getEntertainerContacts,
  addEntertainerContact,
  updateEntertainerContact,
  toggleFavorite,
  removeEntertainerContact,
  blockEntertainer,
  getEntertainerBookingHistory,
  isEntertainerInContacts,
  getAllTags
}
