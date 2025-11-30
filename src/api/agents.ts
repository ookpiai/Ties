/**
 * AGENTS API LAYER
 * Booking MVP - Agent Mode Integration
 *
 * Handles all agent-related operations:
 * - Agent-Freelancer representation links
 * - Booking routing and management on behalf of freelancers
 * - Agent dashboard data
 */

import { supabase } from '../lib/supabase'

// =====================================================
// TYPESCRIPT INTERFACES
// =====================================================

export type AgentLinkStatus = 'pending' | 'approved' | 'removed'
export type AgentRoutingPreference = 'route_to_me' | 'route_to_agent' | 'route_to_both'
export type AgentVerificationStatus = 'not_submitted' | 'pending_review' | 'approved' | 'rejected' | 'flagged'

// Agent Industry Tags
export const AGENT_INDUSTRY_TAGS = [
  'Music',
  'DJ',
  'Photography',
  'Videography',
  'Entertainment',
  'Events',
  'Corporate',
  'Weddings',
  'Modeling',
  'Acting',
  'Voice Over',
  'Dance',
  'Comedy',
  'Magic',
  'Other'
] as const

export interface AgentVerificationData {
  websiteUrl: string
  bio: string
  phone: string
  industryTags: string[]
  evidenceUrls: string[]
}

export interface VerifiedAgent {
  id: string
  display_name: string
  avatar_url?: string
  city?: string
  bio?: string
  agent_bio?: string
  agent_website_url?: string
  agent_industry_tags?: string[]
  talent_count: number
}

export interface FreelancerAgentLink {
  id: string
  agent_id: string
  freelancer_id: string
  status: AgentLinkStatus
  routing_preference: AgentRoutingPreference
  commission_percentage: number
  notes?: string
  created_at: string
  updated_at: string
  approved_at?: string
  removed_at?: string
  // Joined data
  freelancer_profile?: {
    id: string
    display_name: string
    avatar_url?: string
    role?: string
    city?: string
  }
  agent_profile?: {
    id: string
    display_name: string
    avatar_url?: string
  }
}

export interface AgentTalentRoster {
  link_id: string
  freelancer_id: string
  freelancer_name: string
  freelancer_avatar?: string
  freelancer_role?: string
  status: AgentLinkStatus
  commission_percentage: number
  created_at: string
}

export interface AgentBookingRequest {
  booking_id: string
  freelancer_id: string
  freelancer_name: string
  client_id: string
  client_name: string
  start_time: string
  end_time: string
  total_amount: number
  status: string
  created_at: string
}

// =====================================================
// AGENT VERIFICATION FUNCTIONS
// =====================================================

/**
 * Submit agent verification request
 */
export async function submitAgentVerification(
  data: AgentVerificationData
): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Call the database function
    const { error } = await supabase.rpc('submit_agent_verification', {
      p_agent_id: user.id,
      p_website_url: data.websiteUrl,
      p_bio: data.bio,
      p_phone: data.phone,
      p_industry_tags: data.industryTags,
      p_evidence_urls: data.evidenceUrls
    })

    if (error) throw error
    return true
  } catch (error) {
    console.error('submitAgentVerification error:', error)
    throw error
  }
}

/**
 * Get current user's agent verification status
 */
export async function getAgentVerificationStatus(): Promise<{
  status: AgentVerificationStatus
  isVerified: boolean
  submittedAt?: string
  reviewedAt?: string
  rejectionReason?: string
}> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('profiles')
      .select(`
        agent_verification_status,
        is_agent_verified,
        agent_verification_submitted_at,
        agent_verification_reviewed_at,
        agent_rejection_reason
      `)
      .eq('id', user.id)
      .single()

    if (error) throw error

    return {
      status: data?.agent_verification_status || 'not_submitted',
      isVerified: data?.is_agent_verified || false,
      submittedAt: data?.agent_verification_submitted_at,
      reviewedAt: data?.agent_verification_reviewed_at,
      rejectionReason: data?.agent_rejection_reason
    }
  } catch (error) {
    console.error('getAgentVerificationStatus error:', error)
    throw error
  }
}

/**
 * Get verified agents for discovery/search
 */
