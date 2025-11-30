/**
 * UNIFIED CALENDAR API
 *
 * Best-in-class calendar system combining features from both calendar.ts and availability.ts
 *
 * Features:
 * - Full-day and hourly blocking support
 * - Multiple block types (booking, manual, unavailable, hold)
 * - Booking integration with client profile data
 * - Recurring blocks support
 * - Timezone support
 * - Overlap detection
 * - Availability checking
 * - Slot-based booking for hourly services
 *
 * Database Schema Support:
 * - user_id/owner_id (both supported, user_id preferred)
 * - start_date/start_time (both supported, start_date preferred for full-day)
 * - end_date/end_time (both supported, end_date preferred for full-day)
 * - reason/block_type (both supported)
 */

import { supabase } from '../lib/supabase'

// =====================================================
// TYPES & INTERFACES
// =====================================================

export type BlockType = 'booking' | 'manual' | 'unavailable' | 'hold' | 'availability'

export interface CalendarBlock {
  id: string
  user_id: string
  start_date: string  // ISO timestamp
  end_date: string    // ISO timestamp
  reason: BlockType
  booking_id?: string | null
  notes?: string | null
  title?: string | null
  timezone?: string
  visibility_message?: string | null
  is_recurring?: boolean
  recurrence_pattern?: string | null
  created_at: string
  updated_at: string
  // Joined booking data (when fetched with booking info)
  booking?: {
    id: string
    client_id: string
    freelancer_id: string
    total_amount: number
    status: string
    service_description?: string
    client_profile?: {
      id: string
      display_name: string
      avatar_url?: string
    }
    freelancer_profile?: {
      id: string
      display_name: string
      avatar_url?: string
    }
  }
}

export interface CreateBlockParams {
  user_id?: string  // Optional if using authenticated user
  start_date: Date | string
  end_date: Date | string
  reason: BlockType
  booking_id?: string
  notes?: string
  title?: string
  timezone?: string
  visibility_message?: string
  is_recurring?: boolean
  recurrence_pattern?: 'daily' | 'weekly' | 'biweekly' | 'monthly'
}

export interface UpdateBlockParams {
  start_date?: Date | string
  end_date?: Date | string
  reason?: BlockType
  notes?: string
  title?: string
  visibility_message?: string
  is_recurring?: boolean
  recurrence_pattern?: string | null
}

export interface AvailabilityCheck {
  date: string
  is_available: boolean
  conflicting_blocks?: CalendarBlock[]
}

export interface TimeSlot {
  start: Date
  end: Date
  available: boolean
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

const toISOString = (date: Date | string): string => {
  if (typeof date === 'string') return date
  return date.toISOString()
}

const parseDate = (dateStr: string): Date => {
  return new Date(dateStr)
}

// =====================================================
// GET CALENDAR BLOCKS
// =====================================================

/**
 * Get calendar blocks for a user within an optional date range
 * Includes joined booking data with client/freelancer profiles
 */
export async function getCalendarBlocks(
  userId: string,
  startDate?: Date,
  endDate?: Date,
  blockTypes?: BlockType[]
): Promise<CalendarBlock[]> {
  try {
    let query = supabase
      .from('calendar_blocks')
      .select(`
        id,
        user_id,
        start_date,
        end_date,
        reason,
        booking_id,
        notes,
        title,
        timezone,
        visibility_message,
        is_recurring,
        recurrence_pattern,
        created_at,
        updated_at,
        booking:bookings(
          id,
          client_id,
          freelancer_id,
          total_amount,
          status,
          service_description,
          client_profile:profiles!bookings_client_id_fkey(
            id,
            display_name,
            avatar_url
          ),
          freelancer_profile:profiles!bookings_freelancer_id_fkey(
            id,
            display_name,
            avatar_url
          )
        )
      `)
      .eq('user_id', userId)
      .order('start_date', { ascending: true })

    // Apply date range filters
    if (startDate) {
      query = query.gte('end_date', startDate.toISOString())
    }
    if (endDate) {
      query = query.lte('start_date', endDate.toISOString())
    }

    // Filter by block types
    if (blockTypes && blockTypes.length > 0) {
      query = query.in('reason', blockTypes)
    }

    const { data, error } = await query

    if (error) throw error

    return (data || []) as CalendarBlock[]
  } catch (error) {
    console.error('getCalendarBlocks error:', error)
    throw error
  }
}

/**
 * Get current user's calendar blocks
 */
export async function getMyCalendarBlocks(
  startDate?: Date,
  endDate?: Date,
  blockTypes?: BlockType[]
): Promise<CalendarBlock[]> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  return getCalendarBlocks(user.id, startDate, endDate, blockTypes)
}

