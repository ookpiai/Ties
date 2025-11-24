import { Badge } from '@/components/ui/badge'
import { CheckCircle, Clock, XCircle, AlertCircle, Calendar, DollarSign, Package } from 'lucide-react'

/**
 * StatusBadge Component - Consistent status indicators across the application
 * Based on Surreal.live UI patterns for status-driven workflows
 *
 * Usage:
 * <StatusBadge status="pending" type="booking" />
 * <StatusBadge status="accepted" type="booking" size="sm" />
 */

const StatusBadge = ({ status, type = 'default', size = 'default', className = '' }) => {
  // Normalize status to lowercase for consistency
  const normalizedStatus = status?.toLowerCase() || 'unknown'

  // Status configurations following Surreal patterns
  const statusConfigs = {
    // Booking statuses
    booking: {
      pending: {
        label: 'Pending',
        variant: 'warning',
        icon: Clock,
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-900/40'
      },
      accepted: {
        label: 'Accepted',
        variant: 'success',
        icon: CheckCircle,
        className: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-900/40'
      },
      in_progress: {
        label: 'In Progress',
        variant: 'info',
        icon: Calendar,
        className: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-900/40'
      },
      completed: {
        label: 'Completed',
        variant: 'success',
        icon: CheckCircle,
        className: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-900/40'
      },
      cancelled: {
        label: 'Cancelled',
        variant: 'destructive',
        icon: XCircle,
        className: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-900/40'
      },
      rejected: {
        label: 'Rejected',
        variant: 'destructive',
        icon: XCircle,
        className: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-900/40'
      }
    },
    // Job statuses
    job: {
      open: {
        label: 'Open',
        variant: 'success',
        icon: Package,
        className: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-900/40'
      },
      in_progress: {
        label: 'In Progress',
        variant: 'info',
        icon: Calendar,
        className: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-900/40'
      },
      closed: {
        label: 'Closed',
        variant: 'default',
        icon: CheckCircle,
        className: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-900/40'
      },
      filled: {
        label: 'Filled',
        variant: 'success',
        icon: CheckCircle,
        className: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-900/40'
      }
    },
    // Application statuses
    application: {
      pending: {
        label: 'Pending',
        variant: 'warning',
        icon: Clock,
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-900/40'
      },
      reviewing: {
        label: 'Reviewing',
        variant: 'info',
        icon: AlertCircle,
        className: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-900/40'
      },
      selected: {
        label: 'Selected',
        variant: 'success',
        icon: CheckCircle,
        className: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-900/40'
      },
      rejected: {
        label: 'Rejected',
        variant: 'destructive',
        icon: XCircle,
        className: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-900/40'
      },
      withdrawn: {
        label: 'Withdrawn',
        variant: 'default',
        icon: XCircle,
        className: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-900/40'
      }
    },
    // Payment statuses
    payment: {
      unpaid: {
        label: 'Unpaid',
        variant: 'warning',
        icon: DollarSign,
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-900/40'
      },
      paid: {
        label: 'Paid',
        variant: 'success',
        icon: CheckCircle,
        className: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-900/40'
      },
      processing: {
        label: 'Processing',
        variant: 'info',
        icon: Clock,
        className: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-900/40'
      },
      failed: {
        label: 'Failed',
        variant: 'destructive',
        icon: XCircle,
        className: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-900/40'
      },
      refunded: {
        label: 'Refunded',
        variant: 'default',
        icon: DollarSign,
        className: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-900/40'
      }
    },
    // Message statuses
    message: {
      unread: {
        label: 'Unread',
        variant: 'default',
        icon: AlertCircle,
        className: 'bg-primary text-primary-foreground'
      },
      read: {
        label: 'Read',
        variant: 'secondary',
        icon: CheckCircle,
        className: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-900/40'
      }
    },
    // Default fallback
    default: {
      active: {
        label: 'Active',
        variant: 'success',
        icon: CheckCircle,
        className: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-900/40'
      },
      inactive: {
        label: 'Inactive',
        variant: 'default',
        icon: XCircle,
        className: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-900/40'
      },
      unknown: {
        label: 'Unknown',
        variant: 'secondary',
        icon: AlertCircle,
        className: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-900/40'
      }
    }
  }

  // Get the configuration for this status
  const typeConfig = statusConfigs[type] || statusConfigs.default
  const config = typeConfig[normalizedStatus] || typeConfig.unknown || statusConfigs.default.unknown

  const Icon = config.icon

  // Size configurations
  const sizeClasses = {
    sm: 'h-5 px-2 text-xs',
    default: 'h-6 px-2.5 text-xs',
    lg: 'h-7 px-3 text-sm'
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    default: 'w-3.5 h-3.5',
    lg: 'w-4 h-4'
  }

  return (
    <Badge
      variant={config.variant}
      className={`
        ${config.className}
        ${sizeClasses[size]}
        font-medium
        inline-flex
        items-center
        gap-1
        border
        ${className}
      `}
    >
      <Icon className={iconSizes[size]} />
      <span>{config.label}</span>
    </Badge>
  )
}

export default StatusBadge
