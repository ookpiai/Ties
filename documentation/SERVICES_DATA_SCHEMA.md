# Services Data Schema

**Purpose:** Define the structure of the `services_data` JSONB field in the profiles table
**Date:** November 24, 2025
**Amendment:** Amendment 8 - Universal Services Page

---

## Database Field

```sql
ALTER TABLE profiles ADD COLUMN services_data JSONB DEFAULT '{}'::jsonb;
```

The `services_data` field stores all service-related information in a flexible JSONB format that adapts to each user role.

---

## Schema Structure

All roles share the same 3-section structure with role-specific fields:

```typescript
interface ServicesData {
  whatIOffer: WhatIOffer
  pricingPackages: PricingPackages
  logisticsRequirements: LogisticsRequirements
}
```

---

## Section 1: What I Offer

### Freelancers
```typescript
interface WhatIOffer {
  roleSkillAreas: string[]        // Required - e.g., ["Photography", "Videography"]
  skills: string[]                 // Required - e.g., ["Adobe Photoshop", "Lightroom"]
  industriesGenres: string[]       // Required - e.g., ["Wedding", "Corporate", "Fashion"]
  serviceDescription?: string      // Optional - detailed description
  additionalSpecialties?: string[] // Optional - beyond primary specialty
}
```

### Venues
```typescript
interface WhatIOffer {
  venueType: string               // Required - from specialty field
  suitabilityTags: string[]       // Required - e.g., ["photoshoots", "events", "workshops"]
  serviceDescription?: string     // Optional - detailed venue description
  additionalVenueTypes?: string[] // Optional - secondary venue uses
}
```

### Vendors
```typescript
interface WhatIOffer {
  serviceCategory: string         // Required - from specialty field
  productTypes: string[]          // Required - e.g., ["PA Systems", "Microphones", "Mixing Desks"]
  serviceDescription?: string     // Optional - detailed offering description
  additionalServices?: string[]   // Optional - beyond primary category
}
```

---

## Section 2: Pricing & Packages

### Freelancers
```typescript
interface PricingPackages {
  rateType: 'hourly' | 'daily' | 'project' | 'set' // Required - user selects ONE
  baseRate: number                                  // Required - numeric value
  currency?: string                                 // Default: 'AUD'
  packageOptions?: Package[]                        // Optional
  addOns?: AddOn[]                                  // Optional - editing, travel, equipment
}

interface Package {
  name: string          // e.g., "Wedding Full Day"
  description: string
  price: number
  includes: string[]    // What's included
}

interface AddOn {
  name: string          // e.g., "Video Editing"
  price: number
  description: string
}
```

### Venues
```typescript
interface PricingPackages {
  hourlyRate: number           // Required
  halfDayRate?: number         // Optional (typically 4 hours)
  fullDayRate?: number         // Optional (typically 8-10 hours)
  currency?: string            // Default: 'AUD'
  packages?: VenuePackage[]    // Optional - weekend, recurring hire
}

interface VenuePackage {
  name: string                 // e.g., "Weekend Package"
  description: string
  price: number
  duration: string             // e.g., "Saturday & Sunday"
}
```

### Vendors
```typescript
interface PricingPackages {
  hireFees: HireFee[]             // Required - per item or package
  dayProjectRate?: number         // Optional
  bundleDeals?: BundleDeal[]      // Optional
  depositRequired: boolean        // Required
  depositAmount?: number          // If depositRequired is true
  currency?: string               // Default: 'AUD'
}

interface HireFee {
  itemName: string                // e.g., "PA System"
  priceType: 'per_item' | 'per_package'
  price: number
  minimumHireDuration?: string    // e.g., "4 hours", "1 day"
}

interface BundleDeal {
  name: string
  description: string
  price: number
  includes: string[]
}
```

---

## Section 3: Logistics & Requirements

### Freelancers
```typescript
interface LogisticsRequirements {
  travelAvailable: boolean             // Required
  maxTravelDistance?: number           // If travelAvailable is true (in km)
  travelCost?: string                  // e.g., "Included" or "$50 per hour"
  equipmentProvided: boolean           // Required
  equipmentList?: string[]             // If equipmentProvided is true
  onlineRemoteWork?: boolean           // Optional
  responseTimeExpectation?: string     // Optional - e.g., "Within 24 hours"
}
```

