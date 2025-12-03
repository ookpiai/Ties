import { useState, useEffect } from 'react'
import { getJobPostings } from '../../api/jobs'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Calendar, MapPin, DollarSign, Users, Briefcase, Building2, Package, Plus, Search } from 'lucide-react'
import { useAuth } from '../../App'
import { useNavigate } from 'react-router-dom'
import JobDetailsModal from './JobDetailsModal'
import FilterBar from '../ui/FilterBar'

const JobFeedPage = () => {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedJobId, setSelectedJobId] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
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

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery('')
    setFilters({
      role_type: '',
      location: '',
      status: 'open'
    })
  }

  // Filter jobs by search query
  const filteredJobs = jobs.filter(job => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      job.title?.toLowerCase().includes(query) ||
      job.description?.toLowerCase().includes(query) ||
      job.location?.toLowerCase().includes(query)
    )
  })

  // Filter configuration for FilterBar
  const filterConfig = [
    {
      key: 'role_type',
      label: 'Role Type',
      type: 'select',
      value: filters.role_type,
      onChange: (value) => setFilters({ ...filters, role_type: value }),
      icon: Users,
      options: [
        { value: '', label: 'All Roles' },
        { value: 'freelancer', label: 'Freelancer', icon: Users },
        { value: 'venue', label: 'Venue', icon: Building2 },
        { value: 'vendor', label: 'Vendor', icon: Package }
      ]
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      value: filters.status,
      onChange: (value) => setFilters({ ...filters, status: value }),
      icon: Briefcase,
      options: [
        { value: 'open', label: 'Open' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'filled', label: 'Filled' },
        { value: '', label: 'All Status' }
      ]
    },
    {
      key: 'location',
      label: 'Location',
      type: 'text',
      value: filters.location,
      onChange: (value) => setFilters({ ...filters, location: value }),
      icon: MapPin,
      placeholder: 'Search by location...'
    }
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Find Jobs</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Browse available opportunities and apply to jobs that match your skills
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/studio')}>
            <Briefcase className="h-4 w-4 mr-2" />
            My Posted Jobs
          </Button>
          <Button onClick={() => navigate('/jobs/create')}>
            <Plus className="h-4 w-4 mr-2" />
            Post New Job
          </Button>
        </div>
      </div>

      {/* Modern Filter Bar */}
      <FilterBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search jobs by title, description, or location..."
        filters={filterConfig}
        onClearAll={clearAllFilters}
        resultCount={filteredJobs.length}
        resultLabel="job"
        showActivePills={true}
      />

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading jobs...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredJobs.length === 0 && (
        <div className="text-center py-12">
          <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No jobs found</h3>
          <p className="text-gray-600 dark:text-gray-400">
            {filters.role_type || filters.location || searchQuery
              ? 'Try adjusting your filters or search'
              : 'Be the first to post a job!'}
          </p>
        </div>
      )}

      {/* Job Feed */}
      {!loading && filteredJobs.length > 0 && (
        <div className="max-w-5xl mx-auto space-y-4">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md transition-all cursor-pointer"
              onClick={() => openJobDetails(job.id)}
            >
              <div className="p-6">
                {/* Header Row */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white hover:text-[#E03131]">
                        {job.title}
                      </h3>
                      <Badge variant={job.status === 'open' ? 'default' : 'secondary'}>
                        {job.status}
                      </Badge>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                      {job.description}
                    </p>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
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
                    <span className="capitalize text-gray-500 dark:text-gray-500">
                      {job.event_type.replace('_', ' ')}
                    </span>
                  )}
                </div>

                {/* Roles Badges */}
                <div className="flex items-center gap-2 flex-wrap mb-4">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
                <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-700">
                  {job.organiser && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
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
