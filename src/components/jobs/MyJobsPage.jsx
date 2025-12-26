import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { getJobPostings } from '../../api/jobs'
import { useAuth } from '../../App'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Calendar, MapPin, DollarSign, Users, AlertCircle, Plus, Briefcase, CheckCircle, XCircle, Clock, PlayCircle } from 'lucide-react'
import FilterBar from '../ui/FilterBar'

const MyJobsPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadJobs()
  }, [])

  const loadJobs = async () => {
    setLoading(true)
    const result = await getJobPostings()
    if (result.success) {
      // Filter only jobs created by this user
      const myJobs = result.data.filter(job => job.organiser_id === user.id)
      setJobs(myJobs)
    }
    setLoading(false)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
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
        return <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-700">Open</Badge>
      case 'in_progress':
        return <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-700">In Progress</Badge>
      case 'filled':
        return <Badge variant="outline" className="bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-700">Filled</Badge>
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-700">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Get status counts
  const getStatusCount = (status) => {
    return jobs.filter(j => j.status === status).length
  }

  const stats = {
    total: jobs.length,
    open: jobs.filter(j => j.status === 'open').length,
    filled: jobs.filter(j => j.status === 'filled').length,
    cancelled: jobs.filter(j => j.status === 'cancelled').length,
    in_progress: jobs.filter(j => j.status === 'in_progress').length
  }

  // Filter jobs by status and search
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      // Status filter
      if (filter !== 'all' && job.status !== filter) {
        return false
      }
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          job.title?.toLowerCase().includes(query) ||
          job.description?.toLowerCase().includes(query) ||
          job.location?.toLowerCase().includes(query)
        )
      }
      return true
    })
  }, [jobs, filter, searchQuery])

  // Clear all filters
  const clearAllFilters = () => {
    setFilter('all')
    setSearchQuery('')
  }

  // Filter configuration for FilterBar
  const filterConfig = [
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      value: filter,
      onChange: setFilter,
      icon: Clock,
      options: [
        { value: 'all', label: 'All Status', count: stats.total },
        { value: 'open', label: 'Open', icon: CheckCircle, count: stats.open },
        { value: 'in_progress', label: 'In Progress', icon: PlayCircle, count: stats.in_progress },
        { value: 'filled', label: 'Filled', icon: Users, count: stats.filled },
        { value: 'cancelled', label: 'Cancelled', icon: XCircle, count: stats.cancelled }
      ]
    }
  ]

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">Loading your jobs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Job Postings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your job postings and review applicants
          </p>
        </div>
        <Button onClick={() => navigate('/jobs/create')}>
          <Plus className="h-4 w-4 mr-2" />
          Post New Job
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Total Jobs</p>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-green-200 dark:border-green-700 rounded-xl p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-green-800 dark:text-green-400">{stats.open}</p>
          <p className="text-xs text-green-700 dark:text-green-500">Open</p>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 rounded-xl p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <PlayCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-blue-800 dark:text-blue-400">{stats.in_progress}</p>
          <p className="text-xs text-blue-700 dark:text-blue-500">In Progress</p>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-700 rounded-xl p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-purple-800 dark:text-purple-400">{stats.filled}</p>
          <p className="text-xs text-purple-700 dark:text-purple-500">Filled</p>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-red-200 dark:border-red-700 rounded-xl p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
              <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-red-800 dark:text-red-400">{stats.cancelled}</p>
          <p className="text-xs text-red-700 dark:text-red-500">Cancelled</p>
        </div>
      </div>

      {/* Modern Filter Bar */}
      <FilterBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search your jobs by title, description, or location..."
        filters={filterConfig}
        onClearAll={clearAllFilters}
        resultCount={filteredJobs.length}
        resultLabel="job"
        showActivePills={true}
      />

      {/* Jobs List */}
      {filteredJobs.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {filter === 'all' && !searchQuery ? 'No jobs posted yet' : 'No matching jobs'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {filter === 'all' && !searchQuery
              ? 'Start by posting your first job to find great people for your events'
              : 'Try adjusting your filters or search to find jobs'
            }
          </p>
          {filter === 'all' && !searchQuery && (
            <Button onClick={() => navigate('/jobs/create')}>
              <Plus className="h-4 w-4 mr-2" />
              Post Your First Job
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md transition-all p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {job.title}
                    </h3>
                    {getStatusBadge(job.status)}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 line-clamp-2">{job.description}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                {/* Location */}
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{job.location || 'Location TBD'}</span>
                </div>

                {/* Event Date */}
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(job.start_date)}</span>
                </div>

                {/* Budget */}
                {job.total_budget && (
                  <div className="flex items-center gap-1 font-semibold text-green-600 dark:text-green-400">
                    <DollarSign className="h-4 w-4" />
                    <span>{formatCurrency(job.total_budget)}</span>
                  </div>
                )}

                {/* Roles */}
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{job.roles?.length} {job.roles?.length === 1 ? 'role' : 'roles'}</span>
                </div>
              </div>

              {/* Application Count */}
              {job.application_count > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    <span className="font-semibold">{job.application_count}</span> {job.application_count === 1 ? 'application' : 'applications'} received
                  </p>
                </div>
              )}

              {/* Footer */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Posted on {formatDate(job.created_at)}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/jobs/${job.id}/applicants`)}
                  >
                    View Applicants
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/jobs/${job.id}`)}
                  >
                    View Job
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyJobsPage
