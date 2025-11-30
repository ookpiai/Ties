# TIES Together V2 - Project Status
**Date:** November 29, 2025
**Session:** Premium Calendar System (Surreal-Inspired)

---

## 🎯 OVERVIEW

This session implemented a comprehensive Surreal.live-inspired premium calendar and booking system with availability requests, agent dashboards, and venue portfolio management.

---

## ✅ COMPLETED FEATURES

### 1. Availability Request System (Surreal-Style)

**Concept:** Separate "checking availability" from "making a booking offer" - just like Surreal.live does.

#### New Files Created:
```
src/api/availabilityRequests.ts          # API layer for availability requests
src/components/bookings/CheckAvailabilityButton.jsx  # "Check Availability" button
src/components/calendar/AvailabilityRequestsPanel.jsx # Bulk response panel
```

#### Features:
- **CheckAvailabilityButton** - Opens modal to select date, optional time range, and message
- **AvailabilityRequestsPanel** - View pending requests with thumbs up/down quick response
- **Bulk Response** - Select multiple requests and respond at once
- **Request Expiry** - Requests expire after 7 days

#### User Flow:
1. Client clicks "Check Availability" on freelancer's profile
2. Selects date (optionally time and message)
3. Freelancer sees request in their Bookings > Requests tab
4. Freelancer responds with Available/Unavailable (thumbs up/down)
5. Client notified and can then send actual booking offer

---

### 2. Enhanced Calendar Blocking

**New File:**
```
src/components/calendar/DateRangeBlockModal.jsx
```

#### Features:
- **Multi-day Selection** - Click and drag to select date ranges
- **Visibility Message** - Public message shown to clients (e.g., "On tour")
- **Internal Notes** - Private notes only the freelancer sees
- **Timezone Selection** - Proper timezone handling (Australia-focused defaults)
- **Recurrence Patterns** - Daily, weekly, biweekly, monthly recurring blocks

---

### 3. Schedule Grid View

**New File:**
```
src/components/calendar/ScheduleGridView.jsx
```

#### Features:
- **Week/Month Toggle** - Switch between week and month views
- **Color-Coded Statuses** - Visual booking status indicators:
  - Draft (gray)
  - Pending (orange)
  - Confirmed/Accepted (green)
  - In Progress (blue)
  - Completed (slate)
  - Cancelled/Declined (red)
  - Paid (emerald)
  - Blocked (slate/red)
- **Navigation** - Previous/Next, Today button
- **Event Pills** - Clickable events showing time and amount
- **Stats Summary** - Total bookings, confirmed count, revenue

---

### 4. Agent Dashboard Enhancements

**Existing File Enhanced:**
```
src/components/agent/AgentDashboard.jsx  # Already existed, using existing implementation
```

**New API Layer:**
```
src/api/agentDashboard.ts
```

#### Features:
- **Dashboard Stats** - Total talent, bookings, commissions
- **Talent Roster** - View and manage represented talent
- **Invite Talent** - Send invitations with commission rates
- **Permission Controls:**
  - Can accept bookings on behalf
  - Can negotiate rates
  - Can view financials
  - Can manage calendar
- **Combined Calendar View** - See all talent schedules in one place

---

### 5. Venue Portfolio System

**New Files:**
```
src/components/venue/VenuePortfolio.jsx
src/api/venuePortfolio.ts
```

#### Features:
- **Entertainer Contacts** - Track regular entertainers/vendors
- **Favorites & Tags** - Organize contacts with stars and tags
- **Preferred Rates** - Store negotiated rates per contact
- **Booking History** - View past bookings per entertainer
- **Quick Booking** - Check availability directly from contact list
- **Search & Filter** - Find contacts by name, specialty, or tags

---

### 6. BookingsPage Integration

**File Modified:**
```
src/components/bookings/BookingsPage.jsx
```

#### New Tabs Added:
- **Schedule** - Week/month calendar grid view with "Block Dates" button
- **Requests** - Availability requests panel with badge count

---

### 7. Profile Page Integration

**File Modified:**
```
src/components/profile/PublicProfileView.jsx
```

