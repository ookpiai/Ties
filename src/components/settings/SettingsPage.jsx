import React, { useState, useEffect } from 'react'
import { useAuth } from '../../App'
import {
  User,
  CreditCard,
  Monitor,
  Calendar,
  Clock,
  Bell,
  Shield,
  Users,
  HelpCircle,
  Settings as SettingsIcon,
  ChevronDown,
  ChevronUp,
  Check,
  Sparkles,
  CalendarCheck,
  FileText,
  Scale,
  Download,
  Trash2,
  LifeBuoy,
  MessageSquare,
  Mail,
  DollarSign,
  Wallet
} from 'lucide-react'
import StripeConnectOnboarding from '../payments/StripeConnectOnboarding'
import EarningsDashboard from '../payments/EarningsDashboard'
import { HelpTooltip, FeatureTip } from '@/components/ui/HelpTooltip'
import { FeatureHotspot } from '@/components/ui/FeatureHotspot'
import { helpContent, featureHotspots } from '../../constants/helpContent'

const SettingsPage = () => {
  const { user } = useAuth()
  const [activeCategory, setActiveCategory] = useState('account')
  const [expandedCard, setExpandedCard] = useState(null)
  const [currentPlan, setCurrentPlan] = useState('free') // 'free', 'pro', 'studio'
  const [googleCalendarSync, setGoogleCalendarSync] = useState(false)
  const [autoAcceptBookings, setAutoAcceptBookings] = useState(false)

  // Check if user is a freelancer/vendor/venue (can receive payments)
  const canReceivePayments = user?.role && ['Freelancer', 'Vendor', 'Venue', 'Artist', 'Crew'].includes(user.role)

  const categories = [
    { id: 'account', label: 'Account & Profile', icon: User },
    { id: 'payments', label: 'Payments & Earnings', icon: Wallet, show: canReceivePayments },
    { id: 'billing', label: 'Billing & Subscription', icon: CreditCard },
    { id: 'platform', label: 'Platform Preferences', icon: Monitor },
    { id: 'booking', label: 'Booking Preferences', icon: Clock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security & Privacy', icon: Shield },
    { id: 'legal', label: 'Legal & Support', icon: HelpCircle },
  ].filter(cat => cat.show !== false)

  const renderCategoryContent = () => {
    switch (activeCategory) {
      case 'account':
        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-app">Account & Profile Settings</h1>
            
            <div className="bg-surface border border-app text-app p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-app mb-4">Profile Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-app mb-2">First Name</label>
                  <input 
                    type="text" 
                    defaultValue={user?.first_name || 'Charlie'} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-app mb-2">Last Name</label>
                  <input 
                    type="text" 
                    defaultValue={user?.last_name || 'White'} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-app mb-2">Bio</label>
                  <textarea 
                    rows="3" 
                    defaultValue="Local DJ and music producer specializing in electronic and house music."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-app mb-2">Email</label>
                  <input 
                    type="email" 
                    defaultValue={user?.email || 'charlie.white@example.com'} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <button className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors">
                Save Changes
              </button>
            </div>

            <div className="bg-surface border border-app text-app p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-app mb-4">Privacy Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-app">Public Profile</span>
                    <p className="text-xs text-muted">Allow others to find and view your profile</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-app">Show Contact Information</span>
                    <p className="text-xs text-muted">Display email and phone in your profile</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Delete Account Section */}
            <div className="bg-white dark:bg-[#0F1623] border border-red-200 dark:border-red-900/60 text-app p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-red-900 mb-4">Danger Zone</h3>
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-app mb-1">Delete My Account</h4>
                  <p className="text-sm text-muted">Permanently delete your account and all associated data.</p>
                  <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                    <span>⚠️</span>
                    <span>This action is permanent and cannot be undone.</span>
                  </p>
                </div>
                <button 
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm transition-colors whitespace-nowrap"
                  title="This action is permanent and cannot be undone."
                >
                  <Trash2 className="w-4 h-4" />
                  Delete My Account
                </button>
              </div>
            </div>
          </div>
        )

      case 'payments':
        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-app flex items-center gap-2">
              Payments & Earnings
              <HelpTooltip
                content={helpContent.payments.stripeConnect.description}
                title={helpContent.payments.stripeConnect.title}
                variant="info"
              />
            </h1>
            <p className="text-muted">Set up your payment account to receive earnings from bookings.</p>

            {/* Stripe Connect Onboarding */}
            <div className="relative">
              <StripeConnectOnboarding />
              <FeatureHotspot
                id={featureHotspots.stripeConnect.id}
                title={featureHotspots.stripeConnect.title}
                description={featureHotspots.stripeConnect.description}
                position="top-right"
                side="left"
                color="green"
              />
            </div>

            {/* Earnings Dashboard */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-app mb-4">Your Earnings</h2>
              <EarningsDashboard />
            </div>
          </div>
        )

      case 'billing':
        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-app">Billing & Subscription</h1>

            {/* Current Plan Section */}
            <div className="bg-surface border border-app text-app p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-app mb-4">Current Plan</h3>
              <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div>
                  <p className="font-medium text-app">
                    {currentPlan === 'free' && 'Free Plan'}
                    {currentPlan === 'pro' && 'TIES Pro Subscription'}
                    {currentPlan === 'studio' && 'Studio Pro Subscription'}
                  </p>
                  <p className="text-sm text-muted">
                    {currentPlan === 'free' && '$0/month - Essential features'}
                    {currentPlan === 'pro' && '$15/month - Enhanced visibility & analytics'}
                    {currentPlan === 'studio' && '$30/month - Full team collaboration'}
                  </p>
                  {currentPlan !== 'free' && (
                    <p className="text-xs text-muted mt-1">Next billing: January 22, 2025</p>
                  )}
                </div>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  Active
                </span>
              </div>
            </div>

            {/* Subscription Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Free Plan Card */}
              <div className={`bg-surface rounded-xl shadow-md border-2 transition-all duration-300 hover:shadow-lg ${
                currentPlan === 'free' ? 'border-blue-500' : 'border-gray-200'
              }`}>
                <div className="p-6">
                  {currentPlan === 'free' && (
                    <div className="mb-3">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
                        Current Plan
                      </span>
                    </div>
                  )}
                  <h3 className="text-2xl font-bold text-app mb-2">Free</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-app">$0</span>
                    <span className="text-muted">/month</span>
                  </div>
                  <p className="text-sm text-muted mb-6">
                    For emerging creatives and new users exploring TIES Together. Includes essential tools to build a profile, connect with peers, and manage basic bookings.
                  </p>
                  
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-app">Create & share a public profile</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-app">Discover venues, vendors, and talent</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-app">Standard visibility in search</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-app">10% commission on bookings</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-app">Access to community support</span>
                    </li>
                  </ul>
                  
                  {currentPlan === 'free' ? (
                    <div className="space-y-3">
                      <button className="w-full bg-orange-600 text-white py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors">
                        Upgrade to TIES Pro
                      </button>
                      <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                        Upgrade to Studio Pro
                      </button>
                    </div>
                  ) : (
                    <button className="w-full bg-slate-200 dark:bg-slate-700 text-muted py-3 rounded-lg font-medium cursor-not-allowed">
                      Current Plan
                    </button>
                  )}
                </div>
              </div>

              {/* TIES Pro Card */}
              <div className={`bg-surface rounded-xl shadow-md border-2 transition-all duration-300 hover:shadow-lg relative ${
                currentPlan === 'pro' ? 'border-orange-500' : 'border-gray-200'
              }`}>
                {/* Trial Badge */}
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-1 rounded-full text-xs font-semibold shadow-md flex items-center">
                    <Sparkles className="w-3 h-3 mr-1" />
                    7-day free trial
                  </div>
                </div>
                
                <div className="p-6 pt-8">
                  {currentPlan === 'pro' && (
                    <div className="mb-3">
                      <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-semibold">
                        Current Plan
                      </span>
                    </div>
                  )}
                  <h3 className="text-2xl font-bold text-app mb-2">TIES Pro Subscription</h3>
                  <div className="mb-2">
                    <span className="text-4xl font-bold text-app">$15</span>
                    <span className="text-muted">/month</span>
                  </div>
                  <p className="text-sm text-muted mb-6">
                    For freelancers and professionals who want higher visibility, analytics, and reduced commission fees.
                  </p>
                  
                  <ul className="space-y-2.5 mb-6">
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-app">Commission reduced to 8%</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-app">Boosted visibility in search</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-app">Booking analytics & early notifications</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-app">No ads + Pro badge</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-app">Filter priority in searches</span>
                    </li>
                  </ul>
                  
                  {/* Collapsible Section */}
                  <div className="border-t border-gray-200 pt-4 mb-4">
                    <button
                      onClick={() => setExpandedCard(expandedCard === 'pro' ? null : 'pro')}
                      className="w-full flex items-center justify-between text-sm text-muted hover:text-app transition-colors"
                    >
                      <span className="font-medium">See More Features</span>
                      {expandedCard === 'pro' ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                    
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      expandedCard === 'pro' ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
                    }`}>
                      <ul className="space-y-2.5">
                        <li className="flex items-start">
                          <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-app">Instant-booking toggle</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-app">Pin top reviews on profile</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-app">Feedback insights & rating trends</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-app">Pro resource packs (contracts, calculators)</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-app">Escrow payment system</span>
                        </li>
                      </ul>
                      
                      {currentPlan === 'pro' && (
                        <button className="w-full mt-4 bg-red-50 text-red-600 py-2 rounded-lg font-medium hover:bg-red-100 transition-colors border border-red-200">
                          Cancel Subscription
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {currentPlan === 'pro' ? (
                    <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                      Upgrade to Studio Pro
                    </button>
                  ) : currentPlan === 'studio' ? (
                    <button className="w-full bg-slate-200 dark:bg-slate-700 text-app py-3 rounded-lg font-medium hover:bg-slate-500 dark:bg-slate-600 transition-colors">
                      Downgrade to Pro
                    </button>
                  ) : (
                    <button className="w-full bg-orange-600 text-white py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors">
                      Start Free Trial
                    </button>
                  )}
                </div>
              </div>

              {/* Studio Pro Card */}
              <div className={`bg-surface rounded-xl shadow-md border-2 transition-all duration-300 hover:shadow-lg relative ${
                currentPlan === 'studio' ? 'border-blue-500' : 'border-gray-200'
              }`}>
                {/* Trial Badge */}
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-1 rounded-full text-xs font-semibold shadow-md flex items-center">
                    <Sparkles className="w-3 h-3 mr-1" />
                    7-day free trial
                  </div>
                </div>
                
                <div className="p-6 pt-8">
                  {currentPlan === 'studio' && (
                    <div className="mb-3">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
                        Current Plan
                      </span>
                    </div>
                  )}
                  <h3 className="text-2xl font-bold text-app mb-2">Studio Pro Subscription</h3>
                  <div className="mb-2">
                    <span className="text-4xl font-bold text-app">$30</span>
                    <span className="text-muted">/month</span>
                  </div>
                  <p className="text-sm text-muted mb-4">
                    For organisers, collectives, and studios managing multiple projects and teams.
                  </p>
                  
                  <p className="text-sm font-semibold text-app mb-3">Everything from TIES Pro plus:</p>
                  
                  <ul className="space-y-2.5 mb-6">
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-app">Unlimited active Studio projects</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-app">Reusable templates & presets</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-app">Full collaborator access control</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-app">Vendor tagging & task automation</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-app">Task timelines & team calendars</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-app">In-project messaging</span>
                    </li>
                  </ul>
                  
                  {/* Collapsible Section */}
                  <div className="border-t border-gray-200 pt-4 mb-4">
                    <button
                      onClick={() => setExpandedCard(expandedCard === 'studio' ? null : 'studio')}
                      className="w-full flex items-center justify-between text-sm text-muted hover:text-app transition-colors"
                    >
                      <span className="font-medium">See More Features</span>
                      {expandedCard === 'studio' ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                    
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      expandedCard === 'studio' ? 'max-h-[500px] opacity-100 mt-4' : 'max-h-0 opacity-0'
                    }`}>
                      <ul className="space-y-2.5">
                        <li className="flex items-start">
                          <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-app">File sharing with version history</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-app">Budget dashboard (exportable)</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-app">Progress summary generator</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-app">Pre-built event role presets</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-app">Invite co-organisers & assistants</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-app">Pro organiser templates & workshops</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-app">Organiser dashboard + approval system</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-app">Escrow payment system</span>
                        </li>
                      </ul>
                      
                      {currentPlan === 'studio' && (
                        <button className="w-full mt-4 bg-red-50 text-red-600 py-2 rounded-lg font-medium hover:bg-red-100 transition-colors border border-red-200">
                          Cancel Subscription
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {currentPlan === 'studio' ? (
                    <button className="w-full bg-slate-200 dark:bg-slate-700 text-muted py-3 rounded-lg font-medium cursor-not-allowed">
                      Current Plan
                    </button>
                  ) : (
                    <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                      Start Free Trial
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Methods Section */}
            <div className="bg-surface border border-app text-app p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-app mb-4">Payment Methods</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                      <CreditCard className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">•••• •••• •••• 4242</p>
                      <p className="text-xs text-muted">Expires 12/25</p>
                    </div>
                  </div>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Default</span>
                </div>
              </div>
              <button className="mt-3 text-blue-600 hover:text-blue-800 text-sm">
                + Add Payment Method
              </button>
            </div>
          </div>
        )

      case 'platform':
        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-app">Platform Preferences</h1>
            
            <div className="bg-surface border border-app text-app p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-app mb-4">System Preferences</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-app mb-2">Language</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" defaultValue="English">
                    <option>English</option>
                    <option>Spanish</option>
                    <option>French</option>
                    <option>German</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-app mb-2">Timezone</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" defaultValue="UTC+10 (Sydney)">
                    <option>UTC+10 (Sydney)</option>
                    <option>UTC-5 (New York)</option>
                    <option>UTC+0 (London)</option>
                    <option>UTC+1 (Berlin)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-app mb-2">Default Currency</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" defaultValue="AUD">
                    <option>AUD</option>
                    <option>NZD</option>
                    <option>USD</option>
                    <option>GBP</option>
                    <option>EUR</option>
                    <option>JPY</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-app mb-2">Date Format</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" defaultValue="DD/MM/YYYY">
                    <option>DD/MM/YYYY</option>
                    <option>MM/DD/YYYY</option>
                  </select>
                </div>
              </div>
              <button className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors">
                Save Preferences
              </button>
            </div>
          </div>
        )

      case 'booking':
        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-app">Booking Preferences</h1>
            
            <div className="bg-surface border border-app text-app p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-app mb-4">Booking Settings</h3>
              <div className="space-y-6">
                {/* Default Booking Rate */}
                <div>
                  <label className="block text-sm font-medium text-app mb-2">Default Booking Rate</label>
                  <div className="flex gap-3">
                    <input 
                      type="number" 
                      placeholder="Enter your base rate (e.g., 80)"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>Per Hour</option>
                      <option>Per Project</option>
                    </select>
                  </div>
                  <p className="text-xs text-muted mt-2">This rate will appear as your default when clients send booking requests.</p>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200"></div>

                {/* Google Calendar Sync */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CalendarCheck className="w-5 h-5 text-muted" />
                    <div>
                      <span className="text-sm font-medium text-app">Sync with Google Calendar</span>
                      <p className="text-xs text-muted">Connect your calendar to manage availability</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={googleCalendarSync}
                      onChange={(e) => setGoogleCalendarSync(e.target.checked)}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                </div>
                {googleCalendarSync && (
                  <div className="ml-8 p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-xs text-green-700">Your availability will automatically sync with your connected Google Calendar.</p>
                  </div>
                )}

                {/* Divider */}
                <div className="border-t border-gray-200"></div>

                {/* Auto-Accept Bookings */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-app">Automatically Accept Booking Requests</span>
                    <p className="text-xs text-muted">Skip manual approval for matching bookings</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={autoAcceptBookings}
                      onChange={(e) => setAutoAcceptBookings(e.target.checked)}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                </div>
                {autoAcceptBookings && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-xs text-blue-700">Incoming bookings that match your availability will be automatically approved.</p>
                  </div>
                )}
              </div>
              <button className="mt-6 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors">
                Save Preferences
              </button>
            </div>
          </div>
        )

      case 'notifications':
        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-app">Notifications & Communication</h1>
            
            <div className="bg-surface border border-app text-app p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-app mb-4">Notification Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-app">Email Notifications</span>
                    <p className="text-xs text-muted">Receive notifications via email</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-app">SMS Notifications</span>
                    <p className="text-xs text-muted">Receive urgent notifications via SMS</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )

      case 'security':
        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-app">Security & Privacy</h1>
            
            <div className="bg-surface border border-app text-app p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-app mb-4">Security Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-app">Two-Factor Authentication</span>
                    <p className="text-xs text-muted">Add an extra layer of security to your account</p>
                  </div>
                  <button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm transition-colors">
                    Enable 2FA
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-app">Change Password</span>
                    <p className="text-xs text-muted">Update your account password</p>
                  </div>
                  <button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm transition-colors">
                    Update
                  </button>
                </div>
              </div>
            </div>
          </div>
        )

      case 'legal':
        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-app">Legal & Support</h1>
            
            {/* Legal Information Panel */}
            <div className="bg-surface border border-app text-app p-6 rounded-lg shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Scale className="w-5 h-5 text-app" />
                <h3 className="text-lg font-medium text-app">Legal Information</h3>
              </div>
              
              <div className="space-y-6">
                {/* Terms of Service */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="w-4 h-4 text-muted" />
                      <h4 className="text-sm font-semibold text-app">Terms of Service</h4>
                    </div>
                    <p className="text-sm text-muted">Review the terms that govern your use of TIES Together.</p>
                  </div>
                  <button className="ml-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm transition-colors whitespace-nowrap">
                    View Terms
                  </button>
                </div>

                <div className="border-t border-gray-200"></div>

                {/* Privacy Policy */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Shield className="w-4 h-4 text-muted" />
                      <h4 className="text-sm font-semibold text-app">Privacy Policy</h4>
                    </div>
                    <p className="text-sm text-muted">Understand how your data is stored, shared, and protected.</p>
                  </div>
                  <button className="ml-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm transition-colors whitespace-nowrap">
                    View Policy
                  </button>
                </div>

                <div className="border-t border-gray-200"></div>

                {/* User Agreements */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="w-4 h-4 text-muted" />
                      <h4 className="text-sm font-semibold text-app">User Agreements</h4>
                    </div>
                    <p className="text-sm text-muted">Includes independent contractor agreements and creative ownership disclaimers.</p>
                  </div>
                  <button className="ml-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm transition-colors whitespace-nowrap">
                    View Agreements
                  </button>
                </div>

              </div>
            </div>

            {/* Support & Assistance Panel */}
            <div className="bg-surface border border-app text-app p-6 rounded-lg shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <LifeBuoy className="w-5 h-5 text-app" />
                <h3 className="text-lg font-medium text-app">Support & Assistance</h3>
              </div>
              
              <div className="space-y-6">
                {/* Help Centre */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <HelpCircle className="w-4 h-4 text-muted" />
                      <h4 className="text-sm font-semibold text-app">Help Centre</h4>
                    </div>
                    <p className="text-sm text-muted">Find quick answers and step-by-step guides to common questions.</p>
                  </div>
                  <button className="ml-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm transition-colors whitespace-nowrap">
                    Open Help Centre
                  </button>
                </div>

                <div className="border-t border-gray-200"></div>

                {/* Report an Issue */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <MessageSquare className="w-4 h-4 text-muted" />
                      <h4 className="text-sm font-semibold text-app">Report an Issue</h4>
                    </div>
                    <p className="text-sm text-muted">Experiencing a problem or dispute? Submit a report and our team will respond within 48 hours.</p>
                  </div>
                  <button className="ml-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm transition-colors whitespace-nowrap">
                    Submit a Report
                  </button>
                </div>

                <div className="border-t border-gray-200"></div>

                {/* Contact Support */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Mail className="w-4 h-4 text-muted" />
                      <h4 className="text-sm font-semibold text-app">Contact Support</h4>
                    </div>
                    <p className="text-sm text-muted">Reach our support team directly for account, billing, or platform questions.</p>
                    <a href="mailto:support@tiestogether.com" className="text-sm text-blue-600 hover:text-blue-800 mt-1 inline-block">
                      support@tiestogether.com
                    </a>
                  </div>
                  <button className="ml-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm transition-colors whitespace-nowrap">
                    Email Support
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center py-4">
              <p className="text-xs text-muted">© 2025 TIES Together. All rights reserved.</p>
            </div>
          </div>
        )

      default:
        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-app">Settings</h1>
            <div className="bg-surface border border-app text-app p-6 rounded-lg shadow-sm">
              <p className="text-muted">Select a category from the sidebar to view settings.</p>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-app">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-surface-2 backdrop-blur shadow-sm border-r border-app min-h-screen">
          <div className="p-4">
            <div className="flex items-center space-x-2 mb-6">
              <SettingsIcon className="w-6 h-6 text-muted" />
              <h2 className="text-lg font-semibold text-app">Settings</h2>
            </div>
            <nav className="space-y-2">
              {categories.map((category) => {
                const Icon = category.icon
                const isActive = activeCategory === category.id
                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left transition-colors ${
                      isActive
                        ? 'bg-red-600 text-white'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-5 h-5 stroke-current" />
                    <span className="text-sm font-medium flex-1">{category.label}</span>
                    {category.badge > 0 && (
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        isActive
                          ? 'bg-white text-red-600'
                          : 'bg-red-100 text-red-600'
                      }`}>
                        {category.badge}
                      </span>
                    )}
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {renderCategoryContent()}
        </div>
      </div>
    </div>
  )
}

export default SettingsPage

