# Messages Page - Direct Job Offers (Behance-Style)

## Research Summary

### Industry Insights

**Behance Freelance Inquiries** ([Source](https://help.behance.net/hc/en-us/articles/11789181719963-FAQ-How-do-freelance-project-inquiries-work))
- "Hire Me" button on creative profiles
- Freelance job inquiries sent directly to inbox
- "Create Proposal" feature for official engagement offers
- Payment integration (Stripe/PayPal) for deposits
- Conversation continues in inbox until project completion
- **Private briefs** - not visible to other users, only sender and recipient

**Dribbble Hire Flow** ([Source](https://dribbble.com/hiring))
- "Hire Me" availability toggle on profiles
- Direct message with project details
- Quote request and proposal system
- Optional: Post publicly OR send privately
- Contract and milestone management

**99designs Direct Hiring** ([Source](https://99designs.com/))
- Invite specific designers to projects
- Direct negotiation via messages
- "1-to-1 Projects" - private between client and designer
- Status tracking: Invited → Accepted → In Progress → Complete

**Key Patterns Identified**:
1. **Entry Points**: "Hire Me" buttons, profile actions, search results
2. **Private Channel**: Offers sent directly, not visible to platform
3. **Structured Offers**: Title, description, budget, timeline, deliverables
4. **Status Workflow**: Sent → Viewed → Accepted/Rejected/Countered
5. **Conversation Integration**: Offer lives within ongoing conversation
6. **Payment Optional**: Some integrate payments, others just facilitate connection

---

## Current TIES Messages System

### What Already Exists

| Component | File | Purpose |
|-----------|------|---------|
| MessagesPage | `src/components/messages/MessagesPage.jsx` | Main messaging UI (627 lines) |
| Messages API | `src/api/messages.ts` | Direct messaging functions |
| Messages Table | `messages` | Stores all messages |
| Job Context Fields | `job_id`, `context_type` | Already supports job linking |

### Existing Database Schema

```sql
-- From: supabase/migrations/20251111150000_create_messages_table.sql
CREATE TABLE messages (
  id UUID PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id),
  sender_id UUID REFERENCES profiles(id),
  content TEXT,
  message_type TEXT DEFAULT 'text', -- 'text', 'image', 'file', 'system'
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- From: supabase/migrations/20251209100000_add_message_job_context.sql
ALTER TABLE messages ADD COLUMN job_id UUID REFERENCES job_postings(id);
ALTER TABLE messages ADD COLUMN context_type TEXT; -- 'job_inquiry', 'job_application', etc.
```

### Integration Points (Existing)

1. **PublicProfileView** - "Message" button already exists
2. **DiscoverPage** - Can navigate to profile → message
3. **JobApplicantsPage** - "Message" action for applicants
4. **Studio Workspace** - Team messaging for hired jobs

---

## Implementation Plan

### 1. New Database Table: `job_offers`

```sql
CREATE TABLE job_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Parties
  sender_id UUID NOT NULL REFERENCES profiles(id),
  recipient_id UUID NOT NULL REFERENCES profiles(id),

  -- Conversation Link
  conversation_id UUID REFERENCES conversations(id),
  message_id UUID REFERENCES messages(id), -- The message containing this offer

  -- Offer Details
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  event_type TEXT, -- 'wedding', 'corporate', 'party', etc.
  location TEXT,

  -- Dates
  event_date DATE,
  start_time TIME,
  end_time TIME,

  -- Compensation
  budget_type TEXT DEFAULT 'fixed', -- 'fixed', 'hourly', 'negotiable'
  budget_amount DECIMAL(10,2),
  budget_currency TEXT DEFAULT 'AUD',

  -- Role Details
  role_type TEXT, -- 'freelancer', 'vendor', 'venue'
  role_title TEXT, -- 'Photographer', 'Caterer', etc.
  required_skills TEXT[], -- Array of required skills

  -- Status Workflow
  status TEXT DEFAULT 'pending',
  -- Status values: 'pending', 'viewed', 'accepted', 'rejected', 'withdrawn', 'countered', 'expired'

  -- Response
  response_message TEXT, -- Optional message when accepting/rejecting
  responded_at TIMESTAMPTZ,

  -- Expiration
  expires_at TIMESTAMPTZ, -- Optional deadline to respond

  -- Conversion
  converted_to_booking_id UUID REFERENCES bookings(id), -- If accepted and converted
  converted_to_job_id UUID REFERENCES job_postings(id), -- If converted to public job

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_job_offers_sender ON job_offers(sender_id);
CREATE INDEX idx_job_offers_recipient ON job_offers(recipient_id);
CREATE INDEX idx_job_offers_status ON job_offers(status);
CREATE INDEX idx_job_offers_conversation ON job_offers(conversation_id);

-- RLS Policies
ALTER TABLE job_offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own job offers"
  ON job_offers FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can create job offers"
  ON job_offers FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Senders can withdraw offers"
  ON job_offers FOR UPDATE
  USING (auth.uid() = sender_id AND status = 'pending')
  WITH CHECK (status = 'withdrawn');

CREATE POLICY "Recipients can respond to offers"
  ON job_offers FOR UPDATE
  USING (auth.uid() = recipient_id AND status IN ('pending', 'viewed'))
  WITH CHECK (status IN ('viewed', 'accepted', 'rejected', 'countered'));
```

### 2. Message Type Extension

Add new message type for job offers:

```typescript
// In messages table
message_type: 'text' | 'image' | 'file' | 'system' | 'job_offer'

// When message_type = 'job_offer', the content contains:
// - Reference to job_offers table via job_offer_id
// - Or inline JSON with offer preview
```

### 3. New API Functions

```typescript
// src/api/jobOffers.ts

// Create and send a job offer
export async function sendJobOffer(
  recipientId: string,
  offer: {
    title: string
    description: string
    eventType?: string
    location?: string
    eventDate?: string
    budgetType: 'fixed' | 'hourly' | 'negotiable'
    budgetAmount?: number
    roleType: 'freelancer' | 'vendor' | 'venue'
    roleTitle: string
    requiredSkills?: string[]
    expiresAt?: string
  }
): Promise<{ success: boolean; data?: JobOffer; error?: string }>

// Get offers received
export async function getReceivedOffers(
  status?: string
): Promise<{ success: boolean; data: JobOffer[]; error?: string }>

// Get offers sent
export async function getSentOffers(
  status?: string
): Promise<{ success: boolean; data: JobOffer[]; error?: string }>

// Accept an offer
export async function acceptJobOffer(
  offerId: string,
  responseMessage?: string
): Promise<{ success: boolean; data?: JobOffer; error?: string }>

// Reject an offer
export async function rejectJobOffer(
  offerId: string,
  responseMessage?: string
): Promise<{ success: boolean; data?: JobOffer; error?: string }>

// Withdraw an offer (sender only)
export async function withdrawJobOffer(
  offerId: string
): Promise<{ success: boolean; error?: string }>

// Counter an offer with new terms
export async function counterJobOffer(
  offerId: string,
  counterOffer: Partial<JobOffer>
): Promise<{ success: boolean; data?: JobOffer; error?: string }>

// Convert accepted offer to booking
export async function convertOfferToBooking(
  offerId: string
): Promise<{ success: boolean; bookingId?: string; error?: string }>
```

### 4. UI Components

#### 4.1 Job Offer Composer Modal

```
┌─────────────────────────────────────────────────────────┐
│  Send Job Offer to [Recipient Name]                  ✕  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Title *                                                │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Wedding Photography                              │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Description *                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Looking for a photographer for our intimate     │   │
│  │ wedding ceremony on March 15th...               │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Event Type          Location                           │
│  ┌─────────────┐     ┌─────────────────────────────┐   │
│  │ Wedding   ▼ │     │ Melbourne, VIC              │   │
│  └─────────────┘     └─────────────────────────────┘   │
│                                                         │
│  Event Date          Time                               │
│  ┌─────────────┐     ┌──────────┐ to ┌──────────┐      │
│  │ 15/03/2025  │     │ 2:00 PM  │    │ 10:00 PM │      │
│  └─────────────┘     └──────────┘    └──────────┘      │
│                                                         │
│  Role *              Budget Type                        │
│  ┌─────────────┐     ┌─────────────┐                   │
│  │Photographer▼│     │ Fixed     ▼ │                   │
│  └─────────────┘     └─────────────┘                   │
│                                                         │
│  Budget Amount                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │ $ 2,500 AUD                                      │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Response Deadline (Optional)                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 7 days from now                                  │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  ℹ️ This offer will be sent privately to [Name] only.   │
│     It will not be visible to other users.              │
├─────────────────────────────────────────────────────────┤
│                              [Cancel]  [Send Offer]     │
└─────────────────────────────────────────────────────────┘
```

#### 4.2 Job Offer Card (In Messages)

```
┌─────────────────────────────────────────────────────────┐
│  💼 JOB OFFER                                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Wedding Photography                                    │
│  Melbourne, VIC • 15 Mar 2025 • 2:00 PM - 10:00 PM     │
│                                                         │
│  Looking for a photographer for our intimate wedding    │
│  ceremony on March 15th. We need coverage for 8 hours   │
│  including ceremony, reception, and portraits.          │
│                                                         │
│  💰 $2,500 AUD (Fixed)                                  │
│  📍 Melbourne, VIC                                      │
│  🎯 Role: Photographer                                  │
│                                                         │
│  ⏰ Respond by: March 1, 2025                           │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  [Decline]  [Counter]  [✓ Accept Offer]                 │
└─────────────────────────────────────────────────────────┘
```

**Status Variations**:

- **Pending** (recipient view): Shows Accept/Decline/Counter buttons
- **Pending** (sender view): Shows "Awaiting response" + Withdraw button
- **Accepted**: Shows green checkmark, "Offer Accepted" + "Create Booking" button
- **Rejected**: Shows red X, "Offer Declined" + optional response message
- **Withdrawn**: Shows gray "Offer Withdrawn"
- **Countered**: Shows "Counter Offer Sent" with new terms
- **Expired**: Shows "Offer Expired"

#### 4.3 Integration Points

**Profile Page - "Hire Me" Button**:
```jsx
// In PublicProfileView.jsx - Add alongside existing "Message" button
<Button onClick={() => setShowJobOfferModal(true)}>
  <Briefcase className="h-4 w-4 mr-2" />
  Send Job Offer
</Button>
```

**Messages Page - Compose Offer Action**:
```jsx
// In conversation header, add "Send Offer" button
<Button variant="outline" onClick={() => setShowJobOfferModal(true)}>
  <Plus className="h-4 w-4 mr-2" />
  Send Offer
</Button>
```

**Discover Page - Quick Action**:
```jsx
// In talent card dropdown menu
<DropdownMenuItem onClick={() => openOfferModal(profile)}>
  <Briefcase className="h-4 w-4 mr-2" />
  Send Job Offer
</DropdownMenuItem>
```

### 5. Status Workflow

```
                    ┌──────────────────┐
                    │     PENDING      │
                    └────────┬─────────┘
                             │
           ┌─────────────────┼─────────────────┐
           │                 │                 │
           ▼                 ▼                 ▼
    ┌──────────┐      ┌──────────┐      ┌──────────┐
    │ WITHDRAWN│      │  VIEWED  │      │ EXPIRED  │
    │(by sender)│     └────┬─────┘      │(deadline)│
    └──────────┘           │            └──────────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
           ▼               ▼               ▼
    ┌──────────┐    ┌──────────┐    ┌──────────┐
    │ ACCEPTED │    │ REJECTED │    │COUNTERED │
    └────┬─────┘    └──────────┘    └────┬─────┘
         │                               │
         ▼                               ▼
    ┌──────────┐                  (New offer created
    │ BOOKING  │                   with counter terms)
    │ CREATED  │
    └──────────┘
```

### 6. Notification System

Add notification types for job offers:

| Event | Notification Text | Recipients |
|-------|-------------------|------------|
| Offer Sent | "[Name] sent you a job offer: [Title]" | Recipient |
| Offer Viewed | "[Name] viewed your job offer" | Sender |
| Offer Accepted | "[Name] accepted your job offer!" | Sender |
| Offer Rejected | "[Name] declined your job offer" | Sender |
| Offer Countered | "[Name] sent a counter offer" | Original sender |
| Offer Expiring | "Job offer from [Name] expires in 24 hours" | Recipient |
| Offer Expired | "Job offer to [Name] has expired" | Sender |

---

## Implementation Files

| File | Changes |
|------|---------|
| `supabase/migrations/xxx_create_job_offers.sql` | New job_offers table |
| `src/api/jobOffers.ts` | New API functions |
| `src/components/messages/JobOfferCard.jsx` | Offer display in messages |
| `src/components/messages/JobOfferComposer.jsx` | Offer creation modal |
| `src/components/messages/MessagesPage.jsx` | Integrate offer UI |
| `src/components/profile/PublicProfileView.jsx` | Add "Send Offer" button |
| `src/components/discover/DiscoverPage.jsx` | Add quick action |

---

## Privacy & Security Considerations

1. **Visibility**: Job offers are ONLY visible to sender and recipient
2. **RLS Policies**: Strict row-level security on job_offers table
3. **No Public Listing**: Offers don't appear on Jobs page or search
4. **Withdrawal**: Only pending offers can be withdrawn
5. **Response Window**: Optional expiration prevents indefinite pending offers
6. **Audit Trail**: All status changes logged with timestamps

---

## Future Enhancements

1. **Payment Integration**: Deposits/escrow for accepted offers
2. **Contract Generation**: Auto-generate contracts from accepted offers
3. **Templates**: Save and reuse common offer templates
4. **Bulk Offers**: Send similar offers to multiple recipients
5. **Analytics**: Track offer acceptance rates, response times
6. **AI Suggestions**: Suggest budget based on role and market rates

---

## Success Metrics

- Number of job offers sent per week
- Offer acceptance rate
- Time to response
- Conversion rate: Offer → Booking
- User satisfaction with private hiring flow
- Reduction in "spam" public job posts
