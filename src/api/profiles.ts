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
  limit?: number
}

export async function searchProfiles(filters: SearchFilters = {}) {
  let query = supabase
    .from('profiles')
    .select('*')

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

  // Apply limit
  if (filters.limit) {
    query = query.limit(filters.limit)
  }

  // Order by created_at (newest first)
  query = query.order('created_at', { ascending: false })

  const { data, error } = await query

  if (error) throw error
  return data as Profile[]
}
