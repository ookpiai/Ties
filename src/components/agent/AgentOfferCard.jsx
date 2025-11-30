/**
 * AGENT OFFER CARD
 * Displays what an agent offers to freelancers they represent
 *
 * Features:
 * - Commission rate display
 * - Services offered breakdown
 * - Benefits of being represented
 * - Used in agent profiles and representation requests
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Percent,
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
  Shield,
  CheckCircle,
  Briefcase,
  Star,
  Award,
  Clock,
  FileText
} from 'lucide-react'

const AgentOfferCard = ({
  commissionRate = 15,
  offerings = [],
  talentCount = 0,
  totalBookingsManaged = 0,
  averageRateIncrease = null,
  className = ''
}) => {
  // Default offerings if none provided
  const defaultOfferings = [
    { key: 'bookingManagement', label: 'Booking Management', icon: Calendar, enabled: true },
    { key: 'rateNegotiation', label: 'Rate Negotiation', icon: TrendingUp, enabled: true },
    { key: 'calendarManagement', label: 'Calendar Management', icon: Calendar, enabled: true },
    { key: 'invoicing', label: 'Invoicing & Payments', icon: DollarSign, enabled: true },
    { key: 'marketing', label: 'Marketing & Promotion', icon: Users, enabled: false },
    { key: 'contractReview', label: 'Contract Review', icon: Shield, enabled: false }
  ]

  // Use provided offerings or defaults
  const displayOfferings = offerings.length > 0 ? offerings : defaultOfferings

  // Calculate commission tiers description
  const getCommissionDescription = () => {
    if (commissionRate <= 10) return 'Low commission rate'
    if (commissionRate <= 15) return 'Standard industry rate'
    if (commissionRate <= 20) return 'Premium service rate'
    return 'Full-service rate'
  }

  return (
    <Card className={`bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/20 dark:to-slate-900 border-indigo-200 dark:border-indigo-800 ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
          <Briefcase className="w-5 h-5" />
          Agent Services
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Commission Rate - Prominent Display */}
        <div className="text-center p-4 bg-white dark:bg-slate-800 rounded-xl border border-indigo-100 dark:border-indigo-800">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Percent className="w-6 h-6 text-indigo-600" />
            <span className="text-4xl font-bold text-indigo-600">{commissionRate}%</span>
          </div>
          <p className="text-sm text-muted-foreground">{getCommissionDescription()}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Commission on bookings managed by agent
          </p>
        </div>

        {/* Services Offered Grid */}
        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            Services Included
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {displayOfferings.map((offering) => {
              const Icon = offering.icon || Shield
              const isEnabled = typeof offering.enabled === 'boolean' ? offering.enabled : offering.enabled === true

              return (
                <div
                  key={offering.key || offering.label}
                  className={`flex items-center gap-2 p-2 rounded-lg text-sm ${
                    isEnabled
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{offering.label}</span>
                  {isEnabled && (
                    <CheckCircle className="w-3 h-3 ml-auto flex-shrink-0" />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Agent Stats */}
        {(talentCount > 0 || totalBookingsManaged > 0) && (
          <div className="grid grid-cols-2 gap-3">
            {talentCount > 0 && (
              <div className="text-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <Users className="w-5 h-5 mx-auto mb-1 text-indigo-600" />
                <div className="text-lg font-bold">{talentCount}</div>
                <div className="text-xs text-muted-foreground">Talents Managed</div>
              </div>
            )}
            {totalBookingsManaged > 0 && (
              <div className="text-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <Calendar className="w-5 h-5 mx-auto mb-1 text-indigo-600" />
                <div className="text-lg font-bold">{totalBookingsManaged}</div>
                <div className="text-xs text-muted-foreground">Bookings Managed</div>
              </div>
            )}
          </div>
        )}

        {/* Rate Increase Badge */}
        {averageRateIncrease && averageRateIncrease > 0 && (
          <div className="flex items-center justify-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-700 dark:text-green-400">
              Talents earn on average {averageRateIncrease}% more with this agent
            </span>
          </div>
        )}

        {/* Benefits List */}
        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            Benefits of Representation
          </h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <Star className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <span>Access to exclusive job opportunities through agent's network</span>
            </li>
            <li className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <span>Save time on admin - agent handles bookings and scheduling</span>
            </li>
            <li className="flex items-start gap-2">
              <TrendingUp className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Professional rate negotiation to maximize your earnings</span>
            </li>
            <li className="flex items-start gap-2">
              <FileText className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
              <span>Contract review and protection for all bookings</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

// Compact version for inline display
export const AgentOfferBadge = ({ commissionRate, offerings = [] }) => {
  const enabledCount = offerings.filter(o => o.enabled).length

  return (
    <div className="inline-flex items-center gap-3 px-3 py-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
      <div className="flex items-center gap-1">
        <Percent className="w-4 h-4 text-indigo-600" />
        <span className="font-bold text-indigo-600">{commissionRate}%</span>
      </div>
      {enabledCount > 0 && (
        <>
          <span className="text-slate-300">|</span>
          <span className="text-sm text-muted-foreground">
            {enabledCount} services included
          </span>
        </>
      )}
    </div>
  )
}

// Mini card for listings
export const AgentOfferMini = ({ commissionRate, className = '' }) => {
  return (
    <Badge variant="outline" className={`bg-indigo-50 border-indigo-200 text-indigo-700 ${className}`}>
      <Percent className="w-3 h-3 mr-1" />
      {commissionRate}% commission
    </Badge>
  )
}

export default AgentOfferCard
