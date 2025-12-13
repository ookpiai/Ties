# Payment & Invoicing System Analysis

## Overview

This document outlines the current state of TIES' payment and invoicing system, compares it to Behance's implementation, and provides a roadmap for implementing in-chat proposals and payment requests.

---

## Behance's Payment Flow (Reference Implementation)

### How It Works

1. **Client Discovery** - Client finds freelancer via portfolio/services
2. **Inquiry** - Client sends project inquiry → starts chat in Behance inbox
3. **Discussion** - Freelancer & client discuss project details in chat
4. **Proposal Creation** - Freelancer creates formal PROPOSAL within the chat:
   - Description of work
   - Total price
   - Timeline/deadline
   - Upfront payment percentage (e.g., 50% before starting)
5. **Proposal Review** - Client reviews proposal card in chat
6. **Upfront Payment** - Client pays upfront amount via Stripe
7. **Work Begins** - Freelancer starts work after payment confirmed
8. **Completion** - Final payment captured on project completion
9. **Reviews** - Both parties leave reviews
10. **Invoices** - Downloadable from "Manage Freelance Projects"

### Key Features

| Feature | Description |
|---------|-------------|
| In-Chat Proposals | Formal quotes rendered as cards within conversation |
| Upfront Payments | Escrow-like system - partial payment before work |
| Stripe Connect | Express accounts for freelancer payouts |
| Auto-Invoicing | Stripe generates professional PDF invoices |
| Payment Status | Visual confirmation messages in chat |
| Reviews | Post-completion rating system |

