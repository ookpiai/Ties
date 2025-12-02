/**
 * OnboardingChecklist Component
 *
 * Progressive onboarding checklist inspired by:
 * - Notion's getting started checklist
 * - Stripe's setup guide
 * - Linear's onboarding flow
 *
 * Features:
 * - Tracks user progress
 * - Contextual help for each step
 * - Can be minimized/dismissed
 * - Persists state in localStorage
 */

import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../App'
import {
  CheckCircle,
  Circle,
  ChevronDown,
  ChevronUp,
  X,
  User,
  Camera,
  Calendar,
  DollarSign,
  CreditCard,
  Briefcase,
  Search,
  MessageCircle,
  Star,
  Award,
  Sparkles,
  ArrowRight
} from 'lucide-react'
import { Button } from '../ui/button'

// Storage key for checklist state
const STORAGE_KEY = 'ties_onboarding_checklist'

// Checklist items configuration
const checklistConfig = {
  freelancer: [
    {
      id: 'profile_photo',
      title: 'Add a profile photo',
      description: 'Profiles with photos get 14x more views',
      icon: Camera,
      href: '/profile?edit=photo',
      checkFn: (user, profile) => !!profile?.avatar_url
    },
    {
      id: 'complete_bio',
      title: 'Write your bio',
      description: 'Tell clients about your experience and style',
      icon: User,
      href: '/profile?edit=bio',
      checkFn: (user, profile) => profile?.bio && profile.bio.length > 50
    },
    {
      id: 'set_rates',
      title: 'Set your rates',
      description: 'Add hourly or daily rates for your services',
      icon: DollarSign,
      href: '/profile?edit=rates',
      checkFn: (user, profile) => !!profile?.hourly_rate || !!profile?.daily_rate
    },
    {
      id: 'add_portfolio',
      title: 'Add portfolio items',
      description: 'Showcase your best work with photos or videos',
      icon: Camera,
      href: '/profile?tab=portfolio',
      checkFn: (user, profile) => profile?.portfolio_items?.length > 0
    },
    {
      id: 'set_availability',
      title: 'Set your availability',
      description: 'Block dates when you\'re not available',
      icon: Calendar,
      href: '/bookings',
      checkFn: (user, profile) => profile?.availability_set
    },
    {
      id: 'connect_payments',
      title: 'Connect payment account',
      description: 'Set up Stripe to receive payments',
      icon: CreditCard,
      href: '/settings?tab=payments',
      checkFn: (user, profile) => !!profile?.stripe_account_id
    },
    {
      id: 'browse_jobs',
      title: 'Browse available jobs',
      description: 'Find opportunities that match your skills',
      icon: Briefcase,
      href: '/jobs',
      checkFn: () => localStorage.getItem('ties_viewed_jobs') === 'true'
    }
  ],
  client: [
    {
      id: 'profile_photo',
      title: 'Add a profile photo',
      description: 'Help professionals recognize you',
      icon: Camera,
      href: '/profile?edit=photo',
      checkFn: (user, profile) => !!profile?.avatar_url
    },
    {
      id: 'complete_profile',
      title: 'Complete your profile',
      description: 'Add your name and contact info',
      icon: User,
      href: '/profile',
      checkFn: (user, profile) => !!profile?.display_name && !!profile?.location
    },
    {
      id: 'discover_talent',
      title: 'Discover talent',
      description: 'Browse DJs, photographers, venues and more',
      icon: Search,
      href: '/discovery',
      checkFn: () => localStorage.getItem('ties_viewed_discovery') === 'true'
    },
    {
      id: 'post_job',
      title: 'Post your first job',
      description: 'Find the perfect team for your event',
      icon: Briefcase,
      href: '/jobs/create',
      checkFn: (user, profile) => profile?.jobs_posted > 0
    },
    {
      id: 'send_message',
      title: 'Send a message',
      description: 'Reach out to a professional you like',
      icon: MessageCircle,
      href: '/messages',
      checkFn: (user, profile) => profile?.messages_sent > 0
    }
  ],
  venue: [
    {
      id: 'profile_photo',
      title: 'Add venue photos',
      description: 'Showcase your space with high-quality images',
      icon: Camera,
      href: '/profile?edit=photo',
      checkFn: (user, profile) => !!profile?.avatar_url
    },
    {
      id: 'complete_details',
      title: 'Add venue details',
      description: 'Capacity, amenities, and location',
      icon: User,
      href: '/profile',
      checkFn: (user, profile) => !!profile?.venue_capacity && !!profile?.location
    },
    {
      id: 'set_rates',
      title: 'Set rental rates',
      description: 'Add pricing for your space',
      icon: DollarSign,
      href: '/profile?edit=rates',
      checkFn: (user, profile) => !!profile?.hourly_rate || !!profile?.daily_rate
    },
    {
      id: 'add_portfolio',
      title: 'Add event photos',
      description: 'Show events hosted at your venue',
      icon: Camera,
      href: '/profile?tab=portfolio',
      checkFn: (user, profile) => profile?.portfolio_items?.length > 0
    },
    {
      id: 'set_availability',
      title: 'Set availability',
      description: 'Mark when your venue is available',
      icon: Calendar,
      href: '/bookings',
      checkFn: (user, profile) => profile?.availability_set
    },
    {
      id: 'connect_payments',
      title: 'Connect payment account',
      description: 'Set up Stripe to receive booking payments',
      icon: CreditCard,
      href: '/settings?tab=payments',
      checkFn: (user, profile) => !!profile?.stripe_account_id
    }
  ]
}

