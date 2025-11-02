import { supabase, Message } from '../lib/supabase'

export async function listMyMessages(userId: string) {
  const { data, error } = await supabase
    .from('messages')
    .select('*, from:profiles!messages_from_id_fkey(display_name, avatar_url), to:profiles!messages_to_id_fkey(display_name, avatar_url)')
    .or(`from_id.eq.${userId},to_id.eq.${userId}`)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getConversation(userId: string, otherUserId: string) {
  const { data, error } = await supabase
    .from('messages')
    .select('*, from:profiles!messages_from_id_fkey(display_name, avatar_url), to:profiles!messages_to_id_fkey(display_name, avatar_url)')
    .or(`and(from_id.eq.${userId},to_id.eq.${otherUserId}),and(from_id.eq.${otherUserId},to_id.eq.${userId})`)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data
}

export async function sendMessage(message: Omit<Message, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('messages')
    .insert(message)
    .select()
    .single()

  if (error) throw error
  return data as Message
}
