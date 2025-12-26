# TIES Together

A creative marketplace platform connecting freelancers, organisers, vendors, and venues for booking, collaboration, and project management.

## Live Platform

**Production:** https://ties-coral.vercel.app

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TypeScript, Vite 7 |
| Styling | TailwindCSS v4, Radix UI |
| Backend | Supabase (PostgreSQL, Auth, Storage, Edge Functions) |
| Payments | Stripe + Stripe Connect |
| Maps | Mapbox GL |

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment (copy and edit)
cp .env.example .env

# Start development server
npm run dev
```

Visit `http://localhost:5173`

## Environment Variables

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_MAPBOX_ACCESS_TOKEN=your-mapbox-token
VITE_STRIPE_PUBLISHABLE_KEY=your-stripe-key
VITE_STRIPE_CONNECT_CLIENT_ID=your-connect-id
```

## User Roles

- **Freelancer** - Photographers, DJs, musicians, designers
- **Organiser** - Event planners, project managers
- **Vendor** - Equipment, catering, mobile bar
- **Venue** - Space rental
- **Collective** - Group management

## Core Features

- Multi-role authentication (email + Google OAuth)
- Profile & portfolio management
- Discovery with map-based search
- Booking system with calendar management
- Job posting & applications
- TIES Studio project workspace
- Real-time messaging
- Stripe payments with escrow
- Review & rating system
- Subscription tiers (Free/Lite/Pro)

## Documentation

See `docs/DEPLOYMENT_ROADMAP.md` for the implementation roadmap.

## Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Preview build
npm run lint     # Run linter
```

## License

MIT

---

Built for the creative community
