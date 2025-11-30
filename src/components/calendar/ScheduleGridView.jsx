/**
 * SCHEDULE GRID VIEW
 * Surreal-style week/month scheduling overview
 *
 * Features:
 * - Week and month views
 * - Color-coded booking statuses
 * - Click to view/edit booking details
 * - Quick navigation between dates
 * - Multi-talent view for agents
 */

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  CalendarDays,
  Grid3X3,
  Loader2,
  Plus
} from 'lucide-react'
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  isToday,
  parseISO
} from 'date-fns'
import { getBookings } from '../../api/bookings'
import { getCalendarBlocks } from '../../api/calendarUnified'
import { useAuth } from '../../App'

// Status colors matching Surreal's style
const STATUS_COLORS = {
  draft: 'bg-slate-300 text-slate-700',
  pending: 'bg-orange-500 text-white',
  accepted: 'bg-green-500 text-white',
  in_progress: 'bg-blue-500 text-white',
  completed: 'bg-slate-400 text-white',
  cancelled: 'bg-red-500 text-white',
  declined: 'bg-red-400 text-white',
  paid: 'bg-emerald-600 text-white',
  // Calendar blocks
  booking: 'bg-purple-500 text-white',
  manual: 'bg-slate-500 text-white',
  unavailable: 'bg-red-300 text-red-800'
}

const STATUS_LABELS = {
  draft: 'Draft',
  pending: 'Pending',
  accepted: 'Confirmed',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
  declined: 'Declined',
  paid: 'Paid'
}

