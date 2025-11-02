import React from 'react'
import { Bell } from 'lucide-react'

const NotificationsPage = () => {
  return (
    <div className="p-8 bg-app dark:bg-[#0B0B0B]">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-8 h-8 stroke-current dark:text-white" />
          <h1 className="text-3xl font-bold text-app dark:text-white">Notifications</h1>
        </div>
        
        <div className="bg-surface dark:bg-[#111315] border border-app dark:border-[#1F1F1F] text-app rounded-2xl p-8 text-center">
          <Bell className="w-16 h-16 mx-auto mb-4 text-muted dark:text-white" />
          <h2 className="text-xl font-semibold mb-2 dark:text-white">No notifications yet</h2>
          <p className="text-muted dark:text-[#B3B3B3]">
            When you get notifications, they'll show up here
          </p>
        </div>
      </div>
    </div>
  )
}

export default NotificationsPage
