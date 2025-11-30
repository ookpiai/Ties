/**
 * Help Content Configuration
 *
 * Centralized help text for all features in TIES Together.
 * This makes it easy to maintain and update help content.
 *
 * Structure:
 * - section: Major area of the app
 * - feature: Specific feature within that section
 * - Each feature has: title, description, and optional learnMoreUrl
 */

export const helpContent = {
  // ==========================================
  // DASHBOARD
  // ==========================================
  dashboard: {
    overview: {
      title: 'Your Dashboard',
      description: 'Your central hub for managing bookings, messages, and activity. Quick stats show your performance at a glance.',
    },
    quickStats: {
      title: 'Quick Stats',
      description: 'Real-time overview of your bookings, earnings, and profile views. Updates automatically as activity occurs.',
    },
    recentActivity: {
      title: 'Recent Activity',
      description: 'See your latest bookings, messages, and job applications. Click any item to view full details.',
    },
    upcomingBookings: {
      title: 'Upcoming Bookings',
      description: 'Your confirmed bookings for the next 30 days. Yellow indicates pending confirmation.',
    },
  },

  // ==========================================
  // PROFILE
  // ==========================================
  profile: {
    headline: {
      title: 'Profile Headline',
      description: 'A short, catchy title that appears under your name. Keep it under 100 characters. Example: "Award-winning DJ specializing in house & techno"',
    },
    tagline: {
      title: 'Tagline',
      description: 'A brief description of what you do. This appears in search results and helps clients understand your services quickly.',
    },
    hourlyRate: {
      title: 'Hourly Rate',
      description: 'Your base hourly rate. Clients see this as a starting point. You can customize pricing per booking or create packages for fixed-price options.',
    },
    dailyRate: {
      title: 'Daily Rate',
      description: 'Your rate for full-day bookings (typically 8+ hours). Usually offered at a discount compared to hourly rates.',
    },
    availability: {
      title: 'Availability Calendar',
      description: 'Block out dates when you\'re unavailable. Green dates are open for bookings. Clients can only request available dates.',
    },
    publicBooking: {
      title: 'Public Booking Page',
      description: 'When enabled, clients can book you directly from your public profile. Your booking page URL can be shared on social media or your website.',
    },
    portfolio: {
      title: 'Portfolio',
      description: 'Showcase your best work with photos, videos, and audio samples. A strong portfolio helps you stand out and win more bookings.',
    },
    packages: {
      title: 'Service Packages',
      description: 'Create fixed-price packages for your most popular services. Packages help clients understand exactly what they\'re getting and simplify the booking process.',
    },
    skills: {
      title: 'Skills & Expertise',
      description: 'List your professional skills with proficiency levels. Endorsed skills appear higher in search results.',
    },
    badges: {
      title: 'Verification Badges',
      description: 'Badges show clients you\'re verified and trustworthy. Complete verifications to earn badges and boost your profile visibility.',
    },
    profileStrength: {
      title: 'Profile Strength',
      description: 'A complete profile gets up to 5x more views. Add a photo, portfolio items, and complete all sections to reach 100%.',
    },
    languages: {
      title: 'Languages',
      description: 'List the languages you speak. This helps international clients find professionals who speak their language.',
    },
    socialLinks: {
      title: 'Social Links',
      description: 'Connect your social media profiles to showcase your online presence and give clients more ways to discover your work.',
    },
  },

  // ==========================================
  // BOOKINGS
  // ==========================================
  bookings: {
    status: {
      pending: {
        title: 'Pending Booking',
        description: 'This booking is waiting for your response. Accept or decline within 48 hours to maintain a good response rate.',
      },
      confirmed: {
        title: 'Confirmed Booking',
        description: 'This booking is confirmed. The client has been notified and payment has been secured.',
      },
      completed: {
        title: 'Completed Booking',
        description: 'This booking has been marked complete. Don\'t forget to leave a review for the client!',
      },
      cancelled: {
        title: 'Cancelled Booking',
        description: 'This booking was cancelled. Check the cancellation reason for details.',
      },
    },
    depositPayment: {
      title: 'Deposit Payment',
      description: 'A percentage of the total is collected upfront to secure the booking. The remaining balance is charged after the event.',
    },
    instantBook: {
      title: 'Instant Book',
      description: 'When enabled, clients can book available dates instantly without waiting for approval. Great for maximizing bookings.',
    },
    cancellationPolicy: {
      title: 'Cancellation Policy',
      description: 'Your cancellation terms. Choose between flexible, moderate, or strict policies. This affects refund amounts for cancelled bookings.',
    },
  },

  // ==========================================
  // JOBS
  // ==========================================
  jobs: {
    createJob: {
      title: 'Post a Job',
      description: 'Create a job listing to find talent for your event. Add roles, requirements, and budget to attract the right professionals.',
    },
    roles: {
      title: 'Job Roles',
      description: 'Add multiple roles to a single job. Each role can have different requirements, pay rates, and number of positions.',
    },
    applications: {
      title: 'Applications',
      description: 'Review applications from interested professionals. View their profiles, portfolios, and send messages to discuss details.',
    },
    budget: {
      title: 'Budget Range',
      description: 'Set a realistic budget range. Being transparent about pay helps attract qualified applicants and speeds up hiring.',
    },
  },

  // ==========================================
  // DISCOVERY
  // ==========================================
  discovery: {
    search: {
      title: 'Search & Filters',
      description: 'Find the perfect professional for your event. Filter by category, location, price range, and availability.',
    },
    favorites: {
      title: 'Favorites',
      description: 'Save profiles to your favorites for easy access later. Great for comparing options before booking.',
    },
    mapView: {
      title: 'Map View',
      description: 'See professionals and venues on a map. Perfect for finding talent near your event location.',
    },
    categories: {
      title: 'Categories',
      description: 'Browse by category to find DJs, photographers, venues, caterers, and more. Each category shows specialized professionals.',
    },
  },

  // ==========================================
  // MESSAGES
  // ==========================================
  messages: {
    conversations: {
      title: 'Conversations',
      description: 'All your messages in one place. Conversations are organized by booking or inquiry.',
    },
    attachments: {
      title: 'Attachments',
      description: 'Share files, contracts, and media directly in chat. Supported formats: images, PDFs, and documents.',
    },
    quickReplies: {
      title: 'Quick Replies',
      description: 'Save time with template responses for common questions. Create your own or use our suggestions.',
    },
  },

  // ==========================================
  // PAYMENTS & EARNINGS
  // ==========================================
  payments: {
    stripeConnect: {
      title: 'Stripe Connect',
      description: 'Connect your Stripe account to receive payments. Funds are transferred directly to your bank account after each booking.',
    },
    earnings: {
      title: 'Earnings Dashboard',
      description: 'Track your income, pending payments, and payout history. See breakdowns by month, booking type, and more.',
    },
    platformFee: {
      title: 'Platform Fee',
      description: 'TIES Together charges a small service fee on each transaction. This covers payment processing and platform maintenance.',
    },
    payoutSchedule: {
      title: 'Payout Schedule',
      description: 'Earnings are paid out automatically after bookings complete. Standard payouts arrive in 2-3 business days.',
    },
  },

  // ==========================================
  // SETTINGS
  // ==========================================
  settings: {
    notifications: {
      title: 'Notification Preferences',
      description: 'Choose how and when you want to be notified. Customize email, push, and SMS notifications separately.',
    },
    calendarSync: {
      title: 'Calendar Sync',
      description: 'Connect Google Calendar to automatically sync your bookings. Avoid double-bookings by keeping calendars in sync.',
    },
    autoAccept: {
      title: 'Auto-Accept Bookings',
      description: 'Automatically confirm booking requests for available dates. Only applies when instant booking is enabled.',
    },
    twoFactor: {
      title: 'Two-Factor Authentication',
      description: 'Add an extra layer of security to your account. Requires a code from your phone when logging in.',
    },
    dataExport: {
      title: 'Export Your Data',
      description: 'Download all your data including bookings, messages, and profile information. Available in JSON or CSV format.',
    },
  },

  // ==========================================
  // ONBOARDING
  // ==========================================
  onboarding: {
    userType: {
      title: 'Choose Your Role',
      description: 'Select what best describes you. This helps us customize your experience and show relevant features.',
    },
    location: {
      title: 'Your Location',
      description: 'Enter your city to appear in local search results. Clients often search for professionals near their event location.',
    },
    specialties: {
      title: 'Your Specialties',
      description: 'Select the services you offer. You can add more later from your profile settings.',
    },
  },
}

