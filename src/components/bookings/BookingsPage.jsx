/**
 * BOOKINGS PAGE
 * Day 27 - Phase 4A
 *
 * Displays user's bookings (as client and as freelancer)
 * Replaced mock data with real API calls
 */

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, Calendar, Inbox } from 'lucide-react'
import { useAuth } from '../../App'
import { getBookings, getBookingStats } from '../../api/bookings'
import BookingCard from './BookingCard'

const BookingsPage = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('all')
  const [bookings, setBookings] = useState([])
  const [stats, setStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')

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
      // Determine role filter based on active tab
      const roleFilter = activeTab === 'as-client' ? 'client' : activeTab === 'as-freelancer' ? 'freelancer' : 'both'
      const data = await getBookings(user.id, roleFilter)
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

  // Filter bookings by status
  const filteredBookings = bookings.filter(booking => {
    if (statusFilter === 'all') return true
    return booking.status === statusFilter
  })

  // Get status counts
  const getStatusCount = (status) => {
    return bookings.filter(b => b.status === status).length
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Bookings</h1>
        <p className="text-muted-foreground">
          Manage your bookings and requests
        </p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                As Client
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.as_client.total}</div>
              <p className="text-xs text-muted-foreground mt-1">
                ${stats.as_client.total_spent.toFixed(2)} spent
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                As Freelancer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.as_freelancer.total}</div>
              <p className="text-xs text-muted-foreground mt-1">
                ${stats.as_freelancer.total_earned.toFixed(2)} earned
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.as_client.pending + stats.as_freelancer.pending}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.as_freelancer.pending} need your attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.as_client.completed + stats.as_freelancer.completed}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
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
              <TabsTrigger value="all">
                All Bookings
                {bookings.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {bookings.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="as-client">
                As Client
                {stats && stats.as_client.total > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {stats.as_client.total}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="as-freelancer">
                As Freelancer
                {stats && stats.as_freelancer.total > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {stats.as_freelancer.total}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Status Filter Badges */}
            <div className="flex flex-wrap gap-2 mb-6">
              <Button
                size="sm"
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('all')}
              >
                All {bookings.length > 0 && `(${bookings.length})`}
              </Button>
              <Button
                size="sm"
                variant={statusFilter === 'pending' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('pending')}
              >
                Pending {getStatusCount('pending') > 0 && `(${getStatusCount('pending')})`}
              </Button>
              <Button
                size="sm"
                variant={statusFilter === 'accepted' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('accepted')}
              >
                Accepted {getStatusCount('accepted') > 0 && `(${getStatusCount('accepted')})`}
              </Button>
              <Button
                size="sm"
                variant={statusFilter === 'in_progress' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('in_progress')}
              >
                In Progress {getStatusCount('in_progress') > 0 && `(${getStatusCount('in_progress')})`}
              </Button>
              <Button
                size="sm"
                variant={statusFilter === 'completed' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('completed')}
              >
                Completed {getStatusCount('completed') > 0 && `(${getStatusCount('completed')})`}
              </Button>
            </div>

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
                <TabsContent value="all" className="mt-0">
                  <BookingsList
                    bookings={filteredBookings}
                    currentUserId={user?.id}
                    onUpdate={handleBookingUpdate}
                  />
                </TabsContent>

                <TabsContent value="as-client" className="mt-0">
                  <BookingsList
                    bookings={filteredBookings}
                    currentUserId={user?.id}
                    onUpdate={handleBookingUpdate}
                  />
                </TabsContent>

                <TabsContent value="as-freelancer" className="mt-0">
                  <BookingsList
                    bookings={filteredBookings}
                    currentUserId={user?.id}
                    onUpdate={handleBookingUpdate}
                  />
                </TabsContent>
              </>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

// Separate component for bookings list
const BookingsList = ({ bookings, currentUserId, onUpdate }) => {
  if (bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Inbox className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No bookings found</h3>
        <p className="text-sm text-muted-foreground text-center max-w-sm">
          When you book someone or receive a booking request, it will appear here.
        </p>
      </div>
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
