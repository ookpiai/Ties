# Amendment Implementation Progress

**Last Updated:** November 24, 2025
**Current Status:** 3 of 9 amendments complete

---

## ✅ COMPLETED AMENDMENTS

### Amendment 2: Remove Discovery Filters ✅
**Status:** COMPLETE
**Date Completed:** November 21, 2025

**Changes:**
- Removed "Collectives" and "Organisers" from main discovery filters
- Updated role filters to show only: All, Freelancers, Vendors, Venues
- Simplified user-facing navigation

**Files Modified:**
- `src/components/discovery/DiscoveryPage.jsx`

---

### Amendment 7: Universal Profile Tab Structure ✅
**Status:** COMPLETE
**Date Completed:** November 24, 2025

**Changes:**
- Replaced role-specific tabs with universal structure
- All roles now use 4 tabs: **Overview**, **Portfolio**, **Services**, **Availability**
- Removed legacy tabs: Skills, Rates, Space, Amenities, Equipment
- Standardized experience across Freelancers, Vendors, and Venues

**Files Modified:**
- `src/components/profile/ProfilePage.jsx`
- `src/components/profile/PublicProfileView.jsx`

**Benefits:**
- Consistent navigation regardless of user role
- Simpler codebase maintenance
- Foundation for Amendment 8 (Services page)

---

### Amendment 9: Two-Tier Role/Specialty System ✅
**Status:** COMPLETE
**Date Completed:** November 24, 2025

**Description:**
Implemented comprehensive specialty system where users select:
1. **Primary role** (Freelancer/Vendor/Venue/Organiser) - for filtering
2. **Specialty** within that role (DJ, Photographer, Studio, etc.) - shown on cards

**Specialty Options:**
- **27 Freelancer specialties** across 5 categories (Performance & Entertainment, Visual Arts & Media, Event Services, Creative Services, Technical)
- **25+ Vendor specialties** across 6 categories (Food & Beverage, Equipment & Technology, Event Infrastructure, Decoration & Design, Production Services, Logistics)
- **18 Venue specialties** across 3 categories (Indoor Spaces, Outdoor Spaces, Specialized Venues)

**Changes:**
- Created `src/constants/specialties.ts` with all specialty options
- Added database fields: `specialty` and `specialty_display_name`
- Updated ProfileSetup to include specialty selection dropdown (grouped by category)
- Updated Discovery cards to display specialty badges prominently
- Helper functions: `getSpecialtyLabel()`, `getSpecialtiesByCategory()`, `hasSpecialtyOptions()`

**Files Created:**
- `src/constants/specialties.ts`
- `supabase/migrations/20251124_add_specialty_fields.sql`

**Files Modified:**
- `src/routes/ProfileSetup.tsx`
- `src/components/discovery/DiscoveryPage.jsx`

**Database Schema:**
```sql
ALTER TABLE profiles ADD COLUMN specialty TEXT;
ALTER TABLE profiles ADD COLUMN specialty_display_name TEXT;
CREATE INDEX idx_profiles_specialty ON profiles(specialty);
CREATE INDEX idx_profiles_role_specialty ON profiles(role, specialty);
```

---

## 🔄 IN PROGRESS AMENDMENTS

### Amendment 8: Universal Services Page
**Status:** IN PROGRESS
**Priority:** HIGH (Foundation for v1 launch)

**Specification:**
Create dynamic Services tab with 3 universal sections:

#### Section 1: What I Offer
- **Freelancers:** Role/Skill Areas, Skills, Industries/Genres, Service Description
- **Venues:** Venue Type, Suitability Tags, Service Description
- **Vendors:** Service Category, Product Types, Service Description

#### Section 2: Pricing & Packages
- **Freelancers:** Rate Type (hourly/daily/project/set), Base Rate, Package Options, Add-ons
- **Venues:** Hourly/Half-Day/Full-Day Rates, Packages (weekend, recurring)
- **Vendors:** Hire Fees (per item/package), Day/Project Rate, Bundle Deals, Deposit Required

