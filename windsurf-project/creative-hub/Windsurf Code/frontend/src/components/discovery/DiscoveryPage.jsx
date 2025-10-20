import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  X
} from 'lucide-react'

const DiscoveryPage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRole, setSelectedRole] = useState('all')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [selectedSkills, setSelectedSkills] = useState([])
  const [priceRange, setPriceRange] = useState([0, 500])
  const [sortBy, setSortBy] = useState('relevance')
  const [viewMode, setViewMode] = useState('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [favorites, setFavorites] = useState([])

  // Mock data for creative professionals
  const [professionals, setProfessionals] = useState([
    {
      id: 1,
      name: 'Sarah Chen',
      role: 'freelancer',
      title: 'UI/UX Designer & Illustrator',
      location: 'London, UK',
      avatar: null,
      rating: 4.9,
      reviewCount: 47,
      hourlyRate: 85,
      skills: ['UI Design', 'Illustration', 'Figma', 'Adobe Creative Suite'],
      bio: 'Award-winning designer with 8+ years creating beautiful digital experiences.',
      portfolio: ['Brand identity for tech startups', 'Mobile app designs', 'Digital illustrations'],
      availability: 'available',
      featured: true,
      profileViews: 234,
      completedProjects: 89
    },
    {
      id: 2,
      name: 'Marcus Rodriguez',
      role: 'freelancer',
      title: 'Video Producer & Editor',
      location: 'Manchester, UK',
      avatar: null,
      rating: 4.8,
      reviewCount: 32,
      hourlyRate: 75,
      skills: ['Video Production', 'After Effects', 'Premiere Pro', 'Motion Graphics'],
      bio: 'Creative video producer specializing in brand storytelling and social media content.',
      portfolio: ['Corporate videos', 'Social media campaigns', 'Event documentation'],
      availability: 'busy',
      featured: false,
      profileViews: 156,
      completedProjects: 45
    },
    {
      id: 3,
      name: 'The Creative Collective',
      role: 'collective',
      title: 'Full-Service Creative Agency',
      location: 'Birmingham, UK',
      avatar: null,
      rating: 4.7,
      reviewCount: 28,
      hourlyRate: 120,
      skills: ['Branding', 'Web Development', 'Photography', 'Marketing'],
      bio: 'A diverse team of creatives offering end-to-end brand and digital solutions.',
      portfolio: ['Complete brand overhauls', 'E-commerce websites', 'Marketing campaigns'],
      availability: 'available',
      featured: true,
      profileViews: 189,
      completedProjects: 67
    },
    {
      id: 4,
      name: 'Riverside Studios',
      role: 'venue',
      title: 'Photography & Event Space',
      location: 'Leeds, UK',
      avatar: null,
      rating: 4.6,
      reviewCount: 15,
      hourlyRate: 200,
      skills: ['Photography Studio', 'Event Space', 'Equipment Rental', 'Catering'],
      bio: 'Modern studio space perfect for photoshoots, events, and creative workshops.',
      portfolio: ['Fashion photoshoots', 'Corporate events', 'Art exhibitions'],
      availability: 'available',
      featured: false,
      profileViews: 98,
      completedProjects: 23
    },
    {
      id: 5,
      name: 'TechSound Pro',
      role: 'vendor',
      title: 'Audio Equipment & Services',
      location: 'Liverpool, UK',
      avatar: null,
      rating: 4.9,
      reviewCount: 41,
      hourlyRate: 150,
      skills: ['Audio Equipment', 'Sound Engineering', 'Live Events', 'Recording'],
      bio: 'Professional audio equipment rental and sound engineering services.',
      portfolio: ['Concert sound systems', 'Corporate AV', 'Recording sessions'],
      availability: 'available',
      featured: false,
      profileViews: 145,
      completedProjects: 78
    },
    {
      id: 6,
      name: 'Emma Thompson',
      role: 'organiser',
      title: 'Event Producer & Coordinator',
      location: 'Edinburgh, UK',
      avatar: null,
      rating: 4.8,
      reviewCount: 36,
      hourlyRate: 95,
      skills: ['Event Planning', 'Project Management', 'Vendor Coordination', 'Budget Management'],
      bio: 'Experienced event producer specializing in creative industry gatherings and launches.',
      portfolio: ['Art gallery openings', 'Fashion shows', 'Creative conferences'],
      availability: 'available',
      featured: true,
      profileViews: 167,
      completedProjects: 52
    }
  ])

  const [filteredProfessionals, setFilteredProfessionals] = useState(professionals)

  const roleOptions = [
    { value: 'all', label: 'All Roles', icon: Users },
    { value: 'freelancer', label: 'Freelancers', icon: Briefcase },
    { value: 'collective', label: 'Collectives', icon: Users },
    { value: 'venue', label: 'Venues', icon: Building },
    { value: 'vendor', label: 'Vendors', icon: Package },
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

  // Filter and search logic
  useEffect(() => {
    let filtered = professionals.filter(professional => {
      // Text search
      const matchesSearch = searchQuery === '' || 
        professional.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        professional.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        professional.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))

      // Role filter
      const matchesRole = selectedRole === 'all' || professional.role === selectedRole

      // Location filter
      const matchesLocation = selectedLocation === '' || 
        professional.location.toLowerCase().includes(selectedLocation.toLowerCase())

      // Skills filter
      const matchesSkills = selectedSkills.length === 0 || 
        selectedSkills.some(skill => professional.skills.includes(skill))

      // Price range filter
      const matchesPrice = professional.hourlyRate >= priceRange[0] && 
        professional.hourlyRate <= priceRange[1]

      return matchesSearch && matchesRole && matchesLocation && matchesSkills && matchesPrice
    })

    // Sort results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating
        case 'price_low':
          return a.hourlyRate - b.hourlyRate
        case 'price_high':
          return b.hourlyRate - a.hourlyRate
        case 'recent':
          return b.profileViews - a.profileViews
        default:
          // Relevance: featured first, then by rating
          if (a.featured && !b.featured) return -1
          if (!a.featured && b.featured) return 1
          return b.rating - a.rating
      }
    })

    setFilteredProfessionals(filtered)
  }, [searchQuery, selectedRole, selectedLocation, selectedSkills, priceRange, sortBy, professionals])

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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Discover Talent</h1>
          <p className="text-gray-600 mt-1">
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

        {/* Professionals Grid/List */}
        <div className={viewMode === 'grid' 
          ? "grid md:grid-cols-2 lg:grid-cols-3 gap-6" 
          : "space-y-4"
        }>
          {filteredProfessionals.map((professional) => {
            const Icon = getRoleIcon(professional.role)
            const isFavorite = favorites.includes(professional.id)

            return (
              <Card key={professional.id} className={`relative group hover:shadow-lg transition-shadow ${professional.featured ? 'ring-2 ring-yellow-200' : ''}`}>
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
                          <Icon className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-500 capitalize">{professional.role}</span>
                        </div>
                        <button
                          onClick={() => toggleFavorite(professional.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                        </button>
                      </div>

                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {professional.name}
                      </h3>
                      <p className="text-gray-600 mb-2">{professional.title}</p>

                      <div className="flex items-center justify-center space-x-4 mb-3 text-sm text-gray-500">
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

                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
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
                          <Button size="sm" variant="outline">
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

        {/* Empty State */}
        {filteredProfessionals.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No results found
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search criteria or filters to find what you're looking for.
            </p>
            <Button onClick={clearAllFilters}>
              Clear All Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default DiscoveryPage

