/**
 * CALENDAR API LAYER
 * Booking MVP - Hourly Calendar System
 *
 * Handles all calendar-related operations:
 * - Availability blocks
 * - Booking blocks
 * - Hold blocks for pending requests
 * - Blocked out periods
 */

import { supabase } from '../lib/supabase'

// =====================================================
// TYPESCRIPT INTERFACES
// =====================================================

export type CalendarBlockType = 'availability' | 'booked' | 'hold' | 'blocked_out'

export interface CalendarBlock {
  id: string
  owner_id: string
  booking_id?: string
  block_type: CalendarBlockType
  start_time: string
  end_time: string
  title?: string
  notes?: string
  recurring_rule?: string
  created_at: string
  updated_at: string
  // Joined booking data
  booking?: {
    id: string
    client_id: string
    total_amount: number
    status: string
    client_profile?: {
      display_name: string
      avatar_url?: string
    }
  }
}

export interface CreateBlockParams {
  block_type: CalendarBlockType
  start_time: Date
  end_time: Date
  title?: string
  notes?: string
  booking_id?: string
}

// =====================================================
// GET CALENDAR BLOCKS
// =====================================================

/**
 * Get calendar blocks for a user within a date range
 */
export async function getCalendarBlocks(
  ownerId: string,
  startDate: Date,
  endDate: Date,
  blockTypes?: CalendarBlockType[]
): Promise<CalendarBlock[]> {
  try {
    let query = supabase
      .from('calendar_blocks')
      .select(`
        *,
        booking:bookings(
          id,
          client_id,
          total_amount,
          status,
          client_profile:profiles!bookings_client_id_fkey(
            display_name,
            avatar_url
          )
        )
      `)
      .eq('owner_id', ownerId)
      .gte('start_time', startDate.toISOString())
      .lte('end_time', endDate.toISOString())
      .order('start_time', { ascending: true })

    if (blockTypes && blockTypes.length > 0) {
      query = query.in('block_type', blockTypes)
    }

    const { data, error } = await query

    if (error) throw error

    return data as CalendarBlock[]
  } catch (error) {
    console.error('getCalendarBlocks error:', error)
    throw error
  }
}

// =====================================================
// GET OWN CALENDAR BLOCKS
// =====================================================

/**
 * Get current user's calendar blocks
 */
export async function getMyCalendarBlocks(
  startDate: Date,
  endDate: Date,
  blockTypes?: CalendarBlockType[]
): Promise<CalendarBlock[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    return getCalendarBlocks(user.id, startDate, endDate, blockTypes)
  } catch (error) {
    console.error('getMyCalendarBlocks error:', error)
    throw error
  }
}

// =====================================================
// CREATE CALENDAR BLOCK
// =====================================================

/**
 * Create a new calendar block (availability, blocked_out, etc.)
 */
export async function createCalendarBlock(
  params: CreateBlockParams
): Promise<CalendarBlock> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Validate time range
    if (params.start_time >= params.end_time) {
      throw new Error('End time must be after start time')
    }

    // Check for overlapping blocks (except availability which can overlap)
    if (params.block_type !== 'availability') {
      const hasOverlap = await checkBlockOverlap(
        user.id,
        params.start_time,
        params.end_time
      )

      if (hasOverlap) {
        throw new Error('This time slot overlaps with an existing block')
      }
    }

    const { data, error } = await supabase
      .from('calendar_blocks')
      .insert({
        owner_id: user.id,
        block_type: params.block_type,
        start_time: params.start_time.toISOString(),
        end_time: params.end_time.toISOString(),
        title: params.title || null,
        notes: params.notes || null,
        booking_id: params.booking_id || null
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
  updates: Partial<CreateBlockParams>
): Promise<CalendarBlock> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const updateData: any = {}
    if (updates.block_type) updateData.block_type = updates.block_type
    if (updates.start_time) updateData.start_time = updates.start_time.toISOString()
    if (updates.end_time) updateData.end_time = updates.end_time.toISOString()
    if (updates.title !== undefined) updateData.title = updates.title
    if (updates.notes !== undefined) updateData.notes = updates.notes

    const { data, error } = await supabase
      .from('calendar_blocks')
      .update(updateData)
      .eq('id', blockId)
      .eq('owner_id', user.id)
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
    if (!user) throw new Error('User not authenticated')

    const { error } = await supabase
      .from('calendar_blocks')
      .delete()
      .eq('id', blockId)
      .eq('owner_id', user.id)

    if (error) throw error
  } catch (error) {
    console.error('deleteCalendarBlock error:', error)
    throw error
  }
}

