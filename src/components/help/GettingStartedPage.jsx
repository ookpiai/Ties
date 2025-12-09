/**
 * GETTING STARTED GUIDE
 *
 * Comprehensive onboarding guide for new users
 */

import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Users,
  Building2,
  Package,
  Crown,
  UserPlus,
  Settings,
  Briefcase,
  FolderOpen,
  Star,
  Play,
  Sparkles
} from 'lucide-react'
import { Button } from '../ui/button'

const GettingStartedPage = () => {
  const navigate = useNavigate()

  const steps = [
    {
      number: 1,
      title: 'Create Your Account',
      id: 'account',
      content: (
        <div className="space-y-4">
          <p>
            Getting started on TIES is quick and easy. Here's how to create your account:
          </p>
          <ol className="list-decimal list-inside space-y-3 text-gray-700 dark:text-gray-300">
            <li>Click <strong>"Sign Up"</strong> on the homepage</li>
            <li>Enter your email address and create a secure password</li>
            <li>Verify your email by clicking the link we send you</li>
            <li>You're in! Now let's set up your profile</li>
          </ol>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>Tip:</strong> Use a professional email address - clients and collaborators will see this when you communicate.
            </p>
          </div>
        </div>
      )
    },
    {
      number: 2,
      title: 'Choose Your Role',
      id: 'roles',
      content: (
        <div className="space-y-4">
          <p>
            TIES supports four main user types. Choose the one that best describes you:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-purple-600" />
                <h4 className="font-semibold text-purple-900 dark:text-purple-300">Freelancer</h4>
              </div>
              <p className="text-sm text-purple-700 dark:text-purple-400">
                DJs, photographers, performers, videographers, makeup artists, sound engineers, and other creative professionals.
              </p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-5 h-5 text-green-600" />
                <h4 className="font-semibold text-green-900 dark:text-green-300">Venue</h4>
              </div>
              <p className="text-sm text-green-700 dark:text-green-400">
                Studios, galleries, event halls, outdoor spaces, rehearsal rooms, and any location available for hire.
              </p>
            </div>
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-5 h-5 text-orange-600" />
                <h4 className="font-semibold text-orange-900 dark:text-orange-300">Vendor</h4>
              </div>
              <p className="text-sm text-orange-700 dark:text-orange-400">
                Equipment rental, catering, AV services, decor, lighting, and other event service providers.
              </p>
            </div>
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-5 h-5 text-amber-600" />
                <h4 className="font-semibold text-amber-900 dark:text-amber-300">Organiser</h4>
              </div>
              <p className="text-sm text-amber-700 dark:text-amber-400">
                Event planners, project coordinators, and anyone who hires creative talent for events or projects.
              </p>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mt-4">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>Note:</strong> You can be multiple roles! An Organiser can also be a Freelancer. Your primary role determines your profile appearance, but you can access all features.
            </p>
          </div>
        </div>
      )
    },
    {
      number: 3,
      title: 'Complete Your Profile',
      id: 'profile',
      content: (
        <div className="space-y-4">
          <p>
            A complete profile helps you get discovered and build trust. Here's what to include:
          </p>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Profile Photo</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Upload a professional headshot or logo</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Bio / Description</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tell people who you are and what you do (150-300 words works best)</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Specialty</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Select your primary specialty from our curated list</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Location</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Add your city so clients can find local talent</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Portfolio Items</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Upload photos, videos, or audio showcasing your best work</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Skills</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Add relevant skills to help with search matching</p>
              </div>
            </div>
          </div>
          <Button className="mt-4" onClick={() => navigate('/profile')}>
            <Settings className="w-4 h-4 mr-2" />
            Complete Your Profile
          </Button>
        </div>
      )
    },
    {
      number: 4,
      title: 'Explore the Platform',
      id: 'overview',
      content: (
        <div className="space-y-4">
          <p>
            Now that you're set up, here are the main areas of TIES:
          </p>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Discover</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Browse and search for freelancers, venues, and vendors. Filter by role, location, skills, and more.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Briefcase className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Jobs</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Browse job postings, apply to roles, or post jobs to find talent for your projects.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <FolderOpen className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Studio</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your project management hub. View all jobs you've posted or been accepted to.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Star className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Profile</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Manage your profile, portfolio, skills, and settings. This is your public-facing presence.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ]

  const nextSteps = [
    { title: 'Post Your First Job', path: '/help/posting-jobs', icon: Briefcase },
    { title: 'Apply to Jobs', path: '/help/applying-jobs', icon: UserPlus },
    { title: 'Build Your Portfolio', path: '/help/portfolio', icon: Sparkles },
    { title: 'Explore Subscriptions', path: '/help/subscriptions', icon: Crown },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0B0B]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Navigation */}
        <button
          onClick={() => navigate('/help')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Help Center
        </button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <Play className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Getting Started on TIES</h1>
              <p className="text-gray-600 dark:text-gray-400">Everything you need to know to get up and running</p>
            </div>
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-8">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">ON THIS PAGE</h3>
          <div className="flex flex-wrap gap-2">
            {steps.map((step) => (
              <a
                key={step.id}
                href={`#${step.id}`}
                className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {step.title}
              </a>
            ))}
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-8">
          {steps.map((step, index) => (
            <section
              key={step.id}
              id={step.id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-[#E03131] text-white flex items-center justify-center font-bold">
                  {step.number}
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {step.title}
                </h2>
              </div>
              <div className="text-gray-700 dark:text-gray-300">
                {step.content}
              </div>
            </section>
          ))}
        </div>

        {/* Next Steps */}
        <div className="mt-12 bg-gradient-to-r from-[#E03131]/10 to-[#E03131]/5 dark:from-[#E03131]/20 dark:to-[#E03131]/10 border border-[#E03131]/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">What's Next?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {nextSteps.map((item, index) => {
              const Icon = item.icon
              return (
                <button
                  key={index}
                  onClick={() => navigate(item.path)}
                  className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-[#E03131]" />
                    <span className="font-medium text-gray-900 dark:text-white">{item.title}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#E03131] group-hover:translate-x-1 transition-all" />
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default GettingStartedPage
