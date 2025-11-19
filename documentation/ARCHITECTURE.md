# TIES Together - Technical Architecture

**Last Updated:** November 10, 2025
**Architecture Decision:** 100% Supabase (Serverless)
**Status:** Active Development

---

## 🎯 ARCHITECTURE DECISION

**We are using a 100% Supabase serverless architecture.**

### Why Supabase Only?

1. ✅ **Single Stack** - One platform for everything (auth, database, storage, functions)
2. ✅ **Already Working** - Phases 1-4A built entirely on Supabase
3. ✅ **Serverless** - No servers to manage, scales automatically
4. ✅ **Cost Effective** - Pay only for what you use
5. ✅ **Developer Productivity** - JavaScript/TypeScript everywhere
6. ✅ **Real-time Built-in** - Perfect for messaging and live updates

### What We Removed

❌ **Flask Backend** - Was planned but never used in Phases 1-4A
❌ **Separate Backend Server** - Not needed with Edge Functions
❌ **Duplicate Authentication** - Supabase Auth handles everything

---

## 🏗️ SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│                   React + Vite + TypeScript                  │
│                                                              │
│  Components:                                                 │
│  • Auth (Login, Register, OAuth)                            │
│  • Discovery (Search, Map, Profiles)                        │
│  • Calendar (Availability, Booking)                         │
│  • Bookings (Request, Accept, Pay)                          │
│  • Jobs (Post, Apply, Select)                               │
│  • Messaging (Real-time Chat)                               │
│  • Profile (Edit, Portfolio)                                │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ Supabase Client SDK
                   │
┌──────────────────▼──────────────────────────────────────────┐
│                      SUPABASE                                │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │              SUPABASE AUTH                          │    │
│  │  • Email/Password Authentication                    │    │
│  │  • Google OAuth                                     │    │
│  │  • Email Confirmation                               │    │
│  │  • JWT Token Management                             │    │
│  │  • Row Level Security (RLS)                         │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │          SUPABASE DATABASE (PostgreSQL)             │    │
│  │                                                      │    │
│  │  Tables:                                            │    │
│  │  • profiles (users, roles, bios)                    │    │
│  │  • bookings (requests, status, payments)            │    │
│  │  • calendar_blocks (availability)                   │    │
│  │  • job_postings (Phase 5)                          │    │
│  │  • job_applications (Phase 5)                      │    │
│  │  • messages (Phase 6)                              │    │
│  │  • notifications (Phase 6)                         │    │
│  │                                                      │    │
│  │  Features:                                          │    │
│  │  • Row Level Security (RLS) Policies               │    │
│  │  • Database Functions (check_overlap, stats)       │    │
│  │  • Triggers (auto-timestamps, validation)          │    │
│  │  • Indexes (performance optimization)              │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │            SUPABASE STORAGE                         │    │
│  │  • Avatar uploads                                   │    │
│  │  • Portfolio files (images, PDFs)                   │    │
│  │  • Job posting attachments                          │    │
│  │  • RLS-protected buckets                            │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │         SUPABASE EDGE FUNCTIONS                     │    │
│  │         (Serverless TypeScript/Deno)                │    │
│  │                                                      │    │
│  │  Functions:                                         │    │
│  │  • create-payment-intent (Stripe)                   │    │
│  │  • handle-stripe-webhook (payment events)           │    │
│  │  • process-payout (freelancer payments)             │    │
│  │  • send-email (SendGrid integration)                │    │
│  │  • send-notification (push notifications)           │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │            SUPABASE REALTIME                        │    │
│  │  • Live messaging (WebSocket)                       │    │
│  │  • Notification updates                             │    │
│  │  • Booking status changes                           │    │
│  └────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
                   │
                   │ External APIs
                   │
┌──────────────────▼──────────────────────────────────────────┐
│                    EXTERNAL SERVICES                         │
│                                                              │
│  • Stripe (Payments & Connect)                              │
│  • SendGrid (Transactional Emails)                          │
│  • Mapbox (Maps & Geocoding)                                │
│  • Google OAuth (Social Login)                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 📦 CORE COMPONENTS

### 1. Authentication Flow

**Registration:**
```
User fills form → Supabase Auth signup → Email sent → User confirms → Profile created (trigger)
```

**Login:**
```
User enters credentials → Supabase Auth → JWT token → Frontend stores session
```

**OAuth (Google):**
```
User clicks Google → OAuth flow → Supabase creates user → Profile created (trigger)
```

### 2. Booking System (Phase 4A)

**Complete Workflow:**
```
1. Client browses discovery/map
2. Views freelancer public profile
3. Clicks "Book Now" button
4. Selects dates (checks availability via calendar_blocks)
5. Enters service description + message
6. Creates booking (status: pending)
7. Freelancer receives notification
8. Freelancer accepts → calendar auto-blocks dates
9. Booking status: accepted
10. After completion → mark as complete
```