### Sources
- [Behance FAQ: Freelance Project Inquiries](https://help.behance.net/hc/en-us/articles/11789181719963)
- [Behance Blog: Freelance Proposals](https://www.behance.net/blog/freelance-proposals-on-behance)
- [Behance FAQ: How Payments Work](https://help.behance.net/hc/en-us/articles/11787946245915)
- [Stripe Connect Documentation](https://stripe.com/connect)

---

## Current TIES Implementation

### What's Already Built

#### 1. Stripe Connect Integration
- **Location**: `/src/api/payments.ts`, `/supabase/functions/`
- **Status**: Complete
- Express accounts for freelancers/venues/vendors
- Onboarding UI component (`StripeConnectOnboarding.jsx`)
- Account status checking (charges_enabled, payouts_enabled)
- Platform fee: 10% commission

#### 2. Messaging System
- **Location**: `/src/api/messages.ts`, `/src/components/messages/`
- **Status**: Complete
- Real-time messaging via Supabase subscriptions
- Job context linking (messages can reference job_id)
- Conversation grouping by partner
- Read status tracking

#### 3. Invoice Generation
- **Location**: `/src/api/invoices.ts`
- **Status**: Complete
- Auto-generates on booking completion
- Stripe Invoicing integration for PDF generation
- Invoice number format: `INV-YYYYMM-NNNN`
- Amount breakdown: subtotal, platform_fee, freelancer_payout

#### 4. Payment Processing
- **Location**: `/src/api/payments.ts`, `/supabase/functions/`
- **Status**: Complete
- Payment intent creation (authorization)
- Payment capture on booking completion
- Checkout session creation
- Earnings dashboard for freelancers

#### 5. Service Packages
- **Location**: `/src/api/servicePackages.ts`
- **Status**: Complete
- Tiered pricing (Basic/Standard/Premium)
- Fixed package prices

### Database Schema (Existing)

```sql
-- Stripe accounts
stripe_accounts (
  id, user_id, stripe_account_id,
  charges_enabled, payouts_enabled,
  onboarding_completed, details_submitted
)

-- Payments
payments (
  id, booking_id, payer_id, payee_id,
  amount, platform_fee, stripe_payment_intent_id,
  stripe_transfer_id, status, captured_at
)

-- Invoices
invoices (
  id, booking_id, client_id, freelancer_id,
  invoice_number, subtotal, platform_fee, tax_amount,
  total_amount, freelancer_payout, status,
  stripe_invoice_id, stripe_invoice_url, stripe_pdf_url,
  due_date, paid_at
)

-- Messages (with job context)
messages (
  id, from_id, to_id, body,
  job_id, context_type, read, created_at
)
```

---

## Gap Analysis: What's Missing

### High Priority

| Feature | Description | Complexity |
|---------|-------------|------------|
| **In-Chat Proposals** | Send formal proposals within messaging | High |
| **Upfront Payments** | Collect % payment before work starts | High |
| **Payment Request in Chat** | Request payment directly in conversation | Medium |
| **Proposal Accept/Decline** | Actions on proposal cards | Medium |

### Medium Priority

| Feature | Description | Complexity |
|---------|-------------|------------|
| **Proposal Templates** | Reusable quote templates | Medium |
| **Milestone Payments** | Split payment into stages | High |
| **Payment Status in Chat** | Show "Payment Received" messages | Low |
| **Invoice Access in Chat** | View/download invoices from conversation | Low |

### Low Priority

| Feature | Description | Complexity |
|---------|-------------|------------|
| **Payment Reminders** | Auto-remind unpaid invoices | Low |
| **Recurring Proposals** | For ongoing work | Medium |
| **Multi-Currency** | Support beyond AUD | Medium |

---

## Implementation Plan

### Phase 1: Database Schema

```sql
-- New: Proposals table
CREATE TABLE proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID, -- Links to message thread
  message_id UUID REFERENCES messages(id), -- The message containing this proposal
  sender_id UUID REFERENCES profiles(id) NOT NULL,
  recipient_id UUID REFERENCES profiles(id) NOT NULL,

  -- Proposal details
  title VARCHAR(200) NOT NULL,
  description TEXT,
  scope_of_work TEXT,

  -- Pricing
  total_amount DECIMAL(10,2) NOT NULL,
  upfront_percent INTEGER DEFAULT 0, -- 0-100
  upfront_amount DECIMAL(10,2) GENERATED ALWAYS AS (total_amount * upfront_percent / 100) STORED,

  -- Timeline
  estimated_duration VARCHAR(100), -- "2 weeks", "1 month"
  deadline DATE,

  -- Status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
    'pending', 'accepted', 'declined', 'expired', 'completed', 'cancelled'
  )),

  -- Payment tracking
  upfront_payment_id UUID REFERENCES payments(id),
  upfront_paid_at TIMESTAMPTZ,
  final_payment_id UUID REFERENCES payments(id),
  final_paid_at TIMESTAMPTZ,

  -- Metadata
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMPTZ,
  declined_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Link to resulting booking
  booking_id UUID REFERENCES bookings(id)
);

-- New: Message types extension
ALTER TABLE messages ADD COLUMN IF NOT EXISTS message_type VARCHAR(20)
  DEFAULT 'text' CHECK (message_type IN (
    'text', 'proposal', 'payment_request', 'payment_received',
    'proposal_accepted', 'proposal_declined', 'invoice', 'system'
  ));

ALTER TABLE messages ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
-- metadata can contain: { proposal_id, payment_id, invoice_id, amount, etc. }

-- Indexes
CREATE INDEX idx_proposals_sender ON proposals(sender_id);
CREATE INDEX idx_proposals_recipient ON proposals(recipient_id);
CREATE INDEX idx_proposals_status ON proposals(status);
CREATE INDEX idx_messages_type ON messages(message_type);
```

### Phase 2: API Layer

```typescript
// /src/api/proposals.ts

interface CreateProposalInput {
  recipientId: string
  title: string
  description?: string
  scopeOfWork?: string
  totalAmount: number
  upfrontPercent?: number // 0-100
  estimatedDuration?: string
  deadline?: string
}

interface Proposal {
  id: string
  senderId: string
  recipientId: string
  title: string
  description: string
  totalAmount: number
  upfrontPercent: number
  upfrontAmount: number
  status: 'pending' | 'accepted' | 'declined' | 'expired' | 'completed'
  expiresAt: string
  createdAt: string
  // ... joined data
  sender: Profile
  recipient: Profile
}

// Functions to implement:
export async function createProposal(input: CreateProposalInput): Promise<Proposal>
export async function getProposal(proposalId: string): Promise<Proposal>
export async function getConversationProposals(otherUserId: string): Promise<Proposal[]>
export async function acceptProposal(proposalId: string): Promise<Proposal>
export async function declineProposal(proposalId: string, reason?: string): Promise<Proposal>
export async function cancelProposal(proposalId: string): Promise<void>
export async function payProposalUpfront(proposalId: string): Promise<PaymentResult>
export async function completeProposal(proposalId: string): Promise<Proposal>
```

### Phase 3: UI Components

```
/src/components/proposals/
├── CreateProposalModal.jsx      # Form to create new proposal
├── ProposalCard.jsx             # In-chat proposal display
├── ProposalActions.jsx          # Accept/Decline buttons
├── PaymentRequestCard.jsx       # Payment request in chat
├── PaymentReceivedCard.jsx      # Payment confirmation
├── ProposalTemplates.jsx        # Saved templates list
└── ProposalTemplateModal.jsx    # Create/edit template

/src/components/messages/
├── MessageBubble.jsx            # Extended to handle message_type
├── ProposalMessage.jsx          # Renders ProposalCard
├── PaymentMessage.jsx           # Renders payment status
└── SystemMessage.jsx            # Renders system notifications
```

### Phase 4: Message Rendering Logic

```jsx
// MessageBubble.jsx - Extended rendering
const MessageBubble = ({ message }) => {
  switch (message.message_type) {
    case 'text':
      return <TextMessage message={message} />

    case 'proposal':
      return <ProposalCard proposalId={message.metadata.proposal_id} />

    case 'payment_request':
      return <PaymentRequestCard
        amount={message.metadata.amount}
        proposalId={message.metadata.proposal_id}
      />

    case 'payment_received':
      return <PaymentReceivedCard
        amount={message.metadata.amount}
        paidAt={message.metadata.paid_at}
      />

    case 'proposal_accepted':
      return <SystemMessage
        icon={CheckCircle}
        text="Proposal accepted! Work can begin."
      />

    case 'invoice':
      return <InvoiceCard invoiceId={message.metadata.invoice_id} />

    default:
      return <TextMessage message={message} />
  }
}
```

### Phase 5: Payment Flow Updates

```
Current Flow:
  Booking Created → Accepted → Completed → Invoice → Payment

New Flow with Proposals:
  1. Freelancer creates proposal in chat
  2. Client accepts proposal
  3. If upfront_percent > 0:
     - Payment intent created for upfront amount
     - Client pays upfront
     - "Payment Received" message posted
  4. Booking auto-created from proposal
  5. Work period begins
  6. On completion:
     - Final payment captured (remaining amount)
     - Invoice generated
     - "Invoice Ready" message posted
```

---

## File Locations Summary

| Purpose | Location |
|---------|----------|
| Payments API | `/src/api/payments.ts` |
| Invoices API | `/src/api/invoices.ts` |
| Messages API | `/src/api/messages.ts` |
| Proposals API | `/src/api/proposals.ts` (NEW) |
| Payment Components | `/src/components/payments/` |
| Message Components | `/src/components/messages/` |
| Proposal Components | `/src/components/proposals/` (NEW) |
| Stripe Functions | `/supabase/functions/` |
| Payment Schema | `/supabase/migrations/20251124100003_payment_system.sql` |
| Proposals Schema | `/supabase/migrations/YYYYMMDD_proposals_system.sql` (NEW) |

---

## Next Steps

1. [ ] Create proposals database migration
2. [ ] Implement proposals API (`/src/api/proposals.ts`)
3. [ ] Build CreateProposalModal component
4. [ ] Build ProposalCard component for in-chat display
5. [ ] Extend MessageBubble to handle message types
6. [ ] Implement upfront payment flow
7. [ ] Add proposal templates feature
8. [ ] Test end-to-end proposal → payment → invoice flow

---

*Document Created: December 2024*
*Last Updated: December 2024*
