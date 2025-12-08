import { useState } from 'react'
import { X, AlertCircle, XCircle } from 'lucide-react'
import { Button } from '../ui/button'
import { rejectApplicant } from '../../api/jobs'

const RejectConfirmModal = ({ isOpen, onClose, application, onRejectionComplete }) => {
  const [isRejecting, setIsRejecting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [reason, setReason] = useState('')

  const handleConfirm = async () => {
    setIsRejecting(true)
    setError(null)

    try {
      const result = await rejectApplicant(application.id, reason || undefined)

      if (result.success) {
        setSuccess(true)
        setTimeout(() => {
          onRejectionComplete?.()
          onClose()
          // Reset state
          setSuccess(false)
          setReason('')
        }, 1500)
      } else {
        setError(result.error || 'Failed to reject applicant')
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      console.error('Error rejecting applicant:', err)
    } finally {
      setIsRejecting(false)
    }
  }

  const handleClose = () => {
    if (!isRejecting && !success) {
      setError(null)
      setReason('')
      onClose()
    }
  }

  if (!isOpen || !application) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full">
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reject Applicant</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              This will notify the applicant of your decision
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            disabled={isRejecting || success}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Success Message */}
          {success && (
            <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 text-green-800 dark:text-green-300 rounded-lg p-4 flex items-center gap-3">
              <XCircle className="h-5 w-5 flex-shrink-0" />
              <div>
                <p className="font-semibold">Applicant rejected</p>
                <p className="text-sm">The applicant has been notified.</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-800 dark:text-red-300 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {!success && (
            <>
              {/* Applicant Info */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <img
                    src={application.applicant?.avatar_url || '/default-avatar.png'}
                    alt={application.applicant?.display_name}
                    className="h-12 w-12 rounded-full"
                  />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {application.applicant?.display_name || 'Anonymous'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{application.role?.role_title}</p>
                  </div>
                </div>
              </div>

              {/* Optional Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reason for rejection (optional)
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g., Position filled, Looking for different experience..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  rows={3}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  This will not be shared with the applicant
                </p>
              </div>

              {/* Warning Box */}
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-red-800 dark:text-red-300">
                    <p className="font-semibold mb-1">Are you sure?</p>
                    <p>This action will reject the application. The applicant will be notified that they were not selected for this role.</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!success && (
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isRejecting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isRejecting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isRejecting ? 'Rejecting...' : 'Confirm Rejection'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default RejectConfirmModal
