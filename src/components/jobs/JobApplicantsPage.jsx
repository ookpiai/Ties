import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getApplicationsForJob, getJobPostingById } from '../../api/jobs'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { ArrowLeft, Users, Building2, Package, Calendar, MapPin, DollarSign, Mail, CheckCircle } from 'lucide-react'
import SelectionConfirmModal from './SelectionConfirmModal'

const JobApplicantsPage = () => {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const [job, setJob] = useState(null)
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedRole, setSelectedRole] = useState('all')
  const [selectingApplication, setSelectingApplication] = useState(null)

  useEffect(() => {
    if (jobId) {
      loadJobAndApplications()
    }
  }, [jobId])

  const loadJobAndApplications = async () => {
    setLoading(true)

    // Load job details
    const jobResult = await getJobPostingById(jobId)
    if (jobResult.success) {
      setJob(jobResult.data)
    }

    // Load applications
    const appsResult = await getApplicationsForJob(jobId)
    if (appsResult.success) {
      setApplications(appsResult.data)
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
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'venue':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'vendor':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">Pending</Badge>
      case 'selected':
        return <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">✓ Selected</Badge>
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-800 border-red-200">Rejected</Badge>
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
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-gray-500">Loading applicants...</p>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-gray-500">Job not found</p>
          <Button onClick={() => navigate('/jobs')} className="mt-4">
            Back to Jobs
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/jobs')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Jobs
        </button>
        <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
        <p className="text-gray-600 mt-2">Review applicants for your job posting</p>
      </div>

      {/* Job Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Location</p>
              <p className="font-medium text-gray-900">{job.location}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Event Date</p>
              <p className="font-medium text-gray-900">{formatDate(job.start_date)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <DollarSign className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Total Budget</p>
              <p className="font-medium text-green-600">{formatCurrency(job.total_budget)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-700">Total Applications</p>
          <p className="text-3xl font-bold text-blue-900">{totalApplications}</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-700">Pending Review</p>
          <p className="text-3xl font-bold text-yellow-800">{pendingApplications}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-700">Selected</p>
          <p className="text-3xl font-bold text-green-800">{selectedApplications}</p>
        </div>
      </div>

      {/* Role Filter */}
      {job.roles && job.roles.length > 1 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <p className="text-sm font-medium text-gray-700 mb-3">Filter by role:</p>
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
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No applications yet</h3>
          <p className="text-gray-600">
            Your job posting is live. Applicants will appear here once they apply.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {filteredRoles.map(({ role, applications: roleApplications }) => (
            <div key={role.id} className="bg-white rounded-lg border border-gray-200 p-6">
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
                      <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        FILLED
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    {roleApplications.length} {roleApplications.length === 1 ? 'applicant' : 'applicants'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-green-600">{formatCurrency(role.budget)}</p>
                  <p className="text-xs text-gray-500">Budget for this role</p>
                </div>
              </div>

              {/* Applications List */}
              <div className="space-y-4">
                {roleApplications.map(application => (
                  <div
                    key={application.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={application.applicant?.avatar_url || '/default-avatar.png'}
                          alt={application.applicant?.display_name}
                          className="h-12 w-12 rounded-full"
                        />
                        <div>
                          <p className="font-semibold text-gray-900">
                            {application.applicant?.display_name || 'Anonymous'}
                          </p>
                          <p className="text-sm text-gray-600 capitalize">
                            {application.applicant?.role}
                          </p>
                          {application.applicant?.city && (
                            <p className="text-sm text-gray-500">{application.applicant.city}</p>
                          )}
                        </div>
                      </div>
                      {getStatusBadge(application.status)}
                    </div>

                    {/* Cover Letter */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">Cover Letter:</p>
                      <p className="text-sm text-gray-600">{application.cover_letter}</p>
                    </div>

                    {/* Application Details */}
                    <div className="flex justify-between items-center">
                      <div className="flex gap-4 text-sm text-gray-600">
                        {application.proposed_rate && (
                          <div>
                            <span className="font-medium">Proposed Rate:</span>{' '}
                            <span className="text-green-600 font-semibold">
                              {formatCurrency(application.proposed_rate)}
                            </span>
                          </div>
                        )}
                        <div>
                          <span className="font-medium">Applied:</span> {formatDate(application.created_at)}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      {application.status === 'pending' && role.filled_count < role.quantity && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => setSelectingApplication(application)}
                          >
                            Select
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/profile/${application.applicant?.id}`)}
                          >
                            View Profile
                          </Button>
                        </div>
                      )}
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
    </div>
  )
}

export default JobApplicantsPage
