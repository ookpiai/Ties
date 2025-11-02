import { useState, useEffect } from 'react'
import { useAuth } from '../../App'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
  Eye
} from 'lucide-react'

const ProfilePage = () => {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    bio: user?.bio || '',
    location: user?.location || '',
    website: '',
    phone: '',
    instagram: '',
    twitter: '',
    linkedin: '',
    hourly_rate: '',
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

  const handleSave = async () => {
    // TODO: Save to backend
    console.log('Saving profile:', profileData)
    setIsEditing(false)
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

  const getRoleSpecificContent = () => {
    switch (user?.role) {
      case 'freelancer':
        return {
          title: 'Freelancer Profile',
          subtitle: 'Showcase your skills and attract clients',
          tabs: ['overview', 'portfolio', 'skills', 'rates']
        }
      case 'organiser':
        return {
          title: 'Organiser Profile',
          subtitle: 'Manage your events and projects',
          tabs: ['overview', 'projects', 'team', 'preferences']
        }
      case 'venue':
        return {
          title: 'Venue Profile',
          subtitle: 'Showcase your space and amenities',
          tabs: ['overview', 'space', 'amenities', 'booking']
        }
      case 'vendor':
        return {
          title: 'Vendor Profile',
          subtitle: 'List your services and equipment',
          tabs: ['overview', 'services', 'equipment', 'rates']
        }
      case 'collective':
        return {
          title: 'Collective Profile',
          subtitle: 'Represent your creative group',
          tabs: ['overview', 'members', 'projects', 'services']
        }
      default:
        return {
          title: 'Profile',
          subtitle: 'Manage your account',
          tabs: ['overview', 'settings']
        }
    }
  }

  const roleContent = getRoleSpecificContent()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {roleContent.title}
              </h1>
              <p className="text-gray-600 mt-1">
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
                  <Button onClick={handleSave} size="sm">
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditing(false)} 
                    size="sm"
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
              <Card className="lg:col-span-1">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="relative inline-block">
                      <Avatar className="w-24 h-24 mx-auto">
                        <AvatarImage src="/placeholder-avatar.jpg" />
                        <AvatarFallback className="text-lg">
                          {getInitials()}
                        </AvatarFallback>
                      </Avatar>
                      {isEditing && (
                        <Button 
                          size="sm" 
                          className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                        >
                          <Camera className="w-4 h-4" />
                        </Button>
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
                        </div>
                      ) : (
                        <h3 className="text-xl font-semibold text-gray-900">
                          {profileData.first_name} {profileData.last_name}
                        </h3>
                      )}
                      
                      <p className="text-gray-600 capitalize">
                        {user?.role}
                      </p>
                      
                      {profileData.location && (
                        <div className="flex items-center justify-center mt-2 text-gray-500">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span className="text-sm">{profileData.location}</span>
                        </div>
                      )}
                    </div>

                    {/* Contact Info */}
                    <div className="mt-6 space-y-3">
                      <div className="flex items-center text-gray-600">
                        <Mail className="w-4 h-4 mr-2" />
                        <span className="text-sm">{user?.email}</span>
                      </div>
                      
                      {profileData.phone && (
                        <div className="flex items-center text-gray-600">
                          <Phone className="w-4 h-4 mr-2" />
                          <span className="text-sm">{profileData.phone}</span>
                        </div>
                      )}
                      
                      {profileData.website && (
                        <div className="flex items-center text-gray-600">
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
                <Card>
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
                      <p className="text-gray-600">
                        {profileData.bio || 'No bio added yet. Click edit to add your story.'}
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <div className="grid md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-primary">47</div>
                      <div className="text-sm text-gray-600">Profile Views</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-primary">12</div>
                      <div className="text-sm text-gray-600">Projects</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-primary">4.8</div>
                      <div className="text-sm text-gray-600">Rating</div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Portfolio Tab (for freelancers) */}
          {user?.role === 'freelancer' && (
            <TabsContent value="portfolio">
              <Card>
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

          {/* Skills Tab */}
          <TabsContent value="skills">
            <Card>
              <CardHeader>
                <CardTitle>Skills & Expertise</CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing && (
                  <div className="mb-6">
                    <div className="flex space-x-2">
                      <Input
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="Add a skill..."
                        onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                      />
                      <Button onClick={addSkill}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {profileData.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="relative group">
                      {skill}
                      {isEditing && (
                        <button
                          onClick={() => removeSkill(skill)}
                          className="ml-2 text-gray-500 hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>

                {profileData.skills.length === 0 && (
                  <div className="text-center py-8">
                    <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No skills added yet
                    </h3>
                    <p className="text-gray-600">
                      Add your skills to help others discover your expertise.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rates Tab (for freelancers/vendors) */}
          {(user?.role === 'freelancer' || user?.role === 'vendor') && (
            <TabsContent value="rates">
              <Card>
                <CardHeader>
                  <CardTitle>Rates & Availability</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="hourly_rate">Hourly Rate</Label>
                      <div className="mt-1 relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="hourly_rate"
                          type="number"
                          value={profileData.hourly_rate}
                          onChange={(e) => setProfileData({
                            ...profileData,
                            hourly_rate: e.target.value
                          })}
                          placeholder="0"
                          className="pl-10"
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="availability">Availability</Label>
                      <select
                        id="availability"
                        value={profileData.availability}
                        onChange={(e) => setProfileData({
                          ...profileData,
                          availability: e.target.value
                        })}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                        disabled={!isEditing}
                      >
                        <option value="available">Available</option>
                        <option value="busy">Busy</option>
                        <option value="unavailable">Unavailable</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Pricing Tips</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Research market rates for your skills and experience level</li>
                      <li>• Consider offering package deals for larger projects</li>
                      <li>• Update your rates regularly as you gain experience</li>
                      <li>• Be transparent about what's included in your rate</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  )
}

export default ProfilePage