/**
 * Get help content by path
 * @param {string} path - Dot notation path like "profile.headline"
 * @returns {object|null} Help content object or null if not found
 */
export function getHelpContent(path) {
  const parts = path.split('.')
  let current = helpContent

  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part]
    } else {
      return null
    }
  }

  return current
}

/**
 * Feature hotspot content for new feature discovery
 */
export const featureHotspots = {
  portfolio: {
    id: 'feature_portfolio',
    title: 'Showcase Your Work',
    description: 'Add photos, videos, and audio samples to your portfolio. Profiles with portfolios get 3x more booking requests!',
  },
  packages: {
    id: 'feature_packages',
    title: 'Create Service Packages',
    description: 'Offer fixed-price packages for your popular services. Makes it easy for clients to book and pay.',
  },
  instantBook: {
    id: 'feature_instant_book',
    title: 'Enable Instant Booking',
    description: 'Let clients book available dates instantly. Professionals with instant booking enabled get 40% more bookings.',
  },
  stripeConnect: {
    id: 'feature_stripe',
    title: 'Get Paid Faster',
    description: 'Connect Stripe to receive payments directly to your bank. Secure, fast, and automatic.',
  },
  calendarSync: {
    id: 'feature_calendar_sync',
    title: 'Sync Your Calendar',
    description: 'Connect Google Calendar to avoid double-bookings. Your availability updates automatically.',
  },
  badges: {
    id: 'feature_badges',
    title: 'Earn Trust Badges',
    description: 'Complete verifications to earn badges. Verified profiles appear higher in search results.',
  },
}

export default helpContent
