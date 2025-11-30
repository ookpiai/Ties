Booking System Iteration 1 MVP Specification (with Agent Mode Integrated)
1. Purpose
Create a unified, simple, and scalable booking engine for all TIES user types:
•	Client
•	Freelancer
•	Vendor
•	Venue
•	Agent (representing freelancers only)
The system must support end-to-end workflow:
Discovery → Request → Acceptance → Payment → Calendar → Completion → Review

2. User Roles
All use the same universal UI with role-specific capabilities.
Clients
Create booking requests and pay for services.
Freelancers / Vendors / Venues
Receive booking requests, accept/decline, complete jobs.
Agents
Represent freelancers.
Can manage bookings on behalf of approved freelancers, including:
•	Receiving routed booking requests
•	Accepting/declining on their behalf
•	Applying for jobs on behalf of linked freelancers
Agents cannot modify freelancer profile, prices, or availability.

3. Core Concepts
Booking
A structured job agreement between a client and a provider (freelancer/vendor/venue).
May involve an agent if the freelancer uses one.
Calendar Block
A time allocation representing availability or a confirmed booking.
Pricing
Hourly, day-rate, or fixed fee.
Status
Lifecycle state of a booking.
Representation
Link between agent ↔ freelancer (approved by freelancer).

4. Booking Lifecycle
A strict state machine:
1.	PENDING
o	Request submitted
o	Routed to freelancer, their agent, or both (freelancer chooses)
2.	CONFIRMED
o	Accepted by freelancer OR agent
o	Calendar blocks created
3.	PAID (optional in v1 depending on Stripe mode)
o	Payment intent completed
4.	IN_PROGRESS
o	Active during event time window
5.	COMPLETED
o	Job finished
o	Triggers invoice finalisation (future) + review prompt
6.	CANCELLED
o	Either party cancels before job
o	Calendar blocks released
7.	DECLINED
o	Provider rejects request
Notes:
•	When an agent accepts a booking, freelancer receives a CC notification.
•	Providers always retain the right to cancel.

5. Data Models
5.1 bookings
Field	Type	Notes
id	uuid	PK
created_at	timestamptz	
updated_at	timestamptz	
client_id	uuid	requester
provider_id	uuid	freelancer/vendor/venue
agent_id	uuid (nullable)	only if agent handled the booking
role_type	ENUM	FREELANCER / VENDOR / VENUE
start_time	timestamptz	
end_time	timestamptz	
duration_minutes	int	
location_text	text	
service_type	text or ENUM	
notes	text	
status	ENUM	PENDING / CONFIRMED / PAID / COMPLETED / CANCELLED / DECLINED
price_amount	numeric	
currency	text	AUD default
pricing_type	ENUM	HOURLY / DAY_RATE / FIXED
payment_intent_id	text	Stripe
invoice_id	uuid (future)	

5.2 calendar_blocks
Field	Type	Notes
id	uuid	PK
owner_id	uuid	freelancer/vendor/venue
booking_id	uuid (nullable)	
block_type	ENUM	AVAILABILITY / BOOKED / HOLD / BLOCKED_OUT
start_time	timestamptz	
end_time	timestamptz	
notes	text	
created_at	timestamptz	
Agent visibility:
Agents see calendar blocks for their linked freelancers, but cannot edit them.

5.3 freelancer_agent_links
Field	Type	Notes
id	uuid	PK
agent_id	uuid	
freelancer_id	uuid	
status	ENUM	PENDING / APPROVED / REMOVED
created_at	timestamptz	
Controls representation approval and routing logic.

6. Booking Flows
6.1 Client → Provider Booking Request
1.	Client selects date + time
2.	Duration auto-calculated or manually set
3.	Price preview displayed
4.	Inputs notes + location
5.	Sends request → booking created as PENDING
Routing Logic:
Freelancer chooses one of:
•	Route to me
•	Route to my agent
•	Route to both
Vendors and venues do not use agent routing.

