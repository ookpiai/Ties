import { useState, useEffect, useRef } from 'react'
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
  Loader2
} from 'lucide-react'
import { updateProfile, getProfile } from '../../api/profiles'
import { uploadAvatar } from '../../api/storage'
import ServicesPage from './ServicesPage'

const ProfilePage = () => {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [avatarFile, setAvatarFile] = useState(null)
  const fileInputRef = useRef(null)

  const [profileData, setProfileData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    bio: user?.bio || '',
    location: user?.location || '',
    avatar_url: user?.avatar_url || '',
    website: '',
    phone: '',
    instagram: '',
    twitter: '',
    linkedin: '',
    hourly_rate: '',
    daily_rate: '',
    availability: 'available',
    skills: [],
    portfolio_items: [],
    services: [],
    equipment: [],
    venue_details: {
      capacity: '',
      amenities: [],
      pricing: ''
    }
  })

  const [newSkill, setNewSkill] = useState('')
  const [newPortfolioItem, setNewPortfolioItem] = useState({
    title: '',
    description: '',
    image_url: '',
    project_url: ''
  })

  // Load profile data from Supabase on mount
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) return

      try {
        const profile = await getProfile(user.id)
        // Parse display_name into first_name and last_name
        const nameParts = (profile.display_name || '').split(' ')
        setProfileData(prev => ({
          ...prev,
          first_name: nameParts[0] || '',
          last_name: nameParts.slice(1).join(' ') || '',
          bio: profile.bio || '',
          location: profile.city || '',
          avatar_url: profile.avatar_url || '',
          hourly_rate: profile.hourly_rate || '',
          daily_rate: profile.daily_rate || ''
        }))
      } catch (error) {
        console.error('Failed to load profile:', error)
      }
    }

    loadProfile()
  }, [user?.id])

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      // Preview the image
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
      // Get user's role to check if rates are required
      const profile = await getProfile(user.id)
      const requiresRates = profile.role === 'Freelancer' || profile.role === 'Artist' || profile.role === 'Crew'

      // Validate rates for Freelancer roles
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

      // Upload avatar if a new file was selected
      if (avatarFile) {
        avatarUrl = await uploadAvatar(avatarFile, user.id)
      }

      // Combine first_name and last_name into display_name for the Profile type
      const display_name = `${profileData.first_name} ${profileData.last_name}`.trim()

      // Update profile with fields that exist in the Profile type
      await updateProfile(user.id, {
        display_name,
        bio: profileData.bio,
        city: profileData.location,
        avatar_url: avatarUrl,
        hourly_rate: parseFloat(profileData.hourly_rate) || null,
        daily_rate: parseFloat(profileData.daily_rate) || null
      })

      setSaveSuccess(true)
      setIsEditing(false)
      setAvatarFile(null)

      // Hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      console.error('Failed to save profile:', error)
      setSaveError(error.message || 'Failed to save profile. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const addSkill = () => {
    if (newSkill.trim() && !profileData.skills.includes(newSkill.trim())) {
      setProfileData({
        ...profileData,
        skills: [...profileData.skills, newSkill.trim()]
      })
      setNewSkill('')
    }
  }

  const removeSkill = (skillToRemove) => {
    setProfileData({
      ...profileData,
      skills: profileData.skills.filter(skill => skill !== skillToRemove)
    })
  }

  const addPortfolioItem = () => {
    if (newPortfolioItem.title.trim()) {
      setProfileData({
        ...profileData,
        portfolio_items: [...profileData.portfolio_items, { ...newPortfolioItem, id: Date.now() }]
      })
      setNewPortfolioItem({
        title: '',
        description: '',
        image_url: '',
        project_url: ''
      })
    }
  }

  const removePortfolioItem = (itemId) => {
    setProfileData({
      ...profileData,
      portfolio_items: profileData.portfolio_items.filter(item => item.id !== itemId)
    })
  }

  const getInitials = () => {
    const first = profileData.first_name || user?.first_name || ''
    const last = profileData.last_name || user?.last_name || ''
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase()
  }

  // Universal profile structure (Amendment 7) - Same tabs for all roles
  const getProfileContent = () => {
    const roleLabels = {
      'Freelancer': 'Freelancer',
      'Vendor': 'Vendor',
      'Venue': 'Venue',
      'Organiser': 'Organiser',
      // Legacy support
      'Artist': 'Freelancer',
      'Crew': 'Freelancer'
    }

    const roleLabel = roleLabels[user?.role] || 'User'

    return {
      title: `${roleLabel} Profile`,
      subtitle: 'Manage your professional profile',
      tabs: ['overview', 'portfolio', 'services', 'availability']
    }
  }

  const roleContent = getProfileContent()

  return (
    <div className="min-h-screen bg-app dark:bg-[#0B0B0B] text-app transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 dark:bg-[#0B0B0B]">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                {roleContent.title}
              </h1>
              <p className="text-slate-600 dark:text-slate-300 mt-1">
                {roleContent.subtitle}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {user?.subscription_type === 'pro' && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  <Star className="w-3 h-3 mr-1" />
                  PRO
                </Badge>
              )}
              {isEditing ? (
                <div className="flex space-x-2">
                  <Button onClick={handleSave} size="sm" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    size="sm"
                    disabled={isSaving}
                  >
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

          {/* Success/Error Messages */}
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

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            {roleContent.tabs.map((tab) => (
              <TabsTrigger key={tab} value={tab} className="capitalize">
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Profile Card */}
              <Card className="lg:col-span-1 bg-surface border border-app text-app rounded-2xl">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="relative inline-block">
                      <Avatar className="w-24 h-24 mx-auto">
                        <AvatarImage src={profileData.avatar_url || "/placeholder-avatar.jpg"} />
                        <AvatarFallback className="text-lg">
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
                    
                    <div className="mt-4">
                      {isEditing ? (
                        <div className="space-y-2">
                          <Input
                            value={profileData.first_name}
                            onChange={(e) => setProfileData({
                              ...profileData,
                              first_name: e.target.value
                            })}
                            placeholder="First Name"
                          />
                          <Input
                            value={profileData.last_name}
                            onChange={(e) => setProfileData({
                              ...profileData,
                              last_name: e.target.value
                            })}
                            placeholder="Last Name"
                          />
                          <Input
                            value={profileData.location}
                            onChange={(e) => setProfileData({
                              ...profileData,
                              location: e.target.value
                            })}
                            placeholder="Location (e.g., Sydney, Australia)"
                          />
                        </div>
                      ) : (
                        <>
                          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                            {profileData.first_name} {profileData.last_name}
                          </h3>
                          <p className="text-slate-600 dark:text-white/80 capitalize mt-1">
                            {user?.role}
                          </p>
                          {profileData.location && (
                            <div className="flex items-center justify-center mt-2 text-slate-500 dark:text-white/60">
                              <MapPin className="w-4 h-4 mr-1" />
                              <span className="text-sm">{profileData.location}</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Contact Info */}
                    <div className="mt-6 space-y-3">
                      <div className="flex items-center text-slate-600 dark:text-white/80">
                        <Mail className="w-4 h-4 mr-2" />
                        <span className="text-sm">{user?.email}</span>
                      </div>
                      
                      {profileData.phone && (
                        <div className="flex items-center text-slate-600 dark:text-white/80">
                          <Phone className="w-4 h-4 mr-2" />
                          <span className="text-sm">{profileData.phone}</span>
                        </div>
                      )}
                      
                      {profileData.website && (
                        <div className="flex items-center text-slate-600 dark:text-white/80">
                          <Globe className="w-4 h-4 mr-2" />
                          <a 
                            href={profileData.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                          >
                            Website
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Social Links */}
                    <div className="mt-6 flex justify-center space-x-3">
                      {profileData.instagram && (
                        <a href={`https://instagram.com/${profileData.instagram}`} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm" className="w-10 h-10 p-0">
                            <Instagram className="w-4 h-4" />
                          </Button>
                        </a>
                      )}
                      {profileData.twitter && (
                        <a href={`https://twitter.com/${profileData.twitter}`} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm" className="w-10 h-10 p-0">
                            <Twitter className="w-4 h-4" />
                          </Button>
                        </a>
                      )}
                      {profileData.linkedin && (
                        <a href={`https://linkedin.com/in/${profileData.linkedin}`} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm" className="w-10 h-10 p-0">
                            <Linkedin className="w-4 h-4" />
                          </Button>
                        </a>
                      )}
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
                    {isEditing ? (
                      <Textarea
                        value={profileData.bio}
                        onChange={(e) => setProfileData({
                          ...profileData,
                          bio: e.target.value
                        })}
                        placeholder="Tell us about yourself, your experience, and what makes you unique..."
                        rows={4}
                      />
                    ) : (
                      <p className="text-slate-600 dark:text-white/80">
                        {profileData.bio || 'No bio added yet. Click edit to add your story.'}
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <div className="grid md:grid-cols-3 gap-4">
                  <Card className="bg-surface border border-app text-app rounded-2xl">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-primary">47</div>
                      <div className="text-sm text-slate-600 dark:text-white/80">Profile Views</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-surface border border-app text-app rounded-2xl">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-primary">12</div>
                      <div className="text-sm text-slate-600 dark:text-white/80">Projects</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-surface border border-app text-app rounded-2xl">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-primary">4.8</div>
                      <div className="text-sm text-slate-600 dark:text-white/80">Rating</div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Portfolio Tab (for freelancers) */}
          {user?.role === 'freelancer' && (
            <TabsContent value="portfolio">
              <Card className="bg-surface border border-app text-app rounded-2xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Portfolio</CardTitle>
                    {isEditing && (
                      <Button onClick={addPortfolioItem} size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Item
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {isEditing && (
                    <div className="mb-6 p-4 border border-gray-200 rounded-lg">
                      <h4 className="font-medium mb-3">Add Portfolio Item</h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        <Input
                          value={newPortfolioItem.title}
                          onChange={(e) => setNewPortfolioItem({
                            ...newPortfolioItem,
                            title: e.target.value
                          })}
                          placeholder="Project Title"
                        />
                        <Input
                          value={newPortfolioItem.project_url}
                          onChange={(e) => setNewPortfolioItem({
                            ...newPortfolioItem,
                            project_url: e.target.value
                          })}
                          placeholder="Project URL (optional)"
                        />
                      </div>
                      <div className="mt-3">
                        <Textarea
                          value={newPortfolioItem.description}
                          onChange={(e) => setNewPortfolioItem({
                            ...newPortfolioItem,
                            description: e.target.value
                          })}
                          placeholder="Project Description"
                          rows={2}
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {profileData.portfolio_items.map((item) => (
                      <div key={item.id} className="relative group">
                        <Card>
                          <CardContent className="p-4">
                            <div className="aspect-video bg-gray-200 rounded-lg mb-3 flex items-center justify-center">
                              <Camera className="w-8 h-8 text-gray-400" />
                            </div>
                            <h4 className="font-medium text-gray-900">{item.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                            {item.project_url && (
                              <a 
                                href={item.project_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm text-primary hover:underline mt-2 inline-block"
                              >
                                View Project
                              </a>
                            )}
                          </CardContent>
                        </Card>
                        {isEditing && (
                          <Button
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removePortfolioItem(item.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    
                    {profileData.portfolio_items.length === 0 && (
                      <div className="col-span-full text-center py-12">
                        <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No portfolio items yet
                        </h3>
                        <p className="text-gray-600">
                          Add your best work to showcase your skills and attract clients.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Services Tab - Universal (Amendment 8) */}
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
      </div>
    </div>
  )
}

export default ProfilePage

