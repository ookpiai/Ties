# TIES Together - Calendar & Invoice System Design

**Date:** November 24, 2025
**Objective:** Implement Surreal-quality calendar system + automatic invoice generation
**Status:** Design Phase

---

## 📋 EXECUTIVE SUMMARY

Based on comprehensive analysis of Surreal.live and current TIES Together implementation, this document outlines:

1. **Calendar System Enhancement** - Upgrade to match Surreal.live UX
2. **API Integration Strategy** - Leverage external APIs for calendar, invoicing, payments
3. **Automatic Invoice Generation** - Trigger on job completion

---

## 🎯 CURRENT STATE ANALYSIS

### What We Have:

#### ✅ Calendar/Availability System:
- Basic availability calendar per freelancer (`src/components/calendar/AvailabilityCalendar.jsx`)
- Date blocking on booking acceptance (`src/api/availability.ts`)
- Double-booking prevention (RPC function: `check_booking_overlap`)
- Calendar release on booking cancellation
- React Day Picker component (`react-day-picker` library)

#### ✅ Booking Workflow:
- Direct booking requests (Workflow 1)
- Job posting with applications (Workflow 2)
- Status management: pending → accepted → in_progress → completed
- Email notifications at each stage (SendGrid integration)
- Automatic calendar blocking on acceptance

#### ✅ API Infrastructure:
- Modular API layer (`src/api/` directory with 11 separate modules)
- Supabase backend (PostgreSQL + RLS + real-time)
- Email API (SendGrid - `src/api/emails.ts`)
- Geocoding API (Mapbox - `src/api/geocoding.ts`)
- Storage API (Supabase Storage - `src/api/storage.ts`)

### What We're Missing:

#### ❌ Calendar Features:
- Multi-venue/multi-event calendar view
- Bulk scheduling actions
- Calendar sync (Google Calendar, iCal)
- Week/Month/Day view options
- Drag-and-drop rescheduling
- Recurring availability blocks
- Team calendar (view multiple team members)

#### ❌ Invoice System:
- **No invoicing system whatsoever**
- No Stripe Connect integration (deferred to v1.1)
- No payment processing
- No automatic invoice generation
- No invoice templates
- No tax calculations
- No invoice tracking/status

---

## 🏗️ PROPOSED CALENDAR SYSTEM

### Design Principles (Surreal-Inspired):

1. **Central Calendar Per Event/Project** - All team members book into one calendar
2. **Availability Matching** - See freelancer availability before booking
3. **Multi-View Support** - Day, Week, Month views
4. **Bulk Actions** - Schedule multiple gigs/tasks at once
5. **External Integration** - Sync with Google Calendar, Outlook
6. **Mobile-First** - Touch-optimized interaction

---

### Technical Implementation:

#### Option 1: Build Custom Calendar Component

**Pros:**
- Full control over UX
- Tight integration with existing booking system
- No external dependencies

**Cons:**
- Time-consuming (2-3 weeks development)
- Complex calendar logic (timezones, DST, recurring events)
- Maintenance burden

**Stack:**
- Base: `react-day-picker` (already installed)
- Enhance with: `date-fns` for date manipulation
- Add: Drag-and-drop with `@dnd-kit/core`
- Views: Custom Week/Month/Day components

---

#### Option 2: Use Full-Featured Calendar Library (RECOMMENDED)

**Recommended: FullCalendar.io**

**Why FullCalendar:**
- Industry standard (used by Google Workspace, Microsoft 365 alternatives)
- Rich feature set out of the box
- Excellent mobile support
- Active development (v7 released 2025)
- React adapter: `@fullcalendar/react`

**Features:**
- ✅ Day/Week/Month/Agenda views
- ✅ Drag-and-drop rescheduling
- ✅ Event creation by clicking/dragging
- ✅ Recurring events
- ✅ Resource timeline (multiple freelancers side-by-side)
- ✅ External event drag-in
- ✅ Mobile touch support
- ✅ Timezone support
- ✅ iCal feed export/import

**Pricing:**
- **Free:** Basic views (month, day, list)
- **Premium ($395/year):** Timeline view, resource scheduling
- **For TIES:** Start free, upgrade when needed

**Installation:**
```bash
npm install @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction
```

**Example Implementation:**
```jsx
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'

<FullCalendar
  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
  initialView="timeGridWeek"
  headerToolbar={{
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay'
  }}
  events={bookingsData}
  editable={true}
  selectable={true}
  selectMirror={true}
  dayMaxEvents={true}
  eventClick={handleEventClick}
  select={handleDateSelect}
  eventDrop={handleEventDrop}
/>
```

---

#### Option 3: Calendar API Integration

**Google Calendar API + Cal.com (HYBRID APPROACH)**

**For Users Who Want External Sync:**
- **Cal.com API** - Open-source scheduling platform
- **Google Calendar API** - Two-way sync with Google Calendar
- **Nylas API** - Universal calendar sync (Google, Outlook, iCloud)

**Benefits:**
- Users manage availability in their existing calendar
- TIES reads availability, blocks dates
- Professional scheduling links (like Calendly)

**Implementation:**
1. **Cal.com Self-Hosted** (free, open-source)
   - Embed scheduling widget on profiles
   - API integration for availability checking
   - Users get `ties.com/username` booking links

2. **Google Calendar Sync**
   - OAuth authentication
   - Read user's busy/free times
   - Write bookings back to their calendar
   - Handle timezone conversions

**Stack:**
```bash
npm install @googleapis/calendar
npm install @calcom/api-client
```

---

### RECOMMENDED ARCHITECTURE:

**Hybrid: FullCalendar + Google Calendar Sync**

1. **Primary UI:** FullCalendar for in-app booking management
2. **External Sync:** Optional Google Calendar integration
3. **Public Scheduling:** Cal.com embed for public booking links

**Why This Works:**
- Users who love Google Calendar can sync
- Users who prefer in-app can use FullCalendar
- Best of both worlds

---

## 💳 INVOICE GENERATION SYSTEM

### Requirements:

1. **Automatic Trigger:** Generate invoice when booking status = `completed`
2. **Invoice Data:**
   - Client details (name, email, billing address)
   - Freelancer details (name, email, payment details)
   - Service description
   - Date range (start_date → end_date)
   - Total amount
   - Platform commission (10-15%)
   - Tax calculations (if applicable)
   - Payment status (pending/paid)
3. **Delivery:** Email PDF to both parties
4. **Storage:** Store in database + Supabase Storage
5. **Tracking:** Invoice status dashboard

---

### Option 1: Build Custom Invoice System

**Components:**
1. **Invoice Template:** React component styled as printable invoice
2. **PDF Generation:** `react-pdf` or `jspdf` library
3. **Database Table:** `invoices` table
4. **Email Delivery:** SendGrid with PDF attachment

**Pros:**
- Full control over design
- No external costs
- Custom branding

**Cons:**
- Time-consuming (1-2 weeks)
- Tax calculation complexity
- Compliance burden (invoice numbering, legal requirements)

**Stack:**
```bash
npm install @react-pdf/renderer
npm install jspdf jspdf-autotable
```

**Implementation:**
```typescript
// src/api/invoices.ts
export async function generateInvoice(bookingId: string) {
  // 1. Fetch booking data
  const booking = await getBookingById(bookingId)

  // 2. Calculate amounts
  const subtotal = booking.total_amount
  const commission = subtotal * 0.10  // 10% platform fee
  const freelancerPayout = subtotal - commission

  // 3. Generate PDF
  const pdf = await createInvoicePDF({
    invoiceNumber: generateInvoiceNumber(),
    booking,
    subtotal,
    commission,
    freelancerPayout
  })

  // 4. Store in Supabase Storage
  const { data: file } = await supabase.storage
    .from('invoices')
    .upload(`${bookingId}.pdf`, pdf)

  // 5. Save record to database
  const { data: invoice } = await supabase
    .from('invoices')
    .insert({
      booking_id: bookingId,
      invoice_number: invoiceNumber,
      file_url: file.path,
      status: 'pending'
    })

  // 6. Email to both parties
  await sendInvoiceEmail(booking.client_id, file.path)
  await sendInvoiceEmail(booking.freelancer_id, file.path)
}
```

---

### Option 2: Use Invoice API Service (RECOMMENDED)

**Recommended: Stripe Invoicing + Accounting APIs**

#### **Primary: Stripe Invoicing**

**Why Stripe:**
- Already planning Stripe Connect for v1.1
- Automatic invoice generation built-in
- Tax calculation included (Stripe Tax)
- Payment tracking automatic
- Compliance-ready (legal invoice requirements)
- PDF generation included
- Email delivery included
- Hosted invoice pages

**Features:**
- ✅ Automatic invoice on booking completion
- ✅ Tax calculations (US, EU, AU)
- ✅ Multi-currency support
- ✅ Subscription billing (if needed for Pro users)
- ✅ Payment tracking
- ✅ Refund handling
- ✅ Dunning (automatic retry failed payments)
- ✅ Branded invoices (add TIES logo)

**Pricing:**
- **Free** for invoice generation
- **0.4%** for automatic tax calculations (Stripe Tax)
- **2.9% + 30¢** for payment processing (standard)

**Implementation:**
```typescript
// src/api/invoices.ts
import Stripe from 'stripe'
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function generateInvoiceOnCompletion(bookingId: string) {
  const booking = await getBookingById(bookingId)

  // Create Stripe invoice
  const invoice = await stripe.invoices.create({
    customer: booking.client_stripe_id,
    collection_method: 'send_invoice',
    days_until_due: 30,
    metadata: {
      booking_id: bookingId
    }
  })

  // Add line item (the service)
  await stripe.invoiceItems.create({
    customer: booking.client_stripe_id,
    invoice: invoice.id,
    amount: booking.total_amount * 100, // cents
    currency: 'usd',
    description: booking.service_description
  })

  // Add platform fee (shown transparently)
  const platformFee = booking.total_amount * 0.10
  await stripe.invoiceItems.create({
    customer: booking.client_stripe_id,
    invoice: invoice.id,
    amount: platformFee * 100,
    currency: 'usd',
    description: 'TIES Platform Fee (10%)'
  })

  // Finalize and send
  const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id)
  await stripe.invoices.sendInvoice(invoice.id)

  // Save invoice reference
  await supabase
    .from('bookings')
    .update({
      stripe_invoice_id: finalizedInvoice.id,
      invoice_url: finalizedInvoice.hosted_invoice_url
    })
    .eq('id', bookingId)

  return finalizedInvoice
}
```

**Trigger in bookings.ts:**
```typescript
// Add to completeBooking() function after line 621
export async function completeBooking(bookingId: string, userId: string) {
  // ... existing code ...

  // Generate invoice automatically
  try {
    const invoice = await generateInvoiceOnCompletion(bookingId)
    console.log('✅ Invoice generated:', invoice.id)
  } catch (invoiceError) {
    console.error('⚠️ Failed to generate invoice:', invoiceError)
    // Don't throw - booking is still completed
  }

  return data
}
```

---

#### **Alternative: Invoice API Providers**

If you want invoice-only solution (without Stripe payments):

1. **Invoice Ninja** (Open-source, self-hosted)
   - Free forever
   - Self-hosted control
   - Full invoice management
   - API for automation
   - https://invoiceninja.com

2. **Invoice Simple API**
   - $9/month
   - Simple REST API
   - PDF generation
   - Template customization
   - https://www.invoicesimple.com

3. **Zoho Invoice API**
   - Free for <5 customers
   - Comprehensive features
   - Multi-currency
   - Tax handling
   - https://www.zoho.com/invoice

---

### RECOMMENDED ARCHITECTURE:

**Phase 1 (Immediate - v1.1):**
- Use Stripe Invoicing when implementing Stripe Connect
- Automatic invoice on `completeBooking()`
- Email delivery via Stripe
- Store `stripe_invoice_id` in bookings table

**Phase 2 (Future - v1.2+):**
- Add custom invoice template in TIES branding
- Invoice dashboard page (`/invoices`)
- Manual invoice creation for organizers
- Bulk invoice generation (monthly recurring)

---

## 🔗 API INTEGRATION STRATEGY

### Current API Usage:

**Excellent API Architecture:**
```
src/api/
├── availability.ts      ✅ Supabase
├── bookings.ts         ✅ Supabase
├── emails.ts           ✅ SendGrid
├── favorites.js        ✅ Supabase
├── geocoding.ts        ✅ Mapbox
├── jobs.ts             ✅ Supabase
├── messages.ts         ✅ Supabase (real-time)
├── profiles.ts         ✅ Supabase
├── reviews.ts          ✅ Supabase
├── services.ts         ✅ Supabase
└── storage.ts          ✅ Supabase Storage
```

