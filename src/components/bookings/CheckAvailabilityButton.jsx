/**
 * CHECK AVAILABILITY BUTTON
 * Surreal-style availability inquiry before booking
 *
 * Flow:
 * 1. User clicks "Check Availability"
 * 2. Modal opens to select date and add message
 * 3. Request sent to freelancer
 * 4. Freelancer responds with available/unavailable
 * 5. If available, user can proceed to Book Now
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CalendarSearch, Loader2, CheckCircle, XCircle, Clock } from 'lucide-react'
import { format } from 'date-fns'
import ReactCalendar from 'react-calendar'
import { createAvailabilityRequest, hasExistingRequest } from '../../api/availabilityRequests'
import 'react-calendar/dist/Calendar.css'

const CheckAvailabilityButton = ({
  freelancerId,
  freelancerName,
  disabled = false,
  variant = 'outline',
  size = 'default',
  className = ''
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [existingRequest, setExistingRequest] = useState(false)

  const handleOpenModal = () => {
    setIsModalOpen(true)
    setSelectedDate(null)
    setStartTime('')
    setEndTime('')
    setMessage('')
    setError(null)
    setSuccess(false)
    setExistingRequest(false)
  }

  const handleDateSelect = async (date) => {
    setSelectedDate(date)
    setError(null)
    setExistingRequest(false)

    // Check if request already exists for this date
    setIsChecking(true)
    try {
      const exists = await hasExistingRequest(freelancerId, date)
      setExistingRequest(exists)
    } catch (err) {
      console.error('Error checking existing request:', err)
    } finally {
      setIsChecking(false)
    }
  }

  const handleSubmit = async () => {
    if (!selectedDate) {
      setError('Please select a date')
      return
    }

    if (existingRequest) {
      setError('You already have a pending request for this date')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await createAvailabilityRequest({
        freelancer_id: freelancerId,
        requested_date: selectedDate,
        requested_start_time: startTime || undefined,
        requested_end_time: endTime || undefined,
        message: message.trim() || undefined
      })

      setSuccess(true)
    } catch (err) {
      console.error('Failed to send availability request:', err)
      setError(err.message || 'Failed to send request. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setIsModalOpen(false)
    }
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleOpenModal}
        disabled={disabled}
        className={className}
      >
        <CalendarSearch className="w-4 h-4 mr-2" />
        Check Availability
      </Button>

      <Dialog open={isModalOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarSearch className="w-5 h-5" />
              Check Availability
            </DialogTitle>
            <DialogDescription>
              Send an availability request to {freelancerName}. This is not a booking - just checking if they're free.
            </DialogDescription>
          </DialogHeader>

          {success ? (
            <div className="py-8 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Request Sent!</h3>
              <p className="text-muted-foreground mb-4">
                {freelancerName} will be notified and can respond with their availability.
              </p>
              <p className="text-sm text-muted-foreground">
                You'll receive a notification when they respond.
              </p>
              <Button onClick={handleClose} className="mt-6">
                Done
              </Button>
            </div>
          ) : (
            <div className="space-y-6 py-4">
              {/* Date Selection */}
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Select Date
                </Label>
                <div className="border rounded-lg p-2">
                  <ReactCalendar
                    value={selectedDate}
                    onChange={handleDateSelect}
                    minDate={new Date()}
                    className="w-full border-0"
                  />
                </div>
                {selectedDate && (
                  <div className="mt-2 flex items-center gap-2">
                    {isChecking ? (
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Checking...
                      </span>
                    ) : existingRequest ? (
                      <span className="text-sm text-amber-600 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        You already have a pending request for this date
                      </span>
                    ) : (
                      <span className="text-sm text-green-600 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Time Range (Optional) */}
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Time Range (Optional)
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    placeholder="Start"
                  />
                  <span className="text-muted-foreground">to</span>
                  <Input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    placeholder="End"
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <Label htmlFor="message" className="text-sm font-medium">
                  Message (Optional)
                </Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="e.g., Looking for a DJ for a corporate event..."
                  rows={3}
                  maxLength={300}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {message.length}/300 characters
                </p>
              </div>

              {/* Info Alert */}
              <Alert className="bg-blue-50 border-blue-200">
                <AlertDescription className="text-blue-800 text-sm">
                  <strong>Note:</strong> This is just an availability inquiry. {freelancerName} will respond
                  with whether they're free. You won't see pricing until you send an actual booking offer.
                </AlertDescription>
              </Alert>

              {/* Error */}
              {error && (
                <Alert variant="destructive">
                  <XCircle className="w-4 h-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !selectedDate || existingRequest}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Request'
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

export default CheckAvailabilityButton
