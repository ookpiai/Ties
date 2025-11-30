/**
 * HOURLY CALENDAR
 * Booking MVP - Hourly Calendar Grid
 *
 * Features:
 * - Day view and Week view
 * - Hourly time blocks with color coding
 * - Click to view booking details
 * - Shows price inside booking blocks
 */

import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, ChevronLeft, ChevronRight, Calendar, Grid3X3 } from 'lucide-react'
import { format, addDays, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isToday, isBefore, addWeeks, subWeeks } from 'date-fns'
import { getCalendarBlocks } from '../../api/calendarUnified'
import { cn } from '@/lib/utils'

// Block type colors (using 'reason' field from unified API)
const BLOCK_COLORS = {
  availability: 'bg-green-100 border-green-300 text-green-800 hover:bg-green-200',
  booking: 'bg-blue-100 border-blue-300 text-blue-800 hover:bg-blue-200',
  hold: 'bg-yellow-100 border-yellow-300 text-yellow-800 hover:bg-yellow-200',
  manual: 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200',
  unavailable: 'bg-red-100 border-red-300 text-red-600 hover:bg-red-200'
}

const BLOCK_LABELS = {
  availability: 'Available',
  booking: 'Booked',
  hold: 'Pending',
  manual: 'Blocked',
  unavailable: 'Unavailable'
}

// Working hours (9 AM to 9 PM)
const WORKING_HOURS = Array.from({ length: 13 }, (_, i) => i + 9) // 9, 10, ..., 21