#### Section 3: Logistics & Requirements
- **Freelancers:** Travel Availability, Equipment Provided, Online/Remote Work, Response Time
- **Venues:** Capacity, Features/Amenities, Venue Rules, Accessibility, Floor Plan Upload
- **Vendors:** Delivery Available, Set-Up Available, Pickup Options, Travel Radius, Equipment Specs, Minimum Hire Value, Insurance Coverage

**Technical Approach:**
- Store data in JSONB field: `services_data`
- Dynamic form components based on user role
- Validation per role type
- Reusable field components

**Next Steps:**
1. Create services data schema
2. Build dynamic form components
3. Implement role-specific validation
4. Add services data to profile API

---

## 📋 PENDING AMENDMENTS

### Amendment 1: Availability Filter in Discovery
**Status:** PENDING
**Priority:** HIGH
**Effort:** 2-3 days

**Description:**
Add "Availability" section under "More Filters" to filter by available/unavailable users.

**Specification:**
- Add availability filter options: Available, Busy, Unavailable
- Filter results based on user's current availability status
- Integrate with existing availability system

---

### Amendment 3: Subscription Compare Editions
**Status:** PENDING
**Priority:** MEDIUM
**Effort:** 1-2 days

**Description:**
Create visual comparison table for subscription tiers under "Billing and Subscription".

**Specification:**
- Table format with ticks/crosses for features
- Highlight benefits of each tier
- Clear feature differentiation
- Located in Settings > Billing and Subscription

**Note:** Requires pricing tiers to be defined first

---

### Amendment 4: Remove Studio Pro Subscription
**Status:** PENDING
**Priority:** LOW
**Effort:** 1 hour

**Description:**
Delete Studio Pro subscription tier from the system.

**Files to Update:**
- Settings billing page
- Subscription management
- Any references to Studio Pro tier

---

### Amendment 5: Remove Jobs Listing from Studio
**Status:** PENDING
**Priority:** MEDIUM
**Effort:** 1-2 hours

**Description:**
Remove jobs listing section from Studio (workspace) area.

**Rationale:**
Users need TIES Pro Subscription to create workspace for jobs, otherwise limited to Jobs board and messages.

**Files to Update:**
- Studio/Workspace components
- Navigation/menu items

---

### Amendment 6: Jobs Page Reorganization
**Status:** PENDING
**Priority:** HIGH
**Effort:** 1 day

**Description:**
Restructure Jobs page with 3 tabs instead of separate menu items.

**New Structure:**
1. **Jobs Board** (existing functionality)
2. **My Applications** (moved from "More" menu)
3. **My Listings** (moved from "More" menu, previously "My Job Postings")

**Files to Update:**
- `src/pages/JobsPage.jsx` (or similar)
- Navigation menu items
- Remove from "More" menu

---

## SUMMARY

**Total Amendments:** 9
**Completed:** 3 ✅
**In Progress:** 1 🔄
**Pending:** 5 📋

**Overall Progress:** 33% Complete (3/9)

---

## RECOMMENDED IMPLEMENTATION ORDER

### Phase 1: Core Profile Features (Current)
1. ✅ Amendment 7 - Universal Profile Tabs
2. ✅ Amendment 9 - Specialty System
3. 🔄 Amendment 8 - Universal Services Page

### Phase 2: Quick Wins
4. Amendment 4 - Remove Studio Pro (1 hour)
5. Amendment 5 - Remove Jobs from Studio (1-2 hours)
6. Amendment 6 - Jobs Page Reorganization (1 day)

### Phase 3: Discovery Improvements
7. Amendment 1 - Availability Filter (2-3 days)

### Phase 4: Monetization
8. Amendment 3 - Subscription Compare (1-2 days)

---

**Next Actions:**
1. Complete Amendment 8 (Services Page) - 3-5 days
2. Test specialty system with real users
3. Begin Phase 2 quick wins
4. Plan Amendment 1 implementation

---

*Document maintained as part of TIES Together v1 development*
*See also: MASTER_IMPLEMENTATION_PLAN.md, SURREAL_COMPARISON.md*
