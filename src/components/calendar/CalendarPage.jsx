/**
 * CALENDAR PAGE
 * Primary calendar view - Surreal-inspired design
 *
 * Features:
 * - Multiple views (day, week, month, agenda)
 * - Job integration - shows jobs on calendar
 * - Booking integration - shows all bookings
 * - Availability management
 * - Color-coded event statuses
 * - Quick navigation
 * - Filtering and search
 */

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  MoreHorizontal,
  MapPin,
  DollarSign,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle
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
  eachHourOfInterval,
  isSameDay,
  isSameMonth,
  isToday,
  addDays,
  addWeeks,
  addMonths,
  subDays,
  subWeeks,
  subMonths,
  parseISO,
  setHours,
  getHours,
  differenceInDays
} from 'date-fns'
import { useAuth } from '../../App'
import { getCalendarBlocks, createCalendarBlock, deleteCalendarBlock } from '../../api/calendarUnified'
import { getBookings } from '../../api/bookings'
import { getMyJobs, getAppliedJobs } from '../../api/jobs'
import { getPendingRequests } from '../../api/availabilityRequests'
import DateRangeBlockModal from './DateRangeBlockModal'
import AvailabilityRequestsPanel from './AvailabilityRequestsPanel'
import 'react-calendar/dist/Calendar.css'

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
}

const CalendarPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  // View state
  const [viewMode, setViewMode] = useState('month') // day, week, month, agenda
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)

  // Data state
  const [bookings, setBookings] = useState([])
  const [blocks, setBlocks] = useState([])
  const [jobs, setJobs] = useState([])
  const [appliedJobs, setAppliedJobs] = useState([])
  const [availabilityRequests, setAvailabilityRequests] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Filter state
  const [filterType, setFilterType] = useState('all') // all, bookings, jobs, blocks
  const [searchQuery, setSearchQuery] = useState('')

  // Modal state
  const [showBlockModal, setShowBlockModal] = useState(false)
  const [showEventDetails, setShowEventDetails] = useState(null)
  const [isBlockingDates, setIsBlockingDates] = useState(false)

  // Calculate date range based on view
  const dateRange = useMemo(() => {
    switch (viewMode) {
      case 'day':
        return { start: startOfDay(currentDate), end: endOfDay(currentDate) }
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
      const [blocksData, bookingsData, jobsData, appliedJobsData, requestsData] = await Promise.all([
        getCalendarBlocks(user.id, dateRange.start, dateRange.end).catch(() => []),
        getBookings(user.id, 'both').catch(() => []),
        getMyJobs().catch(() => []),
        getAppliedJobs().catch(() => []),
        getPendingRequests(user.id).catch(() => [])
      ])

      setBlocks(blocksData || [])
      setBookings(bookingsData || [])
      setJobs(jobsData || [])
      setAppliedJobs(appliedJobsData || [])
      setAvailabilityRequests(requestsData || [])
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
    if (filterType === 'all' || filterType === 'jobs') {
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
              status: app.status === 'accepted' ? 'confirmed' : 'applied',
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
  }, [bookings, jobs, appliedJobs, blocks, filterType, searchQuery, dateRange, user?.id])

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
  const navigate_ = (direction) => {
    const multiplier = direction === 'next' ? 1 : -1
    switch (viewMode) {
      case 'day':
        setCurrentDate(prev => addDays(prev, multiplier))
        break
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

  // Handle block dates
  const handleBlockDates = async (blockData) => {
    setIsBlockingDates(true)
    try {
      await createCalendarBlock({
        start_date: blockData.startDate,
        end_date: blockData.endDate,
        reason: 'manual',
        visibility_message: blockData.visibilityMessage,
        notes: blockData.notes,
        timezone: blockData.timezone,
        is_recurring: blockData.isRecurring,
        recurrence_pattern: blockData.recurrencePattern
      })
      setShowBlockModal(false)
      loadCalendarData()
    } catch (err) {
      console.error('Failed to block dates:', err)
    } finally {
      setIsBlockingDates(false)
    }
  }

  // Handle event click
  const handleEventClick = (event) => {
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
    if (viewMode === 'day') return [currentDate]
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
  const renderEventChip = (event, compact = false) => {
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
          ${colors.bg} ${colors.text} rounded px-2 py-1 cursor-pointer
          hover:opacity-90 transition-opacity mb-1 text-xs truncate
          flex items-center gap-1
          ${compact ? 'text-[10px] py-0.5' : ''}
        `}
        title={event.title}
      >
        <Icon className={compact ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
        <span className="truncate">{event.title}</span>
        {event.amount && !compact && (
          <span className="ml-auto opacity-75">${event.amount}</span>
        )}
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
          min-h-[100px] p-1.5 border-r border-b border-slate-200 dark:border-slate-700
          cursor-pointer transition-colors
          ${!isCurrentMonth && viewMode === 'month' ? 'bg-slate-50 dark:bg-slate-800/50' : 'bg-white dark:bg-slate-900'}
          ${isCurrentDay ? 'ring-2 ring-inset ring-primary' : ''}
          ${isSelected ? 'bg-primary/5' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}
        `}
      >
        {/* Date header */}
        <div className={`
          text-xs font-medium mb-1 flex items-center justify-between
          ${isCurrentDay ? 'text-primary' : isCurrentMonth ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400'}
        `}>
          <span className={isCurrentDay ? 'bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center' : ''}>
            {format(day, 'd')}
          </span>
          {dayEvents.length > 3 && (
            <Badge variant="secondary" className="text-[10px] px-1 py-0">
              +{dayEvents.length - 3}
            </Badge>
          )}
        </div>

        {/* Events */}
        <div className="space-y-0.5">
          {dayEvents.slice(0, viewMode === 'week' ? 2 : 3).map(event =>
            renderEventChip(event, viewMode === 'week')
          )}
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
        <div className="py-12 text-center text-muted-foreground">
          <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No events this month</p>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {sortedDays.map(dayKey => {
          const day = parseISO(dayKey)
          const events = groupedByDay[dayKey]

          return (
            <div key={dayKey} className="border rounded-lg overflow-hidden">
              <div className={`
                px-4 py-2 font-medium text-sm flex items-center gap-2
                ${isToday(day) ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800'}
              `}>
                <CalendarIcon className="w-4 h-4" />
                {format(day, 'EEEE, MMMM d, yyyy')}
                <Badge variant={isToday(day) ? 'secondary' : 'outline'} className="ml-auto">
                  {events.length} event{events.length !== 1 ? 's' : ''}
                </Badge>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {events.map(event => (
                  <div
                    key={event.id}
                    onClick={() => handleEventClick(event)}
                    className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer flex items-start gap-4"
                  >
                    <div className={`
                      w-3 h-3 rounded-full mt-1.5 flex-shrink-0
                      ${STATUS_COLORS[event.status]?.bg || 'bg-slate-400'}
                    `} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-sm">{event.title}</p>
                          {event.location && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3" />
                              {event.location}
                            </p>
                          )}
                          {event.otherParty && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              with {event.otherParty.display_name}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <Badge className={`${STATUS_COLORS[event.status]?.bg} ${STATUS_COLORS[event.status]?.text}`}>
                            {STATUS_COLORS[event.status]?.label || event.status}
                          </Badge>
                          {event.amount && (
                            <p className="text-sm font-semibold text-primary mt-1">
                              ${event.amount}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // Stats summary
  const stats = useMemo(() => {
    const upcomingBookings = bookings.filter(b =>
      ['pending', 'accepted', 'confirmed'].includes(b.status) &&
      parseISO(b.start_date) >= new Date()
    )
    const activeJobs = jobs.filter(j => j.status === 'open')
    const pendingApplications = appliedJobs.filter(a => a.status === 'pending')

    return {
      upcomingBookings: upcomingBookings.length,
      activeJobs: activeJobs.length,
      pendingApplications: pendingApplications.length,
      availabilityRequests: availabilityRequests.length,
      totalRevenue: upcomingBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0)
    }
  }, [bookings, jobs, appliedJobs, availabilityRequests])

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <CalendarIcon className="w-8 h-8 text-primary" />
            Calendar
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your schedule, bookings, and jobs
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowBlockModal(true)}
          >
            <Lock className="w-4 h-4 mr-2" />
            Block Dates
          </Button>
          <Link to="/jobs/create">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Job
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                <CalendarIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.upcomingBookings}</p>
                <p className="text-xs text-muted-foreground">Upcoming Bookings</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.activeJobs}</p>
                <p className="text-xs text-muted-foreground">Active Jobs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/20 border-cyan-200 dark:border-cyan-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pendingApplications}</p>
                <p className="text-xs text-muted-foreground">Pending Apps</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-200 dark:border-amber-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.availabilityRequests}</p>
                <p className="text-xs text-muted-foreground">Avail. Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Expected Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* View mode & navigation */}
            <div className="flex items-center gap-2">
              {/* View toggle */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                <Button
                  size="sm"
                  variant={viewMode === 'month' ? 'default' : 'ghost'}
                  className="h-8 px-3"
                  onClick={() => setViewMode('month')}
                >
                  <Grid3X3 className="w-4 h-4 mr-1" />
                  Month
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === 'week' ? 'default' : 'ghost'}
                  className="h-8 px-3"
                  onClick={() => setViewMode('week')}
                >
                  <CalendarDays className="w-4 h-4 mr-1" />
                  Week
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === 'agenda' ? 'default' : 'ghost'}
                  className="h-8 px-3"
                  onClick={() => setViewMode('agenda')}
                >
                  <List className="w-4 h-4 mr-1" />
                  Agenda
                </Button>
              </div>

              {/* Navigation */}
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" onClick={goToToday}>
                  Today
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => navigate_('prev')}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm font-medium min-w-[150px] text-center">
                  {viewMode === 'day' && format(currentDate, 'EEEE, MMM d, yyyy')}
                  {viewMode === 'week' && `${format(dateRange.start, 'MMM d')} - ${format(dateRange.end, 'MMM d, yyyy')}`}
                  {(viewMode === 'month' || viewMode === 'agenda') && format(currentDate, 'MMMM yyyy')}
                </span>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => navigate_('next')}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-[200px] h-9"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[130px] h-9">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  <SelectItem value="bookings">Bookings</SelectItem>
                  <SelectItem value="jobs">Jobs</SelectItem>
                  <SelectItem value="blocks">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-24 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading calendar...</p>
            </div>
          ) : viewMode === 'agenda' ? (
            <div className="p-4">
              {renderAgendaView()}
            </div>
          ) : (
            <>
              {/* Legend */}
              <div className="flex flex-wrap items-center gap-4 px-4 pb-4 text-xs border-b">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-orange-500" />
                  <span>Pending</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-green-500" />
                  <span>Confirmed</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-purple-500" />
                  <span>Job</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-cyan-500" />
                  <span>Applied</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-slate-600" />
                  <span>Blocked</span>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="overflow-x-auto">
                <div className={`
                  grid border-l border-t border-slate-200 dark:border-slate-700
                  ${viewMode === 'week' ? 'grid-cols-7' : 'grid-cols-7'}
                `} style={{ minWidth: '700px' }}>
                  {/* Header row */}
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                    <div
                      key={day}
                      className="p-2 text-center text-xs font-medium text-muted-foreground
                        bg-slate-50 dark:bg-slate-800 border-r border-b border-slate-200 dark:border-slate-700"
                    >
                      {day}
                    </div>
                  ))}

                  {/* Day cells */}
                  {days.map(day => renderDayCell(day))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Selected Day Panel */}
      {selectedDate && viewMode !== 'agenda' && (
        <Card className="mt-4">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setSelectedDate(null)}>
                <XCircle className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {getEventsForDay(selectedDate).length === 0 ? (
              <div className="py-6 text-center text-muted-foreground">
                <p>No events on this day</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => setShowBlockModal(true)}
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Block this date
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {getEventsForDay(selectedDate).map(event => (
                  <div
                    key={event.id}
                    onClick={() => handleEventClick(event)}
                    className="p-3 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${STATUS_COLORS[event.status]?.bg}`} />
                      <div>
                        <p className="font-medium text-sm">{event.title}</p>
                        {event.otherParty && (
                          <p className="text-xs text-muted-foreground">
                            with {event.otherParty.display_name}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {event.amount && (
                        <span className="text-sm font-semibold text-primary">
                          ${event.amount}
                        </span>
                      )}
                      <Badge className={`${STATUS_COLORS[event.status]?.bg} ${STATUS_COLORS[event.status]?.text}`}>
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

      {/* Availability Requests Section */}
      {availabilityRequests.length > 0 && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              Availability Requests
              <Badge variant="secondary">{availabilityRequests.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AvailabilityRequestsPanel onRequestsChange={() => loadCalendarData()} />
          </CardContent>
        </Card>
      )}

      {/* Block Dates Modal */}
      <DateRangeBlockModal
        isOpen={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        onConfirm={handleBlockDates}
        isLoading={isBlockingDates}
        initialDate={selectedDate}
      />

      {/* Event Details Modal */}
      {showEventDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowEventDetails(null)}>
          <Card className="w-full max-w-md m-4" onClick={e => e.stopPropagation()}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{showEventDetails.title}</CardTitle>
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
                    <Button className="w-full">
                      <Eye className="w-4 h-4 mr-2" />
                      View Booking
                    </Button>
                  </Link>
                )}
                {showEventDetails.type === 'block' && showEventDetails.data.reason === 'manual' && (
                  <Button
                    variant="destructive"
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
                <Button variant="outline" onClick={() => setShowEventDetails(null)}>
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

export default CalendarPage