const HourlyCalendar = ({
  userId,
  onBlockClick,
  onSlotSelect,
  showBookingDetails = true,
  selectable = false,
  selectedSlot = null
}) => {
  const [view, setView] = useState('week') // 'day' | 'week'
  const [currentDate, setCurrentDate] = useState(new Date())
  const [blocks, setBlocks] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Calculate date range based on view
  const dateRange = useMemo(() => {
    if (view === 'day') {
      const dayStart = new Date(currentDate)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(currentDate)
      dayEnd.setHours(23, 59, 59, 999)
      return {
        start: dayStart,
        end: dayEnd,
        days: [new Date(currentDate)]
      }
    } else {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 }) // Monday
      const end = endOfWeek(currentDate, { weekStartsOn: 1 })
      return {
        start,
        end,
        days: eachDayOfInterval({ start, end })
      }
    }
  }, [view, currentDate])

  // Load blocks when date range changes
  useEffect(() => {
    if (userId) {
      loadBlocks()
    }
  }, [userId, dateRange.start.toISOString(), dateRange.end.toISOString()])

  const loadBlocks = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getCalendarBlocks(
        userId,
        dateRange.start,
        dateRange.end
      )
      setBlocks(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Navigation handlers
  const handlePrevious = () => {
    if (view === 'day') {
      setCurrentDate(prev => subDays(prev, 1))
    } else {
      setCurrentDate(prev => subWeeks(prev, 1))
    }
  }

  const handleNext = () => {
    if (view === 'day') {
      setCurrentDate(prev => addDays(prev, 1))
    } else {
      setCurrentDate(prev => addWeeks(prev, 1))
    }
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  // Get blocks for a specific day and hour
  const getBlocksForSlot = (day, hour) => {
    const slotStart = new Date(day)
    slotStart.setHours(hour, 0, 0, 0)
    const slotEnd = new Date(day)
    slotEnd.setHours(hour + 1, 0, 0, 0)

    return blocks.filter(block => {
      // Use start_date/end_date from unified API (not start_time/end_time)
      const blockStart = new Date(block.start_date)
      const blockEnd = new Date(block.end_date)
      return blockStart < slotEnd && blockEnd > slotStart
    })
  }

  // Handle slot click
  const handleSlotClick = (day, hour, slotBlocks) => {
    if (slotBlocks.length > 0 && onBlockClick) {
      // Click on existing block
      onBlockClick(slotBlocks[0])
    } else if (selectable && onSlotSelect) {
      // Select empty slot for booking
      const slotStart = new Date(day)
      slotStart.setHours(hour, 0, 0, 0)
      const slotEnd = new Date(day)
      slotEnd.setHours(hour + 1, 0, 0, 0)
      onSlotSelect({ start: slotStart, end: slotEnd })
    }
  }

  // Check if slot is selected
  const isSlotSelected = (day, hour) => {
    if (!selectedSlot) return false
    const slotStart = new Date(day)
    slotStart.setHours(hour, 0, 0, 0)
    return selectedSlot.start?.getTime() === slotStart.getTime()
  }

  // Render time slot
  const renderTimeSlot = (day, hour) => {
    const slotBlocks = getBlocksForSlot(day, hour)
    const isPast = isBefore(new Date(day).setHours(hour), new Date())
    const isSelected = isSlotSelected(day, hour)

    if (slotBlocks.length === 0) {
      // Empty slot
      return (
        <div
          key={`${day}-${hour}`}
          className={cn(
            'h-12 border-b border-r border-slate-200 dark:border-slate-700 transition-colors',
            isPast ? 'bg-slate-50 dark:bg-slate-900/50' : 'hover:bg-slate-100 dark:hover:bg-slate-800',
            selectable && !isPast && 'cursor-pointer',
            isSelected && 'ring-2 ring-primary ring-inset bg-primary/10'
          )}
          onClick={() => !isPast && handleSlotClick(day, hour, slotBlocks)}
        />
      )
    }

    // Slot has blocks - use 'reason' field from unified API
    const block = slotBlocks[0]
    return (
      <div
        key={`${day}-${hour}`}
        className={cn(
          'h-12 border-b border-r border-slate-200 dark:border-slate-700 p-0.5 cursor-pointer transition-all',
          isPast && 'opacity-50'
        )}
        onClick={() => handleSlotClick(day, hour, slotBlocks)}
      >
        <div
          className={cn(
            'h-full rounded px-1 py-0.5 text-xs font-medium flex items-center justify-between border',
            BLOCK_COLORS[block.reason] || 'bg-gray-100 border-gray-300 text-gray-600'
          )}
        >
          <span className="truncate">
            {block.reason === 'booking' && block.booking?.client_profile?.display_name
              ? block.booking.client_profile.display_name
              : BLOCK_LABELS[block.reason] || block.reason}
          </span>
          {showBookingDetails && block.reason === 'booking' && block.booking?.total_amount && (
            <span className="font-bold ml-1">
              ${block.booking.total_amount}
            </span>
          )}
        </div>
      </div>
    )
  }

  // Render day header
  const renderDayHeader = (day) => {
    const isCurrentDay = isToday(day)
    return (
      <div
        className={cn(
          'text-center py-2 border-b border-r border-slate-200 dark:border-slate-700 font-medium text-sm',
          isCurrentDay && 'bg-primary/10'
        )}
      >
        <div className={cn(
          'text-xs text-slate-500 dark:text-slate-400',
          isCurrentDay && 'text-primary'
        )}>
          {format(day, 'EEE')}
        </div>
        <div className={cn(
          'text-lg',
          isCurrentDay && 'text-primary font-bold'
        )}>
          {format(day, 'd')}
        </div>
      </div>
    )
  }

  return (
    <Card className="bg-surface border border-app rounded-xl">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-lg font-semibold">
            {view === 'day'
              ? format(currentDate, 'EEEE, MMMM d, yyyy')
              : `${format(dateRange.start, 'MMM d')} - ${format(dateRange.end, 'MMM d, yyyy')}`}
          </CardTitle>

          <div className="flex items-center gap-2">
            {/* View Toggle */}
            <div className="flex rounded-lg border border-slate-200 dark:border-slate-700">
              <Button
                size="sm"
                variant={view === 'day' ? 'default' : 'ghost'}
                className="rounded-r-none h-8"
                onClick={() => setView('day')}
              >
                <Calendar className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant={view === 'week' ? 'default' : 'ghost'}
                className="rounded-l-none h-8"
                onClick={() => setView('week')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
            </div>

            {/* Navigation */}
            <Button size="sm" variant="outline" onClick={handleToday}>
              Today
            </Button>
            <Button size="icon" variant="outline" className="h-8 w-8" onClick={handlePrevious}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="outline" className="h-8 w-8" onClick={handleNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-3 text-xs">
          {Object.entries(BLOCK_LABELS).map(([type, label]) => (
            <div key={type} className="flex items-center gap-1.5">
              <div className={cn('w-3 h-3 rounded border', BLOCK_COLORS[type])} />
              <span className="text-slate-600 dark:text-slate-400">{label}</span>
            </div>
          ))}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {error && (
          <div className="text-center py-12 text-red-600">
            Error loading calendar: {error}
          </div>
        )}

        {!isLoading && !error && (
          <div className="overflow-x-auto">
            <div className="min-w-[640px]">
              {/* Calendar Grid */}
              <div className="grid" style={{
                gridTemplateColumns: `60px repeat(${dateRange.days.length}, 1fr)`
              }}>
                {/* Time column header */}
                <div className="border-b border-r border-slate-200 dark:border-slate-700" />

                {/* Day headers */}
                {dateRange.days.map((day, idx) => (
                  <div key={idx}>
                    {renderDayHeader(day)}
                  </div>
                ))}

                {/* Time rows */}
                {WORKING_HOURS.map(hour => (
                  <React.Fragment key={hour}>
                    {/* Time label */}
                    <div className="h-12 border-b border-r border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {format(new Date().setHours(hour, 0), 'h a')}
                    </div>

                    {/* Day slots */}
                    {dateRange.days.map((day, idx) => renderTimeSlot(day, hour))}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default HourlyCalendar