### APIs to Add:

#### Priority 1: Payment & Invoicing
- **Stripe API** - Payments, invoices, payouts
  - Stripe Connect (marketplace payments)
  - Stripe Invoicing (automatic invoices)
  - Stripe Tax (tax calculations)

#### Priority 2: Calendar Integration
- **Google Calendar API** - Two-way sync
- **Microsoft Graph API** - Outlook calendar sync
- **Cal.com API** - Scheduling links (optional)

#### Priority 3: Communication Enhancement
- **Twilio API** - SMS notifications
- **Twilio SendGrid** - Already using for email
- **Pusher** - Real-time notifications (alternative to Supabase real-time)

#### Priority 4: Analytics & Monitoring
- **Google Analytics 4** - User behavior tracking
- **Sentry** - Error tracking
- **LogRocket** - Session replay debugging

#### Priority 5: Marketing & Growth
- **Mailchimp API** - Email campaigns
- **HubSpot API** - CRM for leads
- **Intercom API** - Customer support chat

---

## 📅 IMPLEMENTATION ROADMAP

### Phase 1: Invoice System (Week 1-2)

**Week 1:**
- [ ] Install Stripe SDK
- [ ] Create Stripe Connect accounts for freelancers
- [ ] Implement `generateInvoiceOnCompletion()` function
- [ ] Add `stripe_invoice_id` to bookings table
- [ ] Test invoice generation on localhost

**Week 2:**
- [ ] Integrate invoice generation into `completeBooking()`
- [ ] Add invoice display in BookingCard component
- [ ] Create `/invoices` page for invoice management
- [ ] Test end-to-end invoice flow
- [ ] Deploy to production

**Deliverables:**
- ✅ Automatic invoice on job completion
- ✅ PDF invoices emailed to both parties
- ✅ Invoice tracking in database
- ✅ Invoice view page

---

### Phase 2: Calendar Enhancement (Week 3-4)

**Week 3:**
- [ ] Install FullCalendar packages
- [ ] Create `CalendarPage.jsx` component
- [ ] Integrate booking data into calendar view
- [ ] Add day/week/month view toggle
- [ ] Style calendar to match TIES branding

**Week 4:**
- [ ] Implement drag-and-drop rescheduling
- [ ] Add click-to-create booking flow
- [ ] Test on mobile devices
- [ ] Add calendar to navigation menu
- [ ] Deploy to production

**Deliverables:**
- ✅ Full-featured calendar page
- ✅ Multi-view support (day/week/month)
- ✅ Drag-and-drop booking management
- ✅ Mobile-optimized calendar

---

### Phase 3: Google Calendar Sync (Week 5-6)

**Week 5:**
- [ ] Set up Google Cloud project
- [ ] Enable Google Calendar API
- [ ] Implement OAuth flow
- [ ] Add "Connect Google Calendar" button to settings
- [ ] Store calendar tokens securely

**Week 6:**
- [ ] Implement two-way sync logic
- [ ] Read user's busy/free times
- [ ] Write TIES bookings to Google Calendar
- [ ] Handle timezone conversions
- [ ] Test with multiple timezones
- [ ] Deploy to production

**Deliverables:**
- ✅ Google Calendar integration
- ✅ Two-way sync (read + write)
- ✅ Settings page for calendar preferences
- ✅ Timezone handling

---

## 💰 COST ANALYSIS

### Invoice & Payment APIs:

**Stripe:**
- Setup: Free
- Invoice generation: Free
- Stripe Tax (optional): 0.4% per transaction
- Payment processing: 2.9% + 30¢
- Payouts: Free (to freelancers)

**Estimated Monthly Cost (1000 bookings/month @ $500 avg):**
- Revenue: $500,000/month
- Platform fee (10%): $50,000
- Stripe fees (2.9%): $14,500
- Net revenue: $35,500/month

---

### Calendar APIs:

**FullCalendar:**
- Free tier: $0 (sufficient for v1)
- Premium: $395/year (only if need timeline view)

**Google Calendar API:**
- Free: 1,000,000 requests/day
- Cost: $0 (well within limits)

