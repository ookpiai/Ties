/**
 * Profile Page - Premium Edition
 *
 * Enhanced profile with features inspired by:
 * - Fiverr (tiered packages, seller levels)
 * - Upwork (skills, success score)
 * - Dribbble (portfolio showcase)
 * - BookEntertainment.co.uk (performer profiles)
 */

import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../App'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import AvailabilityCalendar from '../calendar/AvailabilityCalendar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import {
  User,
  Settings,
  Camera,
  MapPin,
  Mail,
  Phone,
  Globe,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  Plus,
  Edit,
  Save,
  X,
  Star,
  DollarSign,
  Calendar,
  Users,
  Briefcase,
  Award,
  Eye,
  Loader2,
  Copy,
  Check,
  Link as LinkIcon,
  Languages,
  Share2,
  ExternalLink,
} from 'lucide-react'
import { updateProfile, getProfile } from '../../api/profiles'
import { uploadAvatar } from '../../api/storage'
import ServicesPage from './ServicesPage'
import { PortfolioGallery } from './portfolio'
import { ServicePackagesDisplay, PackageEditorModal } from './packages'
import { SkillsCard, SkillsEditorModal } from './skills'
import { BadgeGrid, VerificationRow, AvailableBadges } from './badges'
import { PrivateStatsDashboard, StatsCardsGrid, MemberSinceBadge } from './stats'
import { getProfileStats, calculateProfileStrength } from '../../api/profileStats'
import { getPortfolioItems } from '../../api/portfolio'
import { getUserSkills } from '../../api/skills'
import { getUserBadges } from '../../api/badges'
import { getServicePackages } from '../../api/servicePackages'
import { HelpTooltip, FormFieldHelp, FeatureTip } from '@/components/ui/HelpTooltip'
import { FeatureHotspot } from '@/components/ui/FeatureHotspot'
import { helpContent, featureHotspots } from '../../constants/helpContent'

