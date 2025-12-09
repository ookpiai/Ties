/**
 * MESSAGING GUIDE
 *
 * How messaging and communication works on TIES
 */

import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  MessageCircle,
  MessageSquare,
  Send,
  Search,
  Users,
  Briefcase,
  Bell,
  CheckCheck,
  Clock,
  Lightbulb,
  Info
} from 'lucide-react'
import { Button } from '../ui/button'

const MessagingGuidePage = () => {
  const navigate = useNavigate()

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
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
              <MessageCircle className="w-8 h-8 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Messages & Communication</h1>
              <p className="text-gray-600 dark:text-gray-400">Connect with clients, collaborators, and team members</p>
            </div>
          </div>
        </div>

        {/* Overview */}
        <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Overview</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            TIES includes a built-in messaging system so you can communicate with other users without sharing personal contact
            information. All conversations are stored securely and accessible from any device.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <strong>Pro tip:</strong> When messaging about a specific job, the job context is automatically included
                so both parties know exactly what you're discussing.
              </p>
            </div>
          </div>
        </section>

        {/* Starting a Conversation */}
        <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Starting a Conversation</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            There are several ways to start a conversation on TIES:
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">From a Profile</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Visit any user's profile and click the "Message" button to start a conversation.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Briefcase className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">From Job Applicants</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  When reviewing applicants, click "Message" to discuss the job. The job details are automatically attached.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Search className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">From Messages Page</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Go to Messages, click "New Message", and search for the user you want to contact.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Job Context */}
        <section id="job-context" className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Job Context in Messages</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            When you message someone about a specific job, TIES automatically includes context:
          </p>

          <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="w-4 h-4 text-indigo-600" />
              <span className="font-medium text-indigo-900 dark:text-indigo-300">Example Job Context</span>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-sm">
              <p className="font-medium text-gray-900 dark:text-white">Re: Wedding Photography & Video</p>
              <p className="text-gray-600 dark:text-gray-400">Sydney, NSW • Dec 15, 2024</p>
            </div>
          </div>

          <p className="text-gray-700 dark:text-gray-300">
            This helps keep conversations organized and ensures both parties know exactly which project you're discussing,
            especially useful when you're working on multiple jobs.
          </p>
        </section>

        {/* Managing Conversations */}
        <section id="managing" className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Managing Conversations</h2>

          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-gray-400" />
                Conversation List
              </h4>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Your Messages page shows all conversations with the most recent at the top. Each conversation displays
                a preview of the last message and the sender's name and avatar.
              </p>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <Search className="w-5 h-5 text-gray-400" />
                Search Messages
              </h4>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Use the search bar to find specific conversations or messages. Search by user name or message content.
              </p>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <CheckCheck className="w-5 h-5 text-gray-400" />
                Read Status
              </h4>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Messages show read status so you know when the recipient has seen your message.
              </p>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <Bell className="w-5 h-5 text-gray-400" />
                Notifications
              </h4>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                You'll receive notifications for new messages. Configure your notification preferences in Settings to control
                how you're alerted.
              </p>
            </div>
          </div>
        </section>

        {/* Best Practices */}
        <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Messaging Best Practices</h2>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 text-sm font-bold">✓</span>
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Be Professional</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Keep messages professional and courteous. First impressions matter!
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 text-sm font-bold">✓</span>
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Respond Promptly</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Quick responses show reliability. Aim to reply within 24 hours.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 text-sm font-bold">✓</span>
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Be Clear and Specific</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Include relevant details like dates, rates, and requirements upfront.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 text-sm font-bold">✓</span>
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Keep Records on Platform</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Use TIES messaging for project discussions to maintain a record of agreements.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/20 dark:to-purple-500/20 border border-indigo-200 dark:border-indigo-800 rounded-xl">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Ready to connect?</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Start conversations with clients and collaborators</p>
          </div>
          <Button onClick={() => navigate('/messages')}>
            <MessageCircle className="w-4 h-4 mr-2" />
            Go to Messages
          </Button>
        </div>

        {/* Related Articles */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Related Articles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/help/notifications')}
              className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-[#E03131] transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-amber-500" />
                <span className="text-gray-900 dark:text-white">Notification Settings</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#E03131]" />
            </button>
            <button
              onClick={() => navigate('/help/posting-jobs')}
              className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-[#E03131] transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Briefcase className="w-5 h-5 text-purple-500" />
                <span className="text-gray-900 dark:text-white">Posting Jobs</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#E03131]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MessagingGuidePage
