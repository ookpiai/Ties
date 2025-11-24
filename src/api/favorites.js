import { supabase } from '../lib/supabase'

/**
 * Get all favorites for the current user
 * Returns array of profile objects with favorite metadata
 */
export const getFavorites = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('favorites')
    .select(`
      id,
      created_at,
      notes,
      profile:profiles (
        id,
        display_name,
        role,
        specialty,
        specialty_display_name,
        city,
        avatar_url,
        bio,
        hourly_rate,
        daily_rate
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

/**
 * Check if a profile is favorited
 */
export const isFavorited = async (profileId) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data, error } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('profile_id', profileId)
    .single()

  if (error && error.code !== 'PGRST116') throw error // PGRST116 = not found
  return !!data
}

/**
 * Add a profile to favorites
 */
export const addFavorite = async (profileId, notes = null) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('favorites')
    .insert({
      user_id: user.id,
      profile_id: profileId,
      notes
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Remove a profile from favorites
 */
export const removeFavorite = async (profileId) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', user.id)
    .eq('profile_id', profileId)

  if (error) throw error
}

/**
 * Update favorite notes
 */
export const updateFavoriteNotes = async (profileId, notes) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('favorites')
    .update({ notes })
    .eq('user_id', user.id)
    .eq('profile_id', profileId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Get favorite count for a profile (how many users favorited it)
 */
export const getFavoriteCount = async (profileId) => {
  const { count, error } = await supabase
    .from('favorites')
    .select('*', { count: 'exact', head: true })
    .eq('profile_id', profileId)

  if (error) throw error
  return count || 0
}
