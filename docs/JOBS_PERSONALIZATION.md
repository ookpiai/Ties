# Jobs Page - Personalized Recommendations

## Research Summary

### Industry Insights

**LinkedIn Job Recommendations** ([Source](https://pyimagesearch.com/2023/08/07/linkedin-jobs-recommendation-systems/))
- Skills-based matching using neural collaborative filtering
- Location and interaction history factored in
- Expertise and relevance prioritized over recency
- Content quality filtering (spam vs high-quality)

**Upwork Best Match Algorithm** ([Source](https://community.upwork.com/t5/Freelancers/Best-Matches-Job-Feed/m-p/1211125))
- Matches freelancer skills to job requirements
- Considers Job Success Score (JSS), completed projects
- Work history and matched skills weighted heavily
- Client preferences (experience level) factored in

**Fiverr Briefs Matching** ([Source](https://help.fiverr.com/hc/en-us/articles/4415608857745-Get-matched-with-sellers))
- Budget alignment between buyer and seller
- Order completion rate and response rate
- Skill/service matching to brief requirements
- Quality and historical satisfaction metrics

**Best Practices** ([Source](https://www.ijert.org/personalized-job-search-with-ai-a-recommendation-system-integrating-real-time-data-and-skill-based-matching))
- Hybrid approach: collaborative + content-based filtering
- Skill similarity scoring (related skills still match)
- Location proximity with distance calculation
- Experience level segmentation (Beginner, Intermediate, Expert)
- Real-time adaptability to changing user profiles

---

## Implementation Plan

### 1. Job Discovery Tabs

Replace single job list with tabbed discovery:

| Tab | Description | Audience |
|-----|-------------|----------|
| **For You** | Personalized based on role, skills, location, rate | Freelancers, Vendors, Venues |
| **Best Match** | Highest skill match to your profile | All non-Organisers |
| **Near You** | Jobs in your city/region | Users with location |
| **Recent** | Newest postings first | All users |
| **Urgent** | Application deadline within 7 days | All users |

### 2. Personalization Signals

| Signal | Weight | Description |
|--------|--------|-------------|
| **Role Match** | High (30%) | Freelancers see freelancer roles, Vendors see vendor roles |
| **Skill Match** | High (25%) | Job role matches user's specialty |
| **Location** | Medium (20%) | Same city/region boosted |
| **Budget Fit** | Medium (15%) | Job budget within ±30% of user's hourly rate |
| **Urgency** | Low (10%) | Jobs with closer deadlines shown higher |

### 3. Role-Based Auto-Filters

| User Role | Shows Jobs With | Rationale |
|-----------|-----------------|-----------|
| **Freelancer** | Freelancer roles | Looking for gigs in their specialty |
| **Vendor** | Vendor roles | Looking for vendor opportunities |
| **Venue** | Venue roles | Looking for events needing venues |
| **Organiser** | None (redirects to My Jobs) | Organisers post jobs, don't apply |

### 4. Specialty Matching Matrix

When user specialty is... match these job role titles:

| User Specialty | Matching Role Titles |
|----------------|---------------------|
| Photographer | photographer, photography, photo, visual |
| Videographer | videographer, video, cinematographer, film |
| DJ | dj, disc jockey, music, audio |
| Makeup Artist | makeup, mua, beauty, cosmetics |
| Event Planner | planner, coordinator, event manager |
| Caterer | catering, food, chef, cuisine |
| Florist | florist, floral, flowers, arrangements |

### 5. Recommendation Algorithm

```
Score = (
  RoleMatch × 0.30 +
  SkillMatch × 0.25 +
  LocationMatch × 0.20 +
  BudgetFit × 0.15 +
  UrgencyScore × 0.10
)

Where:
- RoleMatch: 1.0 if job has role matching user type, 0 otherwise
- SkillMatch: 1.0 if role title contains user's specialty keywords, 0.5 if related
- LocationMatch: 1.0 if same city, 0.5 if same region/country, 0 otherwise
- BudgetFit: 1.0 if job budget within ±30% of user rate, scales down with distance
- UrgencyScore: 1.0 if deadline < 3 days, 0.7 if < 7 days, 0.3 if < 14 days
```

---

## Database Requirements

### New Function: get_recommended_jobs()

```sql
CREATE OR REPLACE FUNCTION get_recommended_jobs(
  p_user_id UUID,
  p_user_role TEXT,
  p_user_specialty TEXT,
  p_user_city TEXT,
  p_user_hourly_rate DECIMAL,
  p_tab TEXT DEFAULT 'for_you',
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  location TEXT,
  event_type TEXT,
  start_date DATE,
  end_date DATE,
  application_deadline TIMESTAMPTZ,
  total_budget DECIMAL,
  status TEXT,
  organiser_id UUID,
  organiser_name TEXT,
  organiser_avatar TEXT,
  role_count INTEGER,
  application_count INTEGER,
  matching_role_count INTEGER,
  recommendation_score DECIMAL,
  recommendation_reason TEXT
)
```

---

## UI Changes

### Job Feed Layout

```
┌─────────────────────────────────────────────────────────┐
│  Jobs                                                    │
│  Find opportunities that match your skills               │
├─────────────────────────────────────────────────────────┤
│  [For You] [Best Match] [Near You] [Recent] [Urgent]    │
├─────────────────────────────────────────────────────────┤
│  🎯 Showing jobs for Photographers in Melbourne          │
│  ┌─────────────────────────────────────────────────────┐│
│  │ Based on your profile and activity on TIES Together ││
│  └─────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────┤
│  [Search] [Role Type ▼] [Location ▼] [Budget ▼]         │
├─────────────────────────────────────────────────────────┤
│  Job Cards with recommendation badges...                 │
└─────────────────────────────────────────────────────────┘
```

### Recommendation Badges on Job Cards

Show why each job is recommended:
- "🎯 Matches your skills"
- "📍 Near you in Melbourne"
- "💰 Good budget match"
- "⏰ Deadline in 3 days"
- "🔥 High demand (10+ applicants)"
- "✨ Just posted"

### Organiser Redirect

When an Organiser visits /jobs:
- Show message: "As an Organiser, you post jobs rather than apply"
- CTA buttons: "Post a Job" → /jobs/create, "My Job Postings" → /jobs/my-jobs

---

## Implementation Files

| File | Changes |
|------|---------|
| `src/api/jobs.ts` | Add `getRecommendedJobs()` function |
| `src/components/jobs/JobFeedPage.jsx` | Add tabs, personalization banner, badges |
| `supabase/migrations/` | Optional: Add `get_recommended_jobs` function |

---

## Bug Fixes (From Analysis)

1. **MyJobsPage Navigation Bug** (Line 302)
   - Current: `onClick={() => navigate('/jobs')}`
   - Fix: `onClick={() => navigate(`/jobs/${job.id}`)}`

2. **Missing Budget Filter UI**
   - Add budget range slider to JobFeedPage filters

---

## Success Metrics

- Increased job applications from discovery
- Higher application-to-hire conversion
- Reduced time to find relevant jobs
- More diverse job discovery (not just same types)
- Lower bounce rate on job feed page
