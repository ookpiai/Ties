/**
 * CALENDAR PAGE
 * Dedicated calendar page with full features
 * Uses CalendarView component with additional stats and controls
 */

import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Calendar as CalendarIcon,
  Plus,
  Lock,
  Briefcase,
  Users,
  DollarSign,
  AlertCircle
} from 'lucide-react'
import { useAuth } from '../../App'
import { getBookings } from '../../api/bookings'
import { getMyJobs, getAppliedJobs } from '../../api/jobs'
import { getPendingRequests } from '../../api/availabilityRequests'
import { createCalendarBlock } from '../../api/calendarUnified'
import CalendarView from './CalendarView'
import DateRangeBlockModal from './DateRangeBlockModal'
import AvailabilityRequestsPanel from './AvailabilityRequestsPanel'

const CalendarPage = () => {
  const { user } = useAuth()

  // Data for stats
  const [bookings, setBookings] = useState([])
  const [jobs, setJobs] = useState([])
  const [appliedJobs, setAppliedJobs] = useState([])
  const [availabilityRequests, setAvailabilityRequests] = useState([])

  // Modal state
  const [showBlockModal, setShowBlockModal] = useState(false)
  const [isBlockingDates, setIsBlockingDates] = useState(false)

  // Load data for stats
  useEffect(() => {
    if (user?.id) {
      loadStatsData()
    }
  }, [user?.id])

  const loadStatsData = async () => {
    try {
      const [bookingsData, jobsData, appliedJobsData, requestsData] = await Promise.all([
        getBookings(user.id, 'both').catch(() => []),
        getMyJobs().catch(() => []),
        getAppliedJobs().catch(() => []),
        getPendingRequests(user.id).catch(() => [])
      ])

      setBookings(bookingsData || [])
      setJobs(jobsData || [])
      setAppliedJobs(appliedJobsData || [])
      setAvailabilityRequests(requestsData || [])
    } catch (err) {
      console.error('Failed to load stats:', err)
    }
  }

  // Handle block dates
  const handleBlockDates = async (blockData) => {
    setIsBlockingDates(true)
    try {
      await createCalendarBlock({
        start_date: blockData.startDate,
        end_date: blockData.endDate,
        reason: 'manual',
        visibility_message: blockData.visibilityMessage,
        notes: blockData.notes,
        timezone: blockData.timezone,
        is_recurring: blockData.isRecurring,
        recurrence_pattern: blockData.recurrencePattern
      })
      setShowBlockModal(false)
    } catch (err) {
      console.error('Failed to block dates:', err)
    } finally {
      setIsBlockingDates(false)
    }
  }

  // Stats calculation
  const stats = useMemo(() => {
    const now = new Date()
    const upcomingBookings = bookings.filter(b =>
      ['pending', 'accepted', 'confirmed'].includes(b.status) &&
      new Date(b.start_date) >= now
    )
    const activeJobs = jobs.filter(j => j.status === 'open')
    const pendingApplications = appliedJobs.filter(a => a.status === 'pending')

    return {
      upcomingBookings: upcomingBookings.length,
      activeJobs: activeJobs.length,
      pendingApplications: pendingApplications.length,
      availabilityRequests: availabilityRequests.length,
      totalRevenue: upcomingBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0)
    }
  }, [bookings, jobs, appliedJobs, availabilityRequests])

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <CalendarIcon className="w-8 h-8 text-primary" />
            Calendar
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your schedule, bookings, and jobs
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowBlockModal(true)}
          >
            <Lock className="w-4 h-4 mr-2" />
            Block Dates
          </Button>
          <Link to="/jobs/create">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Job
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                <CalendarIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.upcomingBookings}</p>
                <p className="text-xs text-muted-foreground">Upcoming Bookings</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.activeJobs}</p>
                <p className="text-xs text-muted-foreground">Active Jobs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/20 border-cyan-200 dark:border-cyan-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pendingApplications}</p>
                <p className="text-xs text-muted-foreground">Pending Apps</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-200 dark:border-amber-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.availabilityRequests}</p>
                <p className="text-xs text-muted-foreground">Avail. Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Expected Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar Card */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <CalendarView
            showJobIntegration={true}
            showStats={false}
            onBlockDates={() => setShowBlockModal(true)}
          />
        </CardContent>
      </Card>

      {/* Availability Requests Section */}
      {availabilityRequests.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              Availability Requests
              <Badge variant="secondary">{availabilityRequests.length}</Badge>
            </h3>
            <AvailabilityRequestsPanel onRequestsChange={() => loadStatsData()} />
          </CardContent>
        </Card>
      )}

      {/* Block Dates Modal */}
      <DateRangeBlockModal
        isOpen={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        onConfirm={handleBlockDates}
        isLoading={isBlockingDates}
      />
    </div>
  )
}

export default CalendarPage
