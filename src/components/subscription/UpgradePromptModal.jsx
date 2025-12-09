/**
 * UPGRADE PROMPT MODAL
 *
 * Shown when users hit their tier limits.
 * Provides personalized upgrade messaging and trial option.
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import {
  Crown,
  Zap,
  Check,
  ArrowRight,
  Sparkles,
  Clock,
  X
} from 'lucide-react'
import { startTrial } from '../../api/subscriptions'
import { SUBSCRIPTION_TIERS } from '../../constants/subscriptionTiers'

const UpgradePromptModal = ({
  isOpen,
  onClose,
  limitType = 'jobs', // 'jobs' | 'projects' | 'milestones'
  currentCount = 0,
  currentLimit = 1,
  currentTier = 'free',
  canStartTrial = false,
  onTrialStarted = () => {}
}) => {
  const navigate = useNavigate()
  const [isStartingTrial, setIsStartingTrial] = useState(false)
  const [trialError, setTrialError] = useState(null)

  const nextTier = currentTier === 'free' ? 'lite' : 'pro'
  const nextTierConfig = SUBSCRIPTION_TIERS[nextTier]

  // Get the limit for next tier
  const getNextLimit = () => {
    switch (limitType) {
      case 'jobs':
        return nextTierConfig.limits.activeJobs
      case 'projects':
        return nextTierConfig.limits.activeStudioProjects
      case 'milestones':
        return nextTierConfig.limits.milestones
      default:
        return 'unlimited'
    }
  }

  const nextLimit = getNextLimit()

  // Limit type labels
  const limitLabels = {
    jobs: { singular: 'active job', plural: 'active jobs' },
    projects: { singular: 'Studio project', plural: 'Studio projects' },
    milestones: { singular: 'milestone', plural: 'milestones' }
  }

  const label = limitLabels[limitType]

  // Benefits based on limit type
  const getBenefits = () => {
    const commonBenefits = [
      nextLimit === 'unlimited'
        ? `Unlimited ${label.plural}`
        : `${nextLimit} ${label.plural}`,
    ]

    if (nextTier === 'lite') {
      return [
        ...commonBenefits,
        '2-3 business day payouts',
        'Calendar sync',
        'Large file uploads',
        'Visibility boosts'
      ]
    } else {
      return [
        ...commonBenefits,
        'Same-day payouts',
        '8% commission (save 2%)',
        'Branded invoices',
        'TIES Pro badge',
        'Priority support'
      ]
    }
  }

  const handleStartTrial = async () => {
    setIsStartingTrial(true)
    setTrialError(null)

    try {
      const result = await startTrial()
      if (result.success) {
        onTrialStarted()
        onClose()
      } else {
        setTrialError(result.error || 'Failed to start trial')
      }
    } catch (err) {
      setTrialError('An error occurred. Please try again.')
    } finally {
      setIsStartingTrial(false)
    }
  }

  const handleViewPlans = () => {
    onClose()
    navigate('/settings?tab=subscription')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30">
            <Crown className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </div>
          <DialogTitle className="text-center text-xl">
            You've reached your limit
          </DialogTitle>
          <DialogDescription className="text-center">
            Your {currentTier === 'free' ? 'Free' : 'Lite'} plan allows{' '}
            <span className="font-semibold text-foreground">
              {currentLimit} {currentLimit === 1 ? label.singular : label.plural}
            </span>
            . Upgrade to unlock more.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current vs Next Tier Comparison */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div className="text-center flex-1">
              <p className="text-xs text-muted-foreground mb-1">Current</p>
              <p className="font-semibold capitalize">{currentTier}</p>
              <p className="text-2xl font-bold text-muted-foreground">
                {currentLimit}
              </p>
              <p className="text-xs text-muted-foreground">{label.plural}</p>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground mx-2" />
            <div className="text-center flex-1">
              <p className="text-xs text-muted-foreground mb-1">Upgrade to</p>
              <p className="font-semibold capitalize text-primary">{nextTier}</p>
              <p className="text-2xl font-bold text-primary">
                {nextLimit === 'unlimited' ? '∞' : nextLimit}
              </p>
              <p className="text-xs text-muted-foreground">{label.plural}</p>
            </div>
          </div>

          {/* Benefits List */}
          <div className="space-y-2">
            <p className="text-sm font-medium">What you'll get:</p>
            <ul className="space-y-2">
              {getBenefits().map((benefit, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Trial Option */}
          {canStartTrial && (
            <div className="p-4 rounded-lg border-2 border-dashed border-primary/30 bg-primary/5">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <p className="font-semibold text-sm">Try Pro free for 30 days</p>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Get unlimited everything with a free trial. No credit card required.
              </p>
              {trialError && (
                <p className="text-xs text-red-500 mb-2">{trialError}</p>
              )}
              <Button
                onClick={handleStartTrial}
                disabled={isStartingTrial}
                className="w-full"
                variant="default"
              >
                {isStartingTrial ? (
                  'Starting trial...'
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Start Free Trial
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Pricing */}
          <div className="text-center pt-2">
            <p className="text-sm text-muted-foreground mb-1">
              {nextTier.charAt(0).toUpperCase() + nextTier.slice(1)} starts at
            </p>
            <p className="text-2xl font-bold">
              ${nextTierConfig.priceMonthly}
              <span className="text-sm font-normal text-muted-foreground">/month</span>
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Maybe Later
          </Button>
          <Button onClick={handleViewPlans} className="flex-1">
            View Plans
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default UpgradePromptModal
