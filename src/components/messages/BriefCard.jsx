import { useState } from 'react'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Textarea } from '../ui/textarea'
import {
  FileText,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  Undo2
} from 'lucide-react'
import { acceptBrief, declineBrief, withdrawBrief } from '../../api/briefs'

const BriefCard = ({ brief, currentUserId, onUpdate }) => {
  const [showResponse, setShowResponse] = useState(false)
  const [responseNote, setResponseNote] = useState('')
  const [loading, setLoading] = useState(false)

  const isRecipient = brief.recipient_id === currentUserId
  const isSender = brief.sender_id === currentUserId
  const isPending = brief.status === 'pending'

  const formatDate = (dateString) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
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

  const getStatusBadge = () => {
    switch (brief.status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
      case 'accepted':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Accepted</Badge>
      case 'declined':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><XCircle className="w-3 h-3 mr-1" />Declined</Badge>
      case 'withdrawn':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200"><Undo2 className="w-3 h-3 mr-1" />Withdrawn</Badge>
      default:
        return null
    }
  }

  const handleAccept = async () => {
    setLoading(true)
    const result = await acceptBrief(brief.id, responseNote)
    if (result.success && onUpdate) {
      onUpdate({ ...brief, status: 'accepted', response_note: responseNote })
    }
    setLoading(false)
    setShowResponse(false)
  }

  const handleDecline = async () => {
    setLoading(true)
    const result = await declineBrief(brief.id, responseNote)
    if (result.success && onUpdate) {
      onUpdate({ ...brief, status: 'declined', response_note: responseNote })
    }
    setLoading(false)
    setShowResponse(false)
  }

  const handleWithdraw = async () => {
    if (!confirm('Withdraw this brief?')) return
    setLoading(true)
    const result = await withdrawBrief(brief.id)
    if (result.success && onUpdate) {
      onUpdate({ ...brief, status: 'withdrawn' })
    }
    setLoading(false)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="bg-gray-50 dark:bg-gray-900 px-4 py-2 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <FileText className="w-4 h-4" />
          <span className="text-sm font-medium">Project Brief</span>
        </div>
        {getStatusBadge()}
      </div>

      {/* Content */}
      <div className="p-4">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {brief.title}
        </h4>

        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 whitespace-pre-wrap">
          {brief.description}
        </p>

        {/* Budget & Deadline */}
        <div className="flex flex-wrap gap-3 mb-3">
          {brief.budget && (
            <div className="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
              <DollarSign className="w-4 h-4" />
              {formatCurrency(brief.budget)}
            </div>
          )}
          {brief.deadline && (
            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-sm">
              <Calendar className="w-4 h-4" />
              Deadline: {formatDate(brief.deadline)}
            </div>
          )}
        </div>

        {/* Response note if any */}
        {brief.response_note && (
          <div className="bg-gray-50 dark:bg-gray-900 p-2 rounded text-sm text-gray-600 dark:text-gray-400 mb-3">
            Response: {brief.response_note}
          </div>
        )}

        {/* Response input */}
        {showResponse && (
          <div className="space-y-2 mb-3">
            <Textarea
              placeholder="Add a note (optional)..."
              value={responseNote}
              onChange={(e) => setResponseNote(e.target.value)}
              rows={2}
            />
          </div>
        )}

        {/* Actions */}
        {isPending && (
          <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
            {isRecipient && !showResponse && (
              <>
                <Button size="sm" variant="outline" onClick={() => setShowResponse(true)} disabled={loading}>
                  Respond
                </Button>
              </>
            )}
            {isRecipient && showResponse && (
              <>
                <Button size="sm" variant="outline" onClick={() => setShowResponse(false)} disabled={loading}>
                  Cancel
                </Button>
                <Button size="sm" variant="outline" onClick={handleDecline} disabled={loading}>
                  <XCircle className="w-4 h-4 mr-1" />
                  Decline
                </Button>
                <Button size="sm" onClick={handleAccept} disabled={loading} className="bg-green-600 hover:bg-green-700">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Accept
                </Button>
              </>
            )}
            {isSender && (
              <Button size="sm" variant="outline" onClick={handleWithdraw} disabled={loading}>
                <Undo2 className="w-4 h-4 mr-1" />
                Withdraw
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Footer - who sent it */}
      <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
        {isSender ? 'You sent this brief' : `From ${brief.sender?.display_name || 'Unknown'}`} • {formatDate(brief.created_at)}
      </div>
    </div>
  )
}

export default BriefCard
