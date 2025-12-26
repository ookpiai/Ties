# Discover Talent - Implementation Plan

## Objective
Fix all identified issues in the Discover page to make it fully functional and deployment-ready.

---

## Scope Definition

### IN SCOPE (Will Fix)

#### 1. Broken Routes
- [ ] Create `/compare` route and CompareProfilesPage component
- [ ] Fix `/book/:username` route mismatch (profile ID vs username)

#### 2. Non-Functional Filters
- [ ] Implement price range filtering in `searchProfiles()` API
- [ ] Implement skills filtering (using profile specialty/tags)
- [ ] Implement badge/trust filtering (verified, active, etc.)
- [ ] Implement sort functionality (rating, price, recent activity)

#### 3. Missing Data Connections
- [ ] Connect `profile_stats` table for ratings/reviews
- [ ] Display actual hourly_rate from profiles
- [ ] Show real availability status (not hardcoded)

#### 4. Branding Update
- [ ] Rename "Discover" to "Discover Talent" throughout UI
- [ ] Update page title, navigation, and headers

### OUT OF SCOPE (Not Fixing Now)
- Pagination (future optimization)
- Map geocoding caching (future optimization)
- Accessibility improvements (future phase)
- Mobile-specific optimizations (future phase)
- New filter types not already in UI

---

## Implementation Details

### 1. Route Fixes

#### 1.1 Compare Profiles Page
**New File**: `src/components/discovery/CompareProfilesPage.jsx`

**Route**: `/compare?ids=uuid1,uuid2,uuid3`

**Features**:
- Accept 2-4 profile IDs via query params
- Side-by-side comparison table
- Compare: name, role, specialty, location, rate, rating, reviews
- Links to view full profile or book

#### 1.2 Book Route Fix
**Current**: Route expects `:username`, code sends `:profileId`

**Solution**: Update DiscoveryPage to navigate with username instead of ID
- Get username from profile data
- Navigate to `/book/${profile.username}`
- Fallback to profile page if no username

---

### 2. Filter Implementation

#### 2.1 Update `searchProfiles()` API
**File**: `src/api/profiles.ts`

**Add Parameters**:
```typescript
interface SearchFilters {
  query?: string
  role?: string
  location?: string
  minPrice?: number      // NEW
  maxPrice?: number      // NEW
  skills?: string[]      // NEW
  badges?: string[]      // NEW
  sortBy?: string        // NEW
  limit?: number
  offset?: number
}
```

**Database Query Updates**:
```sql
-- Price filter
AND hourly_rate >= minPrice AND hourly_rate <= maxPrice

-- Skills filter (using specialty)
AND specialty = ANY(skills)

-- Sort options
ORDER BY
  CASE sortBy
    WHEN 'rating' THEN average_rating DESC
    WHEN 'price_low' THEN hourly_rate ASC
    WHEN 'price_high' THEN hourly_rate DESC
    WHEN 'recent' THEN last_active_at DESC
    ELSE created_at DESC
  END
```

#### 2.2 Badge/Trust Filters
**Definitions**:
- `verified`: email_verified = true
- `active`: last_active_at > NOW() - 30 days (need to add column)
- `reliable`: on_time_delivery_rate >= 90% (from profile_stats)
- `top_rated`: average_rating >= 4.5 (from profile_stats)
- `ties_pro`: subscription_tier = 'pro' (need to check column)

---

### 3. Data Connection

#### 3.1 Profile Stats Join
**Update searchProfiles() to join**:
```sql
SELECT
  p.*,
  ps.average_rating,
  ps.total_reviews,
  ps.on_time_delivery_rate
FROM profiles p
LEFT JOIN profile_stats ps ON ps.user_id = p.id
```

#### 3.2 Transform Updates
**File**: `src/components/discovery/DiscoveryPage.jsx`

```javascript
// Line 180-189: Update transformations
rating: profile.average_rating || 0,
reviewCount: profile.total_reviews || 0,
hourlyRate: profile.hourly_rate || 0,
skills: profile.specialty ? [profile.specialty] : [],
availability: profile.public_booking_enabled ? 'available' : 'unavailable',
```

---

### 4. UI Updates

#### 4.1 Rename to "Discover Talent"
**Files to Update**:
- `src/components/discovery/DiscoveryPage.jsx` - Page title
- `src/components/layout/AppLayout.jsx` - Navigation link (if exists)
- `src/components/layout/Sidebar.jsx` - Sidebar link (if exists)
- Any other navigation references

---

## Database Changes Required

### Option A: Use Existing Tables (Preferred)
- `profiles.hourly_rate` - Already exists
- `profiles.specialty` - Already exists
- `profile_stats` - Already exists with ratings

### Option B: Add Missing Columns (If Needed)
```sql
-- Only if column doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ;
```

---

## Testing Checklist

- [ ] Price filter: Returns only profiles within range
- [ ] Skills filter: Returns only matching specialties
- [ ] Badge filter: Returns only verified/active/etc profiles
- [ ] Sort: Results ordered correctly by each option
- [ ] Compare page: Loads with 2-4 profile IDs
- [ ] Book button: Navigates to correct booking page
- [ ] Ratings display: Shows actual values from profile_stats
- [ ] Hourly rate: Shows actual rate from profile

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/api/profiles.ts` | Add filter params, join profile_stats |
| `src/components/discovery/DiscoveryPage.jsx` | Connect filters, fix transforms, rename |
| `src/App.jsx` | Add /compare route |
| `src/components/discovery/CompareProfilesPage.jsx` | NEW - comparison view |

---

## Success Criteria

1. All filters actually filter results
2. Sort options work correctly
3. Compare page loads and displays profiles
4. Book button navigates correctly
5. Profile cards show real ratings/rates
6. Page title says "Discover Talent"
7. Build passes with no errors
