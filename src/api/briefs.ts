/**
 * BRIEFS API - Simple Behance-style private project proposals
 */

import { supabase } from '../lib/supabase'

export interface Brief {
  id: string
  sender_id: string
  recipient_id: string
  title: string
  description: string
  budget: number | null
  deadline: string | null
  status: 'pending' | 'accepted' | 'declined' | 'withdrawn'
  response_note: string | null
  responded_at: string | null
  booking_id: string | null
  created_at: string
  // Joined
  sender?: {
    id: string
    display_name: string
    avatar_url: string | null
  }
  recipient?: {
    id: string
    display_name: string
    avatar_url: string | null
  }
}

async function getCurrentUserId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  return user.id
}

/**
 * Send a brief to another user
 */
export async function sendBrief(
  recipientId: string,
  title: string,
  description: string,
  budget?: number,
  deadline?: string
): Promise<{ success: boolean; data?: Brief; error?: string }> {
  try {
    const senderId = await getCurrentUserId()

    // Create the brief
    const { data, error } = await supabase
      .from('briefs')
      .insert({
        sender_id: senderId,
        recipient_id: recipientId,
        title,
        description,
        budget: budget || null,
        deadline: deadline || null,
        status: 'pending'
      })
      .select()
      .single()

    if (error) throw error

    // Send a message notification
    await supabase.from('messages').insert({
      from_id: senderId,
      to_id: recipientId,
      body: `📋 I've sent you a project brief: "${title}"`
    })

    // Create notification
    await supabase.from('notifications').insert({
      user_id: recipientId,
      type: 'brief_received',
      title: 'New Project Brief',
      message: `You received a project brief: ${title}`,
      data: { brief_id: data.id },
      link: '/messages'
    })

    return { success: true, data }
  } catch (error: any) {
    console.error('Error sending brief:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get briefs for a conversation (between current user and another user)
 */
export async function getConversationBriefs(
  otherUserId: string
): Promise<{ success: boolean; data: Brief[]; error?: string }> {
  try {
    const userId = await getCurrentUserId()

    const { data, error } = await supabase
      .from('briefs')
      .select(`
        *,
        sender:profiles!briefs_sender_id_fkey(id, display_name, avatar_url),
        recipient:profiles!briefs_recipient_id_fkey(id, display_name, avatar_url)
      `)
      .or(`and(sender_id.eq.${userId},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${userId})`)
      .order('created_at', { ascending: false })

    if (error) throw error

    return { success: true, data: data || [] }
  } catch (error: any) {
    console.error('Error getting briefs:', error)
    return { success: false, data: [], error: error.message }
  }
}

/**
 * Accept a brief
 */
export async function acceptBrief(
  briefId: string,
  responseNote?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = await getCurrentUserId()

    const { data, error } = await supabase
      .from('briefs')
      .update({
        status: 'accepted',
        response_note: responseNote || null,
        responded_at: new Date().toISOString()
      })
      .eq('id', briefId)
      .eq('recipient_id', userId)
      .eq('status', 'pending')
      .select('sender_id, title')
      .single()

    if (error) throw error

    // Notify sender
    await supabase.from('notifications').insert({
      user_id: data.sender_id,
      type: 'brief_accepted',
      title: 'Brief Accepted!',
      message: `Your brief "${data.title}" was accepted`,
      data: { brief_id: briefId },
      link: '/messages'
    })

    // Send message
    await supabase.from('messages').insert({
      from_id: userId,
      to_id: data.sender_id,
      body: `✅ I've accepted your brief: "${data.title}"${responseNote ? ` - ${responseNote}` : ''}`
    })

    return { success: true }
  } catch (error: any) {
    console.error('Error accepting brief:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Decline a brief
 */
export async function declineBrief(
  briefId: string,
  responseNote?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = await getCurrentUserId()

    const { data, error } = await supabase
      .from('briefs')
      .update({
        status: 'declined',
        response_note: responseNote || null,
        responded_at: new Date().toISOString()
      })
      .eq('id', briefId)
      .eq('recipient_id', userId)
      .eq('status', 'pending')
      .select('sender_id, title')
      .single()

    if (error) throw error

    // Notify sender
    await supabase.from('notifications').insert({
      user_id: data.sender_id,
      type: 'brief_declined',
      title: 'Brief Declined',
      message: `Your brief "${data.title}" was declined`,
      data: { brief_id: briefId },
      link: '/messages'
    })

    return { success: true }
  } catch (error: any) {
    console.error('Error declining brief:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Withdraw a brief (sender only)
 */
export async function withdrawBrief(
  briefId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = await getCurrentUserId()

    const { error } = await supabase
      .from('briefs')
      .update({ status: 'withdrawn' })
      .eq('id', briefId)
      .eq('sender_id', userId)
      .eq('status', 'pending')

    if (error) throw error

    return { success: true }
  } catch (error: any) {
    console.error('Error withdrawing brief:', error)
    return { success: false, error: error.message }
  }
}
