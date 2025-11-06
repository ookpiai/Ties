import { useState, useEffect } from 'react'
import Calendar from 'react-calendar'
import { format, startOfMonth, endOfMonth, isSameDay, parseISO } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Calendar as CalendarIcon, X } from 'lucide-react'
import {
  getCalendarBlocks,
  createCalendarBlock,
  deleteCalendarBlock,
  checkAvailability
} from '../../api/availability'
import 'react-calendar/dist/Calendar.css'
import './AvailabilityCalendar.css'

const AvailabilityCalendar = ({ userId, isOwnProfile = false }) => {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [blocks, setBlocks] = useState([])
  const [availability, setAvailability] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isBlocking, setIsBlocking] = useState(false)
  const [error, setError] = useState('')
  const [selectedBlock, setSelectedBlock] = useState(null)

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

      // Load blocks and availability in parallel
      const [blocksData, availabilityData] = await Promise.all([
        getCalendarBlocks(userId, monthStart, monthEnd),
        checkAvailability(userId, monthStart, monthEnd)
      ])

      setBlocks(blocksData)
      setAvailability(availabilityData)
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

  // Handle date click
  const handleDateClick = (date) => {
    if (!isOwnProfile) {
      // If viewing someone else's calendar, just show info
      const block = getBlockForDate(date)
      setSelectedBlock(block)
      return
    }

    // If own profile, allow blocking/unblocking
    const block = getBlockForDate(date)
    if (block) {
      setSelectedBlock(block)
    } else {
      // No block exists, show option to create one
      setSelectedBlock({ date, isNew: true })
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

    const blocked = isDateBlocked(date)

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

        {/* Legend */}
        <div className="flex items-center gap-4 mb-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-100 border border-green-300 rounded" />
            <span className="text-gray-600">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-100 border border-red-300 rounded" />
            <span className="text-gray-600">Blocked</span>
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

        {/* Stats */}
        <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4 text-center text-sm">
          <div>
            <div className="text-2xl font-bold text-green-600">
              {availability.filter(d => d.is_available).length}
            </div>
            <div className="text-gray-600">Available Days</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">
              {availability.filter(d => !d.is_available).length}
            </div>
            <div className="text-gray-600">Blocked Days</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default AvailabilityCalendar
