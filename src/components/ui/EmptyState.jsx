import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { LucideIcon } from 'lucide-react'

/**
 * EmptyState Component - Professional empty state displays
 * Based on Surreal.live UI patterns for helpful, actionable empty states
 *
 * Usage:
 * <EmptyState
 *   icon={Inbox}
 *   title="No bookings yet"
 *   description="When you book someone or receive a request, it will appear here."
 *   action={{ label: "Find Talent", href: "/discover" }}
 * />
 */

const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  variant = 'default',
  size = 'default',
  className = ''
}) => {
  // Variant configurations
  const variants = {
    default: {
      container: 'py-12',
      iconWrapper: 'w-16 h-16 bg-slate-100 dark:bg-slate-800',
      icon: 'w-8 h-8 text-slate-400 dark:text-slate-500',
      title: 'text-lg font-semibold text-slate-900 dark:text-white',
      description: 'text-sm text-slate-600 dark:text-slate-400'
    },
    compact: {
      container: 'py-8',
      iconWrapper: 'w-12 h-12 bg-slate-100 dark:bg-slate-800',
      icon: 'w-6 h-6 text-slate-400 dark:text-slate-500',
      title: 'text-base font-semibold text-slate-900 dark:text-white',
      description: 'text-xs text-slate-600 dark:text-slate-400'
    },
    large: {
      container: 'py-16',
      iconWrapper: 'w-20 h-20 bg-slate-100 dark:bg-slate-800',
      icon: 'w-10 h-10 text-slate-400 dark:text-slate-500',
      title: 'text-xl font-bold text-slate-900 dark:text-white',
      description: 'text-base text-slate-600 dark:text-slate-400'
    }
  }

  // Size configurations
  const sizes = {
    sm: 'max-w-xs',
    default: 'max-w-sm',
    lg: 'max-w-md',
    xl: 'max-w-lg'
  }

  const variantConfig = variants[variant] || variants.default
  const sizeClass = sizes[size] || sizes.default

  return (
    <div className={`flex flex-col items-center justify-center ${variantConfig.container} ${className}`}>
      {/* Icon */}
      {Icon && (
        <div className={`${variantConfig.iconWrapper} rounded-full flex items-center justify-center mb-4`}>
          <Icon className={variantConfig.icon} />
        </div>
      )}

      {/* Title */}
      {title && (
        <h3 className={`${variantConfig.title} mb-2 text-center`}>
          {title}
        </h3>
      )}

      {/* Description */}
      {description && (
        <p className={`${variantConfig.description} text-center ${sizeClass} mb-6`}>
          {description}
        </p>
      )}

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-3">
          {action && (
            action.href ? (
              <Link to={action.href}>
                <Button
                  size={variant === 'compact' ? 'sm' : 'default'}
                  className={action.className}
                >
                  {action.icon && <action.icon className="w-4 h-4 mr-2" />}
                  {action.label}
                </Button>
              </Link>
            ) : (
              <Button
                onClick={action.onClick}
                size={variant === 'compact' ? 'sm' : 'default'}
                className={action.className}
              >
                {action.icon && <action.icon className="w-4 h-4 mr-2" />}
                {action.label}
              </Button>
            )
          )}

          {secondaryAction && (
            secondaryAction.href ? (
              <Link to={secondaryAction.href}>
                <Button
                  variant="outline"
                  size={variant === 'compact' ? 'sm' : 'default'}
                  className={secondaryAction.className}
                >
                  {secondaryAction.icon && <secondaryAction.icon className="w-4 h-4 mr-2" />}
                  {secondaryAction.label}
                </Button>
              </Link>
            ) : (
              <Button
                variant="outline"
                onClick={secondaryAction.onClick}
                size={variant === 'compact' ? 'sm' : 'default'}
                className={secondaryAction.className}
              >
                {secondaryAction.icon && <secondaryAction.icon className="w-4 h-4 mr-2" />}
                {secondaryAction.label}
              </Button>
            )
          )}
        </div>
      )}
    </div>
  )
}

export default EmptyState
