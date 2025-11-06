import { useState, useEffect } from 'react'
import Calendar from 'react-calendar'
import { format, differenceInDays, addDays, parseISO } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Calendar as CalendarIcon, AlertCircle, Check } from 'lucide-react'
import {
  getCalendarBlocks,
  areDatesAvailable
} from '../../api/availability'
import 'react-calendar/dist/Calendar.css'
import './AvailabilityCalendar.css'

const DatePicker = ({
  userId,
  onDateSelect,
  minDate = new Date(),
  maxDate = null,
  hourlyRate = null
}) => {
  const [dateRange, setDateRange] = useState([null, null])
  const [startDate, endDate] = dateRange
  const [blocks, setBlocks] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isChecking, setIsChecking] = useState(false)
  const [availabilityError, setAvailabilityError] = useState('')
  const [isAvailable, setIsAvailable] = useState(null)

  // Load blocked dates for the next 3 months
  useEffect(() => {
    loadBlockedDates()
  }, [userId])

  const loadBlockedDates = async () => {
    setIsLoading(true)

    try {
      const today = new Date()
      const in3Months = addDays(today, 90)

      const blocksData = await getCalendarBlocks(userId, today, in3Months)
      setBlocks(blocksData)
    } catch (err) {
      console.error('Failed to load blocked dates:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Check if a specific date is blocked
  const isDateBlocked = (date) => {
    return blocks.some(block => {
      const blockStart = parseISO(block.start_date)
      const blockEnd = parseISO(block.end_date)
      return date >= blockStart && date < blockEnd
    })
  }

  // Check availability when date range is selected
  useEffect(() => {
    if (startDate && endDate) {
      checkRangeAvailability()
    } else {
      setIsAvailable(null)
      setAvailabilityError('')
    }
  }, [startDate, endDate])

  const checkRangeAvailability = async () => {
    if (!startDate || !endDate) return

    setIsChecking(true)
    setAvailabilityError('')

    try {
      const available = await areDatesAvailable(userId, startDate, endDate)

      setIsAvailable(available)

      if (!available) {
        setAvailabilityError('Some dates in your selection are unavailable. Please choose different dates.')
      }
    } catch (err) {
      console.error('Failed to check availability:', err)
      setAvailabilityError('Failed to check availability. Please try again.')
    } finally {
      setIsChecking(false)
    }
  }

  // Handle date range change
  const handleDateChange = (value) => {
    setDateRange(value)

    // If both dates selected and available, call parent callback
    if (Array.isArray(value) && value[0] && value[1]) {
      // Will check availability in useEffect
    }
  }

  // Confirm selection
  const handleConfirmSelection = () => {
    if (!startDate || !endDate || !isAvailable) return

    onDateSelect({
      startDate,
      endDate,
      totalDays,
      totalCost
    })
  }

  // Calculate total days and cost
  const totalDays = startDate && endDate
    ? differenceInDays(endDate, startDate) + 1
    : 0

  const totalCost = hourlyRate && totalDays
    ? hourlyRate * totalDays * 8 // Assuming 8 hours per day
    : null

  // Custom tile content
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

  // Custom tile class
  const tileClassName = ({ date, view }) => {
    if (view !== 'month') return ''

    const blocked = isDateBlocked(date)

    if (blocked) {
      return 'blocked-date'
    }

    return 'available-date'
  }

  // Disable blocked dates
  const tileDisabled = ({ date, view }) => {
    if (view !== 'month') return false

    // Disable dates before minDate
    if (minDate && date < minDate) return true

    // Disable dates after maxDate
    if (maxDate && date > maxDate) return true

    // Disable blocked dates
    return isDateBlocked(date)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5" />
          Select Dates
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Instructions */}
        <p className="text-sm text-gray-600 mb-4">
          Click to select your start date, then click again to select your end date.
          Blocked dates cannot be selected.
        </p>

        {/* Legend */}
        <div className="flex items-center gap-4 mb-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-100 border border-green-300 rounded" />
            <span className="text-gray-600">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-100 border border-red-300 rounded" />
            <span className="text-gray-600">Unavailable</span>
          </div>
        </div>

        {/* Calendar */}
        <div className="relative mb-4">
          {isLoading && (
            <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          )}

          <Calendar
            selectRange
            value={dateRange}
            onChange={handleDateChange}
            minDate={minDate}
            maxDate={maxDate}
            tileContent={tileContent}
            tileClassName={tileClassName}
            tileDisabled={tileDisabled}
            className="w-full border-0"
          />
        </div>

        {/* Selected Range Info */}
        {startDate && endDate && (
          <div className="space-y-3">
            {/* Availability Status */}
            {isChecking ? (
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-sm text-gray-600">Checking availability...</span>
              </div>
            ) : isAvailable === true ? (
              <Alert className="bg-green-50 border-green-200">
                <Check className="w-4 h-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  These dates are available!
                </AlertDescription>
              </Alert>
            ) : isAvailable === false ? (
              <Alert variant="destructive">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>
                  {availabilityError}
                </AlertDescription>
              </Alert>
            ) : null}

            {/* Date Range Summary */}
            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Start Date:</span>
                <span className="font-medium">{format(startDate, 'MMM d, yyyy')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">End Date:</span>
                <span className="font-medium">{format(endDate, 'MMM d, yyyy')}</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t">
                <span className="text-gray-600">Total Days:</span>
                <span className="font-semibold">{totalDays} {totalDays === 1 ? 'day' : 'days'}</span>
              </div>
              {totalCost && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Estimated Cost:</span>
                  <span className="font-semibold text-primary">£{totalCost.toLocaleString()}</span>
                </div>
              )}
            </div>

            {/* Confirm Button */}
            <Button
              onClick={handleConfirmSelection}
              disabled={!isAvailable || isChecking}
              className="w-full"
            >
              {isChecking ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : isAvailable ? (
                'Confirm Selection'
              ) : (
                'Select Available Dates'
              )}
            </Button>
          </div>
        )}

        {/* No Selection State */}
        {!startDate && !endDate && (
          <p className="text-sm text-gray-500 text-center py-4">
            Select a date range to see availability and pricing
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export default DatePicker