// =====================================================
// SET AVAILABILITY
// =====================================================

/**
 * Set availability for a time range
 * This creates availability blocks that can be booked
 */
export async function setAvailability(
  startTime: Date,
  endTime: Date,
  recurring?: string,
  notes?: string
): Promise<CalendarBlock> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('calendar_blocks')
      .insert({
        owner_id: user.id,
        block_type: 'availability',
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        recurring_rule: recurring || null,
        notes: notes || null
      })
      .select()
      .single()

    if (error) throw error

    return data as CalendarBlock
  } catch (error) {
    console.error('setAvailability error:', error)
    throw error
  }
}

// =====================================================
// BLOCK TIME (Mark as Unavailable)
// =====================================================

/**
 * Block out a time period (mark as unavailable)
 */
export async function blockTime(
  startTime: Date,
  endTime: Date,
  reason?: string
): Promise<CalendarBlock> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('calendar_blocks')
      .insert({
        owner_id: user.id,
        block_type: 'blocked_out',
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        notes: reason || null,
        title: 'Blocked'
      })
      .select()
      .single()

    if (error) throw error

    return data as CalendarBlock
  } catch (error) {
    console.error('blockTime error:', error)
    throw error
  }
}

// =====================================================
// CREATE BOOKING BLOCK
// =====================================================

/**
 * Create a calendar block for a confirmed booking
 * Called automatically when a booking is accepted
 */
export async function createBookingBlock(
  ownerId: string,
  bookingId: string,
  startTime: Date,
  endTime: Date
): Promise<CalendarBlock> {
  try {
    const { data, error } = await supabase
      .from('calendar_blocks')
      .insert({
        owner_id: ownerId,
        booking_id: bookingId,
        block_type: 'booked',
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        title: 'Booked'
      })
      .select()
      .single()

    if (error) throw error

    return data as CalendarBlock
  } catch (error) {
    console.error('createBookingBlock error:', error)
    throw error
  }
}

// =====================================================
// CREATE HOLD BLOCK
// =====================================================

/**
 * Create a hold block for a pending booking request
 * Shows as "tentative" on calendar
 */
export async function createHoldBlock(
  ownerId: string,
  bookingId: string,
  startTime: Date,
  endTime: Date
): Promise<CalendarBlock> {
  try {
    const { data, error } = await supabase
      .from('calendar_blocks')
      .insert({
        owner_id: ownerId,
        booking_id: bookingId,
        block_type: 'hold',
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        title: 'Pending Request'
      })
      .select()
      .single()

    if (error) throw error

    return data as CalendarBlock
  } catch (error) {
    console.error('createHoldBlock error:', error)
    throw error
  }
}

// =====================================================
// RELEASE BOOKING BLOCK
// =====================================================

/**
 * Remove calendar block for a booking (cancelled, declined, etc.)
 */
export async function releaseBookingBlock(bookingId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('calendar_blocks')
      .delete()
      .eq('booking_id', bookingId)

    if (error) throw error
  } catch (error) {
    console.error('releaseBookingBlock error:', error)
    throw error
  }
}

// =====================================================
// CONVERT HOLD TO BOOKED
// =====================================================

/**
 * Convert a hold block to booked when booking is accepted
 */
export async function convertHoldToBooked(bookingId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('calendar_blocks')
      .update({
        block_type: 'booked',
        title: 'Booked'
      })
      .eq('booking_id', bookingId)
      .eq('block_type', 'hold')

    if (error) throw error
  } catch (error) {
    console.error('convertHoldToBooked error:', error)
    throw error
  }
}

// =====================================================
// CHECK AVAILABILITY
// =====================================================

/**
 * Check if a time slot is available for booking
 */