export async function getVerifiedAgents(params?: {
  industryTag?: string
  city?: string
  limit?: number
  offset?: number
}): Promise<VerifiedAgent[]> {
  try {
    const { data, error } = await supabase.rpc('get_verified_agents', {
      p_industry_tag: params?.industryTag || null,
      p_city: params?.city || null,
      p_limit: params?.limit || 20,
      p_offset: params?.offset || 0
    })

    if (error) throw error
    return data as VerifiedAgent[]
  } catch (error) {
    console.error('getVerifiedAgents error:', error)
    throw error
  }
}

/**
 * Admin: Get pending agent verifications
 */
export async function getPendingAgentVerifications(): Promise<any[]> {
  try {
    const { data, error } = await supabase.rpc('get_pending_agent_verifications')
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('getPendingAgentVerifications error:', error)
    throw error
  }
}

/**
 * Admin: Review agent verification
 */
export async function reviewAgentVerification(
  agentId: string,
  approved: boolean,
  notes?: string,
  rejectionReason?: string
): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { error } = await supabase.rpc('review_agent_verification', {
      p_agent_id: agentId,
      p_reviewer_id: user.id,
      p_approved: approved,
      p_notes: notes || null,
      p_rejection_reason: rejectionReason || null
    })

    if (error) throw error
    return true
  } catch (error) {
    console.error('reviewAgentVerification error:', error)
    throw error
  }
}

/**
 * Get agent verification history
 */
export async function getAgentVerificationHistory(agentId?: string): Promise<any[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const targetId = agentId || user.id

    const { data, error } = await supabase
      .from('agent_verification_history')
      .select('*')
      .eq('agent_id', targetId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('getAgentVerificationHistory error:', error)
    throw error
  }
}

// =====================================================
// SEND REPRESENTATION REQUEST
// =====================================================

/**
 * Agent sends a request to represent a freelancer
 */
export async function sendRepresentationRequest(
  freelancerId: string,
  commissionPercentage: number = 10,
  notes?: string
): Promise<FreelancerAgentLink> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Check if agent is already linked or has pending request
    const { data: existingLink } = await supabase
      .from('freelancer_agent_links')
      .select('*')
      .eq('agent_id', user.id)
      .eq('freelancer_id', freelancerId)
      .in('status', ['pending', 'approved'])
      .single()

    if (existingLink) {
      throw new Error('You already have a pending or active representation with this freelancer')
    }

    // Check if freelancer accepts agent requests
    const { data: freelancerProfile } = await supabase
      .from('profiles')
      .select('accepts_agent_requests, display_name')
      .eq('id', freelancerId)
      .single()

    if (!freelancerProfile?.accepts_agent_requests) {
      throw new Error('This freelancer is not accepting agent representation requests')
    }

    // Create the link request
    const { data, error } = await supabase
      .from('freelancer_agent_links')
      .insert({
        agent_id: user.id,
        freelancer_id: freelancerId,
        status: 'pending',
        commission_percentage: commissionPercentage,
        notes: notes || null
      })
      .select()
      .single()

    if (error) throw error

    // TODO: Send notification to freelancer

    return data as FreelancerAgentLink
  } catch (error) {
    console.error('sendRepresentationRequest error:', error)
    throw error
  }
}

// =====================================================
// RESPOND TO REPRESENTATION REQUEST
// =====================================================

/**
 * Freelancer responds to an agent's representation request
 */
export async function respondToRepresentationRequest(
  linkId: string,
  accept: boolean,
  routingPreference: AgentRoutingPreference = 'route_to_both'
): Promise<FreelancerAgentLink> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Verify the link exists and user is the freelancer
    const { data: link } = await supabase
      .from('freelancer_agent_links')
      .select('*')
      .eq('id', linkId)
      .eq('freelancer_id', user.id)
      .eq('status', 'pending')
      .single()

    if (!link) {
      throw new Error('Representation request not found or already processed')
    }

    const newStatus = accept ? 'approved' : 'removed'

    const { data, error } = await supabase
      .from('freelancer_agent_links')
      .update({
        status: newStatus,
        routing_preference: accept ? routingPreference : link.routing_preference,
        approved_at: accept ? new Date().toISOString() : null,
        removed_at: !accept ? new Date().toISOString() : null
      })
      .eq('id', linkId)
      .select()
      .single()

    if (error) throw error

    // Update freelancer's routing preference
    if (accept) {
      await supabase
        .from('profiles')
        .update({ agent_routing_preference: routingPreference })
        .eq('id', user.id)
    }

    // TODO: Send notification to agent

    return data as FreelancerAgentLink
  } catch (error) {
    console.error('respondToRepresentationRequest error:', error)
    throw error
  }
}

