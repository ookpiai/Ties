/**
 * AVAILABILITY REQUESTS PANEL
 * Surreal-style availability response interface
 *
 * Features:
 * - View pending availability requests
 * - Respond with thumbs up/down
 * - Bulk respond to multiple requests
 * - Add optional response message
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import {
  CalendarCheck,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  Clock,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Calendar,
  User
} from 'lucide-react'
import { format, formatDistanceToNow, parseISO } from 'date-fns'
import {
  getPendingRequests,
  respondToRequest,
  bulkRespondToRequests
} from '../../api/availabilityRequests'
import { useAuth } from '../../App'

const AvailabilityRequestsPanel = ({ onRequestsChange }) => {
  const { user } = useAuth()
  const [requests, setRequests] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRequests, setSelectedRequests] = useState([])
  const [isResponding, setIsResponding] = useState(false)
  const [error, setError] = useState(null)

  // Bulk response modal
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [bulkResponseType, setBulkResponseType] = useState(null)
  const [responseMessage, setResponseMessage] = useState('')

  useEffect(() => {
    if (user) {
      loadRequests()
    }
  }, [user])

  const loadRequests = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getPendingRequests()
      setRequests(data)
      if (onRequestsChange) {
        onRequestsChange(data.length)
      }
    } catch (err) {
      console.error('Failed to load requests:', err)
      setError('Failed to load availability requests')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectRequest = (requestId) => {
    setSelectedRequests(prev =>
      prev.includes(requestId)
        ? prev.filter(id => id !== requestId)
        : [...prev, requestId]
    )
  }

  const handleSelectAll = () => {
    if (selectedRequests.length === requests.length) {
      setSelectedRequests([])
    } else {
      setSelectedRequests(requests.map(r => r.id))
    }
  }

  const handleSingleResponse = async (requestId, status) => {
    setIsResponding(true)
    setError(null)
    try {
      await respondToRequest({
        request_id: requestId,
        status
      })
      await loadRequests()
    } catch (err) {
      console.error('Failed to respond:', err)
      setError('Failed to respond to request')
    } finally {
      setIsResponding(false)
    }
  }

  const handleBulkResponse = async () => {
    if (!bulkResponseType || selectedRequests.length === 0) return

    setIsResponding(true)
    setError(null)
    try {
      await bulkRespondToRequests(
        selectedRequests,
        bulkResponseType,
        responseMessage.trim() || undefined
      )
      setSelectedRequests([])
      setShowBulkModal(false)
      setResponseMessage('')
      setBulkResponseType(null)
      await loadRequests()
    } catch (err) {
      console.error('Failed to bulk respond:', err)
      setError('Failed to respond to some requests')
    } finally {
      setIsResponding(false)
    }
  }

  const openBulkModal = (type) => {
    setBulkResponseType(type)
    setShowBulkModal(true)
    setResponseMessage('')
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

  if (requests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CalendarCheck className="w-5 h-5" />
            Availability Requests
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <CalendarCheck className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No pending availability requests</p>
          <p className="text-sm text-muted-foreground mt-1">
            When clients want to check your availability, their requests will appear here.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CalendarCheck className="w-5 h-5" />
              Availability Requests
              <Badge variant="secondary">{requests.length}</Badge>
            </CardTitle>

            {/* Bulk Actions */}
            {selectedRequests.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {selectedRequests.length} selected
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-green-600 border-green-200 hover:bg-green-50"
                  onClick={() => openBulkModal('available')}
                  disabled={isResponding}
                >
                  <ThumbsUp className="w-4 h-4 mr-1" />
                  Available
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => openBulkModal('unavailable')}
                  disabled={isResponding}
                >
                  <ThumbsDown className="w-4 h-4 mr-1" />
                  Unavailable
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Select All */}
          <div className="flex items-center gap-2 pb-2 border-b">
            <Checkbox
              checked={selectedRequests.length === requests.length}
              onCheckedChange={handleSelectAll}
            />
            <span className="text-sm text-muted-foreground">
              Select all
            </span>
          </div>

          {/* Request List */}
          {requests.map((request) => (
            <div
              key={request.id}
              className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
            >
              {/* Checkbox */}
              <Checkbox
                checked={selectedRequests.includes(request.id)}
                onCheckedChange={() => handleSelectRequest(request.id)}
                className="mt-1"
              />

              {/* Avatar */}
              <Avatar className="w-10 h-10">
                <AvatarImage src={request.requester_profile?.avatar_url} />
                <AvatarFallback>
                  {request.requester_profile?.display_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-sm">
                      {request.requester_profile?.display_name || 'Unknown User'}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      <Calendar className="w-3 h-3" />
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {format(parseISO(request.requested_date), 'EEEE, MMM d, yyyy')}
                      </span>
                      {request.requested_start_time && (
                        <>
                          <Clock className="w-3 h-3 ml-1" />
                          <span>
                            {request.requested_start_time.slice(0, 5)}
                            {request.requested_end_time && ` - ${request.requested_end_time.slice(0, 5)}`}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Quick Response Buttons */}
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                      onClick={() => handleSingleResponse(request.id, 'available')}
                      disabled={isResponding}
                      title="I'm available"
                    >
                      <ThumbsUp className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleSingleResponse(request.id, 'unavailable')}
                      disabled={isResponding}
                      title="I'm not available"
                    >
                      <ThumbsDown className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Message */}
                {request.message && (
                  <div className="mt-2 p-2 bg-white dark:bg-slate-900 rounded text-sm text-slate-600 dark:text-slate-400">
                    <MessageSquare className="w-3 h-3 inline mr-1" />
                    {request.message}
                  </div>
                )}

                {/* Meta */}
                <p className="text-xs text-muted-foreground mt-2">
                  Sent {formatDistanceToNow(parseISO(request.created_at), { addSuffix: true })}
                  {request.expires_at && (
                    <> · Expires {format(parseISO(request.expires_at), 'MMM d')}</>
                  )}
                </p>
              </div>
            </div>
          ))}

          {/* Info */}
          <p className="text-xs text-muted-foreground text-center pt-2">
            Responding to availability requests doesn't create a booking.
            The client can send a booking offer after you confirm availability.
          </p>
        </CardContent>
      </Card>

      {/* Bulk Response Modal */}
      <Dialog open={showBulkModal} onOpenChange={setShowBulkModal}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {bulkResponseType === 'available' ? (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
              {bulkResponseType === 'available' ? 'Mark as Available' : 'Mark as Unavailable'}
            </DialogTitle>
            <DialogDescription>
              Respond to {selectedRequests.length} request{selectedRequests.length > 1 ? 's' : ''} at once.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Response Message (Optional)
              </label>
              <Textarea
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                placeholder={
                  bulkResponseType === 'available'
                    ? "e.g., Yes, I'm free! Feel free to send a booking offer."
                    : "e.g., Sorry, I'm already booked for those dates."
                }
                rows={3}
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {responseMessage.length}/200 characters
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowBulkModal(false)} disabled={isResponding}>
              Cancel
            </Button>
            <Button
              onClick={handleBulkResponse}
              disabled={isResponding}
              className={
                bulkResponseType === 'available'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              }
            >
              {isResponding ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Responding...
                </>
              ) : (
                <>
                  {bulkResponseType === 'available' ? (
                    <ThumbsUp className="w-4 h-4 mr-2" />
                  ) : (
                    <ThumbsDown className="w-4 h-4 mr-2" />
                  )}
                  Confirm
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default AvailabilityRequestsPanel
