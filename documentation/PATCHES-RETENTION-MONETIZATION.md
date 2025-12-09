# TIES Together - Retention & Monetization Patches

## Overview
These patches are designed to prevent off-platform migration, drive subscription upgrades, and create a sticky platform experience that users don't want to leave.

---

## PATCH 1 — Stop Jobs From Leaving TIES (Prevent Off-Platform Migration)

### Why
The biggest threat to TIES is users connecting here, then completing jobs off platform to avoid commission and subscription fees. We must create tools that ONLY exist inside TIES.

### Tasks

#### 1.1 Build platform-locked job features:
- [ ] Auto-contract generation
- [ ] Milestone payments
- [ ] Deposit handling (escrow)
- [ ] Dispute protection
- [ ] Job completion badges
- [ ] Earnings badges
- [ ] Commission discounts
- [ ] Portfolio validation (based on completed TIES jobs)
- [ ] Automatic booking history

#### 1.2 Disable these features if a job is not created on TIES

### Reason
Leaving TIES = losing tools → keeps jobs inside the platform.

---

## PATCH 2 — Unlimited Job Applications, but Limit Active Jobs

### Why
Restricting proposals frustrates users and pushes them elsewhere. Restrict ACTIVE jobs instead — this drives upgrades without hurting usability.

### Tasks

#### 2.1 Unlimited job applications for all users
- [ ] Free, Lite, and Pro can apply to unlimited jobs

#### 2.2 Active job limits:
| Tier | Active Jobs Limit |
|------|-------------------|
| Free | 1 active job |
| Lite | 3 active jobs |
| Pro | Unlimited active jobs |

### Reason
Friction removed → upgrade path clear.

---

## PATCH 3 — Financial Tools for Everyone, Pro Gets Speed + Branding

### Why
Everyone needs basic financial tools. Pro should get time-saving and cash flow advantages.

### Tasks

#### 3.1 Give ALL users access to:
- [ ] Auto-contracts
- [ ] Deposit payments
- [ ] Auto-invoicing (basic)
- [ ] Milestones (tiered limits — see Patch 7)

#### 3.2 Payout speed by tier:
| Tier | Payout Speed |
|------|--------------|
| Free | ~5 business days |
| Lite | 2–3 business days |
| Pro | 1-day or same-day payout |

#### 3.3 Invoice branding = Pro only
- [ ] Custom logos
- [ ] Themes
- [ ] Brand colours

### Reason
Pro is faster + more polished → professionals upgrade.

---

## PATCH 4 — Make Studio "Sticky" by Allowing Full Power in Limited Quantity

### Why
Studio is the strongest retention tool. Let users experience full power → but limit how many projects they can run.

### Tasks

#### 4.1 Free Users:
- [ ] 1 active project
- [ ] Full power inside that 1 project
- [ ] No upload limits
- [ ] No storage limits

#### 4.2 Lite Users:
- [ ] Up to 3 active projects
- [ ] Full power in all projects
- [ ] Unlimited storage

#### 4.3 Pro Users:
- [ ] Unlimited projects
- [ ] Full power
- [ ] Enhanced organisation (folders, archive)
- [ ] Large file uploads
- [ ] Templates
- [ ] Optional AI features (future)

### Reason
When users outgrow one project → they upgrade.

---

## PATCH 5 — Pro Benefits for Venues & Vendors

### Why
Subscriptions cannot only appeal to freelancers. Venues & vendors also need value.

### Tasks

#### 5.1 Venue Pro Tools:
- [ ] Preferred Venue badge
- [ ] Priority on the map
- [ ] Calendar sync (Google/Apple)
- [ ] Instant quote templates

#### 5.2 Vendor Pro Tools:
- [ ] Trusted Supplier badge
- [ ] Bulk upload (Pro only)
- [ ] Priority ranking in vendor search

### Reason
Each user type now has a tailored upgrade path.

---

## PATCH 6 — Prevent Trial Drop-Off After 30 Days

### Why
People love the trial → lose everything → leave. We must make the downgrade painful but fair so they upgrade.

### Tasks

#### 6.1 Trial = full Pro access:
- [ ] Unlimited Studio
- [ ] Boosted visibility
- [ ] Large uploads
- [ ] Advanced filters
- [ ] 8% commission
- [ ] Full analytics
- [ ] Calendar sync
- [ ] Priority payouts

#### 6.2 After trial ends, downgrade:
- [ ] Active job limits apply
- [ ] Studio projects lock if over limit
- [ ] Commission returns to 10%
- [ ] Boosts turn off
- [ ] Analytics disabled
- [ ] Calendar sync disabled for Free
- [ ] Payout speed returns to tier rules

