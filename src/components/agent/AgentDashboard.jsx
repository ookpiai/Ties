/**
 * AGENT DASHBOARD
 * Agent Mode per agent.md spec
 *
 * Features:
 * - Verification Status & Form
 * - My Talent (roster of represented freelancers)
 * - Inquiries (routed booking requests)
 * - Bookings (list view of all managed bookings)
 * - Settings (notification preferences, routing defaults)
 */

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import StatusBadge from '@/components/ui/StatusBadge'
import EmptyState from '@/components/ui/EmptyState'
import AgentVerificationForm from './AgentVerificationForm'
import {
  Loader2,
  Users,
  Inbox,
  Calendar,
  DollarSign,
  UserPlus,
  CheckCircle,
  XCircle,
  ExternalLink,
  MapPin,
  Clock,
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Settings,
  AlertCircle
} from 'lucide-react'
import { format } from 'date-fns'
import { useAuth } from '../../App'
import {
  getAgentTalentRoster,
  getAgentBookingRequests,
  acceptBookingOnBehalf,
  getAgentVerificationStatus
} from '../../api/agents'
import { useToast } from '@/hooks/use-toast'
import { Link } from 'react-router-dom'

const AgentDashboard = () => {
  const { user } = useAuth()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('talent')
  const [talentRoster, setTalentRoster] = useState([])
  const [bookingRequests, setBookingRequests] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [processingBookingId, setProcessingBookingId] = useState(null)
  const [verificationStatus, setVerificationStatus] = useState(null)
  const [showVerificationForm, setShowVerificationForm] = useState(false)

  useEffect(() => {
    if (user?.id) {
      loadAgentData()
    }
  }, [user?.id])

  const loadAgentData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [roster, requests, verification] = await Promise.all([
        getAgentTalentRoster(),
        getAgentBookingRequests(),
        getAgentVerificationStatus()
      ])
      setTalentRoster(roster)
      setBookingRequests(requests)
      setVerificationStatus(verification)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerificationSuccess = () => {
    setShowVerificationForm(false)
    loadAgentData()
    toast({
      title: 'Verification Submitted',
      description: 'Your agent verification is now pending review. We\'ll notify you once it\'s reviewed.',
    })
  }

  // Handle accept booking on behalf
  const handleAcceptOnBehalf = async (bookingId) => {
    setProcessingBookingId(bookingId)
    try {
      await acceptBookingOnBehalf(bookingId, 'Accepted on behalf by agent')
      toast({
        title: 'Booking Accepted',
        description: 'The booking has been accepted on behalf of the freelancer.',
      })
      // Reload data
      loadAgentData()
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Failed to Accept',
        description: err.message,
      })
    } finally {
      setProcessingBookingId(null)
    }
  }

  // Stats
  const approvedTalent = talentRoster.filter(t => t.status === 'approved').length
  const pendingTalent = talentRoster.filter(t => t.status === 'pending').length
  const pendingRequests = bookingRequests.length

  // Verification status helper
  const getVerificationBadge = () => {
    if (!verificationStatus) return null

    switch (verificationStatus.status) {
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-300">
            <ShieldCheck className="h-3 w-3 mr-1" />
            Verified Agent
          </Badge>
        )
      case 'pending_review':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
            <ShieldAlert className="h-3 w-3 mr-1" />
            Pending Review
          </Badge>
        )
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-300">
            <ShieldX className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground">
            <Shield className="h-3 w-3 mr-1" />
            Not Verified
          </Badge>
        )
    }
  }

  // Show verification form if requested
  if (showVerificationForm) {
    return (
      <div className="container mx-auto py-8 px-4">
        <AgentVerificationForm
          onSuccess={handleVerificationSuccess}
          onCancel={() => setShowVerificationForm(false)}
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">Agent Dashboard</h1>
              {getVerificationBadge()}
            </div>
            <p className="text-muted-foreground">
              Manage your talent roster and booking requests
            </p>
          </div>
          {!verificationStatus?.isVerified && verificationStatus?.status !== 'pending_review' && (
            <Button onClick={() => setShowVerificationForm(true)}>
              <Shield className="h-4 w-4 mr-2" />
              {verificationStatus?.status === 'rejected' ? 'Resubmit Verification' : 'Get Verified'}
            </Button>
          )}
        </div>
      </div>

      {/* Verification Status Banner */}
      {verificationStatus?.status === 'not_submitted' && (
        <Alert className="mb-6 border-indigo-200 bg-indigo-50">
          <Shield className="h-4 w-4 text-indigo-600" />
          <AlertTitle className="text-indigo-800">Complete Agent Verification</AlertTitle>
          <AlertDescription className="text-indigo-700">
            To represent freelancers and access all agent features, you need to verify your agent status.
            This involves providing your website and evidence of talent representation.
          </AlertDescription>
        </Alert>
      )}

      {verificationStatus?.status === 'pending_review' && (
        <Alert className="mb-6 border-yellow-200 bg-yellow-50">
          <ShieldAlert className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-800">Verification Pending</AlertTitle>
          <AlertDescription className="text-yellow-700">
            Your agent verification is being reviewed. This usually takes 1-2 business days.
            You'll be notified once your verification is complete.
          </AlertDescription>
        </Alert>
      )}

      {verificationStatus?.status === 'rejected' && verificationStatus?.rejectionReason && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">Verification Rejected</AlertTitle>
          <AlertDescription className="text-red-700">
            {verificationStatus.rejectionReason}
            <br />
            <span className="text-sm">You can resubmit with updated information.</span>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-surface border border-app rounded-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{approvedTalent}</div>
                <p className="text-xs text-muted-foreground">Active Talent</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface border border-app rounded-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                <Inbox className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{pendingRequests}</div>
                <p className="text-xs text-muted-foreground">Pending Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface border border-app rounded-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{pendingTalent}</div>
                <p className="text-xs text-muted-foreground">Pending Links</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="bg-surface border border-app rounded-xl">
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="talent">
                My Talent
                {approvedTalent > 0 && (
                  <Badge variant="secondary" className="ml-2">{approvedTalent}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="inquiries">
                Inquiries
                {pendingRequests > 0 && (
                  <Badge variant="destructive" className="ml-2">{pendingRequests}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="bookings">
                Bookings
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="h-4 w-4 mr-1" />
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Loading State */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Loading agent data...</p>
              </div>
            )}

            {/* Error State */}
            {error && !isLoading && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="text-red-600 mb-4">Error loading data</div>
                <p className="text-sm text-muted-foreground mb-4">{error}</p>
                <Button onClick={loadAgentData}>Try Again</Button>
              </div>
            )}

            {/* Content */}
            {!isLoading && !error && (
              <>
                {/* My Talent Tab */}
                <TabsContent value="talent" className="mt-0">
                  {talentRoster.length === 0 ? (
                    <EmptyState
                      icon={Users}
                      title="No talent yet"
                      description="Send representation requests to freelancers you'd like to represent. Once approved, they'll appear here."
                      action={{
                        label: "Discover Talent",
                        href: "/discover"
                      }}
                    />
                  ) : (
                    <div className="space-y-4">
                      {talentRoster.map((link) => (
                        <TalentCard key={link.id} link={link} />
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Inquiries Tab */}
                <TabsContent value="inquiries" className="mt-0">
                  {bookingRequests.length === 0 ? (
                    <EmptyState
                      icon={Inbox}
                      title="No pending inquiries"
                      description="When booking requests are routed to you for your represented talent, they'll appear here."
                    />
                  ) : (
                    <div className="space-y-4">
                      {bookingRequests.map((booking) => (
                        <BookingRequestCard
                          key={booking.id}
                          booking={booking}
                          onAccept={handleAcceptOnBehalf}
                          isProcessing={processingBookingId === booking.id}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Bookings Tab */}
                <TabsContent value="bookings" className="mt-0">
                  <EmptyState
                    icon={Calendar}
                    title="Agent bookings"
                    description="Bookings you've managed on behalf of your talent will appear here."
                  />
                </TabsContent>

                {/* Settings Tab */}
                <TabsContent value="settings" className="mt-0">
                  <div className="space-y-6">
                    {/* Verification Status */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="h-5 w-5" />
                          Verification Status
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              {verificationStatus?.isVerified
                                ? 'Your agent status is verified.'
                                : 'Complete verification to unlock all agent features.'}
                            </p>
                            {verificationStatus?.submittedAt && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Submitted: {format(new Date(verificationStatus.submittedAt), 'PPP')}
                              </p>
                            )}
                          </div>
                          {getVerificationBadge()}
                        </div>
                        {!verificationStatus?.isVerified && verificationStatus?.status !== 'pending_review' && (
                          <Button
                            className="mt-4"
                            onClick={() => setShowVerificationForm(true)}
                          >
                            {verificationStatus?.status === 'rejected' ? 'Resubmit Verification' : 'Complete Verification'}
                          </Button>
                        )}
                      </CardContent>
                    </Card>

                    {/* Notification Preferences */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Notification Preferences</CardTitle>
                        <CardDescription>
                          Manage how you receive notifications for booking requests
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                          <div>
                            <p className="font-medium text-sm">New Booking Requests</p>
                            <p className="text-xs text-muted-foreground">Get notified when talent receives inquiries</p>
                          </div>
                          <Badge variant="outline">Coming Soon</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                          <div>
                            <p className="font-medium text-sm">Talent Link Updates</p>
                            <p className="text-xs text-muted-foreground">Notifications for representation approvals</p>
                          </div>
                          <Badge variant="outline">Coming Soon</Badge>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Default Routing */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Default Routing Behavior</CardTitle>
                        <CardDescription>
                          How new freelancer connections will route booking requests
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                            <p className="text-sm text-muted-foreground">
                              Freelancers can choose how to route their booking requests:
                            </p>
                            <ul className="mt-2 space-y-1 text-sm">
                              <li>• <strong>Route to Me</strong> - Only freelancer receives requests</li>
                              <li>• <strong>Route to Agent</strong> - Only agent receives requests</li>
                              <li>• <strong>Route to Both</strong> - Both receive requests</li>
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

// Talent Card Component
const TalentCard = ({ link }) => {
  const freelancer = link.freelancer_profile
  const isApproved = link.status === 'approved'

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={freelancer?.avatar_url} alt={freelancer?.display_name} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {freelancer?.display_name?.split(' ').map(n => n[0]).join('') || 'U'}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold truncate">
                {freelancer?.display_name || 'Unknown'}
              </h3>
              <Badge variant={isApproved ? 'default' : 'secondary'} className="text-xs">
                {link.status}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
              <span className="capitalize">{freelancer?.role || 'Freelancer'}</span>
              {freelancer?.city && (
                <>
                  <span>•</span>
                  <MapPin className="h-3 w-3" />
                  <span>{freelancer.city}</span>
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {link.commission_percentage}% commission
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link to={`/profile/${freelancer?.id}`}>
              <Button size="sm" variant="outline">
                <ExternalLink className="h-4 w-4 mr-1" />
                View Profile
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Booking Request Card Component
const BookingRequestCard = ({ booking, onAccept, isProcessing }) => {
  const freelancer = booking.freelancer_profile
  const client = booking.client_profile

  return (
    <Card className="hover:shadow-md transition-shadow border-l-4 border-l-orange-500">
      <CardContent className="p-4">
        <div className="flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-muted-foreground">For:</span>
                <span className="font-semibold">{freelancer?.display_name || 'Unknown'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>From:</span>
                <Avatar className="h-5 w-5">
                  <AvatarImage src={client?.avatar_url} />
                  <AvatarFallback className="text-xs">
                    {client?.display_name?.[0] || 'C'}
                  </AvatarFallback>
                </Avatar>
                <span>{client?.display_name || 'Unknown Client'}</span>
              </div>
            </div>
            <StatusBadge status="pending" type="booking" size="sm" />
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-500" />
              <div>
                <p className="text-xs text-muted-foreground">Date</p>
                <p className="text-sm font-medium">
                  {format(new Date(booking.start_date || booking.start_time), 'MMM d, yyyy')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-slate-500" />
              <div>
                <p className="text-xs text-muted-foreground">Amount</p>
                <p className="text-sm font-bold text-primary">
                  ${booking.total_amount?.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          {booking.service_description && (
            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
              {booking.service_description}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={() => onAccept(booking.id)}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-1" />
              )}
              Accept on Behalf
            </Button>
            <Button size="sm" variant="outline" className="flex-1">
              <XCircle className="h-4 w-4 mr-1" />
              Decline
            </Button>
          </div>

          {/* Timestamp */}
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Requested {format(new Date(booking.created_at), 'MMM d, h:mm a')}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default AgentDashboard
