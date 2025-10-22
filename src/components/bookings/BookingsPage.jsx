import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '../../App'
import { 
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  Users,
  Briefcase,
  Plus,
  Search,
  Filter,
  Eye,
  MessageCircle,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  Edit,
  Trash2,
  Download,
  Upload,
  FileText,
  Camera,
  Music,
  Palette,
  Video,
  Mic,
  Building,
  Package,
  ChevronDown,
  MoreVertical,
  ArrowRight,
  Heart,
  Bookmark
} from 'lucide-react'

const BookingsPage = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('my-bookings')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showCreateJob, setShowCreateJob] = useState(false)

  // Mock bookings data
  const [bookings, setBookings] = useState([
    {
      id: 1,
      type: 'booking',
      title: 'Brand Identity Design',
      client: { id: 2, name: 'TechStart Inc.', avatar: null },
      freelancer: { id: 3, name: 'Sarah Chen', avatar: null, role: 'freelancer' },
      status: 'confirmed',
      startDate: '2024-01-25T09:00:00Z',
      endDate: '2024-02-15T17:00:00Z',
      budget: 3500,
      location: 'Remote',
      description: 'Complete brand identity package including logo, color palette, and brand guidelines for a sustainable fashion startup.',
      category: 'design',
      skills: ['UI Design', 'Branding', 'Figma'],
      createdAt: '2024-01-20T10:00:00Z',
      lastUpdate: '2024-01-22T14:30:00Z'
    },
    {
      id: 2,
      type: 'booking',
      title: 'Product Launch Video',
      client: { id: 1, name: user?.first_name + ' ' + user?.last_name, avatar: null },
      freelancer: { id: 4, name: 'Marcus Rodriguez', avatar: null, role: 'freelancer' },
      status: 'in-progress',
      startDate: '2024-01-22T10:00:00Z',
      endDate: '2024-02-05T18:00:00Z',
      budget: 2800,
      location: 'Manchester, UK',
      description: '60-90 second product launch video showcasing app features with professional editing and motion graphics.',
      category: 'video',
      skills: ['Video Production', 'After Effects', 'Premiere Pro'],
      createdAt: '2024-01-18T15:20:00Z',
      lastUpdate: '2024-01-23T11:45:00Z'
    },
    {
      id: 3,
      type: 'booking',
      title: 'Creative Conference 2024',
      client: { id: 5, name: 'Emma Thompson', avatar: null },
      freelancer: { id: 6, name: 'The Creative Collective', avatar: null, role: 'collective' },
      status: 'pending',
      startDate: '2024-03-15T08:00:00Z',
      endDate: '2024-03-17T20:00:00Z',
      budget: 15000,
      location: 'London, UK',
      description: 'Full event production for 3-day creative industry conference including venue setup, AV equipment, and coordination.',
      category: 'events',
      skills: ['Event Planning', 'Project Management', 'Vendor Coordination'],
      createdAt: '2024-01-19T09:20:00Z',
      lastUpdate: '2024-01-21T16:10:00Z'
    }
  ])

  // Mock job postings
  const [jobs, setJobs] = useState([
    {
      id: 101,
      type: 'job',
      title: 'Senior UX Designer for FinTech App',
      company: { id: 7, name: 'FinanceFlow Ltd', avatar: null },
      status: 'open',
      budget: { min: 4000, max: 6000, type: 'project' },
      duration: '6-8 weeks',
      location: 'Remote (UK timezone)',
      description: 'We\'re looking for an experienced UX designer to redesign our mobile banking app. You\'ll work closely with our product team to create intuitive user flows and modern interface designs.',
      requirements: [
        '5+ years UX design experience',
        'Experience with financial/banking apps',
        'Proficiency in Figma and Sketch',
        'Strong portfolio of mobile app designs'
      ],
      category: 'design',
      skills: ['UX Design', 'Mobile Design', 'Figma', 'User Research'],
      applicants: 12,
      postedAt: '2024-01-20T08:00:00Z',
      deadline: '2024-02-05T23:59:59Z',
      featured: true
    },
    {
      id: 102,
      type: 'job',
      title: 'Wedding Photographer - Luxury Venue',
      company: { id: 8, name: 'Riverside Manor', avatar: null },
      status: 'open',
      budget: { min: 1200, max: 1800, type: 'day' },
      duration: '1 day',
      location: 'Cotswolds, UK',
      description: 'Seeking a professional wedding photographer for a luxury wedding at our historic manor. Must have experience with high-end weddings and provide full-day coverage.',
      requirements: [
        'Professional wedding photography experience',
        'Own professional equipment',
        'Portfolio of luxury weddings',
        'Available March 23rd, 2024'
      ],
      category: 'photography',
      skills: ['Wedding Photography', 'Portrait Photography', 'Photo Editing'],
      applicants: 8,
      postedAt: '2024-01-19T14:30:00Z',
      deadline: '2024-02-01T23:59:59Z',
      featured: false
    },
    {
      id: 103,
      type: 'job',
      title: 'Music Producer for Indie Album',
      company: { id: 9, name: 'Moonlight Records', avatar: null },
      status: 'open',
      budget: { min: 3000, max: 5000, type: 'project' },
      duration: '4-6 weeks',
      location: 'London, UK',
      description: 'Independent record label seeking a talented music producer for an upcoming indie rock album. 10 tracks, need mixing and mastering.',
      requirements: [
        'Experience producing indie/alternative music',
        'Access to professional studio',
        'Portfolio of previous work',
        'Knowledge of modern production techniques'
      ],
      category: 'music',
      skills: ['Music Production', 'Mixing', 'Mastering', 'Pro Tools'],
      applicants: 15,
      postedAt: '2024-01-18T11:15:00Z',
      deadline: '2024-01-30T23:59:59Z',
      featured: true
    },
    {
      id: 104,
      type: 'job',
      title: 'Event Venue for Tech Meetup',
      company: { id: 10, name: 'DevCommunity London', avatar: null },
      status: 'open',
      budget: { min: 500, max: 800, type: 'day' },
      duration: '1 evening',
      location: 'Central London',
      description: 'Looking for a modern venue to host our monthly tech meetup. Need space for 80-100 people with AV equipment and catering facilities.',
      requirements: [
        'Capacity for 80-100 people',
        'AV equipment included',
        'Central London location',
        'Available February 15th evening'
      ],
      category: 'venues',
      skills: ['Event Space', 'AV Equipment', 'Catering Facilities'],
      applicants: 5,
      postedAt: '2024-01-21T16:45:00Z',
      deadline: '2024-02-10T23:59:59Z',
      featured: false
    }
  ])

  // Get category icon
  const getCategoryIcon = (category) => {
    const icons = {
      design: Palette,
      video: Video,
      photography: Camera,
      music: Music,
      events: Calendar,
      venues: Building,
      development: Package,
      marketing: Briefcase
    }
    const Icon = icons[category] || Briefcase
    return <Icon className="w-4 h-4" />
  }

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      confirmed: 'bg-green-100 text-green-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
      open: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    })
  }

  // Format budget
  const formatBudget = (budget) => {
    if (typeof budget === 'number') {
      return `£${budget.toLocaleString()}`
    }
    if (budget.min && budget.max) {
      return `£${budget.min.toLocaleString()} - £${budget.max.toLocaleString()}${budget.type ? `/${budget.type}` : ''}`
    }
    return 'Budget TBD'
  }

  // Filter data based on search and category
  const filterData = (data) => {
    return data.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
      
      return matchesSearch && matchesCategory
    })
  }

  const filteredBookings = filterData(bookings)
  const filteredJobs = filterData(jobs)

  return (
    <div className="min-h-screen bg-app text-app transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Bookings & Jobs</h1>
          <p className="text-slate-600 dark:text-slate-300 mt-1">
            Manage your bookings and discover new opportunities
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-slate-200 dark:border-slate-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('my-bookings')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'my-bookings'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                My Bookings
              </button>
              <button
                onClick={() => setActiveTab('job-board')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'job-board'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                Job Board
              </button>
              <button
                onClick={() => setActiveTab('my-jobs')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'my-jobs'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                My Job Posts
              </button>
            </nav>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, skills, or description..."
              className="pl-9"
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            <option value="design">Design</option>
            <option value="video">Video</option>
            <option value="photography">Photography</option>
            <option value="music">Music</option>
            <option value="events">Events</option>
            <option value="venues">Venues</option>
            <option value="development">Development</option>
            <option value="marketing">Marketing</option>
          </select>

          {activeTab === 'my-jobs' && (
            <Button onClick={() => setShowCreateJob(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Post Job
            </Button>
          )}
        </div>

        {/* Content */}
        {activeTab === 'my-bookings' && (
          <div className="space-y-6">
            <div className="grid gap-6">
              {filteredBookings.length > 0 ? (
                filteredBookings.map((booking) => (
                  <Card key={booking.id} className="hover:shadow-md transition-shadow bg-surface border border-app text-app rounded-2xl">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="flex items-center space-x-2">
                              {getCategoryIcon(booking.category)}
                              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                {booking.title}
                              </h3>
                            </div>
                            <Badge className={getStatusColor(booking.status)}>
                              {booking.status.replace('-', ' ')}
                            </Badge>
                            {booking.featured && (
                              <Badge className="bg-yellow-100 text-yellow-800">
                                Featured
                              </Badge>
                            )}
                          </div>

                          <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div className="space-y-2">
                              <div className="flex items-center text-sm text-slate-600 dark:text-white">
                                <Users className="w-4 h-4 mr-2" />
                                <span>Client: {booking.client.name}</span>
                              </div>
                              <div className="flex items-center text-sm text-slate-600 dark:text-white">
                                <Briefcase className="w-4 h-4 mr-2" />
                                <span>Freelancer: {booking.freelancer.name}</span>
                              </div>
                              <div className="flex items-center text-sm text-slate-600 dark:text-white">
                                <MapPin className="w-4 h-4 mr-2" />
                                <span>{booking.location}</span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center text-sm text-slate-600 dark:text-white">
                                <Calendar className="w-4 h-4 mr-2" />
                                <span>{formatDate(booking.startDate)} - {formatDate(booking.endDate)}</span>
                              </div>
                              <div className="flex items-center text-sm text-slate-600 dark:text-white">
                                <DollarSign className="w-4 h-4 mr-2" />
                                <span>{formatBudget(booking.budget)}</span>
                              </div>
                              <div className="flex items-center text-sm text-slate-600 dark:text-white">
                                <Clock className="w-4 h-4 mr-2" />
                                <span>Updated {formatDate(booking.lastUpdate)}</span>
                              </div>
                            </div>
                          </div>

                          <p className="text-slate-700 dark:text-white/80 mb-4">{booking.description}</p>

                          <div className="flex flex-wrap gap-2 mb-4">
                            {booking.skills.map((skill, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-col space-y-2 ml-4">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                          <Button size="sm" variant="outline">
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Message
                          </Button>
                          <Button size="sm" variant="outline">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No bookings found
                    </h3>
                    <p className="text-gray-600">
                      {searchQuery || selectedCategory !== 'all' 
                        ? 'Try adjusting your search or filters'
                        : 'Your bookings will appear here once you start working on projects'
                      }
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {activeTab === 'job-board' && (
          <div className="space-y-6">
            <div className="grid gap-6">
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job) => (
                  <Card key={job.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="flex items-center space-x-2">
                              {getCategoryIcon(job.category)}
                              <h3 className="text-lg font-semibold text-gray-900">
                                {job.title}
                              </h3>
                            </div>
                            <Badge className={getStatusColor(job.status)}>
                              {job.status}
                            </Badge>
                            {job.featured && (
                              <Badge className="bg-yellow-100 text-yellow-800">
                                Featured
                              </Badge>
                            )}
                          </div>

                          <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div className="space-y-2">
                              <div className="flex items-center text-sm text-gray-600">
                                <Building className="w-4 h-4 mr-2" />
                                <span>{job.company.name}</span>
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <MapPin className="w-4 h-4 mr-2" />
                                <span>{job.location}</span>
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <Clock className="w-4 h-4 mr-2" />
                                <span>{job.duration}</span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center text-sm text-gray-600">
                                <DollarSign className="w-4 h-4 mr-2" />
                                <span>{formatBudget(job.budget)}</span>
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <Users className="w-4 h-4 mr-2" />
                                <span>{job.applicants} applicants</span>
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <Calendar className="w-4 h-4 mr-2" />
                                <span>Deadline: {formatDate(job.deadline)}</span>
                              </div>
                            </div>
                          </div>

                          <p className="text-gray-700 mb-4">{job.description}</p>

                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Requirements:</h4>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {job.requirements.map((req, index) => (
                                <li key={index} className="flex items-start">
                                  <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                  {req}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="flex flex-wrap gap-2 mb-4">
                            {job.skills.map((skill, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-col space-y-2 ml-4">
                          <Button size="sm">
                            <ArrowRight className="w-4 h-4 mr-2" />
                            Apply Now
                          </Button>
                          <Button size="sm" variant="outline">
                            <Bookmark className="w-4 h-4 mr-2" />
                            Save
                          </Button>
                          <Button size="sm" variant="outline">
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Ask Question
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No jobs found
                    </h3>
                    <p className="text-gray-600">
                      {searchQuery || selectedCategory !== 'all' 
                        ? 'Try adjusting your search or filters'
                        : 'New job opportunities will appear here'
                      }
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {activeTab === 'my-jobs' && (
          <div className="space-y-6">
            <Card>
              <CardContent className="text-center py-12">
                <Plus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No job posts yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Start posting jobs to find the perfect creative professionals for your projects
                </p>
                <Button onClick={() => setShowCreateJob(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Post Your First Job
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

export default BookingsPage

