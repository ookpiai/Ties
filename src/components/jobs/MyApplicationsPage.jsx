import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyApplications } from '../../api/jobs'
import { useAuth } from '../../App'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Calendar, MapPin, DollarSign, Briefcase, AlertCircle } from 'lucide-react'

const MyApplicationsPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // 'all', 'pending', 'selected', 'rejected'

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
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">Pending</Badge>
      case 'selected':
        return <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">✓ Selected</Badge>
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-800 border-red-200">Not Selected</Badge>
      case 'withdrawn':
        return <Badge variant="outline" className="bg-gray-50 text-gray-800 border-gray-200">Withdrawn</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true
    return app.status === filter
  })

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    selected: applications.filter(a => a.status === 'selected').length,
    rejected: applications.filter(a => a.status === 'rejected').length
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-gray-500">Loading your applications...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
        <p className="text-gray-600 mt-2">
          Track all your job applications in one place
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">Total</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-700">Pending</p>
          <p className="text-2xl font-bold text-yellow-800">{stats.pending}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-700">Selected</p>
          <p className="text-2xl font-bold text-green-800">{stats.selected}</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">Not Selected</p>
          <p className="text-2xl font-bold text-gray-700">{stats.rejected}</p>
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
            variant={filter === 'pending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('pending')}
          >
            Pending ({stats.pending})
          </Button>
          <Button
            variant={filter === 'selected' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('selected')}
          >
            Selected ({stats.selected})
          </Button>
          <Button
            variant={filter === 'rejected' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('rejected')}
          >
            Not Selected ({stats.rejected})
          </Button>
        </div>
      </div>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {filter === 'all' ? 'No applications yet' : `No ${filter} applications`}
          </h3>
          <p className="text-gray-600 mb-4">
            {filter === 'all'
              ? 'Start applying to jobs to see your applications here'
              : `You don't have any ${filter} applications at the moment`
            }
          </p>
          {filter === 'all' && (
            <Button onClick={() => navigate('/jobs')}>
              Browse Jobs
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((application) => (
            <div
              key={application.id}
              className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {application.job?.title}
                    </h3>
                    {getStatusBadge(application.status)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Briefcase className="h-4 w-4" />
                    <span>Applied for: <span className="font-medium">{application.role?.role_title}</span></span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600 mb-4">
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
                  <div className="flex items-center gap-1 font-semibold text-green-600">
                    <DollarSign className="h-4 w-4" />
                    <span>{formatCurrency(application.role.budget)}</span>
                  </div>
                )}
              </div>

              {/* Application Details */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Your Cover Letter:</p>
                <p className="text-sm text-gray-600 line-clamp-3">{application.cover_letter}</p>
                {application.proposed_rate && (
                  <p className="text-sm text-gray-600 mt-2">
                    <span className="font-medium">Your Proposed Rate:</span> {formatCurrency(application.proposed_rate)}
                  </p>
                )}
              </div>

              {/* Footer */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500">
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