// =====================================================
// GET AGENT'S TALENT ROSTER
// =====================================================

/**
 * Get all freelancers an agent represents
 */
export async function getAgentTalentRoster(
  agentId?: string
): Promise<FreelancerAgentLink[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const targetAgentId = agentId || user.id

    const { data, error } = await supabase
      .from('freelancer_agent_links')
      .select(`
        *,
        freelancer_profile:profiles!freelancer_agent_links_freelancer_id_fkey(
          id,
          display_name,
          avatar_url,
          role,
          city
        )
      `)
      .eq('agent_id', targetAgentId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return data as FreelancerAgentLink[]
  } catch (error) {
    console.error('getAgentTalentRoster error:', error)
    throw error
  }
}

// =====================================================
// GET FREELANCER'S AGENTS
// =====================================================

/**
 * Get all agents representing a freelancer
 */
export async function getFreelancerAgents(
  freelancerId?: string
): Promise<FreelancerAgentLink[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const targetFreelancerId = freelancerId || user.id

    const { data, error } = await supabase
      .from('freelancer_agent_links')
      .select(`
        *,
        agent_profile:profiles!freelancer_agent_links_agent_id_fkey(
          id,
          display_name,
          avatar_url
        )
      `)
      .eq('freelancer_id', targetFreelancerId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return data as FreelancerAgentLink[]
  } catch (error) {
    console.error('getFreelancerAgents error:', error)
    throw error
  }
}

// =====================================================
// GET AGENT'S ROUTED BOOKING REQUESTS
// =====================================================

/**
 * Get booking requests routed to agent for their talent
 */
