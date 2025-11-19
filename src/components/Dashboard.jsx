import { useAuth } from '../App'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  Calendar,
  MessageCircle,
  Search,
  FolderOpen,
  TrendingUp,
  Star,
  Clock,
  Plus
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getBookings } from '../api/bookings'
import { getMyConversations } from '../api/messages'
import { getJobPostings, getMyApplications } from '../api/jobs'

const Dashboard = () => {
  const { user } = useAuth()

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
        console.log('Dashboard: No user ID, skipping data load')
        setLoading(false)
        return
      }

      try {
        console.log('Dashboard: Loading data for user:', user.id, 'role:', user.role)
        setLoading(true)

        // Load bookings (both as client and freelancer)
        const bookingsData = await getBookings()
        console.log('Dashboard: Loaded bookings:', bookingsData?.length || 0)
        setBookings(bookingsData || [])

        // Load conversations
        const conversationsData = await getMyConversations()
        console.log('Dashboard: Loaded conversations:', conversationsData?.length || 0)
        setConversations(conversationsData || [])

        // Load jobs based on role
        if (user.role === 'Organiser') {
          const jobsData = await getJobPostings({ organiser_id: user.id })
          console.log('Dashboard: Loaded jobs:', jobsData?.length || 0)
          setJobs(jobsData || [])
        } else {
          // For other roles, get applications
          const applicationsData = await getMyApplications()
          console.log('Dashboard: Loaded applications:', applicationsData?.length || 0)
          setApplications(applicationsData || [])
        }

        console.log('Dashboard: Data loading complete')
      } catch (error) {
        console.error('Dashboard: Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [user?.id, user?.role])

  const quickActions = [
    {
      title: 'Discover Talent',
      description: 'Find creative professionals for your projects',
      icon: Search,
      href: '/discover',
      color: 'bg-blue-500'
    },
    {
      title: 'Create Booking',
      description: 'Book a freelancer or service',
      icon: Calendar,
      href: '/bookings',
      color: 'bg-green-500'
    },
    {
      title: 'New Project',
      description: 'Start a new TIES Studio project',
      icon: FolderOpen,
      href: '/projects',
      color: 'bg-purple-500'
    },
    {
      title: 'Send Message',
      description: 'Connect with other creatives',
      icon: MessageCircle,
      href: '/messages',
      color: 'bg-orange-500'
    }
  ]

  // Calculate real stats from loaded data
  const activeBookingsCount = bookings.filter(b =>
    ['pending', 'accepted', 'in_progress'].includes(b?.status)
  ).length

  const unreadMessagesCount = conversations.reduce((total, conv) =>
    total + (conv?.unreadCount || 0), 0
  )

  const totalConversations = conversations.length

  // Calculate projects/applications based on role
  const projectsCount = user?.role === 'Organiser'
    ? jobs.length
    : applications.length

  const activeProjectsCount = user?.role === 'Organiser'
    ? jobs.filter(j => j?.status === 'open' || j?.status === 'in_progress').length
    : applications.filter(a => a?.status === 'pending' || a?.status === 'selected').length

  const stats = [
    {
      title: 'Active Bookings',
      value: loading ? '...' : String(activeBookingsCount),
      change: loading ? 'Loading...' : `${bookings.length} total`,
      icon: Calendar
    },
    {
      title: 'Messages',
      value: loading ? '...' : String(totalConversations),
      change: loading ? 'Loading...' : (unreadMessagesCount > 0 ? `${unreadMessagesCount} unread` : 'All read'),
      icon: MessageCircle
    },
    {
      title: user?.role === 'Organiser' ? 'Job Posts' : 'Applications',
      value: loading ? '...' : String(projectsCount),
      change: loading ? 'Loading...' : `${activeProjectsCount} active`,
      icon: FolderOpen
    },
    {
      title: 'Profile Views',
      value: '—',
      change: 'Coming soon',
      icon: TrendingUp
    }
  ]

  // Generate real recent activity from data
  const generateRecentActivity = () => {
    const activities = []

    // Add recent bookings
    bookings
      .forEach(booking => {
        if (!booking || !user?.id) return

        const isFreelancer = booking.freelancer_id === user.id
        const otherParty = isFreelancer ? booking.client : booking.freelancer
        const otherPartyName = otherParty?.display_name || 'Unknown user'

        activities.push({
          type: 'booking',
          title: isFreelancer
            ? `Booking request from ${otherPartyName}`
            : `Booking with ${otherPartyName}`,
          timestamp: booking.created_at,
          timeDisplay: getTimeAgo(booking.created_at),
          status: booking.status,
          link: `/bookings/${booking.id}`
        })
      })

    // Add recent messages (show all conversations, not just unread)
    conversations
      .forEach(conv => {
        if (!conv || !conv.lastMessage || !conv.otherUser) return

        activities.push({
          type: 'message',
          title: conv.unreadCount > 0
            ? `${conv.unreadCount} message${conv.unreadCount > 1 ? 's' : ''} from ${conv.otherUser.display_name}`
            : `Message from ${conv.otherUser.display_name}`,
          timestamp: conv.lastMessage.created_at,
          timeDisplay: getTimeAgo(conv.lastMessage.created_at),
          status: conv.unreadCount > 0 ? 'unread' : 'read',
          link: '/messages'
        })
      })

    // Add recent jobs/applications
    if (user?.role === 'Organiser') {
      jobs.forEach(job => {
        if (!job) return

        activities.push({
          type: 'project',
          title: `Job: ${job.title || 'Untitled Job'}`,
          timestamp: job.created_at,
          timeDisplay: getTimeAgo(job.created_at),
          status: job.status || 'open',
          link: `/jobs/${job.id}`
        })
      })
    } else {
      applications.forEach(app => {
        if (!app) return

        activities.push({
          type: 'project',
          title: `Application: ${app.job?.title || 'Job'}`,
          timestamp: app.created_at,
          timeDisplay: getTimeAgo(app.created_at),
          status: app.status || 'pending',
          link: `/jobs/${app.job_id}`
        })
      })
    }

    // Sort by timestamp (most recent first) and limit to 6 items
    return activities
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 6)
  }

  const recentActivity = loading ? [] : generateRecentActivity()

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

  const getRoleSpecificContent = () => {
    switch (user?.role) {
      case 'Artist':
      case 'Crew':
        return {
          title: `Welcome back, ${user.role}!`,
          subtitle: 'Manage your bookings, showcase your work, and connect with clients.',
          primaryAction: 'Update Portfolio',
          primaryHref: '/profile'
        }
      case 'Organiser':
        return {
          title: 'Welcome back, Organiser!',
          subtitle: 'Find talent, manage projects, and bring your creative vision to life.',
          primaryAction: 'Post a Job',
          primaryHref: '/jobs/new'
        }
      case 'Venue':
        return {
          title: 'Welcome back, Venue Partner!',
          subtitle: 'Manage your space listings and connect with event organisers.',
          primaryAction: 'Update Venue Info',
          primaryHref: '/profile'
        }
      default:
        return {
          title: `Welcome to TIES Together!`,
          subtitle: 'Your creative collaboration platform.',
          primaryAction: 'Complete Profile',
          primaryHref: '/profile'
        }
    }
  }

  const roleContent = getRoleSpecificContent()

  return (
    <div className="min-h-screen bg-app text-app transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                {roleContent.title}
              </h1>
              <p className="text-slate-600 dark:text-slate-300 mt-1">
                {roleContent.subtitle}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {user?.subscription_type === 'pro' && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  <Star className="w-3 h-3 mr-1" />
                  PRO
                </Badge>
              )}
              <Link to={roleContent.primaryHref}>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  {roleContent.primaryAction}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index} className="bg-surface border border-app text-app rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-white/80">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">
                        {stat.value}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-white/60 mt-1">
                        {stat.change}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <Card className="bg-surface border border-app text-app rounded-2xl">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Get started with these common tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {quickActions.map((action, index) => {
                    const Icon = action.icon
                    return (
                      <Link key={index} to={action.href}>
                        <div className="p-4 border border-app rounded-lg hover:border-[#E03131] dark:hover:border-[#F03E3E] hover:shadow-sm transition-all cursor-pointer bg-surface">
                          <div className="flex items-start space-x-3">
                            <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center`}>
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className="font-medium text-slate-900 dark:text-white">
                                {action.title}
                              </h3>
                              <p className="text-sm text-slate-600 dark:text-white/80 mt-1">
                                {action.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div>
            <Card className="bg-surface border border-app text-app rounded-2xl">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Your latest updates and notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : recentActivity.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-500 dark:text-white/60 text-sm">
                      No recent activity yet
                    </p>
                    <p className="text-xs text-slate-400 dark:text-white/40 mt-1">
                      Start by exploring talent or checking your bookings
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <Link
                        key={index}
                        to={activity.link || '#'}
                        className="flex items-start space-x-3 hover:bg-slate-50 dark:hover:bg-slate-800 p-2 -m-2 rounded-lg transition-colors"
                      >
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            {activity.title}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Clock className="w-3 h-3 text-slate-400 dark:text-white/60" />
                            <p className="text-xs text-slate-500 dark:text-white/60">
                              {activity.timeDisplay}
                            </p>
                            <Badge
                              variant={
                                activity.status === 'pending' || activity.status === 'unread'
                                  ? 'default'
                                  : 'secondary'
                              }
                              className="text-xs"
                            >
                              {activity.status}
                            </Badge>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
                <div className="mt-4 pt-4 border-t border-app">
                  <Link to="/bookings">
                    <Button variant="outline" size="sm" className="w-full">
                      View All Activity
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Getting Started Section for New Users */}
        {!user?.bio && (
          <Card className="mt-8 bg-surface border border-app text-app rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                    Complete Your Profile
                  </h3>
                  <p className="text-blue-700 dark:text-blue-200 mt-1">
                    Add a bio, portfolio items, and tags to help others discover your work and connect with you.
                  </p>
                  <div className="mt-4">
                    <Link to="/profile">
                      <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                        Complete Profile
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default Dashboard

