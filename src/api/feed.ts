/**
 * SOCIAL FEED API LAYER
 *
 * Handles all feed operations for the social media-style home page
 * Includes feed retrieval, interactions, comments, and follows
 */

import { supabase } from '../lib/supabase'

// =====================================================
// TYPESCRIPT INTERFACES
// =====================================================

export type FeedItemType =
  | 'portfolio_update'
  | 'job_posted'
  | 'event_posted'
  | 'gig_completed'
  | 'review_posted'
  | 'profile_joined'
  | 'availability_opened'

export type InteractionType = 'like' | 'save' | 'hide' | 'report'

export type FeedType = 'for_you' | 'following' | 'nearby'

export interface FeedItem {
  id: string
  item_type: FeedItemType
  actor_id: string
  actor_display_name: string
  actor_avatar_url: string | null
  actor_role: string
  actor_verified: boolean
  related_id: string | null
  related_type: string | null
  title: string
  description: string | null
  image_urls: string[]
  city: string | null
  distance_km: number | null
  view_count: number
  like_count: number
  comment_count: number
  has_liked: boolean
  has_saved: boolean
  metadata: Record<string, any>
  created_at: string
  expires_at: string | null
}

export interface FeedComment {
  id: string
  feed_item_id: string
  user_id: string
  parent_comment_id: string | null
  content: string
  like_count: number
  created_at: string
  updated_at: string
  // Joined data
  user?: {
    display_name: string
    avatar_url: string | null
  }
  replies?: FeedComment[]
}

export interface FeedResponse {
  items: FeedItem[]
  nextCursor: string | null
  hasMore: boolean
}

export interface GetFeedParams {
  feedType?: FeedType
  itemTypes?: FeedItemType[]
  latitude?: number
  longitude?: number
  radiusKm?: number
  limit?: number
  cursor?: string
}

// =====================================================
// GET FEED
// =====================================================

/**
 * Get personalized feed for the current user
 */
export async function getFeed(params: GetFeedParams = {}): Promise<FeedResponse> {
  const {
    feedType = 'for_you',
    itemTypes,
    latitude,
    longitude,
    radiusKm = 50,
    limit = 20,
    cursor
  } = params

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Use the database function for efficient feed retrieval
  const { data, error } = await supabase.rpc('get_feed', {
    p_user_id: user.id,
    p_latitude: latitude || null,
    p_longitude: longitude || null,
    p_radius_km: radiusKm,
    p_feed_type: feedType,
    p_item_types: itemTypes || null,
    p_limit: limit + 1, // Fetch one extra to check if there's more
    p_cursor: cursor || null
  })

  if (error) {
    console.error('Error fetching feed:', error)
    throw error
  }

  const items = (data || []) as FeedItem[]
  const hasMore = items.length > limit
  const returnItems = hasMore ? items.slice(0, limit) : items
  const nextCursor = hasMore && returnItems.length > 0
    ? returnItems[returnItems.length - 1].created_at
    : null

  return {
    items: returnItems,
    nextCursor,
    hasMore
  }
}

/**
 * Get a single feed item by ID
 */
export async function getFeedItem(itemId: string): Promise<FeedItem | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('feed_items')
    .select(`
      *,
      actor:profiles!actor_id (
        display_name,
        avatar_url,
        role,
        email_verified
      )
    `)
    .eq('id', itemId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  // Check if user has liked/saved
  const { data: interactions } = await supabase
    .from('feed_interactions')
    .select('interaction_type')
    .eq('feed_item_id', itemId)
    .eq('user_id', user.id)

  const interactionTypes = (interactions || []).map(i => i.interaction_type)

  return {
    id: data.id,
    item_type: data.item_type,
    actor_id: data.actor_id,
    actor_display_name: data.actor?.display_name || 'Unknown',
    actor_avatar_url: data.actor?.avatar_url,
    actor_role: data.actor?.role || 'Freelancer',
    actor_verified: data.actor?.email_verified || false,
    related_id: data.related_id,
    related_type: data.related_type,
    title: data.title,
    description: data.description,
    image_urls: data.image_urls || [],
    city: data.city,
    distance_km: null,
    view_count: data.view_count,
    like_count: data.like_count,
    comment_count: data.comment_count,
    has_liked: interactionTypes.includes('like'),
    has_saved: interactionTypes.includes('save'),
    metadata: data.metadata || {},
    created_at: data.created_at,
    expires_at: data.expires_at
  }
}

