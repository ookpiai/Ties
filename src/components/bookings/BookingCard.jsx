/**
 * BOOKING CARD
 * Day 27 - Phase 4A
 *
 * Displays a booking with status badge and action buttons
 * Shows different actions based on booking status and user role
 */

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import StatusBadge from '@/components/ui/StatusBadge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Calendar,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  Ban,
  Eye,
  Loader2,
  MapPin,
  User,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Briefcase,
  ExternalLink,
  Settings
} from 'lucide-react'
import { format, formatDistance } from 'date-fns'
import BookingDetailsModal from './BookingDetailsModal'
import { acceptBooking, declineBooking, cancelBooking, completeBooking } from '../../api/bookings'
import { useToast } from '@/hooks/use-toast'
import PaymentButton from '../payments/PaymentButton'
import { supabase } from '../../lib/supabase'

const BookingCard = ({ booking, currentUserId, onUpdate, autoOpenDetails = false, onDetailsClose }) => {
  const navigate = useNavigate()
  const [isDetailsOpen, setIsDetailsOpen] = useState(autoOpenDetails)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [jobInfo, setJobInfo] = useState(null)
  const [loadingJobInfo, setLoadingJobInfo] = useState(false)
  const { toast } = useToast()

  // Auto-open details modal when autoOpenDetails prop changes to true
  useEffect(() => {
    if (autoOpenDetails) {
      setIsDetailsOpen(true)
    }
  }, [autoOpenDetails])

  // Handle details modal close
  const handleDetailsClose = () => {
    setIsDetailsOpen(false)
    onDetailsClose?.()
  }

  // Load related job info if booking came from a job application
  useEffect(() => {
    async function fetchJobInfo() {
      if (!booking.id) return

      setLoadingJobInfo(true)
      try {
        // Check if this booking is linked to a job selection
        const { data: selection, error } = await supabase
          .from('job_selections')
          .select(`
            *,
            job:job_postings!job_id(
              id,
              title,
              description,
              location,
              event_type,
              start_date,
              end_date,
              status,
              organiser_id,
              organiser:profiles!organiser_id(id, display_name, avatar_url)
            ),
            role:job_roles!job_role_id(id, role_title, role_type, budget)
          `)
          .eq('booking_id', booking.id)
          .maybeSingle()

        if (!error && selection) {
          setJobInfo(selection)
        }
      } catch (err) {
        console.error('Error fetching job info:', err)
      } finally {
        setLoadingJobInfo(false)
      }
    }

    fetchJobInfo()
  }, [booking.id])

  // Determine if current user is client or freelancer
  const isClient = booking.client_id === currentUserId
  const isFreelancer = booking.freelancer_id === currentUserId

  // Get the other party's profile
  const otherProfile = isClient ? booking.freelancer_profile : booking.client_profile
  const otherPersonName = otherProfile?.display_name || otherProfile?.full_name || 'Unknown User'

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

    // Pending - Freelancer can accept/decline (prominent buttons)
    if (booking.status === 'pending' && isFreelancer) {
      actions.push(
        <Button
          key="accept"
          size="sm"
          onClick={handleAccept}
          disabled={isProcessing}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 shadow-sm"
        >
          {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-1.5" />}
          Accept Job
        </Button>,
        <Button
          key="decline"
          size="sm"
          variant="outline"
          onClick={handleDecline}
          disabled={isProcessing}
          className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
        >
          <XCircle className="h-4 w-4 mr-1.5" />
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
          className="border-orange-300 text-orange-600 hover:bg-orange-50 dark:border-orange-700 dark:text-orange-400"
        >
          <Ban className="h-4 w-4 mr-1" />
          Cancel Request
        </Button>
      )
    }

    // Accepted or In Progress - Either can cancel or complete
    if (['accepted', 'in_progress'].includes(booking.status)) {
      const endDate = new Date(booking.end_date)
      const now = new Date()
      const canComplete = endDate <= now

      // Show Pay Now button for client if booking is accepted but not yet paid
      // Check payout_status as fallback if payment_status doesn't exist
      const paymentComplete = booking.payment_status === 'captured' ||
                              booking.payment_status === 'succeeded' ||
                              booking.payout_status === 'completed'
      if (isClient && !paymentComplete) {
        actions.push(
          <PaymentButton
            key="pay"
            bookingId={booking.id}
            amount={booking.total_amount}
            clientEmail={booking.client_profile?.email || ''}
            freelancerName={booking.freelancer_profile?.display_name || booking.freelancer_profile?.full_name || 'Freelancer'}
            description={booking.service_description || 'Booking Payment'}
            size="sm"
            onSuccess={() => {
              toast({
                title: 'Redirecting to Payment',
                description: 'You will be redirected to complete your payment.',
              })
            }}
            onError={(error) => {
              toast({
                variant: 'destructive',
                title: 'Payment Error',
                description: error,
              })
            }}
          />
        )
      }

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
          className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
        >
          <Ban className="h-4 w-4 mr-1" />
          Cancel Booking
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

  // Check if this booking needs immediate action from the current user
  const needsAction = booking.status === 'pending' && isFreelancer

  return (
    <>
      <Card className={`hover:shadow-lg transition-all rounded-xl bg-surface border ${needsAction ? 'border-orange-400 ring-2 ring-orange-100 dark:ring-orange-900/30' : 'border-app hover:border-primary/30'}`}>
        {/* Action Required Banner for pending bookings */}
        {needsAction && (
          <div className="px-4 py-2.5 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-b border-orange-200 dark:border-orange-800 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                <span className="text-sm font-semibold text-orange-700 dark:text-orange-300">
                  Action Required
                </span>
                <span className="text-xs text-orange-600 dark:text-orange-400">
                  — Review and respond to this booking request
                </span>
              </div>
            </div>
          </div>
        )}
        <CardContent className="p-4">
          {/* Header Row */}
          <div className="flex items-start gap-3 mb-3">
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarImage src={otherProfile?.avatar_url} alt={otherPersonName} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {otherPersonName.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base text-slate-900 dark:text-white truncate">
                    {otherPersonName}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    <User className="h-3 w-3" />
                    <span className="capitalize">{otherProfile?.role || 'User'}</span>
                    {otherProfile?.city && (
                      <>
                        <span>•</span>
                        <MapPin className="h-3 w-3" />
                        <span>{otherProfile.city}</span>
                      </>
                    )}
                  </div>
                </div>
                <StatusBadge status={booking.status} type="booking" size="sm" />
              </div>

              {/* Role Context Badge */}
              <div className="mt-2 flex flex-wrap gap-1">
                <Badge variant="outline" className="text-xs h-5 border-slate-300 dark:border-slate-600">
                  {isClient ? 'You hired them' : 'They hired you'}
                </Badge>
                {jobInfo && (
                  <Badge variant="outline" className="text-xs h-5 border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">
                    <Briefcase className="h-3 w-3 mr-1" />
                    Job Gig
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Info Grid - Compact */}
          <div className="grid grid-cols-2 gap-3 mb-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 mb-1">
                <Calendar className="h-3.5 w-3.5" />
                <span className="font-medium">Dates</span>
              </div>
              <p className="text-xs font-semibold text-slate-900 dark:text-white">
                {format(new Date(booking.start_date), 'MMM d')}
                {' - '}
                {format(new Date(booking.end_date), 'MMM d, yyyy')}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">
                {formatDistance(new Date(booking.start_date), new Date(booking.end_date))}
              </p>
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 mb-1">
                <DollarSign className="h-3.5 w-3.5" />
                <span className="font-medium">Amount</span>
              </div>
              <p className="text-base font-bold text-slate-900 dark:text-white">
                ${booking.total_amount.toFixed(2)}
              </p>
              {(booking.payment_status || booking.payout_status) && (
                <StatusBadge status={booking.payment_status || booking.payout_status} type="payment" size="sm" className="mt-1" />
              )}
            </div>
          </div>

          {/* Description */}
          {booking.service_description && (
            <div className="mb-3">
              <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2">
                {booking.service_description}
              </p>
            </div>
          )}

          {/* Related Job Info - Expandable Section */}
          {(jobInfo || loadingJobInfo) && (
            <div className="mb-3">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    {loadingJobInfo ? 'Loading job info...' : `From Job: ${jobInfo?.job?.title}`}
                  </span>
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                )}
              </button>

              {/* Expanded Job Details */}
              {isExpanded && jobInfo && (
                <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="space-y-3">
                    {/* Job Title and Role */}
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                        {jobInfo.job?.title}
                      </h4>
                      {jobInfo.role && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          {jobInfo.role.role_title} ({jobInfo.role.role_type})
                        </Badge>
                      )}
                    </div>

                    {/* Job Description */}
                    {jobInfo.job?.description && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3">
                        {jobInfo.job.description}
                      </p>
                    )}

                    {/* Job Details Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {jobInfo.job?.location && (
                        <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                          <MapPin className="h-3 w-3" />
                          <span>{jobInfo.job.location}</span>
                        </div>
                      )}
                      {jobInfo.job?.event_type && (
                        <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                          <Calendar className="h-3 w-3" />
                          <span>{jobInfo.job.event_type}</span>
                        </div>
                      )}
                      {jobInfo.role?.budget && (
                        <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                          <DollarSign className="h-3 w-3" />
                          <span>Role Budget: ${jobInfo.role.budget}</span>
                        </div>
                      )}
                    </div>

                    {/* Organiser Info */}
                    {jobInfo.job?.organiser && (
                      <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={jobInfo.job.organiser.avatar_url} />
                          <AvatarFallback className="text-xs">
                            {jobInfo.job.organiser.display_name?.charAt(0) || 'O'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-slate-600 dark:text-slate-400">
                          Posted by {jobInfo.job.organiser.display_name}
                        </span>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      {/* Check if current user is the job organiser */}
                      {jobInfo.job?.organiser_id === currentUserId ? (
                        // User owns this job - Go to Studio
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/studio?job=${jobInfo.job.id}`)}
                          className="text-xs"
                        >
                          <Settings className="h-3 w-3 mr-1" />
                          Manage in Studio
                        </Button>
                      ) : (
                        // User doesn't own this job - View organiser profile
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/profile/${jobInfo.job?.organiser_id}`)}
                          className="text-xs"
                        >
                          <User className="h-3 w-3 mr-1" />
                          View Organiser
                        </Button>
                      )}

                      {/* View Full Job Details */}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate(`/jobs/${jobInfo.job?.id}`)}
                        className="text-xs"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View Job
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions Row */}
          <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
            {getActions()}
          </div>
        </CardContent>
      </Card>

      {isDetailsOpen && (
        <BookingDetailsModal
          bookingId={booking.id}
          currentUserId={currentUserId}
          isOpen={isDetailsOpen}
          onClose={handleDetailsClose}
          onUpdate={onUpdate}
        />
      )}
    </>
  )
}

export default BookingCard
