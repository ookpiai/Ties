import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import AvailabilityCalendar from '../calendar/AvailabilityCalendar'
import BookNowButton from '../bookings/BookNowButton'
import ServicesPage from './ServicesPage'
import {
  User,
  MapPin,
  Mail,
  Phone,
  Globe,
  Instagram,
  Twitter,
  Linkedin,
  Star,
  DollarSign,
  Calendar,
  Users,
  Briefcase,
  Award,
  Eye,
  MessageCircle,
  Loader2,
  ArrowLeft,
  Package
} from 'lucide-react'
import { getProfile } from '../../api/profiles'
import { sendMessage } from '../../api/messages'
import { useAuth } from '../../App'

const PublicProfileView = () => {
  const { userId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isMessaging, setIsMessaging] = useState(false)

  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (!userId) return

      setIsLoading(true)
      setError('')

      try {
        const profileData = await getProfile(userId)
        setProfile(profileData)
      } catch (err) {
        console.error('Failed to load profile:', err)
        setError('Profile not found or failed to load.')
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [userId])

  const getInitials = () => {
    if (!profile?.display_name) return '??'
    const names = profile.display_name.split(' ')
    if (names.length >= 2) {
      return `${names[0].charAt(0)}${names[1].charAt(0)}`.toUpperCase()
    }
    return profile.display_name.substring(0, 2).toUpperCase()
  }

  const getRoleIcon = (role) => {
    const roleMap = {
      'Freelancer': Briefcase,
      'Vendor': Package,
      'Venue': MapPin,
      'Organiser': Calendar,
      // Legacy role support
      'Artist': Briefcase,
      'Crew': Users
    }
    return roleMap[role] || User
  }

  const handleMessageClick = () => {
    // Navigate to messages page with this user pre-selected
    navigate('/messages', { state: { openConversationWithUserId: userId } })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-app dark:bg-[#0B0B0B] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2">Loading profile...</span>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-app dark:bg-[#0B0B0B] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Profile Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'This profile does not exist.'}</p>
          <Button onClick={() => navigate('/discover')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Discovery
          </Button>
        </div>
      </div>
    )
  }

  const RoleIcon = getRoleIcon(profile.role)

  return (
    <div className="min-h-screen bg-app dark:bg-[#0B0B0B] text-app transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 dark:bg-[#0B0B0B]">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                {profile.display_name || 'Anonymous User'}
              </h1>
              <div className="flex items-center mt-2 text-slate-600 dark:text-slate-300">
                <RoleIcon className="w-5 h-5 mr-2" />
                <span className="capitalize">{profile.role || 'User'}</span>
              </div>
            </div>
            <div className="flex space-x-2">
              {user?.id !== profile.id && (
                <Button onClick={handleMessageClick}>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Message
                </Button>
              )}
              <BookNowButton
                freelancerId={profile.id}
                freelancerName={profile.display_name || profile.full_name}
                hourlyRate={profile.hourly_rate}
                dailyRate={profile.daily_rate}
                isOwnProfile={user?.id === profile.id}
              />
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="availability">Availability</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Profile Card */}
              <Card className="lg:col-span-1 bg-surface border border-app text-app rounded-2xl">
                <CardContent className="p-6">
                  <div className="text-center">
                    <Avatar className="w-24 h-24 mx-auto">
                      <AvatarImage src={profile.avatar_url || "/placeholder-avatar.jpg"} />
                      <AvatarFallback className="text-lg">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="mt-4">
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                        {profile.display_name || 'Anonymous'}
                      </h3>
                      <p className="text-slate-600 dark:text-white/80 capitalize mt-1">
                        {profile.role}
                      </p>
                      {profile.city && (
                        <div className="flex items-center justify-center mt-2 text-slate-500 dark:text-white/60">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span className="text-sm">{profile.city}</span>
                        </div>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-primary">0</div>
                        <div className="text-xs text-slate-600 dark:text-white/60">Projects</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-primary">0</div>
                        <div className="text-xs text-slate-600 dark:text-white/60">Reviews</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-primary">
                          <Star className="w-4 h-4 inline" /> N/A
                        </div>
                        <div className="text-xs text-slate-600 dark:text-white/60">Rating</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Bio and Details */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="bg-surface border border-app text-app rounded-2xl">
                  <CardHeader>
                    <CardTitle>About</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 dark:text-white/80">
                      {profile.bio || 'No bio available.'}
                    </p>
                  </CardContent>
                </Card>

                {/* Member Since */}
                <Card className="bg-surface border border-app text-app rounded-2xl">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Calendar className="w-5 h-5 text-gray-500 mr-2" />
                        <span className="text-sm text-gray-600">Member Since</span>
                      </div>
                      <span className="text-sm font-medium">
                        {new Date(profile.created_at).toLocaleDateString('en-US', {
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio">
            <Card className="bg-surface border border-app text-app rounded-2xl">
              <CardHeader>
                <CardTitle>Portfolio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No portfolio items yet
                  </h3>
                  <p className="text-gray-600">
                    This user hasn't added any portfolio items.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services">
            <ServicesPage userId={userId} isOwnProfile={false} />
          </TabsContent>

          {/* Availability Tab */}
          <TabsContent value="availability">
            <AvailabilityCalendar
              userId={userId}
              isOwnProfile={false}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default PublicProfileView
