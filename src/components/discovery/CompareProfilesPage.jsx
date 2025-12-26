/**
 * COMPARE PROFILES PAGE
 * Side-by-side comparison of 2-4 profiles
 */

import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  ArrowLeft,
  Star,
  MapPin,
  DollarSign,
  CheckCircle,
  Clock,
  Briefcase,
  MessageSquare,
  Calendar,
  X,
  Loader2,
  Users
} from 'lucide-react'
import { getProfilesByIds } from '@/api/profiles'
import EmptyState from '@/components/ui/EmptyState'

const CompareProfilesPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [profiles, setProfiles] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Get profile IDs from URL
  const idsParam = searchParams.get('ids')
  const profileIds = idsParam ? idsParam.split(',').filter(Boolean) : []

  useEffect(() => {
    async function loadProfiles() {
      if (profileIds.length < 2) {
        setError('Please select at least 2 profiles to compare')
        setIsLoading(false)
        return
      }

      if (profileIds.length > 4) {
        setError('You can compare up to 4 profiles at once')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const data = await getProfilesByIds(profileIds)
        setProfiles(data)
        setError(null)
      } catch (err) {
        console.error('Error loading profiles:', err)
        setError('Failed to load profiles')
      } finally {
        setIsLoading(false)
      }
    }

    loadProfiles()
  }, [idsParam])

  const removeProfile = (profileId) => {
    const newIds = profileIds.filter(id => id !== profileId)
    if (newIds.length < 2) {
      navigate('/discover')
    } else {
      navigate(`/compare?ids=${newIds.join(',')}`)
    }
  }

  const getRoleIcon = (role) => {
    switch (role) {
      case 'Freelancer': return '🎨'
      case 'Vendor': return '🏪'
      case 'Venue': return '🏛️'
      case 'Organiser': return '📋'
      default: return '👤'
    }
  }

  const formatRate = (rate) => {
    if (!rate || rate === 0) return 'Contact for rate'
    return `$${rate}/hr`
  }

  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating || 0)
    const hasHalf = (rating || 0) % 1 >= 0.5

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)
      } else if (i === fullStars && hasHalf) {
        stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400/50 text-yellow-400" />)
      } else {
        stars.push(<Star key={i} className="w-4 h-4 text-slate-300" />)
      }
    }
    return stars
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading profiles...</p>
        </div>
      </div>
    )
  }

  if (error || profiles.length < 2) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/discover')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Discover Talent
        </Button>

        <EmptyState
          icon={Users}
          title="Cannot Compare"
          description={error || 'Please select at least 2 profiles to compare'}
          action={{
            label: 'Go to Discover',
            href: '/discover'
          }}
        />
      </div>
    )
  }

  // Comparison attributes
  const attributes = [
    { key: 'role', label: 'Role', render: (p) => (
      <span className="flex items-center gap-2">
        {getRoleIcon(p.role)} {p.role}
      </span>
    )},
    { key: 'specialty', label: 'Specialty', render: (p) => p.specialty_display_name || p.specialty || '-' },
    { key: 'location', label: 'Location', render: (p) => (
      <span className="flex items-center gap-1">
        <MapPin className="w-3 h-3" /> {p.city || 'Not specified'}
      </span>
    )},
    { key: 'rate', label: 'Hourly Rate', render: (p) => (
      <span className="flex items-center gap-1 font-semibold text-green-600 dark:text-green-400">
        <DollarSign className="w-3 h-3" /> {formatRate(p.hourly_rate)}
      </span>
    )},
    { key: 'rating', label: 'Rating', render: (p) => (
      <div className="flex items-center gap-2">
        <div className="flex">{renderStars(p.average_rating)}</div>
        <span className="text-sm text-muted-foreground">
          ({p.total_reviews || 0} reviews)
        </span>
      </div>
    )},
    { key: 'completed', label: 'Jobs Completed', render: (p) => (
      <span className="flex items-center gap-1">
        <Briefcase className="w-3 h-3" /> {p.total_bookings_completed || 0}
      </span>
    )},
    { key: 'reliability', label: 'On-Time Rate', render: (p) => (
      <span className={`flex items-center gap-1 ${(p.on_time_delivery_rate || 0) >= 90 ? 'text-green-600' : 'text-orange-500'}`}>
        <Clock className="w-3 h-3" /> {p.on_time_delivery_rate || 100}%
      </span>
    )},
    { key: 'verified', label: 'Verified', render: (p) => (
      p.email_verified ? (
        <span className="flex items-center gap-1 text-green-600">
          <CheckCircle className="w-4 h-4" /> Yes
        </span>
      ) : (
        <span className="text-muted-foreground">No</span>
      )
    )},
    { key: 'availability', label: 'Booking', render: (p) => (
      p.public_booking_enabled ? (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          Available
        </Badge>
      ) : (
        <Badge variant="outline" className="bg-slate-50 text-slate-600">
          Contact Only
        </Badge>
      )
    )},
  ]

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/discover')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Discover Talent
        </Button>

        <h1 className="text-3xl font-bold mb-2">Compare Profiles</h1>
        <p className="text-muted-foreground">
          Side-by-side comparison of {profiles.length} professionals
        </p>
      </div>

      {/* Comparison Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="p-4 text-left font-medium text-muted-foreground w-32">
                    Attribute
                  </th>
                  {profiles.map((profile) => (
                    <th key={profile.id} className="p-4 text-center min-w-[200px]">
                      <div className="relative">
                        <button
                          onClick={() => removeProfile(profile.id)}
                          className="absolute -top-2 -right-2 p-1 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
                          title="Remove from comparison"
                        >
                          <X className="w-3 h-3" />
                        </button>

                        <Link to={`/profile/${profile.id}`}>
                          <Avatar className="w-16 h-16 mx-auto mb-2">
                            <AvatarImage src={profile.avatar_url} />
                            <AvatarFallback>
                              {profile.display_name?.charAt(0)?.toUpperCase() || '?'}
                            </AvatarFallback>
                          </Avatar>
                        </Link>

                        <Link
                          to={`/profile/${profile.id}`}
                          className="font-semibold hover:underline block"
                        >
                          {profile.display_name}
                        </Link>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {attributes.map((attr, idx) => (
                  <tr
                    key={attr.key}
                    className={idx % 2 === 0 ? 'bg-slate-50 dark:bg-slate-800/50' : ''}
                  >
                    <td className="p-4 font-medium text-muted-foreground">
                      {attr.label}
                    </td>
                    {profiles.map((profile) => (
                      <td key={profile.id} className="p-4 text-center">
                        {attr.render(profile)}
                      </td>
                    ))}
                  </tr>
                ))}

                {/* Bio Row */}
                <tr className="border-t">
                  <td className="p-4 font-medium text-muted-foreground align-top">
                    Bio
                  </td>
                  {profiles.map((profile) => (
                    <td key={profile.id} className="p-4 text-sm text-left">
                      <p className="line-clamp-4">
                        {profile.bio || 'No bio provided'}
                      </p>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="mt-6 grid gap-4" style={{ gridTemplateColumns: `repeat(${profiles.length}, 1fr)` }}>
        {profiles.map((profile) => (
          <div key={profile.id} className="flex flex-col gap-2">
            <Link to={`/profile/${profile.id}`} className="w-full">
              <Button variant="outline" className="w-full">
                View Full Profile
              </Button>
            </Link>
            {profile.public_booking_enabled && profile.username ? (
              <Link to={`/book/${profile.username}`} className="w-full">
                <Button className="w-full">
                  <Calendar className="w-4 h-4 mr-2" />
                  Book Now
                </Button>
              </Link>
            ) : (
              <Link to={`/messages`} state={{ openConversationWithUserId: profile.id }} className="w-full">
                <Button variant="secondary" className="w-full">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default CompareProfilesPage
