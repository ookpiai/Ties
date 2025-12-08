import { supabase, Message } from '../lib/supabase'

// ============================================
// TYPES
// ============================================

export interface JobContext {
  id: string
  title: string
  location: string | null
  event_type: string | null
  start_date: string
  organiser: {
    id: string
    display_name: string
    avatar_url: string | null
  }
}

export interface ConversationPreview {
  otherUser: {
    id: string
    display_name: string
    avatar_url: string | null
    role: string
  }
  lastMessage: {
    body: string
    created_at: string
    from_id: string
    read: boolean
  } | null
  unreadCount: number
  // Job context for conversations started from a job posting
  jobContext?: JobContext | null
}

export interface MessageWithProfiles extends Message {
  from?: {
    display_name: string
    avatar_url: string | null
  }
  to?: {
    display_name: string
    avatar_url: string | null
  }
  // Job context fields
  job_id?: string | null
  context_type?: string | null
  job?: JobContext | null
}

// ============================================
// HELPER FUNCTIONS
// ============================================

async function getCurrentUserId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  return user.id
}

// ============================================
// CONVERSATION MANAGEMENT
// ============================================

/**
 * Get all conversations for the current user
 * Groups messages by conversation partner and returns preview data
 */
export async function getMyConversations() {
  try {
    const userId = await getCurrentUserId()

    // Get all messages involving this user, including job context
    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        *,
        from:profiles!messages_from_id_fkey(id, display_name, avatar_url, role),
        to:profiles!messages_to_id_fkey(id, display_name, avatar_url, role),
        job:job_postings!messages_job_id_fkey(
          id,
          title,
          location,
          event_type,
          start_date,
          organiser:profiles!job_postings_organiser_id_fkey(id, display_name, avatar_url)
        )
      `)
      .or(`from_id.eq.${userId},to_id.eq.${userId}`)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Group messages by conversation partner
    const conversationMap = new Map<string, ConversationPreview>()

    messages?.forEach((msg: any) => {
      const isFromMe = msg.from_id === userId
      const otherUser = isFromMe ? msg.to : msg.from
      const otherUserId = otherUser.id

      if (!conversationMap.has(otherUserId)) {
        conversationMap.set(otherUserId, {
          otherUser,
          lastMessage: {
            body: msg.body,
            created_at: msg.created_at,
            from_id: msg.from_id,
            read: msg.read
          },
          unreadCount: 0,
          // Get job context from first message in conversation (if any)
          jobContext: msg.job || null
        })
      }

      // Count unread messages (messages TO me that are unread)
      if (msg.to_id === userId && !msg.read) {
        const conversation = conversationMap.get(otherUserId)!
        conversation.unreadCount++
      }
    })

    return {
      success: true,
      data: Array.from(conversationMap.values())
    }
  } catch (error: any) {
    console.error('Error fetching conversations:', error)
    return {
      success: false,
      error: error.message || 'Failed to fetch conversations'
    }
  }
}

/**
 * Get all messages in a conversation with another user
 */
export async function getConversation(otherUserId: string) {
  try {
    const userId = await getCurrentUserId()

    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        from:profiles!messages_from_id_fkey(display_name, avatar_url),
        to:profiles!messages_to_id_fkey(display_name, avatar_url),
        job:job_postings!messages_job_id_fkey(
          id,
          title,
          location,
          event_type,
          start_date,
          organiser:profiles!job_postings_organiser_id_fkey(id, display_name, avatar_url)
        )
      `)
      .or(`and(from_id.eq.${userId},to_id.eq.${otherUserId}),and(from_id.eq.${otherUserId},to_id.eq.${userId})`)
      .order('created_at', { ascending: true })

    if (error) throw error

    return {
      success: true,
      data: data as MessageWithProfiles[]
    }
  } catch (error: any) {
    console.error('Error fetching conversation:', error)
    return {
      success: false,
      error: error.message || 'Failed to fetch conversation'
    }
  }
}

/**
 * Get the job context for a conversation (if any)
 * Returns the job info from the first message with a job_id
 */
export async function getConversationJobContext(otherUserId: string) {
  try {
    const userId = await getCurrentUserId()

    const { data, error } = await supabase
      .from('messages')
      .select(`
        job_id,
        context_type,
        job:job_postings!messages_job_id_fkey(
          id,
          title,
          location,
          event_type,
          start_date,
          organiser:profiles!job_postings_organiser_id_fkey(id, display_name, avatar_url)
        )
      `)
      .or(`and(from_id.eq.${userId},to_id.eq.${otherUserId}),and(from_id.eq.${otherUserId},to_id.eq.${userId})`)
      .not('job_id', 'is', null)
      .order('created_at', { ascending: true })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows returned

    return {
      success: true,
      data: data?.job || null
    }
  } catch (error: any) {
    console.error('Error fetching conversation job context:', error)
    return {
      success: false,
      error: error.message || 'Failed to fetch job context'
    }
  }
}