const OnboardingChecklist = ({ profile }) => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [isExpanded, setIsExpanded] = useState(true)
  const [isDismissed, setIsDismissed] = useState(false)

  // Load state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const state = JSON.parse(saved)
      setIsExpanded(state.isExpanded ?? true)
      setIsDismissed(state.isDismissed ?? false)
    }
  }, [])

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ isExpanded, isDismissed }))
  }, [isExpanded, isDismissed])

  // Get the appropriate checklist based on user role
  const checklist = useMemo(() => {
    const role = profile?.role?.toLowerCase() || 'freelancer'
    if (role.includes('venue')) return checklistConfig.venue
    if (role.includes('client') || role.includes('organiser')) return checklistConfig.client
    return checklistConfig.freelancer
  }, [profile?.role])

  // Calculate completion status for each item
  const itemsWithStatus = useMemo(() => {
    return checklist.map(item => ({
      ...item,
      completed: item.checkFn(user, profile)
    }))
  }, [checklist, user, profile])

  // Calculate overall progress
  const completedCount = itemsWithStatus.filter(item => item.completed).length
  const totalCount = itemsWithStatus.length
  const progressPercent = Math.round((completedCount / totalCount) * 100)

  // Don't show if dismissed or 100% complete
  if (isDismissed || progressPercent === 100) return null

  const handleDismiss = () => {
    setIsDismissed(true)
  }

  const handleItemClick = (item) => {
    // Track that user has viewed certain pages
    if (item.id === 'browse_jobs') {
      localStorage.setItem('ties_viewed_jobs', 'true')
    }
    if (item.id === 'discover_talent') {
      localStorage.setItem('ties_viewed_discovery', 'true')
    }
    navigate(item.href)
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
      {/* Header */}
      <div
        className="px-4 py-3 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
              <Sparkles className="w-4 h-4 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                Complete Your Profile
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {completedCount} of {totalCount} steps completed
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Progress Circle */}
            <div className="relative w-10 h-10">
              <svg className="w-10 h-10 -rotate-90">
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  className="text-gray-200 dark:text-gray-700"
                />
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray={`${progressPercent} 100`}
                  strokeLinecap="round"
                  className="text-red-500"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-gray-900 dark:text-white">
                {progressPercent}%
              </span>
            </div>

            {/* Expand/Collapse Button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsExpanded(!isExpanded)
              }}
              className="p-1 rounded hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors"
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </button>

            {/* Dismiss Button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleDismiss()
              }}
              className="p-1 rounded hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors"
              title="Dismiss checklist"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Checklist Items */}
      {isExpanded && (
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {itemsWithStatus.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.id}
                onClick={() => !item.completed && handleItemClick(item)}
                className={`
                  px-4 py-3 flex items-center gap-3 transition-colors
                  ${item.completed
                    ? 'bg-gray-50/50 dark:bg-gray-800/30'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer'
                  }
                `}
              >
                {/* Status Icon */}
                <div className={`
                  flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                  ${item.completed
                    ? 'bg-green-100 dark:bg-green-900/30'
                    : 'bg-gray-100 dark:bg-gray-800'
                  }
                `}>
                  {item.completed ? (
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${
                    item.completed
                      ? 'text-gray-500 dark:text-gray-500 line-through'
                      : 'text-gray-900 dark:text-white'
                  }`}>
                    {item.title}
                  </p>
                  {!item.completed && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {item.description}
                    </p>
                  )}
                </div>

                {/* Arrow */}
                {!item.completed && (
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Footer with motivation */}
      {isExpanded && progressPercent < 100 && (
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            {progressPercent < 50
              ? 'Complete profiles get up to 5x more bookings!'
              : progressPercent < 80
              ? 'You\'re making great progress! Keep going!'
              : 'Almost there! Just a few more steps!'
            }
          </p>
        </div>
      )}
    </div>
  )
}

export default OnboardingChecklist
