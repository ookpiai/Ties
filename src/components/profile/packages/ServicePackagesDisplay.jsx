/**
 * Service Packages Display Component - Premium SaaS Edition
 *
 * Modern tiered pricing with glassmorphism, gradients, and premium aesthetics
 * Inspired by Fiverr's gig packages and modern SaaS pricing pages
 */

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Check,
  X,
  Clock,
  RotateCcw,
  Star,
  Sparkles,
  Crown,
  Zap,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  ArrowRight,
} from 'lucide-react'
import {
  getServicePackages,
  formatPackagePrice,
  formatDeliveryTime,
  getTierInfo,
} from '../../../api/servicePackages'

// Tier configuration with gradients
const TIER_CONFIG = {
  basic: {
    icon: Zap,
    gradient: 'from-slate-500 to-slate-600',
    bgGradient: 'from-slate-500/5 to-slate-600/5',
    borderGradient: 'from-slate-500/30 to-slate-600/30',
    accentColor: 'text-slate-600 dark:text-slate-400',
    iconBg: 'bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700',
  },
  standard: {
    icon: Star,
    gradient: 'from-primary to-blue-600',
    bgGradient: 'from-primary/5 to-blue-600/5',
    borderGradient: 'from-primary/30 to-blue-600/30',
    accentColor: 'text-primary',
    iconBg: 'bg-gradient-to-br from-primary/10 to-blue-600/10',
  },
  premium: {
    icon: Crown,
    gradient: 'from-amber-500 to-orange-600',
    bgGradient: 'from-amber-500/5 to-orange-600/5',
    borderGradient: 'from-amber-500/30 to-orange-600/30',
    accentColor: 'text-amber-600 dark:text-amber-400',
    iconBg: 'bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30',
  },
}

const ServicePackagesDisplay = ({
  userId,
  packages: propPackages,
  isOwner = false,
  onSelectPackage,
  onEdit,
  onRefresh,
}) => {
  const [packages, setPackages] = useState(propPackages || [])
  const [isLoading, setIsLoading] = useState(!propPackages)
  const [selectedTier, setSelectedTier] = useState('standard')
  const [hoveredTier, setHoveredTier] = useState(null)

  // Load packages if not provided
  useEffect(() => {
    if (propPackages) {
      setPackages(propPackages)
      return
    }

    const loadPackages = async () => {
      if (!userId) return
      setIsLoading(true)
      try {
        const data = await getServicePackages(userId)
        setPackages(data)
        if (data.find((p) => p.tier === 'standard')) {
          setSelectedTier('standard')
        } else if (data.length > 0) {
          setSelectedTier(data[0].tier)
        }
      } catch (error) {
        console.error('Failed to load packages:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadPackages()
  }, [userId, propPackages])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
          <Sparkles className="w-5 h-5 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
      </div>
    )
  }

  if (packages.length === 0) {
    if (isOwner) {
      return (
        <div className="relative overflow-hidden rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-900/50">
          <div className="py-16 px-8 text-center relative z-10">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/10 to-blue-600/10 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
              Create Your Service Packages
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto leading-relaxed">
              Offer tiered pricing like the pros. Create Basic, Standard, and Premium packages to give clients clear options and increase your bookings.
            </p>
            <Button
              className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white shadow-lg shadow-primary/25"
              onClick={onEdit}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Packages
            </Button>
          </div>
          {/* Decorative gradient orbs */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl" />
        </div>
      )
    }
    return null
  }

  // Sort packages by tier order
  const sortedPackages = [...packages].sort((a, b) => {
    const order = { basic: 0, standard: 1, premium: 2 }
    return (order[a.tier] || 0) - (order[b.tier] || 0)
  })

  return (
    <div className="space-y-6">
      {/* Mobile: Tab Selector */}
      <div className="lg:hidden">
        <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-800/50 p-1.5 backdrop-blur-sm">
          {sortedPackages.map((pkg) => {
            const config = TIER_CONFIG[pkg.tier] || TIER_CONFIG.standard
            const TierIcon = config.icon
            const tierInfo = getTierInfo(pkg.tier)
            return (
              <button
                key={pkg.tier}
                onClick={() => setSelectedTier(pkg.tier)}
                className={`
                  flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-medium
                  transition-all duration-300
                  ${selectedTier === pkg.tier
                    ? 'bg-white dark:bg-slate-900 shadow-lg text-slate-900 dark:text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }
                `}
              >
                <TierIcon className={`w-4 h-4 ${selectedTier === pkg.tier ? config.accentColor : ''}`} />
                {tierInfo.label}
              </button>
            )
          })}
        </div>

        {/* Mobile: Selected Package Card */}
        {sortedPackages
          .filter((pkg) => pkg.tier === selectedTier)
          .map((pkg) => (
            <div key={pkg.id} className="mt-4">
              <PackageCard
                pkg={pkg}
                isOwner={isOwner}
                onSelect={() => onSelectPackage?.(pkg)}
                onEdit={() => onEdit?.(pkg)}
                isHighlighted={true}
              />
            </div>
          ))}
      </div>

      {/* Desktop: Side-by-Side Premium Comparison */}
      <div className="hidden lg:grid lg:grid-cols-3 gap-6">
        {sortedPackages.map((pkg, index) => (
          <PackageCard
            key={pkg.id}
            pkg={pkg}
            isOwner={isOwner}
            onSelect={() => onSelectPackage?.(pkg)}
            onEdit={() => onEdit?.(pkg)}
            isHighlighted={pkg.tier === 'standard' || pkg.is_popular}
            isHovered={hoveredTier === pkg.tier}
            onHover={(hovering) => setHoveredTier(hovering ? pkg.tier : null)}
            index={index}
          />
        ))}
      </div>

      {/* Comparison note */}
      <p className="text-center text-sm text-slate-500 dark:text-slate-400">
        All packages include direct communication and satisfaction guarantee
      </p>
    </div>
  )
}

/**
 * Premium Package Card with glassmorphism
 */
const PackageCard = ({
  pkg,
  isOwner,
  onSelect,
  onEdit,
  isHighlighted = false,
  isHovered = false,
  onHover,
  index = 0,
}) => {
  const config = TIER_CONFIG[pkg.tier] || TIER_CONFIG.standard
  const TierIcon = config.icon
  const tierInfo = getTierInfo(pkg.tier)

  const isPopular = pkg.is_popular || pkg.tier === 'standard'

  return (
    <div
      className={`
        relative group
        transition-all duration-500 ease-out
        ${isHovered || isHighlighted ? 'lg:-translate-y-2' : ''}
      `}
      onMouseEnter={() => onHover?.(true)}
      onMouseLeave={() => onHover?.(false)}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Glow effect for highlighted cards */}
      {isPopular && (
        <div className={`
          absolute -inset-0.5 rounded-[28px]
          bg-gradient-to-r ${config.gradient}
          opacity-20 group-hover:opacity-30
          blur-xl transition-opacity duration-500
        `} />
      )}

      <Card
        className={`
          relative overflow-hidden
          bg-white/80 dark:bg-slate-900/80
          backdrop-blur-xl
          border-2 transition-all duration-500
          rounded-3xl
          ${isPopular
            ? `border-transparent bg-gradient-to-b ${config.bgGradient}`
            : 'border-slate-200/80 dark:border-slate-700/50'
          }
          ${isHovered || isHighlighted
            ? 'shadow-2xl shadow-slate-200/50 dark:shadow-black/20'
            : 'shadow-sm'
          }
        `}
      >
        {/* Popular/Recommended Ribbon */}
        {isPopular && (
          <div className={`
            absolute top-0 left-0 right-0
            bg-gradient-to-r ${config.gradient}
            text-white text-xs font-semibold py-2 text-center
            tracking-wide uppercase
          `}>
            {pkg.is_popular ? 'Most Popular' : 'Recommended'}
          </div>
        )}

        <CardHeader className={`pb-4 ${isPopular ? 'pt-12' : 'pt-6'}`}>
          {/* Tier Icon & Name */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`
                p-3 rounded-2xl
                ${config.iconBg}
                shadow-sm
              `}>
                <TierIcon className={`w-6 h-6 ${config.accentColor}`} />
              </div>
              <div>
                <CardTitle className="text-lg font-bold">{pkg.name || tierInfo.label}</CardTitle>
                <p className={`text-sm ${config.accentColor} font-medium`}>
                  {tierInfo.label} Package
                </p>
              </div>
            </div>
            {isOwner && (
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit?.()
                }}
              >
                <Edit2 className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Price with gradient accent */}
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className={`
                text-4xl font-bold
                bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent
              `}>
                {formatPackagePrice(pkg.price)}
              </span>
              {pkg.original_price && pkg.original_price > pkg.price && (
                <span className="text-lg text-slate-400 line-through">
                  {formatPackagePrice(pkg.original_price)}
                </span>
              )}
            </div>
            {pkg.original_price && pkg.original_price > pkg.price && (
              <Badge className="mt-2 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0">
                Save {Math.round((1 - pkg.price / pkg.original_price) * 100)}%
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Description */}
          {pkg.description && (
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {pkg.description}
            </p>
          )}

          {/* Key Info Pills */}
          <div className="flex flex-wrap gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-300">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatDeliveryTime(pkg.delivery_time_days, pkg.delivery_time_unit)}</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-300">
              <RotateCcw className="w-3.5 h-3.5" />
              <span>
                {pkg.unlimited_revisions
                  ? 'Unlimited'
                  : `${pkg.revisions_included || 0} revision${pkg.revisions_included !== 1 ? 's' : ''}`}
              </span>
            </div>
          </div>

          {/* Features List */}
          {pkg.features && pkg.features.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              {pkg.features.map((feature, idx) => (
                <div
                  key={idx}
                  className={`
                    flex items-start gap-3 text-sm
                    ${feature.included
                      ? 'text-slate-700 dark:text-slate-300'
                      : 'text-slate-400 dark:text-slate-600'
                    }
                  `}
                >
                  {feature.included ? (
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mt-0.5">
                      <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                    </div>
                  ) : (
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mt-0.5">
                      <X className="w-3 h-3 text-slate-400" />
                    </div>
                  )}
                  <span className="leading-tight">
                    {feature.feature}
                    {feature.value && (
                      <span className="text-slate-500 ml-1">({feature.value})</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* CTA Button */}
          <Button
            className={`
              w-full mt-4 py-6 rounded-xl font-semibold
              transition-all duration-300
              ${isPopular
                ? `bg-gradient-to-r ${config.gradient} hover:opacity-90 text-white shadow-lg shadow-primary/25`
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white'
              }
            `}
            onClick={onSelect}
          >
            {isOwner ? 'Preview' : 'Select Package'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>

          {/* Extras Teaser */}
          {pkg.available_extras && pkg.available_extras.length > 0 && (
            <p className="text-xs text-center text-slate-500 pt-2">
              + {pkg.available_extras.length} optional add-ons available
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Compact Package Preview (for service cards)
 */
export const PackagePreviewCompact = ({ packages, onViewAll }) => {
  if (!packages || packages.length === 0) return null

  const lowestPrice = Math.min(...packages.map((p) => p.price))
  const highestPrice = Math.max(...packages.map((p) => p.price))

  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-900/50 border border-slate-200/50 dark:border-slate-700/50">
      <div>
        <span className="text-sm text-slate-600 dark:text-slate-400">Starting at </span>
        <span className="text-lg font-bold text-slate-900 dark:text-white">
          {formatPackagePrice(lowestPrice)}
        </span>
        {lowestPrice !== highestPrice && (
          <span className="text-slate-500 ml-1">- {formatPackagePrice(highestPrice)}</span>
        )}
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="text-primary hover:text-primary/80"
        onClick={onViewAll}
      >
        View packages
        <ArrowRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  )
}

export default ServicePackagesDisplay