/**
 * Subscribe to new messages in a conversation
 */
export function subscribeToConversation(
  otherUserId: string,
  callback: (message: MessageWithProfiles) => void
) {
  const channel = supabase
    .channel('conversation_changes')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `from_id=eq.${otherUserId}`
      },
      async (payload) => {
        // Fetch the full message with profile data
        const { data } = await supabase
          .from('messages')
          .select(`
            *,
            from:profiles!messages_from_id_fkey(display_name, avatar_url),
            to:profiles!messages_to_id_fkey(display_name, avatar_url),
            job:job_postings!messages_job_id_fkey(
              id,
              title,
              location,
              event_type,
              start_date,
              organiser:profiles!job_postings_organiser_id_fkey(id, display_name, avatar_url)
            )
          `)
          .eq('id', payload.new.id)
          .single()

        if (data) {
          callback(data as MessageWithProfiles)
        }
      }
    )
    .subscribe()

  return channel
}

/**
 * Subscribe to all conversations (for conversation list updates)
 */
export function subscribeToAllMessages(callback: () => void) {
  const channel = supabase
    .channel('all_messages')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'messages'
      },
      () => {
        callback()
      }
    )
    .subscribe()

  return channel
}

// ============================================
// MESSAGE ACTIONS
// ============================================

/**
 * Send a message to another user
 * Optionally with job context (when messaging about a specific job)
 */
export async function sendMessage(
  toUserId: string,
  body: string,
  options?: {
    jobId?: string
    contextType?: 'job' | 'booking' | 'portfolio'
  }
) {
  try {
    const userId = await getCurrentUserId()

    const messageData: any = {
      from_id: userId,
      to_id: toUserId,
      body
    }

    // Add job context if provided
    if (options?.jobId) {
      messageData.job_id = options.jobId
      messageData.context_type = options.contextType || 'job'
    }

    const { data, error } = await supabase
      .from('messages')
      .insert(messageData)
      .select(`
        *,
        from:profiles!messages_from_id_fkey(display_name, avatar_url),
        to:profiles!messages_to_id_fkey(display_name, avatar_url),
        job:job_postings!messages_job_id_fkey(
          id,
          title,
          location,
          event_type,
          start_date,
          organiser:profiles!job_postings_organiser_id_fkey(id, display_name, avatar_url)
        )
      `)
      .single()

    if (error) throw error

    return {
      success: true,
      data: data as MessageWithProfiles
    }
  } catch (error: any) {
    console.error('Error sending message:', error)
    return {
      success: false,
      error: error.message || 'Failed to send message'
    }
  }
}

/**
 * Send a message about a specific job posting
 * This is a convenience wrapper for sendMessage with job context
 */
export async function sendMessageAboutJob(
  toUserId: string,
  body: string,
  jobId: string
) {
  return sendMessage(toUserId, body, {
    jobId,
    contextType: 'job'
  })
}

/**
 * Mark a message as read
 */
export async function markMessageAsRead(messageId: string) {
  try {
    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('id', messageId)

    if (error) throw error

    return { success: true }
  } catch (error: any) {
    console.error('Error marking message as read:', error)
    return {
      success: false,
      error: error.message || 'Failed to mark message as read'
    }
  }
}

/**
 * Mark all messages in a conversation as read
 */
export async function markConversationAsRead(otherUserId: string) {
  try {
    const userId = await getCurrentUserId()

    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('from_id', otherUserId)
      .eq('to_id', userId)
      .eq('read', false)

    if (error) throw error

    return { success: true }
  } catch (error: any) {
    console.error('Error marking conversation as read:', error)
    return {
      success: false,
      error: error.message || 'Failed to mark conversation as read'
    }
  }
}

/**
 * Delete a message (sender only)
 */
export async function deleteMessage(messageId: string) {
  try {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId)

    if (error) throw error

    return { success: true }
  } catch (error: any) {
    console.error('Error deleting message:', error)
    return {
      success: false,
      error: error.message || 'Failed to delete message'
    }
  }
}

/**
 * Search all users to start a new conversation
 */
export async function searchUsers(query: string) {
  try {
    const userId = await getCurrentUserId()

    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url, role')
      .neq('id', userId) // Exclude current user
      .or(`display_name.ilike.%${query}%,email.ilike.%${query}%`)
      .limit(10)

    if (error) throw error

    return {
      success: true,
      data
    }
  } catch (error: any) {
    console.error('Error searching users:', error)
    return {
      success: false,
      error: error.message || 'Failed to search users'
    }
  }
}

// Export all functions
export default {
  getMyConversations,
  getConversation,
  getConversationJobContext,
  subscribeToConversation,
  subscribeToAllMessages,
  sendMessage,
  sendMessageAboutJob,
  markMessageAsRead,
  markConversationAsRead,
  deleteMessage,
  searchUsers
}
