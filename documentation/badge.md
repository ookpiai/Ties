Iteration 1 Badge System
🎖️ TIES Together Badge Rules & Rewards 
A universal, fair, and transparent badge system that shows who you are and what you’ve achieved.
Badges on TIES Together are designed to motivate great work, reward genuine activity, and provide users with clear pathways to succeed. Every badge is automatically granted by the system once its requirements are met. No manual approval, no gatekeeping just clean, fair achievement.
You can earn all 6 badges, and choose up to 5 active badges to display publicly on your profile.

🔐 1. Verified Badge
Purpose: Trust, safety, authenticity
Requirements:
•	Verified ID (driver’s licence, passport, or government ID)
•	Verified email + phone number
•	Fully completed profile
Rewards:
•	30-day Search Boost on the Discover page
•	Included in the “Trusted Users” filter
•	TIES Verified label on profile & bookings
📸 2. Portfolio Badge
Purpose: Showcase professionalism & capability
Requirements:
•	Upload 5 or more portfolio items
Rewards:
•	Access to premium portfolio layouts
•	Eligible for Featured User Highlight (glowing outline)
•	Priority placement in Discover → Featured Work when available

⚡ 3. Activity Badge
(formerly “Fast Responder” but now adjusted for realism)
Purpose: Encourage platform engagement
Requirements:
•	Log in & remain active for 30 days (system resets if inactive)
Rewards:
•	48-hour visibility boost on Discover
•	Access to limited-time engagement challenges
•	Highlighted Activity tag on profile

✅ 4. Completion Badge
Purpose: Encourage reliable delivery & job momentum
Requirements:
•	Complete 5 jobs on the platform (no disputes required)
Rewards:
•	0% commission on the next job after milestone
•	Shown in “High Reliability” filter on Discover
•	Special Completion badge animation in profile

🌟 5. Quality Badge
Purpose: Reward great service & collaboration
Requirements:
•	Maintain a 4.5★ average rating across 5+ reviews
•	Reviews must include at least 1 “Collaboration” compliment
Rewards:
•	Eligible for Featured User Glow Outline
•	1 free Boosted Listing per month
•	Profile receives a quality highlight tag

💰 6. Earnings Badge
Purpose: Recognise meaningful platform success
Requirements:
•	Earn $1,000 AUD on the platform
Rewards:
•	$20 off next transaction fee (one-time reward)
•	Special milestone notification shared to followers
•	Included in “Proven Earners” filter on Discover

💎 TIES Pro Badge (subscription-based)
Purpose: Premium benefits & elevated visibility
Requirements:
•	Active TIES Pro subscription
Rewards:
•	Gold glowing outline on Discover
•	Priority placement in search
•	Access to Pro-only filters
•	Ability to pay for Featured status
•	Extra portfolio layouts
•	Lower commissions (already included in plan)

📘 Rules for Earning & Maintaining Badges
1. Automation
All badges are system-triggered. No manual review by the team.
2. Visibility
Users can display up to 5 active badges.
All earned badges appear in a dedicated Badge Library, including greyed-out badges not yet unlocked.
3. Badge Progress Tracking
Each badge has a real-time progress bar so users can see exactly how close they are.
4. Badge Expiry
Only the Activity Badge can reset (after 30 days of inactivity).
All others remain permanently earned once achieved.
5. Featured User Eligibility
A user may gain a glowing highlight outline on the Discover page if they:
•	Subscribe to TIES Pro, or
•	Hold the Portfolio AND Quality badges simultaneously
This status is dynamic it activates or deactivates based on the user's current badge state.
6. Notification System
Users receive in-app notifications when:
•	A badge is unlocked
•	A reward is activated
•	A visibility boost goes live
•	A badge is close to being unlocked

🎯 What This Badge System Represents
TIES Together’s six-badge framework captures the full journey of a creative professional:
1.	Trust (Verified)
2.	Professionalism (Portfolio)
3.	Commitment (Activity)
4.	Reliability (Completion)
5.	Quality (Ratings)
6.	Success (Earnings)
Together, they form the foundation of platform credibility AND user identity.














Dev Requirements Section
1. Overall Goal
Implement a universal badge system for TIES Together MVP where:
•	All badges are system-triggered, no manual approvals.
•	All badges are available to all user types (freelancers, venues, vendors, collectives, clients).
•	Users can earn multiple badges but display up to 5 at a time on their profile.
•	Badges connect directly to how to succeed on TIES Together (rules page + product behaviour).
Core value dimensions we’re covering:
1.	Verification
2.	Activity
3.	Portfolio
4.	Completion
5.	Quality
6.	Earnings
•	Subscription (TIES Pro “status badge”)

