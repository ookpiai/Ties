import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { createJobPosting } from '../../api/jobs'
import { canCreateJob, canStartTrial } from '../../api/subscriptions'
import { useAuth } from '../../App'
import { Button } from '../ui/button'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Info,
  Lightbulb,
  Eye,
  Users,
  Briefcase,
  ClipboardList,
  FileText,
  Lock,
  Globe,
  Loader2
} from 'lucide-react'
import JobBasicDetailsForm from './JobBasicDetailsForm'
import JobRolesManager from './JobRolesManager'
import JobWorkspaceDetailsForm from './JobWorkspaceDetailsForm'
import UpgradePromptModal from '../subscription/UpgradePromptModal'

const CreateJobPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  // Subscription limit state
  const [isCheckingLimit, setIsCheckingLimit] = useState(true)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [limitInfo, setLimitInfo] = useState(null)
  const [canTrial, setCanTrial] = useState(false)

  // Job basic details (visible in Jobs Feed card)
  const [jobData, setJobData] = useState({
    title: '',
    description: '',
    location: '',
    event_type: 'wedding',
    start_date: '',
    end_date: '',
    application_deadline: ''
  })

  // Workspace details (visible only to accepted team members)
  const [workspaceData, setWorkspaceData] = useState({
    detailed_brief: '',
    schedule_notes: '',
    venue_details: '',
    contact_info: '',
    special_requirements: '',
    equipment_provided: '',
    dress_code: '',
    parking_info: ''
  })

  // Roles array
  const [roles, setRoles] = useState([])

  // Check job creation limit on mount
  useEffect(() => {
    const checkLimit = async () => {
      try {
        const [jobLimit, trialEligible] = await Promise.all([
          canCreateJob(),
          canStartTrial()
        ])

        setLimitInfo(jobLimit)
        setCanTrial(trialEligible)

        if (!jobLimit.allowed) {
          setShowUpgradeModal(true)
        }
      } catch (err) {
        console.error('Error checking job limit:', err)
        // Allow creation on error - fail open
        setLimitInfo({ allowed: true, currentCount: 0, limit: 1 })
      } finally {
        setIsCheckingLimit(false)
      }
    }

    checkLimit()
  }, [])

  const handleTrialStarted = () => {
    // Refresh limit after trial starts
    setShowUpgradeModal(false)
    setIsCheckingLimit(true)
    canCreateJob().then(result => {
      setLimitInfo(result)
      setIsCheckingLimit(false)
    })
  }

  const steps = [
    { number: 1, title: 'Job Card', description: 'Public listing info' },
    { number: 2, title: 'Add Roles', description: 'Define roles needed' },
    { number: 3, title: 'Workspace Details', description: 'Team-only info' },
    { number: 4, title: 'Review', description: 'Review and post' }
  ]

  // How it works information
  const howItWorks = [
    {
      icon: Eye,
      title: 'Your job appears in the Jobs Feed',
      description: 'All users can browse and discover your job posting'
    },
    {
      icon: Users,
      title: 'People apply to your roles',
      description: 'Freelancers, venues, and vendors submit applications with their rates'
    },
    {
      icon: ClipboardList,
      title: 'Review and accept applicants',
      description: 'Choose the best fits and accept them into your project'
    },
    {
      icon: Briefcase,
      title: 'Manage in Studio',
      description: 'Once accepted, the project appears in Studio for full project management'
    }
  ]

  // Calculate total budget from all roles
  const totalBudget = roles.reduce((sum, role) => sum + (parseFloat(role.budget) || 0), 0)

  // Validation
  const canProceedFromStep1 = () => {
    return jobData.title &&
           jobData.description &&
           jobData.location &&
           jobData.start_date &&
           jobData.end_date
  }

  const canProceedFromStep2 = () => {
    return roles.length > 0 && roles.every(role =>
      role.role_type &&
      role.role_title &&
      role.budget > 0 &&
      role.quantity > 0
    )
  }

  const canProceedFromStep3 = () => {
    // Workspace details are optional but recommended
    return true
  }

  const handleNext = () => {
    if (currentStep === 1 && !canProceedFromStep1()) {
      setError('Please fill in all required fields')
      return
    }
    if (currentStep === 2 && !canProceedFromStep2()) {
      setError('Please add at least one role with valid details')
      return
    }
    if (currentStep === 3 && !canProceedFromStep3()) {
      setError('Please complete the workspace details')
      return
    }
    setError(null)
    setCurrentStep(currentStep + 1)
  }

  const handleBack = () => {
    setError(null)
    setCurrentStep(currentStep - 1)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      // Prepare job data (organiser_id is set automatically by API)
      const jobPayload = {
        title: jobData.title,
        description: jobData.description,
        location: jobData.location,
        event_type: jobData.event_type,
        start_date: jobData.start_date,
        end_date: jobData.end_date,
        application_deadline: jobData.application_deadline || null,
        total_budget: totalBudget,
        // Workspace details stored as JSON
        workspace_details: workspaceData
      }

      // Prepare roles data
      const rolesPayload = roles.map(role => ({
        role_type: role.role_type,
        role_title: role.role_title,
        role_description: role.role_description || null,
        budget: parseFloat(role.budget),
        quantity: parseInt(role.quantity)
      }))

      const result = await createJobPosting(jobPayload, rolesPayload)

      if (result.success) {
        // Success! Navigate to job details
        navigate(`/jobs`)
      } else {
        setError(result.error || 'Failed to create job posting')
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      console.error('Error creating job:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show loading while checking limit
  if (isCheckingLimit) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0B0B0B] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Checking subscription...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0B0B] py-8">
      {/* Upgrade Modal */}
      <UpgradePromptModal
        isOpen={showUpgradeModal}
        onClose={() => {
          setShowUpgradeModal(false)
          if (!limitInfo?.allowed) {
            navigate('/create')
          }
        }}
        limitType="jobs"
        currentCount={limitInfo?.currentCount || 0}
        currentLimit={limitInfo?.limit || 1}
        currentTier="free"
        canStartTrial={canTrial}
        onTrialStarted={handleTrialStarted}
      />

      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/create')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Create
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Post a New Job</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Create a job listing to find freelancers, venues, or vendors for your event
          </p>
        </div>

        {/* How It Works Banner - Only show on step 1 */}
        {currentStep === 1 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h3 className="font-semibold text-blue-900 dark:text-blue-300">How Job Posting Works</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {howItWorks.map((step, index) => {
                const Icon = step.icon
                return (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{step.title}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{step.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Two-Part Structure Explanation - Show on step 1 */}
        {currentStep === 1 && (
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="h-5 w-5 text-green-600 dark:text-green-400" />
                <h4 className="font-semibold text-green-900 dark:text-green-300">Public Job Card</h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This step creates the job listing visible in the Jobs Feed. Include title, description, location, dates, and budget to attract applicants.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <h4 className="font-semibold text-purple-900 dark:text-purple-300">Workspace Details (Step 3)</h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Private details only visible to accepted team members in Studio. Add detailed briefs, schedules, venue info, and requirements.
              </p>
            </div>
          </div>
        )}

        {/* Progress Steps */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${
                      currentStep > step.number
                        ? 'bg-green-500 text-white'
                        : currentStep === step.number
                        ? 'bg-[#E03131] text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {currentStep > step.number ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      step.number
                    )}
                  </div>
                  <div className="text-center mt-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{step.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-1 flex-1 mx-4 ${
                      currentStep > step.number ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 rounded-lg p-4 mb-6">
            {error}
          </div>
        )}

        {/* Step Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          {currentStep === 1 && (
            <JobBasicDetailsForm
              jobData={jobData}
              setJobData={setJobData}
            />
          )}

          {currentStep === 2 && (
            <JobRolesManager
              roles={roles}
              setRoles={setRoles}
              totalBudget={totalBudget}
            />
          )}

          {currentStep === 3 && (
            <JobWorkspaceDetailsForm
              workspaceData={workspaceData}
              setWorkspaceData={setWorkspaceData}
            />
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Review Your Job Posting</h2>

              {/* Public Info Section */}
              <div className="border-l-4 border-green-500 pl-4">
                <div className="flex items-center gap-2 mb-3">
                  <Globe className="h-5 w-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Public Job Card</h3>
                  <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-0.5 rounded">Visible to all</span>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Title:</span>
                    <p className="text-gray-900 dark:text-white">{jobData.title}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Description:</span>
                    <p className="text-gray-900 dark:text-white">{jobData.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Location:</span>
                      <p className="text-gray-900 dark:text-white">{jobData.location}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Event Type:</span>
                      <p className="text-gray-900 dark:text-white capitalize">{jobData.event_type.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Start Date:</span>
                      <p className="text-gray-900 dark:text-white">{new Date(jobData.start_date).toLocaleDateString('en-AU')}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">End Date:</span>
                      <p className="text-gray-900 dark:text-white">{new Date(jobData.end_date).toLocaleDateString('en-AU')}</p>
                    </div>
                  </div>
                  {jobData.application_deadline && (
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Application Deadline:</span>
                      <p className="text-gray-900 dark:text-white">{new Date(jobData.application_deadline).toLocaleDateString('en-AU')}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Roles */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Roles ({roles.length} {roles.length === 1 ? 'role' : 'roles'})
                </h3>
                <div className="space-y-3">
                  {roles.map((role, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{role.role_title}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{role.role_type}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600 dark:text-green-400">
                            ${parseFloat(role.budget).toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Qty: {role.quantity}</p>
                        </div>
                      </div>
                      {role.role_description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">{role.role_description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Workspace Details Section */}
              <div className="border-l-4 border-purple-500 pl-4">
                <div className="flex items-center gap-2 mb-3">
                  <Lock className="h-5 w-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Workspace Details</h3>
                  <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-2 py-0.5 rounded">Team only</span>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 space-y-3">
                  {workspaceData.detailed_brief && (
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Detailed Brief:</span>
                      <p className="text-gray-900 dark:text-white text-sm">{workspaceData.detailed_brief}</p>
                    </div>
                  )}
                  {workspaceData.schedule_notes && (
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Schedule Notes:</span>
                      <p className="text-gray-900 dark:text-white text-sm">{workspaceData.schedule_notes}</p>
                    </div>
                  )}
                  {workspaceData.venue_details && (
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Venue Details:</span>
                      <p className="text-gray-900 dark:text-white text-sm">{workspaceData.venue_details}</p>
                    </div>
                  )}
                  {workspaceData.contact_info && (
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Contact Info:</span>
                      <p className="text-gray-900 dark:text-white text-sm">{workspaceData.contact_info}</p>
                    </div>
                  )}
                  {workspaceData.special_requirements && (
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Special Requirements:</span>
                      <p className="text-gray-900 dark:text-white text-sm">{workspaceData.special_requirements}</p>
                    </div>
                  )}
                  {workspaceData.equipment_provided && (
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Equipment Provided:</span>
                      <p className="text-gray-900 dark:text-white text-sm">{workspaceData.equipment_provided}</p>
                    </div>
                  )}
                  {workspaceData.dress_code && (
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Dress Code:</span>
                      <p className="text-gray-900 dark:text-white text-sm">{workspaceData.dress_code}</p>
                    </div>
                  )}
                  {workspaceData.parking_info && (
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Parking Info:</span>
                      <p className="text-gray-900 dark:text-white text-sm">{workspaceData.parking_info}</p>
                    </div>
                  )}
                  {!workspaceData.detailed_brief && !workspaceData.schedule_notes && !workspaceData.venue_details && (
                    <p className="text-gray-500 dark:text-gray-400 text-sm italic">No additional workspace details provided. You can add these later from Studio.</p>
                  )}
                </div>
              </div>

              {/* Total Budget */}
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">Total Budget:</span>
                  <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                    ${totalBudget.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <div>
            {currentStep > 1 && (
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={isSubmitting}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => navigate('/create')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            {currentStep < 4 ? (
              <Button onClick={handleNext}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? 'Posting...' : 'Post Job'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateJobPage
