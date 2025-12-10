/**
 * TIES STUDIO - Unified Project Management Hub
 *
 * All jobs are projects. Whether you created them (organizer) or
 * were accepted to them (team member), they all appear here.
 */

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../App'
import { getMyAcceptedJobs, getJobPostings } from '../../api/jobs'
import {
  Plus,
  Users,
  Calendar,
  DollarSign,
  FolderOpen,
  CheckCircle,
  Search,
  MapPin,
  Briefcase,
  Eye,
  ArrowRight,
  Loader2,
  Crown,
  UserCheck,
  Clock,
  Filter,
  LayoutGrid,
  List,
  Edit,
  MessageCircle
} from 'lucide-react'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'

const StudioPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all') // 'all', 'organizer', 'team'
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'

  // Real data states
  const [acceptedJobs, setAcceptedJobs] = useState([])
  const [myPostedJobs, setMyPostedJobs] = useState([])
  const [loading, setLoading] = useState(true)

  // Load all projects
  useEffect(() => {
    loadData()
  }, [user?.id])

  const loadData = async () => {
    if (!user?.id) return
    setLoading(true)
    try {
      const [acceptedResult, postedResult] = await Promise.all([
        getMyAcceptedJobs(),
        getJobPostings()
      ])

      if (acceptedResult.success) {
        setAcceptedJobs(acceptedResult.data || [])
      }

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

  const getStatusConfig = (status) => {
    const configs = {
      open: {
        label: 'Open',
        color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        icon: Clock
      },
      in_progress: {
        label: 'In Progress',
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        icon: ArrowRight
      },
      filled: {
        label: 'Filled',
        color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
        icon: UserCheck
      },
      completed: {
        label: 'Completed',
        color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
        icon: CheckCircle
      },
      cancelled: {
        label: 'Cancelled',
        color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        icon: null
      }
    }
    return configs[status] || configs.open
  }

  // Combine and tag all projects
  const allProjects = [
    ...myPostedJobs.map(job => ({ ...job, userRole: 'organizer' })),
    ...acceptedJobs.map(job => ({ ...job, userRole: 'team' }))
  ]

  // Remove duplicates (if user is both organizer and team member somehow)
  const uniqueProjects = allProjects.filter((project, index, self) =>
    index === self.findIndex(p => p.id === project.id)
  )

  // Apply filters
  const filteredProjects = uniqueProjects.filter(project => {
    const matchesSearch = !searchTerm ||
      project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.location?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || project.status === statusFilter

    const matchesRole = roleFilter === 'all' || project.userRole === roleFilter

    return matchesSearch && matchesStatus && matchesRole
  })

  // Sort by date (most recent first)
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    return new Date(b.created_at || 0) - new Date(a.created_at || 0)
  })

  // Stats
  const stats = {
    total: uniqueProjects.length,
    asOrganizer: myPostedJobs.length,
    asTeamMember: acceptedJobs.length,
    active: uniqueProjects.filter(p => ['open', 'in_progress', 'filled'].includes(p.status)).length,
    completed: uniqueProjects.filter(p => p.status === 'completed').length
  }

  const ProjectCard = ({ project }) => {
    const statusConfig = getStatusConfig(project.status)
    const isOrganizer = project.userRole === 'organizer'

    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600 transition-all">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {isOrganizer ? (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800 text-xs">
                  <Crown className="h-3 w-3 mr-1" />
                  Organizer
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800 text-xs">
                  <UserCheck className="h-3 w-3 mr-1" />
                  Team Member
                </Badge>
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
              {project.title}
            </h3>
          </div>
          <Badge className={`${statusConfig.color} text-xs ml-2 flex-shrink-0`}>
            {statusConfig.label}
          </Badge>
        </div>

        {/* Details */}
        <div className="space-y-2 mb-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <MapPin size={14} className="flex-shrink-0" />
            <span className="truncate">{project.location || 'Location TBD'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={14} className="flex-shrink-0" />
            <span>{formatDate(project.start_date)}</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign size={14} className="flex-shrink-0" />
            <span>
              {isOrganizer
                ? `Budget: ${formatCurrency(project.total_budget)}`
                : `Your Rate: ${formatCurrency(project.my_role?.budget || project.total_budget)}`
              }
            </span>
          </div>
          {!isOrganizer && project.organiser && (
            <div className="flex items-center gap-2">
              <Users size={14} className="flex-shrink-0" />
              <span className="truncate">By {project.organiser.display_name}</span>
            </div>
          )}
          {isOrganizer && project.roles && (
            <div className="flex items-center gap-2">
              <Users size={14} className="flex-shrink-0" />
              <span>{project.roles.length} role(s) • {project.roles.reduce((acc, r) => acc + (r.filled_count || 0), 0)} filled</span>
            </div>
          )}
        </div>

        {/* Role Badge (for team members) */}
        {!isOrganizer && project.my_role && (
          <div className="mb-4">
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800">
              {project.my_role.role_title}
            </Badge>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          {isOrganizer ? (
            <>
              <Button
                onClick={() => navigate(`/jobs/${project.id}/applicants`)}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <Users size={14} className="mr-1" />
                View Applicants
              </Button>
              <Button
                onClick={() => navigate(`/jobs/${project.id}`)}
                size="sm"
                className="flex-1"
              >
                View Job
                <ArrowRight size={14} className="ml-1" />
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => navigate(`/jobs/${project.id}`)}
                size="sm"
                className="flex-1"
              >
                View Job
                <ArrowRight size={14} className="ml-1" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/messages')}
              >
                <MessageCircle size={14} />
              </Button>
            </>
          )}
        </div>
      </div>
    )
  }

  const ProjectListItem = ({ project }) => {
    const statusConfig = getStatusConfig(project.status)
    const isOrganizer = project.userRole === 'organizer'

    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 transition-all">
        <div className="flex items-center gap-4">
          {/* Role indicator */}
          <div className={`w-1 h-12 rounded-full flex-shrink-0 ${isOrganizer ? 'bg-amber-500' : 'bg-blue-500'}`} />

          {/* Main content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate">{project.title}</h3>
              <Badge className={`${statusConfig.color} text-xs`}>
                {statusConfig.label}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <MapPin size={12} />
                {project.location || 'TBD'}
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                {formatDate(project.start_date)}
              </span>
              <span className="flex items-center gap-1">
                <DollarSign size={12} />
                {formatCurrency(project.total_budget)}
              </span>
            </div>
          </div>

          {/* Role badge */}
          <Badge variant="outline" className={`flex-shrink-0 ${isOrganizer ? 'border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-400' : 'border-blue-300 text-blue-700 dark:border-blue-700 dark:text-blue-400'}`}>
            {isOrganizer ? 'Organizer' : project.my_role?.role_title || 'Team'}
          </Badge>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              onClick={() => navigate(`/jobs/${project.id}/workspace`)}
              size="sm"
            >
              Open
              <ArrowRight size={14} className="ml-1" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0B0B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#E03131]/10 rounded-xl">
                <FolderOpen className="w-8 h-8 text-[#E03131]" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Studio</h1>
                <p className="text-gray-600 dark:text-gray-400">
                  All your projects in one place
                </p>
              </div>
            </div>
            <Button onClick={() => navigate('/jobs/create')}>
              <Plus size={16} className="mr-2" />
              New Project
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Projects</div>
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.asOrganizer}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">As Organizer</div>
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.asTeamMember}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">As Team Member</div>
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.active}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Active</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E03131]/20 focus:border-[#E03131]"
              />
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E03131]/20"
            >
              <option value="all">All Roles</option>
              <option value="organizer">As Organizer</option>
              <option value="team">As Team Member</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E03131]/20"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="filled">Filled</option>
              <option value="completed">Completed</option>
            </select>

            {/* View Toggle */}
            <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2.5 ${viewMode === 'grid' ? 'bg-[#E03131] text-white' : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2.5 ${viewMode === 'list' ? 'bg-[#E03131] text-white' : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#E03131]" />
          </div>
        ) : sortedProjects.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <FolderOpen className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {searchTerm || statusFilter !== 'all' || roleFilter !== 'all'
                ? 'No matching projects found'
                : 'No projects yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              {searchTerm || statusFilter !== 'all' || roleFilter !== 'all'
                ? 'Try adjusting your filters to find what you\'re looking for.'
                : 'Create a new project to hire talent, or browse the Jobs Feed to find work opportunities.'}
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button onClick={() => navigate('/jobs/create')}>
                <Plus size={16} className="mr-2" />
                Create Project
              </Button>
              <Button variant="outline" onClick={() => navigate('/jobs')}>
                <Briefcase size={16} className="mr-2" />
                Browse Jobs
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Results count */}
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Showing {sortedProjects.length} project{sortedProjects.length !== 1 ? 's' : ''}
            </div>

            {/* Projects Grid/List */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {sortedProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {sortedProjects.map((project) => (
                  <ProjectListItem key={project.id} project={project} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default StudioPage
