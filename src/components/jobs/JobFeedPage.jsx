import { useState, useEffect } from 'react'
import { getJobPostings } from '../../api/jobs'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Calendar, MapPin, DollarSign, Users, Briefcase, Building2, Package } from 'lucide-react'
import { useAuth } from '../../App'
import { useNavigate } from 'react-router-dom'
import JobDetailsModal from './JobDetailsModal'

const JobFeedPage = () => {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedJobId, setSelectedJobId] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Job Board</h1>
        <p className="text-gray-600 mt-2">
          Browse and apply to available opportunities
        </p>
      </div>

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

      {/* Job Feed - Upwork Style */}
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
                {/* Budget */}
                {job.total_budget && (
                  <div className="flex items-center gap-1 font-semibold text-green-600">
                    <DollarSign className="h-4 w-4" />
                    <span>{formatCurrency(job.total_budget)}</span>
                  </div>
                )}

                {/* Location */}
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{job.location || 'Location TBD'}</span>
                </div>

                {/* Date */}
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(job.start_date)}</span>
                </div>

                {/* Event Type */}
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
                {job.roles?.slice(0, 4).map((role) => (
                  <Badge
                    key={role.id}
                    className={`${getRoleBadgeColor(role.role_type)} flex items-center gap-1`}
                    variant="secondary"
                  >
                    {getRoleIcon(role.role_type)}
                    {role.role_title}
                  </Badge>
                ))}
                {job.roles?.length > 4 && (
                  <Badge variant="outline">
                    +{job.roles.length - 4} more
                  </Badge>
                )}
              </div>

              {/* Footer Row */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                {/* Posted By */}
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

                {/* View Details Link */}
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
