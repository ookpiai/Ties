/**
 * Public Profile View - Premium Edition
 *
 * Enhanced public profile display inspired by:
 * - Fiverr (seller profiles, packages)
 * - Upwork (skills, success score)
 * - Dribbble (portfolio showcase)
 * - BookEntertainment.co.uk (performer profiles)
 */

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import AvailabilityCalendar from '../calendar/AvailabilityCalendar'
import BookNowButton from '../bookings/BookNowButton'
import CheckAvailabilityButton from '../bookings/CheckAvailabilityButton'
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
  Youtube,
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
  Package,
  CheckCircle,
  Clock,
  ThumbsUp,
  Languages,
  Share2,
  Copy,
  Check,
  ShieldCheck,
  UserCheck,
} from 'lucide-react'
import { getProfile } from '../../api/profiles'
import { useAuth } from '../../App'
import { PortfolioGallery } from './portfolio'
import { ServicePackagesDisplay } from './packages'
import { SkillsCard, SkillsRow } from './skills'
import { BadgeRow, TopBadge, BadgeGrid } from './badges'
import { RatingDisplay, MemberSinceBadge, StatsCardsGrid } from './stats'
import { getPortfolioItems } from '../../api/portfolio'
import { getUserSkills } from '../../api/skills'
import { getUserBadges } from '../../api/badges'
import { getServicePackages } from '../../api/servicePackages'
import { getProfileStats, getPublicStats, recordProfileView } from '../../api/profileStats'
import JobOfferComposer from '../messages/JobOfferComposer'
import { FileText } from 'lucide-react'

