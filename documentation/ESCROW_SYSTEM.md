# TIES Together - Escrow Payment System Specification

**Status:** 📋 PLANNED (Not Yet Implemented)
**Target:** Phase 4B-Escrow or v1.1 Post-Launch
**Priority:** HIGH (Critical for production trust & safety)
**Last Updated:** November 10, 2025

---

## 🎯 OBJECTIVE

Implement a **true escrow payment system** similar to Upwork/Fiverr where:
1. Client pays upfront → Money held in platform account
2. Freelancer completes work
3. **Client must approve** before freelancer receives payment
4. Automated dispute resolution if client rejects
5. Platform protects both parties

---

## 🔄 COMPLETE ESCROW FLOW

### **Step 1: Booking Request with Payment**

**User Actions:**
- Client browses discovery/map → Views freelancer profile
- Clicks "Book Now" → Selects dates → Sees total cost
- Enters card details → Clicks "Pay & Book"

**System Actions:**
```
1. Frontend calls Edge Function: create-payment-intent
2. Stripe creates Payment Intent (card authorized, NOT charged)
3. Booking created in database:
   - status: 'pending_acceptance'
   - payment_status: 'authorized'
   - stripe_payment_intent_id: 'pi_xxx'
4. Freelancer receives notification: "New booking request"
```

**Database State:**
```sql
bookings table:
- status: 'pending_acceptance'
- payment_status: 'authorized'
- client_approved: NULL
- dispute_status: NULL
```

---

### **Step 2: Freelancer Accepts Booking**

**User Actions:**
- Freelancer views booking request
- Reviews details (dates, service, amount)
- Clicks "Accept Booking"

**System Actions:**
```
1. Booking status → 'accepted'
2. Stripe CAPTURES payment (client's card charged)
3. Money held in TIES Platform Stripe account (escrow)
4. Calendar auto-blocks dates
5. Client receives notification: "Booking confirmed! Payment held in escrow."
```

**Database State:**
```sql
bookings table:
- status: 'accepted'
- payment_status: 'captured' (money held in escrow)
- escrow_amount: 1600
- platform_commission: 160
- freelancer_amount: 1440
- client_approved: NULL
```

**Money Location:** TIES Platform Stripe account (escrow)

---

### **Step 3: Work Period**

**User Actions:**
- Both parties can mark booking as 'in_progress' on start date
- Both can communicate via messaging
- Freelancer delivers work

**System Actions:**
```
1. Auto-update status to 'in_progress' on start_date
2. Send reminder notifications
3. Track milestones (if applicable)
```

**Database State:**
```sql
bookings table:
- status: 'in_progress'
- payment_status: 'captured' (still in escrow)
```

**Money Location:** Still in TIES Platform account (escrow)

---

### **Step 4: Work Completed - Approval Required ⭐**

**User Actions:**
- Freelancer marks work as "Complete"
- Optional: Uploads deliverables/proof of work

**System Actions:**
```
1. Booking status → 'pending_approval' ⚠️ NEW STATUS
2. Client receives notification:
   "John marked your booking complete. Please review and approve."
3. Start approval timer: 7 days for client to respond
```

**Database State:**
```sql
bookings table:
- status: 'pending_approval' ⚠️ CRITICAL STATE
- payment_status: 'captured' (still in escrow)
- completed_at: TIMESTAMP
- approval_deadline: completed_at + 7 days
- client_approved: NULL (waiting)
```

**Money Location:** Still in escrow (waiting for client approval)

---

### **Step 5A: Client Approves Work ✅**

**User Actions:**
- Client views booking
- Sees "Work Complete - Awaiting Your Approval"
- Reviews work quality
- Clicks **"Approve & Release Payment"**
- Optional: Leaves rating/review

**System Actions:**
```
1. Booking status → 'completed'
2. client_approved → TRUE
3. Edge Function: process-payout triggered
4. Stripe Transfer:
   - Platform keeps: $160 (10% commission)
   - Transfer to freelancer: $1,440 (90%)
5. Booking payment_status → 'paid'
6. Both parties receive notification:
   - Freelancer: "Payment released! $1,440 on the way."
   - Client: "Payment approved and sent to freelancer."
```

