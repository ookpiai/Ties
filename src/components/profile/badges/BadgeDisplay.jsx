/**
 * Badge Display Components
 *
 * Premium badge display system inspired by Fiverr/Upwork
 * Shows verification badges, performance levels, and trust signals
 *
 * Sources:
 * - https://www.freelancer.com/verified
 * - https://help.fiverr.com/hc/en-us/articles/29453184449169-Fiverr-Pro-freelancer-Badge-and-benefits
 * - https://support.upwork.com/hc/en-us/articles/360001176427
 */

import React, { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  ShieldCheck,
  CreditCard,
  Mail,
  Phone,
  TrendingUp,
  Award,
  Crown,
  BadgeCheck,
  Zap,
  Clock,
  Users,
  Sparkles,
  Heart,
  Star,
  CheckCircle,
  Info,
  Loader2,
} from 'lucide-react'
import {
  getUserBadgesWithInfo,
  sortBadgesForDisplay,
  getVerificationStatus,
  getHighestPerformanceBadge,
  BADGE_INFO,
} from '../../../api/badges'

// Icon mapping for badges
const BADGE_ICONS = {
  ShieldCheck,
  CreditCard,
  Mail,
  Phone,
  TrendingUp,
  Award,
  Crown,
  BadgeCheck,
  Zap,
  Clock,
  Users,
  Sparkles,
  Heart,
  Star,
}

/**
 * Compact Badge Row - Shows top badges inline
 */
export const BadgeRow = ({ userId, maxDisplay = 4, onViewAll }) => {
  const [badges, setBadges] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadBadges = async () => {
      if (!userId) return
      setIsLoading(true)
      try {
        const data = await getUserBadgesWithInfo(userId)
        setBadges(sortBadgesForDisplay(data))
      } catch (error) {
        console.error('Failed to load badges:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadBadges()
  }, [userId])

  if (isLoading || badges.length === 0) return null

  const displayBadges = badges.slice(0, maxDisplay)
  const remainingCount = badges.length - maxDisplay

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1.5 flex-wrap">
        {displayBadges.map((badge) => {
          const IconComponent = BADGE_ICONS[badge.info.icon] || Star
          return (
            <Tooltip key={badge.id}>
              <TooltipTrigger>
                <div
                  className={`p-1.5 rounded-md ${badge.info.bgColor} border ${badge.info.borderColor}`}
                >
                  <IconComponent className={`w-4 h-4 ${badge.info.color}`} />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-medium">{badge.info.label}</p>
                <p className="text-xs text-slate-500 max-w-48">
                  {badge.info.description}
                </p>
              </TooltipContent>
            </Tooltip>
          )
        })}
        {remainingCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-slate-500"
            onClick={onViewAll}
          >
            +{remainingCount} more
          </Button>
        )}
      </div>
    </TooltipProvider>
  )
}

/**
 * Verification Status Row - Shows verification checkmarks
 */
