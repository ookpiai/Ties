import { useState, useEffect } from 'react'
import { getJobPostings } from '../../api/jobs'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Calendar, MapPin, DollarSign, Users, Briefcase, Building2, Package } from 'lucide-react'
import { useAuth } from '../../App'
import { useNavigate } from 'react-router-dom'

const JobFeedPage = () => {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    role_type: '',
    location: '',
    status: 'open'
  })
  const { user } = useAuth()
  const navigate = useNavigate()

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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Job Board</h1>
          <p className="text-gray-600 mt-2">
            Find opportunities or post jobs for your events
          </p>
        </div>
        {user?.role === 'organiser' && (
          <Button
            onClick={() => navigate('/jobs/create')}
            size="lg"
          >
            Post a Job
          </Button>
        )}
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

      {/* Job Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map((job) => (
          <Card key={job.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start mb-2">
                <CardTitle className="text-lg">{job.title}</CardTitle>
                <Badge variant={job.status === 'open' ? 'default' : 'secondary'}>
                  {job.status}
                </Badge>
              </div>
              <CardDescription className="line-clamp-2">
                {job.description}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {/* Location */}
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <MapPin className="h-4 w-4 mr-2" />
                {job.location || 'Location TBD'}
              </div>

              {/* Date */}
              <div className="flex items-center text-sm text-gray-600 mb-3">
                <Calendar className="h-4 w-4 mr-2" />
                {formatDate(job.start_date)}
                {job.start_date !== job.end_date && ` - ${formatDate(job.end_date)}`}
              </div>

              {/* Total Budget */}
              {job.total_budget && (
                <div className="flex items-center text-sm font-semibold text-green-600 mb-3">
                  <DollarSign className="h-4 w-4 mr-1" />
                  {formatCurrency(job.total_budget)} total
                </div>
              )}

              {/* Roles */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">
                  {job.roles?.length === 1 ? '1 role needed:' : `${job.roles?.length} roles needed:`}
                </p>
                <div className="flex flex-wrap gap-2">
                  {job.roles?.slice(0, 3).map((role) => (
                    <Badge
                      key={role.id}
                      className={`${getRoleBadgeColor(role.role_type)} flex items-center gap-1`}
                      variant="secondary"
                    >
                      {getRoleIcon(role.role_type)}
                      {role.role_title}
                      {role.budget && ` • ${formatCurrency(role.budget)}`}
                    </Badge>
                  ))}
                  {job.roles?.length > 3 && (
                    <Badge variant="outline">
                      +{job.roles.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>

              {/* Posted By */}
              {job.organiser && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center text-sm text-gray-600">
                    <img
                      src={job.organiser.avatar_url || '/default-avatar.png'}
                      alt={job.organiser.display_name}
                      className="h-6 w-6 rounded-full mr-2"
                    />
                    Posted by {job.organiser.display_name}
                  </div>
                </div>
              )}
            </CardContent>

            <CardFooter>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => navigate(`/jobs/${job.id}`)}
              >
                View Details
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default JobFeedPage
