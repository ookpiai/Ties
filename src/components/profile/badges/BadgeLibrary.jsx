/**
 * Badge Library Component
 *
 * Shows all badges with progress bars per badge.md spec:
 * - Active badges (full colour)
 * - Locked badges (greyed out with "how to unlock" text)
 * - Real-time progress bars
 * - Select up to 5 badges to display
 */

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  ShieldCheck,
  Image,
  Zap,
  CheckCircle,
  Star,
  DollarSign,
  Crown,
  Lock,
  Loader2,
  Info,
  Award,
  Sparkles,
} from 'lucide-react'
import {
  getUserBadgeSummary,
  updateBadgeSelection,
  checkAllBadges,
  SPEC_BADGE_INFO,
  SPEC_BADGES_ORDER,
} from '../../../api/badges'

// Icon mapping for badges
const BADGE_ICONS = {
  ShieldCheck,
  Image,
  Zap,
  CheckCircle,
  Star,
  DollarSign,
  Crown,
}

/**
 * Badge Library - Shows all badges with progress
 */
export const BadgeLibrary = ({ userId, isOwnProfile = false, onBadgesUpdated }) => {
  const [badges, setBadges] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedBadges, setSelectedBadges] = useState([])
  const [isSaving, setIsSaving] = useState(false)
  const [showSelectionModal, setShowSelectionModal] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadBadges()
  }, [userId])

  const loadBadges = async () => {
    if (!userId) return
    setIsLoading(true)
    setError(null)

    try {
      // First check/update badges
      await checkAllBadges(userId)

      // Then get the summary
      const summary = await getUserBadgeSummary(userId)
      setBadges(summary)

      // Set currently selected badges
      const active = summary.filter(b => b.is_active && b.is_earned).map(b => b.badge_type)
      setSelectedBadges(active)
    } catch (err) {
      console.error('Failed to load badges:', err)
      setError('Failed to load badges')
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleBadge = (badgeType) => {
    setSelectedBadges(prev => {
      if (prev.includes(badgeType)) {
        return prev.filter(b => b !== badgeType)
      } else if (prev.length < 5) {
        return [...prev, badgeType]
      }
      return prev
    })
  }

  const handleSaveSelection = async () => {
    setIsSaving(true)
    try {
      await updateBadgeSelection(userId, selectedBadges)
      setShowSelectionModal(false)
      onBadgesUpdated?.()
      loadBadges()
    } catch (err) {
      console.error('Failed to save badge selection:', err)
      setError('Failed to save selection')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        <p>{error}</p>
        <Button variant="outline" onClick={loadBadges} className="mt-4">
          Try Again
        </Button>
      </div>
    )
  }

  const earnedBadges = badges.filter(b => b.is_earned)
  const lockedBadges = badges.filter(b => !b.is_earned)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Badge Library
          </h3>
          <p className="text-sm text-muted-foreground">
            {earnedBadges.length} of {badges.length} badges earned
          </p>
        </div>
        {isOwnProfile && earnedBadges.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSelectionModal(true)}
          >
            Choose Display Badges
          </Button>
        )}
      </div>

      {/* Earned Badges */}
      {earnedBadges.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3">
            Earned Badges
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {earnedBadges.map(badge => (
              <BadgeCard
                key={badge.badge_type}
                badge={badge}
                isEarned={true}
                isSelected={selectedBadges.includes(badge.badge_type)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Locked Badges */}
      {lockedBadges.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3">
            Badges to Unlock
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lockedBadges.map(badge => (
              <BadgeCard
                key={badge.badge_type}
                badge={badge}
                isEarned={false}
                showProgress={isOwnProfile}
              />
            ))}
          </div>
        </div>
      )}

      {/* Badge Selection Modal */}
      <Dialog open={showSelectionModal} onOpenChange={setShowSelectionModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Choose Display Badges</DialogTitle>
            <DialogDescription>
              Select up to 5 badges to display on your profile. These will be visible to others.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            {earnedBadges.map(badge => {
              const info = SPEC_BADGE_INFO[badge.badge_type]
              if (!info) return null

              const IconComponent = BADGE_ICONS[info.icon] || Star
              const isSelected = selectedBadges.includes(badge.badge_type)
              const canSelect = isSelected || selectedBadges.length < 5

              return (
                <div
                  key={badge.badge_type}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : canSelect
                        ? 'border-border hover:border-primary/50'
                        : 'border-border opacity-50 cursor-not-allowed'
                  }`}
                  onClick={() => canSelect && handleToggleBadge(badge.badge_type)}
                >
                  <Checkbox
                    checked={isSelected}
                    disabled={!canSelect}
                    className="pointer-events-none"
                  />
                  <div className={`p-2 rounded-lg ${info.bgColor}`}>
                    <IconComponent className={`w-4 h-4 ${info.color}`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{info.label}</p>
                    <p className="text-xs text-muted-foreground">{info.description}</p>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="text-sm text-muted-foreground text-center">
            {selectedBadges.length}/5 badges selected
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSelectionModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSelection} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Selection'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/**
 * Individual Badge Card with progress
 */
const BadgeCard = ({ badge, isEarned, isSelected, showProgress = true }) => {
  const info = SPEC_BADGE_INFO[badge.badge_type]
  if (!info) return null

  const IconComponent = BADGE_ICONS[info.icon] || Star

  return (
    <Card className={`relative overflow-hidden ${!isEarned ? 'opacity-60' : ''}`}>
      {/* Gold glow for TIES Pro */}
      {badge.badge_type === 'ties_pro' && isEarned && (
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 pointer-events-none" />
      )}

      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="text-xs">
            Displayed
          </Badge>
        </div>
      )}

      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={`p-3 rounded-xl ${isEarned ? info.bgColor : 'bg-gray-100 dark:bg-gray-800'} border ${isEarned ? info.borderColor : 'border-gray-200 dark:border-gray-700'}`}>
            {isEarned ? (
              <IconComponent className={`w-6 h-6 ${info.color}`} />
            ) : (
              <Lock className="w-6 h-6 text-gray-400" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className={`font-semibold ${isEarned ? '' : 'text-gray-500'}`}>
                {info.label}
              </h4>
              {isEarned && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Sparkles className="w-4 h-4 text-amber-500" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Earned {new Date(badge.earned_at).toLocaleDateString()}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {info.description}
            </p>

            {/* Progress Bar (for locked badges) */}
            {!isEarned && showProgress && badge.target_value > 0 && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">
                    {badge.current_value} / {badge.target_value}
                  </span>
                </div>
                <Progress value={badge.progress_percent} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {badge.progress_percent}% complete
                </p>
              </div>
            )}

            {/* Requirements (for locked badges) */}
            {!isEarned && (
              <div className="mt-3">
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  To unlock:
                </p>
                <ul className="text-xs text-muted-foreground space-y-0.5">
                  {info.requirements.map((req, i) => (
                    <li key={i} className="flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Rewards (for earned badges) */}
            {isEarned && info.rewards.length > 0 && (
              <div className="mt-3">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-primary">
                        <Info className="w-3 h-3 mr-1" />
                        View Rewards
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="font-medium mb-1">Rewards:</p>
                      <ul className="text-xs space-y-0.5">
                        {info.rewards.map((reward, i) => (
                          <li key={i}>• {reward}</li>
                        ))}
                      </ul>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Compact Badge Row for profile display
 */
export const BadgeRowCompact = ({ userId, maxDisplay = 5, onViewAll }) => {
  const [badges, setBadges] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadBadges = async () => {
      if (!userId) return
      setIsLoading(true)
      try {
        const summary = await getUserBadgeSummary(userId)
        const earned = summary.filter(b => b.is_earned && b.is_active)
        setBadges(earned)
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

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1.5 flex-wrap">
        {displayBadges.map(badge => {
          const info = SPEC_BADGE_INFO[badge.badge_type]
          if (!info) return null

          const IconComponent = BADGE_ICONS[info.icon] || Star

          return (
            <Tooltip key={badge.badge_type}>
              <TooltipTrigger>
                <div
                  className={`p-1.5 rounded-md ${info.bgColor} border ${info.borderColor} ${
                    badge.badge_type === 'ties_pro' ? 'ring-2 ring-amber-400/50' : ''
                  }`}
                >
                  <IconComponent className={`w-4 h-4 ${info.color}`} />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-medium">{info.label}</p>
                <p className="text-xs text-slate-500 max-w-48">
                  {info.description}
                </p>
              </TooltipContent>
            </Tooltip>
          )
        })}
        {badges.length > maxDisplay && onViewAll && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-slate-500"
            onClick={onViewAll}
          >
            +{badges.length - maxDisplay} more
          </Button>
        )}
      </div>
    </TooltipProvider>
  )
}

export default BadgeLibrary