2. Data & Events (Backend Foundations)
Oscar should make sure the following data/events exist or can be derived:
Per user (across all roles):
•	identity_verified (boolean + timestamp)
•	contact_verified (email + phone verified booleans + timestamps)
•	profile_completion_status (boolean for “meets minimum completeness”)
•	portfolio_items_count
•	jobs_completed_count
•	jobs_completed_last_30_days
•	jobs_with_disputes_count
•	jobs_late_count (if late > X threshold, treat as “late”)
•	average_rating (from reviews)
•	review_count
•	total_earnings (lifetime earnings via TIES)
•	ties_pro_active (boolean + start/end date)
•	badge_status list (badge_id, earned_at, active/inactive)
Events we can hook triggers to:
•	on_identity_verification_success
•	on_contact_verification_success
•	on_profile_updated
•	on_portfolio_item_added
•	on_job_completed
•	on_review_submitted
•	on_payment_released (for earnings)
•	on_subscription_status_changed (TIES Pro)
Badge logic can run either:
•	Immediately on these events, and/or
•	In a daily cron job that recalculates all badges.

3. Badges: Definitions, Triggers, Rewards
3.1 Core Badge 1 – ⭐ Verified Profile
Purpose: Trust, safety, professionalism.
Trigger (all must be true):
•	identity_verified == true
•	contact_verified.email == true
•	contact_verified.phone == true
•	profile_completion_status == true
o	Minimum: photo/logo, description/bio, relevant core fields per role (skills OR services OR venue basics).
Reward (platform capabilities):
•	Search/Discover boost:
o	In Discover results, apply a mild ranking boost for users with this badge.
•	Filter option:
o	Add a “Verified Profiles” filter chip on Discover.
•	Visual treatment:
o	Show a small ⭐ “Verified” badge on profile cards and full profile.

3.2 Core Badge 2 – 🔁 Consistent Activity (30-Day Cycle)
Purpose: Show who is currently active and earning.
Trigger:
•	jobs_completed_last_30_days >= 1
Deactivation:
•	If no completed jobs for 30 days, badge becomes inactive until a new job is completed.
•	The “30-day window” restarts every time they fail to meet it (as you requested).
Reward:
•	“Active this month” tag on discovery cards/profile.
•	Slight ranking boost in Discover while badge is active.
•	Can be used as a filter: “Active Creators (last 30 days)”.

3.3 Core Badge 3 – 🎨 Portfolio Builder
Purpose: Reward users who actually showcase work.
Trigger:
•	portfolio_items_count >= 5
Reward:
•	Eligible for “Featured Work” surface on Discover (once implemented):
o	The system can choose from users with this badge when populating “Featured Work”.
•	Visual:
o	Small 🎨 badge on profile.
o	Portfolio section on profile can have a subtle highlight bar/icon (“Portfolio Ready”).

3.4 Core Badge 4 – ✅ Reliable Finisher
Purpose: Completion and reliability.
Trigger:
•	jobs_completed_count >= 5
•	AND jobs_with_disputes_count == 0 (or below a simple small threshold)
•	AND jobs_late_count within acceptable limit (you can define e.g. ≤1 in the last 5, or just “no late flags” for MVP).
Reward:
•	Add a “Reliable” filter option on Discover.
•	Slight ranking boost when the user searches with filters like “Reliability” / “On-time delivery”.
•	Visual badge (✅ icon) on profile cards, and mention in tooltip: “Completed 5+ jobs with no disputes”.

3.5 Core Badge 5 – 🌟 Quality Rated
Purpose: Quality of work & collaboration.
Trigger:
•	review_count >= 5
•	average_rating >= 4.5
(You can tweak numbers easily, but keep it simple.)
Reward:
•	Eligible to appear in a “Top Rated” filter or strip on Discover.
•	Visual: 🌟 badge next to star rating on profiles and cards.
•	Mild ranking boost when results are sorted or filtered by rating/quality.

3.6 Core Badge 6 – 💰 Earnings Milestone
Purpose: Show users who are gaining traction financially.
Trigger (from your note “6. earn $1000 on the platform”):
•	total_earnings >= 1000 (in platform currency)
Reward:
•	Visual 💰 badge indicating “Earned $1,000 on TIES Together”.
•	Optional financial perk we can actually support now:
o	One-time checkout discount on platform commission or a small fee reduction on the next job (e.g. X% less platform fee for next booking).
o	This is applied via existing checkout/payment logic (you said this is feasible).

