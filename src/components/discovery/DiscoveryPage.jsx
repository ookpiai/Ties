import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import VenueMapView from './VenueMapView'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import EmptyState from '@/components/ui/EmptyState'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
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
  ExternalLink,
  ShieldCheck,
  Zap,
  CheckCircle,
  Crown,
  Image,
  ArrowUpDown
} from 'lucide-react'
import { searchProfiles } from '../../api/profiles'
import { getSpecialtyLabel } from '../../constants/specialties'
import { getFavorites, addFavorite, removeFavorite } from '../../api/favorites'
import { useToast } from '@/hooks/use-toast'
import { HelpTooltip, FeatureTip } from '@/components/ui/HelpTooltip'
import { helpContent } from '../../constants/helpContent'

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

  // Badge filter state (per badge.md spec)
  const [selectedBadgeFilters, setSelectedBadgeFilters] = useState([])

  // Popover open states for filter dropdowns
  const [openPopover, setOpenPopover] = useState(null)

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

        // Build filter object with all active filters
        const filters = {
          query: searchQuery || undefined,
          role: selectedRole === 'all' || selectedRole === 'freelancer' ? undefined : supabaseRole?.[0],
          location: selectedLocation || undefined,
          // Price range filter (only apply if modified from default)
          minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
          maxPrice: priceRange[1] < 500 ? priceRange[1] : undefined,
          // Skills/specialty filter
          specialties: selectedSkills.length > 0 ? selectedSkills : undefined,
          // Badge filters
          badges: selectedBadgeFilters.length > 0 ? selectedBadgeFilters : undefined,
          // Sort option
          sortBy: sortBy !== 'relevance' ? sortBy : undefined
        }

        // Fetch profiles with all filters applied
        const profiles = await searchProfiles(filters)

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
        } else if (selectedRole === 'organiser') {
          filteredProfiles = profiles.filter(p => p.role === 'Organiser')
        }

        // Transform Supabase profiles to match component's expected format
        // Now includes real data from profile_stats!
        const transformedProfiles = filteredProfiles.map(profile => ({
          id: profile.id,
          username: profile.username, // For booking route
          name: profile.display_name || 'Anonymous',
          role: mapSupabaseRoleToComponentRole(profile.role),
          originalRole: profile.role, // Keep original role for specialty label lookup
          specialty: profile.specialty,
          specialty_display_name: profile.specialty_display_name || getSpecialtyLabel(profile.role, profile.specialty),
          title: profile.role || 'Creative Professional',
          location: profile.city || 'Location not specified',
          avatar: profile.avatar_url,
          // Real data from profile_stats
          rating: profile.average_rating || 0,
          reviewCount: profile.total_reviews || 0,
          hourlyRate: profile.hourly_rate || 0,
          // Skills from specialty (can be expanded later)
          skills: profile.specialty ? [profile.specialty_display_name || profile.specialty] : [],
          bio: profile.bio || 'No bio available',
          portfolio: [],
          // Real availability status
          availability: profile.public_booking_enabled ? 'available' : 'unavailable',
          featured: false,
          profileViews: 0,
          completedProjects: profile.total_bookings_completed || 0,
          // Additional data for badges
          emailVerified: profile.email_verified,
          onTimeRate: profile.on_time_delivery_rate || 100,
          lastActiveAt: profile.last_active_at
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
  }, [searchQuery, selectedRole, selectedLocation, priceRange, selectedSkills, selectedBadgeFilters, sortBy])

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
    { value: 'venue', label: 'Venues', icon: Building },
    { value: 'organiser', label: 'Organisers', icon: Calendar }
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

  // Badge filter options per badge.md spec
  const badgeFilterOptions = [
    { value: 'verified', label: 'Verified', icon: ShieldCheck, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    { value: 'activity', label: 'Active (30 days)', icon: Zap, color: 'text-orange-600', bgColor: 'bg-orange-100' },
    { value: 'completion', label: 'Reliable', icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100' },
    { value: 'quality', label: 'Top Rated', icon: Star, color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
    { value: 'ties_pro', label: 'TIES Pro', icon: Crown, color: 'text-amber-600', bgColor: 'bg-amber-100' }
  ]

  // Toggle badge filter
  const toggleBadgeFilter = (badge) => {
    setSelectedBadgeFilters(prev =>
      prev.includes(badge)
        ? prev.filter(b => b !== badge)
        : [...prev, badge]
    )
  }

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

  const handleBookNow = (professional) => {
    // Use username for booking route if available, otherwise navigate to profile
    if (professional.username) {
      navigate(`/book/${professional.username}`)
    } else {
      // Fallback: navigate to profile page if no username
      navigate(`/profile/${professional.id}`)
      toast({
        title: 'Booking not available',
        description: 'This professional hasn\'t set up direct booking yet. View their profile to contact them.',
        variant: 'default'
      })
    }
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
    setSelectedBadgeFilters([])
  }

  const getRoleIcon = (role) => {
    const roleOption = roleOptions.find(option => option.value === role)
    return roleOption ? roleOption.icon : Briefcase
  }

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  // Get active filter count for badge display
  const getActiveFilterCount = () => {
    let count = 0
    if (selectedRole !== 'all') count++
    if (selectedLocation) count++
    if (selectedSkills.length > 0) count += selectedSkills.length
    if (selectedBadgeFilters.length > 0) count += selectedBadgeFilters.length
    if (priceRange[0] > 0 || priceRange[1] < 500) count++
    return count
  }

  // Check if any filters are active
  const hasActiveFilters = getActiveFilterCount() > 0

  // Filter button component for consistent styling
  const FilterButton = ({ label, isActive, activeCount, isOpen, onClick, children }) => (
    <Popover open={isOpen} onOpenChange={(open) => setOpenPopover(open ? label : null)}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`h-10 px-4 rounded-full border-2 transition-all duration-200 ${
            isActive || activeCount > 0
              ? 'border-primary bg-primary/5 text-primary hover:bg-primary/10'
              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
          } ${isOpen ? 'ring-2 ring-primary/20' : ''}`}
        >
          <span className="font-medium">{label}</span>
          {activeCount > 0 && (
            <span className="ml-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
              {activeCount}
            </span>
          )}
          <ChevronDown className={`ml-1.5 h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 p-0 shadow-xl border-slate-200 dark:border-slate-700"
        align="start"
        sideOffset={8}
      >
        {children}
      </PopoverContent>
    </Popover>
  )

  return (
    <div className="min-h-screen bg-app text-app transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Discover Talent
            <HelpTooltip
              content={helpContent.discovery.search.description}
              title={helpContent.discovery.search.title}
              variant="info"
              size="sm"
            />
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Find the perfect creative professionals for your projects
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, skills, or services..."
              className="pl-12 pr-4 h-12 text-base rounded-full border-2 border-slate-200 dark:border-slate-700 focus:border-primary"
            />
          </div>
        </div>

        {/* Modern Dropdown Filter Bar */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-slate-200 dark:border-slate-800">
            {/* Role Type Filter */}
            <FilterButton
              label={selectedRole === 'all' ? 'Role' : roleOptions.find(r => r.value === selectedRole)?.label}
              isActive={selectedRole !== 'all'}
              activeCount={selectedRole !== 'all' ? 1 : 0}
              isOpen={openPopover === 'Role' || openPopover === roleOptions.find(r => r.value === selectedRole)?.label}
            >
              <div className="p-4">
                <h4 className="font-semibold text-sm text-slate-900 dark:text-white mb-3">Role Type</h4>
                <div className="space-y-1">
                  {roleOptions.map((role) => {
                    const Icon = role.icon
                    return (
                      <button
                        key={role.value}
                        onClick={() => {
                          setSelectedRole(role.value)
                          setOpenPopover(null)
                        }}
                        className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                          selectedRole === role.value
                            ? 'bg-primary/10 text-primary'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5" />
                          <span className="font-medium">{role.label}</span>
                        </div>
                        {selectedRole === role.value && (
                          <Check className="w-5 h-5 text-primary" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            </FilterButton>

            {/* Location Filter */}
            <FilterButton
              label={selectedLocation || 'Location'}
              isActive={!!selectedLocation}
              activeCount={selectedLocation ? 1 : 0}
              isOpen={openPopover === (selectedLocation || 'Location')}
            >
              <div className="p-4">
                <h4 className="font-semibold text-sm text-slate-900 dark:text-white mb-3">Location</h4>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    placeholder="City, Country"
                    className="pl-10"
                    autoFocus
                  />
                </div>
                {selectedLocation && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedLocation('')}
                    className="mt-3 w-full text-slate-500"
                  >
                    Clear location
                  </Button>
                )}
              </div>
            </FilterButton>

            {/* Price Range Filter */}
            <FilterButton
              label={priceRange[0] > 0 || priceRange[1] < 500 ? `£${priceRange[0]} - £${priceRange[1]}` : 'Price'}
              isActive={priceRange[0] > 0 || priceRange[1] < 500}
              activeCount={priceRange[0] > 0 || priceRange[1] < 500 ? 1 : 0}
              isOpen={openPopover === 'Price' || openPopover === `£${priceRange[0]} - £${priceRange[1]}`}
            >
              <div className="p-4">
                <h4 className="font-semibold text-sm text-slate-900 dark:text-white mb-3">Price Range (£/hour)</h4>
                <div className="px-2 py-4">
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    min={0}
                    max={500}
                    step={10}
                    className="mb-6"
                  />
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <Label className="text-xs text-slate-500 mb-1 block">Min</Label>
                      <Input
                        type="number"
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                        className="h-9"
                      />
                    </div>
                    <span className="text-slate-400 mt-5">—</span>
                    <div className="flex-1">
                      <Label className="text-xs text-slate-500 mb-1 block">Max</Label>
                      <Input
                        type="number"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 500])}
                        className="h-9"
                      />
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPriceRange([0, 500])}
                  className="w-full text-slate-500"
                >
                  Reset price range
                </Button>
              </div>
            </FilterButton>

            {/* Skills Filter */}
            <FilterButton
              label="Skills"
              isActive={selectedSkills.length > 0}
              activeCount={selectedSkills.length}
              isOpen={openPopover === 'Skills'}
            >
              <div className="p-4">
                <h4 className="font-semibold text-sm text-slate-900 dark:text-white mb-3">Skills & Expertise</h4>
                <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto">
                  {skillOptions.map(skill => (
                    <button
                      key={skill}
                      onClick={() =>
                        selectedSkills.includes(skill)
                          ? removeSkillFilter(skill)
                          : addSkillFilter(skill)
                      }
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedSkills.includes(skill)
                          ? 'bg-primary text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
                {selectedSkills.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedSkills([])}
                    className="mt-3 w-full text-slate-500"
                  >
                    Clear all skills
                  </Button>
                )}
              </div>
            </FilterButton>

            {/* Badge Filter */}
            <FilterButton
              label="Badges"
              isActive={selectedBadgeFilters.length > 0}
              activeCount={selectedBadgeFilters.length}
              isOpen={openPopover === 'Badges'}
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-sm text-slate-900 dark:text-white">Trust Badges</h4>
                  <Link to="/badges" className="text-xs text-primary hover:underline">
                    View Rules
                  </Link>
                </div>
                <div className="space-y-2">
                  {badgeFilterOptions.map(badge => {
                    const Icon = badge.icon
                    const isSelected = selectedBadgeFilters.includes(badge.value)
                    return (
                      <button
                        key={badge.value}
                        onClick={() => toggleBadgeFilter(badge.value)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                          isSelected
                            ? `${badge.bgColor} border-2 border-current`
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-2 border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-1.5 rounded-lg ${badge.bgColor}`}>
                            <Icon className={`w-4 h-4 ${badge.color}`} />
                          </div>
                          <span className={`font-medium ${isSelected ? badge.color : ''}`}>{badge.label}</span>
                        </div>
                        {isSelected && (
                          <Check className={`w-5 h-5 ${badge.color}`} />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            </FilterButton>

            {/* Sort Dropdown */}
            <FilterButton
              label={sortOptions.find(s => s.value === sortBy)?.label || 'Sort'}
              isActive={sortBy !== 'relevance'}
              activeCount={0}
              isOpen={openPopover === sortOptions.find(s => s.value === sortBy)?.label || openPopover === 'Sort'}
            >
              <div className="p-4">
                <h4 className="font-semibold text-sm text-slate-900 dark:text-white mb-3">Sort By</h4>
                <div className="space-y-1">
                  {sortOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSortBy(option.value)
                        setOpenPopover(null)
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                        sortBy === option.value
                          ? 'bg-primary/10 text-primary'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className="font-medium">{option.label}</span>
                      {sortBy === option.value && (
                        <Check className="w-5 h-5 text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </FilterButton>

            {/* Clear All Button (shows when filters active) */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="h-10 px-4 text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-4 h-4 mr-1" />
                Clear all
              </Button>
            )}

            {/* Spacer */}
            <div className="flex-1" />

            {/* View Mode Toggles */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="w-9 h-8 p-0"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode('list')}
                className="w-9 h-8 p-0"
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'map' ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode('map')}
                className="w-9 h-8 p-0"
              >
                <Map className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Results Bar & Active Filters */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                {filteredProfessionals.length} result{filteredProfessionals.length !== 1 ? 's' : ''}
              </p>

              {/* Bulk Actions Toggle */}
              <Button
                variant={bulkActionMode ? "default" : "outline"}
                size="sm"
                onClick={toggleBulkMode}
                className="h-8"
              >
                <CheckSquare className="w-4 h-4 mr-1.5" />
                Select
              </Button>
            </div>

            {/* Active Filter Pills */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2">
                {selectedRole !== 'all' && (
                  <Badge variant="secondary" className="flex items-center gap-1.5 h-7 pl-3 pr-2 rounded-full">
                    <span>{roleOptions.find(r => r.value === selectedRole)?.label}</span>
                    <button
                      onClick={() => setSelectedRole('all')}
                      className="hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </Badge>
                )}
                {selectedLocation && (
                  <Badge variant="secondary" className="flex items-center gap-1.5 h-7 pl-3 pr-2 rounded-full">
                    <MapPin className="w-3 h-3" />
                    <span>{selectedLocation}</span>
                    <button
                      onClick={() => setSelectedLocation('')}
                      className="hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </Badge>
                )}
                {(priceRange[0] > 0 || priceRange[1] < 500) && (
                  <Badge variant="secondary" className="flex items-center gap-1.5 h-7 pl-3 pr-2 rounded-full">
                    <DollarSign className="w-3 h-3" />
                    <span>£{priceRange[0]} - £{priceRange[1]}</span>
                    <button
                      onClick={() => setPriceRange([0, 500])}
                      className="hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </Badge>
                )}
                {selectedSkills.map(skill => (
                  <Badge key={skill} variant="secondary" className="flex items-center gap-1.5 h-7 pl-3 pr-2 rounded-full">
                    <span>{skill}</span>
                    <button
                      onClick={() => removeSkillFilter(skill)}
                      className="hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </Badge>
                ))}
                {selectedBadgeFilters.map(badgeKey => {
                  const badge = badgeFilterOptions.find(b => b.value === badgeKey)
                  if (!badge) return null
                  const Icon = badge.icon
                  return (
                    <Badge
                      key={badgeKey}
                      className={`flex items-center gap-1.5 h-7 pl-2 pr-2 rounded-full ${badge.bgColor} ${badge.color} border-0`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{badge.label}</span>
                      <button
                        onClick={() => toggleBadgeFilter(badgeKey)}
                        className="hover:opacity-70 rounded-full p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </Badge>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0">

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
              <div className="h-[600px] rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <VenueMapView
                  profiles={filteredProfessionals}
                  selectedRole={selectedRole}
                  searchQuery={searchQuery}
                  selectedLocation={selectedLocation}
                />
              </div>
            )}

            {/* Professionals Grid/List */}
            {!isLoading && !error && filteredProfessionals.length > 0 && viewMode !== 'map' && (
              <div className={viewMode === 'grid'
                ? "grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
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
                                    handleBookNow(professional)
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
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleMessage(professional.id, professional.name)
                            }}
                          >
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
  )
}

export default DiscoveryPage

