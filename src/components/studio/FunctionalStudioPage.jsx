import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../App'
import { getJobPostings, getExpensesForJob, addExpense, getMessagesForJob, sendMessage, getTeamMembers, getFilesForJob, uploadFile, deleteFile, getTasksForJob, createTask, updateTask, deleteTask, updateJobPosting, addRoleToJob, updateJobRole, deleteJobRole } from '../../api/jobs'
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
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('jobs')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All Status')
  const [selectedWorkspace, setSelectedWorkspace] = useState(null)
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false)
  const [jobs, setJobs] = useState([])
  const [loadingJobs, setLoadingJobs] = useState(true)
  const [selectedJob, setSelectedJob] = useState(null)
  const [activeJobTab, setActiveJobTab] = useState('overview')
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showFileUpload, setShowFileUpload] = useState(false)
  const [showMessaging, setShowMessaging] = useState(false)
  const [showBudgetTracker, setShowBudgetTracker] = useState(false)
  const [showTeamManagement, setShowTeamManagement] = useState(false)
  const [showClientDashboard, setShowClientDashboard] = useState(false)
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState('overview')

  // Load jobs on component mount
  useEffect(() => {
    loadJobs()
  }, [])

  const loadJobs = async () => {
    setLoadingJobs(true)
    const result = await getJobPostings()
    if (result.success) {
      // Filter only jobs created by this user
      const myJobs = result.data.filter(job => job.organiser_id === user?.id)
      setJobs(myJobs)
    }
    setLoadingJobs(false)
  }

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

  const JobDetail = ({ job }) => {
    if (!job) return null

    // State for expenses
    const [expenses, setExpenses] = useState([])
    const [loadingExpenses, setLoadingExpenses] = useState(false)
    const [showAddExpense, setShowAddExpense] = useState(false)
    const [newExpense, setNewExpense] = useState({
      category: '',
      amount: '',
      description: ''
    })

    // State for messages
    const [messages, setMessages] = useState([])
    const [loadingMessages, setLoadingMessages] = useState(false)
    const [activeThread, setActiveThread] = useState('general')
    const [newMessage, setNewMessage] = useState('')
    const [teamMembers, setTeamMembers] = useState([])

    // State for files
    const [files, setFiles] = useState([])
    const [loadingFiles, setLoadingFiles] = useState(false)
    const [uploadingFile, setUploadingFile] = useState(false)
    const [dragActive, setDragActive] = useState(false)

    // State for tasks
    const [tasks, setTasks] = useState([])
    const [loadingTasks, setLoadingTasks] = useState(false)
    const [showAddTask, setShowAddTask] = useState(false)
    const [newTask, setNewTask] = useState({
      title: '',
      description: '',
      priority: 'medium',
      assigned_to: '',
      due_date: ''
    })

    // State for job editing (Phase 5C)
    const [isEditingJob, setIsEditingJob] = useState(false)
    const [editedJob, setEditedJob] = useState({
      title: job.title || '',
      description: job.description || '',
      location: job.location || '',
      event_type: job.event_type || '',
      start_date: job.start_date || '',
      end_date: job.end_date || '',
      application_deadline: job.application_deadline || ''
    })

    // State for role management (Phase 5C)
    const [showAddRole, setShowAddRole] = useState(false)
    const [editingRoleId, setEditingRoleId] = useState(null)
    const [roleForm, setRoleForm] = useState({
      role_type: 'freelancer',
      role_title: '',
      role_description: '',
      budget: '',
      quantity: 1
    })

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('en-AU', {
        style: 'currency',
        currency: 'AUD',
        minimumFractionDigits: 0
      }).format(amount)
    }

    const totalRoles = job.roles?.length || 0
    const filledRoles = job.roles?.filter(r => r.filled_count >= r.quantity).length || 0
    const progress = totalRoles > 0 ? Math.round((filledRoles / totalRoles) * 100) : 0

    // Load expenses when job changes
    useEffect(() => {
      if (job?.id) {
        loadExpenses()
      }
    }, [job?.id])

    // Load messages when job or thread changes
    useEffect(() => {
      if (job?.id) {
        loadMessages()
      }
    }, [job?.id, activeThread])

    // Load team members when job changes
    useEffect(() => {
      if (job?.id) {
        loadTeamMembers()
      }
    }, [job?.id])

    // Load files when job changes
    useEffect(() => {
      if (job?.id) {
        loadFiles()
      }
    }, [job?.id])

    // Load tasks when job changes
    useEffect(() => {
      if (job?.id) {
        loadTasks()
      }
    }, [job?.id])

    const loadExpenses = async () => {
      setLoadingExpenses(true)
      const result = await getExpensesForJob(job.id)
      if (result.success) {
        setExpenses(result.data)
      }
      setLoadingExpenses(false)
    }

    const loadMessages = async () => {
      setLoadingMessages(true)
      const result = await getMessagesForJob(job.id, activeThread)
      if (result.success) {
        setMessages(result.data)
      }
      setLoadingMessages(false)
    }

    const loadTeamMembers = async () => {
      const result = await getTeamMembers(job.id)
      if (result.success) {
        setTeamMembers(result.data)
      }
    }

    const handleSendMessage = async () => {
      if (!newMessage.trim()) return

      const result = await sendMessage(job.id, newMessage, activeThread)

      if (result.success) {
        setMessages([...messages, result.data])
        setNewMessage('')
        loadMessages() // Reload to get fresh data
      } else {
        alert('Failed to send message: ' + result.error)
      }
    }

    const loadFiles = async () => {
      setLoadingFiles(true)
      const result = await getFilesForJob(job.id)
      if (result.success) {
        setFiles(result.data)
      }
      setLoadingFiles(false)
    }

    const handleFileUpload = async (fileList) => {
      if (!fileList || fileList.length === 0) return

      setUploadingFile(true)
      const file = fileList[0]

      const result = await uploadFile(job.id, file, {
        category: 'general',
        description: file.name
      })

      if (result.success) {
        setFiles([result.data, ...files])
        loadFiles() // Reload to get fresh data
      } else {
        alert('Failed to upload file: ' + result.error)
      }
      setUploadingFile(false)
    }

    const handleDeleteFile = async (fileId) => {
      if (!confirm('Are you sure you want to delete this file?')) return

      const result = await deleteFile(fileId)
      if (result.success) {
        setFiles(files.filter(f => f.id !== fileId))
      } else {
        alert('Failed to delete file: ' + result.error)
      }
    }

    const handleDrag = (e) => {
      e.preventDefault()
      e.stopPropagation()
      if (e.type === 'dragenter' || e.type === 'dragover') {
        setDragActive(true)
      } else if (e.type === 'dragleave') {
        setDragActive(false)
      }
    }

    const handleDrop = (e) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFileUpload(e.dataTransfer.files)
      }
    }

    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
    }

    const loadTasks = async () => {
      setLoadingTasks(true)
      const result = await getTasksForJob(job.id)
      if (result.success) {
        setTasks(result.data)
      }
      setLoadingTasks(false)
    }

    const handleAddTask = async () => {
      if (!newTask.title) {
        alert('Please enter a task title')
        return
      }

      const result = await createTask(job.id, {
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority,
        assigned_to: newTask.assigned_to || undefined,
        due_date: newTask.due_date || undefined
      })

      if (result.success) {
        setTasks([result.data, ...tasks])
        setNewTask({
          title: '',
          description: '',
          priority: 'medium',
          assigned_to: '',
          due_date: ''
        })
        setShowAddTask(false)
        loadTasks()
      } else {
        alert('Failed to create task: ' + result.error)
      }
    }

    const handleUpdateTaskStatus = async (taskId, newStatus) => {
      const result = await updateTask(taskId, { status: newStatus })
      if (result.success) {
        setTasks(tasks.map(t => t.id === taskId ? result.data : t))
      } else {
        alert('Failed to update task: ' + result.error)
      }
    }

    const handleDeleteTask = async (taskId) => {
      if (!confirm('Are you sure you want to delete this task?')) return

      const result = await deleteTask(taskId)
      if (result.success) {
        setTasks(tasks.filter(t => t.id !== taskId))
      } else {
        alert('Failed to delete task: ' + result.error)
      }
    }

    // Phase 5C: Job editing functions
    const handleSaveJobEdits = async () => {
      const result = await updateJobPosting(job.id, editedJob)
      if (result.success) {
        setIsEditingJob(false)
        loadJobs() // Reload jobs to get fresh data
        alert('Job updated successfully!')
      } else {
        alert('Failed to update job: ' + result.error)
      }
    }

    const handleCancelEdit = () => {
      setEditedJob({
        title: job.title || '',
        description: job.description || '',
        location: job.location || '',
        event_type: job.event_type || '',
        start_date: job.start_date || '',
        end_date: job.end_date || '',
        application_deadline: job.application_deadline || ''
      })
      setIsEditingJob(false)
    }

    // Phase 5C: Role management functions
    const handleAddRole = async () => {
      if (!roleForm.role_title || !roleForm.budget) {
        alert('Please fill in role title and budget')
        return
      }

      const result = await addRoleToJob(job.id, {
        role_type: roleForm.role_type,
        role_title: roleForm.role_title,
        role_description: roleForm.role_description,
        budget: parseFloat(roleForm.budget),
        quantity: parseInt(roleForm.quantity)
      })

      if (result.success) {
        setShowAddRole(false)
        setRoleForm({
          role_type: 'freelancer',
          role_title: '',
          role_description: '',
          budget: '',
          quantity: 1
        })
        loadJobs() // Reload to get updated roles
        alert('Role added successfully!')
      } else {
        alert('Failed to add role: ' + result.error)
      }
    }

    const handleUpdateRole = async (roleId, updates) => {
      const result = await updateJobRole(roleId, updates)
      if (result.success) {
        loadJobs() // Reload to get updated data
        setEditingRoleId(null)
      } else {
        alert('Failed to update role: ' + result.error)
      }
    }

    const handleDeleteRole = async (roleId) => {
      const result = await deleteJobRole(roleId)
      if (result.success) {
        loadJobs() // Reload to get updated data
        alert('Role deleted successfully!')
      } else {
        alert('Failed to delete role: ' + result.error)
      }
    }

    // Calculate total spent from expenses
    const totalSpent = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0)

    // Group expenses by category (based on job roles)
    const budgetCategories = job.roles?.map(role => {
      const roleExpenses = expenses.filter(e => e.job_role_id === role.id)
      const spent = roleExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0)
      return {
        name: role.role_title,
        budgeted: parseFloat(role.budget),
        spent: spent,
        roleId: role.id
      }
    }) || []

    const handleAddExpense = async () => {
      if (!newExpense.amount || !newExpense.description || !newExpense.category) {
        alert('Please fill in all fields')
        return
      }

      const result = await addExpense(job.id, {
        category: newExpense.category,
        amount: parseFloat(newExpense.amount),
        description: newExpense.description,
        job_role_id: newExpense.category // Using category as role_id for now
      })

      if (result.success) {
        setExpenses([result.data, ...expenses])
        setNewExpense({ category: '', amount: '', description: '' })
        setShowAddExpense(false)
        loadExpenses() // Reload to get fresh data
      } else {
        alert('Failed to add expense: ' + result.error)
      }
    }

    return (
      <div className="space-y-6">
        {/* Tab Buttons - Same 8-tab layout as Workspace */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button
            onClick={() => setActiveJobTab('overview')}
            className={`p-4 rounded-lg text-left ${
              activeJobTab === 'overview' ? 'bg-primary text-white' : 'bg-gray-100'
            }`}
          >
            <Eye size={20} className="mb-2" />
            <div className="font-medium">Overview</div>
          </button>
          <button
            onClick={() => setActiveJobTab('applicants')}
            className={`p-4 rounded-lg text-left ${
              activeJobTab === 'applicants' ? 'bg-primary text-white' : 'bg-gray-100'
            }`}
          >
            <Users size={20} className="mb-2" />
            <div className="font-medium">Applicants</div>
          </button>
          <button
            onClick={() => setActiveJobTab('team')}
            className={`p-4 rounded-lg text-left ${
              activeJobTab === 'team' ? 'bg-primary text-white' : 'bg-gray-100'
            }`}
          >
            <Users size={20} className="mb-2" />
            <div className="font-medium">Team</div>
          </button>
          <button
            onClick={() => setActiveJobTab('messages')}
            className={`p-4 rounded-lg text-left ${
              activeJobTab === 'messages' ? 'bg-primary text-white' : 'bg-gray-100'
            }`}
          >
            <MessageSquare size={20} className="mb-2" />
            <div className="font-medium">Messages</div>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button
            onClick={() => setActiveJobTab('budget')}
            className={`p-4 rounded-lg text-left ${
              activeJobTab === 'budget' ? 'bg-primary text-white' : 'bg-gray-100'
            }`}
          >
            <DollarSign size={20} className="mb-2" />
            <div className="font-medium">Budget</div>
          </button>
          <button
            onClick={() => setActiveJobTab('files')}
            className={`p-4 rounded-lg text-left ${
              activeJobTab === 'files' ? 'bg-primary text-white' : 'bg-gray-100'
            }`}
          >
            <FileText size={20} className="mb-2" />
            <div className="font-medium">Files</div>
          </button>
          <button
            onClick={() => setActiveJobTab('tasks')}
            className={`p-4 rounded-lg text-left ${
              activeJobTab === 'tasks' ? 'bg-primary text-white' : 'bg-gray-100'
            }`}
          >
            <CheckCircle size={20} className="mb-2" />
            <div className="font-medium">Tasks</div>
          </button>
          <button
            onClick={() => setActiveJobTab('settings')}
            className={`p-4 rounded-lg text-left ${
              activeJobTab === 'settings' ? 'bg-primary text-white' : 'bg-gray-100'
            }`}
          >
            <Settings size={20} className="mb-2" />
            <div className="font-medium">Settings</div>
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg">
          {activeJobTab === 'overview' && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">{job.title}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="profile-card">
                  <div className="text-sm text-muted-foreground">Roles Filled</div>
                  <div className="text-2xl font-bold">{progress}%</div>
                  <div className="w-full bg-muted rounded-full h-2 mt-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {filledRoles}/{totalRoles} roles filled
                  </div>
                </div>
                <div className="profile-card">
                  <div className="text-sm text-muted-foreground">Total Budget</div>
                  <div className="text-2xl font-bold">{formatCurrency(job.total_budget || 0)}</div>
                  <div className="text-sm text-muted-foreground">for {totalRoles} roles</div>
                </div>
                <div className="profile-card">
                  <div className="text-sm text-muted-foreground">Applications</div>
                  <div className="text-2xl font-bold">{job.application_count || 0}</div>
                  <div className="text-sm text-muted-foreground">total received</div>
                </div>
              </div>

              {/* Job Details Section */}
              <div className="profile-card">
                <h4 className="font-semibold mb-3">Job Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Location:</span>
                    <span className="ml-2 font-medium">{job.location || 'TBD'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Event Type:</span>
                    <span className="ml-2 font-medium capitalize">{job.event_type?.replace('_', ' ')}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Start Date:</span>
                    <span className="ml-2 font-medium">{new Date(job.start_date).toLocaleDateString('en-AU')}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                      job.status === 'open' ? 'bg-green-100 text-green-800' :
                      job.status === 'filled' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {job.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="profile-card">
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">{job.description}</p>
              </div>
            </div>
          )}

          {activeJobTab === 'applicants' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Applicants</h3>
                <button
                  onClick={() => navigate(`/jobs/${job.id}/applicants`)}
                  className="btn-primary text-sm"
                >
                  View Full Applicant Page
                </button>
              </div>
              <div className="profile-card">
                <p className="text-muted-foreground">
                  You have <span className="font-semibold text-primary">{job.application_count || 0}</span> applications for this job.
                </p>
                <button
                  onClick={() => navigate(`/jobs/${job.id}/applicants`)}
                  className="btn-secondary mt-4"
                >
                  Review All Applicants →
                </button>
              </div>
            </div>
          )}

          {activeJobTab === 'team' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Team & Roles</h3>
                <button
                  onClick={() => setShowAddRole(true)}
                  className="btn-primary flex items-center gap-2"
                >
                  <Plus size={16} />
                  Add Role
                </button>
              </div>

              {/* Team Members Section */}
              <div className="profile-card">
                <h4 className="font-semibold mb-4">Team Members</h4>
                {teamMembers.length === 0 ? (
                  <div className="text-center py-8">
                    <Users size={48} className="mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No team members yet</p>
                    <p className="text-sm text-muted-foreground">
                      Select applicants to build your team
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {teamMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        {/* Avatar */}
                        {member.avatar_url ? (
                          <img
                            src={member.avatar_url}
                            alt={member.display_name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-lg font-bold">
                            {member.display_name?.charAt(0).toUpperCase() || '?'}
                          </div>
                        )}

                        {/* Member Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h5 className="font-medium truncate">{member.display_name}</h5>
                            {member.is_organizer && (
                              <span className="text-xs bg-primary text-white px-2 py-1 rounded">
                                <Crown size={12} className="inline mr-1" />
                                Organizer
                              </span>
                            )}
                          </div>
                          {member.role && (
                            <p className="text-sm text-muted-foreground capitalize">
                              {member.role}
                            </p>
                          )}
                        </div>

                        {/* Status Badge */}
                        <div>
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                            Active
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Roles Breakdown Section */}
              <div className="profile-card">
                <h4 className="font-semibold mb-4">Roles Breakdown</h4>
                {!job.roles || job.roles.length === 0 ? (
                  <div className="text-center py-8">
                    <Briefcase size={48} className="mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No roles defined</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {job.roles.map((role) => (
                      <div key={role.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h5 className="font-semibold">{role.role_title}</h5>
                              <button
                                onClick={() => handleDeleteRole(role.id)}
                                className="p-1 hover:bg-red-100 text-red-600 rounded transition-colors"
                                title="Delete role"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                            <p className="text-sm text-muted-foreground capitalize">
                              {role.role_type}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-primary">
                              {formatCurrency(role.budget)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              per {role.role_type}
                            </div>
                          </div>
                        </div>

                        {role.role_description && (
                          <p className="text-sm text-muted-foreground mb-3">
                            {role.role_description}
                          </p>
                        )}

                        {/* Progress Bar */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Positions Filled</span>
                            <span className="font-medium">
                              {role.filled_count || 0} / {role.quantity}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                (role.filled_count || 0) >= role.quantity
                                  ? 'bg-green-500'
                                  : 'bg-primary'
                              }`}
                              style={{
                                width: `${Math.min(
                                  ((role.filled_count || 0) / role.quantity) * 100,
                                  100
                                )}%`
                              }}
                            ></div>
                          </div>
                          {(role.filled_count || 0) >= role.quantity && (
                            <div className="flex items-center gap-1 text-green-600 text-sm">
                              <CheckCircle size={14} />
                              <span>Fully staffed</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Team Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="profile-card">
                  <div className="text-sm text-muted-foreground">Total Members</div>
                  <div className="text-2xl font-bold">{teamMembers.length}</div>
                </div>
                <div className="profile-card">
                  <div className="text-sm text-muted-foreground">Total Roles</div>
                  <div className="text-2xl font-bold">{job.roles?.length || 0}</div>
                </div>
                <div className="profile-card">
                  <div className="text-sm text-muted-foreground">Positions Filled</div>
                  <div className="text-2xl font-bold text-green-600">{filledRoles}</div>
                </div>
                <div className="profile-card">
                  <div className="text-sm text-muted-foreground">Team Progress</div>
                  <div className="text-2xl font-bold text-primary">{progress}%</div>
                </div>
              </div>

              {/* Add Role Modal */}
              {showAddRole && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 w-full max-w-md">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Add New Role</h3>
                      <button onClick={() => setShowAddRole(false)}>
                        <X size={20} />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Role Type*</label>
                        <select
                          value={roleForm.role_type}
                          onChange={(e) => setRoleForm({...roleForm, role_type: e.target.value})}
                          className="w-full px-3 py-2 border rounded-lg"
                        >
                          <option value="freelancer">Freelancer</option>
                          <option value="venue">Venue</option>
                          <option value="vendor">Vendor</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Role Title*</label>
                        <input
                          type="text"
                          placeholder="e.g., Sound Engineer"
                          value={roleForm.role_title}
                          onChange={(e) => setRoleForm({...roleForm, role_title: e.target.value})}
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea
                          placeholder="Role responsibilities and requirements..."
                          value={roleForm.role_description}
                          onChange={(e) => setRoleForm({...roleForm, role_description: e.target.value})}
                          className="w-full px-3 py-2 border rounded-lg"
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Budget (AUD)*</label>
                          <input
                            type="number"
                            placeholder="0"
                            value={roleForm.budget}
                            onChange={(e) => setRoleForm({...roleForm, budget: e.target.value})}
                            className="w-full px-3 py-2 border rounded-lg"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">Quantity*</label>
                          <input
                            type="number"
                            min="1"
                            value={roleForm.quantity}
                            onChange={(e) => setRoleForm({...roleForm, quantity: e.target.value})}
                            className="w-full px-3 py-2 border rounded-lg"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={handleAddRole}
                          className="btn-primary flex-1"
                        >
                          Add Role
                        </button>
                        <button
                          onClick={() => setShowAddRole(false)}
                          className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeJobTab === 'messages' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Team Messages</h3>

              {/* Thread Selector */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                <button
                  onClick={() => setActiveThread('general')}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                    activeThread === 'general' ? 'bg-primary text-white' : 'bg-gray-100'
                  }`}
                >
                  <MessageCircle size={16} className="inline mr-2" />
                  General
                </button>
                {job.roles?.map(role => (
                  <button
                    key={role.id}
                    onClick={() => setActiveThread(role.id)}
                    className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                      activeThread === role.id ? 'bg-primary text-white' : 'bg-gray-100'
                    }`}
                  >
                    <Users size={16} className="inline mr-2" />
                    {role.role_title}
                  </button>
                ))}
              </div>

              {/* Messages Container */}
              <div className="profile-card h-[500px] flex flex-col">
                {/* Messages List */}
                <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-gray-50 rounded-t-lg">
                  {loadingMessages ? (
                    <div className="flex justify-center items-center h-full">
                      <p className="text-muted-foreground">Loading messages...</p>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col justify-center items-center h-full text-center">
                      <MessageSquare size={48} className="text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">No messages yet</p>
                      <p className="text-sm text-muted-foreground">Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isCurrentUser = msg.sender_id === user?.id
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[70%] ${isCurrentUser ? 'order-2' : 'order-1'}`}>
                            <div className={`p-3 rounded-lg ${
                              isCurrentUser
                                ? 'bg-primary text-white'
                                : 'bg-white border'
                            }`}>
                              {!isCurrentUser && (
                                <div className="text-xs font-semibold mb-1">
                                  {msg.sender?.display_name || 'Team Member'}
                                </div>
                              )}
                              <p className="text-sm">{msg.message}</p>
                              <div className={`text-xs mt-1 ${
                                isCurrentUser ? 'text-white/70' : 'text-muted-foreground'
                              }`}>
                                {new Date(msg.created_at).toLocaleString('en-AU', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t bg-white rounded-b-lg">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder={`Message ${activeThread === 'general' ? 'team' : 'thread'}...`}
                      className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send size={16} />
                      Send
                    </button>
                  </div>
                </div>
              </div>

              {/* Active Team Members */}
              <div className="profile-card">
                <h4 className="font-semibold mb-3">Active Team Members</h4>
                <div className="flex flex-wrap gap-2">
                  {teamMembers.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No team members yet</p>
                  ) : (
                    teamMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg"
                      >
                        {member.avatar_url ? (
                          <img
                            src={member.avatar_url}
                            alt={member.display_name}
                            className="w-6 h-6 rounded-full"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs">
                            {member.display_name?.charAt(0).toUpperCase() || '?'}
                          </div>
                        )}
                        <span className="text-sm">{member.display_name}</span>
                        {member.role && (
                          <span className="text-xs text-muted-foreground">
                            ({member.role})
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeJobTab === 'budget' && (
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

              {/* 3 Stat Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="profile-card">
                  <div className="text-sm text-muted-foreground">Total Budget</div>
                  <div className="text-2xl font-bold">{formatCurrency(job.total_budget || 0)}</div>
                </div>
                <div className="profile-card">
                  <div className="text-sm text-muted-foreground">Amount Spent</div>
                  <div className="text-2xl font-bold text-red-600">{formatCurrency(totalSpent)}</div>
                </div>
                <div className="profile-card">
                  <div className="text-sm text-muted-foreground">Remaining</div>
                  <div className="text-2xl font-bold text-green-600">{formatCurrency((job.total_budget || 0) - totalSpent)}</div>
                </div>
              </div>

              {/* Category Breakdown with Progress Bars */}
              <div className="profile-card">
                <h4 className="font-semibold mb-4">Category Breakdown</h4>
                <div className="space-y-3">
                  {budgetCategories.map((category) => (
                    <div key={category.roleId} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{category.name}</span>
                        <span>{formatCurrency(category.spent)} / {formatCurrency(category.budgeted)}</span>
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

              {/* Add Expense Modal */}
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
                      <div>
                        <label className="block text-sm font-medium mb-1">Category (Role)</label>
                        <select
                          value={newExpense.category}
                          onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                          className="w-full px-3 py-2 border rounded-lg"
                        >
                          <option value="">Select a role...</option>
                          {job.roles?.map(role => (
                            <option key={role.id} value={role.id}>{role.role_title}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Amount</label>
                        <input
                          type="number"
                          placeholder="0.00"
                          value={newExpense.amount}
                          onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <input
                          type="text"
                          placeholder="What was this expense for?"
                          value={newExpense.description}
                          onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={handleAddExpense}
                          className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
                        >
                          Add Expense
                        </button>
                        <button
                          onClick={() => setShowAddExpense(false)}
                          className="flex-1 bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeJobTab === 'files' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Files & Documents</h3>
                <label className="btn-primary flex items-center gap-2 cursor-pointer">
                  <Upload size={16} />
                  Upload File
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e.target.files)}
                    disabled={uploadingFile}
                  />
                </label>
              </div>

              {/* Drag & Drop Upload Zone */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-300 bg-gray-50'
                }`}
              >
                <Upload size={48} className="mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">
                  {uploadingFile ? 'Uploading...' : 'Drag & drop files here'}
                </p>
                <p className="text-sm text-muted-foreground">
                  or click the "Upload File" button above
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Max file size: 10MB • Supported: Images, PDFs, Office docs, Text files
                </p>
              </div>

              {/* Files List */}
              <div className="space-y-3">
                {loadingFiles ? (
                  <div className="profile-card text-center py-8">
                    <p className="text-muted-foreground">Loading files...</p>
                  </div>
                ) : files.length === 0 ? (
                  <div className="profile-card text-center py-8">
                    <FolderOpen size={48} className="mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No files uploaded yet</p>
                    <p className="text-sm text-muted-foreground">
                      Upload your first file to get started
                    </p>
                  </div>
                ) : (
                  files.map((file) => (
                    <div
                      key={file.id}
                      className="profile-card flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {/* File Icon */}
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          {file.file_type?.startsWith('image/') ? (
                            <Image size={24} className="text-primary" />
                          ) : file.file_type?.includes('pdf') ? (
                            <FileText size={24} className="text-red-500" />
                          ) : file.file_type?.includes('video') ? (
                            <Video size={24} className="text-purple-500" />
                          ) : (
                            <File size={24} className="text-gray-500" />
                          )}
                        </div>

                        {/* File Details */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{file.file_name}</h4>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span>{formatFileSize(file.file_size || 0)}</span>
                            <span>•</span>
                            <span>
                              {new Date(file.uploaded_at).toLocaleDateString('en-AU', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                            <span>•</span>
                            <span>by {file.uploader?.display_name || 'Unknown'}</span>
                          </div>
                          {file.category && file.category !== 'general' && (
                            <div className="mt-1">
                              <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                                {file.category}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <a
                            href={file.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                            title="View/Download"
                          >
                            <Download size={18} />
                          </a>
                          <button
                            onClick={() => handleDeleteFile(file.id)}
                            className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* File Categories Summary */}
              {files.length > 0 && (
                <div className="profile-card">
                  <h4 className="font-semibold mb-3">Storage Summary</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-2xl font-bold text-primary">
                        {files.length}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Files</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary">
                        {formatFileSize(
                          files.reduce((sum, f) => sum + (f.file_size || 0), 0)
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Size</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary">
                        {files.filter(f => f.file_type?.startsWith('image/')).length}
                      </div>
                      <div className="text-sm text-muted-foreground">Images</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary">
                        {files.filter(f => f.file_type?.includes('pdf')).length}
                      </div>
                      <div className="text-sm text-muted-foreground">Documents</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeJobTab === 'tasks' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Task Management</h3>
                <button
                  onClick={() => setShowAddTask(true)}
                  className="btn-primary flex items-center gap-2"
                >
                  <Plus size={16} />
                  Add Task
                </button>
              </div>

              {/* Task Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="profile-card">
                  <div className="text-sm text-muted-foreground">Total Tasks</div>
                  <div className="text-2xl font-bold">{tasks.length}</div>
                </div>
                <div className="profile-card">
                  <div className="text-sm text-muted-foreground">Pending</div>
                  <div className="text-2xl font-bold text-gray-600">
                    {tasks.filter(t => t.status === 'pending').length}
                  </div>
                </div>
                <div className="profile-card">
                  <div className="text-sm text-muted-foreground">In Progress</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {tasks.filter(t => t.status === 'in_progress').length}
                  </div>
                </div>
                <div className="profile-card">
                  <div className="text-sm text-muted-foreground">Completed</div>
                  <div className="text-2xl font-bold text-green-600">
                    {tasks.filter(t => t.status === 'completed').length}
                  </div>
                </div>
              </div>

              {/* Tasks List */}
              <div className="space-y-3">
                {loadingTasks ? (
                  <div className="profile-card text-center py-8">
                    <p className="text-muted-foreground">Loading tasks...</p>
                  </div>
                ) : tasks.length === 0 ? (
                  <div className="profile-card text-center py-8">
                    <CheckCircle size={48} className="mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No tasks yet</p>
                    <p className="text-sm text-muted-foreground">
                      Create your first task to start organizing work
                    </p>
                  </div>
                ) : (
                  tasks.map((task) => (
                    <div
                      key={task.id}
                      className="profile-card hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        {/* Task Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-medium truncate">{task.title}</h4>
                            {/* Priority Badge */}
                            <span className={`text-xs px-2 py-1 rounded ${
                              task.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                              task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                              task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {task.priority}
                            </span>
                          </div>

                          {task.description && (
                            <p className="text-sm text-muted-foreground mb-2">
                              {task.description}
                            </p>
                          )}

                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            {task.assignee && (
                              <div className="flex items-center gap-1">
                                <Users size={14} />
                                <span>{task.assignee.display_name}</span>
                              </div>
                            )}
                            {task.due_date && (
                              <div className="flex items-center gap-1">
                                <Calendar size={14} />
                                <span>
                                  {new Date(task.due_date).toLocaleDateString('en-AU', {
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Status Dropdown & Actions */}
                        <div className="flex items-center gap-2">
                          <select
                            value={task.status}
                            onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value)}
                            className={`px-3 py-1 text-sm rounded-lg border ${
                              task.status === 'completed' ? 'bg-green-50 text-green-700 border-green-300' :
                              task.status === 'in_progress' ? 'bg-blue-50 text-blue-700 border-blue-300' :
                              task.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-300' :
                              'bg-gray-50 text-gray-700 border-gray-300'
                            }`}
                          >
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>

                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                            title="Delete task"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add Task Modal */}
              {showAddTask && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 w-full max-w-md">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Add New Task</h3>
                      <button onClick={() => setShowAddTask(false)}>
                        <X size={20} />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Task Title*</label>
                        <input
                          type="text"
                          placeholder="e.g., Setup lighting equipment"
                          value={newTask.title}
                          onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea
                          placeholder="Task details..."
                          value={newTask.description}
                          onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                          className="w-full px-3 py-2 border rounded-lg"
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Priority</label>
                          <select
                            value={newTask.priority}
                            onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                            className="w-full px-3 py-2 border rounded-lg"
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">Due Date</label>
                          <input
                            type="date"
                            value={newTask.due_date}
                            onChange={(e) => setNewTask({...newTask, due_date: e.target.value})}
                            className="w-full px-3 py-2 border rounded-lg"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Assign To</label>
                        <select
                          value={newTask.assigned_to}
                          onChange={(e) => setNewTask({...newTask, assigned_to: e.target.value})}
                          className="w-full px-3 py-2 border rounded-lg"
                        >
                          <option value="">Unassigned</option>
                          {teamMembers.map(member => (
                            <option key={member.id} value={member.id}>
                              {member.display_name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={handleAddTask}
                          className="btn-primary flex-1"
                        >
                          Create Task
                        </button>
                        <button
                          onClick={() => setShowAddTask(false)}
                          className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeJobTab === 'settings' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Job Settings</h3>
                {!isEditingJob ? (
                  <button
                    onClick={() => setIsEditingJob(true)}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Edit size={16} />
                    Edit Job
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveJobEdits}
                      className="btn-primary flex items-center gap-2"
                    >
                      <Save size={16} />
                      Save Changes
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <div className="profile-card">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Job Title*</label>
                    <input
                      type="text"
                      value={isEditingJob ? editedJob.title : job.title}
                      onChange={(e) => setEditedJob({...editedJob, title: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                      disabled={!isEditingJob}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Description*</label>
                    <textarea
                      value={isEditingJob ? editedJob.description : job.description}
                      onChange={(e) => setEditedJob({...editedJob, description: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                      rows={4}
                      disabled={!isEditingJob}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Location</label>
                      <input
                        type="text"
                        value={isEditingJob ? editedJob.location : job.location || ''}
                        onChange={(e) => setEditedJob({...editedJob, location: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg"
                        disabled={!isEditingJob}
                        placeholder="e.g., Sydney, Australia"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Event Type</label>
                      <input
                        type="text"
                        value={isEditingJob ? editedJob.event_type : job.event_type || ''}
                        onChange={(e) => setEditedJob({...editedJob, event_type: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg"
                        disabled={!isEditingJob}
                        placeholder="e.g., Corporate Event"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Start Date*</label>
                      <input
                        type="date"
                        value={isEditingJob ? editedJob.start_date : job.start_date}
                        onChange={(e) => setEditedJob({...editedJob, start_date: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg"
                        disabled={!isEditingJob}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">End Date*</label>
                      <input
                        type="date"
                        value={isEditingJob ? editedJob.end_date : job.end_date}
                        onChange={(e) => setEditedJob({...editedJob, end_date: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg"
                        disabled={!isEditingJob}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Application Deadline</label>
                    <input
                      type="date"
                      value={isEditingJob ? editedJob.application_deadline : job.application_deadline || ''}
                      onChange={(e) => setEditedJob({...editedJob, application_deadline: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                      disabled={!isEditingJob}
                    />
                  </div>

                  <div className="pt-4 border-t">
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <div className="text-sm">
                      <span className={`px-3 py-1 rounded-full ${
                        job.status === 'open' ? 'bg-green-100 text-green-700' :
                        job.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                        job.status === 'filled' ? 'bg-purple-100 text-purple-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {job.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Status updates automatically when roles are filled
                    </p>
                  </div>
                </div>
              </div>

              <div className="profile-card bg-red-50 border border-red-200">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium text-red-900">Danger Zone</div>
                    <div className="text-sm text-red-700 mt-1">
                      Cancel this job if you no longer need to fill these roles. This action cannot be undone.
                    </div>
                  </div>
                  <button className="btn-secondary text-red-600 border-red-300 hover:bg-red-100">
                    Cancel Job
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
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

  const JobCard = ({ job }) => {
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('en-AU', {
        style: 'currency',
        currency: 'AUD',
        minimumFractionDigits: 0
      }).format(amount)
    }

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('en-AU', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    }

    const getStatusColor = (status) => {
      switch (status) {
        case 'open':
          return 'bg-green-100 text-green-800'
        case 'in_progress':
          return 'bg-blue-100 text-blue-800'
        case 'filled':
          return 'bg-purple-100 text-purple-800'
        case 'cancelled':
          return 'bg-red-100 text-red-800'
        default:
          return 'bg-gray-100 text-gray-800'
      }
    }

    const totalRoles = job.roles?.length || 0
    const filledRoles = job.roles?.filter(r => r.filled_count >= r.quantity).length || 0
    const progress = totalRoles > 0 ? Math.round((filledRoles / totalRoles) * 100) : 0

    return (
      <div
        className="profile-card hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-primary"
        onClick={() => setSelectedJob(job)}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="card-title mb-2">{job.title}</h3>
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                {job.status}
              </span>
              {job.event_type && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded capitalize">
                  {job.event_type.replace('_', ' ')}
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
              <div className="flex items-center gap-1">
                <Calendar size={14} />
                <span>{formatDate(job.start_date)}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin size={14} />
                <span>{job.location || 'TBD'}</span>
              </div>
            </div>
          </div>
          <button
            className="p-2 hover:bg-muted rounded-lg"
            onClick={(e) => {
              e.stopPropagation()
              // Could add dropdown menu here
            }}
          >
            <MoreHorizontal size={16} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-sm text-muted-foreground mb-1">Roles Filled</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium">
                {filledRoles}/{totalRoles}
              </span>
            </div>
          </div>

          <div>
            <div className="text-sm text-muted-foreground mb-1">Budget</div>
            <div className="text-sm font-medium">
              {formatCurrency(job.total_budget || 0)}
            </div>
            {job.application_count > 0 && (
              <div className="text-xs text-blue-600 mt-1">
                {job.application_count} {job.application_count === 1 ? 'application' : 'applications'}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users size={14} />
            <span>{totalRoles} {totalRoles === 1 ? 'role' : 'roles'}</span>
          </div>
          <button
            className="btn-secondary text-sm"
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/jobs/${job.id}/applicants`)
            }}
          >
            View Applicants
          </button>
        </div>
      </div>
    )
  }

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
    <div className="min-h-screen bg-background dark:bg-[#0B0B0B]">
      <div className="w-full px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-primary/20 rounded-lg">
              <Crown className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="page-title dark:text-white">TIES Together Studio</h1>
              <p className="text-muted-foreground dark:text-[#B3B3B3]">
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
              <h2 className="text-xl font-semibold dark:text-white">{selectedWorkspace.title}</h2>
            </div>
            <WorkspaceDetail workspace={selectedWorkspace} />
          </div>
        ) : (
          <div>
            {/* Tabs */}
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => setActiveTab('jobs')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'jobs'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Briefcase className="inline mr-2" size={16} />
                Job Postings
              </button>
              <button
                onClick={() => setActiveTab('workspaces')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'workspaces'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FolderOpen className="inline mr-2" size={16} />
                Workspaces
              </button>
            </div>

            {activeTab === 'jobs' ? (
              selectedJob ? (
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <button
                      onClick={() => setSelectedJob(null)}
                      className="btn-secondary flex items-center gap-2"
                    >
                      ← Back to Jobs
                    </button>
                    <h2 className="text-xl font-semibold dark:text-white">{selectedJob.title}</h2>
                  </div>
                  <JobDetail job={selectedJob} />
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="section-header dark:text-white">My Job Postings</h2>
                    <button
                      onClick={() => navigate('/create')}
                      className="btn-primary flex items-center gap-2"
                    >
                      <Plus size={16} />
                      Post New Job
                    </button>
                  </div>

                  {/* Search and Filter */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                      <input
                        type="text"
                        placeholder="Search jobs..."
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
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="filled">Filled</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  {loadingJobs ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">Loading your jobs...</p>
                    </div>
                  ) : jobs.length === 0 ? (
                    <div className="text-center py-12">
                      <Briefcase className="mx-auto mb-4 text-gray-400" size={48} />
                      <h3 className="text-lg font-semibold mb-2">No jobs posted yet</h3>
                      <p className="text-muted-foreground mb-4">Start by posting your first job</p>
                      <button
                        onClick={() => navigate('/create')}
                        className="btn-primary flex items-center gap-2 mx-auto"
                      >
                        <Plus size={16} />
                        Post Your First Job
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                      {jobs
                        .filter(job => {
                          const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                              job.location?.toLowerCase().includes(searchTerm.toLowerCase())
                          const matchesStatus = statusFilter === 'All Status' || job.status === statusFilter
                          return matchesSearch && matchesStatus
                        })
                        .map((job) => (
                          <JobCard key={job.id} job={job} />
                        ))}
                    </div>
                  )}
                </div>
              )
            ) : (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="section-header dark:text-white">My Studio Workspaces</h2>
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
        )}
      </div>

      <CreateWorkspaceModal />
    </div>
  )
}

export default FunctionalStudioPage

