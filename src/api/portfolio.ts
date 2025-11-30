/**
 * Portfolio API
 *
 * Handles portfolio items for user profiles
 * Inspired by Fiverr Portfolio and Dribbble shots
 *
 * Sources:
 * - https://help.fiverr.com/hc/en-us/articles/4413134063633-Using-My-Portfolio
 * - https://blog.landr.com/music-portfolio/
 */

import { supabase } from '../lib/supabase'

// Types
export type PortfolioItemType = 'image' | 'video' | 'audio' | 'link' | 'before_after'
export type ExternalPlatform = 'youtube' | 'vimeo' | 'soundcloud' | 'spotify' | 'instagram' | 'tiktok' | 'other'

export interface PortfolioItem {
  id: string
  user_id: string
  type: PortfolioItemType
  title: string
  description: string | null
  media_url: string | null
  thumbnail_url: string | null
  external_url: string | null
  external_platform: ExternalPlatform | null
  before_image_url: string | null
  after_image_url: string | null
  skills_used: string[]
  tags: string[]
  related_service_id: string | null
  display_order: number
  view_count: number
  is_featured: boolean
  created_at: string
  updated_at: string
}

export interface CreatePortfolioItemInput {
  type: PortfolioItemType
  title: string
  description?: string
  media_url?: string
  thumbnail_url?: string
  external_url?: string
  external_platform?: ExternalPlatform
  before_image_url?: string
  after_image_url?: string
  skills_used?: string[]
  tags?: string[]
  related_service_id?: string
  is_featured?: boolean
}

export interface UpdatePortfolioItemInput extends Partial<CreatePortfolioItemInput> {
  display_order?: number
}

/**
 * Get all portfolio items for a user
 */
export async function getPortfolioItems(userId: string): Promise<PortfolioItem[]> {
  const { data, error } = await supabase
    .from('portfolio_items')
    .select('*')
    .eq('user_id', userId)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as PortfolioItem[]
}

/**
 * Get featured portfolio items for a user (for profile showcase)
 */
export async function getFeaturedPortfolioItems(userId: string, limit = 6): Promise<PortfolioItem[]> {
  const { data, error } = await supabase
    .from('portfolio_items')
    .select('*')
    .eq('user_id', userId)
    .eq('is_featured', true)
    .order('display_order', { ascending: true })
    .limit(limit)

  if (error) throw error
  return data as PortfolioItem[]
}

/**
 * Get a single portfolio item
 */
export async function getPortfolioItem(itemId: string): Promise<PortfolioItem> {
  const { data, error } = await supabase
    .from('portfolio_items')
    .select('*')
    .eq('id', itemId)
    .single()

  if (error) throw error
  return data as PortfolioItem
}

/**
 * Create a new portfolio item
 */
export async function createPortfolioItem(
  userId: string,
  input: CreatePortfolioItemInput
): Promise<PortfolioItem> {
  // Get the highest display_order for this user
  const { data: existing } = await supabase
    .from('portfolio_items')
    .select('display_order')
    .eq('user_id', userId)
    .order('display_order', { ascending: false })
    .limit(1)

  const nextOrder = existing && existing.length > 0 ? existing[0].display_order + 1 : 0

  const { data, error } = await supabase
    .from('portfolio_items')
    .insert({
      user_id: userId,
      ...input,
      display_order: nextOrder,
      skills_used: input.skills_used || [],
      tags: input.tags || [],
    })
    .select()
    .single()

  if (error) throw error
  return data as PortfolioItem
}

/**
 * Update a portfolio item
 */
export async function updatePortfolioItem(
  itemId: string,
  input: UpdatePortfolioItemInput
): Promise<PortfolioItem> {
  const { data, error } = await supabase
    .from('portfolio_items')
    .update(input)
    .eq('id', itemId)
    .select()
    .single()

  if (error) throw error
  return data as PortfolioItem
}

/**
 * Delete a portfolio item
 */