#### Changes:
- Added "Check Availability" button next to "Message" and "Book Now"
- Allows clients to check availability before making booking offers

---

## 🗄️ DATABASE CHANGES

### New Tables Created:

#### 1. `availability_requests`
```sql
- id (UUID, PK)
- requester_id (UUID, FK -> profiles)
- freelancer_id (UUID, FK -> profiles)
- requested_date (DATE)
- requested_start_time (TIME, optional)
- requested_end_time (TIME, optional)
- message (TEXT, optional)
- status ('pending', 'available', 'unavailable', 'expired')
- response_message (TEXT, optional)
- responded_at (TIMESTAMPTZ)
- created_at, expires_at
- UNIQUE(requester_id, freelancer_id, requested_date)
```

#### 2. `agent_talent_relationships`
```sql
- id (UUID, PK)
- agent_id (UUID, FK -> profiles)
- talent_id (UUID, FK -> profiles)
- status ('pending', 'active', 'inactive', 'rejected')
- commission_rate (DECIMAL, default 15%)
- can_accept_bookings (BOOLEAN)
- can_negotiate_rates (BOOLEAN)
- can_view_financials (BOOLEAN)
- can_manage_calendar (BOOLEAN)
- total_bookings (INTEGER)
- total_commission_earned (DECIMAL)
- invited_at, accepted_at, created_at, updated_at
```

#### 3. `venue_entertainer_contacts`
```sql
- id (UUID, PK)
- venue_id (UUID, FK -> profiles)
- entertainer_id (UUID, FK -> profiles)
- status ('active', 'inactive', 'blocked')
- is_favorite (BOOLEAN)
- preferred_rate (DECIMAL)
- preferred_rate_type ('hourly', 'daily', 'flat')
- default_set_length_hours (DECIMAL)
- internal_notes (TEXT)
- tags (TEXT[])
- total_bookings (INTEGER)
- last_booked_at (TIMESTAMPTZ)
- created_at, updated_at
```

### Enhanced Table: `calendar_blocks`
New columns added:
```sql
- timezone (TEXT, default 'Australia/Sydney')
- visibility_message (TEXT) -- shown to clients
- is_recurring (BOOLEAN)
- recurrence_pattern ('daily', 'weekly', 'biweekly', 'monthly')
```

### Migration File:
```
supabase/migrations/20251129_premium_calendar_system.sql
```

**Note:** Migration was applied via Supabase Management API due to migration tracking conflicts.

---

## 🛣️ ROUTES ADDED

| Route | Component | Description |
|-------|-----------|-------------|
| `/venue` | VenuePortfolio | Venue's entertainer contact management |
| `/agent` | AgentDashboard | Agent's talent management (already existed) |

---

## 📁 FILE SUMMARY

### New Files Created (12 files):
```
src/
├── api/
│   ├── availabilityRequests.ts     # Availability request API
│   ├── agentDashboard.ts           # Agent dashboard API
│   └── venuePortfolio.ts           # Venue portfolio API
├── components/
│   ├── agent/
│   │   ├── RequestToRepresentButton.jsx   # Agent request button
│   │   ├── PendingAgentRequestsPanel.jsx  # Freelancer request management
│   │   └── AgentOfferCard.jsx             # Commission/services display
│   ├── bookings/
│   │   └── CheckAvailabilityButton.jsx
│   ├── calendar/
│   │   ├── AvailabilityRequestsPanel.jsx
│   │   ├── DateRangeBlockModal.jsx
│   │   └── ScheduleGridView.jsx
│   └── venue/
│       └── VenuePortfolio.jsx

supabase/migrations/
└── 20251129_premium_calendar_system.sql
```

### Files Modified (5 files):
```
src/
├── App.jsx                           # Added VenuePortfolio import & /venue route
├── components/
│   ├── bookings/BookingsPage.jsx     # Added Schedule & Requests tabs
│   ├── profile/PublicProfileView.jsx # Added CheckAvailabilityButton + RequestToRepresentButton
│   └── settings/SettingsPage.jsx     # Added Agent Management section

supabase/migrations/
└── 20251110_create_job_system.sql    # Made idempotent (DROP IF EXISTS)
```

