import React from 'react'
import { PlusCircle } from 'lucide-react'

const CreatePage = () => {
  return (
    <div className="p-8 bg-app dark:bg-[#0B0B0B]">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <PlusCircle className="w-8 h-8 stroke-current dark:text-white" />
          <h1 className="text-3xl font-bold text-app dark:text-white">Create</h1>
        </div>
        
        <div className="bg-surface dark:bg-[#111315] border border-app dark:border-[#1F1F1F] text-app rounded-2xl p-8 text-center">
          <PlusCircle className="w-16 h-16 mx-auto mb-4 text-muted dark:text-white" />
          <h2 className="text-xl font-semibold mb-2 dark:text-white">Create something new</h2>
          <p className="text-muted dark:text-[#B3B3B3] mb-6">
            Start a new project, booking, or collaboration
          </p>
          <div className="flex gap-4 justify-center">
            <button className="px-6 py-3 btn-primary focus-ring rounded-lg font-medium transition-colors">
              New Project
            </button>
            <button className="px-6 py-3 bg-surface-2 text-app border border-app hover:bg-surface focus-ring rounded-lg font-medium transition-colors">
              New Booking
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreatePage
