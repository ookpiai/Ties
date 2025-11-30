/**
 * APPLY ON BEHALF MODAL
 * Agent Mode per agent.md spec
 *
 * Allows agents to submit job applications on behalf of their talent
 * Opens a group chat with: Agent, Client, Talent (cc'd)
 */

import { useState, useEffect } from 'react'
import { X, DollarSign, FileText, Users, ShieldCheck, Loader2 } from 'lucide-react'
import { Button } from '../ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Badge } from '../ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { applyToJobRole } from '../../api/jobs'
import { getAgentTalentRoster } from '../../api/agents'
import { useAuth } from '../../App'

const ApplyOnBehalfModal = ({ isOpen, onClose, job, role, onApplicationSubmitted }) => {
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingTalent, setIsLoadingTalent] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [talentRoster, setTalentRoster] = useState([])

  const [applicationData, setApplicationData] = useState({
    selected_talent_id: '',
    cover_letter: '',
    proposed_rate: '',
    agent_notes: ''
  })

  // Load agent's talent roster
  useEffect(() => {
    const loadTalent = async () => {
      if (!isOpen) return
      setIsLoadingTalent(true)
      try {
        const roster = await getAgentTalentRoster()
        // Filter to only approved talent
        setTalentRoster(roster.filter(l => l.status === 'approved'))
      } catch (err) {
        console.error('Failed to load talent:', err)
      } finally {
        setIsLoadingTalent(false)
      }
    }
    loadTalent()
  }, [isOpen])

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setApplicationData({
        selected_talent_id: '',
        cover_letter: '',
        proposed_rate: role?.budget || '',
        agent_notes: ''
      })
      setError(null)
      setSuccess(false)
    }
  }, [isOpen, role])

  const handleChange = (field, value) => {
    setApplicationData({ ...applicationData, [field]: value })
    setError(null)
  }

  const getSelectedTalent = () => {
    return talentRoster.find(t => t.freelancer_id === applicationData.selected_talent_id)
  }

  const validate = () => {
    if (!applicationData.selected_talent_id) {
      setError('Please select a talent to apply on behalf of')
      return false
    }

    if (!applicationData.cover_letter.trim()) {
      setError('Please write a cover letter explaining why this talent is a good fit')
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
      const selectedTalent = getSelectedTalent()

      // Apply on behalf - pass agent_id and talent_id
      const result = await applyToJobRole(
        job.id,
        role.id,
        {
          cover_letter: `[Applied on behalf by Agent: ${user.display_name || user.email}]\n\n${applicationData.cover_letter}`,
          proposed_rate: applicationData.proposed_rate ? parseFloat(applicationData.proposed_rate) : null,
          applicant_id: applicationData.selected_talent_id,
          agent_id: user.id,
          agent_notes: applicationData.agent_notes || null
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
      <div className="relative bg-white dark:bg-slate-900 rounded-lg shadow-xl max-w-2xl w-full">
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-gray-200 dark:border-slate-700">
          <div>
            <div className="flex items-center gap-2">
              <Badge className="bg-indigo-100 text-indigo-800 border-indigo-300">
                <ShieldCheck className="w-3 h-3 mr-1" />
                Agent Mode
              </Badge>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              Apply on Behalf of Talent
            </h2>
            <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
              {role.role_title} • {job.title}
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
              Application submitted successfully on behalf of your talent! Redirecting...
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
              {error}
            </div>
          )}

          {/* Select Talent */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              <Users className="inline h-4 w-4 mr-1" />
              Select Talent <span className="text-red-500">*</span>
            </label>

            {isLoadingTalent ? (
              <div className="flex items-center justify-center py-4 border rounded-lg bg-gray-50 dark:bg-slate-800">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mr-2" />
                <span className="text-sm text-muted-foreground">Loading your talent...</span>
              </div>
            ) : talentRoster.length === 0 ? (
              <div className="p-4 border rounded-lg bg-yellow-50 text-yellow-800">
                You don't have any approved talent yet. Link with freelancers first.
              </div>
            ) : (
              <Select
                value={applicationData.selected_talent_id}
                onValueChange={(value) => handleChange('selected_talent_id', value)}
                disabled={isSubmitting || success}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a freelancer from your roster..." />
                </SelectTrigger>
                <SelectContent>
                  {talentRoster.map((link) => {
                    const freelancer = link.freelancer_profile
                    return (
                      <SelectItem key={link.freelancer_id} value={link.freelancer_id}>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={freelancer?.avatar_url} />
                            <AvatarFallback className="text-xs">
                              {freelancer?.display_name?.split(' ').map(n => n[0]).join('') || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <span>{freelancer?.display_name || 'Unknown'}</span>
                          <span className="text-muted-foreground text-xs capitalize">
                            ({freelancer?.role || 'Freelancer'})
                          </span>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            )}

            {/* Selected Talent Preview */}
            {applicationData.selected_talent_id && (
              <div className="mt-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                {(() => {
                  const talent = getSelectedTalent()?.freelancer_profile
                  return (
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={talent?.avatar_url} />
                        <AvatarFallback className="bg-indigo-100 text-indigo-700">
                          {talent?.display_name?.split(' ').map(n => n[0]).join('') || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{talent?.display_name}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {talent?.role} {talent?.city && `• ${talent.city}`}
                        </p>
                      </div>
                      <Badge variant="outline" className="ml-auto text-xs">
                        Your Talent
                      </Badge>
                    </div>
                  )
                })()}
              </div>
            )}
          </div>

          {/* Job Info Summary */}
          <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4 space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-slate-400">Location:</span>
                <p className="text-gray-900 dark:text-white">{job.location || 'TBD'}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-slate-400">Date:</span>
                <p className="text-gray-900 dark:text-white">
                  {new Date(job.start_date).toLocaleDateString('en-AU')}
                </p>
              </div>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500 dark:text-slate-400">Budget for this role:</span>
              <p className="text-lg font-bold text-green-600">
                ${parseFloat(role.budget).toFixed(2)}
              </p>
            </div>
          </div>

          {/* Cover Letter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              <FileText className="inline h-4 w-4 mr-1" />
              Cover Letter <span className="text-red-500">*</span>
            </label>
            <textarea
              placeholder="Explain why this talent is perfect for the role. Include their relevant experience, what makes them unique, and why they'd be a great fit..."
              value={applicationData.cover_letter}
              onChange={(e) => handleChange('cover_letter', e.target.value)}
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
              disabled={isSubmitting || success}
            />
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
              This will be sent to the client with a note that you're applying as their agent.
            </p>
          </div>

          {/* Proposed Rate (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              <DollarSign className="inline h-4 w-4 mr-1" />
              Proposed Rate (Optional)
            </label>
            <input
              type="number"
              placeholder="0.00"
              value={applicationData.proposed_rate}
              onChange={(e) => handleChange('proposed_rate', e.target.value)}
              min="0"
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
              disabled={isSubmitting || success}
            />
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
              Leave blank to accept the posted budget of ${parseFloat(role.budget).toFixed(2)}.
            </p>
          </div>

          {/* Agent Notes (Internal) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Internal Notes (Optional)
            </label>
            <textarea
              placeholder="Any private notes for yourself about this application..."
              value={applicationData.agent_notes}
              onChange={(e) => handleChange('agent_notes', e.target.value)}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
              disabled={isSubmitting || success}
            />
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
              These notes are only visible to you.
            </p>
          </div>

          {/* Info Box */}
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>How it works:</strong> When you submit this application, a group conversation will be created with you (the agent), the client, and your talent (CC'd). This keeps all communication transparent.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-slate-700">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting || success}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || success || talentRoster.length === 0}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Submitting...
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4 mr-2" />
                Apply on Behalf
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ApplyOnBehalfModal
