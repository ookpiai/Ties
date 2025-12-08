import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, MapPin, Calendar, DollarSign, Users, Building2, Package, Clock, User as UserIcon, ShieldCheck, MessageCircle } from 'lucide-react'
import { getJobPostingById } from '../../api/jobs'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { useAuth } from '../../App'
import ApplyToRoleModal from './ApplyToRoleModal'
import ApplyOnBehalfModal from './ApplyOnBehalfModal'

const JobDetailsModal = ({ jobId, isOpen, onClose }) => {
  const navigate = useNavigate()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [applyingToRole, setApplyingToRole] = useState(null)
  const [applyOnBehalfRole, setApplyOnBehalfRole] = useState(null)
  const { user } = useAuth()

  // Check if user is a verified agent
  const isVerifiedAgent = user?.is_agent && user?.is_agent_verified

  useEffect(() => {
    if (isOpen && jobId) {
      loadJobDetails()
    }
  }, [isOpen, jobId])

  const loadJobDetails = async () => {
    setLoading(true)
    const result = await getJobPostingById(jobId)
    if (result.success) {
      setJob(result.data)
    } else {
      console.error('Error loading job:', result.error)
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

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-AU', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const canApplyToRole = (role) => {
    // Check if user exists
    if (!user) return false

    // Prevent organiser from applying to their own job
    if (job?.organiser_id === user.id) return false

    // Freelancers can apply to freelancer roles (includes legacy Artist/Crew roles)
    if (role.role_type === 'freelancer' && (user.role === 'Freelancer' || user.role === 'Artist' || user.role === 'Crew')) {
      return true
    }

    // Venues can apply to venue roles
    if (role.role_type === 'venue' && user.role === 'Venue') {
      return true
    }

    // Vendors can apply to vendor roles
    if (role.role_type === 'vendor' && user.role === 'Vendor') {
      return true
    }

    return false
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-start justify-center p-4">
      <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full my-8 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-start z-10">
          <div className="flex-1 pr-4">
            {loading ? (
              <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse"></div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-gray-900">{job?.title}</h2>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <Badge variant={job?.status === 'open' ? 'default' : 'secondary'}>
                    {job?.status}
                  </Badge>
                  {job?.event_type && (
                    <span className="capitalize">{job.event_type.replace('_', ' ')}</span>
                  )}
                </div>
              </>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {loading ? (
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6 animate-pulse"></div>
            </div>
          ) : job ? (
            <div className="space-y-6">
              {/* Job Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Location */}
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Location</p>
                    <p className="text-gray-900">{job.location || 'Location TBD'}</p>
                  </div>
                </div>

                {/* Date */}
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Event Date</p>
                    <p className="text-gray-900">{formatDate(job.start_date)}</p>
                  </div>
                </div>

                {/* Budget */}
                {job.total_budget && (
                  <div className="flex items-start gap-3">
                    <DollarSign className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Budget</p>
                      <p className="text-xl font-semibold text-green-600">
                        {formatCurrency(job.total_budget)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Application Deadline */}
                {job.application_deadline && (
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Apply By</p>
                      <p className="text-gray-900">{formatDate(job.application_deadline)}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
              </div>

              {/* Roles Needed */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {job.roles?.length === 1 ? 'Role Needed' : `${job.roles?.length} Roles Needed`}
                </h3>
                <div className="space-y-4">
                  {job.roles?.map((role) => (
                    <div
                      key={role.id}
                      className={`border rounded-lg p-4 ${
                        role.filled_count >= role.quantity
                          ? 'bg-gray-50 border-gray-200'
                          : 'bg-white border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <Badge className={getRoleBadgeColor(role.role_type)} variant="outline">
                            <div className="flex items-center gap-1">
                              {getRoleIcon(role.role_type)}
                              <span>{role.role_title}</span>
                            </div>
                          </Badge>
                          {role.filled_count >= role.quantity && (
                            <Badge variant="secondary">FILLED</Badge>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-green-600">
                            {formatCurrency(role.budget)}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-gray-600">
                            {role.application_count > 0 && (
                              <span>
                                {role.application_count} {role.application_count === 1 ? 'applicant' : 'applicants'}
                              </span>
                            )}
                            <span className={`font-medium ${
                              role.filled_count >= role.quantity ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {role.filled_count || 0}/{role.quantity} filled
                            </span>
                          </div>
                        </div>
                      </div>

                      {role.role_description && (
                        <p className="text-sm text-gray-600 mb-3">{role.role_description}</p>
                      )}

                      {/* Apply Button */}
                      {job.status === 'open' && role.filled_count < role.quantity && (
                        <div className="mt-3 space-y-2">
                          {canApplyToRole(role) ? (
                            <Button
                              size="sm"
                              className="w-full"
                              onClick={() => setApplyingToRole(role)}
                            >
                              Apply for this role
                            </Button>
                          ) : (
                            <p className="text-xs text-gray-500 text-center py-2">
                              {user?.role === 'organiser'
                                ? "You're the organiser of this job"
                                : `Only ${role.role_type}s can apply to this role`
                              }
                            </p>
                          )}
                          {/* Apply on Behalf button for verified agents on freelancer roles */}
                          {isVerifiedAgent && role.role_type === 'freelancer' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                              onClick={() => setApplyOnBehalfRole(role)}
                            >
                              <ShieldCheck className="h-4 w-4 mr-2" />
                              Apply on Behalf of Talent
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Posted By */}
              {job.organiser && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Posted By</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <img
                        src={job.organiser.avatar_url || '/default-avatar.png'}
                        alt={job.organiser.display_name}
                        className="h-12 w-12 rounded-full"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{job.organiser.display_name}</p>
                        <p className="text-sm text-gray-500 capitalize">{job.organiser.role}</p>
                        {job.organiser.city && (
                          <p className="text-sm text-gray-500">{job.organiser.city}</p>
                        )}
                      </div>
                    </div>
                    {/* Message About Job Button */}
                    {user && job.organiser.id !== user.id && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          onClose()
                          // Navigate to messages with job context
                          navigate('/messages', {
                            state: {
                              openConversationWithUserId: job.organiser.id,
                              jobContext: {
                                id: job.id,
                                title: job.title,
                                location: job.location,
                                event_type: job.event_type,
                                start_date: job.start_date,
                                organiser: {
                                  id: job.organiser.id,
                                  display_name: job.organiser.display_name,
                                  avatar_url: job.organiser.avatar_url
                                }
                              }
                            }
                          })
                        }}
                        className="flex items-center gap-2"
                      >
                        <MessageCircle className="h-4 w-4" />
                        Message About Job
                      </Button>
                    )}
                  </div>
                  {job.organiser.bio && (
                    <p className="text-sm text-gray-600 mt-3">{job.organiser.bio}</p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Failed to load job details</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {job?.organiser?.id === user?.id && (
            <Button
              variant="outline"
              onClick={() => {
                onClose()
                navigate(`/jobs/${jobId}/applicants`)
              }}
            >
              View Applicants
            </Button>
          )}
        </div>
      </div>

      {/* Apply To Role Modal */}
      <ApplyToRoleModal
        isOpen={!!applyingToRole}
        onClose={() => setApplyingToRole(null)}
        job={job}
        role={applyingToRole}
        onApplicationSubmitted={() => {
          loadJobDetails() // Reload to get updated application count
        }}
      />

      {/* Apply On Behalf Modal (for Agents) */}
      <ApplyOnBehalfModal
        isOpen={!!applyOnBehalfRole}
        onClose={() => setApplyOnBehalfRole(null)}
        job={job}
        role={applyOnBehalfRole}
        onApplicationSubmitted={() => {
          loadJobDetails() // Reload to get updated application count
        }}
      />
    </div>
  )
}

export default JobDetailsModal
