# TIES Together – Windsurf MVP Build Spec (v1)

**Maintainer:** Charlie White  
**Date:** August 4, 2025  
**Developer:** Windsurf

---

## 🔧 1. MVP Objectives

Build a functionally complete platform for booking, collaboration, and payments in the creative industry — including project coordination (TIES Studio), Pro subscription logic, escrow payments, and advanced user roles (e.g. vendors, multi-role).

---

## 👥 2. User Roles (All Enabled)

- Creative Freelancer
- Organiser/Client
- Vendor
- Venue
- Collective
- Multi-role Users *(can switch between roles within one account/dashboard)*

---

## 🚀 3. Core MVP Features (Now All Included)

| **Feature Area** | **MVP Scope** |
|-----------------------------|---------------|
| **Auth & Role System** | Firebase/Auth0 with role selection and secure switching between roles |
| **Profile/Portfolio Builder** | Upload services, media, location; advanced features like pinned projects and gallery |
| **Discovery Feed + Search** | Smart feed with filters, tags, boosted listings for Pro |
| **In-app Messaging** | Threaded conversations between users with notifications |
| **Booking + Jobs System** | Send/receive job requests, accept/decline, job board, active booking status |
| **Escrow Payments** | Stripe Connect-based system: hold payment until job marked as complete |
| **Pro Subscription Tier** | TIES Pro ($15/mo) and Studio Pro ($30/mo) with benefits (priority search, analytics, templates) |
| **Boosted Listings** | Users can pay $5 for higher visibility on feed |
| **Calendar Integrations** | Google Calendar sync for availability (basic) |
| **Ratings & Reviews** | Post-job review flow with star rating and testimonial |
| **Vendor & Venue Onboarding** | Listing builder for vendors and venues with availability, amenities, pricing |
| **Multi-Role Switching** | Users can act as freelancer, organiser, vendor, or venue within one account |
| **TIES Studio Tools** | Project-based workspace for task lists, budget tracking, file uploads, messaging |
| **File Uploads** | Versioned uploads in Studio or project profiles |
| **Budget Tracker** | Estimate vs actual spending, summary export |
| **Task Management** | Assign tasks, deadlines, timeline view, role-based visibility |
| **Client/Collaborator Views** | Organisers can invite freelancers, vendors, or stakeholders into shared view |

---

## 🧪 4. Feature Summary: TIES Studio (in MVP)

TIES Studio includes:
- Unlimited project workspaces
- Add collaborators, assign roles
- Task lists, shared calendars, budget dashboard
- File uploads with versioning
- In-Studio messaging
- Pre-built templates (basic versions for now)

---

## 💸 5. Pro Subscription Feature Breakdown

| **Plan** | **Price** | **Benefits** |
|------------------|-------------|--------------|
| **TIES Pro** | $15/month | - 8% commission instead of 10% <br> - Boosted listing priority <br> - Access to analytics dashboard <br> - Early job notifications <br> - Upload up to 5 featured projects <br> - Pin reviews and testimonials |
| **Studio Pro** | $30/month | - Unlimited Studio projects <br> - Budget + task templates <br> - File sharing and role-based access <br> - Client view dashboard |

---

## 💳 6. Escrow Payment Flow (Simplified for MVP)

1. Organiser books a freelancer and pays via Stripe
2. Funds are held in escrow by the platform
3. When the job is completed (confirmed by both parties), payment is released
4. Stripe Connect handles the payout to freelancer

---

## 🛡️ 7. Admin Tools

- Flag/report users or bookings
- Suspend or verify accounts
- Approve reviews
- View basic platform metrics

---

## 🌐 8. Deployment Readiness

- Runs locally at: http://localhost:5173
- Git-tracked file: windsurf-mvp-build-spec.md
- Ready for deployment on Vercel, Netlify, or Railway after testing

---

## 🔁 9. Suggested Dev Phases (Even with Full Scope)

> These phases help manage scope and prevent developer bottlenecking.

| **Phase** | **Components** |
|------------|----------------|
| **Phase 1** | Core login, user roles, profiles, search, basic bookings, messaging |
| **Phase 2** | Stripe Connect + Escrow, Boosted Listings, Pro Subscription logic |
| **Phase 3** | Studio Tools (task board, budget, file uploads), Calendar Integration |
| **Phase 4** | Ratings/Reviews, Multi-role UI, Vendor/Venue onboarding polish |

---

## ✅ Next Steps

- [x] Copy this file into the /docs or root of the repo
- [ ] Use checkboxes for internal tracking during development
- [ ] Sync GitHub Issues and Roadmap to this structure
- [ ] Review weekly for scope alignment
