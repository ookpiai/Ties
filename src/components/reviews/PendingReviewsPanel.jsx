/**
 * PENDING REVIEWS PANEL
 * Shows completed bookings that can be reviewed
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Star,
  Calendar,
  DollarSign,
  ChevronRight,
  Loader2,
  CheckCircle2
} from 'lucide-react'
import { format } from 'date-fns'
import { getPendingReviewBookings } from '../../api/reviews'
import WriteReviewModal from './WriteReviewModal'

const PendingReviewsPanel = ({ onReviewSubmitted }) => {
  const [pendingBookings, setPendingBookings] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Modal state
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [showReviewModal, setShowReviewModal] = useState(false)

  useEffect(() => {
    loadPendingBookings()
  }, [])

  const loadPendingBookings = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getPendingReviewBookings()
      setPendingBookings(data)
    } catch (err) {
      console.error('Error loading pending bookings:', err)
      setError('Failed to load bookings')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenReviewModal = (booking) => {
    setSelectedBooking(booking)
    setShowReviewModal(true)
  }

  const handleReviewSubmitted = () => {
    loadPendingBookings()
    if (onReviewSubmitted) {
      onReviewSubmitted()
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-4">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (pendingBookings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Star className="w-5 h-5" />
            Pending Reviews
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <p className="text-slate-600 dark:text-slate-400">All caught up!</p>
          <p className="text-sm text-slate-500">
            No completed bookings waiting for review
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Star className="w-5 h-5" />
            Pending Reviews
            <Badge variant="secondary">{pendingBookings.length}</Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Share your experience from these completed bookings
          </p>

          {pendingBookings.map((booking) => (
            <div
              key={booking.id}
              className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Avatar className="h-12 w-12">
                <AvatarImage src={booking.reviewee_profile?.avatar_url} />
                <AvatarFallback>
                  {booking.reviewee_profile?.display_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate">
                  {booking.reviewee_profile?.display_name || 'User'}
                </h4>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(booking.end_date), 'MMM d, yyyy')}
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    ${booking.total_amount}
                  </span>
                </div>
                {booking.service_description && (
                  <p className="text-xs text-slate-400 truncate mt-0.5">
                    {booking.service_description}
                  </p>
                )}
              </div>

              <Button
                size="sm"
                onClick={() => handleOpenReviewModal(booking)}
                className="flex-shrink-0"
              >
                <Star className="w-4 h-4 mr-1" />
                Review
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          ))}

          <p className="text-xs text-slate-400 text-center pt-2">
            Reviews help build trust in our community
          </p>
        </CardContent>
      </Card>

      {/* Review Modal */}
      {selectedBooking && (
        <WriteReviewModal
          isOpen={showReviewModal}
          onClose={() => {
            setShowReviewModal(false)
            setSelectedBooking(null)
          }}
          revieweeId={selectedBooking.reviewee_id}
          revieweeProfile={selectedBooking.reviewee_profile}
          bookingId={selectedBooking.id}
          bookingDetails={selectedBooking}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}
    </>
  )
}

export default PendingReviewsPanel
