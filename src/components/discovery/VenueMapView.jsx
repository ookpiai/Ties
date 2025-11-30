import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import ReactMapGL, { Marker, Popup, NavigationControl, GeolocateControl } from 'react-map-gl'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  MapPin,
  Star,
  Eye,
  Loader2,
  Navigation,
  RefreshCw
} from 'lucide-react'
import { searchProfiles } from '../../api/profiles'
import { geocodeLocation, getDefaultCoordinates } from '../../api/geocoding'
import 'mapbox-gl/dist/mapbox-gl.css'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN

const VenueMapView = ({ profiles = null, selectedRole = 'all', searchQuery = '', selectedLocation = '' }) => {
  const navigate = useNavigate()
  const mapRef = useRef()

  // Map state
  const defaultCoords = getDefaultCoordinates()
  const [viewState, setViewState] = useState({
    longitude: defaultCoords.longitude, // Sydney, Australia default
    latitude: defaultCoords.latitude,
    zoom: 10
  })

  // Data state
  const [venues, setVenues] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Popup state
  const [selectedVenue, setSelectedVenue] = useState(null)
  const [popupInfo, setPopupInfo] = useState(null)

  // Load venues from Supabase or use passed profiles
  useEffect(() => {
    if (profiles) {
      // Use profiles passed from parent (already filtered)
      geocodeProfiles(profiles)
    } else {
      loadVenues()
    }
  }, [profiles, selectedRole, searchQuery, selectedLocation])

  // Geocode profiles passed from parent
  const geocodeProfiles = async (profileList) => {
    setIsLoading(true)
    setError('')

    try {
      const geocodedProfiles = await Promise.all(
        profileList.map(async (profile) => {
          const locationString = profile.location || profile.city || ''

          const coords = await geocodeLocation(locationString)

          if (coords) {
            return {
              id: profile.id,
              name: profile.name || profile.display_name || 'Anonymous User',
              role: profile.originalRole || profile.role,
              specialty: profile.specialty,
              location: locationString || 'Location not specified',
              avatar: profile.avatar || profile.avatar_url,
              bio: profile.bio || 'No description available',
              longitude: coords.longitude,
              latitude: coords.latitude
            }
          }
          return null
        })
      )

      const validVenues = geocodedProfiles.filter(venue => venue !== null)
      setVenues(validVenues)

      if (validVenues.length > 0) {
        setViewState(prev => ({
          ...prev,
          longitude: validVenues[0].longitude,
          latitude: validVenues[0].latitude,
          zoom: 10
        }))
      }
    } catch (err) {
      console.error('Failed to geocode profiles:', err)
      setError('Failed to load map locations.')
    } finally {
      setIsLoading(false)
    }
  }

  const loadVenues = async () => {
    setIsLoading(true)
    setError('')

    try {
      // Search for all user profiles (all roles)
      const profilesData = await searchProfiles({})

      // Geocode all user locations in parallel
      const geocodedProfiles = await Promise.all(
        profilesData.map(async (profile) => {
          const locationString = profile.city || ''

          // Try to geocode the location
          const coords = await geocodeLocation(locationString)

          // If geocoding succeeds, use real coordinates
          // Otherwise, skip this user (no coordinates = won't show on map)
          if (coords) {
            return {
              id: profile.id,
              name: profile.display_name || 'Anonymous User',
              role: profile.role,
              specialty: profile.specialty,
              location: profile.city || 'Location not specified',
              avatar: profile.avatar_url,
              bio: profile.bio || 'No description available',
              longitude: coords.longitude,
              latitude: coords.latitude
            }
          }
          return null
        })
      )

      // Filter out users without valid coordinates
      const validVenues = geocodedProfiles.filter(venue => venue !== null)

      setVenues(validVenues)

      // Center map on first user's location if available
      if (validVenues.length > 0) {
        setViewState(prev => ({
          ...prev,
          longitude: validVenues[0].longitude,
          latitude: validVenues[0].latitude,
          zoom: 10
        }))
      }
    } catch (err) {
      console.error('Failed to load profiles:', err)
      setError('Failed to load profiles. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const searchThisArea = () => {
    // Get current map bounds
    const map = mapRef.current?.getMap()
    if (!map) return

    const bounds = map.getBounds()
    console.log('Searching in bounds:', bounds)

    // TODO: Filter venues by map bounds
    // For now, just reload all venues
    loadVenues()
  }

  const handleMarkerClick = (venue) => {
    setSelectedVenue(venue)
    setPopupInfo({
      longitude: venue.longitude,
      latitude: venue.latitude
    })
  }

  const closePopup = () => {
    setSelectedVenue(null)
    setPopupInfo(null)
  }

  const getInitials = (name) => {
    if (!name) return 'V'
    const names = name.split(' ')
    if (names.length >= 2) {
      return `${names[0].charAt(0)}${names[1].charAt(0)}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  // Get marker color based on user role
  const getMarkerColor = (role) => {
    const colorMap = {
      'Artist': 'bg-purple-500',      // Freelancers/Artists - Purple
      'Freelancer': 'bg-purple-500',  // Freelancers - Purple
      'Crew': 'bg-blue-500',          // Crew - Blue
      'Vendor': 'bg-emerald-500',     // Vendors - Emerald
      'Venue': 'bg-sky-500',          // Venues - Sky Blue
      'Organiser': 'bg-orange-500'    // Organisers - Orange
    }
    return colorMap[role] || 'bg-gray-500'
  }

  // Get role display name
  const getRoleDisplay = (role) => {
    const roleMap = {
      'Artist': 'Freelancer',
      'Freelancer': 'Freelancer',
      'Crew': 'Crew',
      'Vendor': 'Vendor',
      'Venue': 'Venue',
      'Organiser': 'Organiser'
    }
    return roleMap[role] || 'User'
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <MapPin className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to Load Map</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadVenues}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="relative h-full w-full">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 dark:bg-black/80 z-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-300">Loading users...</p>
          </div>
        </div>
      )}

      {/* Map Container */}
      <ReactMapGL
        ref={mapRef}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
      >
        {/* Map Controls */}
        <NavigationControl position="top-right" />
        <GeolocateControl
          position="top-right"
          trackUserLocation
          showUserHeading
        />

        {/* User Markers */}
        {venues.map(venue => (
          <Marker
            key={venue.id}
            longitude={venue.longitude}
            latitude={venue.latitude}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation()
              handleMarkerClick(venue)
            }}
          >
            <div className="cursor-pointer hover:scale-110 transition-transform">
              <div className={`${getMarkerColor(venue.role)} text-white rounded-full p-2 shadow-lg`}>
                <MapPin className="w-6 h-6" />
              </div>
            </div>
          </Marker>
        ))}

        {/* User Popup */}
        {popupInfo && selectedVenue && (
          <Popup
            longitude={popupInfo.longitude}
            latitude={popupInfo.latitude}
            anchor="bottom"
            onClose={closePopup}
            closeOnClick={false}
            className="venue-popup"
          >
            <Card className="border-0 shadow-none max-w-xs">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={selectedVenue.avatar} />
                    <AvatarFallback>{getInitials(selectedVenue.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm mb-1 truncate">
                      {selectedVenue.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {getRoleDisplay(selectedVenue.role)}
                      </Badge>
                    </div>
                    <div className="flex items-center text-xs text-gray-600 mb-2">
                      <MapPin className="w-3 h-3 mr-1" />
                      <span className="truncate">{selectedVenue.location}</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                      {selectedVenue.bio}
                    </p>
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => navigate(`/profile/${selectedVenue.id}`)}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View Profile
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Popup>
        )}
      </ReactMapGL>

      {/* Search This Area Button */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
        <Button
          onClick={searchThisArea}
          className="shadow-lg"
        >
          <Navigation className="w-4 h-4 mr-2" />
          Search This Area
        </Button>
      </div>

      {/* User Count Badge */}
      <div className="absolute bottom-4 left-4 z-10">
        <Badge variant="secondary" className="text-sm py-2 px-3 shadow-lg">
          <MapPin className="w-4 h-4 mr-1" />
          {venues.length} {venues.length === 1 ? 'user' : 'users'} found
        </Badge>
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-4 right-4 z-10">
        <Card className="p-3">
          <CardContent className="p-0">
            <h4 className="text-xs font-semibold mb-2 text-gray-700 dark:text-gray-300">Map Legend</h4>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="bg-purple-500 rounded-full p-1">
                  <MapPin className="w-3 h-3 text-white" />
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-400">Freelancer</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-emerald-500 rounded-full p-1">
                  <MapPin className="w-3 h-3 text-white" />
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-400">Vendor</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-sky-500 rounded-full p-1">
                  <MapPin className="w-3 h-3 text-white" />
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-400">Venue</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-orange-500 rounded-full p-1">
                  <MapPin className="w-3 h-3 text-white" />
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-400">Organiser</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default VenueMapView
