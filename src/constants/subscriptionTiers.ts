/**
 * TIES Together - Subscription Tier System
 *
 * Defines the three subscription tiers and their feature limits.
 * Used throughout the app to enforce limits and display upgrade prompts.
 */

export type SubscriptionTier = 'free' | 'lite' | 'pro'

export interface TierLimits {
  // Job limits
  activeJobs: number | 'unlimited'
  jobApplications: 'unlimited'

  // Studio/Project limits
  activeStudioProjects: number | 'unlimited'

  // Financial features
  milestones: number | 'unlimited'
  payoutDays: number // Business days
  invoiceBranding: boolean
  commissionPercent: number

  // Visibility & Discovery
  visibilityBoost: boolean
  boostPriority: 'none' | 'limited' | 'priority'
  searchRanking: 'standard' | 'boosted' | 'priority'

  // Features
  analytics: 'basic' | 'standard' | 'full'
  calendarSync: boolean
  largeUploads: boolean // Files > 50MB
  templates: boolean
  folders: boolean

  // Badges & Verification
  proGlowBadge: boolean
}

export interface TierConfig {
  id: SubscriptionTier
  name: string
  description: string
  priceMonthly: number // AUD
  priceYearly: number // AUD (annual discount)
  limits: TierLimits
  features: string[]
  highlighted?: boolean // For UI - "Most Popular"
}

/**
 * Trial Period Configuration
 */
export const TRIAL_CONFIG = {
  durationDays: 30,
  tier: 'pro' as SubscriptionTier, // Trial gives Pro access
  features: [
    'Full Studio access',
    'Unlimited projects',
    'Visibility boosts',
    'Advanced filters',
    '8% commission',
    'Full analytics',
    'Calendar sync',
    'Priority payouts'
  ]
}

/**
 * Subscription Tier Definitions
 */
export const SUBSCRIPTION_TIERS: Record<SubscriptionTier, TierConfig> = {
  free: {
    id: 'free',
    name: 'Free',
    description: 'Get started with essential features',
    priceMonthly: 0,
    priceYearly: 0,
    limits: {
      activeJobs: 1,
      jobApplications: 'unlimited',
      activeStudioProjects: 1,
      milestones: 2,
      payoutDays: 5,
      invoiceBranding: false,
      commissionPercent: 10,
      visibilityBoost: false,
      boostPriority: 'none',
      searchRanking: 'standard',
      analytics: 'basic',
      calendarSync: false,
      largeUploads: false,
      templates: false,
      folders: false,
      proGlowBadge: false
    },
    features: [
      'Unlimited job applications',
      '1 active job at a time',
      '1 Studio project (full power)',
      '2 milestones per job',
      'Basic invoicing',
      '10% platform commission',
      '5 business day payouts',
      'Basic profile analytics'
    ]
  },

  lite: {
    id: 'lite',
    name: 'Lite',
    description: 'More flexibility for growing professionals',
    priceMonthly: 19,
    priceYearly: 190, // ~17% discount
    limits: {
      activeJobs: 3,
      jobApplications: 'unlimited',
      activeStudioProjects: 3,
      milestones: 3,
      payoutDays: 3,
      invoiceBranding: false,
      commissionPercent: 10,
      visibilityBoost: true,
      boostPriority: 'limited',
      searchRanking: 'boosted',
      analytics: 'standard',
      calendarSync: true,
      largeUploads: true,
      templates: false,
      folders: false,
      proGlowBadge: false
    },
    features: [
      'Unlimited job applications',
      '3 active jobs at a time',
      '3 Studio projects (full power)',
      '3 milestones per job',
      'Basic invoicing',
      '10% platform commission',
      '2-3 business day payouts',
      'Standard analytics',
      'Calendar sync (Google/Apple)',
      'Large file uploads',
      'Limited visibility boosts'
    ]
  },

  pro: {
    id: 'pro',
    name: 'Pro',
    description: 'Full power for serious professionals',
    priceMonthly: 49,
    priceYearly: 490, // ~17% discount
    highlighted: true,
    limits: {
      activeJobs: 'unlimited',
      jobApplications: 'unlimited',
      activeStudioProjects: 'unlimited',
      milestones: 'unlimited',
      payoutDays: 1,
      invoiceBranding: true,
      commissionPercent: 8,
      visibilityBoost: true,
      boostPriority: 'priority',
      searchRanking: 'priority',
      analytics: 'full',
      calendarSync: true,
      largeUploads: true,
      templates: true,
      folders: true,
      proGlowBadge: true
    },
    features: [
      'Unlimited job applications',
      'Unlimited active jobs',
      'Unlimited Studio projects',
      'Unlimited milestones + templates',
      'Branded invoices (logo, colours)',
      '8% platform commission',
      'Same-day / next-day payouts',
      'Full analytics dashboard',
      'Calendar sync (Google/Apple)',
      'Large file uploads',
      'Priority visibility boosts',
      'Priority search ranking',
      'Project folders & archive',
      'TIES Pro badge (gold glow)',
      'Priority support'
    ]
  }
}