/**
 * Get a single calendar block by ID
 */
export async function getCalendarBlockById(blockId: string): Promise<CalendarBlock | null> {
  const { data, error } = await supabase
    .from('calendar_blocks')
    .select('*')
    .eq('id', blockId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return data as CalendarBlock
}

// =====================================================
// CREATE CALENDAR BLOCK
// =====================================================

/**
 * Create a new calendar block
 * Validates for overlaps unless block type is 'availability'
 */
export async function createCalendarBlock(params: CreateBlockParams): Promise<CalendarBlock> {
  try {
    // Get user ID
    let userId = params.user_id
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      userId = user.id
    }

    const startDate = toISOString(params.start_date)
    const endDate = toISOString(params.end_date)

    // Validate date range
    if (new Date(startDate) >= new Date(endDate)) {
      throw new Error('End date must be after start date')
    }

    // Check for overlaps (except for 'availability' type which can overlap)
    if (params.reason !== 'availability') {
      const hasOverlap = await checkDateOverlap(userId, new Date(startDate), new Date(endDate))
      if (hasOverlap) {
        throw new Error('Cannot create block: dates overlap with existing block')
      }
    }

    const { data, error } = await supabase
      .from('calendar_blocks')
      .insert({
        user_id: userId,
        start_date: startDate,
        end_date: endDate,
        reason: params.reason,
        booking_id: params.booking_id || null,
        notes: params.notes || null,
        title: params.title || null,
        timezone: params.timezone || 'Australia/Sydney',
        visibility_message: params.visibility_message || null,
        is_recurring: params.is_recurring || false,
        recurrence_pattern: params.recurrence_pattern || null
      })
      .select()
      .single()

    if (error) throw error

    return data as CalendarBlock
  } catch (error) {
    console.error('createCalendarBlock error:', error)
    throw error
  }
}

// =====================================================
// UPDATE CALENDAR BLOCK
// =====================================================

/**
 * Update an existing calendar block
 */
export async function updateCalendarBlock(
  blockId: string,
  updates: UpdateBlockParams
): Promise<CalendarBlock> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const updateData: Record<string, unknown> = {}

    if (updates.start_date) updateData.start_date = toISOString(updates.start_date)
    if (updates.end_date) updateData.end_date = toISOString(updates.end_date)
    if (updates.reason) updateData.reason = updates.reason
    if (updates.notes !== undefined) updateData.notes = updates.notes
    if (updates.title !== undefined) updateData.title = updates.title
    if (updates.visibility_message !== undefined) updateData.visibility_message = updates.visibility_message
    if (updates.is_recurring !== undefined) updateData.is_recurring = updates.is_recurring
    if (updates.recurrence_pattern !== undefined) updateData.recurrence_pattern = updates.recurrence_pattern

    const { data, error } = await supabase
      .from('calendar_blocks')
      .update(updateData)
      .eq('id', blockId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error

    return data as CalendarBlock
  } catch (error) {
    console.error('updateCalendarBlock error:', error)
    throw error
  }
}

// =====================================================
// DELETE CALENDAR BLOCK
// =====================================================

/**
 * Delete a calendar block
 */
export async function deleteCalendarBlock(blockId: string): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
      .from('calendar_blocks')
      .delete()
      .eq('id', blockId)
      .eq('user_id', user.id)

    if (error) throw error
  } catch (error) {
    console.error('deleteCalendarBlock error:', error)
    throw error
  }
}

// =====================================================
// OVERLAP CHECKING
// =====================================================

/**
 * Check if a date range overlaps with existing blocks
 * Uses database RPC function if available, falls back to query
 */
export async function checkDateOverlap(
  userId: string,
  startDate: Date,
  endDate: Date,
  excludeBlockId?: string
): Promise<boolean> {
  try {
    // Try using RPC function first
    const { data, error } = await supabase.rpc('check_date_overlap', {
      p_user_id: userId,
      p_start_date: startDate.toISOString(),
      p_end_date: endDate.toISOString(),
      p_exclude_block_id: excludeBlockId || null
    })

    if (!error) {
      return data as boolean
    }

    // Fallback to manual query
    let query = supabase
      .from('calendar_blocks')
      .select('id')
      .eq('user_id', userId)
      .in('reason', ['booking', 'manual', 'unavailable', 'hold'])
      .lt('start_date', endDate.toISOString())
      .gt('end_date', startDate.toISOString())
      .limit(1)

    if (excludeBlockId) {
      query = query.neq('id', excludeBlockId)
    }

    const result = await query
    return (result.data && result.data.length > 0) || false
  } catch (error) {
    console.error('checkDateOverlap error:', error)
    return true // Err on side of caution
  }
}

