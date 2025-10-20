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
  School,
  X,
  Send,
  Paperclip,
  Image,
  Video,
  File,
  Save,
  Copy,
  ExternalLink
} from 'lucide-react'

const FunctionalStudioPage = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('workspaces')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All Status')
  const [selectedWorkspace, setSelectedWorkspace] = useState(null)
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showFileUpload, setShowFileUpload] = useState(false)
  const [showMessaging, setShowMessaging] = useState(false)
  const [showBudgetTracker, setShowBudgetTracker] = useState(false)
  const [showTeamManagement, setShowTeamManagement] = useState(false)
  const [showClientDashboard, setShowClientDashboard] = useState(false)
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState('overview')

  // State for functional features
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Setup main stage', assignee: 'Mike Johnson', dueDate: '2024-07-25', status: 'in-progress', priority: 'high' },
    { id: 2, title: 'Book catering vendor', assignee: 'Sarah Kim', dueDate: '2024-07-22', status: 'completed', priority: 'medium' },
    { id: 3, title: 'Security briefing', assignee: 'David Chen', dueDate: '2024-07-28', status: 'pending', priority: 'high' },
    { id: 4, title: 'Marketing materials', assignee: 'Lisa Park', dueDate: '2024-07-24', status: 'in-progress', priority: 'low' }
  ])

  const [messages, setMessages] = useState([
    { id: 1, sender: 'Mike Johnson', content: 'Stage setup is going well, should be done by tomorrow', timestamp: '2 hours ago', thread: 'Stage Setup' },
    { id: 2, sender: 'Sarah Kim', content: 'Catering confirmed for 200 people', timestamp: '4 hours ago', thread: 'Catering' },
    { id: 3, sender: 'David Chen', content: 'Security team briefing scheduled for Friday', timestamp: '1 day ago', thread: 'Security' }
  ])

  const [files, setFiles] = useState([
    { id: 1, name: 'Stage_Layout_Final.pdf', size: '2.4 MB', uploadedBy: 'Mike Johnson', uploadDate: '2024-07-20', type: 'pdf' },
    { id: 2, name: 'Catering_Contract.docx', size: '156 KB', uploadedBy: 'Sarah Kim', uploadDate: '2024-07-19', type: 'doc' },
    { id: 3, name: 'Security_Plan.xlsx', size: '890 KB', uploadedBy: 'David Chen', uploadDate: '2024-07-18', type: 'excel' },
    { id: 4, name: 'Marketing_Assets.zip', size: '15.2 MB', uploadedBy: 'Lisa Park', uploadDate: '2024-07-17', type: 'zip' }
  ])

  const [budgetData, setBudgetData] = useState({
    total: 25000,
    spent: 18500,
    categories: [
      { name: 'Venue', budgeted: 8000, spent: 8000, status: 'on-track' },
      { name: 'Sound & AV', budgeted: 6000, spent: 5200, status: 'under-budget' },
      { name: 'Security', budgeted: 4000, spent: 2800, status: 'under-budget' },
      { name: 'Marketing', budgeted: 3000, spent: 1500, status: 'under-budget' },
      { name: 'Catering', budgeted: 2500, spent: 800, status: 'under-budget' },
      { name: 'Miscellaneous', budgeted: 1500, spent: 200, status: 'under-budget' }
    ]
  })

  const [teamMembers, setTeamMembers] = useState([
    { id: 1, name: 'Mike Johnson', role: 'Sound Engineer', permissions: 'editor', avatar: 'MJ', status: 'active' },
    { id: 2, name: 'Sarah Kim', role: 'Event Manager', permissions: 'admin', avatar: 'SK', status: 'active' },
    { id: 3, name: 'David Chen', role: 'Security Lead', permissions: 'viewer', avatar: 'DC', status: 'active' },
    { id: 4, name: 'Lisa Park', role: 'Marketing', permissions: 'editor', avatar: 'LP', status: 'active' }
  ])

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
      progress: 67
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
      progress: 51
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
      progress: 100
    }
  ]

  // Functional Components
  const CreateWorkspaceModal = () => {
    const [workspaceData, setWorkspaceData] = useState({
      title: '',
      type: 'Festival',
      date: '',
      location: '',
      description: ''
    })

    const handleCreate = () => {
      console.log('Creating workspace:', workspaceData)
      setShowCreateWorkspace(false)
      // In real app, this would call API
    }

    if (!showCreateWorkspace) return null

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Create New Workspace</h3>
            <button onClick={() => setShowCreateWorkspace(false)}>
              <X size={20} />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Event Title</label>
              <input
                type="text"
                value={workspaceData.title}
                onChange={(e) => setWorkspaceData({...workspaceData, title: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20"
                placeholder="Enter event title"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Event Type</label>
              <select
                value={workspaceData.type}
                onChange={(e) => setWorkspaceData({...workspaceData, type: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20"
              >
                <option>Festival</option>
                <option>Exhibition</option>
                <option>Corporate</option>
                <option>Club Night</option>
                <option>Workshop</option>
                <option>Brand Event</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Event Date</label>
              <input
                type="date"
                value={workspaceData.date}
                onChange={(e) => setWorkspaceData({...workspaceData, date: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <input
                type="text"
                value={workspaceData.location}
                onChange={(e) => setWorkspaceData({...workspaceData, location: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20"
                placeholder="Enter location"
              />
            </div>
            
            <div className="flex gap-2 pt-4">
              <button
                onClick={handleCreate}
                className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
              >
                Create Workspace
              </button>
              <button
                onClick={() => setShowCreateWorkspace(false)}
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const TaskManagement = () => {
    const [showCreateTask, setShowCreateTask] = useState(false)
    const [newTask, setNewTask] = useState({
      title: '',
      assignee: '',
      dueDate: '',
      priority: 'medium',
      description: ''
    })

    const handleCreateTask = () => {
      const task = {
        id: tasks.length + 1,
        ...newTask,
        status: 'pending'
      }
      setTasks([...tasks, task])
      setNewTask({ title: '', assignee: '', dueDate: '', priority: 'medium', description: '' })
      setShowCreateTask(false)
    }

    const updateTaskStatus = (taskId, newStatus) => {
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      ))
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Task Management</h3>
          <button
            onClick={() => setShowCreateTask(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={16} />
            Add Task
          </button>
        </div>

        <div className="grid gap-3">
          {tasks.map(task => (
            <div key={task.id} className="profile-card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium">{task.title}</h4>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                    <span>Assigned to: {task.assignee}</span>
                    <span>Due: {task.dueDate}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      task.priority === 'high' ? 'bg-red-100 text-red-800' :
                      task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                </div>
                <select
                  value={task.status}
                  onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                  className="px-3 py-1 border rounded text-sm"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          ))}
        </div>

        {showCreateTask && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Create New Task</h3>
                <button onClick={() => setShowCreateTask(false)}>
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Task title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Assignee"
                  value={newTask.assignee}
                  onChange={(e) => setNewTask({...newTask, assignee: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
                
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateTask}
                    className="flex-1 bg-primary text-white px-4 py-2 rounded-lg"
                  >
                    Create Task
                  </button>
                  <button
                    onClick={() => setShowCreateTask(false)}
                    className="flex-1 bg-gray-200 px-4 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  const FileManagement = () => {
    const [dragOver, setDragOver] = useState(false)

    const handleFileUpload = (event) => {
      const uploadedFiles = Array.from(event.target.files)
      uploadedFiles.forEach(file => {
        const newFile = {
          id: files.length + 1,
          name: file.name,
          size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
          uploadedBy: user?.name || 'Current User',
          uploadDate: new Date().toISOString().split('T')[0],
          type: file.type.includes('pdf') ? 'pdf' : file.type.includes('image') ? 'image' : 'doc'
        }
        setFiles(prev => [...prev, newFile])
      })
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">File Management</h3>
          <label className="btn-primary flex items-center gap-2 cursor-pointer">
            <Upload size={16} />
            Upload Files
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        <div 
          className={`border-2 border-dashed rounded-lg p-8 text-center ${
            dragOver ? 'border-primary bg-primary/5' : 'border-gray-300'
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragOver(false)
            handleFileUpload(e)
          }}
        >
          <Upload className="mx-auto mb-2 text-gray-400" size={32} />
          <p className="text-gray-600">Drag and drop files here or click to upload</p>
        </div>

        <div className="grid gap-3">
          {files.map(file => (
            <div key={file.id} className="profile-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded">
                    <File size={20} />
                  </div>
                  <div>
                    <div className="font-medium">{file.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {file.size} • Uploaded by {file.uploadedBy} on {file.uploadDate}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-gray-100 rounded">
                    <Download size={16} />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded">
                    <Share2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const MessagingSystem = () => {
    const [newMessage, setNewMessage] = useState('')
    const [selectedThread, setSelectedThread] = useState('General')

    const handleSendMessage = () => {
      if (newMessage.trim()) {
        const message = {
          id: messages.length + 1,
          sender: user?.name || 'Current User',
          content: newMessage,
          timestamp: 'Just now',
          thread: selectedThread
        }
        setMessages([...messages, message])
        setNewMessage('')
      }
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Team Communication</h3>
          <select
            value={selectedThread}
            onChange={(e) => setSelectedThread(e.target.value)}
            className="px-3 py-1 border rounded"
          >
            <option>General</option>
            <option>Stage Setup</option>
            <option>Catering</option>
            <option>Security</option>
            <option>Marketing</option>
          </select>
        </div>

        <div className="profile-card max-h-96 overflow-y-auto">
          <div className="space-y-3">
            {messages.filter(msg => msg.thread === selectedThread).map(message => (
              <div key={message.id} className="border-b pb-3 last:border-b-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{message.sender}</span>
                  <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                </div>
                <p className="text-sm">{message.content}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20"
          />
          <button
            onClick={handleSendMessage}
            className="btn-primary flex items-center gap-2"
          >
            <Send size={16} />
            Send
          </button>
        </div>
      </div>
    )
  }

  const BudgetTracker = () => {
    const [showAddExpense, setShowAddExpense] = useState(false)
    const [newExpense, setNewExpense] = useState({
      category: 'Venue',
      amount: '',
      description: ''
    })

    const handleAddExpense = () => {
      const amount = parseFloat(newExpense.amount)
      if (amount > 0) {
        setBudgetData(prev => ({
          ...prev,
          spent: prev.spent + amount,
          categories: prev.categories.map(cat => 
            cat.name === newExpense.category 
              ? { ...cat, spent: cat.spent + amount }
              : cat
          )
        }))
        setNewExpense({ category: 'Venue', amount: '', description: '' })
        setShowAddExpense(false)
      }
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Budget Tracking</h3>
          <button
            onClick={() => setShowAddExpense(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={16} />
            Add Expense
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="profile-card">
            <div className="text-sm text-muted-foreground">Total Budget</div>
            <div className="text-2xl font-bold">${budgetData.total.toLocaleString()}</div>
          </div>
          <div className="profile-card">
            <div className="text-sm text-muted-foreground">Amount Spent</div>
            <div className="text-2xl font-bold text-red-600">${budgetData.spent.toLocaleString()}</div>
          </div>
          <div className="profile-card">
            <div className="text-sm text-muted-foreground">Remaining</div>
            <div className="text-2xl font-bold text-green-600">${(budgetData.total - budgetData.spent).toLocaleString()}</div>
          </div>
        </div>

        <div className="profile-card">
          <h4 className="font-semibold mb-4">Category Breakdown</h4>
          <div className="space-y-3">
            {budgetData.categories.map((category, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{category.name}</span>
                  <span>${category.spent.toLocaleString()} / ${category.budgeted.toLocaleString()}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      category.spent > category.budgeted ? 'bg-red-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min((category.spent / category.budgeted) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {showAddExpense && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Add Expense</h3>
                <button onClick={() => setShowAddExpense(false)}>
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <select
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  {budgetData.categories.map(cat => (
                    <option key={cat.name} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Amount"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
                
                <div className="flex gap-2">
                  <button
                    onClick={handleAddExpense}
                    className="flex-1 bg-primary text-white px-4 py-2 rounded-lg"
                  >
                    Add Expense
                  </button>
                  <button
                    onClick={() => setShowAddExpense(false)}
                    className="flex-1 bg-gray-200 px-4 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  const TeamManagement = () => {
    const [showInvite, setShowInvite] = useState(false)
    const [inviteData, setInviteData] = useState({
      email: '',
      role: 'Crew Member',
      permissions: 'viewer'
    })

    const handleInvite = () => {
      console.log('Inviting team member:', inviteData)
      setShowInvite(false)
      setInviteData({ email: '', role: 'Crew Member', permissions: 'viewer' })
    }

    const updatePermissions = (memberId, newPermissions) => {
      setTeamMembers(teamMembers.map(member => 
        member.id === memberId ? { ...member, permissions: newPermissions } : member
      ))
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Team Management</h3>
          <button
            onClick={() => setShowInvite(true)}
            className="btn-primary flex items-center gap-2"
          >
            <UserPlus size={16} />
            Invite Member
          </button>
        </div>

        <div className="grid gap-3">
          {teamMembers.map(member => (
            <div key={member.id} className="profile-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/20 text-primary rounded-full flex items-center justify-center font-medium">
                    {member.avatar}
                  </div>
                  <div>
                    <div className="font-medium">{member.name}</div>
                    <div className="text-sm text-muted-foreground">{member.role}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={member.permissions}
                    onChange={(e) => updatePermissions(member.id, e.target.value)}
                    className="px-3 py-1 border rounded text-sm"
                  >
                    <option value="admin">Admin</option>
                    <option value="editor">Editor</option>
                    <option value="viewer">Viewer</option>
                  </select>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    member.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {member.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {showInvite && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Invite Team Member</h3>
                <button onClick={() => setShowInvite(false)}>
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <input
                  type="email"
                  placeholder="Email address"
                  value={inviteData.email}
                  onChange={(e) => setInviteData({...inviteData, email: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Role (e.g., Sound Engineer)"
                  value={inviteData.role}
                  onChange={(e) => setInviteData({...inviteData, role: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
                <select
                  value={inviteData.permissions}
                  onChange={(e) => setInviteData({...inviteData, permissions: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="viewer">Viewer - Can view project</option>
                  <option value="editor">Editor - Can edit and contribute</option>
                  <option value="admin">Admin - Full access</option>
                </select>
                
                <div className="flex gap-2">
                  <button
                    onClick={handleInvite}
                    className="flex-1 bg-primary text-white px-4 py-2 rounded-lg"
                  >
                    Send Invite
                  </button>
                  <button
                    onClick={() => setShowInvite(false)}
                    className="flex-1 bg-gray-200 px-4 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  const ClientDashboard = () => {
    const [clientAccess, setClientAccess] = useState({
      enabled: true,
      permissions: ['view-progress', 'approve-milestones', 'view-budget-summary'],
      clientEmail: 'client@example.com'
    })

    const toggleClientAccess = () => {
      setClientAccess(prev => ({ ...prev, enabled: !prev.enabled }))
    }

    const generateClientLink = () => {
      const link = `https://ties-studio.com/client/${selectedWorkspace?.id || 1}/dashboard`
      navigator.clipboard.writeText(link)
      alert('Client link copied to clipboard!')
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Client Dashboard Access</h3>
          <button
            onClick={toggleClientAccess}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              clientAccess.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}
          >
            {clientAccess.enabled ? <Unlock size={16} /> : <Lock size={16} />}
            {clientAccess.enabled ? 'Enabled' : 'Disabled'}
          </button>
        </div>

        {clientAccess.enabled && (
          <div className="space-y-4">
            <div className="profile-card">
              <h4 className="font-semibold mb-3">Client Permissions</h4>
              <div className="space-y-2">
                {[
                  { id: 'view-progress', label: 'View project progress' },
                  { id: 'approve-milestones', label: 'Approve milestones' },
                  { id: 'view-budget-summary', label: 'View budget summary' },
                  { id: 'download-reports', label: 'Download reports' },
                  { id: 'comment-tasks', label: 'Comment on tasks' }
                ].map(permission => (
                  <label key={permission.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={clientAccess.permissions.includes(permission.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setClientAccess(prev => ({
                            ...prev,
                            permissions: [...prev.permissions, permission.id]
                          }))
                        } else {
                          setClientAccess(prev => ({
                            ...prev,
                            permissions: prev.permissions.filter(p => p !== permission.id)
                          }))
                        }
                      }}
                    />
                    <span className="text-sm">{permission.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="profile-card">
              <h4 className="font-semibold mb-3">Client Access</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Client Email</label>
                  <input
                    type="email"
                    value={clientAccess.clientEmail}
                    onChange={(e) => setClientAccess(prev => ({ ...prev, clientEmail: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <button
                  onClick={generateClientLink}
                  className="btn-secondary flex items-center gap-2"
                >
                  <Share2 size={16} />
                  Generate & Copy Client Link
                </button>
              </div>
            </div>

            <div className="profile-card">
              <h4 className="font-semibold mb-3">Client View Preview</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-muted-foreground mb-2">What clients see:</div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Project Progress</span>
                    <span className="font-medium">67% Complete</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '67%' }}></div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Next Milestone</span>
                    <span>Stage Setup - Due July 25</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  const WorkspaceDetail = ({ workspace }) => {
    if (!workspace) return null

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button
            onClick={() => setActiveWorkspaceTab('overview')}
            className={`p-4 rounded-lg text-left ${
              activeWorkspaceTab === 'overview' ? 'bg-primary text-white' : 'bg-gray-100'
            }`}
          >
            <Eye size={20} className="mb-2" />
            <div className="font-medium">Overview</div>
          </button>
          <button
            onClick={() => setActiveWorkspaceTab('tasks')}
            className={`p-4 rounded-lg text-left ${
              activeWorkspaceTab === 'tasks' ? 'bg-primary text-white' : 'bg-gray-100'
            }`}
          >
            <CheckCircle size={20} className="mb-2" />
            <div className="font-medium">Tasks</div>
          </button>
          <button
            onClick={() => setActiveWorkspaceTab('files')}
            className={`p-4 rounded-lg text-left ${
              activeWorkspaceTab === 'files' ? 'bg-primary text-white' : 'bg-gray-100'
            }`}
          >
            <FileText size={20} className="mb-2" />
            <div className="font-medium">Files</div>
          </button>
          <button
            onClick={() => setActiveWorkspaceTab('team')}
            className={`p-4 rounded-lg text-left ${
              activeWorkspaceTab === 'team' ? 'bg-primary text-white' : 'bg-gray-100'
            }`}
          >
            <Users size={20} className="mb-2" />
            <div className="font-medium">Team</div>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button
            onClick={() => setActiveWorkspaceTab('messages')}
            className={`p-4 rounded-lg text-left ${
              activeWorkspaceTab === 'messages' ? 'bg-primary text-white' : 'bg-gray-100'
            }`}
          >
            <MessageSquare size={20} className="mb-2" />
            <div className="font-medium">Messages</div>
          </button>
          <button
            onClick={() => setActiveWorkspaceTab('budget')}
            className={`p-4 rounded-lg text-left ${
              activeWorkspaceTab === 'budget' ? 'bg-primary text-white' : 'bg-gray-100'
            }`}
          >
            <DollarSign size={20} className="mb-2" />
            <div className="font-medium">Budget</div>
          </button>
          <button
            onClick={() => setActiveWorkspaceTab('client')}
            className={`p-4 rounded-lg text-left ${
              activeWorkspaceTab === 'client' ? 'bg-primary text-white' : 'bg-gray-100'
            }`}
          >
            <Shield size={20} className="mb-2" />
            <div className="font-medium">Client Access</div>
          </button>
          <button
            onClick={() => setActiveWorkspaceTab('settings')}
            className={`p-4 rounded-lg text-left ${
              activeWorkspaceTab === 'settings' ? 'bg-primary text-white' : 'bg-gray-100'
            }`}
          >
            <Settings size={20} className="mb-2" />
            <div className="font-medium">Settings</div>
          </button>
        </div>

        <div className="bg-white rounded-lg">
          {activeWorkspaceTab === 'overview' && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">{workspace.title}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="profile-card">
                  <div className="text-sm text-muted-foreground">Progress</div>
                  <div className="text-2xl font-bold">{workspace.progress}%</div>
                  <div className="w-full bg-muted rounded-full h-2 mt-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${workspace.progress}%` }}
                    ></div>
                  </div>
                </div>
                <div className="profile-card">
                  <div className="text-sm text-muted-foreground">Budget Used</div>
                  <div className="text-2xl font-bold">${workspace.spent.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">of ${workspace.budget.toLocaleString()}</div>
                </div>
                <div className="profile-card">
                  <div className="text-sm text-muted-foreground">Team Size</div>
                  <div className="text-2xl font-bold">{workspace.collaborators}</div>
                  <div className="text-sm text-muted-foreground">collaborators</div>
                </div>
              </div>
            </div>
          )}
          {activeWorkspaceTab === 'tasks' && <TaskManagement />}
          {activeWorkspaceTab === 'files' && <FileManagement />}
          {activeWorkspaceTab === 'team' && <TeamManagement />}
          {activeWorkspaceTab === 'messages' && <MessagingSystem />}
          {activeWorkspaceTab === 'budget' && <BudgetTracker />}
          {activeWorkspaceTab === 'client' && <ClientDashboard />}
          {activeWorkspaceTab === 'settings' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Workspace Settings</h3>
              <div className="profile-card">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Workspace Name</label>
                    <input
                      type="text"
                      value={workspace.title}
                      className="w-full px-3 py-2 border rounded-lg"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Event Type</label>
                    <input
                      type="text"
                      value={workspace.type}
                      className="w-full px-3 py-2 border rounded-lg"
                      readOnly
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Archive Workspace</div>
                      <div className="text-sm text-muted-foreground">
                        Archive this workspace when the event is complete
                      </div>
                    </div>
                    <button className="btn-secondary">
                      Archive
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

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
              <h1 className="page-title">TIES Together Studio</h1>
              <p className="text-muted-foreground">
                Professional event management workspace with fully functional collaboration tools
              </p>
            </div>
          </div>
        </div>

        {selectedWorkspace ? (
          <div>
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => setSelectedWorkspace(null)}
                className="btn-secondary flex items-center gap-2"
              >
                ← Back to Workspaces
              </button>
              <h2 className="text-xl font-semibold">{selectedWorkspace.title}</h2>
            </div>
            <WorkspaceDetail workspace={selectedWorkspace} />
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="section-header">My Studio Workspaces</h2>
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
      </div>

      <CreateWorkspaceModal />
    </div>
  )
}

export default FunctionalStudioPage

