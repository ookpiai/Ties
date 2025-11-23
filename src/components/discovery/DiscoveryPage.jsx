import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import VenueMapView from './VenueMapView'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Search,
  Filter,
  MapPin,
  Star,
  Heart,
  Eye,
  DollarSign,
  Users,
  Briefcase,
  Camera,
  Music,
  Palette,
  Video,
  Mic,
  Building,
  Package,
  Calendar,
  ChevronDown,
  SlidersHorizontal,
  Grid3X3,
  List,
  Map,
  X,
  Loader2
} from 'lucide-react'
import { searchProfiles } from '../../api/profiles'
import { getSpecialtyLabel } from '../../constants/specialties'

const DiscoveryPage = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRole, setSelectedRole] = useState('all')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [selectedSkills, setSelectedSkills] = useState([])
  const [priceRange, setPriceRange] = useState([0, 500])
  const [sortBy, setSortBy] = useState('relevance')
  const [viewMode, setViewMode] = useState('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [favorites, setFavorites] = useState([])
  const [professionals, setProfessionals] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Map Supabase roles to component roles
  const mapSupabaseRoleToComponentRole = (supabaseRole) => {
    const roleMap = {
      'Freelancer': 'freelancer',
      'Vendor': 'vendor',
      'Venue': 'venue',
      'Organiser': 'organiser',
      // Legacy mappings for existing users
      'Artist': 'freelancer',
      'Crew': 'freelancer'
    }
    return roleMap[supabaseRole] || 'freelancer'
  }

  // Map component roles to Supabase roles for filtering
  const mapComponentRoleToSupabaseRole = (componentRole) => {
    const roleMap = {
      'freelancer': ['Freelancer', 'Artist', 'Crew'], // Include legacy roles
      'vendor': ['Vendor'],
      'venue': ['Venue'],
      'all': null
    }
    return roleMap[componentRole] || null
  }

  // Load profiles from Supabase on mount and when filters change
  useEffect(() => {
    const loadProfiles = async () => {
      setIsLoading(true)
      setError('')

      try {
        // Convert component role to Supabase role for filtering
        const supabaseRole = mapComponentRoleToSupabaseRole(selectedRole)

        // For multiple roles (like freelancer), we need to fetch all and filter
        const profiles = await searchProfiles({
          query: searchQuery,
          role: selectedRole === 'all' || selectedRole === 'freelancer' ? undefined : supabaseRole?.[0],
          location: selectedLocation
        })

        // Filter for specific roles locally (since some map to multiple Supabase roles)
        let filteredProfiles = profiles
        if (selectedRole === 'freelancer') {
          filteredProfiles = profiles.filter(p =>
            p.role === 'Freelancer' || p.role === 'Artist' || p.role === 'Crew'
          )
        } else if (selectedRole === 'vendor') {
          filteredProfiles = profiles.filter(p => p.role === 'Vendor')
        } else if (selectedRole === 'venue') {
          filteredProfiles = profiles.filter(p => p.role === 'Venue')
        }

        // Transform Supabase profiles to match component's expected format
        const transformedProfiles = filteredProfiles.map(profile => ({
          id: profile.id,
          name: profile.display_name || 'Anonymous',
          role: mapSupabaseRoleToComponentRole(profile.role),
          originalRole: profile.role, // Keep original role for specialty label lookup
          specialty: profile.specialty,
          specialty_display_name: profile.specialty_display_name || getSpecialtyLabel(profile.role, profile.specialty),
          title: profile.role || 'Creative Professional',
          location: profile.city || 'Location not specified',
          avatar: profile.avatar_url,
          rating: 0, // TODO: Add ratings in future phase
          reviewCount: 0,
          hourlyRate: 0, // TODO: Add rates in future phase
          skills: [], // TODO: Add skills in future phase
          bio: profile.bio || 'No bio available',
          portfolio: [],
          availability: 'available',
          featured: false,
          profileViews: 0,
          completedProjects: 0
        }))

        setProfessionals(transformedProfiles)
      } catch (err) {
        console.error('Failed to load profiles:', err)
        setError('Failed to load profiles. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    loadProfiles()
  }, [searchQuery, selectedRole, selectedLocation])

  // Sync filteredProfessionals with professionals when data loads
  useEffect(() => {
    setFilteredProfessionals(professionals)
  }, [professionals])

  // filteredProfessionals now uses real data from professionals state
  const [filteredProfessionals, setFilteredProfessionals] = useState([])

  const roleOptions = [
    { value: 'all', label: 'All', icon: Users },
    { value: 'freelancer', label: 'Freelancers', icon: Briefcase },
    { value: 'vendor', label: 'Vendors', icon: Package },
    { value: 'venue', label: 'Venues', icon: Building }
  ]

  const skillOptions = [
    'UI Design', 'Illustration', 'Photography', 'Video Production', 'Branding',
    'Web Development', 'Motion Graphics', 'Audio Engineering', 'Event Planning',
    'Marketing', 'Figma', 'Adobe Creative Suite', 'After Effects', 'Premiere Pro'
  ]

  const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
    { value: 'recent', label: 'Recently Active' }
  ]

  // Filtering now happens via Supabase searchProfiles() API
  // No need for local filtering since data is pre-filtered from database

  const toggleFavorite = (professionalId) => {
    setFavorites(prev => 
      prev.includes(professionalId) 
        ? prev.filter(id => id !== professionalId)
        : [...prev, professionalId]
    )
  }

  const addSkillFilter = (skill) => {
    if (!selectedSkills.includes(skill)) {
      setSelectedSkills([...selectedSkills, skill])
    }
  }

  const removeSkillFilter = (skill) => {
    setSelectedSkills(selectedSkills.filter(s => s !== skill))
  }

  const clearAllFilters = () => {
    setSelectedRole('all')
    setSelectedLocation('')
    setSelectedSkills([])
    setPriceRange([0, 500])
    setSearchQuery('')
  }

  const getRoleIcon = (role) => {
    const roleOption = roleOptions.find(option => option.value === role)
    return roleOption ? roleOption.icon : Briefcase
  }

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  return (
    <div className="min-h-screen bg-app text-app transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Discover Talent</h1>
          <p className="text-slate-600 dark:text-slate-300 mt-1">
            Find the perfect creative professionals for your projects
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, skills, or services..."
              className="pl-10 pr-4 py-3 text-lg"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              {roleOptions.map((role) => {
                const Icon = role.icon
                return (
                  <Button
                    key={role.value}
                    variant={selectedRole === role.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedRole(role.value)}
                    className="flex items-center space-x-1"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{role.label}</span>
                  </Button>
                )
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-1"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>More Filters</span>
            </Button>

            <div className="flex items-center space-x-2 ml-auto">
              <Label className="text-sm text-gray-600">View:</Label>
              <Button
                variant={viewMode === 'grid' ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'map' ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode('map')}
              >
                <Map className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <Card>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <Label className="text-sm font-medium">Location</Label>
                    <Input
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      placeholder="City, Country"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Sort By</Label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    >
                      {sortOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Price Range (£/hour)</Label>
                    <div className="mt-1 flex items-center space-x-2">
                      <Input
                        type="number"
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                        placeholder="Min"
                        className="w-20"
                      />
                      <span>-</span>
                      <Input
                        type="number"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 500])}
                        placeholder="Max"
                        className="w-20"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <Label className="text-sm font-medium">Skills</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {skillOptions.map(skill => (
                      <Button
                        key={skill}
                        variant={selectedSkills.includes(skill) ? "default" : "outline"}
                        size="sm"
                        onClick={() => 
                          selectedSkills.includes(skill) 
                            ? removeSkillFilter(skill)
                            : addSkillFilter(skill)
                        }
                      >
                        {skill}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex justify-between">
                  <Button variant="outline" onClick={clearAllFilters}>
                    Clear All Filters
                  </Button>
                  <Button onClick={() => setShowFilters(false)}>
                    Apply Filters
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Active Filters */}
          {(selectedSkills.length > 0 || selectedLocation || selectedRole !== 'all') && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-600">Active filters:</span>
              {selectedRole !== 'all' && (
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <span>{roleOptions.find(r => r.value === selectedRole)?.label}</span>
                  <button onClick={() => setSelectedRole('all')}>
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {selectedLocation && (
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <span>{selectedLocation}</span>
                  <button onClick={() => setSelectedLocation('')}>
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {selectedSkills.map(skill => (
                <Badge key={skill} variant="secondary" className="flex items-center space-x-1">
                  <span>{skill}</span>
                  <button onClick={() => removeSkillFilter(skill)}>
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Results */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-gray-600">
            {filteredProfessionals.length} result{filteredProfessionals.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2 text-gray-600">Loading profiles...</span>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredProfessionals.length === 0 && viewMode !== 'map' && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No profiles found</h3>
            <p className="text-gray-600">Try adjusting your search filters</p>
          </div>
        )}

        {/* Map View */}
        {viewMode === 'map' && (
          <div className="h-[600px] rounded-lg overflow-hidden border border-gray-200">
            <VenueMapView />
          </div>
        )}

        {/* Professionals Grid/List */}
        {!isLoading && !error && filteredProfessionals.length > 0 && viewMode !== 'map' && (
          <div className={viewMode === 'grid'
            ? "grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-4"
          }>
            {filteredProfessionals.map((professional) => {
            const Icon = getRoleIcon(professional.role)
            const isFavorite = favorites.includes(professional.id)

            return (
              <Card key={professional.id} className={`relative group hover:shadow-lg transition-shadow bg-white dark:bg-[#121620] border-slate-200 dark:border-slate-700 ${professional.featured ? 'ring-2 ring-yellow-200 dark:ring-yellow-600' : ''}`}>
                {professional.featured && (
                  <div className="absolute top-3 right-3 z-10">
                    <Badge className="bg-yellow-100 text-yellow-800">
                      <Star className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  </div>
                )}

                <CardContent className="p-6">
                  <div className={viewMode === 'list' ? "flex items-center space-x-4" : "text-center"}>
                    {/* Avatar */}
                    <div className={viewMode === 'list' ? "flex-shrink-0" : "mb-4"}>
                      <Avatar className="w-16 h-16 mx-auto">
                        <AvatarImage src={professional.avatar} />
                        <AvatarFallback className="text-lg">
                          {getInitials(professional.name)}
                        </AvatarFallback>
                      </Avatar>
                    </div>

                    {/* Content */}
                    <div className={viewMode === 'list' ? "flex-1 min-w-0" : ""}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Icon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                          <span className="text-sm text-slate-500 dark:text-slate-400 capitalize">{professional.role}</span>
                        </div>
                        <button
                          onClick={() => toggleFavorite(professional.id)}
                          className="text-slate-400 dark:text-slate-500 hover:text-red-500 transition-colors"
                        >
                          <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                        </button>
                      </div>

                      {/* Specialty Badge - Prominent display */}
                      {professional.specialty_display_name && (
                        <div className="mb-2">
                          <Badge variant="default" className="bg-primary text-white font-semibold">
                            {professional.specialty_display_name}
                          </Badge>
                        </div>
                      )}

                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                        {professional.name}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-300 mb-2">{professional.title}</p>

                      <div className="flex items-center justify-center space-x-4 mb-3 text-sm text-slate-500 dark:text-slate-400">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{professional.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span>{professional.rating}</span>
                          <span>({professional.reviewCount})</span>
                        </div>
                      </div>

                      <p className="text-slate-600 dark:text-slate-300 text-sm mb-4 line-clamp-2">
                        {professional.bio}
                      </p>

                      {/* Skills */}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {professional.skills.slice(0, 3).map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {professional.skills.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{professional.skills.length - 3} more
                          </Badge>
                        )}
                      </div>

                      {/* Price and Actions */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          <DollarSign className="w-4 h-4 text-gray-500" />
                          <span className="font-semibold">£{professional.hourlyRate}</span>
                          <span className="text-gray-500 text-sm">/hour</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/profile/${professional.id}`)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button size="sm">
                            Contact
                          </Button>
                        </div>
                      </div>

                      {/* Availability Status */}
                      <div className="mt-3 flex items-center justify-center">
                        <div className={`flex items-center space-x-1 text-xs px-2 py-1 rounded-full ${
                          professional.availability === 'available' 
                            ? 'bg-green-100 text-green-800' 
                            : professional.availability === 'busy'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          <div className={`w-2 h-2 rounded-full ${
                            professional.availability === 'available' 
                              ? 'bg-green-500' 
                              : professional.availability === 'busy'
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`} />
                          <span className="capitalize">{professional.availability}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
          </div>
        )}
      </div>
    </div>
  )
}

export default DiscoveryPage

