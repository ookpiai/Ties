/**
 * Create Page - Selection Hub
 *
 * Users choose what they want to create:
 * 1. Post a Job - Creates a job listing that appears in the Jobs Feed
 * 2. Add to Portfolio - Add content to your profile portfolio
 */

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Briefcase,
  Palette,
  ArrowRight,
  Users,
  Eye,
  FolderPlus,
  Sparkles,
  CheckCircle,
  ClipboardList,
  Image
} from 'lucide-react'
import { useAuth } from '../../App'
import { Button } from '../ui/button'
import { Card, CardContent } from '@/components/ui/card'

const CreatePage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [hoveredOption, setHoveredOption] = useState(null)

  const createOptions = [
    {
      id: 'job',
      title: 'Post a Job',
      subtitle: 'Find talent for your event or project',
      description: 'Create a job listing that appears in the Jobs Feed. Define roles, set budgets, and receive applications from freelancers, venues, and vendors.',
      icon: Briefcase,
      color: 'from-blue-500 to-indigo-600',
      lightBg: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      hoverBorder: 'hover:border-blue-400 dark:hover:border-blue-600',
      route: '/jobs/create',
      steps: [
        { icon: Eye, text: 'Your job appears in the Jobs Feed for all users' },
        { icon: Users, text: 'Receive applications from interested professionals' },
        { icon: CheckCircle, text: 'Accept applicants to build your team' },
        { icon: ClipboardList, text: 'Manage the project in Studio workspace' }
      ]
    },
    {
      id: 'portfolio',
      title: 'Add to Portfolio',
      subtitle: 'Showcase your work and skills',
      description: 'Add photos, videos, audio, or links to your professional portfolio. This content appears on your public profile to attract potential clients.',
      icon: Palette,
      color: 'from-[#E03131] to-[#FF6B6B]',
      lightBg: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800',
      hoverBorder: 'hover:border-red-400 dark:hover:border-red-600',
      route: '/create/portfolio',
      steps: [
        { icon: Image, text: 'Upload photos, videos, or audio of your work' },
        { icon: Sparkles, text: 'Feature your best pieces to stand out' },
        { icon: Eye, text: 'Showcase on your public profile' },
        { icon: Users, text: 'Attract clients and job opportunities' }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0B0B]">
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center shadow-lg">
            <FolderPlus className="w-8 h-8 text-gray-600 dark:text-gray-300" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
            What would you like to create?
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Choose between posting a job to find talent, or adding to your portfolio to showcase your skills.
          </p>
        </div>

        {/* Options Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {createOptions.map((option) => {
            const Icon = option.icon
            const isHovered = hoveredOption === option.id

            return (
              <Card
                key={option.id}
                className={`relative cursor-pointer transition-all duration-300 ${option.lightBg} ${option.borderColor} ${option.hoverBorder} border-2 overflow-hidden ${
                  isHovered ? 'shadow-xl scale-[1.02]' : 'shadow-md'
                }`}
                onMouseEnter={() => setHoveredOption(option.id)}
                onMouseLeave={() => setHoveredOption(null)}
                onClick={() => navigate(option.route)}
              >
                <CardContent className="p-8">
                  {/* Icon and Title */}
                  <div className="flex items-start gap-4 mb-6">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${option.color} flex items-center justify-center shadow-lg flex-shrink-0`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {option.title}
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {option.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                    {option.description}
                  </p>

                  {/* How it works steps */}
                  <div className="space-y-3 mb-6">
                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      How it works
                    </p>
                    {option.steps.map((step, index) => {
                      const StepIcon = step.icon
                      return (
                        <div key={index} className="flex items-center gap-3">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center shadow-sm">
                            <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
                              {index + 1}
                            </span>
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {step.text}
                          </span>
                        </div>
                      )
                    })}
                  </div>

                  {/* CTA Button */}
                  <Button
                    className={`w-full bg-gradient-to-r ${option.color} hover:opacity-90 text-white`}
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(option.route)
                    }}
                  >
                    {option.title}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Quick Tips */}
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800">
          <CardContent className="p-6">
            <h3 className="font-semibold text-amber-900 dark:text-amber-300 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Quick Tips
            </h3>
            <div className="grid sm:grid-cols-2 gap-4 text-sm text-amber-800 dark:text-amber-400">
              <div className="flex items-start gap-2">
                <Briefcase className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Posting a job?</strong> Be specific about roles, requirements, and budgets to attract the right applicants.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Palette className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Building portfolio?</strong> Feature your best work first - quality over quantity makes a stronger impression.
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default CreatePage