**Database State:**
```sql
bookings table:
- status: 'completed'
- payment_status: 'paid'
- client_approved: TRUE
- approved_at: TIMESTAMP
- payout_id: 'po_xxx' (Stripe payout ID)
```

**Money Location:**
- $1,440 → Freelancer's Stripe account → Bank account (2-5 days)
- $160 → Platform keeps as commission

---

### **Step 5B: Client Disputes Work ⚠️**

**User Actions:**
- Client views booking
- Not satisfied with work
- Clicks **"Dispute This Booking"**
- Fills dispute form:
  - Reason: dropdown (Poor quality, Incomplete, Didn't match description, etc.)
  - Description: textarea (detailed explanation)
  - Evidence: file uploads (screenshots, messages, etc.)
- Clicks "Submit Dispute"

**System Actions:**
```
1. Booking dispute_status → 'disputed'
2. Freeze payout (money stays in escrow)
3. Freelancer receives notification:
   "Client disputed your booking. Please respond with evidence."
4. Create dispute record in database
5. Platform admin receives notification for review
```

**Database State:**
```sql
bookings table:
- status: 'pending_approval' (unchanged)
- payment_status: 'captured' (frozen in escrow)
- client_approved: FALSE
- dispute_status: 'open'
- dispute_reason: 'poor_quality'
- dispute_description: "Photos were blurry and..."

disputes table (NEW):
- id: UUID
- booking_id: UUID
- initiated_by: 'client'
- reason: 'poor_quality'
- client_evidence: ['photo1.jpg', 'screenshot.png']
- freelancer_evidence: NULL (awaiting response)
- status: 'open'
- resolution: NULL
- resolved_by: NULL
- resolved_at: NULL
```

**Money Location:** FROZEN in escrow (neither party gets it yet)

---

### **Step 6: Dispute Resolution**

#### **6A: Freelancer Responds to Dispute**

**User Actions:**
- Freelancer receives dispute notification
- Views client's complaint and evidence
- Clicks "Respond to Dispute"
- Provides counter-evidence:
  - Response message
  - Evidence uploads (proof of delivery, communication logs, etc.)
- Clicks "Submit Response"

**System Actions:**
```
1. Update dispute record with freelancer evidence
2. dispute_status → 'awaiting_review'
3. Platform admin notified to review
```

**Database State:**
```sql
disputes table:
- status: 'awaiting_review'
- freelancer_evidence: ['delivery_proof.pdf', 'chat_log.png']
- freelancer_response: "I delivered exactly as requested..."
```

---

#### **6B: Platform Reviews Dispute**

**Platform Admin Actions:**
- Reviews both sides' evidence
- Reviews communication history
- Makes decision:
  - **Full Refund to Client** (100% to client, 0% to freelancer)
  - **Partial Refund** (e.g., 50% to each party)
  - **Payment to Freelancer** (0% to client, 90% to freelancer)

**System Actions:**
```
1. Admin selects resolution in dispute dashboard
2. Execute Stripe transfers based on decision
3. Update booking and dispute records
4. Notify both parties of decision
5. Close dispute
```

**Database State:**
```sql
disputes table:
- status: 'resolved'
- resolution: 'partial_refund'
- resolution_details: '50% to each party'
- resolved_by: 'admin_user_id'
- resolved_at: TIMESTAMP

bookings table:
- status: 'disputed_resolved'
- payment_status: 'partial_refund'
- client_approved: NULL
- dispute_status: 'resolved'
```

**Money Movements:**
```
Example: Partial Refund (50/50 split)
Original: $1,600 total

Option A: 50/50 split
- Client refund: $800
- Freelancer: $720 ($800 - 10% commission)
- Platform: $80 (10% on freelancer's portion)

Option B: Full refund to client
- Client refund: $1,600
- Freelancer: $0
- Platform: $0 (no commission)

Option C: Full payment to freelancer
- Client refund: $0
- Freelancer: $1,440 ($1,600 - 10% commission)
- Platform: $160 (10% commission)
```

---

### **Step 5C: Auto-Approval Timeout (No Client Response) ⏰**

**Scenario:** Client doesn't approve OR dispute within 7 days

**System Actions:**
```
1. Cron job checks bookings with:
   - status: 'pending_approval'
   - approval_deadline < NOW()
   - client_approved: NULL
   - dispute_status: NULL

2. Auto-approve booking:
   - booking status → 'completed'
   - client_approved → TRUE (auto)
   - auto_approved → TRUE (flag)

3. Process payout (same as manual approval)

4. Notify both parties:
   - Client: "Booking auto-approved (no response). Payment released."
   - Freelancer: "Client didn't respond. Payment auto-released! $1,440."
```

**Database State:**
```sql
bookings table:
- status: 'completed'
- payment_status: 'paid'
- client_approved: TRUE
- auto_approved: TRUE ⚠️ (indicates timeout approval)
- approved_at: TIMESTAMP
```

**Money Location:** Released to freelancer (same as manual approval)

---

## 🗄️ DATABASE SCHEMA ADDITIONS

### **New Columns in `bookings` Table**

```sql
ALTER TABLE bookings ADD COLUMN payment_status TEXT DEFAULT 'pending';
ALTER TABLE bookings ADD COLUMN escrow_amount DECIMAL(10,2);
ALTER TABLE bookings ADD COLUMN platform_commission DECIMAL(10,2);
ALTER TABLE bookings ADD COLUMN freelancer_amount DECIMAL(10,2);
ALTER TABLE bookings ADD COLUMN client_approved BOOLEAN DEFAULT NULL;
ALTER TABLE bookings ADD COLUMN auto_approved BOOLEAN DEFAULT FALSE;
ALTER TABLE bookings ADD COLUMN completed_at TIMESTAMPTZ;
ALTER TABLE bookings ADD COLUMN approved_at TIMESTAMPTZ;
ALTER TABLE bookings ADD COLUMN approval_deadline TIMESTAMPTZ;
ALTER TABLE bookings ADD COLUMN dispute_status TEXT;
ALTER TABLE bookings ADD COLUMN dispute_reason TEXT;
ALTER TABLE bookings ADD COLUMN dispute_description TEXT;
ALTER TABLE bookings ADD COLUMN payout_id TEXT;

-- Valid payment statuses
ALTER TABLE bookings ADD CONSTRAINT valid_payment_status
CHECK (payment_status IN (
  'pending', 'authorized', 'captured', 'paid', 'refunded', 'partial_refund'
));

-- Valid dispute statuses
ALTER TABLE bookings ADD CONSTRAINT valid_dispute_status
CHECK (dispute_status IS NULL OR dispute_status IN (
  'open', 'awaiting_response', 'awaiting_review', 'resolved', 'closed'
));
```

---

### **New `disputes` Table**

```sql
CREATE TABLE disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  initiated_by TEXT NOT NULL, -- 'client' or 'freelancer'
  reason TEXT NOT NULL,

  -- Client evidence
  client_description TEXT,
  client_evidence JSONB, -- Array of file URLs

  -- Freelancer response
  freelancer_response TEXT,
  freelancer_evidence JSONB, -- Array of file URLs

  -- Resolution
  status TEXT NOT NULL DEFAULT 'open',
  resolution TEXT, -- 'full_refund', 'partial_refund', 'payment_to_freelancer'
  resolution_details TEXT,
  resolution_amount_client DECIMAL(10,2),
  resolution_amount_freelancer DECIMAL(10,2),
  resolved_by UUID REFERENCES profiles(id),
  resolved_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_initiated_by CHECK (initiated_by IN ('client', 'freelancer')),
  CONSTRAINT valid_dispute_status CHECK (status IN (
    'open', 'awaiting_response', 'awaiting_review', 'resolved', 'closed'
  ))
);

-- Indexes
CREATE INDEX idx_disputes_booking_id ON disputes(booking_id);
CREATE INDEX idx_disputes_status ON disputes(status);
CREATE INDEX idx_disputes_resolved_by ON disputes(resolved_by);

-- RLS Policies
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;

-- Both parties + admins can view disputes for their bookings
CREATE POLICY "Users can view disputes for their bookings"
ON disputes FOR SELECT
USING (
  booking_id IN (
    SELECT id FROM bookings
    WHERE client_id = auth.uid() OR freelancer_id = auth.uid()
  )
);

-- Clients can create disputes
CREATE POLICY "Clients can create disputes"
ON disputes FOR INSERT
WITH CHECK (
  initiated_by = 'client'
  AND booking_id IN (SELECT id FROM bookings WHERE client_id = auth.uid())
);

-- Freelancers can update with their response
CREATE POLICY "Freelancers can respond to disputes"
ON disputes FOR UPDATE
USING (
  booking_id IN (SELECT id FROM bookings WHERE freelancer_id = auth.uid())
  AND status = 'open'
);
```

---

### **New `dispute_evidence` Table (Optional - for complex evidence)**

```sql
CREATE TABLE dispute_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id UUID NOT NULL REFERENCES disputes(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES profiles(id),
  file_type TEXT NOT NULL, -- 'image', 'video', 'document', 'screenshot'
  file_url TEXT NOT NULL,
  file_name TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_file_type CHECK (file_type IN (
    'image', 'video', 'document', 'screenshot', 'other'
  ))
);

CREATE INDEX idx_dispute_evidence_dispute_id ON dispute_evidence(dispute_id);
```

---

## 🎨 UI COMPONENTS NEEDED

### **1. Approval Button (Client View)**

**Component:** `BookingApprovalCard.jsx`
**Location:** `src/components/bookings/BookingApprovalCard.jsx`

**Features:**
- Shows when booking status = 'pending_approval'
- Displays work completion notice
- Shows countdown timer: "X days left to review"
- Two prominent buttons:
  - "Approve & Release Payment" (green)
  - "Dispute This Booking" (red/orange)
- Optional: Rating/review form

---

### **2. Dispute Form Modal**

**Component:** `DisputeModal.jsx`
**Location:** `src/components/bookings/DisputeModal.jsx`

**Features:**
- Reason dropdown (required):
  - Poor quality work
  - Incomplete deliverables
  - Didn't match description
  - Communication issues
  - Other
- Description textarea (required): 500 char min
- Evidence upload (optional but recommended):
  - Accept: images, videos, PDFs, text files
  - Max 10 files, 5MB each
  - Show preview thumbnails
- Warning message: "Disputes are reviewed by platform admin. Provide clear evidence."
- Submit button

---

### **3. Dispute Response Form (Freelancer View)**

**Component:** `DisputeResponseModal.jsx`
**Location:** `src/components/bookings/DisputeResponseModal.jsx`

**Features:**
- Shows client's complaint and evidence
- Response textarea (required)
- Counter-evidence upload (optional)
- Submit button
- Warning: "Your response will be reviewed by platform admin along with client's evidence."

---

### **4. Dispute Dashboard (Admin View)**

**Component:** `DisputeDashboard.jsx`
**Location:** `src/components/admin/DisputeDashboard.jsx`

**Features:**
- List all open disputes
- Filter by status: Open / Awaiting Response / Under Review
- Sort by: Date / Amount / Priority
- Dispute detail view:
  - Booking details
  - Client complaint + evidence
  - Freelancer response + evidence
  - Communication history
  - Resolution options:
    - Full refund to client (slider: 100% client)
    - Partial refund (slider: 0-100%)
    - Full payment to freelancer (slider: 100% freelancer)
  - Notes field (internal)
  - Resolve button

---

### **5. Escrow Status Badge**

**Component:** Update `BookingCard.jsx`
**Features:**
- Show payment status badge:
  - "Payment Authorized" (yellow)
  - "Payment in Escrow" (blue)
  - "Awaiting Approval" (orange)
  - "Payment Released" (green)
  - "Disputed" (red)
  - "Refunded" (gray)

---

## 🔧 EDGE FUNCTIONS NEEDED

### **1. `create-payment-intent` (Already Created)**
- Creates Stripe Payment Intent
- Calculates commission
- Returns clientSecret for frontend

---

### **2. `process-payout` (New)**

**Purpose:** Transfer money from escrow to freelancer after approval

**Triggered by:**
- Client clicks "Approve"
- Auto-approval timeout

**Actions:**
```typescript
1. Verify booking is approved
2. Calculate amounts:
   - Platform commission: 10%
   - Freelancer payout: 90%
3. Create Stripe Transfer to freelancer's connected account
4. Update booking: payment_status = 'paid'
5. Record payout_id
6. Send notifications to both parties
```

---

### **3. `process-refund` (New)**

**Purpose:** Refund money to client after dispute resolution

**Triggered by:**
- Admin resolves dispute with refund decision

**Actions:**
```typescript
1. Verify dispute resolution
2. Calculate refund amount (full or partial)
3. Create Stripe Refund
4. If partial: also create Transfer to freelancer
5. Update booking: payment_status = 'refunded' or 'partial_refund'
6. Update dispute: status = 'resolved'
7. Send notifications with resolution details
```

---

### **4. `handle-stripe-webhook` (Partially Created)**

**Additional Events to Handle:**
```typescript
- payment_intent.succeeded → Confirm escrow capture
- payment_intent.payment_failed → Cancel booking, notify client
- transfer.created → Confirm payout sent to freelancer
- transfer.failed → Alert admin, retry payout
- refund.created → Confirm refund to client
- refund.failed → Alert admin
```

---

### **5. `auto-approve-cron` (New - Scheduled Function)**

**Purpose:** Auto-approve bookings after 7-day deadline

**Schedule:** Runs every hour

**Actions:**
```typescript
1. Query bookings:
   - status = 'pending_approval'
   - approval_deadline < NOW()
   - client_approved IS NULL
   - dispute_status IS NULL

2. For each booking:
   - Update client_approved = TRUE, auto_approved = TRUE
   - Update status = 'completed'
   - Call process-payout function
   - Send notifications

3. Log auto-approvals for audit
```

---

## ⏱️ TIMELINES & AUTO-ACTIONS

### **Approval Deadline**
- **Trigger:** Freelancer marks complete
- **Deadline:** 7 days after completion
- **Action if missed:** Auto-approve + release payment

### **Dispute Response Deadline**
- **Trigger:** Client files dispute
- **Deadline:** 3 days for freelancer response
- **Action if missed:** Admin reviews with only client evidence

### **Admin Review Deadline**
- **Trigger:** Dispute awaiting review
- **Deadline:** 5 business days
- **Action if missed:** Escalate to senior admin

---

## 📧 NOTIFICATIONS

### **Email Templates Needed:**

1. **Booking Awaiting Approval** (Client)
   - Subject: "Review your booking with {freelancer_name}"
   - Body: Work completed, countdown timer, approve/dispute buttons

2. **Auto-Approval Warning** (Client)
   - Subject: "24 hours to review booking with {freelancer_name}"
   - Body: Final reminder before auto-approval

3. **Payment Auto-Approved** (Both)
   - Subject: "Booking auto-approved - Payment released"
   - Body: No response received, payment processed

4. **Dispute Filed** (Freelancer)
   - Subject: "Client disputed your booking"
   - Body: View dispute details, respond with evidence

5. **Dispute Resolved** (Both)
   - Subject: "Dispute resolved: {resolution}"
   - Body: Final decision, payment breakdown

---

## 💰 FINANCIAL CALCULATIONS

### **Commission Calculation**

```javascript
function calculatePayments(totalAmount) {
  const PLATFORM_COMMISSION_RATE = 0.10 // 10%

  const platformCommission = Math.round(totalAmount * PLATFORM_COMMISSION_RATE)
  const freelancerAmount = totalAmount - platformCommission

  return {
    totalAmount,
    platformCommission,
    freelancerAmount,
    platformRate: '10%'
  }
}
```

### **Partial Refund Calculation**

```javascript
function calculatePartialRefund(totalAmount, refundPercentage) {
  // refundPercentage: 0-100 (e.g., 50 = 50% to each party)

  const clientRefund = Math.round(totalAmount * (refundPercentage / 100))
  const remainingAmount = totalAmount - clientRefund
  const platformCommission = Math.round(remainingAmount * 0.10)
  const freelancerPayout = remainingAmount - platformCommission

  return {
    clientRefund,
    freelancerPayout,
    platformCommission,
    refundPercentage: `${refundPercentage}%`
  }
}
```

---

## 🔒 SECURITY CONSIDERATIONS

### **Fraud Prevention**

1. **Multiple Disputes** - Flag users with >3 disputes
2. **Rapid Disputes** - Flag disputes filed <1 hour after completion
3. **Evidence Manipulation** - Check file timestamps
4. **Collusion Detection** - Flag same user pairs with repeated disputes

### **Audit Trail**

Log all actions in `audit_log` table:
- Payment captures
- Approvals (manual + auto)
- Disputes created
- Admin resolutions
- Payouts processed
- Refunds issued

---

## 📊 METRICS TO TRACK

1. **Approval Rate** - % of bookings approved vs disputed
2. **Auto-Approval Rate** - % of bookings auto-approved (indicates client disengagement)
3. **Dispute Rate** - % of bookings disputed
4. **Dispute Resolution Time** - Average days to resolve
5. **Dispute Outcomes** - % full refund vs partial vs freelancer win
6. **Platform Commission** - Total commission earned
7. **Escrow Holdings** - Total $ currently in escrow

---

## 🚀 IMPLEMENTATION PHASES

### **Phase 4B-Escrow-1: Core Escrow (v1.0 Launch)**
- ✅ Payment capture to platform account
- ✅ Client approval button
- ✅ Auto-approval after 7 days
- ✅ Basic dispute form (no evidence uploads)
- ✅ Manual admin review (no UI dashboard)
- ✅ Payout processing

**Timeline:** 3-4 days

---

### **Phase 4B-Escrow-2: Enhanced Disputes (v1.1)**
- ✅ Evidence uploads (images, PDFs)
- ✅ Freelancer response form
- ✅ Admin dispute dashboard UI
- ✅ Partial refund calculations
- ✅ Dispute analytics

**Timeline:** 2-3 days

---

### **Phase 4B-Escrow-3: Advanced Features (v1.2)**
- ✅ Milestone payments (for large projects)
- ✅ Escrow release schedules
- ✅ Mediation/arbitration system
- ✅ User reputation based on disputes
- ✅ Automated fraud detection

**Timeline:** 5-7 days

---

## 📝 LEGAL CONSIDERATIONS

### **Terms of Service Must Include:**

1. **Escrow Policy**
   - Payment held until approval or 7-day auto-approval
   - Platform acts as payment facilitator, not merchant
   - Disputes resolved by platform at discretion

2. **Dispute Process**
   - Clear timelines (7 days approval, 3 days response, 5 days review)
   - Evidence requirements
   - Final decisions are binding
   - No guarantee of specific outcome

3. **Refund Policy**
   - Refunds only via dispute process
   - No direct refunds after booking accepted
   - Partial refunds at platform discretion
   - Processing time: 5-10 business days

4. **Commission Disclosure**
   - 10% platform fee clearly stated
   - Charged only on successful bookings
   - Deducted before freelancer payout

---

## 🎯 SUCCESS CRITERIA

### **Before Launch:**
- [ ] Escrow capture and hold working
- [ ] Client approval flow tested
- [ ] Auto-approval tested (7-day timer)
- [ ] Basic dispute form working
- [ ] Manual dispute resolution by admin
- [ ] Payout processing tested with test Stripe accounts

### **For v1.1:**
- [ ] Evidence uploads working
- [ ] Admin dashboard for disputes
- [ ] Partial refunds working
- [ ] <5% dispute rate
- [ ] <3 day average resolution time

---

**Last Updated:** November 10, 2025
**Status:** 📋 Specification Complete - Ready for Implementation
**Next Action:** Implement Phase 4B-Escrow-1 (Core Escrow) when ready