**Future (Phase 4B - Payments):**
```
5.5. Payment UI appears (Stripe.js)
5.6. Edge Function creates Payment Intent
5.7. User enters card details
5.8. Payment processes
5.9. Booking created (status: paid)
10.5. Edge Function processes payout to freelancer
```

### 3. Calendar System

**Data Flow:**
```
Manual Block: User sets dates → Insert calendar_blocks → RLS protects
Booking Block: Accept booking → blockDatesForBooking() → Auto-insert calendar_blocks
Availability Check: Query calendar_blocks + bookings → Return available dates
Public View: Other users see blocked dates (can't book those dates)
```

### 4. Messaging System (Phase 6)

**Architecture:**
```
Frontend: Real-time subscription to messages table
Database: messages table with RLS (sender/recipient only)
Real-time: Supabase broadcasts INSERT events via WebSocket
UI: ChatGPT-style interface with live updates
```

### 5. Job Posting System (Phase 5)

**Workflow:**
```
1. Organiser creates job posting
2. Job appears in feed (filtered by role/location)
3. Freelancers apply with cover letter + portfolio
4. Organiser views all applicants
5. Organiser selects candidate → Creates booking automatically
6. Selected candidate receives notification + booking
7. Rejected candidates receive notification
```

---

## 🔐 SECURITY MODEL

### Row Level Security (RLS)

**All tables have RLS enabled with policies:**

**Profiles:**
- ✅ Anyone can view profiles (public discovery)
- ✅ Users can update their own profile only
- ✅ Users can delete their own profile

**Bookings:**
- ✅ Users can view bookings where they are client OR freelancer
- ✅ Clients can create bookings
- ✅ Freelancers can update booking status (accept/decline)
- ✅ Both parties can cancel

**Calendar Blocks:**
- ✅ Anyone can view calendar blocks (see availability)
- ✅ Users can create/update/delete their own blocks only

**Messages (Phase 6):**
- ✅ Users can view messages where they are sender OR recipient
- ✅ Users can send messages
- ❌ Users cannot edit/delete messages (audit trail)

**Job Postings (Phase 5):**
- ✅ Anyone can view active job postings
- ✅ Organisers can create/edit/delete their own postings
- ✅ Freelancers can view/apply to jobs

### Authentication

- **JWT Tokens** - Supabase generates signed tokens
- **Session Management** - localStorage + secure cookies
- **Token Expiry** - Auto-refresh on API calls
- **OAuth** - Google provider configured

---

## 💾 DATABASE SCHEMA

### Current Tables (Phase 1-4A Complete)

