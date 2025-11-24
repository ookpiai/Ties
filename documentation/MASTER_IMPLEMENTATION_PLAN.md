# TIES Together - Master Implementation Plan

**Date Created:** November 24, 2025
**Purpose:** Consolidated roadmap combining Surreal.live competitive features + additional improvements
**Status:** Ready for Implementation

---

## DOCUMENT STRUCTURE

This document combines:
1. **Surreal.live Feature Gaps** - Features Surreal has that we need
2. **Platform Improvements** - General enhancements to TIES Together
3. **User-Requested Amendments** - From ammendments.txt (currently empty - add yours here!)
4. **Prioritized Roadmap** - Phased implementation plan

---

# PART 1: SURREAL FEATURE GAPS

## PRIORITY 1: CRITICAL FOR v1.1 (Launch Blockers)

### 1.1 PAYMENT SYSTEM & INVOICING ⭐⭐⭐⭐⭐
**Status:** ❌ Not Started
**Effort:** 3-4 weeks
**Business Impact:** CRITICAL - Can't monetize without this

**Features to Implement:**
- [ ] Stripe Connect integration
- [ ] Automated invoice generation
- [ ] Payment processing workflow
- [ ] Payment tracking dashboard
- [ ] Consolidated billing (combine multiple bookings)
- [ ] Payout scheduling (weekly/monthly)
- [ ] Tax calculation and compliance
- [ ] Payment history for organisers
- [ ] Earnings tracking for freelancers/vendors/venues
- [ ] Refund and dispute handling
- [ ] Optional Fast-Track payments (3.9% fee for instant payout)

**Files to Create/Modify:**
- `src/api/payments.ts` - Payment API functions
- `src/api/invoices.ts` - Invoice generation
- `src/components/payments/PaymentSetup.jsx` - Stripe onboarding
- `src/components/payments/PaymentDashboard.jsx` - Financial tracking
- `src/components/bookings/InvoiceModal.jsx` - Invoice display
- `supabase/migrations/XXX_payment_system.sql` - Payment tables

**Database Tables Needed:**
```sql
- invoices (id, booking_id, amount, status, due_date, paid_date)
- payments (id, invoice_id, amount, stripe_payment_id, status)
- payment_methods (id, user_id, stripe_customer_id, default)
- payouts (id, user_id, amount, stripe_payout_id, status, scheduled_date)
```

---

### 1.2 FAVORITES/SAVE SYSTEM ⭐⭐⭐⭐
**Status:** ❌ Not Started
**Effort:** 2-3 days
**Business Impact:** HIGH - Improves user retention

**Features to Implement:**
- [ ] "Save" button on all profiles
- [ ] "My Favorites" page for organisers
- [ ] Favorite freelancers, vendors, venues separately
- [ ] Quick access to saved profiles
- [ ] Remove from favorites functionality
- [ ] Favorite count display
- [ ] Filter discovery by "favorites only"

**Files to Create/Modify:**
- `src/api/favorites.ts` - Favorites API
- `src/components/discovery/FavoriteButton.jsx` - Save button component
- `src/components/favorites/FavoritesPage.jsx` - Saved profiles page
- `supabase/migrations/XXX_favorites.sql` - Favorites table

**Database Tables:**
```sql
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  favorited_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, favorited_user_id)
);
```

---

### 1.3 BOOKING MODIFICATIONS ⭐⭐⭐⭐
**Status:** ❌ Not Started
**Effort:** 3-4 days
**Business Impact:** HIGH - Real-world bookings need adjustments

**Features to Implement:**
- [ ] Edit booking dates after acceptance
- [ ] Change booking times
- [ ] Modify payment amount
- [ ] Add/remove services
- [ ] Cancellation workflow
- [ ] Modification requires re-approval from freelancer/venue
- [ ] Modification history log
- [ ] Email notifications on changes

**Files to Create/Modify:**
- `src/components/bookings/EditBookingModal.jsx` - Edit modal
- `src/api/bookings.ts` - Add update functions
- `src/components/bookings/BookingHistory.jsx` - Change log
- `supabase/migrations/XXX_booking_modifications.sql` - Modification tracking

