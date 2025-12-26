# Discover Talent - Personalized Recommendations

## Research Summary

### Industry Insights

**Fiverr's Approach** ([Source](https://help.fiverr.com/hc/en-us/articles/23429542870161-Understanding-Fiverr-s-search-and-recommendation-system))
- Uses NLP to match project descriptions to freelancers
- Personalizes based on language, urgency, past interactions
- Dynamic Matching (2024) combines AI + human expertise
- Factors: gig performance, reviews, seller activity

**LinkedIn's Talent Matching** ([Source](https://www.linkedin.com/blog/engineering/recommendations/ai-behind-linkedin-recruiter-search-and-recommendation-systems))
- Multi-pass ranking system with representation learning
- Activity embeddings (applies, saves, dismisses)
- Network embedding for semantic similarity between skills
- Continuous learning from user feedback

**Best Practices** ([Source](https://getstream.io/blog/best-practices-feed-personalization/))
- Hybrid approach: collaborative + content-based filtering
- Different strategies for new vs returning users
- "Most Popular" for new users, "Personalized" for returning
- Diversity in recommendations (don't show all same type)
- Context-aware personalization

---

## Implementation Plan

### 1. Discovery Feed Tabs

Replace single list with tabbed discovery:

| Tab | Description | Audience |
|-----|-------------|----------|
| **For You** | Personalized based on role, history, location | All users |
| **Top Rated** | Highest rated professionals | All users |
| **Recently Active** | Active in last 7 days | All users |
| **Near You** | Location-based (if available) | Users with location |
| **New Talent** | Joined in last 30 days | All users |

### 2. Personalization Signals

| Signal | Weight | Description |
|--------|--------|-------------|
| **Role Matching** | High | Organisers see Freelancers/Vendors; Freelancers see Organisers |
| **Complementary Skills** | Medium | Photographer sees MUAs, videographers, stylists |
| **Location Proximity** | Medium | Same city/region boosted |
| **Past Bookings** | High | Similar to people you've booked before |
| **Favorites** | Medium | Similar to profiles you've saved |
| **Activity Recency** | Low | Recently active users boosted |

### 3. Role-Based Auto-Filters

| User Role | Default Filter | Rationale |
|-----------|---------------|-----------|
| **Organiser** | Freelancers, Vendors, Venues | Looking to hire talent |
| **Freelancer** | Organisers, Freelancers | Find gigs + collaborators |
| **Vendor** | Organisers, Venues | Find events to work |
| **Venue** | Organisers | Find event bookings |

### 4. Complementary Skills Matrix

When user specialty is... show these complementary talents:

| User Specialty | Complementary Specialties |
|----------------|--------------------------|
| Photographer | Videographer, MUA, Stylist, Model |
| DJ | Sound Engineer, Lighting Tech, MC |
| Videographer | Photographer, Editor, Sound Engineer |
| Event Planner | Caterer, Florist, Decorator, Venue |
| Makeup Artist | Photographer, Stylist, Hair Stylist |
| Musician | Sound Engineer, Videographer, Photographer |

### 5. Recommendation Algorithm

```
Score = (
  RoleMatch × 0.30 +
  SkillRelevance × 0.25 +
  ProximityScore × 0.20 +
  RatingScore × 0.15 +
  ActivityScore × 0.10
)

Where:
- RoleMatch: 1.0 if complementary role, 0.5 if same role, 0.2 otherwise
- SkillRelevance: 1.0 if complementary skill, 0.7 if same category
- ProximityScore: 1.0 if same city, decay by distance
- RatingScore: average_rating / 5.0
- ActivityScore: 1.0 if active in 7 days, 0.5 if 30 days, 0.2 otherwise
```

---

## Database Requirements

### New Function: get_recommended_profiles()

```sql
CREATE OR REPLACE FUNCTION get_recommended_profiles(
  p_user_id UUID,
  p_user_role TEXT,
  p_user_specialty TEXT,
  p_user_city TEXT,
  p_latitude DECIMAL,
  p_longitude DECIMAL,
  p_tab TEXT DEFAULT 'for_you',
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  display_name TEXT,
  role TEXT,
  specialty TEXT,
  city TEXT,
  avatar_url TEXT,
  hourly_rate DECIMAL,
  average_rating DECIMAL,
  total_reviews INTEGER,
  last_active_at TIMESTAMPTZ,
  recommendation_score DECIMAL,
  recommendation_reason TEXT
)
```

### Complementary Skills Table (Optional)

```sql
CREATE TABLE IF NOT EXISTS complementary_skills (
  specialty TEXT PRIMARY KEY,
  related_specialties TEXT[] NOT NULL
);
```

---

## UI Changes

### Discovery Page Layout

```
┌─────────────────────────────────────────────────────┐
│  Discover Talent                                     │
│  Find the perfect creative professionals             │
├─────────────────────────────────────────────────────┤
│  [For You] [Top Rated] [Near You] [New] [All]       │
├─────────────────────────────────────────────────────┤
│  🎯 Recommended for you as an Organiser             │
│  ┌─────────────────────────────────────────────────┐│
│  │ Smart suggestions based on your profile         ││
│  │ and activity on TIES Together                   ││
│  └─────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────┤
│  [Search] [Role ▼] [Location ▼] [More Filters ▼]   │
├─────────────────────────────────────────────────────┤
│  Profile Cards...                                    │
└─────────────────────────────────────────────────────┘
```

### Recommendation Badges

Show why each profile is recommended:
- "🎯 Good match for your events"
- "📍 Near you in Melbourne"
- "⭐ Top rated photographer"
- "🔥 Recently active"
- "✨ New to TIES Together"

---

## Implementation Files

| File | Changes |
|------|---------|
| `src/api/profiles.ts` | Add `getRecommendedProfiles()` function |
| `src/components/discovery/DiscoveryPage.jsx` | Add tabs, recommendation badges |
| `supabase/migrations/` | Add `get_recommended_profiles` function |

---

## Success Metrics

- Increased profile views from discovery
- Higher booking conversion from discovery
- More diverse talent discovery (not just same roles)
- Reduced time to find relevant talent
