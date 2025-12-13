/**
 * BOOKINGS PAGE
 * Day 27 - Phase 4A
 *
 * Displays user's bookings (as client and as freelancer)
 * Updated with modern FilterBar component
 */

import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import StatusBadge from '@/components/ui/StatusBadge'
import { Button } from '@/components/ui/button'
import EmptyState from '@/components/ui/EmptyState'
import FilterBar from '@/components/ui/FilterBar'
import { Loader2, Calendar, Inbox, TrendingUp, DollarSign, Clock, CheckCircle, Search, CalendarCheck, CalendarDays, Lock, AlertCircle, ChevronRight, XCircle, PlayCircle, CreditCard } from 'lucide-react'
import { useAuth } from '../../App'
import { getBookings, getBookingStats } from '../../api/bookings'
import BookingCard from './BookingCard'
import { HelpTooltip } from '@/components/ui/HelpTooltip'
import { helpContent } from '../../constants/helpContent'
import AvailabilityRequestsPanel from '../calendar/AvailabilityRequestsPanel'
import CalendarView from '../calendar/CalendarView'
import DateRangeBlockModal from '../calendar/DateRangeBlockModal'
import { createCalendarBlock } from '../../api/calendarUnified'

const BookingsPage = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('schedule')
  const [bookings, setBookings] = useState([])
  const [stats, setStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0)
  const [showBlockModal, setShowBlockModal] = useState(false)
  const [isBlockingDates, setIsBlockingDates] = useState(false)

  useEffect(() => {
    if (user?.id) {
      loadBookings()
      loadStats()
    }
  }, [user?.id, activeTab])

  const loadBookings = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // Always get all bookings (both client and freelancer)
      const data = await getBookings(user.id, 'both')
      setBookings(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const data = await getBookingStats(user.id)
      setStats(data)
    } catch (err) {
      console.error('Failed to load stats:', err)
    }
  }

  const handleBookingUpdate = () => {
    loadBookings()
    loadStats()
  }

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
    } catch (err) {
      console.error('Failed to block dates:', err)
    } finally {
      setIsBlockingDates(false)
    }
  }

  // Filter bookings by status and search
  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      // Status filter
      if (statusFilter !== 'all' && booking.status !== statusFilter) {
        return false
      }
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const freelancerName = booking.freelancer?.display_name?.toLowerCase() || ''
        const clientName = booking.client?.display_name?.toLowerCase() || ''
        const notes = booking.notes?.toLowerCase() || ''
        return freelancerName.includes(query) || clientName.includes(query) || notes.includes(query)
      }
      return true
    })
  }, [bookings, statusFilter, searchQuery])

  // Get status counts
  const getStatusCount = (status) => {
    return bookings.filter(b => b.status === status).length
  }

  // Get pending bookings that need the user's action (freelancer needs to accept/decline)
  const pendingActionBookings = useMemo(() => {
    return bookings.filter(booking =>
      booking.status === 'pending' && booking.freelancer_id === user?.id
    )
  }, [bookings, user?.id])

  // Get upcoming accepted bookings (for management)
  const upcomingBookings = useMemo(() => {
    const now = new Date()
    return bookings.filter(booking =>
      ['accepted', 'in_progress'].includes(booking.status) &&
      new Date(booking.start_date) >= now
    ).sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
  }, [bookings])

  // Clear all filters
  const clearAllFilters = () => {
    setStatusFilter('all')
    setSearchQuery('')
  }

  // Filter configuration for FilterBar
  const filterConfig = [
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      value: statusFilter,
      onChange: setStatusFilter,
      icon: Clock,
      options: [
        { value: 'all', label: 'All Statuses', count: bookings.length },
        { value: 'pending', label: 'Pending', icon: Clock, count: getStatusCount('pending') },
        { value: 'confirmed', label: 'Confirmed', icon: CheckCircle, count: getStatusCount('confirmed') },
        { value: 'accepted', label: 'Accepted', icon: CheckCircle, count: getStatusCount('accepted') },
        { value: 'paid', label: 'Paid', icon: CreditCard, count: getStatusCount('paid') },
        { value: 'in_progress', label: 'In Progress', icon: PlayCircle, count: getStatusCount('in_progress') },
        { value: 'completed', label: 'Completed', icon: CheckCircle, count: getStatusCount('completed') },
        { value: 'cancelled', label: 'Cancelled', icon: XCircle, count: getStatusCount('cancelled') }
      ]
    }
  ]

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          Bookings
          <HelpTooltip
            content="View your schedule and manage all your bookings. The calendar shows your jobs, bookings, and availability at a glance. Click on events to see details."
            title="Your Bookings"
            variant="info"
            size="sm"
          />
        </h1>
        <p className="text-muted-foreground">
          Manage your schedule and bookings
        </p>
      </div>

      {/* Pending Actions Panel - Shows when there are bookings requiring attention */}
      {!isLoading && pendingActionBookings.length > 0 && (
        <Card className="mb-6 border-orange-300 dark:border-orange-700 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/10 dark:to-amber-900/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-orange-800 dark:text-orange-200">
                    {pendingActionBookings.length} Booking{pendingActionBookings.length !== 1 ? 's' : ''} Awaiting Your Response
                  </h3>
                  <p className="text-sm text-orange-600 dark:text-orange-400">
                    Accept or decline these booking requests to manage your schedule
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-orange-300 text-orange-700 hover:bg-orange-100 dark:border-orange-600 dark:text-orange-300"
                onClick={() => {
                  setActiveTab('all')
                  setStatusFilter('pending')
                }}
              >
                View All
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            {/* Quick action cards for pending bookings */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {pendingActionBookings.slice(0, 3).map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  currentUserId={user?.id}
                  onUpdate={handleBookingUpdate}
                />
              ))}
            </div>

            {pendingActionBookings.length > 3 && (
              <p className="text-sm text-orange-600 dark:text-orange-400 mt-3 text-center">
                +{pendingActionBookings.length - 3} more pending bookings
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Statistics Cards - Surreal-inspired */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-surface border border-app rounded-xl hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                {stats.as_client.total}
              </div>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Hired Others
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-500">
                ${stats.as_client.total_spent.toFixed(2)} spent
              </p>
            </CardContent>
          </Card>

          <Card className="bg-surface border border-app rounded-xl hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                {stats.as_freelancer.total}
              </div>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Got Hired
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-500">
                ${stats.as_freelancer.total_earned.toFixed(2)} earned
              </p>
            </CardContent>
          </Card>

          <Card className="bg-surface border border-app rounded-xl hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                  <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                {stats.as_client.pending + stats.as_freelancer.pending}
              </div>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Pending
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-500">
                {stats.as_freelancer.pending} need attention
              </p>
            </CardContent>
          </Card>

          <Card className="bg-surface border border-app rounded-xl hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="w-8 h-8 bg-gray-100 dark:bg-gray-900/20 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                {stats.as_client.completed + stats.as_freelancer.completed}
              </div>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Completed
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-500">
                All time
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs and Filters */}
      <Card>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="schedule">
                <CalendarDays className="w-4 h-4 mr-1" />
                Schedule
              </TabsTrigger>
              <TabsTrigger value="all">
                All Bookings
                {bookings.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {bookings.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="requests">
                <CalendarCheck className="w-4 h-4 mr-1" />
                Requests
                {pendingRequestsCount > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {pendingRequestsCount}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Modern Filter Bar - Only show on bookings tab */}
            {activeTab === 'all' && (
              <FilterBar
                searchValue={searchQuery}
                onSearchChange={setSearchQuery}
                searchPlaceholder="Search by name or notes..."
                filters={filterConfig}
                onClearAll={clearAllFilters}
                resultCount={filteredBookings.length}
                resultLabel="booking"
                showActivePills={true}
                bordered={false}
              />
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Loading bookings...</p>
              </div>
            )}

            {/* Error State */}
            {error && !isLoading && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="text-red-600 mb-4">Error loading bookings</div>
                <p className="text-sm text-muted-foreground mb-4">{error}</p>
                <Button onClick={loadBookings}>Try Again</Button>
              </div>
            )}

            {/* Bookings Content */}
            {!isLoading && !error && (
              <>
                <TabsContent value="schedule" className="mt-0">
                  <CalendarView
                    showJobIntegration={true}
                    onBlockDates={() => setShowBlockModal(true)}
                    onEventClick={(event) => {
                      if (event.type === 'booking') {
                        // Navigate to bookings tab and search for this booking
                        setActiveTab('all')
                        setStatusFilter('all')
                        setSearchQuery(event.title.substring(0, 20))
                      }
                    }}
                  />
                </TabsContent>

                <TabsContent value="all" className="mt-0">
                  <BookingsList
                    bookings={filteredBookings}
                    currentUserId={user?.id}
                    onUpdate={handleBookingUpdate}
                  />
                </TabsContent>

                <TabsContent value="requests" className="mt-0">
                  <AvailabilityRequestsPanel
                    onRequestsChange={(count) => setPendingRequestsCount(count)}
                  />
                </TabsContent>
              </>
            )}
          </Tabs>
        </CardContent>
      </Card>

      {/* Date Range Block Modal */}
      <DateRangeBlockModal
        isOpen={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        onConfirm={handleBlockDates}
        isLoading={isBlockingDates}
      />
    </div>
  )
}

// Separate component for bookings list
const BookingsList = ({ bookings, currentUserId, onUpdate }) => {
  if (bookings.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title="No bookings found"
        description="When you book someone or receive a booking request, it will appear here. Start by discovering creative professionals."
        action={{
          label: "Discover Talent",
          href: "/discover",
          icon: Search
        }}
        secondaryAction={{
          label: "View Calendar",
          href: "/calendar",
          icon: Calendar
        }}
      />
    )
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <BookingCard
          key={booking.id}
          booking={booking}
          currentUserId={currentUserId}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  )
}

export default BookingsPage
