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
  Crown,
  Shield,
  Bell,
  Share2,
  Eye,
  Lock,
  Unlock,
  Tag,
  MessageCircle,
  TrendingUp,
  PieChart,
  Activity,
  Briefcase,
  MapPin,
  Mic,
  Headphones,
  Palette,
  School
} from 'lucide-react'

const ComprehensiveStudioPage = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('workspaces')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All Status')
  const [selectedWorkspace, setSelectedWorkspace] = useState(null)

  // Comprehensive Studio Features Data
  const studioFeatures = [
    {
      icon: FolderOpen,
      title: 'Unlimited Studio Workspaces',
      description: 'Manage multiple event-based projects simultaneously with dedicated workspaces for each event',
      category: 'Core',
      status: 'Active'
    },
    {
      icon: Users,
      title: 'Collaborator Access & Role Permissions',
      description: 'Invite crew, clients, or co-organisers with tiered access control (Admin, Editor, Viewer)',
      category: 'Core',
      status: 'Active'
    },
    {
      icon: CheckCircle,
      title: 'Task Management Suite',
      description: 'Create tasks with deadlines, assign roles, build timelines, and use shared calendars',
      category: 'Core',
      status: 'Active'
    },
    {
      icon: FileText,
      title: 'Template Library',
      description: 'Reusable templates for budgets, run sheets, crew packs, and task workflows',
      category: 'Pro',
      status: 'Active'
    },
    {
      icon: Target,
      title: 'Vendor & Role Tagging',
      description: 'Automate task delegation based on service types (e.g. AV, decor, security)',
      category: 'Pro',
      status: 'Active'
    },
    {
      icon: MessageSquare,
      title: 'In-Studio Messaging & Notifications',
      description: 'Threaded communication tied to tasks, files, and updates with real-time notifications',
      category: 'Core',
      status: 'Active'
    },
    {
      icon: Upload,
      title: 'File Management System',
      description: 'Upload files with version history, folder organisation, and real-time comments',
      category: 'Core',
      status: 'Active'
    },
    {
      icon: BarChart3,
      title: 'Budget Tracking & Reporting',
      description: 'Estimate vs actual budget view with exportable summaries for clients',
      category: 'Pro',
      status: 'Active'
    },
    {
      icon: Eye,
      title: 'Client Dashboard View',
      description: 'Grant limited access to stakeholders for approval, visibility, and signoffs',
      category: 'Pro',
      status: 'Active'
    },
    {
      icon: TrendingUp,
      title: 'Progress Reporting',
      description: 'Generate project summaries and update reports at milestones',
      category: 'Pro',
      status: 'Active'
    },
    {
      icon: Zap,
      title: 'Event Preset Kits',
      description: 'Pre-built role/task templates tailored to event types (e.g. DJ night, festival, exhibition)',
      category: 'Pro',
      status: 'Active'
    },
    {
      icon: UserPlus,
      title: 'Co-Organiser Support',
      description: 'Invite assistants, producers, or collaborators into shared management roles',
      category: 'Core',
      status: 'Active'
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
      spent: 18500,
      progress: 67,
      features: ['Unlimited Workspaces', 'Task Management', 'Budget Tracking', 'File Management', 'Team Collaboration']
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
      spent: 3200,
      progress: 51,
      features: ['Template Library', 'Client Dashboard', 'Progress Reporting', 'Vendor Tagging']
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
      spent: 43200,
      progress: 100,
      features: ['Event Preset Kits', 'Co-Organiser Support', 'In-Studio Messaging', 'Role Permissions']
    }
  ]

  const eventTemplates = [
    {
      id: 1,
      name: 'Music Festival Template',
      type: 'Festival',
      description: 'Complete template for multi-day music festivals',
      tasks: 67,
      roles: ['Event Manager', 'Sound Engineer', 'Stage Manager', 'Security Lead', 'Marketing Manager'],
      budgetCategories: ['Venue', 'Sound & AV', 'Security', 'Marketing', 'Catering', 'Miscellaneous'],
      timeline: '3-6 months',
      complexity: 'High',
      icon: Mic
    },
    {
      id: 2,
      name: 'Art Exhibition Template',
      type: 'Exhibition',
      description: 'Gallery opening and exhibition management',
      tasks: 45,
      roles: ['Curator', 'Installation Manager', 'PR Manager', 'Security'],
      budgetCategories: ['Artwork Transport', 'Installation', 'Marketing', 'Catering', 'Security'],
      timeline: '2-3 months',
      complexity: 'Medium',
      icon: Palette
    },
    {
      id: 3,
      name: 'Corporate Event Template',
      type: 'Corporate',
      description: 'Professional corporate events and launches',
      tasks: 38,
      roles: ['Event Producer', 'Brand Manager', 'AV Coordinator', 'Catering Manager'],
      budgetCategories: ['Venue', 'AV Equipment', 'Catering', 'Marketing', 'Decor', 'Staff'],
      timeline: '1-2 months',
      complexity: 'Medium',
      icon: Briefcase
    },
    {
      id: 4,
      name: 'Club Night Template',
      type: 'Club Night',
      description: 'DJ nights and club events',
      tasks: 22,
      roles: ['Event Manager', 'DJ Coordinator', 'Bar Manager', 'Security'],
      budgetCategories: ['Venue', 'Sound System', 'DJ Fees', 'Bar Setup', 'Security', 'Marketing'],
      timeline: '2-4 weeks',
      complexity: 'Low',
      icon: Headphones
    },
    {
      id: 5,
      name: 'Workshop Template',
      type: 'Workshop',
      description: 'Educational workshops and seminars',
      tasks: 18,
      roles: ['Workshop Leader', 'Coordinator', 'Technical Support'],
      budgetCategories: ['Venue', 'Materials', 'Refreshments', 'Equipment'],
      timeline: '1-2 weeks',
      complexity: 'Low',
      icon: School
    },
    {
      id: 6,
      name: 'Brand Launch Template',
      type: 'Brand Event',
      description: 'Product launches and brand activations',
      tasks: 42,
      roles: ['Brand Manager', 'Event Producer', 'Marketing Lead', 'AV Coordinator'],
      budgetCategories: ['Venue', 'AV Equipment', 'Catering', 'Marketing', 'Decor', 'Staff'],
      timeline: '2-3 months',
      complexity: 'High',
      icon: Zap
    }
  ]

  const filteredWorkspaces = mockWorkspaces.filter(workspace => {
    const matchesSearch = workspace.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workspace.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workspace.location.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'All Status' || 
                         workspace.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const WorkspaceCard = ({ workspace }) => (
    <div className="profile-card hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-primary">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="card-title mb-2">{workspace.title}</h3>
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              workspace.status === 'Completed' ? 'bg-green-100 text-green-800' :
              workspace.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {workspace.status}
            </span>
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
              {workspace.type}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <span>{workspace.date}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin size={14} />
              <span>{workspace.location}</span>
            </div>
          </div>
        </div>
        <button className="p-2 hover:bg-muted rounded-lg">
          <MoreHorizontal size={16} />
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-sm text-muted-foreground mb-1">Progress</div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all" 
                style={{ width: `${workspace.progress}%` }}
              ></div>
            </div>
            <span className="text-sm font-medium">
              {workspace.tasksCompleted}/{workspace.totalTasks}
            </span>
          </div>
        </div>
        
        <div>
          <div className="text-sm text-muted-foreground mb-1">Budget</div>
          <div className="text-sm font-medium">
            ${workspace.spent.toLocaleString()} / ${workspace.budget.toLocaleString()}
          </div>
          <div className="w-full bg-muted rounded-full h-1 mt-1">
            <div 
              className="bg-green-500 h-1 rounded-full" 
              style={{ width: `${(workspace.spent / workspace.budget) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="text-sm font-medium mb-2">Active Features</div>
        <div className="flex flex-wrap gap-1">
          {workspace.features.slice(0, 3).map((feature, index) => (
            <span key={index} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded">
              {feature}
            </span>
          ))}
          {workspace.features.length > 3 && (
            <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded">
              +{workspace.features.length - 3} more
            </span>
          )}
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users size={14} />
          <span>{workspace.collaborators} collaborators</span>
        </div>
        <button className="btn-secondary text-sm">
          Open Studio
        </button>
      </div>
    </div>
  )

  const TemplateCard = ({ template }) => {
    const IconComponent = template.icon
    return (
      <div className="profile-card hover:shadow-lg transition-shadow cursor-pointer">
        <div className="flex items-start gap-4 mb-4">
          <div className="p-3 bg-primary/20 text-primary rounded-lg">
            <IconComponent size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-1">{template.name}</h3>
            <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>{template.tasks} tasks</span>
              <span>{template.timeline}</span>
              <span className={`px-2 py-1 rounded-full ${
                template.complexity === 'High' ? 'bg-red-100 text-red-800' :
                template.complexity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {template.complexity}
              </span>
            </div>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="text-sm font-medium mb-2">Included Roles</div>
          <div className="flex flex-wrap gap-1">
            {template.roles.slice(0, 3).map((role, index) => (
              <span key={index} className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded">
                {role}
              </span>
            ))}
            {template.roles.length > 3 && (
              <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded">
                +{template.roles.length - 3} more
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{template.type}</span>
          <button className="btn-primary text-sm">
            Use Template
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-primary/20 rounded-lg">
              <Crown className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="page-title">Welcome to TIES Together Studio</h1>
              <p className="text-muted-foreground">
                Professional event management workspace with unlimited collaboration tools - All features unlocked
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-1 mb-6 bg-muted rounded-lg p-1">
          {[
            { id: 'workspaces', label: 'My Workspaces', icon: FolderOpen },
            { id: 'team-projects', label: 'Team Projects', icon: Users },
            { id: 'templates', label: 'Template Library', icon: FileText },
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
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <IconComponent size={16} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Content based on active tab */}
        {activeTab === 'workspaces' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="section-header">Unlimited Studio Workspaces</h2>
              <button className="btn-primary flex items-center gap-2">
                <Plus size={16} />
                Create New Workspace
              </button>
            </div>

            {/* Search and Filter */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                <input
                  type="text"
                  placeholder="Search workspaces, events, or locations..."
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

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredWorkspaces.map((workspace) => (
                <WorkspaceCard key={workspace.id} workspace={workspace} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'team-projects' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="section-header">Collaborative Team Projects</h2>
              <button className="btn-primary flex items-center gap-2">
                <Plus size={16} />
                Join Team Project
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {mockWorkspaces.filter(w => w.collaborators > 8).map((workspace) => (
                <WorkspaceCard key={workspace.id} workspace={workspace} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'templates' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="section-header">Event Preset Kits & Templates</h2>
              <button className="btn-secondary flex items-center gap-2">
                <Plus size={16} />
                Create Custom Template
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {eventTemplates.map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'features' && (
          <div>
            <h2 className="section-header mb-6">Complete Studio Feature Suite - All Unlocked</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {studioFeatures.map((feature, index) => {
                const IconComponent = feature.icon
                return (
                  <div key={index} className="profile-card border-l-4 border-l-green-500">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-primary/20 text-primary">
                        <IconComponent size={24} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-foreground">{feature.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            feature.category === 'Pro' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {feature.category}
                          </span>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-xs text-green-600 font-medium">Active</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{feature.description}</p>
                        <button className="btn-secondary text-sm">
                          Configure Feature
                        </button>
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
            <h2 className="section-header mb-6">Studio Settings & Preferences</h2>
            
            <div className="space-y-6">
              <div className="profile-card">
                <h3 className="card-title mb-4">Workspace Defaults</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-foreground">Auto-assign Tasks by Role</div>
                      <div className="text-sm text-muted-foreground">
                        Automatically assign tasks based on collaborator roles and vendor tags
                      </div>
                    </div>
                    <input type="checkbox" className="toggle" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-foreground">Real-time Notifications</div>
                      <div className="text-sm text-muted-foreground">
                        Receive instant updates about workspace activity and messages
                      </div>
                    </div>
                    <input type="checkbox" className="toggle" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-foreground">Client Dashboard Access</div>
                      <div className="text-sm text-muted-foreground">
                        Enable client access to project progress and approval workflows
                      </div>
                    </div>
                    <input type="checkbox" className="toggle" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-foreground">Budget Alerts</div>
                      <div className="text-sm text-muted-foreground">
                        Get notified when spending approaches budget limits
                      </div>
                    </div>
                    <input type="checkbox" className="toggle" defaultChecked />
                  </div>
                </div>
              </div>
              
              <div className="profile-card">
                <h3 className="card-title mb-4">Template & Preset Management</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-foreground">Auto-save Custom Templates</div>
                      <div className="text-sm text-muted-foreground">
                        Automatically save workspace configurations as reusable templates
                      </div>
                    </div>
                    <input type="checkbox" className="toggle" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-foreground">Share Templates with Team</div>
                      <div className="text-sm text-muted-foreground">
                        Allow team members to access and use your custom templates
                      </div>
                    </div>
                    <input type="checkbox" className="toggle" defaultChecked />
                  </div>
                </div>
              </div>
              
              <div className="profile-card">
                <h3 className="card-title mb-4">File Management</h3>
                <div className="space-y-4">
                  <div>
                    <div className="font-medium text-foreground mb-2">Default File Organization</div>
                    <select className="w-full px-3 py-2 border border-border rounded-lg">
                      <option>By Event Type</option>
                      <option>By Date</option>
                      <option>By Team Member</option>
                      <option>Custom Structure</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-foreground">Version History</div>
                      <div className="text-sm text-muted-foreground">
                        Keep detailed version history for all uploaded files
                      </div>
                    </div>
                    <input type="checkbox" className="toggle" defaultChecked />
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

export default ComprehensiveStudioPage

