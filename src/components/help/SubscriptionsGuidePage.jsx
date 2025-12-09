/**
 * SUBSCRIPTIONS GUIDE
 *
 * Explains Free/Lite/Pro tiers, features, and pricing
 */

import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  X,
  Crown,
  Zap,
  Sparkles,
  Clock,
  DollarSign,
  FolderOpen,
  Briefcase,
  FileText,
  Calendar,
  Upload,
  Award,
  TrendingUp,
  Shield,
  HelpCircle
} from 'lucide-react'
import { Button } from '../ui/button'

const SubscriptionsGuidePage = () => {
  const navigate = useNavigate()

  const tiers = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Get started with essential features',
      color: 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700',
      headerColor: 'bg-gray-500',
      features: [
        { text: '1 active job at a time', included: true },
        { text: '1 Studio project', included: true },
        { text: '2 milestones per job', included: true },
        { text: 'Basic invoicing', included: true },
        { text: '10% platform commission', included: true },
        { text: '5 business day payouts', included: true },
        { text: 'Unlimited job applications', included: true },
        { text: 'Calendar sync', included: false },
        { text: 'Large file uploads', included: false },
        { text: 'Visibility boosts', included: false },
        { text: 'Branded invoices', included: false },
        { text: 'TIES Pro badge', included: false },
      ]
    },
    {
      name: 'Lite',
      price: '$19',
      period: '/month',
      yearlyPrice: '$190/year (save 17%)',
      description: 'More flexibility for growing professionals',
      color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
      headerColor: 'bg-blue-500',
      features: [
        { text: '3 active jobs at a time', included: true },
        { text: '3 Studio projects', included: true },
        { text: '3 milestones per job', included: true },
        { text: 'Basic invoicing', included: true },
        { text: '10% platform commission', included: true },
        { text: '2-3 business day payouts', included: true },
        { text: 'Unlimited job applications', included: true },
        { text: 'Calendar sync', included: true },
        { text: 'Large file uploads', included: true },
        { text: 'Visibility boosts (limited)', included: true },
        { text: 'Branded invoices', included: false },
        { text: 'TIES Pro badge', included: false },
      ]
    },
    {
      name: 'Pro',
      price: '$49',
      period: '/month',
      yearlyPrice: '$490/year (save 17%)',
      description: 'Full power for serious professionals',
      color: 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-700',
      headerColor: 'bg-gradient-to-r from-amber-500 to-orange-500',
      badge: true,
      features: [
        { text: 'Unlimited active jobs', included: true, highlight: true },
        { text: 'Unlimited Studio projects', included: true, highlight: true },
        { text: 'Unlimited milestones', included: true, highlight: true },
        { text: 'Branded invoices (your logo)', included: true, highlight: true },
        { text: '8% platform commission (save 2%)', included: true, highlight: true },
        { text: 'Same-day payouts', included: true, highlight: true },
        { text: 'Unlimited job applications', included: true },
        { text: 'Calendar sync', included: true },
        { text: 'Large file uploads', included: true },
        { text: 'Priority visibility boosts', included: true },
        { text: 'Project folders & templates', included: true },
        { text: 'TIES Pro badge', included: true, highlight: true },
      ]
    }
  ]

  const faqs = [
    {
      question: 'What happens when I reach my active job limit?',
      answer: 'When you hit your limit, you\'ll be prompted to upgrade or wait until one of your current jobs is completed. You can always view and manage existing jobs, you just can\'t create new ones until you have capacity.'
    },
    {
      question: 'Can I try Pro before committing?',
      answer: 'Yes! All new users get a 30-day free trial of Pro features. No credit card required. You\'ll have full access to everything during the trial period.'
    },
    {
      question: 'What happens after my trial ends?',
      answer: 'After your 30-day trial, you\'ll automatically move to the Free tier unless you choose to upgrade. You won\'t lose any data - you just won\'t be able to create new projects above your tier\'s limits.'
    },
    {
      question: 'Can I downgrade my subscription?',
      answer: 'Yes, you can downgrade at any time. Your subscription will remain active until the end of your current billing period, then switch to your new tier. If you have more active projects than your new tier allows, you\'ll need to complete some before creating new ones.'
    },
    {
      question: 'How does the commission work?',
      answer: 'Commission is only charged on payments processed through TIES. Free and Lite users pay 10%, while Pro users only pay 8%. This saves Pro users 2% on every transaction - which can add up quickly!'
    },
    {
      question: 'What\'s the difference in payout speed?',
      answer: 'Free users receive payouts in 5 business days, Lite in 2-3 business days, and Pro users get same-day or next-day payouts. Faster payouts mean better cash flow for your business.'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0B0B]">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back Navigation */}
        <button
          onClick={() => navigate('/help')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Help Center
        </button>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex p-3 bg-[#E03131]/10 rounded-xl mb-4">
            <Crown className="w-10 h-10 text-[#E03131]" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Subscription Tiers
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Choose the plan that fits your needs. Start free and upgrade as you grow.
          </p>
        </div>

        {/* Trial Banner */}
        <div id="trial" className="bg-gradient-to-r from-[#E03131] to-[#c92a2a] text-white rounded-xl p-6 mb-12">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <Sparkles className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Try Pro Free for 30 Days</h3>
                <p className="text-white/80">
                  New to TIES? Get full Pro access with no credit card required.
                </p>
              </div>
            </div>
            <Button
              className="bg-white text-[#E03131] hover:bg-gray-100"
              onClick={() => navigate('/settings?tab=subscription')}
            >
              <Zap className="w-4 h-4 mr-2" />
              Start Free Trial
            </Button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div id="comparison" className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {tiers.map((tier, index) => (
            <div
              key={tier.name}
              className={`relative rounded-xl border-2 overflow-hidden ${tier.color}`}
            >
              {tier.badge && (
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full">
                    MOST POPULAR
                  </span>
                </div>
              )}

              {/* Header */}
              <div className={`${tier.headerColor} text-white p-6`}>
                <h3 className="text-2xl font-bold">{tier.name}</h3>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  <span className="text-white/80">{tier.period}</span>
                </div>
                {tier.yearlyPrice && (
                  <p className="text-sm text-white/70 mt-1">{tier.yearlyPrice}</p>
                )}
                <p className="text-white/80 mt-2">{tier.description}</p>
              </div>

              {/* Features */}
              <div className="p-6">
                <ul className="space-y-3">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check className={`w-5 h-5 flex-shrink-0 ${feature.highlight ? 'text-amber-500' : 'text-green-500'}`} />
                      ) : (
                        <X className="w-5 h-5 text-gray-300 dark:text-gray-600 flex-shrink-0" />
                      )}
                      <span className={`text-sm ${feature.included ? (feature.highlight ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-700 dark:text-gray-300') : 'text-gray-400 dark:text-gray-500'}`}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full mt-6 ${tier.badge ? 'bg-[#E03131] hover:bg-[#c92a2a]' : ''}`}
                  variant={tier.badge ? 'default' : 'outline'}
                  onClick={() => navigate('/settings?tab=subscription')}
                >
                  {tier.name === 'Free' ? 'Current Plan' : `Upgrade to ${tier.name}`}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Feature Comparison Table */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden mb-12">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Feature Comparison
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Feature</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white">Free</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white">Lite</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-amber-600">Pro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-gray-400" />
                      Active Jobs
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-700 dark:text-gray-300">1</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-700 dark:text-gray-300">3</td>
                  <td className="px-6 py-4 text-center text-sm font-semibold text-amber-600">Unlimited</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    <div className="flex items-center gap-2">
                      <FolderOpen className="w-4 h-4 text-gray-400" />
                      Studio Projects
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-700 dark:text-gray-300">1</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-700 dark:text-gray-300">3</td>
                  <td className="px-6 py-4 text-center text-sm font-semibold text-amber-600">Unlimited</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      Milestones per Job
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-700 dark:text-gray-300">2</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-700 dark:text-gray-300">3</td>
                  <td className="px-6 py-4 text-center text-sm font-semibold text-amber-600">Unlimited</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      Commission Rate
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-700 dark:text-gray-300">10%</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-700 dark:text-gray-300">10%</td>
                  <td className="px-6 py-4 text-center text-sm font-semibold text-amber-600">8%</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      Payout Speed
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-700 dark:text-gray-300">5 days</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-700 dark:text-gray-300">2-3 days</td>
                  <td className="px-6 py-4 text-center text-sm font-semibold text-amber-600">Same day</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      Calendar Sync
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center"><X className="w-5 h-5 text-gray-300 mx-auto" /></td>
                  <td className="px-6 py-4 text-center"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                  <td className="px-6 py-4 text-center"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    <div className="flex items-center gap-2">
                      <Upload className="w-4 h-4 text-gray-400" />
                      Large File Uploads
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center"><X className="w-5 h-5 text-gray-300 mx-auto" /></td>
                  <td className="px-6 py-4 text-center"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                  <td className="px-6 py-4 text-center"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-gray-400" />
                      Visibility Boosts
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center"><X className="w-5 h-5 text-gray-300 mx-auto" /></td>
                  <td className="px-6 py-4 text-center text-sm text-gray-700 dark:text-gray-300">Limited</td>
                  <td className="px-6 py-4 text-center text-sm font-semibold text-amber-600">Priority</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-gray-400" />
                      TIES Pro Badge
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center"><X className="w-5 h-5 text-gray-300 mx-auto" /></td>
                  <td className="px-6 py-4 text-center"><X className="w-5 h-5 text-gray-300 mx-auto" /></td>
                  <td className="px-6 py-4 text-center"><Check className="w-5 h-5 text-amber-500 mx-auto" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQs */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0 last:pb-0">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2 flex items-start gap-2">
                  <HelpCircle className="w-5 h-5 text-[#E03131] flex-shrink-0 mt-0.5" />
                  {faq.question}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 ml-7">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div id="upgrade" className="mt-12 text-center">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to upgrade?
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Start your 30-day free trial or upgrade your subscription in Settings.
          </p>
          <Button
            size="lg"
            onClick={() => navigate('/settings?tab=subscription')}
          >
            <Crown className="w-5 h-5 mr-2" />
            Manage Subscription
          </Button>
        </div>
      </div>
    </div>
  )
}

export default SubscriptionsGuidePage