const ScheduleGridView = ({
  userId = null,
  talents = null, // For agent view: array of { id, name, avatar }
  onEventClick,
  onDateClick,
  showAddButton = true
}) => {
  const { user } = useAuth()
  const targetUserId = userId || user?.id

  const [viewMode, setViewMode] = useState('week') // 'week' or 'month'
  const [currentDate, setCurrentDate] = useState(new Date())
  const [bookings, setBookings] = useState([])
  const [blocks, setBlocks] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Calculate date range based on view mode
  const dateRange = useMemo(() => {
    if (viewMode === 'week') {
      return {
        start: startOfWeek(currentDate, { weekStartsOn: 1 }), // Monday start
        end: endOfWeek(currentDate, { weekStartsOn: 1 })
      }
    } else {
      return {
        start: startOfMonth(currentDate),
        end: endOfMonth(currentDate)
      }
    }
  }, [currentDate, viewMode])

  // Get all days in the range
  const days = useMemo(() => {
    return eachDayOfInterval({ start: dateRange.start, end: dateRange.end })
  }, [dateRange])

  // Load data
  useEffect(() => {
    if (targetUserId) {
      loadData()
    }
  }, [targetUserId, dateRange])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [bookingsData, blocksData] = await Promise.all([
        getBookings(targetUserId, 'both'),
        getCalendarBlocks(targetUserId, dateRange.start, dateRange.end)
      ])

      // Filter bookings to current date range
      const filteredBookings = (bookingsData || []).filter(b => {
        const startDate = parseISO(b.start_date)
        return startDate >= dateRange.start && startDate <= dateRange.end
      })

      setBookings(filteredBookings)
      setBlocks(blocksData || [])
    } catch (err) {
      console.error('Failed to load schedule data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Get events for a specific day
  const getEventsForDay = (day) => {
    const events = []

    // Add bookings
    bookings.forEach(booking => {
      const startDate = parseISO(booking.start_date)
      if (isSameDay(startDate, day)) {
        events.push({
          type: 'booking',
          id: booking.id,
          status: booking.status,
          title: booking.service_description?.substring(0, 30) || 'Booking',
          time: format(startDate, 'HH:mm'),
          amount: booking.total_amount,
          client: booking.client_profile?.display_name,
          freelancer: booking.freelancer_profile?.display_name,
          data: booking
        })
      }
    })

    // Add blocks
    blocks.forEach(block => {
      const startDate = parseISO(block.start_date)
      if (isSameDay(startDate, day)) {
        events.push({
          type: 'block',
          id: block.id,
          status: block.reason,
          title: block.notes || 'Blocked',
          visibilityMessage: block.visibility_message,
          data: block
        })
      }
    })

    return events.sort((a, b) => (a.time || '').localeCompare(b.time || ''))
  }

  // Navigation
  const navigatePrevious = () => {
    if (viewMode === 'week') {
      setCurrentDate(subWeeks(currentDate, 1))
    } else {
      setCurrentDate(subMonths(currentDate, 1))
    }
  }

  const navigateNext = () => {
    if (viewMode === 'week') {
      setCurrentDate(addWeeks(currentDate, 1))
    } else {
      setCurrentDate(addMonths(currentDate, 1))
    }
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Render event pill
  const renderEvent = (event) => {
    const colorClass = STATUS_COLORS[event.status] || 'bg-slate-200 text-slate-700'

    return (
      <div
        key={`${event.type}-${event.id}`}
        onClick={() => onEventClick?.(event)}
        className={`
          px-2 py-1 rounded text-xs truncate cursor-pointer
          hover:opacity-80 transition-opacity mb-1
          ${colorClass}
        `}
        title={event.title}
      >
        {event.time && <span className="font-medium mr-1">{event.time}</span>}
        <span>{event.title}</span>
        {event.amount && (
          <span className="ml-1 opacity-75">${event.amount}</span>
        )}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-3">
          {/* Title & View Toggle */}
          <div className="flex items-center gap-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="w-5 h-5" />
              Schedule
            </CardTitle>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
              <Button
                size="sm"
                variant={viewMode === 'week' ? 'default' : 'ghost'}
                className="h-7 px-3"
                onClick={() => setViewMode('week')}
              >
                <CalendarDays className="w-4 h-4 mr-1" />
                Week
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'month' ? 'default' : 'ghost'}
                className="h-7 px-3"
                onClick={() => setViewMode('month')}
              >
                <Grid3X3 className="w-4 h-4 mr-1" />
                Month
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={navigatePrevious}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium min-w-[140px] text-center">
              {viewMode === 'week'
                ? `${format(dateRange.start, 'MMM d')} - ${format(dateRange.end, 'MMM d, yyyy')}`
                : format(currentDate, 'MMMM yyyy')
              }
            </span>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={navigateNext}>
              <ChevronRight className="w-4 h-4" />
            </Button>

            {showAddButton && (
              <Button size="sm" className="ml-2" onClick={() => onDateClick?.(new Date())}>
                <Plus className="w-4 h-4 mr-1" />
                Add Event
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 mb-4 text-xs">
          {Object.entries(STATUS_LABELS).map(([status, label]) => (
            <div key={status} className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded ${STATUS_COLORS[status]?.split(' ')[0]}`} />
              <span className="text-slate-600 dark:text-slate-400">{label}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded bg-slate-500" />
            <span className="text-slate-600 dark:text-slate-400">Blocked</span>
          </div>
        </div>

        {isLoading ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          /* Grid */
          <div className={`grid ${viewMode === 'week' ? 'grid-cols-7' : 'grid-cols-7'} gap-px bg-slate-200 dark:bg-slate-700 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700`}>
            {/* Header Row */}
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <div
                key={day}
                className="bg-slate-100 dark:bg-slate-800 p-2 text-center text-xs font-medium text-slate-600 dark:text-slate-400"
              >
                {day}
              </div>
            ))}

            {/* Day Cells */}
            {days.map((day) => {
              const events = getEventsForDay(day)
              const isCurrentMonth = isSameMonth(day, currentDate)
              const isCurrentDay = isToday(day)

              return (
                <div
                  key={day.toISOString()}
                  onClick={() => onDateClick?.(day)}
                  className={`
                    min-h-[100px] p-1.5 bg-white dark:bg-slate-900 cursor-pointer
                    hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors
                    ${!isCurrentMonth && viewMode === 'month' ? 'opacity-40' : ''}
                    ${isCurrentDay ? 'ring-2 ring-inset ring-primary' : ''}
                  `}
                >
                  {/* Date Number */}
                  <div className={`
                    text-xs font-medium mb-1
                    ${isCurrentDay ? 'text-primary' : 'text-slate-500 dark:text-slate-400'}
                  `}>
                    {format(day, 'd')}
                  </div>

                  {/* Events */}
                  <div className="space-y-0.5">
                    {events.slice(0, viewMode === 'week' ? 4 : 3).map(event => renderEvent(event))}
                    {events.length > (viewMode === 'week' ? 4 : 3) && (
                      <div className="text-xs text-slate-500 text-center">
                        +{events.length - (viewMode === 'week' ? 4 : 3)} more
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Stats Summary */}
        <div className="mt-4 pt-4 border-t flex flex-wrap items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-6">
            <div>
              <span className="text-muted-foreground">Total Bookings:</span>
              <span className="font-semibold ml-1">{bookings.length}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Confirmed:</span>
              <span className="font-semibold ml-1 text-green-600">
                {bookings.filter(b => b.status === 'accepted').length}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Pending:</span>
              <span className="font-semibold ml-1 text-orange-600">
                {bookings.filter(b => b.status === 'pending').length}
              </span>
            </div>
          </div>
          <div>
            <span className="text-muted-foreground">Revenue:</span>
            <span className="font-semibold ml-1 text-primary">
              ${bookings
                .filter(b => ['accepted', 'completed', 'paid'].includes(b.status))
                .reduce((sum, b) => sum + (b.total_amount || 0), 0)
                .toLocaleString()
              }
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ScheduleGridView
