Agent Mode Iteration 1
Purpose: Enable legitimate agents/managers to represent freelancers only and operate on their behalf within a universal, unified platform experience.

1. OVERVIEW

Agent Mode is a new user type that allows individuals to act as talent representatives for creative freelancers.

In Iteration 1, Agent Mode provides:

A standard universal profile

A lightweight verification system based on web presence + manual review

Ability to link freelancers (with freelancer approval)

“Apply on behalf of Talent” job applications

Inquiry routing (agent vs freelancer)

A simple Agent Dashboard

Zero permissions to edit freelancer accounts (future feature)

The goal is to support small-to-medium agents without increasing the platform’s UI complexity.

2. USER ROLES (Relevant)

All users share the universal UI:

Freelancer

Vendor

Venue

Client

Agent (new)

Agent Mode is selectable at signup or added later.

3. AGENT SIGNUP FLOW
3.1 Becoming an Agent

Option A – During Signup:
User selects: “Agent / Talent Manager”

Option B – Convert Later:
Existing users tap: “Become an Agent” → Verification required.

4. KEY FEATURES OF AGENT MODE (MVP)
4.1 Universal Agent Profile

Agents use the same profile format as freelancers.

Extra section appears once verified:

“Representing These Freelancers:”
Shows approved talent:

Profile photo

Name

Category

Status (Active / Pending / Removed)

Agents only represent FREELANCERS – not vendors, venues, or clients.

4.2 Agent Verification System (Website + Manual Review)

Verification is required to unlock agent features.

Why Verification Matters

Prevents fake agents

Protects creatives

Establishes professionalism

Encourages trust

Keeps platform ecosystem clean

All agent applications are reviewed manually by the internal team before approval.

4.2.1 Verification Requirements (Light + Safe)

Agents must provide:

Required

Full Name

Profile Photo

Primary Website URL (mandatory)

Should clearly relate to the agent/agency

Ideally shows roster, services, or representation activity

Contact Email + Phone

Short Agent Bio (50–200 chars)

Industry Tags (freelancers they manage)

Talent Representation Evidence (choose at least 1 – can be part of or in addition to the website):

Website page showing talent roster or examples of represented talent

Social media link showing talent posts / bookings / representation activity

Event flyer/image showing their talent

Screenshot of booking sheet/contract (redacted allowed)

No government ID required.
No sensitive documents are stored.

4.2.2 Verification Logic (Manual Review)

All agent applications are manually approved by the team. No automatic approvals.

Reviewer guidelines – Approve when:

Website clearly belongs to the agent/agency

Website and/or links show evidence of representing talent

Profile information is consistent and appears legitimate

Contact details are complete and reasonable

Flag for deeper internal review when:

Evidence is unclear or minimal

Website looks generic, templated, or unrelated to representation

Links or content feel inconsistent with stated role

Suspicious activity patterns are detected

Reject when:

Evidence indicates fake or misleading representation

No reasonable proof of representation is provided

Harmful or abusive behaviour patterns are associated with the account

The verification system is deliberately manual-first to maintain quality and trust in the agent ecosystem.

4.3 Linking Freelancers (Representation System)

Process

Agent sends a “Representation Request” to a freelancer.

Freelancer receives a notification:
“Would you like to approve [Agent Name] as your representative?”

Freelancer selects:

Approve

Decline

Confirmed talent appears in agent's “Representing” section.

Talent can remove an agent at ANY time.

4.4 Inquiry Routing

When talent is linked:

On the freelancer’s profile, the system shows:

Contact Freelancer

Contact Agent

Talent chooses a default option in their settings.

4.5 Apply on Behalf of Talent

Agents can submit a job application for a linked freelancer.

User Flow

Agent taps “Apply on Behalf Of Talent”

A dropdown shows ONLY their approved freelancers

Agent fills in the job proposal

A group chat opens:

Agent (primary communicator)

Client

Talent (cc’d, read-only or optional reply allowed)

This keeps all communication connected and transparent.

4.6 Agent Dashboard (Light MVP Version)

A simple tab in the universal dashboard with:

Sections

My Talent

Roster list

Approval statuses

Quick shortcuts to talent profiles

Inquiries

Inquiries sorted per talent

Message notifications

Bookings

Jobs involving their talent

Dates & status

Settings

Add/remove talent

Notification preferences

Default routing behaviour

Clean. Simple. Zero clutter.

4.7 Agent Search Visibility

Verified Agents appear in:

Search results

Map view

"Find an Agent" filter

Category filters (e.g., “Music Agents”)

Users can filter by:

Location

Industry

Number of freelancers represented

Response Time

5. UNIVERSAL PLATFORM BEHAVIOUR

Agent Mode adds functionality without altering the platform’s core design.

Universal UI remains:

Same navigation

Same marketplace

Same profile structure

Same map system

Same messaging

Agent Mode simply toggles extra features ON/OFF based on isAgentVerified.

6. TECH REQUIREMENTS
6.1 Backend

Role: isAgent = true

Verification flag: isAgentVerified = true/false

Store verification metadata (websites, evidence links, reviewer, timestamps, decision)

Talent linking table

Inquiry routing logic

Agent-job application workflow

6.2 Frontend

Verification form (with website + evidence fields)

Agent profile components

Representation request UI

Linking modal

Dashboard screens

Apply-on-behalf UI

Search filter toggle

6.3 Notifications

“You have a new representation request”

“Your agent verification is approved”

“Your agent verification was not approved”

“Your agent link has been activated”

“You were removed as an agent”

7. SECURITY & TRUST (MVP)

Agents cannot edit freelancer profiles

Agents cannot change freelancer rates

Agents cannot change availability

Agents cannot accept jobs without freelancer CC

Freelancers maintain full control

No sensitive ID data stored

Verification is based on public-facing web presence and manual review by the team