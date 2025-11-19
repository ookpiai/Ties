import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '../../App'
import { 
  Calendar,
  Clock,
  Users,
  FileText,
  Folder,
  Plus,
  Search,
  Filter,
  Eye,
  MessageCircle,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  Edit,
  Trash2,
  Download,
  Upload,
  Share2,
  Settings,
  MoreVertical,
  ArrowRight,
  PlayCircle,
  PauseCircle,
  RotateCcw,
  Target,
  TrendingUp,
  Activity,
  Paperclip,
  Image,
  Video,
  Music,
  FileImage,
  FileVideo,
  FileAudio,
  File,
  FolderOpen,
  UserPlus,
  Bell,
  Flag,
  Bookmark,
  Archive,
  Copy,
  ExternalLink,
  GitBranch,
  Layers,
  Zap,
  Award,
  BarChart3
} from 'lucide-react'

const ProjectsPage = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('my-projects')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedProject, setSelectedProject] = useState(null)
  const [showCreateProject, setShowCreateProject] = useState(false)

  // Mock projects data
  const [projects, setProjects] = useState([
    {
      id: 1,
      title: 'Brand Identity Design for TechStart Inc.',
      description: 'Complete brand identity package including logo, color palette, typography, and brand guidelines for a sustainable fashion startup.',
      status: 'in-progress',
      priority: 'high',
      progress: 65,
      startDate: '2024-01-25T09:00:00Z',
      endDate: '2024-02-15T17:00:00Z',
      budget: 3500,
      spent: 2275,
      client: { id: 2, name: 'TechStart Inc.', avatar: null },
      team: [
        { id: 3, name: 'Sarah Chen', role: 'Lead Designer', avatar: null },
        { id: 4, name: 'Mike Johnson', role: 'Brand Strategist', avatar: null }
      ],
      category: 'design',
      tags: ['branding', 'logo', 'identity', 'startup'],
      tasks: {
        total: 12,
        completed: 8,
        inProgress: 2,
        pending: 2
      },
      files: {
        total: 24,
        recent: [
          { name: 'logo_concepts_v3.ai', type: 'design', size: '2.4 MB', date: '2024-01-23' },
          { name: 'brand_guidelines_draft.pdf', type: 'document', size: '1.8 MB', date: '2024-01-22' },
          { name: 'color_palette.ase', type: 'design', size: '0.3 MB', date: '2024-01-21' }
        ]
      },
      activity: [
        { user: 'Sarah Chen', action: 'uploaded logo concepts v3', time: '2 hours ago' },
        { user: 'Mike Johnson', action: 'completed brand strategy research', time: '1 day ago' },
        { user: 'TechStart Inc.', action: 'approved color palette', time: '2 days ago' }
      ],
      createdAt: '2024-01-20T10:00:00Z',
      lastUpdate: '2024-01-23T14:30:00Z'
    },
    {
      id: 2,
      title: 'Product Launch Video Campaign',
      description: '60-90 second product launch video showcasing app features with professional editing, motion graphics, and sound design.',
      status: 'planning',
      priority: 'medium',
      progress: 25,
      startDate: '2024-02-01T10:00:00Z',
      endDate: '2024-02-28T18:00:00Z',
      budget: 2800,
      spent: 700,
      client: { id: 1, name: user?.first_name + ' ' + user?.last_name, avatar: null },
      team: [
        { id: 5, name: 'Marcus Rodriguez', role: 'Video Producer', avatar: null },
        { id: 6, name: 'Emma Wilson', role: 'Motion Designer', avatar: null },
        { id: 7, name: 'James Taylor', role: 'Sound Engineer', avatar: null }
      ],
      category: 'video',
      tags: ['video', 'product-launch', 'motion-graphics', 'marketing'],
      tasks: {
        total: 15,
        completed: 3,
        inProgress: 2,
        pending: 10
      },
      files: {
        total: 8,
        recent: [
          { name: 'storyboard_v1.pdf', type: 'document', size: '3.2 MB', date: '2024-01-22' },
          { name: 'script_draft.docx', type: 'document', size: '0.8 MB', date: '2024-01-21' },
          { name: 'reference_videos.zip', type: 'archive', size: '45.6 MB', date: '2024-01-20' }
        ]
      },
      activity: [
        { user: 'Marcus Rodriguez', action: 'created project timeline', time: '3 hours ago' },
        { user: 'Emma Wilson', action: 'shared motion graphics references', time: '1 day ago' },
        { user: 'James Taylor', action: 'joined the project', time: '2 days ago' }
      ],
      createdAt: '2024-01-18T15:20:00Z',
      lastUpdate: '2024-01-22T11:45:00Z'
    },
    {
      id: 3,
      title: 'Creative Conference 2024 Event Production',
      description: 'Full event production for 3-day creative industry conference including venue setup, AV equipment coordination, and vendor management.',
      status: 'completed',
      priority: 'high',
      progress: 100,
      startDate: '2024-01-10T08:00:00Z',
      endDate: '2024-01-20T20:00:00Z',
      budget: 15000,
      spent: 14750,
      client: { id: 8, name: 'Creative Industry Alliance', avatar: null },
      team: [
        { id: 9, name: 'The Creative Collective', role: 'Event Coordinator', avatar: null },
        { id: 10, name: 'Lisa Park', role: 'AV Specialist', avatar: null },
        { id: 11, name: 'David Chen', role: 'Vendor Manager', avatar: null }
      ],
      category: 'events',
      tags: ['conference', 'event-production', 'av-setup', 'coordination'],
      tasks: {
        total: 25,
        completed: 25,
        inProgress: 0,
        pending: 0
      },
      files: {
        total: 42,
        recent: [
          { name: 'final_event_report.pdf', type: 'document', size: '5.8 MB', date: '2024-01-21' },
          { name: 'attendee_feedback.xlsx', type: 'spreadsheet', size: '2.1 MB', date: '2024-01-21' },
          { name: 'event_photos.zip', type: 'archive', size: '128.4 MB', date: '2024-01-20' }
        ]
      },
      activity: [
        { user: 'The Creative Collective', action: 'submitted final report', time: '3 days ago' },
        { user: 'Lisa Park', action: 'completed AV equipment breakdown', time: '4 days ago' },
        { user: 'David Chen', action: 'finalized vendor payments', time: '5 days ago' }
      ],
      createdAt: '2023-12-15T09:00:00Z',
      lastUpdate: '2024-01-21T16:10:00Z'
    }
  ])

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      'planning': 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-yellow-100 text-yellow-800',
      'review': 'bg-purple-100 text-purple-800',
      'completed': 'bg-green-100 text-green-800',
      'on-hold': 'bg-gray-100 text-gray-800',
      'cancelled': 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  // Get priority color
  const getPriorityColor = (priority) => {
    const colors = {
      'low': 'bg-green-100 text-green-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'high': 'bg-red-100 text-red-800',
      'urgent': 'bg-red-200 text-red-900'
    }
    return colors[priority] || 'bg-gray-100 text-gray-800'
  }

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    })
  }

  // Format budget
  const formatBudget = (amount) => {
    return `£${amount.toLocaleString()}`
  }

  // Get file icon
  const getFileIcon = (type) => {
    const icons = {
      design: FileImage,
      document: FileText,
      video: FileVideo,
      audio: FileAudio,
      image: Image,
      archive: Folder,
      spreadsheet: FileText
    }
    const Icon = icons[type] || File
    return <Icon className="w-4 h-4" />
  }

  // Filter projects
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesStatus = selectedStatus === 'all' || project.status === selectedStatus
    
    return matchesSearch && matchesStatus
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">TIES Studio</h1>
          <p className="text-gray-600 mt-1">
            Collaborative project management workspace for creative teams
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('my-projects')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'my-projects'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Projects
              </button>
              <button
                onClick={() => setActiveTab('team-projects')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'team-projects'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Team Projects
              </button>
              <button
                onClick={() => setActiveTab('templates')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'templates'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Templates
              </button>
            </nav>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects, descriptions, or tags..."
              className="pl-9"
            />
          </div>
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="planning">Planning</option>
            <option value="in-progress">In Progress</option>
            <option value="review">Review</option>
            <option value="completed">Completed</option>
            <option value="on-hold">On Hold</option>
          </select>

          <Button onClick={() => setShowCreateProject(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>

        {/* Project Grid */}
        {activeTab === 'my-projects' && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <Card key={project.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedProject(project)}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2 line-clamp-2">
                          {project.title}
                        </CardTitle>
                        <div className="flex items-center space-x-2 mb-3">
                          <Badge className={getStatusColor(project.status)}>
                            {project.status.replace('-', ' ')}
                          </Badge>
                          <Badge className={getPriorityColor(project.priority)}>
                            {project.priority}
                          </Badge>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {project.description}
                    </p>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">{project.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Project Stats */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-1">
                        <div className="flex items-center text-gray-600">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          <span>{project.tasks.completed}/{project.tasks.total} tasks</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Folder className="w-4 h-4 mr-1" />
                          <span>{project.files.total} files</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center text-gray-600">
                          <Users className="w-4 h-4 mr-1" />
                          <span>{project.team.length} members</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Calendar className="w-4 h-4 mr-1" />
                          <span>{formatDate(project.endDate)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Budget */}
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Budget</span>
                      <span className="font-medium">
                        {formatBudget(project.spent)} / {formatBudget(project.budget)}
                      </span>
                    </div>

                    {/* Team Avatars */}
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Team:</span>
                      <div className="flex -space-x-2">
                        {project.team.slice(0, 3).map((member, index) => (
                          <Avatar key={index} className="w-6 h-6 border-2 border-white">
                            <AvatarFallback className="text-xs">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {project.team.length > 3 && (
                          <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                            <span className="text-xs text-gray-600">+{project.team.length - 3}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {project.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {project.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{project.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full">
                <Card>
                  <CardContent className="text-center py-12">
                    <Folder className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No projects found
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {searchQuery || selectedStatus !== 'all' 
                        ? 'Try adjusting your search or filters'
                        : 'Create your first project to get started with TIES Studio'
                      }
                    </p>
                    <Button onClick={() => setShowCreateProject(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Project
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}

        {activeTab === 'team-projects' && (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Team Projects
              </h3>
              <p className="text-gray-600">
                Collaborate on projects with your team members and track shared progress.
              </p>
            </CardContent>
          </Card>
        )}

        {activeTab === 'templates' && (
          <Card>
            <CardContent className="text-center py-12">
              <Layers className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Project Templates
              </h3>
              <p className="text-gray-600">
                Start new projects faster with pre-built templates for common creative workflows.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Project Detail Modal */}
        {selectedProject && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {selectedProject.title}
                    </h2>
                    <div className="flex items-center space-x-3">
                      <Badge className={getStatusColor(selectedProject.status)}>
                        {selectedProject.status.replace('-', ' ')}
                      </Badge>
                      <Badge className={getPriorityColor(selectedProject.priority)}>
                        {selectedProject.priority}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {formatBudget(selectedProject.spent)} / {formatBudget(selectedProject.budget)}
                      </span>
                    </div>
                  </div>
                  <Button variant="ghost" onClick={() => setSelectedProject(null)}>
                    <XCircle className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <p className="text-gray-700">{selectedProject.description}</p>

                {/* Progress and Stats */}
                <div className="grid md:grid-cols-3 gap-6">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Progress</span>
                        <span className="text-lg font-bold">{selectedProject.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${selectedProject.progress}%` }}
                        ></div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Tasks</span>
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="text-lg font-bold">
                        {selectedProject.tasks.completed} / {selectedProject.tasks.total}
                      </div>
                      <div className="text-sm text-gray-600">
                        {selectedProject.tasks.inProgress} in progress
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Files</span>
                        <Folder className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="text-lg font-bold">{selectedProject.files.total}</div>
                      <div className="text-sm text-gray-600">
                        {selectedProject.files.recent.length} recent
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Team */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Team Members</h3>
                  <div className="space-y-2">
                    {selectedProject.team.map((member, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <Avatar>
                          <AvatarFallback>
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{member.name}</div>
                          <div className="text-sm text-gray-600">{member.role}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Files */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Recent Files</h3>
                  <div className="space-y-2">
                    {selectedProject.files.recent.map((file, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        {getFileIcon(file.type)}
                        <div className="flex-1">
                          <div className="font-medium">{file.name}</div>
                          <div className="text-sm text-gray-600">{file.size} • {file.date}</div>
                        </div>
                        <Button size="sm" variant="ghost">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Activity */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Recent Activity</h3>
                  <div className="space-y-3">
                    {selectedProject.activity.map((activity, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs">
                            {activity.user.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="text-sm">
                            <span className="font-medium">{activity.user}</span> {activity.action}
                          </div>
                          <div className="text-xs text-gray-600">{activity.time}</div>
                        </div>
                      </div>
                    ))}
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

export default ProjectsPage