export async function getAgentBookingRequests(): Promise<any[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // First get the freelancers this agent represents
    const { data: talentLinks } = await supabase
      .from('freelancer_agent_links')
      .select('freelancer_id')
      .eq('agent_id', user.id)
      .eq('status', 'approved')

    if (!talentLinks || talentLinks.length === 0) {
      return []
    }

    const freelancerIds = talentLinks.map(l => l.freelancer_id)

    // Get pending bookings for those freelancers who route to agent
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        *,
        client_profile:profiles!bookings_client_id_fkey(
          id,
          display_name,
          avatar_url
        ),
        freelancer_profile:profiles!bookings_freelancer_id_fkey(
          id,
          display_name,
          avatar_url,
          agent_routing_preference
        )
      `)
      .in('freelancer_id', freelancerIds)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) throw error

    // Filter to only those where routing includes agent
    const filteredBookings = (bookings || []).filter(b =>
      b.freelancer_profile?.agent_routing_preference === 'route_to_agent' ||
      b.freelancer_profile?.agent_routing_preference === 'route_to_both'
    )

    return filteredBookings
  } catch (error) {
    console.error('getAgentBookingRequests error:', error)
    throw error
  }
}

// =====================================================
// ACCEPT BOOKING ON BEHALF
// =====================================================

/**
 * Agent accepts a booking on behalf of a freelancer
 */
export async function acceptBookingOnBehalf(
  bookingId: string,
  response?: string
): Promise<any> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Get the booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*, freelancer_profile:profiles!bookings_freelancer_id_fkey(agent_routing_preference)')
      .eq('id', bookingId)
      .single()

    if (bookingError || !booking) throw new Error('Booking not found')

    // Verify agent is authorized for this freelancer
    const { data: link } = await supabase
      .from('freelancer_agent_links')
      .select('*')
      .eq('agent_id', user.id)
      .eq('freelancer_id', booking.freelancer_id)
      .eq('status', 'approved')
      .single()

    if (!link) {
      throw new Error('You are not authorized to manage bookings for this freelancer')
    }

    // Verify routing allows agent to accept
    const routing = booking.freelancer_profile?.agent_routing_preference
    if (routing !== 'route_to_agent' && routing !== 'route_to_both') {
      throw new Error('This booking is not routed to agents')
    }

    // Accept the booking
    const { data, error } = await supabase
      .from('bookings')
      .update({
        status: 'confirmed',
        freelancer_response: response || 'Accepted by agent',
        accepted_at: new Date().toISOString(),
        agent_id: user.id,
        agent_accepted: true,
        agent_accepted_at: new Date().toISOString()
      })
      .eq('id', bookingId)
      .select()
      .single()

    if (error) throw error

    // TODO: Create calendar block
    // TODO: Send notifications to freelancer and client

    return data
  } catch (error) {
    console.error('acceptBookingOnBehalf error:', error)
    throw error
  }
}

// =====================================================
// APPLY ON BEHALF
// =====================================================

/**
 * Agent creates a booking request on behalf of a freelancer
 */
export async function applyOnBehalf(params: {
  freelancerId: string
  clientId: string
  startTime: Date
  endTime: Date
  totalAmount: number
  serviceDescription: string
  message?: string
}): Promise<any> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Verify agent is authorized
    const { data: link } = await supabase
      .from('freelancer_agent_links')
      .select('*')
      .eq('agent_id', user.id)
      .eq('freelancer_id', params.freelancerId)
      .eq('status', 'approved')
      .single()

    if (!link) {
      throw new Error('You are not authorized to apply on behalf of this freelancer')
    }

    // Create the booking with agent_id set
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        client_id: params.clientId,
        freelancer_id: params.freelancerId,
        agent_id: user.id,
        start_date: params.startTime.toISOString(),
        end_date: params.endTime.toISOString(),
        start_time: params.startTime.toISOString(),
        end_time: params.endTime.toISOString(),
        duration_minutes: Math.round((params.endTime.getTime() - params.startTime.getTime()) / 60000),
        total_amount: params.totalAmount,
        service_description: params.serviceDescription,
        client_message: params.message || `Applied on behalf by agent`,
        status: 'pending'
      })
      .select()
      .single()

    if (error) throw error

    // TODO: Send notification to freelancer about agent applying on their behalf

    return data
  } catch (error) {
    console.error('applyOnBehalf error:', error)
    throw error
  }
}

// =====================================================
// REMOVE REPRESENTATION
// =====================================================

/**
 * Either party can remove the agent-freelancer link
 */
export async function removeRepresentation(linkId: string): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { error } = await supabase
      .from('freelancer_agent_links')
      .update({
        status: 'removed',
        removed_at: new Date().toISOString()
      })
      .eq('id', linkId)
      .or(`agent_id.eq.${user.id},freelancer_id.eq.${user.id}`)

    if (error) throw error
  } catch (error) {
    console.error('removeRepresentation error:', error)
    throw error
  }
}

// =====================================================
// UPDATE ROUTING PREFERENCE
// =====================================================

/**
 * Freelancer updates their booking routing preference
 */
export async function updateRoutingPreference(
  preference: AgentRoutingPreference
): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { error } = await supabase
      .from('profiles')
      .update({ agent_routing_preference: preference })
      .eq('id', user.id)

    if (error) throw error
  } catch (error) {
    console.error('updateRoutingPreference error:', error)
    throw error
  }
}

// =====================================================
// GET PENDING REPRESENTATION REQUESTS
// =====================================================

/**
 * Get pending representation requests for a freelancer
 */
export async function getPendingRepresentationRequests(): Promise<FreelancerAgentLink[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('freelancer_agent_links')
      .select(`
        *,
        agent_profile:profiles!freelancer_agent_links_agent_id_fkey(
          id,
          display_name,
          avatar_url,
          bio
        )
      `)
      .eq('freelancer_id', user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) throw error

    return data as FreelancerAgentLink[]
  } catch (error) {
    console.error('getPendingRepresentationRequests error:', error)
    throw error
  }
}

// =====================================================
// EXPORTS
// =====================================================

export default {
  // Verification
  submitAgentVerification,
  getAgentVerificationStatus,
  getVerifiedAgents,
  getPendingAgentVerifications,
  reviewAgentVerification,
  getAgentVerificationHistory,
  // Representation
  sendRepresentationRequest,
  respondToRepresentationRequest,
  getAgentTalentRoster,
  getFreelancerAgents,
  getAgentBookingRequests,
  acceptBookingOnBehalf,
  applyOnBehalf,
  removeRepresentation,
  updateRoutingPreference,
  getPendingRepresentationRequests
}
