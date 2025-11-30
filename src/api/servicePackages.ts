/**
 * Service Packages API
 *
 * Handles tiered service packages (Basic/Standard/Premium)
 * Based on Fiverr's standardized gig packages
 *
 * Sources:
 * - https://help.fiverr.com/hc/en-us/articles/4410009235601-Standardized-Gig-packages
 * - https://www.freshbooks.com/blog/value-based-tiered-pricing
 */

import { supabase } from '../lib/supabase'

// Types
export type PackageTier = 'basic' | 'standard' | 'premium'
export type DeliveryTimeUnit = 'hours' | 'days' | 'weeks'

export interface PackageFeature {
  feature: string
  included: boolean
  value?: string // e.g., "3 revisions", "Up to 5 photos"
}

export interface PackageExtra {
  name: string
  price: number
  description: string
}

export interface ServicePackage {
  id: string
  service_id: string
  tier: PackageTier
  name: string
  description: string | null
  price: number
  original_price: number | null
  delivery_time_days: number
  delivery_time_unit: DeliveryTimeUnit
  revisions_included: number
  unlimited_revisions: boolean
  features: PackageFeature[]
  available_extras: PackageExtra[]
  is_popular: boolean
  is_recommended: boolean
  created_at: string
  updated_at: string
}

export interface CreatePackageInput {
  service_id: string
  tier: PackageTier
  name: string
  description?: string
  price: number
  original_price?: number
  delivery_time_days: number
  delivery_time_unit?: DeliveryTimeUnit
  revisions_included?: number
  unlimited_revisions?: boolean
  features?: PackageFeature[]
  available_extras?: PackageExtra[]
  is_popular?: boolean
  is_recommended?: boolean
}

export interface UpdatePackageInput extends Partial<Omit<CreatePackageInput, 'service_id' | 'tier'>> {}

/**
 * Get all packages for a service
 */
export async function getServicePackages(serviceId: string): Promise<ServicePackage[]> {
  const { data, error } = await supabase
    .from('service_packages')
    .select('*')
    .eq('service_id', serviceId)
    .order('tier', { ascending: true }) // basic, standard, premium

  if (error) throw error

  // Sort by tier properly
  const tierOrder: Record<PackageTier, number> = { basic: 0, standard: 1, premium: 2 }
  return (data as ServicePackage[]).sort((a, b) => tierOrder[a.tier] - tierOrder[b.tier])
}

/**
 * Get a single package
 */
export async function getServicePackage(packageId: string): Promise<ServicePackage> {
  const { data, error } = await supabase
    .from('service_packages')
    .select('*')
    .eq('id', packageId)
    .single()

  if (error) throw error
  return data as ServicePackage
}

/**
 * Get package by service and tier
 */
export async function getPackageByTier(
  serviceId: string,
  tier: PackageTier
): Promise<ServicePackage | null> {
  const { data, error } = await supabase
    .from('service_packages')
    .select('*')
    .eq('service_id', serviceId)
    .eq('tier', tier)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    throw error
  }
  return data as ServicePackage
}

/**
 * Create a new package
 */
export async function createServicePackage(input: CreatePackageInput): Promise<ServicePackage> {
  const { data, error } = await supabase
    .from('service_packages')
    .insert({
      ...input,
      features: input.features || [],
      available_extras: input.available_extras || [],
      delivery_time_unit: input.delivery_time_unit || 'days',
      revisions_included: input.revisions_included || 1,
      unlimited_revisions: input.unlimited_revisions || false,
      is_popular: input.is_popular || false,
      is_recommended: input.is_recommended || false,
    })
    .select()
    .single()

  if (error) throw error
  return data as ServicePackage
}

/**
 * Update a package
 */
export async function updateServicePackage(
  packageId: string,
  input: UpdatePackageInput
): Promise<ServicePackage> {
  const { data, error } = await supabase
    .from('service_packages')
    .update(input)
    .eq('id', packageId)
    .select()
    .single()

  if (error) throw error
  return data as ServicePackage
}

