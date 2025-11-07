/**
 * BOOKING REQUEST MODAL
 * Day 27 - Phase 4A
 *
 * Modal for creating a booking request
 * Includes date picker, service description, and pricing calculation
 * Phase 4A: No payment processing (just request)
 * Phase 4B: Will add Stripe payment form
 */

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Calendar, DollarSign, Clock, AlertCircle, CheckCircle } from 'lucide-react'
import DatePicker from '../calendar/DatePicker'
import { createBooking } from '../../api/bookings'
import { differenceInHours, differenceInDays, format } from 'date-fns'

const BookingRequestModal = ({
  freelancerId,
  freelancerName,
  hourlyRate,
  dailyRate,
  isOpen,
  onClose
}) => {
  const [step, setStep] = useState(1) // 1: Dates, 2: Details, 3: Confirm
  const [dateRange, setDateRange] = useState(null)
  const [serviceDescription, setServiceDescription] = useState('')
  const [clientMessage, setClientMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  // Calculate total based on dates and rate
  const calculateTotal = () => {
    if (!dateRange || dateRange.length !== 2) return 0

    const [startDate, endDate] = dateRange
    if (!startDate || !endDate) return 0

    if (hourlyRate) {
      const hours = differenceInHours(endDate, startDate)
      return hours * hourlyRate
    } else if (dailyRate) {
      const days = Math.ceil(differenceInDays(endDate, startDate)) || 1
      return days * dailyRate
    }

    return 0
  }

  const totalAmount = calculateTotal()

  // Calculate duration display
  const getDurationDisplay = () => {
    if (!dateRange || dateRange.length !== 2) return ''

    const [startDate, endDate] = dateRange
    if (!startDate || !endDate) return ''

    if (hourlyRate) {
      const hours = differenceInHours(endDate, startDate)
      return `${hours} ${hours === 1 ? 'hour' : 'hours'}`
    } else if (dailyRate) {
      const days = Math.ceil(differenceInDays(endDate, startDate)) || 1
      return `${days} ${days === 1 ? 'day' : 'days'}`
    }

    return ''
  }

  const handleDateSelect = (dates) => {
    setDateRange(dates)
    setError(null)
  }

  const handleNextStep = () => {
    // Validation for step 1
    if (step === 1) {
      if (!dateRange || dateRange.length !== 2) {
        setError('Please select both start and end dates')
        return
      }
      const [startDate, endDate] = dateRange
      if (!startDate || !endDate) {
        setError('Please select valid dates')
        return
      }
      if (startDate >= endDate) {
        setError('End date must be after start date')
        return
      }
    }

    // Validation for step 2
    if (step === 2) {
      if (!serviceDescription.trim()) {
        setError('Please describe the service you need')
        return
      }
      if (serviceDescription.trim().length < 10) {
        setError('Service description must be at least 10 characters')
        return
      }
    }

    setError(null)
    setStep(step + 1)
  }

  const handlePreviousStep = () => {
    setError(null)
    setStep(step - 1)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      const [startDate, endDate] = dateRange

      await createBooking({
        freelancer_id: freelancerId,
        start_date: startDate,
        end_date: endDate,
        total_amount: totalAmount,
        service_description: serviceDescription,
        client_message: clientMessage || undefined
      })

      setSuccess(true)

      // Close modal after 2 seconds
      setTimeout(() => {
        onClose()
        // Optionally: Redirect to bookings page
        // window.location.href = '/profile?tab=bookings'
      }, 2000)
    } catch (err) {
      console.error('Booking creation failed:', err)
      setError(err.message || 'Failed to create booking. Please try again.')
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
    }
  }

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep(1)
      setDateRange(null)
      setServiceDescription('')
      setClientMessage('')
      setError(null)
      setSuccess(false)
      setIsSubmitting(false)
    }
  }, [isOpen])

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Book {freelancerName}
          </DialogTitle>
          <DialogDescription>
            {step === 1 && 'Select your dates'}
            {step === 2 && 'Provide booking details'}
            {step === 3 && 'Review and confirm'}
          </DialogDescription>
        </DialogHeader>

        {/* Success Message */}
        {success && (
          <Alert className="border-green-500 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Booking request sent successfully! {freelancerName} will be notified.
            </AlertDescription>
          </Alert>
        )}

        {/* Error Message */}
        {error && !success && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!success && (
          <div className="space-y-6">
            {/* Progress Indicator */}
            <div className="flex items-center justify-center space-x-2">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-2 w-16 rounded-full ${
                    s === step
                      ? 'bg-primary'
                      : s < step
                        ? 'bg-primary/50'
                        : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>

            {/* Step 1: Date Selection */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-semibold">
                    Select Dates
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Choose your booking dates. Unavailable dates are disabled.
                  </p>
                </div>

                <DatePicker
                  userId={freelancerId}
                  onDateSelect={handleDateSelect}
                  hourlyRate={hourlyRate}
                  minDate={new Date()}
                />

                {dateRange && dateRange.length === 2 && dateRange[0] && dateRange[1] && (
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">{getDurationDisplay()}</span>
                    </div>
                    {totalAmount > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Estimated Total:</span>
                        <span className="font-semibold text-lg">
                          ${totalAmount.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Booking Details */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="serviceDescription" className="text-base font-semibold">
                    Service Description *
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1 mb-2">
                    Describe what you need in detail
                  </p>
                  <Textarea
                    id="serviceDescription"
                    value={serviceDescription}
                    onChange={(e) => setServiceDescription(e.target.value)}
                    placeholder="Example: Event photography for corporate product launch, including 4 hours of coverage, professional editing of 50 photos..."
                    rows={5}
                    maxLength={500}
                    className="resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {serviceDescription.length}/500 characters
                  </p>
                </div>

                <div>
                  <Label htmlFor="clientMessage" className="text-base font-semibold">
                    Message to {freelancerName} (Optional)
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1 mb-2">
                    Add any additional details or questions
                  </p>
                  <Textarea
                    id="clientMessage"
                    value={clientMessage}
                    onChange={(e) => setClientMessage(e.target.value)}
                    placeholder="Hi! I'm looking forward to working with you..."
                    rows={3}
                    maxLength={300}
                    className="resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {clientMessage.length}/300 characters
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Review & Confirm */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <h3 className="font-semibold text-base">Booking Summary</h3>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Calendar className="h-4 w-4 text-gray-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Dates</p>
                        <p className="text-gray-600">
                          {dateRange && dateRange[0] && format(dateRange[0], 'PPP p')}
                          <br />
                          to {dateRange && dateRange[1] && format(dateRange[1], 'PPP p')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Clock className="h-4 w-4 text-gray-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Duration</p>
                        <p className="text-gray-600">{getDurationDisplay()}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <DollarSign className="h-4 w-4 text-gray-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Total Amount</p>
                        <p className="text-xl font-bold text-primary">
                          ${totalAmount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t">
                    <p className="font-medium text-sm mb-1">Service</p>
                    <p className="text-sm text-gray-600">
                      {serviceDescription}
                    </p>
                  </div>

                  {clientMessage && (
                    <div className="pt-3 border-t">
                      <p className="font-medium text-sm mb-1">Your Message</p>
                      <p className="text-sm text-gray-600">
                        {clientMessage}
                      </p>
                    </div>
                  )}
                </div>

                <Alert className="border-blue-200 bg-blue-50">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <strong>Phase 4A:</strong> No payment required yet. This sends a booking request
                    to {freelancerName}. They will review and accept or decline your request.
                    <br />
                    <span className="text-xs mt-1 block">
                      Payment processing will be enabled in Phase 4B.
                    </span>
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={step === 1 ? handleClose : handlePreviousStep}
                disabled={isSubmitting}
              >
                {step === 1 ? 'Cancel' : 'Back'}
              </Button>

              {step < 3 ? (
                <Button
                  type="button"
                  onClick={handleNextStep}
                >
                  Continue
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending Request...
                    </>
                  ) : (
                    'Send Booking Request'
                  )}
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default BookingRequestModal