const PublicProfileView = () => {
  const { userId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  // Premium features data
  const [portfolio, setPortfolio] = useState([])
  const [skills, setSkills] = useState([])
  const [badges, setBadges] = useState([])
  const [packages, setPackages] = useState([])
  const [stats, setStats] = useState(null)
  const [showJobOfferComposer, setShowJobOfferComposer] = useState(false)


  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (!userId) return

      setIsLoading(true)
      setError('')

      try {
        const profileData = await getProfile(userId)
        setProfile(profileData)

        // Record profile view (if not own profile)
        if (user?.id && user.id !== userId) {
          recordProfileView(userId, user.id).catch(() => {})
        }

        // Load premium features in parallel
        const [portfolioData, skillsData, badgesData, packagesData, statsData] = await Promise.all([
          getPortfolioItems(userId).catch(() => []),
          getUserSkills(userId).catch(() => []),
          getUserBadges(userId).catch(() => []),
          getServicePackages(userId).catch(() => []),
          getProfileStats(userId).catch(() => null),
        ])

        setPortfolio(portfolioData)
        setSkills(skillsData)
        setBadges(badgesData)
        setPackages(packagesData)
        setStats(statsData)
      } catch (err) {
        console.error('Failed to load profile:', err)
        setError('Profile not found or failed to load.')
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [userId, user?.id])

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
      'Artist': Briefcase,
      'Crew': Users
    }
    return roleMap[role] || User
  }

  const handleMessageClick = () => {
    navigate('/messages', { state: { openConversationWithUserId: userId } })
  }

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.display_name} on TIES Together`,
          text: profile.headline || profile.bio,
          url,
        })
      } catch (err) {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
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
  const publicStats = getPublicStats(stats)
  const isOwnProfile = user?.id === profile.id

  return (
    <div className="min-h-screen bg-app dark:bg-[#0B0B0B] text-app transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button variant="outline" size="sm" onClick={handleShare}>
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2 text-green-600" />
                Copied!
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </>
            )}
          </Button>
        </div>

        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Avatar & Badges */}
            <div className="relative">
              <Avatar className="w-28 h-28 border-4 border-white shadow-lg">
                <AvatarImage src={profile.avatar_url || "/placeholder-avatar.jpg"} />
                <AvatarFallback className="text-2xl">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <TopBadge userId={userId} className="absolute -bottom-2 -right-2" />
            </div>

            {/* Name & Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                      {profile.display_name || 'Anonymous User'}
                    </h1>
                    <BadgeRow userId={userId} maxDisplay={3} compact />
                  </div>
                  {profile.headline && (
                    <p className="text-lg text-primary font-medium mt-1">
                      {profile.headline}
                    </p>
                  )}
                  {profile.tagline && (
                    <p className="text-slate-500 dark:text-slate-400 italic mt-1">
                      "{profile.tagline}"
                    </p>
                  )}
                  <div className="flex items-center mt-2 text-slate-600 dark:text-slate-300">
                    <RoleIcon className="w-5 h-5 mr-2" />
                    <span className="capitalize">{profile.role || 'User'}</span>
                    {profile.city && (
                      <>
                        <span className="mx-2">•</span>
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>{profile.city}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                {!isOwnProfile && (
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleMessageClick}>
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                    <Button variant="outline" onClick={() => setShowJobOfferComposer(true)}>
                      <FileText className="w-4 h-4 mr-2" />
                      Send Offer
                    </Button>
                    <CheckAvailabilityButton
                      freelancerId={profile.id}
                      freelancerName={profile.display_name || profile.full_name}
                      variant="outline"
                    />
                    <BookNowButton
                      freelancerId={profile.id}
                      freelancerName={profile.display_name || profile.full_name}
                      hourlyRate={profile.hourly_rate}
                      dailyRate={profile.daily_rate}
                      isOwnProfile={isOwnProfile}
                    />
                  </div>
                )}
              </div>

              {/* Stats Row */}
              <div className="flex flex-wrap items-center gap-4 mt-4">
                <RatingDisplay
                  rating={publicStats.averageRating}
                  totalReviews={publicStats.totalReviews}
                />
                <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>{publicStats.totalProjects} completed</span>
                </div>
                {publicStats.responseTime && (
                  <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                    <Clock className="w-4 h-4" />
                    <span>Responds in {publicStats.responseTime}</span>
                  </div>
                )}
                <MemberSinceBadge date={publicStats.memberSince} />
              </div>

              {/* Skills Preview */}
              <div className="mt-4">
                <SkillsRow userId={userId} skills={skills} maxDisplay={6} />
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="packages">Packages</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="availability">Availability</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Left Column - Main Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* About */}
                {profile.bio && (
                  <Card className="bg-surface border border-app rounded-2xl">
                    <CardHeader>
                      <CardTitle>About</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-600 dark:text-white/80 whitespace-pre-line">
                        {profile.bio}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Skills Card */}
                <SkillsCard
                  userId={userId}
                  skills={skills}
                  isOwner={false}
                  onEndorse={!isOwnProfile}
                />

                {/* Portfolio Preview */}
                {portfolio.length > 0 && (
                  <Card className="bg-surface border border-app rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>Portfolio Highlights</CardTitle>
                      <Button
                        variant="link"
                        onClick={() => document.querySelector('[data-value="portfolio"]')?.click()}
                      >
                        View All
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <PortfolioGallery
                        userId={userId}
                        items={portfolio.slice(0, 4)}
                        isOwner={false}
                        compact
                      />
                    </CardContent>
                  </Card>
                )}

                {/* Badges */}
                {badges.length > 0 && (
                  <Card className="bg-surface border border-app rounded-2xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="w-5 h-5" />
                        Achievements
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <BadgeGrid userId={userId} badges={badges} />
                    </CardContent>
                  </Card>
                )}

              </div>

              {/* Right Column - Sidebar */}
              <div className="lg:col-span-1 space-y-6">
                {/* Booking Card */}
                <Card className="bg-surface border border-app rounded-2xl sticky top-4">
                  <CardContent className="p-6">
                    <div className="text-center mb-4">
                      <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                        Starting at
                      </div>
                      <div className="text-3xl font-bold text-slate-900 dark:text-white">
                        ${profile.hourly_rate || profile.daily_rate || '0'}
                        <span className="text-base font-normal text-slate-500">
                          /{profile.hourly_rate ? 'hr' : 'day'}
                        </span>
                      </div>
                    </div>

                    {!isOwnProfile && (
                      <>
                        <BookNowButton
                          freelancerId={profile.id}
                          freelancerName={profile.display_name}
                          hourlyRate={profile.hourly_rate}
                          dailyRate={profile.daily_rate}
                          isOwnProfile={isOwnProfile}
                          className="w-full"
                          size="lg"
                        />

                        <Button
                          variant="outline"
                          className="w-full mt-3"
                          onClick={handleMessageClick}
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Contact Me
                        </Button>
                      </>
                    )}

                    {/* Response Time */}
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">
                          Response time
                        </span>
                        <span className="font-medium">
                          {publicStats.responseTime || 'Usually responds quickly'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Languages */}
                {profile.languages && profile.languages.length > 0 && (
                  <Card className="bg-surface border border-app rounded-2xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Languages className="w-4 h-4" />
                        Languages
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {profile.languages.map((lang, i) => (
                          <Badge key={i} variant="outline">
                            {lang.language || lang}
                            {lang.level && (
                              <span className="ml-1 text-slate-500">({lang.level})</span>
                            )}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Social Links */}
                {profile.social_links && Object.keys(profile.social_links).some(k => profile.social_links[k]) && (
                  <Card className="bg-surface border border-app rounded-2xl">
                    <CardHeader>
                      <CardTitle className="text-base">Connect</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {profile.social_links?.instagram && (
                          <a href={`https://instagram.com/${profile.social_links.instagram}`} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm" className="w-9 h-9 p-0">
                              <Instagram className="w-4 h-4" />
                            </Button>
                          </a>
                        )}
                        {profile.social_links?.twitter && (
                          <a href={`https://twitter.com/${profile.social_links.twitter}`} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm" className="w-9 h-9 p-0">
                              <Twitter className="w-4 h-4" />
                            </Button>
                          </a>
                        )}
                        {profile.social_links?.linkedin && (
                          <a href={`https://linkedin.com/in/${profile.social_links.linkedin}`} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm" className="w-9 h-9 p-0">
                              <Linkedin className="w-4 h-4" />
                            </Button>
                          </a>
                        )}
                        {profile.social_links?.youtube && (
                          <a href={`https://youtube.com/${profile.social_links.youtube}`} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm" className="w-9 h-9 p-0">
                              <Youtube className="w-4 h-4" />
                            </Button>
                          </a>
                        )}
                        {profile.website && (
                          <a href={profile.website} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm" className="w-9 h-9 p-0">
                              <Globe className="w-4 h-4" />
                            </Button>
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Stats Summary */}
                <Card className="bg-surface border border-app rounded-2xl">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Projects</span>
                        <span className="font-bold">{publicStats.totalProjects}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Reviews</span>
                        <span className="font-bold">{publicStats.totalReviews}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Rating</span>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 mr-1" />
                          <span className="font-bold">
                            {publicStats.averageRating?.toFixed(1) || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio">
            <PortfolioGallery
              userId={userId}
              items={portfolio}
              isOwner={false}
            />
            {portfolio.length === 0 && (
              <Card className="bg-surface border border-app rounded-2xl">
                <CardContent className="py-12 text-center">
                  <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No portfolio items yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    This user hasn't added any portfolio items.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Packages Tab (Fiverr-inspired) */}
          <TabsContent value="packages">
            {packages.length > 0 ? (
              <ServicePackagesDisplay
                userId={userId}
                packages={packages}
                isOwner={false}
                onSelectPackage={(pkg) => {
                  // Could open booking modal with pre-selected package
                  navigate(`/bookings?freelancer=${userId}&package=${pkg.id}`)
                }}
              />
            ) : (
              <Card className="bg-surface border border-app rounded-2xl">
                <CardContent className="py-12 text-center">
                  <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No packages yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    This user hasn't created any service packages.
                  </p>
                </CardContent>
              </Card>
            )}
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

      {/* Job Offer Composer Modal */}
      {profile && !isOwnProfile && (
        <JobOfferComposer
          open={showJobOfferComposer}
          onOpenChange={setShowJobOfferComposer}
          recipient={{
            id: profile.id,
            display_name: profile.display_name || profile.full_name,
            avatar_url: profile.avatar_url,
            role: profile.role
          }}
          onSuccess={() => {
            setShowJobOfferComposer(false)
            navigate('/messages')
          }}
        />
      )}
    </div>
  )
}

export default PublicProfileView