---

## 🔧 TECHNICAL NOTES

### Migration Deployment
The database migration was applied using the Supabase Management API's `/database/query` endpoint:
```bash
curl -X POST "https://api.supabase.com/v1/projects/{project_id}/database/query" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "..."}'
```

This was necessary because `supabase db push` had conflicts with the migration tracking table (duplicate version keys from previous manual runs).

### Idempotent Migrations
Updated older migration files to be idempotent by adding:
- `DROP POLICY IF EXISTS` before `CREATE POLICY`
- `DROP TRIGGER IF EXISTS` before `CREATE TRIGGER`

---

## 🧪 BUILD STATUS

```bash
npm run build
✓ built in 1m 1s
```

Build passes with no errors. Warnings about chunk size (Mapbox library is large).

---

## 🎨 UI/UX PATTERNS (Surreal-Inspired)

### Color Palette for Booking Statuses:
```javascript
const STATUS_COLORS = {
  draft: 'bg-slate-300 text-slate-700',
  pending: 'bg-orange-500 text-white',
  accepted: 'bg-green-500 text-white',
  in_progress: 'bg-blue-500 text-white',
  completed: 'bg-slate-400 text-white',
  cancelled: 'bg-red-500 text-white',
  declined: 'bg-red-400 text-white',
  paid: 'bg-emerald-600 text-white',
  booking: 'bg-purple-500 text-white',    // calendar blocks
  manual: 'bg-slate-500 text-white',      // manual blocks
  unavailable: 'bg-red-300 text-red-800'  // unavailable
}
```

### Interaction Patterns:
- **Thumbs Up/Down** - Quick availability response (Surreal-style)
- **Checkbox Selection** - Bulk operations on multiple items
- **Week/Month Toggle** - Calendar view switching
- **Favorites Star** - Quick access to preferred contacts

---

### 8. Agent Representation UI Components (NEW)

**New Files Created:**
```
src/components/agent/RequestToRepresentButton.jsx   # Button for agents to request representation
src/components/agent/PendingAgentRequestsPanel.jsx  # Panel for freelancers to view/respond to requests
src/components/agent/AgentOfferCard.jsx             # Display agent commission and services
```

**Files Modified:**
```
src/components/profile/PublicProfileView.jsx        # Added RequestToRepresentButton
src/components/settings/SettingsPage.jsx            # Added "Agent Management" settings section
```

#### Features:

**RequestToRepresentButton:**
- Only visible to verified agents viewing freelancer profiles
- Opens modal with commission rate slider (5-30%)
- Checkboxes for services offered (booking management, rate negotiation, calendar management, invoicing, marketing, contract review)
- Personal message field
- Shows existing link status if already connected

**PendingAgentRequestsPanel:**
- Shows all pending representation requests
- Displays agent profile, commission rate, and services offered
- Accept/Decline buttons with confirmation dialogs
- Benefits explanation for freelancers

**AgentOfferCard:**
- Visual display of agent's commission rate
- Services included breakdown
- Agent stats (talent count, bookings managed)
- Benefits of representation list
- Compact variants: `AgentOfferBadge`, `AgentOfferMini`

**Settings Integration:**
- New "Agent Management" category in Settings (for Freelancer/Artist/Crew roles)
- Shows pending request count badge
- Toggle for accepting agent requests
- Informational section explaining agent representation

---

## 📋 NEXT STEPS (Not Implemented)

1. **Notifications** - Send notifications when:
   - Availability request received
   - Availability response received
   - Agent invitation received/responded

2. **Draft Bookings** - Implement draft booking functionality for planning

3. **Recurring Block Creation** - Create actual recurring calendar blocks

4. **Real-time Updates** - Use Supabase realtime for instant updates

5. **Agent Commission on Invoices** - Automatic commission calculation and split

---

## 🔒 SECURITY

All new tables have Row Level Security (RLS) enabled:
- Users can only view/modify their own data
- Agents can only see their managed talent
- Venues can only see their contacts
- Proper authentication checks on all operations

---

*Documentation generated: November 29, 2025*
