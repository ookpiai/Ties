/**
 * Notifications API
 *
 * Handles all notification-related operations including:
 * - Fetching notifications
 * - Marking as read
 * - Real-time subscriptions
 * - Notification preferences
 */

import { supabase } from '../lib/supabase'

export interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  message: string
  related_id?: string
  related_type?: string
  related_url?: string
  sender_id?: string
  sender_name?: string
  sender_avatar?: string
  is_read: boolean
  is_archived: boolean
  metadata?: Record<string, any>
  created_at: string
  read_at?: string
}

export interface NotificationPreferences {
  id: string
  user_id: string
  email_booking_updates: boolean
  email_messages: boolean
  email_job_updates: boolean
  email_marketing: boolean
  email_weekly_digest: boolean
  push_booking_updates: boolean
  push_messages: boolean
  push_job_updates: boolean
  inapp_all: boolean
  inapp_tips: boolean
  quiet_hours_enabled: boolean
  quiet_hours_start: string
  quiet_hours_end: string
}

/**
 * Get notifications for the current user
 */
export async function getNotifications(options?: {
  limit?: number
  offset?: number
  unreadOnly?: boolean
  type?: string
}): Promise<{ data: Notification[], count: number }> {
  const { limit = 20, offset = 0, unreadOnly = false, type } = options || {}

  let query = supabase
    .from('notifications')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (unreadOnly) {
    query = query.eq('is_read', false)
  }

  if (type) {
    query = query.eq('type', type)
  }

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching notifications:', error)
    return { data: [], count: 0 }
  }

  return { data: data || [], count: count || 0 }
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(): Promise<number> {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('is_read', false)

  if (error) {
    console.error('Error getting unread count:', error)
    return 0
  }

  return count || 0
}

/**
 * Mark notifications as read
 */
export async function markAsRead(notificationIds?: string[]): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  let query = supabase
    .from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .eq('is_read', false)

  if (notificationIds && notificationIds.length > 0) {
    query = query.in('id', notificationIds)
  }

  const { error } = await query

  if (error) {
    console.error('Error marking notifications as read:', error)
    return false
  }

  return true
}

/**
 * Mark a single notification as read
 */
export async function markOneAsRead(notificationId: string): Promise<boolean> {
  return markAsRead([notificationId])
}

/**
 * Archive a notification
 */
export async function archiveNotification(notificationId: string): Promise<boolean> {
  const { error } = await supabase
    .from('notifications')
    .update({ is_archived: true })
    .eq('id', notificationId)

  if (error) {
    console.error('Error archiving notification:', error)
    return false
  }

  return true
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string): Promise<boolean> {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId)

  if (error) {
    console.error('Error deleting notification:', error)
    return false
  }

  return true
}

/**
 * Subscribe to real-time notifications
 */
export function subscribeToNotifications(
  userId: string,
  onNewNotification: (notification: Notification) => void
) {
  const channel = supabase
    .channel(`notifications:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        onNewNotification(payload.new as Notification)
      }
    )
    .subscribe()

  return {
    unsubscribe: () => {
      supabase.removeChannel(channel)
    }
  }
}

/**
 * Get notification preferences
 */
export async function getNotificationPreferences(): Promise<NotificationPreferences | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error) {
    // Create default preferences if they don't exist
    if (error.code === 'PGRST116') {
      const { data: newData, error: insertError } = await supabase
        .from('notification_preferences')
        .insert({ user_id: user.id })
        .select()
        .single()

      if (insertError) {
        console.error('Error creating notification preferences:', insertError)
        return null
      }

      return newData
    }

    console.error('Error fetching notification preferences:', error)
    return null
  }

  return data
}

/**
 * Update notification preferences
 */
export async function updateNotificationPreferences(
  preferences: Partial<NotificationPreferences>
): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { error } = await supabase
    .from('notification_preferences')
    .upsert({
      user_id: user.id,
      ...preferences,
      updated_at: new Date().toISOString()
    })

  if (error) {
    console.error('Error updating notification preferences:', error)
    return false
  }

  return true
}

/**
 * Create a notification (for client-side triggered notifications)
 */
export async function createNotification(params: {
  userId: string
  type: string
  title: string
  message: string
  relatedId?: string
  relatedType?: string
  relatedUrl?: string
  senderId?: string
  metadata?: Record<string, any>
}): Promise<string | null> {
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      user_id: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      related_id: params.relatedId,
      related_type: params.relatedType,
      related_url: params.relatedUrl,
      sender_id: params.senderId,
      metadata: params.metadata || {}
    })
    .select('id')
    .single()

  if (error) {
    console.error('Error creating notification:', error)
    return null
  }

  return data?.id || null
}

/**
 * Get notification icon based on type
 */
export function getNotificationIcon(type: string): string {
  const icons: Record<string, string> = {
    booking_request: 'calendar-plus',
    booking_confirmed: 'calendar-check',
    booking_declined: 'calendar-x',
    booking_cancelled: 'calendar-x',
    booking_completed: 'check-circle',
    booking_reminder: 'bell',
    message_received: 'message-circle',
    job_application: 'briefcase',
    job_application_status: 'briefcase',
    job_match: 'search',
    profile_view: 'eye',
    review_received: 'star',
    payment_received: 'dollar-sign',
    payment_pending: 'clock',
    badge_earned: 'award',
    badge_expiring: 'alert-triangle',
    system_announcement: 'info',
    tip: 'lightbulb',
    follow: 'user-plus',
    mention: 'at-sign'
  }

  return icons[type] || 'bell'
}

/**
 * Get notification color based on type
 */
export function getNotificationColor(type: string): string {
  const colors: Record<string, string> = {
    booking_request: 'blue',
    booking_confirmed: 'green',
    booking_declined: 'red',
    booking_cancelled: 'red',
    booking_completed: 'green',
    booking_reminder: 'orange',
    message_received: 'blue',
    job_application: 'purple',
    job_application_status: 'purple',
    job_match: 'purple',
    profile_view: 'gray',
    review_received: 'yellow',
    payment_received: 'green',
    payment_pending: 'orange',
    badge_earned: 'yellow',
    badge_expiring: 'orange',
    system_announcement: 'blue',
    tip: 'emerald',
    follow: 'blue',
    mention: 'purple'
  }

  return colors[type] || 'gray'
}
