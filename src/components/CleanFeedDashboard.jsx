import React, { useState, useEffect } from 'react'
import { useAuth } from '../App'
import { useNavigate } from 'react-router-dom'
import {
  TrendingUp,
  Calendar,
  MessageSquare,
  Star,
  Clock,
  DollarSign,
  Users,
  Briefcase,
  Camera,
  Plus
} from 'lucide-react'
import { getBookings } from '../api/bookings'
import { getMyConversations } from '../api/messages'
import { getJobPostings, getMyApplications } from '../api/jobs'

const CleanFeedDashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  // Real data states
  const [bookings, setBookings] = useState([])
  const [conversations, setConversations] = useState([])
  const [jobs, setJobs] = useState([])
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)

  // Load real data on mount
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user?.id) {
        console.log('CleanFeedDashboard: No user ID, skipping data load')
        setLoading(false)
        return
      }

      try {
        console.log('CleanFeedDashboard: Loading data for user:', user.id, 'role:', user.role)
        setLoading(true)

        // Load bookings
        const bookingsData = await getBookings()
        console.log('CleanFeedDashboard: Loaded bookings:', bookingsData?.length || 0)
        setBookings(bookingsData || [])

        // Load conversations
        const conversationsData = await getMyConversations()
        console.log('CleanFeedDashboard: Loaded conversations:', conversationsData?.length || 0)
        setConversations(conversationsData || [])

        // Load jobs/applications based on role
        if (user.role === 'Organiser') {
          const jobsData = await getJobPostings({ organiser_id: user.id })
          console.log('CleanFeedDashboard: Loaded jobs:', jobsData?.length || 0)
          setJobs(jobsData || [])
        } else {
          const applicationsData = await getMyApplications()
          console.log('CleanFeedDashboard: Loaded applications:', applicationsData?.length || 0)
          setApplications(applicationsData || [])
        }

        console.log('CleanFeedDashboard: Data loading complete')
      } catch (error) {
        console.error('CleanFeedDashboard: Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [user?.id, user?.role])

  // Helper function to format time ago
  function getTimeAgo(dateString) {
    if (!dateString) return 'Just now'
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now - date) / 1000)

    if (seconds < 60) return 'Just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`
    return date.toLocaleDateString()
  }

  // Generate real recent activity
  const generateRecentActivity = () => {
    const activities = []

    // Add bookings
    bookings.slice(0, 2).forEach(booking => {
      if (!booking || !user?.id) return
      const isFreelancer = booking.freelancer_id === user.id
      const otherParty = isFreelancer ? booking.client : booking.freelancer
      const otherPartyName = otherParty?.display_name || 'Unknown user'

      activities.push({
        id: booking.id,
        type: 'booking',
        title: isFreelancer
          ? `Booking request from ${otherPartyName}`
          : `Booking with ${otherPartyName}`,
        time: getTimeAgo(booking.created_at),
        timestamp: booking.created_at,
        status: booking.status,
        icon: Briefcase
      })
    })

    // Add messages
    conversations.slice(0, 2).forEach(conv => {
      if (!conv || !conv.lastMessage) return
      activities.push({
        id: conv.otherUser.id,
        type: 'message',
        title: `Message from ${conv.otherUser.display_name}`,
        time: getTimeAgo(conv.lastMessage.created_at),
        timestamp: conv.lastMessage.created_at,
        status: conv.unreadCount > 0 ? 'unread' : 'read',
        icon: MessageSquare
      })
    })

    // Sort by timestamp
    return activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 4)
  }

  const recentActivity = loading ? [] : generateRecentActivity()

  // Calculate real stats
  const activeBookingsCount = bookings.filter(b =>
    ['pending', 'accepted', 'in_progress'].includes(b?.status)
  ).length

  const unreadMessagesCount = conversations.reduce((total, conv) =>
    total + (conv?.unreadCount || 0), 0
  )

  const projectsCount = user?.role === 'Organiser' ? jobs.length : applications.length
  const activeProjectsCount = user?.role === 'Organiser'
    ? jobs.filter(j => j?.status === 'open' || j?.status === 'in_progress').length
    : applications.filter(a => a?.status === 'pending' || a?.status === 'selected').length

  const quickStats = [
    {
      label: 'Active Bookings',
      value: loading ? '...' : String(activeBookingsCount),
      change: loading ? 'Loading...' : `${bookings.length} total`,
      icon: Briefcase,
      color: 'text-[var(--foreground)]'
    },
    {
      label: 'Messages',
      value: loading ? '...' : String(conversations.length),
      change: loading ? 'Loading...' : (unreadMessagesCount > 0 ? `${unreadMessagesCount} unread` : 'All read'),
      icon: MessageSquare,
      color: 'text-[var(--foreground)]'
    },
    {
      label: user?.role === 'Organiser' ? 'Job Posts' : 'Applications',
      value: loading ? '...' : String(projectsCount),
      change: loading ? 'Loading...' : `${activeProjectsCount} active`,
      icon: Star,
      color: 'text-[var(--foreground)]'
    },
    {
      label: 'Profile Views',
      value: '—',
      change: 'Coming soon',
      icon: TrendingUp,
      color: 'text-[var(--foreground)]'
    }
  ]

  // Generate upcoming events from bookings
  const upcomingEvents = bookings
    .filter(b => b.status === 'accepted' && new Date(b.start_date) > new Date())
    .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
    .slice(0, 3)
    .map(booking => {
      const isFreelancer = booking.freelancer_id === user?.id
      const otherParty = isFreelancer ? booking.client : booking.freelancer
      const startDate = new Date(booking.start_date)
      const now = new Date()
      const daysUntil = Math.floor((startDate - now) / (1000 * 60 * 60 * 24))

      let dateDisplay = startDate.toLocaleDateString()
      if (daysUntil === 0) dateDisplay = 'Today'
      else if (daysUntil === 1) dateDisplay = 'Tomorrow'
      else if (daysUntil < 7) dateDisplay = startDate.toLocaleDateString('en-US', { weekday: 'long' })

      return {
        id: booking.id,
        title: booking.service_description || 'Booking',
        date: dateDisplay,
        time: startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        client: otherParty?.display_name || 'Unknown',
        type: 'booking'
      }
    })

  return (
    <div className="feed-main dark:bg-[#0B0B0B]">
      {/* Feed Content */}
      <div className="feed-content dark:bg-[#0B0B0B]">
        {/* Feed Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="section-header text-[var(--foreground)]">Your Feed</h1>
          <button onClick={() => navigate('/profile')} className="btn flex items-center gap-2">
            <Plus size={16} />
            Update Profile
          </button>
        </div>

        {/* Feed Display Box */}
        <div className="feed-empty dark:bg-[#111315] dark:border-[#1F1F1F]">
          <div className="mb-4">
            <Camera size={48} className="mx-auto text-[var(--secondary)] mb-4" />
            <h3 className="card-title mb-2 text-[var(--foreground)] dark:text-white">Your feed is empty</h3>
            <p className="text-[var(--secondary)] dark:text-[#B3B3B3]">
              Start following other creatives or create your first post to see content here
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => navigate('/discover')} className="btn">
              Discover Talent
            </button>
            <button onClick={() => navigate('/jobs')} className="btn">
              Browse Jobs
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {quickStats.map((stat, index) => {
            const IconComponent = stat.icon
            return (
              <div key={index} className="profile-card dark:bg-[#111315] dark:border-[#1F1F1F]">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-lg bg-[var(--muted)] dark:bg-[#1F1F1F]">
                    <IconComponent size={20} className="text-[var(--foreground)] dark:text-white" />
                  </div>
                  <span className="text-2xl font-bold text-[var(--foreground)] dark:text-white">{stat.value}</span>
                </div>
                <h4 className="text-sm font-medium text-[var(--foreground)] dark:text-white mb-1">{stat.label}</h4>
                <p className="text-xs text-[var(--secondary)] dark:text-[#B3B3B3]">{stat.change}</p>
              </div>
            )
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="profile-card dark:bg-[#111315] dark:border-[#1F1F1F]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="card-title dark:text-white">Recent Activity</h3>
              <button onClick={() => navigate('/bookings')} className="text-sm text-primary hover:underline">View All</button>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground dark:text-[#B3B3B3]">No recent activity</p>
                <p className="text-xs text-muted-foreground dark:text-[#B3B3B3] mt-1">
                  Start booking or messaging to see activity here
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity) => {
                  const IconComponent = activity.icon
                  return (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        activity.status === 'pending' ? 'bg-warning/20 text-warning' :
                        activity.status === 'unread' ? 'bg-primary/20 text-primary' :
                        activity.status === 'completed' ? 'bg-success/20 text-success' :
                        activity.status === 'accepted' ? 'bg-success/20 text-success' :
                        'bg-info/20 text-info'
                      }`}>
                        <IconComponent size={16} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground dark:text-white">{activity.title}</p>
                        <p className="text-xs text-muted-foreground dark:text-[#B3B3B3]">{activity.time}</p>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs ${
                        activity.status === 'pending' ? 'bg-warning/20 text-warning' :
                        activity.status === 'unread' ? 'bg-primary/20 text-primary' :
                        activity.status === 'completed' ? 'bg-success/20 text-success' :
                        activity.status === 'accepted' ? 'bg-success/20 text-success' :
                        'bg-info/20 text-info'
                      }`}>
                        {activity.status}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Upcoming Events */}
          <div className="profile-card dark:bg-[#111315] dark:border-[#1F1F1F]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="card-title dark:text-white">Upcoming Events</h3>
              <button onClick={() => navigate('/bookings')} className="text-sm text-primary hover:underline">View Calendar</button>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : upcomingEvents.length === 0 ? (
              <div className="text-center py-8">
                <Calendar size={48} className="mx-auto text-muted-foreground dark:text-[#B3B3B3] mb-3" />
                <p className="text-sm text-muted-foreground dark:text-[#B3B3B3]">No upcoming events</p>
                <p className="text-xs text-muted-foreground dark:text-[#B3B3B3] mt-1">
                  Accepted bookings will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-start gap-3 p-3 bg-card dark:bg-[#1F1F1F] rounded-lg border border-border dark:border-[#1F1F1F]">
                    <div className="p-2 rounded-lg bg-primary/20 text-primary">
                      <Calendar size={16} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-foreground dark:text-white">{event.title}</h4>
                      <p className="text-xs text-muted-foreground dark:text-[#B3B3B3] mb-1">{event.client}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground dark:text-[#B3B3B3]">
                        <Clock size={12} />
                        <span>{event.date} at {event.time}</span>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs ${
                      event.type === 'booking' ? 'bg-primary/20 text-primary' :
                      event.type === 'meeting' ? 'bg-info/20 text-info' :
                      'bg-warning/20 text-warning'
                    }`}>
                      {event.type}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Performance Insights */}
        <div className="profile-card dark:bg-[#111315] dark:border-[#1F1F1F] mt-6">
          <h3 className="card-title dark:text-white mb-4">Performance Insights</h3>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-muted-foreground dark:text-[#B3B3B3] mb-2">—</div>
                <div className="text-sm text-muted-foreground dark:text-[#B3B3B3]">Response Rate</div>
                <div className="text-xs text-muted-foreground dark:text-[#B3B3B3] mt-1">Coming soon</div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-muted-foreground dark:text-[#B3B3B3] mb-2">—</div>
                <div className="text-sm text-muted-foreground dark:text-[#B3B3B3]">Average Rating</div>
                <div className="text-xs text-muted-foreground dark:text-[#B3B3B3] mt-1">Coming soon</div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-success mb-2">{bookings.filter(b => b.status === 'completed').length}</div>
                <div className="text-sm text-muted-foreground dark:text-[#B3B3B3]">Completed Bookings</div>
                <div className="text-xs text-muted-foreground dark:text-[#B3B3B3] mt-1">All time</div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <button
            onClick={() => navigate('/discover')}
            className="profile-card dark:bg-[#111315] dark:border-[#1F1F1F] hover:bg-surface-hover transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20 text-primary">
                <Users size={20} />
              </div>
              <div>
                <div className="font-medium text-foreground dark:text-white">Find Talent</div>
                <div className="text-xs text-muted-foreground dark:text-[#B3B3B3]">Discover creatives</div>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate('/bookings')}
            className="profile-card dark:bg-[#111315] dark:border-[#1F1F1F] hover:bg-surface-hover transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/20 text-success">
                <Briefcase size={20} />
              </div>
              <div>
                <div className="font-medium text-foreground dark:text-white">Create Booking</div>
                <div className="text-xs text-muted-foreground dark:text-[#B3B3B3]">Book a service</div>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate('/jobs')}
            className="profile-card dark:bg-[#111315] dark:border-[#1F1F1F] hover:bg-surface-hover transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-info/20 text-info">
                <Star size={20} />
              </div>
              <div>
                <div className="font-medium text-foreground dark:text-white">Browse Jobs</div>
                <div className="text-xs text-muted-foreground dark:text-[#B3B3B3]">Find opportunities</div>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate('/messages')}
            className="profile-card dark:bg-[#111315] dark:border-[#1F1F1F] hover:bg-surface-hover transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/20 text-warning">
                <MessageSquare size={20} />
              </div>
              <div>
                <div className="font-medium text-foreground dark:text-white">Send Message</div>
                <div className="text-xs text-muted-foreground dark:text-[#B3B3B3]">Connect with others</div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

export default CleanFeedDashboard

