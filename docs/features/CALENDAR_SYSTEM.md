# Calendar System - Feature Analysis & Improvement Plan

## Overview

This document analyzes the Surreal booking platform's calendar system, compares it to TIES' current implementation, and provides a comprehensive roadmap for making the calendar a powerful, central feature of the platform.

---

## Surreal Calendar System (Reference Implementation)

### Sources
- [Surreal - Create and Manage Bookings](https://surreal.helpscoutdocs.com/article/110-create-and-manage-venue-event-calendar)
- [Surreal - Booking Agents](https://surreal.live/booking-agents)
- [Surreal - Availability Requests](https://surreal.helpscoutdocs.com/article/79-availability-requests)
- [Surreal - Booking and Invoicing Process](https://surreal.helpscoutdocs.com/article/113-surreal-booking-and-invoicing-process-for-agents)

### Core Philosophy
Surreal's calendar is described as **"purpose-built for entertainment management"** and is the central hub for all booking activity. Their tagline: *"It's like the power of Google Calendar and spreadsheets, but built specifically for agent workflows."*

### Key Features

#### 1. Schedule Views
| View | Description |
|------|-------------|
| **Scheduling View** | Grid view showing all venues/freelancers across columns, dates down rows |
| **Individual Calendar** | Per-user month view with detailed day information |
| **Month Navigation** | Scroll between months to view past, current, future events |
| **Status Filtering** | Filter by performance status (Draft, Offer, Confirmed) |
| **Name Search** | Search by entertainer/freelancer name |

#### 2. Event/Booking Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                    SURREAL BOOKING LIFECYCLE                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [AVAILABILITY REQUEST]                                          │
│         │                                                        │
│         ▼                                                        │
│  Freelancer responds: 👍 Available / 👎 Unavailable              │
│         │                                                        │
│         ▼ (if available)                                         │
│  [DRAFT STATUS]                                                  │
│  Placeholder event - No notification to freelancer               │
│         │                                                        │
│         ▼                                                        │
│  [OFFER STATUS]                                                  │
│  Sends offer with rates/times - Freelancer must accept           │
│         │                                                        │
│         ▼ (freelancer accepts)                                   │
│  [CONFIRMED STATUS]                                              │
│  Booking confirmed - Calendar blocked                            │
│         │                                                        │
│         ▼ (event occurs)                                         │
│  [POST-PERFORMANCE ADJUSTMENTS]                                  │
│  Modify times, rates, handle no-shows                            │
│         │                                                        │
│         ▼                                                        │
│  [INVOICING & PAYMENT]                                           │
│  Auto-generated invoice, payment processing                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### 3. Availability Request System
- **Not a booking offer** - Just checking if freelancer is free
- **Thumbs up/down response** - Simple binary availability
- **No payment shown** - Payment only visible in actual booking offer
- **Automatic notifications** - Requester notified of response

#### 4. Unavailability Management
- Freelancers can mark unavailable periods
- Date range selection (start/end)
- Timezone specification
- Optional message explaining reason
- Venues see popup when booking unavailable dates

#### 5. Multi-Venue/Multi-Freelancer Grid
- Book across multiple venues simultaneously
- See all artists' availability at once
- Prevent double-bookings automatically
- Clash detection and warnings

#### 6. Smart Workflows
- Bulk actions on multiple bookings
- Recurring event creation
- Post-performance time adjustments
- Automatic rate recalculation (hourly rates)
- Artist replacement for no-shows

#### 7. Communication Integration
- Built-in chat per booking
- Artist briefs attached to events
- Worksheets for event details
- Automated reminders (email + mobile)

#### 8. Payment Integration
- Rates visible in calendar
- Agency commission separate from artist payment
- Payment status tracking in calendar view
- Auto-invoicing after performance

---

## Current TIES Calendar Implementation

### What Exists

#### Components
| Component | Location | Purpose |
|-----------|----------|---------|
| `AvailabilityCalendar.jsx` | `/src/components/calendar/` | Basic month view with block/booking indicators |
| `ScheduleGridView.jsx` | `/src/components/calendar/` | Week/month grid with events |
| `DateRangeBlockModal.jsx` | `/src/components/calendar/` | Block date ranges with reason |
| `AvailabilityRequestsPanel.jsx` | `/src/components/calendar/` | View/respond to availability requests |
| `HourlyCalendar.jsx` | `/src/components/calendar/` | Hourly time slots |
| `DatePicker.jsx` | `/src/components/calendar/` | Date selection component |

#### APIs
| API | Location | Purpose |
|-----|----------|---------|
| `calendarUnified.ts` | `/src/api/` | Calendar blocks CRUD, availability checking |
| `availabilityRequests.ts` | `/src/api/` | Surreal-style availability requests |
| `availability.ts` | `/src/api/` | Legacy availability API |
| `calendar.ts` | `/src/api/` | Legacy calendar API |

#### Database Tables
- `calendar_blocks` - Blocked dates (booking, manual, unavailable, hold)
- `availability_requests` - Availability inquiries (pending, available, unavailable)

### Current Limitations

| Issue | Impact |
|-------|--------|
| **No dedicated /calendar route** | Calendar buried inside Bookings page |
| **Small calendar widget** | Not a primary feature, feels secondary |
| **No grid schedule view** | Can't see multiple freelancers/venues at once |
| **No job integration** | Calendar separate from Jobs system |
| **Limited status workflow** | Missing Draft → Offer → Confirmed flow |
| **No recurring events** | Manual creation for each occurrence |
| **No drag-and-drop** | Can't easily move/resize events |
| **No multi-select** | Can't bulk manage dates |
| **Basic blocking only** | Limited unavailability management |
| **No agency view** | Organizers can't see all their talent |

---

## Gap Analysis: Surreal vs TIES

| Feature | Surreal | TIES | Priority |
|---------|---------|------|----------|
| Dedicated Calendar Page | ✅ Central feature | ❌ Widget in Bookings | 🔴 HIGH |
| Schedule Grid View | ✅ Multi-venue/artist | ⚠️ Basic implementation | 🔴 HIGH |
| Availability Requests | ✅ Thumbs up/down | ✅ Implemented | ✅ Done |
| Draft/Offer/Confirmed | ✅ Full workflow | ❌ Missing | 🔴 HIGH |
| Recurring Events | ✅ Event series | ❌ Missing | 🟡 MEDIUM |
| Job Integration | ✅ Seamless | ❌ Disconnected | 🔴 HIGH |
| Multi-Freelancer View | ✅ Agency dashboard | ❌ Missing | 🟡 MEDIUM |
| Post-Event Adjustments | ✅ Time/rate changes | ❌ Missing | 🟡 MEDIUM |
| Built-in Chat per Event | ✅ Per-booking chat | ❌ Separate messaging | 🟡 MEDIUM |
| Unavailability Reasons | ✅ With message | ⚠️ Basic notes | 🟢 LOW |
| Automated Reminders | ✅ Email + mobile | ❌ Missing | 🟡 MEDIUM |
| Payment in Calendar | ✅ Rates visible | ❌ Missing | 🟡 MEDIUM |
| Drag-and-Drop | ✅ Move events | ❌ Missing | 🟢 LOW |
| Clash Detection | ✅ Automatic | ⚠️ Basic overlap check | 🟡 MEDIUM |

---

## Implementation Roadmap

### Phase 1: Calendar as Primary Feature

**Goal**: Make calendar a dedicated, central feature of the platform

#### 1.1 New Dedicated Calendar Page
```
Route: /calendar
Features:
- Full-screen calendar view
- Multiple view modes (day, week, month, agenda)
- Quick navigation (today, prev/next)
- Filter by type (bookings, blocks, jobs)
- Search functionality
```

#### 1.2 Enhanced Schedule Grid View
```
Features:
- Horizontal: Days/weeks
- Vertical: Your talent roster OR venues
- Color-coded status indicators
- Click-to-create events
- Hover for quick info
- Click for full details
```

#### 1.3 Navigation Integration
```
Add to main navigation:
- "Calendar" link in primary nav
- Calendar icon with notification badge
- Quick access from dashboard
```

### Phase 2: Job-Calendar Integration

**Goal**: Seamlessly connect Jobs system with Calendar

#### 2.1 Jobs Appear on Calendar
```sql
-- Events from job_postings should appear on calendar
-- When job is created with dates, auto-create calendar event
-- Job roles show as sub-events
```

#### 2.2 Apply to Job → Calendar Hold
```
When freelancer applies to job role:
1. Check calendar availability
2. If available, create "hold" block
3. Show hold on both organizer and freelancer calendars
4. Convert to "booking" when accepted
```

#### 2.3 Job Workspace → Calendar View
```
In job workspace:
- Calendar tab showing all team members
- Timeline of the event
- Each role's schedule
```

### Phase 3: Booking Lifecycle Enhancement

**Goal**: Implement Surreal-style Draft → Offer → Confirmed workflow

#### 3.1 New Status System
```typescript
type BookingStatus =
  | 'draft'        // Placeholder, no notification
  | 'offer'        // Sent to freelancer, awaiting response
  | 'confirmed'    // Accepted, calendar blocked
  | 'in_progress'  // Event happening
  | 'completed'    // Event finished
  | 'cancelled'    // Cancelled by either party
  | 'declined'     // Freelancer declined offer
```

#### 3.2 Offer System
```typescript
interface BookingOffer {
  id: string
  booking_id: string
  freelancer_id: string
  organizer_id: string

  // Offer details
  role_title: string
  description: string
  start_date: Date
  end_date: Date
  start_time?: string
  end_time?: string

  // Payment
  rate_type: 'flat' | 'hourly' | 'daily'
  rate_amount: number
  estimated_hours?: number
  total_amount: number

  // Status
  status: 'pending' | 'accepted' | 'declined' | 'expired' | 'withdrawn'
  expires_at: Date

  // Response
  responded_at?: Date
  response_message?: string
}
```

#### 3.3 Calendar Indicators
```
Visual indicators on calendar:
- Gray dashed: Draft (placeholder)
- Orange solid: Offer pending
- Green solid: Confirmed
- Blue solid: In progress
- Gray solid: Completed
```

### Phase 4: Organizer/Agency Dashboard

**Goal**: Let organizers see all their talent on one calendar

#### 4.1 Multi-Freelancer Grid
```
For organizers managing multiple freelancers/jobs:
- Rows: Freelancers in your job
- Columns: Dates
- Cells: Availability + bookings
- Quick-book from grid
```

#### 4.2 Venue Group Calendar
```
For venue owners with multiple venues:
- See all venues on one calendar
- Book entertainers across venues
- Prevent double-booking
```

### Phase 5: Smart Features

#### 5.1 Recurring Events
```typescript
interface RecurringPattern {
  type: 'daily' | 'weekly' | 'biweekly' | 'monthly'
  interval: number
  end_type: 'never' | 'after_count' | 'on_date'
  end_count?: number
  end_date?: Date
  days_of_week?: number[] // For weekly: [1,3,5] = Mon, Wed, Fri
}
```

#### 5.2 Automated Reminders
```
Notification triggers:
- 1 week before event
- 1 day before event
- 2 hours before event
- After event (for review request)
```

#### 5.3 Post-Event Adjustments
```
After event ends:
- Adjust actual start/end times
- Modify rates if needed
- Handle no-shows
- Artist replacement
- Notes for invoice
```

#### 5.4 Clash Detection
```typescript
async function checkForClashes(
  freelancerId: string,
  startDate: Date,
  endDate: Date
): Promise<ClashResult> {
  // Check calendar blocks
  // Check existing bookings
  // Check job applications (holds)
  // Return conflicts if any
}
```

---

## Database Schema Additions

### New Tables

```sql
-- Booking offers (Surreal-style)
CREATE TABLE booking_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id),
  job_id UUID REFERENCES job_postings(id),
  job_role_id UUID REFERENCES job_roles(id),

  freelancer_id UUID REFERENCES profiles(id) NOT NULL,
  organizer_id UUID REFERENCES profiles(id) NOT NULL,

  -- Offer details
  role_title VARCHAR(200),
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  timezone VARCHAR(50) DEFAULT 'Australia/Sydney',

  -- Payment
  rate_type VARCHAR(20) CHECK (rate_type IN ('flat', 'hourly', 'daily')),
  rate_amount DECIMAL(10,2) NOT NULL,
  estimated_hours DECIMAL(5,2),
  total_amount DECIMAL(10,2) NOT NULL,

  -- Status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
    'pending', 'accepted', 'declined', 'expired', 'withdrawn'
  )),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),

  -- Response
  responded_at TIMESTAMPTZ,
  response_message TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recurring event patterns
CREATE TABLE recurring_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_event_id UUID, -- First event in series
  pattern_type VARCHAR(20) CHECK (pattern_type IN (
    'daily', 'weekly', 'biweekly', 'monthly'
  )),
  interval_value INTEGER DEFAULT 1,
  end_type VARCHAR(20) CHECK (end_type IN (
    'never', 'after_count', 'on_date'
  )),
  end_count INTEGER,
  end_date DATE,
  days_of_week INTEGER[], -- For weekly patterns
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event reminders
CREATE TABLE event_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(20) CHECK (event_type IN (
    'booking', 'job', 'availability_request'
  )),
  event_id UUID NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  reminder_type VARCHAR(20) CHECK (reminder_type IN (
    '1_week', '1_day', '2_hours', 'post_event'
  )),
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  notification_method VARCHAR(20) DEFAULT 'email',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Post-event adjustments
CREATE TABLE booking_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) NOT NULL,
  adjusted_by UUID REFERENCES profiles(id) NOT NULL,

  -- Time adjustments
  original_start_time TIME,
  adjusted_start_time TIME,
  original_end_time TIME,
  adjusted_end_time TIME,

  -- Rate adjustments
  original_amount DECIMAL(10,2),
  adjusted_amount DECIMAL(10,2),
  adjustment_reason TEXT,

  -- No-show handling
  is_no_show BOOLEAN DEFAULT FALSE,
  no_show_party VARCHAR(20), -- 'freelancer' or 'client'
  replacement_freelancer_id UUID REFERENCES profiles(id),

  -- Notes
  internal_notes TEXT,
  invoice_notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Calendar view preferences
CREATE TABLE calendar_preferences (
  user_id UUID PRIMARY KEY REFERENCES profiles(id),
  default_view VARCHAR(20) DEFAULT 'month',
  week_starts_on INTEGER DEFAULT 1, -- 0=Sunday, 1=Monday
  working_hours_start TIME DEFAULT '09:00',
  working_hours_end TIME DEFAULT '18:00',
  show_weekends BOOLEAN DEFAULT TRUE,
  timezone VARCHAR(50) DEFAULT 'Australia/Sydney',
  color_scheme JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## UI Component Plan

### New Components

```
/src/components/calendar/
├── CalendarPage.jsx              # Main /calendar route
├── CalendarHeader.jsx            # Navigation, view toggles, filters
├── CalendarSidebar.jsx           # Mini calendar, upcoming events
├── CalendarGrid.jsx              # Main grid (day/week/month)
├── CalendarAgendaView.jsx        # List view of events
├── CalendarDayView.jsx           # Single day detailed view
├── CalendarWeekView.jsx          # Week view with time slots
├── CalendarMonthView.jsx         # Month grid view
├── CalendarEvent.jsx             # Event card/chip component
├── CalendarEventModal.jsx        # Create/edit event modal
├── CalendarQuickAdd.jsx          # Quick add popover
├── MultiFreelancerGrid.jsx       # Organizer view of all talent
├── BookingOfferCard.jsx          # Offer in calendar context
├── BookingOfferModal.jsx         # Create/view offer details
├── RecurringEventModal.jsx       # Set up recurring pattern
├── PostEventAdjustmentModal.jsx  # Adjust times/rates after event
├── CalendarFilters.jsx           # Filter by type, status, person
├── CalendarSearch.jsx            # Search events
├── EventRemindersPanel.jsx       # Manage reminder settings
├── ClashWarningModal.jsx         # Show when double-booking detected
└── CalendarSettings.jsx          # User calendar preferences
```

### Component Hierarchy

```
<CalendarPage>
  <CalendarHeader>
    <ViewToggle />       {/* Day | Week | Month | Agenda */}
    <DateNavigation />   {/* Today | < | > | Date Picker */}
    <CalendarFilters />
    <CalendarSearch />
  </CalendarHeader>

  <div className="calendar-layout">
    <CalendarSidebar>
      <MiniCalendar />
      <UpcomingEvents />
      <FilterPanel />
    </CalendarSidebar>

    <CalendarGrid>
      {viewMode === 'day' && <CalendarDayView />}
      {viewMode === 'week' && <CalendarWeekView />}
      {viewMode === 'month' && <CalendarMonthView />}
      {viewMode === 'agenda' && <CalendarAgendaView />}
    </CalendarGrid>
  </div>

  {/* Modals */}
  <CalendarEventModal />
  <BookingOfferModal />
  <RecurringEventModal />
  <PostEventAdjustmentModal />
  <ClashWarningModal />
</CalendarPage>
```

---

## API Additions

```typescript
// /src/api/calendarEnhanced.ts

// Event Management
export async function createCalendarEvent(params: CreateEventParams): Promise<CalendarEvent>
export async function updateCalendarEvent(id: string, updates: UpdateEventParams): Promise<CalendarEvent>
export async function deleteCalendarEvent(id: string): Promise<void>
export async function getCalendarEvents(params: GetEventsParams): Promise<CalendarEvent[]>

// Booking Offers
export async function createBookingOffer(params: CreateOfferParams): Promise<BookingOffer>
export async function respondToOffer(id: string, response: OfferResponse): Promise<BookingOffer>
export async function withdrawOffer(id: string): Promise<void>
export async function getMyOffers(): Promise<{ sent: BookingOffer[], received: BookingOffer[] }>

// Recurring Events
export async function createRecurringEvent(params: RecurringEventParams): Promise<CalendarEvent[]>
export async function updateRecurringSeries(patternId: string, updates: UpdateSeriesParams): Promise<void>
export async function deleteRecurringSeries(patternId: string, deleteMode: 'this' | 'future' | 'all'): Promise<void>

// Clash Detection
export async function checkAvailabilityClashes(params: ClashCheckParams): Promise<ClashResult>
export async function getConflictingEvents(userId: string, start: Date, end: Date): Promise<CalendarEvent[]>

// Post-Event
export async function createBookingAdjustment(params: AdjustmentParams): Promise<BookingAdjustment>
export async function markNoShow(bookingId: string, party: 'freelancer' | 'client'): Promise<void>
export async function assignReplacement(bookingId: string, newFreelancerId: string): Promise<void>

// Reminders
export async function setReminder(params: ReminderParams): Promise<EventReminder>
export async function cancelReminder(id: string): Promise<void>
export async function getMyReminders(): Promise<EventReminder[]>

// Preferences
export async function getCalendarPreferences(): Promise<CalendarPreferences>
export async function updateCalendarPreferences(updates: Partial<CalendarPreferences>): Promise<CalendarPreferences>

// Organizer Views
export async function getTeamCalendar(jobId: string): Promise<TeamCalendarData>
export async function getMyTalentCalendar(): Promise<TalentCalendarData>
export async function getVenueGroupCalendar(venueIds: string[]): Promise<VenueCalendarData>
```

---

## Navigation Changes

### Add to Main Nav

```jsx
// In Navbar.jsx or wherever navigation is defined
const navItems = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/calendar', icon: Calendar, label: 'Calendar' },  // NEW - Primary position
  { href: '/jobs', icon: Briefcase, label: 'Jobs' },
  { href: '/bookings', icon: CalendarCheck, label: 'Bookings' },
  { href: '/messages', icon: MessageSquare, label: 'Messages' },
  // ...
]
```

### Add Route

```jsx
// In App.jsx
<Route path="/calendar" element={
  <ProtectedRoute>
    <AppLayout>
      <CalendarPage />
    </AppLayout>
  </ProtectedRoute>
} />
```

---

## Success Metrics

After implementation, measure:

1. **Calendar Page Views** - Is it being used as a primary feature?
2. **Booking Conversion** - Do offers lead to confirmed bookings?
3. **Double-Booking Rate** - Are clashes being prevented?
4. **Time to Book** - Is the process faster?
5. **User Satisfaction** - Feedback on calendar UX

---

## Implementation Priority

### Sprint 1 (High Priority)
1. Create dedicated `/calendar` page
2. Add Calendar to main navigation
3. Implement enhanced month/week views
4. Integrate job events into calendar

### Sprint 2 (High Priority)
5. Implement Draft → Offer → Confirmed workflow
6. Build BookingOffer system
7. Add clash detection
8. Calendar event creation from calendar

### Sprint 3 (Medium Priority)
9. Multi-freelancer grid for organizers
10. Recurring events
11. Post-event adjustments
12. Enhanced unavailability management

### Sprint 4 (Lower Priority)
13. Automated reminders
14. Calendar preferences
15. Drag-and-drop events
16. Advanced filtering and search

---

*Document Created: December 2024*
*Last Updated: December 2024*
