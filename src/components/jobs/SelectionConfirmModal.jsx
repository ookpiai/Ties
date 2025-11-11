import { useState } from 'react'
import { X, AlertCircle, CheckCircle, DollarSign } from 'lucide-react'
import { Button } from '../ui/button'
import { selectApplicant } from '../../api/jobs'

const SelectionConfirmModal = ({ isOpen, onClose, application, onSelectionComplete }) => {
  const [isSelecting, setIsSelecting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleConfirm = async () => {
    setIsSelecting(true)
    setError(null)

    try {
      const result = await selectApplicant(application.id)

      if (result.success) {
        setSuccess(true)
        setTimeout(() => {
          onSelectionComplete?.()
          onClose()
        }, 2000)
      } else {
        setError(result.error || 'Failed to select applicant')
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      console.error('Error selecting applicant:', err)
    } finally {
      setIsSelecting(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  if (!isOpen || !application) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full">
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Confirm Selection</h2>
            <p className="text-sm text-gray-600 mt-1">
              This will create a booking and notify the applicant
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSelecting || success}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 flex items-center gap-3">
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
              <div>
                <p className="font-semibold">Applicant selected successfully!</p>
                <p className="text-sm">A booking has been created and the calendar has been blocked.</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {!success && (
            <>
              {/* Applicant Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={application.applicant?.avatar_url || '/default-avatar.png'}
                    alt={application.applicant?.display_name}
                    className="h-12 w-12 rounded-full"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">
                      {application.applicant?.display_name || 'Anonymous'}
                    </p>
                    <p className="text-sm text-gray-600">{application.role?.role_title}</p>
                  </div>
                </div>

                {/* Payment Details */}
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Payment Amount:</span>
                    <span className="font-bold text-green-600 flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      {formatCurrency(application.proposed_rate || application.role?.budget)}
                    </span>
                  </div>
                  {application.proposed_rate && application.proposed_rate !== application.role?.budget && (
                    <p className="text-xs text-gray-500 mt-1">
                      Original budget: {formatCurrency(application.role?.budget)}
                    </p>
                  )}
                </div>
              </div>

              {/* Warning Box */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-semibold mb-2">This action will:</p>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>Create a confirmed booking</li>
                      <li>Block the applicant's calendar</li>
                      <li>Reject other applicants for this role</li>
                      <li>Send a notification to the selected applicant</li>
                      <li>Cannot be easily undone</li>
                    </ul>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!success && (
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSelecting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isSelecting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSelecting ? 'Selecting...' : 'Confirm Selection'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default SelectionConfirmModal