**Database Tables:**
```sql
CREATE TABLE booking_modifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  modified_by UUID REFERENCES profiles(id),
  field_changed TEXT,
  old_value TEXT,
  new_value TEXT,
  status TEXT, -- pending, approved, rejected
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## PRIORITY 2: HIGH VALUE (Quick Wins)

### 2.1 AUTOMATED GIG REMINDERS ⭐⭐⭐
**Status:** ❌ Not Started
**Effort:** 1-2 days
**Business Impact:** MEDIUM - Reduces no-shows

**Features to Implement:**
- [ ] Email reminder 24 hours before event
- [ ] Email reminder 1 hour before event
- [ ] SMS reminders (optional - Twilio integration)
- [ ] Customizable reminder timing
- [ ] Include event details in reminder
- [ ] Map link to venue location
- [ ] Contact information for organiser

**Files to Create/Modify:**
- `supabase/functions/send-reminders/index.ts` - Cron job
- Email templates in SendGrid
- `src/api/notifications.ts` - Notification scheduling

**Implementation:**
- Use Supabase Edge Functions with cron trigger
- Query bookings starting in next 24h, 1h
- Send email via SendGrid API

---

### 2.2 ENHANCED SEARCH & FILTERING ⭐⭐⭐
**Status:** ❌ Not Started
**Effort:** 2-3 days
**Business Impact:** MEDIUM - Improves discovery

**Features to Implement:**
- [ ] Advanced filters panel
- [ ] Filter by price range (hourly/daily rate)
- [ ] Filter by availability date
- [ ] Filter by rating/reviews
- [ ] Filter by years of experience
- [ ] Multiple skill selection
- [ ] Sort by: relevance, price (low/high), rating, distance
- [ ] Save search preferences
- [ ] Recent searches

**Files to Modify:**
- `src/components/discovery/DiscoveryPage.jsx` - Enhanced filters
- `src/api/profiles.ts` - Update search function
- Add filter state management

---

### 2.3 CRM ENHANCEMENTS ⭐⭐⭐
**Status:** ❌ Not Started
**Effort:** 2-3 days
**Business Impact:** MEDIUM - Better relationship management

**Features to Implement:**
- [ ] Private notes on profiles (only organiser can see)
- [ ] Custom tags/labels for organizing roster
- [ ] Activity log (when last contacted, booked, etc.)
- [ ] Contact history timeline
- [ ] Quick notes during booking
- [ ] Tag-based filtering in discovery

**Files to Create/Modify:**
- `src/components/profile/PrivateNotes.jsx` - Notes component
- `src/components/profile/TagManager.jsx` - Tag management
- `src/components/profile/ActivityLog.jsx` - Activity timeline
- `src/api/crm.ts` - CRM functions

**Database Tables:**
```sql
CREATE TABLE profile_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organiser_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE profile_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organiser_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE profile_tag_assignments (
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES profile_tags(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (profile_id, tag_id)
);
```

---

## PRIORITY 3: GROWTH FEATURES (v1.2-1.3)

### 3.1 PUBLIC EVENT CALENDAR / GIG GUIDE ⭐⭐⭐
**Status:** ❌ Not Started
**Effort:** 1 week
**Business Impact:** HIGH - Marketing & Discovery

**Features to Implement:**
- [ ] Public-facing event calendar (no login required)
- [ ] List all upcoming events with performers
- [ ] Filter by date, location, category
- [ ] SEO-optimized event pages
- [ ] Social sharing buttons
- [ ] Add to personal calendar (Google, Apple)
- [ ] Event promotion checkbox when creating booking
- [ ] QR code generation for in-venue promotion

**Files to Create:**
- `src/components/public/EventCalendar.jsx` - Public calendar page
- `src/components/public/EventDetailPage.jsx` - Individual event page
- `src/routes/PublicRoutes.jsx` - Public routes (no auth)
- Update routing to support public pages

**Database:**
- Add `is_public` boolean to bookings table
- Add `event_title`, `event_description` to bookings

---

### 3.2 WEBSITE EMBED WIDGETS ⭐⭐
**Status:** ❌ Not Started
**Effort:** 3-5 days
**Business Impact:** MEDIUM - Venue websites integration

**Features to Implement:**
- [ ] Embeddable calendar widget (iframe)
- [ ] Embeddable event list widget
- [ ] Customizable styling (colors, fonts)
- [ ] Auto-updates when events change
- [ ] Responsive design
- [ ] Widget generator in dashboard

**Files to Create:**
- `public/widget.html` - Widget HTML/JS
- `src/components/widgets/WidgetGenerator.jsx` - Widget config
- Widget API endpoints for data

---

### 3.3 MULTI-VENUE MANAGEMENT ⭐⭐
**Status:** ❌ Not Started
**Effort:** 2 weeks
**Business Impact:** HIGH - Enterprise feature

**Features to Implement:**
- [ ] Venue groups/portfolio management
- [ ] Multi-venue calendar view (see all venues at once)
- [ ] Assign managers to specific venues
- [ ] Centralized reporting across venues
- [ ] Consolidated financials
- [ ] Permission management per venue
- [ ] Bulk actions across venues

**Files to Create:**
- `src/components/venues/VenueGroupDashboard.jsx` - Portfolio view
- `src/components/venues/MultiVenueCalendar.jsx` - Combined calendar
- `src/api/venueGroups.ts` - Group management

**Database Tables:**
```sql
CREATE TABLE venue_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES profiles(id),
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE venue_group_members (
  group_id UUID REFERENCES venue_groups(id) ON DELETE CASCADE,
  venue_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT, -- admin, manager, viewer
  added_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (group_id, venue_id)
);
```

---

## PRIORITY 4: POLISH & UX (Ongoing)

### 4.1 STRUCTURED BRIEFS / WORKSHEETS ⭐⭐
**Status:** ❌ Not Started
**Effort:** 3-4 days
**Business Impact:** MEDIUM - Better communication

**Features to Implement:**
- [ ] Performance requirements template
- [ ] Equipment list builder
- [ ] Set list requests (for musicians)
- [ ] Timeline/schedule builder
- [ ] Custom questionnaires
- [ ] Photo/video shot lists (for photographers)
- [ ] Dietary requirements (for caterers)
- [ ] Template library

**Files to Create:**
- `src/components/bookings/BriefBuilder.jsx` - Brief creation
- `src/components/bookings/BriefTemplates.jsx` - Template library
- Templates per role type (DJ, photographer, caterer, etc.)

---

### 4.2 ADVANCED ANALYTICS ⭐⭐
**Status:** ❌ Not Started
**Effort:** 1 week
**Business Impact:** MEDIUM - Data-driven decisions

**Features to Implement:**
- [ ] Booking trends over time
- [ ] Revenue analytics
- [ ] Most popular freelancers/vendors
- [ ] Conversion rates (views → bookings)
- [ ] Seasonal trends
- [ ] Average booking values
- [ ] Customer lifetime value
- [ ] Export reports (CSV, PDF)

**Files to Create:**
- `src/components/analytics/AnalyticsDashboard.jsx`
- `src/components/analytics/RevenueChart.jsx`
- `src/components/analytics/TrendsChart.jsx`

---

### 4.3 RATING & REVIEW SYSTEM IMPROVEMENTS ⭐⭐
**Status:** ⚠️ Basic system exists
**Effort:** 2-3 days
**Business Impact:** MEDIUM - Trust & credibility

**Current Status:**
- Basic reviews table exists
- Need to implement UI and workflows

**Features to Implement:**
- [ ] Star rating (1-5 stars)
- [ ] Written review
- [ ] Photo uploads with review
- [ ] Response to reviews (freelancer can reply)
- [ ] Review moderation
- [ ] Verified booking badge (only booked users can review)
- [ ] Average rating display on profiles
- [ ] Filter by rating in discovery
- [ ] Review reminder emails after event

**Files to Create/Modify:**
- `src/components/reviews/ReviewForm.jsx`
- `src/components/reviews/ReviewList.jsx`
- `src/components/reviews/ReviewModal.jsx`
- `src/api/reviews.ts` - Update functions

---

# PART 2: PLATFORM IMPROVEMENTS

## USER EXPERIENCE ENHANCEMENTS

### UX-1: ONBOARDING FLOW IMPROVEMENTS ⭐⭐⭐
**Status:** ⚠️ Basic onboarding exists
**Effort:** 2-3 days
**Business Impact:** HIGH - First impressions

**Features to Implement:**
- [ ] Interactive tutorial on first login
- [ ] Progress checklist (complete profile, add portfolio, etc.)
- [ ] Tooltips on key features
- [ ] Sample data / demo mode
- [ ] Quick start guide
- [ ] Video tutorials

---

### UX-2: MOBILE RESPONSIVENESS AUDIT ⭐⭐⭐
**Status:** ⚠️ Partially responsive
**Effort:** 1 week
**Business Impact:** HIGH - 60%+ users on mobile

**Areas to Improve:**
- [ ] Mobile navigation menu
- [ ] Touch-friendly buttons/interactions
- [ ] Optimized images for mobile
- [ ] Simplified forms on mobile
- [ ] Test on iOS and Android browsers
- [ ] PWA support (installable web app)

---

### UX-3: LOADING STATES & ERROR HANDLING ⭐⭐
**Status:** ⚠️ Partial
**Effort:** 3-4 days
**Business Impact:** MEDIUM - Better UX

**Improvements:**
- [ ] Skeleton loaders instead of spinners
- [ ] Better error messages (user-friendly)
- [ ] Retry mechanisms for failed requests
- [ ] Offline support (PWA)
- [ ] Toast notifications for success/errors
- [ ] Progress indicators for long operations

---

## BACKEND & PERFORMANCE

### PERF-1: IMAGE OPTIMIZATION ⭐⭐
**Status:** ❌ Not Started
**Effort:** 2-3 days
**Business Impact:** MEDIUM - Page load speed

**Features to Implement:**
- [ ] Automatic image compression on upload
- [ ] Multiple image sizes (thumbnail, medium, full)
- [ ] Lazy loading images
- [ ] WebP format support
- [ ] CDN integration (Cloudflare)
- [ ] Image cropping tool

---

### PERF-2: DATABASE OPTIMIZATION ⭐⭐
**Status:** ⚠️ Basic indexes
**Effort:** 1-2 days
**Business Impact:** MEDIUM - Query performance

**Optimizations:**
- [ ] Add indexes on frequently queried columns
- [ ] Database query optimization
- [ ] Implement pagination on all lists
- [ ] Caching for expensive queries (Redis)
- [ ] Archive old bookings

---

### PERF-3: API RATE LIMITING ⭐
**Status:** ❌ Not Started
**Effort:** 1 day
**Business Impact:** LOW - Security

**Implementation:**
- [ ] Rate limiting per user/IP
- [ ] Prevent API abuse
- [ ] Supabase RLS optimization
- [ ] Request throttling

---

## SECURITY & COMPLIANCE

### SEC-1: TWO-FACTOR AUTHENTICATION ⭐⭐
**Status:** ❌ Not Started
**Effort:** 2-3 days
**Business Impact:** MEDIUM - Account security

**Features:**
- [ ] SMS-based 2FA
- [ ] Authenticator app support (Google Authenticator)
- [ ] Backup codes
- [ ] Enforce 2FA for organisers

---

### SEC-2: PRIVACY & GDPR COMPLIANCE ⭐⭐
**Status:** ⚠️ Basic privacy policy
**Effort:** 1 week
**Business Impact:** HIGH - Legal requirement

**Features:**
- [ ] Cookie consent banner
- [ ] Data export tool (download all your data)
- [ ] Account deletion workflow
- [ ] Privacy settings
- [ ] Terms of service acceptance
- [ ] GDPR-compliant data handling

---

### SEC-3: VERIFICATION SYSTEM ⭐⭐
**Status:** ❌ Not Started
**Effort:** 1 week
**Business Impact:** MEDIUM - Trust & safety

**Features:**
- [ ] Email verification (already have this)
- [ ] Phone number verification
- [ ] ID verification (for vendors/venues)
- [ ] Background checks (optional premium)
- [ ] Verified badge on profiles
- [ ] Business registration verification

---

# PART 3: USER-REQUESTED AMENDMENTS

**Source:** `documentation/ammendments.txt`
**Date Added:** November 24, 2025

---

## AMENDMENT 1: Discovery Page - Availability Filter ⭐⭐⭐⭐

**Description:**
Add an "Availability" section under "More filters" in the Discovery Page. This will allow organisers to filter and sort available vs unavailable users.

**Priority:** HIGH
**Effort:** 2-3 days
**Business Impact:** HIGH - Core booking functionality

**Implementation Details:**
- Add date range picker in filters panel
- Query profiles with availability data
- Show "Available" badge on profile cards
- Sort by availability (available first)
- Filter: Available now, Available on specific dates, Unavailable

**Files to Modify:**
- `src/components/discovery/DiscoveryPage.jsx` - Add availability filter UI
- `src/api/profiles.ts` - Update search to include availability
- `src/api/availability.ts` - Query calendar blocks

**Database:**
- Use existing `calendar_blocks` table
- Add availability calculation logic

---

## AMENDMENT 2: Discovery Page - Remove Filters ⭐⭐⭐

**Description:**
Remove "Collectives" and "Organisers" from the main role filter buttons at the top of the Discovery Page. Only show: All, Freelancers, Vendors, Venues.

**Priority:** HIGH
**Effort:** 30 minutes
**Business Impact:** MEDIUM - Simplifies UI

**Implementation:**
- Already completed! ✅
- We updated this when we simplified roles to Freelancer/Vendor/Venue/Organiser
- Discovery page now only shows hire-able roles

**Status:** ✅ COMPLETE

---

## AMENDMENT 3: Subscription - Compare Editions Visual ⭐⭐⭐⭐

**Description:**
Add a "Compare Editions" visual table in the Settings → Billing and Subscription section. This table will highlight the differences between each subscription tier with checkmarks and crosses showing which features are included.

**Priority:** HIGH
**Effort:** 1-2 days
**Business Impact:** HIGH - Conversion optimization

**Implementation Details:**
Create comparison table with:
- Free tier features
- Pro tier features
- Enterprise tier features
- Visual indicators (✓ / ✗)
- Highlight differences
- Call-to-action buttons

**Features to Compare:**
```
| Feature                  | Free | Pro | Enterprise |
|--------------------------|------|-----|------------|
| Basic bookings           |  ✓   |  ✓  |     ✓      |
| Job postings             |  ✗   |  ✓  |     ✓      |
| Unlimited bookings       |  ✗   |  ✓  |     ✓      |
| Workspace features       |  ✗   |  ✓  |     ✓      |
| Priority support         |  ✗   |  ✗  |     ✓      |
| Multi-venue management   |  ✗   |  ✗  |     ✓      |
| API access               |  ✗   |  ✗  |     ✓      |
| Custom branding          |  ✗   |  ✗  |     ✓      |
```

**Files to Create:**
- `src/components/settings/CompareEditions.jsx` - Comparison table component
- `src/components/settings/SubscriptionTiers.jsx` - Tier cards

**Location:** Settings Page → Billing and Subscription

---

## AMENDMENT 4: Remove Studio Pro Subscription ⭐⭐⭐

**Description:**
Delete the "Studio Pro" subscription tier. Simplify to: Free, Pro, Enterprise.

**Priority:** MEDIUM
**Effort:** 1 hour
**Business Impact:** MEDIUM - Simplifies pricing

**Implementation:**
- Remove Studio Pro references from UI
- Update pricing documentation
- Update subscription comparison table
- Migrate existing Studio Pro users to Pro tier

**Files to Modify:**
- `src/components/settings/SettingsPage.jsx`
- Any subscription tier references

---

## AMENDMENT 5: Remove Jobs Listing from Studio ⭐⭐⭐

**Description:**
Remove the "Jobs Listing" section from the Studio/Workspace. Users should only access workspaces for jobs they're actively working on (after selection). For browsing/applying, they use the Jobs Board + Messages.

**Priority:** MEDIUM
**Effort:** 1-2 hours
**Business Impact:** MEDIUM - Clarifies workspace purpose

**Implementation:**
- Workspace is only for accepted/selected jobs
- Remove job browsing from workspace
- Users browse jobs in Jobs Page
- Workspace access requires TIES Pro subscription

**Files to Modify:**
- Remove job listing components from workspace
- Update navigation

---

## AMENDMENT 6: Jobs Page Reorganization ⭐⭐⭐⭐

**Description:**
Restructure the Jobs Page to have three tabs:
1. **Jobs Board** (current job feed - browse available jobs)
2. **My Applications** (jobs I've applied to - renamed from "My Job Applications")
3. **My Listings** (jobs I've posted - renamed from "My Job Postings")

Move "My Job Applications" and "My Job Postings" from the "More" menu into the Jobs Page.

**Priority:** HIGH
**Effort:** 1 day
**Business Impact:** HIGH - Better UX and navigation

**Implementation Details:**
Create tabbed interface in Jobs Page:

```jsx
<Tabs>
  <Tab label="Jobs Board">
    {/* Existing JobFeedPage content */}
  </Tab>

  <Tab label="My Applications" visibleFor="Freelancer, Vendor, Venue">
    {/* MyApplicationsPage content */}
  </Tab>

  <Tab label="My Listings" visibleFor="Organiser">
    {/* MyJobsPage content */}
  </Tab>
</Tabs>
```

**Files to Modify:**
- `src/components/jobs/JobsPage.jsx` - Create new tabbed layout
- Move `MyApplicationsPage.jsx` and `MyJobsPage.jsx` as tab content
- Update navigation to remove from "More" menu
- Role-based tab visibility (show "My Applications" for service providers, "My Listings" for organisers)

---

## AMENDMENT 7: Universal Profile Page Redesign ⭐⭐⭐⭐⭐

**Description:**
Redesign the profile page to be universal across all VFV (Venue, Freelancer, Vendor) users.

**Current layout:** Overview, Settings, Availability
**New layout:** Overview, Portfolio, Services, Availability

Change the top navigation from "Overview, Settings, Availability" to "Overview, Portfolio, Services, Availability".

**Priority:** CRITICAL
**Effort:** 1 week
**Business Impact:** CRITICAL - Core user experience

**Implementation Details:**

### IMPORTANT: Two-Tier Role System

**Tier 1: Primary Role** (Broad category for filtering)
- Freelancer
- Vendor
- Venue
- Organiser

**Tier 2: Specialty/Sub-type** (Specific type shown on cards)
- **Freelancers:** DJ, Singer, Photographer, Videographer, Bartender, MC, Performer, etc.
- **Vendors:** Catering, AV Equipment, Lighting, Decor, Staging, Transport, etc.
- **Venues:** Studio, Gallery, Theater, Outdoor Space, Event Hall, Rehearsal Space, etc.

**How It Works:**
1. **Discovery Page:** Users filter by Tier 1 (Freelancer/Vendor/Venue)
2. **Profile Cards:** Display Tier 2 specialty badge (e.g., "DJ", "Caterer", "Studio")
3. **Profile Setup:** Users select BOTH role and specialty during signup
4. **Profile Editing:** Users can change specialty in Overview tab

**Example Flow:**
```
Discovery → Filter: "Freelancers"
Results show cards with:
- Card 1: DJ badge
- Card 2: Photographer badge
- Card 3: Singer badge
- Card 4: Bartender badge
All are Freelancers, but each has their specific specialty
```

### New Profile Structure:

**Tab 1: Overview** (Universal - Same for all)
- Display name, bio, profile photo
- **Primary role** (Freelancer/Vendor/Venue) - Read-only
- **Specialty/Sub-type** (DJ, Caterer, Studio, etc.) - Editable dropdown ⭐ NEW
- Location, contact info
- Rating and reviews
- Stats (bookings completed, response time)
- Social links

**Tab 2: Portfolio** (Universal - Same for all)
- Photo/video gallery
- Past work examples
- Case studies
- Testimonials
- Awards/certifications

**Tab 3: Services** (Dynamic - Changes by user type)
See Amendment 8 for full Services page breakdown

**Tab 4: Availability** (Universal - Same for all)
- Calendar view
- Available dates
- Booking schedule
- Block dates

**Database Schema Update:**
```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS specialty TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS specialty_display_name TEXT;

-- Specialty options per role
-- Freelancers: 'dj', 'singer', 'photographer', 'videographer', 'bartender', 'mc', 'performer', 'musician', 'dancer', 'actor', 'model'
-- Vendors: 'catering', 'av_equipment', 'lighting', 'decor', 'staging', 'transport', 'printing', 'signage', 'security', 'cleaning'
-- Venues: 'studio', 'gallery', 'theater', 'outdoor_space', 'event_hall', 'rehearsal_space', 'warehouse', 'rooftop', 'restaurant', 'bar'
```

**Files to Create/Modify:**
- `src/components/profile/ProfileTabs.jsx` - New tabbed layout
- `src/components/profile/OverviewTab.jsx` - Add specialty dropdown
- `src/components/profile/PortfolioTab.jsx`
- `src/components/profile/ServicesTab.jsx` (new - see Amendment 8)
- `src/components/profile/AvailabilityTab.jsx`
- `src/routes/ProfileSetup.tsx` - Add specialty selection after role selection
- `src/components/discovery/DiscoveryPage.jsx` - Display specialty badge on cards
- `src/constants/specialties.ts` - NEW - Specialty options per role
- Move Settings to separate Settings Page (already exists)

---

## AMENDMENT 8: Universal Services Page ⭐⭐⭐⭐⭐

**Description:**
Create a universal "Services" tab in the profile page that dynamically shows different fields based on user type (Freelancer, Venue, Vendor). All users see the same 3 section headers, but fields change.

**Priority:** CRITICAL
**Effort:** 1 week
**Business Impact:** CRITICAL - Defines service offerings

### UNIVERSAL STRUCTURE:

All users see these 3 sections:
1. **What I Offer**
2. **Pricing & Packages**
3. **Logistics & Requirements**

Fields inside each section change dynamically based on user type.

---

### FREELANCERS - Services Page Fields

**Section 1: What I Offer**
- **Specialty** (Required) - Auto-populated from profile (DJ, Photographer, etc.) - Read-only, edit in Overview tab
- **Additional Specialties** (Optional) - Multi-select: Can offer multiple services (e.g., DJ + MC)
- **Skills** (Required) - Multi-select chips based on specialty
  - DJ: Mixing, Scratching, Crowd Reading, Equipment Setup
  - Photographer: Portrait, Event, Product, Editing
  - Singer: Jazz, Pop, Classical, A Cappella
- **Industries / Genres** (Required) - Weddings, Corporate, Festivals, Nightclubs, Private Events
- **Service Description** (Optional) - Text area

**Section 2: Pricing & Packages**
- Rate Type (Required) - Dropdown: hourly / per day / per project / per set
- Base Rate (Required) - Number input with currency
- Package Options (Optional) - Create custom packages
- Add-ons (Optional) - Editing, travel, equipment hire (checkbox list with prices)

**Section 3: Logistics & Requirements**
- Travel Availability (Required) - Toggle Yes/No + max distance slider
- Equipment Provided (Required) - Toggle Yes/No + equipment list
- Online / Remote Work (Optional) - Toggle
- Response Time Expectation (Optional) - Dropdown: Immediate, 24h, 48h, 1 week

---

### VENUES - Services Page Fields

**Section 1: What I Offer**
- **Specialty** (Required) - Auto-populated from profile (Studio, Gallery, etc.) - Read-only, edit in Overview tab
- **Additional Venue Types** (Optional) - Multi-select: Can serve multiple purposes
- **Suitability Tags** (Required) - Multi-select: photoshoots, events, workshops, rehearsals, performances, exhibitions
- **Service Description** (Optional) - Text area

**Section 2: Pricing & Packages**
- Hourly Rate (Required) - Number input
- Half-Day Rate (Optional) - Number input
- Full-Day Rate (Optional) - Number input
- Packages (Optional) - Weekend packages, recurring hire discounts

**Section 3: Logistics & Requirements**
- Capacity (Required) - Number: max people
- Features / Amenities (Required) - Multi-select: lighting, sound, AC, mirrors, kitchen, bathroom, WiFi, etc.
- Venue Rules (Required) - Text area: noise restrictions, operating hours, bond required, alcohol rules
- Accessibility (Required) - Multi-select: wheelchair access, parking, lift, ground floor, etc.
- Floor Plan Upload (Optional) - File upload

---

### VENDORS - Services Page Fields

**Section 1: What I Offer**
- **Specialty** (Required) - Auto-populated from profile (Catering, AV Equipment, etc.) - Read-only, edit in Overview tab
- **Additional Services** (Optional) - Multi-select: Can offer multiple vendor services
- **Product Types** (Required) - Multi-select tags: specific equipment/products based on specialty
  - Catering: Buffet, Plated, Canapes, Desserts, Bar Service
  - AV Equipment: Speakers, Microphones, Projectors, Screens, Lighting
  - Decor: Flowers, Furniture, Draping, Centerpieces, Signage
- **Service Description** (Optional) - Text area

**Section 2: Pricing & Packages**
- Hire Fees (Required) - Per item or per package pricing
- Day / Project Rate (Optional) - Flat rate options
- Bundle Deals (Optional) - Package pricing
- Deposit Required? (Required) - Toggle + percentage/amount

**Section 3: Logistics & Requirements**
- Delivery Available? (Required) - Toggle Yes/No + delivery cost
- Set-Up Available? (Required) - Toggle Yes/No + setup cost
- Pickup Options (Required) - Customer pickup, vendor pickup, flexible
- Travel Radius (Required) - Distance slider or postcode coverage
- Equipment Specs (Optional) - Technical specifications document/link
- Minimum Hire Value (Required) - Number: minimum order value
- Insurance Coverage (Required) - Toggle Yes/No + details

---

### Implementation Plan for Services Page:

**Database Schema:**
```sql
-- Add to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS services_data JSONB;

-- Store dynamic fields as JSON based on user type
-- Example structure:
{
  "role_type": "Freelancer",
  "what_i_offer": {
    "role_areas": ["DJ", "MC"],
    "skills": ["Mixing", "Crowd Reading", "Equipment Setup"],
    "industries": ["Weddings", "Corporate", "Clubs"],
    "description": "Professional DJ with 10+ years experience..."
  },
  "pricing": {
    "rate_type": "per_set",
    "base_rate": 500,
    "packages": [...],
    "add_ons": [...]
  },
  "logistics": {
    "travel_available": true,
    "max_distance": 50,
    "equipment_provided": true,
    "equipment_list": ["PA System", "Lights", "Mixer"],
    "remote_work": false,
    "response_time": "24h"
  }
}
```

**Files to Create:**
- `src/components/profile/ServicesTab.jsx` - Main services container
- `src/components/profile/services/WhatIOffer.jsx` - Section 1
- `src/components/profile/services/PricingPackages.jsx` - Section 2
- `src/components/profile/services/Logistics.jsx` - Section 3
- `src/components/profile/services/FreelancerServices.jsx` - Freelancer fields
- `src/components/profile/services/VenueServices.jsx` - Venue fields
- `src/components/profile/services/VendorServices.jsx` - Vendor fields
- `src/api/services.ts` - API functions for services CRUD

**UI Component Structure:**
```jsx
<ServicesTab userRole={user.role}>
  <Section1_WhatIOffer>
    {userRole === 'Freelancer' && <FreelancerFields />}
    {userRole === 'Venue' && <VenueFields />}
    {userRole === 'Vendor' && <VendorFields />}
  </Section1_WhatIOffer>

  <Section2_PricingPackages>
    {/* Dynamic based on user role */}
  </Section2_PricingPackages>

  <Section3_Logistics>
    {/* Dynamic based on user role */}
  </Section3_Logistics>
</ServicesTab>
```

---

---

## AMENDMENT 9: Complete Specialty/Sub-type System ⭐⭐⭐⭐⭐

**Description:**
Comprehensive two-tier role system with specialty options for all user types. This is integrated into Amendments 7 & 8 but documented separately for reference.

**Priority:** CRITICAL (Part of Amendment 7 & 8)
**Effort:** Included in 2-week profile overhaul
**Business Impact:** CRITICAL - Enables specific discovery and categorization

### COMPLETE SPECIALTY OPTIONS

#### FREELANCER SPECIALTIES

**Performance & Entertainment:**
- DJ - Mobile/Club/Wedding DJ services
- MC / Host - Event hosting and emceeing
- Singer - Solo vocalists
- Musician - Instrumentalists (specify instrument in skills)
- Band - Musical groups
- Dancer - Professional dancers and choreographers
- Performer - General performance artists
- Actor - Theater and commercial actors
- Comedian - Stand-up and entertainment

**Visual Arts & Media:**
- Photographer - Event/Portrait/Commercial photography
- Videographer - Video production and filming
- Editor - Photo/Video post-production
- Drone Operator - Aerial photography and videography
- Graphic Designer - Visual design services

**Event Services:**
- Bartender - Bar and beverage services
- Waiter / Server - Front-of-house service
- Event Coordinator - On-site event management
- Security - Event security services

**Creative Services:**
- Makeup Artist - Beauty and special effects makeup
- Hair Stylist - Professional hair services
- Stylist - Fashion and wardrobe styling
- Florist - Floral design and arrangement

**Technical:**
- Sound Engineer - Audio production and mixing
- Lighting Technician - Lighting design and operation
- Stage Manager - Production management

#### VENDOR SPECIALTIES

**Food & Beverage:**
- Catering - Full catering services
- Mobile Bar - Bar hire and service
- Coffee Cart - Specialty coffee services
- Food Truck - Mobile food vendors
- Desserts - Specialty dessert catering
- Beverage Supplier - Drinks and refreshments

**Equipment & Technology:**
- AV Equipment - Audio/visual rental
- Lighting Equipment - Stage and event lighting
- Sound Equipment - PA systems and audio gear
- Photography Equipment - Camera and photo gear
- DJ Equipment - Turntables, controllers, speakers
- Projection Equipment - Projectors and screens

**Event Infrastructure:**
- Staging - Stage construction and rental
- Tenting - Tent and marquee hire
- Furniture - Table, chair, and furniture rental
- Flooring - Dance floors and surface solutions
- Fencing - Crowd barriers and perimeter fencing
- Generators - Power supply and generation

**Decoration & Design:**
- Decor - General event decoration
- Floral Design - Flowers and arrangements
- Balloon Services - Balloon decorations
- Signage - Event signage and wayfinding
- Draping - Fabric draping and backdrops
- Centerpieces - Table decoration

**Production Services:**
- Printing - Programs, signage, materials
- Photography Services - Photo booth hire
- Video Production - Filming services
- Live Streaming - Broadcast services
- LED Screens - Large format displays

**Logistics:**
- Transport - Vehicle and transport services
- Valet Parking - Parking management
- Security Services - Event security
- Cleaning Services - Pre/post event cleaning
- Waste Management - Rubbish and recycling

**Other:**
- Entertainment Rental - Games, activities
- Special Effects - Smoke, confetti, pyrotechnics
- Branding - Custom event branding

#### VENUE SPECIALTIES

**Indoor Spaces:**
- Studio - Photography/Film studios
- Gallery - Art galleries and exhibition spaces
- Theater - Performance theaters
- Event Hall - Large event venues
- Ballroom - Formal event spaces
- Conference Room - Meeting and conference facilities
- Warehouse - Industrial event spaces
- Loft - Open-plan loft spaces
- Restaurant - Restaurant venue hire
- Bar / Club - Bar and nightclub venues

**Outdoor Spaces:**
- Outdoor Space - General outdoor areas
- Garden - Garden venues
- Rooftop - Rooftop terraces
- Beachfront - Beach locations
- Park - Park and recreation areas
- Farm / Barn - Rural event spaces
- Vineyard - Winery venues
- Sports Field - Sports facilities

**Specialized Venues:**
- Rehearsal Space - Practice and rehearsal rooms
- Recording Studio - Audio recording facilities
- Dance Studio - Dance practice spaces
- Workshop Space - Creative workshop venues
- Showroom - Product display spaces
- Museum - Museum venue hire

### IMPLEMENTATION DETAILS

**Constants File Structure:**
```typescript
// src/constants/specialties.ts

export const SPECIALTY_OPTIONS = {
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

    // Equipment & Technology
    { value: 'av_equipment', label: 'AV Equipment', category: 'Equipment & Technology' },
    { value: 'lighting_equipment', label: 'Lighting Equipment', category: 'Equipment & Technology' },
    { value: 'sound_equipment', label: 'Sound Equipment', category: 'Equipment & Technology' },
    { value: 'photography_equipment', label: 'Photography Equipment', category: 'Equipment & Technology' },
    { value: 'dj_equipment', label: 'DJ Equipment', category: 'Equipment & Technology' },

    // Event Infrastructure
    { value: 'staging', label: 'Staging', category: 'Event Infrastructure' },
    { value: 'tenting', label: 'Tenting', category: 'Event Infrastructure' },
    { value: 'furniture', label: 'Furniture', category: 'Event Infrastructure' },
    { value: 'flooring', label: 'Flooring', category: 'Event Infrastructure' },

    // Decoration & Design
    { value: 'decor', label: 'Decor', category: 'Decoration & Design' },
    { value: 'floral_design', label: 'Floral Design', category: 'Decoration & Design' },
    { value: 'balloon_services', label: 'Balloon Services', category: 'Decoration & Design' },
    { value: 'signage', label: 'Signage', category: 'Decoration & Design' },

    // Logistics
    { value: 'transport', label: 'Transport', category: 'Logistics' },
    { value: 'security_services', label: 'Security Services', category: 'Logistics' },
    { value: 'cleaning', label: 'Cleaning Services', category: 'Logistics' },
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

    // Specialized Venues
    { value: 'rehearsal_space', label: 'Rehearsal Space', category: 'Specialized Venues' },
    { value: 'recording_studio', label: 'Recording Studio', category: 'Specialized Venues' },
    { value: 'dance_studio', label: 'Dance Studio', category: 'Specialized Venues' },
    { value: 'workshop_space', label: 'Workshop Space', category: 'Specialized Venues' },
  ],
}

