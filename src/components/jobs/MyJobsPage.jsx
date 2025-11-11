import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getJobPostings } from '../../api/jobs'
import { useAuth } from '../../App'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Calendar, MapPin, DollarSign, Users, AlertCircle, Plus } from 'lucide-react'

const MyJobsPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // 'all', 'open', 'filled', 'cancelled'

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

  const filteredJobs = jobs.filter(job => {
    if (filter === 'all') return true
    return job.status === filter
  })

  const stats = {
    total: jobs.length,
    open: jobs.filter(j => j.status === 'open').length,
    filled: jobs.filter(j => j.status === 'filled').length,
    cancelled: jobs.filter(j => j.status === 'cancelled').length
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-gray-500">Loading your jobs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Job Postings</h1>
          <p className="text-gray-600 mt-2">
            Manage your job postings and review applicants
          </p>
        </div>
        <Button onClick={() => navigate('/create')}>
          <Plus className="h-4 w-4 mr-2" />
          Post New Job
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">Total Jobs</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-700">Open</p>
          <p className="text-2xl font-bold text-green-800">{stats.open}</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-sm text-purple-700">Filled</p>
          <p className="text-2xl font-bold text-purple-800">{stats.filled}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">Cancelled</p>
          <p className="text-2xl font-bold text-red-800">{stats.cancelled}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All ({stats.total})
          </Button>
          <Button
            variant={filter === 'open' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('open')}
          >
            Open ({stats.open})
          </Button>
          <Button
            variant={filter === 'filled' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('filled')}
          >
            Filled ({stats.filled})
          </Button>
          <Button
            variant={filter === 'cancelled' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('cancelled')}
          >
            Cancelled ({stats.cancelled})
          </Button>
        </div>
      </div>

      {/* Jobs List */}
      {filteredJobs.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {filter === 'all' ? 'No jobs posted yet' : `No ${filter} jobs`}
          </h3>
          <p className="text-gray-600 mb-4">
            {filter === 'all'
              ? 'Start by posting your first job to find great people for your events'
              : `You don't have any ${filter} jobs at the moment`
            }
          </p>
          {filter === 'all' && (
            <Button onClick={() => navigate('/create')}>
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
                  <div className="flex items-center gap-1 font-semibold text-green-600">
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
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-blue-800">
                    <span className="font-semibold">{job.application_count}</span> {job.application_count === 1 ? 'application' : 'applications'} received
                  </p>
                </div>
              )}

              {/* Footer */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500">
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
                    onClick={() => navigate('/jobs')}
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
