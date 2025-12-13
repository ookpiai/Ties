/**
 * CALENDAR VIEW COMPONENT
 * Reusable Surreal-style calendar view
 * Can be embedded in BookingsPage or used standalone
 */

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Filter,
  Grid3X3,
  List,
  CalendarDays,
  Clock,
  Briefcase,
  Users,
  Lock,
  Eye,
  MapPin,
  DollarSign,
  Loader2,
  XCircle
} from 'lucide-react'
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfDay,
  endOfDay,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  isToday,
  addDays,
  addWeeks,
  addMonths,
  parseISO
} from 'date-fns'
import { useAuth } from '../../App'
import { getCalendarBlocks, deleteCalendarBlock } from '../../api/calendarUnified'
import { getBookings } from '../../api/bookings'
import { getMyJobs, getAppliedJobs } from '../../api/jobs'

// Status colors - Surreal style
const STATUS_COLORS = {
  // Booking statuses
  pending: { bg: 'bg-orange-500', text: 'text-white', label: 'Pending' },
  accepted: { bg: 'bg-green-500', text: 'text-white', label: 'Confirmed' },
  confirmed: { bg: 'bg-green-500', text: 'text-white', label: 'Confirmed' },
  in_progress: { bg: 'bg-blue-500', text: 'text-white', label: 'In Progress' },
  completed: { bg: 'bg-slate-400', text: 'text-white', label: 'Completed' },
  cancelled: { bg: 'bg-red-500', text: 'text-white', label: 'Cancelled' },
  declined: { bg: 'bg-red-400', text: 'text-white', label: 'Declined' },
  paid: { bg: 'bg-emerald-600', text: 'text-white', label: 'Paid' },
  // Job statuses
  open: { bg: 'bg-purple-500', text: 'text-white', label: 'Open Job' },
  filled: { bg: 'bg-indigo-500', text: 'text-white', label: 'Filled' },
  // Block types
  manual: { bg: 'bg-slate-600', text: 'text-white', label: 'Blocked' },
  unavailable: { bg: 'bg-red-300', text: 'text-red-900', label: 'Unavailable' },
  hold: { bg: 'bg-amber-400', text: 'text-amber-900', label: 'Hold' },
  // Applications
  applied: { bg: 'bg-cyan-500', text: 'text-white', label: 'Applied' },
  selected: { bg: 'bg-green-500', text: 'text-white', label: 'Selected' },
}

const CalendarView = ({
  onBlockDates,
  onEventClick,
  showJobIntegration = true,
  showStats = false,
  compact = false
}) => {
  const { user } = useAuth()
  const navigate = useNavigate()

  // View state
  const [viewMode, setViewMode] = useState('month') // week, month, agenda
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)

  // Data state
  const [bookings, setBookings] = useState([])
  const [blocks, setBlocks] = useState([])
  const [jobs, setJobs] = useState([])
  const [appliedJobs, setAppliedJobs] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Filter state
  const [filterType, setFilterType] = useState('all') // all, bookings, jobs, blocks
  const [searchQuery, setSearchQuery] = useState('')

  // Modal state
  const [showEventDetails, setShowEventDetails] = useState(null)

  // Calculate date range based on view
  const dateRange = useMemo(() => {
    switch (viewMode) {
      case 'week':
        return {
          start: startOfWeek(currentDate, { weekStartsOn: 1 }),
          end: endOfWeek(currentDate, { weekStartsOn: 1 })
        }
      case 'month':
      case 'agenda':
      default:
        return { start: startOfMonth(currentDate), end: endOfMonth(currentDate) }
    }
  }, [currentDate, viewMode])

  // Load all calendar data
  useEffect(() => {
    if (user?.id) {
      loadCalendarData()
    }
  }, [user?.id, dateRange])

  const loadCalendarData = async () => {
    setIsLoading(true)
    try {
      const promises = [
        getCalendarBlocks(user.id, dateRange.start, dateRange.end).catch(() => []),
        getBookings(user.id, 'both').catch(() => [])
      ]

      if (showJobIntegration) {
        promises.push(
          getMyJobs().catch(() => []),
          getAppliedJobs().catch(() => [])
        )
      }

      const [blocksData, bookingsData, jobsData, appliedJobsData] = await Promise.all(promises)

      setBlocks(blocksData || [])
      setBookings(bookingsData || [])
      if (showJobIntegration) {
        setJobs(jobsData || [])
        setAppliedJobs(appliedJobsData || [])
      }
    } catch (err) {
      console.error('Failed to load calendar data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Combine all events for calendar display
  const allEvents = useMemo(() => {
    const events = []

    // Add bookings
    if (filterType === 'all' || filterType === 'bookings') {
      bookings.forEach(booking => {
        const startDate = parseISO(booking.start_date)
        if (startDate >= dateRange.start && startDate <= dateRange.end) {
          events.push({
            id: `booking-${booking.id}`,
            type: 'booking',
            title: booking.service_description?.substring(0, 50) || 'Booking',
            start: startDate,
            end: booking.end_date ? parseISO(booking.end_date) : addDays(startDate, 1),
            status: booking.status,
            amount: booking.total_amount,
            data: booking,
            otherParty: booking.freelancer_id === user?.id
              ? booking.client_profile
              : booking.freelancer_profile
          })
        }
      })
    }

    // Add my jobs (as organizer)
    if (showJobIntegration && (filterType === 'all' || filterType === 'jobs')) {
      jobs.forEach(job => {
        if (job.start_date) {
          const startDate = parseISO(job.start_date)
          if (startDate >= dateRange.start && startDate <= dateRange.end) {
            events.push({
              id: `job-${job.id}`,
              type: 'job',
              title: job.title,
              start: startDate,
              end: job.end_date ? parseISO(job.end_date) : startDate,
              status: job.status,
              location: job.location,
              data: job,
              isOrganizer: true
            })
          }
        }
      })

      // Add applied jobs
      appliedJobs.forEach(app => {
        const job = app.job_posting || app.job
        if (job?.start_date) {
          const startDate = parseISO(job.start_date)
          if (startDate >= dateRange.start && startDate <= dateRange.end) {
            events.push({
              id: `applied-${app.id}`,
              type: 'applied',
              title: job.title,
              start: startDate,
              end: job.end_date ? parseISO(job.end_date) : startDate,
              status: app.status === 'selected' ? 'selected' : 'applied',
              location: job.location,
              data: { ...app, job },
              applicationStatus: app.status
            })
          }
        }
      })
    }

    // Add blocks
    if (filterType === 'all' || filterType === 'blocks') {
      blocks.forEach(block => {
        const startDate = parseISO(block.start_date)
        if (startDate >= dateRange.start && startDate <= dateRange.end) {
          events.push({
            id: `block-${block.id}`,
            type: 'block',
            title: block.notes || block.visibility_message || 'Blocked',
            start: startDate,
            end: parseISO(block.end_date),
            status: block.reason,
            data: block
          })
        }
      })
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return events.filter(event =>
        event.title.toLowerCase().includes(query) ||
        event.location?.toLowerCase().includes(query) ||
        event.otherParty?.display_name?.toLowerCase().includes(query)
      )
    }

    return events.sort((a, b) => a.start - b.start)
  }, [bookings, jobs, appliedJobs, blocks, filterType, searchQuery, dateRange, user?.id, showJobIntegration])

  // Get events for a specific day
  const getEventsForDay = useCallback((day) => {
    return allEvents.filter(event => {
      const eventStart = event.start
      const eventEnd = event.end
      return (isSameDay(eventStart, day) ||
        (eventStart <= day && eventEnd > day))
    })
  }, [allEvents])

  // Navigation
  const navigateCalendar = (direction) => {
    const multiplier = direction === 'next' ? 1 : -1
    switch (viewMode) {
      case 'week':
        setCurrentDate(prev => addWeeks(prev, multiplier))
        break
      case 'month':
      case 'agenda':
        setCurrentDate(prev => addMonths(prev, multiplier))
        break
    }
  }

  const goToToday = () => setCurrentDate(new Date())

  // Handle event click
  const handleEventClick = (event) => {
    if (onEventClick) {
      onEventClick(event)
      return
    }

    if (event.type === 'job' || event.type === 'applied') {
      navigate(`/jobs/${event.data.job_id || event.data.id}`)
    } else if (event.type === 'booking') {
      setShowEventDetails(event)
    } else {
      setShowEventDetails(event)
    }
  }

  // Get days for grid
  const days = useMemo(() => {
    if (viewMode === 'week') {
      return eachDayOfInterval({ start: dateRange.start, end: dateRange.end })
    }
    // Month view - include days from prev/next month to fill grid
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd })
  }, [currentDate, viewMode, dateRange])

  // Render event chip
  const renderEventChip = (event, isCompact = false) => {
    const colors = STATUS_COLORS[event.status] || STATUS_COLORS.pending
    const Icon = event.type === 'job' ? Briefcase :
      event.type === 'applied' ? Users :
        event.type === 'block' ? Lock :
          CalendarIcon

    return (
      <div
        key={event.id}
        onClick={(e) => { e.stopPropagation(); handleEventClick(event) }}
        className={`
          ${colors.bg} ${colors.text} rounded px-1.5 py-0.5 cursor-pointer
          hover:opacity-90 transition-opacity mb-0.5 truncate
          flex items-center gap-1
          ${isCompact ? 'text-[10px]' : 'text-xs'}
        `}
        title={event.title}
      >
        <Icon className={isCompact ? 'w-2.5 h-2.5 flex-shrink-0' : 'w-3 h-3 flex-shrink-0'} />
        <span className="truncate">{event.title}</span>
      </div>
    )
  }

  // Render day cell (for month/week view)
  const renderDayCell = (day) => {
    const dayEvents = getEventsForDay(day)
    const isCurrentMonth = isSameMonth(day, currentDate)
    const isCurrentDay = isToday(day)
    const isSelected = selectedDate && isSameDay(day, selectedDate)

    return (
      <div
        key={day.toISOString()}
        onClick={() => setSelectedDate(day)}
        className={`
          min-h-[80px] p-1 border-r border-b border-slate-200 dark:border-slate-700
          cursor-pointer transition-colors
          ${!isCurrentMonth && viewMode === 'month' ? 'bg-slate-50 dark:bg-slate-800/50' : 'bg-white dark:bg-slate-900'}
          ${isCurrentDay ? 'ring-2 ring-inset ring-primary' : ''}
          ${isSelected ? 'bg-primary/5' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}
        `}
      >
        {/* Date header */}
        <div className={`
          text-xs font-medium mb-0.5 flex items-center justify-between
          ${isCurrentDay ? 'text-primary' : isCurrentMonth ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400'}
        `}>
          <span className={isCurrentDay ? 'bg-primary text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px]' : ''}>
            {format(day, 'd')}
          </span>
          {dayEvents.length > 2 && (
            <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4">
              +{dayEvents.length - 2}
            </Badge>
          )}
        </div>

        {/* Events */}
        <div className="space-y-0.5 overflow-hidden">
          {dayEvents.slice(0, 2).map(event => renderEventChip(event, true))}
        </div>
      </div>
    )
  }

  // Render agenda view
  const renderAgendaView = () => {
    const groupedByDay = {}
    allEvents.forEach(event => {
      const dayKey = format(event.start, 'yyyy-MM-dd')
      if (!groupedByDay[dayKey]) groupedByDay[dayKey] = []
      groupedByDay[dayKey].push(event)
    })

    const sortedDays = Object.keys(groupedByDay).sort()

    if (sortedDays.length === 0) {
      return (
        <div className="py-8 text-center text-muted-foreground">
          <CalendarIcon className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p>No events this month</p>
        </div>
      )
    }

    return (
      <div className="space-y-3">
        {sortedDays.map(dayKey => {
          const day = parseISO(dayKey)
          const events = groupedByDay[dayKey]

          return (
            <div key={dayKey} className="border rounded-lg overflow-hidden">
              <div className={`
                px-3 py-2 font-medium text-sm flex items-center gap-2
                ${isToday(day) ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800'}
              `}>
                <CalendarIcon className="w-4 h-4" />
                {format(day, 'EEE, MMM d')}
                <Badge variant={isToday(day) ? 'secondary' : 'outline'} className="ml-auto text-xs">
                  {events.length}
                </Badge>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {events.map(event => (
                  <div
                    key={event.id}
                    onClick={() => handleEventClick(event)}
                    className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer flex items-center gap-3"
                  >
                    <div className={`
                      w-2.5 h-2.5 rounded-full flex-shrink-0
                      ${STATUS_COLORS[event.status]?.bg || 'bg-slate-400'}
                    `} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{event.title}</p>
                      {event.otherParty && (
                        <p className="text-xs text-muted-foreground">
                          with {event.otherParty.display_name}
                        </p>
                      )}
                    </div>
                    <Badge className={`${STATUS_COLORS[event.status]?.bg} ${STATUS_COLORS[event.status]?.text} text-xs`}>
                      {STATUS_COLORS[event.status]?.label || event.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* View toggle & navigation */}
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
            <Button
              size="sm"
              variant={viewMode === 'month' ? 'default' : 'ghost'}
              className="h-7 px-2 text-xs"
              onClick={() => setViewMode('month')}
            >
              <Grid3X3 className="w-3.5 h-3.5 mr-1" />
              Month
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'week' ? 'default' : 'ghost'}
              className="h-7 px-2 text-xs"
              onClick={() => setViewMode('week')}
            >
              <CalendarDays className="w-3.5 h-3.5 mr-1" />
              Week
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'agenda' ? 'default' : 'ghost'}
              className="h-7 px-2 text-xs"
              onClick={() => setViewMode('agenda')}
            >
              <List className="w-3.5 h-3.5 mr-1" />
              List
            </Button>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={goToToday}>
              Today
            </Button>
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => navigateCalendar('prev')}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium min-w-[120px] text-center">
              {viewMode === 'week' && `${format(dateRange.start, 'MMM d')} - ${format(dateRange.end, 'd')}`}
              {(viewMode === 'month' || viewMode === 'agenda') && format(currentDate, 'MMMM yyyy')}
            </span>
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => navigateCalendar('next')}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 w-[150px] h-7 text-xs"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[110px] h-7 text-xs">
              <Filter className="w-3.5 h-3.5 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="bookings">Bookings</SelectItem>
              {showJobIntegration && <SelectItem value="jobs">Jobs</SelectItem>}
              <SelectItem value="blocks">Blocked</SelectItem>
            </SelectContent>
          </Select>
          {onBlockDates && (
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={onBlockDates}>
              <Lock className="w-3.5 h-3.5 mr-1" />
              Block
            </Button>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded bg-orange-500" />
          <span className="text-muted-foreground">Pending</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded bg-green-500" />
          <span className="text-muted-foreground">Confirmed</span>
        </div>
        {showJobIntegration && (
          <>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded bg-purple-500" />
              <span className="text-muted-foreground">My Job</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded bg-cyan-500" />
              <span className="text-muted-foreground">Applied</span>
            </div>
          </>
        )}
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded bg-slate-600" />
          <span className="text-muted-foreground">Blocked</span>
        </div>
      </div>

      {/* Calendar Content */}
      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary mb-3" />
          <p className="text-sm text-muted-foreground">Loading calendar...</p>
        </div>
      ) : viewMode === 'agenda' ? (
        renderAgendaView()
      ) : (
        <div className="overflow-x-auto border rounded-lg">
          <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-700" style={{ minWidth: '500px' }}>
            {/* Header row */}
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <div
                key={day}
                className="p-1.5 text-center text-xs font-medium text-muted-foreground
                  bg-slate-50 dark:bg-slate-800 border-r last:border-r-0 border-slate-200 dark:border-slate-700"
              >
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7" style={{ minWidth: '500px' }}>
            {days.map(day => renderDayCell(day))}
          </div>
        </div>
      )}

      {/* Selected Day Panel */}
      {selectedDate && viewMode !== 'agenda' && (
        <Card className="border-primary/20">
          <CardHeader className="pb-2 pt-3 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </CardTitle>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setSelectedDate(null)}>
                <XCircle className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            {getEventsForDay(selectedDate).length === 0 ? (
              <div className="py-4 text-center text-muted-foreground text-sm">
                <p>No events on this day</p>
                {onBlockDates && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 text-xs"
                    onClick={onBlockDates}
                  >
                    <Lock className="w-3 h-3 mr-1" />
                    Block this date
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {getEventsForDay(selectedDate).map(event => (
                  <div
                    key={event.id}
                    onClick={() => handleEventClick(event)}
                    className="p-2 rounded border hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_COLORS[event.status]?.bg}`} />
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{event.title}</p>
                        {event.otherParty && (
                          <p className="text-xs text-muted-foreground truncate">
                            with {event.otherParty.display_name}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {event.amount && (
                        <span className="text-xs font-semibold text-primary">
                          ${event.amount}
                        </span>
                      )}
                      <Badge className={`${STATUS_COLORS[event.status]?.bg} ${STATUS_COLORS[event.status]?.text} text-xs`}>
                        {STATUS_COLORS[event.status]?.label}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Event Details Modal */}
      {showEventDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowEventDetails(null)}>
          <Card className="w-full max-w-md m-4" onClick={e => e.stopPropagation()}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{showEventDetails.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {format(showEventDetails.start, 'EEEE, MMMM d, yyyy')}
                  </p>
                </div>
                <Badge className={`${STATUS_COLORS[showEventDetails.status]?.bg} ${STATUS_COLORS[showEventDetails.status]?.text}`}>
                  {STATUS_COLORS[showEventDetails.status]?.label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {showEventDetails.type === 'booking' && (
                <>
                  {showEventDetails.otherParty && (
                    <div className="flex items-center gap-3">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>{showEventDetails.otherParty.display_name}</span>
                    </div>
                  )}
                  {showEventDetails.amount && (
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <span className="font-semibold">${showEventDetails.amount}</span>
                    </div>
                  )}
                </>
              )}

              {showEventDetails.type === 'block' && (
                <div className="text-sm text-muted-foreground">
                  {showEventDetails.data.visibility_message || showEventDetails.data.notes || 'This time is blocked.'}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                {showEventDetails.type === 'booking' && (
                  <Link to="/bookings" className="flex-1">
                    <Button className="w-full" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      View Booking
                    </Button>
                  </Link>
                )}
                {showEventDetails.type === 'block' && showEventDetails.data.reason === 'manual' && (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    onClick={async () => {
                      await deleteCalendarBlock(showEventDetails.data.id)
                      setShowEventDetails(null)
                      loadCalendarData()
                    }}
                  >
                    Remove Block
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => setShowEventDetails(null)}>
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default CalendarView
