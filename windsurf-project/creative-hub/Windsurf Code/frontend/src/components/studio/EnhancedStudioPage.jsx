import React, { useState, useEffect } from 'react'
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
  Archive,
  Crown,
  Shield,
  Bell,
  Share2,
  Eye,
  Lock,
  Unlock,
  Tag,
  Calendar as CalendarIcon,
  FileUpload,
  MessageCircle,
  TrendingUp,
  PieChart,
  Activity,
  Briefcase,
  MapPin,
  Phone,
  Mail,
  Globe,
  Camera,
  Video,
  Mic,
  Headphones,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Server,
  Database,
  Cloud,
  Wifi,
  Bluetooth,
  Usb,
  HardDrive,
  Cpu,
  Memory,
  Battery,
  Power,
  Lightbulb,
  Palette,
  Brush,
  Scissors,
  Ruler,
  Compass,
  Map,
  Navigation,
  Route,
  Car,
  Truck,
  Plane,
  Ship,
  Train,
  Bus,
  Bike,
  Walk,
  Home,
  Building,
  Store,
  Factory,
  Warehouse,
  School,
  Hospital,
  Bank,
  Restaurant,
  Hotel,
  Church,
  Park,
  Beach,
  Mountain,
  Forest,
  River,
  Lake,
  Sun,
  Moon,
  Cloud as CloudIcon,
  Rain,
  Snow,
  Wind,
  Thermometer,
  Umbrella,
  Glasses,
  Watch,
  Shirt,
  Hat,
  Shoe,
  Bag,
  Gift,
  Heart,
  Smile,
  Frown,
  Meh,
  Angry,
  Surprised,
  Confused,
  Sleepy,
  Cool,
  Nerd,
  Wink,
  Kiss,
  Tongue,
  Cry,
  Laugh,
  Love,
  Broken,
  Thumbs,
  Clap,
  Wave,
  Point,
  Finger,
  Hand,
  Fist,
  Peace,
  Rock,
  Paper,
  Scissors as ScissorsIcon,
  Spock,
  Lizard,
  X
} from 'lucide-react'

