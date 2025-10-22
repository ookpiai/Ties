import React from 'react'
import { Bug } from 'lucide-react'

const ReportPage = () => {
  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Bug className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Report a Problem</h1>
        </div>
        
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-8">
          <form className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                What's the issue?
              </label>
              <input
                type="text"
                placeholder="Brief description of the problem"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg 
                  bg-white dark:bg-gray-800 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Details
              </label>
              <textarea
                rows="6"
                placeholder="Please provide as much detail as possible..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg 
                  bg-white dark:bg-gray-800 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            
            <button
              type="submit"
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
            >
              Submit Report
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ReportPage
