import { useAuth } from '../App'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import StatusBadge from '@/components/ui/StatusBadge'
import EmptyState from '@/components/ui/EmptyState'
import {
  Users,
  Calendar,
  MessageCircle,
  Search,
  FolderOpen,
  TrendingUp,
  Star,
  Clock,
  Plus,
  AlertCircle,
  CheckCircle,
  DollarSign,
  ArrowRight,
  Activity
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

  // Get pending actions that need attention
  const getPendingActions = () => {
    const actions = []

    // Pending bookings (requests to review)
    const pendingBookings = bookings.filter(b => b?.status === 'pending')
    if (pendingBookings.length > 0) {
      pendingBookings.forEach(booking => {
        const isFreelancer = booking.freelancer_id === user?.id
        const otherParty = isFreelancer ? booking.client : booking.freelancer
        actions.push({
          id: `booking-${booking.id}`,
          title: isFreelancer
            ? `Review booking request from ${otherParty?.display_name || 'Unknown'}`
            : `Awaiting response from ${otherParty?.display_name || 'Unknown'}`,
          description: `${booking.service_type || 'Booking'} on ${new Date(booking.start_date).toLocaleDateString()}`,
          type: 'booking',
          link: `/bookings/${booking.id}`,
          urgent: isFreelancer,
          icon: Calendar
        })
      })
    }

    // Unread messages
    const unreadConvs = conversations.filter(c => c?.unreadCount > 0)
    if (unreadConvs.length > 0) {
      actions.push({
        id: 'unread-messages',
        title: `${unreadMessagesCount} unread message${unreadMessagesCount > 1 ? 's' : ''}`,
        description: `From ${unreadConvs.length} conversation${unreadConvs.length > 1 ? 's' : ''}`,
        type: 'message',
        link: '/messages',
        urgent: unreadMessagesCount > 5,
        icon: MessageCircle
      })
    }

    // Incomplete profile
    if (!user?.bio || !user?.avatar_url) {
      actions.push({
        id: 'complete-profile',
        title: 'Complete your profile',
        description: 'Add a bio and photo to improve your visibility',
        type: 'profile',
        link: '/profile',
        urgent: false,
        icon: Users
      })
    }

    return actions.slice(0, 5) // Limit to 5 most important
  }

  const pendingActions = loading ? [] : getPendingActions()

  // Get this week's schedule (upcoming bookings)
  const getThisWeeksSchedule = () => {
    const now = new Date()
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    return bookings
      .filter(b => {
        if (!b?.start_date) return false
        const startDate = new Date(b.start_date)
        return startDate >= now && startDate <= weekFromNow &&
               ['accepted', 'in_progress'].includes(b.status)
      })
      .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
      .slice(0, 5)
  }

  const weekSchedule = loading ? [] : getThisWeeksSchedule()

  return (
    <div className="min-h-screen bg-app text-app transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header - Surreal-inspired */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Welcome back, {user?.display_name || user?.first_name || 'there'}
            </h1>
            <div className="flex items-center space-x-3">
              {user?.subscription_type === 'pro' && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                  <Star className="w-3 h-3 mr-1" />
                  PRO
                </Badge>
              )}
              <Link to={roleContent.primaryHref}>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  {roleContent.primaryAction}
                </Button>
              </Link>
            </div>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Quick Stats - Birds Eye View */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            const isLoading = stat.value === '...'
            return (
              <Card key={index} className="bg-surface border border-app text-app rounded-xl hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                      {isLoading ? (
                        <span className="inline-block w-12 h-7 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></span>
                      ) : (
                        stat.value
                      )}
                    </p>
                    <p className="text-xs font-medium text-slate-600 dark:text-white/70 mb-1">
                      {stat.title}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-white/50">
                      {stat.change}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Pending Actions - Surreal-inspired attention section */}
        {pendingActions.length > 0 && (
          <Card className="bg-orange-50 border border-orange-200 dark:bg-orange-950/20 dark:border-orange-900/30 rounded-xl mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  <h3 className="font-semibold text-orange-900 dark:text-orange-100">
                    Requires Your Attention ({pendingActions.length})
                  </h3>
                </div>
              </div>
              <div className="space-y-2">
                {pendingActions.map((action) => {
                  const ActionIcon = action.icon
                  return (
                    <Link
                      key={action.id}
                      to={action.link}
                      className="flex items-center justify-between p-3 bg-white dark:bg-slate-900/50 rounded-lg hover:shadow-sm transition-shadow border border-slate-200 dark:border-slate-700"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          action.urgent
                            ? 'bg-red-100 dark:bg-red-900/30'
                            : 'bg-slate-100 dark:bg-slate-800'
                        }`}>
                          <ActionIcon className={`w-4 h-4 ${
                            action.urgent
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-slate-600 dark:text-slate-400'
                          }`} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            {action.title}
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            {action.description}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </Link>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* This Week's Schedule */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-surface border border-app text-app rounded-xl">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">This Week's Schedule</CardTitle>
                    <CardDescription className="text-xs">
                      Upcoming confirmed bookings
                    </CardDescription>
                  </div>
                  <Link to="/bookings">
                    <Button variant="ghost" size="sm">
                      View All <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : weekSchedule.length === 0 ? (
                  <EmptyState
                    icon={Calendar}
                    title="No bookings this week"
                    description="Check the discovery page to find new opportunities and grow your network."
                    action={{
                      label: "Discover Talent",
                      href: "/discover",
                      icon: Search
                    }}
                    variant="compact"
                    size="sm"
                  />
                ) : (
                  <div className="space-y-3">
                    {weekSchedule.map((booking) => {
                      const isFreelancer = booking.freelancer_id === user?.id
                      const otherParty = isFreelancer ? booking.client : booking.freelancer
                      const startDate = new Date(booking.start_date)
                      const dayName = startDate.toLocaleDateString('en-US', { weekday: 'short' })
                      const dateStr = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

                      return (
                        <Link
                          key={booking.id}
                          to={`/bookings/${booking.id}`}
                          className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg hover:shadow-sm transition-shadow border border-slate-200 dark:border-slate-700"
                        >
                          <div className="flex-shrink-0 w-12 text-center">
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                              {dayName}
                            </p>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                              {dateStr}
                            </p>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                              {booking.service_type || 'Booking'} with {otherParty?.display_name || 'Unknown'}
                            </p>
                            <p className="text-xs text-slate-600 dark:text-slate-400">
                              {booking.start_time || 'Time TBD'}
                            </p>
                          </div>
                          <StatusBadge
                            status={booking.status}
                            type="booking"
                            size="sm"
                            className="flex-shrink-0"
                          />
                        </Link>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-surface border border-app text-app rounded-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-3">
                  {quickActions.map((action, index) => {
                    const Icon = action.icon
                    return (
                      <Link key={index} to={action.href}>
                        <div className="p-3 border border-app rounded-lg hover:border-primary hover:shadow-sm transition-all cursor-pointer bg-surface">
                          <div className="flex items-start space-x-3">
                            <div className={`w-9 h-9 ${action.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                              <Icon className="w-4 h-4 text-white" />
                            </div>
                            <div className="min-w-0">
                              <h3 className="text-sm font-medium text-slate-900 dark:text-white">
                                {action.title}
                              </h3>
                              <p className="text-xs text-slate-600 dark:text-white/70 mt-1">
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

          {/* Recent Activity Sidebar */}
          <div>
            <Card className="bg-surface border border-app text-app rounded-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Activity className="w-4 h-4 mr-2" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : recentActivity.length === 0 ? (
                  <EmptyState
                    icon={Clock}
                    title="No recent activity"
                    description="Your activity feed will show updates here."
                    variant="compact"
                    size="sm"
                  />
                ) : (
                  <div className="space-y-3">
                    {recentActivity.map((activity, index) => (
                      <Link
                        key={index}
                        to={activity.link || '#'}
                        className="flex items-start space-x-2 hover:bg-slate-50 dark:hover:bg-slate-800 p-2 -m-2 rounded-lg transition-colors"
                      >
                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                          activity.status === 'pending' || activity.status === 'unread'
                            ? 'bg-primary'
                            : 'bg-slate-300 dark:bg-slate-600'
                        }`}></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-900 dark:text-white line-clamp-2">
                            {activity.title}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <p className="text-xs text-slate-500 dark:text-white/50">
                              {activity.timeDisplay}
                            </p>
                            <StatusBadge
                              status={activity.status}
                              type={activity.type}
                              size="sm"
                              className="h-4 px-1.5"
                            />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
                <div className="mt-4 pt-3 border-t border-app">
                  <Link to="/bookings">
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      View All Activity
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Getting Started Banner for New Users */}
        {!user?.bio && (
          <Card className="mt-6 bg-blue-50 border border-blue-200 dark:bg-blue-950/20 dark:border-blue-900/30 rounded-xl">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                    Complete Your Profile
                  </h3>
                  <p className="text-xs text-blue-700 dark:text-blue-200 mt-1">
                    Add a bio, portfolio items, and services to help others discover your work.
                  </p>
                  <div className="mt-3">
                    <Link to="/profile">
                      <Button size="sm" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/30">
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

