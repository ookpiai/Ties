/**
 * BOOKING DETAILS MODAL
 * Day 27 - Phase 4A
 *
 * Full detailed view of a booking
 * Shows timeline, messages, and all booking information
 */

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Loader2, Calendar, Clock, DollarSign, MessageSquare, FileText } from 'lucide-react'
import { format } from 'date-fns'
import { getBookingById } from '../../api/bookings'

const BookingDetailsModal = ({ bookingId, currentUserId, isOpen, onClose, onUpdate }) => {
  const [booking, setBooking] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isOpen && bookingId) {
      loadBooking()
    }
  }, [isOpen, bookingId])

  const loadBooking = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getBookingById(bookingId, currentUserId)
      setBooking(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  const isClient = booking?.client_id === currentUserId
  const otherProfile = isClient ? booking?.freelancer_profile : booking?.client_profile

  // Status badge configuration
  const getStatusConfig = (status) => {
    const configs = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      confirmed: { color: 'bg-green-100 text-green-800', label: 'Confirmed' },
      accepted: { color: 'bg-green-100 text-green-800', label: 'Accepted' },
      declined: { color: 'bg-red-100 text-red-800', label: 'Declined' },
      in_progress: { color: 'bg-blue-100 text-blue-800', label: 'In Progress' },
      completed: { color: 'bg-gray-100 text-gray-800', label: 'Completed' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' },
      paid: { color: 'bg-emerald-100 text-emerald-800', label: 'Paid' }
    }
    return configs[status] || configs.pending
  }

  // Get display name with fallback
  const getDisplayName = (profile) => profile?.display_name || profile?.full_name || 'Unknown User'

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Booking Details</DialogTitle>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {error && (
          <div className="text-center py-8 text-red-600">
            Error loading booking: {error}
          </div>
        )}

        {booking && !isLoading && (
          <div className="space-y-6">
            {/* Header with Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-14 w-14">
                  <AvatarImage src={otherProfile?.avatar_url} alt={getDisplayName(otherProfile)} />
                  <AvatarFallback>
                    {getDisplayName(otherProfile).split(' ').map(n => n[0]).join('') || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">
                    {getDisplayName(otherProfile)}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {otherProfile?.role || 'User'}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge className={getStatusConfig(booking.status).color}>
                  {getStatusConfig(booking.status).label}
                </Badge>
              </div>
            </div>

            <Separator />

            {/* Booking Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Start Date</p>
                    <p className="text-sm text-gray-600">
                      {format(new Date(booking.start_date), 'PPP p')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">End Date</p>
                    <p className="text-sm text-gray-600">
                      {format(new Date(booking.end_date), 'PPP p')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Created</p>
                    <p className="text-sm text-gray-600">
                      {format(new Date(booking.created_at), 'PPP')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <DollarSign className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Total Amount</p>
                    <p className="text-xl font-bold text-primary">
                      ${booking.total_amount.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Service Description */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5 text-gray-500" />
                <h4 className="font-semibold">Service Description</h4>
              </div>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                {booking.service_description}
              </p>
            </div>

            {/* Client Message */}
            {booking.client_message && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="h-5 w-5 text-gray-500" />
                  <h4 className="font-semibold">Client's Message</h4>
                </div>
                <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                  {booking.client_message}
                </p>
              </div>
            )}

            {/* Freelancer Response */}
            {booking.freelancer_response && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="h-5 w-5 text-gray-500" />
                  <h4 className="font-semibold">Freelancer's Response</h4>
                </div>
                <p className="text-sm text-gray-600 bg-green-50 p-3 rounded-lg border-l-4 border-green-400">
                  {booking.freelancer_response}
                </p>
              </div>
            )}

            {/* Cancellation Reason */}
            {booking.cancellation_reason && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="h-5 w-5 text-gray-500" />
                  <h4 className="font-semibold">Cancellation Reason</h4>
                </div>
                <p className="text-sm text-gray-600 bg-red-50 p-3 rounded-lg border-l-4 border-red-400">
                  {booking.cancellation_reason}
                </p>
              </div>
            )}

            {/* Timeline */}
            <div>
              <h4 className="font-semibold mb-3">Timeline</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <div className="h-3 w-3 rounded-full bg-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Booking Created</p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(booking.created_at), 'PPP p')}
                    </p>
                  </div>
                </div>

                {booking.accepted_at && (
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <div className="h-3 w-3 rounded-full bg-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Booking Accepted</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(booking.accepted_at), 'PPP p')}
                      </p>
                    </div>
                  </div>
                )}

                {booking.completed_at && (
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <div className="h-3 w-3 rounded-full bg-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Booking Completed</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(booking.completed_at), 'PPP p')}
                      </p>
                    </div>
                  </div>
                )}

                {booking.cancelled_at && (
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                      <div className="h-3 w-3 rounded-full bg-red-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Booking Cancelled</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(booking.cancelled_at), 'PPP p')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Booking ID (for reference) */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500">
                Booking ID: <span className="font-mono">{booking.id}</span>
              </p>
            </div>

            {/* Close Button */}
            <div className="flex justify-end">
              <Button onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default BookingDetailsModal
