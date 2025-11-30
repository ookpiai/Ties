/**
 * REQUEST TO REPRESENT BUTTON
 * For verified agents to send representation requests to freelancers
 *
 * Features:
 * - Only visible to verified agents viewing freelancer profiles
 * - Opens modal with commission rate and message
 * - Shows agent's offer/benefits
 */

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import {
  UserPlus,
  Loader2,
  CheckCircle,
  Percent,
  Shield,
  Briefcase,
  TrendingUp,
  Calendar,
  DollarSign,
  Users
} from 'lucide-react'
import { useAuth } from '../../App'
import { sendRepresentationRequest, getAgentTalentRoster } from '../../api/agents'

const RequestToRepresentButton = ({
  freelancerId,
  freelancerName,
  acceptsAgentRequests = true,
  variant = 'outline',
  size = 'default',
  className = ''
}) => {
  const { user } = useAuth()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingStatus, setIsCheckingStatus] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [alreadyLinked, setAlreadyLinked] = useState(false)

  // Form state
  const [commissionRate, setCommissionRate] = useState(15)
  const [message, setMessage] = useState('')
  const [offerings, setOfferings] = useState({
    bookingManagement: true,
    rateNegotiation: true,
    calendarManagement: true,
    invoicing: true,
    marketing: false,
    contractReview: false
  })

  // Check if agent is verified and not already linked
  const isVerifiedAgent = user?.is_agent_verified === true

  useEffect(() => {
    if (isVerifiedAgent && freelancerId) {
      checkExistingLink()
    } else {
      setIsCheckingStatus(false)
    }
  }, [freelancerId, isVerifiedAgent])

  const checkExistingLink = async () => {
    setIsCheckingStatus(true)
    try {
      const roster = await getAgentTalentRoster()
      const existingLink = roster.find(
        link => link.freelancer_id === freelancerId &&
        (link.status === 'pending' || link.status === 'approved')
      )
      setAlreadyLinked(!!existingLink)
    } catch (err) {
      console.error('Error checking link status:', err)
    } finally {
      setIsCheckingStatus(false)
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Build message with offerings
      const offeringsList = Object.entries(offerings)
        .filter(([_, enabled]) => enabled)
        .map(([key]) => {
          const labels = {
            bookingManagement: 'Booking Management',
            rateNegotiation: 'Rate Negotiation',
            calendarManagement: 'Calendar Management',
            invoicing: 'Invoicing & Payments',
            marketing: 'Marketing & Promotion',
            contractReview: 'Contract Review'
          }
          return labels[key]
        })
        .join(', ')

      const fullMessage = message
        ? `${message}\n\nServices offered: ${offeringsList}`
        : `Services offered: ${offeringsList}`

      await sendRepresentationRequest(freelancerId, commissionRate, fullMessage)
      setSuccess(true)
    } catch (err) {
      console.error('Failed to send request:', err)
      setError(err.message || 'Failed to send representation request')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setIsModalOpen(false)
      if (success) {
        setAlreadyLinked(true)
      }
      setSuccess(false)
      setError(null)
      setMessage('')
      setCommissionRate(15)
    }
  }

  // Don't show button if not a verified agent
  if (!isVerifiedAgent) {
    return null
  }

  // Don't show if freelancer doesn't accept agent requests
  if (!acceptsAgentRequests) {
    return null
  }

  // Show loading state while checking
  if (isCheckingStatus) {
    return (
      <Button variant={variant} size={size} disabled className={className}>
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        Checking...
      </Button>
    )
  }

  // Show different state if already linked
  if (alreadyLinked) {
    return (
      <Button variant="outline" size={size} disabled className={className}>
        <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
        Request Sent
      </Button>
    )
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setIsModalOpen(true)}
        className={className}
      >
        <UserPlus className="w-4 h-4 mr-2" />
        Request to Represent
      </Button>

      <Dialog open={isModalOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Request to Represent {freelancerName}
            </DialogTitle>
            <DialogDescription>
              Send a representation request with your commission rate and services offered.
            </DialogDescription>
          </DialogHeader>

          {success ? (
            <div className="py-8 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Request Sent!</h3>
              <p className="text-muted-foreground mb-4">
                {freelancerName} will be notified of your representation request.
                They can review your offer and accept or decline.
              </p>
              <Button onClick={handleClose}>Done</Button>
            </div>
          ) : (
            <div className="space-y-6 py-4">
              {/* Commission Rate */}
              <div>
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Percent className="w-4 h-4" />
                  Commission Rate
                </Label>
                <p className="text-xs text-muted-foreground mb-3">
                  Your commission on bookings you manage for this freelancer
                </p>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[commissionRate]}
                    onValueChange={([value]) => setCommissionRate(value)}
                    min={5}
                    max={30}
                    step={1}
                    className="flex-1"
                  />
                  <div className="w-20 text-center">
                    <span className="text-2xl font-bold text-primary">{commissionRate}%</span>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>5%</span>
                  <span>Industry standard: 10-20%</span>
                  <span>30%</span>
                </div>
              </div>

              {/* Services Offered */}
              <div>
                <Label className="text-sm font-medium flex items-center gap-2 mb-3">
                  <Briefcase className="w-4 h-4" />
                  Services You'll Provide
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="bookingManagement"
                      checked={offerings.bookingManagement}
                      onCheckedChange={(checked) =>
                        setOfferings(o => ({ ...o, bookingManagement: checked }))
                      }
                    />
                    <label htmlFor="bookingManagement" className="text-sm flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      Booking Management
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="rateNegotiation"
                      checked={offerings.rateNegotiation}
                      onCheckedChange={(checked) =>
                        setOfferings(o => ({ ...o, rateNegotiation: checked }))
                      }
                    />
                    <label htmlFor="rateNegotiation" className="text-sm flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-muted-foreground" />
                      Rate Negotiation
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="calendarManagement"
                      checked={offerings.calendarManagement}
                      onCheckedChange={(checked) =>
                        setOfferings(o => ({ ...o, calendarManagement: checked }))
                      }
                    />
                    <label htmlFor="calendarManagement" className="text-sm flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      Calendar Management
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="invoicing"
                      checked={offerings.invoicing}
                      onCheckedChange={(checked) =>
                        setOfferings(o => ({ ...o, invoicing: checked }))
                      }
                    />
                    <label htmlFor="invoicing" className="text-sm flex items-center gap-1">
                      <DollarSign className="w-3 h-3 text-muted-foreground" />
                      Invoicing & Payments
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="marketing"
                      checked={offerings.marketing}
                      onCheckedChange={(checked) =>
                        setOfferings(o => ({ ...o, marketing: checked }))
                      }
                    />
                    <label htmlFor="marketing" className="text-sm flex items-center gap-1">
                      <Users className="w-3 h-3 text-muted-foreground" />
                      Marketing & Promotion
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="contractReview"
                      checked={offerings.contractReview}
                      onCheckedChange={(checked) =>
                        setOfferings(o => ({ ...o, contractReview: checked }))
                      }
                    />
                    <label htmlFor="contractReview" className="text-sm flex items-center gap-1">
                      <Shield className="w-3 h-3 text-muted-foreground" />
                      Contract Review
                    </label>
                  </div>
                </div>
              </div>

              {/* Personal Message */}
              <div>
                <Label htmlFor="message" className="text-sm font-medium">
                  Personal Message (Optional)
                </Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Introduce yourself and explain why you'd be a great fit to represent them..."
                  rows={4}
                  maxLength={500}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {message.length}/500 characters
                </p>
              </div>

              {/* What They'll See */}
              <Alert className="bg-blue-50 border-blue-200">
                <AlertDescription className="text-blue-800 text-sm">
                  <strong>What {freelancerName} will see:</strong>
                  <ul className="mt-2 space-y-1 text-xs">
                    <li>• Your agent profile and verification status</li>
                    <li>• Your proposed {commissionRate}% commission rate</li>
                    <li>• The services you'll provide</li>
                    <li>• Your personal message</li>
                  </ul>
                </AlertDescription>
              </Alert>

              {/* Error */}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={handleClose} disabled={isLoading}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Send Request
                    </>
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

export default RequestToRepresentButton
