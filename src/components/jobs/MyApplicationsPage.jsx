import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyApplications } from '../../api/jobs'
import { useAuth } from '../../App'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Calendar, MapPin, DollarSign, Briefcase, AlertCircle, Clock, CheckCircle, XCircle, Ban, Search } from 'lucide-react'
import FilterBar from '../ui/FilterBar'

const MyApplicationsPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadApplications()
  }, [])

  const loadApplications = async () => {
    setLoading(true)
    const result = await getMyApplications()
    if (result.success) {
      setApplications(result.data)
    } else {
      console.error('Error loading applications:', result.error)
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
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-700">Pending</Badge>
      case 'selected':
        return <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-700">Selected</Badge>
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-700">Not Selected</Badge>
      case 'withdrawn':
        return <Badge variant="outline" className="bg-gray-50 text-gray-800 border-gray-200 dark:bg-gray-700/50 dark:text-gray-300 dark:border-gray-600">Withdrawn</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    selected: applications.filter(a => a.status === 'selected').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
    withdrawn: applications.filter(a => a.status === 'withdrawn').length
  }

  // Filter applications by status and search
  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      // Status filter
      if (filter !== 'all' && app.status !== filter) {
        return false
      }
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          app.job?.title?.toLowerCase().includes(query) ||
          app.job?.location?.toLowerCase().includes(query) ||
          app.role?.role_title?.toLowerCase().includes(query) ||
          app.cover_letter?.toLowerCase().includes(query)
        )
      }
      return true
    })
  }, [applications, filter, searchQuery])

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
        { value: 'pending', label: 'Pending', icon: Clock, count: stats.pending },
        { value: 'selected', label: 'Selected', icon: CheckCircle, count: stats.selected },
        { value: 'rejected', label: 'Not Selected', icon: XCircle, count: stats.rejected },
        { value: 'withdrawn', label: 'Withdrawn', icon: Ban, count: stats.withdrawn }
      ]
    }
  ]

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">Loading your applications...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Applications</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Track all your job applications in one place
          </p>
        </div>
        <Button onClick={() => navigate('/jobs')}>
          <Search className="h-4 w-4 mr-2" />
          Browse Jobs
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
          <p className="text-xs text-gray-600 dark:text-gray-400">Total</p>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-yellow-200 dark:border-yellow-700 rounded-xl p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-yellow-800 dark:text-yellow-400">{stats.pending}</p>
          <p className="text-xs text-yellow-700 dark:text-yellow-500">Pending</p>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-green-200 dark:border-green-700 rounded-xl p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-green-800 dark:text-green-400">{stats.selected}</p>
          <p className="text-xs text-green-700 dark:text-green-500">Selected</p>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-red-200 dark:border-red-700 rounded-xl p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
              <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-red-800 dark:text-red-400">{stats.rejected}</p>
          <p className="text-xs text-red-700 dark:text-red-500">Not Selected</p>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <Ban className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">{stats.withdrawn}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Withdrawn</p>
        </div>
      </div>

      {/* Modern Filter Bar */}
      <FilterBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search applications by job title, role, or location..."
        filters={filterConfig}
        onClearAll={clearAllFilters}
        resultCount={filteredApplications.length}
        resultLabel="application"
        showActivePills={true}
      />

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {filter === 'all' && !searchQuery ? 'No applications yet' : 'No matching applications'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {filter === 'all' && !searchQuery
              ? 'Start applying to jobs to see your applications here'
              : 'Try adjusting your filters or search'
            }
          </p>
          {filter === 'all' && !searchQuery && (
            <Button onClick={() => navigate('/jobs')}>
              <Search className="h-4 w-4 mr-2" />
              Browse Jobs
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((application) => (
            <div
              key={application.id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md transition-all p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {application.job?.title}
                    </h3>
                    {getStatusBadge(application.status)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Briefcase className="h-4 w-4" />
                    <span>Applied for: <span className="font-medium">{application.role?.role_title}</span></span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                {/* Location */}
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{application.job?.location || 'Location TBD'}</span>
                </div>

                {/* Event Date */}
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(application.job?.start_date)}</span>
                </div>

                {/* Budget */}
                {application.role?.budget && (
                  <div className="flex items-center gap-1 font-semibold text-green-600 dark:text-green-400">
                    <DollarSign className="h-4 w-4" />
                    <span>{formatCurrency(application.role.budget)}</span>
                  </div>
                )}
              </div>

              {/* Application Details */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your Cover Letter:</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">{application.cover_letter}</p>
                {application.proposed_rate && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    <span className="font-medium">Your Proposed Rate:</span> {formatCurrency(application.proposed_rate)}
                  </p>
                )}
              </div>

              {/* Footer */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Applied on {formatDate(application.created_at)}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/jobs')}
                >
                  View Job
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyApplicationsPage
