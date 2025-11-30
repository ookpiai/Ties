/**
 * User Badges API
 *
 * Implements the TIES Together Badge System per badge.md spec:
 * 1. Verified Badge - ID + email + phone + profile complete
 * 2. Portfolio Badge - 5+ portfolio items
 * 3. Activity Badge - Job completed in last 30 days (can expire)
 * 4. Completion Badge - 5 jobs completed, no disputes
 * 5. Quality Badge - 4.5+ rating, 5+ reviews
 * 6. Earnings Badge - $1,000 earned
 * 7. TIES Pro Badge - Active subscription
 */

import { supabase } from '../lib/supabase'

// =============================================================================
// TYPES
// =============================================================================

// Spec badges (badge.md)
export type SpecBadgeType =
  | 'verified'     // 1. Verified Badge
  | 'portfolio'    // 2. Portfolio Badge
  | 'activity'     // 3. Activity Badge
  | 'completion'   // 4. Completion Badge
  | 'quality'      // 5. Quality Badge
  | 'earnings'     // 6. Earnings Badge
  | 'ties_pro'     // 7. TIES Pro Badge

// Legacy badges (kept for backwards compatibility)
export type LegacyBadgeType =
  | 'identity_verified'
  | 'payment_verified'
  | 'email_verified'
  | 'phone_verified'
  | 'rising_talent'
  | 'top_rated'
  | 'top_rated_plus'
  | 'pro_verified'
  | 'fast_responder'
  | 'on_time_delivery'
  | 'repeat_clients'
  | 'founding_member'
  | 'community_champion'
  | 'featured_talent'

export type BadgeType = SpecBadgeType | LegacyBadgeType

export interface UserBadge {
  id: string
  user_id: string
  badge_type: BadgeType
  awarded_at: string
  expires_at: string | null
  awarded_reason: string | null
  is_active: boolean
  display_order: number
}

export interface BadgeProgress {
  id: string
  user_id: string
  badge_type: SpecBadgeType
  current_value: number
  target_value: number
  progress_percent: number
  requirements_met: Record<string, any>
  last_updated: string
}

export interface BadgeNotification {
  id: string
  user_id: string
  notification_type: 'badge_unlocked' | 'badge_progress' | 'reward_activated' | 'badge_expiring' | 'badge_expired'
  badge_type: string
  title: string
  message: string
  is_read: boolean
  created_at: string
}

export interface BadgeReward {
  id: string
  user_id: string
  badge_type: string
  reward_type: 'search_boost' | 'commission_discount' | 'featured_listing' | 'visibility_boost'
  reward_value: Record<string, any>
  is_claimed: boolean
  claimed_at: string | null
  valid_from: string
  valid_until: string | null
  created_at: string
}

export interface BadgeSummary {
  badge_type: SpecBadgeType
  is_earned: boolean
  earned_at: string | null
  is_active: boolean
  display_order: number
  progress_percent: number
  current_value: number
  target_value: number
  requirements_met: Record<string, any>
}

export interface BadgeInfo {
  type: BadgeType
  label: string
  description: string
  icon: string
  color: string
  bgColor: string
  borderColor: string
  category: 'core' | 'subscription' | 'legacy'
  requirements: string[]
  rewards: string[]
}

// =============================================================================
// BADGE METADATA (per badge.md spec)
// =============================================================================

export const SPEC_BADGE_INFO: Record<SpecBadgeType, BadgeInfo> = {
  verified: {
    type: 'verified',
    label: 'Verified',
    description: 'Trust, safety, authenticity - verified ID, email, phone, and complete profile.',
    icon: 'ShieldCheck',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    borderColor: 'border-blue-200 dark:border-blue-800',
    category: 'core',
    requirements: [
      'Verified ID (driver\'s licence, passport, or government ID)',
      'Verified email address',
      'Verified phone number',
      'Fully completed profile (photo, bio 50+ characters)'
    ],
    rewards: [
      '30-day Search Boost on Discover',
      'Included in "Trusted Users" filter',
      'TIES Verified label on profile & bookings'
    ]
  },
  portfolio: {
    type: 'portfolio',
    label: 'Portfolio',
    description: 'Showcase professionalism & capability with a strong portfolio.',
    icon: 'Image',
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    borderColor: 'border-purple-200 dark:border-purple-800',
    category: 'core',
    requirements: [
      'Upload 5 or more portfolio items'
    ],
    rewards: [
      'Access to premium portfolio layouts',
      'Eligible for Featured User Highlight (glowing outline)',
      'Priority placement in Discover → Featured Work'
    ]
  },
  activity: {
    type: 'activity',
    label: 'Activity',
    description: 'Encourage platform engagement - shows you\'re actively working.',
    icon: 'Zap',
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    borderColor: 'border-orange-200 dark:border-orange-800',
    category: 'core',
    requirements: [
      'Complete at least 1 job in the last 30 days',
      'Badge resets if inactive for 30 days'
    ],
    rewards: [
      '48-hour visibility boost on Discover',
      'Access to limited-time engagement challenges',
      '"Active this month" tag on profile'
    ]
  },
  completion: {
    type: 'completion',
    label: 'Completion',
    description: 'Encourage reliable delivery & job momentum.',
    icon: 'CheckCircle',
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    borderColor: 'border-green-200 dark:border-green-800',
    category: 'core',
    requirements: [
      'Complete 5 jobs on the platform',
      'No disputes'
    ],
    rewards: [
      '0% commission on the next job after milestone',
      'Shown in "High Reliability" filter on Discover',
      'Special Completion badge animation'
    ]
  },
  quality: {
    type: 'quality',
    label: 'Quality',
    description: 'Reward great service & collaboration.',
    icon: 'Star',
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    category: 'core',
    requirements: [
      'Maintain a 4.5★ average rating',
      'Across 5+ reviews'
    ],
    rewards: [
      'Eligible for Featured User Glow Outline',
      '1 free Boosted Listing per month',
      'Quality highlight tag on profile'
    ]
  },
  earnings: {
    type: 'earnings',
    label: 'Earnings',
    description: 'Recognise meaningful platform success.',
    icon: 'DollarSign',
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    category: 'core',
    requirements: [
      'Earn $1,000 AUD on the platform'
    ],
    rewards: [
      '$20 off next transaction fee (one-time)',
      'Special milestone notification shared to followers',
      'Included in "Proven Earners" filter on Discover'
    ]
  },
  ties_pro: {
    type: 'ties_pro',
    label: 'TIES Pro',
    description: 'Premium benefits & elevated visibility.',
    icon: 'Crown',
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30',
    borderColor: 'border-amber-300 dark:border-amber-700',
    category: 'subscription',
    requirements: [
      'Active TIES Pro subscription'
    ],
    rewards: [
      'Gold glowing outline on Discover',
      'Priority placement in search',
      'Access to Pro-only filters',
      'Ability to pay for Featured status',
      'Extra portfolio layouts',
      'Lower commissions'
    ]
  }
}

// Legacy badge info (kept for backwards compatibility)
export const LEGACY_BADGE_INFO: Record<LegacyBadgeType, BadgeInfo> = {
  identity_verified: {
    type: 'identity_verified',
    label: 'Identity Verified',
    description: 'This user has verified their identity.',
    icon: 'ShieldCheck',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    borderColor: 'border-blue-200 dark:border-blue-800',
    category: 'legacy',
    requirements: ['Verified ID'],
    rewards: []
  },
  payment_verified: {
    type: 'payment_verified',
    label: 'Payment Verified',
    description: 'Payment account connected.',
    icon: 'CreditCard',
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    borderColor: 'border-green-200 dark:border-green-800',
    category: 'legacy',
    requirements: ['Connected payment'],
    rewards: []
  },
  email_verified: {
    type: 'email_verified',
    label: 'Email Verified',
    description: 'Email address confirmed.',
    icon: 'Mail',
    color: 'text-slate-600 dark:text-slate-400',
    bgColor: 'bg-slate-100 dark:bg-slate-800',
    borderColor: 'border-slate-200 dark:border-slate-700',
    category: 'legacy',
    requirements: ['Verified email'],
    rewards: []
  },
  phone_verified: {
    type: 'phone_verified',
    label: 'Phone Verified',
    description: 'Phone number confirmed.',
    icon: 'Phone',
    color: 'text-slate-600 dark:text-slate-400',
    bgColor: 'bg-slate-100 dark:bg-slate-800',
    borderColor: 'border-slate-200 dark:border-slate-700',
    category: 'legacy',
    requirements: ['Verified phone'],
    rewards: []
  },
  rising_talent: {
    type: 'rising_talent',
    label: 'Rising Talent',
    description: 'Promising newcomer.',
    icon: 'TrendingUp',
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    borderColor: 'border-orange-200 dark:border-orange-800',
    category: 'legacy',
    requirements: ['3+ bookings, 4.5+ rating'],
    rewards: []
  },
  top_rated: {
    type: 'top_rated',
    label: 'Top Rated',
    description: 'Exceptional results.',
    icon: 'Award',
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    borderColor: 'border-purple-200 dark:border-purple-800',
    category: 'legacy',
    requirements: ['10+ bookings, 4.8+ rating'],
    rewards: []
  },
  top_rated_plus: {
    type: 'top_rated_plus',
    label: 'Top Rated Plus',
    description: 'Elite performer.',
    icon: 'Crown',
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    category: 'legacy',
    requirements: ['25+ bookings, 4.9+ rating'],
    rewards: []
  },
  pro_verified: {
    type: 'pro_verified',
    label: 'Pro Verified',
    description: 'Manually vetted professional.',
    icon: 'BadgeCheck',
    color: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
    borderColor: 'border-indigo-200 dark:border-indigo-800',
    category: 'legacy',
    requirements: ['Manual vetting'],
    rewards: []
  },
  fast_responder: {
    type: 'fast_responder',
    label: 'Fast Responder',
    description: 'Responds within 2 hours.',
    icon: 'Zap',
    color: 'text-cyan-600 dark:text-cyan-400',
    bgColor: 'bg-cyan-100 dark:bg-cyan-900/30',
    borderColor: 'border-cyan-200 dark:border-cyan-800',
    category: 'legacy',
    requirements: ['<2hr response time'],
    rewards: []
  },
  on_time_delivery: {
    type: 'on_time_delivery',
    label: 'On-Time Delivery',
    description: '95%+ on-time completion.',
    icon: 'Clock',
    color: 'text-teal-600 dark:text-teal-400',
    bgColor: 'bg-teal-100 dark:bg-teal-900/30',
    borderColor: 'border-teal-200 dark:border-teal-800',
    category: 'legacy',
    requirements: ['95%+ on-time'],
    rewards: []
  },
  repeat_clients: {
    type: 'repeat_clients',
    label: 'Repeat Clients',
    description: '30%+ repeat bookings.',
    icon: 'Users',
    color: 'text-pink-600 dark:text-pink-400',
    bgColor: 'bg-pink-100 dark:bg-pink-900/30',
    borderColor: 'border-pink-200 dark:border-pink-800',
    category: 'legacy',
    requirements: ['30%+ repeat clients'],
    rewards: []
  },
  founding_member: {
    type: 'founding_member',
    label: 'Founding Member',
    description: 'Early platform adopter.',
    icon: 'Sparkles',
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    borderColor: 'border-amber-200 dark:border-amber-800',
    category: 'legacy',
    requirements: ['Early signup'],
    rewards: []
  },
  community_champion: {
    type: 'community_champion',
    label: 'Community Champion',
    description: 'Active community contributor.',
    icon: 'Heart',
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    borderColor: 'border-red-200 dark:border-red-800',
    category: 'legacy',
    requirements: ['Community contribution'],
    rewards: []
  },
  featured_talent: {
    type: 'featured_talent',
    label: 'Featured Talent',
    description: 'Hand-picked by our team.',
    icon: 'Star',
    color: 'text-violet-600 dark:text-violet-400',
    bgColor: 'bg-violet-100 dark:bg-violet-900/30',
    borderColor: 'border-violet-200 dark:border-violet-800',
    category: 'legacy',
    requirements: ['Staff pick'],
    rewards: []
  }
}

// Combined badge info
export const BADGE_INFO: Record<BadgeType, BadgeInfo> = {
  ...SPEC_BADGE_INFO,
  ...LEGACY_BADGE_INFO
}

// Ordered list of spec badges for display
export const SPEC_BADGES_ORDER: SpecBadgeType[] = [
  'verified',
  'portfolio',
  'activity',
  'completion',
  'quality',
  'earnings',
  'ties_pro'
]

// =============================================================================
// API FUNCTIONS
// =============================================================================

/**
 * Get all badges for a user
 */
export async function getUserBadges(userId: string): Promise<UserBadge[]> {
  const { data, error } = await supabase
    .from('user_badges')
    .select('*')
    .eq('user_id', userId)
    .order('display_order', { ascending: true })

  if (error) throw error
  return data as UserBadge[]
}

/**
 * Get badge progress for a user
 */
export async function getUserBadgeProgress(userId: string): Promise<BadgeProgress[]> {
  const { data, error } = await supabase
    .from('badge_progress')
    .select('*')
    .eq('user_id', userId)

  if (error) throw error
  return data as BadgeProgress[]
}

/**
 * Get complete badge summary using database function
 */
export async function getUserBadgeSummary(userId: string): Promise<BadgeSummary[]> {
  const { data, error } = await supabase
    .rpc('get_user_badge_summary', { p_user_id: userId })

  if (error) throw error
  return data as BadgeSummary[]
}

/**
 * Check and update all badges for a user
 */
export async function checkAllBadges(userId: string): Promise<{ badge_type: string; is_earned: boolean }[]> {
  const { data, error } = await supabase
    .rpc('check_all_badges', { p_user_id: userId })

  if (error) throw error
  return data
}

/**
 * Update which badges a user has selected to display (max 5)
 */
export async function updateBadgeSelection(userId: string, selectedBadges: string[]): Promise<boolean> {
  if (selectedBadges.length > 5) {
    throw new Error('Cannot select more than 5 badges to display')
  }

  const { error } = await supabase
    .rpc('update_badge_selection', {
      p_user_id: userId,
      p_selected_badges: selectedBadges
    })

  if (error) throw error
  return true
}

/**
 * Get badge notifications for a user
 */
export async function getBadgeNotifications(userId: string, unreadOnly = false): Promise<BadgeNotification[]> {
  let query = supabase
    .from('badge_notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (unreadOnly) {
    query = query.eq('is_read', false)
  }

  const { data, error } = await query

  if (error) throw error
  return data as BadgeNotification[]
}

/**
 * Mark badge notification as read
 */
export async function markBadgeNotificationRead(notificationId: string): Promise<void> {
  const { error } = await supabase
    .from('badge_notifications')
    .update({ is_read: true })
    .eq('id', notificationId)

  if (error) throw error
}

/**
 * Get unclaimed badge rewards for a user
 */
export async function getUnclaimedRewards(userId: string): Promise<BadgeReward[]> {
  const { data, error } = await supabase
    .from('badge_rewards')
    .select('*')
    .eq('user_id', userId)
    .eq('is_claimed', false)
    .or('valid_until.is.null,valid_until.gt.now()')

  if (error) throw error
  return data as BadgeReward[]
}

/**
 * Claim a badge reward
 */
export async function claimBadgeReward(rewardId: string): Promise<void> {
  const { error } = await supabase
    .from('badge_rewards')
    .update({
      is_claimed: true,
      claimed_at: new Date().toISOString()
    })
    .eq('id', rewardId)

  if (error) throw error
}

/**
 * Check if user has a specific badge
 */
export async function hasBadge(userId: string, badgeType: BadgeType): Promise<boolean> {
  const { data, error } = await supabase
    .from('user_badges')
    .select('id')
    .eq('user_id', userId)
    .eq('badge_type', badgeType)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return !!data
}

/**
 * Get badge with full info
 */
export function getBadgeWithInfo(badge: UserBadge): UserBadge & { info: BadgeInfo } {
  return {
    ...badge,
    info: BADGE_INFO[badge.badge_type]
  }
}

/**
 * Get all badges with info for a user
 */
export async function getUserBadgesWithInfo(userId: string): Promise<(UserBadge & { info: BadgeInfo })[]> {
  const badges = await getUserBadges(userId)
  return badges.map(getBadgeWithInfo).filter(b => b.info) // Filter out any without info
}

/**
 * Get badges grouped by category
 */
export function groupBadgesByCategory(
  badges: (UserBadge & { info: BadgeInfo })[]
): Record<string, (UserBadge & { info: BadgeInfo })[]> {
  return badges.reduce((acc, badge) => {
    const category = badge.info.category
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(badge)
    return acc
  }, {} as Record<string, (UserBadge & { info: BadgeInfo })[]>)
}

/**
 * Check if user should have featured glow (TIES Pro OR Portfolio+Quality badges)
 */
export function shouldHaveFeaturedGlow(badges: UserBadge[]): boolean {
  const badgeTypes = badges.map(b => b.badge_type)

  // TIES Pro always gets glow
  if (badgeTypes.includes('ties_pro')) return true

  // Portfolio + Quality badges together get glow
  if (badgeTypes.includes('portfolio') && badgeTypes.includes('quality')) return true

  return false
}

/**
 * Get the highest priority badges for compact display (max 3)
 */
export function getTopBadgesForDisplay(badges: UserBadge[], maxCount = 3): UserBadge[] {
  const priority: BadgeType[] = [
    'ties_pro',
    'verified',
    'quality',
    'completion',
    'portfolio',
    'activity',
    'earnings'
  ]

  const sorted = [...badges].sort((a, b) => {
    const aIndex = priority.indexOf(a.badge_type as SpecBadgeType)
    const bIndex = priority.indexOf(b.badge_type as SpecBadgeType)
    if (aIndex === -1) return 1
    if (bIndex === -1) return -1
    return aIndex - bIndex
  })

  return sorted.slice(0, maxCount)
}

/**
 * Badge display priority for compact views
 */
export function sortBadgesForDisplay(badges: UserBadge[]): UserBadge[] {
  const priority: BadgeType[] = [
    // Spec badges first
    'ties_pro',
    'verified',
    'quality',
    'completion',
    'portfolio',
    'activity',
    'earnings',
    // Legacy badges
    'pro_verified',
    'top_rated_plus',
    'top_rated',
    'rising_talent',
    'identity_verified',
    'payment_verified',
    'fast_responder',
    'on_time_delivery',
    'repeat_clients',
    'featured_talent',
    'founding_member',
    'community_champion',
    'email_verified',
    'phone_verified'
  ]

  return [...badges].sort((a, b) => {
    const aIndex = priority.indexOf(a.badge_type)
    const bIndex = priority.indexOf(b.badge_type)
    if (aIndex === -1) return 1
    if (bIndex === -1) return -1
    return aIndex - bIndex
  })
}

/**
 * Get verification status summary (legacy compatibility)
 */
export function getVerificationStatus(badges: UserBadge[]): {
  isIdentityVerified: boolean
  isPaymentVerified: boolean
  isEmailVerified: boolean
  isPhoneVerified: boolean
  isFullyVerified: boolean
  verificationCount: number
  verificationPercent: number
} {
  const badgeTypes = badges.map(b => b.badge_type)

  // Check for new verified badge (combines all)
  const isFullyVerified = badgeTypes.includes('verified')

  // Also check legacy badges
  const isIdentityVerified = isFullyVerified || badgeTypes.includes('identity_verified')
  const isPaymentVerified = badgeTypes.includes('payment_verified')
  const isEmailVerified = isFullyVerified || badgeTypes.includes('email_verified')
  const isPhoneVerified = isFullyVerified || badgeTypes.includes('phone_verified')

  const verificationCount = [isIdentityVerified, isPaymentVerified, isEmailVerified, isPhoneVerified]
    .filter(Boolean).length

  return {
    isIdentityVerified,
    isPaymentVerified,
    isEmailVerified,
    isPhoneVerified,
    isFullyVerified,
    verificationCount,
    verificationPercent: Math.round((verificationCount / 4) * 100)
  }
}

/**
 * Get the highest performance badge for display (legacy compatibility)
 */
export function getHighestPerformanceBadge(badges: UserBadge[]): UserBadge | null {
  const priority: BadgeType[] = ['ties_pro', 'top_rated_plus', 'top_rated', 'pro_verified', 'rising_talent']

  for (const badgeType of priority) {
    const badge = badges.find(b => b.badge_type === badgeType)
    if (badge) return badge
  }

  return null
}