const ProfilePage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [avatarFile, setAvatarFile] = useState(null)
  const [copiedBookingUrl, setCopiedBookingUrl] = useState(false)
  const fileInputRef = useRef(null)

  // Profile data
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    headline: '',
    tagline: '',
    bio: '',
    location: '',
    avatar_url: '',
    username: '',
    website: '',
    phone: '',
    social_links: {},
    languages: [],
    hourly_rate: '',
    daily_rate: '',
    public_booking_enabled: false,
  })

  // Premium features data
  const [stats, setStats] = useState(null)
  const [portfolio, setPortfolio] = useState([])
  const [skills, setSkills] = useState([])
  const [badges, setBadges] = useState([])
  const [packages, setPackages] = useState([])
  const [profileStrength, setProfileStrength] = useState(null)

  // Modal states
  const [showSkillsModal, setShowSkillsModal] = useState(false)
  const [showPackageModal, setShowPackageModal] = useState(false)
  const [editingPackage, setEditingPackage] = useState(null)
  const [showLanguagesModal, setShowLanguagesModal] = useState(false)
  const [showSocialModal, setShowSocialModal] = useState(false)

  // Language editing state
  const [newLanguage, setNewLanguage] = useState({ language: '', level: 'conversational' })

  // Load all profile data
  useEffect(() => {
    const loadAllData = async () => {
      if (!user?.id) return

      try {
        // Load profile
        const profile = await getProfile(user.id)
        const nameParts = (profile.display_name || '').split(' ')
        setProfileData(prev => ({
          ...prev,
          first_name: nameParts[0] || '',
          last_name: nameParts.slice(1).join(' ') || '',
          headline: profile.headline || '',
          tagline: profile.tagline || '',
          bio: profile.bio || '',
          location: profile.city || '',
          avatar_url: profile.avatar_url || '',
          username: profile.username || '',
          website: profile.website_url || '',
          phone: profile.phone || '',
          social_links: profile.social_links || {},
          languages: profile.languages || [],
          hourly_rate: profile.hourly_rate || '',
          daily_rate: profile.daily_rate || '',
          public_booking_enabled: profile.public_booking_enabled || false,
        }))

        // Load premium features in parallel
        const [statsData, portfolioData, skillsData, badgesData, packagesData] = await Promise.all([
          getProfileStats(user.id).catch(() => null),
          getPortfolioItems(user.id).catch(() => []),
          getUserSkills(user.id).catch(() => []),
          getUserBadges(user.id).catch(() => []),
          getServicePackages(user.id).catch(() => []),
        ])

        setStats(statsData)
        setPortfolio(portfolioData)
        setSkills(skillsData)
        setBadges(badgesData)
        setPackages(packagesData)

        // Calculate profile strength
        const strength = calculateProfileStrength({
          ...profile,
          portfolio_count: portfolioData?.length || 0,
          skills_count: skillsData?.length || 0,
          packages_count: packagesData?.length || 0,
        })
        setProfileStrength(strength)
      } catch (error) {
        console.error('Failed to load profile:', error)
      }
    }

    loadAllData()
  }, [user?.id])

  // Refresh data functions
  const refreshPortfolio = async () => {
    if (!user?.id) return
    const data = await getPortfolioItems(user.id).catch(() => [])
    setPortfolio(data)
  }

  const refreshSkills = async () => {
    if (!user?.id) return
    const data = await getUserSkills(user.id).catch(() => [])
    setSkills(data)
  }

  const refreshPackages = async () => {
    if (!user?.id) return
    const data = await getServicePackages(user.id).catch(() => [])
    setPackages(data)
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileData(prev => ({
          ...prev,
          avatar_url: reader.result
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    if (!user?.id) return

    setIsSaving(true)
    setSaveError('')
    setSaveSuccess(false)

    try {
      const profile = await getProfile(user.id)
      const requiresRates = profile.role === 'Freelancer' || profile.role === 'Artist' || profile.role === 'Crew'

      if (requiresRates) {
        const hourly = parseFloat(profileData.hourly_rate) || 0
        const daily = parseFloat(profileData.daily_rate) || 0

        if (hourly === 0 && daily === 0) {
          setSaveError('Please set at least one rate (hourly or daily) to allow bookings')
          setIsSaving(false)
          return
        }
      }

      let avatarUrl = profileData.avatar_url

      if (avatarFile) {
        avatarUrl = await uploadAvatar(avatarFile, user.id)
      }

      const display_name = `${profileData.first_name} ${profileData.last_name}`.trim()

      await updateProfile(user.id, {
        display_name,
        headline: profileData.headline,
        tagline: profileData.tagline,
        bio: profileData.bio,
        city: profileData.location,
        avatar_url: avatarUrl,
        username: profileData.username,
        website_url: profileData.website,
        phone: profileData.phone,
        social_links: profileData.social_links,
        languages: profileData.languages,
        hourly_rate: parseFloat(profileData.hourly_rate) || null,
        daily_rate: parseFloat(profileData.daily_rate) || null,
        public_booking_enabled: profileData.public_booking_enabled,
      })

      setSaveSuccess(true)
      setIsEditing(false)
      setAvatarFile(null)

      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      console.error('Failed to save profile:', error)
      setSaveError(error.message || 'Failed to save profile. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const copyBookingUrl = () => {
    const url = `${window.location.origin}/book/${profileData.username}`
    navigator.clipboard.writeText(url)
    setCopiedBookingUrl(true)
    setTimeout(() => setCopiedBookingUrl(false), 2000)
  }

  const getInitials = () => {
    const first = profileData.first_name || user?.first_name || ''
    const last = profileData.last_name || user?.last_name || ''
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase()
  }

  const addLanguage = () => {
    if (newLanguage.language.trim()) {
      setProfileData(prev => ({
        ...prev,
        languages: [...(prev.languages || []), newLanguage]
      }))
      setNewLanguage({ language: '', level: 'conversational' })
    }
  }

  const removeLanguage = (index) => {
    setProfileData(prev => ({
      ...prev,
      languages: prev.languages.filter((_, i) => i !== index)
    }))
  }

  const updateSocialLink = (platform, value) => {
    setProfileData(prev => ({
      ...prev,
      social_links: {
        ...prev.social_links,
        [platform]: value
      }
    }))
  }

  const roleLabels = {
    'Freelancer': 'Freelancer',
    'Vendor': 'Vendor',
    'Venue': 'Venue',
    'Organiser': 'Organiser',
    'Artist': 'Freelancer',
    'Crew': 'Freelancer'
  }

  const roleLabel = roleLabels[user?.role] || 'User'

  return (
    <div className="min-h-screen bg-app dark:bg-[#0B0B0B] text-app transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                {roleLabel} Profile
              </h1>
              <p className="text-slate-600 dark:text-slate-300 mt-1">
                Manage your professional profile
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Public Booking URL */}
              {profileData.username && profileData.public_booking_enabled && (
                <Button variant="outline" size="sm" onClick={copyBookingUrl}>
                  {copiedBookingUrl ? (
                    <>
                      <Check className="w-4 h-4 mr-2 text-green-600" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <LinkIcon className="w-4 h-4 mr-2" />
                      Copy Booking URL
                    </>
                  )}
                </Button>
              )}

              {user?.subscription_type === 'pro' && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  <Star className="w-3 h-3 mr-1" />
                  PRO
                </Badge>
              )}

              {isEditing ? (
                <div className="flex gap-2">
                  <Button onClick={handleSave} size="sm" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)} size="sm" disabled={isSaving}>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button onClick={() => setIsEditing(true)} size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>

          {/* Messages */}
          {saveSuccess && (
            <Alert className="bg-green-50 border-green-200 mt-4">
              <AlertDescription className="text-green-800">
                Profile updated successfully!
              </AlertDescription>
            </Alert>
          )}
          {saveError && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{saveError}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Profile Strength (Fiverr-inspired) */}
        {profileStrength && profileStrength.score < 100 && (
          <Card className="mb-6 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  <span className="font-medium">Profile Strength</span>
                  <HelpTooltip
                    content={helpContent.profile.profileStrength.description}
                    title={helpContent.profile.profileStrength.title}
                    variant="tip"
                    size="sm"
                  />
                </div>
                <span className="text-sm font-bold text-primary">{profileStrength.score}%</span>
              </div>
              <Progress value={profileStrength.score} className="h-2 mb-3" />
              {profileStrength.recommendations.length > 0 && (
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  <span className="font-medium">Next step: </span>
                  {profileStrength.recommendations[0]}
                </div>
              )}
            </CardContent>
          </Card>
        )}

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
              {/* Profile Card */}
              <Card className="lg:col-span-1 bg-surface border border-app rounded-2xl">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="relative inline-block">
                      <Avatar className="w-28 h-28 mx-auto border-4 border-white shadow-lg">
                        <AvatarImage src={profileData.avatar_url || "/placeholder-avatar.jpg"} />
                        <AvatarFallback className="text-2xl">
                          {getInitials()}
                        </AvatarFallback>
                      </Avatar>
                      {isEditing && (
                        <>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAvatarChange}
                          />
                          <Button
                            size="sm"
                            className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Camera className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>

                    {/* Badges Row */}
                    <div className="mt-3">
                      <VerificationRow userId={user?.id} compact />
                    </div>

                    <div className="mt-4">
                      {isEditing ? (
                        <div className="space-y-2 text-left">
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              value={profileData.first_name}
                              onChange={(e) => setProfileData(prev => ({
                                ...prev,
                                first_name: e.target.value
                              }))}
                              placeholder="First Name"
                            />
                            <Input
                              value={profileData.last_name}
                              onChange={(e) => setProfileData(prev => ({
                                ...prev,
                                last_name: e.target.value
                              }))}
                              placeholder="Last Name"
                            />
                          </div>
                          <div className="relative">
                            <Input
                              value={profileData.headline}
                              onChange={(e) => setProfileData(prev => ({
                                ...prev,
                                headline: e.target.value
                              }))}
                              placeholder="Headline (e.g., Professional DJ & Event Host)"
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2">
                              <HelpTooltip
                                content={helpContent.profile.headline.description}
                                title="Headline"
                                size="sm"
                                side="left"
                              />
                            </div>
                          </div>
                          <div className="relative">
                            <Input
                              value={profileData.tagline}
                              onChange={(e) => setProfileData(prev => ({
                                ...prev,
                                tagline: e.target.value
                              }))}
                              placeholder="Tagline (short memorable phrase)"
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2">
                              <HelpTooltip
                                content={helpContent.profile.tagline.description}
                                title="Tagline"
                                size="sm"
                                side="left"
                              />
                            </div>
                          </div>
                          <Input
                            value={profileData.location}
                            onChange={(e) => setProfileData(prev => ({
                              ...prev,
                              location: e.target.value
                            }))}
                            placeholder="Location"
                          />
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-500">tiestogether.com/book/</span>
                            <Input
                              value={profileData.username}
                              onChange={(e) => setProfileData(prev => ({
                                ...prev,
                                username: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
                              }))}
                              placeholder="username"
                              className="flex-1"
                            />
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <input
                              type="checkbox"
                              id="public_booking"
                              checked={profileData.public_booking_enabled}
                              onChange={(e) => setProfileData(prev => ({
                                ...prev,
                                public_booking_enabled: e.target.checked
                              }))}
                              className="rounded"
                            />
                            <label htmlFor="public_booking" className="text-sm flex items-center">
                              Enable public booking page
                              <HelpTooltip
                                content={helpContent.profile.publicBooking.description}
                                title="Public Booking"
                                variant="tip"
                                size="sm"
                              />
                            </label>
                          </div>
                        </div>
                      ) : (
                        <>
                          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                            {profileData.first_name} {profileData.last_name}
                          </h3>
                          {profileData.headline && (
                            <p className="text-primary font-medium mt-1">{profileData.headline}</p>
                          )}
                          {profileData.tagline && (
                            <p className="text-sm text-slate-500 dark:text-slate-400 italic mt-1">
                              "{profileData.tagline}"
                            </p>
                          )}
                          <p className="text-slate-600 dark:text-white/80 capitalize mt-1">
                            {user?.role}
                          </p>
                          {profileData.location && (
                            <div className="flex items-center justify-center mt-2 text-slate-500 dark:text-white/60">
                              <MapPin className="w-4 h-4 mr-1" />
                              <span className="text-sm">{profileData.location}</span>
                            </div>
                          )}
                          <MemberSinceBadge date={user?.created_at} />
                        </>
                      )}
                    </div>

                    {/* Contact & Social */}
                    <div className="mt-6 space-y-3">
                      <div className="flex items-center text-slate-600 dark:text-white/80">
                        <Mail className="w-4 h-4 mr-2" />
                        <span className="text-sm truncate">{user?.email}</span>
                      </div>

                      {isEditing ? (
                        <div className="space-y-2">
                          <Input
                            value={profileData.phone}
                            onChange={(e) => setProfileData(prev => ({
                              ...prev,
                              phone: e.target.value
                            }))}
                            placeholder="Phone number"
                          />
                          <Input
                            value={profileData.website}
                            onChange={(e) => setProfileData(prev => ({
                              ...prev,
                              website: e.target.value
                            }))}
                            placeholder="Website URL"
                          />
                        </div>
                      ) : (
                        <>
                          {profileData.phone && (
                            <div className="flex items-center text-slate-600 dark:text-white/80">
                              <Phone className="w-4 h-4 mr-2" />
                              <span className="text-sm">{profileData.phone}</span>
                            </div>
                          )}
                          {profileData.website && (
                            <div className="flex items-center text-slate-600 dark:text-white/80">
                              <Globe className="w-4 h-4 mr-2" />
                              <a href={profileData.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                                Website
                              </a>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Social Links */}
                    {isEditing ? (
                      <div className="mt-4 space-y-2">
                        <Label className="text-xs text-slate-500">Social Links</Label>
                        <div className="flex items-center gap-2">
                          <Instagram className="w-4 h-4 text-slate-400" />
                          <Input
                            value={profileData.social_links?.instagram || ''}
                            onChange={(e) => updateSocialLink('instagram', e.target.value)}
                            placeholder="Instagram username"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Twitter className="w-4 h-4 text-slate-400" />
                          <Input
                            value={profileData.social_links?.twitter || ''}
                            onChange={(e) => updateSocialLink('twitter', e.target.value)}
                            placeholder="Twitter/X username"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Linkedin className="w-4 h-4 text-slate-400" />
                          <Input
                            value={profileData.social_links?.linkedin || ''}
                            onChange={(e) => updateSocialLink('linkedin', e.target.value)}
                            placeholder="LinkedIn username"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Youtube className="w-4 h-4 text-slate-400" />
                          <Input
                            value={profileData.social_links?.youtube || ''}
                            onChange={(e) => updateSocialLink('youtube', e.target.value)}
                            placeholder="YouTube channel"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="mt-6 flex justify-center gap-2">
                        {profileData.social_links?.instagram && (
                          <a href={`https://instagram.com/${profileData.social_links.instagram}`} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm" className="w-9 h-9 p-0">
                              <Instagram className="w-4 h-4" />
                            </Button>
                          </a>
                        )}
                        {profileData.social_links?.twitter && (
                          <a href={`https://twitter.com/${profileData.social_links.twitter}`} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm" className="w-9 h-9 p-0">
                              <Twitter className="w-4 h-4" />
                            </Button>
                          </a>
                        )}
                        {profileData.social_links?.linkedin && (
                          <a href={`https://linkedin.com/in/${profileData.social_links.linkedin}`} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm" className="w-9 h-9 p-0">
                              <Linkedin className="w-4 h-4" />
                            </Button>
                          </a>
                        )}
                        {profileData.social_links?.youtube && (
                          <a href={`https://youtube.com/${profileData.social_links.youtube}`} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm" className="w-9 h-9 p-0">
                              <Youtube className="w-4 h-4" />
                            </Button>
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Bio and Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* About */}
                <Card className="bg-surface border border-app rounded-2xl">
                  <CardHeader>
                    <CardTitle>About</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isEditing ? (
                      <Textarea
                        value={profileData.bio}
                        onChange={(e) => setProfileData(prev => ({
                          ...prev,
                          bio: e.target.value
                        }))}
                        placeholder="Tell us about yourself, your experience, and what makes you unique..."
                        rows={5}
                      />
                    ) : (
                      <p className="text-slate-600 dark:text-white/80 whitespace-pre-line">
                        {profileData.bio || 'No bio added yet. Click edit to add your story.'}
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Languages (Fiverr-inspired) */}
                <Card className="bg-surface border border-app rounded-2xl">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Languages className="w-5 h-5" />
                      Languages
                    </CardTitle>
                    {isEditing && (
                      <Button variant="outline" size="sm" onClick={() => setShowLanguagesModal(true)}>
                        <Plus className="w-4 h-4 mr-1" />
                        Add
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent>
                    {isEditing ? (
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <Input
                            value={newLanguage.language}
                            onChange={(e) => setNewLanguage(prev => ({ ...prev, language: e.target.value }))}
                            placeholder="Language (e.g., English)"
                            className="flex-1"
                          />
                          <select
                            value={newLanguage.level}
                            onChange={(e) => setNewLanguage(prev => ({ ...prev, level: e.target.value }))}
                            className="px-3 py-2 border rounded-md text-sm"
                          >
                            <option value="basic">Basic</option>
                            <option value="conversational">Conversational</option>
                            <option value="fluent">Fluent</option>
                            <option value="native">Native/Bilingual</option>
                          </select>
                          <Button onClick={addLanguage} size="sm">
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(profileData.languages || []).map((lang, i) => (
                            <Badge key={i} variant="secondary" className="flex items-center gap-1">
                              {lang.language} ({lang.level})
                              <button onClick={() => removeLanguage(i)} className="ml-1 hover:text-red-500">
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {(profileData.languages || []).length > 0 ? (
                          profileData.languages.map((lang, i) => (
                            <Badge key={i} variant="outline">
                              {lang.language}
                              <span className="ml-1 text-slate-500">({lang.level})</span>
                            </Badge>
                          ))
                        ) : (
                          <p className="text-sm text-slate-500">No languages added</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Skills (Upwork-inspired) */}
                <SkillsCard
                  userId={user?.id}
                  skills={skills}
                  isOwner={true}
                  onEdit={() => setShowSkillsModal(true)}
                />

                {/* Rates */}
                <Card className="bg-surface border border-app rounded-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      Rates
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isEditing ? (
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label className="flex items-center">
                            Hourly Rate (AUD)
                            <FormFieldHelp content={helpContent.profile.hourlyRate.description} />
                          </Label>
                          <Input
                            type="number"
                            value={profileData.hourly_rate}
                            onChange={(e) => setProfileData(prev => ({
                              ...prev,
                              hourly_rate: e.target.value
                            }))}
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <Label className="flex items-center">
                            Daily Rate (AUD)
                            <FormFieldHelp content={helpContent.profile.dailyRate.description} />
                          </Label>
                          <Input
                            type="number"
                            value={profileData.daily_rate}
                            onChange={(e) => setProfileData(prev => ({
                              ...prev,
                              daily_rate: e.target.value
                            }))}
                            placeholder="0"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <div className="text-sm text-slate-500 flex items-center">
                            Hourly Rate
                            <HelpTooltip content={helpContent.profile.hourlyRate.description} size="sm" />
                          </div>
                          <div className="text-2xl font-bold">
                            {profileData.hourly_rate ? `$${profileData.hourly_rate}/hr` : 'Not set'}
                          </div>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <div className="text-sm text-slate-500 flex items-center">
                            Daily Rate
                            <HelpTooltip content={helpContent.profile.dailyRate.description} size="sm" />
                          </div>
                          <div className="text-2xl font-bold">
                            {profileData.daily_rate ? `$${profileData.daily_rate}/day` : 'Not set'}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Stats Dashboard (Private) */}
                <PrivateStatsDashboard userId={user?.id} stats={stats} />
              </div>
            </div>
          </TabsContent>

          {/* Portfolio Tab (View Only - Edit in Create Page) */}
          <TabsContent value="portfolio">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Portfolio</h2>
                  <p className="text-sm text-slate-500">Showcase your best work</p>
                </div>
                <Button onClick={() => navigate('/create')}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Portfolio
                </Button>
              </div>

              {portfolio.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
                    <Briefcase className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    Your portfolio is empty
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4 max-w-md mx-auto">
                    Head over to the Portfolio Studio to start adding your best work!
                  </p>
                  <Button onClick={() => navigate('/create')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Go to Portfolio Studio
                  </Button>
                </div>
              ) : (
                <PortfolioGallery
                  userId={user?.id}
                  items={portfolio}
                  isOwner={false}
                  onRefresh={refreshPortfolio}
                />
              )}
            </div>
          </TabsContent>

          {/* Packages Tab (Fiverr-inspired) */}
          <TabsContent value="packages">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Service Packages</h2>
                  <p className="text-sm text-slate-500">Offer tiered pricing like Fiverr</p>
                </div>
                <Button onClick={() => {
                  setEditingPackage(null)
                  setShowPackageModal(true)
                }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Package
                </Button>
              </div>

              <ServicePackagesDisplay
                userId={user?.id}
                packages={packages}
                isOwner={true}
                onEdit={(pkg) => {
                  setEditingPackage(pkg)
                  setShowPackageModal(true)
                }}
                onRefresh={refreshPackages}
              />
            </div>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services">
            <ServicesPage userId={user?.id} isOwnProfile={true} />
          </TabsContent>

          {/* Availability Tab */}
          <TabsContent value="availability">
            <AvailabilityCalendar
              userId={user?.id}
              isOwnProfile={true}
            />
          </TabsContent>
        </Tabs>

        {/* Badges Section (at bottom for now) */}
        <Card className="mt-8 bg-surface border border-app rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Your Badges & Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BadgeGrid userId={user?.id} badges={badges} />
            <div className="mt-6 pt-6 border-t">
              <h4 className="font-medium mb-3">Available Badges</h4>
              <AvailableBadges currentBadges={badges.map(b => b.badge_type)} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <SkillsEditorModal
        isOpen={showSkillsModal}
        onClose={() => setShowSkillsModal(false)}
        userId={user?.id}
        currentSkills={skills}
        onSuccess={() => {
          setShowSkillsModal(false)
          refreshSkills()
        }}
      />

      <PackageEditorModal
        isOpen={showPackageModal}
        onClose={() => setShowPackageModal(false)}
        userId={user?.id}
        package={editingPackage}
        onSuccess={() => {
          setShowPackageModal(false)
          setEditingPackage(null)
          refreshPackages()
        }}
      />
    </div>
  )
}

export default ProfilePage
