/**
 * POSTING JOBS GUIDE
 *
 * Complete guide to creating and managing job postings
 */

import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Users,
  Building2,
  Package,
  MapPin,
  Calendar,
  DollarSign,
  FileText,
  CheckCircle,
  Clock,
  Eye,
  UserCheck,
  UserX,
  FolderOpen,
  MessageCircle,
  AlertCircle,
  Lightbulb
} from 'lucide-react'
import { Button } from '../ui/button'

const PostingJobsGuidePage = () => {
  const navigate = useNavigate()

  const jobStatuses = [
    {
      status: 'Open',
      color: 'bg-green-100 text-green-800 border-green-200',
      description: 'Job is live and accepting applications'
    },
    {
      status: 'In Progress',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      description: 'Work has started, team is active'
    },
    {
      status: 'Filled',
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      description: 'All roles have been filled'
    },
    {
      status: 'Completed',
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      description: 'Project finished successfully'
    },
    {
      status: 'Cancelled',
      color: 'bg-red-100 text-red-800 border-red-200',
      description: 'Job was cancelled before completion'
    }
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
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
              <Briefcase className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">How to Post a Job</h1>
              <p className="text-gray-600 dark:text-gray-400">Find the perfect talent for your events and projects</p>
            </div>
          </div>
        </div>

        {/* Overview */}
        <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Overview</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Jobs on TIES are how you find and hire talent. Whether you need a DJ for a wedding, a venue for a corporate event,
            or equipment for a festival, you create a job posting that appears in the Jobs Feed for all users to see.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <strong>Pro tip:</strong> A single job can have multiple roles. For example, a wedding might need a photographer,
                videographer, DJ, and venue - all in one job posting!
              </p>
            </div>
          </div>
        </section>

        {/* Step by Step */}
        <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Creating a Job: Step by Step</h2>

          {/* Step 1 */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-[#E03131] text-white flex items-center justify-center font-bold">1</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Job Details (Public Info)</h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-4 ml-11">
              This information appears in the Jobs Feed for everyone to see:
            </p>
            <div className="ml-11 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <FileText className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Title</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">e.g., "Wedding Photography & Video"</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <FileText className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Description</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Brief overview of the project</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Location</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Where the work takes place</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Event Dates</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Start and end dates</p>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-[#E03131] text-white flex items-center justify-center font-bold">2</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add Roles</h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-4 ml-11">
              Define the specific roles you're hiring for. Each role has its own budget and can receive separate applications.
            </p>
            <div className="ml-11 space-y-3">
              <div className="flex items-center gap-3 p-4 border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
                <div>
                  <p className="font-medium text-purple-900 dark:text-purple-300">Freelancer Roles</p>
                  <p className="text-sm text-purple-700 dark:text-purple-400">DJ, photographer, performer, makeup artist, etc.</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <Building2 className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-medium text-green-900 dark:text-green-300">Venue Roles</p>
                  <p className="text-sm text-green-700 dark:text-green-400">Event space, studio, gallery, outdoor venue, etc.</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <Package className="w-6 h-6 text-orange-600" />
                <div>
                  <p className="font-medium text-orange-900 dark:text-orange-300">Vendor Roles</p>
                  <p className="text-sm text-orange-700 dark:text-orange-400">Catering, AV equipment, decor, lighting rental, etc.</p>
                </div>
              </div>
            </div>
            <div className="ml-11 mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>For each role, you'll specify:</strong>
              </p>
              <ul className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>• Role title (e.g., "Lead Photographer")</li>
                <li>• Role type (Freelancer, Venue, or Vendor)</li>
                <li>• Description of responsibilities</li>
                <li>• Budget for this role</li>
                <li>• How many positions needed (e.g., 2 bartenders)</li>
              </ul>
            </div>
          </div>

          {/* Step 3 */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-[#E03131] text-white flex items-center justify-center font-bold">3</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Workspace Details (Private)</h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-4 ml-11">
              This information is only visible to team members you accept:
            </p>
            <div className="ml-11 space-y-2 text-gray-700 dark:text-gray-300">
              <p>• <strong>Detailed brief:</strong> Full project requirements and expectations</p>
              <p>• <strong>Schedule notes:</strong> Call times, setup requirements, timelines</p>
              <p>• <strong>Venue details:</strong> Address, parking, load-in info</p>
              <p>• <strong>Contact info:</strong> Who to reach for questions</p>
              <p>• <strong>Requirements:</strong> Equipment, dress code, certifications needed</p>
            </div>
          </div>

          {/* Step 4 */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-[#E03131] text-white flex items-center justify-center font-bold">4</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Review & Post</h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300 ml-11">
              Review all details, then post your job. It will immediately appear in the Jobs Feed and your Studio.
            </p>
          </div>
        </section>

        {/* Managing Applications */}
        <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Managing Applications</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            Once your job is posted, you'll start receiving applications. Here's how to manage them:
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <Eye className="w-6 h-6 text-blue-500 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">View Applications</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Go to Studio → click on your job → "View Applicants" to see everyone who applied, organized by role.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <Eye className="w-6 h-6 text-purple-500 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Review Portfolios</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Click "View Portfolio" on any applicant to see their work, skills, and reviews before deciding.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <MessageCircle className="w-6 h-6 text-indigo-500 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Message Applicants</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Have questions? Click "Message" to start a conversation with job context automatically included.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <UserCheck className="w-6 h-6 text-green-500 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-green-900 dark:text-green-300">Accept Applicant</h4>
                <p className="text-sm text-green-700 dark:text-green-400">
                  Click "Accept" to add them to your team. They'll gain access to the workspace and private project details.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <UserX className="w-6 h-6 text-red-500 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-red-900 dark:text-red-300">Reject Applicant</h4>
                <p className="text-sm text-red-700 dark:text-red-400">
                  Click "Reject" if they're not the right fit. They'll be notified politely and can apply to other jobs.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Job Statuses */}
        <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Job Statuses Explained</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobStatuses.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${item.color}`}>
                  {item.status}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">{item.description}</span>
              </div>
            ))}
          </div>
        </section>

        {/* After Posting */}
        <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">After Your Job is Posted</h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <p><strong>Jobs Feed:</strong> Your job appears in the public Jobs Feed for everyone to discover</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <p><strong>Studio:</strong> Your job appears in your Studio with the "Organizer" badge</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <p><strong>Notifications:</strong> You'll be notified when new applications come in</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <p><strong>Workspace:</strong> Once you accept team members, collaborate using the job workspace</p>
            </div>
          </div>
        </section>

        {/* Subscription Limits Note */}
        <section className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-amber-900 dark:text-amber-300 mb-2">Subscription Limits</h3>
              <p className="text-amber-800 dark:text-amber-400 text-sm">
                Your subscription tier determines how many active jobs you can have:
              </p>
              <ul className="mt-2 text-sm text-amber-700 dark:text-amber-400 space-y-1">
                <li>• <strong>Free:</strong> 1 active job at a time</li>
                <li>• <strong>Lite:</strong> 3 active jobs at a time</li>
                <li>• <strong>Pro:</strong> Unlimited active jobs</li>
              </ul>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 border-amber-300 text-amber-700 hover:bg-amber-100"
                onClick={() => navigate('/help/subscriptions')}
              >
                Learn about subscriptions
              </Button>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-[#E03131]/10 to-[#E03131]/5 dark:from-[#E03131]/20 dark:to-[#E03131]/10 border border-[#E03131]/20 rounded-xl">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Ready to find talent?</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Post your first job and start receiving applications</p>
          </div>
          <Button onClick={() => navigate('/jobs/create')}>
            <Briefcase className="w-4 h-4 mr-2" />
            Post a Job
          </Button>
        </div>

        {/* Related Articles */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Related Articles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/help/studio')}
              className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-[#E03131] transition-colors group"
            >
              <div className="flex items-center gap-3">
                <FolderOpen className="w-5 h-5 text-amber-500" />
                <span className="text-gray-900 dark:text-white">Understanding Studio</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#E03131]" />
            </button>
            <button
              onClick={() => navigate('/help/applying-jobs')}
              className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-[#E03131] transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-blue-500" />
                <span className="text-gray-900 dark:text-white">Applying to Jobs</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#E03131]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PostingJobsGuidePage
