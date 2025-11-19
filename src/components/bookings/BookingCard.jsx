/**
 * BOOKING CARD
 * Day 27 - Phase 4A
 *
 * Displays a booking with status badge and action buttons
 * Shows different actions based on booking status and user role
 */

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Calendar,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  Ban,
  Eye,
  Loader2
} from 'lucide-react'
import { format, formatDistance } from 'date-fns'
import BookingDetailsModal from './BookingDetailsModal'
import { acceptBooking, declineBooking, cancelBooking, completeBooking } from '../../api/bookings'
import { useToast } from '@/hooks/use-toast'

const BookingCard = ({ booking, currentUserId, onUpdate }) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()

  // Determine if current user is client or freelancer
  const isClient = booking.client_id === currentUserId
  const isFreelancer = booking.freelancer_id === currentUserId

  // Get the other party's profile
  const otherProfile = isClient ? booking.freelancer_profile : booking.client_profile
  const otherPersonName = otherProfile?.full_name || 'Unknown User'

  // Status badge configuration
  const getStatusConfig = (status) => {
    const configs = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      accepted: { color: 'bg-green-100 text-green-800', label: 'Accepted' },
      declined: { color: 'bg-red-100 text-red-800', label: 'Declined' },
      in_progress: { color: 'bg-blue-100 text-blue-800', label: 'In Progress' },
      completed: { color: 'bg-gray-100 text-gray-800', label: 'Completed' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' },
      paid: { color: 'bg-green-100 text-green-800', label: 'Paid' }
    }
    return configs[status] || configs.pending
  }

  const statusConfig = getStatusConfig(booking.status)

  // Handle accept booking
  const handleAccept = async () => {
    setIsProcessing(true)
    try {
      await acceptBooking(booking.id, currentUserId, 'Accepted your booking request')
      toast({
        title: 'Booking Accepted',
        description: 'Calendar dates have been blocked automatically.',
      })
      if (onUpdate) onUpdate()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to Accept',
        description: error.message,
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle decline booking
  const handleDecline = async () => {
    const reason = prompt('Please provide a reason for declining (optional):')
    if (reason === null) return // User cancelled

    setIsProcessing(true)
    try {
      await declineBooking(booking.id, currentUserId, reason || 'Declined by freelancer')
      toast({
        title: 'Booking Declined',
        description: 'The client has been notified.',
      })
      if (onUpdate) onUpdate()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to Decline',
        description: error.message,
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle cancel booking
  const handleCancel = async () => {
    const reason = prompt('Please provide a reason for cancellation:')
    if (!reason || reason.trim() === '') {
      alert('Cancellation reason is required')
      return
    }

    const confirm = window.confirm('Are you sure you want to cancel this booking?')
    if (!confirm) return

    setIsProcessing(true)
    try {
      await cancelBooking(booking.id, currentUserId, reason)
      toast({
        title: 'Booking Cancelled',
        description: 'Calendar dates have been released.',
      })
      if (onUpdate) onUpdate()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to Cancel',
        description: error.message,
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle complete booking
  const handleComplete = async () => {
    const confirm = window.confirm('Mark this booking as complete?')
    if (!confirm) return

    setIsProcessing(true)
    try {
      await completeBooking(booking.id, currentUserId)
      toast({
        title: 'Booking Completed',
        description: 'Both parties have been notified.',
      })
      if (onUpdate) onUpdate()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to Complete',
        description: error.message,
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Determine available actions based on status and role
  const getActions = () => {
    const actions = []

    // Pending - Freelancer can accept/decline
    if (booking.status === 'pending' && isFreelancer) {
      actions.push(
        <Button
          key="accept"
          size="sm"
          onClick={handleAccept}
          disabled={isProcessing}
          className="bg-green-600 hover:bg-green-700"
        >
          {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-1" />}
          Accept
        </Button>,
        <Button
          key="decline"
          size="sm"
          variant="outline"
          onClick={handleDecline}
          disabled={isProcessing}
        >
          <XCircle className="h-4 w-4 mr-1" />
          Decline
        </Button>
      )
    }

    // Pending - Client can cancel
    if (booking.status === 'pending' && isClient) {
      actions.push(
        <Button
          key="cancel"
          size="sm"
          variant="outline"
          onClick={handleCancel}
          disabled={isProcessing}
        >
          <Ban className="h-4 w-4 mr-1" />
          Cancel
        </Button>
      )
    }

    // Accepted or In Progress - Either can cancel or complete
    if (['accepted', 'in_progress'].includes(booking.status)) {
      const endDate = new Date(booking.end_date)
      const now = new Date()
      const canComplete = endDate <= now

      if (canComplete) {
        actions.push(
          <Button
            key="complete"
            size="sm"
            onClick={handleComplete}
            disabled={isProcessing}
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Mark Complete
          </Button>
        )
      }

      actions.push(
        <Button
          key="cancel"
          size="sm"
          variant="outline"
          onClick={handleCancel}
          disabled={isProcessing}
        >
          <Ban className="h-4 w-4 mr-1" />
          Cancel
        </Button>
      )
    }

    // Always show View Details
    actions.push(
      <Button
        key="details"
        size="sm"
        variant="ghost"
        onClick={() => setIsDetailsOpen(true)}
      >
        <Eye className="h-4 w-4 mr-1" />
        Details
      </Button>
    )

    return actions
  }

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={otherProfile?.avatar_url} alt={otherPersonName} />
                <AvatarFallback>
                  {otherPersonName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-lg">
                  {isClient ? 'Booked ' : 'Request from '}
                  {otherPersonName}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {otherProfile?.role || 'User'}
                </p>
              </div>
            </div>
            <Badge className={statusConfig.color}>
              {statusConfig.label}
            </Badge>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span>
                {format(new Date(booking.start_date), 'PPP')}
                {' → '}
                {format(new Date(booking.end_date), 'PPP')}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-gray-500" />
              <span>
                {formatDistance(new Date(booking.start_date), new Date(booking.end_date))}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-gray-500" />
              <span className="font-semibold text-lg">
                ${booking.total_amount.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-600 line-clamp-2">
              {booking.service_description}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {getActions()}
          </div>
        </CardContent>
      </Card>

      {isDetailsOpen && (
        <BookingDetailsModal
          bookingId={booking.id}
          currentUserId={currentUserId}
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          onUpdate={onUpdate}
        />
      )}
    </>
  )
}

export default BookingCard
