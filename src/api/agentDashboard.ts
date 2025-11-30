/**
 * AGENT DASHBOARD API
 * For agents managing multiple entertainers/talent
 *
 * Features:
 * - View all managed talent in one place
 * - See combined calendar across all talent
 * - Track bookings and earnings
 * - Manage talent relationships
 */

import { supabase } from '../lib/supabase'

// =====================================================
// TYPES
// =====================================================

export type RelationshipStatus = 'pending' | 'active' | 'inactive' | 'terminated'
export type CommissionType = 'percentage' | 'flat' | 'hourly'

export interface AgentTalentRelationship {
  id: string
  agent_id: string
  talent_id: string
  status: RelationshipStatus
  commission_rate: number
  commission_type: CommissionType
  flat_commission_amount?: number | null
  can_accept_bookings: boolean
  can_decline_bookings: boolean
  can_manage_calendar: boolean
  can_view_earnings: boolean
  can_message_clients: boolean
  contract_start_date?: string | null
  contract_end_date?: string | null
  notes?: string | null
  created_at: string
  updated_at: string
  accepted_at?: string | null
  // Joined data
  talent_profile?: {
    id: string
    display_name: string
    avatar_url?: string
    role?: string
    specialty?: string
    hourly_rate?: number
    daily_rate?: number
  }
}

export interface AgentDashboardStats {
  total_talent: number
  pending_requests: number
  total_bookings_this_month: number
  total_earnings_this_month: number
  upcoming_bookings: number
}

export interface TalentCalendarEvent {
  talent_id: string
  talent_name: string
  talent_avatar?: string
  event_date: string
  event_type: 'booking' | 'block'
  event_status: string
  event_details: {
    booking_id?: string
    block_id?: string
    client_name?: string
    total_amount?: number
    service_description?: string
    notes?: string
    visibility_message?: string
  }
}

export interface InviteTalentParams {
  talent_email?: string
  talent_id?: string
  commission_rate?: number
  commission_type?: CommissionType
  can_accept_bookings?: boolean
  can_decline_bookings?: boolean
  can_manage_calendar?: boolean
  can_view_earnings?: boolean
  can_message_clients?: boolean
  notes?: string
}

// =====================================================
// GET AGENT DASHBOARD STATS
// =====================================================

/**
 * Get aggregated statistics for the agent dashboard
 */
export async function getAgentDashboardStats(): Promise<AgentDashboardStats> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  // Try RPC function first
  const { data: rpcData, error: rpcError } = await supabase
    .rpc('get_agent_dashboard_stats', { p_agent_id: user.id })

  if (!rpcError && rpcData) {
    return rpcData as AgentDashboardStats
  }

  // Fallback: Calculate manually
  const [talentResult, bookingsResult] = await Promise.all([
    supabase
      .from('agent_talent_relationships')
      .select('id, status')
      .eq('agent_id', user.id),
    supabase
      .from('bookings')
      .select('id, total_amount, status, created_at, completed_at, start_date, freelancer_id')
      .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
  ])

  const relationships = talentResult.data || []
  const activeTalentIds = relationships
    .filter(r => r.status === 'active')
    .map(r => r.id)

  const bookings = (bookingsResult.data || []).filter(b =>
    activeTalentIds.includes(b.freelancer_id)
  )

  return {
    total_talent: relationships.filter(r => r.status === 'active').length,
    pending_requests: relationships.filter(r => r.status === 'pending').length,
    total_bookings_this_month: bookings.length,
    total_earnings_this_month: bookings
      .filter(b => ['completed', 'paid'].includes(b.status))
      .reduce((sum, b) => sum + (b.total_amount * 0.1), 0), // Default 10% commission
    upcoming_bookings: bookings
      .filter(b => ['accepted', 'in_progress'].includes(b.status) && new Date(b.start_date) >= new Date())
      .length
  }
}

// =====================================================
// MANAGE TALENT RELATIONSHIPS
// =====================================================

