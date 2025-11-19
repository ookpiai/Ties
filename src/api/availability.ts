/**
 * Availability API
 * Manages calendar blocks and availability checking
 */

import { supabase } from '../lib/supabase'

export interface CalendarBlock {
  id: string
  user_id: string
  start_date: string // ISO 8601 timestamp
  end_date: string
  reason: 'booking' | 'manual' | 'unavailable'
  booking_id?: string | null
  notes?: string | null
  created_at: string
  updated_at: string
}

export interface CreateBlockParams {
  user_id: string
  start_date: string | Date
  end_date: string | Date
  reason: 'booking' | 'manual' | 'unavailable'
  booking_id?: string
  notes?: string
}

export interface AvailabilityCheck {
  date: string
  is_available: boolean
}

/**
 * Get all calendar blocks for a user
 * @param userId - User ID to get blocks for
 * @param startDate - Optional start date filter
 * @param endDate - Optional end date filter
 */
export async function getCalendarBlocks(
  userId: string,
  startDate?: Date,
  endDate?: Date
): Promise<CalendarBlock[]> {
  let query = supabase
    .from('calendar_blocks')
    .select('*')
    .eq('user_id', userId)
    .order('start_date', { ascending: true })

  // Apply date filters if provided
  if (startDate) {
    query = query.gte('end_date', startDate.toISOString())
  }
  if (endDate) {
    query = query.lte('start_date', endDate.toISOString())
  }

  const { data, error } = await query

  if (error) {
    console.error('Failed to fetch calendar blocks:', error)
    throw error
  }

  return data as CalendarBlock[]
}

/**
 * Create a new calendar block
 * @param params - Block creation parameters
 */
export async function createCalendarBlock(
  params: CreateBlockParams
): Promise<CalendarBlock> {
  // Convert dates to ISO strings if needed
  const startDate = typeof params.start_date === 'string'
    ? params.start_date
    : params.start_date.toISOString()

  const endDate = typeof params.end_date === 'string'
    ? params.end_date
    : params.end_date.toISOString()

  // First check for overlaps
  const hasOverlap = await checkDateOverlap(
    params.user_id,
    new Date(startDate),
    new Date(endDate)
  )

  if (hasOverlap) {
    throw new Error('Cannot create block: dates overlap with existing block')
  }

  const { data, error } = await supabase
    .from('calendar_blocks')
    .insert({
      user_id: params.user_id,
      start_date: startDate,
      end_date: endDate,
      reason: params.reason,
      booking_id: params.booking_id || null,
      notes: params.notes || null
    })
    .select()
    .single()

  if (error) {
    console.error('Failed to create calendar block:', error)
    throw error
  }

  return data as CalendarBlock
}

/**
 * Update an existing calendar block
 * @param blockId - Block ID to update
 * @param updates - Fields to update
 */
export async function updateCalendarBlock(
  blockId: string,
  updates: Partial<Omit<CreateBlockParams, 'user_id'>>
): Promise<CalendarBlock> {
  const updateData: any = {}

  if (updates.start_date) {
    updateData.start_date = typeof updates.start_date === 'string'
      ? updates.start_date
      : updates.start_date.toISOString()
  }

  if (updates.end_date) {
    updateData.end_date = typeof updates.end_date === 'string'
      ? updates.end_date
      : updates.end_date.toISOString()
  }

  if (updates.reason) updateData.reason = updates.reason
  if (updates.notes !== undefined) updateData.notes = updates.notes
  if (updates.booking_id !== undefined) updateData.booking_id = updates.booking_id

  const { data, error } = await supabase
    .from('calendar_blocks')
    .update(updateData)
    .eq('id', blockId)
    .select()
    .single()

  if (error) {
    console.error('Failed to update calendar block:', error)
    throw error
  }

  return data as CalendarBlock
}

/**
 * Delete a calendar block
 * @param blockId - Block ID to delete
 */
export async function deleteCalendarBlock(blockId: string): Promise<void> {
  const { error } = await supabase
    .from('calendar_blocks')
    .delete()
    .eq('id', blockId)

  if (error) {
    console.error('Failed to delete calendar block:', error)
    throw error
  }
}

/**
 * Check if a date range overlaps with existing blocks
 * @param userId - User ID to check
 * @param startDate - Start date
 * @param endDate - End date
 * @param excludeBlockId - Optional block ID to exclude from check (for updates)
 */
export async function checkDateOverlap(
  userId: string,
  startDate: Date,
  endDate: Date,
  excludeBlockId?: string
): Promise<boolean> {
  const { data, error } = await supabase.rpc('check_date_overlap', {
    p_user_id: userId,
    p_start_date: startDate.toISOString(),
    p_end_date: endDate.toISOString(),
    p_exclude_block_id: excludeBlockId || null
  })

  if (error) {
    console.error('Failed to check date overlap:', error)
    throw error
  }

  return data as boolean
}

/**
 * Check availability for a date range
 * @param userId - User ID to check
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Array of dates with availability status
 */
export async function checkAvailability(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<AvailabilityCheck[]> {
  const { data, error } = await supabase.rpc('get_available_dates', {
    p_user_id: userId,
    p_start_date: startDate.toISOString(),
    p_end_date: endDate.toISOString()
  })

  if (error) {
    console.error('Failed to check availability:', error)
    throw error
  }

  return data as AvailabilityCheck[]
}

/**
 * Check if specific dates are available (quick check)
 * @param userId - User ID to check
 * @param startDate - Start date
 * @param endDate - End date
 * @returns True if all dates are available
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
 * Block dates for a booking (called when booking is confirmed)
 * @param userId - User ID (freelancer/venue being booked)
 * @param bookingId - Booking ID
 * @param startDate - Booking start date
 * @param endDate - Booking end date
 */
export async function blockDatesForBooking(
  userId: string,
  bookingId: string,
  startDate: Date,
  endDate: Date
): Promise<CalendarBlock> {
  return createCalendarBlock({
    user_id: userId,
    start_date: startDate,
    end_date: endDate,
    reason: 'booking',
    booking_id: bookingId,
    notes: 'Automatically blocked by booking'
  })
}

/**
 * Release dates for a cancelled booking
 * @param bookingId - Booking ID
 */
export async function releaseDatesForBooking(bookingId: string): Promise<void> {
  const { error } = await supabase
    .from('calendar_blocks')
    .delete()
    .eq('booking_id', bookingId)

  if (error) {
    console.error('Failed to release dates for booking:', error)
    throw error
  }
}

/**
 * Get upcoming blocked dates for a user (next 30 days)
 * @param userId - User ID
 */
export async function getUpcomingBlocks(userId: string): Promise<CalendarBlock[]> {
  const today = new Date()
  const in30Days = new Date()
  in30Days.setDate(today.getDate() + 30)

  return getCalendarBlocks(userId, today, in30Days)
}
