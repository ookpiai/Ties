/**
 * PROFILE SETUP GUIDE
 *
 * Complete guide to setting up and optimizing your profile
 */

import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  User,
  Camera,
  FileText,
  MapPin,
  Briefcase,
  Star,
  Award,
  Image,
  Video,
  Music,
  Link,
  CheckCircle,
  Lightbulb,
  Settings,
  Eye,
  TrendingUp
} from 'lucide-react'
import { Button } from '../ui/button'

const ProfileSetupGuidePage = () => {
  const navigate = useNavigate()

  const profileSections = [
    {
      title: 'Profile Photo',
      icon: Camera,
      description: 'Upload a professional headshot or logo',
      tips: [
        'Use a high-quality, well-lit image',
        'Keep it professional - this is your first impression',
        'For businesses, use your logo',
        'Square format works best (recommended: 400x400px)'
      ]
    },
    {
      title: 'Display Name',
      icon: User,
      description: 'Your name or business name',
      tips: [
        'Use your professional name or business name',
        'Keep it consistent with other platforms',
        'Avoid special characters or emojis'
      ]
    },
    {
      title: 'Bio / Description',
      icon: FileText,
      description: 'Tell people about yourself and what you do',
      tips: [
        'Keep it between 150-300 words',
        'Lead with your most impressive accomplishment',
        'Mention your specialty and experience',
        'Include what makes you unique'
      ]
    },
    {
      title: 'Location',
      icon: MapPin,
      description: 'Where you\'re based',
      tips: [
        'Add your city to appear in local searches',
        'Clients often search by location',
        'You can update this if you relocate'
      ]
    },
    {
      title: 'Specialty',
      icon: Briefcase,
      description: 'Your primary area of expertise',
      tips: [
        'Choose from our curated list of specialties',
        'Pick what best describes your main service',
        'This affects how you appear in search results'
      ]
    }
  ]

  const portfolioTypes = [
    { icon: Image, type: 'Images', description: 'Photos of your work, events, products' },
    { icon: Video, type: 'Videos', description: 'Performance clips, showreels, testimonials' },
    { icon: Music, type: 'Audio', description: 'Music samples, DJ sets, voiceovers' },
    { icon: Link, type: 'Links', description: 'YouTube, Vimeo, Spotify, SoundCloud embeds' }
  ]

  const badges = [
    { name: 'Verified', description: 'Complete ID, email, and phone verification', color: 'bg-blue-100 text-blue-800' },
    { name: 'Portfolio', description: 'Add 5+ portfolio items', color: 'bg-purple-100 text-purple-800' },
    { name: 'Active', description: 'Complete a job in the last 30 days', color: 'bg-green-100 text-green-800' },
    { name: 'Quality', description: 'Maintain 4.5+ rating with 5+ reviews', color: 'bg-yellow-100 text-yellow-800' },
    { name: 'TIES Pro', description: 'Active Pro subscription', color: 'bg-amber-100 text-amber-800' }
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
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
              <User className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Setting Up Your Profile</h1>
              <p className="text-gray-600 dark:text-gray-400">Build a professional presence that attracts clients</p>
            </div>
          </div>
        </div>

        {/* Why Profile Matters */}
        <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Why Your Profile Matters</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Your profile is your digital storefront on TIES. A complete, professional profile:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-gray-700 dark:text-gray-300">Appears higher in search results</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-gray-700 dark:text-gray-300">Builds trust with potential clients</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-gray-700 dark:text-gray-300">Increases job application acceptance</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-gray-700 dark:text-gray-300">Unlocks verification badges</p>
            </div>
          </div>
        </section>

        {/* Profile Sections */}
        <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Profile Sections</h2>

          <div className="space-y-6">
            {profileSections.map((section, index) => {
              const Icon = section.icon
              return (
                <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0 last:pb-0">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{section.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{section.description}</p>
                      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">TIPS:</p>
                        <ul className="space-y-1">
                          {section.tips.map((tip, i) => (
                            <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                              <span className="text-green-500">•</span>
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Portfolio Section */}
        <section id="portfolio" className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Building Your Portfolio</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            Your portfolio showcases your best work. TIES supports multiple media types:
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {portfolioTypes.map((item, index) => {
              const Icon = item.icon
              return (
                <div key={index} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg text-center">
                  <Icon className="w-8 h-8 text-[#E03131] mx-auto mb-2" />
                  <p className="font-medium text-gray-900 dark:text-white text-sm">{item.type}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{item.description}</p>
                </div>
              )
            })}
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800 dark:text-blue-300">
                <p className="font-medium mb-1">Portfolio Tips:</p>
                <ul className="space-y-1">
                  <li>• Feature your best 6 items - quality over quantity</li>
                  <li>• Include a variety of work to show range</li>
                  <li>• Add descriptions to each item</li>
                  <li>• Keep it updated with recent work</li>
                  <li>• Tag relevant skills for each item</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Skills Section */}
        <section id="skills" className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Skills & Endorsements</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Add skills to your profile to help clients find you and understand your expertise:
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Star className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Add Relevant Skills</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Choose skills that accurately represent your abilities. You can mark up to 5 as primary.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Star className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Proficiency Levels</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Rate your proficiency: Beginner, Intermediate, or Expert. Be honest - it builds trust.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Star className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Get Endorsed</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Other TIES users can endorse your skills, adding credibility to your profile.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Badges Section */}
        <section id="badges" className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Earning Badges</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Badges showcase your achievements and build trust with potential clients:
          </p>

          <div className="space-y-3">
            {badges.map((badge, index) => (
              <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
                  {badge.name}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">{badge.description}</span>
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => navigate('/help/badges')}
          >
            <Award className="w-4 h-4 mr-2" />
            Learn More About Badges
          </Button>
        </section>

        {/* Public Profile */}
        <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Your Public Profile</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Your public profile is what others see when they find you on TIES. It includes:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Eye className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <p className="text-gray-700 dark:text-gray-300">Profile photo, name, and bio</p>
            </div>
            <div className="flex items-start gap-3">
              <Eye className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <p className="text-gray-700 dark:text-gray-300">Portfolio items</p>
            </div>
            <div className="flex items-start gap-3">
              <Eye className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <p className="text-gray-700 dark:text-gray-300">Skills and endorsements</p>
            </div>
            <div className="flex items-start gap-3">
              <Eye className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <p className="text-gray-700 dark:text-gray-300">Reviews and ratings</p>
            </div>
            <div className="flex items-start gap-3">
              <Eye className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <p className="text-gray-700 dark:text-gray-300">Badges earned</p>
            </div>
            <div className="flex items-start gap-3">
              <Eye className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <p className="text-gray-700 dark:text-gray-300">Specialty and location</p>
            </div>
          </div>

          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>Preview your profile:</strong> Go to Profile → click "View Public Profile" to see exactly what others see.
            </p>
          </div>
        </section>

        {/* CTA */}
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 dark:from-green-500/20 dark:to-emerald-500/20 border border-green-200 dark:border-green-800 rounded-xl">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Ready to build your profile?</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Complete your profile to start getting discovered</p>
          </div>
          <Button onClick={() => navigate('/profile')}>
            <Settings className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        </div>

        {/* Related Articles */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Related Articles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/help/badges')}
              className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-[#E03131] transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-amber-500" />
                <span className="text-gray-900 dark:text-white">Earning Badges</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#E03131]" />
            </button>
            <button
              onClick={() => navigate('/help/reviews')}
              className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-[#E03131] transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="text-gray-900 dark:text-white">Reviews & Ratings</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#E03131]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileSetupGuidePage
