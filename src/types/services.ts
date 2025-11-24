/**
 * TypeScript type definitions for services_data JSONB field
 * Amendment 8: Universal Services Page
 * See documentation/SERVICES_DATA_SCHEMA.md for full specification
 */

export type UserRole = 'Freelancer' | 'Vendor' | 'Venue' | 'Organiser'
export type RateType = 'hourly' | 'daily' | 'project' | 'set'
export type PriceType = 'per_item' | 'per_package'

// ===== FREELANCER SERVICES =====
export interface FreelancerServices {
  whatIOffer: {
    roleSkillAreas: string[]        // Required - e.g., ["Photography", "Videography"]
    skills: string[]                 // Required - e.g., ["Adobe Photoshop", "Lightroom"]
    industriesGenres: string[]       // Required - e.g., ["Wedding", "Corporate", "Fashion"]
    serviceDescription?: string      // Optional - detailed description
    additionalSpecialties?: string[] // Optional - beyond primary specialty
  }
  pricingPackages: {
    rateType: RateType               // Required - hourly/daily/project/set
    baseRate: number                 // Required - numeric value
    currency?: string                // Default: 'AUD'
    packageOptions?: Array<{
      name: string
      description: string
      price: number
      includes: string[]
    }>
    addOns?: Array<{
      name: string
      price: number
      description: string
    }>
  }
  logisticsRequirements: {
    travelAvailable: boolean         // Required
    maxTravelDistance?: number       // If travelAvailable (in km)
    travelCost?: string             // e.g., "Included" or "$50 per hour"
    equipmentProvided: boolean       // Required
    equipmentList?: string[]         // If equipmentProvided
    onlineRemoteWork?: boolean      // Optional
    responseTimeExpectation?: string // Optional - e.g., "Within 24 hours"
  }
}

// ===== VENUE SERVICES =====
export interface VenueServices {
  whatIOffer: {
    venueType: string               // Required - from specialty field
    suitabilityTags: string[]       // Required - e.g., ["photoshoots", "events", "workshops"]
    serviceDescription?: string     // Optional - detailed venue description
    additionalVenueTypes?: string[] // Optional - secondary venue uses
  }
  pricingPackages: {
    hourlyRate: number              // Required
    halfDayRate?: number            // Optional (typically 4 hours)
    fullDayRate?: number            // Optional (typically 8-10 hours)
    currency?: string               // Default: 'AUD'
    packages?: Array<{
      name: string                  // e.g., "Weekend Package"
      description: string
      price: number
      duration: string              // e.g., "Saturday & Sunday"
    }>
  }
  logisticsRequirements: {
    capacity: number                // Required - max people
    capacitySeated?: number         // Optional - seated capacity
    featuresAmenities: string[]     // Required - lighting, sound, AC, etc.
    venueRules: {
      noiseRestrictions?: string    // e.g., "No loud music after 10pm"
      operatingHours: string        // Required - e.g., "9am - 11pm"
      bondRequired: boolean         // Required
      bondAmount?: number           // If bondRequired
      alcoholAllowed: boolean       // Required
      smokingAllowed: boolean       // Required
      otherRules?: string          // Optional
    }
    accessibility: {
      wheelchairAccessible: boolean    // Required
      parkingAvailable: boolean        // Required
      parkingSpaces?: number           // If parkingAvailable
      liftElevatorAccess: boolean      // Required
      publicTransportNearby: boolean   // Required
      otherAccessibility?: string      // Optional
    }
    floorPlanUrl?: string           // Optional - uploaded floor plan
  }
}

// ===== VENDOR SERVICES =====
export interface VendorServices {
  whatIOffer: {
    serviceCategory: string         // Required - from specialty field
    productTypes: string[]          // Required - e.g., ["PA Systems", "Microphones"]
    serviceDescription?: string     // Optional - detailed offering description
    additionalServices?: string[]   // Optional - beyond primary category
  }
  pricingPackages: {
    hireFees: Array<{
      itemName: string              // e.g., "PA System"
      priceType: PriceType          // 'per_item' | 'per_package'
      price: number
      minimumHireDuration?: string  // e.g., "4 hours", "1 day"
    }>                              // Required - at least one
    dayProjectRate?: number         // Optional
    bundleDeals?: Array<{
      name: string
      description: string
      price: number
      includes: string[]
    }>
    depositRequired: boolean        // Required
    depositAmount?: number          // If depositRequired
    currency?: string               // Default: 'AUD'
  }
  logisticsRequirements: {
    deliveryAvailable: boolean      // Required
    deliveryCost?: string           // If deliveryAvailable
    setUpAvailable: boolean         // Required
    setUpCost?: string              // If setUpAvailable
    pickupOptions: string[]         // Required - e.g., ["Deliver & pickup", "Client pickup"]
    travelRadius: number            // Required - in km
    equipmentSpecs?: string         // Optional - technical specifications
    minimumHireValue: number        // Required - minimum order value
    insuranceCoverage: boolean      // Required
    insuranceDetails?: string       // If insuranceCoverage
  }
}

// Union type for all services
export type ServicesData = FreelancerServices | VenueServices | VendorServices

// Helper function to get default services data for a role
export const getDefaultServicesData = (role: UserRole): ServicesData | null => {
  switch (role) {
    case 'Freelancer':
      return {
        whatIOffer: {
          roleSkillAreas: [],
          skills: [],
          industriesGenres: [],
        },
        pricingPackages: {
          rateType: 'hourly',
          baseRate: 0,
          currency: 'AUD',
        },
        logisticsRequirements: {
          travelAvailable: false,
          equipmentProvided: false,
        },
      } as FreelancerServices

    case 'Venue':
      return {
        whatIOffer: {
          venueType: '',
          suitabilityTags: [],
        },
        pricingPackages: {
          hourlyRate: 0,
          currency: 'AUD',
        },
        logisticsRequirements: {
          capacity: 0,
          featuresAmenities: [],
          venueRules: {
            operatingHours: '',
            bondRequired: false,
            alcoholAllowed: false,
            smokingAllowed: false,
          },
          accessibility: {
            wheelchairAccessible: false,
            parkingAvailable: false,
            liftElevatorAccess: false,
            publicTransportNearby: false,
          },
        },
      } as VenueServices

    case 'Vendor':
      return {
        whatIOffer: {
          serviceCategory: '',
          productTypes: [],
        },
        pricingPackages: {
          hireFees: [],
          depositRequired: false,
          currency: 'AUD',
        },
        logisticsRequirements: {
          deliveryAvailable: false,
          setUpAvailable: false,
          pickupOptions: [],
          travelRadius: 0,
          minimumHireValue: 0,
          insuranceCoverage: false,
        },
      } as VendorServices

    default:
      return null
  }
}

// Type guard functions
export const isFreelancerServices = (data: ServicesData): data is FreelancerServices => {
  return 'rateType' in data.pricingPackages
}

export const isVenueServices = (data: ServicesData): data is VenueServices => {
  return 'hourlyRate' in data.pricingPackages && 'venueRules' in data.logisticsRequirements
}

export const isVendorServices = (data: ServicesData): data is VendorServices => {
  return 'hireFees' in data.pricingPackages
}