export const VerificationRow = ({ userId }) => {
  const [badges, setBadges] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadBadges = async () => {
      if (!userId) return
      setIsLoading(true)
      try {
        const data = await getUserBadgesWithInfo(userId)
        setBadges(data)
      } catch (error) {
        console.error('Failed to load badges:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadBadges()
  }, [userId])

  if (isLoading) return null

  const verification = getVerificationStatus(badges)

  const verificationItems = [
    { key: 'identity', label: 'ID', verified: verification.isIdentityVerified },
    { key: 'payment', label: 'Payment', verified: verification.isPaymentVerified },
    { key: 'email', label: 'Email', verified: verification.isEmailVerified },
    { key: 'phone', label: 'Phone', verified: verification.isPhoneVerified },
  ]

  return (
    <TooltipProvider>
      <div className="flex items-center gap-3">
        {verificationItems.map((item) => (
          <Tooltip key={item.key}>
            <TooltipTrigger>
              <div
                className={`flex items-center gap-1 text-xs ${
                  item.verified
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-slate-400 dark:text-slate-600'
                }`}
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {item.label}{' '}
                {item.verified ? 'verified' : 'not verified'}
              </p>
            </TooltipContent>
          </Tooltip>
        ))}
        <span className="text-xs text-slate-500">
          {verification.verificationPercent}% verified
        </span>
      </div>
    </TooltipProvider>
  )
}

/**
 * Top Performance Badge - Single prominent badge display
 */
export const TopBadge = ({ userId, size = 'md' }) => {
  const [badges, setBadges] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadBadges = async () => {
      if (!userId) return
      setIsLoading(true)
      try {
        const data = await getUserBadgesWithInfo(userId)
        setBadges(data)
      } catch (error) {
        console.error('Failed to load badges:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadBadges()
  }, [userId])

  if (isLoading) return null

  const topBadge = getHighestPerformanceBadge(badges)
  if (!topBadge) return null

  const info = BADGE_INFO[topBadge.badge_type]
  const IconComponent = BADGE_ICONS[info.icon] || Star

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Badge
            className={`${info.bgColor} ${info.color} border ${info.borderColor} ${sizeClasses[size]} font-medium`}
          >
            <IconComponent
              className={`${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} mr-1.5`}
            />
            {info.label}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-medium">{info.label}</p>
          <p className="text-xs text-slate-500 max-w-56">{info.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

/**
 * Full Badge Grid - All badges displayed
 */
export const BadgeGrid = ({ userId }) => {
  const [badges, setBadges] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadBadges = async () => {
      if (!userId) return
      setIsLoading(true)
      try {
        const data = await getUserBadgesWithInfo(userId)
        setBadges(data)
      } catch (error) {
        console.error('Failed to load badges:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadBadges()
  }, [userId])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    )
  }

  if (badges.length === 0) {
    return (
      <div className="text-center py-8">
        <ShieldCheck className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <p className="text-slate-600 dark:text-slate-400">No badges earned yet</p>
        <p className="text-sm text-slate-500 mt-1">
          Complete bookings and verify your account to earn badges
        </p>
      </div>
    )
  }

  // Group badges by category
  const categories = {
    verification: badges.filter((b) => b.info.category === 'verification'),
    performance: badges.filter((b) => b.info.category === 'performance'),
    behavior: badges.filter((b) => b.info.category === 'behavior'),
    special: badges.filter((b) => b.info.category === 'special'),
  }

  const categoryLabels = {
    verification: 'Verification',
    performance: 'Performance',
    behavior: 'Behavior',
    special: 'Special',
  }

  return (
    <div className="space-y-6">
      {Object.entries(categories).map(
        ([category, categoryBadges]) =>
          categoryBadges.length > 0 && (
            <div key={category}>
              <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">
                {categoryLabels[category]}
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {categoryBadges.map((badge) => {
                  const IconComponent = BADGE_ICONS[badge.info.icon] || Star
                  return (
                    <div
                      key={badge.id}
                      className={`p-3 rounded-lg border ${badge.info.bgColor} ${badge.info.borderColor}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <IconComponent className={`w-5 h-5 ${badge.info.color}`} />
                        <span className="font-medium text-slate-900 dark:text-white text-sm">
                          {badge.info.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                        {badge.info.description}
                      </p>
                      <p className="text-xs text-slate-500 mt-2">
                        Earned{' '}
                        {new Date(badge.awarded_at).toLocaleDateString('en-AU', {
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          )
      )}
    </div>
  )
}

/**
 * Badge Modal - Full badge information
 */
export const BadgeModal = ({ isOpen, onClose, userId }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Badges & Achievements
          </DialogTitle>
          <DialogDescription>
            Badges showcase your achievements and build trust with clients
          </DialogDescription>
        </DialogHeader>
        <BadgeGrid userId={userId} />
      </DialogContent>
    </Dialog>
  )
}

/**
 * All Possible Badges - For showing what badges are available
 */
export const AvailableBadges = () => {
  const allBadges = Object.entries(BADGE_INFO)

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600 dark:text-slate-400">
        Earn badges by completing bookings, maintaining high ratings, and
        verifying your account.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {allBadges.map(([type, info]) => {
          const IconComponent = BADGE_ICONS[info.icon] || Star
          return (
            <div
              key={type}
              className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg"
            >
              <div className={`p-2 rounded-lg ${info.bgColor}`}>
                <IconComponent className={`w-5 h-5 ${info.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-slate-900 dark:text-white">
                  {info.label}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  {info.description}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default BadgeRow
