/**
 * HELP CENTER - Main Documentation Hub
 *
 * Organized by workflow/user journey:
 * - Getting Started
 * - For Freelancers/Vendors/Venues
 * - For Organisers
 * - Features & Tools
 * - Account & Billing
 */

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  Briefcase,
  Users,
  FolderOpen,
  CreditCard,
  MessageCircle,
  Calendar,
  Star,
  Shield,
  Settings,
  HelpCircle,
  BookOpen,
  Zap,
  ArrowRight,
  Play,
  FileText,
  Award,
  Building2,
  Package,
  Crown,
  Sparkles,
  ChevronRight,
  ExternalLink
} from 'lucide-react'
import { Button } from '../ui/button'

const HelpCenterPage = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')

  // Popular/Featured Articles
  const featuredArticles = [
    { title: 'Getting Started on TIES', path: '/help/getting-started', icon: Play },
    { title: 'How to Post a Job', path: '/help/posting-jobs', icon: Briefcase },
    { title: 'Understanding Subscription Tiers', path: '/help/subscriptions', icon: Crown },
    { title: 'Setting Up Your Profile', path: '/help/profile-setup', icon: Users },
  ]

  // Help Categories
  const categories = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      description: 'New to TIES? Start here to learn the basics.',
      icon: BookOpen,
      color: 'bg-blue-500',
      articles: [
        { title: 'Creating Your Account', path: '/help/getting-started#account' },
        { title: 'Choosing Your Role', path: '/help/getting-started#roles' },
        { title: 'Completing Your Profile', path: '/help/getting-started#profile' },
        { title: 'Platform Overview', path: '/help/getting-started#overview' },
      ]
    },
    {
      id: 'jobs',
      title: 'Jobs & Hiring',
      description: 'Post jobs, apply to roles, and manage projects.',
      icon: Briefcase,
      color: 'bg-purple-500',
      articles: [
        { title: 'How to Post a Job', path: '/help/posting-jobs' },
        { title: 'Applying to Jobs', path: '/help/applying-jobs' },
        { title: 'Reviewing Applicants', path: '/help/reviewing-applicants' },
        { title: 'Job Statuses Explained', path: '/help/job-statuses' },
      ]
    },
    {
      id: 'studio',
      title: 'Studio & Projects',
      description: 'Manage your projects and collaborate with teams.',
      icon: FolderOpen,
      color: 'bg-amber-500',
      articles: [
        { title: 'Understanding Studio', path: '/help/studio' },
        { title: 'Project Workspaces', path: '/help/workspaces' },
        { title: 'Team Collaboration', path: '/help/collaboration' },
        { title: 'Managing Tasks & Files', path: '/help/tasks-files' },
      ]
    },
    {
      id: 'profile',
      title: 'Profile & Portfolio',
      description: 'Build your professional presence on TIES.',
      icon: Users,
      color: 'bg-green-500',
      articles: [
        { title: 'Setting Up Your Profile', path: '/help/profile-setup' },
        { title: 'Building Your Portfolio', path: '/help/portfolio' },
        { title: 'Skills & Endorsements', path: '/help/skills' },
        { title: 'Earning Badges', path: '/help/badges' },
      ]
    },
    {
      id: 'subscriptions',
      title: 'Subscriptions & Pricing',
      description: 'Understand tiers, features, and billing.',
      icon: Crown,
      color: 'bg-[#E03131]',
      articles: [
        { title: 'Subscription Tiers Explained', path: '/help/subscriptions' },
        { title: 'Free vs Lite vs Pro', path: '/help/subscriptions#comparison' },
        { title: 'Starting Your Free Trial', path: '/help/subscriptions#trial' },
        { title: 'Upgrading Your Plan', path: '/help/subscriptions#upgrade' },
      ]
    },
    {
      id: 'messaging',
      title: 'Messages & Communication',
      description: 'Connect with clients and collaborators.',
      icon: MessageCircle,
      color: 'bg-indigo-500',
      articles: [
        { title: 'Sending Messages', path: '/help/messaging' },
        { title: 'Job Context in Messages', path: '/help/messaging#job-context' },
        { title: 'Managing Conversations', path: '/help/messaging#managing' },
      ]
    },
    {
      id: 'bookings',
      title: 'Bookings & Calendar',
      description: 'Handle direct bookings and availability.',
      icon: Calendar,
      color: 'bg-teal-500',
      articles: [
        { title: 'How Bookings Work', path: '/help/bookings' },
        { title: 'Managing Your Calendar', path: '/help/calendar' },
        { title: 'Setting Availability', path: '/help/availability' },
        { title: 'Booking Statuses', path: '/help/bookings#statuses' },
      ]
    },
    {
      id: 'payments',
      title: 'Payments & Payouts',
      description: 'Get paid securely through TIES.',
      icon: CreditCard,
      color: 'bg-emerald-500',
      articles: [
        { title: 'Payment Overview', path: '/help/payments' },
        { title: 'Payout Schedule by Tier', path: '/help/payments#schedule' },
        { title: 'Commission Rates', path: '/help/payments#commission' },
        { title: 'Stripe Connect Setup', path: '/help/payments#stripe' },
      ]
    },
    {
      id: 'reviews',
      title: 'Reviews & Reputation',
      description: 'Build trust with ratings and reviews.',
      icon: Star,
      color: 'bg-yellow-500',
      articles: [
        { title: 'How Reviews Work', path: '/help/reviews' },
        { title: 'Leaving a Review', path: '/help/reviews#leaving' },
        { title: 'Responding to Reviews', path: '/help/reviews#responding' },
      ]
    },
    {
      id: 'account',
      title: 'Account & Settings',
      description: 'Manage your account preferences.',
      icon: Settings,
      color: 'bg-gray-500',
      articles: [
        { title: 'Account Settings', path: '/help/account' },
        { title: 'Notification Preferences', path: '/help/notifications' },
        { title: 'Privacy & Security', path: '/help/privacy' },
      ]
    },
  ]

  // Role-specific quick links
  const roleGuides = [
    {
      role: 'Freelancer',
      icon: Users,
      description: 'DJs, photographers, performers, and creative professionals',
      path: '/help/guide-freelancer',
      color: 'from-purple-500 to-indigo-600'
    },
    {
      role: 'Venue',
      icon: Building2,
      description: 'Studios, galleries, event spaces, and locations',
      path: '/help/guide-venue',
      color: 'from-green-500 to-teal-600'
    },
    {
      role: 'Vendor',
      icon: Package,
      description: 'Equipment rental, catering, and service providers',
      path: '/help/guide-vendor',
      color: 'from-orange-500 to-red-600'
    },
    {
      role: 'Organiser',
      icon: Crown,
      description: 'Event planners and project coordinators',
      path: '/help/guide-organiser',
      color: 'from-amber-500 to-orange-600'
    },
  ]

  // Filter articles based on search
  const filteredCategories = searchTerm
    ? categories.map(cat => ({
        ...cat,
        articles: cat.articles.filter(a =>
          a.title.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })).filter(cat => cat.articles.length > 0)
    : categories

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0B0B]">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#E03131] to-[#c92a2a] text-white">
        <div className="max-w-5xl mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">How can we help?</h1>
          <p className="text-xl text-white/80 mb-8">
            Search our guides or browse by topic below
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search for help articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 text-lg focus:outline-none focus:ring-4 focus:ring-white/30 shadow-lg"
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Featured Articles */}
        {!searchTerm && (
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Popular Articles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredArticles.map((article, index) => {
                const Icon = article.icon
                return (
                  <button
                    key={index}
                    onClick={() => navigate(article.path)}
                    className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-[#E03131] dark:hover:border-[#E03131] hover:shadow-md transition-all text-left"
                  >
                    <div className="p-2 bg-[#E03131]/10 rounded-lg">
                      <Icon className="w-5 h-5 text-[#E03131]" />
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">{article.title}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Role-Specific Guides */}
        {!searchTerm && (
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Guides by Role
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {roleGuides.map((guide, index) => {
                const Icon = guide.icon
                return (
                  <button
                    key={index}
                    onClick={() => navigate(guide.path)}
                    className="group p-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-lg transition-all text-left"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${guide.color} flex items-center justify-center mb-3`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {guide.role} Guide
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {guide.description}
                    </p>
                    <div className="flex items-center gap-1 mt-3 text-[#E03131] text-sm font-medium group-hover:gap-2 transition-all">
                      Read guide <ArrowRight size={14} />
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Help Categories */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {searchTerm ? `Search Results for "${searchTerm}"` : 'Browse by Topic'}
          </h2>

          {filteredCategories.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No results found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try different keywords or browse the categories below
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setSearchTerm('')}
              >
                Clear search
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredCategories.map((category) => {
                const Icon = category.icon
                return (
                  <div
                    key={category.id}
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`p-3 rounded-xl ${category.color} text-white`}>
                        <Icon size={24} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {category.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {category.description}
                        </p>
                      </div>
                    </div>

                    <ul className="space-y-2">
                      {category.articles.map((article, index) => (
                        <li key={index}>
                          <button
                            onClick={() => navigate(article.path)}
                            className="flex items-center justify-between w-full py-2 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-left group transition-colors"
                          >
                            <span className="text-gray-700 dark:text-gray-300 group-hover:text-[#E03131]">
                              {article.title}
                            </span>
                            <ChevronRight size={16} className="text-gray-400 group-hover:text-[#E03131]" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Contact Support */}
        <div className="mt-12 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-xl p-8 text-center">
          <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Can't find what you're looking for?
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Our support team is here to help you
          </p>
          <Button onClick={() => navigate('/messages')}>
            <MessageCircle size={16} className="mr-2" />
            Contact Support
          </Button>
        </div>
      </div>
    </div>
  )
}

export default HelpCenterPage
