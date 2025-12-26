# TIES Together - Deployment Roadmap

> Systematic page-by-page implementation guide for production deployment

**Document Version:** 1.0
**Created:** December 26, 2025
**Status:** In Progress

---

## Table of Contents

1. [Home Page / Social Feed](#1-home-page--social-feed)
2. [Discovery Page](#2-discovery-page) *(Coming Soon)*
3. [Profile Page](#3-profile-page) *(Coming Soon)*
4. [Bookings System](#4-bookings-system) *(Coming Soon)*
5. [Jobs System](#5-jobs-system) *(Coming Soon)*
6. [Studio Workspace](#6-studio-workspace) *(Coming Soon)*
7. [Messaging](#7-messaging) *(Coming Soon)*
8. [Payments](#8-payments) *(Coming Soon)*

---

# 1. Home Page / Social Feed

## 1.1 The Vision

Transform the current dashboard from a static "personal stats" view into a **dynamic social feed** that shows users what's happening in the creative community around them.

**Current State:** Dashboard shows only the user's own bookings, messages, and stats.

**Target State:** A social media-style feed showing nearby activity:
- Portfolio updates from local creatives
- Events happening nearby
- Job postings in the area
- Bookings/gigs being completed
- New profiles joining the community
- Reviews and endorsements

---

## 1.2 Why Social Feeds Work (Research Summary)

### The Psychology Behind Engagement

Based on research from [Hootsuite](https://blog.hootsuite.com/linkedin-algorithm/), [Sprout Social](https://sproutsocial.com/insights/linkedin-algorithm/), and [PMC research](https://pmc.ncbi.nlm.nih.gov/articles/PMC11804976/), social feeds create engagement through:

| Mechanism | Description | TIES Application |
|-----------|-------------|------------------|
| **Variable Rewards** | Uncertainty about what content appears next creates dopamine-driven curiosity | Each scroll reveals different content types (portfolios, jobs, events) |
| **Social Proof** | Seeing others' activity validates platform value | "Sarah just completed a gig with Marcus" |
| **FOMO (Fear of Missing Out)** | Local activity creates urgency | "3 events happening this weekend near you" |
| **Parasocial Relationships** | Following creators builds pseudo-relationships | Following favorite local photographers/DJs |
| **Dwell Time Rewards** | Longer engagement = better content | Algorithm prioritizes content users interact with |

### Key Lessons from Platform Research

**From LinkedIn** ([Source](https://sproutsocial.com/insights/linkedin-algorithm/)):
- Content passes through a "Golden Hour" test - first 60 minutes determine reach
- Meaningful comments outweigh simple reactions
- Native content (no external links) gets priority
- Older content (2-3 weeks) can resurface if relevant

**From Behance/Dribbble** ([Source](https://www.thedesignerstoolbox.com/ux-portfolio/dribbble-vs-behance/)):
- Visual-first feeds with project snippets work for creatives
- Filter by "Most Appreciated," "Most Viewed," "Most Recent"
- Location-based filtering is essential for local discovery
- Portfolio storytelling drives engagement

**From Event Platforms** ([Source](https://clockwise.software/blog/how-to-build-local-event-app-like-eventbrite/)):
- "Who's Going" features create social momentum
- Friend activity in feeds increases event discovery
- Real-time activity streams show purchases/RSVPs
- Personalized recommendations based on behavior

**From Location-Based Apps** ([Source](https://www.bombaysoftwares.com/blog/how-to-build-a-location-based-social-discovery-app)):
- Proximity scoring: closer content ranks higher
- Three-factor ranking: Social Score + Relevance Score + Spatial Score
- Fallback to broader radius when local content is sparse

---

## 1.3 TIES Together Feed Architecture

### Feed Item Types

```
┌─────────────────────────────────────────────────────────────┐
│                    TIES SOCIAL FEED                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  📸 PORTFOLIO UPDATE                                         │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ [Avatar] Sarah Chen added 3 new photos              │    │
│  │ "Summer Wedding at Botanical Gardens"               │    │
│  │ [Image Preview Grid]                                │    │
│  │ 💬 12 comments  ❤️ 47 appreciations  📍 Melbourne  │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  🎉 EVENT POSTED                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ [Venue Avatar] Rooftop Bar is hosting               │    │
│  │ "Live Jazz Night - NYE Special"                     │    │
│  │ 📅 Dec 31, 2025  📍 2.3km away                      │    │
│  │ 👥 24 interested  🎵 Looking for: DJ, Vocalist      │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  💼 JOB OPPORTUNITY                                          │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ [Organiser Avatar] Creative Agency Co.              │    │
│  │ "Photographer needed for Brand Campaign"            │    │
│  │ 💰 $800-1200  📅 Jan 15  📍 Sydney CBD              │    │
│  │ 📝 8 applications  ⏰ Closes in 3 days              │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ✅ GIG COMPLETED                                            │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ [Both Avatars] Marcus completed a gig with Emma     │    │
│  │ "Corporate Event Photography"                       │    │
│  │ ⭐⭐⭐⭐⭐ "Absolutely professional!"                │    │
│  │ 📍 Brisbane                                         │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  👋 NEW MEMBER                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ [Avatar] Alex Rivera joined TIES Together           │    │
│  │ "DJ & Music Producer"                               │    │
│  │ 📍 5km away  🎵 House, Techno, Deep House           │    │
│  │ [Follow] [View Profile]                             │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Feed Ranking Algorithm

```
FeedScore = (RecencyScore × 0.25) +
            (ProximityScore × 0.30) +
            (RelevanceScore × 0.25) +
            (EngagementScore × 0.20)

Where:
- RecencyScore: Decays over time (1.0 for <1hr, 0.8 for <24hr, etc.)
- ProximityScore: Based on distance (1.0 for <5km, 0.7 for <20km, etc.)
- RelevanceScore: Based on user's role, interests, past interactions
- EngagementScore: Likes, comments, views on the content
```

### Database Schema for Feed

```sql
-- New table: feed_items
CREATE TABLE feed_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Content source
  item_type TEXT NOT NULL CHECK (item_type IN (
    'portfolio_update',
    'job_posted',
    'event_posted',
    'gig_completed',
    'review_posted',
    'profile_joined',
    'availability_opened'
  )),

  -- Who created this activity
  actor_id UUID NOT NULL REFERENCES profiles(id),

  -- Related entities (polymorphic)
  related_id UUID,
  related_type TEXT, -- 'portfolio_item', 'job_posting', 'booking', 'review'

  -- Location for proximity filtering
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  city TEXT,

  -- Content preview
  title TEXT NOT NULL,
  description TEXT,
  image_urls TEXT[], -- Array of preview images

  -- Engagement metrics
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,

  -- Visibility
  is_public BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ, -- For time-limited items like events

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Indexes for feed queries
  INDEX idx_feed_items_location (latitude, longitude),
  INDEX idx_feed_items_created (created_at DESC),
  INDEX idx_feed_items_type (item_type)
);

-- Feed interactions (likes, saves)
CREATE TABLE feed_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  feed_item_id UUID NOT NULL REFERENCES feed_items(id),
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('like', 'save', 'hide', 'report')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, feed_item_id, interaction_type)
);

-- Feed comments
CREATE TABLE feed_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feed_item_id UUID NOT NULL REFERENCES feed_items(id),
  user_id UUID NOT NULL REFERENCES profiles(id),
  parent_comment_id UUID REFERENCES feed_comments(id), -- For replies
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User follows (for personalized feed)
CREATE TABLE user_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES profiles(id),
  following_id UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK(follower_id != following_id)
);
```

---

## 1.4 Implementation Plan

### Phase 1: Database & API Foundation

**Tasks:**
- [ ] Create `feed_items` table with RLS policies
- [ ] Create `feed_interactions` table
- [ ] Create `feed_comments` table
- [ ] Create `user_follows` table
- [ ] Add triggers to auto-create feed items when:
  - Portfolio item added
  - Job posting created
  - Booking completed
  - Review submitted
  - Profile created
- [ ] Create `get_feed()` PostgreSQL function with proximity + relevance scoring
- [ ] Add API layer: `src/api/feed.ts`

### Phase 2: Feed UI Components

**Tasks:**
- [ ] Create `FeedItem.tsx` - Base feed item component
- [ ] Create `PortfolioFeedItem.tsx` - Portfolio update card
- [ ] Create `JobFeedItem.tsx` - Job posting card
- [ ] Create `EventFeedItem.tsx` - Event/gig card
- [ ] Create `CompletedGigFeedItem.tsx` - Completion celebration card
- [ ] Create `NewMemberFeedItem.tsx` - Welcome card
- [ ] Create `FeedComments.tsx` - Expandable comments section
- [ ] Create `FeedInteractions.tsx` - Like/save/share buttons

### Phase 3: Feed Page & Infinite Scroll

**Tasks:**
- [ ] Replace current Dashboard with new `SocialFeed.tsx`
- [ ] Implement infinite scroll with cursor-based pagination
- [ ] Add pull-to-refresh on mobile
- [ ] Add "New posts available" indicator
- [ ] Implement optimistic UI updates for interactions
- [ ] Add loading skeletons

### Phase 4: Location & Personalization

**Tasks:**
- [ ] Request user location on first visit
- [ ] Store user's default location in profile
- [ ] Implement radius selector (5km, 20km, 50km, Anywhere)
- [ ] Add "Following" vs "For You" feed tabs
- [ ] Track user interactions to improve relevance scoring
- [ ] Implement "Not Interested" to hide similar content

### Phase 5: Real-time Updates

**Tasks:**
- [ ] Subscribe to `feed_items` for real-time new posts
- [ ] Subscribe to `feed_interactions` for live like counts
- [ ] Subscribe to `feed_comments` for live comment updates
- [ ] Add subtle animation when new content arrives

---

## 1.5 API Specification

### GET /api/feed

```typescript
interface FeedRequest {
  cursor?: string;           // Pagination cursor
  limit?: number;            // Default: 20
  latitude?: number;         // User's location
  longitude?: number;
  radius_km?: number;        // Default: 50
  feed_type?: 'for_you' | 'following' | 'nearby';
  item_types?: FeedItemType[]; // Filter by type
}

interface FeedResponse {
  items: FeedItem[];
  next_cursor: string | null;
  has_more: boolean;
}

interface FeedItem {
  id: string;
  item_type: FeedItemType;
  actor: {
    id: string;
    display_name: string;
    avatar_url: string;
    role: string;
    verified: boolean;
  };
  title: string;
  description?: string;
  image_urls?: string[];
  location?: {
    city: string;
    distance_km?: number;
  };
  engagement: {
    view_count: number;
    like_count: number;
    comment_count: number;
    has_liked: boolean;
    has_saved: boolean;
  };
  related_data?: object; // Type-specific data
  created_at: string;
  expires_at?: string;
}
```

### POST /api/feed/:id/interact

```typescript
interface InteractionRequest {
  type: 'like' | 'unlike' | 'save' | 'unsave' | 'hide' | 'report';
}
```

### POST /api/feed/:id/comment

```typescript
interface CommentRequest {
  content: string;
  parent_comment_id?: string;
}
```

---

## 1.6 UI/UX Specifications

### Feed Layout

```
┌─────────────────────────────────────────────────────────────┐
│  HEADER                                                      │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ [Logo] TIES Together      [🔔] [✉️] [👤]            │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  FEED TABS                                                   │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ [For You] [Following] [Nearby ▼]                    │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  QUICK POST (Optional - for Pro users)                       │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ "Share an update..." [📷] [📅] [💼]                 │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  FEED ITEMS                                                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ [Feed Item 1]                                       │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ [Feed Item 2]                                       │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ [Feed Item 3]                                       │    │
│  └─────────────────────────────────────────────────────┘    │
│  ...                                                         │
│  [Loading spinner / Load more]                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Mobile Considerations

- Feed items should be swipeable (swipe right to like, left to save)
- Tap on any card navigates to detail view
- Long press opens action menu (share, report, etc.)
- Pull-to-refresh gesture
- Sticky header with tabs

### Accessibility

- All images have alt text
- Interactive elements have focus states
- Screen reader announcements for new content
- Reduced motion option for animations

---

## 1.7 Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Daily Active Users viewing feed | 60% of DAU | Analytics |
| Avg. time on feed | >3 minutes | Session tracking |
| Feed interactions per session | >5 | Interaction count |
| Follow rate | 20% follow at least 1 user | User follows table |
| Comment rate | 5% of feed views result in comment | Comment count |
| Scroll depth | 80% scroll past 5 items | Scroll tracking |

---

## 1.8 Migration Strategy

### Step 1: Parallel Deployment
- Keep existing Dashboard at `/dashboard`
- Deploy new Social Feed at `/feed`
- Add toggle in settings: "Use new home page"

### Step 2: A/B Testing
- 50% of users see new feed
- Track engagement metrics
- Gather feedback

### Step 3: Full Rollout
- Make feed the default `/dashboard`
- Move old dashboard to `/dashboard/classic` (temporary)
- Remove classic after 30 days

---

## 1.9 Technical Dependencies

### Required Before Implementation:
- [ ] User location storage in profiles (latitude, longitude)
- [ ] Mapbox/Geocoding working for location lookup
- [ ] Real-time subscriptions configured in Supabase
- [ ] Image optimization/CDN for feed images

### Third-Party Services:
- **Mapbox** - Distance calculations (already configured)
- **Supabase Realtime** - Live feed updates
- **Vercel Edge** - Feed caching (optional optimization)

---

## 1.10 Open Questions

1. **Content Moderation**: How do we handle inappropriate feed content?
   - *Proposed*: Report button → Admin queue → 24hr review SLA

2. **Spam Prevention**: How do we prevent feed spam?
   - *Proposed*: Rate limit posts (max 5/day for free, unlimited for Pro)

3. **Privacy**: Should users be able to opt-out of appearing in feed?
   - *Proposed*: Yes, add "Private mode" toggle in settings

4. **Empty Feed**: What do new users see with no local content?
   - *Proposed*: Show global trending content with "No local activity yet - be the first!"

---

## References

- [LinkedIn Algorithm 2025](https://blog.hootsuite.com/linkedin-algorithm/)
- [Social Media Algorithm Statistics](https://sqmagazine.co.uk/social-media-algorithm-impact-statistics/)
- [Location-Based App Development](https://www.bombaysoftwares.com/blog/how-to-build-a-location-based-social-discovery-app)
- [Event Discovery Apps 2025](https://clockwise.software/blog/how-to-build-local-event-app-like-eventbrite/)
- [Behance vs Dribbble](https://www.thedesignerstoolbox.com/ux-portfolio/dribbble-vs-behance/)
- [Feed Ranking Algorithms](https://javatechonline.com/feed-ranking-algorithms-in-system-design/)

---

*Next Section: [2. Discovery Page](#2-discovery-page) - Coming Soon*