**Cal.com:**
- Self-hosted: Free (open-source)
- Hosted: $12/user/month (only if using hosted)

**Total Calendar Cost:** $0 (using free tiers)

---

## 🎯 SUCCESS METRICS

### Calendar System:
- User can view all bookings in calendar format
- User can switch between day/week/month views
- User can drag-and-drop to reschedule
- Mobile users can interact with calendar easily
- Calendar loads in < 2 seconds

### Invoice System:
- Invoice generated within 1 minute of job completion
- Invoice PDF delivered via email within 5 minutes
- 100% of completed bookings have invoices
- Invoice data matches booking data (zero discrepancies)
- Clients can download invoices from dashboard

### API Integration:
- All API calls have < 2 second response time
- API error rate < 1%
- API uptime > 99.5%
- Proper error handling and retries
- Logging for all API interactions

---

## 🔐 SECURITY CONSIDERATIONS

### Stripe Integration:
- Store Stripe keys in environment variables (never commit)
- Use Stripe webhooks for async events
- Validate webhook signatures
- Handle PCI compliance (Stripe handles this)
- Secure connected account IDs

### Google Calendar API:
- OAuth 2.0 flow for authentication
- Store refresh tokens encrypted
- Revoke access when user disconnects
- Request minimum necessary scopes
- Handle token expiration gracefully

### Invoice Storage:
- Store PDFs in private Supabase Storage bucket
- Generate signed URLs for downloads (expire in 1 hour)
- Never expose invoice data publicly
- Log all invoice access attempts
- Comply with data retention policies

---

## 📚 TECHNICAL SPECIFICATIONS

### New Database Tables:

#### `invoices`
```sql
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  stripe_invoice_id VARCHAR(255),
  invoice_url TEXT,
  file_url TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  subtotal DECIMAL(10,2) NOT NULL,
  platform_fee DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  due_date TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invoices_booking ON invoices(booking_id);
CREATE INDEX idx_invoices_status ON invoices(status);
```

#### `calendar_sync_settings`
```sql
CREATE TABLE calendar_sync_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  provider VARCHAR(20) NOT NULL, -- 'google', 'outlook', 'apple'
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expires_at TIMESTAMPTZ,
  calendar_id VARCHAR(255),
  sync_enabled BOOLEAN DEFAULT true,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_calendar_sync_user_provider ON calendar_sync_settings(user_id, provider);
```

---

### New API Modules:

#### `src/api/invoices.ts`
```typescript
export async function generateInvoiceOnCompletion(bookingId: string): Promise<Invoice>
export async function getInvoices(userId: string): Promise<Invoice[]>
export async function getInvoiceById(invoiceId: string): Promise<Invoice>
export async function downloadInvoicePDF(invoiceId: string): Promise<Blob>
export async function markInvoiceAsPaid(invoiceId: string): Promise<Invoice>
```

#### `src/api/calendar-sync.ts`
```typescript
export async function connectGoogleCalendar(userId: string): Promise<string> // OAuth URL
export async function handleGoogleCallback(code: string): Promise<void>
export async function syncBookingsToGoogleCalendar(userId: string): Promise<void>
export async function fetchGoogleCalendarEvents(userId: string): Promise<Event[]>
export async function disconnectCalendar(userId: string, provider: string): Promise<void>
```

---

## ✅ NEXT STEPS

### Immediate Actions:

1. **Approve Design** - Review this document and approve architecture
2. **Set Up Stripe** - Create Stripe account, get API keys
3. **Install Dependencies** - Add Stripe SDK and FullCalendar
4. **Database Migration** - Create `invoices` table
5. **Start Development** - Begin Phase 1 (Invoice System)

### Questions to Answer:

1. **Platform Fee:** What percentage commission? (Recommended: 10-15%)
2. **Currency:** USD only or multi-currency?
3. **Tax Handling:** Use Stripe Tax or manual?
4. **Calendar Priority:** FullCalendar first or Google Sync first?
5. **Timeline:** Need invoices before calendar or can do in parallel?

---

**Document Status:** ✅ Complete - Ready for Implementation
**Estimated Total Development Time:** 6 weeks
**Estimated Cost:** ~$400/year (FullCalendar Premium) + Stripe fees (2.9%)
