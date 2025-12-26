import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Textarea } from '../ui/textarea'
import {
  Briefcase,
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  CheckCircle,
  XCircle,
  MessageSquare,
  ArrowRight,
  AlertCircle,
  Undo2
} from 'lucide-react'
import {
  acceptJobOffer,
  rejectJobOffer,
  withdrawJobOffer,
  convertOfferToBooking
} from '../../api/jobOffers'

const JobOfferCard = ({ offer, currentUserId, onUpdate }) => {
  const navigate = useNavigate()
  const [isResponding, setIsResponding] = useState(false)
  const [responseType, setResponseType] = useState(null) // 'accept' | 'reject'
  const [responseMessage, setResponseMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const isRecipient = offer.recipient_id === currentUserId
  const isSender = offer.sender_id === currentUserId

  const formatDate = (dateString) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString('en-AU', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatTime = (timeString) => {
    if (!timeString) return null
    const [hours, minutes] = timeString.split(':')
    const date = new Date()
    date.setHours(parseInt(hours), parseInt(minutes))
    return date.toLocaleTimeString('en-AU', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const formatCurrency = (amount) => {
    if (!amount) return null
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getStatusConfig = (status) => {
    switch (status) {
      case 'pending':
        return {
          label: 'Pending',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-700',
          icon: Clock
        }
      case 'viewed':
        return {
          label: 'Viewed',
          color: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-700',
          icon: Clock
        }
      case 'accepted':
        return {
          label: 'Accepted',
          color: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-700',
          icon: CheckCircle
        }
      case 'rejected':
        return {
          label: 'Declined',
          color: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-700',
          icon: XCircle
        }
      case 'withdrawn':
        return {
          label: 'Withdrawn',
          color: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700/50 dark:text-gray-300 dark:border-gray-600',
          icon: Undo2
        }
      case 'countered':
        return {
          label: 'Countered',
          color: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-700',
          icon: MessageSquare
        }
      case 'expired':
        return {
          label: 'Expired',
          color: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700/50 dark:text-gray-300 dark:border-gray-600',
          icon: AlertCircle
        }
      default:
        return {
          label: status,
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: Clock
        }
    }
  }

  const handleAccept = async () => {
    setLoading(true)
    const result = await acceptJobOffer(offer.id, responseMessage || undefined)
    if (result.success && onUpdate) {
      onUpdate(result.data)
    }
    setLoading(false)
    setIsResponding(false)
    setResponseMessage('')
  }

  const handleReject = async () => {
    setLoading(true)
    const result = await rejectJobOffer(offer.id, responseMessage || undefined)
    if (result.success && onUpdate) {
      onUpdate(result.data)
    }
    setLoading(false)
    setIsResponding(false)
    setResponseMessage('')
  }

  const handleWithdraw = async () => {
    if (!confirm('Are you sure you want to withdraw this offer?')) return
    setLoading(true)
    const result = await withdrawJobOffer(offer.id)
    if (result.success && onUpdate) {
      onUpdate({ ...offer, status: 'withdrawn' })
    }
    setLoading(false)
  }

  const handleCreateBooking = async () => {
    setLoading(true)
    const result = await convertOfferToBooking(offer.id)
    if (result.success && result.bookingId) {
      navigate(`/bookings/${result.bookingId}`)
    }
    setLoading(false)
  }

  const statusConfig = getStatusConfig(offer.status)
  const StatusIcon = statusConfig.icon
  const canRespond = isRecipient && ['pending', 'viewed'].includes(offer.status)
  const canWithdraw = isSender && offer.status === 'pending'
  const canCreateBooking = offer.status === 'accepted' && !offer.converted_to_booking_id

  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 flex items-center justify-between border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Job Offer
          </span>
        </div>
        <Badge variant="outline" className={statusConfig.color}>
          <StatusIcon className="w-3 h-3 mr-1" />
          {statusConfig.label}
        </Badge>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <h4 className="text-lg font-semibold text-slate-900 dark:text-white">
          {offer.title}
        </h4>

        {/* Meta info */}
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-600 dark:text-slate-400">
          {offer.location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{offer.location}</span>
            </div>
          )}
          {offer.event_date && (
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(offer.event_date)}</span>
            </div>
          )}
          {(offer.start_time || offer.end_time) && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>
                {formatTime(offer.start_time)}
                {offer.end_time && ` - ${formatTime(offer.end_time)}`}
              </span>
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
          {offer.description}
        </p>

        {/* Budget and Role */}
        <div className="flex flex-wrap gap-3 pt-2">
          {offer.budget_amount && (
            <div className="flex items-center gap-1 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="font-semibold text-green-700 dark:text-green-400">
                {formatCurrency(offer.budget_amount)}
              </span>
              <span className="text-xs text-green-600 dark:text-green-500">
                ({offer.budget_type})
              </span>
            </div>
          )}
          {offer.role_title && (
            <div className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <Briefcase className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm text-blue-700 dark:text-blue-400">
                {offer.role_title}
              </span>
            </div>
          )}
        </div>

        {/* Expiration warning */}
        {offer.expires_at && ['pending', 'viewed'].includes(offer.status) && (
          <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-lg border border-amber-200 dark:border-amber-800">
            <AlertCircle className="w-4 h-4" />
            <span>Respond by {formatDate(offer.expires_at)}</span>
          </div>
        )}

        {/* Response message (if rejected/accepted with message) */}
        {offer.response_message && (
          <div className="bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Response:</p>
            <p className="text-sm text-slate-700 dark:text-slate-300">{offer.response_message}</p>
          </div>
        )}

        {/* Response form */}
        {isResponding && (
          <div className="space-y-3 pt-2">
            <Textarea
              placeholder={`Add a message (optional)...`}
              value={responseMessage}
              onChange={(e) => setResponseMessage(e.target.value)}
              rows={2}
              className="text-sm"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsResponding(false)
                  setResponseType(null)
                  setResponseMessage('')
                }}
                disabled={loading}
              >
                Cancel
              </Button>
              {responseType === 'accept' && (
                <Button
                  size="sm"
                  onClick={handleAccept}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {loading ? 'Accepting...' : 'Confirm Accept'}
                </Button>
              )}
              {responseType === 'reject' && (
                <Button
                  size="sm"
                  onClick={handleReject}
                  disabled={loading}
                  variant="destructive"
                >
                  {loading ? 'Declining...' : 'Confirm Decline'}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      {(canRespond || canWithdraw || canCreateBooking) && !isResponding && (
        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex flex-wrap gap-2 justify-end">
          {canRespond && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setResponseType('reject')
                  setIsResponding(true)
                }}
                disabled={loading}
              >
                <XCircle className="w-4 h-4 mr-1" />
                Decline
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setResponseType('accept')
                  setIsResponding(true)
                }}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Accept Offer
              </Button>
            </>
          )}
          {canWithdraw && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleWithdraw}
              disabled={loading}
            >
              <Undo2 className="w-4 h-4 mr-1" />
              Withdraw
            </Button>
          )}
          {canCreateBooking && (
            <Button
              size="sm"
              onClick={handleCreateBooking}
              disabled={loading}
            >
              <ArrowRight className="w-4 h-4 mr-1" />
              Create Booking
            </Button>
          )}
        </div>
      )}

      {/* Already converted to booking */}
      {offer.converted_to_booking_id && (
        <div className="px-4 py-3 bg-green-50 dark:bg-green-900/20 border-t border-green-200 dark:border-green-800 flex items-center justify-between">
          <span className="text-sm text-green-700 dark:text-green-400">
            Booking created from this offer
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`/bookings/${offer.converted_to_booking_id}`)}
          >
            View Booking
          </Button>
        </div>
      )}
    </div>
  )
}

export default JobOfferCard
