/**
 * PENDING AGENT REQUESTS PANEL
 * For freelancers to view and respond to agent representation requests
 *
 * Features:
 * - Shows all pending agent requests with their offerings
 * - Accept or decline with one click
 * - See agent's commission rate and services offered
 * - View agent's profile before deciding
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import {
  UserPlus,
  Check,
  X,
  Loader2,
  ShieldCheck,
  Percent,
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
  Shield,
  MessageCircle,
  Eye,
  Clock,
  Inbox
} from 'lucide-react'
import { useAuth } from '../../App'
import { getPendingRepresentationRequests, respondToRepresentationRequest } from '../../api/agents'

const PendingAgentRequestsPanel = ({ onRequestsChange }) => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [requests, setRequests] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [isResponding, setIsResponding] = useState(false)
  const [responseType, setResponseType] = useState(null) // 'accept' or 'reject'

  useEffect(() => {
    loadRequests()
  }, [])

  const loadRequests = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getPendingRepresentationRequests()
      setRequests(data)
      onRequestsChange?.(data.length)
    } catch (err) {
      console.error('Failed to load requests:', err)
      setError(err.message || 'Failed to load agent requests')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRespond = async (accepted) => {
    if (!selectedRequest) return

    setIsResponding(true)
    try {
      await respondToRepresentationRequest(selectedRequest.id, accepted)
      // Remove from list
      setRequests(prev => prev.filter(r => r.id !== selectedRequest.id))
      onRequestsChange?.(requests.length - 1)
      setSelectedRequest(null)
      setResponseType(null)
    } catch (err) {
      console.error('Failed to respond:', err)
      setError(err.message || 'Failed to respond to request')
    } finally {
      setIsResponding(false)
    }
  }

  const openResponseDialog = (request, type) => {
    setSelectedRequest(request)
    setResponseType(type)
  }

  const parseOfferings = (message) => {
    const offeringsMatch = message?.match(/Services offered: (.+)/i)
    if (offeringsMatch) {
      return offeringsMatch[1].split(', ')
    }
    return []
  }

  const getOfferingIcon = (offering) => {
    const icons = {
      'Booking Management': Calendar,
      'Rate Negotiation': TrendingUp,
      'Calendar Management': Calendar,
      'Invoicing & Payments': DollarSign,
      'Marketing & Promotion': Users,
      'Contract Review': Shield
    }
    return icons[offering] || Shield
  }

  if (isLoading) {
    return (
      <Card className="bg-surface border border-app rounded-2xl">
        <CardContent className="py-12 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading agent requests...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (requests.length === 0) {
    return (
      <Card className="bg-surface border border-app rounded-2xl">
        <CardContent className="py-12 text-center">
          <Inbox className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No Agent Requests</h3>
          <p className="text-muted-foreground">
            You don't have any pending agent representation requests.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="bg-surface border border-app rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Agent Representation Requests
            <Badge variant="secondary">{requests.length}</Badge>
          </CardTitle>
          <CardDescription>
            Review and respond to agents who want to represent you
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {requests.map((request) => {
            const agent = request.agent_profile
            const offerings = parseOfferings(request.message)
            const personalMessage = request.message?.replace(/Services offered:.+/i, '').trim()

            return (
              <div
                key={request.id}
                className="p-4 border border-app rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:border-primary/50 transition-colors"
              >
                {/* Agent Header */}
                <div className="flex items-start gap-4 mb-4">
                  <Avatar
                    className="h-14 w-14 cursor-pointer"
                    onClick={() => navigate(`/profile/${agent?.id}`)}
                  >
                    <AvatarImage src={agent?.avatar_url} />
                    <AvatarFallback className="bg-indigo-100 text-indigo-700">
                      {agent?.display_name?.split(' ').map(n => n[0]).join('') || 'A'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3
                        className="font-semibold cursor-pointer hover:text-primary"
                        onClick={() => navigate(`/profile/${agent?.id}`)}
                      >
                        {agent?.display_name || 'Agent'}
                      </h3>
                      <Badge className="bg-indigo-100 text-indigo-800 border-indigo-300">
                        <ShieldCheck className="w-3 h-3 mr-1" />
                        Verified Agent
                      </Badge>
                    </div>
                    {agent?.headline && (
                      <p className="text-sm text-muted-foreground">{agent.headline}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      Requested {new Date(request.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Commission Rate */}
                  <div className="text-center px-4 py-2 bg-primary/10 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {request.commission_percentage}%
                    </div>
                    <div className="text-xs text-muted-foreground">Commission</div>
                  </div>
                </div>

                {/* Personal Message */}
                {personalMessage && (
                  <div className="mb-4 p-3 bg-white dark:bg-slate-800 rounded-lg border border-app">
                    <p className="text-sm italic">"{personalMessage}"</p>
                  </div>
                )}

                {/* Services Offered */}
                {offerings.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Services Offered:</p>
                    <div className="flex flex-wrap gap-2">
                      {offerings.map((offering, idx) => {
                        const Icon = getOfferingIcon(offering)
                        return (
                          <Badge key={idx} variant="outline" className="text-xs">
                            <Icon className="w-3 h-3 mr-1" />
                            {offering}
                          </Badge>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* What This Means */}
                <Alert className="mb-4 bg-blue-50 border-blue-200">
                  <AlertDescription className="text-blue-800 text-xs">
                    If you accept, this agent will:
                    <ul className="mt-1 space-y-0.5 list-disc list-inside">
                      <li>Receive {request.commission_percentage}% of bookings they manage for you</li>
                      <li>Be able to accept bookings on your behalf (if permitted)</li>
                      <li>Help negotiate rates and manage your calendar</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-app">
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/profile/${agent?.id}`)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Profile
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate('/messages', { state: { openConversationWithUserId: agent?.id } })}
                    >
                      <MessageCircle className="w-4 h-4 mr-1" />
                      Message
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => openResponseDialog(request, 'reject')}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Decline
                    </Button>
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => openResponseDialog(request, 'accept')}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Accept
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={!!selectedRequest && !!responseType} onOpenChange={() => {
        if (!isResponding) {
          setSelectedRequest(null)
          setResponseType(null)
        }
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {responseType === 'accept' ? 'Accept Agent Representation?' : 'Decline Agent Request?'}
            </DialogTitle>
            <DialogDescription>
              {responseType === 'accept' ? (
                <>
                  By accepting, {selectedRequest?.agent_profile?.display_name} will become your agent
                  with a {selectedRequest?.commission_percentage}% commission rate on bookings they manage.
                </>
              ) : (
                <>
                  Are you sure you want to decline this representation request from{' '}
                  {selectedRequest?.agent_profile?.display_name}? They will be notified.
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {responseType === 'accept' && (
            <div className="py-4">
              <Alert className="bg-green-50 border-green-200">
                <AlertDescription className="text-green-800 text-sm">
                  <strong>Benefits of having an agent:</strong>
                  <ul className="mt-2 space-y-1 list-disc list-inside">
                    <li>Professional booking management</li>
                    <li>Rate negotiation on your behalf</li>
                    <li>More bookings through their network</li>
                    <li>Administrative tasks handled for you</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedRequest(null)
                setResponseType(null)
              }}
              disabled={isResponding}
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleRespond(responseType === 'accept')}
              disabled={isResponding}
              className={responseType === 'accept' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {isResponding ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : responseType === 'accept' ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Accept Agent
                </>
              ) : (
                <>
                  <X className="w-4 h-4 mr-2" />
                  Decline Request
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default PendingAgentRequestsPanel