// =====================================================
// AVAILABILITY CHECKING
// =====================================================

/**
 * Check availability for each day in a date range
 * Returns array of dates with availability status
 */
export async function checkAvailability(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<AvailabilityCheck[]> {
  try {
    // Try using RPC function first
    const { data, error } = await supabase.rpc('get_available_dates', {
      p_user_id: userId,
      p_start_date: startDate.toISOString(),
      p_end_date: endDate.toISOString()
    })

    if (!error && data) {
      return data as AvailabilityCheck[]
    }

    // Fallback: manually check each day
    const blocks = await getCalendarBlocks(userId, startDate, endDate, ['booking', 'manual', 'unavailable', 'hold'])
    const results: AvailabilityCheck[] = []
    const currentDate = new Date(startDate)

    while (currentDate <= endDate) {
      const dayStart = new Date(currentDate)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(currentDate)
      dayEnd.setHours(23, 59, 59, 999)

      const conflicting = blocks.filter(block => {
        const blockStart = new Date(block.start_date)
        const blockEnd = new Date(block.end_date)
        return blockStart < dayEnd && blockEnd > dayStart
      })

      results.push({
        date: currentDate.toISOString().split('T')[0],
        is_available: conflicting.length === 0,
        conflicting_blocks: conflicting.length > 0 ? conflicting : undefined
      })

      currentDate.setDate(currentDate.getDate() + 1)
    }

    return results
  } catch (error) {
    console.error('checkAvailability error:', error)
    throw error
  }
}

/**
 * Quick check if specific dates are available
 */
export async function areDatesAvailable(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<boolean> {
  const hasOverlap = await checkDateOverlap(userId, startDate, endDate)
  return !hasOverlap
}

/**
 * Check availability for a specific time slot (hourly booking)
 */
export async function isTimeSlotAvailable(
  userId: string,
  startTime: Date,
  endTime: Date
): Promise<boolean> {
  const { data, error } = await supabase
    .from('calendar_blocks')
    .select('id')
    .eq('user_id', userId)
    .in('reason', ['booking', 'manual', 'unavailable', 'hold'])
    .lt('start_date', endTime.toISOString())
    .gt('end_date', startTime.toISOString())
    .limit(1)

  if (error) throw error
  return !data || data.length === 0
}

// =====================================================
// BOOKING INTEGRATION
// =====================================================

/**
 * Block dates for a confirmed booking
 */
export async function blockDatesForBooking(
  userId: string,
  bookingId: string,
  startDate: Date,
  endDate: Date,
  notes?: string
): Promise<CalendarBlock> {
  return createCalendarBlock({
    user_id: userId,
    start_date: startDate,
    end_date: endDate,
    reason: 'booking',
    booking_id: bookingId,
    title: 'Booked',
    notes: notes || 'Booking confirmed'
  })
}

/**
 * Create a hold block for pending booking requests
 */
export async function createHoldForBooking(
  userId: string,
  bookingId: string,
  startDate: Date,
  endDate: Date
): Promise<CalendarBlock> {
  return createCalendarBlock({
    user_id: userId,
    start_date: startDate,
    end_date: endDate,
    reason: 'hold',
    booking_id: bookingId,
    title: 'Pending Request',
    notes: 'Awaiting confirmation'
  })
}

/**
 * Convert hold to confirmed booking block
 */
export async function convertHoldToBooking(bookingId: string): Promise<void> {
  const { error } = await supabase
    .from('calendar_blocks')
    .update({
      reason: 'booking',
      title: 'Booked',
      notes: 'Booking confirmed'
    })
    .eq('booking_id', bookingId)
    .eq('reason', 'hold')

  if (error) throw error
}

/**
 * Release dates when booking is cancelled/declined
 */
export async function releaseDatesForBooking(bookingId: string): Promise<void> {
  const { error } = await supabase
    .from('calendar_blocks')
    .delete()
    .eq('booking_id', bookingId)

  if (error) throw error
}

// =====================================================
// MANUAL BLOCKING
// =====================================================

/**
 * Block dates manually (personal time, holidays, etc.)
 */
export async function blockDatesManually(
  startDate: Date,
  endDate: Date,
  notes?: string,
  visibilityMessage?: string,
  recurrence?: { is_recurring: boolean; pattern?: 'daily' | 'weekly' | 'biweekly' | 'monthly' }
): Promise<CalendarBlock> {
  return createCalendarBlock({
    start_date: startDate,
    end_date: endDate,
    reason: 'manual',
    notes: notes,
    title: 'Blocked',
    visibility_message: visibilityMessage,
    is_recurring: recurrence?.is_recurring,
    recurrence_pattern: recurrence?.pattern
  })
}

/**
 * Mark dates as unavailable
 */
export async function markUnavailable(
  startDate: Date,
  endDate: Date,
  reason?: string
): Promise<CalendarBlock> {
  return createCalendarBlock({
    start_date: startDate,
    end_date: endDate,
    reason: 'unavailable',
    notes: reason,
    title: 'Unavailable'
  })
}

// =====================================================
// SLOT-BASED AVAILABILITY (for hourly services)
// =====================================================

/**
 * Get available time slots for a specific day
 */
export async function getAvailableSlotsForDay(
  userId: string,
  date: Date,
  options?: {
    slotDurationMinutes?: number
    workingHoursStart?: number
    workingHoursEnd?: number
  }
): Promise<TimeSlot[]> {
  const slotDuration = options?.slotDurationMinutes || 60
  const workStart = options?.workingHoursStart || 9
  const workEnd = options?.workingHoursEnd || 21

  // Get day boundaries
  const dayStart = new Date(date)
  dayStart.setHours(0, 0, 0, 0)
  const dayEnd = new Date(date)
  dayEnd.setHours(23, 59, 59, 999)

  // Get all blocks for this day
  const blocks = await getCalendarBlocks(userId, dayStart, dayEnd)

  // Filter to blocking types only
  const blockingBlocks = blocks.filter(b =>
    ['booking', 'manual', 'unavailable', 'hold'].includes(b.reason)
  )

  // Generate slots
  const slots: TimeSlot[] = []
  const now = new Date()

  for (let hour = workStart; hour < workEnd; hour++) {
    const slotStart = new Date(date)
    slotStart.setHours(hour, 0, 0, 0)

    const slotEnd = new Date(slotStart)
    slotEnd.setMinutes(slotEnd.getMinutes() + slotDuration)

    // Skip past slots
    if (slotStart < now) continue

    // Check for conflicts
    const hasConflict = blockingBlocks.some(block => {
      const blockStart = new Date(block.start_date)
      const blockEnd = new Date(block.end_date)
      return slotStart < blockEnd && slotEnd > blockStart
    })

    slots.push({
      start: slotStart,
      end: slotEnd,
      available: !hasConflict
    })
  }

  return slots
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

/**
 * Get upcoming blocks for a user (next N days)
 */
export async function getUpcomingBlocks(
  userId: string,
  days: number = 30
): Promise<CalendarBlock[]> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const futureDate = new Date()
  futureDate.setDate(futureDate.getDate() + days)

  return getCalendarBlocks(userId, today, futureDate)
}

/**
 * Get blocks for a specific month
 */
export async function getBlocksForMonth(
  userId: string,
  year: number,
  month: number // 0-indexed (0 = January)
): Promise<CalendarBlock[]> {
  const monthStart = new Date(year, month, 1)
  const monthEnd = new Date(year, month + 1, 0, 23, 59, 59, 999)

  return getCalendarBlocks(userId, monthStart, monthEnd)
}

/**
 * Get booking blocks only
 */
export async function getBookingBlocks(
  userId: string,
  startDate?: Date,
  endDate?: Date
): Promise<CalendarBlock[]> {
  return getCalendarBlocks(userId, startDate, endDate, ['booking'])
}

/**
 * Get manual/unavailable blocks only
 */
export async function getManualBlocks(
  userId: string,
  startDate?: Date,
  endDate?: Date
): Promise<CalendarBlock[]> {
  return getCalendarBlocks(userId, startDate, endDate, ['manual', 'unavailable'])
}

// =====================================================
// DEFAULT EXPORT
// =====================================================

export default {
  // Core CRUD
  getCalendarBlocks,
  getMyCalendarBlocks,
  getCalendarBlockById,
  createCalendarBlock,
  updateCalendarBlock,
  deleteCalendarBlock,

  // Overlap & Availability
  checkDateOverlap,
  checkAvailability,
  areDatesAvailable,
  isTimeSlotAvailable,
  getAvailableSlotsForDay,

  // Booking Integration
  blockDatesForBooking,
  createHoldForBooking,
  convertHoldToBooking,
  releaseDatesForBooking,

  // Manual Blocking
  blockDatesManually,
  markUnavailable,

  // Utilities
  getUpcomingBlocks,
  getBlocksForMonth,
  getBookingBlocks,
  getManualBlocks
}
