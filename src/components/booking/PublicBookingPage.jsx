/**
 * Public Booking Page
 *
 * SEO-optimized public booking page with vanity URLs
 * Accessible at /book/:username
 *
 * Sources:
 * - https://www.site123.com/learn/optimizing-your-booking-page-for-search-engines-an-seo-guide
 * - https://www.bookingpressplugin.com/seo-strategies-to-drive-more-online-bookings/
 */

import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  MapPin,
  Star,
  Calendar,
  Clock,
  MessageCircle,
  CheckCircle,
  Share2,
  ExternalLink,
  Loader2,
  ArrowLeft,
  Play,
  Music,
  Image as ImageIcon,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { TopBadge, BadgeRow } from '../profile/badges'
import { SkillsRow } from '../profile/skills'
import { RatingDisplay, MemberSinceBadge } from '../profile/stats'
import { ServicePackagesDisplay } from '../profile/packages'
import { getServices } from '../../api/services'
import { getFeaturedPortfolioItems } from '../../api/portfolio'
import { getProfileStats, getPublicStats } from '../../api/profileStats'
import BookNowButton from '../bookings/BookNowButton'
import { useAuth } from '../../App'

const PublicBookingPage = () => {
  const { username } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [profile, setProfile] = useState(null)
  const [services, setServices] = useState([])
  const [portfolio, setPortfolio] = useState([])
  const [stats, setStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load profile by username
  useEffect(() => {
    const loadProfile = async () => {
      if (!username) return
      setIsLoading(true)
      setError(null)

      try {
        // Fetch profile by username
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', username)
          .single()

        if (profileError) {
          if (profileError.code === 'PGRST116') {
            setError('Profile not found')
          } else {
            throw profileError
          }
          return
        }

        if (!profileData.public_booking_enabled) {
          setError('This booking page is not available')
          return
        }

        setProfile(profileData)

        // Load additional data in parallel
        const [servicesData, portfolioData, statsData] = await Promise.all([
          getServices(profileData.id).catch(() => []),
          getFeaturedPortfolioItems(profileData.id, 6).catch(() => []),
          getProfileStats(profileData.id).catch(() => null),
        ])

        setServices(servicesData)
        setPortfolio(portfolioData)
        setStats(statsData)
      } catch (err) {
        console.error('Failed to load booking page:', err)
        setError('Failed to load booking page')
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [username])

  // Handle share
  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Book ${profile.display_name} on TIES Together`,
          text: profile.headline || profile.bio,
          url,
        })
      } catch (err) {
        // User cancelled or error
      }
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(url)
      alert('Link copied to clipboard!')
    }
  }

  // Get initials
  const getInitials = () => {
    if (!profile?.display_name) return '??'
    const names = profile.display_name.split(' ')
    if (names.length >= 2) {
      return `${names[0].charAt(0)}${names[1].charAt(0)}`.toUpperCase()
    }
    return profile.display_name.substring(0, 2).toUpperCase()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0B0B0B]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0B0B0B]">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="py-12 text-center">
            <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {error || 'This booking page does not exist.'}
            </p>
            <Button onClick={() => navigate('/discover')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Browse Talent
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const publicStats = getPublicStats(stats)

  // SEO metadata
  const pageTitle = `Book ${profile.display_name} - ${profile.role} | TIES Together`
  const pageDescription =
    profile.headline ||
    profile.bio ||
    `Book ${profile.display_name}, a ${profile.role} based in ${profile.city || 'Australia'}`
  const pageUrl = `https://tiestogether.com/book/${username}`

  return (
    <>
      {/* SEO Meta Tags */}
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="robots" content="index, follow" />

        {/* Open Graph */}
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="profile" />
        <meta property="og:url" content={pageUrl} />
        {profile.avatar_url && (
          <meta property="og:image" content={profile.avatar_url} />
        )}

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />

        {/* Schema.org structured data */}
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Person',
            name: profile.display_name,
            jobTitle: profile.role,
            description: profile.bio,
            url: pageUrl,
            image: profile.avatar_url,
            address: profile.city
              ? {
                  '@type': 'PostalAddress',
                  addressLocality: profile.city,
                  addressCountry: 'AU',
                }
              : undefined,
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-slate-50 dark:bg-[#0B0B0B]">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent dark:from-primary/20 dark:via-transparent">
          <div className="max-w-5xl mx-auto px-4 py-12">
            <div className="flex flex-col md:flex-row items-start gap-6">
              {/* Avatar */}
              <Avatar className="w-28 h-28 md:w-36 md:h-36 border-4 border-white shadow-lg">
                <AvatarImage src={profile.avatar_url} alt={profile.display_name} />
                <AvatarFallback className="text-3xl">{getInitials()}</AvatarFallback>
              </Avatar>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                        {profile.display_name}
                      </h1>
                      <TopBadge userId={profile.id} size="md" />
                    </div>
                    <p className="text-lg text-slate-600 dark:text-slate-300 capitalize">
                      {profile.role}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleShare}>
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>

                {/* Headline */}
                {profile.headline && (
                  <p className="text-xl text-slate-700 dark:text-slate-200 mt-3 font-medium">
                    {profile.headline}
                  </p>
                )}

                {/* Location and Stats */}
                <div className="flex flex-wrap items-center gap-4 mt-4 text-sm">
                  {profile.city && (
                    <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                      <MapPin className="w-4 h-4" />
                      {profile.city}
                    </div>
                  )}
                  <RatingDisplay
                    rating={publicStats.averageRating}
                    totalReviews={publicStats.totalReviews}
                  />
                  <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    {publicStats.totalProjects} completed
                  </div>
                  <MemberSinceBadge date={publicStats.memberSince} />
                </div>

                {/* Badges */}
                <div className="mt-4">
                  <BadgeRow userId={profile.id} maxDisplay={5} />
                </div>

                {/* Skills */}
                <div className="mt-4">
                  <SkillsRow userId={profile.id} maxDisplay={6} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* About */}
              {profile.bio && (
                <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <CardHeader>
                    <CardTitle>About</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 dark:text-slate-300 whitespace-pre-line">
                      {profile.bio}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Portfolio Preview */}
              {portfolio.length > 0 && (
                <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Portfolio</CardTitle>
                    <Button variant="link" asChild>
                      <Link to={`/profile/${profile.id}`}>View All</Link>
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {portfolio.map((item) => (
                        <div
                          key={item.id}
                          className="aspect-video bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden relative group cursor-pointer"
                        >
                          {item.thumbnail_url || item.media_url ? (
                            <img
                              src={item.thumbnail_url || item.media_url}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              {item.type === 'video' && (
                                <Play className="w-8 h-8 text-slate-400" />
                              )}
                              {item.type === 'audio' && (
                                <Music className="w-8 h-8 text-slate-400" />
                              )}
                              {item.type === 'image' && (
                                <ImageIcon className="w-8 h-8 text-slate-400" />
                              )}
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              {item.title}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Services */}
              {services.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                    Services & Packages
                  </h2>
                  {services.map((service) => (
                    <Card
                      key={service.id}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                    >
                      <CardHeader>
                        <CardTitle className="text-lg">{service.title}</CardTitle>
                        {service.description && (
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {service.description}
                          </p>
                        )}
                      </CardHeader>
                      <CardContent>
                        <ServicePackagesDisplay
                          serviceId={service.id}
                          serviceName={service.title}
                          onSelectPackage={(pkg) => {
                            // Could open a booking modal with pre-selected package
                            navigate(`/profile/${profile.id}?service=${service.id}&package=${pkg.id}`)
                          }}
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column - Booking Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-4 space-y-4">
                {/* Booking Card */}
                <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg">
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

                    <BookNowButton
                      freelancerId={profile.id}
                      freelancerName={profile.display_name}
                      hourlyRate={profile.hourly_rate}
                      dailyRate={profile.daily_rate}
                      isOwnProfile={user?.id === profile.id}
                      className="w-full"
                      size="lg"
                    />

                    <Button
                      variant="outline"
                      className="w-full mt-3"
                      onClick={() =>
                        navigate('/messages', {
                          state: { openConversationWithUserId: profile.id },
                        })
                      }
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Contact Me
                    </Button>

                    {/* Response Time */}
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">
                          Response time
                        </span>
                        <span className="font-medium">
                          {stats?.average_response_time_hours
                            ? `${stats.average_response_time_hours} hours`
                            : 'Usually responds quickly'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Languages */}
                {profile.languages && JSON.parse(JSON.stringify(profile.languages)).length > 0 && (
                  <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <CardContent className="p-4">
                      <h3 className="font-medium mb-2">Languages</h3>
                      <div className="flex flex-wrap gap-2">
                        {JSON.parse(JSON.stringify(profile.languages)).map(
                          (lang, i) => (
                            <Badge key={i} variant="outline">
                              {lang.language || lang}
                              {lang.level && (
                                <span className="ml-1 text-slate-500">
                                  ({lang.level})
                                </span>
                              )}
                            </Badge>
                          )
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Quick Links */}
                <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <CardContent className="p-4">
                    <Button variant="ghost" className="w-full justify-start" asChild>
                      <Link to={`/profile/${profile.id}`}>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Full Profile
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default PublicBookingPage
