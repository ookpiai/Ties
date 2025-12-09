/**
 * TIES Together - Subscription API
 *
 * Manages subscription tiers, trials, and feature limits.
 */

import { supabase } from '../lib/supabase'
import {
  SubscriptionTier,
  TierLimits,
  SUBSCRIPTION_TIERS,
  getTierConfig,
  getTierLimits,
  isInTrialPeriod,
  getEffectiveTier,
  getTrialDaysRemaining,
  getRoleBenefits,
  TRIAL_CONFIG
} from '../constants/subscriptionTiers'

// ============================================
// Types
// ============================================

export interface UserSubscription {
  tier: SubscriptionTier
  effectiveTier: SubscriptionTier
  isTrialActive: boolean
  trialDaysRemaining: number
  trialEndsAt: string | null
  subscriptionStartedAt: string | null
  subscriptionRenewsAt: string | null
  stripeSubscriptionId: string | null
  limits: TierLimits
  activeJobsCount: number
  activeStudioProjectsCount: number
}

export interface SubscriptionPlan {
  id: string
  tier: SubscriptionTier
  name: string
  description: string
  priceMonthly: number
  priceYearly: number
  features: string[]
  limits: {
    activeJobsLimit: number | null
    activeStudioProjectsLimit: number | null
    milestonesLimit: number | null
    payoutDays: number
    commissionPercent: number
  }
}

export interface TierCheckResult {
  allowed: boolean
  currentCount: number
  limit: number | 'unlimited'
  upgradeRequired: boolean
  message?: string
}

// ============================================
// Get Current User ID Helper
// ============================================

async function getCurrentUserId(): Promise<string> {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error('Not authenticated')
  return user.id
}

// ============================================
// Subscription Data Functions
// ============================================

/**
 * Get user's current subscription info
 */
export async function getUserSubscription(userId?: string): Promise<UserSubscription | null> {
  try {
    const targetUserId = userId || await getCurrentUserId()

    const { data, error } = await supabase
      .from('profiles')
      .select(`
        subscription_tier,
        subscription_started_at,
        subscription_renews_at,
        trial_started_at,
        trial_ends_at,
        trial_used,
        stripe_subscription_id,
        active_jobs_count,
        active_studio_projects_count
      `)
      .eq('id', targetUserId)
      .single()

    if (error) throw error
    if (!data) return null

    const tier = (data.subscription_tier || 'free') as SubscriptionTier
    const effectiveTier = getEffectiveTier(tier, data.trial_ends_at)
    const isTrialActive = isInTrialPeriod(data.trial_ends_at)
    const trialDaysRemaining = getTrialDaysRemaining(data.trial_ends_at)

    return {
      tier,
      effectiveTier,
      isTrialActive,
      trialDaysRemaining,
      trialEndsAt: data.trial_ends_at,
      subscriptionStartedAt: data.subscription_started_at,
      subscriptionRenewsAt: data.subscription_renews_at,
      stripeSubscriptionId: data.stripe_subscription_id,
      limits: getTierLimits(effectiveTier),
      activeJobsCount: data.active_jobs_count || 0,
      activeStudioProjectsCount: data.active_studio_projects_count || 0
    }
  } catch (error) {
    console.error('Error getting user subscription:', error)
    return null
  }
}

/**
 * Get all subscription plans
 */
export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  try {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('price_monthly', { ascending: true })

    if (error) throw error

    return (data || []).map(plan => ({
      id: plan.id,
      tier: plan.tier as SubscriptionTier,
      name: plan.name,
      description: plan.description,
      priceMonthly: parseFloat(plan.price_monthly),
      priceYearly: parseFloat(plan.price_yearly),
      features: plan.features || [],
      limits: {
        activeJobsLimit: plan.active_jobs_limit,
        activeStudioProjectsLimit: plan.active_studio_projects_limit,
        milestonesLimit: plan.milestones_limit,
        payoutDays: plan.payout_days,
        commissionPercent: parseFloat(plan.commission_percent)
      }
    }))
  } catch (error) {
    console.error('Error getting subscription plans:', error)
    // Return default plans from constants if DB fails
    return Object.values(SUBSCRIPTION_TIERS).map(tier => ({
      id: tier.id,
      tier: tier.id,
      name: tier.name,
      description: tier.description,
      priceMonthly: tier.priceMonthly,
      priceYearly: tier.priceYearly,
      features: tier.features,
      limits: {
        activeJobsLimit: tier.limits.activeJobs === 'unlimited' ? null : tier.limits.activeJobs as number,
        activeStudioProjectsLimit: tier.limits.activeStudioProjects === 'unlimited' ? null : tier.limits.activeStudioProjects as number,
        milestonesLimit: tier.limits.milestones === 'unlimited' ? null : tier.limits.milestones as number,
        payoutDays: tier.limits.payoutDays,
        commissionPercent: tier.limits.commissionPercent
      }
    }))
  }
}

// ============================================
// Limit Checking Functions
// ============================================

