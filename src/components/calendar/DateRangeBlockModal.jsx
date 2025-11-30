/**
 * DATE RANGE BLOCK MODAL
 * Surreal-style unavailability management
 *
 * Features:
 * - Block multiple days at once
 * - Add visibility message (why unavailable)
 * - Set timezone
 * - Recurring block options
 */

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { Calendar } from 'lucide-react'
import { format, addDays } from 'date-fns'
import ReactCalendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'

const TIMEZONES = [
  { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)' },
  { value: 'Australia/Melbourne', label: 'Melbourne (AEST/AEDT)' },
  { value: 'Australia/Brisbane', label: 'Brisbane (AEST)' },
  { value: 'Australia/Perth', label: 'Perth (AWST)' },
  { value: 'Australia/Adelaide', label: 'Adelaide (ACST/ACDT)' },
  { value: 'Pacific/Auckland', label: 'Auckland (NZST/NZDT)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'America/New_York', label: 'New York (EST/EDT)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (PST/PDT)' },
]

const RECURRENCE_OPTIONS = [
  { value: 'none', label: 'Does not repeat' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Every 2 weeks' },
  { value: 'monthly', label: 'Monthly' },
]

const DateRangeBlockModal = ({
  isOpen,
  onClose,
  onConfirm,
  initialDate = null,
  isLoading = false
}) => {
  const [dateRange, setDateRange] = useState(
    initialDate ? [initialDate, initialDate] : [new Date(), new Date()]
  )
  const [visibilityMessage, setVisibilityMessage] = useState('')
  const [internalNotes, setInternalNotes] = useState('')
  const [timezone, setTimezone] = useState('Australia/Sydney')
  const [recurrence, setRecurrence] = useState('none')
  const [error, setError] = useState(null)

  const handleDateChange = (value) => {
    if (Array.isArray(value)) {
      setDateRange(value)
    } else {
      setDateRange([value, value])
    }
    setError(null)
  }

  const handleConfirm = () => {
    if (!dateRange || !dateRange[0]) {
      setError('Please select at least one date')
      return
    }

    const startDate = dateRange[0]
    const endDate = dateRange[1] || dateRange[0]

    if (startDate > endDate) {
      setError('End date must be after start date')
      return
    }

    onConfirm({
      startDate,
      endDate: addDays(endDate, 1), // Make end date exclusive
      visibilityMessage: visibilityMessage.trim() || null,
      notes: internalNotes.trim() || null,
      timezone,
      isRecurring: recurrence !== 'none',
      recurrencePattern: recurrence !== 'none' ? recurrence : null
    })
  }

  const getDurationText = () => {
    if (!dateRange || !dateRange[0]) return ''
    const start = dateRange[0]
    const end = dateRange[1] || dateRange[0]
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1
    return `${days} ${days === 1 ? 'day' : 'days'}`
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Block Dates
          </DialogTitle>
          <DialogDescription>
            Mark dates as unavailable. Add an optional message for clients/venues.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Date Range Selection */}
          <div>
            <Label className="text-sm font-medium mb-2 block">
              Select Dates
            </Label>
            <p className="text-xs text-muted-foreground mb-3">
              Click a date to select one day, or click and drag to select a range.
            </p>
            <div className="border rounded-lg p-2">
              <ReactCalendar
                selectRange
                value={dateRange}
                onChange={handleDateChange}
                minDate={new Date()}
                className="w-full border-0"
              />
            </div>
            {dateRange && dateRange[0] && (
              <p className="text-sm text-muted-foreground mt-2">
                <strong>Selected:</strong>{' '}
                {format(dateRange[0], 'MMM d, yyyy')}
                {dateRange[1] && dateRange[1] !== dateRange[0] && (
                  <> - {format(dateRange[1], 'MMM d, yyyy')}</>
                )}
                {' '}({getDurationText()})
              </p>
            )}
          </div>

          {/* Visibility Message */}
          <div>
            <Label htmlFor="visibilityMessage" className="text-sm font-medium">
              Visibility Message (Optional)
            </Label>
            <p className="text-xs text-muted-foreground mb-2">
              This message will be shown to clients/venues who try to book these dates.
            </p>
            <Textarea
              id="visibilityMessage"
              value={visibilityMessage}
              onChange={(e) => setVisibilityMessage(e.target.value)}
              placeholder="e.g., On tour, Personal time, Already booked externally..."
              rows={2}
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {visibilityMessage.length}/200 characters
            </p>
          </div>

          {/* Internal Notes */}
          <div>
            <Label htmlFor="internalNotes" className="text-sm font-medium">
              Internal Notes (Private)
            </Label>
            <p className="text-xs text-muted-foreground mb-2">
              Only you can see these notes.
            </p>
            <Textarea
              id="internalNotes"
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              placeholder="e.g., Vacation in Bali, Sister's wedding..."
              rows={2}
              maxLength={500}
            />
          </div>

          {/* Timezone */}
          <div>
            <Label className="text-sm font-medium">Timezone</Label>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Recurrence */}
          <div>
            <Label className="text-sm font-medium">Repeat</Label>
            <Select value={recurrence} onValueChange={setRecurrence}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RECURRENCE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {recurrence !== 'none' && (
              <p className="text-xs text-amber-600 mt-2">
                Recurring blocks will be created for the next 3 months.
              </p>
            )}
          </div>

          {/* Error */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? 'Blocking...' : 'Block Dates'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default DateRangeBlockModal
