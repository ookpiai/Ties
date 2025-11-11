import { useState, useEffect } from 'react'
import { X, DollarSign, FileText } from 'lucide-react'
import { Button } from '../ui/button'
import { applyToJobRole } from '../../api/jobs'
import { useAuth } from '../../App'

const ApplyToRoleModal = ({ isOpen, onClose, job, role, onApplicationSubmitted }) => {
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const [applicationData, setApplicationData] = useState({
    cover_letter: '',
    proposed_rate: ''
  })

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setApplicationData({
        cover_letter: '',
        proposed_rate: role?.budget || ''
      })
      setError(null)
      setSuccess(false)
    }
  }, [isOpen, role])

  const handleChange = (field, value) => {
    setApplicationData({ ...applicationData, [field]: value })
    setError(null)
  }

  const validate = () => {
    if (!applicationData.cover_letter.trim()) {
      setError('Please write a cover letter explaining why you\'re a good fit')
      return false
    }

    if (applicationData.proposed_rate && parseFloat(applicationData.proposed_rate) <= 0) {
      setError('Proposed rate must be greater than 0')
      return false
    }

    return true
  }

  const handleSubmit = async () => {
    if (!validate()) return

    setIsSubmitting(true)
    setError(null)

    try {
      const result = await applyToJobRole(
        job.id,
        role.id,
        {
          cover_letter: applicationData.cover_letter,
          proposed_rate: applicationData.proposed_rate ? parseFloat(applicationData.proposed_rate) : null
        }
      )

      if (result.success) {
        setSuccess(true)
        setTimeout(() => {
          onApplicationSubmitted?.()
          onClose()
        }, 1500)
      } else {
        setError(result.error || 'Failed to submit application')
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      console.error('Error submitting application:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen || !job || !role) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full">
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Apply for {role.role_title}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {job.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4">
              ✓ Application submitted successfully! Redirecting...
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
              {error}
            </div>
          )}

          {/* Job Info Summary */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div>
              <span className="text-sm font-medium text-gray-500">Event:</span>
              <p className="text-gray-900">{job.title}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-500">Location:</span>
                <p className="text-gray-900">{job.location || 'TBD'}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Date:</span>
                <p className="text-gray-900">
                  {new Date(job.start_date).toLocaleDateString('en-AU')}
                </p>
              </div>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Budget for this role:</span>
              <p className="text-lg font-bold text-green-600">
                ${parseFloat(role.budget).toFixed(2)}
              </p>
            </div>
          </div>

          {/* Cover Letter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="inline h-4 w-4 mr-1" />
              Cover Letter <span className="text-red-500">*</span>
            </label>
            <textarea
              placeholder="Explain why you're the perfect fit for this role. Include relevant experience, what makes you unique, and why you want this job..."
              value={applicationData.cover_letter}
              onChange={(e) => handleChange('cover_letter', e.target.value)}
              rows={8}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E03131] focus:border-transparent"
              disabled={isSubmitting || success}
            />
            <p className="text-xs text-gray-500 mt-1">
              This is your chance to stand out! Be specific about your experience and why you're a great fit.
            </p>
          </div>

          {/* Proposed Rate (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="inline h-4 w-4 mr-1" />
              Your Proposed Rate (Optional)
            </label>
            <input
              type="number"
              placeholder="0.00"
              value={applicationData.proposed_rate}
              onChange={(e) => handleChange('proposed_rate', e.target.value)}
              min="0"
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E03131] focus:border-transparent"
              disabled={isSubmitting || success}
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave blank to accept the posted budget of ${parseFloat(role.budget).toFixed(2)}.
              Or propose your own rate if you have a different price in mind.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting || success}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || success}
            className="bg-[#E03131] hover:bg-[#C02828]"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ApplyToRoleModal