/**
 * Delete a package
 */
export async function deleteServicePackage(packageId: string): Promise<void> {
  const { error } = await supabase
    .from('service_packages')
    .delete()
    .eq('id', packageId)

  if (error) throw error
}

/**
 * Create all three tiers at once with default structure
 * Useful for quick package setup
 */
export async function createDefaultPackages(
  serviceId: string,
  serviceName: string,
  basePrice: number
): Promise<ServicePackage[]> {
  const packages: CreatePackageInput[] = [
    {
      service_id: serviceId,
      tier: 'basic',
      name: 'Starter',
      description: `Basic ${serviceName} package for smaller events`,
      price: basePrice,
      delivery_time_days: 7,
      revisions_included: 1,
      features: [
        { feature: 'Basic service included', included: true },
        { feature: 'Email support', included: true },
        { feature: 'Priority booking', included: false },
        { feature: 'Extended hours', included: false },
      ],
    },
    {
      service_id: serviceId,
      tier: 'standard',
      name: 'Professional',
      description: `Our most popular ${serviceName} package`,
      price: Math.round(basePrice * 1.5),
      delivery_time_days: 5,
      revisions_included: 2,
      is_popular: true,
      features: [
        { feature: 'Full service included', included: true },
        { feature: 'Email & phone support', included: true },
        { feature: 'Priority booking', included: true },
        { feature: 'Extended hours', included: false },
      ],
    },
    {
      service_id: serviceId,
      tier: 'premium',
      name: 'Enterprise',
      description: `Premium ${serviceName} with all features`,
      price: Math.round(basePrice * 2.5),
      delivery_time_days: 3,
      revisions_included: 5,
      unlimited_revisions: false,
      is_recommended: true,
      features: [
        { feature: 'Full service included', included: true },
        { feature: '24/7 support', included: true },
        { feature: 'Priority booking', included: true },
        { feature: 'Extended hours', included: true },
      ],
    },
  ]

  const results: ServicePackage[] = []
  for (const pkg of packages) {
    const created = await createServicePackage(pkg)
    results.push(created)
  }

  return results
}

/**
 * Get all packages for a user's services
 */
export async function getUserServicePackages(userId: string): Promise<ServicePackage[]> {
  const { data, error } = await supabase
    .from('service_packages')
    .select(`
      *,
      services!inner(owner_id)
    `)
    .eq('services.owner_id', userId)

  if (error) throw error
  return data as ServicePackage[]
}

/**
 * Format price for display
 */
export function formatPackagePrice(price: number, currency = 'AUD'): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

/**
 * Format delivery time for display
 */
export function formatDeliveryTime(days: number, unit: DeliveryTimeUnit = 'days'): string {
  if (unit === 'hours') {
    return days === 1 ? '1 hour' : `${days} hours`
  }
  if (unit === 'weeks') {
    return days === 1 ? '1 week' : `${days} weeks`
  }
  return days === 1 ? '1 day' : `${days} days`
}

/**
 * Get tier display info
 */
export function getTierInfo(tier: PackageTier): {
  label: string
  color: string
  bgColor: string
  borderColor: string
} {
  const tiers = {
    basic: {
      label: 'Basic',
      color: 'text-slate-700 dark:text-slate-300',
      bgColor: 'bg-slate-100 dark:bg-slate-800',
      borderColor: 'border-slate-200 dark:border-slate-700',
    },
    standard: {
      label: 'Standard',
      color: 'text-blue-700 dark:text-blue-300',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      borderColor: 'border-blue-200 dark:border-blue-800',
    },
    premium: {
      label: 'Premium',
      color: 'text-purple-700 dark:text-purple-300',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
      borderColor: 'border-purple-200 dark:border-purple-800',
    },
  }
  return tiers[tier]
}
