/**
 * HelpTooltip Component
 *
 * Industry-standard help icon tooltip inspired by:
 * - Stripe's contextual help icons
 * - Notion's subtle information bubbles
 * - Ahrefs' dashboard tooltips
 *
 * Features:
 * - Accessible (WCAG 2.1 compliant, keyboard navigable)
 * - Multiple trigger modes (hover, click, focus)
 * - Customizable positioning
 * - Consistent styling with glassmorphism
 */

import * as React from 'react'
import { HelpCircle, Info, AlertCircle, Lightbulb } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from './tooltip'
import { cn } from '@/lib/utils'

// Icon variants for different contexts
const iconVariants = {
  help: HelpCircle,
  info: Info,
  warning: AlertCircle,
  tip: Lightbulb,
}

// Size configurations
const sizeConfig = {
  sm: { icon: 14, padding: 'px-2 py-1', text: 'text-xs' },
  md: { icon: 16, padding: 'px-3 py-1.5', text: 'text-sm' },
  lg: { icon: 18, padding: 'px-4 py-2', text: 'text-sm' },
}

/**
 * HelpTooltip - Contextual help icon with tooltip
 *
 * @param {string} content - The help text to display
 * @param {string} title - Optional title for the tooltip
 * @param {string} variant - Icon style: 'help' | 'info' | 'warning' | 'tip'
 * @param {string} size - Size: 'sm' | 'md' | 'lg'
 * @param {string} side - Tooltip position: 'top' | 'right' | 'bottom' | 'left'
 * @param {string} className - Additional classes for the icon
 * @param {boolean} inline - Whether to display inline with text
 */
export function HelpTooltip({
  content,
  title,
  variant = 'info',
  size = 'md',
  side = 'top',
  align = 'center',
  className,
  inline = true,
  iconClassName,
  children,
}) {
  const Icon = iconVariants[variant] || iconVariants.info
  const config = sizeConfig[size] || sizeConfig.md

  // Color based on variant
  const iconColors = {
    help: 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300',
    info: 'text-blue-400 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300',
    warning: 'text-amber-400 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-300',
    tip: 'text-emerald-400 hover:text-emerald-600 dark:text-emerald-400 dark:hover:text-emerald-300',
  }

  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex items-center justify-center rounded-full transition-all duration-200',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500',
            'hover:bg-gray-100 dark:hover:bg-gray-800',
            inline ? 'ml-1.5 -mb-0.5' : '',
            className
          )}
          aria-label={title || 'Help information'}
        >
          {children || (
            <Icon
              size={config.icon}
              className={cn(
                iconColors[variant],
                'transition-colors duration-200',
                iconClassName
              )}
            />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent
        side={side}
        align={align}
        sideOffset={8}
        className={cn(
          // Glassmorphism styling
          'backdrop-blur-xl bg-gray-900/95 dark:bg-gray-800/95',
          'border border-gray-700/50',
          'shadow-xl shadow-black/20',
          'rounded-lg',
          config.padding,
          'max-w-xs',
          'animate-in fade-in-0 zoom-in-95',
          'text-white'
        )}
      >
        {title && (
          <p className="font-semibold text-white mb-1 text-sm">{title}</p>
        )}
        <p className={cn(config.text, 'text-gray-200 leading-relaxed')}>
          {content}
        </p>
      </TooltipContent>
    </Tooltip>
  )
}

/**
 * FormFieldHelp - Help tooltip specifically for form fields
 * Positioned inline with form labels
 */
export function FormFieldHelp({ content, title, className }) {
  return (
    <HelpTooltip
      content={content}
      title={title}
      variant="help"
      size="sm"
      side="top"
      className={cn('align-middle', className)}
    />
  )
}

/**
 * FeatureTip - Tooltip for explaining features
 * Uses the lightbulb icon to indicate tips/suggestions
 */
export function FeatureTip({ content, title, side = 'right', className }) {
  return (
    <HelpTooltip
      content={content}
      title={title}
      variant="tip"
      size="md"
      side={side}
      className={className}
    />
  )
}

/**
 * WarningTooltip - For important warnings or caveats
 */
export function WarningTooltip({ content, title, side = 'top', className }) {
  return (
    <HelpTooltip
      content={content}
      title={title}
      variant="warning"
      size="md"
      side={side}
      className={className}
    />
  )
}

export default HelpTooltip