export async function checkAvailability(
  ownerId: string,
  startTime: Date,
  endTime: Date
): Promise<boolean> {
  try {
    // Check for blocking conflicts (booked or blocked_out)
    const { data: conflicts, error } = await supabase
      .from('calendar_blocks')
      .select('id')
      .eq('owner_id', ownerId)
      .in('block_type', ['booked', 'blocked_out'])
      .lt('start_time', endTime.toISOString())
      .gt('end_time', startTime.toISOString())
      .limit(1)

    if (error) throw error

    return !conflicts || conflicts.length === 0
  } catch (error) {
    console.error('checkAvailability error:', error)
    throw error
  }
}

// =====================================================
// CHECK BLOCK OVERLAP
// =====================================================

/**
 * Check if a time slot overlaps with existing blocks
 */
async function checkBlockOverlap(
  ownerId: string,
  startTime: Date,
  endTime: Date,
  excludeBlockId?: string
): Promise<boolean> {
  try {
    let query = supabase
      .from('calendar_blocks')
      .select('id')
      .eq('owner_id', ownerId)
      .in('block_type', ['booked', 'blocked_out', 'hold'])
      .lt('start_time', endTime.toISOString())
      .gt('end_time', startTime.toISOString())
      .limit(1)

    if (excludeBlockId) {
      query = query.neq('id', excludeBlockId)
    }

    const { data, error } = await query

    if (error) throw error

    return data && data.length > 0
  } catch (error) {
    console.error('checkBlockOverlap error:', error)
    return true // Err on side of caution
  }
}

// =====================================================
// GET AVAILABLE SLOTS FOR DAY
// =====================================================

/**
 * Get available hourly slots for a specific day
 */
export async function getAvailableSlotsForDay(
  ownerId: string,
  date: Date,
  slotDurationMinutes: number = 60
): Promise<{ start: Date; end: Date }[]> {
  try {
    // Get start and end of day
    const dayStart = new Date(date)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(date)
    dayEnd.setHours(23, 59, 59, 999)

    // Get all blocks for this day
    const blocks = await getCalendarBlocks(ownerId, dayStart, dayEnd)

    // Get booked and blocked times
    const bookedTimes = blocks
      .filter(b => ['booked', 'blocked_out', 'hold'].includes(b.block_type))
      .map(b => ({
        start: new Date(b.start_time),
        end: new Date(b.end_time)
      }))

    // Get availability windows (if any set)
    const availabilityWindows = blocks
      .filter(b => b.block_type === 'availability')
      .map(b => ({
        start: new Date(b.start_time),
        end: new Date(b.end_time)
      }))

    // Generate all possible slots for the day (9 AM to 9 PM default working hours)
    const workingHoursStart = 9
    const workingHoursEnd = 21
    const slots: { start: Date; end: Date }[] = []

    for (let hour = workingHoursStart; hour < workingHoursEnd; hour++) {
      const slotStart = new Date(date)
      slotStart.setHours(hour, 0, 0, 0)
      const slotEnd = new Date(slotStart)
      slotEnd.setMinutes(slotEnd.getMinutes() + slotDurationMinutes)

      // Check if slot is in the past
      if (slotStart < new Date()) continue

      // Check if slot conflicts with booked times
      const hasConflict = bookedTimes.some(booked =>
        slotStart < booked.end && slotEnd > booked.start
      )

      if (!hasConflict) {
        // If availability windows are set, check if slot falls within them
        if (availabilityWindows.length === 0) {
          slots.push({ start: slotStart, end: slotEnd })
        } else {
          const isWithinAvailability = availabilityWindows.some(window =>
            slotStart >= window.start && slotEnd <= window.end
          )
          if (isWithinAvailability) {
            slots.push({ start: slotStart, end: slotEnd })
          }
        }
      }
    }

    return slots
  } catch (error) {
    console.error('getAvailableSlotsForDay error:', error)
    throw error
  }
}

// =====================================================
// EXPORTS
// =====================================================

export default {
  getCalendarBlocks,
  getMyCalendarBlocks,
  createCalendarBlock,
  updateCalendarBlock,
  deleteCalendarBlock,
  setAvailability,
  blockTime,
  createBookingBlock,
  createHoldBlock,
  releaseBookingBlock,
  convertHoldToBooked,
  checkAvailability,
  getAvailableSlotsForDay
}
