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

const Dashboard = () => {
  const { user } = useAuth()

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

  const stats = [
    {
      title: 'Active Bookings',
      value: '3',
      change: '+2 this week',
      icon: Calendar
    },
    {
      title: 'Messages',
      value: '12',
      change: '5 unread',
      icon: MessageCircle
    },
    {
      title: 'Projects',
      value: '2',
      change: '1 in progress',
      icon: FolderOpen
    },
    {
      title: 'Profile Views',
      value: '47',
      change: '+12 this week',
      icon: TrendingUp
    }
  ]

  const recentActivity = [
    {
      type: 'booking',
      title: 'New booking request from Sarah Chen',
      time: '2 hours ago',
      status: 'pending'
    },
    {
      type: 'message',
      title: 'Message from Alex Rodriguez',
      time: '4 hours ago',
      status: 'unread'
    },
    {
      type: 'project',
      title: 'Task completed in "Summer Festival 2024"',
      time: '1 day ago',
      status: 'completed'
    },
    {
      type: 'profile',
      title: 'Profile viewed by 3 new users',
      time: '2 days ago',
      status: 'info'
    }
  ]

  const getRoleSpecificContent = () => {
    switch (user.role) {
      case 'freelancer':
        return {
          title: 'Welcome back, Creative!',
          subtitle: 'Manage your bookings, showcase your work, and connect with clients.',
          primaryAction: 'Update Portfolio',
          primaryHref: '/profile'
        }
      case 'organiser':
        return {
          title: 'Welcome back, Organiser!',
          subtitle: 'Find talent, manage projects, and bring your creative vision to life.',
          primaryAction: 'Create Project',
          primaryHref: '/projects'
        }
      case 'venue':
        return {
          title: 'Welcome back, Venue Partner!',
          subtitle: 'Manage your space listings and connect with event organisers.',
          primaryAction: 'Update Venue Info',
          primaryHref: '/profile'
        }
      case 'vendor':
        return {
          title: 'Welcome back, Service Provider!',
          subtitle: 'Showcase your services and connect with creative professionals.',
          primaryAction: 'Update Services',
          primaryHref: '/profile'
        }
      case 'collective':
        return {
          title: 'Welcome back, Creative Collective!',
          subtitle: 'Manage your team, collaborate on projects, and grow your network.',
          primaryAction: 'Manage Team',
          primaryHref: '/profile'
        }
      default:
        return {
          title: 'Welcome to TIES Together!',
          subtitle: 'Your creative collaboration platform.',
          primaryAction: 'Get Started',
          primaryHref: '/profile'
        }
    }
  }

  const roleContent = getRoleSpecificContent()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {roleContent.title}
              </h1>
              <p className="text-gray-600 mt-1">
                {roleContent.subtitle}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {user.subscription_type === 'pro' && (
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
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stat.value}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
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
            <Card>
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
                        <div className="p-4 border border-gray-200 rounded-lg hover:border-primary hover:shadow-sm transition-all cursor-pointer">
                          <div className="flex items-start space-x-3">
                            <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center`}>
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">
                                {action.title}
                              </h3>
                              <p className="text-sm text-gray-600 mt-1">
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
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Your latest updates and notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.title}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <p className="text-xs text-gray-500">
                            {activity.time}
                          </p>
                          <Badge 
                            variant={activity.status === 'pending' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {activity.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Link to="/messages">
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
        {!user.bio && (
          <Card className="mt-8 border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-blue-900">
                    Complete Your Profile
                  </h3>
                  <p className="text-blue-700 mt-1">
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

