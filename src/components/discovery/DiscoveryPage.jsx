import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import VenueMapView from './VenueMapView'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import EmptyState from '@/components/ui/EmptyState'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
  Loader2,
  Check,
  Square,
  CheckSquare,
  GitCompare,
  MoreVertical,
  MessageCircle,
  Share2,
  UserPlus,
  ExternalLink
} from 'lucide-react'
import { searchProfiles } from '../../api/profiles'
import { getSpecialtyLabel } from '../../constants/specialties'
import { getFavorites, addFavorite, removeFavorite } from '../../api/favorites'
import { useToast } from '@/hooks/use-toast'

const DiscoveryPage = () => {
  const navigate = useNavigate()
  const { toast } = useToast()
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

  // Bulk selection state
  const [selectedProfiles, setSelectedProfiles] = useState([])
  const [bulkActionMode, setBulkActionMode] = useState(false)

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

  // Load favorites on mount
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const favs = await getFavorites()
        // Extract just the profile IDs
        setFavorites(favs.map(f => f.profile.id))
      } catch (err) {
        console.error('Failed to load favorites:', err)
      }
    }
    loadFavorites()
  }, [])

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

  const toggleFavorite = async (professionalId) => {
    const isFav = favorites.includes(professionalId)

    // Optimistic update
    setFavorites(prev =>
      isFav
        ? prev.filter(id => id !== professionalId)
        : [...prev, professionalId]
    )

    try {
      if (isFav) {
        await removeFavorite(professionalId)
        toast({
          title: 'Removed from favorites',
          description: 'Profile has been removed from your saved list.',
        })
      } else {
        await addFavorite(professionalId)
        toast({
          title: 'Added to favorites',
          description: 'Profile has been saved to your favorites.',
        })
      }
    } catch (error) {
      // Revert on error
      setFavorites(prev =>
        isFav
          ? [...prev, professionalId]
          : prev.filter(id => id !== professionalId)
      )
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to update favorites.',
      })
    }
  }

  // Bulk selection handlers
  const toggleBulkMode = () => {
    setBulkActionMode(!bulkActionMode)
    setSelectedProfiles([])
  }

  const toggleProfileSelection = (profileId) => {
    setSelectedProfiles(prev =>
      prev.includes(profileId)
        ? prev.filter(id => id !== profileId)
        : [...prev, profileId]
    )
  }

  const selectAllProfiles = () => {
    setSelectedProfiles(filteredProfessionals.map(p => p.id))
  }

  const clearSelection = () => {
    setSelectedProfiles([])
  }

  const bulkAddToFavorites = async () => {
    const profilesToAdd = selectedProfiles.filter(id => !favorites.includes(id))

    if (profilesToAdd.length === 0) {
      toast({
        title: 'Already favorited',
        description: 'All selected profiles are already in your favorites.',
      })
      return
    }

    // Optimistic update
    setFavorites(prev => [...new Set([...prev, ...profilesToAdd])])

    try {
      await Promise.all(profilesToAdd.map(id => addFavorite(id)))
      toast({
        title: 'Added to favorites',
        description: `${profilesToAdd.length} profile${profilesToAdd.length > 1 ? 's' : ''} added to favorites.`,
      })
      clearSelection()
      setBulkActionMode(false)
    } catch (error) {
      // Revert on error
      setFavorites(prev => prev.filter(id => !profilesToAdd.includes(id)))
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to add profiles to favorites.',
      })
    }
  }

  const bulkCompare = () => {
    if (selectedProfiles.length < 2) {
      toast({
        title: 'Select more profiles',
        description: 'Please select at least 2 profiles to compare.',
      })
      return
    }

    if (selectedProfiles.length > 4) {
      toast({
        title: 'Too many profiles',
        description: 'You can compare up to 4 profiles at once.',
      })
      return
    }

    // Navigate to comparison page with selected profile IDs
    navigate(`/compare?ids=${selectedProfiles.join(',')}`)
  }

  // Quick actions handlers
  const handleMessage = (professionalId, professionalName) => {
    navigate('/messages', { state: { openConversationWithUserId: professionalId } })
  }

  const handleBookNow = (professionalId, professionalName) => {
    navigate(`/book/${professionalId}`)
  }

  const handleShareProfile = async (professionalId, professionalName) => {
    const profileUrl = `${window.location.origin}/profile/${professionalId}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Check out ${professionalName}'s profile`,
          text: `View ${professionalName} on TIES Together`,
          url: profileUrl
        })
      } catch (err) {
        if (err.name !== 'AbortError') {
          // Fallback to clipboard
          navigator.clipboard.writeText(profileUrl)
          toast({
            title: 'Link copied',
            description: 'Profile link copied to clipboard.',
          })
        }
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(profileUrl)
      toast({
        title: 'Link copied',
        description: 'Profile link copied to clipboard.',
      })
    }
  }

  const handleAddContact = async (professionalId, professionalName) => {
    // This would integrate with a contacts/network feature
    // For now, just add to favorites
    try {
      await addFavorite(professionalId)
      setFavorites(prev => [...prev, professionalId])
      toast({
        title: 'Added to network',
        description: `${professionalName} has been added to your network.`,
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to add to network.',
      })
    }
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
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Discover Talent</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Find the perfect creative professionals for your projects
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, skills, or services..."
              className="pl-10 pr-4 py-3"
            />
          </div>
        </div>

        {/* Main Layout: Sidebar + Content */}
        <div className="flex gap-6">
          {/* Filter Sidebar - Surreal Style */}
          <aside className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-64 flex-shrink-0`}>
            <Card className="sticky top-4 bg-surface border border-app rounded-xl">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold flex items-center">
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    Filters
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-xs h-7 px-2"
                  >
                    Clear
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 text-sm">
                {/* Role Type */}
                <div>
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                    Role Type
                  </Label>
                  <div className="space-y-2">
                    {roleOptions.map((role) => {
                      const Icon = role.icon
                      const count = role.value === 'all' ? filteredProfessionals.length :
                                    filteredProfessionals.filter(p => p.role === role.value).length
                      return (
                        <button
                          key={role.value}
                          onClick={() => setSelectedRole(role.value)}
                          className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors ${
                            selectedRole === role.value
                              ? 'bg-primary/10 text-primary border border-primary/20'
                              : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <Icon className="w-4 h-4" />
                            <span className="text-sm">{role.label}</span>
                          </div>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            ({professionals.length})
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Location */}
                <div>
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                    Location
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      placeholder="City, Country"
                      className="pl-8 h-9 text-sm"
                    />
                  </div>
                </div>

                {/* Sort By */}
                <div>
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                    Sort By
                  </Label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                    Price Range (£/hour)
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                      placeholder="Min"
                      className="w-full h-9 text-sm"
                    />
                    <span className="text-slate-400">-</span>
                    <Input
                      type="number"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 500])}
                      placeholder="Max"
                      className="w-full h-9 text-sm"
                    />
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                    Skills
                  </Label>
                  <div className="flex flex-wrap gap-1.5">
                    {skillOptions.slice(0, 8).map(skill => (
                      <button
                        key={skill}
                        onClick={() =>
                          selectedSkills.includes(skill)
                            ? removeSkillFilter(skill)
                            : addSkillFilter(skill)
                        }
                        className={`text-xs px-2 py-1 rounded-md transition-colors ${
                          selectedSkills.includes(skill)
                            ? 'bg-primary text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {/* Top Bar: Results count + View modes + Mobile filter toggle */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center space-x-1"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>Filters</span>
                </Button>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {filteredProfessionals.length} result{filteredProfessionals.length !== 1 ? 's' : ''}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                {/* Bulk Actions Toggle */}
                <Button
                  variant={bulkActionMode ? "default" : "outline"}
                  size="sm"
                  onClick={toggleBulkMode}
                  className="h-9"
                >
                  <CheckSquare className="w-4 h-4 mr-2" />
                  Select
                </Button>

                {/* View Mode Toggles */}
                <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
                <Button
                  variant={viewMode === 'grid' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="w-9 h-9 p-0"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="w-9 h-9 p-0"
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'map' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode('map')}
                  className="w-9 h-9 p-0"
                >
                  <Map className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Active Filters Pills */}
            {(selectedSkills.length > 0 || selectedLocation || selectedRole !== 'all') && (
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="text-xs text-slate-600 dark:text-slate-400">Active:</span>
                {selectedRole !== 'all' && (
                  <Badge variant="secondary" className="flex items-center space-x-1 h-6">
                    <span>{roleOptions.find(r => r.value === selectedRole)?.label}</span>
                    <button onClick={() => setSelectedRole('all')}>
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {selectedLocation && (
                  <Badge variant="secondary" className="flex items-center space-x-1 h-6">
                    <span>{selectedLocation}</span>
                    <button onClick={() => setSelectedLocation('')}>
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {selectedSkills.map(skill => (
                  <Badge key={skill} variant="secondary" className="flex items-center space-x-1 h-6">
                    <span>{skill}</span>
                    <button onClick={() => removeSkillFilter(skill)}>
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {/* Bulk Action Toolbar */}
            {bulkActionMode && (
              <Card className="mb-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    {/* Selection Info */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                          {selectedProfiles.length} selected
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="link"
                          size="sm"
                          onClick={selectAllProfiles}
                          className="h-auto p-0 text-xs text-blue-600 dark:text-blue-400"
                        >
                          Select all ({filteredProfessionals.length})
                        </Button>
                        {selectedProfiles.length > 0 && (
                          <>
                            <span className="text-slate-300 dark:text-slate-600">|</span>
                            <Button
                              variant="link"
                              size="sm"
                              onClick={clearSelection}
                              className="h-auto p-0 text-xs text-blue-600 dark:text-blue-400"
                            >
                              Clear
                            </Button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Bulk Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={bulkAddToFavorites}
                        disabled={selectedProfiles.length === 0}
                      >
                        <Heart className="w-4 h-4 mr-2" />
                        Add to Favorites
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={bulkCompare}
                        disabled={selectedProfiles.length < 2}
                      >
                        <GitCompare className="w-4 h-4 mr-2" />
                        Compare
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleBulkMode}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
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
          <EmptyState
            icon={Users}
            title="No profiles found"
            description="Try adjusting your search filters or browse all available talent."
            action={{
              label: "Clear Filters",
              onClick: clearAllFilters
            }}
          />
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
              <Card
                key={professional.id}
                className={`relative group hover:shadow-lg transition-shadow bg-white dark:bg-[#121620] border-slate-200 dark:border-slate-700 ${professional.featured ? 'ring-2 ring-yellow-200 dark:ring-yellow-600' : ''} ${bulkActionMode && selectedProfiles.includes(professional.id) ? 'ring-2 ring-blue-500' : ''} ${bulkActionMode ? 'cursor-pointer' : ''}`}
                onClick={bulkActionMode ? () => toggleProfileSelection(professional.id) : undefined}
              >
                {/* Bulk Selection Checkbox */}
                {bulkActionMode && (
                  <div className="absolute top-3 left-3 z-20">
                    <button
                      onClick={() => toggleProfileSelection(professional.id)}
                      className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                        selectedProfiles.includes(professional.id)
                          ? 'bg-blue-600 border-blue-600'
                          : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:border-blue-500'
                      }`}
                    >
                      {selectedProfiles.includes(professional.id) && (
                        <Check className="w-4 h-4 text-white" />
                      )}
                    </button>
                  </div>
                )}

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
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleFavorite(professional.id)
                            }}
                            className="text-slate-400 dark:text-slate-500 hover:text-red-500 transition-colors p-1"
                          >
                            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                          </button>

                          {/* Quick Actions Menu */}
                          {!bulkActionMode && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleMessage(professional.id, professional.name)
                                  }}
                                >
                                  <MessageCircle className="w-4 h-4 mr-2" />
                                  Send Message
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleBookNow(professional.id, professional.name)
                                  }}
                                >
                                  <Calendar className="w-4 h-4 mr-2" />
                                  Book Now
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    navigate(`/profile/${professional.id}`)
                                  }}
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Full Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleShareProfile(professional.id, professional.name)
                                  }}
                                >
                                  <Share2 className="w-4 h-4 mr-2" />
                                  Share Profile
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleAddContact(professional.id, professional.name)
                                  }}
                                  disabled={isFavorite}
                                >
                                  <UserPlus className="w-4 h-4 mr-2" />
                                  {isFavorite ? 'Already in Network' : 'Add to Network'}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
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
      </div>
    </div>
  )
}

export default DiscoveryPage

