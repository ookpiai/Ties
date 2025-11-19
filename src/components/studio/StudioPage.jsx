import React, { useState } from 'react'
import { useAuth } from '../../App'
import { 
  Plus,
  Users,
  Calendar,
  DollarSign,
  FileText,
  MessageSquare,
  Settings,
  FolderOpen,
  Clock,
  CheckCircle,
  AlertCircle,
  Upload,
  Download,
  Edit,
  Trash2,
  UserPlus,
  BarChart3,
  Target,
  Zap,
  Search,
  Filter,
  MoreHorizontal,
  Star,
  Play,
  Pause,
  Archive
} from 'lucide-react'

const StudioPage = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('projects')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All Status')
  
  const mockProjects = [
    {
      id: 1,
      title: 'Brand Identity Design for TechStart Inc.',
      status: 'in progress',
      priority: 'high',
      progress: 65,
      tasks: { completed: 8, total: 12 },
      files: 24,
      members: 2,
      deadline: '16 Feb 2024',
      budget: { spent: 2275, total: 3500 },
      team: ['SK', 'MJ'],
      tags: ['branding', 'logo', 'identity'],
      description: 'Complete brand identity package including logo, color palette, typography, and brand guidelines for a tech startup.',
      client: 'TechStart Inc.',
      type: 'Branding'
    },
    {
      id: 2,
      title: 'Product Launch Video Campaign',
      status: 'planning',
      priority: 'medium',
      progress: 25,
      tasks: { completed: 3, total: 15 },
      files: 8,
      members: 3,
      deadline: '29 Feb 2024',
      budget: { spent: 700, total: 2800 },
      team: ['MI', 'EV', 'JT'],
      tags: ['video', 'product-launch', 'motion-graphics'],
      description: '60-90 second product launch video showcasing app features with professional editing, motion graphics, and sound design.',
      client: 'InnovateTech',
      type: 'Video Production'
    },
    {
      id: 3,
      title: 'Creative Conference 2024 Event Production',
      status: 'completed',
      priority: 'high',
      progress: 100,
      tasks: { completed: 25, total: 25 },
      files: 42,
      members: 3,
      deadline: '21 Jan 2024',
      budget: { spent: 14750, total: 15000 },
      team: ['FC', 'LF', 'DC'],
      tags: ['conference', 'event-production', 'av-setup'],
      description: 'Full event production for 3-day creative industry conference including venue setup, AV equipment, stage design, and logistics coordination.',
      client: 'Creative Industry Alliance',
      type: 'Event Production'
    },
    {
      id: 4,
      title: 'E-commerce Website Redesign',
      status: 'in progress',
      priority: 'medium',
      progress: 45,
      tasks: { completed: 12, total: 20 },
      files: 18,
      members: 4,
      deadline: '15 Mar 2024',
      budget: { spent: 3200, total: 8500 },
      team: ['AM', 'RK', 'SL', 'TN'],
      tags: ['web-design', 'e-commerce', 'ux-ui'],
      description: 'Complete redesign of e-commerce platform with improved user experience, mobile optimization, and conversion rate optimization.',
      client: 'Fashion Forward',
      type: 'Web Design'
    },
    {
      id: 5,
      title: 'Music Festival Stage Design',
      status: 'planning',
      priority: 'high',
      progress: 15,
      tasks: { completed: 2, total: 18 },
      files: 6,
      members: 5,
      deadline: '10 Apr 2024',
      budget: { spent: 1500, total: 12000 },
      team: ['DJ', 'KM', 'PL', 'QR', 'ST'],
      tags: ['stage-design', 'festival', 'lighting'],
      description: 'Main stage design and production for summer music festival including lighting design, sound engineering, and visual effects.',
      client: 'Summer Sounds Festival',
      type: 'Stage Design'
    },
    {
      id: 6,
      title: 'Corporate Training Video Series',
      status: 'completed',
      priority: 'low',
      progress: 100,
      tasks: { completed: 15, total: 15 },
      files: 28,
      members: 2,
      deadline: '05 Jan 2024',
      budget: { spent: 4800, total: 5000 },
      team: ['UV', 'WX'],
      tags: ['training', 'corporate', 'video-series'],
      description: 'Series of 10 training videos for corporate onboarding program with professional scripting, filming, and post-production.',
      client: 'Global Corp Solutions',
      type: 'Video Production'
    }
  ]

  const mockWorkspaces = [
    {
      id: 1,
      title: 'Summer Music Festival 2024',
      type: 'Festival',
      date: '2024-08-15',
      location: 'Central Park',
      status: 'In Progress',
      collaborators: 12,
      tasksCompleted: 45,
      totalTasks: 67,
      budget: 25000,
      spent: 18500
    },
    {
      id: 2,
      title: 'Art Gallery Opening',
      type: 'Exhibition',
      date: '2024-07-30',
      location: 'Downtown Gallery',
      status: 'Planning',
      collaborators: 8,
      tasksCompleted: 23,
      totalTasks: 45,
      budget: 12000,
      spent: 3200
    },
    {
      id: 3,
      title: 'Corporate Brand Launch',
      type: 'Brand Event',
      date: '2024-09-10',
      location: 'Convention Center',
      status: 'Completed',
      collaborators: 15,
      tasksCompleted: 89,
      totalTasks: 89,
      budget: 45000,
      spent: 43200
    }
  ]

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

  const filteredProjects = mockProjects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = statusFilter === 'All Status' || 
                         project.status.replace(' ', '-') === statusFilter.toLowerCase().replace(' ', '-')
    
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-success/20 text-success'
      case 'in progress': return 'bg-warning/20 text-warning'
      case 'planning': return 'bg-info/20 text-info'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-destructive/20 text-destructive'
      case 'medium': return 'bg-warning/20 text-warning'
      case 'low': return 'bg-success/20 text-success'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  const ProjectCard = ({ project }) => (
    <div className="bg-surface border border-app text-app rounded-2xl p-6 hover:shadow-lg transition-shadow cursor-pointer">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="card-title mb-2">{project.title}</h3>
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(project.status)}`}>
              {project.status}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(project.priority)}`}>
              {project.priority}
            </span>
          </div>
          <p className="text-sm text-slate-600 dark:text-white/80 mb-3">{project.description}</p>
        </div>
        <button className="p-2 hover:bg-muted rounded-lg">
          <MoreHorizontal size={16} />
        </button>
      </div>
      
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-slate-600 dark:text-white/80">Progress</span>
          <span className="font-medium">{project.progress}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all" 
            style={{ width: `${project.progress}%` }}
          ></div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <div className="text-slate-600 dark:text-white/80">Tasks</div>
          <div className="font-medium">{project.tasks.completed}/{project.tasks.total}</div>
        </div>
        <div>
          <div className="text-slate-600 dark:text-white/80">Files</div>
          <div className="font-medium">{project.files}</div>
        </div>
        <div>
          <div className="text-slate-600 dark:text-white/80">Team</div>
          <div className="flex items-center gap-1">
            {project.team.map((member, index) => (
              <div key={index} className="w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs">
                {member}
              </div>
            ))}
            <span className="text-slate-600 dark:text-white/80 ml-1">{project.members}</span>
          </div>
        </div>
        <div>
          <div className="text-slate-600 dark:text-white/80">Deadline</div>
          <div className="font-medium">{project.deadline}</div>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="text-sm text-slate-600 dark:text-white/80 mb-1">Budget</div>
        <div className="text-sm font-medium">
          £{project.budget.spent.toLocaleString()} / £{project.budget.total.toLocaleString()}
        </div>
      </div>
      
      <div className="flex flex-wrap gap-1 mb-4">
        {project.tags.map((tag, index) => (
          <span key={index} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-white/80 text-xs rounded">
            {tag}
          </span>
        ))}
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-600 dark:text-white/80">{project.client}</span>
        <button className="btn-secondary text-sm">
          Open Project
        </button>
      </div>
    </div>
  )

  const WorkspaceCard = ({ workspace }) => (
    <div className="bg-surface border border-app text-app rounded-2xl p-6 hover:shadow-lg transition-shadow cursor-pointer">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="card-title mb-1">{workspace.title}</h3>
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-white/80">
            <span>{workspace.type}</span>
            <span>•</span>
            <span>{workspace.date}</span>
            <span>•</span>
            <span>{workspace.location}</span>
          </div>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs ${
          workspace.status === 'Completed' ? 'bg-success/20 text-success' :
          workspace.status === 'In Progress' ? 'bg-warning/20 text-warning' :
          'bg-info/20 text-info'
        }`}>
          {workspace.status}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-sm text-slate-600 dark:text-white/80">Progress</div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full" 
                style={{ width: `${(workspace.tasksCompleted / workspace.totalTasks) * 100}%` }}
              ></div>
            </div>
            <span className="text-sm font-medium">
              {workspace.tasksCompleted}/{workspace.totalTasks}
            </span>
          </div>
        </div>
        
        <div>
          <div className="text-sm text-slate-600 dark:text-white/80">Budget</div>
          <div className="text-sm font-medium">
            ${workspace.spent.toLocaleString()} / ${workspace.budget.toLocaleString()}
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-white/80">
          <Users size={16} />
          <span>{workspace.collaborators} collaborators</span>
        </div>
        <button className="btn-secondary text-sm">
          Open Studio
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-app text-app transition-colors duration-200">
      <div className="w-full px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-primary/20 rounded-lg">
              <FolderOpen className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="page-title">TIES Studio</h1>
              <p className="text-slate-600 dark:text-white/80">
                Collaborative project management workspace for creative teams
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-1 mb-6 bg-muted rounded-lg p-1">
          {[
            { id: 'projects', label: 'My Projects', icon: FolderOpen },
            { id: 'workspaces', label: 'Team Projects', icon: Users },
            { id: 'templates', label: 'Templates', icon: FileText },
            { id: 'features', label: 'Studio Features', icon: Zap },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map((tab) => {
            const IconComponent = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-white/80 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <IconComponent size={16} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Content based on active tab */}
        {activeTab === 'projects' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="section-header">My Projects</h2>
              <button className="btn-primary flex items-center gap-2">
                <Plus size={16} />
                New Project
              </button>
            </div>

            {/* Search and Filter */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-white/60" size={16} />
                <input
                  type="text"
                  placeholder="Search projects, descriptions, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option>All Status</option>
                <option>In Progress</option>
                <option>Planning</option>
                <option>Completed</option>
              </select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {filteredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'workspaces' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="section-header">Team Projects</h2>
              <button className="btn-primary flex items-center gap-2">
                <Plus size={16} />
                Create New Studio
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
              {mockWorkspaces.map((workspace) => (
                <WorkspaceCard key={workspace.id} workspace={workspace} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'features' && (
          <div>
            <h2 className="section-header mb-6">Studio Features</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {studioFeatures.map((feature, index) => {
                const IconComponent = feature.icon
                return (
                  <div key={index} className="bg-surface border border-app text-app rounded-2xl p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-primary/20 text-primary">
                        <IconComponent size={24} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
                        <p className="text-sm text-slate-600 dark:text-white/80">{feature.description}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {activeTab === 'templates' && (
          <div>
            <h2 className="section-header mb-6">Template Library</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
              {[
                { name: 'Music Festival Template', type: 'Festival', tasks: 45 },
                { name: 'Art Exhibition Template', type: 'Exhibition', tasks: 32 },
                { name: 'Corporate Event Template', type: 'Corporate', tasks: 28 },
                { name: 'Club Night Template', type: 'Club Night', tasks: 22 },
                { name: 'Workshop Template', type: 'Workshop', tasks: 18 },
                { name: 'Brand Launch Template', type: 'Brand Event', tasks: 38 }
              ].map((template, index) => (
                <div key={index} className="bg-surface border border-app text-app rounded-2xl p-6 hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-primary/20 text-primary rounded-lg">
                      <FileText size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">{template.name}</h3>
                      <p className="text-sm text-slate-600 dark:text-white/80">{template.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-white/80">
                      {template.tasks} pre-built tasks
                    </span>
                    <button className="btn-secondary text-sm">
                      Use Template
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <h2 className="section-header mb-6">Studio Settings</h2>
            
            <div className="space-y-6">
              <div className="bg-surface border border-app text-app rounded-2xl p-6">
                <h3 className="card-title mb-4">Default Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-slate-900 dark:text-white">Email Notifications</div>
                      <div className="text-sm text-slate-600 dark:text-white/80">
                        Receive updates about workspace activity
                      </div>
                    </div>
                    <input type="checkbox" className="toggle" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-slate-900 dark:text-white">Auto-assign Tasks</div>
                      <div className="text-sm text-slate-600 dark:text-white/80">
                        Automatically assign tasks based on collaborator roles
                      </div>
                    </div>
                    <input type="checkbox" className="toggle" />
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