/**
 * Venue-specific Pro benefits
 */
export const VENUE_PRO_BENEFITS = [
  'Preferred Venue badge',
  'Priority placement on map',
  'Calendar sync (Google/Apple)',
  'Instant quote templates',
  'Priority search ranking'
]

/**
 * Vendor-specific Pro benefits
 */
export const VENDOR_PRO_BENEFITS = [
  'Trusted Supplier badge',
  'Bulk product upload',
  'Priority ranking in vendor search',
  'Instant quote templates'
]

/**
 * Freelancer-specific Pro benefits
 */
export const FREELANCER_PRO_BENEFITS = [
  'Priority visibility in search',
  'Same-day payouts',
  'Branded invoices',
  'Unlimited active jobs',
  'Full analytics dashboard',
  'TIES Pro badge'
]

/**
 * Organiser-specific Pro benefits
 */
export const ORGANISER_PRO_BENEFITS = [
  'Unlimited job postings',
  'Priority applicant matching',
  'Advanced team management',
  'Bulk messaging',
  'Full analytics dashboard'
]

/**
 * Helper Functions
 */

export function getTierConfig(tier: SubscriptionTier): TierConfig {
  return SUBSCRIPTION_TIERS[tier]
}

export function getTierLimits(tier: SubscriptionTier): TierLimits {
  return SUBSCRIPTION_TIERS[tier].limits
}

export function canPerformAction(
  tier: SubscriptionTier,
  action: keyof TierLimits,
  currentCount?: number
): boolean {
  const limits = getTierLimits(tier)
  const limit = limits[action]

  if (limit === 'unlimited' || limit === true) return true
  if (limit === false || limit === 'none') return false

  if (typeof limit === 'number' && typeof currentCount === 'number') {
    return currentCount < limit
  }

  return true
}

export function getUpgradeMessage(
  currentTier: SubscriptionTier,
  feature: string
): string | null {
  if (currentTier === 'pro') return null

  const nextTier = currentTier === 'free' ? 'Lite' : 'Pro'
  return `Upgrade to ${nextTier} to unlock ${feature}`
}

export function getRoleBenefits(role: string): string[] {
  switch (role) {
    case 'Venue':
      return VENUE_PRO_BENEFITS
    case 'Vendor':
      return VENDOR_PRO_BENEFITS
    case 'Organiser':
      return ORGANISER_PRO_BENEFITS
    default:
      return FREELANCER_PRO_BENEFITS
  }
}

/**
 * Check if user is in trial period
 */
export function isInTrialPeriod(trialEndsAt: string | null): boolean {
  if (!trialEndsAt) return false
  return new Date(trialEndsAt) > new Date()
}

/**
 * Get effective tier (accounts for trial)
 */
export function getEffectiveTier(
  subscriptionTier: SubscriptionTier,
  trialEndsAt: string | null
): SubscriptionTier {
  if (isInTrialPeriod(trialEndsAt)) {
    return TRIAL_CONFIG.tier
  }
  return subscriptionTier
}

/**
 * Calculate days remaining in trial
 */
export function getTrialDaysRemaining(trialEndsAt: string | null): number {
  if (!trialEndsAt) return 0
  const now = new Date()
  const endDate = new Date(trialEndsAt)
  const diffTime = endDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(0, diffDays)
}

export default SUBSCRIPTION_TIERS
