import React from 'react'
import { useAuth } from '../App'
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

const CleanFeedDashboard = () => {
  const { user } = useAuth()

  const recentActivity = [
    {
      id: 1,
      type: 'booking',
      title: 'New booking request from Sarah Chen',
      time: '2 hours ago',
      status: 'pending',
      icon: Briefcase
    },
    {
      id: 2,
      type: 'message',
      title: 'Message from Alex Rodriguez',
      time: '4 hours ago',
      status: 'unread',
      icon: MessageSquare
    },
    {
      id: 3,
      type: 'project',
      title: 'Task completed in "Summer Festival 2024"',
      time: '1 day ago',
      status: 'completed',
      icon: Star
    },
    {
      id: 4,
      type: 'profile',
      title: 'Profile viewed by 3 new users',
      time: '2 days ago',
      status: 'info',
      icon: Users
    }
  ]

  const quickStats = [
    {
      label: 'Active Bookings',
      value: '13',
      change: '+2 this week',
      icon: Briefcase,
      color: 'text-[var(--foreground)]'
    },
    {
      label: 'Messages',
      value: '12',
      change: '5 unread',
      icon: MessageSquare,
      color: 'text-[var(--foreground)]'
    },
    {
      label: 'Projects',
      value: '2',
      change: '1 in progress',
      icon: Star,
      color: 'text-[var(--foreground)]'
    },
    {
      label: 'Profile Views',
      value: '47',
      change: '+12 this week',
      icon: TrendingUp,
      color: 'text-[var(--foreground)]'
    }
  ]

  const upcomingEvents = [
    {
      id: 1,
      title: 'Photo Shoot - Brand Campaign',
      date: 'Tomorrow',
      time: '10:00 AM',
      client: 'Creative Agency Co.',
      type: 'booking'
    },
    {
      id: 2,
      title: 'Video Call - Project Review',
      date: 'Friday',
      time: '2:00 PM',
      client: 'Sarah Chen',
      type: 'meeting'
    },
    {
      id: 3,
      title: 'Equipment Pickup',
      date: 'Monday',
      time: '9:00 AM',
      client: 'Studio Rental Co.',
      type: 'logistics'
    }
  ]

  return (
    <div className="feed-main dark:bg-[#0B0B0B]">
      {/* Feed Content */}
      <div className="feed-content dark:bg-[#0B0B0B]">
        {/* Feed Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="section-header text-[var(--foreground)]">Your Feed</h1>
          <button className="btn flex items-center gap-2">
            <Plus size={16} />
            Create Post
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
            <button className="btn">
              Explore Posts
            </button>
            <button className="btn">
              Create a Post
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
              <button className="text-sm text-primary hover:underline">View All</button>
            </div>
            
            <div className="space-y-4">
              {recentActivity.map((activity) => {
                const IconComponent = activity.icon
                return (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      activity.status === 'pending' ? 'bg-warning/20 text-warning' :
                      activity.status === 'unread' ? 'bg-primary/20 text-primary' :
                      activity.status === 'completed' ? 'bg-success/20 text-success' :
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
                      'bg-info/20 text-info'
                    }`}>
                      {activity.status}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="profile-card dark:bg-[#111315] dark:border-[#1F1F1F]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="card-title dark:text-white">Upcoming Events</h3>
              <button className="text-sm text-primary hover:underline">View Calendar</button>
            </div>
            
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
          </div>
        </div>

        {/* Performance Insights */}
        <div className="profile-card dark:bg-[#111315] dark:border-[#1F1F1F] mt-6">
          <h3 className="card-title dark:text-white mb-4">Performance Insights</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-success mb-2">94%</div>
              <div className="text-sm text-muted-foreground dark:text-[#B3B3B3]">Response Rate</div>
              <div className="text-xs text-success mt-1">+5% from last month</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">4.8</div>
              <div className="text-sm text-muted-foreground dark:text-[#B3B3B3]">Average Rating</div>
              <div className="text-xs text-success mt-1">Based on 23 reviews</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-info mb-2">$2,450</div>
              <div className="text-sm text-muted-foreground dark:text-[#B3B3B3]">This Month</div>
              <div className="text-xs text-success mt-1">+18% from last month</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <button className="profile-card dark:bg-[#111315] dark:border-[#1F1F1F] hover:bg-surface-hover transition-colors text-left">
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
          
          <button className="profile-card dark:bg-[#111315] dark:border-[#1F1F1F] hover:bg-surface-hover transition-colors text-left">
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
          
          <button className="profile-card dark:bg-[#111315] dark:border-[#1F1F1F] hover:bg-surface-hover transition-colors text-left">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-info/20 text-info">
                <Star size={20} />
              </div>
              <div>
                <div className="font-medium text-foreground dark:text-white">New Project</div>
                <div className="text-xs text-muted-foreground dark:text-[#B3B3B3]">Start collaboration</div>
              </div>
            </div>
          </button>
          
          <button className="profile-card dark:bg-[#111315] dark:border-[#1F1F1F] hover:bg-surface-hover transition-colors text-left">
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