const EnhancedStudioPage = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('workspaces')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All Status')
  const [selectedWorkspace, setSelectedWorkspace] = useState(null)
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showFileModal, setShowFileModal] = useState(false)
  const [showBudgetModal, setShowBudgetModal] = useState(false)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [showMessageModal, setShowMessageModal] = useState(false)

  // Mock data for comprehensive Studio features
  const mockWorkspaces = [
    {
      id: 1,
      title: 'Summer Music Festival 2024',
      type: 'Festival',
      date: '2024-08-15',
      location: 'Central Park',
      status: 'In Progress',
      collaborators: [
        { id: 1, name: 'Sarah Kim', role: 'Event Manager', avatar: 'SK', permissions: 'admin' },
        { id: 2, name: 'Mike Johnson', role: 'Sound Engineer', avatar: 'MJ', permissions: 'editor' },
        { id: 3, name: 'Emma Wilson', role: 'Stage Designer', avatar: 'EW', permissions: 'editor' },
        { id: 4, name: 'David Chen', role: 'Security Lead', avatar: 'DC', permissions: 'viewer' },
        { id: 5, name: 'Lisa Park', role: 'Marketing', avatar: 'LP', permissions: 'editor' }
      ],
      tasks: {
        total: 67,
        completed: 45,
        inProgress: 15,
        pending: 7,
        overdue: 3
      },
      budget: {
        total: 25000,
        spent: 18500,
        categories: [
          { name: 'Venue', budgeted: 8000, spent: 8000 },
          { name: 'Sound & AV', budgeted: 6000, spent: 5200 },
          { name: 'Security', budgeted: 4000, spent: 2800 },
          { name: 'Marketing', budgeted: 3000, spent: 1500 },
          { name: 'Catering', budgeted: 2500, spent: 800 },
          { name: 'Miscellaneous', budgeted: 1500, spent: 200 }
        ]
      },
      files: {
        total: 156,
        categories: [
          { name: 'Contracts', count: 23 },
          { name: 'Design Assets', count: 45 },
          { name: 'Audio Files', count: 32 },
          { name: 'Photos', count: 28 },
          { name: 'Documents', count: 18 },
          { name: 'Videos', count: 10 }
        ]
      },
      messages: {
        unread: 12,
        total: 234,
        threads: [
          { id: 1, title: 'Stage Setup Discussion', participants: 4, lastMessage: '2 hours ago' },
          { id: 2, title: 'Sound Check Schedule', participants: 3, lastMessage: '4 hours ago' },
          { id: 3, title: 'Security Briefing', participants: 6, lastMessage: '1 day ago' }
        ]
      },
      timeline: [
        { date: '2024-07-01', milestone: 'Venue Booking Confirmed', status: 'completed' },
        { date: '2024-07-15', milestone: 'Artist Lineup Finalized', status: 'completed' },
        { date: '2024-08-01', milestone: 'Stage Design Approval', status: 'in-progress' },
        { date: '2024-08-10', milestone: 'Final Sound Check', status: 'pending' },
        { date: '2024-08-15', milestone: 'Event Day', status: 'pending' }
      ],
      clientAccess: {
        enabled: true,
        permissions: ['view-progress', 'approve-milestones', 'view-budget-summary'],
        lastLogin: '2024-07-20'
      }
    },
    {
      id: 2,
      title: 'Art Gallery Opening',
      type: 'Exhibition',
      date: '2024-07-30',
      location: 'Downtown Gallery',
      status: 'Planning',
      collaborators: [
        { id: 6, name: 'Anna Rodriguez', role: 'Curator', avatar: 'AR', permissions: 'admin' },
        { id: 7, name: 'Tom Wilson', role: 'Installation', avatar: 'TW', permissions: 'editor' },
        { id: 8, name: 'Grace Lee', role: 'PR Manager', avatar: 'GL', permissions: 'editor' }
      ],
      tasks: {
        total: 45,
        completed: 23,
        inProgress: 12,
        pending: 8,
        overdue: 2
      },
      budget: {
        total: 12000,
        spent: 3200,
        categories: [
          { name: 'Artwork Transport', budgeted: 3000, spent: 1200 },
          { name: 'Installation', budgeted: 2500, spent: 800 },
          { name: 'Marketing', budgeted: 2000, spent: 600 },
          { name: 'Catering', budgeted: 1500, spent: 400 },
          { name: 'Security', budgeted: 1000, spent: 200 },
          { name: 'Miscellaneous', budgeted: 2000, spent: 0 }
        ]
      },
      files: {
        total: 89,
        categories: [
          { name: 'Artwork Images', count: 34 },
          { name: 'Installation Plans', count: 15 },
          { name: 'Press Materials', count: 12 },
          { name: 'Contracts', count: 11 },
          { name: 'Floor Plans', count: 9 },
          { name: 'Other', count: 8 }
        ]
      },
      messages: {
        unread: 5,
        total: 127,
        threads: [
          { id: 4, title: 'Artwork Placement', participants: 3, lastMessage: '1 hour ago' },
          { id: 5, title: 'Opening Night Logistics', participants: 5, lastMessage: '3 hours ago' }
        ]
      },
      timeline: [
        { date: '2024-07-01', milestone: 'Venue Confirmed', status: 'completed' },
        { date: '2024-07-15', milestone: 'Artwork Selection', status: 'completed' },
        { date: '2024-07-25', milestone: 'Installation Begins', status: 'pending' },
        { date: '2024-07-30', milestone: 'Opening Night', status: 'pending' }
      ],
      clientAccess: {
        enabled: false,
        permissions: [],
        lastLogin: null
      }
    },
    {
      id: 3,
      title: 'Corporate Brand Launch',
      type: 'Brand Event',
      date: '2024-09-10',
      location: 'Convention Center',
      status: 'Completed',
      collaborators: [
        { id: 9, name: 'Robert Kim', role: 'Event Producer', avatar: 'RK', permissions: 'admin' },
        { id: 10, name: 'Jennifer Liu', role: 'Brand Manager', avatar: 'JL', permissions: 'admin' },
        { id: 11, name: 'Carlos Martinez', role: 'AV Coordinator', avatar: 'CM', permissions: 'editor' }
      ],
      tasks: {
        total: 89,
        completed: 89,
        inProgress: 0,
        pending: 0,
        overdue: 0
      },
      budget: {
        total: 45000,
        spent: 43200,
        categories: [
          { name: 'Venue', budgeted: 15000, spent: 15000 },
          { name: 'AV Equipment', budgeted: 12000, spent: 11800 },
          { name: 'Catering', budgeted: 8000, spent: 7500 },
          { name: 'Marketing', budgeted: 5000, spent: 4200 },
          { name: 'Decor', budgeted: 3000, spent: 2800 },
          { name: 'Staff', budgeted: 2000, spent: 1900 }
        ]
      },
      files: {
        total: 203,
        categories: [
          { name: 'Event Photos', count: 67 },
          { name: 'Brand Assets', count: 45 },
          { name: 'Presentations', count: 23 },
          { name: 'Contracts', count: 19 },
          { name: 'Reports', count: 15 },
          { name: 'Other', count: 34 }
        ]
      },
      messages: {
        unread: 0,
        total: 456,
        threads: [
          { id: 6, title: 'Post-Event Review', participants: 8, lastMessage: '2 weeks ago' },
          { id: 7, title: 'Final Reports', participants: 4, lastMessage: '2 weeks ago' }
        ]
      },
      timeline: [
        { date: '2024-08-01', milestone: 'Planning Complete', status: 'completed' },
        { date: '2024-08-15', milestone: 'Venue Setup', status: 'completed' },
        { date: '2024-09-10', milestone: 'Event Execution', status: 'completed' },
        { date: '2024-09-15', milestone: 'Post-Event Report', status: 'completed' }
      ],
      clientAccess: {
        enabled: true,
        permissions: ['view-all', 'download-reports'],
        lastLogin: '2024-09-20'
      }
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

  const studioFeatures = [
    {
      icon: FolderOpen,
      title: 'Unlimited Studio Workspaces',
      description: 'Manage multiple event-based projects simultaneously with dedicated workspaces for each event',
      category: 'Core',
      status: 'active'
    },
    {
      icon: Users,
      title: 'Collaborator Access & Role Permissions',
      description: 'Invite crew, clients, or co-organisers with tiered access control (Admin, Editor, Viewer)',
      category: 'Core',
      status: 'active'
    },
    {
      icon: CheckCircle,
      title: 'Task Management Suite',
      description: 'Create tasks with deadlines, assign roles, build timelines, and use shared calendars',
      category: 'Core',
      status: 'active'
    },
    {
      icon: FileText,
      title: 'Template Library',
      description: 'Reusable templates for budgets, run sheets, crew packs, and task workflows',
      category: 'Pro',
      status: 'active'
    },
    {
      icon: Target,
      title: 'Vendor & Role Tagging',
      description: 'Automate task delegation based on service types (e.g. AV, decor, security)',
      category: 'Pro',
      status: 'active'
    },
    {
      icon: MessageSquare,
      title: 'In-Studio Messaging & Notifications',
      description: 'Threaded communication tied to tasks, files, and updates with real-time notifications',
      category: 'Core',
      status: 'active'
    },
    {
      icon: Upload,
      title: 'File Management System',
      description: 'Upload files with version history, folder organisation, and real-time comments',
      category: 'Core',
      status: 'active'
    },
    {
      icon: BarChart3,
      title: 'Budget Tracking & Reporting',
      description: 'Estimate vs actual budget view with exportable summaries for clients',
      category: 'Pro',
      status: 'active'
    },
    {
      icon: Eye,
      title: 'Client Dashboard View',
      description: 'Grant limited access to stakeholders for approval, visibility, and signoffs',
      category: 'Pro',
      status: 'active'
    },
    {
      icon: TrendingUp,
      title: 'Progress Reporting',
      description: 'Generate project summaries and update reports at milestones',
      category: 'Pro',
      status: 'active'
    },
    {
      icon: Zap,
      title: 'Event Preset Kits',
      description: 'Pre-built role/task templates tailored to event types (e.g. DJ night, festival, exhibition)',
      category: 'Pro',
      status: 'active'
    },
    {
      icon: UserPlus,
      title: 'Co-Organiser Support',
      description: 'Invite assistants, producers, or collaborators into shared management roles',
      category: 'Core',
      status: 'active'
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
    <div 
      className="profile-card hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-primary"
      onClick={() => setSelectedWorkspace(workspace)}
    >
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
              <CalendarIcon size={14} />
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
                style={{ width: `${(workspace.tasks.completed / workspace.tasks.total) * 100}%` }}
              ></div>
            </div>
            <span className="text-sm font-medium">
              {workspace.tasks.completed}/{workspace.tasks.total}
            </span>
          </div>
        </div>
        
        <div>
          <div className="text-sm text-muted-foreground mb-1">Budget</div>
          <div className="text-sm font-medium">
            ${workspace.budget.spent.toLocaleString()} / ${workspace.budget.total.toLocaleString()}
          </div>
          <div className="w-full bg-muted rounded-full h-1 mt-1">
            <div 
              className="bg-green-500 h-1 rounded-full" 
              style={{ width: `${(workspace.budget.spent / workspace.budget.total) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {workspace.collaborators.slice(0, 4).map((collaborator, index) => (
              <div 
                key={collaborator.id} 
                className="w-8 h-8 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs border-2 border-white font-medium"
                title={collaborator.name}
              >
                {collaborator.avatar}
              </div>
            ))}
            {workspace.collaborators.length > 4 && (
              <div className="w-8 h-8 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center text-xs border-2 border-white">
                +{workspace.collaborators.length - 4}
              </div>
            )}
          </div>
          <span className="text-sm text-muted-foreground">
            {workspace.collaborators.length} collaborators
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {workspace.messages.unread > 0 && (
            <div className="flex items-center gap-1 text-sm text-red-600">
              <MessageCircle size={14} />
              <span>{workspace.messages.unread}</span>
            </div>
          )}
          <button className="btn-secondary text-sm">
            Open Studio
          </button>
        </div>
      </div>
    </div>
  )

  const WorkspaceDetailModal = ({ workspace, onClose }) => {
    const [activeDetailTab, setActiveDetailTab] = useState('overview')
    
    if (!workspace) return null

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h2 className="text-2xl font-bold text-foreground">{workspace.title}</h2>
              <div className="flex items-center gap-2 mt-2">
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
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="flex">
            <div className="w-64 border-r bg-gray-50 p-4">
              <nav className="space-y-2">
                {[
                  { id: 'overview', label: 'Overview', icon: Eye },
                  { id: 'tasks', label: 'Tasks', icon: CheckCircle },
                  { id: 'team', label: 'Team', icon: Users },
                  { id: 'budget', label: 'Budget', icon: DollarSign },
                  { id: 'files', label: 'Files', icon: FileText },
                  { id: 'messages', label: 'Messages', icon: MessageSquare },
                  { id: 'timeline', label: 'Timeline', icon: Clock },
                  { id: 'client', label: 'Client Access', icon: Shield }
                ].map((tab) => {
                  const IconComponent = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveDetailTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeDetailTab === tab.id
                          ? 'bg-primary text-white'
                          : 'text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <IconComponent size={16} />
                      {tab.label}
                    </button>
                  )
                })}
              </nav>
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {activeDetailTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="profile-card">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                          <CheckCircle size={20} />
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Tasks Progress</div>
                          <div className="font-semibold">{workspace.tasks.completed}/{workspace.tasks.total}</div>
                        </div>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${(workspace.tasks.completed / workspace.tasks.total) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="profile-card">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                          <DollarSign size={20} />
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Budget Used</div>
                          <div className="font-semibold">${workspace.budget.spent.toLocaleString()}</div>
                        </div>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${(workspace.budget.spent / workspace.budget.total) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="profile-card">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                          <Users size={20} />
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Team Members</div>
                          <div className="font-semibold">{workspace.collaborators.length}</div>
                        </div>
                      </div>
                      <div className="flex -space-x-2">
                        {workspace.collaborators.slice(0, 5).map((collaborator) => (
                          <div 
                            key={collaborator.id} 
                            className="w-8 h-8 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs border-2 border-white font-medium"
                            title={collaborator.name}
                          >
                            {collaborator.avatar}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="profile-card">
                    <h3 className="card-title mb-4">Event Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Event Date</div>
                        <div className="font-medium">{workspace.date}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Location</div>
                        <div className="font-medium">{workspace.location}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Event Type</div>
                        <div className="font-medium">{workspace.type}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Status</div>
                        <div className="font-medium">{workspace.status}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {activeDetailTab === 'team' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Team Members</h3>
                    <button 
                      onClick={() => setShowInviteModal(true)}
                      className="btn-primary flex items-center gap-2"
                    >
                      <UserPlus size={16} />
                      Invite Member
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {workspace.collaborators.map((collaborator) => (
                      <div key={collaborator.id} className="profile-card">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-primary/20 text-primary rounded-full flex items-center justify-center font-medium">
                              {collaborator.avatar}
                            </div>
                            <div>
                              <div className="font-medium">{collaborator.name}</div>
                              <div className="text-sm text-muted-foreground">{collaborator.role}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              collaborator.permissions === 'admin' ? 'bg-red-100 text-red-800' :
                              collaborator.permissions === 'editor' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {collaborator.permissions}
                            </span>
                            <button className="p-2 hover:bg-muted rounded-lg">
                              <MoreHorizontal size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {activeDetailTab === 'budget' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Budget Overview</h3>
                    <button className="btn-secondary flex items-center gap-2">
                      <Download size={16} />
                      Export Report
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="profile-card">
                      <h4 className="font-semibold mb-4">Budget Summary</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Budget</span>
                          <span className="font-medium">${workspace.budget.total.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Amount Spent</span>
                          <span className="font-medium text-red-600">${workspace.budget.spent.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Remaining</span>
                          <span className="font-medium text-green-600">${(workspace.budget.total - workspace.budget.spent).toLocaleString()}</span>
                        </div>
                        <div className="pt-2 border-t">
                          <div className="flex justify-between">
                            <span className="font-medium">Budget Used</span>
                            <span className="font-medium">{Math.round((workspace.budget.spent / workspace.budget.total) * 100)}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2 mt-2">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{ width: `${(workspace.budget.spent / workspace.budget.total) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="profile-card">
                      <h4 className="font-semibold mb-4">Category Breakdown</h4>
                      <div className="space-y-3">
                        {workspace.budget.categories.map((category, index) => (
                          <div key={index} className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>{category.name}</span>
                              <span>${category.spent.toLocaleString()} / ${category.budgeted.toLocaleString()}</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-1">
                              <div 
                                className={`h-1 rounded-full ${
                                  category.spent > category.budgeted ? 'bg-red-500' : 'bg-green-500'
                                }`}
                                style={{ width: `${Math.min((category.spent / category.budgeted) * 100, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {activeDetailTab === 'files' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">File Management</h3>
                    <button 
                      onClick={() => setShowFileModal(true)}
                      className="btn-primary flex items-center gap-2"
                    >
                      <Upload size={16} />
                      Upload Files
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    {workspace.files.categories.map((category, index) => (
                      <div key={index} className="profile-card text-center">
                        <div className="p-3 bg-primary/20 text-primary rounded-lg w-fit mx-auto mb-2">
                          <FileText size={24} />
                        </div>
                        <div className="font-medium">{category.name}</div>
                        <div className="text-sm text-muted-foreground">{category.count} files</div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="profile-card">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold">Recent Files</h4>
                      <button className="text-sm text-primary hover:underline">View All</button>
                    </div>
                    <div className="space-y-3">
                      {[
                        { name: 'Stage_Layout_Final.pdf', type: 'PDF', size: '2.4 MB', modified: '2 hours ago' },
                        { name: 'Artist_Contracts.zip', type: 'ZIP', size: '15.7 MB', modified: '1 day ago' },
                        { name: 'Sound_Check_Schedule.xlsx', type: 'Excel', size: '156 KB', modified: '2 days ago' },
                        { name: 'Marketing_Assets.zip', type: 'ZIP', size: '45.2 MB', modified: '3 days ago' }
                      ].map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-100 rounded">
                              <FileText size={16} />
                            </div>
                            <div>
                              <div className="font-medium">{file.name}</div>
                              <div className="text-sm text-muted-foreground">{file.type} • {file.size}</div>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {file.modified}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {activeDetailTab === 'messages' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Team Communication</h3>
                    <button 
                      onClick={() => setShowMessageModal(true)}
                      className="btn-primary flex items-center gap-2"
                    >
                      <MessageSquare size={16} />
                      New Thread
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {workspace.messages.threads.map((thread) => (
                      <div key={thread.id} className="profile-card hover:shadow-md transition-shadow cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                              <MessageCircle size={16} />
                            </div>
                            <div>
                              <div className="font-medium">{thread.title}</div>
                              <div className="text-sm text-muted-foreground">
                                {thread.participants} participants • Last message {thread.lastMessage}
                              </div>
                            </div>
                          </div>
                          <button className="btn-secondary text-sm">
                            View Thread
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {activeDetailTab === 'timeline' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Project Timeline</h3>
                  
                  <div className="space-y-4">
                    {workspace.timeline.map((milestone, index) => (
                      <div key={index} className="flex items-start gap-4">
                        <div className={`w-4 h-4 rounded-full mt-2 ${
                          milestone.status === 'completed' ? 'bg-green-500' :
                          milestone.status === 'in-progress' ? 'bg-blue-500' :
                          'bg-gray-300'
                        }`}></div>
                        <div className="flex-1 pb-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{milestone.milestone}</div>
                              <div className="text-sm text-muted-foreground">{milestone.date}</div>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              milestone.status === 'completed' ? 'bg-green-100 text-green-800' :
                              milestone.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {milestone.status.replace('-', ' ')}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {activeDetailTab === 'client' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Client Access Management</h3>
                  
                  <div className="profile-card">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-semibold">Client Dashboard Access</h4>
                        <p className="text-sm text-muted-foreground">
                          Grant limited access to stakeholders for approvals and visibility
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {workspace.clientAccess.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                        <button className={`p-2 rounded-lg ${
                          workspace.clientAccess.enabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {workspace.clientAccess.enabled ? <Unlock size={16} /> : <Lock size={16} />}
                        </button>
                      </div>
                    </div>
                    
                    {workspace.clientAccess.enabled && (
                      <div className="space-y-4">
                        <div>
                          <div className="text-sm font-medium mb-2">Client Permissions</div>
                          <div className="space-y-2">
                            {workspace.clientAccess.permissions.map((permission, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <CheckCircle size={14} className="text-green-500" />
                                <span className="text-sm">{permission.replace('-', ' ')}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {workspace.clientAccess.lastLogin && (
                          <div>
                            <div className="text-sm font-medium mb-1">Last Client Login</div>
                            <div className="text-sm text-muted-foreground">{workspace.clientAccess.lastLogin}</div>
                          </div>
                        )}
                        
                        <button className="btn-secondary flex items-center gap-2">
                          <Share2 size={16} />
                          Share Client Link
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

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
          <button 
            onClick={() => setShowTemplateModal(template)}
            className="btn-primary text-sm"
          >
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
                Professional event management workspace with unlimited collaboration tools
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
              <button 
                onClick={() => setShowCreateWorkspace(true)}
                className="btn-primary flex items-center gap-2"
              >
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
              {mockWorkspaces.filter(w => w.collaborators.length > 3).map((workspace) => (
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
            <h2 className="section-header mb-6">Complete Studio Feature Suite</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {studioFeatures.map((feature, index) => {
                const IconComponent = feature.icon
                return (
                  <div key={index} className="profile-card border-l-4 border-l-primary">
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
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{feature.description}</p>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-green-600 font-medium">Active & Available</span>
                        </div>
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

      {/* Workspace Detail Modal */}
      {selectedWorkspace && (
        <WorkspaceDetailModal 
          workspace={selectedWorkspace} 
          onClose={() => setSelectedWorkspace(null)} 
        />
      )}
    </div>
  )
}

export default EnhancedStudioPage