### Reason
Contrast → strong retention.

---

## PATCH 7 — Add Milestones (Tiered) + Multi-Part Escrow Support

### Milestones Explained
A job can be split into multiple payments (deposit, mid-job, final payment). This increases trust and safety for both clients and creatives.

### Milestone Limits:
| Tier | Milestone Limit |
|------|-----------------|
| Free | 2 milestones |
| Lite | 3 milestones |
| Pro | Unlimited milestones + templates |

### Tasks

#### 7.1 Build multi-part escrow system:
- [ ] Supports multiple stored payments
- [ ] Release on milestone approval
- [ ] Hold during disputes

#### 7.2 Milestone approval flow:
- [ ] Approve & release
- [ ] Request changes
- [ ] Open dispute

#### 7.3 Commission applies per milestone
(Prevents fee manipulation)

#### 7.4 Visual milestone progress timeline

#### 7.5 Job completion triggers only when all milestones are completed

### Reason
Milestones make TIES safer; tier limits drive upgrades.

---

## PATCH 8 — Make Free Tier Generous for First 30 Days (Growth Patch)

### Why
Early friction kills new platforms. Let users experience the platform at full power FIRST.

### Tasks

#### 8.1 New users start with Pro-level access for 30 days:
- [ ] Full Studio
- [ ] Boosts
- [ ] Filters
- [ ] Analytics
- [ ] Large uploads

#### 8.2 After 30 days → apply their actual tier (Free, Lite, Pro)

### Reason
People convert better when they've tasted full power.

---

## PATCH 9 — Rotating Visibility Boost System

### Why
If too many users have boost, boost becomes meaningless.

### Tasks

#### 9.1 Build a rotation system:
- [ ] Only X users shown at top at once
- [ ] Rotate every few hours
- [ ] Boost influenced by:
  - Pro status
  - Verified badge
  - Quality badge
  - Activity level
  - Profile completeness

#### 9.2 Ranking algorithm with tier + badge inputs

### Reason
Protects the exclusivity and value of Pro boosts.

---

## PATCH 10 — Personalised Upgrade Messaging (Critical for Conversion)

### Why
Freelancers, venues, and vendors upgrade for different reasons. Messaging must match their motivations.

### Tasks

#### 10.1 Build personalised upgrade screens:

**Freelancers focus on:**
- Visibility boosts
- Faster payouts
- Workflow tools

**Venues focus on:**
- Calendar tools
- Map ranking priority
- Quote templates

**Vendors focus on:**
- Trusted Supplier badge
- Bulk uploads
- Search ranking

### Reason
Personalised messaging = dramatically higher conversion.

---

## Implementation Priority

### Phase 1 - Critical (Retention)
1. Patch 1 - Platform-locked features
2. Patch 7 - Milestones & escrow
3. Patch 2 - Active job limits

### Phase 2 - Monetization
4. Patch 3 - Financial tools by tier
5. Patch 4 - Studio tier limits
6. Patch 6 - Trial system

### Phase 3 - Growth
7. Patch 8 - 30-day Pro trial for new users
8. Patch 5 - Venue & Vendor Pro tools
9. Patch 9 - Rotating boost system
10. Patch 10 - Personalised upgrade messaging

---

## Tier Summary Table

| Feature | Free | Lite | Pro |
|---------|------|------|-----|
| **Job Applications** | Unlimited | Unlimited | Unlimited |
| **Active Jobs** | 1 | 3 | Unlimited |
| **Studio Projects** | 1 (full power) | 3 (full power) | Unlimited |
| **Milestones** | 2 | 3 | Unlimited + templates |
| **Payout Speed** | 5 days | 2-3 days | Same-day |
| **Invoice Branding** | No | No | Yes |
| **Commission** | 10% | 10% | 8% |
| **Visibility Boost** | No | Limited | Priority rotation |
| **Analytics** | Basic | Standard | Full |
| **Calendar Sync** | No | Yes | Yes |
| **Large Uploads** | No | Yes | Yes |

---

## Database Schema Considerations

### New Tables Needed:
- `milestones` - Track milestone payments
- `escrow_transactions` - Hold/release funds
- `contracts` - Auto-generated contracts
- `disputes` - Dispute handling
- `subscription_tiers` - Tier configuration
- `user_trials` - Track trial periods
- `boost_rotation` - Visibility boost queue

### Profile Fields to Add:
- `subscription_tier` (free/lite/pro)
- `trial_started_at`
- `trial_ends_at`
- `active_jobs_count`
- `active_studio_projects_count`

---

*Document created: December 2024*
*Last updated: December 9, 2024*