/**
 * Check if user can create a new active job
 */
export async function canCreateJob(userId?: string): Promise<TierCheckResult> {
  try {
    const subscription = await getUserSubscription(userId)
    if (!subscription) {
      return {
        allowed: false,
        currentCount: 0,
        limit: 1,
        upgradeRequired: true,
        message: 'Unable to verify subscription'
      }
    }

    const limit = subscription.limits.activeJobs
    const currentCount = subscription.activeJobsCount

    if (limit === 'unlimited') {
      return {
        allowed: true,
        currentCount,
        limit: 'unlimited',
        upgradeRequired: false
      }
    }

    const allowed = currentCount < limit
    return {
      allowed,
      currentCount,
      limit,
      upgradeRequired: !allowed,
      message: allowed ? undefined : `You've reached your limit of ${limit} active job${limit === 1 ? '' : 's'}. Upgrade to get more.`
    }
  } catch (error) {
    console.error('Error checking job limit:', error)
    return {
      allowed: false,
      currentCount: 0,
      limit: 1,
      upgradeRequired: true,
      message: 'Error checking limits'
    }
  }
}

/**
 * Check if user can create a new studio project
 */
export async function canCreateStudioProject(userId?: string): Promise<TierCheckResult> {
  try {
    const subscription = await getUserSubscription(userId)
    if (!subscription) {
      return {
        allowed: false,
        currentCount: 0,
        limit: 1,
        upgradeRequired: true,
        message: 'Unable to verify subscription'
      }
    }

    const limit = subscription.limits.activeStudioProjects
    const currentCount = subscription.activeStudioProjectsCount

    if (limit === 'unlimited') {
      return {
        allowed: true,
        currentCount,
        limit: 'unlimited',
        upgradeRequired: false
      }
    }

    const allowed = currentCount < limit
    return {
      allowed,
      currentCount,
      limit,
      upgradeRequired: !allowed,
      message: allowed ? undefined : `You've reached your limit of ${limit} active project${limit === 1 ? '' : 's'}. Upgrade to get more.`
    }
  } catch (error) {
    console.error('Error checking project limit:', error)
    return {
      allowed: false,
      currentCount: 0,
      limit: 1,
      upgradeRequired: true,
      message: 'Error checking limits'
    }
  }
}

/**
 * Check milestone limit for a job
 */
export async function canAddMilestone(
  userId: string | undefined,
  currentMilestoneCount: number
): Promise<TierCheckResult> {
  try {
    const subscription = await getUserSubscription(userId)
    if (!subscription) {
      return {
        allowed: false,
        currentCount: currentMilestoneCount,
        limit: 2,
        upgradeRequired: true,
        message: 'Unable to verify subscription'
      }
    }

    const limit = subscription.limits.milestones
    if (limit === 'unlimited') {
      return {
        allowed: true,
        currentCount: currentMilestoneCount,
        limit: 'unlimited',
        upgradeRequired: false
      }
    }

    const allowed = currentMilestoneCount < limit
    return {
      allowed,
      currentCount: currentMilestoneCount,
      limit,
      upgradeRequired: !allowed,
      message: allowed ? undefined : `You can only have ${limit} milestones per job on your plan. Upgrade for unlimited.`
    }
  } catch (error) {
    console.error('Error checking milestone limit:', error)
    return {
      allowed: false,
      currentCount: currentMilestoneCount,
      limit: 2,
      upgradeRequired: true,
      message: 'Error checking limits'
    }
  }
}

/**
 * Check if user has access to a specific feature
 */
export async function hasFeatureAccess(
  feature: keyof TierLimits,
  userId?: string
): Promise<boolean> {
  try {
    const subscription = await getUserSubscription(userId)
    if (!subscription) return false

    const value = subscription.limits[feature]

    // Boolean features
    if (typeof value === 'boolean') return value

    // Unlimited features
    if (value === 'unlimited') return true

    // String features (like analytics level)
    if (typeof value === 'string') return value !== 'none' && value !== 'basic'

    // Numeric features - having any limit means access
    if (typeof value === 'number') return true

    return false
  } catch (error) {
    console.error('Error checking feature access:', error)
    return false
  }
}

// ============================================
// Trial Management
// ============================================

/**
 * Start a trial for the current user
 */
export async function startTrial(): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = await getCurrentUserId()

    // Check if trial already used
    const { data: profile } = await supabase
      .from('profiles')
      .select('trial_used')
      .eq('id', userId)
      .single()

    if (profile?.trial_used) {
      return { success: false, error: 'You have already used your free trial' }
    }

    // Call database function to start trial
    const { error } = await supabase.rpc('start_user_trial', { p_user_id: userId })

    if (error) throw error

    return { success: true }
  } catch (error: any) {
    console.error('Error starting trial:', error)
    return { success: false, error: error.message || 'Failed to start trial' }
  }
}

/**
 * Check if user can start a trial
 */