/**
 * Get all talent managed by the agent
 */
export async function getManagedTalent(): Promise<AgentTalentRelationship[]> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('agent_talent_relationships')
    .select(`
      *,
      talent_profile:profiles!agent_talent_relationships_talent_id_fkey(
        id, display_name, avatar_url, role, specialty, hourly_rate, daily_rate
      )
    `)
    .eq('agent_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch managed talent:', error)
    throw error
  }

  return data as AgentTalentRelationship[]
}

/**
 * Invite talent to be managed by the agent
 */
export async function inviteTalent(params: InviteTalentParams): Promise<AgentTalentRelationship> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  let talentId = params.talent_id

  // If email provided instead of ID, look up the profile
  if (!talentId && params.talent_email) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', params.talent_email)
      .single()

    if (!profile) {
      throw new Error('Talent not found with that email')
    }
    talentId = profile.id
  }

  if (!talentId) {
    throw new Error('Either talent_id or talent_email must be provided')
  }

  const { data, error } = await supabase
    .from('agent_talent_relationships')
    .insert({
      agent_id: user.id,
      talent_id: talentId,
      status: 'pending',
      commission_rate: params.commission_rate || 10,
      commission_type: params.commission_type || 'percentage',
      can_accept_bookings: params.can_accept_bookings || false,
      can_decline_bookings: params.can_decline_bookings || false,
      can_manage_calendar: params.can_manage_calendar || false,
      can_view_earnings: params.can_view_earnings || false,
      can_message_clients: params.can_message_clients || false,
      notes: params.notes || null
    })
    .select()
    .single()

  if (error) {
    console.error('Failed to invite talent:', error)
    throw error
  }

  return data as AgentTalentRelationship
}

/**
 * Update talent relationship settings
 */
export async function updateTalentRelationship(
  relationshipId: string,
  updates: Partial<Omit<AgentTalentRelationship, 'id' | 'agent_id' | 'talent_id' | 'created_at'>>
): Promise<AgentTalentRelationship> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('agent_talent_relationships')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', relationshipId)
    .eq('agent_id', user.id)
    .select()
    .single()

  if (error) {
    console.error('Failed to update relationship:', error)
    throw error
  }

  return data as AgentTalentRelationship
}

/**
 * Remove talent from management (terminate relationship)
 */
export async function removeTalent(relationshipId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { error } = await supabase
    .from('agent_talent_relationships')
    .update({
      status: 'terminated',
      updated_at: new Date().toISOString()
    })
    .eq('id', relationshipId)
    .eq('agent_id', user.id)

  if (error) {
    console.error('Failed to remove talent:', error)
    throw error
  }
}

// =====================================================
// TALENT CALENDAR VIEW
// =====================================================

/**
 * Get combined calendar for all managed talent
 */
