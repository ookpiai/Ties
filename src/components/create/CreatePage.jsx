import React from 'react'
import { useNavigate } from 'react-router-dom'
import { PlusCircle, Briefcase, FolderPlus, Calendar } from 'lucide-react'
import { useAuth } from '../../App'

const CreatePage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  const createOptions = [
    {
      id: 'project',
      title: 'New Project',
      description: 'Create a job posting to hire freelancers, venues, or vendors for your event',
      icon: FolderPlus,
      color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      action: () => navigate('/jobs/create'),
      showFor: ['all']
    },
    {
      id: 'booking',
      title: 'New Booking',
      description: 'Find and book someone directly from our directory',
      icon: Calendar,
      color: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30',
      iconColor: 'text-green-600 dark:text-green-400',
      action: () => navigate('/discover'),
      showFor: ['all']
    }
  ]

  // Show all options to all users
  const availableOptions = createOptions

  return (
    <div className="p-8 bg-app dark:bg-[#0B0B0B] min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <PlusCircle className="w-8 h-8 stroke-current dark:text-white" />
          <h1 className="text-3xl font-bold text-app dark:text-white">Create</h1>
        </div>

        <p className="text-muted dark:text-[#B3B3B3] mb-8">
          Start something new - post a job, create a project, or make a booking
        </p>

        {/* Create Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableOptions.map((option) => {
            const Icon = option.icon
            return (
              <button
                key={option.id}
                onClick={option.action}
                className={`${option.color} border-2 rounded-xl p-6 text-left transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#E03131]`}
              >
                <div className={`${option.iconColor} mb-4`}>
                  <Icon className="w-12 h-12" />
                </div>
                <h2 className="text-xl font-semibold mb-2 dark:text-white text-gray-900">
                  {option.title}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {option.description}
                </p>
              </button>
            )
          })}
        </div>

        {/* Help Text */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
            💡 How it works
          </h3>
          <div className="text-sm text-blue-800 dark:text-blue-400 space-y-2">
            <p>
              <strong>New Project:</strong> Post a job requiring one or multiple roles (DJ, Bartender, Venue, Vendor, etc.).
              Set budgets per role, receive applications, and select the perfect people for your event!
            </p>
            <p>
              <strong>New Booking:</strong> Browse our directory and book someone directly if you already know who you want to work with.
              Use filters to find venues, freelancers, or vendors that match your needs.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreatePage
