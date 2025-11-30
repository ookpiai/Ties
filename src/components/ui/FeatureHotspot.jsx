/**
 * FeatureHotspot Component
 *
 * Pulsing hotspot for feature discovery inspired by:
 * - Slack's pulsing hotspots (2016 era)
 * - Grammarly's interactive discovery dots
 * - Intercom's contextual hotspots
 *
 * Features:
 * - Subtle pulsing animation to draw attention
 * - Click to reveal tooltip with feature explanation
 * - Can be dismissed (remembers state)
 * - Non-invasive - user can ignore
 */

import * as React from 'react'
import { useState, useEffect } from 'react'
import { X, Sparkles, ArrowRight } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from './tooltip'
import { cn } from '@/lib/utils'

// Local storage key prefix for dismissed hotspots
const DISMISSED_PREFIX = 'ties_hotspot_dismissed_'

/**
 * FeatureHotspot - Pulsing dot that reveals feature info on click
 *
 * @param {string} id - Unique ID for the hotspot (used for dismissal tracking)
 * @param {string} title - Feature title
 * @param {string} description - Feature description
 * @param {string} learnMoreUrl - Optional link to learn more
 * @param {string} position - Position relative to parent: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
 * @param {string} side - Tooltip position: 'top' | 'right' | 'bottom' | 'left'
 * @param {boolean} showOnce - If true, only show until dismissed
 * @param {string} color - Dot color: 'red' | 'blue' | 'green' | 'purple'
 */
export function FeatureHotspot({
  id,
  title,
  description,
  learnMoreUrl,
  learnMoreText = 'Learn more',
  position = 'top-right',
  side = 'bottom',
  align = 'start',
  showOnce = true,
  color = 'red',
  className,
  onDismiss,
  children,
}) {
  const [isDismissed, setIsDismissed] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  // Check if already dismissed
  useEffect(() => {
    if (showOnce && id) {
      const dismissed = localStorage.getItem(`${DISMISSED_PREFIX}${id}`)
      if (dismissed === 'true') {
        setIsDismissed(true)
      }
    }
  }, [id, showOnce])

  const handleDismiss = (e) => {
    e?.stopPropagation()
    if (showOnce && id) {
      localStorage.setItem(`${DISMISSED_PREFIX}${id}`, 'true')
    }
    setIsDismissed(true)
    setIsOpen(false)
    onDismiss?.()
  }

  if (isDismissed) return null

  // Position styles
  const positionStyles = {
    'top-right': 'top-0 right-0 -translate-y-1/2 translate-x-1/2',
    'top-left': 'top-0 left-0 -translate-y-1/2 -translate-x-1/2',
    'bottom-right': 'bottom-0 right-0 translate-y-1/2 translate-x-1/2',
    'bottom-left': 'bottom-0 left-0 translate-y-1/2 -translate-x-1/2',
    'center-right': 'top-1/2 right-0 -translate-y-1/2 translate-x-1/2',
    'center-left': 'top-1/2 left-0 -translate-y-1/2 -translate-x-1/2',
  }

  // Color configurations
  const colorConfig = {
    red: {
      dot: 'bg-red-500',
      pulse: 'bg-red-400',
      ring: 'ring-red-500/30',
    },
    blue: {
      dot: 'bg-blue-500',
      pulse: 'bg-blue-400',
      ring: 'ring-blue-500/30',
    },
    green: {
      dot: 'bg-emerald-500',
      pulse: 'bg-emerald-400',
      ring: 'ring-emerald-500/30',
    },
    purple: {
      dot: 'bg-purple-500',
      pulse: 'bg-purple-400',
      ring: 'ring-purple-500/30',
    },
  }

  const colors = colorConfig[color] || colorConfig.red

  return (
    <Tooltip open={isOpen} onOpenChange={setIsOpen}>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'absolute z-50',
            'group cursor-pointer',
            'focus:outline-none',
            positionStyles[position],
            className
          )}
          aria-label={`Learn about ${title}`}
        >
          {/* Pulsing animation rings */}
          <span className="relative flex h-4 w-4">
            {/* Outer pulse */}
            <span
              className={cn(
                'absolute inline-flex h-full w-full rounded-full opacity-75',
                colors.pulse,
                'animate-ping'
              )}
              style={{ animationDuration: '2s' }}
            />
            {/* Middle pulse */}
            <span
              className={cn(
                'absolute inline-flex h-full w-full rounded-full opacity-50 scale-150',
                colors.pulse,
                'animate-ping'
              )}
              style={{ animationDuration: '2s', animationDelay: '0.5s' }}
            />
            {/* Static dot */}
            <span
              className={cn(
                'relative inline-flex rounded-full h-4 w-4',
                colors.dot,
                'ring-4',
                colors.ring,
                'shadow-lg',
                'group-hover:scale-110 transition-transform duration-200'
              )}
            />
          </span>
        </button>
      </TooltipTrigger>
      <TooltipContent
        side={side}
        align={align}
        sideOffset={12}
        className={cn(
          // Premium glassmorphism card
          'backdrop-blur-xl bg-white/95 dark:bg-gray-900/95',
          'border border-gray-200/50 dark:border-gray-700/50',
          'shadow-2xl shadow-black/10 dark:shadow-black/30',
          'rounded-xl',
          'p-0 overflow-hidden',
          'w-72',
          'animate-in fade-in-0 zoom-in-95 slide-in-from-top-2'
        )}
      >
        {/* Header with gradient */}
        <div className="relative px-4 pt-4 pb-3 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/30">
                <Sparkles size={14} className="text-red-600 dark:text-red-400" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                {title}
              </h4>
            </div>
            <button
              onClick={handleDismiss}
              className="p-1 rounded-full hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors"
              aria-label="Dismiss"
            >
              <X size={14} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-3">
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            {description}
          </p>

          {learnMoreUrl && (
            <a
              href={learnMoreUrl}
              className="inline-flex items-center space-x-1 mt-3 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
            >
              <span>{learnMoreText}</span>
              <ArrowRight size={14} />
            </a>
          )}
        </div>

        {/* Footer with dismiss hint */}
        <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700/50">
          <p className="text-xs text-gray-400">
            Click the X to dismiss this tip
          </p>
        </div>
      </TooltipContent>
    </Tooltip>
  )
}

/**
 * FeatureHighlight - Wrapper that adds a hotspot to any element
 * Makes it easy to add discovery hints to existing UI
 */
export function FeatureHighlight({
  children,
  hotspotProps,
  className,
}) {
  return (
    <div className={cn('relative', className)}>
      {children}
      <FeatureHotspot {...hotspotProps} />
    </div>
  )
}

/**
 * NewFeatureBadge - Small "NEW" badge for features
 * Less intrusive than hotspot, good for sidebar/nav items
 */
export function NewFeatureBadge({ className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold',
        'bg-gradient-to-r from-red-500 to-orange-500 text-white',
        'shadow-sm',
        'animate-pulse',
        className
      )}
    >
      NEW
    </span>
  )
}

/**
 * Reset all dismissed hotspots (for testing or user request)
 */
export function resetAllHotspots() {
  const keys = Object.keys(localStorage).filter(key =>
    key.startsWith(DISMISSED_PREFIX)
  )
  keys.forEach(key => localStorage.removeItem(key))
}

export default FeatureHotspot
