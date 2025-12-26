import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getJobPostings, getRecommendedJobs, getJobRoleTypeForUser } from '../../api/jobs'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import {
  Calendar,
  MapPin,
  DollarSign,
  Users,
  Briefcase,
  Building2,
  Package,
  Plus,
  Search,
  Sparkles,
  Star,
  Clock,
  TrendingUp,
  AlertCircle,
  ArrowRight
} from 'lucide-react'
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
  const [activeTab, setActiveTab] = useState('for_you')
  const [filters, setFilters] = useState({
    role_type: '',
    location: '',
    status: 'open'
  })
  const { user } = useAuth()
  const navigate = useNavigate()

  // Job discovery tabs
  const discoveryTabs = [
    { id: 'for_you', label: 'For You', icon: Sparkles, description: 'Personalized recommendations' },
    { id: 'best_match', label: 'Best Match', icon: Star, description: 'Highest skill match' },
    { id: 'near_you', label: 'Near You', icon: MapPin, description: 'Jobs in your area' },
    { id: 'recent', label: 'Recent', icon: Clock, description: 'Newest postings' },
    { id: 'urgent', label: 'Urgent', icon: AlertCircle, description: 'Deadline soon' },
  ]

  // User context for personalization
  const userContext = {
    userId: user?.id,
    role: user?.role,
    specialty: user?.specialty,
    city: user?.city,
    hourlyRate: user?.hourly_rate
  }

  // Check if user has active manual filters
  const hasManualFilters = () => {
    return (
      searchQuery ||
      filters.role_type ||
      filters.location ||
      filters.status !== 'open'
    )
  }

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
  }, [filters, activeTab, user?.id])

  const loadJobs = async () => {
    setLoading(true)

    // For Organisers, redirect to My Jobs or show empty state
    if (user?.role === 'Organiser' && !hasManualFilters()) {
      setJobs([])
      setLoading(false)
      return
    }

    try {
      let result

      // Use recommendation API when on discovery tabs without manual filters
      if (!hasManualFilters()) {
        result = await getRecommendedJobs(activeTab, userContext, 40)
      } else {
        // Use standard search API when filters are applied
        result = await getJobPostings(filters)
      }

      if (result.success) {
        setJobs(result.data)
      } else {
        console.error('Error loading jobs:', result.error)
      }
    } catch (err) {
      console.error('Error loading jobs:', err)
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

  // Check if user is an Organiser
  const isOrganiser = user?.role === 'Organiser'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0B0B]">
      <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Jobs</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-xl">
            {isOrganiser
              ? 'Manage your job postings and find the perfect talent for your events.'
              : 'Find opportunities that match your skills and experience.'}
          </p>
        </div>
        <div className="flex gap-3">
          {isOrganiser ? (
            <>
              <Button variant="outline" onClick={() => navigate('/jobs/my-jobs')}>
                <Briefcase className="h-4 w-4 mr-2" />
                My Job Postings
              </Button>
              <Button onClick={() => navigate('/jobs/create')}>
                <Plus className="h-4 w-4 mr-2" />
                Post a Job
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => navigate('/jobs/my-applications')}>
                <Briefcase className="h-4 w-4 mr-2" />
                My Applications
              </Button>
              <Button variant="outline" onClick={() => navigate('/studio')}>
                <Briefcase className="h-4 w-4 mr-2" />
                Go to Studio
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Organiser Notice */}
      {isOrganiser && !hasManualFilters() && (
        <div className="mb-6 p-6 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-primary/20">
              <Briefcase className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">
                You're an Organiser
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                As an Organiser, you post jobs rather than apply to them. Use the buttons below to manage your postings or create new opportunities.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => navigate('/jobs/create')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Post a New Job
                </Button>
                <Button variant="outline" onClick={() => navigate('/jobs/my-jobs')}>
                  <ArrowRight className="h-4 w-4 mr-2" />
                  View My Job Postings
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Discovery Tabs - Only show for non-Organisers */}
      {!isOrganiser && (
        <div className="mb-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {discoveryTabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id)
                    // Clear filters when switching tabs
                    if (hasManualFilters()) {
                      clearAllFilters()
                    }
                  }}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                  title={tab.description}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Personalization Context Banner */}
      {!isOrganiser && activeTab === 'for_you' && user?.role && !hasManualFilters() && (
        <div className="mb-4 p-4 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-0.5">
                Jobs recommended for you as a {user.role}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {user.specialty
                  ? `Showing ${getJobRoleTypeForUser(user.role)} opportunities matching your ${user.specialty} specialty`
                  : `Showing ${getJobRoleTypeForUser(user.role)} opportunities based on your profile`}
                {user.city && `, prioritizing jobs near ${user.city}`}
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'near_you' && user?.city && !hasManualFilters() && !isOrganiser && (
        <div className="mb-4 p-4 rounded-xl bg-gradient-to-r from-blue-500/10 via-blue-500/5 to-transparent border border-blue-500/20">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <MapPin className="w-5 h-5 text-blue-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-0.5">
                Jobs near {user.city}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing opportunities in your local area for convenient work
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'near_you' && !user?.city && !isOrganiser && (
        <div className="mb-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/50">
              <MapPin className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-0.5">
                Location not set
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Add your city in your <Link to="/profile" className="text-primary hover:underline">profile settings</Link> to see jobs near you
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'urgent' && !isOrganiser && !hasManualFilters() && (
        <div className="mb-4 p-4 rounded-xl bg-gradient-to-r from-red-500/10 via-red-500/5 to-transparent border border-red-500/20">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-red-500/20">
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-0.5">
                Jobs with upcoming deadlines
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                These jobs need applications soon - don't miss out!
              </p>
            </div>
          </div>
        </div>
      )}

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

                {/* Recommendation Badge */}
                {job.recommendation_reason && (
                  <div className="mb-4">
                    <Badge
                      className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium ${
                        job.recommendation_reason.includes('Deadline')
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          : job.recommendation_reason.includes('Near you')
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          : job.recommendation_reason.includes('Just posted') || job.recommendation_reason.includes('Posted')
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-primary/10 text-primary dark:bg-primary/20'
                      }`}
                    >
                      {job.recommendation_reason.includes('Deadline') && <AlertCircle className="w-3 h-3" />}
                      {job.recommendation_reason.includes('Near you') && <MapPin className="w-3 h-3" />}
                      {job.recommendation_reason.includes('Just posted') && <Clock className="w-3 h-3" />}
                      {job.recommendation_reason.includes('Posted') && !job.recommendation_reason.includes('Just') && <Clock className="w-3 h-3" />}
                      {job.recommendation_reason.includes('Matches your') && <Sparkles className="w-3 h-3" />}
                      {job.recommendation_reason.includes('Good budget') && <DollarSign className="w-3 h-3" />}
                      {job.recommendation_reason}
                    </Badge>
                  </div>
                )}

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
    </div>
  )
}

export default JobFeedPage
