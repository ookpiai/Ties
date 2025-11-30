/**
 * AVAILABILITY REQUESTS API
 * Surreal-style availability inquiries before booking offers
 *
 * Separates "checking availability" from "making an offer"
 * - Venues/Clients send availability requests
 * - Freelancers respond with available/unavailable
 * - Payment only shown when actual booking offer is made
 */

import { supabase } from '../lib/supabase'

// =====================================================
// TYPES
// =====================================================

export type AvailabilityRequestStatus = 'pending' | 'available' | 'unavailable' | 'expired'

export interface AvailabilityRequest {
  id: string
  requester_id: string
  freelancer_id: string
  requested_date: string // DATE format YYYY-MM-DD
  requested_start_time?: string | null // TIME format HH:MM:SS
  requested_end_time?: string | null
  message?: string | null
  status: AvailabilityRequestStatus
  response_message?: string | null
  responded_at?: string | null
  created_at: string
  expires_at: string
  // Joined data
  requester_profile?: {
    id: string
    display_name: string
    avatar_url?: string
    role?: string
  }
  freelancer_profile?: {
    id: string
    display_name: string
    avatar_url?: string
    role?: string
  }
}

export interface CreateAvailabilityRequestParams {
  freelancer_id: string
  requested_date: Date | string
  requested_start_time?: string
  requested_end_time?: string
  message?: string
}

export interface RespondToRequestParams {
  request_id: string
  status: 'available' | 'unavailable'
  response_message?: string
}

// =====================================================
// CREATE AVAILABILITY REQUEST
// =====================================================

/**
 * Send an availability request to a freelancer
 * This is NOT a booking offer - just checking if they're free
 */
export async function createAvailabilityRequest(
  params: CreateAvailabilityRequestParams
): Promise<AvailabilityRequest> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const requestedDate = typeof params.requested_date === 'string'
    ? params.requested_date
    : params.requested_date.toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('availability_requests')
    .insert({
      requester_id: user.id,
      freelancer_id: params.freelancer_id,
      requested_date: requestedDate,
      requested_start_time: params.requested_start_time || null,
      requested_end_time: params.requested_end_time || null,
      message: params.message || null,
      status: 'pending'
    })
    .select()
    .single()

  if (error) {
    console.error('Failed to create availability request:', error)
    throw error
  }

  return data as AvailabilityRequest
}

// =====================================================
// GET AVAILABILITY REQUESTS
// =====================================================

/**
 * Get pending availability requests for a freelancer
 */
export async function getPendingRequests(freelancerId?: string): Promise<AvailabilityRequest[]> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const targetId = freelancerId || user.id

  const { data, error } = await supabase
    .from('availability_requests')
    .select(`
      *,
      requester_profile:profiles!availability_requests_requester_id_fkey(
        id, display_name, avatar_url, role
      )
    `)
    .eq('freelancer_id', targetId)
    .eq('status', 'pending')
    .gt('expires_at', new Date().toISOString())
    .order('requested_date', { ascending: true })

  if (error) {
    console.error('Failed to fetch pending requests:', error)
    throw error
  }

  return data as AvailabilityRequest[]
}

/**
 * Get sent availability requests (as a requester)
 */
export async function getSentRequests(): Promise<AvailabilityRequest[]> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('availability_requests')
    .select(`
      *,
      freelancer_profile:profiles!availability_requests_freelancer_id_fkey(
        id, display_name, avatar_url, role
      )
    `)
    .eq('requester_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch sent requests:', error)
    throw error
  }

  return data as AvailabilityRequest[]
}

/**
 * Get all availability requests for a user (sent and received)
 */
export async function getAllRequests(): Promise<{
  sent: AvailabilityRequest[]
  received: AvailabilityRequest[]
}> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const [sentResult, receivedResult] = await Promise.all([
    supabase
      .from('availability_requests')
      .select(`
        *,
        freelancer_profile:profiles!availability_requests_freelancer_id_fkey(
          id, display_name, avatar_url, role
        )
      `)
      .eq('requester_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('availability_requests')
      .select(`
        *,
        requester_profile:profiles!availability_requests_requester_id_fkey(
          id, display_name, avatar_url, role
        )
      `)
      .eq('freelancer_id', user.id)
      .order('requested_date', { ascending: true })
  ])

  if (sentResult.error) throw sentResult.error
  if (receivedResult.error) throw receivedResult.error

  return {
    sent: sentResult.data as AvailabilityRequest[],
    received: receivedResult.data as AvailabilityRequest[]
  }
}

// =====================================================
// RESPOND TO REQUEST
// =====================================================

/**
 * Freelancer responds to an availability request
 * Thumbs up (available) or thumbs down (unavailable)
 */
export async function respondToRequest(
  params: RespondToRequestParams
): Promise<AvailabilityRequest> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('availability_requests')
    .update({
      status: params.status,
      response_message: params.response_message || null,
      responded_at: new Date().toISOString()
    })
    .eq('id', params.request_id)
    .eq('freelancer_id', user.id)
    .eq('status', 'pending')
    .select()
    .single()

  if (error) {
    console.error('Failed to respond to request:', error)
    throw error
  }

  return data as AvailabilityRequest
}

/**
 * Bulk respond to multiple availability requests
 * Responds to all provided request IDs with the same status
 */
export async function bulkRespondToRequests(
  requestIds: string[],
  status: 'available' | 'unavailable',
  responseMessage?: string
): Promise<number> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  // Try using RPC function first
  const { data: rpcData, error: rpcError } = await supabase
    .rpc('bulk_respond_availability', {
      p_request_ids: requestIds,
      p_status: status,
      p_response_message: responseMessage || null
    })

  if (!rpcError && rpcData !== null) {
    return rpcData as number
  }

  // Fallback: Update one by one
  let count = 0
  for (const id of requestIds) {
    try {
      await respondToRequest({
        request_id: id,
        status,
        response_message: responseMessage
      })
      count++
    } catch (e) {
      console.error(`Failed to respond to request ${id}:`, e)
    }
  }

  return count
}

// =====================================================
// CHECK IF REQUEST EXISTS
// =====================================================

/**
 * Check if an availability request already exists for a date
 */
export async function hasExistingRequest(
  freelancerId: string,
  date: Date | string
): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const requestedDate = typeof date === 'string'
    ? date
    : date.toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('availability_requests')
    .select('id')
    .eq('requester_id', user.id)
    .eq('freelancer_id', freelancerId)
    .eq('requested_date', requestedDate)
    .in('status', ['pending', 'available'])
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error checking existing request:', error)
  }

  return !!data
}

// =====================================================
// EXPORTS
// =====================================================

export default {
  createAvailabilityRequest,
  getPendingRequests,
  getSentRequests,
  getAllRequests,
  respondToRequest,
  bulkRespondToRequests,
  hasExistingRequest
}
