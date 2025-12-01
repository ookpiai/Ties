import { useState, useEffect } from 'react'
import { getJobPostings } from '../../api/jobs'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Calendar, MapPin, DollarSign, Users, Briefcase, Building2, Package, Plus, Edit, Eye, AlertCircle } from 'lucide-react'
import { useAuth } from '../../App'
import { useNavigate } from 'react-router-dom'
import JobDetailsModal from './JobDetailsModal'

const JobFeedPage = () => {
  const [jobs, setJobs] = useState([])
  const [myJobs, setMyJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [myJobsLoading, setMyJobsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('find')
  const [selectedJobId, setSelectedJobId] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [myJobsFilter, setMyJobsFilter] = useState('all') // 'all', 'open', 'in_progress', 'filled'
  const [filters, setFilters] = useState({
    role_type: '',
    location: '',
    status: 'open'
  })
  const { user } = useAuth()
  const navigate = useNavigate()

  const openJobDetails = (jobId) => {
    setSelectedJobId(jobId)
    setIsModalOpen(true)
  }

  const closeJobDetails = () => {
    setIsModalOpen(false)
    setSelectedJobId(null)
  }

  useEffect(() => {
    loadJobs()
  }, [filters])

  useEffect(() => {
    if (user) {
      loadMyJobs()
    }
  }, [user])

  const loadJobs = async () => {
    setLoading(true)
    const result = await getJobPostings(filters)
    if (result.success) {
      setJobs(result.data)
    } else {
      console.error('Error loading jobs:', result.error)
    }
    setLoading(false)
  }

  const loadMyJobs = async () => {
    setMyJobsLoading(true)
    const result = await getJobPostings() // Get all jobs
    if (result.success) {
      // Filter to only jobs created by this user
      const userJobs = result.data.filter(job => job.organiser_id === user.id)
      setMyJobs(userJobs)
    } else {
      console.error('Error loading my jobs:', result.error)
    }
    setMyJobsLoading(false)
  }

  // Stats for my jobs
  const myJobsStats = {
    total: myJobs.length,
    open: myJobs.filter(j => j.status === 'open').length,
    in_progress: myJobs.filter(j => j.status === 'in_progress').length,
    filled: myJobs.filter(j => j.status === 'filled').length
  }

  // Filter my jobs based on selected filter
  const filteredMyJobs = myJobs.filter(job => {
    if (myJobsFilter === 'all') return true
    return job.status === myJobsFilter
  })

  const getRoleIcon = (roleType) => {
    switch (roleType) {
      case 'freelancer':
        return <Users className="h-4 w-4" />
      case 'venue':
        return <Building2 className="h-4 w-4" />
      case 'vendor':
        return <Package className="h-4 w-4" />
      default:
        return <Briefcase className="h-4 w-4" />
    }
  }

  const getRoleBadgeColor = (roleType) => {
    switch (roleType) {
      case 'freelancer':
        return 'bg-purple-100 text-purple-800'
      case 'venue':
        return 'bg-green-100 text-green-800'
      case 'vendor':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-AU', {
      month: 'short',
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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'open':
        return <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">Open</Badge>
      case 'in_progress':
        return <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">In Progress</Badge>
      case 'filled':
        return <Badge variant="outline" className="bg-purple-50 text-purple-800 border-purple-200">Filled</Badge>
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-800 border-red-200">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Job Board</h1>
          <p className="text-gray-600 mt-2">
            Find opportunities or manage your job postings
          </p>
        </div>
        <Button onClick={() => navigate('/jobs/create')}>
          <Plus className="h-4 w-4 mr-2" />
          Post New Job
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="find" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Find Jobs
          </TabsTrigger>
          <TabsTrigger value="my-jobs" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            My Posted Jobs
            {myJobsStats.total > 0 && (
              <Badge variant="secondary" className="ml-1">
                {myJobsStats.total}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* FIND JOBS TAB */}
        <TabsContent value="find">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="font-semibold mb-4">Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Role Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role Type
                </label>
                <select
                  value={filters.role_type}
                  onChange={(e) => setFilters({ ...filters, role_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">All Roles</option>
                  <option value="freelancer">Freelancer</option>
                  <option value="venue">Venue</option>
                  <option value="vendor">Vendor</option>
                </select>
              </div>

              {/* Location Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  placeholder="Search by location..."
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="filled">Filled</option>
                  <option value="">All</option>
                </select>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading jobs...</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && jobs.length === 0 && (
            <div className="text-center py-12">
              <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs found</h3>
              <p className="text-gray-600">
                {filters.role_type || filters.location
                  ? 'Try adjusting your filters'
                  : 'Be the first to post a job!'}
              </p>
            </div>
          )}

          {/* Job Feed */}
          {!loading && jobs.length > 0 && (
            <div className="max-w-5xl mx-auto space-y-4">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => openJobDetails(job.id)}
                >
                  <div className="p-6">
                    {/* Header Row */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900 hover:text-[#E03131]">
                            {job.title}
                          </h3>
                          <Badge variant={job.status === 'open' ? 'default' : 'secondary'}>
                            {job.status}
                          </Badge>
                        </div>
                        <p className="text-gray-600 line-clamp-2 mb-3">
                          {job.description}
                        </p>
                      </div>
                    </div>

                    {/* Info Grid */}
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600 mb-4">
                      {job.total_budget && (
                        <div className="flex items-center gap-1 font-semibold text-green-600">
                          <DollarSign className="h-4 w-4" />
                          <span>{formatCurrency(job.total_budget)}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{job.location || 'Location TBD'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(job.start_date)}</span>
                      </div>
                      {job.event_type && (
                        <span className="capitalize text-gray-500">
                          {job.event_type.replace('_', ' ')}
                        </span>
                      )}
                    </div>

                    {/* Roles Badges */}
                    <div className="flex items-center gap-2 flex-wrap mb-4">
                      <span className="text-sm font-medium text-gray-700">
                        {job.roles?.length === 1 ? '1 role:' : `${job.roles?.length} roles:`}
                      </span>
                      {job.roles?.slice(0, 4).map((role) => {
                        const filled = role.filled_count || 0
                        const total = role.quantity || 1
                        const isFilled = filled >= total
                        return (
                          <Badge
                            key={role.id}
                            className={`${getRoleBadgeColor(role.role_type)} flex items-center gap-1 ${
                              isFilled ? 'opacity-60' : ''
                            }`}
                            variant="secondary"
                          >
                            {getRoleIcon(role.role_type)}
                            <span>{role.role_title}</span>
                            <span className="text-xs ml-1">({filled}/{total})</span>
                          </Badge>
                        )
                      })}
                      {job.roles?.length > 4 && (
                        <Badge variant="outline">+{job.roles.length - 4} more</Badge>
                      )}
                    </div>

                    {/* Footer Row */}
                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      {job.organiser && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <img
                            src={job.organiser.avatar_url || '/default-avatar.png'}
                            alt={job.organiser.display_name}
                            className="h-6 w-6 rounded-full"
                          />
                          <span>Posted by {job.organiser.display_name}</span>
                        </div>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          openJobDetails(job.id)
                        }}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* MY POSTED JOBS TAB */}
        <TabsContent value="my-jobs">
          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-600">Total Jobs</p>
              <p className="text-2xl font-bold text-gray-900">{myJobsStats.total}</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-700">Open</p>
              <p className="text-2xl font-bold text-green-800">{myJobsStats.open}</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-700">In Progress</p>
              <p className="text-2xl font-bold text-blue-800">{myJobsStats.in_progress}</p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-sm text-purple-700">Filled</p>
              <p className="text-2xl font-bold text-purple-800">{myJobsStats.filled}</p>
            </div>
          </div>

          {/* Status Filter Pills */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={myJobsFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMyJobsFilter('all')}
              >
                All ({myJobsStats.total})
              </Button>
              <Button
                variant={myJobsFilter === 'open' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMyJobsFilter('open')}
              >
                Open ({myJobsStats.open})
              </Button>
              <Button
                variant={myJobsFilter === 'in_progress' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMyJobsFilter('in_progress')}
              >
                In Progress ({myJobsStats.in_progress})
              </Button>
              <Button
                variant={myJobsFilter === 'filled' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMyJobsFilter('filled')}
              >
                Filled ({myJobsStats.filled})
              </Button>
            </div>
          </div>

          {/* Loading State */}
          {myJobsLoading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading your jobs...</p>
            </div>
          )}

          {/* Empty State */}
          {!myJobsLoading && filteredMyJobs.length === 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {myJobsFilter === 'all' ? 'No jobs posted yet' : `No ${myJobsFilter.replace('_', ' ')} jobs`}
              </h3>
              <p className="text-gray-600 mb-4">
                {myJobsFilter === 'all'
                  ? 'Start by posting your first job to find great people for your events'
                  : `You don't have any ${myJobsFilter.replace('_', ' ')} jobs at the moment`
                }
              </p>
              {myJobsFilter === 'all' && (
                <Button onClick={() => navigate('/jobs/create')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Post Your First Job
                </Button>
              )}
            </div>
          )}

          {/* My Jobs List */}
          {!myJobsLoading && filteredMyJobs.length > 0 && (
            <div className="space-y-4">
              {filteredMyJobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {job.title}
                        </h3>
                        {getStatusBadge(job.status)}
                      </div>
                      <p className="text-gray-600 line-clamp-2">{job.description}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{job.location || 'Location TBD'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(job.start_date)}</span>
                    </div>
                    {job.total_budget && (
                      <div className="flex items-center gap-1 font-semibold text-green-600">
                        <DollarSign className="h-4 w-4" />
                        <span>{formatCurrency(job.total_budget)}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{job.roles?.length} {job.roles?.length === 1 ? 'role' : 'roles'}</span>
                    </div>
                  </div>

                  {/* Roles Summary */}
                  <div className="flex items-center gap-2 flex-wrap mb-4">
                    {job.roles?.slice(0, 3).map((role) => {
                      const filled = role.filled_count || 0
                      const total = role.quantity || 1
                      return (
                        <Badge
                          key={role.id}
                          className={`${getRoleBadgeColor(role.role_type)} flex items-center gap-1`}
                          variant="secondary"
                        >
                          {getRoleIcon(role.role_type)}
                          <span>{role.role_title}</span>
                          <span className="text-xs ml-1">({filled}/{total})</span>
                        </Badge>
                      )
                    })}
                    {job.roles?.length > 3 && (
                      <Badge variant="outline">+{job.roles.length - 3} more</Badge>
                    )}
                  </div>

                  {/* Application Count */}
                  {job.application_count > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                      <p className="text-sm text-blue-800">
                        <span className="font-semibold">{job.application_count}</span> {job.application_count === 1 ? 'application' : 'applications'} received
                      </p>
                    </div>
                  )}

                  {/* Footer with Actions */}
                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      Posted on {formatDate(job.created_at)}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openJobDetails(job.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/jobs/${job.id}/applicants`)}
                      >
                        <Users className="h-4 w-4 mr-1" />
                        Applicants
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => navigate(`/jobs/${job.id}/edit`)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Job Details Modal */}
      <JobDetailsModal
        jobId={selectedJobId}
        isOpen={isModalOpen}
        onClose={closeJobDetails}
      />
    </div>
  )
}

export default JobFeedPage