export async function getTalentCalendar(
  startDate: Date,
  endDate: Date,
  talentIds?: string[]
): Promise<TalentCalendarEvent[]> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  // Try RPC function first
  const { data: rpcData, error: rpcError } = await supabase
    .rpc('get_agent_talent_calendar', {
      p_agent_id: user.id,
      p_start_date: startDate.toISOString().split('T')[0],
      p_end_date: endDate.toISOString().split('T')[0]
    })

  if (!rpcError && rpcData) {
    let events = rpcData as TalentCalendarEvent[]
    if (talentIds && talentIds.length > 0) {
      events = events.filter(e => talentIds.includes(e.talent_id))
    }
    return events
  }

  // Fallback: Build manually
  // First get managed talent
  const { data: relationships } = await supabase
    .from('agent_talent_relationships')
    .select('talent_id, talent_profile:profiles!agent_talent_relationships_talent_id_fkey(id, display_name, avatar_url)')
    .eq('agent_id', user.id)
    .eq('status', 'active')

  if (!relationships || relationships.length === 0) {
    return []
  }

  const managedTalentIds = talentIds && talentIds.length > 0
    ? relationships.filter(r => talentIds.includes(r.talent_id)).map(r => r.talent_id)
    : relationships.map(r => r.talent_id)

  // Get bookings
  const { data: bookings } = await supabase
    .from('bookings')
    .select('*, client_profile:profiles!bookings_client_id_fkey(display_name)')
    .in('freelancer_id', managedTalentIds)
    .gte('start_date', startDate.toISOString())
    .lte('start_date', endDate.toISOString())

  // Get calendar blocks
  const { data: blocks } = await supabase
    .from('calendar_blocks')
    .select('*')
    .in('user_id', managedTalentIds)
    .gte('start_date', startDate.toISOString())
    .lte('start_date', endDate.toISOString())

  const events: TalentCalendarEvent[] = []

  // Map bookings to events
  for (const booking of (bookings || [])) {
    const talent = relationships.find(r => r.talent_id === booking.freelancer_id)
    events.push({
      talent_id: booking.freelancer_id,
      talent_name: (talent?.talent_profile as any)?.display_name || 'Unknown',
      talent_avatar: (talent?.talent_profile as any)?.avatar_url,
      event_date: booking.start_date.split('T')[0],
      event_type: 'booking',
      event_status: booking.status,
      event_details: {
        booking_id: booking.id,
        client_name: booking.client_profile?.display_name,
        total_amount: booking.total_amount,
        service_description: booking.service_description
      }
    })
  }

  // Map blocks to events
  for (const block of (blocks || [])) {
    const talent = relationships.find(r => r.talent_id === block.user_id)
    events.push({
      talent_id: block.user_id,
      talent_name: (talent?.talent_profile as any)?.display_name || 'Unknown',
      talent_avatar: (talent?.talent_profile as any)?.avatar_url,
      event_date: block.start_date.split('T')[0],
      event_type: 'block',
      event_status: block.reason,
      event_details: {
        block_id: block.id,
        notes: block.notes,
        visibility_message: block.visibility_message
      }
    })
  }

  return events.sort((a, b) => a.event_date.localeCompare(b.event_date))
}

// =====================================================
// TALENT PERSPECTIVE (Accept/Decline Agent Invite)
// =====================================================

/**
 * Get pending agent invitations for a talent
 */
export async function getPendingAgentInvites(): Promise<AgentTalentRelationship[]> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('agent_talent_relationships')
    .select(`
      *,
      agent_profile:profiles!agent_talent_relationships_agent_id_fkey(
        id, display_name, avatar_url, agent_bio, agent_website_url
      )
    `)
    .eq('talent_id', user.id)
    .eq('status', 'pending')

  if (error) {
    console.error('Failed to fetch agent invites:', error)
    throw error
  }

  return data as AgentTalentRelationship[]
}

/**
 * Accept an agent invitation
 */
export async function acceptAgentInvite(relationshipId: string): Promise<AgentTalentRelationship> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('agent_talent_relationships')
    .update({
      status: 'active',
      accepted_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', relationshipId)
    .eq('talent_id', user.id)
    .eq('status', 'pending')
    .select()
    .single()

  if (error) {
    console.error('Failed to accept invite:', error)
    throw error
  }

  return data as AgentTalentRelationship
}

/**
 * Decline an agent invitation
 */
export async function declineAgentInvite(relationshipId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { error } = await supabase
    .from('agent_talent_relationships')
    .update({
      status: 'terminated',
      updated_at: new Date().toISOString()
    })
    .eq('id', relationshipId)
    .eq('talent_id', user.id)
    .eq('status', 'pending')

  if (error) {
    console.error('Failed to decline invite:', error)
    throw error
  }
}

// =====================================================
// EXPORTS
// =====================================================

export default {
  getAgentDashboardStats,
  getManagedTalent,
  inviteTalent,
  updateTalentRelationship,
  removeTalent,
  getTalentCalendar,
  getPendingAgentInvites,
  acceptAgentInvite,
  declineAgentInvite
}
