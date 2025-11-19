/**
 * Geocoding utilities using Mapbox Geocoding API
 * Converts city names to latitude/longitude coordinates
 */

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN

export interface Coordinates {
  latitude: number
  longitude: number
}

/**
 * Geocode a location string to coordinates
 * @param location - City name or address (e.g., "Sydney, Australia")
 * @returns Coordinates object with latitude and longitude
 */
export async function geocodeLocation(location: string): Promise<Coordinates | null> {
  if (!location || location.trim() === '') {
    return null
  }

  try {
    const encodedLocation = encodeURIComponent(location)
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedLocation}.json?access_token=${MAPBOX_TOKEN}&limit=1`

    const response = await fetch(url)

    if (!response.ok) {
      console.error('Geocoding API error:', response.statusText)
      return null
    }

    const data = await response.json()

    if (data.features && data.features.length > 0) {
      const [longitude, latitude] = data.features[0].center
      return { latitude, longitude }
    }

    console.warn(`No geocoding results found for: ${location}`)
    return null
  } catch (error) {
    console.error('Geocoding error:', error)
    return null
  }
}

/**
 * Geocode multiple locations in batch
 * @param locations - Array of location strings
 * @returns Array of coordinates (null for failed geocodes)
 */
export async function geocodeLocations(locations: string[]): Promise<(Coordinates | null)[]> {
  const promises = locations.map(location => geocodeLocation(location))
  return Promise.all(promises)
}

/**
 * Get default coordinates for fallback
 * @returns Default coordinates (Sydney, Australia)
 */
export function getDefaultCoordinates(): Coordinates {
  return {
    latitude: -33.8688, // Sydney
    longitude: 151.2093
  }
}