export async function deletePortfolioItem(itemId: string): Promise<void> {
  const { error } = await supabase
    .from('portfolio_items')
    .delete()
    .eq('id', itemId)

  if (error) throw error
}

/**
 * Reorder portfolio items (drag and drop)
 */
export async function reorderPortfolioItems(
  userId: string,
  orderedIds: string[]
): Promise<void> {
  // Update each item's display_order based on its position in the array
  const updates = orderedIds.map((id, index) => ({
    id,
    display_order: index,
  }))

  for (const update of updates) {
    const { error } = await supabase
      .from('portfolio_items')
      .update({ display_order: update.display_order })
      .eq('id', update.id)
      .eq('user_id', userId) // Security check

    if (error) throw error
  }
}

/**
 * Toggle featured status of a portfolio item
 */
export async function toggleFeatured(itemId: string, isFeatured: boolean): Promise<PortfolioItem> {
  const { data, error } = await supabase
    .from('portfolio_items')
    .update({ is_featured: isFeatured })
    .eq('id', itemId)
    .select()
    .single()

  if (error) throw error
  return data as PortfolioItem
}

/**
 * Increment view count for a portfolio item
 */
export async function incrementViewCount(itemId: string): Promise<void> {
  const { error } = await supabase.rpc('increment_portfolio_view_count', {
    item_id: itemId,
  })

  // Fallback if RPC doesn't exist
  if (error) {
    await supabase
      .from('portfolio_items')
      .update({ view_count: supabase.rpc('increment', { x: 1 }) as any })
      .eq('id', itemId)
  }
}

/**
 * Get portfolio items by type
 */
export async function getPortfolioItemsByType(
  userId: string,
  type: PortfolioItemType
): Promise<PortfolioItem[]> {
  const { data, error } = await supabase
    .from('portfolio_items')
    .select('*')
    .eq('user_id', userId)
    .eq('type', type)
    .order('display_order', { ascending: true })

  if (error) throw error
  return data as PortfolioItem[]
}

/**
 * Extract embed info from external URLs
 * Supports YouTube, Vimeo, SoundCloud, Spotify
 */
export function parseExternalUrl(url: string): { platform: ExternalPlatform; embedId: string } | null {
  // YouTube
  const youtubeRegex = /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  const youtubeMatch = url.match(youtubeRegex)
  if (youtubeMatch) {
    return { platform: 'youtube', embedId: youtubeMatch[1] }
  }

  // Vimeo
  const vimeoRegex = /(?:vimeo\.com\/)(\d+)/
  const vimeoMatch = url.match(vimeoRegex)
  if (vimeoMatch) {
    return { platform: 'vimeo', embedId: vimeoMatch[1] }
  }

  // SoundCloud (simplified - would need API for full embed)
  if (url.includes('soundcloud.com')) {
    return { platform: 'soundcloud', embedId: url }
  }

  // Spotify
  const spotifyRegex = /spotify\.com\/(track|album|playlist)\/([a-zA-Z0-9]+)/
  const spotifyMatch = url.match(spotifyRegex)
  if (spotifyMatch) {
    return { platform: 'spotify', embedId: `${spotifyMatch[1]}/${spotifyMatch[2]}` }
  }

  // Instagram
  if (url.includes('instagram.com')) {
    return { platform: 'instagram', embedId: url }
  }

  // TikTok
  if (url.includes('tiktok.com')) {
    return { platform: 'tiktok', embedId: url }
  }

  return null
}

/**
 * Get embed URL for external platforms
 */
export function getEmbedUrl(platform: ExternalPlatform, embedId: string): string {
  switch (platform) {
    case 'youtube':
      return `https://www.youtube.com/embed/${embedId}`
    case 'vimeo':
      return `https://player.vimeo.com/video/${embedId}`
    case 'spotify':
      return `https://open.spotify.com/embed/${embedId}`
    case 'soundcloud':
      // SoundCloud requires their widget API
      return `https://w.soundcloud.com/player/?url=${encodeURIComponent(embedId)}&color=%23ff5500&auto_play=false`
    default:
      return embedId
  }
}
