import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../App'
import { getMyAcceptedJobs, getJobPostings } from '../../api/jobs'
import {
  Plus,
  Users,
  Calendar,
  DollarSign,
  FileText,
  MessageSquare,
  Settings,
  FolderOpen,
  CheckCircle,
  Upload,
  BarChart3,
  Target,
  Zap,
  Search,
  Edit,
  MapPin,
  Briefcase,
  Eye,
  ArrowRight,
  Loader2,
  Info
} from 'lucide-react'
import { Button } from '../ui/button'

const StudioPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('my-projects')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All Status')

  // Real data states
  const [acceptedJobs, setAcceptedJobs] = useState([])
  const [myPostedJobs, setMyPostedJobs] = useState([])
  const [loading, setLoading] = useState(true)

  // Load accepted jobs and posted jobs
  useEffect(() => {
    loadData()
  }, [user?.id])

  const loadData = async () => {
    if (!user?.id) return
    setLoading(true)
    try {
      // Load jobs I've been accepted to (as a freelancer/vendor/venue)
      const acceptedResult = await getMyAcceptedJobs()
      if (acceptedResult.success) {
        setAcceptedJobs(acceptedResult.data || [])
      }

      // Load jobs I've posted (as an organiser)
      const postedResult = await getJobPostings()
      if (postedResult.success) {
        const myJobs = postedResult.data?.filter(job => job.organiser_id === user.id) || []
        setMyPostedJobs(myJobs)
      }
    } catch (error) {
      console.error('Failed to load studio data:', error)
    }
    setLoading(false)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'TBD'
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
    }).format(amount || 0)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      case 'filled': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
      case 'completed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  // Filter accepted jobs based on search and status
  const filteredAcceptedJobs = acceptedJobs.filter(job => {
    const matchesSearch = !searchTerm ||
      job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'All Status' || job.status === statusFilter.toLowerCase().replace(' ', '_')
    return matchesSearch && matchesStatus
  })

  // Filter posted jobs based on search and status
  const filteredPostedJobs = myPostedJobs.filter(job => {
    const matchesSearch = !searchTerm ||
      job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'All Status' || job.status === statusFilter.toLowerCase().replace(' ', '_')
    return matchesSearch && matchesStatus
  })
  
  const studioFeatures = [
    {
      icon: FolderOpen,
      title: 'Unlimited Studio Workspaces',
      description: 'Manage multiple event-based projects simultaneously'
    },
    {
      icon: Users,
      title: 'Collaborator Access & Role Permissions',
      description: 'Invite crew, clients, or co-organisers with tiered access control'
    },
    {
      icon: CheckCircle,
      title: 'Task Management Suite',
      description: 'Create tasks with deadlines, assign roles, build timelines'
    },
    {
      icon: FileText,
      title: 'Template Library',
      description: 'Reusable templates for budgets, run sheets, crew packs'
    },
    {
      icon: Target,
      title: 'Vendor & Role Tagging',
      description: 'Automate task delegation based on service types'
    },
    {
      icon: MessageSquare,
      title: 'In-Studio Messaging & Notifications',
      description: 'Threaded communication tied to tasks, files, and updates'
    },
    {
      icon: Upload,
      title: 'File Management System',
      description: 'Upload files with version history and real-time comments'
    },
    {
      icon: BarChart3,
      title: 'Budget Tracking & Reporting',
      description: 'Estimate vs actual budget view with exportable summaries'
    },
    {
      icon: Users,
      title: 'Client Dashboard View',
      description: 'Grant limited access to stakeholders for approval and visibility'
    },
    {
      icon: Zap,
      title: 'Event Preset Kits',
      description: 'Pre-built role/task templates for different event types'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0B0B] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-[#E03131]/10 rounded-lg">
              <FolderOpen className="w-8 h-8 text-[#E03131]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">TIES Studio</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Your project management hub for jobs you're working on and jobs you've posted
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 overflow-x-auto">
          {[
            { id: 'my-projects', label: 'Jobs I\'m Working On', icon: Briefcase, count: acceptedJobs.length },
            { id: 'my-postings', label: 'Jobs I\'ve Posted', icon: FolderOpen, count: myPostedJobs.length },
            { id: 'features', label: 'Studio Features', icon: Zap },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map((tab) => {
            const IconComponent = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <IconComponent size={16} />
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                    activeTab === tab.id
                      ? 'bg-[#E03131] text-white'
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Content based on active tab */}
        {activeTab === 'my-projects' && (
          <div>
            {/* Info Banner */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800 dark:text-blue-300">
                  <p className="font-medium mb-1">Jobs You've Been Accepted To</p>
                  <p className="text-blue-700 dark:text-blue-400">
                    These are jobs where you applied and were selected. Use Studio to manage tasks, files, and communicate with the team.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Jobs I'm Working On</h2>
              <Button onClick={() => navigate('/jobs')} variant="outline">
                <Search size={16} className="mr-2" />
                Find More Jobs
              </Button>
            </div>

            {/* Search and Filter */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={16} />
                <input
                  type="text"
                  placeholder="Search jobs by title or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E03131]/20"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E03131]/20"
              >
                <option>All Status</option>
                <option>Open</option>
                <option>In Progress</option>
                <option>Filled</option>
                <option>Completed</option>
              </select>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#E03131]" />
              </div>
            ) : filteredAcceptedJobs.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Active Jobs Yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  You haven't been accepted to any jobs yet. Browse the Jobs Feed to find opportunities!
                </p>
                <Button onClick={() => navigate('/jobs')}>
                  Browse Jobs Feed
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredAcceptedJobs.map((job) => (
                  <div key={job.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{job.title}</h3>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                            {job.status?.replace('_', ' ')}
                          </span>
                          {job.my_role && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                              {job.my_role.role_title}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <MapPin size={14} />
                        <span>{job.location || 'Location TBD'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        <span>{formatDate(job.start_date)} - {formatDate(job.end_date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign size={14} />
                        <span>{formatCurrency(job.my_role?.budget || job.total_budget)}</span>
                      </div>
                      {job.organiser && (
                        <div className="flex items-center gap-2">
                          <Users size={14} />
                          <span>Organized by {job.organiser.display_name}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => navigate(`/jobs/${job.id}/workspace`)}
                        className="flex-1"
                      >
                        Open Workspace
                        <ArrowRight size={16} className="ml-2" />
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => navigate(`/jobs/${job.id}`)}
                      >
                        <Eye size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'my-postings' && (
          <div>
            {/* Info Banner */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800 dark:text-amber-300">
                  <p className="font-medium mb-1">Jobs You've Posted</p>
                  <p className="text-amber-700 dark:text-amber-400">
                    Manage job postings you've created. Review applicants, select team members, and manage the project once roles are filled.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Jobs I've Posted</h2>
              <Button onClick={() => navigate('/jobs/create')}>
                <Plus size={16} className="mr-2" />
                Post New Job
              </Button>
            </div>

            {/* Search and Filter */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={16} />
                <input
                  type="text"
                  placeholder="Search your jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E03131]/20"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E03131]/20"
              >
                <option>All Status</option>
                <option>Open</option>
                <option>In Progress</option>
                <option>Filled</option>
                <option>Cancelled</option>
              </select>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#E03131]" />
              </div>
            ) : filteredPostedJobs.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Jobs Posted Yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  You haven't posted any jobs yet. Create a job to find freelancers, venues, or vendors for your events.
                </p>
                <Button onClick={() => navigate('/jobs/create')}>
                  <Plus size={16} className="mr-2" />
                  Post Your First Job
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredPostedJobs.map((job) => (
                  <div key={job.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{job.title}</h3>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                            {job.status?.replace('_', ' ')}
                          </span>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 capitalize">
                            {job.event_type?.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <MapPin size={14} />
                        <span>{job.location || 'Location TBD'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        <span>{formatDate(job.start_date)} - {formatDate(job.end_date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign size={14} />
                        <span>Budget: {formatCurrency(job.total_budget)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users size={14} />
                        <span>{job.roles?.length || 0} role(s)</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => navigate(`/jobs/${job.id}/applicants`)}
                        variant="outline"
                        className="flex-1"
                      >
                        <Users size={16} className="mr-2" />
                        View Applicants
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => navigate(`/jobs/${job.id}`)}
                      >
                        <Eye size={16} />
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => navigate(`/jobs/${job.id}/edit`)}
                      >
                        <Edit size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'features' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Studio Features</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {studioFeatures.map((feature, index) => {
                const IconComponent = feature.icon
                return (
                  <div key={index} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-[#E03131]/10 text-[#E03131]">
                        <IconComponent size={24} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Studio Settings</h2>

            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Notification Preferences</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Email Notifications</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Receive updates about workspace activity
                      </div>
                    </div>
                    <input type="checkbox" className="h-4 w-4" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Auto-assign Tasks</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Automatically assign tasks based on collaborator roles
                      </div>
                    </div>
                    <input type="checkbox" className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default StudioPage