**profiles**
```sql
- id: UUID (primary key, references auth.users)
- display_name: TEXT
- role: TEXT (Artist, Organiser, Venue, Crew)
- bio: TEXT
- city: TEXT
- avatar_url: TEXT
- portfolio_urls: TEXT[]
- skills: TEXT[]
- hourly_rate: DECIMAL
- daily_rate: DECIMAL
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

**bookings**
```sql
- id: UUID (primary key)
- client_id: UUID (references profiles.id)
- freelancer_id: UUID (references profiles.id)
- start_date: TIMESTAMPTZ
- end_date: TIMESTAMPTZ
- status: TEXT (pending, accepted, declined, completed, cancelled, paid)
- total_amount: DECIMAL
- service_description: TEXT
- client_message: TEXT
- freelancer_response: TEXT
- cancellation_reason: TEXT
- stripe_payment_intent_id: TEXT (nullable)
- commission_amount: DECIMAL (nullable)
- payout_status: TEXT (nullable)
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
- CONSTRAINT: no_self_booking (client_id != freelancer_id)
```

**calendar_blocks**
```sql
- id: UUID (primary key)
- user_id: UUID (references profiles.id)
- start_date: DATE
- end_date: DATE
- reason: TEXT
- booking_id: UUID (nullable, references bookings.id)
- created_at: TIMESTAMPTZ
```

### Upcoming Tables (Phase 5-6)

**job_postings** (Phase 5)
```sql
- id: UUID (primary key)
- organiser_id: UUID (references profiles.id)
- title: TEXT
- description: TEXT
- role_required: TEXT (Artist, Crew, Venue, etc)
- location: TEXT
- budget: DECIMAL
- start_date: DATE
- end_date: DATE
- status: TEXT (open, in_progress, completed, cancelled)
- created_at: TIMESTAMPTZ
- deadline: TIMESTAMPTZ
```

**job_applications** (Phase 5)
```sql
- id: UUID (primary key)
- job_id: UUID (references job_postings.id)
- applicant_id: UUID (references profiles.id)
- cover_letter: TEXT
- portfolio_attachments: TEXT[]
- status: TEXT (pending, selected, rejected)
- created_at: TIMESTAMPTZ
```

**messages** (Phase 6)
```sql
- id: UUID (primary key)
- sender_id: UUID (references profiles.id)
- recipient_id: UUID (references profiles.id)
- message: TEXT
- read: BOOLEAN (default false)
- booking_id: UUID (nullable, references bookings.id)
- created_at: TIMESTAMPTZ
```

**notifications** (Phase 6)
```sql
- id: UUID (primary key)
- user_id: UUID (references profiles.id)
- type: TEXT (booking_request, booking_accepted, message, etc)
- title: TEXT
- message: TEXT
- link: TEXT
- read: BOOLEAN (default false)
- created_at: TIMESTAMPTZ
```

---

## 🚀 DEPLOYMENT ARCHITECTURE

### Production Setup

**Frontend:**
- Host: Vercel or Netlify
- Build: `npm run build`
- CDN: Automatic edge caching
- Domain: tiestogether.com.au

**Backend (Supabase):**
- Database: Supabase managed PostgreSQL
- Storage: Supabase managed S3-compatible
- Functions: Supabase Edge Functions (Deno runtime)
- Region: Auto-selected based on location

**External Services:**
- Stripe: Production mode (real payments)
- SendGrid: Verified domain for emails
- Mapbox: Production token

### Environment Variables

**Frontend (.env):**
```bash
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_APP_URL=https://tiestogether.com.au
VITE_MAPBOX_ACCESS_TOKEN=pk.eyJ...
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
VITE_STRIPE_CONNECT_CLIENT_ID=ca_...
```

**Edge Functions (.env):**
```bash
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...  (service_role key)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_CONNECT_CLIENT_ID=ca_...
STRIPE_WEBHOOK_SECRET=whsec_...
SENDGRID_API_KEY=SG.xxx
```

---

## 📊 SCALABILITY

### Current Capacity (Supabase Free Tier)

- Database: 500 MB (upgradeable)
- Storage: 1 GB (upgradeable)
- Edge Functions: 500K invocations/month
- Realtime: 200 concurrent connections
- Auth: Unlimited users

### Production Capacity (Supabase Pro ~$25/mo)

- Database: Unlimited
- Storage: 100 GB
- Edge Functions: 2M invocations/month
- Realtime: Unlimited connections
- Auth: Unlimited users
- Backups: Daily automatic

### Scaling Strategy

**Phase 1 (0-1000 users):** Free tier sufficient
**Phase 2 (1000-10000 users):** Upgrade to Pro ($25/mo)
**Phase 3 (10000+ users):** Add CDN, optimize queries, add indexes
**Phase 4 (Scale):** Consider dedicated Supabase instance

---

## 🔧 DEVELOPMENT WORKFLOW

### Local Development

```bash
# Frontend
npm run dev  # Runs on http://localhost:5173

# Database (Supabase)
# Use Supabase dashboard for migrations
# Test with real Supabase instance (test mode)

# Edge Functions (when needed)
supabase functions serve  # Local development
```

### Testing Strategy

1. **Unit Tests** - Component testing with Vitest
2. **Integration Tests** - API testing with test data
3. **Browser Tests** - Manual testing in dev mode
4. **E2E Tests** - Playwright for critical workflows

### Git Workflow

```
main → production (deployed to Vercel)
dev → development branch (active work)
feature/* → feature branches (PRs to dev)
```

---

## 📝 DECISION LOG

### Why Supabase Instead of Flask?

**Date:** November 10, 2025
**Decision:** Use 100% Supabase, remove Flask backend

**Reasoning:**
1. Phases 1-4A built entirely without Flask
2. Supabase provides all needed backend functionality
3. Edge Functions handle serverless compute needs
4. Single platform reduces complexity and cost
5. Better developer experience (TypeScript everywhere)
6. Built-in real-time for messaging
7. Scales automatically without DevOps

**Alternatives Considered:**
- Flask + Supabase (rejected - unnecessary complexity)
- Node.js + Express (rejected - same issues as Flask)
- AWS Lambda (rejected - Supabase Edge Functions simpler)

**Status:** ✅ Approved and Implemented

---

## 🎯 ARCHITECTURE PRINCIPLES

1. **Serverless First** - No servers to manage
2. **Security by Default** - RLS on all tables
3. **Real-time Where Needed** - Messaging, notifications
4. **Pay for What You Use** - Cost-effective scaling
5. **Developer Productivity** - TypeScript everywhere
6. **Single Source of Truth** - Supabase database
7. **Stateless Functions** - Edge Functions are pure
8. **Progressive Enhancement** - Works without JS for SEO

---

## 📚 REFERENCES

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Stripe Connect Documentation](https://stripe.com/docs/connect)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)

---

**Last Updated:** November 10, 2025
**Next Review:** After Phase 5 completion
