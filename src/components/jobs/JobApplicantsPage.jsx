import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getApplicationsForJob, getJobPostingById, rejectApplicant } from '../../api/jobs'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import {
  ArrowLeft,
  Users,
  Building2,
  Package,
  Calendar,
  MapPin,
  DollarSign,
  Mail,
  CheckCircle,
  Eye,
  UserCheck,
  UserX,
  Briefcase,
  ExternalLink,
  MessageCircle
} from 'lucide-react'
import SelectionConfirmModal from './SelectionConfirmModal'
import RejectConfirmModal from './RejectConfirmModal'

const JobApplicantsPage = () => {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const [job, setJob] = useState(null)
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedRole, setSelectedRole] = useState('all')
  const [selectingApplication, setSelectingApplication] = useState(null)
  const [rejectingApplication, setRejectingApplication] = useState(null)

  useEffect(() => {
    if (jobId) {
      loadJobAndApplications()
    }
  }, [jobId])

  const loadJobAndApplications = async () => {
    setLoading(true)
    setError(null)

    // Load job details
    const jobResult = await getJobPostingById(jobId)
    console.log('Job result:', jobResult)
    if (jobResult.success) {
      setJob(jobResult.data)
    } else {
      setError(jobResult.error || 'Failed to load job details')
      setLoading(false)
      return
    }

    // Load applications
    const appsResult = await getApplicationsForJob(jobId)
    console.log('Applications result:', appsResult)
    if (appsResult.success) {
      setApplications(appsResult.data)
    } else {
      console.error('Failed to load applications:', appsResult.error)
      // Don't set error - job loaded successfully, just no applications or permission issue
    }

    setLoading(false)
  }

  const getRoleIcon = (roleType) => {
    switch (roleType) {
      case 'freelancer':
        return <Users className="h-5 w-5" />
      case 'venue':
        return <Building2 className="h-5 w-5" />
      case 'vendor':
        return <Package className="h-5 w-5" />
      default:
        return <Users className="h-5 w-5" />
    }
  }

  const getRoleBadgeColor = (roleType) => {
    switch (roleType) {
      case 'freelancer':
        return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700'
      case 'venue':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700'
      case 'vendor':
        return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700">Pending</Badge>
      case 'selected':
        return <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700">✓ Selected</Badge>
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700">Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Group applications by role
  const applicationsByRole = {}
  applications.forEach(app => {
    const roleId = app.job_role_id
    if (!applicationsByRole[roleId]) {
      applicationsByRole[roleId] = {
        role: app.role,
        applications: []
      }
    }
    applicationsByRole[roleId].applications.push(app)
  })

  // Calculate stats
  const totalApplications = applications.length
  const pendingApplications = applications.filter(a => a.status === 'pending').length
  const selectedApplications = applications.filter(a => a.status === 'selected').length

  // Filter applications by selected role
  const filteredRoles = selectedRole === 'all'
    ? Object.values(applicationsByRole)
    : Object.values(applicationsByRole).filter(r => r.role?.id === selectedRole)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0B0B0B]">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E03131] mx-auto"></div>
            <p className="text-gray-500 dark:text-gray-400 mt-4">Loading applicants...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0B0B0B]">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Job not found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {error || "This job posting may have been removed or you don't have access to it."}
            </p>
            <Button onClick={() => navigate('/studio')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Studio
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0B0B]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/jobs')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Jobs
          </button>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{job.title}</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Review and manage applicants for your job posting</p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/studio')}
            >
              <Briefcase className="h-4 w-4 mr-2" />
              Go to Studio
            </Button>
          </div>
        </div>

        {/* Job Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                <p className="font-medium text-gray-900 dark:text-white">{job.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Event Date</p>
                <p className="font-medium text-gray-900 dark:text-white">{formatDate(job.start_date)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Budget</p>
                <p className="font-medium text-green-600 dark:text-green-400">{formatCurrency(job.total_budget)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-700 dark:text-blue-300">Total Applications</p>
            <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{totalApplications}</p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-sm text-yellow-700 dark:text-yellow-300">Pending Review</p>
            <p className="text-3xl font-bold text-yellow-800 dark:text-yellow-100">{pendingApplications}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <p className="text-sm text-green-700 dark:text-green-300">Selected</p>
            <p className="text-3xl font-bold text-green-800 dark:text-green-100">{selectedApplications}</p>
          </div>
        </div>

        {/* Role Filter */}
        {job.roles && job.roles.length > 1 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Filter by role:</p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedRole === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedRole('all')}
              >
                All Roles
              </Button>
              {job.roles.map(role => (
                <Button
                  key={role.id}
                  variant={selectedRole === role.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedRole(role.id)}
                  className={selectedRole === role.id ? '' : getRoleBadgeColor(role.role_type)}
                >
                  {getRoleIcon(role.role_type)}
                  <span className="ml-2">{role.role_title}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Applications by Role */}
        {totalApplications === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
            <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No applications yet</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Your job posting is live. Applicants will appear here once they apply.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredRoles.map(({ role, applications: roleApplications }) => (
              <div key={role.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                {/* Role Header */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <Badge className={getRoleBadgeColor(role.role_type)} variant="outline">
                        <div className="flex items-center gap-1">
                          {getRoleIcon(role.role_type)}
                          <span>{role.role_title}</span>
                        </div>
                      </Badge>
                      {role.filled_count >= role.quantity && (
                        <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          FILLED
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {roleApplications.length} {roleApplications.length === 1 ? 'applicant' : 'applicants'}
                      {' • '}
                      <span className={role.filled_count >= role.quantity ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}>
                        {role.filled_count || 0}/{role.quantity} positions filled
                      </span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-green-600 dark:text-green-400">{formatCurrency(role.budget)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Budget for this role</p>
                  </div>
                </div>

                {/* Applications List */}
                <div className="space-y-4">
                  {roleApplications.map(application => (
                    <div
                      key={application.id}
                      className={`border rounded-lg p-4 transition-colors ${
                        application.status === 'selected'
                          ? 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10'
                          : application.status === 'rejected'
                          ? 'border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 opacity-60'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={application.applicant?.avatar_url || '/default-avatar.png'}
                            alt={application.applicant?.display_name}
                            className="h-12 w-12 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {application.applicant?.display_name || 'Anonymous'}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                              {application.applicant?.role}
                            </p>
                            {application.applicant?.city && (
                              <p className="text-sm text-gray-500 dark:text-gray-500 flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {application.applicant.city}
                              </p>
                            )}
                          </div>
                        </div>
                        {getStatusBadge(application.status)}
                      </div>

                      {/* Cover Letter */}
                      {application.cover_letter && (
                        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 mb-3">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cover Letter:</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{application.cover_letter}</p>
                        </div>
                      )}

                      {/* Application Details */}
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                          {application.proposed_rate && (
                            <div>
                              <span className="font-medium">Proposed Rate:</span>{' '}
                              <span className="text-green-600 dark:text-green-400 font-semibold">
                                {formatCurrency(application.proposed_rate)}
                              </span>
                            </div>
                          )}
                          <div>
                            <span className="font-medium">Applied:</span> {formatDate(application.created_at)}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-2">
                          {/* View Portfolio Button - Always visible */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/profile/${application.applicant?.id}`)}
                            className="flex items-center gap-1"
                          >
                            <Eye className="h-4 w-4" />
                            View Portfolio
                          </Button>

                          {/* Message Button */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate('/messages', {
                              state: {
                                openConversationWithUserId: application.applicant?.id,
                                jobContext: {
                                  id: job.id,
                                  title: job.title,
                                  location: job.location,
                                  event_type: job.event_type,
                                  start_date: job.start_date,
                                  organiser: {
                                    id: job.organiser?.id,
                                    display_name: job.organiser?.display_name,
                                    avatar_url: job.organiser?.avatar_url
                                  }
                                }
                              }
                            })}
                            className="flex items-center gap-1"
                          >
                            <MessageCircle className="h-4 w-4" />
                            Message
                          </Button>

                          {/* Accept/Reject buttons for pending applications */}
                          {application.status === 'pending' && role.filled_count < role.quantity && (
                            <>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 flex items-center gap-1"
                                onClick={() => setSelectingApplication(application)}
                              >
                                <UserCheck className="h-4 w-4" />
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20 flex items-center gap-1"
                                onClick={() => setRejectingApplication(application)}
                              >
                                <UserX className="h-4 w-4" />
                                Reject
                              </Button>
                            </>
                          )}

                          {/* Show selected indicator */}
                          {application.status === 'selected' && (
                            <div className="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium text-sm">
                              <CheckCircle className="h-4 w-4" />
                              Selected for this role
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Selection Confirmation Modal */}
        <SelectionConfirmModal
          isOpen={!!selectingApplication}
          onClose={() => setSelectingApplication(null)}
          application={selectingApplication}
          onSelectionComplete={() => {
            loadJobAndApplications() // Reload data after selection
            setSelectingApplication(null)
          }}
        />

        {/* Rejection Confirmation Modal */}
        <RejectConfirmModal
          isOpen={!!rejectingApplication}
          onClose={() => setRejectingApplication(null)}
          application={rejectingApplication}
          onRejectionComplete={() => {
            loadJobAndApplications() // Reload data after rejection
            setRejectingApplication(null)
          }}
        />
      </div>
    </div>
  )
}

export default JobApplicantsPage
