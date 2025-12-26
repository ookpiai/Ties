import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Home,
  Compass,
  MessageSquare,
  Bell,
  PlusCircle,
  CalendarCheck,
  User,
  Briefcase,
  Menu,
  Settings,
  Sun,
  Moon,
  Bug,
  LogOut,
  ChevronDown,
  ChevronUp,
  Layers,
  X
} from 'lucide-react'
import { useAuth } from '../../App'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet'
import NotificationBell from '../notifications/NotificationBell'

const AppLayout = ({ children }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [isMoreOpen, setIsMoreOpen] = useState(false)
  const [isThemeOpen, setIsThemeOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Initialize from localStorage or system preference
    const saved = localStorage.getItem('theme')
    if (saved) {
      return saved === 'dark'
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    // Apply theme to <html> element and persist to localStorage
    const html = document.documentElement
    if (isDarkMode) {
      html.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      html.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [isDarkMode])

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const primaryNavItems = [
    { path: '/dashboard', label: 'Home', icon: Home },
    { path: '/discover', label: 'Discover Talent', icon: Compass },
    { path: '/jobs', label: 'Jobs', icon: Layers },
    { path: '/messages', label: 'Messages', icon: MessageSquare },
    { path: '/notifications', label: 'Notifications', icon: Bell },
    { path: '/create', label: 'Create', icon: PlusCircle },
    { path: '/bookings', label: 'Bookings', icon: CalendarCheck },
    { path: '/profile', label: 'Profile', icon: User },
    { path: '/studio', label: 'Studio', icon: Briefcase },
  ]

  const moreItems = [
    { path: '/jobs/my-applications', label: 'My Applications', icon: Briefcase },
    { path: '/jobs/my-jobs', label: 'My Job Postings', icon: Layers },
    { path: '/settings', label: 'Settings', icon: Settings },
    { path: '/report', label: 'Report Problem', icon: Bug },
  ]

  const isActive = (path) => location.pathname === path

  const NavItem = ({ item, onClick, isSecondary = false, closeMobile = false }) => {
    const Icon = item.icon
    const active = isActive(item.path)

    const handleClick = () => {
      if (onClick) onClick()
      if (closeMobile) setIsMobileMenuOpen(false)
    }

    return (
      <Link
        to={item.path}
        onClick={handleClick}
        aria-current={active ? 'page' : undefined}
        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors font-medium
          ${active
            ? 'bg-red-600/10 text-red-600 dark:bg-red-600/20 dark:text-red-500'
            : 'text-slate-900 dark:text-white hover:text-red-600 dark:hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800/50'
          }
        `}
      >
        <Icon className="w-5 h-5 stroke-current" />
        <span>{item.label}</span>
      </Link>
    )
  }

  // Reusable sidebar content
  const SidebarContent = ({ closeMobile = false }) => (
    <>
      {/* Brand Lockup */}
      <Link
        to="/"
        onClick={closeMobile ? () => setIsMobileMenuOpen(false) : undefined}
        className="pt-6 px-4 mb-6 flex items-center justify-between hover:opacity-80 transition-opacity"
      >
        <div className="font-bold text-lg leading-tight text-slate-900 dark:text-white">
          <div>TIES</div>
          <div>Together</div>
        </div>
        <img
          src="/logo.png"
          alt="TIES Together Logo"
          className="w-auto flex-shrink-0 object-contain"
          style={{ height: '72px', imageRendering: 'crisp-edges' }}
        />
      </Link>

      {/* Primary Navigation */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {primaryNavItems.map((item) => (
          <NavItem key={item.path} item={item} closeMobile={closeMobile} />
        ))}

        {/* Divider */}
        <div className="py-3">
          <div className="border-t border-app" />
        </div>

        {/* More Section (Collapsible) */}
        <div>
          <button
            onClick={() => setIsMoreOpen(!isMoreOpen)}
            className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg transition-colors text-slate-900 dark:text-white font-medium hover:text-red-600 dark:hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800/50"
            aria-expanded={isMoreOpen}
          >
            <div className="flex items-center gap-3">
              <Menu className="w-5 h-5 stroke-current" />
              <span>More</span>
            </div>
            {isMoreOpen ? <ChevronUp className="w-4 h-4 stroke-current" /> : <ChevronDown className="w-4 h-4 stroke-current" />}
          </button>

          {/* More Items */}
          {isMoreOpen && (
            <div className="mt-1 ml-3 space-y-2 pl-2 border-l-2 border-slate-800/60">
              {moreItems.map((item, index) => (
                <NavItem key={item.path || index} item={item} isSecondary={true} closeMobile={closeMobile} />
              ))}

              {/* Inline Switch Appearance */}
              <div>
                <button
                  onClick={() => setIsThemeOpen(!isThemeOpen)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-slate-900 dark:text-white font-medium hover:text-red-600 dark:hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                  aria-expanded={isThemeOpen}
                  aria-controls="theme-toggle-panel"
                >
                  {isDarkMode ? <Moon className="w-5 h-5 stroke-current" /> : <Sun className="w-5 h-5 stroke-current" />}
                  <span>Switch appearance</span>
                </button>

                {/* Collapsible Theme Toggle Panel */}
                <div
                  id="theme-toggle-panel"
                  className={`mt-1 ml-2 mr-2 overflow-hidden transition-[max-height] duration-200 ${isThemeOpen ? 'max-h-20' : 'max-h-0'}`}
                >
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    aria-pressed={isDarkMode}
                  >
                    <span className="text-sm font-medium">Dark mode</span>
                    <span className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      isDarkMode ? 'bg-slate-700' : 'bg-slate-300'
                    }`}>
                      <span className={`inline-block h-4 w-4 transform rounded-full transition-transform ${
                        isDarkMode ? 'bg-slate-200 translate-x-4' : 'bg-white translate-x-1'
                      }`}></span>
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Log Out (Bottom) */}
      <div className="px-4 pb-6 pt-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-slate-900 dark:text-white font-medium hover:text-red-600 dark:hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800/50"
        >
          <LogOut className="w-5 h-5 stroke-current" />
          <span>Log Out</span>
        </button>
      </div>
    </>
  )

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-app">
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F141B] backdrop-blur">
        <div className="flex items-center justify-between px-4 py-3">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                <Menu className="w-6 h-6 text-slate-900 dark:text-white" />
                <span className="sr-only">Open menu</span>
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-0 bg-white dark:bg-[#0F141B] flex flex-col">
              <SidebarContent closeMobile={true} />
            </SheetContent>
          </Sheet>

          <Link to="/" className="font-bold text-lg text-slate-900 dark:text-white">
            TIES Together
          </Link>

          <NotificationBell />
        </div>
      </header>

      {/* Desktop Sidebar - Hidden on mobile */}
      <aside className="hidden lg:flex w-[280px] h-full bg-white dark:bg-[#0F141B] border-r border-slate-200 dark:border-slate-800/60 backdrop-blur flex-col sticky top-0">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-app text-app transition-colors duration-200">
        {children}
      </main>
    </div>
  )
}

export default AppLayout