3.7 Subscription Badge – 💎 TIES Pro
Purpose: Paid status + extra trust.
Trigger:
•	ties_pro_active == true
Reward (on top of Pro plan features):
•	Gold outline glow on the user’s card in Discover (as you requested).
•	Show a 💎 TIES Pro badge in profile + discovery card.
•	Include Pro users in a “Featured Creators” strip by default if you wish.
Implementation note:
Treat this like a badge in the UI and badge portfolio, but it’s driven purely off subscription status, not achievements.

4. Badge Display Logic (Frontend Behaviour)
4.1 Profile Page
•	Add a “Badges” section on each profile.
o	Shows:
	Active badges (full colour).
	Locked badges (greyed out with short “how to unlock” text).
•	Allow users to choose up to 5 badges to “pin” as their display set.
o	If they have more than 5 active, they can reorder/select which are shown.
•	TIES Pro badge:
o	Decide whether:
	It always displays when active, or
	It counts as one of the 5 selectable badges.
o	Make this a simple config toggle.
4.2 Discover / Search Cards
Each user card should:
•	Show up to 3 key badges (to avoid clutter), prioritising:
1.	TIES Pro (if active)
2.	Verified Profile
3.	Quality / Reliable / Active / Earnings etc. based on a priority order.
•	Implement visual treatments:
o	Gold glow outline for TIES Pro.
o	Subtle iconography for Verified, Reliable, etc.
o	Hover tooltip explaining each badge.
4.3 Filters & Sorting
On the Discover screen, add filters/sorting that directly tie to badges:
•	Filters:
o	“Verified Profiles”
o	“Active in Last 30 Days”
o	“Reliable Finishers”
o	“Top Rated”
•	Sorting options (if present):
o	“Highest Rated”
o	“Most Active”
o	(Under the hood, badges can bias ranking.)

5. Rewards Implementation (What the System Actually Does)
Only include rewards that TIES Together can logically support right now:
1.	Ranking / Search Boosts
o	Implement via a simple ranking score:
	For example: base score + badge weights (Verified, Active, Quality, etc.).
o	Do not overcomplicate; basic weighting is enough for MVP.
2.	Visual & UI Rewards
o	Gold glow for Pro.
o	Coloured outline + badge icons on cards.
o	“Featured” label if we flag them in a featured list.
3.	Filters & Categories
o	Chips for “Verified”, “Active this month”, “Top rated”, “Reliable”.
o	These filters query users who have the corresponding badge active.
4.	Financial Rewards
o	For the Earnings Milestone badge:
	One-time discount: store a one-use coupon / fee reduction flag for that user.
	Consume it at checkout and mark it as used.
5.	Notifications
o	Every time a badge is earned, send a notification:
	E.g. “You’ve just unlocked the ⭐ Verified Profile badge! Here’s what it means…”
o	Store these in the existing notifications system.

6. Badge Rules Page (Frontend Content & Logic)
Create a “Badge Rules & How to Succeed” page with:
1.	Intro Section
o	Short explanation of:
	Why badges exist (trust, reliability, quality, success).
	That they are automatically awarded based on platform activity.
	You can display up to 5 badges at a time as your “badge portfolio”.
2.	Per-Badge Breakdown
o	For each badge (Verified, Consistent Activity, Portfolio Builder, Reliable Finisher, Quality Rated, Earnings Milestone, TIES Pro):
	Name + icon.
	What it means (plain language).
	Requirements (“To unlock this, you must…”).
	Rewards (visibility, filters, discounts, visual glow, etc.).
3.	“How to Succeed on TIES Together” Section
o	Simple bullet steps that map to badges:
	Verify your profile → get ⭐ Verified.
	Complete at least one job each month → keep 🔁 Consistent Activity.
	Upload 5+ strong projects → earn 🎨 Portfolio Builder.
	Deliver on time & dispute-free → unlock ✅ Reliable Finisher.
	Aim for 4.5★+ ratings → unlock 🌟 Quality Rated.
	Hit $1,000 earnings → unlock 💰 Earnings Milestone.
	Upgrade to Pro → gain 💎 Pro status + gold glow.
4.	Linking
o	Add a link to this page:
	From profile badge section (“View all badge rules”).
	From notifications when a badge is earned (“Learn more about this badge”).

7. Admin & Config
•	Create an admin-configurable badge definition file/table with:
o	badge_id
o	name
o	description
o	icon
o	requirements (stored as simple config values, not code logic text)
o	active (boolean)
•	Ensure there is a way for you and Oscar to:
o	Temporarily disable a badge.
o	Adjust thresholds (e.g. change 5 jobs → 3 jobs).
•	Logging:
o	Log when a badge is earned or removed (user_id, badge_id, timestamp, reason).

