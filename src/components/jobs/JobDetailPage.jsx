/**
 * Job Detail Page
 * Shows detailed view of a single job posting
 */

import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  ArrowLeft,
  Calendar,
  MapPin,
  DollarSign,
  Users,
  Clock,
  Briefcase,
  User,
  Building,
  Truck,
  ExternalLink,
  MessageCircle,
  CheckCircle,
  Loader2
} from 'lucide-react'
import { useAuth } from '../../App'
import { getJobPostingById, applyToJobRole } from '../../api/jobs'
import { useToast } from '@/hooks/use-toast'

const JobDetailPage = () => {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [applyingToRole, setApplyingToRole] = useState(null)

  useEffect(() => {
    if (jobId) {
      loadJob()
    }
  }, [jobId])

  const loadJob = async () => {
    setLoading(true)
    try {
      const result = await getJobPostingById(jobId)
      if (result.success) {
        setJob(result.data)
      } else {
        setError(result.error || 'Failed to load job')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getRoleIcon = (roleType) => {
    switch (roleType) {
      case 'freelancer': return User
      case 'venue': return Building
      case 'vendor': return Truck
      default: return Briefcase
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
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const handleApply = async (roleId) => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to apply for this role.',
        variant: 'destructive'
      })
      return
    }

    setApplyingToRole(roleId)
    try {
      const result = await applyToJobRole(jobId, roleId, {})
      if (result.success) {
        toast({
          title: 'Application submitted!',
          description: 'The organizer will review your application.'
        })
        loadJob() // Refresh to show updated application state
      } else {
        toast({
          title: 'Failed to apply',
          description: result.error,
          variant: 'destructive'
        })
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive'
      })
    } finally {
      setApplyingToRole(null)
    }
  }

  const isOrganizer = job?.organiser_id === user?.id
  const hasAppliedToRole = (roleId) => {
    return job?.applications?.some(app =>
      app.applicant_id === user?.id && app.job_role_id === roleId
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0B0B0B]">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-[#E03131] mx-auto" />
            <p className="text-gray-500 dark:text-gray-400 mt-4">Loading job details...</p>
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
            <Button onClick={() => navigate('/jobs')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0B0B]">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Job Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {job.title}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                  {job.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {job.location}
                    </span>
                  )}
                  {job.event_type && (
                    <Badge variant="outline">{job.event_type}</Badge>
                  )}
                </div>
              </div>
              <Badge
                variant="outline"
                className={
                  job.status === 'open'
                    ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-gray-100 text-gray-600'
                }
              >
                {job.status}
              </Badge>
            </div>

            {/* Organizer */}
            {job.organiser && (
              <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Avatar>
                  <AvatarImage src={job.organiser.avatar_url} />
                  <AvatarFallback>{job.organiser.display_name?.[0] || 'O'}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {job.organiser.display_name}
                  </p>
                  <p className="text-sm text-gray-500">Organizer</p>
                </div>
                {!isOrganizer && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-auto"
                    onClick={() => navigate('/messages')}
                  >
                    <MessageCircle className="h-4 w-4 mr-1" />
                    Message
                  </Button>
                )}
              </div>
            )}

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Start Date</p>
                  <p className="font-medium">{formatDate(job.start_date)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">End Date</p>
                  <p className="font-medium">{formatDate(job.end_date)}</p>
                </div>
              </div>
            </div>

            {/* Budget */}
            {job.total_budget && (
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="h-5 w-5 text-green-500" />
                <span className="text-lg font-semibold text-green-600">
                  {formatCurrency(job.total_budget)} total budget
                </span>
              </div>
            )}

            {/* Description */}
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                {job.description}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Roles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Roles ({job.roles?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {job.roles && job.roles.length > 0 ? (
              <div className="space-y-4">
                {job.roles.map((role) => {
                  const RoleIcon = getRoleIcon(role.role_type)
                  const applied = hasAppliedToRole(role.id)
                  const isFilled = role.filled_count >= (role.quantity || 1)

                  return (
                    <div
                      key={role.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                            <RoleIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {role.role_title}
                            </h4>
                            <p className="text-sm text-gray-500 capitalize">{role.role_type}</p>
                            {role.role_description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {role.role_description}
                              </p>
                            )}
                            <div className="flex items-center gap-3 mt-2 text-sm">
                              {role.budget && (
                                <span className="text-green-600 font-medium">
                                  {formatCurrency(role.budget)}
                                </span>
                              )}
                              <span className="text-gray-500">
                                {role.filled_count || 0}/{role.quantity || 1} filled
                              </span>
                              {role.application_count > 0 && (
                                <span className="text-gray-500">
                                  {role.application_count} applicant(s)
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Apply Button */}
                        {!isOrganizer && (
                          <div>
                            {applied ? (
                              <Badge className="bg-green-50 text-green-700 border-green-200">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Applied
                              </Badge>
                            ) : isFilled ? (
                              <Badge variant="secondary">Filled</Badge>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => handleApply(role.id)}
                                disabled={applyingToRole === role.id}
                              >
                                {applyingToRole === role.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                ) : null}
                                Apply
                              </Button>
                            )}
                          </div>
                        )}

                        {/* Organizer Actions */}
                        {isOrganizer && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/jobs/${jobId}/applicants`)}
                          >
                            View Applicants
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No roles defined for this job.</p>
            )}
          </CardContent>
        </Card>

        {/* Organizer Actions */}
        {isOrganizer && (
          <Card className="mt-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Manage Your Job</h3>
                  <p className="text-sm text-gray-500">View and manage applicants for this posting</p>
                </div>
                <Button onClick={() => navigate(`/jobs/${jobId}/applicants`)}>
                  <Users className="h-4 w-4 mr-2" />
                  View All Applicants
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default JobDetailPage