export const getSpecialtyLabel = (role: string, specialtyValue: string): string => {
  const options = SPECIALTY_OPTIONS[role] || []
  const specialty = options.find(opt => opt.value === specialtyValue)
  return specialty?.label || specialtyValue
}

export const getSpecialtiesByCategory = (role: string) => {
  const options = SPECIALTY_OPTIONS[role] || []
  const grouped = {}
  options.forEach(opt => {
    if (!grouped[opt.category]) {
      grouped[opt.category] = []
    }
    grouped[opt.category].push(opt)
  })
  return grouped
}
```

**ProfileSetup Flow:**
```jsx
// Step 1: Select Role
<Select value={role} onChange={setRole}>
  <option value="Freelancer">Freelancer</option>
  <option value="Vendor">Vendor</option>
  <option value="Venue">Venue</option>
  <option value="Organiser">Organiser</option>
</Select>

// Step 2: Select Specialty (only if not Organiser)
{role !== 'Organiser' && (
  <Select value={specialty} onChange={setSpecialty}>
    {SPECIALTY_OPTIONS[role].map(opt => (
      <optgroup label={opt.category} key={opt.category}>
        {/* Options grouped by category */}
      </optgroup>
    ))}
  </Select>
)}
```

**Discovery Card Display:**
```jsx
<Card>
  <Badge variant="primary">{getSpecialtyLabel(profile.role, profile.specialty)}</Badge>
  <h3>{profile.display_name}</h3>
  <p>{profile.location}</p>
  <p>{profile.hourly_rate ? `$${profile.hourly_rate}/hr` : 'Contact for pricing'}</p>
</Card>
```

---

## SUMMARY OF AMENDMENTS

**Total Amendments:** 9 (including specialty system)
**Critical Priority:** 4 (Amendments 7, 8, 9 - profile system)
**High Priority:** 4 (Amendments 1, 3, 6)
**Medium Priority:** 2 (Amendments 4, 5)
**Completed:** 1 (Amendment 2 - discovery filters)

**Estimated Total Effort:** 2-3 weeks for all amendments

**Dependencies:**
- Amendment 9 (Specialty system) is integrated into Amendments 7 & 8
- Amendment 7 (Profile redesign) must be done before Amendment 8 (Services page)
- Amendment 6 (Jobs page reorg) is independent
- Amendment 1 (Availability filter) requires existing calendar system
- Amendment 3 (Subscription comparison) requires pricing tiers defined

---

# PART 4: PHASED IMPLEMENTATION ROADMAP

## PHASE 8: PAYMENT SYSTEM (v1.1)
**Duration:** 3-4 weeks
**Start Date:** Week of Nov 25, 2025
**Goal:** Enable monetization and financial transactions

**Week 1-2: Stripe Integration**
- [ ] Set up Stripe Connect
- [ ] Implement payment onboarding flow
- [ ] Create payment methods management
- [ ] Build payment processing workflow

**Week 3: Invoicing**
- [ ] Automated invoice generation
- [ ] Invoice PDF creation
- [ ] Email invoice delivery
- [ ] Invoice status tracking

**Week 4: Dashboard & Testing**
- [ ] Financial dashboard for organisers
- [ ] Earnings dashboard for freelancers
- [ ] Payment history
- [ ] End-to-end payment testing
- [ ] Security audit

**Deliverables:**
- ✅ Organisers can pay for bookings via Stripe
- ✅ Freelancers/vendors/venues receive automated payouts
- ✅ Invoices generated and emailed automatically
- ✅ Financial tracking dashboards

---

## PHASE 9: UX IMPROVEMENTS (v1.2)
**Duration:** 2-3 weeks
**Start Date:** Week of Dec 23, 2025
**Goal:** Improve user retention and satisfaction

**Week 1: Core Features**
- [ ] Favorites/save system
- [ ] Enhanced search & filtering
- [ ] Automated reminders

**Week 2: CRM Enhancements**
- [ ] Private notes
- [ ] Custom tags
- [ ] Activity logs

**Week 3: Polish**
- [ ] Mobile responsiveness fixes
- [ ] Loading states improvement
- [ ] Error handling

**Deliverables:**
- ✅ Users can save favorite profiles
- ✅ Better search experience
- ✅ CRM tools for managing roster
- ✅ Improved mobile experience

---

## PHASE 10: GROWTH FEATURES (v1.3)
**Duration:** 2-3 weeks
**Start Date:** Week of Jan 13, 2026
**Goal:** Drive user acquisition and engagement

**Week 1: Public Calendar**
- [ ] Event calendar page (public)
- [ ] SEO-optimized event pages
- [ ] Social sharing

**Week 2: Marketing Tools**
- [ ] Website embed widgets
- [ ] QR code generation
- [ ] Event promotion automation

**Week 3: Reviews & Trust**
- [ ] Full review system UI
- [ ] Rating displays
- [ ] Review moderation

**Deliverables:**
- ✅ Public event discovery
- ✅ Venues can promote via widgets
- ✅ Complete review system
- ✅ SEO optimized for organic growth

---

## PHASE 11: ENTERPRISE FEATURES (v2.0)
**Duration:** 4-6 weeks
**Start Date:** Week of Feb 3, 2026
**Goal:** Serve larger clients and venue groups

**Features:**
- [ ] Multi-venue management
- [ ] Advanced analytics
- [ ] API access
- [ ] White-label options
- [ ] Dedicated account managers
- [ ] Custom integrations

**Deliverables:**
- ✅ Portfolio management for venue groups
- ✅ Data warehouse and reporting
- ✅ API for third-party integrations
- ✅ Enterprise pricing tier

---

# PART 5: PRIORITIZATION MATRIX (UPDATED WITH AMENDMENTS)

## TIER 1: CRITICAL - MUST DO FIRST (v1.1)
1. **Amendment 7: Universal Profile Redesign** ⭐⭐⭐⭐⭐ (1 week)
   - Foundation for all other profile features
   - New tab structure: Overview, Portfolio, Services, Availability

2. **Amendment 8: Universal Services Page** ⭐⭐⭐⭐⭐ (1 week)
   - Depends on Amendment 7
   - Dynamic fields per user type (Freelancer/Venue/Vendor)
   - Core value proposition

3. **Amendment 6: Jobs Page Reorganization** ⭐⭐⭐⭐ (1 day)
   - Three tabs: Jobs Board, My Applications, My Listings
   - Better navigation and UX

## TIER 2: HIGH VALUE - DO NEXT (v1.2)
1. **Payment System** ⭐⭐⭐⭐⭐ (3-4 weeks)
   - Without this, no revenue
   - Can run in parallel with other work

2. **Amendment 1: Availability Filter** ⭐⭐⭐⭐ (2-3 days)
   - Core booking functionality
   - Filter discovery by availability

3. **Amendment 3: Subscription Compare Editions** ⭐⭐⭐⭐ (1-2 days)
   - Conversion optimization
   - Must define pricing tiers first

4. **Favorites/Save System** ⭐⭐⭐⭐ (2-3 days)
   - Core UX improvement
   - Users love this feature

5. **Booking Modifications** ⭐⭐⭐⭐ (3-4 days)
   - Real-world necessity
   - Edit bookings after acceptance

## TIER 3: QUICK WINS - EASY IMPROVEMENTS (v1.3)
1. **Amendment 2: Remove Discovery Filters** ⭐⭐⭐ (✅ DONE)
   - Already completed!

2. **Amendment 4: Remove Studio Pro** ⭐⭐⭐ (1 hour)
   - Simple cleanup

3. **Amendment 5: Remove Jobs from Studio** ⭐⭐⭐ (1-2 hours)
   - Clarifies workspace purpose

4. **Automated Reminders** ⭐⭐⭐ (1-2 days)
   - Reduces no-shows

5. **Enhanced Search & Filtering** ⭐⭐⭐ (2-3 days)
   - Better discovery

6. **CRM Enhancements** ⭐⭐⭐ (2-3 days)
   - Private notes, tags, activity logs

## TIER 4: GROWTH FEATURES (v1.4)
1. **Public Calendar/Gig Guide** ⭐⭐⭐ (1 week)
   - Marketing tool

2. **Website Widgets** ⭐⭐ (3-5 days)
   - Venue integration

3. **Review System Improvements** ⭐⭐ (2-3 days)
   - Trust & credibility

## TIER 5: ENTERPRISE & POLISH (v2.0+)
1. **Multi-Venue Management** ⭐⭐ (2 weeks)
   - Enterprise feature

2. **Advanced Analytics** ⭐⭐ (1 week)
   - Business intelligence

3. **API Platform** ⭐ (4-6 weeks)
   - Third-party integrations

---

# PART 6: SUCCESS METRICS

## v1.1 Success Criteria:
- [ ] 100% of bookings can be paid through platform
- [ ] 0 payment processing errors
- [ ] <5 second payment flow completion
- [ ] Invoices generated within 1 minute of booking

## v1.2 Success Criteria:
- [ ] 50%+ of organisers use favorites
- [ ] Search results < 2 seconds
- [ ] 80%+ mobile usability score

## v1.3 Success Criteria:
- [ ] 1,000+ public event views per week
- [ ] 10+ venues using embed widgets
- [ ] 100+ reviews submitted

## v2.0 Success Criteria:
- [ ] 10+ venue groups managing 50+ locations
- [ ] API used by 5+ third-party apps
- [ ] $100K+ monthly revenue

---

# PART 7: IMPLEMENTATION CHECKLIST

Before starting each feature:
- [ ] Review requirements with stakeholder
- [ ] Create technical design doc
- [ ] Estimate effort and timeline
- [ ] Check for dependencies
- [ ] Plan database schema changes
- [ ] Write migration scripts
- [ ] Create component structure

During implementation:
- [ ] Follow TDD (write tests first)
- [ ] Code review before merge
- [ ] Update documentation
- [ ] Test on staging environment
- [ ] Collect user feedback

After completion:
- [ ] Deploy to production
- [ ] Monitor error logs
- [ ] Measure success metrics
- [ ] Iterate based on feedback

---

# PART 8: RESOURCE ALLOCATION

## Team Structure Needed:

**v1.1 (Payment System):**
- 1-2 Full-stack developers (React + Supabase + Stripe)
- 1 QA tester (payment testing critical)
- 1 Designer (payment UX flows)

**v1.2 (UX Improvements):**
- 1 Full-stack developer
- 1 UI/UX designer
- Part-time QA

**v1.3 (Growth Features):**
- 1 Full-stack developer
- 1 Marketing/SEO specialist
- 1 Content creator (event descriptions)

**v2.0 (Enterprise):**
- 2 Full-stack developers
- 1 DevOps engineer
- 1 Technical account manager

---

# PART 9: RISKS & MITIGATION

## Technical Risks:

**Risk 1: Stripe Integration Complexity**
- Mitigation: Use Stripe's official React libraries
- Mitigation: Thorough testing in sandbox mode
- Mitigation: Phased rollout (beta users first)

**Risk 2: Database Performance at Scale**
- Mitigation: Implement caching early
- Mitigation: Optimize queries before launch
- Mitigation: Plan for sharding/replication

**Risk 3: Mobile Performance**
- Mitigation: PWA implementation
- Mitigation: Image optimization
- Mitigation: Code splitting and lazy loading

## Business Risks:

**Risk 1: Feature Creep**
- Mitigation: Stick to phased roadmap
- Mitigation: User feedback drives priorities
- Mitigation: Say "no" to non-critical features

**Risk 2: Competition (Surreal)**
- Mitigation: Focus on broader market (all creative events)
- Mitigation: Emphasize unique features (multi-role jobs, workspace)
- Mitigation: Build faster, launch sooner

**Risk 3: User Adoption**
- Mitigation: Free tier for service providers
- Mitigation: Easy onboarding (< 5 minutes)
- Mitigation: Referral program

---

# PART 10: NEXT STEPS

## Immediate Actions (This Week):

1. **Review this document with team**
2. **Prioritize Phase 8 features** (payment system)
3. **Set up Stripe Connect account**
4. **Create technical design for payments**
5. **Start development on v1.1**

## Ongoing:

1. **Update ammendments.txt** with any new requirements
2. **Weekly progress reviews** against roadmap
3. **Monthly user feedback sessions**
4. **Quarterly roadmap adjustments**

---

**Document Owner:** Development Team
**Last Updated:** November 24, 2025
**Next Review:** December 1, 2025

---

## APPENDIX: USEFUL LINKS

- Surreal Comparison: `/documentation/SURREAL_COMPARISON.md`
- V1 Implementation Tracker: `/documentation/V1_IMPLEMENTATION_TRACKER.md`
- Development Roadmap: `/documentation/DEVELOPMENT_ROADMAP.md`
- Platform Overview: `/documentation/PLATFORM_OVERVIEW.md`

---

*End of Master Implementation Plan*
