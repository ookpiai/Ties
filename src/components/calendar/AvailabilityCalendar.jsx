import { useState, useEffect } from 'react'
import Calendar from 'react-calendar'
import { format, startOfMonth, endOfMonth, isSameDay, parseISO } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import StatusBadge from '@/components/ui/StatusBadge'
import { Loader2, Calendar as CalendarIcon, X, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  getCalendarBlocks,
  createCalendarBlock,
  deleteCalendarBlock,
  checkAvailability
} from '../../api/calendarUnified'
import { getBookings } from '../../api/bookings'
import 'react-calendar/dist/Calendar.css'
import './AvailabilityCalendar.css'

const AvailabilityCalendar = ({ userId, isOwnProfile = false }) => {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [blocks, setBlocks] = useState([])
  const [bookings, setBookings] = useState([])
  const [availability, setAvailability] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isBlocking, setIsBlocking] = useState(false)
  const [error, setError] = useState('')
  const [selectedBlock, setSelectedBlock] = useState(null)
  const [selectedBooking, setSelectedBooking] = useState(null)

  // Load calendar blocks for current month
  useEffect(() => {
    loadMonthData()
  }, [userId, selectedDate])

  const loadMonthData = async () => {
    setIsLoading(true)
    setError('')

    try {
      const monthStart = startOfMonth(selectedDate)
      const monthEnd = endOfMonth(selectedDate)

      // Load blocks, availability, and bookings in parallel
      const [blocksData, availabilityData, bookingsData] = await Promise.all([
        getCalendarBlocks(userId, monthStart, monthEnd),
        checkAvailability(userId, monthStart, monthEnd),
        getBookings(userId, 'both')
      ])

      setBlocks(blocksData)
      setAvailability(availabilityData)
      // Filter bookings to show only those within current month view
      const filteredBookings = (bookingsData || []).filter(booking => {
        const startDate = new Date(booking.start_date)
        return startDate >= monthStart && startDate <= monthEnd
      })
      setBookings(filteredBookings)
    } catch (err) {
      console.error('Failed to load calendar data:', err)
      setError('Failed to load calendar. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Check if a date is blocked
  const isDateBlocked = (date) => {
    return blocks.some(block => {
      const startDate = parseISO(block.start_date)
      const endDate = parseISO(block.end_date)
      return date >= startDate && date < endDate
    })
  }

  // Get block for a specific date
  const getBlockForDate = (date) => {
    return blocks.find(block => {
      const startDate = parseISO(block.start_date)
      const endDate = parseISO(block.end_date)
      return date >= startDate && date < endDate
    })
  }

  // Get bookings for a specific date
  const getBookingsForDate = (date) => {
    return bookings.filter(booking => {
      const startDate = new Date(booking.start_date)
      startDate.setHours(0, 0, 0, 0)
      const compareDate = new Date(date)
      compareDate.setHours(0, 0, 0, 0)
      return isSameDay(startDate, compareDate)
    })
  }

  // Get booking color based on status
  const getBookingColor = (status) => {
    const colors = {
      'pending': 'bg-orange-500', // Orange - Surreal pattern
      'accepted': 'bg-green-500', // Green - Confirmed
      'in_progress': 'bg-blue-500', // Blue - Active
      'completed': 'bg-gray-400', // Gray - Done
      'cancelled': 'bg-red-500', // Red - Cancelled
      'declined': 'bg-red-500' // Red - Declined
    }
    return colors[status] || 'bg-blue-400'
  }

  // Handle date click
  const handleDateClick = (date) => {
    const dateBookings = getBookingsForDate(date)

    // If there are bookings on this date, show them
    if (dateBookings.length > 0) {
      setSelectedBooking({ date, bookings: dateBookings })
      setSelectedBlock(null)
      return
    }

    if (!isOwnProfile) {
      // If viewing someone else's calendar, just show block info
      const block = getBlockForDate(date)
      setSelectedBlock(block)
      setSelectedBooking(null)
      return
    }

    // If own profile, allow blocking/unblocking
    const block = getBlockForDate(date)
    if (block) {
      setSelectedBlock(block)
      setSelectedBooking(null)
    } else {
      // No block exists, show option to create one
      setSelectedBlock({ date, isNew: true })
      setSelectedBooking(null)
    }
  }

  // Block a date
  const handleBlockDate = async () => {
    if (!selectedBlock?.isNew) return

    setIsBlocking(true)
    setError('')

    try {
      const startDate = new Date(selectedBlock.date)
      startDate.setHours(0, 0, 0, 0)

      const endDate = new Date(selectedBlock.date)
      endDate.setHours(23, 59, 59, 999)

      await createCalendarBlock({
        user_id: userId,
        start_date: startDate,
        end_date: endDate,
        reason: 'manual',
        notes: 'Manually blocked via calendar'
      })

      // Reload data
      await loadMonthData()
      setSelectedBlock(null)
    } catch (err) {
      console.error('Failed to block date:', err)
      setError(err.message || 'Failed to block date')
    } finally {
      setIsBlocking(false)
    }
  }

  // Unblock a date
  const handleUnblockDate = async () => {
    if (!selectedBlock?.id) return

    setIsBlocking(true)
    setError('')

    try {
      await deleteCalendarBlock(selectedBlock.id)

      // Reload data
      await loadMonthData()
      setSelectedBlock(null)
    } catch (err) {
      console.error('Failed to unblock date:', err)
      setError(err.message || 'Failed to unblock date')
    } finally {
      setIsBlocking(false)
    }
  }

  // Custom tile content (show indicators)
  const tileContent = ({ date, view }) => {
    if (view !== 'month') return null

    const dateBookings = getBookingsForDate(date)
    const blocked = isDateBlocked(date)

    // Show bookings as color-coded dots (Surreal style)
    if (dateBookings.length > 0) {
      return (
        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
          {dateBookings.slice(0, 3).map((booking, idx) => (
            <div
              key={idx}
              className={`w-1.5 h-1.5 rounded-full ${getBookingColor(booking.status)}`}
              title={`${booking.service_type || 'Booking'} - ${booking.status}`}
            />
          ))}
          {dateBookings.length > 3 && (
            <span className="text-xs text-slate-600 ml-0.5">+{dateBookings.length - 3}</span>
          )}
        </div>
      )
    }

    // Show blocked dates
    if (blocked) {
      return (
        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
          <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
        </div>
      )
    }

    return null
  }

  // Custom tile class (for styling)
  const tileClassName = ({ date, view }) => {
    if (view !== 'month') return ''

    const blocked = isDateBlocked(date)

    if (blocked) {
      return 'blocked-date'
    }

    return 'available-date'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5" />
          {isOwnProfile ? 'My Availability' : 'Availability Calendar'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Legend - Surreal style */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-orange-500 rounded-full" />
            <span className="text-slate-600 dark:text-slate-400">Pending</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-slate-600 dark:text-slate-400">Confirmed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
            <span className="text-slate-600 dark:text-slate-400">In Progress</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-gray-400 rounded-full" />
            <span className="text-slate-600 dark:text-slate-400">Completed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-red-500 rounded-full" />
            <span className="text-slate-600 dark:text-slate-400">Blocked/Cancelled</span>
          </div>
        </div>

        {/* Calendar */}
        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          )}

          <Calendar
            value={selectedDate}
            onActiveStartDateChange={({ activeStartDate }) => setSelectedDate(activeStartDate)}
            onClickDay={handleDateClick}
            tileContent={tileContent}
            tileClassName={tileClassName}
            className="w-full border-0"
          />
        </div>

        {/* Selected Date Info */}
        {selectedBlock && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold text-sm">
                {selectedBlock.isNew
                  ? `Block ${format(selectedBlock.date, 'MMMM d, yyyy')}`
                  : `Blocked: ${format(parseISO(selectedBlock.start_date), 'MMM d')} - ${format(parseISO(selectedBlock.end_date), 'MMM d, yyyy')}`
                }
              </h4>
              <button
                onClick={() => setSelectedBlock(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {!selectedBlock.isNew && (
              <div className="space-y-2 mb-3">
                <div className="flex items-center gap-2">
                  <Badge variant={selectedBlock.reason === 'booking' ? 'default' : 'secondary'}>
                    {selectedBlock.reason}
                  </Badge>
                </div>
                {selectedBlock.notes && (
                  <p className="text-sm text-gray-600">{selectedBlock.notes}</p>
                )}
              </div>
            )}

            {/* Actions */}
            {isOwnProfile && (
              <div className="flex gap-2">
                {selectedBlock.isNew ? (
                  <Button
                    onClick={handleBlockDate}
                    disabled={isBlocking}
                    size="sm"
                    className="w-full"
                  >
                    {isBlocking ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Blocking...
                      </>
                    ) : (
                      'Block This Date'
                    )}
                  </Button>
                ) : (
                  selectedBlock.reason === 'manual' && (
                    <Button
                      onClick={handleUnblockDate}
                      disabled={isBlocking}
                      variant="destructive"
                      size="sm"
                      className="w-full"
                    >
                      {isBlocking ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Unblocking...
                        </>
                      ) : (
                        'Unblock This Date'
                      )}
                    </Button>
                  )
                )}
              </div>
            )}

            {!isOwnProfile && !selectedBlock.isNew && (
              <p className="text-sm text-gray-600">
                This date is unavailable for booking.
              </p>
            )}
          </div>
        )}

        {/* Selected Booking(s) Info */}
        {selectedBooking && (
          <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-start justify-between mb-3">
              <h4 className="font-semibold text-sm text-slate-900 dark:text-white">
                {format(selectedBooking.date, 'MMMM d, yyyy')} - {selectedBooking.bookings.length} Booking{selectedBooking.bookings.length > 1 ? 's' : ''}
              </h4>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {selectedBooking.bookings.map((booking) => {
                const isFreelancer = booking.freelancer_id === userId
                const otherParty = isFreelancer ? booking.client : booking.freelancer
                return (
                  <div
                    key={booking.id}
                    className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {booking.service_type || 'Booking'}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                          {isFreelancer ? 'Client: ' : 'Freelancer: '}
                          {otherParty?.display_name || 'Unknown'}
                        </p>
                      </div>
                      <StatusBadge status={booking.status} type="booking" size="sm" />
                    </div>

                    {booking.start_time && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                        {booking.start_time}
                        {booking.end_time && ` - ${booking.end_time}`}
                      </p>
                    )}

                    {booking.total_amount && (
                      <p className="text-sm font-semibold text-primary mb-2">
                        ${booking.total_amount.toFixed(2)}
                      </p>
                    )}

                    <Link to={`/bookings/${booking.id}`}>
                      <Button variant="outline" size="sm" className="w-full text-xs">
                        <Eye className="w-3 h-3 mr-1" />
                        View Details
                      </Button>
                    </Link>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-4 text-center text-sm">
          <div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {bookings.length}
            </div>
            <div className="text-slate-600 dark:text-slate-400 text-xs">Bookings</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {availability.filter(d => d.is_available).length}
            </div>
            <div className="text-slate-600 dark:text-slate-400 text-xs">Available</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {availability.filter(d => !d.is_available).length}
            </div>
            <div className="text-slate-600 dark:text-slate-400 text-xs">Blocked</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default AvailabilityCalendar
