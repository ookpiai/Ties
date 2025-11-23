/**
 * Specialty options for two-tier role system
 * Users select a primary role (Freelancer/Vendor/Venue) and then a specialty
 * Specialties are shown on profile cards and used for detailed categorization
 */

export interface SpecialtyOption {
  value: string
  label: string
  category: string
}

export const SPECIALTY_OPTIONS: Record<string, SpecialtyOption[]> = {
  Freelancer: [
    // Performance & Entertainment
    { value: 'dj', label: 'DJ', category: 'Performance & Entertainment' },
    { value: 'mc', label: 'MC / Host', category: 'Performance & Entertainment' },
    { value: 'singer', label: 'Singer', category: 'Performance & Entertainment' },
    { value: 'musician', label: 'Musician', category: 'Performance & Entertainment' },
    { value: 'band', label: 'Band', category: 'Performance & Entertainment' },
    { value: 'dancer', label: 'Dancer', category: 'Performance & Entertainment' },
    { value: 'performer', label: 'Performer', category: 'Performance & Entertainment' },
    { value: 'actor', label: 'Actor', category: 'Performance & Entertainment' },
    { value: 'comedian', label: 'Comedian', category: 'Performance & Entertainment' },

    // Visual Arts & Media
    { value: 'photographer', label: 'Photographer', category: 'Visual Arts & Media' },
    { value: 'videographer', label: 'Videographer', category: 'Visual Arts & Media' },
    { value: 'editor', label: 'Editor', category: 'Visual Arts & Media' },
    { value: 'drone_operator', label: 'Drone Operator', category: 'Visual Arts & Media' },
    { value: 'graphic_designer', label: 'Graphic Designer', category: 'Visual Arts & Media' },

    // Event Services
    { value: 'bartender', label: 'Bartender', category: 'Event Services' },
    { value: 'waiter', label: 'Waiter / Server', category: 'Event Services' },
    { value: 'event_coordinator', label: 'Event Coordinator', category: 'Event Services' },
    { value: 'security', label: 'Security', category: 'Event Services' },

    // Creative Services
    { value: 'makeup_artist', label: 'Makeup Artist', category: 'Creative Services' },
    { value: 'hair_stylist', label: 'Hair Stylist', category: 'Creative Services' },
    { value: 'stylist', label: 'Stylist', category: 'Creative Services' },
    { value: 'florist', label: 'Florist', category: 'Creative Services' },

    // Technical
    { value: 'sound_engineer', label: 'Sound Engineer', category: 'Technical' },
    { value: 'lighting_technician', label: 'Lighting Technician', category: 'Technical' },
    { value: 'stage_manager', label: 'Stage Manager', category: 'Technical' },
  ],

  Vendor: [
    // Food & Beverage
    { value: 'catering', label: 'Catering', category: 'Food & Beverage' },
    { value: 'mobile_bar', label: 'Mobile Bar', category: 'Food & Beverage' },
    { value: 'coffee_cart', label: 'Coffee Cart', category: 'Food & Beverage' },
    { value: 'food_truck', label: 'Food Truck', category: 'Food & Beverage' },
    { value: 'desserts', label: 'Desserts', category: 'Food & Beverage' },
    { value: 'beverage_supplier', label: 'Beverage Supplier', category: 'Food & Beverage' },

    // Equipment & Technology
    { value: 'av_equipment', label: 'AV Equipment', category: 'Equipment & Technology' },
    { value: 'lighting_equipment', label: 'Lighting Equipment', category: 'Equipment & Technology' },
    { value: 'sound_equipment', label: 'Sound Equipment', category: 'Equipment & Technology' },
    { value: 'photography_equipment', label: 'Photography Equipment', category: 'Equipment & Technology' },
    { value: 'dj_equipment', label: 'DJ Equipment', category: 'Equipment & Technology' },
    { value: 'projection_equipment', label: 'Projection Equipment', category: 'Equipment & Technology' },

    // Event Infrastructure
    { value: 'staging', label: 'Staging', category: 'Event Infrastructure' },
    { value: 'tenting', label: 'Tenting', category: 'Event Infrastructure' },
    { value: 'furniture', label: 'Furniture', category: 'Event Infrastructure' },
    { value: 'flooring', label: 'Flooring', category: 'Event Infrastructure' },
    { value: 'fencing', label: 'Fencing', category: 'Event Infrastructure' },
    { value: 'generators', label: 'Generators', category: 'Event Infrastructure' },

    // Decoration & Design
    { value: 'decor', label: 'Decor', category: 'Decoration & Design' },
    { value: 'floral_design', label: 'Floral Design', category: 'Decoration & Design' },
    { value: 'balloon_services', label: 'Balloon Services', category: 'Decoration & Design' },
    { value: 'signage', label: 'Signage', category: 'Decoration & Design' },
    { value: 'draping', label: 'Draping', category: 'Decoration & Design' },
    { value: 'centerpieces', label: 'Centerpieces', category: 'Decoration & Design' },

    // Production Services
    { value: 'printing', label: 'Printing', category: 'Production Services' },
    { value: 'photo_booth', label: 'Photo Booth', category: 'Production Services' },
    { value: 'video_production', label: 'Video Production', category: 'Production Services' },
    { value: 'live_streaming', label: 'Live Streaming', category: 'Production Services' },
    { value: 'led_screens', label: 'LED Screens', category: 'Production Services' },

    // Logistics
    { value: 'transport', label: 'Transport', category: 'Logistics' },
    { value: 'valet_parking', label: 'Valet Parking', category: 'Logistics' },
    { value: 'security_services', label: 'Security Services', category: 'Logistics' },
    { value: 'cleaning', label: 'Cleaning Services', category: 'Logistics' },
    { value: 'waste_management', label: 'Waste Management', category: 'Logistics' },

    // Other
    { value: 'entertainment_rental', label: 'Entertainment Rental', category: 'Other' },
    { value: 'special_effects', label: 'Special Effects', category: 'Other' },
    { value: 'branding', label: 'Branding', category: 'Other' },
  ],

  Venue: [
    // Indoor Spaces
    { value: 'studio', label: 'Studio', category: 'Indoor Spaces' },
    { value: 'gallery', label: 'Gallery', category: 'Indoor Spaces' },
    { value: 'theater', label: 'Theater', category: 'Indoor Spaces' },
    { value: 'event_hall', label: 'Event Hall', category: 'Indoor Spaces' },
    { value: 'ballroom', label: 'Ballroom', category: 'Indoor Spaces' },
    { value: 'conference_room', label: 'Conference Room', category: 'Indoor Spaces' },
    { value: 'warehouse', label: 'Warehouse', category: 'Indoor Spaces' },
    { value: 'loft', label: 'Loft', category: 'Indoor Spaces' },
    { value: 'restaurant', label: 'Restaurant', category: 'Indoor Spaces' },
    { value: 'bar_club', label: 'Bar / Club', category: 'Indoor Spaces' },

    // Outdoor Spaces
    { value: 'outdoor_space', label: 'Outdoor Space', category: 'Outdoor Spaces' },
    { value: 'garden', label: 'Garden', category: 'Outdoor Spaces' },
    { value: 'rooftop', label: 'Rooftop', category: 'Outdoor Spaces' },
    { value: 'beachfront', label: 'Beachfront', category: 'Outdoor Spaces' },
    { value: 'park', label: 'Park', category: 'Outdoor Spaces' },
    { value: 'farm_barn', label: 'Farm / Barn', category: 'Outdoor Spaces' },
    { value: 'vineyard', label: 'Vineyard', category: 'Outdoor Spaces' },
    { value: 'sports_field', label: 'Sports Field', category: 'Outdoor Spaces' },

    // Specialized Venues
    { value: 'rehearsal_space', label: 'Rehearsal Space', category: 'Specialized Venues' },
    { value: 'recording_studio', label: 'Recording Studio', category: 'Specialized Venues' },
    { value: 'dance_studio', label: 'Dance Studio', category: 'Specialized Venues' },
    { value: 'workshop_space', label: 'Workshop Space', category: 'Specialized Venues' },
    { value: 'showroom', label: 'Showroom', category: 'Specialized Venues' },
    { value: 'museum', label: 'Museum', category: 'Specialized Venues' },
  ],
}

/**
 * Get the display label for a specialty value
 */
export const getSpecialtyLabel = (role: string, specialtyValue: string): string => {
  if (!specialtyValue || !role) return ''

  const options = SPECIALTY_OPTIONS[role] || []
  const specialty = options.find(opt => opt.value === specialtyValue)
  return specialty?.label || specialtyValue
}

/**
 * Get specialties grouped by category for a given role
 */
export const getSpecialtiesByCategory = (role: string): Record<string, SpecialtyOption[]> => {
  const options = SPECIALTY_OPTIONS[role] || []
  const grouped: Record<string, SpecialtyOption[]> = {}

  options.forEach(opt => {
    if (!grouped[opt.category]) {
      grouped[opt.category] = []
    }
    grouped[opt.category].push(opt)
  })

  return grouped
}

/**
 * Get all categories for a role
 */
export const getCategories = (role: string): string[] => {
  const options = SPECIALTY_OPTIONS[role] || []
  const categories = new Set<string>()

  options.forEach(opt => {
    categories.add(opt.category)
  })

  return Array.from(categories)
}

/**
 * Check if a role has specialty options
 */
export const hasSpecialtyOptions = (role: string): boolean => {
  return role !== 'Organiser' && !!SPECIALTY_OPTIONS[role]
}