### Venues
```typescript
interface LogisticsRequirements {
  capacity: number                     // Required - max people
  capacitySeated?: number              // Optional - seated capacity
  featuresAmenities: string[]          // Required - lighting, sound, AC, mirrors, kitchen, etc.
  venueRules: VenueRules               // Required
  accessibility: Accessibility         // Required
  floorPlanUrl?: string                // Optional - uploaded floor plan
}

interface VenueRules {
  noiseRestrictions?: string           // e.g., "No loud music after 10pm"
  operatingHours: string               // e.g., "9am - 11pm"
  bondRequired: boolean
  bondAmount?: number
  alcoholAllowed: boolean
  smokingAllowed: boolean
  otherRules?: string
}

interface Accessibility {
  wheelchairAccessible: boolean
  parkingAvailable: boolean
  parkingSpaces?: number
  liftElevatorAccess: boolean
  publicTransportNearby: boolean
  otherAccessibility?: string
}
```

### Vendors
```typescript
interface LogisticsRequirements {
  deliveryAvailable: boolean           // Required
  deliveryCost?: string                // If deliveryAvailable - e.g., "$100 flat fee"
  setUpAvailable: boolean              // Required
  setUpCost?: string                   // If setUpAvailable
  pickupOptions: string[]              // Required - e.g., ["Deliver & pickup", "Client pickup"]
  travelRadius: number                 // Required - in km
  equipmentSpecs?: string              // Optional - technical specifications
  minimumHireValue: number             // Required - minimum order value
  insuranceCoverage: boolean           // Required
  insuranceDetails?: string            // If insuranceCoverage is true
}
```

---

## Complete TypeScript Definitions

```typescript
// src/types/services.ts

export type UserRole = 'Freelancer' | 'Vendor' | 'Venue' | 'Organiser'

export type RateType = 'hourly' | 'daily' | 'project' | 'set'
export type PriceType = 'per_item' | 'per_package'

// ===== FREELANCER =====
export interface FreelancerServices {
  whatIOffer: {
    roleSkillAreas: string[]
    skills: string[]
    industriesGenres: string[]
    serviceDescription?: string
    additionalSpecialties?: string[]
  }
  pricingPackages: {
    rateType: RateType
    baseRate: number
    currency?: string
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
    travelAvailable: boolean
    maxTravelDistance?: number
    travelCost?: string
    equipmentProvided: boolean
    equipmentList?: string[]
    onlineRemoteWork?: boolean
    responseTimeExpectation?: string
  }
}

// ===== VENUE =====
export interface VenueServices {
  whatIOffer: {
    venueType: string
    suitabilityTags: string[]
    serviceDescription?: string
    additionalVenueTypes?: string[]
  }
  pricingPackages: {
    hourlyRate: number
    halfDayRate?: number
    fullDayRate?: number
    currency?: string
    packages?: Array<{
      name: string
      description: string
      price: number
      duration: string
    }>
  }
  logisticsRequirements: {
    capacity: number
    capacitySeated?: number
    featuresAmenities: string[]
    venueRules: {
      noiseRestrictions?: string
      operatingHours: string
      bondRequired: boolean
      bondAmount?: number
      alcoholAllowed: boolean
      smokingAllowed: boolean
      otherRules?: string
    }
    accessibility: {
      wheelchairAccessible: boolean
      parkingAvailable: boolean
      parkingSpaces?: number
      liftElevatorAccess: boolean
      publicTransportNearby: boolean
      otherAccessibility?: string
    }
    floorPlanUrl?: string
  }
}

// ===== VENDOR =====
export interface VendorServices {
  whatIOffer: {
    serviceCategory: string
    productTypes: string[]
    serviceDescription?: string
    additionalServices?: string[]
  }
  pricingPackages: {
    hireFees: Array<{
      itemName: string
      priceType: PriceType
      price: number
      minimumHireDuration?: string
    }>
    dayProjectRate?: number
    bundleDeals?: Array<{
      name: string
      description: string
      price: number
      includes: string[]
    }>
    depositRequired: boolean
    depositAmount?: number
    currency?: string
  }
  logisticsRequirements: {
    deliveryAvailable: boolean
    deliveryCost?: string
    setUpAvailable: boolean
    setUpCost?: string
    pickupOptions: string[]
    travelRadius: number
    equipmentSpecs?: string
    minimumHireValue: number
    insuranceCoverage: boolean
    insuranceDetails?: string
  }
}

// Union type for all services
export type ServicesData = FreelancerServices | VenueServices | VendorServices
```

