import React, { useState, useEffect } from 'react'
import { useAuth } from '../../App'
import { supabase } from '../../lib/supabase'
import {
  getEarningsHistory,
  getStripeAccountStatus,
  formatAmount
} from '../../api/payments'
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  Calendar,
  ExternalLink,
  Loader2,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'

const EarningsDashboard = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [earnings, setEarnings] = useState([])
  const [stats, setStats] = useState({
    totalEarned: 0,
    pendingEarnings: 0,
    paidEarnings: 0,
    thisMonth: 0,
  })
  const [stripeAccount, setStripeAccount] = useState(null)

  useEffect(() => {
    if (user?.id) {
      loadEarningsData()
    }
  }, [user?.id])

  const loadEarningsData = async () => {
    try {
      setLoading(true)

      // Load earnings history
      const earningsData = await getEarningsHistory(user.id)
      setEarnings(earningsData)

      // Load Stripe account status
      const accountStatus = await getStripeAccountStatus(user.id)
      setStripeAccount(accountStatus)

      // Calculate stats
      const now = new Date()
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)

      let totalEarned = 0
      let pendingEarnings = 0
      let paidEarnings = 0
      let thisMonth = 0

      earningsData.forEach((payment) => {
        const amount = payment.recipient_amount || 0
        totalEarned += amount

        if (payment.status === 'succeeded') {
          paidEarnings += amount
        } else if (payment.status === 'pending' || payment.status === 'processing') {
          pendingEarnings += amount
        }

        // Check if payment was this month
        const paymentDate = new Date(payment.created_at)
        if (paymentDate >= thisMonthStart) {
          thisMonth += amount
        }
      })

      setStats({
        totalEarned,
        pendingEarnings,
        paidEarnings,
        thisMonth,
      })
    } catch (err) {
      console.error('Failed to load earnings:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<DollarSign className="w-5 h-5" />}
          label="Total Earned"
          value={formatAmount(stats.totalEarned)}
          color="green"
        />
        <StatCard
          icon={<Clock className="w-5 h-5" />}
          label="Pending"
          value={formatAmount(stats.pendingEarnings)}
          color="yellow"
        />
        <StatCard
          icon={<CheckCircle className="w-5 h-5" />}
          label="Paid Out"
          value={formatAmount(stats.paidEarnings)}
          color="blue"
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="This Month"
          value={formatAmount(stats.thisMonth)}
          color="purple"
        />
      </div>

      {/* Stripe Account Status */}
      {stripeAccount && (
        <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${
                stripeAccount.payouts_enabled ? 'bg-green-400' : 'bg-yellow-400'
              }`} />
              <span className="text-gray-300 text-sm">
                Payouts: {stripeAccount.payouts_enabled ? 'Active' : 'Pending'}
              </span>
            </div>
            <a
              href="https://dashboard.stripe.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-[#dc2626] hover:text-[#b91c1c] transition-colors"
            >
              Stripe Dashboard
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}

      {/* Earnings List */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-700/50">
          <h3 className="text-lg font-semibold text-white">Recent Earnings</h3>
        </div>

        {earnings.length === 0 ? (
          <div className="p-8 text-center">
            <DollarSign className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No earnings yet</p>
            <p className="text-gray-500 text-sm mt-1">
              Complete bookings to start earning
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-700/50">
            {earnings.slice(0, 10).map((payment) => (
              <EarningItem key={payment.id} payment={payment} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Stat Card Component
const StatCard = ({ icon, label, value, color }) => {
  const colorClasses = {
    green: 'bg-green-500/20 text-green-400',
    yellow: 'bg-yellow-500/20 text-yellow-400',
    blue: 'bg-blue-500/20 text-blue-400',
    purple: 'bg-purple-500/20 text-purple-400',
  }

  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4">
      <div className={`w-10 h-10 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <p className="text-gray-400 text-sm mb-1">{label}</p>
      <p className="text-xl font-bold text-white">{value}</p>
    </div>
  )
}

// Earning Item Component
const EarningItem = ({ payment }) => {
  const statusColors = {
    succeeded: 'text-green-400 bg-green-500/20',
    pending: 'text-yellow-400 bg-yellow-500/20',
    processing: 'text-blue-400 bg-blue-500/20',
    failed: 'text-red-400 bg-red-500/20',
  }

  const booking = payment.booking
  const clientName = booking?.client_profile?.display_name || 'Client'
  const description = booking?.service_description || 'Service'
  const date = new Date(payment.created_at).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    <div className="px-4 py-3 hover:bg-gray-700/30 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
            <ArrowDownRight className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <p className="text-white font-medium">{description}</p>
            <p className="text-gray-400 text-sm">{clientName} • {date}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-white font-semibold">
            {formatAmount(payment.recipient_amount)}
          </p>
          <span className={`inline-block px-2 py-0.5 rounded text-xs ${statusColors[payment.status] || statusColors.pending}`}>
            {payment.status}
          </span>
        </div>
      </div>
    </div>
  )
}

export default EarningsDashboard