// =====================================================
// INTERACTIONS (LIKE, SAVE, HIDE, REPORT)
// =====================================================

/**
 * Like a feed item
 */
export async function likeFeedItem(itemId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('feed_interactions')
    .insert({
      user_id: user.id,
      feed_item_id: itemId,
      interaction_type: 'like'
    })

  if (error && error.code !== '23505') { // Ignore duplicate key errors
    throw error
  }
}

/**
 * Unlike a feed item
 */
export async function unlikeFeedItem(itemId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('feed_interactions')
    .delete()
    .eq('user_id', user.id)
    .eq('feed_item_id', itemId)
    .eq('interaction_type', 'like')

  if (error) throw error
}

/**
 * Save a feed item
 */
export async function saveFeedItem(itemId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('feed_interactions')
    .insert({
      user_id: user.id,
      feed_item_id: itemId,
      interaction_type: 'save'
    })

  if (error && error.code !== '23505') {
    throw error
  }
}

/**
 * Unsave a feed item
 */
export async function unsaveFeedItem(itemId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('feed_interactions')
    .delete()
    .eq('user_id', user.id)
    .eq('feed_item_id', itemId)
    .eq('interaction_type', 'save')

  if (error) throw error
}

/**
 * Hide a feed item (won't show in user's feed anymore)
 */
export async function hideFeedItem(itemId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('feed_interactions')
    .insert({
      user_id: user.id,
      feed_item_id: itemId,
      interaction_type: 'hide'
    })

  if (error && error.code !== '23505') {
    throw error
  }
}

/**
 * Report a feed item
 */
export async function reportFeedItem(itemId: string, reason?: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('feed_interactions')
    .insert({
      user_id: user.id,
      feed_item_id: itemId,
      interaction_type: 'report'
    })

  if (error && error.code !== '23505') {
    throw error
  }

  // TODO: Create a report record with reason for admin review
}

// =====================================================
// COMMENTS
// =====================================================

/**
 * Get comments for a feed item
 */
export async function getComments(
  itemId: string,
  limit = 20,
  offset = 0
): Promise<FeedComment[]> {
  const { data, error } = await supabase
    .from('feed_comments')
    .select(`
      *,
      user:profiles!user_id (
        display_name,
        avatar_url
      ),
      replies:feed_comments!parent_comment_id (
        *,
        user:profiles!user_id (
          display_name,
          avatar_url
        )
      )
    `)
    .eq('feed_item_id', itemId)
    .is('parent_comment_id', null) // Only top-level comments
    .order('created_at', { ascending: true })
    .range(offset, offset + limit - 1)

  if (error) throw error
  return data || []
}

/**
 * Add a comment to a feed item
 */
export async function addComment(
  itemId: string,
  content: string,
  parentCommentId?: string
): Promise<FeedComment> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('feed_comments')
    .insert({
      feed_item_id: itemId,
      user_id: user.id,
      content,
      parent_comment_id: parentCommentId || null
    })
    .select(`
      *,
      user:profiles!user_id (
        display_name,
        avatar_url
      )
    `)
    .single()

  if (error) throw error
  return data
}

/**
 * Delete a comment
 */
export async function deleteComment(commentId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('feed_comments')
    .delete()
    .eq('id', commentId)
    .eq('user_id', user.id) // Ensure user owns the comment

  if (error) throw error
}

// =====================================================
// FOLLOWS
// =====================================================

