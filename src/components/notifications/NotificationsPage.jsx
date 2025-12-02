/**
 * Notifications Page
 *
 * Full notifications management with:
 * - Real-time updates
 * - Filtering by type
 * - Mark as read / archive / delete
 * - Empty state guidance
 */

import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../App'
import {
  getNotifications,
  markAsRead,
  markOneAsRead,
  archiveNotification,
  deleteNotification,
  subscribeToNotifications,
  getNotificationIcon,
  getNotificationColor
} from '../../api/notifications'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import {
  Bell,
  Check,
  CheckCheck,
  Archive,
  Trash2,
  Calendar,
  MessageCircle,
  Briefcase,
  Star,
  DollarSign,
  Award,
  Eye,
  UserPlus,
  Info,
  Lightbulb,
  Clock,
  AlertTriangle,
  AtSign,
  Search,
  Filter,
  MoreHorizontal,
  ChevronRight
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

// Icon mapping
const iconMap = {
  'calendar-plus': Calendar,
  'calendar-check': Calendar,
  'calendar-x': Calendar,
  'check-circle': Check,
  'bell': Bell,
  'message-circle': MessageCircle,
  'briefcase': Briefcase,
  'search': Search,
  'eye': Eye,
  'star': Star,
  'dollar-sign': DollarSign,
  'clock': Clock,
  'award': Award,
  'alert-triangle': AlertTriangle,
  'info': Info,
  'lightbulb': Lightbulb,
  'user-plus': UserPlus,
  'at-sign': AtSign
}

// Color mapping
const colorClasses = {
  blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  red: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  orange: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
  purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  yellow: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
  gray: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
}

const NotificationsPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [unreadCount, setUnreadCount] = useState(0)

  // Load notifications
  const loadNotifications = useCallback(async () => {
    setLoading(true)
    const { data } = await getNotifications({
      limit: 50,
      unreadOnly: activeTab === 'unread'
    })
    setNotifications(data)
    setUnreadCount(data.filter(n => !n.is_read).length)
    setLoading(false)
  }, [activeTab])

  useEffect(() => {
    if (user) {
      loadNotifications()
    }
  }, [user, loadNotifications])

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!user) return

    const subscription = subscribeToNotifications(user.id, (newNotification) => {
      setNotifications(prev => [newNotification, ...prev])
      setUnreadCount(prev => prev + 1)
    })

    return () => subscription.unsubscribe()
  }, [user])

  // Handle mark all as read
  const handleMarkAllRead = async () => {
    await markAsRead()
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    setUnreadCount(0)
  }

  // Handle mark one as read
  const handleMarkRead = async (id) => {
    await markOneAsRead(id)
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, is_read: true } : n)
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  // Handle archive
  const handleArchive = async (id) => {
    await archiveNotification(id)
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  // Handle delete
  const handleDelete = async (id) => {
    await deleteNotification(id)
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  // Handle notification click
  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      await handleMarkRead(notification.id)
    }
    if (notification.related_url) {
      navigate(notification.related_url)
    }
  }

  // Get icon component
  const getIcon = (type) => {
    const iconName = getNotificationIcon(type)
    const IconComponent = iconMap[iconName] || Bell
    return IconComponent
  }

  // Render notification item
  const renderNotification = (notification) => {
    const IconComponent = getIcon(notification.type)
    const color = getNotificationColor(notification.type)
    const colorClass = colorClasses[color] || colorClasses.gray

    return (
      <div
        key={notification.id}
        className={`
          group relative p-4 border-b border-gray-100 dark:border-gray-800
          hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer
          ${!notification.is_read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}
        `}
        onClick={() => handleNotificationClick(notification)}
      >
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${colorClass}`}>
            <IconComponent className="w-5 h-5" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className={`font-medium ${!notification.is_read ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                  {notification.title}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">
                  {notification.message}
                </p>
              </div>

              {/* Unread indicator */}
              {!notification.is_read && (
                <span className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500" />
              )}
            </div>

            {/* Sender and time */}
            <div className="flex items-center gap-2 mt-2">
              {notification.sender_avatar && (
                <img
                  src={notification.sender_avatar}
                  alt={notification.sender_name}
                  className="w-5 h-5 rounded-full"
                />
              )}
              {notification.sender_name && (
                <span className="text-xs text-gray-500 dark:text-gray-500">
                  {notification.sender_name}
                </span>
              )}
              <span className="text-xs text-gray-400 dark:text-gray-600">
                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
              </span>
            </div>
          </div>

          {/* Actions (show on hover) */}
          <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-1">
              {!notification.is_read && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleMarkRead(notification.id)
                  }}
                  className="h-8 w-8 p-0"
                  title="Mark as read"
                >
                  <Check className="w-4 h-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  handleArchive(notification.id)
                }}
                className="h-8 w-8 p-0"
                title="Archive"
              >
                <Archive className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  handleDelete(notification.id)
                }}
                className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Filter notifications based on tab
  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'unread') return !n.is_read
    if (activeTab === 'bookings') return n.type.startsWith('booking')
    if (activeTab === 'messages') return n.type === 'message_received'
    if (activeTab === 'jobs') return n.type.startsWith('job')
    return true
  })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0B0B]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <Bell className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
              {unreadCount > 0 && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>

          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllRead}
              className="flex items-center gap-2"
            >
              <CheckCheck className="w-4 h-4" />
              Mark all read
            </Button>
          )}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <TabsTrigger value="all" className="flex items-center gap-2">
              All
            </TabsTrigger>
            <TabsTrigger value="unread" className="flex items-center gap-2">
              Unread
              {unreadCount > 0 && (
                <Badge variant="secondary" className="ml-1 bg-red-100 text-red-600">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="jobs">Jobs</TabsTrigger>
          </TabsList>

          {/* Content */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            {loading ? (
              <div className="p-12 text-center">
                <div className="w-8 h-8 border-2 border-gray-200 border-t-red-500 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">Loading notifications...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {activeTab === 'all' ? 'No notifications yet' : `No ${activeTab} notifications`}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6">
                  {activeTab === 'all'
                    ? 'When you get notifications about bookings, messages, and more, they\'ll appear here.'
                    : `You don't have any ${activeTab} notifications at the moment.`}
                </p>
                {activeTab === 'all' && (
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button variant="outline" onClick={() => navigate('/discovery')}>
                      <Search className="w-4 h-4 mr-2" />
                      Discover Talent
                    </Button>
                    <Button onClick={() => navigate('/jobs')}>
                      <Briefcase className="w-4 h-4 mr-2" />
                      Browse Jobs
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredNotifications.map(renderNotification)}
              </div>
            )}
          </div>
        </Tabs>

        {/* Tips Section */}
        {notifications.length === 0 && (
          <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Get Started with TIES Together
                </h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-center gap-2">
                    <ChevronRight className="w-4 h-4 text-blue-500" />
                    Complete your profile to attract more bookings
                  </li>
                  <li className="flex items-center gap-2">
                    <ChevronRight className="w-4 h-4 text-blue-500" />
                    Set your availability in the calendar
                  </li>
                  <li className="flex items-center gap-2">
                    <ChevronRight className="w-4 h-4 text-blue-500" />
                    Browse jobs or discover talent in your area
                  </li>
                  <li className="flex items-center gap-2">
                    <ChevronRight className="w-4 h-4 text-blue-500" />
                    Send a message to start a conversation
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default NotificationsPage