export async function canStartTrial(userId?: string): Promise<boolean> {
  try {
    const targetUserId = userId || await getCurrentUserId()

    const { data } = await supabase
      .from('profiles')
      .select('trial_used')
      .eq('id', targetUserId)
      .single()

    return !data?.trial_used
  } catch (error) {
    console.error('Error checking trial eligibility:', error)
    return false
  }
}

// ============================================
// Subscription Management
// ============================================

/**
 * Upgrade subscription (to be called after Stripe payment)
 */
export async function upgradeSubscription(
  newTier: SubscriptionTier,
  stripeSubscriptionId?: string,
  billingPeriod: 'monthly' | 'yearly' = 'monthly'
): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = await getCurrentUserId()

    const { error } = await supabase.rpc('upgrade_subscription', {
      p_user_id: userId,
      p_new_tier: newTier,
      p_stripe_subscription_id: stripeSubscriptionId || null,
      p_billing_period: billingPeriod
    })

    if (error) throw error

    return { success: true }
  } catch (error: any) {
    console.error('Error upgrading subscription:', error)
    return { success: false, error: error.message || 'Failed to upgrade subscription' }
  }
}

/**
 * Downgrade subscription
 */
export async function downgradeSubscription(
  newTier: SubscriptionTier,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = await getCurrentUserId()

    const { error } = await supabase.rpc('downgrade_subscription', {
      p_user_id: userId,
      p_new_tier: newTier,
      p_reason: reason || null
    })

    if (error) throw error

    return { success: true }
  } catch (error: any) {
    console.error('Error downgrading subscription:', error)
    return { success: false, error: error.message || 'Failed to downgrade subscription' }
  }
}

/**
 * Get subscription history for current user
 */
export async function getSubscriptionHistory() {
  try {
    const userId = await getCurrentUserId()

    const { data, error } = await supabase
      .from('subscription_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) throw error

    return data || []
  } catch (error) {
    console.error('Error getting subscription history:', error)
    return []
  }
}

// ============================================
// Payout Speed Helper
// ============================================

/**
 * Get payout days for user's tier
 */
export async function getPayoutDays(userId?: string): Promise<number> {
  try {
    const subscription = await getUserSubscription(userId)
    return subscription?.limits.payoutDays || 5
  } catch (error) {
    console.error('Error getting payout days:', error)
    return 5 // Default to free tier
  }
}

/**
 * Get commission rate for user's tier
 */
export async function getCommissionRate(userId?: string): Promise<number> {
  try {
    const subscription = await getUserSubscription(userId)
    return subscription?.limits.commissionPercent || 10
  } catch (error) {
    console.error('Error getting commission rate:', error)
    return 10 // Default to free tier
  }
}

// ============================================
// Upgrade Prompt Helpers
// ============================================

/**
 * Get personalized upgrade benefits based on user role
 */
export async function getUpgradeBenefits(userId?: string): Promise<string[]> {
  try {
    const targetUserId = userId || await getCurrentUserId()

    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', targetUserId)
      .single()

    return getRoleBenefits(data?.role || 'Freelancer')
  } catch (error) {
    console.error('Error getting upgrade benefits:', error)
    return getRoleBenefits('Freelancer')
  }
}

/**
 * Get upgrade prompt data for current user
 */
export async function getUpgradePromptData(limitType: 'jobs' | 'projects' | 'milestones') {
  try {
    const subscription = await getUserSubscription()
    if (!subscription) return null

    const benefits = await getUpgradeBenefits()
    const currentTier = subscription.effectiveTier
    const nextTier = currentTier === 'free' ? 'lite' : 'pro'
    const nextTierConfig = getTierConfig(nextTier as SubscriptionTier)

    let currentLimit: number | string
    let nextLimit: number | string

    switch (limitType) {
      case 'jobs':
        currentLimit = subscription.limits.activeJobs
        nextLimit = nextTierConfig.limits.activeJobs
        break
      case 'projects':
        currentLimit = subscription.limits.activeStudioProjects
        nextLimit = nextTierConfig.limits.activeStudioProjects
        break
      case 'milestones':
        currentLimit = subscription.limits.milestones
        nextLimit = nextTierConfig.limits.milestones
        break
    }

    return {
      currentTier,
      nextTier,
      currentLimit,
      nextLimit,
      nextTierPrice: nextTierConfig.priceMonthly,
      benefits,
      isTrialAvailable: await canStartTrial()
    }
  } catch (error) {
    console.error('Error getting upgrade prompt data:', error)
    return null
  }
}

// ============================================
// Export default
// ============================================

export default {
  getUserSubscription,
  getSubscriptionPlans,
  canCreateJob,
  canCreateStudioProject,
  canAddMilestone,
  hasFeatureAccess,
  startTrial,
  canStartTrial,
  upgradeSubscription,
  downgradeSubscription,
  getSubscriptionHistory,
  getPayoutDays,
  getCommissionRate,
  getUpgradeBenefits,
  getUpgradePromptData
}
