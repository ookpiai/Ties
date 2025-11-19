import React, { useState } from 'react'
import { useAuth } from '../App'
import { 
  Home, 
  Search, 
  Compass, 
  Bell, 
  MessageCircle, 
  Briefcase, 
  Plus, 
  User, 
  Menu,
  Users,
  Building,
  Camera
} from 'lucide-react'

const FeedLayout = ({ children }) => {
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigationItems = [
    { icon: Home, label: 'Home', href: '/dashboard', active: true },
    { icon: Search, label: 'Search', href: '/discover' },
    { icon: Compass, label: 'Explore', href: '/explore' },
    { icon: Bell, label: 'Alerts', href: '/alerts' },
    { icon: MessageCircle, label: 'Messages', href: '/messages' },
    { icon: Briefcase, label: 'Jobs', href: '/bookings' },
    { icon: Plus, label: 'Create', href: '/create' },
    { icon: User, label: 'Profile', href: '/profile' }
  ]

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Left Sidebar Navigation */}
      <div className={`feed-sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <span className="font-heading text-xl text-foreground">TIES</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1">
          {navigationItems.map((item) => {
            const IconComponent = item.icon
            return (
              <a
                key={item.label}
                href={item.href}
                className={`nav-link ${item.active ? 'active' : ''}`}
              >
                <IconComponent size={20} />
                <span>{item.label}</span>
              </a>
            )
          })}
        </nav>

        {/* Bottom Menu */}
        <div className="absolute bottom-4 left-4 right-4">
          <button className="nav-link w-full">
            <Menu size={20} />
            <span>Menu</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="feed-main">
        {/* Mobile Header */}
        <div className="lg:hidden bg-card border-b border-border p-4 flex items-center justify-between">
          <button onClick={toggleSidebar} className="text-foreground">
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <span className="font-heading text-lg text-foreground">TIES</span>
          </div>
          <div className="w-6"></div>
        </div>

        {/* Welcome Banner */}
        <div className="welcome-banner">
          <p className="font-medium">Welcome to TIES Together!</p>
        </div>

        {/* Feed Content */}
        <div className="feed-content">
          {/* Feed Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="section-header">Your Feed</h1>
            <button className="btn-primary flex items-center gap-2">
              <Plus size={16} />
              Create Post
            </button>
          </div>

          {/* Feed Display Box */}
          <div className="feed-empty">
            <div className="mb-4">
              <Camera size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="card-title mb-2">Your feed is empty</h3>
              <p className="text-muted-foreground">
                Start following other creatives or create your first post to see content here
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button className="btn-primary">
                Explore Posts
              </button>
              <button className="btn-secondary">
                Create a Post
              </button>
            </div>
          </div>

          {/* Additional Content */}
          {children}
        </div>
      </div>

      {/* Right Sidebar Panel */}
      <div className="feed-right-sidebar hidden xl:block">
        {/* User Profile Card */}
        <div className="profile-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <User size={24} className="text-white" />
            </div>
            <div>
              <h3 className="card-title">{user?.username || 'charliewhite'}</h3>
              <p className="text-muted-foreground text-sm">
                {user?.role === 'freelancer' ? 'Local DJ' : user?.role || 'Creative Professional'}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="font-semibold text-foreground">0</div>
              <div className="text-xs text-muted-foreground">Posts</div>
            </div>
            <div>
              <div className="font-semibold text-foreground">1</div>
              <div className="text-xs text-muted-foreground">Followers</div>
            </div>
            <div>
              <div className="font-semibold text-foreground">0</div>
              <div className="text-xs text-muted-foreground">Following</div>
            </div>
          </div>
        </div>

        {/* Explore Shortcut Box */}
        <div className="explore-box">
          <h4 className="card-title mb-4">Explore</h4>
          
          <button className="btn-primary w-full mb-3 flex items-center justify-center gap-2">
            <Plus size={16} />
            Create Post
          </button>
          
          <div className="space-y-2">
            <button className="filter-button flex items-center gap-2">
              <Building size={16} />
              Vendors & Venues
            </button>
            <button className="filter-button flex items-center gap-2">
              <Users size={16} />
              Freelance Crew
            </button>
          </div>
        </div>

        {/* Suggested Connections */}
        <div className="explore-box mt-4">
          <h4 className="card-title mb-4">Suggested for You</h4>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                <User size={16} className="text-white" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-foreground">Sarah Chen</div>
                <div className="text-xs text-muted-foreground">Photographer</div>
              </div>
              <button className="text-xs text-primary hover:underline">Follow</button>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                <User size={16} className="text-white" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-foreground">Mike Rodriguez</div>
                <div className="text-xs text-muted-foreground">Video Editor</div>
              </div>
              <button className="text-xs text-primary hover:underline">Follow</button>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                <Building size={16} className="text-white" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-foreground">Studio Space</div>
                <div className="text-xs text-muted-foreground">Venue</div>
              </div>
              <button className="text-xs text-primary hover:underline">Follow</button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-5 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
    </div>
  )
}

export default FeedLayout