---

## Validation Rules

### Required Fields by Role

**Freelancers:**
- whatIOffer: roleSkillAreas, skills, industriesGenres
- pricingPackages: rateType, baseRate
- logisticsRequirements: travelAvailable, equipmentProvided

**Venues:**
- whatIOffer: venueType, suitabilityTags
- pricingPackages: hourlyRate
- logisticsRequirements: capacity, featuresAmenities, venueRules (all fields), accessibility (all boolean fields)

**Vendors:**
- whatIOffer: serviceCategory, productTypes
- pricingPackages: hireFees (at least one), depositRequired, minimumHireValue
- logisticsRequirements: deliveryAvailable, setUpAvailable, pickupOptions, travelRadius, insuranceCoverage

---

## Default Values

```typescript
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
      }
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
      }
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
      }
    default:
      return null
  }
}
```

---

## Storage Format

Data is stored in PostgreSQL JSONB format in the `profiles.services_data` column:

```sql
SELECT
  id,
  display_name,
  role,
  services_data
FROM profiles
WHERE role = 'Freelancer'
LIMIT 1;

-- Example result:
{
  "whatIOffer": {
    "roleSkillAreas": ["Photography", "Videography"],
    "skills": ["Adobe Photoshop", "Final Cut Pro"],
    "industriesGenres": ["Wedding", "Corporate"],
    "serviceDescription": "Professional photographer with 10 years experience"
  },
  "pricingPackages": {
    "rateType": "hourly",
    "baseRate": 150,
    "currency": "AUD",
    "addOns": [
      {
        "name": "Same-day editing",
        "price": 200,
        "description": "Edited photos delivered within 24 hours"
      }
    ]
  },
  "logisticsRequirements": {
    "travelAvailable": true,
    "maxTravelDistance": 100,
    "travelCost": "Included within 50km, $1/km beyond",
    "equipmentProvided": true,
    "equipmentList": ["DSLR Camera", "Lighting Kit", "Tripods"]
  }
}
```

---

## Query Examples

```sql
-- Find freelancers who offer photography in the wedding industry
SELECT * FROM profiles
WHERE role = 'Freelancer'
AND services_data->'whatIOffer'->>'roleSkillAreas' @> '["Photography"]'
AND services_data->'whatIOffer'->>'industriesGenres' @> '["Wedding"]';

-- Find venues with capacity over 100 that are wheelchair accessible
SELECT * FROM profiles
WHERE role = 'Venue'
AND (services_data->'logisticsRequirements'->>'capacity')::int > 100
AND services_data->'logisticsRequirements'->'accessibility'->>'wheelchairAccessible' = 'true';

-- Find vendors who offer delivery
SELECT * FROM profiles
WHERE role = 'Vendor'
AND services_data->'logisticsRequirements'->>'deliveryAvailable' = 'true';
```

---

## Migration Plan

1. Add `services_data` column to profiles table
2. Create GIN index for JSONB queries
3. Set default empty object for existing profiles
4. No data migration needed (users fill in their own services)

```sql
-- Migration file: 20251124_add_services_data.sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS services_data JSONB DEFAULT '{}'::jsonb;
CREATE INDEX IF NOT EXISTS idx_profiles_services_data ON profiles USING GIN (services_data);
COMMENT ON COLUMN profiles.services_data IS 'Service offerings, pricing, and logistics. Structure varies by role. See SERVICES_DATA_SCHEMA.md';
```

---

*Schema documented as part of Amendment 8 implementation*