6.2 Provider Response Flow
Receives booking and may:
•	Accept → CONFIRMED
o	Calendar block created
o	Payment intent generated
•	Decline → DECLINED
•	Cancel (if post-confirmation) → CANCELLED
If accepted by agent, freelancer is CC’ed.
6.3 Payment Flow
Triggered after booking acceptance.
1.	Payment intent created via Stripe
2.	Client pays
3.	Booking set to PAID
4.	Provider (and agent if applicable) notified
Escrow, revenue split, and agent commission are future expansions.

6.4 Apply on Behalf (Agent Only)
If agent represents a freelancer:
1.	Agent selects “Apply on behalf”
2.	Selects one of their approved freelancers
3.	Fills booking request
4.	Booking created with:
o	agent_id populated
o	CC to freelancer
o	Standard request flow begins

6.5 Completion Flow
On job end:
•	Provider (or agent) marks job complete
•	Booking moves to COMPLETED
•	Triggers:
o	Review prompt
o	Invoice finalisation (future)
o	Calendar update

7. Calendar System (Hour-Based)
A unified hourly calendar supporting:
•	Day view
•	Week view
•	Time blocks with color coding
•	Price shown inside booking block
•	Click → opens BookingDetailsModal
Block Types
•	AVAILABILITY – set by freelancer/vendor/venue
•	HOLD – pending request
•	BOOKED – confirmed
•	BLOCKED_OUT – unavailable
Agent Calendar Access
Agents see calendar entries of talent they represent in list/agenda view.
No editing permission.

8. UI Components (Required Iteration 1)
BookingsPage.jsx
•	Lists all bookings (filters: Pending, Upcoming, Past, Completed)
BookingCard.jsx
•	Summary view
•	Shows accept/decline for providers
•	Shows price, date, time, user info
BookingRequestModal.jsx
•	Date/time selection
•	Price display
•	Notes field
BookingDetailsModal.jsx
•	Full booking data
•	Buttons: Accept / Decline / Pay / Cancel
•	If agent involved: “Managed by Agent”
AvailabilityCalendar.jsx
•	Hour-by-hour grid
•	Pulls from bookings and calendar_blocks
Agent Dashboard Elements
•	My Talent (roster)
•	Inquiries (routed booking requests)
•	Bookings (list view)
•	Representation management

9. API Specification
Bookings
•	POST /bookings/create
•	POST /bookings/respond (accept/decline)
•	POST /bookings/cancel
•	POST /bookings/complete
•	GET /bookings/list?userId=...
Agents
•	POST /agents/send-request
•	POST /agents/respond
•	GET /agents/my-talent
•	POST /agents/apply-on-behalf
Calendar
•	GET /calendar/blocks
•	POST /calendar/set-availability
Payments
•	POST /payments/create-intent
•	POST /payments/verify
All booking endpoints accept agent_id where relevant.
10. Automation Rules
On booking acceptance
•	Create calendar_block
•	Generate payment intent
•	Notify all relevant parties
On booking cancellation
•	Release calendar blocks
•	Payment refund logic (future)
On booking completion
•	Mark COMPLETED
•	Trigger review flow
•	Prepare invoice (future release)
On agent acceptance
•	Freelancer receives CC notification
On apply-on-behalf
•	Booking flagged with agent_id
•	Client sees “Applied on behalf of [freelancer]”

11. Permissions Summary
Action	Client	Provider	Agent
Create booking request	✔	✖	✔ (on behalf)
Accept/decline	✖	✔	✔ (for freelancer they represent)
Change pricing	✖	✔	✖
Change availability	✖	✔	✖
Calendar view	Own bookings	Own bookings	Talent only
Payment handling	Pay only	Receive only	View status only
Representation links	✖	Remove agent	Manage own roster

12. MVP Scope
Included
•	Full booking lifecycle
•	Hourly calendar
•	Payment intent integration
•	Agent-linked booking flows
•	Representation system
•	Agent dashboard (light version)
•	Routing logic for agents
•	All required UI modals + booking cards
Excluded (Later)
•	Automatic invoicing engine
•	Agent commissions
•	Negotiation/counter-offers
•	Travel time logic
•	Multi-resource bundling
•	Advanced analytics