/**
 * Follow a user
 */
export async function followUser(userId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  if (user.id === userId) throw new Error('Cannot follow yourself')

  const { error } = await supabase
    .from('user_follows')
    .insert({
      follower_id: user.id,
      following_id: userId
    })

  if (error && error.code !== '23505') {
    throw error
  }
}

/**
 * Unfollow a user
 */
export async function unfollowUser(userId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('user_follows')
    .delete()
    .eq('follower_id', user.id)
    .eq('following_id', userId)

  if (error) throw error
}

/**
 * Check if current user is following another user
 */
export async function isFollowing(userId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data, error } = await supabase
    .from('user_follows')
    .select('id')
    .eq('follower_id', user.id)
    .eq('following_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return !!data
}

/**
 * Get followers of a user
 */
export async function getFollowers(
  userId: string,
  limit = 20,
  offset = 0
): Promise<any[]> {
  const { data, error } = await supabase
    .from('user_follows')
    .select(`
      *,
      follower:profiles!follower_id (
        id,
        display_name,
        avatar_url,
        role,
        specialty
      )
    `)
    .eq('following_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error
  return (data || []).map(d => d.follower)
}

/**
 * Get users that a user is following
 */
export async function getFollowing(
  userId: string,
  limit = 20,
  offset = 0
): Promise<any[]> {
  const { data, error } = await supabase
    .from('user_follows')
    .select(`
      *,
      following:profiles!following_id (
        id,
        display_name,
        avatar_url,
        role,
        specialty
      )
    `)
    .eq('follower_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error
  return (data || []).map(d => d.following)
}

/**
 * Get follow counts for a user
 */
export async function getFollowCounts(userId: string): Promise<{
  followers: number
  following: number
}> {
  const [followersResult, followingResult] = await Promise.all([
    supabase
      .from('user_follows')
      .select('id', { count: 'exact', head: true })
      .eq('following_id', userId),
    supabase
      .from('user_follows')
      .select('id', { count: 'exact', head: true })
      .eq('follower_id', userId)
  ])

  return {
    followers: followersResult.count || 0,
    following: followingResult.count || 0
  }
}

// =====================================================
// CREATE FEED ITEM (for portfolio updates)
// =====================================================

/**
 * Create a portfolio update feed item
 */
export async function createPortfolioFeedItem(
  title: string,
  description?: string,
  imageUrls?: string[]
): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase.rpc('create_portfolio_feed_item', {
    p_user_id: user.id,
    p_title: title,
    p_description: description || null,
    p_image_urls: imageUrls || []
  })

  if (error) throw error
  return data
}

// =====================================================
// REAL-TIME SUBSCRIPTIONS
// =====================================================

/**
 * Subscribe to new feed items
 */
export function subscribeToFeed(
  onNewItem: (item: any) => void
): () => void {
  const channel = supabase
    .channel('feed_items_channel')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'feed_items'
      },
      (payload) => {
        onNewItem(payload.new)
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

/**
 * Subscribe to comments on a specific feed item
 */
export function subscribeToComments(
  itemId: string,
  onNewComment: (comment: any) => void
): () => void {
  const channel = supabase
    .channel(`feed_comments_${itemId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'feed_comments',
        filter: `feed_item_id=eq.${itemId}`
      },
      (payload) => {
        onNewComment(payload.new)
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

// =====================================================
// USER LOCATION
// =====================================================

/**
 * Update user's location in their profile
 */
export async function updateUserLocation(
  latitude: number,
  longitude: number,
  city?: string
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('profiles')
    .update({
      latitude,
      longitude,
      city: city || undefined
    })
    .eq('id', user.id)

  if (error) throw error
}

/**
 * Get user's saved location from profile
 */
export async function getUserLocation(): Promise<{
  latitude: number | null
  longitude: number | null
  city: string | null
} | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('latitude, longitude, city')
    .eq('id', user.id)
    .single()

  if (error) return null
  return data
}
