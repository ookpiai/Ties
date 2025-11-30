/**
 * Profile Stats Display Components - Premium SaaS Edition
 *
 * Modern stats dashboard with glassmorphism, gradients, and premium aesthetics
 * Inspired by Stripe Dashboard, Linear, and modern SaaS analytics
 */

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Star,
  Eye,
  Clock,
  Calendar,
  TrendingUp,
  DollarSign,
  Users,
  CheckCircle,
  BarChart3,
  Repeat,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Target,
  Zap,
  Award,
  Activity,
} from 'lucide-react'
import {
  getProfileStats,
  getPublicStats,
  getPrivateStats,
  getRatingDisplay,
  formatMemberSince,
  formatResponseTime,
  calculateProfileStrength,
} from '../../../api/profileStats'

/**
 * Public Stats Row - Premium quick stats
 */
export const PublicStatsRow = ({ userId, stats: propStats }) => {
  const [stats, setStats] = useState(propStats)
  const [isLoading, setIsLoading] = useState(!propStats)

  useEffect(() => {
    if (propStats) {
      setStats(propStats)
      return
    }

    const loadStats = async () => {
      if (!userId) return
      setIsLoading(true)
      try {
        const data = await getProfileStats(userId)
        setStats(data)
      } catch (error) {
        console.error('Failed to load stats:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadStats()
  }, [userId, propStats])

  if (isLoading) return null

  const publicStats = getPublicStats(stats)
  const rating = getRatingDisplay(publicStats?.averageRating, publicStats?.totalReviews)

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Rating Pill */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border border-yellow-200/50 dark:border-yellow-700/30">
        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
        <span className="font-semibold text-yellow-700 dark:text-yellow-400">{rating.display}</span>
        {publicStats?.totalReviews > 0 && (
          <span className="text-xs text-yellow-600/70 dark:text-yellow-400/70">
            ({publicStats.totalReviews})
          </span>
        )}
      </div>

      {/* Projects Pill */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200/50 dark:border-green-700/30">
        <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
        <span className="text-sm font-medium text-green-700 dark:text-green-400">
          {publicStats?.totalProjects || 0} completed
        </span>
      </div>

      {/* Response Time Pill */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200/50 dark:border-blue-700/30">
        <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
          {publicStats?.responseTime || 'Quick'} response
        </span>
      </div>
    </div>
  )
}

/**
 * Premium Stats Cards Grid
 */
export const StatsCardsGrid = ({ userId, stats: propStats, isOwnProfile = false }) => {
  const [stats, setStats] = useState(propStats)
  const [isLoading, setIsLoading] = useState(!propStats)

  useEffect(() => {
    if (propStats) {
      setStats(propStats)
      return
    }

    const loadStats = async () => {
      if (!userId) return
      setIsLoading(true)
      try {
        const data = await getProfileStats(userId)
        setStats(data)
      } catch (error) {
        console.error('Failed to load stats:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadStats()
  }, [userId, propStats])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="relative">
          <div className="w-10 h-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
          <Sparkles className="w-4 h-4 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
      </div>
    )
  }

  const publicStats = getPublicStats(stats)
  const rating = getRatingDisplay(publicStats?.averageRating, publicStats?.totalReviews)

  const cards = [
    {
      label: 'Rating',
      value: rating.display,
      icon: Star,
      gradient: 'from-yellow-500 to-amber-500',
      bgGradient: 'from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20',
      iconBg: 'bg-gradient-to-br from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30',
      iconFill: true,
    },
    {
      label: 'Projects',
      value: publicStats?.totalProjects || 0,
      icon: CheckCircle,
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
      iconBg: 'bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30',
    },
    {
      label: 'Reviews',
      value: publicStats?.totalReviews || 0,
      icon: Users,
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20',
      iconBg: 'bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30',
    },
    {
      label: 'Response',
      value: publicStats?.responseTime || 'Quick',
      icon: Clock,
      gradient: 'from-purple-500 to-violet-500',
      bgGradient: 'from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20',
      iconBg: 'bg-gradient-to-br from-purple-100 to-violet-100 dark:from-purple-900/30 dark:to-violet-900/30',
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <div
          key={card.label}
          className="group relative"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <Card className={`
            relative overflow-hidden
            bg-gradient-to-br ${card.bgGradient}
            backdrop-blur-xl
            border border-white/50 dark:border-slate-700/50
            rounded-2xl
            transition-all duration-500
            hover:shadow-lg hover:-translate-y-1
          `}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2.5 rounded-xl ${card.iconBg} shadow-sm`}>
                  <card.icon className={`w-5 h-5 bg-gradient-to-r ${card.gradient} bg-clip-text ${card.iconFill ? 'fill-current text-yellow-500' : ''}`} style={!card.iconFill ? { color: 'transparent', WebkitBackgroundClip: 'text' } : {}} />
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className={`text-2xl font-bold bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent`}>
                {card.value}
              </p>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-1">
                {card.label}
              </p>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  )
}

/**
 * Premium Private Stats Dashboard
 */
export const PrivateStatsDashboard = ({ userId, stats: propStats }) => {
  const [stats, setStats] = useState(propStats)
  const [profileStrength, setProfileStrength] = useState(null)
  const [isLoading, setIsLoading] = useState(!propStats)

  useEffect(() => {
    const loadStats = async () => {
      if (!userId) return
      setIsLoading(true)
      try {
        const [statsData, strengthData] = await Promise.all([
          propStats ? Promise.resolve(propStats) : getProfileStats(userId),
          calculateProfileStrength(userId),
        ])
        setStats(statsData)
        setProfileStrength(strengthData)
      } catch (error) {
        console.error('Failed to load stats:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadStats()
  }, [userId, propStats])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="relative">
          <div className="w-10 h-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
          <Sparkles className="w-4 h-4 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
      </div>
    )
  }

  const publicStats = getPublicStats(stats)
  const privateStats = getPrivateStats(stats)

  return (
    <div className="space-y-5">
      {/* Profile Strength Card */}
      {profileStrength && (
        <Card className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-purple-500/5 to-blue-500/5 backdrop-blur-xl border-primary/20 rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary/10 to-purple-500/10">
                <Target className="w-4 h-4 text-primary" />
              </div>
              Profile Strength
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-purple-600 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${profileStrength.percentage}%` }}
                  />
                </div>
              </div>
              <span className={`
                text-lg font-bold
                ${profileStrength.percentage >= 80 ? 'text-green-600' : profileStrength.percentage >= 50 ? 'text-yellow-600' : 'text-red-500'}
              `}>
                {profileStrength.percentage}%
              </span>
            </div>
            {profileStrength.recommendations?.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Recommendations
                </p>
                {profileStrength.recommendations.slice(0, 3).map((rec, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 p-2 rounded-lg bg-white/50 dark:bg-slate-800/50"
                  >
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <ArrowUpRight className="w-3 h-3 text-primary" />
                    </div>
                    {rec}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          {/* Decorative gradient orb */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full blur-3xl" />
        </Card>
      )}

      {/* Views & Earnings Grid */}
      <div className="grid md:grid-cols-2 gap-5">
        {/* Views Card */}
        <Card className="relative overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-slate-200/50 dark:border-slate-700/50 rounded-2xl hover:shadow-lg transition-shadow duration-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30">
                <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              Profile Views
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: privateStats?.profileViews7d || 0, label: '7 days', trend: '+12%' },
                { value: privateStats?.profileViews30d || 0, label: '30 days', trend: '+8%' },
                { value: privateStats?.profileViewsTotal || 0, label: 'All time', trend: null },
              ].map((item, i) => (
                <div key={i} className="text-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {item.value.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{item.label}</p>
                  {item.trend && (
                    <span className="inline-flex items-center text-xs text-green-600 mt-1">
                      <ArrowUpRight className="w-3 h-3" />
                      {item.trend}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Earnings Card */}
        <Card className="relative overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-slate-200/50 dark:border-slate-700/50 rounded-2xl hover:shadow-lg transition-shadow duration-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30">
                <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                <p className="text-xs text-slate-500 mb-1">Total Earned</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  ${(privateStats?.totalRevenue || 0).toLocaleString()}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <p className="text-xs text-slate-500 mb-1">Avg. Booking</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  ${(privateStats?.averageBookingValue || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card className="relative overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-slate-200/50 dark:border-slate-700/50 rounded-2xl hover:shadow-lg transition-shadow duration-500">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-100 to-violet-100 dark:from-purple-900/30 dark:to-violet-900/30">
              <Activity className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: 'On-time Delivery', value: publicStats?.onTimeRate || 100, color: 'from-green-500 to-emerald-500' },
            { label: 'Repeat Clients', value: publicStats?.repeatClientRate || 0, color: 'from-blue-500 to-cyan-500' },
            { label: 'Response Rate', value: 98, color: 'from-purple-500 to-violet-500' },
          ].map((metric, i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">{metric.label}</span>
                <span className={`text-sm font-bold bg-gradient-to-r ${metric.color} bg-clip-text text-transparent`}>
                  {metric.value}%
                </span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${metric.color} rounded-full transition-all duration-1000`}
                  style={{ width: `${metric.value}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Activity Footer */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50">
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <Calendar className="w-4 h-4" />
          <span>Member since {formatMemberSince(publicStats?.memberSince)}</span>
        </div>
        {privateStats?.lastBookingAt && (
          <span className="text-sm text-slate-500">
            Last booking: {new Date(privateStats.lastBookingAt).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  )
}

/**
 * Premium Rating Display
 */
export const RatingDisplay = ({ rating, totalReviews, size = 'md' }) => {
  const display = getRatingDisplay(rating, totalReviews)

  const sizeConfig = {
    sm: { text: 'text-sm', star: 'w-3.5 h-3.5', gap: 'gap-1' },
    md: { text: 'text-base', star: 'w-4 h-4', gap: 'gap-1.5' },
    lg: { text: 'text-lg', star: 'w-5 h-5', gap: 'gap-2' },
  }

  const config = sizeConfig[size]

  return (
    <div className={`inline-flex items-center ${config.gap} px-3 py-1.5 rounded-full bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20`}>
      <Star className={`${config.star} text-yellow-500 fill-yellow-500`} />
      <span className={`font-bold ${config.text} text-yellow-700 dark:text-yellow-400`}>
        {display.display}
      </span>
      {totalReviews > 0 && (
        <span className="text-xs text-yellow-600/70 dark:text-yellow-400/70">
          ({totalReviews})
        </span>
      )}
    </div>
  )
}

/**
 * Premium Member Since Badge
 */
export const MemberSinceBadge = ({ date }) => {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
      <Calendar className="w-3 h-3" />
      Member since {formatMemberSince(date)}
    </span>
  )
}

export default PublicStatsRow
